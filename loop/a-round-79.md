# A round 79 — SRW-17 (FB-12) stage 1: track groups (D-29z44)

Implementer: A (Claude Opus 5.5) · 2026-10-22 · Status: **implemented + code-reviewed (8/10), awaiting C**

## Baseline (verified at start)
- HEAD `c062147fc29f105454de7728cc4bbbe762f5cb6d`, `git status --short` 0 lines, frozen 459/459 OK, snapshots 5/5 match, protected 4/4 (`cd68eb6e 9f738237 13914809 fa2cf0bc`), all LF, `:5173/studio-lab` 200, `pgrep -c node` = 1.
- Pre-flight: CLAUDE.md, rules, primitives-map, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT (no context change needed: `commitArrangement` is enough), DESIGN_TOKENS, TAILWIND_FIRST, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AUDIO_ARCHITECTURE, prompts/new-component.md, prompts/studio-feature.md.
- TG11 pre-check: `syncPlayback` restarts the graph only on `scheduleKey` (clips + loop) change, so a tracks/groups-only commit does not restart sources (escape clause not triggered).

## Changed files (end state: 5 M + 5 ??, matches §3)
| File | Change |
|---|---|
| `app/types/arrangement.ts` (M) | G1 only: `ArrangementTrackGroup`, `groupId?`, `groups?` |
| `app/lib/arrangement/groups.ts` (new) | pure: `arrangementGroups`, `trackGroupRows`, `rowParentId`, `liveTrackSelection`, `nextTrackGroupName`, `groupSelectedRows` (typed refusal `empty/unknown/video/mixed-parents/gap`), `ungroupSelectedRows` (`no-group`), `normalizeTrackGroupName`, `renameTrackGroup`, `expandShiftSelection`, Georgian status helpers. Additions vs B's names: `liveTrackSelection` (G2 filter) and `normalizeTrackGroupName` (trim + 64 chars). |
| `app/components/arrangement/ArrangementGroupHeader.tsx` (new) | G4 row (28 px incl. border; name button 24 px; `data-group-id`, `data-group-depth`, `data-group-selected`; no `data-track-id`; tokens only; indent `8 + d×12` px inline) + G8 F2 editor (Enter/blur commit, Escape cancel, focus back to name button). No forwardRef (no ref consumer). |
| `app/components/arrangement/ArrangementLane.tsx` (M) | props `selected?`, `depth?`, `onSelectTrack?`; name-button `onClick` still calls `setActiveTrack(track.id)` first, then `onSelectTrack`; indent (`paddingLeft` only when depth>0); `data-track-selected="true"` on the lane row only when selected; aria-label suffix `, მონიშნული`; `bg-brand/20` on the name button when selected. Exported `TRACK_HEADER_PADDING_X_PX` and `TrackRowSelectModifiers`. Fold/height/pan/volume/mute/solo/drop untouched. |
| `app/components/arrangement/ArrangementClip.tsx` (M) | `laneTrackIdAtPointer` + its one caller only (G10) |
| `app/components/arrangement/StudioWorkspace.tsx` (M) | selection + anchor state; `selectTrackRow`, `groupSelectedTrackRows`, `ungroupSelectedTrackRows`, `renameTrackGroupRow`; Ctrl/Cmd+G block directly before `if (modifier) return;`; interleaved rows via `trackGroupRows`; G11 `withTrackGroupRows` inside `resolveTrackLaneLayout` (signature now takes the arrangement; 4 call sites) + effect on group count → `refreshTrackLaneLayout()`. Ctrl+arrow block, marquee code, gesture code and other shortcuts unchanged. |
| `docs/implementation/2026/quarter-IV/068-…` (M) | status line only, exactly the granted line |
| `app/lib/arrangement/__tests__/groups.test.ts` (new) | GU1–GU6 + corrupt-parent ungroup (11 tests) |
| `app/lib/arrangement/__tests__/track-groups-ui.test.tsx` (new) | TG1–TG11 + TG8b (14 tests) |
| `docs/implementation/2026/quarter-IV/069-studio-lab-track-groups-stage-1.md` (new) | Georgian, LF, G1–G13, 3 stages, Ableton table, files, tests, mutations; status awaiting C |

