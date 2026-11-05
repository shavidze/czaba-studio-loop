# C round 346 — PERF-DRAG-PREVIEW stage c6-i: **PASS** (browserVerified true)

Evidence in `c-round-346/`. No source edits by C (the scratch `/home/runner/c346-head` held all mutants; store `git status` = 5 files throughout).

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | equals A's final | `claims.txt` |
| SOURCE-SCOPE | 5 files, 0 untracked; `git apply -R --check source.patch.txt` OK | git |
| READ | Diff = icon constants only; same classes, strokeWidth 2/2.4, `aria-hidden`; both Plus buttons use `LANE_ADD_PLUS_ICON` | diff |
| UNIT | drag-preview-render 66/66; lane-strings-ui + track-layout + studio-theme-obsidian + video-dock-strings-ui 67/67 | `unit-others.log` |
| MUTANT (C's own, scratch HEAD copy + changed files) | (1) fold chevron inline → DP63 red ("trimStart: expected 2 to be 0"); (2) caption fed committed `arrangement` → DP64 red ("expected 'film.mp4' to be ''") | `mutant1.log`, `mutant2.log` |
| NAMES (dev :5173, warm) | fade [6,6,6,6]; trim [18,18,18,18]; move [15,15,89,15]; click [88,0]. No ChevronDown/ChevronRight/GripVertical/Film in any fade/trim or non-crossing move commit | `names.json` |
| VISUAL 1440×900 + 1280×720 | outerHTML of fold chevron (unfolded, folded, re-unfolded), 2 video-import Plus buttons, audio grip: **identical to HEAD** (scratch HEAD dev on :5197). Film icon on an imported synthetic webm (generated in-page, local only) identical to HEAD. Fold toggle swaps chevron and restores | `visual-after.json`, `visual-head.json`, `film-*.json`, `*.png` |
| PERF (production, alone) | rc 0, complete, failures [], 230 rows, 60/60 asserted pass, 0 NEW; no component/commit DIFF higher. trim 21.633→17.7 (max 22→18), move 22.8→18.467 (max 101→89), fade 9.833→5.9 (max 10→6) | `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c345.txt`, `perf.log` |
| PERF-LIB | 40/40 (report 34 + zoom-probe 6) | `perf-lib.log` |
| G346-AUTH (anonymous context, both viewports) | `/studio-lab` opens workspace + demo badge, `auth_user` null; `/studio/<id>` = "Sign in required", 0 `audio[src]`; `/api/studio-token` GET 400, POST 405 (refused, no 500) | `auth.json` |
| DOCS | l.4 as specified; one `### ეტაპი c6-i`; 7 `## ` | doc 232 |

Notes: the crossing move commit (89) and click (88) still contain Library/MarkerRow chevrons and Plus — outside c6-i scope (A's note confirmed; judged on non-crossing commits as A asked). PERF durationMs 455027 > 450000 is the known ROOT-REQ-PERF-TIMEOUT environment Low.
Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are not claimed. Ableton conformance: n/a. No bugs.
