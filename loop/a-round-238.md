# A round 238 — SABA-B-11a-FIX-3 (C-R237-01, A-R237-REVIEW-L1)

**No STOP.** No covering test failed.

**L32, timeout headroom — one test above 50 %:** `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` **LRS4**. The file declares no timeout, so the vitest default of 5,000 ms applies.

| Run | Time | Share of 5,000 ms |
|---|---|---|
| A first covering run | **2,654 ms** | **53 %** |
| A final covering run | 2,330 ms | 47 % |
| Gate 236 `verify.log` | 1,777 ms | 36 % |

The highest value decides, so it is listed here. It is pre-existing, in a frozen file that is not granted, and its code path did not change this round; I did not edit it. Ruling request for B: give LRS4 a declared timeout, or split it. Not a failure.

Full scan: every assertion above 2,500 ms in `covering.json`, each resolved against its own describe- or test-level timeout or the default. Every other test is ≤ 32 % (CP12b 9.6 s of 30 s; the group/mixer rows are ≤ 3.8 s of 20 s; render-budget 2.9 s of 15 s).

## 1. Start state (§0) — checked before any edit
- HEAD `ecaf0e4bd9c99081c2db7a4cd97497562d00193d`.
- `git status --short --untracked-files=all` = exactly the 11 paths of `b-round-237/git-status-at-planning.txt`.
- `sha256sum -c --quiet`: start list rc 0, tree list (1,098) rc 0, root list rc 0.

## 2. Changed files (the 3 grants only)
| Grant | File | Change | sha256 at handover |
|---|---|---|---|
| 1 | `app/contexts/ArrangementContext.tsx` | `b-round-237/precheck-scratch.diff` applied as is (`git apply -p1`):<ul><li>non-exported `gestureRefusalPrefix` and `statusAfterGestureRelease`, placed after `NUDGE_AT_TIME_START_MESSAGE`;</li><li>layout-effect condition `status !== EDIT && status !== UNDO` → `gestureRefusalPrefix(status) === null`;</li><li>release updater (5 lines) → `setStatus((current) => statusAfterGestureRelease(current, lastNonRefusalStatusRef.current))`;</li><li>`settle`: `lastNonRefusalStatusRef.current = settledCollectionStatus(lastNonRefusalStatusRef.current, copy, failedCount);` after `const failedCount = failed;`.</li></ul>The `--no-index` diff against the start copy removes 6 lines: the old condition line and the old 5-line updater. | `522e4a5d…0084` |
| 2 | `app/lib/arrangement/__tests__/tempo-seed-ui.test.tsx` | B's diff: the import gains the 2 `GESTURE_*` constants; `failingDeferredSeedCollection` and the TU12–TU15 describe are appended. **One addition beyond B's diff (reviewer M1):** live-region count assertions on `statusSequence`, in TU12 (settle +0, release +1) and in TU14 (settle +1, release +0). 0 removed lines against the start copy, so TU1–TU11 are byte-identical. | `e7335d22…13db1` |
| 3 | `docs/implementation/2026/quarter-IV/185-saba-b-11a-seed-status-fix.md` | <ul><li>l.4 = `**სტატუსი:** Completed (C round 238 PASS)`, byte-exact;</li><li>`## შეცვლილი ფაილები` gains the round-238 files;</li><li>`## პრობლემები და გადაწყვეტები` gains the C-R237-01 and A-R237-REVIEW-L1 Problem → Solution bullets, the prefix edge, the repeated-refusal-over-seed edge and the live-region note;</li><li>`## ტესტირება` gains TU12–TU15 (with the sequence deltas), the 3 mutants and C's refusal recipe.</li></ul>"Reference ვერ მოიძებნა" is kept. The 7 TEMPLATE headings are still in order. Cited row ids TU12–TU15 exist (grep). | `0113f44d…7895` |

No other path changed. At handover:
- `git status` still shows exactly the same 11 paths;
- the tree (1,098) and root lists give rc 0;
- the protected files give `git diff --quiet HEAD` rc 0;
- against the start list, only the 3 grant files differ.

## 3. Checks actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (also re-run after the M1 edit) |
| `npx biome check` on the 2 code files | clean, no fixes (also re-run after the M1 edit) |
| `npm run lint` | rc 0. 205 warnings + 1 info across the repo; Biome reports none on the 2 owned files |
| `npx vitest run $(cat b-round-237/covering-files.txt)` | **121 files, 1,719 tests, all passed**, 215 s (`a-round-238/covering.log`, `covering.json`). This ran before the M1 edit. |
| `npx vitest run tempo-seed-ui.test.tsx` after the M1 edit | 15/15 passed |
| Covering set re-run on the final tree | 121 files, 1,719 tests, all passed, 214.65 s (`covering-final.log`) |

## 4. Mutants (scratch copy `/tmp/a238-scratch`, outside `store/`; script `/tmp/a238-tools/mutants.py`; logs in `a-round-238/`)
| Mutant | Red | Green |
|---|---|---|
| MU-RF (the `settle` ref statement removed) | TU12, TU13 | TU14, TU15 (13 pass in total) |
| MU-L1-REL (exact-equality release updater) | TU15 | TU12–TU14 |
| MU-L1-EFF (exact-equality layout-effect condition) | TU15 | TU12–TU14 |

- After each mutant the scratch file was restored (`restored True`). `store/` was never mutated.
- Re-run on the **final** test file (with the M1 assertions) copied into the scratch: MU-RF → only TU12 and TU13 red (13 pass); MU-L1-REL → only TU15 red; MU-L1-EFF → only TU15 red. The logs in `a-round-238/mutant-*.log` are from this final run.

