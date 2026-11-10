# Sketch review: round 441 (SYS-1 stage 2)

- **Dispatched sketch:** `b-round-440/sketch-441.patch.txt`, sha256 `8b53e26dfee2397d9d860a200955527d22e48efc06b8660635138f386a0f16a8` (v3).
- **Reviewed:**
  - v2 `b-round-440/sketch-441-v2.patch.txt`, sha256 `5fd99e42c02abf6d7f3b8d83de520eeef9012ff58b8322de5cf972ab7b9e3553`, by tech-lead (verbatim in `tech-lead-review-v2.md`);
  - the delta v2 → v3 (`sketch-441-v2-to-v3.diff.txt`), by tech-lead (verbatim in `tech-lead-review-v3-delta.md`). Its reply names the approved sha256 `8b53e26dfee2397d9d860a200955527d22e48efc06b8660635138f386a0f16a8`.
- **Reviewed = dispatched:** yes (v3).
- v1 (sha `5eec8f07…`) was never reviewed or dispatched. B's full-suite pre-check on v1 failed `overview-visibility-ui.test.tsx` OV-E1 (`precheck-full-v1.log`), so v2 grants and rewrites that file.

**Verdict:** approve. Tech-lead found 0 Critical/High/Medium on v2 and on the delta.

## Dispositions
| Finding | Severity | Disposition |
|---|---|---|
| (a) The PNR4 outline check is presence-only, so an extra class passes | Low | **Fixed in v3:** the sorted class list is compared exactly (`toStrictEqual`) |
| (b) An unhooked extra child in a lane is not caught | Low | **Fixed in v3:** DXC4 checks `row.children` = `[1,1,1,1]` and 4 lanes. PNR4 checks that every lane row is hooked and that the child count equals the bar count |
| (c) The video mocks keep their resolved value across tests | Low | **Fixed in v3:** `mockResolvedValueOnce` |
| (d) The file-wide `not.toMatch(/isTrackAudible\(/)` is lost, and group Mute is not used in the rendered dialog | Low | **Accepted (ruling S2-R3):** mutant U1 (the dialog ignores groups) is red on UM8b. Grouping the video lane is outside this round. Recorded as TL-R440-UM8-GROUP-MUTE (Low, deferred) |
| (e) The `data-overview-*` prefix is close to `data-overview-clip-id` (GroupHeader) | Low | **Accepted:** there is no collision today, and the names match `data-overview-state` |
| (f) The UM8 and OV1 titles are stale | Low | **Fixed in v3** |
| (g) PNR4 l.498–501, the content-colour l.336 scan, studio-focus-ring and strings still read the Overview source | Low | **Accepted (ruling S2-R2):** these are deliberate source contracts outside the closes list. Recorded in `sys1_other_classname_pins` for RETRO 450 |
| (h, delta) PNR4 counts children but does not check that each child is a bar | Low | **Accepted:** DXC4's strict `[1,1,1,1]` and the bar-hook count cover it. Recorded with (g) |

## HEAD assertion map (stage 2)
| HEAD assertion | v3 counterpart |
|---|---|
| OV1: the source contains the exact overlay `<div className="… inset-0 rounded-panel border border-outline" />` exactly once | PNR4 (rendered, with clips): exactly one `arrangement-overview-outline`, its parent is the root, and its sorted class list equals the six tokens exactly. OV1 (SSR) also asserts `data-overview-state="empty"`, one baseline and 0 outlines (the SSR is empty, so the overlay is not in the SSR html). OV-E1 asserts 0 / 1 / 0 outlines across empty → clip → undo. **Not ported:** token order (ruling S2-R1; mutant O2) |
| PNR4: `overview.firstElementChild` has `rounded-panel`, `border`, `border-outline` and not `rounded-sm` | Found by testid; exact class list (stronger) |
| PNR4: `overview.children[1] :scope > div > div` gives 2 bars, each `rounded-xs` and not `rounded-panel` | `[data-overview-bar]` gives 2 bars, each inside the lanes container. Every lane row is hooked, the child sum equals 2, and the radius checks are unchanged |
| DXC4: `[data-timeline-overview].children[1].children` gives 4 rows, one bar each, with the ladder tokens | Rows come from `[data-overview-lane]` (4, each a child of the lanes container, ids equal to the track order). Bars come from `[data-overview-bar]` (`[1,1,1,1]`, plus `row.children` `[1,1,1,1]`). The ladder and no-brand checks are unchanged |
| UM8: the dialog source contains `isTrackAudibleWithGroups(videoTrack, arrangement)` and not `isTrackAudible(` | UM8b (rendered dialog): "Included" → group solo "Off (M/Solo)" → unsolo "Included", read from `arrangement-export-video-sound`. Mutants U1 and U2 are red. The model asserts in UM8 are kept |
| OV-E1: `children[1]` has no testid and 2 children | The lanes container is found by testid. Its parent is the root, its previous sibling is the baseline, it has 2 children and 2 hooked lanes, and 0 bars while empty |
