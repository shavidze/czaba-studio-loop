# A — Round 81 report: SRW-17 stage 3 (group Mute / Solo / Volume, nesting, half-solo) + X1 (C80-1)

Implementer: A (Claude Opus 5.5) · 2026-10-22 · Status: **implementation done, awaiting C**. realVerified for the GX rows = **not claimed** (C owns browser acceptance; A did only measurement and X1 probes in Chromium).

## Baseline (verified at start)
- HEAD `68383fa91f0e58f577b5e33f14d21ff63fb1531c`, `git status` 0 lines, frozen 461/461 OK, snapshots 11/11 OK, protected 4/4 (`cd68eb6e 9f738237 13914809 fa2cf0bc`), LF/CR=0 on all files, `pgrep -c node` = 1, `:5173/studio-lab` 200. A did not start or stop any server.
- Pre-flight greps:
  - no test renders `ArrangementGroupHeader` standalone (only `StudioWorkspace.tsx` mounts it);
  - `isTrackAudible` had exactly the 3 listed production callers;
  - no other production code reads `track.solo`/`track.mute` for arrangement audio;
  - no persisted-arrangement parser reads `parentId`.

## Changed files (end state: 11 M + 3 ??; HEAD unchanged; frozen 461/461 OK; protected 4/4 OK)
End sha256 values are in `a-round-81/end-hashes.txt`.

| File | Change |
|---|---|
| `app/types/arrangement.ts` | `volume?`, `mute?`, `solo?` on `ArrangementTrackGroup` |
| `app/lib/arrangement/groups.ts` | New exports: `trackGroupAncestors`, `trackGroupAncestorIds`, `trackGroupVolume`, `setTrackGroupMix`, `toggleTrackGroupSolo`, `trackGroupSoloState`, types `TrackGroupMixPatch`, `TrackGroupSoloState`. Existing exports untouched |
| `app/lib/arrangement/schedule.ts` | `trackEffectiveGains`, `isTrackAudibleWithGroups` (orphan soloed groups do not count). `isTrackAudible` unchanged |
| `app/lib/arrangement/graph.client.ts` | `trackGains?` option (initial track gain; fallback to the old rule); one line `trackGains: trackEffectiveGains(arrangement),` in `renderArrangementWav` (no `pan` substring) |
| `app/lib/arrangement/model.ts` | `toggleSolo` only: exclusive clears group solos; `groups` kept by reference when no group is soloed |
| `app/contexts/ArrangementContext.tsx` | 6 new members (`toggleGroupMute`, `toggleGroupSolo`, `previewGroupVolume`, `commitGroupVolume`, `beginGroupVolumeGesture`, `blurGroupVolume`); volume pipeline generalised by `MixVolumeTarget` (track wrappers keep their signatures); 2 gain sites + `startGraph` use `trackEffectiveGains`; `scheduleKey` unchanged; `isTrackAudible` import removed |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | M4: M, S (`aria-pressed` true/mixed/false, `data-solo`), Volume range; `::before` glyphs; calls `useArrangement()` |
| `app/components/arrangement/ArrangementExportDialog.tsx` | M7: `isTrackAudibleWithGroups(videoTrack, arrangement)` |
| `app/components/arrangement/StudioWorkspace.tsx` | X1 only: same-size swap of the slider refusal (l.951–954) with capture → `blur()` → collapse |
| `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` | UC2 fader segment only (diff below) |
| `docs/.../070-…collapse.md` | The four lines specified (l.4, l.18, l.52, l.70) |
| new `app/lib/arrangement/__tests__/track-group-mix.test.ts` | GM1–GM9 (10 tests) |
| new `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx` | UM1–UM10 (10 tests) |
| new `docs/.../071-studio-lab-track-groups-stage-3-mix.md` | Georgian, LF, TEMPLATE sections; status: awaiting C |

### UC2 diff hunk (full: `a-round-81/uc2.diff`, final)
- The pointer-gesture/preview refusals above and the music-fader tail are byte-identical. In the replaced segment:
  - the refusal asserts and the detached `keyUp(fader)` are deleted;
  - `pressU(fader)` with a pending 0.9 → collapsed, exactly one `Volume` entry, stems 0.9;
  - focus is on the `ჯგუფი 1` name (asserted right after the collapse);
  - Undo → `undoBefore`, Redo → `Volume`;
  - expand, then focus the idle stems fader and click fold → collapsed, undo label unchanged, focus on the group name.
