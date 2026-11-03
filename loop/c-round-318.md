# C round 318: PERF-8a verification — FINAL: FAIL (browserVerified true; see FINAL section at the end)

**A status:** `STOP — needs B ruling` (§6 bullet 3). The round cannot PASS.

## Done so far
- SOURCE-SCOPE: HEAD `50662e1` (root deps commit, only package.json + lock, 36 status entries). 7 app files + 2 new (range-store.ts, range-store.test.tsx) + 27 test files. 22 = range-test-files.txt; 5 extra: insert-marker-ui, meta-shortcuts-ui, mode-toggle-colour-ui, status-lifetime (typecheck exception, A-listed), gesture-reentry (A-flagged, prop literal).
- Protected: 10/11 OK, only `package.json` FAILED — caused by root's deps commit, expected; B must re-baseline `b-round-312/protected-sha256.txt`. Not an A finding.
- CLAIMS (c-round-318/claims-c.txt): K4 0, K5 0, K7 0, K11 0, K12 2, K13 1, K15 1, K16 4 as required; **K14 0 (required 3)**, **K8 10 (required 11)**, K6 9 (A lists 9).
- Harness counting (perf/studio-lab-interactions.perf.spec.ts:384-415): `inWindow` = every commit between the first pointermove and pointerup; `move-components-per-move` = sumRendered(inWindow)/moves. So the K15 layout-effect commit is summed into the per-move row. A's structural argument holds.

## Pending
PERF-RANGE / PERF-LOAD (running alone), R-rows, UNIT/mutants, G318-AUTH.
- EXPECT: `expect-count.py` on A's tree == head byte-for-byte (22 files, TOTAL 3,139). The 5 extra files keep their counts (insert-marker-ui 204, meta-shortcuts-ui 98, mode-toggle-colour-ui 30, status-lifetime 145, gesture-reentry 37). Across all test diffs 0 removed lines contain `expect(`; removed lines are only the probe (`api.current = useArrangement()`), its type and imports, the `range={null}` prop literal (gesture-reentry) and the DXT8 needle (mode-toggle-colour-ui).

