import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel
    s = p.read_text()
    n = s.count(old)
    if n != count:
        raise SystemExit(f'{rel}: expected {count} hit(s) of {old[:70]!r}, got {n}')
    p.write_text(s.replace(old, new))
(root / 'app/lib/arrangement/status-preview-store.ts').write_text("""import { createStore, type StoreApi } from 'zustand/vanilla';

export interface ArrangementStatusPreview {
  readonly text: string;
  readonly sequence: number;
}

export interface ArrangementStatusPreviewState {
  preview: ArrangementStatusPreview | null;
  written: number;
  showPreview: (text: string) => void;
  clearPreview: () => void;
}

export type ArrangementStatusPreviewStore = StoreApi<ArrangementStatusPreviewState>;

export function createArrangementStatusPreviewStore(): ArrangementStatusPreviewStore {
  return createStore<ArrangementStatusPreviewState>()((set) => ({
    preview: null,
    written: 0,
    showPreview: (text) =>
      set((state) =>
        state.preview?.text === text
          ? state
          : { preview: { text, sequence: state.written + 1 }, written: state.written + 1 },
      ),
    clearPreview: () => set((state) => (state.preview === null ? state : { preview: null })),
  }));
}

export function statusPreviewKey(preview: ArrangementStatusPreview): string {
  return `preview-${preview.sequence}`;
}
""")
C = 'app/contexts/ArrangementContext.tsx'
sub(C, "} from '~/lib/arrangement/preview-store';\n",
    "} from '~/lib/arrangement/preview-store';\nimport {\n  type ArrangementStatusPreview,\n  type ArrangementStatusPreviewState,\n  type ArrangementStatusPreviewStore,\n  createArrangementStatusPreviewStore,\n  statusPreviewKey,\n} from '~/lib/arrangement/status-preview-store';\n")
sub(C, "  previewClipGeometry: (next: Arrangement) => void;\n",
    "  previewClipGeometry: (next: Arrangement) => void;\n  previewStatus: (text: string) => void;\n")
sub(C, "  statusSequence: number;\n", "  statusSequence: number;\n  statusKey: string;\n")
sub(C, "const ArrangementPreviewContext = createContext<ArrangementPreviewStore | null>(null);\n",
    "const ArrangementPreviewContext = createContext<ArrangementPreviewStore | null>(null);\nconst ArrangementStatusPreviewContext = createContext<ArrangementStatusPreviewStore | null>(null);\n\ninterface ProviderStatusEntry extends ArrangementStatusEntry {\n  readonly previewKey: string | null;\n}\n\ntype ProviderStatusAction = ArrangementStatusUpdate | { readonly adoptPreview: ArrangementStatusPreview };\n")
sub(C, "  const [previewStore] = useState(() => createArrangementPreviewStore());\n",
    "  const [previewStore] = useState(() => createArrangementPreviewStore());\n  const [statusPreviewStore] = useState(() => createArrangementStatusPreviewStore());\n")
sub(C, """  const [statusEntry, setStatus] = useReducer(
    (previous: ArrangementStatusEntry, next: ArrangementStatusUpdate) =>
      reduceArrangementStatus(previous, next, gestureCountRef.current > 0),
    collection.origin,
    (origin) => createArrangementStatusEntry(workspaceCollectionCopy(origin).loading),
  );
  const status = statusEntry.text;
  const statusSequence = statusEntry.sequence;
  const lastNonRefusalStatusRef = useRef(status);
""", """  const [statusEntry, dispatchStatus] = useReducer(
    (previous: ProviderStatusEntry, action: ProviderStatusAction): ProviderStatusEntry => {
      if (typeof action === 'object') {
        return {
          text: action.adoptPreview.text,
          sequence: previous.sequence + 1,
          previewKey: statusPreviewKey(action.adoptPreview),
        };
      }
      const next = reduceArrangementStatus(previous, action, gestureCountRef.current > 0);
      return next === previous ? previous : { ...next, previewKey: null };
    },
    collection.origin,
    (origin): ProviderStatusEntry => ({
      ...createArrangementStatusEntry(workspaceCollectionCopy(origin).loading),
      previewKey: null,
    }),
  );
  const status = statusEntry.text;
  const statusSequence = statusEntry.sequence;
  const statusKey = statusEntry.previewKey ?? String(statusSequence);
  const lastNonRefusalStatusRef = useRef(status);
  const flushStatusPreview = useCallback(() => {
    const pending = statusPreviewStore.getState().preview;
    if (!pending) {
      return;
    }
    statusPreviewStore.getState().clearPreview();
    if (gestureRefusalPrefix(pending.text) === null) {
      lastNonRefusalStatusRef.current = pending.text;
    }
    dispatchStatus({ adoptPreview: pending });
  }, [statusPreviewStore]);
  const setStatus = useCallback(
    (update: ArrangementStatusUpdate) => {
      flushStatusPreview();
      dispatchStatus(update);
    },
    [flushStatusPreview],
  );
  const previewStatus = useCallback(
    (text: string) => {
      statusPreviewStore.getState().showPreview(text);
    },
    [statusPreviewStore],
  );
""")
sub(C, "      statusSequence,\n", "      statusSequence,\n      statusKey,\n", count=2)
sub(C, "      previewClipGeometry,\n", "      previewClipGeometry,\n      previewStatus,\n", count=2)
sub(C, "              <ArrangementPreviewContext.Provider value={previewStore}>\n",
    "              <ArrangementPreviewContext.Provider value={previewStore}>\n                <ArrangementStatusPreviewContext.Provider value={statusPreviewStore}>\n")
