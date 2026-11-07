export const OVERVIEW_HIDDEN_STORAGE_KEY = 'czaba-studio-overview-hidden';

const overviewVisibilityListeners = new Set<() => void>();
let overviewHiddenInMemory: boolean | null = null;

export function readOverviewHidden(): boolean {
  if (overviewHiddenInMemory !== null) {
    return overviewHiddenInMemory;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(OVERVIEW_HIDDEN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeOverviewHidden(hidden: boolean): void {
  try {
    if (hidden) {
      window.localStorage.setItem(OVERVIEW_HIDDEN_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(OVERVIEW_HIDDEN_STORAGE_KEY);
    }
  } catch {
    return;
  }
}

export function setOverviewHidden(hidden: boolean): void {
  overviewHiddenInMemory = hidden;
  writeOverviewHidden(hidden);
  for (const listener of overviewVisibilityListeners) {
    listener();
  }
}

export function subscribeOverviewVisibility(listener: () => void): () => void {
  overviewVisibilityListeners.add(listener);
  return () => {
    overviewVisibilityListeners.delete(listener);
  };
}
