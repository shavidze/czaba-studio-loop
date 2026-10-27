# CURRENT TASK — Round 209: PERF-FADER-a, fast pointer drags for track, group, master Volume and Pan (SABA-B-5 part 1)

Decisions: **D-29z179** (stage scope, pan joins, leaf boundary), **D-29z180** (I-208-a ratified, pointerdown allowance), **D-29z181** (C-R208-01 + R115 doc 163 grant), **D-29z182** (ARCH-R207 default keep). Planned by B on 2026-10-27. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md` in the loop root (L10, L11, L12, L23, L26, L28 apply).
- `tasks/round-208.md` (PERF-FADER-a0: the metric definitions you now grade against) and `c-round-208.md` (WINDOW-208 = the "before" numbers).
- `b-round-207.md` §4 and `b-round-208.md` §3 (both consult results).
- Project: `.claude/prompts/studio-feature.md`, `.claude/prompts/new-component.md`, primitives `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `GEORGIAN_DOCS.md`.

## Baseline
- **Commit:** `f535ab3` (gate 208 **published** to both remotes; tree clean).
- **Frozen:** the 1,031 files in `b-round-208-r209-tree-sha256.txt` (every tracked file except the 19 grants). From the store root: `sha256sum -c --quiet <loop>/b-round-208-r209-tree-sha256.txt`.
- **Grants:** `b-round-208-r209-grants.txt` (19). Start hashes `b-round-208-r209-granted-start-sha256.txt`; start copies `b-round-208/r209-granted-start/`.
- **New files:** `b-round-208-r209-new-files.txt` (5). The two test files and doc 165 are mandatory. The store module and the leaf component are the required design (§1).
- **Protected as always:** auth and purchase files, `app/components/studio/**`, `app/styles/**`, `.claude/**`, `CLAUDE.md`, `package.json`, `biome.json`, `tsconfig*.json`, `playwright*.config.ts`, `app/routes/**`. **Frozen this round in particular:** `StudioWorkspace.tsx`, `app/hooks/useRelativeFaderDrag.ts`, every clip-gain source and test file (stage b).

## 0. Why this round
- **SABA-B-5 (Medium, Saba 2026-10-27): "the Studio is very slow, for example dragging a fader."** This round fixes it for track, group and master Volume and for Pan.
- **Fresh measurement (C round 208 on the production build, published `f535ab3`):** per pointermove the largest commit re-renders **83** components (track), **85** (group), **80** (master) and **4** (pan, lane-level `setPanDraft` state). The release commit is 83. 0 graph restarts. `git diff --stat d2a920c f535ab3` touches only `perf/` and docs, so these numbers are current; no re-run is needed before dispatch.
- **Cause (code fact):** `previewVolumeTarget` (`ArrangementContext.tsx` l.2365) and `previewMasterGain` (l.2727) call `updateHistory` + `syncPlayback` on every move, so the whole context value changes and every consumer re-renders. Pan already writes its `AudioParam` directly (`panOverrideRef`, l.2700), but keeps its draft in lane state (`ArrangementLane.tsx` l.193, l.403), so the whole lane re-renders per move.
- **Bug gate:** no Critical or High is open; SABA-B-5 is the Medium in progress.
- **Reference first:** not applicable (performance round; behaviour must stay the same). "Unchanged" is not assumed: rows INVARIANTS-209 and EXPORT-209 test it in the browser against the baseline build.

## 1. Rulings
**D-29z179 — scope and design (required, not a hint).**
1. **Pan joins this stage.** Its `move-components-*` rows are owned by PERF-FADER-a and 4 > 3. Both consults (tech-lead, performance-optimizer) agree. Clip gain (single + members) stays in stage b; its files are frozen.
2. **Two paths.** The context chooses by whether a pointer gesture owns the target (`volumeGestureRef.current?.targetKey === key`, `masterGestureRef.current !== null`, `panGestureRef` as now):
   - **Pointer path (new):** per move, write a context override ref (`mixOverrideRef`: one entry, `{kind: 'track' | 'group', id, volume}` or `{kind: 'master', gainDb}`) and the live graph params: `handle.setTrackGain` for every track from `trackEffectiveGains(withMixOverride(present))`, or `handle.setMasterGain`. **No `updateHistory`, no `syncPlayback`, no `setStatus` per move.** The arrangement in history does not change until commit.
   - **Pending path (unchanged):** keyboard arrows, native `onChange` with no pointer gesture, double-click reset, keyup/blur commit. Byte-for-byte the current behaviour, undo labels included.
