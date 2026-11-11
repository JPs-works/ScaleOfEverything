import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { fileURLToPath } from 'url';
import { Document, NodeIO, Texture } from '@gltf-transform/core';
import { dedup, flatten } from '@gltf-transform/functions';
import { SCALE_ITEMS } from '../constants.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create models directory if it doesn't exist
const modelsDir = path.join(__dirname, '..', 'public', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

import type { ScaleItem } from '../types';

// Helper to convert hex color to RGBA (glTF expects 4 components)
function hexToRgba(hex: string, alpha: number = 1.0): [number, number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    alpha,
  ] : [1, 1, 1, alpha];
}

// Create geometry based on category
function createGeometryForItem(doc: Document, item: ScaleItem) {
  const { category, color, id } = item;
  const rgba = hexToRgba(color);
  
  // Special handling for Earth
  if (id === 'earth') {
    return createEarthGeometry(doc, item);
  }
  
  // Create material
  const material = doc.createMaterial(item.id + '-material')
    .setBaseColorFactor(rgba)
    .setMetallicFactor(0.0)
    .setRoughnessFactor(0.5);

  let positions: number[] = [];
  let indices: number[] = [];
  let normals: number[] = [];

  switch (category) {
    case 'quantum':
    case 'molecular':
      // Sphere for quantum/molecular items
      createSphere(positions, indices, normals, 32, 32);
      material.setEmissiveFactor(rgba);
      break;

    case 'biological':
    case 'human':
      // Capsule shape (cylinder with rounded ends)
      createCapsule(positions, indices, normals, 0.7, 1.0, 16, 8);
      break;

    case 'planetary':
      // Sphere with higher detail
      createSphere(positions, indices, normals, 64, 64);
      material.setRoughnessFactor(0.8);
      break;

    case 'stellar':
      // Sphere with glow effect (we'll use a simple sphere, glow handled in shader)
      createSphere(positions, indices, normals, 64, 64);
      material.setEmissiveFactor(rgba);
      break;

    case 'galactic':
    case 'cosmic':
      // Particle system representation - use a simple sphere for now
      // (full particle systems are better handled procedurally)
      createSphere(positions, indices, normals, 32, 32);
      material.setEmissiveFactor(rgba);
      break;

    default:
      createSphere(positions, indices, normals, 32, 32);
  }

  // Create buffer with positions
  const positionArray = new Float32Array(positions);
  const positionBuffer = doc.createBuffer();
  const positionAccessor = doc.createAccessor()
    .setBuffer(positionBuffer)
    .setType('VEC3')
    .setArray(positionArray);

  // Create buffer with normals
  const normalArray = new Float32Array(normals);
  const normalAccessor = doc.createAccessor()
    .setBuffer(positionBuffer)
    .setType('VEC3')
    .setArray(normalArray);

  // Create buffer with indices
  const indexArray = new Uint16Array(indices);
  const indexAccessor = doc.createAccessor()
    .setBuffer(positionBuffer)
    .setType('SCALAR')
    .setArray(indexArray);

  // Create primitive
  const primitive = doc.createPrimitive()
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('NORMAL', normalAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);

  // Create mesh
  const mesh = doc.createMesh(item.id + '-mesh')
    .addPrimitive(primitive);

  return mesh;
}

// Special function to create Earth geometry with texture
function createEarthGeometry(doc: Document, item: ScaleItem) {
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  
  // Create high-detail sphere with UV coordinates
  createSphere(positions, indices, normals, 128, 64, uvs);
  
  // Create Earth texture
  const textureData = createEarthTexture();
  const texture = doc.createTexture('earth-texture')
    .setImage(Buffer.from(textureData))
    .setMimeType('image/png');
  
  // Create material with texture
  const material = doc.createMaterial('earth-material')
    .setBaseColorTexture(texture)
    .setBaseColorFactor([1, 1, 1, 1])
    .setMetallicFactor(0.0)
    .setRoughnessFactor(0.9); // Earth has a relatively rough surface
  
  // Create buffers
  const positionArray = new Float32Array(positions);
  const positionBuffer = doc.createBuffer();
  const positionAccessor = doc.createAccessor()
    .setBuffer(positionBuffer)
    .setType('VEC3')
    .setArray(positionArray);
  
  const normalArray = new Float32Array(normals);
  const normalAccessor = doc.createAccessor()
    .setBuffer(positionBuffer)
    .setType('VEC3')
    .setArray(normalArray);
  
  const uvArray = new Float32Array(uvs);
  const uvAccessor = doc.createAccessor()
    .setBuffer(positionBuffer)
    .setType('VEC2')
    .setArray(uvArray);
  
  const indexArray = new Uint16Array(indices);
  const indexAccessor = doc.createAccessor()
    .setBuffer(positionBuffer)
    .setType('SCALAR')
    .setArray(indexArray);
  
  // Create primitive with texture coordinates
  const primitive = doc.createPrimitive()
    .setAttribute('POSITION', positionAccessor)
    .setAttribute('NORMAL', normalAccessor)
    .setAttribute('TEXCOORD_0', uvAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);
  
  // Create mesh
  const mesh = doc.createMesh('earth-mesh')
    .addPrimitive(primitive);
  
  return mesh;
}

