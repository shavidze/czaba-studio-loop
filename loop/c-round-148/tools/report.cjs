const fs = require('fs');
const path = require('path');
const LOOP = '/home/runner/czaba-project/tmp/studio-real-loop';
const J = path.join(LOOP, 'c-round-148', 'out', 'rv1-report-sink.json');
const MD = path.join(LOOP, 'c-round-148', 'out', 'rv1-report-sink.md');
const PG = path.join(LOOP, 'c-round-148', 'out', 'rv1-report-sink-progress.json');
function load() { return JSON.parse(fs.readFileSync(J, 'utf8')); }
function saveJ(d) { fs.writeFileSync(J, JSON.stringify(d, null, 1)); }
// verdict: pass|fail|inconclusive|blocked ; detail: short string
function record(id, verdict, detail, extra = {}) {
  const d = load();
  for (const k of ['passed', 'failed', 'inconclusive', 'blocked']) d[k] = d[k].filter((x) => (typeof x === 'string' ? x : x.id) !== id && !(typeof x === 'string' && x.startsWith(id + ' ')));
  if (verdict === 'pass') d.passed.push(id);
  else if (verdict === 'fail') d.failed.push(id);
  else if (verdict === 'inconclusive') d.inconclusive.push(`${id} — ${detail}`);
  else if (verdict === 'blocked') d.blocked.push(`${id} — ${detail}`);
  d.rows = d.rows || {};
  d.rows[id] = { verdict, detail, ...extra, utc: new Date().toISOString() };
  saveJ(d);
  fs.appendFileSync(MD, `- **${id}**: ${verdict.toUpperCase()} — ${detail}\n`);
  const pg = JSON.parse(fs.readFileSync(PG, 'utf8'));
  if (!pg.done.includes(id)) pg.done.push(id);
  if (extra.next) pg.next = extra.next;
  fs.writeFileSync(PG, JSON.stringify(pg));
}
function invalid(entry) { const d = load(); d.invalidRuns.push(entry); saveJ(d); fs.appendFileSync(MD, `- invalid run: ${entry.row} — ${entry.reason}\n`); }
function bug(b) { const d = load(); d.bugs = d.bugs.filter((x) => x.id !== b.id); d.bugs.push(b); saveJ(d); fs.appendFileSync(MD, `- **BUG ${b.id}** (${b.severity}): ${b.actual}\n`); }
module.exports = { record, invalid, bug, load, saveJ };
