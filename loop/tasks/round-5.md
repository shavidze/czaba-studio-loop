# CURRENT TASK — Round 5: round-4 bugs (C-R4-01..04, root L6) first, then SRW-07 duplicate/group split → SRW-08 clips between lanes → SRW-09 clipboard

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-08
Previous task: `tmp/studio-real-loop/tasks/round-4.md`. C's verdict: **FAIL** (`c-round-4.md`, `c-round-4.json`): RF4-1 and RF4-2 failed as written, R23-1/R23-2 blocked by headless, new bug C-R4-02. Everything else passed. B's decision record: `b-round-4.md`.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-23, D-24 and D-25 are new and binding.**
Backlog: `tmp/studio-real-loop/backlog.json` (v5) → `C-R4-01..04`, `root-L6`, A's own known Low `A-R4-L9`, then `SRW-07`, `SRW-08`, `SRW-09`.
Working dir for all paths: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**The tree is NOT clean at dispatch.** HEAD is `cc1e531`, plus the uncommitted round-4 work (18 M + 12 ??), listed in §2.1. That work passed C and is the baseline. **Do not revert, re-create or reformat any round-4 file.** Edit on top of it. Nobody commits in this round; root makes the final commit after everything is done.

## 0. Two tracks, in this order

Finish Track S before Track U. Report "not ready" IDs **per item**. C verifies Track S first.

**Track S — bugs and measurement (bugs first)**
1. **S1 — C-R4-02 (Medium):** the gesture counter leaks on a second `pointerdown` (§3). D-23.
2. **S2 — C-R4-01 (Medium):** video drift on a loaded machine (§4). D-24: an app-side stall escalation, plus an explicit stall-exclusion measurement rule for C.
3. **S3 — Low bugs (§5):** C-R4-03 (library tree truncation), C-R4-04 (flat preview waveform), root L6 (export dialog wording with loop on), A-R4-L9 (preview waveform keyboard, empty message inside the listbox).
4. **S4 — docs honesty (§5.5):** update 013's status/TODO to C's round-4 results.

**Track U — next dependency-ordered scope (D-25)**
5. **U1 — SRW-07:** Duplicate (Ctrl+D), single and group; group split at the playhead (§6).
6. **U2 — SRW-08 (FB-03):** move clips between audio lanes; a modifier locks time; no copy left behind (§7).
7. **U3 — SRW-09 (FB-02):** internal clipboard — Copy, Cut (gap kept), Cut Time (gap closed on all lanes), Paste at the playhead (§8).

If an item is not finished, list its acceptance IDs under "not ready" for that item. C fails those IDs and B carries them over. Do not fake or soften behaviour.

**Not this round (no UI for these):** zoom/overview/Follow/Fit (SRW-10); floating video, detail panel, track height/fold (SRW-11B); gain/pan/master/meters (SRW-13); grid/snap/tempo/metronome (SRW-14/15); markers (SRW-16); track groups (SRW-17); fades/envelopes (SRW-18); video opacity fade (SRW-19); range/MP3 export (SRW-20); purchased mount (SRW-21); T12 Gain/Volume. Out of scope for the whole project: plugins/effects, pitch, multiple video layers, audio time-stretch.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md`, then: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Prompts `studio-feature.md`, `new-test.md`; skill `pre-flight`. Where a primitive example is stale, the code and this task win.
2. Read for behaviour only (do not copy code):
   - `c-round-4.md` §2 (mechanisms ა/ბ), §5 (C-R4-02 root cause), and C's scripts `c-round-4/scripts/leak.js`, `leakmusic.js`, `leak2.js`, `rf4.js`, `m4.js`, `loaf.js`, `r3v3c.js`.
   - Prototype `../output/studio-workspace-prototype/workspace.js`: duplicate (search `duplicateButton.onclick`, ~line 3073) and its refusal messages.
   - `../docs/technical/ableton-live-current-workflow.md` rows CLP-01, CLP-02, EDT-01..07.
3. **Design check (narrow).** C-R4-03 overrides the design-philosopher `w-24` ruling from round 4. Invoke the real `design-philosopher` subagent read-only on (a) the tree fix and (b) the cross-lane drag ghost (§7). Quote its ruling. Where it conflicts with an acceptance criterion here, the criterion wins and you record the conflict.
4. Read every file you change.
5. Post the **pre-flight gate** at the top of your report: assumptions, the smallest version per item, each file with its reason, the commands that prove success.

## 2. File ownership (exact; nothing else may change)

### 2.1 Baseline at dispatch (round-4 work, keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLane,ArrangementLibrary,ArrangementLoopBrace,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/components/layout/Header.tsx
 M app/contexts/ArrangementContext.tsx
 M app/data/studio-lab-demo.ts
 M app/lib/arrangement/__tests__/{transport,video}.test.ts
 M app/lib/arrangement/{demo-synth,loop,transport,video}.ts
 M app/types/arrangement.ts
?? app/components/arrangement/{ArrangementLibraryPreview.tsx,studio-scrollbar.ts}
?? app/lib/arrangement/__tests__/{ArrangementContext,demo-synth,library,position-store,video-sync}.test.ts
?? app/lib/arrangement/{library,position-store,preview.client,video-sync}.ts
?? docs/implementation/2026/quarter-IV/013-studio-lab-sync-library.md
```

