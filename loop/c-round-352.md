# C round 352 — PERF-CAND-VIDEO-TRIM-FADE-COST stage 1, fix-up 2 (DP72 release + Undo halves)

**Verdict: PASS.** All C rows ran; none was backend-blocked. Evidence is in `c-round-352/`. Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are NOT claimed.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | `claims-352.sh` output equals `a-round-352/claims-final.txt` (K2 `7f56989 3`, K3 dock sha `037f62faf9e69844`, K5 `62+0-` and equal to sketch352, K7 11/11, K8 0 untracked) | `c-round-352/claims.txt` |
| SOURCE-SCOPE | exactly 3 `M` files, 0 untracked; dock sha256 = `037f62faf9e698441f0f0ed913c7397d6b2fc9c70840eb4a47d906317cd15e96`; `ArrangementContext.tsx` has no diff vs HEAD; test file `cmp` byte-equal to `drag-preview-render.test.sketch352.tsx` (rechecked after the browser runs) | shell output |
| READ | DP72 hunk: `this instanceof HTMLVideoElement` spy; no try/finally; `writesBeforeRelease` taken before pointer-up; 20 ms real-timer settle then `toHaveLength(writesBeforeRelease)`; committed start `toBeCloseTo(shownStart, 6)`; after Undo `seeks.length > writesBeforeRelease` then media-time waitFor. DP66–DP71 unchanged (K4: 6 + 1) | test l.2244–2306 |
| UNIT | 74/74 | `unit.log` |
| MUTANT (jsdom, own scratch) | control green; M-B2 → DP66,67; M-B2′ → DP66,67,71; A-M5 → DP71; M-B5 → DP72 (l.2291 `expected 2 to be close to 1`); M-B1 → DP69, DP72 (l.2297 `length 3 but got 4`); M-B6 → DP66–70, DP72 (l.2298); M-B7 → DP72 only (l.2300 `expected 3 to be greater than 3`). All equal §0.1 | `mutant-*.log` |
| MUTANT (browser, M-B2′) | scratch dev server :5273 with its own `cacheDir`, then deleted. `ArrangementVideoDock`, `Caption`, `FadeOverlay`, `GapCaption`, `Maximize2` appear in every trim (19), fade (9) and move (17) commit | `names-M-B2prime.json` |
| NAMES smoke (browser, 1440×900, dev, this tree) | video-trim 13, video-fade 3, video-move 11/11/11 for the first three moves, none with `ArrangementVideo*` or `Maximize2`. All six keys equal `c-round-350/names.json` (rendered counts and names). The 4th move (82) and the releases include the dock, as in round 350 | `names.json`, `names.run.log` |
| G352-AUTH (browser, 1440×900 and 1280×720, fresh anonymous context) | `/studio-lab` opens the workspace with the demo badge, `auth_user` null. `/studio/1` shows "Sign in required", 0 `audio[src]`. `/api/studio-token` GET 400, POST 405 (refused). Premium not bypassed | `auth.json`, `lab-*.png` |
| DOCS | doc 232 l.4 ends `video-trim-fade-cost-1; C round 352 pending)`; changed-files line `DP72 — rounds 351–352`; DP72 bullet names D-29z1124 and M-B5/M-B6/M-B7; 7 `## ` | doc 232 l.4, 332, 462 |

## Notes
- The first run of the names probe timed out waiting for "ready" on both the shared :5173 server and the fresh scratch server. In both cases the cause was Vite cold dependency optimisation, which reloads the page. A warm-up load fixed it. This is an environment effect, not a defect in A's work. The probe rerun passed.
- The three Lows from A's reviewer (COMMIT-EXACT, DRAG-DISTANCE, WINDOW-PRECONDITION) are real but low. I agree they are not blockers, since the file must stay byte-equal to the sketch. They go to `deferred_low_polish`.
- Ableton conformance: not applicable (test and docs only; nothing the user sees or hears changed).
- Closing on this PASS per the task §5: C-R351-01, A-R351-REVIEW-GLOBAL-SPY, A-R351-REVIEW-TRY-SPAN, C-R350-01, A-R350-REVIEW-SEEK-TEST.
