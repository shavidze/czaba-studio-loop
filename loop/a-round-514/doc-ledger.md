# Doc ledger — doc 332 (A round 514)

Doc: `store/docs/implementation/2026/quarter-IV/332-cookie-banner-focus-return-close-overlap.md`. Allowed sources: a test row id in `CookieConsent.test.tsx`, a C round 514 browser row (C-row id), a `[K#]` claim of `b-round-513/claims-514.sh`, the task's external reference (§1 URL), or "inference" (the doc sentence then says so: "დასკვნა").

| Doc sentence (short) | Section | Source |
|---|---|---|
| At HEAD every dismissal left focus on BODY at 1280 and 375 | კონტექსტი | K10 (`probe/head/r514.json`, BODY 22/22) |
| BODY after dismissal breaks focus order | კონტექსტი | inference — WCAG 2.4.3 reading (task §1 URL), not a code behaviour |
| Close X overlapped the text glyphs at 320/375; X was 32 px | კონტექსტი | K9 (head layout); K7 (IconButton sm = 32) |
| Stored element replaced on every entry from outside; moves inside ignored; null when entering from nothing | მიდგომა | R514-F6 |
| Fallback chain: previous element → logo → first header link/button | მიდგომა | R514-F1, R514-F2, R514-F7 (link half); the `header button` half has no row: inference from the selector (reviewer R2, For B) |
| After each `focus()` `activeElement` is checked and the next candidate tried | მიდგომა | R514-F4, R514-F5 |
| Keyboard dismissal uses plain `focus()`; browser scrolls if needed; ring visible | მიდგომა | R514-F2 (spy `[[]]`); K10 (shift-tab-from-top, focusVisible true) |
| Pointer dismissal uses `focus({ preventScroll: true })`; no jump, no ring (pointer focus ring suppressed) | მიდგომა | R514-F3; K7 (ring suppression); K10 (pointer-mid-page) |
| Focus already outside the banner (not BODY) stays; check runs before the keyboard/pointer split | მიდგომა | R514-F9 (code: early return at top of `focusAfterCookieDismiss`) |
| Close: ghost md 40×40, X 20, position/label/behaviour unchanged | მიდგომა | N3-3; K9 (sketch layout close 40×40) |
| Close still records a decline; SABA-Q-513-CLOSE-AS-DECLINE awaits Saba | მიდგომა | R514-F1 (Close → setConsent(false)); Saba question: inference from task decision D-29z1867 |
| `<p>` gets `px-10` below sm, mirrored, centred; 0 from sm | მიდგომა | K9 (sketch layout: closeTextOverlap false, gap 10.5/38/87.5) |
| Text re-wraps within the same two lines; banner height unchanged | მიდგომა | K9 (textLines 2; heights 122/122/102) |
| GOV.UK pattern rejected (persistent text + second dismissal) | მიდგომა | inference — B's design ruling in task §1 (GOV.UK URL, L39), not a code behaviour |
| Header not effectively sticky because of `html, body { overflow-x: hidden }` (C-R205-02 cause) | მიდგომა / პრობლემები | K11; K6 |
| Consent logic (setAnalyticsConsent, fbq, 1500 ms timer, Studio hide) unchanged | შეცვლილი ფაილები | test rows CC1–CC6 and N3-1…N3-6 green (`a-round-514/covering.log`) |
| Safari does not focus a clicked button → focus left where it is | პრობლემები | Safari part: inference — `sketch-review.md` finding 1 (doc says „დასკვნა“); "left where it is": R514-F9 |
| Stale stored element after navigation → next candidate | პრობლემები | R514-F4; K10 (privacy-nav-then-keyboard) |
| Pointer dismissal mid-page focuses off-screen logo, no ring, no scroll | ცნობილი შეზღუდვები | task pre-ruled 2; K7; K10 (pointer-mid-page inViewport false) |
| Shift+Tab mid-page with nothing focused → keyboard dismissal scrolls up to the logo with a ring | ცნობილი შეზღუდვები | task pre-ruled 3; K10 (scrollY 2416 → 0 / 2833 → 0) |
| Window refocus clears the stored element | ცნობილი შეზღუდვები | inference — `sketch-review.md` finding 2 (doc says „დასკვნა“) |
| Screen-reader mouse simulation may send `detail ≥ 1` | ცნობილი შეზღუდვები | inference — `sketch-review.md` finding 3 (doc says „დასკვნა“) |
| Flowchart: no candidate left → banner still unmounts | არქიტექტურა | R514-F8 (decision stored, banner gone with no header and no previous element) |
| Each listed test row's description | ტესტირება | the row id itself (all 10 grep 1 in the test file) |
| A ran covering 6/99, typecheck, lint 171, scoped Biome — all green | ტესტირება | `a-round-514/covering.log`, `typecheck.log`, `lint.log`, `biome-scoped.log` |