3. **`withMixOverride(arrangement)`** is one pure helper (in `ArrangementContext.tsx` or `mix-draft-store.ts`). It is applied in `startGraph` **and** in the `syncPlayback` setter branch, next to the existing `panOverride` handling. So Space mid-drag, a loop wrap (`resyncLoopRef`, l.1019 / l.1107) and any other restart rebuild the graph with the dragged value, never the stored one.
4. **Commit (pointerup / lost capture):** read the exact override value, clear the override **and** the draft-store entry, then call `applyEdit` **once** with that exact value. The labels stay `Volume`, `Master Volume` and `Pan — <name>`. Never re-derive the value from the slider dB; keep the exact start-value case at lane l.420 (`volumeGestureStartRef`).
5. **Cancel (pointercancel, fader blur during the gesture, stolen claim, unmount):** clear the override and the draft, restore the stored gains on the live graph for **every affected track** (all members for a group), and write no history entry. The triggers stay as today; no new cancel key is added. Faders have no Esc cancel today; INVARIANTS-209 checks that this is unchanged.
6. **Display = store + leaf.**
   - New `app/lib/arrangement/mix-draft-store.ts`: a keyed store (`subscribe(key, cb)`, `get(key)`, `set(key, value)`, `clear(key)`), modelled on `position-store.ts`. Expose it the way the position store is exposed: its own provider context plus a `useArrangementMixDraftStore()` hook (like `useArrangementPositionStore`, l.3773), so the `ArrangementContextValue` type does not change (B checked: no test builds that value by hand; they all mount the real provider). The store object never changes identity.
   - New `app/components/arrangement/ArrangementMixFader.tsx`: the only component that reads the draft (`useSyncExternalStore`). It owns the `<input type="range">`, its fill style (`studioLevelFaderFillStyle`), `aria-valuetext` / `title` and the readout `<span>`. It shows the draft when one is present, otherwise the stored value it gets as a prop.
   - Lane, group header and master render it for Volume, and the lane renders it for Pan, replacing the `panDraft` state.
   - Per move, **one small commit of ≤ 3 components** is expected. Ref-only DOM writes with zero commits are **not** allowed: any parent re-render would snap the thumb back.
7. **Visual identity unchanged:** the same classes (`STUDIO_LEVEL_FADER_CLASS`, widths, the SABA-B-3/B-4 thumb and focus styles), the same DOM order and the same accessible names. No `React.memo` with a custom comparator. The leaf reuses the exact existing class strings and fill style; it adds no new `cursor-*`, `focus:`, `focus-visible:`, `ring-` or `outline` token, so the repo-scan tests from rounds 204 and 207 (focus style, cursor map) stay green unedited.
8. **Release always clears the draft**, even when the value ended where it started (track and group harness drags start and end at max, I-208-b). That clear is the release commit that `release-commits ≥ 1` counts. A drag that ends at its start value writes **no** history entry, as today.

**D-29z180 — I-208-a ratified.** The move window is "commits after the first pointermove that follows the in-page pointerdown, and before the in-page pointerup". `-per-move` divides by the 120 moves in that window. Pointerdown commits stay in the detail (`downCommits`, `downComponentsMax`). They are allowed only if `downComponentsMax ≤ 3` (baseline 0). A larger pointerdown commit is a FAIL of this round, not a reason to change the harness.

**D-29z181 — doc 163 (C-R208-01 + R115).** Gate 208 published doc 163 with l.4 still conditional (L28, 4th time). A rewrites:
- l.4 to `**სტატუსი:** Completed (PERF-1a C round 206 PASS, published 60c82ed; PERF-FADER-a0 C round 208 PASS, published f535ab3)`;
- the stale lines C listed: l.16 (row count and the wall-clock assert exception), l.18, the pass sequence l.24–31 (add the liveness step), l.74 (the determinism list, now with `move-components-*`), l.83 (row count), l.151 (TODO: PERF-FADER flips `move-components-*`, not `components-per-commit`);
- one TODO line saying stage a flipped the 48 rows (below), pointing to doc 165.

This is fixed now, not deferred: the same owner, a small change, and the doc is the harness contract the gate reads.

**D-29z182 — ARCH-R207-MIX-PREVIEW-STORE:** root has not answered, so the recorded default **keep** applies. The gesture machine stays in the context; only the store module and the leaf component are added.

**STOP (L11):** write STOP with the measurement and the hit list if ≤ 3 per move cannot be reached without editing a frozen file (for example `StudioWorkspace.tsx` or `useRelativeFaderDrag.ts`), or if a granted test asserts the opposite of a rule above and cannot be re-expressed.

