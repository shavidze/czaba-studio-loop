# CURRENT TASK — Round 7: round-6 bugs first (C-R6-02 drift regression, C-R6-03, C-R6-01), then SRW-11B panels (FB-08)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-09
Previous task: `tmp/studio-real-loop/tasks/round-6.md`. C's verdict: **FAIL**. RF6-2 and R10-N5 failed; every other round-6 ID passed. RF6-1 passed with a note. New bugs: C-R6-02 (Medium), C-R6-01 and C-R6-03 (Low) (`c-round-6.md`, `c-round-6.json`). B's decision record: `b-round-6.md`.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **The D-24a clarification, D-29 and D-30 are new and binding.**
Backlog: `tmp/studio-real-loop/backlog.json` (v7) → `C-R6-02`, `C-R6-03`, `C-R6-01`, then `SRW-11B`.
Working dir for all paths: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Baseline at dispatch.** HEAD `c5ed47b`, plus the 11 uncommitted round-6 session-2 files that C verified (§2.1). If root commits them before you start, HEAD is the baseline. **Either way, do not revert, re-create or reformat any round-6 file.** Edit on top of it. Nobody commits in this round. Root makes the final commit after everything is done.

## 0. Two tracks, in this order

Finish Track S before Track U. Report "not ready" IDs **per item**. C verifies Track S first.

**Track S — bugs (bugs first)**
1. **S1 — C-R6-02 (Medium): drift regression.** Measure first, then fix (§3).
2. **S2 — C-R6-03 (Low): the last ruler label overflows the timeline after Fit** (§4).
3. **S3 — C-R6-01 (Low): a Volume drag commits in the middle of another gesture.** D-30 (§5).
4. **S4 — docs honesty (§6):** doc 015 status, plus the D-24a release wording (B-side; no code).

**Track U — next dependency-ordered scope**
5. **U1 — SRW-11B (FB-08 remainder):** detail panel, track fold and height with lane auto-fit, floating expanded video. D-29 (§7).

SRW-11B is independent of S1, but both touch `ArrangementVideoDock.tsx`. Keep the two dock changes separate (§2.2), so C can tell whether a drift change came from the S1 fix or from the floating-video layout.

If an item is not finished, list its acceptance IDs under "not ready" for that item. C fails those IDs and B carries them over. Do not fake or soften behaviour.

**Not this round (no UI for these):** gain/pan/master/meters (SRW-13); grid/snap (SRW-14); bars/beats/tempo/metronome (SRW-15); markers (SRW-16); track groups (SRW-17); fades/envelopes (SRW-18); video opacity fade (SRW-19); range/MP3 export (SRW-20); purchased mount (SRW-21); T12 Gain/Volume. Out of scope for the whole project: plugins/effects, pitch, multiple video layers, audio time-stretch. Grid tempo (later) is never audio stretch.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md`, then these primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `SKELETON_LOADING.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Prompts: `studio-feature.md`, `new-component.md` (for ArrangementDetailPanel), `new-test.md`. Skill: `pre-flight`. Where a primitive example is stale, the code and this task win.
2. Read for behaviour only (do not copy code):
   - `c-round-6.md` §2.1 (RF6-2 detail), §3 (R10-N5), §6 (bugs), §7.
   - C's raw drift runs `c-round-6/runs/{L_7,L_8,Lr_2,Lr_3,Lr_5,Lr2_2}_raw.json` (LoAF `scripts[]` with `sourceURL`/`invoker`/`duration`/`forcedStyleAndLayoutDuration`), `rafcost-1.json`, `rf62-summary*.txt`, `rf53-summary3.txt`, `F_*.json`. Scripts: `c-round-6/drift.sh`, `c-round-5/scripts/rf5.js`, `rf5an.js`, `c-round-6/scripts/r3v1lay.js`, `n5o.js`, `n5o2.js`, `volpre.js`.
   - Prototype `../output/studio-workspace-prototype/workspace.js`: track heights and fold (`baseHeights`/`trackHeights`/`foldedTracks`, `laneHeight`, `fitLanes`, lines ~123–126, 634–672; mixer fold/badges/resize ~1460–1622), the detail panel (`renderDetails` ~1794–1862, `updateDetailPlayhead` ~2115, `foldDetails`/`detailResize` ~2612–2657, `applyRange` ~2890), and the floating video (`expandVideo`/`placeVideo`/drag/keys ~2659–2772, library collapse interplay ~2569–2580, Esc ~3311). Layout: `index.html` (the `details` section, `detailResize`, `videoBox`).
   - `../docs/technical/ableton-live-current-workflow.md` rows TRK-04, TRK-05, VID-06, PNL-01, PNL-02, PNL-03.
