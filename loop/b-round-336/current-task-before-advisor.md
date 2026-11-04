# Round 337: SYS-R336-PERF-DRAG-WINDOW. One drag-window helper, a released mouse button on a failed gesture, named lane-segment constants and accurate notes in the interactions perf harness. Test-only; every perf row value stays the same

**Planned by:** B, at the round 336 → 337 planning, 2026-11-04.

**Decisions** (all in `backlog.json` v296 → `decisions_log_b`; D-29z1023…D-29z1030):
- **D-29z1023: round 336 closed as PASS, from C's evidence.**
  - `c-round-336.json`: `taskStatus` PASS, `browserVerified` and `realVerified` true, 10 rows, 0 bugs.
  - Gate 336 `skipped`, "no real changes", head `f1def9c` [K1]. Nothing was published because nothing in `store/` changed. **The baseline stays `f1def9c`.**
  - **RETRO 336 → done.** `retro_runs[336]` → done. `retro_policy.next_due` stays round 351 (window 336–350).
- **D-29z1024: C's four round-336 notes.**
  - INFO-B336-SMOKE-UNDO-LABEL (origin B spec, closed info): the task expected "Undo: Move clip" for a cross-lane drag. The app says "Move to track — Stems", as `historyMoveToTrack` defines. This is L29 evidence (an expectation copied without a baseline probe), counted at RETRO 351.
  - INFO-C336-PERF-STATUS-WORDING: closed info.
  - INFO-C336-COLLECT-OVERWRITE (origin B script): `b-round-335/collect.py` writes into `b-round-335/`. C's re-run overwrote `rounds-321-335.json`, then restored it. Becomes RC-R336-SCRIPT-OUTPUT-DIR: a B analysis script takes its output folder as an argument. Watch to RETRO 351.
  - SR-336-1/2 were reproduced by measurement. They stay `awaiting_user`.
- **D-29z1025: the GATE335-S1 premise did not hold. The acceptance is amended (L29).** See §0.2.
- **D-29z1026: budgets file, notes only (L4 ruling).** See §1.2.
- **D-29z1027: the sketch review.** It used `tech-lead`, because `code-reviewer` is not on this phase's consult list. It found no Medium+. RV-1…RV-3 are applied in sketch v2. See §0.4.
- **D-29z1028: the doc number.** New doc 233, as the SYS precedent (doc 219) did. Doc 168 `## მეტრიკები` is granted whole (L34).
- **D-29z1029: what comes next.** Round 338 is REGRESSION-ROUND-2026-11-05 if its planning falls on or after 2026-11-05. Otherwise it is PERF-DRAG-PREVIEW c3-ii.
- **D-29z1030: this task.**

**Read first:**
- `lessons.md`: L4, L7, L10, L11, L29, L30, L34, L37, L38, L56, L57, L58.
- Primitives: `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (test code), `GEORGIAN_DOCS.md` (docs), `AGENT_DISCOVERABLE_CODE.md` (new names).
- No component, context, audio or `perf/lib` code changes.

**L29 note:** untagged code text below is an expected value, a new name, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

## Baseline
- HEAD is `f1def9c` (gate 335, published), with a clean tree: 0 entries in `git status` [K2]. Gate 336 was skipped, and its head is the same commit [K1].
- Protected files: 11/11 OK [K8]. No dependency changes.
- The interactions budget file has 193 rows [K7]. C round 335's perf result has 193 rows, `complete` true, 0 failures, and 139 non-wallclock rows [K10]. **That file, `c-round-335/perf-results/latest-interactions.json`, is this round's oracle.**

## 0. Why this round, and B's evidence
### 0.1 What it closes
SYS-R336-PERF-DRAG-WINDOW (D-29z1019) is the systemic task from RETRO 336. It closes six ids. All of them live in the interactions perf spec, its budget notes and doc 168:

| Id | What | Today [K#] |
|---|---|---|
| ARCH-R335-DRAG-WINDOW-HELPER | `measureDrag` and `measureLaneDrag` each derive down/up/first move, the whole window, release and starts, and each define `put` | `const downAt = whole.downs.at(-1);` ×2 [K4] |
| GATE335-S1-MOUSE-UP-FINALLY | if a read throws after `mouse.down()`, `mouse.up()` never runs | 2 `mouse.down()`, 2 `mouse.up()`, no `try` around either [K4, K5] |
| GATE335-S3-LANE-SEGMENT-CONSTANTS | `dragSteps / 6` and `dragDistancePx / 3` are exact only for 60 and 120 | 7 + 7 uses [K3] |
| GATE335-S4-REPEATED-NOTES | the same ≈180-character gesture sentence in 26 lane notes | 26 [K7] |
| A-R335-REVIEW-WHOLE-NOTE | the whole-window notes read as if the first move were not counted; the code divides by every move between down and up | see §1.2 |
| INFO-A335-SEQUENCE-ORDER | the 30-clip `interactionSequence` entry puts Ctrl+wheel before Space; the code runs it after the final Space | 1 [K6] |

**Same root cause (L7):** the 32 older drag notes (`commits-per-move` ×16, `move-components-per-move` ×16, four of them asserted rows with an extra sentence) say "/ pointermoves in that window". `measureDrag` also divides by every move between down and up, the first included. So they are fixed with A-R335-REVIEW-WHOLE-NOTE. Doc 168 `## მეტრიკები` says the same thing in two lines [K16], and is fixed too.

