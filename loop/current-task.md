# CURRENT TASK — Round 342: REGRESSION-ROUND-2026-11-05, part 3. C runs a closed list of the remaining rows. A changes nothing

Dispatcher: B · Implementer: A (no change; baseline report only) · Verifier: C · Planned 2026-11-05 (after the round 341 C phase).
Decisions: **D-29z1067 … D-29z1074** (`backlog.json` v301 → `decisions_log_b`, `rounds[342]`, `regression_rounds` id `REGRESSION-ROUND-2026-11-05`).

**Read first:**
- `lessons.md` in full, especially:
  - L38: perf runs alone;
  - L57: all harness fields;
  - L59: do not end the C phase early (now 2×);
  - **L60 (new): destructive commands stay inside `c-round-342/`, with absolute paths.**
- Row definitions:
  - `tasks/round-340.md` (§4d l.110 WORKER-R2; §5 l.117–127 parked rows);
  - `tasks/round-301.md` (l.101 R301-PRICE);
  - `tasks/round-258.md` (§4.S l.168–174);
  - `tasks/round-341.md` §2 (the setup rules: mock as step 2, one dev server, warm-up, copying scripts, budget).
- Round 341's run: `c-round-341.md`, `c-round-341.json`, `c-round-341/`. B's reasoning: `b-round-341.md`.

## Baseline: unchanged, HEAD `99a5912`, clean tree
- Gate 341 is `skipped` ("no real changes", `gates/gate-round-341.json`), so nothing was published. The baseline is still `99a5912`, the gate-339 publication.
- At start and at end, from `store/`:
  - `sha256sum -c ../tmp/studio-real-loop/b-round-339/r340-tree-sha256.txt` (0 failures);
  - the claims `b-round-339/claims-r340.sh` (only K6, the mock port, may differ once the mock is up);
  - protected files `b-round-318/protected-sha256.txt` (11/11 OK).

## 0. Why this round (D-29z1067, D-29z1074)
Rounds 340 and 341 ran the bulk of the regression: every run row PASS, 0 Medium+, 2 Low. But C ended round 341 itself (`stopSignal: none`) with rows that had a script still unrun, so `browserVerified` is false.

Under the round-341 outcome table this is "a browser row that could run here did not run", not "every row has a result". So `regression-last.json` is **not** updated yet, and the remainder runs now. Ruling these rows away would shrink the regression after the fact.

PERF-DRAG-PREVIEW c4-ii moves to round 343. Its three patches still apply cleanly on `99a5912` (B checked with `git apply --check`).

## 1. A — no code or doc change
- From `store/`: HEAD must be `99a5912…` and `git status --short --untracked-files=all` must be empty. Otherwise, write "STOP — baseline differs" in `a-round-342.md` and change nothing.
- Write `a-round-342.md` with the HEAD, the status output and "no change by design (REGRESSION remainder, D-29z1074)".
- Run no checks. Do not touch :5173, the mock or a browser.

## 2. B rulings that close round-341 rows (do not re-run these; D-29z1068)
| Row | Ruling |
|---|---|
| R340-OVERVIEW-METER sub-check "press L" | **VOID.** This was B's spec defect. `SA-14` is the tag of RR-STRIP (`tasks/round-258.md` l.189), and the Studio has no bare `L` key: loop is `Ctrl+L` (`app/lib/arrangement/shortcuts.ts` l.49–52). C's 23-sample OVERVIEW PASS already covers the invariant (a fade preview leaves the overview alone, a move preview moves its bar) |
| R340-FONTS FONT-PIXEL | **Retired as a regression row.** The round-317 pixel oracle predates later UI changes. C's `c-round-341/out/fonts/` screenshots on `99a5912` become the baseline for the next regression. "/s/" was B's wording: the build serves woff2 from `/assets/`, as in round 317 |
| RR-OSS full licence suite | Gate row (`gates/round-N/verify.log`); it is not a C gap |
| RP-NOBPM-RULER, C-R341-01 (= C-R318-06) | Done in round 341. C-R318-06 is now in `deferred_low_polish` with C's evidence (D-29z1069) |

## 3. C — the closed row list
**Every row below names its script, its output redirect and its oracle. "No replayable script" and "row not defined" are not available statuses.** The only allowed results are:
- PASS;
- FAIL (opens a finding);
- inconclusive after the budget (2 replacement attempts for environment-invalid runs only), with the logs;
- BLOCKED, where the row says it is allowed;
- **recorded**, for the record rows 7, 8 and 9. A recorded observation is a complete result.

The run order, rules and mock handling are as in `tasks/round-341.md` §2.

