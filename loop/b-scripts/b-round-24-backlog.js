const fs = require('fs');
const path = 'C:/Apps/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
if (b.version !== 25) {
  throw new Error(`expected version 25, got ${b.version}`);
}
b.version = 26;
b.updated = '2026-10-11 (B: round 24 result -> round 25 dispatch)';
b.current_task =
  'current-task.md (round 25: SRW-13 stage 1 - Master Volume (dB -60..+6, step 0.5) and Master Mute in live playback and export, required Arrangement.master, setMasterGain with the round-22 de-click time constants, no reschedule on master change; export overload report (pre-clamp peak + clamped-sample count, role=alert warning with the needed Master reduction; clamp stays, no limiter); master-mute export = warn and proceed; ArrangementMaster in the workspace header (transport already 2 rows at 1280); two new test files + schedule.test.ts fixture line; doc 031; D-29p)';
b.advisor_used_by_B +=
  '; round 24 result -> round 25 dispatch: available, called before writing (required master field, layout-reference risk, graph/export oracles, R-S rule) and after writing; advice applied';

const r24 = b.rounds.find((r) => r.round === 24);
r24.status = 'done';
r24.result =
  'C PASS (c-round-24.md, c-round-24.json): R24-H (4 separators at 1440 and 1280, playback, arrows), R24-HC, R24-F (R11-P2a 1280 rows 53/61/61/61 after the transition, separator drag refit, floating video 8,503 272x153), R24-R, R24-S, R24-U (C mutations outside store: Home 1 failed, ref 10 failed, transitionend target 1 failed), R24-Doc, G24-1..3 (tsc 0, vitest 1010/1010, build, Biome 0 errors 218 warnings; 51 OK; 47 lines; anonymous /studio-lab clean, studio-token 401), export sanity lay11 864 000 frames NaN 0 1800 FS RMS -15.48 dBFS. No new bug. C-R23-01 record unchanged (4 NUL at 26019/26020/42403/42404; music aria-label 2x U+FFFD). B independent check 2026-10-11: HEAD c5ed47b, 47 lines identical to c-round-24/gates/git-status-end.txt, 51 OK, owned shas 324061ea/1d1fa845/8e08f456/ff9e74da, nextElementSibling 0, live curl NUL 4. A deviation 1 accepted (plain ref object instead of createRef: B text conflict with the added-lines-only rule, replaced in round 25 by a hunk-limited diff rule).';

b.rounds.push({
  round: 25,
  task: 'current-task.md',
  items: [
    'SRW-13 stage 1: Master Volume/Mute (live + export, undoable, no reschedule), export overload report (R13-M4 export part), master-mute export warn-and-proceed (R13-M3), ArrangementMaster in the workspace header; master.test.ts + master-ui.test.tsx red-first (>= 12 it), schedule.test.ts fixture line; doc 031',
  ],
  status: 'dispatched',
  decision: 'D-29p',
  note: 'frozen: b-round-24-tree-sha256.txt (50 files = round-23 list minus types/arrangement.ts, model.ts, graph.client.ts, ArrangementContext.tsx, ArrangementExportDialog.tsx, plus ArrangementDetailPanel.tsx, track-layout.test.tsx, doc 030, model.test.ts; B verified 50 OK); dispatch snapshots in b-round-24-snapshots/ (7 files); expected status 54 lines (47 + 7 enumerated); B type probe in b-scratch-r24 (required master: exactly 3 tsc sites, all owned); B geometry b-round-24/geometry.txt (header 35, transport 49/87); RF5-3/R3-V1/R3-V4/R11-P3 not re-run (one R3-V2-style sample in R25-MV)',
});

b.vitest_floor_round24 = 1010;
b.baseline_tree_at_round24 =
  'HEAD c5ed47b + 47 status lines (rounds 6-24), identical to c-round-24/gates/git-status-end.txt (copy b-round-24-git-status.txt); sha256 of 50 frozen files: b-round-24-tree-sha256.txt; plus the two foreign untracked agent files (root); must not be reverted';

