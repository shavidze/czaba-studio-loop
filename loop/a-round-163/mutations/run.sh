#!/usr/bin/env bash
# usage: run.sh <id> ; runs the 3 granted test files + floating-video and writes JSON
set -u
cd /home/runner/czaba-project/store
M=/home/runner/czaba-project/tmp/studio-real-loop/a-round-163/mutations
npx vitest run app/lib/arrangement/__tests__/strings.test.ts app/lib/arrangement/__tests__/floating-video.test.tsx app/lib/arrangement/__tests__/video-dock-strings-ui.test.tsx --reporter=json --outputFile=$M/$1-vitest.json >/dev/null 2>&1
node -e "
const r=require('$M/$1-vitest.json');
const failed=[];const passedNamed={};
for(const f of r.testResults)for(const t of f.assertionResults){if(t.status!=='passed')failed.push(t.title);}
console.log(JSON.stringify({id:'$1',total:r.numTotalTests,passed:r.numPassedTests,failed:r.numFailedTests,failedTitles:failed},null,1));
"
