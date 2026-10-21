const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
const must = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1); } };
must(b.version === 45, 'version 45 expected, got ' + b.version);
b.version = 46;
b.updated = '2026-10-15 (B: round 43 result -> round 44 dispatch, D-29z9)';
b.current_task = 'current-task.md (round 44: SRW-13 stage 4c - R9-REVIEWER-M1 (remove the dead transportRunningRef/markTransportRunning latch, no behaviour change), R9-REVIEWER-L8 (useArrangementPositionStore error text names itself), PREVIEW-VOLUME-IDENTITY (previewTrackVolume returns without updateHistory/syncPlayback when the clamped value is unchanged or the track is missing; after flushPendingMaster, mirroring previewMasterGain; model.ts frozen); ArrangementContext.tsx + new context-hygiene.test.tsx + new doc 041; D-29z9)';
b.advisor_used_by_B += '; round 43 (2026-10-15): available, called once before writing (rebuild the frozen list from 2c0f800 = 391, re-check the shavidze remote, removal not rename for M1 with no invented red test, a render-count red pin for the identity check with the clamp and flush-order placement, model.ts decision, approve the self-launched daemon fallback, harness rule video Mute on) and once after writing (see b-round-43.md)';
b.vitest_floor_round44 = 1341;
b.vitest_expected_round44 = '1341 + the new it count of context-hygiene.test.tsx; every other suite unchanged';
b.baseline_tree_at_round44 = 'HEAD 2c0f800 (root round-43 checkpoint; both master remotes verified by B git ls-remote 2026-10-15 12:06), git status empty; round-43 files at C shas (ArrangementMaster 849e6b40, fader-guards f60b34d9, master-hold-tick 93eb697a, fader-focus-order 113d74b4, doc 040 f91ab6cb); frozen b-round-43-tree-sha256.txt (391 = 387 - ArrangementContext.tsx + the 5 round-43 files); snapshot b-round-43-snapshots/ArrangementContext.tsx 91fa12d6; B gates b-round-43/gates.txt, tsc.txt (0), vitest.txt (76/1341, node.exe 15), protected 4/4, /studio-lab 200';
b.loop_runner_note = 'if run-loop.ps1 stopped on -RoundLimit, restart with -StartRound 44 -StartPhase A and a higher limit';

const lastRound = b.rounds[b.rounds.length - 1];
must(lastRound.round === 43, 'last round 43');
lastRound.status = 'C PASS';
lastRound.result = 'c-round-43.md / c-round-43.json: PASS G43-1 (tsc 0; vitest 76 files 1341/1341; frozen 12 files 227; build; verify exit 0; Biome 2 baseline CRLF errors, 218 warnings), G43-2 (5 contracted paths, 387 OK, protected 4/4), G43-3 (anonymous direct + header link, 0 token/recording/download/R2, Authorization 0, token 401, fake Bearer 500 without token, /studio/middle-east Sign in required), R43-S, R43-HT (TOP 1440 89/89 + 90/90, 1280 91/91, band 91/91, ZERO max |delta| 0.061 px with video Mute, LOW, FLOOR, TRACK), R43-U (mutations a-e; A-R38 equivalence independently confirmed), R43-REG (METER, FADERS, PAN, DEL, CG), R43-Doc. Root checkpoint 2c0f800 (both remotes verified by B 2026-10-15 12:06).';
b.rounds.push({
  round: 44,
  task: 'current-task.md',
  items: ['SRW-13 stage 4c: R9-REVIEWER-M1-L8 (M1 removal, L8 text), PREVIEW-VOLUME-IDENTITY'],
  status: 'dispatched',
  decision: 'D-29z9',
  note: 'baseline HEAD 2c0f800 clean; frozen b-round-43-tree-sha256.txt (391); snapshot b-round-43-snapshots/ArrangementContext.tsx 91fa12d6',
  c_ids: ['R44-S', 'R44-U', 'R44-TR', 'R44-REG', 'R44-Doc', 'G44-1', 'G44-2', 'G44-3'],
  owned: [
    'app/contexts/ArrangementContext.tsx (sections 0.1-0.3 only)',
    'app/lib/arrangement/__tests__/context-hygiene.test.tsx (new)',
    'docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md (new)',
  ],
});

