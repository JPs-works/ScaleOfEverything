/**
 * Reproducible asset pipeline for Scale of Everything.
 *
 *   npx tsx scripts/process-assets.ts --src <download-dir> [--inspect] [--only id,id]
 *
 * <download-dir> holds one sub-folder per item id with the raw files listed in
 * SOURCES below (each entry records where it was downloaded from). Raw files
 * are treated as untrusted data: they are only parsed by gltf-transform/sharp,
 * never executed.
 *
 * Output (all new, nothing pre-existing is touched):
 *   public/assets3d/models/<id>.glb     centred, scaled so the dimension that
 *                                       `ScaleItem.size` measures is 1 unit,
 *                                       simplified, WebP textures <= 2K,
 *                                       meshopt-compressed
 *   public/assets3d/textures/<id>.webp  equirectangular maps <= 2K
 *   public/assets3d/credits.json        title/author/source/licence per asset
 *
 * Budgets: <= 1.5 MB per file, <= 25 MB total (the script fails otherwise).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO, Document, getBounds, Node } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, meshopt, inspect } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
// sharp ships with the root install (Next.js dependency); see report for
// adding it as an explicit devDependency.
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'assets3d');
const MAX_FILE = 1.5 * 1024 * 1024;
const MAX_TOTAL = 25 * 1024 * 1024;

/**
 * Which model extent `size` measures. 'envelope' = twice the 10th-percentile
 * vertex distance from the centre: the inner body of a spiky object (a virus
 * envelope without its spikes).
 */
type Axis = 'x' | 'y' | 'z' | 'max' | 'envelope';

interface Credit {
  item: string;
  title: string;
  author: string;
  source: string;
  licence: string;
  licenceUrl?: string;
  notes?: string;
}

interface GlbSource extends Credit {
  kind: 'glb';
  file: string;
  /** Model axis that `size` measures (after `rotate`). */
  axis: Axis;
  /** Euler rotation in degrees applied before measuring. */
  rotate?: [number, number, number];
  /** Fraction of triangles to keep (meshopt simplify). */
  simplify?: number;
  /** Max simplification error as a fraction of mesh radius (default 0.002). */
  simplifyError?: number;
  textureSize?: number;
  /**
   * For unindexed "triangle soup" exports: drop per-face normals and snap
   * vertex colours to this many levels per channel so vertices can be welded
   * (and therefore simplified); the app rebuilds smooth normals at load time.
   */
  soupColourLevels?: number;
  /** Keep only this animation clip (the app plays the first clip). */
  keepAnimation?: string;
  /** Blend vertex colours towards this colour (0–1), to soften garish data colouring. */
  softenColours?: { towards: string; amount: number };
  /** Recolour by distance from the centre (inner → outer), keeping `keep` of the original colour. */
  radialColours?: { inner: string; outer: string; keep: number };
}

interface TextureSource extends Credit {
  kind: 'texture' | 'mollweide';
  file: string;
  width: number;
}

type Source = GlbSource | TextureSource;

const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';
const CC_BY_3 = 'https://creativecommons.org/licenses/by/3.0/';
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';

