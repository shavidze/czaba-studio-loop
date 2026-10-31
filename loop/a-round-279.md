# A round 279 — PERF-HARNESS-SHARED-LIB-b-ii-1 (test-only)

No STOP. Every §10 condition was checked and none was hit.

## Changed files (all within §5 grants)
- `perf/lib/page.ts`, `perf/lib/app-labels.ts`, `perf/studio-lab.perf.spec.ts`, `perf/studio-lab-interactions.perf.spec.ts`, `perf/studio-lab-resources.perf.spec.ts`. I applied `b-round-278/sketch.diff` to clean HEAD `873d835` with `git apply`. All five files are byte-identical (`cmp`) to `b-round-278/sketch-final/`, so HUNK-SCOPE has no semantic or formatting difference. My diff is saved as `a-round-279/a-perf.diff`.
- `docs/implementation/2026/quarter-IV/208-perf-harness-state-waits.md` (new). l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 279 PASS)`. The seven TEMPLATE headings are in order.
- Doc 175: only the `### Helper-ების რუკა` section, the `### GATE214-S2` section (renamed to "შესრულდა round 279-ში …") and the b-ii TODO bullet.
- Docs 168, 169 and 176: only the b-ii TODO bullet in each.
- `sha256sum -c b-round-278-r279-tree-sha256.txt` returns rc 0. `git status --short` shows 9 `M` and 1 `??` (doc 208), all §5 paths.

## Commands and results
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npm run lint` | rc 0 (205 warnings and 1 info; app scope only, does not cover `perf/`) |
| SW-A (`emptyLanePoint\|idleSettleMs\|waitForQuiet\b` in perf/app/e2e, excluding the specs and page.ts) | 0 hits |
| `grep -rn test.setTimeout perf` | 0 |
| KEEP-WAITS | 1a: l.581 `waitForTimeout(2000)`, l.599 `idleSettleMs`, l.602 `idleMeasureMs`. 1b-ii: l.181 (300), l.346 `observerSettleMs`, l.528 `idleSettleMs`, l.663 (poll). 1b-i: no `waitForTimeout` |
| PERF-RUN `CI=true npx playwright test --config playwright.perf.config.ts`, run alone | **3 passed (12.8 min)**: 1b-i 5.1 min, 1b-ii 1.0 min, **1a 6.4 min (43 % of 15 min; under 9.4)**. Playwright 1.57.0, Chromium 143.0.7499.4. Log: `a-round-279-perf.log`. Reports: `a-round-279/results/` |
| equiv-check 1a | rc 0: `PERF-1a: rows 316, deterministic 166, problems 0` |
| equiv-check 1b-i | rc 0: `PERF-1b-i: rows 144, deterministic 106, problems 0` |
| equiv-check 1b-ii | rc 0: `PERF-1b-ii: rows 61, deterministic 37, problems 0` |
| :5173 after all runs | 200 (the perf config uses its own :5188 production server) |

In all three reports, `complete` is true, `failures` is `[]`, and no pass has `abortedAt` or `problems`. I did not need the same-machine HEAD re-run, because equiv-check reported 0 problems.

## Mutants (§6.2)
Each mutant ran on a scratch copy at `/tmp/a279-mut/<id>`: `git archive 873d835`, plus `a-perf.diff`, plus the mutant, with node_modules symlinked. Only the named spec ran, one at a time. Runner: `a-round-279/run-mutant.sh`. Evidence: `a-round-279/mutants/<id>/{mutant.diff,run.log,latest-*.json}`.

| Id | Spec | Result | Signal observed (pass 1, 1×) |
|---|---|---|---|
| MU-READY | 1b-i | red ✔ | `abortedAt` `load`, `expect(locator).toHaveText(expected) failed` |
| MU-CAP | 1b-ii | red ✔ | problems `export 1: dialog open: no 200 ms without commits or start() calls within 3000 ms` (and export 2) |
| MU-PLAY | 1b-i | red ✔ | `abortedAt` `play with 30 clips` (toBe) |
| MU-LANE | 1b-i | red ✔ | `abortedAt` `clip click`: "no lane after the clip's lane music has an empty timeline point" |
| MU-OBS-1 | 1b-ii | red ✔ | `abortedAt` `export 1 clip`, problems only `aborted at export 1 clip: MU-OBS-1` (no "was not released") |
| MU-OBS-2 | 1b-ii | red ✔ | problems include `export 1: the "WAV created" observer was not released` |
| MU-OBS-3 (control) | 1b-ii | green on that line ✔ | problems only `aborted at export 1 clip: MU-OBS-3` |

## code-reviewer (actual subagent): score 9/10, 0 Critical/High/Medium, 8 Low
- Fixed in my granted docs:
  - **#1:** both doc 208 mentions are fixed (the კონტექსტი paragraph and the პრობლემები bullet). Doc 208 now says that at HEAD the real leak was the observer (a throw at the `timeOrigin` evaluate). The poll loop had no realistic throw before the `try`; the move only protects against code inserted there later. Task §2.4's "wider leak" wording overstates HEAD. For B: the code change still stands.
  - **#7:** the 175 table now notes that `isPlaying` is also used by `waitForPlaybackSettled`.
  - **#8:** the label of the doc 208 mermaid decision node is fixed.
- Not changed, to keep the code equal to B's sketch for HUNK-SCOPE (for B):
  - **#2:** when the clip has no lane, the error text reads "lane null".
  - **#4:** `page.ts` l.78 is about 105 characters, and the `collection` import is out of order. Biome does not cover `perf/`.
  - **#5:** `waitForQuietState`/`QuietWaitResult` are exported but used only inside the lib.
- Watch item **#3:** the new waits fail loudly when the 3 s cap is hit (for example a slower runner at `play with 30 clips`). This is by design, and it was 0 in this run.
- Outside my grant (for B), **#6:** doc 175 `### დახურული Low-ები` GATE214-S3 still says `quotedAttributeValue` builds the lane selector. That selector was deleted with `emptyLanePoint`, and only `clipById` uses it now.
- **Architecture note (proposal for B/root, not done):**
  - The kept measurement-defining waits look identical in code to the settle waits this round replaced.
  - `idleSettleMs` is declared 3 times with two meanings: a measurement definition in 1a and 1b-ii, and the `minMs` of a quiet wait in 1b-i l.542.
  - Proposal: one bounded test-only task to rename them by role (for example `hookLiveWindowMs`, `playIdleSettleMs`, `readyHeapSettleMs`), accepted when equiv-check shows 0 problems. The coupling to `collection.ts` and the status testid is already recorded as B-R279-PERF-READY-WAIT-DUP.

