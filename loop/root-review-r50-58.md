# Root (Claude) pre-push review — rounds 50–58 → commit cb12805 (2026-10-18)

Gate: 26 real paths vs 038ed5a (336 other paths differ only by CRLF and are not committed); cloud `npm run verify` rc 0, 88 files / 1529 tests; independent code-reviewer **COMMIT: OK**, 8/10, no Critical/High/Medium.

Low findings for B (schedule; none blocks):
1. StudioWorkspace.tsx ~881-893: vertical user scroll during Follow playback does not close the grid menu (guard checks scrollLeft only). Fix: record scrollTop at open; close on change.
2. ArrangementGridMenu.tsx ~27-53: armed click-swallow can eat a later keyboard click if the dismissing pointerup was lost (Alt-Tab while held). Fix: also release on capture `keydown` and window `blur`.
3. ArrangementGridMenu.tsx ~147-156: right-click on the menu itself shows the native context menu. Fix: `onContextMenu` preventDefault on the menu root.
4. grid-snap-menu.test.tsx ~272-275: rightClick() leaves the window swallow armed between tests (order-dependent). Fix: afterEach releases it, or rightClick follows with pointerUp + macrotask.
5. (later) duplicate Follow auto-scroll predicate StudioWorkspace.tsx ~884-889 vs ~913-921 → one pure helper.
Info: M6 reposition is reached in real browsers via pointerdown→close→contextmenu→remount (tests use bare contextmenu) — cover in MN-REPOSITION browser probe.
Architecture note (proposal only): extract `useArrangementGridMenu(...)` + shared `isFollowAutoScroll` in one bounded task; keep for now.
Browser probes still required: MN-DISMISS-BUTTON, MN-REPOSITION, MN-FOLLOW, G-3 purchase protection (servers :5173/:5199 down since round 52 — root environment).