export const SOURCES: Source[] = [
  // ---- Textured spheres ----
  {
    item: 'earth', kind: 'texture', width: 2048,
    file: 'earth/world.topo.bathy.200412.3x5400x2700.jpg',
    title: 'Blue Marble Next Generation, Topography and Bathymetry (Dec 2004)',
    author: 'NASA Earth Observatory (Reto Stöckli)',
    source: 'https://visibleearth.nasa.gov/images/73909',
    licence: 'Public domain (NASA)',
  },
  {
    item: 'moon', kind: 'texture', width: 2048,
    file: 'moon/lroc_color_poles_4k.tif',
    title: 'CGI Moon Kit – LROC colour map',
    author: "NASA's Scientific Visualization Studio / LRO LROC team (Ernie Wright)",
    source: 'https://svs.gsfc.nasa.gov/4720',
    licence: 'Public domain (NASA)',
  },
  {
    item: 'jupiter', kind: 'texture', width: 2048,
    file: 'jupiter/8k_jupiter.jpg',
    title: 'Jupiter texture map',
    author: 'Solar System Scope (INOVE)',
    source: 'https://www.solarsystemscope.com/textures/',
    licence: 'CC BY 4.0', licenceUrl: CC_BY_4,
  },
  {
    item: 'sun', kind: 'texture', width: 2048,
    file: 'sun/8k_sun.jpg',
    title: 'Sun texture map',
    author: 'Solar System Scope (INOVE)',
    source: 'https://www.solarsystemscope.com/textures/',
    licence: 'CC BY 4.0', licenceUrl: CC_BY_4,
  },
  {
    item: 'observable-universe', kind: 'mollweide', width: 2048,
    file: 'observable-universe/WMAP_2012_ilc_9yr_moll4096.png',
    title: 'WMAP 9-year Internal Linear Combination CMB map (reprojected to equirectangular)',
    author: 'NASA / WMAP Science Team',
    source: 'https://commons.wikimedia.org/wiki/File:WMAP_2012.png',
    licence: 'Public domain (NASA)',
  },
  // ---- Models ----
  {
    item: 'rhinovirus', kind: 'glb', axis: 'max', simplify: 0.5, radialColours: { inner: '#7F1D1D', outer: '#FECACA', keep: 0.15 },
    file: 'rhinovirus/nih3d_3DPX-021359_1ND2-surf-bychain-print_NIH3D.glb',
    title: 'The structure of Rhinovirus 16 (PDB 1ND2), surface coloured by chain',
    author: 'Thomas Schlederer / NIAID (NIH 3D)',
    source: 'https://3d.nih.gov/entries/3DPX-021359',
    licence: 'CC BY 4.0', licenceUrl: CC_BY_4,
    notes: 'Recoloured radially (EM-map style) instead of the original per-chain rainbow.',
  },
  {
    item: 'coronavirus', kind: 'glb', axis: 'envelope', simplify: 0.16, simplifyError: 0.02, soupColourLevels: 24,
    file: 'coronavirus/nih3d_3DPX-013323_sarscov2_thick-nih3d.glb',
    title: 'SARS-CoV-2 Virion',
    author: 'kbrowne / NIAID (RML EM Unit, RML Visual & Medical Arts, NIAID Biovisualization) via NIH 3D',
    source: 'https://3d.nih.gov/entries/3DPX-013323',
    licence: 'CC BY 4.0', licenceUrl: CC_BY_4,
    notes: 'Simplified to ~16% of the original triangles; scaled so the envelope (not the spike tips) is 100 nm.',
  },
  {
    item: 'grain-sand', kind: 'glb', axis: 'max', simplify: 0.5, textureSize: 1024,
    file: 'grain-sand/rock_07_1k.gltf',
    title: 'Rock 07 (photoscan, used as a magnified sand grain)',
    author: 'Jenelle van Heerden (Poly Haven)',
    source: 'https://polyhaven.com/a/rock_07',
    licence: 'CC0', licenceUrl: CC0,
    notes: 'Shape and surface detail from the scan; recoloured in the app as quartz.',
  },
  {
    item: 'ant', kind: 'glb', axis: 'x', rotate: [0, 90, 0],
    file: 'ant/pp_90PJjBye5ZC_Ant.glb',
    title: 'Ant',
    author: 'Poly by Google',
    source: 'https://poly.pizza/m/90PJjBye5ZC',
    licence: 'CC BY 3.0', licenceUrl: CC_BY_3,
    notes: 'Lightened in the app for contrast.',
  },
  {
    item: 'human', kind: 'glb', axis: 'y', keepAnimation: 'HumanArmature|Man_Idle',
    file: 'human/pp_HMnuH5geEG_Quaternius-Man.glb',
    title: 'Man (animated low-poly character)',
    author: 'Quaternius',
    source: 'https://poly.pizza/m/HMnuH5geEG',
    licence: 'CC0', licenceUrl: CC0,
    notes: 'Only the idle animation is kept.',
  },
  {
    item: 'blue-whale', kind: 'glb', axis: 'x', rotate: [0, 90, 0],
    file: 'blue-whale/pp_30S2g01Q8pn_Finback-whale.glb',
    title: 'Finback whale (stand-in for the closely related blue whale)',
    author: 'Poly by Google',
    source: 'https://poly.pizza/m/30S2g01Q8pn',
    licence: 'CC BY 3.0', licenceUrl: CC_BY_3,
  },
  {
    item: 'eiffel-tower', kind: 'glb', axis: 'y', simplify: 0.35,
    file: 'eiffel-tower/pp_aIpJchqtRTg_SM-Eiffel-Tower.glb',
    title: 'SM – Eiffel Tower',
    author: 'Scott Marshall',
    source: 'https://poly.pizza/m/aIpJchqtRTg',
    licence: 'CC BY 3.0', licenceUrl: CC_BY_3,
  },
];