## A's decisions C must know
- **G10 choice:** on a group header row `laneTrackIdAtPointer` returns `null`; the caller keeps `gesture.laneTarget?.trackId ?? original.trackId` = the last successful cross-lane plan's lane, else the clip's own lane. Above first / below last row: unchanged first/last fallback. No groups → identical results. Releasing on the group row therefore leaves a clip on its own lane with no lane-change status (ordinary same-lane move); if the pointer passed a valid other lane first, it keeps that lane.
- **Group row height:** 28 px (`TRACK_GROUP_ROW_HEIGHT_PX`, includes the 1 px bottom border); name button `h-6` = 24 px.
- **Group name click does not change the active lane** (G4). Lane name click always sets the active lane (G3).
- **Shift+click with no live anchor or a different parent** behaves like a plain click (anchor := target).
- **Ungroup of nested groups selected together:** children go to the first surviving ancestor.
- **Statuses:** created `ჯგუფი «ჯგუფი 1» შეიქმნა: მუსიკა, სტემები.`; dissolved `ჯგუფი «…» დაიშალა.` (plural `ჯგუფები …`); rename `ჯგუფის სახელი: «…».`; empty rename `სახელი ცარიელია — დარჩა «…»`; refusals in `groups.ts` `GROUP_TRACKS_REFUSAL_MESSAGES` (empty: `დასაჯგუფებლად ჯერ მონიშნე ხაზები — Ctrl+click ან Shift+click ხაზის სახელზე.`; video; mixed-parents; gap; no-group).
- Group ids are `crypto.randomUUID()`; React keys `group:<id>`.

