# B → root: bounded frontend-architect checkpoint request (SRW-18 feature boundary, round 83 → 84)

Date: 2026-10-22 · Author: B · Non-blocking: round 84 (SRW-19) proceeds while this is pending.

## Trigger
- **SRW-18 is complete.** Both stages are C PASS with browser evidence and published (`bdc2067`, `a68c81d`), so this is a feature boundary.
- **The gate-83 reviewer's rule is met.** Its Architecture note says a *third* round touching the gesture region of `ArrangementClip.tsx` should trigger a `frontend-architect` checkpoint. That region was touched in rounds 82 and 83. Round 84 touches it a third time, though only minimally: the setter choice at two call sites and the `showFadeHandles` term for video fade handles.
- Reference: `store/.claude/references/architecture-checkpoint.md`. Earlier pending questions stay as they are and are not repeated here: ARCH-CHECKPOINT-SRW14-PREFS (a)–(f) and questions 1–11 from earlier requests.

## Questions (keep/extract argument, value, risk; at most three sentences each)
1. **Pointer-gesture helper.** Both round-83 reviewers proposed moving two things into `app/lib/arrangement/pointer-gesture.ts`:
   - `watchUncapturedPointerGesture` and its `{ pointerId, release }` type;
   - the drag-then-double-click guard (constant + check), now duplicated in `ArrangementClip.tsx` and `ArrangementClipEnvelope.tsx`.

   That would remove the `watchLostPointer` prop. Invariants: the gesture lifecycle is unchanged, and EU3/EU6, the clip-fades UI and trim tests stay green. Keep or extract, and should it happen before or after SRW-20?
2. **Per-kind gesture table in `ArrangementClip.tsx`.** Six kinds now share `beginGesture`/`handlePointerMove`/`finishGesture`. Round 84 deliberately adds no kind (video fades reuse `fadeIn`/`fadeOut`). Is the per-kind handler table (architecture signal, round 82) worth a dedicated behaviour-preserving round now, or keep as is?
3. **Preview reschedule policy (GATE83-M2 + GATE82-S6 + SRW19-RESCHEDULE).** Fade, envelope and video-fade drags during playback rebuild the audio graph on every pointermove: 6 restarts per drag in C round 83, with no glitch measured. Options:
   - (a) keep;
   - (b) leave preview-only changes out of `scheduleKey` until commit;
   - (c) rAF throttle;
   - (d) a key that ignores video-track fades.

   Which, if any, and which owner file (`ArrangementContext.tsx`)?

## What B does with the answer
An approved change becomes its own B task with one owner and behaviour-preserving tests, scheduled after the current feature stage. It does not interrupt SRW-19 or SRW-20 unless root rules otherwise.

## Addendum — round 84 result (B, round 85 planning, 2026-10-22)
SRW-19 has now passed C (PASS, `browserVerified=true`, published as `88b0262`). That is another feature boundary, and root still has not answered this request or the SRW-16 request. The request remains non-blocking. Round 85 (C-R84-M1 + SRW-20 stage 1) goes ahead.

q12 is new.

