# A round 350: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1

STOP — needs B ruling on A-MUTANT (DP71 is not red on M-B2)

Basis: §1.2 and §4 ("a mutant cannot be made red on its test").
- **Measurement.** `a-round-350/mutant-M-B2.log`: DP66 and DP67 fail, DP71 passes (2 failed, 4 passed).
- **Cause in the source.** `useArrangementPreviewLaneClips` is `useArrangementPreview(useShallow((state) => selectPreviewLaneClips(...)))` (`app/contexts/ArrangementContext.tsx` l.4535–4542).
  - On an audio-only drag, the video lane's filtered clip list stays element-wise equal, so M-B2's body subscription never re-renders the dock.
  - HEAD already passes DP60 for the same reason.
  - It is also the fact B gives in §1.2 for the element-wise reuse: "not observable in the DOM".
- **Nothing was forced.** DP71, the mutant definition and the dock are exactly as specified.
- **Options for B.** Both alternatives were run on a scratch copy; logs and diffs are in `a-round-350/`.
  - (a) Name a different mutant for DP71. Either:
    - **A-M5:** delete the overlay's equal-value skip in `writeVideoFade`. DP71 fails. See `mutant-A-M5.log` / `.diff.txt`.
    - **M-B2′:** the dock body subscribes with no shallow dedup, `useArrangementPreview((state) => state.preview)`. DP66, DP67 **and** DP71 fail. See `mutant-M-B2prime.log` / `.diff.txt`.
  - (b) Keep DP71 as a regression guard that matches HEAD, with no mutant row, as §1.2 already does for the element-wise reuse.
- **Effect on C.** C's MUTANT row predicts "M-B2: DP66, DP67 and DP71 red". C will see DP71 pass for the same reason.

The STOP does not affect the patch or any other row. Everything else below was run and passed.

