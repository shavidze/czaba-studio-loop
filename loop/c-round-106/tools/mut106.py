import json, re, subprocess
L = '/home/runner/czaba-project/tmp/studio-real-loop'
M = L + '/c-round-106/mut'
OUT = L + '/c-round-106/out'
SNAP = L + '/b-round-105-r106-snapshots'
RED = 'app/lib/arrangement/status-announcement.ts'
CTX = 'app/contexts/ArrangementContext.tsx'
WS = 'app/components/arrangement/StudioWorkspace.tsx'
LB = 'app/components/arrangement/ArrangementLoopBrace.tsx'
MR = 'app/components/arrangement/ArrangementMarkerRow.tsx'
DP = 'app/components/arrangement/ArrangementDetailPanel.tsx'
CODE = [CTX, WS, LB, MR, DP]
TESTS = ['app/lib/arrangement/__tests__/status-announcement.test.ts', 'app/lib/arrangement/__tests__/status-announcement-ui.test.tsx']
def rd(f): return open(f'{M}/{f}', encoding='utf-8').read()
def wr(f, s): open(f'{M}/{f}', 'w', encoding='utf-8').write(s)
orig = {f: rd(f) for f in [RED] + CODE}
snap = {f: open(f'{SNAP}/{f.split("/")[-1]}', encoding='utf-8').read() for f in CODE}
def rep(s, old, new, n):
    assert s.count(old) == n, (old, s.count(old)); return s.replace(old, new)
MUTS = {
  'control': {},
  # k1 (C string): workspace passes a false keyRepeat to both nudge calls
  'k1': {WS: rep(orig[WS], 'nudgeSelectedClip(direction * NUDGE_SECONDS, { keyRepeat: event.repeat })', 'nudgeSelectedClip(direction * NUDGE_SECONDS, { keyRepeat: event.repeat && false })', 1)
            .replace('nudgeSelectedClip(target - anchor.start, { keyRepeat: event.repeat })', 'nudgeSelectedClip(target - anchor.start, { keyRepeat: event.repeat && false })')},
  # k4 (C string): loop brace passes a false keyRepeat in both calls
  'k4': {LB: rep(orig[LB], '{ keyRepeat: event.repeat }', '{ keyRepeat: event.repeat && false }', 2)},
  # k8 (C string): five code files back to the round 105 snapshots + reducer coalesces identical text regardless of gesture
  'k8': {**snap, RED: rep(orig[RED], 'if (gestureActive && next === previous.text) {', 'if ((gestureActive || true) && next === previous.text) {', 1)},
  # k9 (C string): provider drops the refusal on every repeat instead of updater form
  'k9': {CTX: rep(rep(rep(orig[CTX],
      'setStatus(keyRepeat ? () => message : message);', 'if (!keyRepeat) { setStatus(message); }', 1),
      'setStatus(keyRepeat ? () => GROUP_MOVE_BLOCKED_MESSAGE : GROUP_MOVE_BLOCKED_MESSAGE);', 'if (!keyRepeat) { setStatus(GROUP_MOVE_BLOCKED_MESSAGE); }', 1),
      'options?.keyRepeat === true ? () => LOOP_STEP_BLOCKED_MESSAGE : LOOP_STEP_BLOCKED_MESSAGE,', 'LOOP_STEP_BLOCKED_MESSAGE,', 1)
      .replace('        setStatus(\n          LOOP_STEP_BLOCKED_MESSAGE,\n        );', '        if (options?.keyRepeat !== true) { setStatus(LOOP_STEP_BLOCKED_MESSAGE); }')},
}
res = {}
for name, files in MUTS.items():
    for f in orig: wr(f, files.get(f, orig[f]))
    p = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', *TESTS], cwd=M, capture_output=True, text=True, timeout=900)
    out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
    open(f'{OUT}/mut-{name}.log', 'w').write(out)
    red = sorted(set(re.findall(r'(?:×|✗)\s+.*?\b(S[AUK]\d+)\b', out)), key=lambda x: (x[:2], int(x[2:])))
    green = sorted(set(re.findall(r'✓\s+.*?\b(S[AUK]\d+)\b', out)), key=lambda x: (x[:2], int(x[2:])))
    res[name] = {'exit': p.returncode, 'red': red, 'greenCount': len(green), 'summary': [l.strip() for l in out.splitlines() if re.search(r'Tests\s+\d', l)]}
    print(name, res[name], flush=True)
for f in orig: wr(f, orig[f])
json.dump(res, open(f'{OUT}/mut106.json', 'w'), indent=1)
