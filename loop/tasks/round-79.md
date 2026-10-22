# CURRENT TASK — Round 79: SRW-17 (FB-12) stage 1 — track groups: multi-select, Ctrl+G / Ctrl+Shift+G, nesting, group header rows, F2 rename (D-29z44)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-78.md` (exact `cmp` copy). Rationale for this round: `b-round-78.md`. Decision record: D-29z44 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage with one owner (A).
  - SRW-17 is split into three stages. All three are in scope and nothing is deferred:
    - **Stage 1 (this round):** group model, track multi-selection, Ctrl+G / Ctrl+Shift+G (including nesting), group header rows, F2 rename, Undo/Redo. There is **no audio change**.
    - **Stage 2:** collapse/expand of a group (button and `U`). Hidden children leave the accessibility tree (doc 029 TODO). The folded group row shows an overview of its children's clips (Live §18.3).
    - **Stage 3:** group Mute / Solo / Volume summing its children in playback **and** export, nested (R17-G2, R17-G3), and the half-solo indicator (Live §18.3).

## Why this round
- **C round 78** (`c-round-78.md`, `.json`): **PASS, `browserVerified=true`, `realVerified=true`, no bugs.**
  - Root gate 78 published `c062147fc29f105454de7728cc4bbbe762f5cb6d` to both remotes. Review score 9/10; verify 109 files / 1846 tests.
  - SRW-16 stage 2b is closed. SRW-16 is now **მოწმდება**: all C IDs pass, and only the Tech Lead checks R72-T, R74-T, R77-T and R78-T remain.
- **No Critical/High bug is open, and C has no open bug for A.**
- **Regression round:** not due. `regression-last.json` is 2026-10-21 and today is 2026-10-22, so it falls due on or after **2026-10-24**.
  - **If this round closes on or after 2026-10-24, round 80 is the REGRESSION round**, whatever the feature state.
- **GATE75 S1–S3 (marker drag, Low):** B read the source at `c062147`. They are **not** scheduled here.
  - **S1 cannot be reached.** Every zoom path refuses during a pointer gesture. All `pxPerSecond` writes go through `applyTimelineView`. Its workspace callers return early on `isPointerGestureActive()`:
    - Ctrl+wheel (`StudioWorkspace.tsx` l.1136);
    - fit, zoom to range, zoom back and step/slider (l.774–826).
  - The ruler navigation and the overview drag first need `onGestureClaim`, and the active marker drag refuses that claim.
  - S1 therefore needs only a regression-lock test, in the Lows batch.
  - S2 and S3 are cosmetic Lows on one file, so they join GATE75-S4…S6 in the Lows batch. They are recorded there, not dropped.
- **Dependency SRW-13 → SRW-17:** SRW-13's code stages are all C-verified. Its remaining items are C-R27-01 (Medium) and C-R41-01 (Low), which are Tech Lead quiet-Chrome / viewport questions that cannot run in the cloud. So the dependency is satisfied for implementation, not silently skipped.
- **Gate-78 review:**
  - #3 (doc 068 status line) is granted below, as one line.
  - #1, #2, #4 and the Architecture note (`resolveSnapTime` as the single entry point, retire `resolveGridTime`) go into the SRW-16 boundary checkpoint request (`b-round-78-checkpoint-request.md`). They are not in this round.

## Baseline (measured by B, 2026-10-22)
- **HEAD `c062147fc29f105454de7728cc4bbbe762f5cb6d`** (the commit published by gate 78). The tree is clean: `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-78-r79-tree-sha256.txt`, **459** entries, 459/459 OK.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-78-r79-tree-sha256.txt`.
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 5 owned existing files below.
  - That includes **every existing test file**, `ArrangementContext.tsx`, `panels.ts`, `model.ts`, `schedule.ts`, `graph.client.ts`, `ArrangementMarkerRow.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx` and `components/arrangement/index.ts`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-78-r79-snapshots/` (`SHA256SUMS.txt`). All files are LF with CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/types/arrangement.ts` | `66832e8d` | 101 |
  | `app/components/arrangement/ArrangementLane.tsx` | `8bd53baf` | 957 |
  | `app/components/arrangement/ArrangementClip.tsx` | `5fa05648` | 731 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `56e7ef00` | 2044 |
  | `docs/implementation/2026/quarter-IV/068-studio-lab-marker-time-snap.md` | `ddd6b35c` | 96 |
- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers (B, Linux cloud):**
  - `:5173/studio-lab` returns 200 per `env-status.json`.
  - The backend at `:5199` is unavailable, which is expected.
  - A and C re-check at phase start. Never start or stop servers.
  - A row that truly needs the backend is "BLOCKED: backend unavailable in cloud", never PASS.
- **Do not change the repository state:**
  - **NEVER** stash, reset, checkout, clean or re-create anything.
  - A mismatch (a different HEAD, a non-empty status, a changed frozen file) means stop and report.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`.

