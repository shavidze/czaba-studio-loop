# Round 376 sketch review (tech-lead, read-only, static; no tests run by the reviewer)

## v1 review — verdict: approve with changes
- **TL-R376-M1 (Medium):** a focus hand-off armed by a click whose commit leaves the group's props unchanged (two Undo clicks with identical labels; Zoom back to an equal view) stayed armed until a later commit of that group. HEAD cleared it at the next Transport render. Not a regression of the source/partner pairing (both are always in the same group), but a widened arm lifetime. **Fixed in v2:** `useSoftDisableFocusHandoff` with a one-frame expiry; row FL11 (HEAD green, v1 red, v2 green: `fl11-on-head.log`, `fl11-on-v1.log`).
- **TL-R376-L1 (Low):** hand-off logic duplicated in Edit and View groups. **Fixed in v2** (shared hook).
- **TL-R376-L2 (Low):** the `ArrangementTransport` wrapper is reached only through `index.ts:8` and tests. **Ruled:** kept as the public convenience API (rounds 374/375 pattern); RB-LEAF4 asserts it renders 0 under StudioWorkspace (site-revert guard, mutant MU-T-SITE-REVERT). Shared deferred Low: GATE375-L1-UNUSED-WRAPPERS.
- Stale props: none. Loop identity: stable across unrelated commits and undo (RB-LEAF4 Centre 0 on mute and undo with a loop on). Tests: no vacuous rename, nothing removed.
- Mutants proposed: 11; B runs 10 (`mutants/run-all-376.sh`); the comparator-ignores-labels mutant is covered by MU-T-EDIT-NO-MEMO's family and the RB-LEAF4 mute step.

## v2 delta review — verdict: approve (Lows only)
- (1) The one-frame expiry cannot drop a real hand-off: undo, redo, deleteSelection and zoomTimelineBack commit synchronously in the click; FL10 (BODY before commit) unaffected.
- (2) No test runs rAF callbacks immediately; FL1–FL10 behave as on v1; FL11 is the only test of the expiry.
- (3) Range-start +2: accept (the alternative renders four).
- **TL-R376-D-L1:** a frame is scheduled even when the arm is null. → info (harmless; changing it would re-run every measurement).
- **TL-R376-D-L2:** FL11 does not override `cancelAnimationFrame`, so both queued frames run. → info (same effect twice).
- **TL-R376-D-L3:** rAF pauses in background tabs, so an unused arm can survive a tab switch. → info (very unlikely path; HEAD kept arms for no-commit clicks too).
- **TL-R376-D-L4:** wrapper kept with a guard = TL-R376-L2 ruling.
- **TL-R376-D-L5:** EditGroup subscribes to the range store twice; one tri-state selector would drop a subscription without changing render counts. → deferred Low candidate for the polish pass.

Reviewed sha: v2 = `sketch.patch.txt` (see `sketch-dispatched.sha256`).
