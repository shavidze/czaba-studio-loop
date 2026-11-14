# A round 514: Cookie banner focus return + mobile Close overlap

**Status:** implemented, waiting for C. No STOP was triggered. HEAD is `4c85587` with no drift.

## Scope completed
- Pre-flight was run in the chat. I read these primitives: FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, TAILWIND_FIRST, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, `prompts/new-test.md` and `skills/pre-flight`. I also read `lessons.md` (the rows the task cites).
- Frozen checks 1, 2 and 3 were rc 0 before the apply (`a-round-514/frozen-pre.log`).
- I applied the sketch with `git apply b-round-513/sketch-514.patch.txt` (sha `e6e5f1dc…`). There was no other source edit.
- Frozen check 4 was rc 0 right after the apply (`frozen-check4-post-apply.log`).
- I wrote doc 332 with the editor tool, plus `a-round-514/doc-ledger.md`.

## Changed files (`git status`, `a-round-514/git-status-end.txt`)
- `M app/components/common/CookieConsent.tsx`: byte-equal to B's sketch.
- `M app/components/common/__tests__/CookieConsent.test.tsx`: byte-equal to B's sketch.
- `?? docs/implementation/2026/quarter-IV/332-cookie-banner-focus-return-close-overlap.md` (new)

## Checks actually run (logs in `a-round-514/`)
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, **171 warnings** (1 info) | `lint.log` |
| `npx biome check <2 files>` | rc 0, "Checked 2 files … No fixes applied." | `biome-scoped.log` |
| Covering (`b-round-513/covering-files.txt`) | rc 0, **6 files / 99 tests** passed. R514-F1 (Decline, Accept, Close), F2–F9 and N3-3 are present. The slowest test takes 268 ms, under 2,500. | `covering.log` |
| Scanner `scan-nonbrand-motion.py` | **50 hits** / 26 files, 0 CookieConsent entries | `scanner.log`, `scanner.json` |
| Frozen checks 1, 2 and 4 at the end | all rc 0 | `frozen-end.log` |
| Doc 332 self-check (C8 shape) | 7 headings in order, matching TEMPLATE; l.4 byte-equal; `grep -c pending` = 0; all 10 cited row ids grep 1 in the test file | (run inline) |
| code-reviewer (real subagent) | approve-with-changes, 0 Medium+ | `code-review.md` |

**/check skill.** I followed `skills/source-command-check`, which points to `.claude/commands/check.md`. That file asks for `npm run verify` and `test:e2e:smoke`. Under the speed rules and task §3, both are gate rows, so I did not run them. I ran the non-mutating scoped parts instead (lint, typecheck, scoped Biome, covering tests), and I applied no fixes.

**Context read.** I read `context/active-summary.md`. It has no root resume note, and both bugs show as "dispatched round 514". After the first advisor pass, I finished reading `BUG_HUNTING_TESTS.md` and `prompts/new-test.md`: the frontend checklist and the test checklist.

**Doc edits after the review.** These were doc-only, with no code: the flowchart edge (R5), and the word "დასკვნა" added to the Safari sentence so it matches the ledger. The ledger's source column was tightened: inference labels, and CC1–CC6 / N3-1…N3-6 rows for the unchanged consent logic. Line 4, the headings, `pending` and check 4 were re-run after these edits, and all passed.

Not run, by rule: the full vitest suite, the build, Biome on everything, `npm run verify` and `test:e2e:smoke` (gate rows); and mutants, which C re-runs.

**Browser.** A ran no browser rows. None are assigned to A. `:5173` has no GA4 id, so the banner does not render there, and A did not start a second server. C1–C5 belong to C.

## Acceptance criteria A truly passed
- §2: the one apply covers both tracked files byte-equal (check 4 rc 0). Doc 332 is written with the required content, and the ledger exists.
- §3.1–§3.3 items: typecheck, lint 171, scoped Biome, covering 6/99, scanner 50, and the code-reviewer with its Architecture note.

C1–C9 are not claimed. They are C's rows.

## code-reviewer findings and dispositions (details in `a-round-514/code-review.md`)
- Applied: R5 (Nit), which adds the "no candidate left" edge to the doc flowchart, plus a ledger row.
- Rejected: R4, which asked to change doc l.4 to "In Progress". L28 and task §2 require `Completed (C round 514 PASS)`.

## For B
- **R1 (Low, new, not pre-ruled):** stale stored element. Steps:
  1. Enter the banner from A.
  2. Tab out to B.
  3. Click empty space, so focus goes to BODY.
  4. Pointer-click Accept in Safari or iOS, which does not focus a clicked button.

  Focus then returns to the old A, which may be off-screen. The reviewer's suggested fix is a root `onBlur` that clears the ref when `relatedTarget` is outside the banner, plus a test row. I did not apply it, because the source is pinned byte-equal.
- **Spec tension, a Low, not a STOP:** the L11 "strengthen-only" clause (RETRO 510) would allow A to add rows for R2 and R3. Task §2 ("make no other edit") and the byte sha in check 4 forbid it here, so I followed the task. B may grant strengthen-only additions next time.
- **R2 (Low):** there is no row for the `header button` fallback.
- **R3 (Low):** R514-F8 does not pin `activeElement` = BODY.
- **R6 (Nit):** the R514-F9 row sits before F7 and F8 in the file.
- **Architecture note (proposal only):** keep `focusAfterCookieDismiss` local. Extract it only when the SIG-R513-COOKIE-FOCUS-GROWTH trigger fires (a second non-modal surface).

## Known gaps
- No browser verification by A, as noted above.
- Pre-ruled 2–4 limits are documented in doc 332 and not fixed.
- C-R205-02, SABA-Q-513, SABA-Q-507 and B-R512-COOKIE-PILL-LOW-SEPARATION stay open.

## Exact next C checks
Run task §4 rows C0–C9 as written:
- **C0:** 3 paths, with checks 1, 2 and 4 rc 0.
- **C1:** layout at 5 widths on a GA4-enabled copy server on `:5174`.
- **C2:** journey.
- **C3/C4:** focus rows.
- **C5:** studio and protection.
- **C6:** covering plus mutants M1–M15 on A's tree.
- **C7:** grep, scanner, lint.
- **C8:** doc 332 and the ledger (`a-round-514/doc-ledger.md`).
- **C9:** claims and L57.

Also judge R1 above in Safari/WebKit if available. It is a new Low, not a STOP.