### 0.2 The GATE335-S1 premise, checked (D-29z1025)
The gate reviewer wrote: "the mouse button stays pressed and the next step in the pass starts mid-gesture". B read the code at HEAD:
- Neither drag function has a `try`. The spec's two 2-space `try` blocks are in the zoom-probe steps and in `runInteractionPass` [K5].
- The only `try` in a pass is `runInteractionPass`'s. Its `catch` sets `abortedAt` and its `finally` closes the context [K5].
- So a throw after `mouse.down()` **aborts the whole pass**. No later step runs, and the closed context drops the button.

**"The next step starts mid-gesture" therefore cannot happen today.** The release is hygiene: it keeps the record honest, and it is what a future catch-and-continue would need. The systemic task's acceptance ("a mutant that removes the finally leaves the button down on an injected throw") is kept, but given an observable the harness really has:
- The in-page instrumentation records every `pointerup` (`state.ups`) [K19].
- The probe reads it in the pass's `catch`, while the page is still open.
- With the release, a `pointerup` follows the last `pointerdown`. Without it, none does.

B ran both versions on its sketch (§0.3).

### 0.3 B's sketch and what it measured (L58)
**Scratch:** `/home/runner/b336-scratch/sc`, `git archive` of `f1def9c` with `node_modules` linked. `store/` was never touched.
- **How it was made:** `python3 -I b-round-336/apply-sketch.py <root> <ids-out>` applies the whole sketch: the spec edits and the 58 notes. It refuses to run on `store/`. The spec diff is `b-round-336/sketch/sketch.patch.txt` and the notes diff is `b-round-336/sketch/budgets.patch.txt`. Both apply to `f1def9c` with `git apply` [K17].
- **v1 → v2:** v1 was B's first sketch (`sketch-v1.patch.txt`). Its perf run is `perf-sketch-v1.log`, compared in `perf-rowcmp-sketch-v1-vs-c335.txt`: 139 EQUAL, 0 DIFF, 0 NEW, 36/36 asserted rows pass. v2 adds the three review Lows RV-1…RV-3 (§0.4). **All evidence below is on v2.**

