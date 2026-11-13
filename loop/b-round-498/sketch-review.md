# tech-lead sketch review, stage 2b-1 (B, round 498 -> 499 planning, 2026-11-13)

Real subagent run (read-only) on `sketch-499.patch.txt` v1 (sha 81cc7bfe…). **Verdict: APPROVE-WITH-CHANGES.**

1. **Medium: doc 321 skeleton** has empty sections and its status line says "C round 499 PASS" before C ran. Proposed: fill the prose in the sketch and use a plain "In Progress" status.
   - **B ruling (D-29z1789):** prose stays A's job (same as rounds 496 and 498, `.claude/rules/implementation-docs.md` applies to A's hand-off, and C11 checks it). The status line keeps the **L28** post-PASS form `In Progress (stage 2b-1 of DPG-BUTTON-CLEANUP-2; C round 499 PASS)`: L28 makes it final when A writes it, and nothing reaches HEAD without C PASS. Round 498 left that form out and C flagged it (A-R498 For B #1); doc 320 l.4 is fixed in this sketch. The deviations the reviewer listed are now mandatory content for A's prose (task §3.2).
2. **Low: EmptyState imports `./Button` directly.** Correct (a barrel import inside `ui/` would cycle through `index.ts`). No change.
3. **Low: test uses global `JSX.Element`.** Applied in v2: `import type { ReactElement } from 'react'`.
4. **Info:** `type="button"` changes nothing today (all callers use hrefs, no form ancestor); ErrorDisplay Try Again has no form ancestor; no disabled/loading/ref use; "neither the old markup nor Button has a focus-visible ring" (B note: the ring comes from the global `:focus-visible` rule; B measured it on every target, `measure/summary.txt`, 1 px solid, offset 2 px).
5. **Info:** the hydrationData approach is valid; DOMParser drops nested `<html>`, the button and anchor survive; exact-count asserts are not vacuous; console.error spy restored. A `cn('bg-brand…')` regression would pass B2B-5 but fail the DOM rows.
6. **Info:** `react-router-dom` is transitive (pre-existing, other tests rely on it).

History: v0 `2801a2cd…` (store anchor after the `<p>`; mutant N8 survived) -> v1 `81cc7bfe…` (B2B-5 store anchor `{error ? (`; reviewed here) -> v2 = v1 + the item-3 change (test file only). v2 sha in `sketch-sha.txt`. The build ran on v1 (`precheck-build-sketch.log`); v2 changes only a test file, which is not in the build.

## v2 delta review (tech-lead, real subagent run)
- Reviewed patch: `sketch-499.patch.txt` v2, sha256 `9fceab802652468b4545d450f3cf25cada33ab428d3e39e01e58579cee414daf`.
- **Verdict: APPROVE.** The test file now imports `ReactElement` and no `JSX.` use remains. The other hunks are as approved in v1. The reviewer had no v1 copy to byte-diff, so the delta claim rests on their reading. All 7 files in the applied tree match `r499-post-sketch-sha.txt`.
- Item-1 ruling accepted, not a remaining Medium: L28's post-PASS form stands, and nothing reaches HEAD without C PASS. A must still fill doc 321's sections, including the listed deviations. Task §3.2 makes that mandatory.