const findings = b.open_findings;
const byId = (id) => findings.find((x) => x.id === id);
const close = (id, text) => { const f = byId(id); must(f, id); f.status = 'closed'; f.closed = text; };
close('MASTER-HOLD-TICK-EDGE', 'round 43: C R43-HT PASS in real playback (c-round-43.md section 3: every sample >= +6 inside the box, width 2 px, 1440 and 1280; <= +5 centre max |delta| 0.061 px; 0 dB tick overlaps the 0 dBFS mark; track meter unchanged) + R43-U mutations a, b1-b3, c caught; root commit 2c0f800');
close('A-R38-TEST-ORDER', 'round 43: equivalence confirmed by C (c-round-43.md section 4: mutation (i) survives 155/155; C read the root capture StudioWorkspace l.911-924/1334, the Volume/Master begin flushes and the blur handlers and could not construct a differing case). S1-S5 kept as contract pins that do not detect the order (doc 040). Closed as equivalent, not as a detecting test');
close('A-R37-TEST-HARDENING', 'round 43: C R43-S (fader-guards diff only inside C-R36-01, every expect kept, +7) and R43-U (e): the blur-reset mutation makes N1, N2, N3 and N5 at the new pin l.1711 red, while the snapshot file keeps N5 green');
const order = byId('A-R38-TEST-ORDER');
order.to = 'closed round 43 (equivalent)';

const add = (entry) => { must(!byId(entry.id), entry.id + ' already present'); findings.push(entry); };
add({
  id: 'TASK-R43-HTZERO',
  severity: 'info',
  status: 'closed (task wording)',
  title: 'round-43 HT-ZERO expected a max Master hold of about 0.0 dB at Master 0 under L43; the demo video audio (0-6 s) adds to the SFX hit, so the max is +3.4',
  evidence: 'c-round-43.md sections 3 and 8; c-round-43/runs/ht-zero-1440.txt, ht-zero-1440-vmute-b.txt',
  closed: 'B task-text gap; C reproduced the 0 dB fixture with a REAL video Mute click. Standing harness rule from round 44: meter fixtures that expect about 0 dBFS use video Mute on',
});
add({
  id: 'A-R43-EXACT-5DB',
  severity: 'low',
  status: 'accepted',
  title: 'no unit pin at exactly +5.0 dB for the Master hold clamp threshold (> vs >=)',
  evidence: 'a-round-43.md section 5; c-round-43.md section 8',
  accepted: 'B D-29z9: at exactly +5.0 both branches satisfy every round-43 rule (unclamped centre 78.79 px vs clamped 79 px, delta 0.21 <= 0.5; both inside the box); C observed the 0.21 px step as allowed; a direct writeMeter pin would need a new export',
});
add({
  id: 'A-R43-REVIEW-W66',
  severity: 'low',
  status: 'accepted (watch)',
  title: 'the +5 dB hold clamp threshold is monotonic only while the Master meter is at least 66 px wide',
  evidence: 'a-round-43.md section 5; doc 040',
  accepted: 'B D-29z9: the meter is w-20 (80 px) and frozen; watch condition: any task that changes the Master meter width must re-measure R43-HT',
});
add({
  id: 'A-R43-REVIEW-ROOTFONT',
  severity: 'info',
  status: 'accepted',
  title: '1px / -ml-px are fixed while w-20 / w-0.5 scale with the root font; the guarantee is stated at a 16 px root',
  evidence: 'a-round-43.md section 5; doc 040',
  accepted: 'B D-29z9: browser zoom scales px and rem alike; only a user root-font override differs; recorded in doc 040',
});
add({
  id: 'ROOT-ROUND42-CHECKPOINT-RECORD',
  severity: 'info',
  status: 'closed',
  title: 'publication-checkpoint.json had no round42Checkpoint for b6a96f8',
  evidence: 'c-round-43.md section 9',
  closed: 'publication-checkpoint.json now has round42Checkpoint (commit b6a96f8, both remotes, 1333 tests, smoke 2); B read 2026-10-15',
});
add({
  id: 'ROOT-ROUND43-CHECKPOINT-RECORD',
  severity: 'info',
  status: 'open_root',
  title: 'round 43 is committed as 2c0f800 and on both master remotes (B git ls-remote 2026-10-15 12:06); publication-checkpoint.json has no round43Checkpoint yet',
  evidence: 'b-round-43/gates.txt; checkpoint-r43-root-review.json; checkpoint-r43-push.log',
  note: 'root records it; not a blocker',
});

