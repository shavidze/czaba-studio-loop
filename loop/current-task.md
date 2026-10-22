# CURRENT TASK — Round 83: SRW-18 (FB-06) stage 2 — clip volume envelope (breakpoints drawn on the clip, playback, export, survives move/split/trim) + X1 = GATE82-S1 (double-click after a fade drag) (D-29z48)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-82.md` (an exact `cmp` copy). Rationale: `b-round-82.md`. Decision record: D-29z48 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage (SRW-18 stage 2) with one owner (A). It carries one **bounded, labelled fix X1 (GATE82-S1)**, because the same double-click rule is needed by the new envelope points. It also has one doc grant (doc 072).
- **SRW-18 is complete after this stage** (R18-A1 passed in round 82; R18-A2 is this round). Nothing is deferred or shrunk.

## Why this round
- **C round 82: PASS, `browserVerified=true`, `realVerified=true`.** 16 rows at both viewports, no bugs. The only BLOCKED item is the fake-Bearer 403 sub-check (backend unavailable in the cloud).
  - R18-A1 export evidence: max |x/ref − ramp| = 9.9e-5 (fade-in), 1.0e-4 (fade-out).
  - C-R80-O3 is closed by X1-STATUS.
- **Gate 82** published `bdc2067627b8390679caeda1a7e3d25db41452e9` to both remotes (review 8.5/10, COMMIT OK).
  - Reviewer #1 (Medium, unconfirmed in a browser): a quick click right after a fade drag may count as a double-click and wipe the new fade → **X1 in this round** (cheap guard; envelope points need the same rule).
  - Reviewer #2 and #3 → one doc-072 line each (this round). #4 → its own backlog entry, SRW18-KEYBOARD-FADES (also covers envelope points). #5–#8 → Lows batch / signals.
- **No Critical, High or Medium C bug is open.** Regression round not due: `regression-last.json` = 2026-10-21, due on/after **2026-10-24**.
- **C's signal applied:** live-meter rows here are **paired** (same position, envelope vs Ctrl+Z control). "Reading at t1 vs t2" oracles are not used.
- **Next scope in dependency order:** SRW-18 stage 2 (this) → SRW-19 → SRW-20 → Lows batch → SRW-21 → full regression → T12.

## Baseline (measured by B, 2026-10-22)
- **HEAD `bdc2067627b8390679caeda1a7e3d25db41452e9`** (published by gate 82). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-82-r83-tree-sha256.txt`, **471** entries, **471/471 OK**.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-82-r83-tree-sha256.txt`.
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 8 owned existing files below.
  - Frozen examples: `model.ts`, `fades.ts`, `selection.ts`, `schedule.ts`, `loop.ts`, `grid.ts`, `ArrangementDetailPanel.tsx`, and every test (`clip-fades.test.ts`, `clip-fades-ui.test.tsx`, `graph.test.ts`, `track-pan.test.tsx`, `clip-gain.test.tsx`, `clipboard.test.ts`, `model.test.ts`, `grid-snap-*.test.tsx`, …).
