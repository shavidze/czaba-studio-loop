const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 35) throw new Error('expected v35, got ' + b.version);
b.version = 36;
b.updated = '2026-10-13 (B: round 34 result -> round 35 dispatch, D-29z)';
b.current_task = 'current-task.md (round 35: C-R34-01 + C-R34-02 - a workspace-root pointerdown capture blurs a focused text-entry field when the pointerdown target is a native range input (track Volume/Pan, Master, Zoom) and no pointer gesture is active, so a typed Clip Gain commits through the existing onBlur before the range claims its gesture; round-34 scroller handler byte-identical; tests appended to fader-guards.test.tsx >= 10 it; doc 036 append + C-R34-02 correction)';
b.advisor_used_by_B += ' ; round 34 -> 35 planning (2026-10-13): advisor available, called once before writing (advice applied: separate root-level capture handler limited to focused typing target + range target + no active gesture, round-34 scroller handler byte-identical; contract amendment row with chronological tail [Clip Gain, Volume]; red-first cases incl. Master outside the scroller, gesture-active must-not and decision-4 guard; mutations a-f; statuses from C evidence only; doc/wording Lows bundled; root commit before A starts; 4b renumbered to 36)';

const s = b.items.find((i) => i.id === 'SRW-13');
const fix3 = s.stages.find((x) => x.stage === '4a-fix3');
fix3.status = 'done';
fix3.result = 'C PASS round 34 (c-round-34.md): G34-1..3, R34-TS (search -> header/lane/clip body/ruler, Delete and Backspace, search text kept; 1280 spot), R34-CG (CG-1..CG-5 + unchanged contract; CG-6 live: 2 setTargetAtTime per commit inside the loop window = playing + scheduled source, 1 outside, 0 restarts), R34-SB (gutter synthetic labelled; empty area real click), R34-R33, R34-K, R34-S, R34-U (a-g killed), R34-Doc (one Low inaccuracy C-R34-02). vitest 1247/1247. B re-ran gates (b-round-34/gates.txt): 376 OK, protected 4/4, tsc 0, vitest 69/1247, build ok, Biome 2 CRLF (root) + 218 warnings + 1 info.';
s.stages.splice(s.stages.findIndex((x) => x.stage === '4b'), 0, {
  stage: '4a-fix4',
  round: 35,
  status: 'dispatched',
  decision: 'D-29z',
  scope: 'C-R34-01 + C-R34-02: a workspace-root onPointerDownCapture blurs a focused text-entry field (isTypingTarget) when event.target is a native range input and no pointer gesture is active, so a typed Clip Gain commits via the existing onBlur before the range claims its gesture (track Volume/Pan inside the scroller, Master in the header, Zoom in the transport). Focused ranges are not handled by the new code (4b). Round-34 scroller handler byte-identical. Doc 036: C-R34-02 headless gutter correction',
  acceptance: ['R35-CR', 'R35-CL', 'R35-OT', 'R35-R34', 'R35-K', 'R35-S', 'R35-U', 'R35-Doc', 'G35-1', 'G35-2', 'G35-3'],
});
const st4b = s.stages.find((x) => x.stage === '4b');
st4b.round = 36;
st4b.scope += '; 4b must keep the round-35 root capture working: if 4b changes range pointerdown (for example preventDefault for the no-jump click), the root capture is the only focus-release path for a text field before a range gesture';
s.stages.find((x) => x.stage === '4c').round = 37;
s.decisions_round35 = {
  result_round34: 'C PASS on every round-34 ID; FOCUS-TEXT-STALE and CLIP-GAIN-CLICK-DISCARD closed; A-R33-REVIEW-SCROLLBAR handled (gutter synthetic + empty area real click PASS; real scrollbar = Tech Lead R34-T); new C-R34-01 Medium (= A-R34-REVIEW-1, browser-confirmed) and C-R34-02 Low (doc)',
  fix: 'a separate workspace-root capture handler: focused isTypingTarget + event.target isRangeInputTarget + !isPointerGestureActive() -> focused.blur(); nothing else (no preventDefault, no status, no focus move). The round-34 scroller handler, predicates and keydown handler stay byte-identical',
  why_ranges_only: 'every other pointer-gesture claimer (Overview, VideoDock, DetailPanel resize, lane height, clip, loop brace) calls preventDefault on pointerdown, so focus stays in the text field and the typed value is kept for a later commit; a native range cannot preventDefault without losing its native drag, so the browser moves focus after the range claimed its gesture and commitClipGain refuses (GESTURE_EDIT_BLOCKED) and restores the old text - the only loss path. A verifies this list in its pre-flight',
  scope_choice: 'focused ranges are not handled by the new code (A-R32-REVIEW-1 / 4b territory); outside-scroller non-range pointerdowns unchanged (D-29y 4)',
  expected_history: 'chronological tail [Clip Gain, Volume] (or Pan / Master Volume): two entries, SFX gainDb 3, no gesture-blocked status, fader at the click point (native jump; no-jump is stage 4b); two Undos restore both',
  zoom: 'Zoom never claims a gesture, so a Clip Gain typed value already commits there; it is a regression row',
  cg6_oracle_wording: 'live clip-gain oracle reworded (C round 34): one setTargetAtTime per live or scheduled SFX source node, 0 restarts',
  doc: 'C-R34-02: headless reserves a 10 px vertical gutter (scrollbar-gutter: stable); only the horizontal scrollbar is 0 px; scrollbars are hidden, so hit-testing in the gutter reaches content children',
  a_r33_scrollbar_status: 'closed for code: C passed the gutter rule synthetically and the empty area with a real click; real-scrollbar confirmation stays with the Tech Lead (R34-T(3), Firefox overlay variant) like FB-05 R31-T',
  renumber: '4b -> round 36, 4c + polish -> round 37',
};

