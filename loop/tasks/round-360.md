# CURRENT TASK — Round 360: PERF-10a-BUDGETS. Play/Stop and fade-release rows become asserts; two VIDEO-FAIL-STOP variants run in the browser

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-11-06, at the round 359 → 360 planning.

**Decisions** (`backlog.json` → `decisions_log_b`, v322 → v323):
- **D-29z1163:** round 359 is closed as PASS, and C-R358-01 is closed (`c-round-359.json`, browserVerified true; gate 359 published `a977b97`).
- **D-29z1164:** routing of the round-359 notes (§5).
- **D-29z1165:** the scope and rulings of this round (§0).
- **D-29z1166:** the order after this round (§5).

**Why this round, now.**
- D-29z1162 put PERF-10a-BUDGETS next, after the C-R358-01 fix.
- REGRESSION is not due yet: `regression-last.json` says 2026-11-05, so the next one is on or after 2026-11-08.
- No Critical, High or Medium finding can be worked in the cloud now. The open Mediums are all `open_tech_lead_manual`, `awaiting_user` or `open_root`, and the 2026-10-23 root clarification says they do not block. C-R358-01 is closed.

**Read first:**
- `lessons.md`. A reads 10, 11, 26, 28, 30, 34, 38 and 58. C also reads 22, 37, 38, 57, 59 and 60.
- `c-round-359.md`, and §0 below.
- Primitives: `TESTING_QUALITY_GATES.md` and `GEORGIAN_DOCS.md`. No app code changes in this round.

**L29 note:** untagged code text below is a new value, a row id or a loop-artifact path. Every fact about a current `store/` file carries `[K#]` (§7).

**Not applicable:**
- Reference-first, product-designer, the YouTube request and the screen budget. This is a budget-only performance round, and nothing changes on screen.
- Ableton conformance: not applicable.

## Baseline
- HEAD is `a977b97`, the gate-359 publication [K1].
- The tree is clean (0 status entries) [K2].
- Protected files are 11/11 OK [K6]. There is no dependency change [K9].
- **Root lanes (2026-11-05 parallel policy).** Root may apply its own patches before the round on `app/components/studio/export/*`, `app/components/studio/StudioToolbar.tsx` or `docs/` outside docs 232 and 234. A HEAD that descends from `a977b97` through only those paths is an allowed delta, not a STOP. This round touches no root-lane file.

## 0. The change and B's evidence (D-29z1165)

### 0.1 Premise
- PERF-10a (round 358) moved `isPlaying` into the playback store. Play and Stop now render 28 components each, down from 70.
- The five `interact.play.*` 1× rows are still `record` [K3]. Doc 234's TODO names this stage [K5].
- D-29z1151 closed PERF-CAND-FADE-RELEASE-COMMITS without a fix. It carried `tech-lead`'s suggestion to this round: an upper bound `release-commits <= 3` for the audio and video fades, stopped and playing. Those four rows are `record` today [K3].

### 0.2 Rows (`b-round-359/sketch/budgets.patch.txt`)
**Owner** of all nine rows: `PERF-10a-BUDGETS`.

**Budget rules:**
- A commit count or a start count gets `== 1`, as the trim and move release rows have since round 348. `<= 1` would accept a Play that commits nothing (TL-R360-1).
- A component sum gets `<=` the measured value, with no headroom, because it is deterministic (the round-348 rule).
- A fade release count gets `<= 3` (D-29z1151). This is a ceiling, not an exact pin.

| Row | Now [K3] | After | C358 | C359 | B sketch |
|---|---|---|---|---|---|
| `interact.play.start-commits` | record | assert `== 1` | 1 ×3 | 1 ×3 | 1 ×3 |
| `interact.play.start-components` | record | assert `<= 28` | 28 ×3 | 28 ×3 | 28 ×3 |
| `interact.play.start-sources` | record | assert `== 1` | 1 ×3 | 1 ×3 | 1 ×3 |
| `interact.play.stop-commits` | record | assert `== 1` | 1 ×3 | 1 ×3 | 1 ×3 |
| `interact.play.stop-components` | record | assert `<= 28` | 28 ×3 | 28 ×3 | 28 ×3 |
| `interact.drag.fade.stopped.release-commits` | record | assert `<= 3` | 3 ×3 | 3 ×3 | 3 ×3 |
| `interact.drag.fade.playing.release-commits` | record | assert `<= 3` | 2 ×3 | 2 ×3 | 2 ×3 |
| `interact.drag.video-fade.stopped.release-commits` | record | assert `<= 3` | 2 ×3 | 2 ×3 | 2 ×3 |
| `interact.drag.video-fade.playing.release-commits` | record | assert `<= 3` | 2 ×3 | 2 ×3 | 2 ×3 |

