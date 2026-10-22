# CURRENT TASK — Round 81: SRW-17 (FB-12) stage 3 — group Mute / Solo / Volume in playback and export, nesting, half-solo (D-29z46)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-80.md` (an exact `cmp` copy). Rationale: `b-round-80.md`. Decision record: D-29z46 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage (the last SRW-17 stage, exactly as D-29z44 R2 defined it) with one owner (A). It carries one **bounded, explicitly labelled bug fix (X1 = C bug C80-1)**, because the group volume fader added here lives in rows that a collapse can hide, so the same focus/blur rule must hold for it.
- **SRW-17 stages.** Nothing is deferred:
  - stage 1: C PASS round 79, published `74eca15`;
  - stage 2: C PASS round 80, published `68383fa`;
  - **stage 3: this round** (R17-G2, R17-G3, the half-solo indicator, and the C80-1 fix).

## Why this round
- **C round 80:** **PASS, `browserVerified=true`, `realVerified=true`.** It found 2 Low bugs, both of them A's documented deviations:
  - **C80-1 (Low):** `U` or the fold button is refused with the drag message when a fader in a row that would be hidden is merely focused and nothing is pending. **Fixed in this round as X1** (§1).
  - **C80-2 (Low):** the fold label word order. **B accepts the shipped wording** `ჯგუფის დაკეცვა / გახსნა — <name>` as the C2 contract. Reasons: the words are the same, the accessible name is unique, and the reorder is forced by the frozen stage-1 `groupName` regex. Unfreezing a published regression lock gives the user nothing. No code change; doc 070 records the decision (§1 Files).
- **Gate 80** published `68383fa91f0e58f577b5e33f14d21ff63fb1531c` to both remotes (review 8.5/10, COMMIT OK; verify 1900/1900).
- **No Critical or High bug is open.**
- **Regression round:** not due. `regression-last.json` is dated 2026-10-21; the regression round falls due on or after **2026-10-24**.
- **Next scope in dependency order:** SRW-17 stage 3. R17-G2 and R17-G3 are not met yet.
- **C observation O3** (a refused cross-lane drag commits its horizontal part) is pre-existing and outside this round's files. B schedules **one discriminating repro row** for the next round (§7). It is not buried in the Lows batch.

## Baseline (measured by B, 2026-10-22)
- **HEAD `68383fa91f0e58f577b5e33f14d21ff63fb1531c`** (the commit published by gate 80). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-80-r81-tree-sha256.txt`, **461** entries, **461/461 OK**.
  - Check it with: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-80-r81-tree-sha256.txt`.
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 11 owned existing files below.
  - That includes `groups.test.ts`, `track-groups-ui.test.tsx`, `track-group-collapse.test.ts`, `schedule.test.ts`, `model.test.ts`, `track-pan.test.tsx`, `track-meter.test.ts`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `panels.ts` and every other test.
