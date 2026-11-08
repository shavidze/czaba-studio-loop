# Sketch review, SYS-R385-2 (round 405): dispatched sha256 c64a5589ed319464f2e58b35faa0b43cf5849cacd80feaa83e1a850c9fbd9d92

Reviewer: `tech-lead` (read-only), two real runs, 2026-11-08. Recorded as summary; verdict lines verbatim.

## Pass 1: v1 sha256 9158d333df48fea57be36ff6607efc0e4fb0cce87d90f4fa382fec2bc8a98e0c
- No Medium+. No type assertions (`groupIdOf` narrows with typeof/in/null). AC7 identity proof sound: every step `toBe(actions)`, then each of the 34 entries `toBe` the provider value's same key; `ACTION_KEY_COUNT = 34` matches the `Pick` and the memo literal. GH5 recorder sound (ids pushed on the same changed branch as counts). master-ui footer test leak (counts never cleared in that file) is real and now fixed. All four targeted findings closed.
- Lows: **TL-R405-SK-L1** render-budget RB-LEAF1 still had a vacuous `'ArrangementMaster'` `toBe(0)` (never mounted under StudioWorkspace); **TL-R405-SK-L2** dead `mountProbe(collection)` parameter; **TL-R405-SK-L3** AC7 preview step relied on two microtask turns (use `waitFor`); **TL-R405-SK-L4** gain check passed after preview alone (check the commit's undo label).
- Verdict: "no Medium+; dispatch as is. Folding in L1 and L2 is recommended but not required."
- B: all four folded into v2, plus deferred TL-R403-SK2-L1/L2 (fix home stage 2).

## Pass 2: delta on the final sha c64a5589…
- No new Medium+. RB-LEAF1 removal is not an assertion loss (the count could never be non-zero; the `ArrangementMasterViewInner` `toBe(0)`/`toBe(1)` checks stay). `Object.freeze(start.markers)` type-safe (`freeze<T>(o: T): Readonly<T>`), `markerCount(start) === 1` prevents a vacuous identity check; MU-405-MARKERS-INPLACE / -COPY red. L3/L4 closed (`undoLabel` before the step is `'Master Mute'`, so `'Master Volume'` proves the commit; MU-405-MASTER-COMMIT-SKIP red).
- Side note (outside the delta): the `ArrangementMaster` export looks unused in production; = GATE375-L1 family (SABA-Q-UNUSED-LEAF-WRAPPERS), not filed twice.
- Verdict: "no Medium+; L1 to L4 and TL-R403-SK2-L1/L2 are closed; the RB-LEAF1 removal is not an assertion loss; dispatch sha c64a5589… as is."

## Mutants (per-row logs in `mutants/`)
`mutants/summary.txt`: 14/14 RED; gap mutants (SELECTED-DEP, SOURCESTATES-DEP, PREVIEW-DEP, SEEKTO-WRAP) keep AC1/AC2 green; pristine before/after rc 0 on all 5 files; scratch status 0.
