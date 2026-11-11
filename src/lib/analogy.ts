// The comparison voice: ratio headlines, "how many fit" lines and familiar-object analogies.

import type { FamiliarObject, ScaleItem, SizeLabel } from '../types';
import { formatLength, formatRatio } from './format';
import { dimensionWords, pluralOf, withArticle } from './text';

export interface Comparison {
  small: ScaleItem;
  big: ScaleItem;
  ratio: number;
  /** "18×" */
  ratioShort: string;
  /** "A blue whale is about 18 times longer than a human is tall." */
  headline: string;
  /** "About 18 humans laid end to end would match the length of a blue whale." */
  fit: string;
  /** "If a human were the size of a grapefruit, Earth would be about as long as Great Britain." */
  analogy: string | null;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Spoken counts for small ratios: 2.5 → "two and a half", 3.9 → "nearly four". */
export function spokenCount(ratio: number): string {
  const WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  if (ratio >= 10) return formatRatio(ratio).short.replace('×', '');
  const whole = Math.floor(ratio);
  const frac = ratio - whole;
  if (frac < 0.08) return WORDS[whole];
  if (frac < 0.35) return `just over ${WORDS[whole]}`;
  if (frac < 0.65) return whole === 1 ? 'one and a half' : `${WORDS[whole]} and a half`;
  if (frac < 0.93) return `nearly ${WORDS[whole + 1]}`;
  return WORDS[whole + 1];
}

/** "N× as" phrasing that reads naturally: "twice as wide", "three times as wide", "11 times wider". */
function timesPhrase(r: ReturnType<typeof formatRatio>, ratio: number, words: ReturnType<typeof dimensionWords>): string {
  if (ratio >= 1.9 && ratio < 2.1) return `twice as ${words.adj} as`;
  if (ratio >= 2.9 && ratio < 3.1) return `three times as ${words.adj} as`;
  return `${r.long} ${words.comparative} than`;
}

export function compare(a: ScaleItem, b: ScaleItem, familiar: FamiliarObject[]): Comparison {
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  const ratio = big.size / small.size;
  const r = formatRatio(ratio);
  const bigWords = dimensionWords(big.sizeLabel);
  const smallWords = dimensionWords(small.sizeLabel);
  const sameDim = bigWords.adj === smallWords.adj;
  const pct = Math.round((ratio - 1) * 100);

  let headline: string;
  if (ratio < 1.05) headline = `${cap(withArticle(big))} and ${withArticle(small)} are almost the same size.`;
  else if (ratio < 1.25) headline = `${cap(withArticle(big))} is only about ${pct}% ${bigWords.comparative} than ${withArticle(small)}${sameDim ? '' : ` is ${smallWords.adj}`}.`;
  else headline = `${cap(withArticle(big))} is ${timesPhrase(r, ratio, bigWords)} ${withArticle(small)}${sameDim ? '' : ` is ${smallWords.adj}`}.`;

  const plural = pluralOf(small);
  const count = ratio < 10 ? cap(spokenCount(ratio)) : `${r.approx ? 'About ' : ''}${r.short.replace('×', '')}`;
  let fit: string;
  if (ratio < 1.25) {
    fit = `Close: ${withArticle(small)} is about ${Math.round(100 / ratio)}% of the ${dimensionNoun(big.sizeLabel)} of ${withArticle(big)}.`;
  } else if (!sameDim) {
    fit = `${count} ${plural} would span the ${dimensionNoun(big.sizeLabel)} of ${withArticle(big)}.`;
  } else if (big.sizeLabel === 'Height') {
    fit = `${count} ${plural} stacked on top of each other would reach the top of ${withArticle(big)}.`;
  } else if (big.sizeLabel === 'Depth') {
    fit = `${count} ${plural} stacked on top of each other would reach from the bottom of ${withArticle(big)} to the surface.`;
  } else if (big.sizeLabel === 'Length' || big.sizeLabel === 'Distance') {
    fit = `${count} ${plural} laid end to end would match the length of ${withArticle(big)}.`;
  } else {
    fit = `${count} ${plural} would fit side by side across ${withArticle(big)}.`;
  }

  return {
    small, big, ratio, ratioShort: r.short, headline, fit,
    analogy: buildAnalogy(small, big, ratio, familiar),
  };
}

/** Anchors a general audience can picture instantly: hand-sized things, plus an adult person. */
const ANCHOR_MAX = 0.25;
const PERSON_MIN = 1.5;
/** Things in this range need no analogy: people can already picture them. */
const PICTURABLE_MIN = 1e-3, PICTURABLE_MAX = 100;

const anchorPhrase = (f: FamiliarObject): string => {
  if (f.sizeLabel === 'Thickness') return `were as thick as ${f.name}`;
  return `were the size of ${f.name}`;
};
const targetPhrase = (f: FamiliarObject, bigLabel: SizeLabel): string => {
  const tw = dimensionWords(f.sizeLabel), bw = dimensionWords(bigLabel);
  if (f.sizeLabel === 'Thickness') return `about as thick as ${f.name}`;
  if (tw.adj === bw.adj) return `about as ${bw.adj} as ${f.name}`;
  return `about the size of ${f.name}`;
};

export function buildAnalogy(small: ScaleItem, big: ScaleItem, ratio: number, familiar: FamiliarObject[]): string | null {
  if (!familiar.length || ratio < 3) return null;
  // Both already picturable: an analogy would only shrink familiar things into odd ones.
  if (small.size >= PICTURABLE_MIN && big.size <= PICTURABLE_MAX) return null;
  const near = (f: FamiliarObject, it: ScaleItem) => f.id === it.id || Math.abs(Math.log10(f.size / it.size)) < 0.05;
  const pool = familiar.filter((f) => !near(f, small) && !near(f, big)).sort((x, y) => y.size - x.size); // largest first
  const anchors = pool.filter((f) => f.size <= ANCHOR_MAX || (f.size >= PERSON_MIN && f.size < 2.2));
  if (!anchors.length) return null;
  const bigWords = dimensionWords(big.sizeLabel);
  const subject = `If ${withArticle(small)} ${'ANCHOR'}`;

  // Prefer the largest anchor that lands on a familiar target, so results stay visible-sized.
  for (const anchor of anchors) {
    const want = anchor.size * ratio;
    let best: { target: FamiliarObject; err: number } | null = null;
    for (const target of pool) {
      if (target === anchor) continue;
      const err = Math.abs(Math.log10(target.size / want));
      if (err < 0.1 && (!best || err < best.err)) best = { target, err };
    }
    if (best) {
      return `${subject.replace('ANCHOR', anchorPhrase(anchor))}, ${withArticle(big)} would be ${targetPhrase(best.target, big.sizeLabel)}.`;
    }
  }
  // Numeric fallback: the smallest hand-sized anchor keeps the number readable.
  const anchor = [...anchors].reverse().find((f) => f.size <= ANCHOR_MAX && f.sizeLabel !== 'Thickness') ?? anchors[anchors.length - 1];
  const len = formatLength(anchor.size * ratio).text;
  return `${subject.replace('ANCHOR', anchorPhrase(anchor))}, ${withArticle(big)} would be ${len} ${bigWords.across === 'across' ? 'across' : bigWords.adj}.`;
}

/** "1.7 m tall" / "12,742 km across" */
export function sizePhrase(item: ScaleItem): string {
  const words = dimensionWords(item.sizeLabel);
  const len = formatLength(item.size).text;
  return item.sizeLabel === 'Diameter' || item.sizeLabel === 'Width' ? `${len} across` : `${len} ${words.adj}`;
}

/** "width" / "height" / "length" / "depth", for "1/11 the width of Jupiter". */
export function dimensionNoun(label: SizeLabel): string {
  switch (label) {
    case 'Height': return 'height';
    case 'Depth': return 'depth';
    case 'Length': case 'Distance': return 'length';
    case 'Thickness': return 'thickness';
    case 'Wingspan': return 'wingspan';
    default: return 'width';
  }
}