// ---------------------------------------------------------------------------

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function countTriangles(doc: Document): number {
  let n = 0;
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute('POSITION');
      if (prim.getMode() === 4) n += (idx ? idx.getCount() : pos?.getCount() ?? 0) / 3;
    }
  }
  return Math.round(n);
}

/** Wrap every scene root in one node that centres and unit-scales the model. */
function normalise(doc: Document, src: GlbSource) {
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
  const wrapper = doc.createNode(`${src.item}-normalised`);
  const rotator = doc.createNode(`${src.item}-oriented`);
  if (src.rotate) {
    const [rx, ry, rz] = src.rotate.map((d) => (d * Math.PI) / 180);
    rotator.setRotation(eulerToQuat(rx, ry, rz));
  }
  for (const child of scene.listChildren()) {
    scene.removeChild(child);
    rotator.addChild(child);
  }
  wrapper.addChild(rotator);
  scene.addChild(wrapper);

  const { min, max } = getBounds(scene);
  const ext = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const c0 = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const measured =
    src.axis === 'max' ? Math.max(...ext) : src.axis === 'envelope' ? 2 * radialQuantile(doc, c0, 0.1) : ext[{ x: 0, y: 1, z: 2 }[src.axis]];
  const s = 1 / measured;
  const c = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  wrapper.setScale([s, s, s]);
  wrapper.setTranslation([-c[0] * s, -c[1] * s, -c[2] * s]);
  return { ext: ext.map((e) => +(e * s).toFixed(3)), raw: ext.map((e) => +e.toFixed(3)) };
}

/** Quantile of vertex distances from `c` (mesh-local positions; the models measured this way have no node transforms). */
function radialQuantile(doc: Document, c: number[], q: number): number {
  const rs: number[] = [];
  const e: number[] = [];
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION')!;
      for (let i = 0; i < pos.getCount(); i++) {
        pos.getElement(i, e);
        rs.push(Math.hypot(e[0] - c[0], e[1] - c[1], e[2] - c[2]));
      }
    }
  }
  rs.sort((a, b) => a - b);
  return rs[Math.floor(rs.length * q)];
}

function eulerToQuat(x: number, y: number, z: number): [number, number, number, number] {
  // XYZ order
  const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
  return [
    s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3,
    c1 * c2 * s3 + s1 * s2 * c3,
    c1 * c2 * c3 - s1 * s2 * s3,
  ];
}

