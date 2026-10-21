const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'backlog.json');
const b = JSON.parse(fs.readFileSync(file, 'utf8'));
if (b.version !== 8) throw new Error('expected v8, got ' + b.version);
const g = (id) => {
  const it = b.items.find((i) => i.id === id);
  if (!it) throw new Error('missing ' + id);
  return it;
};
const C7 = { verifier: 'C', report: 'tmp/studio-real-loop/c-round-7.md', json: 'tmp/studio-real-loop/c-round-7.json' };

b.version = 9;
b.updated = '2026-10-09';
b.current_task =
  'ROUND-8 (bounded, agent-workflow.md): SRW-11B stage 1 = detail panel (PNL-01, D-29 + D-29a). C-R7-01 / C-R6-02 / C-R7-02 stay open with a concrete follow-up spec (bug round after stage 1, or earlier if Tech Lead quiet-Chrome attributes the wrap lateness to the app). (tmp/studio-real-loop/current-task.md)';
b.advisor_used_by_B +=
  '; round 7 -> 8 (2026-10-09): available, called after orientation and before writing; advice applied (sync-budget rule routes round 8 to SRW-11B stage 1, concrete C-R7-01 instrumentation spec, read the old §7 draft, resolve the 1280x720 height budget from C n8 measurements as D-29a, A invokes design-philosopher, stage-1 grants exclude dock/lane/clip/library, detail playhead = position writer + 0-render test + R4-M2 and 3 R3-V1 light runs as adjacent, SRW-05 reflects the wrap regression)';

const s03 = g('SRW-03');
s03.evidence_round7 = {
  ...C7,
  passed: ['RF7-P1 (written criterion; forced layout 0 before and after, so it did not discriminate)', 'RF7-P2 (render test; browser Play-click LoAF vacuous, click+flush median 7.3 ms)', 'RF7-2 (R3-V1 L_1/L_3/L_4 + R2-V3 3/3; 1 INVALID replaced)', 'RF7-U', 'R10-N6', 'R4-M2', 'R27-1', 'e2e play + WAV export (gap -240 dB, bass onset 10.000125 s)'],
  failed: ['RF7-3: RF5-2 regression rule, L6_1 wrap 1 vt 2.244 (valid run) -> C-R7-01'],
  note: 'C-R6-02 stays open: INVALID run L_2 still shows ArrangementContext rAF scripts 49/61 ms coinciding with -0.246/-0.175 excursions; L_3 VideoDock step 16 ms. Cause unconfirmed. Fresh Play F_1..3 passes (round-6 plays:[] not reproduced).',
};
s03.status = 'regression_open';
const c602 = s03.open_bugs.find((x) => x.id === 'C-R6-02');
c602.status = 'open';
c602.round7_result =
  'Round 7 measure+fix done (A: tick+microtask p50 2.0 -> 0.7 ms, direct DOM position writers, memo lists). C: RF7-P1/P2/2 pass on written criteria, but app-attributed rAF LoAFs 49/61 ms recur in INVALID run L_2 and a 16 ms step LoAF in L_3. Forced-layout axis was 0 before and after (non-discriminating). Sync budget for this bug used; per agent-workflow.md it stays open without relaxed tolerances.';
c602.next =
  'Required evidence: Tech Lead quiet real Windows Chrome RF7-2 (VP9 + H.264). Concrete follow-up (bug round after SRW-11B stage 1, or earlier if quiet Chrome attributes the LoAFs to the app): remove the remaining per-frame React consumer LibraryPlayheadText (ArrangementLibraryPreview.tsx) via the position-writer pattern, and stop the post-hold isTransportRunning flip from re-rendering every useArrangement() consumer; prove with render counts and 3 valid R3-V1 light runs.';
