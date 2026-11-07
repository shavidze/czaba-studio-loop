#!/bin/bash
# usage: prog.sh row status note
f=/home/runner/czaba-project/tmp/studio-real-loop/c-round-384/progress.json
[ -f $f ] || echo '{}' > $f
python3 -I - "$f" "$1" "$2" "$3" <<'PY'
import json,sys
f,r,s,n=sys.argv[1:5]
d=json.load(open(f)); d[r]={"status":s,"note":n}; json.dump(d,open(f,"w"),indent=1)
PY
