# CURRENT TASK — Round 84: SRW-19 (FB-07) — video opacity fade (from/to black, preview only, honest export text) + X1 = C-R83-L1 (envelope points aligned with the ruler) (D-29z49)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-83.md` (an exact `cmp` copy). Rationale: `b-round-83.md`. Decision record: D-29z49 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature (SRW-19, both acceptance rows R19-F1 and R19-F2) with one owner (A), plus **one bounded, labelled C bug fix X1 (C-R83-L1, Low)**. X1 is the only open C bug. It is two coordinate changes in one file, and C re-checks it with the same harness it used in round 83. One doc grant (doc 073 l.4).
- **SRW-19 is complete after this round** if C passes it. Nothing is deferred or shrunk.

## Why this round
- **C round 83: PASS, `browserVerified=true`, `realVerified=true`.** 17 rows at both viewports. The only BLOCKED item is the fake-Bearer 403 sub-check (backend unavailable in the cloud).
  - R18-A2 export evidence: 550,766 samples, max |x/ref − env| = 1.1e-4.
  - The split export is bit-identical to the pre-split export. Trim and Delete-range results match outside the edited span (≤ 1.2e-7).
  - One Low bug, **C-R83-L1**: a double-click at ruler time T stores T − 1 px (5.975 for 6.000 at 40 px/s). The drawn point and the polyline vertex also disagree by 1 px.
- **Gate 83** published `a68c81d91be994ee02eb00e184cbdcc06b5f5a60` to both remotes (review 8/10, COMMIT OK, verify 2008/2008).
  - Reviewer M1 (sticky header overlap): C's round-83 probe did **not** reproduce it. It becomes probe row **P-M1** here; there is no fix without a repro.
  - M2 (reschedule per pointermove) is a signal.
  - L1, L2 and L3 go to the Lows batch. L4 is the second half of C-R83-L1 → X1 (envelope only).
- **SRW-18 is now "მოწმდება"** (both stages C PASS with browser evidence; Tech Lead R82-T/R83-T remain).
- **No Critical, High or Medium C bug is open.** The regression round is not due yet: `regression-last.json` = 2026-10-21, due on/after **2026-10-24**.
- **SRW-19 depends on SRW-03.** SRW-03 is `regression_open` only for a Tech Lead quiet-Chrome sync check (C-R6-02). That is not a blocker: the video lane, transport and dock are C-verified.
- **Next scope in dependency order:** SRW-19 (this round) → SRW-20 → Lows batch → SRW-21 → full regression → T12.

