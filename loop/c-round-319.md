# C round 319: PERF-8a fix-up verification — FINAL: FAIL (browserVerified true; A STOP confirmed)

A status: **STOP — needs B ruling** (§6 bullet 4: memo naming `const X = memo(function X…)` renames inner fn to `X2`, breaking name-keyed probes R11-P1e / CP1 outside round 318's 27).
Verdict so far: FAIL (incomplete deliverables, consistent with STOP). Evidence rows run on A's handed-off tree to inform B's ruling.

## Done
- SOURCE-SCOPE: `git status` 37 entries = round 318's 36 + `ArrangementDetailPanel.tsx` (granted). Protected 11/11 OK (K8).
- CLAIMS: `c-round-319/claims-c.txt` identical to `a-round-319/claims-after-reverted.txt`. K14 0, K19 0/0, K20 (560), K21 0 (not done, STOP).

- STOP-REPRO (independent): scratch `/tmp/c319m` = A tree + `patch -p0 < a-round-319/memo-wrappers.patch.txt`. `render-budget` + `clip-gain-pointer-preview`: **2 failed / 31 passed** (R11-P1e l.439 `expected 0 to be greater than 0`; CP1 l.557 `expected +0 to be 8`) — `c-round-319/stop-repro-memo.log`. Same files on A's handed-off tree: 33/33 (`stop-repro-a.log`).
- Mechanism confirmed with esbuild `transformSync` on the memo variant: emits `function ArrangementPeakPath2`, `ArrangementClipRangeOverlay2`, `ArrangementDetailPlayhead2`, `ArrangementDetailWaveform2`.
- Vacuity (L52) confirmed by reading: CP1 `PARENT_NAMES` (l.220–228) keys `'ArrangementDetailWaveform'`; R11-P1e l.454/l.469 `ArrangementDetailPlayhead toBe(0)`. Under the rename those count 0 always → the guards pass but can never fail. B's ruling must cover them.
- O2 experiment (scratch `/tmp/c319o2`, one run): memo consts `ArrangementPeakPathMemo`, `ArrangementDetailPlayheadMemo`, `ArrangementDetailWaveformMemo` = `memo(X)` with function names kept, 3 call sites switched → both tests **33/33 green** (`o2-experiment.log`). Bail effectiveness of O2 not measured here.

- EXPECT: `expect-count.py` HEAD 3,139 = A 3,139, no file lower (`expect-count-{h,a}.txt`); 5 extra files + render-budget/clip-gain-pointer-preview unchanged.
- SOURCE review: overlay JSX in `ArrangementClipRangeOverlay` byte-equal to HEAD's inline block (re-indented; `range ? … : null` → early `return null`). Detail panel: `range?` optional, store subscription unconditional, explicit prop wins; chevrons hoisted (ChevronRight extension, same props).
- Prod builds in scratch: `/tmp/c319h` (git archive 50662e1) and `/tmp/c319a` (A tree) rc 0. Client bundle grep `ArrangementClipRangeOverlay`/`ArrangementPeakPath`: 0 hits → prod minifies component names; named-fiber attribution must run on dev.
- PERF-RANGE (alone, prod, `perf-{h,a}-interactions.log`, JSON kept in `perf-{h,a}-interactions-results/`): baseline control range per move 108.167 / max 105 (non-vacuous). **A handed-off tree: per move 14.15, max 32, drag-range-live 1, playing move-restarts 0, failures []** (both stopped and playing). Budgets NOT asserted (K14 0) → the row's 'mode: assert' part is not met.
- Row compare (`rowcmp-interactions.txt`): RISES only `interact.zoom.30.components-{max,per-key}` 247 → 275 (+28). DROPS: click 109→107, fade −2 (N=0), move/trim −1, zoom.1 −1, play start/stop −2. Arithmetic matches "−2 (round-318 wrappers gone) + N overlays" with N=0 click/fade/play, 1 move/trim/zoom.1, 30 zoom.30 — to be confirmed by dev profiler.

- PERF-LOAD (alone, prod, `rowcmp-load.txt`): failures [] both. Median `load.commits` 8→12 / `load.components` 750→1109 is the documented commit-count race (row note: wall-clock). **Matched by commit count A is lower:** 7 commits 656→649 (−7), 12 commits 1126→1109 (−17). The harness exposes no per-commit breakdown (`details` null), so matched-commit totals are the proxy; 'no per-commit rise' is inferred from them. No fader component row rises. `fader.clipgain-members.playing.frames-over-33.6x` 0→1 is a 6x wall-clock frame count (noise class seen in round 318).
- Named-fiber attribution (dev, `c319-diag.mjs`, baseline dev :5197 own cacheDir vs A :5173; `diag/namediff.txt`): dev totals equal prod (zoom30 247→275, move 104→103 main, range 9+5).
  - clip click: −2 (ChevronDown+forwardRef hoisted), overlay N=0 ✓.
  - name-bar move: +29 `ArrangementClipRangeOverlay2` (1/move), −30 ChevronDown, −30 forwardRef ✓.
  - zoom30 (only rising prod row): **+30 `ArrangementClipRangeOverlay2` (one per clip), −1 ChevronDown −1 forwardRef → +28** ✓. Every rise is the overlay.
  - range steady (A): main 9 = overlay, DetailPanel, ContentInner, Waveform, PeakPath, Playhead, ClipGain, Readout2, TimeText; layout 5 = ContentInner, Waveform, PeakPath, Playhead, ClipGain. Max 32 = transport flip (20) + the 9 + InsertMarkerLine etc.

- UNIT (C scratch `/tmp/c319a`): A's 45 files **897/897** (`unit-c.log`). `third-party-licenses.test.ts`: **TL5 red** (1 failed / 69 passed, `unit-licenses.log`): notices not regenerated → the gate's full vitest would fail on this tree.
- `perf/lib/report.test.ts` (scratch perf config) not run: budgets unchanged, same as A.
- Environment: the first G319-AUTH attempt and the first baseline click profiler run timed out on cold dev compiles; each was replaced by one retry (INFO-C319-AUTH-COLD, INFO-C319-DIAG-COLD).
- MUTANTS (`mutants.txt`, scratch `/tmp/c319mu`, runner `/tmp/c319mu-scripts/mutants.py`): base green 67/67; MU-RANGE-IN-VALUE → RS4 red; MU-LANE-NEW-OBJECT → RS4/RS5/RS6 red; MU-NO-STATUS-REWRITE → RS6 red; MU-STALE-LATESTREF (event-time split read replaced by a render-snapshot null; approximation, latestRef no longer carries range) → RS7 red; C-MU-OVERLAY-IGNORE-TRACK → RS5 red; **C-MU-DETAIL-IGNORE-PROP (panel ignores explicit `range` prop) → survived, 60/60 green on detail-panel + track-layout** (C-R319-03). Restored green 67/67.
- Browser R-rows (`c319-rows.mjs`, prod servers baseline :5291 / A :5292, both viewports, fresh contexts; `rows-{h,a}-*.json`, `diffrows.txt`, `rows-summary.txt`, shots `shots/`):
  - 1440×900: 52 keys, 2 diffs, both wall-clock only (`WAVE_afterAdd.waitedMs` 2 vs 3; `SPACE_stop.left` 1039 vs 1040 px after a timed stop). 1280×720: 1 diff (waitedMs). 1280×720 reload-before-split variant: **0 diffs**. No page errors.
  - R-DRAG: label updates mid-drag (00:12.500 – 00:15.413 · 2.913 s), clip overlay box left/width 101/116.5 → 101/233 equal to baseline; Alt and Snap-off variants equal to baseline.
  - R-DETAIL: From/To fields follow the drag (13/19), typed From 13.5 and To 15.75 move the range, status equal. Detail playhead moved during playback at 1440 (0.27% → 0.96%). At 1280 that sub-check was **not exercised** (harness: the panel started collapsed, the script clicked the toggle, so Space most likely went to the focused button); equal to baseline.
  - R-SPLIT/DELETE/CUT-TIME, Undo/Redo: identical clips + status at 1440 and 1280-reload. At 1280 without reload the pre-existing C-R318-06 reproduced on **both** builds ("Could not split at the time selection." then Undo removes the Add).
  - R-LOOP/R-ZOOM equal. R-EXPORT: range WAV 279,600 frames / 5.825 s / 48 kHz 24-bit stereo; project 5,344,896 frames; **all 4 WAV files byte-identical** baseline vs A (`cmp`).
  - R-TRANSPORT: titles + enabled state equal with and without range, equal to baseline. R-BG / R-MARQUEE equal.
- R-WAVEFORM supplement (`c319-wave.mjs`, `wave-{h,a}.json`): zoom with `=`/`-` (clip width 4054→5068→6335→…→4054); clip waveform `d` hash equal to baseline at every zoom step; detail waveform `d` equal. Notes: (a) the clip `d` is zoom-invariant over this range on **both** builds (the task's "d changes with zoom" is not true at the baseline either; equality holds); (b) the late-peaks sub-check is not genuinely exercised: in a fresh context the path is already drawn 3–6 ms after Add (demo peaks are ready before Add). The PeakPath memo it was meant to guard is not on this tree anyway (reverted by A).
- G319-AUTH (`g319-auth.json`, :5173 = A tree, fresh anonymous contexts): both viewports `/studio-lab` workspace + demo badge, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; `/api/studio-token` no header 401, fake bearer 500 no token, bare 400. **pass true**. First attempt timed out on a cold dev compile (log overwritten by the retry).
- Store untouched by C: 37 status entries before and after; protected 11/11 OK.

## Verdict
**FAIL.** A stopped legitimately (§6 bullet 4). C reproduced the cause independently. The handed-off tree behaves exactly like the baseline in every browser row, so B can continue on it. In production it already measures 14.15 per move and a max of 32, inside ≤ 15 / ≤ 35. The round's deliverables are missing, though: the budgets are not asserted (K14 0), K19 is 0/0, the notices are not regenerated (TL5 red), docs 168/230 are not written, A did not run its own prod perf or mutants, and the review is partial.

### Findings for B
- **C-R319-01 (medium, origin: B spec K19/§1 + B sketch pre-check):** the required `const X = memo(function X…)` form makes esbuild emit `function X2`. That breaks R11-P1e (`render-budget` l.439) and CP1 (`clip-gain-pointer-preview` l.557) and silently blinds CP1 `PARENT_NAMES` 'ArrangementDetailWaveform' and R11-P1e l.454/469. Options are in A §2. **C's O2 experiment** (`XMemo = memo(X)`, 3 call sites switched) keeps both files 33/33 green. O2's bail effect was not measured by C. The named-fiber rule must also count `ArrangementClipRangeOverlay2` / `ArrangementRangeReadout2` under the current form, and only on dev (prod minifies names).
- **C-R319-02 (medium, origin: A STOP):** incomplete deliverables (K14 0, K19 0/0, K20 (560), K21 0, K2 37 not 41, TL5 red, doc 168 not updated, A-PERF/A-MUTANTS not run by A, A-REVIEW partial).
- **C-R319-03 (low, origin: A tests / B §5):** "an explicit `range` prop wins over the store" is unguarded. A mutant that ignores the prop survives detail-panel + track-layout (60/60), because both direct-render tests pass `range={null}` while the store is also null.
- Info: R-WAVEFORM late-load not exercisable as written; clip `d` zoom-invariant at the baseline too. C-R318-06 reproduced again on both builds at 1280 (pre-existing Low).

### Numbers B can use for O4 (handed-off tree, prod)
Per move 14.15 (headroom 0.85), max 32 (headroom 3). Steady move = main 9 + layout 5. Dev equals prod.

### Ableton conformance
Not applicable (no behaviour change, no new reference). Gate rows (full vitest, build in store/, Biome, verify, e2e smoke) are not claimed.
