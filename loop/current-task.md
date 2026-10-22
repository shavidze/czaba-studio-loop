# CURRENT TASK — Round 82: SRW-18 (FB-06) stage 1 — clip fade in / fade out (model, live playback, export, handles) + X1 = C-R80-O3 release status (D-29z47)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-81.md` (an exact `cmp` copy). Rationale: `b-round-81.md`. Decision record: D-29z47 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage (SRW-18 stage 1) with one owner (A). It carries one **bounded, explicitly labelled bug fix X1 (C-R80-O3)** because it lives in the same owner file (`ArrangementClip.tsx`, the clip gesture code), plus two one-line doc grants (C81-2, GATE81-S1).
- **SRW-18 stages.** Nothing is deferred or shrunk:
  - **stage 1 (this round):** fade in / fade out per audio clip — model, live playback, export, drag handles, undo, behaviour under every existing clip edit (R18-A1);
  - **stage 2 (next SRW-18 round):** clip volume envelope with breakpoints drawn on the clip, playback + export, moves with the clip and survives split/trim (R18-A2).

## Why this round
- **C round 81: PASS, `browserVerified=true`, `realVerified=true`.** 20 rows passed at both viewports. Bugs: 2 Low.
  - **C81-1 (Low, UX signal):** nested group names truncate (`ჯგუ…`) at depth ≥ 1. Contract M4 (≥ 40 px) holds. → Lows batch + Tech Lead R81-T. No code this round. B does not rule a nesting-depth cap: that would shrink FB-12 without user authorisation.
  - **C81-2 (Low, docs):** doc 070 l.72 still describes the round-80 refusal → **fixed in this round** (one-line grant).
- **Gate 81** published `efbed86f644c4faabbdf2044620d089e7537e5bb` to both remotes (review 8.5/10, COMMIT OK). Reviewer #1 (doc 071 status line stale) → **fixed in this round** (one-line grant).
- **SRW-17 / FB-12:** all three stages are C PASS with browser evidence and published → c_pass_tech_lead_manual (Tech Lead R79-T/R81-T open), the SRW-14/15/16 pattern.
- **No Critical, High or Medium bug is open.** Regression round not due: `regression-last.json` = 2026-10-21, due on/after **2026-10-24**.
- **C-R80-O3 ruling (B, D-29z47).** B read `ArrangementClip.tsx` l.497–504 and l.592–643 and plan.md l.170 (the FB-03 decision, C-verified long ago): *"on an occupied place amber is shown and the clip stays at its last valid place"*. So the committed 1.025 s (the last valid same-lane preview before the pointer crossed into the occupied lane) **is the designed rule**, and the dimmed source clip shows exactly that place during the drag. No frozen test locks a release after a refused single-clip lane hover (B grepped `grid-snap-edit`, `grid-snap-ui`, `marker-snap`, `grid-snap-clip-edges`, `selection`). The real defect is the **release status**: it still says only `აქ ადგილი არ არის` and never says where the clip ended. X1 = an honest release status. Severity stays **Low** (the refusal is shown during the drag, nothing is lost, Undo works). C's `probe-ghost.json` already reproduced it, so no separate repro round is needed.
- **Next scope in dependency order:** SRW-18 (depends on SRW-13, whose code stages are all done) → SRW-19 → SRW-20 → Lows batch → SRW-21 → full regression → T12.

