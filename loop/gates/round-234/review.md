COMMIT: OK. Nothing in the diff blocks the commit, and the changes don't touch auth, purchase or download code.

## Code Review: SABA-B-11a stage 1 — tempo seed (round 234)

**Scope:** I reviewed only this diff, at HEAD `db5c297`: `StudioWorkspace.tsx`, `tempo-seed.ts`, the `types`, `data` and `strings` changes, the tests and doc 182. This is not a full audit of the module. In `verify.log`, typecheck is clean, 210 test files and 3015 tests pass, and the build succeeds. The lint warnings are all in files outside this diff. I did not open `c-round-234.json`, and `test:e2e:smoke` is not part of `verify`. So any real-browser evidence rests on C's PASS, not on my own check.

**The one real-browser risk I checked — a seed firing mid-gesture.** It doesn't happen. A library drop calls `dropLibrarySource` once, on `drop` (`ArrangementLane.tsx:326-331` → `ArrangementContext.tsx:1508-1531`). That call is behind `refuseEditDuringGesture()`, and no temporary clip is written during the drag. The seed effect therefore runs after the gesture is over, so Snap and the grid can't change under a live drag. The first dropped clip lands exactly where it was dropped, because Snap was still off at drop time. That is expected.

### Critical Issues
- None.

### Suggestions (most important first; none block the commit)
1. **`StudioWorkspace.tsx:1398-1424` — the seed message is lost when a project opens with a BPM clip already placed.** The provider's loading effect runs after this child effect and replaces the status text. Tempo, grid and Snap are still set correctly, but the user is never told the tempo changed. Doc 182 lists this as a TODO for B; I'm recording it here too. **Fix:** either add a functional `setStatus((prev) => …)` to the context, or have the context announce the seed after its "ready" status.
2. **`StudioWorkspace.tsx:1402` — the seed check never stops in projects without BPM sources.** In an SFX-only project the seed stays open, so `findAssetTempoSeed` builds two `Map`s on every `clips`/`tracks` change for the whole session. The cost is small but never ends. **Fix:** compute `const collectionHasTempo = useMemo(() => collection.sources.some(s => (s.kind === 'music' || s.kind === 'stem') && s.bpm !== undefined), [collection.sources])` and return early on `!collectionHasTempo`.
3. **`StudioWorkspace.tsx:1423` — stray leading space.** If `status` is `''`, `[status, ...parts].join(' ')` produces `" Tempo …"`. **Fix:** `[status, ...parts].filter((part) => part !== '').join(' ')`.
4. **`StudioWorkspace.tsx:1398` — one frame on the old grid.** Because the seed runs in `useEffect` (after paint), the browser shows one frame with the 1 s grid, Snap off and no bars ruler before switching to `1/4`. The refs update right away, so behaviour is correct; this is only a possible flicker. **Option:** `useLayoutEffect`. It runs only once, so the cost is small. This is optional.
5. **Accessibility:** one aria-live message now holds three sentences (placement, tempo, Snap). That's acceptable, but long. It might be worth asking Saba whether the Snap sentence should be shorter.
6. **Possible input race in `ArrangementTempoRow`** (low risk): if the user clears the empty field so the draft is `''` and has not blurred yet, then the seed sets 90, the next blur runs `commitTempoDraft('')` and calls `onTempoChange(null)`, clearing the tempo that was just seeded. In practice a mouse drop blurs the field before the drop handler runs. A Ctrl+V paste typed while the field has focus would go to the field, not the timeline. Risk is low; recording it only.
7. **Perf:** none of the `perf/` or `e2e/` specs name a source; my grep for source ids and titles found nothing. As long as the default selection (`sources[0]`) is not a synthetic stem, the baselines are unaffected. If a perf scenario adds a stem, its run now has Snap on, a `1/4` grid and the bars ruler. That's not a regression, but compare those runs with that in mind.

### Good Practices Found
- `findAssetTempoSeed` is a pure function and contains no Georgian text (now covered by the test at `strings.test.ts:1149`). It accepts only `music`/`stem` sources and uses the same 20–999 range and rounding as `parseTempoBpm`. It never falls back to 120 when no BPM is known.
- The "hand-chosen" flags cover every path that changes tempo, grid or Snap. `setSnapEnabled`, `setMusicalGridDivision` and `setTempoBpm` are only called from `toggleSnap` (button, G key, grid menu), `changeGridDivision` (select, step, triplet) and `changeTempo`. `gridHandChosenRef` is set only after the refusal guards, so a refused choice doesn't count as a hand choice.
- The refs are updated inside the effect at the same time as the state, so shortcut handlers never read old values. Under StrictMode the second effect run returns early because the refs survive.
- Undo, Redo and the one-shot behaviour are pinned by TU6, the drag snap and Alt bypass by TU7, and mount by TU8. The mutant MU-A turns 7 of the 8 UI tests red.
- No new `any`, no type assertions, no suppressions. The source title is rendered as plain React text, so there's no XSS path. No new CSS or colour classes.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `StudioWorkspace.tsx:538-540` and `:1398-1424` add three refs and one effect to the component.
- **Signal 3 (one region changed again and again):** the tempo/grid/Snap block (`:1326-1465`) has been changed in the tempo, metronome, grid, triplet and now seed rounds. 11a stage 2 and 11b are queued against the same lines.
- **Keep for now:** these refs share one lifecycle with the grid refs, and the hand-chosen flags only make sense next to the handlers they guard. Splitting them out in this round would put the gesture/snap read path (`:1806`, `:2149`) at risk. Value: medium.
- **Proposal for the planner (not approved scope):** one bounded `useTempoGrid` hook that owns `tempoBpm`, `musicalGridDivision`, `secondsGridDivision` and `snapEnabled`, their refs and the seed. It would return the handler and ref shape the JSX already uses. Acceptance: `grid-snap-edit`, `tempo-seed-ui`, the metronome tests and the `fader-guards` grid cases pass unchanged, and `useArrangement()` is not modified. Best done before 11b.

### Alternative Approach
- **Current:** an effect in the component, keyed on `clips`/`tracks`/`sources`. It covers every way a clip can be added and is one-shot through `tempoSeedOpenRef`.
- **Alternative A:** seed inside `ArrangementContext`, at the points where clips are committed (add, drop, paste, initial arrangement). Status would update atomically with the placement, which would fix suggestion 1. But tempo state would have to move into the context, which is an ownership change, and every add path would need its own hook.
- **Alternative B:** seed only in the library Add handler. Rejected (doc 182 also rejected it) because drop, paste and the initial arrangement would be missed.
- **Verdict:** the current approach is the right choice for this stage. It covers the most add paths with the least change to ownership. If suggestion 1 needs fixing, a functional `setStatus` in the context is cheaper than Alternative A.

### Score: 8.5/10