// Create sphere geometry with optional UV coordinates
function createSphere(positions: number[], indices: number[], normals: number[], segments: number, rings: number, uvs?: number[]) {
  positions.length = 0;
  indices.length = 0;
  normals.length = 0;
  if (uvs) uvs.length = 0;

  const radius = 1.0;
  
  // Generate vertices
  for (let ring = 0; ring <= rings; ring++) {
    const theta = ring * Math.PI / rings;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let segment = 0; segment <= segments; segment++) {
      const phi = segment * 2 * Math.PI / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      
      positions.push(x * radius, y * radius, z * radius);
      normals.push(x, y, z);
      
      // Generate UV coordinates (spherical mapping)
      if (uvs) {
        const u = segment / segments;
        const v = ring / rings;
        uvs.push(u, v);
      }
    }
  }
  
  // Generate indices
  for (let ring = 0; ring < rings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = ring * (segments + 1) + segment;
      const b = a + segments + 1;
      
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }
}

// Simple PNG encoder (creates a minimal valid PNG from RGBA data)
function encodePNG(width: number, height: number, rgbaData: Uint8Array): Buffer {
  // PNG file signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Helper to create CRC32
  const crc32 = (data: Buffer): number => {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };
  
  // Helper to write 32-bit big-endian integer
  const writeUInt32BE = (value: number): Buffer => {
    const buf = Buffer.allocUnsafe(4);
    buf.writeUInt32BE(value, 0);
    return buf;
  };
  
  const chunks: Buffer[] = [pngSignature];
  
  // IHDR chunk
  const ihdrData = Buffer.allocUnsafe(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = Buffer.concat([
    Buffer.from('IHDR'),
    ihdrData,
    writeUInt32BE(crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData])))
  ]);
  chunks.push(writeUInt32BE(ihdrData.length), ihdrChunk);
  
  // IDAT chunk - compress the image data using simple deflate
  // For simplicity, we'll use a basic approach: create uncompressed deflate blocks
  const scanlineLength = width * 4 + 1; // +1 for filter byte
  const imageData = Buffer.allocUnsafe(height * scanlineLength);
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * scanlineLength;
    imageData[rowStart] = 0; // No filter
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = rowStart + 1 + x * 4;
      imageData[dstIdx] = rgbaData[srcIdx];     // R
      imageData[dstIdx + 1] = rgbaData[srcIdx + 1]; // G
      imageData[dstIdx + 2] = rgbaData[srcIdx + 2]; // B
      imageData[dstIdx + 3] = rgbaData[srcIdx + 3]; // A
    }
  }
  
  // Simple zlib compression using Node's zlib
  const compressed = zlib.deflateSync(imageData);
  
  const idatChunk = Buffer.concat([
    Buffer.from('IDAT'),
    compressed,
    writeUInt32BE(crc32(Buffer.concat([Buffer.from('IDAT'), compressed])))
  ]);
  chunks.push(writeUInt32BE(compressed.length), idatChunk);
  
  // IEND chunk
  const iendChunk = Buffer.concat([
    Buffer.from('IEND'),
    writeUInt32BE(crc32(Buffer.from('IEND')))
  ]);
  chunks.push(writeUInt32BE(0), iendChunk);
  
  return Buffer.concat(chunks);
}

