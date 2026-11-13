# Sketch review, round 488 (B planning 2026-11-13)

Dispatched sketch: `b-round-487/sketch-488.patch.txt` **v3**, sha256 `9062855b25c50874a3f5b06fd0fe96432006828d000bbd77597c922213dd1b1d` (pinned in `sketch-488.sha256`; applied files in `sketch-488/`).

## Review 1: tech-lead on v1 (`sketch-488-v1.patch.txt`, sha in `sketch-488-v1.sha256`)
**Verdict: APPROVE WITH CHANGES.**
- **Medium:** in Safari and Firefox-mac a mouse click does not focus a button, so after a click on "Click to change password" `activeElement` stays `<body>`. The v1 guard treats `<body>` as unclaimed and the settle still pulls focus behind the open PasswordModal. Fix: a ref set synchronously when the modal opens and cleared when it closes (not the state, which a running `handleNameSave` would read stale).
  - **B ruling: accepted → v2.** `passwordModalOpenRef`, `openPasswordModal`/`closePasswordModal`, guard returns false first while the ref is true. Tests PN10f/PN10g (unfocused click opens the dialog during a save; success/failure) and PN10h (after Cancel a later save restores focus). Browser emulation of the Safari mouse model (`element.click()` without focus) added as scenario `click-password-nofocus` (`probe/inflight-488-v2.mjs`): round-487 tree → name button / First name (bug, `probe/r487tree-v2-inflight.json`); v2 → focus unchanged (`probe/sketch-v2-inflight.json`).
- **Low:** a click on non-focusable page text during a save also leaves `<body>` and gets the restore. **B: accepted as designed (task §4).**
- **Low:** failure while in Last name focuses First name (pre-existing contract). **B: unchanged.**
- Checked fine: no stale closure; flag computed before `setIsEditingName(false)` is correct; unmount during a save safe; StrictMode safe. `void handleNameSave()` approved.

## Review 2: tech-lead delta on v2 (`sketch-488-v2.patch.txt`)
**Verdict: APPROVE.** The ref stays in sync: every close path (submit success, backdrop, Cancel) goes through `onClose`; the ref clears before the AnimatePresence exit, which is correct.
- **Low 1:** PasswordModal has no `role="dialog"`, no initial focus, no trap, no focus return. Pre-existing. **B:** B probed it (`probe/overlays-sketch.json` `password-modal-keys`: no dialog role, Esc does not close it, Tab from the link enters the first input by DOM order) → recorded as **Medium B-R488-PASSWORD-MODAL-DIALOG**, scheduled after round 490 (not this round; L10).
- **Low 2:** dialog closed before the save settles with focus on `<body>` → name button gets focus; acceptable, no test. **B: accepted; deferred Low test gap A-R488-SKETCH-L2-CLOSED-DIALOG-TEST.**
- **Low 3:** PN10f/PN10g only assert `not.toBe`. **B: accepted → v3** adds `expect(document.activeElement).toBe(document.body)` to both (jsdom; the modal does not take focus). v3 differs from v2 only by those two lines; no re-review needed for a test-only tightening that the reviewer asked for.

## B's own check (advisor point): other overlays
`probe/overlays-488.mjs` on v3 (`probe/overlays-sketch.json`), unfocused click on each header button during a mouse ✓ save:
- Search (⌘K): the palette focuses its own input; settle does not move it. OK.
- User menu / Toggle menu (non-modal): focus ends on the name button (Safari model only; in Chromium the click focuses the button and the guard holds). Recorded as **Low B-R488-SAFARI-MENU-SETTLE-FOCUS** (`deferred_low_polish`, added to SAFARI-CHECKS).

## Mutants and suites (v3)
- Mutants: `mutants/mutants-summary.txt` (24: M0 HEAD, M00 round-487 file, M000 v1 file, M1–M21). Red-row regex widened to `PN\d+[a-z]?` after the v2 run (`mutants-v2-badregex/` is kept but is not evidence).
- Covering: `sketch-488-covering.log` (5 files, 82 tests). tsc: `sketch-tsc.log` rc 0. Biome: `sketch-488-biome.log` (4 pre-existing warnings). Full suite: `precheck-full-488.log`.
