# CURRENT TASK — Round 356: PERF-CAND-VIDEO-MOVE-BUDGET. The video clip move rows catch a dock re-render; stale "Record until" notes go. Budgets and doc 232 only

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 355 → 356 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v318 → v319):
- **D-29z1145:** round 355 is closed as PASS from C's evidence (`c-round-355.json`: PASS, `browserVerified`/`realVerified` true, 0 bugs; B's `tools/l57-check.py` run rc 0, `b-round-355/l57-check-c355.txt`). Gate 355 published `6588f08` [K1]. Four Lows close.
- **D-29z1146:** the gate-355 review findings (§5).
- **D-29z1147:** this task and its rulings (§0).
- **D-29z1148:** what comes next (§5).

**Read first:**
- `lessons.md` items 10, 11, 22, 28, 29, 34, 37, 38, 56, 57 and 58. C also reads 59 and 60.
- Primitives: `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md` (doc 232). No app source changes, so `AUDIO_ARCHITECTURE.md` is background only.

**L29 note:** untagged code text below is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the screen budget and the YouTube request. This is a performance-budget round: app source, DOM, audio and behaviour do not change. `ArrangementVideoDock.tsx`, `ArrangementContext.tsx` and the perf spec stay byte-identical [K4] [K9].

## Baseline
- HEAD is `6588f08` (gate 355, published). The tree is clean [K2].
- **Root lanes (2026-11-05 parallel policy).** Root may apply its own patches before the round on `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` outside doc 232. A HEAD that descends from `6588f08` through only those paths is an allowed delta, not a STOP. K2 prints that count; it must be 0. This round does not touch a root-lane file.
- Protected files: 11/11 OK [K6]. No dependency change.
- **Oracle:** `c-round-354/perf-results/latest-interactions.json` (252 rows, `complete`, 0 failures, 82/82 asserted pass). App code has not changed since C measured it: rounds 354 and 355 changed only the budgets file, a test file and doc 232. The dock and context sha256 are the same as in round 354 [K4].

## 0. Why, and B's evidence

### 0.1 Premise
- When round 354 was planned, B's mutant M-B2 (`b-round-350/mutant-M-B2.diff.txt`: the dock selects the video lane's preview clips, so it re-renders on every video preview write) changed the video clip **move** rows:
  - stopped per-move: 9.883 → 15.75;
  - stopped max: 13 → 17;
  - playing max: 12 → 17.
- None of them failed. The stopped per-move row is asserted at `<= 24`, and both max rows are `record` [K3].
- Gate 354's review also found that asserted rows still say "Record until C measures it" before their assert sentence (GATE354-S1).

### 0.2 The change (`b-round-355/sketch/apply-budgets.py` → `b-round-355/sketch/budgets.patch.txt`)
**Owner** of the three rows below: `PERF-CAND-VIDEO-MOVE-BUDGET`. Doc 232 §114 defines it.

**Budget rule.** A `<=` budget on a per-move row is the ceiling of the measured value. A `max` row gets no headroom, because it is deterministic (the round-348 rule).

| Row | Now [K3] | After | Measured (three equal samples per run, 1x) |
|---|---|---|---|
| `interact.drag.video.stopped.move-components-per-move` | assert `<= 24` | `<= 10` | 9.883 in C350, B353 sketch, C354 and B355 sketch |
| `interact.drag.video.stopped.move-components-max` | record | assert `<= 13` | 13 in all four |
| `interact.drag.video.playing.move-components-max` | record | assert `<= 12` | 12 in all four |

Asserted rows go from 82 to 84, out of 252 [K3].

**Notes (GATE354-S1, widened by class, L7).** The stale sentence "Record until …" is removed from every **asserted** note that still has it. That is 19 notes:
- the 12 rows asserted in round 354;
- the 5 asserted c5-ii video move rows;
- the 2 max rows above.

In 16 of those rows only `note` changes. In the 3 rows above, `mode` (2 rows), `budget`, `owner` and `note` change. The 14 `record` rows that still say "Record until" are left as they are [K3]. In the trim/fade notes, the remaining "kind copied from" starts the sentence, so it becomes "Kind copied from".

