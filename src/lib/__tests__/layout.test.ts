import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, cameraAt, keyframe, project, tForLogSize, logSizeForT, DEFAULT_FRAME } from '../layout';
import type { ScaleItem } from '../../types';

const mk = (id: string, size: number, sizeLabel: ScaleItem['sizeLabel'] = 'Diameter'): ScaleItem =>
  ({ id, name: id, size, sizeLabel, kind: 'object', color: '#fff', description: '', facts: [], source: '' });

const items = [mk('a', 1, 'Height'), mk('b', 10), mk('c', 1e6), mk('d', 1e30)];
const world = buildWorld(items, (id) => (id === 'a' ? 0.5 : 1));

test('world is ordered left to right with gaps', () => {
  for (let i = 1; i < world.length; i++) {
    const prev = world[i - 1], cur = world[i];
    assert.ok(cur.x - cur.w / 2 > prev.x + prev.w / 2, 'objects do not overlap');
  }
});

test('integer t frames the object inside the frame fraction', () => {
  const vw = 1440, vh = 900;
  world.forEach((p, i) => {
    const cam = cameraAt(world, i, vw, vh);
    const r = project(p, cam, vw, vh);
    assert.ok(Math.abs(r.cx - vw / 2) < 1e-6, 'centred horizontally');
    assert.ok(r.width <= DEFAULT_FRAME.w * vw + 1e-6 && r.height <= DEFAULT_FRAME.h * vh + 1e-6, 'fits the frame');
    assert.ok(Math.abs(r.width - DEFAULT_FRAME.w * vw) < 1e-6 || Math.abs(r.height - DEFAULT_FRAME.h * vh) < 1e-6, 'fills one axis');
  });
});

test('camera interpolation is monotonic in scale and position', () => {
  const vw = 1200, vh = 800;
  let last = cameraAt(world, 0, vw, vh);
  for (let t = 0.05; t <= 3; t += 0.05) {
    const cam = cameraAt(world, t, vw, vh);
    assert.ok(cam.mpp >= last.mpp, 'scale never shrinks moving up the ladder');
    assert.ok(cam.cx >= last.cx - 1e-9, 'camera never moves backwards');
    last = cam;
  }
  assert.deepEqual(cameraAt(world, 2, vw, vh), keyframe(world[2], vw, vh));
});

test('log-size ↔ t mapping round-trips through objects', () => {
  for (let i = 0; i < world.length; i++) assert.ok(Math.abs(tForLogSize(world, Math.log10(world[i].item.size)) - i) < 1e-9);
  for (const t of [0.3, 1.5, 2.9]) assert.ok(Math.abs(tForLogSize(world, logSizeForT(world, t)) - t) < 1e-9);
  assert.equal(tForLogSize(world, -99), 0);
  assert.equal(tForLogSize(world, 99), world.length - 1);
});

test('huge span keeps precision near the small end', () => {
  const cam = cameraAt(world, 0, 1000, 1000);
  const r = project(world[0], cam, 1000, 1000);
  assert.ok(Math.abs(r.cx - 500) < 1e-6);
  const far = project(world[3], cam, 1000, 1000);
  assert.ok(far.left > 1e6, 'the giant is far off to the right, not NaN');
});
