import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import { describe, expect, it } from 'vitest';
import { FiltersContext, FiltersProvider } from '../FiltersContext';

function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('FiltersProvider missing');
  return ctx;
}

function wrapper({ children }: { children: ReactNode }) {
  return <FiltersProvider>{children}</FiltersProvider>;
}

describe('FiltersContext', () => {
  describe('initial state', () => {
    it('starts with empty filters', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      expect(result.current.activeFilters).toEqual({
        primary: [],
        secondary: [],
        instrument: [],
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('toggleFilter', () => {
    it('adds a filter value', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });

      expect(result.current.activeFilters.primary).toEqual(['Cinematic']);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('removes a filter value when toggled again', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });
      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });

      expect(result.current.activeFilters.primary).toEqual([]);
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('adds multiple values to same filter type', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });
      act(() => {
        result.current.toggleFilter('primary', 'Hip Hop');
      });

      expect(result.current.activeFilters.primary).toEqual(['Cinematic', 'Hip Hop']);
    });

    it('adds filters across different types', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });
      act(() => {
        result.current.toggleFilter('secondary', 'Dark');
      });
      act(() => {
        result.current.toggleFilter('instrument', 'Piano');
      });

      expect(result.current.activeFilters.primary).toEqual(['Cinematic']);
      expect(result.current.activeFilters.secondary).toEqual(['Dark']);
      expect(result.current.activeFilters.instrument).toEqual(['Piano']);
    });

    it('does not add duplicate values', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });

      expect(result.current.activeFilters.primary).toEqual(['Cinematic']);

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });

      expect(result.current.activeFilters.primary).toEqual([]);
    });
  });

  describe('removeFilter', () => {
    it('removes existing filter value', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
        result.current.toggleFilter('primary', 'Hip Hop');
      });
      act(() => {
        result.current.removeFilter('primary', 'Cinematic');
      });

      expect(result.current.activeFilters.primary).toEqual(['Hip Hop']);
    });

    it('does nothing when removing non-existent value', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });
      act(() => {
        result.current.removeFilter('primary', 'NonExistent');
      });

      expect(result.current.activeFilters.primary).toEqual(['Cinematic']);
    });

    it('does nothing on empty filter list', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.removeFilter('primary', 'Anything');
      });

      expect(result.current.activeFilters.primary).toEqual([]);
    });
  });

  describe('clearAllFilters', () => {
    it('clears all filter types', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
        result.current.toggleFilter('secondary', 'Dark');
        result.current.toggleFilter('instrument', 'Piano');
      });
      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.activeFilters).toEqual({
        primary: [],
        secondary: [],
        instrument: [],
      });
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('is safe to call when already empty', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.activeFilters).toEqual({
        primary: [],
        secondary: [],
        instrument: [],
      });
    });
  });

  describe('clearFilterType', () => {
    it('clears only specified filter type', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
        result.current.toggleFilter('secondary', 'Dark');
        result.current.toggleFilter('instrument', 'Piano');
      });
      act(() => {
        result.current.clearFilterType('primary');
      });

      expect(result.current.activeFilters.primary).toEqual([]);
      expect(result.current.activeFilters.secondary).toEqual(['Dark']);
      expect(result.current.activeFilters.instrument).toEqual(['Piano']);
    });

    it('is safe to call on already empty type', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.clearFilterType('primary');
      });

      expect(result.current.activeFilters.primary).toEqual([]);
    });
  });

  describe('hasActiveFilters', () => {
    it('returns false when all filters empty', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('returns true when any filter has values', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('instrument', 'Guitar');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('returns false after clearing all', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'Cinematic');
      });
      act(() => {
        result.current.clearAllFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('_BUG multiple rapid toggles', () => {
    it('handles rapid toggle on/off correctly', () => {
      const { result } = renderHook(() => useFilters(), { wrapper });

      act(() => {
        result.current.toggleFilter('primary', 'A');
        result.current.toggleFilter('primary', 'A');
        result.current.toggleFilter('primary', 'A');
      });

      expect(result.current.activeFilters.primary).toEqual(['A']);
    });
  });
});
