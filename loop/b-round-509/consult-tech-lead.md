# tech-lead consult: RETRO 510 (B, 2026-11-14; read-only; input b-round-509/consult-inputs.md)

The returned text is saved below as returned (condensed only by removing blank lines).

## 1. The four STOPs
- **496:** two code-reviewer Mediums say the guard is weak. GS3 matches only the exact old selectors, and BC1 pins only primary/md (`a-round-496.md:27-37`). The review called the guard "the regex" and stopped there (`b-round-495/sketch-review.md:9`, Info). B's mutants M1–M8 revert or remove things; none changes a variant or size, or a selector form (`b-round-495/mutants.txt:1-8`).
- **499:** the `/store` link was pinned only by a source substring. Mutants N7/N8 test only literals; none changes the builder arguments or `to` (`a-round-499.md`, STOP section). The review claimed "the DOM rows catch it" (`b-round-498/sketch-review.md:10`), but `/store` has no DOM row.
- **505:** B2D-7 never focused Start Chat before unmounting it. The matrix passes (`b-round-504/mutants-505.txt:7-8`), but no mutant breaks the "focused element unmounts" precondition. L47 already requires replaying the real order (`lessons.md:28`).
- **507:** no swap mutant existed (`a-round-507.md`, the Evidence and B's matrix bullets). A applied the swap mutant and the test file stayed green, 5/5.
- **L58's role:** none, as far as these files show. The v1→v2 delta touches only the mock and the types (`b-round-506/sketch-delta-v1-v2.diff.txt:17-42`); the click block is unchanged, so the gap was already in the reviewed v1. The v1 review asked no "what survives" question and found no Medium (`b-round-506/sketch-review.md:5`). The 508 delta review asked exactly that question and found three Mediums (`b-round-507/sketch-review.md:3,8-10`). The missing sha and verdict in 507/508 are form gaps, not causes.

**Common cause (part fact, part inference):** all four were Mediums on B-written test lines in byte-pinned files. A could not edit them, so each one became a STOP (L10/L11, check 4). In 496, 499 and 507, B's matrix tested "revert or remove" but never "change an asserted attribute to another valid value" or "swap siblings". 505 is a missing-precondition gap (L47/L52) and fits only loosely.

**Rules that would have prevented them:** 496, 499, 507: site × attribute mutants plus a "which single edit survives?" review question (lesson change A). 505: L47 applied to the jsdom row. All four: a strengthen-only grant would have turned each STOP into a fix inside the round (lesson change B, an inference).

## 2. Doc ledger (5/11)
- Fact: ledgers exist for byte-sketch rounds 500, 501, 503, 505, 506. So the lesson was realistic and was skipped. None of tasks 507–509 mentions a ledger (grep count 0).
- Fact: `b-round-506` had no ledger, and its review found four false doc sentences (`b-round-506/sketch-review.md:10-13`).
- Recommendation: keep it, narrow it to sentences that claim behaviour, and enforce it with a script (extend `tools/l58-check.py`: when a dispatched sketch touches `docs/implementation/`, fail unless `b-round-N/doc-ledger.md` exists and names every row id the doc cites).

## 3. Cost
- Fact: rounds dispatched without a byte sketch or as a delta cost B $6.74 (497), $8.95 (508, delta) and $8.63 (509). The 11 rounds with a full byte sketch cost B $11.13–$24.80, median about $17.
- Fact: the byte-sketch rounds also produced every STOP.
- Inference: the main driver is full byte sketches (B writes product code, tests and doc, then runs mutant matrices, pre-check suites and builds). Second driver: closing-check rework (doc lines found false at closing check, D-29z1816 and D-29z1822).
- One change: full byte sketches only for product-code hunks that carry risk. A writes the tests and the doc; B dispatches the site × attribute mutant list plus the ledger rows as the contract. Round 509 shows this works: B $8.63, PASS.

## 4. Deferred Lows
- D-29z1772–1843 are decision-log entries; classified the 78 ids in `data/deferred-added.txt` by text. 18 are test-strength Lows on the per-stage DPG test files (e.g. A-R501-CR-ST5-STRING-PIN, A-R503-CR-2-B2B3-6-WEAK-COUNT, A-R504-CR-2-DISABLED-CLICK-NO-MUTANT, A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON, A-R508-CR-VOLUME-ICON-UNPINNED, A-R509-CR-TEST-SELECTORS); probably also A-R496-CR-BC5/BC6, A-R498-CR-ST5/B2-5/ICON.
- One systemic task: DPG-BUTTON-CONTRACT-TABLE as the stage-2 close-out: merge the nine `app/lib/__tests__/store-button-cleanup*.test.tsx` files into one table-driven test; each migrated site's class set equals a rendered reference of its size (as N1-7), plus swap and precondition mutants; one CSS and TSX token guard over all of `app/`.
- Timing: not now; after N2–N9 (they add rows straight into the table). The 7 B-R506-LM-* Lows need a Saba decision; not part of it.

## 5. Lesson changes (57,164 B / 60 lines → about 57,499 B / 59 lines)
- A. Append to L52: "**Site × attribute mutants (RETRO 510):** per pinned site, one mutant per asserted attribute set to another valid value (variant, size, `to`, handler, focus precondition) and one swap of same-shaped siblings; the review asks "which single edit survives?". Evidence: STOPs 496/499/505/507 (4×)."
- B. Append to L11 (policy change, B or root must agree first): "**Strengthen-only (RETRO 510):** A fixes a reviewer finding on a sketch test line in-round if the fix only adds asserts/rows (`expect(` not fewer) with a red mutant; check 4 on tests = every sketch `+` line present. Product-code Mediums still STOP."
- C. Replace L26's "Every sentence has a ledger" clause and delete the redundant line 43: "**Behaviour sentences have a ledger (RETRO 510):** a sketch with doc text ships `b-round-N/doc-ledger.md` mapping each behaviour sentence to a test row, browser row, `[K#]` claim or inference; l58-check fails without it. Evidence: C-R492-01, C-R493-01 (2×)."

## 6. Counters for RETRO 525
C FAIL + BLOCKED ≤ 2/15; STOPs on a B sketch test line ≤ 1 (0 once strengthen-only is in force); l58-check 15/15 with ledger check; l57-check 15/15; doc ledger for sketches with doc text ≥ 90 %; lessons ≤ 57,500 B, ≤ 60 lines, no line > 4,800 B; fix-up chain ≤ 1; deferred ≤ 50 new and ≥ 10 closed (≥ 15 if the contract-table task lands); round median ≤ $17; B median ≤ $12; B share ≤ 70 %.
Inferences: the cost driver, the cost targets and the size of the deferred-Low class; everything else cited to a file and line.
