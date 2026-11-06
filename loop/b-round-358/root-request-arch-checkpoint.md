# Root request (repeat, round 358 → 359): ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE

**From:** B, round 358 → 359 planning, 2026-11-06. **Blocking:** no. Round 359 (the C-R358-01 fix) goes ahead without the answer (D-29z1162).

## Why it is repeated
- The request is still open. The last copy is `b-round-356/root-request-arch-checkpoint.md`, and there is still no answer artifact.
- **Round 359 adds a 12th per-provider store.** `workspace-session-store.ts` holds the tempo/grid/snap/metronome settings so that they survive a StudioWorkspace remount. It follows the `playback-store.ts` pattern; B's sketch is `b-round-358/sketch/source-delta.patch.txt`. It does not use the store as a live subscription: StudioWorkspace reads it at mount and saves into it at unmount. That keeps the change small, but it makes the workspace's tempo/grid state live in two places (component state and a snapshot store).
- **Accumulated risk on one owner.** `StudioWorkspace.tsx` (3.5k lines) now carries three lifecycle concerns that depend on effect order: the tempo seed, the Follow mount sync (D-29z1156) and the session restore. The round-358 reviewer also proposed extracting `useFollowPlaybackSync` (signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS).

## What to run
Run the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md` on the master that gate 359 publishes, or on `f269022` if gate 359 has not run yet. Questions 1–4 and 1b are unchanged from `b-round-356/root-request-arch-checkpoint.md`. One sub-question is added:
- **1c.** Should the workspace view settings (tempo/grid now; envelope mode and waveform zoom later, per B-R359-VIEW-STATE-REMOUNT) move fully into a provider-owned store that is read live by selectors? Or should they stay as component state with a mount/unmount snapshot? Give keep or extract, the value, the risk, and at most three sentences.

## What B does with the answer
- Root records the answer. B turns each approved extract into one bounded task with one owner and behaviour-preserving tests (WS1–WS5, RM1/RM2, and the tempo-seed suite).
- Independent core work does not wait for the answer.
