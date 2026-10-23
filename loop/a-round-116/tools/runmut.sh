#!/bin/bash
# usage: runmut.sh name file old new
cd /home/runner/czaba-project/store
T=/home/runner/czaba-project/tmp/studio-real-loop/a-round-116
python3 $T/tools/mutate.py "$2" "$3" "$4" || exit 2
timeout 300 npx vitest run app/lib/arrangement/__tests__/track-volume-db.test.tsx 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "^ +(✓|×) |Tests " > $T/mut/$1.txt
cp $T/mut/track-volume-db.ts.orig app/lib/arrangement/track-volume-db.ts
cp $T/mut/ArrangementLane.tsx.orig app/components/arrangement/ArrangementLane.tsx
sha256sum -c --quiet $T/mut/orig.sha && echo "$1 restored"
echo "== $1"; grep -E "×|Tests " $T/mut/$1.txt
