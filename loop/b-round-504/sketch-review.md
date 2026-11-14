# Sketch review, round 505 planning

## Review 1: tech-lead on v1 sha 841657ad19dad549ac373d0f5d8ad44ebf52b56e97996d6c864c787ead0bea77

Verdict line: APPROVE WITH CONDITIONS (verbatim final answer below).

**Verdict: APPROVE WITH CONDITIONS.** The code is sound and follows the project rules: no `any`, no type assertions (the tests narrow with `instanceof`), no new comments, semicolons present, Tailwind tokens only. The conditions are about making the C acceptance rows match the tree.

**Findings**

1. **Medium.** Row 2 of the ruling's C acceptance table says Send has "8px corners" (`/home/runner/czaba-project/tmp/studio-real-loop/b-round-504/consult-product-designer.md`). The tree keeps `rounded-lg` (`/home/runner/b504-verify/app/components/ui/IconButton.tsx`, base classes), and sketch.out measures radius 12px. Doc 326 D2 correctly says 12px. The ruling contradicts itself ("rounded-lg matches the textarea", then "8px"), so C will fail row 2 as written. Fix: before C runs, amend row 2 to 12px (`rounded-lg`, matching the textarea).
2. **Medium.** Row 6 says "IconButton.tsx has no `shadow-glow` or `active:scale-95`". The default and ghost variants still have `active:scale-95` (`IconButton.tsx:26,32`), and B2D-0 pins that on purpose. Read as a file-wide check, row 6 fails. Fix: narrow row 6 to "the brand variant has no …", which is how B2D-0 and B2D-8 already scope it.
3. **Low.** The "opened with guest form" flag is captured once at `/home/runner/b504-verify/app/components/chat/ChatWindow.tsx:38`. Because of that, focus goes wrong in two cases while the window stays mounted:
   - A signed-in user signs out, the guest form appears, they press "Start Chat": focus does not move.
   - Auth turns signed-in while the guest form is showing: focus moves with no user action.
   
   Fix: a `hasRenderedRef` set in a mount effect, and `focusOnMount` true only when ChatInput mounts after the window's first render.
4. **Low.** The exact source-line pin at `/home/runner/b504-verify/app/lib/__tests__/store-button-cleanup-2d.test.tsx:198-201` goes beyond the agreed whole-class pin pattern. A Biome re-wrap breaks it, and B2D-0 already checks the same thing through behaviour. Fix: drop it, or match on a regex over the brand array's tokens.
5. **Low.** The assertion at test:160 that focus stays after Enter proves nearly nothing. The test focuses the textarea at :155, and the Enter path (`handleKeyDown`) never touches focus. Fix: focus the Send button before the Enter keyDown, or relabel the check as "unchanged".
6. **Low.** Doc 326 line 4 says "C round 505 PASS", and its testing section cites `a-round-505/` and `c-round-505.json`. None of these exist yet. Doc 325 uses the same convention. Fix: confirm or correct after C.
7. **info.** The `scrollIntoView` stub at test:67 is not restored. It stays contained because vitest isolates each file by default (`vitest.config.ts` has no `isolate` override) and no other test file stubs it. It is not a flake risk.
8. **info.** The ruling asked for Send to go in the shape table. It is described in the IconButton paragraph instead, which fits better because the shape table only covers Button. Acceptable.

**Answers to your questions**

