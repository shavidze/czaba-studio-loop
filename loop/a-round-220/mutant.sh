#!/bin/bash
# usage: mutant.sh NAME FILE PYREPLACE_OLD PYREPLACE_NEW TESTFILE GREP
set -u
cd /home/runner/czaba-project/store
name=$1; file=$2; old=$3; new=$4; test=$5; pat=$6
log=../tmp/studio-real-loop/a-round-220/mutant-$name.log
before=$(sha256sum "$file" | cut -d' ' -f1)
cp "$file" /tmp/mut-backup
python3 - "$file" "$old" "$new" <<'PY'
import sys
p,a,b=sys.argv[1:4]; s=open(p).read()
assert s.count(a)==1, "pattern count %d"%s.count(a)
open(p,'w').write(s.replace(a,b))
PY
{ echo "MUTANT $name on $file"; echo "sha before: $before"; git diff -U0 "$file" | sed -n '5,40p';
  npx vitest run "$test" 2>&1 | grep -E "✗|×|FAIL|Tests |failed" | head -30; echo "vitest rc=${PIPESTATUS[0]}"; } > "$log" 2>&1
cp /tmp/mut-backup "$file"
after=$(sha256sum "$file" | cut -d' ' -f1)
echo "sha after restore: $after match=$([ "$before" = "$after" ] && echo yes || echo NO)" >> "$log"
echo "== $name"; grep -E "$pat|Tests |match=" "$log" | head -8
