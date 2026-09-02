import Icon from "./Icon";

/**
 * Consistent filter row for list/table pages: a search field plus any
 * number of `<select className="select-field">`s, wrapped so the group
 * degrades to a 2-column grid on mobile instead of overflowing.
 * Usage:
 *   <FilterBar activeCount={n} onClear={...}>
 *     <SearchField ... />
 *     <FilterFields>
 *       <select className="select-field">...</select>
 *       <select className="select-field">...</select>
 *     </FilterFields>
 *   </FilterBar>
 */
export default function FilterBar({ children, activeCount = 0, onClear }) {
  return (
    <div className="filter-bar">
      <Icon name="search" className="hidden sm:block h-4 w-4 text-muted shrink-0" />
      {children}
      {activeCount > 0 && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-ink sm:ml-auto shrink-0"
        >
          <Icon name="x" className="h-3 w-3" /> Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="relative w-full sm:w-56 shrink-0">
      <Icon name="search" className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        className="field-input pl-8 py-2 text-sm w-full"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Groups selects into a 2-col grid on mobile; on sm+ they flow inline with the rest of the bar. */
export function FilterFields({ children }) {
  return <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:contents">{children}</div>;
}
