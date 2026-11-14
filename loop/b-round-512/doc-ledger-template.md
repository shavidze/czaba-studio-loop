# Doc-ledger template for doc 331 (A fills it as `a-round-513/doc-ledger.md`)

Each behaviour sentence A writes in `docs/implementation/2026/quarter-IV/331-dpg-nonbrand-stage-n3-cookie-banner.md` gets one row. Allowed sources: a test row id that exists in `app/components/common/__tests__/CookieConsent.test.tsx`, a browser row of C round 513 (C-row id), a `[K#]` claim of `b-round-512/claims-513.sh`, or "inference" (then the sentence says so).

| Doc sentence (short) | Source |
|---|---|
| Decline and Accept are `Button` secondary sm pill with identical classes | N3-1; K17 |
| Order Decline, Accept, Close | N3-2 |
| Close is IconButton ghost sm, `sm:hidden`, X 16, title "Close" | N3-3; K17 (32×32 at 375, `display:none` at 1280/1440) |
| Close declines consent | N3-4; CC5 |
| No raw `<button>`, no white/black/neutral classes | N3-5; K5 |
| Accept alone calls fbq consent grant + PageView | N3-6 |
| Lint 174 → 171 (useButtonType hits gone) | K9 |
| Equal weight is the default while SABA-Q-507-COOKIE-WEIGHT is open | consult-product-designer.md; D-29z1862 |
| Focus after dismissal unchanged (body), tracked as B-R512-COOKIE-DISMISS-FOCUS-LOST | K17 |
