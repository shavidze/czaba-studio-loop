# A round 210 — PERF-FADER-a re-dispatch (SABA-B-5 part 1)

**Status: implementation and self-checks complete, ready for C.** No STOP. realVerified=false: A did not use a browser, so no C row is claimed and there is no `a-browse.json`.

Baseline `f535ab3`. I resumed from round 209's working tree; nothing was reverted or re-implemented.

## Changed files (tree state at handover)
- **Modified, all granted (12):**
  - Sources, round 209, untouched this round: `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`.
  - Tests, round 209, untouched this round: `fader-click`, `group-volume-db`, `master-ui`, `track-group-mix-ui`, `track-volume-db`.
  - **This round:** `app/lib/arrangement/__tests__/gesture-guard.test.tsx`, `perf/budgets.json`, `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`.
- **New, all on the new-files list (5):** `app/lib/arrangement/mix-draft-store.ts`, `app/components/arrangement/ArrangementMixFader.tsx`, `app/lib/arrangement/__tests__/mix-draft-store.test.ts`, `app/lib/arrangement/__tests__/fader-pointer-preview.test.tsx` (edited this round), and `docs/implementation/2026/quarter-IV/165-fader-pointer-preview.md` (created this round).
- **Source code changes this round: none.** All app-source edits happened in round 209. Mutants were applied temporarily and restored; the hash was checked: `ArrangementContext.tsx` sha256 is `f47be90b…79ac` before and after.
- **Scope:** `sha256sum -c --quiet b-round-209-r210-tree-sha256.txt` printed nothing and returned **exit=0** (the last command, nothing piped after it). `git status`: 12 M, 5 ??, and nothing else.

## Hunks added this round in granted tests (SCOPE-210)
`gesture-guard.test.tsx` has exactly one hunk compared with `b-round-209/r210-granted-start/` (`diff -u`, @@ -444,7 +444,9 @@). This is D-29z183, B's line written as three statements:
- old: `expect(trackVolume(api, 'sfx')).toBe(trackVolumeFromDb(-10.5));`
- new: `expect(volume.value).toBe('-10.5');` / `expect(volume.getAttribute('aria-valuetext')).toBe('−10.5 dB');` / `expect(trackVolume(api, 'sfx')).toBe(1);`

No other granted test was edited this round. Round 209's L23 hunks are unchanged; see `a-round-209.md`.

## Changes in `fader-pointer-preview.test.tsx` this round (new file, so these are not L23 hunks)
- **FP9 extended (review Medium 2).** With playback on, two group keyboard `change` steps run on the pending path. Each step checks:
  - the model's group volume equals `trackVolumeFromDb(step)`;
  - the undo label stays `Master Volume` until keyup;
  - there is no group draft;
  - the slider value is correct;
  - `setTrackGain` is called once per track, and the stems and sfx gains equal `trackEffectiveGains(model)`.

  After both steps: no new graph (applySchedule count unchanged); keyup gives `Volume`; double-click reset puts the model at unity (`volume` undefined) and the slider at `0`; undo depth is `Volume, Volume, Master Volume`.
- **FP13 (D-29z186).** Setup: the stored pan is seeded at 10 steps; playback on; `pointerDown` on the Pan slider (pointerId 40); `pointerDown` on the `cm` clip header with the **same pointerId** (it steals the claim); then `fireEvent.change` on Pan to `16`. Checks:
  - no pan draft;
  - no `setTrackPan('music')` write after the steal's own restore;
  - the slider stays `10` and the readout shows the stored pan;
  - the model is unchanged and no undo entry beyond the seed.

  Title tightened ("adds no live pan write after the restore by the steal").
