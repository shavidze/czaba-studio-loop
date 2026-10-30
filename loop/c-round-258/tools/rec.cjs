const R = require('./report.cjs');
const [id, v, detail, next] = process.argv.slice(2);
R.record(id, v, detail, { evidence: `c-round-258/out/${id}.json`, next });
