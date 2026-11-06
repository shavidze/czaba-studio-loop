# Round 373: PERF-11c-ii-b. The committed status leaves the workspace context and moves into the status store

**Planned by:** B, at the round 372 → 373 planning, 2026-11-06 (`b-round-372.md`).

**Decisions** (`backlog.json` v337 → v338, `decisions_log_b`):
- **D-29z1231:** round 372 (PERF-11c-ii-a) is accepted from C's evidence (`c-round-372.json` PASS, `browserVerified` and `realVerified` true, 0 bugs). Gate 372 published `4900b83`, which is the new baseline.
- **D-29z1232:** the round-372 Lows (A's reviewer and gate 372) are deferred, and the gate-372 architecture note is recorded as a signal.
- **D-29z1233:** ARCH-CHECKPOINT-PERF11C-STATUS-STORE has no root answer at this planning. Option A applies, as the backlog records:
  - the committed entry joins the existing `status-preview-store.ts`;
  - B rules the reducer and ordering questions in §1.
- **D-29z1234:** this task, and the order after it (§6).

**What this round does (SIG-R360, A-R327-ARCH-STATUS-ONE-SOURCE):** today one `setStatus` changes the workspace context value, so every `useArrangement()` consumer re-renders. After this round, a status write renders only the status line (`ArrangementStatusTextInner`).
- What the user sees is unchanged: the same texts, the same order and the same screen-reader announcements.

**Read first:**
- `lessons.md`. A reads 11, 23, 28, 49, 51 and 58. C also reads 22, 29, 37, 56, 57, 59 and 60.
- `b-round-372/sketch.patch.txt` (the dispatched sketch) and `b-round-372/sketch-review.md`.
- Primitives:
  - `AUDIO_ARCHITECTURE.md` (Studio context);
  - `REACT_CONTEXT.md`;
  - `AGENT_DISCOVERABLE_CODE.md` (new exports `getStatus`, `ArrangementCommittedStatus`, `commitStatus`);
  - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§8).

**Not applicable:** reference-first, `product-designer`, the YouTube request and the Ableton conformance check. This is a performance refactor with no visible change ("pure performance, refactor", 2026-10-27 rule).

**Screen budget:** nothing visible is added or removed.

## Baseline
- HEAD is `4900b83`, published by gate 372 [K1]. The tree is clean [K2].
- Protected files: all pass their sha check [K14]. No grant is a protected file.
- Frozen: every tracked file except the grants is listed in `b-round-372/r373-frozen-sha256.txt` (1,256 entries) [K15].
- REGRESSION: `regression-last.json` is 2026-11-05 [K24]. It is due at the first planning on or after 2026-11-08, so not this round.
- **At HEAD:**
  - `ArrangementContextValue` has the three fields `status`, `statusSequence` and `statusKey` [K3], with 6 value and deps lines [K4].
  - The provider derives them from a status `useReducer` with `dispatchStatus` [K5]. Its reducer reads `gestureCountRef` and runs function updaters at render time.
  - Two layout effects, through `committedStatusTextRef` and `adoptedPreviewSequenceRef`, mirror the committed text and clear an adopted preview [K6].
  - The store has no committed entry [K7], and the value has no `getStatus` [K8].
  - StudioWorkspace reads status through a destructure (2 lines), `current.status` (2) and `ArrangementStatusText` props (1) [K9]. MarkerRow reads it through a destructure (1) [K10].
  - There are 8 function status updaters in app code (SWEEP, roots `app/**` and `perf/**`) [K11].
  - In `playFrom`'s start branch, `startPlaybackAt(target, 'insert-marker');` is the last call [K12].
  - render-budget and selection-wrappers-render have 4 and 2 positive controls that use a status write as their trigger [K13].

