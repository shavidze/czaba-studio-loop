# A round 211 — PERF-FADER-b: Clip Gain pointer preview, single clip and members (SABA-B-5 part 2)

**Status: implementation and A self-checks complete, ready for C.** No STOP. realVerified=false: A ran no browser acceptance row. The only browser use was two small Playwright surveys of the harness flow (`a-round-211/survey*.cjs`, against :5173). Their storage state is `a-browse.json`: the :5173 origin with a session id and a dismissed LeadMagnet, no cookies and no token. No C row is claimed.

Baseline `180dd2e`. Clean tree at start; no earlier partial work.

## Changed files (final tree)
- **Modified (all 14 grants):**
  - Sources: `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementDetailPanel.tsx`, `app/components/arrangement/ArrangementClip.tsx`, `app/lib/arrangement/mix-draft-store.ts`, `app/components/arrangement/ArrangementMixFader.tsx` (one line: `useMixDraftValue` exported).
  - Tests: `mix-draft-store.test.ts` (new MD6), plus L23 hunks only in `clip-gain-fader`, `clip-gain-multi`, `clip-gain-waveform` and `waveform-zoom`.
  - Harness: `perf/budgets.json`, `perf/studio-lab.perf.spec.ts`.
  - Docs: 163 (D-29z191 lines) and 165 (l.4 only).
- **New (2 of the 4 allowed):**
  - `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx`
  - `docs/implementation/2026/quarter-IV/166-clip-gain-pointer-preview.md`
- **Not created:** `ArrangementPeakPath.tsx` and `ArrangementDetailClipGain.tsx`. Both leaves exist, but inside granted files (DEVIATION 2).
- **Scope check:**
  - `sha256sum -c --quiet b-round-210-r211-tree-sha256.txt` printed nothing; exit=0.
  - `git status`: 14 M and 2 ??. Nothing is outside the grants or the new-files list.
  - Doc 165: one hunk, `@@ -4 +4 @@`, B's exact text.

## Design (D-29z189)
- **Context:**
  - `MixOverride` gained a `clip-gain` kind (`memberKey`, `clipIds`, `gains: Map<clipId, dB>`).
  - Pointer path, taken when `clipGainGestureRef.current?.memberKey === memberKey`. Each move:
    - targets come from `setClipGainDb` (single) or `clipGainShiftTargets(present, span.clipIds, anchor − span.maxDb)` (members);
    - they go into the override and the per-clip drafts (`clipGainDraftKey`);
    - while playing, `handle.setClipGain(id, 10 ** (dB / 20))` is written for every clip in the gesture (one clip, or every member on every move);
    - there is no `updateHistory`, `syncPlayback` or `setStatus`, and no `next === present` early return (Trap 1);
    - `clipGainBeforeRef` is not touched.
  - Commit: take the override (clears its drafts), then one `applyEdit(withMixOverride(present, override), CLIP_GAIN_LABEL)`. The members status is set only when an entry was written and there is more than one clip, using the override's `clipIds`.
  - Cancel (pointercancel, blur, stolen claim) goes through `revertClipGainFaderPreview`: take the override, then restore every overridden clip's `clipLinearGain` on the live graph.
  - Unmount clears every draft key of any override (`mixOverrideDraftKeys`).
  - `startGraph` uses `clipGains: clipLinearGains(mixed)`, and the `syncPlayback` setter loops over `mixed.clips`.
  - `withMixOverride` is no longer exported (S2; grep found no other user).
  - The pending path is byte-for-byte unchanged.