- **Deviation from B's literal text (one):** the segment ends with one more fold click that expands G1 again. The frozen tail `pressU(musicFader)` expects to collapse from an expanded state.

## Tests actually run
- `npm run typecheck`: pass. `npm run lint`: rc 0 (218 pre-existing warnings, none in owned files).
- `biome check` scoped to the 12 owned code/test files: clean. The two new test files were formatted through `biome format --stdin-file-path` piped to stdout; no `--write` was used anywhere.
- Targeted vitest:
  - list in `a-round-81/targeted-list.txt`: the grep from §1 plus `master*`, `meter*`, `export*`, `lane*`, the two new files and every named frozen test;
  - result: **54 files, 983/983 passed**, run twice (before and after the review fixes; logs `targeted-run.log`, `targeted-run-2.log`). `app/lib/arrangement/__tests__/render-budget.test.tsx` is in the list (it matches the grep) and is green (7/7, also re-run alone after the advisor check). A `find` over the store confirmed that every `master*`/`meter*`/`export*`/`lane*` test file is in the list.
- Not run (gate's job): full suite, `npm run verify`, build, e2e smoke.

## Mutation proofs
Each mutation was backed up, mutated, run, restored, then `cmp OK`. Logs are in `a-round-81/mut/`.

| # | Mutation | Red |
|---|---|---|
| a | only the direct parent group counts | GM2, GM3, GM4, GM7, GM8×2, UM5 |
| b | export ignores the effective gains | GM8 renderArrangementWav |
| c | solo beats mute | GM4 |
| d | normaliser keeps `volume:1/mute:false/solo:false` | GM1, GM6. **`groups.test.ts` stays green**: it never calls the normaliser (honest deviation from the "(and the GN test)" expectation) |
| e | groups in `scheduleKey` | UM2, UM6 |
| f | exclusive track solo keeps group solos | GM6, UM4 |
| g | half-solo never `mixed` | GM5, GM7, UM4 |
| h | old slider refusal restored | UC2, UM9 |
| i | focus captured after the blur | UC2, UC4-F3, UM9 (re-run after the assertion move, as i2: same 3 red) |
| j (review) | track↔group cross-flush removed | UM3 |
| k (review) | orphan group solo counts as "any solo" | GM7 |

## Browser (Playwright Chromium, :5173, A's own probes; not acceptance)
Fresh browser contexts only; no persisted state was needed, so no `a-browse.json` state file was created.
- **Widths** (`a-round-81/pw/widths.json`), identical at 1440x900 and 1280x720:

  | Depth | Row | Name button | M | S | Volume |
  |---|---|---|---|---|---|
  | 0 | 28 px | 79 px | 24×24 | 24×24 | 48 px |
  | 1 | 28 px | 67 px | 24×24 | 24×24 | 48 px |
  | 2 | 28 px | 55 px | 24×24 | 24×24 | 48 px |

  - The `::before` content renders `"S"`. Mixed background = `linear-gradient(to right, brand 50%, transparent 50%)`.
  - Screenshots: `pw/half-solo-1440x900.png`, `pw/half-solo-1280x720.png`.
  - Console: no non-noise error or warning.
- **X1 in Chromium** (`pw/x1.json`):
  - (1) idle fader + `u` → collapsed, undo still `Group Tracks`, focus on G1's name.
  - (2) ArrowDown held + `u` → collapsed, `Undo: Volume`; Undo → `Group Tracks` (exactly one entry).
  - (3) G1 group fader with ArrowDown held, G2 fold click → G2 collapsed, `Undo: Volume`. Focus is on G2's **fold button**, because the mouse click owns focus, as B anticipated.
  - So `blur()` runs `onBlur` synchronously in Chromium and in jsdom.
- **UM10 parity (jsdom):** on a focused lane M and a focused group M/S, Space prevents default and toggles playback without pressing the button, `m` starts marker add, and `u` collapses the group. C should confirm in Chromium that Space on a group M does not toggle mute on keyup (review Low 7).

## Code review (code-reviewer subagent, actually invoked): 8.5/10, no Critical/High/Medium
- **Fixed:**
  - L1: focus assertions moved before undo/redo (UC2 within the granted segment, UM9).
  - L2: cross-flush test added (UM3) plus mutation j.
  - L3: orphan soloed group no longer silences everything, plus a GM7 case and mutation k.
  - L4: partial `trackGains` fallback pinned in GM8.
  - L5: internal renames (`MixVolumeGesture`, `cancelVolumeTargetGesture`, `revertVolumeTargetPreview`); the target key is cleared on commit/flush/revert.
  - L6: `innerFader.isConnected`.
- **Open / for C:**
  - L6b: UM8 checks the helper and the dialog source text, not the rendered DOM line (it needs a decoded video source). GX-EXPORT-DIALOG is the real proof.
  - L7: Space on group M in Chromium.
  - L8: legibility of the `S` glyph (`text-foreground`) on the brand half.
- **For B (outside A's grant):** L9. Doc 070 l.72 (problems section) still describes the old slider-focus refusal, while l.18 now describes X1. It needs a one-line doc fix in a later task.
- **Architecture note (verbatim signal for B):** "Signal 4: `ArrangementContext.tsx:560` adds a new ref (`volumeTargetKeyRef`) and l.2346–2399 add six new context members. Signal 3: the volume region at l.2184–2366 has been reworked across several rounds. Keep: the `MixVolumeTarget` generalisation avoided a second pipeline, and the flush, undo and gesture invariants are shared. Proposal for the planner, conditional: only if a third target kind arrives, one bounded task to extract the pending-volume state (before-snapshot, target key, gesture handle) into a pure `lib/arrangement/` module with unit tests."

## B acceptance criteria A truly passed (unit/jsdom + A's probes; browser acceptance is C's)
- M1–M7, X1 implemented within the grants.
- Required tests GM1–GM9 and UM1–UM10 written and green.
- Mutations (a)–(i) red.
- Header widths recorded in doc 071.
- typecheck/lint green, and the targeted list green.
- End state: 11 M + 3 ??.

## Known gaps / deviations
1. UC2 segment ends with an extra expand click (needed by the frozen tail).
2. Mutation (d) does not turn `groups.test.ts` red.
3. UM8 is not a rendered-DOM check.
4. Group names truncate at depths 1–2 ("ჯგ…"). The name button is 67/55 px (≥ 40 px), so the contract holds, but this is visible in the screenshot. A UX signal for B/Tech Lead.
5. X1 now blurs any focused element in a row that becomes hidden, not only sliders. The reviewer checked the pan fader and the rename input; neither is affected.
6. Orphan-solo rule added (review L3). This is a small extension of M2's "soloed anywhere": it counts only groups that are an ancestor of a track.
7. Consistency note for B: the orphan-solo rule applies to audibility only (`isAnySoloInArrangement`). `toggleSolo`'s `groupSoloed` and `toggleTrackGroupSolo`'s `onlySolo` still count an orphan soloed group. With corrupt data, a plain click on the only soloed track would therefore keep it soloed and clear the orphan solo. This is unreachable from the UI today, because no path creates an orphan group.

## Exact next C checks
- All GX rows of §5 at both viewports:
  - GX-CONTROLS, GX-VOL (0.500 ± 0.005 RMS ratio, 0% ≤ 1 LSB);
  - GX-MUTE, GX-NESTED (0.25 ± 0.0025), GX-SOLO (video Mute OFF), GX-HALF (screenshot of the two-tone S);
  - GX-METER (child meters fall at G1 = 0), GX-UNDO, GX-UNGROUP, GX-COLLAPSED, GX-NO-RESTART;
  - GX-EXPORT-DIALOG (rendered text `გამორთულია (M/Solo)` with G1 soloed vs `შედის` baseline).
- X1-FOCUS (1)–(3) plus the pointer-drag refusal; REG-FOLD, REG-TG, REG-TRACK-MIX, REG-HYD, G81-3; T81-TARGETED (`a-round-81/targeted-list.txt`, expect 54 files / 983 tests); SOURCE-UNCHANGED against `a-round-81/end-hashes.txt`.
- Extra from review: Space on a focused group M/S in Chromium (no mute toggle on keyup), and the legibility of the mixed `S` glyph.

## Scope completed
SRW-17 stage 3 code, tests and docs, plus X1. **Not** self-marked done: SRW-17 needs C's browser PASS and the root gate.
