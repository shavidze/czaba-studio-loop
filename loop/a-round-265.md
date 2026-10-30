# A round 265: SABA-B-11c stage 1 (background time selection, no clip clamp, marquee on Ctrl/Cmd)

**STOP conditions (§2.8):** none hit.
- Changes stay inside the 9 grants and the 2 new files.
- No test outside §2.5 went red.
- No rewrite removed an assertion.
- Every mutant turned its rows red.
- `sha256sum -c` of the frozen list returned rc 0 before and after.
- The perf in-clip contract holds: BT7, plus A's own browser probe for IN-CLIP-SAME with 0 lane overlays.

**L11 timeouts:** no covering test is above 50 % of its timeout. The slowest are:

| Test | A's time | Gate 264 | Limit |
|---|---|---|---|
| UC5 (`track-group-collapse-ui`) | 4.21 s | 4.01 s | describe 20 s (21 %) |
| TG1 (`track-groups-ui`) | 3.32 s | 3.27 s | describe 20 s (17 %) |
| SE2, the slowest in `grid-snap-edit` | 0.63 s | — | default 5 s |
| SP2, the slowest in `grid-snap-position` | 0.54 s | — | default 5 s |
| BT1, the slowest in the new file | 0.79 s | — | default 5 s |
| `shortcuts.test.ts`, whole file (6 tests) | 0.03 s | — | default 5 s |

The file totals are 33.0 s / 30 tests for `track-group-collapse-ui` (gate 264: 46.7 s) and 20.5 s / 14 tests for `track-groups-ui` (gate 264: 20.7 s).

HEAD `2ea196e`. Nothing was committed or pushed.

## Changed files
| File | Change |
|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | `MarqueeGesture.mode` (`'marquee'` on Ctrl/Meta, else `'range'`), the background range branch (`updateRange`), `timelineSecondsRef`, and the `timelineSeconds` prop on `<ArrangementLane>`. See "Range branch" below. The marquee and click paths are unchanged. `resolveSnapStep` and `snapTimeToGridOrEdges` are imported from `grid.ts`, which is not edited. |
| `app/components/arrangement/ArrangementLane.tsx` | Optional `timelineSeconds` prop. Its fallback is `timelineWidth / pxPerSecond`, because `grid-snap-ui` and `gesture-guard` mount the lane directly. `isRangeInClip` uses the same ±1e-4 predicate as before. `laneRange` = an all-tracks range, or a range on this track that is not inside any clip. The existing `arrangement-lane-range` element now renders `laneRange`. The "· all tracks" suffix appears only when `allTracks` is set, and the all-tracks text is identical to before. The prop is passed on to each clip. |
| `app/components/arrangement/ArrangementClip.tsx` | Optional `timelineSeconds` prop (default `Number.POSITIVE_INFINITY`, because `gesture-reentry` mounts the clip directly). The clamp `[clip.start, clipEnd]` is replaced by `[0, timelineSeconds]`. Everything else is unchanged. |
| `app/lib/arrangement/shortcuts.ts` | `select-area` ("Add clips in an area to the selection", `['Ctrl + drag on a lane']`) after `add-to-selection`, and `select-time` ("Select time", `['Drag in a lane']`) before `cut-time`. Neither has `ariaKeyShortcuts`. |
| `__tests__/grid-snap-position.test.tsx` | SP13: `ctrlKey: true`, and the title says "a Ctrl marquee". All assertions kept. |
| `__tests__/track-group-collapse-ui.test.tsx` | UC10b: same change. |
| `__tests__/track-groups-ui.test.tsx` | TG9: same change. |
| `__tests__/grid-snap-edit.test.tsx` | SE8: the title is now "…continues past it", and it asserts the exact `{ start: 7, end: 24, trackId: 'music' }`. HEAD asserted `end: 23`. |
| `__tests__/shortcuts.test.ts` | SC1: `select-area` and `select-time` added to `EXPECTED_ROW_ORDER`. Nothing else changed. |
| **new** `__tests__/background-time-selection-ui.test.tsx` | BT1–BT9, 16 tests. The fakes come from `createWorkspaceTestEnvironment`. The mount and lane helpers are local. |
| **new** `docs/implementation/2026/quarter-IV/198-saba-b-11c-background-time-selection.md` | l.4 = `**სტატუსი:** In Progress (stage 1 of 2; C round 265 PASS)`. It contains the TEMPLATE headings in order, and its row citations exist. |