## Changed files (exactly 3, 0 untracked)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementVideoDock.tsx` | `git apply b-round-349/sketch/dock.patch.txt`, byte for byte. `cmp` against `b-round-349/sketch-ArrangementVideoDock.tsx` shows them identical, and `git apply -R --check` succeeds |
| `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | Adds an import of `videoFadeOpacityAt`, a new describe block with DP66–DP71 and small helpers (`VIDEO_DOCK_COMPONENTS`, `videoDockRenders`, `videoFadeHandleOf`, `observeVideoOpacity`). Existing DP tests are unchanged |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | l.4 status and the title line as in §1.3; the changed-project list; a new section `### ეტაპი video-trim-fade-cost` (items 100–104: cause, reader, release-order ruling, B's measurements, record-then-assert); changed files; testing (DP66–DP71, mutants, A-PERF); TODO (video-trim-fade done; queue: conversion of the 22 rows → MASTER-GROUP-FADER-PROPS → FADE-RELEASE-COMMITS). Still 7 `## ` headings |

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | **PASS**: byte-identical to `claims-350-planning-output.txt` | `a-round-350/claims-pre.txt` |
| A-CLAIMS final | **PASS**: K3, K4, K6, K7 and K12 equal the sketch output. K2 `7f56989 3`, K5 `DP66+ 6`, K8 11, K10 `0` / `untracked 0`, K11 `7 1 0 1`, K13 all 1 | `a-round-350/claims-final.txt` |
| A-TYPE | **PASS**: `npm run typecheck` rc 0 | `typecheck.log` |
| A-LINT | **PASS**: `npm run lint` rc 0, 205 warnings (same as HEAD). Biome on the 2 owned code files: rc 0, no fixes | `lint.log`, `biome-owned.log` |
| A-UNIT | **PASS**: 5 files, 143/143, including DP66–DP71 | `vitest-unit.log` |
| A-COVER | **PASS**: 107 files, **1774/1774** (B's 1768 plus 6). The slowest test is TC10 at 4.8 s against a 15 s timeout (32 %). CP12a–d are 7.7–8.4 s against 30 s. Nothing is above 50 % of its timeout | `vitest-cover.log`, `cover.json` |
| A-MUTANT | **NOT PASSED as written, 5 of 6 pairs fail as expected:** M-B1 → DP69; M-B2 → DP66 and DP67 but **not DP71** (STOP above); M-B3 → DP68; M-B4 → DP70. The control run passes 6/6. Extra mutants: A-M5 → DP71, M-B2′ → DP66, DP67 and DP71 | `mutant-*.log`, `mutant-*.diff.txt` |
| A-PERF | **PASS**: production build, run alone (nothing else running), rc 0, 8.2 min. `complete` true, `failures` [], 252 rows, **70/70** asserts pass, 0 NEW, 172 EQUAL. **Exactly 9 deterministic DIFFs, the same set and values as B's sketch** (diffed against `perf-rowcmp-sketch-vs-c349.txt`). Wallclock per move while playing: trim 12.883, fade 2.95, move 9.883, all inside B's ranges. `release-commits` and both restart rows are unchanged. The 3 video liveness rows are [1, 1, 1]. `durationMs` **475397** (52.8 %, under the 540000 STOP) | `perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c349.txt`, `perf-checks.txt` |
| A-REVIEW | **PASS with rulings**: the real `code-reviewer` subagent ran on the 3 files. 0 Critical/High; score 8.5. Each finding is ruled below. None needs a change to the patched code | this file |

### Perf DIFF rows (C349 → A; all lower; each equals B's sketch)
| Row | C349 → A |
|---|---|
| video-trim stopped per-move / max / playing max | 18.683 → 12.817, 19 → 15, 19 → 15 |
| video-fade stopped per-move / max / playing max | 8.85 → 2.95, 9 → 3, 9 → 3 |
| video stopped per-move (assert ≤ 24) / max / playing max | 15.75 → 9.883, 17 → 13, 17 → 12 |

### Review findings and rulings
- **A-R350-REVIEW-SEEK-TEST (reviewer Medium, test gap).** No jsdom test covers the stopped-video seek path, which the reader and the preview subscription now drive.
  - **Ruling:** not added. A DP72 would break claim K5 (`DP66+ = 6`).
  - The jsdom fixture has no video URL for `film`, so the seek key is `none`. A real seek needs an imported blob, as in DP64.
  - Coverage comes from C's browser rows BEHAVIOUR (trim-inside: `currentTime` unchanged), RELEASE (0 `currentTime`/`src` writes after pointerup) and PLAY-SYNC, and from B's probes.
  - **For B:** a jsdom seek-target row is a candidate for a later round.
- **A-R350-REVIEW-CACHED-TRACKS (Low, patched code).** When the clips are element-wise equal, the cached lane keeps the old base's `tracks`.
  - **Ruling:** no edit. It is in the patched code (a §4 STOP if changed). It is safe today: the reader is rebuilt on every commit, and previews never change `tracks`.
  - **For B:** optionally add `cachedLane.tracks === base.tracks` in a later round.
- **DP70 caption/gap checks cannot fail (Low).** A fade commit does not change the source or the gap. Kept because §1.2 asks for them. The overlay half is the part that fails on M-B4.
- **DP69's `writtenValues` check is redundant (Low).** Kept because §1.2 asks about both the old and the new value.
- **The `'Video Fade In'` literal (Low).** `VIDEO_FADE_LABELS` in `ArrangementClip.tsx` is not exported, so the literal stays, as in DP13.
- **Architecture note for B/root (proposal, not done):** the "read the preview without rendering" reader (`useVideoLanePreviewReader`, `ArrangementVideoDock.tsx` ~l.197–233) depends on the order of operations inside `updateHistory`. **Keep** it while it has one consumer. If a second lane consumer needs the same pattern, open one bounded task to move it to `useArrangementPreviewLaneReader(trackId)` in `ArrangementContext.tsx`, next to `useArrangementPreviewLaneClips`. That task must keep DP66–DP71 and the M-B1 release-order mutant failing as now.

## Known gaps
- The A-MUTANT STOP for the DP71 ↔ M-B2 pair, above.
- No jsdom row covers the stopped-video seek path (A-R350-REVIEW-SEEK-TEST). Browser rows cover it.
- A did not run any dev-server probes (NAMES, BEHAVIOUR, RELEASE, PLAY-SYNC). Those are C's rows.
- The full suite, build and `npm run verify` were not run by A (speed rules). The gate runs them.

## Exact next C checks
1. `bash b-round-349/claims-350.sh` must equal `a-round-350/claims-final.txt`.
2. `git status --short --untracked-files=all` shows the 3 files; `git apply -R --check b-round-349/sketch/dock.patch.txt` succeeds.
3. MUTANT: M-B1 → DP69 should fail (unit), plus the browser release probe on a scratch dev server with its own `cacheDir` (L38). M-B2 → DP66 and DP67 fail, **DP71 passes** (expected; see the STOP). Optionally M-B2′ / A-M5 if B rules (a).
4. A-UNIT's command; PERF alone, compared with `a-round-350/perf-rowcmp-vs-c349.txt`.
5. NAMES / BEHAVIOUR / RELEASE / PLAY-SYNC / G350-AUTH at both viewports as in §2.2.
6. DOCS: doc 232 l.4, `### ეტაპი video-trim-fade-cost` ×1, 7 `## ` headings; the numbers in item 103 match B's §0.4, and the A-PERF line matches `perf-checks.txt`.

## Scope completed
§1.1 and §1.3 are done. §1.2 tests are added and pass. The A rows pass except A-MUTANT's DP71/M-B2 pair, which is a STOP awaiting B. No commits, pushes or installs. Protected files are untouched (K8 11). The scratch copy `/home/runner/a350-scratch` was deleted.
