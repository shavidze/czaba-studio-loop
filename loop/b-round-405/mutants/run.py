# B round 405 -> 406 mutant runner for the PERF-11c-iii-d-i sketch. Usage: S=<scratch> OUT=<dir> python3 -I run.py
import os, subprocess, sys, json
S = os.environ.get('S', '/tmp/b406-sketch')
OUT = os.environ.get('OUT', '/home/runner/czaba-project/tmp/studio-real-loop/b-round-405/mutants')
os.makedirs(OUT, exist_ok=True)
CTX = 'app/contexts/ArrangementContext.tsx'
T = 'app/lib/arrangement/__tests__/'
AC = T + 'actions-context.test.tsx'
VID = [T + 'floating-video.test.tsx', T + 'video-fades-ui.test.tsx']
M = [
 ('MU-406-DROP-LIVEPOS', CTX, '      getLibraryPreviewOffset,\n      getLivePosition: livePosition,\n      getLocatorPosition,\n      getPlaybackClock,', '      getLibraryPreviewOffset,\n      getLocatorPosition,\n      getPlaybackClock,', [AC], 'AC7'),
 ('MU-406-DROP-CLOCK', CTX, '      getPlaybackClock,\n      getStatus,\n      getStatusPreviewText,\n      isPointerGestureActive,\n      playFrom,', '      getStatus,\n      getStatusPreviewText,\n      isPointerGestureActive,\n      playFrom,', [AC], 'AC7'),
 ('MU-406-WRAP-LIVEPOS', CTX, '      getLibraryPreviewOffset,\n      getLivePosition: livePosition,\n      getLocatorPosition,\n      getPlaybackClock,', '      getLibraryPreviewOffset,\n      getLivePosition: () => livePosition(),\n      getLocatorPosition,\n      getPlaybackClock,', [AC], 'AC7'),
 ('MU-406-WRAP-CLOCK', CTX, '      getPlaybackClock,\n      getStatus,\n      getStatusPreviewText,\n      isPointerGestureActive,\n      playFrom,', '      getPlaybackClock: () => getPlaybackClock(),\n      getStatus,\n      getStatusPreviewText,\n      isPointerGestureActive,\n      playFrom,', [AC], 'AC7'),
]
def vt(files, log):
    r = subprocess.run(['npx', 'vitest', 'run', *files], cwd=S, capture_output=True, text=True, timeout=900)
    open(log, 'w').write(r.stdout + r.stderr + f'\nrc {r.returncode}\n')
    return r.returncode, r.stdout + r.stderr
lines = []
rc, _ = vt([AC] + VID, f'{OUT}/pristine-before.log'); lines.append(f'PRISTINE-BEFORE rc {rc}')
for mid, f, old, new, files, expect in M:
    p = os.path.join(S, f); src = open(p).read()
    n = src.count(old)
    if n != 1:
        lines.append(f'{mid} SITE-COUNT {n} (skipped)'); continue
    open(p, 'w').write(src.replace(old, new, 1))
    try:
        rc, out = vt(files, f'{OUT}/mutant-{mid}.log')
    finally:
        open(p, 'w').write(src)
    red = expect in out and ('FAIL' in out or '×' in out)
    lines.append(f'{mid} {"RED" if rc != 0 else "SURVIVED"} rc {rc} expect {expect} named-in-log {expect in out}')
rc, _ = vt([AC] + VID, f'{OUT}/pristine-after.log'); lines.append(f'PRISTINE-AFTER rc {rc}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines (sketch files expected: 3)')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
