#!/usr/bin/env bash
cd /home/runner/czaba-project/store
id=$1; file=$2
npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/panel-radius-ui.test.tsx --reporter=json --outputFile=/tmp/mut-$id.json >/dev/null 2>&1
node -e "
const r=require('/tmp/mut-$id.json');
const failed=r.testResults.flatMap(f=>f.assertionResults.filter(a=>a.status==='failed').map(a=>a.title.split(':')[0]));
const out={id:'$id',file:'$file',sha256DuringMutation:require('child_process').execSync('sha256sum $file').toString().split(' ')[0],numFailed:r.numFailedTests,numPassed:r.numPassedTests,failedLocks:failed};
require('fs').writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/a-round-173/mutations/$id.json',JSON.stringify(out,null,2));
console.log(JSON.stringify(out));"
