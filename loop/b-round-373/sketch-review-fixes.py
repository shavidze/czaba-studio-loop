# B round 373 -> 374 sketch: tech-lead review fixes on the tests (run after sketch-hook-tests.py and sketch-rb-rows.py).
p = 'app/lib/arrangement/__tests__/context-hygiene.test.tsx'
s = open(p).read()
o = "  ['useTrackMeterWriter', () => useTrackMeterWriter('music', () => undefined)],\n"
assert s.count(o) == 1
s = s.replace(o, o + "  [\n    'useArrangementPreviewLaneClips',\n    () => useArrangementPreviewLaneClips(hygieneArrangement(), 'music'),\n  ],\n")
o = "  useArrangementPreview,\n"
assert s.count(o) == 1
s = s.replace(o, o + "  useArrangementPreviewLaneClips,\n")
open(p, 'w').write(s)
p = 'app/lib/arrangement/__tests__/render-budget.test.tsx'
s = open(p).read()
o = "    expect(view.getByRole('dialog')).toBeTruthy();\n    expect(renderLog.counts.get('ArrangementExportDialogContent') ?? 0).toBeGreaterThan(0);\n"
assert s.count(o) == 1
s = s.replace(o, "    expect(view.getByRole('dialog')).toBeTruthy();\n    expect(renderLog.counts.get('ArrangementExportDialogShell') ?? 0).toBeGreaterThan(0);\n    expect(renderLog.counts.get('ArrangementExportDialogContent') ?? 0).toBeGreaterThan(0);\n")
open(p, 'w').write(s)
print('ok')
