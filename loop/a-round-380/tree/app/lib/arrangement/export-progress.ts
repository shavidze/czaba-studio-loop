import { studioExportStrings } from './strings';

export type ArrangementExportProgressPhase = 'render' | 'wav' | 'load' | 'mp3';

export interface ArrangementExportProgress {
  phase: ArrangementExportProgressPhase;
  fraction: number | null;
}

export interface ArrangementExportProgressStore {
  getProgress: () => ArrangementExportProgress | null;
  setProgress: (next: ArrangementExportProgress | null) => void;
  subscribeProgress: (listener: () => void) => () => void;
}

const RENDER_QUANTUM_FRAMES = 128;

export function arrangementRenderSuspendFrames(length: number, steps = 20): number[] {
  if (!Number.isFinite(length) || length <= 0) {
    return [];
  }
  const frames = new Set<number>();
  for (let k = 1; k < steps; k++) {
    const frame = Math.floor((length * k) / steps / RENDER_QUANTUM_FRAMES) * RENDER_QUANTUM_FRAMES;
    if (frame > 0 && frame < length) {
      frames.add(frame);
    }
  }
  return [...frames].sort((a, b) => a - b);
}

function progressPercent(progress: ArrangementExportProgress): number | null {
  return progress.fraction === null ? null : Math.floor(progress.fraction * 100);
}

export function createArrangementExportProgressStore(): ArrangementExportProgressStore {
  let current: ArrangementExportProgress | null = null;
  const listeners = new Set<() => void>();
  return {
    getProgress: () => current,
    setProgress: (next) => {
      let normalized: ArrangementExportProgress | null = null;
      if (next) {
        if (next.fraction !== null && !Number.isFinite(next.fraction)) {
          return;
        }
        normalized = {
          phase: next.phase,
          fraction: next.fraction === null ? null : Math.min(1, Math.max(0, next.fraction)),
        };
      }
      const isSame =
        normalized === null || current === null
          ? normalized === current
          : normalized.phase === current.phase &&
            progressPercent(normalized) === progressPercent(current);
      if (isSame) {
        return;
      }
      current = normalized;
      for (const listener of [...listeners]) {
        listener();
      }
    },
    subscribeProgress: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function formatArrangementExportProgress(progress: ArrangementExportProgress): string {
  const percent = progressPercent(progress) ?? 0;
  switch (progress.phase) {
    case 'render':
      return studioExportStrings.progressRendering(percent);
    case 'wav':
      return studioExportStrings.progressWavWrite(percent);
    case 'load':
      return studioExportStrings.progressEncoderLoad;
    case 'mp3':
      return studioExportStrings.progressMp3Encode(percent);
  }
}
