# Doc ledger: doc 331 (`docs/implementation/2026/quarter-IV/331-dpg-nonbrand-stage-n3-cookie-banner.md`)

Filled from `b-round-512/doc-ledger-template.md`. One source per behaviour sentence. Test row ids exist in `app/components/common/__tests__/CookieConsent.test.tsx` (`grep -n "N3-[1-6]\|CC[1-6]"`). `[K#]` = `b-round-512/claims-513.sh`. C-rows = C round 513.

| Doc sentence (short) | Section | Source |
|---|---|---|
| DPG-FIX P1 item 7 asks for one Button system on Store | კონტექსტი | agent-workflow.md "DPG-FIX block", P1 item 7 (DPG-BUTTON-CLEANUP) |
| N1 (doc 328) moved the audio player, N2 (doc 330) the purchase card | კონტექსტი | `ls docs/implementation/2026/quarter-IV/` (328, 330 exist); doc 330 l.1, l.4 |
| N3 is the cookie banner in `CookieConsent.tsx`, in the page's bottom bar | კონტექსტი | task §1 ("CZABA keeps a slim bottom bar"); K5; K17 crops |
| Banner shows on Store pages when GA4 is configured and no decision exists | კონტექსტი | K7; CC1, CC5 |
| HEAD had three raw `<button>`: Accept white pill `bg-white text-black`, Decline plain `text-muted` text, Close `text-dim` | კონტექსტი | K5 (`git show cbc5709:app/components/common/CookieConsent.tsx`) |
| The EDPB taskforce report, as summarised by the consult (PDF not checked), counts this asymmetry as highlighting accept | კონტექსტი | task §1 reference; `b-round-512/consult-product-designer.md` (the doc sentence states the summary origin) |
| Decline: `Button` secondary sm pill | მიდგომა | N3-1; K17 |
| Accept: the same `Button`, identical classes; equal weight | მიდგომა | N3-1; C1 (C round 513) |
| Close: `IconButton` ghost sm, label "Close", `absolute top-2 right-2 sm:hidden`, X 16 px | მიდგომა | N3-3; K17 |
| Equal weight is the default sent to Saba (D-29z1862); SABA-Q-507-COOKIE-WEIGHT open; variant is one prop | მიდგომა | D-29z1862; `b-round-512/consult-product-designer.md` |
| Consent logic unchanged: `setAnalyticsConsent`, `fbq`, 1500 ms timer, Studio-route hide | მიდგომა | CC1 (1500 ms), CC2/CC3/CC4b (Studio hide), CC5 (decisions), N3-6 (fbq) |
| Root `div` and text unchanged | მიდგომა | CC1 (root class); `git diff cbc5709` (only button sites change) |
| Flow diagram: Decline and Close → handleDecline → denied; Accept → granted + fbq | არქიტექტურა | N3-4, N3-6, CC5 |
| Changed files: product file, test file, this doc | შეცვლილი ფაილები | `git status --short` (a-round-513.md) |
| Accept/Decline both secondary sm pill with identical classes | პრობლემები | N3-1 |
| No raw `<button>` and no white/black/neutral classes left | პრობლემები | N3-5; C8 grep |
| Biome `useButtonType` warnings leave the file; lint 174 → 171 | პრობლემები | K9; `a-round-513/lint.log` (171) |
| Close was 34 px with `text-dim`; now IconButton ghost sm 32 px, title "Close" | პრობლემები | K17 (HEAD 34×34, sketch 32×32 at 375); N3-3 |
| `sm:hidden` hides Close from 640 px up | პრობლემები | N3-3 (class); K17 (`display:none` at 1280/1440); task §1 ruling table "Close (below 640 px only)" |
| Focus falls to `body` after dismissal, same as HEAD (B-R512-COOKIE-DISMISS-FOCUS-LOST) | პრობლემები | K17; C4 record |
| At 375 the Close X covers the end of "Privacy", same as HEAD (B-R512-COOKIE-CLOSE-OVERLAPS-TEXT) | პრობლემები | D-29z1865 (crops `b-round-512/probe/head/banner-375.png`, `probe/sketch/banner-375.png`); K18 (finding id open); C1 record |
| N3-1…N3-6 row descriptions | ტესტირება | the row names in the test file (N3-1, N3-2, N3-3, N3-4, N3-5, N3-6) |
| CC1–CC6 green; covering 6 files, 88 tests rc 0 | ტესტირება | `a-round-513/covering.log` |
| Browser checks are C round 513 rows | ტესტირება | task §4 C1–C5 |
| Round 514 / SABA-Q / N4–N9 next steps | TODO | task §6 |
