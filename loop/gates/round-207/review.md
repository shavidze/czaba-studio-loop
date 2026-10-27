COMMIT: OK. The change only swaps cursor classes on three elements in two components, plus tests and docs. No handlers, refs, timers or listeners changed, and no auth, purchase or download code is touched. The C round 207 check passed, and the verify log shows 196 test files and 2813 tests passing, with the build succeeding.

## Code Review: ArrangementClipEnvelope.tsx, ArrangementVideoDock.tsx (+ tests and docs, round 207)

### Critical Issues
- none

### Suggestions, ranked
1. **Low, stale doc status.** `docs/implementation/2026/quarter-IV/164-timeline-cursor-pointer.md:4` and `:83` still say "C round 207 check pending", but `c-round-207.json` is PASS. **Fix:** set the status to `In Progress (C round 207 PASS — c-round-207.md; open: SABA-B-6-R1 awaiting_user, A-R207-01)` and replace line 83 with the C result. The 163 doc's status line was updated the same way this round.
2. **Low, `grabbing` may not show in Firefox or Safari.** `ArrangementVideoDock.tsx:922` relies on `active:cursor-grabbing`. The box's `onPointerDown` (`:930`) calls `preventDefault`, which in Firefox and Safari can stop `:active` from applying. The cursor would then stay `grab` while dragging. Doc 164:72 already says this was only checked in Chromium. **Fix (next round, not blocking):** set `data-dragging="true"` from the existing float-drag gesture start and end, and use `data-[dragging=true]:cursor-grabbing` instead of `active:`. This adds no new state if the gesture ref already marks start and end; otherwise it needs a ref-to-attribute write in the existing handlers.
3. **Low, accessibility of the cursor meaning.** `ArrangementClipEnvelope.tsx:353` now shows the pointer cursor over the whole clip body when Env is on. Users read the pointer cursor as "single click does something", but a single click on the body only selects; adding a point needs a double-click. That is the user's request and is recorded as D1 / `SABA-B-6-R1`, so no change now. The `title` tooltip (`editorTitle`) should keep saying that double-click adds a point. Keyboard access is unchanged.
4. **Info, CU4 scan width.** `timeline-cursor-map.test.ts:6-7` also matches comments and strings in `components/arrangement/`, so a future comment like "cursor: move" would fail the test. That is acceptable as a strict guard, and the failure message names the file, so no change is needed. The scan covers only `components/arrangement/`. `TransportBar.tsx` is excluded on purpose (doc 164:17).
5. **Info, the ⠿ handle (A-R207-01).** The handle's `cursor-grab` class loses to the unlayered `button { cursor:pointer }` rule in `app.css`. That problem predates this round and is correctly handed to B. No action here.

### Checks against the review focus
- **Browser event order:** the point drag uses pointer capture (`:295-296`), so the cursor stays on the point during the drag. Doc 164:82 confirms `pointer` throughout in Chromium. No handler order changed.
- **Leaks:** no new listeners or timers. Render cost is unchanged because only static class strings changed.
- **Tailwind/tokens:** standard v4 utilities only, with no arbitrary values or custom CSS. The compact branch (`relative w-40`) has no cursor class, and CU3 checks that.
- **TS strict:** the new test file has no `any` and no type assertions, and statements end with semicolons.
- **Security:** nothing in this change touches tokens, input, XSS or API code, so neither the SECURITY_AUDIT checklist nor ERROR_TAXONOMY applies.

### Good Practices Found
- The change is as small as it can be: three class swaps, with hit area, z-order and behaviour unchanged.
- CU1 to CU3 check both that the new classes are present and that the old ones are gone. CU2 also checks that the EV1 tokens are still there.
- The doc says plainly that the Ableton cursor shapes are unconfirmed ("no reference found") instead of claiming a match.
- The red-proof for CU4 includes six named mutants (multi-line `cn(`, arbitrary value, inline style, `hover:`/`active:` prefix, `.ts` file).

### Architecture note
- none. The diff shows none of the four signals: no change in who owns what, no new state or lifecycle, and only class strings changed. I only reviewed this diff; neither module was reviewed in full.

### Alternative Approach (for the floating `grabbing` cursor, which is UX only)
- **Current:** CSS `active:cursor-grabbing`. It costs nothing and needs no state, but it only works where `:active` survives the `preventDefault` on pointerdown (confirmed in Chromium only).
- **Alternative:** a `data-dragging` attribute set by the existing float gesture and styled with `data-[dragging=true]:cursor-grabbing`. It works in every browser and shows `grabbing` for exactly the length of the gesture, but it touches the gesture handlers.
- **Verdict:** the current approach is right for this round because the scope is cursor-only and gesture code should not change. If Firefox or Safari get covered later, plan the alternative as its own small task.

### Score: 9/10