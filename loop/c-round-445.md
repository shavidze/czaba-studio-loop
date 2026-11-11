# C round 445 — SYS-3 stage 2b: PASS (browserVerified true)

Real Chromium (Playwright) on http://127.0.0.1:5173/studio-lab, 1440x900 and 1280x720. Source read-only; tree = 13 granted paths, unchanged at start and end.

| Row | Result | Evidence |
|---|---|---|
| C1/C10 scope | 13 paths = grants-445.txt; claims K3 ok | c-round-445/status-paths.txt |
| C2 patch identity | 10/10 identical | cmp vs b-round-444/sketch-files |
| C3 covering | 60 files, 1082/1082, rc 0 | covering.log |
| C4 mutants | 12 lines; id/rc/failedRows equal results.jsonl | mut/results.jsonl |
| C5 held Esc + video | tree ALL OK (14), FRESH ALL SAME (14); HEAD :5177 NOT ALL OK (8 of 14), cells identical to compare-head.txt. 1 cold-start `error` cell per run (SHEET@1440) re-run, valid | tree-merged.json, head-merged.json, head-compare.txt |
| C5 GATE443-L1 | GAIN and LIBSEARCH held-Esc cells keep the video expanded on tree and HEAD (no user-visible effect) — closes | same |
| C6 neighbours | sites, held, stage2a each ALL OK (18) | sites/held/stage2.json |
| C7 plain held | ALL SAME (18) tree vs HEAD | plain-*.json |
| C8 smoke+auth | anon auth_user null; /studio/middle-east "Sign in required", 0 audio[src], token 401; Play→Playing, Stop→Stopped both viewports | smoke.json, screenshots |
| C9 docs | l.4 exact in 288/289/290; 290 headings in TEMPLATE order; 12 mutant ids, both browser lines, GATE443-L1, TODO ids present; IME6 title exists; 289 l.13 AltGr-only + FT9 sentence; 0 "pending" lines | direct greps |
| C11 claims | no diff vs claims-445-sketch-output.txt | claims-after.txt |

Gate rows (full vitest, typecheck, build, Biome, verify): not claimed.
Blocked: TLM-SYS3-IME-PLATFORMS (real OS IME / macOS Option) — manual, deadline RETRO 450.
Not applicable: audio-graph/export WAV measurement (key-handling-only round). Bugs: none.
