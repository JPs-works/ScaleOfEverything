import type { Illustration, IllustrationProps } from './types';

/** A soft disc used when an object has no illustration yet. Keeps the app whole during content work. */
export function makeFallback(id: string, color: string, aspect = 1): Illustration {
  const View = ({ uid }: IllustrationProps) => (
    <svg viewBox={`0 0 ${100 * aspect} 100`} width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-g`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="45%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <ellipse cx={50 * aspect} cy={50} rx={50 * aspect} ry={50} fill={color} />
      <ellipse cx={50 * aspect} cy={50} rx={50 * aspect} ry={50} fill={`url(#${uid}-g)`} />
    </svg>
  );
  return { id, aspect, View };
}
