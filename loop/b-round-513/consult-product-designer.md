# product-designer consult — round 514 cookie banner (B round 513 planning)

Read-only consults, transcribed by B from the agent's final answers. The agent wrote no files. Baseline HEAD 4c85587.

## Consult 1: first ruling, option (b)
- **Focus:** on every dismissal, focus the header logo `header a[href="/"]` with `preventScroll: true`. Fall back to the first `header a, header button`. Never leave focus on BODY.
- **Premise:** Header.tsx l.69 is `sticky top-0`, so the logo is always on screen. Header and banner render on the same routes (root.tsx).
- **Rejected:**
  - (a) restoring the previous element: the target can be off-screen, and there is no invoker;
  - (c) the GOV.UK confirmation message: it adds persistent text and a second dismissal step (https://design-system.service.gov.uk/components/cookie-banner/).
- **Overlap:**
  - The Close X becomes `IconButton size="md"` (40 px, X 20). The `<p>` gets `px-10 sm:px-0`, so the padding is mirrored and the text stays centred. 1280/1440 are unchanged because the X is `sm:hidden`.
  - 40 px is above the WCAG 2.5.8 AA minimum (24 px); 44 px is AAA/HIG. Moving the X into the button row was rejected (three equal buttons, and Close would compete with Decline).
- **Low:** "Close" silently records a decline. Saba question; default keep.

## B measurement that refuted the premise
- `probe/sticky.mjs` on HEAD :5175: header `position: sticky`, but `top = -1500` at `scrollY 1500`.
- **Cause:** `app/styles/app.css` l.269–272 `html, body { overflow-x: hidden }` (known Low C-R205-02).
- On the option-(b) sketch, a keyboard dismissal at `scrollY 4043` focused an off-screen logo (`inViewport false`), so the ring could not be seen.

## Consult 2: revised ruling, approved
- **Approved:** focus returns to the element focused just before focus entered the banner, else the header logo, else the first `header a[href], header button`.
  - Keyboard activation (`click.detail === 0`): `focus()`. The browser scrolls only if needed, and the ring is visible.
  - Pointer (`detail ≥ 1`): `focus({ preventScroll: true })`, with no jump and no ring.
- **Conditions:**
  1. Overwrite the stored element on every entry from outside; ignore moves inside the banner.
  2. After each `focus()`, check `document.activeElement` and fall through if focus did not land (hidden or disabled target).
  3. Acceptance row: Privacy link navigates, then a keyboard dismissal goes to the logo with the ring.
- **Accepted trade-off:** Shift+Tab from a never-focused mid-page state scrolls to the logo at the top. A visible ring at a known place beats keeping the position with invisible focus. Focusing the last footer link instead was rejected (it jumps too, and it is a dead end).
- Close md 40 px + `px-10 sm:px-0` unchanged.

## Acceptance rows proposed (folded into the task's C rows)
- Keyboard Enter on Decline/Accept at 1280: the focused element has a visible ring, and `scrollY` is unchanged.
- Pointer click: no ring, no scroll.
- Tap the X at 375: consent false, no ring, no scroll.
- Keyboard Close at 375: ring visible.
- 320/375/639: the X box does not intersect the text; the X is 40×40.
- 1280/1440: the banner equals HEAD.
- `/studio*`: no banner.
- Privacy navigation, then keyboard dismissal: logo with ring.