`Header.tsx` is **frozen** this round: its round-4 diff (two `Link` blocks) must stay byte-identical. C diffs it.

### 2.2 May modify / create this round

**Modify:**
- `app/types/arrangement.ts` — new fields only if optional (SRW-21 adapter contract). No new field is expected this round.
- `app/lib/arrangement/model.ts`, `selection.ts`, `video-sync.ts`, `video.ts`, `peaks.ts`, `library.ts`, `schedule.ts`, `graph.client.ts`
- `app/lib/arrangement/__tests__/*.test.ts` and `*.test.tsx`. Existing tests may change only where §3–§8 change their contract; name each one with a reason.
- `app/contexts/ArrangementContext.tsx`
- `app/components/arrangement/*` (every existing file, including `ArrangementExportDialog.tsx`, `ArrangementLibraryPreview.tsx`)
- `app/data/studio-lab-demo.ts` (only for the C-R4-03 visible collection label, if you choose that route)
- `docs/implementation/2026/quarter-IV/013-studio-lab-sync-library.md` (status and TODO only, §5.5)

**Create:**

| File | Responsibility |
| --- | --- |
| `app/lib/arrangement/clipboard.ts` + `__tests__/clipboard.test.ts` | Pure clipboard logic (§8): copy from range/clips, cut, cut time, paste plan with all-or-nothing overlap check. No DOM. |
| `app/lib/arrangement/__tests__/gesture-reentry.test.tsx` (optional name) | Component tests for D-23 in `ArrangementClip` and `ArrangementLoopBrace` (you may put them in `ArrangementContext.test.ts` instead). |
| `docs/implementation/2026/quarter-IV/014-studio-lab-edit-clipboard.md` | Per `.claude/rules/implementation-docs.md` + `docs/implementation/TEMPLATE.md`, Georgian. If 014 is taken, use the next free number. |
| `../tmp/studio-real-loop/a-round-5.md` | Your report (§11). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

