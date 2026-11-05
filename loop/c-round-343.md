# C round 343 — PERF-DRAG-PREVIEW c4-ii (group move via the store): PASS

All rows ran; browserVerified=true. 0 bugs. Evidence under `c-round-343/`; machine verdict in `c-round-343.json`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, start and end equal `a-round-343/claims-final.txt` | `out/claims-start.txt`, `claims-end.txt` |
| SOURCE-SCOPE | PASS: 7 files; all 3 patches reverse-apply (`git apply -R --check`) | git diff --stat |
| UNIT | PASS: 23 files, 561 passed (a 27-file substring run: 604 passed) | `out/unit23.log`, `out/unit.log` |
| MUTANT | PASS: HEAD+new tests red DP51,52,54,56,GS5b (green DP53,55); MU-OVERVIEW-COMMITTED only DP54 red; my predicted MU-VIDEO-STORE (`previewGroup = previewGeometry`) only DP53 red. Scratch deleted | `out/unit-{head,mutws,mutvid}.log` |
| READ GATE338-S1 | PASS: `historyRef.current =` only at ArrangementContext.tsx l.922 (updateHistory), l.1942, l.1946 (previewClipGeometry). Closes GATE338-S1 | grep |
| PERF (alone, prod build :5188) | PASS: rc 0, complete, failures [], 219 rows, 55/55 asserted; vs c-round-339 149 EQUAL, 8 DIFF exactly as spec (group per-move 74.781→26.969 in 3/3 passes at both rates; max 106→104) | `perf-results/`, `out/rowcmp.txt` |
| PERF-LIB | PASS 34/34 | run inline |
| GROUP-BEHAVIOUR (dev :5173, 1440 and 1280) | PASS: behaviour fields equal HEAD oracle after dropping render/commit counts, ids, top; pageErrors []. Recorded: `providerRendered` false on every same-lane step (HEAD: true); blocked steps false (HEAD true); release true | `out/group-{1440,1280}.json` |
| OVERVIEW-FOLLOWS | PASS both viewports: hidden block 0.000 / 3.000 mid / 3.000 after / 0.000 after Undo, selected true; visible clip 3.000 mid and after; "Undo: Move (2) (Ctrl+Z)"; equal to HEAD and sketch oracles; pageErrors [] | `out/overview-*.json`, `shots/ov-*-mid.png` |
| BLOCKED-STATUS | PASS (own script, both viewports): mid-drag status "Group move stopped — a neighbouring clip or the start of the timeline." on all 6 steps; starts 0.000/101.352 unchanged mid-drag and after; Undo title unchanged ("Duplicate (1)"); post-release status "Move (2): nothing changed…"; pageErrors [] | `out/blocked-*.json`, `tools/blocked.mjs` |
| G343-AUTH | PASS: fresh anonymous contexts, both viewports: `/studio-lab` workspace + demo badge, auth_user null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; /api/studio-token no header 401, bare 400, fake Bearer 403 with mock health 200; no token in bodies. Premium auth not bypassed | `out/g343-auth.json` |
| DOCS | PASS: doc 232 l.4 byte-exact, l.1 suffix present, c4-ii section at l.107 cites DP51–56/GS5b which exist; doc 168 diff is 2 added lines inside `## მეტრიკები` (l.120) | grep/diff |

Notes: the mock API was down at phase start; I started it from `mock-api/server.mjs` for G343-AUTH and stopped it before PERF. Two first-attempt probe crashes (page still compiling) were rerun; recorded as invalid runs. Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed. A's six Lows (A-R343-REVIEW-*) and the Architecture note go to B unchanged.
