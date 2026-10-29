# Usage: python3 -I mutate251.py <scratch-root> <MUTANT>
import sys, pathlib
root = pathlib.Path(sys.argv[1]); m = sys.argv[2]
def sub(path, old, new):
    p = root / path; t = p.read_text(encoding='utf-8')
    assert t.count(old) == 1, (m, path, old[:60], t.count(old)); p.write_text(t.replace(old, new), encoding='utf-8')
LP = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
CX = 'app/contexts/ArrangementContext.tsx'
SW = 'app/components/arrangement/StudioWorkspace.tsx'
MR = 'app/components/arrangement/ArrangementMarkerRow.tsx'
if m == 'FIX-CONTROL':
    pass
elif m == 'MU-CAPTION-POSITION':
    sub(LP, "  useArrangementInsertMarkerStore,\n} from '~/contexts/ArrangementContext';", "  useArrangementInsertMarkerStore,\n  useArrangementPositionStore,\n} from '~/contexts/ArrangementContext';")
    sub(LP, "  const insertMarkerStore = useArrangementInsertMarkerStore();\n  const textRef", "  useArrangementInsertMarkerStore();\n  const insertMarkerStore = useArrangementPositionStore();\n  const textRef")
elif m == 'MU-CAPTION-REACT-STATE':
    sub(LP, "  const textRef = useRef<HTMLSpanElement>(null);\n  useEffect(() => {\n    const writeLibraryInsertMarkerText", "  const textRef = useRef<HTMLSpanElement>(null);\n  const [, setTick] = useState(0);\n  useEffect(() => insertMarkerStore.subscribePosition(() => setTick((n) => n + 1)), [insertMarkerStore]);\n  useEffect(() => {\n    const writeLibraryInsertMarkerText")
elif m == 'MU-CAPTION-STATIC':
    sub(LP, "    return insertMarkerStore.subscribePosition(writeLibraryInsertMarkerText);\n", "    return undefined;\n")
elif m == 'MU-PASTE-SPLIT-LOCATOR':
    sub(CX, "      const time = insertMarkerRef.current;", "      const time = isPlayingRef.current ? livePosition() : insertMarkerRef.current;")
    sub(CX, "    const time = insertMarkerRef.current;", "    const time = isPlayingRef.current ? livePosition() : insertMarkerRef.current;")
    sub(CX, "    const at = insertMarkerRef.current;", "    const at = isPlayingRef.current ? livePosition() : insertMarkerRef.current;")
elif m == 'MU-PASTE-LOCATOR':
    sub(CX, "    const at = insertMarkerRef.current;", "    const at = isPlayingRef.current ? livePosition() : insertMarkerRef.current;")
elif m == 'MU-SPLIT-LOCATOR':
    sub(CX, "      const time = insertMarkerRef.current;", "      const time = isPlayingRef.current ? livePosition() : insertMarkerRef.current;")
    sub(CX, "    const time = insertMarkerRef.current;", "    const time = isPlayingRef.current ? livePosition() : insertMarkerRef.current;")
elif m == 'MU-M-NO-RANGE':
    sub(MR, "roundMarkerTime(range ? Math.min(range.start, range.end) : getLocatorPosition())", "roundMarkerTime(getLocatorPosition())")
elif m == 'MU-GESTURE-CS-NO-PREVENT':
    sub(SW, "        if (modifier && event.shiftKey && !event.altKey) {\n          event.preventDefault();\n          if (!event.repeat && !current.isPointerGestureActive()) {", "        if (modifier && event.shiftKey && !event.altKey) {\n          if (!current.isPointerGestureActive()) {\n            event.preventDefault();\n          }\n          if (!event.repeat && !current.isPointerGestureActive()) {")
elif m == 'MU-GESTURE-HOME-NO-PREVENT':
    sub(SW, "      if (event.key === 'Home' && !isSliderTarget(event.target)) {\n        event.preventDefault();\n        if (", "      if (event.key === 'Home' && !isSliderTarget(event.target)) {\n        if (!current.isPointerGestureActive()) {\n          event.preventDefault();\n        }\n        if (")
else:
    raise SystemExit('unknown ' + m)
print('mutated', m)
