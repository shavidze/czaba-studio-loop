# B round 406 -> 407 mutant runner for the PERF-11c-iii-d-ii sketch. Usage: S=<scratch> OUT=<dir> python3 -I run.py
import os, subprocess
S = os.environ.get('S', '/tmp/b407-sketch')
OUT = os.environ.get('OUT', '/home/runner/czaba-project/tmp/studio-real-loop/b-round-406/mutants')
os.makedirs(OUT, exist_ok=True)
F = 'app/components/arrangement/ArrangementVideoDock.tsx'
T = 'app/lib/arrangement/__tests__/'
DP = T + 'drag-preview-render.test.tsx'
PRISTINE = [DP, T + 'video-fades-ui.test.tsx', T + 'floating-video.test.tsx']
FILT = ['-t', 'DP7[0-5]']
M = [
 ('MU-407-NO-INNER-MEMO', 'const ArrangementVideoDockView = memo(ArrangementVideoDockViewInner);', 'const ArrangementVideoDockView = ArrangementVideoDockViewInner;', 'DP73'),
 ('MU-407-NO-CAPTION-MEMO', 'const ArrangementVideoCaptionView = memo(ArrangementVideoCaption);', 'const ArrangementVideoCaptionView = ArrangementVideoCaption;', 'DP73'),
 ('MU-407-READER-PER-RENDER', 'useVideoLanePreviewReader(videoTrackId, getArrangement);', 'useVideoLanePreviewReader(videoTrackId, () => getArrangement());', 'DP73'),
 ('MU-407-NO-COMMIT-NOTIFY', '        publishedClips = clips;\n        for (const listener of [...commitListeners]) {\n          listener();\n        }', '        publishedClips = clips;', 'DP74'),
 ('MU-407-NO-COMMIT-SUBSCRIBE', '        commitListeners.add(listener);\n', '', 'DP74'),
 ('MU-407-NO-PUBLISH-EFFECT', '    videoLane.publishCommittedVideoClips(videoClips);\n', '    videoLane.readVideoLaneArrangement();\n', 'DP74'),
 ('MU-407-HAS-VIDEO-STUCK', 'const hasVideoClips = videoClips.length > 0;', 'const hasVideoClips = true;', 'DP75'),
]
def vt(files, log, extra=()):
    r = subprocess.run(['npx', 'vitest', 'run', *files, *extra], cwd=S, capture_output=True, text=True, timeout=900)
    open(log, 'w').write(r.stdout + r.stderr + f'\nrc {r.returncode}\n')
    return r.returncode, r.stdout + r.stderr
lines = []
rc, _ = vt(PRISTINE, f'{OUT}/pristine-before.log'); lines.append(f'PRISTINE-BEFORE rc {rc}')
for mid, old, new, expect in M:
    p = os.path.join(S, F); src = open(p).read()
    n = src.count(old)
    if n != 1:
        lines.append(f'{mid} SITE-COUNT {n} (skipped)'); continue
    open(p, 'w').write(src.replace(old, new, 1))
    try:
        rc, out = vt([DP], f'{OUT}/mutant-{mid}.log', FILT)
    finally:
        open(p, 'w').write(src)
    failed = [l.strip() for l in out.splitlines() if ('×' in l or 'FAIL' in l) and 'DP7' in l]
    named = any(expect in l for l in failed)
    lines.append(f'{mid} {"RED" if rc != 0 else "SURVIVED"} rc {rc} expect {expect} named-in-log {named}')
rc, _ = vt(PRISTINE, f'{OUT}/pristine-after.log'); lines.append(f'PRISTINE-AFTER rc {rc}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines (B uncommitted sketch: 2; a committed scratch: 0)')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
