import subprocess, sys, pathlib
M = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-85/mut/store')
S = pathlib.Path('/home/runner/czaba-project/store')
LOG = M.parent
G = 'app/lib/arrangement/graph.client.ts'
CTX = 'app/contexts/ArrangementContext.tsx'
EXP = 'app/components/arrangement/ArrangementExportDialog.tsx'
LANE = 'app/components/arrangement/ArrangementLane.tsx'
XR = 'app/lib/arrangement/__tests__/export-range.test.ts'
XU = 'app/lib/arrangement/__tests__/export-range-ui.test.tsx'
ST = 'app/lib/arrangement/__tests__/track-header-stacking.test.tsx'
muts = {
 'a-length-uses-end': (G, 'Math.round((renderWindow.end - renderWindow.start) * ARRANGEMENT_EXPORT_SAMPLE_RATE)', 'Math.round(renderWindow.end * ARRANGEMENT_EXPORT_SAMPLE_RATE)', [XR]),
 'b-from-stays-zero': (G, 'from: renderWindow.start,', 'from: 0,', [XR]),
 'c-overload-whole-project': (G, 'const report = measureExportOverload(raw);', 'const report = renderWindow ? await renderArrangementWav(arrangement, buffers).then(({ peak, clippedSamples }) => ({ peak, clippedSamples })) : measureExportOverload(raw);', [XR]),
 'd-range-not-default': (EXP, "(scopeChoice ?? 'range')", "(scopeChoice ?? 'project')", [XU]),
 'e-window-in-project-scope': (EXP, 'isRangeScope ? exportWav({ start: rangeStart, end: rangeEnd }) : exportWav()', 'hasValidRange ? exportWav({ start: rangeStart, end: rangeEnd }) : exportWav()', [XU]),
 'f1-dialog-guard-removed': (EXP, 'rangeEnd - rangeStart >= EXPORT_RANGE_MIN_SECONDS', 'rangeEnd - rangeStart >= 0', [XU]),
 'f2-context-guard-removed': (CTX, 'renderWindow.start >= 0 &&\n        renderWindow.end - renderWindow.start >= 0.001', 'renderWindow.start >= 0', [XU]),
 'g-isolate-removed': (LANE, "'relative isolate shrink-0'", "'relative shrink-0'", [ST]),
}
only = sys.argv[1:]
summary = []
for name, (path, old, new, tests) in muts.items():
    if only and name not in only: continue
    target = M / path
    original = (S / path).read_text()
    assert original.count(old) == 1, (name, original.count(old))
    for t in tests + [path]:
        (M / t).write_text((S / t).read_text())
    target.write_text(original.replace(old, new))
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *tests], cwd=M, capture_output=True, text=True, timeout=900)
        out = r.stdout + r.stderr
        (LOG / f'{name}.log').write_text(out)
        failed = [l.strip() for l in out.splitlines() if '×' in l]
        summary.append(f"{name}: exit={r.returncode} red={len(failed)} :: " + ' | '.join(failed[:4]))
    finally:
        target.write_text(original)
    assert target.read_text() == original
print('\n'.join(summary))
(LOG / 'summary.txt').write_text('\n'.join(summary) + '\n')

