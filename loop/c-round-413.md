# C round 413 — PERF-15b-ii-a: PASS (browserVerified true, 0 bugs)
Evidence in `c-round-413/`. Env: store 200.

| Row | Result | Evidence |
|---|---|---|
| 1 SOURCE-SCOPE start | PASS: claims differ from sketch output only on K1/K2/K6/K6b (expected); K3 1301 rc0, K4 rc0 granted 0, K2b 0; status 12 paths | claims-start.txt, claims-vs-sketch.diff |
| 2 PATCH-IDENTITY | PASS: sketch (sha a7913dece594) applied to git-archive HEAD; 9/9 files cmp-identical | — |
| 3a UNIT | PASS: 24 files, 436/436, max test 1878 ms of 15000 (12.5%) | covering.json |
| 3b MUTANTS | PASS: 15/15 RED with expected row, pristine before/after rc0, scratch 0 lines; equals B's summary | mutants/summary.txt |
| 4 DEMO PEAKS | PASS both viewports: real held 96/aria true/opacity 0.4/title "Preview — wait for the sound to load", ready 96/false/null, middleEastBegins 0, 2 peaks requests, no errors; 404 held 0, ready 96, begins 1; 8bit held 96, begins 1. First real@1440 attempt = cold-server hydration error (env, L38), retried OK | row4-summary.txt, peaks-*.json |
| 5 NO-REGRESSION | PASS: lane-actions 8/8 ok both viewports; peaks-probe-410: 9 sources × 96 cols, 2 requests, no errors (ok:false expected) | lane-*.json, p410-*.json |
| 6 AUTH | PASS: demo lab opens, auth_user null, no "Sign in required"; /studio/middle-east shows "Sign in required", 0 audio[src]; token API 401. Fake-bearer BLOCKED (no backend) | auth.json, auth-*.png |
| 7 SECURITY | PASS: PK2/PK4 in 3b; 0 console.* in the two files; origin rule in doc 265 and handoff doc l.22 | — |
| 8 DOCS+SCREEN | PASS: l.4 of 263/264/265 byte-exact; doc 265 has 7 TEMPLATE headings in order; 15 MU-413 lines identical to summary; pending 0; In-Progress-stage docs 7; no diff in app/components or app/routes | — |
| 9 FIREFOX | BLOCKED: Playwright Firefox not installed (only chromium in cache); does not lower browserVerified | — |
| 10 END + L57 | PASS: end claims identical to start; L57 OK | l57-check.txt |

Not verified: purchased path in a browser (adapter not mounted, SRW-21 deferred); gate rows (full vitest/build/verify) left to root. Ableton conformance: N/A (no user-visible change).