**Read-only imports allowed:** `~/lib/sfx-edit` (`encodeSfxWav`), `~/lib/sfx-video.client` (`seekSfxVideo`), `~/components/ui`, `~/lib/utils`, `@remix-run/react`.
**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard` (the clipboard is internal, §8).

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**` (Header is frozen), `app/routes/**` (including `studio-lab.tsx`)
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`
- `package.json`, lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, push or deploy; reverting round-4 work.

## 3. S1 — C-R4-02: gesture re-entry (D-23)

**What C found.** `ArrangementClip.beginGesture` and `ArrangementLoopBrace.beginLoopGesture` assign `gestureRef.current = {…, release: beginPointerGesture()}` without releasing an existing gesture. A second `pointerdown` (second finger, pen + mouse) creates g2 over g1. Release of g2 nulls the ref; the release of pointer 1 then finds no gesture, so g1's `release()` never runs and `gestureCountRef` stays ≥ 1. Undo/Redo and every edit stay blocked until reload. The ruler and the marquee do not leak.

**D-23 (binding).**
1. **Re-entry from a different pointer is ignored.** While a component's `gestureRef.current` is set, a `pointerdown` with a **different** `pointerId` on that component (any part: header, body, trim edge, brace edge, brace body) is ignored: no new gesture, no `beginPointerGesture()`, no selection change, no side effect on the first gesture. The first gesture continues and ends normally. (Releasing the first gesture before overwriting, as the ruler does, would abort the first drag mid-move.)
   **Same pointer = stale gesture.** A `pointerdown` with the **same** `pointerId` as the active gesture proves that pointer was released without us seeing it (the mouse pointerId is constant). In that case end the stale gesture first (call its `release()`, revert any uncommitted preview, write no history entry), then start the new gesture normally. This prevents a clip or the brace from becoming un-draggable after a missed pointerup.
2. **No orphan release.** Every gesture object that called `beginPointerGesture()` must reach its `release()` exactly once, on whichever path ends it: its own pointerup/pointercancel (captured or via `watchUncapturedPointerGesture`), unmount, or a capture failure. The uncaptured listener must not return early in a way that skips `release()` for its own gesture.
3. **Pointer filtering stays.** `handlePointerMove` and `finishGesture` continue to act only for the gesture's own `pointerId`.

**Acceptance (C):**
- **R5-B1 (browser, C's repro).** Run `leak.js` (video clip header), `leakmusic.js` (music clip header) and the brace variant: pointerdown id 1, pointerdown id 2 on the same element, pointerup 2, pointerup 1 (also window pointerup/pointercancel id 1). Then real Ctrl+Z, the Undo button and real Delete → all work (Undo restores the previous entry; Delete removes the selected clip). `isPointerGestureActive()` (or the absence of the blocked-status message) proves the count is 0. Repeat with a trim edge and the clip body (range). The first pointer's drag, if it moved, produces exactly one history entry.
- **R5-B1u (unit/component).** In `ArrangementClip` and `ArrangementLoopBrace` (rendered inside `ArrangementProvider`): two pointerdowns (ids 1, 2) + two releases → gesture count 0; two pointerdowns + unmount → count 0; capture throws on the first pointerdown + second pointerdown + window pointerup of id 1 → count 0; a stale gesture (pointerdown id 1, no pointerup, pointerdown id 1 again, pointerup id 1) → count 0, no history entry from the stale gesture, and the clip/brace is draggable again. These tests must fail on the round-4 code. Say how you know: by running them once before your fix, or by reasoning from the old code path (no git stash/checkout; the tree must not be reverted).
- **R5-B1r (regression).** C re-runs R3-V3 with its corrected `r3v3c.js` **and** with the original `c-round-2/scripts/r3v3.js` (whose stray pointerdown triggered the leak) → both pass, and Ctrl+Z works afterwards.

## 4. S2 — C-R4-01: video drift on a loaded machine (D-24)

**What C found** (keep in view):
- R2-V3 5/5, H.264 diagnostic 3/3, every hard D-19 rule held in every run, C-R3-02's wrap symptom gone (15/15 swaps).
- R3-V1: same-load 8/10 (9/10 after the 2 starvation re-runs), reload 2/5; RF4-2 4/5. All failures are video **lag** (d < 0).
- **(ა) Stalls.** Every failing light-harness run has a coincident long task / rAF gap of 50–117 ms; LoAF script time ≈ 0 (process stalls, not app JS). The machine was loaded (Brave, ChatGPT, VS Code installer).
- **(ბ) Decoder cannot follow the commanded rate (Lr5, first Play after a fresh load).** Rate was 1.75–2.0 for ~1 s, but the element's clock advanced only 0.72–1.08×, so |d| grew to 0.30 and recovered only at ~1.7 s. D-19 hard-seeks only above |d| > 1.0, so the app waited.

**D-24 (binding) has two halves.**

**(1) App half — stall escalation (fixes ბ).** Add a pure decision to `video-sync.ts`, for example `shouldEscalateVideoStall(window)`, and call it from the dock's control loop:
- **Input:** only samples from the current play segment (since the last `play()`, seek or swap): audio-clock time, element `currentTime`, the commanded rate. **Reset** the window on every seek, swap, play, pause, source change and role swap. This is an in-cycle measurement, not a learned or carried-over lead, so D-19 rule 2 still holds.
- **Trigger** (choose constants within these ranges and report them): the commanded rate has satisfied |rate − 1| ≥ 0.5 (≥ 1.5 when the video lags, ≤ 0.5 when it leads) for ≥ `T` ∈ [200, 400] ms, **and** |d| > `D` ∈ [0.08, 0.15] s, **and** |d| has not decreased by ≥ 0.02 s over that window. (An equivalent slope test is allowed: the measured media slope Δ`currentTime`/Δaudio-clock over the window is < 1.1 while lagging, or > 0.9 while leading. Pick one formulation, report it and test it.)
- **Action:** D-19 rule 5 seek-and-hold on the active element (pause → rate 1 → `currentTime = clamp(target + L)` → `seeked` → hold/play). All D-19 guards still apply: no write while seeking or pending, ≤ 1 hard seek per 250 ms per element, rate reset to 1 on the seek.
- **Rate limit:** at most one escalation per element per 1.0 s, measured from the previous escalation seek's `seeked` event (or its pending timeout).
- **Unit tests (RF5-U):** triggers on a lagging window at max rate whose |d| grows; does **not** trigger while |d| is shrinking, below `D`, at a non-edge rate, or with fewer than `T` ms of samples; resets on seek; symmetric for lead.

**(2) Measurement half — stall exclusion (for ა).** Thresholds are **unchanged** (median |d| ≤ 0.05 s, max |d| ≤ 0.1 s per run). C adds one more exclusion window and reports both series:
- **Stall window:** from the start of a LoAF ≥ 50 ms whose attributed **app** script time is < 10 ms (script ≈ 0, or script not from app/workspace code), or of a rAF gap ≥ 50 ms with no app-attributed script in it, to its end + 300 ms. Same logic as the hard-seek exclusion: no frame can be presented on time during a process stall. **An app-attributed long task (≥ 10 ms of app script) is not excluded and counts against the app.**
- **Validity:** if stall windows cover more than 10 % of a run's sampled time, the run is **invalid** (environment), is reported, and is re-run. At most 5 invalid re-runs in total across RF5-1 and RF5-2. **This rule replaces the RF4-1 "at most 2 starvation re-runs" rule;** there is no other re-run allowance. If the cap is exceeded, C reports "environment unusable" for the remaining runs: that is **not** a PASS; those IDs stay open for the Tech Lead real-Chrome check.
- **Verdict:** on the stall-excluded series. The raw series (no stall exclusion) is reported next to it, per run.
- **Rationale (recorded in plan.md D-24):** C's LoAF attribution shows the failing intervals are process stalls with ≈ 0 ms of app script. B cannot control the machine; it must not relax the tolerance. Excluding stall windows (capped at 10 %) measures the app, while any unstarved failure still fails.

**Acceptance (C):**
- **RF5-1** = RF4-1 repeated: R3-V1 layout, 10 runs in one load + 5 with reload; R2-V3 layout, 3 + 2. C's **light** harness only (no per-frame `getComputedStyle`). All RF4-1 hard rules still hold in every run: 0 `currentTime` writes while `seeking` on either element; rate in [0.5, 2.0] and exactly 1 on both after Pause; `muted` always true; exactly two `<video>`, one visible; at most one element not paused outside a ≤ 34 ms swap. At the R2-V3 continuous boundary 2.0: no seek, no swap. Report hard-seek and escalation counts per run.
- **RF5-1b (escalation, app half).** Within the RF5-1 reload series (first Play after a fresh load and import), every episode where |d| > `D` lasts ≤ `T` + 150 ms of **counted time** before either |d| starts shrinking or an escalation seek is issued (spy: pause + `currentTime` write). Counted time excludes stall windows and hard-seek windows (issue → `seeked` + 300 ms). An episode whose |d| grows for > 600 ms of counted time with no escalation is a FAIL. The 1.0 s escalation limit is measured from the previous escalation's `seeked`, not from its issue, so it cannot by itself cause this failure.
- **RF5-2** = RF4-2 repeated (video 0–6.008, loop 2–4, play from 1.0 for 8.6 s, 5 runs), same thresholds and exclusions, plus: 300 ms after each wrap `currentTime` ∈ [2, 4]; report swap vs fallback per wrap.
- **RF5-3** = RF4-3 regression with the **corrected text**: during the start hold the active element is **paused until `play()` is issued**; `play()` lands within [`startAt` − min(frameInterval, 20 ms), `startAt` + one measured rAF interval, max 34 ms]; the shown media time must not advance before `startAt` by more than one frame; drift ≤ 0.1 for `startAt`..+100 ms and ≤ 0.06 for +100..+300 ms.
- **RF5-U:** `video-sync.test.ts` covers the escalation cases above; all D-19 tests still pass.
- **Diagnostic (not verdict):** 3 R3-V1 runs with `beeps-6s-h264-aac.mp4`.
- **Tech Lead (manual, recorded, not a blocker for this round):** RF5-1/RF5-2 in real Windows Chrome on a quiet machine, VP9 and H.264.

## 5. S3 — Low bugs

### 5.1 C-R4-03 — library tree truncation
**Fix:** at the default library width (288 px) every tree node's label is fully readable, and the two collections are distinguishable by visible text. Mechanism is yours (wider tree column, wrapping labels, a shorter visible collection name). If you shorten the visible collection label, keep the honesty: the synthetic collection label keeps the words **"სინთეზური დემო"** (R12-L1 searches `ბასი დემო`), the public one still says it is the CZABA public preview / demo, and the library caption keeps the "not CZABA catalogue stems" notice. Search must still find sources by the words of their collection label (R12-L1).
**R5-B2 (C):** at 1280×720 and 1440×900, library open at 288 px: for every tree node `scrollWidth ≤ clientWidth` (no ellipsis) and each node ≤ 3 text lines; the list column stays ≥ 140 px wide; R12-L1, R12-L2 and R23-3 still pass. Screenshots `tree-1280.png`, `tree-1440.png`.

### 5.2 C-R4-04 — flat preview waveform
**Fix:** display-only normalisation of the **preview** waveform to the selected source's own peak (`peak / maxPeak`, guarded for silence). Audio is unchanged. Lane clip waveforms stay un-normalised this round (they will carry clip gain in SRW-13; normalising them now would hide gain later). Record this decision.
**R5-B3 (C):** for every demo source (2 MP3s, 2 SFX, 4 stems, the synthetic mix) the tallest preview bar is ≥ 28 of 32 px (or ≥ 87 % of the waveform height). Export of a stem still equals its JS buffer within 2⁻²² + 24-bit quantisation, as in R12-S1 (audio is unchanged by the display normalisation).
**Unit:** a test for the normalisation helper (silence → no NaN/Infinity; a 0.25-peak source → max column 1).

### 5.3 root L6 — export dialog wording with loop on
**Fix:** when the loop is on, the dialog must not claim the export is "the same graph as playback" without qualification. Say that the export renders 0..projectEnd linearly with the same mix, ignoring the loop. One line.
**R5-B4 (C):** loop on → the dialog text contains no unqualified "იგივე graph რაც დაკვრისას" claim and states that the loop is ignored; loop off → unchanged meaning. R5-E1 still passes.

### 5.4 A-R4-L9 — preview waveform keyboard and empty-state markup (A's own known Low)
**Fix:** the preview waveform is a keyboard-operable seek control: `role="slider"`, `aria-valuemin=0`, `aria-valuemax=duration`, `aria-valuenow`=preview position (seconds, rounded), ←/→ seek ±1 s, Home/End to 0/end. Space and Enter on the focused slider toggle the preview (▶/■) from the current offset and never restart at 0. **None of these keys may reach the global handlers:** the existing `isSliderTarget` guard covers ←/→ and Enter, but the global Home handler only excludes `input[type=range]` and Space reaches `togglePlayback`; extend both so a focused `role="slider"` is excluded (handle the key on the slider and stop it). The empty-results message is moved out of the `role="listbox"` element (the listbox then has no non-option children).
**R5-B5 (C):** focus the waveform during a preview → → moves the preview offset +1 s (±0.1), Home → preview offset 0, Space → preview pauses (■→▶) and Space again resumes at the same offset (±0.1); during all of this the **transport position is unchanged and the transport does not start**, a selected clip does not move, history unchanged; the listbox contains only `role="option"` children (or is empty) in the `zzz` state while `ხმა ვერ მოიძებნა…` is visible.

### 5.5 Docs honesty
Update `013-studio-lab-sync-library.md` status to: C round 4 verified, FAIL on RF4-1/RF4-2 (environment-sensitive) and C-R4-02; list R23-1/R23-2/R12-L4 real-mouse items as Tech Lead checks. Doc 014 covers round 5. Do not claim PASS anywhere before C.

## 6. U1 — SRW-07: Duplicate and group split (D-25)

**Duplicate (Ctrl+D / Cmd+D).** `preventDefault` (browser bookmark).
- **Target:** the current clip selection (1 or more clips, any lanes, including the video lane). With a time range present → refused: `დუბლირება კლიპებზე მუშაობს; Duplicate Time არ არის.` No selection → `დასადუბლირებლად აირჩიე კლიპი.`
- **Placement (prototype semantics):** `span = max(end) − min(start)` over the selection; every copy is `{…clip, id: new, start: clip.start + span}` on the **same lane**, same `sourceOffset` and `duration`.
- **All-or-nothing:** if any copy overlaps an existing clip on its lane, nothing changes and the status names the lane and the occupied time (prototype message form). History unchanged.
- **Result:** one history entry `დუბლირება (N)`; the copies become the selection; the project end extends (FB-01); the status names N and the start time. While playing, playback continues and the copies are heard (reschedule as for other edits).
- **Discoverability:** Ctrl+D appears in the footer shortcut hint. **No new transport button** (it would break the R4-B3 stable boxes). If you add a button elsewhere, R4-B3 and R11A-3 are regression criteria.

**Group split (Ctrl+E with ≥ 2 selected clips, no range).** Replaces the current refusal `ჯგუფზე გაყოფა ჯერ არ არის…`.
- Every selected clip that strictly contains the playhead (with `MIN_CLIP_DURATION` on both sides) splits at the playhead; other selected and unselected clips are untouched.
- If none qualifies: status `Playhead არცერთ მონიშნულ კლიპს არ კვეთს.`, history unchanged.
- One history entry `გაყოფა (N)`; the selection becomes the N right-hand parts.
- With a range, Ctrl+E keeps the existing range-split behaviour (single-track range).

**Gesture guard:** add Ctrl+D to the keys refused during an active pointer gesture (`GESTURE_EDIT_BLOCKED_MESSAGE`).

**Acceptance (C):**
- **R7-D1.** Music clip 0–8 on one lane, nothing after it: select, Ctrl+D → a copy at 8.000 on the same lane with the same `sourceOffset`/duration, selected; one Undo removes it; project end 16.000. Export oracle: WAV[8..16) equals WAV[0..8) of the pre-duplicate export (maxDiff ≤ 2⁻²² + 24-bit quantisation) when nothing else sounds there.
- **R7-D2.** Group of 3 clips on 2 audio lanes + the video lane (e.g. impact @2, music 0–8, video 0–6.008): Ctrl+D → 3 copies shifted by the group span on their own lanes, relative offsets preserved, all selected, one entry `დუბლირება (3)`. Make one target occupied → nothing changes, the status names lane and time, history unchanged. With a range → refused with the message above.
- **R7-D3.** While playing (from 0, loop off), Ctrl+D on a clip → playback is not interrupted (position monotone), and the copy is audible at its time on the master tap; ≤ 1 source per clip.
- **R7-D4.** 3 clips selected, playhead at 3.0 crossing two of them → those two split at 3.000 with correct `sourceOffset` (right part offset = old offset + 3 − start), the third untouched, one entry `გაყოფა (2)`, selection = the 2 right parts. Export before vs after the split: maxDiff ≤ 2⁻²². Playhead crossing none → message, history unchanged.
- **R7-D5.** During a clip drag, Ctrl+D → `GESTURE_EDIT_BLOCKED_MESSAGE`, nothing duplicated.
- **R7-U.** `model.test.ts` (or `selection.test.ts`): duplicate single/group, span placement, all-or-nothing overlap, video-lane copy, group split (crossed/uncrossed/edge within `MIN_CLIP_DURATION`), new ids.

## 7. U2 — SRW-08 (FB-03): move clips between audio lanes (D-25)

**Contract.**
- Dragging a clip **header** vertically over another **audio** lane moves the clip to that lane; horizontal motion keeps working as today. On release: one history entry `გადატანა ხაზზე — {lane name}` (single clip) or `გადატანა (N)` (group). The source lane keeps no copy.
- **Time lock modifier: Shift held during the drag.** Ctrl/Cmd and Shift **at pointerdown** already mean toggle/add selection (D-18), so the lock is read from `event.shiftKey` on every `pointermove` (pressed after the drag has started). While locked, `start` equals the original start exactly and only the lane changes. While a header drag is active, the status/hint shows `Shift — დრო ჩაკეტილია, იცვლება მხოლოდ ხაზი`.
- **Video:** a video clip never changes lane (time move only). An audio clip over the video lane → not allowed (amber ghost, `აუდიო ვიდეოხაზზე არ გადადის`).
- **Overlap:** if the target place on the target lane is occupied, the ghost/preview is amber with `აქ ადგილი არ არის`; on release the clip lands at its **last valid** preview position (same lane or another), consistent with CLP-02/D-18. If no valid position other than the original was ever reached, nothing changes and no history entry is written.
- **Group (≥ 2 selected, header drag of a member):** the lane delta applies to every member (lane order = audio lanes as rendered). All-or-nothing: if any member is a video clip, any target lane is missing or is the video lane, or any member would overlap, the lane part is refused (time part still allowed, D-18 bounds) and the status says why.
- **Gesture survival (hard requirement).** Changing lanes during the drag must not unmount the dragged clip's component or lose pointer capture mid-gesture. For example, keep the clip mounted on its source lane (translated or dimmed) and render a ghost on the target lane until release, then commit `trackId`. D-20 and D-23 apply unchanged: Undo/edits blocked during the drag, gesture count 0 after release, unmount, capture failure or a second pointer.
- **Playback:** while playing, the drag does not interrupt playback; after release the clip is heard on its new lane (reschedule), ≤ 1 source per clip.

**Acceptance (C):**
- **R8-M1.** Music clip on lane `მუსიკა` at 2.0: drag its header down one lane and right by ~1 s → `trackId` = the next audio lane, `start` ≈ 3.0 (±1 px), lane `მუსიკა` has no clip, one entry `გადატანა ხაზზე — …`, Undo restores lane and start exactly. Audio proof: mute the source lane → the clip is still audible on the master tap; mute the target lane instead → silent there. Export with the target lane muted has silence in the clip window (< −80 dBFS).
- **R8-M2.** Same drag with Shift pressed after the drag has started → `start` exactly unchanged (3 decimal places), lane changed; the Shift hint is visible during the drag.
- **R8-M3.** Audio clip over the video lane → amber + message; release → clip at its last valid position (or unchanged), history unchanged if unchanged. Video clip dragged vertically → stays on the video lane. Over an occupied place → amber; release → last valid position.
- **R8-M4.** Two audio clips on lanes 1 and 2 selected, header drag of one member down one lane → both move one lane down (2 and 3), relative times preserved, one entry `გადატანა (2)`. A group containing a video clip → lane change refused with message, time move still works. Bottom lane + 1 → lane part refused.
- **R8-M5.** Mid cross-lane drag: Ctrl+Z → blocked status, history unchanged; after release `isPointerGestureActive()` is false and Ctrl+Z works. Second pointerdown mid-drag (D-23) → ignored. While playing: position monotone during the drag; after release the clip sounds on the new lane at its time; source counter ≤ 1 per clip.
- **R8-U.** Pure tests: single-clip lane move (free, occupied, video lane, time lock), group lane delta (all-or-nothing, video member, out of range).

## 8. U3 — SRW-09 (FB-02): internal clipboard (D-25)

**Clipboard model** (`clipboard.ts`, in memory, not in history, not `navigator.clipboard`):
`{ length: number, items: { trackId, sourceId, offset (relative to the clipboard start), sourceOffset, duration }[] }`.

**Commands** (Ctrl/Cmd; ignored while typing in an input; refused during a pointer gesture with `GESTURE_EDIT_BLOCKED_MESSAGE`):
- **Ctrl+C — Copy.**
  - With a range: the material of `range.trackId` inside [a, b] (clip parts clipped to the window, with adjusted `sourceOffset`); `length = b − a`; offsets relative to `a` (leading silence kept).
  - Without a range, with clips selected: those clips, offsets relative to the earliest start; `length = max end − min start`.
  - Nothing to copy → status message, clipboard unchanged. No history entry.
- **Ctrl+X — Cut (gap kept).** Copy as above, then remove the material: with a range → only `range.trackId` inside [a, b] (straddling clips split, a gap remains, nothing shifts on any lane); with clips → those clips (gaps remain). One entry `Cut`. Range cleared.
- **Ctrl+Shift+X — Cut Time (gap closed on all lanes).** Range required (else message). The clipboard holds the material of **all lanes** in [a, b] (video lane included), each item keeping its `trackId`; then the arrangement becomes exactly `deleteTime(arrangement, a, b)` (same as Delete Time, including loop remap and the playing-position rules of R1-B12). One entry `Cut Time`.
- **Ctrl+V — Paste at the playhead** (D-15: the playhead is the insert position).
  - Target lanes: if all items come from one **audio** lane, paste onto the **active audio track** (as Enter/＋ do, R1-B1); otherwise each item goes to its original lane.
  - Items keep their relative offsets: `start = playhead + offset`.
  - **All-or-nothing:** any overlap, any audio item targeting the video lane or vice versa, or a missing source/lane → nothing changes; the status names the lane and time.
  - Empty clipboard → `ბუფერი ცარიელია — ჯერ Copy ან Cut.`
  - Result: one entry `ჩასმა (N)`; the pasted clips become the selection; project end extends; while playing, pasted audio is heard (reschedule).
- **Delete with a range still means Delete Time** (D-09), unchanged.
- Footer hint lists Ctrl+C / Ctrl+X / Ctrl+Shift+X / Ctrl+V / Ctrl+D.

**Acceptance (C):**
- **R9-C1 (Copy/Paste).** Select a music clip (0–8, offset 0), Ctrl+C, seek 20, Ctrl+V → copy at 20.000 on the active audio track, same `sourceOffset` and duration, selected, one entry `ჩასმა (1)`; Undo removes only it. Export oracle: WAV[20..28) equals WAV[0..8) of the source clip (maxDiff ≤ 2⁻²² + quantisation). While playing: pasting is heard at its time on the master tap; playback not interrupted.
- **R9-C2 (Cut keeps gap).** Music 0–10 on lane A, impact on lane B at 7: range 4–6 on the music clip, Ctrl+X → lane A has 0–4 and 6–10 (offset 6), a gap 4–6, lane B unchanged (impact still at 7), one entry `Cut`; seek 20, Ctrl+V → a 2.000 s part at 20 with `sourceOffset` 4.000. Export: 4–6 on lane A silent; the pasted part equals source 4–6.
- **R9-C3 (Cut Time).** Same layout plus video 0–6.008: range 4–6, Ctrl+Shift+X → the arrangement equals Delete Time's result (compare to a Delete Time on a reload of the same layout: identical clip starts/offsets/durations and lane kinds on all lanes — compare by lane and time, not by clip or source ids, which differ after a reload — impact now at 5); clipboard holds items from all lanes in [4, 6] (music part, video part; impact is not in [4, 6]). Seek 30, Ctrl+V → items on their original lanes at 30 + offset, video part on the video lane with `sourceOffset` 4.000. One Undo per step.
- **R9-C4 (refusal).** Paste where any item would overlap → nothing changes, status names lane and time, history unchanged. Empty clipboard → message. Ctrl+Shift+X without a range → message.
- **R9-C5 (regressions/guards).** Delete with a range is still Delete Time (R1-B5 numbers). Ctrl+C/X/V while the library search input is focused edit the text natively and do not touch the arrangement. Ctrl+X/V/D during a clip drag → blocked message, nothing changes.
- **R9-U.** `clipboard.test.ts`: copy from range (straddling clips, leading gap), copy from clips, cut keeps gap, cut time equals `deleteTime` + all-lane material, paste offsets, single-lane → active track rule, all-or-nothing overlap and lane-kind refusal.

## 9. Required tests (behavioural, named)

- D-23 component tests (R5-B1u) in `ArrangementClip` and `ArrangementLoopBrace`.
- `video-sync.test.ts`: escalation (RF5-U).
- Preview normalisation helper (R5-B3).
- `model.test.ts` / `selection.test.ts`: duplicate, group split, lane move (R7-U, R8-U).
- `clipboard.test.ts` (R9-U).
- Context-level tests where the behaviour lives in the context: Ctrl+D/X/V refused during a gesture; paste is one history entry.

## 10. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/types/arrangement.ts app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement app/data/studio-lab-demo.ts
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**`/check` rule (unchanged):** `--write` only on paths you own this round (never on `Header.tsx`); `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files, then re-run the hash check; never `npm run format`.

