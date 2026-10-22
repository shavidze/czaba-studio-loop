#!/bin/bash
cd "$(dirname "$0")"
until grep -q ALLDONE run.log; do sleep 5; done
for v in 1440x900 1280x720; do [ -f std-$v-all.log ] && mv std-$v-all.log std-$v.attempt1-harness.log; [ -f ../std-$v.json ] && mv ../std-$v.json ../std-$v.attempt1-harness.json; done
for job in "std.cjs 1440x900" "std.cjs 1280x720" "wfail.cjs 1440x900" "g87.cjs 1440x900" "g87.cjs 1280x720" "tok.cjs"; do
  set -- $job; log="${1%.cjs}-${2:-x}-r2.log"; echo "== $(date -u +%T) $job" >> run2.log
  timeout 1200 node $job > "$log" 2>&1; echo "== $(date -u +%T) exit $?" >> run2.log
  rm -f ../x-*
done
echo ALLDONE >> run2.log
