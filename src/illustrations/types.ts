import type { ComponentType } from 'react';

export interface IllustrationProps {
  /** Unique prefix for any SVG ids (gradients, clip paths) so repeated instances never collide. */
  uid: string;
  /** Rendered size in CSS px (width, height) — use to simplify detail when tiny. */
  px: number;
}

export interface Illustration {
  id: string;
  /** width / height of the artwork's bounding box. */
  aspect: number;
  View: ComponentType<IllustrationProps>;
}
