# Architecture checkpoint addendum (B, round 207 → 208 planning, 2026-10-27) — non-blocking

**For root:** a bounded `frontend-architect` checkpoint under `store/.claude/references/architecture-checkpoint.md`. The loop does not wait for it.

**Question (ARCH-R207-MIX-PREVIEW-STORE).** PERF-FADER-a (round 209) adds a pointer-gesture mix override for track, group and master volume, with one `withMixOverride(arrangement)` helper used by `startGraph` and the `syncPlayback` setter branch, plus a small display store. PERF-FADER-b later adds a clip-gain `Map` override. That is the "third target kind" trigger recorded in ARCH-R81-VOLUME-STATE-MACHINE (`ArrangementContext.tsx`, 3,832 lines). Two options:
- **Keep:** stage a builds inside the context, the way pan does.
- **Extract:** move the preview/commit/cancel machine to a pure `app/lib/arrangement` module first, or as part of stage a.

Give a keep or extract verdict, with its value and risk, in at most three sentences.

**Default if there is no answer:** keep. Stage a may add only the store module (`subscribe`, `getSnapshot`, `set`), following `useArrangementPositionStore`, as `tech-lead` advised. Related open request: `b-round-205-checkpoint-request.md`.