- In each row, `mode`, `budget` and `owner` change. The `note` keeps its first sentence and gains one sentence that names the round, the decision and the measured values.
- Asserted rows go from 84 to 93, out of 252 [K3].

**Rulings (D-29z1165):**
- **The oracle is C359, not C358.** D-29z1162 said "C358 values". C359 measured the app code of HEAD `a977b97`, which is this round's baseline; C358 measured `f269022`. The values are identical in both runs.
- **The `.6x` copies of the nine rows stay `record`.** Their samples equal the 1× values in both runs (1 / 28 / 1 / 1 / 28; fade 3 / 2 / 2 / 2). That is the loaded replicate L37 asks for. Each rate already gets its own equal-samples check in `record` mode (TL-R360-4), so an assert there would only add a second, correlated failure for the same cause.
  - Doc 234 l.77 says "1× და 6×" about the *expected values*. That sentence stays true [K12]. The doc gains this ruling (§1.2).
- **`interact.play.start-sources` is `== 1`.** It counts `start()` calls in the Play window of the harness's play scenario. A second `start()` there is a graph restart; mutant M-P3 shows it.
- **Equal samples are already enforced.** `perf/lib/report.ts` fails any `deterministic` row whose three samples differ, in `record` mode too (TL-R360-1, TL-R360-5) [K12]. So a 2, 3, 2 split of the playing fade row would fail today; the assert adds no new flake class.
- **Doc 232's fade sentences are history.** Doc 232 items 90 and 228 describe the round-347/348 state ("fade-ის `release-commits` `record`-ია"). They stay as dated stage records. The live contract for the four fade release rows moves to doc 234's new stage section. Doc 232 gains one TODO bullet that points there (§1.3). This keeps L34 (the whole contract section is granted) without rewriting history.

### 0.3 B's sketch runs (production, alone, one after another; `b-round-359/run-perf.sh`; summary `b-round-359/perf-summary.txt`)
The predictions were written in `b-round-359/checkpoint.md` before the runs.
- **Trees:** the scratch is `git archive a977b97` with the budgets patch applied (`/home/runner/b359-scratch/sc`). Each mutant tree is that scratch plus one mutant diff. Scratch copies do not survive the job.

| Run | rc | Asserted pass | Result |
|---|---|---|---|
| **Sketch** | 0 | **93/93** | <ul><li>`complete`, 0 failures, 252 rows, 0 NEW.</li><li>`perf-rowcmp.py` against C359: 0 DIFF rows (`b-round-359/perf-rowcmp-sketch-vs-c359.txt`).</li><li>The nine rows equal C359 (the table above).</li><li>`durationMs` 435487.</li></ul> |
| **MU-A** | 1 | 90/93 | **Exactly the 3 predicted rows are red:** `play.start-components` 70 ×3, `play.stop-components` 70 ×3 (> 28), `play.start-sources` 2 ×3 (≠ 1). The other six of the nine equal C359 |
| **MU-B** | 1 | 85/93 | **The 6 predicted rows are red:** `play.start-commits` 2, `play.stop-commits` 2 (≠ 1); fade stopped 5, fade playing 4, video-fade stopped 4, video-fade playing 4 (> 3). **Also red, recorded as possible in the checkpoint:** `play.start-components` and `play.stop-components` 99 ×3, because a status write re-renders the provider value. `start-sources` stays 1 |

The `.6x` copies moved with their 1× rows in both mutants (record, not red). Every mutant value repeated in all three samples.

- **PERF-LIB on the sketch:** 40/40 (`b-round-359/sketch-perf-lib.log`).

**Mutants** (each `b-round-359/mutants/*.diff.txt` is against the sketch):