- **Leaves:**
  - `ArrangementPeakPath` (in `ArrangementClip.tsx`, next to `buildPeakShape`, which is unchanged): renders only the `<svg>`/`<path>`, from `useMixDraftValue(clipGainDraftKey(clip.id))`. The scale is `clipWaveformScale(draft ? {...clip, gainDb: draft} : clip, isVideo, zoom)`. The lane passes `waveformZoom` and its `data-testid`; the detail panel passes 480 columns inside `ArrangementDetailWaveform`, where the playhead and range overlay stay siblings.
  - `ArrangementDetailClipGain` (forwardRef to the range input, in `ArrangementDetailPanel.tsx`): renders every draft-dependent node of the block. Its snapshot is a primitive string of per-clip drafts for the displayed ids. The ids key is JSON (review L5). A draft is ignored when the selection has a `reason` (review L3). Plain DOM, no `key`. The typed text, the sync effect, the handlers and the `useId` ids stay in `ArrangementDetailContentInner`.

## Deviations (for B)
1. **D-29z190 step 1 cannot run as written.**
   - `/studio-lab` starts with 0 clips (survey 1). When the members scenario begins, exactly one audio clip exists (the added "Middle East" on Music), so there is no separate Music clip.
   - What I did instead: the scenario selects **Soft impact** in the library and presses **Add**. The clip lands on the active SFX lane: survey 2 shows it at x=834, w=80, with its waveform drawn. Then it clicks the added clip and Shift+clicks Soft impact (Shift = the 'add' modifier, `ArrangementClip.tsx` l.362–365), and waits for `arrangement-detail-group`.
   - It runs after `fader.group.playing`, so no earlier row's arrangement changes.
   - Scenario text and pass sequence: "members: the added clip and the Soft impact clip, Shift+click".
2. **Both leaves live in granted files, not in the 2 new component files.**
   - `ArrangementPeakPath.tsx` as its own file created an import cycle with `ArrangementClip.tsx` (code-review Medium 1). Moving `buildPeakShape` out would need a non-granted new file.
   - With `ArrangementDetailClipGain.tsx` as its own file, two **frozen** repo-scan tests failed, because they read the block's source text in `ArrangementDetailPanel.tsx`:
     - `label-status-colour-ui` DXL8: `hover:text-foreground` count 2 instead of 3;
     - `studio-focus-ring` SFR4: the `STUDIO_LEVEL_FADER_CLASS` className line count 0 instead of 1.
   - D-29z189 item 7 explicitly allows the block "as the same code inside `ArrangementDetailPanel.tsx`". No frozen test was edited.
   - This goes beyond the letter of "may leave out **one** of the two new components". B, please ratify or rule.
3. **`fader.clipgain.stopped.release-commits` = 2** (round 210: 1). Still within `>= 1`.
   - The first release commit clears the drafts and writes the entry. The second is the parent's existing layout-effect text sync (`displayedClipGainText` changed); it must stay per item 7.
   - Both commits happen before paint (layout effect). C's LIVE-DISPLAY S5 snap-back check is the real test.
   - The playing and members drags start and end at max, write no entry, and commit once.
4. **Wall-clock `harness.move-latency-*` moved by about +0.5 ms**, consistently across 6 runs.
   - The rows are `kind: wallclock`; the deterministic `harness.*` rows are identical.
   - Medians against C round 210:
     - `.sync` 31.8 / 31.9 vs 31.3;
     - `.deferred` 31.9 / 31.9 vs 31.4;
     - `-control` 1.5 / 1.8 vs 1.6.
   - The assert `>= 30` passes. Across A's and C's four round-210 runs, `.sync` ranged 31.3–31.7.
   - Likely cause (hypothesis, not proven): by B's step order, liveness now runs after the members scenario, on a 2-clip arrangement with a group selection.
   - I read D-29z190's must-be-identical list as "existing **deterministic** rows" and did not STOP. If B meant the wall-clock `harness.*` rows too, this is the L11 measurement.
5. **The setter-loop override is unreachable mid-gesture.** Mutant M7s survives. Every non-forced `syncPlayback` caller either belongs to another pointer gesture (one claim slot) or is an edit refused during a gesture (`refuseEditDuringGesture`, undo/redo blocked).
   - So CP7 and CP8 prove `startGraph` (Space, forced resync, loop wrap).
   - The setter change is kept as defence in depth, per item 4.

