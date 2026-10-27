# CURRENT TASK — Round 211: PERF-FADER-b, fast pointer drags for Clip Gain, single clip and members (SABA-B-5 part 2)

Decisions: **D-29z188** (round 210 accepted, closures), **D-29z189** (stage-b scope and design, WG4 ruling), **D-29z190** (harness members scenario, budget flips), **D-29z191** (doc fixes C-R210-01 + GATE210-S1), **D-29z192** (gate-210 suggestions S2–S5), **D-29z193** (no zustand in this stage). Planned by B on 2026-10-27. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md` (L10, L11, L12, L23, L26, L28 apply).
- `tasks/round-209.md` §1 (the PERF-FADER-a design you now extend: pointer path vs pending path, `withMixOverride`, exact-value commit, cancel, store + leaf, visuals unchanged) and `tasks/round-210.md` §1 (D-29z184 WINDOW threshold, D-29z187 red-proof method). They apply to Clip Gain unless this file says otherwise.
- `a-round-210.md` (red-proof recipe, mutants), `c-round-210.md` (probe method), `gates/round-210/review.md` (S1–S5).
- Code: `docs/implementation/2026/quarter-IV/165-fader-pointer-preview.md`, `app/lib/arrangement/mix-draft-store.ts`, `app/components/arrangement/ArrangementMixFader.tsx`.
- Project: `.claude/prompts/studio-feature.md`, `.claude/prompts/new-component.md`, primitives `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`.

## Baseline
- **Commit:** `180dd2e` (gate 210 **published** to both remotes; tree clean).
- **Frozen:** the 1,041 files in `b-round-210-r211-tree-sha256.txt` (every tracked file except the 14 grants). From the store root: `sha256sum -c --quiet <loop>/b-round-210-r211-tree-sha256.txt` (B checked: rc 0).
- **Grants:** `b-round-210-r211-grants.txt` (14). Start hashes: `b-round-210-r211-granted-start-sha256.txt`. Start copies: `b-round-210/r211-granted-start/`.
- **New files:** `b-round-210-r211-new-files.txt` (4):
  - `app/components/arrangement/ArrangementDetailClipGain.tsx`
  - `app/components/arrangement/ArrangementPeakPath.tsx`
  - `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx`
  - `docs/implementation/2026/quarter-IV/166-clip-gain-pointer-preview.md` (166 is free; 165 is the last doc)

  The test file and doc 166 are mandatory. A may leave out one of the two new components if the same budget is met with that code inside a granted file.
- **Protected and frozen as always:** auth and purchase files, `app/components/studio/**`, `app/styles/**`, `.claude/**`, `CLAUDE.md`, `package.json`, `biome.json`, `tsconfig*.json`, `playwright*.config.ts`, `app/routes/**`.
- **Frozen this round in particular:**
  - `StudioWorkspace.tsx`, `app/hooks/useRelativeFaderDrag.ts`, `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`;
  - every test file outside the 4 granted clip-gain/waveform tests and `mix-draft-store.test.ts`. That includes `fader-pointer-preview`, `gesture-guard`, `fader-guards`, `pending-status`, `context-hygiene`, `fader-click`, `group-volume-db`, `clip-gain.test.tsx`, `content-colour-ui`, `detail-panel-*`, `affordance-colour-ui` and `fader-style-ui`;
  - the output of `buildPeakShape` (WG1/WG2 pin it).

## 0. Why this round
- **SABA-B-5 (Medium, Saba 2026-10-27): "the Studio is very slow, for example dragging a fader."** Part 1 (track, group and master Volume, and Pan) is done: round 210, C PASS, published `180dd2e`. Clip Gain is now the slowest fader.
- **Fresh measurement.** Source: A's round-210 perf runs on the current code (`a-round-210/run1.json`); clip gain was not touched in that round. Clip Gain drag, single added clip:

  | metric | stopped | playing |
  |---|---|---|
  | `move-components-max` | **95** | **95** |
  | `move-components-per-move` | **89.8** | **73.5** |
  | `release-commits` | 1 | 1 |
  | restarts | — | 0 |
  | move-to-paint p95, 1× | **26.5 ms** | **61.2 ms** |
  | move-to-paint p95, 6× | 58 ms | 75 ms |

  There are 220 window commits for 120 moves: each move commits twice. The first commit is the model update; the second is the `clipGainText` sync effect at `ArrangementDetailPanel.tsx` l.318–320.
- **Cause (code fact):** `previewClipGainFader` (`ArrangementContext.tsx` l.2963) and `previewClipGainMembers` (l.3009) call `updateHistory` + `syncPlayback` on every move. So the whole context value changes, and every consumer re-renders.
- **Bug gate:** no Critical or High is open. SABA-B-5 is the Medium in progress.
- **Reference first:** not applicable, because this is a performance round. The behaviour stays as it is today; the waveform still follows the drag (D-29z189 item 6). INVARIANTS-211 checks this against the baseline build.

## 1. Rulings
**D-29z189 — scope and design (required, not a hint).**
1. **Scope:** the Clip Gain fader in the detail panel, for a single clip **and** for members (multi-select). The number field, the Enter/blur/Escape typed commit, the reset button and the double-click reset stay on the **pending path, unchanged**.
2. **Two paths**, as in PERF-FADER-a. Owner predicate: `clipGainGestureRef.current?.memberKey === memberKey`, where `memberKey` is the `clipId` for a single clip and `clipGainMemberKey(clipIds)` for members (a one-member key equals the clip id).
   - **Pointer path (new).** Per move:
     - Compute the targets exactly as today. Single clip: through `setClipGainDb`. Members: `clipGainShiftTargets(baseline, span.clipIds, anchorDb − span.maxDb)`, where the baseline is the committed arrangement at pointerdown (`present`). Do **not** set `clipGainBeforeRef` on this path; `beginClipGainGesture` already flushes pending edits.
     - Store the targets in the override.
     - Write the live graph with `handle.setClipGain(clipId, 10 ** (dB / 20))` for **the affected clips only**. The value must be exactly that expression: WG8 compares with `toBe`.
     - Set the draft-store entries.
     - Make **no** call to `updateHistory`, `syncPlayback` or `setStatus`.
     - **Trap 1:** the early returns at l.2977 and l.3032 (`next === current.present`) must not apply on this path. Always write the normalized target to the override and the draft, as the volume path does at l.2437–2449. Otherwise dragging back to the stored value (MG5 l.450) leaves the previous move's draft on screen.
   - **Pending path:** fader ArrowUp/Down, native `onChange` with no pointer gesture, double-click reset and the typed field. Byte-for-byte as today, labels and statuses included.
3. **Override.** Hold the per-clip dB targets either as a new `MixOverride` kind or in a dedicated `clipGainOverrideRef` (memberKey, ids, a Map of gains); A chooses. Either way:
   - **One owner at a time.** `claimPointerGesture` has a single slot, so a clip-gain override never coexists with a volume override.
   - **Same helpers as the pending path.** The overridden arrangement is built with `setClipGainDb` / `applyClipGainTargets`, which normalize and drop `gainDb` at 0. So the committed arrangement is identical to the pending result for the same targets, and the reset button's `clipGainDb === undefined` check (l.862) keeps working.
   - **Unmount cleanup** clears the override and **every** draft key it set.
4. **Restarts use the dragged value.** Two places ignore the override today:
   - `startGraph` passes `clipGains: clipLinearGains(arrangement)` (l.951);
   - the `syncPlayback` setter loop writes `handle.setClipGain(clip.id, clipLinearGain(clip))` from `arrangement.clips` (l.1142–1144).

   Both must read the **overridden** arrangement, so that Space mid-drag and a loop wrap (`resyncLoopRef`) keep the dragged clip gain.
5. **Export mid-drag** reads `historyRef.current.present` (l.3206), so it renders the committed value. That is the same as volume after PERF-FADER-a, and it is accepted; doc 166 says so.
6. **WG4 ruling: the waveform keeps following the drag.** Today the lane waveform and the detail waveform redraw with the dragged gain before release (`clip-gain-waveform.test.tsx` WG4). That stays: it is the user-visible feedback, and dropping it would be a behaviour regression in a performance round. The redraw is done by **one shared path leaf** (new `ArrangementPeakPath.tsx`):
   - **What it is.** A component that renders the waveform `<svg>` and its `<path>` and nothing else. It subscribes to its clip's draft with `useSyncExternalStore` and builds the shape from the draft dB when there is one, otherwise from the stored gain.
   - **Lane use.** `ArrangementClip.tsx` places it directly in the body div, with the same `clipWaveformScale` arithmetic using the draft gain, so the zoom factor still multiplies.
   - **Detail use.** `ArrangementDetailWaveform` places it **inside** that component, with 480 columns. It does not wrap the component: `ArrangementDetailPlayhead` (l.250) and the range overlay stay siblings outside the leaf.
   - **No re-renders above it.** `ArrangementClipView` (memo, l.979) and `ArrangementDetailWaveform` must not re-render per move.
   - **`buildPeakShape` stays as it is.** Its export, signature and output are unchanged, so WG1/WG2 stay green unedited. A may add a memoised column-max helper next to it, if the output stays byte-identical.
   - **No shortcuts.** No ref-only `d` writes and no rAF coalescing: the per-move counts must stay deterministic across 1× and 6×.
   - **DOM that must stay** (tests depend on it):
     - `<svg viewBox="0 0 N 2">` whose first child is `<path d>`, with the lane `data-testid` on the svg (`clip-gain-waveform` l.256–264; `waveform-zoom` l.315, 320, 542, 549);
     - the svg's parent is the clip body div (`content-colour-ui` l.222–227);
     - the detail box className and the column `data-testid` (`detail-panel-polish` l.358, 373, 376; `content-colour-ui` l.322);
     - the video placeholder and its reason stay siblings (`detail-panel-reason` l.277–317).
7. **Detail Clip Gain block = one leaf.** One component renders **every draft-dependent DOM node** of the block. It goes in the new `ArrangementDetailClipGain.tsx`, or as the same code inside `ArrangementDetailPanel.tsx`. The nodes are:
   - the number field's displayed value, its `title`, `aria-describedby`, `data-pending` and warning border;
   - the mixed range `<span>`;
   - the fader's `value`, `aria-valuetext` and fill style;
   - the reset button's `disabled` and `title`. Today they read the model (`clipGainDb === undefined` for a single clip; the span min/max for members), so on the baseline they change mid-drag once the gain leaves 0. They must keep doing so: compute them from the draft while one exists. This is plain DOM in the same column, so the count does not change. INVARIANTS-211 and CP10 check it.

   **While a draft exists:**
   - the number field shows the draft, formatted like `clipGainInputText`;
   - the range text is computed from the drafted member min/max;
   - the pending marker and `border-warning` never appear;
   - no `useEffect` or `useLayoutEffect` sets state per move (that is today's second commit).

   **When no draft exists,** it shows exactly what it shows today.

   **Rules:**
   - **Plain DOM only.** The leaf renders no nested function component (no `ArrangementMixFader` inside it), so it counts as 1.
   - **State stays in the parent.** The typed-text state, the sync effect (l.318), the Enter/blur/Escape handlers and the `useId` ids stay in `ArrangementDetailContentInner` and come in as props; they do not change during a drag.
   - **No `key` on the block.** MG11's group→group case relies on there being no remount.
   - **Primitive snapshot.** For members, the block's `useSyncExternalStore` snapshot must be a primitive: no new object per read.
   - **DOM order and text stay:** the column order is field, fader, reset (`clip-gain-fader` l.325–334); the first label's first text node is "Clip Gain, dB" (`clip-gain` l.836); reset's parent row is not the column (`detail-panel-fit` l.215); the fader keeps its class and fill style (`affordance-colour-ui` l.388, `fader-style-ui` l.196).
8. **Expected commit size per move:**
   - single clip: block leaf + lane path leaf + detail path leaf = **3**;
   - members: the detail selection is `null`, so there is no detail waveform (`ArrangementDetailPanel.tsx` l.698–710). The count is block leaf + **N** lane path leaves = **N + 1**. With the harness's N = 2, that is **3**;
   - folded lanes draw no waveform and add nothing.
9. **Draft keys:** add `clipGainDraftKey(clipId)` to `mix-draft-store.ts`, holding a dB value. A may add one span key keyed by `memberKey`. The store stays numbers-only and identity-stable. The block reads the **per-clip** drafts of the clip ids it displays (a span key alone is not enough). So in MG11's toSingle case, the new single selection `s1`, which is a member of the running gesture, shows its drafted value as on the baseline; a selection outside the gesture shows its stored value.
10. **Commit (pointerup or lost capture):**
    - take the override, then clear it and every draft entry it set;
    - call `applyEdit` **once**, with the overridden arrangement and `CLIP_GAIN_LABEL`;
    - for members with more than one committed clip, call `setStatus(formatClipGainMembersStatus(span))` exactly as today, keeping the member ids;
    - a drag that ends at its start values writes **no** entry (as today; `commitHistory` is a no-op there), but it still clears the drafts. That is one release commit, so `release-commits ≥ 1`.
11. **Cancel** (pointercancel, fader blur during the gesture, stolen claim, unmount):
    - clear the override and every draft entry;
    - restore `handle.setClipGain` for **every** affected clip to its stored linear gain;
    - write no entry.

    The triggers stay as today; no Esc cancel is added.
12. **`readStoredValue`** (detail l.513) keeps reading the **committed** span max. It runs once, at pointerdown; Shift re-anchors from the previewed value inside the hook. Do not change `useRelativeFaderDrag.ts`: it is frozen.
13. **Visual identity unchanged:**
    - the same classes, inline fill style, DOM order, accessible names, `data-testid`s and focus order;
    - no new `cursor-*`, `focus:`, `focus-visible:`, `ring-` or `outline` token;
    - no `React.memo` with a custom comparator.

**D-29z190 — harness.** In `perf/studio-lab.perf.spec.ts`, add a **members** scenario after `fader.group.playing`, so that no existing row's arrangement changes:
1. Select two audio clips, the added clip and the Music clip, with real clicks and the modifier the Studio uses for adding to a selection.
2. Drag `Clip Gain — fader` by the existing path while playing.
3. Space → stopped, then drag again.
4. Run the existing move-latency liveness step.

- **Rows:** ids `fader.clipgain-members.{stopped,playing}.*`, with the same metric set as `fader.clipgain.*`. Update `passSequence`.
- **Constraints:** the pass must stay under 12 min. Existing deterministic rows, compared with the round-210 medians (C compares):
  - **must be identical:** every `harness.*` row, `load.commits`, `play.idle-*`, every `fader.{track,group,master,pan}.*` deterministic row (components-per-commit, move-components-*, release-commits, restarts, moves-dispatched), and `fader.clipgain.*.moves-dispatched` / `.restarts`;
  - **may shift, but only by the leaves this design mounts:** `load.components` (baseline 344) may grow by exactly the number of mounted path/block leaf instances at load. A reports the delta and the count of drawn audio clips, and C checks that they match;
  - **change by design:** the `fader.clipgain.*` component rows (the flips).
- **Flips in `budgets.json`:**
  - `fader.clipgain.{stopped,playing}` at 1× and `.6x` (12 rows): `move-components-max` and `move-components-per-move` → `assert <= 3`; `release-commits` → `assert >= 1`.
  - New members rows: `move-components-max` and `-per-move` → `assert <= 3` (N + 1 with N = 2; the note says so); `release-commits` → `assert >= 1`; `restarts` (playing) → `assert == 0`; `moves-dispatched` `== 121`, record as for the others; wall-clock rows `record`.
  - No other row changes mode or budget.
- If the scenario's placement changes a must-be-identical row above, **STOP (L11)** with the measurement.

**D-29z191 — docs.** Fixed now, not deferred: it is the same owner, and doc 163 is the harness contract.
- **Doc 165 l.4** (GATE210-S1; L28, 5th time): exactly `**სტატუსი:** Completed (PERF-FADER-a C round 210 PASS, published 180dd2e)`. Nothing else in doc 165 changes.
- **Doc 163** (C-R210-01):
  - l.68 and l.69 describe `move-components-*` and `release-commits` as `assert`: for track, group, master and pan since PERF-FADER-a, and for clip gain (single and members) since PERF-FADER-b;
  - l.71 says that `harness.move-window-live` survives, because each value-changing move still commits the leaf;
  - add the members scenario to the pass sequence and to the row count;
  - the status line l.4 is unchanged.
- **New doc 166** (TEMPLATE.md, Georgian with English terms):
  - the status line is conditional: `In Progress (C round 211 check pending)` (L28);
  - it cites only rows that exist (L26);
  - it has a before/after table from the harness and the export-mid-drag note (item 5).

**D-29z192 — gate-210 suggestions.**
- **S2 (mandatory; small, same owner; closes the deferred Low A-R209-REVIEW-L-EXPORT-UNUSED):** `withMixOverride` is exported from the context module but used only inside it. Remove the `export`. If a test needs it, move it together with `MixOverride` into `app/lib/arrangement/mix-draft-store.ts` instead.
- **S3 (optional):** the track/group preview copies the arrangement twice and writes `setTrackGain` for every track on each move. A may narrow this only if FP1–FP14 stay green unedited. Otherwise leave it; it stays in `deferred_low_polish` (A-R209-REVIEW-L-WRITE-ALL-TRACKS, the same finding as GATE210-S3).
- **S4 (optional):** a dev-only invariant against two `applyEdit` calls in one commit. Not required.
- **S5 (C row):** no draft clear may run outside an event (timer, rAF or promise). C checks that there is no one-frame snap-back on release (LIVE-DISPLAY-211).

**D-29z193 — no zustand in this stage.** Under `oss-adoption.md`, PERF-FADER-a shipped a hand-rolled store, so PERF-FADER-b extends it; PERF-8/PERF-10 move it to zustand. No dependency request.

**STOP (L11)** with the measurement and the hit list if either of these happens:
- ≤ 3 per move (single) or N + 1 (members) cannot be reached without editing a frozen file (for example `StudioWorkspace.tsx` or `useRelativeFaderDrag.ts`);
- a granted test asserts the opposite of a rule above and cannot be re-expressed.

## 2. A — files you own (everything else is frozen)
| Path | What |
|---|---|
| `app/contexts/ArrangementContext.tsx` | clip-gain pointer path; override; `withMixOverride` not exported (S2); `startGraph` l.951 and setter l.1142 read the overridden clip gains; commit/cancel; unmount cleanup |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | renders the block leaf and the detail path leaf; the typed-text state and handlers stay here |
| `app/components/arrangement/ArrangementClip.tsx` | the lane waveform renders the path leaf; `buildPeakShape` output unchanged |
| `app/lib/arrangement/mix-draft-store.ts` | `clipGainDraftKey` (+ an optional span key; + `withMixOverride` if moved) |
| `app/components/arrangement/ArrangementMixFader.tsx` | only if a shared helper is needed; its behaviour and DOM stay identical |
| new `ArrangementDetailClipGain.tsx`, new `ArrangementPeakPath.tsx` | the two leaves. Use forwardRef where a ref is passed; `useRelativeFaderDrag`'s `ref` must still attach to the fader input. |
| `app/lib/arrangement/__tests__/mix-draft-store.test.ts` | rows for the new key(s) |
| new `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx` | rows CP1–CP14 below |
| `clip-gain-fader.test.tsx`, `clip-gain-multi.test.tsx`, `clip-gain-waveform.test.tsx`, `waveform-zoom.test.tsx` | **only** the L23 hits below; report each with its old and new assertion |
| `perf/budgets.json`, `perf/studio-lab.perf.spec.ts` | D-29z190 |
| docs 163, 165 (l.4 only), new 166 | D-29z191 |

**L23 hit list.** B's scan, independently matched by the tech-lead consult. In jsdom a drag is `pointerDown` → `windowPointer('pointermove')` → `windowPointer('pointerup')`. After the fix, a model read in between sees the stored value. A extends the list with any further read between a clip-gain pointerdown and its pointerup or cancel, applies the same ruling, and reports each addition.
- **`clip-gain-fader.test.tsx`:**
  - CF2 l.344;
  - CF4 l.372, l.374–376 (`afterToggle` must come from the displayed value) and l.378;
  - CF12 l.525;
  - CF13 l.545 and l.555.
- **`clip-gain-multi.test.tsx`:**
  - l.430;
  - MG5 l.448 and l.450;
  - MG11 l.567 and l.599 (group→group, no remount);
  - MG14 l.612 and l.622;
  - MG12 l.651.
- **`clip-gain-waveform.test.tsx`:**
  - **WG4 l.386–392.** `previewDb` comes from the displayed value. The lane and detail `d` equal the shape for previewDb. Note that `laneMatchesGain` (l.301–304) reads the model, so mid-drag use `expectedShape` with previewDb instead. The model is unchanged and `undoLabel` is null. After pointerup the model equals previewDb, and Undo restores the exact drawing.
  - **WG8 l.515–519.** The same, plus the live clip gain node equals `10 ** (previewDb / 20)`.
- **`waveform-zoom.test.tsx`:** l.506 and l.509–510 (previewDb from the displayed value). l.508 stays: its `undoLabel === CLIP_GAIN_LABEL` comes from the earlier `setClipGain`.
- **Unchanged by design** (must stay green unedited):
  - CF10 l.477–478 (refused gesture), and CF12 l.526 and MG12 l.652–653 (live gains);
  - every read after a pointerup, cancel or blur;
  - the status asserts at MG11 l.570, 584 and 598;
  - the `fader-guards` clip-gain rows (typed field), `pending-status` S9 and PM1–PM4 (typed field), WG1/WG2, and MG13.

**Ruling per hit:**
- A read **during** a pointer gesture is re-expressed as three checks: the displayed value (number field text, slider value or `aria-valuetext`); the live clip gain node; and the model **unchanged** until pointerup, then equal to the dragged value after it.
- Keep the row id and the intent of its title. Do not delete a row.
- A hit that asserts something §1 forbids is a STOP.
- Selectors by role, name, text or `data-testid` only (L12).

**New rows in `clip-gain-pointer-preview.test.tsx`.** Each model row must be red on the start copy; the others get a named mutant (D-29z187 method).
- **CP1 single drag:** N changes → 0 history entries during the drag. No render per move of `StudioWorkspace`, `ArrangementDetailPanel`/`ArrangementDetailWaveform` or `ArrangementClipView` (render counter, as in FP1). The model is unchanged, and the live clip gain follows.
- **CP2 pointerup:** one `Clip Gain` entry whose value **===** the last previewed dB. Ctrl+Z restores the model, the live gain and the lane drawing.
- **CP3 members drag:** every member's live gain follows `clipGainShiftTargets` from the gesture baseline. Pointercancel restores every member gain, both lane drawings and the block, with 0 entries.
- **CP4 stolen claim** mid members-drag: the same revert as CP3.
- **CP5 fader blur** mid-drag: cancel, no entry, display restored.
- **CP6 members commit:** one entry; the `formatClipGainMembersStatus` status is exactly as today; the values equal the pending path's result for the same anchor.
- **CP7 playing + Space** (stop/start) or a forced `syncPlayback(…, true)` mid-drag: the new graph's clip gain is the dragged value. This covers both `startGraph` l.951 and the setter l.1142.
- **CP8 playing + loop wrap** mid-drag (`resyncLoopRef`): the rebuilt graph uses the dragged value.
- **CP9 pending path unchanged:** fader ArrowUp/Down, double-click reset (single and members), typed Enter/blur/Escape and the reset button give the same values, labels and statuses as on the start copy.
- **CP10 number field and reset button mid-drag:** the field shows the drafted value, with no `data-pending` and no warning border. The reset button's `disabled` follows the draft, as the model did on the start copy (single and members). After release both show the committed state.
- **CP11 unmount** mid-drag clears the override and every draft entry, and leaves no window listener.
- **CP12 commit-value identity:**
  - single: for every slider dB a drag reaches (Shift-fine included), the committed `gainDb` equals the value the pending `onChange` stores for the same slider dB;
  - members: the same at three anchors, including the clamps at +24 and −60 (MG5 values).
- **CP13 zoom:** with waveform zoom 2, the lane drawing during a drag is the shape for `draft × 2` (the zoom still multiplies). The detail drawing ignores the zoom, as today.
- **CP14 drag back to the start value:** no entry, every draft cleared, and the display shows the stored value. This includes dragging back to the stored value mid-gesture (Trap 1).

**Self-checks before handover (not the full suite):**
- `npm run typecheck`; Biome on the owned paths (0 errors, 0 warnings).
- `npx vitest run` on:
  - the new file and the granted test files;
  - `fader-pointer-preview`, `clip-gain`, `pending-status`, `fader-guards`, `gesture-guard`, `content-colour-ui`, `detail-panel-polish`, `detail-panel-reason`, `detail-panel-fit`, `affordance-colour-ui` and `fader-style-ui`;
  - plus one covering run of `app/lib/arrangement/__tests__ app/components`.

  All green; round 210 had 2188/2188.
- `npm run test:perf` **twice**, sequential, with nothing else building. Both exit 0, and every assert passes, including the 12 flips and the new members rows. JSONs go under `a-round-211/`. Report the run time.
- **Red-proof:**
  - the start copy is `180dd2e` plus the new store key and leaves as needed, so that rows fail on assertions, not on imports;
  - named mutants for CP3, CP4, CP5, CP7, CP8, CP9, CP11, CP12, CP13 and CP14, as applicable. State the mutated line and the failing assertion.
- The code-reviewer on the **final** delta (3+ files). Carry its Architecture note verbatim.

## 3. C — rows
**Setup:**
- a production build, plus the dev server for G211-3;
- Playwright Chromium;
- C's own probes under `c-round-211/tools/`, with no imports from `perf/`;
- the baseline `180dd2e` built in a separate tree under `c-round-211/`;
- never run `test:perf` in parallel with a build.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-211** (start + end) | HEAD, `git status`, `sha256sum -c` of the 1,041-file list, grant diffs vs the start copies | Only the 14 grants differ, and only the 4 listed new files appear. Doc 165 differs only at l.4 (exact text). Every edited hunk in a granted test is on A's L23 list. |
| **PERF-RUN-211** | `npm run test:perf` ×2 | Both exit 0, and every assert passes, including the 12 flipped clipgain rows and the members rows. Restarts are 0. Deterministic rows agree between the runs and across 1×/6×. Every must-be-identical row (D-29z190) equals its round-210 median (`c-round-210/out/perf-run*.json`); `load.components` differs only by A's reported leaf count. Run time < 12 min. |
| **WINDOW-211** | C's own commit-count probe (as `c210probe.cjs`) on the harness path: single clip and members (N = 2), stopped and playing, at 1440×900 and 1280×720. **One run starts below max:** set the clip gain to −12 dB by typing first. | Single: max ≤ 3 and per-move ≤ 3. Members: max ≤ 3 (= N + 1). Every value-changing move commits (D-29z184). Before-first-move commits ≤ 1, with ≤ 3 components. Release ≥ 1. Agrees with the harness ±2. |
| **LIVE-DISPLAY-211** | Samples and screenshots at 25 / 50 / 75 % of a slow drag, single and members, both viewports | The fader thumb, fill, `aria-valuetext`, number field text, range text (members), **lane waveform and detail waveform** follow the pointer. No pending marker appears mid-drag. After release, everything shows the committed value with no one-frame snap-back (S5). |
| **AUDIO-211** | Hook `GainNode.gain` writes and `AudioBufferSourceNode.start`. (a) Drag while playing. (b) A loop wrap mid-drag. (c) Space mid-drag. | (a) The clip gain param follows the field within one move, with 0 source starts. (b) and (c) The restarted sources' clip gain is the dragged value. After release there is one entry, and Ctrl+Z restores. For members, check every member param. |
| **MEMBERS-211** | Two clips at different gains (for example −6 and +1, typed). Drag; then a pointercancel; then a fader blur mid-drag; then a clamp drag past +24. | The difference is kept, and both lane drawings follow. Cancel and blur restore both gains, both drawings and the block, with 0 entries. The clamp values equal the baseline's. |
| **INVARIANTS-211** (vs the baseline `180dd2e`) | Fader ArrowUp/Down, a held key, Shift+drag fine, double-click reset, typed Enter/blur/Escape, the reset button, Esc mid-drag, Undo/Redo labels and the status text, for single and members | Identical values, labels, statuses and `disabled` states (a baseline-vs-now diff). Esc behaves as on the baseline. |
| **EXPORT-211** | Session 1: a plain drag of the clip gain (single, from below max) to G1, export WAV, sha256. Session 2: type G1, export. Members: drag vs typed anchor. | The hashes are equal (bit-identical). The control (defaults) differs. |
| **VISUAL-211** | Computed style and crops of the fader, the field and both waveforms at rest, on hover, with keyboard focus and pressed, both viewports, vs the baseline | Identical (±0.5 px; crops at rest pixel-identical). No layout shift. |
| **DOC-211** | Docs 163, 165 and 166, and the `budgets.json` notes | Doc 165 l.4 is exact. Doc 163 l.68/69/71 and the pass sequence are fixed (C-R210-01 closed). Doc 166 has the conditional status and cites only existing row ids (L26). |
| **AN-REVIEW-211** | The diff | No `any`, `as`, `@ts-*`, lint suppressions or class selectors in tests. Semicolons. No hardcoded colours. Store unsubscribe cleans up; unmount clears every clip-gain draft. `withMixOverride` is no longer exported from the context module (S2). |
| **G211-3** | Fresh contexts at 1440 and 1280: `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` with no header and with a fake Bearer | `/studio-lab` opens anonymously. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. No header → 401. The fake Bearer gets 403 with the `:5199` mock, or 500 without it. **No token is issued.** |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke | Not claimed by C. |

**`browserVerified`:** every row above except `gate` can run in the cloud. If one did not run, the flag is false and SABA-B-5 stays open.

**Product / Ableton:** the CZABA requirement is SABA-B-5 (fast fader drag) for Clip Gain. Ableton conformance: not applicable (the behaviour is unchanged by design; INVARIANTS-211 checks it).

## 4. Adjacent behaviour that could break
- **The PERF-FADER-a faders (track, group, master, pan):** FP1–FP14 stay green unedited. C spot-checks one track drag (1 component per move).
- **Meters** still move during a clip gain drag while playing.
- **Other lane redraws:** clip move, trim and fade drags and waveform zoom still redraw the lane waveform. When no draft exists, the path leaf takes the stored gain.
- **Video clips:** Clip Gain stays disabled with its reason, and video lanes draw no waveform.
- **MG11, a selection change mid-drag:** the captured clip ids stay the target, and no stale draft is shown.
- **Status announcements** come after the commit only; there are none per move.

## 5. Publication
After C PASS, root runs the gate. Commit message: "perf(studio): PERF-FADER-b clip gain pointer preview without history churn (SABA-B-5 part 2)". Root amends doc 166 l.4 (L28).

## 6. After this round (not in scope)
- **Next:** a bounded frontend-architect checkpoint on the `ArrangementContext.tsx` gesture/override machine. B writes the request at the 211→212 planning; it is non-blocking.
- **Then, in order:** PERF-1b; PERF-16 (moved up to right after PERF-1b by the OSS decision); OSS-LIC; PERF-2…15; SYS-1…3; STORE-2b…5 (paused); REVIEW-RECOMMENDATIONS; T12-ADVANCED.
- **Schedule:** the regression round is due on or after 2026-10-30. RETRO at round 215 or at the end of STUDIO-PERFORMANCE.
