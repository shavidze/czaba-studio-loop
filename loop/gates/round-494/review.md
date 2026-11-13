COMMIT: OK

C verified the round and `verify.log` passed. I read the diff and the files in full, so this review covers the diff only. I didn't run the code in a browser. I found nothing that blocks the commit.

**Scope checks**
- **Auth, purchase and download code:** none touched. The change is in `app/routes/account.tsx` (`PasswordModal` and the trigger button), two tests and docs. `updatePassword` in `app/lib/auth.ts` is unchanged.
- **TypeScript strict:** no `any`, no `@ts-ignore`, no `as` assertions. The `el is HTMLInputElement | HTMLButtonElement` filter is a type guard, not an assertion.
- **Tailwind and tokens:** no new classes or colors. The only styling-related change is `data-testid` and ARIA attributes.
- **Listener and timer leaks:** the `keydown` listener is added to `document` only while `isPresent` is true. Its cleanup runs on exit and on unmount, and there are no timers. Because `closePasswordModal` is recreated on every render, the listener is removed and re-added each time `ProfileContent` re-renders. That costs almost nothing.

**Findings, ranked** (no fix is required before commit)

1. **Low – `app/routes/account.tsx:353-391`.** The Escape handler is on `document`, so any open overlay above or beside the dialog also receives that Esc. Doc 318 already notes that Ctrl+K opens the CommandPalette and a single Esc closes both. A full fix would need a shared overlay stack. For now, either keep the existing TODO `TL-R492-L4-CTRLK-OVER-DIALOG`, or check `e.defaultPrevented` first and have the other overlays call `preventDefault`.
2. **Low – `account.tsx:344-351`.** `inert` is set imperatively through a ref. It is correct and the tests cover it (PD10 and PD14). Browser support for `inert` is not a concern for current browsers. The visible fading dialog still covers the page while `inert`, which is intended.
3. **Low – `account.tsx:297-299`.** The `type="button"` on the trigger has no test and no mutant, as doc 318 admits. It is harmless, but it could regress unnoticed.
4. **Low – `app/lib/__tests__/account-password-dialog.test.tsx:218-219, 239-240, 251-252, 261-262`.** There is no blank line between some `it` blocks, unlike the rest of the file. Biome lint passed. If `npm run check` reformats the file, run it before the commit.
5. **Info – a11y and focus.**
   - Focusing Current Password on open will bring up the on-screen keyboard on iOS and Android. That follows the WAI-ARIA dialog pattern.
   - The page behind the dialog is not `inert` and scroll is not locked. This is a documented decision from round 492.
   - The backdrop is 40 px shorter than the viewport (`B-R492-PASSWORD-BACKDROP-SHORT`), already tracked as deferred Low.
   - Focus order, Esc, Tab wrap, IME composition and the reopen-during-fade case are handled and tested (PD4–PD15).

**Existing flows**
- **`closePasswordModal` is now idempotent:** a late update that finishes after Esc will not steal focus (PD7).
- **`passwordModalOpenRef` still guards the name-save focus logic.** The updated PN10f and PN10g assertions match the new focus-on-open behavior, and doc 315 explains why the ref stays.
- **Submit path unchanged:** validation and the `onSubmit` → toast → `onClose` sequence are as before.

**Architecture note**
- Signal 4 (new state or lifecycle in an existing owner), at `account.tsx:326-391`. `PasswordModal` now holds its own focus, inert and key-trap lifecycle inside a route file that also holds `ProfileContent` and the name-editor focus logic.
- Keep it for now. Both focus mechanisms share `passwordModalOpenRef` and the same trigger and focus invariants, the 15 + 14 tests pass against the current shape, and nothing here hurts change cost yet. Doc 318 already defers the name-editor extraction (`ARCH-CHECKPOINT-ACCOUNT-PROFILE`) pending a root decision.
- Proposal for the planner (not a fix for this round): one bounded task to move `PasswordModal` into `app/components/account/PasswordDialog.tsx`. `passwordModalOpenRef` and `closePasswordModal` would stay in the parent, and the existing PD1–PD15 and PN tests must pass unchanged. It could be done together with the shared `Modal` focus-management task (`shared-modal-no-focus-management`).