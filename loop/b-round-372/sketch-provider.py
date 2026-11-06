import sys
p=sys.argv[1]+'/app/contexts/ArrangementContext.tsx'
s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    assert n==count,(old[:80],n)
    s=s.replace(old,new)
rep("""  pxPerSecond: number;
  status: string;
  statusSequence: number;
  statusKey: string;
""","""  pxPerSecond: number;
""")
rep("  getStatusPreviewText: () => string | null;\n","  getStatusPreviewText: () => string | null;\n  getStatus: () => string;\n")
rep("""interface ProviderStatusEntry extends ArrangementStatusEntry {
  readonly previewKey: string | null;
}

type ProviderStatusAction =
  | ArrangementStatusUpdate
  | { readonly adoptPreview: ArrangementStatusPreview };

""","")
rep("""  const [statusPreviewStore] = useState(() => createArrangementStatusPreviewStore());""",
"""  const [statusPreviewStore] = useState(() =>
    createArrangementStatusPreviewStore(workspaceCollectionCopy(collection.origin).loading),
  );""")
old_start=s.index("  const [statusEntry, dispatchStatus] = useReducer(")
old_end=s.index("  const [sourceStates, setSourceStatesState]")
new='''  const lastNonRefusalStatusRef = useRef(statusPreviewStore.getState().committed.text);
  const setStatus = useCallback(
    (update: ArrangementStatusUpdate) => {
      const store = statusPreviewStore.getState();
      const pending = store.preview;
      if (
        pending &&
        pending.sequence > store.adoptedPreviewSequence &&
        gestureRefusalPrefix(pending.text) === null
      ) {
        lastNonRefusalStatusRef.current = pending.text;
      }
      store.commitStatus(update, gestureCountRef.current > 0);
      const committed = statusPreviewStore.getState().committed.text;
      if (gestureRefusalPrefix(committed) === null) {
        lastNonRefusalStatusRef.current = committed;
      }
    },
    [statusPreviewStore],
  );
  const previewStatus = useCallback(
    (text: string) => {
      const state = statusPreviewStore.getState();
      if (state.preview === null && text === state.committed.text) {
        return;
      }
      state.showPreview(text);
    },
    [statusPreviewStore],
  );
  const getStatusPreviewText = useCallback(
    () => statusPreviewStore.getState().preview?.text ?? null,
    [statusPreviewStore],
  );
  const getStatus = useCallback(
    () => statusPreviewStore.getState().committed.text,
    [statusPreviewStore],
  );
'''
s=s[:old_start]+new+s[old_end:]
rep("""      status,
      statusSequence,
      statusKey,
""","",2)
rep("      getStatusPreviewText,\n","      getStatusPreviewText,\n      getStatus,\n",2)
# imports
rep("  type ArrangementStatusEntry,\n","")
rep("  createArrangementStatusEntry,\n  reduceArrangementStatus,\n","")
rep("  type ArrangementStatusPreview,\n","")
rep("  statusPreviewKey,\n} from '~/lib/arrangement/status-preview-store';","} from '~/lib/arrangement/status-preview-store';")
open(p,'w').write(s)
