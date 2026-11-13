# A round 488 — B-R486-PROFILE-NAME-KEYBOARD fix-up (C-R487-01)

**Status:** implementation complete; handed to C. Not self-marked done.

## Start
- HEAD `bb82154`; `git status`: ` M app/routes/account.tsx`, `?? app/lib/__tests__/account-profile-name.test.tsx`, `?? docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md` (the round-487 tree).
- Start check: `claims-488.sh` output **equal** to `b-round-487/claims-488-planning-output.txt` (`a-round-488/claims-start.txt`, diff empty, rc 0).

## Apply
- Patch sha256 `9062855b…1b1d` = `b-round-487/sketch-488.sha256`.
- `git apply ../tmp/studio-real-loop/b-round-487/sketch-488.patch.txt`: no output, rc 0.
- `cmp` against `b-round-487/sketch-488/app/...`: both files byte-equal. K12 `sketch-files-equal-store 2 of 2`.
- I changed no sketch line.

## Pre-flight and lessons
- I did not run the formal pre-flight skill. The code is B's frozen sketch, applied byte-equal; my only authored edits are in doc 315. I read `GEORGIAN_DOCS.md` before writing the doc.
- Lessons checked: `lessons.md` "Before handing over" (L11–L15, L26, L28, L60) and C's L22, L57 and L58.
  - L11: no STOP condition hit, and no covering test is slow (the slowest file took 921 ms).
  - L26: doc headings contain TEMPLATE's 7 `## ` headings in order, and every PN id the doc cites exists in the test file (grep checked).
  - L28: l.4 is final.
- **L60 deviation, disclosed:** I made the first doc-315 edits with a `python3 -I` string-replace script (each replacement asserted unique) instead of the editor tools. I made later corrections with the editor tool. The result is in the file; no code file was touched this way.

## Doc 315 (granted)
- l.4 = `**სტატუსი:** Completed (C round 488 PASS)` (K9).
- Added focus-table rows for a ✓ save with focus on body, and for a save that settles after focus moved or the dialog opened. Added the guard rule with the reason for the ref (Safari/Firefox-mac mouse model, stale closure).
- Added the C-R487-01 Problem → Solution entry, PN10–PN10h test lines, the round-488 run line and the C round-488 row list, plus TODOs for B-R488-PASSWORD-MODAL-DIALOG and B-R488-SAFARI-MENU-SETTLE-FOCUS. After the advisor's check I moved PN10h out of the "focus is not moved" row into the successful-save row, because PN10h proves that focus *does* return after the dialog is cancelled. I also extended the changed-files line for the test file to list PN10–PN10h. The rest is unchanged.

## Checks A ran (logs in `a-round-488/`)
- `npm run typecheck`: rc 0 (`typecheck.log`).
- `npm run lint`: rc 0 (`lint.log`). Biome prints "Found 187 warnings, 1 info" repository-wide. I have no baseline count for this tree, so I make no claim that the repo-wide count is unchanged; the scoped count is below.
- `npx biome check app/routes/account.tsx app/lib/__tests__/account-profile-name.test.tsx`: rc 0 with 4 warnings, as expected. They are 3 × `noLabelWithoutControl` (l.387/407/428, PasswordModal) and 1 × `useButtonType` (l.291, password link), all pre-existing [K8] (`biome.log`).
- Covering vitest (5 files): **5 files, 82 tests passed**, equal to B's sketch run (`covering.log`). The full suite was not run (the gate runs it).
- End claims (`a-round-488/claims-end.txt`, rc 0), checked against the C rule:
  - K1–K4 equal the planning output: a direct diff of the K1–K4 lines against `claims-488-planning-output.txt` is empty.
  - K5 shows `differs` for the 2 code files plus doc 315.
  - K9 shows the new l.4.
  - K12 is `2 of 2`.
  - K6–K8, K10, K11 and K13–K17 equal the sketch output (diff limited to K1–K5 and K9).
- `git status` at end: the same 3 paths (` M account.tsx`, `?? test`, `?? doc 315`) (`a-round-488/git-status-end.txt`).
- No browser run by A. The rows in task §3 are C's.

## Code-reviewer pass 1 (code-reviewer subagent, read-only; score 8.5/10; covered `account.tsx` and the test file)
The reviewer's own limits: it had no shell, so it did not run `git diff` or the tests. It read the working-tree files, and its "would fail on old code" verdicts are inferred, not observed.
No Critical, High or Medium findings, so no STOP and no sketch line was changed. The reviewer confirmed:
- every modal close path (submit success, backdrop, Cancel) goes through `closePasswordModal`;
- the guard is read when the save settles;
- `RequireAuth` does not unmount `ProfileContent` during a save (it keys on `isInitializing`).

