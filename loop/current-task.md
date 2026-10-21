# CURRENT TASK — Round 72: SRW-16 (FB-10) named markers, stage 1 (D-29z37)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-21
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09), with its addenda: Ableton 2026-10-11, periodic commits 2026-10-13, behavioural reverse-engineering 2026-10-14, architecture checkpoint, user priority 2026-10-15, Loop v2 2026-10-19.
- **Decision record:** **D-29z37** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-71.md`. Previous task: `tasks/round-71.md` (an exact copy).
- **Round size:** one feature stage (SRW-16 stage 1) with one owner (A), plus one doc housekeeping item from the round-71 root review (ROOT-R71-L1: doc 063 status line and its verify sentence).
- **Why now:**
  - C round 71 was a **PASS** with `browserVerified: true`, `realVerified: true` and no bugs (`c-round-71.md`, `c-round-71.json`).
  - Root published it as **`1e469e5`** on both remotes (`gates/gate-round-71.json`: `published`). This closes ROOT-R66-M1, the last open reviewer Medium.
  - No C bug is open. SRW-16 is the next unimplemented user feature in dependency order (FB-10, depends only on SRW-04, done).

> **Servers.** B checked on 2026-10-21 at 23:49 +04: `/studio-lab` **200**, `:5199/api/products` **200**, 33 `node.exe` processes. A and C each check both servers at the start of their phase and record the result. Agents never start or stop servers.
> - **If `:5173` is down:** mark every browser item "not run (environment)" and set `browserVerified: false`. No browser row may be marked PASS.
> - **If only the backend is down:** run everything except G72-3's token rows. Mark those rows "not run (environment)".
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never use `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, switch to the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** drags, held presses, double-clicks and the wheel use standalone Playwright (installed chromium, fresh context, no install). Label these **REAL-mouse (PW)**. Plain clicks and typing can use gstack (REAL) or PW.
> - **ENV-EXT-LOAD-HANG:** wait for `domcontentloaded`, then for the workspace selector, then 4 s. Record it.
> - **INFO-R62-GEPLAY-UNDO:** record the Undo title before every Ctrl+Z.
> - **INFO-C65-HARNESS-R2-REGEX:** the forbidden-host filter must match `r2-proxy` and `workers.dev` in **every** page script.
> - **INFO-C69-METER-POST-ACCENT:** onset detection, where used, is a rise of ≥ 3 dB to ≥ −15 dB with a 0.25 s refractory period.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run. Create and remove scratch junctions with `cmd //c mklink /J …` and `cmd //c rmdir …`, with stdin from `/dev/null`. Never run `npx <pkg>` for a package that is not in `node_modules`. **Note (INFO-C71-A-VITEST-CACHE):** a stray `tmp/studio-real-loop/node_modules/.vitest-cache` exists from A's round-71 phase. It is root's to remove. Do not run tools from `tmp/studio-real-loop` and do not delete it.

## Why this round

**Round 71 result: PASS** (`c-round-71.md`). C ran every row, including the starred rows at both viewports: MT-BEATS*, MH-LONG, MH-END, MT-SEEK, MT-TEMPO-CHANGE, MT-LIVE-TOGGLE, MH-SCRUB, MH-NODES* (≤ 120 click nodes in the first 0.5 s at 999 BPM; the old code made ~2200), MH-SCRUB-PERF, MT-LOOP, MT-EXPORT-REG, MT-OFF, REG-HYD and G71-3. The root reviewer gave 9/10, `COMMIT: OK`, all findings Low.

**The user request (FB-10).** Source: `docs/video-to-text-bugs/README.md` FB-10 and `transcripts/2.srt` 01:28–02:12. The user wants named markers ("locators"), for example „აქ შედის მუსიკა“ ("the music comes in here"). He wants to start playback from them and navigate between them. They should sit "up top" (ზემოდან), so he can see where he is in a long project with many tracks, "especially when editing video". Backlog SRW-16: *add at insert marker, rename, jump/play from, delete, keyboard prev/next*; R16-K1..K3.

**Staging (the scope is not reduced).** SRW-16 is split into two checkable stages:
- **Stage 1 (this round):** the data model; add (with a name); show; jump; play from; previous/next; rename; delete; Undo/Redo; Cut Time remap.
- **Stage 2 (scheduled next for SRW-16, not deferred):**
  - moving markers (drag and arrows, with snap);
  - a right-click marker menu (Rename, Delete, Play from here), which gives a mouse path for rename;
  - snapping clips, range and playhead to markers (Live 6.7; it extends SRW-14);
  - Ctrl+←/→ also stopping at clip edges.

## Baseline

Measured by B on 2026-10-21 at 23:49 +04:
- **HEAD `1e469e59d28aebf2e2a90f3d9d6d614d4e599bd1`** (round 71, published on both remotes; `gates/gate-round-71.json` `commit`). `git status --short` is **empty**.
- **Valid start:** exactly that state. If root has committed something newer that changes none of the owned or frozen files, record it and continue. Anything else (a dirty tree, a frozen-file or snapshot mismatch) means stop and report.
- **Frozen list:** `../tmp/studio-real-loop/b-round-71-r72-tree-sha256.txt`, **442** entries, 442/442 OK (run from `store/`). It covers every tracked `app/**` and `docs/implementation/**` file except the 5 owned existing files below. Among the frozen files:
  - `ArrangementRuler.tsx`, `ArrangementTempoRow.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementTransport.tsx`, `index.ts`;
  - `clipboard.ts`, `grid.ts`, `view.ts`, `transport.ts`, `graph.client.ts`, `metronome.ts`, `tempo.ts`;
  - every existing test file.
- **Snapshots:** `../tmp/studio-real-loop/b-round-71-r72-snapshots/`, with `SHA256SUMS.txt`:

  | File | sha256 prefix | EOL (CR / LF) |
  |---|---|---|
  | `app/types/arrangement.ts` | `c4e5e1ce` | 0 / 94 |
  | `app/lib/arrangement/model.ts` | `4d27aaeb` | 0 / 635 |
  | `app/contexts/ArrangementContext.tsx` | `55437441` | 0 / 2946 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `6b530ded` | 0 / 1966 |
  | `docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md` | `57726a52` | 0 / 92 |

