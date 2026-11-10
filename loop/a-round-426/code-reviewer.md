# code-reviewer result, round 426 (verbatim summary of findings; full text in the A session transcript)

Score 8.5/10. Critical: none. High: none.

Medium:
- HM5 (mixer-held-enter-ui.test.tsx:247-253) sends repeated keydowns to the reset button after asserting it is `disabled`; a real browser cannot focus a disabled button. The motivating case (setTrackPan refused during an active pointer gesture, ArrangementLane.tsx:755-759, button enabled and focused, refusal re-announced) has no row. Slider repeats on l.250 are not asserted. Fix: a gesture-active row.

Low:
- HM15 runtime asserts (l.396-397) are green at HEAD too; only `expectTypeOf` (l.395, under tsc / MU-SPREAD-TYPE) proves the type guard. Doc should call the runtime part a regression pin.
- HM13 (l.364-367) observes only the prevented event (doc already says so).
- No per-press Space-on-fold test in this suite; guard runs before the Space branch (ArrangementLane.tsx:820-832, ArrangementGroupHeader.tsx:255-267); by reading, Space cannot hit the prevent path.
- Doc 274 l.21/l.88 names only Split, Loop, Zoom to range; ArrangementTransport.tsx has 7 buttons with onKeyDown before the soft-disabled spread (l.304, 320, 335, 356, 453, 532, 552).

Checked, no issue: button coverage (7/4/2/1 = 14, all guarded); transport has no private copy, Export uses the helper, Fit unguarded (behaviour-identical vs HEAD unverified by the reviewer, no git); group name guard before F2, input settles only on a fresh press; renderPanReadout needs no new dep; StudioWorkspace global handler reads defaultPrevented only for Escape (l.2748), no change to Enter handling; doc numbering and cited neighbour tests exist; mutant/probe files not visible to the reviewer (outside repo).

Architecture note: no signal; keep as is. Per-button edits already planned for stage 2b with a grep row (TL-R425-06).
