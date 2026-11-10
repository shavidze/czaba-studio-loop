**COMMIT: OK**

I read the diff, the two test files, the doc and the shared helper. I did not run anything; the PASS for C and `verify` is taken from your note. I did not open `verify.log`.

## Findings

**Critical:** none.

**Checked and clean:**
- **Auth, purchase, download:** none touched. All edits are in `app/components/arrangement/*`, `app/lib/arrangement/__tests__/*` and one doc.
- **Event ordering:**
  - Every new guard is `onKeyDown={preventRepeatedEnterKeyDown}`. The helper (`studio-repeat-safe.ts:3-9`) calls `preventDefault` only when `key === 'Enter' && repeat`.
  - A fresh Enter, Space and mouse click are untouched.
  - In `ArrangementDetailPanel.tsx:1234-1246` the guard is the first statement of `handleToggleKeyDown`. The Space branch is unchanged, so Space-repeat is still ignored there. HP6 covers this.
  - Unlike the old `preventRepeatedLibraryEnter`, the helper does not call `stopPropagation`. The window keydown handler in `StudioWorkspace` therefore still sees the event. The docs describe the same behavior and HM5b exercises it, so I did not trace the handler itself.
- **Listener and timer leaks:** none added. There are no new effects, refs, timers or listeners.
- **Render cost:**
  - The helper is a module-level function with a stable identity, which is slightly better than the old per-render inline closures.
  - The private `preventRepeatedLibraryEnter` was removed.
  - In `ArrangementLibraryPreview.tsx` the `onKeyDown` stays before the `{...softDisabledButtonProps}` spread. Per the doc, that spread cannot carry `onKeyDown`, so the guard is not overridden.
- **TypeScript, Tailwind, accessibility:** no `any`, suppressions or assertions in the diff. Class names, labels and `aria-*` attributes are unchanged. The repeat-prevention now covers more buttons, and the focus ring is unchanged.

**Suggestions (non-blocking):**
1. `mixer-held-enter-ui.test.tsx:260` (HM5b) is a characterization row that is already green on HEAD, so it cannot catch a regression in this diff. Its title is also very long. Fix: keep it, but shorten the title.
2. `panel-held-enter-ui.test.tsx` HP4 relies on the repeated keydown returning `false` because the selection is idempotent. HP4 never asserts a state change from a repeat, so the helper-return check is the only assertion that proves the guard. Fix: none needed.
3. `panel-held-enter-ui.test.tsx:100-115` (`pressEnter`) simulates Chromium's click-on-Enter by hand. jsdom cannot show whether a real browser sends a click after a prevented keydown. The doc's real-Chromium probe covers that, but I could not verify the probe files. Fix: none needed.
4. The `studio-repeat-safe.ts` helper is not in `paths.txt`, though the diff imports it. This is fine only if it is already in HEAD. The doc says round 426 introduced it, and the file exists in the working tree. Fix: confirm with `git ls-files app/components/arrangement/studio-repeat-safe.ts` before committing.

## Architecture note
- **Signal:** repeated costly change to one region (`app/components/arrangement/*`, SYS-2 stages 1 to 4). The held-Enter guard is added button by button across about a dozen files. Stage 4 (2b-ii) is still open, and a closing grep row is planned.
- **Keep:** one shared helper (`studio-repeat-safe.ts`) already holds the logic. The per-button `onKeyDown` stays local and keeps focus handoff simple. The invariants are intact: no change to audio timing, refs, gesture lifecycle or Undo/Redo, and the public hook shape is unchanged.
- **Proposal for the planner (one bounded task, optional):** after stage 4, add a lint or test scan that fails when a `<button>` with `onClick` in `/studio-lab` folders has no repeat-safe `onKeyDown`. This would replace button-by-button review for future buttons. Cost is low to medium. Do not extract a wrapper component, because that would change the ref and prop plumbing.

This review covers only the diff, not the whole module.