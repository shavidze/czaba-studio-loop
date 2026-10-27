# A round 209 — PERF-FADER-a (SABA-B-5 part 1)

## STOP — needs B ruling on an L23 hit in a frozen test: `app/lib/arrangement/__tests__/gesture-guard.test.tsx` l.447 (row "restores the stored Volume without an entry when the slider blurs mid-drag (D-30 abort)")

`gesture-guard.test.tsx` is not one of the 19 grants. Between pointerdown and blur it reads the **model** during a pointer gesture, which D-29z179 §1.2 now forbids:

```
fireEvent.pointerDown(volume, { ...press, pointerId: 4 });
fireEvent.change(volume, { target: { value: '-10.5' } });
expect(trackVolume(api, 'sfx')).toBe(trackVolumeFromDb(-10.5));   // l.447 — FAILS: received 1 (stored value)
fireEvent.blur(volume);
expect(trackVolume(api, 'sfx')).toBe(1);
```

- Measurement: the only failure in `npx vitest run app/lib/arrangement/__tests__ app/components` is this row: **2183 passed / 1 failed (151 files)**. `app/hooks` and the store focus and theme scans: 65/65 passed.
- It cannot go green without editing a frozen file (L12) or moving the model during a pointer gesture (the opposite of §1.2). So I did **not** edit it and did not change the source to satisfy it.
- **Proposed re-expression** (same ruling as the 9 granted hits, one hunk, title and intent kept): replace l.447 with
  `expect(volume.value).toBe('-10.5'); expect(volume.getAttribute('aria-valuetext')).toBe('−10.5 dB'); expect(trackVolume(api, 'sfx')).toBe(1);`
  The rest of the row (blur restores 1, `volume.value` `'0'`, no entry, gesture released, pointerup adds no entry) stays unchanged and already passes.
- B's starting scan listed 9 files. This is the 10th file with a mid-gesture model read. I searched further: no other test outside `app/lib/arrangement/__tests__` and `app/components` drives a fader gesture (`grep beginTrackVolumeGesture|beginGroupVolumeGesture|beginMasterGainGesture|beginTrackPanGesture|pointerDown` turns up only store focus tests, which do not touch the Studio).

Per L11 the tree is left at its last consistent state. Not done because of the STOP: the 48 `budgets.json` flips, doc 163 (D-29z181 lines), doc 165, the red-proof on the start copy, and the code-reviewer. These are the finishing items for the re-dispatch.

## Changed files (tree state now)
Modified (all granted): `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`; tests `fader-click`, `group-volume-db`, `master-ui`, `track-group-mix-ui`, `track-volume-db` (`.test.tsx`).
New (all in the new-files list): `app/lib/arrangement/mix-draft-store.ts`, `app/components/arrangement/ArrangementMixFader.tsx`, `app/lib/arrangement/__tests__/mix-draft-store.test.ts`, `app/lib/arrangement/__tests__/fader-pointer-preview.test.tsx`. Doc 165 not created yet.
Not touched: `StudioWorkspace.tsx`, `useRelativeFaderDrag.ts`, every clip-gain file, styles, auth, `perf/`, docs.

