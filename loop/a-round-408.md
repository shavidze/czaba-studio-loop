# A round 408: PERF-11c-iii-e-i (Lane callbacks from the actions context)

**No STOP.** Code-reviewer: no Critical, High or Medium (§4).

## 1. Changed files (store, working tree)
`git status --short --untracked-files=all` shows exactly:
```
 M app/components/arrangement/ArrangementLane.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/__tests__/actions-context.test.tsx
?? docs/implementation/2026/quarter-IV/261-perf-lane-actions.md
```
- The 3 code/test files come from `b-round-407/sketch-408.patch.txt` (sha256 `029e5f8a12e55c8fe1f1de5e8db900d4a5f8ba250577ef6ccc67ef93f6cfbf8b`, matches K14). `git apply --check` was clean and `git apply` was used. A did not edit these files afterwards.
- Doc 261 is new. Its l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 408 PASS)`. It has the 7 TEMPLATE headings in order. The mutant table and a verbatim copy of `summary.txt` follow doc 260's form. Loop evidence is cited by its full `/home/runner/czaba-project/tmp/studio-real-loop/...` path and marked as outside the repo.

## 2. Pre-flight
- Assumptions: apply B's reviewed patch byte for byte, write doc 261, and change no behaviour.
- Scope: only the 4 granted paths. No protected, auth, route, config or package file was touched.
- Success: the A1–A5 rows below.

## 3. Checks (A1–A5), actually run
| # | Check | Result | Evidence |
|---|---|---|---|
| A1 | claims at start | rc 0, stderr empty, **identical** to `claims-408-planning-output.txt`. HEAD `5508f70`, clean tree | `a-round-408/claims-start.txt`, `claims-start-stderr.txt` |
| A2 | `npm run typecheck` / `npm run lint` / `npx biome check` on the 3 patch files | rc 0 / rc 0 / rc 0 | `a-round-408/typecheck.log`, `lint.log`, `biome.log`, `rc.txt` |
| A3 | `npx vitest run $(cat b-round-407/sketch-logs/covering.txt)` | rc 0, **46 files, 911/911 passed**, 0 failed | `a-round-408/vitest.log`, `vitest.json` |
| A3 (L31) | slowest test vs its declared timeout | `render-budget.test.tsx` "does not re-render clips, overview bars…" **1988 ms / 15000 ms = 13.3 %** (B: 21.8 %). Every other test is ≤ 1916 ms, under 2500 ms, so at most 38 % even against the 5000 ms default. A grep over the 46 covering files finds no declared timeout under 5000 (only 15000 and 20000) and no `testTimeout` override. None is above 50 % | `vitest.json` |
| A4 | claims at end | rc 0, stderr empty. **Against planning**, only K2 (4), K5 (`no`), K6 (`1` + the l.4 string), K6b (8, pending 0), K7, K8, K9, K10 and K13 differ. **Against the sketch output**, only K1, K2, K6 and K6b differ, so K7–K10 and K13 are equal. K3 = 1298 rc 0; K4 protected rc 0, granted-protected 0 | `a-round-408/claims-end.txt`, `claims-end-vs-planning.diff`, `claims-end-vs-sketch.diff` |
| A5 | code-reviewer (4 files) | no Critical, High or Medium; 4 Lows (2 doc Lows fixed in doc 261, 2 test Lows not edited per the byte-for-byte ruling) | §4 |

**A ran no browser probes** (leaf probe, LANE-ACTIONS) and no mutants. Doc 261 cites those results from B's own sketch runs (`b-round-407/probe/`, `lane/`, `mutants/`). C rows 3–5 must run them on the working tree. `browserVerified` and `realVerified` are for C to set. A has not ticked any §6 C row.

## 4. Code-reviewer (real `code-reviewer` subagent, read-only, 4 files): no Critical, High or Medium; score 9/10
Stability, the 3 lists in lockstep (59 sorted names), the Lane's names (35 before and after), the rename's completeness, test soundness and the doc template were all confirmed.
- **Low, doc 261 l.20:** "every transitive dep is a store/empty-deps callback/actions key" was not literally true (`applyEdit`, `refuseEditDuringGesture`, `setRange`, `withNameBarHint`). **Fixed in doc 261:** it now says stores, refs and stable callbacks, with `collection.sources` as the only prop dep.
- **Low, doc 261 l.50:** "58 names" vs 59 keys. **Fixed in doc 261:** it now says 58 traced callback names (the new keys plus their transitive deps, not the key count) and cites `deps-trace.txt` with its full loop path. The same line's "every lane path" is narrowed to the paths AC8 actually exercises.
- **Low, test AC8 l.404–409:** `setTimeRange`, `setActiveTrack` and `setInsertMarker` are checked for identity only. This is the same as TL-R408-SK-L3, which was accepted by design. The patch file was not edited.
- **Low, test AC8 title:** it says "a pan commit", but the test calls `setTrackPan` and not the `commitTrackPan` gesture. The patch file was not edited (byte-for-byte ruling). New candidate for deferred_low_polish: **A-R408-REVIEW-AC8-PAN-TITLE**.
- Timing: the testing-section form rewrite of doc 261 ran while the reviewer was working, so it is not certain which doc version the reviewer read. The two doc fixes above came after the review. All doc edits are doc-only, so no code re-review was needed (L11 covers code). After the final edit, A re-checked the 7 headings (grep) and l.4 (byte check) itself. The end claims were re-run after them (A4 above reflects the final doc).
- **Architecture note (for B/root, not acted on):** Signal 3, the same region edited repeatedly. The `ArrangementActions` Pick (`ArrangementContext.tsx:~549`), the memo object (~4645) and its deps are three parallel 59-entry lists that every round edits in lockstep, kept consistent by a regex that parses the source. Reviewer's verdict: keep for this round. Proposal: a module-level `ACTION_KEYS` object checked with `satisfies` (no `as const`), the Pick derived from its keys, and AC7 importing the keys. This is TL-R403-SK-L1 without the assertion.

## 5. Known gaps
- The browser LANE-ACTIONS probe does not cover the library drop, video import or lane drag. They are covered by unit files in the covering set; the references are the same functions.
- The `active-track` probe step is vacuous: B-R408-PROBE-ACTIVE-TRACK-VACUOUS (Low). Its fix is in the e-ii probe.
- The full suite, build and verify were not run by A (speed rules); they are gate rows.

## 6. Exact next C checks
1. Row 1 SOURCE-SCOPE: `bash b-round-407/claims-408.sh` should equal `a-round-408/claims-end.txt` (only K1 may differ, if HEAD moved).
2. Row 5 first: the A3 set, then the mutants on a committed scratch at `/tmp/c408-scratch` with `OUT=<loop>/c-round-408/mutants`. Expect 5/5 RED and SCRATCH-STATUS 0 lines.
3. Row 4: `node b-round-407/probe/leaf-probe-408.mjs http://127.0.0.1:5173 <out>.json`. Lane should be `[0,12,4,4,0,0,0,4,4,4,4,4,8]`, and StudioWorkspace should equal `leaf-sketch-408.json`.
4. Row 3: `node b-round-407/lane/lane-actions-probe.mjs http://127.0.0.1:5173 <out>.json 1440x900` and `1280x720`. Warm `/studio-lab` first (L38).
5. Row 2 PATCH-IDENTITY (`git archive HEAD` scratch + patch, then `cmp`), row 6 AUTH, row 7 DOCS, row 8 end + `tools/l57-check.py`.

## 7. For B
- **Doc 261 TODO** lists e-ii, TL-R408-SK-L1/L2 (deferred_low_polish) and TL-R403-SK-L1. It also names B-R408-PROBE-ACTIVE-TRACK-VACUOUS under e-ii, which goes beyond the three items the task listed. That is information only, not a new finding.
- Architecture note: see §4 (ACTION_KEYS + `satisfies` proposal, TL-R403-SK-L1 variant). New Low candidate: A-R408-REVIEW-AC8-PAN-TITLE.

## Scope completed
§3 steps 1–4 of the task. A1, A2, A3 and A4 passed. A5 passed (no Medium+). Nothing from the backlog is marked complete.
