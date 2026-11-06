# B round 372: sketch review and consults for round 373 (PERF-11c-ii-b)

**Reviewed sketch = dispatched sketch:** `sketch.patch.txt`, sha256 `dddd21453e91803fae26fd5c92c5bc5ad9887945d4981427eec85360471349b1` (`sketch-dispatched.sha256`).
- It is the committed `sketch2` (scratch `a9c80a3`) diffed against `c45c677`, the `4900b83` tree.
- After the review, nothing in the sketch changed, so no delta re-review is needed.
- `ArrangementContext.tsx` on the sketch has sha `25911818…`.

## tech-lead (read-only, on the frozen sketch)
**Verdict:** dispatchable with one listed change (the hash manifest). No code change is required.

**High: `sketch-files-sha256.txt` recorded the MU-NO-NONREFUSAL-WRITE mutant hash.**
- Cause: B wrote the manifest while that mutant run had the working copy modified.
- **Fixed:** the manifest was regenerated from the clean tree. `ArrangementContext.tsx` = `25911818…`, equal to `git show HEAD:` in scratch.
- The patch applied to a fresh `git archive 4900b83` equals the manifest (7/7 OK).
- The superseded manifest is not kept.

**Evidence gap: the typecheck and Biome logs predated the final sketch.**
- **Fixed:** both were re-run on the final tree. `sketch-typecheck.log` is rc 0, and `sketch-biome.log` reports "Checked 7 files … rc 0". The reviewer's own re-run is also rc 0.

**Medium TL-R372-M1: a non-refusal string, then a refusal, then a release, all in one batch.**
- HEAD's layout effect saw only the batch's final text, so the release restored the text from before the batch.
- The sketch restores the in-batch non-refusal text.
- **Ruled:** this is an accepted behaviour delta (D-29z1234). The sketch matches the contract S5b states ("restore the most recent non-refusal status"). The reviewer found no production handler that writes a non-refusal status, a refusal and a release in one batch.
- The rows S5b-same-act and CG→GR-same-act are recorded as test-only inputs to PERF-11c-iii (`PERF-11c-iii.inputs_round_373`). They are not run on this sketch, so they are not round-373 rows (L58).

**Low findings, each with its ruling:**
- **The same-text string, then a release, in one handler.** The call-time flag suppresses where HEAD re-announced. No production path does this: every finish handler releases first. → Recorded. The second mutant killer (CG→GR) goes to PERF-11c-iii's inputs.
- **The refs the updaters read** (`isPlayingRef`, `insertMarkerRef`, `rangeStore`, `historyRef`, `playbackEndedAtRef`, `lastNonRefusalStatusRef`). Every handler was traced; `playFrom` was the only exception, and it is fixed (LT12). Its past-end, empty, no-AudioContext and restart branches end on the HEAD text. → It confirms R-CALLTIME.
- **A duplicate preview** (`setStatus(T)` + `previewStatus(T)` in one batch). The only caller of `previewStatus`, the fade pointermove, never writes status first. → R-PREVIEW-GUARD.
- **The sequence advances up to 3 times in one `playFrom`** (HEAD: once). There is one render and the same DOM, and no app code reads `statusSequence`/`statusKey` any more. → Recorded.
- **Naming.** `status-preview-store.ts` and `ArrangementStatusPreviewState` now hold the committed status, and `clearPreview` has no production caller. → Architecture signal SIG-R373-STATUS-STORE-NAME (rename later; not scheduled).
- **Releases during unmount now write to the store.** Harmless. → Recorded.

**Further checks:**
- (b) SSR is OK: zustand 5.0.16 `useStore` takes `getInitialState` as the server snapshot, and the loading copy is the same as at HEAD.
- (c) No status write happens during another component's render (0 warnings in `precheck-full.log`).
- (d) A no-op write returns the same state, so no subscriber is notified.

## Ordering matrix (L58), one operation in flight
Key: CS = commit-string, CU = commit-updater, CG = same-text commit during a gesture, PS = preview-show, GR = gesture-release. A preview clear is not a separate app event: it happens only inside `commitStatus`, so the PS rows cover it.

| first ↓ / second → | CS | CU | CG | PS | GR |
|---|---|---|---|---|---|
| CS | excluded: trivial (the last write wins; `reduceArrangementStatus` unit rows) | DP19 | excluded: no production path (TL-R372 Low) | DP20 | S3-same-act |
| CU | LT10 | LT13, LT12 | excluded: no production path | excluded: the only PS caller writes no CU first (R-PREVIEW-GUARD) | excluded: no production path |
| CG | excluded: no production path | excluded: no production path | SU5 (separate acts) | excluded: no production path | input to PERF-11c-iii (CG→GR-same-act) |
| PS | DP12 | DP17, DP18 | excluded: DP17 covers the updater form | DP10 | DP11, DP13 |
| GR | DP17, DP19 | excluded: rare, release then an updater = LT rows | excluded: no production path | excluded: no app path | S4 |
| refusal CS → GR | — | — | — | — | S1-same-act; non-refusal → refusal → GR in one batch = TL-R372-M1 (ruled; input to PERF-11c-iii) |

Of the 25 cells, 12 have a row and 13 have a ruled exclusion or input.

## performance-optimizer (round 371 inputs, now measured on the sketch)
| Input | Result on the sketch |
|---|---|
| No `useState`/`useReducer` write on the status path; the layout effects move into the store action | Done: `commitStatus` is one `set` (K5 = 0, K6 = 0 on the sketch) |
| `interact.drag.*.release-commits == 1`, fade ≤ 3 | Trim, move, lane, group and video are 1; fade is 2 (`perf-sketch.log`) |
| Re-applied MU-B (`b-round-359/mutants/mu-b.diff.txt`): start-components ≈ 11–12, not 99 | **12** (stop 12) in `perf-mu-b-on-sketch.log`. Under MU-B, fade release-commits are 4, because the mutant itself adds two timed `setStatus` calls to the fade release. Record only. Two earlier runs were invalid: the copy lacked `public/middle-east.mp3` (`perf-mu-b-on-sketch-invalid-missing-mp3.log`) |
| Parent render totals may only drop | RS4, PV1–PV4, `fader-pointer-preview` and `clip-gain-pointer-preview` pass in the full run |

## B's pre-check summary
| Check | Result | File |
|---|---|---|
| tsc / Biome (7 files) | rc 0 / rc 0 | `sketch-typecheck.log`, `sketch-biome.log` |
| Full suite | 252 files, 3,703 tests (v1: 6 red, ruled) | `precheck-full.log`, `precheck-full-v1.log` |
| Perf interactions (production build) | 95 PASS, 0 FAIL | `perf-sketch.log` |
| Mutants | 6/6 red | `mutants/mutant-*.log` |
| expect()/it() | not lower | `expect-counts-373.txt` |