1. **Is the captured-once `useState(isGuestFormVisible)` sound?** Yes, for `/support`. Both `onClose` and `onMinimize` set `isChatOpen` to false, which unmounts ChatWindow, so every open captures a fresh value. `closeSession` keeps `session` non-null (status closed), so reopening shows no guest form and no autofocus, as intended. Closing the session and starting a new guest session therefore always happens in a new mount, so it cannot misfire. The only misfires are the auth changes in finding 3. The dead `ChatWidget` inherits the same rule, which is harmless.
2. **Ordering hazard with `focus()` in `handleSubmit`?** None. The focus call (`ChatInput.tsx:33`) moves focus while the button is still enabled. React 18 batches `setValue('')` and flushes it at the end of the discrete event, so the button is disabled only after it has already lost focus. A second click then hits `pointer-events-none` and `disabled`. The probe confirms one POST each for click, Enter, keyboard on the button, and double-click, with the textarea focused afterwards. Enter in the textarea goes through `handleKeyDown`, which calls `preventDefault`, so it never reaches `handleSubmit`. Safari, which does not focus buttons on click, ends up in the same state.
3. **Changing the shared IconButton, and the B2D-0 ghost pin?** Both acceptable. ChatInput is the only importer outside the barrel, and the ruling explicitly grants this change. Keeping the ghost/default `active:scale-95` pin is a reasonable guard against side effects. One thing to record for a later round: Tailwind v4's `scale-95` sets the CSS `scale` property, so on those two variants it combines with the global `transform: scale(0.98)` (`app/styles/app.css:230-233`) to give an effective 0.931. Fix that in a later stage, not here.
4. **Vacuous, brittle or flaky tests?** See findings 4, 5 and 7. B2D-6's body-focus assertion is weak on its own, but mutant M6 shows the row has teeth. Focus in jsdom is deterministic here because all calls are synchronous `.focus()`.
5. **False lines in doc 326 or DESIGN_SYSTEM?** Nothing false apart from finding 6. I checked these against the tree and probe outputs:
   - D1: 50 to 48px, 12 to 8px, padding, press opacity 0.9.
   - D2: 36 to 40, 16 to 20px icon, 12px radius, press opacity 1.
   - D3: sketch shows `pe none` and no hover colour change.
   - D4: focus lands on TEXTAREA; signed-in open stays on BODY.
   - "Button has no twMerge" is true: `Button.tsx` imports neither `cn` nor `twMerge`.
   - The DESIGN_SYSTEM IconButton paragraph (around line 1214) matches the code and the global 0.98 press.
   - Older docs 296, 301 and 302 still call IconButton dead. They are historical records and need no edit.

**Relevant files:** `/home/runner/b504-verify/app/components/chat/ChatWindow.tsx`, `/home/runner/b504-verify/app/components/chat/ChatInput.tsx`, `/home/runner/b504-verify/app/components/ui/IconButton.tsx`, `/home/runner/b504-verify/app/lib/__tests__/store-button-cleanup-2d.test.tsx`, `/home/runner/b504-verify/docs/implementation/2026/quarter-IV/326-dpg-button-cleanup-stage-2d.md`, `/home/runner/czaba-project/tmp/studio-real-loop/b-round-504/consult-product-designer.md`

## Review 2: tech-lead delta review on v2 sha f2e389b97159f355626b5f923f39d9aa0ced920ee3c2829840f8607a8de332cc

Verdict line: APPROVE (verbatim final answer below).

**Verdict: APPROVE v2.** I checked the patch hash and it matches f2e389b9…cc.

**Finding 4: resolved.** The exact source-line pin is gone. In its place is `/brand: \[([^\]]*)\]/` at `/home/runner/b504-verify/app/lib/__tests__/store-button-cleanup-2d.test.tsx:206`.
- **It fits the current file.** The only match in `/home/runner/b504-verify/app/components/ui/IconButton.tsx` is line 35; the variant type on line 11 has no `brand: [`. The captured text is `'bg-brand text-background', 'hover:bg-brand-hover', 'shadow-sm'`.
- **It survives reformatting.** `[^\]]` also matches newlines, so the check still works if Biome wraps the array over several lines.
- **It can't pass on empty input.** If the regex finds nothing, the `?? ''` fallback gives an empty string and the two `toContain` checks go red. That rules out a silent pass. M11 turning B2D-0, B2D-3 and B2D-8 red confirms this.
- **One limit, not blocking.** A brand token containing `]` (an arbitrary value like `shadow-[…]`) would cut the capture short, and a later forbidden token could slip through. B2D-0's behaviour check covers that for `active:scale-95`. A `shadow-glow` added later in the array would still fail the file-wide count at :205.

**Finding 5: resolved.** Renaming the check to "with focus unchanged" was one of the two fixes I offered, and the assertion now claims only that.

**Rulings: I accept all four.**
- **#1 and #2:** accepted, on one condition. The task must actually say that the product-designer draft rows 2 and 6 are superseded by its own rows (Send radius 12px with `rounded-lg`, and no `scale-95` only on the brand variant). Otherwise C may score against the draft.
- **#3:** a deferred Low is right. On /support every open is a new mount, so it only misfires on mid-chat sign-in or sign-out.
- **#6:** accepted as the L28 contract. Doc 326's "C round 505 PASS" line and its references to `a-round-505/` and `c-round-505.json` must be checked or corrected after C runs.

The 0.931 effective press scale on the default and ghost variants is fine to leave as an info item for a later stage.

