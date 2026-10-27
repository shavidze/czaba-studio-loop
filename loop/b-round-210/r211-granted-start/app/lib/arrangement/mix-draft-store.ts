export interface ArrangementMixDraftStore {
  subscribe: (key: string, listener: () => void) => () => void;
  get: (key: string) => number | undefined;
  set: (key: string, value: number) => void;
  clear: (key: string) => void;
}

export const MASTER_GAIN_DRAFT_KEY = 'master';

export function trackVolumeDraftKey(trackId: string): string {
  return `track:${trackId}`;
}

export function groupVolumeDraftKey(groupId: string): string {
  return `group:${groupId}`;
}

export function trackPanDraftKey(trackId: string): string {
  return `pan:${trackId}`;
}

export function createArrangementMixDraftStore(): ArrangementMixDraftStore {
  const values = new Map<string, number>();
  const listeners = new Map<string, Set<() => void>>();
  const notify = (key: string) => {
    const keyed = listeners.get(key);
    if (!keyed) {
      return;
    }
    for (const listener of [...keyed]) {
      listener();
    }
  };
  return {
    subscribe: (key, listener) => {
      let keyed = listeners.get(key);
      if (!keyed) {
        keyed = new Set();
        listeners.set(key, keyed);
      }
      keyed.add(listener);
      return () => {
        const current = listeners.get(key);
        if (!current) {
          return;
        }
        current.delete(listener);
        if (current.size === 0) {
          listeners.delete(key);
        }
      };
    },
    get: (key) => values.get(key),
    set: (key, value) => {
      if (values.has(key) && Object.is(values.get(key), value)) {
        return;
      }
      values.set(key, value);
      notify(key);
    },
    clear: (key) => {
      if (!values.has(key)) {
        return;
      }
      values.delete(key);
      notify(key);
    },
  };
}
