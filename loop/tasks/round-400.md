# Round 400: PERF-14b-i, completion. Rule the Ctrl+D group-copy reads (C-R399-01) and finish the harness migration

**Planned by:** B, at the round 399 → 400 planning, 2026-11-08 (`b-round-399.md`).
**Decisions:** D-29z1367 … D-29z1370 (`backlog.json` v367, `decisions_log_b`).
**Type:** stage 2 of 4 of PERF-14, second dispatch (performance, test harness only). **No `app/**` file changes.** A user sees and hears nothing new.

**Read first:**
- `lessons.md` in full. Most relevant here: L10, L11, L22, L23, L28, L29, L30, L31, L37, L38, L57, L58, L59, L60.
- This file. Open `tasks/round-399.md` only to look up a row or a ruling (Rule R, D-29z1363 … D-29z1366 stay in force unless §1 here changes them).
- Primitives: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `AGENT_DISCOVERABLE_CODE.md`, `GEORGIAN_DOCS.md`.
- **Claims:** `b-round-399/claims-400.sh`, run from the loop root.
  - Planning output: `b-round-399/claims-400-planning-output.txt`.
  - A runs the claims before editing. C runs them at the start of SOURCE-SCOPE, where they must equal the planning output. C runs them again at the end, where only the §7 facts may differ.

## Baseline: `c3ee1d6` plus A's round-399 work (not published)
- Gate 399 is `skipped` ("C taskStatus FAIL"); gate 398 published `c3ee1d6` [K1]. HEAD is `c3ee1d6` with 9 changed paths (8 modified, 1 new) and an empty `app` diff [K2].
- **A's round-399 work stays in the tree and is kept, not redone.** Its tracked diff at planning is `b-round-399/a399-diff.patch.txt` and doc 255 at planning is `b-round-399/a399-doc255.md` [K8].
- Protected files: 11 of 11 [K3].
- Frozen manifest: `b-round-399/r400-frozen-sha256.txt`, 1292 entries, 0 failures [K4]. It covers every tracked file except the interactions spec, **including A's finished round-399 files at their current hashes** (scale spec, resources spec, `perf/lib/page.ts`, the three budgets files, doc 254). Those are done; touching them is a STOP.
- Grants: `b-round-399/grants-400.txt` (§4): the interactions spec and doc 255 only.

## 0. Why this round
- **C round 399 FAIL, "STOPPED — routed to B"** (L22 short round). C reproduced A's STOP in the browser: on the virtualization sketch every interactions pass reports `group setup: no Ctrl+D copy next to clip <id>`, the 24 group rows have 0 samples, and 12 group asserts plus `interact.harness.drag-group-live` fail (`c-round-399/virt-interactions.json`). SOURCE-SCOPE, NO-APP-CHANGE and AUTH passed. C did not run INTERACT-HEAD, RES-*, SCALE-*, PERF-LIB, BUDGET-SHAPE or DOCS.
- **C-R399-01 (Medium, origin B spec).** Round 399's R-b said "bring the target into the lane area before the read", and §1 also said "any deterministic row that differs from HEAD is a STOP". For the copy both cannot hold: the copy starts ≈ 4054 px right of the lane area even at HEAD, and a scroll while playing pauses Follow (`a-round-399/probe/follow-probe.txt`; `StudioWorkspace.tsx` `pauseFollowForNavigation` [K11]). B owns this conflict.
- **This round is the bug fix first (L10), before RETRO.** RETRO moves from 400 to **401** (window 385–400, D-29z1369). Reason: the tree carries A's unverified round-399 diff; a RETRO round on that tree has no clean publish boundary.
- **The ruling was run before dispatch (L58).** B wrote the candidate (`b-round-399/sketch-400-group-copy.patch.txt` [K9]) and ran the interactions spec alone on two scratch copies of the current tree: plain, and with `b-round-398/sketch-14bii-lane.patch.txt` [K13–K16]. Results:
  - **Plain tree** (`b-round-399/sketch/interactions-head.log`, 483 s): rc 0, `failures` [], `problems` [] ×6, **189 of 189 deterministic rows equal** `b-round-398/perf-head-interactions.json` (`sketch/compare-head.txt`). Every pass takes the mounted path: `CopyReveals` 0, `OwnCopyObserved` true, `CopyBeforeSource` `mounted`, `PlayingFollowAtT0` `on` [K14, K16].
  - **Virtualization sketch** (`sketch/interactions-virt.log`, 549 s): `complete` true, `abortedAt` null ×6, `problems` [] ×6, all 264 rows have 3 non-null samples. `interact.harness.drag-group-live` = 1 in every pass; `CopyReveals` 3 per branch (setup id + release read + reset read), `OwnCopyObserved` false, `CopyBeforeSource` `setup-at-rest`, `PlayingFollowAtT0` `on`. rc 1 only because of `interact.zoom.30.out.path-rewrites` (median 2, budget == 3), the known virtualization effect. All 10 group asserts pass there (e.g. `move-components-per-move` 10.906, `release-commits` 1, `playing.move-restarts` 0) [K15, K16; `sketch/group-virt.txt`].

