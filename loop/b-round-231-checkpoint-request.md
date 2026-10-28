# Architecture checkpoint request: the end of SABA-B-8 "Calm Studio" (B, round 231 → 232 planning, D-29z312)

**Status:** requested from root. It is to run **after C round 232 passes** (CALM-3, the final SABA-B-8 stage).
- **Non-blocking:** SABA-B-7, SYS-5 and PERF b-ii do not wait for it.
- **Why now:** a feature boundary, plus structural growth that has built up on one owner (`StudioWorkspace.tsx`).

**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. Root invokes it and records the result.
- Any approved change becomes its own bounded B task, with one owner and behaviour-preserving tests.
- Line counts below are context only, not a reason to split.

**Scope at `e5507ff`, plus the round-232 additions:**
- `app/lib/arrangement/library-notice.ts` (45 lines, CALM-2b): a per-collection dismiss flag. It uses `useSyncExternalStore`, an in-memory fallback and `localStorage`.
- `app/lib/arrangement/overview-visibility.ts` (new in round 232): a per-browser hidden flag in the same pattern. This is the Studio's second browser-storage helper. B chose to repeat the pattern rather than invent a third one (D-29z309).
- `app/components/arrangement/StudioWorkspace.tsx` (2,724 lines at `e5507ff`): the window `keydown` handler (from l.1756; registered at l.2105) now carries:
  - the `?` sheet;
  - the floating-video Escape;
  - the Ctrl+Alt+O toggle (round 232);
  - transport, edit, grid and marker keys.
- **Signals already recorded:** GATE228-S2-HARDCODED-KEYS, GATE228-S4-ARIA-LOOKUPS, GATE228-ARCH-STRINGS-SHORTCUTS, ARCH-A226-PRODUCT-ROUTE-KEYS, and ARCH-A231-ANY-DRAG-ACTIVE (A round 231 reviewer R1: one "is any drag active" owner for the lane hint).

## Questions (keep/extract, value, risk; at most 3 sentences each)
1. Should the two storage-backed view preferences share one small helper (key, in-memory fallback, subscribe, SSR snapshot), or stay as two 45-line modules until a third appears?
2. Should the window keydown handler be split into a keymap table driven by `STUDIO_SHORTCUT_GROUPS` (one source for the sheet, the titles and dispatch)? Or does the current ordered `if` chain stay, because its early-return order (sheet, export, typing, gesture) is the contract?
3. Should "is any drag active" (library ghost, OS file drag) be owned by `StudioWorkspace` and passed to lanes (ARCH-A231-ANY-DRAG-ACTIVE)? Is that worth doing before the deferred C-R139-02 / C-R231-01 ghost fix, which touches the same state?

Related pending requests (still open, non-blocking): `b-round-229-checkpoint-request.md` (SABA-B-7 envelope, wanted before SABA-B-7), plus `b-round-211`, `-221` and `-225`.

## Addendum (B, round 232 → 233 planning, 2026-10-28; D-29z317)
**Status: ready for root now.** The trigger has happened: C round 232 PASS, and gate 232 published `bd71144`. The request stays non-blocking. Round 233 (GATE232-S1) adds one small module-level helper in the same keydown region.

Two gate-232 Architecture notes (`gates/round-232/review.md`) are added as inputs to questions 1 and 2. Both are signals and are not scheduled:
- **GATE232-ARCH-CHORD-ACTION** (signal 3, one region changed repeatedly). The proposal is a pure `studioChordAction(event)` in `lib/arrangement/shortcuts.ts` for the modifier-chord branches (floating-video Escape, Ctrl+Alt+O); the handler would only dispatch. Acceptance: the keyboard tests stay green and unchanged, and the branch order stays the same. The reviewer says: keep for now.
- **GATE232-ARCH-STORE-DUP** (signal 2). `overview-visibility.ts` duplicates `library-notice.ts`. The reviewer says: keep, and revisit if a third copy appears. This is question 1 above. GATE232-S6 (no cross-tab `storage` sync, deferred Low) would be a natural part of a shared helper.

## Addendum 2 (B, round 233 → 234 planning, 2026-10-28; D-29z326)
**Status: SABA-B-8 is complete** (C round 233 PASS, gate 233 published `db5c297`). The request is still non-blocking and ready for root.

One gate-233 Architecture note (`gates/round-233/review.md`) is added as an input to question 2. It is a signal and is not scheduled:
- **GATE233-ARCH-DOCK-FOCUS-RESCUE** (signal 2, coupling). `StudioWorkspace.tsx` l.425–442 depends on the video dock's internal DOM order to find the next Tab stop when the Overview hides. The proposal: the dock exposes `rescueFocusFromOverview()` or accepts `onBeforeOverviewHide`, so the rule lives with the component that defines the order. Acceptance: OV-T6 unchanged, MU-1 still red, no new Tab stop. The reviewer says: keep for now (one call site). Deferred Low GATE233-S1 (production code queries a `data-testid`) would be closed by the same move.

Note for root: the next rounds (SABA-B-11a/b, 10a/b, 9) concentrate on `StudioWorkspace.tsx` (tempo, grid, transport state). A short answer to question 2 (keymap table vs ordered chain) before SABA-B-10a (Space contract) would help that stage.
