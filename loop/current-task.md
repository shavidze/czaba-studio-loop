# CURRENT TASK — Round 354: PERF-CAND-VIDEO-TRIM-FADE-COST stage 2. Twelve video trim/fade perf rows go from `record` to `assert` at C round 350's values. Budgets and doc 232 only

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 353 → 354 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v316 → v317):
- **D-29z1135:** round 353 (RETRO 353) is closed as PASS from C's evidence. `c-round-353.json`: PASS, `browserVerified`/`realVerified` true, 0 app bugs. B re-ran `tools/l57-check.py` on it: rc 0 (`b-round-353/l57-check-c353.txt`). Gate 353 skipped ("no real changes"), so the baseline stays `a55543b` [K1].
- **D-29z1136:** C-R353-01 and C-R353-02 (Low, both against B's text) are fixed at this planning (§5).
- **D-29z1137:** the screen review, ROOT-REQ-PERF-TIMEOUT and the architecture checkpoint (§5).
- **D-29z1138:** the shape of stage 2 (§0).
- **D-29z1139:** this task, and what comes next.

**Read first:**
- `lessons.md` items 10, 11, 22, 28, 29, 34, 37, 38, 56, 57 and 58. C also reads 59 and 60.
- Primitives: `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md` (doc 232).
- No app source changes, so `AUDIO_ARCHITECTURE.md` is background only.

**L29 note:** untagged code text below is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Not applicable:** reference-first, product-designer, the screen budget and the YouTube request. This is a performance-budget round: app source, DOM, audio and behaviour do not change. `ArrangementVideoDock.tsx`, `ArrangementContext.tsx` and the perf spec stay byte-identical [K4] [K10].

## Baseline
- HEAD is `a55543b` (gate 352, published). Gate 353 was skipped. The tree is clean [K2].
- Protected files: 11/11 OK [K6]. No dependency change.
- **Oracle:** `c-round-350/perf-results/latest-interactions.json` (252 rows, `complete`, 0 failures, 70/70 asserted pass).
  - C measured it on the dock sha256 `037f62fa…` and context sha256 `ff46799c…`. Both are unchanged at HEAD [K4]. Round 352 changed only a test file and doc 232.
  - So C350's numbers are the numbers of this tree's app code.

## 0. Why, and B's evidence

### 0.1 Premise
- Stage 1 (rounds 350–352) stopped the video dock from rendering on every trim, fade and move pointermove. Its measured effect was in C round 350:
  - video trim per move: 18.683 → 12.817;
  - video fade per move: 8.85 → 2.95.
- All 22 video trim/fade rows are still `record` [K3]. A regression that brings the dock render back would therefore fail no video row.
- B's run shows that a regression of that kind fails audio rows only when it re-renders on audio drags as well. Mutant M-B2 in §0.3 does not, so today nothing would catch it.

### 0.2 The conversion (`b-round-353/sketch/apply-budgets.py` → `b-round-353/sketch/budgets.patch.txt`)
**Owner:** `PERF-CAND-VIDEO-TRIM-FADE-COST-2`. Doc 232 §106 defines it.

**Budget rule:**
- Each `<=` budget is the ceiling of C round 350's value. All three samples were equal at 1x.
- Each `==` budget is C round 350's value.
- `max` rows have no headroom, because they are deterministic (the round-348 rule).

| Row | Now [K3] | After | C350 |
|---|---|---|---|
| `interact.drag.video-trim.stopped.move-components-per-move` | record | `<= 13` | 12.817 ×3 |
| `interact.drag.video-trim.stopped.move-components-max` | record | `<= 15` | 15 ×3 |
| `interact.drag.video-trim.playing.move-components-max` | record | `<= 15` | 15 ×3 |
| `interact.drag.video-trim.stopped.release-commits` | record | `== 1` | 1 ×3 |
| `interact.drag.video-trim.playing.release-commits` | record | `== 1` | 1 ×3 |
| `interact.drag.video-trim.playing.move-restarts` | record | `== 0` | 0 ×3 |
| `interact.drag.video-fade.stopped.move-components-per-move` | record | `<= 3` | 2.95 ×3 |
| `interact.drag.video-fade.stopped.move-components-max` | record | `<= 3` | 3 ×3 |
| `interact.drag.video-fade.playing.move-components-max` | record | `<= 3` | 3 ×3 |
| `interact.drag.video-fade.playing.move-restarts` | record | `== 0` | 0 ×3 |
| `interact.harness.drag-video-trim-live` | record | `== 1` | 1 ×3 |
| `interact.harness.drag-video-fade-live` | record | `== 1` | 1 ×3 |

That is 12 rows. Asserted rows go from 70 to 82, out of 252 [K3].

**Ten rows stay `record`.** This follows the file's own rules; it is not a scope cut (D-29z1138).
- **Four `move-to-paint-p95` rows and the two `playing.move-components-per-move` rows.** All six are `kind: wallclock`, and the file has no wallclock assert. The trim playing samples are not equal: C350 had 12.883 / 12.883 / 12.817, and B had 12.883 / 12.817 / 12.817. A playback tick adds a window commit. Making those rows deterministic would change the harness contract, not just the budgets.
- **Two `release-restarts` rows** (31). No `release-restarts` row is asserted anywhere in the file (the c5-i note).
- **Two video-fade `release-commits` rows** (2 / 2). The second fade commit is not explained yet, and the audio fade rows stay `record` for the same reason. Both go to PERF-CAND-FADE-RELEASE-COMMITS.

**Margin (`tech-lead`).**
- In every stopped sample, 60 moves produce 59 window commits: trim 769 / 60, fade 177 / 60.
- One more full commit takes trim to 782 / 60 = 13.03, and a 4-component commit takes fade over 3.
- That is the correct signal: when stopped there is no clock, so an extra window commit means an extra render on the drag.
- Before calling a red per-move row a regression, read its `windowCommits` and `componentsSum` detail.

### 0.3 B's sketch runs (production, alone, one after another; `b-round-353/run-sketch-perf.sh`, `run-mb2.sh`; summary `b-round-353/perf-summary.txt`)
**Trees and predictions:**
- The scratch tree is a `git archive` of HEAD with the budgets applied: `/home/runner/b353-scratch/sc`.
- The two mutant trees are that scratch tree plus one dock mutant each.
- The predictions were written in `b-round-353/checkpoint.md` before each run.

| Run | Change | rc | Asserted pass | Red rows |
|---|---|---|---|---|
| **Sketch** | none | 0 | **82/82**; 0 NEW; 0 deterministic rows higher than C350; `durationMs` 488086 | none |
| **M-B2′** (`b-round-350/mutant-M-B2prime.diff.txt`: the dock subscribes to the whole preview store) | dock re-renders on every preview write | 1 | 66/82 | **16**: <ul><li>the 6 new component rows: video-trim stopped per-move 18.683, max 19 / 19; video-fade stopped per-move 8.85, max 9 / 9;</li><li>10 existing audio rows: trim, fade and move per-move, and the trim and fade max rows.</li></ul> The release, restart and live rows stayed green. Lane, group and video-move per-move stayed green (B had guessed "likely red"; recorded as measured) |
| **M-B2** (`b-round-350/mutant-M-B2.diff.txt`: the dock selects the video lane's preview clips) | dock re-renders on video preview writes only | 1 | 76/82 | **exactly the 6 new component rows**: video-trim stopped per-move 18.683, max 19 / 19; video-fade stopped per-move 8.85, max 9 / 9. Every audio assert stayed green, as predicted. **So before this stage, no row caught this regression.** The video-move per-move rose 9.883 → 15.75 and still passed its existing `<= 24` budget (PERF-CAND-VIDEO-MOVE-BUDGET, §5) |

**Sketch review (L58):** `b-round-353/sketch-review.md`. It opens with the dispatched sketch's sha256s.
- `tech-lead` found 0 Medium+.
- TL-R354-1 (the note wording) and TL-R354-2 (the owner definition) are fixed in the sketch.
- The measured budgets file differs from the dispatched one only in the 12 `note` strings, and the harness does not read `note`.

**Also run on the sketch:**
- PERF-LIB 40/40 (`b-round-353/sketch-perf-lib.log`). At HEAD it is also 40/40.

## 1. Scope (A)

### 1.1 Files (exactly 2)
| # | File | Change |
|---|---|---|
| 1 | `perf/budgets.interactions.json` | `git apply ../tmp/studio-real-loop/b-round-353/sketch/budgets.patch.txt`, unchanged. Afterwards its sha256 equals `b-round-353/sketch/budgets-dispatched.sha256` |
| 2 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | `git apply ../tmp/studio-real-loop/b-round-353/sketch/doc232.patch.txt`, unchanged (§1.2) |

**Untouched:**
- all of `app/`;
- `perf/*.spec.ts`, `perf/lib`, `perf/budgets.json` and `perf/budgets.resources.json`;
- `e2e`, config and the protected files.

The mutants live only in scratch copies.

### 1.2 Doc 232 (Georgian, technical terms in English; this is the content of `doc232.patch.txt`)
- **l.1, the title:** appends `, ეტაპი video-trim-fade-cost-2 — video trim/fade row-ები assert-ზე`.
- **l.4, the status (L28, no `pending`; D-29z1138):** `…, video-trim-fade, video-trim-fade-cost-1, video-trim-fade-cost-2; C round 354 PASS)`. The string `C round 352 pending` is gone [K5]. This line is granted explicitly.
- **New section** `### ეტაპი video-trim-fade-cost-2: video trim/fade row-ები assert-ზე (round 354, D-29z1138)`, items 105–108, placed before `### განხილული ალტერნატივები`. It contains:
  - the reason;
  - the table in §0.2 and the ten rows that stay `record`;
  - the margin;
  - B's sketch run and both mutants.
- **Changed files:** one bullet for this stage.
- **TODO:**
  - the stage-1 line is struck as done (C round 352 PASS);
  - a new line gives the next order: PERF-CAND-MASTER-GROUP-FADER-PROPS (it needs ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE), then PERF-CAND-FADE-RELEASE-COMMITS, which includes the video fade rows.
- **The `## ` count stays 7** [K5].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-353/claims-354.sh` from the loop root | equals `b-round-353/claims-354-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K3 and K5 equal `b-round-353/claims-354-sketch-output.txt`.</li><li>K2 = `a55543b 2`.</li><li>K7 = `diff-lines-outside-2 0 untracked 0`.</li><li>Every other K equals the planning output.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 (`a-round-352.md`: 205) |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1: the gate does not run these) | 40/40 |
| A-PERF | Production, **alone** (L38): run `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`. Then run `python3 -I b-round-329/perf-rowcmp.py c-round-350/perf-results/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` [].</li><li>252 rows; **82/82** asserted pass; 0 NEW.</li><li>No deterministic components or commits row is higher than C350.</li><li>`durationMs` ≤ 540000 and recorded (ROOT-REQ-PERF-TIMEOUT evidence).</li></ul> |
| A-MUTANT (perf, scratch only, L59/L60) | Build the scratch exactly as `tasks/round-348.md` §2.1 A-MUTANT: `git archive` HEAD, then apply the store diff, then symlink `node_modules`. Then apply `b-round-350/mutant-M-B2.diff.txt` to the dock with `patch -p0 app/components/arrangement/ArrangementVideoDock.tsx < …`, and run the interactions spec alone | <ul><li>Red on exactly the ids in `b-round-353/perf-summary.txt` under `mu-b2` (`RED` lines), with the same values.</li><li>`store/` `git status` is unchanged by the mutant.</li><li>If the job is short on time, A may cite B's M-B2′ run instead of re-running it (M-B2′ is not required for A).</li></ul> |
| A-REVIEW | not required: 2 files, a JSON budget file and a doc (the 3-file rule). If A runs it anyway, it passes any Architecture note to B | — |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-353/claims-354.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check` of both `b-round-353/sketch/*.patch.txt`; `sha256sum perf/budgets.interactions.json` | <ul><li>2 modified files, 0 untracked; both patches reverse-apply.</li><li>The budgets sha256 equals `b-round-353/sketch/budgets-dispatched.sha256`.</li><li>The dock, the context and the spec are unchanged [K4] [K10].</li></ul> |
| READ | a python diff of the budgets JSON against `git show HEAD:perf/budgets.interactions.json` | <ul><li>Exactly the 12 ids of §0.2 differ, and only in `mode`, `budget`, `owner` and `note`.</li><li>Each `note` only appends text.</li><li>The other 240 rows are byte-equal as JSON objects.</li></ul> |
| PERF (browser, production, alone) | A-PERF's command | as A-PERF: 82/82, 0 NEW, none higher than C350. `durationMs` recorded |
| MUTANT (C's own, scratch, predicted before running) | A video-only mutant that is **not** M-B2′ or M-B2, run on the interactions spec alone. Write the prediction into `c-round-354/progress.json` before the run. Two examples: <ul><li>remove `memo` from a component that the names probe shows in video trim commits (`c-round-350/names.json`);</li><li>make `useVideoLanePreviewReader` return a new object on every read.</li></ul> | <ul><li>Red on the predicted rows among the 12.</li><li>Scratch deleted; `store/` unchanged.</li><li>A mutant that stays green on all 12 is reported with its numbers. It is a finding against B's budgets only if its per-move value rose above C350 and still passed.</li></ul> |
| PERF-LIB | A-PERF-LIB | 40/40 |
| VIDEO-DRAG-SMOKE (browser, dev :5173) | <ul><li>**1440×900:** `node c-round-350/video-behaviour-probe.mjs http://127.0.0.1:5173 c-round-354/behaviour-1440x900.json 1440x900`.</li><li>**1280×720:** `node c-round-350/video-behaviour-probe-y8.mjs http://127.0.0.1:5173 c-round-354/behaviour-y8-1280x720.json 1280x720`.</li></ul> Each imports the video, then trims and fades it with the mouse at three playhead positions, releases and undoes | <ul><li>Equal to `c-round-350/behaviour-1440x900.json` and `c-round-350/behaviour-y8-C-1280x720.json`, except the blob `src`.</li><li>So each gesture previews, commits on release, and Undo restores it. This is the guard against the asserted rows passing vacuously (L37).</li></ul> |
| G354-AUTH (browser, 1440×900 and 1280×720) | a fresh anonymous context (`c-round-352/auth.mjs`, copied to `c-round-354/` and extended with the query parameters, as C did in `c-round-353/scripts/rows.mjs`) | <ul><li>`/studio-lab` opens the workspace with the demo badge, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>`/api/studio-token?product=middle-east&file=stem.wav` returns 401 with no header. A fake bearer gets 403 when the mock on :5199 is up; when it is down, a 500 that fails closed goes under `blocked`.</li><li>Without query parameters the route answers 400 first [K9]; that is expected, not a finding.</li><li>No token in any body.</li></ul> |
| RT-FIX-354 | `diff b-round-353/lessons-before-354.md lessons.md` | <ul><li>Exactly one hunk, `41c41`.</li><li>The only change: `opens with the dispatched sketch's sha256 and rules each Medium+ by id` became `opens with the dispatched sketch's sha256; each Medium+ is fixed in the sketch or ruled by id`.</li><li>60 lines.</li></ul> |
| DOCS | doc 232 | <ul><li>l.4 ends `video-trim-fade-cost-1, video-trim-fade-cost-2; C round 354 PASS)`.</li><li>One `### ეტაპი video-trim-fade-cost-2` section; 7 `## `.</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files (L28) [K5].</li><li>Every video trim/fade budget the doc states matches the live file (L34).</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified:** PERF, MUTANT, VIDEO-DRAG-SMOKE and G354-AUTH all run here, and none needs the backend. If any of them does not run, `browserVerified` is false.

**Ableton conformance:** not applicable (budget change; behaviour identical).

**L57: write all L57 fields** in `c-round-354.json` and run `python3 -I tools/l57-check.py c-round-354.json c-round-354/l57-check.txt` until it exits 0.
- `assertsSpecified`: the 12 ids.
- `mutantsRecorded`: B's M-B2′ and M-B2, and C's own.
- `mutantRedOnSketch`: `b-round-353/perf-mu-b2prime-results/latest-interactions.json` and `b-round-353/perf-mu-b2-results/latest-interactions.json`.
- `gateChecksRunOnSketch`: `b-round-353/perf-sketch.log` and `b-round-353/sketch-perf-lib.log`.
- `affectedChecksNamed`: the interactions perf spec and the perf-lib tests.

## 3. Neighbouring behaviour that could break
- **A flaky assert.** The new rows are deterministic component counts, whole-window release counts and liveness flags. They had three equal samples in C round 350 and in B's three runs. Wallclock rows stay `record` (L37).
- **The spec timeout.** The spec's duration does not change, because no row is added. B measured 488086 ms against the 450000 bound (ROOT-REQ-PERF-TIMEOUT, a question to Saba). A run above 540000 ms is a STOP for A and a recorded fact for C; it is not a budget failure.
- **The perf-lib tests** read `budgets.interactions.json` [K10]. They passed 40/40 on the sketch.
- **Doc 232:** only the places in §1.2 change.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- A patch does not apply, or a change is needed outside the 2 files.
- A-PERF: any asserted row fails; any NEW row; any deterministic components or commits row higher than C350; or `durationMs` above 540000.
- A-MUTANT: the red id list differs from `perf-summary.txt` under `mu-b2`. Compare id by id.

## 5. Routed, not in scope
- **C-R353-01 (Low, B's lessons text): fixed.** L58 l.41 again says "each Medium+ is fixed in the sketch or ruled by id" (`b-round-353/lessons-diff.txt`). C checks it in RT-FIX-354.
- **C-R353-02 (Low, B's task text): fixed in this task.**
  - A cross-lane drag's Undo label is `Move to track — <lane>` (`strings.ts` l.701); `Move clip` is the same-lane label (l.702) [K9].
  - The token row now names `?product=&file=` [K9].
- **Screen review.** C measured SR-353-1 and SR-353-4 in round 353. They stay `awaiting_user`, because behaviour and layout are Saba's call. Nothing is scheduled.
- **ROOT-REQ-PERF-TIMEOUT** stays a question to Saba (retro-353 §12.1). The new evidence is B's run of 488086 ms. No interactions-spec row is added until it is answered.
- **ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE** has no root answer yet. It is non-blocking for this round. Doc 232's TODO requires it before PERF-CAND-MASTER-GROUP-FADER-PROPS.
- **New candidate PERF-CAND-VIDEO-MOVE-BUDGET (D-29z1138), not in this round:**
  - Under M-B2, `interact.drag.video.stopped.move-components-per-move` went 9.883 → 15.75 and passed its `<= 24` budget.
  - `move-components-max` (13 stopped / 12 playing, equal samples in C350 and on B's sketch) is still `record`.
  - It is queued as a one-step budget task after SYS-R353-DP-TEST-POLISH. It keeps this round to the 22 rows it was planned for.
- **Unchanged:** the round-352 Lows stay in `deferred_low_polish`, and SYS-R353-DP-TEST-POLISH is queued.
- **Next (D-29z1139):**
  1. REGRESSION, if the next planning is on or after 2026-11-08.
  2. SYS-R353-DP-TEST-POLISH.
  3. PERF-CAND-MASTER-GROUP-FADER-PROPS once the checkpoint is answered. If it is not answered by then, B dispatches PERF-CAND-FADE-RELEASE-COMMITS or PERF-9 first.
  4. Then PERF-9 … PERF-15, STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2, under the skip rule.

## 6. Deliverables
- **A:** the 2 files; `a-round-354.md` with the A rows; logs in `a-round-354/`.
- **C:** `c-round-354.md`, `c-round-354.json` and `c-round-354/` (with `progress.json` after each row, L59).

## 7. Claims
Run `bash b-round-353/claims-354.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree.
- **Expected outputs:**
  - `b-round-353/claims-354-planning-output.txt`: HEAD.
  - `b-round-353/claims-354-sketch-output.txt`: B's sketch `/home/runner/b353-scratch/sc`, with both patches applied. K2 reads `no-git 0` there, and K7 is not meaningful there (no git).
- **The claims:**
  - **K1:** gate 352 `published` `a55543b`; gate 353 `skipped`.
  - **K2:** HEAD and the `git status` entry count.
  - **K3:** budgets: the row count, the asserted count, the stage-2-owned rows with their budgets, and the `record` rows left under the round-349 owner.
  - **K4:** dock and context sha256 (16 hex digits); the M-B2/M-B2′ anchor line; `useArrangementPreview,` absent from the dock.
  - **K5:** doc 232: the `## ` count; `C round 352 pending`; the new l.4 string; the stage-2 section; `D-29z1138`; the count of implementation docs with a `C round N pending` form.
  - **K6:** protected files OK.
  - **K7:** diff lines outside the 2 files; untracked files.
  - **K8:** the `regression-last` date.
  - **K9:** `strings.ts` l.701 and l.702; the studio-token 400 parameter check.
  - **K10:** `perf/lib/report.test.ts` reads `budgets.interactions`; the interactions spec sha256 (16 hex digits).
  - **K11:** every artifact this task cites exists. The list is `b-round-353/cited-artifacts.txt`; the claim prints `N listed, 0 missing` (L56).
