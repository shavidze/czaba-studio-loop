# A — Round 3 report (C-R2-01/02, SRW-05 Loop, SRW-06 multi-select)

Implementer: A (Claude Opus 5.5). Date: 2026-10-07. No commit/push/deploy. Dev server :5173 reused (not started/stopped). Browser: gstack `/browse` with `BROWSE_STATE_FILE=tmp/studio-real-loop/a-browse.json`. Advisor consulted once before editing (design confirmed; I deviated on gain — see §6).

**I do not claim PASS.** See §10 for the not-ready IDs.

## 0. Pre-flight gate (posted before editing)

**Assumptions**
- D-16: the audio clock stays master. The dock gets:
  - a pending-seek guard: our seek is pending until `seeked`, `abort`, `emptied` or a 1 s timeout, and `currentTime` is never written while `video.seeking` or a seek is pending;
  - a constant running-seek lead, with no learned state;
  - soft sync via `playbackRate = videoRateCorrection(d)` for 0.02 < |d| ≤ 0.3.
- Hard seeks happen only:
  - on a discontinuity: a source change, a non-continuous clip change, or a target jump of more than 0.08 s that elapsed time does not explain (this covers a seek, the ruler, a scrub, a loop wrap, an edit and an undo);
  - or when |d| > 0.3.
  They are limited to one per 250 ms.
- C-R2-02: the context exposes `isTransportRunning`. The rAF tick sets it once `ctx.currentTime ≥ anchor.holdUntil`. Until then the video stays paused at the start mapping. No timers.
- D-17: `Arrangement.loop` is part of the snapshot. Wrapping is decided per (re)schedule: it applies only if the loop is enabled and `from < loop.end − ε`.
  - Iteration 0 covers `from..end`; each later iteration covers `start..end`. Sources are truncated at `end`.
  - Each iteration is pre-created ≥ 0.5 s ahead on the same track gains (`ScheduleHandle.appendPlan`). There is no stop/restart at the wrap.
  - `positionAt` stays unwrapped; `loopTimelinePosition` maps it.
- D-18: the selection (`selectedClipIds`, primary last) lives outside history. The empty-lane gesture moves from `ArrangementLane` up to `StudioWorkspace`, because the marquee spans lanes. A move under 4 px is the old click (active lane, clear, seek on release); 4 px or more is a marquee.

**Smallest version**
- New pure modules: `loop.ts` and `selection.ts`, plus their tests.
- One new component: `ArrangementLoopBrace.tsx`.
- Context: loop scheduling, loop commands, selection, group edits.
- A rewrite of the dock's playing branch.
- Cut list: no marquee auto-scroll, no Shift+arrow range extension, no group split, no duplicate, no loop export.

**Files to touch** (all in task §2):
- `types/arrangement.ts`
- `lib/arrangement/{model,video,graph.client}.ts`
- new `loop.ts` and `selection.ts`
- `contexts/ArrangementContext.tsx`
- `components/arrangement/{StudioWorkspace,ArrangementTransport,ArrangementLane,ArrangementClip,ArrangementVideoDock,ArrangementExportDialog,index}.tsx/ts`
- new `ArrangementLoopBrace.tsx`
- tests
- implementation doc 012

**Success commands**
- `npx vitest run` (≥ 557 + new, 0 failures), `npx tsc --noEmit` = 0.
- Biome on owned paths: 0 errors. `npm run build` OK. The 4 protected hashes are OK.
- C's browser harness for drift and loop wraps.

## 1. Files actually changed (subset of §2)