## 0. B's pre-check (L23, L30, L37, L58)
| What | Command | Result |
|---|---|---|
| Sketch typecheck, Biome | `npx tsc --noEmit -p .`; `npx biome check` on the 7 code files | rc 0 and rc 0 [K19] |
| Full suite on the sketch (L23) | `npx vitest run` | 252 files and 3,703 tests pass [K18]. The first version had 6 red (`b-round-372/precheck-full-v1.log`); §1 items 2 and 6 rule them |
| Perf on the sketch (L58) | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on the sketch copy (production build) | 95 asserts pass, 0 fail. `interact.play.start-components` and `stop-components` are 11/11. Fade release-commits are 2; trim, move, lane, group and video release-commits are 1 [K20] (`b-round-372/perf-sketch.log`, `perf-sketch-results/latest-interactions.json`) |
| Other test roots (L30) | `perf/lib` imports no changed module, and `e2e/` reads no status field | Not touched |
| Mutants (`b-round-372/mutants/`) | see §4 | 6 of 6 red [K22] |
| Assertion counts | `expect(`/`it(` per changed test file, HEAD vs sketch | render-budget 125 → 129 / 13 → 13; selection-wrappers-render 34 → 37 / 7 → 7 [K23] |
| Timeout headroom (L31) | the changed tests' times in `precheck-full.log`, against their declared timeouts | Play → Stop → Play 3,194 ms of 15,000 (21 %); start hold 1,495 of 15,000; SS8a 2,414 of 20,000; GH1 1,392 of 20,000; status-lifetime file 6.3 s for 21 tests |
| Patch equals sketch | the patch applied to a fresh `git archive 4900b83`, then `sha256sum -c sketch-files-sha256.txt` | 7/7 OK |
| Consults | `tech-lead` on the frozen sketch (sha `dddd2145…49b1`, ordering matrix); `performance-optimizer`'s round-371 inputs, now measured | `b-round-372/sketch-review.md` |

## 1. What A changes (grants: exactly these files, `b-round-372/grants-373.txt`)
A applies `b-round-372/sketch.patch.txt` with `patch -p1` from `store/`, after checking its sha256 against `b-round-372/sketch-dispatched.sha256` [K21]. A makes no other edit to the 7 code files (row SKETCH-EQUAL).

1. **`app/lib/arrangement/status-preview-store.ts`:**
   - new `ArrangementCommittedStatus { text; sequence; key }`;
   - new state `committed` (initially the loading copy, `sequence` 0, `key` `'0'`) and `adoptedPreviewSequence`;
   - new action `commitStatus(update, gestureActive)`. In one `set`, it:
     1. adopts a pending preview (key `preview-<n>`, sequence +1);
     2. reduces the update with `reduceArrangementStatus`;
     3. clears the adopted preview.

     An unchanged write returns the same `state`, so no subscriber is notified.
2. **`app/contexts/ArrangementContext.tsx`:**
   - Removed: the status `useReducer`, `dispatchStatus`, `flushStatusPreview`, `committedStatusTextRef`, `adoptedPreviewSequenceRef` and the two layout effects.
   - `setStatus` calls `commitStatus(update, gestureCountRef.current > 0)`. It then writes `lastNonRefusalStatusRef`: the adopted preview text first, then the committed text, each only when it is not a refusal. The settle write in the collection-load path stays.
   - `previewStatus` reads the store's committed text for its same-text guard.
   - New stable getter: `getStatus()`.
   - The three fields leave the interface, the value and the deps.
   - `playFrom`'s start branch calls `placeInsertMarker(target)` **after** `startPlaybackAt` (ruling R-CALLTIME).
3. **`app/components/arrangement/StudioWorkspace.tsx`:**
   - `ArrangementStatusTextInner` takes no props and subscribes to `preview` and `committed` itself (`useArrangementStatusPreview`).
   - The `status`/`statusKey` destructure is removed.
   - The two `current.status` reads become `current.getStatus()`.
