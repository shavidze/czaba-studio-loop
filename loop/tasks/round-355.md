# CURRENT TASK — Round 355: SYS-R353-DP-TEST-POLISH. DP69, DP70 and DP72 can no longer pass vacuously. Test file and doc 232 only

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 354 → 355 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v317 → v318):
- **D-29z1140:** round 354 is closed as PASS from C's evidence (`c-round-354.json`: PASS, `browserVerified`/`realVerified` true, 0 bugs). Gate 354 published `7219291` [K1].
- **D-29z1141:** the gate-354 review findings (§5).
- **D-29z1142:** this task and its rulings (§0).
- **D-29z1143:** the parallel-execution policy of 2026-11-05 is recorded; this round does not overlap a root lane (§1.1).
- **D-29z1144:** what comes next (§5).

**Read first:**
- `lessons.md` items 4, 11, 22, 23, 26, 28, 29, 52, 56, 57, 58. C also reads 59 and 60.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`. No app source changes, so `AUDIO_ARCHITECTURE.md` is background only.

**L29 note:** untagged code text below is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the screen budget and the YouTube request. This is a test-only round: app source, DOM, audio and behaviour do not change. `ArrangementVideoDock.tsx` and `ArrangementContext.tsx` stay byte-identical [K4].

## Baseline
- HEAD is `7219291` (gate 354, published). The tree is clean [K2].
- **Root lanes (D-29z1143).** Root may apply its own patches before the round on `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` outside doc 232. A HEAD that descends from `7219291` through only those paths is an allowed delta, not a STOP. K2 prints that count; it must be 0.
- Protected files: 11/11 OK [K6]. No dependency change.

## 0. Why, and B's evidence

### 0.1 What closes
SYS-R353-DP-TEST-POLISH (D-29z1132) closes four Lows. All are in `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`.

| Finding | Problem at HEAD | Change (sketch) | Proof: a mutant red on the sketch and green on the HEAD test |
|---|---|---|---|
| A-R350-REVIEW-TEST-NITS (a) | DP70's caption check compares `''` with `''`: no video source is registered in this fixture. A fade commit never changes the gap, so the gap check cannot fail either [K3] | Caption check removed; DP64 guards the caption (`film.mp4`). Gap checks rebuilt around a committed trimStart (start 2.5, playhead 2 s uncovered): <ul><li>trim → gap and overlay `1.000`;</li><li>Undo → no gap and faded;</li><li>Undo → `1.000`;</li><li>Redo → faded, no gap;</li><li>Redo → gap and `1.000`.</li></ul> Preview is `null` at every step | **M-B9** (`b-round-354/sketch/mutant-M-B9.diff.txt`: the gap subscribes only to the position, and a memo never re-renders it) → DP70 red at the gap line after the trim commit; HEAD DP70 green. **M-B8** (gap frozen at mount) → DP70 red; HEAD DP70 green |
| A-R350-REVIEW-TEST-NITS (b) | DP69 `writtenValues` is covered by the old-value check plus the final value | `writtenValues` replaced by `expect(records).toHaveLength(0)`: the release writes nothing. Title: `DP69 the fade release writes nothing to the overlay, so the pre-drag opacity never returns` | **A-M5** (`b-round-350/mutant-A-M5.diff.txt`) → DP69 red, length 3; HEAD DP69 green. M-B1 still makes DP69 red |
| A-R350-REVIEW-TEST-NITS (c) | `'Video Fade In'` literal; `VIDEO_FADE_LABELS` is private [K9] | **Ruled: stays.** Exporting it changes app source, which is outside a test-only task | — |
| A-R352-REVIEW-DRAG-DISTANCE | DP72 checks only the direction of the drag | `expect(shownStart - imported.start).toBeGreaterThan(0.01);` | **FX-SHORTDRAG** (fixture mutant, L23: the drag shrunk to 0.3 px) → red `0.008 > 0.01`; HEAD green |
| A-R352-REVIEW-COMMIT-EXACT | `toBeCloseTo(shownStart, 6)` comes after the seek count | `toBe(shownStart)` placed **before** `toHaveLength(writesBeforeRelease)` | **M-B6** (`b-round-351/mutant-M-B6.diff.txt`): DP72's first red line is now the `toBe` (`expected +0 to be 1`). At HEAD it was the `toBeCloseTo` |
| A-R352-REVIEW-WINDOW-PRECONDITION | A real 20 ms sleep is the only proof that nothing is written after release [K3] | `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })` before `pointerUpAt`, then `await vi.runAllTimersAsync()` inside `act`, then `vi.useRealTimers()` in `finally`. The limit goes in doc 232 item 111: rAF stays stubbed [K3], a timer reference saved at module load is not faked, and the playing path is not exercised | **M-B1-LATE** (M-B1 plus the stopped seek deferred by a 50 ms timer, `run-mutants.sh`) → DP72 red, length 3 ≠ 2; HEAD DP72 **green** (the 20 ms sleep missed it) |

The other mutants keep their red tests: M-B1 → DP69 + DP72, M-B3 → DP58 + DP68, M-B4 → DP59 + DP70 + DP72, M-B7 → DP72 only. Control is 74/74 on both. Full table: `b-round-354/sketch/mutant-summary.txt`. The v1 run is kept in `mutant-summary-v1.txt`. Predictions were written in `b-round-354/checkpoint.md` before each run.

### 0.2 Sketch review (L58)
`b-round-354/sketch/sketch-review.md` opens with the sha256s.
- `tech-lead` found 0 Medium+.
- TL-R355-1, TL-R355-3 and TL-R355-4 are fixed in the sketch. TL-R355-2 is ruled keep. TL-R355-5 is info.
- On the scratch with the sketch: Biome check rc 0 (`sketch-biome.log`), typecheck rc 0 (`sketch-typecheck.log`).
- Both patches were regenerated with `git diff` on a fresh `git archive 7219291` and re-applied there: both files are byte-equal to the sketch (`patch-reproduce.txt`).
- Timing (L31, `timings.txt`): 74 tests, 5.8 s in total. DP72 takes 231 ms and the slowest test 341 ms, against the 5 s default. Nothing is near 50 %.

## 1. Scope (A)

### 1.1 Files (exactly 2)
| # | File | Change |
|---|---|---|
| 1 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | `git apply ../tmp/studio-real-loop/b-round-354/sketch/test.patch.txt`, unchanged. Afterwards the file is byte-equal to `b-round-354/sketch/drag-preview-render.test.sketch355.tsx` (`cmp`) |
| 2 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | `git apply ../tmp/studio-real-loop/b-round-354/sketch/doc232.patch.txt`, unchanged (§1.2) |

**Untouched:**
- the rest of `app/`, including the dock, the context and `ArrangementClip.tsx`;
- `perf/`, `e2e`, config and the protected files.

No root-lane file is granted (D-29z1143). Mutants live only in scratch copies.

### 1.2 Doc 232 (Georgian, technical terms in English; content of `doc232.patch.txt`; the whole stage section is granted, L34)
- **l.1:** the title appends `, ეტაპი dp-test-polish — DP69/DP70/DP72-ის გამკაცრება`.
- **l.4 (L28):** `…, video-trim-fade-cost-2, dp-test-polish; C round 355 PASS)`.
- **New section** `### ეტაპი dp-test-polish: …` (items 109–112), before `### განხილული ალტერნატივები`: the reason, the changes, the coverage limit (item 111) and B's mutants.
- **Changed files:** one bullet.
- **Testing:** the DP69/DP70 descriptions (round 350 line) and the DP72 description (rounds 351–352 line) now match the new tests. "20 ms settle" no longer appears (L26).
- **TODO:** video-trim-fade-cost-2 is struck as done, plus the dp-test-polish line.
- **`## ` count stays 7** [K5].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-354/claims-355.sh` from the loop root | equals `b-round-354/claims-355-planning-output.txt` (K2 may show the allowed root-lane delta with `outside-root-lanes… 0`) |
| A-CLAIMS final | same | K3 and K5 equal `b-round-354/claims-355-sketch-output.txt`; K2 = `<HEAD> 2 … 0`; K7 = `diff-lines-outside-2 0 untracked 0`; every other K equals the planning output |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 (`a-round-354.md`: 205) |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | 74/74. Also run `npx biome check` on the test file: rc 0 (`biome.json` does process `app/**`, L30) |
| A-MUTANT (scratch only) | Build the scratch as in round 348 (`git archive` HEAD, `git diff HEAD` applied, `node_modules` symlinked). Run `bash b-round-354/sketch/run-mutants.sh <scratch> <a-round-355/mut>` after copying B's `drag-preview-render.test.head.tsx` and `.sketch355.tsx` into that out dir (the script reads them from `$O`) | Each sketch line of A's `mutant-summary.txt` names the same red test ids, and the same first failing line, as B's `mutant-summary.txt`. M-B6 is compared on its DP72 entry only. `store/` `git status` is unchanged |
| A-REVIEW | not required: 2 files, a test and a doc (the 3-file rule). If A runs it anyway, it passes any Architecture note to B | — |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-354/claims-355.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check` of both patches; `cmp` with the sketch file | <ul><li>2 modified files, 0 untracked; both patches reverse-apply; the test file is byte-equal to the sketch.</li><li>Dock and context sha unchanged [K4].</li></ul> |
| ASSERT-LOSS (L4) | Read the test diff | Every removed `expect` has an equal or stronger replacement, or the ruling in §0.1: caption (DP64 guards it), `writtenValues` (subsumed), `toBeCloseTo` (→ `toBe`), the 20 ms sleep (→ timer drain). Any other removed assert is a FAIL |
| UNIT | A-UNIT's command | 74/74 |
| MUTANT (C's own, predicted first in `c-round-355/progress.json`) | <ul><li>Re-run M-B1-LATE, FX-SHORTDRAG and M-B9 with `run-mutants.sh` on C's own scratch.</li><li>Plus one mutant of C's own design that targets a new line. For example, make `pointerUpAt`'s release in the dock write one extra seek through `setTimeout(…, 200)`, or remove `vi.useRealTimers()` from the `finally` block and check whether later tests break.</li></ul> | <ul><li>The three re-runs match B's lines.</li><li>C's own mutant is reported with its numbers. One that stays green is a finding against B only if it shows a new line can pass vacuously.</li><li>Scratch deleted under `c-round-355/` only (L60); `store/` unchanged.</li></ul> |
| FAKE-TIMER-LEAK | Run the whole file with `--sequence.shuffle --sequence.seed=1 --reporter=verbose` and again with `--sequence.seed=2`. Read the run order from the verbose lines | <ul><li>74/74 both times.</li><li>In seed 1, DP72 is followed by at least one test (L52: otherwise the row proves nothing about a leak). B's run: DP72 at index 27, with 46 tests after it. In seed 2, DP72 ran last.</li><li>Evidence: `b-round-354/sketch/shuffle-runs.txt`, `shuffle-seed1.log`.</li></ul> |
| STUDIO-SMOKE-355 (browser, dev :5173, 1440×900 and 1280×720) | Run `node c-round-350/video-behaviour-probe.mjs …` and `video-behaviour-probe-y8.mjs …` as in round 354 | equal to `c-round-354/behaviour-*.json` except the blob `src`. Behaviour is unchanged |
| G355-AUTH (browser, both viewports) | `c-round-354`'s auth script, copied to `c-round-355/` | <ul><li>`/studio-lab` opens the demo anonymously, with `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>`/api/studio-token?product=middle-east&file=stem.wav` returns 401 with no header. A fake bearer gets 403 with the mock up; with it down, a 500 that fails closed goes under `blocked`.</li><li>No token in any body.</li></ul> |
| DOCS | doc 232 | <ul><li>l.4 ends `video-trim-fade-cost-2, dp-test-polish; C round 355 PASS)`.</li><li>One `### ეტაპი dp-test-polish` section; 7 `## `; `20 ms settle` 0 times.</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files (L28).</li><li>Every DP69/DP70/DP72 behaviour the doc states has a matching assert in the test (L26).</li><li>`## ` headings in TEMPLATE order (L26).</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified:** STUDIO-SMOKE-355 and G355-AUTH run here and need no backend. If either does not run, `browserVerified` is false.

**Ableton conformance:** not applicable (test-only; behaviour identical).

**L57:** write every field in `c-round-355.json` and run `python3 -I tools/l57-check.py c-round-355.json c-round-355/l57-check.txt` until it exits 0.
- `assertsSpecified`: the six tightened asserts of §0.1.
- `mutantsRecorded`: M-B1-LATE, FX-SHORTDRAG, M-B8, M-B9, A-M5, M-B6, plus C's own.
- `mutantRedOnSketch`: `b-round-354/sketch/mutant-summary.txt`.
- `gateChecksRunOnSketch`: `b-round-354/sketch/sketch-typecheck.log`, `sketch-biome.log`, `mut-control-sketch.json`.
- `affectedChecksNamed`: `drag-preview-render.test.tsx`.

## 3. Neighbouring behaviour that could break
- **Fake timers leaking.** `finally` restores real timers before DP72's later `waitFor`. FAKE-TIMER-LEAK checks the other tests in shuffled order.
- **React flushing under fake `setTimeout`.** React's scheduler uses `setImmediate`, which is not faked (tech-lead). DP72 passed 74/74 in every control run.
- **The timer drain's own limit.** `vi.runAllTimersAsync()` aborts after 10 000 timers if something in the mounted tree keeps rescheduling itself through `setTimeout`. Nothing does today. If DP72 fails with "Aborted after running 10000 timers", that is a harness finding, not a seek regression: read the message before ruling.
- **DP70 Redo order.** The history holds two entries (fade, trim). A history-cap change elsewhere would show up here. None is in scope.
- **Doc 232:** only the places in §1.2 change.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1. A HEAD descendant through root-lane paths only is not a mismatch.
- A patch does not apply, or a change is needed outside the 2 files.
- A-UNIT is not 74/74, or a test is above 50 % of its timeout (L11).
- A-MUTANT: a sketch red set or first failing line differs from B's.

## 5. Routed, not in scope
- **Gate 354 review (D-29z1141).**
  - GATE354-S1 (Low, the "Record until…" clause in the 12 notes) goes to PERF-CAND-VIDEO-MOVE-BUDGET, the next budgets-only edit.
  - GATE354-S2 (Low, headroom) is ruled intended and closed.
  - The doc-232 split proposal becomes the signal GATE354-ARCH-DOC232-SPLIT, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE.
- **INFO-C354-MUT-VACUOUS:** recorded; red evidence for the 12 rows stays M-B2.
- **GATE352-S1's trigger** ("the next task that touches the dock") is not fired: this round does not touch the dock.
- **Still open:** ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE has no root answer (non-blocking). ROOT-REQ-PERF-TIMEOUT stays a Saba question. SR-353-1 and SR-353-4 stay `awaiting_user`.
- **Next (D-29z1144):**
  1. PERF-CAND-VIDEO-MOVE-BUDGET.
  2. PERF-CAND-MASTER-GROUP-FADER-PROPS if the checkpoint is answered; otherwise PERF-CAND-FADE-RELEASE-COMMITS or PERF-9.
  3. PERF-9 … PERF-15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2, under the skip rule.

  A planning on or after 2026-11-08 runs REGRESSION first.

## 6. Deliverables
- **A:** the 2 files; `a-round-355.md` with the A rows; logs in `a-round-355/`.
- **C:** `c-round-355.md`, `c-round-355.json` and `c-round-355/` (with `progress.json` after each row, L59).

## 7. Claims
Run `bash b-round-354/claims-355.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree.
- **Expected outputs:**
  - `b-round-354/claims-355-planning-output.txt`: HEAD.
  - `b-round-354/claims-355-sketch-output.txt`: B's scratch `/home/runner/b354-scratch/sc` with both patches applied. K2 reads `no-git` there, and K7 is not meaningful there.
- **The claims:**
  - **K1:** gate 354 is `published` at `7219291`.
  - **K2:** HEAD, the `git status` entry count, and the files changed since `7219291` outside the root lanes.
  - **K3:** the test file:
    - the `it(` count and the two new titles;
    - `writtenValues`, `committedCaption`, `setTimeout(resolve, 20)`, `runAllTimersAsync`, the distance guard, `toBeCloseTo(shownStart, 6)`, `toBe(shownStart)`;
    - the rAF stub;
    - the sha256.
  - **K4:** dock and context sha256; the gap hook line; the stopped-seek chain; `seekSfxVideo`'s synchronous `currentTime` write.
  - **K5:** doc 232: the `## ` count, the l.4 strings, the section, `D-29z1142`, `20 ms settle`, and the count of `pending` docs.
  - **K6:** protected files OK.
  - **K7:** diff lines outside the 2 files; untracked files.
  - **K8:** the `regression-last` date.
  - **K9:** `VIDEO_FADE_LABELS` is private, and the `'Video Fade In'` literal count in the test.
  - **K10:** the sha256 of both patches.
  - **K11:** every cited artifact exists (`b-round-354/cited-artifacts.txt`; prints `N listed, 0 missing`, L56).