sub(C, "              </ArrangementPreviewContext.Provider>\n",
    "                </ArrangementStatusPreviewContext.Provider>\n              </ArrangementPreviewContext.Provider>\n")
sub(C, "export function useArrangementPreviewLaneClips(",
"""export function useArrangementStatusPreview<Selected>(
  selector: (state: ArrangementStatusPreviewState) => Selected,
): Selected {
  const store = useContext(ArrangementStatusPreviewContext);
  if (!store) {
    throw new Error('useArrangementStatusPreview must be used within an ArrangementProvider');
  }
  return useStore(store, selector);
}

export function useArrangementPreviewLaneClips(""")
L = 'app/components/arrangement/ArrangementLane.tsx'
sub(L, "    previewClipGeometry,\n    commitArrangement,\n", "    previewClipGeometry,\n    previewStatus,\n    commitArrangement,\n")
sub(L, "              previewClipGeometry={previewClipGeometry}\n", "              previewClipGeometry={previewClipGeometry}\n              previewStatus={previewStatus}\n")
K = 'app/components/arrangement/ArrangementClip.tsx'
sub(K, "  previewClipGeometry?: (next: Arrangement) => void;\n", "  previewClipGeometry?: (next: Arrangement) => void;\n  previewStatus?: (text: string) => void;\n")
sub(K, "  previewClipGeometry,\n  commitArrangement,\n", "  previewClipGeometry,\n  previewStatus,\n  commitArrangement,\n")
sub(K, """      const next = setFade(gesture.before, gesture.original.id, fadeEdge, seconds);
      previewArrangement(next);
      const faded = next.clips.find((entry) => entry.id === gesture.original.id);
      setStatus(
        studioClipStrings.fadePreview(
          fadeLabels[fadeEdge],
          (faded ? clipFadeSeconds(faded, fadeEdge) : 0).toFixed(3),
        ),
      );
      return;""", """      const next = setFade(gesture.before, gesture.original.id, fadeEdge, seconds);
      previewGeometry(next);
      const faded = next.clips.find((entry) => entry.id === gesture.original.id);
      const text = studioClipStrings.fadePreview(
        fadeLabels[fadeEdge],
        (faded ? clipFadeSeconds(faded, fadeEdge) : 0).toFixed(3),
      );
      if (previewStatus && !isVideo) {
        previewStatus(text);
      } else {
        setStatus(text);
      }
      return;""")
W = 'app/components/arrangement/StudioWorkspace.tsx'
sub(W, "    statusSequence,\n", "    statusKey,\n")
sub(W, "          <span key={statusSequence}>{status}</span>\n",
    "          <ArrangementStatusText status={status} statusKey={statusKey} />\n")
sub(W, "  useArrangementPreview,\n", "  useArrangementPreview,\n  useArrangementStatusPreview,\n")
p = root / W
s = p.read_text()
marker = "\nexport function StudioWorkspace"
if s.count(marker) != 1:
    raise SystemExit('marker')
s = s.replace(marker, """
function ArrangementStatusTextInner({ status, statusKey }: { status: string; statusKey: string }) {
  const preview = useArrangementStatusPreview((state) => state.preview);
  return preview ? (
    <span key={statusPreviewKey(preview)}>{preview.text}</span>
  ) : (
    <span key={statusKey}>{status}</span>
  );
}

const ArrangementStatusText = memo(ArrangementStatusTextInner);
""" + marker, 1)
s = s.replace("import {", "import { statusPreviewKey } from '~/lib/arrangement/status-preview-store';\nimport {", 1)
p.write_text(s)
print('sketch v2 applied')