- **FP14a/b/c (review Medium 1, D-29z187).** One row each for pointercancel, fader blur mid-drag and a stolen claim (`claimPointerGesture`, same pointerId). The stored pan is seeded at 10 steps (**review M1:** the restore is told apart from "write 0") and dragged to 16. Each row checks:
  - the live `setTrackPan` returns to the stored 0.2;
  - the draft is cleared;
  - the slider, `aria-valuetext` and readout show the stored pan;
  - the model is unchanged and no entry is added.

  The trigger list is a typed constant (`PAN_CANCEL_TRIGGERS`), with no `as const`.
- **FP4, FP5 and FP7 gained** `expect(live(api).getArrangement()).toBe(stored)` right after the mid-gesture move (D-29z179 §2: the model is unchanged until pointerup). On the first start-copy run these three rows were **green**, because their checks ran only after the cancel or restart. The new check is what turns them red on the start copy. Their core assertions also have named mutants (below).
- Helper renames: `trackGainCalls` → `trackParamCalls`, because it is also used for `setTrackPan` (review L6). New helper `clipHeaderOf`, which uses the same `[data-clip-id]` + `firstElementChild` pattern as `gesture-guard.test.tsx:117` (review L6 notes this is not a role-based selector). `panReset` now finds the button by its exact name `Reset Pan to centre — მუსიკა`; the old regex also matched the `Undo: Pan — მუსიკა` button once a pan entry existed.

## Red-proof (D-29z187)
**Start copy.** Recipe: `git archive f535ab3` into a scratch folder, symlink `node_modules`, then add the current `mix-draft-store.ts`, the current `fader-pointer-preview.test.tsx`, and a minimal `useArrangementMixDraftStore()` export that returns a module-level store. Result in `a-round-210/startcopy-redproof.log`:
- **14 red, every one on an AssertionError, with no import or transform errors:** FP1–FP8, FP10, FP11, FP13, FP14a, FP14b, FP14c.
- **FP9 and FP12 green**, as designed (they are unchanged-behaviour rows and are proved by mutants).
- The scratch tree (about 1,000 store files) was **deleted after the run**. It was my own scratch, and the loop folder is a git checkout that does not ignore it. The recipe above reproduces it.

**Named mutants** (`a-round-210/mutants.py`; log in `a-round-210/mutants.log`). Each mutates `ArrangementContext.tsx` temporarily, runs the matching rows, and restores the file (hash checked):

| Mutant | Mutated line | Rows red | Failing assertion |
|---|---|---|---|
| M4 | `revertVolumeTargetPreview`: `if (takeMixOverride()) { writeLiveMixGains('tracks'); }` → `takeMixOverride();` | FP3, FP4 | stems gain `0.0879 / 0.0441` expected `0.35` (stored) |
| M5 | `revertVolumeTargetPreview`: `if (takeMixOverride())` → `if ((mixOverrideRef.current = null))` (draft not cleared) | FP5 | slider `'-16.4'` expected `'-4.4'` |
| M7 | `startGraph`: `const mixed = withMixOverride(arrangement, mixOverrideRef.current)` → `arrangement` | FP7, FP8 | graph music gain `0.6` expected `0.1514` (dragged) |
| M9 | `previewVolumeTarget`: pointer-path condition `\|\| target.kind === 'group'` | FP9 | group volume `0.7` expected `0.5012` |
| M11 | unmount: the `mixDraftStore.clear(mixOverrideDraftKey(mixOverride))` block removed | FP11 | draft `0.1514` expected `undefined` |
| M12 | pointer override `volume: previewed` → `Math.fround(previewed)` (float32 read-back) | FP12 | 599 track mismatches |
| M13 | `previewTrackPan` guard (l.2799) `panGestureRef.current?.trackId !== trackId \|\|` removed | FP13 | pan draft `0.32` expected `undefined` (the change reaches `previewTrackPan`; no upstream short-circuit) |
| M14ab | `cancelTrackPan`: `restoreStoredTrackPan` not called | FP14a, FP14b (FP14c green) | live pan `0.32` expected `0.2` |
| M14c | stolen-claim abort in `beginTrackPanGesture`: `restoreStoredTrackPan` removed | FP14c (a/b green) | live pan `0.32` expected `0.2` |
| M14w | `restoreStoredTrackPan` writes `0` instead of the stored pan (review M1) | FP14a, b, c (FP13 green, as designed: it checks for no new write, not the restore value) | live pan `0` expected `0.2` |