## Baseline (measured by B, 2026-10-22)
- **HEAD `a68c81d91be994ee02eb00e184cbdcc06b5f5a60`** (published by gate 83). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-83-r84-tree-sha256.txt`, **478** entries, **478/478 OK**.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-83-r84-tree-sha256.txt`.
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 6 owned existing files below.
  - Frozen examples: `fades.ts`, `model.ts`, `clipboard.ts`, `video.ts`, `video-sync.ts`, `graph.client.ts`, `ArrangementContext.tsx`, `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `types/arrangement.ts`, and every test except the one named in §Files (`clip-fades.test.ts`, `clip-fades-ui.test.tsx`, `envelope.test.ts`, `floating-video.test.tsx`, `export-dialog-*.test.tsx`, …).
- **Snapshots:** `../tmp/studio-real-loop/b-round-83-r84-snapshots/` (`SHA256SUMS.txt`). All LF, CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/components/arrangement/ArrangementClip.tsx` | `3e6d1c2c` | 936 |
  | `app/components/arrangement/ArrangementVideoDock.tsx` | `3d5acc51` | 957 |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `89de832c` | 308 |
  | `app/components/arrangement/ArrangementClipEnvelope.tsx` | `ccb12caa` | 401 |
  | `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | `54ddd732` | 798 |
  | `docs/implementation/2026/quarter-IV/073-studio-lab-clip-volume-envelope-stage-2.md` | `d9a59315` | 110 |

- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). The auth files are also never touched.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected.
  - Re-check at phase start.
  - Never start or stop servers.
  - A row that truly needs the backend is "BLOCKED: backend unavailable in cloud".
- **Do not change the repository state:**
  - never stash, reset, checkout, clean or re-create anything;
  - a mismatch (another HEAD, non-empty status, a changed frozen file) means stop and report;
  - never run `biome check --write`, `format --write`, `npm run format` or `check:fix`; format new files through stdin to stdout;
  - run mutation proofs **in a scratch copy** (`a-round-84/mut/`, as in round 83), never in `store/`.

## 1. What changes (A)

### Today (B read the source at `a68c81d`)
- **Fields already exist.** `ArrangementClip` has `fadeIn?` / `fadeOut?` (`types/arrangement.ts`), and nothing in the model limits them to audio:
  - `withCutEdges` / `clampClipFadesAfterTrim` (`fades.ts` l.84–122) are used by `model.ts` (trim l.214/252, split l.269) and `clipboard.ts` (l.71, 157, 161) **for every clip kind**;
  - so a video clip that carries fades already follows the F3 edit rules (move/copy keep the fades; trim clamps them; split, Delete Time and Cut drop the fade at the new cut edge) with **no model change**.
- **Frozen tests lock the audio-only paths. They decide the design:**
  - `clip-fades.test.ts` **FD1** l.79–89: `setClipFade(…, 'v', 'in', 1)` on a video clip returns the **same reference**. `setClipFade` stays audio-only.
  - **FD6** l.248–264: `clipFadeShapes` excludes a video clip **even with `fadeIn: 1`**. So the audio graph never fades the video track's own sound. That is today's behaviour and it stays.
  - `clip-fades-ui.test.tsx` **FU1** l.299–330: a video clip has **no** element whose testid starts with `arrangement-clip-fade-`. The existing overlay is `arrangement-clip-fade-ramps` (`ArrangementClip.tsx` l.843) and the handles are `` `arrangement-clip-fade-${edge}-handle` `` (l.905). **Video handles and the video overlay must use a different prefix.**
- **`ArrangementClip.tsx`:**
  - the gesture kinds `fadeIn` / `fadeOut` exist; `setClipFade` is called at l.435 (drag preview) and l.742 (`resetClipFade`);
  - `showFadeHandles = !isVideo && !folded && !envelopeMode && width >= 24` (l.758);
  - the ramp overlay is drawn only for `!isVideo` (l.837);
  - labels come from `CLIP_FADE_LABELS` / `CLIP_FADE_HANDLE_TITLES` (l.44–48);
  - the round-83 X1 guard (`lastFadeDragRef`, 500 ms) is per edge and applies to any fade gesture.
- **`ArrangementVideoDock.tsx`:**
  - two `<video>` slots (active / standby) inside `arrangement-video-box` (l.869–912);
  - `applyRoles` toggles `opacity-0` **by class** on the slots (l.316–325), so an inline opacity on a slot would fight it;
  - the gap caption (`z-20`) and the float buttons (`z-30`) sit above the videos (`z-10`);
  - the box is `bg-background` (`--color-background: hsl(220, 20%, 4%)`, the project's near-black token) in both docked and floating states;
  - `ArrangementVideoGapCaption` (l.207–230) shows the per-frame pattern: `useArrangementPositionWriter(callback)` writes DOM directly on every position frame, with no React render.
  - `findVideoClipAt(arrangement, position)` (`video.ts` l.99) and `clipFadeGainAt(clip, time)` (`fades.ts` l.124) already exist.
- **`ArrangementExportDialog.tsx`:** the video option is disabled with `VIDEO_RENDER_REASON` (l.22–23, rendered at l.209–210). B grepped every test: **no test locks that string.**
- **`scheduleKey`** (`ArrangementContext.tsx` l.471, frozen): it is the JSON of all clips, so a video-fade edit during playback reschedules audio like any other clip edit (gate-83 M2 class). **No change this round.** It is recorded as signal SRW19-RESCHEDULE.

### Contract (B decision: the smallest honest behaviour consistent with FB-07 / R19-F1 / R19-F2; rationale in `b-round-83.md` §3)
- **V1 — Model.** Video clips reuse `fadeIn?` / `fadeOut?`: seconds, whole ms, omitted at 0, with `fadeIn + fadeOut ≤ duration` (the same clamp as audio). There is no new field and no change to `types/arrangement.ts`, `model.ts`, `clipboard.ts` or `fades.ts`. If A finds this impossible, **stop and report**.
- **V2 — New pure module `app/lib/arrangement/video-fades.ts`** (names may differ only if they stay grep-discoverable):
  - `setVideoClipFade(arrangement, clipId, edge, seconds)` behaves exactly like `setClipFade`, but only for a clip on a `video` track:
    - same rounding, clamp and omit-at-0 behaviour;
    - same reference for an audio clip, a missing clip, NaN, or no change;
    - import `clipFadeIn` / `clipFadeOut` from `fades.ts`; private helpers may be re-implemented locally.
  - `videoFadeOpacityAt(arrangement, position)`:
    - returns `clipFadeGainAt(clip, position)` for the video clip at `position` (via `findVideoClipAt`);
    - returns 1 when no video clip is there.
- **V3 — Audio is unchanged (picture-only fade).**
  - `clipFadeShapes` still excludes video clips (FD6). The video track's own sound, and every export, is bit-identical with or without a video fade.
  - Handle titles state this (V5).
  - **Why:** FB-07 asks for an *opacity* fade. Fading the sound too would be a second, unrequested behaviour. It is recorded as signal VIDEO-FADE-SOUND.
- **V4 — Preview (`ArrangementVideoDock.tsx`).**
  - Add one **fade overlay** inside `arrangement-video-box`, after both `<video>` elements:
    - classes `pointer-events-none absolute inset-0 z-10 bg-background`, so it sits above the active video by DOM order and below the `z-20` gap caption and `z-30` buttons;
    - `data-testid="arrangement-video-fade"`, `aria-hidden="true"`.
  - Its `style.opacity` = `1 − videoFadeOpacityAt(arrangement, position)`, written **per position frame** through `useArrangementPositionWriter`, like the gap caption. Read the arrangement from a ref (the latest arrangement).
  - **Write the DOM only when the 3-decimal value changes.** Outside a fade it stays `0` and is never rewritten.
  - It also exposes `data-video-opacity` = the **picture** opacity `videoFadeOpacityAt(…).toFixed(3)` (1.000 = fully visible).
  - Initial render: the value at the current position, so a stopped, seeked or reloaded view is correct without playing.
  - It works unchanged in the docked and the floating/expanded box.
  - **Black = `bg-background`** (`--color-background`, near-black hsl(220 20% 4%)). This is the project's black token (Tailwind-first, no hardcoded colour); the decision is recorded in doc 074.
  - Do **not** touch the slot `opacity-0` role logic, the sync code or the swap logic.
- **V5 — Handles on video clips (`ArrangementClip.tsx`).**
  - `showFadeHandles` drops the `!isVideo` term. Keep `!folded && !envelopeMode && width >= 24`, so **Env mode hides video fade handles too**, the same rule as audio.
  - **Testids for video:**
    - handles `` `arrangement-video-fade-${edge}-handle` ``;
    - overlay `arrangement-video-fade-ramps`;
    - **nothing** with the prefix `arrangement-clip-fade-` on a video clip (FU1).
  - **Titles:** `Video Fade In — სურათი (ხმა არ იცვლება) · drag · double-click = 0` and the same with `Out`.
  - **Labels and status:**
    - history label `Video Fade In` / `Video Fade Out`;
    - drag status `Video Fade In: 1.000 წმ` (a final period after release), exactly as the audio fade statuses but with the `Video ` prefix;
    - the double-click reset writes the same label.
  - **Setter:** the gesture preview (l.435) and `resetClipFade` (l.742) call `setVideoClipFade` when `isVideo`, otherwise `setClipFade`. The gesture kinds, thresholds, capture, `pointercancel` revert and the round-83 X1 guard are reused **unchanged**; add no new gesture kind.
  - **Overlay:** the ramp overlay for a video clip uses the same geometry as audio, with token colour `text-accent` or similar (no hex).
  - `data-fade-in` / `data-fade-out` already exist on every clip root.
- **V6 — Export text (`ArrangementExportDialog.tsx`, R19-F2).** The video option stays disabled with `VIDEO_RENDER_REASON` (unchanged). When **any video-track clip has an effective fade**, one extra line `data-testid="arrangement-export-video-fades"` appears near the video option:

  ```text
  ვიდეოს fade-ები მხოლოდ პრევიუშია — ვიდეოს რენდერი არ კეთდება, ექსპორტი მხოლოდ აუდიოა.
  ```

  No other dialog change. There is never a video file.
- **X1 — C-R83-L1 (bounded; `ArrangementClipEnvelope.tsx`, plus a narrow amendment of its round-83 test).** Acceptance, not mechanism. In a real browser at any zoom, on a clip whose root left edge is at the ruler x of `clip.start` (`data-clip-start`):
  - (a) a double-click whose pointer is at ruler time T stores T: `|stored − T| ≤ 0.5 px / pxPerSecond`, rounded to ms (at 40 px/s, ruler 6.000 → `6.000`);
  - (b) every point's centre x = ruler x of its `data-time`, within 0.5 px;
  - (c) the polyline vertex for each point = that point's centre, within 0.5 px;
  - (d) the line's right end lies at the clip root's right edge, within 1 px. This also removes the reviewer-L1 drift of up to 2 px.
  - The fade-ramp overlay's own 1–2 px drift is **not** in X1; it stays in the Lows batch.
  - **Test amendment grant:** `clip-envelope-ui.test.tsx` stubs only `body.getBoundingClientRect` and locks polyline literals at l.613, l.737 and l.741.
    - A may amend **only** literals or stubs that the alignment change makes wrong. List each amended line, with the old and new value, in `a-round-84.md`.
    - No assertion may be removed or weakened.
    - Add a new alignment test (AL1) that stubs the root and body rects with a 1 px border and asserts (a)–(c) numerically.
- **Docs:**
  - **doc 073 l.4** → exactly:

    ```text
    **სტატუსი:** Round 83 — C PASS (`browserVerified`), გამოქვეყნდა `a68c81d`
    ```

  - Doc 073 gets no other change.
  - **New doc 074** `docs/implementation/2026/quarter-IV/074-studio-lab-video-opacity-fade.md`, in Georgian with the TEMPLATE sections. Status: `Round 84 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z49)`. Record:
    - V1 (reuse of the fields; F3 rules hold);
    - V3 (picture only, and why);
    - black = `bg-background`;
    - the overlay approach (and why not slot opacity);
    - the X1 coordinate rule;
    - every Live difference from §4.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/lib/arrangement/video-fades.ts` | **new** (V2) |
