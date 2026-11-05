# C round 347 — PERF-DRAG-PREVIEW c6-ii (lane MixFader + DetailClipGain memo)

**Verdict: PASS.** 0 bugs. browserVerified = true. HEAD `4895732`, source unchanged during C (7 changed files, same list). Real Chromium (Playwright) on dev :5173; perf on production server; HEAD comparison on a scratch `git archive HEAD` dev server (:5197, private cacheDir, stopped, scratch deleted).

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | equals A's final | `c-round-347/claims.txt` |
| SOURCE-SCOPE | 5 modified + 2 untracked; `git apply -R --check source.patch.txt` clean | shell |
| READ | diff = B's sketch: hook has no JSDoc; `renderPanReadout` is a `useCallback` with deps `[isPanCentred, setTrackPan, trackId, trackName]` (not stable handler); no `any`/`as`/`@ts-ignore`/`console.log` | diff |
| UNIT | 18 files, 395/395 (SH 4/4, drag-preview-render 67/67) | `unit.log` |
| MUTANT (C's own, scratch) | (1) lane pan double-click inline → DP65 red; (2) `onFaderChange` inline arrow → DP65 red; (3) hook returns `handler` → SH1 red. Scratch deleted; `store/` unchanged | `mutant1-3.log` |
| NAMES (browser :5173, after warm-up) | fade [4,4,4,4]; trim [15×4]; move [12,12,82,12]; click [83,0]. No MixFader/DetailClipGain in any fade, trim or non-crossing move commit; crossing commit (82) holds Master+MixFader as D-29z1098 allows | `names.json` |
| FADER-LANE (1440 and 1280) | (a) Volume drag readout follows mid-drag (-9.0), commits -12, one Undo restores 0. (b) ArrowDown keys: "Undo: Volume" entry per key (max is 0 dB so ArrowUp is a no-op by design), identical to HEAD. (c) dbl-click resets to 0. (d) pan drag 35, dbl-click → 0, reset disabled state follows (true→false→true), reset button click re-centres and focus lands on Pan slider. (e) blur mid-drag cancels the pan (40→0, stays 0 after release). (f) video lane "Volume — Original video sound" keeps its title, keys and dbl-click work | `faders.json`, `faders2-after.json`, screenshots |
| FADER-CLIPGAIN (both) | (a) drag previews (21.0) and commits for 1 clip and for a 2-clip selection (both clips -25.2; one Undo restores both to 0.0). (b) dbl-click → 0. (c) A=6, B=-3, select B, type 12, Esc → field shows -3.0 (latest closure). (d) Enter and blur commit (4.0, -8.0). (e) reset button works and does not steal focus (`onMouseDown preventDefault`): focus stays where it was — `BODY` in `faders.json`, the fader in `faders2-after.json`; both match HEAD behaviour, not a regression. (f) imported synthetic webm: video clip selected → fader and field disabled with reason "A video clip has no Clip Gain — use the track Volume/Mute"; audio clip again → enabled. At 1280×720 the Clip details panel is collapsed by default; expanded via its toggle first | `faders.json`, `faders2-after.json` |
| HEAD parity | the faders2 probe run on HEAD gives a byte-equal result to after (`faders2-head.json`) | `faders2-*.json` |
| VISUAL | lane Volume/Pan input outerHTML, readouts, pan-reset, detail clip-gain block: `visual-after.json` is byte-identical to `visual-head.json` at both viewports **after stripping `id="…"` and `aria-describedby="…"`** (React `useId` values can shift when `memo` adds a fiber level). The unstripped comparison was not run, so id-attribute identity is unverified (info; the READ of the diff shows no JSX attribute change) | `visual-*.json`, `visual-*-{1440,1280}.png` |
| PERF (production, alone) | rc 0, complete, failures [], 230 rows, 60/60 asserted pass; vs C346: 100 EQUAL, 65 DIFF, 0 NEW, **0 higher**. Per move: trim 17.7→14.75, move 18.467→15.317, fade 5.9→3.933; click 88→83. durationMs 440477 | `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c346.txt` |
| FADER-PERF (production, alone) | complete, failures [], 321 rows, 94/94 asserted pass; vs C341: 164 EQUAL, 0 DIFF, 0 NEW. durationMs 393996 | `fader-perf-results/latest.json`, `fader-perf-rowcmp-vs-c341.txt` |
| PERF-LIB | 40/40 | `perf-lib.log` |
| G347-AUTH | fresh anonymous contexts at both viewports: `/studio-lab` opens the workspace + demo badge ("Demo collection — no sign-in required"), `auth_user` null; `/studio/<id>` shows "Sign in required", 0 `audio[src]`; `/api/studio-token` GET 400, POST 405 (refused). Premium auth not bypassed | `auth.json`, `auth-*.png` |
| DOCS | doc 232 l.4 = "...c6-ii...; C round 347 pending"; one `### ეტაპი c6-ii`; 7 `## `; 0 "C round 346 pending" | grep |

**Gate rows (not claimed):** full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke.
**Ableton conformance:** not applicable (performance change, behaviour identical to HEAD).
**Limits observed (recorded, not bugs):** the ClipGain memo does not hold in the no-selection state and Master/GroupHeader still receive inline props (D-29z1098). Route A-R347-REVIEW-L1/L2 (Low, from A's reviewer) stay with B.
**Note for B (Low, info):** a held/repeated arrow key on a lane Volume fader creates one history entry per key (keyup commit); same on HEAD, unchanged by this round.
**Backend-blocked rows:** none.