- **Snapshots:** `../tmp/studio-real-loop/b-round-82-r83-snapshots/` (`SHA256SUMS.txt`). All LF, CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/types/arrangement.ts` | `4272ec08` | 114 |
  | `app/lib/arrangement/clipboard.ts` | `e361dad9` | 263 |
  | `app/lib/arrangement/graph.client.ts` | `bb9262b4` | 420 |
  | `app/contexts/ArrangementContext.tsx` | `153576c5` | 3090 |
  | `app/components/arrangement/ArrangementClip.tsx` | `2ac97f7b` | 895 |
  | `app/components/arrangement/ArrangementLane.tsx` | `0740ca55` | 984 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `1d9608ce` | 2471 |
  | `docs/implementation/2026/quarter-IV/072-studio-lab-clip-fades-stage-1.md` | `c83c4695` | 89 |

- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). The auth files are also never touched.
- **Servers:** `:5173/studio-lab` 200 (`env-status.json`). Backend `:5199` is unavailable (expected). Re-check at phase start. Never start or stop servers. A row that truly needs the backend is "BLOCKED: backend unavailable in cloud".
- **Do not change the repository state:**
  - never stash, reset, checkout, clean or re-create anything;
  - a mismatch (another HEAD, non-empty status, a changed frozen file) means stop and report;
  - never run `biome check --write`, `format --write`, `npm run format` or `check:fix`; format new files through stdin to stdout, as in round 82.
  - Mutation proofs: A ran them in place in round 82 while :5173 served HMR. This time run them **in a scratch copy** (`cp -r` of the needed files into `a-round-83/mut/`, with vitest pointed at the copy). If that is impossible, restore every file byte-identical (`cmp`) and record each window in the report.

## 1. What changes (A)

### Today (B read the source at `bdc2067`)
- **Clip model** (`types/arrangement.ts` l.23–33): `{ id, trackId, sourceId, start, sourceOffset, duration, gainDb?, fadeIn?, fadeOut? }`. There is no envelope.
- **Every edit in `model.ts` copies clips with `{ ...clip }`**:
  - `moveClip` l.191; `trimClipStart` l.216–218 (moves `start` and `sourceOffset` together); `trimClipEnd` l.252; `splitClipAt` l.269–275; duplicate l.360; `deleteTime` l.407–420.
  - `selection.ts` (l.138, l.205) and `fades.ts` (`withClipFadeLengths` keeps `...rest`) do the same.
  - So **a new optional clip field is copied unchanged onto every part**.
- **Clipboard** (`clipboard.ts`) is the exception. `ArrangementClipboardItem` (l.13–22) lists fields explicitly, and three builders copy them one by one: `materialInWindow` (l.~66–80), `copyClipsToClipboard` (l.~120–130) and `planClipboardPaste` (l.~240–250).
- **Graph** (`graph.client.ts`): per scheduled item `source → fadeGain? → clipGain → trackGain → panner → master`.
  - `fadeGain` exists only for faded clips (l.178–186). `ScheduleAudioParam` already has optional `setValueAtTime?` / `linearRampToValueAtTime?` (l.16–17), and the three frozen `FakeParam`s implement it.
  - `ScheduledClip` (types l.107–114) carries `when`, `sourceOffset` and `duration` per item. This holds for a mid-clip start (`schedule.ts` l.85) and for loop iterations (`loop.ts` l.187).
- **Restart rule:** `scheduleKey` (`ArrangementContext.tsx` l.469–473) = JSON of `[clips, loop]` without `gainDb`. A new clip field is part of the key automatically, so an envelope edit during playback reschedules from the current position, as fades do.
- **Clip view** (`ArrangementClip.tsx`):
  - header `h-5` (move); body (range drag / click seek, `beginGesture('range')`); trim strips `w-2 z-20`;
  - fade handles `z-30/z-40`, which capture the pointer on the handle (round-82 H1). The root captures for other kinds, so **a `dblclick` lands on the capture element**, not on a child under the pointer.
  - The body is not rendered on a folded lane.
  - `beginGesture`/`handlePointerMove`/`finishGesture` handle six gesture kinds (l.309–715).
- **Mode plumbing:** the Snap toggle lives in `StudioWorkspace.tsx` (state l.460, `toggleSnap` l.1234, the `g` key at l.1859, the button at l.2181–2197 inside `arrangement-grid-control`, 224 px wide). It reaches clips as a prop through `ArrangementLane` (l.930 → `ArrangementClipView`). A plain `a` key is unused in the workspace (only `Ctrl/Cmd+A`, l.1770). `StudioContext.tsx` l.1605 is the purchased Studio, not `/studio-lab`.

### Constraints found by B in the frozen tests (do not rediscover them)
- **Source-text locks on `renderArrangementWav`:**
  - `track-pan.test.tsx` l.444–460, `graph.test.ts` l.387–389, `clip-gain.test.tsx` l.498–501;
  - **and now `clip-fades.test.ts` FD8**, which requires `clipFades: clipFadeShapes(arrangement),`.
  - The body must keep those lines and must not contain `pan`, `setTrackGain` or `setClipGain`. **The new line is exactly `clipEnvelopes: clipEnvelopeShapes(arrangement),`.** No identifier containing `pan` / `span` / `expand` / `panel` may appear in that function.
- **Node counts:** create the per-source envelope `GainNode` **only for a clip with ≥ 1 envelope point**. Other clips build exactly today's graph (frozen node-count tests and FD7d stay green).
- **Normal form:** `envelope?` is **omitted when empty**: the key is absent, never `envelope: undefined` or `[]`. Build objects with conditional spreads, as `materialInWindow` does for `gainDb`. New tests use `toStrictEqual`.
- **Do not edit `model.ts` or `fades.ts`** (frozen). If a grep shows a clip builder that drops the new field outside the §Files grants, **stop and report**.

### Contract (B decision: the smallest honest behaviour consistent with FB-06 / R18-A2; rationale in `b-round-82.md` §4)
- **E1 — Model.**
  - `types/arrangement.ts` gains `export interface ArrangementClipEnvelopePoint { time: number; gain: number }` and `envelope?: ArrangementClipEnvelopePoint[]` on `ArrangementClip`.
  - **`time` is in source seconds** (the same axis as `sourceOffset`), whole ms. **`gain` is linear 0…1**, 4 decimals, so 0 dB is the maximum. Clip Gain (−60…+24 dB) still provides boost.
  - Points are sorted, with strictly increasing times. Clips on a video track never carry an envelope.
  - **Why source time:** the envelope is anchored to the audio material. A move changes only `start`, a trim changes `start` and `sourceOffset` together, and split/Delete Time/duplicate copy `{ ...clip }`. So the envelope moves with the clip and survives every edit **with no change to `model.ts`**, and the level at every source sample is the same before and after a split.
  - **Points outside the visible window are kept** (non-destructive). They still shape the level at the window edge, and a trim back out shows them again.
- **E2 — Pure module `app/lib/arrangement/envelope.ts`** (new; names may differ only if they stay grep-discoverable; whatever is used in `renderArrangementWav` must not contain `pan`):
  - `clipEnvelopeGainAtSource(points, sourceTime)`: 1 for no points; holds the first value before the first point and the last value after the last; linear interpolation (in linear gain) between points.
  - `clipEnvelopeGainAt(clip, time)`: timeline time → source time `clip.sourceOffset + (time − clip.start)`.
  - `visibleClipEnvelopePoints(clip)`: points with `sourceOffset − 1e-6 ≤ time ≤ sourceOffset + duration + 1e-6`.
  - `addClipEnvelopePoint(arrangement, clipId, timelineTime)`: inserts a point at that time (ms), with **the current line value** at that time (4 dp). Returns the **same reference** for a missing clip, a video-track clip, a time outside the clip, or an existing point at the same ms.
  - `moveClipEnvelopePoint(arrangement, clipId, pointSourceTime, nextTimelineTime, nextGain)`:
    - time clamped to `[prev + 0.001, next − 0.001]` and to the visible window;
    - gain clamped to `[0, 1]` and rounded to 4 dp;
    - same reference when nothing changes or the point is missing.
  - `removeClipEnvelopePoint(arrangement, clipId, pointSourceTime)`: drops the point and omits `envelope` when it becomes empty. Same reference when the point is missing.
  - `clipEnvelopeShapes(arrangement)`: `Map<clipId, ClipEnvelopeShape>` (`{ points }`), for audio-track clips with ≥ 1 point only.
  - `formatClipEnvelopeGain(gain)`: `"0.0 dB"`, `"−12.0 dB"` (U+2212), `"−∞ dB"` at 0.
- **E3 — Edits.**
  - `model.ts` stays untouched (see E1).
  - `clipboard.ts`: `ArrangementClipboardItem` gains `envelope?`. `materialInWindow`, `copyClipsToClipboard` and `planClipboardPaste` carry it with a conditional spread, unchanged: points stay in source time, and `sourceOffset` already moves with the window.
  - `cutRangeFromArrangement` keeps it through `{ ...clip }`; A confirms this with a grep.
  - Range copy keeps the whole point list (the window decides what is visible).
- **E4 — Audio (live and export, one code path).** `ApplyScheduleOptions` gains `clipEnvelopes?: ReadonlyMap<string, ClipEnvelopeShape>`. In `startPlan`, for an item whose clip has a shape, the chain is `source → fadeGain? → envelopeGain → clipGain`. With `T(t) = startAt + (t − from)`, `s0 = item.sourceOffset`, `s1 = s0 + item.duration`, `src(t) = s0 + (t − item.when)`:
  - initial `envelopeGain.gain.value = clipEnvelopeGainAtSource(points, s0)` and `setValueAtTime(that, T(item.when))`;
  - for each point with `s0 < p.time < s1`, in order: `linearRampToValueAtTime(p.gain, T(item.when + p.time − s0))`;
  - then **always** `linearRampToValueAtTime(clipEnvelopeGainAtSource(points, s1), T(item.when + item.duration))`. This continues correctly toward a hidden point after the window, and it is a flat ramp when the last value is held;
  - `envelopeGain` is disconnected wherever `fadeGain` is (the `appendPlan` cleanup and `disconnect`), and is stored on `ScheduledSourceState`;
  - `startGraph` passes `clipEnvelopes: clipEnvelopeShapes(arrangement),` (one line + its import). `renderArrangementWav` passes exactly the same line. No other context change;
  - `setClipGain` touches only `clipGain`; fades, Clip Gain, track/group gains, pan, master and meters multiply as before; the track meter reads post-envelope.
- **E5 — Mode (`StudioWorkspace.tsx`, `ArrangementLane.tsx`).**
  - `envelopeMode` is view state, like Snap: no history, not saved.
  - **Button:** `Env`, placed after the grid-division select in `arrangement-grid-control`. Same classes as the Snap button: `h-6 shrink-0`, accent when on. Attributes:
    - `data-testid="arrangement-envelope-toggle"`, `aria-pressed`, `aria-keyshortcuts="A"`;
    - `title` on: `Envelope ჩართულია — კლიპზე double-click = წერტილი (A)`;
    - `title` off: `Envelope გამორთულია — კლიპის volume envelope-ის რედაქტირება (A)`.
    - The grid-control div gains `data-envelope-mode="on|off"`. The row must not overflow (`scrollWidth ≤ clientWidth`) at 1280 and 1440 with any division selected.
  - **Key:** plain `a` (no Ctrl/Meta/Alt/Shift, not `repeat`) toggles the mode, with the same guards as the `g` branch. The status is `Envelope რეჟიმი: ჩართულია.` / `Envelope რეჟიმი: გამორთულია.`
  - **No toggle mid-gesture:** the button and the key refuse while `isPointerGestureActive() || isArrangementPreviewActive()`, with `GESTURE_EDIT_BLOCKED_MESSAGE`, exactly like `setTrackGroupsCollapsed` (l.933). So the keyboard cannot unmount the editor mid-drag (the GATE82-S7 class).
  - **Not in the transport toolbar:** frozen GS14 (`grid-snap-ui.test.tsx` l.363–372) locks that toolbar at 12 buttons. B grepped the frozen tests: those touching `arrangement-grid-control` read only `dataset` and the Snap toggle's own attributes, and no frozen test presses a plain `a`.
  - **Plumbing:** `ArrangementLane` gains one optional prop, `envelopeMode?: boolean`, passed to `ArrangementClipView`. Nothing else changes in the lane.
- **E6 — View (new `app/components/arrangement/ArrangementClipEnvelope.tsx`, rendered by `ArrangementClip.tsx` inside the body for audio clips only, never on a folded lane).**
  - **Why a child component:** this is the fourth round on the clip gesture code. The reviewers' Architecture note (rounds 81–82) proposes a per-kind table later. Point gestures in their own component avoid adding kinds 7–9 to the six-way switch, and they use the same `claimPointerGesture` / `previewArrangement` / `commitArrangement` props. Checkpoint question 11 goes to root (non-blocking).
  - **Line:**
    - an SVG polyline through `(0, g(window start))`, every visible point, and `(width, g(window end))`, with `y = (1 − gain) · bodyHeight`;
    - `pointer-events-none`, `currentColor` with a token class, `data-testid="arrangement-clip-envelope-line"`;
    - drawn whenever the clip has ≥ 1 point (mode on **or off**, so the envelope is visible on the clip), and in mode as a flat top line when it has none.
  - **Editor (mode on, clip ≥ 24 px wide):**
    - an overlay `absolute inset-y-0 inset-x-2 z-10` with `data-testid="arrangement-clip-envelope-editor"` and `cursor-crosshair`. **Stacking matters:** the clip root is not a stacking context, so a `z-30` overlay would cover the full-height trim strips (`z-20`, `w-2`) and break EU5 / EN-NEIGHBOURS. `inset-x-2 z-10` keeps both 8 px trim strips clear and under nothing; a double-click inside those strips does not add a point;
    - points as 8×8 px squares centred on the line, `z-30` (above the overlay and the trim strips, like the fade handles), **React-keyed by index** (stable during a drag, so the drag-then-double-click guard keeps its target), with:
      - `data-testid="arrangement-clip-envelope-point"`;
      - `data-time` (timeline seconds, `toFixed(3)`) and `data-gain` (`toFixed(4)`);
      - `title` `Envelope: 10.000 წმ · −12.0 dB — drag · double-click = წაშლა`.
    - **In mode the fade handles are not rendered** (Live hides fade controls in Automation Mode); the fade ramp overlay stays.
  - **The clip root exposes `data-envelope`:** the visible points as `t:g` joined by `;`, with timeline seconds `toFixed(3)` and gain `toFixed(4)` (e.g. `6.000:1.0000;10.000:0.2512;14.000:1.0000`), `""` when none.
- **E7 — Gestures (`ArrangementClipEnvelope.tsx`).**
  - **Editor background press** (button 0):
    - `stopPropagation`, so no range, seek or move starts;
    - a plain press selects the clip and the active track;
    - Ctrl/Cmd or Shift → `toggleClipSelection` as the body does;
    - no history entry.
  - **Editor background double-click** → `addClipEnvelopePoint` at the pointer's timeline time (free, no snap): one entry `Envelope: წერტილის დამატება`, status `Envelope: წერტილი დაემატა — 10.000 წმ · 0.0 dB.`. A point already at that ms → no entry.
  - **Point press** (button 0):
    - `claimPointerGesture`, then `setPointerCapture` **on the point** (fallback `watchUncapturedPointerGesture`), `stopPropagation`; 3 px threshold.
    - **Drag:** `time = original + dx / pxPerSecond` (free), `gain = original − dy / bodyHeight`, both through `moveClipEnvelopePoint` from `before`.
      - Preview through `previewArrangement`; status during the drag `Envelope: 10.000 წმ · −12.0 dB`.
    - **Release:** one entry `Envelope: წერტილის გადატანა`, status with a final period. A drag that ends at the start value → `Envelope: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`. A press without movement writes nothing.
    - **`pointercancel`, a lost pointer, or the component unmounting mid-drag** (e.g. zoom makes the clip narrower than 24 px; the mode key itself is refused mid-gesture, E5) → revert to `before`, with no entry, and release the claim.
  - **Point double-click** → `removeClipEnvelopePoint`: one entry `Envelope: წერტილის წაშლა`, status `Envelope: წერტილი წაიშალა — 10.000 წმ.`. `stopPropagation`, so no point is added.
  - **Drag-then-click guard (same rule as X1):** a point double-click within 500 ms after that point's moved gesture is ignored.
  - **No keyboard path** for points in this stage: SRW18-KEYBOARD-FADES (backlog) now covers fades and envelope points as one accessibility item. Do not invent one here.
- **X1 — GATE82-S1 (bounded, `ArrangementClip.tsx`).**
  - Remember `{ edge, at }` (`performance.now()`) when a fade gesture that **moved** ends, whether committed or not.
  - `resetClipFade` returns without an entry or status when the same edge's double-click comes within 500 ms of that.
  - After 500 ms a double-click resets as in round 82 (FD-UNDO unchanged).
- **Docs:**
  - **doc 072 l.4** → exactly:

    ```text
    **სტატუსი:** Round 82 — C PASS (`browserVerified`), გამოქვეყნდა `bdc2067`
    ```

  - **doc 072:** at most three added lines in "პრობლემები და გადაწყვეტები" or "TODO":
    - (a) GATE82-S2: a split or Delete inside a fade is not sound-neutral. The right part starts at gain 1. This is the F3 rule, and it is a signal;
    - (b) GATE82-S3: the hidden handles take the top 10 px of the trim strips and body corners, so a plain mouse click there starts a fade gesture that writes nothing;
    - (c) round-83 X1.
  - **New doc 073** `docs/implementation/2026/quarter-IV/073-studio-lab-clip-volume-envelope-stage-2.md`, in Georgian with the TEMPLATE sections. Status: `Round 83 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z48)`. Record the E1 time-base choice, the linear-gain law and every Live difference in §4.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/types/arrangement.ts` | `ArrangementClipEnvelopePoint` + `envelope?` on `ArrangementClip` only |