## PERF-RANGE (alone; both scratch prod builds, logs perf-h-interactions.log / perf-a-interactions.log)
- Baseline control `50662e1`: range move-components-per-move **108.167** (stopped & playing), max **105**, drag-range-live 1 → row not vacuous.
- A: per move **21.033**, max **39**, drag-range-live 1, playing move-restarts 0, test rc 0. **≤ 15 NOT met** (reproduces A's numbers exactly).
- Note: baseline interactions JSON was deleted by my driver bug before copying; the logs hold the full row tables. A's JSON: perf-a-interactions-*.json.
- **Rise in other rows (finding C-R318-01):** `rowcmp-interactions.txt` — 37 deterministic rows rise by exactly +2 components per commit: click.components 109→111, drag.move per-move 107.283→109.25 / max 106→108, trim 108.167→110.133 / 105→107, fade 103.25→105.217 / 105→107, play.start/stop 94→96, zoom.1 102→104, zoom.30 247→249. Cause (source read): `ArrangementRangeReadout` and the `ArrangementRangeDetailPanel` wrapper (StudioWorkspace.tsx ~556-585, rendered at 3149/3184) are not memoized, so each StudioWorkspace commit renders 2 extra fibers. Both are in a granted file.

## Attempt 2 checkpoint (16:25 UTC)
- R-rows (c318-rows.mjs, baseline :5190 vs A :5191, prod builds): **0 diffs** at 1440×900 (`rows-*-1440.json`), 1280×720 (`rows-*-1280x720.json`) and 1280×720 with reload before SPLIT (`rows-*-1280x720-reload.json`); `diffrows.txt`. No page errors. Exports: range WAV 279,600 frames = 5.825 s @48k/24-bit/2ch, project 111.352 s; **byte-identical** baseline vs A at both viewports (cmp).
- Observation (baseline too, not A): at 1280×720 without reload, after Space/Space/Home, Ctrl+E reports "Could not split at the time selection." and the next Undo undoes the Add. Same in baseline → not in this round's scope; logged for B as INFO.

# FINAL — C round 318 verdict: **FAIL** (browserVerified = true)

A stopped under §6 bullet 3 (`STOP — needs B ruling`); the round's core acceptance (range drag ≤ 15 components) is not met, and A rows A-CLAIMS-AFTER (K14), notices, doc 230, A-REVIEW and A-MUTANTS were not done by A. Behaviour of A's partial tree is **identical to the baseline** in every browser row, so the partial work is safe to keep if B rules to accept or extend it.

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS with note: HEAD `50662e1` = root deps commit on `a5a9c97` (only package.json + lock). 36 status entries, all in §2.1 or the §4 typecheck exception (5 extra tests named by A). Protected 10/11 — only `package.json`, changed by root's deps commit → B re-baseline (C-R318-05) | git-status-start/end.txt (unchanged during C phase), claims-c.txt |
| CLAIMS | FAIL: K14 0 (need 3), K8 10 (need 11, root-caused). K4/K5/K7/K11 0, K12 2, K13 1, K15 1, K16 4 OK; K6 9 (A lists 9) | claims-c.txt |
| UNIT | FAIL (1/31): 30 files / 756 tests pass on C scratch `/tmp/c318u`; `third-party-licenses.test.ts` TL5 fails — notices not regenerated (C-R318-03) | unit-c.log, unit-files.txt |
| MUTANTS | PASS: MU-RANGE-IN-VALUE→RS4 red; MU-LANE-NEW-OBJECT→RS4/RS5/RS6 red (no loop); MU-NO-STATUS-REWRITE→RS6 red; MU-STALE-LATESTREF (splitSelection reads a render snapshot)→RS7 red; C own: C-MU-ALWAYS-NOTIFY→RS2 red, C-MU-IGNORE-TRACK→RS5 red. Restored green, files byte-identical to store | mutants.txt |
| EXPECT | PASS: 22 files = head, TOTAL 3,139; extra 5 files unchanged; 0 removed `expect(` lines | (attempt 1 notes above) |
| PERF-RANGE | **FAIL**: baseline 108.167 / max 105 (row not vacuous); A **21.033 / max 39** (≤ 15 required), drag-range-live 1, playing restarts 0, failures []. Plus +2 components on 37 drag/click/zoom/play rows (C-R318-01) | perf-h/perf-a-interactions.log, rowcmp-interactions.txt |
| PERF-LOAD | FAIL (same root cause): failures [] both; `load.components` 1126→1148 (+22 = 2 × 11 commits; A names 2 new always-mounted components — literal tolerance "+2" exceeded). No fader row rise in deterministic rows (only `.6x` record rows and `script-max` timing moved) | rowcmp-load.txt, perf-*-studio-lab.log |
| R-DRAG (snap on/off, Alt, mid-drag label) | PASS (identical) | rows-*-1440.json, rows-*-1280x720*.json, diffrows.txt, shots/*-drag-* |
| R-ALLTRACKS | PASS (identical; 4 lane overlays 12.500–18.325) | same, shots/*-alltracks-* |
| R-CLEAR | PASS (identical) | same |
| R-SPACE | PASS (identical playhead/status) | same |
| R-SPLIT / R-DELETE / R-CUT-TIME (+Undo/Redo) | PASS (identical; 1440 and 1280 reload run) | rows-*-1280x720-reload.json |
| R-LOOP / R-ZOOM | PASS (identical brace, loop times, grid 1→0.5) | same, shots/*-loop-* |
| R-EXPORT | PASS: range enabled only with a selection; range WAV 279,600 frames = 5.825 s, project 111.352 s, 48 k/24-bit/2ch, **byte-identical** h vs a at both viewports | /tmp/c318-*.wav cmp, rows json |
| R-DETAIL | PASS (fields follow drag; typed From/To move range; status identical "Time selection: 00:13.500 — 00:19.000 · Music.") | rows json |
| R-BG / R-MARQUEE | PASS (identical; BG overlay stems 7.5–13.0; Ctrl+drag marquee visible, selects the clip, no range) | rows json, marquee.json, shots/*-marquee2-* |
| R-TRANSPORT | PASS (13 transport buttons, titles/disabled identical with and without range) | rows json |
| G318-AUTH | PASS: both viewports anonymous `/studio-lab` workspace + demo badge, `auth_user` null, 0 errors; `/studio/middle-east` Sign in required, 0 `audio[src]`; token no header 401, fake bearer 500, bare 400, no token in bodies | g318-auth.json |
| Gate rows | `gate` (not claimed) | — |

Ableton conformance: not applicable (no behaviour change; confirmed by identical R-rows).

L57 fields: assertsSpecified 7 (RS1–RS7 present), mutantsRecorded 4 (+2 C), mutantRedOnSketch: all red on A's tree.

INFO-C318-1280-SPLIT (baseline too): at 1280×720, after Space, Space, Home on a selection, Ctrl+E said "Could not split at the time selection." and the next Undo undid the Add. Identical in baseline; not investigated further this round.

Notes after review:
- C-R318-01 cause (unmemoized `ArrangementRangeReadout` / `ArrangementRangeDetailPanel`) is **inferred from a source read, not confirmed by experiment**. The +2 per commit and 2 × 11 = 22 arithmetic fits it.
- PERF-LOAD tolerance is ambiguous: `load.components` sums all 12 load commits. Read per commit, A's +22 (= 2 per commit for its 2 named components) is exactly within tolerance; read as a total, it exceeds +2. B rules.
- `c-round-318/auth-probe-superseded.json` is a superseded first probe (wrong badge regex, no query params). `g318-auth.json` is the authoritative result.
- INFO-C318-1280-SPLIT is now tracked as bug C-R318-06 (origin: pre-existing baseline).
