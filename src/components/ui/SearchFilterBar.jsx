export default function SearchFilterBar({ query, onQueryChange, filters = [], placeholder = 'Search...' }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="flex-1 rounded-xl border border-line bg-surface-card px-4 py-2.5 text-sm text-ink placeholder-ink-soft/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      {filters.map((f) => (
        <select
          key={f.name}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          aria-label={f.name}
          className="rounded-xl border border-line bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {f.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
