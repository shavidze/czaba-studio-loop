import json, re, subprocess, sys
M = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-104/mut'
OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-104/out'
RED = 'app/lib/arrangement/status-announcement.ts'
WS = 'app/components/arrangement/StudioWorkspace.tsx'
TESTS = ['app/lib/arrangement/__tests__/status-announcement.test.ts', 'app/lib/arrangement/__tests__/status-announcement-ui.test.tsx']

def rd(f): return open(f'{M}/{f}', encoding='utf-8').read()
def wr(f, s): open(f'{M}/{f}', 'w', encoding='utf-8').write(s)
orig = {RED: rd(RED), WS: rd(WS)}

def sub(f, old, new):
    s = orig[f]
    assert s.count(old) == 1, (f, old)
    return {f: s.replace(old, new)}

MUTS = {
    'control': {},
    # m1: string branch keeps previous when the text is identical
    'm1': sub(RED, "    return { text: next, sequence: previous.sequence + 1 };", "    return next === previous.text ? previous : { text: next, sequence: previous.sequence + 1 };"),
    # m2: span without key
    'm2': sub(WS, "<span key={statusSequence}>{status}</span>", "<span data-seq={statusSequence}>{status}</span>"),
    # m4: function branch never returns previous
    'm4': sub(RED, "  if (text === previous.text) {\n    return previous;\n  }\n", ""),
}
# m3: key moved onto <output>, bare text
s = orig[WS]
i = s.index('data-testid="arrangement-status"')
j = s.rfind('<output', 0, i)
assert s.count('<span key={statusSequence}>{status}</span>') == 1
m3 = s[:j] + '<output key={statusSequence}' + s[j + len('<output'):]
m3 = m3.replace('<span key={statusSequence}>{status}</span>', '{status}')
MUTS['m3'] = {WS: m3}

res = {}
for name, files in MUTS.items():
    for f in orig: wr(f, files.get(f, orig[f]))
    p = subprocess.run(['npx', 'vitest', 'run', '--reporter=verbose', *TESTS], cwd=M, capture_output=True, text=True, timeout=600)
    out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
    open(f'{OUT}/mut-{name}.log', 'w').write(out)
    red = sorted(set(re.findall(r'(?:×|✗|FAIL)\s+.*?\b(S[AU]\d)\b', out)))
    passed = sorted(set(re.findall(r'✓\s+.*?\b(S[AU]\d)\b', out)))
    res[name] = {'exit': p.returncode, 'red': red, 'green': passed, 'summary': [l for l in out.splitlines() if re.search(r'Tests\s+\d', l)]}
    print(name, res[name], flush=True)
for f in orig: wr(f, orig[f])
json.dump(res, open(f'{OUT}/mut104.json', 'w'), indent=1)
