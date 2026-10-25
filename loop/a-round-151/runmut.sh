#!/bin/bash
# usage: runmut.sh ID
cd /home/runner/czaba-project/store
O=/home/runner/czaba-project/tmp/studio-real-loop/a-round-151/mutations
timeout 600 npx vitest run $(cat /tmp/files.txt) --reporter=json --outputFile=$O/$1.json > /tmp/mut.log 2>&1
node -e 'const r=require(process.argv[1]);const fails=[];for(const f of r.testResults)for(const a of f.assertionResults)if(a.status!=="passed")fails.push(f.name.split("/").pop()+" :: "+a.title);console.log(JSON.stringify({id:process.argv[2],passed:r.numPassedTests,failed:r.numFailedTests,total:r.numTotalTests,fails}))' $O/$1.json $1 | tee -a $O/summary.jsonl
