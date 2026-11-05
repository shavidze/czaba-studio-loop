# C round 349 — PERF-CAND-VIDEO-TRIM-FADE-ROWS: PASS (browserVerified true)

Evidence in `c-round-349/`. 0 bugs, 0 blocked. Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS: `claims-349.sh` output identical to `a-round-349/claims-final.txt` (K2 `aca59b3 3`; baseline advanced by a docs-only root commit) | run inline |
| SOURCE-SCOPE | PASS: 3 modified, 0 untracked; both `sketch/*.patch.txt` reverse-apply | git status, `git apply -R --check` |
| READ | PASS: move ids/`liveId`/`rows` unchanged; `dragTarget` defaults `'audio'`; budgets 230→252, 22 added, all `record`, budget null, owner correct, 0 existing rows changed (JSON diff vs HEAD) | |
| PERF (production, alone) | PASS: rc 0, 8.4 min, `complete`, failures [], 252 rows, 70/70 asserted, 165 EQUAL / 0 DIFF / 22 NEW (exactly the §0.2 ids), no `abortedAt`/problems in 6 passes, `durationMs` 491771 (54.6 %, ≤ 540000). New deterministic rows identical in 3/3 and equal to §0.3: trim 18.683/19/1/0/31, fade 8.85/9/2/0/31 | `perf.log`, `perf-results/`, `perf-rowcmp.txt` |
| GRAB-PROBE | PASS: trim `data-clip-start` 0→1.5→3.0 and fade `data-fade-in` 0→1.5→3.0, stopped and playing, all 3 passes | `perf-results/latest-interactions.json` details |
| MUTANT (scratch, deleted) | PASS, red as predicted: video branch returns the audio fade testid → rc 1; every 1× pass `abortedAt` = `drag interact.drag.video-fade stopped`; failures list the 2 asserted video rows with no samples and "23 rows short of 3 samples"; `drag-video-live` 3 samples/pass; trim-stopped 3 samples; fade and playing rows 0 samples; 6× passes clean. store/ unchanged | `mutant.log`, `mutant-results.json` |
| PERF-LIB | PASS 40/40 | `perf-lib.log` |
| G349-AUTH (1440×900, 1280×720, fresh context) | PASS: `/studio-lab` opens with demo badge, workspace, `auth_user` null; `/studio/demo-product-1` shows "Sign in required", 0 `audio[src]`; `/api/studio-token` GET 400, POST 405 (refused). Premium not bypassed | `smoke-results.json`, `auth-*.png` |
| VIDEO-SMOKE (dev :5173, both viewports) | PASS: import 1.mp4; trim-start drag previews (start 0→0.75→1.5) and commits one entry "Trim — left edge", Undo restores; fade-in drag previews (0→0.75→1.5), one entry "Video Fade In", Undo restores. At 1280×720 the trim grab needs the lower part of the 8 px edge (the 10 px fade handle overlaps its top) — the harness's own grab works, no defect | `smoke-results.json`, `video-*-during-*.png` |
| DOCS | PASS: l.4 as required, one `### ეტაპი video-trim-fade`, 7 `## `, 0 "C round 348 pending", table values match the live run | read |

Notes (not bugs):
- Baseline `aca59b3` (docs-only) instead of `70751a5`; A flagged it, verified.
- First smoke attempt hit a cold Vite dep-optimize reload (hydration `useState` of null, once); warm rerun 0 errors. Environment noise.
- Info: `interact.harness.drag-video-trim-live` is fed by the stopped drag too, so under an abort at the fade step it still reads 1; the abort is still reported loudly via failures.
- Recorded costs for PERF-CAND-VIDEO-TRIM-FADE-COST: trim 18.7 components/move, fade 8.85, release during playback restarts the graph (31 start()).
- Ableton conformance: not applicable (harness only).
