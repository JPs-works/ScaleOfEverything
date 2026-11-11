import React, { useRef } from 'react';

interface Option<T extends string> {
  id: T;
  label: React.ReactNode;
  title?: string;
}

/**
 * WAI-ARIA radio group with roving tabindex: Tab enters on the checked
 * option, arrow keys move and select, Home/End jump to the ends.
 */
export function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  optionClass,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  className?: string;
  optionClass: (checked: boolean) => string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (i: number) => {
    const o = options[(i + options.length) % options.length];
    onChange(o.id);
    refs.current[(i + options.length) % options.length]?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in moves) select(i + moves[e.key]);
    else if (e.key === 'Home') select(0);
    else if (e.key === 'End') select(options.length - 1);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div role="radiogroup" aria-label={label} className={className}>
      {options.map((o, i) => (
        <button
          key={o.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          tabIndex={value === o.id ? 0 : -1}
          title={o.title}
          onClick={() => onChange(o.id)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={optionClass(value === o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
