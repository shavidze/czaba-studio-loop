cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-377
node rows377.mjs http://127.0.0.1:5173 $PWD/rows-A.json > rows-A.log 2>&1; echo rc=$? >> rows-A.log
node rows377.mjs http://127.0.0.1:5174 $PWD/rows-HEAD.json > rows-HEAD.log 2>&1; echo rc=$? >> rows-HEAD.log
