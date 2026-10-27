import { useMemo } from 'react';
import { create } from 'zustand';
import type { FieldValue, SortDirection, SortField, WavFileEntry, WavMetadata } from '~/types';

interface FileState {
  folderPath: string | null;
  files: WavFileEntry[];
  metadata: Record<string, WavMetadata>;
  selectedPaths: string[];
  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
  isScanning: boolean;

  setFolderPath: (path: string | null) => void;
  setFiles: (files: WavFileEntry[]) => void;
  setMetadata: (meta: Record<string, WavMetadata>) => void;
  updateFileMetadata: (path: string, meta: WavMetadata) => void;
  setSelectedPaths: (paths: string[]) => void;
  toggleSelection: (path: string) => void;
  selectRange: (from: number, to: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  toggleSortDirection: () => void;
  setIsScanning: (scanning: boolean) => void;
}

export const useFileStore = create<FileState>((set) => ({
  folderPath: null,
  files: [],
  metadata: {},
  selectedPaths: [],
  searchQuery: '',
  sortField: 'name',
  sortDirection: 'asc',
  isScanning: false,

  setFolderPath: (path) => set({ folderPath: path }),
  setFiles: (files) => set({ files }),
  setMetadata: (meta) => set({ metadata: meta }),

  updateFileMetadata: (path, meta) =>
    set((state) => ({
      metadata: { ...state.metadata, [path]: meta },
    })),

  setSelectedPaths: (paths) => set({ selectedPaths: paths }),

  toggleSelection: (path) =>
    set((state) => {
      const idx = state.selectedPaths.indexOf(path);
      if (idx >= 0) {
        return { selectedPaths: state.selectedPaths.filter((p) => p !== path) };
      }
      return { selectedPaths: [...state.selectedPaths, path] };
    }),

  selectRange: (from, to) =>
    set((state) => {
      const start = Math.min(from, to);
      const end = Math.max(from, to);
      const sorted = getSortedFiles(state);
      const visiblePaths = new Set(sorted.map((f) => f.path));
      const filtered = state.selectedPaths.filter((p) => visiblePaths.has(p));
      const existing = new Set(filtered);
      for (let i = start; i <= end; i++) {
        if (sorted[i]) {
          existing.add(sorted[i].path);
        }
      }
      return { selectedPaths: [...existing] };
    }),

  selectAll: () =>
    set((state) => {
      const filtered = getFilteredFiles(state);
      return { selectedPaths: filtered.map((f) => f.path) };
    }),

  clearSelection: () => set({ selectedPaths: [] }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  setSortField: (field) =>
    set((state) => ({
      sortField: field,
      sortDirection:
        state.sortField === field ? (state.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc',
    })),

  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
    })),

  setIsScanning: (scanning) => set({ isScanning: scanning }),
}));

function getFilteredFiles(state: FileState): WavFileEntry[] {
  if (!state.searchQuery) return state.files;
  const q = state.searchQuery.toLowerCase();
  return state.files.filter((f) => f.name.toLowerCase().includes(q));
}

function getFieldSortKey(value: FieldValue | undefined): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }
  return String(value ?? '');
}

function getSortedFiles(state: FileState): WavFileEntry[] {
  const filtered = getFilteredFiles(state);
  const { sortField, sortDirection, metadata } = state;
  const dir = sortDirection === 'asc' ? 1 : -1;

  return [...filtered].sort((a, b) => {
    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * dir;
      case 'size':
        return (a.size - b.size) * dir;
      case 'modifiedAt':
        return (new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime()) * dir;
      default: {
        const aVal: FieldValue | undefined = metadata[a.path]?.[sortField];
        const bVal: FieldValue | undefined = metadata[b.path]?.[sortField];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * dir;
        }
        const aStr = getFieldSortKey(aVal);
        const bStr = getFieldSortKey(bVal);
        return aStr.localeCompare(bStr) * dir;
      }
    }
  });
}

export function useFilteredFiles(): WavFileEntry[] {
  const files = useFileStore((s) => s.files);
  const searchQuery = useFileStore((s) => s.searchQuery);
  const sortField = useFileStore((s) => s.sortField);
  const sortDirection = useFileStore((s) => s.sortDirection);
  const metadata = useFileStore((s) => s.metadata);

  return useMemo(() => {
    const state = { files, searchQuery, sortField, sortDirection, metadata } as FileState;
    return getSortedFiles(state);
  }, [files, searchQuery, sortField, sortDirection, metadata]);
}

export function useSelectedFiles(): WavFileEntry[] {
  const selectedPaths = useFileStore((s) => s.selectedPaths);
  const files = useFileStore((s) => s.files);

  return useMemo(() => {
    const set = new Set(selectedPaths);
    return files.filter((f) => set.has(f.path));
  }, [selectedPaths, files]);
}

const useSelectedSet = (): Set<string> => {
  const selectedPaths = useFileStore((s) => s.selectedPaths);
  return useMemo(() => new Set(selectedPaths), [selectedPaths]);
};

export function useIsSelected(path: string): boolean {
  const selectedSet = useSelectedSet();
  return selectedSet.has(path);
}

export function useSelectionCount(): number {
  return useFileStore((s) => s.selectedPaths.length);
}
