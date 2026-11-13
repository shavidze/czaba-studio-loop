# Round 484: REGRESSION round, part 2 remainder (REGRESSION-2026-11-13). C-only browser half of round 483's not-run rows. A changes nothing

**Planned by:** B, at the round 483 → 484 planning on 2026-11-13 (`b-round-483.md`, `b-round-483/checkpoint.md`). The round-483 task is archived as `tasks/round-483.md`, byte-equal to the dispatched task [K13].
- **Advisor:** available and consulted (`b-round-483.md`).
- **Decisions:** D-29z1719 … D-29z1722 (`backlog.json` v473, `decisions_log_b`) [K16].

## Read first
- **`lessons.md` in full.** Directly relevant here:
  - L6: every carry is a named row;
  - L29/L56: claims;
  - L38: perf and pixel runs alone; a second server gets its own `cacheDir`; warm `/studio-lab` in a browser before timed probes;
  - L48: wait for `Demo collection ready`;
  - L57: all harness fields;
  - L59: do not end early; heaviest first; `progress.json`;
  - L60: destructive commands stay in `c-round-484/`.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md` and the loop policy (speed rules, "Regression round every 3 days", the 2026-10-23 bug gate, the cloud-runner section).
- **Round 483:** `tasks/round-483.md` (the full part-2 task; its §3 carries and §9 report rules apply here unchanged unless this task says otherwise), `c-round-483.md`, `c-round-483.json` [K6], and C's work folder `c-round-483/` (its copies are the base for this round).
- **Claims:** `bash b-round-483/claims-484.sh` (`ROOT=` and `LOOP=` can be overridden). Planning output: `b-round-483/claims-484-planning-output.txt` (stderr `claims-484-planning.err`, empty). Run it at G484-SCOPE start and end. The output must equal the planning output, except:
  - K14 is compared by "every id located, none `NOT-FOUND`" (the optimizer may archive an id between B and C, L56);
  - K18 (ports) may differ by the mock you start.

## Baseline: HEAD `751e30e`, clean tree
- `gates/gate-round-481.json` is `published` at `751e30e`; `gates/gate-round-483.json` is `skipped` ("no real changes") with `head` `751e30e` [K1]. Rounds 482 and 483 changed no source.
- At planning:
  - `git rev-parse HEAD` = `751e30e475ab…` [K1];
  - status empty [K2];
  - tracked tree frozen in `b-round-483/r484-tree-sha256.txt` (1,393 entries, rc 0), identical to round 483's manifest [K3];
  - protected files 11/11 OK [K4].
- If root publishes in between and K1 differs, a root-only commit that leaves `git diff 751e30e HEAD -- app perf cloudflare workers` empty is accepted with a note (L29). Anything else is "STOP — baseline differs".

## 0. Why this round (D-29z1719, D-29z1720)
- **Round 483 passed its rows but is not browser-verified** (D-29z1719): `taskStatus` PASS, 24 passed lines, 0 failed, 0 bugs, but `browserVerified` and `realVerified` are false. Three browser sub-rows that can run here were not run, there are 5 `notRun` entries and 2 `inconclusive` [K6]. Task 483 §10 (last row): "A browser row that could run here did not run → B re-plans that half".
- **The regression is still due.** `regression-last.json` = 2026-11-10 / 425 [K5], which is 3 days at this planning. It cannot close on a browserVerified=false run. The rows are pinned to an unchanged tree, so they run C-only on the same baseline before any code round (D-29z1720).
- **Shift:** CLIENT-NAV-CONTRACT (GATE479-M1) moves to round 485 and B-R480-ORDER-CARD-KEYBOARD to round 486 [K14].
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only, `awaiting_user` or scheduled. STEM-LANES still has no answer from Saba [K19].
- **Budget.** This is a small remainder: about 1 h. A time-limit stop is PARTIAL and resumes (§6).
- **Reference / Ableton / product-designer:** regression round. There is no new behaviour and no new parity claim; C judges the CZABA requirement only.

## 1. A: no code or doc change
- From `store/`: `git rev-parse HEAD` must be `751e30e…` and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-484.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer: nothing changes.
- Write `a-round-484.md` with:
  - the start HEAD;
  - the status output;
  - the line "no change by design (REGRESSION part 2 remainder, D-29z1720)".
- **Forbidden:**
  - `global_forbidden_files` and `global_forbidden_actions`;
  - the protected files;
  - commit, push, stash, checkout, deploy;
  - dev-server restarts.

## 2. C: scope, method and budget
- **G484-SCOPE** at start and at end:
  - K1 `751e30e…`;
  - K2 total 0;
  - K3 1,393 rc 0;
  - K4 rc 0;
  - the claims output equals the planning output (see "Read first");
  - K17 `L58 OK` (no sketch).

  Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **Work folder:** `c-round-484/`. Copy what you use from `c-round-483/` and `b-round-483/probe/` into it, keeping the same relative depth when a script imports a relative path. Redirect every output sink there (L60). Delete stale result files only inside your own copies.
- **Mock API.** Start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199 (at planning :5199 answered `000` [K18]). Record its PID in `c-round-484/mock.pid` and stop only that PID. Only G484-AUTH needs it.
- **Oracle rule:** as in task 483 §2. A difference attributable to a named round 426–481 goes to `lookups`; an unattributed difference on a valid run is a finding.
- **Run alone (L38):** never run two browser rows, a build, or a vitest run at the same time in this round. An overlapped attempt is environment-invalid. Keep it and use one of the 2 replacement attempts.

## 3. C: rows
| Row | Source | Action and expected |
|---|---|---|
| **R-DEV-WARMUP** (first, D-29z1721 (4)) | carry 4, INFO-C425-DEV-REOPT | Before any other browser row, load `/studio-lab` once in a browser on :5173, wait for `Demo collection ready` (L48), add one clip and run **one MP3 export** to the end, using your copy of `c-round-483/tools/c218-mp3-ready.cjs` (`warmup.cjs` has no export path). Record the `node_modules/.vite/deps` mtime before and after in `c-round-484/warmup.txt`. If the mtime changes again during a later row, record the time and the row; that row is environment-invalid and gets one replacement run |
| **R-FOLLOW-OFFSET-ATTR** (carry 3, C-R425-02 [K14]) | B's probe `b-round-483/probe/follow-attr-probe.mjs` = `c-round-483/t389/tools/follow-probe.mjs` + an `attr()` sample at `play0` and `play1` | `node follow-attr-probe.mjs http://127.0.0.1:5173 <abs out>.json <W>x<H>` at 1440x900 and 1280x720, **3 valid runs per viewport** (policy budget: 3 valid + up to 2 replacements). Record per run: `play1.sl` and `play1.attr` (`clientWidth`, `scrollWidth`, `scrollLeft`, `scrollerLeft`, `playheadX`, `playheadXInScroller`, `laneHeaderWidth`, `innerWidth`). B's baseline run gave `clientWidth` 1142 / 982, `laneHeaderWidth` 224, `scrollerLeft` 288 at 1440 / 1280 (`b-round-483/probe/follow-attr-*.json`) [K9]; these are record values, not asserts. **Attribution step (answer in the report):** is the per-viewport offset against round 389 (1440: 1178; 1280: 1447) constant across the 3 runs, or does it vary run to run (C r483 1445, B baseline 1447 at 1280)? Does it equal a layout width delta (`clientWidth`, header width)? **Asserted:** the behaviour fields equal round 483 (`play0.playing` "true", `follow.pressed` "true"; `manual.follow.dashed` true and the "Follow paused by manual navigation…" status; `stop` "Stopped — Space plays from the insert marker at 00:00.000."). C-R425-02 stays Low unless the playhead leaves the visible scroller at `play1` (`playheadXInScroller` < 0 or > `clientWidth`) |
| **R-CROSS-LANE-FIBERS-LANES** (carry 2) | B's probes `b-round-483/probe/cross-playing-lanes.mjs` and `cross-stopped-lanes.mjs` = the `c-round-483/tools` copies + a `mountedLanes` map per recorded label | `node cross-<k>-lanes.mjs http://127.0.0.1:5173 <abs out>.json <W> <H>` for `k` = playing, stopped at 1440 900 and 1280 720 (dev server; the fiber counts need the dev build). **Asserted:** the behaviour fields (ghosts, hint, refusal, release, Undo, Esc) equal `c-round-483/out/cross-*.json` once `mountedLanes` is removed, compared with `cmp2.py` in its directory form (see R425-PARKED-COMPARE). B's baseline runs gave 4 files, 0 diffs (`b-round-483/probe/cross-vs-r483.txt`) [K24]. **Record:** `rendered` per commit and `mountedLanes` per label (B's baseline: `{lanes: 4, clips: 1}` for every label at both viewports [K10]). A behaviour difference is a finding; a count difference is a record |
| **R423-STEM-WORKER-ALT** (round 423 row, task 414 row 5) | `cloudflare/r2-worker.js` [K8], with your copies of `c-round-483/worker414/{worker-server.mjs,browser-probe.cjs,summarize-414.py}` | For `R2_OOB` = `throw` and `short`, each with `R2_STRICT=1`: `node worker-server.mjs <abs path>/cloudflare/r2-worker.js <port> <log>`, then `node browser-probe.cjs http://127.0.0.1:<port> <log> <out>.json 1440x900`, then `python3 -I summarize-414.py <out>.json`. Name the output `wk-alt-<mode>-1440.json`: the summary's first line is the file basename. Use your own free port (not 5173 or 5199) and stop only your server PID.<br>**Pass:**<br>- each summary equals `summarize-414.py` of `c-round-414/wk-alt-<mode>-1440.json` on every line except `audioSeek`, whose 206 count may be 2 or 3 (round-414 variance);<br>- compared with your round-483 proxy summary (`c-round-483/worker414/wk-proxy-<mode>-1440.sum.txt`) from line 2 on, the only differing lines are `coverTwice` (alt: `404 h0g0c0 404 h0g0c0`; proxy: `200 h0g1c0 304 h0g1c1`) and `audioSeek`'s count.<br>B's baseline runs (`b-round-483/probe/`): throw equal to round 414; short differs only in `audioSeek` (2 vs 3); alt-vs-proxy shows exactly these lines (`alt-vs-proxy.txt`) [K11, K23]. One viewport is the round-414 rule (network only), not a skipped viewport |
| **R425-PARKED-COMPARE** (notRun 4, D-29z1721 (3)) | outputs already on disk from round 483 [K12] | No browser re-run. Compare with `c-round-483/cmp2.py` in its directory form: `python3 -I cmp2.py <new dir> <oracle dir> <out.json> [n]`, which matches files by relative name. Copy the files into same-named folders under `c-round-484/`. The oracle is the newest one on disk:<br>- `rp-{c301-01,c331-01,status-race,fold-selection}.json` from `c-round-483/out/` vs `c-round-425/out/` (newer than round 342);<br>- `c-round-483/tools/rp301/rp301.json` and `c-round-483/out/b3/posctl.json` vs `c-round-342/out/` (no round-425 copy).<br>B's pre-run (`b-round-483/probe/parked-vs-425-all.json`, `parked-vs-342.json`) [K25]:<br>- 0 diffs for rp-c301-01, rp-c331-01, rp-status-race and rp301;<br>- rp-fold-selection: 16 diffs = 8 random clip ids + 8 Detail texts with the round-436 label rename ("Source offset" → "Clip origin"); these go to `lookups`;<br>- posctl: 6 record diffs (`len`, `contiguous`), recorded.<br>Write the results to `c-round-484/parked-compare.txt`. Task 425 §6 rules: a difference is a finding only if it changes behaviour; POSCTL is recorded including `valid`; R425-ESC-DRAG (`c-round-483/out/escdrag-*.json`) is a signal and needs no oracle (ESCAPE-CANCEL-GESTURE waits for a Live source and Saba). Attribute differences to rounds 343–481 by the task-482 §2 surface map |
| **R295-LOAF-RERUN** (inconclusive, D-29z1721 (1)) | your copies of `c-round-483/t301/r295/c295.cjs` and `c-round-390/tools/loaf.cjs` (redirect its hard-coded output path into `c-round-484/`) | Run both once, alone, after warm-up. This follows C round 390's R301-LOAF precedent (INFO-C390-LOAF): an idle Studio has no natural long frame, so liveness is proved with a provoked 140 ms rAF busy loop. **Allowed:**<br>- c295: `observerError` null at both viewports and `authPass` true. Its own `loafPass` field (which needs a natural long frame) is **recorded, not the criterion**. History: r390 false, r425 true, r483 false [K21];<br>- loaf.cjs: at both viewports `afterBusyRaf` has ≥ 1 entry with a non-empty `scripts` list. B's baseline: 1440 one entry of 156 ms with 1 script; 1280 one entry of 148 ms with 1 script (`b-round-483/probe/loaf/loaf.json`) [K22].<br>A provoked frame that produces no entry is a finding (the observer is dead) |
| **G484-AUTH** (both viewports, once, at the end, §4 step 8) | your copy of `c-round-483/g483-auth.cjs` | anonymous `/studio-lab` = demo workspace + badge, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; token API 401 / 400 with no token in any body [K20]; fake Bearer 403 (mock). Premium is not bypassed |
| **Carried, not re-run** | identical tree (K3) | Every PASS line of `c-round-483.json` `passed`, and RR-PERF / PERF-LIB / RG-SMOKE (from round 482). Mark them `carried` |
| **Gate rows** | root | full vitest, typecheck, build, Biome, `npm run verify`, RR-OSS: `gate`, never in `passed` |

Rulings that need no row (D-29z1721):
- c250 `splitPlaying` (inconclusive in round 483) is resolved by C's continuous probe. It is not re-run; list it under `carried` with that reason.
- Round 483 `notRun` entry 5 (R425-RVM-FRESH replaced by R-RVM; the 1440 3-clip WAV sha was compared and is equal) owes nothing: R-RVM ran in full in round 483.

## 4. Order (L59: after a time-limit stop, resume from `c-round-484/progress.json`)
1. G484-SCOPE start, claims, then start the mock.
2. R-DEV-WARMUP.
3. R295-LOAF-RERUN (alone).
4. R-FOLLOW-OFFSET-ATTR (6 valid runs).
5. R-CROSS-LANE-FIBERS-LANES (4 runs).
6. R423-STEM-WORKER-ALT (2 modes).
7. R425-PARKED-COMPARE (file compares only).
8. G484-AUTH.
9. G484-SCOPE end. Stop your PIDs (mock, worker servers).

Write `c-round-484.json`, `c-round-484.md` and `progress.json` after every row.

## 5. What could break, and where to look first
- **Port collisions:** a worker server left from round 483 or an earlier B probe. Check that the port is free before you start, and use your own port.
- **Follow timing:** `play1` samples after a 7 s wait while playing. A page turn landing near the sample can shift `sl` by a page. Report that as a page-turn phase, not as an offset, and attribute it from the `attr` fields.
- **Dev re-optimise:** see R-DEV-WARMUP. The fiber counts need the dev server; never run them on a production build.

## 6. Report
- **`c-round-484.json`** carries:
  - `taskStatus` (PASS, FAIL or PARTIAL);
  - `passed`, `failed`, `inconclusive`, `blocked`, `carried`, `gate`, `notRun`;
  - `bugs`: each with id `C-R484-NN`, `severity`, `origin`, item, repro, evidence path, and "regression yes/no" with the round of its last pass;
  - `observations`, `invalidRuns`, `lookups`;
  - `browserVerified`, `realVerified`, `stopSignal`, `progressFile`;
  - **all L57 fields:** `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch`. Write `null` with a reason where a field does not apply, e.g. "regression round, no sketch".
- Run `python3 -I tools/l57-check.py c-round-484.json c-round-484/l57-check.txt` before hand-off.
- **`c-round-484.md`:** one table, one line per row, each with its evidence file, and the R-FOLLOW-OFFSET-ATTR attribution answer in plain words.
- **`browserVerified`:** true only if every browser row of §3 ran. No §3 row needs the backend, and each ran at B's baseline. A row that does not run is listed in `notRun` with its reason; it is never silently skipped.
- **PARTIAL** is allowed only for a real time-limit stop, with `progress.json` naming the rows left and with `stopSignal` (L59). PARTIAL is not done.

## 7. Outcome, fixed in advance (D-29z1722)
| C result | B at the 484 → 485 planning |
|---|---|
| Every §3 row has an allowed result, and there is no Medium+ finding (Lows → `deferred_low_polish`) | `regression-last.json` = `{"date": <C's completion date>, "round": 484}` and REGRESSION-2026-11-13 closes. Round 485 = **CLIENT-NAV-CONTRACT** (GATE479-M1, with its D-29z1704 sketch pre-run; facts in `b-round-483/client-nav-planning-note.md`). Round 486 = **B-R480-ORDER-CARD-KEYBOARD**. Then DPG-BUTTON-CLEANUP and the rest of DPG P1. STEM-LANES jumps ahead if Saba answers `AGREE-STEM-LANES.md` |
| A Critical or High finding | Round 485 = its bounded fix-up. `regression-last.json` is updated only if every row ran |
| A cloud-reproducible Medium finding | Round 485 = its fix-up (≤ 3 related bugs), unless it is root-only or manual-only; then the order above resumes |
| A row BLOCKED only because the backend is unavailable in the cloud (cloud-runner rule) | The regression closes on the rest; that row moves to `carry_to_next_regression`. No §3 row needs the backend, and B ran every §3 probe at the baseline, so any other non-run is the last row below |
| PARTIAL (time limit) | Round 485 continues this remainder from `progress.json`; `regression-last.json` waits |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that row again, and the regression stays open |

## Claims (`b-round-483/claims-484.sh`; planning output `b-round-483/claims-484-planning-output.txt`)
- K1 HEAD and gate 481/483 status;
- K2 git status count;
- K3 tree manifest;
- K4 protected files;
- K5 regression-last;
- K6 round-483 C summary;
- K7 the testids the probes read (`arrangement-playhead`, `arrangement-track-header`, `arrangement-timeline-scroller`, lane `data-track-id`);
- K8 worker files and their last change;
- K9 B's Follow attribution baseline values;
- K10 B's cross-lane mounted-lane baseline;
- K11 B's alt-worker throw run equals round 414;
- K12 cited artifacts exist;
- K13 archive of task 483;
- K14 finding ids (find-ids);
- K15 regression entry status;
- K16 backlog version and last D-ID;
- K17 l58-check;
- K18 ports;
- K19 STEM-LANES answer;
- K20 auth recipe;
- K21 c295 loafPass history;
- K22 B's provoked-LoAF baseline;
- K23 B's alt-worker short run and the alt-vs-proxy lines;
- K24 B's cross-lane baseline vs round 483 (0 diffs);
- K25 B's parked-compare pre-run.