## Known gaps / notes for B
- D-29z254's "write the chosen lane id into the click-live detail" was not done. The §2.5 contract forbids changes to row fields. Doc 208's TODO records it.
- Single runs only. C's EQUIV/PERF-RUN replicate on C's machine.
- I did not run the full vitest suite, `npm run verify`, the build gate or the e2e smoke (speed rules; those are gate rows).

## Acceptance I actually passed (A side)
SOURCE-SCOPE (sha rc 0, status paths), HUNK-SCOPE (byte-identical to sketch-final), SWEEP, KEEP-WAITS, TYPECHECK, PERF-RUN 3/3, EQUIV ×3 (0 problems), MUTANTS (all 7 signals), TIMEOUT-DATA (1a 6.4 min), DOC-208 (l.4 and headings, self-checked). C still owns: CLAIMS, LANE-BROWSER, G279-AUTH, and an independent re-run of all rows.

## Next C checks
1. SOURCE-SCOPE / HUNK-SCOPE: `cmp` the five perf files against `b-round-278/sketch-final/`.
2. Run TYPECHECK, then PERF-RUN alone, then the three equiv-checks.
3. Re-run MU-LANE, MU-OBS-2, MU-OBS-3 and MU-READY. `a-round-279/run-mutant.sh <id> <spec>` can be reused.
4. LANE-BROWSER with `b-round-278/probe/lane.cjs` against :5173.
5. G279-AUTH at both viewports.
6. DOC-208, and the 175 helper table against `page.ts`.
