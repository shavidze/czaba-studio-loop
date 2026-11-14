# A round 501: DPG-BUTTON-CLEANUP-2 stage 2b-2 (no STOP)

**Scope:** the B sketch v4 is applied byte for byte. A wrote no code or prose beyond it. HEAD is `462570e`. The sketch sha256 is `acb11d513566038107f566557df86d92de04d66b2219c3da4c8670ee1e730c58` (`sha256sum` of the patch equals the value in `b-round-500/sketch-sha.txt`, compared directly).

## Pre-flight / primitives (an honest account)
- **Pre-flight.** I read the pre-flight skill before applying. I posted the gate in chat after the frozen checks and before `git apply`:
  - Assumptions: apply v4 byte for byte, and any difference from B's numbers is a STOP.
  - Files: the 7 grants.
  - Success: the §3 numbers.
- **Primitives read before the apply:** the first 30–60 lines only of FORWARDREF_COMPONENT, TAILWIND_FIRST, TESTING_QUALITY_GATES and GEORGIAN_DOCS. I did not open DESIGN_TOKENS or BUG_HUNTING_TESTS until after the apply.
- **Read after the apply:** the rest of DESIGN_TOKENS, and BUG_HUNTING_TESTS (structure only).
- **Why the order did not matter:** A authored no code. Every byte came from B's sketch, which tech-lead reviewed in v1–v4.
- **For B / root:** `.claude/primitives/DESIGN_TOKENS.md` is still stale. Line 9 says `brand` is `#13D9CC (Teal)`, and line 108 says "Teal + Orange". This is DPG-DOCS-UPDATE, outside A's grants, and A did not edit it.
- I read `lessons.md`, the A section.
- There are no shell edits: the source changed only through the reviewed `git apply` sketch (L60).
- **`/check`** (`.claude/commands/check.md`) asks for `npm run verify` plus `npm run test:e2e:smoke`. Under the 2026-10-21 speed rules and task §3, A ran the scoped subset only: typecheck, lint, scoped Biome and the covering tests. **verify and e2e smoke were not run by A.** They are gate rows.

## Changed files (exactly the 7 grants)
| Status | Path |
|---|---|
| M | `app/routes/free-downloads.tsx` |
| M | `app/components/home/NewsletterSection.tsx` |
| M | `app/routes/hire-us.tsx` |
| M | `app/lib/__tests__/store-theme-tokens.test.ts` |
| M | `docs/design/DESIGN_SYSTEM.md` |
| ?? | `app/lib/__tests__/store-button-cleanup-2b2.test.tsx` |
| ?? | `docs/implementation/2026/quarter-IV/322-dpg-button-cleanup-stage-2b-2.md` |

At the end of the round, after the tests and the reviewer, I ran `git status --short --untracked-files=all`. It shows these 7 and nothing else. Checks 1, 2 and 4 are rc 0 again (`a-round-501/frozen-checks-end.log`).

## Commands actually run (logs in `a-round-501/`)
| Check | Result | B expected | Log |
|---|---|---|---|
| Frozen check 1, 2, 3 (before) | rc 0, rc 0, rc 0 | rc 0 | `frozen-checks.log` |
| `git apply --check` + `git apply` | rc 0 + rc 0 | rc 0 | `frozen-checks.log` |
| Check 4, check 1, check 2 (after) | rc 0, rc 0, rc 0 | rc 0 | `frozen-checks.log` |
| `npm run typecheck` | rc 0 | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, "Found 179 warnings." | same | `lint.log` |
| `npx biome check` on the 5 code/test files | rc 0, "Found 1 warning." | same | `biome-scoped.log` |
| Covering vitest (`covering-files.txt`) | 15 files, 179/179 | 15 / 179 | `covering.log` |