**Dev server and browser.** Use the running `http://127.0.0.1:5173`; do not start or stop servers. All browser work through gstack `/browse` with state file `../tmp/studio-real-loop/a-browse.json`. Media fixtures: `../tmp/studio-real-loop/media/`. Use real `$B press` keys. For drift, use adapted copies of C's **light** harness (`c-round-4/scripts/m4.js`, `rf4.js`, `loaf.js`) in your system temp directory, not in `c-round-*`.

**Review.** Invoke the actual `code-reviewer` subagent, fix its findings, and quote its summary.

## 11. Report `../tmp/studio-real-loop/a-round-5.md`

1. The pre-flight gate.
2. The design-philosopher ruling (tree, cross-lane ghost), quoted.
3. Files actually changed (a subset of §2.2); confirmation that no round-4 file was reverted and `Header.tsx` is byte-identical to round 4.
4. Verbatim command tails.
5. Changed tests, each with its reason; new tests listed; for R5-B1u, how you know they fail on the old code.
6. code-reviewer findings and your fixes.
7. D-24 constants (`T`, `D`, the slope/decrease formulation, the rate edge, the 1.0 s limit) and your drift runs per layout (count, worst run raw and stall-excluded, escalations, hard seeks, swaps).
8. Deviations, each with a reason.
9. **"Not ready" acceptance IDs per item** (S1, S2, S3, SRW-07, SRW-08, SRW-09).

