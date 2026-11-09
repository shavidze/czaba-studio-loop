# C round 421 — SYS-R418-PREVIEW-LIFECYCLE: PASS (browserVerified true)

No source edits by C. Evidence under `c-round-421/`.

| Row | Result | Evidence |
|---|---|---|
| 1 claims/scope start | PASS: equals A5 expectation, stderr 0 bytes, K14 13 ids located (none NOT-FOUND), K19 `L58 OK`, frozen 1316 rc 0, protected rc 0, only 4 granted paths | claims-start.txt/.err |
| 2 patch identity + unit | PASS: sketch applied to HEAD scratch; 3 files `cmp` identical to working tree; test diff touches only PC12 title (l.1110) and appended block (l.1234+); 14 files 286/286 | a2.txt |
| 3 mutants | PASS: summary.txt identical to B's 7 lines (diff empty); loaded replicate (2 busy loops) 49/49 | b420copy/mutants/summary.txt, loaded.txt |
| 4 browser preview | PASS: Chromium, 1440x900 + 1280x720, ALL EQUAL over 16 cells; R11 `paused [false]`, `advanced true` (preview keeps playing through Snap/zoom changes) | probe/compare.txt |
| 5 play/stop smoke | PASS both viewports: Space/Play advances 00:00.000→00:01.471 in 1.5 s; after Stop 600 ms position frozen (1.610/1.610, 1.561/1.561); 0 page errors | browser.out, screens/ |
| 6 auth | PASS: fresh context, `auth_user` null, demo /studio-lab opens; /studio/middle-east "Sign in required", 0 `audio[src]`; /api/studio-token anonymous 401. First 1440 read was an empty body (slow render); rerun shows sign-in at both viewports. BLOCKED: fake-bearer path (no backend) | browser.out, auth-retry.json |
| 7 doc 271 | PASS: l.4 byte-exact; 7 TEMPLATE headings in order (excluding TEMPLATE's own "Prompt" heading); mutant block byte-equal; all 8 closed ids named; cited row ids exist | |
| 8 scope end + L57 | PASS: end claims equal start; diff stat = 3 granted files (+200 −6); l57-check OK | claims-end.txt, l57-check.txt |

Gate rows (full vitest/typecheck/build/verify) not run by C.
Not measured: export WAV (no export code touched); the new collection-change stop trigger is unreachable in /studio-lab, jsdom PL1–PL3 only.
Low note for B: A-R421-REVIEW-L1 (no test that an already-playing decoded-buffer preview gets `source.stop` on collection change) → deferred_low_polish. No new bugs found.
