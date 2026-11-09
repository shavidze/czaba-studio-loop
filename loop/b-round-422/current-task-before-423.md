# Round 422: SYS-2 stage 1 — a held Enter acts once on Split, Follow, Back to start, Loop, Zoom to range and a marker flag

**Planned by:** B, at the round 421 → 422 planning, 2026-11-09 (`b-round-421.md`). The advisor was used after orientation and before close. The round-421 task is archived as `tasks/round-421.md` [K13].

## Read first
- **`lessons.md` in full.** Most relevant: L4 (degraded state × gesture; one element, one rule), L10, L11, L23, L29, L31, L52, L56, L57, L58, L59, L60.
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Claims:** `bash b-round-421/claims-422.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-421/claims-422-planning-output.txt` (stderr `claims-422-planning.err`, empty).
  - Output on B's sketch scratch: `b-round-421/claims-422-sketch-output.txt`.
  - Expected differences: `b-round-421/claims-422-planning-vs-sketch.diff`.
- **Sketch review (L58):** `b-round-421/sketch-review.md` names the dispatched sha256 and holds the verdict and the post-review delta. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `4786c13`, clean tree
- **Gate 421 is `published`** at `4786c13…` [K7]. That commit is the baseline [K1]. The tree is clean (K2 `total 0`).
- **Frozen:** `b-round-421/r422-frozen-sha256.txt` has **1,317** entries: every tracked file except the 3 granted source/test files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none of them is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `4786c13` at A1 (root published in between), A re-runs the claims. A STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 421 passed and is published** (D-29z1471): C PASS, 8 rows, `browserVerified` true; gate 421 `4786c13`. SYS-R418-PREVIEW-LIFECYCLE is done.
- **REGRESSION-2026-11-10 is not due yet** (D-29z1472). `regression-last.json` says 2026-11-07 [K8]; today is 2026-11-09, which is 2 days, and the rule needs 3. It goes first at the 422 → 423 planning.
- **STEM-LANES still waits for Saba** (`user-review/AGREE-STEM-LANES.md`, no answer and no transcripts). The recorded order (D-29z1470) then opens SYS-1…3.
- **Why SYS-2 before SYS-1 (D-29z1474):**
  - SYS-2 is a keyboard defect that a user can feel. In real Chromium at HEAD, a held Enter flips Follow and Loop again and restarts playback from Back to start and from a marker flag (`b-round-421/probe/head/*.json`; K16).
  - SYS-1 is test-only selector hygiene, and it comes next.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.

## 1. What the code does today (tagged; K9, K10, K20, K22 count the HEAD lines)
- `ArrangementTransport.tsx` already has `preventRepeatedEnterKeyDown` (`preventDefault` on `key === 'Enter' && repeat`, no `stopPropagation`). Six buttons use it: Play, Stop, Undo, Redo, Delete and Zoom back. Export has the same guard inline [K9 helper 6, export-inline 2: Export's inline guard plus the helper's own body].
- **Unguarded in that file:** Split, Follow, Back to start, Loop, Zoom to range and Fit [K10 scan over both files: 10 `GUARD`, 6 `NONE` (all in the transport), 1 `KEYDOWN-NO-REPEAT` (the flag)].
- **Fit stays unguarded, on purpose.** TH5 in `export-toolbar-hold-enter.test.tsx` pins it as "not prevented". That was a scope lock from round 98, and a repeated Fit is idempotent [K20 TH5 1, K22 0].
  - **Ruling line:** Fit: TH5 wins over the SYS-2 sweep. Neither A nor C changes or measures Fit for a guard.
- `ArrangementMarkerRow.tsx`:
  - The add, prev and next buttons and the rename field already guard a repeated Enter [K9 markerrow-enter-repeat 4].
  - The flag's `handleFlagKeyDown` does not [K9 flag-first-guard 0]. An Enter press falls through to the native click, which runs `jumpToMarker`, and that restarts the graph while playing (GATE107-S1).
- **Chromium sends a click for every auto-repeated Enter keydown on a `<button>`, unless that keydown is prevented.** The HEAD probe shows it (K16).

## 2. Rulings (B, D-29z1473)
1. **Transport:** add `onKeyDown={preventRepeatedEnterKeyDown}` to Split, Follow, Back to start, Loop and Zoom to range. Nothing else in those elements changes.
2. **Marker flag:** the first statement of `handleFlagKeyDown` is `if (event.key === 'Enter' && event.repeat) { event.preventDefault(); return; }`.
   - It comes before the target/modifier early return, so a repeated Ctrl+Enter is prevented too. This matches the transport helper, which ignores modifiers.
   - No other key reaches a different branch (TL-R422-01).
