# CURRENT TASK — Round 3: C-R2-01/02 video-sync fixes + SRW-05 Loop + SRW-06 multi-select/marquee

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-07
Previous task: `tmp/studio-real-loop/tasks/round-2.md`. C's verdict: **FAIL 22/24** (`c-round-2.md`, `c-round-2.json`). B's decision record: `b-round-2.md`.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-01..D-18). **D-16, D-17 and D-18 are new and binding for this round.** Backlog: `tmp/studio-real-loop/backlog.json` → `SRW-02`, `SRW-03` (open bugs), `SRW-05`, `SRW-06`.
Working dir for all paths below: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

## 0. Goal and order of work (do the steps in this order)

1. **Fix C-R2-01 (High)**, the video seek storm and drift, and **C-R2-02 (Low)**, the video starting before the audio (§3). These come first. Loop wraps depend on them.
2. **SRW-05: Loop** (§4). One brace. Loop Selection replaces the old brace. The toggle keeps the brace. The brace can be moved, resized and nudged from the keyboard. Wraps are scheduled ahead of time and stay sample-continuous. The video wraps too.
3. **SRW-06: multi-select** (§5). Ctrl/Cmd toggles a clip, Shift adds one, a marquee drag over empty lane space selects across lanes, and Ctrl/Cmd+A selects all. A selected group can be moved, nudged and deleted.

If an item is not finished, list its acceptance IDs under **"not ready"** in your report. C fails those IDs and B carries them over. Do not fake or soften behaviour to make it fit.

Do **not** build UI for later items:
- duplicate or group split (SRW-07);
- moving clips between lanes (SRW-08);
- clipboard (SRW-09);
- zoom navigation (SRW-10);
- panels (SRW-11);
- library search (SRW-12);
- gain, pan or master (SRW-13);
- grid (SRW-14);
- markers (SRW-16);
- fades (SRW-18);
- range or MP3 export (SRW-20).

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md`. Then read these primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`. Also read the prompts `studio-feature.md`, `new-component.md` and `new-test.md`, and the skill `pre-flight`. Where a primitive example is stale, the code and this task win.
2. Read the following for behaviour only. Do not copy code from them.
   - In `../output/studio-workspace-prototype/workspace.js`:
     - loop brace `renderLoopBrace` (≈1893–2035);
     - loop toggle and Loop Selection (≈2919–3000);
     - loop remap in `deleteTime` (≈3174–3185);
     - `selectionIds`, `toggleSelection` and `groupBounds` (≈174–235);
     - `moveGroup` (≈770);
     - the header and body pointerdown handlers (≈1131, ≈1266);
     - group delete (≈3043).
   - The prototype wraps the loop with rAF `seek()`. That is exactly C's pitfall P7. **Do not reproduce it.**
   - `../docs/technical/ableton-live-current-workflow.md`: rows LOOP-01..06, CLP-06, CLP-08, EDT-03 and TRN-03.
   - `../tmp/studio-real-loop/c-baseline.md`: P5, P7, T5 and T7.
   - `../tmp/studio-real-loop/c-round-2.md` §5 and §9, and `c-round-2/scripts/vfc.js`. This is how C measures drift and seek-while-seeking.
3. Read the code you change: every file in §2.
4. Before editing, post the **pre-flight gate** at the top of your report. It must list:
   - your assumptions;
   - the smallest version you will build;
   - each file you will touch, with the reason;
   - the commands that prove success.

## 2. File ownership (exact; nothing else may change)

**Modify** (files you already own):

