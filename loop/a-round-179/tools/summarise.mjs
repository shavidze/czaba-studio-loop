import { readFileSync } from 'node:fs';
const [id, desc, diffPath, jsonPath, restore, sha] = process.argv.slice(2);
const r = JSON.parse(readFileSync(jsonPath, 'utf8'));
const watch = ['LRS5', 'PW1', 'PW6', 'DXL3', 'DXL8', 'DXT8'];
const status = {};
const failed = [];
for (const f of r.testResults) for (const a of f.assertionResults) {
  const m = a.title.match(/^([A-Z]+\d+[a-z]?)\b/);
  const tid = m ? m[1] : a.title;
  if (a.status !== 'passed') failed.push(`${f.name.split('/').pop()} :: ${a.title}`);
  if (watch.includes(tid)) status[tid] = a.status;
}
console.log(JSON.stringify({ id, mutation: desc, diff: readFileSync(diffPath, 'utf8'), passed: r.numPassedTests, total: r.numTotalTests, watched: status, failed, restoreShaCheck: restore, restoredSha256: sha }, null, 2));