**Modified:**
- `app/types/arrangement.ts`
- `app/lib/arrangement/model.ts`, `video.ts`, `graph.client.ts`
- `app/lib/arrangement/__tests__/model.test.ts`, `schedule.test.ts`, `transport.test.ts`, `video.test.ts`, `graph.test.ts`
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementVideoDock.tsx`, `ArrangementExportDialog.tsx`, `index.ts`

**Created:**
- `app/lib/arrangement/loop.ts`, `selection.ts`
- `app/lib/arrangement/__tests__/loop.test.ts`, `selection.test.ts`
- `app/components/arrangement/ArrangementLoopBrace.tsx`
- `docs/implementation/2026/quarter-IV/012-studio-lab-loop-multiselect.md`
- `tmp/studio-real-loop/a-round-3.md` (this report), `a-browse.json` (browse state)

**Not touched:**
- `ArrangementRuler.tsx`: not needed, because the brace has its own strip below the ruler.
- `ArrangementLibrary.tsx`, `studio-lab-demo.ts`, `studio-lab.tsx`, `demo-synth.ts`, `peaks.ts`, `video.client.ts`.
- All protected and forbidden files.

My throw-away browser probe scripts live in the system temp dir (`%TEMP%\a_*.js`), not in the repo or in `tmp/`. C's scripts under `c-round-2/scripts/` were only executed, never edited.

## 2. Command tails (verbatim)

`npx vitest run app/lib/arrangement`
```
 ✓ app/lib/arrangement/__tests__/loop.test.ts (24 tests) 10ms
 ✓ app/lib/arrangement/__tests__/model.test.ts (38 tests) 13ms
 ✓ app/lib/arrangement/__tests__/transport.test.ts (10 tests) 15ms
 ✓ app/lib/arrangement/__tests__/video.test.ts (27 tests) 24ms
 ✓ app/lib/arrangement/__tests__/peaks.test.ts (3 tests) 8ms
 ✓ app/lib/arrangement/__tests__/schedule.test.ts (12 tests) 6ms
 ✓ app/lib/arrangement/__tests__/selection.test.ts (13 tests) 7ms
 ✓ app/lib/arrangement/__tests__/graph.test.ts (13 tests) 8ms

 Test Files  8 passed (8)
      Tests  140 passed (140)
```
`npx vitest run`
```
 Test Files  40 passed (40)
      Tests  604 passed (604)
```
`npx tsc --noEmit` → no output, `TSC_EXIT=0`.

Biome on the owned paths (`app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts app/routes/studio-lab.tsx`):
```
Checked 32 files in 49ms. No fixes applied.
```
`npx biome check ./app` (read-only):
```
Checked 295 files in 266ms. No fixes applied.
Found 218 warnings.
Found 1 info.
```
That is 0 errors; the warnings are pre-existing, outside my paths. I applied `--write` only on my owned paths. I did not run `npm.cmd run check`, because the scoped write was sufficient and I did not want to touch other owners' files.

`npm run build`
```
build/server/index.js                    1,066.69 kB
✓ built in 5.17s
```
`git status --short`
```
 M app/lib/__tests__/download-routes.test.ts
 M app/routes/account.downloads.tsx
 M app/routes/api.studio-token.ts
 M app/routes/studio.$productId.tsx