| `app/components/arrangement/ArrangementVideoDock.tsx` | the fade overlay, its position writer and the arrangement ref (V4) + imports. Nothing else |
| `app/components/arrangement/ArrangementClip.tsx` | V5 only: `showFadeHandles` term, video testids/titles/labels, setter choice at the two call sites, video ramp overlay + import |
| `app/components/arrangement/ArrangementExportDialog.tsx` | the one conditional line (V6) + the expression that detects a video fade + import |
| `app/components/arrangement/ArrangementClipEnvelope.tsx` | X1 coordinate changes only |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` | X1 literal/stub amendments (listed) + new AL1 test |
| `app/lib/arrangement/__tests__/video-fades.test.ts` | **new** (pure) |
| `app/lib/arrangement/__tests__/video-fades-ui.test.tsx` | **new** (workspace UI, dock, export dialog) |
| `docs/implementation/2026/quarter-IV/073-studio-lab-clip-volume-envelope-stage-2.md` | l.4 only |
| `docs/implementation/2026/quarter-IV/074-studio-lab-video-opacity-fade.md` | **new** |

Expected end state: **6 M + 4 ??**. Everything else is frozen (the 478-entry list). If a frozen test turns red, **stop and report**; do not edit it.

### Required tests (behavioural; the IDs are for C to cite)
`video-fades.test.ts`:
- **VF1** `setVideoClipFade`:
  - sets, clamps (`in + out ≤ duration`, the other edge first) and rounds to ms;
  - omits the key at 0 (`toStrictEqual`);
  - returns the same reference for an audio clip, a missing clip, NaN, or no change;
  - `setClipFade` on the same video clip still returns the same reference (FD1 stays true).
- **VF2** `videoFadeOpacityAt`, for a video clip at 2 s, 6 s long, in 1 s and out 2 s:
  - 2.25 → 0.25; 2.5 → 0.5; 3.5 → 1; 6.5 → 0.75; 7.5 → 0.25;
  - before 2 or at/after 8 → 1;
  - a gap → 1;
  - two adjacent clips (out 1 s on the first, in 1 s on the second) dip to 0 at the boundary.
- **VF3** edits keep the F3 rules on video clips, through the real `model.ts` / `clipboard.ts` functions:
  - move and duplicate keep both fades;
  - trim start clamps;
  - split at mid drops the fade at the cut and keeps the outer ones;
  - copy/paste keeps them.
- **VF4** audio is untouched: `clipFadeShapes` of an arrangement with a faded video clip `toStrictEqual`s the same arrangement without the video fades. A `renderArrangementWav`-level or `applySchedule` check with the recording fake shows no fade node for the video clip.

`video-fades-ui.test.tsx` (workspace render, same harness style as `clip-fades-ui.test.tsx`):
- **VU1** a video clip ≥ 24 px renders the two `arrangement-video-fade-*-handle` elements and no `arrangement-clip-fade-*` element; audio handles are unchanged. Env mode on → no video handles. A folded video lane or a narrow clip → none.
- **VU2** dragging the video fade-in handle +40 px at 40 px/s → `data-fade-in="1.000"`, one entry `Video Fade In`, status `Video Fade In: 1.000 წმ.`. Ctrl+Z → 0.000; Ctrl+Y → 1.000. A double-click after 600 ms resets with one entry. `pointercancel` reverts with no entry.
- **VU3** dock overlay:
  - with the position store at 2.5 s (stopped), `arrangement-video-fade` has `data-video-opacity="0.500"` and `style.opacity` 0.5;
  - at 4 s → `1.000` / 0;
  - after a fade edit the value updates without playing;
  - the overlay is rendered in the floating box too;
  - a writer that receives the same value twice does not rewrite the style (spy or MutationObserver count).
- **VU4** export dialog: no video fade → no `arrangement-export-video-fades` line; one video fade → the exact line. The video option stays disabled with the unchanged reason.

### Mutation proofs (A runs them in a scratch copy; logs in `a-round-84/mut/`; each must turn at least one listed test red)
- (a) `setVideoClipFade` accepts audio clips (VF1).
- (b) opacity ignores fade-out (VF2).
- (c) the overlay writes `gain` instead of `1 − gain` (VU3).
- (d) a video handle reuses the `arrangement-clip-fade-` testid (VU1, or frozen FU1).
- (e) the export line is shown without a video fade (VU4).
- (f) the video setter is used for audio clips (VU2, or frozen FU tests).
- (g) the X1 double-click again measures from the body (AL1).
- (h) the overlay rewrites on equal values (VU3).

## 2. Pre-flight for A
- Read the applicable primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/studio-feature.md`, `new-test.md`.
- Verify the baseline before the first edit: HEAD, 0-line status, 478/478, snapshots, protected 4/4, LF/CR.
- Grep before coding:
  - every caller of `setClipFade` (expect the two in `ArrangementClip.tsx`);
  - every element whose testid starts with `arrangement-clip-fade-`;
  - every reader of `fadeIn` / `fadeOut` that assumes an audio track (graph, export, detail panel). A site that would now misbehave for a faded video clip, outside the grants → **stop and report**.
