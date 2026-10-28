# Architecture checkpoint request: dialog focus and the Studio keymap at the Calm Studio boundary (B, round 225 → 226 planning, D-29z269)

**Status:** requested from root. **Non-blocking.** Round 226 (CALM-1a) does not wait for the answer. It builds the shortcut sheet with a **local** focus pattern, copied from the Export dialog, and it does not touch `app/components/ui/Modal.tsx`.

**Reviewer:** the read-only `frontend-architect`, following `store/.claude/references/architecture-checkpoint.md`. Root invokes it and records the result. B schedules any approved change as its own bounded task, with one owner and behaviour-preserving tests.

**Why now (architecture-checkpoint signals):**
- **Feature boundary.** SABA-B-8 CALM-1…3 changes the footer, the global key handler and the dock. All three live in `StudioWorkspace.tsx` (2,675 lines at `80fbb3b`). ARCH-CHECKPOINT-SRW13 is still open.
- **Repeated region.** After round 226 there will be three hand-rolled dialog focus implementations: initial focus, a Tab trap, Escape and the return of focus to the opener.
  - `ArrangementExportDialog.tsx` (l.137–241: `focusTrapRef`, opener restore, Tab grouping);
  - `LeadMagnetPopup.tsx` (4 effects and 7 refs, gate 205);
  - the new `ArrangementShortcutSheet.tsx`.

  Meanwhile `ui/Modal.tsx` has only Escape and a backdrop click. This is signal `shared-modal-no-focus-management`, a deferred Low, and the gate-205 `useDialogFocus` proposal was never scheduled.
- **One source.** `app/lib/arrangement/shortcuts.ts` (new in round 226) lists the keys. The handler at `StudioWorkspace.tsx` l.1748–2085 binds them separately. Only tests keep the two in sync.

## Questions
Answer each with keep or extract, its value, its risk, and at most 3 sentences.
1. **`useDialogFocus`.** Should the three dialogs above share one hook (initial focus, trap, Escape, restore) now, before CALM-2/3? Or should they stay local until a fourth dialog arrives? If extract: which dialog goes first? The keep-list LeadMagnet popup must not change visibly, and LM1–LM9 must stay green unedited.
2. **Keymap.** Should the Studio global key handler move out of `StudioWorkspace.tsx` into a module that is driven by `shortcuts.ts` ids? Or is keep plus a sync test (CALM-1b) enough?
3. **Footer.** CALM-1a and CALM-2 both edit the footer, status and contextual line. Would an `ArrangementFooter` component reduce the risk of the next rounds, or is it a split by line count only?

## Acceptance for any approved extraction (B will copy it into the task)
- These run unedited and green:
  - `export-dialog-focus.test.tsx`, `export-dialog-tab-stops.test.tsx`, `export-dialog-footer.test.tsx`;
  - the LeadMagnet LM1–LM9;
  - the new SS1–SS10 (round 226);
  - the workspace keyboard suites (`grid-snap-keys`, `status-announcement-ui`, `markers-ui`, `track-group-collapse-ui`).
- `useArrangement()` keeps its shape. No edit to a frozen or protected file without a separate grant.
