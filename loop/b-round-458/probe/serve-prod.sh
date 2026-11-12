#!/usr/bin/env bash
# usage: serve-prod.sh start <abs out dir> <port> <rev|TREE>  |  serve-prod.sh stop <port>
# Production build of the store at <rev> (git archive) or of the current working tree (TREE, rsync without node_modules/build), served by remix-serve on 127.0.0.1:<port>.
set -u
R=/home/runner/czaba-project/store
if [ "$1" = start ]; then
  D=$2; P=$3; REV=$4; S=$D/store
  mkdir -p "$S" || exit 1
  if [ "$REV" = TREE ]; then rsync -a --exclude node_modules --exclude build --exclude .git "$R/" "$S/" || exit 1
  else (cd "$R" && git archive "$REV" | tar -x -C "$S") || exit 1; fi
  ln -sfn "$R/node_modules" "$S/node_modules"
  (cd "$S" && npx remix vite:build > "$D/build-$P.log" 2>&1) || { echo "build failed, see $D/build-$P.log"; exit 1; }
  (cd "$S" && PORT=$P HOST=127.0.0.1 setsid nohup npx remix-serve build/server/index.js > "$D/serve-$P.log" 2>&1 &)
  for i in $(seq 1 40); do c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:$P/"); [ "$c" = 200 ] && { echo "serve-prod $P up"; exit 0; }; sleep 1; done
  echo "serve-prod $P not up"; exit 1
elif [ "$1" = stop ]; then
  P=$2; PID=$(ss -ltnpH "sport = :$P" | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
  [ -n "$PID" ] && kill "$PID" && echo "stopped pid $PID on $P" || echo "nothing on $P"
fi
