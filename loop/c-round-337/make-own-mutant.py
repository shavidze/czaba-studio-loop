import sys, pathlib
root = pathlib.Path(sys.argv[1]).resolve()
if str(root) == '/home/runner/czaba-project/store': sys.exit('refused')
spec = root / 'perf/studio-lab-interactions.perf.spec.ts'
s = spec.read_text()
def rep(old, new):
    global s
    if s.count(old) != 1: sys.exit(f'anchor count {s.count(old)}: {old[:70]!r}')
    s = s.replace(old, new)
rep("const passesPerRate = 3;", "const passesPerRate = 1;")
rep("const cpuRates = [1, 6];", "const cpuRates = [1];")
rep("commits: whole.commits.filter((commit) => inWhole(commit.t)),", "commits: whole.commits.filter((commit) => inWhole(commit.t)).slice(1),")
spec.write_text(s); print('mutant W applied')
