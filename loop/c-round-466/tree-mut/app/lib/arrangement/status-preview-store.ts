import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  type ArrangementStatusUpdate,
  reduceArrangementStatus,
} from '~/lib/arrangement/status-announcement';

export interface ArrangementStatusPreview {
  readonly text: string;
  readonly sequence: number;
}

export interface ArrangementCommittedStatus {
  readonly text: string;
  readonly sequence: number;
  readonly key: string;
}

export interface ArrangementStatusPreviewState {
  preview: ArrangementStatusPreview | null;
  written: number;
  committed: ArrangementCommittedStatus;
  adoptedPreviewSequence: number;
  showPreview: (text: string) => void;
  clearPreview: () => void;
  commitStatus: (update: ArrangementStatusUpdate, gestureActive: boolean) => void;
}

export type ArrangementStatusPreviewStore = StoreApi<ArrangementStatusPreviewState>;

export function statusPreviewKey(preview: ArrangementStatusPreview): string {
  return `preview-${preview.sequence}`;
}

function adoptPendingPreview(
  state: ArrangementStatusPreviewState,
): Pick<ArrangementStatusPreviewState, 'committed' | 'adoptedPreviewSequence'> {
  const pending = state.preview;
  if (!pending || pending.sequence <= state.adoptedPreviewSequence) {
    return { committed: state.committed, adoptedPreviewSequence: state.adoptedPreviewSequence };
  }
  return {
    committed: {
      text: pending.text,
      sequence: state.committed.sequence + 1,
      key: statusPreviewKey(pending),
    },
    adoptedPreviewSequence: pending.sequence,
  };
}

export function createArrangementStatusPreviewStore(
  initialText = '',
): ArrangementStatusPreviewStore {
  return createStore<ArrangementStatusPreviewState>()((set) => ({
    preview: null,
    written: 0,
    committed: { text: initialText, sequence: 0, key: '0' },
    adoptedPreviewSequence: 0,
    showPreview: (text) =>
      set((state) =>
        state.preview?.text === text
          ? state
          : { preview: { text, sequence: state.written + 1 }, written: state.written + 1 },
      ),
    clearPreview: () => set((state) => (state.preview === null ? state : { preview: null })),
    commitStatus: (update, gestureActive) =>
      set((state) => {
        const adopted = adoptPendingPreview(state);
        const reduced = reduceArrangementStatus(adopted.committed, update, gestureActive);
        const committed =
          reduced === adopted.committed
            ? adopted.committed
            : { text: reduced.text, sequence: reduced.sequence, key: String(reduced.sequence) };
        const preview =
          state.preview && state.preview.sequence <= adopted.adoptedPreviewSequence
            ? null
            : state.preview;
        if (committed === state.committed && preview === state.preview) {
          return state;
        }
        return { committed, preview, adoptedPreviewSequence: adopted.adoptedPreviewSequence };
      }),
  }));
}