async function processGlb(io: NodeIO, srcDir: string, src: GlbSource, inspectOnly: boolean) {
  const doc = await io.read(path.join(srcDir, src.file));
  const before = countTriangles(doc);
  if (inspectOnly) {
    const { min, max } = getBounds(doc.getRoot().listScenes()[0]);
    const rep = inspect(doc);
    console.log(src.item, {
      tris: before,
      bbox: [min, max],
      skins: doc.getRoot().listSkins().length,
      anims: doc.getRoot().listAnimations().length,
      textures: rep.textures.properties.map((t) => `${t.name} ${t.resolution} ${t.mimeType}`),
      materials: doc.getRoot().listMaterials().length,
      vertexColors: doc.getRoot().listMeshes().some((m) => m.listPrimitives().some((p) => !!p.getAttribute('COLOR_0'))),
    });
    return 0;
  }
  if (src.soupColourLevels) {
    const L = src.soupColourLevels - 1;
    for (const mesh of doc.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        prim.getAttribute('NORMAL')?.dispose();
        const col = prim.getAttribute('COLOR_0');
        if (col) {
          const arr = col.getArray()!;
          for (let i = 0; i < arr.length; i++) arr[i] = Math.round(arr[i] * L) / L;
        }
      }
    }
  }
  if (src.keepAnimation) {
    for (const anim of doc.getRoot().listAnimations()) if (anim.getName() !== src.keepAnimation) anim.dispose();
  }
  if (src.softenColours) {
    const hex = src.softenColours.towards.replace('#', '');
    // glTF vertex colours are linear; convert the sRGB target.
    const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const t = [0, 2, 4].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
    const k = src.softenColours.amount;
    for (const mesh of doc.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const col = prim.getAttribute('COLOR_0');
        if (!col) continue; // getElement/setElement handle normalised integer storage
        const el: number[] = [];
        for (let i = 0; i < col.getCount(); i++) {
          col.getElement(i, el);
          for (let c = 0; c < 3; c++) el[c] = el[c] * (1 - k) + t[c] * k;
          col.setElement(i, el);
        }
      }
    }
  }
  if (src.radialColours) {
    const { min, max } = getBounds(doc.getRoot().listScenes()[0]);
    const c = [0, 1, 2].map((i) => (min[i] + max[i]) / 2);
    const lin = (h: string) => [0, 2, 4].map((i) => {
      const v = parseInt(h.replace('#', '').slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    const a = lin(src.radialColours.inner), b = lin(src.radialColours.outer), keep = src.radialColours.keep;
    const rIn = radialQuantile(doc, c, 0.02), rOut = radialQuantile(doc, c, 0.995);
    for (const mesh of doc.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const pos = prim.getAttribute('POSITION')!, col = prim.getAttribute('COLOR_0');
        if (!col) continue;
        const p: number[] = [], e: number[] = [];
        for (let i = 0; i < col.getCount(); i++) {
          pos.getElement(i, p);
          col.getElement(i, e);
          const t = Math.min(1, Math.max(0, (Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]) - rIn) / (rOut - rIn))) ** 1.4;
          for (let k = 0; k < 3; k++) e[k] = e[k] * keep + (a[k] + (b[k] - a[k]) * t) * (1 - keep);
          col.setElement(i, e);
        }
      }
    }
  }
  await doc.transform(dedup(), prune(), weld());
  console.log(`  welded: ${doc.getRoot().listMeshes().map((m) => m.listPrimitives().map((p) => p.getAttribute('POSITION')!.getCount()).join('+')).join(', ')} vertices`);
  if (src.simplify && src.simplify < 1) {
    await MeshoptSimplifier.ready;
    await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: src.simplify, error: src.simplifyError ?? 0.002 }), prune());
    }
  if (doc.getRoot().listTextures().length) {
    const size = src.textureSize ?? 2048;
    await doc.transform(
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [size, size], quality: 82 }),
    );
  }
  const dims = normalise(doc, src);
  await MeshoptEncoder.ready;
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const outFile = path.join(OUT, 'models', `${src.item}.glb`);
  await io.write(outFile, doc);
  const bytes = fs.statSync(outFile).size;
  if (bytes > MAX_FILE) fs.renameSync(outFile, outFile + '.too-big');
  console.log(`${src.item}.glb  tris ${before} -> ${countTriangles(doc)}  unit extents ${dims.ext.join(' x ')}  ${(bytes / 1024).toFixed(0)} KB`);
  return bytes;
}

