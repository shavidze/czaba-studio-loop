# A round 346 — PERF-DRAG-PREVIEW stage c6-i (lane/clip header icons hoisted; three round-345 Lows closed)

No STOP. Scope of stage c6-i completed. c6-ii, the conversions and the video trim/fade rows were not started.
- Logs are in `a-round-346/`.
- No dev server was started. The perf spec started its own production server on :5188, as its config does, and stopped it.
- No commits or pushes. No protected file was touched (K8 11).

## Changed files (5, 0 untracked)
1. `app/components/arrangement/ArrangementLane.tsx`: B's `source.patch.txt` applied unchanged. Adds `LANE_FOLD_CHEVRON_RIGHT`, `LANE_FOLD_CHEVRON_DOWN` and `LANE_ADD_PLUS_ICON`.
2. `app/components/arrangement/ArrangementClip.tsx`: B's patch applied unchanged. Adds `CLIP_HEADER_VIDEO_ICON` and `CLIP_HEADER_GRIP_ICON`.
3. `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`:
   - `componentName` now also reads a forwardRef's `displayName` (narrowing only, no `as`).
   - The `video.client` module mock is added, and both mocks are reset in `beforeEach`.
   - DP62 now has a `try/finally`.
   - New DP63 and DP64, in a new describe for c6-i.
4. `perf/budgets.interactions.json`: notes only, on the 3 video rows. The JSON was rewritten with `json.dumps(indent=2)` and the format is unchanged. Still 230 rows and 60 asserted.
5. `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`:
   - l.4 status and the title.
   - New section `### ეტაპი c6-i` (items 78–81).
   - Changed files, testing (DP62/63/64, mutants, perf) and TODO (c6-ii → conversions → video rows).
   - Still 7 `## `.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | Equals `claims-346-planning-output.txt` | `a-round-346/claims-pre.txt` |
| A-CLAIMS final | K2 `645b2e6 5`. K3, K4 and K5 equal the sketch output. K6 66 / DP62 1 / DP63 1 / DP64 1 / function-only 1 / mock 1 / finally 21. K7 `230 60 stale 0`. K8 11. K10 0. K11 `7 1` | `a-round-346/claims-final.txt` |
| A-TYPE | rc 0 (rerun after the review fixes) | `typecheck.log`, `typecheck-2.log` |
| A-LINT | rc 0, 205 warnings, on the final tree after the review edits | `lint-2.log` (first run: `lint.log`, also 205) |
| /check | Biome on the 3 code files: rc 0, no fixes left. One `biome format --write` was run on the test file after the review edits | `biome-check-final.log` |
| A-UNIT | drag-preview-render 66/66. Together with track-layout, lane-strings-ui, studio-theme-obsidian and video-dock-strings-ui: 5 files, 133/133. Slowest test 1701 ms, against the 5000 ms default | `vitest-covering-2.log`, `vitest-covering-verbose.log` |
| A-MUTANT (scratch `/home/runner/a346-scratch`, final test file) | (1) Lane chevron inline again → DP63 red ("trimStart: expected 2 to be 0"). (2) Clip grip inline again → DP63 red. (3) `ArrangementVideoCaption arrangement={arrangement}` → DP64 red: the caption still shows `film.mp4` in the middle of the drag. Scratch restored: 66/66, and its files are byte-equal to the store. Store `git status` is unchanged by the mutants | `mutant2-*.log`, `scratch-restored-2.log` (first pass: `mutant-*.log`) |
| A-PERF (production, alone) | rc 0, `complete` true, `failures` [], 230 rows, 60/60 asserted pass. Against C345: 108 EQUAL, 57 DIFF, 0 NEW, and **every DIFF is lower, none higher**. `durationMs` 463379 | `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c345.txt`, `perf.log` |
| A-PERF-LIB | 34/34 | `perf-lib.log` |
| A-REVIEW | `code-reviewer`: 0 Critical/High/Medium, 4 Low, score 9/10. Lows #2, #4 and #5 were fixed (see below). Low #3 is open | below |

**A-PERF values** (per move, with the max in brackets):

| Gesture | HEAD | Now | Expected |
|---|---|---|---|
| trim | 21.633 (22) | **17.7 (18)** | about 17.7 |
| move | 22.8 (101) | **18.467 (89)** | about 18.9 |
| fade | 9.833 (10) | **5.9 (6)** | about 5.9 |

