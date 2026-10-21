const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 33) throw new Error('expected v33, got ' + b.version);
b.version = 34;
b.updated = '2026-10-13 (B: round 32 result -> round 33 dispatch, D-29x)';
b.current_task = 'current-task.md (round 33: C-R32-01 only - one capture-phase pointerdown handler on the timeline scroller in StudioWorkspace blurs a focused native range input unless the target is a range input or a pointer gesture is active; pending keyboard Volume/Master preview commits via the existing onBlur before the clicked gesture; tests appended to fader-guards.test.tsx >= 11 it; doc 036 append)';
b.advisor_used_by_B += ' ; round 32 -> 33 planning (2026-10-13): advisor available, called once before writing (advice applied: one-bug round, fix focus not guard, single scroller capture listener, no blur during an active gesture, pending-commit oracle, A-R32-REVIEW-1 Low to 4b, FB-05 stays bug, re-baseline with ArrangementLane frozen and fader-guards appendable)';
const s = b.items.find((i) => i.id === 'SRW-13');
const fix = s.stages.find((x) => x.stage === '4a-fix');
fix.status = 'c_fail_new_bug';
fix.result = 'C FAIL round 32 (c-round-32.md) only on C-R32-01 (Medium, new, caused by the round-32 guard: after a real click on a fader and then on a clip or lane, Delete is dead because timeline pointerdowns preventDefault and focus stays on the fader). PASS: G32-1..3, R32-BC, R32-K, R32-S, R32-U (a-g killed; b2 survives, accepted), R32-Doc; R32-DK isolated rows PASS. vitest 1212/1212. B re-ran gates (b-round-32/gates.txt).';
s.stages.splice(s.stages.findIndex((x) => x.stage === '4b'), 0, {
  stage: '4a-fix2',
  round: 33,
  status: 'dispatched',
  decision: 'D-29x',
  scope: 'C-R32-01: a pointerdown inside the timeline scroller on a non-range element blurs a focused native range input (Volume, Pan, Master, Zoom) via one capture handler in StudioWorkspace; no blur while a pointer gesture is active or when the target is a range input; pending keyboard fader preview commits on blur before the clicked gesture claims; Arrow nudge/Enter/Home after fader->clip click work again; round-32 guard unchanged',
  acceptance: ['R33-FT', 'R33-KO', 'R33-G', 'R33-K', 'R33-S', 'R33-U', 'R33-Doc', 'G33-1', 'G33-2', 'G33-3'],
});
const st4b = s.stages.find((x) => x.stage === '4b');
st4b.round = 34;
st4b.scope += '; A-R32-REVIEW-1 (Pan blur suppression can stay on after an out-of-window release; Low)';
s.stages.find((x) => x.stage === '4c').round = 35;
s.decisions_round33 = {
  result_round32: 'C FAIL on C-R32-01 only; every other ID PASS; C-R31-01 fixed (R32-BC PASS); C-R31-02 fixed in isolation (R32-DK isolated rows PASS) but the real user flow is broken by C-R32-01',
  fix: 'focus, not guard: one capture-phase pointerdown handler on the scroller blurs the focused native range input; reproduces what the browser does without preventDefault (focus to body = C passing control). Rejected: focusing the clip (no tabIndex, frozen file), per-handler calls (3+ files), narrowing the guard (brings back C-R31-02 or hidden state)',
  exclusions: 'no blur while isPointerGestureActive() (second pointer is refused anyway; blur would cancel a running fader drag); no blur when the target is a range input; outside the scroller unchanged; text fields unchanged (FOCUS-TEXT-STALE record only)',
  a_r32_review_1: 'Low, carried to stage 4b (round 34): trusted mouse pointerup id 1 clears it (C bc-pid1-realclick.txt); touch/pen get pointercancel; any change alters the round-32 contract',
  mutation_d_note: 'round-32 mutation (d) is protected by the pointercancel->key and another-pointer tests, not by the fresh-drag test (C round 32 R32-U)',
  fb05_status: 'stays bug: round 32 was its fix round and ended FAIL; the Pan->clip->Delete flow is dead (C-R32-01 is in the same flow, not pre-existing elsewhere)',
  renumber: '4b -> round 34, 4c + polish -> round 35',
};
const f = b.open_findings;
const byId = (id) => f.find((x) => x.id === id);
Object.assign(byId('C-R31-01'), { status: 'closed', closed: 'round 32: C R32-BC PASS (c-round-32/runs/bc-*.txt); B gates b-round-32/gates.txt' });
Object.assign(byId('C-R31-02'), { status: 'fixed_in_isolation_not_closed', to: 'closes with C-R32-01 (round 33, D-29x)', note2: 'round 32: R32-DK isolated rows PASS (Volume/SFX Volume/Master/Zoom/Pan); the real fader->clip->Delete flow is broken by C-R32-01' });
Object.assign(byId('R31-U-GAP-B2'), { status: 'accepted', closed: 'round 32: A enumeration (a-round-32.md section 1.4) found no reachable non-reschedule sync with the Pan override set; C mutation b2 survives as expected (c-round-32.md R32-U)' });
const r24 = byId('R24-HC-COVERAGE');
if (r24) Object.assign(r24, { status: 'closed', closed: 'round 32: fader-guards Home on Volume/Master test; C R32-K Home rows PASS' });
byId('A-R31-REVIEW-2').to = 'SRW-13 stage 4b (round 34)';
f.push({ id: 'C-R32-01', severity: 'medium', status: 'open', to: 'round 33 (D-29x)', title: 'after a real click on a fader and then on a clip or the lane body, Delete/Backspace do nothing: timeline pointerdowns preventDefault so focus stays on the fader and the round-32 range guard swallows the key', evidence: 'c-round-32.md C-R32-01; c-round-32/runs/dk-focus-retention.txt; runs/dk.txt; runs/bc-pid1-realclick.txt', note: 'new, caused by the round-32 guard; Volume/Master/Zoom regressed, Pan already dead before round 32; Arrow nudge/Enter/Home share the pre-existing root cause' });
f.push({ id: 'A-R32-REVIEW-1', severity: 'low', status: 'open', to: 'SRW-13 stage 4b (round 34)', title: 'Pan blur suppression can stay on if the held button is released outside the window; Pan keyboard changes are dropped silently until the next same-id pointerup/pointercancel or a new Pan drag', evidence: 'a-round-32.md section 4 finding 1; c-round-32/runs/bc-pid1-realclick.txt (real click clears it)' });
f.push({ id: 'FOCUS-TEXT-STALE', severity: 'info', status: 'observation', to: 'round 33 record only; own bug round if C confirms', title: 'B code reading: a focused text field (library search, Clip Gain) keeps focus after a timeline click because timeline pointerdowns preventDefault; Delete then edits the text instead of the selection', evidence: 'b-round-32.md section 4 decision 4' });
const r32 = b.rounds.find((r) => r.round === 32);
Object.assign(r32, { task: 'tasks/round-32.md', status: 'c_fail_new_bug', result: 'C FAIL on C-R32-01 (Medium, new); PASS G32-1..3, R32-BC, R32-K, R32-S, R32-U, R32-Doc; vitest 1212/1212' });
b.rounds.push({ round: 33, task: 'current-task.md', items: ['C-R32-01 timeline pointerdown releases fader focus'], status: 'dispatched', decision: 'D-29x', note: 'frozen: b-round-32-tree-sha256.txt (376 files incl. round-32 ArrangementLane.tsx); snapshots b-round-32-snapshots/ (StudioWorkspace.tsx 0bf51b45, fader-guards.test.tsx c7b071e8, doc 036 4aede19f); baseline 9 status lines (b-round-32-git-status.txt); expected end 9 lines (or 4 if root commits round 31 first)', c_ids: ['R33-FT', 'R33-KO', 'R33-G', 'R33-K', 'R33-S', 'R33-U', 'R33-Doc', 'G33-1', 'G33-2', 'G33-3'], owned: ['app/components/arrangement/StudioWorkspace.tsx (one scroller capture handler)', 'app/lib/arrangement/__tests__/fader-guards.test.tsx (append one describe)', 'docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md (append)'] });
b.vitest_floor_round33 = 1212;
b.baseline_tree_at_round33 = 'HEAD 1cefea1 + 9 uncommitted lines (round 31 C-verified; round 32 C FAIL on C-R32-01 only); sha256 of 376 frozen files: b-round-32-tree-sha256.txt; 3 owned snapshots in b-round-32-snapshots/; B gates b-round-32/gates.txt: 375 OK vs round-31 list, protected 4/4, tsc 0, vitest 69/1212, build ok, Biome 2 CRLF errors (root) + 218 warnings';
if (Array.isArray(b.tech_lead_manual_checks)) {
  b.tech_lead_manual_checks.push({ id: 'R33-T', what: 'real mouse in real Chrome: click a fader, click a clip, press Delete -> the clip is deleted', added: 'round 33 (D-29x)' });
} else {
  b.tech_lead_manual_checks_r33 = 'R33-T: real mouse in real Chrome: click a fader, click a clip, press Delete -> the clip is deleted';
}
fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length, Array.isArray(b.tech_lead_manual_checks));