- Checks A runs (speed rules):
  - `npm run typecheck`, `npm run lint`, and a scoped `biome check` on the owned files (no `--write`);
  - targeted vitest: the two new files, `clip-envelope-ui.test.tsx`, plus every test that renders `ArrangementClip`, `ArrangementVideoDock` or `ArrangementExportDialog`, or imports `fades` / `video`. List them in `a-round-84/targeted-list.txt`. Not the full suite.
- A's own Playwright smoke at 1440×900 is welcome (not C evidence). Do one warm-up load first.
  - The cloud Chromium may not decode H.264. Use `media/beeps-6s-vp9-opus.webm` or `clip-4s-vp9-opus.webm` (in the loop folder's `media/`) for any pixel check.
- Run the code-reviewer (3+ files changed) and pass its Architecture note verbatim to B.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-84*`. **B** owns the planning artifacts. Root owns gates, commits and pushes.
- Protected (never edited): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, and the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`).
- `/studio-lab` stays the public **demo-only** workspace: demo collection badge, no purchased audio, no token/R2 requests. User video stays local (object URL); nothing is uploaded.

## 4. Ableton source table
**Sources:**
- Live 12 Reference Manual, "Working with Video", `https://www.ableton.com/en/live-manual/12/working-with-video/`. Fetched by B on 2026-10-22 with curl and stored as untrusted text in `b-round-83/web/working-with-video.{html,txt}`.
  - §28.2.1 "Video Clips in the Arrangement View";
  - §28.2.2 "The Video Window";
  - §28.2.2.1 "Movies with Partial Tracks";
  - §28.3 "Matching Sound to Video".
