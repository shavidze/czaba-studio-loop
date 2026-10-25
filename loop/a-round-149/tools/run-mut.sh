#!/bin/bash
# usage: run-mut.sh <id> <file>
set -u
ID=$1; FILE=$2
OUT=/home/runner/czaba-project/tmp/studio-real-loop/a-round-149/mutations
cd /home/runner/czaba-project/store
sha256sum "$FILE" > $OUT/$ID-mutated-sha.txt
npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx --reporter=json --outputFile=$OUT/$ID-vitest.json >/dev/null 2>&1
node -e 'const r=require(process.argv[1]);const t=r.testResults[0].assertionResults.map(a=>({test:a.title.split(":")[0],status:a.status}));const s={id:process.argv[2],file:process.argv[3],results:t,red:t.filter(x=>x.status!=="passed").map(x=>x.test)};require("fs").writeFileSync(process.argv[4],JSON.stringify(s,null,2));console.log(JSON.stringify(s.red))' $OUT/$ID-vitest.json $ID "$FILE" $OUT/$ID.json