// Create a simple Earth-like texture (procedural)
function createEarthTexture(): Buffer {
  const width = 512;
  const height = 256;
  const data = new Uint8Array(width * height * 4);
  
  // Simple procedural Earth texture
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const u = x / width;
      const v = y / height;
      
      // Convert UV to spherical coordinates
      const phi = u * 2 * Math.PI;
      const theta = v * Math.PI;
      
      // Simple continent/ocean pattern using noise-like functions
      const lat = Math.sin(theta);
      const lon = Math.cos(phi);
      
      // Create continent shapes using multiple sine waves
      const continent1 = Math.sin(phi * 3) * Math.cos(theta * 2);
      const continent2 = Math.sin(phi * 5 + 1) * Math.cos(theta * 3 + 0.5);
      const continent3 = Math.sin(phi * 7 + 2) * Math.cos(theta * 4 + 1);
      const continentPattern = (continent1 + continent2 * 0.5 + continent3 * 0.3) / 1.8;
      
      // Determine if this is land or ocean
      const isLand = continentPattern > 0.1;
      
      if (isLand) {
        // Land colors: green to brown based on latitude
        const greenness = Math.max(0, lat * 0.5 + 0.5);
        data[idx] = Math.floor(34 + greenness * 100);     // R: 34-134 (brown to green)
        data[idx + 1] = Math.floor(139 + greenness * 80); // G: 139-219 (brown to green)
        data[idx + 2] = Math.floor(34 + greenness * 60);  // B: 34-94 (brown to green)
        data[idx + 3] = 255; // Alpha
      } else {
        // Ocean colors: blue, darker at poles
        const oceanDepth = Math.abs(lat) * 0.3;
        data[idx] = Math.floor(0 + oceanDepth * 50);      // R: 0-15
        data[idx + 1] = Math.floor(100 + oceanDepth * 100); // G: 100-200
        data[idx + 2] = Math.floor(200 + oceanDepth * 55);  // B: 200-255
        data[idx + 3] = 255; // Alpha
      }
    }
  }
  
  // Encode as PNG
  return encodePNG(width, height, data);
}

// Create capsule geometry (cylinder with rounded ends)
function createCapsule(positions: number[], indices: number[], normals: number[], radius: number, height: number, segments: number, rings: number) {
  positions.length = 0;
  indices.length = 0;
  normals.length = 0;

  const halfHeight = height / 2;

  // Top hemisphere
  for (let ring = 0; ring <= rings / 2; ring++) {
    const theta = ring * Math.PI / (2 * rings);
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let segment = 0; segment <= segments; segment++) {
      const phi = segment * 2 * Math.PI / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      
      positions.push(x * radius, y * radius + halfHeight, z * radius);
      normals.push(x, y, z);
    }
  }
  
  // Cylinder middle
  for (let ring = 1; ring < rings / 2; ring++) {
    const y = halfHeight - (ring * height / rings);
    for (let segment = 0; segment <= segments; segment++) {
      const phi = segment * 2 * Math.PI / segments;
      const x = Math.cos(phi);
      const z = Math.sin(phi);
      
      positions.push(x * radius, y, z * radius);
      normals.push(x, 0, z);
    }
  }
  
  // Bottom hemisphere
  for (let ring = rings / 2; ring <= rings; ring++) {
    const theta = (ring - rings / 2) * Math.PI / (2 * rings) + Math.PI / 2;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let segment = 0; segment <= segments; segment++) {
      const phi = segment * 2 * Math.PI / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      
      positions.push(x * radius, y * radius - halfHeight, z * radius);
      normals.push(x, y, z);
    }
  }
  
  // Generate indices
  const totalRings = rings + 1;
  for (let ring = 0; ring < totalRings; ring++) {
    for (let segment = 0; segment < segments; segment++) {
      const a = ring * (segments + 1) + segment;
      const b = a + segments + 1;
      
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }
}

// Generate GLB for each item
async function generateModels() {
  const io = new NodeIO();
  
  for (const item of SCALE_ITEMS) {
    console.log(`Generating model for: ${item.name} (${item.id})`);
    
    const doc = new Document();
    const mesh = createGeometryForItem(doc, item);
    
    // Create node and add to scene
    const node = doc.createNode(item.id + '-node')
      .setMesh(mesh);
    
    const scene = doc.createScene(item.id + '-scene')
      .addChild(node);
    
    // Optimize
    await doc.transform(dedup(), flatten());
    
    // Write GLB file
    const outputPath = path.join(modelsDir, `${item.id}.glb`);
    await io.write(outputPath, doc);
    
    console.log(`  ✓ Created ${outputPath}`);
  }
  
  console.log(`\n✓ Generated ${SCALE_ITEMS.length} GLB files in ${modelsDir}`);
}

// Run the generator
generateModels().catch(console.error);