- **Protected files:** 4/4 OK (B re-checked).
- **Biome on `./app` (read-only):** **4 errors / 218 warnings / 1 info**, 379 files (`b-round-71/biome-full.txt`).
- **Vitest baseline:** **101 files / 1696 tests** (`gates/round-71/verify.log` l.1189–1190).
- **Line endings:** every owned file is LF. Count CR with node. Never run `biome check --write`, `format --write` or `npm run format`.

**Rules:**
- Do not revert, re-create or reformat anything. The work of rounds 47–71 stays.
- Root owns `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z37: named markers, stage 1

The terms "marker" (CZABA) and "locator" (Ableton) mean the same thing here. **D-15 stays in force:** CZABA has one position. Ableton's "insert marker" is the CZABA position (the playhead). The time selection is the CZABA `range`.

**R1 — Data model** (`app/types/arrangement.ts`, additive):
- Add `export interface ArrangementMarker { id: string; time: number; name: string; }`.
- Add an **optional** field to `Arrangement`: `markers?: ArrangementMarker[]`.
  - It is optional, like `pan?` and `gainDb?`. B counted 4 frozen test files that build `Arrangement` literals with `loop: null`. Also `model.ts:129`, `graph.client.ts:355`, and Store files outside Studio (`sfx-scene.ts`, `SfxSceneBuilder`, `SfxVideoSync`, `free-downloads`) build `Arrangement` values. A required field would break all of them.
- **Normal form** (every lib function keeps it):
  - the list is sorted by `time`, ascending;
  - at most one marker per millisecond;
  - `time` is rounded to ms and ≥ 0;
  - `name` is trimmed, 1–64 characters (counted with `Array.from`), so the field never holds an empty name;
  - **the list is never `[]`:** removing the last marker deletes the key. Then `isSameArrangement(fresh, delete(add(fresh)))` is `true`, and an arrangement without markers keeps its exact JSON.
- Markers sit inside `Arrangement`, so Undo/Redo, `isSameArrangement` and `commitHistory` cover them with no new history code.
- `scheduleKey` (`ArrangementContext.tsx` l.440) stays `[clips, loop]`. **A marker edit never resyncs audio.** The export (`graph.client.ts`, frozen) ignores markers.

**R2 — Pure helpers in a new `app/lib/arrangement/markers.ts`** (no React, no DOM; does **not** import `model.ts`, which avoids an import cycle; own EPS `MARKER_TIME_EPS = 0.0005`). Required exports (names may differ if A records the mapping):
- `MARKER_NAME_MAX_LENGTH = 64`, `MARKER_DEFAULT_NAME_PREFIX = 'Marker'`.
- `arrangementMarkers(arrangement): readonly ArrangementMarker[]` returns `[]` when the key is absent.
- `nextDefaultMarkerName(arrangement)` returns `Marker N`, where N = 1 + the largest N among names matching `^Marker (\d+)$`, or 1 if there are none.
  - Example: names `Marker 1`, `Marker 3`, `Intro` give `Marker 4`.
- `normalizeMarkerName(raw, fallback)`: trims and cuts to 64 code points. If the result is empty, it returns `fallback`.
- `markerAtTime(arrangement, time)`: the marker within `MARKER_TIME_EPS` of `time`, or `null`.
- `addMarker(arrangement, time, name)`:
  - returns `{ arrangement, marker }`, or `{ arrangement: null, existing }` when `markerAtTime` finds one;
  - `time` is `max(0, round-to-ms(time))`; the id is `crypto.randomUUID()`;
  - the list stays sorted.
- `renameMarker(arrangement, id, name)`: returns the **same object** if the id is unknown, or if the normalized name equals the current name.
- `deleteMarker(arrangement, id)`: returns the same object for an unknown id, and deletes the key when the list empties.
- `adjacentMarkerTarget(arrangement, position, direction: -1 | 1, end): { time: number; marker: ArrangementMarker | null } | null`:
  - **next (+1):** the first marker with `time > position + EPS`. If none, `end` (the project end) with `marker: null` when `end > position + EPS`. Otherwise `null`.
  - **previous (−1):** the last marker with `time < position − EPS`. If none, `0` with `marker: null` when `position > EPS`. Otherwise `null`.
  - This matches Live 6.4: "after the first or last locator … jump to the Arrangement start or end".
- `remapMarkersAfterDeleteTime(markers, a, b)` (used by `deleteTime`):
  - a marker at `t ≤ a + EPS` stays;
  - a marker at `t ≥ b − EPS` moves to `t − (b − a)`;
  - a marker strictly inside `(a, b)` is **removed**, because the material it named is gone;
  - after the shift, a marker that lands on the same ms as a kept marker is dropped, and the earlier, kept one wins;
  - it returns the normal form, so an empty result means the key is deleted.

**R3 — Delete Time remap** (`model.ts`): `deleteTime(arrangement, a, b)` also returns the remapped markers (R2). Everything else in `deleteTime` stays byte-for-byte: clips, loop remap, `remapTime`, and the `length ≤ EPS` early return. Its only caller is Cut Time (`clipboard.cutTimeToClipboard` → Ctrl+Shift+X), so Cut Time remaps markers. Two things stay as they are:
- **Delete/Backspace** keep the gap (SRW-24) and never touch markers.
- **Paste** never inserts time, so markers are unaffected.

**R4 — Cut Time status** (`ArrangementContext.tsx`, `cutTimeSelection` only): when markers were removed, append ` {N} მარკერი წაიშალა.` to the existing message. N = the count before minus the count after, and it includes markers dropped by a same-ms collision. Nothing else in the context changes: no new context value fields, no new refs.

**R5 — Marker row** (new `app/components/arrangement/ArrangementMarkerRow.tsx`; read `.claude/prompts/new-component.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `.claude/prompts/studio-feature.md`):
- **Placement.** It goes in the sticky timeline chrome (`timelineChromeRef`), as a new row **between `ArrangementTempoRow` and the Loop row**. It has the same shape as the Loop row: a sticky-left header cell `ARRANGEMENT_HEADER_WIDTH_PX` (224 px) wide, plus a body `timelineWidth` wide. Height `h-5` (20 px). It stays visible while lanes scroll vertically, which is what the user asked for with "ზემოდან".
- **Header cell:**
  - the label `Markers`, in English like the neighbouring `Loop` label;
  - three buttons with design tokens only (24 px tall is acceptable; match the Snap button style):
    - **Add marker:** `aria-label="Add marker (M)"`, `aria-keyshortcuts="M"`, `data-testid="arrangement-marker-add"`;
    - **Previous marker:** `aria-label="Previous marker (Ctrl+←)"`, `aria-keyshortcuts="Control+ArrowLeft"`, `data-testid="arrangement-marker-prev"`;
    - **Next marker:** `aria-label="Next marker (Ctrl+→)"`, `aria-keyshortcuts="Control+ArrowRight"`, `data-testid="arrangement-marker-next"`.
  - Every button has a Georgian `title` that names its key.
