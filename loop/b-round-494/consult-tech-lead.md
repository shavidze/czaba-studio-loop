# tech-lead consult: RETRO 495 (B, 2026-11-13; read-only; input b-round-494/consult-inputs.md)

The returned text is saved verbatim below (tables and quotes as returned).

## RETRO 495 consult (tech-lead, read-only)

**Main finding:** all 4 C FAILs are the 4 STOPs (`b-round-494/data/fails-detail.txt`, `stops-head.txt`). Every defect had origin B spec, and every one sat in a sketch that B's `tech-lead` review had approved.

### 1. Root causes and the rule that would have prevented each
| Round | Cause (evidence) | Preventing rule |
|---|---|---|
| 487 | The sketch focused the name field when the save settled, unconditionally (`a-round-487.md`; `b-round-486/l50-hits.txt` l.132–173). The L50 grep listed these hits, but the review's Q1 called the focus return "correct" (`b-round-486/sketch-review.md` l.9). Nobody asked "what if the user moved focus while the save was in flight?". A second STOP: §1 and §2 of the task disagreed on the STOP threshold, breaking L10's RETRO 480 clause. | New L47 clause (see 2). L10 compliance for the second STOP. |
| 489 | TL-R489-M1's fix added `isZoomGesture`. The mutants M18–M20 test one direction only, and the dispatcher sends a plain `new Event` (`b-round-488/sketch-review.md`; `a-round-489.md`). | L52's round-490 clause. It was written because of this round, so it could not have been followed in 489. |
| 492 | Doc 318 l.22 is true for a keyboard open only, yet the task's own Deviation already said "mouse: no ring". TL-R492-V2-I3 called every sentence true (`a-round-492.md`). | A sentence-by-sentence ledger split by input origin. |
| 493 | Doc 318 l.36 contradicted B's own deferred Low B-R492-PASSWORD-BACKDROP-SHORT (D-29z1757). The v4/v5 truth review covered l.24–30 and l.34 but not l.36 (`a-round-493.md`). The STOP list in `tasks/round-493.md` l.96–102 says "doc line false → STOP, editing nothing", which overrode L26's round-473 clause (A may correct a false line in place). | L26 round-473, if it had not been overridden. That would have cut the chain from length 2 to length 1. |

RC-R492-DOC-TRUTH-REVIEW is the right lesson. It belongs in **L26**, not L58: L58 is already over the cap, and adding the clause would still leave it at 4,839 B. Wording (431 B):

> **Every sentence has a ledger (RETRO 495, RC-R492-DOC-TRUTH-REVIEW):** before dispatch, `b-round-N/doc-ledger.md` maps each declarative doc sentence to a test row, a browser row on the same code per input origin (mouse, keyboard), a `[K#]` claim, or inference wording, and greps open/deferred findings on the touched files for contradictions; a task STOP list never overrides the clause above. Evidence: C-R492-01, C-R493-01 (2×).

### 2. The two unruled-Medium STOPs (487, 489)
These were gaps in what the sketch review covered. They were not cases of a rule being ignored.
- **487:** no lesson covers a focus write after an async settle. L47 names focus targets, L50 lists where focus can come from, and L51 handles status clobbering, but none of them covers this. Add to L47 (284 B):
  > **Focus write after an async settle (RETRO 495):** a `.focus()` that runs when a save or request settles moves focus only if focus is still on body or inside the origin; a row moves focus elsewhere while in flight, with a mutant. Evidence: A-R487-REVIEW-FOCUS-STEAL, C-R487-01 (1×).
- **489:** now covered by L52's round-490 clause. Add one thing: a fix made in answer to a reviewer Medium gets its own mutants in both directions.
- **Systemic issue:** both sketches were reviewed by `tech-lead` only, and A's finder was `code-reviewer`. `l58-check` scored 14/14 in the same window, so it checks the review's form (sha, verdict), not its content. Ask root to put `code-reviewer` on B's list. Failing that, B's brief should carry A's reviewer questions: what happens after each `await`, and which mutant covers each side of each new branch.