## 1. What changes (A)

### Today (read by B in the source at `c062147`)
- **Fixed track list.** `/studio-lab` creates a fixed track list (`routes/studio-lab.tsx` l.12):
  - `video` (kind `video`), then `music`, `stems` and `sfx` (kind `audio`).
  - There is no add, delete or reorder of tracks.
- **Track type.** `ArrangementTrack` (`types/arrangement.ts` l.3) has `id, kind, name, volume, mute, solo, pan?`. `Arrangement` has `tracks, clips, loop, master, markers?`.
- **Track name button.** Each lane header has a name button (`ArrangementLane.tsx` l.624–635). Every click calls `setActiveTrack(track.id)`, and modifiers are ignored. `aria-pressed={isActive}` marks the **active lane**. There is no multi-track selection.
- **Ctrl+G is free.** In `handleKeyDown` (`StudioWorkspace.tsx` l.1306), modified letters are handled before `if (modifier) return;` (l.1483). Plain `g` toggles Snap (l.1492). Ctrl+G and Ctrl+Shift+G are unbound.
- **Rows.** Lanes are rendered by `arrangement.tracks.map(...)` (l.1920). Each lane row carries `data-track-id` (`ArrangementLane.tsx` l.596), and three things depend on it:
  - `laneTrackIdAtPointer` (`ArrangementClip.tsx` l.168): the target lane of a clip move. If the pointer is on no row, it returns the **first or last** lane.
  - The marquee (`StudioWorkspace.tsx` l.1233).
  - The lane auto-fit `trackLaneFitEntries`/`resolveTrackLaneLayout` (l.207–240), with `fitLaneHeights` and `detailPanelOpenHeightCap` in `panels.ts`, which is frozen.
- **Playback and export.**
  - `scheduleKey` (`ArrangementContext.tsx` l.440) depends only on `clips` and `loop`, so a change to tracks or groups alone does not restart the graph.
  - Export reads track mix fields only.
  - `isSameArrangement` is a `JSON.stringify` comparison.

