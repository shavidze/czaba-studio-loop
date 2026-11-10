export interface ZoomProbeCounts {
  pathRewrites: number;
  rulerMutations: number;
  connected: boolean;
}

interface ZoomProbeState {
  connected: boolean;
  flush: () => void;
  counts: { pathRewrites: number; rulerMutations: number };
  disconnect: () => void;
}

declare global {
  interface Window {
    __czabaZoomProbe?: ZoomProbeState;
  }
}

export function installZoomProbe(): void {
  window.__czabaZoomProbe?.disconnect();
  const counts = { pathRewrites: 0, rulerMutations: 0 };
  const tally = (records: readonly MutationRecord[]): void => {
    for (const record of records) {
      const target = record.target;
      if (!(target instanceof Element)) continue;
      if (record.type === 'attributes') {
        if (
          record.attributeName === 'd' &&
          target.tagName.toLowerCase() === 'path' &&
          target.closest('[data-testid="arrangement-clip-waveform"]') !== null
        ) {
          counts.pathRewrites += 1;
        }
      } else if (
        record.type === 'childList' &&
        target.closest('[data-testid="arrangement-ruler"]') !== null
      ) {
        counts.rulerMutations += record.addedNodes.length + record.removedNodes.length;
      }
    }
  };
  const observer = new MutationObserver(tally);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['d'],
  });
  const state: ZoomProbeState = {
    connected: true,
    counts,
    flush: () => {
      if (state.connected) tally(observer.takeRecords());
    },
    disconnect: () => {
      if (!state.connected) return;
      observer.disconnect();
      state.connected = false;
      counts.pathRewrites = 0;
      counts.rulerMutations = 0;
    },
  };
  window.__czabaZoomProbe = state;
}

export function readZoomProbe(): ZoomProbeCounts {
  const state = window.__czabaZoomProbe;
  if (!state) return { pathRewrites: 0, rulerMutations: 0, connected: false };
  state.flush();
  return { ...state.counts, connected: state.connected };
}

export function resetZoomProbe(): void {
  const state = window.__czabaZoomProbe;
  if (!state) return;
  state.flush();
  state.counts.pathRewrites = 0;
  state.counts.rulerMutations = 0;
}

export function disconnectZoomProbe(): void {
  window.__czabaZoomProbe?.disconnect();
}
