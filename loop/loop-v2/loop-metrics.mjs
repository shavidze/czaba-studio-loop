// Per-round loop metrics ("evals for the loop"): cost, time, failures, C verdicts, browser coverage, publications.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? 'C:/Apps/czaba-project/tmp/studio-real-loop';
const read = (p) => {
  const b = readFileSync(p);
  if (b[0] === 0xff && b[1] === 0xfe) return b.toString('utf16le').replace(/^\uFEFF/, '');
  return b.toString('utf8').replace(/^\uFEFF/, '');
};
const json = (p) => { try { return existsSync(p) ? JSON.parse(read(p)) : null; } catch { return null; } };
const files = readdirSync(root);
const roundsSeen = new Set();
for (const f of files) { const m = f.match(/^[abc]-round-(\d+)(-result)?\.json$/); if (m) roundsSeen.add(Number(m[1])); }
const roundsList = [...roundsSeen].sort((a, b) => a - b);
const agentCost = (r, role) => {
  let cost = 0, ms = 0, turns = 0, failures = 0;
  for (const f of files) {
    if (f === `${role}-round-${r}-result.json` || f.startsWith(`${role}-round-${r}-result.json.attempt`) || f.startsWith(`${role}-round-${r}-limit`)) {
      const j = json(join(root, f)); if (!j) continue;
      cost += Number(j.total_cost_usd) || 0; ms += Number(j.duration_ms) || 0; turns += Number(j.num_turns) || 0;
      if (j.is_error) failures += 1;
    }
  }
  return { cost, ms, turns, failures };
};
const rows = [];
for (const r of roundsList) {
  const a = agentCost(r, 'a'), b = agentCost(r, 'b'), c = agentCost(r, 'c');
  const cr = json(join(root, `c-round-${r}.json`));
  const bugs = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const x of cr?.bugs ?? []) { const s = String(x.severity ?? '').toLowerCase(); if (s in bugs) bugs[s] += 1; }
  const blocked = (cr?.blocked ?? []).length;
  const blockedText = JSON.stringify(cr?.blocked ?? []);
  const browserVerified = cr?.browserVerified ?? (cr ? !/not run \(environment\)|returned 000|no browser|without a browser|servers? .*down/i.test(blockedText) : null);
  const gate = json(join(root, 'loop-v2', 'gates', `gate-round-${r}.json`));
  rows.push({ round: r, cStatus: cr?.taskStatus ?? '', ...Object.fromEntries(Object.entries(bugs).map(([k, v]) => [`bugs_${k}`, v])), blocked, browserVerified, costA: a.cost, costB: b.cost, costC: c.cost, cost: a.cost + b.cost + c.cost, hours: (a.ms + b.ms + c.ms) / 3.6e6, agentFailures: a.failures + b.failures + c.failures, gate: gate?.status ?? '' });
}
mkdirSync(join(root, 'loop-v2', 'metrics'), { recursive: true });
const cols = Object.keys(rows[0] ?? { round: 0 });
writeFileSync(join(root, 'loop-v2', 'metrics', 'rounds.csv'), [cols.join(','), ...rows.map((x) => cols.map((k) => typeof x[k] === 'number' ? (Number.isInteger(x[k]) ? x[k] : x[k].toFixed(3)) : String(x[k])).join(','))].join('\n') + '\n');
writeFileSync(join(root, 'loop-v2', 'metrics', 'rounds.json'), JSON.stringify(rows, null, 2));
const withC = rows.filter((x) => x.cStatus);
const sum = (k, xs = rows) => xs.reduce((s, x) => s + (Number(x[k]) || 0), 0);
const last10 = rows.slice(-10);
const md = [
  `# Loop metrics (generated ${new Date().toISOString()})`, '',
  `- rounds with data: ${rows.length} (${rows[0]?.round ?? '-'}..${rows.at(-1)?.round ?? '-'})`,
  `- total agent cost: $${sum('cost').toFixed(2)}; last 10 rounds: $${sum('cost', last10).toFixed(2)} (avg $${(sum('cost', last10) / Math.max(1, last10.length)).toFixed(2)}/round)`,
  `- agent time: ${sum('hours').toFixed(1)} h total`,
  `- C verdicts: PASS ${withC.filter((x) => x.cStatus === 'PASS').length}, FAIL ${withC.filter((x) => x.cStatus === 'FAIL').length}, BLOCKED ${withC.filter((x) => x.cStatus === 'BLOCKED').length}`,
  `- bugs found by C: critical ${sum('bugs_critical')}, high ${sum('bugs_high')}, medium ${sum('bugs_medium')}, low ${sum('bugs_low')}`,
  `- rounds where C had no real browser: ${rows.filter((x) => x.browserVerified === false).map((x) => x.round).join(', ') || 'none'}`,
  `- agent runs that ended in an error (limit/network/crash): ${sum('agentFailures')}`,
  `- root gate: ${rows.filter((x) => x.gate).map((x) => `${x.round}:${x.gate}`).join(', ') || 'no v2 gates yet'}`,
  '', '| round | C | bugs c/h/m/l | browser | cost $ | hours | errors | gate |', '|---|---|---|---|---|---|---|---|',
  ...rows.slice(-15).map((x) => `| ${x.round} | ${x.cStatus || '-'} | ${x.bugs_critical}/${x.bugs_high}/${x.bugs_medium}/${x.bugs_low} | ${x.browserVerified === null ? '-' : x.browserVerified ? 'yes' : 'NO'} | ${x.cost.toFixed(2)} | ${x.hours.toFixed(2)} | ${x.agentFailures} | ${x.gate || '-'} |`),
];
writeFileSync(join(root, 'loop-v2', 'metrics', 'summary.md'), md.join('\n') + '\n');
console.log(`metrics: ${rows.length} rounds, $${sum('cost').toFixed(2)} total`);