| Mutant | Change | Predicted red rows |
|---|---|---|
| MU-A = M-P1 + M-P3 | M-P1: `StudioWorkspace` calls `useArrangementIsPlaying()` at its top (PERF-10a undone for the workspace; the same shape as round 357's M-B2). M-P3: `startPlaybackAt` calls `startGraph` twice | `play.start-components`, `play.stop-components` (M-P1); `play.start-sources` (M-P3) |
| MU-B = M-P2 + M-F1 | M-P2: a `setStatus` 100 ms after `setPlaying` in start and in stop. M-F1: two `setStatus` writes, 100 ms and 200 ms after `fadeCommitted` in `ArrangementClip.finishGesture` (the audio and video fades share it) | `play.start-commits`, `play.stop-commits` (M-P2); the four fade release rows (M-F1) |

No mutant tests the 0-commit side of `== 1`; that is info only (TL-R360-3).

**Sketch review (L58):** `b-round-359/sketch-review.md` opens with the dispatched sha256. `tech-lead` (TL-R360-1…5) and `performance-optimizer` (PO-R360-1…5) read the files only, because a perf run was in progress. There is no unruled Medium+:
- TL-R360-3 ("accept only if B's runs show each row red at the median") is met by MU-A and MU-B.
- PO-R360-2 (Low): the meter `over` latch could add a commit on Play. Ruled as an accepted risk: 18 samples per row are equal (C358 and C359, 1× and 6×). A flip would already fail the equal-samples check today. If a run shows 2, L37's "name the extra commit" applies before any ruling.
- The rest are adopted or info.

## 1. Scope (A)

### 1.1 Files (exactly 3)
| # | File | Change |
|---|---|---|
| 1 | `perf/budgets.interactions.json` | `git apply ../tmp/studio-real-loop/b-round-359/sketch/budgets.patch.txt`, unchanged. Afterwards its sha256 equals `b-round-359/sketch/budgets-dispatched.sha256` |
| 2 | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | the stage-2 changes in §1.2 |
| 3 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | one TODO bullet (§1.3). Nothing else |

**Untouched:**
- all of `app/`;
- `perf/*.spec.ts`, `perf/lib`, `perf/budgets.json` and `perf/budgets.resources.json`;
- `e2e`, config and the protected files.

The mutants live only in scratch copies.

### 1.2 Doc 234 (Georgian, technical terms in English; L34: the whole stage section is granted)
- **l.4 (L28, no `pending`):** exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 360 PASS)`.
- **A new subsection** under `## მიდგომა`, titled `### ეტაპი 2: PERF-10a-BUDGETS (round 360, D-29z1165)`. It contains:
  - the table of §0.2 (row, old mode, budget, measured values);
  - the budget rules;
  - the rulings: the C359 oracle, `.6x` stays `record`, `start-sources == 1`, and doc 232 as history;
  - B's sketch runs and the two mutants with their red rows.
- **`## შეცვლილი ფაილები`:** replace the bullet "`perf/budgets.interactions.json` ამ რაუნდში არ შეცვლილა: play row-ები `record` რჩება." [K12] with a dated pair: round 358 left them `record`; round 360 asserts nine 1× rows. The old sentence must not survive verbatim (K12 counts it). Add doc 232's TODO bullet to the list.
- **`## ტესტირება`:** one bullet for stage 2 that cites only real artifacts: the budgets file, `b-round-359/perf-summary.txt` and C's round-360 PERF row.
- **`## TODO / შემდეგი ნაბიჯები`:** strike the PERF-10a-BUDGETS bullet as done (C round 360 PASS). The PERF-10b bullet stays. Strike the A-R357-TEMPO-SEED-REMOUNT-DUP bullet as closed by doc 235 (C round 359 PASS).
- **The `## ` count stays 7** [K5], in TEMPLATE order (L26).

### 1.3 Doc 232 (one bullet)
In `## TODO / შემდეგი ნაბიჯები`, directly after the video-move-budget bullet, add one bullet in Georgian. It says:
- PERF-CAND-FADE-RELEASE-COMMITS was closed without a fix (D-29z1151);
- in round 360 the four fade release rows (`interact.drag.fade.*` and `interact.drag.video-fade.*`, 1×) became asserts `<= 3`;
- the contract is in doc 234, stage 2.

Do not change l.4 [K5] or any other line. Items 90 and 228 stay as dated history (§0.2).

## 2. Acceptance

