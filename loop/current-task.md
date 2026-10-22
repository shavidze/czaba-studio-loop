# CURRENT TASK — Round 80: SRW-17 (FB-12) stage 2 — collapse/expand a track group (button + `U`), hidden rows, overview band, focus (D-29z45)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-79.md` (an exact `cmp` copy). Rationale: `b-round-79.md`. Decision record: D-29z45 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage with one owner (A). It also includes one bounded, explicitly labelled focus extra (F1–F3), because collapse needs the same focus-restore helper.
- **SRW-17 stages.** All three stay in scope; nothing is deferred:
  - stage 1: C PASS round 79, published `74eca15`;
  - **stage 2: this round;**
  - stage 3: group Mute/Solo/Volume summing in playback and export, nesting and the half-solo indicator (R17-G2, R17-G3).

## Why this round
- **C round 79:** **PASS, `browserVerified=true`, `realVerified=true`, 0 bugs.**
  - Gate 79 published `74eca159268bc364cdad9b183c6031a64c8d2b6a` to both remotes.
  - Review 8.5/10, COMMIT OK. Verify: 111 files, 1871 tests.
- **No Critical or High bug is open, and C has no open bug for A.**
- **Regression round:** not due. `regression-last.json` is dated 2026-10-21, so it falls due on or after **2026-10-24**. If B plans round 81 on or after 2026-10-24, round 81 is the REGRESSION round.
- **Next scope in dependency order:** SRW-17 stage 2. R17-G1's half "collapse hides children" is not met yet.
- **C observations and gate-79 review items:**

  | Item | What it is | Where it goes |
  |---|---|---|
  | O2 + review #2 | Focus falls to `BODY` after Ctrl+Shift+G | F2 below |
  | A review #8 / O2 | F2 does nothing right after Ctrl+G | F1 below |
  | Review #3 | Shortcuts are not discoverable | Hint text below |
  | Review #7 | Doc 069 status line | One granted line below |
  | Review #1 | Group band ignores the mouse | Not here: the lane background handler needs a `trackId` that a group row does not have (`GATE79-S1`, Lows batch) |
  | Review #4 | Mac hint text | Not here (`GATE79-S4`, Lows batch) |
  | Review #5 | Multi-clip drag `laneTarget` | Not here (`GATE79-S5`, `ArrangementClip` signal) |
  | O1 | Track selection is never cleared | Not here (Lows batch / product question) |
  | Architecture note | `useTrackRowSelection` extraction | An SRW-17 addendum in the checkpoint request for root. **No extraction in this round.** |

## Baseline (measured by B, 2026-10-22)
- **HEAD `74eca159268bc364cdad9b183c6031a64c8d2b6a`** (the commit published by gate 79). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-79-r80-tree-sha256.txt`, **465** entries, **465/465 OK**.
  - Check it with: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-79-r80-tree-sha256.txt`.
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned existing files below.
  - That includes **both round-79 test files** (`groups.test.ts` and `track-groups-ui.test.tsx`, now the stage-1 regression lock), `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementContext.tsx`, `panels.ts`, `model.ts` and `types/arrangement.ts`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-79-r80-snapshots/` (`SHA256SUMS.txt`). All files are LF with CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/lib/arrangement/groups.ts` | `28d1c769` | 311 |
  | `app/components/arrangement/ArrangementGroupHeader.tsx` | `de4b674c` | 144 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `cca9104e` | 2225 |
  | `docs/implementation/2026/quarter-IV/069-studio-lab-track-groups-stage-1.md` | `9aea339f` | 116 |

- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers:**
  - `:5173/studio-lab` returns 200 (`env-status.json`).
  - The backend at `:5199` is unavailable, which is expected.
  - Re-check at phase start. Never start or stop servers.
  - A row that truly needs the backend is "BLOCKED: backend unavailable in cloud".
