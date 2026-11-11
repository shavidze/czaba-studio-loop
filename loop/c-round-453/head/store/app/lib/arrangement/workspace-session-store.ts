import { createStore, type StoreApi } from 'zustand/vanilla';
import type { GridMode, MusicalGridDivisionId } from './grid-divisions';

export interface WorkspaceTempoGridSnapshot {
  readonly tempoBpm: number | null;
  readonly tempoSeedOpen: boolean;
  readonly gridHandChosen: boolean;
  readonly snapHandChosen: boolean;
  readonly snapEnabled: boolean;
  readonly secondsGridDivision: number;
  readonly musicalGridDivision: MusicalGridDivisionId | null;
  readonly gridMode: GridMode;
  readonly gridDensity: number;
  readonly metronomeOn: boolean;
}

export interface ArrangementWorkspaceSessionState {
  tempoGrid: WorkspaceTempoGridSnapshot | null;
  saveTempoGrid: (next: WorkspaceTempoGridSnapshot) => void;
}

export type ArrangementWorkspaceSessionStore = StoreApi<ArrangementWorkspaceSessionState>;

export function createArrangementWorkspaceSessionStore(): ArrangementWorkspaceSessionStore {
  return createStore<ArrangementWorkspaceSessionState>()((set) => ({
    tempoGrid: null,
    saveTempoGrid: (next) => set({ tempoGrid: next }),
  }));
}