### Range branch (`StudioWorkspace.tsx`)
- **On the first move past the 4 px threshold** (`Math.hypot`, as today): `selectClip(null)` and `setActiveTrack(origin)`, once.
- **On every move:**
  1. The step is `resolveSnapStep(snapEnabled && linesShown ? grid : null, linesShown ? grid : undefined, altKey)`, the same inputs as the in-clip path.
  2. The snap targets are the grid lines plus the markers.
  3. The time is clamped to `[0, timelineSeconds]` after snapping.
  4. Both ends are rounded to ms.
  5. If `end > start`, the range is `{start, end, trackId}`; otherwise `null`.
- **pointercancel** keeps the last range.

## Side effects of the replaced marquee branch (L49)
| Effect | Ruling | Covered by |
|---|---|---|
| (a) `setTimeRange(null)` | Kept for the marquee; the new range replaces it in range mode. | BT4, which sets a range before the Ctrl/Meta drag and asserts `null` mid-drag and after; BT1 for the range. |
| (b) `selectClips(union(base, found))` | Kept for the marquee. In range mode it becomes `selectClip(null)` once, plus the active track becomes the origin lane. | BT4 (union `['m1','m2']`); BT1 (selection `[]`, `activeTrackId` 'music'); BT1-replace (a selection made mid-drag survives the next move, so the clear runs once). |

## Tests actually run (from `store/`)
Logs are in `a-round-265/`.

| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.txt`) |
| `npm run lint` | rc 0 (`lint.txt`). The repo-wide warnings are pre-existing. Scoped Biome on my files reports 0. |
| `npx biome check` on the 4 granted sources, the new test and the 5 rewritten tests | rc 0, "No fixes applied" (`biome-scoped.txt`) |
| `npx vitest run` on the new file, the 5 rewritten files, `delete-selection-ui`, `shortcut-sheet-ui`, `workspace-strings-ui` and `selection` | **10 files, 166 tests, all passed** (`vitest-targeted.txt`) |
| `sha256sum -c --quiet …/b-round-264-r265-tree-sha256.txt` | rc 0 before the edits and after the final edit |

I did not run the full suite or `npm run verify` (speed rules).

### Mutants
Scratch copy `/home/runner/czaba-project/tmp/a265-scratch`: an rsync without `node_modules`, `.git`, `build` and `test-results`, with `node_modules` symlinked. The script is `a-round-265/mutants.sh` (a copy of `tmp/a265-mutants.sh`, which does not survive the machine). Each run uses the new file only. After the last run the scratch `app/` was restored to match `store/app` (`diff -rq` was clean). The control run is 16/16 green.

| Mutant | Result | Red at `background-time-selection-ui.test.tsx` lines |
|---|---|---|
| M1: marquee for every background drag | 10 failed | 278 (BT1 no marquee), 294, 304, 323 (BT2), 337, 343 (BT3), 371 (BT3 empty), 435 (BT6 bg), 458 (BT8), 477 (BT9) |
| M2: the clip clamp restored | 1 failed | 420 (BT6 in-clip) |
| M3: the overlay only for all-tracks ranges | 6 failed | 283 (BT1 overlay), 295, 305/234, 344 (BT3), 421 (BT6), 478 (BT9) |
| M4: HEAD `StudioWorkspace.tsx` | 10 failed | 278 (BT1 "no marquee"), and the same rows as M1 |
| M5 (extra, for the reviewer fix): the zero-length guard only when snapping | 1 failed | 467 (BT9 vertical-only) |

The §2.5 requirements are met:
- M1 turns BT1, BT3 and BT9 red.
- M2 turns BT6 red.
- M3 turns BT1's overlay assertion red.
- M4 turns BT1's "no marquee" assertion red.

Outputs: `a-round-265/mutant-{control,M1..M5}.txt`.

### A's own browser probe (not C evidence)
Script `a-round-265/probe-a265.mjs`, adapted from B's `probe-11c.mjs`. It ran against the existing :5173 server on the final code, in a fresh context per viewport, after setup S. Results: `a-round-265/probe-a265.json`, with screenshots `bg-range-*.png` and `clip-past-start-*.png`. There were 0 page errors at 1440×900 and at 1280×720. Both viewports matched C's expected values:

| Row | Result |
|---|---|
| CLIP-PAST-START | "00:06.250 — 00:12.500", 1 Music overlay |
| IN-CLIP-SAME | "00:12.500 — 00:20.000", 0 lane overlays, in-clip label shown |
| BG-RANGE | 0 marquee mid-drag, "00:01.000 — 00:07.500", 1 Music overlay `aria-hidden` "true" without "all tracks", insert marker hidden |
| BG-EMPTY-DELETE | the `deleteRangeEmpty` status, clips `["10.000"]` |
| BG-INTO-CLIP | "00:01.000 — 00:15.000"; Delete gives `["15.000"]` and "Deleted 00:01.000 — 00:15.000 on the Music track; the gap remains."; Ctrl+Z gives `["10.000"]` |
| MARQUEE-CTRL (Control) | marquee mid-drag, no range; Delete gives "Clip deleted; the gap remains." and 0 clips |
| VERTICAL | the range stays on Music, 1 overlay |
| CLICK-SAME | insert marker "3.000", visible |

I did **not** run SNAP, the Shift half of MARQUEE-CTRL, ALL-TRACKS, PLAYING, SHEET, SCREEN-BUDGET, FOCUS-SAME or G265-AUTH in the browser. They are C's.

The first probe attempt timed out waiting for "Demo collection ready", most likely because Vite was recompiling after my edits. A diagnostic load 1 minute later showed the ready status and 0 page errors (`diag.mjs`), and both later probe runs passed.

## Code review (code-reviewer subagent, actually run)
Score 8/10, no High findings. The reviewer had no shell, so it read the working tree without running `git diff`.

| Finding | What I did |
|---|---|
| **Medium 1:** a vertical-only drag (≥ 4 px by hypot, dx = 0) with Snap off made a zero-length range `{X, X}`. This could also happen at the 0 or extent bound. | Fixed in the background path: both ends are rounded first, and `end > start ? range : null`. This also covers "both ends on one line". A vertical-only drag now ends like HEAD's empty marquee: selection cleared, no range. I kept the hypot threshold, because the task says "today's threshold applies". New row: BT9 vertical-only, red-proofed by M5. |
| **Medium 2:** spec parts untested. | Added three rows. BT1-replace covers replacing an all-tracks range, the selection clear running once, pointercancel keeping the last range, and listeners removed after cancel. BT2-marker covers snapping to a marker at 5.45 between grid lines. BT9 is above. **Not added:** "a hidden grid means no snap" on the background path. The adaptive grid changes its division with zoom, so a deterministic hidden-grid state needs more setup. That path uses the same `gridLinesVisible` inputs as the click branch and the in-clip path. Recorded as a gap for C and B. |
| Low 1: rounding before the equal-ends compare | Fixed in the background path. In the clip path I kept the "one line → no range" rule unchanged, as §2.1 item 2 requires. That path can still make a `{0, 0}` free range when a drag starts at 0 s and goes left. The same behaviour existed at HEAD at `clip.start`. This is a note for B, not fixed. |
| Low 2: the range drifts if the timeline scrolls sideways mid-drag | Same behaviour as the in-clip path. Zoom and follow-scroll are already blocked during a gesture. Note for B. |
| Low 3: `'Ctrl + drag on a lane'` spacing | Kept: it is the exact text §2.3 prescribes. Cmd is not mentioned, the same as `add-to-selection`. |
| Low 4: two overlapping clips that both contain the range would each draw an in-clip overlay | Pre-existing predicate (HEAD had the same per-clip rule). Note for B. |
| Low 7: a shadowed `current` | Renamed it to `pointerTime`. |

### Architecture notes (proposals for B and root; not acted on)
1. **Duplicated range logic.** `StudioWorkspace` `updateRange` repeats the in-clip anchor, snap, bound, equal-ends and rounding logic from `ArrangementClip`. Proposal: one pure `resolveTimeRangeDrag({ anchorTime, deltaSeconds, step, markers, bound })` in a new `lib/arrangement/` file with unit tests, used by both. Value: medium. It would also give the clip path the rounded equal-ends rule.
2. **Prop plumbing.** `timelineSeconds` goes StudioWorkspace → Lane → Clip, plus `timelineSecondsRef`. Proposal: compute the bound in one owner. Value: low.
3. **Naming.** `MarqueeGesture` and `marqueeCleanupRef` now also carry range gestures, and range mode carries an unused `base: []`. Rename only together with item 1.
4. **Alternative coordinate source.** Recompute the time from the lane rect on each move instead of `clickTime + dx/pps`. That would survive a mid-drag scroll. It fits best inside item 1.

## Known gaps / notes for B
- **Deviation from §2.1 item 1 (last bullet), B to confirm or revert (L10).** The background path returns `null` for any `end === start` after ms rounding, not only when both ends snap onto one line. On this path a free zero-length range never existed at HEAD (a background drag was a marquee there), so nothing regresses. The reason is the reviewer's Medium 1: a vertical-only drag made `{X, X}`. Covered by BT9 vertical-only (M5).
- **Hidden grid on the background path** has no jsdom row (see Medium 2 above). C's SNAP row covers only grid and Alt.
- **Vertical-only drag.** It is not a click (no insert-marker move), because the hypot threshold is kept. It ends like an empty marquee: selection cleared, active track set, no range. If Live treats it differently, that is a question, not a fix.
- **Clip path `{0, 0}`.** The free in-clip range can be `{0, 0}` at the 0 bound (Low 1 above).
- **GATE264-S2 (AltGr).** This round edited `StudioWorkspace.tsx`, so re-grep the reviewer's l.2307–2338 references on round 265's published commit, as the task says.

## Exact next C checks
- **SOURCE-SCOPE:** expect 9 ` M` and 2 `??`, sha rc 0, HEAD `2ea196e`.
- **CLAIMS (K1–K24 + L29 grep).** K4 and K8 now differ in line numbers in the working tree; they are planning claims about HEAD, so run them against HEAD (`git show HEAD:…`).
- **TESTS-TARGETED:** the §2.7 set, 10 files / 166 tests.
- **REWRITES:** diff the 5 files against HEAD.
- **MUTANTS:** M1–M4 on C's own scratch.
- **Browser rows, both viewports:** BG-RANGE, BG-INTO-CLIP, BG-EMPTY-DELETE, CLIP-PAST-START, IN-CLIP-SAME, SNAP, MARQUEE-CTRL (Control and Shift halves), CLICK-SAME, VERTICAL, ALL-TRACKS, PLAYING, SHEET (50 rows, the 2 new rows in order, one scroller, overflowX 0), SCREEN-BUDGET, FOCUS-SAME.
- **Other rows:** LESSONS, DOC-198 (l.4 byte for byte, the headings subsequence, the row citations BT1–BT9 / SP13 / UC10b / TG9 / SE8 / SC1), G265-AUTH.
- **Probe first:** a vertical-only background drag with Snap off. Expect no range, no overlay and the selection cleared.

## Scope completed (A's view; C decides)
I implemented and tested §2.1–2.5 in jsdom, wrote doc 198 and ran the review. I have **not** marked any §4 browser row as passed: my probe is supporting data only. The whole SABA-B-11c stays open. Stage 2 (relative snap) waits for Saba's R49-T answer.
