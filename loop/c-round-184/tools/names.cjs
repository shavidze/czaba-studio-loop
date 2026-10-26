const fs=require('fs');const path=require('path');
const j=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const root=process.argv[4];
const rows=[];for(const f of j.testResults){const rel=path.basename(f.name);for(const a of f.assertionResults){rows.push(`${rel} :: ${a.fullName} :: ${a.status}`);}}
rows.sort();fs.writeFileSync(process.argv[3],rows.join('\n')+'\n');
console.log('files',j.testResults.length,'total',j.numTotalTests,'passed',j.numPassedTests,'failed',j.numFailedTests,'pending',j.numPendingTests,'todo',j.numTodoTests);
for(const f of j.testResults)console.log(path.relative(root,f.name),f.assertionResults.length,f.status);
