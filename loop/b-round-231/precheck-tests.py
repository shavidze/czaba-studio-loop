import sys, pathlib
root = pathlib.Path(sys.argv[1])
def sub(rel, old, new, count=1):
    p = root / rel; s = p.read_text(); n = s.count(old)
    if n != count: raise SystemExit(f"{rel}: expected {count} of {old!r}, found {n}")
    p.write_text(s.replace(old, new))
T='app/lib/arrangement/__tests__/'
sub(T+'strings.test.ts', """    followOn: 'Follow on: the view follows the playback position during playback.',
    waveformZoomLabel""", """    followOn: 'Follow on: the view follows the playback position during playback.',
    overviewHidden: 'Overview hidden. Ctrl+Alt+O shows it again.',
    overviewShown: 'Overview shown. Ctrl+Alt+O hides it.',
    waveformZoomLabel""")
sub(T+'strings.test.ts', """    'followResumed',
    'overviewLabel',
    'overviewTitle',
""", """    'followResumed',
    'overviewHidden',
    'overviewLabel',
    'overviewShown',
    'overviewTitle',
""")
sub(T+'shortcuts.test.ts', """  'overview-scroll',
  'waveform-zoom',""", """  'overview-scroll',
  'overview-toggle',
  'waveform-zoom',""")
sub(T+'shortcuts.test.ts', "    expect(checked).toBe(8);", "    expect(checked).toBe(9);")
sub(T+'panel-radius-ui.test.tsx', "      'relative h-16 w-full cursor-ew-resize touch-none overflow-hidden rounded-panel bg-background',",
    "      'relative h-16 w-full cursor-ew-resize touch-none overflow-hidden rounded-panel',")
print('tests patched')
