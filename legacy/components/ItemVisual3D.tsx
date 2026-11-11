import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float, Stars, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ScaleItem } from '../types';

interface ItemVisual3DProps {
  item: ScaleItem;
  pixelScale: number; // meters per pixel
}

export const ItemVisual3D: React.FC<ItemVisual3DProps> = ({ item, pixelScale }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { viewport, size, camera } = useThree();
  const [hovered, setHover] = useState(false);

  // --- Calculate Scale ---
  // In App.tsx, we set 1 pixel = pixelScale meters.
  // We want to map this to 3D units. 
  // R3F Viewport height (in 3D units) corresponds to `size.height` (in pixels).
  const pixelsToWorld = viewport.height / size.height;
  
  // The size of the object in world units should be:
  // (item.size / pixelScale) * pixelsToWorld
  // Note: item.size is diameter. 
  // Standard mesh geometries (Sphere) take radius = 0.5 (diameter 1) or radius 1 (diameter 2).
  // We will assume base diameter = 2 (Radius 1).
  const targetDiameterWorld = (item.size / pixelScale) * pixelsToWorld;
  const targetRadius = targetDiameterWorld / 2; // Radius

  // Calculate safe scale based on camera distance
  // We need to ensure the camera is always outside the object
  const SAFE_MARGIN = 0.5; // Extra margin to prevent clipping
  
  // Smooth scaling using lerp in useFrame
  useFrame((state, delta) => {
    if (meshRef.current) {
        // Get current camera distance from origin
        const cameraDistance = camera.position.length();
        
        // Calculate maximum safe radius (camera distance - margin)
        // This ensures the camera stays outside the object
        const maxSafeRadius = Math.max(0.1, cameraDistance - SAFE_MARGIN);
        
        // If the object would be too large (camera would be inside), scale it down
        // Otherwise, use the target scale
        const finalScale = Math.min(targetRadius, maxSafeRadius);
        
        // Rotation
        meshRef.current.rotation.y += delta * 0.2;
        
        // Scale Lerp
        // Basic clamp to prevent NaN or Infinity issues
        if (isFinite(finalScale) && finalScale > 0) {
            meshRef.current.scale.lerp(new THREE.Vector3(finalScale, finalScale, finalScale), 0.1);
        }
    }
  });

  // --- Procedural Geometries ---

  const renderContent = () => {
      // 1. If Model exists (GLB)
      if (item.modelUrl) {
          const { scene } = useGLTF(item.modelUrl);
          return <primitive object={scene} />;
      }

      switch (item.category) {
          case 'quantum':
          case 'molecular':
              return (
                <group>
                  <Float speed={5} rotationIntensity={1} floatIntensity={0.2}>
                      <mesh>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshPhysicalMaterial 
                            color={item.color} 
                            emissive={item.color}
                            emissiveIntensity={2}
                            transparent 
                            opacity={0.8}
                            roughness={0.2}
                            metalness={0.8}
                        />
                      </mesh>
                      {/* Electron cloud / fuzzy bits */}
                      <Sparkles count={20} scale={3} size={4} speed={0.4} opacity={0.5} color={item.color} />
                  </Float>
                </group>
              );
          
          case 'biological':
          case 'human':
              // Simple capsule or blob shape
               return (
                  <mesh>
                    <capsuleGeometry args={[0.7, 1, 4, 16]} /> 
                    <meshStandardMaterial color={item.color} roughness={0.5} />
                  </mesh>
               );

          case 'planetary':
              return (
                <mesh>
                    <sphereGeometry args={[1, 64, 64]} />
                    <meshStandardMaterial color={item.color} roughness={0.8} metalness={0.1} />
                </mesh>
              );

          case 'stellar':
              return (
                <group>
                    <mesh>
                        <sphereGeometry args={[1, 64, 64]} />
                        <meshBasicMaterial color={item.color} />
                    </mesh>
                    {/* Glow Halo */}
                    <mesh scale={1.2}>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshBasicMaterial color={item.color} transparent opacity={0.2} side={THREE.BackSide} />
                    </mesh>
                     <pointLight color={item.color} intensity={2} distance={10} decay={2} />
                </group>
              );

          case 'galactic':
          case 'cosmic':
              // Particle System
              return (
                  <GalaxyParticles color={item.color} />
              );

          default:
              return <SphereGeometry color={item.color} type="standard" />;
      }
  };

  return (
    <group ref={meshRef}>
        {renderContent()}
    </group>
  );
};

// --- Helpers ---

const SphereGeometry = ({ color, type }: { color: string, type: 'basic' | 'standard' }) => (
    <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        {type === 'basic' ? <meshBasicMaterial color={color} /> : <meshStandardMaterial color={color} />}
    </mesh>
);

const GalaxyParticles = ({ color }: { color: string }) => {
    // Generate spiral points
    const points = useMemo(() => {
        const p = [];
        for(let i=0; i<2000; i++) {
            const angle = i * 0.1;
            const dist = i * 0.005; // spiral out
            const x = Math.cos(angle) * dist + (Math.random()-0.5)*0.5;
            const y = (Math.random()-0.5) * 0.2; // flat disk
            const z = Math.sin(angle) * dist + (Math.random()-0.5)*0.5;
            p.push(x, y, z);
        }
        return new Float32Array(p);
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color={color} transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}