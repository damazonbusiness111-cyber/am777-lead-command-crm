export default function SegmentedControl({ options, value, onChange, getLabel }) {
  return (
    <div role="tablist" className="inline-flex w-full sm:w-auto items-center gap-0.5 rounded-xl bg-surface-page border border-line p-1 overflow-x-auto">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={`flex-1 sm:flex-none whitespace-nowrap rounded-lg px-3.5 py-1.5 min-h-[36px] text-sm font-medium transition-all duration-200 ease-ios ${
              active ? 'bg-surface-card text-ink shadow-card' : 'text-ink-soft'
            }`}
          >
            {getLabel ? getLabel(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}
