import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel
    s = p.read_text()
    n = s.count(old)
    if n != count:
        raise SystemExit(f"{rel}: expected {count} of {old!r}, found {n}")
    p.write_text(s.replace(old, new))

# 1 new store module
(root / 'app/lib/arrangement/overview-visibility.ts').write_text('''export const OVERVIEW_HIDDEN_STORAGE_KEY = 'czaba-studio-overview-hidden';

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
''')

# 2 strings
sub('app/lib/arrangement/strings.ts',
"""  followOn: 'Follow on: the view follows the playback position during playback.',
""",
"""  followOn: 'Follow on: the view follows the playback position during playback.',
  overviewHidden: 'Overview hidden. Ctrl+Alt+O shows it again.',
  overviewShown: 'Overview shown. Ctrl+Alt+O hides it.',
""")

# 3 shortcuts
sub('app/lib/arrangement/shortcuts.ts',
"""      { id: 'overview-scroll', action: 'Overview: scroll 5 s', keys: ['← / → (overview focused)'] },
""",
"""      { id: 'overview-scroll', action: 'Overview: scroll 5 s', keys: ['← / → (overview focused)'] },
      {
        id: 'overview-toggle',
        action: 'Show / hide the overview',
        keys: ['Ctrl+Alt+O'],
        ariaKeyShortcuts: 'Control+Alt+O Meta+Alt+O',
      },
""")

# 4 overview
O = 'app/components/arrangement/ArrangementOverview.tsx'
sub(O, """  const roundedExtent = Math.round(extent);
""", """  const roundedExtent = Math.round(extent);
  const hasClips = arrangement.clips.length > 0;
""")
sub(O, """      className="relative h-16 w-full cursor-ew-resize touch-none overflow-hidden rounded-panel bg-background"
""", """      className={cn(
        'relative h-16 w-full cursor-ew-resize touch-none overflow-hidden rounded-panel',
        hasClips ? 'bg-background' : 'bg-transparent',
      )}
""")
sub(O, """      data-extent={extent.toFixed(3)}
    >
      <div className="pointer-events-none absolute inset-0 rounded-panel border border-outline" />
""", """      data-extent={extent.toFixed(3)}
      data-overview-state={hasClips ? 'full' : 'empty'}
    >
      {hasClips ? (
        <div className="pointer-events-none absolute inset-0 rounded-panel border border-outline" />
      ) : (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-outline"
          data-testid="arrangement-overview-baseline"
        />
      )}
""")
sub(O, """        className="pointer-events-none absolute inset-y-0 rounded-panel border border-foreground/70 bg-foreground/5"
""", """        className={cn(
          'pointer-events-none absolute inset-y-0 rounded-panel border border-foreground/70 bg-foreground/5',
          !hasClips && 'invisible',
        )}
""")
sub(O, """        className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent ring-1 ring-background"
""", """        className={cn(
          'pointer-events-none absolute inset-y-0 w-0.5 bg-accent ring-1 ring-background',
          !hasClips && 'invisible',
        )}
""")

# 5 dock GATE229-S2
sub('app/components/arrangement/ArrangementVideoDock.tsx',
 '<div className="flex min-h-4 items-baseline justify-between gap-2 text-xs leading-4 text-muted">',
 '<div className="flex min-h-4 items-baseline text-xs leading-4 text-muted">')

# 6 workspace
W = 'app/components/arrangement/StudioWorkspace.tsx'
sub(W, """  useRef,
  useState,
} from 'react';
""", """  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
""")
sub(W, """import { ArrangementOverview } from './ArrangementOverview';
""", """import {
  readOverviewHidden,
  setOverviewHidden,
  subscribeOverviewVisibility,
} from '~/lib/arrangement/overview-visibility';
import { ArrangementOverview } from './ArrangementOverview';
""")
sub(W, """  const [isShortcutSheetOpen, setIsShortcutSheetOpen] = useState(false);
""", """  const [isShortcutSheetOpen, setIsShortcutSheetOpen] = useState(false);
  const isOverviewHidden = useSyncExternalStore(
    subscribeOverviewVisibility,
    readOverviewHidden,
    () => false,
  );
""")
sub(W, """        event.preventDefault();
        returnFloatingVideo();
        return;
      }
      const current = workspaceRef.current;
""", """        event.preventDefault();
        returnFloatingVideo();
        return;
      }
      if (
        event.code === 'KeyO' &&
        event.altKey &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !event.getModifierState('AltGraph')
      ) {
        event.preventDefault();
        if (event.repeat || workspaceRef.current.isPointerGestureActive()) {
          return;
        }
        const hidden = !readOverviewHidden();
        setOverviewHidden(hidden);
        workspaceRef.current.setStatus(
          hidden ? studioViewStrings.overviewHidden : studioViewStrings.overviewShown,
        );
        return;
      }
      const current = workspaceRef.current;
""")
sub(W, """            overview={
              <ArrangementOverview
""", """            overview={
              isOverviewHidden ? (
                <div
                  aria-hidden="true"
                  className="h-16 w-full"
                  data-testid="arrangement-overview-hidden-slot"
                />
              ) : (
              <ArrangementOverview
""")
sub(W, """                claimPointerGesture={claimPointerGesture}
              />
            }
            isVideoExpanded={isVideoExpanded}
""", """                claimPointerGesture={claimPointerGesture}
              />
              )
            }
            isVideoExpanded={isVideoExpanded}
""")
print('applied')
