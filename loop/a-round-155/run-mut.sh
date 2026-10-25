#!/bin/bash
cd /home/runner/czaba-project/store
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-155
npx vitest run $(cat $L/vitest-files.txt) --reporter=json --outputFile=$L/mutations/$1.json > /dev/null 2>&1
node -e 'const j=require(process.argv[1]);console.log(process.argv[2],"total",j.numTotalTests,"passed",j.numPassedTests,"failed",j.numFailedTests);for(const f of j.testResults)for(const a of f.assertionResults)if(a.status!=="passed")console.log(" RED:",f.name.split("/").pop(),"|",a.title,"|",(a.failureMessages[0]||"").split("\n")[0].slice(0,200))' $L/mutations/$1.json $1
