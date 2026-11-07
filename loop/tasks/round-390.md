# Round 390: REGRESSION round, part 2 (REGRESSION-2026-11-08). C-only browser sweep of everything finished up to round 342 (the round-340 template), plus two rows carried from part 1. A changes nothing

**Planned by:** B, at the round 389 → 390 planning, 2026-11-07 (`b-round-389.md`).
**Decisions:** D-29z1316 … D-29z1321 (`backlog.json` v357, `decisions_log_b`, `regression_rounds` id `REGRESSION-2026-11-08`).

**Read first:**
- `lessons.md` in full. Directly relevant:
  - L6: every scope addition is a named row or "carried";
  - L25: soft-disabled clicks;
  - L29 and L56: claims;
  - L38: perf runs alone; warm up before a timed probe;
  - L48: wait for `Demo collection ready`;
  - L54: journey row;
  - L57: harness fields;
  - L59: do not end early; heaviest first; `progress.json`;
  - L60: destructive commands stay in `c-round-390/`.
- The rules: `docs/technical/studio-real-workspace/agent-workflow.md`, especially the speed rules and "Regression round every 3 days", the 2026-10-23 bug gate and the cloud-runner section.
- **The template, by reference:** `tasks/round-340.md` §2–§9. Rounds 341 and 342 ran it in practice: see `tasks/round-341.md`, `tasks/round-342.md`, C's reports `c-round-341.md` / `c-round-342.md`, and their `tools/` and `out/`. **Where this task differs from rounds 340–342, this task wins.**
- Part 1 (rounds 343–388) is done: `tasks/round-389.md` (exact copy), `c-round-389.md`, `c-round-389.json`. B's reasoning is in `b-round-389.md`.
- Every fact below about current code or evidence carries a `[K#]` tag from `b-round-389/claims-390.sh` (planning output `b-round-389/claims-390-planning-output.txt`). Run it from the loop root at SOURCE-SCOPE start and end. Only K6 may differ (the mock you start).

## Baseline: HEAD `11ca746`, clean tree (unchanged since round 389)
- **Gates** [K1]:
  - `gates/gate-round-388.json` is `published`, with `commit` `11ca746…` on both remotes. Its `head` field `5312260` is the pre-commit HEAD; do not use it.
  - `gates/gate-round-389.json` is `skipped` (no source change).
  - So the baseline stays gate 388's commit. `context/head-sha.txt` may be stale.
- **At planning:**
  - `git rev-parse --short HEAD` = `11ca746` and `git status --short --untracked-files=all` is empty [K2];
  - the protected files are 11/11 OK [K3];
  - the round-389 frozen tree `b-round-388/r389-tree-sha256.txt` is reused because HEAD is the same: 1284 entries, 0 failures [K4]. From `store/`, `sha256sum -c` on it must report 0 failures at start and at end.

## 0. Why this round (D-29z1316, D-29z1317)
- **Part 1 passed.** `c-round-389.json`: PASS, 20 rows, 0 failed, `browserVerified`/`realVerified` true, 0 bugs [K7]. Gate 389 was skipped, so there is nothing to publish.
- **The outcome was fixed in advance.** D-29z1315: C PASS → round 390 = part 2 on `11ca746`.
- `regression-last.json` is still 2026-11-05 / 342 [K5]. It is updated only when part 2 closes.
- No Critical, High or cloud-reproducible Medium is open. The open Mediums are root-only, manual-only or awaiting Saba.