## L23 hunks in granted tests (old → new; every one is a mid-gesture read except where marked)
- **`clip-gain-fader.test.tsx`:**
  - **CF2 l.344:** `gainOf(m1)=8.4` → field `'8.4'`, slider `'8.4'`, model `0`.
  - **CF4:**
    - l.372: `gainOf=8.4` → slider `'8.4'`, model `0`;
    - l.374–376: `afterToggle` now comes from `Number(input.value)`, and the model stays `0`;
    - l.378: `gainOf≈17.6` → slider ≈17.6, model `0`;
    - **added after pointerup:** model ≈17.6, completing the "model equals the dragged value after release" check.
  - **CF12 l.525:** `gainOf=-8.4` → slider `'-8.4'`, model `0`. l.526 (live node) is unchanged.
  - **CF13:** l.545 `gainOf=21` → slider `'21'`, model `0`; l.555 `gainOf=8.4` → slider `'8.4'`, model `0`.
- **`clip-gain-multi.test.tsx`:**
  - **MG4 l.430:** `[2.4, 9.4]` → `aria-valuetext '+2.4 … +9.4 dB'`, model `[-6, 1]`.
  - **MG5:**
    - l.448: `[-60, -53]` → `'−60.0 … −53.0 dB'`, model `[-6, 1]`;
    - l.450: `[-6, 1]` → `'−6.0 … +1.0 dB'` (Trap 1) plus the model line.
  - **MG11:**
    - l.567: `gainOf(m1)=2.4` → slider `'2.4'`, model `-6`;
    - l.599 (group→group): `[15, 22, 0]` → `toGroup.fader()` `'0.0 … +22.0 dB'` (s1 drafted at 22, x1 stored at 0, matching the baseline display), model `[-6, 1, 0]`.
  - **MG14:** l.612 `[15, 22]` → `'+15.0 … +22.0 dB'`, model `[-6, 1]`; l.622 `[2.4, 9.4]` → `'+2.4 … +9.4 dB'`, model `[-6, 1]`.
  - **MG12 l.651:** `[-14.4, -7.4]` → `'−14.4 … −7.4 dB'`, model `[-6, 1]`. l.652–653 (nodes) are unchanged.
- **`clip-gain-waveform.test.tsx`:**
  - **WG4 l.386–392:**
    - `previewDb = Number(input.value)`;
    - model `0`;
    - lane `d` = `expectedShape(m1, columns, 10^(previewDb/20))` instead of `laneMatchesGain`, which reads the model;
    - the detail check is unchanged.
    - **Added edit at l.377:** `laneMatchesGain` removed from WG4's destructure (it became unused, a Biome error).
  - **WG8 l.515–519:**
    - same re-expression; the node check is unchanged (`toBe 10 ** (previewDb / 20)`);
    - **added after pointerup:** model = previewDb;
    - **added edit at l.500:** destructure `laneMatchesGain` → `lane, expectedShape`.
- **`waveform-zoom.test.tsx` WZ3:** l.506 `previewDb` from `Number(input.value)`; **added at l.507:** model stays `-6`. l.508 (`undoLabel === CLIP_GAIN_LABEL`) and l.509–510 are unchanged; they now read the displayed previewDb.
- Hunk headers: `git diff -U0` on the four files; every hunk is listed above.
- No other read between a clip-gain pointerdown and its release was found: these 12 rows were the only red ones after the source change.

## New rows (`clip-gain-pointer-preview.test.tsx`, 17 tests)
CP1–CP14 per B, plus two from the review:
- **CP3, CP4 and CP5-members** are one parametrised block (pointercancel, stolen claim, members fader blur).
- **CP5** is the single fader blur.
- **CP5b** (review M2) covers single pointercancel: field, slider, `aria-valuetext`, draft and live gain all restored, with no entry.
- **CP10b** (review L3): a mid members-drag selection change to `['cm', 'cv']` (a video clip) shows the stored disabled state (`'0.0'`, `'0.0 dB'`), not the draft.
- **MD6** in `mix-draft-store.test.ts` covers the new key.