### Contract (B decision: the smallest honest behaviour consistent with FB-12 / R17-G1 and Live 12 §18.2, §18.3, §42)
| # | Rule |
|---|---|
| G1 | **Model, additive and optional.** `ArrangementTrack.groupId?: string` (the direct parent group) and `Arrangement.groups?: ArrangementTrackGroup[]` with `ArrangementTrackGroup = { id: string; name: string; parentId: string \| null }`. No `kind: 'group'` track. **Normal form:** an arrangement without groups has **no `groups` key**, and an ungrouped track has **no `groupId` key** (never `undefined` or `[]`). So `isSameArrangement(ungroup(group(a)), a)` is true. **Invariant:** all descendant tracks of a group are contiguous in `tracks` order, and every group has at least one child (track or group). |
| G2 | **Track selection** is UI state in `StudioWorkspace`, not history. It holds row ids (track ids and group ids). It is filtered against the live arrangement before every use and every render, because after an Undo a group id may no longer exist. |
| G3 | **Click on a lane's name button:** still calls `setActiveTrack(track.id)` (the active lane behaviour is unchanged, including with modifiers). It also shapes the selection:<br>• plain click → `{track}`<br>• Ctrl/Cmd+click → toggle that row in the selection<br>• Shift+click → if the anchor row (the last plain or Ctrl click) and the target have the **same parent**, select every direct child of that parent from the anchor to the target in display order; otherwise behave as a plain click.<br>The keyboard (Enter/Space) acts as a plain click. |
| G4 | **Group header row:** one row directly **above** the group's first descendant. Nested groups stack: the outer header, then the inner header, then the inner members. It contains:<br>• a name button: plain, Ctrl/Cmd and Shift click follow the G3 selection rules, with the group as one unit; it does **not** change the active lane;<br>• indentation by depth (children of depth d are indented `d × 12 px`; inline `paddingLeft`, the existing dynamic-style precedent);<br>• a fixed height (A picks one; it must be ≥ 24 px for WCAG 2.5.8 targets, and it must be stated in doc 069);<br>• an empty timeline band of `timelineWidth`.<br>No fold button and no mixer controls (stage 2/3: do not render controls that do nothing). The row **must not carry `data-track-id`**; it uses `data-group-id` and `data-group-depth`. **DOM structure:** group rows are **direct siblings** of the lane rows inside the existing lanes container (`laneTrackIdAtPointer` walks `closest('[data-track-id]').parentElement.children`). There is no wrapper element around a group and its children; the indentation lives on the headers only. Tokens only (`bg-surface`, `bg-elevated`, `border-outline`, `text-muted`, `ring-brand` …). No hardcoded colours. |
| G5 | **Ctrl/Cmd+G — Group Tracks.** Valid when the selection is non-empty, contains no video track, all selected rows share **one parent**, and the selected rows are **contiguous** among that parent's direct children. Then:<br>• a new group with parent = that common parent and name `ჯგუფი n` (n = the smallest integer ≥ 1 with no existing group of exactly that name);<br>• the selected rows get the new group as their parent;<br>• one history entry `Group Tracks`;<br>• the selection becomes `{newGroup}`;<br>• status `ჯგუფი «ჯგუფი 1» შეიქმნა: მუსიკა, სტემები.` (row names in display order).<br>A one-track group is allowed (Live allows it). Selecting an existing group together with a sibling track nests that group (R17-G3). |
| G6 | **Refusals (no history entry, the selection is unchanged, a Georgian status):**<br>• empty selection (hint: select tracks with Ctrl/Shift+click);<br>• video in the selection;<br>• mixed parents;<br>• a gap (non-contiguous);<br>• during a pointer gesture (`GESTURE_EDIT_BLOCKED_MESSAGE`).<br>`event.preventDefault()` always runs for Ctrl/Cmd+G and Ctrl/Cmd+Shift+G when the event is not ignored. When focus is in a text field, the existing `isTypingTarget` guard ignores the key. |
| G7 | **Ctrl/Cmd+Shift+G — Ungroup Tracks.** Every selected **group** is dissolved: its direct children get the group's parent, and the group is removed. A selection without a group → refusal status (no history). One history entry `Ungroup Tracks`. The selection becomes the dissolved groups' direct children. |
| G8 | **F2 on a focused group name button** opens an inline name editor:<br>• Enter or blur commits `Rename Group`;<br>• Escape cancels;<br>• an empty or unchanged name → no history entry, and an empty name keeps the old one with a status (the marker R5 precedent);<br>• focus returns to the name button.<br>The global `handleKeyDown` must not act on keys typed in the editor (it is a text field, so `isTypingTarget` covers it; verify). |
| G9 | **Not changed:** audio, playback, meters, export, `scheduleKey`, clip edits, markers, loop, grid/snap, track Mute/Solo/Volume/Pan/fold/height, plain `g` = Snap. Grouping while playing restarts nothing. Track order in `arrangement.tracks` never changes (the contiguity rule makes reordering unnecessary). |
| G10 | **Lane hit-testing with group rows** (`ArrangementClip.tsx` `laneTrackIdAtPointer` only): when the pointer is inside the lane container's vertical span but on **no** lane row (it is on a group header row), the result is the **lane target the gesture had before** (pass it in or return `null` and let the caller keep the previous one; A decides and documents). The old fallback still applies above the first or below the last row. With no groups, every result is identical to today. |
| G11 | **Auto-fit:** group header rows reduce the height that lanes can fill. `StudioWorkspace` subtracts `groupRowCount × groupRowHeight` from `visibleRowsHeight` and from the metrics it passes to `detailPanelOpenHeightCap`. `panels.ts` is not edited. With 0 groups, the layout is byte-identical. |
| G12 | **The marquee keeps working across a group row.** The rows are still only `[data-track-id]` lanes, so a marquee spanning lanes on both sides of a group row selects clips on both. `trackOrder` is the lane order (unchanged). |
| G13 | **Other edits preserve `groups` and `groupId`:** `deleteTime`, Cut Time, duplicate, paste, clip moves, mix edits (`setTrackMix`, solo, pan), markers and Undo/Redo keep `groups` and `groupId` unchanged. A locks this with unit tests. If a frozen `model.ts` function drops `groupId` or `groups`, **stop and report**; do not edit `model.ts`. |

