// node rec199.cjs <id> : records PASS from out/<id>.json when all checks true and net ok
const R = require('./report.cjs'); const fs = require('fs'); const path = require('path');
const id = process.argv[2]; const f = path.join(__dirname, '..', 'out', `${id}.json`);
const r = JSON.parse(fs.readFileSync(f, 'utf8'));
const pass = !r.error && r.checks && Object.values(r.checks).every(Boolean) && r.net && r.net.ok;
if (pass) { R.record(id, 'pass', `checks ${Object.keys(r.checks).join(',')} all true; net ok (noise ${r.net.noise}); evidence c-round-258/out/${id}.json`); console.log('RECORDED PASS', id); }
else console.log('NOT RECORDED', id, r.error || JSON.stringify(r.checks), JSON.stringify(r.net && r.net.bad));
