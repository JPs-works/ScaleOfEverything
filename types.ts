export type Category = 'quantum' | 'molecular' | 'biological' | 'human' | 'planetary' | 'stellar' | 'galactic' | 'cosmic';

/** Which physical dimension `ScaleItem.size` measures. */
export type Dimension = 'diameter' | 'height' | 'length' | 'width';

/**
 * A processed asset under public/assets3d/ (path relative to that folder).
 * - glb: centred model whose `dimension` extent is exactly 1 unit
 * - texture: equirectangular map wrapped on a unit-diameter sphere
 * If it fails to load, the item's procedural visual is shown instead.
 */
export type Asset = { kind: 'glb'; path: string } | { kind: 'texture'; path: string };

export interface ScaleItem {
  id: string;
  name: string;
  /** In metres, along `dimension`. */
  size: number;
  dimension: Dimension;
  category: Category;
  description: string;
  color: string;
  /** Qualifier shown next to the category, e.g. an estimate or an illustrative placeholder size. */
  badge?: 'theoretical' | 'illustrative' | 'estimate';
  asset?: Asset;
}

export type Side = 'left' | 'right';

/** How the two panels are scaled: share the left item's or right item's framing, or fit each separately. */
export type ScaleMode = 'left' | 'right' | 'each';
