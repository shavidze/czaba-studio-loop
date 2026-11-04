import subprocess, sys, pathlib
root = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
T = 'app/lib/arrangement/__tests__/'
CTX = 'app/contexts/ArrangementContext.tsx'
PS = 'app/lib/arrangement/preview-store.ts'
SW = 'app/components/arrangement/StudioWorkspace.tsx'
DPR = T + 'drag-preview-render.test.tsx'
M = {
 'MU-NO-SHALLOW': (CTX, [("    useShallow((state) => selectPreviewLaneClips(state.preview, committed, trackId)),", "    (state) => selectPreviewLaneClips(state.preview, committed, trackId),")], [T + 'preview-store.test.ts'], 'DP1'),
 'MU-PREVIEW-THROUGH-HISTORY': (CTX, [("      historyRef.current = { ...historyRef.current, present: next };\n      previewStore.getState().setPreview(next);", "      updateHistory({ ...historyRef.current, present: next });\n      previewStore.getState().setPreview(next);"), ("    [previewStore],\n  );\n\n  const commitArrangement", "    [previewStore, updateHistory],\n  );\n\n  const commitArrangement")], [DPR], 'DP2'),
 'MU-NO-CLEAR-ON-UPDATE': (CTX, [("      setHistory(next);\n      previewStore.getState().clearPreview();", "      setHistory(next);")], [DPR], 'DP3/DP8b'),
 'MU-REF-NOT-TRACKED': (CTX, [("      historyRef.current = { ...historyRef.current, present: next };\n      previewStore.getState().setPreview(next);", "      previewStore.getState().setPreview(next);")], [DPR], 'DP5'),
 'MU-READOUT-COMMITTED': (SW, [("  const selectedClip = useArrangementPreview((state) =>\n    selectPreviewClip(state.preview, arrangement, primaryClipId),\n  );", "  const selectedClip = arrangement.clips.find((clip) => clip.id === primaryClipId);")], [DPR], 'DP6'),
 'MU-END-COMMITTED': (PS, [("  return preview ? projectEnd(preview) : committedProjectEnd;", "  return preview ? committedProjectEnd : committedProjectEnd;")], [DPR], 'DP7'),
 'MU-NO-CONVERGE': (CTX, [("        if (historyRef.current !== publishedHistoryRef.current) {\n          updateHistory(historyRef.current);\n        }\n", "")], [DPR], 'DP8a'),
}
names = sys.argv[3:] or list(M)
for name in names:
    rel, reps, tests, row = M[name]
    path = root / rel
    orig = path.read_text(encoding='utf-8')
    s = orig
    for a, b in reps:
        n = s.count(a)
        assert n == 1, (name, n, a[:60])
        s = s.replace(a, b)
    path.write_text(s, encoding='utf-8')
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *tests], cwd=root, capture_output=True, text=True, timeout=600)
        (out / f'mut-{name}.log').write_text(r.stdout + r.stderr, encoding='utf-8')
        print(name, row, 'rc', r.returncode)
    finally:
        path.write_text(orig, encoding='utf-8')
