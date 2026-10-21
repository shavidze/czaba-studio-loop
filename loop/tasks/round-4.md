# CURRENT TASK — Round 4: video-sync rework (D-19) + round-3 bugs, then Studio Lab entry, scrollbars, library tree with demo stems, and library panel

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-07
Previous task: `tmp/studio-real-loop/tasks/round-3.md`. C's verdict: **FAIL 18/21** (`c-round-3.md`, `c-round-3.json`). B's decision record: `b-round-3.md`.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-19, D-20, D-21 and D-22 are new and binding.** D-19 replaces the D-16 rate band, the seek rules and the "one `<video>`" contract.
Backlog: `tmp/studio-real-loop/backlog.json` → `SRW-02`, `SRW-03`, `SRW-05` (open sync acceptance), `C-R3-01..06`, root-review `L2 L4 L8 M1 M2`, `SRW-22` (Studio Lab entry), `SRW-23` (scrollbars), `SRW-12` (library + demo stems), `SRW-11A` (library panel).
Working dir for all paths: `C:/Apps/czaba-project/store` (`../` paths are relative to it). HEAD at dispatch: `cc1e531`, working tree clean.

## 0. Two tracks, in this order

The round has **two independent tracks**. Finish Track S before you start Track U. Report "not ready" IDs **per track**. C verifies Track S first, so an unfinished Track U does not cost Track S its verification.

**Track S — sync and correctness (bugs first)**
1. **S1 — D-19 video sync** (§3): C-R3-01 (High), C-R3-02 (High), C-R3-03 (Low).
2. **S2 — round-3 bugs and root-review findings** (§4): C-R3-04, C-R3-05 (Medium), C-R3-06 (Low), and root review L2, L3, L4, L8, M1.
3. **S3 — M2, measure first** (§5): the per-frame context re-render. Measure it; change the code only if the measurement crosses the threshold.

**Track U — user-requested, visible progress in the real Store**
4. **U1 — SRW-22: a discoverable Studio Lab entry** in the Store header, plus a way back out of the full-screen lab (§6).
5. **U2 — SRW-23: Studio scrollbars** (§7).
6. **U3 — SRW-12: library tree, search, keyboard, preview, drag to lane, and audible synthetic demo stems** (§8).
7. **U4 — SRW-11A: library panel collapse and resize**, with the video dock moved to its agreed compact place (§9).

If an item is not finished, list its acceptance IDs under "not ready" for its track. C fails those IDs and B carries them over. Do not fake or soften behaviour to make it fit.

**Not this round (no UI for these):**
- duplicate and group split (SRW-07);
- moving clips between lanes (SRW-08);
- clipboard (SRW-09);
- zoom, overview, Follow and Fit (SRW-10);
- floating or expanded video, detail panel, track height and fold (SRW-11B);
- gain, pan, master and meters (SRW-13);
- grid and tempo (SRW-14/15);
- markers (SRW-16);
- track groups (SRW-17);
- clip fades and volume envelopes (SRW-18);
- the video opacity fade (SRW-19);
- range or MP3 export (SRW-20);
- the purchased mount (SRW-21);
- T12 Gain/Volume.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md`, then these primitives:
   - `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`;
   - `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `SKELETON_LOADING.md`, `TESTING_QUALITY_GATES.md`.

   Also read the prompts `studio-feature.md`, `new-component.md`, `new-hook.md` and `new-test.md`, and the skill `pre-flight`. Where a primitive example is stale, the code and this task win.
2. **Design review before any Track U UI.** Invoke the real `design-philosopher` subagent (read-only). Give it:
   - the prototype library markup (`../output/studio-workspace-prototype/index.html`, lines 11–19);
   - `../docs/technical/ableton-live-current-workflow.md` §7.1 (LIB-01..08), §7.2 (PRE-01..05) and §7.11;
   - FB-08 (`plan.md` §4);
   - §6–§9 of this task.

   Ask it to rule on four things:
   - (a) the library tree and preview layout;
   - (b) where the compact video dock goes (§9);
   - (c) the header entry label and badge;
   - (d) the scrollbar tokens.

   Quote its ruling in your report. Where it conflicts with an acceptance criterion here, the criterion wins and you record the conflict. B could not invoke subagents in its own session; it read `.claude/agents/design-philosopher.md` only.
3. Read the following for behaviour only. Do not copy code from them.
   - `../output/studio-workspace-prototype/workspace.js`: the library, the preview and the library resize (search for `libraryResize`, `previewWave`, `collections`, `files`).
   - `../tmp/studio-real-loop/c-round-3.md` §3 (mechanisms (ა)–(გ)) and §9.
   - `c-round-3/scripts/mon.js`, `l6.js`, `rf32.js` and `../tmp/studio-real-loop/c-round-2/scripts/vfc.js`. This is how C measures.
   - `../tmp/studio-real-loop/root-pre-push-review.md` §4.
