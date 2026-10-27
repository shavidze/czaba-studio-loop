COMMIT: OK

## Code Review: round 213 candidate (`buildPeakShape` outline, Clip Gain sync, CP12 split)

This review covers only the diff on top of 28a274c, not the whole module. C passed both rounds in this commit (c-round-212 and c-round-213). `verify.log` shows 200 test files and 2865 tests passing, a clean typecheck and a successful build. None of the candidate paths touch auth, purchase or download code.

### Critical Issues
- None.

### Suggestions (most important first)
1. **`docs/implementation/2026/quarter-IV/167-waveform-outline-path.md:23` adds a CSS rule to the shipped app.** The word "antialiased" in this new doc gets picked up because Tailwind v4 also scans `docs/`. It adds an unused `.antialiased` rule and changes the CSS bundle hash (C-R212-04). It has no visual effect, but a doc file shouldn't change production CSS.
   - **Fix:** change the word to "anti-aliased" or a Georgian term. That's in scope, because the file is new in this commit.
2. **Doc 167's status and TODO list are out of date** (`:4`, `:108`, `:110`). The status still says "In Progress (C round 212 check pending)", but rounds 212 and 213 both passed. The TODO still lists the 212 gates and the "CP12a–d within 30 s" check. That check is done: `verify.log:536-539` shows 4.6–5.9 s, and LOAD-213 passed.
   - **Fix:** follow doc 166 in this same diff, e.g. "Completed (C round 212/213 PASS)", and clear the TODOs that are done.
3. **B's ruling C-R212-01 is still open** (doc 167 `:102`). Two perf rows are waiting on it:
   - `commits-per-move` went from 0.926 to 0.917, exactly the one release commit this round removed on purpose.
   - `load.longtasks-over-50` went from 1 to 2. C traced that to the test environment.
   
   This doesn't change the verdict, but B should record the ruling before or with the commit so it doesn't get lost.
4. **The new field sync in `ArrangementDetailPanel.tsx:514-518` changes timing, which jsdom can't fully show.** The sync now runs during render (React's "adjust state when a prop changes" pattern) instead of in a layout effect. That gives one commit on release (CP15), and CP16 covers Undo, Redo, Escape and Reset.
   - One older behaviour is unchanged: if the selection moves to a clip with the same displayed dB, half-typed text stays in the field, because the trigger value hasn't changed. This was already the case before this round.
   - **Fix:** none needed now. If that ever counts as a bug, include the selected clip ids in the sync trigger.
5. **`ArrangementDetailPanel.tsx:996` creates a new array on every parent render** (`[clipGainDb ?? 0]`). That's harmless today because the gain block isn't memoized (`memo(` appears only at `:1034`). Hoist it into a `useMemo` if the block is ever memoized.
6. **Test cleanup (low priority):**
   - The WG2 title in `clip-gain-waveform.test.tsx:387` still says "byte-identical", but the test now proves this through the old-format rebuild. Reword the title.
   - The PO1–PO4 ids clash with ids in `pending-status.test.tsx` (the doc mentions this).
   - The test helpers `columnsOf`, `outlineOf` and `expectOutlineOfRects` are copied into three test files.
7. **Lint:** `verify.log` prints only the first 19 of 205 Biome warnings (186 are hidden), so I couldn't confirm that the touched files have no new warnings. Running `npx biome lint` on those 3 component files would settle it.

### Things the tests can't catch, checked
- **Event order and leaks:** no listeners or timers were added, and one layout effect was removed. The gesture lifecycle and `readClipGainAnchorDb` (which runs in the pointer handler) are unchanged.
- **Outline path (`ArrangementClip.tsx:274-283`):** it is one closed shape that doesn't cross itself, because the top is always below 1 and the bottom above 1. The signature, `columns`, the height formula and the `null` cases are unchanged. WG2 matches the old sha256 again through the old-format rebuild. C compared 28 cases pixel by pixel: no pixel differed by more than 8 and the largest difference was 5/255.
- **Render cost:** at normal CPU speed, p95 dropped from 18–60 ms to 6–8 ms. At 6× throttle the recorded rows look higher than C's round 211 numbers, but C's same-day probe shows the old and new code are about equal (45.8 vs 45.2 ms stopped, 59.6 vs 57.2 ms playing). That's not a regression; it's existing slowness on slow CPUs.
- **Index alignment:** `clipIds` and `clipGainsDb` are built from the same `clips` array (`StudioWorkspace.tsx:2188,2192`). In single-clip mode both arrays have one entry.
- **TS strict, Tailwind and accessibility:** no `any`, no type assertions, semicolons are present, no class or design-token changes, and the `aria-valuetext` behaviour is covered by CP17.

### Good Practices Found
- `storedClipGainsDb` replaces a `getArrangement()` call during render, which read a mutable ref. That's a real coupling reduction, and the old "missing prop falls back to 0 dB" path is gone.
- CP12-COVER proves the four chunks cover every value exactly once, so splitting CP12 lost no coverage.
- The doc is honest about what failed on the original code (red-proof), with a named mutant for each new test.

### Architecture note
- **Already-known item on this owner:** GATE211-S2 is waiting for checkpoint D-29z195 (`ArrangementDetailPanel` keeps growing gain-block wiring). Keep it for now: this round reduced coupling and didn't add any.
- **Proposal (a), for the planner/root, since config is protected:** set the Tailwind source scan to skip `docs/`, so documentation can't change the CSS bundle.
- **Proposal (b):** once a shared test-helpers file is allowed in scope, move the peak-path parsers there (one file, three imports, nothing else changes).

### Alternative Approach (Studio rendering)
- **Current:** one SVG outline path drawn with plain V/H commands.
- **Alternative:** canvas drawing, or merging neighbouring columns of equal height into one step.
- **Verdict:** keep the current approach. The 1× target is met, the output is the same pixels, SSR still gets a first paint, and the deterministic string keeps the tests simple. Canvas would mean an empty first paint and no jsdom test coverage. Merging columns would make the output non-deterministic for a small gain.

### Score: 9/10