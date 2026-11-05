# C — Round 340 (REGRESSION-ROUND-2026-11-05) — PARTIAL, honest report

**Verdict: INCOMPLETE. taskStatus = BLOCKED (time/budget), not PASS. `regression-last.json` must NOT be updated.**
No bug found in the rows that ran. Most of the §3/§4/§4c/§4d rows did NOT run, so `browserVerified=false`.

SOURCE-SCOPE start and end: HEAD `99a5912`, status empty, protected 11/11 OK, `sha256sum -c r340-tree-sha256.txt` 0 failures (both times). No scope fail.
Dev server :5173 only; no second server; mock API (:5199) not started, so store/journey rows did not run.

## Rows that ran (real Chromium, both viewports unless stated; evidence in `c-round-340/`)
| Row | Result | Evidence |
|---|---|---|
| G340-AUTH | PASS. Anonymous `/studio-lab` shows workspace and demo badge, `auth_user` null. `/studio/middle-east` shows "Sign in required", 0 `audio[src]`. `/api/studio-token`: none 401, fake Bearer 500 (no mock), bare 400, no token in any body. Premium auth not bypassed. | `tools/g340-auth.json` |
| R340-GROUP-MOVE | PASS. `group-probe.mjs` behaviour fields equal `b-round-338/probe/head-<w>.json` (0 diffs); Undo reads "Move (2)"; pageErrors []. | `out/group-{1440,1280}.json` |
| R340-CROSS-LANE | PASS, with a gap. `cross-lane-probe.mjs` is NOT a playing run. Compared to `c-round-338/probe-head-<w>.json`, the only difference is the per-commit list length (counts, excluded by the task). Ghosts show, one Undo `Move to track — Stems`, Esc restores. My own playing run: ghosts show (2), `data-playing` stays true during and after drop, the clip lands on `stems`, Undo `Move to track — Stems`, no pageErrors. | `out/cross-*.json`, `out/exp340.json` |
| R340-HINT | PASS (matches round 303). Hint appended once on the first Enter/drop add. Second add: none. Video-first: none; the later audio add has it. Note: after a **reload** the hint shows again (as round 303 recorded PASS). The task text says "not after reload", which contradicts round 303; B should settle which is meant. | `tools/main.json` |
| R340-RESCHEDULE (CONT-1 only) | PASS. 1 clip, edit during playback: seams 0, tapMissed 0, ratioToBaseMax ≤ 0.056, zeroRun 0, valid. CONT-30, ENDED, NO-CHANGE not run. | `out/continuity.json` |
| R340-FONTS (partial) | Partial. 0 Google font requests, 3 woff2 served OK. This is the dev server, so the `/s/` path and the 2 CORS preloads were not verified; FONT-PIXEL not run. | `out/font.json` |
| Journey, Studio half (not the store half) | PASS for what ran. Enter adds a clip, video file input adds `1.mp4` (video clip present), Space plays, Stop, Export WAV: 24-bit/48 kHz stereo, 101.602 s (dialog: 00:00.000 — 01:41.602), 0 NaN, peak 0.996, rms −15.5 dBFS, silent only 2/1017 tenth-seconds. SHA256 identical at both viewports (deterministic). Dialog says video is not rendered; export is audio only (disclosed). | `out/exp340.json` |

## Not run (honest list; none counted as PASS)
R340-WAVEFORM, DETAIL-TEXT, OVERVIEW-METER, SHOWN-READERS, PROJECT-END, FADE-STATUS, DRAG-A, SELECTION, RANGE, PEAKS, WORKER-R2, PERF3D, NAME, JOURNEY (store half, needs the mock), all of §3 (RG-01…24, RG-T*), §4/§4.S/§4b/§4c, all §5 parked rows, RR-PERF, RG-SMOKE.
Reason: the job's time/budget, and the heavy per-round scripts for 258–338 were not rebuilt. The `perf`, `smoke` and 301-era tools exist in `c-round-301/tools`.
Planned order was followed up to G340-AUTH only partially (§4d rows were reordered by risk: newest source changes 338/339 first).

## Bugs
None found. Observation: the "not after reload" wording in R340-HINT vs round 303's "shows again after reload".

## For B
Round 341 must continue the missing rows from the list above. `regression-last.json` stays unchanged. c4-ii should wait until the missing rows ran, or B accepts the risk knowingly. The two source-changing rounds (338 c3-ii) are covered by cross-lane and group probes; 325–337 drag/readout/waveform rows are unverified in this round.