4. **`app/components/arrangement/ArrangementMarkerRow.tsx`:** the `status` destructure and its deps entry become `getStatus`, and the 3 reads become `getStatus()`.
5. **`app/lib/arrangement/__tests__/helpers/workspace-probe.ts`:** the `useWorkspaceStatus()` body subscribes to `state.committed` only (tech-lead High, round 371).
6. **`render-budget.test.tsx` and `selection-wrappers-render.test.tsx`:**
   - The five positive controls that used a status write as their value-changing trigger now use `resetExportState()`, which always writes a new `exportState` object.
   - RB-MEMO3 and GH1 add the new asserts: a status write renders `ArrangementStatusTextInner` (RB-MEMO3: exactly 2 for 2 writes), `StudioWorkspace` 0 times (RB-MEMO3) and `ArrangementTransport` 0 times (GH1).
   - SS8a keeps its status-text assert.
   - No assertion is removed; the counts only grow (row ASSERT-COUNT).
7. **Docs:**
   - `docs/implementation/2026/quarter-IV/239-perf-status-probe-migration.md`: l.4 becomes exactly `**სტატუსი:** Completed (stage 1 of 2; stage 2 in doc 240; C round 373 PASS)`.
   - `docs/implementation/2026/quarter-IV/240-perf-status-store.md` (new; no 240 exists [K17]):
     - Georgian, with the TEMPLATE headings in order (L26);
     - l.4 exactly `**სტატუსი:** Completed (C round 373 PASS)`;
     - it records the call-time ruling, the playFrom reorder, the trigger change, the §0 perf numbers and the 6 mutants;
     - it names only tests and files that exist.

**Rulings (L4, L49, L51):**
- **R-CALLTIME (a behaviour delta, ruled):** `setStatus` now runs function updaters and reads the gesture flag when it is called, not at the next render.
  - The SWEEP of the 8 function updaters [K11] found one handler that writes, after the call, a ref an updater reads: `playFrom`, which set `isPlayingRef` after the marker write. The reorder fixes it (LT12).
  - The full suite, including status-lifetime LT1–LT21, pending-status and gesture-guard, passes on the sketch.
  - Any other same-handler sequence whose final text differs from HEAD is a bug, not an accepted delta.
- **R-PREVIEW-GUARD:** `previewStatus` compares with the store's committed text. That text is fresher than HEAD's layout-effect ref, so a preview of the text just committed in the same handler is skipped. The shown text is the same, because HEAD would have adopted that preview and committed the same text. DP15–DP18 pass on the sketch.
- **TL-R372-M1 (Medium from the sketch review, ruled):** when a non-refusal string, a refusal and a release all happen in one batch, the sketch restores the in-batch non-refusal text; HEAD restored the text from before the batch.
  - Accepted (D-29z1234): this matches S5b's contract, and no production handler does all three in one batch (tech-lead).
  - The S5b-same-act and CG→GR-same-act rows are inputs to PERF-11c-iii, not rows of this round.
- **R-KEY:** on adoption the committed key stays `preview-<n>`, so the status `<span>` is not remounted and is not re-announced. MU-ADOPT-KEY-SEQUENCE proves that the guarding rows can fail.
- **"No assertion lost" wins** over "tests unchanged". A replaced trigger is allowed only with a not-lower `expect(` count.
- **STOP (L11):** a red covering file, a covering test above 50 % of its declared timeout, a hunk that does not apply, or any need to touch a file outside the grants.

**Behaviour that must not change (neighbour risk):**
- every status text and its order (status-lifetime, pending-status, gesture-guard, status-announcement-ui, drag-preview-render);
- the release commits of fade, trim, move, lane and group drags;
- the Play/Stop component counts;
- the auth guard.

## 2. A: checks (speed rules)
- Run `npm run typecheck` and `npm run lint`.
- Run `npx biome check` on the 7 code files.
- Run `xargs -a ../tmp/studio-real-loop/b-round-372/covering-373.txt npx vitest run` from `store/`. That is 136 files: every test that imports the context, StudioWorkspace, MarkerRow, the store or the probe [K26].
- Ask the code-reviewer once (7 code files and 2 docs), and send any later edit back to it (L11).

