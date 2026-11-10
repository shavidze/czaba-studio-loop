# C round 434 — SABA-B-12 stage 3b (dialog scrollbar) — PASS

Tree: HEAD 0c22ac9 + A's 4 modified + 2 new files. Dev server :5173. Evidence under `c-round-434/`. Chromium launched with `ignoreDefaultArgs: ['--hide-scrollbars']` (L61).

| Row | Result | Evidence |
|---|---|---|
| 1 SOURCE-SCOPE + claims | PASS: diff vs planning only expected lines; frozen rc0; protected rc0; L58 OK; 4 M + 2 ?? | claims-start.txt |
| 2 PATCH-IDENTITY + UNIT | PASS: 5 headers, 5 files cmp identical; 30 files 442/442 | a2-vitest.log |
| 3 MUTANTS | PASS: 9 lines identical to B | mutants/summary.txt |
| 4 Browser scrollbar | PASS ALL OK (2 cells). 0 teal px (HEAD ~1750), warm thumb ~1800 px, 10 px bar, search 660, Export 560 no gutter, 1280 export scrolls with warm bar. I viewed the crops: after = warm grey thumb, HEAD = teal | probe/compare.txt, probe/after/*.png |
| 4b Search Clear neighbour | PASS ALL OK (2 cells) | probe/clear/compare.txt |
| 5 Auth | PASS: demo opens with badge, auth_user null; legacy `/studio/middle-east` Sign in required at 0.5/3/10 s, 0 audio[src]; studio-token 401 / 400; no tokens | auth/measured.log |
| 6 Docs | PASS: l.4 exact, 7 headings, 9 mutant lines, DS1–DS4 only, Firefox/prop/TLM notes, lessons 60 lines | — |
| 7 End scope + L57 | PASS: end claims == start; L57 OK | claims-end.txt, l57-check.txt |

Environment: probe attempt 1 timed out on a cold load (L38, run just after vitest); attempt 2 passed. Kept as `probe/run-attempt1-env.log`.

BLOCKED (not PASS, not A's fault): the `/cart` ConfirmDialog default skin in a browser (no backend; DS1 unit only); fake Bearer with a real backend; Firefox/Safari (TLM-SABA-B-12-FIREFOX-SAFARI, deadline RETRO 435).
Gate (not run by C): full vitest, typecheck, build, Biome, verify.

Ableton conformance: scrollbar look has no reference (per B, not re-fetched by me); behaviour unchanged. CZABA requirement (no teal scrollbar in Studio dialogs): met in Chromium.

For B: task text says `ConfirmModal`; the component is `ConfirmDialog`. No bugs found.
