import type { Asset } from '../types';

/**
 * Resolve a path under public/assets3d/ against Vite's base URL, so assets
 * work both at / (dev) and under /apps/scale-of-everything/ (embedded build).
 * Hard-coded absolute paths were the cause of the blank-screen bug.
 */
export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}assets3d/${path}`;

export const assetHref = (asset: Asset): string => assetUrl(asset.path);
