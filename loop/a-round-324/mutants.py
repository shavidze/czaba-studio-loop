import subprocess, sys, pathlib, shutil
root = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
T = 'app/lib/arrangement/__tests__/'
CTX = 'app/contexts/ArrangementContext.tsx'
SS = 'app/lib/arrangement/selection-store.ts'
SW = 'app/components/arrangement/StudioWorkspace.tsx'
M = {
 'MU-NO-EQUAL-GUARD': (SS, [("isSameOrderedSelection(state.selectedClipIds, next) ? state : { selectedClipIds: next }", "({ selectedClipIds: next })")], [T+'selection-store.test.tsx']),
 'MU-UNORDERED-GUARD': (SS, [("(previous.length === next.length && previous.every((id, index) => id === next[index]))", "(previous.length === next.length && previous.every((id) => next.includes(id)))")], [T+'selection-store.test.tsx']),
 'MU-SELECTION-IN-VALUE': (CTX, [
    ("  const [selectionStore] = useState(() => createArrangementSelectionStore());", "  const [selectionStore] = useState(() => createArrangementSelectionStore());\n  const mutantSelectedClipIds = useStore(selectionStore, (state) => state.selectedClipIds);"),
    ("    () => ({\n      collection,\n      arrangement,", "    () => ({\n      mutantSelectedClipIds,\n      collection,\n      arrangement,"),
    ("    [\n      collection,\n      arrangement,\n      end,", "    [\n      mutantSelectedClipIds,\n      collection,\n      arrangement,\n      end,"),
   ], [T+'selection-store.test.tsx']),
 'MU-STALE-SELECTION-READ': (CTX, [
    ("  const [selectionStore] = useState(() => createArrangementSelectionStore());", "  const [selectionStore] = useState(() => createArrangementSelectionStore());\n  const mutantRenderSelection = selectionStore.getState().selectedClipIds;"),
    ("    const clip = arrangement.clips.find((entry) => entry.id === primarySelectedClipId());\n", "    const clip = arrangement.clips.find((entry) => entry.id === (mutantRenderSelection.at(-1) ?? null));\n"),
   ], [T+'selection-store.test.tsx']),
 'MU-DETAIL-NO-MEMO': (SW, [("const ArrangementDetailPanelWithSelection = memo(ArrangementDetailPanelWithSelectionInner);", "const ArrangementDetailPanelWithSelection = ArrangementDetailPanelWithSelectionInner;")], [T+'render-budget.test.tsx']),
 'MU-GROUP-HEADER-NO-MEMO': (SW, [("const ArrangementGroupHeaderWithSelection = memo(ArrangementGroupHeaderWithSelectionInner);", "const ArrangementGroupHeaderWithSelection = ArrangementGroupHeaderWithSelectionInner;")], [T+'selection-wrappers-render.test.tsx']),
}
names = sys.argv[3:] or list(M)
for name in names:
    rel, reps, tests = M[name]
    path = root / rel
    orig = path.read_text(encoding='utf-8')
    s = orig
    for a, b in reps:
        n = s.count(a)
        if name == 'MU-STALE-SELECTION-READ' and a.startswith('    const clip'):
            # only the deleteSelection occurrence (first after 'const deleteSelection = useCallback')
            i = s.index('const deleteSelection = useCallback'); j = s.index(a, i)
            s = s[:j] + b + s[j+len(a):]; continue
        assert n == 1, (name, n, a[:60])
        s = s.replace(a, b)
    path.write_text(s, encoding='utf-8')
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *tests], cwd=root, capture_output=True, text=True, timeout=600)
        (out / f'mut-{name}.log').write_text(r.stdout + r.stderr, encoding='utf-8')
        print(name, 'rc', r.returncode)
    finally:
        path.write_text(orig, encoding='utf-8')
