import subprocess, sys, json, os
root = sys.argv[1]; outp = sys.argv[2]
FILES = ['app/lib/arrangement/__tests__/grid-snap-ui.test.tsx','app/lib/arrangement/__tests__/grid-edges.test.ts',
 'app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx','app/lib/arrangement/__tests__/strings.test.ts']
G='app/lib/arrangement/grid.ts'; C='app/components/arrangement/ArrangementClip.tsx'; S='app/lib/arrangement/strings.ts'
M = {
 'M-ABSOLUTE-SINGLE': [(C, 'snapRelativeMoveStartToGridOrEdges(start, delta, duration,', 'snapMoveStartToGridOrEdges(start + delta, duration,'), (C, '  snapRelativeMoveStartToGridOrEdges,\n', '  snapMoveStartToGridOrEdges,\n')],
 'M-ABSOLUTE-GROUP': [(G, '  const gridStart = relativeGridStart(anchorStart, rawDelta, step);', '  const gridStart = snapTimeToGrid(anchorStart + rawDelta, step);'),
                      (G, '  const target = snapRelativeMoveStartToGridOrEdges(\n    anchorStart,\n    rawDelta,', '  const target = snapMoveStartToGridOrEdges(\n    anchorStart + rawDelta,'),
                      (G, '  const gridFallback = relativeGroupDelta(anchorStart', '  const gridFallback = snapGroupDelta(anchorStart')],
 'M-TOLERANCE-0': [(G, 'const GRID_OFFSET_TOLERANCE = 0.0005;', 'const GRID_OFFSET_TOLERANCE = 0;')],
 'M-TOLERANCE-WIDE': [(G, 'const GRID_OFFSET_TOLERANCE = 0.0005;', 'const GRID_OFFSET_TOLERANCE = 0.001;')],
 'M-DRIFT': [(G, '  return roundGridTime(storedGridLine(baseIndex + whole, step) + offset);', '  return roundGridTime(anchorStart + whole * step);')],
 'M-EDGE-OFF': [(G, '  return nearestGridOrEdge(anchorStart + rawDelta, relativeGridStart(anchorStart, rawDelta, step), [\n    ...edges,\n    ...endEdges.map((edge) => edge - duration),\n  ]);', '  return relativeGridStart(anchorStart, rawDelta, step);')],
 'M-GROUP-CLAMP-ZERO': [(G, '  const fallback = wholeStepDelta(whole);\n  if (isInBounds(fallback)) {\n    return fallback;\n  }\n  const inner = wholeStepDelta(whole - Math.sign(whole));\n  return isInBounds(inner) ? inner : 0;', '  return 0;')],
 'M-NO-BOUND-CHECK': [(G, '  if (isInBounds(fallback)) {\n    return fallback;\n  }', '  if (true) {\n    return fallback;\n  }')],
 'M-TITLE': [(S, "snapOnTitle: 'Snap on — clips follow the grid (G)',", "snapOnTitle: 'Snap on — clips land on the grid (G)',")],
 # C extras
 'C-X-NO-FLOOR': [(G, '  const whole = Math.max(-baseIndex, Math.floor(rawDelta / step + 0.5));', '  const whole = Math.floor(rawDelta / step + 0.5);')],
 'C-X-ROUND-TRUNC': [(G, '  const whole = Math.max(-baseIndex, Math.floor(rawDelta / step + 0.5));', '  const whole = Math.max(-baseIndex, Math.trunc(rawDelta / step));')],
 'C-X-FALLBACK-BOUND': [(G, '  const fallback = wholeStepDelta(whole);', '  const fallback = roundGridTime(requested > 0 ? maxDelta : minDelta);')],
 'C-X-ONGRID-ALWAYS': [(G, '  if (isOnGrid(anchorStart, step)) {\n    return snapTimeToGrid(anchorStart + rawDelta, step);\n  }', '  if (true) {\n    return snapTimeToGrid(anchorStart + rawDelta, step);\n  }')],
 'C-X-NO-INNER': [(G, '  return isInBounds(inner) ? inner : 0;', '  return 0;')],
}
out = {}
for name, subs in M.items():
    orig = {}; ok = True
    for f, old, new in subs:
        p = os.path.join(root, f); src = orig.setdefault(p, open(p).read())
        cur = open(p).read()
        if old not in cur: ok = False; break
        open(p, 'w').write(cur.replace(old, new, 1))
    if not ok:
        for p, s in orig.items(): open(p, 'w').write(s)
        out[name] = 'PATTERN-MISSING'; print(name, out[name], flush=True); continue
    try:
        subprocess.run(['npx','vitest','run',*FILES,'--reporter=json','--outputFile=/tmp/c271-mut.json'],cwd=root,capture_output=True,text=True,timeout=600)
        d = json.load(open('/tmp/c271-mut.json'))
        red = [a['title'].split(' ')[0] for t in d['testResults'] for a in t['assertionResults'] if a['status'] != 'passed']
        if any(t.get('status') == 'failed' and not t['assertionResults'] for t in d['testResults']): red.append('SUITE-ERROR')
        out[name] = red
    finally:
        for p, s in orig.items(): open(p, 'w').write(s)
    print(name, out[name], flush=True)
json.dump(out, open(outp, 'w'), indent=1)