## Review 3: tech-lead delta review on v3 sha 5c0ed1957a97cc871dab743dd3624185e07afc7090523fb80f568f193741dfbe

Verdict line: REQUEST CHANGES (verbatim final answer below).

**Verdict: REQUEST CHANGES.** Only the doc line and the evidence claim need fixing. The code and B2D-9 can stay as they are.

**The premise is wrong.** In `ChatWidget.tsx`, `handleGuestSubmit` calls `setGuestInfo(info)` before it awaits `startSession`. So `showGuestForm` turns false in the same submit commit: GuestForm unmounts and ChatInput mounts right away. The focusOnMount effect runs then, not when the request settles. L47's "focus when the request settles" case doesn't arise here.

**Is the body-only guard correct?** Yes. At mount, the element that had focus (the Start Chat button, the email input after Enter, or the input Safari leaves focused on a mouse click) has just been removed with the form. All three browsers then report BODY, and the effect sees BODY. The guard never blocks a real user flow. It only stops a case where focus is already outside the form when it unmounts, and that can't happen through submit. It's harmless defensive code.

**Is "inside the origin" needed?** No. The origin (GuestForm) is gone when the effect runs, so focus can't be inside it. The header buttons can't be focused by the submit action either.

**Problems with the evidence:**
- The browser "inflight" row in `probe/support-505.mjs` moves focus 200 ms after the click. By then the textarea already has focus, and nothing tries to focus anything after the request settles. That row passes with M15 (guard removed) too, so it doesn't prove the guard works.
- B2D-9 does kill M15 in jsdom, but its "focused outside before the rerender" setup is artificial. Keep it, but label it as a guard unit test, not an in-flight scenario.
- The new doc line ("session-ის დაწყება ასინქრონულია… focus გადადის მხოლოდ მაშინ, როცა ის BODY-ზეა") credits the guard for the in-flight behaviour. Reword it: the field mounts and takes focus immediately on submit, the guard only prevents taking focus away from somewhere other than BODY, and the in-flight probe row shows that nothing grabs focus after the request settles.

Files:
- `/home/runner/b504-verify/app/components/chat/ChatWidget.tsx`
- `/home/runner/b504-verify/app/components/chat/ChatInput.tsx`
- `/home/runner/czaba-project/tmp/studio-real-loop/b-round-504/probe/support-505.mjs`

### B response to review 3 (evidence)
- The review reasons from `ChatWidget.tsx`, which is dead: no route mounts it (claims K4). The live path is `app/routes/support.tsx`. There `showGuestForm = !isAuthenticated && !session`, and `handleGuestSubmit` only does `await startSession(info)`. `ChatContext.startSession` sets `session` after `apiClient.createChatSession` resolves. So on `/support`, GuestForm stays mounted while the request is in flight, and ChatInput mounts when it settles. That is the L47 async-settle case.
- **Browser mutant run.** `probe/m15-browser.out` was run on the sketch server with the guard removed in scratch, then restored (post-sketch sha check rc 0). The in-flight row ends on `TEXTAREA`: focus is stolen after the request settles. With the guard (`probe/sketch.out`), it stays on "Back to support options". So the in-flight browser row does go red under M15.
- B2D-9 stays a guard unit test; its title states the condition, not the timing.

## Review 4: tech-lead follow-up on v3 sha 5c0ed1957a97cc871dab743dd3624185e07afc7090523fb80f568f193741dfbe (live /support path)

Verdict line: APPROVE (verbatim final answer below).

**Verdict: APPROVE v3.**

**Review-3 objection: resolved for /support.** My objection came from `ChatWidget.tsx`. That component is exported from `app/components/chat/index.ts` but no route renders it, so its timing was the wrong basis. On the live path, `support.tsx:26` sets `showGuestForm = !isAuthenticated && !session`, and `handleGuestSubmit` (`:35-36`) only awaits `startSession`. In `ChatContext.tsx`, `startSession` sets `session` only after `createChatSession` resolves (`:200-212`). So GuestForm stays mounted while the request is in flight, and ChatInput mounts when it settles. That is the async-settle case. The probes show the guard working: with it removed (`m15-browser.out:19`), focus ends on TEXTAREA. With it kept (`sketch.out:19`), focus stays on "Back to support options". The guard is needed, not just defensive.

**Doc 326 line 24: accurate for /support.** It matches the guard at `ChatInput.tsx:20` and the probe evidence. My suggested rewording is withdrawn.