## 2. A — files you own (everything else is frozen)
| Path | What |
|---|---|
| `app/contexts/ArrangementContext.tsx` | pointer path, override, `withMixOverride` in `startGraph` + `syncPlayback`, commit/cancel, store accessor, unmount cleanup (§1 items 2–6) |
| `app/components/arrangement/ArrangementLane.tsx` | Volume and Pan render `ArrangementMixFader`; `panDraft` state removed; handler behaviour unchanged |
| `app/components/arrangement/ArrangementGroupHeader.tsx` | group Volume renders `ArrangementMixFader`; the rename `draft` state is unrelated and stays |
| `app/components/arrangement/ArrangementMaster.tsx` | Master Volume renders `ArrangementMixFader` |
| new `app/lib/arrangement/mix-draft-store.ts` | keyed draft store |
| new `app/components/arrangement/ArrangementMixFader.tsx` | the leaf. Use forwardRef per the primitive if a ref is passed; `useRelativeFaderDrag`'s `ref` must still attach to the input. |
| new `app/lib/arrangement/__tests__/mix-draft-store.test.ts` | store unit rows |
| new `app/lib/arrangement/__tests__/fader-pointer-preview.test.tsx` | rows FP1–FP12 below |
| the 12 granted test files (listed in `b-round-208-r209-grants.txt`) | edit **only** the L23 hits below; the report lists each change with the old and the new assertion |
| `perf/budgets.json` | flip the 48 rows (below); notes |
| `perf/studio-lab.perf.spec.ts` | only if a note or a liveness detail needs it; no new scenario is required |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` | D-29z181 lines only |
| new `docs/implementation/2026/quarter-IV/165-fader-pointer-preview.md` | implementation doc (TEMPLATE.md); status line conditional "C round 209 check pending" (L28) |

**L23 hit list (B scanned; A classifies each hit before editing).** In jsdom the tests drive a drag as `pointerDown` → `fireEvent.change` → `pointerUp`. After the fix, a change during a pointer gesture goes to the pointer path. So any assertion that reads the **arrangement model** (`live(api).arrangement…`, `getArrangement()`, `trackEffectiveGains(getArrangement())`, `undoLabel`) **between pointerdown and pointerup** now sees the stored value. Candidates:
- `fader-touch.test.tsx` `faderValue` (l.206–217, a model read);
- `fader-guards.test.tsx` l.549, 867, 1458, 1652–1667;
- `fader-click.test.tsx` l.400–402, 495–497, 524;
- `track-volume-db.test.tsx` l.190, 203–206, 521, 534–536;
- `group-volume-db.test.tsx` l.231–254, 398–401, 418–452;
- `track-group-mix-ui.test.tsx` l.312–333, 551, 613–633;
- `pending-status.test.tsx` l.542–577;
- `context-hygiene.test.tsx` l.446–450;
- `master-ui.test.tsx` l.320–351 (the `setMasterGain` spy).

**This list is B's starting scan, not the complete set.** It covers model reads only. A extends it with any further assertion made between pointerdown and pointerup on `undoLabel`, `status`, readout text, `aria-valuetext` or the model (for example among the 58 pointer events of `fader-guards`), applies the same ruling, and reports each addition with its old and new assertion. SCOPE-209 checks every edited hunk against A's reported list. Frozen neighbour checked by B: `clip-gain-multi.test.tsx` MG13 (l.662–683) drags `Volume — მუსიკა` and Master through `dragFader` and reads the model only after the release, so it must stay green unedited.

Ruling per hit:
- Read **after** pointerup, or on the keyboard/pending path → keep it unchanged.
- Read **during** a pointer gesture → re-express it as three checks: the leaf's DOM value / `aria-valuetext` / readout (the draft the user sees); the live graph gain (the fake gain node value); and the model **unchanged** until pointerup and equal to the dragged value after it. Do not delete the row; keep its id and the intent of its title.
- A hit that asserts something §1 forbids (for example a history entry per move) is a STOP, not an edit.
- Selectors by role, name or text only (L12); no class selectors.

**`budgets.json` flips (48 rows; no other assert changes; round 208's R-2 still holds).** For `fader.{track,group,master,pan}.{stopped,playing}` at 1× and `.6x`:
- `move-components-max` and `move-components-per-move` → `assert`, `<= 3`;
- `release-commits` → `assert`, `>= 1`.

Clip-gain rows stay `record`. `harness.move-window-live` stays (`>= 1`): with the leaf design each move still commits. Update its note to say why it survives. Wall-clock rows stay `record`.

**New test rows in `fader-pointer-preview.test.tsx`.** Each row that involves the model must be red on the start copy; prove the others with a named mutant (L23).
- **FP1** track pointer drag: N changes → 0 history entries during the drag and no context re-render per move (count renders of a sibling context consumer, or the history length). The model is unchanged until pointerup, and the live gain follows each value.
- **FP2** pointerup → exactly one undo entry `Volume`, and the model value **===** the last previewed linear volume. Ctrl+Z restores the pre-drag model and gain.
- **FP3** group drag: every member's live gain follows `trackEffectiveGains(withMixOverride(...))`. Pointercancel restores every member's gain and display, with 0 history entries.
- **FP4** a stolen claim mid-drag (a second pointer gesture claims) → the same revert as FP3.
- **FP5** fader blur during the gesture → cancel (unchanged trigger), no entry.
- **FP6** master drag: the same as FP1/FP2, with `Master Volume`.
- **FP7** playing + Space mid-drag (stop then start, or a forced `syncPlayback(..., true)`): the new graph is built with the dragged value.
- **FP8** playing + a loop wrap mid-drag (`resyncLoopRef`): the rebuilt graph uses the dragged value.
- **FP9** keyboard ArrowUp/Down, Shift fine drag, double-click reset: the same values, labels and pending behaviour as before (compare with the start copy's expectations; the existing PV and pending-status rows stay green).
- **FP10** pan drag: the leaf shows the draft, the lane does not re-render per move (a render counter on the lane), and `Pan — <name>` is committed once.
- **FP11** unmount mid-drag: the override and the draft are cleared, and no listener is left.
- **FP12** commit-value identity: for every slider dB a drag reaches (Shift-fine values included), the committed volume equals the value the pending `onChange` path stores for the same slider dB. This is the unit half of EXPORT-209.
- **`mix-draft-store.test.ts`:** per-key subscribe/notify, `clear` notifies, unrelated keys are not notified, stable identity.

**Self-checks before handover (not the full suite):**
- `npm run typecheck` and `npm run lint` (0 new warnings in owned files).
- `npx vitest run` on the 2 new files, the 12 granted test files, and the frozen neighbours `clip-gain.test.tsx`, `clip-gain-waveform.test.tsx` and `clip-gain-multi.test.tsx`. All green; the frozen neighbours stay unedited.
- `npm run test:perf` **twice**, as separate invocations with nothing else building. Both exit 0, and every assert passes, including the 48 flipped rows. Put the JSONs under `a-round-209/`.
- `move-to-paint-p95.1x` for track, group, master and pan: report before (C round 208) and after. The policy target is < 16 ms (a record row, trend only).
- The code-reviewer runs (3+ files). Carry its Architecture note verbatim.

## 3. C — rows
**Setup:**
- Production build (as the harness does it) and the dev server for the UI rows; Playwright Chromium.
- C's own probes under `c-round-209/tools/`; do not import from `perf/`.
- For baseline comparisons, build `f535ab3` in a separate worktree under `c-round-209/`, never in the store tree.
- Do not run `test:perf` in parallel with any build.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-209** (start + end) | HEAD, `git status`, the frozen list (1,031), grant diffs vs the start copies | Only the 19 grants differ and only the 5 listed new files appear. No clip-gain file, `StudioWorkspace.tsx`, `useRelativeFaderDrag.ts`, style or auth file changed. Every edited hunk in a granted test is on A's L23 list. |
| **PERF-RUN-209** | `npm run test:perf` ×2 | Both exit 0. Every assert passes, including the 48 flipped rows (`move-components-max` / `-per-move` ≤ 3 and `release-commits` ≥ 1 for track, group, master and pan, stopped and playing, 1× and 6×). The `restarts == 0` rows pass, and `harness.move-window-live` ≥ 1. Deterministic rows agree between runs. |
| **WINDOW-209** (independent) | C's own commit-count probe (like `c208probe.cjs`), with the harness's path and step count (50 → 5 → 95 %, 121 moves). Drag Volume — Music, a group Volume, Master and Pan — Music, stopped and playing, at 1440×900 and 1280×720. **One run starts below max:** set −12 dB by keyboard first (I-208-b). | For all four faders, move-window max ≤ 3 and per-move ≤ 3. ≥ 100 window commits per drag (the thumb updates on the moves). Before-first-move commits ≤ 1, with ≤ 3 components (D-29z180). Release commit ≥ 1. Agrees with the harness ±2. |
| **LIVE-DISPLAY-209** | screenshots and samples at 25 / 50 / 75 % of a slow drag, both viewports | On every fader, the thumb, fill, `aria-valuetext` and readout move with the pointer. After release they show the committed value. No sample snaps back to the pre-drag value. |
| **AUDIO-209** | C hooks `GainNode.gain` writes and `AudioBufferSourceNode.start` (init script). (a) Drag while playing, no loop. (b) Playing with a short loop that wraps mid-drag. (c) Space mid-drag; record what the baseline does, and if playback toggles, a restart happens. Every drag here, and in GROUP-209 and INVARIANTS-209 where a history entry or an undo is checked, **ends at a value different from its start** (start below max, I-208-b). | (a) The live gain follows the readout within one move, with 0 source starts during the drag. (b) The graph rebuilt at the wrap uses the **dragged** gain, not the pre-drag one: no audible jump back. (c) If a restart happens, its gain is the dragged value. After release there is one history entry, and Ctrl+Z restores the pre-drag gain. |
| **GROUP-209** | A group drag on a group with ≥ 2 members, then a pointercancel (CDP `Input.dispatchTouchEvent` cancel or a `pointercancel`); separately, a fader blur mid-drag | The members' live gains follow during the drag. After the cancel or the blur, every member's gain and every display is back at the pre-drag value. 0 history entries. |
| **INVARIANTS-209** (vs the baseline `f535ab3` build) | Keyboard Arrow steps, Shift+drag fine, double-click reset, keyup/blur commit, Esc pressed mid-drag, undo/redo labels, status text after commit; on track, group, master and pan | Each gives the same value, label and status as the baseline build (a table of baseline vs now). Esc behaves as on the baseline; there is no new cancel. |
| **EXPORT-209** | Session 1: a plain drag (no Shift, so the value is keyboard-reachable) of Volume — Music (starting below max) and Master to readouts V1 / V2, export WAV, sha256. Session 2, fresh: reach V1 / V2 by keyboard only, export WAV, sha256. | The two sha256 values are equal (bit-identical). Record V1, V2 and both hashes. |
| **VISUAL-209** | Computed style and a screenshot of each fader at rest, on hover, on keyboard `:focus-visible` and mouse-pressed, both viewports, vs the baseline | Computed `background`, thumb size and colour, outline and box geometry are identical (±0.5 px). No layout shift in the lane, group or master rows. |
| **DOC-209** | doc 163, doc 165, `budgets.json` notes | The D-29z181 lines are fixed (l.4 with the exact text; l.16, 18, 24–31, 74, 83, 151). Doc 165 cites only tests that exist (L26), and its status line is conditional (L28). The notes match what is asserted. |
| **AN-REVIEW-209** | the diff | No `any`, `as` or `@ts-ignore`. Semicolons. No hardcoded colours. No class selectors in new or edited tests. The store removes listeners on unsubscribe. Unmount clears the override and the draft. |
| **G209-3** | Fresh contexts at 1440 and 1280: `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token?product=middle-east&file=stem1.wav` with no header and with a fake Bearer | `/studio-lab` opens anonymously. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. No header → 401. The fake Bearer gets 403 with the `:5199` mock, or 500 without it. **No token is issued.** |
| **gate** | full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke | not claimed by C |

**`browserVerified`:** PERF-RUN, WINDOW, LIVE-DISPLAY, AUDIO, GROUP, INVARIANTS, EXPORT, VISUAL and G209-3 can all run in the cloud. If any of them did not run, the flag is false, and SABA-B-5 part 1 is not done.

**Product / Ableton:** the CZABA requirement is SABA-B-5 (fast fader drag) for these four faders. Ableton conformance: not applicable (the behaviour is unchanged by design; INVARIANTS-209 verifies it).

## 4. Adjacent behaviour that could break
- **Meters:** they tap after the gain node and must still move during a drag.
- **Group mix:** group effective gain and solo/mute summing.
- **Multi-select clip span:** unchanged (clip gain is stage b).
- **Status announcements:** after commit only, none per move.
- **Touch:** a touch scroll over a fader must still not change it (the `fader-touch` rows).
- **Pending flush order** when a pointer gesture starts after a keyboard preview (the class of rows at `fader-guards` l.540–552).
- **`useRelativeFaderDrag` anchor:** `readStoredValue` must keep returning the **committed** value during the drag.
- **Perf run time** stays under 12 min.

## 5. Publication
After C PASS, root runs the gate. Commit message: "perf(studio): PERF-FADER-a pointer fader preview without history churn (SABA-B-5 part 1)". Root amends doc 165 l.4 (L28).

## 6. After this round (not in scope)
- **PERF-FADER-b** (clip gain, single + members; the WG4 ruling at its planning), then PERF-1b, PERF-2…16, SYS-1…3, STORE-2b…5 (paused), REVIEW-RECOMMENDATIONS, T12-ADVANCED.
- Regression round: due on or after 2026-10-30. RETRO: at round 215 or at the end of STUDIO-PERFORMANCE.
