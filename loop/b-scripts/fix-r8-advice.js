const fs = require('fs');
const edit = (file, pairs) => {
  let t = fs.readFileSync(file, 'utf8');
  for (const [a, b] of pairs) { if (!t.includes(a)) throw new Error(file + ' nf: ' + a.slice(0, 70)); t = t.replace(a, b); }
  fs.writeFileSync(file, t);
};
edit('current-task.md', [
  ['  - a **detail playhead** line, shown only while the live position is inside the clip. It is driven by the position store through the round-7 writer pattern (`useArrangementPositionWriter` or the same direct-DOM approach). It causes **0 React renders** per frame.',
   '  - a **detail playhead** line, shown only while the live position is inside the clip. It is driven by the position store through the round-7 writer pattern (`useArrangementPositionWriter` or the same direct-DOM approach). It causes **0 React renders** per frame and **reads no layout per frame**: set `left` as a percentage of the clip span, or use a width cached by a ResizeObserver. Never call `clientWidth`, `getBoundingClientRect` or `offsetWidth` inside the writer.'],
  ['  From C\'s measurements this means: **1440×900 → open; 1280×720 → collapsed.**',
   '  From C\'s measurements this means: **1440×900 → open; 1280×720 → collapsed.**\n  - The scroller is measurable only after the first paint. Render collapsed first, decide once in a layout effect, and apply that first change **without a transition**, so no 300 ms opening animation plays on load and screenshots never catch a mid-transition state.'],
  ['    - inputs disabled for multi-selection and for no selection.',
   '    - inputs disabled for multi-selection and for no selection;\n    - Space on the focused panel toggle toggles the panel and does **not** start or stop playback. Today the global keydown handler exempts only typing targets, so a fix may be needed in `StudioWorkspace.tsx`;\n    - the D-29a mount decision applies without a transition.'],
  ['     - attribution: an app-attributed LoAF ≥ 10 ms whose script `sourceURL` is `ArrangementDetailPanel.tsx` or `panels.ts`, or forced layout > 1 ms from it, **fails this round**;\n     - any other drift failure is recorded as new evidence under the open C-R6-02 and does not fail stage 1;',
   '     - **attribution.** Position-store writers run inside the `ArrangementContext.tsx` rAF `tick`, so LoAF `sourceURL` cannot single out the panel. These rules apply instead, and a breach of any one **fails this round**:\n       - any steady-playback app script with `forcedStyleAndLayoutDuration` > 1 ms, whatever its file. Round 7 proved 0, and the panel is the only new per-frame code;\n       - A\'s report gives the per-subscriber p50/p95/max of the new detail-playhead writer, measured with a temporary harness wrapper that is removed before finishing (the round-7 method, `a-round-7.md` §4.2). It must stay within the round-7 writer envelope: p50 ≤ 0.1 ms, p95 ≤ 0.2 ms, max ≤ 1 ms excluding preempted frames;\n       - `tick` + microtasks p50/p95 must not regress beyond A\'s round-7 "after" numbers (0.7–0.8 / 1.1–1.5 ms) by more than 0.2 ms. A reports the two side by side, and C re-checks with the same wrapper if A\'s numbers are missing;\n     - any other D-24 drift failure is recorded as new evidence under the open C-R6-02 and does not fail stage 1;'],
  ['8. Your own browser checks (synthetic pointers, real `$B press`), plus any R3-V1 light runs you made within the budget.',
   '8. Your own browser checks (synthetic pointers, real `$B press`), plus your R3-V1 light runs within the budget, with the detail-writer and `tick` timing table from §8.'],
]);
edit('feature-status.md', [
  ['| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **მოწმდება** |', '| FB-01 | დინამიკური ხანგრძლივობა + ნავიგაცია | **ბაგია** (Low; C-ის ყველა ID PASS-ია, ღიაა C-R7-02) |'],
  ['| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **მოწმდება** (C-ის ყველა ID PASS-ია; ღიაა C-R7-02 Low და ხელით შემოწმება) |', '| SRW-10 | ნავიგაცია: zoom/pan/overview/Follow/Fit | **ბაგია** (Low; C-ის ყველა ID PASS-ია, ღიაა C-R7-02 და ხელით შემოწმება) |'],
  ['| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **მუშავდება** (ეტაპი 1) |', '| SRW-11B | Detail panel, ტრეკის fold/სიმაღლე + auto-fit, მცურავი ვიდეო | **მუშავდება** (ეტაპი 1; ეტაპები 1–2 მხოლოდ SRW-11A-ზეა დამოკიდებული, SRW-03-ზე მხოლოდ ეტაპი 3) |'],
]);
const b = JSON.parse(fs.readFileSync('backlog.json', 'utf8'));
const s11b = b.items.find((i) => i.id === 'SRW-11B');
s11b.depends_on_note = 'SRW-03 applies to stage 3 only (floating video: same <video> nodes, sync loop unchanged, |d| <= 0.1). Stages 1-2 depend on SRW-11A only, so stage 1 may start while SRW-03 is regression_open.';
const s08 = b.items.find((i) => i.id === 'SRW-08');
delete s08.evidence_round7.resolved;
s08.evidence_round7.related_pass = 'D-30 slider gesture (C-R6-01 tracked in open_findings)';
b.planned_rounds.find((r) => r.round === 9).caution = 'orientation only: two sync bugs plus a ruler Low share a thin "closely related" link; next B re-decides the cut from round-8 evidence';
fs.writeFileSync('backlog.json', JSON.stringify(b, null, 2) + '\n');
edit('C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md', [
  ['- თუ მომხმარებელი 1280×720-ზე panel-ს გახსნის, timeline ვერტიკალურად scroll-დება. Auto-fit ეტაპი 2-ია.',
   '- თუ მომხმარებელი 1280×720-ზე panel-ს გახსნის, timeline ვერტიკალურად scroll-დება. Auto-fit ეტაპი 2-ია.\n- პირველი render დაკეცილია. გადაწყვეტილება layout effect-ში ერთხელ მიიღება და transition-ის გარეშე გამოიყენება.\n- SRW-03-ზე დამოკიდებულება მხოლოდ ეტაპ 3-ს (მცურავი ვიდეო) ეხება. ეტაპები 1–2 მხოლოდ SRW-11A-ზეა დამოკიდებული, ამიტომ ეტაპი 1 SRW-03-ის ღია რეგრესიის დროსაც იწყება.'],
]);
console.log('applied');