s03.open_bugs.push({
  id: 'C-R7-01',
  severity: 'medium',
  title: 'RF5-2 loop-wrap landing late: L6_1 wrap 1 vt 2.244 at +300 ms (expected [2.29, 2.31]); setup runs 2.286 / 2.280, A 2.278; round 6 5/5 clean',
  status: 'open',
  evidence: 'c-round-7/runs/rf72-summary.txt, L6_1.json, L6_1_res.txt (swap 3.011 v1->v2, no hard seek, rateMax 1.3), L6_*_raw.json',
  analysis: 'Valid run (0 stalls, 0 app LoAF, CPU med 15 %). Round 7 did not change video-sync.ts, the dock step or position-store.ts; loop 2-4 sits inside one video clip, so the caption snapshot is not involved. No named app-side hypothesis yet; a re-measure-only round is excluded by agent-workflow.md.',
  follow_up_spec:
    'Instrument the standby hand-off per wrap (temporary harness wrapper, never left in source): standby readyState, currentTime and seeking at the swap instant; time of the pre-seek seeked event relative to the wrap; play() call -> playing event latency; first swap vs later swaps; rate writes in the first 300 ms. Decide from those numbers: (a) standby pre-seek issued too late or not settled before the wrap, (b) first-swap decoder warm-up, (c) environment. Fix only (a)/(b) with a unit test on the swap scheduling; keep D-19/D-24/D-24a. Verdict: RF5-2 rule on 3 valid runs (budget 3 + <= 2 environment replacements).',
  routed_to: 'bug round after SRW-11B stage 1 (with C-R6-02 candidates and C-R7-02), or earlier if Tech Lead quiet Chrome shows the lateness there',
});

const s05 = g('SRW-05');
s05.status = 'regression_open';
s05.regression_note = {
  ...C7,
  id: 'C-R7-01',
  detail: 'R5-L6 / RF5-2 video landing after loop wrap regressed in round 7 (L6_1 wrap 1 vt 2.244); audio wrap behaviour not implicated (export and e2e unchanged). Owned by SRW-03 open_bugs C-R7-01.',
};

const s10 = g('SRW-10');
s10.status = 'verified_except_manual';
s10.evidence_round7 = {
  ...C7,
  passed: ['R10-N5r (1280: empty 1.0 / Fit 1.0 / Ctrl+D x2 Fit 0.27 px; 1440: 1.0 / 1.0 / -0.02 px; gaps >= 40; 0 overlap; 0 cut; Fit 4 min and 20 min; extent grows)', 'R10-N5-U', 'R10-N1', 'R10-N3', 'R10-N6', 'R10-N8'],
  failed: [],
};
const c603 = s10.open_bugs.find((x) => x.id === 'C-R6-03');
c603.status = 'resolved';
c603.resolved_evidence = 'C round 7 R10-N5r + R10-N5-U PASS';
s10.open_bugs.push({
  id: 'C-R7-02',
  severity: 'low',
  title: 'ruler last-label overflow 1.41 px (1280, 206.8 px/s) / 1.47 px (1440, 186.5 px/s) on a zoom sweep (not a named R10-N5r case); empty default exactly 1.0 px; no overlap or cut label',
  status: 'open',
  evidence: 'c-round-7/runs/n5r-1280x720.json, n5r-1440x900.json (sweep, sweepWorst); A review L3 (step rule gives no label-width guarantee)',
  routed_to: 'bug round after SRW-11B stage 1; acceptance: overflow <= 1 px at every zoom of C sweep at both viewports',
});
s10.remaining = 'C-R7-02 (Low) and the Tech Lead real-mouse/wheel check; not done until both';

const lanePath = 'C-R6-01';
const s08 = g('SRW-08');
s08.evidence_round7 = { ...C7, passed: ['R26-1', 'R26-2', 'R26-3', 'R30-1', 'R30-2', 'R30-U', 'keyboard Volume refused during a clip drag (real $B press)'], resolved: [lanePath] };

const cp10 = b.open_findings.find((x) => x.id === 'checkpoint-r6-10');
cp10.status = 'resolved';
cp10.evidence = 'C round 7 R30-1/R30-2/R30-U PASS (D-30)';
b.open_findings.push({ id: 'C-R6-01', severity: 'low', status: 'resolved', evidence: 'C round 7 R30-1, R30-2, R30-U PASS; synthetic pointers only, real mouse/focus order (D-30 H1) on Tech Lead list' });
b.open_findings.push({ id: 'a7-review-pending', severity: 'low', status: 'open', note: 'A round 7 ran code-reviewer once; the fix delta was not re-reviewed (C §10). Next A round reviews its full diff including the round-7 fix delta touched files it changes.' });