- §6.8 "Audio Clip Fades and Crossfades" (`b-round-71/ableton-arrangement-view-20261021.txt`).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Video clips in the Arrangement are treated like audio clips (trim by dragging edges) | §28.2.1 | Confirmed (text) | Same: video clips get the same fade handles as audio clips | VF-HANDLES |
| Gaps in video show a black screen | §28.2.2.1 | Confirmed (text) | Same: the gap caption already sits on `bg-background`; a fade goes to that same black | VF-PREVIEW |
| Picture opacity fade on a video clip | Chapter 28 (whole text) | **Not in Live** (no mention in the capture) | **CZABA addition, user request FB-07**; Ableton match = not applicable | VF-PREVIEW |
| Clip fades are linear, length set by dragging a handle, `in + out ≤ length` | §6.8 | Confirmed (text; audio clips) | Same rule and the same handles; picture only (V3) | VF-HANDLES |
| Live renders video in Export Audio/Video | §28.3 | Confirmed (text) | **Conscious difference (D-11):** CZABA does not render video; the dialog says so, including fades | VF-EXPORT |
| A fade on a video clip also fades its sound | — | Not in the capture (unconfirmed) | CZABA: picture only; the sound is unchanged (V3) | VF-AUDIO |

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup per session** (one warm-up load first):
- Snap off.
- Import `media/beeps-6s-vp9-opus.webm` through the file picker. Use the H.264 file only if this Chromium decodes it. Place the video clip at about **2 s** (Snap on for the move is fine), then call it "V". Read its **actual** `data-clip-start` (S) and end (E), and use them in every oracle: the times below written as 2.x / 8.000 mean S + (x − 2) / E, as in round 83.
- Demo audio stays as loaded.
- **Pixel rows:** if the cloud Chromium cannot decode any of the media (no frame ever painted), the pixel sub-check is "BLOCKED: codec unavailable in cloud", not a FAIL. The `data-video-opacity` / `style.opacity` oracle still runs.