## 1. Rulings (B)

### D-29z1368: R-b′ for the Ctrl+D copy (closes the round-399 STOP, L10)
The round-399 R-b clause "bring the target into the lane area before the interaction" is replaced, **for the group copy only**, by this conditional form. Every other R-b site keeps the round-399 rule (A's round-399 table classifies them; none needed a scroll).

| Read | Rule |
|---|---|
| **Copy id** (setup, old l.914–921) | Scan mounted clips first (HEAD path, unchanged). Only when no copy is mounted: scroll the timeline scroller so the original clip's right edge sits 8 px right of the lane-area left (the copy is back-to-back after Ctrl+D), wait for quiet, scan again, restore the saved `scrollLeft` (checked within 1 px), wait for quiet |
| **Copy at rest** (new, setup) | Read `readClipState(copy)` once in setup (stopped), with the same reveal-only-when-unmounted rule. Stored as `copyAtRest` |
| **`copyBefore`** (both branches, before `t0`) | Live read when the copy is mounted (HEAD path). When it is not mounted: use `copyAtRest`. **No scroll before `t0`, in either branch** (this removes the Follow confound). Detail `CopyBeforeSource` = `mounted` / `setup-at-rest` |
| **`ownCopy`** (inside the gesture, inside the measured window) | `copy.count() > 0 ? readClipState(copy) : null`. **Never scroll and never wait for the copy here.** When null, check (f) is skipped and detail `OwnCopyObserved` = false. This is not a problem: check (c) still proves the copy moved by the clip's delta after release. Listed as a virtualization-only deviation and a 14b-ii input (Q-14B-PIN-GROUP-MEMBERS) |
| **`copyReleased` + copy lane id**, **`copyReset` + copy lane id** (after `tEnd`) | Live read when mounted; else the reveal → read → restore of row 1. When Follow was `on` before the reveal and reads otherwise after the restore, click `arrangement-follow`, blur, wait for quiet, and require `data-follow-mode` = `on` (else a problem). All of this is after `tEnd`, outside every measured window |
| **Failed copy read (h)** | When a reveal still finds no copy, the branch does not return early: `resetAfterDrag` and `setLive` still run, and liveness failure `(h)` is recorded, so `drag-group-live` is 0 for that pass (tech-lead review, High, fixed in v2) |
| **New check (g)** | In the playing branch, `data-follow-mode` read just before `t0` must be `on`; otherwise a liveness failure. Detail `FollowAtT0` in both branches |

- **At HEAD every branch above takes the mounted path:** 0 scrolls, 0 Follow clicks, `CopyReveals` = 0, `OwnCopyObserved` = true. So every deterministic row stays equal to HEAD by construction, and C checks it.
- **The sketch is the contract (reviewed by `tech-lead`, `b-round-399/sketch-review-400.md`: one High and two Mediums; the High and one Medium are fixed in the dispatched v2, the other Medium is the recorded (f) deviation).** A applies `b-round-399/sketch-400-group-copy.patch.txt` with `git apply` (sha256 in [K9]; `--check` is clean on the tree). It applies byte-identical: the resulting `perf/studio-lab-interactions.perf.spec.ts` has the same sha256 as `b-round-399/sketch/interactions.sketch.ts` (`fc804c3d3868f622…`). Any further edit to the spec is a STOP.
- **No row id, kind, mode or budget changes.** `perf/budgets.interactions.json` is frozen this round.

### D-29z1370: claims and records
- **C-R399-LOW-CLAIMS fixed:** this round's claims expect K20 `perf/lib/page.ts` = 2 and K27 = 21 (A's round-399 deltas, both forced by the mandated work).
- **14b-ii inputs (recorded, not scheduled now):** `interact.zoom.30.out.path-rewrites` median 2 vs budget 3 on the sketch; `res.harness.clips-1` still DOM-sourced (resources l.707); the round-399 reviewer's Lows on B's scale patch (gap check uses the `Math.max` lane count while the model row uses the sum; `box.right` includes the scrollbar; a NaN `data-clip-start` weakens the gap check; the in-window notes still open with "intersects the timeline scroller's box"); Q-14B-PIN-GROUP-MEMBERS.

