# Checkpoint request: ARCH-CHECKPOINT-TRANSPORT-POSITIONS (B, round 253 → 254 planning, D-29z468)

**For:** root, to call the read-only `frontend-architect` under `store/.claude/references/architecture-checkpoint.md`.
**Blocking:** no. SABA-B-10b (round 254) goes ahead.
**Why now:** this is the 10a/10b feature boundary. SABA-B-10a is done (rounds 249–253, published `c65e5e9`), and `ArrangementContext.tsx` and `StudioWorkspace.tsx` changed in five rounds in a row.

## Questions (≤ 3 sentences each in the answer: keep/extract, value, risk)
1. **Transport positions unit** (GATE249-ARCH-TRANSPORT-POSITIONS). Two options:
   - keep the two stores (`positionStore`, `insertMarkerStore` + `insertMarkerRef`), `remapTime`, `startPlaybackAt` and the write rules inside `ArrangementContext.tsx`;
   - extract a bounded unit, with `useArrangement()`'s shape unchanged.
2. **A pure exported resolver** (addenda 1–2: `resolveCommandPosition`).
   - **Input:** command, `isPlaying`, range, marker, playhead, `projectEnd`, loop.
   - **Output:** the start point **and** the past-end refusal, mirroring `startPlaybackAt` l.1339–1346 (`loopActive`, `endedHere`, `> end + ARRANGEMENT_EPS`).
   - **Why:** C-R253-01 (Low, deferred) cannot be fixed honestly without it. StudioWorkspace's stop text would otherwise need a second copy of a context-private predicate.
3. **`useArrangementInsertMarkerWriter`** (addendum 3) vs the local `subscribePosition` effect that round 254 uses for the visible line (as the hidden signal did). Is a context-level writer hook worth it before SABA-B-9 adds the Stop button?
4. **`useTimelineFollow`** (addendum 4, D-29z465; A-R253-ARCH-ISPLAYING-EFFECT). Follow pause/resume lives in four places in StudioWorkspace: scroll l.1887, ruler l.1430, strip l.1418 and stop l.1920. The `isPlaying` effect now owns both the Follow resume and the stop status. Keep, or extract the hook?
5. **Status lifetime** (GATE253-ARCH-STATUS-SCOPE, new). The stop effect re-composes three context-authored texts and compares `status` by string. Options:
   - a `setStatus` scope (`playing` vs `sticky`);
   - an `expiresOnStop` tag.

   The acceptance would be FW6/FW8/FW9/FW10 unchanged and `useArrangement()`'s shape unchanged. The residual B-R253-STALE-PLAYING-STATUS-RESIDUAL (a marker moved during playback with no status write) is the case that string comparison cannot catch.

## Related signals
- GATE249-S5 (double store write; round 254 checks there is no visible double paint)
- A-R252-REVIEW-PLAYING-SOURCE (+ GATE253-S2/S3: render `isPlaying` vs `isPlayingRef`)
- GATE236-ARCH-PLAYFROM-HELPER
- A-R237-ARCH-STATUS-PARTS

## Earlier pending, non-blocking requests (unchanged)
- ARCH-CHECKPOINT-TEMPO-GRID
- ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS
- ARCH-CHECKPOINT-SABA-B-8-END
- ARCH-CHECKPOINT-CALM-DIALOG-KEYMAP
- export-pipeline (b-round-221)
