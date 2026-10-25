#!/bin/bash
# usage: run-mutation.sh <id> <description> <expectedRed comma> <test files...>
cd /home/runner/czaba-project/store
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-167
id=$1; desc=$2; expected=$3; shift 3
npx vitest run "$@" --reporter=json --outputFile=$L/mutations/$id-vitest.json >/dev/null 2>&1
node -e '
const [id,desc,expected,file]=process.argv.slice(1);
const r=require(file);
const failed=[];for(const f of r.testResults)for(const a of f.assertionResults)if(a.status!=="passed")failed.push(a.title.split(" ")[0].replace(":",""));
const exp=expected.split(",");
const killed=exp.every(e=>failed.includes(e));
require("fs").writeFileSync(file.replace("-vitest.json",".json"),JSON.stringify({id,mutation:desc,expectedRed:exp,failed,numFailed:r.numFailedTests,numTotal:r.numTotalTests,killed},null,2));
console.log(id,"killed="+killed,"failed=",failed.join(","));
' "$id" "$desc" "$expected" "$L/mutations/$id-vitest.json"
