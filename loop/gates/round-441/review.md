COMMIT: OK

I read the diff, the new doc, and `ArrangementOverview.tsx` and `ArrangementExportDialog.tsx` through a grep. I did not run the app or the tests myself. The verify log and C's PASS are taken as given.

## Findings, ranked
There are no blockers. Everything below is low or informational.

1. **Low — `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx:27-32, 650-662`, UM8b.** The `video.client` mock is declared file-wide. `probeVideoFile` and `decodeVideoAudio` become bare `vi.fn()` for every test in the file, not just UM8b.
   - The cleanup is safe: `vi.restoreAllMocks()` in `afterEach` (line 385) clears the `Once` queues, so nothing leaks into later tests.
   - Any future test in this file that imports video will get `undefined` back unless it sets the mock itself.
   - Fix (optional): add a short note, or move UM8b to its own file if more video cases arrive.

2. **Low — `track-group-mix-ui.test.tsx:664-672`.** The poll loop is bounded at 20 ticks of `setTimeout(0)`. It leaves no timers or listeners behind, and the `toStrictEqual(['ready'])` assertion fails clearly if it runs out.
   - That is fine for a jsdom/fake-audio setup. In a real browser, a `ready` state that depends on real decode timing would be flaky.
   - Fix (optional): use `waitFor` from testing-library.

3. **Informational — `ArrangementOverview.tsx:313, 323, 326, 332`.**
   - The change is four data attributes and nothing else: no class, order or prop changes, and no new state, effect, listener or timer.
   - Render cost is negligible: two static strings plus two attributes on a list that already renders per track and per clip.
   - Accessibility is unchanged. The overlays are still `pointer-events-none` and unlabelled, as before.
   - The attributes expose `track.id` and `clip.id` in the DOM. These are internal arrangement ids, not secrets. The same ids already key the React lists.
   - Tailwind and tokens are untouched. TypeScript is clean: no `any`, `@ts-ignore` or `as` casts. `importOriginal<typeof import(...)>` is a type argument, not an assertion.

4. **Informational — `docs/implementation/2026/quarter-IV/287-sys-1-stage-2-overview-hooks.md:102-105`.**
   - The doc follows the template and is in Georgian.
   - Group Mute is not covered by a rendered test (TL-R440-UM8-GROUP-MUTE, deferred).
   - Several source-text pins remain (S2-R2). Both are recorded openly, so I did not treat them as defects.

## What I checked
- **Auth, purchase, download:** none of the 7 paths touch them. There is no Studio audio pipeline code, Undo/Redo or gesture lifecycle change either. `ArrangementExportDialog.tsx` is only read by UM8b through the rendered UI and is not modified.
- **Event ordering and leaks:** no source-side listener or timer is added. The only test-side async is the bounded poll above.
- **Regression of existing flows:** DOM order is unchanged (outline or baseline first, then lanes). The OV-E1, PNR4 and DXC4 tests now assert parent and sibling relations explicitly, so a stray inserted div would still be caught.
- **SECURITY_AUDIT and ERROR_TAXONOMY:** no items apply. No XSS surface, no `dangerouslySetInnerHTML`, and no API or error-code code is involved.

## Architecture note
- signal: `app/lib/arrangement/__tests__/` (the `PANEL` list, PNR2 and PNR4 source counts, and the content-colour scans, per doc lines 38 and 105) → keep for now, because these are deliberate source contracts and rendered replacements would cost more than they return this round.
- proposal for the planner (one bounded task, RETRO 450): decide per pin whether it stays a source contract or becomes a rendered assertion. Acceptance: no test depends on exact JSX text or child position, mutants O2 and D1H stay red, and the focused suites stay green.
- This is a note on the diff only. It is not a claim that the module was fully audited.