3. **Design check (narrow, FB-08).** Invoke the real `design-philosopher` subagent read-only on three questions: (a) detail panel placement and content (default: at the bottom, between the timeline and the footer, per PNL-01); (b) where the fold control, the height handle and the folded M/S badges go in the 224 px lane header; (c) where the ⤢ expand control and the "expanded" placeholder go in the dock strip. Quote its ruling. Where it conflicts with an acceptance criterion here, the criterion wins; record the conflict.
4. Read every file you change.
5. Post the **pre-flight gate** at the top of your report: assumptions, the smallest version per item, each file with its reason, and the commands that prove success.

## 2. File ownership (exact; nothing else may change)

### 2.1 Baseline at dispatch (round-6 session-2 work, keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLibrary,ArrangementOverview,ArrangementRuler,ArrangementTransport,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
```

`app/components/layout/Header.tsx` is **frozen**. It must stay byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 2.2 May modify / create this round

**Modify:**
- `app/contexts/ArrangementContext.tsx`: S1 per-frame and Play-render work, D-30 volume claim, and view state for track heights/fold if you keep it in context (§7.2).
- `app/lib/arrangement/view.ts` (S2 tick labels), `position-store.ts` (S1), `peaks.ts` (detail waveform reuse), `selection.ts` (only if the detail range needs a helper).
- `app/lib/arrangement/video-sync.ts`: **only** as a named S1 fix, with before/after numbers in your report.
- `app/lib/arrangement/__tests__/*.test.ts` and `*.test.tsx`. Existing tests may change only where §3–§7 change their contract; name each one with a reason.
- `app/components/arrangement/*` (every existing file). `ArrangementVideoDock.tsx` has two separate grants:
  - **(S1 grant)** the sync loop `step` and position subscribers, only for a C-R6-02 fix you name and measure before and after;
  - **(U1 grant)** the layout of the same video box: compact / expanded-floating / placeholder, the ⤢ and ✕ controls, the drag handle.
  - Both grants keep the two `<video>` elements, their mount and `canEscalateAfterSeeked` as they are. The expanded state is a CSS change of the **same** box (no portal, no reparenting, no remount).
- `docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md` (status/TODO lines only, §6).

**Create:**

| File | Responsibility |
| --- | --- |
| `app/lib/arrangement/panels.ts` + `__tests__/panels.test.ts` | Pure maths for D-29: detail height clamp and key step, track height clamp/step per lane kind, lane auto-fit, floating-video placement clamp. No DOM. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | The detail panel (§7.1). |
| `app/lib/arrangement/__tests__/panels-ui.test.tsx` (optional name) | Component tests for fold/height/detail/floating video (§7.5). |
| `docs/implementation/2026/quarter-IV/016-studio-lab-panels.md` | Per `.claude/rules/implementation-docs.md` + `docs/implementation/TEMPLATE.md`, in Georgian. If 016 is taken, use the next free number. Covers round 7 (S1–S3 and SRW-11B). |
| `../tmp/studio-real-loop/a-round-7.md` | Your report (§10). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

`app/types/arrangement.ts`: no change is expected. Track heights, fold and panel state are view state, not arrangement data. If you still need a type there, it must be optional and you must say why.

**Read-only imports allowed:** `~/lib/sfx-edit` (`encodeSfxWav`), `~/lib/sfx-video.client` (`seekSfxVideo`), `~/components/ui`, `~/lib/utils`, `@remix-run/react`.
**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`)
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`
- `package.json`, lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap
- `app/data/studio-lab-demo.ts` (not needed this round)
- C's files under `../tmp/studio-real-loop/c-round-*` (read only; copy what you need into your system temp directory)

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, push or deploy; reverting round-6 work.

## 3. S1 — C-R6-02: drift regression, measure first

**What C found.** RF6-2 (the RF5-1 repeat) failed. Of 30 R3-V1 runs, 22 passed, 6 failed and 2 were invalid. 8 runs had app-attributed LoAFs ≥ 10 ms; round 5 had none:
- ArrangementContext rAF 16–33 ms;
- VideoDock `step` 22 ms;
- one React `performWorkUntilDeadline` of 62 ms right after Play (Lr2_2, ex max 0.206).

RF5-3 had 4 clean passes out of 9. In F_1..3, video did not start within 300 ms after the Play that followed five loop runs. The machine ran at 23–100 % CPU. The steady rAF tick costs a median of 0.1–0.2 ms but peaks at 1.7–7.8 ms. The cause (app or preemption) is **unconfirmed**. D-24 counts app-attributed time against the app, so this is an app bug until proven otherwise.

Round 6 added per-frame work: overview playhead/frame subscribers, the Follow check (A already moved it to cached values), overview `setVisibleStart` on scroll, and more state in `StudioWorkspace`.

**Do this, in order:**
1. **Read C's evidence first.** From the `_raw.json` LoAF entries of the FAIL runs, list the top app scripts (function/`invoker`, duration, `forcedStyleAndLayoutDuration`) and the time in the run. Name what they are.
2. **Measure before editing (baseline).** On the current tree, in your own runs (R3-V1 layout, 13 s, light harness copied to your temp dir):
   - per-frame cost of `tick()` and of **each** position-store subscriber and the dock `step` (instrument with `performance.now()` in a harness wrapper or a temporary local patch you remove before the end; never leave instrumentation in the source); report p50/p95/max per function;
   - whether any per-frame path reads layout (`getBoundingClientRect`, `offsetWidth`, `clientWidth`, `scrollLeft`) after writing style in the same frame (forced layout);
   - the React work on the Play click: which components re-render on the `isPlaying` transition (React render counts in a test, the R4-M2 pattern) and the LoAF app script duration of the Play click (median of 5).
3. **Fix what the measurements show.** Expected candidates, none mandatory without evidence:
   - (a) per-frame subscribers write only `transform` or other compositor-only properties, with no layout reads;
   - (b) components that do not depend on `isPlaying` (clips, overview bars, library rows, ruler ticks, lanes' clip lists) do not re-render on Play/Pause;
   - (c) no React state update per scroll frame during Follow.
4. **Measure again** with the same method. Put the before/after numbers side by side in your report.
5. **RF5-3 F_1..3:** reproduce C's order (5 loop runs right before a fresh Play). If `play()` is not called, or the video does not start within 300 ms, find the cause and fix it. If it does not reproduce in 10 tries, say so with your runs.

**Acceptance (C):**
- **RF7-P1 (per-frame discipline, verdict).** C records LoAF during 13 s R3-V1 playback in 5 runs: every app-attributed script entry in steady playback (excluding the 300 ms after Play) has `forcedStyleAndLayoutDuration` ≤ 1 ms. A's report names each per-frame callback with its before/after p50/p95/max.
- **RF7-P2 (Play render budget, verdict).** A test asserts that `ArrangementClip`, `ArrangementOverview` (bars), the library list rows and the ruler tick list render **0 times** on a Play→Pause→Play sequence (render-count pattern). In the browser, the app-attributed script duration of the LoAF containing the Play click has a median ≤ 16 ms over 5 Play clicks (C reports all 5 and the machine CPU).
- **RF7-2 (drift, verdict; the RF6-2 set repeated).** R3-V1: 10 same-load + 5 reload runs. R2-V3: 3 + 2. RF5-2: 5 loop runs. Light harness; D-24 rules **unchanged**: raw and stall-excluded series, app-attributed LoAF ≥ 10 ms counts against the app, invalid cap 5. Each run additionally reports:
  - machine CPU % (sampled at 1 s, e.g. `typeperf "\Processor(_Total)\% Processor Time"` or `Get-Counter`): median and max during the run;
  - the count of app-attributed LoAFs ≥ 10 ms.

  The CPU column is reported only. It does not change the verdict.
- **RF7-3 (first Play, verdict).** RF5-3: 3 fresh runs **plus** 3 runs that each follow 5 loop runs (C's F_1..3 order): `play()` within ±16.7 ms of `startAt`, w1 ≤ 0.1, w2 ≤ 0.06, no harness `hold:false` artifact counted as a failure (C records the rule it uses).
- **RF7-U.** The render-count test from RF7-P2, plus tests for any changed per-frame function. If `video-sync.ts` changed, all D-19/D-24/D-24a tests still pass and the changed contract is named.
- **Regression:** RF6-1 (forced persistent lag, C's 20 s fixture `c-round-6/media/long-20s-vp9-opus.webm`, with the D-24a release wording in §6.2) if the dock `step` or `video-sync.ts` changed. Also R10-N6 and R4-M2 (now also the detail panel).
- **Tech Lead (carried, now required evidence):** RF7-2 on a quiet real Windows Chrome, VP9 + H.264.

## 4. S2 — C-R6-03: the last ruler label overflows the timeline

**What C found.** After Fit at 1280×720 (Middle East on music at 0, Ctrl+D ×2, end 05:04.056), `scroller.scrollWidth` is 1074 px while the timeline content is 1054.7 px. The last label `5:30` (`absolute left-1 whitespace-nowrap`) hangs 19.2 px past the content and adds scroll width beyond the 30 s tail. On an empty project the overflow is 31.6 px (`0:30`).

**Fix:** outcome only; the mechanism is yours. For example: skip a label that would not fit inside the content, right-anchor the last one, or clip the ruler's label layer.

**R10-N5r (C).** At 1280×720 and 1440×900:
- C's two cases (Fit after Ctrl+D ×2, and an empty project at the default zoom and after Fit): `scroller.scrollWidth − timeline content width ≤ 1 px`.
- Labels ≥ 40 px apart, no overlap.
- No visible label is cut in half.
- R10-N5's other parts still pass: Fit on 4 and 20 minutes, the overview extent grows.

**R10-N5-U:** a view/ruler test for the label-fit rule.

## 5. S3 — C-R6-01: a Volume drag is a gesture (D-30)

**What C found.** A Volume slider preview started **before** a clip gesture can be committed during that gesture and writes a `Volume` entry mid-gesture. Nothing is lost and the undo chain stays consistent. This is the same as checkpoint-r6-review #10.

**D-30 (binding, amends D-26 rule 3).** A **pointer drag** on a track Volume slider is a pointer gesture:
- its `pointerdown` claims the D-26 registry: `claimPointerGesture(pointerId, abort)`;
- its abort reverts the preview to the stored value, writes no history and releases the claim;
- it ends on pointerup, change, lostpointercapture, blur or a same-pointer takeover.

While it is active:
- a clip, brace, marquee, ruler or playhead pointerdown from another pointer is ignored (D-26 rule 1);
- Mute/Solo and the other refused commands are refused (D-26 rule 3).

If the claim is refused because another gesture is active, the slider does not move: the existing snap-back and status stay as they are. Keyboard changes on a focused slider stay single commits and are refused during a gesture, as now.

**Acceptance (C):**
- **R30-1.** C's `volpre.js` order: slider pointerdown + move (preview), then pointer 7 tries a clip header drag, then the slider is released, then pointer 7 is released. Expected:
  - the clip does not move;
  - there is no history entry from pointer 7;
  - exactly one `Volume` entry, written at the slider's release;
  - `isPointerGestureActive()` is false afterwards.
- **R30-2.** A normal slider drag still writes one entry with the final value; Ctrl+Z restores the old value. The R26-2 order (clip drag first, then the slider) still snaps back with the status message.
- **R30-U.** Component tests for both orders and the abort path (blur mid-drag → stored value restored, no entry). The first test must fail on the round-6 code. Say how you know: run it once before the fix, or reason from the old code path; no git stash or checkout.

## 6. S4 — docs honesty and the D-24a wording

### 6.1 Doc 015
Status/TODO lines only:
- C round 6 failed RF6-2 (C-R6-02) and R10-N5 (C-R6-03); every other round-6 ID passed;
- C-R6-01 is open;
- the 21 G6-R IDs that C did not re-run are not PASS;
- the Tech Lead real-mouse / quiet-Chrome list.

No PASS claim beyond C's. Doc 016 covers round 7.

### 6.2 D-24a release wording (binding for C; no code)
"After the forcing stops" in RF6-1 now means:
- no escalation whose qualifying `T`-window **began after** release;
- at most **one** in-flight escalation from a window that was already qualified at release, issued ≤ `T` + 150 ms after release;
- then |d| ≤ 0.1 within 1.5 s and no further escalation.

Both A's 139–160 ms case and C's 21–29 ms case satisfy this.

**R7-D1 (C):**
- doc 015 and 016 make no unverified PASS claim;
- doc 015 lists RF6-2/R10-N5 as failed in round 6 and C-R6-01..03 as open, or as fixed in round 7 pending C.

## 7. U1 — SRW-11B: detail panel, track fold and height, floating video (FB-08, D-29)

**Common rules (D-29):**
- Track heights, fold state, detail-panel height/collapsed state and the expanded video are **view state**. They are not in `Arrangement` and not in the edit history; Undo never changes them, and export ignores them.
- Every new pointer drag (track-height handle, detail separator, floating-video drag) **claims the D-26 registry**. While it is active, Follow does not scroll (D-28) and arrangement commands are refused.
- New buttons, separators and inputs never trigger global shortcuts by accident:
  - Space on a focused button activates the button, not the transport;
  - ↑/↓/←/→ on a focused separator or the video drag handle are consumed by it (no clip nudge);
  - number inputs are text fields for `+ − Z X Space Delete` (the existing `isTypingTarget` rule).
- All motion uses `motion-safe:` transitions of 300 ms. Everything uses design tokens only; no new CSS file and no `app/styles` change.

### 7.1 Detail panel (PNL-01)
- **Placement:** a full-width panel under the timeline scroller and above the footer, inside the right column. A horizontal separator sits between the timeline and the panel. Default height **144 px**; range **120–280 px**.
- **Collapse:** the panel header row (36 px) holds the title `Clip Detail` (or the design-philosopher's Georgian label), the selected name, and a toggle (`დეტალები ▾` / `▸`, `aria-expanded`). Collapsed = 36 px; the header stays visible, so no extra control is needed in the transport (it has ~19 px slack at 1440, R10-N8). A separator drag or ↑/↓ on a collapsed panel opens it first.
- **Resize:** the separator has `role="separator"`, `aria-orientation="horizontal"`, `aria-valuemin` 120, `aria-valuemax` 280 and `aria-valuenow`. Pointer drag (claims the registry; no transition while dragging); ↑ = +16 px, ↓ = −16 px, clamped.
- **Content, one clip selected:**
  - name, lane name, start, length, source offset (`formatArrangementTime`), and the line `წყარო უცვლელი რჩება`;
  - a mini waveform of the clip's visible part (reuse the existing peaks; a video clip shows a labelled placeholder);
  - a detail playhead line, shown only while the position is inside the clip. It follows the **position store**, not the per-frame context (R4-M2);
  - a range overlay when a range on that lane overlaps the clip;
  - range inputs `start`/`end` in seconds (type number, step 0.001) and a `მონიშვნა` button, which Enter also triggers.

  Applying a range is valid when both values are finite, end > start and both lie within the clip (±0.01 s). It then calls the existing range setter for the clip's lane: no history, and the footer range line updates. Otherwise nothing changes and the status says `მონაკვეთი კლიპის საზღვრებში უნდა იყოს; დასასრული დასაწყისზე მეტი უნდა იყოს.`. On lanes where a waveform range cannot be drawn today, the inputs are disabled with the reason in `title`.
- **Several clips selected:** `{n} კლიპი`, the lane names, the earliest start and the span length; inputs disabled with the reason; one note line (group move / Delete / Ctrl+D).
- **Nothing selected:** a hint line; inputs disabled.
- Keep the footer's `arrangement-selected-clip` line and every existing test id unchanged. C's scripts use them. A design ruling against the duplication is recorded as a follow-up, not applied.

### 7.2 Track fold and height (TRK-04, TRK-05)
- **Fold:** a `▾`/`▸` button in each lane header (`aria-expanded`, `aria-label` `{track} დაკეცვა ან გახსნა`). A folded lane is **36 px**.
  - Its header row keeps the name and compact **M** and **S** buttons with the same `aria-label`/`aria-pressed`/refusal behaviour as the full ones. Volume and the video lane's `ორიგინალი ხმა` line are hidden.
  - Clips on a folded lane keep header move, selection, cross-lane drag and edge trim. The waveform body and waveform range selection are not shown; the clip `title` says unfold to select a range.
  - Playback, mute and export are unaffected by fold.
- **Height:** a bottom-edge handle per lane: `role="separator"`, `aria-orientation="horizontal"`, `aria-valuemin` 60 (video lane 52), `aria-valuemax` 180, `aria-valuenow`.
  - Pointer drag (claims the registry) and ↑/↓ = −8/+8 px (↓ grows, as in the prototype), clamped.
  - Changing the height unfolds the lane. Default height stays **80 px** (today's `h-20`).
- **Alignment:** header and lane share one row, so they are always the same height. C asserts ±1 px at every height, folded and unfolded.
- **Lane auto-fit (D-29 height budget).** At 1280×720 the fixed rows (studio header, wrapped transport 87 px, dock 107 px, footer) leave ≈ 300 px for the ruler, the loop strip and the lanes once the detail panel is open. 4 × 80 px would not fit.
  - While auto-fit is on (the default), the lanes shrink when the default heights do not fit the visible lane area (scroller client height − sticky ruler/loop − horizontal scrollbar), as in the prototype `fitLanes`:
    - video = max(52, round(free × 0.2));
    - each open audio lane = max(60, floor((free − video) / n));
    - folded lanes stay 36;
    - no lane grows above its default.
  - Recompute on window resize, detail collapse/resize, fold and library collapse (ResizeObserver; no per-frame work).
  - The first manual height change (drag or keys) turns auto-fit off for the session. Fold does not.
  - If even the minimums do not fit, the scroller scrolls vertically, as today.
- **Hit testing:** cross-lane drag, marquee and library drop must use the real row rectangles, as today. Variable heights must not break them.

### 7.3 Floating video (VID-06)
- **Expand:** a `⤢` button on or beside the compact video box (`aria-label` `ვიდეოს გაფართოება`).
  - The **same** box becomes `fixed`, placed over the library area at (library left + 8, library top + 8), width min(640, library width − 16), 16:9.
  - If the library is collapsed, it opens temporarily and collapses again when the video returns to compact.
  - The compact slot keeps a 160×90 placeholder (`ვიდეო გაფართოებულია` + a return button), so the dock strip height does not change (Δ 0 px).
  - Status: `ვიდეო გაფართოვდა ბიბლიოთეკის თავზე. გადაათრიე სასურველ ადგილას; Esc ან ✕ აბრუნებს.` When the library was opened for it, use the prototype's text about the temporary opening.
- **Move:** pointer drag on the box (or the `⠿` handle; claims the registry) and arrow keys on the focused `⠿` handle (16 px). The window is clamped inside the viewport and re-clamped on window resize.
- **Return:** `✕`, the placeholder button or **Esc** returns the box to the compact dock. Esc precedence: an expanded video collapses first, unless the event was already handled by a focused text field (the library search clears first). Collapsing the library (◀) while the video is expanded returns it to compact, with the prototype status text.
- **Sync:** the same two `<video>` nodes throughout (`isSameNode`), the sync loop unchanged, playback continues across expand → drag → return.
- **Compact size slider and video fold: not added (D-29 decision).**
  - D-22 fixes the compact box at ≥ 160×90, and the prototype slider (128–168 px) would go below it.
  - In the real layout the strip height comes from the overview column (≈ 84 px) as much as from the 90 px box, so a fold would free almost no height.
  - Hiding a playing video element adds a decode/sync risk.
  - The floating window covers "bigger video". This UI contract can be revisited by the Tech Lead.

### 7.4 Acceptance (C)
- **R11-P1b (detail panel layout).**
  - Collapse/expand via the header toggle: height 36 ↔ the previous height, with a 300 ms height transition (`motion-safe`; `prefers-reduced-motion` → none).
  - Separator drag ±40 px and ↑/↓: ±16, clamped 120/280, `aria-valuenow` matches.
  - The timeline scroller's height changes by the same amount; the panel never covers the timeline.
  - No history entry; no clip nudge from the arrow keys.
- **R11-P1c (detail content).**
  - One music clip selected → name, lane, start, length, offset match the footer line.
  - Inputs 3.5 / 7.25 + `მონიშვნა` → range 00:03.500 — 00:07.250 on that lane (footer range line, Delete-hint visible), no history entry.
  - Inputs outside the clip or end ≤ start → the refusal status, range unchanged.
  - Two clips → `2 კლიპი`, inputs disabled. No selection → hint, inputs disabled.
  - While playing across the selected clip, the detail playhead moves and disappears outside the clip.
  - The detail panel does not re-render on position updates (render-count, R4-M2).
- **R11-P2 (fold and height).**
  - Fold the music lane → its row is 36 px (±1), header and lane equal (±1). M and S in the folded header toggle mute/solo with the same `aria-pressed` and audible/export behaviour (export with music muted: the music oracle is silent).
  - Unfold → previous height.
  - Height handle on the SFX lane: drag +60 px → 140 (±1); ↑ ×3 → −24; clamped at 60 and 180 (video 52).
  - With mixed heights (music folded, SFX 140), a cross-lane header drag music → stems and a marquee from the stems lane into the SFX lane select/land on the right lanes (R8-M1, R6-S2 re-run on these heights).
  - No history entry from fold or height; Undo does not change heights.
- **R11-P2a (auto-fit).**
  - At 1280×720 with library open, detail open (144) and a video clip, all 4 lane rows, the ruler and the loop strip lie fully inside the scroller viewport without vertical scrolling, and every lane is ≥ its minimum.
  - After one manual height change, auto-fit is off: resizing the window does not change that lane.
  - At 1440×900 the lanes are at their default 80 px if they fit (C reports the measured heights).
- **R11-P3 (floating video).** While playing an R3-V1 layout:
  - ⤢ → the box is `position: fixed` inside the viewport, width ≤ 640, over the library; the strip height Δ 0 px.
  - Drag to beyond the right/bottom edge → clamped inside (±1 px). Arrow keys on `⠿` → 16 px steps.
  - Esc → compact again (box back in the dock, ≥ 160×90).
  - With the library collapsed: ⤢ opens it and ✕ collapses it again. ◀ while expanded → compact.
  - Same `<video>` nodes throughout; video |d| ≤ 0.1 in the light harness across the whole sequence (excluding 300 ms after each layout change); 0 `currentTime` writes while seeking.
- **R11-P4 (layout shots).** 1440×900 and 1280×720:
  - detail open and collapsed;
  - one lane folded;
  - video expanded;
  - library open and collapsed.

  In every shot: no overlap or clipping of header, transport, dock, lanes, detail, footer; footer one line (R11A-3); transport per R10-N8; the compact dock ≥ 160×90. Shots `panels-1440.png`, `panels-1280.png`, `panels-1280-collapsed.png`, `video-expanded-1280.png`, `fold-1280.png`.
- **R11-U.**
  - `panels.test.ts`: detail clamp/step; track clamp/step per kind; auto-fit (fits → defaults; short → minimums; folded lanes; video share); float placement clamp, including a window smaller than the box.
  - Component tests:
    - fold keeps M/S working;
    - height/fold/detail changes write no history;
    - the height handle and detail separator claim the registry (a second pointer on a clip is ignored during them);
    - arrow keys on the separators do not nudge a selected clip;
    - Esc collapses an expanded video before anything else;
    - the expanded video keeps the same `<video>` nodes;
    - the detail panel does not re-render on position updates.

## 8. Required tests (behavioural, named)

- RF7-P2 render-count test and any per-frame function test (RF7-U).
- R10-N5-U label fit.
- R30-U (both orders + abort).
- `panels.test.ts` and the component tests (R11-U).
- Any refusal or status text added in §7 is asserted by a test.

## 9. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**`/check` rule (unchanged):**
- `--write` only on paths you own this round (never on `Header.tsx`);
- `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files, then re-run the hash check;
- never `npm run format`.

**Dev server and browser.**
- Use the running `http://127.0.0.1:5173`; do not start or stop servers.
- All browser work goes through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`. Use real `$B press` keys.
- Media fixtures: `../tmp/studio-real-loop/media/` and C's 20 s fixture `../tmp/studio-real-loop/c-round-6/media/long-20s-vp9-opus.webm` (read only).
- For drift, use adapted copies of C's **light** harness in your system temp directory, not in `c-round-*`.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** Invoke the actual `code-reviewer` subagent, fix its findings, and quote its summary.

## 10. Report `../tmp/studio-real-loop/a-round-7.md`

1. The pre-flight gate.
2. The design-philosopher ruling (detail panel, lane header, dock strip), quoted.
3. Files actually changed (a subset of §2.2); which dock changes belong to the S1 grant and which to the U1 grant; confirmation that no round-6 file was reverted and that `Header.tsx` is byte-identical to HEAD.
4. Verbatim command tails.
5. S1 evidence:
   - C's LoAF top scripts with names;
   - your before/after table (per-frame p50/p95/max per callback, forced layout, Play render counts, Play-click LoAF median);
   - what you changed and why;
   - your own RF7-2/RF7-3 runs (count, worst run, app LoAF count, CPU).
6. Changed tests, each with its reason; new tests listed; for R30-U, how you know they fail on the old code.
7. code-reviewer findings and your fixes.
8. Constants: detail 144/120/280/±16, collapsed 36, track 80/60/52/180/±8, folded 36, auto-fit formula, float width/offset/step.
9. Deviations, each with a reason.
10. **"Not ready" acceptance IDs per item** (S1, S2, S3, S4, SRW-11B).

Do not claim PASS.

## 11. What C will verify (in this order)

1. **Track S:** RF7-P1, RF7-P2, RF7-2, RF7-3, RF7-U; R10-N5r, R10-N5-U; R30-1, R30-2, R30-U; R7-D1; RF6-1 (if the dock `step` or `video-sync.ts` changed, with the §6.2 wording).
2. **Track U:** R11-P1b, R11-P1c, R11-P2, R11-P2a, R11-P3, R11-P4, R11-U.
3. **Gates:**
   - **G7-1.** tsc 0. vitest ≥ 761 + new, 0 failures. Build passes. Biome 0 errors (owned paths and `./app`).
   - **G7-2.** Protected hashes OK. `git status` / `git diff --stat` show only paths from §2.1 and §2.2 (path allowlist); `Header.tsx` identical to HEAD; no change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` or `studio-lab-demo.ts`.
   - **G7-3.** Anonymous `/studio-lab` (direct and via the header link):
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
     - media only the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **G7-R (regression; mandatory, not-rerun ≠ PASS).**
   - **First, the 21 IDs C did not re-run in round 6:** R1-B5, R2-V1, R3-V2, R3-V4, R4-B1, R5-L3, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R11A-2 (**both** the pointer and the keys half), R12-L2, R12-L4, R5-B5, R5-B1u.
   - **Then, because SRW-11B changes lanes and layout** (with the detail panel open and one lane at a non-default height where relevant):
     - R1-B8, R1-B10, R1-E1, R1-E5;
     - R4-P1, R4-B3 (also the dock strip and the detail separator, Δ 0 px across states), R4-M2 (incl. the overview and the detail panel);
     - R6-S1..S4;
     - R8-M1, R8-M2, R8-M5;
     - R9-C1..C4;
     - R10-N1..N4, R10-N6, R10-N8;
     - R11A-1, R11A-3;
     - R12-L1, R12-L3;
     - R26-1..3, R27-1, R5-B1r;
     - R22-1.
5. **G7-shots** at 1440×900 and 1280×720 (§R11-P4, plus the R10-N5r ruler end).
6. **Harness notes for C:**
   - Light harness only for drift; raw and stall-excluded series per D-24; the per-run CPU column (§3).
   - Synthetic pointers are acceptable for R30-*, R11-P2/P3 drags and separators. Every synthetic pointerdown that should start a gesture needs `buttons: 1`. Record the real-mouse limits.
   - Esc and the arrows with a real `$B press`.
7. **Tech Lead real-mouse / real-Chrome list (carried, not this round's verdict):**
   - R23-1/R23-2 scrollbars;
   - R12-L4 HTML5 drag;
   - RF7-2 (and RF6-1/RF6-2) on a quiet real Windows Chrome, VP9 + H.264. This is now required evidence because of C-R6-02;
   - R8-M1/M2, R10-N1/N2 real mouse, real Ctrl+wheel and pinch;
   - R11-P3 floating-video drag and the R11-P2 height handle with a real mouse.