## 3. C: what to verify
C writes `c-round-373.md` and `c-round-373.json` as it goes, with **all L57 fields**:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` for every finding;
- `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (= `b-round-372/mutants/`), `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`.

Then `python3 -I tools/l57-check.py c-round-373.json c-round-373/l57-check.txt` must exit 0. Write `c-round-373/progress.json` after every row (L59). Destructive commands and copies stay under `c-round-373/` (L60).

**Copying the tree for a mutant or perf run:** use `cp -a` or `rsync`. Never use `git archive` into a fresh repository with `git add -A`: `public/middle-east.mp3` is tracked but matches `.gitignore`. B's first two MU-B runs lost it that way and were invalid (`b-round-372/perf-mu-b-on-sketch-invalid-missing-mp3.log`).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: `git status --short --untracked-files=all` lists only the §1 files (8 modified, 1 new doc = 9 lines). From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-372/r373-frozen-sha256.txt` gives rc 0. The protected sha check (`b-round-318/protected-sha256.txt`) gives rc 0 | Nothing outside the grants changed |
| **CLAIMS** | First (L56), from the loop root: `bash b-round-372/claims-373.sh`. Compare with `b-round-372/claims-373-output.txt` (HEAD) and `b-round-372/claims-373-sketch-output.txt` (the sketch) | <ul><li>K3–K13 and K16 equal the sketch output.</li><li>K2 reads 9.</li><li>K17 reads `doc 240 files: 1` and doc 239's new l.4.</li><li>Every other line equals the HEAD output, K15 reads 0 failing lines, and there is no `MISSING`</li></ul> |
| **SKETCH-EQUAL** | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-372/sketch-files-sha256.txt` | rc 0, all 7 OK |
| **ASSERT-COUNT** | The `expect(` and `^\s*(it\|test)\(` counts on A's tree vs `git show HEAD:` for render-budget, selection-wrappers-render and status-lifetime | Not lower anywhere (B: `b-round-372/expect-counts-373.txt`). A lower count is a Medium bug |
| **UNIT** | The 136 files of `covering-373.txt`, plus `pending-status.test.tsx` and `status-lifetime.test.tsx` with `--sequence.shuffle --sequence.seed=42` | All pass. No covering test above 50 % of its declared timeout |
| **MUTANTS-TREE** | On a `cp -a` copy of A's tree under `c-round-373/` (it must be a git work tree), run `TREE=<copy> OUT=<abs path>/c-round-373/mutants bash b-round-372/mutants/run-all-373.sh`. It holds the exact old/new strings B ran, one mutant at a time, through `run-mutant.sh`. Run the mutants one after another; no perf run in parallel | Each is red with the same failing ids as `b-round-372/mutants/mutant-<id>.log` (2, 3, 1, 16, 1 and 11). Record each as `mutantRedOnTree` |
| **PERF-INTERACT** | `npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` on A's tree (a `cp -a` copy, or `store/` itself while nothing else holds port 5188) | <ul><li>Every assert passes.</li><li>`interact.play.start-components` and `stop-components` are ≤ 11.</li><li>`interact.drag.*.release-commits` equal B's sketch run: fade 2, the rest 1.</li><li>The range rows are recorded as 0</li></ul> |
| **MU-B-RECORD** | **Record only:** apply `b-round-359/mutants/mu-b.diff.txt` (it adds `setStatus` calls 100 ms after play and stop) to a copy of A's tree, and run the same perf spec | `record`: `interact.play.start-components`. At round 359's HEAD this measured 99, against 11 without the mutant. B measured 12 (stop 12) on the sketch, with fade release-commits 4 because the mutant adds two timed writes to the fade release (`b-round-372/perf-mu-b-on-sketch.log`). It is not a FAIL criterion |
| **STATUS-BROWSER (browser)** | After `Demo collection ready` (L48), at 1440×900 and 1280×720, run each step on a `cp -a` copy of HEAD served on another port, and on A's tree: <ul><li>(a) while stopped, click the bars ruler's top strip at about 6 s (the strip calls `playFrom` through `playFromRuler` [K28]); read the status; then Stop and read it again;</li><li>(b) add `Bass` with Enter, drag its fade-in handle about 40 px, and release: read the status during the drag and after, and the Undo title;</li><li>(c) start a clip name-bar drag, press Ctrl+Z during it, then release: read the status during and after;</li><li>(d) select the clip at time 0 and hold ArrowLeft (key repeat ≥ 5): count `childList` mutations on `#arrangement-status` with a `MutationObserver`;</li><li>(e) during step (b), count `childList` mutations on `#arrangement-status` from pointerup to 500 ms later</li></ul> | Every text, Undo title and mutation count on A's tree equals HEAD's for the same step, at both viewports. That equality is the only PASS criterion, and a difference is a bug of this round. `record — not probed at baseline:` text (a) after the click is expected to be the LT12 form `Insert marker at <t> — playback continues. Stop, then Space plays from here.` |
| **G373-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720. Warm up first (L38) | <ul><li>`/studio-lab` shows the workspace and the demo state, and `localStorage.auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`.</li><li>`/api/studio-token` returns 401 with no token. With a fake bearer it returns 403 with the mock; otherwise a fail-closed 500, listed under `blocked`.</li><li>No token appears in any body</li></ul> |
| **STUDIO-SMOKE-373 (browser)** | At both viewports: <ul><li>add `Bass` with Enter;</li><li>Play: the position is ≥ 00:01.000 after 1.5 s;</li><li>drag the clip by its name bar to the lane below, then Ctrl+Z (the Undo title reads "Undo: Move to track — <lane>");</li><li>export a WAV</li></ul> | As stated. The WAV is RIFF/WAVE, 48 kHz, with peak > 0. The status text after the move and after the Undo equals round 372's record (`c-round-372.json` `recorded`) |
| **DOCS** | Doc 239 l.4 and doc 240 l.4, byte for byte (§1 item 7); the TEMPLATE headings as an in-order subsequence; every test and file they name exists (L26). `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits | As stated |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if STATUS-BROWSER, G373-AUTH and STUDIO-SMOKE-373 ran at both viewports.

## 4. Mutants (`b-round-372/mutants/`, run on the 136 covering files)
| Mutant | File: old → new | Red on the sketch |
|---|---|---|
| MU-STATUS-ON-VALUE | ArrangementContext, the `getStatus` `useCallback` → `const mutantCommitted = useStore(statusPreviewStore, (state) => state.committed); const getStatus = useCallback(() => mutantCommitted.text, [mutantCommitted]);` (status back on the value) | RB-MEMO3, GH1 (2) |
| MU-ADOPT-KEY-SEQUENCE | store, `key: statusPreviewKey(pending),` → `key: String(state.committed.sequence + 1),` | DP11, DP17, DP18 (3) |
| MU-PLAYFROM-ORDER | ArrangementContext: `placeInsertMarker(target)` moves back before `seekTo`/`startPlaybackAt` | LT12 (1) |
| MU-NO-PREVIEW-CLEAR | store: the adopted-preview clear → `const preview = state.preview;` | 16 (clip-fades-ui FU2/FU3, clip-envelope-ui EU6, drag-preview-render DP12–DP16, and others) |
| MU-GESTURE-FLAG-OFF | ArrangementContext, `commitStatus(update, gestureCountRef.current > 0)` → `commitStatus(update, false)` | SU5 (1) |
| MU-NO-NONREFUSAL-WRITE | ArrangementContext: the post-commit `lastNonRefusalStatusRef` write → `void committed;` | 11 (pending-status S1, S1-same-act, S2, S4, S5, S5b, S7, S8; SU4, SU5; TU13) |

The first form of MU-STATUS-ON-VALUE added a value field without a deps entry and was vacuous. It is kept as `mutant-MU-STATUS-ON-VALUE-deps-unchanged-vacuous.log`; only the form above counts.

## 5. Neighbour risk
- **Two status paths:** there are none after this round. The value no longer carries status, so a test that reads status off the context does not compile (K3 = 0).
- **Render totals** may only drop. RS4, PV1–PV4, `fader-pointer-preview` and `clip-gain-pointer-preview` pass on the sketch.
- **SSR:** the store is created in `useState` with the same loading copy on the server and the client. zustand's `useStore` takes its server snapshot from the initial state.
- **Same-act gesture rows** (S1-same-act, S3-same-act) pass on the sketch with the call-time flag.

## 6. Order after this round (D-29z1234)
1. If the round-374 planning falls on or after 2026-11-08, REGRESSION goes first.
2. PERF-11c-iii: the remaining `useArrangement()` leaf consumers, plus PERF2-FIRST-FRAME-LONGTASK and B-R370-HOOK-ERROR-NAMES.
3. PERF-11b, if root or Saba answers.
4. PERF-12…15, then SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
5. STEM-LANES, then SYS-1…3.
6. STORE-2b…5, then REVIEW-RECOMMENDATIONS and T12-ADVANCED.
7. The phase-2 entries, under the skip rule.

RETRO is due at about round 384, or at the end of STUDIO-PERFORMANCE.

## 7. Root notes
- ARCH-CHECKPOINT-PERF11C-STATUS-STORE has had no answer, so B applied option A (D-29z1233). An answer that arrives later becomes a follow-up input, not a revert.
- The open requests are unchanged:
  - ROOT-REQ-PERF11B-FIREBASE-LAZY;
  - ARCH-CHECKPOINT-PERF9-STEM-CACHE;
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - ROOT-REQ-B-RETRO-CONSULTS.
- After C PASS, this round is ready for the gate: 7 code files and 2 docs.

## 8. Claims (L29 + L56)
Run `bash b-round-372/claims-373.sh` from the loop root. The output at HEAD is `b-round-372/claims-373-output.txt`; on the sketch it is `b-round-372/claims-373-sketch-output.txt`.

| Tag | Claim |
|---|---|
| K1 | gate 372 published `4900b83` |
| K2 | the status line count |
| K3 | the 3 status fields on `ArrangementContextValue` |
| K4 | the value and deps shorthand lines |
| K5 | the status `useReducer`, its import, and `dispatchStatus` |
| K6 | the layout-effect refs |
| K7 | the store's `commitStatus` and `committed` |
| K8 | the `getStatus` getter in the interface |
| K9 | the StudioWorkspace status readers |
| K10 | the MarkerRow status readers |
| K11 | SWEEP: the function status updaters in `app/**` and `perf/**` |
| K12 | the line after `startPlaybackAt(target, 'insert-marker');` |
| K13 | the status-write positive controls per file |
| K14 | the protected sha check |
| K15 | the frozen list check |
| K16 | the 7 granted code files equal B's sketch |
| K17 | the doc-240 file count, and doc 239 l.4 |
| K18 | the full suite on the sketch |
| K19 | the sketch typecheck and Biome |
| K20 | perf on the sketch |
| K21 | the patch sha equals the dispatched sha |
| K22 | the mutants' red counts |
| K23 | the `expect(`/`it(` counts |
| K24 | the regression-last date and the lessons line count |
| K25 | the round-372 archive sha |
| K26 | the covering file count |
| K27 | every cited artifact exists |
| K28 | the ruler strip reaches `playFrom` (`playFromRuler`, `onPlayFrom`, ArrangementTempoRow) |
