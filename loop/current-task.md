# Round 423: REGRESSION round, part 1 (REGRESSION-2026-11-10). C-only browser sweep of everything finished in rounds 391–422, newest risk first. A changes nothing

**Planned by:** B, at the round 422 → 423 planning, 2026-11-09 (`b-round-422.md`). The advisor was used after orientation and before close. The round-422 task is archived as `tasks/round-422.md` [K11].
**Decisions:** D-29z1475 … D-29z1478 (`backlog.json` v399, `decisions_log_b`, `regression_rounds` id `REGRESSION-2026-11-10`) [K13, K14].

## Read first
- **`lessons.md` in full** [K16]. Directly relevant: L6 (every scope addition is a named row or "carried"), L29 and L56 (claims), L38 (perf runs alone; warm `/studio-lab` in a browser before timed probes), L48 (playback-start lead; wait for `Demo collection ready`), L54 (journey row), L57 (all harness fields), L59 (do not end early; heaviest first), L60 (destructive commands stay in `c-round-423/`).
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md`: the speed rules and "Regression round every 3 days", the 2026-10-23 bug gate, the cloud-runner section.
- **The template, by reference:** `tasks/round-389.md` §2–§6 (part 1 of the previous regression) and `c-round-389.md` / `c-round-389/tools/`. **This task lists only rounds 391–422. Where it differs from round 389, this task wins.** Part 2 (everything up to round 390) is round 424 (§7).
- **Claims:** `bash b-round-422/claims-423.sh` (`ROOT=` and `LOOP=` can be overridden). Planning output: `b-round-422/claims-423-planning-output.txt` (stderr `claims-423-planning.err`, empty). Run it at G423-SCOPE start and end; the output must equal the planning output, except K12, which is compared by "every id located, none `NOT-FOUND`" (the optimizer may move a closed id to the archive between B and C, L56).

## Baseline: HEAD `875ff37`, clean tree
- `gates/gate-round-422.json` is `published` at `875ff37…` on both remotes [K6]. Its `head` field (`4786c13`) is the pre-commit HEAD; do not use it. `context/head-sha.txt` is stale as well.
- At planning: `git rev-parse HEAD` = `875ff37fdd79…` [K1]; status empty [K2]; tracked tree frozen in `b-round-422/r423-tree-sha256.txt` (1,321 entries, rc 0) [K3]; protected files 11/11 OK (`b-round-318/protected-sha256.txt`) [K4].
- If root publishes in between and K1 differs, a root-only commit that leaves `git diff 875ff37 HEAD -- app` empty is accepted with a note (L29); anything else is "STOP — baseline differs".

## 0. Why this round (D-29z1476, D-29z1477)
- **Round 422 passed and is published** (D-29z1475): C PASS, 8 rows, `browserVerified` true; gate 422 `875ff37` (verify: 264 files, 3,957 tests). SYS-2 stage 1 is done; GATE107-S1-MARKER-FLAG-HELD-ENTER is closed.
- **The regression is due.** `regression-last.json` = 2026-11-07, round 390 [K5]. B planned at 2026-11-09 22:5x UTC, about an hour before the 3-day trigger; A and C run on 2026-11-10. The 3-day rule is a floor, not a prohibition (precedent: round 389, D-29z1311). Rounds 391–422 also changed shared infrastructure: preview streaming, lane virtualization, actions context, precomputed peaks, stem cache and the transport key guards.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **STEM-LANES** still waits for Saba (`user-review/AGREE-STEM-LANES.md`, no answer).

## 1. A: no code or doc change
- From `store/`: `git rev-parse HEAD` must be `875ff37…` and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-423.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer: there is no change.
- Write `a-round-423.md`: the start HEAD, the status output, and "no change by design (REGRESSION round, D-29z1477)".
- Forbidden: `global_forbidden_files` / `global_forbidden_actions`, the protected files, commit, push, stash, checkout, deploy, dev-server restarts.

## 2. C: scope, method and budget (round 389 §2 applies, with these changes)
- **Tools.** Each row names the script of the round it re-checks; every one exists [K8]. Copy what you use into `c-round-423/` and run the copies; never write into an earlier round's folder (L38, L60). Keep each copy at the same folder depth as its source, so its relative `c-round-382/lib.mjs` import still resolves. Three scripts hard-code an output path in their own round folder; their rows name the change. Where a script needs a path or URL changed, that is "lookup, not deviation"; name the change.
- **Changed UI facts since round 390** (adapt older scripts to these; all tagged):
  - A held Enter acts once on the transport buttons: the shared repeat guard is the `onKeyDown` of 11 transport buttons; Fit stays unguarded by design [K9 transport-repeat-guard 11].
  - Lanes virtualize clips: count clips from the lane's model count attribute, never from DOM clip elements [K9 lane-data-clip-count 1].
  - The demo ships precomputed peaks [K9 demo-peaksUrl 1]: the library waveform shows dimmed before the MP3 decodes.
  - Library previews of URL-backed sources stream through a media element [K9 preview-client present].
- **Single dev server.** Every dev row runs on :5173. A row that needs a production build (RR-PERF, stem cache) serves the build; never start a second dev server that shares the store's `node_modules/.vite` (L38).
- **Mock API** for R423-JOURNEY only: start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199 (at planning :5199 answered `000`), record its PID, stop only that PID. Mock data is not backend evidence.
- **Order (L59: heaviest first):** G423-SCOPE start and claims → RR-PERF alone → PERF-LIB → §3 rows top to bottom → RG-SMOKE → G423-AUTH → G423-SCOPE end. Write `c-round-423/progress.json`, `c-round-423.json` and `c-round-423.md` after every row.
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only (cold-start timeout, port in use; keep the log). Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Console noise known in the cloud:** `Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`. Record any other page error with its row.
- **Reference / Ableton / product-designer:** regression round; no new behaviour and no new parity claim. C judges the CZABA requirement only. Ableton conformance: does not apply.
- **Both viewports** (1440×900 and 1280×720) on every row unless the row says otherwise.

## 3. C: items finished in rounds 391–422 (one short check each)
"As in round N" means: reuse that round's script and its PASS row as the oracle. Every scope addition of `REGRESSION-2026-11-10` is a row here or in §4, shown as **[SA-n]** (L6).

| Row | Item (rounds) | Action and expected |
|---|---|---|
| R423-HELD-ENTER | SYS-2 stage 1 (422) | As C round 422 row 4: copy `c-round-422/probe/held-enter.mjs`, `compare.py` and `c-round-422/probe/head/` to `c-round-423/probe/`, run with `OUT=<abs>/c-round-423/probe/sketch`, then `compare.py`. Pass: `ALL OK (12 cells)`. Plus round 422 row 5: Space plays (≥ 0.9 s position per ≥ 1 s wallclock, L48), Space stops and the position stays frozen 500 ms; one mouse click on Follow flips it once; with a time selection one click on Loop sets `aria-pressed` true; 0 page errors (`c-round-422/scripts/smoke.mjs`) |
| R423-MARKER-SEEK **[SA-6]** | INFO-C404-MARKER-SEEK-RECIPE | Copy `b-round-422/probe/marker-seek.cjs` and run it (`OUT=<abs>/c-round-423/marker`), then once with `NOMARKER=1`. Pass, both viewports: the flag reads 00:09.000, after the second ruler click the clock reads 00:03.000, after Home 00:00.000, after Next marker **00:09.000** (the flag time); the control without a marker gives a different Next target (B's baseline 00:16.000) [K10]; 0 page errors. A Next that ignores the marker is a Medium finding |
| R423-PREVIEW-LIFECYCLE | SYS-R416/R418 preview controller + lifecycle (418, 421) | As C round 421 row 4 and round 418 row 4: `c-round-421/probe/rows-421.mjs` and `c-round-418/probe/rows-418.mjs` on :5173. Oracle = the post-change run of those rounds: copy each round's `probe/sketch/*.json` into `c-round-423/probe-NNN/head/`, write the new run to `c-round-423/probe-NNN/sketch/`, then run that round's `compare.py` on `c-round-423/probe-NNN`. Pass: every cell equal (16 and 14 cells, as in those rounds) |
| R423-STEM-CACHE | SYS-R369 write coordinator (419) | As C round 419 row 4: copy `c-round-419/probe/` to `c-round-423/probe-419/`, then `run-probe.sh <scratch> sketch <port> <abs>/c-round-423/probe-419/out` on a `git archive HEAD` scratch copy with a symlinked `node_modules` (keeps `store/` clean; one production server, its own port). Oracle = `c-round-419/probe/out/sketch/` copied to `c-round-423/probe-419/out/head/`; run `compare.py` on `c-round-423/probe-419/out`. Pass: all 8 cells equal. Never during RR-PERF |
| R423-PEAKS | PERF-15a/15b-i/15b-ii-a (410–413) | As `c-round-412.md` rows R412-3 (WAVEFORM-BEFORE-READY) and R412-5b, and `c-round-413.md` row R413-5b: `b-round-412/probe/peaks-before-ready-413.mjs` and `b-round-409/probe/peaks-probe-410.mjs`. Pass: as those rows |
| R423-STEM-WORKER | SYS-R2-FAKE-FIDELITY browser half (414) | As C round 414 row 5: `c-round-414/worker-server.mjs` + `c-round-414/browser-probe.cjs`. Pass: as round 414 (`summarize-414.py` output equal) |
| R423-METER **[SA-4 audio graph output]** | SYS-R388 fake Web Audio helper (415) | As `c-round-415.md` row 5 (METER-PLAY-STOP): `c-round-415/meter-probe.mjs`, with its four output paths (`c-round-415/meter-*`) changed to `c-round-423/meter/`. Pass: as that row |
| R423-LANE | PERF-11c-iii-e (408/409) | As C round 409 row 4: `b-round-408/probe/leaf-probe-409.mjs`, plus `b-round-407/lane/lane-actions-probe.mjs` (fold, mute, solo, volume, active lane, clip select/move/trim per lane). Pass: as round 409's row |
| R423-VIDEO-DOCK | PERF-11c-iii-d (406/407) | As C rounds 406/407: `c-round-406/tools/video-probe-c406.mjs` and `c-round-407/tools/video-extra-c407.mjs`. Pass: the dock frame follows play and a stopped seek; caption and box as in round 407 |
| R423-LEAF-ACTIONS | SYS-R385 actions context (404/405) | As C round 404 rows 4–5: `c-round-404/tools/leaf.cjs`, with its screenshot folder (`SH`, hard-coded to `c-round-404/shots`) changed to `c-round-423/shots`. Pass: every step's state as in `c-round-404`'s output (add, Add button, Undo, move, marker add/prev/next, master mute/volume, loop brace); 0 page errors |
| R423-PEAKS-FALLBACK **[SA-3]** | PERF-14c-i (403) | `b-round-402/probe/peaks-fallback.cjs` in normal, none and failing modes. Pass: the failing mode equals C round 403's baseline (`c-round-403/fallback-failing-*.json`); `b-round-403/probe/minzoom200.cjs` at min zoom as round 403 |
| R423-SCALE **[SA-2]** | PERF-14a/14b (398–402) | `b-round-397/probe/clips200.cjs`, `b-round-398/probe/frames200.cjs` and `b-round-401/probe/pin-blur-group.cjs`. Pass: as `c-round-402.md` rows 4 (VIRT-FRAMES) and 5 (PIN-BLUR-GROUP); `clips200.cjs` is the setup. Since round 402 the lane count attribute and the mounted clip count differ by design, so round 398's COUNT-BROWSER equality is not an oracle |
| R423-SCALE-EXPORT **[SA-1] [SA-4]** | REG-14BII-EXPORT-UNMOUNTED | Add two clips with Enter (the second lies outside the lane page window at default zoom), export WAV (as `c-round-386/export-wav.mjs`). Pass: 24-bit / 48 kHz, decoded duration ≈ 2 × 101.352 s, not silent across both halves (RMS of each half > 0) |
| R423-SYNTH | PERF-13d (397) | As C round 397 BUF-PLAY / BUF-STATUS: `c-round-397/rows.cjs`, with its `out.json` argument under `c-round-423/`. Pass: `Demo collection ready`, Play is audible (meter moves), as round 397 |
| R423-PREVIEW-STREAM | PERF-13c-i / 13c-ii (393–396) | As C rounds 393 and 395: `c-round-393/probe.mjs` (S1 stream, S2 stop, S4 seek, S6/S7 preview vs transport) and `c-round-395/rows.mjs` (R1 stall fallback, R1b seek during stall, R2 external pause, R6 stop). Round 396's purchased half (`c-round-396/rows.mjs`) runs with its own stubs. Pass: as those rows |
| R423-DECODE-STATUS | PERF-13b-ii (391/392) | As C round 392 B1, B2, B3, B7, B8, B9: `c-round-392/probe.mjs` and `nb.mjs`. Pass: honest loading text, never a stale `Loading “X”…`, a failed clip is reported and not silently dropped |
| R423-JOURNEY **[SA-4]** | L54 | As R389-JOURNEY (`c-round-389/tools/journey.cjs`; mock API): product page → "Try it in the Studio" → `/studio-lab` titled "CZABA Studio" → Enter adds → Space ≥ 1 s → Stop → Export WAV non-silent → "View in store" opens a new tab with `opener` null. Screenshot per step |

Not re-checked here: rounds 401, 416 and 420 (RETRO; no app code), and rounds 414, 415 and 417 except their browser halves above (test-only; the gate's full suite covers them).

## 4. C: perf, perf lib, smoke, auth and scope
- **RR-PERF:** `npm run test:perf` **alone** (L38), first after the start claims. 5 spec files; `perf/` last changed at `cc5cbc6` [K7]. PASS: rc 0, every spec passes, every asserted budget row passes, `complete` true, 0 aborts, 0 page errors. A failing budget on a valid isolated run is a finding: Medium for fader, drag or playback budgets, Low otherwise. Save `latest*.json` under `c-round-423/perf-results/`.
- **PERF-LIB** (GATE304-M1 is still open [K12]): from `store/`, `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs`. All pass; report the counts. Never during RR-PERF.
- **RG-SMOKE:** `npm run test:e2e:smoke` in `store/` [K17], alone.
- **G423-AUTH [SA-5]:** as `c-round-389/tools/auth-smoke.mjs`, both viewports: `/studio-lab` anonymous opens the workspace with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token?product=middle-east&file=a.mp3` with no header → 401 and no token in the body. Fake Bearer → BLOCKED (backend unavailable in cloud), listed under `blocked`; it does not make `browserVerified` false. SRW-21 stays `deferred_user`.
- **G423-SCOPE** (start and end): K1 `875ff37…`, K2 total 0, K3 1,321 rc 0, K4 rc 0, and the claims output equals `b-round-422/claims-423-planning-output.txt` (K12 by "every id located"; K15 is `L58 OK`, no sketch). Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`.

## 5. What could break, and where to look first
- Lane virtualization (402) and the actions context (404–409) sit under every lane gesture: watch R423-LANE, R423-LEAF-ACTIONS and R423-SCALE-EXPORT for a lost clip, a stale readout or a short export.
- The preview controller (418, 421) and streaming (393–396) share the library: a preview that keeps sounding after Play, Stop or a collection change is a Medium finding.
- The held-Enter guards (422) must not change a single press or a mouse click (R423-HELD-ENTER smoke).

## 6. Report
- `c-round-423.json`: `taskStatus` PASS, FAIL or PARTIAL; `passed`, `failed`, `blocked`, `gate`, `notRun`, `bugs` (each with `severity`, `origin`, repro and evidence path), `browserVerified`, `realVerified`, and **all L57 fields** (`manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` — `null` with the reason "regression round, no sketch" —, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`). Run `python3 -I tools/l57-check.py c-round-423.json c-round-423/l57-check.txt` before hand-off.
- `c-round-423.md`: one table, one line per row, with its evidence file.
- PARTIAL is allowed only for a real time-limit stop, with `progress.json` naming the rows left and `stopSignal`. It is not done.

## 7. Outcome, fixed in advance (D-29z1477)
| C result | B at the 423 → 424 planning |
|---|---|
| Every row has an allowed result and there is no Medium+ finding (Lows → `deferred_low_polish`) | Round 424 = REGRESSION part 2 on the same baseline: the round-390 template (`tasks/round-390.md`: everything finished up to round 390, its carried and parked rows). When part 2 closes, B updates `regression-last.json`; then SYS-2 stage 2a, unless Saba has answered `AGREE-STEM-LANES.md` (then STEM-LANES first) |
| A Critical or High finding | Round 424 = its bounded fix-up; part 2 follows |
| A cloud-reproducible Medium finding | Round 424 = its fix-up (≤ 3 related bugs), unless root-only or manual-only; part 2 follows |
| PARTIAL (time limit) | Round 424 continues part 1 from `progress.json` before part 2 |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that half |
