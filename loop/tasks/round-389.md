# Round 389: REGRESSION round, part 1 (REGRESSION-2026-11-08). C-only browser sweep of everything finished in rounds 343–388, newest risk first. A changes nothing

**Planned by:** B, at the round 388 → 389 planning, 2026-11-07 (`b-round-388.md`).
**Decisions:** D-29z1310 … D-29z1315 (`backlog.json` v356, `decisions_log_b`, `regression_rounds` id `REGRESSION-2026-11-08`).

**Read first:**
- `lessons.md` in full. Directly relevant: L6 (every scope addition is a named row or "carried"), L29 and L56 (claims), L38 (perf runs alone), L48 (playback-start lead; wait for `Demo collection ready`), L54 (journey row), L57 (harness fields), L59 (do not end early), L60 (destructive commands stay in `c-round-389/`).
- The rules: `docs/technical/studio-real-workspace/agent-workflow.md`: the speed rules and "Regression round every 3 days", the 2026-10-23 bug gate, the cloud-runner section.
- **The template, by reference:** `tasks/round-340.md` §1–§7 (which references round 301 → 258 → 199), plus `c-round-340.md`, `c-round-341.md`, `c-round-342.md` and their `tools/`. **This task lists only rounds 343–388. Where it differs from round 340, this task wins.** Part 2 (the round-340 rows for everything up to round 342) is round 390 (§7).
- The previous task: `tasks/round-388.md` (exact copy). B's reasoning: `b-round-388.md`.
- Every fact about current code below carries a `[K#]` tag from `b-round-388/claims-389.sh` (planning output `b-round-388/claims-389-planning-output.txt`). Run it from the loop root at SOURCE-SCOPE start and end.

## Baseline: HEAD `11ca746`, clean tree
- `gates/gate-round-388.json` is `published`, `commit` `11ca746397c8…` on both remotes [K1]. Its `head` field `5312260` is the pre-commit HEAD; do not use it. `context/head-sha.txt` is stale as well.
- At planning: `git rev-parse --short HEAD` = `11ca746`, `git status --short --untracked-files=all` empty [K2]; protected files 11/11 OK (`b-round-318/protected-sha256.txt`) [K3]; tracked tree frozen in `b-round-388/r389-tree-sha256.txt` (1284 entries, 0 failures) [K4]. From `store/`, `sha256sum -c` on it must report 0 failures at start and at end.

## 0. Why this round (D-29z1311)
- **Round 388 passed and is published** (C PASS, `browserVerified`/`realVerified` true, 0 bugs; gate 388 `11ca746`). No Critical, High or cloud-reproducible Medium is open; the open Mediums are root-only or manual-only.
- **The regression opens one day before the 3-day trigger, on purpose.** `regression-last.json` = 2026-11-05, round 342 [K5]; the speed rule would require it from 2026-11-08. D-29z1309 fixed "the next planning opens it unconditionally". Independent reason: rounds 385–388 changed shared playback infrastructure (graph build and rollback, loop pump, `tick`, stop lifecycle), which the workflow names as a trigger for re-checking unchanged features. The 3-day rule is a floor, not a prohibition.
- `regression-last.json` is updated only when the whole regression closes (precedent: rounds 340–342).

## 1. A: no code or doc change
- From `store/`: `git rev-parse HEAD` must be `11ca746…` and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-389.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer: there is no change.
- Write `a-round-389.md`: the start HEAD, the status output, and "no change by design (REGRESSION round, D-29z1311)".
- Forbidden: `global_forbidden_files` / `global_forbidden_actions`, the protected files, commit, push, stash, checkout, deploy, dev-server restarts.

