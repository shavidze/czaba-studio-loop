#!/usr/bin/env bash
id=$1; desc=$2; expectTest=$3
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-158
cd /home/runner/czaba-project/store
mutsha=$(sha256sum app/components/arrangement/ArrangementTransport.tsx | cut -d' ' -f1)
npx vitest run app/lib/arrangement/__tests__/transport-surface-ui.test.tsx --reporter=json --outputFile=$L/mutations/$id-vitest.json > /dev/null 2>&1
node -e "
const r=require('$L/mutations/$id-vitest.json');
const t=r.testResults[0].assertionResults.map(a=>({name:a.title.slice(0,4),status:a.status,failure:(a.failureMessages[0]||'').split('\n')[0].slice(0,300)}));
t.forEach(x=>x.name=x.name.trim());const red=t.filter(x=>x.status==='failed').map(x=>x.name);
require('fs').writeFileSync('$L/mutations/$id.json',JSON.stringify({id:'$id',mutation:process.argv[1],mutatedSha256:'$mutsha',expectedRed:'$expectTest',red,killed:red.includes('$expectTest'),tests:t},null,1));
console.log('$id red=',red);
" "$desc"
