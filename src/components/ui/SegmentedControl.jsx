import { useLayoutEffect, useRef, useState } from 'react';

export default function SegmentedControl({ options, value, onChange, getLabel }) {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);
  const [indicator, setIndicator] = useState(null);

  const activeIndex = options.indexOf(value);

  useLayoutEffect(() => {
    function measure() {
      const el = buttonRefs.current[activeIndex];
      if (!el) return;
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeIndex, options.length]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className="relative inline-flex w-full sm:w-auto items-center gap-0.5 rounded-xl bg-surface-page border border-line p-1 overflow-x-auto"
    >
      {indicator && (
        <div
          className="absolute top-1 bottom-1 rounded-lg bg-surface-card shadow-card transition-all duration-200 ease-ios"
          style={{ left: indicator.left, width: indicator.width }}
          aria-hidden="true"
        />
      )}
      {options.map((opt, i) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            ref={(el) => { buttonRefs.current[i] = el; }}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={`relative z-10 flex-1 sm:flex-none whitespace-nowrap rounded-lg px-3.5 py-1.5 min-h-[36px] text-sm font-medium transition-colors duration-200 ease-ios ${
              active ? 'text-ink' : 'text-ink-soft'
            }`}
          >
            {getLabel ? getLabel(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}
