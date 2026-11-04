import subprocess, sys, pathlib
root = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
T = 'app/lib/arrangement/__tests__/'
DPR = T + 'drag-preview-render.test.tsx'
M = {
 'C-MU-VIDEO-NEW-PATH': ('app/components/arrangement/ArrangementClip.tsx', [("  const previewGeometry = isVideo\n    ? previewArrangement\n    : (previewClipGeometry ?? previewArrangement);", "  const previewGeometry = previewClipGeometry ?? previewArrangement;")], [DPR], 'DP9'),
 'C-MU-DETAIL-NO-SHALLOW': ('app/components/arrangement/StudioWorkspace.tsx', [("    useShallow((state) => selectPreviewClipsAmong(state.preview, arrangement, selectedClipIds)),", "    (state) => selectPreviewClipsAmong(state.preview, arrangement, selectedClipIds),")], [DPR], 'DP6/any'),
}
for name,(rel,reps,tests,row) in M.items():
    p = root/rel; orig = p.read_text(encoding='utf-8'); s = orig
    for a,b in reps:
        assert s.count(a)==1,(name,s.count(a)); s = s.replace(a,b)
    p.write_text(s,encoding='utf-8')
    try:
        r = subprocess.run(['npx','vitest','run',*tests],cwd=root,capture_output=True,text=True,timeout=600)
        (out/f'mut-{name}.log').write_text(r.stdout+r.stderr,encoding='utf-8'); print(name,row,'rc',r.returncode,flush=True)
    finally:
        p.write_text(orig,encoding='utf-8')
