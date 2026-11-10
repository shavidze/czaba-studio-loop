# C round 430: SABA-B-12 stage 1 (STUDIO-VIS-1) — verdict PASS

0 bugs, browserVerified true. Evidence in `c-round-430/`; machine summary `c-round-430.json`.

| Row | Result | Evidence |
|---|---|---|
| 1 claims/scope | PASS (HEAD 832b3ba root primitive-only commit; 2 M + 3 ??; frozen 1329 rc0; protected rc0; stderr empty; L58 OK) | claims-start.txt |
| 2 patch identity + unit | PASS (4 files identical; 32 files 660/660) | a2-vitest.log |
| 3 mutants | PASS (6 lines identical to B) | mutants/summary.txt |
| 4 spin buttons, real Chromium 1440x900 + 1280x720 | PASS ALL OK (6 cells). Hover/focus gutter 0-1px vs HEAD 182/168; appearance textfield; 80x24; ArrowUp and typed Enter commits equal HEAD; 0 page errors. I viewed crops: no ▲▼ after, ▲▼ present in HEAD crop | probe/compare.txt, probe/after/*.png |
| 5 auth | PASS on attempts 2 and 3. Attempt 1 hit a cold-server hydration error on the legacy route at 1440 (environment, L38): still no workspace, 0 audio[src]. Premium auth not bypassed; token API 401/400 | auth/run2.log, run3.log, attempt1-hydration-error.json |
| 6 docs | PASS | doc 278, lessons.md L61 (60 lines) |
| 7 scope end + L57 | PASS | claims-end.txt, l57-check.txt |

**Ableton:** keys confirmed (manual 42.6); no-stepper claim unconfirmed on Live side (inferred); drag on fields is a pre-existing gap with open Saba question.
**Blocked:** fake-bearer path (no backend); Firefox/Safari (TLM-SABA-B-12-FIREFOX-SAFARI, RETRO 435).
**Gate rows (not run by C):** full vitest, typecheck, build, Biome, verify.
**For B:** A's 3 NF2 Lows (regex `\btype=`, side-effect import stripping, accept `className={CONST}`) are test-hardening follow-ups, none Medium+. A self-reported skipping part of primitives/lessons reading; no consequence found in the output.