## Red-proof (D-29z187 method)
- **Start copy:** `git archive 180dd2e`, symlinked `node_modules`, plus the current `mix-draft-store.ts` and the test file. Log: `a-round-211/startcopy-redproof.log`.
  - 11 red, all AssertionErrors with no import errors: CP1, CP3, CP4, CP5-members, CP5b, CP7, CP8, CP10b, CP11, CP13, CP14.
  - 6 green, as unchanged-behaviour rows: CP2, CP5, CP6, CP9, CP10, CP12.
  - The scratch tree in `/tmp` was deleted.
- **Named mutants** (`a-round-211/mutants.py`; logs `mutants.log` and `mutants-final-leaf.log`, run on the final tree; each file is restored and hash-checked):

| Mutant | Mutated line | Red | Failing assertion |
|---|---|---|---|
| M2 | commit `withMixOverride(present, pointerOverride)` → `present` | CP2 | `[] to deeply equal ['Clip Gain']` |
| M3 | cancel live restore guarded off (`&& override.clipIds.length === 0`) | CP3, CP4, CP5-members, CP5, CP5b | live gain `0.1905` expected stored `0.5012` |
| M3d | cancel reads the override without taking it (drafts kept) | CP3, CP4, CP5-members, CP5, CP5b | draft `-14.4` expected `undefined` |
| M4 | stolen-claim abort without `revertClipGainFaderPreview()` | CP4 | `0.1905` expected `0.5012` |
| M5 | fader blur mid-gesture commits instead of cancelling | CP5, CP5-members | `0.1905` expected `0.5012` |
| M6 | members status reads `clipGainMemberIdsRef` (null on the pointer path) | CP6 | status `'Demo collection ready…'` expected `'Clip Gain: 2 clips — +15.0 … +22.0 dB.'` |
| M7 | `startGraph` `clipLinearGains(mixed)` → `(arrangement)` | CP7, CP8 | graph gain `0.5012` expected `0.0724` |
| M7s | setter loop `mixed.clips` → `arrangement.clips` | **none** (DEVIATION 5) | — |
| M9 | native change with no gesture takes the pointer path | CP9 | `-6` expected `-5.9` |
| M10a | pending marker ignores the draft | CP10 | `data-pending 'true'` expected `null` |
| M10b | reset `disabled` reads the stored gain during a draft | CP10 | `true` expected `false` |
| M10c | the draft is shown although the selection has a reason | CP10b | `'10.8'` expected `'0.0'` |
| M11 | unmount without the override draft clear | CP11 | `-22.8` expected `undefined` |
| M12 | pointer target `Math.fround(...)` | CP12 | `-4.900000095367432` expected `-4.9` |
| M13 | the draft drawing drops the waveform zoom | CP13 | path mismatch |
| M14 | Trap 1: `if (next === present) return;` on the pointer path | CP14 | field `'10.8'` expected `'-6.0'` |

## DOM identity vs `180dd2e` (for VISUAL-211 / INVARIANTS-211)
- Method: one scratch vitest, run in a `180dd2e` tree and in a copy of the final tree. Tools: `a-round-211/dom/make-dump.py` and `dump-body.tsx`.
- It dumps `outerHTML` of 5 regions: the Clip Gain column, the detail middle box, and the lanes cm, cx and cv.
- 14 states: none; single −6, undefined and +24; members mixed, equal and zero; members with video; single video; single pending; members pending + mixed; zoom 2; after a single commit; after a members commit.
- Result: **70/70 regions byte-identical** (`dom/start.json`, `dom/current.json`). This answers review item 9.

