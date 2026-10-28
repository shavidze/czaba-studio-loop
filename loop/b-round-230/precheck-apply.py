import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel
    s = p.read_text()
    n = s.count(old)
    if n != count:
        raise SystemExit(f'{rel}: expected {count} of {old!r}, found {n}')
    p.write_text(s.replace(old, new))
# strings.ts
sub('app/lib/arrangement/strings.ts', "  nothingSelected: 'Nothing selected',\n", '')
sub('app/lib/arrangement/strings.ts', "  noSelectionHint: 'Select a clip to see its details',",
    "  noSelectionHint: 'Select a clip to edit its time selection and Clip Gain.',")
sub('app/lib/arrangement/strings.ts', "  videoMuteTitle: `Mute — ${STUDIO_VIDEO_MIX_LABEL}`,\n",
    "  videoMuteTitle: `Mute — ${STUDIO_VIDEO_MIX_LABEL}`,\n  videoSoloTitle: `Solo — ${STUDIO_VIDEO_MIX_LABEL} (Ctrl/Cmd+click = add to solo)`,\n")
sub('app/lib/arrangement/strings.ts', "  videoEmptyHint: `use “${STUDIO_VIDEO_IMPORT_LABEL}” or drop a file here`,\n",
    "  videoEmptyHint: `use “${STUDIO_VIDEO_IMPORT_LABEL}” or drop a file here`,\n  audioEmptyHint: 'Drag a sound here, or press Enter to add it',\n")
sub('app/lib/arrangement/strings.ts', "  clearSearch: 'Clear search',\n",
    "  clearSearch: 'Clear search',\n  dismissNotice: 'Dismiss this notice',\n")
# collection.ts
sub('app/lib/arrangement/collection.ts', "import { studioLibraryPanelStrings, studioSourceLoadStrings } from './strings';",
    "import { studioSourceLoadStrings } from './strings';")
sub('app/lib/arrangement/collection.ts',
    "ready: `Demo collection ready. Choose a track and add a sound (Enter or ${studioLibraryPanelStrings.add}).`,",
    "ready: 'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.',")
sub('app/lib/arrangement/collection.ts',
    "ready: `Purchased collection ready. Choose a track and add a sound (Enter or ${studioLibraryPanelStrings.add}).`,",
    "ready:\n    'Purchased collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.',")
# demo notice
sub('app/data/studio-lab-demo.ts',
    "  notice:\n    'The stems are a synthetic demo — not CZABA catalogue stems and not parts extracted from a mix.',",
    "  notice: 'Synthetic demo stems — not CZABA catalogue audio.',")
# detail panel
d = 'app/components/arrangement/ArrangementDetailPanel.tsx'
sub(d, "const DETAIL_NOTHING_SELECTED = studioDetailStrings.nothingSelected;\n", '')
sub(d, "      ? studioDetailStrings.clipCount(group.count)\n      : DETAIL_NOTHING_SELECTED;",
    "      ? studioDetailStrings.clipCount(group.count)\n      : '';")
sub(d, '<p id={reasonId} className="text-dim" data-testid="arrangement-detail-reason">',
    "<p\n      id={reasonId}\n      className={cn('text-dim', isNoneState && 'sr-only')}\n      data-testid=\"arrangement-detail-reason\"\n    >")
sub(d, '<p id={clipGainReasonId} className="text-dim" data-testid="arrangement-detail-clip-gain-reason">',
    "<p\n      id={clipGainReasonId}\n      className={cn('text-dim', isNoneState && 'sr-only')}\n      data-testid=\"arrangement-detail-clip-gain-reason\"\n    >")
# lane
l = 'app/components/arrangement/ArrangementLane.tsx'
sub(l, "      title={isVideo ? studioLaneStrings.soloLabel(mixLabel) : studioLaneStrings.soloTitle}",
    "      title={isVideo ? studioLaneStrings.videoSoloTitle : studioLaneStrings.soloTitle}")
