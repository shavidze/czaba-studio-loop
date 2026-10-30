// node rr.cjs <id> <pass|fail|inconclusive|blocked|obs> "<detail>"
const R = require('./report.cjs');
const [id, v, detail] = process.argv.slice(2);
if (v === 'obs') { const d = R.load(); d.observations.push(`${id} — ${detail}`); R.saveJ(d); require('fs').appendFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-258.md', `- **${id}** (observation): ${detail}\n`); const pg='/home/runner/czaba-project/tmp/studio-real-loop/c-round-258/progress.json'; const p=JSON.parse(require('fs').readFileSync(pg)); if(!p.done.includes(id)) p.done.push(id); require('fs').writeFileSync(pg, JSON.stringify(p)); }
else R.record(id, v, detail);
