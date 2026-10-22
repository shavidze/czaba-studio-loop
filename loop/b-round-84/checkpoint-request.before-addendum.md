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