## 2. C: scope, method and budget (round 340 §2 applies, with these changes)
- **SOURCE-SCOPE** at start and at end: HEAD `11ca746`, status empty, K3 11 OK, K4 0 failures. Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **Tools.** Each row below names the C script of the round it re-checks (all exist [K10]). Copy what you use into `c-round-389/tools/`. Where a round kept no script, rebuild the check from that round's row text in `c-round-N.md` and record a lookup. Adapting a script only for a UI fact changed after its round is "lookup, not deviation"; name the fact.
- **Changed UI facts since round 342** (adapt older scripts to these):
  - **A graph-build failure now stops playback** with the `scheduleFailed` status (rounds 386–388), and the meters fall to −∞ [K9].
  - **Play is refused while a needed source is still decoding** (round 382; the refusal text is in `c-round-384/playrefuse.mjs`). A script that presses Space right after an add waits for `Demo collection ready` and for the refusal to clear (L48).
  - **Decoded audio of unpinned sources can be evicted** (rounds 382–384): `AudioBuffer` identity across an evict is not a regression signal; audible output is.
  - **No framer page transition on `/studio*`** (round 370).
- **Single dev server (D-29z1057 still holds).** Every dev row runs on :5173. If a row needs a production build (stem-cache spec, heap), serve the build; never start a second dev server from a tree that symlinks the store's `node_modules`.
- **Mock API** for the journey row only: start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199 (at planning :5199 = 000 [K6]), record its PID, stop only that PID. Mock data is not backend evidence.
- **Order** (after a time-limit stop, resume from `c-round-389/progress.json`): SOURCE-SCOPE start and claims → §3 rows top to bottom → §4 (RR-PERF alone, then PERF-LIB, then RG-SMOKE) → G389-AUTH → SOURCE-SCOPE end. **Write `c-round-389.json` and `c-round-389.md` after every row.**
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only (the cold-start timeout on the Sounds listbox is the known one; keep its log). Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Console noise known in the cloud:** `Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`. Record any other page error with its row.
- **Ableton:** no new behaviour, no new parity claim. C judges the CZABA requirement only.
- **Both viewports** (1440×900 and 1280×720) on every row unless the row says otherwise.

## 3. C: items finished in rounds 343–388 (one short check each)
"As in round N" means: reuse that round's C script and threshold. Every scope addition of `REGRESSION-2026-11-08` is a row here or in §4 (L6), shown as **[SA-n]**.

