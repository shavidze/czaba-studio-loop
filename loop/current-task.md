# Round 483: REGRESSION round, part 2 (REGRESSION-2026-11-13). C-only browser sweep of everything finished up to round 425 (the round-423 and round-425 rows) plus the carries of REGRESSION-2026-11-10. A changes nothing

**Planned by:** B, at the round 482 → 483 planning, 2026-11-13 (`b-round-482.md`, `b-round-482/checkpoint.md`). The round-482 task is archived as `tasks/round-482.md`, byte-equal to the dispatched task [K14].
- **Advisor:** available; consulted twice, after orientation and before hand-off (`b-round-482.md`).
- **Decisions:** D-29z1716 … D-29z1718 (`backlog.json` v472, `decisions_log_b`, `regression_rounds` id `REGRESSION-2026-11-13`) [K16, K17].

## Read first
- **`lessons.md` in full** [K19]. Directly relevant: L6 (every carry is a named row or "carried"), L25 (soft-disabled clicks), L29/L56 (claims), L36 (stubbed client path), L38 (perf and pixel runs alone; a second dev server gets its own `cacheDir`; warm `/studio-lab` in a browser before a timed probe), L48 (playback-start lead; wait for `Demo collection ready`), L54 (journey row), L57 (all harness fields), L59 (do not end early; heaviest first; `progress.json`), L60 (destructive commands stay in `c-round-483/`).
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md` and the loop policy: speed rules, "Regression round every 3 days", the 2026-10-23 bug gate, the cloud-runner section.
- **The templates, by reference** (all exist [K13]). **Where this task differs from them, this task wins.**
  - `tasks/round-423.md` §3–§4 (items finished in rounds 391–422), with C's run `c-round-423.md` / `c-round-423/`.
  - `tasks/round-425.md` §3–§7 (items finished up to round 390, and its carried and parked rows), with C's run `c-round-425.md` / `c-round-425/{tools,t258,t301,t301x,wk,t389,out,noshift,scale,peaks}`. These copies are the newest adaptations: use them before the round-389/390 originals.
- **Part 1** (rounds 426–481) is done: `tasks/round-482.md`, `c-round-482.md` (26 rows PASS, 0 bugs, `browserVerified` true) [K6].
- **Claims:** `bash b-round-482/claims-483.sh` (`ROOT=` and `LOOP=` can be overridden). Planning output: `b-round-482/claims-483-planning-output.txt` (stderr `claims-483-planning.err`, empty). Run it at G483-SCOPE start and end. The output must equal the planning output, except:
  - K15 is compared by "every id located, none `NOT-FOUND`" (the optimizer may archive a closed id between B and C, L56);
  - K20 (ports) may differ by the mock you start.

## Baseline: HEAD `751e30e`, clean tree
- `gates/gate-round-481.json` is `published` at `751e30e` on both remotes; `gates/gate-round-482.json` is `skipped` ("no real changes") with `head` `751e30e` [K1]. Round 482 changed no source, so the baseline is unchanged.
- At planning:
  - `git rev-parse HEAD` = `751e30e475ab…` [K1];
  - status empty [K2];
  - tracked tree frozen in `b-round-482/r483-tree-sha256.txt` (1,393 entries, rc 0), identical to round 482's manifest [K3];
  - protected files 11/11 OK (`b-round-318/protected-sha256.txt`) [K4].
- If root publishes in between and K1 differs, a root-only commit that leaves `git diff 751e30e HEAD -- app perf` empty is accepted with a note (L29). Anything else is "STOP — baseline differs".

## 0. Why this round (D-29z1716, D-29z1717)
- **Round 482 passed** (D-29z1716): C PASS, 26 rows, 0 bugs, `browserVerified` and `realVerified` true; C's start and end claims equal the planning output [K6]. Gate 482 skipped (no source change).
- **The outcome was fixed in advance** (task 482 §8, PASS row; D-29z1715): round 483 = REGRESSION-2026-11-13 part 2 on the same baseline: the round-423 rows (391–422), the round-425 rows (≤ 390) and `carry_to_next_regression_d29z1490` (6 entries [K16]).
- `regression-last.json` = 2026-11-10 / 425 [K5]. It is updated only when part 2 closes.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only, `awaiting_user`, or scheduled (CLIENT-NAV-CONTRACT 484, B-R480-ORDER-CARD-KEYBOARD 485) [K15]. STEM-LANES still has no answer from Saba [K21].
- **Budget.** C took 2.1 h (round 423) + 1.0 h (round 425) (`metrics/rounds.csv`). RR-PERF, PERF-LIB and RG-SMOKE are carried from round 482 (§6), so expect about 3 h. A time-limit stop is PARTIAL and resumes (§9).
- **Reference / Ableton / product-designer:** regression round. No new behaviour, no new parity claim. C judges the CZABA requirement only; Ableton conformance does not apply.

## 1. A: no code or doc change
- From `store/`: `git rev-parse HEAD` must be `751e30e…` and `git status --short --untracked-files=all` must be empty. If either differs, write "STOP — baseline differs" at the top of `a-round-483.md` with the output, and change nothing.
- Do not edit any file in `store/`. Run no vitest, typecheck, lint or code-reviewer: there is no change.
- Write `a-round-483.md`: the start HEAD, the status output, and "no change by design (REGRESSION round part 2, D-29z1717)".
- **Forbidden:** `global_forbidden_files` / `global_forbidden_actions`; the protected files; commit, push, stash, checkout, deploy; dev-server restarts.

## 2. C: scope, method and budget
- **G483-SCOPE** at start and at end: K1 `751e30e…`; K2 total 0; K3 1,393 rc 0; K4 rc 0; the claims output equals the planning output (see "Read first"); K18 `L58 OK` (no sketch). Any change by anyone is a SCOPE FAIL; name the writer if you can.
- **First, R-DEV-WARMUP (carry 4, D-29z1490 d):** load `/studio-lab` once in a browser and run one MP3 export on the :5173 dev server before any timed or dev-load row, so Vite's late dependency optimisation (`@mediabunny/mp3-encoder`, INFO-C425-DEV-REOPT) happens before measurement. Record the `node_modules/.vite/deps` mtime before and after in `c-round-483/warmup.txt`.
- **Mock API.** Start `mock-api/server.mjs` from the loop folder on 127.0.0.1:5199 (at planning :5199 answered `000` [K20]). Record its PID in `c-round-483/mock.pid`; stop only that PID. Mock data proves the client path only.
- **Tools** [K13]. Copy what you use into `c-round-483/` (same folder depth when a script imports a relative path) and redirect every output sink there (L60). Your copies become the next regression's base: keep them. Priority:
  1. `c-round-425/{tools,t258,t301,t301x,wk,t389}` for the round-425 rows;
  2. `c-round-423/` for the round-423 rows;
  3. then the older folders those rounds name.
- **Oracle rule.** "As in round N" means: reuse that round's script and its PASS output (`c-round-425/…`, `c-round-423/…`) as the oracle. Rounds 426–481 changed 143 paths under `app/` and `perf/` since `f6c76f4` [K7]. The surface → latest-oracle map of `tasks/round-482.md` §2 applies unchanged here, and C round 482's output for each surface is the newest oracle.
  - A difference from a 423/425 oracle on an element that a named round 426–481 changed on purpose (its task, its C report or the §2 map of task 482) goes to `lookups` with that round. It is never a finding by itself.
  - An unattributed difference on a valid run is a finding.
- **Changed UI facts since round 425** (adapt older scripts to these; each adaptation is "lookup, not deviation"; name the fact). B grepped the base copies for retired facts (`b-round-482/retired-facts-grep.txt`):
  - **Detail label (436):** the panel says "Clip origin", not "Source offset" [K8: strings 1, app 0]. `c-round-425/t258/tools/lib122.cjs` still parses `Source offset` [K8 1], so its `offset` reads `undefined`. Change that regex to `Clip origin` in your copy. No copy parses `From, s` / `To, s`.
  - **Entrance colour (477):** the entrance cover is `var(--color-background)` = `rgb(14, 13, 12)` [K10 1], not `rgb(0, 0, 0)`. `s188/tools/loader-probe.cjs`, `s190/tools/ld.cjs` and `s188/tools/c188-main.cjs` select the overlay by an inline `rgb(0, 0, 0)` [K10 1/1/2]. Adapt them to `rgb(14, 13, 12)`, or select by `data-testid`. A loader count of 0 caused only by the old colour is a harness drift, not a finding.
  - **Fonts (473):** the Store body font is Instrument Sans [K11 2]. The font files themselves are unchanged since `f6c76f4` (25 tracked `woff2`, 0 changed [K24]); round 473 changed which files are requested. **R340-FONTS** keeps its "0 third-party / 0 render-blocking / CORS preloads" checks and its byte pin (`tools/font-bytes.cjs`): every font file the browser downloads at HEAD has the sha256 that round 425 recorded for the same file name (`c-round-425/out/fonts/{dev,prod}-font-bytes.json`). The **set** of downloaded files follows round 482 (`c-round-482/store/fonts-check.txt` [K11]: `instrument-sans-latin.woff2` and `ibm-plex-mono-latin.woff2`, 0 Inter/Playfair requests). A round-425 file name that is no longer requested goes to `lookups` (round 473), not a finding.
  - **Client navigation (479):** footer and content links are client-side `<Link>` [K12b 9, `app/lib/link-focus.ts` exists]. A script that waits for a full `load` after a footer or content click hangs; wait for the URL and the page heading. Initial `page.goto(..., load)` waits are unaffected.
  - **My Orders (481):** the empty state links to `/store`; the protected downloads page still links to `/music` [K12b 1/1].
  - **Held Enter:** 15 Studio component files import `studio-repeat-safe`; the transport has 12 `preventRepeatedEnterKeyDown` handlers [K9]: the 11 of tasks 423/425 plus **Export** (round 426) [K24 export-guarded 1]. **Fit stays unguarded** [K24 fit-guarded 0], so the "Fit stays unguarded" expectation of tasks 423/425 still holds. A script that holds Enter on a guarded button expects one action. `c-round-425/t389/tools/playstop.mjs` and `c-round-423/probe/held-enter.mjs` hold Enter (`retired-facts-grep.txt`).
  - **Derived sweep (not hand-picked):** `b-round-482/removed-literals.sh` takes every UI literal (`data-testid`, `aria-label`, `title`, `placeholder`, quoted strings, JSX text) removed from `app/components/arrangement` and `strings.ts` since `f6c76f4` that is absent at HEAD, and greps the base copies. Output `b-round-482/removed-literals-grep.txt`: 2 lines; the only hit is `lib122.cjs` (`Source offset`, ruled above) [K25].
  - Unchanged since round 425 and still binding: lanes virtualize clips (count from `data-clip-count` [K9 1]); demo peaks are precomputed [K9 1]; URL-backed previews stream through `preview.client.ts` [K9 present]; clip start is read from `data-clip-start` [K9 1].
- **B pre-rulings, binding here:**
  - D-29z1486 (streaming preview vs decode, R389-DECODE-CACHE) and the round-390 rulings listed in task 425 §2 stay.
  - D-29z1490 (e): the WAVEFORM third-decimal path diffs (precomputed peaks), the refusal copy (C-R391-01) and the r300 empty starts (round 393) are record only.
  - HARNESS-DRIFT (D-29z1485): RG-06 (Ctrl+drag marquee), RG-18 (`STEM=demo-stem-pad`), c250-s9 (series max) and c218-mp3 (waits for ready) run from the `c-round-425` copies.
  - The known Low C-R341-02 (font preload "not used" after client navigation) is console noise.
- **Single dev server.** Every dev row runs on :5173. Production rows (R-RVM, HEAP, export-trunc, the R423-STEM-CACHE build) use one scratch production server on its own port, from a `git archive HEAD` scratch copy with a symlinked `node_modules`, stopped after. A cold dev replicate (R-RVM) uses a scratch copy with its **own** Vite `cacheDir` and its own port; it never touches `store/node_modules/.vite` (L38).
- **Budget per row:** up to 2 replacement attempts, for environment-invalid runs only (the cold-start Sounds-listbox timeout, the s186 gift-card crash when the mock lacks that product, a port in use, an overlapped job). Keep the log. Thresholds are not relaxed. A row that fails on a valid setup is a finding.
- **Console noise known in the cloud:** `Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`, C-R341-02. Record any other page error with its row.
- **Both viewports** (1440×900 and 1280×720) on every row unless the row says otherwise.
- **Severity:** the 2026-10-23 bug gate. Medium and above → a fix-up round. A new Low → `deferred_low_polish`.

## 3. C: carries of REGRESSION-2026-11-10 (`carry_to_next_regression_d29z1490`, L6)
| Row | Carry | Action and expected |
|---|---|---|
| R-RVM **[carry 1, D-29z1488]** | C-R425-01-RVM-COLD-DEV-EMPTY [K15] | (a) **Production, authoritative:** `c-round-425/tools/mepage-prod-1440.cjs` and `mepage-prod-1280.cjs` on the scratch production server, **8 fresh-context loads per viewport**, nothing else running. (b) **True cold dev replicate:** 5 scratch dev starts, each on a fresh `git archive HEAD` copy with its own empty `cacheDir` and port; load `/studio/middle-east` **first** on each start (one fresh context, 1440×900); keep the Vite stdout log and the `?v=` deps hashes. Pass: every load shows "Sign in required", body not empty, no "Invalid hook call", 0 `audio[src]`, `auth_user` null. **Medium:** any production reproduction, or a cold dev failure whose Vite log has no re-optimise / reload line. A cold dev failure with such a line confirms the D-29z1488 hypothesis: record it; C-R425-01 stays Low |
| R-CROSS-LANE-FIBERS **[carry 2]** | INFO-C425-CROSS-LANE-FIBERS | R340-CROSS-LANE as in round 425 (`c-round-425` copy). Record the dev-fiber `rendered` counts per commit (round 425: 44 cross-enter / 67 release) and the mounted-lane count at that moment. `ArrangementLane.tsx` changed again in rounds 426–481 [K7], so the counts are **record**; the behaviour fields stay asserted (equal to round 425) |
| R-FOLLOW-OFFSET **[carry 3]** | C-R425-02-FOLLOW-SCROLL-OFFSET [K15] | `c-round-425/t389/tools/follow-probe.mjs`. Record Follow `scrollLeft` per viewport against round 389's oracle and round 425's (+5 px at 1280, +2 px at 1440). Attribution step: record the timeline's `clientWidth`, the playhead `x` and the lane-header width at the same sample, and say whether the offset equals a layout width delta. Record only; C-R425-02 stays Low unless the offset changes what the user sees (playhead off screen, a page turn too early) |
| R-DEV-WARMUP **[carry 4]** | INFO-C425-DEV-REOPT | Done first (§2). Record the deps mtimes |
| R-EVICT-PIN **[carry 5, D-29z1490 a]** | R389-DECODE-CACHE pins | EVICT: **0** `stop()` calls on the evicted preview (streamed preview, no AudioBufferSource); Add plays live; Undo removes it. HEAP-RETAINERS-PROD at 1440 on the production build: live counts `[2,5,16,16,16,16,16]`. Both asserted: C verified them on `f6c76f4`, and since then the retention paths changed only by the held-Enter guard refactor (`app/lib/arrangement` non-test: `strings.ts` only; `preview.client.ts` 0; `ArrangementLibraryPreview.tsx` 13 diff lines, all the guard [K23]). A difference attributable to a named round 426–481 that changed the library preview (`ArrangementLibraryPreview.tsx` [K7, K23]) goes to `lookups`; otherwise it is a finding (Medium for retention growth) |
| base copies **[carry 6]** | — | Use `c-round-425/{tools,t258,t301,t301x,wk,t389}`; delete stale result files **in your own copies** before running (L60). Record "carried: used" |

## 4. C: round-423 rows (items finished in rounds 391–422)
Run every row of `tasks/round-423.md` §3 as written there, with the §2 changes above, from the `c-round-423/` copies. Oracle: the c-round-423 output each row names.
- **Compare inputs (one rule per compare row).** Never put a new run into `head/`.
  - **R423-HELD-ENTER:** `c-round-423/probe/head/` is round 422's **pre-fix control**. Copy it unchanged to `c-round-483/probe/head/`; write the new run to `c-round-483/probe/sketch/`; run `compare.py` on `c-round-483/probe`. Pass: `ALL OK (12 cells)`, as round 423. Rounds 426–429 widened the same guard (Export, round 426 [K24]); a cell that differs only for that reason goes to `lookups`.
  - **R423-PREVIEW-LIFECYCLE:** `head/` is the **post-change oracle**. Copy `c-round-423/probe-418/sketch/` to `c-round-483/probe-418/head/` and `c-round-423/probe-421/sketch/` to `c-round-483/probe-421/head/`; write the new runs to each `sketch/`; run each round's `compare.py`. Pass: every cell equal (16 and 14 cells).
  - **R423-STEM-CACHE:** copy `c-round-423/probe-419/out/sketch/` to `c-round-483/probe-419/out/head/`; run `run-probe.sh <scratch> sketch <port> <abs>/c-round-483/probe-419/out`; run `compare.py` on `c-round-483/probe-419/out`. Pass: all 8 cells equal.
- R423-MARKER-SEEK, R423-PREVIEW-LIFECYCLE, R423-STEM-CACHE (production build; never during another timed row), R423-PEAKS, R423-STEM-WORKER, R423-METER, R423-LANE, R423-VIDEO-DOCK, R423-LEAF-ACTIONS, R423-PEAKS-FALLBACK, R423-SCALE, R423-SCALE-EXPORT, R423-SYNTH, R423-PREVIEW-STREAM, R423-DECODE-STATUS (use `c-round-423/r392/b7-replay2.mjs` for the decode-status replay, per D-29z1486).
- **R423-JOURNEY:** covered by R340-JOURNEY in §5 (one continuous journey with WAV export). Record "covered by R340-JOURNEY".

## 5. C: round-425 rows (items finished up to round 390)
Run `tasks/round-425.md` §3, §4, §5 and §6 as written there, with the §2 changes above, from the `c-round-425` copies. Oracle: the evidence path each row cites in `c-round-425.md`.
- **§3:** R425-LANE-REBASE, R425-VIDEO-SOUND, R425-WAV-3CLIP-LEN (at 1440 the sha256 is compared with `c-round-389/export-det.json`; a difference goes to B, not a FAIL by itself). R425-RVM-FRESH is replaced by R-RVM (§3 above). NO-SHIFT-203 stays retired (D-29z1485).
- **R425-NOSHIFT-BOXES (record):** run `c-round-425/tools/noshift.cjs` again and compare with `c-round-425/noshift/*.json`. Rounds 446–481 restyled the Store (fonts 473, tokens 449–475, product card 475, header 447/476). List each box that differs in `lookups` with the round it is attributed to. Record only; the new files are the next regression's oracle.
- **§4:** the round-389 rows (R389-SCHED-FAIL … R389-GROUP-MOVE), with R389-DECODE-CACHE asserted as in R-EVICT-PIN above.
- **§5:** the round-390 rows. **R340-JOURNEY is one continuous flow with the WAV export and screenshots per step** (`c-round-390/tools/journey-full.cjs`, or C's round-425 copy). It covers R423-, R389- and R301-JOURNEY. **R301-PRICE runs last among the store rows**, with the mock swap and a restart of the standard mock (health 200) after it.
- **§6 (RG-01 … RG-24, RG-T1 … RG-T4B, §4/§4.S, §4b, RS-4B):** expected 0 normalised diff lines, except diffs explained by a §2 fact or attributed to a named round 391–481 (into `lookups`).
- **Parked rows (record only, as task 425 §6):** R425-RP301, R425-RP-BUILT, R425-POSCTL, R425-ESC-DRAG (signal), SA-19 (`awaiting_user`, carried, not run).

## 6. C: carried from part 1, auth and gate rows
- **Carried, not run (same HEAD and same tracked tree as round 482 [K1, K3 same-as-482 yes]):**
  - **RR-PERF:** C round 482 ran all 5 specs, 95 asserts, 0 failures (`c-round-482/perf-results/`, 5 files; `perf-compare.txt`) [K6]. List it under `carried`. Do not run `npm run test:perf`.
  - **PERF-LIB:** C round 482, 3 files / 54 tests (`c-round-482/perf-lib.log`) [K6].
  - **RG-SMOKE:** C round 482, 2 tests (`c-round-482/smoke.log`) [K6].
- **G483-AUTH:** `c-round-390/tools/g390-auth.cjs` (or C's round-425 copy) with the mock running, both viewports:
  - `/studio-lab` anonymous opens the workspace with the demo badge and `auth_user` null;
  - `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`;
  - `/api/studio-token?product=middle-east&file=mix.wav` with no header → 401, bare `/api/studio-token` → 400, no token in any body [K22: B's planning run gave 401 and 400].

  The fake Bearer is BLOCKED (backend unavailable in cloud) unless the mock answers 403. List it under `blocked`; it does not make `browserVerified` false. SRW-21 stays `deferred_user`.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome, `npm run verify`, RR-OSS.

## 7. Order (L59: heaviest first; after a time-limit stop, resume from `c-round-483/progress.json`)
1. G483-SCOPE start, claims, mock start.
2. R-DEV-WARMUP.
3. Production rows, alone: R-RVM (a) and (b), HEAP (R-EVICT-PIN), R423-STEM-CACHE, the export-trunc row.
4. §4 (round-423 rows).
5. The remaining §3 carries and the round-425 §3/§4 rows.
6. The round-390 rows, with R301-PRICE last among the store rows.
7. Parked rows; G483-AUTH.
8. G483-SCOPE end; stop your PIDs (mock, production and scratch dev servers).

Write `c-round-483.json`, `c-round-483.md` and `progress.json` after every row.

## 8. What could break, and where to look first
- **Rounds 426–445** changed the Studio's key handling (held Enter, IME), native control chrome (spin, radio, progress, search, scrollbars) and the copy. R423-LEAF-ACTIONS, R423-LANE, the RG rows and R389-FADERS-ICONS touch those surfaces first.
- **Rounds 446–481** restyled the Store (tokens, fonts, glows, entrance, links). The RS-4B, s186–s195, R301-PRICE and NOSHIFT rows will show visual diffs: attribute each with the §2 map before calling it a regression.
- **Old output sinks:** redirect every sink into `c-round-483/` first (L60). The PRICE mock swap can leave :5199 on the wrong data; restart the standard mock before G483-AUTH.

## 9. Report
- **`c-round-483.json`:** `taskStatus` PASS, FAIL or PARTIAL; `passed`, `failed`, `inconclusive`, `blocked`, `carried`, `gate`, `notRun`; `bugs` (id `C-R483-NN`, `severity`, `origin`, item, repro, evidence path, "regression yes/no" with the round of its last pass); `observations`, `invalidRuns`, `lookups`; `browserVerified`, `realVerified`, `stopSignal`, `progressFile`; and **all L57 fields**: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`, `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`, `affectedChecksNamed`, `affectedChecksRunOnSketch` (`null` with a reason where a field does not apply, e.g. "regression round, no sketch").
- Run `python3 -I tools/l57-check.py c-round-483.json c-round-483/l57-check.txt` before hand-off.
- **`c-round-483.md`:** one table, one line per row, with its evidence file.
- **PARTIAL** is allowed only for a real time-limit stop, with `progress.json` naming the rows left and `stopSignal` (L59). It is not done.

## 10. Outcome, fixed in advance (D-29z1718)
| C result | B at the 483 → 484 planning |
|---|---|
| Every row has an allowed result and there is no Medium+ finding (Lows → `deferred_low_polish`) | `regression-last.json` = `{"date": <C's completion date>, "round": 483}`; REGRESSION-2026-11-13 closes. Round 484 = **CLIENT-NAV-CONTRACT** (GATE479-M1, ruling D-29z1704); 485 = **B-R480-ORDER-CARD-KEYBOARD**; then DPG-BUTTON-CLEANUP and the rest of DPG P1. STEM-LANES jumps ahead if Saba answers `AGREE-STEM-LANES.md` |
| A Critical or High finding | Round 484 = its bounded fix-up. `regression-last.json` is updated only if every row ran |
| A cloud-reproducible Medium finding | Round 484 = its fix-up (≤ 3 related bugs), unless it is root-only or manual-only; then the order above resumes |
| PARTIAL (time limit) | Round 484 continues part 2 from `progress.json`; `regression-last.json` waits |
| A browser row that could run here did not run | `browserVerified=false`; B re-plans that half |
