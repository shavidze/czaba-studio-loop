# C round 281: PERF-HARNESS-DIAG-281 (test-only perf harness): **PASS**

**Verifier:** C (independent). **Baseline:** HEAD `145f6c1` (`git rev-parse` in the repo). **Tree:** 10 `M` + 1 `??` (doc 210), all §5 paths. No app source, budgets, config or `.claude` change. C changed no source. The code diff was identical before and after C's phase (`git diff -- perf` = `c-round-281/c-code.diff` = A's `a-code.diff`).
**Evidence:** `tmp/studio-real-loop/c-round-281/`.
**Order (L38):** the static rows ran first. Then the perf run ran alone, then EQUIV and DETAIL-LANE (1) on its reports, then the three runtime mutants one at a time, then the tsc mutant. Last came an untimed warm-up and the timed browser probes. No two jobs overlapped.

## Results per §8 row
| Row | Verdict | Evidence / measurement |
|---|---|---|
| SOURCE-SCOPE | PASS | `sha256sum -c b-round-280-r281-tree-sha256.txt` rc 0 at the start (`frozen-start.txt`) and at the end (`frozen-end.txt`). `git status` (`git-status-end.txt`): the 10 `M` §5 paths plus `?? 210-…md` |
| HUNK-SCOPE | PASS | Code: `git archive 145f6c1` + `b-round-280/sketch.diff` applied cleanly (rc 0). All 5 code files are byte-identical to the working tree (`hunk-code.txt`, `cmp`). Doc hunks by section: 168 l.43 is in `### Liveness-ის წესები` (l.39–52) and l.253 is a TODO bullet. 169 l.13 is in the `## მიდგომა` intro (l.11–20) and l.215 is a TODO bullet. 175 l.27/l.34 are in `### Helper-ების რუკა` (l.19–38), l.73 is in `### GATE214-S2…` (l.70–75) and l.134 is a TODO bullet. 208 l.88 only. 209 l.87 only |
| CLAIMS | PASS (+1 Low planning note) | `claims.sh` on a fresh `git archive 145f6c1` differs from `claims-output-at-145f6c1.txt` only in K1, which prints `(archive)`. K1 in the repo = `145f6c1` (`claims-diff.txt`). L29 sweep: 32 hits; see §L29 below. One untagged doc-line fact: **C-R281-01** (Low) |
| SWEEP | PASS | SW-A/SW-D: the new names occur only in the 5 granted code files and the 6 granted docs (`sweep.txt`). SW-B: `StudioWorkspace.tsx`, `perf/lib/app-labels.ts`, `perf/lib/page.ts`, plus 47 `app/lib/arrangement/__tests__` files (unchanged). SW-C: only `perf/studio-lab-interactions.perf.spec.ts`. K17 on the tree: one line, `perf/lib/page.ts:151` (`k17-a.txt`) |
| TYPECHECK | PASS | `npm run typecheck` rc 0 (`typecheck.log`) |
| PERF-RUN | PASS | `CI=true npx playwright test --config playwright.perf.config.ts`, run alone: **3 passed (13.9m)**. PERF-1b-i 5.4 min, PERF-1b-ii 1.1 min, PERF-1a 7.1 min (`run-1/perf-run.log`). All three reports: `complete: true`, `failures []`, 6 passes each, no `abortedAt`, 0 problems, 0 pageErrors (`detail-lane-1.txt` header run) |
| EQUIV | PASS | (`equiv.txt`) PERF-1a: rows 316, deterministic 166, **problems 0**, rc 0. PERF-1b-i: rows 144, deterministic 106, **problems 0**, rc 0. PERF-1b-ii: rows 61, deterministic 37, **problems 0**, tolerated 1 (`res.export.1.peak-backing-delta-mib` 65 → 65.1, a named `--tol` row), rc 0. The same-machine HEAD clause was not needed |
| DETAIL-LANE (1) | PASS | `interact.harness.click-live` and `.6x`: 6/6 detail objects with the keys in order `faderEnabledAfterAdd, faderDisabledBeforeClick, faderEnabledAfterClick, clipTrackId, emptyLaneTrackId`; values `music` / `stems` (two different non-empty strings); samples `[1,1,1]` in both rows (`detail-lane-1.txt`) |
| DETAIL-LANE (2) | PASS (browser) | Fresh context, dev server `/studio-lab`, at 1440×900 and 1280×720. Selected library item `demo-middle-east`. Before Add: `music` 0 audio clips, `stems` 0. After Add: `[data-track-id="music"]` has 1 `[data-clip-kind="audio"]` and `[data-track-id="stems"]` has 0. Lanes `video:0, music:1, stems:0, sfx:0` (`c281-probe.json` rows `lane@…`, `detail-lane-1440x900.png`, `detail-lane-1280x720.png`) |
| FAILED-SOURCE | PASS | C's own `run-mutant.sh MU-FAILED-SOURCE 145f6c1 c-code.diff` gave `1 failed`. 6/6 passes have `abortedAt` = `load` and exactly one problem, byte-exact equal to `aborted at load: demo collection failed before the library was ready: 1 sound in the demo collection failed to load — details are in the library.` Report `durationMs` 9287; the whole Playwright run took 24.2 s (`mutants/summary.txt`, `mutants/MU-FAILED-SOURCE/`) |
| FAILED-OTHER | PASS | `1 failed`. 6/6 passes have `abortedAt` = `load` with one problem that contains `demo collection failed` and ends with the exact status text. **Prefix fired: library-ready in 6/6** (`… before the library was ready: …`). No pass reached Add. `durationMs` 6775 |
| STATUS-WAIT | PASS | `1 failed`. 6/6 passes have exactly `aborted at load: after load: demo collection failed: 1 sound in the demo collection failed to load — details are in the library.` (byte-exact). `durationMs` 6978. The mutant line `if (failedSource === '' && status === '')` was applied (mutant.diff 23 lines) |
| NO-OWN-GUARD | PASS | Final tree copy with the step-1 guard removed: `npx tsc --noEmit -p .` rc 2. `perf/studio-lab-interactions.perf.spec.ts(237,5): error TS2322: Type 'string \| null' is not assignable to type 'string'.` Line 237 is `clipTrackId: found.ownTrack,` (`mu-no-own-guard-tsc.log`) |
| HEAD-CONTROL | PASS (evidence check) | `b-round-280/head-load-control-partial.json`: `complete: false`, `durationMs` 180735; 2 passes, each `load` / `aborted at load: page.waitForFunction: Timeout 90000ms exceeded.` Against 9.3 s for the whole mutant report now |
| G281-AUTH | PASS (browser) | New context with no credentials, at 1440×900 and 1280×720. **`/studio-lab`:** the workspace renders (1 timeline scroller), with the badge `Demo collection — no sign-in required` (count 1), and `auth_user` is null. **`/studio/middle-east`:** `Sign in required`, `audio[src]` 0, no workspace. **`/api/studio-token`:** with no header → 401 `{"error":"Please sign in to access Studio."}`; with a fake bearer → 500 `{"error":"Unable to prepare Studio access"}` (no token, no url). The page made no 200 token response. Premium auth is not bypassed (`c281-probe.json`, `auth-lab-*.png`, `auth-guard-*.png`) |
| DOC-210 | PASS | l.4 is byte-exact `**სტატუსი:** Completed (C round 281 PASS)`. Its 7 `## ` headings match the order of TEMPLATE's 7 after `## Prompt`. The testing section names only rows and mutants that exist (PERF-RUN, EQUIV, DETAIL-LANE, MU-*, HEAD-CONTROL). Its numbers are A's run, consistent with C's (C: 13.9 min / 9287 / 6775 / 6978 ms; A: 13.4 min / 9206 / 6716 / 6969 ms). Docs 168/169/175/208/209 changed only in their §5 sections (HUNK-SCOPE). `grep -rn 'In Progress (stage' docs/implementation` = 0. 208's body (l.18, 34, 71) is unchanged |
| gate | gate | Full vitest, build, Biome, `npm run verify`, `test:e2e:smoke`: root gate rows, not claimed |

### Extra real-browser regression (Studio user flow, unchanged app; not a §8 row)
`smoke@1440x900` and `smoke@1280x720` (`c281-probe.json`, `smoke-stopped-*.png`):
- Flow: add a demo stem, then Space plays. The playhead advances and the tapped audio graph output has RMS 0.020/0.024 (audible). Space stops and the playhead holds. The Play button keeps its name; `data-playing` goes false→true→false.
- Export WAV: 48 kHz, 24-bit, stereo, 16.000 s. sha256 equals the round-279/280 reference `1fea093b…`; 0 NaN; peak 0.2967; −24.9 dB in every second (no dropouts). 0 page errors.

### Environment note (not a bug)
The untimed warm-up after the perf builds and mutant runs did not reach `Demo collection ready` within its 180 s limit (`warmup.txt`). This is the L38 cold-start pattern (INFO-C279/INFO-C280). The timed probes that followed loaded in 11.2 s and 5.6 s. Every timed row ran after the warm-up, so no row is environment-invalid and no replacement attempt was used.

## Ableton conformity
Not applicable (harness, test-only round; the task exempts reference-first). The CZABA requirement is met. Ableton conformity: არ ეხება.

## §L29 sweep classification (`l29-untagged.txt`, 32 hits)
| Group | Hits (task lines) | Ruling |
|---|---|---|
| Section headings that name the file being changed | 69, 87, 108, 123 | not facts; exempt |
| Grant and not-granted path lists, frozen list | 213, 214, 216, 312 | scope rules; exempt |
| Instructions for new content (doc 210, l.4 string), commands to run | 226, 247, 248, 260, 272 | instructions; exempt |
| Claims-block rows (K2…K20, SW-B, SW-C) | 321–342 | these are the tags; re-run in CLAIMS |
| B's measured browser table | 57 | evidence = `b-round-280/failed-status-probe.json`, `failed-other-probe.json` (loop artifacts); exempt |
| Diff fact with an inline command | 143 | self-evidenced. C re-ran `git diff --quiet 1dbf3af 145f6c1 -- …`: rc 0 |
| Doc 208 l.18, l.34, l.71 "stay as written" | 264 | **untagged fact about a file under `store/`**. C verified it true with `sed` (each line describes the round-279 `waitForCollectionReady`). Recorded as **C-R281-01** (Low, planning) |

C does not fail the round on C-R281-01. The rule's purpose, a re-runnable premise, was met by C's re-run, and the premise holds. A FAIL would re-dispatch an unchanged, fully verified implementation. Precedent: INFO-C268-HEAD-DRIFT (when the substance held, C recorded a note instead of a planning FAIL). **For B/RETRO:** decide whether L29 should exempt doc-line references inside "stays as written" protection clauses, or require a `[K#]` tag for them.

## Bugs
- **C-R281-01 (Low, planning, B):** task l.264 cites doc 208 l.18/l.34/l.71 without a `[K#]` tag. Evidence: `c-round-281/l29-untagged.txt`, plus the `sed` output in this report (all three lines are true at the tree).

No implementation bug was found.

## Open items carried forward (acknowledged, not C bugs)
- A-R281-REVIEW-SETTLED-GROUP (Low): the settled pattern's `|` join without groups.
- A-R281-REVIEW-STATUS-REREAD (Low): a second `textContent` read after `toHaveText`.
- B-R281-RESOURCES-READY-FAILED (Low signal). In C's MU-FAILED-OTHER, the library-ready wait caught the non-selected failure in 6/6 PERF-1a passes. PERF-1b-ii still has no status wait.
- ROOT-REQ-PERF-TIMEOUT: PERF-1a took 7.1 min (≈ 47 % of the 15 min limit).

## Verdict
**PASS.** Every §8 row passed: 15 rows plus HEAD-CONTROL evidence; gate rows are excluded. `browserVerified` = `realVerified` = true: PERF-RUN, both halves of DETAIL-LANE, FAILED-SOURCE, FAILED-OTHER, STATUS-WAIT and G281-AUTH ran in a real Chromium. Nothing was backend-blocked this round. Per §11, GATE279-S1, B-R280-CLICK-LIVE-LANE-ID and A-R279-REVIEW-LANE-NULL can close after the gate publishes.
