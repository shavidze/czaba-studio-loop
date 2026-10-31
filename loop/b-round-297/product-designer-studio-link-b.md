# STUDIO-LINK-b design inputs, collected at B round 297 → 298 planning (2026-10-31)

STUDIO-LINK-b moved to round 299 (D-29z760). These inputs are kept so the round-299 planning does not repeat them. Before dispatch, B re-checks every source fact at the new HEAD and adds the claims, the L23/L47/L50 sweeps, the sketch pre-run and the browser probe.

## product-designer (read-only consult, agentId ad2febdf317ed09f2; source reading only, nothing run)
- **Where:** a context menu only; the option's `title` is unchanged.
  - Rejected, tooltip alone: a title cannot hold a link.
  - Rejected, both: "Right-click…" in the title is mouse-only text, it is read as the button's description, and the title already shows the full name of a truncated row.
- **Contents:** one item, "View in store". A one-item menu is the honest scope; "Add to active track" would duplicate Enter and double-click.
- **Unmapped sources:** no custom menu, so the native browser menu stays. Trade-off: right-click differs on 11 of 12 sources. A disabled item was rejected because it teaches a dead end on almost every row.
- **Activation:** a real `<a role="menuitem" href="/products/middle-east" target="_blank" rel="noopener noreferrer">` (Ctrl-click, middle-click, URL preview, no popup blocker).
  - Enter must reach the link's own activation; the marker menu's Enter handler must not intercept it.
  - On activation the menu closes and focus returns to the option. Esc, Tab and outside-click close the menu as ArrangementMarkerMenu does.
  - A new tab is required: `/studio-lab` has no persistence.
- **`?` sheet:** one `library` row, `{ id: 'library-view-in-store', action: 'View in store (new tab)', keys: ['Right-click', 'Shift+F10'] }`. Check the key format against the sheet's other rows.
- **Microcopy:** item "View in store"; menu aria-label `${source.title} options`.
- **gate-296 S4 (`?preview=` changed on a mounted route):** (a) first load only, documented. A fresh arrival from the product page always remounts the route. Side note: Studio → View in store (new tab) → "Try it in the Studio" opens a second, empty Studio. That is a separate decision.
- **States:**
  - mapped idle: unchanged;
  - right-click: the menu opens at the pointer;
  - Shift+F10 or the ContextMenu key: the menu opens at the option;
  - unmapped: native menu;
  - preview playing: playback continues;
  - the search filters the option out while the menu is open: the menu closes;
  - collapsed library: no menu;
  - long title: the aria-label holds the full title;
  - reduced motion: no animation;
  - both viewports;
  - Undo: not applicable.
- **Rows:**
  1. Right-click opens a role=menu with one menuitem.
  2. Click opens /products/middle-east in a new tab; the Studio keeps its clips and the menu closes.
  3. Shift+F10 then Enter does the same as row 2.
  4. Esc closes the menu, focus is on the option, and nothing is added.
  5. An unmapped source gets no custom menu.
  6. The `?` sheet has the row.
  7. The item is an `<a>` with target=_blank and rel containing noopener.
  8. Double-click and Enter still add the clip.
- **Human test (not a loop row):** 5 editors, "find where to buy the Middle East track"; pass = 3 of 5 in under 30 s without being told.

## Advisor flags for the round-299 task (B, 2026-10-31)
- Check `StudioWorkspace.tsx`'s workspace `onContextMenu` at the baseline. If it already calls `preventDefault`, "native menu on unmapped" is false. Probe it with an injected listener that reads `defaultPrevented`.
- Do not retrofit `ArrangementMarkerMenu`: its items are a constant and its Enter handler calls `preventDefault`. Write a minimal library menu with the same pattern, and record the duplication for the frontend-architect checkpoint.
- **L47:** a new tab fires `window` blur, which closes the marker-style menu with reason `'window'` and restores no focus. The menuitem's click must close the menu and refocus the option synchronously. C's row uses `context.waitForEvent('page')` and then reads `activeElement` on the Studio page.
- **L49:** opening the menu selects and focuses the option, so it inherits `selectLibraryOption`'s preview switch. Rule on it.
- Add a reverse map (source → handle) in `studio-lab-links.ts`, with a both-directions consistency test.
- **L23 sweep:** the new `StudioShortcutId`, any test that pins the library group's row count, and `role="menu"`/`menuitem` counts.
- Rule on the shared focus ring on the `<a>` (SABA-B-4).

## Reference (Ableton Live 12 manual, fetched 2026-10-31)
- https://www.ableton.com/en/live-manual/12/working-with-the-browser/ §4.7.3.3 "Working with Splice Samples": "a context menu that allows you to add the sample to Likes or Collections in your library, or view the sample's pack." Where "view the sample's pack" opens is **not stated** (unconfirmed).
- §4.7.7 Current Project: the label's context menu has "Show in Explorer (Win)/Finder (Mac)". §4.7.8 User Folders: "Locate Folder".
- No keyboard way to open a browser context menu is documented, so Shift+F10 and the ContextMenu key are a CZABA accessibility addition, the same convention as the marker menu.