## Perf (`npm run test:perf` ×2 on the final tree, sequential, nothing else running)
- Files: `a-round-211/run{1,2}.{json,log}`.
- run1: exit 0, 7m30s (durationMs 438 546). run2: exit 0, 7m40s (448 794).
- Both: `complete: true`, 316 rows, 92 asserts, 0 failures, `failures: []`. All 12 flips and every members assert pass.
- Restarts are 0. Deterministic rows are identical between the runs and across 1×/6×.
- Every must-be-identical deterministic row equals C round 210, except the wall-clock note in DEVIATION 4.
- `load.components`: 344 → **345 (+1)**. One `ArrangementDetailClipGain` instance renders at load. Drawn audio clips at load: **0**, so no `ArrangementPeakPath` at load.

| row (1×) | round 210 (C run1) | run1 / run2 |
|---|---|---|
| clipgain.stopped move-components-max / per-move | 95 / 89.833 | 3 / 2.75 (both runs) |
| clipgain.playing move-components-max / per-move | 95 / 73.5 | 3 / 2.25 |
| clipgain.stopped / playing release-commits | 1 / 1 | 2 / 1 (DEVIATION 3) |
| clipgain-members stopped / playing max / per-move | — | 3 / 2.25 |
| clipgain-members.playing restarts | — | 0 |
| clipgain.stopped move-to-paint-p95.1x | 25.1 ms | 17.6 / 17.7 ms |
| clipgain.playing move-to-paint-p95.1x | 66.5 ms | **60.1 / 60.0 ms** |
| clipgain-members stopped / playing move-to-paint-p95.1x | — | 7 / 8 ms · 10.1 / 9.7 ms |

- Window commits for 120 moves: single stopped 110, single playing 90, members 90 / 90. Down commits are 0 everywhere. Each value-changing move commits once; there is no longer a second commit per move.
- Two runs from earlier trees are kept for the record and are not the evidence: `run1-prereview.*` (a full run before the review fixes, same numbers) and `run2-aborted-prereview.*` (I stopped it myself to re-run on the fixed tree; I killed only my own :5188 server, and :5173 stayed up and returned 200).

## Self-checks actually run (final tree)
- `npm run typecheck`: exit 0.
- Biome `check` on the 11 owned app paths: 0 errors, 0 warnings. The perf spec and `budgets.json` are outside `biome.json`'s `app/**` scope; `tsc` includes the perf spec.
- Targeted `npx vitest run` on the new file, `mix-draft-store`, the 4 granted tests and the 12 named neighbours (`fader-pointer-preview`, `clip-gain`, `pending-status`, `fader-guards`, `gesture-guard`, `content-colour-ui`, `detail-panel-polish`, `detail-panel-reason`, `detail-panel-fit`, `affordance-colour-ui`, `fader-style-ui`, `context-hygiene`): **18 files, 284/284** (`targeted-vitest.log`). This run was before the block moved into the panel file; the covering run below is after.
- Covering run `app/lib/arrangement/__tests__ app/components` on the final tree: **152 files, 2206/2206** (`covering-vitest.log`). That is round 210's 2188 plus 17 CP and 1 MD6.
  - The intermediate layout (separate block file) failed frozen DXL8 and SFR4; that led to DEVIATION 2.
- Not run (root gate): the full suite, the repo-wide `npm run lint`, `npm run verify`, the standalone build and e2e smoke.