Do not claim PASS.

## 12. What C will verify (in this order)

1. **Track S:** R5-B1, R5-B1u, R5-B1r; RF5-1, RF5-1b, RF5-2, RF5-3, RF5-U; R5-B2, R5-B3, R5-B4, R5-B5.
2. **Track U:** R7-D1..D5, R7-U; R8-M1..M5, R8-U; R9-C1..C5, R9-U.
3. **Gates:**
   - **G5-1.** tsc 0. vitest ≥ 654 + new, 0 failures. Build passes. Biome 0 errors (owned paths and `./app`).
   - **G5-2.** Protected hashes OK. `git status`/`git diff --stat` show only the §2.1 baseline files plus §2.2 files; `Header.tsx` diff identical to round 4 (+21/−0, two `Link` blocks); no `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` change.
   - **G5-3.** Anonymous `/studio-lab` (direct and via the header link): no request to `/api/studio-token`, `/api/recording-*`, `/api/download`, no R2 host, no `Authorization` header from workspace code; media only the 2 demo MP3s and `blob:`; anonymous `/api/studio-token` → 401; a fake Bearer gets no token; `/studio/middle-east` shows "Sign in required". The root `CartContext` anonymous `GET /api/cart` and root GA consent-denied `page_view` are known and allowed.
4. **G5-R (regression),** with a disabled brace present and 2 clips selected where relevant: R1-B5, R1-B10, R1-B12, R1-E1, R1-E5; R2-V1, R2-V2; R3-V2, R3-V3 (both scripts, R5-B1r), R3-V4; R4-P1, R4-P3; R5-L1..L5, R5-E1; R6-S1..S5; R4-B1, R4-B3, R4-B4, R4-B7; R11A-1..3; R12-L1..L4, R12-S2; R22-1.
5. **G5-shots** at 1440×900 and 1280×720: the library tree (open), a cross-lane drag ghost (normal and amber), the footer hint (one line or wrapping without hiding lanes: all 4 lanes, ruler and loop strip still visible, R11A-3), and the state after a paste.
6. **Harness notes for C:**
   - Light harness only for drift; report raw and stall-excluded series per D-24.
   - Re-resolve `[data-video-role="active"]` on every sample.
   - Synthetic pointer events are acceptable for R5-B1/R8-*; record real-mouse limits.
7. **Tech Lead real-mouse / real-Chrome list (carried, not this round's verdict):** R23-1 scrollbar visuals and mint hover/drag; R23-2 wheel/trackpad and thumb drag; R12-L4 real HTML5 library drag; RF5-1/RF5-2 on a quiet real Windows Chrome (VP9 + H.264); R8-M1/M2 with a real mouse.
