import subprocess, shutil, sys, filecmp
M = {
 'a': ('app/lib/arrangement/grid.ts', "  return step === null ? time : snapTimeToGridOrEdges(time, step, targets);", "  return step === null ? time : snapTimeToGridOrEdges(time, step, []);"),
 'b': ('app/components/arrangement/ArrangementRuler.tsx', "    drag.time = resolveGridTimeWithTargets(\n      pointerTime(event.clientX),\n      snapSeconds,\n      gridSeconds,\n      event.altKey,\n      getSnapMarkerTimes(),\n    );", "    drag.time = resolveGridTimeWithTargets(\n      pointerTime(event.clientX),\n      snapSeconds,\n      gridSeconds,\n      event.altKey,\n      [],\n    );"),
 'c': ('app/components/arrangement/StudioWorkspace.tsx', "            markerSnapTimes(latest.getArrangement()),", "            [],"),
 'd': ('app/components/arrangement/ArrangementClip.tsx', "      step === null ? time : snapTimeToGridOrEdges(time, step, markers);", "      step === null ? time : snapTimeToGridOrEdges(time, step, []);"),
 'e': ('app/components/arrangement/ArrangementLoopBrace.tsx', "                    markers,\n                    markers,\n                  ) * 1e6,", "                    markers,\n                    [],\n                  ) * 1e6,"),
 'i': ('app/components/arrangement/ArrangementLoopBrace.tsx', "                  ) * 1e6,\n                ) / 1e6,", "                  ) * 1e6,\n                ) / 1e6 + 0,"),
 'f': ('app/lib/arrangement/grid.ts', "  return step === null ? time : snapTimeToGridOrEdges(time, step, targets);", "  return step === null ? snapTimeToGridOrEdges(time, 1e9, targets) : snapTimeToGridOrEdges(time, step, targets);"),
 'g': ('app/lib/arrangement/grid.ts', "  return step === null ? time : snapTimeToGridOrEdges(time, step, targets);", "  return step === null ? time : (targets.find((t) => Math.abs(Math.abs(t - time) - Math.abs(snapTimeToGrid(time, step) - time)) < 1e-6) ?? snapTimeToGridOrEdges(time, step, targets));"),
 'h': ('app/components/arrangement/ArrangementLoopBrace.tsx', "              event.altKey,\n              markers,\n            ),", "              event.altKey,\n              [],\n            ),"),
}
PR='../tmp/studio-real-loop/a-round-78/final/'
T=['app/lib/arrangement/__tests__/marker-time-snap.test.ts','app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx']
for k in sys.argv[1:]:
    f,a,b=M[k]
    if k=='i':
        s0=open(f).read(); a='              : Math.round(\n                  snapMoveStartToGridOrEdges('; b='              : Number(\n                  snapMoveStartToGridOrEdges('
    s=open(f).read(); assert s.count(a)==1,(k,a)
    orig=s
    open(f,'w').write(s.replace(a,b))
    r=subprocess.run(['npx','vitest','run',*T],capture_output=True,text=True)
    out=r.stdout+r.stderr
    import re
    out=re.sub(r'\x1b\[[0-9;]*m','',out); fails=sorted(set(re.findall(r'FAIL .*?> .*?> (T[US]\d+\w*)',out)))
    summ=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
    print(k, f, 'exit', r.returncode, 'failed:', fails, summ)
    open(f,'w').write(orig)
    print('  restored, cmp final:', filecmp.cmp(f, PR+f.split('/')[-1], shallow=False) if k not in () else '')