Setup:
- **Mock as step 2:** check `/__mock/health` on :5199. Use the runner's mock if it returns 200; otherwise start it yourself and save its PID to `c-round-342/mock.pid`.
- **One dev server only:** :5173.
- **Warm up in a browser** first.
- **Write all outputs under `c-round-342/`.** Copy every script into `c-round-342/tools/` before you run it. Changing a script's output path or `__dirname` sink to point into `c-round-342/` is a **lookup**, not a deviation. Never write into an older round's folder.
- **Write `c-round-342/progress.json` after every row.**

| # | Row | Script → output | Oracle / pass rule | Allowed non-PASS |
|---|---|---|---|---|
| 1 | SOURCE-SCOPE start | as Baseline | 0 failures, 11/11 | FAIL only |
| 2 | **R342-WK-GUARD** (WK-GUARD-PROXY) | No new run is needed if C's own round-341 outputs `c-round-341/out/wk/proxy-{throw,short}-1440.json` (produced by `browser-probe-311.cjs` against the local worker proxy) are the WK-GUARD-PROXY probe. C confirms that by reading `c-round-311.md` l.12 and the probe source, then compares each step with l.12. If they are not that probe, run it: copy `c-round-311/run-wk.sh`, set `C=` to `c-round-342/wk` (lookup) and run the proxy tags as in round 311 | Every step equals `c-round-311.md` l.12 and `c-round-311/proxy-{throw,short}-1440.json`, ignoring timestamps and the port | BLOCKED only if the proxy cannot start (attach the log) |
| 3 | **R342-WK-HEAD-CONTROL** | the copied `run-wk.sh` with `c-round-311/head-r2-proxy.mjs` as the worker path, tag `headctl-throw`, probe 311. Take the `R2_*` env values from `c-round-311.md` and `c-round-311/wk-summary-311.txt`, and from the `proxy-throw-server.out` header. If the round-311 invocation cannot be recovered, the row is **inconclusive** with the log, never "undefined" | It equals `c-round-311/headctl-throw-1440.json` and `c-round-311.md` l.15: hugeEnd, hugeEnd20 and hugeSuffix give 500 h1g1; rereadInm 200 h0g2c1; rereadFarInm 200 h1g2c0. It is a control: it must **differ** from row 2 | as row 2 |
| 4 | **R342-RS-1280** (RS-1A … RS-1D at 1280) | copy `c-round-301/t258/s186/tools/` and run `c186-store.cjs 1280` (the 1280 line of `t258/tools/run-store.sh`). The mock has no gift-card product, which round 301 already recorded as noise (`rec-rs1.cjs`). Guard the gift-card screenshot step so a missing element is recorded as "absent in mock" instead of crashing; that is a lookup | the RS-1A … 1D-1280 rows of `c-round-301.md` and their t258 logs. Only diffs explained by the round-340 §2 UI facts (lookups) are allowed | inconclusive after the budget |
| 5 | **R342-RS-MAP** (RS-2A, RS-4B, RS-HIDDEN, RS-LM; both viewports) | Round 341 ran these logs (`c-round-341/t258/`) but did not map rows. Map each one using `c-round-301.md` l.165–174: RS-2A ← s195 rs2a + guest195; RS-4B ← t203 sweep/errborder + mousering; RS-HIDDEN ← t204; RS-LM ← t205. Re-run a log only if it is missing | 0 normalised diff lines vs round 301, as the c-round-301 lines state | inconclusive |
| 6 | **R342-RG22-NARROW** (RG-22-390 narrow half) | copy `c-round-301/tools/narrow/rg22n.cjs`; its sink `path.join(__dirname,'rg22n.json')` becomes `c-round-342/out/rg22n.json` | `c-round-301/tools/narrow/rg22n.json` | inconclusive |
| 7 | **R342-RP301** (RP-MENU-SHEET, RP-LINK-NATIVE-MENU, RP-LINK-DRAG; record) | copy `c-round-301/tools/rp301/rp301.cjs`; sink → `c-round-342/out/rp301.json` | `c-round-301/tools/rp301/rp301.json`. Record; a difference is a finding only if it changes behaviour | — |
| 8 | **R342-RP-BUILT** (RP-C301-01, RP-FOLD-SELECTION, RP-SAME-TEXT-RACE, RP-GATE328-S1, RP-C331-01; record) | build one small Playwright script per row from its row text in `tasks/round-340.md` l.121–127 (state → exact action → read). Save the scripts under `c-round-342/tools/rp/` | Record what you observe, as each row says (Low unless the row says otherwise). For RP-FOLD-SELECTION record the observation only; no Live parity claim | — |
| 9 | **R342-POSCTL** (NO-CHANGE posctl, record) | copy `c-round-308/posctl-probe.cjs`; run it once per viewport on HEAD | The `c-round-308` oracle is `valid=false` (D-29z1068). Record your run, including its `valid` flag, as the new oracle for the next regression. It is not a decision row | — |
| 10 | **R342-PRICE** (R301-PRICE, mock; **the last store row**) | `c-round-301/tools/price/` (`mock-c288.mjs`, `product-probe.cjs`), as in `c-round-301.md` l.42: stop the standard mock **by its PID**. If you did not start it, find the runner's PID with `lsof -t -i :5199` or `pgrep -f mock-api/server.mjs`; stopping it is allowed for this row only, and you record the PID, start `mock-c288.mjs` on :5199, run the c288 `probe.cjs` replay and the c286 product-probe (known), then **restart the standard mock** and check health 200 before row 11 | B-KNOWN: door-slams $9.00, middle-east $29.00, no `$0.00`. B-UNKNOWN/B-VERSION-CARD: priceless-track shows "Price unavailable" and Add/Buy are `aria-disabled=true`. B-FREE: free-pack $0 and its buttons are enabled. Both viewports. Mock-only client path | inconclusive |
| 11 | **G342-AUTH** | copy `c-round-340/tools/g340-auth.cjs` | Anonymous `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token`: no header 401, bare 400, fake Bearer **403** with the mock. No token in any body. `/studio-lab` opens anonymously with the demo badge | FAIL only |
| 12 | SOURCE-SCOPE end | as row 1; stop only the PIDs you started | 0 failures | FAIL only |

