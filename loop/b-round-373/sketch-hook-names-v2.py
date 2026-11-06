# B round 373 -> 374 sketch v2: B-R370-HOOK-ERROR-NAMES (tech-lead Medium: keep the public store hooks zero-argument).
# Each store hook gets a private use<Name>Context(hookName) helper, like useArrangementPlaybackStoreContext;
# the public hook passes its own name and every wrapper passes its own name. Run from the tree root on HEAD's file.
import re
p = 'app/contexts/ArrangementContext.tsx'
s = open(p).read()
stores = {
    'useArrangementPositionStore': ('ArrangementPositionStore', 'ArrangementPositionContext'),
    'useArrangementRangeStore': ('ArrangementRangeStore', 'ArrangementRangeContext'),
    'useArrangementClipLaneDragStore': ('ArrangementClipLaneDragStore', 'ArrangementClipLaneDragContext'),
    'useArrangementSelectionStore': ('ArrangementSelectionStore', 'ArrangementSelectionContext'),
    'useArrangementPreviewStore': ('ArrangementPreviewStore', 'ArrangementPreviewContext'),
    'useMasterMeterStore': ('MasterMeterStore', 'ArrangementMeterContext'),
    'useTrackMeterStore': ('TrackMeterStore', 'ArrangementTrackMeterContext'),
}
for name, (ret, ctx) in stores.items():
    pat = re.compile(r'export function ' + name + r'\(\): ' + ret + r' \{\n  const store = useContext\(' + ctx + r'\);\n  if \(!store\) \{\n    throw new Error\(\s*\'' + name + r' must be used within an ArrangementProvider\',?\s*\);\n  \}\n  return store;\n\}\n')
    m = pat.search(s)
    assert m, name
    helper = (f"function {name}Context(hookName: string): {ret} {{\n  const store = useContext({ctx});\n  if (!store) {{\n"
              f"    throw new Error(`${{hookName}} must be used within an ArrangementProvider`);\n  }}\n  return store;\n}}\n\n"
              f"export function {name}(): {ret} {{\n  return {name}Context('{name}');\n}}\n")
    s = s[:m.start()] + helper + s[m.end():]
calls = [
    ("return useStore(useArrangementRangeStore(), selector);", "return useStore(useArrangementRangeStoreContext('useArrangementRange'), selector);"),
    ("return useStore(useArrangementClipLaneDragStore(), selector);", "return useStore(useArrangementClipLaneDragStoreContext('useArrangementClipLaneDrag'), selector);"),
    ("return useStore(useArrangementSelectionStore(), selector);", "return useStore(useArrangementSelectionStoreContext('useArrangementSelection'), selector);"),
    ("return useStore(useArrangementPreviewStore(), selector);", "return useStore(useArrangementPreviewStoreContext('useArrangementPreview'), selector);"),
    ("return useStore(useArrangementSelectionStore(), (state) => state.activeTrackId);", "return useStore(\n    useArrangementSelectionStoreContext('useArrangementActiveTrackId'),\n    (state) => state.activeTrackId,\n  );"),
    ("  return useArrangementPreview(\n    useShallow(", "  return useStore(\n    useArrangementPreviewStoreContext('useArrangementPreviewLaneClips'),\n    useShallow("),
]
for o, n in calls:
    assert s.count(o) == 1, o
    s = s.replace(o, n)
for fn, store in [('useArrangementPosition', 'useArrangementPositionStore'), ('useArrangementPositionWriter', 'useArrangementPositionStore'),
                  ('useMasterMeterWriter', 'useMasterMeterStore'), ('useTrackMeterWriter', 'useTrackMeterStore')]:
    m = re.search(r'export function ' + fn + r'\b[^{]*\{\n  const store = ' + store + r'\(\);', s)
    assert m, fn
    s = s[:m.start()] + m.group(0).replace(f'{store}();', f"{store}Context('{fn}');") + s[m.end():]
open(p, 'w').write(s)
print('ok')