| `app/lib/arrangement/envelope.ts` | **new** (E2) |
| `app/lib/arrangement/clipboard.ts` | `ArrangementClipboardItem.envelope?`, `materialInWindow`, `copyClipsToClipboard`, `planClipboardPaste` (E3) + import if needed |
| `app/lib/arrangement/graph.client.ts` | `ApplyScheduleOptions.clipEnvelopes?`, `ScheduledSourceState.envelopeGain`, a private scheduling helper, `startPlan`, the two cleanup sites, one line in `renderArrangementWav` + import |
| `app/contexts/ArrangementContext.tsx` | **one line** in the `startGraph` `applySchedule` options (`clipEnvelopes: clipEnvelopeShapes(arrangement),`) + its import. Nothing else |
| `app/components/arrangement/ArrangementClip.tsx` | `envelopeMode?` prop, render `ArrangementClipEnvelope`, hide fade handles in mode, `data-envelope`, X1 |
| `app/components/arrangement/ArrangementClipEnvelope.tsx` | **new** (E6, E7) |
| `app/components/arrangement/ArrangementLane.tsx` | one optional prop `envelopeMode?` passed to `ArrangementClipView` |
| `app/components/arrangement/StudioWorkspace.tsx` | `envelopeMode` state + toggle callback, the `Env` button and `data-envelope-mode`, the `a` key branch beside `g`, `envelopeMode` on `<ArrangementLane>` |
| `app/lib/arrangement/__tests__/envelope.test.ts` | **new** (pure + graph) |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | **new** (workspace UI) |
| `docs/implementation/2026/quarter-IV/072-studio-lab-clip-fades-stage-1.md` | l.4 + at most 3 added lines |
| `docs/implementation/2026/quarter-IV/073-studio-lab-clip-volume-envelope-stage-2.md` | **new** |

