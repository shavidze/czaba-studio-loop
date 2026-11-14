# product-designer consult — NONBRAND N3 (cookie banner), B round 512 planning

Read-only consult on the product-only sketch `sketch-513-cookieconsent.patch.txt` (sha256 9d2764b6a150918a006c704432df159aad56c4dac12c0fc2b866d9294efc0622). That file was later folded, byte-identical in its CookieConsent.tsx hunk, into the dispatched `b-round-512/sketch-513.patch.txt` (sha256 cd99584499de805a5b7c554b0b6308de458ebff94f5056e4dde9ce87a7ef81d8, which adds the test rows) and deleted. The product file of both equals `r513-post-sketch-sha.txt`. B's transcription of the agent's final answer; the agent wrote no files.

## Verdict: approve the sketch as written. No Medium+ defect is introduced.

| Control | Verdict | Note |
|---|---|---|
| Decline | approve: secondary / sm / pill | text-only → filled pill, normal → semibold; same weight as Accept (the point) |
| Accept | approve: same props | removes hardcoded `bg-white` / `text-black` / `neutral-100` |
| Order | keep Decline, then Accept | HEAD order; "reject left, accept right" |
| Close X | approve: IconButton ghost / sm | 32 px vs 34 px fine on a corner target; `text-muted` #a39b8e is lighter than `text-dim` #928a7d (slightly better contrast); "Close" tooltip only on mobile. Optional Saba question: aria-label "Decline and close" (default keep "Close") |

## States C verifies in the browser
- Rest at 375 / 1280 / 1440: both pills identical (fill, border, text colour, height); X only below 640 px.
- Hover: secondary hover bg-elevated #1d1a17 → bg-outline #24211e; very faint on 95 % black. Record; same for both, no asymmetry.
- Keyboard focus-visible: Tab order Privacy Policy, Decline, Accept, Close (mobile only); global brand outline (app.css focus rule), not clipped by the banner edge or the X.
- Mouse press: pills `active:opacity-90`, X `active:scale-95`; no outline after a pointer press.
- Layout: at 375 the X (8–40 px from the top-right corner) must not cover the end of the centred text; at 1280/1440 the row stays on one line.
- Unmount focus: after Enter on Decline/Accept, record `document.activeElement`. HEAD drops it to body. Baseline, not a regression of this stage.

## Consent-banner practice
Equal weight agrees with the EDPB Cookie Banner Taskforce report (adopted 17 January 2023): it advises against colours/contrast that highlight "accept all" over the other options, and calls a reject button with barely readable contrast "manifestly misleading"; no fixed colour standard. The agent confirmed this from search-result summaries, not from the PDF itself; CNIL not checked.
Sources: https://www.edpb.europa.eu/system/files/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf ; https://www.reedsmith.com/our-insights/blogs/technology-law-dispatch/102k2wk/eu-cookie-banner-taskforce-report-what-you-need-to-know/

## Defects
- None Medium+ introduced by the sketch.
- Low: secondary fill and border (#1d1a17 / #24211e) barely separate from the 95 % black banner; labels still identify the buttons (not a WCAG 1.4.11 failure). Fixing means changing the banner background (deferred root stage); no new token here. → B: B-R512-COOKIE-PILL-LOW-SEPARATION (Low, deferred).
- Medium, already in HEAD, out of scope: focus lost when the banner unmounts. → B: B-R512-COOKIE-DISMISS-FOCUS-LOST.
- B addition (D-29z1865): the 375 crops show the Close X covering the "Privacy" glyphs at HEAD and on the sketch, so this consult's row 2 ("does not cover the text") is pre-existing → B-R512-COOKIE-CLOSE-OVERLAPS-TEXT (Medium, round 514).

## Acceptance rows proposed
1. Keyboard, 1280: Tab to Decline, then Accept → same brand outline, unclipped; computed background, border, font-weight and height identical.
2. Mobile, 375: no consent stored, tap X → X 32×32, does not cover the text; banner closes; consent stored as declined.
3. 1440: no `bg-white`, `text-black`, `neutral-*` classes; X `display: none`; order Decline, Accept.
