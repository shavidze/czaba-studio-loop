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