Expected end state: **8 M + 5 ??**. Everything else is frozen (the 471-entry list). If a frozen test turns red, **stop and report**; do not edit it.

### Required tests (behavioural; the IDs are for C to cite)
`envelope.test.ts`:
- **EV1** `clipEnvelopeGainAtSource`: 1 with no points; holds before the first and after the last point; exact at points; linear midway (e.g. 1 → 0.2512 over 4 s gives 0.6256 at 2 s).
- **EV2** add: value = the line value, not a parameter; ms rounding; sorted insert. Same reference for a missing clip, a video clip, a time outside the clip, or a duplicate ms. Remove of the last point leaves no `envelope` key (`toStrictEqual`).
- **EV3** move: clamped 1 ms from both neighbours and to the window; gain clamped to [0, 1], 4 dp; same reference when unchanged.
- **EV4** edits on a clip at 2 (offset 0, 16 s) with points src 4:1, 8:0.2512, 12:1:
  - `moveClip` to 3 keeps `envelope` `toStrictEqual`;
  - `splitClipAt` 10 → both parts carry the full list, and `clipEnvelopeGainAt` is 0.2512 on both sides of 10;
  - `trimClipStart` to 8 keeps all points, visible = src 8 and 12, gain at 8 = 0.6256; trimming back to 2 shows 3 points again;
  - `deleteTime` 4–5: the right part's gain at each source time equals the original;
  - duplicate, `copyClipsToClipboard` + `planClipboardPaste`, and `copyRangeToClipboard` keep the list;
  - a clip without an envelope gives exactly today's object (no `envelope` key).