- **Do not change the repository state:**
  - **NEVER** stash, reset, checkout, clean or re-create anything.
  - A mismatch (a different HEAD, a non-empty status, a changed frozen file) means stop and report.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`.

## 1. What changes (A)

### Today (B read the source at `74eca15`)
- **Group rows.** `trackGroupRows(arrangement)` (`groups.ts` l.74) lists each group header above its first descendant. `StudioWorkspace` renders every row (`trackRows.map`, l.2084): an `ArrangementGroupHeader` is a 28 px row with an empty `aria-hidden` timeline band (l.141), and an `ArrangementLane` carries `data-track-id`.
- **Track fold** is view state: `TrackLaneLayout.folded`, toggled by `toggleTrackFold` (l.612). It is gesture-guarded, has no history, and feeds `resolveTrackLaneLayout` (l.241) and the fit through `trackLaneFitEntries(tracks, folded)`.
- **Fit.** `withTrackGroupRows` (l.230) adds `trackGroupRowCount × 28` to the chrome height.
  - The fit and `detailPanelOpenHeightCap` receive **every** track.
  - `heights` is rebuilt from the full `tracks` array, indexed against `fitted[index]`.
- **Keys and focus.**
  - Plain `u` is unbound. The plain letters come after `if (modifier) return;` (l.1636).
  - After a successful Ctrl+G, focus stays on the track name button. After Ctrl+Shift+G, the focused group button unmounts and focus falls to `BODY` (C O2).
- **G10 and the marquee** both query `[data-track-id]` rows only. A row that is not rendered is simply absent for both.
- **Context API** (frozen, available): `selectClips`, `getSelectedClipIds`, `setTimeRange`, `range`, `activeTrackId`, `isPointerGestureActive`.

### Contract (B decision: the smallest honest behaviour consistent with FB-12 / R17-G1 "collapse hides children" and Live 12 §18.3, §42)
| # | Rule |
|---|---|
| C1 | **Collapse is view state, like track fold.** Add `collapsedGroups: Readonly<Record<string, boolean>>` to `TrackLaneLayout` (initial `{}`).<br>• It is not an arrangement field and not a history entry.<br>• It is not pruned when a group disappears, so stale ids are harmless and are filtered at use. As a result, Undo of Group Tracks shows the children, and Redo brings the group back in the collapse state it had.<br>• A records this in doc 070 and in a test. |
| C2 | **Fold button** in the group header, left of the name.<br>• Same glyphs and pattern as the track fold: `▾` when expanded, `▸` when collapsed.<br>• `aria-expanded`, `aria-label` `<name> — ჯგუფის დაკეცვა / გახსნა`, `title` `დაკეცვა / გახსნა (U)`.<br>• It is ≥ 24 px, uses tokens only, and has `data-testid="arrangement-group-fold"`.<br>• A click toggles that group only.<br>• During a pointer gesture: `GESTURE_EDIT_BLOCKED_MESSAGE`, no change.<br>• **While an arrangement preview is pending** (`isArrangementPreviewActive()`, for example a keyboard Volume preview on a fader that collapse would unmount without a blur): refused with the same gesture status, no change. |
| C3 | **Plain `U`** (no Ctrl/Cmd/Alt/Shift, not `repeat`; the existing `isTypingTarget` guard ignores it in text fields):<br>• S = the selected group rows that are **rendered** (`liveTrackSelection` ∩ visible rows ∩ groups).<br>• If any group in S is expanded, collapse every group in S; otherwise expand every group in S.<br>• If S is empty: the Georgian status `დასაკეცად მონიშნე ჯგუფი — დააწკაპუნე ჯგუფის სახელზე.` and no change.<br>• During a gesture, or while `isArrangementPreviewActive()`: `GESTURE_EDIT_BLOCKED_MESSAGE`.<br>• `preventDefault` when the key is handled.<br>• Placed among the plain letters after `if (modifier) return;`, next to `m`/`g`. |
| C4 | **Hidden rows are not rendered** (doc 029 TODO: they leave the DOM and the accessibility tree, and cannot be focused).<br>• A pure helper in `groups.ts` (suggested name `visibleTrackGroupRows(rows, collapsedGroups)`) drops every descendant row (track or group) of a collapsed group. The collapsed group's own header stays.<br>• Nested: collapsing the outer group hides the inner header and all inner members. The inner group's own collapse state is kept and applies again when the outer group expands.<br>• Audio, export and `scheduleKey` do not change. **Hidden lanes keep sounding:** collapse is not mute. |
| C5 | **Overview band** on a **collapsed** group header:<br>• The empty band becomes a non-interactive band (`aria-hidden`, `pointer-events-none`, `data-testid="arrangement-group-overview"`). It holds one block per clip on any descendant track, at `left = clip.start × pxPerSecond` and `width = max(1, clip.duration × pxPerSecond)`, the same geometry `ArrangementClip` uses.<br>• Each block carries `data-overview-clip-id`, `data-overview-start` and `data-overview-end` (seconds, 3 decimals), uses tokens only, and is vertically inset inside the row.<br>• Selected clips use a distinct token style plus `data-overview-selected="true"`.<br>• An expanded header's band is unchanged (empty).<br>• The row height stays **28 px in both states**, so the fit adds one constant per rendered group row.<br>• A pure helper in `groups.ts` returns the blocks; suggested name `groupOverviewClips(arrangement, groupId)`. |
| C6 | **Collapsed header label and active lane.**<br>• Name button `aria-label`: `<name> — ჯგუფი, დაკეცილი, <n> კლიპი` (+ `, მონიშნული` when selected; `n` = descendant clip count). When expanded the label is as today.<br>• **Active lane:** unchanged by collapse. If the active lane is hidden inside a collapsed group, that group's header shows the active accent (`border-l-brand`, as the lane does) and `data-contains-active="true"`. A library add then still goes to the active lane, and the new clip appears in the overview. Rationale: the context is frozen, Live adds to folded tracks, and the user can see where the clip went. |
| C7 | **What collapsing a group does to selections** (the same update, after the collapse):<br>• hidden **row** ids leave the track selection, and the anchor becomes null if it was hidden;<br>• `selectClips(...)` keeps only the selected clips that are on visible lanes;<br>• a lane-scoped `range` (`!range.allTracks`) whose `trackId` became hidden is cleared with `setTimeRange(null)`;<br>• an `allTracks` range is kept, because it already covers every lane.<br>Expanding changes no selection.<br>**Pruning runs only on the collapse action** (button or `U`). When rows become hidden by Redo (C1), nothing is pruned. A selected clip there stays selected and is visible as a selected overview block. A lane range on a now-hidden lane can then exist; this is documented in doc 070 as a known limitation and recorded as a signal, not hidden.<br>**Ctrl+A** while collapsed still selects every clip (unchanged context). The overview shows those clips as selected (C5), so nothing selected is invisible. |
| C8 | **Fit with hidden lanes** (`StudioWorkspace` only; `panels.ts` stays frozen):<br>• `fitLaneHeights` and `detailPanelOpenHeightCap` receive the **visible** lanes only.<br>• The fitted values are written back by **track id**, never by index into the full `tracks`. Hidden tracks keep their previous height (or the default).<br>• The group-row subtraction counts **rendered** group rows.<br>• A collapse or expand refreshes the layout. A chooses `isMotionArmed` to match `toggleTrackFold` and states it in doc 070 (C will see the 300 ms lane transition).<br>• With 0 groups, or with no collapsed group, the layout is byte-identical to `74eca15`.<br>If this cannot be done without editing `panels.ts`, **stop and report**. |
| C9 | **G10, the marquee and drops on a collapsed row:**<br>• The rendered `[data-track-id]` rows shrink, so `laneTrackIdAtPointer` keeps the previous target on a collapsed group row (stage-1 G10), and the marquee spans only visible lanes. B read `clipsInMarquee` (`selection.ts` l.69): it slices the DOM `trackOrder` by the hit indices, so hidden lanes between two visible ones are never included. A confirms this in pre-flight; if it is not so, **stop and report** (the marquee code is frozen).<br>• `ArrangementClip.tsx` and the marquee code are **not edited**.<br>• A library drag dropped on a group row does nothing (no drop handler, as today). |
| C10 | **Interplay with stage 1:**<br>• Ctrl+G, Ctrl+Shift+G and F2 work on collapsed groups.<br>• Ungrouping a collapsed group shows its children.<br>• Selecting a collapsed group together with a sibling and pressing Ctrl+G nests it, and it stays collapsed inside the new group.<br>• Track fold (`folded`) and group collapse are independent. A folded track inside a group is still folded after the group expands. |
| F1 | **Focus extra: after a successful Ctrl/Cmd+G**, if focus was on a name button of a row that is now in the new group, or on `BODY`, focus moves to the new group's name button (`preventScroll`). F2 and `U` then work at once. |
| F2 | **Focus extra: after a successful Ctrl/Cmd+Shift+G**, if focus was inside a dissolved group's row, focus moves to the name button of the first row in `childIds` (track or group). It never ends on `BODY`. |
| F3 | **Focus extra: after a collapse** (button or `U`), if focus was inside a row that is now hidden, focus moves to the collapsing group's name button. The fold button keeps its own focus when it was clicked. |
| H1 | **Shortcut hint** `arrangement-shortcut-hint`: append ` · Ctrl+G / Ctrl+Shift+G · F2 · U`. It is not locked by any test; A must verify that with grep. |

### Files (exact grants)
- **`app/lib/arrangement/groups.ts`:** new pure exports only, for C4, C5 and C7 (for example `visibleTrackGroupRows`, `hiddenTrackIdsForCollapsed`, `groupOverviewClips`, `groupDescendantTrackIds`, `collapseToggleTargets`). Existing exports keep their signatures and behaviour; the round-79 tests are frozen. Names follow AGENT_DISCOVERABLE_CODE; the reviewer flagged "group" collisions with multi-clip groups, so prefer `trackGroup…` prefixes for new names.
- **`app/components/arrangement/ArrangementGroupHeader.tsx`:** new props: `collapsed`, `onToggleCollapse`, `overviewClips`, `pxPerSecond`, `containsActive`, `clipCount`. Adds the fold button, the C5 band, the C6 label and accent, and the ability to be focused from the workspace for F1–F3 (a ref, or a data-attribute query — A chooses, under FORWARDREF_COMPONENT if a ref is used). The F2 editor stays as is.
- **`app/components/arrangement/StudioWorkspace.tsx`:**
  - `collapsedGroups` in `TrackLaneLayout`, plus a toggle callback modelled on `toggleTrackFold`;
  - the `u` key block (C3);
  - the visible-row filter applied to `trackRows`;
  - the C7 pruning;
  - the C8 fit changes (`trackLaneFitEntries`, `withTrackGroupRows`, `resolveTrackLaneLayout`);
  - F1–F3;
  - H1;
  - the new header props.
  - **Untouched:** the marquee code, the gesture code, the Ctrl+arrow block and every other shortcut.
- **`docs/implementation/2026/quarter-IV/069-studio-lab-track-groups-stage-1.md`:** only the status line (l.3), replaced by exactly this (gate-79 review #7):

  > **სტატუსი:** Round 79 — C PASS (browserVerified), გამოქვეყნდა `74eca15` (D-29z44)

- **New tests (new files only):**
  - `app/lib/arrangement/__tests__/track-group-collapse.test.ts` (unit);
  - `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` (workspace; copy the harness from `track-groups-ui.test.tsx` without editing it).
- **New doc** `docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md`:
  - Georgian, LF, per `TEMPLATE.md`;
  - content: C1–C10, F1–F3, H1, the Ableton table (§4), files, tests, mutations;
  - status: awaiting C.
- **Escape clause:** `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementContext.tsx`, `model.ts`, `panels.ts`, `types/arrangement.ts`, `index.ts` and every existing test (both round-79 test files included) stay frozen. If C1–C10, F1–F3 or H1 cannot be met inside these grants, **stop and report**. Examples:
  - a frozen test locks the hint text or the header DOM;
  - the fit cannot take a visible subset without `panels.ts`;
  - a lane needs a new prop.

### Required tests (behavioural)
Fixture: the `/studio-lab` tracks (video, music, stems, sfx). Clips: music `0–10`, stems `2–8`, sfx `4–6`. A records the actual values.
- **GC1 visible rows:**
  - `ჯგუფი 1` = {stems, sfx} collapsed → rows: video, music, G1, with no stems or sfx.
  - Nested (GU3 shape: G2 ⊃ {music, G1 ⊃ {stems, sfx}}):
    - G2 collapsed → video and G2 only;
    - G1 collapsed and G2 expanded → video, G2, music, G1;
    - expanding G2 while G1 stays collapsed → G1's children stay hidden.
  - A stale id in `collapsedGroups` → no effect, no throw.
- **GC2 overview blocks:** `groupOverviewClips` for G1 returns the stems and sfx clips with exact start/end; for G2 it returns all three clips. Video is never included (it cannot be grouped). An empty group lane gives an empty list.
- **GC3 toggle targets (C3):**
  - a mixed selection (one group expanded, one collapsed) collapses both;
  - all collapsed → expand all;
  - no group in the selection → refusal;
  - a hidden group is not a target.
- **UC1 button:**
  - The fold click hides the stems/sfx lanes: no `[data-track-id="stems"]` in the DOM, `aria-expanded="false"`, and the overview band holds 2 blocks with the right `data-overview-start` values.
  - A second click restores the lanes. No history entry: the undo label is unchanged.
- **UC2 `U`:**
  - group selected → collapse, then expand;
  - only tracks selected → the C3 status and no change;
  - `u` typed into the F2 editor, the BPM field or the library search → no collapse;
  - Ctrl+U / Shift+U → no collapse;
  - during `claimPointerGesture` → `GESTURE_EDIT_BLOCKED_MESSAGE`;
  - G1 selected, ArrowUp on the stems Volume fader (preview pending), then `U` → refused, the lanes stay rendered, and after the fader commits `isArrangementPreviewActive()` is false.
- **UC3 nested:** collapse G1, collapse G2, expand G2 → G1 is still collapsed (stems/sfx are still absent).
- **UC4 a11y:**
  - no hidden lane control is focusable (query by role);
  - the collapsed label matches C6, including the clip count;
  - F3: Ctrl+click G1's name, then Ctrl+click the stems name, so focus rests on the stems name button and G1 is in the selection. Press `U` → G1 collapses, and focus is on G1's name button.
- **UC5 selection pruning (C7):**
  - a selected stems clip, then collapse → `getSelectedClipIds()` excludes it, and Delete removes nothing;
  - a lane range on sfx → cleared;
  - an `allTracks` range → kept;
  - a hidden track row in the track selection → removed;
  - Ctrl+A while collapsed → every clip is selected and the overview blocks show `data-overview-selected`.
- **UC6 fit (C8):**
  - auto-fit on, 1 group collapsed: the visible lanes fill exactly as they would with those lanes alone; the sum of visible lane heights plus group rows ≤ the visible rows height.
  - Expanding restores the pre-collapse heights.
  - Hidden-track heights are unchanged across the collapse.
  - 0 groups → heights equal to `74eca15` (the stage-1 TG10 baseline).
  - Nested case: G2 collapsed.
- **UC7 active lane (C6):** the active lane is sfx, then collapse G1 → G1 has `data-contains-active="true"`. The library add (Enter) goes to sfx, and the overview gains one block.
- **UC8 undo/redo (C1):**
  - Ctrl+G {stems, sfx}, collapse, Ctrl+Z → no group row, and stems/sfx are rendered;
  - Ctrl+Y → the group is back and collapsed (as documented). A stems clip selected before the Undo stays selected after the Redo, and its overview block has `data-overview-selected` (C7: no pruning on Redo).
  - Ctrl+Shift+G on a collapsed group → its children are rendered, and F2 holds (focus on the first child's name button).
- **UC9 focus extras:**
  - F1: name-button clicks + Ctrl+G → `document.activeElement` is the new group's name button, and F2 then opens the editor.
  - F2: the group name button is focused, then Ctrl+Shift+G → the focus is on the first child's name button, never `BODY`.
- **UC10 drag over a collapsed row (C9):** with G1 collapsed (rows: video, music, G1), drag the music clip down onto G1's row → the target stays music (as TG8). Release → the clip stays on music.
- **UC10b marquee across a collapsed middle group:** G1 = {music, stems} collapsed (rows: video, G1, sfx). A marquee from the video lane to the sfx lane selects only video/sfx clips, never a music or stems clip.
- **UC11 audio:** collapse and expand while playing → `createBufferSource` call count 0, and the position advances. The export input arrangement is identical (collapse is view-only).
- **UC12 hint:** the H1 text is present.
- **Mutation proofs** (A runs each one, records it, restores and `cmp`s):

  | # | Mutation | Expected red |
  |---|---|---|
  | (a) | hidden rows rendered (filter removed) | UC1/UC4 |
  | (b) | nested hide wrong: only direct children hidden | GC1/UC3 |
  | (c) | fit with every track (visible subset ignored) | UC6 |
  | (d) | fit written back by index instead of track id | UC6 (a hidden-track height check must catch it) |
  | (e) | C7 clip pruning removed | UC5 |
  | (f) | the `u` block placed before the typing guard | UC2 |
  | (g) | F2 focus restore removed | UC9 |
  | (h) | overview start uses `clip.start + 1` | GC2/UC1 |
  | (i) | collapse writes a history entry | UC1 |

- **A's checks (speed rules):**
  - `npm run typecheck` and `npm run lint`;
  - `npx vitest run` on the two new files, both round-79 group test files, and every existing test file found by `grep -rlE "StudioWorkspace|ArrangementLane|ArrangementClip|ArrangementGroupHeader|lane-fit|panels|groups" app --include=*.test.ts --include=*.test.tsx`, plus `render-budget*`, `markers*`, `marker-*`, `grid-*` and `lane*`. Record the list and the counts. All green.
  - No full suite and no `npm run verify` (those belong to the gate).
  - **The code-reviewer is required** (3+ files). Pass its Architecture note to B verbatim, as a signal.

## 2. Pre-flight for A
- Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `REACT_CONTEXT` (confirm no context change), `DESIGN_TOKENS`, `TAILWIND_FIRST`, `AUDIO_ARCHITECTURE` (confirm collapse is not mute), `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `prompts/studio-feature.md`.
- Read `clipsInMarquee` (`selection.ts`) and confirm C9. Confirm `isArrangementPreviewActive` is exposed by `useArrangement()`.
- Verify the baseline: HEAD, 0 status lines, frozen 465/465, snapshots 4/4, protected 4/4, EOL. Record `pgrep -c node`.

