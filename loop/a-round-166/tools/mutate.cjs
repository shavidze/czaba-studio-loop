const fs = require('node:fs');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const L = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-166';
const T = 'app/lib/arrangement/__tests__/';
const C = 'app/components/arrangement/';
const muts = [
  { id: 'm185', file: C + 'ArrangementMarkerRow.tsx', from: '<ChevronLeft className="size-2.25', to: '<ChevronLeft className="size-2.5', test: T + 'marker-strings-ui.test.tsx', expectRed: ['MS4'] },
  { id: 'm186', file: C + 'ArrangementMarkerRow.tsx', from: "focus-visible:ring-brand';\nconst MARKER_STEP_BUTTON_CLASS", to: "focus-visible:ring-brand inline-flex items-center justify-center';\nconst MARKER_STEP_BUTTON_CLASS", test: T + 'marker-strings-ui.test.tsx', expectRed: ['MS4'] },
  { id: 'm187', file: C + 'ArrangementDetailPanel.tsx', from: 'pl-2 pr-1', to: 'px-2', test: T + 'detail-panel-strings-ui.test.tsx', expectRed: ['DPS5'] },
  { id: 'm188', file: C + 'ArrangementDetailPanel.tsx', from: '<ChevronRight className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />\n          ) : (', to: '<ChevronDown className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />\n          ) : (', test: T + 'detail-panel-strings-ui.test.tsx', expectRed: ['DPS5'] },
  { id: 'm189', file: C + 'ArrangementGridMenu.tsx', from: "{option.id === checkedId ? (\n                <Check className=\"size-2.5 shrink-0\" strokeWidth={2.4} aria-hidden=\"true\" />\n              ) : null}", to: '<Check className="size-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />', test: T + 'grid-triplet-ui.test.tsx', expectRed: ['TU11'] },
  { id: 'm190', file: C + 'StudioWorkspace.tsx', from: '<ArrowLeft className', to: '<ChevronLeft className', extraFrom: "import { ArrowLeft } from 'lucide-react';", extraTo: "import { ChevronLeft } from 'lucide-react';", test: T + 'transport-surface-ui.test.tsx', expectRed: ['TS7'] },
  { id: 'm191', file: 'app/lib/arrangement/strings.ts', from: "collapseText: 'Collapse',", to: "collapseText: 'Collapse ▾',", test: T + 'strings.test.ts ' + T + 'detail-panel-strings-ui.test.tsx', expectRed: ['LG4', 'DPS1', 'DPS5'] },
];
const only = process.argv[2];
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for (const m of muts) {
  if (only && m.id !== only) continue;
  const orig = fs.readFileSync(m.file, 'utf8');
  const before = sha(m.file);
  const count = orig.split(m.from).length - 1;
  if (count !== 1) { console.log(m.id, 'anchor count', count); process.exit(1); }
  let mutated = orig.replace(m.from, m.to);
  if (m.extraFrom) mutated = mutated.replace(m.extraFrom, m.extraTo);
  fs.writeFileSync(m.file, mutated);
  const out = `${L}/mutations/${m.id}-vitest.json`;
  spawnSync('npx', ['vitest', 'run', ...m.test.split(' '), '--reporter=json', `--outputFile=${out}`], { stdio: 'ignore' });
  fs.writeFileSync(m.file, orig);
  const after = sha(m.file);
  const r = JSON.parse(fs.readFileSync(out, 'utf8'));
  const failed = r.testResults.flatMap((f) => f.assertionResults.filter((a) => a.status !== 'passed').map((a) => a.title));
  const killed = m.expectRed.every((id) => failed.some((t) => t.startsWith(id)));
  const rec = { id: m.id, file: m.file, from: m.from, to: m.to, extra: m.extraFrom ? [m.extraFrom, m.extraTo] : null, tests: m.test, expectedRed: m.expectRed, failedTests: failed, passed: r.numPassedTests, total: r.numTotalTests, killed, restoredSha256: after, restoredMatchesPostEdit: after === before };
  fs.writeFileSync(`${L}/mutations/${m.id}.json`, JSON.stringify(rec, null, 2));
  console.log(m.id, 'killed=' + killed, 'restored=' + (after === before), `${r.numPassedTests}/${r.numTotalTests}`, JSON.stringify(failed.map((t) => t.slice(0, 50))));
}