- **EV5** graph with a recording fake context:
  - (a) play from 0, points at timeline 6/10/14 → `setValueAtTime(1, T(2))`, ramps 1@T(6), 0.2512@T(10), 1@T(14), final 1@T(18);
  - (b) play from 8 → initial 0.6256 at T(8);
  - (c) the same clip trimmed to source [6, 10] (the src-12 point is hidden after the window) → initial 0.6256, ramp 0.2512 at src 8, final ramp to `g(10)` = 0.6256 at the clip end;
  - (d) a clip without points creates no extra node;
  - (e) a loop iteration via `appendPlan` schedules relative to its own `startAt`;
  - (f) `setClipGain` touches only `clipGain`, never `envelopeGain`;
  - (g) fade + envelope → connect order `source → fadeGain → envelopeGain → clipGain`.
- **EV6** the `renderArrangementWav` source contains `clipEnvelopes: clipEnvelopeShapes(arrangement),` and `clipFades: clipFadeShapes(arrangement),`, and no `pan` / `setTrackGain` / `setClipGain`. Plus a render-level check (stubbed `OfflineAudioContext`, as FD8b) that export creates the envelope node.

`clip-envelope-ui.test.tsx` (workspace render, same harness style as `clip-fades-ui.test.tsx`):
- **EU1** mode:
  - the button and the `a` key toggle `aria-pressed` / `data-envelope-mode` and write the status;
  - `a` with Ctrl/Meta/Alt/Shift, with `repeat`, or in a text input does nothing;
  - mode off → no editor and no points; mode on → no fade handles;
  - a video clip and a folded lane never render an editor.