## Baseline (measured by B, 2026-10-22)
- **HEAD `efbed86f644c4faabbdf2044620d089e7537e5bb`** (published by gate 81). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-81-r82-tree-sha256.txt`, **467** entries, **467/467 OK**.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-81-r82-tree-sha256.txt`.
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 8 owned existing files below: e.g. `selection.ts`, `schedule.ts`, `grid.ts`, `ArrangementLane.tsx`, `StudioWorkspace.tsx`, `ArrangementDetailPanel.tsx` and every test (`graph.test.ts`, `track-pan.test.tsx`, `clip-gain.test.tsx`, `clipboard.test.ts`, `model.test.ts`, `grid-snap-*.test.tsx`, `track-meter.test.ts`, `metronome.test.ts`, …).
- **Snapshots:** `../tmp/studio-real-loop/b-round-81-r82-snapshots/` (`SHA256SUMS.txt`). All LF, CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/types/arrangement.ts` | `e8da478e` | 112 |
  | `app/lib/arrangement/model.ts` | `5ea0cb33` | 646 |
  | `app/lib/arrangement/clipboard.ts` | `7c50d2bc` | 241 |
  | `app/lib/arrangement/graph.client.ts` | `3dca2d29` | 377 |
  | `app/contexts/ArrangementContext.tsx` | `6d0a217c` | 3088 |
  | `app/components/arrangement/ArrangementClip.tsx` | `1f9554b7` | 737 |
  | `docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md` | `3ae28491` | 86 |
  | `docs/implementation/2026/quarter-IV/071-studio-lab-track-groups-stage-3-mix.md` | `cb62af3f` | 97 |

- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers:** `:5173/studio-lab` 200 (`env-status.json`). Backend `:5199` unavailable (expected). Re-check at phase start. Never start or stop servers. A row that truly needs the backend is "BLOCKED: backend unavailable in cloud".
- **Do not change the repository state:** never stash, reset, checkout, clean or re-create anything. A mismatch (another HEAD, non-empty status, a changed frozen file) means stop and report. Never run `biome check --write`, `format --write`, `npm run format` or `check:fix` (format new files through stdin to stdout, as in round 81).

## 1. What changes (A)

### Today (B read the source at `efbed86`)
- **Clip model** (`types/arrangement.ts` l.23–31): `{ id, trackId, sourceId, start, sourceOffset, duration, gainDb? }`. No fades.
- **Graph** (`graph.client.ts`): per scheduled item `source → clipGain → trackGain → panner → master` (l.140–147). `clipGain` is driven live by `setClipGain` with `setTargetAtTime` (l.309–319), so a fade ramp on `clipGain` would collide with a live Clip Gain change. `ScheduleAudioParam` (l.12–15) has only `value` and `setTargetAtTime`; **three frozen tests implement it** (`class FakeParam implements ScheduleAudioParam` in `graph.test.ts`, `track-meter.test.ts`, `metronome.test.ts`).
- **Schedule:** `planSchedule` (`schedule.ts`, frozen) yields `{ clipId, trackId, sourceId, when, sourceOffset, duration }` relative to `from`; `startPlan` starts each source at `startAt + (item.when − from)`. Loop iterations go through `appendPlan` with their own `from`/`startAt`.
- **Restart rule:** `scheduleKey` (`ArrangementContext.tsx` l.469) = JSON of `[clips, loop]` without `gainDb`. **New clip fields are automatically part of the key**, so a fade change during playback reschedules from the current position (as a clip move does today). No key change is needed.
- **Live start** (`ArrangementContext.tsx` `startGraph`, l.802–826) and **export** (`renderArrangementWav`, `graph.client.ts` l.346–377) both call `applySchedule`.
- **Clip edits that change clip edges:** `trimClipStart` / `trimClipEnd` / `splitClipAt` / `deleteTime` (`model.ts`) and `materialInWindow` / `copyClipsToClipboard` / `cutRangeFromArrangement` / `planClipboardPaste` (`clipboard.ts`). They copy clips with `{ ...clip }`, so new fields would be copied **unchanged onto parts whose edge is a new cut** unless handled. `ArrangementClipboardItem` carries `gainDb?` explicitly; fades must travel the same way.
- **Clip view** (`ArrangementClip.tsx`): header strip `h-5` (move), body (range drag / click seek, waveform SVG), trim strips `w-2` full height at both edges (`z-20`). The body is not rendered on a folded lane.
- **O3 path:** the single-clip cross-lane refusal (l.497–504) sets `gesture.blocked = true`, the status and the ghosts, and returns **without** changing the preview. Release (l.620–643) commits `getArrangement()` (the last valid preview) and, because `gesture.blocked`, writes no status.

### Constraints found by B in the frozen tests (do not rediscover them)
- **Source-text locks on `renderArrangementWav`** (`track-pan.test.tsx` l.444–460, `graph.test.ts` l.387–389, `clip-gain.test.tsx` l.498–501): the body must keep `applySchedule(ctx, planSchedule(arrangement, 0)`, `tracks: arrangement.tracks,`, `clipGains: clipLinearGains(arrangement)` and the `return { blob: … ...report };` line, and must **not** contain the substrings `pan`, `setTrackGain`, `setClipGain`. ⚠ A name like `clipFadeSpans` contains `pan`. **Use exactly the new line `clipFades: clipFadeShapes(arrangement),`.**
- **`ScheduleAudioParam` must stay implementable by the three frozen fakes.** Add the ramp methods as **optional** members (`setValueAtTime?(value: number, startTime: number): unknown`, `linearRampToValueAtTime?(value: number, endTime: number): unknown`) and call them with optional chaining. No type assertion, no `any`. A real `AudioParam` always has both.
- **Node counts:** create the per-source fade `GainNode` **only for a clip with a non-zero effective fade**. Clips without fades build exactly today's graph (frozen tests that count nodes or inspect `ctx.gains` stay green).
- **Normal form:** `fadeIn?` / `fadeOut?` are **omitted when 0** (the `gainDb` / group-mix precedent). Omitted means **the key is absent**, never `fadeIn: undefined` (build objects with conditional spreads, as `materialInWindow` does for `gainDb`). B found no frozen `toStrictEqual` on clips today; the new tests use `toStrictEqual` so a stray `undefined` key fails here. Frozen `toEqual` checks on clips and clipboard items stay green; `isSameArrangement` (JSON) is unchanged for clips without fades.

### Contract (B decision: the smallest honest behaviour consistent with FB-06, R18-A1 and Live 12 §6.8)
- **F1 — Model.** `ArrangementClip` gains `fadeIn?: number` and `fadeOut?: number` (seconds of timeline time, whole ms, `> 0` when present). `ArrangementClipboardItem` gains the same two optional fields. **Invariant:** `fadeIn + fadeOut ≤ duration` (Live §6.8: "A clip's start and end fades cannot overlap each other"). Clips on a video track never carry fades in stage 1 (the picture fade is SRW-19).
- **F2 — Pure module `app/lib/arrangement/fades.ts`** (new). Exports (names may differ only if they stay grep-discoverable; whatever is used inside `renderArrangementWav` must not contain `pan`):
  - `clipFadeIn(clip)`, `clipFadeOut(clip)`: **effective** values clamped by the invariant (read-time safety net: `out = min(fadeOut, duration)`, `in = min(fadeIn, duration − out)`).
  - `setClipFade(arrangement, clipId, edge: 'in' | 'out', seconds)`: a new arrangement, or the **same reference** when the value does not change, the clip is missing, or it is on a video track. Clamps to `[0, duration − other fade]`, rounds to ms, omits 0.
  - `withCutEdges(clip, { start: boolean; end: boolean })`: drops `fadeIn` when the start edge is a new cut, drops `fadeOut` when the end edge is a new cut, then re-applies the invariant (zeros omitted).
  - `clampClipFadesAfterTrim(clip, edge: 'start' | 'end')`: keeps both lengths; if they no longer fit, shrinks **the fade at the trimmed edge first**, then the other.
  - `clipFadeGainAt(shapeOrClip, time)`: the 0…1 linear gain at timeline `time` (1 outside the fades; product of the in and out ramps if they meet).
  - `clipFadeShapes(arrangement)`: `Map<clipId, ClipFadeShape>` with `{ start, duration, fadeIn, fadeOut }`, for audio-track clips with a non-zero effective fade only.
- **F3 — Edits** (each existing function keeps its signature and its exact result for clips without fades):
  - move / cross-lane move / group move / duplicate / copy-paste of whole clips (`copyClipsToClipboard` + `planClipboardPaste`): fades travel unchanged;
  - `trimClipStart` / `trimClipEnd`: `clampClipFadesAfterTrim`;
  - `splitClipAt` (and so Ctrl+E, `splitClipsByRange`, `splitClipsAtTime`): left = `withCutEdges(…, { start: false, end: true })`, right = `withCutEdges(…, { start: true, end: false })`;
  - `deleteTime` (Ctrl+Shift+X) and `cutRangeFromArrangement` / `deleteRangeKeepingGap` (Delete/Backspace on a range, Cut): a remaining part loses the fade at each **new cut** edge; untouched or merely shifted clips keep theirs;
  - `materialInWindow` (range copy, Cut Time clipboard): an item keeps `fadeIn` only if the window contains the clip's original start, `fadeOut` only if it contains the original end, then the invariant;
  - Live's behaviour under split/trim/delete-time is not in the capture: these are CZABA choices; record them in doc 072.
- **F4 — Audio (live and export, one code path).** `ApplyScheduleOptions` gains `clipFades?: ReadonlyMap<string, ClipFadeShape>`. In `startPlan`, for an item whose clip has a shape, the chain is `source → fadeGain → clipGain`. With `T(t) = startAt + (t − from)`:
  - initial `fadeGain.gain.value = clipFadeGainAt(shape, item.when)` and `setValueAtTime(that, T(item.when))`;
  - fade-in still ahead (`item.when < start + fadeIn`): `linearRampToValueAtTime(1, T(start + fadeIn))`;
  - fade-out: if `item.when < end − fadeOut`: `setValueAtTime(1, T(end − fadeOut))`; then `linearRampToValueAtTime(0, T(end))` (already inside the fade-out: the ramp starts from the initial value);
  - when `fadeIn + fadeOut = duration` the two ramps meet at `clipFadeGainAt`'s value;
  - `fadeGain` is disconnected wherever `clipGain` is today (the `appendPlan` cleanup and `disconnect`);
  - `startGraph` passes `clipFades: clipFadeShapes(arrangement),`; `renderArrangementWav` passes exactly `clipFades: clipFadeShapes(arrangement),`. No other context change;
  - Clip Gain, track volume, group gains, pan, master and meters multiply as before; the track meter reads post-fade;
  - linear ramps only. R18-A1 says "linear/curved"; linear satisfies it. Live's Fade Curve handle is a recorded conscious difference.
- **F5 — Handles** (`ArrangementClip.tsx`; audio clips only; not on a folded lane; not when the clip is narrower than 24 px):
  - two 10×10 px handles at the **top of the body** (just under the header): the fade-in handle with its left edge at `fadeIn · pxPerSecond`, the fade-out handle with its right edge at `width − fadeOut · pxPerSecond`, both clamped inside the clip. They sit above the trim strips (`z-30`); the trim strips stay usable over the rest of the clip height;
  - testids `arrangement-clip-fade-in-handle` / `arrangement-clip-fade-out-handle`; `title` `Fade In — drag · double-click = 0` / `Fade Out — drag · double-click = 0`; `cursor-ew-resize`. Visible when the clip is hovered or selected or the fade is > 0 (Live §6.8: handles appear on hover as small squares). Tailwind token classes only, no hardcoded colour;
  - a ramp overlay in the body (`pointer-events-none`; an SVG line/area from the body's bottom-left up to the fade-in end, mirrored for the fade-out; `currentColor` + token class);
  - the clip root exposes `data-fade-in` and `data-fade-out` (`toFixed(3)`, `"0.000"` when absent).
- **F6 — Gesture.** New gesture kinds `fadeIn` / `fadeOut` through the existing `beginGesture` (same pointer claim; same selection behaviour as the trim strips; `stopPropagation` so the body range/seek never starts).
  - Pointer move: `seconds = clamp(roundTime(original ± dx / pxPerSecond), 0, duration − otherFade)` (fade-in grows to the right, fade-out to the left). Free: no grid snap, Alt irrelevant (CZABA choice; Live's fade snapping is not in the capture). Preview through `previewArrangement(setClipFade(…))`; status during the drag `Fade In: 1.000 წმ` / `Fade Out: 2.000 წმ`.
  - **Release:** one history entry `Fade In` / `Fade Out` through `commitArrangement`; status `Fade In: 1.000 წმ.`. A press without movement writes nothing. A drag that ends at the start value writes the existing no-change status form (`Fade In: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`).
  - **`pointercancel` and a lost pointer revert** to `gesture.before` with no entry (the `endStaleClipGesture` path).
  - **Double-click** on a handle sets that fade to 0: one entry `Fade In` / `Fade Out`, status `Fade In: 0.000 წმ.`; an already-zero fade → no entry. `stopPropagation`, so no lane or clip double-click action runs. Live deletes a fade by selecting its handle and pressing Delete; CZABA's Delete always acts on clips/ranges (SRW-24), so the reset is a double-click (recorded difference).
  - Keyboard editing of fades is not part of stage 1. Record it in doc 072 as an open accessibility signal for the stage-2 planning; do not invent a keyboard path here.
- **X1 — C-R80-O3 release status (bounded).** In the single-clip `move` gesture, remember the refusal text of the **last** hover (`laneRefusal: string | null` on the gesture; set in the refused cross-lane branch l.497–504, cleared in every other move branch). On release, when there is no `laneTarget`, the gesture is `blocked` and `laneRefusal` is set:
  - if the commit changed the arrangement: status `<refusal> — კლიპი ბოლო თავისუფალ ადგილას დარჩა: <lane name>, start <formatArrangementTime(start)>.` (e.g. `აქ ადგილი არ არის — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:01.025.`); undo label `კლიპის გადატანა` unchanged;
  - if nothing changed (e.g. the first above-threshold move already lands in the refused lane, so there was no same-lane preview): the existing no-change status `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` (unchanged), and no entry;
  - the committed position, the ghosts, the group path and the same-lane neighbour block are **unchanged**.
- **Docs (one-line grants):**
  - doc 070 l.72 → describes X1 of round 81: the focused row is read first, `blur()` commits a pending preview as one `Volume` entry, then the group collapses and focus moves to the group name; pointer gestures are still refused; the round-80 refusal no longer applies;
  - doc 071 l.4 → exactly this line:

    ```text
    **სტატუსი:** Round 81 — C PASS (`browserVerified`), გამოქვეყნდა `efbed86`
    ```

### Files (exact grants)
| File | Grant |
|---|---|
| `app/types/arrangement.ts` | `fadeIn?` / `fadeOut?` on `ArrangementClip` only |
| `app/lib/arrangement/fades.ts` | **new** (F2) |
| `app/lib/arrangement/model.ts` | bodies of `trimClipStart`, `trimClipEnd`, `splitClipAt`, `deleteTime` only (F3) + import |
| `app/lib/arrangement/clipboard.ts` | `ArrangementClipboardItem` (2 optional fields), `materialInWindow`, `copyClipsToClipboard`, `cutRangeFromArrangement`, `planClipboardPaste` (F3) + import |
| `app/lib/arrangement/graph.client.ts` | `ScheduleAudioParam` (2 optional methods), `ApplyScheduleOptions.clipFades?`, `ScheduledSourceState` (fade node), `startPlan`, the two cleanup sites, one line in `renderArrangementWav` + import |
| `app/contexts/ArrangementContext.tsx` | **one line** in the `startGraph` `applySchedule` options (`clipFades: clipFadeShapes(arrangement),`) + its import. Nothing else |
| `app/components/arrangement/ArrangementClip.tsx` | F5, F6, X1 |
| `app/lib/arrangement/__tests__/clip-fades.test.ts` | **new** (pure + graph) |
| `app/lib/arrangement/__tests__/clip-fades-ui.test.tsx` | **new** (workspace UI) |
| `docs/implementation/2026/quarter-IV/070-studio-lab-track-groups-stage-2-collapse.md` | l.72 only (C81-2) |
| `docs/implementation/2026/quarter-IV/071-studio-lab-track-groups-stage-3-mix.md` | l.4 only (GATE81-S1) |
| `docs/implementation/2026/quarter-IV/072-studio-lab-clip-fades-stage-1.md` | **new**, Georgian, TEMPLATE sections; status "Round 82 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z47)" |

Expected end state: **8 M + 4 ??**. Everything else is frozen (the 467-entry list). If a frozen test turns red, **stop and report**; do not edit it.

### Required tests (behavioural; the IDs are for C to cite)
`clip-fades.test.ts`:
- **FD1** `setClipFade` clamps to `[0, duration − other]`, rounds to ms, omits 0, and returns the same reference for no change, a missing clip and a video-track clip.
- **FD2** `clipFadeGainAt`: 0 at the clip start with a fade-in, 0.5 at half the fade-in, 1 in the middle, 0 at the end with a fade-out, and the exact meeting value when `in + out = duration`.
- **FD3** trim: a 10 s clip with in 2 / out 3 trimmed at the start to 4 s keeps out 3 and shrinks in to 1; trimmed at the end to 4 s keeps in 2 and shrinks out to 2; a clip without fades gives exactly today's object (`toStrictEqual`, no fade keys).
- **FD4** split at 5 s of that clip (start 0): left has `fadeIn: 2` and no `fadeOut` key; right has `fadeOut: 3` and no `fadeIn` key.
- **FD5** `deleteTime` 4–6 on that clip: the left part keeps in 2 only, the right part keeps out 3 only; a clip entirely after the cut keeps both and only shifts.
- **FD6** clipboard: `copyClipsToClipboard` + `planClipboardPaste` keep both fades; `materialInWindow` (through `copyRangeToClipboard`) over 3–12 of a clip at 2–12 keeps only `fadeOut`; `cutRangeFromArrangement` follows FD5's rule.
- **FD7** graph, with a fake context whose params record `setValueAtTime` / `linearRampToValueAtTime`: (a) play from 0, clip at 2 with in 1 → initial 0 at T(2), ramp to 1 at T(3); (b) play from 2.5 → initial 0.5 at T(2.5), ramp to 1 at T(3); (c) out 2 on a clip ending at 18 → set 1 at T(16), ramp to 0 at T(18); (d) a clip without fades creates no extra gain node; (e) a loop iteration through `appendPlan` schedules the same ramps relative to its own `startAt`; (f) `setClipGain` during a fade touches only `clipGain`, never `fadeGain`.
- **FD8** the `renderArrangementWav` source contains `clipFades: clipFadeShapes(arrangement),` and still no `pan` / `setTrackGain` / `setClipGain` (mirrors the frozen locks so a rename fails here first).

`clip-fades-ui.test.tsx` (workspace render, same harness style as the frozen grid/lane UI tests):
- **FU1** an audio clip renders both handles and `data-fade-in="0.000"`; a video clip and a clip on a folded lane render none.
- **FU2** dragging the fade-in handle +40 px at 40 px/s → `data-fade-in="1.000"`, undo label `Fade In`, status `Fade In: 1.000 წმ.`; Ctrl+Z → `0.000`; Ctrl+Y → `1.000`. The same for fade-out (`Fade Out`).
- **FU3** dragging past the other fade clamps to `duration − other`; a press without movement writes no entry; `pointercancel` mid-drag reverts with no entry.
- **FU4** double-click on a handle with a fade → 0 and one entry; on a zero fade → no entry; a handle press never starts the body range/seek.
- **FU5** X1: a single clip dragged right, then onto an occupied lane and released there → the clip stays on its own lane at the last valid preview start, the status is exactly the X1 text, the undo label is `კლიპის გადატანა`; a refused hover followed by a return to its own lane and release → the normal move status (no refusal text); a drag whose first move lands in the refused lane and is released there → no entry and the no-change status.

### Mutation proofs (A runs them; logs in `a-round-82/mut/`; each must turn at least one listed test red)
(a) ramps put on `clipGain` instead of a separate node (FD7f); (b) the initial value ignores a mid-fade `from` (FD7b); (c) split keeps both fades on both parts (FD4); (d) `deleteTime` keeps the fade at the new cut edge (FD5); (e) export omits `clipFades` (FD8 plus a render-level check); (f) the invariant is not applied in `setClipFade` (FD1, FU3); (g) `pointercancel` commits (FU3); (h) the X1 status is removed (FU5).

## 2. Pre-flight for A
- Read the applicable primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/studio-feature.md`, `new-test.md`.
- Verify the baseline (HEAD, 0-line status, 467/467, snapshots, protected 4/4, LF/CR) before the first edit.
- Grep before coding: every production caller of `applySchedule` (expect exactly `startGraph` and `renderArrangementWav`); every place that builds an `ArrangementClip` from another with a changed edge (expect the F3 list). If another one exists (e.g. in `selection.ts` or `ArrangementContext.tsx`), **stop and report**: it is frozen or out of grant.
- Checks A runs (speed rules): `npm run typecheck`, `npm run lint`, scoped `biome check` on the owned files (no `--write`), and targeted vitest: the two new files plus every test that imports `graph.client`, `model`, `clipboard` or `ArrangementClip`, or renders the workspace with clips (list in `a-round-82/targeted-list.txt`). Not the full suite.
- Run the code-reviewer (3+ files changed) and pass its Architecture note verbatim to B.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-82*`. **B** owns the planning artifacts. Root owns gates, commits and pushes.
- Protected (never edited): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, and the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`).
- `/studio-lab` stays the public **demo-only** workspace (demo collection badge, no purchased audio, no token/R2 requests).

