// Core data types for the Scale of Everything.

/** Which dimension `size` measures. Drives how an object is framed and described. */
export type SizeLabel =
  | 'Diameter'
  | 'Height'
  | 'Length'
  | 'Width'
  | 'Wingspan'
  | 'Distance'
  | 'Depth'
  | 'Thickness';

/** What kind of thing an object is. Shown as a chip; independent of its size band. */
export type Kind =
  | 'particle'
  | 'atom'
  | 'molecule'
  | 'virus'
  | 'cell'
  | 'organism'
  | 'object'
  | 'structure'
  | 'landform'
  | 'world'
  | 'star'
  | 'nebula'
  | 'cluster'
  | 'galaxy'
  | 'cosmic'
  | 'distance';

export type Article = '' | 'a' | 'an' | 'the';

export interface ScaleItem {
  /** Stable kebab-case id. Also the illustration key and the URL token. */
  id: string;
  /** Display name, ≤ 28 characters. */
  name: string;
  /** Size in meters of the dimension named by `sizeLabel`. */
  size: number;
  sizeLabel: SizeLabel;
  kind: Kind;
  /** Dominant illustration color (hex). Used for rail ticks, chips and glows. */
  color: string;
  /** One plain sentence saying what it is. */
  description: string;
  /** Two short verified facts; the first is a size comparison. */
  facts: string[];
  /** Where the size value comes from. */
  source: string;
  /** Theoretical or upper-bound sizes. */
  speculative?: boolean;
  /** Why the stretch of ladder just below this object is empty, when nature offers nothing to fill it. */
  gapNote?: string;
  /** Grammar helpers for generated sentences. Defaults are derived in lib/text.ts. */
  article?: Article;
  /** Singular with article for prose, when the display name is not a noun phrase ("a DNA double helix"). */
  noun?: string;
  plural?: string;
}

/** An everyday object used by the analogy engine ("if a proton were a grain of sand…"). */
export interface FamiliarObject {
  id: string;
  /** Singular with article, e.g. "a grain of sand". */
  name: string;
  /** e.g. "grains of sand". */
  plural: string;
  size: number;
  sizeLabel: SizeLabel;
  source: string;
}

export type Mode = 'journey' | 'compare';
