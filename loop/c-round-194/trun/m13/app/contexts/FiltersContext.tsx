import { createContext, type ReactNode, useState } from 'react';
import type { ActiveFilters, FilterType } from '~/types';

interface FiltersContextValue {
  activeFilters: ActiveFilters;
  toggleFilter: (type: FilterType, value: string) => void;
  removeFilter: (type: FilterType, value: string) => void;
  clearAllFilters: () => void;
  clearFilterType: (type: FilterType) => void;
  hasActiveFilters: boolean;
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    primary: [],
    secondary: [],
    instrument: [],
  });

  const toggleFilter = (type: FilterType, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      if (current.includes(value)) {
        return { ...prev, [type]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [type]: [...current, value] };
      }
    });
  };

  const removeFilter = (type: FilterType, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((v) => v !== value),
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      primary: [],
      secondary: [],
      instrument: [],
    });
  };

  const clearFilterType = (type: FilterType) => {
    setActiveFilters((prev) => ({ ...prev, [type]: [] }));
  };

  const hasActiveFilters = Object.values(activeFilters).some((arr) => arr.length > 0);

  return (
    <FiltersContext.Provider
      value={{
        activeFilters,
        toggleFilter,
        removeFilter,
        clearAllFilters,
        clearFilterType,
        hasActiveFilters,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export { FiltersContext };
