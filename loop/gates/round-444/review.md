COMMIT: OK

Nothing in the diff blocks the commit. I read the diff and the surrounding code. I did not run the code or a real browser, so the event-order notes below come from reading it.

## Findings, ranked

1. **Low, `app/lib/focus-source.ts:53-55` and `focus-source-typing.test.tsx` FT9: the "Option" claim is not backed by real browser behaviour.**
   - Chrome and Safari on macOS usually don't report `getModifierState('AltGraph')` for Option+character. So `Option+€` in a text field has `altKey` true and `AltGraph` false.
   - That key falls through to `if (event.ctrlKey || event.metaKey || event.altKey) return false`. `data-focus-source` flips to `keyboard`, which is the same as before this diff. So this is not a regression.
   - The Windows and Linux AltGr case (`ctrl` and `alt` both true, `AltGraph` true) is fixed correctly.
   - FT9's name and the 289 doc claim "AltGr or Option", but the test only uses a synthetic `modifierAltGraph`.
   - Fix: reword the test name and doc to AltGr only. Or, in a later round, treat `key.length === 1 && altKey && !ctrlKey && !metaKey` as a character on macOS.

2. **Low, `ArrangementShortcutSheet.tsx:68-78`: composing Escape and held Escape now call `stopPropagation` at the window capture phase.**
   - This also hides the event from React and every other keydown listener. That is what IME9 and IME10 check for, and the browser's own IME cancel still happens because `preventDefault` is not called.
   - It relies on the sheet's listener being registered before the Modal's Escape handling. The listener is added and removed symmetrically in `useEffect`, so there is no leak.
   - A global Escape handler that should run during held repeats would now be silenced while the sheet is open. I found no such handler, and IME10 asserts that the document-level listener is not called.
   - Fix: none needed. Keep the sheet-open scope.

3. **Info, `ArrangementLibrary.tsx:396-409`: an Escape repeat still calls `preventDefault` but does not stop propagation.**
   - IME9 shows the workspace snapshot is unchanged during held Escape. The asymmetry with the sheet is harmless, but a short note in doc 289 would make the intent clear.

4. **Info, `focus-source.ts:49-51`: `key === 'Unidentified'` is treated as composing.**
   - This is correct for Android and IME placeholders, and it only applies to text-field targets. FT8 checks that `range` and non-text targets still switch to `keyboard`.
   - `getModifierState` exists on all real `KeyboardEvent`s. The unit tests build real `KeyboardEvent`s, so nothing breaks. Don't pass plain objects here.

Other checks came back clean:
- No auth, purchase or download code is touched.
- No new `any`, assertions or suppressions. `Pick<KeyboardEvent, ...>` is a clean type split between the native and React helpers.
- No custom CSS, hardcoded colours or new render paths.
- No new timers. The only listeners are the existing capture listeners with matching cleanup.
- `StudioWorkspace` re-render cost is unchanged.
- In `ArrangementLibrary.tsx`, the composing guard returns before `ArrowDown` and `Escape`, so the IME owns those keys.
- `keyCode === 229` also covers Safari, where the `keydown` after `compositionend` reports `isComposing: false`.

## Architecture note
- signal: `focus-source.ts:49-80` and `studio-ime-composition.ts` both now decide "is this keydown an IME or composing key", with slightly different rules. One checks `isComposing || keyCode 229`; the other adds `key === 'Unidentified'`. → keep for now: the two sit in different layers (`lib` for focus-source, the component folder for Studio), and the focus-source one is deliberately wider for Android. Proposal for the planner, to be done only after stage 2b/3: one bounded task to put the shared `isComposing || keyCode === 229` check in one `lib/` helper, with the `Unidentified` extension staying in `focus-source`. Done when the existing IME8, FT7 and FT8 tests still pass. Cost: low. Risk: low.