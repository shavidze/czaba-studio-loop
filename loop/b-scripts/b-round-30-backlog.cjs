const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 31) throw new Error('unexpected version ' + b.version);
b.version = 32;
b.updated = '2026-10-13 (B: round 30 result -> round 31 dispatch, D-29v)';
b.current_task =
  'current-task.md (round 31: SRW-13 stage 4a, FB-05 track pan, D-29v - optional ArrangementTrack.pan (absent unless non-zero, -1..+1 in 1/50 steps), audio lanes only, native range + C/NL/NR readout-reset in lane header row 1, pointer preview that never writes history (context override honoured on reschedule), one "Pan — {name}" entry per drag/key step/reset, ScheduleHandle.setTrackPan (setTargetAtTime, equal-value early return), panner seeded from tracks so export needs no change; new doc 036 and track-pan.test.tsx)';
const s = b.items.find((i) => i.id === 'SRW-13');
const m1 = s.acceptance.find((a) => a.id === 'R13-M1');
m1.status = 'pass';
m1.round30 = 'R30-GE, R30-GV, R30-GL, R30-GN';
m1.evidence =
  'C round 30 (c-round-30.md sections 4-6): E+6 on clip B [15,23) +6.0000 dB (1.57 LSB vs x1.99526), clip A same track 0 LSB, SFX/video 0 LSB, E-6 -6.0000 dB; live commit 0 new starts + one setTargetAtTime(1.995262, tau 0.015) on B node, meters +6.0 dB; loop: later B sources at 1.995262; paste copies +6.0000 dB';
const m2 = s.acceptance.find((a) => a.id === 'R13-M2');
m2.round31 =
  'R31-PE (right channel <= 1 LSB at 50L, left per W3C StereoPanner formula <= 2 LSB, clippedSamples 0, Master -12), R31-PE2 (25L), R31-PV, R31-PL';
const st3 = s.stages.find((x) => x.stage === 3);
st3.status = 'done';
st3.result =
  'C PASS round 30 (c-round-30.md): every dispatched ID PASS, vitest 1161/1161, mutations 10/10; new pre-existing Low C-R30-01. R30-GX and R30-GM were listed here by B but never dispatched in tasks/round-30.md (bookkeeping error, not evidence); their intent (meters reflect clip gain) is covered by the R30-GV meter rows';
