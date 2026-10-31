COMMIT: OK (no blocking issues; four low, non-blocking findings and one architecture proposal below)

## Code Review: SYS-5 stage 2 (round 278, HEAD 42872cf)

**How this was checked:** I read the diff, the 3 new files, `verify.log` (221 test files and 3308 tests pass, typecheck is clean, build OK) and the 207 doc. I also read `architecture-checkpoint.md` and the outlines of `SECURITY_AUDIT.md` and `ERROR_TAXONOMY.md`. Searches outside `app/` (Playwright/e2e and perf specs) found nothing that depends on the old Delete name `Delete — the selected clip…`, on the metronome, Preview or Add test IDs or names, or on `.disabled` for these buttons. The two pre-existing `toBeEnabled()` calls in `perf/` point at a fader and the export dialog's primary button, which this round doesn't touch. **No auth, purchase or download code is touched.**

### Critical Issues
- None.

### Suggestions (ranked)
1. **The disabled Add button still looks fairly solid** — `ArrangementLibraryPreview.tsx:357`. Before, `disabled:opacity-40` faded the whole button. Now `aria-disabled:*:opacity-40` fades only the icon and text, so the strong border (`border-outline-strong`) and background stay at full strength. Add is the only one of the newly converted buttons with a visible border; Preview and Metronome use a transparent one. C's colour check covers text legibility, but not whether the button still reads as unavailable. **Fix (optional):** add `aria-disabled:border-outline`, or have design approve the look as it is. Low.
2. **Unused `event` parameter in three click wrappers** — `ArrangementTransport.tsx:184` (Split), `:317` (Loop) and `:368` (Zoom to selection) still take `(event) =>` but no longer use it. **Fix:** write `guardSoftDisabledClick(() => { splitSelection(); })` and the same for the other two; the metronome call at `ArrangementTempoRow.tsx:317` shows the shorter handler type already works. The lint output is cut off after 186 diagnostics, so you can't tell from the log whether Biome flags these. Low.
3. **A typed BPM is not saved when the user clicks a disabled Preview or Add** — `studio-soft-disabled.ts:13-15`. Preview and Add block focus on mousedown, so if a BPM is typed but not yet confirmed, clicking either one leaves focus in the BPM field and doesn't save the value. The doc only explains this for the Metronome, the one button that lets the BPM save first. The impact is small because Preview and Add don't depend on tempo. **Fix:** none needed; add one line to the gate record so the scope decision is written down and not rediscovered later. Info.
4. **Preview has a tooltip only when unavailable, Add always has one** — `ArrangementLibraryPreview.tsx:325` vs `:356`. Preview had no tooltip before either, so this is not a regression. Optional.

**Checks with nothing to fix:**
- **Click timing in a real browser (Metronome):** pressing the mouse button blurs the BPM field, the tempo saves and React re-renders before the click arrives, so the same click turns the metronome on. This works because `guardSoftDisabledClick` checks `aria-disabled` on the button at the moment of the click. UI13 covers it, and the doc says C checked it in a browser.
- **Global keyboard handling:** the global Enter handler at `StudioWorkspace.tsx:2575` ignores Enter when a button has focus, so Enter on a focused disabled Add adds nothing twice. The `!button.disabled` check at `StudioWorkspace.tsx:467` covers only the video dock, which this round doesn't change.
- **Focus visibility:** buttons that are unavailable can now take keyboard focus, and the global `:focus-visible` outline in `app.css:386` covers them.
- **Leaks and render cost:** no new listeners, timers or effects. The wrapper creates a new function each render, the same as the inline arrow functions it replaces.
- **Code style:** TypeScript strict holds (no `any`, no suppressions, no type casts); classes are Tailwind tokens only; semicolons are present. Lines in the `perf/*.spec.ts` predicates go over 100 characters, but Biome only checks `app/**`.

### Good Practices Found
- The shared helper (`studio-soft-disabled.ts`) deliberately does **not** set `onClick` itself, so a later `onClick` prop can't silently override the guard.
- SDU4 confirms the guard checks the page at click time.
- The order of the tooltip reasons matches the order in which `addSourceToActiveTrack` refuses (no sound, failed, loading, not an audio track), so the tooltip never contradicts the status line.
- Wrapping the Metronome label in a `<span>` lets the child-only fading work on it.
- With no target selected, Delete's screen-reader name is now plain "Delete".
- The test that checks the source files uses a regex that skips the `aria-disabled:` prefix, so it doesn't count false matches.

### Architecture note
- **Signal 2 (owner/coupling change)** — `app/components/arrangement/studio-soft-disabled.ts:1-31`: the helper moved out of `ArrangementTransport` and is now used by three components. → **Keep it.** The helper is pure, has no state or lifecycle, and doesn't touch audio timing, Undo/Redo or the public `useArrangement()` hook.
- **Signal 3 (the same region changed repeatedly at high cost)** — the soft-disabled styling was changed in rounds 276, 277 and 278. Each time, exact Tailwind class assertions had to be rewritten in five or more test files (`metronome-ui`, `library-row-strings-ui`, `mode-toggle-colour-ui`, `drag-feedback-colour-ui`, `self-disabling-focus`). → **Proposal for the planner (not for this round):** one bounded task to decide whether those class assertions should come from one shared list exported next to the helper (for example `SOFT_DISABLED_SURFACE_TOKENS`). The next styling change would then edit one place. Done means the tests use that list and the current behaviour checks don't change.

### Alternative Approach (critical logic: what a click does on an unavailable button)
- **Current:** one shared guard checks `aria-disabled` at click time, and each component chooses whether to block focus on mousedown (Metronome doesn't, Preview and Add do).
- **Alternative:** each component checks its own state (`canAdd`, `isReady`, `tempoBpm`) inside the click handler instead of reading the page.
- **Verdict:** keep the current approach. Reading the page at click time is what makes the Metronome work when a typed BPM saves between mousedown and click. A check based on component state would use the value from the last render and could block that click, unless every handler read live values from refs.

### Score: 9/10