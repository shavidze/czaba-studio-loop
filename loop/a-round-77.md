# A — Round 77 report: SRW-16 (FB-10) stage 2b-2 — Ctrl/Option+←/→ also stop at clip edges of the selected tracks (D-29z42)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-22 · Status: **implementation done, awaiting C**. No commit/push/deploy. No server was started or stopped (the :5173 server was not touched). `pgrep -c node` = 1 at start and at end.

## Baseline (verified before any edit)
- HEAD `db9cc255e29d8792e2c67a391519515a0ec2230e`, `git status --short` 0 lines.
- Frozen 453/453 OK, snapshots 4/4 (`168cd442`, `8e0bb133`, `753cecba`, `8576ba44`, CR=0), protected 4/4 (`cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`).
- Pre-flight: read CLAUDE.md, the rules, primitives-map, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, prompts/studio-feature.md and skills/pre-flight.

## Changed files (exactly within the §3 grants)
| File | Change | sha256 prefix / LF / CR |
|---|---|---|
| `app/lib/arrangement/edge-navigation.ts` (new) | `edgeNavigationTrackIds` (N2), `clipEdgeTimesOnTracks` (edges rounded with `roundMarkerTime`, sorted, deduplicated with EPS), `isApplePlatform(platform, userAgent)` (N7: matches only `Mac`/`iPhone`/`iPad`/`iPod`; checks platform first and the UA only when platform is empty; never matches `AppleWebKit`). No React, no `navigator`. | `f6a45cdd3c1c` / 58 / 0 |
| `app/lib/arrangement/markers.ts` | `adjacentMarkerTarget(..., edgeTimes = [])`: nearest marker and nearest edge (strict ±EPS); an edge wins only when it is more than EPS nearer, otherwise the marker wins (N3); a forward edge is clamped to `end`; the end/0 fallback is unchanged. No other byte changed. | `3ffac3132a77` / 210 / 0 |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | Only `stepMarker` and the handle type: an optional `edgeTimes` is passed through. The buttons still call `stepMarker(±1)` (N5). | `e9b38eeee0a3` / 813 / 0 |
| `app/components/arrangement/StudioWorkspace.tsx` | The import, plus only the Ctrl+←/→ branch: condition `arrow && !meta && !shift && ((ctrl && !alt) \|\| (alt && !ctrl && isApplePlatform(navigator.platform, navigator.userAgent)))`, read lazily inside keydown. Edges come from `current.getArrangement()`, `activeTrackId`, `selectedClipIds` and `range`. The gesture block, nudge branch, `timelineNavigationKey` and other keys are untouched. | `dbc6895e5582` / 2037 / 0 |
| `docs/.../066-studio-lab-clip-snap-markers.md` | Status line only, the exact text from the task (GATE76-S4). | `49b775fc2d52` / 108 / 0 |
| `app/lib/arrangement/__tests__/edge-navigation.test.ts` (new) | EU1–EU4 plus the review rows; 21 tests. | `4957dbc94cc2` / 224 / 0 |
| `app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx` (new) | Harness copied from `markers-ui.test.tsx` (lines 1–106); EN1–EN11 (EN8 runs on both Win32 and Linux); 12 tests. | `5a2dcc2c9a94` / 538 / 0 |
| `docs/.../067-studio-lab-marker-edge-navigation.md` (new) | Georgian, LF, follows TEMPLATE: N1–N9, N2/N5 rationale, the Ableton table, files, tests, mutations. Status: awaiting C. | `f0e786c63d53` / 95 / 0 |

End `git status --short`: 4 `M` lines (markers.ts, ArrangementMarkerRow.tsx, StudioWorkspace.tsx, doc 066) and 4 `??` lines (edge-navigation.ts, the two tests, doc 067), as §3 expects. Frozen 453/453 OK and protected 4/4 at the end.

**Naming note for B:** `navigationTrackIds` was renamed to `edgeNavigationTrackIds`, following the code-reviewer (AGENT_DISCOVERABLE rule 1: the old name was easy to confuse with `timelineNavigationKey` in the same handler). B allowed name changes with an explanation.