## Perf (`npm run test:perf` ×2, sequential, nothing else running; `a-round-210/run{1,2}.{json,log}`)
- run1: exit 0, `1 passed (6.5m)`, durationMs 376 302. run2: exit 0, `1 passed (6.4m)`, 372 028.
- Both runs: `complete: true`, 266 rows, **66 assert rows, 0 assert failures, `failures: []`**. **All 48 flipped rows pass in both runs.**
- `harness.move-window-live` = 1, so it is still live.
- Pointerdown commits: `downCommits 0` and `downComponentsMax 0` in every drag (D-29z180).
- Deterministic values are the same at 1× and 6× and between the two runs.
- Window commits per drag (out of 120 moves): track and group 90; master 95 stopped, 89 playing; pan 105 stopped, 78 playing. Per D-29z184, moves that do not change the value commit nothing.

| fader | move-components-max (stopped / playing) | move-components-per-move (stopped / playing) | release-commits | playing restarts | move-to-paint-p95.1x ms (stopped / playing) |
|---|---|---|---|---|---|
| track | 83 / 83 → **1 / 1** | 62.25 / 62.25 → **0.75 / 0.75** | 1 → 1 | 0 → 0 | 4.1 / 5.5 → 2.0–2.1 / 3.6–3.7 |
| group | 85 / 85 → **1 / 1** | 63.75 / 63.75 → **0.75 / 0.75** | 1 → 1 | 0 → 0 | 3.2 / 5.3 → 1.9–2.0 / 3.5–3.7 |
| master | 80 / 80 → **1 / 1** | 63.333 / 59.333 → **0.792 / 0.742** | 1 → 1 | 0 → 0 | 2.9 / 5.1 → 1.7–1.8 / 3.3–3.6 |
| pan | 4 / 4 → **1 / 1** | 3.5 / 2.6 → **0.875 / 0.65** | 2 → 1 | 0 → 0 | 1.4 / 3.4 → 1.7 / 3.2–3.3 |

"Before" is C round 208 (`c-round-208/out/perf-run1.json`); I re-read the file to confirm. Release-commits was 1 in every sample of every drag (3 + 3 per row); no sample was 0. All move-to-paint values are under the 16 ms target.

**After perf, only test, doc and note text changed:** FP13/FP14 seeding, the Biome reflow, the `groups?` typing, and the `release-commits` note wording (a precondition, review L3). Budget ops, values and modes are unchanged, so perf was not re-run.

## Self-checks actually run (final tree)
- `npm run typecheck`: exit 0. It first failed on `model.groups` possibly undefined in my FP9 extension; fixed with `groups?.`. `controls.group()` is resolved in the same row, so a missing group would still throw.
- Biome `check` on the 14 owned app paths: exit 0, 0 errors and 0 warnings. `--write` was used only on `fader-pointer-preview.test.tsx`, a reflow of 2 long lines. `budgets.json` and the docs are outside `biome.json`'s `app/**` scope.
- Targeted `npx vitest run`: the 2 new files, the 13 granted test files and the 3 clip-gain neighbours give **18 files, 318/318** (`a-round-210/targeted-vitest.log`). `fader-pointer-preview` 16/16, `mix-draft-store` 5/5, `gesture-guard` 19/19.
- Covering run `app/lib/arrangement/__tests__ app/components`: **151 files, 2188/2188** (`a-round-210/covering-vitest.log`). That is round 209's 2184 plus the 4 new rows FP13 and FP14a/b/c.
- Not run (root gate): the full suite, the repo-wide `npm run lint`, build outside the perf `webServer`, `npm run verify`, and e2e smoke.