**q12 — round-84 Architecture note (A's code-reviewer, verbatim in `a-round-84.md`):**
- **(a) Duplicated helpers.** `video-fades.ts` l.5–24 re-implements three private helpers of `fades.ts` (l.21–48). The proposal is to export `roundFadeSeconds`, `floorFadeSeconds` and `withClipFadeLengths` from `fades.ts` and delete the copies. Acceptance:
  - the VF1 parity test stays green;
  - FD1 and FD6 are untouched;
  - no behaviour changes.

  The reviewer says keep for now.
- **(b) Fade-overlay writer.** `ArrangementVideoDock.tsx` l.237–273 has a fade-overlay position writer and a layout effect. Keep: the code sits in its own sibling component.
- **(c) Border constants.** `CLIP_ENVELOPE_ROOT_BORDER_PX` and `CLIP_BORDER_PX` both depend on the clip root `border` class. Keep, as a one-line backlog item.

**New evidence for question 3 (C round 84):**
- A video-fade drag during playback added 4 `createBufferSource` calls (12→16).
- Playback continued and the position never ran backwards.
- No audible defect was measured.

## Addendum — round 85 result (B, round 86 planning, 2026-10-22)
SRW-20 stage 1 passed C (PASS, `browserVerified=true`, published as `51e024a`). Root has still not answered this request. It stays non-blocking; round 86 (SRW-20 stage 2, MP3) goes ahead.

**q13 — Export dialog axes (round-85 Architecture notes, A's reviewer and the gate-85 reviewer):**
- `ArrangementExportDialog.tsx` was changed by rounds 84 (074), 85 (075) and now 86 (076). Round 85 added five scope-dependent text sites (all byte-locked by tests); round 86 adds a format axis (WAV / MP3 / WAV + MP3), so the texts become format × scope.
- Round 86 already moves the window-validity rule into one pure helper (`app/lib/arrangement/render-window.ts`), because `exportMp3` would otherwise add a third copy. That is the only structural change B schedules.
- Question: after round 86, keep the dialog as one component, or extract a pure `exportDialogTexts(format, scope, …)` table and/or an `ArrangementExportScope` sub-component? Acceptance for any approved change: every byte-locked dialog test unchanged and green; no change to the `useArrangement()` shape.
- Related signal for the owner of `app/utils/ffmpeg.ts` (shared with the protected purchased Studio): FFMPEG-LOAD-POLLER-HANG (a concurrent `loadFFmpeg` caller polls forever if the first load fails; a load whose worker never starts never rejects). The loop keeps that file frozen and wraps the call in a timeout.

## Addendum — round 86 result (B, round 87 planning, 2026-10-22)
SRW-20 stage 2 passed C (PASS, `browserVerified=true`, published as `971141d`). Root has still not answered this request. It stays non-blocking; round 87 (SRW-20 stage 3a: worker + progress) goes ahead.

**q14 — export pipeline at the SRW-20 feature boundary (round-86 Architecture notes, A's reviewer and the gate-86 reviewer):**
- `ArrangementContext.tsx` `exportWav` / `exportMp3` repeat the four guards, the render step, the anchor download and the length string (A reviewer: l.2714–2735 vs l.2662–2683, l.2810–2818 vs l.2689–2696). The export region changed in rounds 84, 85 and 86, and stages 3a/3b add progress and cancel to it (Signal 3).
- Proposals on record: a pure `app/lib/arrangement/export-pipeline.ts` (render → encode → download plan; the guards that read refs stay in the context; MX2–MX9 re-target); or `prepareArrangementRender(...)` returning a render result or an error message; or `loadArrangementEncoderWithTimeout(importer, ms)`.
- What B does without approval: round 87 puts the new logic in new modules (`export-wav.ts` / `.worker.ts` / `.client.ts`, `export-progress.ts`, `mp3-encoder.client.ts`), so the context only wires them. No refactor of the existing guards is scheduled.
- **Request:** please run the bounded frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`) on q1–q14 at the SRW-20 boundary, after stage 3b passes C. The result is keep/extract with value, risk and at most three sentences. An approved extraction would become one separate B task with one owner and behaviour-preserving tests, scheduled before the Lows batch.
- **Signal:** FFMPEG-UTIL-UNIFY. `/studio-lab` now has its own resettable encoder (same core + command) because the frozen `app/utils/ffmpeg.ts` cannot reset or remove listeners. Unify the two when the purchased Studio can be verified (SRW-21).

## Addendum — round 88 result (B, round 89 planning, 2026-10-22)
The sticky footer passed C. C found an old Tab-trap escape during a render (R88-FOCUS-ESCAPE-RENDER), and round 89 fixes it with a pure `dialog-tab-stops.ts` helper. Root has still not answered this request. It stays non-blocking.

**q14 addition — Export dialog focus effects (round-88 A code-reviewer Architecture note, verbatim in `a-round-88.md`):**
- `ArrangementExportDialog.tsx` now has four effects on the same content element: opener restore, initial focus, the Tab trap and the footer focus guard.
- The reviewer proposed one bounded task to extract `useExportDialogFocus` "if another focus or scroll concern lands here". Round 89 is that trigger.
- B did not schedule the extraction inside a bug-fix round.
- **Question:** keep, or extract `useExportDialogFocus` (with FT1–FT4, TR1–TR6 and the frozen focus-trap tests as acceptance) before or after stage 3b adds Cancel? Answer as keep/extract with value, risk and at most three sentences.

## Addendum (B round 89 review, 2026-10-22) — q14 inputs
- Gate-89 reviewer (gates/round-89/review.md Architecture note): exportMp3 ~150 lines; proposal `lib/arrangement/export-orchestration.ts` ({ getArrangement, buffers, videoSources, setExportState, progress }; invariants: exact messages, 120 s timeout, hook shape, export tests unchanged). Round 90 (3b-1) adds abort/run-token logic to the same functions without extracting.
- A round-89 reviewer: dialog focus region changed six times; proposal `useExportDialogFocusTrap(contentRef, trapRef, closeRef, footerRef, { isOpen, isRendering })` with a DOM-only harness; `dialog-tab-stops.ts` placement under lib/arrangement (move to shared lib if a second dialog uses it); `inert`/native `<dialog>` alternative is Modal-wide.
- Timing: requested at the SRW-20 boundary after stage 3b-2 (round 91). Non-blocking.

## Addendum — round 90 result (B, round 91 planning, 2026-10-22) — q14 inputs
SRW-20 stage 3b-1 (Cancel) passed C (PASS, `browserVerified=true`, 0 bugs) and is published as `35c8403`. Root has not answered q1–q14. It stays non-blocking; round 91 (stage 3b-2, the last SRW-20 stage) goes ahead.
- **Gate-90 reviewer Architecture note (gates/round-90/review.md):** Signal 4 (`exportAbortRef`, `cancelExport`, the abort-on-unmount effect added to the provider, which holds ~280 lines of export orchestration) and Signal 3 (rounds 86–90 all changed this region; `export-cancel-ui.test.tsx` mocks three modules to test one button). Verdict: keep for round 90. Proposal: after SRW-20 closes, one bounded task that moves `exportWav`/`exportMp3`/`cancelExport`/the abort ref into a `useArrangementExport` hook or `lib/arrangement/export-orchestrator.ts`, with the dialog as its only consumer; acceptance CU1–CU9, EC1–EC4, TR1–TR6 unchanged and an identical `useArrangement()` surface.
- **A round-90 code-reviewer Architecture note (verbatim in `a-round-90.md`):** the same region (`ArrangementContext.tsx:2751-2954`) holds a run token, an abort listener, an encoder slot, a timeout and the download step; proposal `lib/arrangement/export-orchestration.ts` taking a `signal` and returning `done | error | cancelled`.
- **Round 91 adds nothing to the context** except one string literal; the memory fix goes into `export-wav.ts` / the worker.
- **Formal request:** B will send it at the SRW-20 boundary, as soon as round 91 passes C. The question for q14 stays: keep, or extract the export orchestration (hook vs pure module) and `useExportDialogFocus`, as one bounded task before the Lows batch.

## Addendum — round 91 result (B, round 92 planning, 2026-10-22)
SRW-20 is complete: C round 91 PASS, `browserVerified=true`, published as `77cd5b6`. The formal boundary request, with q14 (a)–(e), is now in `b-round-91-checkpoint-request.md`. It stays non-blocking.
