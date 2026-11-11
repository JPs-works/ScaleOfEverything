const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};

/** 10 → "¹⁰", -35 → "⁻³⁵". Render through <Rich> (components/Rich.tsx) so these become real <sup>. */
export const superscript = (n: number): string => String(n).split('').map((c) => SUP[c] ?? c).join('');

export const PLANCK_LENGTH = 1.616255e-35;
export const AU = 1.495978707e11;
export const LIGHT_YEAR = 9.4607304725808e15;
export const PARSEC = 3.0856775814913673e16;
const MPC = PARSEC * 1e6;
const GPC = PARSEC * 1e9;

/** Round to `sig` significant figures, drop trailing zeros, group thousands. */
const num = (v: number, sig = 3): string => {
  const r = Number(v.toPrecision(sig));
  if (Math.abs(r) >= 1000) return Math.round(r).toLocaleString('en-US');
  return String(r);
};

/** Split into mantissa/exponent after rounding, so 9.996e5 → [1, 6] not [10.0, 5]. */
const sci = (v: number, digits = 2): [number, number] => {
  let exp = Math.floor(Math.log10(Math.abs(v)));
  let mant = Number((v / 10 ** exp).toFixed(digits));
  if (mant >= 10) {
    mant /= 10;
    exp += 1;
  }
  return [mant, exp];
};

/** "1.62 × 10⁻³⁵ m" */
export const formatScientific = (meters: number, unit = 'm'): string => {
  if (meters === 0) return `0 ${unit}`;
  const [m, e] = sci(meters, 2);
  if (e === 0) return `${num(m)} ${unit}`.trim();
  return `${num(m)} × 10${superscript(e)} ${unit}`.trim();
};

export interface LengthUnit {
  /** Metres per unit. */
  factor: number;
  label: string;
}

/**
 * Display units in ascending order; each applies from `from` metres (after
 * rounding to 3 s.f.) up to the next one. Light-years lead for cosmic sizes;
 * parsecs are only shown on the secondary line.
 */
const UNITS: (LengthUnit & { from: number })[] = [
  { from: 1e-24, factor: 1e-24, label: 'ym' },
  { from: 1e-21, factor: 1e-21, label: 'zm' },
  { from: 1e-18, factor: 1e-18, label: 'am' },
  { from: 1e-15, factor: 1e-15, label: 'fm' },
  { from: 1e-12, factor: 1e-12, label: 'pm' },
  { from: 1e-9, factor: 1e-9, label: 'nm' },
  { from: 1e-6, factor: 1e-6, label: 'µm' },
  { from: 1e-3, factor: 1e-3, label: 'mm' },
  { from: 1e-2, factor: 1e-2, label: 'cm' },
  { from: 1, factor: 1, label: 'm' },
  { from: 1e3, factor: 1e3, label: 'km' },
  { from: 1e9, factor: 1e9, label: 'million km' },
  { from: 0.1 * AU, factor: AU, label: 'AU' },
  { from: 0.1 * LIGHT_YEAR, factor: LIGHT_YEAR, label: 'ly' },
  { from: 1e6 * LIGHT_YEAR, factor: 1e6 * LIGHT_YEAR, label: 'million ly' },
  { from: 1e9 * LIGHT_YEAR, factor: 1e9 * LIGHT_YEAR, label: 'billion ly' },
];

/** The unit formatMeters would use for this length, or null below 1 ym (scientific notation). */
export function unitFor(meters: number): LengthUnit | null {
  const r = Number(meters.toPrecision(3));
  let unit: (typeof UNITS)[number] | null = null;
  for (const u of UNITS) if (r >= u.from * 0.99999) unit = u;
  return unit;
}

const inUnit = (meters: number, u: LengthUnit) => {
  const v = meters / u.factor;
  // km keep 4–5 figures (3,475 km, 12,742 km) — familiar planetary numbers.
  return u.label === 'km' && v >= 1000 ? Math.round(v).toLocaleString('en-US') : num(v);
};

/**
 * Human-readable length, three significant figures, choosing the unit after
 * rounding so values never print as "1000 µm" or with raw exponents.
 */
export const formatMeters = (meters: number): string => {
  if (!Number.isFinite(meters) || meters <= 0) return '0 m';
  const u = unitFor(meters);
  if (!u) return formatScientific(meters);
  return `${inUnit(meters, u)} ${u.label}`;
};

