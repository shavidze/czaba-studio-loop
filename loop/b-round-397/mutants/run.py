# Usage: python3 -I run.py <scratch-root with the sketch applied> <out-dir>
import subprocess, sys, os, shutil
root, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lane = os.path.join(root, 'app/components/arrangement/ArrangementLane.tsx')
test = 'app/lib/arrangement/__tests__/lane-clip-count.test.tsx'
GOOD = "      data-clip-count={clips.length}\n"
MUTANTS = {
    'MU-398-NO-ATTR': '',
    'MU-398-TOTAL': "      data-clip-count={arrangement.clips.length}\n",
    'MU-398-STALE': "      data-clip-count={useRef(clips.length).current}\n",
    'MU-398-COMMITTED': "      data-clip-count={arrangement.clips.filter((clip) => clip.trackId === track.id).length}\n",
    'MU-398-FOLD-ZERO': "      data-clip-count={folded ? 0 : clips.length}\n",
}
def run(name):
    r = subprocess.run(['npx', 'vitest', 'run', test], cwd=root, capture_output=True, text=True, timeout=600)
    log = r.stdout + r.stderr
    open(os.path.join(out, f'{name}.log'), 'w').write(log)
    return r.returncode, log
src = open(lane).read()
assert src.count(GOOD) == 1, 'sketch not applied'
lines = []
rc, _ = run('pristine'); lines.append(f'pristine rc {rc}')
for name, repl in MUTANTS.items():
    open(lane, 'w').write(src.replace(GOOD, repl))
    try:
        rc, log = run(f'mutant-{name}')
    finally:
        open(lane, 'w').write(src)
    failed = sorted({l.split(' > ')[-1].split(':')[0].strip() for l in log.splitlines() if ' FAIL ' in l and ' > ' in l})
    lines.append(f'{name} rc {rc} {"RED" if rc != 0 else "SURVIVED"} failing: {" ".join(failed)}')
rc, _ = run('pristine-after'); lines.append(f'pristine-after rc {rc}')
open(os.path.join(out, 'summary.txt'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
