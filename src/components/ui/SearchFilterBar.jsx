export default function SearchFilterBar({ query, onQueryChange, filters = [], placeholder = 'Search...' }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-white/10 bg-charcoal-800/60 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand/50"
      />
      {filters.map((f) => (
        <select
          key={f.name}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
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
