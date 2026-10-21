const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'backlog.json');
const raw = fs.readFileSync(file, 'utf8');
const b = JSON.parse(raw);
if (b.version !== 30) {
  throw new Error(`expected backlog v30, found ${b.version}`);
}

const find = (list, id) => {
  const entry = list.find((x) => x.id === id);
  if (!entry) {
    throw new Error(`missing ${id}`);
  }
  return entry;
};

b.version = 31;
b.updated = '2026-10-12 (B: round 29 result -> round 30 dispatch, D-29u)';
b.current_task =
  'current-task.md (round 30: SRW-13 stage 3, FB-04 clip gain, D-29u - optional ArrangementClip.gainDb (absent unless non-zero, -60..+24 dB, 0.1 dB), audio clips only, numeric field + 0 dB reset in a new detail-panel column, one history entry "Clip Gain" per commit, live change through ScheduleHandle.setClipGain without reschedule (scheduleKey ignores gainDb), ApplyScheduleOptions.clipGains for live start and export, clipboard carries gainDb; narrow detail-panel-polish.test.tsx l.372/l.375 amendment; new doc 035 and clip-gain.test.tsx)';
b.advisor_used_by_B +=
  ' | Round 29 -> 30 planning (2026-10-12): advisor (Fable) available and called once after orientation and before writing (advice applied: SRW-24/FB-02/SRW-09 -> verifying, not ready, because R29-NE and the 40-41 no-op are UI-unreachable and R28-T is Tech Lead; probe the detail-panel-polish frozen assertions and grant only the probed lines; clipGains option map instead of ScheduledClip so schedule.ts/loop.ts stay frozen; scheduleKey must ignore gain; handle setClipGain updates every source state and the stored map; absent-unless-non-zero gainDb rounded to 0.1 dB; clipboard carries gain; R13-M1 oracle at Master -12 dB because the demo music peak 0.574 clips at +6 dB; Ableton bounds unconfirmed). B chose the numeric field + reset over a preview slider (smallest honest behaviour; slider/fine drag are T12.8/T12.9 in the user T12 queue) - recorded in D-29u. A second call before declaring done is recorded in b-round-29.md.';

const r29Pass =
  'C round 29 (c-round-29.md, c-round-29.json): PASS on every UI-reachable ID - R29-PA (export [20,22) 0 LSB), R29-PB, R29-PC (loop 12-18 -> 12-16, playhead 26 -> 24), R29-PD (3/3), R29-NO zero-width stopped + playing, R29-FT (1440/1280 geometry = round 28), R29-UR (PA, PC), R29-K, R29-R (incl. the owed empty-clipboard refusal), R29-S, R29-U (mutations a-g killed; red-first 8 failed / 6 passed reproduced), R29-Doc, G29-1..3 (vitest 1133/1133, Biome 218 + 1, build 0, protected 4/4, anonymous /studio-lab, premium sign-in). Not run, UI-unreachable by design (ranges are clip-bounded): R29-NE and the 40-41 non-zero no-op (covered by provider tests + mutation d only; not PASS).';

const srw24 = find(b.items, 'SRW-24');
srw24.status = 'c_pass_tech_lead_manual';
srw24.round29_result = r29Pass;
srw24.open_bugs = [];
srw24.next = 'Tech Lead R28-T (extended: Ctrl+Shift+L -> Ctrl+X -> Ctrl+V on another active lane returns the material to its own lane). Doc 034 note that R29-NE / the non-zero no-op are code paths only (UI ranges are clip-bounded) -> next round that owns doc 034 or the final docs pass (DOC034-UNREACHABLE-NOTE).';

const srw09 = find(b.items, 'SRW-09');
srw09.status = 'c_pass_tech_lead_manual';
srw09.note_round30 = 'C-R28-01 closed by C round 29 (R29-PA/PB/PC/PD). D-25 as amended by D-29t: all-lane clipboards keep their lanes; single-lane range and clip clipboards on one audio lane go to the active audio lane. Remaining: Tech Lead R28-T.';
srw09.open_bugs = [];