## Docs
- **Doc 163 (D-29z181):** hunks only at l.4 (B's exact text), l.16, l.18, a new l.32 (pass step 9, liveness), l.75 (was 74: the determinism lists now include `move-components-*` for both checks, matching `determinismMetrics` and `crossRateMetrics` in the spec), l.84 (was 83), l.152 (was 151, rewritten), and a new l.153 (stage a flipped 48 rows → doc 165).
- **Doc 165:** new. Status is conditional: "In Progress (C round 210 check pending)" (L28). It cites only FP1–FP13, FP14a/b/c and MD1–MD5, which all exist. It lists the D-29z186 delta and the before/after table above.
- **Stale doc 163 lines outside the grant (for B; not edited):**
  - l.68: `move-components-*` described as "`record`, target `<= 3` (PERF-FADER-a/b გადაიყვანს `assert`-ზე)". It is now assert for 4 faders.
  - l.69: `release-commits` described as "`record` … PERF-FADER-a-ს შემდეგ ≥ 1 უნდა იყოს". It is now assert for 4 faders.
  - l.71: "PERF-FADER-a მას ეკვივალენტური მტკიცებით ჩაანაცვლებს". The row instead survives unchanged; see its new note.

## code-reviewer (actually run once, read-only subagent; score 8/10; no Critical or High)
**Timing caveat:** the review ran on the tree **before** the post-review fixes: it still cites the `as const` at `:914` and the `PERF_TABLE_*` placeholders. After it returned I changed only tests, docs and notes:
- FP13/FP14 pan seeding and their assertions;
- the `panReset` exact-name selector;
- the `trackParamCalls` rename;
- `groups?.`;
- a Biome reflow;
- 16 `release-commits` notes;
- the doc 165 table and wording.

No source file changed after the review. I did not run a second review pass.
- **M1 (FP14 and FP13 could not tell "restore the stored pan" from "write 0") — fixed.** The stored pan is seeded at 10 steps; mutant M14w proves it.
- **M2 (the doc 165 perf table was a placeholder) — fixed** with the round-210 numbers.
- **L3 (`release-commits` note precondition) — fixed** in the 16 notes and in doc 165.
- **L5 (doc 165 overstated what unmount does) — fixed.**
- **L6 (Mermaid used only `mixOverrideRef`; "FP11–FP14" was loose; `as const`; helper name) — fixed.** `clipHeaderOf` keeps the existing gesture-guard pattern; recorded.
- **L1 (recorded, not changed):** in FP14a/b the draft clear is satisfied by the context **and** by the lane's own `cleanup()`. Only FP14c checks the context's clear on its own. This is the two-writer signal below.
- **L2 (recorded):** `group-volume-db.test.tsx:405` (a round-209 granted hunk area) asserts the model is unchanged mid-gesture, which is now always true; the meaningful check is `value === '-6'`. Not edited, because no round-210 grant covers that hunk.
- **L4:** this is the doc 163 l.71 contradiction listed above, outside the grant.
- **L7 (draft clear before `applyEdit`):** kept by D-29z185.
- **Small gap noted:** FP11 covers only the track Volume unmount, not pan, group or master.

**Architecture note (verbatim intent; proposal for B/root, no in-round refactor):**
- Signal 2 (ownership split): `ArrangementLane.tsx:394` writes to the context-owned draft store (`ArrangementContext.tsx:2719, 2765, 3605`), so the Pan draft has two writers.
- Signal 4: `ArrangementContext.tsx` gains `mixOverrideRef`, the draft store and its provider, a second override path, and more unmount cleanup.
- Signal 3: the Volume/Master/Pan gesture region was reworked in rounds 208–210. There are four nearly identical `begin*Gesture` claim and listener blocks (`2549`, `2745`, `2907`, plus clip gain at `3135`).
- **Recommendation: keep it for now** (cost medium; the invariants are tied to `claimPointerGesture`, `historyRef`, `handleRef` and undo atomicity).
- Bounded proposal after PERF-FADER-b: move the four claim and listener blocks behind one internal helper inside `ArrangementContext.tsx`, and remove the lane's `mixDraftStore.clear` so the context is the only writer. Acceptance: FP1–FP14c, MD1–MD5, `gesture-guard`, `fader-click` and `group-volume-db` stay green unedited, and the `useArrangement()` shape is unchanged.
- The reviewer's alternative (an external arrangement store with selectors) was judged worse than the current approach.

## Notes for C
- **PAN-DELTA-210:** FP13 reaches the stolen-claim state with a second `pointerDown` that carries the **same pointerId** on a clip header. A single real mouse cannot press a clip header while it holds the Pan thumb, so "not reachable by real input" is the likely outcome; FP13 and M13 are the evidence.
- The D-29z186 delta is listed in doc 165 under "ქცევის შეგნებული ცვლილება".

## Exact next C checks
1. **SCOPE-210:** HEAD `f535ab3`; `sha256sum -c` on the 1,030-file frozen list. Only the 20 grants may differ (12 actually do), plus the 5 new files. The gesture-guard diff against `b-round-209/r210-granted-start/` is the single D-29z183 hunk. Other granted-test hunks match the round-209 L23 table.
2. **PERF-RUN-210:** `npm run test:perf` ×2; the 48 flipped rows pass.
3. **WINDOW-210** (D-29z184: ≥ 100 only for the run that starts below max; harness agreement ±2), **LIVE-DISPLAY-210**, **AUDIO-210** (a, b loop wrap, c Space), **GROUP-210** (pointercancel and group blur), **INVARIANTS-210** (baseline `f535ab3` worktree under `c-round-210/`, with the pan cancel triggers added), **EXPORT-210**, **VISUAL-210**, **PAN-DELTA-210**, **G210-3**.
4. **DOC-210 / AN-REVIEW-210:** doc 163 hunks as listed above; doc 165 status conditional and the row ids exist (FP1–FP13, FP14a/b/c, MD1–MD5); FP13, FP14 and the extended FP9 are read.

## B acceptance status (only what my own runs passed)
- **Passed (A's own runs):**
  - D-29z183 hunk applied; gesture-guard 19/19.
  - FP13, FP14a/b/c and the extended FP9 added and green.
  - Red-proof: FP1–FP8 and FP10 red on the start copy at assertions; named mutants red for FP3/4, FP5, FP7/8, FP9, FP11, FP12, FP13 and FP14a/b/c.
  - 48 budget rows flipped; perf ×2 exit 0 with every assert passing.
  - Doc 163 D-29z181 lines; doc 165 created.
  - Typecheck; Biome on owned paths; targeted and covering vitest green.
  - code-reviewer run once, on the delta before the post-review fixes; both Mediums addressed. The fixes are test, doc and note only, and no source changed after the review.

## Process notes
- Pre-flight reading this round: `lessons.md`, the round-209 task, the round-209 A report, `AGENT_DISCOVERABLE_CODE.md` (first part), `GEORGIAN_DOCS.md` (first part) and `docs/implementation/TEMPLATE.md`. I did **not** re-read `TESTING_QUALITY_GATES.md` or `AUDIO_ARCHITECTURE.md` this round; round 209 read them for the same files.
- The perf run's `test-results/` and `build/` outputs are ignored and untracked: `git status` shows only the 12 M and 5 ??, and the frozen check returns exit=0.
- **Not claimed:** every C row (WINDOW, LIVE-DISPLAY, AUDIO, GROUP, INVARIANTS, EXPORT, VISUAL, PAN-DELTA, G210-3, DOC, AN-REVIEW) and the gate rows. realVerified=false until C runs the browser rows.
