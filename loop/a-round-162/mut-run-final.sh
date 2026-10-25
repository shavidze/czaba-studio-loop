#!/bin/bash
# usage: mut-run.sh <id> <description> <file> <testfiles...>
cd /home/runner/czaba-project/store
ID=$1; DESC=$2; FILE=$3; shift 3
OUT=../tmp/studio-real-loop/a-round-162/mutations-final/$ID-vitest.json
timeout 600 npx vitest run "$@" --reporter=json --outputFile=$OUT >/dev/null 2>&1
node -e '
const [id,desc,file,out,...tests]=process.argv.slice(1);
const r=require(out);
const failed=[];for(const f of r.testResults)for(const t of f.assertionResults)if(t.status!=="passed")failed.push({file:f.name.replace(/.*__tests__\//,""),title:t.title});
const res={id,description:desc,mutatedFile:file,testFiles:tests,mutantSha256:require("crypto").createHash("sha256").update(require("fs").readFileSync(file)).digest("hex"),passed:r.numPassedTests,failed:r.numFailedTests,total:r.numTotalTests,killed:r.numFailedTests>0,failedTests:failed};
require("fs").writeFileSync("../tmp/studio-real-loop/a-round-162/mutations-final/"+id+".json",JSON.stringify(res,null,2));console.log(JSON.stringify(res,null,1));' "$ID" "$DESC" "$FILE" "$OUT" "$@"
