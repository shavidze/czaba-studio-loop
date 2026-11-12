const LIBRARY_NOTICE_STORAGE_PREFIX = 'czaba-studio-notice-dismissed:';

const libraryNoticeListeners = new Set<() => void>();
const libraryNoticeDismissedInMemory = new Set<string>();

export function libraryNoticeStorageKey(collectionId: string): string {
  return `${LIBRARY_NOTICE_STORAGE_PREFIX}${collectionId}`;
}

export function readLibraryNoticeDismissed(collectionId: string): boolean {
  if (libraryNoticeDismissedInMemory.has(collectionId)) {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(libraryNoticeStorageKey(collectionId)) === '1';
  } catch {
    return false;
  }
}

function writeLibraryNoticeDismissed(collectionId: string): void {
  try {
    window.localStorage.setItem(libraryNoticeStorageKey(collectionId), '1');
  } catch {
    return;
  }
}

export function dismissLibraryNotice(collectionId: string): void {
  libraryNoticeDismissedInMemory.add(collectionId);
  writeLibraryNoticeDismissed(collectionId);
  for (const listener of libraryNoticeListeners) {
    listener();
  }
}

export function subscribeLibraryNoticeDismissal(listener: () => void): () => void {
  libraryNoticeListeners.add(listener);
  return () => {
    libraryNoticeListeners.delete(listener);
  };
}