## 1. A: no code or doc change
- **Baseline check,** from `store/`:
  - `git rev-parse HEAD` must be `11ca746…`;
  - `git status --short --untracked-files=all` must be empty.

  If either differs, write "STOP — baseline differs" at the top of `a-round-390.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer: there is no change.
- Write `a-round-390.md` with:
  - the start HEAD;
  - the status output;
  - "no change by design (REGRESSION round part 2, D-29z1317)".
- **Forbidden:**
  - `global_forbidden_files` / `global_forbidden_actions`;
  - the protected files;
  - commit, push, stash, checkout, deploy;
  - dev-server restarts.

## 2. C: scope, method and budget (round 340 §2 applies, with these changes)
- **SOURCE-SCOPE** at start and at end:
  - HEAD `11ca746`, status empty;
  - K3 11 OK;
  - K4 0 failures.

  Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **Start the mock API first.** Round 340 went BLOCKED because the mock was not started.
  - Run `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199. At planning, :5199 returned 000 [K6].
  - Record its PID in `c-round-390/mock.pid`, and stop only that PID at the end.
  - Mock data proves the client path only, never backend behaviour.
- **Tools.** Reuse them in this order of priority [K10]:
  1. `c-round-341/tools/`, including `run-batch1.sh` … `run-batch4.sh`;
  2. `c-round-342/tools/`, including `rp/`;
  3. `c-round-301/tools/` and `c-round-301/t258/` for the older bundles;
  4. `c-round-389/tools/` for the journey and flow scripts.

  Copy what you use into `c-round-390/tools/` and redirect every output sink into `c-round-390/`. L60: a script that writes into an older round folder is edited to write here first; that edit is a lookup.
- **Changed UI facts since round 342.** Adapt older scripts to these. Each adaptation is "lookup, not deviation"; name the fact.
  - A graph-build failure stops playback with the `scheduleFailed` status, and the meters fall to −∞ (rounds 386–388).
  - Play is refused while a needed source is still decoding (round 382). A script that presses Space right after an add waits for `Demo collection ready` and for the refusal to clear (L48).
  - Decoded audio of unpinned sources can be evicted (rounds 382–384). `AudioBuffer` identity is not a signal; audible output is.
  - There is no framer page transition on `/studio*` (round 370).
  - From C's round-389 lookups (`c-round-389.json` `lookups`):
    - the library option regex `/Night Pulse · Pulse/` became `/Pulse/`;
    - the narrow-state status text no longer repeats the Tempo sentence;
    - `cache.mjs` needs the `/studio-lab` URL as base;
    - `master.mjs`'s :5180 second server is removed.
  - The round-340 §2 facts still hold: the name "CZABA Studio", the one-time first-add hint, the self-hosted fonts and the drag previews.
- **B rulings already made, binding here (do not re-open):**
  - **R340-HINT (D-29z1062):** the hint shows once per page load and is back after a reload. Not a finding.
  - **R340-OVERVIEW-METER "press L" sub-check: VOID (D-29z1068).** There is no bare `L` key. The 23-sample overview invariant is the row.
  - **R340-FONTS FONT-PIXEL: retired (D-29z1068).**
    - The baseline is `c-round-341/out/fonts/` [K10]; compare with it.
    - The woff2 files are served from `/assets/`, not `/s/`.
    - FONT-NET and FONT-PRELOAD stay.
    - The production-build half runs on a scratch production server (D-29z1063), never on a second dev server.
  - **RR-OSS full licence suite:** a gate row.
  - **R342-POSCTL:** the oracle is `c-round-342/out/posctl.json` [K10]. Record only; it is not a decision row.
  - **RP-NOBPM-RULER and C-R341-01 (= C-R318-06):** done in round 341; not re-run.
- **Single dev server (D-29z1057).** Every dev row runs on :5173. For production rows (the FONTS production half, and any export-hash row that the template runs on a build), serve a production build on its own port and stop it after.
- **Not re-run, carried with evidence.** HEAD is the same as in round 389, where these passed:
  - RR-PERF: `c-round-389/perf-results/`, 4 files; both `interact.harness.drag-lane-live` and `drag-group-live` are present [K8];
  - PERF-LIB: 3 files / 54 tests.

  RG-SMOKE is **run** again (2 tests, about 1 minute), because the speed rule's regression round names it: `npm run test:e2e:smoke` in `store/`, alone, just before G390-AUTH.

  List the carried rows under `carried` with "round 389, same HEAD 11ca746". Do not run `npm run test:perf` this round.
