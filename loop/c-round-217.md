# C round 217: verification of the PERF-1b-ii fix-up (C-R216-01, C-R216-02, D-29z219)

**Verdict: PASS.** Every row in `current-task.md` §3 passes, and C found no bugs. All three real-browser rows ran: PERF-RUN-217, G217-3 and STUDIO-SMOKE-217. So `browserVerified` = `realVerified` = true. No row is blocked. C does not claim the `gate` row.

All evidence is in `c-round-217/`.

| Row | Result | Evidence |
|---|---|---|
| SCOPE-217 (start + end) | PASS | below; `grants-end-sha256.txt` |
| BUDGETS-217 | PASS | `budgets-diff.txt`, `budgets-diff.cjs` |
| DOC-217 | PASS | `doc169.diff`, `doc-check.txt`, `doc-check.cjs` |
| PERF-RUN-217 | PASS | `perf-run-1.{log,json,rc}`, `perf-compare.txt`, `sentinel-*.txt` |
| REDPROOF-217 | PASS | `cm1-polls1000.{log,rc}`, `c217-mutant-polls1000.json`; A's `a-round-217/mutant-flaky.log` |
| AN-REVIEW-217 | PASS | `typecheck.log` |
| G217-3 | PASS (run 1 hit an environment timeout at 1440; see below) | `g217.json`, `g217-run1.json`, `g217-guard-1440-diag.json`, `shots/g-*.png` |
| STUDIO-SMOKE-217 | PASS | `g217.json`, `shots/smoke-*.png` |
| gate | not claimed by C | `gates/gate-round-217.json` (root) |

## SCOPE-217
- **Start and end:**
  - HEAD is `eb9e76e1bc2b41f6ec1a3e083a391d05cb1a844f`, with no `chore(deps)` commit on top.
  - `git status --short --untracked-files=all` shows exactly 4 M (docs 160, 161, 162 and 168) and 3 ?? (doc 169, `perf/budgets.resources.json` and `perf/studio-lab-resources.perf.spec.ts`).
  - `sha256sum -c --quiet b-round-216-r217-tree-sha256.txt` returned rc 0 at both points. So the spec and the 4 SYS-4 docs are byte-identical to their round-216 state.
- **Grants:**
  - The start hashes match `b-round-216-r217-granted-start-sha256.txt` (76c89…, f9ea4…).
  - The end hashes are `4b23cc3f…` for the budgets file and `c5bca50f…` for doc 169. Both equal A's reported end hashes, and both are unchanged after all of C's runs.
- **Cleanup:** I removed the sentinel files I had created. `test-results/` is gitignored, and only the spec's own outputs remain there.

## BUDGETS-217
I compared every field of every row against `b-round-216/r217-granted-start/budgets.resources.json` (script output in `budgets-diff.txt`).
- **Structure:**
  - Both files have 61 rows, with the same ids in the same order.
  - The key order of every row is unchanged.
  - The file still parses as JSON.
  - `git diff --numstat` shows 14/14 lines: 5 `kind` lines and 9 `note` lines. The formatting is preserved.
- **Exactly 9 rows changed, and only in `kind` or `note`:**
  - **The 4 `mem-polls` rows** changed from `deterministic` to `wallclock`. Each note ends with the exact §1.1 sentence and the ranges 7–9, 13–15, 9–12 and 17–20 (en dash). `mode` is still `assert` and `budget` is still `{">=",5}`.
  - **`res.mem.used-ready-mib`** changed from `wallclock` to `deterministic`. The old sentence was replaced word for word with the §1.2 sentence, and the rest of the note is unchanged.
  - **The 4 `peak-backing-delta-mib` notes** (1/2, 1× and .6x) changed only the phrase "polled every 50 ms in the window" to "polled in the window (at most every 50 ms) plus one window-end sample".
- **Unchanged rows:**
  - `res.export.2.longtasks-over-50` is still `wallclock`.
  - All 11 `clips-*`, `export-*-produced` and `js-*-seen` rows are still `deterministic`.

## DOC-217
- **l.4:** exactly `**სტატუსი:** Completed (C round 217 PASS)`, checked byte for byte.
- **`##` order:**
  - The headings run კონტექსტი 7, მიდგომა 11, **არქიტექტურა 88**, გაზომილი 105, Findings 173, შეცვლილი ფაილები 180, პრობლემები 187, ტესტირება 197, TODO 203.
  - All 7 TEMPLATE headings (l.29–47) appear in TEMPLATE order. The 2 extra sections sit after არქიტექტურა.
  - `## არქიტექტურა` comes directly after the end of `### GATE206-S5` (the end of მიდგომა).