## 2. Reference
- Performance and test-harness round: exempt from the reference section and the `product-designer` consult.
- **Ableton:** `not applicable / perf`.
- **Screen budget (L39):** nothing visible changes.

## 3. What A changes
1. Apply `b-round-399/sketch-400-group-copy.patch.txt` to `perf/studio-lab-interactions.perf.spec.ts` with `git apply` (`--check` first).
2. Update doc 255 (granted): replace the STOP section with the R-b′ table above (Georgian, technical terms in English), add the per-site rows for the copy reads (old line → new code, class R-b′), and note that `perf/budgets.interactions.json` is unchanged. Keep l.4 byte-exact: `**სტატუსი:** In Progress (stage 2 of 4; C round 400 PASS)`. Keep the 7 TEMPLATE headings in order (L26). The word `STOP` may remain only in the problems/solutions history.
3. Nothing else.

**No `as`, `any` or `@ts-ignore`.** A deviation from §1 is a STOP (L11).

**Forbidden:** every path outside the two grants, in particular every `app/**` file, every other `perf/**` file (A's round-399 files are frozen), the budgets files, `playwright.perf.config.ts`, the protected files, `package.json`; commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-399/grants-400.txt`)
- `perf/studio-lab-interactions.perf.spec.ts` (the sketch patch only)
- `docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md` (§3 item 2)

## 5. A: checks
**Never run two perf specs at once, and never run vitest or tsc while one runs (L38).**

| # | Command | PASS when |
|---|---|---|
| A1 | Claims at start | Equal to the planning output |
| A2 | `npm run typecheck` | rc 0 |
| A3 | `npx vitest run --config ../tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs` | 3 files, 54 tests pass |
| A4 | Interactions spec alone on the working tree (`npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts`) | rc 0, `failures` [], every pass `problems` []. **All 189 deterministic rows equal `b-round-398/perf-head-interactions.json`** (per-row comparison file, as `a-round-399/compare.py`). Every pass's `drag-group-live` detail has `CopyReveals` 0 and `OwnCopyObserved` true |
| A5 | Interactions spec alone on a scratch copy of the working tree with `b-round-398/sketch-14bii-lane.patch.txt` applied (rsync outside `store/`, `node_modules` symlinked) | VIRT-RULE (below). List every failing assert with its median. Delete the scratch by absolute path (L60) |
| A6 | Claims at end | Only the §7 facts differ |
| A7 | `code-reviewer` on the applied interactions diff and doc 255. It is required here even with 2 files, because B's v2 delta after the `tech-lead` review was not re-reviewed (`b-round-399/sketch-review-400.md`) | No Medium+ open. A Medium+ in the patch logic is a STOP (the spec is pinned byte-identical); a doc finding is fixed in doc 255 |

- Resources and scale specs are not re-run by A: their files are frozen and A's round-399 runs stand (`a-round-399/a4-*-compare.txt`, `a5-*-summary.txt`) [K18, K19]. C re-runs them.
- **Timeout headroom (L31):** the interactions spec ran 498 s of 900 s in round 399 [K21]. A run above 12 minutes on either tree is a STOP. Do not cut passes.

**VIRT-RULE (one rule for A5 and C's INTERACT-VIRT).** rc may be 1. It is a **FAIL** when any of these holds:
- `complete` is not true, or any `abortedAt` is not null;
- any pass has `problems` that is not [];
- any row has fewer than 3 non-null samples;
- any `interact.drag.group.*` assert fails, or `interact.harness.drag-group-live` (or `.6x`) is below 1 in any sample;
- `playingFollowAtT0` is not `on` in any pass.

Otherwise it is a PASS. `interact.zoom.30.out.path-rewrites` failing (median 2, budget == 3) is expected; it is a 14b-ii input. Any other failing assert is listed. If it is on C's list but not on A's A5 list (or the reverse), it is a **Low**, not a FAIL.

**Detail keys are per branch.** `drag-group-live` details use the keys `stoppedCopyReveals` / `playingCopyReveals`, `stoppedOwnCopyObserved` / `playingOwnCopyObserved`, `stoppedCopyBeforeSource` / `playingCopyBeforeSource` and `stoppedFollowAtT0` / `playingFollowAtT0`. Where this task writes `CopyReveals` and the other short names, it means both branches. The expected values:
- **plain tree:** reveals 0, observed true, source `mounted`;
- **lane sketch:** reveals 3 (the setup id reveal, the release read and the reset read), observed false, source `setup-at-rest`.

**A's report, `a-round-400.md`:** each command with rc and a log under `a-round-400/`; the A4 comparison file; the A5 summary (failing asserts with medians); the `drag-group-live` detail per pass on both trees.

## 6. C: rows
This is the full row set (not an L22 short round). Load `/studio-lab` once, untimed, in a browser first (L38). Heaviest first (L59). Each perf spec alone, at 1440×900 on the perf config's own production server. 1280×720 does not apply (no `app/**` change; SOURCE-SCOPE proves it).

| Row | Steps | PASS when |
|---|---|---|
| **INTERACT-HEAD** | Interactions spec alone on the working tree; copy `latest-interactions.json` to `c-round-400/perf-results/` | rc 0, `failures` [], `complete` true, `problems` [] ×6. All 189 deterministic rows equal `b-round-398/perf-head-interactions.json` (per-row diff file). `drag-group-live` detail: `CopyReveals` 0, `OwnCopyObserved` true in every pass |
| **INTERACT-VIRT** | Same spec alone on a scratch with `b-round-398/sketch-14bii-lane.patch.txt` | VIRT-RULE (below). Write C's failing-assert list next to A's A5 list |
| **RES-HEAD** | Resources spec alone on the working tree | `failures` [], `problems` [] ×6; all 46 deterministic rows equal `c-round-398/perf-results/latest-resources.json` |
| **RES-VIRT** | Resources spec alone on the virtualization scratch | `abortedAt` null, `problems` [], `res.harness.clips-2` = 2, every row non-null |
| **SCALE-HEAD** | Scale spec alone on the working tree | `failures` [], `problems` []; 17 deterministic rows equal `b-round-398/perf-head-harness-scale.json`; `scale.clips.in-window.min-zoom-mid` = 19 |
| **SCALE-VIRT** | Scale spec alone on the virtualization scratch | `failures` [], `problems` []; `scale.dom.page`, `.min-zoom`, `.min-zoom-mid` = 950, 1532, 1868; `scale.clips.model` = 200 |
| **PERF-LIB** | A3's command | 3 files, ≥ 54 tests pass |
| **BUDGET-SHAPE** | JSON diff of the three budgets files against `c3ee1d6` | Only `note` strings differ, only on the rows listed in round 399's D-29z1365 (A's `a-round-399/budget-shape.txt` is the expected shape) |
| **NO-APP-CHANGE** | `git status --porcelain`, `git diff --stat -- app` | Only round-399 grants plus this round's two grants changed; `app` diff empty |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo; `/studio/<premium handle>` shows sign-in with no workspace; `/api/studio-token?product=<handle>&file=a.wav` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | Claims at start and end; `sha256sum -c` on `b-round-399/r400-frozen-sha256.txt` and `b-round-318/protected-sha256.txt`; `sha256sum perf/studio-lab-interactions.perf.spec.ts` equals `b-round-399/sketch/interactions.sketch.ts` (`fc804c3d3868f622…`) | Start equals the planning output; end differs only on §7; K4 0 failures; K3 11 |
| **DOCS** | Read docs 254 and 255 | Both Georgian, 7 TEMPLATE headings in order. Doc 254 l.4 `**სტატუსი:** In Progress (stage 1 of 4; C round 398 PASS)`; doc 255 l.4 `**სტატუსი:** In Progress (stage 2 of 4; C round 400 PASS)`. Doc 255 holds the R-b′ table and per-site rows matching the diff; every id and file it cites exists. `grep -rln 'In Progress (stage' docs/implementation` = 5, `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- Delete the virtualization scratch by absolute path when done (L60).
- `browserVerified` is true only when the six perf rows ran (real Chromium runs).
- **Ableton:** `not applicable / perf`.
- **L57 fields in `c-round-400.json`:** `manifestPaths` (`b-round-399/r400-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`), `missingPaths`, `countMismatches`, `claimCheckMinutes`, `origin` per finding, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch` (`b-round-398/perf-sketch-scale-mutant-shifted-window.log`, `perf-sketch-scale-mutant-no-filter.log`), `mutantRedOnTree` null ("no app change"), `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-398/head-perf-lib-vitest.log`), `chainHeadGateRunGreen` (gate 398 published `c3ee1d6`; gate 399 skipped), `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-399/sketch/interactions-head.log`, `interactions-virt.log`), `progressFile`, `stopSignal`. Run `tools/l57-check.py` before hand-off; write `c-round-400/progress.json` after each row (L59).