for (const id of ['R9-REVIEWER-M1-L8', 'PREVIEW-VOLUME-IDENTITY']) {
  const f = byId(id);
  must(f, id);
  f.status = 'dispatched';
  f.to = 'round 44 (D-29z9), SRW-13 stage 4c';
}
byId('R9-REVIEWER-M1-L8').contract = 'M1: remove transportRunningRef + markTransportRunning (only reader is its own guard at l.836), no behaviour change, grep 0; L8: useArrangementPositionStore throws "useArrangementPositionStore must be used within an ArrangementProvider"';
byId('PREVIEW-VOLUME-IDENTITY').contract = 'previewTrackVolume returns without updateHistory/syncPlayback when the track is missing or its stored volume equals the clamped value; placed after flushPendingMaster and before volumeBeforeRef is set (mirrors previewMasterGain); model.ts frozen; render-count pins red on the snapshot';

const daemon = byId('ENV-BROWSE-DAEMON');
must(daemon, 'ENV-BROWSE-DAEMON');
daemon.round43 = 'A: "Server failed to start within 15s" once, then eval failures in a fresh state; smoke not run. C: 7 CLI-spawned daemons each exited within 60-90 s, also idle on about:blank (c-round-43/runs/daemon-diag.txt); a foreign server-node.mjs (PID 4216, parent gone) was running; workaround: self-launched server-node.mjs with BROWSE_PARENT_PID=0, fresh state file and log, stable for the rest of the run. Playwright screenshot 2-4 s under playback load; CDP Page.captureScreenshot about 0.4 s';
daemon.fallback_from_round44 = 'approved harness fallback after one CLI daemon failure: self-launched server-node.mjs as own background process, BROWSE_PARENT_PID=0, fresh state file and log in the own round folder; record command, PID and log; never $B restart; never kill foreign processes';
const c23 = byId('C-R23-01');
must(c23, 'C-R23-01');
c23.round43_record = 'C round 43: curl /studio-lab 64312 bytes, 3 NUL at 11729, 28025, 28026 (unchanged); 1 hydrated U+FFFD aria-label (library collapse)';

if (!Array.isArray(b.harness_rules)) b.harness_rules = [];
b.harness_rules.push({ from_round: 44, rule: 'Meter fixtures that expect about 0 dBFS at Master 0 under L43/L44 use video Mute on (REAL click, 1 entry); otherwise the demo video audio adds to the SFX hit (+3.4 dB; TASK-R43-HTZERO)' });
b.harness_rules.push({ from_round: 44, rule: 'Browse: never $B restart; fresh BROWSE_STATE_FILE; after one CLI daemon failure the self-launched server-node.mjs fallback (BROWSE_PARENT_PID=0, own log) is approved; screenshots inside a short window use CDP Page.captureScreenshot' });

const srw13 = b.items.find((x) => x.id === 'SRW-13');
must(srw13, 'SRW-13');
srw13.decisions_round44 = 'D-29z9: round 43 C PASS on every contracted ID; MASTER-HOLD-TICK-EDGE, A-R37-TEST-HARDENING closed, A-R38-TEST-ORDER closed as equivalent; A-R43 review items accepted. Round 44 = 4c; round 45 = polish; then SRW-14.';
const stage4b2 = srw13.stages.find((st) => st.stage === '4b-2');
must(stage4b2 && Array.isArray(stage4b2.groups), '4b-2 groups');
for (const g of stage4b2.groups) {
  if (g.group === 4) {
    g.status = 'done (C round 43 PASS)';
  }
}
stage4b2.status = 'done (groups 1-4 C PASS or resolved without code; C-R41-01 open, Tech Lead viewport question)';
const s4c = srw13.stages.find((st) => st.stage === '4c');
must(s4c, '4c');
s4c.status = 'dispatched';
s4c.round = '44';
s4c.decision = 'D-29z9';
s4c.scope = 'round-9 reviewer M1 (remove the transportRunningRef latch) and L8 (position-store error text) + PREVIEW-VOLUME-IDENTITY (previewTrackVolume identity short-circuit), ArrangementContext.tsx only';

must(Array.isArray(b.planned_rounds), 'planned_rounds');
b.planned_rounds.push({ round: 44, items: ['4c: R9-REVIEWER-M1-L8, PREVIEW-VOLUME-IDENTITY (D-29z9)'], note: 'round 45 = polish; then SRW-14 stage 1 (FB-13 grid model, Snap, divisions, clip move first), SRW-15..20, SRW-21 adapter, full regression and root review, T12' });

fs.writeFileSync(path, JSON.stringify(b, null, 2) + '\n');
console.log('backlog updated to version', b.version);
