# Sketch review — PERF-11c-iii-c2a (round 378)

Reviewed sketch: `b-round-377/sketch.patch.txt` sha256 28d86d7b01d4061aa5c534b925affcdba42aa58a0db1b06e70fdfbe7ec3b9378 (= dispatched; no later edit, no delta review needed).
Reviewer: `tech-lead` (read-only; code-reviewer is not on B's consult list), after the mutants and the full-suite pre-check, 2026-11-07. Verdict: **APPROVE**.

## Checked without finding (reviewer, file:line on the scratch / HEAD)
1. The five callbacks are stable: `getArrangement` `[]` (ArrangementContext l.1901); `claimPointerGesture` (l.1954), `previewLoopArrangement` (l.2074), `commitLoopRange`/`stepLoopRange` (via `applyEdit` l.1448) all end at `[]` callbacks or `useState` stores. The actions `useMemo` returns one object per mount.
2. `arrangement.loop` identity: real changes go through `withLoop` (`lib/arrangement/loop.ts` l.22–35) or the delete-time remap (`model.ts` l.432, 438–452) and produce a new object; no in-place mutation (grep); unrelated edits and Undo keep the reference (RB-LEAF5 `toBe(loop)`).
3. Gesture behaviour: `loop` is drawing-only; event-time reads use `getArrangement()` or the gesture's captured `before`/`original`; `pxPerSecond`/`snapSeconds`/`gridSeconds` are memo-compared props; the drag preview reaches the brace through the workspace's `arrangement.loop` prop. Unmount cleanup unchanged.
4. RB-LEAF5 is non-vacuous (name keyed by `fiber.type.name` of the memo inner; wrapper 0 = site-revert guard; zoom and toggle are positive controls). Drag preview and arrow keys through the memo boundary are covered at workspace level (`grid-snap-loop-drop.test.tsx` moveBraceThenRelease / SL10, `pressBraceKey`, `marker-time-snap-ui.test.tsx` l.640).
5. Coupling: `index.ts` still exports the wrapper; standalone wrapper mounts (`gesture-reentry`, `gesture-guard`, `ArrangementContext.test.ts`) unchanged; five source-text tests read classes/strings that are unchanged; no name-keyed count of `ArrangementLoopBrace` in `app/**/__tests__` or `perf/**`.

## Findings and B rulings
| Id | Reviewer | Ruling |
|---|---|---|
| TL-R378-L1 | Low: a render-count row for one drag-preview move and one ArrowRight step would make the budget file self-contained | Info, not added: behaviour is covered by the existing workspace tests named in 4, and the browser recipe `probe/loop-recipe-378.mjs` (mid-drag, arrows) is a C row |
| TL-R378-L2 | Low: exact `toBe(1)` on zoom/toggle could break if a commit ever renders twice | Keep: house style of RB-LEAF1..4b; a double render would be a real regression to look at |
| TL-R378-L3 | Low: the commit needs an implementation doc | Granted: doc 244 (A writes it) |

No Medium or above. Mutant logs: `mutants/sketch-run/mutant-{MU-LB-NO-MEMO,MU-LB-ACTIONS-FRESH,MU-LB-SITE-REVERT}.full.log` (each red only on RB-LEAF5).
