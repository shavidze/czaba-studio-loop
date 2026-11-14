# Doc-ledger template for doc 333 (A fills it as `a-round-515/doc-ledger.md`)

Each behaviour sentence A writes in `docs/implementation/2026/quarter-IV/333-cookie-banner-pointer-field-focus.md` gets one row. Allowed sources:
- a test row id that exists in `app/components/common/__tests__/CookieConsent.test.tsx`;
- a browser row of C round 515 (C-row id);
- a `[K#]` claim of `b-round-514/claims-515.sh`;
- "inference" (then the sentence says so).

| Doc sentence (short) | Source |
|---|---|
| A pointer/tap dismissal entered from a keyboard-opening field (text-type input, textarea, contenteditable) skips it and focuses the header logo without scrolling or ring | R515-T1; K8 (P1, P3 textarea) |
| A keyboard dismissal still returns to that field | R515-T2 |
| Select, checkbox and contenteditable="false" stay returnable after a pointer dismissal | R515-T6; K8 (P3 select) |
| The typed value is kept | K8 (P3 value "abc") |
| Focus leaving the banner (to another element or BODY) clears the stored element | R515-T3, R515-T7; K8 (P2, simulated) |
| Moves between banner controls keep the stored element | R515-T4, R514-F6 |
| With only a header button, keyboard dismissal focuses it | R515-T5 |
| No header and no previous element: focus ends on BODY (accepted edge) | R514-F8 |
| Window switch while a banner control is focused: return goes to the logo (same as HEAD) | sketch-review.md finding 1 (inference) |
| On-screen keyboard and Safari halves are unverified in the cloud | GATE514-M1 / C-R514-01 manual rows (inference) |
| Doc 332's pointer rule is superseded only for keyboard-opening fields | inference (D-29z1871) |
