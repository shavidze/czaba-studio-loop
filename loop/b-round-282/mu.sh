#!/bin/bash
# usage: mu.sh <name> <file> <python-replace-old> <new> [testfile-source]
name=$1; file=$2; old=$3; new=$4; tsrc=${5:-/tmp/b283/tree/app/lib/arrangement/__tests__/demo-synth-worker.test.ts}
d=/tmp/b283/mu-$name; rm -rf $d; cp -r /tmp/b283/tree $d; cp $tsrc $d/app/lib/arrangement/__tests__/demo-synth-worker.test.ts
python3 -I -c "import sys;p,o,n=sys.argv[1:];s=open(p).read();assert s.count(o)==1,(o,s.count(o));open(p,'w').write(s.replace(o,n))" $d/$file "$old" "$new" || exit 9
cd $d && npx vitest run app/lib/arrangement/__tests__/demo-synth-worker.test.ts 2>&1 | grep -E '×|✗|FAIL .*DW|Tests ' | sed 's/\x1b\[[0-9;]*m//g' | grep -oE '(DW[0-9]+[^:]*|Tests .*)' | sort -u
