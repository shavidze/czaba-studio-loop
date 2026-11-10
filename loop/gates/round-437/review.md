COMMIT: OK

Review covered the diff and the implementation doc. I did not run a browser. The browser behaviour below (hairline pixels, drag hover, export states) rests on the doc's account of C's round 437 probes.

## Code Review: Studio VIS-7 / VIS-10 / lane hairline (round 437)

### Critical Issues
- None. The diff touches no auth, purchase, download, API or token code. It adds no listeners, timers, effects, refs or state, so there is nothing to leak. The only new runtime expression is the `isRendering` ternary inside `cn()`.

### Suggestions (ranked)
1. **`ArrangementDetailPanel.tsx:1386`: no drag state on the Detail separator.**
   - The separator uses `hover:after:bg-foreground/25` only. If the pointer outruns the handle during a drag, the hairline disappears while the drag continues. The lane handle avoids this with `isHeightDragging` at `ArrangementLane.tsx:1342`.
   - The doc already lists this as a TODO. Fix: add the same "dragging" state, using an existing flag if one exists, so the two handles behave the same.
2. **`ArrangementLane.tsx:1341`: `after:-bottom-px` puts the line outside the handle's box.**
   - The pseudo-element is grabbable because its events go to the handle. The doc says this is intended ("the line you grab").
   - Two things only a real browser can confirm, and C reportedly measured them: the next lane's `z` order and background must not paint over the 1 px line, and no ancestor may clip it with `overflow-hidden`. Fix if clipping shows up: extend the handle's own box rather than the pseudo-element.
3. **`ArrangementLane.tsx:1342` and `ArrangementDetailPanel.tsx:1386`: a deliberate WCAG 1.4.11 trade-off.**
   - A 1 px `foreground/25` hover line is below 3:1. The doc records this as a Saba override of doc 144.
   - Acceptable because the keyboard focus ring (`STUDIO_FOCUS_RING_INSET_CLASS`) is unchanged and the line shows only on hover. Keep that explicit in the doc.
4. **`StudioWorkspace.tsx:3258` and `StudioNarrowScreen.tsx:95`: weaker hover feedback on the exit link.**
   - Hover now only brightens the arrow, because the text is already `text-foreground`. Focus-visible is covered by the global ring.
   - Optional: add `group-focus-visible:text-foreground` on the arrow for parity with hover.
5. **`ArrangementExportDialog.tsx:629`: the busy state is a disabled button with `opacity-70`.**
   - `aria-busy` is set and `enabled:hover` / `enabled:active` do not apply while disabled. That is correct.
   - Check contrast of `text-brand-foreground` on `bg-brand` at 70% opacity against the dark background. This is Low.
6. **Tests assert Tailwind class and source strings** (for example `expectCount(WORKSPACE_PATH, 'rounded-sm px-1 …')` in `label-status-colour-ui.test.tsx`).
   - These break on any cosmetic reordering. They do not check the rendered result: the hairline pixel, hover behaviour, or contrast.
   - Browser verification therefore depends on C's evidence.

### Good Practices Found
- Tailwind tokens only (`bg-brand`, `brand-hover`, `brand-foreground`, `foreground/25`); no custom CSS or hardcoded colours.
- The 6 px hit box and the inset focus ring are kept. Folded handles stay `pointer-events-none`, with a new test that they carry no hover class.
- The hover class is removed while dragging, so hover cannot override the drag class (doc note (d)).
- The motion `!` utilities and `motion-reduce:transition-none!` are kept on the Export button.
- No type assertions or `any`. The `cn` import already existed.
- The implementation doc follows the template: approach, alternatives, deferred items (the unlayered `button { cursor }` rule, trim/loop/Library edges).

### Architecture note
- Signal: `ArrangementLane.tsx:1338-1343` and `ArrangementDetailPanel.tsx:1386`. The same "thin hairline resize handle" pattern is now written out as separate class strings in two places. The Clip trim edge, loop brace edge and Library edge remain on the old `hover:bg-foreground/50` style.
- Keep it for now: it is two uses, a class string, no new state, and no effect on audio, refs, gesture lifecycle, Undo/Redo, or the public hook.
- Proposal for the planner, only if Saba extends the thin-line style to the other edges: one bounded task to extract a shared `STUDIO_HAIRLINE_HANDLE_CLASS` constant next to `STUDIO_FOCUS_RING_INSET_CLASS`. Cost is low, and the tests that assert class literals (`track-layout.test.tsx`, `affordance-colour-ui.test.tsx`) would need updating. This is not a fix for this round.

### Alternative Approach
Not critical logic (styling only).
- Current: a 1 px `::after` pseudo-element on the existing 6 px handle.
- Alternative: keep the handle as is and add a separate non-interactive 1 px child element.
- Verdict: the current one is better, with fewer DOM nodes and the same hit box. The only cost is that the `::after` cannot be queried in jsdom, which is why the tests assert class strings.

### Score: 8/10