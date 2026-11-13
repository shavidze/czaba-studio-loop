# Architecture checkpoint request for root: ARCH-CHECKPOINT-ACCOUNT-PROFILE (re-sent at round 492 planning)

**Requested by:** B, round 491 → 492 planning, 2026-11-13. First sent in `b-round-488/checkpoint-request-account.md` (D-29z1744). No root answer was found at the 489, 490, 491 or 492 plannings.
**Process:** `store/.claude/references/architecture-checkpoint.md` (read-only `frontend-architect`), bounded.
**Blocking:** no. Round 492 goes ahead with no extraction (D-29z1756).

## Why now (signals)
- `app/routes/account.tsx` `ProfileContent` + `PasswordModal` were changed in rounds 487, 488, 491 and now 492.
- Round 492 adds dialog state to `PasswordModal`:
  - `useIsPresent`;
  - an `[isPresent]` inert/focus effect;
  - a document keydown trap;
  - four `useId`s.
- It also adds a trigger ref and an idempotent close guard in `ProfileContent`.
- The modal open state is now held twice: `passwordModalOpenRef` and `isPasswordModalOpen`. That was A-R488's note, and SIG-R487-PROFILE-NAME-EDITOR-EXTRACT.
- The shared `~/components/ui/Modal.tsx` (protected) lacks initial focus, a Tab trap and focus return (shared-modal-no-focus-management). The two dialog implementations now differ.

## Question (keep vs extract; max three sentences in the answer)
1. Keep `PasswordModal` local, or extract a reusable `useModalDialogFocus(dialogRef, { isPresent, onClose, initialFocusRef })` hook that the protected shared `Modal` could later adopt (root/Saba)?
2. Keep the inline name editor in `ProfileContent`, or extract `ProfileNameEditor` / `useInlineNameEditor`, with PN1–PN10h unchanged?
3. Fold `passwordModalOpenRef` + `isPasswordModalOpen` into one source?

Value, risk and owner as in the reference. One owner: `account.tsx` plus its two test files. Behaviour-preserving tests: PN1–PN10h and PD1–PD15.
