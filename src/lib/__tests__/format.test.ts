import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatLength, formatRatio, fmtNum, fmtSci, niceScaleBar } from '../format';

test('formatLength picks communicator units', () => {
  assert.equal(formatLength(1.616e-35).text, '1.6 × 10⁻³⁵ m');
  assert.equal(formatLength(1.7e-15).text, '1.7 fm');
  assert.equal(formatLength(1.06e-10).text, '106 pm');
  assert.equal(formatLength(7e-6).text, '7 µm');
  assert.equal(formatLength(1.7).text, '1.7 m');
  assert.equal(formatLength(8848).text, '8.85 km');
  assert.equal(formatLength(1.2742e7).text, '12,742 km');
  assert.equal(formatLength(1.3927e9).text, '1.39 million km');
  assert.equal(formatLength(2.89e12).text, '19.3 AU');
  assert.equal(formatLength(9.46e15).text, '1 ly');
  assert.equal(formatLength(8.8e26).text, '93 billion ly');
});

test('formatRatio rounds for prose', () => {
  assert.equal(formatRatio(1.02).short, '1×');
  assert.equal(formatRatio(2.34).short, '2.3×');
  assert.equal(formatRatio(10.97).short, '11×');
  assert.equal(formatRatio(10.97).approx, false);
  assert.equal(formatRatio(18.2).long, 'about 18 times');
  assert.equal(formatRatio(38612).short, '39,000×');
  assert.equal(formatRatio(7.5e6).short, '7.5 million×');
  assert.equal(formatRatio(6.2e16).short, '62 quadrillion×');
});

test('fmtNum and fmtSci', () => {
  assert.equal(fmtNum(12742), '12,742');
  assert.equal(fmtNum(93e9), '93 billion');
  assert.equal(fmtSci(9.99e26), '1 × 10²⁷');
  assert.equal(fmtSci(1.616255e-35, 3), '1.62 × 10⁻³⁵');
});

test('niceScaleBar stays within pixel bounds', () => {
  for (const mpp of [1e-20, 3.3e-7, 0.0042, 1, 777, 2.3e5, 1e14, 1e24]) {
    const bar = niceScaleBar(mpp);
    assert.ok(bar.px >= 90 && bar.px <= 220, `${mpp} → ${bar.px}px`);
    const mant = bar.meters / Math.pow(10, Math.floor(Math.log10(bar.meters)));
    assert.ok([1, 2, 5].some((k) => Math.abs(mant - k) < 1e-6), `${bar.meters} is not 1/2/5 × 10ⁿ`);
  }
});
