# tech-lead sketch review — round 514 (B round 513 planning)

Read-only review, transcribed by B from the agent's final answer. The agent wrote no files. It reviewed the patch with sha `7198926a…`; B then applied changes 1, 4 and 5 below. The dispatched patch is `sketch-514.patch.txt`, sha256 `e6e5f1dc8e1b1e540855dfe84d968987b28eb3356568df2d3d30446cdf075fc8`. B re-ran the mutants, covering, lint, scanner, rows-on-HEAD and the browser probe on it.

**Verdict: approve-with-changes.** Nothing Medium+ blocks dispatch.

## Confirmed
- **Keyboard detection:** `click.detail === 0` for Enter or Space on a `<button>` in Chromium, Firefox and Safari.
- **Order:** focus moves before `setIsVisible(false)`, and leaving the banner does not re-fire its `onFocus`.
- **React `onFocus`** is focusin-driven and bubbles, so `relatedTarget` is available. The `contains` check ignores moves inside the banner.
- **Remix navigation:** a stale stored element fails `focus()`, the `activeElement` check catches it, and focus falls back to the logo.
- **Fallback order:** the site header (Header.tsx:69/71) comes before `<Outlet/>` (root.tsx:143), so route `<header>`s never win. The banner and the Header share the `/studio` condition.
- **Tests:** F1–F7 are red on HEAD, each of the 14 mutants turns a row red, the spies are compared exactly, F8 is labelled honestly, and no new row selects by styling class.

## Findings and B's rulings
| # | Sev | Finding | B ruling |
|---|---|---|---|
| 1 | Low | Safari does not focus a clicked button, so a pointer click can pull focus from an outside element B back to an old stored A | **Applied:** if `document.activeElement` is outside the banner and not BODY, focus is left there (banner ref). New row R514-F9, mutant M15 |
| 2 | Low | A window refocus fires focusin with `relatedTarget` null and overwrites the stored element | Accepted limitation (the ruling is "overwrite on every entry"). It is stated in the doc as known |
| 3 | Low | Screen-reader mouse simulation may send `detail ≥ 1`, so it gets `preventScroll` and no ring | Accepted. The doc names it |
| 4 | Low | `querySelector<HTMLElement>` narrows without a check | **Applied:** `querySelector(selector)` plus an `instanceof HTMLElement` guard (mutant M9) |
| 5 | Nit | `FocusEvent`/`MouseEvent` imports shadow the DOM globals | **Applied:** aliased `ReactFocusEvent` / `ReactMouseEvent` |
| 6 | Nit | The second fallback tries only the first match | Not changed: the logo always comes first in Header |
| 7 | Nit | Existing JSX comments and inline style are kept | Pre-existing (A-R183-COOKIE-INLINE-GRADIENT) |

**Architecture note:** keep `focusAfterCookieDismiss` in `CookieConsent.tsx`. Extract a shared `restoreFocusAfterDismiss` only when a second non-modal surface needs it. Recorded with SIG-R513-COOKIE-FOCUS-GROWTH.
