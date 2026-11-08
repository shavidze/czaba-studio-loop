# B round 407 -> 408 mutant runner for the PERF-11c-iii-e-i sketch. Usage: S=<scratch> OUT=<dir> python3 -I run.py
# Each mutant replaces the FIRST occurrence of `old` (the actions memo object comes before its deps list) and
# requires the exact occurrence count `n`. Pass = rc != 0 and every expected row id named in the log.
import os, subprocess
S = os.environ.get('S', '/tmp/b408-sketch')
OUT = os.environ.get('OUT', '/home/runner/czaba-project/tmp/studio-real-loop/b-round-407/mutants')
os.makedirs(OUT, exist_ok=True)
CTX = 'app/contexts/ArrangementContext.tsx'
AC = 'app/lib/arrangement/__tests__/actions-context.test.tsx'
OBJ_END = '      toggleTrackSolo,\n      undo,\n    }),'
DEPS_END = '      undo,\n    ],\n  );\n  const value'
M = [
 ('MU-408-DROP-SOLO', CTX, OBJ_END, '      undo,\n    }),', 1, ['AC7', 'AC8']),
 ('MU-408-MISMAP-SOLO', CTX, OBJ_END, '      toggleTrackSolo: toggleTrackMute,\n      undo,\n    }),', 1, ['AC7', 'AC8']),
 ('MU-408-WRAP-PAN', CTX, '      setTimeRange,\n      setTrackPan,\n      splitSelection,\n', '      setTimeRange,\n      setTrackPan: (trackId: string, pan: number) => setTrackPan(trackId, pan),\n      splitSelection,\n', 2, ['AC7']),
 ('MU-408-DEPS-PER-COMMIT', CTX, DEPS_END, '      undo,\n      history,\n    ],\n  );\n  const value', 1, ['AC1', 'AC8']),
 ('MU-408-DROP-DRAG-SOURCE', CTX, '      getLibraryDragSource,\n      getLibraryPreviewOffset,\n', '      getLibraryPreviewOffset,\n', 2, ['AC7']),
]
def vt(files, log):
    r = subprocess.run(['npx', 'vitest', 'run', *files], cwd=S, capture_output=True, text=True, timeout=900)
    open(log, 'w').write(r.stdout + r.stderr + f'\nrc {r.returncode}\n')
    return r.returncode, r.stdout + r.stderr
lines = []
rc, _ = vt([AC], f'{OUT}/pristine-before.log'); lines.append(f'PRISTINE-BEFORE rc {rc}')
for mid, f, old, new, n, expect in M:
    p = os.path.join(S, f); src = open(p).read()
    c = src.count(old)
    if c != n:
        lines.append(f'{mid} SITE-COUNT {c} != {n} (skipped)'); continue
    open(p, 'w').write(src.replace(old, new, 1))
    try:
        rc, out = vt([AC], f'{OUT}/mutant-{mid}.log')
    finally:
        open(p, 'w').write(src)
    named = all(f'> {e} ' in out for e in expect)
    lines.append(f'{mid} {"RED" if rc != 0 else "SURVIVED"} rc {rc} expect {"+".join(expect)} named-in-log {named}')
rc, _ = vt([AC], f'{OUT}/pristine-after.log'); lines.append(f'PRISTINE-AFTER rc {rc}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines (B uncommitted sketch: 3; a committed scratch: 0)')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
