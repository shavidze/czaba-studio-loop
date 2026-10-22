#!/bin/bash
cd "$(dirname "$0")"
for job in "m5.cjs 1440x900" "m5.cjs 1280x720" "std.cjs 1440x900" "std.cjs 1280x720" "fail87.cjs 1280x720 cdn,x3" "fail87.cjs 1440x900 cdn" "fail87.cjs 1440x900 timeout"; do
  set -- $job; log="${1%.cjs}-$2-${3:-all}.log"; echo "== $(date -u +%T) $job" >> run.log
  timeout 1200 node $job > "$log" 2>&1; echo "== $(date -u +%T) exit $?" >> run.log
  rm -f ../x-*
done
echo ALLDONE >> run.log