## Tests actually run (all green)
- `npm run typecheck` — 0 errors.
- `npx biome check` on the 8 owned code/test files (the task's /check scoped to owned paths): "No fixes applied", 0 diagnostics. `npm run lint` (repo-wide, speed rule) was also run once and exited 0. It checked 395 files and reported 218 warnings + 1 info, none in the owned files (pre-existing; untouched; `a-round-79/lint.txt`). Formatting applied by piping owned files through `biome format --stdin-file-path` (no `--write`), diff limited to my hunks.
- New: `groups.test.ts` 11/11, `track-groups-ui.test.tsx` 14/14.
- Targeted list (`a-round-79/targeted-files-final.txt`, built with B's grep + render-budget*/markers*/marker-*/grid-*/lane* + importers of types/arrangement / model): **72 files, 1357 tests, all passed** (final run after review fixes) (`a-round-79/targeted-run-final.txt`). An earlier run before the UI test existed: 71 files / 1342 passed.
- No full suite, no `npm run verify` (root gate).

## Mutation proofs (`a-round-79/mutate.py`, `mutations.txt`; re-run after review fixes, same red sets; each restored, sha256 re-check OK)
| # | Mutation | Red |
|---|---|---|
| a | `groups: []` kept | GU1, GU3 (nested dissolve), TG4, TG11 |
| b | contiguity check removed | GU2 ×2, TG5 |
| c | parent check removed | GU2, TG5 |
| d | nested parent not set | GU3, TG3, TG4 |
| e | selection not filtered (Ctrl+G path) | TG2 variant (Undo then Ctrl+G must say "empty", not "unknown") |
| f | group row carries `data-track-id` | TG8b, TG2, TG3, TG4 — **TG9 and TG8 stay green under (f)**; TG8b is the killing test |
| g | G10 fallback reverted | TG8 |
| h | fit subtraction removed | TG10 |
| i | Ctrl+G block after `if (modifier) return;` | TG2 + 10 others |
Note on (e): the ungroup path does not need the filter to be safe (unknown ids are ignored → `no-group` refusal, never a throw); the Ctrl+G path is the discriminating one.

## A's own browser smoke (not a C substitute)
`a-round-79/smoke.mjs` (Playwright Chromium, `:5173/studio-lab`, both 1440x900 and 1280x720): click music + Shift-click stems → `data-track-selected` {music, stems}; Ctrl+G → one 28 px `ჯგუფი 1` row above music, status as G5; F2 + typed `SFX ქუჩა g m ` + Enter → renamed (trailing space trimmed), focus back on the group button, snap/marker/playback untouched; Ctrl+Shift+G → 0 group rows; no non-noise console errors/warnings. Screenshots `a-round-79/smoke-1440.png`, `smoke-1280.png`. Audio/export, drag-over-group, marquee and fit were NOT browser-checked by A.

## Acceptance criteria A can claim
- A's checks for §1 (typecheck, owned-file Biome, targeted vitest, required tests GU1–GU6/TG1–TG11, mutations a–i, file ownership/end state) — passed as above.
- Every §5 C row (TG-SELECT … SOURCE-UNCHANGED) is **C's** to verify in the browser; A does not mark them passed.

## Known gaps / notes for B
- TG11 is a jsdom proxy: `createBufferSource` count 0 and live position advancing; the export check is "arrangement differs only by groups/groupId" — the real WAV comparison is C's TG-AUDIO.
- `selectAllClips` / clip clicks do not clear the track selection (not specified; selection is only shaped by name-button clicks and group commands).
- Group header timeline band is inert (no marquee start, no seek) — consistent with "no controls that do nothing"; C may note it.
- Tech Lead R79-T (real Chrome find bar on Ctrl+G) cannot run here.

## Exact next C checks
1. SOURCE-UNCHANGED: `sha256sum` of the 10 files listed in `a-round-79/end-hashes.txt` at C start and end; frozen 459/459; protected 4/4; status 5 M + 5 ??.
2. §5 rows at both viewports: TG-SELECT, TG-GROUP, TG-NEST, TG-UNGROUP, TG-RENAME, TG-REFUSE (1–5), TG-DRAG-OVER-GROUP (expect: ghost stays on music on the group row, release leaves the clip on music with no lane-change status), TG-MARQUEE, TG-FIT (group row height 28), TG-AUDIO (WAV round-26 rule), REG-ACTIVE-TRACK, REG-SNAP-G, REG-LANE-CONTROLS, REG-HYD, G79-3, T79-TARGETED (`a-round-79/targeted-files-final.txt`, expect 72 files / 1357 tests).
3. One quick Ctrl+C/X/V/D/L/A/Y/Z check (modifier block neighbour).

## Code review (actual `code-reviewer` subagent, score 8/10, no Critical/High)
Fixed in this round (inside the grants):
- #1 Medium: `ungroupSelectedRows` now reparents through the **derived** parent (from `trackGroupRows`), so a stored cycle or a dangling parent cannot produce a self-parent. A new GU3 test covers the cycle and dangling cases.
- #2 Low: the auto-fit and the effect now count **rendered** group rows (`trackGroupRowCount`), not `groups.length`.
- #3 Low: selection and status update only when `commitArrangement` returns true (group, ungroup and rename).
- #5 Low a11y: `aria-pressed` was removed from the group name button. Selection is in the label suffix `, მონიშნული` plus `data-group-selected`, so `aria-pressed` on lanes keeps its single meaning, "active lane".
- #7 Low: `select-none` was added to both name buttons. A Shift+click could create a text selection, and that made Ctrl+C a no-op.
- #10 Low: the group-count refit now runs in `useIsomorphicLayoutEffect` (no one-frame layout jump; SSR-safe hook already used in the file).
Not fixed (signals for B):
- #4: after a refused lane hover, crossing a group row falls back to the clip's own lane. That follows the contract; a separate `lastHoverTrackId` would be an option.
- #6: the lane name button has no min height (about 20 px). It is the existing control; `min-h-6` could change the tight lane density, and that height was not measured this round.
- #8: after Ctrl+G, focus stays on the track button, so Ctrl+G followed by F2 does nothing until the group button is focused.
- #9: track selection is never cleared by clip/background clicks or Escape.
- #11–#14 (nits): `maxLength` counts code units while normalisation counts code points; repeated `trackGroupRows` per click; naming collision with "group" for multi-clip moves (`arrangementGroups`, `rowParentId` are hard to grep; suggested `arrangementTrackGroups`, `trackRowParentId`); the rename status strings are inline in the workspace; `hover:bg-surface` on the group button.
- Frozen-file note: there is no sanitizer for `groups` in `model.ts` or the context. A future `normalizeTrackGroups` belongs with the model.
- A's browser smoke was re-run **after** the review fixes (`a-round-79/smoke-post-review.json`). Same results at both viewports: group row 28 px, status as G5, rename OK, focus label `SFX ქუჩა g m — ჯგუფი, მონიშნული`, ungroup leaves 0 rows, no non-noise errors. In the browser, `data-group-selected` was not read before ungroup (the probe ran after Ctrl+Shift+G). TG2/TG3 cover it in jsdom.

**Architecture note (verbatim signal for B, not an instruction):** "Signal 4 (new state/lifecycle in an existing owner): `StudioWorkspace.tsx`. Selection state, the anchor ref, a group-count effect and three commit callbacks were added to an owner that already holds lane layout, marquee and keyboard dispatch. Keep for now: the selection is UI-only, follows the existing ref-mirror pattern, and extracting it would require preserving ref read-timing in the keydown path. Proposal for the planner: when stage 2 adds fold/mute/solo propagation, one bounded task to move selection, anchor and live filtering into a `useTrackRowSelection` hook with its own tests, keeping the existing TG tests unchanged."
