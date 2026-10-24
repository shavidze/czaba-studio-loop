#!/usr/bin/env bash
# usage: mut.sh <id> <test files...>  (run from store/)
id="$1"; shift
out="/home/runner/czaba-project/tmp/studio-real-loop/a-round-147/mut-$id.json"
timeout 600 npx vitest run "$@" --reporter=json --outputFile="$out" >/dev/null 2>&1
echo "exit $?"
node -e 'const r=require(process.argv[1]);console.log("total",r.numTotalTests,"failed",r.numFailedTests);for(const f of r.testResults)for(const a of f.assertionResults)if(a.status!=="passed")console.log("RED",f.name.split("/__tests__/")[1],"::",a.title.slice(0,60))' "$out"
