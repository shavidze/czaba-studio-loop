import json, re, subprocess
L = '/home/runner/czaba-project/tmp/studio-real-loop'
M = L + '/c-round-107/mut'
OUT = L + '/c-round-107/out'
CTX = 'app/contexts/ArrangementContext.tsx'
WS = 'app/components/arrangement/StudioWorkspace.tsx'
MR = 'app/components/arrangement/ArrangementMarkerRow.tsx'
TEST = 'app/lib/arrangement/__tests__/status-announcement-ui.test.tsx'
def rd(f): return open(f'{M}/{f}', encoding='utf-8').read()
def wr(f, s): open(f'{M}/{f}', 'w', encoding='utf-8').write(s)
orig = {f: rd(f) for f in [CTX, WS, MR]}
def rep(s, old, new, n=1):
    assert s.count(old) == n, (old[:60], s.count(old)); return s.replace(old, new)
ws = orig[WS]
MUTS = {
  'control': {},
  # h1 (C string): Ctrl+L (non-shift) toggles on every keydown again; Shift+L keeps its guard
  'h1': {WS: rep(ws, """        if (!event.repeat) {
          if (event.shiftKey) {
            current.extendRangeToAllTracks();
          } else {
            current.toggleLoopSelection();
          }
        }""", """        if (event.shiftKey) {
          if (!event.repeat) {
            current.extendRangeToAllTracks();
          }
        } else {
          current.toggleLoopSelection();
        }""")},
  # h5 (C string): undo also one-shot
  'h5': {WS: rep(ws, """        if (event.shiftKey) {
          current.redo();
        } else {
          current.undo();
        }""", """        if (event.repeat) {
          return;
        }
        if (event.shiftKey) {
          current.redo();
        } else {
          current.undo();
        }""")},
  # h8 (C string): drop the repeat early return in the marker name editor
  'h8': {MR: rep(orig[MR], """                if (event.key === 'Enter' && event.repeat) {
                  return;
                }
""", "")},
  # h10 (C string): compare against an impossible value so the R4 branch never fires
  'h10': {CTX: rep(orig[CTX], 'if (target === clip.start) {', 'if (target === clip.start && delta === 0) {')},
  # h12 (C string): arrow nudge ignores repeats (forbidden over-guard)
  'h12': {WS: rep(ws, 'current.nudgeSelectedClip(direction * NUDGE_SECONDS, { keyRepeat: event.repeat });', 'if (!event.repeat) { current.nudgeSelectedClip(direction * NUDGE_SECONDS, { keyRepeat: event.repeat }); }')},
}
assert MUTS['h12'][WS] != ws, 'h12 pattern not found'
import sys
ONLY = sys.argv[1:]
res = {}
for name, files in MUTS.items():
    if ONLY and name not in ONLY: continue
    for f in orig: wr(f, files.get(f, orig[f]))
    p = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', TEST], cwd=M, capture_output=True, text=True, timeout=900)
    out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
    open(f'{OUT}/mut-{name}.log', 'w').write(out)
    key = r'\b((?:HK|HE|NZ|SU|SK)\d+)\b'
    red = sorted(set(re.findall(r'(?:×|✗)\s+.*?' + key, out)))
    green = sorted(set(re.findall(r'✓\s+.*?' + key, out)))
    res[name] = {'exit': p.returncode, 'red': red, 'greenCount': len(green), 'summary': [l.strip() for l in out.splitlines() if re.search(r'Tests\s+\d', l)]}
    print(name, res[name], flush=True)
for f in orig: wr(f, orig[f])
json.dump(res, open(f'{OUT}/mut107' + ('-' + '-'.join(ONLY) if ONLY else '') + '.json', 'w'), indent=1)