## 4. Ableton source table
Source: Live 12 Reference Manual §6.8 "Audio Clip Fades and Crossfades", `https://www.ableton.com/en/live-manual/12/arrangement-view/`, captured 2026-10-21 (`b-round-71/ableton-arrangement-view-20261021.txt`; untrusted data, read as text only).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Fades at clip start/end | §6.8 ¶1 | "The beginning and end of audio clips … have adjustable volume fades" | Same (audio clips) | FD-IN, FD-OUT |
| Handles appear on hover as small squares at the clip edges; the track must be tall enough | §6.8 ¶2–3 | Confirmed (text) | Same; hidden on a folded lane / narrow clip | FD-HANDLES |
| Drag a handle across the clip to change the length | §6.8 ¶4 | Confirmed (text) | Same; free (no snap): CZABA choice, Live snapping unconfirmed | FD-IN, FD-LIMITS |
| Start and end fades cannot overlap | §6.8 limits | Confirmed (text) | Same (`in + out ≤ duration`) | FD-LIMITS |
| Fade Curve handle | §6.8 ¶4 | Confirmed (text) | **Conscious difference:** linear only in stage 1 | — |
| Select a handle + Delete deletes the fade | §6.8 | Confirmed (text) | **Difference:** double-click resets (Delete stays clip/range, SRW-24) | FD-UNDO |
| Crossfades between adjacent clips | §6.8 | Confirmed (text) | **Not applicable:** CZABA clips never overlap; a handle cannot cross the clip edge | FD-LIMITS |
| Automatic 4 ms edge fades (option "Create Fades on Clip Edges") | §6.8 | Confirmed (text; an opt-in setting) | **Conscious difference:** not added. This closes the routing of C-R28-INFO-NO-EDGE-FADES as a recorded difference | — |
| Fades are a clip property, independent of automation | §6.8 last ¶ | Confirmed (text) | Same (fades move/copy with the clip; the envelope is stage 2) | FD-EDITS |
| Fades under split / trim / delete time | — | **Not in the capture (unconfirmed)** | CZABA rules F3 | FD-EDITS |
| X1: occupied target refused, clip stays at its last valid place | — (Live overwrites on overlap) | Not applicable | CZABA FB-03 decision (plan l.170); only the release status changes | X1-STATUS |

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse` and keyboard)
Setup per session: Snap off; Middle East on music @0.35 s, `ღამის პულსი · პულსი` on stems @2 s (16 s, ends 18 s), Soft impact on sfx @4 s; load the video only where a row says so. For audio oracles **mute music** (and the video sound if loaded) so the stems clip is alone in the window, and use the same session's no-fade export as the reference `ref`.

| ID | Action | Pass evidence |
|---|---|---|
| FD-HANDLES | Hover the stems clip; inspect a video clip (`media/beeps-6s-h264-aac.mp4`) and a folded lane | Two 10×10 handles inside the top of the hovered audio clip's body; none on the video clip, none on the folded lane; `data-fade-in/out="0.000"`; screenshots |
| FD-IN (R18-A1) | Real mouse drag of the fade-in handle until `data-fade-in` = v ≈ 1.000 (± 1/pxPerSecond); export | Status `Fade In: <v> წმ.`, undo `Fade In`. Export vs `ref`: for samples in [2.0, 2.0 + v] with \|ref\| > 1e-3, \|x/ref − (t − 2)/v\| ≤ 0.01; over [2.0 + v, 3.5] ratio 1 ± 1e-4; before 2.0 both 0 |
| FD-OUT | Drag the fade-out handle to v ≈ 2 s; export | Over [18 − v, 18] the ratio follows (18 − t)/v within 0.01; over [12, 18 − v] ratio 1 ± 1e-4 |
| FD-LIVE | Fade-in ≈ 1 s; play from 1.5 s | The stems meter at ≈ 2.15 s is ≥ 12 dB below its reading at ≈ 2.95 s; without the fade (Ctrl+Z, replay) the same two readings differ by ≤ 3 dB (discriminates) |
| FD-MIDSTART | Fade-in ≈ 1 s; seek 2.5 s, play | The stems meter at ≈ 2.6 s is 2–12 dB below its reading at ≈ 3.3 s (playback started mid-fade: neither from silence nor at full gain) |
| FD-LIMITS | Fade-out 2 s; drag the fade-in far right past the fade-out start; try to drag it left of the clip start | `data-fade-in` = duration − 2 = 14.000; never < 0; both handles stay inside the clip |
| FD-UNDO | Drag in, drag out, double-click in, double-click a zero fade, press without moving | Exactly one entry per drag / double-click with the right label; Ctrl+Z / Ctrl+Y restore exact values; the zero-fade double-click and the still press add nothing |
| FD-EDITS | Each edit on a **fresh** stems clip 2–18 with in 1 / out 2 (Ctrl+Z back between edits): (a) move on the same lane; (b) move to a free place on the sfx lane; (c) Ctrl+D; (d) Ctrl+C / Ctrl+V; (e) Ctrl+E split at 10 s; (f) trim start to 5 s; (g) Delete on a range 8–9 | Expected `data-fade-in / data-fade-out`: (a)–(d) every resulting clip 1.000 / 2.000; (e) left 2–10 1.000 / 0.000, right 10–18 0.000 / 2.000; (f) 5–18 1.000 / 2.000; (g) left 2–8 1.000 / 0.000, right 9–18 0.000 / 2.000. After (e): export [16, 18] still follows the fade-out ratio and [10, 10.1] has ratio 1 (no fade at the cut) |
| FD-PLAY-EDIT | During playback past 5 s, drag the fade-out handle | Playback continues, the position is monotonic, no console error; the change is one entry |
| FD-NEIGHBOURS | Body drag away from the handles; trim strip below a handle; header move; click-seek in the body | Range, trim, move and seek behave exactly as before (status and values) |
| FD-CLIPGAIN | Clip Gain −6 dB on the faded clip; export | The fade-in ratio = 0.5012 · (t − 2)/v within 0.01 (gains multiply) |
| X1-STATUS | Reproduce C-R80-O3: the music clip @0.35 dragged ≈ 1 s right and down onto the occupied stems lane, released there | The clip stays on music at the start shown by `data-clip-start`; the status is exactly `აქ ადგილი არ არის — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start 00:0X.XXX.` with that start; undo `კლიპის გადატანა`; a drag onto a free lane still writes `გადატანა ხაზზე — …` |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning, no non-noise console error |
| G82-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace; `/api/studio-token?…` anonymous 401; no token/R2/download request from `/studio-lab`; the header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T82-TARGETED | A's `a-round-82/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD, 8 M + 4 ??, frozen 467/467, A's end hashes, protected 4/4 |