const i4 = s.stages.findIndex((x) => x.stage === 4);
if (i4 < 0) throw new Error('stage 4 missing');
const a4 = [
  'R31-PE', 'R31-PE2', 'R31-PV', 'R31-PL', 'R31-PH', 'R31-PG', 'R31-PD', 'R31-PUI', 'R31-PC',
  'R31-K', 'R31-R', 'R31-S', 'R31-U', 'R31-Doc', 'G31-1', 'G31-2', 'G31-3',
];
s.stages.splice(
  i4,
  1,
  {
    stage: '4a',
    round: 31,
    status: 'dispatched',
    decision: 'D-29v',
    scope:
      'FB-05 track pan (R13-M2): optional ArrangementTrack.pan absent unless non-zero (-1..+1, 1/50 steps), audio lanes only; lane header row 1 range (-50..50) + C/NL/NR readout that resets to C; pointer drag previews live without writing history (context override honoured by startGraph/syncPlayback), one "Pan — {name}" entry on release; keyboard step = one entry; blur/pointercancel mid-drag revert; panner seeded from tracks (export unchanged); ScheduleHandle.setTrackPan with equal-value early return',
    acceptance: a4,
  },
  {
    stage: '4b',
    status: 'todo',
    scope:
      'fader UX for Volume, Master and Pan: no jump to the click point (C round 22 section 5), double-click reset (Live 12 section 18.1), per-key history coalescing (FADER-KEY-ENTRIES, C round 30 section 7), A-R29-REVIEW-1 (pending flush label), pending-commit order (checkpoint-oct13 review suggestion 5), MASTER-HOLD-TICK-EDGE',
  },
  {
    stage: '4c',
    status: 'todo',
    scope:
      'round-9 reviewer context items M1 (transportRunningRef latch) and L8 (position-store error message names useArrangementPosition)',
  },
);
s.decisions_round31 = {
  split: 'workflow policy one feature per round: stage 4 split into 4a pan, 4b fader UX, 4c M1/L8',
  data: 'optional ArrangementTrack.pan absent unless non-zero (frozen track fixtures and JSON-equality history); audio tracks only (video lane row 1 has the import button; video sound stays on Volume/Mute)',
  graph:
    'existing per-track StereoPannerNode seeded from track.pan; setTrackPan setTargetAtTime tau 0.015 with equal-value early return; no new node/option; renderArrangementWav byte-identical (export reads tracks)',
  preview:
    'pointer drag preview never writes history.present (override ref honoured on reschedule); avoids a third pending-snapshot machine and its flush-order/label issues (checkpoint review 5, A-R29-REVIEW-1)',
  ui: 'B probe b-round-30/geo-*.json: header 203 px; audio lanes 61 px at 1280 with the detail panel open, so no third row; pan in row 1 (w-12 range + w-7 readout); base names fit, active suffix may ellipsize; R24-HC first-range query now hits Pan (accepted, Home left to every slider)',
  oracle:
    'R13-M2 at Master -12, music solo, clippedSamples 0; right channel <= 1 LSB at 50L; left per W3C formula for the decoded channel count; EC (reset) = E0 0 LSB',
  ableton:
    'Live 12 section 18.1 (b-round-29/ableton-mixing-20261012.txt): pan positions output, Stereo Pan Mode, linked multi-track, double-click reset confirmed; pan law unconfirmed (Audio Fact Sheet not captured)',
};
const r30 = b.rounds.find((r) => r.round === 30);
if (r30) {
  r30.status = 'c_pass';
  r30.result =
    'C PASS (c-round-30.md); vitest 1161/1161; C-R30-01 Low pre-existing; root committed 08b9e53 then merged upstream as 1cefea1';
}
b.rounds.push({
  round: 31,
  task: 'current-task.md',
  items: ['SRW-13 stage 4a / FB-05 track pan (R13-M2)'],
  status: 'dispatched',
  decision: 'D-29v',
  note: 'baseline HEAD 1cefea1 clean tree; frozen b-round-30-tree-sha256.txt (371 tracked files under app/ and docs/implementation/ minus 5 owned); snapshots b-round-30-snapshots/; expected end 7 status lines',
  c_ids: a4,
  owned: [
    'app/types/arrangement.ts (ArrangementTrack.pan only)',
    'app/lib/arrangement/model.ts (pan constant and helpers)',
    'app/lib/arrangement/graph.client.ts (panner seed, panner map, setTrackPan)',
    'app/contexts/ArrangementContext.tsx (pan actions, preview override, syncPlayback push)',
    'app/components/arrangement/ArrangementLane.tsx (row 1 pan slider + readout, audio lanes)',
    'app/lib/arrangement/__tests__/track-pan.test.tsx (new)',
    'docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md (new)',
  ],
});
b.vitest_floor_round31 = 1167;
b.baseline_tree_at_round31 =
  'HEAD 1cefea1 (root checkpoint 08b9e53 = the 69-line tree C verified in round 30, plus merge of shavidze/master: agents/CI/husky/package.json scripts, app/lib/auth.ts, auth-bugs.test.ts); git status empty; sha256 of 371 frozen files: b-round-30-tree-sha256.txt; 5 owned snapshots in b-round-30-snapshots/; Biome 2 CRLF format errors on the merged auth files (root)';