- **Body:**
  - One focusable `<button type="button">` per marker, at `left = time × pxPerSecond`. It has a small flag (a 1 px token-coloured vertical line plus a tag) and the name in `text-xs`, `truncate`.
  - **Label width:** at most `min(160 px, x(next marker) − x(this) − 4 px)`, never negative. Neighbours must never overlap; the flag stays visible even at width 0.
  - **Attributes:**
    - `data-testid="arrangement-marker"`, `data-marker-id`, and `data-marker-time` (ms, 3 decimals);
    - `aria-label="Marker «{name}» — {formatArrangementTime(time)}"`;
    - `title` with the full name, the time and the hints `click: jump · double-click: play · F2: rename · Delete: delete` (wording A's, in Georgian).
  - The **selected marker** (last added, clicked, navigated to or renamed) has a visible token ring/accent and `aria-current="true"`.
- **Editor** (used for both add and rename):
  - an `<input type="text" maxLength={64}>`, absolutely positioned at the marker x, about 160 px wide;
  - `aria-label="მარკერის სახელი"`, `data-testid="arrangement-marker-name-input"`;
  - it is focused **with** scroll-into-view (plain `focus()`), and the text is selected.
  - It is a typing target, so global shortcuts are already ignored while it has focus (`isTypingTarget`).
  - **It is a sibling of the marker buttons in the row body, never nested inside a marker `<button>`.** The marker and row key handlers ignore events whose target is the input. Delete/Backspace typed in the input edits the text only and never deletes a marker (MU7, MK-RENAME).
  - **It settles at most once.** The first of Enter, Escape or blur settles it; a later blur (for example when the input unmounts after Enter or Escape) does nothing. So Enter never adds twice or shows a duplicate refusal, and Escape followed by a blur never commits.
  - **`before` is `getArrangement()` at commit time**, not when the editor opened. Edits made meanwhile (for example a clip edit while playing) are kept.
- No new timers, intervals, window listeners or `AudioContext` in the row. Position updates come from existing props or context only; the row must not re-render on every position frame (position frames stay off React render, as for the ruler).
- **Wiring choice (recommended):** `forwardRef` with `useImperativeHandle` exposing `{ beginAddMarker(): void; stepMarker(direction: -1 | 1): void }`, so `StudioWorkspace` only forwards keys. A may choose another shape that keeps the `StudioWorkspace` delta small, and must record it.

**R6 — Add** (button, or **M** with no modifier):
- **The time** is taken at the moment of the press:
  - if a time `range` exists → `range.start` (Live 6.4, confirmed: "at the start of the time selection");
  - else → the live position (`getLivePosition()`), playing or stopped (Live 6.4: real time during playback, confirmed).
- **If a marker exists at that ms** → no editor. That marker becomes selected and focused, and the status shows `ამ დროზე მარკერი უკვე არის: «{name}»`.
- **Otherwise** a pending editor opens at that time, holding `nextDefaultMarkerName`. **Nothing is committed yet**, so there is no history entry and no marker in the arrangement.
  - **Enter** or **blur** commits one history entry labelled `Add Marker` (via `commitArrangement(next, 'Add Marker', before)`). The name is `normalizeMarkerName(text, default)`. The new marker is selected and focus returns to its flag.
  - **Escape** cancels: no marker, no history entry, and the status shows `მარკერი არ დაემატა`.
  - Playback is never interrupted while the editor is open.
- **M while a pointer gesture is active** is refused with `GESTURE_EDIT_BLOCKED_MESSAGE`, the same as the other edit keys. It is added to the existing refusal list.
- M is ignored in text fields (the existing early return), so typing `m` in the library search or the BPM field stays text.

**R7 — Jump and play from** (Live 6.4, confirmed):
- **Click** on a marker flag → `seekTo(marker.time)`, stopped or playing. A playing transport continues from the marker. The marker becomes selected.
- **Double-click while stopped** → seek, then `togglePlayback()`, so playback starts at the marker.
  - Double-click while playing behaves like a click; the first click already jumped.
  - A marker beyond the project end refuses to play with the existing D-27 status. That is honest, not a bug.
- **Snap does not change marker times.** The jump is exact.

**R8 — Previous / next** (buttons, or **Ctrl+←** / **Ctrl+→** with `ctrlKey` and no Alt/Shift/Meta):
- They use `adjacentMarkerTarget(arrangement, livePosition, direction, projectEnd)`, then `seekTo(target.time)`. A playing transport keeps playing. The target marker, if any, becomes selected.
- **When the target is `null`:** no move, and the status reads `წინ მარკერი აღარ არის` or `უკან მარკერი აღარ არის`.
- **The key is ignored** in text fields, on sliders (`isSliderTarget`), on separators, on the loop brace and on the overview, the same targets the plain-arrow clip nudge excludes. It is also refused during a pointer gesture (`GESTURE_EDIT_BLOCKED_MESSAGE`).
- **No existing binding conflicts:** B grepped, and nothing binds Ctrl+←/→. `timelineNavigationKey` returns `null` for Ctrl, and the window handler returns on `modifier` only after the Ctrl+letter branches. The new branch must come **before** that `if (modifier) return;`.
- **Deliberate difference:** Live's Ctrl+←/→ also stops at clip edges (6.9). Stage 1 stops at markers, 0 and the end only. Clip edges are in stage 2.

**R9 — Rename:**
- **F2** on a focused marker opens the editor with the current name.
- **Enter** or **blur** commits `Rename Marker`, but only if the name changed.
- **Escape** cancels.
- An empty or whitespace-only name makes no change, and the status reads `სახელი ცარიელია — დარჩა «{old}»`.
- **Deliberate difference:** Live uses Ctrl+R, which is the browser's reload key. The mouse path (context menu) is in stage 2.

**R10 — Delete:**
- **Delete** or **Backspace** on a focused marker → `Delete Marker`. Focus moves to the next marker, or else the previous one, or else the Add button.
- The clip selection and range are untouched.
- The window Delete branch must not run for a marker target: the marker handles the key itself and stops propagation, **and** the window branch excludes marker targets. Likewise the plain ←/→ clip-nudge branch does nothing when a marker has focus. (Moving markers with the arrows is stage 2.)
- **SRW-24 is unchanged:** with focus elsewhere, Delete/Backspace still delete the selection and leave a gap.

### 0.2 Ableton (workflow addendum 2026-10-11)

**Source:** Ableton Live 12 Reference Manual, "6. Arrangement View" — https://www.ableton.com/en/live-manual/12/arrangement-view/ — §6.4 *Launching the Arrangement with Locators*, §6.9 *Selecting Clips and Time*, §6.11 *Using the …Time Commands*; and "Live Keyboard Shortcuts" — https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/.
- **Captures:**
  - B, 2026-10-12: `b-round-29/ableton-arrangement-view-20261012b.txt`;
  - **re-fetched by B with gstack `/browse` on 2026-10-21:** `b-round-71/ableton-arrangement-view-20261021.txt` and `b-round-71/ableton-shortcuts-20261021.txt`.
- The text was read; no video was watched, and Live was not run. Live version: 12 (manual).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Add while stopped | §6.4 | "added at the insert marker location or at the start of the time selection" | same (position = insert marker, D-15; range.start when a range exists) | MK-ADD*, MK-ADD-RANGE |
| Add during playback | §6.4 | "in real time during playback"; "quantized according to the global launch quantization" | added at the live position; **no quantization** (CZABA has no launch quantization; deliberate) | MK-ADD-PLAYING |
| Name at creation | §6.4 (rename via Ctrl+R / Edit menu) | rename exists; naming at creation **not stated** | CZABA opens the name editor at once (user: "აწერს ამას სახელს"); a CZABA choice, not an Ableton claim | MK-ADD* |
| Click a marker | §6.4 | "jump to locators by clicking on them" | same (seek; playing continues) | MK-JUMP |
| Double-click | §6.4 | "If the transport is stopped, double-clicking on a locator will select it and start playback from that point" | same | MK-PLAYFROM* |
| Previous / next | §6.4 buttons; §6.9 Ctrl+←/→ "snaps the insert marker to locators and the edges of clips" | buttons confirmed; jump to start/end beyond first/last confirmed; Ctrl+arrows confirmed (Win) | buttons and Ctrl+←/→; **markers only** in stage 1 (clip edges in stage 2); playback does not auto-start (Live's buttons "launch playback": **deliberate difference**, Space plays from the position, D-15) | MK-NAV |
| Rename | §6.4 + shortcuts page "Rename Ctrl R" | confirmed | **F2** (Ctrl+R = browser reload); deliberate difference | MK-RENAME |
| Delete | §6.4 | "use the Delete key" | same, on the focused marker | MK-DELETE |
| Default key for Set/Prev/Next | shortcuts page (2026-10-21) | **no default key listed** (only MIDI/key mapping) | `M` for add (video-editor convention, CZABA choice); not an Ableton claim | MK-ADD* |
| Move by drag / arrows | §6.4 | confirmed | **stage 2** (scheduled) | — |
| Delete Time and locators | §6.11 | only "time signature markers within the selected region will also be affected"; locators **not stated** | inside → removed, after → shifted (CZABA decision); Ableton match **unconfirmed** | MK-CUT-TIME |
| Clips snap to locators | §6.7 | confirmed (text) | **stage 2** (SRW-14 extension) | — |
| Loop to Next Locator, Info Text, Song Start | §6.4 | confirmed | not requested by the user; out of SRW-16 | — |

C gives two verdicts for each row: the CZABA requirement (PASS/FAIL), and the Ableton match (confirmed / deliberate difference / unconfirmed / not applicable).

### 0.3 Source (B read it, read-only)

- **`model.ts`:** `deleteTime` at l.381–411 spreads `...arrangement`, so markers would pass through **un-remapped** without R3. `remapTime` is at l.429. `isSameArrangement` uses JSON. `commitHistory`, `undoHistory` and `redoHistory` are at l.589–635.
- **`ArrangementContext.tsx`:**
  - `scheduleKey` at l.440 is `[clips, loop]`;
  - `applyEdit` at l.1038 runs `commitHistory`, then `syncPlayback`; `commitArrangement` is at l.1394;
  - `seekTo` at l.1180 restarts the graph only while playing;
  - `togglePlayback` at l.1087 (D-27 refusal);
  - `cutTimeSelection` at l.1842–1876 (status message, `LOOP_REMOVED_MESSAGE` pattern).
- **`StudioWorkspace.tsx`:**
  - the window `handleKeyDown` is at l.1276–1502: the gesture refusal list at l.1334–1353, `if (modifier) return;` at l.1420, the Delete branch at l.1456, the plain-arrow nudge at l.1466;
  - the chrome rows are at l.1698–1841 (ruler, TempoRow, Loop row).
- **`ArrangementLoopBrace.tsx`:** the pattern for a focusable timeline element with its own keys (`claimPointerGesture`, focus with `preventScroll`).
- **Test harness reference:** `delete-selection-ui.test.tsx` (mounts `ArrangementProvider` + `StudioWorkspace` with a fake `AudioContext` and `createBufferSource`). A may copy the harness into the new UI file (ARCH (c) signal; do not import from other test files).

### 0.4 What could be affected (C checks)

- The timeline chrome grows by 20 px. Check lane, playhead-line, marquee and loop-brace positions, the ruler click/double-click, and the sticky behaviour.
- The window key handler:
  - Space, Home, Delete (SRW-24), the clip nudge, Enter, G, 1/2/3, Ctrl+Z/Y/L/A/D/C/X/V, +/−, Z/X zoom;
  - typing in inputs (search, BPM, the marker name).
- Cut Time (clips, loop remap, position remap) and its status text.
- Undo/Redo labels.
- Playback continuity: no resync on marker edits.
- The export: unchanged.

## 1. Mandatory before acting (A)

1. Read `store/CLAUDE.md`, `.claude/rules/*.md`, and `.claude/primitives-map.json` → the mapped primitives: `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Read the prompts `new-component.md`, `new-test.md` and `studio-feature.md`. Run the `pre-flight` skill.
2. Verify the baseline (§ Baseline, §5 commands): HEAD, empty status, frozen 442/442, snapshots 5/5, protected 4/4, EOL.
3. **Red run first:** write `markers.test.ts` and `markers-ui.test.tsx` before the source. Run them against the baseline and record how they fail (missing module or missing UI). Missing exports count as red.
4. Consult `design-philosopher` (read-only) once about the marker row look: flag, label, selected state, and the 20 px row in the chrome. Record the answer. Design tokens only; no hardcoded colours.
5. Checkpoint `a-round-72/checkpoint.md` after each major step.

## 2. A: the change

### 2.1 Source
Implement §0.1 R1–R10 in the owned files only (§3.1). Keep the `StudioWorkspace.tsx` delta small:
- the row element and its ref in the chrome;
- the M branch;
- the Ctrl+←/→ branch, placed before `if (modifier) return;`;
- adding M to the gesture-refusal condition;
- an `isMarkerTarget` exclusion on the Delete and plain-arrow branches.

No comments in code, semicolons, no `any`, no type assertions, no `@ts-ignore`.

### 2.2 Tests (new files only; existing tests are frozen)

**`app/lib/arrangement/__tests__/markers.test.ts` (pure):**
- **MK1 — normal form.** The key is absent → `arrangementMarkers` is `[]`. `addMarker` at 12.0004 stores 12 (ms). Adding at 30, then 5, then 12 gives times `[5, 12, 30]`. `add` then `delete` → the key is absent, and `isSameArrangement` with the original is `true`.
- **MK2 — duplicates.** Adding again at 12.0003 returns `{ arrangement: null, existing }` with the marker at 12.
- **MK3 — default names.** None → `Marker 1`. With `Marker 1`, `Marker 3` and `Intro` → `Marker 4`. A name `Marker 07` counts as 7.
- **MK4 — `normalizeMarkerName`.** `'  აქ შედის მუსიკა  '` → `'აქ შედის მუსიკა'`. 70 Georgian letters → 64 code points. `'   '` → the fallback.
- **MK5 — rename.** An unchanged or unknown id returns the same object (`toBe`). A changed name returns a new object with the name normalized.
- **MK6 — delete.** An unknown id returns the same object. Deleting the last marker removes the key.
- **MK7 — `adjacentMarkerTarget`**, markers `[5, 12, 30]`, end 40:

  | Direction | From | Result |
  |---|---|---|
  | next | 0 | 5 |
  | next | 5 | 12 |
  | next | 12.0004 | 30 |
  | next | 30 | `{ 40, null }` |
  | next | 40 | `null` |
  | next | 45 | `null` |
  | prev | 12 | 5 |
  | prev | 5 | `{ 0, null }` |
  | prev | 0 | `null` |
  | prev | 45 | 30 |

  With no markers: next from 3 → `{ 40, null }`, prev from 3 → `{ 0, null }`.
- **MK8 — `remapMarkersAfterDeleteTime`**, markers `[2, 5, 7, 10, 15]`, `(5, 10)` → `[2, 5, 10]`:
  - the marker at 5 keeps its id;
  - 7 is removed;
  - 10 collides at 5 and is dropped;
  - 15 moves to 10, with the same id.

  Also: `(0, 1)` on `[0.5]` → empty, and the key is absent.
- **MK9 — `deleteTime` integration.** On an arrangement with clips, a loop and markers, the clips and loop equal the result of `deleteTime` on the same arrangement without markers, and the markers are as in MK8. `deleteTime` on an arrangement without markers produces **no** `markers` key.
- **MK10 — history.** `commitHistory` add → `undoHistory` restores no key → `redoHistory` restores the marker. Labels: `Add Marker`, `Rename Marker`, `Delete Marker`.

**`app/lib/arrangement/__tests__/markers-ui.test.tsx` (mounted `ArrangementProvider` + `StudioWorkspace`; fake `AudioContext` counting `createBufferSource`; `describe` timeout ≤ 15 s as in the other UI files):**
- **MU1 — add with M.** Position 12 (via `seekTo` or a ruler click) → M → the editor is focused, holding `Marker 1`, selected. Type `აქ შედის მუსიკა`, Enter:
  - one `arrangement-marker` with `data-marker-time="12.000"` and an `aria-label` containing the name;
  - no duplicate-refusal status after Enter, and exactly one new history entry (the settle-once rule);
  - Undo title/label `Add Marker`;
  - Ctrl+Z removes it; Ctrl+Y restores it.
- **MU2 — Escape.** M then Escape → no marker, the Undo label is unchanged, and the status is `მარკერი არ დაემატა`. A blur after typing commits (one entry).
- **MU3 — add with a range.** With a range 20–25, the Add button → the editor at 20; Enter → a marker at 20.000 named `Marker N`.
- **MU4 — duplicate.** M at 12 again → no editor, the status shows the existing name, and focus is on the existing flag.
- **MU5 — jump and play.** A click on the flag → position 12. A double-click while stopped → playing, from 12. A double-click while playing does not stop playback.
- **MU6 — previous/next.** Markers 12/20/40 and a project end E. Ctrl+→ from 0 visits 12, 20, 40, E, then gives the status with no move. Ctrl+← returns 40 … 0, then the status. The ◀/▶ buttons do the same. Ctrl+→ while focus is in the BPM input or on a fader range input does nothing.
- **MU7 — rename.** F2 → the editor holds the current name; Enter with a new name → `Rename Marker`. F2 + Escape → unchanged, and no entry after the following blur. F2, select all, **Delete** key, Enter → the marker still exists, its name is unchanged, and the status is `სახელი ცარიელია …` (Delete in the input must not delete the marker).
- **MU8 — Delete on a marker.** A clip is selected, the marker has focus, Delete → the marker is removed and the clip is still present and selected. Then the clip has focus/selection with the marker unfocused, and Delete → the SRW-24 behaviour (clip removed or gap left), with the markers unchanged. Plain → on a focused marker does not move the selected clip.
- **MU9 — Cut Time.** Markers 12/20/40, a clip covering 10–45, range 15–25, Ctrl+Shift+X → markers 12/30. The status ends with `1 მარკერი წაიშალა.` Ctrl+Z restores the clips and markers 12/20/40.
- **MU10 — no resync.** While playing, record `createBufferSource` calls before M; M, type, Enter; F2 rename; Delete → **0 additional** `createBufferSource` calls, and no restart of the graph. Use whatever counter the harness exposes.
- **MU11 — gesture refusal.** During an active pointer gesture (as in the delete-selection harness), M and Ctrl+→ are refused with `GESTURE_EDIT_BLOCKED_MESSAGE`, with no editor and no move.
- **MU12 — typing.** `m` typed into the library search stays text and opens no editor.

Expected totals: **103 files**, 1696 + the new tests, 0 failures.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Each mutation must make its named tests fail:

| Mutation | Must fail |
|---|---|
| (a) `deleteTime` without the marker remap | MK9, MU9 |
| (b) markers inside `(a, b)` collapse to `a` instead of being removed | MK8 |
| (c) next uses `≥ position − EPS` | MK7 |
| (d) no fallback to 0/end | MK7, MU6 |
| (e) store `[]` instead of deleting the key | MK1, MK6 |
| (f) markers added to `scheduleKey` | MU10 |
| (g) Escape commits | MU2 |
| (h) the marker Delete key reaches `deleteSelection` (both guards removed) | MU8 |
| (i) the range start is ignored | MU3 |
| (j) double-click does not start playback | MU5 |
| (k) the duplicate check is removed | MK2, MU4 |
| (l) M is missing from the gesture refusal | MU11 |
| (m) the marker key handler does not exclude the name input | MU7 |
| (n) a blur after Escape commits (no settle-once flag) | MU2, MU7 |

Record survivors honestly, as test gaps.

### 2.4 After the change
- `npx tsc --noEmit` 0.
- Biome read-only on `./app` within 4/218/1; the owned code and test files at 0 diagnostics.
- `npx vitest run`: 103 files, 0 failures.
- `npm run build` rc 0.
- `npm run verify` (record up to two attempts).
- Run the real `code-reviewer` subagent on the diff (more than 3 files) and pass its Architecture note to B.
- A browser smoke on `/studio-lab` at 1440×900: add a marker, jump, play from it. This is labelled "A smoke", not a PASS.

### 2.5 Docs
- **New `docs/implementation/2026/quarter-IV/064-studio-lab-markers.md`**, following `docs/implementation/TEMPLATE.md`, in Georgian with technical terms in English. Status line: `Round 72 — D-29z37; C-ის შემოწმებას ელოდება`. Record the stage-2 list as TODO.
- **Doc 063 (ROOT-R71-L1):** exactly two edits.
  1. The status line becomes `**სტატუსი:** Round 71 — D-29z36; C PASS (round 71), გამოქვეყნდა 1e469e5`.
  2. One sentence is appended to the end of the **Gates** bullet (l.84). The A-phase history stays. Exact text to append (after a space):

     ```text
     root-ის საბოლოო gate-ზე `npm run verify` გავიდა (101 ფაილი / 1696 ტესტი, `gates/round-71/verify.log`).
     ```

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify this round
| Path | Kind |
|---|---|
| `app/types/arrangement.ts` | additive: `ArrangementMarker` and the optional `markers?` |
| `app/lib/arrangement/markers.ts` | **new** |
| `app/lib/arrangement/model.ts` | `deleteTime` remap only (plus its import) |
| `app/contexts/ArrangementContext.tsx` | `cutTimeSelection` status suffix only (R4) |
| `app/components/arrangement/ArrangementMarkerRow.tsx` | **new** |
| `app/components/arrangement/StudioWorkspace.tsx` | §2.1 wiring only |
| `app/lib/arrangement/__tests__/markers.test.ts` | **new** |
| `app/lib/arrangement/__tests__/markers-ui.test.tsx` | **new** |
| `docs/implementation/2026/quarter-IV/064-studio-lab-markers.md` | **new** |
| `docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md` | the two §2.5 edits |

At the end, `git status --short` shows exactly these **10** lines: 5 ` M` and 5 `??`.

### 3.2 Frozen this round
- Everything in `b-round-71-r72-tree-sha256.txt` (442), including `ArrangementRuler.tsx`. The backlog file list named the ruler; B moved markers to their own row so the ruler, with its RU-DBLCLICK watch, stays untouched. Also frozen: `clipboard.ts`, `index.ts` (no new export needed) and every existing test.
- The protected files (4).
- Root-owned config and agent files.
- **If a frozen file must change, stop and report to B.** Do not edit it.

## 4. Acceptance (C)

**Checkpoint order:** G72-2 → R72-S → R72-U → G72-1 → §4.6 (browser rows) → §4.7 (regressions) → G72-3.
- Write `c-round-72/checkpoint.md` as you go.
- Check both servers at the start, after the offline items, and before the report.
- `browserVerified` is `true` only if every REAL-browser row in §4.6, §4.7 and G72-3's workspace rows ran.

### 4.1 R72-S — static (read-only)

`diff -u` against the round-72 snapshots must show:
- **`arrangement.ts`:** additive only.
- **`model.ts`:** only the `deleteTime` return (markers) and the import.
- **`ArrangementContext.tsx`:** only the `cutTimeSelection` suffix. `scheduleKey` is unchanged.
- **`StudioWorkspace.tsx`:** only the §2.1 items.
- **Doc 063:** exactly the two edits.

Also check:
- The new `markers.ts` imports neither `model.ts` nor React.
- No new timer, interval, window listener or `AudioContext` in the new or owned files (the row may use React element handlers).
- **Banned patterns:**
  - no `any`, assertions, `@ts-ignore`, comments or hardcoded colours (tokens only);
  - no `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts;
  - the new test files do not import from other test files.
- **EOL:** LF only. **Doc 064** exists with the TEMPLATE sections and the status line.

### 4.2 R72-U — unit and mutation (C's own scratch, own edits)
- **Red run:** run the two new files against a scratch tree holding the round-72 **snapshots** of the owned files, with `markers.ts` and `ArrangementMarkerRow.tsx` absent. They must fail; record how.
- **Mutations a–n** in your own scratch. Each must kill its named tests.
- **C extras (info), suggested:**
  - (o) the label width ignores the next marker;
  - (p) Ctrl+←/→ is not excluded on sliders;
  - (q) blur does not commit.
- Record survivors as test gaps.
- **Durations:** run the two files alone 3 times and record.

### 4.3 G72-1 — gates
- tsc 0; build.
- Biome read-only on `./app` within 4/218/1; the owned code/test files at 0 diagnostics.
- **Vitest 103 files, 0 failures** (quiet; record the count).
- **`npm run verify` exit 0.** At most two quiet attempts, each recorded. If neither returns rc 0 → FAIL.
- Record the `node.exe` count.

### 4.4 G72-2 — tree
Protected 4/4 OK; frozen 442/442 OK; `git status --short` = the 10 §3.1 lines; HEAD recorded at start and end; the sha256 of the owned files at start and end of C's phase must be equal.

### 4.5 Fixtures and reading values
- **F-ME:** a REAL-mouse (PW) drop of `Middle East` on the music lane at **0 s**. Record the project end from the timeline/status; C measured 01:41.352 for this clip in round 71 (INFO-C71-ME-LENGTH). **Do not assume 133 s.**
- **Positions:** read the position readout (ms). Marker times come from `data-marker-time`; marker x from `getBoundingClientRect()`, compared with the seconds-ruler tick at the same time (± 1 px).
- **Snap:** state the Snap and grid state in every row. Seeks by ruler click follow the snap rules (SRW-14); use Snap off when a non-grid time is needed.
- **Node count (instrumentation (PW)):** the round-71 `addInitScript` wrapper around `createBufferSource`, with a timestamped log on `window`. Run with the metronome off.

### 4.6 Browser rows — fresh `/studio-lab` at 1440×900; starred rows also at 1280×720

| ID | Steps | Pass |
|---|---|---|
| **MK-ADD*** | F-ME, stopped; REAL ruler click to **12.000** (Snap on, 1 s grid, or Snap off + exact); REAL key **M**; type `აქ შედის მუსიკა`; REAL Enter | the flag is in the marker row **above the lanes** at x = the 12 s ruler tick (± 1 px); the full name is readable (or truncated, with the full name in `title`/`aria-label`); `data-marker-time="12.000"`; the Undo title names `Add Marker`; REAL Ctrl+Z → the marker is gone; REAL Ctrl+Y → back; record the Undo titles |
| MK-ADD-RANGE | REAL-mouse (PW) range drag on the music clip 20 → 25 s (Snap on); REAL click on **Add marker**; REAL Enter | a marker at 20.000 named `Marker N` (default); the range stays |
| MK-ADD-PLAYING | REAL Space from 0; at ~5 s REAL **M**, type `x`, REAL Enter | the marker time is within ± 0.15 s of the readout at the M press; the position kept advancing throughout (readout sampled every 100 ms, monotonic); **0** `createBufferSource` calls from M to 0.5 s after Enter (instrumentation (PW), metronome off) — **MK-NO-RESYNC** |
| MK-ESC | REAL M, then REAL Escape | no new marker; the Undo title is unchanged; status `მარკერი არ დაემატა` |
| MK-DUP | position at 12.000 again (REAL click on the marker); REAL M | no editor; the status names `აქ შედის მუსიკა`; still one marker at 12 |
| MK-JUMP | stopped at 0: REAL click on the 12 s flag → readout 12.000; REAL Space, then at ~14 s REAL click on the 20 s flag | readout 20.0xx, still playing (advances afterwards) |
| **MK-PLAYFROM*** (real audio) | stopped at 0; REAL-mouse (PW) **double-click** on the 12 s flag | playback starts; the readout 1 s later is 13.0 ± 0.2; a master-meter rise within 0.3 s of the double-click (Middle East is not silent at 12 s) |
| MK-NAV | markers at 12, 20, 40 (add 40 as needed); stopped at 0: REAL Ctrl+→ ×5, then Ctrl+← ×5; then the ▶/◀ buttons with REAL clicks; then while playing from 0, REAL Ctrl+→ | the readouts are 12, 20, 40, *end*, then no move + status; 40, 20, 12, 0, then no move + status; the buttons give the same sequence; while playing it jumps to 12 and keeps playing |
| MK-RENAME | focus the 20 s marker (REAL click), REAL F2, type `რეკლამა`, REAL Enter; then F2 + Escape; then F2, select all, Delete, Enter | the label becomes `რეკლამა`, Undo `Rename Marker`; Escape → unchanged; empty → unchanged + status `სახელი ცარიელია …` |
| MK-DELETE | REAL click on the music clip (selected); REAL click on the 40 s marker; REAL Delete | only the marker is gone; the clip is still present (same start/end) and selected; then REAL click on the clip, REAL Delete → the SRW-24 behaviour (the clip is removed, leaving the gap), and the markers at 12/20 are unchanged |
| **MK-CUT-TIME** (R16-K3) | re-create F-ME with markers at 12, 20 and 40 (40 via M after a click to 40); REAL-mouse (PW) range drag on the music clip 15 → 25; REAL Ctrl+Shift+X | markers become 12 and **30**; the 20 s marker is gone; the status ends with `1 მარკერი წაიშალა.`; the music clip is split, and its right part (originally from 25) now starts at 15, 10 s earlier (as before); REAL Ctrl+Z → clips and markers 12/20/40 return |
| MK-LAYOUT* | two markers 1 s apart (e.g. 50 and 51) with long names (60 characters), at default zoom | the label boxes do not overlap (`getBoundingClientRect`); both flags visible; the full names in `title`; the row height is 20 px; scroll the lanes vertically → the marker row keeps its y; scroll horizontally → the flags move with the ruler ticks |
| MK-TYPING | REAL click in the library search, type `m`; REAL click in the BPM field, type `m` then Escape | `m` appears as text (search); no editor opens; no marker is added |

### 4.7 Regressions (directly related)
- **MK-EXPORT-REG:**
  - F-ME without markers → Export WAV. Then add 3 markers → Export again.
  - The two WAVs must be equal under the export comparison rule (frames, NaN, header, full-scale count and RMS, or max |delta| ≤ 1 LSB; byte identity is never the oracle).
- **REG-CHROME:**
  - **Ruler:** a REAL ruler click seeks; a REAL-mouse (PW) ruler double-click Fit works (RU-REG, 3 tries; record misses under the INFO-C66 watch).
  - **Loop row:** Ctrl+L on a range creates the brace; a REAL-mouse (PW) drag of the brace moves it.
  - **Tempo row:** the BPM field accepts 90.
  - **Playhead:** the line aligns with the readout.
  - **Marquee:** the marquee on lanes still selects clips (y offsets correct after the 20 px row).
- **REG-KEYS:** Space play/pause; Home → 0; G toggles Snap; 1/2 step the grid; with a clip selected, plain → nudges it (focus on the lane, not on a marker); Ctrl+Shift+L extends the range.
- **REG-HYD:** no hydration warning on the `/studio-lab` load.

### 4.8 G72-3 — anonymous workspace and purchase protection
- Use a fresh browse state. `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- In every §4.6–§4.7 run there must be:
  - no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 (`r2.cloudflarestorage`, `r2.dev`, `r2-proxy`, `workers.dev`);
  - no `Authorization` header from workspace code.
- `/studio/middle-east` shows "Sign in required". Anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; a fake Bearer → **403**.
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, the homepage R2 cover image and Google Fonts.

### 4.9 Ableton
Give two verdicts for each §0.2 row: the CZABA requirement (PASS/FAIL), and the Ableton match (confirmed / deliberate difference / unconfirmed / not applicable).

### 4.10 Not run this round, and carried items (honest)
- **Not run:**
  - macOS keys (Cmd/Option; untested platform);
  - video sync and C-R27-01;
  - the FB-01..FB-16 stage regression;
  - `npm run test:e2e:smoke` (root's).
- **Tech Lead:**
  - R65-T … R71-T are unchanged.
  - **R72-T:** in your Chrome, add three named markers on a long project with video. Is the row "up top" where you expect it? Is M plus a typed name quick? Do click, double-click and Ctrl+←/→ feel right? Is F2 for rename acceptable until the stage-2 right-click menu arrives?
- **Carried (Lows batch / own tasks):** see `b-round-71.md` §7.

## 5. Commands

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-71-r72-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-71-r72-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/types/arrangement.ts app/lib/arrangement/model.ts app/contexts/ArrangementContext.tsx app/components/arrangement/StudioWorkspace.tsx docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md; do cmp -s "$f" "../tmp/studio-real-loop/b-round-71-r72-snapshots/$(basename "$f")" && echo "same $f" || echo "changed $f"; done
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){const s=fs.readFileSync(f,'utf8');console.log(f,'CR',(s.match(/\r/g)||[]).length,'LF',(s.match(/\n/g)||[]).length)}" app/types/arrangement.ts app/lib/arrangement/model.ts app/lib/arrangement/markers.ts app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementMarkerRow.tsx app/components/arrangement/StudioWorkspace.tsx app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/markers-ui.test.tsx
npx vitest run app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/markers-ui.test.tsx app/lib/arrangement/__tests__/delete-selection-ui.test.tsx app/lib/arrangement/__tests__/delete-selection.test.ts --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/types/arrangement.ts app/lib/arrangement/markers.ts app/lib/arrangement/model.ts app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementMarkerRow.tsx app/components/arrangement/StudioWorkspace.tsx app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/markers-ui.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

## 6. Requests to root (non-gating for A)

1. **Commit unit:** round 72 alone, after a C PASS with `browserVerified: true`. SRW-16 stage 1 and ROOT-R71-L1 then close on C evidence.
2. **ARCH-CHECKPOINT-SRW14-PREFS** (eighth request) is still open. New signals:
   - round 71's root Signals 3 and 4 and A's reviewer note: a second refill pipeline beside the loop refill, and repeated `startGraph` edits. Reviewer: keep, and merge into one scheduler unit only if a third refill kind appears.
   - **This round adds (watch):** a 7th key-routing clause (`isMarkerTarget`) in the `StudioWorkspace` handler (ARCH (e)), and a 5th copy of the UI test harness (ARCH (c)).
   - Bounded read-only frontend-architect review per `store/.claude/references/architecture-checkpoint.md`. Answer keep/extract, value and risk in ≤ 3 sentences each. An approved change becomes its own B task. **Round 72 does not wait.**
3. **INFO-C71-A-VITEST-CACHE:** a stray `tmp/studio-real-loop/node_modules/.vitest-cache` from A's round-71 phase is root's to remove.
4. **Order after Phase 1 (root notes, recorded by B):** Phase 1 → T12 → **VISUAL-A-OBSIDIAN** (root note 2026-10-21, user-approved, no further go-ahead) → then BLOCKED "phase 2 awaiting user go-ahead" (root note 2026-10-20).
   - Neither is planned or mixed into this round.
   - The marker row uses the same language as its neighbours: the English `Markers`/`Loop` labels and Georgian status lines. VISUAL-A's M2 strings module will move the strings later.

## 7. Reports and next

- **A:** `a-round-72.md` (pre-flight, baseline, red run, diff summary, tests, mutations, smoke, code review with its Architecture note, command tails, deviations) and `a-round-72-result.json`.
- **C:** `c-round-72.md` and `c-round-72.json` with `taskStatus`, `browserVerified`, `realVerified`, `bugs`, `passed`, `blocked`, `info`, `commitReadiness` and `ableton`.
- **Next (B):** on PASS, SRW-16 stage 2 (move by drag/arrows with snap, right-click menu with Rename/Delete/Play from here, snapping to markers, Ctrl+←/→ at clip edges). Then SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, the open follow-ups, the Lows batch, SRW-21, the full regression, T12, VISUAL-A. Any C bug comes first.
