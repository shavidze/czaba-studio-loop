# A round 399 — PERF-14b-i (perf harnesses count clips from the model)

**STOP — needs B ruling on R-b for the group-copy reads (interactions old l.914–915, and the copy reads in `measureGroupDrag`).**
- **The conflict.** R-b says: before a read or interaction, bring the target into the lane area. §1 also says that any deterministic row that differs from HEAD is a STOP. Applied literally to the Ctrl+D copy, R-b breaks the second rule at HEAD.
- **Measurement at HEAD** on the :5173 dev server, 1440×900 (`a-round-399/probe/copy-probe.mjs`, output `a-round-399/probe/follow-probe.txt`):
  - lane area 512–1440 px (scroller 288–1440, header 224);
  - original clip 512–4566; copy starts at 4566 (`data-clip-start` 101.352);
  - the clip is ≈ 4054 px wide, so R-b means a ≈ 4000 px scroll even at HEAD.
- **Follow pauses.** While playing with Follow on, a manual `scrollLeft` change switches Follow to "Follow paused" (`StudioWorkspace.tsx` `handleTimelineScroll` → `pauseFollowForNavigation`). It stays paused after scrolling back to 0 and after Home.
  - The playing group drag reads `copyBefore` after Home while playing. A literal R-b scroll there changes HEAD state before `t0` (the L37 Follow confound).
  - The reads are `copyBefore`, `ownCopy`, `copyReleased`, `copyReset` and `clipLaneTrackId(copy)`.
- **On the sketch,** the copy lookup at old l.914 finds no copy, because the copy is not mounted. Each pass logs `group setup: no Ctrl+D copy next to clip …`, and the 24 group rows are null (`a5-interactions-summary.txt`).
- **Not implemented.** Old l.914–915 and the `measureGroupDrag` copy reads are unchanged.
- **Candidate for B (not applied):** reveal the copy only when `clipById(copyId).count() === 0`. That means no scroll at HEAD; on the virtualized tree, scroll, read and restore, accepting that playing group rows may differ there. Alternatively, rule how a playing-state scroll may treat Follow.

**What is blocked and what is not:**
- **Old l.914–915 is not blocked on its own.** It runs after `measurePlayback(page, false)` (stopped), so an R-b scroll and restore there would not pause Follow.
  - **Enabler:** after Ctrl+D, `arrangement-detail-start` reads `101.352`, which is the copy's `data-clip-start`. So the copy can be named by start without being mounted.
  - **Why it is still not migrated:** doing it alone makes the virtualized pass worse. `copyId` would resolve, and then `readClipState(copy)` on the unmounted copy would stall or abort the pass. Today the pass takes the clean path: no copy → `null` → fallback Ctrl+Z → continue. That is how A5 interactions finished its other 240 rows.
- **The real blocker is the five copy reads in `measureGroupDrag`.** They are not K20 grep hits. Two of them (`copyBefore` and `copyReleased` in the playing branch) run while playing with Follow on, which is where the probe shows the HEAD state change.

**Timeout:** interactions ran 498 s of its 900 s test timeout (55 %). That is under B's §5 12-min ruling, and the gate does not run this spec.

Everything else in §3 is done, and the tree is consistent (typecheck rc 0, all three migrated specs green at HEAD).

## Changed files (all inside `b-round-398/grants-399.txt`)
- `perf/studio-lab-scale.perf.spec.ts`: B's harness patch applied with `git apply` (sha256 `204e282ad46a827c…`, `--check` clean first). One more change: the step-c line of `scaleSequence` now states the in-window definition and the gap-check assumption (back-to-back Control+d build of equal-length clips).
- `perf/budgets.scale.json`: the harness patch only.
- `perf/lib/page.ts`: add-only.
  - `modelClipCount(page)` sums `data-clip-count` over `[data-track-id][data-clip-count]`.
  - `expectModelClipCount(page, count, timeoutMs?)` is `expect.poll` on that sum. With no `timeoutMs` it uses Playwright's default expect timeout, as `toHaveCount` did; the perf config sets no `expect.timeout`.
  - Existing exports are byte-identical.