- **Snapshots:** `../tmp/studio-real-loop/b-round-80-r81-snapshots/` (`SHA256SUMS.txt`). All files are LF with CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/types/arrangement.ts` | `a7c8b044` | 109 |
  | `app/lib/arrangement/schedule.ts` | `69bd35c7` | 37 |
  | `app/lib/arrangement/graph.client.ts` | `f3b8003e` | 373 |
  | `app/lib/arrangement/model.ts` | `6efefa41` | 639 |
  | `app/lib/arrangement/groups.ts` | `d6a90628` | 381 |
  | `app/contexts/ArrangementContext.tsx` | `e374b433` | 2948 |
  | `app/components/arrangement/ArrangementGroupHeader.tsx` | `f0c7d042` | 234 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `5f77a926` | 2471 |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `22abaeb8` | 308 |
  | `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` | `ff13124a` | 989 |
  | `docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md` | `a31b66ad` | 86 |

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

### Today (B read the source at `68383fa`)
- **Model.** `ArrangementTrackGroup` is `{ id, name, parentId }` (`types/arrangement.ts` l.14). Tracks carry `volume` (0–1 linear), `mute`, `solo` and `pan?`.
- **Audibility.** `isTrackAudible(track, tracks)` (`schedule.ts` l.4): a track is heard if it is not muted and either no track is soloed or it is soloed. It has 3 callers:
  - `applySchedule` initial track gain (`graph.client.ts` l.114);
  - the `syncPlayback` non-restart loop (`ArrangementContext.tsx` l.979, `setTrackGain` per track);
  - the export dialog video-sound line (`ArrangementExportDialog.tsx` l.63).
- **Graph.** `clip → clipGain → trackGain → panner → master`. The per-track meter tap sits on the panner output (`graph.client.ts` l.123–126), so a track meter reads post-track-gain. Live and export both use `applySchedule`; `renderArrangementWav` passes `tracks: arrangement.tracks` (this line is checked as source text by `track-pan.test.tsx` l.454–460).
- **No restart on mix changes.** `scheduleKey` covers clips and the loop only, and round 79 TG-AUDIO verified that Ctrl+G during playback creates **0** `createBufferSource` calls.
- **Track mix actions** (`ArrangementContext.tsx` l.2122–2273): `toggleTrackMute` (`Mute — <name>`), `toggleTrackSolo(trackId, additive)` → `toggleSolo` (`model.ts` l.565; exclusive clears other track solos, Ctrl/Cmd toggles one), and the volume pipeline:
  - `previewTrackVolume` sets `volumeBeforeRef`;
  - `beginTrackVolumeGesture` claims the pointer;
  - `commitTrackVolume` writes one `Volume` entry;
  - `blurTrackVolume` commits on blur.
- **Group header** (`ArrangementGroupHeader.tsx`): a 28 px row, 224 px wide, holding the fold button (glyph drawn by `::before`), and the name button or the F2 editor. It does not call `useArrangement()` today.
- **C80-1 cause** (`StudioWorkspace.tsx`, collapse path near l.951): `focusHidden && isSliderTarget(...)` refuses with `GESTURE_EDIT_BLOCKED_MESSAGE` even when nothing is pending.

### Constraints found by B in the frozen tests (do not rediscover them)
- **Row height:** 28 px is locked as a **literal** (`GROUP_ROW_PX = 28`) in `track-groups-ui.test.tsx` and `track-group-collapse-ui.test.tsx`. **The group row stays 28 px.**
- **Row text:** `rowOrder` and `selectedRows` read the group row's `textContent` (`track-groups-ui.test.tsx` l.227, l.245). **New controls must add no text nodes.** M and S glyphs use `::before` (the fold-button pattern) with `data-*` mirrors. The volume readout goes in `aria-valuetext` and `title` only, with no text span.
- **Labels:** they must not match the frozen lane queries `/^Volume — სტემები/`, `/^Volume — მუსიკა/`, `/Mute — (სტემები|SFX)/`, nor the group-name regex `^<name> — ჯგუფი`.
- **Normal form:** `groups.test.ts` l.77/148 compare groups with `toEqual({ id, name, parentId })`, and the l.255–285 "group state survives every edit" test runs `toggleSolo` / `setTrackMix` on a grouped arrangement. **New group fields are optional and omitted at their defaults.** `toggleSolo` must leave `groups` deep-equal when no group is soloed.
- **Source-text test:** `track-pan.test.tsx` l.454–460 requires `renderArrangementWav` to keep containing `applySchedule(ctx, planSchedule(arrangement, 0)`, `tracks: arrangement.tracks,` and `clipGains: clipLinearGains(arrangement)`, and **no** `pan` substring. A new option line in that call must not contain `pan`.

### Contract (B decision: the smallest honest behaviour consistent with FB-12, R17-G2/G3 and Live 12 §18.1/§18.3/§18.6)

| # | Rule |
|---|---|
| M1 | **Model.** `ArrangementTrackGroup` gains `volume?: number` (0–1 linear, default 1), `mute?: boolean` (default false) and `solo?: boolean` (default false). **Each is omitted at its default** (the `pan?` / `gainDb?` pattern).<br>• A pure normaliser (for example `setTrackGroupMix(arrangement, groupId, patch)` in `groups.ts`) clamps volume to [0, 1], ignores non-finite values, and returns the **same object** when nothing changes.<br>• `groupSelectedRows`, `ungroupSelectedRows` and `renameTrackGroup` keep their outputs byte-identical for groups without mix state. |
| M2 | **Audibility (one pure source of truth).** Add `trackEffectiveGains(arrangement): Map<trackId, number>` in `schedule.ts`. For each track:<br>`gain = audible ? track.volume × Π(ancestor group volume) : 0`.<br>A track is **audible** iff:<br>• the track and every ancestor group are unmuted, **and**<br>• either no track or group is soloed anywhere, or the track is soloed, or any ancestor group is soloed.<br>**Mute beats solo at every level.** A soloed track inside a muted group is silent.<br>• Video tracks cannot be grouped, so they only follow the "any solo anywhere" rule.<br>• Cyclic or ghost `parentId` chains (see the GN test l.193) stop safely and never loop.<br>• `isTrackAudible(track, tracks)` keeps its signature and behaviour; `schedule.test.ts` stays frozen. A may add a group-aware sibling, but every production caller uses the group-aware path. |
| M3 | **Effective gain, not a bus (B decision D-29z46).**<br>• **No new audio nodes and no topology change.** `applySchedule` gets one new optional input (for example `trackGains?: ReadonlyMap<string, number>`), used for the initial track gain when present. Without it, behaviour is byte-identical (the frozen graph/meter/pan tests).<br>• `startGraph`, the `syncPlayback` non-restart loop (l.979) and `renderArrangementWav` all use `trackEffectiveGains(arrangement)`.<br>• Group Mute, Solo and Volume changes, Ctrl+G and Ctrl+Shift+G during playback create **0** new buffer sources. Gains ramp through the existing `setTrackGain`.<br>• `scheduleKey` is unchanged.<br>• Why: the result is acoustically identical to a summing bus without effects, because linear gains multiply. A real bus would need a graph rebuild or live rewiring on every Ctrl+G, and round 79 TG-AUDIO (published) locks 0 sources on Ctrl+G.<br>• Consequence, recorded as a CZABA choice: **a child track meter shows the post-group level** (it falls to the floor when its group is muted or at 0), because CZABA group rows have no meter of their own. The plan l.46 "FB-12 group bus" note is superseded by D-29z46. |
| M4 | **Group header controls** (`ArrangementGroupHeader.tsx`, which may call `useArrangement()` directly, as `ArrangementLane` does). Order: fold, name, **M**, **S**, **Volume**. They are visible and usable in **both** collapsed and expanded states.<br>• **M:** `aria-pressed`, `aria-label` `Mute — <name> (ჯგუფი)`, `title` `Mute`, 24×24, glyph `M` via `::before`, `data-testid="arrangement-group-mute"`, the same token styles as the lane M button.<br>• **S:** `aria-pressed` is `true` (soloed), **`mixed`** (not soloed, but some descendant track or group is soloed; Live §18.3 half-coloured Solo), or `false`. Mirrored in `data-solo="on|mixed|off"`. `aria-label` `Solo — <name> (ჯგუფი, Ctrl/Cmd+click ამატებს)`, `title` as the lane's, 24×24, glyph `S` via `::before`, `data-testid="arrangement-group-solo"`. The `mixed` style is a two-tone token style (for example a half `bg-brand` gradient through tokens, or `border-brand` with a `bg-brand/40` fill). No hardcoded colours.<br>• **Volume:** `<input type="range" min 0 max 1 step 0.01>`, `aria-label` `Volume — <name> (ჯგუფი)`, `aria-valuetext` `<n>%`, `title` `Volume <n>%`, `data-testid="arrangement-group-volume"`, `min-w` ≥ 48 px. No text readout node.<br>• **Layout budget:** the row stays 28 px. At depth 2, the name button keeps ≥ 40 px rendered width (truncate). A records the measured widths at depth 0/1/2 in doc 071. |
| M5 | **Actions and history** (context; `useArrangement()` gains members, existing members keep their shape):<br>• **Group Mute:** one entry, `Mute — <group name>`.<br>• **Group Solo:** one entry, `Solo — <group name>`. Plain click is exclusive: it clears every other track and group solo, and a click on the only soloed item clears it (the `toggleSolo` shape). "Only soloed" means that no other track **and no group** is soloed. Ctrl/Cmd+click toggles only that group.<br>• **Track Solo (`toggleSolo`, model.ts):** exclusive mode now also clears group solos. With no group soloed, its output is unchanged, so the frozen `model.test.ts` and GN test stay green.<br>• **Group Volume:** the same semantics as track Volume: a pointer drag claims the gesture and writes **one** `Volume` entry on release; a key press previews and keyup commits **one** `Volume` entry; blur commits; pointercancel reverts; a double-click resets to 100%. A may generalise `volumeGestureRef` / `volumeBeforeRef` with a target kind, or add a parallel group pipeline with cross-flush. Either way, a pending track preview and a pending group preview never merge into one entry, and the existing track-volume tests stay unedited.<br>• All group actions are refused during another pointer gesture (`refuseEditDuringGesture`) and are no-ops for an unknown group id.<br>• Undo/Redo restore the group mix state exactly. |
| M6 | **Ungroup and stage-1/2 interplay.**<br>• Ctrl+Shift+G **drops the dissolved group's mix state**. Children keep their own volume, mute and solo, so a muted group's children become audible again. Undo restores the group together with its mix state. This is documented in doc 071 as a CZABA choice (unconfirmed in Live).<br>• Ctrl+G nesting a group keeps that group's mix state.<br>• Collapse does not change audio (stage 2 C4), and a collapsed muted group still silences its children.<br>• Renaming keeps the mix state. |
| M7 | **Export dialog** (`ArrangementExportDialog.tsx` l.63, one expression): the video-sound line uses the group-aware audibility, so soloing a group shows the video as not audible, matching the export. |
| X1 | **Bounded bug fix C80-1 (collapse with focus in a row that becomes hidden).** Replace the slider-focus refusal with blur-then-collapse, in this order:<br>1. capture the focused row id (`focusedTrackRowId()` reads `document.activeElement`, so read it first);<br>2. if that row becomes hidden, call `blur()` on the focused element. The existing `onBlur` commits a pending track or group volume preview as **one** `Volume` entry; A confirms that `blur()` runs React `onBlur` synchronously in jsdom and in Chromium;<br>3. apply the collapse;<br>4. set `pendingRowFocusRef` from the captured id so F3 moves focus to the collapsing group's name button.<br>The pointer-gesture and `isArrangementPreviewActive()` refusals stay. A focused fader in a row that stays visible keeps its focus (as today). This applies generically: it covers a group volume fader in an inner group header hidden by an outer collapse. **No "volume preview pending" context flag is added**: the blur path makes it unnecessary, and the reviewers' signal is closed as resolved by X1. |

### Files (exact grants)
- **`app/types/arrangement.ts`:** the three optional fields on `ArrangementTrackGroup` only.
- **`app/lib/arrangement/schedule.ts`:** `trackEffectiveGains` (and an optional group-aware audibility helper). `isTrackAudible` is unchanged.
- **`app/lib/arrangement/graph.client.ts`:** the new optional `applySchedule` input and its use for the initial track gain; one new line in the `renderArrangementWav` call (no `pan` substring).
- **`app/lib/arrangement/model.ts`:** `toggleSolo` (exclusive mode clears group solos) only.
- **`app/lib/arrangement/groups.ts`:** new pure exports for the group mix (for example `setTrackGroupMix`, `toggleTrackGroupSolo`, `trackGroupSoloState`, `trackGroupAncestorIds`). Existing exports keep their signatures and behaviour. Use `trackGroup…` prefixes (AGENT_DISCOVERABLE_CODE).
- **`app/contexts/ArrangementContext.tsx`:** the group actions (M5), the group volume pipeline, and the three gain call sites (M3). No other behaviour change; `scheduleKey` is unchanged.
- **`app/components/arrangement/ArrangementGroupHeader.tsx`:** M4.
- **`app/components/arrangement/StudioWorkspace.tsx`:** X1, plus any props M4 needs if A wires them here instead of through `useArrangement()`. Untouched: the marquee code, the gesture code, the key blocks other than the collapse refusal, and the fit.
- **`app/components/arrangement/ArrangementExportDialog.tsx`:** M7, one expression and its import.
- **`app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx`: narrow amendment of the UC2 fader segment only** (l.574–594, from `const undoBefore = live(api).undoLabel;` to the `.toBe(0.9);` assertion). The replacement assertions:
  - the fader is focused, `change` to 0.9 (preview pending), then `pressU(fader)` → stems/sfx are **not** rendered (collapsed), the undo label is `Volume` (exactly one new entry), the stems volume is 0.9, and `document.activeElement` is `ჯგუფი 1`'s name button;
  - expand again. Focus the stems fader with nothing pending, then click the fold button → collapsed, the undo label is unchanged, and focus is on the group name button;
  - the detached-element `keyUp(fader)` at l.586 is deleted.

  The pointer-gesture and `isArrangementPreviewActive()` refusals above l.574 and the music-fader tail (l.595–599) stay byte-identical. A records the diff hunk in the report. Nothing else in this file changes.
- **`docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md`:** four lines only.
  - l.4 becomes exactly: `**სტატუსი:** Round 80 — C PASS (browserVerified), გამოქვეყნდა \`68383fa\` (D-29z45)`.
  - l.18 (the C2/C3 refusal row): the slider-focus clause is replaced by the X1 blur-then-collapse rule, with "(Round 81, D-29z46)".
  - l.52 (mermaid edge): `gesture / preview` only.
  - l.70: the final sentence is replaced by: `B-მ (D-29z46) ეს ფორმულირება C2-ის კონტრაქტად მიიღო.`
- **New tests (new files only):**
  - `app/lib/arrangement/__tests__/track-group-mix.test.ts` (unit: model, audibility, gains, graph with test doubles);
  - `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx` (workspace; copy the harness from `track-group-collapse-ui.test.tsx` without editing it).
- **New doc** `docs/implementation/2026/quarter-IV/071-studio-lab-track-groups-stage-3-mix.md`:
  - Georgian, LF, per `TEMPLATE.md`;
  - content: M1–M7, X1, the Ableton table (§4), the effective-gain rationale and the meter consequence, files, tests, mutations, the measured header widths;
  - status: awaiting C.
- **Escape clause:** every other file stays frozen. That includes `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementMaster.tsx`, `panels.ts`, `selection.ts`, `index.ts`, every other existing test (`schedule.test.ts`, `model.test.ts`, `groups.test.ts`, `track-groups-ui.test.tsx`, `track-group-collapse.test.ts`, `track-pan.test.tsx`, `track-meter.test.ts`, graph tests), and `package*.json`. If M1–M7 or X1 cannot be met inside these grants, **stop and report**. Examples:
  - a frozen test locks a value this contract changes;
  - the lane needs a new prop to show group state;
  - a fourth `isTrackAudible` caller appears.

### Required tests (behavioural)
Fixture: the `/studio-lab` tracks (video, music, stems, sfx). Clips: music `0–10`, stems `2–8`, sfx `4–6`. Groups: G1 = {stems, sfx}; nested G2 = {music, G1}. A records the actual values.

**Unit (`track-group-mix.test.ts`):**
- **GM1 normal form:**
  - `setTrackGroupMix(…, { volume: 1, mute: false, solo: false })` on a plain group → the same object, and the JSON has no `volume`/`mute`/`solo` keys;
  - volume 0.5 → stored; set back to 1 → the key is removed;
  - NaN or out-of-range values → clamped or ignored;
  - an unknown id → the same object.
- **GM2 gains:**
  - G1 volume 0.5, stems 1 → stems 0.5, sfx at its own volume × 0.5, music unchanged;
  - nested G2 0.5 × G1 0.5 → stems 0.25;
  - G1 volume 0 → stems 0 and sfx 0.
- **GM3 mute:**
  - G2 muted → music, stems and sfx are 0, video unchanged;
  - an inner volume change while G2 is muted is stored, but the gain stays 0;
  - unmute → the new inner value applies.
- **GM4 solo:**
  - G1 soloed → stems and sfx audible, music and video 0;
  - stems soloed → sfx, music and video 0;
  - G1 soloed and muted → all 0 (mute beats solo);
  - a soloed track inside muted G2 → 0;
  - no solo anywhere → as `isTrackAudible`.
- **GM5 half-solo state:**
  - `trackGroupSoloState`: G1 soloed → G1 `on`, G2 `mixed`;
  - stems soloed → G1 `mixed`, G2 `mixed`;
  - nothing soloed → `off`.
- **GM6 exclusive and additive:**
  - group plain click clears track and group solos;
  - Ctrl toggles one;
  - a plain click on the only soloed group clears it;
  - `toggleSolo` (track, plain) clears group solos;
  - a soloed track plus a soloed group, then a plain click on that track → the track stays soloed and the group solo is cleared (it is not "only soloed");
  - with no group solo, `toggleSolo` output is deep-equal to the `68383fa` behaviour.
- **GM7 cycles and ghosts:** the GN l.193 shape (cyclic and ghost parents) → a finite result, no throw.
- **GM8 graph:**
  - `applySchedule` with `trackGains` sets the initial track gains from the map; without it, the gains equal the old rule;
  - `renderArrangementWav` passes the effective gains (assert through the graph doubles or the existing source-text pattern, and keep `track-pan.test.tsx` green).
- **GM9 ungroup:** `ungroupSelectedRows` on a muted G1 → no groups remain, and the children's own fields are unchanged.

**UI (`track-group-mix-ui.test.tsx`):**
- **UM1 controls:**
  - M/S/Volume render on an expanded and on a collapsed G1, with the labels and test ids of M4, and add no text to the row (`rowOrder` still equals the stage-1 form);
  - the row stays 28 px;
  - the controls are not rendered when there is no group.
- **UM2 Mute:**
  - click → `aria-pressed=true`, the undo label is `Mute — ჯგუფი 1`, and `setTrackGain` (graph double, while playing) gets 0 for stems and sfx, with 0 new sources;
  - click again → restored;
  - Ctrl+Z → back.
- **UM3 Volume:**
  - pointer drag → one `Volume` entry;
  - ArrowDown then keyup → one entry;
  - a pending group preview and then a track fader press → two separate entries, never merged;
  - blur commits;
  - pointercancel reverts;
  - double-click → 100%.
- **UM4 Solo:**
  - plain click on G1 S → `Solo — ჯგუფი 1`, music muted in the gains, and G2 S is `mixed`;
  - a lane S click (plain) → G1 solo cleared;
  - Ctrl+click is additive.
- **UM5 nested R17-G3:** mute G2, change the stems volume with the keyboard (stored, gain 0), unmute G2 → the stems gain equals the new value × G1 × G2.
- **UM6 no restart:** while playing, Ctrl+G, group Mute, Solo, a Volume drag and Ctrl+Shift+G → `createBufferSource` count unchanged, and the position advances.
- **UM7 ungroup:** a muted G1 plus Ctrl+Shift+G → stems and sfx are audible (their gains are back), and Undo → muted G1 again.
- **UM8 export dialog:** G1 soloed → the video-sound line says not audible (the same text as with a track solo).
- **UM9 X1:**
  - nothing pending, stems fader focused, `U` → collapses, focus is on G1's name, the undo label is unchanged;
  - pending (`change`) then `U` → one `Volume` entry, value stored, collapsed;
  - G2 ⊃ G1: G1's group volume fader focused with a pending change, collapse G2 → one `Volume` entry, focus on G2's name;
  - pointer gesture active → still refused.
- **UM10 Space and keys:** Space on a focused group M/S behaves exactly as on a lane M/S (A records which). `m` and `u` typed while a group control is focused keep their workspace meaning (marker add / collapse) or are ignored as on lane controls (A records which and keeps parity).

**Mutation proofs** (A runs each one, records it, restores and `cmp`s):

| # | Mutation | Expected red |
|---|---|---|
| (a) | only the direct parent group counts (no ancestor walk) | GM2/GM3/UM5 |
| (b) | export path ignores the effective gains (old rule) | GM8 |
| (c) | mute does not beat solo | GM4 |
| (d) | the normaliser keeps `volume: 1` / `mute: false` | GM1 (and the GN test) |
| (e) | group mix included in `scheduleKey` (restart) | UM6 |
| (f) | exclusive track solo does not clear group solos | GM6/UM4 |
| (g) | half-solo never `mixed` | GM5/UM4 |
| (h) | X1 blur removed (old refusal) | UM9 |
| (i) | X1 focus captured after the blur | UM9 (focus assertion) |

**A's checks (speed rules):**
- `npm run typecheck` and `npm run lint`.
- `npx vitest run` on:
  - the two new files and the amended `track-group-collapse-ui.test.tsx`;
  - `groups.test.ts`, `track-groups-ui.test.tsx`, `track-group-collapse.test.ts`, `schedule.test.ts`, `model.test.ts`, `track-pan.test.tsx`, `track-meter.test.ts`;
  - every file found by `grep -rlE "applySchedule|renderArrangementWav|toggleSolo|toggleTrackSolo|toggleTrackMute|previewTrackVolume|commitTrackVolume|ArrangementExportDialog|ArrangementGroupHeader|StudioWorkspace|isTrackAudible" app --include=*.test.ts --include=*.test.tsx`, plus `render-budget*`, `master*`, `meter*`, `export*` and `lane*`.

  Record the list and the counts. All green.
- No full suite and no `npm run verify` (those belong to the gate).
- **The code-reviewer is required** (3+ files). Pass its Architecture note to B verbatim, as a signal.

## 2. Pre-flight for A
- Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, and the primitives `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `REACT_CONTEXT` (context members added), `AUDIO_ARCHITECTURE` (effective gain, no topology change), `DESIGN_TOKENS`, `TAILWIND_FIRST`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS` and `GEORGIAN_DOCS`, plus `prompts/studio-feature.md`.
- Confirm by grep that no test renders `ArrangementGroupHeader` standalone (outside the workspace provider), since it may now call `useArrangement()`.
- Confirm by grep that `isTrackAudible` has exactly the 3 production callers listed, and that no other production code reads `track.solo` / `track.mute` for arrangement audio.
- Verify the baseline: HEAD, 0 status lines, frozen 461/461, snapshots 11/11, protected 4/4, EOL. Record `pgrep -c node`.

## 3. File ownership (exact)
- **Writable:** the 11 owned existing files, within the limits in §1 Files, plus the two new test files and the new doc 071.
- **A's report:** `a-round-81.md` (plus `a-round-81/` scratch in the loop folder).
- **Read-only:** everything else, including `.claude/**`, the protected files, `package*.json` and every other existing test.
- **Expected end state:** `git status --short` shows at most 11 `M` lines plus 3 `??` lines. Only root commits.

## 4. Ableton source table
Sources (untrusted data; only their quoted text is used):
- `b-round-78/ableton-mixing-20261022.txt` (Live 12 manual chapter 18, https://www.ableton.com/en/live-manual/12/mixing/, Playwright capture 2026-10-22);
- `b-round-71/ableton-shortcuts-20261021.txt` (§42).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A group is a summing container with mixer controls | §18.3 l.90 "special kind of summing container called a Group Track"; l.92 "they have mixer controls" | **Confirmed (text)** | M3: implemented as an effective gain per child (acoustically equal without effects); M4 controls M/S/Volume. Group pan is not in scope (FB-12/SRW-17 name Mute/Solo/Volume) | GX-VOL, GX-MUTE |
| Mute = Track Activator off; Solo mutes all other tracks; Ctrl/Cmd adds | §18.1 l.42–43 | **Confirmed (text)** | M5: the same exclusive/additive shape for groups; the group mute button is labelled M, like the CZABA lanes | GX-SOLO |
| A group with a soloed track or nested group shows a half-coloured Solo | §18.3 l.112 "its Solo button will appear half colored" | **Confirmed (text)** | M4: `aria-pressed="mixed"` + `data-solo="mixed"`, two-tone tokens | GX-HALF |
| Soloing does not cut tracks that feed others | §18.6 l.169 "except in some cases where tracks are feeding other tracks" | Confirmed (text, general) | M2: a soloed child keeps its ancestor groups passing | GX-SOLO |
| Child meters when the group is muted or at 0 | — | **Unconfirmed** (not in the capture) | CZABA choice: a child meter shows the post-group level (M3) | GX-METER |
| Ungroup drops the group's mixer state | §18.3 l.100 "reverted back into individual tracks" | Partly (text says tracks return; mixer state is not stated) | M6: the group mix state is dropped; children keep theirs | GX-UNGROUP |
| Inner controls stay adjustable under a muted outer group | R17-G3 (user requirement) | n/a (CZABA requirement) | M2/M5 | GX-NESTED |
| Undo of mixer changes | — | Unconfirmed | CZABA: one entry per click or gesture, like track mixer controls | GX-UNDO |

C judges the **CZABA requirement** and the **Ableton match** separately.

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup (record the actual values):** as rounds 79–80, at both viewports:
- a fresh load with Snap off;
- **Middle East** on music at ≈0.35, the stem `ღამის პულსი · პულსი` on stems at ≈2 and **Soft impact** on sfx at ≈4;
- **video Mute on by a real click** (round-44 meter rule);
- then click the stems name, Shift+click sfx, Ctrl+G → `ჯგუფი 1` over {stems, sfx}.

Audio oracles follow the backlog rules:
- export comparisons by the round-26 rule;
- the meter time-to-floor by the round-27 rule;
- per-track meter truth through Solo against the post-master tap.

Window W_s = 2.4–3.9 s (stems only once music is muted); W_x = 4.2–5.0 s (stems + sfx).

| ID | Action | Pass evidence |
|---|---|---|
| GX-CONTROLS | Inspect G1 expanded and collapsed; measure the header | M, S and Volume are present in both states, each 24 px or more; the row is 28 px; labels and `data-testid` as in M4; the name button is ≥ 40 px at depth 1 (G1 inside G2 ⊃ {music, G1}; stage-1 `rowOrder` shows G1 at depth 1). The depth-2 width is A's recorded measurement in doc 071, not a C row. No text node besides the name. Screenshots at both viewports |
| GX-VOL (R17-G2) | Mute music (lane M). Export WAV with G1 Volume 100%, then 50% (keyboard: focus the fader, ArrowDown ×50, or a measured drag), then 0% | 50%: the W_s RMS ratio to the 100% export is 0.500 ± 0.005 (−6.02 dB ± 0.1). 0%: W_s and W_x ≤ 1 LSB. Live: with G1 at 0 while playing, the master meter falls to the floor within the round-27 oracle; then 100% → level returns. `createBufferSource` count unchanged during the changes |
| GX-MUTE | G1 M click while playing; export with G1 muted | Live: master floor by the round-27 oracle in W_s/W_x (music muted); `aria-pressed=true`; undo title `Mute — ჯგუფი 1`. Export W_s/W_x ≤ 1 LSB. Unmute → audible; Ctrl+Z → muted again |
| GX-NESTED (R17-G3) | G2 ⊃ {music, G1}. Unmute music. Mute G2 → play and export. While G2 is muted, set stems to 50% with the keyboard and set G1 Volume to 50%. Unmute G2, export again | G2 muted: the whole export ≤ 1 LSB (video muted). The inner controls changed (stems 50%, G1 50%; both history entries exist) while silent. After unmute, the W_s ratio with music muted (or from a solo-free comparison A documents) equals 0.25 ± 0.0025 vs. the all-100% export (−12.04 dB ± 0.1) |
| GX-SOLO | **For this row the video lane Mute is OFF** (real click; re-mute it afterwards for the meter rows). (1) G1 S plain click. (2) Click the music lane S plain. (3) Ctrl+click G1 S. (4) G1 soloed and G1 muted | (1) Music and video silent (master shows only stems/sfx; export W before 2 s ≤ 1 LSB); undo `Solo — ჯგუფი 1`. (2) G1 solo cleared, only music audible. (3) Additive: music and G1 both soloed. (4) Silent (mute beats solo) |
| GX-HALF | (1) Solo stems (lane S) inside G1 ⊂ G2. (2) Solo G1. (3) Clear | (1) G1 and G2 S `aria-pressed="mixed"`, `data-solo="mixed"`, a visibly two-tone style (screenshot); sfx and music silent. (2) G1 `on`, G2 `mixed`. (3) All `off` |
| GX-METER | G1 Volume 0 while playing (music muted) | The stems and sfx lane meters fall to the floor within the round-27 oracle (CZABA choice M3); back to 100% → the meters return. Record the values |
| GX-UNDO | One drag on the G1 fader; ArrowDown + keyup; double-click; group M; group S | Exactly one history entry each (`Volume`, `Volume`, `Volume`, `Mute — ჯგუფი 1`, `Solo — ჯგუფი 1`); Ctrl+Z/Ctrl+Y restore the exact values |
| GX-UNGROUP | Mute G1, Ctrl+Shift+G | Stems and sfx are audible again (live and export); Ctrl+Z → G1 is back and muted, silent again |
| GX-COLLAPSED | Collapse G1; use M, S and Volume on the collapsed header | Same effects as expanded; the overview stays; `U` still collapses and expands |
| GX-NO-RESTART | While playing: Ctrl+G, group M, S, a Volume drag, Ctrl+Shift+G | `createBufferSource` calls 0 during these; the position is monotonic (the round-79 TG-AUDIO method) |
| GX-EXPORT-DIALOG | **Video lane Mute OFF.** Open the export dialog (baseline text), close it, solo G1, open it again | Baseline: the video sound reads audible. With G1 soloed: it reads not audible, the same text as with a track solo (for example, music S plain) |
| X1-FOCUS (C80-1) | (1) G1 selected (Ctrl+click its name); focus the stems Volume fader by Tab (nothing pending); press `U`. (2) Focus the stems fader, `keyboard.down('ArrowDown')`, press `u`, `keyboard.up('ArrowDown')`. (3) G2 ⊃ G1: focus G1's group Volume fader, ArrowDown held, collapse G2 by its fold button click | (1) Collapses; no drag message; focus on G1's name; undo unchanged. (2) Collapses; exactly one new `Volume` entry with the changed stems value; nothing is lost. (3) One `Volume` entry for G1; G2 collapsed; focus on G2's name (the mouse click may own focus; record it). A pointer drag on a fader plus `U` (another key) → still refused |
| REG-FOLD | Quick stage-2 rows: FOLD-BUTTON, FOLD-U, FOLD-OVERVIEW, FOLD-SELECTION (1), FOCUS-HIDDEN | As round 80 |
| REG-TG | Ctrl+G, F2 rename, Ctrl+Shift+G, video refusal | As round 79 |
| REG-TRACK-MIX | Without any group: lane M, S (plain and Ctrl), Volume drag and keyboard, pan; export once | Labels, history and audio as before (spot check against round-25/31 expectations) |
| REG-HYD | The console during all parts | No hydration or `useLayoutEffect` warning and no non-noise error |
| G81-3 | The header link → `/studio-lab` with the demo badge; `/studio/<id>` anonymous → "Sign in required"; anonymous `/api/studio-token` → 401; the page network has no token/recording/download/R2 request and no Authorization header | As stated. The fake-Bearer 403 → BLOCKED (backend unavailable in cloud) |
| T81-TARGETED | Run A's targeted vitest list once (not the full suite) | Green; record the counts |
| SOURCE-UNCHANGED | A's end hashes at C start and end; frozen 461/461; protected 4/4; status per §3 | Equal |

- **Gate rows** (C marks them `gate`, never `passed`): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Neighbours that can break:**
  - track Mute/Solo/Volume and their history;
  - meters and the master Peak latch;
  - export levels and the overload warning;
  - the metronome (it is not affected by solo; it goes to the master);
  - collapse/fold and the stage-1 commands;
  - the round-79 TG-AUDIO zero-restart property.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutation (a), (c) or (e) on a scratch copy outside `store/`, or reason from A's recorded output. C never edits `store/`.

## 7. After this round
1. If B plans round 82 on or after **2026-10-24**, round 82 is the **REGRESSION round**: one short check per done or c_pass item at both viewports, plus `npm run test:e2e:smoke`. It includes the C-R80-O3 repro row below.
2. Otherwise, **round 82 = C-R80-O3 repro + decision**: a refused cross-lane drag (music onto stems with an overlap) commits the horizontal part of the drag (1.025 s instead of 1.35 s or 0.35 s; `c-round-80/probe-ghost.json`, a blocked ghost label was present). One discriminating row decides the severity:
   - if the refusal status is shown at release, it is a Low product question (keep the last free place, or snap back);
   - if it is silent, it is a Medium bug.
   The fix, if any, goes to the `ArrangementClip` owner in its own round.
3. Then SRW-18, SRW-19, SRW-20, the Lows batch (it includes GATE75 S1–S6, GATE79-S1/S4/S5, the GATE80 Lows and C-R79-O1), SRW-21, the full regression, T12, then VISUAL-A-OBSIDIAN.
- **Architecture checkpoint:** this is the first SRW-17 round that opens `ArrangementContext.tsx` (2948 lines). An addendum (question 9: the group volume pipeline beside the track pipeline, and the gate-80 `row-focus.ts` proposal) has been appended to the pending request `b-round-78-checkpoint-request.md`. SRW-17 reaches its feature boundary with this round. The request is non-blocking; any extraction root approves gets its own B task.
- **Tech Lead R81-T:** in a real Chrome with headphones: does the half-coloured Solo read clearly; does group Volume at 50% sound like −6 dB against a track at 50%; is a falling child meter under a muted group understandable?
