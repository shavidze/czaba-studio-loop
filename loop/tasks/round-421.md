# Round 421: SYS-R418-PREVIEW-LIFECYCLE — the library preview stops and invalidates on collection change and unmount; time reads stay guarded after a seek (closes 8 Lows)

**Planned by:** B, at the round 420 → 421 planning, 2026-11-09 (`b-round-420.md`). The advisor was used after orientation. The round-420 task is archived as `tasks/round-420.md` [K13].

## Read first
- **`lessons.md` in full.** Most relevant here: L4, L10, L11, L22, L23, L29, L31, L37, L38, L49, L51, L52, L56 (new clause: `tools/find-ids.py`), L57, L58 (all clauses), L59, L60.
- **Primitives:** `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-420/claims-421.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-420/claims-421-planning-output.txt` (stderr `claims-421-planning.err`, empty).
  - Output on B's sketch scratch: `b-round-420/claims-421-sketch-output.txt` (stderr empty).
  - Expected differences: `b-round-420/claims-421-planning-vs-sketch.diff`.
- **Sketch review (L58):** `b-round-420/sketch-review.md` names the dispatched sha256 and holds the verdict and the ordering matrix. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `6609dfa`, clean tree
- **Gate 420 is `skipped`** ("no real changes") [K7]. Round 420 was a RETRO, so the baseline stays the commit gate 419 published: HEAD is `6609dfa…` [K1], and the tree is clean (K2 `total 0`).
- **Frozen:** `b-round-420/r421-frozen-sha256.txt` has **1,316** entries: every tracked file except the 3 granted source/test files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none of them is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `6609dfa` at A1 (root published in between), A re-runs the claims. A STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 420 passed.** RETRO 420 got a C PASS with `browserVerified` true, and gate 420 was skipped (D-29z1467).
- **C's two Lows from round 420** (both `environment`, in B's claims tooling) were fixed by this planning (D-29z1468):
  - `tools/find-ids.py` is the single archive-aware id lookup. `claims-421.sh` K14 uses it.
  - A request file that root consumes is no longer a claims input. K20 claims the AGREE note and the search result instead.
  - The rule is the L56 clause.
  - C checks both in row 1, and they close there.
