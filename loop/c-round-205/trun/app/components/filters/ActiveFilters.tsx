import { X } from '~/components/icons';
import type { ActiveFilters as ActiveFiltersType, FilterType } from '~/types';

interface ActiveFiltersProps {
  activeFilters: ActiveFiltersType;
  onRemove: (type: FilterType, value: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ activeFilters, onRemove, onClearAll }: ActiveFiltersProps) {
  const hasActiveFilters = Object.values(activeFilters).some((arr) => arr.length > 0);

  if (!hasActiveFilters) return null;

  return (
    <div className="active-filters-bar">
      {Object.entries(activeFilters).map(([type, values]) =>
        values.map((value: string) => (
          <button
            key={`${type}-${value}`}
            className="active-filter-pill cursor-pointer"
            onClick={() => onRemove(type as FilterType, value)}
          >
            {value}
            <X size={12} />
          </button>
        )),
      )}
      <button className="clear-all-btn cursor-pointer" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