const s13 = b.items.find((i) => i.id === 'SRW-13');
s13.status = 'in_progress';
s13.stages = [
  {
    stage: 1,
    round: 25,
    status: 'dispatched',
    scope:
      'FB-14 Master Volume (dB -60..+6) + Master Mute in live graph and offline export (undoable, no reschedule, de-click time constants); export overload report: pre-clamp peak and clamped-sample count, role=alert warning with the needed Master reduction (R13-M4 export part; clamp stays, never called a limiter); master-mute export warns and proceeds (R13-M3)',
    acceptance: ['R25-MV', 'R25-MM', 'R25-ML', 'R25-E0', 'R25-E6', 'R25-EM', 'R25-EO', 'R25-H', 'R25-K', 'R25-L', 'R25-R', 'R25-S', 'R25-U', 'R25-Doc', 'G25-1', 'G25-2', 'G25-3'],
  },
  {
    stage: 2,
    status: 'todo',
    scope:
      'live level meters per track and Master (AnalyserNode after the gain stage), peak hold, latched master clip/overload indicator (FB-14 live part, R13-M4 meter part); no per-frame React render',
  },
  {
    stage: 3,
    status: 'todo',
    scope:
      'FB-04 clip gain in the detail panel (clipGain node, one history entry per gesture, export applies it; R13-M1 +6 dB +-0.2 on that clip only; never labelled input sensitivity)',
  },
  {
    stage: 4,
    status: 'todo',
    scope:
      'FB-05 track pan (StereoPanner; R13-M2), fader-click UX decision for all faders (C round 22 section 5), round-9 reviewer context items M1 (transportRunningRef latch) and L8 (position-store error message names useArrangementPosition)',
  },
];
s13.decisions_round25 = {
  master_field:
    'required Arrangement.master {gainDb, mute}; optional would break JSON-equality history (spurious entries); B probe: 3 tsc sites, all owned',
  placement:
    'workspace header (measured: transport already wraps to 2 rows at 1280, 25 px free at 1440; header 35 px with 622/782 px free)',
  master_mute_export:
    'warn and proceed (consistent with the existing silence note; frozen focus test expects an enabled export button); done message gets a silence suffix',
  overload:
    'post-render report of pre-clamp peak and clamped samples; the 24-bit clamp stays; no limiter/normalise/soft-clip (effects out of scope)',
  t12_compatibility:
    'dB to linear 10^(dB/20) and the main-output over-0 indication match next-stage-t12/gain-volume-source.txt T12.3 and T12.21-23',
};
s13.acceptance.find((a) => a.id === 'R13-M3').round25 = 'R25-MV, R25-MM, R25-E6, R25-EM';
s13.acceptance.find((a) => a.id === 'R13-M4').round25 = 'export part: R25-EO (stage 1); meter part: stage 2';

const s11b = b.items.find((i) => i.id === 'SRW-11B');
s11b.round24_result =
  'C PASS (c-round-24.md): Home on separators no longer seeks; detail panel found through panelRef. Every A round-11 follow-up is closed (aria-controls, ring-inset, l.661 in round 23; Home, nextElementSibling in round 24; silent fold refusal in round 16). Status stays stage3_passed_bugs_open for C-R8-01 (Tech Lead). Round-9 reviewer M1/L8 context items scheduled with SRW-13 stage 4.';
s11b.polish_round.note +=
  '; round 24 (D-29o): Home on separators and nextElementSibling C PASS - every A round-11 follow-up is closed; round-9 M1/L8 -> SRW-13 stage 4';

const c23 = b.open_findings.find((f) => f.id === 'C-R23-01');
c23.round24_record =
  'C round 24: unchanged, 4 NUL at offsets 26019/26020/42403/42404, music name aria-label 2x U+FFFD; B live curl 2026-10-11: 4. Still awaiting the Tech Lead; round 25 records whether the new header markup moves the boundary.';

b.open_findings.push({
  id: 'R9-REVIEWER-M1-L8',
  severity: 'low',
  status: 'scheduled',
  note: 'Round-9 reviewer M1 (transportRunningRef is only a latch; rename or remove without behaviour change) and L8 (useArrangementPositionStore throws a message naming useArrangementPosition), both in ArrangementContext.tsx. Previously "after the Tech Lead run, at the latest with SRW-13". Fixed to SRW-13 stage 4 (pan), which edits the context anyway; kept out of round 25 by the one-feature round rule. Distinct from root M1/L8 (closed in round 4).',
  evidence: 'a-round-9.md l.227-237; backlog SRW-11B polish_round',
});

b.tech_lead_manual_checks.push({
  id: 'R25-T',
  what: 'real-mouse Master fader drag and listening for Master Mute/unmute clicks on headphones in real Chrome',
  why: 'synthetic pointer and headless have no listening check',
});

for (const p of b.planned_rounds) {
  if (p.round === '22-24') {
    p.items[2] =
      '24: StudioWorkspace.tsx Home on separators + nextElementSibling -> explicit ref (panelRef prop) - C PASS (round 24); every A round-11 follow-up closed';
    p.status = 'done';
  }
}
b.planned_rounds.push({
  round: '25-28',
  items: [
    '25: SRW-13 stage 1 Master Volume/Mute + export overload report (D-29p) - dispatched',
    '26: SRW-13 stage 2 live meters + master clip indicator',
    '27: SRW-13 stage 3 FB-04 clip gain',
    '28: SRW-13 stage 4 FB-05 pan + fader-click UX + round-9 M1/L8',
    'C-R23-01 goes first as soon as the Tech Lead answers',
    'then SRW-14..20 in dependency order, SRW-21 adapter contract, full regression + root check, T12',
  ],
  note: 'round numbers are orientation only (plan section 5)',
});

fs.writeFileSync(path, `${JSON.stringify(b, null, 2)}\n`);
JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('backlog version', b.version);
