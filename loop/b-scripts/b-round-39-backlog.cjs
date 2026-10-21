const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(b.version === 40, 'version 40 expected, got ' + b.version);
b.version = 41;
b.updated = '2026-10-14 (B: round 39 result -> round 40 dispatch, D-29z5)';
b.current_task = 'current-task.md (round 40: C bugs from the round-39 record - detail panel content fit: C-R39-01 unsaved Clip Gain marker on one line next to the 0 dB button (visible "შეუნახავია", the rest sr-only, title, focus ring-warning), C-R30-01 info column lines no longer shrink and overlap (shrink-0, scroll instead), DETAIL-REASON-FIT Clip Gain/range reason lines one line with truncate + title; ArrangementDetailPanel.tsx only + new detail-panel-fit.test.tsx + doc 038 narrow; D-29z5)';
b.advisor_used_by_B += '; round 39 (2026-10-14): available, called once before writing (advice applied: C-R39-01 first with the round-size rule, one-line visible label derived from C numbers, measure placement before specifying (B browse: 44.2 + 4 + 69.8 = 118 <= 128), hard geometry criterion for C, dirty-tree baseline 383, round 39 declared checkpoint-ready with C-R39-01 open, backlog only from C evidence, PENDING-COMMIT-ORDER unit-only, review #3 queued and #8 rejected); B added C-R30-01 and the reason-line fit as the two related bugs of the same panel-fit family; second call after writing (see b-round-39.md)';
b.vitest_floor_round40 = 1312;
b.vitest_expected_round40 = '1312 + the new it count of detail-panel-fit.test.tsx; every existing suite unchanged (pending-status 22 included)';
b.baseline_tree_at_round40 = 'HEAD 6c7b4bb + round-39 working-tree changes (5 paths, C-verified shas 91fa12d6 / 4249f4f3 / 9d9f2122 / 7bf223eb / f2cd4b53) + 17 untracked root .codex/agents/*.toml, or a newer root commit containing exactly those shas; frozen b-round-39-tree-sha256.txt (383 = 380 + ArrangementContext.tsx + doc 037 + pending-status.test.tsx); snapshots b-round-39-snapshots/ (DetailPanel 4249f4f3, doc 038 7bf223eb); B gates b-round-39/gates.txt (tsc 0, vitest 71/1312)';

const lastRound = b.rounds[b.rounds.length - 1];
must(lastRound.round === 39, 'last round 39');
lastRound.status = 'C FAIL only on C-R39-01 (low); every other ID PASS';
lastRound.result = 'c-round-39.md / c-round-39.json: passed G39-1..3 (verify exit 0, 71 files, 1312/1312), R39-S, R39-ST-1..6 + 1280, R39-PM-2/3/RAW/VID/KEPT-TAB, R39-PO (unit-only), R39-MN-1..5, R39-CR-1/4, PG-DEL, D-20, R39-K, R39-U (mutations a-h + b2; (b) caught by S3-same-act), R39-Doc; failed PM-1 / PM-1280 visibility (C-R39-01: 3-line marker clipped 15 px at the default 144 px height; focus ring hides the warning border). C-R39-INFO-KEPT-PREMISE: use a REAL Tab while gesture 41 is held. Round 39 files are checkpoint-ready with C-R39-01 open (D-29z5).';
b.rounds.push({
  round: 40,
  task: 'current-task.md',
  items: ['C bugs (round-39 record): detail panel content fit - C-R39-01, C-R30-01, DETAIL-REASON-FIT'],
  status: 'dispatched',
  decision: 'D-29z5',
  note: 'baseline HEAD 6c7b4bb + round-39 working tree (C-verified shas) or a root checkpoint of it; frozen b-round-39-tree-sha256.txt (383); snapshots b-round-39-snapshots/ (DetailPanel 4249f4f3, doc 038 7bf223eb); B measurement b-round-39/measure-1440.txt, measure-reason-1440.txt',
  c_ids: ['R40-PM', 'R40-RS', 'R40-INFO', 'R40-MN', 'R40-CR', 'R40-K', 'R40-S', 'R40-U', 'R40-Doc', 'G40-1', 'G40-2', 'G40-3'],
  owned: [
    'app/components/arrangement/ArrangementDetailPanel.tsx (Clip Gain marker row + sr-only rest + title + pending focus ring; reason lines truncate + title; info column shrink-0 only)',
    'app/lib/arrangement/__tests__/detail-panel-fit.test.tsx (new)',
    'docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md (status line, layout section, problems entry, round-40 section, TODO only)',
  ],
});

