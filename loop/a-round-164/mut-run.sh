#!/bin/bash
# usage: mut-run.sh <id> <description> <testfile>
L=/home/runner/czaba-project/tmp/studio-real-loop
cd /home/runner/czaba-project/store
npx vitest run "$3" --reporter=json --outputFile=$L/a-round-164/mutations/$1-vitest.json >/dev/null 2>&1
node -e "
const r=require('$L/a-round-164/mutations/$1-vitest.json');
const tests=[];for(const f of r.testResults)for(const a of f.assertionResults)tests.push({title:a.fullName||a.title,status:a.status});
const failed=tests.filter(t=>t.status!=='passed').map(t=>t.title);
const pick=(re)=>tests.filter(t=>re.test(t.title)).map(t=>({title:t.title,status:t.status}));
const out={id:'$1',mutation:process.argv[1],testFile:'$3',passed:r.numPassedTests,total:r.numTotalTests,failed:failed,EV1_OV1:pick(/EV1|OV1/),EU5_EU7_AL1:pick(/EU5|EU7|AL1/)};
require('fs').writeFileSync('$L/a-round-164/mutations/$1.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({id:out.id,passed:out.passed,total:out.total,failed:out.failed}));
" "$2"