## code-reviewer (run once on the delta before the review fixes; score 8/10; no Critical or High)
- **M1, import cycle:** fixed. The path leaf moved into `ArrangementClip.tsx`, which removes the cycle.
- **M2, CF13/MG14 post-revert checks no longer prove the revert:** those lines are frozen ("every read after a cancel stays unedited"), so I did not edit them. New CP5b covers single pointercancel; CP3 and CP5-members cover members cancel and blur with display, draft and live-gain checks.
- **L3, a draft shown despite `reason`:** fixed, CP10b plus M10c.
- **L4, `getArrangement()` read during render:** kept and recorded. It runs only when a draft exists for a displayed id without a draft (MG11 toGroup). The parent has no reactive per-clip gains, because the `group` object comes from the frozen `StudioWorkspace`.
- **L5, the `|` separator:** fixed with a JSON ids key and memoised ids.
- **L6, doc wording and placeholder:** fixed.
- **L7, harness:** kept. The fixed 2 s wait mirrors the existing Add step. `release-commits` has no upper bound because B ruled only `>= 1`.
- **L8, selectors:** the `[data-clip-id] [data-testid]` and `firstElementChild` patterns are the existing ones (gesture-guard, FP13).
- **Item 9, DOM identity unverified:** now verified, 70/70 identical (above).
- **Review timing:** the review ran before these fixes. After it I changed:
  - the leaf locations (no logic change);
  - L3 and L5;
  - the CP5b and CP10b rows;
  - doc 166.

  A second review on the **final** delta ran in attempt 2 (see "Attempt 2" below): 9/10, no Critical, High or Medium.
- **Architecture note (verbatim):**
  - "Signal: `app/contexts/ArrangementContext.tsx:2979-3282` (clip-gain gesture/override) and `:3678-3699` (unmount cleanup) are signals 3 and 4. This is the second round in a row that adds an override kind, refs and cleanup to the same owner."
  - "Keep: the single `claimPointerGesture` slot, the shared `mixOverrideRef`, Undo atomicity and the audio timing form one lifecycle. Extracting it would re-plumb every ref and every test mock (cost high, high regression risk to gesture timing)."
  - "No new task: the `frontend-architect` checkpoint already queued in doc 166's TODO should decide whether a gesture/override sub-module is worth it once all fader kinds are done."
  - The reviewer also proposed moving `useMixDraftValue` next to the store (Low). It is a proposal for B and was not done.

## Known gaps
- **Single Clip Gain playing move-to-paint p95 is still about 60 ms** (round 210: 59–66), even though each move now commits only 3 components. The other cases:
  - members playing: about 10 ms;
  - single stopped: 17.6 ms;
  - track playing: about 4 ms.
  - The remaining cost is not in React commits. A hypothesis, not measured: paint of the detail waveform while playing.
  - SABA-B-5's policy target (p95 < 16 ms) is **not met** for this one case. It is a record row, not a B acceptance, but B should plan a measured follow-up.
- DEVIATIONS 1–5 above need B's ratification.
- The browser rows have not been run (C).


## Attempt 2 (resume, 2026-10-27): final-delta review and re-checks
- **State on resume:** the tree matched the report (14 M, 2 ??). The only change after perf run2 was note text on the 8 `*.release-commits*` rows in `perf/budgets.json`. Modes and budgets equal run2's snapshot (scripted compare: 8 note diffs, 0 mode/budget diffs). The perf evidence therefore stands; perf was not re-run.
- **Re-checks on the final tree (this attempt):**
  - `npm run typecheck`: exit 0.
  - Biome on the 11 owned app paths: 0 errors, 0 warnings.
  - Targeted vitest: **20 files, 301/301**. That is the 18 earlier files plus frozen `label-status-colour-ui` (DXL8) and `studio-focus-ring` (SFR4). Log: `a-round-211/targeted-vitest-attempt2.log`.
- **Second code-reviewer, on the FINAL delta:** **9/10, no Critical, High or Medium.**
  - It verified the M1, M2, L3 and L5 fixes, Trap 1, commit, cancel, unmount, S2 and the primitive snapshots.
  - **L-1:** `getArrangement()` is read during render. This is the same finding as the earlier L4 and stays as recorded.
  - **L-2:** structural test selectors. These follow project precedent.
  - **L-3:** doc 166 l.99 used shorthand row ids. **Fixed:** the three full ids are now spelled out (L26).
  - **L-4:** the reviewer flags DEVIATIONS 1, 2 and 4 for B/C. They are unchanged.
  - **Architecture note (verbatim, final review):** "Signals 3 and 4 at ArrangementContext.tsx:2979-3282 and :3678-3699: this is the second round in a row that adds an override kind, refs and cleanup to the same owner. **Keep**, because the single claimPointerGesture slot, the shared mixOverrideRef, Undo atomicity and the audio timing form one lifecycle; extracting it would re-plumb every ref and test mock (high cost and risk). Leave the decision to the frontend-architect checkpoint already queued for 211→212. Mild signal 2 at ArrangementMixFader.tsx:30: useMixDraftValue is now a hook exported from a component file and used by a sibling component (ArrangementClip.tsx:41). Proposal for the planner, not for this round: move it next to mix-draft-store.ts or into a hooks module."
