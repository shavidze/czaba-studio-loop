const fs = require('fs');
const p = 'backlog.json';
const b = JSON.parse(fs.readFileSync(p, 'utf8'));
if (b.version !== 34) throw new Error('expected v34, got ' + b.version);
b.version = 35;
b.updated = '2026-10-13 (B: round 33 result -> round 34 dispatch, D-29y)';
b.current_task = 'current-task.md (round 34: FOCUS-TEXT-STALE + CLIP-GAIN-CLICK-DISCARD + A-R33-REVIEW-SCROLLBAR - the round-33 scroller capture handler also blurs a focused text-entry field (isTypingTarget) and skips pointerdowns in the scroller scrollbar gutter (geometry); Clip Gain typed value commits through the existing onBlur before the selection change; tests appended to fader-guards.test.tsx >= 12 it; doc 036 append)';
b.advisor_used_by_B += ' ; round 33 -> 34 planning (2026-10-13): advisor available, called once before writing (advice applied: general isTypingTarget predicate, Clip Gain commit oracle like round-33 case 5 incl. a Tab-blur-equivalent invalid case, scrollbar exclusion as a stated contract amendment with mutation, Backspace hazard stated + R34-T, backlog from C evidence only, FB-05 ruling stated, snapshots retaken). B deviation from the advice: the gutter is detected by client-box geometry, not by target === scroller alone, so the empty area below the lanes still releases focus (no C-R32-01 regression there)';

const s = b.items.find((i) => i.id === 'SRW-13');
const fix2 = s.stages.find((x) => x.stage === '4a-fix2');
fix2.status = 'done';
fix2.result = 'C PASS round 33 (c-round-33.md): G33-1..3, R33-FT (5 faders x header/lane/clip body/ruler, Delete and Backspace, activeElement BODY; dk-focus-retention B/C/D delete; round-32 must-not 5/5; 1280 spot 3/3), R33-KO, R33-G, R33-K, R33-S, R33-U (a-f killed), R33-Doc. vitest 1230/1230. B re-ran gates (b-round-33/gates.txt): 376 OK, protected 4/4, tsc 0, vitest 69/1230, build ok, Biome 2 CRLF (root) + 218 warnings.';
s.stages.splice(s.stages.findIndex((x) => x.stage === '4b'), 0, {
  stage: '4a-fix3',
  round: 34,
  status: 'dispatched',
  decision: 'D-29y',
  scope: 'FOCUS-TEXT-STALE + CLIP-GAIN-CLICK-DISCARD + A-R33-REVIEW-SCROLLBAR: the round-33 scroller capture handler also blurs a focused text-entry field (isTypingTarget: search, Clip Gain, detail start/end); no blur when the pointer is in the scroller scrollbar gutter (target === scroller and outside the client box); Clip Gain typed value commits through the existing onBlur to the clip it was typed for before the selection changes (D-29u contract); outside-scroller unchanged (accepted)',
  acceptance: ['R34-TS', 'R34-CG', 'R34-SB', 'R34-R33', 'R34-K', 'R34-S', 'R34-U', 'R34-Doc', 'G34-1', 'G34-2', 'G34-3'],
});
const st4b = s.stages.find((x) => x.stage === '4b');
st4b.round = 35;
st4b.scope += '; A-R33-REVIEW-TOUCH (a touch scroll on the timeline blurs a fader on pointerdown, so a pending keyboard preview commits early; Low)';
s.stages.find((x) => x.stage === '4c').round = 36;
s.decisions_round34 = {
  result_round33: 'C PASS on every round-33 ID; C-R32-01 and C-R31-02 closed; FOCUS-TEXT-STALE confirmed (search, rec-text-stale.txt REC-1); Clip Gain typed value lost on a click on another clip (REC-2)',
  fix: 'extend the round-33 focus release to text-entry fields (isTypingTarget); one predicate in StudioWorkspace; keydown handler and all predicates byte-identical',
  clip_gain: 'commit, not discard: D-29u says commit on blur; the keyed remount (ArrangementDetailPanel.tsx l.801) removes the focused input without a blur and isContentMountedRef blocks a late commit; the capture blur runs before the clip handler changes the selection, so the existing commitClipGain(blur) commits to the clip the value was typed for. ArrangementDetailPanel stays frozen',
  gutter: 'pointerdown with target === scroller outside its client box (x >= clientWidth or y >= clientHeight from the padding edge; scrollbar-gutter: stable) does not blur; inside the client box (empty area below lanes) still blurs. Rejected: target === scroller alone (C-R32-01 regression in the empty area)',
  outside_scroller: 'accepted: after a click on a library item, focus is on the item and Delete deletes the timeline selection (the library has no delete action; workspace keys act on the timeline selection unless focus is in a text field or on a native range) - C rec-outside.txt',
  touch: 'A-R33-REVIEW-TOUCH Low -> stage 4b (no data loss; no trusted touch input in C harness)',
  hazard: 'after search typing and a clip click, Backspace deletes the clip (undoable, one entry, gap): browser behaviour without preventDefault, SRW-24 consistent; Tech Lead R34-T',
  fb05_status: 'FB-05 -> verifying: every C ID passed (round 31) and C-R31-01/C-R31-02/C-R32-01 are closed; A-R32-REVIEW-1 is a review finding that C showed a real mouse pointerup clears (not a C-reproduced user failure), queued in 4b with double-click reset; remaining: Tech Lead R31-T/R33-T. Differs from the round-32 ruling because the remaining FB-05 item is not a C bug',
  fb04_status: 'FB-04 -> bug: CLIP-GAIN-CLICK-DISCARD (Medium) breaks its commit-on-blur contract (C REC-2)',
  renumber: '4b -> round 35, 4c + polish -> round 36',
};

