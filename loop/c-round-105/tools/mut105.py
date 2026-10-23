import json, re, subprocess
M = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-105/mut'
OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-105/out'
RED = 'app/lib/arrangement/status-announcement.ts'
CTX = 'app/contexts/ArrangementContext.tsx'
TESTS = ['app/lib/arrangement/__tests__/status-announcement.test.ts', 'app/lib/arrangement/__tests__/status-announcement-ui.test.tsx']
def rd(f): return open(f'{M}/{f}', encoding='utf-8').read()
def wr(f, s): open(f'{M}/{f}', 'w', encoding='utf-8').write(s)
orig = {RED: rd(RED), CTX: rd(CTX)}
def sub(f, old, new):
    s = orig[f]; assert s.count(old) == 1, (f, old); return {f: s.replace(old, new)}
MUTS = {
  'control': {},
  # C m6: provider hands a constant "not in gesture" (written as 0 > 0, different string than A)
  'm6': sub(CTX, 'reduceArrangementStatus(previous, next, gestureCountRef.current > 0)', 'reduceArrangementStatus(previous, next, 0 > 0)'),
  # C m7: reducer ignores the flag by disabling the coalesce guard condition
  'm7': sub(RED, 'if (gestureActive && next === previous.text) {', 'if (gestureActive && next === previous.text && previous.sequence < 0) {'),
}
res = {}
for name, files in MUTS.items():
    for f in orig: wr(f, files.get(f, orig[f]))
    p = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', *TESTS], cwd=M, capture_output=True, text=True, timeout=600)
    out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
    open(f'{OUT}/mut-{name}.log', 'w').write(out)
    red = sorted(set(re.findall(r'(?:×|✗|FAIL)\s+.*?\b(S[AU]\d)\b', out)))
    green = sorted(set(re.findall(r'✓\s+.*?\b(S[AU]\d)\b', out)))
    res[name] = {'exit': p.returncode, 'red': red, 'green': green, 'summary': [l for l in out.splitlines() if re.search(r'Tests\s+\d', l)]}
    print(name, res[name], flush=True)
for f in orig: wr(f, orig[f])
json.dump(res, open(f'{OUT}/mut105.json', 'w'), indent=1)
