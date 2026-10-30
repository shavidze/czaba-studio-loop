import sys, subprocess, shutil, pathlib
S = pathlib.Path('/tmp/a266-scratch')
OUT = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-266')
model = S / 'app/lib/arrangement/model.ts'
ctx = S / 'app/contexts/ArrangementContext.tsx'
orig = {p: p.read_text() for p in (model, ctx)}
M = {
 'M6': (model, [(
"""  const targets = arrangement.clips
    .filter(
      (entry) =>
        entry.trackId === range.trackId &&
        entry.start < range.end - ARRANGEMENT_EPS &&
        clipEnd(entry) > range.start + ARRANGEMENT_EPS,
    )
    .sort((left, right) => left.start - right.start);""",
"""  const targets = arrangement.clips
    .filter(
      (entry) =>
        entry.trackId === range.trackId &&
        entry.start <= range.start + ARRANGEMENT_EPS &&
        clipEnd(entry) >= range.end - ARRANGEMENT_EPS,
    )
    .slice(0, 1);""")]),
 'M7': (model, [("  for (const clip of targets) {", "  for (const clip of targets.slice(0, 1)) {")]),
 'M8': (ctx, [("      if (result.middleIds.length === 1 && onlyId) {", "      if (onlyId) {")]),
 'M9': (model, [("  return changed ? { arrangement: current, middleIds } : null;", "  return { arrangement: current, middleIds };")]),
}
files = ['app/lib/arrangement/__tests__/model.test.ts', 'app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx']
def run(name):
    r = subprocess.run(['npx', 'vitest', 'run', *files], cwd=S, capture_output=True, text=True)
    (OUT / f'mutant-{name}.txt').write_text(r.stdout + r.stderr)
    return r.returncode
for name, (path, subs) in M.items():
    text = orig[path]
    for a, b in subs:
        assert text.count(a) == 1, (name, a)
        text = text.replace(a, b)
    path.write_text(text)
    rc = run(name)
    path.write_text(orig[path])
    print(name, 'rc', rc)
print('control rc', run('control'))