- **Order.** After a time-limit stop, resume from `c-round-390/progress.json`. Inside each block, run the heaviest evidence first (L59).
  1. SOURCE-SCOPE start, claims, mock start;
  2. §3 carried rows (R390-VIDEO-SOUND, R390-WAV-3CLIP-LEN);
  3. §4 = round 340 §4d rows (rounds 302–339);
  4. §5 = round 340 §4c (round 301's rows for 259–300), with R301-PRICE **last** among the store rows;
  5. §6 = round 340 §4b, then §3 (RG-01 … RG-24, RG-T1 … RG-T4B), then §4 and §4.S;
  6. §7 parked rows;
  7. RG-SMOKE (alone), then G390-AUTH;
  8. SOURCE-SCOPE end, then stop your PIDs.

  **Write `c-round-390.json`, `c-round-390.md` and `progress.json` after every row.**
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only. The known ones are the cold-start Sounds-listbox timeout and the s186 gift-card crash when the mock lacks that product. Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Console noise known in the cloud:**
  - `Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`;
  - the known Low C-R341-02: a font preload "not used" warning after client navigation from a product page.

  Record any other page error with its row.
- **Ableton:** no new behaviour and no new parity claim. C judges the CZABA requirement only.
- **Both viewports** (1440×900 and 1280×720) on every row unless the row says otherwise.

## 3. C: two rows carried from part 1 (L6, D-29z1318)

### R390-VIDEO-SOUND [SA-12 rest]
**Why carried.** R389-VIDEO-DRAG required "video sound plays after the move". C reported that it was not re-asserted (`c-round-389.md`, open question 2).

**Tools** [K10]: build from `c-round-389/tools/flow.cjs` (the move) and the level sampler of `c-round-341/tools/pk-video-sound.cjs` (with its generated 440 Hz webm).

**Steps:**
1. Import the webm and wait until the clip's sound is ready.
2. Drag the video clip so that it starts at ≈ 2.25 s (as in round 389), and release.
3. Play from 0 and sample the output level. No other clip may sound: use a project with only the video clip, or mute the other lanes.
4. Undo the move and play from 0 again.

**Expected:**
- **Before** the new start (0.5–1.8 s), the level is at the noise floor.
- **Inside** the moved clip (from 0.3 s after its start), the level is ≥ 20 dB above that floor.
- After Undo, the sound starts at the original start.
- `pageErrors` is [].

Silence inside the moved clip on a valid run is a **Medium** finding (audio lost after an edit).

### R390-WAV-3CLIP-LEN [SA-4 rest]
**Why carried.** R389-WAV-STREAM parsed length and format on the 2-clip export. On the 3-clip project it proved only sha determinism (`c-round-389/export-det.json`: 3 clips, equal [K9]).

**Steps,** at both viewports:
1. Rebuild the 3-clip project as `c-round-389/tools/export-det.mjs` does.
2. Read the dialog's range end. Round 389 saw 00:00.000–00:48.000.
3. Export the WAV and parse its header.

**Expected:**
- RIFF/WAVE, 24-bit, 48 kHz, stereo;
- frames / 48000 = the dialog's range end, ±1 frame;
- non-silent: ≥ 1 % non-zero samples and peak > 0;
- 0 NaN.

At 1440, also compare the sha256 with round 389's 3-clip sha in `export-det.json`. Equal is expected. A difference is reported for B to rule; it is not a FAIL by itself.

## 4. C: round 340 §4d (items finished in rounds 302–339)
Run every row of `tasks/round-340.md` §4d as written there, with:
- the §2 rulings and changed facts above;
- the scripts round 341 used for them (`c-round-341/tools/`);
- for the WORKER rows, `c-round-311/run-wk.sh`, as `tasks/round-342.md` rows 2–3 describe.

**The rows:**
- R340-CROSS-LANE, R340-GROUP-MOVE;
- R340-WAVEFORM, R340-DETAIL-TEXT;
- R340-OVERVIEW-METER, without the void sub-check;
- R340-SHOWN-READERS, R340-PROJECT-END, R340-FADE-STATUS, R340-DRAG-A;
- R340-SELECTION, R340-RANGE;
- R340-FONTS: FONT-NET and FONT-PRELOAD on dev; the preloads, `/assets/` and the pixels vs the round-341 baseline on a scratch production server;
- R340-PEAKS;
- R340-WORKER-R2: WK-BROWSER-PROXY, WK-GUARD-PROXY, WK-HEAD-CONTROL. BLOCKED only if the proxy cannot start, with the log;
- R340-RESCHEDULE: CONT-1, CONT-30, ENDED, NO-CHANGE;
- R340-PERF3D;
- R340-NAME (mock);
- R340-HINT;
- R340-JOURNEY.

**R340-JOURNEY is one continuous flow, export included.** Round 389 left the export out of its journey. Take a screenshot at each step:
1. Product page → "Try it in the Studio".
2. `/studio-lab?preview=<handle>`, titled "CZABA Studio".
3. Enter adds the source (the hint shows once).
4. Space plays ≥ 1 s (the clock advances), then Stop.
5. **Export WAV in the same page:** non-silent, and its length equals the dialog's range end ±1 frame.
6. Right-click → "View in store" opens a new tab with `opener` null.

Start from `c-round-389/tools/journey.cjs` and splice in the export step of `c-round-389/tools/export-wav.mjs` [K10].

## 5. C: round 340 §4c (round 301's rows for items finished in rounds 259–300)
Run `tasks/round-301.md` §4c as round 340 §4 states. The rows:
- R301-MASTER, R301-CONTRACTS;
- R301-BG-RANGE, R301-HIDDEN-GRID-BG;
- R301-ALTGR;
- R301-TAPER: exports at 1440 only;
- R301-REL-SNAP, R301-STATUS-LIFETIME, R301-DISABLED;
- R301-WORKER: the hash rule as written (one re-export; a reproducible difference is Medium);
- R301-PERF3: compare with `c-round-284/shots`; the fallback rule applies;
- R301-NAMES, R301-NARROW, R301-LOAF;
- R301-LINK, R301-MENU;
- R301-JOURNEY: covered by R340-JOURNEY above. Record "covered" and do not run it twice.

**R301-PRICE runs last among the store rows,** by the procedure of `tasks/round-342.md` row 10:
1. Stop the standard mock by its PID.
2. Run `mock-c288.mjs`, the c288 replay and the c286 product-probe.
3. Restart the standard mock and confirm health 200 before any later row.

## 6. C: round 340 §4b, §3, §4 and §4.S
- **§4b** (round 258 §4b rows, items finished in rounds 200–257) and **§4 / §4.S** (round 258 §4, items 122–199; store rows with the mock):
  - Run them as round 341 did (`c-round-341/t258/`, `c-round-301/t258/`).
  - Run the RS rows as round 342 rows 4–5 did. The gift-card step is guarded and records "absent in mock". RS-2A, RS-4B, RS-HIDDEN and RS-LM are mapped to their logs.
  - **Expected:** 0 normalised diff lines vs round 301, except diffs explained by a §2 fact.
- **§3:** RG-01 … RG-24 and RG-T1 … RG-T4B at both viewports (RG-03 at 1440 only), with round 301's adaptations.
  - RG-22's narrow half: `c-round-301/tools/narrow/rg22n.cjs` with its sink redirected.
  - Its oracle is `c-round-342/out/rg22n.json` [K10].
- **NO-SHIFT-203:** carried unless you start a reference server. Give the reason.

## 7. C: parked rows (record only unless stated)
| Row | Action | Oracle / rule |
|---|---|---|
| R390-RP301 (RP-METRO-MUTE, RP-SPACE-EMPTY, RP-VIDEO-MARKER, RP-NARROW, RP-MENU-SHEET, RP-LINK-NATIVE-MENU, RP-LINK-DRAG) | `c-round-301/tools/rp301/rp301.cjs`, with its sink redirected | `c-round-342/out/rp301.json`. A difference is a finding only if it changes behaviour |
| R390-RP-BUILT (RP-C301-01, RP-FOLD-SELECTION, RP-SAME-TEXT-RACE, RP-GATE328-S1, RP-C331-01) | `c-round-342/tools/rp/*.cjs` [K10] | `c-round-342/out/rp-*.json`. Record. Low unless the row text says otherwise; no Live parity claim |
| R390-POSCTL | `c-round-308/posctl-probe.cjs`, once per viewport | `c-round-342/out/posctl.json`. Record, including `valid` |
| R390-ESC-DRAG (signal, record) | Press Esc during a clip drag, then release | Record whether the drag commits (in round 389 it did). This is evidence for the existing signal ESCAPE-CANCEL-GESTURE / C-R85-L1, which has no CZABA contract and waits for a Live source and Saba. **Not** a finding |
| SA-19 (RETRO 336 screen candidates) | — | `awaiting_user`; carried, not run |

## 8. C: auth guard and gate rows
- **G390-AUTH:** `c-round-342/tools/g340-auth.cjs`, with the mock running, at both viewports:
  - `/studio-lab` anonymous opens the workspace with the demo badge, and `auth_user` is null;
  - `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`;
  - `/api/studio-token`: no header → 401; bare → 400; fake Bearer → 403 with the mock;
  - no token in any body.

  If the fake Bearer cannot get 403 from the mock, mark it BLOCKED (backend unavailable in cloud) and list it under `blocked`. That does not make `browserVerified` false. SRW-21 stays `deferred_user`.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`, RR-OSS.

## 9. What could break, and where to look first
- **The new play path under older audio rows.** The playback changes of rounds 382–388 sit under every older audio row. R390-VIDEO-SOUND, R340-RESCHEDULE (CONT-1/CONT-30), R301-TAPER and R301-WORKER are the first audible checks of older features on the new path.
- **The decoded-cache refusal (round 382)** can make an older script's first Space fail. Wait for the refusal to clear before calling it a regression. A refusal that never clears is a Medium finding.
- **Old output sinks.** Older scripts write into their own round folders; redirect the sinks first (L60).
- **The PRICE mock swap** can leave :5199 on the wrong data. It runs last among the store rows, and the standard mock is restarted (health 200) before G390-AUTH.

## 10. Report
- **`c-round-390.json`:**
  - `taskStatus`: PASS, FAIL or PARTIAL;
  - `passed`, `failed`, `inconclusive`, `blocked`, `carried`, `gate`;
  - `bugs`, each with id `C-R390-NN`, `severity`, `origin`, item, repro, evidence path, and "regression yes/no" with the round of its last pass;
  - `observations`, `invalidRuns`, `lookups`;
  - `browserVerified`, `realVerified`, `stopSignal`;
  - the L57 harness fields (`null` with a reason where they do not apply).
- **`c-round-390.md`:** one table, one line per row, with its evidence file.
- **PARTIAL** is allowed only for a real time-limit stop, with `progress.json` naming the rows left (L59).

## 11. Outcome, fixed in advance (D-29z1321)
| C result | B at the 390 → 391 planning |
|---|---|
| Every row has an allowed result and there is no Medium+ finding (Lows → `deferred_low_polish`) | <ul><li>`regression-last.json` = `{"date": <C's completion date>, "round": 390}`, and REGRESSION-2026-11-08 closes.</li><li>Round 391 = **PERF-13b-ii**.</li><li>ARCH-CHECKPOINT-DECODE-REGION is wanted before PERF-13b-ii. If root has not answered it by then, B rules on proceeding, with a written reason.</li></ul> |
| A Critical or High finding | <ul><li>Round 391 = its bounded fix-up.</li><li>`regression-last.json` is updated if every row ran.</li><li>PERF-13b-ii follows.</li></ul> |
| A cloud-reproducible Medium finding | Round 391 = its fix-up (≤ 3 related bugs); then PERF-13b-ii |
| PARTIAL (time limit) | Round 391 continues part 2 from `progress.json`; `regression-last.json` waits |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that half |
