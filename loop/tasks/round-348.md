# CURRENT TASK — Round 348: PERF-DRAG-PREVIEW conversions. The trim, move and fade 1x drag rows become asserts at the measured ceiling; DP63/DP65 release the pointer in a finally

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-05, at the round 347 → 348 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v308 → v310, D-29z1100…D-29z1105):
- **D-29z1100:** round 347 closed as PASS from C's evidence (`c-round-347.json`: PASS, `browserVerified`/`realVerified` true, 14 rows, 0 bugs, 0 blocked). Gate 347 `published` **`95774e6`** on both remotes [K1]. **Baseline = `95774e6`**, clean tree [K2]. Stage c6-ii → done. New oracles: `c-round-347/perf-results/latest-interactions.json` (interactions) and `c-round-347/fader-perf-results/latest.json` (faders).
- **D-29z1101:** round-347 notes routed (§5).
- **D-29z1102:** the conversion shape (§0.2): 14 rows, owner `PERF-DRAG-PREVIEW-conv`. Fade `release-commits` stays `record`; move max and the 6x copies stay `record`.
- **D-29z1103:** GATE347-S2 (DP65 has no `try/finally`) is fixed in this round, together with DP63, which has the same loop. Both are test-only and the round already owns the file.
- **D-29z1104:** this task.
- **D-29z1105:** L7 close-out. PERF-CAND-DETAIL-CLIPGAIN-MEMO is closed (c6-ii did it). PERF-CAND-FADE-BUDGET is done by this round.