const f = b.open_findings;
const byId = (id) => f.find((x) => x.id === id);
Object.assign(byId('C-R32-01'), { status: 'closed', closed: 'round 33: C R33-FT PASS (c-round-33/runs/ft-matrix.txt, ft-clipbody-ruler.txt, ft-zoom.txt, dk-retention-rerun.txt, ft-1280.txt); B gates b-round-33/gates.txt' });
Object.assign(byId('C-R31-02'), { status: 'closed', closed: 'round 33: with C-R32-01 - real-click matrix deletes and round-32 must-not rows 5/5 unchanged (c-round-33.md R33-FT)' });
Object.assign(byId('A-R32-REVIEW-1'), { to: 'SRW-13 stage 4b (round 35)' });
const a31 = byId('A-R31-REVIEW-2');
if (a31) a31.to = 'SRW-13 stage 4b (round 35)';
Object.assign(byId('FOCUS-TEXT-STALE'), {
  severity: 'medium',
  status: 'open',
  to: 'round 34 (D-29y)',
  title: 'after typing in the library search, a click on a timeline clip leaves focus in the search: Delete does nothing to the clip and Backspace silently edits the hidden search text (the filter changes); no status',
  evidence: 'c-round-33.md section 4.5; c-round-33/runs/rec-text-stale.txt REC-1; c-round-33.json bugs[0]',
  note: 'pre-existing, same root cause as C-R32-01 (timeline pointerdowns preventDefault); confirmed by C in round 33 (record only, not a round-33 failure)',
});
f.push({ id: 'CLIP-GAIN-CLICK-DISCARD', severity: 'medium', status: 'open', to: 'round 34 (D-29y)', title: 'a typed Clip Gain value without Enter is silently lost when the user clicks another clip: the keyed detail content remounts, the focused input is removed without a blur, and no Clip Gain entry is written (breaks the D-29u commit-on-blur contract)', evidence: 'c-round-33/runs/rec-text-stale.txt REC-2; c-round-33.md section 4.5; source ArrangementDetailPanel.tsx l.801 key, commitClipGain isContentMountedRef', note: 'B ID for C record REC-2; pre-existing since round 30' });
f.push({ id: 'A-R33-REVIEW-SCROLLBAR', severity: 'low', status: 'open', to: 'round 34 (D-29y)', title: 'a pointerdown on the scroller scrollbar (target === scroller) blurs a focused fader; with text fields included it would blur the search, and a later Backspace would delete the selected clip', evidence: 'a-round-33.md section 4 (code-reviewer Low); doc 036 round-33 residuals', note: 'not reproducible headless (0 px scrollbar); synthetic + Tech Lead R34-T' });
f.push({ id: 'A-R33-REVIEW-TOUCH', severity: 'low', status: 'open', to: 'SRW-13 stage 4b (round 35)', title: 'a touch scroll on the timeline blurs a focused fader at pointerdown, so a pending keyboard Volume/Master preview commits early (no data loss)', evidence: 'a-round-33.md section 4 (code-reviewer Low)' });
f.push({ id: 'OUTSIDE-SCROLLER-DELETE', severity: 'info', status: 'accepted', title: 'after a click on a library item (focus BUTTON), the detail header or the overview, Delete deletes the selected timeline clip', evidence: 'c-round-33/runs/rec-outside.txt', closed: 'round 34 B decision D-29y 4: accepted (library has no delete action; workspace keys act on the timeline selection unless focus is in a text field or on a native range)' });

