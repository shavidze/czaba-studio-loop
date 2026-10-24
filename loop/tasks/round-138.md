# CURRENT TASK — Round 138: VISUAL-A V-0.4a — clip gestures (move, trim, fade, lane move) in English

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 137)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Spec:** `docs/technical/studio-real-workspace/visual-direction-a.md` (M2, V-0). Module contract: `backlog.json` → VISUAL-A-OBSIDIAN `v0_plan_d29z92.module_contract`, with the R6 clarification of round 133:
  - `strings.ts` is a leaf module (it imports nothing), with one object per area;
  - it holds plain strings plus small pure formatters, and no type assertions;
  - formatters take values that are already formatted; a branch that only picks between two texts stays in the caller;
  - existing local names keep their names and get their values from the module.
- **Previous task:** `tasks/round-137.md` (exact copy of the round-137 `current-task.md`, sha256 `665c212d…`). Rationale: `b-round-137.md`. Decision record: **D-29z103** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: commit `7e6202bb22db0091ce90cd423b5a8ec8ed1992ef`** (gate 137 published on both remotes; HEAD). The tree was **clean** at planning (`git status --short` empty).
- **Frozen list:** `tmp/studio-real-loop/b-round-137-r138-tree-sha256.txt`, **931 entries**. That is `git ls-files -co --exclude-standard` (953) minus the 22 existing grants in `b-round-137-r138-grants.txt`. The grants file has 24 lines; the last 2 are new files. `sha256sum -c --quiet` was OK at planning, run from `store/`.
- **Start hashes of the 22 existing grants:** `b-round-137-r138-granted-start-sha256.txt`. **Start copies:** `b-round-137/r138-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there at planning). A checks both at the start. If a hash differs, A stops and reports.

## 0. Why this round (D-29z103)
- **Round 137: C PASS.** `browserVerified` = `realVerified` = true; every browser row ran at 1440 and 1280; GEO-COUNT 0 on the V-0.3d surface before any subtraction; bugs 0. Gate 137 published `7e6202b` (verify OK: 162 test files, typecheck clean, build OK; review 9/10). **V-0.3d is done, so V-0.3 is complete.**
- `tasks/round-137.md` §8 fixed this step: no strings-split checkpoint result exists (`b-round-136-checkpoint-request.md` is still unanswered), so **V-0.4 goes ahead on the same import path**, re-measured and split by surface. The regression round is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122). **No Critical, High or Medium finding is open.** `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist.
- **B's V-0.4 measurement at `7e6202b`** (non-comment Georgian lines): ArrangementClip 25, ArrangementLane 22, ArrangementDetailPanel 38, ArrangementClipEnvelope 10, ArrangementGroupHeader 10, library.ts 4, ArrangementContext 4 (l.547, 548, 1761, 3467), TrackMeter 2, Master 2, groups.ts 1, panels.ts 1, clip-gain-multi.ts 1, StudioWorkspace 1 (the R1 selector). About 120 source lines with several hundred pin lines, so **V-0.4 is split by surface; no item is dropped** (ruling R1 below).
- **This round = V-0.4a: every Georgian text of `ArrangementClip.tsx` (25 lines) + `ArrangementContext.tsx` l.1761** (`გადატანა (n)`, the keyboard group nudge). D-29z95 said all move/trim history labels move together, and this is the only Context line that belongs to that set. It also closes **GATE133-LANE-RELEASE-MIXED** (the lane-refusal status l.59/738 and l.586) and C round 137 note 1 (`Undo: გადატანა ხაზზე — სტემები` next to `Undo: Rename Group`).
- **Pins (measured; the phrase grep plus the title selectors):**
  - `grid-snap-ui`: l.113 (`MOVE_BLOCKED_STATUS` value line), 398, 434, 446, 474, 495, 528, 601, 660
  - `clip-fades-ui`: l.109, 111, 358, 364, 381, 442, 525, 569
  - `marker-snap`: l.115, 116, 117, 118, 119, 567
  - `grid-snap-edit`: l.109, 110, 112, 114, 214, 491, 539, 626, 673
  - `grid-snap-position`: l.216 · `fader-guards`: l.590 · `marker-edge-nav-ui`: l.213 · `marker-time-snap-ui`: l.248 · `markers-ui`: l.216 (all `[title^="drag = დროის მონიშვნა"]` selectors)
  - `gesture-reentry`: l.151, 203, 238, 273
  - `clip-envelope-ui`: l.629, 697, 698, 707, 763, 767
  - `track-layout`: l.254, 468, 493, 504
  - `grid-snap-clip-edges`: l.108, 109, 110, 112, 114, 210, 338, 405, 406, 456, 457, 492, 558, 588, 608, 636, 651, 652, 694, 695, 724, 725, 735, 748, 759, 772, 773, 842, 887, 904, 937, 938, 957, 958, 974
  - `video-fades-ui`: l.316, 318, 367, 371, 397, 405
  - `gesture-guard`: l.186, 204, 272, 295, 361, 438, 526, 547
  - `track-groups-ui`: l.309 · `track-group-collapse-ui`: l.310 (both `[title$="— გადაადგილება"]` selectors)
  - `strings.test`: the `CONTEXT_REMAINING_GEORGIAN_LINES` entry l.721 (ST13).
  - **`e2e/` has 0.**