const r7 = b.rounds.find((r) => r.round === 7);
r7.task = 'tasks/round-7.md';
r7.status = 'verified';
r7.c_result = 'FAIL (RF7-3 -> C-R7-01 Medium); RF7-P1, RF7-P2, RF7-2, RF7-U, R10-N5r, R10-N5-U, R30-1, R30-2, R30-U, R7-D1, G7-1..3 and adjacent R26-1..3, R4-M2, R10-N1/N3/N6/N8, R27-1 PASS; C-R6-02 stays open; new C-R7-02 Low';
r7.c_evidence = ['c-round-7.md', 'c-round-7.json', 'c-round-7/'];
r7.b_record = 'b-round-7.md';
r7.gates = 'C re-ran: tsc 0; vitest 50 files 779/779; build ok; biome owned 48 files 0, ./app 0 errors / 218 warnings; protected hashes 4x OK; Header.tsx identical to HEAD (+21/-0 vs cc1e531); forbidden imports 0; anon /studio-lab: no studio-token/recording/download/R2; anon studio-token 401; fake Bearer 500 no token (backend down); /studio/middle-east Sign in required';
b.rounds.push({
  round: 8,
  task: 'current-task.md',
  items: ['SRW-11B stage 1: detail panel (PNL-01)'],
  status: 'dispatched',
  note: 'bounded; sync bugs C-R7-01/C-R6-02 and Low C-R7-02 stay open with concrete follow-up specs (agent-workflow.md sync-budget rule; round-7 task section 3 pre-commitment)',
});

b.baseline_tree_at_round8 =
  'HEAD c5ed47b + 14 modified + 2 untracked (round 6 + round 7: render-budget.test.tsx, doc 016), verified by C round 7; must not be reverted; vitest baseline 50 files / 779 tests';

b.planned_rounds = [
  { round: 8, items: ['SRW-11B stage 1: detail panel (PNL-01), D-29 + D-29a'], pre_step: 'A invokes design-philosopher in pre-flight (B has no Agent tool; SRW-11A precedent); D-29 binding' },
  { round: 9, items: ['bug round: C-R7-01 (wrap hand-off instrumentation + fix), C-R6-02 named candidates (LibraryPlayheadText writer, isTransportRunning re-render), C-R7-02 (label overflow <= 1 px on sweep)'], note: 'moves earlier only if a Critical/High bug appears; Tech Lead quiet-Chrome evidence feeds it' },
  { round: 10, items: ['SRW-11B stage 2: track fold/height + lane auto-fit (TRK-04/05); reconcile D-29a 1280 budget'] },
  { round: 11, items: ['SRW-11B stage 3: floating expanded video (VID-06)'] },
  { milestone: 'after SRW-11B', items: ['full regression incl. regression_debt_g6r'] },
];

const s11b = g('SRW-11B');
s11b.status = 'dispatched_stage1';
s11b.stages = [
  { stage: 1, round: 8, scope: 'detail panel PNL-01', acceptance: ['R11-P1b', 'R11-P1c', 'R11-P4 (detail shots only)', 'R11-U (panels detail maths + detail component tests)'] },
  { stage: 2, scope: 'track fold/height + lane auto-fit', acceptance: ['R11-P2', 'R11-P2a', 'R11-P4 (fold shots)', 'R11-U (track/auto-fit)'], note: 'D-29a: at 1280x720 even auto-fit minimums (52 + 3 x 60) do not fit with detail open at 144 px; stage 2 must reconcile (C n8 measurements)' },
  { stage: 3, scope: 'floating expanded video', acceptance: ['R11-P3', 'R11-P4 (video shots)', 'R11-U (float clamp, same video nodes)'] },
];
s11b.decisions.push('D-29a (round 8): detail panel default open state chosen from the measured lane budget; see plan.md');

b.tech_lead_notes.push('Round 7 (C): RF7-3 FAIL on the RF5-2 wrap rule (C-R7-01, valid run, 0 app LoAF); C-R6-02 still shows app-attributed rAF LoAFs in an INVALID run; quiet real Chrome RF7-2 + RF5-2 loop run (VP9 + H.264) is the required next evidence for both');
const tl = b.tech_lead_manual_checks.find((x) => x.id.includes('RF7-2'));
tl.id = 'RF4-1/RF4-2 -> RF5-1/RF5-2 -> RF6-1/RF6-2 -> RF7-2/RF7-3';
tl.what = 'video drift (R3-V1 13 s) and loop-wrap landing (RF5-2 loop 2-4, 3 wraps) on a quiet real Windows Chrome, VP9 + H.264';
b.tech_lead_manual_checks.push({ id: 'R30-H1', what: 'real mouse / multi-touch / focus order on the track Volume slider during clip gestures (D-30)', reason: 'synthetic pointers only' });

fs.writeFileSync(file, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v9 written');
