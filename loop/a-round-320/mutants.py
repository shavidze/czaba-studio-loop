import sys
root, name = sys.argv[1], sys.argv[2]
C = 'app/contexts/ArrangementContext.tsx'
R = 'app/lib/arrangement/range-store.ts'
D = 'app/components/arrangement/ArrangementDetailPanel.tsx'
M = {
    'MU-RANGE-IN-VALUE': [
        (C, '  const value = useMemo<ArrangementContextValue>(\n    () => ({\n      collection,\n',
            '  const mutantRange = useStore(rangeStore, (state) => state.range);\n  const value = useMemo<ArrangementContextValue>(\n    () => ({\n      mutantRange,\n      collection,\n'),
        (C, '      setTimeRange,\n      setActiveTrack,\n      getArrangement,\n      previewArrangement,\n      commitArrangement,\n      nudgeSelectedClip,\n      splitSelection,\n      deleteSelection,\n',
            None),
    ],
    'MU-LANE-NEW-OBJECT': [
        (R, 'return isArrangementRangeInClip(range, clip) ? range : null;',
            'return isArrangementRangeInClip(range, clip) && range ? { ...range } : null;'),
    ],
    'MU-NO-STATUS-REWRITE': [
        (C, '      rangeStore.getState().setRange(next);\n      if (gestureCountRef.current === 0) {\n        setStatus(rewriteStoppedTruth);\n      }\n',
            '      rangeStore.getState().setRange(next);\n'),
    ],
    'MU-STALE-LATESTREF': [
        (C, '  const splitSelection = useCallback(() => {',
            '  const mutantRenderRange = useStore(rangeStore, (state) => state.range);\n  const splitSelection = useCallback(() => {'),
        (C, '    const latestRange = rangeStore.getState().range;\n', None),
    ],
    'C-MU-DETAIL-IGNORE-PROP': [
        (D, 'rangeOverride === undefined ? storeRange : rangeOverride', 'rangeOverride === undefined ? storeRange : storeRange'),
    ],
    'MU-DETAIL-IGNORE-STORE': [
        (D, 'rangeOverride === undefined ? storeRange : rangeOverride', 'rangeOverride'),
    ],
}
def apply(path, old, new):
    p = root + '/' + path
    s = open(p).read()
    n = s.count(old)
    assert n >= 1, (name, path, 'missing', old[:60])
    if new is None:
        return s, p, n
    assert n == 1, (name, path, 'count', n)
    open(p, 'w').write(s.replace(old, new))
for path, old, new in M[name]:
    if new is None and name == 'MU-STALE-LATESTREF':
        p = root + '/' + path; s = open(p).read()
        i = s.index('  const splitSelection = useCallback(() => {')
        j = s.index(old, i)
        s = s[:j] + '    const latestRange = mutantRenderRange;\n' + s[j + len(old):]
        open(p, 'w').write(s)
    elif new is None and name == 'MU-RANGE-IN-VALUE':
        p = root + '/' + path; s = open(p).read()
        i = s.index('  const value = useMemo<ArrangementContextValue>(')
        j = s.index('\n    [\n', i)
        s = s[:j] + '\n    [\n      mutantRange,\n' + s[j + len('\n    [\n'):]
        open(p, 'w').write(s)
    else:
        apply(path, old, new)
print('applied', name)
