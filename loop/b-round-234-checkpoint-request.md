# Architecture checkpoint request: the tempo / grid / Snap cluster in StudioWorkspace (B, round 234 → 235 planning, D-29z331)

**Status:** requested from root, **non-blocking**. Best run after C round 235 (the end of SABA-B-11a) and before SABA-B-11b. 11b adds the adaptive grid to the same state.
- **Why now:** a feature boundary (SABA-B-11a ends in round 235) plus repeated structural change on one owner.
- Gate 234's Architecture note found two signals:
  - Signal 3: the tempo/grid/Snap block of `StudioWorkspace.tsx` (l.~1326–1465 at `c95b8a8`) changed in the tempo, metronome, grid, triplet and seed rounds, and 11b, 11c and 10a are queued against it;
  - Signal 4: round 234 added three refs and one effect to the component.
- A round 234's reviewer made the same proposal.

**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. Root invokes it and records the result.
- An approved change becomes its own bounded B task, with one owner and behaviour-preserving tests.
- Line counts are context, not a reason to split.

**Scope at `c95b8a8`, plus round 235 if it is published:**
- `StudioWorkspace.tsx`:
  - the state `tempoBpm`, `musicalGridDivision`, `secondsGridDivision`, `snapEnabled`, their refs and `gridSeconds`;
  - `changeTempo`, `changeGridDivision`, `stepGridDivision`, `toggleGridTriplet`, `toggleSnap`;
  - the round-234 seed effect and refs (`tempoSeedOpen`, `gridHandChosen`, `snapHandChosen`);
  - round 235's `playFromRuler` / `barsRulerGestures`.
- The gesture and snap read path that reads the grid refs (l.~1806, ~2149).
- `ArrangementContext.tsx` `setStatus` (not functional today). The round-236 fix of A-R234-REVIEW-M1 needs a non-clobbering status path here (D-29z329).

## Questions (keep/extract, value, risk; at most 3 sentences each)
1. Should one `useTempoGrid` hook own the tempo, both divisions, Snap, their refs, the hand-chosen flags and the seed? It would return the handler and ref shape the JSX uses today. The acceptance would be `grid-snap-edit`, `tempo-seed-ui`, the metronome tests and the `fader-guards` grid cases passing unchanged, and `useArrangement()` unmodified. Or does it stay in StudioWorkspace until 11b lands?
2. For A-R234-REVIEW-M1 (round 236): which is the smaller safe fix? (a) a functional `setStatus((previous) => …)` in the context; (b) a context "announce after ready" hook; or (c) moving the seed's announcement to the provider's ready path.
3. Should the adaptive grid (11b) be a pure function of `pxPerSecond`, tempo and density, living in `grid-divisions.ts`, with StudioWorkspace holding only the mode? Or does it belong inside the proposed hook?

Related pending requests (non-blocking, still open): `b-round-231-checkpoint-request.md` (ready), `b-round-229`, `-225`, `-221`, `-211`.

## Addendum (B, round 235 → 236 planning, D-29z337)
- **Trigger met:** SABA-B-11a is done (round 235 C PASS, published `49b4c74`). The request is still non-blocking; best before SABA-B-11b.
- **New signal GATE235-ARCH-POINTER-UTIL** (gate 235 Architecture note): `app/hooks/useRulerNavigation.ts` imports `watchUncapturedPointerGesture` from `~/components/arrangement/ArrangementClip`, the first hook-to-component import in `app/hooks/`. The proposal is to move it to `app/lib/arrangement/` and repoint its three callers, with no behaviour change. Question 4: keep, or extract (value, risk, at most 3 sentences)?
- **Question 2 update:** B's round-236 planning probe shows the provider's plain-string ready write (`ArrangementContext.tsx` l.~3644) also overwrites a status set before all sources settle, in `/studio-lab` too (`b-round-235/probe/out-baseline-noreadywait.json`). Round 237 (SABA-B-11a-FIX-2) will plan the ready-side fix unless the checkpoint says otherwise.