## 7. Claims that may change during the round
- **K2:** `c3ee1d6 9 app-diff 0` stays 9 paths (the interactions spec is already modified; doc 255 already new). `app-diff` stays 0.
- **K6:** doc 255 l.4 → `… (stage 2 of 4; C round 400 PASS)`; headings stay ≥ 7; the `STOP` count may change.
- **K8:** `doc255-now` changes. The two `at-planning` hashes stay.
- **K9:** `interactions-sha` `1739d82c2aca29bf` → `fc804c3d3868f622`; `applies-to-tree` yes → no; `lane-applies` stays yes.
- **K10:** `raw-copy-reads` 6 → 5, `mounted-copy-scan` 1 → 0, `reveal-helper` 0 → 1 (the sketch's values).
- **K20:** stays exactly as planned (total 55; interactions 27, the sketch's own count; `perf/lib/page.ts` 2; `model-helper` 2). C-R399-LOW-CLAIMS: the page.ts 2 and K27 21 are already in the planning output.

Every other fact must equal the planning output.

## 8. Out of scope (recorded, not dropped)
- **RETRO 401** (window 385–400): next round.
- **PERF-14b-ii (after RETRO 401): clip virtualization** from `b-round-398/sketch-14bii-lane.patch.txt`. Before dispatch: TL-R398-SK-M1 (unpin on window `blur`), TL-R398-SK-L1 (cleanup on unmount), re-run VZ and the mutants, delta review; then Q-14B-PIN-GROUP-MEMBERS, the scale budget flips, the scroll-components ceiling (TL-R398-SK-L3) and the re-rule of the A5 list (`path-rewrites` 2 vs 3).
- **PERF-14c**, **PERF-15**, then the rest of the queue unchanged. The regression round is due at the first planning on or after 2026-11-10.
- **Architecture checkpoint still due for root:** ARCH-CHECKPOINT-PREVIEW-AFTER-13C with ARCH-CHECKPOINT-DECODE-REGION (non-blocking).
- **Signals:** A-R398-ARCH-FIND-TIMELINE-SCROLLER, PERF-CAND-14-SCROLL-HYSTERESIS.