- The covering run shows all 8 rows B2B2-0…B2B2-7.
- **L31 timings** (every timed row in `covering.log`, with ANSI codes stripped and sorted):
  - BC1b: 1,646 ms (33 % of the 5 s default);
  - HE5: 1,236 ms (25 %, below the 2,500 ms STOP);
  - next is B2B2-1 at 398 ms.

  `grep timeout` over the 15 covering files found no declared per-test timeout. No covering test is at or above 50 % of its timeout.
- **Not run by A** (per task §3): the full suite, the build and any browser rows. B ran the full suite and build on the sketch; the browser rows are C's.

## Code-reviewer (actual subagent, on the diff vs `462570e` plus the 2 untracked files)
**Score:** 9/10, no Critical, High or Medium findings. The reviewer checked the neighbouring scanners (focus-ring, teal-sweep, scroll-paint): none lost coverage.

**Lows, for B (none is a STOP, and A made no further edits):**
- **A-R501-CR-ST5-STRING-PIN.** ST5 now pins an exact `<Button …>` source line (`store-theme-tokens.test.ts:676-680`). A Biome reflow or a prop reorder turns it red with no visual change. Separately, the ST5 title "all nine … fills" now counts a fill that is covered only through the variant assert (wording check).
- **A-R501-CR-B2B2-6-ONE-BUTTON.** `store-button-cleanup-2b2.test.tsx:293` asserts `openingTags(…,'Button')` length 1. It will go red when NONBRAND moves "Send Download Link" in `free-downloads.tsx` onto `Button`. That stage must update this pin.
- **A-R501-CR-LUCIDE-CLASS.** The spinner assertions use the `lucide-loader-circle` class (`:252`, `:280`). A lucide upgrade that renames it turns them red.
- **A-R501-CR-FORM-METHOD.** The Form/FetcherForm mocks drop `method="post"`, so no test checks the POST wiring. That was pre-existing.
- **Pre-existing, not regressions:**
  - The e2e rapid-submit clicks hit the disabled "Subscribing..." button. HEAD behaved the same way.
  - There is no `aria-busy` or live region on the busy state.
  - Focus drops when the submit disables.
- **Re-raises of pre-ruled Lows:** all 8 were only listed, not raised.

**Architecture note (for B/root, not a refactor instruction):** "None." The diff moves three call sites onto the existing shared `Button` owner without changing it, so keep it as is. The only repeated pressure is the stage-specific source pins (ST5 string, B2B2-6 count). Look at that when 2b-3 / NONBRAND land. The reviewer's alternative idea, a `loadingLabel` prop on `Button`, changes a shared owner and would be a separate, planned task.

## B acceptance criteria (§3) that A actually passed
- [x] 1. Frozen checks 1–3, apply-check, apply, check 4 and check 1 again: all rc 0.
- [x] 2. Exactly the 7 granted files, as the sketch writes them (check 4 rc 0).
- [x] 3. typecheck, lint (179), Biome (1 warning) and covering (15/179, HE5 ≤ 2,500 ms) all equal B's expected values. The code-reviewer was run.
- [x] 4. This report, with the Architecture note.
- C1–C14 (browser, mutants, docs trace, claims, protection) are **not** claimed. They are C's rows.

## Known gaps
- A did not open a browser: there was no visual or browser verification by A.
- The full suite and build were not run by A. They are gate rows; B's pre-check is `precheck-full.log` / `precheck-build-sketch.log`.
- Doc 322 l.4 already reads `In Progress (stage 2b-2 of DPG-BUTTON-CLEANUP-2; C round 501 PASS)`, as the sketch wrote it (L28). It is a claim pending C.

## Exact next C checks
C0 → C14 as in task §4. Run them heaviest first:
1. C10 mutants on a copy outside `store/`.
2. C1–C7 with `measure-501.mjs` / `nav-501.mjs` on :5173, after a browser warm-up and with the mock API started from the loop folder.
3. Then C8, C9, C11 (full doc-ledger trace), C12, C13 and C14 (`tools/l57-check.py`).

The dev server on :5173 was not touched by A.

Stage 2b-2 is implemented and awaiting C. The backlog is not complete.
