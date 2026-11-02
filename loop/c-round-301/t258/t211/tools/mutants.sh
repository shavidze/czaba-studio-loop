#!/bin/bash
# C round 211 — independent mutant check in a scratch copy (never the real tree).
set -u
S=/tmp/c211-scratch; rm -rf $S; mkdir -p $S
cd /home/runner/czaba-project/store
tar --exclude=./node_modules --exclude=./build --exclude=./test-results --exclude=./.cache -cf - . | tar -xf - -C $S
ln -s /home/runner/czaba-project/store/node_modules $S/node_modules
cd $S
T=app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx
F=app/contexts/ArrangementContext.tsx
cp $F /tmp/c211-orig.tsx
echo "== unmutated"; npx vitest run $T 2>&1 | grep -E "Tests |✓|×|FAIL" | tail -25
python3 - <<'P'
p='app/contexts/ArrangementContext.tsx'; s=open(p).read()
old="""        const next = setClipGainDb(present, clipId, gainDb);
        const target = next.clips.find((entry) => entry.id === clipId)?.gainDb ?? 0;"""
assert s.count(old)==1
s=s.replace(old,"""        const next = setClipGainDb(present, clipId, gainDb);
        if (next === present) {
          return;
        }
        const target = next.clips.find((entry) => entry.id === clipId)?.gainDb ?? 0;""")
open(p,'w').write(s)
P
echo "== M14 (Trap 1 early return on pointer path)"; npx vitest run $T 2>&1 | grep -E "Tests |×|FAIL|AssertionError|Expected|Received" | head -20
cp /tmp/c211-orig.tsx $F
python3 - <<'P'
p='app/contexts/ArrangementContext.tsx'; s=open(p).read()
old="clipGains: clipLinearGains(mixed),"
assert s.count(old)==1
s=s.replace(old,"clipGains: clipLinearGains(arrangement),"); open(p,'w').write(s)
P
echo "== M7 (startGraph reads stored clip gains)"; npx vitest run $T 2>&1 | grep -E "Tests |×|FAIL|AssertionError|Expected|Received" | head -20
cp /tmp/c211-orig.tsx $F
cmp $F /home/runner/czaba-project/store/$F && echo "scratch restored = real"
cd /; rm -rf $S
