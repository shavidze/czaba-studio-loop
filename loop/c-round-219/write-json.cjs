const fs = require('fs');
const L = '/home/runner/czaba-project/tmp/studio-real-loop/';
const env = JSON.parse(fs.readFileSync(L + 'env-status.json', 'utf8'));
const o = {
  taskStatus: 'PASS', browserVerified: true, realVerified: true, envStatus: env,
  bugs: [{
    id: 'C-R219-01', severity: 'low',
    steps: ['Classify the non-SPDX GPL spellings with classifyLicenseExpression (c-round-219/probe/spellings.probe.test.ts, run with the vitest config vitest.spell.config.mjs)', 'Inputs: GPLv3, GPLv2, GPL2, AGPLv3, (MIT OR GPLv3), MIT AND GPLv2, Proprietary, LicenseRef-Proprietary, SSPL-1.0, BUSL-1.1'],
    expected: 'A GPL licence written in a non-SPDX spelling is flagged (copyleft or unknown), so the runtime GPL/AGPL gate cannot pass it silently',
    actual: "all classify clean; COPYLEFT_ID_PATTERN /^A?GPL(-|\\+|$)/i follows the task §1.3 letter. This is a spec gap for B to rule on (A R-219-1, reviewer rated Medium), not an A defect; no effect on today's lock",
    evidence: 'c-round-219/probe/spellings.log',
  }],
  passed: ['SCOPE-219', 'LIC-RUN-219', 'REDPROOF-219', 'NOTICES-INDEP-219', 'NOTICES-FACTS-219', 'BUNDLE-219', 'MP3-SMOKE-219', 'STUDIO-SMOKE-219', 'G219-3', 'AN-REVIEW-219'],
  gate: ['full vitest', 'typecheck', 'biome', 'npm run verify', 'e2e smoke'],
  blocked: [],
  info: [
    'INFO-C219-LAME-DECODER: license.txt says LAME decoding functions use GPL (MPG123) code; the inlined WASM has no decoder strings, but its exports are minified, so this is not conclusive (for the Saba legal item)',
    'INFO-C219-WARMUP-MP3: MP3 attempt 1 was invalid (a Vite dep re-optimize + full reload at 05:10:04 on the fresh machine); replaced, 1 of 2 allowed; the next warm-up should include one MP3 export',
  ],
  ableton: 'not applicable on every row (task §4)',
};
fs.writeFileSync(L + 'c-round-219.json', JSON.stringify(o, null, 2) + '\n');
console.log('ok', JSON.parse(fs.readFileSync(L + 'c-round-219.json', 'utf8')).taskStatus);