### 3. Trims (simulated in memory on `lessons.md`, no file written)
Cuts total 1,726 B. Every evidence id is kept; only narrative, examples and repeated round lists are cut:
- **L58 (l.41):** drop "(e.g. `not.toBe(valueAt`, …moved trigger)" (87 B) and "(the perf spec on a production build, network capture, name-keyed test)" (72 B). Merge parentheticals in the 312–320, 367, 327 and 411 evidence clauses, and drop "round 415". Result: l.41 = **4,730 B**.
- **L1:** drop "(rounds 192, 194, 201 lost)" and "(round-449 planning; the advisor caught it)".
- **L61:** drop the three Saba/round narrative parentheticals (the spin-arrow story, "teal Modal bar…", "6 px hover band…").
- **L28:** shorten "8 stale-status findings… old rule" and drop "(doc 170 kept…)". Keep the root-request sentence, because it is rule text.
- **L26:** drop "(the round-230 wording also required `## Prompt`…)".
- **L44:** drop "SABA-B-9 stage 1 (round 256…) …(c)."
- **L57:** replace the tasks-313/314… narrative with "tasks 313–320, `b-round-320/l57-fields.txt`". Also fix the unclosed backtick in `b-round-335/exp-fields.txt`.
- **L59:** drop the "(round 340: `end_turn`… 133 rows)" detail.
- **L11:** shorten the evidence to "C-R252-01, C-R256-01".
- **L12, L14:** drop the narrative parentheticals.
- **L18:** drop the STORE-1d and SABA-B-13 narratives.

With the two new clauses added, the result is **57,351 B, 60 lines, longest line 4,730 B**, which meets the counter.

### 4. Deferred Lows: one systemic task?
The 27 focus/keyboard ids are not one class (`classify-out.json`). The keyboard ones are mostly entrance-test and classifier items from 489–490 (A-R490-*, GATE490-L3), plus test and doc citations.

A **shared dialog primitive** (focus in, Tab trap, Esc stack with stopPropagation, full-viewport backdrop, return focus) would really close 8 ids:
- TL-R492-L4-CTRLK-OVER-DIALOG
- A-R492-REVIEW-I1-PALETTE-TRAP
- A-R492-REVIEW-L5-TABBABLE-SELECTOR
- A-R492-REVIEW-L1-IME-KEYCODE229
- B-R492-PASSWORD-BACKDROP-SHORT
- B-R492-PASSWORD-DIALOG-NO-MARGIN-NARROW
- A-R492-REVIEW-L4-REOPEN-MOUSE
- shared-modal-no-focus-management

**Scope and owner files:** `app/components/ui/Modal.tsx` (status root, read-only for the loop), with PasswordModal migrating out of `app/routes/account.tsx`. `LeadMagnetPopup.tsx` and `ExportDialog.tsx` (the only importer of `ui/Modal`) would follow later.

**Order:** run it **after DPG-BUTTON-CLEANUP, not after all of DPG P1**. It is blocked on root (the Modal.tsx grant and the checkpoint), and BUTTON-CLEANUP is not blocked. Fold B-R492-PASSWORD-SUBMIT-FOCUS-LOST and GATE488-L3 (disabled-button focus) into BUTTON-CLEANUP's rows, following L8.

### 5. L57 enforcement
None of the four INCOMPLETE rounds has `c-round-N/l57-check.txt`, so the checker never ran.
- Tasks 485 and 488 have no `l57-check` row at all.
- Tasks 487 and 493 had the row (C10), but the short STOP route skipped it: 493 runs only C1, C2 and C8 (`tasks/round-493.md` l.147).

All four causes sit on B's side, so B's claims script can enforce it:

> **L57 rule:** B's claims script fails unless (a) the task contains the literal `tools/l57-check.py c-round-N.json c-round-N/l57-check.txt` row, and (b) the task's L22 short-route line names that row. At each planning, B asserts that `c-round-{N-1}/l57-check.txt` contains `L57 OK` and files an INFO id for each miss.

### 6. Counters for RETRO 510
| # | Counter | Threshold |
|---|---|---|
| 1 | C FAIL + BLOCKED | ≤ 2 of 15 |
| 2 | STOPs with origin B spec | ≤ 1, and 0 on a doc sentence |
| 3 | `c-round-N/l57-check.txt` with `L57 OK` | 15/15 |
| 4 | Rounds that ship an implementation doc and also have `doc-ledger.md` | 100 % |
| 5 | `lessons.md` | ≤ 57,500 B, ≤ 60 lines, no line > 4,800 B |
| 6 | Longest fix-up chain | ≤ 1 |
| 7 | Deferred Lows | ≤ 35 new, ≥ 12 closed |

### 7. Separate frontend-architect checkpoint now?
**No.** ARCH-CHECKPOINT-ACCOUNT-PROFILE already covers "ProfileContent + PasswordModal" (`backlog.json` `architecture_checkpoint_requests`; `b-round-488/checkpoint-request-account.md`). A second request would be a duplicate under L7. Instead, add the gate-494 PasswordDialog extraction as `confirmedBy` on that request, give it an L46 deadline round, and hold any further `account.tsx` task until root answers.