| Check (the same command C runs) | Result on v2 | File [K#] |
|---|---|---|
| `npm run typecheck` | rc 0 | `sketch-typecheck.log` |
| perf spec alone (L38), `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` | rc 0, `complete` true, 193 rows, `failures` [], 36/36 asserted pass, every liveness row 1 in all 6 passes (5.2 min) | `perf-sketch.log`, `perf-sketch-results/latest-interactions.json` [K11] |
| `python3 -I b-round-329/perf-rowcmp.py c-round-335/perf-results/latest-interactions.json <result>` | **139 `EQUAL`, 0 `DIFF`, 0 `NEW`** | `perf-rowcmp-sketch-vs-c335.txt` [K12] |
| `python3 -I b-round-336/rowids-equal.py` (same two files) | `ids-equal 193` | [K12] |
| `python3 -I b-round-336/notes-only-check.py <HEAD budgets> <sketch budgets> b-round-336/notes-changed-ids.txt` | `ids equal order equal nonnote-diffs 0 notes-changed 58 matches-expected True` | `notes-only-check.txt` |
| perf/lib report test through the scratch config (GATE304-M1) | 34/34 pass | `perf-lib-sketch.log` [K14] |
| mutant P (probe + injected throw, release kept), 1 pass at 1× | aborted at `drag lane stopped: MU-INJECT-THROW`; `MU-PROBE up-after-last-down true` | `mutant-P/` [K13] |
| mutant M (probe + injected throw, no release in the catch) | the same abort; `MU-PROBE up-after-last-down false` | `mutant-M/` [K13] |
| mutant D (`measureDrag` per-move ÷ `moves.length - 1`), then `python3 -I b-round-336/rowcmp-1x.py c-round-335/… <D result>` | **9 `DIFF`** (the 1× `move-components-per-move` rows of range, fade, trim and move, stopped and playing, plus `interact.drag.fade.30.playing`), 73 `EQUAL` | `mutant-D/`, `mutant-D-rowcmp.txt` |

**What the mutants prove:**
- P and M differ only in the release, so the GATE335-S1 fix is observable.
- D shows that the EQUAL compare turns red when a helper's value changes (L58: the pre-fix tree meets an "EQUAL" row trivially, so a mutant is required).
- The 1-pass mutant runs compare 1× rows only (`rowcmp-1x.py`). They are evidence for the mutant, not a replacement for the full run.

### 0.4 The sketch review (L58 clause, D-29z1027)
- **Reviewer:** `tech-lead`, read-only, on the v1 diff. `code-reviewer` is not on this planning phase's consult list.
- **Result:** no Critical, High or Medium. Event order, every filter, detail keys and rounding are identical to HEAD (`b-round-336/sketch-review.md`).
- **Lows:**
  - RV-1 (do not mask the original error), RV-2 (`pointerSpan`) and RV-3 (inline the named constants): **applied in v2**.
  - RV-4 (a `commitsPerMove` helper) and RV-5 (`readonly` arrays): not applied. A may add RV-5; it changes no value.
- **A's own code-reviewer run still happens** (the 3+ files rule). A Medium+ that it finds on B's sketch, and that `sketch-review.md` does not rule, is a planning FAIL (L58).

**Not applicable:** reference first, Ableton, `product-designer`, the screen budget and the YouTube request. Nothing visible or audible changes.

## 1. What A changes (ownership)
A owns exactly these 4 files. Nothing else changes:
1. `perf/studio-lab-interactions.perf.spec.ts`
2. `perf/budgets.interactions.json`: the `note` field of the 58 listed rows only
3. `docs/implementation/2026/quarter-IV/233-sys-r336-perf-drag-window.md` (new; 233 is free [K16])
4. `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: the `## მეტრიკები` section only

These stay untouched [K15]:
- `app/**` and `perf/lib/**`;
- the other perf specs and budget files, `package.json` and the lock file;
- doc 232;
- the protected files (`b-round-318/protected-sha256.txt`, including `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts` and `app/routes/account.downloads.tsx`) [K8].

**The fastest correct route:** from `store/`, run `git apply ../tmp/studio-real-loop/b-round-336/sketch/sketch.patch.txt ../tmp/studio-real-loop/b-round-336/sketch/budgets.patch.txt` (it applies to `f1def9c` [K17]), then read every hunk against §1.1. A owns the result. A may restructure inside §1.1. **Any change that can alter an event's order, a filter, a rounding or a detail key is a STOP (L11)**, even if the reviewer suggests it.

### 1.1 The spec (`perf/studio-lab-interactions.perf.spec.ts`)
1. **Named lane constants (GATE335-S3).** Add `laneSegmentSteps = 10` and `laneSegmentPx = 40` next to `dragSteps` and `dragDistancePx`.
   - `measureLaneDrag` and the two lane entries of `interactionSequence` use them.
   - After the change, `dragSteps / 6` and `dragDistancePx / 3` occur 0 times.
   - The values are unchanged: 60 / 6 = 10 and 120 / 3 = 40.
2. **One window helper (ARCH-R335).**
   - `dragWindow(whole)` returns `null`, or `{ moves, firstMove, up, commits, release, moveStarts, releaseStarts }`, with the exact HEAD bounds:
     - the last pointerdown, then the first pointerup after it (`t > downAt`);
     - moves with `downAt < t < up`;
     - whole-window commits and starts with `firstMove < t < up`;
     - release commits and starts with `t >= up`.
   - `rowWriter(result, baseId)` returns the `put` function, which writes through `rateRowId`.
   - `componentsPerMove(commits, count)` = `roundTo(count ? sumRendered(commits) / count : 0, 3)`.
   - Both drag functions use the three helpers. `const downAt = whole.downs.at(-1);` then occurs exactly once, inside `dragWindow`.
   - The cross and lane windows of `measureLaneDrag`, `backMoves`, and the `commits-per-move` formula in `measureDrag` stay as they are (RV-4 not applied).
   - Every detail object keeps its keys and its values.
   - The problem text "no in-page pointerdown, pointermove and pointerup sequence" stays.
3. **Released button (GATE335-S1, as ruled in §0.2).** `pressedGesture(page, grab, gesture)` does: move to the grab point, down, run `gesture`. On success: one `mouse.up()`, then return the value. On a throw: `mouse.up()` with its own error swallowed, then rethrow the **original** error (RV-1).
   - Both drags use it. The reads and in-page timestamps that HEAD takes before `mouse.up()` stay inside the gesture, in the same order (mid and end reads; t1, cross read, t2, back read, t3).
   - `tUp` is still read right after the release.
   - `await page.mouse.down();` then occurs exactly once (inside the helper), and `await page.mouse.up();` occurs exactly once on the success path.
4. **Sequence text (INFO-A335).** The 30-clip entry reads, in this order: keys, the in-first and out-first paths with the zoom probe (`interact.zoom.30.*`, `interact.zoom.30.in/out.*`), Space, Home, the fade-in drag (`interact.drag.fade.30.playing.*`), Space, **then** Ctrl+wheel out-first with the zoom probe (`interact.zoom.30.wheel.*`). This matches the code [K6].
5. **Not changed:** `DragName`, `dragNames`, every row id, every `step` name, the pass order, `resetAfterDrag`, the liveness logic and its problem texts, and `buildInteractionReport`.

### 1.2 Budget notes (`perf/budgets.interactions.json`, D-29z1026)
**Ruling line (L4):** budgets file: the SYS-R336 notes-only grant wins over ARCH-R335's "unchanged `budgets.interactions.json`".
- Every non-`note` field of all 193 rows stays equal by id, and the row order stays equal.
- Exactly the 58 ids in `b-round-336/notes-changed-ids.txt` change their `note`. The file keeps its 2-space JSON form and its trailing newline.
- **The 26 lane rows:** the gesture sentence (≈180 characters, starting "Gesture: press on the first clip name bar") becomes the pointer "Lane drag (gesture: the 'lane drag' entries of interactionSequence; doc 168). ". The rest of each note stays.
- **Lane whole-window rows** (`move-components-per-move`, stopped and playing, 1× and 6×): the denominator wording becomes "/ all pointermoves between the in-page pointerdown and pointerup, the first one included".
- **The 32 older rows (same root cause, L7):** 16 `commits-per-move` and 16 `move-components-per-move` notes get the same denominator wording. For the four asserted rows (range and fade, stopped and playing), the extra "Asserted since …" sentence stays.
- A may word a note differently. Each changed note must state the same window and the same denominator. The id set may not change.

### 1.3 Docs
**Doc 233 (new):**
- l.1 is a Georgian title naming SYS-R336-PERF-DRAG-WINDOW.
- l.3 is the date; l.4 is exactly `**სტატუსი:** Completed (C round 337 PASS)` (L28); l.5 lists the changed project files.
- The seven TEMPLATE `## ` headings, in order (L26).
- **კონტექსტი:** the six closed ids.
- **მიდგომა:** the three helpers; the GATE335-S1 premise check from §0.2; the notes-only ruling.
- **ტესტირება:** the EQUAL compare, the P/M/D mutants and the perf-lib run, with A's numbers. Every test it names must exist (L26).

**Doc 168:** `## მეტრიკები` is granted whole (L34). Inside it:
- the `commits-per-move` and `move-components-per-move` lines [K16] say the denominator is every pointermove between the pointerdown and the pointerup, the first one included. Afterwards neither line contains `÷ ფანჯრის pointermove-ები` or `÷ move-ები` (K16 second-to-last value 0);
- the lane paragraph says that `move-components-per-move`'s `movesInWindow` includes the first move;
- nothing outside the section changes.

## 2. Acceptance

### 2.1 A rows (A writes `a-round-337.md` and `a-round-337/`)
| Row | Command | Pass |
|---|---|---|
| A-CLAIMS | `bash b-round-336/claims-337.sh` from the loop root, before any edit | Equals `b-round-336/claims-337-planning-output.txt`. A mismatch is a STOP |
| A-TYPE | `npm run typecheck` (it covers `perf/`; Biome does not, L30) | rc 0 |
| A-LINT | `npm run lint` | rc 0, diagnostic count unchanged |
| A-PERF | Production perf, **alone** (L38), once: `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`. Then `python3 -I b-round-329/perf-rowcmp.py c-round-335/perf-results/latest-interactions.json <A's latest-interactions.json>` and `python3 -I b-round-336/rowids-equal.py` (same two files) | <ul><li>rc 0, `failures` [], `complete` true, 193 rows, 36/36 asserted rows pass.</li><li>**139 `EQUAL`, 0 `DIFF`, 0 `NEW`**; `ids-equal 193`.</li><li>`interact.harness.drag-lane-live`, its `.6x` copy and the four `drag-*-live` rows read 1 in every pass; `interact.harness.hook-live` reads as in C round 335.</li><li>Results and outputs saved under `a-round-337/`</li></ul> |
| A-NOTES | `python3 -I b-round-336/notes-only-check.py <(git show HEAD:perf/budgets.interactions.json) perf/budgets.interactions.json b-round-336/notes-changed-ids.txt` | `ids equal order equal nonnote-diffs 0 notes-changed 58 matches-expected True` |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs perf/lib/report.test.ts`. This is the scratch config outside `store/` (GATE304-M1) | 34/34 pass, as on B's sketch [K14] |
| A-MUTANT | <ul><li>Three scratch copies of A's tree, never `store/`. Use `python3 -I b-round-336/make-mutant.py <copy> P`, then `M`, then `D`; each run alone.</li><li>If A's spec text differs from the sketch at an anchor, A applies the same mutation by hand and reports the hunk.</li></ul> | <ul><li>**P:** the pass aborts at `drag lane stopped` with `MU-INJECT-THROW`, and the problems contain `MU-PROBE up-after-last-down true`.</li><li>**M:** the same, but `false`.</li><li>**D:** `rowcmp-1x.py` vs `c-round-335/…` prints `DIFF` for the 1× `move-components-per-move` rows of range, fade, trim and move (stopped and playing) and `interact.drag.fade.30.playing.move-components-per-move`, and for nothing else.</li><li>Logs and results saved under `a-round-337/mutant-{P,M,D}/`; the copies are deleted</li></ul> |
| A-SCOPE | `git status --short` | Exactly the 4 files of §1, with 1 untracked (doc 233); `app/` and `perf/lib/` clean [K15]. The 1-pass mutant runs exit rc 1 by design (the 6× rows are unmeasured); that is not a STOP |
| A-REVIEW | The real `code-reviewer` subagent on the 4 files (the 3+ files rule) | <ul><li>Report its score and findings.</li><li>A Medium+ inside the grants is fixed and then re-reviewed. Code changed after the review goes back to the reviewer (L11).</li><li>A change the reviewer asks for that would alter a value (§1) is a STOP</li></ul> |

A does not run the full vitest suite or `npm run verify` (gate rows).

### 2.2 C rows (C writes `c-round-337.md`, `c-round-337.json` and `c-round-337/`)
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-336/claims-337.sh` at start and end | <ul><li>The only differences from `claims-337-planning-output.txt` are these.</li><li>**K2:** `f1def9c 4`.</li><li>**K3–K7:** exactly the values in `b-round-336/claims-337-sketch-output.txt` (the same script with `CLAIMS_STORE=/home/runner/b336-scratch/sc`, L56): `K3 1 1 0 0 1 1`, `K4 1 1 1 1 1 1`, `K5 3 2 1 1`, `K6 0 1`, `K7 193 0 0 36`.</li><li>**K16:** `1 11 0 8`.</li><li>Anything else is a finding</li></ul> |
| SOURCE-SCOPE | `git status`, `git diff --stat` | <ul><li>Exactly the 4 files; doc 233 the only untracked file.</li><li>`app/` and `perf/lib/` unchanged [K15]; protected 11 OK [K8].</li><li>`DragName`, `dragNames`, the row ids and the pass order are unchanged in the diff</li></ul> |
| NOTES | The A-NOTES command | As A-NOTES. Also read 5 of the 58 changed notes (at least one lane note, one older `commits-per-move` and one older `move-components-per-move`) against the code: same window, denominator "all pointermoves … the first one included" |
| PERF | Production build of A's tree. Run the spec alone, after a browser warm-up (L38). Then run `perf-rowcmp.py` and `rowids-equal.py` vs `c-round-335/perf-results/latest-interactions.json` | <ul><li>rc 0, `failures` [], `complete` true, 193 rows, 36/36 asserted rows pass.</li><li>**139 `EQUAL`, 0 `DIFF`, 0 `NEW`**; `ids-equal 193`. Any `DIFF` is a finding, reported with its value.</li><li>The liveness rows read 1 in all passes</li></ul> |
| MUTANT | <ul><li>C re-runs P, M and D on its own copies of A's tree.</li><li>C adds one mutant of its own that changes a bound inside `dragWindow` (for example, release commits from `t > up`, or moves from `downAt <= t`). C first states which rows it expects to change, then runs it at 1 pass, 1×, with `rowcmp-1x.py`.</li></ul> | P true, M false, D red only on the rows listed in A-MUTANT. C's own mutant changes what C predicted. If it changes nothing, C reports that as an observation with the reason, not as a FAIL. Copies deleted, `store/` unchanged |
| HARNESS-READ | Read both drag functions and the helpers against §1.1 | Every point of §1.1 holds. In particular: the read/timestamp order inside each gesture equals HEAD; the release error is swallowed and the original is rethrown; no filter changed its comparison |
| PERF-LIB | The A-PERF-LIB command | 34/34 |
| G337-AUTH (browser) | As G335-AUTH (`c-round-330/g330-auth.cjs`), in fresh anonymous contexts at 1440×900 and 1280×720 | <ul><li>`/studio-lab` shows the anonymous workspace and the demo badge, with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`.</li><li>`/api/studio-token` with no header returns 401</li></ul> |
| DOCS | Read doc 233 and doc 168 | <ul><li>Doc 233: l.4 byte-exact, seven TEMPLATE headings in order, the §1.3 content, every named test exists.</li><li>Doc 168: the lines of §1.3 say what the code does; `git diff` shows hunks only inside `## მეტრიკები`</li></ul> |

**L57 fields:** C writes all of them:
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified`, `mutantsRecorded`;
- `mutantRedOnSketch`: `b-round-336/mutant-M/` and `b-round-336/mutant-D-rowcmp.txt`;
- `mutantRedOnTree`;
- `gateChecksNamed`, `gateChecksRunOnSketch` (typecheck, perf-lib), `chainHeadGateRunGreen`;
- **from this round (RETRO 336):** `affectedChecksNamed` = the interactions perf spec, `rowcmp`/`rowids-equal`, `notes-only-check`, the perf/lib report test and typecheck. `affectedChecksRunOnSketch` = the same five, with the files of §0.3.

**Gate rows** (not claimed by C): full vitest, build, Biome, typecheck, `npm run verify` and the e2e smoke.

**browserVerified:** PERF, MUTANT (real Chromium runs) and G337-AUTH are browser rows that can run here. None needs the backend.

**Ableton conformance:** not applicable. A measurement harness changes; no behaviour does.

## 3. Neighbouring behaviour that could break
- **Every pre-existing row's value**, through a moved read or timestamp, a changed bound, or a lost detail key. The 139-row EQUAL compare covers it, and mutant D proves the compare can fail.
- **The drags after a failure.** Today a throw aborts the pass, so the release only changes what the instrumentation records. Mutants P and M show the difference.
- **The budget loader and DC-KINDS** read the budget file. The ids, kinds and modes stay unchanged, and PERF-LIB covers both.
- **C round 335's c3-ii baseline** (`c-round-335/lane-rows.txt`) stays valid: the lane rows are in the EQUAL set.

## 4. STOP conditions (A)
- A-CLAIMS mismatch.
- Any `DIFF`, `NEW` or row-id difference.
- Mutant P is not `true`, M is not `false`, or D's `DIFF` set is not the listed one.
- Any change needed outside the 4 files, or to a non-`note` budget field.
- A reviewer request that changes a value (§1).

## 5. Not in scope
- **PERF-DRAG-PREVIEW c3-ii:** the `clipLaneDrag` store, converting the lane rows to `assert`, the provider hooks.
- **c4, c5** and every later PERF task.
- RV-4 (a `commitsPerMove` helper).
- A budget generator or schema change (S4 asked for one only if a generator existed; none does: only the spec and `perf/lib/report.test.ts` reference the file [K18], and `perf/lib/**` is out of scope).
- **Root only:** `vitest.config.ts` (GATE304-M1); commits and pushes.

## 6. Deliverables
- **A:** the 4 files; `a-round-337.md`; `a-round-337/` with the perf results, the rowcmp outputs, the notes check, the perf-lib log and the three mutant folders.
- **C:** `c-round-337.md` and `c-round-337.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`, all L57 fields), with evidence under `c-round-337/`.

## 7. Claims
Run `bash b-round-336/claims-337.sh` from the loop root (`CLAIMS_STORE=<dir>` points it at another tree). The expected output at HEAD is `b-round-336/claims-337-planning-output.txt`. On B's sketch it is `b-round-336/claims-337-sketch-output.txt`.
- **K1:** gate 335 published `f1def9c`; gate 336 skipped, head `f1def9c`.
- **K2:** HEAD's short hash and the `git status` entry count.
- **K3:** in the spec: `dragSteps = 60` and `dragDistancePx = 120` (1 each); the uses of `dragSteps / 6` and `dragDistancePx / 3`; the new constants (0 at HEAD).
- **K4:** `const downAt = whole.downs.at(-1);`, `await page.mouse.down();`, `await page.mouse.up();`, and the new helper names (0 at HEAD).
- **K5:** the 2-space `try {` lines (2 at HEAD: the zoom-probe steps and `runInteractionPass`, none in a drag function; 3 on the sketch, the third in `pressedGesture`), the `} catch (error) {` lines (1 at HEAD, `runInteractionPass`), `result.abortedAt = step;` and `await context.close();`.
- **K6:** the old 30-clip sequence fragment (1 at HEAD) and the new one (0 at HEAD).
- **K7:** the budget row count, the lane notes with the long gesture sentence, the notes with the old denominator wording, and the notes with the new wording.
- **K8:** protected sha, 11 OK.
- **K9:** the `regression-last` date (2026-11-02).
- **K10:** the oracle: rows, `complete`, failures and non-wallclock rows of `c-round-335/perf-results/latest-interactions.json`.
- **K11:** B's v2 sketch run: rows, `complete`, failures and the lane-live and hook-live samples.
- **K12:** the v2 rowcmp counts (EQUAL, DIFF, NEW) and the row-id compare.
- **K13:** the `MU-PROBE` lines of mutants P and M.
- **K14:** the perf/lib report test on the sketch through the scratch config.
- **K15:** `app/` and `perf/lib/` have no diff against HEAD.
- **K16:** these doc counts: a `233-` doc (0 at HEAD); doc 168's `## ` count; doc 168's two denominator lines; TEMPLATE's `## ` count (8, including `## Prompt`).
- **K17:** every cited artifact exists (L56).
- **K18 (L23 sweep):** files in `app/`, `perf/` and `e2e/` that reference `budgets.interactions`. `note` is read only by the loader, which accepts any string.
- **K19:** the instrumentation records each `pointerup` (`state.ups.push`), and `snapshot` has a `(page, from, to)` signature.

## 8. Root notes
- **Commit readiness:** after C PASS, the 4 files of §1 are one test-only change. The gate's full verify and review apply as usual.
- **Still open for root:**
  - checkpoint D-29z915 (with SIG-R331/SIG-R332, deadline the close of c5);
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1);
  - R80-RECORDINGS-FIELD-BORDERS archived by `optimize-backlog.py` although it is open backend evidence (`retro-336.md` §12.4).
- **Next:** REGRESSION-ROUND-2026-11-05 is due at the first planning on or after 2026-11-05 (D-29z1029).
