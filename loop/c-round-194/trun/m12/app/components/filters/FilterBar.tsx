import { useRef, useState } from 'react';
import { SlidersHorizontal } from '~/components/icons';
import { useClickOutside, useFilters } from '~/hooks';
import type { ActiveFilters as ActiveFiltersType, FilterType } from '~/types';
import { ActiveFilters } from './ActiveFilters';
import { FilterDropdown } from './FilterDropdown';

interface FilterBarProps {
  primaryFilterLabel: string;
  primaryFilterOptions: string[];
  secondaryFilterLabel: string;
  secondaryFilterOptions: string[];
  instrumentOptions: string[];
  sortOptions?: string[];
  sortBy: string;
  onSortChange: (value: string) => void;
  onFiltersChange: (filters: ActiveFiltersType) => void;
}

export function FilterBar({
  primaryFilterLabel,
  primaryFilterOptions,
  secondaryFilterLabel,
  secondaryFilterOptions,
  instrumentOptions,
  sortOptions = ['Staff Picks', 'Newest', 'Popular', 'Duration'],
  sortBy,
  onSortChange,
  onFiltersChange,
}: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<FilterType | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { activeFilters, toggleFilter, removeFilter, clearAllFilters, clearFilterType } =
    useFilters();

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setActiveDropdown(null));

  // Notify parent of filter changes
  const handleFilterToggle = (type: FilterType, value: string) => {
    toggleFilter(type, value);
    // Parent will receive updated filters via onFiltersChange
    onFiltersChange(activeFilters);
  };

  const getFilterItems = (type: FilterType): string[] => {
    switch (type) {
      case 'primary':
        return primaryFilterOptions;
      case 'secondary':
        return secondaryFilterOptions;
      case 'instrument':
        return instrumentOptions;
      default:
        return [];
    }
  };

  const getFilterLabel = (type: FilterType): string => {
    switch (type) {
      case 'primary':
        return primaryFilterLabel;
      case 'secondary':
        return secondaryFilterLabel;
      case 'instrument':
        return 'Instrument';
      default:
        return '';
    }
  };

  return (
    <div className="filter-bar" ref={dropdownRef}>
      <div className="filter-bar-inner">
        {/* Filter Dropdowns */}
        <div className="filter-dropdowns">
          {(['primary', 'secondary', 'instrument'] as FilterType[]).map((type) => (
            <FilterDropdown
              key={type}
              type={type}
              label={getFilterLabel(type)}
              items={getFilterItems(type)}
              activeFilters={activeFilters[type]}
              isOpen={activeDropdown === type}
              onToggle={() => setActiveDropdown(activeDropdown === type ? null : type)}
              onFilterToggle={(value) => handleFilterToggle(type, value)}
              onClear={() => clearFilterType(type)}
              onClose={() => setActiveDropdown(null)}
            />
          ))}
        </div>

        {/* Right Side Controls */}
        <div className="filter-controls">
          {/* Sort Dropdown */}
          <div className="sort-dropdown">
            <span className="sort-label">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="sort-select"
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Filters Button */}
          <button className="filters-button">
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Active Filters Pills */}
      <ActiveFilters
        activeFilters={activeFilters}
        onRemove={removeFilter}
        onClearAll={clearAllFilters}
      />
    </div>
  );
}
