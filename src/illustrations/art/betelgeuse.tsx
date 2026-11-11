import type { Illustration } from '../types';

// Betelgeuse — measured axis: diameter (horizontal). The photosphere disc spans the full viewBox;
// only a faint, fuzzy halo (opacity <= 0.35, within 12% of the box) spills beyond it, suggesting the
// ill-defined edge of a red supergiant. Light from the upper-left: a salmon-pink highlight at about
// 35%,30%, a deep wine-red limb at the lower right. The surface is mottled with a few giant convection
// cells (bright patches) and dusky dark patches, with one large dimming region in the lower hemisphere.
export const art: Illustration = {
  id: 'betelgeuse',
  aspect: 1,
  View: ({ uid, px }) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}-photo`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FED7D7" />
          <stop offset="20%" stopColor="#FCA5A5" />
          <stop offset="55%" stopColor="#F87171" />
          <stop offset="82%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#9F1239" />
        </radialGradient>
        <radialGradient id={`${uid}-shade`} cx="35%" cy="30%" r="82%">
          <stop offset="58%" stopColor="#4C0519" stopOpacity="0" />
          <stop offset="100%" stopColor="#4C0519" stopOpacity="0.5" />
        </radialGradient>
        {/* soft limb: the disc's own edge fades a touch so the silhouette reads as fuzzy */}
        <radialGradient id={`${uid}-limb`} cx="50%" cy="50%" r="50%">
          <stop offset="88%" stopColor="#F87171" stopOpacity="0" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0.4" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="88%" stopColor="#F87171" stopOpacity="0.32" />
          <stop offset="94%" stopColor="#F87171" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#F87171" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-cell`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD9B0" stopOpacity="0.7" />
          <stop offset="60%" stopColor="#FDBA74" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FDBA74" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-dusk`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7F1D1D" stopOpacity="0.6" />
          <stop offset="65%" stopColor="#7F1D1D" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-gleam`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF1F2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFF1F2" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>

      {/* fuzzy halo hugging the ill-defined limb */}
      <circle cx="50" cy="50" r="56" fill={`url(#${uid}-halo)`} />

      {/* the photosphere */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-photo)`} />

      {/* mottling: a handful of giant convection cells over the surface */}
      {px > 24 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="30" cy="30" rx="16" ry="13" fill={`url(#${uid}-cell)`} />
          <ellipse cx="60" cy="22" rx="13" ry="10" fill={`url(#${uid}-cell)`} />
          <ellipse cx="72" cy="48" rx="14" ry="12" fill={`url(#${uid}-cell)`} />
          <ellipse cx="46" cy="56" rx="15" ry="12" fill={`url(#${uid}-cell)`} />
          <ellipse cx="22" cy="62" rx="11" ry="10" fill={`url(#${uid}-cell)`} />
          <ellipse cx="64" cy="78" rx="12" ry="9" fill={`url(#${uid}-cell)`} />
          {/* dusky patches between the cells */}
          <ellipse cx="48" cy="38" rx="9" ry="7" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="84" cy="30" rx="10" ry="12" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="14" cy="46" rx="8" ry="10" fill={`url(#${uid}-dusk)`} />
          {/* the great dimming: a large dust-veiled region in the lower hemisphere */}
          <ellipse cx="36" cy="82" rx="22" ry="13" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="40" cy="86" rx="14" ry="8" fill="#7F1D1D" opacity="0.35" />
        </g>
      )}

      {/* finer mottling for close views */}
      {px > 120 && (
        <g clipPath={`url(#${uid}-clip)`}>
          <ellipse cx="40" cy="18" rx="8" ry="6" fill={`url(#${uid}-cell)`} />
          <ellipse cx="20" cy="38" rx="7" ry="5.5" fill={`url(#${uid}-cell)`} />
          <ellipse cx="58" cy="44" rx="7.5" ry="5.5" fill={`url(#${uid}-cell)`} />
          <ellipse cx="78" cy="64" rx="8" ry="5.5" fill={`url(#${uid}-cell)`} />
          <ellipse cx="30" cy="50" rx="9" ry="5.5" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="66" cy="36" rx="6.5" ry="8" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="54" cy="70" rx="9" ry="6.5" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="82" cy="80" rx="8" ry="6.5" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="88" cy="52" rx="5.5" ry="7" fill={`url(#${uid}-dusk)`} />
          <ellipse cx="18" cy="74" rx="8" ry="5.5" fill={`url(#${uid}-dusk)`} />
        </g>
      )}

      {/* limb darkening and soft edge */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-shade)`} />
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-limb)`} />

      {/* soft upper-left highlight */}
      <circle cx="35" cy="30" r="22" fill={`url(#${uid}-gleam)`} />
    </svg>
  ),
};
