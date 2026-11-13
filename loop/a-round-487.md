# A round 487: B-R486-PROFILE-NAME-KEYBOARD

**STOP — needs B ruling on A-R487-REVIEW-FOCUS-STEAL (Medium, reproduced in the browser, not ruled by §4/§5).** Per §2 STOP threshold and L11, the tree is left at the byte-equal sketch state. The reviewer's proposed fix is NOT applied.

**Also STOP — task clause conflict (L11):** §1 and the C-APPLY row let A change a sketch line to fix an unruled reviewer Medium+, while §2 says STOP on the same trigger and calls itself the only statement of it. A followed §2. B should make the two clauses agree.

## A-R487-REVIEW-FOCUS-STEAL (Medium, origin: A code-reviewer; caused by this round's sketch)
- Code: `app/routes/account.tsx` effect on `isEditingName` (~l.130-139, success restore via `restoreNameFocusRef`) and the failure path `nameInputRef.current?.focus()` (~l.173) move focus unconditionally when the save settles. "Click to change password" (l.266) stays enabled during a save.
- Repro: `a-round-487/repro/focus-steal.mjs` (Playwright Chromium, signed-in stub, PUT delayed 1500 ms) → `a-round-487/repro/focus-steal.json`. Steps: open the editor, click ✓ (Save name), click "Click to change password" inside the delay (PasswordModal opens), wait for the save to settle.
- Result at 1440×900 and 1280×720: the modal is open before and after. Final `activeElement`:
  - PUT 200: the name button "Probe User", behind the open modal;
  - PUT 500: the First name input, behind the open modal.
  - 1 PUT each run.
- `git show bb82154:app/routes/account.tsx | grep -n '\.focus('` → one hit (l.127, First name on open). HEAD had no focus call on save settle; B's `probe/head-named.json` records `BODY` after save (`afterSaveEnter`/`afterMouseSave`, task §0). So the move on settle is new in this round. The repro was not run on HEAD (a second server is not allowed). (In both cases the PasswordModal does not move focus into itself when it opens; focus stays on the link. That part is pre-existing and out of scope.)
- First run: a 20 s `waitFor` timeout on cold `/account`; cause not established. One replacement run after a warm-up (L38). The repro used fresh contexts and kept no browser state file.
- Reviewer's proposal, for B (not applied): wrap the editor row in a ref, and at both focus points move focus only if `document.activeElement` is null, `body`, or inside the editor row. That keeps the accepted BODY-drop case (disabled ✓). Add unit row: deferred save, focus another control, resolve/reject, assert focus unchanged. B should also decide whether the deferred-focus check applies to Esc-in-flight → settle (PN9).

## Start state and apply
- Start HEAD `bb82154`, clean tree (attempt 1 checkpoint `a-round-487/checkpoint.md`).
- `git apply b-round-486/sketch-487.patch.txt`: rc 0 (attempt 1).
- `cmp` against `b-round-486/sketch-487/`: `app/routes/account.tsx` equal, `app/lib/__tests__/account-profile-name.test.tsx` equal (re-checked in attempt 2). No sketch line was changed.
- Doc `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md` written: l.4 `**სტატუსი:** Completed (C round 487 PASS)`; the 7 TEMPLATE headings in order; APG Button and WCAG 2.5.3; the focus-target table; full-width reason; `active:transform-none!` / no `select-text`; §4 rulings; TODOs for SIG-R487-REPEAT-SAFE-HOME and B-R487-PROFILE-EDITOR-NARROW-OVERFLOW. Cites only PN1, PN1b, PN2–PN9 and §3 C rows. If B rules a fix-up, the doc needs the new focus rule added.

## Checks (all run in attempt 1 on the current byte-equal tree; logs in `a-round-487/`)
- `npm run typecheck`: rc 0 (`typecheck.log`).
- `npm run lint`: rc 0, 187 warnings / 1 info repo-wide (`lint.log`).
- `npx biome check 'app/routes/account.tsx' 'app/lib/__tests__/account-profile-name.test.tsx'`: rc 0, **4 warnings**, as expected: 3 × `noLabelWithoutControl` (l.362/382/403, PasswordModal) and 1 × `useButtonType` (l.266, password link) (`biome.log`).
- `npx vitest run` on the 5 covering files: **5 files, 74 tests passed**, rc 0 (`covering.log`).
- Full suite: not run (speed rule; the gate runs it).
- Code-reviewer: run in attempt 2 (the attempt-1 result was lost when the session hit an API error). Score 8/10. Findings:
  - **Medium:** focus steal, above → STOP.
  - **Low:** no unit test for a save started by clicking ✓ (browser rows cover it).
  - **Low:** `handleNameSave();` in the keydown handler is unawaited; `void` would be explicit.
  - **Low:** PN8 asserts only `defaultPrevented` (jsdom does not synthesise a click from Enter); the behaviour is covered by PN-HELD-FAST-STUBBED.
  - **Low:** no unmount-during-save regression test (no bug found).
  - None of these was acted on.
  - **Architecture note (signal 4, new state/lifecycle in an existing owner, `account.tsx` ~l.113-189):** keep it now. If more editor behaviour is added (the narrow-overflow fix, `aria-disabled` ✓), consider one bounded task to extract a local `ProfileNameEditor` in the same file with PN1–PN9 unchanged. This is a proposal for B/root.

## Changed files (working tree vs bb82154)
- `app/routes/account.tsx` (M, sketch)
- `app/lib/__tests__/account-profile-name.test.tsx` (new, sketch)
- `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md` (new)
- Loop folder only: `a-round-487/repro/focus-steal.mjs`, `focus-steal.json`.

## Acceptance (A's part only)
- C-APPLY precondition: both files byte-equal (passed).
- Typecheck, lint, scoped Biome (4 expected warnings), covering vitest 74/74, HS1 `held-enter-source-scan.test.ts` 2 tests ✓ in `covering.log`: passed.
- Code-reviewer: run; its Medium is unresolved → STOP.
- No browser C rows are claimed.

## Next C checks (if B dispatches C as-is, or after a fix-up)
- C-SCOPE, C-APPLY, then the §3 rows. Also replay `a-round-487/repro/focus-steal.mjs`: today it shows the focus steal. After a fix, the final focus should stay on the user's chosen control/modal.

## Known gaps
- Unresolved Medium above. Backend row OWN-BACKEND BLOCKED (cloud). 375 overflow is pre-existing (round 489).

## Final tree check (attempt 2, end)
- `git status --short`: ` M app/routes/account.tsx`, `?? app/lib/__tests__/account-profile-name.test.tsx`, `?? docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`. Both sketch files `cmp`-equal.
- Scope: the round is NOT complete; it awaits B's ruling.
