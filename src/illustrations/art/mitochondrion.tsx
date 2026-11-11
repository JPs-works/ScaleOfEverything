import type { Illustration } from '../types';

// Mitochondrion — measured axis: length (horizontal). The bean-shaped organelle spans x = 0 (left cap)
// to x = 100 (right cap); its two lobes touch y = 0 and the flat underside rests on y = 46.
// Outer membrane in the object's salmon, a darker matrix inside, and finger-like cristae folding in
// from the top and bottom like a classic textbook cross-section.
// aspect = width / height of the bounding box: 100 / 46.
const BASE = '#FCA5A5';
const LIGHT = '#FEE2E2';
const MID = '#F87171';
const DARK = '#DC2626';
const DEEP = '#991B1B';

// Outer bean: two rounded lobes with a shallow dip between them along the top.
const OUTER =
  'M0 25 C0 10, 9 0, 24 0 C36 0, 42 8, 50 8 C58 8, 64 0, 76 0 C91 0, 100 10, 100 25 C100 38, 92 46, 78 46 L22 46 C8 46, 0 38, 0 25 Z';
// Inner membrane: the same bean scaled in around its centre (≈3.5 units of intermembrane space).
const INNER_XF = 'translate(50 23) scale(0.93 0.85) translate(-50 -23)';

export const art: Illustration = {
  id: 'mitochondrion',
  aspect: 100 / 46,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 46" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* outer membrane: lit from the upper-left, warmer along the bottom */}
        <linearGradient id={`${uid}-outer`} x1="0" x2="0.3" y1="0" y2="1">
          <stop offset="0%" stopColor={LIGHT} />
          <stop offset="40%" stopColor={BASE} />
          <stop offset="100%" stopColor={MID} />
        </linearGradient>
        {/* matrix: deep red, slightly lighter towards the upper-left */}
        <radialGradient id={`${uid}-matrix`} cx="35%" cy="30%" r="85%">
          <stop offset="0%" stopColor={DARK} />
          <stop offset="100%" stopColor={DEEP} />
        </radialGradient>
        {/* darker limb along the lower right */}
        <radialGradient id={`${uid}-limb`} cx="30%" cy="28%" r="95%">
          <stop offset="60%" stopColor={DEEP} stopOpacity="0" />
          <stop offset="100%" stopColor={DEEP} stopOpacity="0.45" />
        </radialGradient>
        {/* faint halo so the salmon reads against navy */}
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor={BASE} stopOpacity="0" />
          <stop offset="100%" stopColor={BASE} stopOpacity="0.25" />
        </radialGradient>
        <clipPath id={`${uid}-inner-clip`}>
          <path d={OUTER} transform={INNER_XF} />
        </clipPath>
        <clipPath id={`${uid}-outer-clip`}>
          <path d={OUTER} />
        </clipPath>
      </defs>

      {/* halo */}
      {px > 24 && <ellipse cx="50" cy="23" rx="54" ry="26" fill={`url(#${uid}-halo)`} />}

      {/* outer membrane */}
      <path d={OUTER} fill={`url(#${uid}-outer)`} />

      {/* matrix (inner membrane interior) */}
      <path d={OUTER} transform={INNER_XF} fill={`url(#${uid}-matrix)`} />

      {/* cristae: inner-membrane folds reaching in from the top and bottom, clipped to the matrix */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-inner-clip)`} fill="none" stroke={BASE} strokeWidth="3.6" strokeLinecap="round">
          {/* from the top */}
          <path d="M16 1 C14 10, 19 16, 16 27" />
          <path d="M38 4 C36 12, 41 18, 38 28" />
          <path d="M62 4 C60 12, 65 18, 62 28" />
          <path d="M84 1 C82 10, 87 16, 84 27" />
          {/* from the bottom */}
          <path d="M27 46 C25 36, 30 30, 27 18" />
          <path d="M50 46 C48 36, 53 30, 50 20" />
          <path d="M73 46 C71 36, 76 30, 73 18" />
          {px > 120 && (
            <g strokeWidth="2.6" opacity="0.9">
              <path d="M7 4 C6 10, 8 14, 7 20" />
              <path d="M93 44 C92 38, 94 34, 93 26" />
            </g>
          )}
        </g>
      )}

      {/* lighter ridge down each crista to give the folds some volume */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-inner-clip)`} fill="none" stroke={LIGHT} strokeWidth="1.1" strokeLinecap="round" opacity="0.6">
          <path d="M15.2 2 C13.4 10, 18.2 16, 15.2 26" />
          <path d="M37.2 5 C35.4 12, 40.2 18, 37.2 27" />
          <path d="M61.2 5 C59.4 12, 64.2 18, 61.2 27" />
          <path d="M83.2 2 C81.4 10, 86.2 16, 83.2 26" />
          <path d="M26.2 45 C24.4 36, 29.2 30, 26.2 19" />
          <path d="M49.2 45 C47.4 36, 52.2 30, 49.2 21" />
          <path d="M72.2 45 C70.4 36, 75.2 30, 72.2 19" />
        </g>
      )}

      {/* matrix granules and a few ribosomes */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-inner-clip)`} fill={LIGHT} opacity="0.5">
          <circle cx="21.5" cy="36" r="0.9" />
          <circle cx="32.5" cy="12" r="0.8" />
          <circle cx="44" cy="35" r="0.9" />
          <circle cx="56" cy="14" r="0.8" />
          <circle cx="68" cy="36" r="0.9" />
          <circle cx="79" cy="13" r="0.8" />
          <circle cx="10.5" cy="30" r="0.8" />
          <circle cx="89.5" cy="20" r="0.8" />
        </g>
      )}

      {/* soft sheen on the upper-left lobe */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-outer-clip)`}>
          <ellipse cx="21" cy="7" rx="13" ry="4.5" fill={LIGHT} opacity="0.35" transform="rotate(-12 21 7)" />
        </g>
      )}

      {/* shading limb on the lower right */}
      <path d={OUTER} fill={`url(#${uid}-limb)`} />

      {/* crisp membrane edges */}
      {px > 48 && (
        <>
          <path d={OUTER} transform={INNER_XF} fill="none" stroke={BASE} strokeWidth="0.9" opacity="0.7" />
          <path d={OUTER} fill="none" stroke={LIGHT} strokeWidth="0.8" opacity="0.5" />
        </>
      )}
    </svg>
  ),
};