## 3. File ownership (exact)
- **Writable:** `groups.ts` (new exports), `ArrangementGroupHeader.tsx`, `StudioWorkspace.tsx` (as in §1), the doc 069 status line, the two new test files, the new doc 070.
- **A's report:** `a-round-80.md` (plus `a-round-80/` scratch in the loop folder).
- **Read-only:** everything else, including `.claude/**`, the protected files, `package*.json` and every existing test.
- **Expected end state:** `git status --short` shows at most 4 `M` lines plus 3 `??` lines. Only root commits.

## 4. Ableton source table
Sources (untrusted data; only their quoted text is used):
- `b-round-78/ableton-mixing-20261022.txt` (Live 12 manual chapter 18, https://www.ableton.com/en/live-manual/12/mixing/, Playwright capture 2026-10-22, sha256 `792522f0…`);
- `b-round-71/ableton-shortcuts-20261021.txt` (§42).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Show or hide the tracks of a group from a button in its title bar | §18.3, capture l.96: "The tracks in a group can be shown or hidden via the Unfold Group button in the title bar." | **Confirmed (text)** | C2: a fold button in the group header | FOLD-BUTTON |
| A folded group in the Arrangement shows an overview of the contained clips | §18.3, capture l.102: "Group Tracks in Arrangement View show an overview of the clips in the contained tracks." (l.104 caption "A Folded Group Track in Arrangement View") | **Confirmed (text)** | C5: blocks on the collapsed header only. The expanded header stays empty (the caption speaks of the folded state; whether an unfolded group shows an overview is **unconfirmed**) | FOLD-OVERVIEW |
| `U` collapses/expands grouped tracks | §42: "Collapse/Expand Grouped Tracks U"; "Fold/Unfold Selected Tracks U or left and right arrow keys" | **Confirmed (text)** | C3: `U` acts on selected groups. `U` on plain tracks and the arrow-key fold are **not bound** (arrows nudge clips in CZABA; signal `TRACK-FOLD-U`) | FOLD-U |
| Multi-selection with mixed fold states under `U` | — | **Unconfirmed** | CZABA choice: any expanded → collapse all | FOLD-U |
| Unfold All Tracks Alt+U | §42 | Confirmed (text) | Not bound (not requested; signal) | — |
| Show/Hide Grouped Tracks `+`/`−` (Session) | §42 | Confirmed (text) | **Deliberate difference:** `+`/`−` zoom the CZABA timeline | REG-ZOOM-KEYS |
| Folding is undoable? | — | **Unconfirmed** | CZABA choice: view state with no history, like track fold (C1) | FOLD-UNDO |
| Hidden tracks keep playing | §18.3 describes folding only as hiding tracks from view | Inferred, not stated | C4: collapse is not mute | FOLD-AUDIO |
| Hidden tracks out of the accessibility tree | — | n/a (CZABA a11y decision, doc 029 TODO) | C4: not rendered | FOLD-A11Y |

C judges the **CZABA requirement** and the **Ableton match** separately.

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup (record the actual values):** as round 79, at both viewports:
- a fresh load with Snap off;
- **Middle East** on music at ≈0.35, the stem `ღამის პულსი · პულსი` on stems at ≈2 and **Soft impact** on sfx at ≈4;
- record the lane heights;
- then click the stems name, Shift+click sfx, Ctrl+G → `ჯგუფი 1` over {stems, sfx}.

| ID | Action | Pass evidence |
|---|---|---|
| FOLD-BUTTON | Click `ჯგუფი 1`'s fold button, then click it again | Collapsed: no `[data-track-id="stems"]` or `sfx` in the DOM; `aria-expanded="false"`; glyph `▸`; the undo title is unchanged. Expanded: the lanes are back with their earlier heights; `aria-expanded="true"`. Screenshot of both states at both viewports |
| FOLD-U | (1) Click the group name, press `U` twice. (2) Select only music and press `U`. (3) Type `u` in the BPM field and in the library search. (4) Ctrl+U / Shift+U with the group selected. (5) Select G1 (Ctrl+click), focus the stems Volume fader, ArrowUp, then `U` | (1) Collapse, then expand. (2) The C3 status and no change. (3) and (4) No collapse. (5) Refused with the gesture status; the lanes stay rendered, and the volume change commits normally (one history entry) |
| FOLD-NESTED | Build `ჯგუფი 2` ⊃ {music, `ჯგუფი 1`} (TG-NEST steps). Collapse G1, collapse G2, expand G2 | After G2 collapses, the rows are video and G2 only. After G2 expands, G1 is still collapsed (no stems or sfx), and music is visible |
| FOLD-A11Y | Collapsed G1 | Hidden lanes are absent from the DOM and from Tab order: Tab from G1's name button reaches no stems/sfx control. The name label matches C6 (`…, დაკეცილი, 2 კლიპი`). The Playwright aria snapshot (`locator('main').ariaSnapshot()` or the timeline container) contains no `სტემები` / `SFX` lane controls |
| FOLD-OVERVIEW | Collapsed G1, at two zoom levels (default and after `+` ×2) | 2 blocks; their `data-overview-start` equals the clip starts (±0.001). Block left/width in px equals start/duration × pxPerSecond (±1 px) at both zooms. Ctrl+A → both blocks `data-overview-selected="true"` |
| FOLD-FIT | Auto-fit on: no group, G1 expanded, G1 collapsed, then G1 + G2 collapsed | Record every visible lane height, the group row height (28) and `V`. When `M ≤ V`, the last visible row bottom ≤ the visible bottom. On expand, the heights return to the pre-collapse values (±0). At 1280x720 record the refit numbers |
| FOLD-SELECTION | (1) Select the stems clip, collapse G1, press Delete. (2) Make a range drag on the sfx clip, then collapse. (3) Ctrl+Shift+L range (all lanes), then collapse | (1) The selection is empty after the collapse; Delete changes nothing (the undo title is unchanged); on expand the stems clip is still there. (2) The range is cleared. (3) The range is kept |
| FOLD-ACTIVE | Click the sfx name (the active lane), collapse G1, select a library item, press Enter | G1 shows the accent and `data-contains-active="true"`. The new clip is added to sfx: the overview gains a block, and on expand it is on sfx |
| FOLD-DRAG-OVER | Collapsed G1 (rows: video, music, G1). Drag the music clip header down onto G1's row, pause 300 ms, release | The ghost and the clip stay on music; there is no lane change |
| FOLD-MARQUEE | (1) Collapsed G1 = {stems, sfx}: marquee from the music lane's empty area down onto G1's row. (2) Discriminating: Ctrl+Shift+G, then group {music, stems} (Ctrl+G) and collapse it (rows: video, G, sfx); marquee from the video lane area to the sfx lane | (1) No stems/sfx clip id in the selection. (2) The sfx clip is selected and no music or stems clip is |
| FOLD-AUDIO | Play (video Mute on by a real click), collapse and expand G1 while playing. Export WAV with G1 collapsed vs expanded | `createBufferSource` calls 0 during the toggles; the position keeps advancing; the master meter stays live. Hidden lanes still sound: a solo-free play with music muted and G1 collapsed still shows master level from stems/sfx. Exports are equal by the round-26 rule |
| FOLD-UNDO | Ctrl+G {stems, sfx}, collapse, Ctrl+Z, Ctrl+Y; then Ctrl+Shift+G on the collapsed group | Ctrl+Z → no group row, lanes rendered. Ctrl+Y → the group is back in the state A documented (collapsed); a stems clip selected before the Undo shows as a selected overview block. Ctrl+Shift+G → the children are rendered, and focus is on the first child's name button (not `BODY`) |
| FOCUS-GROUP | Click stems, Shift+click sfx, Ctrl+G **without** blurring, then F2 | Focus is on `ჯგუფი 1`'s name button after Ctrl+G; F2 opens the editor |
| FOCUS-HIDDEN | Ctrl+click G1's name, then Ctrl+click the stems name (focus rests on stems, G1 stays selected), press `U` | G1 collapses; focus is on G1's name button, not `BODY` |
| HINT | Footer hint | Contains `Ctrl+G / Ctrl+Shift+G · F2 · U` |
| REG-TG | Quick stage-1 check: Ctrl+G, F2 rename, Ctrl+Shift+G, refusal (video) | As round 79 |
| REG-LANE-FOLD | Fold the stems track (its own fold), collapse G1, expand G1 | Stems is still folded (36 px); unfold works |
| REG-ZOOM-KEYS | `+` / `−` with the group selected | The zoom changes; no collapse |
| REG-HYD | The console during all parts | No hydration or `useLayoutEffect` warning and no non-noise error |
| G80-3 | The header link → `/studio-lab` with the demo badge; `/studio/<id>` anonymous → "Sign in required"; anonymous `/api/studio-token` → 401; the page network has no token/recording/download/R2 request and no Authorization header | As stated. The fake-Bearer 403 → BLOCKED (backend unavailable in cloud) |
| T80-TARGETED | Run A's targeted vitest list once (not the full suite) | Green; record the counts |
| SOURCE-UNCHANGED | A's end hashes at C start and end; frozen 465/465; protected 4/4; status per §3 | Equal |

- **Gate rows** (C marks them `gate`, never `passed`): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Neighbours that can break:**
  - the lane auto-fit and the detail panel cap;
  - G10, the marquee and library drops near group rows;
  - the stage-1 commands and the F2 editor;
  - the track fold;
  - the plain-letter block (`m`, `g`, digits);
  - clip selection and Delete.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutation (a), (c) or (e) on a scratch copy outside `store/`, or reason from A's recorded output. C never edits `store/`.

## 7. After this round
1. If B plans round 81 on or after 2026-10-24, round 81 is the **REGRESSION round** (one short check per done or c_pass item at both viewports, plus `npm run test:e2e:smoke`).
2. Otherwise, or after it: SRW-17 stage 3, which brings group Mute/Solo/Volume summing in playback and export, nesting and the half-solo indicator (R17-G2, R17-G3).
3. Then SRW-18, SRW-19, SRW-20, the Lows batch (it includes GATE75 S1–S6, GATE79-S1/S4/S5, O1), SRW-21, the full regression, T12, then VISUAL-A-OBSIDIAN.
- **Architecture checkpoint:** an SRW-17 addendum (`useTrackRowSelection` + collapse state) has been added to the pending request `b-round-78-checkpoint-request.md`. It is non-blocking. Any extraction root approves gets its own B task.
- **Tech Lead R80-T:** in a real Chrome, does the collapsed overview read well at both viewports? Is the active accent on a collapsed group understandable? Does `U` feel right next to `g` (Snap) and `m` (marker)?