| Row | Item (rounds) | Action and expected |
|---|---|---|
| R389-SCHED-FAIL **[SA-1]** | schedule-failure rollback + meter floor (386–388) | As METER-FLOOR, METER-CONTROL, METER-PLAYING and M2-FLOW (round 388; `c-round-387/meter-freeze.mjs`, `meter-control.mjs`, `b-round-386/probe/m2-flow.mjs`). Loop on, Play, the meters move; arm the injected `start()` throw: thrown ≥ 1, stopped, `scheduleFailed` status text, all meters `-inf`, clock frozen, `pageErrors` []. Control: a normal Stop floors the meters. A later clean Play plays, and nothing is left sounding after Stop (leaked 0) |
| R389-RESYNC-METER **[SA-2]** | round-388 reviewer L1 (the `late` resync branch in the pump [K8]) | Same setup as R389-SCHED-FAIL, but after arming the throw, block the main thread once (a `page.evaluate` busy-wait of 1.5 s, longer than the loop) so the pump falls behind. Expected: the same end state (stopped, `scheduleFailed`, meters `-inf`, clock frozen, no further meter change, `pageErrors` []). Which path threw (fill or resync) is **not** claimed; the browser cannot tell them apart, and the unit row for it is the deferred SF12 candidate. A frozen meter or a running clock on a valid run is a Medium finding |
| R389-EDIT-THROW **[SA-1]** | M1-NEIGHBOUR (387/388) | As round 388 M1-NEIGHBOUR (`b-round-385/probe/resync-throw.mjs`; expected values in `c-round-388/m1-*.json`): an edit while the throw is armed keeps the edit (clip count +1, Undo available), status `scheduleFailed`, and the next clean Play plays |
| R389-DECODE-CACHE **[SA-3]** | PERF-13b-i (382–384) + deferred-preview fixes (386) | As PLAY-REFUSE-BROWSER and EVICT-B2-COUNT (round 384; `c-round-384/playrefuse.mjs`, `c-round-384/evict.mjs`): the refusal text while decoding, then the 2nd Space plays; one `stop()` on the evicted preview, Add plays live, Undo removes it. Plus round 386 BROWSER-L2-OK: a library preview started during a decode plays once the decode ends, with no click-time stop. HEAP-RETAINERS-PROD at 1440 only (`c-round-384/heap-1440.mjs`, production build): live counts `[2,5,16,16,16,16,16]`, 0 `baseQueue` |
| R389-WAV-STREAM **[SA-4]** | PERF-12a (380) | Export WAV of the demo with 3 clips (as `c-round-386/export-wav.mjs`): 24-bit / 48 kHz, non-silent, length = arrangement end. At 1440 the sha256 of two exports of the same project in a row is equal (determinism). No page error; the dialog closes on Esc |
| R389-LEAVES **[SA-5]** | PERF-11c-i … c2b (371, 374–379) | One pass per leaf, behaviour only: <ul><li>group header (371): fold, mute and solo of the Stems group;</li><li>master (374/375, `c-round-375/master.mjs`): volume drag and readout, double-click reset;</li><li>Export dialog (374): opens, Esc closes, focus returns to the Export button;</li><li>library (375): select, preview, Add;</li><li>transport (376/377, `c-round-376/browser.mjs`, `c-round-377/probe-range.mjs`): Play, Stop, Loop, back to start, Follow, and the soft-disabled focus handoff;</li><li>loop brace (378, `c-round-378/smoke378.mjs`): drag both brace ends;</li><li>marker row (379): add, rename by Enter, delete.</li></ul> Expected: each behaves as its round's PASS row; 0 page errors |
| R389-STATUS **[SA-6]** | PERF-11c-ii (372/373) | The status line after an add, a Play, a Stop, during a clip drag (drag hint), and after Esc cancel. Each text equals its round-373 row; no stale text after Esc |
| R389-LAZY **[SA-7]** | PERF-11a (370) | `/studio-lab` loads with no `signalr` chunk request (as round 370's row); navigating `/` → `/studio-lab` shows no framer page transition; the store home keeps its transition |
| R389-STEM-CACHE **[SA-8]** | PERF-9a/9b (365–368) | As `c-round-365/cache.mjs` and `c-round-368/export-trunc.mjs`: a reload uses the cache (OPFS hit; revalidation is conditional, 304 or no body); a cancelled write followed by a same-key write leaves one complete entry; export after a cached load is non-silent and full length |
| R389-RANGE-BG **[SA-9]** | PERF-10b-ii-b (363/364) | As `c-round-364/bg.mjs`: a lane-background drag makes a range; with Snap on it snaps; Esc clears it |
| R389-SELECT-TRANSPORT **[SA-10]** | PERF-10b-i/ii-a (361/362) | As `c-round-362/playstop.mjs`: clicking a lane makes it active (header state); Play and Stop by button and by Space; the clock stops where Stop was pressed |
| R389-PLAY-STORE **[SA-11]** | PERF-10a + C-R358-01 (357–360) | As `c-round-358/follow-probe.mjs`, `marker-probe.mjs`, `narrow-probe.mjs` and `c-round-359/settings-probe.mjs`: Follow scrolls while playing; markers stay put during play; below 900 px the calm narrow state shows; tempo, grid, Snap and metronome survive the remount that the round-359 probe triggers |
| R389-VIDEO-DRAG **[SA-12]** | PERF-DRAG-PREVIEW c5 + video trim/fade cost (345, 349–356) | As `c-round-345/flow.cjs` and `c-round-350/video-behaviour-probe.mjs`: move, trim-start and fade-in of the video clip by drag; the dock shows the right frame after release; Undo restores; video sound plays after the move |
| R389-FADERS-ICONS **[SA-13]** | c6-i/c6-ii (346/347) | As `c-round-347/faders.mjs` and `c-round-346/visual.mjs`: track volume and clip gain drags change the readout and the level (meter moves); the lane and clip icons render: the outerHTML of the fold chevron (unfolded, folded, re-unfolded), the two video-import Plus buttons and the audio grip is identical to round 346's `c-round-346/visual-after.json` (round 346's own comparison) |
| R389-GROUP-MOVE **[SA-14]** | c4-ii (343) | `node b-round-338/group-probe.mjs http://127.0.0.1:5173 <out> <w> <h>`: two selected clips move together, Undo reads "Move (2)"; with the Stems group folded, the overview bar follows |
| R389-JOURNEY **[SA-15]** | L54 | As R340-JOURNEY (round 340 §4d; mock API): product page → "Try it in the Studio" → `/studio-lab` titled "CZABA Studio" → Enter adds → Space ≥ 1 s → Stop → Export WAV non-silent → "View in store" opens a new tab with `opener` null. Screenshot per step |

