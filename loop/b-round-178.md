# B round 178 → round 179 planning (D-29z144)

**Decision: CONTINUE.** Round 179 is a **test-only fix-up for C-R178-BADGE-SELECTOR** (Medium). Two protected suites find the collection badge by its colour class. Round 179 switches them to text lookups so the round-178 work (DUX-R-5b-3a) can be published. The task is in `current-task.md`.
- **Archive:** `tasks/round-178.md` is an exact copy of the round-178 `current-task.md` (sha256 `8513b4c6…`, checked with `cmp`). The archive did not exist before.
- **Before-copies:** `b-round-178/before/` holds copies of backlog, feature-status, b-next, current-task and the checkpoint request, taken before any edit.
- **Baseline:** `gates/gate-round-178.json` is **skipped** (C taskStatus FAIL), so nothing was published.
  - HEAD stays `cc984b6`. The start state is cc984b6 + the round-178 working tree (12 ` M` + 2 `??`), which equals `c-round-178/end-tree-sha256.txt` (1003 files).
  - B checked that hash before and after its own vitest run.

## Inputs read (as data)
- `context/active-summary.md` (head and tail). `backlog.json` and `feature-status.md` were opened only by ID, through python and grep.
- `a-round-178.md`: 143/144 targeted, 4/6 purchased-collection, 108/108 neighbours, m278–m287 all red, reviewer 8/10. Two deviations: the Biome reflow, and the protected badge selectors.
- `c-round-178.md` / `c-round-178.json`:
  - **FAIL**, with `browserVerified` and `realVerified` true. The 13 browser rows PASS.
  - Failed: T178-TARGETED (C-R178-BADGE-SELECTOR).
  - Two rows need a ruling: SOURCE-SCOPE and AN-REVIEW.
  - Five infos.
- `gates/gate-round-178.json`: skipped. `env-status.json`: store 200.
- Decision files: `ableton-decisions.md`, `design-ux-decisions.md` and `direction-decision.md` are unchanged; nothing new for this stage. No root answer to `b-round-173-checkpoint-request.md`.
- `regression-last.json` = 2026-10-24, so the regression round is due on or after 2026-10-27. Today is 2026-10-26: not due, and the file is unchanged.
- **B's own evidence:** the full vitest on the round-178 tree gives **2610/2613**. Only LRS5, PW1 and PW6 are red (`b-round-178/out/vitest-full-r178-tree.json`), so the bug's scope is exactly these 3 tests in 2 files.
- **Advisor:** available, and consulted twice: after orientation (before writing) and at the end. Advice followed:
  - Make the unusual baseline explicit.
  - Wait for the full run before freezing the grants.
  - Reject `span.border-outline-strong`, which only moves the colour coupling, and avoid a `data-testid`, which would reopen product source.
  - Guard against a tautological lookup: keep PW1's negative lines, and return `null` or throw.
  - Add m290, a colour-only mutation that must leave LRS5, PW1 and PW6 green.
  - Give C a short real browser row, so `browserVerified` is earned on the combined tree.
  - Grant doc 147 for the Problem → Solution entry.
  - Record the rulings and the B self-finding.
  - At the end: m290's red set is exactly DXL3 and DXL8 (DXT8 stays green), and MUT-179 is read-only for C, so a job cut at its time limit cannot leave the source mutated.
- **Project subagents:** none consulted. The change is test hygiene with no product or design decision.

## Backlog updates (from independent C evidence only): `backlog.json` v168
- **Round 178 → `c_fail_medium`** (gate skipped, working tree kept). **DUX-R-5b-3a → ბაგია**: the browser rows PASS, the publication is blocked by tests. It is not მზადაა.
- **Round 179 dispatched** (D-29z144); plan record VISUAL-A `dux_r5b3a_fixup_d29z144`.
- **New open findings:**
  - C-R178-BADGE-SELECTOR (Medium, scheduled for round 179).
  - A-R178-BIOME-REFLOW (accepted; standing rule: "hunks only at these sites; formatter reflow allowed").
  - C-R178-INV-GROUPHEADER-252 (classified K10, kept and vetoable).
  - C-R178-EXPORT-CLIPS-AT-0DB and C-R178-ESC-NO-DRAG-CANCEL (product-question signals, not scheduled; no Ableton parity claimed).
  - B-R178-PLAN-GAP-TEST-SELECTORS (B self-finding plus a process rule: grep for selectors on the removed tokens before freezing grants).
  - ARCH-R178-SIGNAL3 (architecture signal, fifth round).
- **C-R177-G1-562 and GATE177-S5:** implemented in the round-178 tree. They close when rounds 178+179 publish.
- **Progress board:** `feature-status.md` gets the round-178 line, 5b-3a → ბაგია, and a product-question note.
- **Checkpoint request:** a round-178 addendum is appended (non-blocking). Fresh bounded request at the DUX-R-5 boundary.

## Why this task
- The bug gate puts Medium bugs before new scope. The bug blocks publication of a round whose product change already passed C in the browser.
- **Smallest honest fix:** a text lookup in 2 protected test files.
  - No product source changes: no `data-testid`, and `StudioWorkspace.tsx` stays frozen.
  - The PW1/PW6 assertions keep their discriminating half.
  - m288–m290 show that the new lookups catch a wrong or missing badge and ignore a colour change.
- **Browser coverage:**
  - **HASH-CARRY:** every product file is byte-identical to what C measured, so the 13 round-178 rows carry over.
  - **New real rows:** BADGE-BROWSER, G179-3 and FUNC-SMOKE-179.
  - **SELECTOR-SWEEP:** pre-computes the 5b-3b test grants, so the same gap does not repeat.

## Not complete, and why CONTINUE
- **Remaining work:**
  - 5b-3a (publication), 5b-3b and the DUX-R-5 architecture checkpoint.
  - The rest of VISUAL-A: M1, M3, M4 and ROOT-RECON-GRID-HARNESS.
  - After VISUAL-A: STORE-REDESIGN (direction A), REVIEW-RECOMMENDATIONS (22 approved ids) and T12-ADVANCED.
  - The deferred Lows (252), the regression due 2026-10-27, and the final regression.
- **Awaiting Saba (does not block):**
  - Q-V3-ICON-SIZE, Q-R166-EXIT-NAME, Q-R167-ON-HOVER and Q-V3C5-MODAL-RADIUS.
  - ABL-R-5/16/17, M5 and phase 2.
  - The vetoable lists.
  - SRW-21 is `deferred_user`.
- Nothing needs external input. Not COMPLETE: a Medium is open and much scoped work remains. Not BLOCKED.

## Ready for root
Nothing is ready to publish yet. On C PASS in round 179, rounds 178+179 publish together against `cc984b6` (14 ` M` + 2 `??`). B changed only loop planning files.
