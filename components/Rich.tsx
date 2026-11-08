import React from 'react';

const SUP_TO_ASCII: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '−',
};
const SUP_RUN = /[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g;

/**
 * Renders formatter output with real <sup> elements instead of Unicode
 * superscript glyphs (which many fonts draw tiny, and ⁰ reads as "o").
 * Screen readers get "10 to the power of −35" style text via aria-label.
 */
export function Rich({ text, className }: { text: string; className?: string }) {
  if (!SUP_RUN.test(text)) return <span className={className}>{text}</span>;
  SUP_RUN.lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = SUP_RUN.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const exp = m[0].split('').map((c) => SUP_TO_ASCII[c]).join('');
    parts.push(
      <sup key={k++} className="ml-[0.05em] text-[0.72em] leading-none">
        {exp}
      </sup>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  const spoken = text.replace(SUP_RUN, (run) => ` to the power ${run.split('').map((c) => SUP_TO_ASCII[c]).join('').replace('−', 'minus ')}`);
  return (
    <span className={className} aria-label={spoken}>
      <span aria-hidden>{parts}</span>
    </span>
  );
}