- `perf/studio-lab-interactions.perf.spec.ts`, `perf/studio-lab-resources.perf.spec.ts`: Rule R (table below).
- `perf/budgets.interactions.json`: note of `interact.harness.clips-30`.
- `perf/budgets.resources.json`: notes of `res.harness.clips-2`, `res.dom.page-2`, `res.dom.ruler-2` and `res.dom.page-per-added-clip`.
- `docs/implementation/2026/quarter-IV/254-perf-scale-harness.md`:
  - l.4 → `**სტატუსი:** In Progress (stage 1 of 4; C round 398 PASS)`;
  - contract section: b self-check, in-window = lane area (M2), p95 read on keydown-max (M3), visible-gap self-check at c/f/g/h.
- `docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md` (new):
  - l.4 `**სტატუსი:** In Progress (stage 2 of 4; C round 399 PASS)`;
  - the 7 TEMPLATE headings in order;
  - the R-a … R-d table, the helpers and per-site tables;
  - the 20 superseded docs;
  - the STOP.

`git status`: 8 modified, 1 new. The `app/**` diff is empty.

## Per-hit class table (HEAD line numbers, `b-round-398/perf-dom-clip-grep.txt`)

**Interactions (34):**

| line | class | change |
|---|---|---|
| 133 `clipById` | R-b | none (already by id) |
| 135, 138 video helpers | R-d | none |
| 173 `readClipState` start read | R-b | none (reads an id-named clip) |
| 186 `visibleGrabPoint` `toHaveCount(1)` on the clip's child target | R-d | none |
| 243, 299 `closest('[data-clip-id]') === null` | R-d | none |
| 902, 904 clip id capture | R-b | none |
| 912 `toHaveCount(2)` after Ctrl+D | R-a | `expectModelClipCount(page, 2)` |
| **914, 915 copy id from mounted clips** | R-b | **STOP, unchanged** |
| 951 teardown `toHaveCount(1)` | R-a | `expectModelClipCount(page, 1)` |
| 973, 980, 986, 988, 1050 video | R-d | none |
| 1244, 1337, 1399 sliders | R-d | none |
| 1586 visible header count | R-d | none (a visible clip is always mounted) |
| 1616, 1620 candidate loop | R-b | none (chosen by visible header, named by `data-clip-start`, K26) |
| 1771 `toHaveCount(press + 1)` | R-a | `expectModelClipCount(page, press + 1)` |
| 1773 count → clips-30 | R-a | `modelClipCount`; `detail.mountedClips` added |
| 1774, 1775 distinct starts | R-c | problem when `mountedClips < 1 \|\| distinctStarts !== mountedClips` |
| 1829 `toHaveCount(1)` after Add | R-a | `expectModelClipCount(page, 1)` (the waveform wait at 1830 stays) |
| 1830 waveform | R-d | none |
| 1835, 1836 first clip id after Add | R-d | none |
| 1906 fallback `count() === 2` | R-a | `modelClipCount(page) === 2` |
| 1909 fallback `toHaveCount(1)` | R-a | `expectModelClipCount(page, 1)` |

**Resources (11):**

| line | class | change |
|---|---|---|
| 504 dialog | R-d | none |
| 508 `duplicateFirstClip` `first()` | R-d | none (single fresh clip from Add, start 0, scroll 0) |
| 516, 517 `toHaveCount(2, 10000)` | R-a | `expectModelClipCount(page, 2, 10000)` |
| 682, 741 `placed` | R-a | `modelClipCount(page)` |
| 703 `toHaveCount(1)` after Add | R-a | `expectModelClipCount(page, 1)` |
| 704 waveform | R-d | none |
| 707 `res.harness.clips-1` | R-d | none. That row's note (`[data-clip-kind="audio"] count after Add`) is not in the D-29z1365 note list, so its source stays DOM. **Signal for B:** move it to the model in 14b-ii if wanted |
| 716 `first()` subtree | R-d | none |
| 783 `res.harness.clips-2` | R-a | `modelClipCount`; `detail.mountedClips` added |