| ID | Action | Pass evidence |
|---|---|---|
| VF-HANDLES | Hover / select V; toggle Env mode; fold the video lane | Two `arrangement-video-fade-*-handle` elements on V, with the exact titles. No `arrangement-clip-fade-*` inside V. They are hidden in Env mode and on a folded lane. Audio clip handles are unchanged. Screenshots |
| VF-IN (R19-F1) | Drag V's fade-in handle to 1.000 s (status shows it) | `data-fade-in="1.000"`; one `Video Fade In` entry; ramp overlay `arrangement-video-fade-ramps` on V |
| VF-PREVIEW (R19-F1, primary) | Stopped: seek to 1.5, 2.25, 2.5, 2.75, 3.5 s. Then play from 1.5 s and sample `data-video-opacity` and the overlay's computed `opacity` every animation frame up to 4 s | Stopped: 1.000 / 0.250 / 0.500 / 0.750 / 1.000 (±0.01), overlay opacity = 1 − value. Playing: monotonic rise from ≈ 0 at 2.0 s to 1 at 3.0 s, with every sample within 0.05 of (t − 2)/1 at the sampled audio position. **Pixel (secondary):** mean luminance of the box centre region at 2.25 / 2.75 s is between the background and the same frame at full opacity, ordered (0.25 < 0.75). Screenshots at 2.25 and 2.75 s |
| VF-OUT | Fade-out 2.000 s on V (V ends 8.000 s); stopped seeks 6.5, 7.5 s | 0.750 / 0.250 (±0.01); `Video Fade Out` entry |
| VF-FLOAT | Expand the video (floating box), seek to 2.5 s | Overlay present in the floating box with `data-video-opacity="0.500"`; screenshot |
| VF-EDITS | Each on a fresh faded V (Ctrl+Z back between edits; verify each restore): (a) move +1 s; (b) trim start +0.5 s; (c) Ctrl+E split at 5 s; (d) Ctrl+D | (a) fades unchanged, opacity curve shifted 1 s. (b) fade-in clamped as F3. (c) left keeps fade-in and has fade-out 0; right has fade-in 0 and keeps fade-out. (d) the copy carries both fades |
| VF-UNDO | Drag, Ctrl+Z, Ctrl+Y; double-click the handle > 1 s after the drag; a still press | One entry per drag; exact restore; double-click → 0.000 with one entry; a still press writes nothing |
| VF-AUDIO | Export WAV with V faded (in 1 s, out 2 s) and again after Ctrl+Z to no fades | The two WAVs are sample-identical (max difference 0). The video's own sound, if decoded, is not faded |
| VF-EXPORT (R19-F2) | Open Export with and without a video fade | The video option is disabled with the unchanged reason. With a fade, the extra line has the exact text; without one, it is absent. Exporting downloads only a `.wav` (no video file) |
| VF-PLAY-EDIT | During playback, drag V's fade-in handle | Playback continues, the position is monotonic, no console error, one entry. Record the audio source-restart count (signal SRW19-RESCHEDULE, not a fail criterion) |
| VF-SYNC | Stopped seeks to S+0.5, S+3.0, S+5.0 with V faded (in 1 s, out 2 s), then the same after Ctrl+Z to no fades. During the VF-PREVIEW play run, also sample the active `<video>.currentTime` | Stopped: the active `<video>.currentTime` = position − S + sourceOffset ± 0.1 s at each seek, the same with and without fades. Playing: the max \|currentTime − expected media time\| over the run is no worse than a paired no-fade control run by more than 0.05 s. Budget: 3 valid measurements; report honestly; do not loosen tolerances |
| X1-ALIGN (C-R83-L1) | Env mode; double-click the stems body at ruler 6.000, 10.000, 14.000 s at 40 px/s; repeat at another zoom | `data-envelope` `6.000:…;10.000:…;14.000:…` (each within 0.5 px / pxPerSecond). Point centre = ruler x of `data-time` ± 0.5 px. Polyline vertex = point centre ± 0.5 px. Line right end at the clip right edge ± 1 px. EN-ADD / EN-DRAG / EN-UNDO of round 83 still pass (short re-run) |
| P-M1 (probe, not a fix) | Env mode with points, and V with fade handles. Scroll the timeline horizontally until a point/handle lies under the sticky track header. `elementFromPoint` at that spot, then a real click on the header's mute button there | Report which element is topmost and whether the click hit the header control or the clip. A reproduction is filed as a bug for B with steps; no repro → closed as "not reproduced (2 probes)" |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning, no non-noise console error |
| G84-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace. `/api/studio-token?…` anonymous → 401. No token/R2/download request from `/studio-lab`. The header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T84-TARGETED | A's `a-round-84/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD, 6 M + 4 ??, frozen 478/478, A's end hashes, protected 4/4 |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Ableton match:** C reports it separately (confirmed / conscious difference / unconfirmed / not applicable), using §4.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutations (a)–(h) in a scratch copy, never in `store/`.

## 7. After this round
- **Round 85:**
  - a **regression round** if round-85 planning falls on or after 2026-10-24: one short browser check per done / c_pass item at both viewports, plus `npm run test:e2e:smoke`; A fixes only what C finds;
  - otherwise **SRW-20** (range export, MP3 via the existing ffmpeg with a clear error, off-main-thread encoding, video export honestly disabled).
- Then the Lows batch → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- The architecture checkpoint request (`b-round-83-checkpoint-request.md`) is with root and does not block this round.
