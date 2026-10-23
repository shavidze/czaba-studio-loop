const fs = require('fs');
const path = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
b.version = (typeof b.version === 'number' ? b.version : 118) + 1;
b.updated = '2026-10-23 (B round 120 result / round 121 plan, D-29z86)';
b.current_task = 'current-task.md (round 121: D-29z86 - T12 stage 4b: Waveform Vertical Zoom, view only (T12.18 + Test 7): new waveform-zoom.ts (levels 0.5/1/2/4/8, parse, label, percent, status, clipWaveformScale), optional waveformZoom prop (default 1) on ArrangementLane + ArrangementClipView, one session view state + appearance-none select (last child of arrangement-grid-control, data-waveform-zoom) in StudioWorkspace; audio clips on lanes only (video and detail panel unchanged); not history, not arrangement, not engine/export; new waveform-zoom.test.tsx WZ1-WZ9 (B-derived Float32 literals), m1-m5, new doc 103; baseline clean 0a75ba8; frozen b-round-120-r121-tree-sha256.txt (931); browser baseline b-round-120/probe/baseline-r121.json)';
b.advisor_used_by_B = 'round 120 result / round 121 plan: advisor available and consulted before writing';
b.baseline_tree_at_round121 = {
  head: '0a75ba8757617695d19e0b2a4aaad713bc30c01c',
  working_tree: 'clean (git status --porcelain empty); gate 120 published 0a75ba8 (both remotes)',
  frozen_list: 'tmp/studio-real-loop/b-round-120-r121-tree-sha256.txt',
  entries: 931,
  excluded: [
    'app/components/arrangement/StudioWorkspace.tsx (pre 1463926afc8b...)',
    'app/components/arrangement/ArrangementLane.tsx (pre 5d823cd41c38...)',
    'app/components/arrangement/ArrangementClip.tsx (pre a5c0b7bef568...)'
  ],
  new_files_granted: [
    'app/lib/arrangement/waveform-zoom.ts',
    'app/lib/arrangement/__tests__/waveform-zoom.test.tsx',
    'docs/implementation/2026/quarter-IV/103-studio-waveform-vertical-zoom.md'
  ],
  browser_baseline: 'tmp/studio-real-loop/b-round-120/probe/baseline-r121.json (1440 + 1280: chrome rows 28/20/20/16, lane y, waveform d sha256 video be86af38 / music 43e96d8a / stems 9fa65c46 / sfx e1890358 at 1x, 40 px/s; C setup + beeps-6s-vp9-opus.webm)',
  protected: {
    'app/routes/studio.$productId.tsx': 'fa2cf0bc',
    'app/routes/api.studio-token.ts': '13914809',
    'app/lib/auth.ts': '56f5b76f',
    'app/contexts/AuthContext.tsx': 'bf9ee257'
  }
};
const r120 = b.rounds.find((r) => r.round === 120);
r120.status = 'c_pass (c-round-120.json: T120-TARGETED 331/331, AN-REVIEW (WG2 pin re-derived by C from HEAD 4090f6e: cc617f0c), SOURCE-SCOPE, WG-SCALE + WG-LIVE at 1440 and 1280, WG-CLAMP-FLOOR, WG-DETAIL, WG-MULTI, WG-MUSTNOT, WG-PLAY (0 createBufferSource), WG-AUDIO (peak/RMS ratio 0.501187), WG-VIDEO disabled state, NB rows, G120-3 (401), PX-NET/REG-HYD; browserVerified=true realVerified=true; inconclusive: WG-VIDEO pre-round drawing baseline; blocked: fake-Bearer 403 backend unavailable in cloud); gate 120 published 0a75ba8';
r120.note = String(r120.note || '').replace('Round 121 planning (on/after 2026-10-24 UTC) is the REGRESSION round regardless of the outcome.', '') + ' | B round-121 planning (D-29z86): planning happened at 2026-10-23 23:26:24 UTC (2 days since regression-last), so the regression round was not due; round 121 = stage 4b, round 122 = REGRESSION.';
b.rounds.push({
  round: 121,
  task: 'current-task.md',
  decision: 'D-29z86',
  status: 'dispatched',
  items: ['T12-GAIN-VOLUME stage 4b (T12.18 + Test 7)'],
  note: 'A owns new waveform-zoom.ts, ArrangementClip.tsx (optional waveformZoom prop default 1 + scale source clipWaveformScale), ArrangementLane.tsx (optional prop pass-through only), StudioWorkspace.tsx (one view state, handler + status, appearance-none select last in arrangement-grid-control, data-waveform-zoom, lane prop), new waveform-zoom.test.tsx (WZ1-WZ9, m1-m5), new doc 103. DetailPanel, Context, model, peaks, graph, schedule, export and every existing test frozen. C: WZ-PRESENT + WZ-T7 at both viewports, WZ-LEVELS, WZ-GAIN, WZ-HISTORY, WZ-AUDIO (1 LSB, ratio 1.0000), WZ-METER (paired per-iteration tap peaks), WZ-NEWCLIP, WZ-KEYS, WZ-RELOAD, T121-TARGETED, AN-REVIEW, SOURCE-SCOPE, G121-3, PX-NET/REG-HYD, NB rows; against B browser baseline b-round-120/probe/baseline-r121.json. Baseline 0a75ba8 clean; frozen b-round-120-r121-tree-sha256.txt (931). Round 122 planning (on/after 2026-10-24 UTC) is the REGRESSION round; after a C FAIL the bounded fix-up comes first.'
});
const t12 = b.post_current_stage_queue.find((q) => q.id === 'T12-GAIN-VOLUME');
t12.status = 'in_progress (stages 1, 2, 3a, 3b, 4a c_pass_published: 38c0e21, d5de68f, 9cb820b, 4090f6e, 0a75ba8; stage 4b dispatched round 121 (D-29z86); V1 complete only after 4b C PASS; REGRESSION round at round 122 planning)';
const s4a = t12.stages.find((s) => s.stage === '4a');
s4a.status = 'c_pass_published';
s4a.evidence = 'c-round-120.json PASS browserVerified=true realVerified=true, 0 bugs: WG-SCALE 1440/1280 (-6: 224 judged 0 violations; +3: 288 judged 0 violations), WG-CLAMP-FLOOR (+12 32 clamped, -60 all floor), WG-LIVE both viewports (mid-drag ratio, one entry, exact Undo), WG-DETAIL (480 columns), WG-MULTI, WG-MUSTNOT, WG-PLAY (0 createBufferSource), WG-AUDIO peak/RMS ratio 0.501187; gate 120 published 0a75ba8';
const s4b = t12.stages.find((s) => s.stage === '4b');
s4b.status = 'dispatched (round 121, D-29z86)';
s4b.round = 121;
s4b.decision = 'D-29z86';
s4b.rulings = 'stepped select 0.5/1/2/4/8 (appearance-none, last in the 224 px grid row; B measured 28 px ending at 210 <= 216; transport/tempo/marker/loop rows have no room without changing heights) = deliberate CZABA difference from the Live slider; 1/2x exists because T12.18 says increase or decrease (Live text: enlarge only); audio clips on lanes only (Live 12 6.1: audio clips, all audio tracks in the Arrangement, new clips too); video drawing and detail panel unchanged; session-only view state (not history, not arrangement, not localStorage) so it can never reach scheduleKey/graph/meters/export; scale = clipLinearGain x zoom through the existing pre-clamp buildPeakShape parameter (byte-identical at 1x); optional props default 1 so no existing test is granted';
t12.v1_gate_round116_planning = 'V1 = stages 1, 2, 3a, 3b, 4a, 4b (T12.27 items 1-8); stage 5+ is the T12-ADVANCED queue entry';
t12.t12_rulings_round121_planning = 'D-29z86: round 120 C PASS (browserVerified, 0 bugs) + gate 120 published 0a75ba8 -> stage 4a c_pass_published. date -u 2026-10-23 23:26:24 = 2 days since regression-last 2026-10-21, so the regression round is not due by the rule; the round-120 forecast (regression at round 121) assumed planning on/after 2026-10-24 and is superseded. Round 121 = stage 4b (closes V1); round 122 planning (>= 3 days) = REGRESSION round covering V1; after a C FAIL the bounded fix-up comes first. B captured a browser baseline on the clean published tree (b-round-120/probe/baseline-r121.json) so C has exact 1x drawing hashes (closes the round-120 WG-VIDEO inconclusive gap for this round) and a layout must-not.';
const f = (id) => b.open_findings.find((x) => x.id === id);
b.open_findings.push({
  id: 'C-R120-01',
  severity: 'info',
  status: 'applied as a process rule from round 121 (current-task.md section 2: every lasting edit via Edit/Write incl. formatting of new files; shell replaces only for temporary mutations, restored and sha-verified; A lists every shell write); not an app defect; not deferred_low_polish',
  to: 'B',
  title: 'A made one lasting formatting edit to its new test file with a Python replace, bypassing the Edit-tool primitives hook',
  evidence: 'c-round-120.json observations C-R120-01; a-round-120.md deviation 2'
});
b.open_findings.push({
  id: 'C-R120-WGVIDEO-NO-BASELINE',
  severity: 'info',
  status: 'acknowledged; B captured a pre-round browser baseline for round 121 (b-round-120/probe/baseline-r121.json: video waveform d sha be86af38 at 1x on 0a75ba8); the round-120 equivalence rests on code + WG2 (scale 1 byte-identical)',
  title: 'WG-VIDEO unchanged-vs-pre-round had no browser byte baseline (inconclusive row in C round 120)',
  evidence: 'c-round-120.json inconclusive'
});
b.open_findings.push({
  id: 'ARCH-R120-PEAKSHAPE-TO-PEAKS',
  severity: 'info',
  status: 'signal - addendum (ad) to the pending checkpoint request b-round-91-checkpoint-request.md (ARCH-CHECKPOINT-PHASE1-BOUNDARY); reviewer verdict keep; round 121 does not move it; not scheduled',
  title: 'buildPeakShape/PeakShape are pure geometry exported from the ArrangementClip component file; the detail panel and tests import them from there; proposal: move to app/lib/arrangement/peaks.ts with the same signatures as a single-owner task covered by WG1/WG2',
  evidence: 'a-round-120.md Code review Architecture note'
});
b.open_findings.push({
  id: 'WAVEFORM-ZOOM-DISCOVERABILITY',
  severity: 'info',
  status: 'signal for DESIGN-UX-REVIEW (round 121 ruling: appearance-none select without a dropdown arrow to fit the 224 px grid row; title + aria-label carry the meaning); not scheduled',
  title: 'the Waveform Zoom select has no visible dropdown affordance',
  evidence: 'b-round-120/probe/baseline-r121.json probe widths (native 48 px overflows, appearance-none 28 px fits)'
});
b.open_findings.push({
  id: 'WAVEFORM-ZOOM-LIVE-PARITY',
  severity: 'info',
  status: 'signal for ABLETON-EXPERT-REVIEW (not scheduled): Live 12 6.1 confirms a slider for all audio tracks incl. new clips; range, location, undo behaviour and Clip View behaviour unconfirmed; CZABA uses a stepped select 0.5x-8x, lanes only, not in history',
  title: 'Waveform Vertical Zoom: stepped select vs Live continuous slider; detail panel not zoomed',
  evidence: 'b-round-71/ableton-arrangement-view-20261021.txt section 6.1; current-task.md round 121 section 6'
});
const env = f('ENV-FIRST-LOAD-GRID-NULL');
if (env) env.status = 'watch (fourth occurrence in C round 120 wg-1440-1; harness rule: discard a crashed first setup run and replace it once)';
const ck = f('ARCH-CHECKPOINT-PHASE1-BOUNDARY');
if (ck) ck.status += ' | round 121 planning: addendum (ad) appended (round-120 reviewer: move buildPeakShape/PeakShape to peaks.ts; keep); T12 V1 closes with round 121 (feature boundary) - the request stays pending and non-blocking, not re-sent';
fs.writeFileSync(path, JSON.stringify(b, null, 1) + '\n');
console.log('ok', b.version, b.open_findings.length, b.rounds.length);