- The scale spec hits are covered by B's patch.
- `perf/studio-lab.perf.spec.ts` and `perf/lib/page.ts` `audioClips` are unchanged.
- The model sum includes the video lane. Every R-a wait runs while the video lane is empty: video setup is last and requires an empty lane.

## Commands (logs under `a-round-399/`)

| # | Command | rc / result |
|---|---|---|
| A1 | claims at start | equal to `claims-399-planning-output.txt` (`claims-start.txt`, `diff` empty) |
| A2 | `npm run typecheck` | rc 0 (`typecheck.log`) |
| A3 | perf/lib vitest (b-round-334 config) | rc 0, 3 files, 54 tests (`perf-lib-vitest.log`) |
| A4 scale | perf config, alone, working tree | rc 0, 67 s; `failures` [], problems [] ×3; **17/17 deterministic equal** to `b-round-398/perf-head-harness-scale.json`; `in-window.min-zoom-mid` = 19 (`a4-scale-compare.txt`) |
| A4 resources | same | rc 0, 77 s; problems [] ×6; **46/46 equal** to `c-round-398/perf-results/latest-resources.json` (`a4-resources-compare.txt`) |
| A4 interactions | same | rc 0, **498 s** (55 % of 15 min, below the 12-min STOP); problems [] ×6; **189/189 equal** to `b-round-398/perf-head-interactions.json` (`a4-interactions-compare.txt`) |
| A5 scale | scratch with `sketch-14bii-lane.patch.txt` | rc 0; complete; problems [] ×3; every row has 3 non-null samples; page 950 / 1532 / 1868, model 200, zoom components per key 42.4, the same as B's run2 (`a5-scale-summary.txt`) |
| A5 resources | same scratch | rc 0; complete; `abortedAt` null; problems [] ×6; `res.harness.clips-2` = 2; every row has 3 non-null samples (`a5-resources-summary.txt`) |
| A5 interactions | same scratch | **rc 1**; complete true; `abortedAt` null ×6; problems: 1 per pass, `group setup: no Ctrl+D copy` (the STOP); 24 group rows have < 3 non-null samples (`a5-interactions-summary.txt`) |
| — | `npx biome check` on the 4 perf files | rc 1, "No files were processed": `perf/**` is ignored (L30); typecheck is the evidence (`biome-scoped.log`) |
| — | budget JSON diff vs HEAD | same ids and order; only the `note` of the listed rows differs (`budget-shape.txt`) |
| A6 | claims at end | see below |
| A7 | code-reviewer | see below |

**A5 failing assert rows (the 14b-ii re-rule input; 13 rows):**
- `interact.zoom.30.out.path-rewrites`: deterministic, median 2 [2, 2, 2], budget == 3. This is the **only failing assert not caused by the STOP**, and it comes from the virtualization sketch.
- The other 12 are group rows, null or 0 because of the STOP:
  - `interact.drag.group.{stopped,playing}.move-components-per-move` (+ `.6x`)
  - `.release-commits` (+ `.6x`)
  - `interact.drag.group.playing.move-restarts` (+ `.6x`)
  - `interact.harness.drag-group-live` (+ `.6x`) = 0

**A6 claims at end (`claims-end.txt`)** against the planning output:
- **Allowed by §7:**
  - K2 `c3ee1d6 9`;
  - K6/K6b doc 255 exists, l.4 exact, 7 headings;
  - K7 in-progress 5, doc 254 l.4 as ruled;
  - K17 applies-to-tree no, lane-applies yes;
  - K18 exists;
  - K20 total 66 → 55, interactions 34 → 27, resources 11 → 6, scale 10, `studio-lab` 10, page-audioClips 1, model-helper 2.
