#!/usr/bin/env bash
# Usage: run-probe.sh <tree-dir> <label: head|sketch> <port> <out-dir>
# Builds <tree-dir> (production), serves it with remix-serve on <port>, warms /studio-lab once in a browser,
# then runs stem-integrity-probe.mjs at 1440x900 and 1280x720 with playback, writing <out-dir>/<label>/<vp>.json.
set -u
TREE=$1; LABEL=$2; PORT=$3; OUT=$4
P=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$OUT/$LABEL"
(cd "$TREE" && npm run build > "$OUT/$LABEL/build.log" 2>&1); echo "build rc $?"
cd "$TREE" && PORT=$PORT nohup npx remix-serve build/server/index.js > "$OUT/$LABEL/serve.log" 2>&1 &
SPID=$!
for i in $(seq 1 60); do curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/studio-lab" | grep -q 200 && break; sleep 1; done
node "$P/stem-integrity-probe.mjs" "http://127.0.0.1:$PORT" 1440x900 "$OUT/$LABEL/warm.json" 0 > /dev/null 2>&1
for VP in 1440x900 1280x720; do
  node "$P/stem-integrity-probe.mjs" "http://127.0.0.1:$PORT" $VP "$OUT/$LABEL/$VP.json" 1 2> "$OUT/$LABEL/$VP.err"; echo "probe $VP rc $?"
done
kill $SPID 2>/dev/null; pkill -P $SPID 2>/dev/null
for pid in $(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oE 'pid=[0-9]+' | cut -d= -f2); do kill $pid; done
echo done