const f = b.open_findings;
const byId = (id) => f.find((x) => x.id === id);
Object.assign(byId('FOCUS-TEXT-STALE'), { status: 'closed', closed: 'round 34: C R34-TS PASS (c-round-34/runs/ts-1440.txt, ts-1280.txt, ts-mustnot.txt); B gates b-round-34/gates.txt' });
Object.assign(byId('CLIP-GAIN-CLICK-DISCARD'), { status: 'closed', closed: 'round 34: C R34-CG PASS for clip/lane targets (c-round-34/runs/cg-1to4.txt, cg5.txt, cg-unchanged.txt, cg6-1..4.txt); range targets were excluded by the round-34 contract and are C-R34-01' });
Object.assign(byId('A-R33-REVIEW-SCROLLBAR'), { status: 'closed', closed: 'round 34: gutter rule PASS synthetically (labelled; headless hides the scrollbar), empty area PASS with a real click (c-round-34/runs/sb-*.txt, mutations b/c/g killed); real-scrollbar check stays Tech Lead R34-T(3) incl. Firefox overlay variant' });
const touch = byId('A-R33-REVIEW-TOUCH');
touch.to = 'SRW-13 stage 4b (round 36)';
touch.note = 'widened in round 34 to text fields (touch scroll on the timeline releases search focus / commits Clip Gain early); doc 036 round-34 residuals';
for (const id of ['A-R32-REVIEW-1', 'A-R31-REVIEW-2', 'A-R29-REVIEW-1', 'FADER-KEY-ENTRIES', 'MASTER-HOLD-TICK-EDGE']) {
  const x = byId(id);
  if (x) x.to = 'SRW-13 stage 4b (round 36)';
}
f.push({ id: 'C-R34-01', severity: 'medium', status: 'open', to: 'round 35 (D-29z)', title: 'a typed Clip Gain value (no Enter) is lost when the user presses a native range (track Volume/Pan, Master Volume): the range claims its gesture on pointerdown, the browser then moves focus, commitClipGain refuses with GESTURE_EDIT_BLOCKED and restores the old text; the fader jumps with +1 entry', evidence: 'c-round-34/runs/rec-a-r34-review-1.txt; c-round-34.json bugs[0]; a-round-34.md section 4 R1', note: '= A-R34-REVIEW-1 (code reading), browser-confirmed by C round 34; outside the round-34 contract; status text shown, so not silent' });
f.push({ id: 'C-R34-02', severity: 'low', status: 'open', to: 'round 35 (D-29z)', title: 'doc 036 round-34 section says the headless scrollbar is 0 px; headless reserves a 10 px vertical gutter (scrollbar-gutter: stable), only the horizontal scrollbar is 0 px', evidence: 'c-round-34/runs/sb-geometry.txt, sb-synthetic.txt; doc 036 l.355', note: 'doc only; the same wording was in B task text and feature-status section 5 (R11-SB, R34-T) - B corrects its own files in round 34 planning' });
f.push({ id: 'A-R34-REVIEW-RESIDUALS', severity: 'low', status: 'open', to: 'stage 4b / final regression', title: 'A round-34 review residuals: RTL left scrollbar not counted as gutter; Firefox overlay scrollbars (0 px client-box gutter); a right-button press commits Clip Gain (event.button ignored); rect - clientLeft under transform/zoom', evidence: 'a-round-34.md section 4 R2, R3, N; doc 036 round-34 residuals', note: 'LTR UI; overlay variant added to Tech Lead R34-T; right-button commit equals native blur behaviour' });

