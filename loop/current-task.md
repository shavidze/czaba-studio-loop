# Round 399: PERF-14b-i. Make the perf harnesses count clips from the model, so clip virtualization can land

**Planned by:** B, at the round 398 → 399 planning, 2026-11-08 (`b-round-398.md`).
**Decisions:** D-29z1362 … D-29z1366 (`backlog.json` v366, `decisions_log_b`).
**Type:** stage 2 of 4 of PERF-14 (performance, test harness only). **No `app/**` file changes.** A user sees and hears nothing new.

**Read first:**
- `lessons.md` in full. Most relevant here: L10, L11, L23, L28, L29, L30, L31, L34, L37, L38, L56, L57, L58, L59, L60.
- This file. Open `tasks/round-398.md` only to look up a row.
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md`, `GEORGIAN_DOCS.md`.
- **Claims:** `b-round-398/claims-399.sh`, run from the loop root.
  - Planning output: `b-round-398/claims-399-planning-output.txt`.
  - Output on B's harness sketch: `b-round-398/claims-399-on-sketch.txt`. That scratch is not a git repo, so its K2 line is a git error. Its K17 reads `applies-to-tree no` because the patch is already applied there.
  - A runs the claims before editing. C runs them at the start of SOURCE-SCOPE, where they must equal the planning output. C runs them again at the end, where only the §7 facts may differ.

## Baseline: `c3ee1d6`, clean tree
- Gate 398 is `published` with commit `c3ee1d6` on both remotes [K1]. HEAD is `c3ee1d6` with 0 modified files [K2].
  - `context/head-sha.txt` shows `c93d926`, the tree before the gate's commit. The baseline is the published commit (L29 HEAD-drift note).
- Protected files: 11 of 11 [K3].
- Frozen manifest: `b-round-398/r399-frozen-sha256.txt`, 1285 entries, 0 failures [K4]. It covers every tracked file except the 8 tracked grants.
- Grants: `b-round-398/grants-399.txt` (§4).

## 0. Why this round
- **C round 398 passed PERF-14a:** `browserVerified` true, 0 bugs, L57 OK. Gate 398 published `c3ee1d6`, so PERF-14a is done (D-29z1362).
- **No open C bug.** Every open Critical/High/Medium finding is manual-only, `awaiting_user` or `open_root` (2026-10-23 rule).
- **No regression round yet.** The last one was on 2026-11-07, in round 390 [K5]; the next is due on or after 2026-11-10. RETRO is round 400.
- **PERF-14b (virtualization) is sketched and measured.** B's sketch renders only the clips inside the page window, plus pinned clips. On a production build with 200 clips [K16]:
  - page elements: 950 / 1532 / 1868 at default zoom, minimum zoom, and minimum zoom scrolled to the middle (HEAD: 4333 / 4303 / 4333);
  - zoom components per key: 42.4 (HEAD: 638).

  A per-frame browser probe saw 0 frames with a hole in the visible lane area, at both viewports [K22].
- **The perf harnesses cannot run under that sketch yet** [K25]:
  - **`studio-lab-interactions`** aborts at its 30-clip build. It waits for `toHaveCount(press + 1)` on mounted clips and needs 30 distinct mounted starts, so every 30-clip row is null (`b-round-398/perf-sketch-studio-lab-interactions.log`).
  - **`studio-lab-resources`** step e waits for 2 mounted clips after Ctrl+D. The copy lands outside the window, so `res.harness.clips-2` and export 2 fail (`b-round-398/perf-sketch-studio-lab-resources.log`).
  - `studio-lab-stem-cache` and `studio-lab` pass.
- **Ruling D-29z1364: the harness goes first, the same order as in 14a.** This round makes the harnesses count clips from the model (`data-clip-count`, added in PERF-14a) and reach a target clip that may be unmounted.
  - Every value at HEAD stays the same.
  - The harnesses must also complete on a scratch copy with B's virtualization sketch applied.
  - Round 400 is RETRO. PERF-14b-ii (virtualization) follows. It reuses `b-round-398/sketch-14bii-lane.patch.txt`, re-reviewed after the tech-lead fixes listed in §8.
- **Consults:** advisor ×2 and `tech-lead`, whose sketch review is in `b-round-398/sketch-review.md`. Summaries: `b-round-398/consults.md`.

## 1. Rulings (B)

### D-29z1363: C's round-398 harness signals (L10)
- **M2, "in the window" (C-R398-SIGNAL-M2).** A clip is in the window when its box intersects the **lane area**: the timeline scroller's box minus the measured width of the first `[data-testid="arrangement-track-header"]` [K12].
  - That header is `sticky left-0` [K12], so clips under it are not visible.
  - B's harness sketch implements this. At HEAD it reads `scale.clips.in-window.min-zoom-mid` = 19; the old definition gave 24 [K16].
- **M3, p95 with 10 keys (C-R398-SIGNAL-M3).** `perf/lib/stats.ts` `percentile` uses `floor(n × 0.95)` [K19], so with 10 keys [K19] the p95 is the maximum.
  - The wallclock zoom rows stay `record`.
  - The PERF-14 target "zoom p95 < 50 ms" is read on `keydown-max-ms`. The p95 row notes say so (harness patch).
  - The key count does not change.

### D-29z1365: harness contract after the migration
**Rule R, the class ruling for the perf grep (L23).** The grep is in the claims block [K20]:

```
grep -rnE 'audioClips\(|videoClips\(|toHaveCount\(|data-clip-start|data-clip-kind|data-clip-id|\[data-clip' perf --include=*.ts
```

It gives 66 hits at HEAD [K20]: interactions 34, resources 11, scale 10, `studio-lab` 10, `perf/lib/page.ts` 1. B's list is in `b-round-398/perf-dom-clip-grep.txt`. A re-runs the same grep and gives every hit in the interactions and resources specs exactly one class:

| Class | Hit kind | Rule |
|---|---|---|
| **R-a model fact** | A wait or count that states how many clips exist after an edit (Add, Ctrl+D, undo, delete, the 30-clip build) | Read the sum of `data-clip-count` over `[data-track-id][data-clip-count]` (the PERF-14a attribute [K8]) through the new `perf/lib/page.ts` helpers. The DOM count may stay as extra `detail`, never as the condition |
| **R-b one clip by position** | A locator that picks a clip by DOM order (`first()`, `nth()`, an index) or by `data-clip-start`, to click, drag, hover or measure it | **Fix the target's identity by the model, never by mounted order.** Under virtualization DOM order is the mounted set, so `nth(4)` is no longer the 5th clip in time. The target is named by its `data-clip-id` (captured when the clip was created or first seen) or by its `data-clip-start` value. Before the interaction, bring **that** clip into the lane area: set the timeline scroller's `scrollLeft` so its start is inside the lane area, wait for quiet, then locate it as `[data-clip-id="…"]` or `[data-clip-start="…"]`. The spec already does this in places: `clipById` after capturing the id [K26], and the candidate loop that reads `data-clip-start` [K26]. The scroll happens **outside** every measured window; a scroll that would fall inside one is a STOP. A hit that cannot name its target by id or start is a STOP |
| **R-c distinct starts** | "N distinct `data-clip-start` == target" | "≥ 1 mounted clip, and one distinct start per mounted clip". The scale spec's visible-gap self-check proves contiguity |
| **R-d not about clip presence** | Dialogs, sliders, `toHaveCount` on non-clip elements, a single fresh clip right after Add at scroll 0, video clips | No change. List these as "no change" in the report |

- A hit that fits none of R-a … R-d is a **STOP** (L11).
- `perf/studio-lab.perf.spec.ts` (10 hits) stays frozen, because it passes on the virtualization sketch [K25].
- The scale spec's hits are covered by B's harness patch.
- **New helpers in `perf/lib/page.ts` (add-only):** `modelClipCount(page): Promise<number>` and `expectModelClipCount(page, count, timeoutMs)`. Both read the sum of the lane `data-clip-count` values. Every existing export stays byte-identical, including `audioClips` [K20]. No other `perf/lib/**` file changes.
- **No row changes its id, kind, mode or budget** in any budgets file. Only these notes are edited, because their row's source changes:
  - `interact.harness.clips-30`: now read from the model.
  - `res.harness.clips-2`: now read from the model.
  - `res.dom.page-2`, `res.dom.ruler-2` and `res.dom.page-per-added-clip`: each note adds "under virtualization the copy may be unmounted; this counts mounted elements".
  - The in-window and keydown-p95 rows of `budgets.scale.json` (in the harness patch).
- **Scale spec:** B's harness patch, `b-round-398/sketch-399-harness.patch.txt` [K17], applies byte-identical. It makes three changes:
  - in-window follows M2;
  - a visible-gap self-check runs at steps c, f and g and after each step-h scroll. It checks that the mounted clips cover the visible lane area with no hole. It assumes the back-to-back Ctrl+D build (TL-R398-SK-L2). A's only addition is to write that assumption into the sequence text;
  - the build self-check becomes "≥ 1 mounted clip, and one distinct `data-clip-start` per mounted clip".

  Evidence: the patch is clean at HEAD [K16] and on the virtualization sketch (`b-round-398/perf-sketch-scale-run2.log`). The gap check is live: a shifted-window mutant gives 36 gap problems [K16b]. With no filter, the page rows fail [K16b].

### D-29z1366: docs and stage count
- PERF-14 now has 4 stages: 14a, 14b-i, 14b-ii and 14c.
- **Doc 254:** l.4 becomes byte-exact `**სტატუსი:** In Progress (stage 1 of 4; C round 398 PASS)` [K7]. Its contract section is updated for M2, M3, the gap self-check and the build self-check (L34).
- **New doc 255:** `docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md`. The number 255 is free [K6].
  - Georgian, with the 7 TEMPLATE headings in order (L26).
  - l.4 byte-exact: `**სტატუსი:** In Progress (stage 2 of 4; C round 399 PASS)`.
  - The contract section holds the R-a … R-d table, the helpers, and a per-site table: spec, old line → new code, class.
- **L34 ruling:** the earlier docs that cite the interactions or resources spec record their own rounds and are **not edited**. They are the 20 files found by `grep -rlE 'studio-lab-interactions\.perf|studio-lab-resources\.perf' docs/implementation` [K27] (docs 168, 169, 175, 176, 194, 195, 207, 208, 209, 210, 222, 223, 231, 232, 233, 234, 240, 247, 248 and 252). Doc 255 is the current contract, and it names those docs as superseded for the clip waits and clip targeting only.

### Side effects (L49)
| Effect | Ruling |
|---|---|
| An R-b scroll before an interaction | Every deterministic row must stay equal to B's HEAD run. A row that changes is a STOP, never a re-ruled budget |
| An R-a wait on the model instead of the DOM | At HEAD every clip is mounted, so the model count equals the mounted count at every wait and the values do not change |
| Budget notes edited | `loadPerfBudgets` reads a note only as a string (`perf/lib/budgets.ts`) [K28]. The ids, modes and budgets stay byte-equal (C checks this with a JSON diff) |

### Ruling lines (L4)
- **Deterministic row values vs "the harness may change":** the values win. Any deterministic row that differs from the HEAD baseline is a STOP.
- **`perf/lib/page.ts`:** "add-only" wins over any wish to refactor, including the reviewer's `findTimelineScroller` (an architecture signal, not this round's work).

## 2. Reference
- This is a performance and test-harness round. The policy exempts it from the reference section and from the `product-designer` consult.
- **Ableton:** `not applicable / perf`.
- **Screen budget (L39):** nothing visible changes.

## 3. What A changes
1. Apply `b-round-398/sketch-399-harness.patch.txt` (sha256 `204e282ad46a827c…` [K17]) with `git apply`. Then add the gap-check assumption to the step-c sequence text of the scale spec.
2. Add the `perf/lib/page.ts` helpers (§1, D-29z1365).
3. Migrate `perf/studio-lab-interactions.perf.spec.ts` and `perf/studio-lab-resources.perf.spec.ts` by Rule R, hit by hit.
4. Edit the budget notes listed in D-29z1365.
5. Update doc 254 (l.4 and its contract section) and write the new doc 255 (D-29z1366).

**No `as`, `any` or `@ts-ignore`.** A deviation from §1 is a STOP (L11).

**Forbidden:**
- every `app/**` file and every path outside the grants;
- in particular `perf/studio-lab.perf.spec.ts`, `perf/studio-lab-stem-cache.perf.spec.ts`, `perf/budgets.json`, `perf/budgets.stem-cache.json`, `playwright.perf.config.ts`, and every `perf/lib/**` file except `page.ts`;
- the global forbidden files and actions, the protected files and `package.json`;
- commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-398/grants-399.txt`)
- `perf/studio-lab-interactions.perf.spec.ts`
- `perf/studio-lab-resources.perf.spec.ts`
- `perf/studio-lab-scale.perf.spec.ts` (the harness patch, plus the one sequence-text line)
- `perf/budgets.scale.json` (the harness patch only)
- `perf/budgets.interactions.json` and `perf/budgets.resources.json` (only the notes of the listed rows)
- `perf/lib/page.ts` (add-only)
- `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md` (l.4 and its contract section)
- `docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md` (new)

## 5. A: checks
**Never run two perf specs at once, and never run vitest or tsc while one runs (L38).**

| # | Command | PASS when |
|---|---|---|
| A1 | Claims at start | Equal to the planning output |
| A2 | `npm run typecheck` (it covers `perf/**`; Biome ignores `perf/**`, L30) | rc 0 |
| A3 | `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` (the perf/lib root, L30) | 3 files and 54 tests pass, as at HEAD (`b-round-398/head-perf-lib-vitest.log`) |
| A4 | Each of the three migrated specs, alone, on the working tree: `npx playwright test --config playwright.perf.config.ts perf/<spec>.perf.spec.ts` | rc 0, `failures` [], and every pass has `problems` []. **Every `deterministic` row has the same samples as its HEAD baseline** [K16]: interactions = `b-round-398/perf-head-interactions.json` (189 rows), resources = `c-round-398/perf-results/latest-resources.json` (46), scale = `b-round-398/perf-head-harness-scale.json` (17). Write a per-row comparison file. Any difference is a STOP |
| A5 | **Virtualization readiness.** Make a scratch copy of the working tree outside `store/` (rsync, with `node_modules` symlinked). Apply `b-round-398/sketch-14bii-lane.patch.txt` [K17] there and run each of the three specs alone in that scratch | Each spec has `complete` true, `abortedAt` null, `problems` [] in every pass, and 3 non-null samples in every row. **rc may be 1:** list every failing assert row with its median (this list is the re-rule input for PERF-14b-ii). If a harness **problem** (not an assert) appears there, first check it is not a Rule R gap you can fix inside the grants; if it is caused by the virtualization sketch itself, report it verbatim as a 14b-ii input and do not route around it. Afterwards, delete the scratch by its absolute path (L60) |
| A6 | Claims at end | Only the §7 facts differ |
| A7 | `code-reviewer` (≥ 3 files changed) | Each Medium+ finding is fixed inside the grants, or A reports a STOP. Any code changed after the review goes back to the reviewer (L11) |

- **Run-to-run controls (L37):** two unmodified HEAD runs of the interactions spec agree on all 189 deterministic rows (`b-round-398/interactions-run-control.txt`, 0 differing) [K29]. Between C rounds 396 and 398 the resources spec differs only in 4 `res.js.*` bundle-byte rows, because the app bundle changed between those trees (`b-round-398/resources-run-control.txt`) [K29]. This round does not change the app, so no row is excluded from A4's equality.
- A does not run the full vitest suite, `verify`, or a build outside the perf config.
- **Timeout headroom (L31):** at HEAD the interactions spec ran 8.1 min against its 15-minute test timeout (54 %) [K25, `b-round-398/perf-head-interactions.log`].
  - The R-b scrolls may add at most 60 s per pass in total.
  - If the spec takes more than 12 minutes on either tree, that is a STOP. Do not cut passes.

**A's report, `a-round-399.md`:**
- the per-hit class table (spec:line, class, change);
- each command, with its rc and a log under `a-round-399/`;
- the A4 comparison files;
- the A5 list of failing assert rows;
- the reviewer's notes. Architecture notes go to B as signals.

## 6. C: rows
- Load `/studio-lab` once, untimed, in a browser first (L38).
- Run the heaviest rows first, and each perf spec alone (L59, L38).
- The perf specs run at 1440×900 on the perf config's own production server.
- **1280×720 does not apply:** `app/**` is unchanged (SOURCE-SCOPE proves it), so there is no visible change to compare.

| Row | Steps | PASS when |
|---|---|---|
| **INTERACT-HEAD** | Run the interactions spec alone on the working tree. Copy `latest-interactions.json` to `c-round-399/perf-results/` | rc 0, `failures` [], `complete` true. All 189 deterministic rows have the same samples as `b-round-398/perf-head-interactions.json` (write a per-row diff file) |
| **INTERACT-VIRT** | On a scratch copy of the working tree with `b-round-398/sketch-14bii-lane.patch.txt` applied, run the interactions spec alone | `complete` true, `abortedAt` null, `problems` [] in every pass, 3 non-null samples in every row. rc may be 1. Record the failing assert rows and compare them with A's A5 list: a deterministic row that is on one list but not the other is a Low finding, not a FAIL |
| **RES-HEAD** | Run the resources spec alone on the working tree | `failures` []. All 46 deterministic rows equal `c-round-398/perf-results/latest-resources.json` |
| **RES-VIRT** | Run the resources spec alone on the virtualization scratch | `abortedAt` null, `problems` [], `res.harness.clips-2` = 2, every row non-null |
| **SCALE-HEAD** | Run the scale spec alone on the working tree | `failures` [] and `problems` []. The 17 deterministic rows equal `b-round-398/perf-head-harness-scale.json`, and `scale.clips.in-window.min-zoom-mid` = 19 |
| **SCALE-VIRT** | Run the scale spec alone on the virtualization scratch | `failures` [] and `problems` [] (the gap check is clean). `scale.dom.page`, `.min-zoom` and `.min-zoom-mid` = 950, 1532 and 1868, and `scale.clips.model` = 200, as in B's run `b-round-398/perf-sketch-scale-run2.log` [K16] |
| **PERF-LIB** | A3's command | 3 files pass, with ≥ 54 tests |
| **BUDGET-SHAPE** | JSON diff of the three granted budgets files against HEAD | Only `note` strings differ, and only on the rows listed in D-29z1365 |
| **NO-APP-CHANGE** | `git status --porcelain` and `git diff --stat -- app` | Only grants changed (1 new doc). The `app` diff is empty |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo. `/studio/<premium handle>` shows sign-in with no workspace. `/api/studio-token?product=<handle>&file=a.wav` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | Claims at start and end; `sha256sum -c` on `b-round-398/r399-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | The start equals the planning output, and at the end only the §7 facts differ. K4 has 0 failures and K3 is 11. Re-run the K20 grep; its root is `perf` (L29) |
| **DOCS** | Read docs 254 and 255 | Both are Georgian, with the 7 TEMPLATE headings in order. l.4 is exact as in D-29z1366. Doc 255's per-site table matches the diff, and every id and file it cites exists. `grep -rln 'In Progress (stage' docs/implementation` gives 5 files, and `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- Delete the virtualization scratch by its absolute path when done (L60).
- `browserVerified` is true when the six perf rows ran; they are real Chromium runs.
- **Ableton:** `not applicable / perf`.
- **Write all L57 fields in `c-round-399.json`:**
  - `manifestPaths`: `b-round-398/r399-frozen-sha256.txt` and `b-round-318/protected-sha256.txt`;
  - `missingPaths`, `countMismatches` and `claimCheckMinutes`;
  - an `origin` for each finding;
  - `assertsSpecified` and `mutantsRecorded`;
  - `mutantRedOnSketch`: `b-round-398/perf-sketch-scale-mutant-shifted-window.log` (gap-check liveness) and `b-round-398/perf-sketch-scale-mutant-no-filter.log`;
  - `mutantRedOnTree`: null, with the reason "no app change";
  - `gateChecksNamed` and `gateChecksRunOnSketch`: `b-round-398/head-perf-lib-vitest.log`. There is no app change, so the full suite is the gate's;
  - `chainHeadGateRunGreen`: gate 398 published `c3ee1d6`;
  - `affectedChecksNamed`;
  - `affectedChecksRunOnSketch`: `b-round-398/perf-head-harness-scale.log`, `perf-sketch-scale-run2.log` and `perf-head-interactions.log`. The migrated interactions and resources specs were not run on a sketch; write that;
  - `progressFile` and `stopSignal`.
- **Before hand-off:** run `tools/l57-check.py`. Write `c-round-399/progress.json` after each row (L59).

## 7. Claims that may change during the round
- **K2:** `c3ee1d6 0` → `c3ee1d6 9` (8 modified, 1 new).
- **K6/K6b:** doc 255 exists, its l.4 is as in D-29z1366, and it has ≥ 7 headings.
- **K18:** `exists`.
- **K7:** `in-progress-docs` 4 → 5; `doc254-l4` → `… (stage 1 of 4; C round 398 PASS)`.
- **K17:** `applies-to-tree` yes → no, because the harness patch is now applied. `lane-applies` stays yes.
- **K20:**
  - the total, and the per-file counts of the interactions, resources and scale specs, may change;
  - the `studio-lab.perf.spec.ts` count stays 10;
  - `page-audioClips` stays 1;
  - `model-helper` goes from 0 to ≥ 2.
- **K14:** it may change only through the interactions, resources and scale specs. The `app/**` test files are unchanged.

Every other fact must equal the planning output.

## 8. Out of scope (recorded, not dropped)
- **PERF-14b-ii (after RETRO 400): clip virtualization**, from `b-round-398/sketch-14bii-lane.patch.txt`.
  - **Before dispatch:** fix the sketch for TL-R398-SK-M1 (unpin on window `blur`) and TL-R398-SK-L1 (cleanup on unmount). Then re-run VZ, the mutants (7 of 7 red today [K21]) and the full suite, and get a delta review.
  - **The pin set is already ruled** (D-29z1364, `Q-14B-PIN-SELECTED`): pin clips under an active press and lane-move sources; do not pin selected clips. The evidence:
    - clips contain no focusable element [K10];
    - app code reaches clip DOM only inside the pressed clip's envelope [K11], so keyboard and selection actions do not need mounted clips;
    - with select-all, only 55 / 46 clips stay mounted [K22].
  - **Then:**
    - flip the scale asserts from `sketch-14bii-budget-flips.patch.txt`;
    - add a ceiling row for scroll components (TL-R398-SK-L3);
    - re-rule this round's A5 list of failing asserts.
- **PERF-14c:** the peak pyramid and canvas tiles, plus the round-315 peaks Lows.
- **Signals:** A-R398-ARCH-FIND-TIMELINE-SCROLLER (a `perf/lib` helper candidate) and PERF-CAND-14-SCROLL-HYSTERESIS.
- **Architecture checkpoint, still due for root:** ARCH-CHECKPOINT-PREVIEW-AFTER-13C with ARCH-CHECKPOINT-DECODE-REGION. It does not block this round.
- **Deferred Low:** C-R398-NOTE-FIRST-RUN-1440 (environment).
- **Next:** RETRO 400, then PERF-14b-ii, 14c and PERF-15, then the rest of the queue unchanged. The regression round is due at the first planning on or after 2026-11-10.
