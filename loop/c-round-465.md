# C round 465 — RETRO 465: PASS (0 bugs)

browserVerified/realVerified: true. Source untouched (0 status lines, both manifests rc 0, HEAD 6d321c7). Evidence: `c-round-465/` (scripts/, data/, screens/, PNGs, progress via this table).

| # | Row | Result | Evidence |
|---|---|---|---|
| 1,12 | SOURCE-SCOPE | PASS | start and end: 0 lines, rc 0/0 |
| 2 | G465-AUTH (browser, 1440+1280) | PASS | `data/auth-rows.json`: auth_user null, workspace opens (title "CZABA Studio — Demo collection"); /studio/middle-east shows "Sign in required", 0 audio[src]; /api/studio-token 401 "Please sign in". Fake-bearer path BLOCKED (no backend) |
| 3 | STUDIO-SMOKE-465 (browser) | PASS | `data/smoke.json`: Enter adds clip; AudioContext running; clock 00:00.000 → ~00:01.47 in 1.5 s; after Stop 2 reads identical; Export dialog opens, Esc closes. PNGs `smoke-*` |
| 4 | RT-SCREEN | PASS | `screens/screen465.json` identical to B's; lines 138/168/118/144, outside 97/124/86/101 (exact, 0 delta); 3 clips left 512/1152/1792; status "…(nearest free spot)" 00:48.000; SR-465-1 chip above "Premium", SR-465-2 WAV + 24-bit on both cards, SR-465-3 half-cut top row — seen in PNGs. First capture without the mock API gave "Product Not Found" (env; mock started, rerun valid) |
| 5 | CLAIMS | PASS | `data/claims.txt` == B's planning output, stderr empty, 0 MISSING, last D-29z1641 |
| 6 | RT-NUM | PASS | 11 scripts re-run, all outputs cmp-identical to B's data; retro totals/medians/stage sums/15.08 recomputed |
| 7 | RT-CAUSE | PASS | 5 STOP rounds' `a-round-N.md` heads read; 463 Medium (D-29z1634, gate 08:18Z); 458 attempt1 0 B; l4-check cmp equal. Opinions labelled tech-lead/product-designer |
| 8 | RT-IDS | PASS | 5 RETRO465-* ruled; SYS-R465 closes exactly 6 ids, each id carries systemic_task; status "planned, not dispatched" with triggers; retro_runs 465; next_due 480 |
| 9 | RT-LESSONS | PASS | 60 lines, 57,320 < 58,399 B, 3 parts; diff == B's; L52/L56/L18 pure appends equal consult text; L60/L23/L58 as stated. (L23's removal also drops the name "PERF-1a" inside a removed evidence clause — a task name, not a finding id) |
| 10 | RT-CHECKERS | PASS | L57 15/15 OK, L58 458 INCOMPLETE only; current-task rc 0 "no sketch" |
| 11 | RT-SABA | PASS | Q3 open-but-blocked IME, Q7 proposal, defaults on all 7 |

Not measured: WAV export integrity (no export in a RETRO round); this is outside this round's acceptance. Gate rows (full verify) belong to the root gate.