const BIG_WORDS: [number, string][] = [
  [1e33, 'decillion'],
  [1e30, 'nonillion'],
  [1e27, 'octillion'],
  [1e24, 'septillion'],
  [1e21, 'sextillion'],
  [1e18, 'quintillion'],
  [1e15, 'quadrillion'],
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
];

/** 2.5e9 → "2.5 billion" ; 4.2e40 → "4.2 × 10⁴⁰" ; 5800 → "5,800" */
export const formatBigNumber = (n: number): string => {
  if (Number(n.toPrecision(2)) >= 1e36) {
    const [m, e] = sci(n, 1);
    return `${num(m, 2)} × 10${superscript(e)}`;
  }
  for (const [f, w] of BIG_WORDS) {
    if (Number(n.toPrecision(2)) >= f) return `${num(n / f, 2)} ${w}`;
  }
  return num(n, 2);
};

/**
 * Secondary label. Hidden ('') for everyday sizes (1 cm … 999 m), otherwise
 * scientific metres, plus parsecs for intergalactic sizes or km in words for
 * astronomical ones.
 */
export const formatAlt = (meters: number): string => {
  if (Math.abs(meters / PLANCK_LENGTH - 1) < 0.01) return 'one Planck length';
  const [, e] = sci(meters, 2);
  if (e >= -2 && e <= 2) return '';
  const s = formatScientific(meters);
  if (meters >= GPC * 0.9995) return `${s} · ${num(meters / GPC)} Gpc`;
  if (meters >= MPC * 0.9995) return `${s} · ${num(meters / MPC)} Mpc`;
  if (meters >= 0.1 * AU) return `${s} · ${formatBigNumber(meters / 1e3)} km`;
  return s;
};

/** Largest 1/2/5 × 10ⁿ value ≤ v. */
const niceFloor = (v: number) => {
  const e = Math.floor(Math.log10(v));
  const base = 10 ** e;
  for (const m of [5, 2, 1]) if (m * base <= v * (1 + 1e-9)) return m * base;
  return base;
};

/** Scale-bar length ≤ maxMeters: pick the display unit first, then 1/2/5 × 10ⁿ in that unit. */
export function niceScaleBar(maxMeters: number): { meters: number; label: string } {
  const u = unitFor(maxMeters);
  if (!u) {
    const m = niceFloor(maxMeters);
    return { meters: m, label: formatScientific(m) };
  }
  const n = niceFloor(maxMeters / u.factor);
  const label = n >= 1000 ? Math.round(n).toLocaleString('en-US') : String(Number(n.toPrecision(3)));
  return { meters: n * u.factor, label: `${label} ${u.label}` };
}

/**
 * Ratio ≥ 1 split for the comparison sentence:
 *   2.6 → { main: "2.6×" } ; 5,800 → { main: "5,800×" }
 *   7.5e6 → { main: "7.5 million times", sci: "7.5 × 10⁶" }
 */
export function ratioParts(ratio: number): { main: string; sci?: string } {
  if (!Number.isFinite(ratio) || ratio <= 0) return { main: '–' };
  if (ratio < 10) return { main: `${num(ratio, 2)}×` };
  if (ratio < 1e6) return { main: `${num(ratio, ratio < 1000 ? 3 : 2)}×` };
  const [m, e] = sci(ratio, 1);
  const words = formatBigNumber(ratio);
  const sciText = m === 1 ? `10${superscript(e)}` : `${num(m, 2)} × 10${superscript(e)}`;
  return words.includes('×') ? { main: `${words} times` } : { main: `${words} times`, sci: sciText };
}

/** 879.3 → "1/879" ; 1.3e6 → "1/1.3 million" ; 3e34 → "1/(3 × 10³⁴)" */
export function formatFraction(ratio: number): string {
  if (ratio < 1e6) return `1/${num(ratio, ratio < 1000 ? 3 : 2)}`;
  const words = formatBigNumber(ratio);
  return words.includes('×') ? `1/(${words})` : `1/${words}`;
}

/** Multiplier for "N× this panel" style labels without a double ×. */
export const formatTimes = (ratio: number): string => ratioParts(ratio).main;
