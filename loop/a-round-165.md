# A round 165 — ROOT-RECON-MARKER-ENTER (D-29z130)

**Status:** implementation complete; awaiting C round 165. realVerified=false for A (A runs no browser rows per task §3).

## Baseline check (task "A's first step")
- HEAD `7952439defa9…`, `git status --short` empty, `git ls-files -co --exclude-standard` = 983.
- Frozen 980 (`b-round-164-r165-tree-sha256.txt`) `sha256sum -c --quiet` OK; 3 grant start hashes OK.

## Changed files (exactly the grants + doc 134)
| Path | Change |
|---|---|
| `app/components/arrangement/ArrangementMarkerRow.tsx` | **K1**: the F2 branch of `handleFlagKeyDown` keeps `preventDefault`/`stopPropagation` and `!event.repeat`; `openEditor({kind:'rename',…})` is now wrapped in `runUnlessGesture(() => …)`. **K2** (site: `settleEditor`): directly after the `settledRef.current \|\| !editor` guard, if `reason === 'enter' && isPointerGestureActive()` → `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE); return;`, placed before `settledRef.current = true` / `setEditor(null)`. One check. Repeat-Enter is still dropped in `onKeyDown`. No new string, no markup or class change, no blur/Escape/add/duplicate change. |
| `app/lib/arrangement/__tests__/markers-ui.test.tsx` | MU15, MU16, MU17 added inside `marker row: playback continuity, gestures and typing` (between MU14 and MU12). Existing tests, including MU14, are unchanged. |
| `docs/implementation/2026/quarter-IV/133-…envelope-overview.md` | D1: line 4 only → `**სტატუსი:** Completed (C round 164 PASS; published 7952439)` (diff: 1 −, 1 +). |
| **new** `docs/implementation/2026/quarter-IV/134-studio-marker-gesture-commit-guard.md` | D2: Georgian, TEMPLATE sections; repro §0.1 steps 1–8, R1–R4, blur vs Enter, MU15–17, m182–m184 (+ m184-order), TODO `B-R164-COMMIT-DURING-PREVIEW`; status `In Progress (awaiting C round 165)`. |