const findings = b.open_findings;
must(Array.isArray(findings), 'open_findings array');
const byId = (id) => findings.find((x) => x.id === id);
const refusal = byId('C-R31-INFO-REFUSAL-STATUS');
must(refusal, 'refusal finding');
refusal.status = 'closed';
refusal.closed = 'round 39: C R39-ST-1..6 + ST-1280 PASS (c-round-39.md R39-ST; real clicks/Ctrl+Z with a synthetic held gesture 41; t0 = t150 = the prior status); mutations a, c, d killed';
const order = byId('PENDING-COMMIT-ORDER');
must(order, 'order finding');
order.status = 'closed (unit-only)';
order.closed = 'round 39: C R39-PO PASS unit-only - PO1-PO4 green on live source, PO1 red on the snapshot source, mutations g (no flush) and h (flush before the refusal guard) killed; not browser-verified because the pending Master state cannot be built honestly in the harness';
const r3701 = byId('C-R37-01');
must(r3701, 'C-R37-01');
r3701.status = 'open (visibility part = C-R39-01)';
r3701.round39_result = 'C round 39: part 1 semantics PASS (PM-2/3/RAW/KEPT-TAB/VID; data-pending, border-warning, aria-describedby, exact text), part 2 PASS (R39-ST), part 3 accepted (D-29z4); part 1 visibility FAIL -> C-R39-01';
r3701.to = 'round 40 (D-29z5) via C-R39-01';
const r3001 = byId('C-R30-01');
must(r3001, 'C-R30-01');
r3001.status = 'dispatched';
r3001.to = 'round 40 (D-29z5): detail panel content fit group with C-R39-01';
r3001.mechanism_b = 'the info column title and lane <p> elements have truncate (overflow hidden), so their flex min-height is 0 and they shrink inside the 69 px column; fix: shrink-0 so the lines keep 16 px and the overflow-y-auto content scrolls instead of overlapping';
findings.push({
  id: 'C-R39-01',
  severity: 'low',
  status: 'dispatched',
  to: 'round 40 (D-29z5)',
  title: 'the unsaved Clip Gain marker wraps to 3 lines in the w-32 slot and its 3rd line is clipped by 15 px at the default 144 px panel height (1440x900 and 1280x720); while focused, the teal focus ring hides the warning border',
  evidence: 'c-round-39/runs/pm-1440.txt (pend bottom 846 vs scroller bottom 831), c-round-39/runs/st-pm-1280.txt, c-round-39/shots/pm1-panel-1440.png, pm1-panel-1280.png, pm-kept-tab-1440.png; a-round-39.md section 4 (disclosed)',
  note: 'not a regression; data-pending, exact text, aria-describedby, border-warning and panel/lane geometry (+-0) are correct',
  b_measurement: 'b-round-39/measure-1440.txt: slot 128, font 12/16, label "შეუნახავია" 69.8 px nowrap, full text 257.5 px, 0 dB button 44.2 px; one line on its own row clips 3 px; inline with the button 118 <= 128',
});
findings.push({
  id: 'C-R39-INFO-KEPT-PREMISE',
  severity: 'info',
  status: 'closed (task wording)',
  title: 'PM-KEPT assumed the REAL Master click during a gesture blurs the Clip Gain field; since round 38 it keeps focus, so the next Volume click commits (CR-1 behaviour)',
  evidence: 'c-round-39.md R39-PM PM-KEPT / PM-KEPT-TAB',
  note: 'round 40 and later use PM-KEPT-TAB (a REAL Tab while gesture 41 is held)',
});
findings.push({
  id: 'DETAIL-REASON-FIT',
  severity: 'low',
  status: 'dispatched',
  to: 'round 40 (D-29z5)',
  title: 'the disabled Clip Gain reason (video 345.5 px, group 320.6 px nowrap) wraps to 3 lines in the w-32 slot and the range group reason (w-44) to 2 lines, so the same content-fit clipping is expected at the default height',
  evidence: 'B probe only: b-round-39/measure-reason-1440.txt (temporary DOM element, no source change; the real video/group states are measured by C in round 40)',
  note: 'not C-evidenced yet; C records the real state before judging',
});
findings.push({
  id: 'SSR-LAYOUT-EFFECT-WARN',
  severity: 'low',
  status: 'open',
  to: 'polish (after 4c)',
  title: 'React 18 dev SSR warns "useLayoutEffect does nothing on the server" from StudioWorkspace, ArrangementDetailPanel and (since round 39) ArrangementProvider',
  evidence: 'oct14-dev-error.log: 139 occurrences; a-round-39.md section 5 review #3',
  note: 'pre-existing class; follow the existing isomorphic alias pattern (ArrangementContext usePositionWriterEffect, l.410); not a C bug',
});
findings.push({
  id: 'MARKER-LIVE-REGION',
  severity: 'info',
  status: 'rejected',
  title: 'the unsaved marker is not a live region (a-round-39.md review #8)',
  note: 'rejected by D-29z5: aria-live would announce on every keystroke; the marker is exposed through aria-describedby on the focused field',
});

const srw13 = b.items.find((x) => x.id === 'SRW-13');
must(srw13, 'SRW-13');
srw13.decisions_round40 = 'D-29z5: round 39 C PASS on every ID except C-R39-01 (marker visibility). Round 40 fixes the detail panel content fit (C-R39-01 + C-R30-01 + DETAIL-REASON-FIT) in ArrangementDetailPanel.tsx only. The 4b-2 Pan group moves to round 41, group 3 to 42, group 4 to 43.';
const stage4b2 = (srw13.stages || []).find((st) => st.stage === '4b-2');
must(stage4b2 && Array.isArray(stage4b2.groups), '4b-2 groups');
for (const g of stage4b2.groups) {
  if (g.group === 1) {
    g.status = 'bug (C round 39: every ID PASS except C-R39-01 low; fit follow-up round 40)';
  } else if (g.group === 2) {
    g.round = '41';
  } else if (g.group === 3) {
    g.round = '42';
  } else if (g.group === 4) {
    g.round = '43';
  }
}
stage4b2.groups.splice(1, 0, { group: '1-fit', round: 40, decision: 'D-29z5', items: ['C-R39-01', 'C-R30-01', 'DETAIL-REASON-FIT'], status: 'dispatched' });

if (Array.isArray(b.planned_rounds)) {
  b.planned_rounds.push({ round: 40, items: ['detail panel content fit: C-R39-01, C-R30-01, DETAIL-REASON-FIT (D-29z5)'], note: 'C bugs first; Pan group shifted to round 41, group 3 to 42, group 4 to 43' });
}
fs.writeFileSync(path, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v41 written');