- **EU2** add: in mode, a double-click at x = 4 s into the clip (40 px/s) gives `data-envelope` `"<start+4>.000:1.0000"`, undo label `Envelope: წერტილის დამატება`, and the status. Ctrl+Z → `""`; Ctrl+Y → back.
- **EU3** drag:
  - a point dragged down by ¼ of the body height → gain 0.75 (± 1 px), one entry, the status;
  - a horizontal drag past a neighbour stops 1 ms short;
  - a press without movement writes nothing;
  - `pointercancel` mid-drag reverts with no entry;
  - unmounting the editor mid-drag (the test may unmount or re-render the view) reverts with no entry; `a` and the `Env` button mid-drag are refused with `GESTURE_EDIT_BLOCKED_MESSAGE`.
- **EU4** delete: a double-click on a point removes it (one entry) and adds nothing. A double-click within 500 ms after a moved drag of that point is ignored.
- **EU5** neighbours:
  - in mode, an editor press neither seeks nor starts a range, while header move and trim strips still work;
  - mode off: body range and click-seek are unchanged, the line is still drawn, and there are no points.
- **EU6** X1: a fade-handle drag followed at once by a double-click on the handle keeps the fade (one `Fade In` entry). After 600 ms (fake timers or a mocked `performance.now`) the double-click resets it.

### Mutation proofs (A runs them in a scratch copy; logs in `a-round-83/mut/`; each must turn at least one listed test red)
(a) envelope ramps on `clipGain` (EV5f); (b) initial value ignores a mid-clip `from` (EV5b); (c) no final ramp to the window end (EV5c); (d) a clipboard builder drops `envelope` (EV4); (e) export omits `clipEnvelopes` (EV6); (f) move ignores neighbours (EV3, EU3); (g) `pointercancel` commits (EU3); (h) the X1 guard removed (EU6); (i) add uses the pointer y instead of the line value (EU2); (j) unmount mid-drag leaves the preview (EU3).

