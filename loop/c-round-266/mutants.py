import pathlib, subprocess, sys

S = pathlib.Path('/tmp/c266-scratch')
OUT = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/c-round-266')
MODEL = S / 'app/lib/arrangement/model.ts'
CTX = S / 'app/contexts/ArrangementContext.tsx'
TESTS = ['app/lib/arrangement/__tests__/model.test.ts',
         'app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx']

MUTANTS = {
    'M6': (MODEL,
           "        entry.start < range.end - ARRANGEMENT_EPS &&\n        clipEnd(entry) > range.start + ARRANGEMENT_EPS,\n    )\n    .sort((left, right) => left.start - right.start);",
           "        entry.start <= range.start + ARRANGEMENT_EPS &&\n        clipEnd(entry) >= range.end - ARRANGEMENT_EPS,\n    )\n    .sort((left, right) => left.start - right.start)\n    .slice(0, 1);"),
    'M7': (MODEL,
           "    .sort((left, right) => left.start - right.start);",
           "    .sort((left, right) => left.start - right.start)\n    .slice(0, 1);"),
    'M8': (CTX,
           "if (result.middleIds.length === 1 && onlyId) {",
           "if (onlyId) {"),
    'M9': (MODEL,
           "return changed ? { arrangement: current, middleIds } : null;",
           "return { arrangement: current, middleIds };"),
}


def run(name):
    r = subprocess.run(['npx', 'vitest', 'run', *TESTS], cwd=S, capture_output=True, text=True, timeout=600)
    txt = r.stdout + r.stderr
    (OUT / f'mutant-{name}.txt').write_text(txt)
    fails = [l.strip() for l in txt.splitlines() if ('×' in l or 'FAIL' in l) and '>' in l]
    summary = [l.strip() for l in txt.splitlines() if 'Tests ' in l]
    return r.returncode, fails, summary


names = sys.argv[1:] or ['control', *MUTANTS]
for name in names:
    if name == 'control':
        print(name, run(name))
        continue
    path, old, new = MUTANTS[name]
    orig = path.read_text()
    assert orig.count(old) == 1, (name, orig.count(old))
    path.write_text(orig.replace(old, new))
    try:
        print(name, run(name))
    finally:
        path.write_text(orig)