### 2.1 A rows
| Row | Command / check | Pass |
|---|---|---|
| A-CLAIMS pre | `bash b-round-359/claims-360.sh`, from the loop root | equals `b-round-359/claims-360-planning-output.txt` |
| A-CLAIMS final | same | <ul><li>K3 and K4 equal `b-round-359/claims-360-sketch-output.txt`.</li><li>K2 = `a977b97 3`.</li><li>K5 = `doc234-l4 5807ea0e doc234-h2 7 doc232-l4 e93c6776 pending 0` (`5807ea0e` is the md5 prefix of the §1.2 line with its newline).</li><li>K6 to K11 equal the planning output, and K12 is `1 0 2 1`. K7 proves `app/`, `perf/lib` and the specs are unchanged.</li></ul> |
| A-TYPE / A-LINT | `npm run typecheck`; `npm run lint` | rc 0; lint warnings ≤ 205 |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (GATE304-M1: the gate does not run these) | 40/40 |
| A-PERF | Production, **alone** (L38): `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`. Then `python3 -I b-round-329/perf-rowcmp.py c-round-359/latest-interactions.json <A's test-results/perf/latest-interactions.json>` | <ul><li>rc 0; `complete`; `failures` [].</li><li>252 rows; **93/93** asserted pass; 0 NEW.</li><li>No deterministic components or commits row is higher than C359.</li><li>`durationMs` ≤ 540000, and recorded.</li></ul> |
| A-MUTANT | not required: B ran MU-A and MU-B (§0.3) on the dispatched budgets file. A cites B's runs and says so | — |
| A-REVIEW | `code-reviewer` on the 3 files (the 3-file rule) | no unruled Medium+. Any change after the review goes back to the reviewer (L11). The Architecture note goes to B |
| A-DOC | docs 234 and 232 | as §1.2 and §1.3 |

### 2.2 C rows
Use a warm dev server (L38). If `:5173` returns "504 Outdated Optimize Dep", restart it first.

