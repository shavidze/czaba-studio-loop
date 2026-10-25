import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const LOOP = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-176';
const T = 'app/lib/arrangement/__tests__';
const C = 'app/components/arrangement';
const NEW = `${T}/mixer-onstate-colour-ui.test.tsx`;
const MUTE_ACCENT =
  "'border-accent bg-accent text-background enabled:hover:bg-accent enabled:active:bg-accent'";
const MUTE_NEW = "'border-muted bg-muted text-background enabled:hover:bg-muted enabled:active:bg-muted'";
const SOLO_BRAND =
  "'border-brand bg-brand text-brand-foreground enabled:hover:bg-brand enabled:active:bg-brand'";
const SOLO_NEW =
  "'border-foreground bg-foreground text-background enabled:hover:bg-foreground enabled:active:bg-foreground'";

const mutations = [
  { id: 'm258', file: `${C}/ArrangementLane.tsx`, from: MUTE_NEW, to: MUTE_ACCENT, tests: [NEW, `${T}/lane-strings-ui.test.tsx`] },
  { id: 'm259', file: `${C}/ArrangementLane.tsx`, from: SOLO_NEW, to: SOLO_BRAND, tests: [NEW, `${T}/lane-strings-ui.test.tsx`] },
  { id: 'm260', file: `${C}/ArrangementLane.tsx`, from: SOLO_NEW, to: MUTE_NEW, tests: [NEW] },
  { id: 'm261', file: `${C}/ArrangementGroupHeader.tsx`, from: MUTE_NEW, to: MUTE_ACCENT, tests: [NEW, `${T}/track-group-mix-ui.test.tsx`] },
  { id: 'm262', file: `${C}/ArrangementGroupHeader.tsx`, from: 'from-foreground/40', to: 'from-brand', tests: [NEW, `${T}/track-group-mix-ui.test.tsx`] },
  { id: 'm263', file: `${C}/ArrangementMaster.tsx`, from: MUTE_NEW, to: MUTE_ACCENT, tests: [NEW, `${T}/transport-surface-ui.test.tsx`] },
  { id: 'm264', file: `${C}/ArrangementDetailPanel.tsx`, from: 'hover:bg-foreground/50', to: 'hover:bg-accent/60', tests: [NEW, `${T}/affordance-colour-ui.test.tsx`] },
  { id: 'm265', file: `${C}/ArrangementGroupHeader.tsx`, from: "'border-brand bg-brand/60'", to: "'border-foreground bg-foreground/60'", tests: [NEW, `${T}/affordance-colour-ui.test.tsx`] },
];

const sha = (text) => createHash('sha256').update(text).digest('hex');
const only = process.argv[2];

for (const m of mutations) {
  if (only && m.id !== only) continue;
  const original = readFileSync(m.file, 'utf8');
  const before = sha(original);
  const occurrences = original.split(m.from).length - 1;
  if (occurrences !== 1) throw new Error(`${m.id}: expected 1 occurrence, got ${occurrences}`);
  writeFileSync(m.file, original.replace(m.from, m.to));
  const out = `${LOOP}/out/${m.id}.json`;
  try {
    execSync(`npx vitest run ${m.tests.join(' ')} --reporter=json --outputFile=${out}`, { stdio: 'ignore' });
  } catch {}
  writeFileSync(m.file, original);
  const after = sha(readFileSync(m.file, 'utf8'));
  if (after !== before) throw new Error(`${m.id}: restore sha mismatch`);
  const report = JSON.parse(readFileSync(out, 'utf8'));
  const failed = report.testResults.flatMap((f) =>
    f.assertionResults.filter((a) => a.status !== 'passed').map((a) => `${f.name.split('/').pop()} :: ${a.fullName}`),
  );
  const result = { id: m.id, file: m.file, from: m.from, to: m.to, tests: m.tests, total: report.numTotalTests, failedCount: failed.length, failed, restoredSha256: after, restoredOk: after === before };
  writeFileSync(`${LOOP}/mutations/${m.id}.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(m.id, failed.length, failed.map((f) => f.split(' :: ')[1].slice(0, 70)).join(' | '));
}
