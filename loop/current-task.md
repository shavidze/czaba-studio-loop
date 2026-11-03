# Round 314: PERF-5a close-out. The PERF-1a harness turns Follow off before the playing fader drags and fails loudly if the timeline scrolls inside a measured window (C-R313-01); A finishes round 313's docs and review

**Planned by:** B, at the round 313 → 314 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v273 → `decisions_log_b`):
- **D-29z841: round 313 ruled.** C FAIL. Every harness row C could run passed with `browserVerified`/`realVerified` true: HARNESS-PASS ×2, HARNESS-HEAD-CONTROL, MU-LIVE-BUSY0, LOAF (C's own 4 mutants red), PK-SANITY, G313-AUTH and CARRY-312. A stopped correctly under §9 because A-PERF failed twice on C-R313-01. A-DOC and A-REVIEW were therefore not done. Gate 313 is `skipped` [K1], HEAD stays `dfa4502`, and A's tree stays in place: 11 entries [K2]. **The round-313 sketch is not re-applied**: its 4 perf files stay exactly as they are [K4].
- **D-29z842: C-R313-01 ruled as a harness scenario confound, not an app defect and not a contract relaxation** (§0.2). B's probe found the cause. The extra release commit is the ruler re-rendering after a **Follow page turn** that was held back during the drag. The fix keeps every row exact and removes the confound.
- **D-29z843:** tech-lead consulted (verdict: change, small). Adopted: the idle bracket guard. Not adopted: editing the `fader.*.playing.*` budget notes. Recorded: a meter-latch watch item.
- **D-29z844:** bookkeeping, L37 clause, requests (§10).

**Read first:** `lessons.md`. These apply directly:
- L11: STOP, and re-review after any change.
- L23 / L37: B ran the perf spec on the final sketch (§2).
- L26 / L28 / L34: docs.
- L29 / L56: claims.
- L30: `perf/**` has no Biome coverage, so use `npm run typecheck`.
- L38: perf runs alone, own `cacheDir`, browser warm-up.
- L52: asserts must be able to fail.
- L57: harness fields.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.

## Baseline: HEAD `dfa4502` + A's round-312 and round-313 tree (uncommitted)
- **Gate 313:** `skipped`, "C taskStatus FAIL" [K1]. `git status` shows 11 entries [K2]:
  - round 312's 2 M + 5 ??;
  - M on `perf/studio-lab.perf.spec.ts`, `perf/budgets.json`, `perf/lib/report.ts` and `perf/lib/report.test.ts` (round 313's applied sketch).
- **App code frozen at C round 312's state:** `b-round-312/a312-app-code-sha256.txt`, 6/6 OK [K3]. It must still be 6/6 after A.
- **Tree manifest at planning:** `b-round-313/a313-tree-sha256.txt` covers 8 paths, all OK [K4]: the 4 perf files, docs 163 and 228, `perf/lib/instrumentation.ts` and `perf/lib/page.ts`.
- **Protected and config files:** `b-round-312/protected-sha256.txt`, 11/11 OK [K19]. They must stay OK.
- **`perf/budgets.json`** is byte-equal to round 313's sketch [K21] and **does not change in this round**.

## 0. Why this round

### 0.1 What failed (C-R313-01, Medium, origin: pre-existing harness scenario design from PERF-1a)
Two rows are checked for exact equality across the three 6× passes of one run:
- `fader.clipgain.playing.commits-per-move.6x`;
- `fader.clipgain.playing.release-commits.6x`.

They read either 91 commits with 1 release commit, or 92 with 2. When one run mixes the two values, the run fails. In 17 runs (51 passes) the value varied across runs on the same machine, under the HEAD harness and on the HEAD app as well (C's head-app-control was 92/2). So neither round 312 nor round 313 caused it. A history scan of every saved perf JSON (3,424 release-commit row samples) found no other within-run variation.

### 0.2 Cause (B probe, `b-round-313/probe/`)
- **Probe setup.** A scratch copy recorded the component names of each commit in the release window. Evidence: `probe.patch.txt`, two runs.
- **What it caught.** Run 2 caught a 92/2 pass [K14]:
  - release commit 1, at +6 ms: `Pm, Pm, ArrangementDetailClipGain` (the fader's own release);
  - release commit 2, at +28 ms: `_0, D0, A0`.
- **The names.** Resolved in the production bundle (`probe/minified-names.txt`), `_0, D0, A0` are `ArrangementRuler`, its ticks and its playhead. The ruler subscribes to timeline scroll.
- **Mechanism (tech-lead, from code).**
  - Follow is `'on'` by default [K8].
  - The Follow position subscriber returns early while a pointer gesture is active [K8].
  - So a page turn that falls due during the drag fires on the first position tick after pointerup.
  - The playing fader scenarios run back to back on one playback (track → pan → master → clip gain). The clip-gain 6× drag is the latest and longest, so whether the page turn lands right after its pointerup depends on how long the run took.
  - The 92/2 pass had the longest drag (last commit 1,675 ms before pointerup, against about 900 ms in the others).
- **Classification.**
  - **Confirmed:** the extra commit is the ruler, not the clip-gain block.
  - **Inference, supported by code and by the sketch runs:** the cause is the held-back Follow page turn.
  - The app behaviour is correct: Live also follows the playhead. It is not a fader cost.

### 0.3 What changes for the user
Nothing. Only the perf harness and two docs change. No app file changes [K3].

### 0.4 Reference / screen budget
This is a perf-harness, test-only round, so the reference rule does not apply. Nothing persistent is added to the screen.

### 0.5 Consults (read-only)
- **tech-lead.** Verdict: **change (small)**.
  - **Confirmed:** the mechanism (file:line in §0.2). Nothing from the Follow click can land in a later window: one batched commit, absorbed by `waitForStudioQuiet`; the status text has no timer. The scroll guard cannot false-fire in stopped passes (the clip click and `scrollIntoViewIfNeeded` both run before the first read). Exact equality is right for `scrollLeft`.
  - **Adopted:** guard the idle window too. Follow is still on while idle playback is measured, so the harness reads `scrollLeft` at idle start and again after Follow off. This one bracket also covers tech-lead's "no page turn before Follow went off".
  - **Not adopted: editing the `fader.*.playing.*` notes in `budgets.json`** (24+ rows). The precondition is one fact about the scenario, so it lives in one place: the `passSequence` entry, which every report carries, and doc 163's pass section. `budgets.json` stays byte-equal [K21], so each row keeps one rule (L4).
  - **Recorded, not scheduled:**
    - R313-METER-OVER-LATCH-WATCH (info): the meter "over" flags latch once per crossing. If the fixture ever clips while a fader is near max, one extra commit would land in a phase-dependent window. Never seen in any run.
    - Scroll-event counting (catches an out-and-back scroll inside a window): optional.
    - R313-FOLLOW-PAGE-TURN-COVERAGE (signal): a page turn's own cost is no longer measured anywhere. It is a candidate playback row for a later PERF task.
- **Not consulted:** performance-optimizer. This is a harness fix-up, not a new PERF task; PERF-5b's consults come at its planning.

## 1. Rulings
| Id | Severity | Ruling |
|---|---|---|
| C-R313-01 | Medium | **This round** (§4). Origin: pre-existing (PERF-1a scenario). The app code of rounds 312 and 313 is cleared |
| A-R313 STOP (A-PERF 2/2 on C-R313-01) | — | Correct STOP. A-DOC and A-REVIEW are re-dispatched here (§3.1) |
| R224-WINDOW-BOUNDARY-WATCH | info | Updated: the first variation seen in a release window had a scenario cause (Follow), not a window-boundary cause. Watch kept |
| Lows from earlier rounds | Low | Unchanged in `deferred_low_polish` (the PERF-5 batch closes in PERF-5b) |

## 2. B's pre-check (L23, L37)
**Scratch.** `/tmp/b314k` is a tar copy of A's real tree (round 312 + round 313), with `node_modules` symlinked and its own `cacheDir`. The mutant copy `/tmp/b314m` has its own `cacheDir` too. Every perf run ran alone.

**Final sketch:** `b-round-313/sketch.patch.txt`, with full copies in `sketch-studio-lab.perf.spec.ts.txt`, `sketch-report.ts.txt` and `sketch-report.test.ts.txt`. From `store/`, `git apply --check` succeeds on A's tree.

**Static and unit checks:**
- `tsc --noEmit` rc 0 (`precheck-tsc.log`).
- `report.test.ts` passes **34/34** through the scratch `vitest.perf-scratch.config.ts`: 29 old tests plus 5 SCROLL1 cases [K11].
- **Unit mutants** (`b-round-313/unit-mutants.sh`, output `precheck-unit-mutants.txt`) [K17]. Restored: 34 passed.

  | Mutant | Red |
  |---|---|
  | MU-OVERLAP-ONLY | 1 |
  | MU-START-INSIDE | 3 |
  | MU-NO-TOLERANCE | 1 |
  | MU-SCROLL-NOOP (always `null`) | 3 |
  | MU-SCROLL-TOLERANCE-1PX | 1 |

**Browser runs** [K12], `precheck-perf-*.{json,log}`:

| Run | Sketch | failures | 6× clip-gain commits / release |
|---|---|---|---|
| k1 | without the idle bracket | 0 | 91, 91, 91 / 1, 1, 1 |
| k2 | without the idle bracket | 0 | 91, 91, 91 / 1, 1, 1 |
| k3 | **final** | 0 | 91, 91, 91 / 1, 1, 1 |

- **k1 and k2 against the HEAD-harness control** (`a-round-313/perf-control-headharness.json`): every deterministic row is equal, 164/164 and 0 differ in each of k1, k2 and k3 [K23], `precheck-row-compare.txt`. Turning Follow off changes no measured value; it only removes the confound.
- **Browser mutant `/tmp/b314m`** [K13] combines two mutations: the Follow-off step is removed, and `scrollLeft += 50` runs right after pointerup.
  - It fails with **117 failures**, all from the new guards: 81 "timeline scrolled during …", 12 "Follow is on before …" and 24 "Follow is paused before …".
  - The programmatic scroll counts as manual navigation, which pauses Follow; that is the app's documented behaviour.
  - The idle bracket was added after this run. Its guard is the same `timelineScrollProblem` call, covered by SCROLL1 and by this mutant's wiring.

**Not run: the full vitest suite.** No `app/**` file changes, and `perf/**` is outside the vitest include.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-313/claims-314.sh` equals `b-round-313/claims-314-head-output.txt`. A difference is a STOP |
| A-APPLY | From `store/`: `git apply ../tmp/studio-real-loop/b-round-313/sketch.patch.txt`. The 3 files are then byte-equal (`cmp`) to the matching `sketch-*.txt` copies. `budgets.json` is untouched. Any other change to them is a STOP |
| A-TYPE | `npm run typecheck` rc 0 (L30) |
| A-UNIT | On a scratch copy, never in `store/`: write `vitest.perf-scratch.config.ts` with `test.include: ['perf/**/*.test.ts']`, then run `npx vitest run --config vitest.perf-scratch.config.ts perf/lib/report.test.ts`. 34 tests pass. From inside the scratch, `bash /home/runner/czaba-project/tmp/studio-real-loop/b-round-313/unit-mutants.sh` prints output equal to `b-round-313/precheck-unit-mutants.txt` |
| A-PERF | Warm up `/studio-lab` once in a browser, then run `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts` **alone** (L38). The spec passes with `failures` empty. No failure string contains `timeline scrolled`, `Follow is`, or `nondeterministic`. Copy `test-results/perf/latest.json` to `a-round-314/perf-a.json` and the console to `a-round-314/perf-a.log` |
| A-DOC | §5 items 4 and 5, in Georgian with technical terms in English. Cite only rows and names that exist (L26). Edit whole granted sections (L34) |
| A-REVIEW | Run `code-reviewer` on the 5 changed files (3 perf files + docs 163 and 228). Ask about: the Follow-off placement relative to the `play.idle-*` window; false-fire paths of the scroll guard; whether turning Follow off hides any fader cost; the doc accuracy. A Medium+ inside the grants is fixed and re-reviewed (L11). A §4 rule change is a STOP |

### 3.2 C's rows
C writes `c-round-314.md` and `c-round-314.json` as it goes, with the L57 fields:
- `assertsSpecified` = 3: the Follow-mode guard, the timeline-scroll guard (drag and idle bracket), and SCROLL1;
- `mutantsRecorded` = 6: the browser mutant MU-FOLLOW-SCROLL plus the 5 unit mutants in `unit-mutants.sh` (3 carried from round 313 on `injectedLoafEntries`, 2 new on `timelineScrollProblem`);
- `mutantRedOnSketch` = 6.

Each finding carries an `origin`.

| Row | Action | Expected |
|---|---|---|
| SOURCE-SCOPE | `git status --short --untracked-files=all`. Then, from `store/`, `sha256sum -c` of `b-round-312/a312-app-code-sha256.txt`, `b-round-313/a313-tree-sha256.txt` and `b-round-312/protected-sha256.txt` | 12 entries: the 11 at planning, plus M on doc 163. Doc 228 stays `??`. App code: 6/6 OK. Tree manifest: exactly `perf/budgets.json`, `perf/lib/instrumentation.ts` and `perf/lib/page.ts` stay OK (3/8). Protected: 11/11 OK |
| CLAIMS | Re-run `claims-314.sh` | Equals `claims-314-sketch-output.txt` on K5, K6, K7, K8, K11–K18, K21, K22 and K23. These differ by design: K2 becomes `12 dfa4502`; K4 becomes `3`; K9 becomes the round-314 l.4; K10's first number becomes ≥ 1 and its heading lines may shift (DOC checks by heading). K19 stays `11`. K20 stays `228-perf-peaks-worker.md`. Any other difference is a planning FAIL |
| CARRY | Read `c-round-312.json` and `c-round-313.json` | Valid only if SOURCE-SCOPE shows app code 6/6 OK and `budgets.json` OK. Then round 312's 13 app rows and round 313's HARNESS-HEAD-CONTROL, MU-LIVE-BUSY0, LOAF and PK-SANITY stand without a re-run. The sketch adds lines only; it changes neither the LoAF step nor the load window |
| HARNESS-PASS | Perf spec on A's tree, **alone**, after a browser warm-up (L38). **2 runs** | Both runs pass with `failures` empty. In every pass, `fader.clipgain.playing.release-commits.6x` and `commits-per-move.6x` agree within the run. Report the 6× clip-gain commits and release commits per pass. `harness.loaf-scripts-live` stays ≥ 50 with `loafEntries` 1 |
| ROW-EQUALITY | Compare every `deterministic` row of both runs with `a-round-313/perf-control-headharness.json` (C may reuse `b-round-313/precheck-row-compare.txt`'s method) | 164/164 equal. A difference is reported with its row id. One that comes from the patch is a FAIL; otherwise it is a new finding with its origin |
| MU-FOLLOW-SCROLL | On a scratch copy of A's tree (own `cacheDir`), remove the `setFollowOff` call in `runPass` and add `scrollLeft += 50` on `arrangement-timeline-scroller` right after `page.mouse.up()` in `dragFader`. Run once | The spec fails. `failures` contains "timeline scrolled during fader.<name>.<state>" for every fader drag and "Follow is on before fader.track.playing" in every pass; no other failure class appears, except possibly the idle-bracket string (it still runs and fires only if a real page turn falls inside idle playback). Record the counts per class (B's run, made before the idle bracket existed: 81 / 12 / 24 of 117, [K13]) |
| UNIT | As A-UNIT (same absolute script path), on C's own scratch, plus at least one mutant of C's own on `timelineScrollProblem` or its call sites | 34 tests pass. The script output equals `precheck-unit-mutants.txt`. Record C's own mutant |
| FOLLOW-UI | In the browser at 1440×900, on `/studio-lab` with the demo project: Space to play, wait for a Follow page turn (or zoom in so the playhead nears the right edge), press Follow, and confirm `data-follow-mode="off"` and that `scrollLeft` no longer changes for 5 s while playing. Press Follow again: `on`. Stop | Follow toggles on → off → on as before. This proves the harness's click is a real user action with the documented effect. A screenshot of each state |
| DOC | Check doc 163's granted sections against the live spec (L34). Check doc 228's l.4 byte for byte, and that the 7 TEMPLATE headings appear in order (L26) | Doc 163 names the Follow-off step and the idle bracket at their real positions, describes the timeline-scroll guard and the Follow-mode guard, and has one Problem → Solution for C-R313-01 that matches §0.2 (confirmed vs inferred kept apart). Doc 228 has the round-314 l.4 and Problem → Solution entries for C-R312-01 and C-R313-01 |
| G314-AUTH | As G313-AUTH (copy `c-round-313/g313-auth.cjs`), **both viewports** | `/studio-lab`: workspace and demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token in any body |

**Gate rows.** C does not claim these; they go under `"gate"`: full vitest, build, Biome, `npm run verify` and the e2e smoke.

**Browser flags.** `browserVerified` is true only if HARNESS-PASS, FOLLOW-UI and G314-AUTH all ran. MU-FOLLOW-SCROLL is wanted. If the environment stops it, list it under `"notRunnableHere"` with the log.

## 4. Contract (D-29z842)

### 4.1 `perf/lib/report.ts` (append only; every existing export byte-unchanged)
New `timelineScrollProblem(label, before, after)`:
- returns `null` when `before === after` (exact);
- otherwise returns `timeline scrolled during ${label}: scrollLeft ${before} -> ${after}`.

### 4.2 `perf/studio-lab.perf.spec.ts` (exactly the sketch hunks)
- **Imports:** `waitForStudioQuiet` (from `./lib/page`) and `timelineScrollProblem`.
- **`passSequence`:** one entry before `fader.track.playing` that names the Follow-off step and the idle bracket.
- **New `timelineScrollLeft(page)`:** reads `scrollLeft` of `arrangement-timeline-scroller` [K7].
- **New `setFollowOff(page, problems, label)`:**
  1. Click `arrangement-follow` [K7] until `data-follow-mode` is `off`, at most 2 clicks (paused → on → off).
  2. Expect `off`.
  3. `blurActive`, so Space never presses the button.
  4. `waitForStudioQuiet`.
- **`dragFader`:**
  - In a playing drag, it pushes `Follow is <mode> before <label>` when the mode is not `off`.
  - It reads `scrollLeft` before `t0` and after `tEnd`, and pushes `timelineScrollProblem(label, …)` when non-null.
- **`runPass`:**
  - `scrollLeft` is read right before `idleStart`.
  - After the `play.idle-*` block and before the ungrouped playing faders: `setFollowOff`, then `timelineScrollProblem('idle playback and Follow off', idleScroll, now)`.
  - Follow stays off through the later Stop/Play (only `paused` is reset by the app), so the group and members playing drags inherit it. Their per-drag guard checks this.

### 4.3 `perf/lib/report.test.ts`
- Import `timelineScrollProblem`.
- Add one `it.each` named `SCROLL1` with 5 cases, as in the sketch: unchanged at 0; unchanged after a page turn; one page turn; a sub-pixel change; a scroll back.
- No existing row changes (L4).

### 4.4 Unchanged
`perf/budgets.json` (byte-equal [K21]), `perf/lib/instrumentation.ts`, `perf/lib/page.ts`, the other two perf specs, and every `app/**` file.

**Rejected options:**
- **A row contract relaxation:** `wallclock` kind, or an allowed set `{1, 2}`. The variation has a known external cause, so relaxing would hide it; policy says tolerances are not weakened to write PASS.
- **A re-run budget for A-PERF:** the same reason.
- **Seeking the playhead to 0 before each drag:** it adds a seek restart before every drag and moves the `restarts` windows.
- **An app change:** the Follow hold-back during a gesture is correct behaviour.
- **Editing 24+ budget notes:** see §0.5.

## 5. Grants
A edits only:
1. `perf/studio-lab.perf.spec.ts`: §4.2.
2. `perf/lib/report.ts`: §4.1, append only.
3. `perf/lib/report.test.ts`: §4.3, append only.
4. `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`, these whole sections only (L34) [K10]:
   - `### Pass-ის თანმიმდევრობა (ინტერპრეტაცია)`, up to `## არქიტექტურა`. Add round 313's liveness step and round 314's Follow-off step and idle bracket.
   - `## მეტრიკების განმარტება და ზღვრები`, up to `## შეცვლილი ფაილები`. Add round 313's `load.script-max` change and `harness.loaf-scripts-live` row. Add one line for the two guards, and say that the `fader.*.playing.*` rows are measured with Follow off.
   - `## პრობლემები და გადაწყვეტები`, up to `## ტესტირება`. Add one Problem → Solution entry each for C-R312-01 and C-R313-01.
   - `## ტესტირება`, up to the next heading. Add one line naming LOAF2, SCROLL1 and the browser mutants.
5. `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md` (A's own new file):
   - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 314 PASS)` (L28);
   - `## პრობლემები და გადაწყვეტები`: one entry for C-R312-01 (the harness guard starved by the improvement) and one for C-R313-01 (pre-existing, not caused by PERF-5a);
   - `## ტესტირება`: one line naming `harness.loaf-scripts-live` and the HEAD-app control.

**Nothing else:**
- no `app/**` file (the 6 code paths stay byte-equal [K3]);
- not `perf/budgets.json`, `perf/lib/instrumentation.ts`, `perf/lib/page.ts` or the other two perf specs;
- no other test file;
- not `package.json`, `biome.json`, `vite.config.ts`, `playwright.perf.config.ts` or any protected file;
- no dependency change.

## 6. Specified test rows (L52)
| Assert | Red-proof |
|---|---|
| Follow-mode guard | MU-FOLLOW-SCROLL (browser, [K13]: 12 "Follow is on" + 24 "Follow is paused") |
| Timeline-scroll guard (per drag) | MU-FOLLOW-SCROLL (81 hits, [K13]) |
| Idle bracket | Same `timelineScrollProblem` call; SCROLL1 + MU-SCROLL-NOOP. No browser negative control: a deterministic idle page turn is not available without an app change. This is recorded as a gap, not claimed |
| SCROLL1 | MU-SCROLL-NOOP (3 red), MU-SCROLL-TOLERANCE-1PX (1 red), [K17] |

## 7. A's order of work
1. A-CLAIMS.
2. A-APPLY.
3. A-TYPE.
4. A-UNIT, on a scratch copy.
5. A-PERF, alone.
6. Docs.
7. A-REVIEW; re-review any fix.
8. `a-round-314.md`: the changed files, the rows, and "Next C checks".

## 8. Neighbouring behaviour at risk (C probes)
- **`play.idle-*` rows:** sampled before the Follow click; expected unchanged (ROW-EQUALITY).
- **`harness.restart-live`** (clip drag while playing, after the faders): Follow is now off there; expected 1/1/1.
- **Group and members playing rows:** they inherit Follow off; expected unchanged.
- **The 6× passes:** they run the same Follow step, so values are expected equal to the HEAD control.
- **Idle bracket margin (not a contract):** idle playback still runs with Follow on. No recorded run has a page turn there (`play.idle-commits` is 0 in every run), but that is a timing margin. If a later fixture, zoom or idle-length change makes the idle bracket fire, it is a scenario re-rule (signal R313-FOLLOW-PAGE-TURN-COVERAGE), not a harness bug and not an app bug. A and C report it that way.

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-314.md` and changes nothing else when:
- A-CLAIMS differs from the HEAD output;
- `git apply` fails, or a change is needed outside §5;
- A-PERF fails in two valid runs (an overlapped run is environment-invalid, L38);
- a §4 rule would have to change (exact equality, the Follow step's place, the guards);
- typecheck fails;
- the reviewer reports a Medium+ outside the grants.

## 10. Next, and requests (D-29z844)
- **After C PASS and the gate:** root publishes round 312's 7 paths and round 313/314's 5 changed perf/doc files together. PERF-5a is then done; PERF-5 stays in progress until 5b.
- **Next round:**
  - **REGRESSION**, if the round-315 planning falls on or after **2026-11-05** [K16];
  - otherwise **PERF-5b**, with its own premise measurement and the deferred PERF-5 Low batch.
- **RETRO:** at round 320.
- **For Saba (unchanged):** SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **For root:** ROOT-REQ-VITEST-PERF-INCLUDE and ROOT-REQ-VERIFY-WORKER-TESTS stay open. No new checkpoint request.
- **L37 gains one clause:** before ruling a perf count unstable, B identifies what the extra commit renders (component names in a scratch probe); a playback-phase confound is removed from the scenario, never absorbed into the row's contract.

## 11. Commit readiness
After C PASS and the gate, root publishes:
- from round 312: 2 M + 5 new paths;
- from rounds 313 and 314: M on the spec, `budgets.json`, `report.ts`, `report.test.ts` and doc 163.

There is no deploy step.

## 12. Claims (L29 + L56)
Run `bash b-round-313/claims-314.sh` from the loop root. Outputs:
- `b-round-313/claims-314-head-output.txt`: A's tree at planning;
- `b-round-313/claims-314-sketch-output.txt`: `CLAIMS_STORE=/tmp/b314k`, the final sketch.

| Tag | Claim | Expected at planning |
|---|---|---|
| K1 | gate 313 status | `skipped C taskStatus FAIL` |
| K2 | `git status` entries, HEAD | `11 dfa4502` |
| K3 | the 6 round-312 app code paths match C 312's state | `6` |
| K4 | the 8-path tree manifest | `8` (sketch `5`: spec, `report.ts` and `report.test.ts` change) |
| K5 | files naming `timelineScrollProblem` | none (sketch: `perf/lib/report.test.ts perf/lib/report.ts perf/studio-lab.perf.spec.ts`) |
| K6 | `setFollowOff(` and `timelineScrollLeft(page)` counts in the spec | `0 0` (sketch `2 4`) |
| K7 | app files carrying the `arrangement-follow` and `arrangement-timeline-scroller` test ids | `ArrangementTransport.tsx` and `StudioWorkspace.tsx` |
| K8 | Follow default `'on'`; the gesture early-return line in the Follow subscriber | `1 1` |
| K9 | doc 228 l.4 | `**სტატუსი:** In Progress (stage 1 of 2; C round 312 PASS)` |
| K10 | doc 163: `arrangement-follow\|timelineScrollProblem` hits; then the lines of `### Pass-ის…`, `## არქიტექტურა`, `## მეტრიკების…`, `## შეცვლილი ფაილები`, `## პრობლემები…`, `## ტესტირება` | `0 20 39 58 87 98 108` (the sketch does not edit docs; after A, the first number is ≥ 1 and the lines may shift) |
| K11 | B's `report.test.ts` scratch run | `34` |
| K12 | B's runs k1, k2, k3: failures / 6× clip-gain commits / release commits | `k1:0/91,91,91/1,1,1 k2:0/91,91,91/1,1,1 k3:0/91,91,91/1,1,1` |
| K13 | MU-FOLLOW-SCROLL: scroll / Follow-on / Follow-paused / total failures | `81 12 24 117` |
| K14 | probe run 2: the release samples and pass 1's release commits | `[2, 1, 1]`; `+6 ms Pm,Pm,ArrangementDetailClipGain` and `+28 ms _0,D0,A0` |
| K15 | round-313 archive equals the copy | `archive-equal-313` |
| K16 | last regression date | `2026-11-02` |
| K17 | unit mutants: 0-red count; mutant lines; restored | `0 5 restored: 34 passed` |
| K18 | every cited `b-round-313/` artifact exists (L56) | `done` |
| K19 | the 11 protected/config files | `11` (sketch `10`: the scratch's own `cacheDir`) |
| K20 | last doc in quarter IV | `228-perf-peaks-worker.md` |
| K21 | `budgets.json` equals round 313's sketch copy | `budgets-equal-313-sketch` |
| K22 | `report.test.ts`: `it.each`/`it(` lines; LOAF1/LOAF2/SCROLL1 labels | `21 2` (sketch `22 3`) |
| K23 | B's row comparison: rows that differ, k1, k2 and k3 | `0 0 0` |
