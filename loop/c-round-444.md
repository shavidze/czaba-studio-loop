# C round 444 — SYS-3 stage 2a (IME in Library search, sheet search, focus-source)

Verdict: **PASS**, browserVerified true. Evidence in `c-round-444/`.

| Row | Result | Evidence |
|---|---|---|
| C1/C10 scope | git status = the 8 granted paths, start and end | status-paths.txt |
| C2 patch identity | 6/6 `cmp` identical to sketch-files | — |
| C3 covering | rc 0, 25 files, 440/440 | vitest-covering.log |
| C4 mutants | 8/8, ids/rc/failedRows equal results.jsonl | mut/results.jsonl |
| C5 IME search browser | `ALL OK (18 cells)`; 1440 LIB-ESC was a cold-start timeout, re-run OK (merged in tree-merged.json) | tree.json, tree-rerun-libesc.json |
| C5 HEAD control | `NOT ALL OK (14 of 18 failing)`, same cells as compare-head.txt (1440 LIB-ESC re-run → FAIL focusSource keyboard) | head-merged.json |
| C6 neighbours | ime-sites and ime-held both `ALL OK (18 cells)` | sites.json, held.json |
| C7 focus targets | `ALL SAME (6 cells)`; ring true; (a) search focused value '', (b) option button, (c) "Keyboard shortcuts (?)" | c7-tree.json, c7-head.json, c7a/b/c-*.png |
| C8 smoke/auth | both viewports: auth_user null, Play→Playing, Stop→Stopped; `/studio/middle-east` "Sign in required", 0 audio[src], token 401 (premium not bypassed) | smoke.json |
| C9 docs | 288 and 289 l.4 exact; 7 template headings in order; 8 mutant ids, TL-R444-I1/L3/L1, both browser lines present; named tests exist; pending grep 0 | — |
| C11 claims | no diff vs sketch output | claims-after.txt |
| gate | full vitest/typecheck/build/Biome/verify not claimed | — |

Not verified (TLM, not a fail): real OS IME, AltGr, Android, native search clear under a real IME; AltGraph has no browser row (Playwright cannot set it). Ableton conformance: not applicable (platform standard). No bugs. Reviewer notes A-R444-REVIEW-L1/I1 (Cmd+Option AltGraph on Firefox-mac; held Escape reaching floating-video handler) are already routed to stage 2b.
