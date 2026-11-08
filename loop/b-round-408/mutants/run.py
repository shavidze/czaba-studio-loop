# B round 408 -> 409 mutant runner for the PERF-11c-iii-e-ii sketch (v3: typed field-compare table, TL-R409-SK-1..4). Usage: S=<scratch> OUT=<dir> python3 -I run.py
# Each mutant replaces the FIRST occurrence of `old` in ArrangementLane.tsx and requires the exact occurrence count `n`.
# Pass = rc != 0 and every expected row id named in the log ("> ROW ").
import os, subprocess
S = os.environ.get('S', '/tmp/b409-sketch')
OUT = os.environ.get('OUT', '/home/runner/czaba-project/tmp/studio-real-loop/b-round-408/mutants')
os.makedirs(OUT, exist_ok=True)
LANE = 'app/components/arrangement/ArrangementLane.tsx'
FILES = ['app/lib/arrangement/__tests__/render-budget.test.tsx', 'app/lib/arrangement/__tests__/lane-strings-ui.test.tsx']
M = [
 ('MU-409-PLAIN-MEMO', 'memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual)', 'memo(ArrangementLaneViewInner)', 1, ['RB-LEAF7']),
 ('MU-409-TRACK-IDENTITY', '  return a === b || LANE_TRACK_COMPARES.every((isSameField) => isSameField(a, b));', '  return a === b;', 1, ['RB-LEAF7']),
 ('MU-409-DROP-SOLO-FIELD', '  solo: (a, b) => a.solo === b.solo,', '  solo: () => true,', 1, ['RB-LEAF7']),
 ('MU-409-DROP-PAN-FIELD', '  pan: (a, b) => a.pan === b.pan,', '  pan: () => true,', 1, ['RB-LEAF7']),
 ('MU-409-SOURCES-PER-COMMIT', '  }, [clips, collection, sourcePeaks, videoSources]);', '  }, [clips, collection, sourcePeaks, videoSources, arrangement]);', 1, ['RB-LEAF7']),
 ('MU-409-SOURCES-DEPS-NO-PEAKS', '  }, [clips, collection, sourcePeaks, videoSources]);', '  }, [clips, collection, videoSources]);', 1, ['RB-LEAF8']),
 ('MU-409-REST-IGNORED', '  return (\n    previousEntries.length === nextValues.size &&', '  return (\n    true ||\n    previousEntries.length === nextValues.size &&', 1, ['RB-LEAF7']),
 ('MU-409-GHOST-TITLE-EMPTY', "            return ghostClip ? laneSourceTitle(ghostClip.sourceId, collection, videoSources) : '';", "            return ghostClip ? '' : '';", 1, ['RB-LEAF9']),
 ('MU-409-EMPTY-HINT-ALWAYS-CLIPS', 'hasArrangementClips={arrangement.clips.length > 0}', 'hasArrangementClips={true}', 1, ['LSU9']),
]
def vt(files, log):
    r = subprocess.run(['npx', 'vitest', 'run', *files], cwd=S, capture_output=True, text=True, timeout=900)
    open(log, 'w').write(r.stdout + r.stderr + f'\nrc {r.returncode}\n')
    return r.returncode, r.stdout + r.stderr
lines = []
rc, _ = vt(FILES, f'{OUT}/pristine-before.log'); lines.append(f'PRISTINE-BEFORE rc {rc}')
for mid, old, new, n, expect in M:
    p = os.path.join(S, LANE); src = open(p).read()
    c = src.count(old)
    if c != n:
        lines.append(f'{mid} SITE-COUNT {c} != {n} (skipped)'); continue
    open(p, 'w').write(src.replace(old, new, 1))
    try:
        rc, out = vt(FILES, f'{OUT}/mutant-{mid}.log')
    finally:
        open(p, 'w').write(src)
    named = all(f'> {e} ' in out for e in expect)
    lines.append(f'{mid} {"RED" if rc != 0 else "SURVIVED"} rc {rc} expect {"+".join(expect)} named-in-log {named}')
rc, _ = vt(FILES, f'{OUT}/pristine-after.log'); lines.append(f'PRISTINE-AFTER rc {rc}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines (B uncommitted sketch: 2; a committed scratch: 0)')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
