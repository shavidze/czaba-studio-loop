COMMIT: OK

I read the diff, the three new files, `StudioWorkspace.tsx` around the Escape handler, and `verify.log`. I did not run the code or a real browser.

## Findings, ranked
No blockers.

1. **Low, `StudioWorkspace.tsx:2750-2757`.** A held Escape with the video expanded is now prevented, but it only returns the video on the first press. The call is idempotent, so this is only a safety guard, not a behaviour change. The FV-HELD test covers it.
   - Watch for this in a real browser: `isVideoExpanded` comes from a ref that updates on re-render. Repeats in the same frame are prevented no-ops, and once the ref clears they fall through to the later handlers, as before.
   - Fix: none needed.

2. **Low, `ArrangementDetailPanel.tsx:770-781` and `ArrangementTempoRow.tsx:256-269`.** After `inlineEditorKeyIntent`, both handlers re-read `event.key` to tell Enter from Escape. That is correct and the type stays strict. But it splits the Enter/Escape rule across two places.
   - Fix (optional, later): have the helper return `'settle'` together with the matched key, so the call sites stop re-reading `event.key`.

3. **Low, `ime-composition-stage2b-ui.test.tsx:167-182`.** `pressCell` removes its document listener only after `fireEvent.keyDown` returns. If the dispatch throws, the listener leaks into the next test. This affects tests only, not production.
   - Fix: wrap it in `try/finally`.

4. **Info, `ime-composition-source-scan.test.ts:6-9`.** IME14 is a regex scan, so it can miss exotic forms such as `event['isComposing']` or a destructuring with a default. IME15 documents the forms it does cover, and the allow-lists fail loudly when a new caller appears. Acceptable.

## What I checked
- **Event ordering.** I compared each handler's old and new logic and found them equivalent:
  - **Group and marker editors:** both still call `stopPropagation` first, including while composing, then `preventDefault`, then settle only on a non-repeat press.
  - **Tempo row:** Enter blurs. Escape sets `skipCommitRef` and clears the draft, then blurs. Held keys are prevented with no side effects.
  - **Range input:** Escape is now classed as `other` through `ENTER_ONLY_KEYS`, so it is not prevented, which matches the old behaviour.
  - **Clip gain:** it passes through `useStableHandler`, so the closures are not stale.
- **Truth table.** IME12 pins the pre-change (HEAD 616729c) results for `defaultPrevented` and for whether the key reaches `document`, across 5 editors × 6 key forms.
- **Leaks.** No new listeners, timers or state. The helper is pure and the handlers have no new effects.
- **Render cost.** No new state, memo or props. The extra work is one `Array.some` over at most 2 elements per keydown.
- **TypeScript.** There is no `any`, no `@ts-ignore` and no assertions. `some(... === ...)` is used to avoid `includes` narrowing. React's `KeyboardEvent` fits `InlineEditorKeyEvent` structurally.
- **Tailwind, tokens and accessibility.** No styling or markup changed. Focus handling is unchanged: Escape and Enter still blur or close exactly as before.
- **Auth, purchase and download code.** None touched. The paths are all under `arrangement/`, the tests, and docs.
- **Docs.** Implementation doc 290 is added and docs 288/289 are updated, as the rule requires. I did not read the content of doc 290.
- **Gate.** The `verify.log` I read showed `agents:check` and `test:agents` passing and Biome warnings in `ScrollReveal.tsx`, which this diff doesn't touch. I read only the first 60 lines, so I did not confirm the lint, typecheck, test and build results.

## Architecture note
- Signal 1 (mixed responsibilities) and signal 3 (repeated costly change): the Enter/Escape/IME/repeat rule used to be copied across 5 handlers in 4 files. `studio-ime-composition.ts:213-237` is now its single home, and IME14 enforces that. **Keep it**: it is a pure function, it has no audio timing, refs or gesture lifecycle, it doesn't change the public hook, and the cost is low.
- Proposal for the planner, optional: one small task to make `inlineEditorKeyIntent` return the matched key (finding 2). Acceptance would be that the 4 call sites stop reading `event.key` and IME11/12/13 stay green.
- This note covers the diff only, not a full module audit.