- **UI pin gaps (no existing pin):** the clip range badge unit (l.920), the group move to the left (`მარცხნივ`, l.728), and the keyboard group nudge label (Context l.1761). They get tests in the new `clip-strings-ui.test.tsx`.
- **Not V-0.4a, do not touch (false matches or later stages):**
  - `status-announcement.test` l.60/62 and `status-announcement-ui` l.325 (`Fade In: … წმ`): these are free fixture strings passed straight to `reduceArrangementStatus` / `setStatus`; they do not check ArrangementClip output. They stay (ruling R4).
  - `delete-selection-ui` l.520 (`… წმ · ყველა ხაზი`) is the lane overlay `ArrangementLane.tsx:1001` (V-0.4b).
  - `clip-envelope-ui` Envelope point labels and statuses (`Envelope: წერტილის …`, l.117–119 and the others) are `ArrangementClipEnvelope.tsx` (V-0.4c).
  - `ArrangementVideoDock.tsx:964–965` `ვიდეოს გადატანა` is a dock control (V-0.5).
  - `detail-panel-polish` `საიდან, წმ` / `სადამდე, წმ` (DetailPanel, V-0.4e).
  - Georgian **fixture data** (track names `მუსიკა`, `სტემები`, `SFX`, …) is track data until the default-name stage; it stays inside the new English literals, e.g. `'Move to track — სტემები'`.

