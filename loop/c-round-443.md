# C round 443 — SYS-3 stage 1 fix-up (held Enter/Escape after IME composition): PASS

Real Chromium (Playwright) on :5173, both viewports 1440x900 and 1280x720; evidence in `c-round-443/`.

| Row | Result | Evidence |
|---|---|---|
| C1/C10 scope | status paths == grants-443.txt (5) | console |
| C2 identity | 4/4 `cmp` identical to sketch-files | console |
| C3 covering | 60 files, 1118/1118, rc 0 | `c3-covering.log` |
| C4 mutants | 7 lines, id/rc/failedRows equal b-round-442 results.jsonl | `mut.out`, `mut/` |
| C5 held-IME browser (tree) | `ALL OK (18 cells)`; 1440 TEMPO-ENTER first cell was a Vite cold-start hydration error (`useState` null), replaced once | `held-tree.json`, `held-tree-tempo-rerun.json`, `held-tree-merged.json` |
| C5-HEAD control | `NOT ALL OK (8 of 18 failing)`, equals `compare-head.txt` line for line (same first-cell cold-start replacement once) | `held-head-merged.json`, `compare-head-run.txt` |
| C6 stage-1 neighbour | `ALL OK (18 cells)` | `sites-tree.json` |
| C7 plain held keys | tree == HEAD `ALL SAME (18 cells)` | `plain-tree.json`, `plain-head.json` |
| C8 smoke+auth | anonymous: auth_user null; `/studio/middle-east` "Sign in required", 0 `audio[src]`, token 401; Play -> "Playing", Stop -> "Stopped" at both viewports | `smoke.mjs`, `smoke-1440.png`, `smoke-1280.png` |
| C9 doc 288 | TEMPLATE headings in order, line 4 exact, 7 mutant ids present, both browser lines, TLM held-key step, IME6/IME7 exist in test | grep |
| C11 claims | only K2,K4,K5,K9,K11 differ, as expected | `claims-after.txt` |
| gate | full vitest/typecheck/build/Biome/verify | not claimed by C |

Held-key contract: after a composing key, three auto-repeat Enter/Escape keydowns no longer commit/cancel Tempo, marker editor or Clip Gain; a fresh plain key then acts. Non-IME behaviour is identical to HEAD.

Limits: synthetic CDP sequence proves the handler contract only; real OS IME delivery remains TLM-SYS3-IME-PLATFORMS (blocked/manual). Ableton conformance: not applicable. No audio/export path touched this round, so no export measurement was needed.
