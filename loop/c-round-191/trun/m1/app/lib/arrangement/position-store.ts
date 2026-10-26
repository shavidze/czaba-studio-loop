export interface ArrangementPositionStore {
  getPosition: () => number;
  setPosition: (next: number) => void;
  subscribePosition: (listener: () => void) => () => void;
}

export function createArrangementPositionStore(initial = 0): ArrangementPositionStore {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    getPosition: () => current,
    setPosition: (next) => {
      if (Object.is(next, current)) {
        return;
      }
      current = next;
      for (const listener of [...listeners]) {
        listener();
      }
    },
    subscribePosition: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