?? .agents/
?? .claude/agents/ableton-arrangement-expert.md
?? .codex/
?? AGENTS.md
?? app/components/arrangement/
?? app/contexts/ArrangementContext.tsx
?? app/data/studio-lab-demo.ts
?? app/lib/arrangement/
?? app/routes/studio-lab.tsx
?? app/types/arrangement.ts
?? docs/implementation/2026/quarter-IV/010-studio-lab-arrangement-core.md
?? docs/implementation/2026/quarter-IV/011-studio-lab-video-transport.md
?? docs/implementation/2026/quarter-IV/012-studio-lab-loop-multiselect.md
```
The four ` M` protected files are pre-existing changes by the other agent. Their hashes are unchanged:
```
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
```

## 3. Changed existing tests (contract changes only)

- `schedule.test.ts`: the literal fixture gets `loop: null`, because `Arrangement.loop` is now required.
- `video.test.ts`:
  - **Removed:** `nextVideoSeekLead › moves the lead half-way towards the observed lag and clamps it` and `nextVideoSeekLead › ignores outliers such as decoder stalls`. The learned lead was removed by D-16.
  - **Changed:** `videoDriftAction › seeks while playing only above 80 ms` became `hard-seeks while playing only above 0.3 s (soft sync handles the rest)`. This is the D-16 threshold change.
  - **Added:** `videoRateCorrection` ×5 (dead band, symmetric sign, monotone, 0.05 steps, clamp [0.85, 1.15]) and `isVideoTargetJump` ×2.
- `model.test.ts`: added only (`createArrangement starts without a loop`, `undo and redo restore the loop exactly`).
- `transport.test.ts`: added only (`a continuous reschedule while looping keeps the mapped position continuous`, `toggle-off hands off at the mapped position with no jump, then runs linearly`).
- `graph.test.ts`: added only (`appendPlan schedules a loop iteration on the same track gains and releases ended sources`).
- **New:** `loop.test.ts` (24 tests) and `selection.test.ts` (13 tests). Their names follow task §6.

## 4. Code-reviewer findings and fixes

I ran the actual `code-reviewer` subagent on all round-3 files. Its summary, quoted: *"Core logic is sound — loop wrap scheduling follows D-17 (lookahead `appendPlan`, truncation at `loop.end`, old handle `stop(startAt)` at handoff, no rAF stop/restart), D-16 rules are implemented as written (seeking/pending guard, constant lead, soft sync via `playbackRate`, `play()` gated on `isTransportRunning`), and multi-select matches §5. One real High audio bug (loop iteration burst after a stall/hidden tab) and one High acceptance risk (0.15 s lead). … Score: 7/10."*

| # | Finding | Action |
| --- | --- | --- |
| H1 | `fillLoopIterations` would append every missed iteration at once after a stall or hidden tab (a `start()` in the past, so many copies sounding together) | **Fixed.** If the next iteration cannot be created ≥ 20 ms before its `when`, the tick does one continuous re-anchor instead (`syncPlayback(present, undefined, true)`, mapped through the active loop). **Browser check:** a 3 s main-thread block while looping 2–4 led to 0 late `start()`s and one re-anchor at offset 2.161; the next iteration was created 0.484 s ahead. While the tab is hidden, audio still goes silent after the 0.5 s horizon (documented gap). |
| H2 | A lead of 0.15 may overshoot with fast seeks | **Kept, with data.** In this environment running seeks took 0.28–0.72 s, so 0.15 always lands behind, never ahead. C should re-check on its machine. |
| M3 | Rate chatter (1 / 0.9 / 0.85) | Kept and documented. Rate writes now happen only on a step change. |
| M4 | `play()` can be up to about 2 frames late | Confirmed by measurement (22–30 ms). Listed under RF3-2 "not ready". |
| M5 | A partly blocked key step (for example start 0.05 → 0) still writes an entry | Kept, as an interpretation: only a fully blocked step is "blocked" (status, no entry). |
| M6 | Toggle off inside the silence past `projectEnd` → stop snapped back to `projectEnd` | **Fixed.** The stop now stays at the live position when it is more than 50 ms past the end. |
| L7 | `biome-ignore` comments | Listed in deviations §9.1. |
| L8 | `left-56` | Kept: it is the same existing pattern as `ArrangementLane`. |
| L9 | Rate reset delayed on source change | Kept: `load()` resets the rate, and every hard seek resets it explicitly. |
| L10 | Preroll compares against a 50 ms stale target | Kept: preroll is a seek target, not a soft-sync target. |
| L11 | Seek target not clamped to the clip out-point | **Fixed.** It is clamped to `min(duration, inPoint + length) − 1/30`. |
| L12 | Brace `pointercancel` commits | Kept: same behaviour as the clip gestures. |
| L13 | Refs written during render | Existing pattern; kept. |
| L14, L16 | `loopTimelinePosition` third arg; Ctrl+L with range == brace toggles | Listed in deviations. |
| L15, L17 | Double sync; disabled-brace move reschedules | Harmless (key-guarded and continuous); kept. |
| L18 | The union test was tautological | **Fixed.** A pure `unionSelection` helper is now used by the marquee and tested. |
| L19 | The marquee anchor is in client coordinates while scrolling | Documented in known gaps (auto-scroll is out of scope). |
| L20 | Float accumulation in `moveLoop` end | **Fixed.** The end is rounded to 1e-6. |

Gates re-run after the fixes:
- vitest: 40 files, 604 passed;
- tsc: exit 0;
- Biome on owned paths: `Checked 32 files … No fixes applied.`;
- `./app`: 0 errors, 218 pre-existing warnings;
- build: `✓ built in 4.26s`;
- hashes: 4× OK.

## 5. Constants

- `VIDEO_RUNNING_SEEK_LEAD_SECONDS = 0.15` s (the maximum allowed). Measured headless running seeks take 0.28–0.72 s (`seeking` → `seeked`), so even 0.15 lands behind. Paused seeks use no lead.
- `videoRateCorrection(d)`:
  - returns 1 for |d| ≤ 0.02;
  - otherwise returns `1 − sign(d)·max(1, round(|4·d| / 0.05))·0.05`, clamped to [0.85, 1.15];
  - so the gain is **4**, quantised to 0.05 steps, and the clamp is reached at |d| ≥ 0.0375.
  - The quantisation keeps the element from being re-rated every frame. The rate is reset to exactly 1 on pause/stop (`!running` branch), before every hard seek, on source change (the `load()` reset plus an explicit reset) and on unmount.
- Other constants:
  - hard-seek threshold (`VIDEO_DRIFT_PLAYING_SECONDS`) = 0.3;
  - discontinuity jump = 0.08;
  - pending-seek timeout = 1 s;
  - hard-seek interval = 250 ms.

## 6. Drift measurements (own)

**Method.** I ran C's harness unchanged (`c-round-2/scripts/setup-base.js`, `ext.js`, `vfc.js`, `r3setup.js`, `r3v1.js`) in my browse daemon:
- R3-V1 layout: video 0–6.008 and 8–12.008, music at 0;
- audio-clock positions, sampled every 250 ms;
- 300 ms exclusions per `r3v1.js`;
- `vfc.js` set log for currentTime-while-seeking.

I paused between runs, because `r3v1.js` needs a stopped transport.

**Final code** (gain 4, lead 0.15, live target):

| Batch | Runs | Result |
| --- | --- | --- |
| Same page load (gain 3, lead 0.1, live target — the earlier build) | h1–h6 | h2–h6 pass: median 0.029–0.034, max 0.064–0.095. **h1 fails** (max 1.09): the video froze for about 1.6 s with no `seeking` and no events (decoder stall). |
| Fresh load each (final constants) | q1–q4 | q2–q4 pass: median 0.027–0.034, max 0.054–0.067. **q1 fails**: max 0.33 near the end of clip 1, interval max 356 ms. |
| Earlier fresh-load batches | k1–k4 | k2 fails: median 0.15, seeks took 0.3–0.72 s. |

- **currentTime written while `seeking`:** 0 in every run I logged.
- **Rate:** `playbackRate` is always within [0.85, 1.15] and 1 after Pause (logged with a setter spy).
- **Muted / elements:** `muted` is always true; there is exactly one `<video>`.

**Worst run:** k2 (median 0.15, max 0.63).

**Environment.** CPU load was **90%** during measurement (`Win32_Processor.LoadPercentage`), caused by other desktop processes.

**Diagnostic.** With `playbackRate` writes blocked in-page, all 3 fresh runs failed (median 0.076–0.137). So soft sync is what keeps the passing runs inside the tolerance.

**R2-V3 layout:** not measured by me (time). It is listed as not ready.

**RF3-2:** 3 fresh loads, with a `play()` spy recording ctx time:
- During the fresh AudioContext spin-up (ctx frozen 200–450 ms), the video stays at 0.000 and paused. Hold: OK.
- `play()` is issued 22–30 ms (ctx) after the audio `startAt`. That is about 1.5 frames, **not ≤ 1 frame**.
- From Play to +300 ms, |d| reaches 0.055–0.096. This **fails the ≤ 0.06 limit**: the headless decoder ramps slowly after `play()`.

## 7. Loop wrap measurement

**Method.** Loop brace 2.025–4.025, created by a real range drag and Ctrl+L. Play from 1.0 for 7.6 s, i.e. 3 wraps. I recorded C's `AudioBufferSourceNode.start/stop` patch, relative to the first `when`.

```
starts [at, when, offset, duration, bufferLen]
[-0.05, 0,     1,     3.025, 6]      iteration 0, video-lane audio
[-0.05, 0,     1,     3.025, 101.35] iteration 0, music
[2.5313,3.025, 2.025, 2,     6]      iteration 1  (start() 0.494 s before when)
[2.542, 3.025, 2.025, 2,     101.35]
[4.542, 5.025, 2.025, 2, …] ×2       iteration 2  (0.483 s ahead)
[6.5313,7.025, 2.025, 2, …] ×2       iteration 3  (0.494 s ahead)
stops at Pause: 2
```

**Audio:**
- `when(k+1)` equals the end of iteration k exactly (0 + 3.025 = 3.025; +2 = 5.025; +2 = 7.025).
- There is one source per clip per iteration, and `offset` equals the loop start for clips that straddle it.
- No rAF restart happens.
- The readout stays inside [2.025, 4.025] after the first wrap.
- Master-tap continuity (5 ms windows) was not measured by me.

**Video:** in this run, under the same load, the video stalled from 1.1 s onward, before the first wrap. Each wrap seek waited for the pending seek and took 0.3–1 s. No write happened while seeking. R5-L6 is **not met** in my environment.

## 8. Browser functional smoke (synthetic pointer + `C.key`, own daemon)

**R5-L1/L2/L4:**
- The button is disabled with no range and no loop. Ctrl+L with neither gives the status `Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.`
- Range 2–4 + Ctrl+L gives `Loop შეიქმნა და ჩაირთო: 00:02.025 — 00:04.025.`, with `aria-pressed=true` and the readout `Loop 00:02.025 — 00:04.025`.
- Range 6–8 + Ctrl+L gives `Loop ჩანაცვლდა ახალი მონაკვეთით…`, exactly 1 brace, and Undo label `Loop ჩანაცვლდა`. Undo goes back to 2–4; Redo goes to 6–8.
- Toggle off gives `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.`, the readout `… · off`, a dashed brace and `Loop off`. Toggle on restores the same range.
- Edge drag +1 s gives 6.025–9.025. A body drag of +2 s gives 8.025–11.025 (same length). Each gesture is one history entry (`Loop-ის დიაპაზონი`). There is no seek and no range.
- A 1 px drag (below the threshold) does nothing.
- Focused →, ←, Shift+→ step by 0.1. The `aria-label` contains the hint, `role=group`, `tabIndex=0`.
- The "< 0.1 s range" probe could not create a range at 40 px/s (below the 3 px drag threshold), so the refusal path is unit-tested only.

**R6:**
- Ctrl+click ×3 on 2 lanes plus Shift+click gives `4 კლიპი მონიშნულია` and 4 rings, with no seek, no range and no history entry.
- Ctrl+click on a member drops to 3. Shift+click on a member keeps 3.
- Ctrl+E gives the refusal status and no history change.
- A group header drag of +2 s moves all members by +2.000 and the music (not selected) by 0, with Undo label `გადატანა (3)`.
- → nudges the group. Two Undos restore the exact starts.
- Delete removes 3 clips, labelled `კლიპების წაშლა (3)`. The others do not move.
- Ctrl+A selects all 4.
- A marquee from the SFX lane at 8.5 s to the video lane at 4.5 s:
  - the rectangle is shown;
  - it selects video ×2 and music, and the SFX clip at 20 s stays unselected;
  - the playhead does not move;
  - the rectangle is removed on release.
- A < 4 px click on the SFX lane seeks to 15.000 and clears the selection.

**R6-S5 (browser):**
- Adding a clip, then Ctrl+A (4 selected), then Undo of the add leaves 3 rings and the count `3 კლიპი მონიშნულია`. The removed id is filtered out.
- Trimming the right edge of a member of a 3-clip selection collapses the selection to 1 clip, with Undo label `Trim — მარჯვენა კიდე`.
- Ctrl+A dispatched on a focused text input leaves the selection unchanged. This probe is weak, because the selection was already "all"; the code path is the existing `isTypingTarget` guard.

**R5-L5 Delete Time (browser):**
- Brace 2.025–4.025 (off), then a range 1.025–2.025 and Delete. The brace becomes 1.025–3.025.
- My probe for "Delete Time covering the loop" was clamped by the clip-local range: after the first delete the music clip was split at 1.025. So the removal path plus its status text is unit-tested only (`deleteTime remaps the loop › removes a loop that becomes shorter than 0.1 s`). The context appends `LOOP_REMOVED_MESSAGE` when `before.loop !== null && after.loop === null`.

**R5-L5 (partial, browser):**
- Play from 6 with loop 2.025–4.025 runs linearly: the readout shows 7.371 after about 1.5 s. 3 sources start, with no wrap.
- Play from 3, then Ctrl+L with no range after 1.6 s (toggle off while looping):
  - status `Loop გამორთულია; დიაპაზონი შენარჩუნებულია.`;
  - playback continues linearly to 5.059, past the brace end;
  - the per-frame readout step stays between +0.019 and +0.080 s. It never goes backwards. The 0.08 s step is a slow frame under load; I did not measure it in audio time, so the ≤ 20 ms audio-step criterion is still for C.
  - Sources: 7 new in total, and the retired graph made 2 stops at the handoff.

**Visual check** (1280×720 screenshots, kept in system temp):
- The brace (its own strip), the range (grey overlay plus tag), the selection rings (teal) and the playhead (amber line) are distinguishable.
- The root cookie banner still covers the footer until it is accepted. That is a pre-existing root issue, not my file.

## 9. Deviations (with reasons)

1. **`biome-ignore` ×2 in `ArrangementLoopBrace.tsx`** (`useSemanticElements`, `noNoninteractiveTabindex`), each with a reason. The task requires a focusable `role="group"` brace, and Biome rejects both on a `div`. A `fieldset` still fails `noNoninteractiveTabindex`. These are the only two tool directives; there are no explanatory comments.
2. **Ctrl+L with a range equal to the existing brace toggles.** The spec table covers only "differs from the brace". This is my interpretation; Ableton toggles in the same situation.
3. **Rate quantisation (0.05 steps).** It is still pure, monotone, symmetric and clamped, and exactly 1 inside ±0.02.
4. **The live target uses `getLivePosition()`** (a new context getter) instead of the rendered `position`. Measured render lag was up to 250 ms, and it caused false "jumps" and seek cascades.
5. **The empty-lane click now seeks on `pointerup`, not on `pointerdown`.** This is needed to tell a click from a 4 px marquee. C's `clickLane` dispatches down and up, so it is unaffected.
6. **Brace drag preview while playing** reschedules at most once per 100 ms, using the scrub limiter, plus once at release.
7. **`GROUP_MOVE_BLOCKED_MESSAGE`** is exported from `selection.ts` so the context and the clip share one string.
8. **`loopTimelinePosition(unwrapped, loop, scheduledFrom)`** has a third argument, so the "start after the end → linear" rule is a pure, tested function.
9. **A partly blocked brace key step** (clamped at 0 or at the minimum length) still writes one entry. Only a fully blocked step shows the status and writes no entry.
10. **A stall of the loop lookahead triggers a re-anchor**, not catch-up scheduling. This is the review fix for H1.

## 10. Not ready (C should fail these, B carries them over)

- **RF3-1:** my runs are not 15/15 in this environment. Same-load runs were 5/6, fresh-load runs 3/4 on the final constants, and some earlier fresh-load runs failed. The R2-V3 layout was not measured.
- **RF3-2:**
  - `play()` lands 22–30 ms after `startAt`, which is more than 1 frame;
  - |d| reaches 0.055–0.096 in the first 300 ms, over the 0.06 limit.
- **R5-L6:** video across wraps. Wrap seeks take 0.3–1 s headless, so drift after the 300 ms exclusion exceeds 0.1.
- **R5-L3 (partly):** the start/when/continuity parts pass in my log. Master-tap ≤ −60 dBFS windows and the "brace 2 s past projectEnd" case were not measured by me. C must verify.
- **R5-L5 / R5-E1 / R6-S2 (playing marquee) / R6-S3 (heard while playing):** implemented, but I did not measure them in the browser. Unit coverage only, for the continuity and toggle-off handoff.
- **G3-R / G3-3 / G3-shots:** not re-run by me. Saved screenshots are not part of my owned files.

## 11. Known gaps

- There is no marquee auto-scroll at the viewport edge (not required this round).
- Loop iterations are refilled from the rAF tick with a 0.5 s horizon. If rAF stops (a hidden tab), iterations beyond the horizon are not scheduled until rAF resumes.
- A 0.1 s brace at 40 px/s is 4 px wide, so both 8 px edge zones overlap it and the body cannot be grabbed. Zoom in, or use the keys.

## 12. Exact next C checks

1. RF3-1 and RF3-2 with C's harness: 15 + 5 runs, including reloads. Record the CPU load next to each run, because headless VP9 decode stalls drove every failure I saw.
2. R5-L3: a master tap around the wraps (music under 2–4), and a brace whose end is 2 s past `projectEnd`.
3. R5-L5:
   - play from 6 with the loop 2–4 → linear;
   - toggle off while looping (≤ 20 ms step);
   - brace drag while playing;
   - Delete Time 1–2 → brace 1–3;
   - a Delete Time that covers the loop → the status contains `Loop-ის დიაპაზონი წაშლის შემდეგ 0.1 წამზე მოკლე დარჩა, ამიტომ მოიხსნა.`;
   - Space ×10.
4. R5-E1: export with the loop on equals the loop-off export. Check the dialog line `Loop ექსპორტს არ ცვლის — იქმნება მთელი პროექტი (00:00.000 — …).`
5. R6-S2: a marquee while playing (no restarts, no jump). R6-S5: Undo of an add filters the selection; trim on a member collapses it; Ctrl+A inside a text input does nothing.
6. G3-R regression list, with a disabled brace and 2 clips selected.
