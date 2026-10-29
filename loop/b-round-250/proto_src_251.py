# B round 250 -> 251 pre-check: source change on a scratch copy. Usage: python3 -I proto_src_251.py <scratch-root>
import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(path, old, new, count=1):
    p = root / path
    t = p.read_text(encoding='utf-8')
    assert t.count(old) == count, (path, old[:60], t.count(old))
    p.write_text(t.replace(old, new), encoding='utf-8')
P = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
sub(P, """  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';""", """  useArrangement,
  useArrangementInsertMarkerStore,
} from '~/contexts/ArrangementContext';""")
sub(P, """function LibraryPlayheadText() {
  const positionStore = useArrangementPositionStore();
  const textRef = useRef<HTMLSpanElement>(null);
  const writeLibraryPlayheadText = useCallback((position: number) => {
    const span = textRef.current;
    if (!span) {
      return;
    }
    const text = formatArrangementTime(position);
    if (span.textContent !== text) {
      span.textContent = text;
    }
  }, []);
  useArrangementPositionWriter(writeLibraryPlayheadText);
  return (
    <span
      ref={textRef}
      className="font-mono tabular-nums"
      data-testid="arrangement-library-playhead"
    >
      {formatArrangementTime(positionStore.getPosition())}
    </span>
  );
}

const LibraryPlayheadTextMemo = memo(LibraryPlayheadText);""", """function LibraryInsertMarkerText() {
  const insertMarkerStore = useArrangementInsertMarkerStore();
  const textRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const writeLibraryInsertMarkerText = () => {
      const span = textRef.current;
      if (!span) {
        return;
      }
      const text = formatArrangementTime(insertMarkerStore.getPosition());
      if (span.textContent !== text) {
        span.textContent = text;
      }
    };
    writeLibraryInsertMarkerText();
    return insertMarkerStore.subscribePosition(writeLibraryInsertMarkerText);
  }, [insertMarkerStore]);
  return (
    <span
      ref={textRef}
      className="font-mono tabular-nums"
      data-testid="arrangement-library-insert-marker"
    >
      {formatArrangementTime(insertMarkerStore.getPosition())}
    </span>
  );
}

const LibraryInsertMarkerTextMemo = memo(LibraryInsertMarkerText);""")
sub(P, """        · playhead <LibraryPlayheadTextMemo />""", """        · {studioLibraryPanelStrings.insertMarker} <LibraryInsertMarkerTextMemo />""")
S = 'app/lib/arrangement/strings.ts'
sub(S, """  videoTrackNote: ' (audio is not added here)',
""", """  videoTrackNote: ' (audio is not added here)',
  insertMarker: 'insert marker',
""")
print('ok')
