import { Check, ChevronDown } from '~/components/icons';
import type { FilterType } from '~/types';

interface FilterDropdownProps {
  type: FilterType;
  label: string;
  items: string[];
  activeFilters: string[];
  isOpen: boolean;
  onToggle: () => void;
  onFilterToggle: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function FilterDropdown({
  type,
  label,
  items,
  activeFilters,
  isOpen,
  onToggle,
  onFilterToggle,
  onClear,
  onClose,
}: FilterDropdownProps) {
  return (
    <div className="filter-dropdown-wrapper">
      <button
        className={`filter-dropdown-trigger cursor-pointer ${isOpen ? 'active' : ''} ${activeFilters.length > 0 ? 'has-selection' : ''}`}
        onClick={onToggle}
      >
        <span>{label}</span>
        {activeFilters.length > 0 && <span className="filter-count">{activeFilters.length}</span>}
        <ChevronDown size={12} className={`filter-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          <div className="filter-dropdown-header">
            <span>{label}</span>
            {activeFilters.length > 0 && (
              <button className="filter-clear-btn cursor-pointer" onClick={onClear}>
                Clear
              </button>
            )}
          </div>
          <div className="filter-chips-grid">
            {items.map((item) => (
              <button
                key={item}
                className={`filter-chip cursor-pointer ${activeFilters.includes(item) ? 'active' : ''}`}
                onClick={() => onFilterToggle(item)}
              >
                {item}
                {activeFilters.includes(item) && (
                  <span className="filter-chip-controls">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <button className="filter-close-btn cursor-pointer" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