/** Inverse Mollweide: reproject a full-sky map into a 2:1 equirectangular texture. */
async function mollweideToEquirect(file: string, width: number, outFile: string) {
  const img = sharp(file).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  // Find the ellipse's bounds: non-white, non-transparent pixels.
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      const a = data[i + 3];
      const white = data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245;
      if (a > 10 && !white) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
  const OW = width, OH = width / 2;
  const out = Buffer.alloc(OW * OH * 3);
  for (let j = 0; j < OH; j++) {
    const lat = Math.PI / 2 - ((j + 0.5) / OH) * Math.PI;
    // Solve 2θ + sin 2θ = π sin φ (Newton)
    let t = lat;
    for (let k = 0; k < 12; k++) {
      const f = 2 * t + Math.sin(2 * t) - Math.PI * Math.sin(lat);
      const d = 2 + 2 * Math.cos(2 * t);
      if (Math.abs(d) < 1e-9) break;
      t -= f / d;
    }
    for (let i = 0; i < OW; i++) {
      const lon = ((i + 0.5) / OW) * 2 * Math.PI - Math.PI;
      const mx = (lon / Math.PI) * Math.cos(t); // -1..1
      const my = Math.sin(t); // -1..1
      let sx = Math.round(cx + mx * rx * 0.995);
      let sy = Math.round(cy - my * ry * 0.995);
      sx = Math.min(W - 1, Math.max(0, sx));
      sy = Math.min(H - 1, Math.max(0, sy));
      const si = (sy * W + sx) * C, oi = (j * OW + i) * 3;
      out[oi] = data[si]; out[oi + 1] = data[si + 1]; out[oi + 2] = data[si + 2];
    }
  }
  await sharp(out, { raw: { width: OW, height: OH, channels: 3 } }).webp({ quality: 82 }).toFile(outFile);
  console.log(`  mollweide bounds x ${x0}-${x1} y ${y0}-${y1}`);
}

async function processTexture(srcDir: string, src: TextureSource) {
  const outFile = path.join(OUT, 'textures', `${src.item}.webp`);
  const input = path.join(srcDir, src.file);
  if (src.kind === 'mollweide') {
    await mollweideToEquirect(input, src.width, outFile);
  } else {
    await sharp(input).resize(src.width, src.width / 2, { fit: 'fill' }).removeAlpha().webp({ quality: 82 }).toFile(outFile);
  }
  const bytes = fs.statSync(outFile).size;
  console.log(`${src.item}.webp  ${(bytes / 1024).toFixed(0)} KB`);
  return bytes;
}

async function main() {
  const srcDir = arg('src');
  if (!srcDir) throw new Error('Usage: tsx scripts/process-assets.ts --src <download-dir> [--inspect] [--only a,b]');
  const inspectOnly = process.argv.includes('--inspect');
  const only = arg('only')?.split(',');
  fs.mkdirSync(path.join(OUT, 'models'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'textures'), { recursive: true });

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
  });

  for (const src of SOURCES) {
    if (only && !only.includes(src.item)) continue;
    const bytes = src.kind === 'glb'
      ? await processGlb(io, srcDir, src, inspectOnly)
      : inspectOnly ? 0 : await processTexture(srcDir, src);
    if (bytes > MAX_FILE) throw new Error(`${src.item}: ${(bytes / 1048576).toFixed(2)} MB exceeds 1.5 MB budget`);
  }
  if (inspectOnly) return;

  // Credits for every source (even when run with --only, so the file stays complete).
  const credits = SOURCES.map((s) => ({
    item: s.item,
    file: s.kind === 'glb' ? `models/${s.item}.glb` : `textures/${s.item}.webp`,
    title: s.title,
    author: s.author,
    source: s.source,
    licence: s.licence,
    ...(s.licenceUrl ? { licenceUrl: s.licenceUrl } : {}),
    ...(s.notes ? { notes: s.notes } : {}),
  }));
  fs.writeFileSync(path.join(OUT, 'credits.json'), JSON.stringify(credits, null, 2) + '\n');

  let total = 0;
  for (const dir of ['models', 'textures']) {
    for (const f of fs.readdirSync(path.join(OUT, dir))) total += fs.statSync(path.join(OUT, dir, f)).size;
  }
  console.log(`total ${(total / 1048576).toFixed(2)} MB`);
  if (total > MAX_TOTAL) throw new Error('assets exceed 25 MB budget');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
