import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel
    s = p.read_text()
    n = s.count(old)
    if n != count:
        raise SystemExit(f'{rel}: expected {count} hit(s) of {old[:60]!r}, got {n}')
    p.write_text(s.replace(old, new))
C = 'app/contexts/ArrangementContext.tsx'
sub(C, "} from '~/lib/arrangement/preview-store';\n",
    "} from '~/lib/arrangement/preview-store';\nimport {\n  type ArrangementStatusPreviewState,\n  type ArrangementStatusPreviewStore,\n  createArrangementStatusPreviewStore,\n} from '~/lib/arrangement/status-preview-store';\n")
sub(C, "  previewClipGeometry: (next: Arrangement) => void;\n",
    "  previewClipGeometry: (next: Arrangement) => void;\n  previewStatus: (text: string) => void;\n")
sub(C, "const ArrangementPreviewContext = createContext<ArrangementPreviewStore | null>(null);\n",
    "const ArrangementPreviewContext = createContext<ArrangementPreviewStore | null>(null);\nconst ArrangementStatusPreviewContext = createContext<ArrangementStatusPreviewStore | null>(null);\n")
sub(C, "  const [previewStore] = useState(() => createArrangementPreviewStore());\n",
    "  const [previewStore] = useState(() => createArrangementPreviewStore());\n  const [statusPreviewStore] = useState(() => createArrangementStatusPreviewStore());\n")
sub(C, "  const lastNonRefusalStatusRef = useRef(status);\n",
    "  const lastNonRefusalStatusRef = useRef(status);\n  const statusSequenceRef = useRef(statusSequence);\n  useIsomorphicLayoutEffect(() => {\n    statusSequenceRef.current = statusSequence;\n  }, [statusSequence]);\n")
sub(C, """      if (gestureCountRef.current === 0) {
        previewActiveRef.current = false;
        if (historyRef.current !== publishedHistoryRef.current) {
          updateHistory(historyRef.current);
        }
""", """      if (gestureCountRef.current === 0) {
        previewActiveRef.current = false;
        if (historyRef.current !== publishedHistoryRef.current) {
          updateHistory(historyRef.current);
        }
        const pendingStatus = statusPreviewStore.getState().preview;
        statusPreviewStore.getState().clearPreview();
        if (pendingStatus && pendingStatus.baseSequence === statusSequenceRef.current) {
          setStatus(pendingStatus.text);
        }
""")
sub(C, "  }, [rewriteStoppedTruth, updateHistory]);\n",
    "  }, [rewriteStoppedTruth, statusPreviewStore, updateHistory]);\n")
sub(C, """  const commitArrangement = useCallback(
    (next: Arrangement, label: string, before: Arrangement) => {""",
"""  const previewStatus = useCallback(
    (text: string) => {
      statusPreviewStore.getState().showPreview(text, statusSequenceRef.current);
    },
    [statusPreviewStore],
  );

  const commitArrangement = useCallback(
    (next: Arrangement, label: string, before: Arrangement) => {""")
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
sub(W, "          <span key={statusSequence}>{status}</span>\n",
    "          <ArrangementStatusText status={status} statusSequence={statusSequence} />\n")
sub(W, "  useArrangementPreview,\n", "  useArrangementPreview,\n  useArrangementStatusPreview,\n")
p = root / W
s = p.read_text()
marker = "\nexport function StudioWorkspace"
if s.count(marker) != 1:
    raise SystemExit('StudioWorkspace export marker count %d' % s.count(marker))
s = s.replace(marker, """
function ArrangementStatusTextInner({
  status,
  statusSequence,
}: {
  status: string;
  statusSequence: number;
}) {
  const preview = useArrangementStatusPreview((state) =>
    selectShownStatusPreview(state.preview, statusSequence),
  );
  return preview ? (
    <span key={`preview-${preview.sequence}`}>{preview.text}</span>
  ) : (
    <span key={statusSequence}>{status}</span>
  );
}

const ArrangementStatusText = memo(ArrangementStatusTextInner);
""" + marker, 1)
s = s.replace("import {", "import { selectShownStatusPreview } from '~/lib/arrangement/status-preview-store';\nimport {", 1)
p.write_text(s)
print('sketch applied')
