COMMIT: OK (no blocking issues; no auth, purchase or download code is touched; `verify.log` shows 218 test files and 3253 tests passing, plus a clean `tsc --noEmit` and build)

## Code Review: round-271 — relative snap for clip moves (`grid.ts`, `ArrangementClip.tsx`, `strings.ts`, tests, docs 198/202)

I read the full diff, the new doc 202, the surrounding parts of `grid.ts` (lines 1–373) and the code in `ArrangementClip.tsx` that calls the changed functions. I also read `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md`. This review covers the diff only; it is not a full check of the module.

### Critical Issues
- None.

### Findings (ranked)
1. **Medium, product/UX: once a clip is off the grid, Snap can't put it back on the grid.** `grid.ts:291-299` — `relativeGridStart` only gives `stored line + offset`. With Snap on, the only way back onto the grid is a nearby clip edge or a marker. The old absolute snap did this on every drag. RS4 / `RU3` (`grid-edges.test.ts:72`) also make the time start (0) unreachable for a clip at 0.3 s. Doc 202 admits this (SABA-Q-11C-REALIGN), so it doesn't block. **Fix (next round, needs Saba's decision):** add `0` as a magnetic edge in `moveStartOnGrid`/`groupDeltaOnGrid`, and/or let the Alt override snap absolutely when the Snap toggle is on. Today Alt with Snap on gives free movement, so the user has no way to realign a clip with Snap on.
2. **Low, consistency: the same snap toggle now uses two models.** A clip drag is relative (`ArrangementClip.tsx:150`). Library drop (`ArrangementLane.tsx:282`), loop-brace move (`ArrangementLoopBrace.tsx:154`), trim and nudge stay absolute. The new tooltip "clips follow the grid" is vague enough to cover both, which is acceptable. This is deliberate and listed as open (SABA-Q-11C-NUDGE). **Fix:** none now. When Saba answers, put both rules behind one named helper so the two paths can't drift apart quietly.
3. **Low, edge case: a start 0.5–1 ms off a musical line counts as off the grid.** `grid.ts:285-289` — with step 60/90, a clip stored at 0.666 (1 ms below the 0.667 line) looks like it sits on the grid. It still takes the relative path with offset 0.666 from line 0, so every later drag keeps that invisible 1 ms offset. Starts are whole milliseconds and the rounding of the stored line is ≤0.5 ms, so the 0.5 ms tolerance is mathematically right. A start like this can only appear through Snap-off or Alt movement. **Fix:** optional — add a unit row that pins this down (`snapRelativeMoveStartToGridOrEdges(0.666, 0.7, 1, 60/90, [])` → 1.333), so the behaviour is intended rather than accidental.
4. **Info, pre-existing:** a start produced by an edge snap is not rounded to whole milliseconds (`RU4` third assertion uses `toBeCloseTo(5.27)`). The old `snapMoveStartToGridOrEdges` behaves the same, so this diff doesn't change it. It isn't a regression.

### Real-browser / lifecycle / render
- The anchor is the gesture-start `original.start` (`ArrangementClip.tsx:591-592`, `527-528`), with the cumulative delta added to it. That means the relative calculation doesn't build up across pointermoves, and pressing G, changing the division or pressing Alt mid-drag recomputes cleanly on each move.
- No new listeners, timers, effects, state or refs, so there is nothing new that could leak. The change is pure functions in `lib/`.
- Render cost: each pointermove does a little extra arithmetic and the same array spreads as before. Negligible.
- Accessibility: only the `title` text changed (`strings.ts:457`); `aria-pressed` and the other status texts are unchanged.
- Tailwind/tokens: no style changes.
- TS strict: no `any`, no type assertions, no suppression comments; all statements end with semicolons.

### Suggestions
- `relativeGroupDelta` (`grid.ts:315-343`) has a three-step fallback (`requested` → `whole` → `inner` → `0`). RG1 and RG2 cover it, but it would be worth adding one jsdom row where the group is blocked moving left (the `requested < 0` branch from the UI side). GS5b only tests the right-hand side.

### Good Practices Found
- When the anchor is on the grid, the result is exactly the same as the old absolute snap. RU2 checks this with an 81×6 equivalence sweep, which protects every existing project whose clips sit on the grid.
- The offset is measured from the stored grid line, not from `anchor + k·step`, so a musical step doesn't drift. RU7 checks this over 20 drags.
- The fix for a blocked group overshooting its bound on a musical step (RG2) comes from an earlier code-review finding and is now pinned by a test.
- Undo stays atomic (`undoAll === 1` in RS1, GS5 and GS6).
- Doc 202 records the change in behaviour for saved projects (D-29z587), the alternatives that were rejected, and the open questions.

### Architecture note
- signal 3 (repeated costly changes): `app/lib/arrangement/grid.ts:135-373` — the snap functions (`snapGroupDelta`, `snapMoveStartToGridOrEdges`, `snapGroupMoveDelta`, and now the relative variants) have been changed across several rounds (SRW-14 4a/4b/4c, 068, now 11c), and each round rewrites GS/CM expectations. → **keep for now**: it's one cohesive pure module with no lifecycle, and the tests are strong. **Proposal for the planner (only after Saba answers SABA-Q-11C-NUDGE/REALIGN):** one bounded task to add a single function, `resolveMoveSnap(anchor, delta, duration, step, targets, mode: 'relative' | 'absolute')`, and switch clip move, library drop and loop brace to it. Acceptance criteria: the existing GS/CM/RU/RG/loop-brace tests pass unchanged. Not a finding for this round.

### Alternative Approach (critical Studio drag logic)
- **Current:** relative snap — the off-grid offset is kept and the clip moves in whole steps, measured from the stored grid line.
- **Alternative:** absolute snap, but only once the drag exceeds half a division. This fixes the F1 jitter, but a small drag still loses the offset.
- **Verdict:** the current approach is better. It removes F1 completely, matches Saba's chosen option (a), and changes nothing for clips on the grid. Its only cost is finding 1 (no way back onto the grid), which is already a tracked follow-up.

### Score: 9/10