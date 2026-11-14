STOP — needs B ruling on covering-test time: UT2 (`store-undefined-tokens.test.ts`) > 2,500 ms

# A round 516: NONBRAND N4 (Home). Report

## STOP measurement (L10 / L11)
- Row: `UT2: colour utilities that Tailwind does not emit exist only in the allow-listed dead, frozen or non-class files, with their exact tokens` (`app/lib/__tests__/store-undefined-tokens.test.ts`). It is a repo-wide scan, unchanged by this diff and not in the grants.
- A's times: **2,987 ms** (`a-round-516/covering.log`, raw) and **2,902 ms** (`a-round-516/covering-run2.log`, run alone).
- Declared timeout: 30,000 ms (describe-level option, l.94 of that test file).
- Gate `verify.log` (file level, all 6 UT tests): 3,170 ms and 3,205 ms (`gates/round-515/verify.log`, `gates/round-514/verify.log`). These are file totals, not per-test times.
- B's sketch log `b-round-515/sketch-covering.log`: UT2 **2,299 ms**. Top three times there: 358, 1,736 and 2,299 ms.
- Runner: 4 cores, uptime 6 min, load average 3.31 at the second run.
- **Claim mismatch (K13 / §5):** the task says the slowest covering test was 1,532 ms on the sketch. B's own log shows 2,299 ms (UT2), and no 1,532 ms entry exists.
- Per the STOP rule, I made no further changes after the checks: no doc 334, no ledger, no code-reviewer.

## Pre-flight (stated before applying)
- Assumptions: apply B's byte-pinned sketch, with no changes of my own. Copy, targets and focus behaviour stay as at HEAD.
- Smallest version: the sketch itself (about 40 changed source lines plus 1 new test). No abstractions.
- Files: SpecialOffersSection (two links), LeadMagnetPopup (Close), the 2e test (B2E-6 collision), the new n4 test, and doc 334.
- Success: frozen check 4 rc 0, typecheck rc 0, lint 171, Biome rc 0, covering 16/194, scanner 48.
- Read: `lessons.md` (the listed L-ids), the `pre-flight` skill, and FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, TAILWIND_FIRST, DESIGN_TOKENS, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS and `prompts/new-test.md`.

## Checks actually run (logs in `a-round-516/`)
| Check | Result |
|---|---|
| HEAD | `63c8894` (no drift) |
| Frozen 1 / 2 / 3 before the apply | rc 0 / 0 / 0 |
| Sketch sha (`sketch-sha.txt`) | OK |
| `git apply` sketch | applied |
| Frozen 4 / 1 / 2 after the apply | rc 0 / 0 / 0 |
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0, 171 warnings (`lint.log`) |
| `npx biome check` on the 4 code/test files | rc 0 (`biome-scoped.log`) |
| Covering run (`covering-files.txt`) | 16 files / 194 tests passed, twice. N4-1, N4-2, N4-3 ×3 (offer, email, success) and B2E-6 are present. **UT2 is over 2,500 ms (STOP)** |
| Scanner `scan-nonbrand-motion.py` | 48 hits, 0 SpecialOffers (`scanner.json`) |

## Changed paths (4, not 5)
- `M app/components/home/SpecialOffersSection.tsx` (sketch)
- `M app/components/marketing/LeadMagnetPopup.tsx` (sketch)
- `M app/lib/__tests__/store-button-cleanup-2e.test.tsx` (sketch, B2E-6)
- `?? app/lib/__tests__/store-button-cleanup-n4.test.tsx` (sketch)
- **Not written:** `docs/implementation/2026/quarter-IV/334-dpg-nonbrand-stage-n4-home.md` and `a-round-516/doc-ledger.md`. Both are held by the STOP.

## Not done
- Doc 334, the doc ledger and the code-reviewer subagent (step 5) were not run because of the STOP. The diff is byte-equal to B's sketch, which `tech-lead` reviewed at planning; that review is not a substitute for A's step.
- No browser rows (they belong to C).
- **B acceptance criteria passed by A:** §3 steps 1–3 except the covering-time bound. Steps 4–6 are open.

## For B
1. Rule on UT2's time. Options: a measured per-test bound for this repo-scan row (A: about 2.9 s; gate file totals about 3.2 s; timeout 30 s), or exempt it by name from the 2,500 ms clause. Then re-dispatch with only doc 334, the ledger and the code-reviewer left. The applied sketch stays in the tree.
2. Correct the §5 / K13 "slowest 1,532 ms" figure: B's log shows 2,299 ms.
3. Primitive staleness (observation only): `.claude/primitives/DESIGN_TOKENS.md` in this tree still says brand `#13D9CC` (Teal) and Playfair/Inter. The policy notes say root updated it on 2026-11-14, but this tree does not show that update yet.

## Known gaps
- The round is not complete. Do not treat its scope as done.

## Next C checks
- None until B rules. After the re-dispatch, run §4 C0–C9 as written.
