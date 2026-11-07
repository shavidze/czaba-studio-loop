# C round 388 — verdict PASS (browserVerified true)

Evidence in `c-round-388/`. Source read-only; the real store was untouched (mutants ran on a copy `c-round-388/tree`).

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS: the same 5 status lines at start and end; both manifests rc 0 | scope-start.txt |
| CLAIMS | PASS: K2 5, K3 1, K4 SF11 1/11, K7 same, K8 0, K9 0, K10 matches, K11 ≥1, K12 same; identical to A's output | claims-388-c.txt |
| PATCH-EQUAL | PASS: 4 of 4 identical (cmp) | |
| UNIT | PASS: all 66 files, 239 suites, 1026/1026 tests; AR1–AR5 and SF1–SF11 present | unit.json, unit-summary.txt |
| MUTANTS | PASS 16/16 red: MU-388 red on SF11; the 15 round-387 mutants each red on their rows, PUMP-NO-CATCH on SF6+SF11; all restored | mutants/ |
| METER-FLOOR 1440/1280 | PASS: thrown 1, status true, all meters -inf after 1 and 2, clock frozen (00:00.761), errors []. (1440 first attempt hit a cold-start timeout on the Sounds listbox before any measurement; rerun valid, log kept as meter-1440-attempt1-coldstart.log) | meter-1440.json, meter-1280.json |
| METER-CONTROL | PASS: thrown 0, all -inf after a normal Stop | meter-control-1440.json |
| METER-PLAYING | PASS: metersPlaying has -19.5 dB entries before the failure (meters still move) | same files |
| M2-FLOW 1440/1280 | PASS: play1 thrown 1/leaked 0/scheduleFailed; play2 thrown 2/leaked 0; play3 playing, leaked 2; commit thrown 3, clips 3, leaked 0; afterStop leaked 0; errors [] | flow-*.json |
| M1-NEIGHBOUR | PASS: same as round 387 (edit keeps playing, status scheduleFailed, replay plays) | m1-*.json |
| EXPORT-EQUAL | PASS: sha256 06aeb3de…e9fd equals the reference | export/ |
| G388-AUTH | PASS: auth_user null, /studio/middle-east shows "Sign in required", 0 audio[src], token API 401 without Authorization. Fake-bearer check BLOCKED (backend) | auth-smoke.json |
| STUDIO-SMOKE | PASS: Enter adds a clip, Play advances, Stop freezes, Export dialog opens and Esc closes it, 0 page errors | auth-smoke.json |
| DOCS | PASS: l.4 exact; C-R387-01 Problem→Solution; SF11 and MU-388-TICK-NO-GUARD named; headings follow the template; no claim about unhandled rejections; 0 "pending" strings | |

Bugs: none new. The reviewer Lows (L1–L4) are already deferred by B and are not part of this round.
Closes C-R387-01 and the five round-387 items. Gate rows (verify, full suite, build) are not claimed. The regression round is due next (2026-11-08) per B.
