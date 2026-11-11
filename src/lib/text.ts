// Grammar helpers so generated sentences read naturally.

import type { Article, Kind, ScaleItem } from '../types';

const PROPER_KINDS: Kind[] = ['world', 'star', 'galaxy', 'nebula', 'cluster', 'structure', 'landform', 'cosmic'];

/** Name without a leading "The ". */
export const bareName = (item: Pick<ScaleItem, 'name'>): string => item.name.replace(/^the\s+/i, '');

export function articleFor(item: ScaleItem): Article {
  if (item.article !== undefined) return item.article;
  if (/^the\s+/i.test(item.name)) return 'the';
  if (PROPER_KINDS.includes(item.kind)) return '';
  const n = bareName(item);
  // Vowel letters that start with a consonant sound take "a" (a uranium nucleus, a one-light-year span).
  if (/^(uni|use|usu|ura|uri|uro|ute|ubi|eu|one|ewe|u$)/i.test(n)) return 'a';
  return /^[aeiou]/i.test(n) ? 'an' : 'a';
}

/** "a proton", "the Sun", "Jupiter". */
export function withArticle(item: ScaleItem, opts: { capital?: boolean } = {}): string {
  if (item.noun) return opts.capital ? item.noun.charAt(0).toUpperCase() + item.noun.slice(1) : item.noun;
  const art = articleFor(item);
  const name = bareName(item);
  const lower = isProper(item) ? name : name.toLowerCase();
  const s = art ? `${art} ${lower}` : lower;
  return opts.capital ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Proper nouns keep their capitals mid-sentence. */
export function isProper(item: ScaleItem): boolean {
  if (PROPER_KINDS.includes(item.kind)) return true;
  const n = bareName(item);
  // Acronyms (DNA), designations with digits (SARS-CoV-2), binomials (E. coli).
  if (/\d/.test(n)) return true;
  if (/\b[A-Z]{2,}\b/.test(n)) return true;
  if (/^[A-Z]\.\s/.test(n)) return true;
  if (/[a-z][A-Z]/.test(n)) return true; // camel-cased like SARS-CoV
  return false;
}

export function pluralOf(item: ScaleItem): string {
  if (item.plural) return item.plural;
  const n = bareName(item);
  const base = isProper(item) ? n : n.toLowerCase();
  if (/(s|x|z|ch|sh)$/i.test(base)) return `${base}es`;
  if (/[^aeiou]y$/i.test(base)) return `${base.slice(0, -1)}ies`;
  return `${base}s`;
}

/** Comparative and dimension words keyed by the measured dimension. */
export function dimensionWords(label: ScaleItem['sizeLabel']): { adj: string; comparative: string; across: string } {
  switch (label) {
    case 'Height': return { adj: 'tall', comparative: 'taller', across: 'from bottom to top' };
    case 'Depth': return { adj: 'deep', comparative: 'deeper', across: 'from surface to floor' };
    case 'Length': return { adj: 'long', comparative: 'longer', across: 'end to end' };
    case 'Distance': return { adj: 'long', comparative: 'longer', across: 'end to end' };
    case 'Thickness': return { adj: 'thick', comparative: 'thicker', across: 'through' };
    case 'Wingspan': return { adj: 'wide', comparative: 'wider', across: 'wingtip to wingtip' };
    case 'Width':
    case 'Diameter':
    default: return { adj: 'wide', comparative: 'wider', across: 'across' };
  }
}