3. **Per press, nothing changes.** A fresh Enter (`repeat` false) and a mouse click still act exactly as at HEAD. Space is not touched; the workspace already handles Space globally.
4. **No `stopPropagation`.** No Enter path reads `defaultPrevented` (TL-R422-02).
5. **No focus change and no visible change.** Nothing mounts or unmounts, and no text, label, title or class changes. That is why the screen-budget, product-designer and L50 focus rows do not apply.
6. **SYS-2 stage 2 (not this round)** covers the rest of the A-R107 sweep. The list is in `b-round-421/data/button-guard-scan.txt`; stage 2 rules each site there (guard, or idempotent exclusion).
7. **Doc:** `272-sys-held-enter-transport.md` [K6: 271 is the last].

## Reference
- **No Ableton reference was searched this round.** The change removes Chromium's auto-repeat activation of a focused button. It changes no per-press behaviour, so there is no Live behaviour to match. Ableton conformance: არ ეხება (does not apply).
- **The reference is the project's own convention:** round 108 (F2) and SABA-B-9 (TC8).
- **Deviation:** none recorded.

## 3. What A changes (sketch `b-round-421/sketch-422.patch.txt`, sha256 `7002efc1…` [K11])
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-421/sketch-422.patch.txt`, then `git apply` the same file (3 files). **Do not edit those three files afterwards.** If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11); do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/272-sys-held-enter-transport.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** Completed (C round 422 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings, in order (L26).
   - Content:
     - rulings 1–7;
     - the closed ids, each with its row: GATE107-S1-MARKER-FLAG-HELD-ENTER → HE6. A-R107-SWEEP-HELD-ENTER-TOOLBAR is partial (HE1–HE5) and stays open for stage 2;
     - why Fit is excluded (TH5);
     - a mutant block that copies the 7 lines of `b-round-421/mutants/summary.txt` byte for byte;
     - the browser HEAD-vs-sketch table (from `b-round-421/probe/compare-head-vs-sketch.txt`);
     - TODO: SYS-2 stage 2.
   - It cites only rows and files that exist (L26).
4. Write `a-round-422.md` as you go:
   - changed files;
   - each check with its rc and log path (`a-round-422/`);
   - reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-421/grants-422.txt`, 4 paths)
- `app/components/arrangement/ArrangementTransport.tsx` (sketch only)
- `app/components/arrangement/ArrangementMarkerRow.tsx` (sketch only)
- `app/lib/arrangement/__tests__/transport-centre-ui.test.tsx` (sketch only)
- `docs/implementation/2026/quarter-IV/272-sys-held-enter-transport.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 3 ` M` lines and 1 `??` line.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-421/claims-422.sh` at the start | Equals `claims-422-planning-output.txt`; stderr empty |
| A2 | `npx vitest run $(grep '^app/' ../tmp/studio-real-loop/b-round-421/covering-files.txt)` from `store/` (23 files: every test file that references the transport, the marker row or the changed buttons; the 2 `perf/` specs in the list are Playwright and are not run here) | rc 0; **23 files, 509/509** (`b-round-421/precheck-a2.log` [K23]). `transport-centre-ui` alone is 17/17 |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info (`precheck-lint.log`) |
| A4 | `npx biome check` on the 3 granted code files | rc 0, no fixes (`precheck-biome3.log`) |
| A5 | Claims at the end | Differs from the planning output only in the lines `claims-422-planning-vs-sketch.diff` lists. K2 becomes `1 ?? 3 M total 4` (the scratch shows `3 M` because it has no doc). K5 becomes `no`. K6 shows the doc 272 name and its l.4. K9 and K10 equal `claims-422-sketch-output.txt`. K1 stays `4786c13`. K2b 0; K3 1,317 rc 0; K4 rc 0 |
| A6 | `code-reviewer` on the diff and doc 272 (4 files) | No Critical, High or Medium in the sketch logic (otherwise STOP, L11). Rulings 1–7 and TL-R422-01…09 are not new findings. Fix doc findings in the doc |