- **Mermaid block:**
  - It appears exactly once, inside `## არქიტექტურა`, after "Pass-ის ნაკადი:".
  - It is byte-identical to the start copy's block (regex compare).
  - It was removed from after `### Pass-ის თანმიმდევრობა`.
- **The diff touches only §2 (a)–(f).** Each hunk maps to one item:
  - (a) l.4.
  - (b) The Mermaid block was removed and then inserted under the new heading.
  - (c) The determinism subsection now has three rules: the count rule (§2.5), the 0.1 MiB rule (D-29z219) and the poll-count rule (D-29z219), the last with the set-membership exception. The table lists `longtasks-over-50` and the 4 `mem-polls` rows with the round-216 ranges. `used-ready-mib` left the table, and a sentence records its return.
  - (d) The intro sentence of `## გაზომილი` now names the 0.1 MiB rule and says the `mem-polls` rows are wallclock. The 5 kind cells were changed.
  - (e) The `mem-polls-N` metric row now reads "(liveness; wallclock, D-29z219)".
  - (f) One Problem → Solution line for C-R216-01 and C-R216-02.
  - Nothing else changed.
- **Kind and mode cells:** all 61 table rows match the budgets file's `kind` and `mode` (0 mismatches).
- **Cited ids (L26):** 68 distinct `res.*` tokens. 61 are real ids, and all 61 exist in the budgets file. The other 7 "missing" hits are not ids: they are wildcard prefixes (`res.export.1.*`, `res.mem.*`, `res.harness.js-*-seen`, …) on unchanged lines 16, 17 and 27.

## PERF-RUN-217
I placed sentinel `latest.json` and `latest-interactions.json` files in `test-results/perf/` (mtime 2026-10-01, 20 B). Then I ran `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` once, alone. The dev server on :5173 stayed idle, and no build was running.
- **Run:**
  - rc 0, 1 passed (1.2 m).
  - `durationMs` 60,713 (well under 8 min).
  - `complete: true`, `failures []`.
  - `reactRenderer` 18.3.1, Chromium 143.0.7499.4.
  - `budgetsFile` was `perf/budgets.resources.json`.
- **Rows:** 61 rows × 3 samples each, with no NaN.
- **Deterministic medians:** the new deterministic set has 38 rows. It now includes `used-ready-mib` and no longer includes the 4 `mem-polls` rows. All 38 medians equal C round 216's run 1 and run 2 medians: 0 diffs (`perf-compare.txt`).
- **`used-ready-mib`:** [5.1, 5.1, 5.1]. It passed the in-run determinism check now that it is back in the deterministic set.
- **`mem-polls` samples** (all ≥ 5):

  | Row | Samples |
  |---|---|
  | `-1` | [7, 8, 8] |
  | `-2` | [16, 15, 14] |
  | `-1.6x` | [12, 13, 13] |
  | `-2.6x` | [21, 21, 22] |

- **Peak rows:**

  | Row | Samples |
  |---|---|
  | `export.1.peak` | [65 ×3] |
  | `export.2.peak` | [129.9 ×3] |
  | `.6x` 1 | [65, 65.1, 65] |
  | `.6x` 2 | [129.9 ×3] |

  `export.2.longtasks-over-50` was [0, 0, 0].
- **Sentinels:** unchanged in mtime, size and sha after the run (`sentinel-before.txt` and `sentinel-after.txt`), and still unchanged after the mutant run (`sentinel-after-mutant.txt`). Afterwards I restored `latest-resources.json` from the passing run.

## REDPROOF-217
- **A's mutant** (`a-round-217/mutant-flaky.log`): rc 1. The log shows `Error: budgets[26].kind must be deterministic or wallclock` (thrown at `perf/lib/budgets.ts:59`). The run failed at load, with no hang.
- **C's mutant:** `/tmp/c217-mutant-polls1000.json`, which is the live budgets file with only the `res.harness.mem-polls-1` budget value changed to 1000. I ran it with `PERF_BUDGETS_RESOURCES`.
  - Result: rc 1 after about 74 s, with no hang.
  - The report's `budgetsFile` is the `/tmp` path.
  - `failures` is exactly `["assert failed res.harness.mem-polls-1: measured median 8 [8, 8, 8], budget >= 1000"]`.
  - `mem-polls-1.6x` still passed, with [12, 12, 11].
  - So the relabel to `wallclock` did not disable the assert.
- The store budgets file's sha was unchanged before and after the mutant run.

## AN-REVIEW-217
- `npm run typecheck`: rc 0.
- `JSON.parse` of the budgets file: ok, 61 rows.
- Biome is not claimed for `perf/` (L30).

