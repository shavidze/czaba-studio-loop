#!/bin/bash
cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-248
node scripts/c248.cjs http://127.0.0.1:5173 out-fix > run-fix.log 2>&1
node scripts/c248.cjs http://127.0.0.1:5174 out-head > run-head.log 2>&1
node ../c-round-247/c247.cjs http://127.0.0.1:5173 out-std 'budget|smoke|auth' > run-std.log 2>&1
echo DONE >> run-std.log
