#!/bin/bash
S=/home/runner/czaba-project/tmp/a265-scratch
ST=/home/runner/czaba-project/store
OUT=/home/runner/czaba-project/tmp/studio-real-loop/a-round-265
W=app/components/arrangement/StudioWorkspace.tsx
C=app/components/arrangement/ArrangementClip.tsx
L=app/components/arrangement/ArrangementLane.tsx
T=app/lib/arrangement/__tests__/background-time-selection-ui.test.tsx
restore() { cp $ST/$W $S/$W; cp $ST/$C $S/$C; cp $ST/$L $S/$L; cp $ST/$T $S/$T; }
run() { (cd $S && timeout 600 npx vitest run $T > $OUT/mutant-$1.txt 2>&1; echo "rc=$?" >> $OUT/mutant-$1.txt); }
restore; run control
restore; python3 - "$S/$W" <<'PY'
import sys;p=sys.argv[1];s=open(p).read()
a="mode: event.ctrlKey || event.metaKey ? 'marquee' : 'range',";assert s.count(a)==1
open(p,'w').write(s.replace(a,"mode: 'marquee',"))
PY
run M1
restore; python3 - "$S/$C" <<'PY'
import sys;p=sys.argv[1];s=open(p).read()
a="""    const current = Math.min(timelineSeconds, Math.max(0, onGrid(gesture.anchorTime + delta)));
    const anchor = Math.min(timelineSeconds, Math.max(0, onGrid(gesture.anchorTime)));"""
assert s.count(a)==1
s=s.replace(a,"""    const clipEnd = original.start + original.duration;
    const current = Math.min(clipEnd, Math.max(original.start, onGrid(gesture.anchorTime + delta)));
    const anchor = Math.min(clipEnd, Math.max(original.start, onGrid(gesture.anchorTime)));""")
open(p,'w').write(s)
PY
run M2
restore; python3 - "$S/$L" <<'PY'
import sys;p=sys.argv[1];s=open(p).read()
a="""    (range.allTracks === true || (range.trackId === track.id && !clips.some(isRangeInClip)))"""
assert s.count(a)==1
open(p,'w').write(s.replace(a,"    range.allTracks === true"))
PY
run M3
restore; (cd $ST && git show HEAD:$W) > $S/$W
run M4
restore; python3 - "$S/$W" <<'PY'
import sys;p=sys.argv[1];s=open(p).read()
a="latest.setTimeRange(end > start ? { start, end, trackId: gesture.trackId } : null);";assert s.count(a)==1
open(p,'w').write(s.replace(a,"latest.setTimeRange(step !== null && end === start ? null : { start, end, trackId: gesture.trackId });"))
PY
run M5
restore
for m in control M1 M2 M3 M4 M5; do echo "== $m"; grep -E "Tests |rc=" $OUT/mutant-$m.txt; grep -E "^ *(×|✗)|FAIL .*>" $OUT/mutant-$m.txt | sed 's/\x1b\[[0-9;]*m//g' | head -20; done
diff -r -q --exclude node_modules --exclude .git --exclude build --exclude test-results $ST/app $S/app && echo SCRATCH-RESTORED
