# C round 433 — SABA-B-12 stage 3 (shortcut sheet search Clear): PASS, 0 bugs

browserVerified true. Evidence in `c-round-433/`; JSON `c-round-433.json` (L57 checker rc 0).

| # | Row | Result |
|---|---|---|
| 1 | SOURCE-SCOPE + CLAIMS | PASS — only expected diffs vs planning; K3 1337 rc0, K4 rc0, L58 OK |
| 2 | PATCH-IDENTITY + UNIT | PASS — 4 files identical to sketch; 10 files 196/196 |
| 3 | MUTANTS | PASS — 9 lines identical to B (`mutants/summary.txt`) |
| 4 | BROWSER (both viewports) | PASS — ALL OK (2 cells): 0 blue px (HEAD 32), 670×38, 28×28 X inside field, Tab order search→Clear→Close, ring 1px brass offset 2, held Enter/Space/click clear and keep focus in search, Space does not play, Esc closes, reopen empty, 0 page errors. Crops viewed. Attempt 1 cold-load timeout = env (L38) |
| 5 | AUTH | PASS — measured run: demo opens, auth_user null; `/studio/middle-east` Sign in required 0.5/3/10 s, 0 audio[src]; token API 401/400. Fake-bearer BLOCKED (no backend) |
| 6 | DOCS | PASS — l.4 exact, 7 headings, 9 mutant lines, cited rows exist, L47/L61 present, lessons 60 lines |
| 7 | SCOPE END | PASS — end claims == start; 3 M + 2 ?? |

Ableton: X clears terms (manual 4.2, per B's fetch, not re-fetched); Esc = listed deviation (CALM-1); X look: no reference.
Notes for B: task text says HEAD 8 blue px, actual 32 (B's own probe). Chromium only; Firefox/Safari stays TLM-SABA-B-12-FIREFOX-SAFARI. Gate rows (full vitest, typecheck, build, Biome, verify) not run by C.
