# Root request: bounded frontend-architect checkpoint, PERF-11c-ii (status store)

**From:** B, round 371 → 372 planning, 2026-11-06 (D-29z1229). **Blocking:** no (2026-10-19 workflow, architecture checkpoint section). Round 372 is test-only and does not wait for this. Round 373 (the store change) is planned with or without an answer. An answer that arrives first is applied to round 373's task.

**Procedure:** `store/.claude/references/architecture-checkpoint.md`, read-only `frontend-architect`. Baseline `66ee771`.

## Question (keep/extract, value, risk, ≤ 3 sentences each)

1. **Where does the committed status entry live?** Today `status`/`statusSequence`/`statusKey` come from a `useReducer` in `ArrangementProvider` (`app/contexts/ArrangementContext.tsx` ~l.732–799) and sit on `ArrangementContextValue`. So every status write re-renders every `useArrangement()` consumer (SIG-R360: 28 → 99 components in the Play window).
   - **Option A** (B's lean, matching A-R327-ARCH-STATUS-ONE-SOURCE): fold the committed entry into the existing `status-preview-store.ts` (zustand vanilla), so committed + preview become one store and adopting a preview is one atomic `set`. This removes the layout-effect ordering rule (~l.795–799).
   - **Option B:** a fifth separate per-provider store, keeping the preview store as is.
2. **Do the reducer semantics stay in the provider?** `reduceArrangementStatus(previous, action, gestureCountRef.current > 0)` reads a ref at dispatch time. Should a store action receive the gesture flag as an argument, or should it read a provider-owned getter?
3. **Where do the provider-side mirrors go** (`committedStatusTextRef`, `lastNonRefusalStatusRef`, the `settledCollectionStatus` path ~l.4084)? Do they become store fields or stay refs?
4. **The stop-effect string compare** (GATE253-ARCH-STATUS-SCOPE, StudioWorkspace `syncFollowWithPlayback` ~l.2420): keep it as is in 11c-ii (the getter replaces `current.status`), or add a status scope tag now?

## Signals attached
A-R327-ARCH-STATUS-ONE-SOURCE, SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE, GATE253-ARCH-STATUS-SCOPE, GATE371-ARCH-GROUP-HEADER-PROPS-HOOK (a `useTrackGroupHeaderProps` hook after 11c-iii), A-R371-ARCH-PROP-EQUALITY-HELPER (move `PropEquality`/`samePropsByTable` to `lib/arrangement` once a second wrapper uses it).

## Evidence
- `b-round-371/tsc-remove-status-files.txt`: removing the 3 fields breaks 34 test files + 2 app files at HEAD.
- `b-round-371/tsc-sketch-removed-files.txt`: after round 372's migration, only the helper body + StudioWorkspace + MarkerRow break.
- `b-round-371/sketch-review.md`: the tech-lead and performance-optimizer consults.