### Files (exact grants)
- **`app/types/arrangement.ts`:** only the G1 additions (`ArrangementTrackGroup`, `groupId?`, `groups?`).
- **New `app/lib/arrangement/groups.ts`:** pure functions only. Suggested names (A may rename under AGENT_DISCOVERABLE; explain any rename):
  - `arrangementGroups`;
  - `trackGroupRows` (display rows: track/group, depth, parent);
  - `groupSelectedRows` (returns a result or a typed refusal reason);
  - `ungroupSelectedRows`;
  - `renameTrackGroup`;
  - `nextTrackGroupName`;
  - `rowParentId`;
  - `expandShiftSelection`.
- **New `app/components/arrangement/ArrangementGroupHeader.tsx`:** the G4 row and the G8 editor. Use `forwardRef` only if a ref is needed (FORWARDREF_COMPONENT).
- **`app/components/arrangement/ArrangementLane.tsx`:**
  - new optional props `selected?: boolean`, `depth?: number` and `onSelectTrack?: (trackId, modifiers) => void`;
  - the name button's `onClick` (it keeps `setActiveTrack`);
  - the indentation;
  - the selected state, exposed as `data-track-selected="true"` plus an `aria-label` suffix `, მონიშნული` and a visual token style.
  - Nothing else. Fold, height, pan, volume, mute, solo and drop stay byte-identical.
- **`app/components/arrangement/ArrangementClip.tsx`:** `laneTrackIdAtPointer` and its one caller line only (G10).
- **`app/components/arrangement/StudioWorkspace.tsx`:**
  - the selection state and anchor (G2/G3);
  - a Ctrl/Cmd+G and Ctrl/Cmd+Shift+G block placed **before** `if (modifier) return;` at l.1483;
  - the interleaved rendering of group rows and lanes (l.1920);
  - the G11 fit subtraction;
  - the lane props.
  - **Untouched:** the Ctrl+arrow block, the marquee code (G12 must hold without editing it), the gesture code and every other shortcut.
