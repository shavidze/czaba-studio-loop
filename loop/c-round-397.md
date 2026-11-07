# C round 397: PERF-13d — PASS (browserVerified true, 0 bugs)

Evidence is in `c-round-397/`. No source was edited.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS. The claims differ from the planning output only in the §7 facts (K2, K8, K9, K10, K12, K13, K14, K17, K24). `git status` shows 3 M and 2 new files, all inside the grants. The frozen manifest has 0 non-OK lines and the protected files are 11/11. | `claims-start.txt` |
| PERF-LOAD | PASS. rc 0, `failures` empty. `load.script-max` 0 (<100). `harness.loaf-scripts-live` 80 (>=50). | `perf-load.log`, `perf-results/latest.json` |
| BUF-TASKS | PASS. Six runs at CPU 6×, three per viewport: `synthBuilds` 5 in every run. `maxSynthBuildsPerLongtask` is 0 in five runs and 1 (72 ms task) in 1440 run 3. HEAD had 5 in one 135–185 ms task. `pageErrors` empty. | `sketch-*.json` |
| BUF-SAME-ARRAY | PASS. `sameArrayBuilds` is 5 in all six runs (HEAD 0). | same |
| BUF-HASH | PASS. In all runs `hash0` equals `hash1`, and the sorted hash set equals the HEAD one (`head-6x-hash.json`). | same |
| BUF-STATUS | PASS. The status is the exact ready text, same as HEAD. | same |
| BUF-PLAY | PASS. `clips` 1 and `playing` "true" in all runs. | same |
| AUTH | PASS. Fresh incognito context at both viewports: `/studio-lab` opens the demo ("Demo collection — no sign-in required"). `/studio/premium-demo` shows "Sign in required" and mounts no workspace. `/api/studio-token?product=premium-demo&file=a.wav` returns 401 "Please sign in to access Studio." Premium auth is not bypassed. | `auth.json`, `api-token.txt`, `auth-*.png` |
| DOCS | PASS. Doc 253 is Georgian, has 7 headings in the TEMPLATE order, l.4 is exact, and every cited SB/MU id and file exists. Doc 247's diff touches l.4 and TODO item 4 only. `In Progress (stage` is in 3 files and `C round N pending` has 0 hits. | |
| gate | Not claimed: full vitest, typecheck, build, Biome, verify. | |

**Notes:**
- The mutants were recorded by A (7/7 RED); C did not re-run them.
- SB5 and SB6 are jsdom-only, as the task states.
- Ableton comparison is not applicable (perf round).
- Low (recorded only): one run had a single build inside a long task. The row allows 1.
