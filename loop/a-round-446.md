# A round 446 — STORE-2b-1 LeadMagnet route exclusion

No STOP. Sketch applied unchanged; doc 291 written. No browser check was run by A (C1–C14 are C's rows, unverified by A).

## Changed files (git status = exactly the 5 granted paths, `b-round-445/grants-446.txt`)
- M `app/components/marketing/LeadMagnetPopup.tsx` (sketch)
- M `app/hooks/useLeadMagnet.ts` (sketch)
- M `app/hooks/useScrollLock.ts` (sketch)
- ?? `app/lib/__tests__/store-lead-magnet-routes.test.tsx` (sketch)
- ?? `docs/implementation/2026/quarter-IV/291-store-2b-1-leadmagnet-route-exclusion.md` (A)
No protected file touched (`root.tsx`, `AuthModal.tsx`, `ui/Modal.tsx`, studio/auth/download routes unchanged).

## Steps and checks actually run
| Step | Result | Evidence |
|---|---|---|
| 1 claims before edit | K1–K27 identical to `claims-446-planning-output.txt` (diff empty) | `a-round-446/claims-before.txt` |
| 2 patch | sha256 685089e3… = `sketch-446.sha256`; `git apply --check` + apply rc 0; no hand edits | — |
| A1 byte identity | 4/4 `cmp` equal to `b-round-445/sketch-files/` (re-checked after doc) | — |
| A2 covering | 4 files, 100 tests passed (routes 34, dialog 18, …), same counts as `covering-sketch.log` | `a-round-446/covering.log` rc 0 |
| A3 typecheck | rc 0 | `a-round-446/typecheck.log` |
| A3 lint | rc 0, 205 warnings + 1 info (= `lint-sketch.log`) | `a-round-446/lint.log` |
| A3 Biome scoped (4 sketch paths) | rc 0, 4 files, no fixes | `a-round-446/biome-scoped.log` |
| A4 claims after | only K17 differs (l4 now the Completed line) | `a-round-446/claims-after.txt`, `claims-diff.txt` |
| Doc self-check | l.4 byte-exact `**სტატუსი:** Completed (C round 446 PASS)`; 7 TEMPLATE headings in order; 14 mutant ids; "pending" count 0; cited test ids LMR1–LMR13, SL1–SL2, LM8 exist | — |
| build | `npm run build` rc 0 | `a-round-446/build.log` |
| code-reviewer (real subagent; it had no shell, so it read the current files rather than `git diff`) | 8.5/10, no Critical/High/Medium | below |

Doc 291 l.4 is a claim until C PASS. Mutant results and the 206-vs-0 Back measurement in the doc are attributed to B (sketch / interim sketch), not A.

## code-reviewer findings (all Low) and disposition
Sketch files and `store-lead-magnet-dialog.test.tsx` are not editable this round (no hand edits to sketch; dialog test not granted) → all go to B as proposals:
1. **A-R446-REVIEW-L1 stale submit error:** a `submitEmail` failure that resolves after a route hide re-sets `error` (useLeadMagnet.ts ~l.233), visible on the next allowed-page open. Rare (Back mid-submit). Fix idea: request id / excluded ref before `setError`. Related to TL-R446-L3-LOCAL-STATE. B should rule whether user-visible change 3 ("the last submit error is cleared") covers an in-flight submit. Not a STOP: LMR12 green, sketch files not editable.
2. **Dialog mock lacks `isRouteExcluded`** (`store-lead-magnet-dialog.test.tsx:35-40`); works via `!undefined`. Already known to B (task K11 'Callers swept'), not new; optional hardening `isRouteExcluded: false`.
3. **A-R446-REVIEW-L3 test hygiene** in routes test: `scrollHeight`/`innerHeight` overrides not restored (l.82-88); `storedState()` unvalidated `JSON.parse` (l.112-115); SL2 does not assert the lock was applied before unlock (l.337-346).
4. Doc cites loop artifacts outside the repo (informational; required by task).
5. Pre-existing (not this change): `useScrollLock` cleanup clears `top` before the else-branch, making that branch's restore effectively dead.

**Architecture note (proposal for B/root, not acted on):** route-driven state added to `useLeadMagnet`; reviewer says keep. Only if more route rules arrive, a bounded task to move the exclusion list into a shared route-policy module.

## Process notes (truthful)
- Read: `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`, lessons A section (L11–L15, L26, L28), `b-round-445/sketch-review.md` (M1/M2/L3/L4, to match doc wording).
- The four code files are B's patch applied unchanged; A hand-authored only doc 291.
- `pre-flight` skill was opened after the patch was applied, not before (the patch was dictated by B, so no code was designed by A). Gate in hindsight: assumptions = task §1 rulings; files = the 5 grants; success = A1–A4.
- `/check` (`.claude/commands/check.md`) asks for `npm run verify` + `npm run test:e2e:smoke`; per the 2026-10-21 speed rules A did NOT run those (gate rows). Run instead: scoped Biome, lint, typecheck, covering tests, build.

## B acceptance (A steps) marked passed
Steps 1, 2, 3 (doc), A1, A2, A3, A4, code-reviewer, step 5 git status. Not claimed: any C row (C1–C14), gate rows.

## Known gaps
- No browser verification by A. The Low findings above stay open.
- Task-carried signals unchanged: SIG-R446-LEADMAGNET-CAP-COMMENT, SABA-Q-LEADMAGNET-NAV-RULES, SABA-Q-LEADMAGNET-RECORDINGS-SCENES, TL-R446-L1-POP-RESTORE-LOST, TL-R446-L3-LOCAL-STATE.

## Next C checks
C1–C14 per `current-task.md` §3 (mock API on :5199, HEAD control on :5178 via `sketch-server.sh ... none`); test server already on :5173. Suggested extra probe: finding 1 above (Back during a failing submit, then reopen on `/`).
