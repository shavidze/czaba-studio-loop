# C round 412 — PERF-15b-i fix-up (A-R411-REVIEW-M1) — PASS

Evidence in `c-round-412/`. No source edited. Full machine-readable result: `c-round-412.json`.

| Row | Result | Evidence |
|---|---|---|
| 1/11 scope | PASS | claims start == A end == C end; 12 status lines unchanged; frozen 1300 OK; protected OK |
| 2 patch identity | PASS | 10/10 files cmp-equal to cumulative patch on `git archive HEAD` (`patch-identity.txt`) |
| 3 before-ready (1440, 1280) | PASS | held 96 rects, aria-disabled true, opacity 0.4, not-allowed, tabindex -1, title "Preview — wait for the sound to load"; ready 96/false/1/null/pointer/0; begins 0/0; exactly 2 peaks requests; pageErrors []; held vs ready heights max diff 0.0 at both viewports (`probe-real-*.json`, png) |
| 4 fallbacks | PASS | 404: held 0 rects, ready 96, middleEastBegins 1; 8bit: held 96, begins 1 (heights replaced, diff 0.0168); no page errors |
| 5a lane actions | PASS | ok true, 8/8 steps at both viewports (`lane-*.json`) |
| 5b peaks-probe-410 | PASS | 9 sources × 96 columns, 2 peaks requests, pageErrors [] (its `ok` false is the expected side-effect) |
| 6a | PASS | 24 files 425/425 (slowest 1.78 s of 15 s) |
| 6b mutants | PASS | 13/13 RED naming expected rows, pristine before/after rc 0, scratch status 0 (`mutants/summary.txt`) |
| 6c regeneration | PASS | generator in scratch rc 0; sha256 of 3 files equal to tree; scratch status 0 |
| 7 auth | PASS | fresh context: `/studio-lab` auth_user null, no gate; `/studio/middle-east` shows "Sign in required" (signIn 1, 0 `audio[src]`, status 200, `auth2.mjs` output, `auth-premium2.png`); token API 401 (`auth.json`). Fake-bearer BLOCKED (no backend) |
| 8 docs | PASS | doc 264 l.4 byte-exact; 7 headings in order; 13 MU lines equal summary; 0 "C round 411"; runner-scoped regen wording; doc 263 l.4 unchanged; 0 `pending` hits |
| 9 reference | PASS | Live 12 manual 5.1.2 quotes re-fetched by C: grey-out until drawn / not playable; asd data draws waveform. Match; "better than Live" (dimmed complete waveform) is B's listed difference. Browser-preview timing: no reference found (B) — Ableton conformance: confirmed for the two points, unconfirmed for the third |
| 10 screen budget | PASS | +1/−0 line, `title=` only |
| gate | not run | root gate |

**Note on row 7:** the first run (`auth.mjs`) captured a blank page with signIn 0 because it did not wait for networkidle after the cold navigation (same as the earlier hydration timing issue). The re-run with networkidle (`auth2.mjs`) shows the "Sign in required" screen with no audio element. Premium auth is not bypassed.

Environment: first browser attempt after vitest hit a cold-dev-server hydration error; warmed and re-ran (L38). Not run: Firefox/Safari (15b-ii), fake-bearer path (backend unavailable). No bugs found.
