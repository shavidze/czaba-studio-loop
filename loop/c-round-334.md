# C round 334: PERF-DRAG-PREVIEW stage c2b-iii (ArrangementPeakPath primitive props)

**Verdict: PASS.** `browserVerified` true. A's tree on :5173 vs HEAD `3f945e3` (git archive, own Vite cacheDir, :5197), at 1440×900 and 1280×720. Evidence is in `c-round-334/`. Source was not edited: `git status` is 7 M / 0 untracked at start and end, and the claims output at the end equals the start.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS: equals `a-round-334/claims-after.txt` (empty diff), at start and at end | `claims-c.txt` |
| SOURCE-SCOPE | PASS: 7 M, 0 untracked; `git apply -R --check sketch.patch.txt` passes (test hunks are byte-equal to the sketch); `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementContext.tsx`, `perf/` untouched; protected 11/11 OK | — |
| UNIT ×3 | PASS: 4 files, 95/95, rc 0, three times; DP43–DP48, WG9, WG10 present once each | `unit-{1,2,3}.log` |
| MUTANT (B's 9) | PASS: 9/9 red on exactly the rows in the §0 table, all restored. Scratch HEAD tree `bcc3a7c…` = `3f945e3^{tree}` | `mutants-c.txt` |
| MUTANT (C's own) | PASS: `waveformScaleForGainDb` with the video branch disabled → red on WZ1 and WZ4; file restored (cmp) | `mutant-c-own.txt` |
| DRAG-NAMES | PASS: `harness-clip-click` [100,0], `fade-moves` [10×4], `trim-moves` [22×4], `move-moves` [19,19,101,19]. Against HEAD: only `ArrangementPeakPathInner` is lost (1 per fade commit, 2 per move commit); nothing gained; HEAD equals c333 | `names-a.json`, `names-head.json`, `names-compare.txt` |
| PERF | PASS: prod build, run alone after warm-up, rc 0, `failures` [], complete, 167 rows, 36/36 asserted pass. 104 EQUAL, 17 DIFF, every DIFF lower and equal to B's sketch (fade 10.817→9.833, max 11→10; move 26.233→24.267, max 103→101). `hook-live` 1 | `perf-rowcmp-vs-c333.txt`, `perf-results/` |
| WAVEFORM-D | PASS: `DIFFS 0` at both viewports, 22 samples, 0 page errors. The trim-start, Clip Gain typed and Clip Gain fader samples have different `d` values and each equals HEAD, so the equality is not vacuous | `wd-compare.txt` |
| WAVEFORM-D, C's trim-end | PASS: right-edge handle scrolled into view; 3 moves of 10 px left. 1440: width 4054.08→4020.08, `d` changes mid-drag and after release, equals HEAD at all 4 points, Undo restores. 1280: the first try at the handle's vertical centre hit the fade-out handle instead (fadeOut 0.85, same on both trees); a drag at the handle's lower part changed the clip, `d` equals HEAD, Undo restores | `trimend-*.json`, `trimendlow-*.json`, `trimend-compare.txt` |
| VIDEO-WAVE | PASS: on A and on HEAD, at both viewports, the video clip's `d` at select 1×, zoom 4×, move mid, move released and Undo is equal. 1× equals 4×. The move changed the clip (left 0→34 px) and Undo restored it | `video-{a,head}-*.json` |
| D-ROWS | PASS: `rows-diff` `DIFFS 0`, no page errors on either tree. Export WAV sha256 `453d1a04…ac567` equals HEAD's at both viewports. Real audio data: 48 kHz, 24-bit, stereo, 118.815 s, 5 703 120 frames, first audible 41.91 s, 7 382 335 non-zero samples | `rows/rows-{a,head}.json` |
| G334-AUTH | PASS: fresh anonymous contexts, both viewports. `/studio-lab` shows the workspace and the demo badge with `auth_user` null. `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token` with no header → 401, fake bearer → 500 with no token, bare → 400. Premium auth is not bypassed. (Attempt 1 timed out on the cold compile of the legacy route; environment-invalid, kept.) | `g334-auth.json`, `g334-auth-attempt1-timeout.log` |
| DOCS | PASS: l.1 and l.4 byte-exact, l.5 names both lib files, the c2b-iii section (l.75), three alternatives, files entries, problem entry, the c2b-ii testing sentence, the new testing entry, TODO edits; `^## ` count 7; every cited DP/WG/WZ id exists as an `it(` row | — |
| Gate rows | `gate` — full vitest, build, Biome, typecheck, verify, e2e smoke are the root gate's (not claimed) | `gates/gate-round-333.json` is the chain head |

## Bugs
None. A's code-reviewer notes (Low A-R334-REVIEW-WG9-UNDEF, A-R334-REVIEW-DP-ORDER, A-R334-REVIEW-DP43-DETAIL) stay with B as test-hardening candidates; WG9's `not.toBe(undefined)` hazard is guarded today because `expectedShape` throws without peaks.

## Limits
- Ableton conformance: not applicable (perf round; drawing held equal to HEAD).
- The trim-start drag at 1280×720 does not change the clip in B's probe (known from round 333); C's trim-end sample covers the edge there.
- Backend-dependent rows: none.
