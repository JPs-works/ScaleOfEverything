// Unit tests for utils/formatting.ts — run with: npx tsx scripts/test-formatting.ts
import assert from 'node:assert/strict';
import { formatMeters, formatScientific, formatAlt, formatBigNumber, niceScaleBar, ratioParts, formatFraction } from '../utils/formatting.ts';
import { SCALE_ITEMS, ITEM_INDEX } from '../constants.ts';

let failures = 0;
let checks = 0;
const eq = (got: unknown, want: unknown, what = '') => {
  checks++;
  try {
    assert.deepEqual(got, want, what);
  } catch (e) {
    failures++;
    console.error(`${what}\n${(e as Error).message}\n`);
  }
};

const meters: [number, string][] = [
  [1.616255e-35, '1.62 × 10⁻³⁵ m'],
  [1e-24, '1 ym'],
  [9.9999e-25, '1 ym'],
  [1.68e-15, '1.68 fm'],
  [1.5e-14, '15 fm'],
  [1.06e-10, '106 pm'],
  [2.75e-10, '275 pm'],
  [2e-9, '2 nm'],
  [9.996e-7, '1 µm'],
  [1.5e-6, '1.5 µm'],
  [70e-6, '70 µm'],
  [0.001, '1 mm'],
  [0.005, '5 mm'],
  [0.057, '5.7 cm'],
  [0.99999, '1 m'],
  [1.7, '1.7 m'],
  [330, '330 m'],
  [8849, '8.85 km'],
  [20000, '20 km'],
  [3.4748e6, '3,475 km'],
  [1.2742e7, '12,742 km'],
  [1.42984e8, '142,984 km'],
  [1.3927e9, '1.39 million km'],
  [2.99e12, '20 AU'],
  [9e12, '60.2 AU'],
  [3.7e15, '0.391 ly'],
  [9.4607e15, '1 ly'],
  [9.46e20, '100,000 ly'],
  [9.46e22, '10 million ly'],
  [8.8e26, '93 billion ly'],
  [0, '0 m'],
];
for (const [input, want] of meters) eq(formatMeters(input), want, `formatMeters(${input})`);

eq(formatScientific(1.616255e-35), '1.62 × 10⁻³⁵ m', 'scientific planck');
eq(formatScientific(9.996e5), '1 × 10⁶ m', 'scientific rounding carry');

// Secondary line
eq(formatAlt(1.616255e-35), 'one Planck length', 'alt planck');
eq(formatAlt(1.7), '', 'alt hidden for everyday sizes');
eq(formatAlt(828), '', 'alt hidden below 1000 m');
eq(formatAlt(0.057), '', 'alt hidden at cm');
eq(formatAlt(8849), '8.85 × 10³ m', 'alt everest');
eq(formatAlt(8.8e26), '8.8 × 10²⁶ m · 28.5 Gpc', 'alt universe in Gpc');
eq(formatAlt(9.46e22), '9.46 × 10²² m · 3.07 Mpc', 'alt local group in Mpc');
eq(formatAlt(9.4607e15), '9.46 × 10¹⁵ m · 9.5 trillion km', 'alt light-year km');

// Scale bars: unit first, then 1/2/5 in that unit
eq(niceScaleBar(0.17e-9).label, '100 pm', 'bar pm');
eq(niceScaleBar(8.4e12).label, '50 AU', 'bar AU (not 6.68 AU)');
eq(niceScaleBar(1e12).label, '5 AU', 'bar AU small');
eq(niceScaleBar(2.1e20).label, '20,000 ly', 'bar ly (not 21,100 ly)');
eq(niceScaleBar(6.3e25).label, '5 billion ly', 'bar billion ly (not 6.48 Gpc)');
eq(niceScaleBar(7.7e7).label, '50,000 km', 'bar km');
eq(niceScaleBar(3e-35).label, '2 × 10⁻³⁵ m', 'bar planck');
eq(niceScaleBar(0.8 * 9.4607e15).label, '0.5 ly', 'bar fractional ly');
eq(Math.abs(niceScaleBar(8.4e12).meters / (50 * 1.495978707e11) - 1) < 1e-12, true, 'bar metres match label');

// Ratios: no double ×, words for big numbers, scientific companion
eq(ratioParts(2.594), { main: '2.6×' }, 'ratio small');
eq(ratioParts(340.4), { main: '340×' }, 'ratio hundreds');
eq(ratioParts(5800.4), { main: '5,800×' }, 'ratio thousands');
eq(ratioParts(7.5e6), { main: '7.5 million times', sci: '7.5 × 10⁶' }, 'ratio million');
eq(ratioParts(1e9), { main: '1 billion times', sci: '10⁹' }, 'ratio exact power');
eq(ratioParts(5.4e61), { main: '5.4 × 10⁶¹ times' }, 'ratio beyond words');
eq(formatFraction(879.3), '1/879', 'fraction');
eq(formatFraction(1300), '1/1,300', 'fraction thousands');
eq(formatFraction(7.5e6), '1/7.5 million', 'fraction million');
eq(formatFraction(3.1e34), '1/31 decillion', 'fraction decillion');
eq(formatFraction(3.1e40), '1/(3.1 × 10⁴⁰)', 'fraction beyond words');
eq(formatBigNumber(5.4e61), '5.4 × 10⁶¹', 'big number');

// Every catalogue size formats without raw exponents; catalogue is sorted.
for (const item of SCALE_ITEMS) eq(/e[+-]/.test(formatMeters(item.size)), false, `${item.id} raw exponent`);
for (let i = 1; i < SCALE_ITEMS.length; i++) eq(SCALE_ITEMS[i].size >= SCALE_ITEMS[i - 1].size, true, `order at ${SCALE_ITEMS[i].id}`);

// Deep-link lookup must not match inherited Object properties.
for (const k of ['toString', '__proto__', 'constructor', 'valueOf', 'hasOwnProperty']) eq(ITEM_INDEX.get(k), undefined, `ITEM_INDEX ${k}`);
eq(ITEM_INDEX.get('human'), SCALE_ITEMS.findIndex((i) => i.id === 'human'), 'ITEM_INDEX human');

if (failures) {
  console.error(`\n${failures}/${checks} formatting checks failed`);
  process.exit(1);
}
console.log(`formatting: all ${checks} checks passed`);
