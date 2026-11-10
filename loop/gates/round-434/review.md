COMMIT: OK

I reviewed the diff, `Modal.tsx`, the new test and the implementation doc. I did not re-run the verify log or a browser. For the real-browser claims I relied on the doc's Chromium probe table.

## Findings (none blocking)

1. **Low — `app/components/ui/Modal.tsx:56,113`.** `scrollbarClassName` replaces the default skin instead of adding to it.
   - An empty string `''` removes the skin entirely, and a `className` with spaces is passed through as is.
   - The doc records this behaviour (point 6). The only callers pass either nothing or the constant.
   - Fix, if you want it: add a short type-level note in the doc. No code change is needed for this commit.

2. **Low — `studio-dialog-scrollbar.test.tsx:11-13,99-121`.** DS4 is a source-text scan that reads files from disk with `process.cwd()`.
   - It only covers top-level `.tsx` files in `app/components/arrangement`. A Modal added in a subfolder or in `studio/` would not be flagged.
   - It also breaks if the prop is renamed or written through a variable.
   - The doc names this as deliberate scope (point 7).
   - Fix: when the ARCH checkpoint runs, replace the scan with a render-level test of a shared `StudioDialog` wrapper.

3. **Low — Firefox shows the OS scrollbar.** `::-webkit-scrollbar` rules don't apply there, so Studio dialogs fall back to the default bar.
   - This is already tracked as TLM-SABA-B-12-FIREFOX-SAFARI, with a deadline of RETRO 435.
   - Nothing to fix in this commit.

## What I checked

- **Event ordering, timers, listeners:** the diff adds none. Only class strings change, and `Modal` does not gain an effect, ref or state.
- **Render cost:** `STUDIO_DIALOG_SCROLLBAR_CLASS` and `STUDIO_SCROLLBAR_CLASS` are module-level constants, so there is no per-render work. `Modal` joins one more array entry.
- **Existing flows:**
  - `ConfirmDialog` and the legacy `studio/ExportDialog.tsx` don't pass the prop, so they keep `styled-scrollbar`. DS1 and DS4 cover this.
  - `STUDIO_SCROLLBAR_CLASS` is unchanged (`[scrollbar-gutter:stable]` plus the same tokens). DS3 pins the exact string, and `detail-panel-reason.test.tsx` and `affordance-colour-ui.test.tsx` still consume it.
- **Tailwind and tokens:**
  - Only existing tokens are used (`surface`, `dim`, `foreground`). There is no custom CSS and no hardcoded colour.
  - The constants sit in `app/`, so Tailwind's class scan picks them up.
  - The doc says unlayered `.styled-scrollbar` beats the layered utilities, which is why the class is removed instead of overridden.
- **Accessibility:**
  - Focus, roles and `aria-labelledby` are untouched.
  - The doc reports thumb contrast of 5.38:1, and 14.78:1 on hover, against the 3:1 minimum in WCAG 1.4.11. That is better than the old teal bar at 2.60:1.
- **TS strict:** no `any`, no `@ts-ignore`, no assertions in the production code. The test uses an `instanceof` guard.
- **Auth, purchase, download:** no files touched. The only store-side consumer of `Modal` is the cart delete confirmation, and its default is unchanged.
- **Process:** the implementation doc `282-…` exists and follows the required structure.

## Architecture note

- **Signal:** `ui/Modal.tsx:33,56,113`, `studio-scrollbar.ts`, plus the DS4 scan. The shared store `Modal` now has a Studio-specific skin prop, and the `studio-*.ts` class-constant modules keep growing.
  - **Keep, because:** this is one optional prop with an unchanged default, and no state or lifecycle moved.
  - **Proposal:** the doc already points to ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS. A bounded planner task would be to decide whether a thin `StudioDialog` wrapper in `components/arrangement` should own the skin prop and replace the DS4 source scan with a render test.
  - **Cost and invariants:** low to medium cost. It should not touch audio timing, refs, Undo/Redo or the public hook shape.
  - This is a review of the diff only, not an audit of the module.

Score: 9/10