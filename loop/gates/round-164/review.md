COMMIT: OK

The diff only changes styling: two class changes and one extra `<polyline>` in the envelope SVG. It doesn't touch auth, purchase or download code, and adds no new state, effect, timer or listener. It uses only design tokens: no hex colours, arbitrary values or custom CSS. In `verify.log` all 171 test files pass, and typecheck and build pass. C's round 164 ran in a real Chromium at 1440 and 1280 and passed: the envelope line and handle now measure 15.62:1 contrast where they were 1.74 and 1.88 before, and the Overview corner gaps are gone.

## Code Review: ArrangementClipEnvelope.tsx, ArrangementOverview.tsx (+ 2 tests, 2 docs)

### Critical Issues
- None.

### Suggestions (ranked; none blocks the commit)
1. **Low — the dark outline shows on the clip header at 0 dB.** `ArrangementClipEnvelope.tsx:407-421`
   - The SVG is `overflow-visible` and the outline is 4 px wide, so it sticks out 2 px past the line.
   - The clip box itself clips it (`ArrangementClip.tsx:823`, `overflow-hidden`). So it can't leak past the clip's ends or bottom, or onto the next clip.
   - But the clip body (`ArrangementClip.tsx:860`) has no clipping. At gain 1.0, which is where every new point starts, the outline puts a 2 px dark band on the bottom edge of the header. That is the same spot as C's N2, where the handle now covers part of the clip name.
   - Fix, if B wants it: add `overflow-hidden` to the clip body wrapper, or clip the SVG to its own box. Either one needs a check that the handle can still be grabbed at 0 dB and at −∞ dB. Cosmetic only, not for this round.
2. **Low — the view frame can become pill-shaped.** `ArrangementOverview.tsx:329` together with `view.ts:181`
   - `overviewFrame` has no minimum width. With `rounded-sm` (6 px), a frame narrower than about 12 px at very high zoom turns into a pill.
   - This was already true with `rounded-xs`; it is just a little more visible now. C saw normal frames at 39–57 px (N3).
   - Possible fix later: a minimum frame width in `overviewFrame`, or a smaller radius only when the frame is narrow.
3. **Low — OV1 test is fragile.** `studio-theme-obsidian.test.tsx:133-138`
   - It matches the full markup string of the outline overlay, so any reordering of its classes breaks it, even when the behaviour is unchanged.
   - Fix: parse that element's classes, or match it through the SSR HTML the way the root and frame checks already do.
4. **Low (expected) — doc 133 status.** `docs/implementation/2026/quarter-IV/133-…md:4` still says "In Progress (awaiting C round 164)". This follows the pattern this diff shows for doc 132, which is marked Completed one round later, so leave it as is.
5. **Accessibility (not from this diff):** the handle's hit area grew from 8 to 10 px, which helps, but it is still below the 24 px target in WCAG 2.5.8. Points are also still `div`s that can't take keyboard focus. Worth a separate a11y task.

### Regression and real-browser risks checked
- **Hover enlarge:** `hover:scale-125` works with the centring `-translate-*`, because Tailwind v4 makes `scale` and `translate` separate CSS properties. In v4, `hover:` only applies on devices that support hover, so there is no stuck hover on touch (C confirmed `matchMedia('(hover: hover)')` returns true). Chromium keeps hover during pointer capture, so the handle stays enlarged for the whole drag without flicker. Drag maths use pointer coordinates, not the handle's box, and C's −3.9 / −4.0 dB after an 18 px drag confirms the bigger handle doesn't shift the gain. No transition was added, so nothing changes for reduced-motion users.
- **Older tests:** EU5, EU7 and AL1 grab the first `polyline` with `querySelector`, which is now the outline. It has the same `points`, so they still check the right thing. EV1 checks that both polylines exist and are equal, and mutation m179 shows it adds protection the older tests don't give.
- **Render cost:** one extra `<polyline>` per audio clip, reusing the `linePoints` string that is already computed. No new allocation, memo or re-render path.
- **TypeScript and project rules:** no `any`, no type assertions, no `@ts-ignore`; semicolons are in place. The test reads `getAttribute('class')` on SVG elements, which handles `SVGAnimatedString` correctly.
- **Security** (checked against `SECURITY_AUDIT.md`): not applicable. No auth, token, API, input or third-party change. C's G164-3 confirms `/studio/:id` still requires sign-in and `/api/studio-token` returns 401. `ERROR_TAXONOMY.md` doesn't apply either, since no error path changed.

### Good Practices Found
- Contrast is fixed with existing tokens only: `stroke-background` / `stroke-foreground` replace the `stroke` attribute. This is the same idea as the Overview playhead's `ring-1 ring-background`.
- Hover changes size, not colour, which keeps the accent colour reserved as DUX-R-5 requires.
- Each change has a mutation test (m178–m181).
- The frame radius fix doesn't change the frame's size or position.
- C verified it in a real browser, including real audio (a −∞ dB point gives a peak of 0.00000).

### Architecture note
- None. None of the four signals appears in this diff: no state, lifecycle, timer or listener is added, no ownership moves, and no responsibility is mixed in. `ArrangementClipEnvelope.tsx` has been changed in several rounds, but this edit was cheap and needed no new mocks or wide context, so it doesn't count as signal 3. This is a review of the diff only, not a full audit of the module.

### Alternative Approach
- This isn't critical logic: the gain and audio pipeline didn't change.
- **Current:** a two-tone line, with a 4 px `background` outline under a 1.5 px `foreground` line.
- **Alternative:** a single-colour line (only foreground or only background), or a 5 px outline.
- **Verdict:** keep the two-tone line. One colour can't reach 3:1 against both the brass header (about 1.8:1) and the dark body. The 5 px outline measured worse in B's sampler. The two-tone line should also stay correct once DUX-R-5 makes waveforms neutral.

### Score: 9/10