4. Read every file you change (§2).
5. Before editing, post the **pre-flight gate** at the top of your report. It must list:
   - your assumptions;
   - the smallest version per item;
   - each file, with the reason;
   - the commands that prove success.

## 2. File ownership (exact; nothing else may change)

**Modify** (files you already own):
- `app/types/arrangement.ts`
  - Any new `WorkspaceSource` field must be **optional**, because it is the SRW-21 adapter contract. Prefer deriving the tree from the existing `collectionLabel` + `kind`.
- `app/lib/arrangement/model.ts`, `schedule.ts`, `transport.ts`, `video.ts`, `graph.client.ts`, `loop.ts`, `selection.ts`, `peaks.ts`, `demo-synth.ts`, `video.client.ts`
- `app/lib/arrangement/__tests__/*.test.ts`. Existing tests may change only where §3–§9 change their contract; name each one with a reason.
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/*`: every existing file, including `ArrangementLibrary.tsx` and `ArrangementRuler.tsx`.
- `app/data/studio-lab-demo.ts`
- `app/routes/studio-lab.tsx`: only if the collection wiring needs it.

**Modify — newly granted, narrow:**
- `app/components/layout/Header.tsx`: **add exactly two `<Link to="/studio-lab">` elements**, one in the desktop nav and one in the mobile nav, using the file's existing class helpers. No other line may change, so do **not** fix pre-existing Biome diagnostics or comments in this file. Do not run `--write` on it, except for formatting of your two added blocks. C diffs the file.

**Create:**

| File | Responsibility |
| --- | --- |
| `app/lib/arrangement/video-sync.ts` + `__tests__/video-sync.test.ts` | Pure D-19 decisions (§3.2). No DOM. |
| `app/lib/arrangement/library.ts` + `__tests__/library.test.ts` | Pure library logic: building the tree, AND search, list navigation, the drop time and the overlap check at a lane position (§8.2). |
| `app/lib/arrangement/preview.client.ts` | The single preview player on the workspace `AudioContext` (§8.4). |
| `app/lib/arrangement/position-store.ts` + `__tests__/position-store.test.ts` | **Only if** §5 crosses the threshold. |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | The preview panel (§8.4). Optional: you may keep it inside `ArrangementLibrary.tsx`. |
| `app/components/arrangement/studio-scrollbar.ts` | One exported class-string constant (§7). |
| `docs/implementation/2026/quarter-IV/013-studio-lab-sync-library.md` | Written per `.claude/rules/implementation-docs.md` and `docs/implementation/TEMPLATE.md`, in Georgian. If 013 is taken, use the next free number. |
| `../tmp/studio-real-loop/a-round-4.md` | Your report (§12). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

**Read-only imports allowed:**
- `~/lib/sfx-edit` (`encodeSfxWav`), `~/lib/sfx-video.client` (`seekSfxVideo`);
- `~/components/ui`, `~/lib/utils`;
- `@remix-run/react` (`Link`).

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`.

**Forbidden to modify.** C checks the first four by sha256; they still match `protected-baseline.json` and are now committed in `cc1e531`:
- `app/lib/__tests__/download-routes.test.ts`
- `app/routes/account.downloads.tsx`
- `app/routes/api.studio-token.ts`
- `app/routes/studio.$productId.tsx`

**Also forbidden:**
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`
- `root.tsx`, **`app/styles/**`**, `lib/sfx-*`
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**` (no new media files; demo stems are synthesised in the browser)
- `package.json` and the lockfile; `.claude/**`; `AGENTS.md`; `.agents/**`; `.codex/**`; `../backend/**`
- user settings and env/config files
- the sitemap

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, push or deploy.

## 3. S1 — D-19 video sync (C-R3-01, C-R3-02, C-R3-03)

### 3.1 What C found (keep these facts in view)

- **The D-16 hard rules held in all 20 runs.** There were 0 writes while `seeking`, the rate stayed bounded, `muted` was always true, and there was 1 `<video>`. The tolerance still failed: R3-V1 passed 5/15, R2-V3 passed 3/5, and R5-L6 passed 0/5.
- **(ა) Hard-seek cascade.** A running seek takes 0.3–0.9 s headless. With a lead of ≤ 0.15 s, every seek lands 0.15–0.5 s behind, so |d| > 0.3 fires another seek. Frames froze for up to 0.615 s.
- **(ბ) Soft-sync ceiling.** At 1.15 the video recovers only 0.15 s per second. Even in passing runs the rate sits at 1.1–1.15: the video lags systematically.
- **(გ) Plain bug.** `ArrangementVideoDock.tsx:176` hard-seeks on `clipChanged && |d| > 0.08`. That includes **continuous same-source boundaries**, such as R2-V3 2.0 (off 2→3), which D-16 rule 4 does not allow.
- **Loop wraps (R5-L6).**
  - A wrap seek targets `loop.start + 0.15`, lands behind and recovers only at 1.15.
  - In l6_5 the wrap seek was blocked by a pending seek, so for about 0.85 s the video showed frames from past `loop.end`.
- **Start (C-R3-03).** The hold works. `play()` lands 22–30 ms (ctx time) after `startAt`, which is rAF and React-render detection lag. |d| then reaches 0.077–0.089 in the first 300 ms.
- **Fixtures.** They are light: 640×360 VP9 at 30 fps (`beeps-6s-vp9-opus.webm`, `clip-4s-vp9-opus.webm`). The H.264 fixture has a single keyframe. Seek latency and main-thread contention, not decode resolution, are the problem.

### 3.2 D-19 rules (binding)

The audio clock stays the master.

1. **A sync loop outside React render.**
   - While playing, the dock's control step runs from its own `requestAnimationFrame` loop, or from a subscription to the context's tick. It reads the audio-clock position through `getLivePosition()` every frame.
   - It does **not** run from a React effect keyed on the rendered `position`.
   - React effects only react to source, role and play-state changes.
2. **The guards are kept from D-16.**
   - Never write `currentTime` on **either** element while that element is `seeking` or has one of our seeks pending. A seek is pending until its `seeked`, its `abort` or `emptied`, or a timeout.
   - No learned or adaptive lead, and no state carried across seeks or Play cycles.
   - At most one hard seek per 250 ms per element.
3. **Continuity (fixes (გ)).**
   - `resolveVideoTarget` exposes `continuous: boolean`. Continuous means the same source and media continuity within ≤ `VIDEO_CONTINUITY_SECONDS`.
   - A continuous clip change is **not** a discontinuity: no seek and no swap.
   - Replace the raw `clipChanged` test with this.
4. **A wider soft-sync band.** The `<video>` is always muted (D-13), so `playbackRate` has no audible effect.
   - **Dead band:** |d| ≤ 0.02 → exactly 1.
   - **Correction band:** 0.02 < |d| ≤ 1.0 → `videoRateCorrection(d) = clamp(1 − K·d, 0.5, 2.0)`.
     - Choose `K` in [2, 5] and report it.
     - Quantised steps are allowed.
     - The function is monotone non-increasing in `d` and symmetric in sign around 1.
     - Write the rate only when the step changes.
   - **Reset to exactly 1** on pause, stop, the issue of any seek, a source change, a role swap and unmount.
5. **Seek-and-hold for unpredictable discontinuities.**
   - **When it applies:**
     - a user seek, ruler click or scrub reschedule while playing;
     - an edit or undo that moves the mapping by more than 0.08 s;
     - a predictable discontinuity whose standby was not ready (rule 6);
     - a steady-state |d| > 1.0.
   - **Steps:**
     1. Pause the active element.
     2. Set the rate to 1.
     3. Write `currentTime = clamp(target + L)`, where `L` is one constant in [0, 0.5] s. Choose it and report it.
     4. Wait for `seeked`.
   - **Then:**
     - If the shown media time is ahead of the live target, stay paused until the live target reaches it (within one frame), then `play()`.
     - Otherwise, `play()` immediately and let rule 4 catch up.
   - Never re-seek while the hold is waiting.
6. **A standby element for predictable discontinuities.**
   - **The dock renders exactly two `<video>` elements.**
     - Both are `muted` and `playsInline`, and both carry `data-testid="arrangement-video"`.
     - Each also carries `data-video-role="active"` or `"standby"`.
     - The standby is not visible: `opacity-0`, `pointer-events-none`, stacked under the active one. Do not use `display:none`, which may stop it from seeking.
   - **What counts as predictable:**
     - a loop wrap of the running schedule;
     - a non-continuous clip boundary;
     - entering a clip from a gap;
     - a source change at a boundary.
   - **Preparation.** When the next predictable discontinuity is ≤ 1.0 s ahead on the audio clock, the standby:
     1. loads the needed source (only if it differs);
     2. seeks, while paused, to that discontinuity's media time.
   - **The swap.** At the discontinuity's audio time (± one frame), the standby gets `play()` and becomes active and visible. The old active element pauses and becomes the standby, ready for the next discontinuity.
   - **Fallback.** If the standby has not finished seeking by then, use rule 5 on the active element.
   - **For a wrap,** the discontinuity time is the ctx time of the iteration boundary, which the loop schedule already knows.
7. **Start (C-R3-03).**
   - During the start hold, the active element is paused and seeked to the start mapping.
   - `play()` is issued on the first frame where `ctx.currentTime ≥ startAt − min(frameInterval, 0.02)`. `frameInterval` is measured from the last two rAF timestamps, so it is not a timer guess. The 20 ms cap matches the RF4-3 bound.
   - The video must never advance before the audio starts by more than one frame.
8. **Stopped behaviour is unchanged.** On the active element: `seekSfxVideo` with an abortable controller, exactly once per position change.

**Pure functions in `video-sync.ts`.** They are pure, with named tests. You may move `videoRateCorrection` here and re-export it.
- `nextPredictableDiscontinuity(arrangement, loopSchedule | null, livePosition, horizon)` → `{atPosition, clipId, sourceId, mediaTime} | null`. It accounts for continuity, gaps and loop wraps.
- `shouldHardSeek(...)`, or the equivalent decision, covering rules 3–5.
- `holdRelease(frameMediaTime, liveTarget, frameInterval)` → `'hold' | 'play'`.

### 3.3 Acceptance (C)

**RF4-1 (C-R3-01).** This repeats RF3-1 on the same layouts with C's harness:
- **R3-V1 layout:** video 0–6.008 and 8–12.008, plus music at 0. 10 runs in one load, plus 5 with a reload before each.
- **R2-V3 layout:** trim 0.5, split at 3, Delete Time 1–2, plus Slow rise on SFX. 3 runs in one load, plus 2 with reload.

C samples **the element with `data-video-role="active"`** every 250 ms against the audio clock.

**Excluded windows:**
- 300 ms after the start, after each clip boundary and after each swap;
- for each hard seek, from the seek's issue until its `seeked` + 300 ms.

**Every run** must meet all of these:
- median |d| ≤ 0.05 s and max |d| ≤ 0.1 s;
- 0 `currentTime` writes while `seeking`, on either element;
- no presented-frame (rVFC) gap over 250 ms on the active element outside the excluded windows;
- `playbackRate` within [0.5, 2.0], and exactly 1 on both elements after Pause;
- `muted === true` on both elements at all times;
- exactly two `<video>` elements, exactly one visible;
- at most one element not paused, outside a ≤ 34 ms swap window.

C reports the hard-seek count per run. At the R2-V3 continuous boundary at 2.0 there must be **no** seek and no swap. The starvation rule is unchanged from RF3-1: at most 2 re-runs in total, only with evidence of main-thread starvation, each one reported.

**Diagnostic, not part of the verdict.** C runs 3 R3-V1 runs with `beeps-6s-h264-aac.mp4` and reports them. This measures the environment and does not change the verdict.

**RF4-2 (C-R3-02, re-measures R5-L6).**
- **Layout:** video 0–6.008, loop 2–4. Play from 1.0 for 8.6 s (3 wraps). 5 runs.
- **Thresholds:** the same as RF4-1, with 300 ms excluded after the start and after each wrap.
- **Also:** 300 ms after each wrap, the active element's `currentTime` must be inside the loop's media range [2, 4]. No frames from past `loop.end` (the l6_5 symptom).
- **Report:** whether each wrap used the standby swap or the fallback.

**RF4-3 (C-R3-03).** Fresh load, first Play (the AudioContext is created on this click), music at 0, 3 runs with a reload.
- **Hold:** while `ctx.currentTime < startAt`, the active element is paused and `currentTime` is within 0.04 of the start mapping.
- **`play()` timing:** in ctx time, `play()` lands within [`startAt` − 20 ms, `startAt` + one measured rAF interval, max 34 ms]. The early side is capped by rule 7. The late side allows one frame of detection under load.
- **Drift, `startAt` to +100 ms:** |d| ≤ 0.1. This is the decoder ramp; the limit equals the steady-state max.
- **Drift, +100 to +300 ms:** |d| ≤ 0.06.

**Rationale.** In round 3 the ≤ 0.06 limit over the whole first 300 ms measured the first decoded frame after `play()` as well as the app. B narrows the strict window to after 100 ms and keeps the global 0.1 limit for the first 100 ms. The `play()` timing stays strict.

**RF4-U (unit).** `video-sync.test.ts` and `video.test.ts` cover:
- `videoRateCorrection`: dead band, clamp [0.5, 2.0], monotone, sign symmetry;
- continuity: a continuous boundary is not a discontinuity;
- `nextPredictableDiscontinuity`:
  - a gap entry;
  - a non-continuous boundary;
  - a loop wrap;
  - nothing beyond the horizon;
- `holdRelease`: hold vs play.

## 4. S2 — round-3 bugs and root-review findings

| ID | Fix (smallest honest) | Acceptance (C) |
| --- | --- | --- |
| **C-R3-05** (Medium), **C-R3-04** (Medium), root **L1**, **L4** (D-20) | **Guard:** while any pointer gesture is active (clip move or trim, body range, group move, brace drag, playhead scrub, marquee), Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y and the Undo/Redo buttons do nothing except set the status `Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` **Cleanup:** on unmount mid-gesture, and when `setPointerCapture` throws, the gesture clears its own state **and** the context's preview-active flag. | **R4-B1.** Repeat C's repro L1d: mid clip-drag Ctrl+Z → status shown and history unchanged. On release there is one entry `კლიპის გადატანა`. The loop and its `Loop შეიქმნა` entry are intact, and Redo availability is unchanged. The same holds for a brace drag and a trim. **R4-B2.** Repeat C's repro L1: brace drag + Ctrl+Z + release, then import `clip-4s-vp9-opus.webm` → the clip appears in ≤ 3 s (fresh control 1.6 s). A unit or context test proves the preview-active flag is false after an aborted gesture. |
| **C-R3-06** (Low) | The transport controls must not move when the Delete label changes. The mechanism is yours: for example a constant visible label plus a hint, or reserved widths. The R1-B5 meaning stays visible while a range exists: Delete closes the gap on all lanes (in a label, the footer hint or the status). | **R4-B3.** At 1280×720 and 1440×900, with the loop on and off, C reads the bounding boxes of `↻ Loop` and `arrangement-loop-times` in 4 states: nothing selected, one clip, a range, and 2 clips. All are equal within ±1 px. With a range, the "closes the gap on all lanes" text is visible. |
| root **L3** | Delete and Backspace ignore `event.repeat`. | **R4-B4.** A held Delete (keydown with `repeat=true` ×5 after the first) → exactly one deletion and one history entry. |
| root **L2** | A reschedule during the initial hold must not mark the transport running, or start the video, before the **sounding** graph's `startAt`. | **R4-B5.** A `transport.test.ts` case covers a reschedule inside the hold, and the running flag follows the new `startAt`. In the browser, C edits within 30 ms of the first Play and checks with the `play()` spy that `play()` comes no earlier than the new `startAt` − 20 ms. |
| root **L8** | If creating the `AudioContext` fails, show the status `ამ ბრაუზერში Web Audio მიუწვდომელია — დაკვრა და ექსპორტი ვერ იმუშავებს.` Then: `isPlaying` stays false, nothing throws to the root ErrorBoundary, and Export shows the same reason. | **R4-B6.** C stubs `window.AudioContext` to throw before the first Play → the status is shown, the page stays interactive, and the console has no uncaught error. |
| root **M1** | Loop iteration refill must not depend on rAF alone. Add a timer driver, for example `setInterval` at ≤ 250 ms while playing, with a horizon greater than the timer period plus margin (≥ 1.5 s is suggested). Keep the H1 rule: re-anchor once instead of creating late sources. | **R4-B7.** Loop 2–4, music at 0, play from 1.0. After the first wrap, C replaces `requestAnimationFrame` for 5 s with a stub that **queues** callbacks without running them, then restores it and flushes the queue. This mirrors a hidden tab, whose pending frame fires when the tab is visible again. Over that time the audio keeps looping: ≥ 2 wraps on the master tap, no 5 ms window below −60 dBFS under music, no `start()` with `when` < `currentTime`, and ≤ 1 source per clip. After the restore and flush, the playhead resumes inside [2, 4] within 0.5 s. A unit test drives the refill with fake timers. |

## 5. S3 — M2: measure, then decide

- **Measure.** Use the R3-V1 layout at 1440×900 while playing. Measure:
  - the React commit time per animation frame (a temporary `<Profiler>`, or a Chrome performance trace through browse);
  - rAF gaps.

  Remove any instrumentation afterwards.
- **Threshold.** Implement a position store if **either** holds:
  - the mean commit time is > 4 ms per frame;
  - there is any rAF gap > 50 ms that coincides with a commit.

  The store is `position-store.ts`, using `useSyncExternalStore` and a `useArrangementPosition()` hook:
  - the main `useArrangement()` value no longer changes on playback ticks or seeks;
  - only the playhead line, the ruler handle, the time display, the library playhead text, the video gap caption and the brace subscribe to position.
- **Acceptance.**
  - **R4-M2.** The report contains the measured numbers and the decision.
  - If implemented, a test proves it: a consumer of `useArrangement()` renders 0 extra times across 10 `seekTo` calls, while a `useArrangementPosition()` consumer renders 10 times.
  - If not implemented, C checks the numbers once in its own run.

## 6. U1 — SRW-22: Studio Lab entry and exit

**Header.** Add a `Studio Lab` link to the desktop nav and the mobile nav of `Header.tsx`.
- It uses the file's existing class helpers.
- It has a small visible badge `Demo` (tokens only), so the label is honest.
- `/studio-lab` keeps `robots: noindex`. It is not added to the sitemap.
- `root.tsx` already hides the Store header on `/studio*`, so the lab stays full screen.

**Exit.** In the `StudioWorkspace` header, add a `← CZABA` link (`Link to="/"`, `data-testid="arrangement-exit"`). It works the same way for a future purchased mount.

**Acceptance:**
- **R22-1.** Start anonymous at `/`. Click the header `Studio Lab` link → `/studio-lab` renders the workspace (client navigation; the URL changes). `← CZABA` returns to `/`.
- **R22-2.** `git diff app/components/layout/Header.tsx` shows only the two added `Link` blocks: no auth, cart or account change.
- **R22-3.** Store header screenshots at 1440×900 and 1280×720 show no wrapping or overlap. At 390×844 the mobile menu shows the link.
- **R22-4.** G4-3 network rules hold for the session after navigation.

## 7. U2 — SRW-23: Studio scrollbars (user request, with screenshot)

**The user's complaint.** In the real `/studio-lab` library there is a bright white rail, large grey arrow buttons and a chunky thumb.

**Required look in Chromium (Windows):**
- a graphite track (a surface or background token);
- a slim rounded thumb using a muted token, with non-text contrast ≥ 3:1 against the track (for example `dim` or `muted`; `outline-hover` is too low);
- the thumb turns mint (`brand`) on hover and drag;
- no arrow buttons;
- no white rail;
- the corner matches the track;
- thickness 8–10 px.

**Implementation.**
- One exported class-string constant in `studio-scrollbar.ts`, built from Tailwind v4 arbitrary variants (for example `[&::-webkit-scrollbar]:…`, `[&::-webkit-scrollbar-thumb]:…`, `[&::-webkit-scrollbar-button]:hidden`).
- **Do not set `scrollbar-color` or `scrollbar-width` on the same element.** Chrome 121+ then ignores the `::-webkit-scrollbar` styles. The existing global `.styled-scrollbar` does both and is not used here.
- Add `scrollbar-gutter: stable` on vertical scrollers, so content does not jump.
- `app/styles/**` stays untouched.

**Apply it to:**
- the library collection nav and file list;
- the timeline scroller (both axes and the corner);
- every other overflow container in the workspace.

**Behaviour.** Wheel, trackpad, keyboard scrolling of a focused scroller, and thumb drag are preserved.

**Acceptance:**
- **R23-1.** Screenshots at 1280×720 and 1440×900 with an overflowing library list and a timeline scrolled on both axes, plus zoomed crops of each scrollbar. They show no arrows, no white rail, a graphite track and a rounded muted thumb.
  - The mint hover/drag state is checked by C only if the tool can force a hover or press on the thumb. Otherwise C reads the class constant, and the visual check goes on the Tech Lead real-mouse list together with thumb drag.
- **R23-2.** Wheel and keyboard scrolling move each scroller. Thumb drag is checked where the tool can do it; otherwise it is recorded as a Tech Lead real-mouse check.
- **R23-3.** Toggling content (filtering the library) does not shift the panel width (`scrollbar-gutter`).
- **R23-4.** No change outside `components/arrangement/` styling. `git diff --stat` shows no `app/styles` change.

## 8. U3 — SRW-12: library tree, search, keyboard, preview, drag; demo stems (D-21)

### 8.1 Demo stems (honesty first)

**Add to `demo-synth.ts`** one synthetic demo composition, made of **4 separately generated stems**. Each stem is:
- 16.000 s long, at 48 kHz, in stereo;
- deterministic;
- peak ≤ −6 dBFS, so the 4-stem sum does not clip.

The 4 stems:
- a pulse/percussion part with known onsets;
- a bass part;
- a pad;
- a lead.

They must be clearly distinct, sound like parts of one piece, and be aligned at sample 0.

**Also add** the same piece's synthetic full mix (`kind: 'music'`), generated as the sample-wise sum of the 4 stems.

**Labels.**
- Titles and the collection label say "სინთეზური დემო": the composition's title plus `· ბასი`, `· პადი`, and so on.
- The library caption says these are not CZABA catalogue stems.
- The two public MP3s stay `kind: 'music'`, with no stem children. Nothing pretends to be stem extraction from a full mix.
- No purchased or R2 audio, and no new files in `public/`.

### 8.2 Tree, search and navigation (`library.ts`, pure)

**Tree.**
- A `ყველა ფაილი` node, then each collection (expandable ▸/▾), with the folders `მუსიკა`, `სტემები` and `SFX` (only those that are non-empty).
- Clicking a node filters the list, and the active node is highlighted (LIB-02).

**Search.**
- It is case-insensitive AND over words, in any order, across the title, the kind label and the collection label (LIB-03). For example, `ბასი დემო` finds the bass stem.
- `×` and Esc clear the text but keep the folder filter, and the kept filter stays visible (LIB-04).

**Keyboard.**
- ↓ from search moves focus and selection to the first result; ↑/↓ moves through the list (LIB-05).
- The list is `role="listbox"`; items are `role="option"` with `aria-selected`.

**No results.** The list shows `ხმა ვერ მოიძებნა…`, and preview and add are disabled (LIB-06).

**Adding.** Enter, double-click and `＋ დამატება` add to the **active audio track** at the playhead. This keeps R1-B1 and Ableton's "selected track" rule. Adding to the video lane is refused with the existing message. The status names the track and the time.

### 8.3 Drag to lane (LIB-08, R12-L4)

**Dragging.**
- Rows are draggable.
- Over an audio lane, a ghost shows the clip's width and its start time (`formatArrangementTime`) at the pointer.
- If the clip would overlap an existing clip, the ghost turns amber with `აქ ადგილი არ არის`, and a drop does nothing.

**Placement.** Free placement; no snap (grid is SRW-14).

**Refusals.**
- **Video lane:** refused with a message, and history is unchanged.
- **A local audio file dropped anywhere:** refused, as today (R12-L5).

**Result.** A drop creates one clip and one Undo entry.

### 8.4 Preview (PRE-01..05, R12-L3)

**Panel.** A panel at the bottom of the library shows:
- the name and duration;
- the selected source's waveform (`peaks.ts`), with progress;
- `▶ მოუსმინე` / `■ შეჩერება`;
- `＋ დამატება`.

**Behaviour.**
- Clicking the waveform seeks the preview.
- ↑/↓ while previewing switches the preview to the next file. Only one preview source exists at a time.
- **Preview and transport never sound together** (PRE-03 ⚖, documented): starting a preview pauses the transport, and Play stops the preview.

**Engine.** The preview uses the workspace's lazily created `AudioContext` (no second context). It goes straight to the destination at unity gain, and is never part of the export.

### 8.5 Acceptance

- **R12-L1.** `ბასი დემო` and `დემო ბასი` give the same single result. `zzz` → `ხმა ვერ მოიძებნა…` with preview and add disabled. Clearing restores the list. (Browser, plus `library.test.ts`.)
- **R12-L2.**
  - The `სტემები` folder shows only the 4 stems and is highlighted.
  - With SFX filter + text, `×` keeps the SFX filter, visibly.
  - ↓ from search selects the first result; ↓↓ moves on. Enter adds to the active audio track at the playhead, with one Undo.
- **R12-L3.** Patch `AudioBufferSourceNode`.
  - ▶ previews (1 source).
  - A waveform click at 50 % restarts at ≈ duration/2 (±0.1 s).
  - ↓ while previewing → the previous source stops, the next starts, and there is still 1 source.
  - Play stops the preview; the preview pauses the transport.
  - The preview is absent from the export.
- **R12-L4.**
  - Drag the bass stem onto the stems lane at 10 s → the ghost reads `00:10.000` (the `formatArrangementTime` format), and the drop puts the clip at 10.0 s ± 1 px. Undo removes it.
  - Over an occupied place → amber, and no change.
  - Onto the video lane → refused, and history is unchanged.
- **R12-L5.** A `tone-2s.wav` drop on any lane is refused, with history unchanged (regression).
- **R12-S1 (stems are real and distinct).**
  - C decodes each stem's buffer (or exports each stem alone): 16.000 s, 48 kHz, non-silent, and the 4 stems pairwise distinct (normalised correlation |ρ| < 0.5).
  - **Buffer oracle.** C loads each stem and the full mix in-browser through `collection.loadSource`, sums the 4 stem buffers in JS, and compares the sum with the full-mix buffer: max |diff| ≤ 1e-6 (both are generated in float).
  - **Export oracle.** The workspace has 3 audio lanes and clips cannot overlap on a lane, so C places 3 stems at 0 on the 3 audio lanes (unity volume). The exported WAV equals the JS sum of those 3 buffers within 2⁻²² plus 24-bit quantisation.
  - Every stem source has `kind: 'stem'`, and its label says it is synthetic.
- **R12-S2 (product flow).** Find a sound → open `სტემები` → preview the bass → drag it onto a lane → Play: it is audible at the dropped time (master tap) → Export: it is present in the WAV at that time.
- **R12-U.** `library.test.ts` covers:
  - the tree (empty folders hidden);
  - AND search, including order independence and case;
  - filter retention on clear;
  - navigation bounds;
  - the drop time from pixels;
  - overlap refusal.

## 9. U4 — SRW-11A: library panel collapse and resize; compact video dock (D-22)

**Why the dock moves (D-22).** Today the video dock sits under the library in the left column, so collapsing the library would hide the video. The agreed prototype places a compact 16:9 video box in the strip above the timeline, at the right. Move the existing `ArrangementVideoDock` there:
- it is at least 160×90 px;
- it never covers the ruler, the lanes or the lane headers;
- it is the same component with the same two elements, with no remount on collapse or resize.

**What stays SRW-11B:** a floating or expanded video, the detail panel, and track height and fold.

**Collapse and resize (LIB-01).**
- **◀** collapses the library to a 40 px rail with **▶**, which restores the previous width. It uses a motion-safe width transition of 300 ms.
- **The separator** is `role="separator"`, `aria-orientation="vertical"`, with `aria-valuenow/min/max` = width / 288 / 480. It responds to drag and to ←/→ in 16 px steps.
- The timeline is never covered.
- A focused separator's ←/→ must not nudge clips (extend the existing guard).

**Acceptance:**
- **R11A-1.** ◀ → the library width is 40 ± 1 and the timeline viewport is ≥ 240 px wider. ▶ → the previous width is back. The video element is the same DOM node before and after (C tags it), and sync continues while playing.
- **R11A-2.**
  - Separator ←/→ → the width changes by 16, and `aria-valuenow` matches.
  - It is clamped at 288 and 480.
  - Drag works.
  - No clip moved, and there is no history entry.
- **R11A-3.**
  - Screenshots at 1280×720 and 1440×900, with the library open and collapsed and a video loaded.
  - All 4 lanes are fully visible with the ruler and the loop strip. The dock is ≥ 160×90 and does not overlap anything.
  - The brace, range, selection and playhead are still distinguishable.

## 10. Required tests (behavioural, named)

- `video-sync.test.ts` and `video.test.ts` (§3.3 RF4-U). The changed contracts are the rate clamp and band and `continuous` on `VideoTarget`. Name every changed test.
- `transport.test.ts`: a reschedule inside the hold (R4-B5).
- Context or unit test: the preview-active flag is cleared after an aborted gesture (R4-B2), and the Undo guard during a gesture (R4-B1).
- Loop refill driven by fake timers with rAF absent (R4-B7).
- `library.test.ts` (R12-U).
- `demo-synth` tests:
  - the stem length and sample rate;
  - the peak ≤ −6 dBFS;
  - the pairwise correlation < 0.5;
  - the full mix equals the stem sum.
- `position-store.test.ts`: only if §5 implements it.

## 11. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts app/routes/studio-lab.tsx app/components/layout/Header.tsx
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**The `/check` rule is unchanged:**
- Use `--write` only on paths you own.
- Run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files. Re-run the hash check afterwards.
- Never run `npm run format`.

**Dev server and browser.**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse`, with the state file `../tmp/studio-real-loop/a-browse.json`.
- Media fixtures are in `../tmp/studio-real-loop/media/`.
- Use real `$B press` keys. Measure sync with C's scripts, adapted only in which element they read (`[data-video-role="active"]`). Keep any adapted copies in your system temp directory, not in `c-round-*`.

**Review.** Invoke the actual `code-reviewer` subagent, fix its findings, and quote its summary.

## 12. Report `../tmp/studio-real-loop/a-round-4.md`

The report contains:
1. The pre-flight gate.
2. The design-philosopher ruling, quoted.
3. The files actually changed. They must be a subset of §2.
4. Verbatim command tails.
5. The changed tests, each with its reason.
6. The code-reviewer findings and your fixes.
7. The D-19 constants: `K`, the clamp, `L`, the pending timeout, the standby horizon.
8. Your drift measurements per layout: the number of runs, the worst run, and the hard-seek and swap counts.
9. The M2 numbers and the decision.
10. Deviations, each with a reason.
11. **"Not ready" acceptance IDs, separately for Track S and Track U.**

Do not claim PASS.

## 13. What C will verify (in this order)

1. **Track S:**
   - RF4-1, RF4-2, RF4-3, RF4-U;
   - R4-B1, R4-B2, R4-B3, R4-B4, R4-B5, R4-B6, R4-B7;
   - R4-M2.
2. **Track U:**
   - R22-1..4;
   - R23-1..4;
   - R12-L1..L5, R12-S1, R12-S2, R12-U;
   - R11A-1..3.
3. **Gates:**
   - **G4-1.** tsc 0. vitest ≥ 604 + new, with 0 failures. Build passes. Biome reports 0 errors.
   - **G4-2.** The protected hashes match. `git status` and `git diff --stat` show only §2 files; the tree was clean at dispatch. `Header.tsx` has only the two `Link` additions.
   - **G4-3.** Anonymous `/studio-lab`, opened directly and also reached through the header link, makes no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, contacts no R2 host and sends no `Authorization` header from workspace code.
     - The only media are the 2 demo MP3s and `blob:` URLs. Synthetic stems make no request.
     - Anonymous `/api/studio-token` still returns 401. A fake Bearer token gets no token. `/studio/middle-east` still shows "Sign in required".
     - The root `CartContext` anonymous `GET /api/cart` without Authorization is known and allowed.
4. **Harness notes for C (D-19 contract changes):**
   - Install the `currentTime`/`playbackRate` setter spies and the rVFC logging on **both** `<video>` nodes, or on `HTMLMediaElement.prototype`. `c-round-2/scripts/vfc.js` patches a single instance.
   - Roles swap **between DOM nodes**, so re-resolve `[data-video-role="active"]` on every sample. Never cache the element at setup.
   - **R3-V4 under D-19:** "`<video>` = 1" becomes "exactly 2 elements, both paused and both rate 1 after Space ×10".
   - **R4-P1 under D-19:** "video follows" means that during a playing scrub the active element may pause, seek and hold (rule 5). Drift is judged after release, with the hard-seek exclusion.
5. **G4-R (regression),** with a disabled brace present and 2 clips selected where relevant:
   - R1-B5, R1-B12, R1-E1, R1-E5;
   - R2-V1, R2-V2;
   - R3-V2, R3-V3, R3-V4;
   - R4-P1, R4-P3;
   - R5-L1, R5-L3, R5-L4, R5-L5, R5-E1;
   - R6-S2, R6-S3, R6-S4.
6. **G4-shots.** Screenshots at 1440×900 and 1280×720 of:
   - the Store header;
   - the lab with the library open and collapsed;
   - an active library search with the stems folder;
   - a drag ghost;
   - the video dock in its new place.

   Nothing overlaps or is clipped. The root cookie banner is a known root-owned issue; accept it before taking shots, and note it.