## 2. Pre-flight for A
- Read the applicable primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/studio-feature.md`, `new-component.md`, `new-test.md`.
- Verify the baseline (HEAD, 0-line status, 471/471, snapshots, protected 4/4, LF/CR) before the first edit.
- Grep before coding:
  - every production caller of `applySchedule` (expect `startGraph` and `renderArrangementWav`);
  - every place that builds an `ArrangementClip` or clipboard item field by field (expect the three clipboard builders and the two model creators of new clips). Anything else that would drop `envelope` → **stop and report**.
- Checks A runs (speed rules):
  - `npm run typecheck`, `npm run lint`, and scoped `biome check` on the owned files (no `--write`);
  - targeted vitest: the two new files plus every test that imports `graph.client`, `clipboard`, `ArrangementClip`, `ArrangementLane` or `StudioWorkspace`, or renders the workspace with clips. List them in `a-round-83/targeted-list.txt`. Not the full suite.
- A's own Playwright smoke at 1440×900 is welcome (not C evidence); do one warm-up load first (round-82 lesson).
- Run the code-reviewer (3+ files changed) and pass its Architecture note verbatim to B.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-83*`. **B** owns the planning artifacts. Root owns gates, commits and pushes.
- Protected (never edited): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, and the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`).
- `/studio-lab` stays the public **demo-only** workspace: demo collection badge, no purchased audio, no token/R2 requests.

## 4. Ableton source table
**Sources:** Live 12 Reference Manual, fetched by B on 2026-10-22 with curl and stored as untrusted text in `b-round-82/web/`:
- "Automation and Editing Envelopes", `https://www.ableton.com/en/live-manual/12/automation-and-editing-envelopes/`. Sections: "Drawing and Editing Automation", "Editing Breakpoints", "Locking Envelopes", "Edit Menu Commands". The page numbers this chapter 25; the older TOC capture says 26, so cite by title.
- "Clip Envelopes", `https://www.ableton.com/en/live-manual/12/clip-envelopes/`. Sections: "The Clip Envelope Editor", "Mixer and Device Clip Envelopes", "Modulating Mixer Volumes and Sends".
- Shortcuts §42.7 "Commands for Breakpoint Envelopes" (`b-round-71/ableton-shortcuts-20261021.txt`).
- §6.8 fades (`b-round-71/ableton-arrangement-view-20261021.txt`).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Envelopes shown over the waveform in Automation Mode; `A` toggles it | Drawing and Editing Automation; §42.7 | Confirmed (text) | Same key `A` + an `Env` button. **Difference:** an existing envelope line stays visible with the mode off (FB-06: "envelope drawn on clip") | EN-MODE, EN-DRAWN |
| Arrangement volume automation is absolute and lives on the track's automation lane; Arrangement clips only get modulation envelopes | Clip Envelopes → Mixer and Device Clip Envelopes | Confirmed (text) | **Conscious difference (user request FB-06):** a volume envelope owned by the clip, absolute attenuation ≤ 0 dB, multiplied with Clip Gain | — |
| Click on a segment adds a breakpoint; double-click off a segment adds one at that position | Editing Breakpoints | Confirmed (text) | **Difference:** a double-click anywhere in the editor adds a point **at the line's value** (no single-click add, no value from pointer y) | EN-ADD |
| Click on a breakpoint deletes it | Editing Breakpoints | Confirmed (text) | **Difference:** double-click deletes (no click/drag ambiguity; GATE82-S1 lesson) | EN-UNDO |
| Drag a breakpoint to move it; the value is shown while hovering or dragging | Editing Breakpoints | Confirmed (text) | Same (status + `title`) | EN-DRAG |
| Breakpoints snap to the grid; Alt bypasses | Editing Breakpoints | Confirmed (text) | **Difference:** free in stage 2, as fades are (signal ENVELOPE-SNAP) | — |
| Breakpoints snap to neighbour times; dragging over a neighbour removes it | Editing Breakpoints | Confirmed (text) | **Difference:** clamped 1 ms from the neighbours, never removed | EN-DRAG |
| Shift = axis lock / finer resolution; Alt-drag = curved segment | Editing Breakpoints; §42.7 | Confirmed (text) | Not requested in FB-06; not included; linear segments only | — |
| Envelopes move with their clips unless Lock Envelopes is on | Locking Envelopes | Confirmed (text) | Same (source-anchored; no lock option) | EN-EDITS a–d |
| Edit commands on the clip track apply to clip + envelopes | Edit Menu Commands | Confirmed (text) | Same for split, copy, duplicate, Delete range, Cut Time | EN-EDITS e, g |
| Envelope under trim | — | Not in the capture (unconfirmed) | CZABA: non-destructive, source-anchored (E1) | EN-EDITS f |
| Interpolation law of a volume envelope | — | Not in the capture (unconfirmed) | CZABA: linear in amplitude between points | EN-EXPORT |
| Clear Envelope from a context menu | Clip Envelope Editor | Confirmed (text) | Not included; points are deleted one by one (signal) | — |
| Fade controls hidden in Automation Mode (F shows them momentarily) | §6.8; §42.7 | Confirmed (text) | Same: hidden in Env mode; no F key | EN-MODE |

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup per session** (one warm-up load first):
- Snap off; Middle East on music @0.35 s; `ღამის პულსი · პულსი` on stems @2 s (16 s, ends 18 s); Soft impact on sfx @4 s.
- Load the video only where a row says so.
- For audio oracles, **mute music and sfx**, so the stems clip is alone, and use the same session's no-envelope export as the reference `ref`.
- **"V"** = stems points added by double-click at ≈ 6, 10 and 14 s, then the middle one dragged down to `data-gain` ≈ 0.2512 (−12.0 ± 0.3 dB). Use the **actual** `data-envelope` values in every oracle.