- **End-of-round scope (attempt 2, after the doc 166 edit):** `sha256sum -c --quiet b-round-210-r211-tree-sha256.txt` printed nothing; rc=0. `git status`: 14 M and 2 ??.
- **Lessons self-check:** I read the A self-check part of `lessons.md` (L11–L15, L26–L28). There was no STOP, and no class token was removed or renamed. L15 does not apply because no colour changed. Doc 166 cites only existing row ids (L26), and its status line is conditional (L28).
- **Still not claimed:** every C browser row (realVerified=false), and DEVIATIONS 1–5 await B.

## Exact next C checks
1. **SCOPE-211:**
   - HEAD `180dd2e`; `sha256sum -c` of the 1,041-file list (A: exit 0); 14 M and 2 ?? (DEVIATION 2: the two component files are absent).
   - Grant diffs against `b-round-210/r211-granted-start/`; doc 165 changes only l.4.
   - Granted-test hunks match the L23 list above, including the 5 marked added or destructure edits.
2. **PERF-RUN-211:**
   - ×2 with the asserts above;
   - compare against `c-round-210/out/perf-run*.json`;
   - `load.components` +1 = 1 block leaf, 0 drawn clips;
   - judge DEVIATION 4.
3. **WINDOW-211:** single and members, both viewports. Include the run that starts below max (type −12 dB first). Members selection: Add Soft impact, click the added clip, Shift+click Soft impact.
4. **LIVE-DISPLAY-211 / S5:** the single stopped release has 2 commits (DEVIATION 3). Look for a one-frame pending marker or text flash on release.
5. **AUDIO-211**, **MEMBERS-211**, **INVARIANTS-211**, **EXPORT-211**, **VISUAL-211**: A's jsdom DOM dump says the markup is identical. Computed style and pixels still need the browser. Then **G211-3**.
6. **DOC-211 / AN-REVIEW-211:**
   - doc 163 l.16, 31–33, 69, 70, 71, 72, 85 and TODO;
   - doc 166 has the conditional status, and its cited ids exist (CP1–CP14, CP5b, CP10b, MD6, CF2/4/12/13, MG4/5/11/12/14, WG4/8, WZ3);
   - `withMixOverride` is not exported.
7. Spot-check one track drag at 1 component per move; FP1–FP14 are green unedited in the covering run.

## B acceptance status (only what my own runs passed)
- **Passed (A's runs):**
  - pointer path, override, commit, cancel, restarts and unmount (CP rows plus mutants);
  - S2;
  - L23 hunks;
  - red-proof (11 red on the start copy at assertions) and mutants for CP2–CP14 (all red except M7s, explained);
  - 12 flips and 50 members rows; perf ×2 exit 0, all asserts pass, under 12 min;
  - doc 165 l.4; doc 163 items; doc 166 created with the conditional status;
  - typecheck; Biome on owned paths; targeted and covering vitest;
  - code-reviewer run, both Mediums addressed.
- **Not passed / not claimed:**
  - every C browser row;
  - B's exact harness step 1 (DEVIATION 1);
  - the "one new component file" letter (DEVIATION 2);
  - the wall-clock harness identity, if B meant it (DEVIATION 4);
  - a mutant-proved setter loop (DEVIATION 5).
