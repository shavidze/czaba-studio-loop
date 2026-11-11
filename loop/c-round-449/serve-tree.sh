#!/usr/bin/env bash
# usage: serve-tree.sh start <abs out dir> <port> <git repo path> <rev>  |  serve-tree.sh stop <port>
# git archive <rev> of <repo> into <dir>/store, own Vite cacheDir + port, dev server in background; waits for 200 on /.
set -u
if [ "$1" = start ]; then
  D=$2; P=$3; R=$4; REV=$5; S=$D/store
  mkdir -p "$S" && cd "$R" && git archive "$REV" | tar -x -C "$S" || exit 1
  cd "$S" || exit 1
  ln -s /home/runner/czaba-project/store/node_modules "$S/node_modules"
  python3 -I -c "import sys;p='vite.config.ts';s=open(p).read();o='  plugins: [';assert s.count(o)==1;s=s.replace(o,\"  cacheDir: '\"+sys.argv[1]+\"/vite-cache',\n  server: { port: \"+sys.argv[2]+\", strictPort: true, host: '127.0.0.1' },\n\"+o);open(p,'w').write(s)" "$D" "$P" || exit 1
  (nohup npx remix vite:dev > "$D/dev-$P.log" 2>&1 &)
  for i in $(seq 1 90); do c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:$P/"); [ "$c" = 200 ] && { echo "serve-tree $P up"; exit 0; }; sleep 2; done
  echo "serve-tree $P not up"; exit 1
elif [ "$1" = stop ]; then
  P=$2; PID=$(ss -ltnpH "sport = :$P" | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
  [ -n "$PID" ] && kill "$PID" && echo "stopped pid $PID on $P" || echo "nothing on $P"
fi