| ID | Action | Pass evidence |
|---|---|---|
| EN-MODE | Toggle with the button, then with `A` | `aria-pressed` / `data-envelope-mode` / status flip each time. Grid row `scrollWidth ≤ clientWidth`. In mode: editor present on audio clips, fade handles absent; none on a video clip (`media/beeps-6s-h264-aac.mp4`) or a folded lane; screenshots |
| EN-ADD (R18-A2) | In mode, double-click the stems body at ≈ 6, 10, 14 s | 3 points at gain 1.0000; `data-envelope` lists them; 3 entries `Envelope: წერტილის დამატება`; the double-clicks did not seek or start a range |
| EN-DRAG | Drag the middle point down to ≈ −12 dB; then try past a neighbour, above the top, below the bottom | One `Envelope: წერტილის გადატანა` entry per drag; status shows the dB. Limits: 1 ms short of the neighbour, 1.0000 at the top, 0.0000 (`−∞ dB`) at the bottom |
| EN-DRAWN | Screenshot with the mode on and off | The line passes the middle point at y ≈ (1 − 0.2512)·bodyHeight ± 2 px. With the mode off the line is still drawn and there are no points |
| EN-EXPORT (R18-A2, primary) | V; export | Over [6, 14], for samples with \|ref\| > 1e-3, \|x/ref − env(t)\| ≤ 0.01, with env linear between the `data-envelope` points. Over [2, 6] and [14, 18] the ratio is 1 ± 1e-4 |
| EN-LIVE (paired) | Fresh stems clip; points at ≈ 6 (0 dB), 7 (−12), 13 (−12), 14 (0); play from 5 s; repeat after Ctrl+Z until `data-envelope` is `""` (6 entries: 4 adds + 2 drags) as the control | Stems meter, envelope minus control at the same position: ≈ 10 s → −12 ± 2 dB; ≈ 16 s → 0 ± 1 dB |
| EN-MIDSTART (paired) | Same plateau; seek 10 s, play; control the same | At ≈ 10.3 s the paired difference is −12 ± 2 dB (playback did not start at 0 dB) |
| EN-EDITS | Each edit on a **fresh** V (Ctrl+Z back between edits; verify each restore): (a) move on the same lane +1 s; (b) move to a free place on sfx; (c) Ctrl+D; (d) Ctrl+C / Ctrl+V; (e) Ctrl+E split at 10 s; (f) trim start to 8 s, then back to 2 s; (g) Delete on a range 8–9 | (a)–(d) every resulting clip shows the same gains with times shifted by its move. (e) left `6.000:1.0000;10.000:0.2512`, right `10.000:0.2512;14.000:1.0000`; the export equals the pre-split export (ratio 1 ± 1e-4 over [2, 18], excluding ± 1 ms at 10). (f) `10.000:0.2512;14.000:1.0000`; the export at 8 s starts at ratio 0.6256 ± 0.01 and follows the ramp; trim back → 3 points. (g) left `6.000:1.0000`, right `10.000:0.2512;14.000:1.0000`; the export equals the pre-edit one outside [8, 9] |
| EN-UNDO | Add, drag, double-click a point, still press on a point | One entry per add / drag / delete with the right label; Ctrl+Z / Ctrl+Y restore exact `data-envelope`; deleting adds no point; a still press adds nothing |
| EN-MULTIPLY | V + fade-in 1 s + Clip Gain −6 dB; export | Ratio = (t − 2)/1 · 0.5012 · env(t) within 0.01 over [2, 3]; 0.5012 · env(t) over [3, 14] |
| EN-PLAY-EDIT | During playback past 5 s, drag a point | Playback continues, the position is monotonic, no console error; one entry |
| EN-NEIGHBOURS | Mode off: body range, click-seek, trim strip, header move, fade handles. Mode on: header move, trim strip | All behave exactly as before (status and values). In mode an editor press does not seek |
| X1-DBLCLICK | Drag the stems fade-in handle +5 px, release, then within 300 ms click the handle once more | `data-fade-in` stays at the dragged value, with one `Fade In` entry. Record whether the page saw a `dblclick` event. After 1 s, a real double-click resets it to 0.000 (FD-UNDO regression) |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning, no non-noise console error |
| G83-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace; `/api/studio-token?…` anonymous → 401; no token/R2/download request from `/studio-lab`; the header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T83-TARGETED | A's `a-round-83/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD, 8 M + 5 ??, frozen 471/471, A's end hashes, protected 4/4 |

- **Live rows:** the paired difference is the oracle. If the control run is unstable, C repeats it at most twice within the budget and reports the measurements honestly. **The export rows are the primary R18-A2 evidence.**
- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Ableton match:** C reports it separately (confirmed / conscious difference / unconfirmed / not applicable), using §4.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutations (a)–(j) in a scratch copy, never in `store/`.

## 7. After this round
- **Round 84:** a **regression round** if round-84 planning falls on or after 2026-10-24. That means one short browser check per done / c_pass item at both viewports, plus `npm run test:e2e:smoke`. Otherwise SRW-19 (video opacity fade, preview only, honest "video render unavailable" in export).
- Then SRW-20 (range export, MP3, off-main-thread encoding) → Lows batch → SRW-21 → full regression → T12.
- The architecture checkpoint request (questions 1–11) stays with root and does not block.
