#!/usr/bin/env python3
# C round 238: MU-RF and MU-L1-REL on a scratch copy outside the repo. usage: mutants.py <scratch> <logdir>
import pathlib, subprocess, sys
scratch = pathlib.Path(sys.argv[1]); logdir = pathlib.Path(sys.argv[2])
f = scratch / 'app/contexts/ArrangementContext.tsx'
orig = f.read_text()
RF_OLD = """      lastNonRefusalStatusRef.current = settledCollectionStatus(
        lastNonRefusalStatusRef.current,
        copy,
        failedCount,
      );
"""
REL_OLD = "        setStatus((current) => statusAfterGestureRelease(current, lastNonRefusalStatusRef.current));\n"
REL_NEW = """        setStatus((current) =>
          current === GESTURE_EDIT_BLOCKED_MESSAGE || current === GESTURE_UNDO_BLOCKED_MESSAGE
            ? lastNonRefusalStatusRef.current
            : current,
        );
"""
muts = {'MU-RF': (RF_OLD, ''), 'MU-L1-REL': (REL_OLD, REL_NEW)}
for name, (a, b) in muts.items():
    assert orig.count(a) == 1, name
    f.write_text(orig.replace(a, b))
    r = subprocess.run(['npx', 'vitest', 'run', 'app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx', '--reporter=verbose'],
                       cwd=scratch, capture_output=True, text=True)
    (logdir / f'mutant-{name}.log').write_text(r.stdout + r.stderr + f'\nrc={r.returncode}\n')
    f.write_text(orig)
    print(name, 'rc', r.returncode, 'restored', f.read_text() == orig)