### Rulings D-29z103
- **R1 — V-0.4 split by surface, scope unchanged (tentative order, each re-measured before it is planned):** V-0.4a ArrangementClip + Context l.1761 (this round) → V-0.4b ArrangementLane (incl. the l.697 aria-label **together with** the StudioWorkspace track-header selector, turning the ST33 allowance into 0; the lane overlay `ყველა ხაზი`; drop ghost texts reuse the status English, GATE130-S1) → V-0.4c ArrangementClipEnvelope + ArrangementGroupHeader + ArrangementTrackMeter + ArrangementMaster → V-0.4d default track names (Context l.547/548) and `TRACK_GROUP_NAME_PREFIX` with the fixture sweep (GATE133-GROUP-PREFIX, ST22 allowance → 0) → V-0.4e ArrangementDetailPanel + panels.ts l.8 + clip-gain-multi.ts l.113 + library.ts. V-0.5 (library, dock, route, collection.ts, `lang="en"`, final RV-4, RV-1 re-capture) is unchanged.
- **R2 — one new object `studioClipStrings`** (the clip gesture area), appended after `studioWorkspaceStrings`. The no-change sentence is **one** formatter, `studioClipStrings.historyUnchanged(label)`. **Forward constraint for V-0.4c:** `ArrangementClipEnvelope.tsx` l.25 must become `studioClipStrings.historyUnchanged('Envelope')`, not a second copy.
- **R3 — branches stay in the caller.** The group-move direction picks between `groupMovedRight` and `groupMovedLeft`; the folded clip header title stays `` `${moveTitle}\n${CLIP_FOLDED_TITLE_LINE}` `` in the caller; the trim kind picks `trimStartLabel` / `trimEndLabel`.
- **R4 — reducer/setStatus fixture strings are not pins** (see §0). The final V-0.5 RV-4 scan decides whether test fixtures are swept; this round does not touch them.
- **R5 — accepted mixed state for one round, named:** the clip badge says `2.000 s` while the lane overlay still says `… წმ · ყველა ხაზი` (V-0.4b); Envelope statuses and point titles (V-0.4c); group header, meter and Master titles (V-0.4c); detail panel (V-0.4e); default track names in sentences (V-0.4d); library and dock (V-0.5).
- **R6 — a title text and its selectors change in the same round** (the l.325 lesson). Every `[title^=…]`, `[title=…]` and `[title$=…]` selector listed in §0 is a pin and changes with its title.
- **Folded in (owned, low cost):** gate-137 reviewer findings **3** (ST33's title and doc 113 point at "l.325"; the selector is at l.331) and **4** (doc 113 status still "In Progress"). Finding 1 (`selectedClipDetail`) needs StudioWorkspace, which this round does not own → `deferred_low_polish`, to be folded in when StudioWorkspace is next granted (V-0.4b). Finding 2 (the strings test imports StudioWorkspace) → addendum to the strings-split checkpoint request.

## 1. What changes (user-visible)
**Text only.** None of these change: any handler, condition, threshold, snap rule, key binding (Shift time-lock, Alt snap bypass, arrows), the order of the status calls, the commit/no-commit decisions, any `data-testid`, any class name, the fade handle positions, the clip header glyphs (`▶`, `⠿`), or the time formats (`00:00.000`, `toFixed(3)`).

### 1.1 The English map (exact text; A may not reword it. If a line seems wrong, A reports it and B rules)
All keys go into the new `studioClipStrings`. `{…}` are already formatted values passed by the caller.

| ID | Source line(s) in `ArrangementClip.tsx` | Key | Exact English |
|---|---|---|---|
| CL1 | l.42 `CLIP_FOLDED_TITLE_LINE` | `foldedTitleLine` | `The track is folded — unfold it to make a time selection` |
| CL2 | l.56 (`VIDEO_FADE_HANDLE_TITLES.in`) | `videoFadeInTitle` | `Video Fade In — picture only, the sound does not change · drag · double-click = 0` |
| CL3 | l.57 (`.out`) | `videoFadeOutTitle` | `Video Fade Out — picture only, the sound does not change · drag · double-click = 0` |
| CL4 | l.59 `CLIP_LANE_REFUSAL_KEPT_PLACE` | `keptLastFreeSpot` | `the clip stayed in its last free spot` (lower case; the caller keeps `` `${refusal} — ${KEPT}: ${laneName}, start ${time}.` ``) |
| CL5 | l.456 (fade preview while dragging) | `fadePreview(label: string, seconds: string)` | `{label}: {seconds} s` (no period) |
| CL6 | l.671 and l.765 (fade committed / reset) | `fadeCommitted(label: string, seconds: string)` | `{label}: {seconds} s.` (l.765 passes `'0.000'`) |
| CL7 | l.586 | `moveBlocked` | `Move blocked — a neighbouring clip or the start of the timeline. The clip stayed in its last free spot.` |
| CL8 | l.619 | `trimStartBlocked` | `Trim stopped: the start of the source, a neighbouring clip or the minimum length (0.05 s).` |
| CL9 | l.620 | `trimEndBlocked` | `Trim stopped: the end of the source, a neighbouring clip or the minimum length (0.05 s).` |
| CL10 | l.667, l.703, l.721 | `historyUnchanged(label: string)` | `{label}: nothing changed — the Undo history is unchanged.` |
| CL11 | l.700, l.713 **and Context l.1761** | `historyMoveClips(count: number)` | `Move ({count})` |
| CL12 | l.701 | `historyMoveToTrack(name: string)` | `Move to track — {name}` |
| CL13 | l.715 | `historyMoveClip` | `Move clip` |
| CL14 | l.717 and l.947 (title) | `trimStartLabel` | `Trim — left edge` |
| CL15 | l.718 and l.952 (title) | `trimEndLabel` | `Trim — right edge` |
| CL16 | l.728 (right) | `groupMovedRight({ label, count, distance })` | `{label}: {count} clips moved {distance} to the right.` |
| CL17 | l.728 (left) | `groupMovedLeft({ label, count, distance })` | `{label}: {count} clips moved {distance} to the left.` |
| CL18 | l.830 | `moveTitle(title: string)` | `{title} — drag to move` (folded: the caller appends `\n` + CL1) |
| CL19 | l.843 | `rangeBodyTitle` | `drag = time selection · click = playhead` |
| CL20 | l.920 | `seconds(value: string)` | `{value} s` (badge text becomes `00:03.000 – 00:05.000 · 2.000 s`) |

**Exact rendered text that pins and C rows must match (examples):**
- Move commit: `Move clip: start 00:08.400, length 00:02.000, source offset 00:00.000.` · Undo button title `Undo: Move clip`.
- Lane move: `Move to track — სტემები: start 00:08.400.` · `Undo: Move to track — სტემები`.
- Group move: `Move (2): 2 clips moved 00:06.400 to the right.` · `Undo: Move (2)`.
- Lane refusal: `No room here — the clip stayed in its last free spot: მუსიკა, start 00:01.375.`
- Trim commit: `Trim — right edge: start 00:07.000, length 00:03.400, source offset 00:00.000.`
- No change: `Move clip: nothing changed — the Undo history is unchanged.` and `Fade In: nothing changed — the Undo history is unchanged.`
- Fade: preview `Fade In: 1.000 s`, commit `Fade In: 1.000 s.`, reset `Fade In: 0.000 s.`; video: `Video Fade Out: 2.000 s.`
- Local constant names stay (`CLIP_FOLDED_TITLE_LINE`, `VIDEO_FADE_HANDLE_TITLES`, `CLIP_LANE_REFUSAL_KEPT_PLACE`, `CLIP_FADE_LABELS`, …) and take their values from the module. `CLIP_FADE_LABELS`, `VIDEO_FADE_LABELS` and `CLIP_FADE_HANDLE_TITLES` are already English and stay byte-identical.

**Glossary additions (d29z103):**
| Georgian | English | Source |
|---|---|---|
| `გადატანა` (history) | Move | CZABA label (Live §6.7 "Moving and Resizing Clips") |
| `კლიპის გადატანა` | Move clip | as `Nudge clip`, `Delete clip` |
| `გადატანა ხაზზე — {track}` | Move to track — {track} | CZABA label |
| `მარცხენა / მარჯვენა კიდე` | left / right edge | Live §6.7 "a clip’s left or right edge" |
| `Trim შეჩერდა` | Trim stopped | CZABA label |
| `ცვლილება არ მოხდა — ისტორია არ შეიცვალა` | nothing changed — the Undo history is unchanged | CZABA label |
| `ბოლო თავისუფალი ადგილი` | last free spot | reuses d29z95 `nearest free spot` shape |
| `ხაზი დაკეცილია — … გაშალე` | The track is folded — unfold it … | Live §6.9 "unfold its track" |
| `სურათი (ხმა არ იცვლება)` | picture only, the sound does not change | d29z102 phrase shape; picture-only per D-29z49 |
| `გადაადგილება` (title) | drag to move | CZABA label |
| `წმ` | s | glossary (unchanged rule) |

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/lib/arrangement/strings.ts` | Append the new object `studioClipStrings` (CL1–CL20) after `studioWorkspaceStrings`. Formatters with 3+ params take a named object (a local, not exported, interface is fine). Existing objects, keys and values byte-identical. No import. |
| `app/components/arrangement/ArrangementClip.tsx` | The strings import, plus exactly the §1.1 lines (l.42, 56, 57, 59, 456, 586, 619, 620, 667, 671, 700, 701, 703, 713, 715, 717, 718, 721, 728, 765, 830, 843, 920, 947, 952). Biome-style wraps allowed. |
| `app/contexts/ArrangementContext.tsx` | Add `studioClipStrings` to the existing strings import (l.148–156) and change **l.1761 only** to `studioClipStrings.historyMoveClips(ids.length)`. Nothing else. |
| `app/lib/arrangement/__tests__/strings.test.ts` | The import specifiers. Delete the `applyEdit(moved, …)` entry from `CONTEXT_REMAINING_GEORGIAN_LINES` (l.721; ST13 then expects 3 lines). Retitle ST33 to `ST33: the new texts, waveform-zoom.ts and StudioWorkspace (except the track-header selector) have no Georgian and no «»` (gate-137 finding 3; body unchanged). New `describe('V-0.4a clip strings')` with ST34–ST35 (§3.1). |
| The 17 pin files of §0 | Exactly the listed lines. No other line, no new `it`, `it` counts unchanged. |
| `docs/implementation/2026/quarter-IV/113-studio-v0-workspace-strings.md` | l.4 → `Completed (A-ის შემოწმებები მწვანეა რაუნდ 137-ში; C round 137 — PASS, browserVerified; gate 137 — 7e6202b)`; l.70 last sentence → C round 137 PASS; delete the C-round TODO line l.74; in l.21 and l.75 replace `l.325` with `track-header selector (l.331)` (gate-137 findings 3 and 4). |
| **new** `app/lib/arrangement/__tests__/clip-strings-ui.test.tsx` | CSU1–CSU3 (§3.3) |
| **new** `docs/implementation/2026/quarter-IV/114-studio-v0-clip-strings.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections; status says C round 138 is still to come. |

- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Pin rule:** each replaced pin is a **hand-written English literal** with the same matcher (`toBe` stays `toBe`, selector stays the same operator `^=` / `=` / `$=`). No pin imports the module value it checks. Fixture track names stay.
- **Stop rule:** if the pre-edit grep finds a Georgian V-0.4a text (§1.1) in a file that is not granted, or a pin line differs from §0, A stops and reports. A does not widen scope.

## 3. A — tests and mutations
### 3.1 `strings.test.ts` (33 → 35 `it`s)
- **ST34:** the exact key set of `studioClipStrings`; every plain string equals its §1.1 literal; every formatter returns the exact English for Latin samples (CL5/CL6 with `'Fade In'`, `'1.000'`; CL10 with `'Move clip'` and `'Envelope'`; CL11 with 2 and 3; CL12 with `'stems'`; CL16/CL17 with `{ label: 'Move (2)', count: 2, distance: '00:01.000' }`; CL18 with `'Song'`; CL20 with `'2.000'`).
- **ST35 (per-file scans):** `studioClipStrings` values and all sample outputs contain no Georgian and no `«»`; `ArrangementClip.tsx` (comments stripped) has **no** Georgian line and no `«»`; ST13 (existing) now pins exactly the 3 remaining Context lines.

### 3.2 Pin replacements
The pin lines are listed in §0. Each gets the exact §1.1 text with the fixture names unchanged (examples in §1.1). Selectors become `[title^="drag = time selection"]`, `[title="drag = time selection · click = playhead"]`, `[title="Trim — left edge"]`, `[title$="— drag to move"]`.

### 3.3 New `clip-strings-ui.test.tsx` (real `StudioWorkspace` in jsdom; copy the mount and pointer harness of `grid-snap-clip-edges.test.tsx` / `workspace-strings-ui.test.tsx`, do not import them)
- **CSU1:** pointer drag on a clip body from 3 s to 5 s: the range badge text is exactly `00:03.000 – 00:05.000 · 2.000 s` and the body `title` is `drag = time selection · click = playhead`.
- **CSU2:** select two clips, drag the group **left** by a known amount: status `Move (2): 2 clips moved {distance} to the left.` with the exact distance, and Undo label `Move (2)`.
- **CSU3:** select two clips and press ArrowRight (keyboard nudge, Context l.1761): `undoLabel` is `Move (2)` and both clips moved by the nudge step.

### 3.4 Forward rule (GATE130-S3)
Every CL key has at least one hand-written UI literal in a pin file or in CSU1–3. A lists the key → test mapping in its report.

### 3.5 Mutations (each turns the named tests red; restore and check by sha256)
| ID | Mutation | Must turn red |
|---|---|---|
| m53 | CL13 → `Move clips` | ST34, `gesture-guard`, `grid-snap-ui` |
| m54 | the l.728 direction ternary branches swapped | CSU2, `grid-snap-clip-edges` l.457 |
| m55 | CL10 trailing `.` removed | ST34, `clip-fades-ui` (l.430 user), `marker-snap` l.567, `grid-snap-clip-edges` l.748 |
| m56 | CL19 `time selection` → `selection` | ST34, CSU1, `track-layout` l.468 and the `^=` selector tests (they no longer find the body) |
| m57 | CL20 unit `s` → `sec` | ST34, CSU1 |
| m58 | Context l.1761 back to an inline `` `Move ${ids.length}` `` | CSU3 |
| m59 | a Georgian letter added inline to l.830 | ST35 |
| m60 | l.947 and l.952 titles swapped | `gesture-reentry` l.151, `grid-snap-edit` trims, `track-layout` l.493 |

## 4. A — checks (speed rules)
- At the start: the frozen list, the 22 start hashes and the start copies all OK. `git status --short` is empty.
- The pre-edit grep for every §1.1 Georgian text in `app/**` and `e2e/**`, saved to `a-round-138/pre-grep.txt`.
- `npm run typecheck` and `npm run lint` exit 0. Read-only `npx biome check` on the changed code and test files gives 0 diagnostics.
- `npx vitest run` on the named list: `strings` and the 17 pin files plus `clip-strings-ui`. Neighbours: `status-announcement`, `status-announcement-ui`, `delete-selection-ui`, `workspace-strings-ui`, `grid-musical-ui`, `track-volume-db`. Save to `a-round-138/vitest.json`.
- Mutations m53–m60 per §3.5.
- The code-reviewer (more than 3 files change). Its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build and e2e (the gate does these).
- At the end: `git status --short` shows the 22 ` M` + 2 `??` granted paths and nothing else (if a pin file needed no change, say so). The frozen list is OK. The protected `git diff 7e6202b` is empty. Write the end sha256 of the changed paths to `a-round-138/end-sha256.txt`. A does no commit, stash, checkout, install, `--write` or `check:fix`.

## 5. C — rows
Real Playwright Chromium at **1440×900 and 1280×720** on `http://127.0.0.1:5173/studio-lab`, fresh context per session. Use test ids and the new English titles, not Georgian ones. State the Snap state at the start of each session (default off). Undo text is read from the Undo button `title` (`Undo: {label}`).

| Row | Start state → action → expected |
|---|---|
| T138-TARGETED | Run A's named vitest list; the counts equal A's |
| SOURCE-SCOPE | Only granted paths changed; frozen list OK at start and end; end hashes equal `a-round-138/end-sha256.txt`; protected diff against `7e6202b` empty; no source change during C's phase |
| AN-REVIEW | `diff -u` against `b-round-137/r138-granted-start/`: only the §1.1 lines and imports change; Context changes only the import and l.1761; no handler, condition, threshold or class changes; pins hand-written English with the same matchers and selector operators; strings.test changes are only the import, the l.721 deletion, the ST33 retitle and ST34–35; doc 113 only l.4/21/70/74/75 |
| CLIP-MOVE | Drag a clip header on music by about +1 s and release: status `Move clip: start …, length …, source offset ….` with the real values; Undo title `Undo: Move clip`; one Ctrl+Z restores the start |
| MOVE-BLOCKED | Drag a clip into its neighbour on the same track and hold: status CL7 exactly; release: the clip is at its last free spot (not overlapping) |
| TRIM | Hover the left edge (`title` `Trim — left edge`), drag it right and release: status `Trim — left edge: start …, length …, source offset ….`; Undo `Undo: Trim — left edge`. Drag the right edge past the source end and hold: status CL9; the clip length stops at the source end |
| LANE-MOVE | Drag a clip from music onto stems (free place): status `Move to track — სტემები: start ….`; Undo `Undo: Move to track — სტემები`. Drag onto an occupied stems spot: status `No room here — the clip stayed in its last free spot: {track}, start ….` and the clip is where the status says |
| GROUP-MOVE | Select two clips (Ctrl/Cmd+click), drag right: `Move (2): 2 clips moved {d} to the right.` with `{d}` equal to the measured start change; Undo `Undo: Move (2)`. Drag left: `… to the left.`. ArrowRight with both selected: Undo `Undo: Move (2)` and both starts move by the nudge step |
| NO-CHANGE | Drag a clip and bring it back to the exact start before release (or Shift-lock with no track change): status `Move clip: nothing changed — the Undo history is unchanged.`; the Undo title is unchanged |
| FADES | Audio clip: drag the fade-in handle: while held `Fade In: x.xxx s`; release `Fade In: x.xxx s.`; double-click the handle: `Fade In: 0.000 s.`. **Real audio:** with a 1 s fade-in, the output-tap RMS over the first 200 ms of the clip is at least 6 dB below the same window without the fade (paired comparison, same position). Use a clip with audible signal at its start (not `Slow rise`) and record the unfaded 200 ms RMS too, so the comparison is against a real level, not the noise floor; a near-silent baseline is an invalid run, not a PASS. Video clip fade handle `title` equals CL2/CL3 |
| FOLDED-TITLE | Fold a group (Ctrl+G on two adjacent tracks, then U or the fold button): the clip **header** element (the `⠿`/`▶` row, not the clip root) has `title` `{title} — drag to move` + newline + CL1; the clip root `title` is `{title}` + newline + CL1; unfold: the header `title` is `{title} — drag to move` |
| RANGE-BADGE | Drag on a clip body from 3 s to 5 s: the badge text is `00:03.000 – 00:05.000 · 2.000 s`; the body `title` is CL19 |
| GEO-COUNT | At every step above count Georgian in the clip surface (header title, body title, edge and fade handle titles, badge), the status line and the Undo/Redo titles. Expect **0** after the named subtractions (R5): track names in sentences, Envelope texts, lane overlay, group header, meter/Master, detail panel, library and dock. List every subtraction |
| LAYOUT | S0/S1/S2 (round-130 harness) against round 137: any change >1 px is only a text-width change of a granted element (the badge) |
| REG-137 | One sample: the one-track range readout equals the round-137 line exactly |
| G138-3 (alone, last) | `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", no workspace, 0 `audio[src]`. `GET /api/studio-token?…` → 401. The fake-Bearer 403 check is BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors, 0 pageerror (the known cart noise is expected) |

Gate rows (C does not claim them): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

## 6. Ableton source
Live 12 Reference Manual, Arrangement View, B's saved capture `b-round-133/live/arrangement-view.txt` (sha256 `2b9a3007b254689e…`, re-read 2026-10-24 for this task). Only text changes this round.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Move and resize clips by their edges | §6.7 Moving and Resizing Clips | "Dragging a clip’s left or right edge changes the clip’s length." | Wording `Trim — left/right edge`; the label "Trim" is CZABA's. Undo label names are CZABA labels (Live's Undo menu wording is **unconfirmed**) | TRIM, CLIP-MOVE |
| Fade handles | §6.8 Audio Clip Fades and Crossfades | fade handles at the clip edges, shown on hover | Double-click = 0 is a CZABA rule (Live: select + Delete). Picture-only video fades are CZABA (D-29z49) | FADES |
| Folded track hides time editing | §6.9 Selecting Clips and Time | "To access the time within a clip for editing, unfold its track" | Same idea; CZABA folds groups | FOLDED-TITLE |
| Cross-track move, lane refusal, no-change status | none found | **unconfirmed** | CZABA rules; no Live claim | LANE-MOVE, NO-CHANGE |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- C writes `c-round-138.md` and `c-round-138.json` as it goes (`taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` with subtractions, `measurements`, `invalidRuns`, `notesForB`). Evidence under `c-round-138/{tools,out,shots}/`. No `store/` writes.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.
- A writes `a-round-138.md` as it goes: start checks, pre-grep, changed files, `it` counts before and after, test results, mutations, the reviewer verdict and its Architecture note, shell writes, end state, deviations and known gaps.

## 8. Outcome, fixed in advance (B at round 139 planning)
| Condition | Round 139 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below |
| C FAIL with Critical / High / Medium | A bounded V-0.4a fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.4a → `c_pass`, then `c_pass_published` after the gate. Round 139 = **V-0.4b** (ArrangementLane + the StudioWorkspace track-header selector, ST33 allowance → 0, plus gate-137 finding 1 `selectedClipDetail`), re-measured first. If root's strings-split checkpoint result arrives first, B applies it as its own bounded round before V-0.4b |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Neighbour risk and root notes
- **Selectors:** 8 test files find the clip body or handles by `title`. A title change without its selector would make those tests fail to find elements, not test the wrong thing; m56 proves it.
- **Status de-duplication:** the fade preview is set on every pointermove with a changing value; the texts only change wording, so the claimed-gesture span logic (`status-announcement-ui` SU5) is unaffected.
- **Undo labels:** `commitArrangement(…, label, …)` stores the label in history; Undo/Redo show it. Old-session history is not persisted, so no stored Georgian label survives a reload.
- **Width:** the badge (`· 2.000 s`) is shorter; header titles are tooltips only. LAYOUT checks it.
- **Architecture:** the strings-split checkpoint request (`b-round-136-checkpoint-request.md`, with the round-137 addendum) is still open and non-blocking.
- **Commit readiness:** after C PASS, root may publish V-0.4a as an interim unit.
