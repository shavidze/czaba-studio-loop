import sys
root, name = sys.argv[1], sys.argv[2]
SW = 'app/components/arrangement/StudioWorkspace.tsx'
LN = 'app/components/arrangement/ArrangementLane.tsx'
M = {
  'MU-ACTIVE-IGNORES-LINES': [(SW, "const activeSnapSeconds = snapEnabled && gridLinesShown ? gridSeconds : null;", "const activeSnapSeconds = snapEnabled ? gridSeconds : null;")],
  'MU-ALT-ENABLES-HIDDEN': [(SW, "const snapGridSeconds = gridLinesShown ? gridSeconds : undefined;", "const snapGridSeconds = gridSeconds;")],
  'MU-LANE-FORWARDS-DRAW-GRID': [(LN, "              gridSeconds={snapGridSeconds}\n", "              gridSeconds={gridSeconds}\n"), (LN, "resolveSnapStep(snapSeconds, snapGridSeconds, event.altKey)", "resolveSnapStep(snapSeconds, gridSeconds, event.altKey)")],
  'MU-SEEK-REF-IGNORES-LINES': [(SW, """            snapEnabledRef.current &&
              gridLinesVisible(gridSecondsRef.current, pxPerSecondRef.current)
              ? gridSecondsRef.current
              : null,
            gridLinesVisible(gridSecondsRef.current, pxPerSecondRef.current)
              ? gridSecondsRef.current
              : undefined,""", """            snapEnabledRef.current ? gridSecondsRef.current : null,
            gridSecondsRef.current,""")],
  'MU-NUDGE-HIDDEN': [(SW, """        if (
          !snapEnabledRef.current ||
          !gridLinesVisible(gridSecondsRef.current, pxPerSecondRef.current)
        ) {""", """        if (!snapEnabledRef.current) {""")],
  'MU-NO-NOTE': [(SW, "    return `${message} ${studioGridStrings.snapPausedNote}`;", "    return message;")],
  'MU-TITLE-NOT-PAUSED': [(SW, ": studioGridStrings.snapPausedTitle", ": studioGridStrings.snapOnTitle")],
  'MU-PAUSED-ATTR': [(SW, "data-snap-paused={snapEnabled && !gridLinesShown ? 'true' : 'false'}", "data-snap-paused=\"false\"")],
}
for path, old, new in M[name]:
    p = f'{root}/{path}'
    s = open(p).read()
    if s.count(old) != 1:
        sys.exit(f'{name}: pattern count {s.count(old)} in {path}')
    open(p, 'w').write(s.replace(old, new))
print('applied', name)
