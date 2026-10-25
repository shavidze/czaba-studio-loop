#!/bin/bash
# usage: run.sh id "change" "expected"
cd /home/runner/czaba-project/store
L=/home/runner/czaba-project/tmp/studio-real-loop
T=app/lib/arrangement/__tests__
npx vitest run $T/export-dialog-hold-enter.test.tsx $T/video-dock-strings-ui.test.tsx --reporter=json --outputFile=$L/a-round-171/mutations/$1-vitest.json >/dev/null 2>&1
node -e "
const r=require('$L/a-round-171/mutations/$1-vitest.json');
const failed=[];for(const f of r.testResults)for(const a of f.assertionResults)if(a.status!=='passed')failed.push(a.title.split(' ')[0].replace(':',''));
const o={id:'$1',change:process.argv[1],mustTurnRed:process.argv[2].split(','),failed,passed:r.numPassedTests,total:r.numTotalTests};
o.red=o.mustTurnRed.every(x=>failed.includes(x));
require('fs').writeFileSync('$L/a-round-171/mutations/$1.json',JSON.stringify(o,null,2));console.log(JSON.stringify(o));
" "$2" "$3"
rm -f $L/a-round-171/mutations/$1-vitest.json
