# C round 418 — SYS-R416-PREVIEW-CONTROLLER: PASS (browserVerified true)

Evidence under `c-round-418/`. Source read-only; no app edits.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start + CLAIMS | PASS. Claims as A5 expects, stderr 0 bytes, K19 `L58 OK`, K14 nine ids none NOT-FOUND, K3 1314 rc 0, K4 rc 0, K2b 0, status = 3 M + 1 ?? (4 granted paths) | `claims-start.out/.err` |
| 2 | PATCH-IDENTITY + UNIT | PASS. sketch applied on `git archive HEAD` scratch; 3 files `cmp` identical to working tree. A2 command 5 files 117/117. `git diff -U0` on test file: 3 `act(` lines (PS8/13/27) + appended block only | `vitest-a2.log` |
| 3 | MUTANTS | PASS. Fresh HEAD scratch, B's `run.py`: `summary.txt` byte-equal to B's, 12 lines (SKETCH green 40/40; MU-HEAD-SRC red PC1,3,4,5,6,8,9,10; each single mutant red on its rows). Loaded replicate (2 busy loops) 40/40 | `mutants-run.log`, `b417copy/mutants/summary.txt`, `vitest-loaded.log` |
| 4 | PREVIEW-BROWSER | PASS. `ALL EQUAL` over 14 cells vs B's HEAD results (R1, R1b, R5, R6, R7, R9, R10 × 2 viewports). R1 1440 first attempt hit a cold load (status element null) = environment, retried once, green | `probe/compare.txt`, `probe/sketch/` |
| 5 | PLAY-STOP SMOKE | PASS both viewports: Space advances 1.07 s / 1.06 s over ~1.1 s wall; stop freezes position 500 ms; 0 page errors | `browser.json`, `shots/smoke-playing-*.png` |
| 6 | AUTH | PASS both viewports: `auth_user` null; demo opens; `/studio/middle-east` "Sign in required", 0 `audio[src]`, 0 timeline; token API 401. 1440 first load rendered empty body (cold), retried: correct. Premium not bypassed. Fake-bearer BLOCKED (no backend) | `browser.json`, `auth-retry.json`, `shots/auth-*` |
| 7 | DOC 269 | PASS. l.4 byte-exact; 7 TEMPLATE headings in order; 12-line mutant block contiguous and equal; 7 closed ids present; all PS/PC rows cited exist | grep output in session |
| 8 | SOURCE-SCOPE end + L57 | PASS. End claims == start claims; `git diff HEAD --stat` = 3 granted files; L57 checker OK | `claims-end.out`, `l57-check.txt` |

C-R417-L58-SKETCH-REVIEW-MISSING: closed (row 1, K19 `L58 OK`).

## Findings (all Low, none block)
- C-R418-READTIME-STALE-START (confirms A-R418-REVIEW-L1), C-R418-OFFSET-RAW-READ (A-R418-REVIEW-L2, pre-existing), C-R418-PC12-TITLE (A-R418-REVIEW-L3). All → `deferred_low_polish`; L1+L2 can close together.

## Not run / gate
Export WAV / audio-graph measurement: no export or graph file changed (only the library-preview controller), so not run. Full vitest/typecheck/build/verify: gate. Fake-bearer: backend unavailable.
