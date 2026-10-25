#!/usr/bin/env bash
# usage: run-mutation.sh <id> <description> <expected-red-tests> <test files...>
set -u
id="$1"; desc="$2"; expect="$3"; shift 3
cd /home/runner/czaba-project/store
out=/home/runner/czaba-project/tmp/studio-real-loop/a-round-168/mutations
npx vitest run "$@" --reporter=json --outputFile="$out/$id-vitest.json" >/dev/null 2>&1
node -e '
const fs=require("fs");
const [id,desc,expect,file]=process.argv.slice(1);
const j=JSON.parse(fs.readFileSync(file,"utf8"));
const failed=j.testResults.flatMap(r=>r.assertionResults.filter(a=>a.status==="failed").map(a=>a.title.split(" ")[0].replace(/:$/,"")));
const res={id,description:desc,expectedRed:expect.split(","),failedTests:failed,passed:j.numPassedTests,failed:j.numFailedTests,killed:expect.split(",").every(e=>failed.includes(e))};
fs.writeFileSync(file.replace("-vitest.json",".json"),JSON.stringify(res,null,2));
console.log(JSON.stringify(res));
' "$id" "$desc" "$expect" "$out/$id-vitest.json"
