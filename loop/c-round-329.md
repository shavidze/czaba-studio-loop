# C round 329: PERF-DRAG-PREVIEW stage c1 (project-end leaves) + DP20, independent verification

**Verdict: FAIL (one acceptance clause not met; behaviour is correct).** Every behaviour and browser row passed and equals HEAD `dae81bf`: END-LIVE, DRAG-NAMES, D-ROWS with export, a viewport-bound probe C added, and G329-AUTH. The production perf run met all 36 asserted rows. The move row fell from **106.85 to 30.383** components per move.

The **PERF row's equality clause fails.** The task says "the range, fade and trim rows equal C round 328's run". On A's tree, the range rows rose by one component:
- `move-components-max`: 30 → 31;
- `move-components-per-move`: 9.233 → 9.25.

These rows are still inside their asserted budgets (≤ 35 and ≤ 15). The same +1 shows up in click, zoom and play-start/stop. C traced the cause in the browser: the new `ArrangementProjectEndText` leaf renders on every commit that renders `ArrangementTransport`, because the leaf is not memoised. B's sketch assumed that "its parent no longer renders on a move" and ran no perf. This is **C-R329-01 (Low)**. A applied B's sketch verbatim, as instructed, so the remedy is a B ruling and not an A fix.

The second finding is **C-R329-02 (Low, test gap)**. C's mutant that drops the loop from the overview extent survives. This confirms A's reviewer note A-R329-REVIEW-LOOP-EXTENT. It is not a measured defect: D-LOOP equals HEAD.

Both findings are Low, and neither blocks under the 2026-10-23 bug gate. One row clause is verified as not met, so C does not write PASS. B can close the round with one ruling.

`browserVerified` = `realVerified` = **true**. END-LIVE, D-ROWS and G329-AUTH ran at 1440×900 and 1280×720, and DRAG-NAMES ran once.

