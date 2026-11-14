# Code-reviewer output, round 505 (agent id `ad00a7ca861b04541`, subagent `code-reviewer`)

Input: `git diff e3e9e49` (`a-round-505/diff.patch`), plus the untracked `app/lib/__tests__/store-button-cleanup-2d.test.tsx` and `docs/implementation/2026/quarter-IV/326-dpg-button-cleanup-stage-2d.md`. Below is the hand-back text exactly as returned.

## Code Review: /support chat buttons (stage 2d, diff against e3e9e49)

I found no Critical or High issues. The change is correct, and nothing in the diff uses `any`, type assertions or `@ts-ignore`. Statements end with semicolons, there are no new comments, and the Tailwind classes use tokens.

### Findings

- **Medium**, `app/lib/__tests__/store-button-cleanup-2d.test.tsx:177-185` (B2D-7): this test skips the step that makes the BODY guard matter. In the real flow the "Start Chat" button has focus when `GuestForm` unmounts. In B2D-7 focus never leaves BODY, so the test would pass even if the browser moved focus somewhere other than BODY when the focused button is removed. Fix: call `screen.getByRole('button', { name: 'Start Chat' }).focus()` before the `rerender`. B2D-9 already covers the "focus is elsewhere" case.

- **Low**, `app/components/chat/ChatWindow.tsx:38`: in this scenario, focus is lost after all. A window that opened straight into a session, then shows the guest form again (the session ends), then starts a new session, keeps `focusOnMount=false`. Focus falls to BODY. You accepted capturing the flag once per mount; I mention it only because this is a real path to lost focus, not just a theory.

- **Low**, `app/components/chat/ChatInput.tsx:20`: the guard compares only against `document.body`. `document.activeElement` can also be `null`, for example inside some iframes or while a document is being torn down. In that case the textarea is not focused, which is the safe failure, so this is a note rather than a fix.

- **Low**, `app/components/chat/ChatInput.tsx:25-52`: `handleSubmit` and `handleKeyDown` repeat the same send logic. Only the button path calls `focus()`, which is correct. A later change to one copy could drift from the other, though. `form.requestSubmit()` in the Enter handler would leave one path.

- **info**, `ChatInput.tsx:33`: `focus()` runs while the Send button is still enabled, and the disabled re-render comes after it. So focus moves before the button can drop it. B2D-4 catches a regression here because it calls `send.focus()` first. Without the `focus()` line, `activeElement` stays on the disabled button and the test fails.

- **info**, `ChatInput.tsx:19-23`: the effect deps `[focusOnMount]` are complete. The prop comes from one-time state, so the effect cannot fire again.

- **info**, focus visibility: `IconButton` has no focus ring of its own. The global `:focus-visible` rule (`app/styles/app.css:236`) provides one, and `data-focus-source="pointer"` hides it for mouse users. The accessible name comes from `label`, which sets both `aria-label` and `title`. While disabled, `pointer-events-none` also hides the tooltip, which is acceptable.

- **info**, mobile: focusing the field after a tap on Send keeps the keyboard open, which is what you want. The programmatic focus on mount after "Start Chat" will not open the iOS keyboard because it is not a user gesture. That is harmless.

- **info**, token tests: moving `IconButton.tsx` into `GRANTED_GLOW_FREE_SCRIPTS` makes the guard stricter, because a reintroduced glow will now fail. The count change from 5 to 4 matches the removed dead entry.

- **info**, test quality: removing the effect breaks B2D-6. Always passing `focusOnMount` breaks the last assertion of B2D-7. Removing the guard breaks B2D-9. Restoring the glow or the scale breaks B2D-0 and B2D-8.

The accepted items (whole-class pins, source pins, the `scrollIntoView` stub, the doc status, the barrel import, `ChatWidget`) are noted and not raised again.

### Good Practices Found
- `instanceof` guards in the test helpers instead of assertions.
- B2D-9 is a real negative test of the guard.
- The doc records the D1–D4 visual differences against HEAD.

### Architecture note
- signal: `ChatWindow.tsx:38` plus `ChatInput.tsx:11` add new focus state to an existing owner. **Keep it:** the state is one boolean captured once and passed down as a prop, so it adds no new lifecycle or coupling. If the "Live Chat open focus" follow-up (B-R505-LIVECHAT-OPEN-FOCUS) lands, the planner could scope one bounded task: move all chat focus decisions into one focus-management point in `ChatWindow`, triggered by the guest-form-to-chat switch rather than the mount-time flag.

### Score: 8.5/10

Files reviewed: `app/components/chat/ChatInput.tsx`, `ChatWindow.tsx`, `GuestForm.tsx`, `app/components/ui/IconButton.tsx`, `app/routes/support.tsx`, `app/lib/__tests__/store-button-cleanup-2d.test.tsx`, `docs/implementation/2026/quarter-IV/326-dpg-button-cleanup-stage-2d.md`.