- `app/types/arrangement.ts`
- `app/lib/arrangement/model.ts`, `schedule.ts`, `transport.ts`, `video.ts`, `graph.client.ts` (only if needed)
- `app/lib/arrangement/__tests__/model.test.ts`, `schedule.test.ts`, `transport.test.ts`, `video.test.ts`, `graph.test.ts`
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementVideoDock.tsx`, `ArrangementExportDialog.tsx`, `index.ts`

**Create:**

| File | Responsibility |
| --- | --- |
| `app/lib/arrangement/loop.ts` | Pure, no DOM. Loop model ops (§4.2), the wrap position mapping (§4.4) and the per-iteration plan (§4.4). |
| `app/lib/arrangement/selection.ts` | Pure, no DOM. Selection ops, marquee hit test, group move bounds/move, group delete (§5.2). |
| `app/lib/arrangement/__tests__/loop.test.ts`, `__tests__/selection.test.ts` | §6 |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | The loop strip and brace below the ruler (§4.3). |
| `docs/implementation/2026/quarter-IV/012-studio-lab-loop-multiselect.md` | Written per `.claude/rules/implementation-docs.md` and `docs/implementation/TEMPLATE.md`, in Georgian. If 012 is already taken, use the next free number. |
| `../tmp/studio-real-loop/a-round-3.md` | Your report (§8). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

**Not changed this round:** `ArrangementLibrary.tsx`, `app/data/studio-lab-demo.ts`, `app/routes/studio-lab.tsx` (`createArrangement` supplies `loop: null`), `demo-synth.ts`, `peaks.ts`, `video.client.ts`.

**Read-only imports allowed:** `~/lib/sfx-edit` (`encodeSfxWav`), `~/lib/sfx-video.client` (`seekSfxVideo`), `~/components/ui`, `~/lib/utils`.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`.

**Forbidden to modify.** C checks these four by sha256; they are unchanged since round 1:
- `app/lib/__tests__/download-routes.test.ts`
- `app/routes/account.downloads.tsx`
- `app/routes/api.studio-token.ts`
- `app/routes/studio.$productId.tsx`

