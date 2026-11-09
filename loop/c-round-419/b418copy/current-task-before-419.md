# Round 418: SYS-R416-PREVIEW-CONTROLLER — the library preview gets a request token, a deferred stream fallback and re-entrancy-safe media handlers (closes 7 Lows)

**Planned by:** B, at the round 417 → 418 planning, 2026-11-08 (`b-round-417.md`). The advisor was used after orientation. The round-417 task is archived as `tasks/round-417.md` [K13].

## Read first
- `lessons.md` in full. Most relevant here: L4, L10, L11, L22, L23, L29, L31, L37, L38, L49 (unmount clause), L51, L52, L56, L57, L58 (all clauses: review = dispatched, ordering matrix, `l58-check`), L59, L60.
- Primitives: `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-417/claims-418.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-417/claims-418-planning-output.txt` (stderr empty).
  - Sketch output on B's scratch: `b-round-417/claims-418-sketch-output.txt` (stderr empty).
  - Expected differences: `b-round-417/claims-418-planning-vs-sketch.diff` (K1 is the scratch commit; K2 is the scratch's 3 ` M` lines; K5 is `no` because the patch is already in; K9/K10 are the sketch counts).
- **Sketch review (L58):** `b-round-417/sketch-review.md` names the dispatched sha256 and holds the event-kind matrix and the verdict. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `061068d`, clean tree
- **Gate 417 is `published`** at `061068d` [K7]. HEAD is `061068d…` [K1] and the tree is clean (K2 `total 0`).
- **Frozen:** `b-round-417/r418-frozen-sha256.txt` has **1,314** entries: every tracked file except the 3 granted source/test files. `sha256sum -c` rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `061068d` at A1 (root published in between), A re-runs the claims and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 417 passed:** C PASS, `browserVerified` true, gate 417 published `061068d` (D-29z1454). SYS-CLOCK-DETERMINISM is done.
- **Next in the recorded order (D-29z1453, D-29z1457): SYS-R416-PREVIEW-CONTROLLER.** It is the L46 default of ARCH-CHECKPOINT-PREVIEW-AFTER-13C (root request `b-round-393/root-request-arch-checkpoint-preview.md`, unanswered; B searched the loop folder for an answer on 2026-11-08 and found none).
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **Schedule:** REGRESSION is not due (`regression-last.json` 2026-11-07, due on or after 2026-11-10) [K8]. The next RETRO is round 431.
- **C findings from round 417 (both Low, `B spec`), ruled in D-29z1455:**
  - **C-R417-L58-SKETCH-REVIEW-MISSING:** fixed by this planning. `b-round-417/sketch-review.md` exists and K19 runs `l58-check`. C checks it in row 1; it closes then.
  - **C-R417-BW5-HOIST-FRAGILE / A-R417-REVIEW-M1:** the reviewer's Medium is **downgraded to Low with a reason**. It is latent, not present: it needs a hoist refactor and a full-build regression together, and MU-BW5-FULLBUILD is red on the published tree. C rated it Low independently. It goes to `deferred_low_polish` and is fixed when a round owns `tempo-window.test.ts`.

## 1. What the code does today (all tagged; K9 counts the HEAD lines)
- `ArrangementContext.tsx` supersedes preview requests by **source id**: `previewRequestRef: string | null` [K9 requestRef = 7 lines]. Five problems follow from that and from the player:
  1. **A-R392-REVIEW-L3:** stop, then a re-preview of the same id during its decode, starts once with the **first** call's offset.
  2. **A-R392-REVIEW-L2:** the decode branch calls `stopLibraryPreview()` **before** the null-owner check [K9 stop-before-owner = 1], so a stale call (its collection has no live controller) stops the live preview and then only writes `sourceNotLoaded`.
  3. **GATE393-L3 / A-R394-REVIEW-L3:** the stream error callback calls `startLibraryPreviewRef.current(sourceId, atSeconds)` **synchronously** [K9 sync-fallback = 1]. It runs inside the media `error` handler, and on a synchronous `src`/`play()` throw it runs re-entrantly inside the outer `startLibraryPreview` call.
- `preview.client.ts`:
  4. **A-R395-REVIEW-L1:** the same-url seek branch calls `active.restartArmedStall()` and `active.fail()` through the mutable `active` [K9 seek-active = 1]. A synchronous `pause` inside the `currentTime` setter nulls `active`, and then those calls throw.
  5. **GATE395-L1:** `handleError` reads `element.currentTime` unguarded [K9 raw-read = 1], and the stall watchdog reads it a second time in the same tick [K9 stall-raw-read = 1]. A throwing getter escapes.
- **A-R393-REVIEW-L3:** there is no row proving that a stream with a different URL releases the previous element, or that a stream start cancels a pending decode request.

## 2. Rulings (B, D-29z1456; details in `b-round-417/sketch-review.md`)
1. **One per-request token.** `previewRequestRef` becomes `previewTokenRef` (a counter). The token is bumped by:
   - the stream start;
   - `stopLibraryPreview` (and so by the decode start, which calls it first);
   - the buffer start.

   The decode settle and the stream fallback act only while their captured token is current.
2. **The stream fallback is deferred with `queueMicrotask`.** The remembered-fallback set is still written synchronously, even when the request was superseded: the media error is real.
   - **Why a microtask:** it is the smallest deferral. It leaves the media handler and the outer start call first, then runs before any later task, so the user-visible order (error → Loading text → decode → buffer plays) is unchanged in the browser (B row compare, `b-round-417/probe/compare-head-vs-sketch.txt`).
3. **Null-owner decode call:** the refusal (`sourceNotLoaded`) is written first, and the live preview is left untouched.
4. **Same-url seek re-targets the error handler** (`setErrorHandler`), so the stream's error and stall still fall back with the newest request's token.
   - B's browser pre-check found this regression in the first sketch (R1b: a seek, then a stall, gave no fallback) and fixed it before dispatch. PC12 and MU-SEEK-KEEPS-OLD-HANDLER pin it.
5. **The player reads the time through `readTime`.** A throwing getter returns the request's start offset, and the watchdog reads once per tick. The seek branch uses a local `const`.
6. **The provider unmount does not bump the token.** MU-UNMOUNT-NO-BUMP stayed green: the controller abort on unmount already drops the decode. PC7 is a lock row (green at HEAD and under every mutant), not a fix row.
7. **No user-visible change.** Every browser cell equals HEAD (row 4). The public hook surface (`startLibraryPreview`, `stopLibraryPreview`, `libraryPreviewSourceId`, `getLibraryPreviewOffset`) and `LibraryPreviewPlayer`'s public methods are unchanged; `setErrorHandler` lives on the internal `ActiveStreamPreview` only.
8. **Changed existing rows:** PS8, PS13 and PS27 wrap the error dispatch in `await act(async () => …)` instead of `act(() => …)`. That change is required by ruling 2, and every assertion is kept. Every other existing `it()` body is byte-identical to HEAD.
9. **Doc:** `269-sys-preview-controller.md` [K6: 268 is the last].

## 3. What A changes (sketch `b-round-417/sketch-418.patch.txt`, sha256 `146bce6c…` [K11]; generators `b-round-417/make-sketch-src.py` and `make-sketch-test.py`)
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-417/sketch-418.patch.txt`, then `git apply` the same file (3 files). **Do not edit those three files afterwards.** If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11); do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/269-sys-preview-controller.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** Completed (C round 418 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings in order (L26).
   - Content: rulings 1–9; the 7 closed ids, each with its row; the R1b sketch regression and its fix; a mutant block that copies the 12 lines of `b-round-417/mutants/summary.txt` byte for byte; a Mermaid sequence of error → microtask → token check → decode → buffer.
   - It cites only rows and files that exist (L26).
4. Write `a-round-418.md` as you go: changed files, each check with its rc and log path (`a-round-418/`), reviewer findings, and a For B section with any Architecture note.

## 4. Grants (`b-round-417/grants-418.txt`, 4 paths)
- `app/contexts/ArrangementContext.tsx` (sketch only)
- `app/lib/arrangement/preview.client.ts` (sketch only)
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx` (sketch only)
- `docs/implementation/2026/quarter-IV/269-sys-preview-controller.md` (new, whole)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 3 ` M` lines and 1 `??` line.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-417/claims-418.sh` at start | Equals `claims-418-planning-output.txt`; stderr empty |
| A2 | `npx vitest run app/lib/arrangement/__tests__/library-preview-stream.test.tsx app/lib/arrangement/__tests__/failed-source-refusal.test.tsx app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx app/lib/arrangement/__tests__/actions-context.test.tsx app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx` | rc 0; **5 files, 117/117** (HEAD 105 + PC1–PC12). B ran this exact command on the sketch: 117/117 (`b-round-417/precheck-a2.log`). The stream file alone runs 40/40 in about 1.3 s, and loaded with 2 busy loops it is also 40/40 (`b-round-417/precheck-loaded.log`) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`b-round-417/precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info, the same as HEAD (`b-round-417/precheck-lint.log`) |
| A4 | `npx biome check` on the 3 granted code files | rc 0, no fixes (`b-round-417/precheck-biome3.log`) |
| A5 | Claims at end | Differs from the planning output only in K2 (`1 ?? 3 M total 4`), K5 (`no`), K6 (doc 269 l.4), K9 and K10 (equal to the lines in `claims-418-sketch-output.txt`). K3 1,314 rc 0, K4 rc 0, K2b 0 |
| A6 | `code-reviewer` on the diff and doc 269 (4 files) | No Critical/High/Medium in the sketch logic (otherwise STOP, L11). Rulings 1–9 are not new findings. Fix doc findings in the doc |

## 6. C's acceptance
**Before hand-off:** write `c-round-418.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-417/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-418.json c-round-418/l57-check.txt`.

**Order (L59):** row 3 (mutants), then rows 4, 5 and 6 (browser), then the rest. Write `c-round-418/progress.json` after every row. Never run vitest while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation, **stderr is empty**, and K19 prints `L58 OK` (this closes C-R417-L58-SKETCH-REVIEW-MISSING). K14 lists all 9 ids with a status, none `NOT-FOUND`. Status = the 4 granted paths. Frozen 1,314 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-418.patch.txt` to a `git archive HEAD` scratch and `cmp` the 3 files against the working tree: identical. A2's command gives 117/117. `git diff -U0` on the test file touches only the three PS8/PS13/PS27 `act` lines and the appended block (PC1–PC12 and their fixtures) |
| 3 | **MUTANTS** | The scratch base must be **HEAD, with nothing applied**: `git archive HEAD \| tar -x -C /tmp/c418-scratch`, symlink `node_modules`, then `git init && git add -A && git commit`. Copy `b-round-417` to `c-round-418/b417copy/` (with `sketch-418.patch.txt` and `mutants/run.py`) and run `python3 -I c-round-418/b417copy/mutants/run.py /tmp/c418-scratch $PWD/c-round-418/b417copy`. The script asserts the HEAD base, applies the sketch itself, and writes `summary.txt` into `<arg2>/mutants/`. Never write into `b-round-417/`. **Pass = the same 12 lines as B's `summary.txt`:** SKETCH all green; MU-HEAD-SRC red PC1, PC3, PC4, PC5, PC6, PC8, PC9, PC10; and each single mutant red exactly on its rows (table in section 7). Then add **one C-own loaded replicate**: run the stream file with 2 × `node -e "for(;;){}"` in the background, 40/40 (L37) |
| 4 | **PREVIEW-BROWSER (behaviour unchanged)** | Real Chromium, `/studio-lab`, **1440×900 and 1280×720**, fresh context per row. Copy `b-round-417/probe/rows-418.mjs` and `compare.py` to `c-round-418/probe/`. Copy B's HEAD results, `b-round-417/probe/head/rows-*.json`, to `c-round-418/probe/head/`. Then run `OUT=<abs>/c-round-418/probe/sketch node c-round-418/probe/rows-418.mjs <row> 1440x900,1280x720` from `store/` for R1 (which also runs R1b and R10), R5, R6, R7 and R9. Then run `python3 -I c-round-418/probe/compare.py c-round-418/probe`. **Pass: `ALL EQUAL` over 14 cells.** The rows cover stall fallback (R1), seek-then-stall fallback (R1b, the regression B fixed), error fallback and re-preview (R5), stop (R6), Space stops the preview (R7), a decode pending, then another preview (R9), and stream, then buffer (R10). Warm `/studio-lab` once in a browser before the first timed row (L38); a cold first load that cannot find the status element is environment-invalid and is retried |
| 5 | **PLAY-STOP SMOKE** (browser, both viewports) | With a demo clip: Space plays; the position advances (≥ 1 s of wallclock ≈ ≥ 0.9 s of position, L48); Space stops and the position is frozen for 500 ms; 0 page errors (ignore the documented cloud cart and connection errors) |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy the auth probe from `c-round-416/scripts/`. Demo `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` without auth → 401. **BLOCKED:** the fake-bearer path (backend unavailable in the cloud) |
| 7 | **DOC** | Doc 269 l.4 is byte-exact `**სტატუსი:** Completed (C round 418 PASS)`; the 7 TEMPLATE headings are in order; its mutant block equals the 12 lines of `b-round-417/mutants/summary.txt` byte for byte; the 7 closed ids each name an existing PC row; every row id it cites exists. No other doc differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end; end claims equal start claims; `git diff HEAD --stat` lists only the 3 granted files; `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's sketch full run: `b-round-417/precheck-full.log`, 264 files, 3934/3934 [K18] |

**Retries (rows 4–6):** a cold-server first load or a port in use is an environment problem (L38). Retry at most twice; it is never a FAIL.

## 7. The new rows and their mutants (`b-round-417/mutants/run.py`; logs in `b-round-417/mutants/`)
| Row | Closes | What it proves | Red under |
|---|---|---|---|
| PC1 | A-R392-REVIEW-L3 | stop, then a re-preview of the same source during its decode, starts once at the second offset (2, not 5) | MU-HEAD-SRC, MU-DECODE-NO-TOKEN-CHECK |
| PC2 | A-R393-REVIEW-L3 | a stream start supersedes a pending decode preview of another source (the decoded buffer stays cached and never starts) | MU-STREAM-NO-TOKEN, MU-DECODE-NO-TOKEN-CHECK |
| PC3 | A-R392-REVIEW-L2 | a stale null-owner call writes its refusal and leaves the live stream playing | MU-HEAD-SRC, MU-STOP-BEFORE-OWNER |
| PC4 | GATE393-L3 | the fallback starts after the media handler returns, never inside it | MU-HEAD-SRC, MU-SYNC-FALLBACK |
| PC5 | A-R394-REVIEW-L3 | a synchronous `src` throw inside the start call falls back once, after the call returns | MU-HEAD-SRC, MU-SYNC-FALLBACK |
| PC6 | (ruling 2) | a stop between the error and its deferred fallback wins; the fallback is still remembered | MU-HEAD-SRC, MU-SYNC-FALLBACK, MU-FALLBACK-NO-TOKEN-CHECK |
| PC7 | (ruling 6, lock) | unmount during a decode preview starts nothing | none (lock row) |
| PC8 | A-R395-REVIEW-L1 | a `pause` fired inside a same-url seek ends the preview once and throws nothing | MU-HEAD-SRC, MU-SEEK-READS-ACTIVE |
| PC9 | GATE395-L1 | the watchdog reads the time once per tick; a throwing read is a stream error at the start offset | MU-HEAD-SRC, MU-STALL-READS-TWICE |
| PC10 | GATE395-L1 | a media error whose time read throws still reports one error at the start offset | MU-HEAD-SRC, MU-ERROR-RAW-READ |
| PC11 | A-R393-REVIEW-L3 | a different URL releases the previous element before the new one plays | MU-NEW-URL-NO-STOP |
| PC12 | (ruling 4) | a same-url seek re-targets the error: a later error still falls back, at the seek time | MU-SEEK-KEEPS-OLD-HANDLER |

**Neighbouring behaviour that could break:**
- the other 28 PS rows (row 2);
- the decode/eviction suites `decoded-buffer-eviction-ui` (EV12: a stale preview call from before a collection change decodes nothing) and `failed-source-refusal` (A2);
- Space and Play stopping a preview (R7, PS9, PS11);
- the stall watchdog timing (PS16–PS19, PS24, PS25);
- the stream element release on unmount (PS10).

**Ableton conformance:** does not apply. This is a behaviour-preserving fix round, and the preview-versus-transport question stays `awaiting_user` (Q-PREVIEW-STOPS-TRANSPORT). **Reference-first / `product-designer` / screen budget:** N/A (no user-visible change; row 4 proves equality with HEAD).