- **Next in the recorded order (D-29z1466, D-29z1470): SYS-R418-PREVIEW-LIFECYCLE.** REGRESSION-2026-11-10 is not due yet: today is 2026-11-09, and `regression-last.json` says 2026-11-07 [K8]. It is due at the next planning (round 422).
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user` (2026-10-23 clarification).
- **STEM-LANES:** still waiting for Saba (`user-review/AGREE-STEM-LANES.md`). Row 5 now cites the root search result and B's four video picks [K20].
- **Reference-first, Ableton conformance, product-designer and screen budget do not apply.** Nothing visible changes in `/studio-lab` (browser row 4 proves equality with HEAD). Whether a preview stops the timeline stays `awaiting_user` (Q-PREVIEW-STOPS-TRANSPORT).

## 1. What the code does today (all tagged; K9 counts the HEAD lines)
- `ArrangementContext.tsx`: the collection effect's teardown, `resetDecodedBuffers`, aborts the controller and deletes the buffers. It does **not** stop the library preview or bump `previewTokenRef` [K9 teardown-stop 0]. Two things follow:
  - **TL-R418-L4:** a stream fallback queued before a collection change runs `startLibraryPreviewRef.current`, which by then belongs to the new collection, and starts a source with the same id there. A playing preview of the old collection also keeps playing.
  - **TL-R418-L1 / GATE418-L4:** on provider unmount the token is not bumped either. The queued fallback stops only at the refusal branch, because the player and the controller are already cleared.
- `preview.client.ts` [K9]:
  - **TL-R418-L2 / A-R418-REVIEW-L1:** `readTime` falls back to the `const start` from when the element was created. A same-url seek does not update it [K9 setStart 0, let-start 0]. The stall watchdog's tick read also falls back to `start`, so a throwing read after arming at a real time ≠ `start` silently skips the stall [K9 tick-armedAt 0].
  - **TL-R418-L3 / A-R418-REVIEW-L2:** `getLibraryPreviewOffset` reads `active.element.currentTime` unguarded [K9 offset-raw 1].
- **A-R418-REVIEW-L3:** the PC12 title says "a stall after the seek", but its body dispatches `error`. Seek-then-stall is covered only by the browser row R1b.
- `/studio-lab` passes the module constant `studioLabDemoCollection` [K22], so a collection change cannot happen there.

## 2. Rulings (B, D-29z1469; details in `b-round-420/sketch-review.md`)
1. **The collection teardown stops the preview.** `resetDecodedBuffers` calls `stopLibraryPreview()`, which stops the player, bumps the token, clears the preview id and releases the pin. `stopLibraryPreview` is added to that effect's deps. That teardown runs on a collection change and on provider unmount, so both paths bump the token.
   - **New stop trigger:** a preview of the old collection stops when the collection changes, because its source may no longer be in the library. In `/studio-lab` this cannot be reached; jsdom PL1–PL3 prove it.
   - **The negative:** ordinary re-renders do not stop a preview. `tech-lead` checked all ten deps for stable identity, and browser row R11 shows a preview still playing through Snap and zoom changes.
2. **`start` follows a same-url seek.** `ActiveStreamPreview` gains `setStart` (next to `setErrorHandler`) and `readTime`. The seek branch calls `playing.setStart(start)` before the `currentTime` setter. `readTime(fallback = start)` reads the current `start`.
3. **The watchdog's tick read falls back to `armedAt`** (`readTime(armedAt)`). A throwing read at the tick is a stall at the armed time.
4. **`getLibraryPreviewOffset` uses the guarded `active.readTime()`.** On a throwing getter it returns the latest seek offset and never throws. `null` still means "no preview".
5. **PC12's title** now says "an error after the seek", which is what its body does. The new PL9 drives seek-then-stall in jsdom.
6. **No change to transport behaviour.** No `stopPlayback()` call is added or removed [K9 stopPlayback-calls 7 at HEAD and at the sketch]. The public hook surface and `LibraryPreviewPlayer`'s public methods are unchanged; `setStart` and `readTime` live only on the internal `ActiveStreamPreview`.
7. **TL-R418-L1 and GATE418-L4 close as a defence on the same line.** PL4 is a lock row: unmount has no observable effect by design (TL-R421-01). The bump comes from the same teardown line that MU-COLLECTION-NO-STOP removes, and PL1/PL2 turn red without it.
8. **Existing rows:** every existing `it()` body is byte-identical to HEAD. Only PC12's title string changes.
9. **Doc:** `271-sys-preview-lifecycle.md` [K6: 270 is the last].

## 3. What A changes (sketch `b-round-420/sketch-421.patch.txt`, sha256 `8d5fc47d…` [K11]; generators `b-round-420/make-sketch-src.py` and `make-sketch-test.py`)
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-420/sketch-421.patch.txt`, then `git apply` the same file (3 files). **Do not edit those three files afterwards.** If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11); do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/271-sys-preview-lifecycle.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** Completed (C round 421 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings, in order (L26).
   - Content: rulings 1–9; the 8 closed ids, each with its row(s) from section 7; the two lock rows and why they are locks; a mutant block that copies the 7 lines of `b-round-420/mutants/summary.txt` byte for byte; a Mermaid sequence of error → microtask queued → collection teardown (stop + token bump) → microtask sees a stale token → nothing starts.
   - It cites only rows and files that exist (L26).
4. Write `a-round-421.md` as you go: changed files, each check with its rc and log path (`a-round-421/`), reviewer findings, and a For B section with any Architecture note.

## 4. Grants (`b-round-420/grants-421.txt`, 4 paths)
- `app/contexts/ArrangementContext.tsx` (sketch only)
- `app/lib/arrangement/preview.client.ts` (sketch only)
- `app/lib/arrangement/__tests__/library-preview-stream.test.tsx` (sketch only)
- `docs/implementation/2026/quarter-IV/271-sys-preview-lifecycle.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 3 ` M` lines and 1 `??` line.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-420/claims-421.sh` at the start | Equals `claims-421-planning-output.txt`; stderr empty |
| A2 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-420/covering-files.txt)` from `store/` (14 files: every test file that references the library preview) | rc 0; **14 files, 286/286**. B ran this exact command on the sketch: `b-round-420/precheck-a2.log`. The stream file alone is 49/49 (HEAD 40 + PL1–PL9). Loaded with 2 busy loops it is also 49/49, in 5.1 s (`precheck-loaded.log`) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info (`precheck-lint.log`) |
| A4 | `npx biome check` on the 3 granted code files | rc 0, no fixes (`precheck-biome3.log`) |
| A5 | Claims at the end | Differs from the planning output only in: K2 `1 ?? 3 M total 4` (the scratch in `claims-421-planning-vs-sketch.diff` shows `3 M total 3` because it has no doc, and its K1 is the scratch commit; A's K1 stays `6609dfa`), K5 `no`, K6 (`271-sys-preview-lifecycle.md` and its l.4), and K9 and K10 equal to the lines in `claims-421-sketch-output.txt`. K2b 0; K3 1,316 rc 0; K4 rc 0 |
| A6 | `code-reviewer` on the diff and doc 271 (4 files) | No Critical, High or Medium in the sketch logic (otherwise STOP, L11). Rulings 1–9 and TL-R421-01…05 are not new findings. Fix doc findings in the doc |

## 6. C's acceptance
**Before hand-off:** write `c-round-421.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-420/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-421.json c-round-421/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4, 5 and 6 (browser), then the rest. Write `c-round-421/progress.json` after every row. Never run vitest while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation and **stderr is empty**. K19 prints `L58 OK`. K14 lists all 13 ids with a location, none `NOT-FOUND`: TL-R419-L1 is found in the archive, which closes C-R420-CLAIMS-K22-ARCHIVE-AGAIN. K20 reads the AGREE note and the search result with no request-file input, which closes C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED. Status shows only the 4 granted paths; frozen 1,316 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-421.patch.txt` to a `git archive HEAD` scratch and `cmp` the 3 files against the working tree: identical. A2's command gives 14 files, 286/286. `git diff -U0` on the test file touches only the PC12 title line and the appended block (the `rerenderWith` and `throwingTimeAfter` helpers, PL1–PL9) |
| 3 | **MUTANTS** | The scratch base must be **HEAD with nothing applied**: `git archive HEAD \| tar -x -C /tmp/c421-scratch`, symlink `node_modules`, then `git init && git add -A && git commit`. Copy `b-round-420` to `c-round-421/b420copy/`, including `sketch-421.patch.txt` and `mutants/run.py`. Run `python3 -I c-round-421/b420copy/mutants/run.py /tmp/c421-scratch $PWD/c-round-421/b420copy`. The script asserts the HEAD base, applies the sketch itself, and writes `summary.txt` into `<arg2>/mutants/`. Never write into `b-round-420/`. **Pass = the same 7 lines as B's `summary.txt`** (table in section 7). Then add **one C-own loaded replicate**: the stream file with 2 × `node -e "for(;;){}"` in the background gives 49/49 (L37) |
| 4 | **PREVIEW-BROWSER (behaviour unchanged)** | Real Chromium, `/studio-lab`, **1440×900 and 1280×720**, fresh context per row. Copy `b-round-420/probe/rows-421.mjs` and `compare.py` to `c-round-421/probe/`. Copy B's HEAD results, `b-round-420/probe/head/rows-*.json`, to `c-round-421/probe/head/`. From `store/` (A's tree on :5173), run `OUT=<abs>/c-round-421/probe/sketch node <abs>/c-round-421/probe/rows-421.mjs <row> 1440x900,1280x720` for R1 (this also runs R1b, R10 and R11), R5, R6, R7 and R9. Then run `python3 -I c-round-421/probe/compare.py c-round-421/probe`. **Pass: `ALL EQUAL` over 16 cells.** R11 must show `paused [false]` and `advanced true`: the preview keeps playing through two Snap toggles and two zoom steps (ruling 1, the negative). Warm `/studio-lab` once before the first timed row (`b-round-415/screens/warmup.mjs`); a cold first load that cannot find the status element is environment-invalid and is retried |
| 5 | **PLAY-STOP SMOKE** (browser, both viewports) | With a demo clip: Space plays; the position advances (≥ 1 s of wallclock ≈ ≥ 0.9 s of position, L48); Space stops, and the position stays frozen for 500 ms; 0 page errors (ignore the documented cloud cart and connection errors) |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy the auth probe from `c-round-420/` (or `c-round-416/scripts/`). The demo `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` without auth → 401. **BLOCKED:** the fake-bearer path (backend unavailable in the cloud) |
| 7 | **DOC** | Doc 271 l.4 is byte-exact `**სტატუსი:** Completed (C round 421 PASS)`. The 7 TEMPLATE headings are in order. Its mutant block equals the 7 lines of `b-round-420/mutants/summary.txt` byte for byte. The 8 closed ids each name an existing PL/PC row. Every row id it cites exists. No other doc differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims. `git diff HEAD --stat` lists only the 3 granted files. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's full run on the sketch: `b-round-420/precheck-full.log`, 264 files, 3951/3951, rc 0 [K18] |

**Retries (rows 4–6):** a cold-server first load or a port already in use is an environment problem (L38). Retry at most twice; it is never a FAIL.

## 7. The new rows and their mutants (`b-round-420/mutants/run.py`; logs in `b-round-420/mutants/`)
| Row | Closes | What it proves | Red under |
|---|---|---|---|
| PL1 | TL-R418-L4 | a collection change stops a playing stream preview: one pause, the `src` is removed, the preview id clears, the offset is `null` | MU-HEAD-SRC, MU-COLLECTION-NO-STOP |
| PL2 | TL-R418-L4 | a stream fallback queued before a collection change starts nothing in the new collection: no second element, no decode, no refusal or loading text | MU-HEAD-SRC, MU-COLLECTION-NO-STOP |
| PL3 | TL-R418-L4 (lock) | a decode preview pending across a collection change starts nothing. It has two guards (the abort and the token), so it is green under every single mutant | none (lock row) |
| PL4 | TL-R418-L1, GATE418-L4 (lock) | a stream error queued before unmount starts nothing after it. No observable effect by design (TL-R421-01); the bump is the line that PL1/PL2 pin | none (lock row) |
| PL5 | (ruling 1, negative) | a re-render with the same collection keeps the stream playing (0 pauses, `src` kept, id kept). Browser R11 is its real-browser half | none (lock row) |
| PL6 | TL-R418-L2, A-R418-REVIEW-L1 | after a same-url seek to 6, a media error with a throwing time read reports 6, not 0 | MU-HEAD-SRC, MU-NO-SET-START |
| PL7 | TL-R418-L2 | a watchdog armed at 3 whose tick read throws reports one stall at 3, with exactly one read | MU-HEAD-SRC, MU-TICK-FALLBACK-START |
| PL8 | TL-R418-L3, A-R418-REVIEW-L2 | `getLibraryPreviewOffset` with a throwing read does not throw and returns the seek offset 6 | MU-HEAD-SRC, MU-NO-SET-START, MU-OFFSET-RAW-READ |
| PL9 | A-R418-REVIEW-L3 | a same-url seek, then a stall, falls back through the newest handler at 5; the first handler is never called | MU-SEEK-KEEPS-OLD-HANDLER (also turns PC12 red) |
| PC12 | A-R418-REVIEW-L3 | title only: "an error after the seek" | — |

**Neighbouring behaviour that could break:**
- the other 40 PC/PS rows (row 2);
- `decoded-buffer-eviction-ui` EV12 (a stale call after a collection change decodes nothing) and PC3 / PS27 (both rerender with a new collection after stopping or before starting);
- Space and Play stopping a preview (R7, PS9, PS11);
- the stall watchdog timing (PS16–PS19, PS24, PS25);
- the element release on unmount (PS10; the second stop on unmount is a no-op, `tech-lead` (b));
- StrictMode's double mount (the teardown runs with no preview, so it does nothing).

**Ableton conformance:** does not apply. This is a behaviour-preserving fix round, and the preview-versus-transport question stays `awaiting_user`.