## Addendum 2 (B, round 236 → 237 planning, D-29z343)
- **Still unanswered** at round-237 planning. Round 237 (SABA-B-11a-FIX-2) proceeds non-blocking with option (a) of question 2: a functional `setStatus` through the existing `reduceArrangementStatus`, plus two pure rules in `collection.ts` for the provider's loading and ready writes (`current-task.md` §2). If the checkpoint objects to that, say so before round 238.
- **New signal GATE236-ARCH-PLAYFROM-HELPER:** the end rule is split between the context's `playFrom` and `togglePlayback`. A's reviewer proposes a pure `lib/arrangement` helper `(arrangement, target, isPlaying) → 'seek' | 'pastEnd' | 'start'`. Gate 236 says keep `playFrom` in the context. Question 5: is the pure helper worth a task (value, risk, at most 3 sentences)?
- **New signal GATE236-ARCH-PRESS-TARGET:** `ArrangementTempoRow`'s `pressInStripRef` copies `useRulerNavigation`'s `pressTarget`. The proposal is that the hook passes `pressTarget` to `onRulerDoubleClick`. Fold it into question 4 (the hook's shape).
- **Please run before SABA-B-11b (round 238).**

## Addendum 3 (B, round 237 → 238 planning, D-29z349)
- **Still unanswered** at round-238 planning. Round 237 implemented option (a) of question 2; it failed C on C-R237-01 (the refusal restore kept a stale loading text). Round 238 (SABA-B-11a-FIX-3) fixes it inside the same contract (`settle` re-derives `lastNonRefusalStatusRef`; one refusal-prefix rule for the layout effect and the release).
- **New signal A-R237-ARCH-STATUS-PARTS:** three writers (`collection.ts` rules, the seed write in `StudioWorkspace`, the refusal restore in `ArrangementContext`) now share a status-text prefix contract. A's reviewer proposes structured status parts (a collection-state part plus an action part). Question 6: keep the text-prefix contract, or extract structured parts (value, risk, at most 3 sentences)? The reviewer's own verdict is keep for now.
- **Please run before SABA-B-11b.**

## Addendum 4 (B, round 238 → 239 planning, D-29z355)
- **Still unanswered** at round-239 planning. It stays non-blocking (policy: low-priority structure does not hold back an approved core feature). Round 239 starts SABA-B-11b without it. **Question 3 is answered provisionally by the design:**
  - the adaptive chooser is a pure function in `grid-divisions.ts` (`adaptiveGridDivisionId(familyMember, bpm, pxPerSecond, density)`);
  - StudioWorkspace holds only `gridMode` and `gridDensity`, derived during render;
  - there is no new effect, and the change does not touch the status writers.
  
  If the checkpoint prefers a `useTempoGrid` hook (question 1), the chooser moves into it unchanged.
- **Round 238 result:** SABA-B-11a-FIX-3 passed C (`c-round-238.json`), and gate 238 published rounds 237 + 238 as `15a0b41`. Question 2's option (a) is now the shipped contract.
- **New signal A-R238-ARCH-STATUS-PREFIX** (A round 238's reviewer and gate 238's Architecture note, signals 3 and 2). The status line changed in five consecutive rounds (234–238). The "equals prefix or starts with prefix + space" rule now lives twice: in `collection.ts` (loading) and `ArrangementContext.tsx` (refusal). The seed append lives in `StudioWorkspace.tsx`.
  - Proposals: (a) a shared `statusPrefix` helper in `status-announcement.ts`; or (b) a structured status model with a collection base, last action, seed tail, a refusal overlay and an explicit `announce` flag. Option (b) would also close GATE238-S1 and GATE238-S3, which are deferred Lows.
  - Both reviewers say keep the current design for now.
  - **Question 6 (from addendum 3), restated:** keep, (a) or (b)? Give value and risk in at most 3 sentences.
- **Trigger for re-asking:** before SABA-B-10a. 10a rewrites the Space/marker contract that writes status on every play/stop.
