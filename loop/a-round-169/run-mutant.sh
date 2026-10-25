#!/bin/bash
# usage: run-mutant.sh <id> <description>  (run from store/)
L=../tmp/studio-real-loop; id=$1; desc=$2
npx vitest run app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx --reporter=json --outputFile=$L/a-round-169/mutations/$id-vitest.json >/dev/null 2>&1
node -e "
const j=require(process.argv[1]);const failed=[];
for(const f of j.testResults)for(const a of f.assertionResults)if(a.status!=='passed')failed.push(a.title.split(':')[0]);
const out={id:process.argv[2],change:process.argv[3],total:j.numTotalTests,failedCount:j.numFailedTests,failed,killed:failed.length>0};
require('fs').writeFileSync(process.argv[4],JSON.stringify(out,null,2));console.log(JSON.stringify(out));
" "$PWD/$L/a-round-169/mutations/$id-vitest.json" "$id" "$desc" "$L/a-round-169/mutations/$id.json"
