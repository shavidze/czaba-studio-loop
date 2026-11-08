# C round 400 — PASS (PERF-14b-i completion, test harness only)

Real Chromium via the perf config's production server (1440×900), each spec run alone; AUTH on the dev server in a fresh context. Evidence: `c-round-400/` (`perf-results/*.json|log|rc`, `*-compare.txt`, `interact-virt-summary.txt`, `auth.json`, screenshots, `budget-shape.txt`, `perf-lib.log`, `claims-*.txt`). Scratch virt copy was deleted.

| Row | Result |
|---|---|
| INTERACT-HEAD | rc 0 (490 s), failures [], complete true, problems [] ×6, **189/189 deterministic rows equal** `b-round-398/perf-head-interactions.json`. `drag-group-live` [1,1,1] (+6x): reveals 0, OwnCopyObserved true, source `mounted`, FollowAtT0 `on` (both branches, all passes) |
| INTERACT-VIRT | rc 1 (517 s), VIRT-RULE **PASS**: complete, abortedAt null ×6, problems [] ×6, 264 rows all 3 samples, 10 group asserts pass, drag-group-live 1, FollowAtT0 on. Only failing assert `interact.zoom.30.out.path-rewrites` median 2 vs ==3 = A's A5 list (identical). Details: reveals 3, observed false, `setup-at-rest` |
| RES-HEAD | failures [], problems [] ×6, 46/46 equal |
| RES-VIRT | abortedAt null, problems [], `res.harness.clips-2` = 2, no null rows |
| SCALE-HEAD | 17/17 equal, failures [], `in-window.min-zoom-mid` 19 |
| SCALE-VIRT | failures [], page 950 / min-zoom 1532 / min-zoom-mid 1868, model 200 |
| PERF-LIB | 3 files, 54 tests pass |
| BUDGET-SHAPE | identical to A's round-399 shape file; budgets files unchanged this round |
| NO-APP-CHANGE | 9 paths, `app` diff empty |
| SOURCE-SCOPE | start claims differ from planning only on §7 facts (K6/K8/K9/K10); end claims equal A's end claims; frozen manifest 0 failures; protected 11 OK; spec sha `fc804c3d3868f622…` |
| DOCS | doc 255 l.4 correct, 7 TEMPLATE headings in order, R-b′ table and per-site rows present; `In Progress (stage` = 5, `C round N pending` = 0; doc 254 l.4 correct |
| AUTH | `/studio-lab` opens the demo (title "CZABA Studio — Demo collection"); `/studio/premium-test` and `/studio/test-product` show sign-in, no workspace; `/api/studio-token` without credentials → 401. (First dev load was blank during Vite compile; reloaded with networkidle.) |
| gate | full vitest, typecheck, build, Biome, verify: not claimed |

No bugs found. Notes for B: A's four spec Lows are 14b-ii inputs; `perf/` is ignored by Biome. Ableton: not applicable / perf. Backend-unavailable console errors are expected.
