# Doc ledger: doc 333 (`docs/implementation/2026/quarter-IV/333-cookie-banner-pointer-field-focus.md`)

Built from `b-round-514/doc-ledger-template.md`. One source per behaviour sentence. The test ids are in `app/components/common/__tests__/CookieConsent.test.tsx` (each grep count is 1; see `a-round-515.md`). `[K#]` = `b-round-514/claims-515.sh`.

| Doc section | Behaviour sentence (short) | Source |
|---|---|---|
| კონტექსტი | At HEAD, a pointer Accept after clicking the email field returned focus to the INPUT; same for the `/hire-us` textarea | K8 (`probe/head/` P1, P3); K7 GATE514-M1 |
| კონტექსტი | On a phone this reopens the on-screen keyboard | inference (gate reviewer finding; sentence says "დასკვნა") |
| კონტექსტი | At HEAD a no-focus pointer click after focus left the banner returned to the stale "Cookie Policy" link | K8 (`probe/head/` P2, simulated) |
| მიდგომა 1 | Pointer/tap dismissal from a keyboard-opening field (text-type input, textarea, contenteditable) skips it; focus goes to the header logo with `preventScroll` | R515-T1 |
| მიდგომა 1 | No ring and unchanged scroll are browser-row facts, not unit-tested | K8 (sketch P1, P3 textarea: `focusVisible` false, scrollY equal); C1 |
| მიდგომა 1 | The selector type list (textarea; contenteditable not "false"; input except checkbox…hidden) | code: `COOKIE_CONSENT_KEYBOARD_FIELD_SELECTOR` in the sketch; K11 (sketch sha) |
| მიდგომა 1 | The typed value is kept | K8 (sketch P3 `value` "abc") |
| მიდგომა 2 | A keyboard dismissal from such a field returns focus to it | R515-T2 |
| მიდგომა 3 | Select, checkbox and `contenteditable="false"` stay returnable after a pointer dismissal, with `preventScroll` | R515-T6; K8 (sketch P3 select) |
| მიდგომა 4 | Focus leaving the banner (to an element or BODY) clears the stored element | R515-T3, R515-T7; K8 (sketch P2, simulated) |
| მიდგომა 4 | Moves between banner controls keep the stored element | R515-T4 (also R514-F6) |
| მიდგომა | Supersedes doc 332's pointer rule only for keyboard-opening fields | inference (D-29z1871, pre-ruled 7) |
| მიდგომა | Separately, `onBlur` clearing applies to any element: after focus left the banner, a pointer dismissal no longer returns even to an ordinary button | R515-T3, R515-T7 (both use a plain button); C-R514-01 |
| მიდგომა | Alternative BODY rejected; product-designer chose the logo | `b-round-514/consult-product-designer.md` |
| არქიტექტურა | Fallback chain: previous → logo → (no logo) first header link/button | R514-F2, R514-F7, R515-T5 |
| შეცვლილი ფაილები | Consent logic unchanged; doc 332 byte-identical | frozen check 1 (rc 0, `a-round-515.md`); C7 |
| შეზღუდვა 1 | Window switch while a banner control is focused → keyboard dismissal goes to the logo (same as HEAD) | inference (`sketch-review.md` finding 1; pre-ruled 1) |
| შეზღუდვა 2 | No header and no previous element → focus on BODY | R514-F8 |
| შეზღუდვა 2 | The header renders on every non-`/studio` route; the banner hides on `/studio*` | K23 |
| შეზღუდვა 3 | After a tap dismissal from a text field, the next Tab starts at the header | inference (product-designer, pre-ruled 3); C1 records one Tab press |
| შეზღუდვა 4 | On-screen keyboard and Safari halves are unverified in the cloud | inference (pre-ruled 4; TLM-R515-PHONE-KEYBOARD, SAFARI-CHECKS) |
| შეზღუდვა 5 | GATE514-L3 / GATE514-L2 deferred | K7; D-29z1870 |
| ტესტირება | each R515-T1…T7 and R514-F8 line | the row id itself (grep count 1) |
| ტესტირება | covering 6 files / 112 tests, typecheck, lint 171, scoped Biome | `a-round-515/covering.log`, `typecheck.log`, `lint.log`, `biome-scoped.log` |