const srw13 = find(b.items, 'SRW-13');
const stage3 = srw13.stages.find((s) => s.stage === 3);
stage3.status = 'dispatched';
stage3.round = 30;
stage3.decision = 'D-29u';
stage3.scope =
  'FB-04 clip gain on one selected audio clip: optional ArrangementClip.gainDb (absent unless non-zero; clamp -60..+24 dB, round 0.1 dB); numeric dB field + 0 dB reset in a new detail-panel column (data-testid arrangement-detail-clip-gain); commit on Enter/blur = one history entry "Clip Gain"; Escape reverts the text; group selection and video clips disabled with a reason; live change via ScheduleHandle.setClipGain (setTargetAtTime on every live source of that clip + stored map for appended loop sources), no reschedule (scheduleKey ignores gainDb); initial gain via ApplyScheduleOptions.clipGains for live start and export; clipboard items carry gainDb; split/duplicate/trim/move/deleteTime keep it by spread; never labelled input sensitivity; track and Master meters reflect it (post-clip-gain taps)';
stage3.acceptance = [
  'R30-GE',
  'R30-GV',
  'R30-GL',
  'R30-GN',
  'R30-GH',
  'R30-GK',
  'R30-GD',
  'R30-GC',
  'R30-GX',
  'R30-GM',
  'R30-GUI',
  'R30-K',
  'R30-R',
  'R30-S',
  'R30-U',
  'R30-Doc',
  'G30-1',
  'G30-2',
  'G30-3',
];
stage3.out_of_round =
  'Gain slider with drag preview, fine (Shift) drag and double-click reset (T12.8/T12.9), multi-clip relative gain editing (T12.7, Live 12 section 8.13), waveform amplitude following clip gain (T12.19), clip gain envelope (T12.10): user T12 queue after the original scope, not deferred FB scope';
srw13.decisions_round30 = {
  data: 'optional ArrangementClip.gainDb present only when non-zero (frozen fixtures build clips without it; history uses JSON equality, so 0 must delete the key). B probe: tsc 0 (b-round-29-probe.txt)',
  graph: 'ApplyScheduleOptions.clipGains (clipId -> linear) read when each source is created; ScheduleHandle.setClipGain updates every live source state of that clip and the stored map, so appended loop iterations keep it; no new node (graph.test.ts l.373 counts gain nodes). ScheduledClip, schedule.ts and loop.ts stay frozen (their toEqual shapes)',
  sync: 'scheduleKey ignores gainDb; syncPlayback non-reschedule branch pushes clip gains like track gains; setClipGain is a no-op when the target is unchanged',
  ui: 'numeric field + reset, not a preview slider: one entry per commit needs no third preview/gesture machine; slider/drag/fine/double-click are T12.8/T12.9',
  test_amendment: 'detail-panel-polish.test.tsx: only the two queries in detailLabelTexts (l.372, l.375) may exclude descendants of [data-testid="arrangement-detail-clip-gain"]; B probe 2 failed -> 16/16 with the amendment; every expectation line stays word-for-word',
  oracle: 'R13-M1 at Master -12 dB in both exports (C round 29: music peak 0.574 would clamp at +6 dB at Master 0)',
  range: '-60..+24 dB: floor = Master floor; ceiling admits R13-M1 +6 with room; Live 12 bounds are not stated in the captured manual (unconfirmed)',
};

const closeFinding = (id, evidence) => {
  const f = find(b.open_findings, id);
  f.status = 'resolved';
  f.closed_round = 29;
  f.evidence_closed = evidence;
};
closeFinding('C-R28-01', 'C round 29 R29-PA (music [20,2,13], export 0 LSB), R29-PB, R29-PC, R29-PD; mutations a, b, c killed');
closeFinding('C-R28-02', 'C round 29 R29-NO zero-width stopped (no history, pos 20, range kept, honest status, previous clipboard pasted) and playing (no jump/stop/reschedule); mutations d, e, f killed; non-zero window UI-unreachable (provider test only)');
closeFinding('A-R28-REVIEW-4-ALL-LANE-FOOTER', 'C round 29 R29-FT: arrangement-range-all-lanes only after Ctrl+Shift+L; footer 89, range line 16 one line, scroller 476/280 = round 28');
closeFinding('C-R27-02', 'C round 29 section 8: round-27 frozen 8-file batch 152/152 x3 at node.exe 10 (< 30) -> closed by the pre-registered D-29t rule; no test edited');

