#!/usr/bin/env bash
# usage: run-mutation.sh <id> <file> <description> <mutated|restored> <test files...>
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-161
cd /home/runner/czaba-project/store
ID=$1; F=$2; DESC=$3; PHASE=$4; shift 4
POST=$(grep " $F\$" $L/post-edit-sha256.txt | cut -d' ' -f1)
H=$(sha256sum $F | cut -d' ' -f1)
if [ "$PHASE" = mutated ]; then
  npx vitest run "$@" --reporter=json --outputFile=$L/mutations/$ID-vitest.json >/dev/null 2>&1
  node -e "const r=require('$L/mutations/$ID-vitest.json');const t={};for(const f of r.testResults)for(const a of f.assertionResults)if(a.status!=='passed')t[a.title.split(':')[0].trim()]=a.status;require('fs').writeFileSync('$L/mutations/$ID.json',JSON.stringify({id:'$ID',file:'$F',description:process.argv[1],testFiles:process.argv.slice(2),mutatedSha256:'$H',mutatedDiffersFromPost:'$H'!=='$POST',passed:r.numPassedTests,failed:r.numFailedTests,killedBy:Object.keys(t)},null,2));console.log(r.numPassedTests,r.numFailedTests,Object.keys(t))" "$DESC" "$@"
else
  node -e "const f='$L/mutations/$ID.json';const o=require(f);o.restoredSha256='$H';o.restoredEqualsPost='$H'==='$POST';require('fs').writeFileSync(f,JSON.stringify(o,null,2));console.log(o.killedBy,o.restoredEqualsPost)"
fi
