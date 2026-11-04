# C round 333 — PERF-DRAG-PREVIEW c2b-ii: **PASS** (browserVerified true)

A's tree on :5173 vs HEAD `de28cca` (git archive, own Vite cacheDir, :5197), 1440×900 and 1280×720. Evidence in `c-round-333/`. Source was not edited; `git status` is 3 M / 0 untracked at start and end, and the claims output at the end equals the start.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS: equals `a-round-333/claims-after.txt` (K7 `271 44 10`), also at the end | `claims.txt`, `claims-end.txt` |
| SOURCE-SCOPE | PASS: 3 modified, 0 untracked. `git apply -R --check --include=<panel>` passes. The whole patch fails only on the test file, because A strengthened rows. `StudioWorkspace`, `ArrangementClip` and `ArrangementContext` pass `git diff --quiet`. Protected files 11/11 (K8) | `claims.txt` |
| UNIT | PASS ×3: 6 files, 114/114 each. DP33–DP42 appear once each in `drag-preview-render` | `unit-{1,2,3}.log` |
| MUTANT | PASS: 6/6 red on the §0 rows and restored. MU-DTXT-EFFECT-BACK is also red on DP39 (A's strengthening). C's own mutant (`onClipEnd` fallback = `clipDuration` only) is red on DP33, 34, 36, 37, 38, 39 and 41, and restored. The scratch tree is `2ca37d0`, equal to `de28cca^{tree}` | `mutants-b.txt`, `mutant-c.txt` |
| DRAG-NAMES | PASS (browser, 1440×900): click [100,0]; fade [11,11,11,11]; trim [22,22,22,22]; move [21,21,103,21]. Counts and name multisets equal B's sketch. 0 commits are `ArrangementDetailContentInner` plus a host alone. Compared with C-332 only the extra `2`-commits are gone | `names-a.json`, `names-compare.txt` |
| PERF | PASS: production build, alone, rc 0, complete, failures [], 36/36 asserted pass; 103 EQUAL; 18 DIFF, exactly B's 18 rows, every value equal to B's sketch and lower than C-332 (trim 23.6→21.633, move 28.2→26.233, range 9.233→7.267, click 3→2 commits and 102→100 components, select 24→22). `interact.harness.hook-live` = 1 (≥1 bound; SIG-R333-HOOK-LIVE-MARGIN recorded) | `perf-rowcmp-vs-c332.txt`, `perf-interactions-atree-results/` |
| DETAIL-TEXT | PASS: 23 samples per viewport (input values, `disabled`, gain, status, focused testid). A equals HEAD at every sample, both viewports (DIFFS 0). Step 1: Start follows every move. Step 2: typed `1.5` is replaced at the first drag sample. Step 3: typed range and gain `-3` Enter keep the typed values. Step 4: Enter applies it; a Start before the clip start stays typed and the status shows the invalid message. Step 6: deselect keeps the last values in the input; reselect shows `0`/`101.352`. Screenshots of steps 1, 3 and 6 for A and HEAD | `detail-a.json`, `detail-head.json`, `detail-compare.txt`, `shots/detail-*` |
| D-ROWS | PASS: `rows-diff` reports `DIFFS 0`; no page errors on either tree; the EXPORT WAV sha256 is `453d1a04…c567` on A and on HEAD, at both viewports | `rows/rows-diff.txt`, `rows/rows-{a,head}.json` |
| G333-AUTH | PASS, both viewports, fresh anonymous contexts. `/studio-lab`: workspace and demo badge, `auth_user` null. `/studio/middle-east`: "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token` with no header → 401 and no token; fake bearer → 500 with no token; bare → 400. Attempt 1 timed out on a cold route compile (environment-invalid, kept) | `g333-auth.json`, `g333-auth-attempt1-timeout.log` |
| DOCS | PASS: l.1 names c2b-ii; l.4 is byte-exact; l.5 names the panel; the c2b-ii section has items 35–38 with D-29z992; the four alternatives and the c2b-iii, HOOK-LIVE and DETAIL-CLIPGAIN TODO items are present; 7 `## ` headings. Every DP id the doc cites exists as an `it(` row (DP1 lives in `preview-store.test.ts`) | doc 232 |

## Honest limits
- **Step 5, range on another lane.** The inputs did not change on either tree (A equals HEAD). Only DP39 (jsdom) covers the "falls back to the clip bounds" case, not the browser.
- **1280×720 step 2.** The trim-edge drag landed on the fade handle ("Undo: Fade In") on both trees. The real trim-edge path is covered at 1440×900, in DRAG-NAMES, and by DP34 and DP38.
- **Collapsed Clip details at 1280×720.** The panel starts collapsed by the fit rule. It was expanded with a real click before the steps; the same applies to HEAD.
- **A-R333-DP42-FOCUS-PREMISE.** The browser shows the same thing on A and HEAD: pointerdown on the clip takes focus off Start (focus null during the drag). It is not a regression and not a bug.
- **Gate rows, not claimed:** full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
- **Ableton conformance:** not applicable (perf round, behaviour held to HEAD).

Bugs: none.
