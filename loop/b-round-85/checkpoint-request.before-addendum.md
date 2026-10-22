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
