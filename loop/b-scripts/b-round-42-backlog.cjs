const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(b.version === 44, 'version 44 expected, got ' + b.version);
b.version = 45;
b.updated = '2026-10-14 (B: round 42 result -> round 43 dispatch, D-29z8)';
b.current_task = 'current-task.md (round 43: SRW-13 stage 4b-2 group 4 - MASTER-HOLD-TICK-EDGE (the Master hold tick stays fully inside the meter at holdDb >= +6, unchanged within 0.5 px at <= +5 dB) + A-R38-TEST-ORDER (fader focus before beginGesture: a test red on mutation (i) or a written equivalence proof) + A-R37-TEST-HARDENING (fader-guards C-R36-01 describe: N5 mid-test pin, N1/N2 real focus move); ArrangementMaster.tsx + fader-guards.test.tsx (narrow) + new master-hold-tick.test.tsx + new fader-focus-order.test.tsx + new doc 040; D-29z8)';
b.advisor_used_by_B += '; round 42 (2026-10-14, restarted session): available (Fable), called before writing twice (1: follow the plan queue, rebuild the frozen list from the new HEAD b6a96f8, verify remotes, close FOREIGN-CI-YML on root evidence, fix the REG-DEL wording, browse rule no restart; 2: group 3 collapses into dispositions after the source read, so round 43 = group 4 with a geometric hold-tick contract, a predicted-or-equivalent A-R38 outcome and a narrow fader-guards grant) and once after writing (see b-round-42.md)';
b.vitest_floor_round43 = 1333;
b.vitest_expected_round43 = '1333 + the new it count of master-hold-tick.test.tsx and fader-focus-order.test.tsx; fader-guards keeps its 71 its (edits inside the C-R36-01 describe only); every other suite unchanged';
b.baseline_tree_at_round43 = 'HEAD b6a96f8 (root round-42 checkpoint incl. root .github/workflows/ci.yml + vercel.json; both master remotes verified by B git ls-remote 19:27), git status empty; round-42 files at C shas (ArrangementLane 855bc517, pan-release-recovery.test de42634f, doc 039 9b15bc74); frozen b-round-42-tree-sha256.txt (387 = 386 - ArrangementMaster.tsx - fader-guards.test.tsx + the 3 round-42 files); snapshots b-round-42-snapshots/ ArrangementMaster.tsx 1707798c, fader-guards.test.tsx 9721d08f; B gates b-round-42/gates.txt (tsc 0, vitest 74/1333, protected 4/4, /studio-lab 200 after a 000 at 19:2x)';
b.loop_runner_note = 'if run-loop.ps1 stopped on -RoundLimit, restart with -StartRound 43 -StartPhase A and a higher limit';

const lastRound = b.rounds[b.rounds.length - 1];
must(lastRound.round === 42, 'last round 42');
lastRound.status = 'C PASS';
lastRound.result = 'c-round-42.md / c-round-42.json: PASS G42-1 (tsc 0; 10 suites 270/270; vitest 74 files 1333/1333; build; verify exit 0; Biome 2 baseline CRLF errors, 218 warnings, 0 in the round files), G42-2 (3 contracted paths, 386 OK, protected 4/4; plus the foreign root .github/workflows/ci.yml, untouched), G42-3 (anonymous direct + header link, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer 500 without token, /studio/middle-east Sign in required), R42-S (4 hunks +7/-0), R42-U (old source PK1/PK3/RW1/RW2 red, PK2/PK4/RW3/RW4 green; mutations a-f each caught), R42-Doc, R42-PK (PK-B, PK-LATE, PK-NEG, PK-1280; live StereoPanner follows), R42-RW (RW-B, RW-KEY, RW-GESTURE, RW-NORMAL), R42-REG (KEYS, RESET, DEL with the corrected frozen expectation, DRAG, FADERS). Root checkpoint b6a96f8 (both remotes verified by B).';
b.rounds.push({
  round: 43,
  task: 'current-task.md',
  items: ['SRW-13 4b-2 group 4: MASTER-HOLD-TICK-EDGE, A-R38-TEST-ORDER, A-R37-TEST-HARDENING'],
  status: 'dispatched',
  decision: 'D-29z8',
  note: 'baseline HEAD b6a96f8 clean; frozen b-round-42-tree-sha256.txt (387); snapshots b-round-42-snapshots/ (ArrangementMaster 1707798c, fader-guards 9721d08f); group 3 resolved by B decision without code (FADER-KEY-ENTRIES and A-R29-REVIEW-1 accepted, A-R33-REVIEW-TOUCH to the Tech Lead R38-T)',
  c_ids: ['R43-HT', 'R43-U', 'R43-REG', 'R43-S', 'R43-Doc', 'G43-1', 'G43-2', 'G43-3'],
  owned: [
    'app/components/arrangement/ArrangementMaster.tsx (hold tick geometry only)',
    'app/lib/arrangement/__tests__/fader-guards.test.tsx (inside the C-R36-01 describe only)',
    'app/lib/arrangement/__tests__/master-hold-tick.test.tsx (new)',
    'app/lib/arrangement/__tests__/fader-focus-order.test.tsx (new)',
    'docs/implementation/2026/quarter-IV/040-studio-lab-master-hold-tick-and-fader-test-hardening.md (new)',
  ],
});