**Signal choice for the live rows.** `ღამის პულსი · პულსი` is rhythmic. C runs the FD-LIVE control (no fade) first; if its two readings already differ by more than 3 dB, C moves FD-LIVE and FD-MIDSTART to the sustained Middle East clip (fade at its start 0.35 s, stems muted, the same instants relative to the clip start) and records why. **The export rows FD-IN / FD-OUT are the primary R18-A1 evidence**; a live row that stays noisy after that switch is reported honestly as FAIL/inconclusive with its measurements, not retried beyond the budget, and B decides it.

Gate rows (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
Ableton match: C reports it separately (confirmed / conscious difference / unconfirmed / not applicable) using §4.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutations (a)–(h) in a scratch copy, never in `store/`.

## 7. After this round
- **Round 83:** a **regression round** if round-83 planning falls on or after 2026-10-24 (one short browser check per done / c_pass item at both viewports + `npm run test:e2e:smoke`); otherwise SRW-18 stage 2 (clip volume envelope, R18-A2).
- Then SRW-19 (video opacity fade, preview only, honest "video render unavailable" in export) → SRW-20 (range export, MP3, off-main-thread encoding) → Lows batch → SRW-21 → full regression → T12.
- The architecture checkpoint (the SRW-16/17 boundary request, now with question 10) stays with root; non-blocking.
