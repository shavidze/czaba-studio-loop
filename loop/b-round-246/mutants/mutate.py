# usage: python3 -I mutate.py <scratch> <mutant>; edits the scratch copy's two source files in place (never the store repo)
import sys, pathlib
root = pathlib.Path(sys.argv[1]); m = sys.argv[2]
ws = root / 'app/components/arrangement/StudioWorkspace.tsx'
gh = root / 'app/components/arrangement/ArrangementGroupHeader.tsx'
W = ws.read_text(); G = gh.read_text()
def rep(s, a, b):
    assert a in s, (m, a[:80]); return s.replace(a, b, 1)
if m == 'FIX-CONTROL':
    pass
elif m == 'MU-PREVIOUS-FIRST':
    W = rep(W, 'const candidates = [...order.slice(index + 1), ...order.slice(0, Math.max(index, 0)).reverse()];',
            'const candidates = [...order.slice(0, Math.max(index, 0)).reverse(), ...order.slice(index + 1)];')
elif m == 'MU-NO-CONTAINS':
    G = rep(G, 'if (detached?.contains(document.activeElement)) {', 'if (detached) {')
elif m == 'MU-NAME-ONLY':
    G = rep(G, 'if (detached?.contains(document.activeElement)) {', 'if (detached && document.activeElement?.getAttribute(\'data-testid\') === \'arrangement-group-name\') {')
elif m == 'MU-VISIBLE-ORDER':
    W = rep(W, 'committedTrackRowsRef.current = allTrackRows;\n', 'committedTrackRowsRef.current = trackRows;\n')
    W = rep(W, 'const committedTrackRowsRef = useRef(allTrackRows);', 'const committedTrackRowsRef = useRef<readonly TrackGroupRow[]>(allTrackRows);')
elif m == 'MU-RENDER-ORDER':
    W = rep(W, 'order: committedTrackRowsRef.current.map((row) => row.id),', 'order: trackRowsRef.current.map((row) => row.id),')
elif m == 'MU-PRECEDENCE-INVERTED':
    W = rep(W, '      pendingRowFocusRef.current !== null ||\n', '')
    a = W.index('  useIsomorphicLayoutEffect(() => {\n    const detached = detachedRowFocusRef.current;')
    b = W.index('  useIsomorphicLayoutEffect(() => {\n    const rowId = pendingRowFocusRef.current;')
    rescue = W[a:b]
    W = W[:a] + W[b:]
    c = W.index('  useIsomorphicLayoutEffect(() => {\n    committedTrackRowsRef.current = allTrackRows;')
    W = W[:c] + rescue + W[c:]
elif m == 'MU-BODY-BASED':
    G = rep(G, 'if (detached?.contains(document.activeElement)) {', 'if (detached && (document.activeElement === null || document.activeElement === document.body || detached.contains(document.activeElement))) {')
else:
    raise SystemExit('unknown mutant ' + m)
ws.write_text(W); gh.write_text(G)
print('applied', m)