const findings = b.open_findings;
const byId = (id) => findings.find((x) => x.id === id);
const close = (id, text) => { const f = byId(id); must(f, id); f.status = 'closed'; f.closed = text; };
close('A-R32-REVIEW-1', 'round 42: C R42-PK PASS (PK-B/PK-LATE/PK-NEG at 1440, PK-1280; c-round-42.md section 4.1) + R42-U (PK1/PK3 red on the snapshot Lane, mutations a, b, c, f caught)');
close('CP-R37-PAN-KEY-LOCK', 'round 42: same evidence as A-R32-REVIEW-1 (c-round-42.md sections 4.1, 5)');
close('A-R31-REVIEW-2', 'round 42: C R42-RW PASS (RW-B, RW-KEY, RW-GESTURE: no visual-only draft during another gesture, gesture-blocked status, RW-NORMAL; c-round-42.md section 4.2) + R42-U (RW1/RW2 red on the snapshot Lane, mutations d, e caught)');
close('CP-R37-DRAG-ENTRIES', 'round 42: same evidence as A-R31-REVIEW-2 (c-round-42.md sections 4.2, 5)');

const fke = byId('FADER-KEY-ENTRIES');
must(fke, 'FADER-KEY-ENTRIES');
fke.status = 'accepted';
fke.accepted = 'B decision D-29z8 (2026-10-14), no code: Volume/Master commit on keyup and Pan writes one entry per value-changing key, so all three faders follow D-29v "keyboard step = one entry"; behaviour evidenced by C round 42 REG-FADERS (Volume, Master: one entry per REAL key) and REG-KEYS (Pan), round 30 R30-K. No Ableton claim. Re-recorded by C in round 43 REG-FADERS.';
fke.to = 'accepted (D-29z8)';

const r29 = byId('A-R29-REVIEW-1-PENDING-FADER-UNDO-LABEL');
must(r29, 'A-R29-REVIEW-1');
r29.status = 'accepted';
r29.accepted = 'B decision D-29z8 (2026-10-14), no code, no C evidence (accepted, not closed): the flushed entry is a real uncommitted Volume/Master change (applyEdit l.961-962 flushes before the next edit); after a no-op Cut Time the undo label truthfully names that entry and the status speaks about the Cut Time. Reachable only by key rollover (an arrow held on a fader while Ctrl+Shift+X is pressed; Ctrl+Shift+X is not range-gated, StudioWorkspace l.1153-1161).';
r29.to = 'accepted (D-29z8)';

const touch = byId('A-R33-REVIEW-TOUCH');
must(touch, 'A-R33-REVIEW-TOUCH');
touch.status = 'open_tech_lead_check';
touch.to = 'Tech Lead R38-T on a real touch device; fix only on evidence (D-29z8)';
touch.tradeoff = 'skipping pointerType touch in the timeline capture handler would reintroduce C-R32-01 on touchscreen laptops with a keyboard (tap a clip, Delete, fader keeps focus); a deferred tap-only blur needs device evidence first';

const tick = byId('MASTER-HOLD-TICK-EDGE');
must(tick, 'MASTER-HOLD-TICK-EDGE');
tick.status = 'dispatched';
tick.to = 'round 43 (D-29z8), SRW-13 stage 4b-2 group 4';
tick.contract = 'holdDb >= +6: the whole 2 px tick inside the meter box; holdDb <= +5: tick centre within 0.5 px of meter.left + f*W (0 dB tick overlaps the 0 dBFS mark); monotonic in between; rounded-full end clip accepted';
for (const id of ['A-R37-TEST-HARDENING', 'A-R38-TEST-ORDER']) {
  const f = byId(id);
  must(f, id);
  f.status = 'dispatched';
  f.to = 'round 43 (D-29z8), SRW-13 stage 4b-2 group 4 (test-only)';
}
const order = byId('A-R38-TEST-ORDER');
order.b_note = 'B source read 2026-10-14 (not evidence): the swap may be behaviourally equivalent because the root pointerdown capture releases a focused text field first (C-R34-01) and beginTrackVolumeGesture flushes pending Volume/Master (ArrangementContext l.2150-2151); round 43 requires a red-on-(i) test or a written equivalence proof that C confirms';
for (const id of ['R9-REVIEWER-M1-L8', 'PREVIEW-VOLUME-IDENTITY']) {
  const f = byId(id);
  must(f, id);
  f.to = 'SRW-13 stage 4c (round 44)';
}
for (const id of ['SSR-LAYOUT-EFFECT-WARN', 'EXPORT-DIALOG-FOCUS-RESTORE', 'LIB-SEP-REASON']) {
  const f = byId(id);
  must(f, id);
  f.to = 'polish (round 45)';
}