Its Lows, for B (none applied, because sketch lines are frozen):
- **L1, exit-animation window.** `closePasswordModal` clears the ref immediately. If the save settles while the modal is still fading out (AnimatePresence) and Chrome has focus on the modal's Cancel button, focus is neither restored nor on body. The window is a few hundred ms. Suggested home: B-R488-PASSWORD-MODAL-DIALOG (with focus return on close).
- **L2.** The ✓ button uses `onClick={handleNameSave}` while keydown uses `void handleNameSave()`. Suggestion: `onClick={() => void handleNameSave()}`.
- **L3, close-path test gap.** Only the Cancel close is tested (PN10h). Backdrop, submit-success and close-while-pending have no test (relates to A-R488-SKETCH-L2-CLOSED-DIALOG-TEST).
- **L4, PN10e.** The reviewer suspected PN10e might pass through unmount after navigation rather than through the guard. **I checked this against B's mutant evidence:** `mutants/mutants-summary.txt` shows PN10e red on M00 (the round-487 file) and on M14-SUCCESS-GUARD-OFF, so PN10e does exercise the guard. The suspicion is not confirmed. This rests on B's mutant run on B's scratch; I did not run the mutants myself.
- **L5.** Redundant `not.toBe(nameButton())` lines in PN10f/g, which are covered by the `toBe(document.body)` lines next to them. PN8 sits after PN10h in the file.
- PN10c and PN10d probably also pass on the old code. They pin the body branch; this is accepted per §4.

**Architecture note (proposal for B and root, not acted on):**
- The modal state is now held twice (`passwordModalOpenRef` + `isPasswordModalOpen`), with 3 focus refs in `ProfileContent`. The reviewer's advice is to keep it for now and fold the de-duplication and the modal's focus return into B-R488-PASSWORD-MODAL-DIALOG.
- Separately, `account.tsx` imports `preventRepeatedEnterKeyDown` from `~/components/arrangement/studio-repeat-safe`. This is already tracked as SIG-R487-REPEAT-SAFE-HOME.

## Code-reviewer pass 2 (doc 315 against the code; read-only, no shell; score 9/10)
Found no High or Medium issues; all §2 doc items are present and accurate.
- **Low 1 (fixed):** l.22 said `restoreNameFocusRef` is set on every successful save. I added "since round 488 only while the editor still owns focus". The edit was made after the review and was not re-reviewed; it is doc-only.
- **Low 2 (open):** PN2 and PN3 are cited for keyboard open and close, but they only exercise the click path. The keyboard path comes from PN-KEYS-STUBBED. This is round-487 text, left unchanged.
- **Low 3 (same as pass-1 L4):** the PN10e unmount suspicion. B's mutants M00 and M14 show PN10e red, so it does exercise the guard.
- Architecture note: none.

So all 3 changed files have been reviewed (pass 1: code and test; pass 2: doc).

## Acceptance (A's part only)
- Passed by A: start check equal; `git apply` rc 0; K12 `2 of 2`; typecheck and lint rc 0; scoped Biome with the 4 expected warnings; covering 82/82; code-reviewer run with no Medium+; doc 315 granted edits.
- Not A's to claim: every C browser row (IF-*, PN-REG, PN-UNIT mutants, DOC, G488-AUTH), OWN-BACKEND (BLOCKED, backend unavailable in cloud) and the gate.

## Known gaps
- Reviewer Lows L1–L3 and L5 above are unfixed (frozen sketch).
- Doc 315's older TODO still says the narrow-overflow fix is "round 489"; per D-29z1740 it is now round 490. The grant said "all other content stays", so I left it.
- IF-PASSWORD-NOFOCUS is a Chromium emulation; real Safari/Firefox-mac is in SAFARI-CHECKS/FIREFOX-CHECKS.

## Next C checks (exact)
1. `bash b-round-487/claims-488.sh` at start and end, with the comparison rule from "Read first".
2. Warm `/account`, then `node b-round-487/probe/inflight-488-v2.mjs http://127.0.0.1:5173 <out>` at both viewports. Covers IF-PASSWORD, IF-PASSWORD-NOFOCUS, IF-TABAWAY, IF-STAY and IF-LEAVE.
3. `node b-round-487/probe/overlays-488.mjs` (IF-OVERLAYS) and `c-round-487/focus-steal-replay.mjs` (IF-REPLAY).
4. PN-REG probes from `tasks/round-487.md` §3.
5. `python3 -I b-round-487/mutants-488.py <outdir> <scratch>` (never from `store/`).
6. DOC l.4 byte check; G488-AUTH.