**Rulings (D-29z1147):**
- **Video max rows are asserted, audio max rows are not.** The audio move/lane/group max rows stay `record` (the c5-i note: "record, as every move/lane/group max row") [K3]. The video scenario is different: it runs at 1x on one clip, and its max repeated exactly in every sample of four runs. The sentence in both video max notes is replaced, so it no longer says "record".
- **The playing max is asserted with no headroom.** `performance-optimizer` and `tech-lead` (TL-R356-1) both say a playback tick does not share a commit with a pointermove: they run in different tasks. Tick commits are about 3 components, because the playhead and the time are written to the DOM directly, and Follow pauses during a drag. `tech-lead` also notes that `determinismFailure` already checks deterministic rows in record mode, so the assert adds a failure only when all three samples move together.
- **`interact.drag.video.playing.move-components-per-move` stays `record`.** Its `kind` is wallclock [K3], and the samples move between 9.883 and 9.95 because a tick adds a window commit. This is the round-354 rule, not a scope cut.

**Margin.** Stopped, 60 moves give 593 components. `<= 10` allows 600, so 8 or more extra components in the window turn the row red (TL-R356-2, fixed in the note). Before calling a red per-move row a regression, read its `windowCommits` and `componentsSum` detail.

### 0.3 B's sketch runs (production, alone, one after another; `b-round-355/run-perf.sh`; summary `b-round-355/perf-summary.txt`)
The predictions were written in `b-round-355/checkpoint.md` before the runs.
- **Trees:** the scratch is `git archive 6588f08` with the budgets applied (`/home/runner/b355-scratch/sc`). The mutant tree is that scratch plus M-B2 on the dock (dock sha256 `53ecfbc7…`, the same as round 353's M-B2).

| Run | rc | Asserted pass | Result |
|---|---|---|---|
| **Sketch** | 0 | **84/84** | <ul><li>0 NEW; 0 deterministic component/commit rows higher than C354.</li><li>`durationMs` 449712.</li><li>Video move: per-move 9.883 ×3, stopped max 13 ×3, playing max 12 ×3.</li></ul> |
| **M-B2** | 1 | 75/84 | **Exactly 9 rows are red**, as predicted: <ul><li>the 3 rows of this task: per-move 15.75 > 10, stopped max 17 > 13, playing max 17 > 12;</li><li>the 6 rows already red under M-B2 in round 353: video-trim stopped per-move 18.683, max 19 / 19; video-fade stopped per-move 8.85, max 9 / 9.</li></ul> Every audio assert is green |

- **PERF-LIB on the sketch:** 40/40 (`b-round-355/sketch-perf-lib.log`).
- **The run-1 sketch.** Both perf runs used the run-1 sketch (`b-round-355/sketch/budgets.patch.run1.txt`). The dispatched file differs from it only in one `note` string (TL-R356-2), and the harness does not read `note` [K9]: the two `perf/lib` hits are `budgets.ts`, which declares the field and copies it, and `report.test.ts`, which builds a fixture with `note: ''`.

**Sketch review (L58):** `b-round-355/sketch-review.md` opens with the dispatched sha256s.
- `tech-lead` and `performance-optimizer` found 0 Medium+.
- TL-R356-2 is fixed in the sketch. TL-R356-1 is ruled keep-assert. The rest are info.

## 1. Scope (A)

### 1.1 Files (exactly 2)
| # | File | Change |
|---|---|---|
| 1 | `perf/budgets.interactions.json` | `git apply ../tmp/studio-real-loop/b-round-355/sketch/budgets.patch.txt`, unchanged. Afterwards its sha256 equals `b-round-355/sketch/budgets-dispatched.sha256` |
| 2 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | `git apply ../tmp/studio-real-loop/b-round-355/sketch/doc232.patch.txt`, unchanged (§1.2). Afterwards the file is byte-equal to `b-round-355/sketch/doc232.sketch356.md` (`cmp`) |

**Untouched:**
- all of `app/`;
- `perf/*.spec.ts`, `perf/lib`, `perf/budgets.json` and `perf/budgets.resources.json`;
- `e2e`, config and the protected files.

The mutant lives only in scratch copies.

### 1.2 Doc 232 (Georgian, technical terms in English; the content of `doc232.patch.txt`; the whole stage section is granted, L34)
- **l.1, the title:** appends `, ეტაპი video-move-budget — video move-ის budget-ების გამკაცრება`. GATE355-L5 (the title is long) is routed to the doc-split signal, not fixed here.
- **l.4, the status (L28, no `pending`):** `…, dp-test-polish, video-move-budget; C round 356 PASS)`. This line is granted.
- **New section** `### ეტაპი video-move-budget: video move-ის budget-ების გამკაცრება (round 356, D-29z1147)`, items 113–117, placed before `### განხილული ალტერნატივები`. It contains:
  - the reason;
  - the table in §0.2 and the rows that stay `record`;
  - the note cleanup;
  - the margin and the consult rulings;
  - B's sketch run and the mutant.
- **Changed files:** one bullet for this stage.
- **TODO:** the dp-test-polish line is struck as done (C round 355 PASS). A new video-move-budget line gives the next order, and the rest of the old line is kept.
- **The `## ` count stays 7** [K5].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-355/claims-356.sh` from the loop root | equals `b-round-355/claims-356-planning-output.txt` (K2 may show the allowed root-lane delta with `outside-root-lanes… 0`) |
| A-CLAIMS final | same | <ul><li>K3 and K5 equal `b-round-355/claims-356-sketch-output.txt`.</li><li>K2 = `<HEAD> 2 outside-root-lanes-since-6588f08 0`.</li><li>K7 = `diff-lines-outside-2 0 untracked 0`.</li><li>Every other K equals the planning output.</li></ul> |
| A-READ | `python3 -I b-round-355/sketch/read-diff.py /home/runner/czaba-project/store` | equals `b-round-355/sketch/read-diff-sketch.txt` |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 (`a-round-355.md`: 205) |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1: the gate does not run these) | 40/40 |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`. Then `python3 -I b-round-329/perf-rowcmp.py c-round-354/perf-results/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` [].</li><li>252 rows; **84/84** asserted pass; 0 NEW.</li><li>No deterministic components or commits row is higher than C354.</li><li>`durationMs` ≤ 540000, and recorded (ROOT-REQ-PERF-TIMEOUT evidence).</li></ul> |
| A-MUTANT (perf, scratch only, L59/L60) | Build the scratch as in `tasks/round-348.md` §2.1 A-MUTANT: `git archive` HEAD, apply the store diff, symlink `node_modules`. Then `patch -p0 app/components/arrangement/ArrangementVideoDock.tsx < b-round-350/mutant-M-B2.diff.txt`, and run the interactions spec alone | <ul><li>Red on exactly the 9 ids under `mu-b2` (`RED` lines) in `b-round-355/perf-summary.txt`, with the same values.</li><li>`store/` `git status` is unchanged by the mutant.</li><li>If the job is short on time, A may cite B's M-B2 run instead and say so at the top of `a-round-356.md`.</li></ul> |
| A-REVIEW | not required: 2 files, a JSON budget file and a doc (the 3-file rule). If A runs it anyway, it passes any Architecture note to B | — |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-355/claims-356.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check` of both `b-round-355/sketch/*.patch.txt`; `sha256sum perf/budgets.interactions.json`; `cmp` of doc 232 with `b-round-355/sketch/doc232.sketch356.md` | <ul><li>2 modified files, 0 untracked; both patches reverse-apply.</li><li>The budgets sha256 equals `b-round-355/sketch/budgets-dispatched.sha256`, and doc 232 is byte-equal.</li><li>The dock, the context and the spec are unchanged [K4] [K9].</li></ul> |
| READ | `python3 -I b-round-355/sketch/read-diff.py /home/runner/czaba-project/store`, plus C's own reading of the 19 notes | <ul><li>Output equals `b-round-355/sketch/read-diff-sketch.txt`: 19 changed, 233 equal; field sets `note` ×16, `budget,mode,note,owner` ×2, `budget,note,owner` ×1.</li><li>Each of the 16 note-only rows only loses the "Record until …" sentence; nothing else in the note changes, except "kind copied" → "Kind copied".</li><li>No asserted note contains "Record until" (K3 `assert-notes-with-record-until 0`).</li></ul> |
| PERF (browser, production, alone) | A-PERF's command | as A-PERF: 84/84, 0 NEW, none higher than C354. `durationMs` recorded |
| MUTANT (C's own, scratch, predicted first in `c-round-356/progress.json`) | A mutant that is **not** M-B2 and that should affect the video **move** drag, run alone on the interactions spec. Two examples: <ul><li>remove `memo` from a component that renders in a video move commit (names from `c-round-350/names.json`, or a dev names probe);</li><li>make the video caption re-render on every preview write.</li></ul> | <ul><li>Red on the predicted rows among the 3 changed rows.</li><li>Scratch deleted under `c-round-356/` only (L60); `store/` unchanged.</li><li>A mutant that stays green on all 3 is reported with its numbers. It is a finding against B's budgets only if a video move per-move or max value rose above the C354 value and still passed.</li></ul> |
| PERF-LIB | A-PERF-LIB | 40/40 |
| VIDEO-DRAG-SMOKE (browser, dev :5173, 1440×900 and 1280×720) | `node c-round-350/video-behaviour-probe.mjs http://127.0.0.1:5173 c-round-356/behaviour-1440x900.json 1440x900` and `node c-round-350/video-behaviour-probe-y8.mjs http://127.0.0.1:5173 c-round-356/behaviour-y8-1280x720.json 1280x720` | Equal to `c-round-354/behaviour-1440x900.json` and `c-round-354/behaviour-y8-1280x720.json`, except the blob `src`. So behaviour is unchanged and the video drags are live (the guard against the asserted rows passing vacuously, L37) |
| G356-AUTH (browser, both viewports) | `c-round-354/auth.mjs`, copied to `c-round-356/` (L48: wait for `Demo collection ready`; warm up first, L38) | <ul><li>`/studio-lab` opens the workspace with the demo badge, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>`/api/studio-token?product=middle-east&file=stem.wav` returns 401 with no header. A fake bearer gets 403 when the mock on :5199 is up. When the mock is down, a 500 that fails closed goes under `blocked`.</li><li>No token in any body.</li></ul> |
| DOCS | doc 232 | <ul><li>l.4 ends `dp-test-polish, video-move-budget; C round 356 PASS)`.</li><li>One `### ეტაპი video-move-budget` section; 7 `## `.</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files (L28) [K5].</li><li>Every video move budget the doc states matches the live file (L34).</li><li>`## ` headings in TEMPLATE order (L26).</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified:** PERF, MUTANT, VIDEO-DRAG-SMOKE and G356-AUTH all run here, and none needs the backend. If any of them does not run, `browserVerified` is false.

**Ableton conformance:** not applicable (budget change; behaviour identical).

**L57: write all L57 fields** in `c-round-356.json` and run `python3 -I tools/l57-check.py c-round-356.json c-round-356/l57-check.txt` until it exits 0.
- `assertsSpecified`: the 3 ids of §0.2.
- `mutantsRecorded`: B's M-B2 and C's own.
- `mutantRedOnSketch`: `b-round-355/perf-mu-b2-results/latest-interactions.json`.
- `gateChecksRunOnSketch`: `b-round-355/perf-sketch.log` and `b-round-355/sketch-perf-lib.log`.
- `affectedChecksNamed`: the interactions perf spec and the perf-lib tests.

## 3. Neighbouring behaviour that could break
- **A flaky assert.** The changed rows are deterministic component counts with three equal samples in each of four runs. A playback tick does not join a pointermove commit (§0.2). Wallclock rows stay `record` (L37).
- **The spec timeout.** No row is added, so the duration does not change. B measured 449712 ms. A run above 540000 ms is a STOP for A and a recorded fact for C. It is not a budget failure (ROOT-REQ-PERF-TIMEOUT stays a Saba question).
- **The perf-lib tests** read `budgets.interactions.json`. They passed 40/40 on the sketch.
- **Doc 232:** only the places in §1.2 change.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1. A HEAD that descends through root-lane paths only is not a mismatch.
- A patch does not apply, or a change is needed outside the 2 files.
- A-READ differs from `read-diff-sketch.txt`.
- A-PERF: any asserted row fails; any NEW row; any deterministic components or commits row higher than C354; or `durationMs` above 540000.
- A-MUTANT: the red id list differs from `perf-summary.txt` under `mu-b2`. Compare id by id.

## 5. Routed, not in scope
- **Gate 355 review (D-29z1146):**
  - GATE355-L1 (DP69's redundant `oldValue` check) and GATE355-L3 (the unnamed `0.01`) go to `deferred_low_polish`, for the next round that owns `drag-preview-render.test.tsx`.
  - GATE355-L2 (the `'Video Fade In'` literal, the same as A-R350-REVIEW-TEST-NITS (c)) goes to `deferred_low_polish` with the trigger "next task that touches `ArrangementClip.tsx`".
  - GATE355-I4 is recorded as info: doc 232 item 111 already states it.
  - GATE355-L5 (the title length) joins GATE354-ARCH-DOC232-SPLIT.
  - The Architecture note (move DP66–DP72 into their own file) becomes the signal GATE355-ARCH-DP-VIDEO-SPLIT, joined to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3. It is not scheduled.
- **Closed by round 355 (D-29z1145):** A-R350-REVIEW-TEST-NITS (a) and (b), A-R352-REVIEW-COMMIT-EXACT, A-R352-REVIEW-DRAG-DISTANCE, A-R352-REVIEW-WINDOW-PRECONDITION.
- **Still open:**
  - ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE has no root answer (non-blocking).
  - ROOT-REQ-PERF-TIMEOUT stays a Saba question.
  - SR-353-1 and SR-353-4 stay `awaiting_user`.
- **Next (D-29z1148):**
  1. PERF-CAND-MASTER-GROUP-FADER-PROPS if the checkpoint is answered; otherwise PERF-CAND-FADE-RELEASE-COMMITS (with the video fade `release-commits` 2/2) or PERF-9.
  2. Then PERF-9 … PERF-15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2, under the skip rule.

  A planning on or after 2026-11-08 runs REGRESSION first. RETRO is due at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Deliverables
- **A:** the 2 files; `a-round-356.md` with the A rows; logs in `a-round-356/`.
- **C:** `c-round-356.md`, `c-round-356.json` and `c-round-356/` (with `progress.json` after each row, L59).

## 7. Claims
Run `bash b-round-355/claims-356.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree.
- **Expected outputs:**
  - `b-round-355/claims-356-planning-output.txt`: HEAD.
  - `b-round-355/claims-356-sketch-output.txt`: B's scratch `/home/runner/b355-scratch/sc` with both patches applied. K2 reads `no-git` there, and K7 is not meaningful there.
- **The claims:**
  - **K1:** gate 355 is `published` at `6588f08`.
  - **K2:** HEAD, the `git status` entry count, and the files changed since `6588f08` outside the root lanes.
  - **K3:** the budgets file:
    - the row count and the assert count;
    - `mode`/`kind`/`budget`/`owner` of the three changed rows and of the video playing per-move row;
    - asserted notes with "Record until", and all notes with it;
    - the count of the new owner;
    - the mode of the audio move max rows;
    - the sha256.
  - **K4:** dock and context sha256.
  - **K5:** doc 232: the `## ` count, the l.4 strings, the section, `D-29z1147`, the count of `pending` docs, and the count of `In Progress (stage` docs.
  - **K6:** protected files OK.
  - **K7:** diff lines outside the 2 files; untracked files.
  - **K8:** the `regression-last` date.
  - **K9:** the spec sha256; whether the spec or `perf/lib` reads `note` or `owner`.
  - **K10:** the sha256 of both patches.
  - **K11:** every cited artifact exists (`b-round-355/cited-artifacts.txt`; prints `N listed, 0 missing`, L56).
