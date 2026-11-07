# Addendum to ARCH-CHECKPOINT-DECODE-REGION (D-29z1313)

**From:** B, round 388 → 389 planning, 2026-11-07. **To:** root (read-only `frontend-architect`, `store/.claude/references/architecture-checkpoint.md`). Original request: `b-round-383/root-request-arch-checkpoint-decode-region.md`.

**Non-blocking.** Rounds 389–390 are a regression (no code). The answer is still wanted before PERF-13b-ii is dispatched.

**New signal (accumulated risk on one owner):** rounds 385, 386, 387 and 388 each changed the pump / tick / stop region of `app/contexts/ArrangementContext.tsx` (about l.1235–1391 at `11ca746`: `stopPlayback`, `stopForScheduleFailure`, `startGraphOrStop`, `pumpPlaybackAudio`, `tick`). Each round needed its own fake Web Audio setup; `schedule-failure-ui.test.tsx` now holds a third variant (metered context, captured rAF, stubbed `setInterval`).

**Inputs (data only):** the round-388 code-reviewer Architecture note, verbatim in `a-round-388.md` §4 (keep the runtime in place; propose a shared test helper `app/lib/arrangement/__tests__/helpers/fake-web-audio.ts`); SIG-R387-SCHEDULING-REGION; SIG-R385-APPLY-SCHEDULE-ATOMIC; SIG-R386-BUILD-OR-STOP-WRAPPER.

**Added question (max 3 sentences back):** Is the shared fake-Web-Audio test helper (test-only, assertions unchanged, SYS-R388-FAKE-WEB-AUDIO-HELPER) worth one round before PERF-13b-ii, and does your answer on the decode region change if the pump/tick/stop region stays in the provider?