## 6. C's acceptance
**Before hand-off:** write `c-round-422.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-421/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-422.json c-round-422/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4, 5 and 6 (browser), then the rest. Write `c-round-422/progress.json` after every row. Never run vitest while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation and **stderr is empty**. K19 prints `L58 OK`. K14 lists every id with a location, none `NOT-FOUND`. Status shows only the 4 granted paths; frozen 1,317 rc 0; protected rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-422.patch.txt` to a `git archive HEAD` scratch and `cmp` the 3 files against the working tree: identical. A2's command gives 23 files, 509/509. The patch has 3 `diff --git` headers (no `vite.config.ts`). Its test-file hunk has 0 removed lines and adds only the appended `describe` (HE1–HE6). TC1–TC11 bodies are byte-identical to HEAD |
| 3 | **MUTANTS** | Base = **HEAD with nothing applied**. Run `git archive HEAD \| tar -x -C /tmp/c422-mut`, symlink `node_modules`, then `git init && git add -A && git commit`. Copy `b-round-421` to `c-round-422/b421copy/`. Run `python3 -I c-round-422/b421copy/mutants/run.py /tmp/c422-mut $PWD/c-round-422/b421copy`. The script asserts a clean HEAD base, applies the sketch itself, and writes `summary.txt` into `<arg2>/mutants/`. Never write into `b-round-421/`. **Pass = the same 7 lines as B's `summary.txt`:** MU-HEAD-SRC turns HE1–HE6 red; each single-guard mutant turns exactly its row red (SPLIT→HE4, FOLLOW→HE1, BACK→HE3, LOOP→HE2, ZOOMRANGE→HE5, FLAG→HE6), and every `mutant-*.log` shows 17 tests [K17] |
| 4 | **HELD-ENTER BROWSER** | Real Chromium, `/studio-lab`, **1440×900 and 1280×720**, fresh context per cell. Copy `b-round-421/probe/held-enter.mjs` and `compare.py` to `c-round-422/probe/`, and B's HEAD results `b-round-421/probe/head/*.json` to `c-round-422/probe/head/`. From `store/` (A's tree on :5173), run `OUT=<abs>/c-round-422/probe/sketch node <abs>/c-round-422/probe/held-enter.mjs`, then `python3 -I c-round-422/probe/compare.py c-round-422/probe`. The probe's lib import is `../../c-round-382/lib.mjs`, which resolves from `c-round-422/probe/` too. **Pass: `ALL OK (12 cells)`.** `compare.py` checks exactly this: the first Enter acts (`firstActed` true), three repeated Enter keydowns change nothing (`heldChanged` empty, `starts` included for BACK and FLAG), and there are 0 page errors. The HEAD JSONs are context only and are not compared field by field. B's HEAD run shows `follow`, `loop`+`undo` and `starts` changing on hold (K16). Warm `/studio-lab` once in a browser before the first timed cell (L38). A cold first load that times out is environment-invalid and is retried; B's own first sketch cell needed that |
| 5 | **PLAY-STOP + PER-PRESS SMOKE** (browser, both viewports) | With a demo clip: Space plays; the position advances (≥ 1 s of wallclock ≈ ≥ 0.9 s of position, L48); Space stops, and the position stays frozen for 500 ms. A mouse click on Follow flips it once, and a second click flips it back. With a time selection, a mouse click on Loop sets the loop (`aria-pressed` true). 0 page errors (ignore the documented cloud cart and connection errors) |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy the auth probe from `c-round-421/`. The demo `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` without auth → 401. **BLOCKED:** the fake-bearer path (backend unavailable in the cloud) |
| 7 | **DOC** | Doc 272 l.4 is byte-exact `**სტატუსი:** Completed (C round 422 PASS)`. The 7 TEMPLATE headings are in order. Its mutant block equals the 7 lines of `b-round-421/mutants/summary.txt` byte for byte. GATE107-S1 names HE6. Every row id it cites exists. No other doc differs from HEAD |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims. `git diff HEAD --stat` lists only the 3 granted files. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C (gate rows). B's full run on the sketch: `b-round-421/precheck-full.log` [K18] |

**Retries (rows 4–6):** a cold-server first load or a port already in use is an environment problem (L38). Retry at most twice; it is never a FAIL.

## 7. The new rows and their mutants (`b-round-421/mutants/run.py`; logs in `b-round-421/mutants/`)
| Row | Closes | What it proves | Red under |
|---|---|---|---|
| HE1 | A-R107 (Follow) | a fresh Enter on Follow switches the mode; 3 repeated Enters are prevented and change no snapshot field | MU-HEAD-SRC, MU-FOLLOW |
| HE2 | A-R107 (Loop) | with a time selection, a fresh Enter on Loop enables the loop; the repeats change nothing (at HEAD they toggle it and add history) | MU-HEAD-SRC, MU-LOOP |
| HE3 | A-R107 (Home) | while playing, a fresh Enter on Back to start restarts from 0 once; the repeats start no source | MU-HEAD-SRC, MU-BACK |
| HE4 | A-R107 (Split) | with a selected clip, a fresh Enter on Split splits it (2 clips, a new Undo title); the repeats change nothing | MU-HEAD-SRC, MU-SPLIT |
| HE5 | A-R107 (Zoom to range) | a fresh Enter zooms to the range. The zoom is idempotent, so the prevented repeat keydown is the observable | MU-HEAD-SRC, MU-ZOOMRANGE |
| HE6 | GATE107-S1 | while playing, a fresh Enter on a marker flag jumps to it once (insert marker 6.000, one restart); the repeats start no source | MU-HEAD-SRC, MU-FLAG |

The snapshot in every row is: the arrangement JSON, Follow mode, the zoom readout, the Zoom back title, the Undo title, the insert marker, the playing flag, the status sequence, and the source starts.

**Neighbouring behaviour that could break:**
- TC7 and TC8 (Space and Enter on Play and Stop);
- FL9 (the Undo/Redo/Delete/Zoom back guards);
- TH1–TH5 (Export guarded, Fit not);
- the marker flag's ContextMenu, Shift+F10, Arrow nudge, F2 and Delete paths (unchanged; TL-R422-01);
- the workspace Enter path, which skips `HTMLButtonElement` targets (TL-R422-02);
- the mouse click on every changed button (row 5).

**Ableton conformance:** does not apply (see Reference).
