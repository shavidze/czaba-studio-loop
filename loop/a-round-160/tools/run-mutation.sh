#!/usr/bin/env bash
# usage: run-mutation.sh <id> <description> <phase: mutated|restored>
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-160
cd /home/runner/czaba-project/store
F=app/components/arrangement/ArrangementTransport.tsx
POST=e032ddeec7c04ce97a721a6b0b17c51a7a00888a8387a8b132e1701f8f974fc8
ID=$1; DESC=$2; PHASE=$3
H=$(sha256sum $F | cut -d' ' -f1)
if [ "$PHASE" = mutated ]; then
  npx vitest run app/lib/arrangement/__tests__/transport-surface-ui.test.tsx --reporter=json --outputFile=$L/mutations/$ID-vitest.json >/dev/null 2>&1
  node -e "const r=require('$L/mutations/$ID-vitest.json');const t={};for(const f of r.testResults)for(const a of f.assertionResults)t[a.title.slice(0,4).trim()]=a.status;require('fs').writeFileSync('$L/mutations/$ID.json',JSON.stringify({id:'$ID',description:process.argv[1],mutatedSha256:'$H',mutatedDiffersFromPost:'$H'!=='$POST',passed:r.numPassedTests,failed:r.numFailedTests,tests:t,killedBy:Object.entries(t).filter(([,s])=>s==='failed').map(([k])=>k)},null,2));console.log(JSON.stringify(t))" "$DESC"
else
  node -e "const f='$L/mutations/$ID.json';const o=require(f);o.restoredSha256='$H';o.restoredEqualsPost='$H'==='$POST';require('fs').writeFileSync(f,JSON.stringify(o,null,2));console.log(o.killedBy,o.restoredEqualsPost)"
fi