## Implementation (D-29z179)
- **Context.** `mixOverrideRef` (one entry: track/group volume or master gainDb). `withMixOverride(arrangement, override)` is a pure exported helper. It applies to `trackGains`/`masterGain` in `startGraph` and in the `syncPlayback` setter branch, so the stored arrangement in `loopScheduleRef` stays pristine. `writeLiveMixGains('tracks'|'master')` writes `setTrackGain` for every track from `trackEffectiveGains(withMixOverride(present))`, or `setMasterGain`. `takeMixOverride()` clears both the override and the draft.
  - `previewVolumeTarget`: when `volumeGestureRef.current?.targetKey === key`, it takes the pointer path: it normalises via `setTrackMix`/`setTrackGroupMix`, then writes the override, the draft and the live gains. There is no `updateHistory`, `syncPlayback` or `setStatus`, and no early return on equality with the stored value. Otherwise it takes the old pending path unchanged.
  - `previewMasterGain` works the same way, keyed on `masterGestureRef.current !== null`.
  - Commit: `takeMixOverride()` runs first, then one `applyEdit(withMixOverride(present, override), 'Volume' | 'Master Volume')`. If the value equals the stored one, `commitHistory` writes no entry. The second commit call (from the input's `onPointerUp`) finds no override and does nothing.
  - Cancel: `revertVolumeTargetPreview` and `revertMasterGainPreview` clear the override and the draft, then rewrite the stored gains for every track, or for master. Pointercancel, blur and stolen claims all reach these paths.
  - Pan: `previewTrackPan` writes the draft. `finishTrackPanGesture` and the claim-steal callback clear it.
  - Unmount: clears the pan draft, the override and its draft.
  - The store is exposed through `ArrangementMixDraftContext` and `useArrangementMixDraftStore()`. `ArrangementContextValue` is unchanged.
- **Leaf** `ArrangementMixFader` (forwardRef): `useSyncExternalStore` on one key. It owns the input `value`, `aria-valuetext`, `title`, the fill style (`studioLevelFaderFillStyle`) and `renderReadout(value)`. It adds no new class token, `cursor-*`, `focus*`, `ring-` or `outline`.
- **Lane:** the Volume readout span and the Pan reset button (which is the Pan readout) render through `renderReadout`. The `panDraft` state is removed. The window-blur cleanup now clears the pan draft in the store, which keeps the old behaviour.
- **Observable delta for B (knowing simplification):** before, a native Pan `change` that arrived after a stolen claim, while the lane's drag cleanup was still armed, showed a display-only `setPanDraft` with no audio. Now `previewTrackPan` refuses it (no gesture), so no draft shows. No test covers this, and I could not reach the state from the UI.

## L23 table (granted tests; old → new)
| File / row | Old (mid-gesture) | New |
|---|---|---|
| fader-click F3 l.389 | model `toBe(trackVolumeFromDb(-19.4))` | `volume.value '-19.4'`, `aria-valuetext '−19.4 dB'`, model `0.6` |
| fader-click F8 l.458 | same | same three checks on `controls.musicVolume()` |
| fader-click F9 l.469 | same | same three checks |
| master-ui "a Master fader pointer drag…" l.380, l.383 | `master.gainDb toBe(-4)` (twice, the second after a blocked undo) | draft store `get('master') -4`, model `0` (both); after pointerup: draft `undefined`, model `-4` (added) |
| master-ui "reverts a Master drag on pointercancel…" l.457 | `master.gainDb toBe(-9)` | draft `-9`, model `0`; after cancel: draft `undefined` |
| group-volume-db GV4 l.364 | `storedGroupVolume toBe(F(-8.9))` | fader `'-8.9'`, `'−8.9 dB'`, model `0.72` |
| group-volume-db GV6 l.397/399/402 | `storedGroupVolume toBe(F(-6))` ×2, `F(-6.6)` | fader `'-6'`/`'−6.0 dB'`, model `undefined`; `'-6'` after the Shift press; `'-6.6'`/`'−6.6 dB'`, model `undefined`; after pointerup model `F(-6.6)` (added) |
| track-volume-db TV4 l.426 | `storedVolume toBe(F(-19.4))` | fader `'-19.4'`, `'−19.4 dB'`, model `0.6` |
| track-group-mix-ui UM3 l.502 | `groupMix volume toBe(F(-20))` | fader `'-20'`, `'−20.0 dB'`, model `F(-8)`; after cancel fader `'-8'` (added) |

The master-ui rows are hook-level (`renderHook`), so the "display" check reads the draft store. For that, the two `renderHook` callbacks return `{ ...useArrangement(), mixDraftStore: useArrangementMixDraftStore() }`, with an import added. The live-gain third check does not apply to these non-playing rows. The playing rows FP1, FP3, FP4 and FP6 cover it.

**B's listed lines, kept unchanged** because each read happens after pointerup or on the pending (keyboard/hook) path, and each still passes: fader-guards l.549, 867, 1458, 1652–1667; fader-click l.400–402 (F5 pan, already asserted the unchanged model), 495–497, 524; pending-status l.542–577; context-hygiene l.446–450; fader-touch `faderValue` (asserts no change under touch); track-group-mix-ui l.312–333 (helpers), 551, 613–633 (mute/solo, not drags); group-volume-db l.231–254 (helpers), 398–401, 418–452; track-volume-db l.190, 203–206 (helpers), 521, 534–536. `meter-ui`, `fader-focus-order` and `track-pan` needed no edit. The frozen neighbours `clip-gain`, `clip-gain-waveform` and `clip-gain-multi` (MG13) are green and unedited.

## Tests actually run
- `npm run typecheck`: clean.
- Biome `check` on the 13 owned paths: 0 errors, 0 warnings (Master import order and the new test formatting fixed with `--write` on owned files only; one redundant Fragment removed in the lane).
- `npx vitest run`: 12 granted + 3 clip-gain neighbours, all green after the edits. `fader-pointer-preview.test.tsx` 12/12 (FP1–FP12). `mix-draft-store.test.ts` 5/5 (MD1–MD5).
- Wider covering run: `app/lib/arrangement/__tests__` + `app/components`: 2183/2184. The 1 failure is the STOP row. `app/hooks` + `store-focus-ring` + `store-theme-tokens`: 65/65.
- Not yet run: the red proof on the start copy and the named mutants, and the code-reviewer.

## Perf measurement (record mode; budgets not flipped)
Running: `a-round-209/run-perf.sh` (two sequential `npm run test:perf` runs, nothing else building). Output goes to `a-round-209/run{1,2}.{log,json}`. Results are added below when the runs finish.

### Results (`npm run test:perf` ×2, sequential, nothing else building)
- run1: exit 0, `1 passed (6.9m)`, durationMs 398 908, `complete: true`, 266 rows, 0 failures, **0 assert failures**. run2: exit 0, `1 passed (6.7m)`, durationMs 393 454, the same. JSONs and logs are in `a-round-209/run{1,2}.{json,log}`.
- All 141 deterministic medians are identical between run1 and run2.
- `harness.move-window-live` (assert ≥ 1) = **1**, still live: every move still commits the leaf.
- **Before (C round 208, `c-round-208/out/perf-run1.json`) → after (run1 / run2)**, medians:

| fader | move-components-max (stopped / playing) | move-components-per-move (stopped / playing) | release-commits | restarts (playing) | move-to-paint-p95.1x ms (stopped / playing) |
|---|---|---|---|---|---|
| track | 83 / 83 → **1 / 1** | 62.25 / 62.25 → **0.75 / 0.75** | 1 | 0 | 4.1 / 5.5 → 2.4 / 3.7 (run2 2.4 / 4.4) |
| group | 85 / 85 → **1 / 1** | 63.75 / 63.75 → **0.75 / 0.75** | 1 | 0 | 3.2 / 5.3 → 2.4 / 4.3 (2.5 / 4.2) |
| master | 80 / 80 → **1 / 1** | 63.333 / 59.333 → **0.792 / 0.742** | 1 | 0 | 2.9 / 5.1 → 2.2 / 4.0 (2.2 / 4.0) |
| pan | 4 / 4 → **1 / 1** | 3.5 / 2.6 → **0.875 / 0.65** | 1 | 0 | 1.4 / 3.4 → 1.8 / 3.9 (1.9 / 3.8) |

- The 6× rows match 1× for every `move-components-*` and `release-commits` value.
- Pointerdown (D-29z180): `downCommits` 0 and `downComponentsMax` 0 for all 8 drags.
- `windowCommits` per drag: 78–105 of 120 moves (track/group 90, master 89–95, pan 78–105). Moves that do not change the stepped value commit nothing (the store `set` is a no-op on an equal value). The harness drag starts at max and clamps there (I-208-b), and Pan's coarse 1-step grid repeats values. C's WINDOW-209 "≥ 100 window commits" criterion is for C's own probe, with one run starting below max. B may want to reconcile that threshold with the clamp.
- move-to-paint is a record row. All are under the 16 ms target. Pan rose by about 0.4 ms (stopped 1.4 → 1.8–1.9, playing 3.4 → 3.8–3.9). This is within run-to-run noise for these small values, but I report it as measured.
- **So once the 48 rows are flipped, they would pass with headroom** (max 1 ≤ 3, per-move ≤ 0.875 ≤ 3, release 1 ≥ 1). The flip itself is held back by the STOP.

## code-reviewer (actually run; read-only subagent, score 8.5/10)
Critical: none. It traced commit, cancel, stolen claim, blur and unmount for track, group, master and pan. It found no double commit (begin flushes pending first, and the second commit call is a no-op) and no no-op entry (`isSameArrangement`). Group cancel restores every member. The capture-phase window listeners commit before the lane cleanup.

Findings. Not yet addressed, because of the STOP (L11: change nothing else). They are queued for the re-dispatch:
- **Medium:** FP10 covers only the pan commit. Add pan cancel rows: pointercancel → `cancelTrackPan`, fader blur → `handlePanBlur`, and stolen claim. Each must restore the live `setTrackPan` value and clear the draft.
- **Medium:** no test checks the group pending path (keyboard/double-click with no gesture still calls `syncPlayback` per step). Extend FP9 with the group fader.
- **Low:** the draft is cleared before `applyEdit` (`takeMixOverride` then `applyEdit`). This matches the task text (§1.4: "clear … then call `applyEdit`"), and React 18 batching of the native pointerup makes it one commit. The reviewer suggests clearing after `applyEdit` for robustness. **B to rule:** the task order wins unless changed.
- **Low:** `takeMixOverride` takes the override whatever its kind. Cross-kind leakage is prevented only by the one-claim invariant. Suggestion: `takeMixOverride(kind)`.
- **Low:** the lane clears the pan draft in the context-owned store on window blur. This keeps the old `setPanDraft(null)` behaviour, so the pan draft has two owners.
- **Low:** the pan reset button is `disabled={storedPan === 0}` while its text shows the draft. This is unchanged from baseline (`displayPan` text and `storedPan` disabled).
- **Low:** `withMixOverride` is exported but only used inside the module. FP3 computes the expected gains with `setTrackGroupMix` instead.
- **Low (tests):** leaf render count `>= 4` sums over instances. FP11 tracks only `pointer*` window listeners, not `blur`. The master-ui re-expressions assert through the store rather than the DOM (they are hook-level rows). The devtools-hook probe depends on React internals (the same pattern as master-ui).
- **Low (perf):** `writeLiveMixGains('tracks')` writes every track's gain per move. This is the task's literal design ("`setTrackGain` for every track").

**Architecture note (verbatim intent, proposal for B/root only; no in-round refactor):** Signal 4 (new state and lifecycle in an existing owner): `mixOverrideRef`, `mixDraftStore`, `writeLiveMixGains`/`takeMixOverride` and the unmount additions in `ArrangementContext.tsx`. Signal 2 (split ownership): the pan draft is cleared by both the lane and the context. **Verdict: keep.** The override shares the `claimPointerGesture` lifecycle with the existing gesture refs. Extraction would have to carry the gesture refs, override, store and audio handle together; the cost is medium and the gain small. Proposal: a separate task could move gesture → override → commit/revert into a pure reducer in `lib/arrangement/`, with a single owner for clearing the pan draft. Acceptance would be FP1–FP12, MD1–MD5 and the volume suites unchanged, with the same `useArrangement()` shape. (Consistent with D-29z182, the default keep.)

## B acceptance status (only what truly passed)
- Passed by A's own runs: pointer path with no history per move (FP1/FP6/FP10 green; harness move-components-max 1 for all 8 drags); one entry on release with the exact value (FP2/FP6/FP12); group/stolen/blur/unmount cancel (FP3/FP4/FP5/FP11); restart and loop wrap with the dragged value (FP7/FP8); pointerdown allowance (0 commits); perf ×2 exit 0 with every existing assert passing.
- **Not passed / not done:** the full set of granted + covering tests is not green (1 frozen failure = STOP); 48 budgets flips; doc 163 D-29z181; doc 165; red-on-start-copy and mutant proofs; the 2 Medium review test gaps. **realVerified=false. No C row is claimed.**

## Exact next steps
1. **B:** grant `gesture-guard.test.tsx` (the l.447 hunk only, with the re-expression above), or rule otherwise. Also rule on the WINDOW-209 "≥ 100 window commits" threshold against the harness clamp (78–105 measured), and on the draft-clear order (Low above).
2. **A on re-dispatch:** apply the l.447 hunk; add the pan cancel rows and the group pending row (review Mediums); flip the 48 rows in `perf/budgets.json` and update the `harness.move-window-live` note; run `test:perf` ×2 again with the asserts; write the D-29z181 lines in doc 163 and doc 165 (status conditional, L28); run the red proof on the start copy with named mutants for FP9, FP11 and FP12; re-run the code-reviewer on the delta.
3. **C (after re-dispatch):** SCOPE-209 (diff vs grants; the gesture-guard hunk must be the only gesture-guard change), then PERF-RUN/WINDOW/LIVE-DISPLAY/AUDIO/GROUP/INVARIANTS/EXPORT/VISUAL/DOC/AN-REVIEW/G209-3 as in the task.

## Scope check (end)
`git status`: 9 modified files (4 sources + 5 granted tests) and 4 untracked files (all on the new-files list). `sha256sum -c --quiet b-round-208-r209-tree-sha256.txt` printed no mismatch lines, so the 1,031 frozen files are unchanged. (The `echo $?` in that command caught `head`'s exit code, so I am not citing an exit code as evidence.) No browser was used this round, so no `a-browse.json`. Scratch: one temporary formatter-probe test was created and removed inside `__tests__` to compute the dB strings; it is not in the tree.

## Hunk list for SCOPE-209 (`git diff -U0`, granted tests)
- `fader-click.test.tsx`: exactly 3 hunks (l.389 F3, l.456 F8, l.469 F9). The Biome format pass added nothing else.
- `master-ui.test.tsx`, 8 hunks:
  - l.10: import `useArrangementMixDraftStore`;
  - l.16: import `MASTER_GAIN_DRAFT_KEY`;
  - l.368–370: the first `renderHook` callback rewritten to `{ ...useArrangement(), mixDraftStore: useArrangementMixDraftStore() }`, Biome-reformatted;
  - l.380, 383, 384: the drag row asserts;
  - l.449–451: the second `renderHook` callback rewrite;
  - l.457, 458: the pointercancel row asserts.
- `group-volume-db` (GV4, GV6), `track-volume-db` (TV4) and `track-group-mix-ui` (UM3): only the blocks in the L23 table.

## Lint note
Per the orchestrator, I ran Biome scoped to the 13 owned paths. The repo-wide `npm run lint` is left to the root gate.

## Red-proof caveat for the re-dispatch
`fader-pointer-preview.test.tsx` imports `useArrangementMixDraftStore` and the `ArrangementMixDraftStore` type, and `PreviewProbe` calls the hook. On a raw start copy every FP row would go red for an import reason, which is not a valid L23 proof. The start-copy run must therefore include `mix-draft-store.ts` and a minimal hook export (or the probe must guard the hook). Then only the model-reading rows (FP1–FP8, FP10) go red on their assertions, and FP9, FP11 and FP12 each get a named mutant.
