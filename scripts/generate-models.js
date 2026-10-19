import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Document, NodeIO } from '@gltf-transform/core';
import { dedup, flatten } from '@gltf-transform/functions';
import { SCALE_ITEMS } from '../constants.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create models directory if it doesn't exist
const modelsDir = path.join(__dirname, '..', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Helper to convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ] : [1, 1, 1];
}

// Create geometry based on category
function createGeometryForItem(doc, item) {
  const { category, color } = item;
  const rgb = hexToRgb(color);
  
  // Create material
  const material = doc.createMaterial(item.id + '-material')
    .setBaseColorFactor(rgb)
    .setMetallicFactor(0.0)
    .setRoughnessFactor(0.5);

  let positions = [];
  let indices = [];
  let normals = [];
  let colors = [];

  switch (category) {
    case 'quantum':
    case 'molecular':
      // Sphere for quantum/molecular items
      createSphere(positions, indices, normals, 32, 32);
      material.setEmissiveFactor(rgb).setEmissiveStrength(2.0);
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
      material.setEmissiveFactor(rgb).setEmissiveStrength(1.0);
      break;

    case 'galactic':
    case 'cosmic':
      // Particle system representation - use a simple sphere for now
      // (full particle systems are better handled procedurally)
      createSphere(positions, indices, normals, 32, 32);
      material.setEmissiveFactor(rgb).setEmissiveStrength(0.5);
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

// Create sphere geometry
function createSphere(positions, indices, normals, segments, rings) {
  positions.length = 0;
  indices.length = 0;
  normals.length = 0;

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

// Create capsule geometry (cylinder with rounded ends)
function createCapsule(positions, indices, normals, radius, height, segments, rings) {
  positions.length = 0;
  indices.length = 0;
  normals.length = 0;

  const halfHeight = height / 2;
  let indexOffset = 0;

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