- **Not in the §7 list (claim gaps for B/C, both forced by the mandated work):**
  - K20 per-file `perf/lib/page.ts` 1 → 2: the mandated helper's selector `[data-track-id][data-clip-count]` matches the grep's `\[data-clip`.
  - K27 superseded-docs 20 → 21: doc 255 must name the specs it changes, so it matches the K27 grep.

## Reviewer (code-reviewer, real subagent run)
- **Verdict:** 8/10, no Critical or High.
- **Medium (fixed):** doc 255 did not name `scale.clips.in-window.min-zoom-mid` 24 → 19 as the one intended deterministic change. Doc 255 now says so, notes that B's HEAD baseline already contains 19, and says why the scale spec hits are not tabled. This was a doc-only edit; the delta re-review is recorded below.
- **Lows not applied** (not required; a code change now would need fresh A4 runs):
  - **L28 conflict, rejected:** the reviewer suggested "C round 399 pending" for l.4. L28 forbids the pending form.
  - Add `|| mountedClips > count` to the R-c check (interactions; the scale patch too).
  - `expect.poll` intervals are slower than `toHaveCount` (no row change at HEAD).
  - `modelClipCount` undercounts with a collapsed group (now documented as a precondition in doc 255), and returns 0 when no lane exists.
- **Planner-patch Lows (signals for B, not A's to fix):**
  - the gap check uses the `Math.max` lane count while the model row uses the sum;
  - the right edge `box.right` includes the scrollbar width;
  - a NaN `data-clip-start` silently weakens the gap check;
  - the scale in-window notes still open with "intersects the timeline scroller's box".
- **Architecture note:** none.
- **Delta re-review of doc 255:** see the addendum at the end.

## Signals for B / root
- the STOP above;
- `res.harness.clips-1` is still DOM-sourced (707);
- the two claim gaps (K20 page.ts, K27);
- `interact.zoom.30.out.path-rewrites` = 2 on the sketch;
- the reviewer's Lows above;
- A-R398-ARCH-FIND-TIMELINE-SCROLLER is unchanged: no refactor done.

## Known gaps
- The group-drag rows cannot run on the virtualized tree until B rules on the STOP.
- The 1280×720 viewport does not apply (no app change).
- The scratch was deleted by absolute path (L60).

## Exact next C checks
- SOURCE-SCOPE, CLAIMS (expect the deltas above, including the two unlisted ones), AUTH.
- INTERACT-HEAD, RES-HEAD, SCALE-HEAD, PERF-LIB, BUDGET-SHAPE, NO-APP-CHANGE, DOCS.
- INTERACT-VIRT will show the STOP's group problem. Per L22 a STOP on a ruled clause gets a short round; B decides.

## Acceptance actually passed (A's own runs; C verifies)
- **Passed:** A1, A2, A3, A4 (all three specs), A5 scale, A5 resources.
- **Not passed:**
  - A5 interactions: `problems` is not [] (the STOP), and 24 rows are not non-null;
  - A6 has two deltas outside §7;
  - A7: no Medium+ left open from the first review; see the addendum for the delta review.
- The scope is not complete because of the STOP.

## Addendum: delta re-review (code-reviewer, real subagent run)
- **Medium closed.** The reviewer checked the 24 → 19 claim against `c-round-398/perf-results/latest-scale.json` and `a4-scale-compare.txt`. The other 16 scale deterministic rows are unchanged.
- **Every new doc 255 claim** matches its evidence file. Score 9/10, no Medium+.
- **Its two Low suggestions are applied** (doc-only): a source file cited for the 24, and "12 group asserts + 1" wording.
- No perf code changed after the first review.
- **A7: passed.** No Medium+ is open.
