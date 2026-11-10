# C round 424 — PERF-FIX-R423-LANE-SHELL: PASS (browserVerified true)

Source read-only; tree = 3 granted paths on HEAD 875ff37. Gate rows (full vitest/typecheck/build/Biome/verify) not run by C.

| Row | Result | Evidence |
|---|---|---|
| 1 claims | PASS: equal to A5 expectation, stderr empty, L58 OK, frozen 1319 rc 0, protected 11 rc 0 | claims-start.txt |
| 3 RR-PERF | PASS: `npm run test:perf` alone, 5 passed (22.1 min), complete true, failures []. All 17 C-R423-01 ids pass at the sketch medians (fade 3.933/4, trim 14.75/15, video stopped 9.883, video playing max 12, video-trim 12.817 / max 15, video-fade 2.95 / 3). No components row above round 423. Records: video.playing 9.95, video-trim.playing 12.883 | perf-compare.txt, perf-results/ |
| 4 NAME-PROBE | PASS: fade 59 commits max=mean 4; trim 15/15; shell 0, Memo(lane) 0, inner 59; 0 errors (record: 59 commits; first fade attempt cold-load fail, retried) | probe/names-*.json |
| 5 GHOST-TITLE | PASS both viewports: one ghost on `stems`, `00:00.250Middle East — public preview`, 0 errors | probe/ghost.json |
| 6 LANE+LEAF | PASS: leaf-probe only LibraryPreviewViewInner 10→11 (allowed ±1); lane-actions ok both viewports; leaf.cjs 0 non-timing diffs (.pos within 0.07 s) | lane-leaf-compare.txt |
| 7 VIDEO+PLAY | PASS: max drift 0.012 s, none paused, swaps/fallbacks 0; Space advances 1.50 s/1.51 s, frozen after stop, 0 page errors, both viewports | probe/video, smoke/ |
| 2 PATCH+UNIT | PASS: patch applies to git archive scratch, both files cmp-identical to working tree, 2 diff headers; 12 files 291/291 | vitest-a2.log |
| 8 AUTH | PASS: anonymous demo opens (auth_user null), /studio/middle-east shows Sign in required, 0 audio[src], studio-token 401 at both viewports. BLOCKED: fake-bearer path (no backend) | smoke/smoke-auth.json |
| 9 DOC+SCOPE | PASS: l.4 byte-exact, 7 headings in order, mutant block and 4 names lines byte-present, end claims == start, diff stat 2 files | claims-end.txt |

Bugs: none. Lows noted from A (DP30 shell assertion, preview wrapper style, mutants line drift) go to deferred_low_polish. C-R423-01 can close. Ableton conformance: not applicable (no behaviour change).
Outcome per task §6: PASS → round 425 = REGRESSION-2026-11-10 part 2.