**Read first:**
- `lessons.md` items 10, 11, 22, 29, 34, 37, 38, 56, 57 and 58. For C, also 59 and 60 (destructive commands only inside `c-round-348/`, with absolute paths).
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md` (doc 232). No app source changes, so `AUDIO_ARCHITECTURE.md` is background only.

**L29 note:** untagged code text below is an expected value, a row id or a loop-artifact path. Every fact about a `store/` file carries `[K#]` (§7).

**Reference-first, product-designer, the screen budget and the YouTube request do not apply.** This is a performance-budget and test-hygiene round. App source, DOM, audio and behaviour do not change.

## Baseline
- HEAD `95774e6` (gate 347, published), clean tree [K2]. Protected files 11/11 OK [K8]. No dependency change.
- **Oracle:** `c-round-347/perf-results/latest-interactions.json`: 230 rows, `complete`, 0 failures, 60/60 asserted rows pass [K3]. 1x per move, stopped and playing alike: trim 14.75 (max 15), move 15.317 (max 82), fade 3.933 (max 4). Release commits: trim 1, move 1, fade 3 stopped / 2 playing.

## 0. Why, and B's evidence

### 0.1 Premise
D-29z1092 set the order: c6-i, then c6-ii, then conversions. Both c6 stages passed (C rounds 346 and 347). The trim and move component rows are still `record` [K3], and the fade rows still assert the stage-b ceiling of 24 [K3]. A regression back to the provider path would pass every trim and move row today.

### 0.2 The conversion (`b-round-347/sketch/apply-budgets.py` → `b-round-347/sketch/budgets.patch.txt`)
Each budget is the ceiling of C's round-347 value, which is the same at 1x stopped and 1x playing:

| Row (1x, `stopped` and `playing`) | Now [K3] | After |
|---|---|---|
| `interact.drag.trim.<state>.move-components-per-move` | record | `<= 15` (14.75) |
| `interact.drag.trim.<state>.move-components-max` | record | `<= 15` (15) |
| `interact.drag.trim.<state>.release-commits` | record | `== 1` |
| `interact.drag.move.<state>.move-components-per-move` | record | `<= 16` (15.317) |
| `interact.drag.move.<state>.release-commits` | record | `== 1` |
| `interact.drag.fade.<state>.move-components-per-move` | assert `<= 24` | `<= 4` (3.933) |
| `interact.drag.fade.<state>.move-components-max` | assert `<= 24` | `<= 4` (4) |

That is 14 rows; asserted rows go from 60 to 70. The `max` rows have no headroom on purpose, because they are deterministic.

**Window-commit margin (`tech-lead`).** Every per-move sample in C round 347, at 1x and at 6x, has `movesInWindow` 60 and `windowCommits` 59 (`componentsSum` trim 885, fade 236, move 919). One more commit in the window (60 of 60 moves) gives trim 900 / 60 = 15.0, fade 240 / 60 = 4.0 and move about 933 / 60 = 15.55, all still in budget. A trim or fade per-move failure therefore needs more components per commit, not just one more window commit. If one of these rows fails, read its `windowCommits` and `componentsSum` detail before calling it a regression.

Unchanged:
- **Move max** stays `record` (82, the project-end crossing commit; D-29z1092).
- **The 6x copies** stay `record` (36 rows [K4]; D-29z1092).
- **Fade `release-commits`** stays `record` [K4]. It is 3 when stopped and 2 when playing, the same in C rounds 346 and 347. B could not explain the asymmetry at planning, so it is not pinned as a budget. Recorded as PERF-CAND-FADE-RELEASE-COMMITS. D-29z1092's `== 1` rule applies to trim and move only.

**Move and the ≤ 15 target.** ceil(15.317) is 16. In C's round-347 run, every move per-move sample has 60 moves and 59 window commits with a `componentsSum` of 919. That sum includes the one project-end crossing commit of 82 components, so the other 58 commits average 14.43. The "steady 12" from the names probe is a dev-build count; the production harness counts more fibres per commit. The item target "≤ 15 per move" is met by trim (885 / 60) and fade (236 / 60). Move does not meet it while the crossing is counted; that needs checkpoint question 1 or PERF-CAND-MASTER-GROUP-FADER-PROPS. A PASS of this round does **not** make PERF-DRAG-PREVIEW done.

### 0.3 B's sketch runs (production, run alone, one after another; `b-round-347/run-sketch-perf.sh`)
Each mutant tree is HEAD plus the new budgets, made by `b-round-347/sketch/make-mutants.py`:

| Run | Change | rc | Red rows among the 14 (stopped and playing alike) | Other red asserts |
|---|---|---|---|---|
| **Sketch** | none (HEAD source, new budgets) | 0 | none: **70/70** asserted pass, 0 NEW, 0 deterministic rows higher than C347, `durationMs` 439301 | none |
| **MU-FINE-CLIPGAIN** | `memo` removed from `ArrangementDetailClipGain` (+1 component per trim/move commit) | 1 | trim per-move 15.733, trim max 16, move per-move 16.3 (6 failures) | none |
| **MU-GROSS-PREVIEW** | `previewGeometry` always `previewArrangement` in `ArrangementClip.tsx` [K5] (the provider path) | 1 | all 10 component asserts: fade 76.7 / 77, trim 82.6 / 84, move 80.75 | 7 existing lane, group and video per-move asserts (17 failures) |
| **MU-COMBO** | `memo` removed from `ArrangementMixFader` [K6] + `flushSync` around the trim/move release `commitArrangement` [K5] | 1 | fade per-move 5.9 and max 6, trim per-move 16.717 and max 17, move per-move 17.483, trim and move `release-commits` 2 | 8 existing lane, group and video `release-commits` asserts, which use the same release line (22 failures) |

Evidence: `b-round-347/perf-summary.txt` (made by `b-round-347/summarize-perf.py`), the logs `b-round-347/perf-<run>.log` and the results `b-round-347/perf-<run>-results/latest-interactions.json`. Fade's own `release-commits` stays 3 / 2 in every run except MU-GROSS-PREVIEW (2 / 2). That is more evidence that the fade release count depends on the preview path and is not yet understood (PERF-CAND-FADE-RELEASE-COMMITS). `performance-optimizer`: the second fade commit is the `statusPreviewStore.clearPreview()` layout effect, which only fade uses; the third commit, when stopped, is unexplained.

### 0.4 Test hygiene (`b-round-347/sketch/apply-tests.py` → `b-round-347/sketch/tests.patch.txt`)
DP63 and DP65 loop over three gestures. Each loop body presses, moves, asserts, releases and undoes; with no `finally`, a failed assertion leaves the pointer pressed. The sketch wraps the body after `pointerDownAt` in `try { … released = true; undo } finally { if (!released) pointerUpAt(…) }`. Assertions and their order do not change. On the sketch, `finally` goes from 21 to 23 and `let released = false;` from 0 to 2 [K7].

On the sketch tree, `drag-preview-render.test.tsx` passed 67/67 (`b-round-347/sketch-vitest.log`) and Biome was clean. `tech-lead` reviewed both patches (it stands in for the code-reviewer, which is not on the planner's consult list) and found no Medium+ in the patches. Its two Medium notes are handled: the window-commit margin is in §0.2, and the move numbers are corrected there.

## 1. Scope (A)

### 1.1 Files (exactly 3)
| # | File | Change |
|---|---|---|
| 1 | `perf/budgets.interactions.json` | `git apply b-round-347/sketch/budgets.patch.txt` (or `python3 -I b-round-347/sketch/apply-budgets.py <store>`; same bytes) |
| 2 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | `git apply b-round-347/sketch/tests.patch.txt` |
| 3 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | §1.2 |

Untouched: all of `app/` except file 2, `perf/*.spec.ts`, `perf/lib`, `perf/budgets.json`, `perf/budgets.resources.json`, `e2e`, config and the protected files. The mutants live only in scratch copies.

### 1.2 Doc 232 (Georgian, technical terms in English)
L34: the task grants the doc's whole budget-contract text, so every place in doc 232 that states a trim, move or fade budget or its mode is updated to the live file.
- **l.4 status:** `In Progress (stage conversions of a, b, c1, c2a, c2b-i, c2b-ii, c2b-iii, c3-i, c3-ii, c4-i, c4-ii, c5-i, c5-ii, c6-i, c6-ii, conversions; C round 348 pending)`. "C round 347 pending" is gone [K11].
- **Title line:** append `, ეტაპი conversions — trim/move/fade row-ები assert-ზე`.
- **New section** `### ეტაპი conversions: trim/move/fade row-ები assert-ზე (round 348, D-29z1102)`, after the c6-ii section. It covers:
  - the table in §0.2 and the ceiling rule;
  - the move-crossing caveat (≤ 15 met only in steady state);
  - why fade `release-commits` stays `record` (PERF-CAND-FADE-RELEASE-COMMITS);
  - B's three mutants with their red rows (§0.3) and A's run.
- **Testing, changed files and TODO:** add the budgets file, A's perf run and mutants, and the DP63/DP65 `finally`. In TODO, replace the c6-ii line with: PERF-CAND-VIDEO-TRIM-FADE-ROWS (next stage) → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS. Mark the old c6-ii TODO entry done, and mark PERF-CAND-FADE-BUDGET (this round) and PERF-CAND-DETAIL-CLIPGAIN-MEMO (done by c6-ii) done (D-29z1105).
- **The `## ` count stays 7** [K11].

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-347/claims-348.sh` from the loop root | equals `b-round-347/claims-348-planning-output.txt` |
| A-CLAIMS final | same | K3, K4, K5, K6, K7, K12 and K13 equal `b-round-347/claims-348-sketch-output.txt`. K2 = `95774e6 3`. K8 = 11. K10 = `0` and `untracked 0`. K11 = `7 1 0 1` |
| A-TYPE / A-LINT | `npm run typecheck`, `npm run lint` | rc 0; lint warnings ≤ 205 |
| /check | `npx biome check app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | rc 0. Biome does not process `perf/` (L30); the JSON is checked by `perf/lib/budgets.ts` when the spec loads it |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | 67/67 |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` | 40/40. `perf/lib/report.test.ts` reads `budgets.interactions.json`; it is the only test hit of a `budgets.interactions` grep over `app`, `perf`, `e2e` and `scripts`. It passed 40/40 on B's sketch (`b-round-347/sketch-perf-lib.log`) |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`, then `python3 -I b-round-329/perf-rowcmp.py c-round-347/perf-results/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | rc 0; `complete`; `failures` []; 230 rows; **70/70** asserted pass; 0 NEW; no deterministic components or commits row higher than C347. `durationMs` recorded |
| A-MUTANT (perf, scratch copies only, L59/L60) | Make the scratch first: `mkdir -p /home/runner/a348-scratch/sc && git -C /home/runner/czaba-project/store archive HEAD | tar -x -C /home/runner/a348-scratch/sc && cd /home/runner/czaba-project/store && git diff HEAD | git -C /home/runner/a348-scratch/sc apply && ln -s /home/runner/czaba-project/store/node_modules /home/runner/a348-scratch/sc/node_modules` (the `node_modules` symlink is required: `make-mutants.py` copies symlinks as symlinks). Then run `python3 -I b-round-347/sketch/make-mutants.py /home/runner/a348-scratch/sc /home/runner/a348-scratch/mu` (it refuses the store path), and run the interactions spec alone in each mutant tree | Each is red on exactly the rows in §0.3's table (the 14 conversion rows and the listed other asserts), with the same values. `store/` `git status` is unchanged by the mutants. A may run MU-GROSS-PREVIEW and MU-COMBO only and cite B's MU-FINE-CLIPGAIN run, if the job's time is short; this is written in the report |
| A-REVIEW | `code-reviewer` (3 files) | 0 Medium+ open; Architecture note passed to B |

### 2.2 C rows
| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-347/claims-348.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check` of both `b-round-347/sketch/*.patch.txt` | 3 modified, 0 untracked; both patches reverse-apply |
| READ | read the diff | Only the 14 budget rows (mode, budget, owner, note) and the two `finally` wrappers; no assertion removed, reordered or weakened in DP63/DP65; no other row touched |
| UNIT | `npx vitest run app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | 67/67 |
| PERF (browser, production, alone) | A-PERF's command | as A-PERF: 70/70 asserted pass, 0 NEW, none higher |
| MUTANT (C's own, scratch, predicted before running) | A mutant not among B's three, run on the interactions spec alone. Example: hoisted icons back inline in `ArrangementLane.tsx` (c6-i undone: predicted trim, move and fade per-move red), or `memo` removed from `ArrangementMixFader` only (predicted: trim, move and fade per-move red, release rows green) | red on the predicted rows; scratch deleted; `store/` unchanged |
| PERF-LIB | A-PERF-LIB | 40/40 |
| G348-AUTH (browser, both viewports) | fresh anonymous context | `/studio-lab` opens with the workspace and demo badge, `auth_user` is null; `/studio/<id>` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` refuses (401/400/405; 500 only when the mock on :5199 is down, and then it is listed under `blocked`) |
| DRAG-SMOKE (browser, 1440×900 and 1280×720, dev :5173) | `/studio-lab` demo: trim, move and fade-in one clip with the mouse, then Undo each | each gesture previews during the drag, commits one history entry on release, and Undo restores it (no behaviour change; guards against an environment where the asserted rows pass vacuously) |
| DOCS | doc 232 | l.4 as in §1.2; one `### ეტაპი conversions` section; 7 `## `; 0 "C round 347 pending"; every trim/move/fade budget the doc states matches the live file (L34) |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**browserVerified:** PERF, MUTANT, G348-AUTH and DRAG-SMOKE all run here; none needs the backend.
**Ableton conformance:** not applicable (budget change; behaviour identical).
**All L57 fields** go in `c-round-348.json`. `mutantRedOnSketch` = `b-round-347/perf-mu-*-results/latest-interactions.json`.

## 3. Neighbouring behaviour that could break
- **Flaky asserts.** The new rows are deterministic component counts and whole-window release counts, with three equal samples in C rounds 346 and 347 and on B's sketch. `commits-per-move` stays `record`, because it is a windowed wallclock count (L37).
- **Fade `release-commits`** is not asserted, so a fade release that adds a commit is not caught. That is a known gap (PERF-CAND-FADE-RELEASE-COMMITS).
- **The 6x copies** are not asserted. A regression that shows only under CPU throttling is not caught.
- **DP63/DP65.** The `finally` must not swallow an assertion failure; READ checks that the assertions stay inside `try` with no `catch`.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1.
- A patch does not apply, or a change is needed outside the 3 files.
- A-PERF: any asserted row fails, any NEW row, or any deterministic components or commits row higher than C347.
- A mutant that stays green on a row §0.3 lists as red, or that is red on a row §0.3 lists as green. The exact red id list per run is in `b-round-347/perf-summary.txt` (`RED` lines); compare against that file, id by id.

## 5. Routed from round 347 (D-29z1101), not in scope
- **GATE347-S1 = A-R347-REVIEW-L2** (Low): `parseClipGainDbKey` drops non-finite values, so a non-finite gain would shift later entries. It is unreachable today (gains are clamped to −60…+24 dB). Fix: the reviewer's length-preserving `map` to 0. → `deferred_low_polish`, or earlier in the next round that owns `ArrangementDetailPanel.tsx`.
- **A-R347-REVIEW-L1** (Low): `useStableHandler` updates its ref in a layout effect, so a sibling layout effect in the same commit could call the previous handler. No current path does this. → `deferred_low_polish`.
- **GATE347-S3** (info): is `setTrackPan` stable? It is a `useCallback` with deps `[applyEdit, refuseEditDuringGesture]` [K12], and C's NAMES show no `ArrangementMixFader` in fade, trim or non-crossing move commits. → closed_info.
- **GATE347-S4** (info): the hook's "never call during render" contract lives only in doc 232. → kept with the round-347 deliberate placement note: it moves to `docs/technical/` in the next round that touches that folder.
- **C-R347-HELD-ARROW-HISTORY** (Low, C's note): a held arrow key on a lane Volume fader adds one history entry per key-up, the same as at HEAD. Live's behaviour is not verified. → `deferred_low_polish`.
- **C-R347-VISUAL-ID-STRIPPED** (info): VISUAL compared `outerHTML` after stripping `id` and `aria-describedby` (React `useId` values). → closed_info; READ showed no JSX attribute change.
- **Architecture signals** (not scheduled):
  - ARCH-R347-LANE-HEADER-MIX (gate signal 4): extract a memoised lane-header mix child. It joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE question 3.
  - ARCH-R347-DETAIL-PANEL-REPEAT (gate signal 3): `ArrangementDetailPanel.tsx` keeps changing under the heavy harness.
  - A's note on two latest-callback mechanisms (`useRelativeFaderDrag` uses a passive effect, `useStableHandler` a layout effect) folds into ARCH-R346-FADER-DRAG-OPTIONS-EFFECT.
- **ROOT-REQ-PERF-TIMEOUT:** round 347's durations were 440477 ms (C) and 432344 ms (A), both under the L31 bound of 450000. Recorded as evidence.
- **Feature boundary.** After this round, PERF-DRAG-PREVIEW's core work is done, apart from the move crossing and the video trim/fade rows. ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE (root, frontend-architect) is now wanted before PERF-CAND-MASTER-GROUP-FADER-PROPS or any crossing work. It does not block this round or PERF-CAND-VIDEO-TRIM-FADE-ROWS.
- **Later, recorded:** PERF-CAND-FADE-RELEASE-COMMITS, PERF-CAND-VIDEO-TRIM-FADE-ROWS (next stage), PERF-CAND-MASTER-GROUP-FADER-PROPS, PERF-CAND-CHROME-ICONS, and ARCH-R346-DP-HARNESS-EXTRACT (this round adds no describe block).

## 6. Deliverables
- **A:** the 3 files; `a-round-348.md` with the A rows; logs in `a-round-348/`.
- **C:** `c-round-348.md`, `c-round-348.json` and `c-round-348/`.

## 7. Claims
Run `bash b-round-347/claims-348.sh` from the loop root. `CLAIMS_STORE=<dir>` points it at another tree.
- **Expected outputs:** `b-round-347/claims-348-planning-output.txt` (HEAD) and `b-round-347/claims-348-sketch-output.txt` (B's sketch `/home/runner/b347-scratch/td`: budgets and tests applied, no doc change; K2 reads `no-git` there).
- **K1:** gate 347 `published` `95774e6`.
- **K2:** HEAD and the `git status` entry count.
- **K3:** budgets: row count, asserted count, and the conversion-owned rows with their budgets.
- **K4:** fade `release-commits` and move max modes; the trim/move/fade 6x row count and how many are asserted.
- **K5:** `ArrangementClip.tsx`: the mutant anchors (the `previewGeometry` line, the trim/move release `commitArrangement` line, the lucide import) and the `flushSync` count.
- **K6:** the `memo` exports of `ArrangementMixFader` and `ArrangementDetailClipGain`.
- **K7:** test file: DP `it(` count, `} finally {` count, and the `released` flag count.
- **K8:** protected files OK.
- **K9:** `regression-last` date.
- **K10:** `app/`, `perf/`, `e2e/` and `docs/` diff lines outside the 3 files; untracked files.
- **K11:** doc 232 `## ` count, the conversions section, "C round 347 pending" and "C round 348 pending".
- **K12:** `setTrackPan` in `ArrangementContext.tsx` is a `useCallback` with deps `[applyEdit, refuseEditDuringGesture]` (GATE347-S3).
- **K13:** the kept B artifacts exist (`test -f`, 9 files).