## Environment
- env-status: `store 200`, round 329, attempt 1.
- A's tree runs on `:5173`.
- HEAD `dae81bf` runs on `:5197`. It is a `git archive` copy in `/tmp/c329h` with its own Vite `cacheDir` (`/tmp/c329-head-vite-cache`, L38).
- Scratch `/tmp/c329s` is an rsync of the store (`app/` is byte-equal) with its own git baseline. It is used only for unit, mutant and perf runs. For the build, its `vite.config.ts` got `cacheDir: '/tmp/c329-scratch-vite-cache'`.
- The first `:5197` warm-up timed out on the cold compile (240 s). It was environment-invalid and replaced (`warm.log`).
- Source sha is the same at the start and end (`source-sha-{start,end}.txt`). The claims are stable (`claims-end.txt` = `claims.txt`). `git status --short` lists exactly 4 M at the end, nothing untracked, and HEAD is `dae81bf`.
- C changed no application source.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | **PASS.** Run first, byte-equal to `a-round-329/claims-after.txt`. It differs from `claims-329-sketch-output.txt` only in K2 `dae81bf 4`, K8 `11` and K11 (the new l.4), which is the allowed set. K10 = `163 24 3`. Took about 1 min | `c-round-329/claims.txt`, `claims-end.txt` |
| SOURCE-SCOPE | **PASS.** 4 M (the 3 patch files and doc 232), nothing untracked. `git apply -R --check b-round-328/sketch/sketch.patch.txt` passes, so the patch is verbatim. Protected files: 11/11 (K8) | `source-sha-start.txt` |
| UNIT | **PASS ×3** on the scratch. `drag-preview-render` + `status-preview-store`: 27/27 on each run. DP20 (72 ms), DP21 (93 ms) and DP22 (92 ms) are present and green. L31: no test is above 50 % of its timeout; all are under 1 s | `unit-{1,2,3}.log` |
| MUTANT | **PASS.** Each of B's five mutants is red on exactly the rows in §0 (listed below). Restored: 24/24. C's own **C-MU-ENDTEXT-COMMITTED** (the leaf renders the committed end) → red on DP7 and DP21. C's **C-MU-OVERVIEW-NO-LOOP** **survives** at 24/24: see C-R329-02. Restored: 24/24, and the scratch is git-clean | `mutants-b.txt`, `mutants/c-mutants.sh`, `mutants/c-summary.txt` |
| **END-LIVE (browser)** | **PASS**, both viewports. A's whole output equals HEAD and equals B's `end-bound-head-dae81bf.json`. Values: `moves` 61, `distinctEnds` 60, `distinctExtents` 60, 4 ruler widths [5280, 5320, 5360, 5400]; `afterRelease` end 01:44.352, extent 104.352, ruler 5400 | `end-bound-a.json`, `end-bound-head.json` |
| **DRAG-NAMES (browser)** | **PASS** (1440×900, warm server). `move-moves` = [23, 2, 23, 2, 108, 2, 23, 2], equal to `names-sketch-final.json` (HEAD: [105, 2, 105, 2, 107, 2, 105, 2]). Only commit #4 (108, the ruler-widening move) contains `StudioWorkspace`, `ArrangementTransport`, `ArrangementRuler` and `ArrangementLibrary`. Every 23-commit contains `ArrangementProjectEndText`. The 2-commits are `ArrangementDetailContentInner` plus one host tag; they render no end reader at HEAD or on A, and match trim's. C reads the "contain `ArrangementProjectEndText`" clause as applying to the 23-commits. `fade-moves` [22×4] and `trim-moves` [23, 2 …] equal HEAD in counts and names. The provider rendered on no move | `names-a.json`, `names-compare.txt` |
| **D-ROWS (browser)** | **PASS.** `DIFFS 0` (HEAD vs A, both viewports), with no page errors on either tree. EXPORT: the WAV sha256 is `453d1a04…dac567` on A and HEAD at both viewports, and equal to B's run. C's own parse is below the table | `rows/rows-{a,head}.json`, `rows/rows-diff.txt`, `wavcheck.txt`, `rows/shots/` |
| §4 viewport-bound (C's own browser probe) | **PASS**, both viewports. At the minimum zoom (0.5 px/s) the timeline is viewport-bound (scrollW = clientW). A +40 px header move changes the end 20 times (01:41.352 → 03:01.352) and the extent 20 times, while the ruler width stays constant (918 / 758). Every sample, `pre` and `afterRelease` equal HEAD. The first attempt grabbed the trim edge and so tested no move. It was a probe error, kept in `vp-attempt1-trim-edge/` and replaced | `vp/vp-{a,head}.json`, `vp/vp-summary.txt`, `vp/*.png` |
| PERF | **FAIL on bullet 2 (equality); bullets 1 and 3 hold.** Details below the table | `perf-interactions-atree-results/latest-interactions.json`, `perf-rowcmp-vs-c328.txt`, `perf-interactions-atree.log` |
| G329-AUTH | **PASS**, both viewports, in fresh contexts with no credentials. `/studio-lab` shows the workspace and the demo badge, with `auth_user` null. `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`. `/api/studio-token`: no header → 401; fake bearer → 500 with no token; bare → 400. Attempt 1 timed out in the harness (the 60 s wait on the legacy page), as in C round 328. It was environment-invalid and replaced | `g329-auth.json`, `g329-auth-attempt1.log`, `shots/` |
| DOCS | **PASS.** Details below the table | grep this round |

**MUTANT: B's five mutants**
- MU-WORKSPACE-RAW-END → DP21, DP22.
- MU-WORKSPACE-COMMITTED-END → DP22.
- MU-OVERVIEW-COMMITTED-END → DP21, DP22.
- MU-CLEAR-ANY-PREVIEW → DP20.
- MU-TRANSPORT-SUBSCRIBES → DP2, DP9a, DP21.

**D-ROWS: C's own WAV parse** (`wavcheck.py`). PCM, 2 channels, 48 kHz, 24-bit, 5,703,120 frames = **118.815 s**. The first audible sample is at 41.910 s, which matches the clip start. HEAD's file is identical, including its 20 full-scale samples (INFO-C329-FULLSCALE).

**PERF details.** Production build in the scratch. The interactions spec ran alone after a warm-up: rc 0, `failures` [], 167 rows, and all 36 asserted rows pass.
- **Bullet 1 holds:**
  - fade stopped and playing `move-components-per-move` 21.633 (≤ 24) and `-max` 22 (≤ 24);
  - playing `move-restarts` 0 for fade and for move.
- **Record rows:** `interact.drag.move.{stopped,playing}.move-components-per-move` = **30.383**, which is about 1.4 above B's upper inference of ≈ 29. `-max` = **108**, below B's ≈ 110 (HEAD: 106.85 and 107). These are record rows with no budget, so they do not change the verdict.
- **Bullet 2 fails for range.** Fade and trim are all equal (18 trim rows). Range `move-components-max` went 30 → **31** and `-per-move` 9.233 → **9.25**.
  - **Contract applied:** "within the determinism contract" is `perf/lib/determinism.ts`. Rows with the `components` unit are `exact`, and `move-components-per-move` is the `ratio` componentsSum/movesInWindow (118 commits / 60 moves, unchanged). So a +1 is not inside any tolerance.
  - The range max row's own note says that its max is "the first-move null→range commit, including the transport flip (D-29z864)". That is the commit in which the non-memo leaf now also renders.
- **Bullet 3, the other rises:** click 106 → 107, zoom.1 99 → 100, zoom.30 244 → 245, play start/stop 90 → 91.
- **Totals over the non-wallclock rows:** 93 equal, 4 lower (the move rows), 24 higher.
- **C-R328-02 is unchanged:** fade `release-commits` stopped 3, playing 2.

**DOCS details.**
- l.4 is byte-equal to the prescribed text. That text says "C round 329 PASS", which this report does not give; see "For B".
- The title names c1.
- The 7 `##` headings are in order.
- `### ეტაპი c1` sits under მიდგომა.
- The c1 mermaid diagram sits under არქიტექტურა.
- Both files are listed.
- The c1 Problem/Solution entry is present.
- ტესტირება lists DP20–DP22 and 105 → 23 / 108.
- TODO lists c2–c5, D-29z950 and D-29z949.
- Every cited DP id exists in the test files.

## Findings
### C-R329-01 (Low; origin: B spec. The sketch assumed the parent no longer renders, and PERF bullet 2 is not met). The new end-text leaf adds one component to every transport render
**Steps**
1. Make a production build of A's tree.
2. Run `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` alone.
3. Compare with `c-round-328/perf-interactions-atree-results/latest-interactions.json`.

**Expected:** §2.2 PERF bullet 2. The range, fade and trim rows equal C round 328's run.

**Actual:**
- `interact.drag.range.{stopped,playing}.move-components-max` 30 → 31, and `-per-move` 9.233 → 9.25. Both are within budget.
- `click.components` 106 → 107.
- `zoom.1.components-*` 99 → 100.
- `zoom.30.components-*` 244 → 245.
- `play.{start,stop}-components` 90 → 91.

**Cause, measured in the browser.** The clip-click commit renders 105 components on A and 104 at HEAD. The only extra component is `ArrangementProjectEndText` (`click-names-vs-head.txt`). The leaf is a non-memo child of `ArrangementTransport`, so it re-renders on every transport render: a click, a play toggle, a zoom, or the range-start commit.

**Not user-visible.** The behaviour rows equal HEAD.

**For B:** either rule the +1 to be the new baseline, or wrap the leaf in `memo`. Its only prop is a primitive. C infers, but did not run, that memo would bring these rows back to round 328's values.

### C-R329-02 (Low; origin: C's own mutant, confirming A-R329-REVIEW-LOOP-EXTENT; a test gap). The loop part of the overview extent is unguarded
**Steps**
1. On the scratch, change `timelineExtent(projectEnd, arrangement.loop)` to `timelineExtent(projectEnd, null)`.
2. Run `drag-preview-render`.

**Expected:** a c1 row guards the extent that the wrapper now owns.

**Actual:** 24/24 green (`mutants/c-summary.txt`). In the browser, D-LOOP equals HEAD, so there is no measured defect.

**Suggestion:** add one DP row with `loop.end` past the project end, asserting `data-extent`. It could go into c2.

## Info
- **INFO-C329-FULLSCALE.** The export WAV has 20 full-scale 24-bit samples (peak 1.0). HEAD and B's runs show the same, so this is pre-existing. C did not investigate it.
- **INFO-C329-HEAD-WARM, INFO-C329-AUTH-ATTEMPT1, INFO-C329-VP-ATTEMPT1.** These first attempts were environment-invalid or had probe errors. Each was replaced, and the original is kept.
- During the perf spec, the idle `:5197` server stayed up, and no other job ran.

## Ableton conformance
Not applicable: perf round, behaviour held to HEAD.

## Gate rows (not claimed)
Full vitest, build, Biome/lint, typecheck, `npm run verify`, e2e smoke.

## For B
- The round is behaviourally ready. Rule on C-R329-01 (accept the +1, or memo the leaf) and schedule a row for C-R329-02.
- Doc 232 l.4 states "C round 329 PASS". That is B's prescribed wording, and it is not true for this report.
