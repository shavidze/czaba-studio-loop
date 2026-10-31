# C round 285 — PERF-3b verification (seconds ruler page window + Follow flip notify)

**Verdict: PASS.** `browserVerified` = `realVerified` = **true**. Every §8 browser row ran in real Chromium (Playwright), on production builds of HEAD `0f99960`, A's tree and A's tree + W7, and the auth row also ran on the :5173 dev target. C found no new bug. One row is BLOCKED because the backend is unavailable in the cloud: the real backend's 401/403 for a forged bearer. ZOOM-TIMING is `record` only and the gate rows are not claimed.

## Setup
- Store HEAD `0f99960`; A's working tree = 7 M + 1 ??.
- Scratch builds in `/tmp/c285`:
  - `head` (`git archive 0f99960`);
  - `a` (a copy of A's working tree);
  - `w7` (`a` + `b-round-284/mutants.py W7`; the diff to `a` is exactly the one `notifyTimelineScroll();` line, see `c-round-285/w7-vs-a.diff`).
- Each build has its own `cacheDir` (`/tmp/c285/vitecache-{head,a,w7}`, a vite.config edit in scratch only) and its own port (HEAD :5401, A :5402, W7 :5403). All three `remix vite:build` runs: rc 0.
- Each server ran alone, after one untimed warm-up `in` probe, and was stopped before the next one started (`c-round-285/run-tree.sh`). The :5173 dev server was not touched (200 throughout).
- B's probes (`ruler-probe.cjs`, `flip-probe.cjs`, `imgdiff.cjs`) were used unchanged from `b-round-284/`.

## Rows
| Row | Result | Evidence |
|---|---|---|
| CLAIMS | **PASS.** `claims-285.sh` on a `git archive 0f99960` scratch equals `claims-285-output.txt` except K1 (`(archive)`). The L29 untagged sweep found no fact about `store/` without a tag. The hits are grant-table paths, instructions, loop artifacts and the claims block itself; task l.16 ("its two lines … l.17 and l.101") restates K15/K26, which are tagged | `c-round-285/claims-c.txt` |
| SOURCE-SCOPE | **PASS at the start and at the end** (the end check ran after PERF-RUN): `git status` is 7 M + 1 ?? (the 6 §4 files, doc 212 and doc 213); `sha256sum -c sketch-sha256.txt` gives 6/6 OK, rc 0; doc 212 numstat is 3/3, with hunks only at l.4, l.17 and l.101, each byte-equal to the §4 text | — |
| TYPECHECK | **PASS**, `npm run typecheck` rc 0 | — |
| UNIT | **PASS.** The 69 covering files: **69 / 1,261 passed**, rc 0, 138 s. RW1–RW3 (`view.test.ts`) and SR1–SR6 (`tempo-window-ui.test.tsx`) each exist exactly once by name. The `git diff` of `tempo-window-ui.test.tsx` touches no `BU` line | `c-round-285/unit-69files.log` |
| UNIT-MUTANTS | **PASS.** C ran all eight on its own source copy of A's tree, with HEAD_TREE = C's archive. Each was red exactly at its §3 rows: HEADRULER, W1 and W4 at SR2–SR6; W2 at RW1, RW2 and SR2; W3 at RW1 and RW2; W5 at SR3; W6 at RW3, BU2–BU7, SR2, SR3, SR4 and SR6; W7 at SR6 | `c-round-285/mutants-c.txt` |
| RULER-NODES-IN | **PASS at both viewports**, A ×3 each:<br>• 1440: start 94, then `[76,62,50,40,64,40,50,62,76,94]` in all 3 runs (and in the warm-up);<br>• 1280: start 78, then `[64,52,42,34,52,34,42,52,64,78]` ×3;<br>• `coverage.missing` 0 at the start and at every step.<br>HEAD control: start 6,143 and key 5 12,286 at both viewports | `probe/a-in-{1440,1280}-{1,2,3}.json`, `probe/head-in-*.json` |
| RULER-NODES-OUT | **PASS.** A at 1440: 94, then `[60,74,92,48,60,48,92,74,60,94]`; at 1280: 78, then `[50,62,78,40,50,40,78,62,50,78]`; missing 0. HEAD: `[3073,3073,3073,1231,1231,1231,3073,3073,3073,6143]` at both viewports | `probe/a-out-*.json`, `probe/head-out-*.json` |
| RULER-PIXELS | **PASS.** `imgdiff.cjs` HEAD vs A: **28 / 28** shots per viewport have meanAbs **0** (in-start, in-1…10, out-start, out-1…10, jump-start, jump-0.25/0.5/0.999/0 and follow-zoom-start; the same set as B's `final-imgdiff`). `follow-zoom-stopped` is excluded (§1.3; 6.965 / 7.209). A visual check of `a-1440/jump-0.5.png` shows real labels from 25:24 to 25:46, not a blank strip | `c-round-285/imgdiff-{1440,1280}.json`, `shots/{head,a}-{1440,1280}/` |
| RULER-JUMP | **PASS.** A: `140/140/129/94` (1440) and `114/114/114/78` (1280), with missing 0. HEAD: 6,143 at every jump | `probe/a-jump-*.json`, `probe/head-jump-*.json` |
| RULER-FOLLOW-FLIP | **PASS.**<br>• A, no BPM, 2 runs per viewport: 1440 has 4 and 4 flips, 1280 has 5 and 5; `secondsGapRuns` `[]` in all four.<br>• A with BPM 120: 4 flips (1440) and 5 flips (1280), `[]`.<br>• **W7 control**: `[1,1]` at 1440 (4 flips) and `[1,1,1]` at 1280 (5 flips), so the oracle does see the painted gap.<br>The probe checks the seconds ruler only; the bars-ruler half is SR6 in jsdom | `probe/a-flip*-*.json`, `probe/w7-flip-*.json` |
| FOLLOW-IDLE | **PASS.** A, `follow` and `follow-bpm`, 6 s at both viewports: `rm.ruler` 0 and `rm.bars` 0 every second. Bars counts with BPM 120: 116 (1440) and 96 (1280), equal to HEAD's `follow-bpm` control (116 / 96) | `probe/a-follow*-*.json`, `probe/head-follow-bpm-*.json` |
| ZOOM-TIMING | **record.** See `c-round-285/timing-table.md`. `in`: A is 16 ms at every key at both viewports; HEAD is 40–56 ms, with 168 / 192 ms on key 5 and 120 ms on key 6. `out`: A's maximum is 88 ms on key 8 at both viewports (HEAD: 104 ms); B's sketch measured 56 / 48 ms there. This is the waveform band crossing from PERF-3a, which belongs to PERF-3c's exit decision. Not a verdict | `timing-table.md` |
| PERF-RUN | **PASS.** `npm run test:perf` ran alone on A's tree (09:23:54–09:37:19 UTC; no vitest, tsc, build or browser job beside it): rc 0, **3 passed** (13.4 min).<br>• All three reports have `complete` true, `failures` [], 0 problems, `harnessProblems` [] and 0 page errors.<br>• 125 assert rows PASS, 0 not PASS.<br>Records:<br>• `res.dom.ruler-1` = **95** and `res.dom.ruler-2` = **95** (C round 284 on HEAD's code: 267 and 469);<br>• `play.idle-commits` = 0;<br>• `interact.harness.zoom-live`, `zoom-live.6x` and `zoom-30-live` = 1 (assert PASS);<br>• `interact.zoom.30.key-window-longest-ms` median **11** (9.1–12.4); round 284 measured 73.4;<br>• `interact.zoom.1.key-window-longest-ms` 12.4, and 85.3 at 6× CPU;<br>• components-per-key 102 (1 clip) and 247 (30 clips), as in round 284 | `c-round-285/perf-run.log`, `c-round-285/perf/*.json` |
| DOC-213 | **PASS.** l.4 is byte-exact (§5); its seven `## ` headings equal TEMPLATE's in order; every cited row id (RW1–3, SR1–6, BU1/2/7/8) has exactly 1 hit; the mutant ids and their rows are §3's. The numbers were checked against `b-round-284/probe-results`: HEAD 6,143 / 12,286 and ET 112 / 160 / 64–72 ms (`head-in-*`); the sketch in/out/jump lists, ET 16–24 / 16 and 56 / 48 on key 8 (`final-in/out/jump-*`); the flip gaps `[1,1]` / `[1,1,1]` (`sketch-flipT-*`); 18 flips with 0 gaps (`final-flipT-*`: 4+4+5+5); 28 shots at meanAbs 0 (`final-imgdiff-*`, 29 files, only `follow-zoom-stopped` ≠ 0). Doc 212's l.4, l.17 and l.101 are byte-exact (§4) | — |
| G285-AUTH | **PASS** at both viewports, each a fresh context with no credentials, on :5402 (A prod) and on :5173 (dev):<br>• `/studio-lab`: badge `Demo collection — no sign-in required` = 1, `auth_user` null, Add present;<br>• `/studio/middle-east`: `Sign in required`, `audio[src]` 0, 0 workspace status, 0 clips;<br>• `/api/studio-token?product=middle-east&file=stem-01.wav`: no header → **401** (`Please sign in to access Studio.`); fake bearer → **500** (`Unable to prepare Studio access`), not 200 and no token.<br>Invalid attempt: the first :5173 run timed out waiting for `Demo collection ready`. The dev log shows `new dependencies optimized: firebase/app, firebase/auth … reloading` at 09:22:43, which is the environment. After an untimed warm-up, the retry passed.<br>A real backend 401/403 for a forged bearer is **BLOCKED: backend unavailable in cloud** | `probe/auth-a.json`, `probe/auth-dev.json`, `shots/auth-a/`, `shots/auth-dev/` |
| gate | The full vitest suite, the build gate, Biome, `npm run verify` and `test:e2e:smoke` are the root gate's. Not claimed | — |

## Neighbour checks (not §8 rows)
`c-round-285/neighbour-probe.cjs`, HEAD vs A, both viewports:
- **§10.3 ruler click-seek:** a click 400 px into the visible ruler moves the position readout `00:00.000` → `00:10.000` on both builds.
- **Transport:** Space plays for about 3 s (A `00:12.980`, HEAD `00:12.971`; wall-clock), and Space stops.
- **WAV export**, one demo clip:
  - 48 kHz, 24-bit, stereo, 4,864,896 frames = **101.352 s** (the clip length);
  - peak 1.0, RMS 0.17199, 99.766 % non-zero samples, no NaN, first non-zero frame 1155;
  - the data chunk's sha256 `ed0078a647c428a4…` is **identical** for HEAD and A at both viewports. The export is bit-identical to HEAD.
- `pageErrors` [] on all four runs.

Evidence: `probe/{head,a}-nb-{1440,1280}.json` and their `.png` files.

## Findings
**No new C bug.**

Notes for B:
- **A-R285-REVIEW-NAN-PAGE (Low, A's code-reviewer finding):** a non-finite page gives an empty window.
  - C did not reproduce it in the browser: `scrollLeft` is always finite there.
  - The code agrees with A's description: `readTimelinePage` and `parseTimelinePageKey` have no finiteness guard.
  - Under the 2026-10-23 gate it belongs in `deferred_low_polish`, as A proposes.
- **ZOOM-TIMING trend (info, not a bug):** the `out` path's key 8 (the 25 px/s waveform band crossing from PERF-3a) is 88 ms at both viewports on A's tree, against B's sketch at 56 / 48 ms and HEAD at 104 ms. PERF-3c's exit decision (p95 < 50 ms) should measure that key; it is not a ruler cost (the ruler has 48 / 40 elements there).
- **Environment (info):** the first G285-AUTH run on :5173 hit Vite's lazy firebase dependency optimisation (09:22:43). This is the same as C round 284's invalid attempt; after a warm-up the run passed.

## Ableton conformity
Not applicable (D-29z688): a pure performance round, and ruler pixels equal HEAD's (RULER-PIXELS).

## Scope notes
- Audio, export and source timing: the diff touches no graph or export code. As a neighbour check, a one-clip WAV export is **bit-identical** to HEAD at both viewports (see above). The full export and audio re-measurement belongs to the next regression round (`regression-last.json`, due ≥ 2026-11-02).
- Side effects:
  - `store/build/` and `store/test-results/` were written by PERF-RUN (both git-ignored);
  - scratch is `/tmp/c285` (and `/tmp/b284/mu-*`, which `mu.sh` creates and removes);
  - all C servers (:5401–:5403) are stopped; :5173 returns 200 and was not touched;
  - no app source was edited, and no commit was made.
- `probe/a-follow-zoom-*.json` (run only for the `follow-zoom-start` pixel shot; not a FOLLOW-IDLE row): during Follow at about 298 px/s, `rm.ruler` is 6 (1440) and 5 → 16 (1280). Each page flip re-renders the window once, as expected. This equals B's sketch exactly (`final-follow-zoom-{1440,1280}.json`: 6 and 5 → 16). HEAD shows 0 there because it renders every tick all the time.
- C did not run lint. A's "205 warnings" is A's claim and gate-owned.
- Checkpoint: `c-round-285/checkpoint.md`.
