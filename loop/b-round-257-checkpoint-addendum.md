# Addendum 2 to ARCH-CHECKPOINT-TRANSPORT-POSITIONS (`b-round-253-checkpoint-request.md`), round 257 → 258 planning (D-29z505)

Non-blocking. SABA-B-9 stage 1 is now closed: C round 257 PASS, published `d732d26`. This is a feature boundary on the same owner, `ArrangementTransport.tsx`. Root runs the read-only `frontend-architect` per `store/.claude/references/architecture-checkpoint.md`.

**New signals:**
- **GATE257-ARCH-TOOLBAR-CHURN** (`gates/round-257/review.md`, Architecture note, Signal 3).
  - `ArrangementTransport.tsx` l.130–400: the layout and the button order were reworked in V-3a/b, SRW-14 and SABA-B-9.
  - Each rework changed about 9 test files that depend on button order.
  - The reviewer's verdict is **keep**: the component has one owner, one `useArrangement()` read, and the `fitButtonRef` handoff crosses groups.
  - Proposal: move the remaining by-index checks to by-name checks per group. These are GS14 (`grid-snap-ui.test.tsx` l.405–418) and NS (`navigation-strings-ui.test.tsx` l.175). This needs no component change.
- **A-R257-ARCH-A11Y-SPREAD** (`c-round-257.md` §5, forwarded from A's reviewer): the transport a11y contract is spread over 9–10 test files.

**Question 7 (added):** keep the toolbar test contract as it is, or run one bounded, test-only task?
- **The task would:**
  - turn the order and index assertions into per-group by-name checks;
  - name one file as the owner of the transport a11y contract (names, descriptions, `aria-keyshortcuts`).
- **Acceptance:**
  - `grid-snap-ui`, `navigation-strings-ui` and `transport-centre-ui` stay green, and no assertion is lost (L4);
  - a mutant that moves one button inside a group turns only that group's test red.
- **Answer format:** value, risk and keep/extract, in at most three sentences.

**Unchanged:**
- Questions 1–6 and their addenda.
- An approved change is scheduled as a separate B task, with one owner and behaviour-preserving tests.
- The checkpoint blocks neither the regression round 258 nor SABA-B-9 stage 2.
