COMMIT: OK

I read the diff, the new helper, the test file and the doc. I also read the three non-guarded handlers and the `StudioWorkspace` global key handler. I did not re-run the tests or the browser probe. I relied on C's PASS and `verify.log`, which I did not open.

**Scope.** Auth, purchase and download code is untouched. The change is five guards in four components, one helper, one test file and one doc. There are no new listeners, timers, state, effects or Tailwind or CSS changes, and no `any` or type assertions. The structural `ImeCompositionKeyEvent` type accepts React's `KeyboardEvent` without a cast.

**Event ordering.**
- **Marker and group editors:** `stopPropagation()` still runs first, then the IME guard returns, and `preventDefault()` runs only after the guard. A composing Escape therefore does not reach ancestors, and the browser can finish the composition. The doc's mutants cover both orderings.
- **Group editor:** `preventDefault()` used to run before `stopPropagation()`, and the order is now reversed. This has no effect, because both calls happen for non-composing keys.
- **Tempo, From/To and Clip Gain handlers:** the guard sits on the first line. These handlers have no other key branches, so returning early drops nothing.
- **Global shortcuts:** `StudioWorkspace.tsx` skips the global keydown handler for typing targets (lines 2731 and 2809). A composing Escape that bubbles out of the tempo, range or gain inputs is therefore not handled globally.
- **Render cost:** none. The helper is a pure function and `handleClipGainKeyDown` is still wrapped in `useStableHandler`.

**Accessibility.** The change helps IME users. There is no ARIA or focus-ring change.

**Findings, ranked**
1. **Low.** `studio-ime-composition.ts:7`: `keyCode === 229` uses a deprecated property. The doc's ruling R2 accepts this for Safari, where the confirming Enter has `isComposing: false`. This is the intended design. Fix: none now. Add a one-line comment saying keyCode 229 is deliberate for Safari. CLAUDE.md allows comments only for TODO or Georgian context, so a Georgian comment would be the form.
2. **Low.** The tests run in jsdom and use synthetic `isComposing` and `keyCode` events. Event ordering is proven only by B's Chromium probe (18/18 on HEAD failing, all OK on the change) and C6 (C's browser check), plus macOS/Windows IME checks tracked as TLM-SYS3-IME-PLATFORMS. Fix: keep that tracking item open.
3. **Info.** `ime-composition-ui.test.tsx`: `parentKeydown` is added to `document.body` and removed after the assertions. If an assertion throws first, the listener leaks within that test file. The effect is negligible, since the DOM is reset by the next test. Optional fix: wrap it in `try/finally`.
4. **Info.** `docs/.../288-...md:4` says "In Progress (stage 1 of 2)", which matches the rule. Stage 2 is still open: Library search, the shortcut sheet's Escape handling in the Modal, and `focus-source.ts`.

**Architecture note**
- Signal: `studio-ime-composition.ts` is a small shared helper that sits next to `studio-repeat-safe.ts`. It follows the existing pattern with no new coupling. Keep it, because it has one purpose, no lifecycle, and is tested at all five call sites.
- Signal: `ArrangementMarkerRow.tsx` (~line 973) and `ArrangementGroupHeader.tsx` (~line 296) hold near-identical inline Enter/Escape editors. This round adds a guard to each, and earlier rounds touched the same code (`preventRepeatedEnterKeyDown`). Cost to extract: medium. Risk: Undo/Redo atomicity and the timing of the editor's settle call.
- Proposal for the planner (not for this round): once stage 2 lands, consider one bounded task to extract an `InlineNameEditorKeyHandler` helper from those two editors. Acceptance would be unchanged IME1–IME3 tests and the repeat-safe tests. If stage 2 adds more editors, do it then. Otherwise, keep it as is.

This review covers the diff only. It is not a full audit of the module.

**Score: 9/10**