const r33 = b.rounds.find((r) => r.round === 33);
Object.assign(r33, { task: 'tasks/round-33.md', status: 'c_pass', result: 'C PASS all IDs (G33-1..3, R33-FT, R33-KO, R33-G, R33-K, R33-S, R33-U a-f killed, R33-Doc); vitest 1230/1230; C-R32-01 + C-R31-02 closed; FOCUS-TEXT-STALE confirmed (record)' });
b.rounds.push({ round: 34, task: 'current-task.md', items: ['FOCUS-TEXT-STALE', 'CLIP-GAIN-CLICK-DISCARD', 'A-R33-REVIEW-SCROLLBAR'], status: 'dispatched', decision: 'D-29y', note: 'frozen: b-round-33-tree-sha256.txt (376 files, = round-32 list); snapshots b-round-33-snapshots/ (StudioWorkspace.tsx be01135c, fader-guards.test.tsx 9a973aef, doc 036 91c1547b); baseline 9 status lines (b-round-33-git-status.txt); expected end 9 lines (or 3 if root commits rounds 31-33 first)', c_ids: ['R34-TS', 'R34-CG', 'R34-SB', 'R34-R33', 'R34-K', 'R34-S', 'R34-U', 'R34-Doc', 'G34-1', 'G34-2', 'G34-3'], owned: ['app/components/arrangement/StudioWorkspace.tsx (capture handler predicate + optional gutter helper)', 'app/lib/arrangement/__tests__/fader-guards.test.tsx (append one describe)', 'docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md (append)'] });
b.vitest_floor_round34 = 1230;
b.baseline_tree_at_round34 = 'HEAD 1cefea1 + 9 uncommitted lines (rounds 31-33 C-verified, ready for root checkpoint); sha256 of 376 frozen files: b-round-33-tree-sha256.txt; 3 owned snapshots in b-round-33-snapshots/; B gates b-round-33/gates.txt: 376 OK, protected 4/4, tsc 0, vitest 69/1230, build ok, Biome 2 CRLF errors (root) + 218 warnings + 1 info';

const fb04 = b.items.find((i) => i.id === 'SRW-13');
fb04.status = 'in_progress_bug_open';
const lib = b.items.find((i) => i.id === 'SRW-12');
lib.round34_note = 'FOCUS-TEXT-STALE (Medium, C round 33): after search typing, a timeline click leaves focus in the search and Backspace edits the hidden filter -> round 34; feature-status shows SRW-12 as bug until C passes R34-TS';

b.tech_lead_manual_checks.push({ id: 'R34-T', what: 'real mouse in real Chrome: (1) type in the library search, click a clip, press Backspace -> the clip is deleted and the search text is unchanged; (2) type a Clip Gain value without Enter, click another clip -> the value is kept on the first clip (one Clip Gain entry); (3) with the search focused, drag the timeline scrollbar, then type -> the text still goes into the search', added: 'round 34 (D-29y)' });

fs.writeFileSync(p, `${JSON.stringify(b, null, 2)}\n`);
console.log('ok', b.version, b.open_findings.length, b.rounds.length, b.tech_lead_manual_checks.length);
