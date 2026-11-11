// Number and length formatting tuned for a science-communication voice.

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
};
export const superscript = (n: number | string): string =>
  String(n).split('').map((c) => SUP[c] ?? c).join('');

const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const sig = (n: number, digits: number) =>
  new Intl.NumberFormat('en-US', { maximumSignificantDigits: digits }).format(n);

const WORDS: Array<[number, string]> = [
  [1e24, 'septillion'],
  [1e21, 'sextillion'],
  [1e18, 'quintillion'],
  [1e15, 'quadrillion'],
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
];

/**
 * Human-friendly magnitude: 7.5 → "7.5", 12742 → "12,742", 1.39e6 → "1.39 million",
 * 8.8e28 → "8.8 × 10²⁸". `digits` is the significant-digit budget for non-integers.
 */
export function fmtNum(n: number, digits = 3): string {
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e27) return fmtSci(n, 2);
  for (const [v, w] of WORDS) {
    if (abs >= v) return `${sig(n / v, digits)} ${w}`;
  }
  if (abs >= 1000) return grouped.format(Math.round(n));
  if (abs >= 100) return sig(n, Math.max(digits, 3));
  return sig(n, digits);
}

/** Scientific notation with a real multiplication sign and superscript exponent. */
export function fmtSci(n: number, digits = 2): string {
  if (n === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mant = n / Math.pow(10, exp);
  const m = sig(mant, digits);
  // Guard against rounding 9.99 → "10"
  if (m === '10') return `1 × 10${superscript(exp + 1)}`;
  return `${m} × 10${superscript(exp)}`;
}

export interface LengthText {
  value: string;
  unit: string;
  /** value + unit, e.g. "12,742 km" */
  text: string;
  /** Spoken-friendly long unit, e.g. "kilometres" */
  unitLong: string;
}

const AU = 1.495978707e11;
const LY = 9.4607304725808e15;

/** Pick the unit a science communicator would use for this length. */
export function formatLength(m: number): LengthText {
  const mk = (value: string, unit: string, unitLong: string): LengthText => ({
    value, unit, unitLong, text: `${value} ${unit}`,
  });
  if (!(m > 0)) return mk('0', 'm', 'metres');
  if (m < 1e-16) return mk(fmtSci(m, 2), 'm', 'metres');
  if (m < 1e-12) return mk(fmtNum(m * 1e15), 'fm', 'femtometres');
  if (m < 1e-9) return mk(fmtNum(m * 1e12), 'pm', 'picometres');
  if (m < 1e-6) return mk(fmtNum(m * 1e9), 'nm', 'nanometres');
  if (m < 1e-3) return mk(fmtNum(m * 1e6), 'µm', 'micrometres');
  if (m < 1e-2) return mk(fmtNum(m * 1e3), 'mm', 'millimetres');
  if (m < 1) return mk(fmtNum(m * 1e2), 'cm', 'centimetres');
  if (m < 1e3) return mk(fmtNum(m), 'm', 'metres');
  if (m < 1e11) return mk(fmtNum(m / 1e3), 'km', 'kilometres');
  // Derived units are quoted to three significant figures: "100,000 ly", not "99,992 ly".
  const sig3 = (x: number) => Number(x.toPrecision(3));
  if (m < 0.1 * LY) return mk(fmtNum(sig3(m / AU)), 'AU', 'astronomical units');
  return mk(fmtNum(sig3(m / LY)), 'ly', 'light-years');
}

/** "1.6 × 10⁻³⁵ m" — always metres, always scientific. */
export const formatMetersSci = (m: number): string => `${fmtSci(m, 3)} m`;

export interface RatioText {
  /** "11×" */
  short: string;
  /** "11 times" / "about 1.3 million times" */
  long: string;
  /** Numeric, rounded the same way as the text. */
  value: number;
  approx: boolean;
}

/** Format a ratio ≥ 1 for prose and headlines. */
export function formatRatio(r: number): RatioText {
  if (!isFinite(r) || r <= 0) return { short: '—', long: '—', value: r, approx: false };
  let text: string;
  let approx = false;
  if (r < 1.05) {
    text = '1';
  } else if (r < 10) {
    const rounded = Math.round(r * 10) / 10;
    text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    approx = Math.abs(rounded - r) / r > 0.02;
  } else if (r < 1000) {
    text = String(Math.round(r));
    approx = Math.abs(Math.round(r) - r) / r > 0.01;
  } else if (r < 1e6) {
    const s = Number(r.toPrecision(2));
    text = grouped.format(s);
    approx = Math.abs(s - r) / r > 0.01;
  } else {
    text = fmtNum(Number(r.toPrecision(2)), 2);
    approx = true;
  }
  return {
    short: `${text}×`,
    long: `${approx ? 'about ' : ''}${text} times`,
    value: r,
    approx,
  };
}

export interface ScaleBar {
  meters: number;
  px: number;
  label: string;
}

/** Map-style scale bar: a 1/2/5 × 10ⁿ length that fits between minPx and maxPx. */
export function niceScaleBar(metersPerPixel: number, minPx = 90, maxPx = 220): ScaleBar {
  const target = ((minPx + maxPx) / 2) * metersPerPixel;
  const exp = Math.floor(Math.log10(target));
  const base = Math.pow(10, exp);
  let best = base;
  let bestErr = Infinity;
  for (const k of [1, 2, 5, 10]) {
    const L = k * base;
    const px = L / metersPerPixel;
    if (px < minPx || px > maxPx) continue;
    const err = Math.abs(Math.log(px / ((minPx + maxPx) / 2)));
    if (err < bestErr) { best = L; bestErr = err; }
  }
  const px = best / metersPerPixel;
  return { meters: best, px, label: formatLength(best).text };
}
