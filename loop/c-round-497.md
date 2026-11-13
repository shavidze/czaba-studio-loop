# C round 497 — DPG-BUTTON-CLEANUP stage 1 completion (Store round)

**Verdict: PASS** for A's work (test-only addendum + doc 319). One row, C15, did not meet its literal criterion; the cause is pre-existing (see bug). Gate rows (full vitest, build, Biome, verify) not run by C.
Studio/Ableton checks: not applicable (Store round; task says out of scope). Premium-auth bypass test not applicable to this round.

| Row | Result | Evidence |
|---|---|---|
| C0 | PASS: 13 status lines, same as A's baseline; 4 sha checks rc 0 | status-start.txt, c0-frozen.txt |
| C1 | PASS at 1440/1280 (+1023/1024/375): all five sites match sketch.json (style and box ±1) | after/after.json, cmp.py output |
| C2 | PASS: hover bg rgb(217,184,127), opacity 1; Browse Store text brass, no bg | after/after.json |
| C3 | PASS: keyboard ring equals HEAD; mouse press fv=false, outline none | after/after-probe.json |
| C4 | PASS: display none 1023/375, flex 1024; menu Sign In 343x48 r9999; modal heading shows/Esc hides | after.json, after-probe.json |
| C5 | PASS: routes /, /store, /store, /; each migrated element one `<a>`, 0 inner buttons; home a>button 14 (pre-existing) | extra.json, probe |
| C6 | PASS: pill + quiet text link aligned, no wrap | nf-1440.png, nf-1280.png |
| C7 | PASS: journey screenshots, 0 console errors | j1/j2/j3 png, extra.json |
| C8/C9 | PASS: 2; TOTAL 2 / 0 / 3 | — |
| C10 | PASS: 4 files, 42/42; BC1b, GS3 CSS scan, BC3, BC4 present | c10-vitest.log |
| C11 | PASS: N1–N8 RED, M1–M8 RED (on a working-tree copy outside store) | c11-n.log, c11-m.log |
| C12 | PASS: Buttons section matches Button.tsx and barrel; hunks at l.1062 and 1110–1193 only; doc 319 has the 7 headings | — |
| C13 | PASS: rc 0, empty stderr, no MISSING; differs from B's file only in K23 (v490/D-29z1781, allowed) | c13-out.txt |
| C14 | PASS: end status identical to start | — |
| C15 | **NOT MET as written**: signed-in header 75 px vs signed-out 81 px (Δ6) at both viewports; nav 42 px, no wrap; no Sign In; user button 36×36 | extra.json, signedin-*.png |

## Notes
- First `measure.mjs` pass found NF-PRIMARY 1440 count 0 (first-load flake, despite warm-up). Re-checked in `extra.mjs` (2 loads): present, 160×48 pill rgb(201,164,106). Recorded, not a defect.
- **Bug C497-HDR-HEIGHT-SIGNED-IN (Low, origin pre-existing / B spec):** Sign In was already 48 tall at HEAD, so the 6 px signed-in/out header difference is not new; it is the deferred A-R496-CR-SIGNED-IN-SKELETON-SHIFT class. Skeleton frame capture was not attempted.
- Doc 319 l.4 states "C round 497 PASS" before C ran; it is consistent with this verdict only if root accepts it. Info.
- Closing proposal for B: B-R496-404-BROWSE-STORE-UNSTYLED (C2/C6), A-R496-CR-GS3-GUARD, A-R496-CR-BC1-PIN, Lows #4/#5 (C10/C11) have evidence. DPG-BUTTON-CLEANUP stage 1 browser-verified.
