import subprocess, sys, json, os
root = sys.argv[1]
FILES = ['app/lib/arrangement/__tests__/grid-snap-ui.test.tsx','app/lib/arrangement/__tests__/grid-edges.test.ts',
 'app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx','app/lib/arrangement/__tests__/strings.test.ts']
G='app/lib/arrangement/grid.ts'; C='app/components/arrangement/ArrangementClip.tsx'; S='app/lib/arrangement/strings.ts'
M = {
 'M-ABSOLUTE-SINGLE': (C, ': snapRelativeMoveStartToGridOrEdges(start, delta, duration, snapStep, startEdges, endEdges);', ': snapMoveStartToGridOrEdges(start + delta, duration, snapStep, startEdges, endEdges);'),
 'M-ABSOLUTE-GROUP': (G, '  const gridStart = relativeGridStart(anchorStart, rawDelta, step);\n  const target = snapRelativeMoveStartToGridOrEdges(\n    anchorStart,\n    rawDelta,', '  const gridStart = snapTimeToGrid(anchorStart + rawDelta, step);\n  const target = snapMoveStartToGridOrEdges(\n    anchorStart +\n    rawDelta,'),
 'M-TOLERANCE-0': (G, 'const GRID_OFFSET_TOLERANCE = 0.0005;', 'const GRID_OFFSET_TOLERANCE = 0;'),
 'M-TOLERANCE-WIDE': (G, 'const GRID_OFFSET_TOLERANCE = 0.0005;', 'const GRID_OFFSET_TOLERANCE = 0.001;'),
 'M-DRIFT': (G, '  return roundGridTime(storedGridLine(baseIndex + whole, step) + offset);', '  return roundGridTime(anchorStart + whole * step + 0 * offset);'),
 'M-EDGE-OFF': (G, '  return nearestGridOrEdge(anchorStart + rawDelta, relativeGridStart(anchorStart, rawDelta, step), [', '  return nearestGridOrEdge(anchorStart + rawDelta, relativeGridStart(anchorStart, rawDelta, step), [] || ['),
 'M-GROUP-CLAMP-ZERO': (G, '  const whole =\n    requested > 0', '  const whole = 0 * (\n    requested > 0'),
 'M-TITLE': (S, "snapOnTitle: 'Snap on — clips follow the grid (G)',", "snapOnTitle: 'Snap on — clips land on the grid (G)',"),
}
out = {}
for name,(f,old,new) in M.items():
    p=os.path.join(root,f); src=open(p).read()
    if old not in src: out[name]='PATTERN-MISSING'; continue
    mutated = src.replace(old,new,1)
    if name=='M-GROUP-CLAMP-ZERO':
        mutated = mutated.replace('      : Math.min(0, Math.ceil((minDelta - GRID_TIME_TOLERANCE) / step));','      : Math.min(0, Math.ceil((minDelta - GRID_TIME_TOLERANCE) / step)));',1)
    if name=='M-ABSOLUTE-GROUP':
        mutated = mutated.replace('  const gridFallback = relativeGroupDelta(anchorStart, rawDelta, step, minDelta, maxDelta);','  const gridFallback = snapGroupDelta(anchorStart, rawDelta, step, minDelta, maxDelta);',1)
    if name=='M-ABSOLUTE-SINGLE':
        mutated = mutated.replace('  snapRelativeMoveStartToGridOrEdges,\n','  snapMoveStartToGridOrEdges,\n',1)
    open(p,'w').write(mutated)
    try:
        r=subprocess.run(['npx','vitest','run',*FILES,'--reporter=json','--outputFile=/tmp/b270-mut.json'],cwd=root,capture_output=True,text=True,timeout=400)
        d=json.load(open('/tmp/b270-mut.json'))
        red=[a['title'].split(' ')[0] for t in d['testResults'] for a in t['assertionResults'] if a['status']!='passed']
        if not d['testResults'] or any(t.get('status')=='failed' and not t['assertionResults'] for t in d['testResults']): red.append('SUITE-ERROR')
        out[name]=red
    finally:
        open(p,'w').write(src)
    print(name, out[name], flush=True)
