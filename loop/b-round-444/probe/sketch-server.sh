#!/usr/bin/env bash
# usage: sketch-server.sh start <abs dir> <port> <patch>  |  sketch-server.sh stop <port>
# start: git archive the store HEAD into <dir>/store, apply <patch> (-p1), own Vite cacheDir + port, dev server in background; waits for 200.
set -u
if [ "$1" = start ]; then
  D=$2; P=$3; PATCH=$4; S=$D/store
  mkdir -p "$S" && cd /home/runner/czaba-project/store && git archive HEAD | tar -x -C "$S" || exit 1
  cd "$S" && git apply -p1 "$PATCH" || exit 1
  ln -s /home/runner/czaba-project/store/node_modules "$S/node_modules"
  python3 -I -c "import sys;p='vite.config.ts';s=open(p).read();o='  plugins: [';assert s.count(o)==1;s=s.replace(o,\"  cacheDir: '\"+sys.argv[1]+\"/vite-cache',\n  server: { port: \"+sys.argv[2]+\", strictPort: true, host: '127.0.0.1' },\n\"+o);open(p,'w').write(s)" "$D" "$P" || exit 1
  (nohup npx remix vite:dev > "$D/dev-$P.log" 2>&1 &)
  for i in $(seq 1 60); do c=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:$P/studio-lab"); [ "$c" = 200 ] && { echo "sketch-server $P up"; exit 0; }; sleep 2; done
  echo "sketch-server $P not up"; exit 1
elif [ "$1" = stop ]; then
  P=$2; PID=$(ss -ltnpH "sport = :$P" | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
  [ -n "$PID" ] && kill "$PID" && echo "stopped pid $PID on $P" || echo "nothing on $P"
fi
