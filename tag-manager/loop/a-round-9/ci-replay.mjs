import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const repo = process.argv[2];
const require = createRequire(repo + '/package.json');
const yaml = require('js-yaml');
const wf = yaml.load(readFileSync(repo + '/.github/workflows/check.yml', 'utf8'));
for (const step of wf.jobs.check.steps) {
  if (!step.run || step.run === 'npm ci' || step.if) { console.log(`SKIP ${step.name ?? step.uses}`); continue; }
  const t0 = Date.now();
  const r = spawnSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', step.run], { cwd: repo, stdio: 'inherit', env: { ...process.env, CI: 'true', ...(step.env ?? {}) } });
  console.log(`STEP "${step.name}" rc=${r.status} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (r.status !== 0) process.exit(1);
}
