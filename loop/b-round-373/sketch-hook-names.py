# B round 373 -> 374 sketch: B-R370-HOOK-ERROR-NAMES. Each store hook takes an optional hookName
# (default = its own name); each wrapper passes its own name. Run from the tree root.
import re, sys
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
for name, (ret, _ctx) in stores.items():
    old_sig = f'export function {name}(): {ret} {{'
    assert s.count(old_sig) == 1, (name, s.count(old_sig))
    s = s.replace(old_sig, f"export function {name}(hookName = '{name}'): {ret} {{")
    old_err = f"throw new Error('{name} must be used within an ArrangementProvider');"
    if s.count(old_err) != 1:
        old_err2 = f"throw new Error(\n      '{name} must be used within an ArrangementProvider',\n    );"
        assert s.count(old_err2) == 1, (name, 'err')
        s = s.replace(old_err2, 'throw new Error(`${hookName} must be used within an ArrangementProvider`);')
    else:
        s = s.replace(old_err, 'throw new Error(`${hookName} must be used within an ArrangementProvider`);')
calls = [
    ("return useStore(useArrangementRangeStore(), selector);", "return useStore(useArrangementRangeStore('useArrangementRange'), selector);"),
    ("return useStore(useArrangementClipLaneDragStore(), selector);", "return useStore(useArrangementClipLaneDragStore('useArrangementClipLaneDrag'), selector);"),
    ("return useStore(useArrangementSelectionStore(), selector);", "return useStore(useArrangementSelectionStore('useArrangementSelection'), selector);"),
    ("return useStore(useArrangementPreviewStore(), selector);", "return useStore(useArrangementPreviewStore('useArrangementPreview'), selector);"),
    ("return useStore(useArrangementSelectionStore(), (state) => state.activeTrackId);", "return useStore(\n    useArrangementSelectionStore('useArrangementActiveTrackId'),\n    (state) => state.activeTrackId,\n  );"),
]
for o, n in calls:
    assert s.count(o) == 1, o
    s = s.replace(o, n)
# Position / meter wrappers: `const store = useXStore();` inside a named function
for fn, store in [('useArrangementPosition', 'useArrangementPositionStore'), ('useArrangementPositionWriter', 'useArrangementPositionStore'),
                  ('useMasterMeterWriter', 'useMasterMeterStore'), ('useTrackMeterWriter', 'useTrackMeterStore')]:
    m = re.search(r'export function ' + fn + r'\b[^{]*\{\n  const store = ' + store + r'\(\);', s)
    assert m, fn
    s = s[:m.start()] + m.group(0).replace(f'{store}();', f"{store}('{fn}');") + s[m.end():]
open(p, 'w').write(s)
print('ok')