## 5. Browser (Playwright Chromium against the running `http://127.0.0.1:5173/studio-lab`)
- **Script:** `a-round-238/race.cjs`, a copy of C's `c-round-237/race.cjs` with these changes:
  - mode `refusalfail`: refusal recipe with `hero-music.mp3` answered 404;
  - mode `refusalready`: refusal after the ready text;
  - validity also requires the hero row to show its decoded duration, or the failure to settle while held;
  - the rerun also requires the refusal to actually show after Ctrl+Z.
- **Output:** `race.json`, `race-refusal-rerun.json`; shots in `a-round-238/shots/` (`a238-*`, `a238-rerun-refusal-*`).
- **Common to every row:** fresh context, 0 page errors, `auth_user` null, no leading space, status box 16 px.

| Mode | 1440×900 | 1280×720 |
|---|---|---|
| refusal (C-R237-01) | **First attempt not counted.** C's validity flag was true, but Ctrl+Z never showed the refusal (`statusAfterCtrlZ` = loading; no refusal in the history), so it did not exercise the bug. **Rerun (1 extra attempt):** refusal shown, held through settle, release → exactly `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` | Valid in both runs. Refusal shown, still showing at release, final = exactly the ready text. History: loading → refusal → ready. No `Loading…` entry after the refusal. |
| refusalfail (C-REFUSAL-FAIL-238) | Valid. The status became exactly `1 sound in the demo collection failed to load — details are in the library.` while the button was still held; after release, the same text. | Same |
| refusalready (C-REFUSAL-READY-238) | ready → undo refusal during the hold → exactly the ready text after release | Same |
| delay | placement + `Tempo 120 BPM … Grid only: audio is not stretched. Snap on — grid 1/4 (G)`; `data-bpm` 120; `data-snap` on | Same |
| fail | exactly `1 sound … failed to load …` | Same |

No new persistent text: only the status content changes.

## 6. code-reviewer (actual subagent, score 8/10, no Critical or High)
- **M1, no test pins the announcement count on the new paths** → fixed inside grant 2 (TU12/TU14 `statusSequence` deltas, §2). The reviewer worked these counts out from the code, and the assertions confirm them.
- **L1**: TU14 also passes on MU-RF. It pins the failure-wins rule, as B's §0.2 already says. Note only.
- **L2, untested combinations:**
  - refusal + seed tail while loading, then settle during the hold, then release;
  - release when the last non-refusal status is `''`.

  Not added (scope). Candidate rows for B.
- **L3**: a repeated refusal over a seed tail drops the tail. Already recorded in task §6 and doc 185.
- **L4**: the reducer's duplicate guard differs by path. The string path dedupes only during a gesture; the functional path always dedupes. No current caller is affected. Informational, for B.
- **L5**: the release updater reads the ref at reduce time. That is robust today, but a transition rebase or a same-batch `["X", refusal, release]` would restore the older status. Not reachable through the UI. Informational.
- **L6**: a collection swap during a hold overwrites the refusal. Same as HEAD; not a regression.
- **Architecture note (for B, not acted on):** the "equals the prefix, or starts with the prefix plus a space" rule now exists twice: `collection.ts` (loading) and `ArrangementContext.tsx` (refusal). The status line has changed in rounds 234, 236, 237 and 238. The reviewer says keep it for now. Proposal: move `gestureRefusalPrefix` and `statusAfterGestureRelease` into `lib/arrangement/status-announcement.ts` with a shared `statusPrefix(text, prefix)` helper, with no behaviour change; TU9–TU15, LS3/LS3b/LS6/LS7 and SU4/SU5 stay green. Alternative: a separate transient-refusal layer in the reducer, which would remove the stale-ref and prefix-parsing class. This adds to signal `A-R237-ARCH-STATUS-PARTS`.

## 7. Known gaps
- A-R237-REVIEW-L1 is proven at the unit level only (TU15). I found no UI path that appends a seed onto a showing refusal (same as B, §0.2).
- (Closed) After the M1 edit the whole covering set was re-run on the final tree: 121 files, 1,719 tests, all passed, 214.65 s (`a-round-238/covering-final.log`).
- The full suite, `npm run verify`, the build and the e2e smoke are gate rows. I did not run them.

## 8. B acceptance — A-side items done (§4 of the task)
- [x] 1 start-state check
- [x] 2 diff applied, doc 185 written
- [x] 3 typecheck rc 0, Biome clean on both files
- [x] 4 covering set green; one pre-existing test above 50 % (LRS4, listed at the top)
- [x] 5 three mutants with the expected red rows; final files contain no mutant
- [x] 6 code-reviewer run, M1 addressed, Architecture note passed on
- [x] 7 Playwright on `:5173`: refusal, delay, fail, the refusal-with-404 variant, and refusal-after-ready, at both viewports
- [x] 8 this report

C rows (C-SCOPE … LAB-SMOKE, Auth) remain C's. I have not claimed them.

## 9. Exact next C checks
1. C-SCOPE-238 with the handover hashes in §2. The test-file `--no-index` diff has 0 removed lines; the context diff removes exactly the 6 lines in §2.
2. C-MUT-238 (MU-RF → TU12/TU13 red; MU-L1-REL → TU15 red). Expect the TU12/TU14 sequence assertions to be present.
3. C-REFUSAL-238: also require the refusal to be visible after Ctrl+Z. My first 1440 attempt passed C's validity rule without it.
4. C-REFUSAL-FAIL-238, C-REFUSAL-READY-238, C-RACE-238 (delay/fail/idle/placement), C-SHOTS-238 (compare against `c-round-237/shots/after-refusal-*`).
5. AN-REVIEW-238 on doc 185 (l.4, headings, TU12–TU15 grep), C-REF-238, LAB-SMOKE-238, Auth.
