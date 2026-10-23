const fs = require('fs');
const path = '/home/runner/czaba-project/tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(path, 'utf8'));
const now = '2026-10-23 (B round 119 result / round 120 plan, D-29z85)';
b.updated = now;
b.current_task = 'current-task.md (round 120: D-29z85 - T12 stage 4a: the waveform drawing shows the clip Clip Gain (display only): buildPeakShape scale parameter applied before the clamp, lane + detail call sites pass clipLinearGain(clip), clip.gainDb in memo deps, data-testid arrangement-clip-waveform; new clip-gain-waveform.test.tsx WG1-WG8 (B-derived Float32 path literals), m1-m4, new doc 102; baseline clean 4090f6e; frozen b-round-119-r120-tree-sha256.txt (930))';
b.advisor_used_by_B = 'round 119 result / round 120 plan: advisor available and consulted before writing';
b.baseline_tree_at_round120 = {
  head: '4090f6ea78317ebc331cd6add9c63d318ca4ab41',
  working_tree: 'clean (git status --porcelain empty); gate 119 published 4090f6e (rounds 118+119, both remotes)',
  frozen_list: 'tmp/studio-real-loop/b-round-119-r120-tree-sha256.txt',
  entries: 930,
  excluded: [
    'app/components/arrangement/ArrangementClip.tsx (pre 67166666db5f2...)',
    'app/components/arrangement/ArrangementDetailPanel.tsx (pre 4abed0d9f18bb...)'
  ],
  new_files_granted: [
    'app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx',
    'docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md'
  ],
  protected: {
    'app/routes/studio.$productId.tsx': 'fa2cf0bc',
    'app/routes/api.studio-token.ts': '13914809',
    'app/lib/auth.ts': '56f5b76f',
    'app/contexts/AuthContext.tsx': 'bf9ee257'
  }
};
const r119 = b.rounds.find((r) => r.round === 119);
r119.status = 'c_pass (c-round-119.json: T119-TARGETED 452/452, AN-REVIEW, SOURCE-SCOPE, SH-MASTER + GV-DRAG at both viewports, G119-3, PX-NET/REG-HYD; browserVerified=true realVerified=true; round-118 browser rows carried by byte-identical source); gate 119 published 4090f6e (rounds 118+119)';
b.rounds.find((r) => r.round === 118).status += ' | published with round 119 as 4090f6e after C round 119 PASS';
b.rounds.push({
  round: 120,
  task: 'current-task.md',
  decision: 'D-29z85',
  status: 'dispatched',
  items: ['T12-GAIN-VOLUME stage 4a (T12.19)'],
  note: 'A owns ArrangementClip.tsx (buildPeakShape scale param, call site, memo deps, import, data-testid), ArrangementDetailPanel.tsx (call site + deps + import only), new clip-gain-waveform.test.tsx (WG1-WG8, m1-m4), new doc 102. No existing test granted (B grep: no peak path pins). C: WG-SCALE/WG-LIVE at both viewports, WG-CLAMP-FLOOR, WG-DETAIL, WG-MULTI, WG-MUSTNOT, WG-PLAY, WG-AUDIO (neighbour, 0.501187), WG-VIDEO, T120-TARGETED, AN-REVIEW, SOURCE-SCOPE, G120-3, PX-NET/REG-HYD. Baseline 4090f6e clean; frozen b-round-119-r120-tree-sha256.txt (930). Round 121 planning (on/after 2026-10-24 UTC) is the REGRESSION round regardless of the outcome.'
});
const t12 = b.post_current_stage_queue.find((q) => q.id === 'T12-GAIN-VOLUME');
t12.status = 'in_progress (stages 1, 2, 3a, 3b c_pass_published: 38c0e21, d5de68f, 9cb820b, 4090f6e; stage 4a dispatched round 120 (D-29z85); stage 4b after the regression round; V1 complete only after 4b C PASS)';
const s3b = t12.stages.find((s) => s.stage === '3b');
s3b.status = 'c_pass_published';
s3b.evidence += ' | round 119 fix-up (D-29z84): C PASS (c-round-119.json: T119-TARGETED 452/452, SH-MASTER -2.5 vs plain -27.5 and GV-DRAG -25.0 dB at 1440 and 1280, SOURCE-SCOPE app byte-identical so the round-118 browser rows carry; browserVerified=true realVerified=true); gate 119 published 4090f6e (rounds 118+119)';
const idx = t12.stages.findIndex((s) => s.stage === 4);
t12.stages.splice(idx, 1,
  {
    stage: '4a',
    round: 120,
    decision: 'D-29z85',
    status: 'dispatched',
    scope: 'T12.19: the lane and detail waveform drawings scale by the clip linear Clip Gain (10^(dB/20)) applied before the clamp (0.02 floor and 1.0 clamp kept); live during single and multi Clip Gain drags; Undo restores the exact drawing; must-not: track/group Volume, Master, Pan, mute/solo, fades, envelope do not change the drawing; audio path untouched',
    rulings: 'one scale parameter in buildPeakShape (4b multiplies the zoom into the same factor, spec formula source x clipGainDisplayScale x waveformZoomScale); clipLinearGain reused, model.ts not edited; detail panel agrees with the lane (one clip, one picture; B choice); raw peaks, no normalization; Ableton: waveform reflects clip gain is an inference from Live 12 section 6.1, scale/clamp unconfirmed'
  },
  {
    stage: '4b',
    status: 'not_started (after the REGRESSION round)',
    scope: 'T12.18 Waveform Vertical Zoom: a view-only control (Live 12 section 6.1: a slider applied to all audio tracks), never in history, never in the engine or export; drawing = peak x clipGain x zoom; T12.26 Test 7 (100% -> 200%: drawing larger, audio samples and meter output unchanged). Required half of T12.27 item 8'
  }
);
t12.v1_gate_round116_planning = 'V1 = stages 1, 2, 3a, 3b, 4a, 4b (T12.27 items 1-8); stage 5+ is the T12-ADVANCED queue entry';
t12.t12_rulings_round120_planning = 'D-29z85: round 119 C PASS + gate 119 published 4090f6e -> stage 3b c_pass_published, C-R118-01 and A-R118-REVIEW-DOC100-L69 closed. Regression round not due (date -u 2026-10-23 22:38:46, 2 days since 2026-10-21); round 121 planning (on/after 2026-10-24 UTC) is the REGRESSION round regardless of the round-120 outcome. Stage 4 split into 4a (T12.19, round 120) and 4b (T12.18 vertical zoom + Test 7, after the regression round); scope unchanged, nothing deferred; 4b is the half T12.27 item 8 requires. B derived the WG1 path literals in node with Float32Array input (C-R118-01 lesson).';
const f = (id) => b.open_findings.find((x) => x.id === id);
f('C-R118-01').status = 'done (round 119 C PASS: T119-TARGETED 452/452, CF11 toBe(-1); AN-REVIEW reverse hash 261472d6 exact; published 4090f6e)';
f('A-R118-REVIEW-DOC100-L69').status = 'done (round 119 C AN-REVIEW-DOC100 PASS: only l.69 changed; published 4090f6e)';
f('GATE117-S1-DOC100-STALE').status = 'done (published 4090f6e with rounds 118+119)';
b.open_findings.push({
  id: 'C-R119-01',
  severity: 'info',
  status: 'applied as a process rule from round 120 (current-task.md section 2: before touching an untracked granted file, A stores a pre-edit copy with sha256 under a-round-N/; B stores one under b-round-N/ when it grants such a file); not an app defect; not deferred_low_polish',
  to: 'B',
  title: 'no pre-edit copy of the untracked doc 101 existed, so C could verify its round-119 edit by content only, not by reverse hash',
  evidence: 'c-round-119.json observations C-R119-01; c-round-119.md AN-REVIEW detail'
});
b.open_findings.push({
  id: 'ENV-FIRST-LOAD-GRID-NULL-3',
  severity: 'info',
  status: 'merged into ENV-FIRST-LOAD-GRID-NULL (third occurrence: C round 119 ui-1440-1 crashed in setup on the first load; replaced within budget); harness rule repeated in round 120 section 5',
  title: 'first /studio-lab load of the job crashed the C setup again (grid control null)',
  evidence: 'c-round-119.json notes_valid_runs'
});
const env = f('ENV-FIRST-LOAD-GRID-NULL');
if (env) env.status = 'watch (third occurrence in round 119; harness rule: discard a crashed first setup run and replace it once)';
fs.writeFileSync(path, JSON.stringify(b, null, 1) + '\n');
console.log('ok', b.open_findings.length, b.rounds.length);