sub(l, "        {isFileDragOver ? (\n          <p\n            className=\"pointer-events-none sticky left-56 z-30",
    "        {!isVideo &&\n        isActive &&\n        density !== 'folded' &&\n        arrangement.clips.length === 0 &&\n        !isFileDragOver &&\n        libraryGhost === null ? (\n          <p\n            className=\"pointer-events-none sticky left-56 flex h-full max-w-md items-center px-3 text-sm text-muted\"\n            data-testid=\"arrangement-lane-empty-hint\"\n          >\n            {studioLaneStrings.audioEmptyHint}\n          </p>\n        ) : null}\n        {isFileDragOver ? (\n          <p\n            className=\"pointer-events-none sticky left-56 z-30")
# library notice module
(root / 'app/lib/arrangement/library-notice.ts').write_text('''const LIBRARY_NOTICE_STORAGE_PREFIX = 'czaba-studio-notice-dismissed:';

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

export function dismissLibraryNotice(collectionId: string): void {
  libraryNoticeDismissedInMemory.add(collectionId);
  try {
    window.localStorage.setItem(libraryNoticeStorageKey(collectionId), '1');
  } catch {
    // TODO: storage can be blocked (private mode); the notice then stays hidden for this page only.
  }
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
''')
lib = 'app/components/arrangement/ArrangementLibrary.tsx'
sub(lib, "import { studioLibraryPanelStrings, studioSourceLoadStrings } from '~/lib/arrangement/strings';",
    "import {\n  dismissLibraryNotice,\n  readLibraryNoticeDismissed,\n  subscribeLibraryNoticeDismissal,\n} from '~/lib/arrangement/library-notice';\nimport { studioLibraryPanelStrings, studioSourceLoadStrings } from '~/lib/arrangement/strings';")
sub(lib, "  const librarySearchInputRef = useRef<HTMLInputElement>(null);\n",
    "  const librarySearchInputRef = useRef<HTMLInputElement>(null);\n  const isNoticeDismissed = useSyncExternalStore(\n    subscribeLibraryNoticeDismissal,\n    () => readLibraryNoticeDismissed(collection.id),\n    () => false,\n  );\n")
sub(lib, '''            {collection.notice ? (
              <p className="text-xs text-muted" data-testid="arrangement-library-notice">
                {collection.notice}
              </p>
            ) : null}''', '''            {collection.notice && !isNoticeDismissed ? (
              <div className="flex items-start gap-1">
                <p className="min-w-0 flex-1 text-xs text-muted" data-testid="arrangement-library-notice">
                  {collection.notice}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    dismissLibraryNotice(collection.id);
                    librarySearchInputRef.current?.focus();
                  }}
                  aria-label={studioLibraryPanelStrings.dismissNotice}
                  title={studioLibraryPanelStrings.dismissNotice}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted hover:text-foreground"
                  data-testid="arrangement-library-notice-dismiss"
                >
                  <X className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            ) : null}''')
print('applied')
sub(lib, "  useState,\n} from 'react';", "  useState,\n  useSyncExternalStore,\n} from 'react';")
p = root / 'app/lib/arrangement/library-notice.ts'
s = p.read_text()
s = s.replace("""  libraryNoticeDismissedInMemory.add(collectionId);
  try {
    window.localStorage.setItem(libraryNoticeStorageKey(collectionId), '1');
  } catch {
    // TODO: storage can be blocked (private mode); the notice then stays hidden for this page only.
  }
""", """  libraryNoticeDismissedInMemory.add(collectionId);
  writeLibraryNoticeDismissed(collectionId);
""")
s = s.replace("export function dismissLibraryNotice", """function writeLibraryNoticeDismissed(collectionId: string): boolean {
  try {
    window.localStorage.setItem(libraryNoticeStorageKey(collectionId), '1');
    return true;
  } catch {
    return false;
  }
}

export function dismissLibraryNotice""")
p.write_text(s)
print('applied 2')