- **Why move is below the estimate:** the project-end crossing commit also drops by 12, from 101 to 89.
- **Other rows that went down,** because lane icons no longer re-render on any lane render:
  - group: 26.969 → 21.219
  - lane: 24.906 → 20.531
  - video move: 23.617 → 17.717
  - click: 100 → 88
  - play start/stop: 86 → 76
  - zoom: 95 → 83 (30×: 240 → 170)
  - select same-lane: 22 → 16
- **The perf run was on the final source.** The test-file review edits came after it and do not affect perf.

**Review Lows:**
- **Fixed:**
  - #2: both mocks are now reset in `beforeEach`, so the never-resolving decode mock cannot leak.
  - #4: the describe is renamed to "header icons skip drag moves; the dock caption follows the store".
  - #5: the DP63 handle closures now take the clip parts.
- **Open, Low:** #3. DP64 waits for the import with a fixed 5-tick microtask loop. If the import pipeline grows, it fails loudly ("imported video clip missing"); it does not pass vacuously.
- **Info only:** the `ChevronRight` check in DP63 has no positive control, because no lane is folded at mount. The lane red proof rests on `ChevronDown` and `GripVertical`.
- **Architecture note:** none.

## Deviations from the task text (§1.2)
- **DP63 mounts `[...AUDIO_CLIPS, PROJECT_END_CLIP]`, not `AUDIO_CLIPS`.**
  - With `AUDIO_CLIPS` alone, the header move extends the project end. The crossing commit then re-renders `ChevronDown` (2 renders), and that chevron belongs to `ArrangementLibrary` or `ArrangementMarkerRow`, not to the lane.
  - B's own `b-round-345/names-sketch-v2.json` shows the same thing: the `move-moves` crossing commit (89) and `harness-clip-click` still contain `ChevronDown` ×2, `ChevronRight` ×1 and `ChevronLeft` ×2.
  - `PROJECT_END_CLIP` (c3 at 20 s) is the existing fixture that DP51–DP60 use for the same reason.
- **DP64 seeks to `committedStart + 1`, not to the literal 1.** The import landed at the start, so it is equivalent. The preview start is asserted `> committedStart + 1`.

## For C / B
- **NAMES row conflict.** §2.2 NAMES says "No `ChevronDown`, `ChevronRight` or `GripVertical` in any move commit". By B's own sketch data, the project-end crossing move commit (89) and the click commit (88) still contain `ChevronDown`, `ChevronRight` and `ChevronLeft` from the library and the marker row, which are outside c6-i. Expected:
  - the non-crossing move commits and every fade/trim commit are free of all three icons;
  - the crossing commit is not.

  Please judge NAMES on the non-crossing commits. **`GripVertical` should be absent from every commit.**
- **`durationMs` 463379 is above 450 000.** This is the same environment Low as round 345 (ROOT-REQ-PERF-TIMEOUT). It is not a failure.

## Known gaps
- A verified nothing in a browser. VISUAL, NAMES (dev :5173) and G346-AUTH are C rows.
- Gate rows were not run by A: the full vitest suite, build, `npm run verify` and e2e smoke.

## Exact next C checks
1. CLAIMS: `bash b-round-345/claims-346.sh` must equal `a-round-346/claims-final.txt`.
2. SOURCE-SCOPE: `git diff --stat` shows 5 files, and `git apply -R --check b-round-345/sketch/source.patch.txt` passes.
3. READ: the diff.
4. UNIT: the 5 files above.
5. C's own MUTANTs on a scratch copy.
6. NAMES: `node b-round-345/names-probe-v2.mjs http://127.0.0.1:5173 c-round-346/names.json`, judged as described under "For C / B".
7. VISUAL `outerHTML` at 1440×900 and 1280×720:
   - the fold chevron, folded and unfolded;
   - both video-import Plus buttons;
   - the clip grip and the Film icon.
8. PERF, alone; expect the A-PERF values above.
9. PERF-LIB: 34/34.
10. G346-AUTH.
11. DOCS: l.4, one `### ეტაპი c6-i` section, 7 `## `.

## B acceptance rows A passed
A-CLAIMS pre and final, A-TYPE, A-LINT, /check, A-UNIT, A-MUTANT, A-PERF, A-PERF-LIB and A-REVIEW (0 Medium or above open). C and gate rows are not claimed.