RR-PERF and RG-SMOKE are not re-run: round 341 passed both on this unchanged HEAD.

## 4. Outcome, fixed in advance (D-29z1074)
| C result | B at the 342 → 343 planning |
|---|---|
| Rows 1–12 all have an allowed result and there is no Medium+ finding (Lows go to `deferred_low_polish`) | `regression-last.json` = `{"date": <C's completion date>, "round": 342, "note": "REGRESSION-ROUND-2026-11-05 ran in rounds 340-342"}`. Round 343 = **PERF-DRAG-PREVIEW c4-ii** from `b-round-339/current-task-c4-ii-draft.md`. Its carry-forward is applied to 343: the last published gate is still 339, so K1 stays `gate-round-339.json`. "round 340" becomes 343, and the budget notes are regenerated with `apply-budgets.py` |
| Any Critical, High or Medium finding | Round 343 = a bounded fix-up (≤ 3 related bugs), with re-runs of the failed rows. `regression-last.json` is still updated if every row has a result. c4-ii follows, re-checked on the new HEAD |
| A job limit kills C with rows queued | The same phase resumes from `progress.json` |
| C ends the phase itself with a row still queued | `browserVerified` is false and B re-plans that row. The stop must be named in `stopSignal` |

No item changes status from this round, and nothing becomes "მზადაა".

## 5. Neighbour risk
| Risk | Check |
|---|---|
| The PRICE mock swap leaves :5199 down or on the c288 data for later rows | PRICE is the last store row; the standard mock is restarted, and health is 200 before G342-AUTH |
| The worker proxy port collides with :5173 or :5199 | Use the round-311 ports, or another free port (lookup) |
| A replayed script writes into an old round folder, or a cleanup deletes evidence | L60: sinks are redirected into `c-round-342/`; `rm` and `find` use absolute paths under `c-round-342/` only |
| The store tree changes | SOURCE-SCOPE and `sha256sum -c` at start and at end |

## 6. Deliverables
- **A:** `a-round-342.md` (baseline only).
- **C:** `c-round-342.json` with `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `notRun`, `gate`, `bugs`, `observations`, `invalidRuns`, `lookups`, `stopSignal`, and all L57 fields (`null` with a reason where there is no sketch). Also `c-round-342.md`, `c-round-342/progress.json`, and evidence under `c-round-342/{tools,out,shots}`.
- **Every bug gets:** an id `C-R342-NN`, a severity, the item, the steps, the evidence path, "regression yes/no" with the round of its last pass, and its origin.
- **Gate rows, not claimed by C:** full vitest, typecheck, build, Biome and `npm run verify`.

## 7. Root notes
- No source change is expected. Nothing is published when no source changed.
- **INFO-C341-DELETE-MISTAKE:** in round 341, C deleted untracked evidence WAVs across older round folders. They cannot be restored from the loop repo. From now on, any oracle that compares WAV bytes (rather than a sha saved in JSON) regenerates its reference first. B deleted and restored nothing.
- **Frontend-architect checkpoint:** `ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE` is still planned for after c5. It is not due now.
- **Still open for root:**
  - checkpoint D-29z915;
  - ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1);
  - R80-RECORDINGS-FIELD-BORDERS.
