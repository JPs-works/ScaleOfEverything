
import type { ThreeElements } from '@react-three/fiber';

export type Category = 'quantum' | 'molecular' | 'biological' | 'human' | 'planetary' | 'stellar' | 'galactic' | 'cosmic';

export interface ScaleItem {
  id: string;
  name: string;
  size: number; // in meters
  category: Category;
  description: string;
  color: string;
  speculative?: boolean;
  modelUrl?: string; // URL to .glb file
  textureUrl?: string; // Optional texture
}

export type Side = 'left' | 'right';

export interface ViewState {
  leftIndex: number;
  rightIndex: number;
  pinnedSide: Side | null;
  framedSide: Side;
}

// Fix for 'Property does not exist on type JSX.IntrinsicElements' by augmenting global namespaces.
// We extend both the global JSX namespace and the React.JSX namespace to ensure compatibility 
// with various TypeScript configurations and React versions (especially React 18+).
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {
      // Manually adding capsuleGeometry as it is sometimes missing from standard ThreeElements
      capsuleGeometry: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {
        capsuleGeometry: any;
      }
    }
  }
}
