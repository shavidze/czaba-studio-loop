# Usage: python3 -I run.py <scratch-root with the sketch applied> <out-dir>
import subprocess, sys, os
root, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lane = os.path.join(root, 'app/components/arrangement/ArrangementLane.tsx')
test = 'app/lib/arrangement/__tests__/lane-virtualization.test.tsx'
MUTANTS = {
    'MU-399-NO-FILTER': ('{mountedClips.map((clip) => {', '{clips.map((clip) => {'),
    'MU-399-NO-GESTURE-PIN': ('      gestureClipIdsRef.current.has(clip.id) ||\n', ''),
    'MU-399-NO-MOVE-PIN': ('      laneMoveSourceIds.has(clip.id) ||\n', ''),
    'MU-399-NO-UNPIN': ('      pinned.delete(clipId);\n', ''),
    'MU-399-STATIC-PAGE': ('    timelineWindow?.subscribeTimelineScroll ?? noLaneWindowSubscription,\n', '    noLaneWindowSubscription,\n'),
    'MU-399-PIN-SELECTED': ('      laneMoveSourceIds.has(clip.id) ||\n', '      laneMoveSourceIds.has(clip.id) ||\n      laneSelectedClipIds.has(clip.id) ||\n'),
    'MU-399-STALE-PX': ('        clip.start * pxPerSecond,\n        (clip.start + clip.duration) * pxPerSecond,\n', '        clip.start * 40,\n        (clip.start + clip.duration) * 40,\n'),
}
def run(name):
    r = subprocess.run(['npx', 'vitest', 'run', test], cwd=root, capture_output=True, text=True, timeout=600)
    log = r.stdout + r.stderr
    open(os.path.join(out, f'{name}.log'), 'w').write(log)
    return r.returncode, log
src = open(lane).read()
lines = []
rc, _ = run('pristine'); lines.append(f'pristine rc {rc}')
for name, (a, b) in MUTANTS.items():
    assert src.count(a) == 1, (name, src.count(a))
    open(lane, 'w').write(src.replace(a, b))
    try:
        rc, log = run(f'mutant-{name}')
    finally:
        open(lane, 'w').write(src)
    failed = sorted({l.split(' > ')[-1].split(' ')[0].strip() for l in log.splitlines() if 'FAIL' in l and ' > ' in l})
    lines.append(f'{name} rc {rc} {"RED" if rc != 0 else "SURVIVED"} failing: {" ".join(failed)}')
rc, _ = run('pristine-after'); lines.append(f'pristine-after rc {rc}')
open(os.path.join(out, 'summary.txt'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
