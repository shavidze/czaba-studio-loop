# Doc-ledger template for doc 332 (A fills it as `a-round-514/doc-ledger.md`)

Each behaviour sentence A writes in `docs/implementation/2026/quarter-IV/332-cookie-banner-focus-return-close-overlap.md` gets one row. Allowed sources: a test row id that exists in `app/components/common/__tests__/CookieConsent.test.tsx`, a browser row of C round 514 (C-row id), a `[K#]` claim of `b-round-513/claims-514.sh`, or "inference" (then the sentence says so).

| Doc sentence (short) | Source |
|---|---|
| Keyboard dismissal returns focus to the element focused before the banner | R514-F1; K10 (probe tab-from-before-banner → "Cookie Policy", ring) |
| Nothing focused before → header logo, scrolled into view, ring visible | R514-F2; K10 (shift-tab-from-top) |
| Pointer dismissal uses preventScroll; no ring | R514-F3; K10 (pointer-mid-page scrollY unchanged, focusVisible false) |
| Stale or unfocusable previous element falls back to the logo | R514-F4, R514-F5; K10 (privacy-nav-then-keyboard) |
| Each entry from outside replaces the stored element | R514-F6 |
| Fallback chain logo → first header link | R514-F7 |
| No header: decision stored, banner unmounts | R514-F8 |
| Pointer click with focus already outside the banner leaves it there | R514-F9 |
| Close is IconButton ghost md 40 px, X 20, `sm:hidden` | N3-3; K9 |
| Text gets px-10 below sm; no overlap at 320/375/639; 1280/1440 equal HEAD | K9 |
| Known limits: window refocus clears the stored element; screen-reader mouse simulation may get preventScroll | sketch-review.md findings 2, 3 (inference) |
| Header is not effectively sticky (C-R205-02 cause) | K11 |
