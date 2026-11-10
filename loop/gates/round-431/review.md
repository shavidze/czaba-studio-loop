COMMIT: OK

I read the diff, the new files, and the CSS tokens and global styles they depend on. I did not run a browser, so the browser-only points below rest on the doc's Chromium probe logs, which I did not open.

**Scope:** The change touches only the Export dialog's radio styling, one new class constant, and tests and docs. There is no auth, purchase, download, API, or audio code. Export logic, handlers, `name`, `checked`/`disabled`, aria ids and testids are unchanged. The Video radio gains only the class.

**Tokens:** `outline-strong`, `brand`, `brand-hover` and `brand-foreground` all exist in `app/styles/app.css:60-65`. There are no hardcoded colours and no custom CSS. No `any`, assertions or suppressions were added.

**Event ordering and leaks:** No effects, listeners or timers were added. The change is class strings only, with no re-render cost. The native `<input>` stays focusable and keeps its arrow-key cycle. The global `:focus-visible` ring (`app.css:385`) still applies, and it is suppressed on pointer press by `html[data-focus-source="pointer"]` (`app.css:390`), as the doc says.

**Accessibility:** The checked state differs by shape as well as colour: a 4px ring with a dark centre versus a 1px empty ring. The doc gives contrast figures from its probe: 3.5:1 for the unchecked ring, 6.74:1 for the checked ring. `forced-colors:appearance-auto` restores the system radio. Disabled radios use `opacity-50` on top of the card's `text-dim`, which is acceptable for disabled controls.

## Findings, ranked

1. **Low, `app/components/arrangement/ArrangementExportDialog.tsx:379-385`.** The Video radio is disabled and never checked, so it shows the empty ring at 50% opacity. This matches the doc. Fix: none needed.
2. **Low, `app/lib/arrangement/__tests__/studio-radio.test.ts:8,60`.** The RD2 source scan uses regexes, and the doc already records the gaps. It misses `<input … />` with a `>` inside an attribute expression, spreads that come after a literal `type`, and `datetime-local`. This is an acknowledged guard limit, not a regression. Fix: if a second radio owner appears, switch to an AST check or extend the list.
3. **Low, `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx:154`.** The tests count the literal string `className={STUDIO_RADIO_CLASS}` in the source, so a formatting change would break them without a behaviour change. This follows the existing pattern in these files. Fix: none needed.
4. **Info, `studio-radio.ts` and `app.css:313`.** The global unlayered `input { transition … }` rule includes `border-color`, so the ring colour fades over 150 ms on hover and check. `border-width` is not transitioned, so the 1px to 4px switch is instant. This is a minor visual inconsistency that is already documented as accepted (TL-R431-01).
5. **Info.** Firefox and Safari are unverified. They are tracked as TLM-SABA-B-12-FIREFOX-SAFARI with a deadline of RETRO 435.

## Architecture note

- Signal: none in this diff. `studio-radio.ts:1` is a single-purpose constant that follows the existing `studio-fader.ts` pattern, and `ArrangementExportDialog.tsx` only consumes it.
- One proposal for the planner, not a fix for this round: `app/components/recordings/SfxSceneExport.tsx` still uses native radios, which already has its own ticket (TL-R430-10). If a third styled-control family follows (`<progress>`, `<select>`), consider one bounded task to move these `studio-*.ts` class constants into a single `studio-controls` module, with the RD2 scan extended to cover it. Keep the current layout until then. Two constants don't justify the move.

This is a diff review only. I did not audit the whole module.