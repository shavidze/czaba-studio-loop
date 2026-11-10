# Round 425: REGRESSION round, part 2 (REGRESSION-2026-11-10). C-only browser sweep of everything finished up to round 390, the carries of the last regression, and a lane re-check on the new baseline. A changes nothing

**Planned by:** B, at the round 424 → 425 planning, 2026-11-10 (`b-round-424.md`). The advisor was used after orientation and before close. The round-424 task is archived as `tasks/round-424.md` [K11].
**Decisions:** D-29z1483 … D-29z1486 (`backlog.json` v401, `decisions_log_b`, `regression_rounds` id `REGRESSION-2026-11-10`) [K13, K14].

## Read first
- **`lessons.md` in full** [K16]. Directly relevant:
  - L6: every scope addition is a named row or "carried";
  - L25: soft-disabled clicks;
  - L29, L56: claims;
  - L38: perf runs alone; warm `/studio-lab` in a browser before a timed probe;
  - L48: playback-start lead; wait for `Demo collection ready`;
  - L54: journey row;
  - L57: all harness fields;
  - L59: do not end early; heaviest first; `progress.json`;
  - L60: destructive commands stay in `c-round-425/`.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md`: the speed rules and "Regression round every 3 days", the 2026-10-23 bug gate, the cloud-runner section.
- **The templates, by reference** (all exist [K10]):
  - `tasks/round-389.md` §3 (rounds 343–388) with C's run `c-round-389.md` / `c-round-389/tools/`;
  - `tasks/round-390.md` §2–§8 (rounds up to 342, parked rows) with C's run `c-round-390.md` / `c-round-390/{tools,t258,t301,out,price,wk}`.
  - **Where this task differs from rounds 389 and 390, this task wins.**
- **Part 1** (rounds 391–422) is done: `tasks/round-423.md`, `c-round-423.md` (21 rows PASS; its RR-PERF failure was fixed and re-run in round 424, `c-round-424.md`).
- **Claims:** `bash b-round-424/claims-425.sh` (`ROOT=` and `LOOP=` can be overridden). Planning output: `b-round-424/claims-425-planning-output.txt` (stderr `claims-425-planning.err`, empty). Run it at G425-SCOPE start and end. The output must equal the planning output, except:
  - K12 is compared by "every id located, none `NOT-FOUND`" (the optimizer may archive a closed id between B and C, L56);
  - K18 (ports) may differ by the mock you start.

## Baseline: HEAD `f6c76f4`, clean tree
- `gates/gate-round-424.json` is `published`, `commit` `f6c76f43ce0c…` on both remotes [K1]. Its `head` field (`875ff37`) is the pre-commit HEAD; do not use it. `context/head-sha.txt` is stale as well.
- At planning:
  - `git rev-parse HEAD` = `f6c76f43ce0c…` [K1];
  - status empty [K2];
  - tracked tree frozen in `b-round-424/r425-tree-sha256.txt` (1,322 entries, rc 0) [K3];
  - protected files 11/11 OK (`b-round-318/protected-sha256.txt`) [K4].
- If root publishes in between and K1 differs, a root-only commit that leaves `git diff f6c76f4 HEAD -- app perf` empty is accepted with a note (L29). Anything else is "STOP — baseline differs".

## 0. Why this round (D-29z1483, D-29z1484)
- **Round 424 passed and is published** (D-29z1483): C PASS, 9 rows, 0 bugs, `browserVerified` true [K6]; gate 424 published `f6c76f4` (verify 264 files / 3,957 tests). C-R423-01 is closed.
- **The outcome was fixed in advance** (task 424 §6, PASS row): round 425 = REGRESSION-2026-11-10 part 2 on the new baseline.
- **Part 2 = everything finished up to round 390.** That is round 389's rows (343–388) **and** round 390's rows (≤ 342). They run in one round. `metrics/rounds.csv` shows 1.03 h + 0.34 h for C rounds 389 + 390, but rounds 341 + 342 ran the same round-340 template in 3.16 h + 0.44 h. Expect up to about 4.6 h. A time-limit stop is PARTIAL and resumes (§10).
- `regression-last.json` = 2026-11-07 / 390 [K5]. It is updated only when part 2 closes.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`. STEM-LANES still waits for Saba [K19].