const add = (entry) => { must(!byId(entry.id), entry.id + ' already present'); findings.push(entry); };
add({
  id: 'TASK-R42-REGDEL',
  severity: 'low',
  status: 'closed (task wording)',
  title: 'round-42 task PK4 / REG-DEL expected Delete with focus on Pan to delete the selected clip; the frozen contract (C-R31-02) keeps the clip with 0 entries',
  evidence: 'c-round-42.json bugs TASK-R42-REGDEL; a-round-42.md section 7; c-round-42/runs/reg2-1440.txt',
  closed: 'B task-text error; C tested the corrected expectation (PASS). Round 43 REG-DEL states the frozen contract; B checklist: Delete/Backspace on any range input keep the clip, 0 entries, Space toggles',
});
add({
  id: 'FOREIGN-CI-YML',
  severity: 'low',
  status: 'closed',
  title: 'during C round 42 a root-owned .github/workflows/ci.yml change appeared (pull_request trigger removed, concurrency group added)',
  evidence: 'c-round-42/gates/ci-yml-foreign-diff.txt, g42-2-end.txt',
  closed: 'root evidence: committed on purpose in b6a96f8 together with vercel.json ("scope deployment triggers"); not an A/C change; vercel.json was not in the C record',
});
add({
  id: 'GSTACK-ACL',
  severity: 'low',
  status: 'open_root',
  title: 'tmp/studio-real-loop and tmp carry a single non-inherited owner-only ACE (sshav:(OI)(CI)(F)); gstack printed a failed icacls /inheritance:r during a restart; timing unknown',
  evidence: 'c-round-42/gates/acl-record.txt; c-round-42/runs/g42-3.txt',
  note: 'browse-tool/environment item, not a CZABA app bug; root decides whether to restore inheritance; A and C run no ACL command; avoid $B restart',
});
const daemon = byId('ENV-BROWSE-DAEMON');
if (daemon) {
  daemon.round42 = 'A: two start failures on a-browse.json, retry with a fresh state file worked; C: $B restart broke the daemon twice (retry budget exceeded, data from valid runs only). Rule from round 43: never $B restart; fresh BROWSE_STATE_FILE';
} else {
  console.log('WARN ENV-BROWSE-DAEMON not found');
}
const c23 = byId('C-R23-01');
if (c23) {
  c23.round42_record = 'C round 42: curl /studio-lab 64312 bytes, 3 NUL at 11729, 28025, 28026 (identical to round 41); 1 hydrated U+FFFD aria-label (library collapse)';
} else {
  console.log('WARN C-R23-01 not found');
}

const srw13 = b.items.find((x) => x.id === 'SRW-13');
must(srw13, 'SRW-13');
srw13.decisions_round43 = 'D-29z8: round 42 C PASS on every contracted ID; the Pan pairs closed. Group 3 resolved without code (FADER-KEY-ENTRIES, A-R29-REVIEW-1 accepted; A-R33-REVIEW-TOUCH Tech Lead). Round 43 = group 4; round 44 = 4c; round 45 = polish; then SRW-14.';
const stage4b2 = (srw13.stages || []).find((st) => st.stage === '4b-2');
must(stage4b2 && Array.isArray(stage4b2.groups), '4b-2 groups');
for (const g of stage4b2.groups) {
  if (g.group === 2) {
    g.status = 'done (C round 42 PASS)';
  } else if (g.group === 3) {
    g.status = 'resolved without code (D-29z8): FADER-KEY-ENTRIES accepted, A-R29-REVIEW-1 accepted, A-R33-REVIEW-TOUCH Tech Lead R38-T';
    g.round = 'none (planning decision in round-42 B)';
  } else if (g.group === 4) {
    g.status = 'dispatched';
    g.round = '43';
    g.decision = 'D-29z8';
  }
}

const tl = b.tech_lead_manual_checks || [];
const r38 = tl.find((x) => x.id === 'R38-T');
if (!r38) {
  tl.push({ id: 'R38-T', what: 'real mouse on every fader (Volume audio + video, Pan, Master): a click does not jump, a drag follows smoothly, a real double-click resets (100 %, 0.0 dB, C); on a touch device a fader drag does not scroll the page and the value does not jump on press (A-R38-REVIEW-TOUCH); from round 43 also A-R33-REVIEW-TOUCH: a touch scroll on the timeline while a fader is focused after a keyboard step; record whether an entry is written early', why: 'headless cannot do real double-click, drag or touch (gstack/CDP allowlist)', status: 'open' });
} else if (typeof r38.what === 'string' && !r38.what.includes('A-R33-REVIEW-TOUCH')) {
  r38.what += '; from round 43 also A-R33-REVIEW-TOUCH (touch scroll on the timeline with a focused fader after a keyboard step)';
}
if (Array.isArray(b.planned_rounds)) {
  b.planned_rounds.push({ round: 43, items: ['4b-2 group 4: MASTER-HOLD-TICK-EDGE, A-R38-TEST-ORDER, A-R37-TEST-HARDENING (D-29z8)'], note: 'group 3 resolved without code; round 44 = 4c (R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY); round 45 = polish; then SRW-14 stage 1' });
}
fs.writeFileSync(path, JSON.stringify(b, null, 2) + '\n');
console.log('backlog v45 written');