**Also forbidden:**
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`
- `root.tsx`, `app/styles/**`, `lib/sfx-*`
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`
- `package.json` and the lockfile; `.claude/**`; `../backend/**`
- user settings and env/config files

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, push or deploy.

You may edit an existing test **only** where this task changes its contract:
- `schedule.test.ts`: the fixture needs `loop: null`.
- `video.test.ts`: the `nextVideoSeekLead` tests are replaced (D-16).

In your report, name each changed test with a one-line reason.

## 3. Round-2 bug fixes

### 3.1 C-R2-01 (High): seek storm and drift → decision D-16

C's evidence:
- `ArrangementVideoDock.tsx:103–111` hard-seeks again while `video.seeking === true`.
- The learned lead (`nextVideoSeekLead`, `seekLeadRef`/`startLeadRef`, carried across Play cycles) overshoots by about 0.17–0.27 s.
- As a result, presented frames freeze for up to 800 ms. R3-V1 failed in 5 of 10 runs (max 0.127–0.149 s), and R2-V3 playback failed in 2 of 3 runs.

**D-16 (binding).** The audio clock stays the master. On each frame while playing, let `d = video.currentTime − targetMediaTime`.

1. **Never write `video.currentTime` while `video.seeking` is true or while one of our seeks is still pending.** A seek is pending until its `seeked` event, its abort, or a timeout. Never queue a second seek on top of a pending one: re-evaluate after `seeked`.
2. **Remove the learned lead.** Delete `nextVideoSeekLead`, `seekLeadRef`, `startLeadRef`, the probes, and any adaptive state that persists across seeks or Play cycles. A seek of a *running* element may aim ahead by one **constant** lead, `VIDEO_RUNNING_SEEK_LEAD_SECONDS`, in the range 0–0.15 s. You choose the value, document it and report it. Seeks of a paused element use no lead.
3. **Soft sync (newly authorised).** While playing, not seeking and with `0.02 < |d| ≤ 0.3 s`, set `video.playbackRate = videoRateCorrection(d)`. This is a pure function in `video.ts`, with these properties:
   - it returns exactly `1` for `|d| ≤ 0.02`;
   - it is monotone non-increasing in `d` (video ahead → slower);
   - it is clamped to **[0.85, 1.15]**.

   The rate returns to exactly `1` on pause, stop, seek, source change and unmount.
4. **When to hard-seek.** Hard seeks happen only:
   - on a discontinuity: source change, non-continuous clip boundary, fresh start, seek or ruler click, scrub reschedule, **loop wrap** (§4), or an edit or undo that moves the mapping by more than 0.08 s;
   - or when the steady-state `|d|` is above 0.3 s.

   Hard seeks are limited to one per 250 ms and are always subject to rule 1. `videoDriftAction` keeps its stopped behaviour. Its playing threshold now means "hard seek" and becomes 0.3 s. Update its test as a contract change.
5. **Keep the stopped behaviour.** While stopped, use `seekSfxVideo` with an abortable controller, exactly once per position change.

### 3.2 C-R2-02 (Low): the video starts before the audio

The dock currently calls `video.play()` as soon as `isPlaying` becomes true, which is before the audio's `startAt`. Under the C-R1-01 rule the transport position **holds at `from` until `startAt`**, and the video must hold too.

Required behaviour:
- Until the transport's audio start time, the video stays paused or seeked at the target frame.
- `play()` is issued at the audio start, or no more than one frame after it.

The mechanism is your choice. For example, the context could expose a monotonic "transport started" signal, or the dock could start once the anchored position has moved past the hold. Do not use a timer guess.

### 3.3 Fix acceptance (C)

**RF3-1 (C-R2-01).** Two layouts are measured:
- **R3-V1 layout:** video 0–6.008 and 8–12.008, plus music at 0.
- **R2-V3 layout:** trim 0.5, split at 3, Delete Time 1–2, plus Slow rise on SFX.

Runs:
- R3-V1: 10 runs in one page load, plus 5 runs with a reload before each.
- R2-V3: 3 runs in one page load, plus 2 runs with reload.

Measure every 250 ms with C's audio-clock harness. Exclude the 300 ms after a start, seek, clip boundary or loop wrap. **Every run** must meet all of the following:
- median `|d|` ≤ 0.05 s and max `|d|` ≤ 0.1 s;
- zero `currentTime` assignments while `seeking` (C's `vfc.js` log);
- no presented-frame (rVFC) gap over 250 ms outside the excluded windows;
- `playbackRate` always within [0.85, 1.15], and exactly 1 after Pause;
- `muted === true` at all times, and exactly one `<video>` element.

Starvation rule:
- C may re-run a failing run once, and at most 2 times in total, only when C shows main-thread starvation at the failing sample: a sample interval over 400 ms, or a rAF gap over 100 ms.
- Each re-run is reported.

Real-Chrome confirmation by the Tech Lead stays a recorded limitation. It does not block C's verdict.

**RF3-2 (C-R2-02).** Fresh load, first Play (the AudioContext is created on this click). The video's original sound is muted, and music plays at 0.
- While `ctx.currentTime < startAt`, `video.currentTime` stays within 0.04 s of the start mapping and does not advance.
- From Play to +300 ms, every sample has `|d|` ≤ 0.06 s.
- Repeat 3 times with a reload.

## 4. SRW-05: Loop (LOOP-01..06)

### 4.1 Model (D-17)

**Types.** In `types/arrangement.ts`:
- add `ArrangementLoop {start: number; end: number; enabled: boolean}`;
- add the required field `Arrangement.loop: ArrangementLoop | null`.

`createArrangement` returns `loop: null`. Because the loop is in the snapshot, undo and redo cover it (as in the prototype `editState`).

**Constant.** `MIN_LOOP_LENGTH = 0.1` s.

**Pure ops in `loop.ts`.** Each op returns the same object reference when nothing changes, so that no-ops are not recorded in history.
- `setLoopFromRange(arr, {start, end})`: creates or replaces the loop as `{start, end, enabled: true}`. Returns `null` if `end − start < MIN_LOOP_LENGTH`.
- `toggleLoop(arr)`: no-op when `loop === null`.
- `moveLoop(arr, start)`: keeps the length and clamps start ≥ 0.
- `resizeLoop(arr, 'start' | 'end', time)`: keeps length ≥ `MIN_LOOP_LENGTH` and start ≥ 0. There is **no 60 s cap** and no project-end cap.

**`deleteTime`** (in `model.ts`) also remaps the loop. Both start and end go through `remapTime`. If the remapped length is below `MIN_LOOP_LENGTH`, the loop becomes `null`, and the status adds: `Loop-ის დიაპაზონი წაშლის შემდეგ 0.1 წამზე მოკლე დარჩა, ამიტომ მოიხსნა.`

**History labels:**
- `Loop შეიქმნა`
- `Loop ჩანაცვლდა`
- `Loop ჩართვა`
- `Loop გამორთვა`
- `Loop-ის დიაპაზონი` (for a drag or a key step)

### 4.2 Commands

**Ctrl/Cmd+L and the transport button `↻ Loop`** (`aria-pressed = loop?.enabled === true`). The button is disabled when there is no range and no loop. The cases:

| State | Result | Status |
| --- | --- | --- |
| A range ≥ 0.1 s exists, and differs from the brace (or there is no brace) | The brace is set or replaced and enabled. **The range stays.** | `Loop შეიქმნა და ჩაირთო: a — b.` or `Loop ჩანაცვლდა ახალი მონაკვეთით: a — b.` |
| A range below 0.1 s | Nothing changes. | `Loop-ისთვის მონაკვეთი მინიმუმ 0.1 წამი უნდა იყოს.` |
| No range, but a brace exists | The loop is toggled. | `Loop ჩართულია.` or `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.` |
| Neither a range nor a brace | Nothing changes. | `Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.` |

**Transport readout.** Next to the button, show `Loop 00:02.000 — 00:04.000`, followed by ` · off` when the loop is disabled (`data-testid="arrangement-loop-times"`). When there is no brace, the readout is hidden.

Ctrl+L is ignored in typing targets and while the export dialog is open, like every other shortcut. Add `Ctrl+L` to the footer shortcut hint.

### 4.3 Brace UI (`ArrangementLoopBrace.tsx`)

**Placement.** The strip (`data-testid="arrangement-loop-strip"`) sits directly below the ruler, inside the sticky header, and is about 16 px tall. Its left edge aligns with the ruler's time 0.

**Brace.** `data-testid="arrangement-loop-brace"`. Its appearance:
- enabled: an accent-token fill with a solid border;
- disabled: a dashed muted border, labelled `Loop off`;
- tokens only, no new colours.

When there is no brace, the strip shows the hint `Loop: მონიშნე მონაკვეთი და დააჭირე ↻ Loop (Ctrl+L)`.

**Pointer.**
- Dragging the body moves the brace and keeps its length.
- Dragging an edge resizes it. Each edge has a hit area of at least 8 px inside the brace.
- Use pointer capture, a 3 px threshold, and seconds rounded to 1 ms.
- One gesture makes one history entry. A gesture that ends where it started makes **no** entry.
- Brace gestures never seek and never create a range.

**Keyboard.** The brace is focusable (`tabIndex=0`, `role="group"`). Its `aria-label` contains the times and the hint `← → გადაადგილება · Shift + ← → სიგრძე`.
- ←/→ moves the brace by 0.1 s.
- Shift+←/→ changes the end by 0.1 s.
- Each key press is one history entry.
- When an edge is blocked, the status is `Loop ვეღარ გადაიწევს: დროის დასაწყისი ან მინიმალური სიგრძე.` and there is no entry.
- The global clip-nudge must not fire while the brace has focus (extend the `isSliderTarget`-style guard).

**Visual separation.** The brace, the clip range overlay, the selected clip(s) and the playhead must stay distinguishable (CLP-07).

### 4.4 Playback (D-17)

**When wrapping applies.** Wrapping applies only when `loop.enabled` and the position at the time of the (re)schedule is `< loop.end − ε`.
- If Play, a seek or a scrub starts at or after `loop.end`, playback runs linearly with no jump and no wrap. This follows Ableton LOOP-06 and is a recorded ⚖ difference from the prototype, which jumped to the loop start.
- Pause and Play inside the loop resume there, and looping continues.

**Wrap mechanics** (fixes P7). When the timeline reaches `loop.end`, it continues at `loop.start`:
- Every source that reaches the loop end is scheduled with its `duration` truncated, so it ends exactly at the loop end.
- The next iteration's sources are created **ahead of time**: `start()` is called at least 100 ms before their `when`.
- They start at the same context time as the previous iteration ends: `when(k+1)` = end of iteration k, within 1 ms.
- A clip that straddles `loop.start` plays from `sourceOffset + (loop.start − clip.start)`.
- No rAF stop/restart happens at the wrap, and no source is doubled. Per clip, at most one source is sounding at any context time, apart from a ≤ 1-sample handover.
- Retired iterations are released.

**Clock.** `positionAt` still yields an unwrapped time. Map it to the timeline with a pure `loopTimelinePosition(unwrapped, loop)` in `loop.ts`. The playhead, the time display and the video target all use the mapped time.

**Project end.** While looping, playback does **not** stop at `projectEnd`. If `loop.end > projectEnd`, playback continues in silence until `loop.end`, then wraps.

**Live edits.** Edits made while looping all reschedule continuously, with no position jump and no doubled sources. This covers clip edits, Mute, Solo, Volume, a brace drag or key step, Loop Selection, and the toggle.
- Toggle off → playback continues linearly from the current mapped position.
- If an edit puts the position at or after the new `loop.end` → playback continues linearly (same rule as above).
- Delete Time while looping → C-R1-01 remap, then the loop rule is re-evaluated.

**Undo/Redo** of loop edits follows D-12: the playhead is not moved.

**Video.** At each wrap the target jumps. The dock treats the wrap as a discontinuity under D-16.

**Export.** Export is not affected by the loop: it renders 0..projectEnd as before. The export dialog adds the line `Loop ექსპორტს არ ცვლის — იქმნება მთელი პროექტი (00:00.000 — <end>).` Range export belongs to SRW-20.

## 5. SRW-06: Multi-select, marquee and group edits (D-18)

### 5.1 State and rules

**State.** The context exposes `selectedClipIds: readonly string[]`, ordered with the primary clip last. It keeps `selectedClipId` as the primary clip (or `null`) for existing consumers.
- The selection is **not** stored in history.
- After Undo/Redo, it is filtered down to the ids that still exist.
- Creating a time range (body drag) collapses the selection to that clip.

**Clicks.**
- **Ctrl/Cmd+click** on a clip header or body toggles that clip in the selection. It does not drag, seek, or create a range, and it clears any range.
- **Shift+click** adds the clip and never removes it. (Shift+arrow range extension, CLP-08, is not part of this round.)
- A plain click on a clip that is not selected selects only that clip, as in round 1.
- A plain header press on a member of a selection of 2 or more starts a **group move**.

**Ctrl/Cmd+A** selects every clip on every lane. It is ignored in typing targets and while the export dialog is open.

**Group move.**
- Every selected clip moves by the same delta, on its own lane; the video clip stays on the video lane.
- `sourceOffset` and duration are unchanged.
- If the delta would overlap a clip that is not selected, or push any member below 0, the group stops at the last valid delta. Compute this from `groupMoveBounds`.
- When it stops, the status reads `ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.`
- One history entry, labelled `გადატანა (N)`. A zero delta makes no entry.
- Moving a group while playing reschedules continuously, as in R1-B8.

**Group nudge.** ←/→ with 2 or more clips selected moves the whole group by 0.1 s. If the move is blocked, show the status and create no entry.

**Group delete.** With 2 or more clips selected, and **no range**, Delete removes only the selected clips. The gaps remain. The label is `კლიპების წაშლა (N)`. With a range, Delete Time is unchanged (D-09).

**Split with 2 or more clips selected** (Ctrl+E or ✂): nothing changes. The status reads `ჯგუფზე გაყოფა ჯერ არ არის — აირჩიე ერთი კლიპი.` Group split is SRW-07.

**Trim** on an edge of a group member trims only that clip, and the selection collapses to it.

**Visuals.** Every selected clip shows the brand ring and header. When N > 1, the footer shows `N კლიპი მონიშნულია` (`data-testid="arrangement-selection-count"`). The single-clip detail row stays as it was.

### 5.2 Marquee

**Starting a gesture.** A `pointerdown` on empty lane background (not on a clip) begins a gesture.
- If the pointer moves less than 4 px, it is a **click**. Round-1 behaviour applies: set the active lane, clear the selection and range, and seek (CLP-06).
- At 4 px or more it becomes a **marquee**.

**Marquee behaviour.**
- A rectangle is drawn in the timeline (`data-testid="arrangement-marquee"`) and may span several lanes.
- On every move, the selection becomes every clip whose time span overlaps the rectangle's time span (open interval) and whose lane row overlaps the rectangle's vertical extent.
- Ctrl/Cmd held at `pointerdown` makes the result a **union** with the selection that existed when the gesture started.
- A marquee never seeks, never moves the playhead (including while playing), never creates a range and never writes history. On release the rectangle disappears and the selection remains.
- Auto-scroll at the viewport edge is not required this round. State that in the report.

**Pure functions in `selection.ts`:**
- `toggleInSelection(ids, id, mode: 'toggle' | 'add')`
- `clipsInMarquee(arrangement, trackOrder, {t0, t1, firstTrack, lastTrack})`
- `groupMoveBounds(arrangement, ids)` → `{minDelta, maxDelta}`
- `moveClips(arrangement, ids, delta)` → `Arrangement | null`
- `deleteClips(arrangement, ids)`

## 6. Required tests (behavioural, named)

**`loop.test.ts`:**
- Create from range; replace a different range; toggle keeps start and end; toggle on `null` is a no-op returning the same reference.
- `moveLoop` keeps the length and clamps at 0.
- `resizeLoop` enforces the 0.1 s minimum and has no 60 s cap.
- `deleteTime` before, across and covering the loop:
  - shifted;
  - shrunk;
  - removed when below 0.1.
- `loopTimelinePosition`:
  - before the end → identity;
  - at the end → `loop.start`;
  - after 2.5 iterations → the correct position;
  - with a start after the end → linear.
- The iteration plan:
  - a clip straddling the end is truncated at the end;
  - a clip straddling the start gets the correct `sourceOffset`;
  - iteration k+1 `when` equals the end of iteration k;
  - a clip fully outside the loop is not planned in iterations ≥ 1.

**`selection.test.ts`:**
- Toggle adds and removes; Shift-add never removes.
- Marquee hit test:
  - partial time overlap is selected;
  - touching an edge only is not selected;
  - lanes outside the vertical extent are excluded;
  - union mode.
- `groupMoveBounds` with neighbours on two lanes, and against 0.
- `moveClips`:
  - preserves relative starts and offsets;
  - returns `null` when blocked.
- `deleteClips` keeps the other clips untouched.

**`video.test.ts`:**
- `videoRateCorrection`: exactly 1 inside the dead band; monotone; clamped to [0.85, 1.15]; symmetric sign.
- `videoDriftAction` with the new 0.3 s playing threshold.
- The removed `nextVideoSeekLead` tests are named in your report.

**`transport.test.ts` / `schedule.test.ts`:**
- A continuous reschedule while looping keeps the mapped position continuous.
- Toggle-off handoff has no jump.

**`model.test.ts`:**
- `createArrangement` has `loop: null`.
- Undo/redo restores the loop exactly.

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts app/routes/studio-lab.tsx
npx biome check ./app
npm run build
git status --short
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**The `/check` rule is unchanged:**
- Use `--write` only on paths you own.
- Run `npm.cmd run check` only if the read-only `npx biome check ./app` shows no format or safe-fix diffs outside your files. Re-run the hash check afterwards.
- Never run `npm run format`.

**Dev server and browser.**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse`, with the state file `../tmp/studio-real-loop/a-browse.json`.
- Media fixtures are in `../tmp/studio-real-loop/media/`. Their sha256 values are in `SHA256SUMS.txt`.
- Prefer **real** `$B press` keys and audio-clock-based measurement for at least the sync and loop smokes. In round 2, rAF text sampling hid C-R2-01.

**Review.** Invoke the actual `code-reviewer` subagent, fix its findings, and quote its summary.

## 8. Report `../tmp/studio-real-loop/a-round-3.md`

The report contains:
1. The pre-flight gate.
2. The files actually changed. They must be a subset of §2.
3. Verbatim command tails.
4. The changed tests, each with its reason.
5. The code-reviewer findings and your fixes.
6. The chosen `VIDEO_RUNNING_SEEK_LEAD_SECONDS` and the `videoRateCorrection` gain.
7. Your own drift measurements: method, number of runs, and the worst run.
8. The loop wrap measurement: method and result.
9. Deviations, each with a reason.
10. **The "not ready" acceptance IDs.**

Do not claim PASS.

## 9. What C will verify

**Fixes:** RF3-1 and RF3-2 (§3.3).

**SRW-05 (Loop)**

- **R5-L1.** Range 2–4 → Ctrl+L, then range 6–8 → Ctrl+L, then Undo.
  - Expected: exactly one brace, first 2–4 then replaced by 6–8, with the status `Loop ჩანაცვლდა…`. Undo → 2–4. Redo → 6–8.
  - Ctrl+L with no range toggles. A range below 0.1 s is refused. The button's `aria-pressed` matches.
- **R5-L2.** Toggle off/on.
  - Expected: the brace stays. Off = dashed and `Loop off`, with ` · off` in the readout. On = the same start and end.
- **R5-L3.** Loop 2–4, with music at 0 and Soft impact at 3. Play from 1.0 and let it wrap 3 times. C patches `AudioBufferSourceNode.start/stop`.
  - For each iteration: one source per clip that intersects [2, 4]. `start()` is called ≥ 100 ms before its `when`. `when(k+1)` = previous stop, within 1 ms.
  - Master tap: no 5 ms window below −60 dBFS around the wraps while music is under them. At most one sounding source per clip.
  - The playhead and time readout stay within [2, 4] after the first wrap.
  - Separately, a brace whose end lies 2 s past `projectEnd` keeps wrapping: silence until `loop.end`, then the wrap. Playback does not stop at `projectEnd`.
- **R5-L4.** Brace edge drag +1 s, then body drag +2 s, then focused ←/→ and Shift+→.
  - Expected: the edge changes the length; the body keeps it; keys step 0.1.
  - Each gesture or key press = one history entry. A no-op = no entry. No seek and no range.
- **R5-L5.** D-17 rules:
  - Play from 6 with loop 2–4 → linear, with no jump.
  - Toggle off while looping → continues from the current mapped position with no jump (≤ 20 ms step) and no doubled sources.
  - Drag the brace while playing → continuous.
  - Delete Time 1–2 → brace 1–3 (unit and browser). A Delete Time that covers the loop → loop removed, and the status says so.
  - Space ×10 inside the loop → no doubled sources.
- **R5-L6.** Video 0–6.008 with loop 2–4.
  - After every wrap, outside the 300 ms exclusion: drift within the RF3-1 thresholds.
  - No `currentTime` assignment while `seeking`.
- **R5-E1.** With the loop on, export.
  - Expected: the WAV is 0..projectEnd and equal to the loop-off export (≤ 2⁻²²). The dialog shows the loop line.
- **R5-U1.** `loop.test.ts` and the updated transport/schedule tests (C reads the names and re-runs them).

**SRW-06 (multi-select)**

- **R6-S1.** Ctrl+click 3 clips on 2 lanes, then Shift+click a 4th.
  - Expected: the count reads `4 კლიპი მონიშნულია` and all 4 show the ring.
  - Ctrl+click a member removes it. Shift+click a member keeps it.
  - None of these clicks seeks or creates a range.
- **R6-S2.** A marquee from empty space over parts of clips on 3 lanes (video, music, SFX).
  - Expected: the intersected clips are selected, and a clip touched only at its edge is not.
  - Ctrl+marquee unions with the existing selection.
  - A click below 4 px still seeks and clears the selection (CLP-06).
  - A marquee while playing: the playhead keeps advancing (no jump) and no source is restarted.
- **R6-S3.** Group header drag (+2 s) and group ←/→.
  - Expected: relative starts and `sourceOffset`s are preserved, including the video clip's media mapping.
  - Dragging against a neighbour on one lane stops the whole group at the last valid delta, with the message.
  - One Undo restores everything. While playing, the moved clips are heard at their new times (export oracle optional).
- **R6-S4.** Delete with a group and no range.
  - Expected: only the selected clips are removed and nothing else moves. The label reads `კლიპების წაშლა (N)`.
  - With a range, Delete Time is unchanged.
- **R6-S5.** Further checks:
  - Ctrl+A selects every clip.
  - After Undo of an add, the selection excludes the removed clip.
  - Ctrl+E with 2 or more selected → refusal status, history unchanged.
  - Trimming a member collapses the selection to that clip.
  - Ctrl+A inside a text input does nothing.
- **R6-U1.** `selection.test.ts`.

**Gates and regression**

- **G3-1.** tsc 0; vitest ≥ 557 + new, with 0 failures; build passes; biome reports 0 errors.
- **G3-2.** The protected hashes match. `git status` shows only §2 files plus the pre-existing ones.
- **G3-3.** Anonymous `/studio-lab` makes no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, contacts no R2 host and sends no Authorization header. The only media are the 2 demo MP3s and `blob:` URLs. Anonymous `/api/studio-token` still returns 401.
- **G3-R.** Regression re-run, with a loop brace present (disabled) and 2 clips selected where relevant: R2-V1, R2-V2 (wav and pdf), R3-V2, R3-V3, R3-V4, R4-P1, R4-P2, R4-P3, R1-B5, R1-B12, R1-E1, R1-E5.
- **G3-shots.** Screenshots at 1440×900 and 1280×720 with a brace, a marquee in progress or a 3-clip selection, and the video dock visible. Nothing overlaps or is clipped, and the brace, range, selection and playhead are distinguishable.