const r34 = b.rounds.find((r) => r.round === 34);
Object.assign(r34, { task: 'tasks/round-34.md', status: 'c_pass', result: 'C PASS all IDs (G34-1..3, R34-TS, R34-CG, R34-SB, R34-R33, R34-K, R34-S, R34-U a-g killed, R34-Doc); vitest 1247/1247; FOCUS-TEXT-STALE + CLIP-GAIN-CLICK-DISCARD + A-R33-REVIEW-SCROLLBAR closed; new C-R34-01 (Medium), C-R34-02 (Low)' });
b.rounds.push({ round: 35, task: 'current-task.md', items: ['C-R34-01', 'C-R34-02'], status: 'dispatched', decision: 'D-29z', note: 'frozen: b-round-34-tree-sha256.txt (376 files, = round-33 list); snapshots b-round-34-snapshots/ (StudioWorkspace.tsx b64a2cf6, fader-guards.test.tsx 11a19bf6, doc 036 e86072b8); baseline 9 status lines (b-round-34-git-status.txt); expected end 9 lines (or 3 if root commits rounds 31-34 first)', c_ids: ['R35-CR', 'R35-CL', 'R35-OT', 'R35-R34', 'R35-K', 'R35-S', 'R35-U', 'R35-Doc', 'G35-1', 'G35-2', 'G35-3'], owned: ['app/components/arrangement/StudioWorkspace.tsx (one root capture handler + its JSX attribute)', 'app/lib/arrangement/__tests__/fader-guards.test.tsx (append one describe)', 'docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md (append + header + C-R34-02 one-line correction)'] });
b.vitest_floor_round35 = 1247;
b.baseline_tree_at_round35 = 'HEAD 1cefea1 + 9 uncommitted lines (rounds 31-34 C-verified, ready for root checkpoint); sha256 of 376 frozen files: b-round-34-tree-sha256.txt; 3 owned snapshots in b-round-34-snapshots/; B gates b-round-34/gates.txt: 376 OK, protected 4/4, tsc 0, vitest 69/1247, build ok, Biome 2 CRLF errors (root) + 218 warnings + 1 info';

const lib = b.items.find((i) => i.id === 'SRW-12');
lib.round35_note = 'FOCUS-TEXT-STALE closed by C round 34 (R34-TS); functions C-verified; remaining manual: Tech Lead R12-L4, R17-T, R34-T(1)/(3)';
const srw24 = b.items.find((i) => i.id === 'SRW-24');
srw24.round35_note = 'search -> clip -> Delete/Backspace now deletes with a gap (C round 34 R34-TS); Tech Lead R28-T, R34-T(1)';

const t = b.tech_lead_manual_checks.find((x) => x.id === 'R34-T');
t.what += '; (3) also in Firefox with overlay scrollbars (A round-34 review R3). Headless reserves a 10 px gutter but hides the scrollbar and hit-tests through it, so only a real scrollbar proves (3)';

fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length, b.tech_lead_manual_checks.length);
