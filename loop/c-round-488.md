# C round 488 — PASS (browserVerified true)

B-R486-PROFILE-NAME-KEYBOARD fix-up, C-R487-01. Playwright/Chromium on the dev server at 1440×900 and 1280×720; stubbed profile API, so the client path only (L36). No bugs found; source untouched.

| Row | Result |
|---|---|
| C-SCOPE | PASS — claims start == end; K1-K4 = planning output; K12 2 of 2; K14 L58 OK (c-round-488/claims-start.txt, claims-end.txt) |
| C-APPLY | PASS — K12 sketch-files-equal-store 2 of 2 |
| IF-PASSWORD | PASS — click-password 200/500 x 2 viewports: modal open before/after, final BUTTON||Click to change password, 1 PUT, editor closed on 200 / open on 500 (inflight.json); r487 tree differed (name button / First name) per B's probe |
| IF-PASSWORD-NOFOCUS | PASS — emulated Safari model (Chromium, not real Safari): final BODY, not name button / First name, modal open, 1 PUT. BODY is record only |
| IF-TABAWAY | PASS — tab-away: BUTTON||Click to change password|fv=true, 1 PUT, closed on 200 / open on 500 |
| IF-STAY | PASS — stay-enter: name button(200)/First name(500), fv true; stay-mouse same with fv=false on 200; never BODY final |
| IF-LEAVE | PASS — orders-tab: /account/orders, BODY as r487 (unchanged, round 485 contract) |
| IF-OVERLAYS | PASS — Search keeps focus in its own INPUT; menu results record-only; overlays.json == B's overlays-sketch.json |
| IF-REPLAY | PASS — focus-steal-replay: all 4 runs afterSettle=Click to change password, modal open, 1 PUT |
| PN-REG | PASS — profile-probe named + extra-487: 0 diffs vs c-round-487 and vs B v3 sketch values |
| PN-UNIT | PASS — 82 tests/5 files pass, 18 PN tests; 24 mutants identical red-sets to B summary (mutants.log) |
| DOC | PASS — l.4 exact; focus rows, C-R487-01 Problem->Solution exist; every cited PN id exists in test file |
| G488-AUTH | PASS — fresh context no creds, both viewports: /account Sign in required, 0 Full Name; /studio-lab demo, auth_user null; /studio/middle-east Sign in required, 0 audio[src] |
| OWN-BACKEND | BLOCKED — backend unavailable in cloud (not in passed) |
| gate | root gate only (full vitest, typecheck, build, Biome, verify); not claimed |

## Caveats
- IF-PASSWORD-NOFOCUS is an emulation of the Safari/Firefox-mac mouse model in Chromium, not a Safari check; real WebKit/Firefox-mac stays in SAFARI-CHECKS.
- Pre-existing and already scheduled: PasswordModal has no dialog semantics (B-R488-PASSWORD-MODAL-DIALOG, round 491); non-modal menus still get the restore under the Safari model (Low B-R488-SAFARI-MENU-SETTLE-FOCUS).
- A first probe run timed out on a cold Vite compile of /account; replaced once after warming (L38), then all runs were valid (`envInvalid` unset).

Evidence: `c-round-488/` (inflight.json, overlays.json, replay.json, named.json, extra.json, auth.json, mutants.log, covering.log, claims-*.txt, screenshots).