## Tests actually run
- Baseline, 5 files (`a-round-165/vitest-files.txt`): **72/72** (`vitest-baseline.json`).
- **Red (test-first, baseline source):** markers-ui 22 pass / 3 fail / 25. The 3 failures are MU15 (a marker is committed), MU16 (the aria-label becomes `held`) and MU17 (the input opens). MU13/MU14 green. `vitest-red.json`.
- **After K1/K2, 5 files:** **75/75** (`vitest-after.json`).
- `npm run typecheck`: exit 0. `npm run lint`: exit 0 (218 warnings repo-wide, pre-existing). `npx biome check` on the 2 code/test files: exit 0, no diagnostics.
- `expect(` count in markers-ui.test.tsx: 183 → **216**.
- **Mutations** (`a-round-165/mutations/*.json`). Each was made with Edit and restored with Edit; after each restore, sha256 = post-edit `5dd02bdb…055b6`.
  - **m182** (K1 wrapper removed): only **MU17** red (24/25). As predicted.
  - **m183** (K2 removed): **MU15 + MU16** red; **MU13 green**, MU14 and MU17 green. As predicted, two-sided.
  - **m184** (K2 closes the editor first): **MU15 + MU16** red. B predicted MU15; MU16 also goes red because it asserts that the input stays open.
  - **m184-order** (extra, not in B's list; `settledRef = true` moved before K2): MU15 + MU16 red. It backs the doc claim that the ordering is locked.
- Not run by A (per the task): full suite, `npm run verify`, build, e2e, browser rows.

## Code-reviewer (actual subagent `code-reviewer`; score 8.5/10, no Critical)
- Confirmed: scope is limited to K1/K2, the K2 placement is correct, there is no stale closure, the MU13 blur path is unchanged, and the tests discriminate.
- **Addressed:**
  - Doc 134 wrongly credited the settledRef-ordering hazard to m184. It now credits MU15 plus the extra m184-order run.
  - Doc 134 overstated MU15's post-commit blur check. The input is already unmounted, so in jsdom `fireEvent.blur` cannot reach `onBlur`. The check follows B's spec and the MU2b pattern, and the doc now says it is not discriminating.
- **Not addressed (reported to B):**
  - (a) The path "blocked Enter → release → blur while the input is still mounted → exactly one Add Marker" works but has no test. A new MU18 is outside the MU15–17 grant.
  - (b) Residual Low, by spec: blocked Enter, then Tab/blur while the button is still held, closes the editor via MU13 and the draft is lost. It is recorded in doc 134's TODO.
  - (c) Pre-existing Low: the input's Enter handler does not check IME `isComposing`. Not a regression.
- **Architecture note (verbatim for B):**
  > Signal 4 (gesture lifecycle spread across one owner) — ArrangementMarkerRow.tsx:279-285, 291-294, 298-301, 607-611. "Is a gesture active?" is now hand-written at 4 sites with 3 subtly different behaviours (refuse; refuse-and-keep-editor; close-without-commit). Every new keyboard entry point must remember to guard — F2 was the miss this time. Keep for now: cohesive, single owner, and the blur-vs-Enter divergence is intentional. Proposal for planner (not in scope): resolve B-R164-COMMIT-DURING-PREVIEW as a single guard in ArrangementContext.commitArrangement (reject or defer commits while a gesture preview is live), which would make the per-entry-point guards defence-in-depth rather than load-bearing. Owner: ArrangementContext.tsx (protected). Acceptance: commit during gesture produces no no-op Undo entry, MU11/MU13–MU17 stay green. Value: medium. Risk: touches Undo/Redo atomicity and gesture lifecycle.

## End state
- HEAD unchanged; frozen 980 OK; protected diff vs `7952439` empty, checked for: studio.$productId, api.studio-token, account.downloads, download-routes.test, ArrangementContext, AuthContext, strings.ts, StudioWorkspace, ArrangementClip, ArrangementMarkerMenu, studio-lab, app/styles, root.tsx.
- `git diff 7952439 --name-only` lists only the 3 grants, which covers the whole protected set (StudioContext, collection.ts, Modal/Toast/CookieConsent, icons, docs 127–132 and the other Arrangement components included).
- Fresh 5-file rerun after all mutation cycles: 75/75 (`a-round-165/vitest-final.json`).
- `git status --short`: 3 × ` M` (grants) + 1 × `??` (doc 134), nothing else.
- `a-round-165/end-sha256.txt`, `a-round-165/diff-vs-start.patch` (vs `b-round-164/r165-granted-start/` + doc 134 new), `a-round-165/git-diff-7952439.patch`.
- No commit, push, stash, install, build or browser run.

## B acceptance criteria truly passed by A
- Test-first red for MU15–17: yes. 75/75 after the fix: yes. typecheck, lint and scoped biome: yes. The `expect(` count did not drop: yes.
- m182, m183 and m184 turn the predicted tests red: yes; m184 also reddens MU16.
- Code-reviewer was run: yes. Scope and protected checks: yes.
- **Not A's:** all of C's browser rows (MK-GESTURE, MK-BASELINE-CHECK, MK-ENTER-OPEN, MK-POSITIVE, MK-BLUR, G165-3, PX-NET/REG-HYD).

## Exact next C checks
1. T165-TARGETED: `npx vitest run $(cat a-round-165/vitest-files.txt)` → 75/75.
2. SOURCE-SCOPE: `sha256sum -c a-round-165/end-sha256.txt`; frozen 980; `git status --short`; protected diff.
3. AN-REVIEW: `git diff 7952439` shows only the K1/K2 hunks, MU15–17 and the line-4 change in doc 133. No markup or class change, so d6 is not needed.
4. MK-GESTURE (main row, real mouse, Shift+Tab, F2 at both viewports): F2 opens no input, the status is blocked, focus stays on the flag. After release, `Move clip` and `Intro` are kept. Ctrl+Z status sequence: `Undo: Move clip` → `Undo: Add Marker`. There is never a `Rename Marker`.
5. MK-ENTER-OPEN (synthetic pointer), MK-POSITIVE, MK-BLUR, G165-3, PX-NET/REG-HYD as in task §4.

## Scope completed
Task §1 (K1, K2, D1, D2) and §3 (A tests and commands) are complete. ROOT-RECON-MARKER-ENTER is **not** closed; it needs C's browser evidence.
