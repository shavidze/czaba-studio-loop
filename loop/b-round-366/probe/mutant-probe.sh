#!/usr/bin/env bash
# Usage: mutant-probe.sh <name> <python-file-that-mutates-src> <port>
set -u
NAME=$1; MUT=$2; PORT=$3
S=/home/runner/b366-scratch; P=/home/runner/czaba-project/tmp/studio-real-loop/b-round-366/probe
SRC=$S/app/lib/arrangement/stem-cache.client.ts
cp $SRC /tmp/b366-src-keep.ts
python3 -I $MUT /tmp/b366-src-keep.ts $SRC || exit 3
diff -u /tmp/b366-src-keep.ts $SRC > $P/mutant-$NAME.diff.txt
(cd $S && npm run build > /tmp/b366-mbuild-$NAME.log 2>&1); echo "build=$?"
cp /tmp/b366-src-keep.ts $SRC && cmp /tmp/b366-src-keep.ts $SRC && echo src-restored
cd $S && PORT=$PORT nohup npx remix-serve build/server/index.js > /tmp/b366-serve-$NAME.log 2>&1 &
SPID=$!
for i in $(seq 1 40); do curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$PORT/studio-lab | grep -q 200 && break; sleep 1; done
cd $P && node stem-integrity-probe.mjs http://127.0.0.1:$PORT 1440x900 /tmp/b366-warm-$NAME.json 0 > /dev/null 2>&1
node stem-integrity-probe.mjs http://127.0.0.1:$PORT 1440x900 $P/mutant-$NAME-1440x900.json 1 2> $P/mutant-$NAME-1440x900.err; echo "probe=$?"
kill $SPID 2>/dev/null; pkill -P $SPID 2>/dev/null
for pid in $(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oE 'pid=[0-9]+' | cut -d= -f2); do kill $pid; done
