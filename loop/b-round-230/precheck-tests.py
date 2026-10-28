import sys, pathlib
root = pathlib.Path(sys.argv[1]) / 'app'
T = 'lib/arrangement/__tests__/'
def sub(rel, old, new, count=1):
    p = root / rel; s = p.read_text(); n = s.count(old)
    if n != count: raise SystemExit(f'{rel}: expected {count} of {old!r}, found {n}')
    p.write_text(s.replace(old, new))
OLD = 'Choose a track and add a sound (Enter or Add).'
NEW = 'Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.'
sub(T+'collection.test.ts', OLD, NEW, 2)
sub(T+'library-row-strings-ui.test.tsx', OLD, NEW)
sub(T+'collection-load-status.test.tsx', OLD, NEW, 2)
sub(T+'purchased-collection-ui.test.tsx', OLD, NEW, 2)
sub(T+'detail-panel.test.tsx', "'Select a clip to see its details'", "'Select a clip to edit its time selection and Clip Gain.'")
sub(T+'detail-panel-strings-ui.test.tsx', "'Select a clip to see its details'", "'Select a clip to edit its time selection and Clip Gain.'")
sub(T+'detail-panel-strings-ui.test.tsx', "toBe(\n      'Nothing selected',\n    );", "toBe('');")
sub(T+'strings.test.ts', "  nothingSelected: 'Nothing selected',\n  noSelectionHint: 'Select a clip to see its details',",
    "  noSelectionHint: 'Select a clip to edit its time selection and Clip Gain.',")
sub(T+'strings.test.ts', "  videoMuteTitle: 'Mute — Original video sound',\n",
    "  videoMuteTitle: 'Mute — Original video sound',\n  videoSoloTitle: 'Solo — Original video sound (Ctrl/Cmd+click = add to solo)',\n")
sub(T+'strings.test.ts', "  videoEmptyHint: 'use “Your own video” or drop a file here',\n",
    "  videoEmptyHint: 'use “Your own video” or drop a file here',\n  audioEmptyHint: 'Drag a sound here, or press Enter to add it',\n")
sub(T+'strings.test.ts', "  clearSearch: 'Clear search',\n  filterPrefix: 'Filter: ',",
    "  clearSearch: 'Clear search',\n  dismissNotice: 'Dismiss this notice',\n  filterPrefix: 'Filter: ',")
sub(T+'strings.test.ts', "        'clearSearch',\n        'collapse',", "        'clearSearch',\n        'collapse',\n        'dismissNotice',")
sub('data/__tests__/studio-lab-demo.test.ts',
    "'The stems are a synthetic demo — not CZABA catalogue stems and not parts extracted from a mix.'",
    "'Synthetic demo stems — not CZABA catalogue audio.'")
print('tests patched')
# round 2 (found by the first fixed run)
def sub2(rel, old, new, count=1):
    try: sub(rel, old, new, count)
    except SystemExit as e: print('skip/err', e)
sub2(T+'strings.test.ts', "        'nothingSelected',\n", '')
sub2(T+'strings.test.ts', "expect(Object.keys(EXPECTED_LIBRARY_PANEL_STRINGS)).toHaveLength(22);", "expect(Object.keys(EXPECTED_LIBRARY_PANEL_STRINGS)).toHaveLength(23);")
sub2(T+'collection.test.ts', "expect(demo.ready).toContain('(Enter or Add)');", "expect(demo.ready).toContain('press Enter to add it. Press ? for shortcuts.');")
sub2(T+'library-row-strings-ui.test.tsx', "expect(readyStatus).toContain('(Enter or Add)');", "expect(readyStatus).toContain('press Enter to add it. Press ? for shortcuts.');")
print('round 2 patched')