## 4. C: perf, perf lib, smoke and auth
- **RR-PERF [SA-16]:** run `npm run test:perf` **alone**, after §3 (L38). 4 spec files [K7]; `perf/` last changed at `7295618` [K7]. PASS: rc 0, every spec passes, every asserted budget row passes, `complete` true, 0 aborts, 0 page errors. A failing budget on a valid isolated run is a finding: Medium for fader, drag or playback budgets, Low otherwise. `playwright.perf.config.ts` builds and serves one production server on :5188 for all 4 specs (stem-cache included, as round 366 ran it); the dev server on :5173 is not used by this row. No C full-run oracle exists on `7295618`: save `latest*.json` under `c-round-389/perf-results/` as the new oracle and report the row counts only.
- **PERF-LIB [SA-16]** (GATE304-M1 stays open until root lands ROOT-REQ-VITEST-PERF-INCLUDE): from `store/`, `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs`. All pass; report the counts (round 384: 3 files / 54 tests). Never during RR-PERF.
- **RG-SMOKE:** `npm run test:e2e:smoke` in `store/`, after RR-PERF, alone.
- **G389-AUTH:** as `c-round-388/auth-smoke.mjs`, both viewports: `/studio-lab` anonymous opens the workspace with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` with no header → 401 and no token in the body. Fake Bearer → BLOCKED (backend unavailable in cloud), listed under `blocked`; it does not make `browserVerified` false. SRW-21 stays `deferred_user`.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`.

## 5. What could break, and where to look first
- The tick guard (388) and the rollback (387) sit on every play path, so R389-SCHED-FAIL, R389-RESYNC-METER and R389-SELECT-TRANSPORT come first.
- The leaf memos (371–379) can show stale props: watch for a readout that does not follow a drag, or a disabled state that lags.
- The decoded cache (382–384) can make a first Play refuse: a refusal that never clears is a Medium finding.

## 6. Report
- `c-round-389.json`: `taskStatus` PASS, FAIL or PARTIAL; `passed`, `failed`, `blocked`, `gate`, `bugs` (each with `severity`, `origin`, repro and evidence path), `browserVerified`, `realVerified`, and the L57 harness fields.
- `c-round-389.md`: one table, one line per row, with its evidence file.
- PARTIAL is allowed only for a real time-limit stop, with `progress.json` naming the rows left. It is not done.

## 7. Outcome, fixed in advance (D-29z1315)
- **C PASS on every row:** round 390 = REGRESSION part 2 on `11ca746`: round 340 §3, §4, §4.S, §4b, §4c, §4d and §5 rows (rounds 199–342, the parked RP rows). When part 2 closes, B updates `regression-last.json` and the queue resumes with PERF-13b-ii.
- **A Critical or High finding:** round 390 is its bounded fix-up; the regression resumes after it.
- **A Medium finding:** round 390 is its fix-up (at most three related bugs), unless it is root-only or manual-only; part 2 follows.
- **Lows:** recorded and moved to `deferred_low_polish`; they reorder nothing.
- **PARTIAL:** round 390 continues part 1 from `progress.json` before part 2.
