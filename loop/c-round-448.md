# C round 448 — STORE-2b-2b Hire-Us inquiry e-mail: PASS (0 bugs)

browserVerified/realVerified: true. Real Chromium (Playwright), dev server :5173, HEAD control cce5eda on :5178 (own cacheDir), e-mail captured through the real `action` with `fetch` stubbed. Details: c-round-448.json, c-round-448/.

| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS: 6 granted paths, 0 outside (email.server.ts, root.tsx, studio, styles untouched) | c1-status.txt |
| C2 claims | PASS: differing keys only K3 K4 K7 K9 K16 K19 K24 K25 (plus K2 = B's scratch); equal to the sketch output | claims-c.txt, claims-c-diff.txt |
| C3 contrast (the bug) | PASS: HEAD light 10/12 failing, dark 1/12 (= K10); tree 0/12 both, min 7.06; captures byte-identical to B's | email-*.html, contrast-*.json, shot-*.png |
| C4 structure | PASS: 10-line diff equals email-structure-diff-sketch.txt | structure-c.txt |
| C5 escape | PASS: 0 img, payload as text, project = Not specified | esc.json, esc-shot.png |
| C6 /hire-us 1440/1280/375 | PASS: HEAD-vs-HEAD 0 px, HEAD-vs-tree 0 px; empty submit 3 invalid; filled -> Server configuration error (both) | c6-page.json |
| C7 | BLOCKED: no Brevo key/mail client in cloud (TLM-R448-HIREUS-EMAIL-CLIENTS) | — |
| C8 covering | PASS 6 files / 71 tests | covering.txt |
| C9 mutants | PASS: M1–M10 each red on K13's rows | mutants-c.txt |
| C10 O3 control | record: 1280 0/0 px; 1440 HEAD-vs-HEAD 292111 px (y81–867) and HEAD-vs-tree 9012 px, same animated region, not from this diff | c10.json |
| C11 showcase | PASS 5.66 (1280) / 5.68 (1440) | c11.json |
| C12 Studio + protection | PASS: clip added, Play advances, Stop holds, both viewports, same as HEAD; protected route 0 audio[src], 0 media, Sign in required, no bypass | c12-tree.json, c12-head.json |
| C13 docs | PASS: l.4 exact, 7 headings in order, ids exist, 0 pending | — |

Notes for B: A-R448-REVIEW-M1-GOLDEN is covered this round by C4; HE9 vacuous fallback (L2) is a Low. The C10 1440 hero band is wider than 430–620 and varies run to run (animation); that belongs to 2b-3. Gate rows (full vitest, typecheck, build, lint, verify) are not claimed.