| Row | How | Pass |
|---|---|---|
| CLAIMS | `bash b-round-359/claims-360.sh` | equals A's final |
| SOURCE-SCOPE | `git status --short --untracked-files=all`; `git apply -R --check` of `b-round-359/sketch/budgets.patch.txt`; `sha256sum perf/budgets.interactions.json`; `git diff --stat` | <ul><li>3 modified files, 0 untracked; the patch reverse-applies.</li><li>The budgets sha256 equals `b-round-359/sketch/budgets-dispatched.sha256`.</li><li>Doc 232's diff is one added bullet. K7 is unchanged (no `app/` or `perf/lib` change).</li></ul> |
| PERF (browser, production, alone) | A-PERF's command and comparison | as A-PERF: 93/93, 0 NEW, none higher than C359. `durationMs` recorded |
| MUTANT (C's own, scratch, predicted first in `c-round-360/progress.json`) | One mutant that is **not** MU-A or MU-B and that should change a play or fade-release row. Examples: <ul><li>`ArrangementTransport` loses its `memo`;</li><li>a component outside the 28 (a lane or the ruler) subscribes to `useArrangementIsPlaying()`;</li><li>Stop calls `setStatus` a second time from a `setTimeout`.</li></ul> Run the interactions spec alone on it | <ul><li>Red on the predicted rows among the nine.</li><li>Scratch deleted under `c-round-360/` only (L60); `store/` unchanged.</li><li>A mutant that stays green on all nine is reported with its numbers. It is a finding against B's budgets only if a play or fade-release value rose above the C359 value and still passed.</li></ul> |
| PERF-LIB | A-PERF-LIB | 40/40 |
| VIDEO-FAIL-STOP-2 (browser, dev, 1440×900; carried from rounds 357–358, D-29z1162) | `node b-round-359/vfs-probe.mjs http://127.0.0.1:5173 c-round-360/vfs-v2-1440x900.json v2`. The script: <ol><li>opens `/studio-lab`, waits for "ready" and adds "Night Pulse · Full mix";</li><li>imports `public/videos/hero/1.mp4` through `arrangement-video-input`;</li><li>drags the video clip by its name bar until it starts at ≥ 2 s;</li><li>stubs `HTMLMediaElement.prototype.play` to reject with `NotAllowedError`;</li><li>presses Home and Space, and polls until `data-playing` is false (12 s cap).</li></ol> C reads the script before running it | <ul><li>The video clip starts at ≥ 2 s (B: 4.000).</li><li>`afterPlay.playing` is "true": playback did not stop at Play.</li><li>`final.playing` is "false". `final.pos` is within 0.2 s after the clip start (B: 00:04.002 for a 4.000 start).</li><li>`final.status` is exactly the video-failure text [K8].</li><li>B's run on HEAD `a977b97`: `b-round-359/vfs-v2-1440x900.json`.</li></ul> |
| VIDEO-FAIL-STOP-3 (browser, dev, 1440×900) | `node b-round-359/vfs-probe.mjs http://127.0.0.1:5173 c-round-360/vfs-v3-1440x900.json v3`. The same as -2, plus: zoom in (`=` ×8) before Play, and about 0.4 s after Space scroll the timeline by hand (`scrollLeft` +300 and a wheel), as `c-round-358/follow-probe.mjs` does | <ul><li>`manual.status` is exactly the Follow-paused text [K11], with `data-follow-mode` "paused" [K11] and `playing` "true".</li><li>`final.playing` "false"; `final.pos` within 0.2 s after the clip start; `final.status` exactly the video-failure text [K8].</li><li>`final.follow` is mode "on" and `aria-pressed` "true": Follow resumes after the stop (doc 234 FW-PB1).</li><li>B's run on HEAD `a977b97`: `b-round-359/vfs-v3-1440x900.json` (stop at 00:04.011).</li></ul> |
| VIDEO-FAIL-STOP-1 (browser, dev, both viewports; the regression guard) | C's `c-round-358/behaviour-probe.mjs` on the tree | `rows.videoFail` equals `c-round-359/beh-tree-*.json`: `playing` "false" and the video-failure text. The other rows equal C359 too |
| G360-AUTH (browser, both viewports) | `c-round-358/auth.mjs`, copied to `c-round-360/` | as G359-AUTH. A fake-bearer 500 that fails closed while the mock is down goes under `blocked` |
| DOCS | docs 234 and 232 | <ul><li>Doc 234 l.4 byte-exact: `**სტატუსი:** In Progress (stage 2 of 3; C round 360 PASS)`.</li><li>7 `## ` headings in TEMPLATE order (L26).</li><li>Every budget doc 234 states matches the live file (L34).</li><li>Doc 232 l.4 is unchanged, and its diff is the one bullet.</li><li>`grep -rl 'C round [0-9]* pending' docs/implementation` gives 0 files.</li></ul> |

**Gate rows** (C does not claim them): full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.

**browserVerified** is false if any of these rows does not run: PERF, MUTANT, VIDEO-FAIL-STOP-1, -2, -3 or G360-AUTH. None of them needs the backend.

**L57: write all L57 fields** in `c-round-360.json`, and run `python3 -I tools/l57-check.py c-round-360.json c-round-360/l57-check.txt` until it exits 0.
- `assertsSpecified`: the nine ids of §0.2.
- `mutantsRecorded`: MU-A (M-P1, M-P3), MU-B (M-P2, M-F1) and C's own.
- `mutantRedOnSketch`: `b-round-359/perf-mu-a-results/latest-interactions.json` and `b-round-359/perf-mu-b-results/latest-interactions.json`.
- `gateChecksRunOnSketch`: `b-round-359/perf-sketch.log` and `b-round-359/sketch-perf-lib.log`.
- `affectedChecksNamed`: the interactions perf spec, the perf-lib tests and the behaviour probe.

## 3. Neighbouring behaviour that could break
- **A flaky assert.** The nine rows are deterministic counts with three equal samples in each of three runs (C358, C359 and B's sketch), at 1× and 6×. The fade rows have a ceiling above the measured values (D-29z1151).
- **The spec timeout.** No row is added. A run above 540000 ms is a STOP for A and a recorded fact for C, not a budget failure.
- **The perf-lib tests** read `budgets.interactions.json` only for the commits-per-move rows (TL-R360-5). They passed 40/40 on the sketch.
- **Docs:** only the places in §1.2 and §1.3 change.
- **App behaviour:** nothing changes. VIDEO-FAIL-STOP-1 and G360-AUTH guard it.

## 4. STOP conditions (A)
- A-CLAIMS pre mismatch, or a final mismatch outside §2.1. A HEAD that descends through root-lane paths only is not a mismatch.
- The patch does not apply, or a change is needed outside the 3 files.
- A-PERF: any asserted row fails; any NEW row; any deterministic components or commits row higher than C359; or `durationMs` above 540000.
- The code-reviewer reports a Medium+ finding that this task does not rule.

## 5. Routed, not in scope
- **D-29z1164 (round 359 notes):**
  - **C-R359-01** (Low, coverage) goes to `deferred_low_polish`. `snapEnabled`, `gridDensity`, `secondsGridDivision` and the hand-chosen flags can be dropped from the restore without a red test. A's reviewer Medium on the same gap is merged into it, as the round-359 task ruled. The suggested rows WS6–WS8 are kept in the entry.
  - **A-R359-REVIEW-METRONOME-REF-RENDER** (Low: `metronomeOnRef` is written only during render) and **A-R359-REVIEW-SESSION-READONLY** (Low: the store's state fields are not `readonly`) go to `deferred_low_polish`.
  - **B-R359-VIEW-STATE-REMOUNT** stays Low and deferred. C confirmed it in the browser: Env and waveform zoom reset on the resize (`c-round-359/extra.json`).
  - **C-R359-OBS-FOLLOW-JITTER** (info, recorded). FOLLOW at 1280×720 was 5 px off once against a 4 px tolerance: 1452, then 1447 and 1450, against C358 HEAD 1445. The texts were equal. It is timing jitter, not a regression. If a later FOLLOW row exceeds 4 px in two of three runs, it becomes a harness task.
  - The Architecture note (extract `useWorkspaceTempoGrid` with `WorkspaceTempoGridSnapshot` as the contract) joins signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS. It is not scheduled.
- **The architecture checkpoint** (`b-round-358/root-request-arch-checkpoint.md`) is still unanswered and non-blocking. This round adds no store.
- **D-29z1166, next:**
  1. REGRESSION, if the next planning is on or after 2026-11-08.
  2. PERF-10b: the `activeTrackId` and selection store, clip click, the C-R320-01 rows and the Transport play leaf.
  3. PERF-9 and PERF-11…15, then STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED.

  RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Deliverables
- **A:** `a-round-360.md`, with every §2.1 row, its evidence under `a-round-360/` and the code-reviewer result.
- **C:** `c-round-360.md` and `c-round-360.json` with all L57 fields, and evidence under `c-round-360/`.

## 7. Claims
Run `bash b-round-359/claims-360.sh` from the loop root. `CLAIMS_STORE` points it at a scratch.

| Output | File |
|---|---|
| Planning, on `a977b97` (clean tree) | `b-round-359/claims-360-planning-output.txt` |
| Sketch | `b-round-359/claims-360-sketch-output.txt` |

| Tag | What it pins | Planning | Sketch |
|---|---|---|---|
| K1 | gate 359 status and commit | `published a977b97` | same |
| K2 | HEAD and status entry count | `a977b97 0` | scratch n/a; A's final: `a977b97 3` |
| K3 | rows; asserted count; the nine rows' mode and budget; asserted `.6x` play rows | `252`, `84`, all `r-`, `0` | `252`, `93`, `a==1 a<=28 a==1 a==1 a<=28 a<=3 a<=3 a<=3 a<=3`, `0` |
| K4 | budgets sha256 prefix | `7053aee8db9c` | `728ed85b08d4` |
| K5 | doc 234 l.4 hash, its `## ` count, doc 232 l.4 hash, `pending` docs | `ed451e10 7 e93c6776 0` | unchanged on the scratch; A's final: `5807ea0e 7 e93c6776 0` |
| K6 | protected files OK | 11 | 11 |
| K7 | sha256 over `app/` (without the root-lane paths `app/components/studio/export/*` and `app/components/studio/StudioToolbar.tsx`), `perf/lib` and the perf specs | `c5816b428fb4` | same |
| K8 | the play/stop prefix line in the spec; the video-failure string in `strings.ts`; its call in `ArrangementVideoDock.tsx` | `1 1 1` | same |
| K9 | `package.json` sha256 prefix | `948eb8eee712` | same |
| K10 | cited artifacts missing | `0` | same |
| K12 | doc 234's sentence "70 → 28 (1× და 6×)"; doc 234's round-358 budgets bullet; `report.ts`'s unequal-count failure lines and its `deterministic` gate | `1 1 2 1` | same; A's final: `1 0 2 1` (A replaces the bullet, §1.2) |
| K11 | the Follow mode attribute in `ArrangementTransport.tsx`; the Follow-paused text in `strings.ts`; `pausePlaybackWithStatus` in `ArrangementContext.tsx` | `1 1 1` | same |

C also runs the L29 grep over this task.