## 1. A: no code or doc change
- From `store/`: `git rev-parse HEAD` must be `f6c76f4…` and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-425.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer: there is no change.
- Write `a-round-425.md`: the start HEAD, the status output, and "no change by design (REGRESSION round part 2, D-29z1484)".
- **Forbidden:**
  - `global_forbidden_files` / `global_forbidden_actions`;
  - the protected files;
  - commit, push, stash, checkout, deploy;
  - dev-server restarts.

## 2. C: scope, method and budget (round 390 §2 applies, with these changes)
- **G425-SCOPE** at start and at end:
  - K1 `f6c76f4…`;
  - K2 total 0;
  - K3 1,322 rc 0;
  - K4 rc 0;
  - the claims output equals the planning output (see "Read first"). K15 is `L58 OK` (no sketch).

  Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **Start the mock API first.** Run `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199. At planning, :5199 answered `000` [K18]. Record its PID in `c-round-425/mock.pid` and stop only that PID. Mock data proves the client path only.
- **Tools, in this order of priority** [K10]. These copies are already adapted to the current UI, which folds INFO-C390-HARNESS-DRIFT (D-29z1485):
  1. `c-round-390/tools/`, `c-round-390/t258/tools/`, `c-round-390/t301/` and `c-round-390/wk/`, for the round-390 rows;
  2. `c-round-389/tools/`, for the round-389 rows;
  3. then the older folders those rounds name.

  Copy what you use into `c-round-425/` (same folder depth when a script imports a relative path) and redirect every output sink there (L60). Your copies become the next regression's base: keep them.
- **Changed UI facts since round 390.** Adapt older scripts to these. Each adaptation is "lookup, not deviation"; name the fact.
  - A held Enter acts once on the 11 guarded transport buttons; Fit stays unguarded [K9 transport-repeat-guard 11]. A script that holds Enter expects one action.
  - Lanes virtualize clips: count clips from the lane's `data-clip-count`, never from DOM clip elements [K9 lane-data-clip-count 1].
  - The demo ships precomputed peaks [K9 demo-peaksUrl 1]: the library waveform shows dimmed before the MP3 decodes.
  - URL-backed library previews stream through a media element [K9 preview-client present]. Preview stops the transport (round 393 S7).
  - Round 424 changed only which lane component subscribes to the drag stores. There is no visible change.
- **B pre-rulings, binding here (D-29z1486):**
  - **R389-DECODE-CACHE, the round-386 BROWSER-L2-OK half** ("a preview started during a decode plays once the decode ends"): the preview may now sound **before** the decode ends, because it streams. That is the round-393 S1 contract, not a failure.
    - Pass: the preview is audible, starts at most once (no double start) and stops on Play.
    - A **Medium** finding: a preview that never sounds, or that keeps sounding after Play or Stop.
    - This is the same family as INFO-C423-DECODE-ORACLE-DRIFT [K12]. For the decode-status replay, use `c-round-423/r392/b7-replay2.mjs`, not the round-392 B1/B7/B8/B9/nb rows.
  - **The round-390 rulings stay** (task 390 §2):
    - R340-HINT;
    - the void "press L" sub-check;
    - FONT-PIXEL retired;
    - R342-POSCTL is record only;
    - RP-NOBPM-RULER and C-R341-01 are not re-run.
- **Single dev server.** Every dev row runs on :5173. Production rows (the FONTS production half, R389-DECODE-CACHE HEAP at 1440, R389-STEM-CACHE if it needs a build) use a scratch production server on its own port, stopped after. Never start a second dev server that shares the store's `node_modules/.vite` (L38).
- **Order** (L59: heaviest first; after a time-limit stop, resume from `c-round-425/progress.json`):
  1. G425-SCOPE start, claims, mock start.
  2. PERF-LIB, alone.
  3. §3 (new baseline and carried rows).
  4. §4 (round-389 rows).
  5. §5 (round-390 rows), with R301-PRICE last among the store rows.
  6. §6 (parked rows).
  7. RG-SMOKE, alone; then G425-AUTH.
  8. G425-SCOPE end; stop your PIDs.

  Write `c-round-425.json`, `c-round-425.md` and `progress.json` after every row.
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only. The known ones:
  - the cold-start Sounds-listbox timeout;
  - the s186 gift-card crash when the mock lacks that product;
  - an overlapped job.

  Keep the log. Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Console noise known in the cloud:**
  - `Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`;
  - the known Low C-R341-02 (font preload "not used" after client navigation).

  Record any other page error with its row.
- **Reference / Ableton / product-designer:** regression round. There is no new behaviour and no new parity claim. C judges the CZABA requirement only; Ableton conformance does not apply.
- **Both viewports** (1440×900 and 1280×720) on every row unless the row says otherwise.

## 3. C: new-baseline and carried rows (D-29z1484, D-29z1485)
| Row | Why | Action and expected |
|---|---|---|
| R425-LANE-REBASE **[SA-P2-LANE]** | `ArrangementLane` changed in round 424, after part 1 ran [K8: 3 paths]. Round 424 did not re-run virtualization or lane peaks | Copy `c-round-423/scale/{clips200,frames200,pin-blur-group}.cjs` and `c-round-423/peaks/{peaks-probe-410,peaks-before-ready-413}.mjs`, and run them as R423-SCALE and R423-PEAKS did (`c-round-423.md`). **Oracle:** the c-round-423 outputs (`scale/frames-*.json`, `scale/pin-*.json`, `peaks/{real,404,p410}-*.json`) [K10]. Pass: 0 gap frames, the held clip stays mounted, pin-blur A/B as in round 423, and peaks equal (timestamps excepted) |
| R425-VIDEO-SOUND **[SA-P2-CARRY]** | INFO-C390-VIDEO-SNAP | As R390-VIDEO-SOUND (task 390 §3; `c-round-390/tools/vsound.cjs`). **Read the clip's real start after release** (grid-snapped; the script reads `data-clip-start` [K9 clip-data-start 1]), and write the windows against it. Pass: before the start, the level is at the noise floor; from 0.3 s after the start it is ≥ 20 dB above that floor; after Undo the sound starts at the original start; `pageErrors` []. Silence inside the moved clip on a valid run is **Medium** |
| R425-WAV-3CLIP-LEN | carried rule of task 390 §3 | As R390-WAV-3CLIP-LEN (`c-round-390/tools/exportlen.mjs`): RIFF/WAVE, 24-bit, 48 kHz, stereo; frames / 48000 = the dialog's range end ±1 frame; non-silent; 0 NaN. At 1440, compare the sha256 with `c-round-389/export-det.json`; a difference is reported for B to rule, not a FAIL by itself |
| R425-RVM-FRESH **[SA-P2-CARRY]** | INFO-C390-RV-M-HYDRATION-GLITCH | `c-round-390/tools/mepage.cjs` (it runs 4 fresh-context loads at 1440; add a 1280×720 copy): 4 loads of `/studio/middle-east` per viewport, **each in a fresh browser context**, with no other probe running. Pass: no "Invalid hook call", no hydration error, body not empty, "Sign in required" shown. A reproduction on a valid isolated load is a finding with its log; C rates the severity by impact (an empty auth-guard page is Medium) |
| NO-SHIFT-203 | carry | **Retired as a tree-vs-ref row (D-29z1485).** Its reference tree (pre-203) no longer exists. RS-4B's sub-check in §5 covers only part of its intent (`/` and a product page). Record "retired D-29z1485" under `carried` |
| R425-NOSHIFT-BOXES (record) | rest of NO-SHIFT-203 | Element boxes on a mock product page, the AuthModal before and after an empty submit, and `/store`, at both viewports. Save them as `c-round-425/noshift/*.json`. They become the next regression's oracle; record only, no pass/fail this round |

## 4. C: round-389 rows (items finished in rounds 343–388) [SA-P2-389]
Run every row of `tasks/round-389.md` §3 as written there, using the §2 facts and rulings above and C's round-389 scripts (`c-round-389/tools/`). The rows:
- R389-SCHED-FAIL, R389-RESYNC-METER, R389-EDIT-THROW;
- R389-DECODE-CACHE: with the D-29z1486 ruling. HEAP-RETAINERS-PROD runs at 1440 only, on a production build. **Two pins were taken before rounds 391–422 changed decode, preview and retention, and B has not re-run them** (L58):
  - HEAP's live counts `[2,5,16,16,16,16,16]`;
  - EVICT's "one `stop()` on the evicted preview".

  They are `record — not run on this tree by B: pre-391 pins`. The asserted part of EVICT stays: Add plays live, and Undo removes it. B rules on any difference at the next planning;
- R389-WAV-STREAM;
- R389-LEAVES, R389-STATUS, R389-LAZY;
- R389-STEM-CACHE, R389-RANGE-BG, R389-SELECT-TRANSPORT, R389-PLAY-STORE;
- R389-VIDEO-DRAG: its "video sound after the move" sub-check is R425-VIDEO-SOUND;
- R389-FADERS-ICONS, R389-GROUP-MOVE.

**R389-JOURNEY and R340-JOURNEY run once,** as the R340-JOURNEY row in §5. Record "covered by R340-JOURNEY".

**Escape clause (D-29z1484).** These rows last passed at `11ca746`, before rounds 391–424:
- a difference from a round-389 oracle that C can attribute to a named round 391–424 (its task or C report) goes to `lookups` with that round, for B to rule;
- an unattributed difference on a valid run is a finding.

## 5. C: round-390 rows (items finished up to round 342) [SA-P2-390]
Run `tasks/round-390.md` §4, §5 and §6 as written there, with the §2 changes above. Where C round 390 already adapted a script, use that copy. The rows:
- **§4:** the round 340 §4d rows (R340-CROSS-LANE … R340-JOURNEY).
  - **R340-JOURNEY is one continuous flow with the WAV export and screenshots per step** (`c-round-390/tools/journey-full.cjs`).
- **§5:** the round 340 §4c / round-301 rows (R301-MASTER … R301-MENU).
  - R301-JOURNEY is covered by R340-JOURNEY.
  - **R301-PRICE runs last among the store rows,** with the mock swap and the restart (health 200) of task 390 §5.
- **§6:** §4b, §3 (RG-01 … RG-24, RG-T1 … RG-T4B; RG-03 at 1440 only), §4 and §4.S, including RS-4B.
  - **Oracle per row:**
    - the evidence path that row cites in `c-round-390.md` (under `c-round-390/out/`, `t258/out/`, `t301/` or `t301x/`);
    - or the older oracle round 390 compared with (rounds 341, 338, 301).
  - Expected: 0 normalised diff lines, except diffs explained by a §2 fact or attributed to a named round 391–424 (as the §4 escape clause; the attribution goes to `lookups`).
  - **HARNESS-DRIFT** (D-29z1485): RG-06 (Ctrl+drag marquee), RG-18 (`STEM=demo-stem-pad`), the c250-s9 split (series max) and the c218-mp3 add (waits for ready) run from the `c-round-390` copies. Report each by name in `lookups`.

## 6. C: parked rows (record only unless stated)
As task 390 §7:
- **R425-RP301**, oracle `c-round-342/out/rp301.json`. A difference is a finding only if it changes behaviour.
- **R425-RP-BUILT**, oracle `c-round-342/out/rp-*.json`.
- **R425-POSCTL**, oracle `c-round-342/out/posctl.json`. Record, including `valid`.
- **R425-ESC-DRAG**: a signal, not a finding (ESCAPE-CANCEL-GESTURE / C-R85-L1 waits for a Live source and Saba).
- **SA-19** (RETRO 336 screen candidates): `awaiting_user`; carried, not run.

## 7. C: perf lib, smoke, auth and gate rows
- **RR-PERF [SA-P2-PERF]:** **carried, not run.** The published `f6c76f4` code is byte-equal to the sketch C verified in round 424 [K8: 2 equal; 3 paths; perf-diff 0]. C round 424 ran all 5 specs and passed (`c-round-424/perf-results/`, 5 files [K6]). List it under `carried` as "C round 424, code equal to f6c76f4 (b-round-424/rrperf-carry-proof.txt)". Do not run `npm run test:perf`.
- **PERF-LIB:** GATE304-M1 is still open [K12]. From `store/`, run `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs`. All must pass; report the counts. Never during a browser timing row.
- **RG-SMOKE:** `npm run test:e2e:smoke` in `store/`, alone [K17].
- **G425-AUTH:** `c-round-390/tools/g390-auth.cjs` with the mock running, at both viewports:
  - `/studio-lab` anonymous opens the workspace with the demo badge, and `auth_user` is null;
  - `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`;
  - `/api/studio-token?product=middle-east&file=mix.wav` (the script's URL): no header → 401; bare `/api/studio-token` → 400; no token in any body [K20: B's baseline run gave 401 and 400].

  The fake Bearer is BLOCKED (backend unavailable in cloud) unless the mock answers 403. List it under `blocked`; it does not make `browserVerified` false. SRW-21 stays `deferred_user`.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`, RR-OSS.

## 8. What could break, and where to look first
- **The lane change of round 424** sits under every lane row. R425-LANE-REBASE, R389-GROUP-MOVE, R340-CROSS-LANE and R389-VIDEO-DRAG are the first places a missing ghost, a stale clip or a lost peak would show.
- **Streaming previews (393+)** change what older decode rows see. Apply the D-29z1486 ruling before calling anything a regression.
- **The PRICE mock swap** can leave :5199 on the wrong data. It runs last among the store rows, and the standard mock is restarted (health 200) before G425-AUTH.
- **Old output sinks.** Redirect every sink into `c-round-425/` first (L60).

## 9. Report
- **`c-round-425.json`:**
  - `taskStatus`: PASS, FAIL or PARTIAL;
  - `passed`, `failed`, `inconclusive`, `blocked`, `carried`, `gate`, `notRun`;
  - `bugs`, each with id `C-R425-NN`, `severity`, `origin`, item, repro, evidence path, and "regression yes/no" with the round of its last pass;
  - `observations`, `invalidRuns`, `lookups`;
  - `browserVerified`, `realVerified`, `stopSignal`, `progressFile`;
  - **all L57 fields**: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`. Write `null` **with a reason** where a field does not apply (for example, "regression round, no sketch").
- Run `python3 -I tools/l57-check.py c-round-425.json c-round-425/l57-check.txt` before hand-off.
- **`c-round-425.md`:** one table, one line per row, with its evidence file.
- **PARTIAL** is allowed only for a real time-limit stop, with `progress.json` naming the rows left (L59). It is not done.

## 10. Outcome, fixed in advance (D-29z1484)
| C result | B at the 425 → 426 planning |
|---|---|
| Every row has an allowed result and there is no Medium+ finding (Lows → `deferred_low_polish`) | `regression-last.json` = `{"date": <C's completion date>, "round": 425}`, and REGRESSION-2026-11-10 closes. Round 426 = **STEM-LANES** if Saba has answered `AGREE-STEM-LANES.md`; otherwise **SYS-2 stage 2a**. Then 2b, SYS-1 and SYS-3. RETRO 435 stays on its schedule |
| A Critical or High finding | Round 426 = its bounded fix-up. `regression-last.json` is updated only if every row ran |
| A cloud-reproducible Medium finding | Round 426 = its fix-up (≤ 3 related bugs), unless it is root-only or manual-only; then the queue resumes |
| PARTIAL (time limit) | Round 426 continues part 2 from `progress.json`; `regression-last.json` waits |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that half |