const addFinding = (entry) => {
  if (!b.open_findings.some((x) => x.id === entry.id)) {
    b.open_findings.push(entry);
  }
};
addFinding({
  id: 'A-R29-REVIEW-1-PENDING-FADER-UNDO-LABEL',
  severity: 'low',
  status: 'open',
  to: 'SRW-13 stage 4 (fader UX, round 31)',
  title: 'a pending Volume/Master fader preview is flushed as its own history entry by applyEdit; after a no-op Cut Time the undo label shows that fader entry although the status says nothing changed',
  evidence: 'a-round-29.md section 4 finding 1; c-round-29.md section 9 (not browser-verified; pre-existing)',
});
addFinding({
  id: 'DOC034-UNREACHABLE-NOTE',
  severity: 'low',
  status: 'open',
  to: 'next round that owns doc 034, or the final docs pass',
  title: 'doc 034 describes the non-zero Cut Time no-op and "silence with later clips" without saying they are code paths only (UI ranges are clip-bounded)',
  evidence: 'c-round-29.md sections 4 and 6',
});
addFinding({
  id: 'C-R29-NPX-CACHE',
  severity: 'info',
  status: 'root_note',
  to: 'root',
  title: 'C round 29 first mutation attempt (invalid, no node_modules) made npx fetch vitest@5.0.4 into the npm cache; project, lockfile and store unchanged',
  evidence: 'c-round-29.md section 6 and 10',
});

b.rounds.at(-1).status = 'C PASS (c-round-29.md); R29-NE and the 40-41 no-op not run (UI-unreachable)';
b.rounds.push({
  round: 30,
  task: 'current-task.md',
  items: [
    'SRW-13 stage 3 / FB-04 clip gain on one selected audio clip (R13-M1): optional gainDb, numeric field + reset in the detail panel, one "Clip Gain" history entry per commit, live without reschedule, export, clipboard carry',
  ],
  status: 'dispatched',
  decision: 'D-29u',
  note: 'frozen: b-round-29-tree-sha256.txt (69 files = b-round-28 list - types/arrangement.ts, model.ts, graph.client.ts, ArrangementDetailPanel.tsx, detail-panel-polish.test.tsx + all-lane-clipboard.test.tsx, doc 034; B verified 69 OK); snapshots b-round-29-snapshots/ (8 files); baseline 67 status lines = c-round-29/gates/git-status-end.txt; expected end 69 lines (+ clip-gain.test.tsx, + doc 035)',
  c_ids: stage3.acceptance,
  owned: [
    'app/types/arrangement.ts (ArrangementClip.gainDb only)',
    'app/lib/arrangement/model.ts (clip gain constants and helpers only)',
    'app/lib/arrangement/graph.client.ts (clipGains option, setClipGain, renderArrangementWav option)',
    'app/lib/arrangement/clipboard.ts (gainDb carry only)',
    'app/contexts/ArrangementContext.tsx (setClipGain, scheduleKey, syncPlayback clip gains, startGraph option)',
    'app/components/arrangement/ArrangementDetailPanel.tsx (clip gain column)',
    'app/components/arrangement/StudioWorkspace.tsx (one prop on ArrangementDetailPanel)',
    'app/lib/arrangement/__tests__/detail-panel-polish.test.tsx (l.372 and l.375 only)',
    'app/lib/arrangement/__tests__/clip-gain.test.tsx (new)',
    'docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md (new)',
  ],
});

const queue = b.planned_rounds.at(-1);
queue.items = queue.items.map((item) =>
  item.startsWith('29:')
    ? `${item} - C PASS (round 29); C-R28-01/02 + finding 4 closed; C-R27-02 closed by rule`
    : item.startsWith('30:')
      ? '30: SRW-13 stage 3 FB-04 clip gain (R13-M1) - dispatched (D-29u)'
      : item.startsWith('31:')
        ? '31: SRW-13 stage 4 FB-05 pan + fader-click UX + round-9 M1/L8 + Master hold tick + A-R29-REVIEW-1 (pending fader flush label)'
        : item,
);

b.vitest_floor_round29 = 1133;
b.baseline_tree_at_round29 =
  'HEAD c5ed47b + 67 status lines (rounds 6-29) = c-round-29/gates/git-status-end.txt (copy b-round-29-git-status.txt); sha256 of 69 frozen files: b-round-29-tree-sha256.txt; 8 round-30 owned snapshots in b-round-29-snapshots/; plus the two foreign untracked agent files';

fs.writeFileSync(file, `${JSON.stringify(b, null, 2)}\n`);
console.log('backlog v31 written');