## G217-3
Fresh contexts with no credentials, at 1440×900 and 1280×720. The final evidence is `g217.json`, from run 2 of the same script (a copy of `c-round-216/g216.cjs`).
- **`/studio-lab`:** opens anonymously with the "Demo collection — no sign-in required" badge. The workspace (ruler) renders, and `localStorage.auth_user` is null.
- **`/studio/middle-east`:** shows "Sign in required", with 0 `audio[src]`, 0 `audio` elements and no workspace.
- **`/api/studio-token?product=middle-east&file=stem1.wav`:**
  - no header → 401 `{"error":"Please sign in to access Studio."}`;
  - fake Bearer → 500 `{"error":"Unable to prepare Studio access"}`. The :5199 mock is not running (`curl` got no connection), and the task allows 500 in that case.
- **No token is issued** at either viewport. Premium auth is not bypassed.
- **0 page errors.**
- **Environment note (run 1), 2× recurrence (C round 216, C round 217):**
  - **Fact:** in run 1, the first 1440 guard step threw `page.waitForFunction: Timeout 30000ms exceeded`. This was the first dev-server navigation after the perf runs. `goto` with `waitUntil: 'load'` had already returned. The 1280 guard and both smokes in the same run passed (`g217-run1.json`). A 1440 diagnostic re-run with per-step timing (`g217-guard-1440-diag.json`, 2/2) reached `readyState` "complete" within 3.5 s on both pages, with the same results. The full script's run 2 was clean at both viewports. C round 216's first 1440 attempt failed at the same point (`document.body` null).
  - **Inference:** this is a harness or environment issue on the first navigation, not an app defect. No screenshot or measurement points to the app.
  - **Hypothesis (unconfirmed):** the page's execution context was torn down after `load`, for example by a Vite dev-server full reload after dependency re-optimisation. B may give the shared G/smoke script a warm-up navigation.

## STUDIO-SMOKE-217
On the dev server, in a fresh context, with the real mouse (move, down and up at element centres), at both viewports:
1. Add the demo clip: 1 audio clip appears.
2. Click Export. It is visible at both sizes: at 1440 its box starts at x 1362, y 43; at 1280 at x 1202, y 81.
3. WAV is checked by default. Click "Export WAV".

Both viewports, in both runs:
- **Download:** `czaba-studio-lab.wav` arrives.
- **Header:** RIFF/WAVE, PCM 1, 2 ch, 48,000 Hz, 24-bit, blockAlign 6. The data chunk is 29,189,376 B, which is the file size minus 44.
- **Length:** 4,864,896 frames = 101.352 s. That is **0 frames** from "WAV created: 01:41.352".
- **Real audio:**
  - RMS is −15.29 dBFS, and 99.77 % of samples are non-zero.
  - The RMS of each 10 s segment rises from 0.075 to 0.22.
  - The tail is 0.0001, which matches the end of the demo source.
- **Errors:** 0 page errors. The only console errors are the expected cloud ones (cart / `ERR_CONNECTION_REFUSED`).
- **Done** closes the dialog.
- **Known info, not new:** the dialog shows "Overload: peak +0.0 dBFS — 14 samples clipped". This is C-R86-OBS-DEFAULT-OVERLOAD, the same as round 216.

## Ableton / product
- **Ableton conformance:** not applicable. This is a docs and harness-label round (policy "Not in scope").
- **CZABA requirement:** the PERF-1 baselines are unchanged.
- **User flow:** the user flow (find the demo sound → Add → Export WAV → a real file) still works in the real browser. Video fitting was not part of this round's change and was not re-tested.

## For B
- **`mem-polls` observations now sit outside the "round 216" ranges in the notes.** This is not a failure: the notes say "observed in round 216", the rows are `wallclock`, and the `>= 5` assert holds. B may decide whether to widen the ranges.

  | Row | Round-216 range | A, round 217 | C, round 217 |
  |---|---|---|---|
  | `-2` | 13–15 | [16, 15, 15] | [16, 15, 14] |
  | `-1.6x` | 9–12 | [12, 12, 13] | [12, 13, 13] |
  | `-2.6x` | 17–20 | [22, 21, 21] | [21, 21, 22] |

  `mem-polls-1` stayed within its range in both rounds: [8, 8, 7] (A) and [7, 8, 8] (C).
- The §5 outcome table applies to this PASS. If B plans before 2026-10-30, the next round is PERF-16 with `root-deps-request.json`. On or after that date, it is a REGRESSION round. B decides. Root still owns ROOT-R216-LATE-SPEC-REVIEW.
