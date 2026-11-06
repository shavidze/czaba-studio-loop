"""Apply one PERF-10b-i mutant to a sketch-applied scratch: python3 -I apply-mutant.py <scratch> <MU-id>."""
import sys, pathlib
root = pathlib.Path(sys.argv[1]); mu = sys.argv[2]
def sub(rel, old, new):
    p = root / rel; t = p.read_text(encoding='utf-8')
    assert t.count(old) == 1, (mu, rel, old[:70], t.count(old))
    p.write_text(t.replace(old, new), encoding='utf-8')
C = 'app/contexts/ArrangementContext.tsx'
W = 'app/components/arrangement/StudioWorkspace.tsx'
S = 'app/lib/arrangement/selection-store.ts'
if mu == 'MU-1':  # StudioWorkspace subscribes to the active track at its top (the field back in the workspace render)
    sub(W, "  const selectionStore = useArrangementSelectionStore();\n",
        "  const selectionStore = useArrangementSelectionStore();\n  useArrangementActiveTrackId();\n")
    sub(W, "  useArrangementClipLaneDrag,\n", "  useArrangementActiveTrackId,\n  useArrangementClipLaneDrag,\n")
elif mu == 'MU-2':  # a provider state mirror of the active track feeds the context value
    sub(C, "  const [selectionStore] = useState(() =>",
        "  const [activeTrackMirror, setActiveTrackMirror] = useState<string | null>(null);\n  const [selectionStore] = useState(() =>")
    sub(C, "      selectionStore.getState().setActiveTrackId(next);\n",
        "      selectionStore.getState().setActiveTrackId(next);\n      setActiveTrackMirror(next);\n")
    p = root / C; t = p.read_text(encoding='utf-8')
    anchor = "      selectedSourceId,\n      pxPerSecond,\n"
    i = t.index(anchor); j = t.index(anchor, i + 1)
    t = t[:j] + "      selectedSourceId,\n      activeTrackMirror,\n      pxPerSecond,\n" + t[j + len(anchor):]
    p.write_text(t, encoding='utf-8')
elif mu == 'MU-3':  # no equality guard in the store setter
    sub(S, "      set((state) => (state.activeTrackId === next ? state : { activeTrackId: next })),",
        "      set({ activeTrackId: next }),")
elif mu == 'MU-4':  # initial value = first track of any kind
    sub(C, "      history.present.tracks.find((track) => track.kind === 'audio')?.id ?? null,\n    ),\n  );",
        "      history.present.tracks[0]?.id ?? null,\n    ),\n  );")
elif mu == 'MU-5':  # paste reads a render-time snapshot of the active track
    sub(C, "  const [selectionStore] = useState(() =>",
        "  const activeTrackSnapshotRef = useRef<string | null>(null);\n  const [selectionStore] = useState(() =>")
    sub(C, "  const arrangement = history.present;\n  const end = useMemo(",
        "  activeTrackSnapshotRef.current = selectionStore.getState().activeTrackId;\n  const arrangement = history.present;\n  const end = useMemo(")
    sub(C, "      activeTrackId: selectionStore.getState().activeTrackId,\n      isSourceAvailable",
        "      activeTrackId: activeTrackSnapshotRef.current,\n      isSourceAvailable")
elif mu == 'MU-6':  # the collapsed-group leaf never reports the active track
    sub(W, "      state.activeTrackId !== null && activeCandidateTrackIds.includes(state.activeTrackId),",
        "      state.activeTrackId === '__never__' && activeCandidateTrackIds.length < 0,")
elif mu == 'MU-7':  # a delayed status write after every active-track change (an extra click commit)
    sub(C, "      selectionStore.getState().setActiveTrackId(next);\n",
        "      selectionStore.getState().setActiveTrackId(next);\n      window.setTimeout(() => setStatus(`mutant ${next}`), 100);\n")
else:
    sys.exit('unknown mutant')
print('applied', mu)