- **`docs/implementation/2026/quarter-IV/068-studio-lab-marker-time-snap.md`:** only the status line (l.4), replaced by exactly this line (gate-78 review #3):

  > **სტატუსი:** Round 78 — C PASS (browserVerified), გამოქვეყნდა `c062147` (D-29z43)

- **New tests:**
  - `app/lib/arrangement/__tests__/groups.test.ts` (unit);
  - `app/lib/arrangement/__tests__/track-groups-ui.test.tsx` (workspace). Copy the harness from `marker-time-snap-ui.test.tsx`. Do not edit any existing test.
- **New doc** `docs/implementation/2026/quarter-IV/069-studio-lab-track-groups-stage-1.md`:
  - Georgian, LF, per `docs/implementation/TEMPLATE.md`;
  - content: G1–G13, the three-stage plan, the Ableton table (§4), files, tests, mutations;
  - status: awaiting C.
- **Escape clause:** `ArrangementContext.tsx`, `model.ts`, `panels.ts`, `index.ts` and every existing test stay frozen. If G1–G13 cannot be met inside these grants, **stop and report**. Examples:
  - a frozen function drops `groupId`;
  - a frozen test asserts the exact header DOM that the selection marker would change;
  - the lane container's `children` order breaks `laneTrackIdAtPointer`.

  Do not edit outside the grants.

### Required tests (behavioural; new files only)
Fixture: the `/studio-lab` track list (video, music, stems, sfx). Clips: music `0–10`, stems `2–8`, sfx `4–6` (A records the actual values).
- **GU1 normal form and round trip:** grouping `[music, stems]` then ungrouping gives an `isSameArrangement`-equal arrangement, with no `groups` key and no `groupId` key. Grouping then Undo gives the original.
- **GU2 validation:** the G6 refusals return typed reasons: empty, video, mixed parents, gap (`[music, sfx]` with `stems` ungrouped), and an unknown id. A valid one-track group is accepted.
- **GU3 nesting (R17-G3 model):** group `[stems, sfx]` → G1 (`ჯგუფი 1`). Then group `[music, G1]` → G2 (`ჯგუფი 2`), and G1.parentId = G2. `trackGroupRows` order: G2(d0), music(d1), G1(d1), stems(d2), sfx(d2), with video(d0) first. Ungrouping G2 restores G1 at the top level.
- **GU4 naming:** after ungrouping `ჯგუფი 1` while `ჯგუფი 2` exists, the next group is `ჯგუფი 1`. Rename trims; empty or same → unchanged reference.
- **GU5 Shift range:** the anchor and target under the same parent select the siblings between them. A different parent → target only.
- **GU6 preservation (G13):** `deleteTime`, `setTrackMix`, `toggleSolo`, `setArrangementTrackPan`, `duplicateClips` and the marker add keep `groups` and every `groupId` (deep-equal).
- **TG1 UI select:** plain, Ctrl and Shift click on the name buttons set `data-track-selected`. The active lane follows the click as today (`aria-pressed`).
- **TG2 Ctrl+G:**
  - selecting music and stems, then Ctrl+G, renders one header row `ჯგუფი 1` (`data-group-id`) above music;
  - music and stems are indented, the undo label is `Group Tracks`, and the status text is as in G5;
  - Ctrl+Z removes the row; Ctrl+Y brings it back.
- **TG3 nesting UI:** the GU3 sequence through clicks and keys: two header rows, depths 0/1, correct order.
- **TG4 Ctrl+Shift+G:** the selected group dissolves (`Ungroup Tracks`). With only a track selected → refusal status and no history.
- **TG5 refusals:** video, gap and empty → status text and `undoLabel` unchanged. During `claimPointerGesture` → `GESTURE_EDIT_BLOCKED_MESSAGE`.
- **TG6 F2 rename:** F2 on the group name button opens an input; typing `SFX ქუჩა` + Enter → `Rename Group` and the name shown. Escape cancels. Empty keeps the old name. Typing `g`, `m` or Space in the input does not toggle Snap, add a marker or play.
- **TG7 plain `g`** still toggles Snap. **Ctrl+G inside the BPM field or the library search** does nothing to the groups.
- **TG8 drag over a group row (G10), discriminating case first:** with `ჯგუფი 1` over {stems, sfx}, the group row sits between music and stems. A **music** clip dragged down onto that group row must keep music as its target; the old fallback would give sfx, the last lane. Releasing there leaves the clip on music. A neighbour check (not discriminating, because the old fallback also returns sfx): a sfx clip dragged up onto the row stays on sfx. With no groups, the old results hold (first/last fallback).
- **TG8b DOM lock:** no element matching `[data-group-id]` carries `data-track-id`. The group rows and the lane rows share one parent element.
- **TG9 marquee (G12):** a marquee from music to sfx across a group row selects the clips on music, stems and sfx.
- **TG10 fit (G11):** with auto-fit on, the sum of lane heights plus group rows does not exceed the visible rows height (0, 1 and 2 groups). With 0 groups, the heights equal today's.
- **TG11 playback:** grouping and ungrouping while playing → `createBufferSource` call count 0, and the position keeps advancing. The export input (the arrangement passed to the renderer) differs only by `groups`/`groupId`.
- **Mutation proofs (A runs each one, records it, restores and `cmp`s):**
  - (a) normal form not applied (leave `groups: []`) → GU1 red;
  - (b) contiguity check removed → GU2/TG5 red;
  - (c) parent check removed → GU2 red;
  - (d) nested parent not set → GU3/TG3 red;
  - (e) the selection is not filtered after Undo → a TG2 variant red (Undo then Ctrl+Shift+G must refuse, not throw);
  - (f) the group row carries `data-track-id` → TG8b red (and TG8/TG9 if they discriminate; if TG9 stays green under (f), record that, and keep TG8b as the killing test; do not drop the mutation);
  - (g) G10 fallback reverted → TG8 red;
  - (h) fit subtraction removed → TG10 red;
  - (i) the Ctrl+G block placed after `if (modifier) return;` → TG2 red.
- **A's checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and `npx vitest run` on the two new files plus every existing test file that renders `StudioWorkspace`, `ArrangementLane` or `ArrangementClip` or imports `types/arrangement` model helpers. Find them with `grep -rlE "StudioWorkspace|ArrangementLane|ArrangementClip|lane-fit|panels" app --include=*.test.ts --include=*.test.tsx`, and include `render-budget*`, `markers*`, `marker-*`, `grid-*` and `lane*`.
  - Record the file list and counts. All green.
  - No full suite and no `npm run verify` (those belong to the root gate).
  - **The code-reviewer is required** (3+ files). Pass its Architecture note to B as a signal.

## 2. Pre-flight for A
- Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `REACT_CONTEXT` (to confirm that no context change is needed), `DESIGN_TOKENS`, `TAILWIND_FIRST`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS` and `GEORGIAN_DOCS`, plus `prompts/new-component.md` and `prompts/studio-feature.md`.
- Verify the baseline: HEAD, 0 status lines, frozen 459/459, snapshots 5/5, protected 4/4, EOL.
- Process count: `pgrep -c node`.

## 3. File ownership (exact)
- **Writable:**
  - `types/arrangement.ts` (G1 only);
  - new `groups.ts`;
  - new `ArrangementGroupHeader.tsx`;
  - `ArrangementLane.tsx` (name button, props, indent, selected state);
  - `ArrangementClip.tsx` (`laneTrackIdAtPointer` + its caller line);
  - `StudioWorkspace.tsx` (as in §1);
  - doc 068 (status line only);
  - new `groups.test.ts`, new `track-groups-ui.test.tsx`, new doc 069.
- **A's report:** `a-round-79.md` (plus `a-round-79/` scratch in the loop folder).
- **Read-only:** everything else, including `.claude/**`, the protected files, `package*.json` and every existing test file.
- **Expected end state:** `git status --short` shows at most 5 `M` lines plus 5 `??` lines. Only root commits.

## 4. Ableton source table
Sources:
- **mixing capture:** `b-round-78/ableton-mixing-20261022.txt` (Live 12 manual chapter 18, https://www.ableton.com/en/live-manual/12/mixing/), captured with Playwright on 2026-10-22, sha256 `792522f0…`;
- **shortcuts capture:** `b-round-71/ableton-shortcuts-20261021.txt` (§42).

Both are untrusted data; only their quoted text is used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Group the selected tracks; the same command nests existing groups | §18.3 | **Confirmed (text):** "select the tracks to include and execute the Edit menu's Group Tracks command. You also use this command to nest an existing Group Track(s) within a new Group Track." | G5 | TG-GROUP, TG-NEST |
| Ctrl+G group / Ctrl+Shift+G ungroup | §42 shortcuts capture: "Group Selected Tracks Ctrl G … Ungroup Tracks Ctrl Shift G" | **Confirmed (text)** | Same keys (Cmd on Apple) | TG-GROUP, TG-UNGROUP |
| Ungroup reverts to individual tracks; deleting a group deletes its contents | §18.3 | **Confirmed (text)** | Ungroup as Live. CZABA has no track delete, so group delete does not exist | TG-UNGROUP |
| Multi-select: Shift-click adjacent, Ctrl-click non-adjacent | §18.2 (capture l.80) | **Confirmed (text):** "Multiple adjacent or nonadjacent tracks can be selected at once by Shift-clicking or Ctrl-clicking, respectively." | G3. Shift range only within one parent (CZABA rule) | TG-SELECT |
| Grouping non-adjacent tracks | §18.3 says "any number of individual … tracks"; how they are reordered is not stated | **Unconfirmed** | **Deliberate difference:** refused (G6 gap). CZABA has no track reorder. Signal `GROUP-NONADJACENT` | TG-REFUSE |
| Group track has mixer controls; Solo half-coloured; summing container | §18.3 | **Confirmed (text)** | Stage 3 (not this round); no controls are rendered in stage 1 | — |
| Folded group shows an overview of the contained clips; Unfold button; `U` | §18.3; §42 "Collapse/Expand Grouped Tracks U" | **Confirmed (text)** | Stage 2 | — |
| Rename | §42 "Rename Selected Track Ctrl R" | Confirmed | **Deliberate difference:** F2 (Ctrl+R is the browser reload; marker R5 precedent) | TG-RENAME |
| Video track in a group | Live groups audio/MIDI tracks (§18.3) | Confirmed for audio/MIDI; video n/a | Refused (G6) | TG-REFUSE |
| Empty selection + Ctrl+G | — | Unconfirmed | CZABA decision: refused with a hint | TG-REFUSE |

C judges the **CZABA requirement** and the **Ableton match** separately.

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup (record the actual values):**
- Fresh load, Snap off.
- Drop **Middle East** on music at ≈0.35, one synthetic-composition stem (library item `… · <stem name>`) on **stems** at ≈2 (or **Slow rise** if a stem cannot be dropped there; record which) and **Soft impact** on **sfx** at ≈4.
- Record the lane `data-track-id` order and the lane heights before any grouping.

| ID | Action | Pass evidence |
|---|---|---|
| TG-SELECT | Click the music name, Shift+click stems, Ctrl+click sfx, Ctrl+click sfx again | `data-track-selected` = {music} → {music, stems} → {music, stems, sfx} → {music, stems}. The active lane (`aria-pressed`) follows each click (REG-ACTIVE-TRACK) |
| TG-GROUP | With {music, stems} selected, Ctrl+G | One header row `ჯგუფი 1` (`data-group-id`, depth 0) directly above music; music and stems indented. Status as G5. Undo title `Group Tracks`. Ctrl+Z removes it; Ctrl+Y restores it. Screenshot at both viewports |
| TG-NEST | Ungroup first (or a fresh load). Select stems + sfx → Ctrl+G (`ჯგუფი 1`). Then click music, Ctrl+click the `ჯგუფი 1` header → Ctrl+G | Rows: video, `ჯგუფი 2` (d0), music (d1), `ჯგუფი 1` (d1), stems (d2), sfx (d2). Inner and outer both visible. Two history entries |
| TG-UNGROUP | Select `ჯგუფი 2` → Ctrl+Shift+G; then select `ჯგუფი 1` → Ctrl+Shift+G | Each removes only that group (`Ungroup Tracks`); the end state equals the setup (no header rows, no indent) |
| TG-RENAME | Focus the `ჯგუფი 1` name button → F2, type `SFX ქუჩა`, Enter; then F2 + Escape; F2, clear, Enter | The name becomes `SFX ქუჩა` (one `Rename Group` entry). Escape keeps it. Empty keeps it with a status. Typing `g`/`m`/Space in the editor toggles nothing |
| TG-REFUSE | (1) {video, music} Ctrl+G; (2) {music, sfx} via Ctrl+click (gap) Ctrl+G; (3) a lane name inside the group plus a top-level lane, Ctrl+G; (4) Ctrl+Shift+G with only tracks selected; (5) Ctrl+G with an empty selection (fresh load) | A status for each, undo title unchanged, no header row added |
| TG-DRAG-OVER-GROUP | With `ჯგუფი 1` over {stems, sfx} (the group row sits between music and stems). **(1) Discriminating:** drag the **music** clip header down so the pointer rests on the group header row (pause 300 ms; record the ghost lane), then release there. **(2) Neighbour:** drag the sfx clip header up onto the group row, pause, back to sfx, release | (1) The ghost stays on music during the pause (the old fallback would show sfx), and after release the clip is still on music: no lane change, a status that matches A's documented G10 choice, Undo consistent. (2) The clip stays on sfx. Also record that no `[data-group-id]` element has `data-track-id` |
| TG-MARQUEE | Empty-area marquee from the music lane to the sfx lane across the group header row | The clips on music, stems and sfx are selected |
| TG-FIT | 0 groups, 1 group, then 2 nested groups, at both viewports with auto-fit on | Record every lane height, the group row height, the visible rows height `V` (scroller client height − timeline chrome) and the lane minimums (`panels.ts`: audio 60, video 52). Let `M = Σ(lane minimums) + groupRows × groupRowHeight`. **If `M ≤ V`:** the last lane's bottom ≤ the scroller's visible bottom (no new vertical overflow). **If `M > V`:** each lane sits at its minimum, and the overflow equals `M − V` (±1 px). That overflow is expected, not a bug |
| TG-AUDIO | Play (Solo off, video Mute on by a real click); while playing, Ctrl+G and then Ctrl+Shift+G | `createBufferSource` calls 0 during the edits (instrumented as in MK-NO-RESYNC); the position keeps advancing; the master meter stays live. Export WAV before and after grouping compared by the round-26 rule (frames, header, NaN, full-scale count, RMS, max\|Δ\| ≤ 1 LSB; never byte identity) |
| REG-ACTIVE-TRACK | Plain, Ctrl and Shift clicks on lane names; a library drop then goes to the active lane as before | The active lane equals the last-clicked lane in every case |
| REG-SNAP-G | Plain `g` | Snap toggles as before (it does not group) |
| REG-LANE-CONTROLS | On an indented (grouped) lane: Mute, Solo, Volume, Pan, fold and height handle | They behave as before (a short check each) |
| REG-HYD | The console during the rows | No hydration or `useLayoutEffect` warning and no non-noise error |
| G79-3 | The header link → `/studio-lab` with the demo badge; `/studio/<id>` anonymous → "Sign in required" with no workspace; anonymous `/api/studio-token` → 401; the page network has no `/api/studio-token`, `/api/recording-*`, `/api/download`, no R2 host and no Authorization header | As stated. The fake-Bearer 403 → BLOCKED (backend unavailable in cloud) |
| T79-TARGETED | Run A's targeted vitest list once (not the full suite) | Green; record the counts |
| SOURCE-UNCHANGED | A's end hashes at C start and end; frozen 459/459; protected 4/4; status per §3 | Equal |

- **Gate rows** (C marks them `gate`, never `passed`): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Neighbours that can break:**
  - the active lane behaviour of the name button (its click handler changes);
  - clip lane moves and library drops near the group rows (`laneTrackIdAtPointer`);
  - the marquee;
  - the lane auto-fit and the detail panel cap;
  - the `handleKeyDown` modifier block (Ctrl+C/X/V/D/L/A/Y/Z still work: one quick check);
  - plain `g`.
- **Not a C row (Tech Lead R79-T):** in a real Chrome, Ctrl+G must not open Chrome's find bar. CDP key events never reach the browser accelerator layer (the ALT-CHROME-MENU class), so C cannot test this.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutation (f) or (g) on a scratch copy outside `store/`, or reason from A's recorded output. C never edits `store/`.

## 7. After this round
1. Stage 2: collapse/expand, `U`, a11y hiding, the clip overview band.
2. Stage 3: group Mute/Solo/Volume summing in playback and export, nested, half-solo.
3. Then SRW-18, SRW-19, SRW-20, the Lows batch (it includes GATE75 S1–S6), SRW-21, the full regression, T12 and VISUAL-A-OBSIDIAN.

- The regression round comes first as soon as planning falls on or after 2026-10-24.
- **The SRW-16 boundary checkpoint request** has been written for root (`b-round-78-checkpoint-request.md`). It does not block this round.
- **Tech Lead R79-T:** in a real Chrome (Windows, and a Mac with Cmd+G), Ctrl+G groups and no find bar opens; the group rows and indentation read well at both viewports.
