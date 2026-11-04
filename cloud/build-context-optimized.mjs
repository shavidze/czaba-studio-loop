// Optimized "active" view of the loop's planning state (replaces kit's build-context.mjs).
// Saba 2026-11-04: aggressive compaction — closed findings excluded, Low/info one-line,
// done queue items ID-only, last 10 rounds, evidence truncated to 300 chars.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const loop = process.argv[2];
const read = (p) => { const b = readFileSync(p); return (b[0] === 0xff && b[1] === 0xfe ? b.toString('utf16le') : b.toString('utf8')).replace(/^﻿/, ''); };
const json = (p) => { try { return existsSync(p) ? JSON.parse(read(p)) : null; } catch { return null; } };
const backlog = json(join(loop, 'backlog.json')) ?? {};
const closed = /^(closed|resolved|done|accepted|recorded|superseded|merged|fixed|verified|wontfix|not a bug)/i;
const clip = (v, n = 300) => typeof v === 'string' ? (v.length > n ? `${v.slice(0, n)} …[see backlog.json]` : v) : Array.isArray(v) ? v.map((x) => clip(x, n)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clip(x, n)])) : v;

const head = existsSync(join(loop, 'current-task.md')) ? read(join(loop, 'current-task.md')).split('\n').slice(0, 40).join('\n') : '';
const items = Array.isArray(backlog.items) ? backlog.items : [];
const idsInTask = new Set(items.map((i) => String(i.id)).filter((id) => id && head.includes(id)));
const findings = backlog.findings ?? backlog.open_findings ?? [];
const rounds = Array.isArray(backlog.rounds) ? backlog.rounds : [];

// --- Optimization 1: exclude closed findings entirely, Low/info → one-line ---
const openFindings = [];
for (const f of findings) {
  if (closed.test(String(f.status ?? ''))) continue; // skip closed
  const sev = String(f.severity ?? 'info').toLowerCase();
  if (sev === 'low' || sev === 'info') {
    openFindings.push({ id: f.id, severity: f.severity, status: String(f.status ?? '').slice(0, 60), title: String(f.title ?? '').slice(0, 100) });
  } else {
    openFindings.push(clip(f, 300));
  }
}

// --- Optimization 2: done queue items → ID-only ---
const queue = backlog.post_current_stage_queue ?? [];
const compactQueue = [];
for (const item of queue) {
  if (!item || typeof item !== 'object') continue;
  const st = String(item.status ?? '');
  if (/done|complete|v1_complete/i.test(st)) {
    compactQueue.push({ id: item.id, status: 'done' });
  } else {
    // Active items: keep but compact sub-stages
    const copy = { ...item };
    for (const key of ['stages', 'order', 'items']) {
      if (Array.isArray(copy[key])) {
        copy[key] = copy[key].map((s) =>
          s && typeof s === 'object' && /done|complete/i.test(String(s.status ?? ''))
            ? { id: s.id, status: 'done' }
            : clip(s, 300)
        );
      }
    }
    compactQueue.push(clip(copy, 300));
  }
}

const active = {
  _about: 'Optimized active view (2026-11-04). Closed findings excluded, Low/info one-line, done items ID-only. Full data in backlog.json.',
  _generatedUtc: new Date().toISOString(),
  current_task: backlog.current_task,
  done_policy: backlog.done_policy,
  protected_files: backlog.protected_files,
  rules: backlog.rules ?? backlog.harness_rules,
  current_items_full: items.filter((i) => idsInTask.has(String(i.id))).map(({ evidence, ...rest }) => clip(rest, 300)),
  other_open_items: compactQueue,
  open_findings: openFindings,
  recent_rounds: rounds.slice(-10),
  other_keys: Object.keys(backlog).filter((k) => !['_about', '_generatedUtc'].includes(k)),
};

mkdirSync(join(loop, 'context'), { recursive: true });
const text = JSON.stringify(active, null, 2);
writeFileSync(join(loop, 'context', 'active-backlog.json'), text);

// Summary
const st = json(join(loop, 'status.json')), env = json(join(loop, 'env-status.json')), pub = json(join(loop, 'last-publication.json'));
const gates = existsSync(join(loop, 'gates')) ? readdirSync(join(loop, 'gates')).filter((f) => /^gate-round-\d+\.json$/.test(f)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0])) : [];
const lastGate = gates.length ? json(join(loop, 'gates', gates.at(-1))) : null;
const L = [`# Active loop summary (${active._generatedUtc})`, ''];
if (existsSync(join(loop, 'backlog.json'))) L.push(`- backlog.json ${(read(join(loop, 'backlog.json')).length / 1024).toFixed(0)} KB -> active view ${(text.length / 1024).toFixed(0)} KB`);
if (st) L.push(`- status: ${st.phase} round ${st.round}`);
if (env) L.push(`- servers: \`${JSON.stringify(env)}\``);
if (pub) L.push(`- last publication: ${pub.commit} (rounds ${pub.rounds})`);
if (lastGate) L.push(`- last root gate: round ${lastGate.round} ${lastGate.status} - ${lastGate.reason}`);
const critHigh = openFindings.filter((f) => ['critical', 'high', 'medium'].includes(String(f.severity ?? '').toLowerCase())).length;
L.push('', `## Current items: ${[...idsInTask].join(', ') || '-'}`, '');
L.push(`## Open findings: ${openFindings.length} (${critHigh} Critical/High/Medium)`);
for (const f of openFindings.filter((f) => ['critical', 'high', 'medium'].includes(String(f.severity ?? '').toLowerCase()))) {
  L.push(`- **${f.id}** / ${f.severity} / ${f.status} / ${String(f.title ?? '').slice(0, 140)}`);
}
L.push(`- ... and ${openFindings.length - critHigh} Low/info (see backlog.json)`);
writeFileSync(join(loop, 'context', 'active-summary.md'), L.join('\n') + '\n');
console.log(`context ${(text.length / 1024).toFixed(0)} KB (${openFindings.length} findings, ${critHigh} crit/high/med), items ${active.current_items_full.length}+${compactQueue.length}`);
