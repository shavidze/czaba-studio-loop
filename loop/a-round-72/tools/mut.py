import subprocess, re, sys, shutil, pathlib
S = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-72/scratch')
STORE = pathlib.Path('/home/runner/czaba-project/store')
ROW='app/components/arrangement/ArrangementMarkerRow.tsx'
MK='app/lib/arrangement/markers.ts'
MODEL='app/lib/arrangement/model.ts'
CTX='app/contexts/ArrangementContext.tsx'
WS='app/components/arrangement/StudioWorkspace.tsx'
M = {
 'a': [(MODEL, """  return arrangement.markers === undefined
    ? next
    : replaceArrangementMarkers(next, remapMarkersAfterDeleteTime(arrangement.markers, a, b));""", "  return next;")],
 'b': [(MK, """      return [{ ...marker, time: roundMarkerTime(marker.time - length) }];
    }
    return [];""", """      return [{ ...marker, time: roundMarkerTime(marker.time - length) }];
    }
    return [{ ...marker, time: roundMarkerTime(a) }];""")],
 'c': [(MK, "marker.time > position + MARKER_TIME_EPS", "marker.time >= position - MARKER_TIME_EPS")],
 'd': [(MK, "return end > position + MARKER_TIME_EPS ? { time: end, marker: null } : null;", "return null;"),
       (MK, "return position > MARKER_TIME_EPS ? { time: 0, marker: null } : null;", "return null;")],
 'e': [(MK, "if (markers.length === 0) {", "if (markers.length < 0) {")],
 'f': [(CTX, "JSON.stringify([arrangement.clips, arrangement.loop]", "JSON.stringify([arrangement.clips, arrangement.loop, arrangement.markers]")],
 'g': [(ROW, "settleEditor(event.key === 'Enter' ? 'enter' : 'escape');", "settleEditor('enter');")],
 'h': [(ROW, """    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      event.stopPropagation();""", """    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();"""),
       (WS, "if (isRangeInputTarget(event.target) || isMarkerTarget(event.target)) {", "if (isRangeInputTarget(event.target)) {")],
 'i': [(ROW, "range ? Math.min(range.start, range.end) : getLivePosition()", "getLivePosition()")],
 'j': [(ROW, """                if (!isPlaying) {
                  togglePlayback();
                }""", "")],
 'k': [(MK, "  if (existing) {\n    return { arrangement: null, existing };", "  if (existing && Number.isNaN(0)) {\n    return { arrangement: null, existing };"),
       (ROW, "    const existing = markerAtTime(current, time);\n    if (existing) {", "    const existing = markerAtTime(current, time);\n    if (existing && Number.isNaN(0)) {")],
 'k1': [(MK, "  if (existing) {\n    return { arrangement: null, existing };", "  if (existing && Number.isNaN(0)) {\n    return { arrangement: null, existing };")],
 'l': [(WS, "            (key === 'm' ||\n              event.key === 'Delete' ||", "            (event.key === 'Delete' ||")],
 'm': [(ROW, "if (event.target !== event.currentTarget || event.ctrlKey", "if (event.ctrlKey")],
 'n': [(ROW, "if (settledRef.current || !editor) {", "if (!editor) {")],
 'o': [(ROW, """  const next = markers[index + 1];
  if (!next) {""", """  const next = undefined;
  if (!next) {""")],
 'p': [(WS, """        if (
          isSliderTarget(event.target) ||
          isSeparatorTarget(event.target) ||""", """        if (
          isSeparatorTarget(event.target) ||""")],
 'q': [(ROW, "onBlur={() => settleEditor('blur')}", "onBlur={() => undefined}")],
 'r': [(ROW, "if (reason === 'blur' && isPointerGestureActive()) {", "if (reason === 'blur' && Number.isNaN(0)) {")],
 's': [(ROW, "const moveFocus = reason !== 'blur';", "const moveFocus = true;")],
}
which = sys.argv[1:] or list(M)
for name in which:
    touched = set()
    ok = True
    for f, old, new in M[name]:
        p = S / f
        s = p.read_text()
        if s.count(old) != 1:
            print(name, 'PATTERN-MISMATCH', f, s.count(old)); ok = False; break
        p.write_text(s.replace(old, new)); touched.add(f)
    if ok:
        r = subprocess.run(['timeout','300','npx','vitest','run','app/lib/arrangement/__tests__/markers.test.ts','app/lib/arrangement/__tests__/markers-ui.test.tsx','--reporter=verbose'], cwd=S, capture_output=True, text=True)
        out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
        failed = sorted(set(re.findall(r'^\s*×\s+.*?>\s*(.*?)$', out, re.M)))
        tags = sorted(set(re.findall(r'\b(M[KU]\d+b?)\b', ' '.join(failed))))
        other = [t for t in failed if not re.search(r'\bM[KU]\d+', t)]
        summ = re.findall(r'Tests\s+.*', out)
        print(f"{name}: killed by {tags} other={other[:3]} | {summ[-1] if summ else 'no summary'}", flush=True)
    for f in touched:
        shutil.copy(STORE / f, S / f)
r = subprocess.run(['diff','-rq',str(S/'app'),str(STORE/'app')], capture_output=True, text=True)
print('scratch-vs-store diff:', r.stdout.strip() or 'identical')