## Checks actually run (speed rules)
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0 (218 warnings, 1 info repo-wide; not compared against a pre-edit count). Scoped `npx biome check` on the 6 owned code/test files: 0 diagnostics, so none of the repo-wide warnings come from the changed files (Biome lint is per-file). Formatting was applied only to my 2 new test files, via `biome format --stdin-file-path` piped to stdout (no `--write`).
- Targeted vitest (the 9 files from §1; `grep -rl "stepMarker\|adjacentMarkerTarget" app` finds no other test file beyond `markers.test.ts`): **9 files, 202/202 passed** (log `a-round-77/targeted.log`).
- No full suite, no `npm run verify`, no build (left to the root gate).
- **No browser check by A** (C's job). The Apple Option path cannot run on Linux Chromium; it is covered by vitest EN7/EN9/EN11 with a `navigator.platform` stub (own property, removed in `afterEach`) and by Tech Lead R77-T.

## Mutation proofs (each applied to the owned file, the named tests run, then restored and `cmp`-checked OK; logs `a-round-77/mut-*.log`)
| # | Mutation | Red |
|---|---|---|
| a | the workspace passes `[]` edges | EN1, EN2, EN3, EN4, EN5, EN7, EN9, EN10, EN11 |
| b | `edgeNavigationTrackIds` drops the tracks of selected clips | EN2, EU1 (selected clips) |
| c | it drops the range track | EN3, EU1 (range) |
| d | the Apple Option condition is removed | EN7, EN9, EN11 |
| e | the Option condition without the platform check | EN8 (Win32), EN8 (Linux x86_64) |
| f | the ▶ button also passes edges | EN6 |
| g | a coincident edge beats the marker | EN5, EU3 (N3) |
| h (extra) | the edge filter loses ±EPS | EU3 EPS/unsorted row, end-clamp row |
| i (extra) | the end clamp is removed | end-clamp row |

## Code-reviewer (actual subagent `code-reviewer`, 8.5/10, no Critical/High)
Handled within ownership:
- M1: the edge filters' strict-EPS rule was untested → added rows `2.2503±`, `7.7503`, `7.7497` (mutation h proves them).
- M2: order independence → the same rows run with unsorted `[7.75, 2.25]`.
- L3: a rounded edge (29.9996 → 30.000) could step 0.4 ms past project end → forward edge `Math.min(edge, end)`, plus a test (mutation i).
- L5: rename to `edgeNavigationTrackIds`.
- L6: EN7 also checks that Option+Meta+→ leaves the position unchanged and that Option+Shift+→ keeps the old nudge behaviour.
- L7: `Set` instead of `includes`.

Not changed (outside the grant, or a B decision):
- L4 = R77-BUTTON-SHORTCUT-SUPERSET (already recorded by B; the buttons' `aria-keyshortcuts` are frozen by MU6, and Apple users get no hint about Option).
- L5 rule 8: the names `adjacentMarkerTarget` / `stepMarker` now also return non-marker stops; the behaviour is documented only in doc 067, not in `docs/technical/`.
- L5 rule 4: `adjacentMarkerTarget` now has 5 positional parameters.
- L6 rest: the overview, separator and loop-brace guards are not tested with Option (verified in code only).
- L8 (pre-existing, more frequent now): Ctrl+← while playing can land on the same stop again, because the playhead has moved more than EPS past it.
- L9 (pre-existing, N8): non-Apple Alt+←/→ with a selected clip calls `preventDefault` and swallows browser Back/Forward.

**Architecture note (signal for B/root, not acted on):**
- `StudioWorkspace.handleKeyDown` changed in rounds 76 and 77, and each time needed a full-mount harness of about 100 fake lines. The reviewer proposes a pure "key event + selection → shortcut action" resolver (medium cost; the guard order must be preserved). Verdict: keep for now.
- Clip-edge stop logic now spans `markers.ts` (`adjacentMarkerTarget`) and the marker-row imperative handle. If stage 2b-3 uses the same stop set, extract a `timeline-stops` lib then, possibly absorbing `clipEdgeTargets` (`ArrangementLane.tsx:202`).
- Alternative considered: a separate `adjacentTimelineStop` that leaves `adjacentMarkerTarget` marker-only. Judged acceptable as-is.

## B acceptance — what A truly passed
- N1–N9 in vitest: EN1–EN11 and EU1–EU4 green, mutations (a)–(g) red as required. **Passed (vitest only).**
- A's checks: typecheck, lint, targeted vitest. **Passed.**
- Code-reviewer run and findings handled. **Done.**
- Every C browser row (EK-*, REG-*, REG-HYD, G77-3, SOURCE-UNCHANGED, T77-TARGETED): **not run by A**; it is C's job. `realVerified` is not claimed.

## Known gaps / risks
- **New regression lock for B:** EN7 now pins that on Apple, Option+Shift+→ with a selected clip still nudges it (the plain-arrow nudge branch, per N6 "without Ctrl/Meta/Shift"). B never specified this Mac behaviour; keep it in mind for stage 2b-3 or the Lows batch.
- The Apple Option binding has not been verified on a real Mac (R77-T). The vitest stub only proves the logic.
- Edges are 1 ms-rounded stops: a playhead step lands on the rounded edge (up to 0.5 ms off the raw sub-ms clip edge). That is inaudible, and the clamp keeps it from passing project end.
- L8 above: during playback, Ctrl+← can repeat the same stop (pre-existing behaviour).

## Exact next C checks
1. SOURCE-UNCHANGED: the hashes above (8 files), frozen 453/453, protected 4/4, `git status --short` = 4 M + 4 ??.
2. EK-ACTIVE, EK-SELECT, EK-RANGE (record whether the in-clip range drag also selects the stems clip or changes the active track; that adds its edges by N2), EK-BUTTONS, EK-MARKER-SEL, EK-AUDIO (discriminating: Ctrl+→ lands on the sfx clip start and the meter rises within 0.3 s; ▶ lands on 6.300 and stays silent for ≥1 s), EK-PLAYING, EK-ALT-LINUX (Linux Chromium: Alt+→ = plain →), EK-GUARDS, REG-NUDGE, REG-MARKERS, REG-HYD, G77-3. Run both 1440x900 and 1280x720.
3. Pre-change copies (byte-identical to B's snapshots) are in `a-round-77/{markers.ts,ArrangementMarkerRow.tsx,StudioWorkspace.tsx,066-studio-lab-clip-snap-markers.md}`; the end state is in `a-round-77/final/` (the 4 code files); `a-round-77/mutate.py` is the mutation helper. Use these for SOURCE-UNCHANGED or a scratch re-run of mutation (a)/(e).
4. T77-TARGETED: the 9-file vitest list above; expect 202 passed.