b.open_findings.push(
  {
    id: 'C-R30-01',
    severity: 'low',
    status: 'open',
    to: 'detail-panel/docs polish round (after stage 4c)',
    title:
      'at 1280x720 with the detail panel open and a range shown, the info column (5 lines, ~88 px) overlaps in an 85 px content box; title clipped',
    evidence: 'c-round-30.md section 10; c-round-30/shots/gui-1280x720.png; also c-round-29/shots/ft-range-1280x720.png',
    note: 'pre-existing; round 19 D-29j 1280 measurement had footer 69 and no range (c-round-19.md section 2), so this case was never measured',
  },
  {
    id: 'DOC035-NOTES',
    severity: 'low',
    status: 'open',
    to: 'detail-panel/docs polish round',
    title:
      'doc 035: scenario status title omits the collection prefix; l.4 status still says C pending; add the accepted keyboard dirty-text + 0 dB two-entry behaviour (A round 30 section 6.2a)',
    evidence: 'c-round-30.md sections 8 and 10',
  },
  {
    id: 'FADER-KEY-ENTRIES',
    severity: 'low',
    status: 'open',
    to: 'SRW-13 stage 4b',
    title: 'Volume and Master fader keyboard steps create one history entry per key (pre-existing)',
    evidence: 'c-round-30.md section 7 R30-K info',
  },
  {
    id: 'A-R30-DEV-6.1',
    severity: 'info',
    status: 'accepted',
    title:
      'ArrangementDetailPanel setClipGain prop optional (two frozen standalone renders); StudioWorkspace always passes it',
    evidence: 'a-round-30.md 6.1; c-round-30.md R30-S',
  },
  {
    id: 'A-R30-DEV-6.2',
    severity: 'info',
    status: 'accepted',
    title:
      'reset onMouseDown preventDefault (pointer: dirty text discarded, 1 entry); keyboard Tab->reset->Enter commits then resets (2 entries) - accepted, doc note under DOC035-NOTES',
    evidence: 'a-round-30.md 6.2/6.2a; c-round-30.md GK',
  },
  {
    id: 'ROOT-SECOND-REMOTE',
    severity: 'info',
    status: 'root_note',
    to: 'root',
    title:
      'push of 08b9e53 to shavidze/czaba-store rejected non-fast-forward; root merged upstream as 1cefea1; reconcile both remotes without force push',
    evidence: 'checkpoint-oct13-push.log; git log',
  },
  {
    id: 'ROOT-CRLF-AUTH',
    severity: 'info',
    status: 'root_note',
    to: 'root',
    title:
      'after the 1cefea1 merge, app/lib/auth.ts and auth-bugs.test.ts working copies are CRLF (core.autocrlf=true, index LF): Biome ./app reports 2 format errors; not Studio files',
    evidence: 'b-round-30/biome-errors.txt',
  },
  {
    id: 'ROOT-AGENT-WRITE-GRANT',
    severity: 'info',
    status: 'root_note',
    to: 'root',
    title: 'tracked .claude/agents/frontend-architect.md grants Write/Bash while its text says app code is read-only',
    evidence: 'checkpoint-oct13-review.md suggestion 9',
  },
);
b.tech_lead_manual_checks.push(
  {
    id: 'R30-T',
    what: 'real Chrome with headphones: clip gain change while playing has no click/zipper (tau 15 ms); +6 dB on one clip is audibly louder only on that clip',
    why: 'listening is impossible headless',
  },
  {
    id: 'R31-T',
    what: 'real Chrome with headphones and a real mouse: Pan drag is smooth, 50L only left, C centred',
    why: 'listening and a real mouse are impossible headless',
  },
);
if (Array.isArray(b.tech_lead_notes)) {
  b.tech_lead_notes.push(
    'TL-Q-FB05-FB11 (information, not blocking): 2.mp4 03:08-03:17 lists panning, volume and tempo and then says these are not needed, while showing the main mixer; B keeps track pan (FB-05, 1.mp4 03:39) and the FB-11 tempo grid in scope unless the Tech Lead says otherwise',
  );
}
b.advisor_used_by_B =
  (typeof b.advisor_used_by_B === 'string' ? b.advisor_used_by_B + '; ' : '') +
  'round 30->31: available, called before writing and after';
fs.writeFileSync(p, JSON.stringify(b, null, 2) + '\n');
console.log('ok', b.version, s.stages.map((x) => x.stage + ':' + x.status).join(','));
