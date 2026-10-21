# C — Round 71 verification (ROOT-R66-M1, D-29z36: metronome clicks on a 2 s horizon without a loop)

Verifier: C (independent, read-only for source). Date: 2026-10-21, 22:43–23:16 +04.

**Verdict: PASS.** `browserVerified: true`, `realVerified: true`, no bugs. Every REAL-browser row in §4.6 and §4.7 ran, and so did the G71-3 workspace rows.

I did not take any of A's claims on trust. I re-ran every gate, did the red run and mutations a–o in my own scratch, and measured all the audio rows in a real browser.

## Environment

- **Servers (`env-status.json`):** backend 200, store 200. My own checks gave `:5173/studio-lab` 200 and `:5199/api/products` 200, both at the start (22:43) and at the end (23:16). After the offline items there was no separate curl, but the first gstack `goto` at ~22:58 returned 200, and every PW load from 23:00 to 23:15 succeeded, so the store was up throughout.
- **`node.exe` count:** 58 at the start, 45–61 during the runs, 61 at the end.
- **Browser tools:**
  - gstack CLI (`BROWSE_STATE_FILE=c-round-71/c-browse.json`) for G71-3. The daemon's first start "failed within 15s"; the next invocation started it.
  - Standalone Playwright for the audio rows: installed chromium, a fresh context per run, no credentials. Rows are labelled **REAL-mouse (PW)**, and the node counter is labelled **instrumentation (PW)**.

## G71-2 — tree: PASS

- **HEAD:** `2be45dfea67f8289c77c83c9db47612d34f7c29f` at the start and at the end.
- **`git status --short`:** exactly the 8 lines from §3.1.
  - ` M`: `ArrangementContext.tsx`, `metronome-ui.test.tsx`, `metronome.ts`, doc 059, doc 062.
  - `??`: `metronome-horizon-ui.test.tsx`, `metronome-horizon.test.ts`, doc 063.
- **Frozen list:** 439 entries, 0 not OK.
- **Snapshots:** `SHA256SUMS.txt` 5/5 OK.
- **Protected files:** 4/4 OK.
- **Owned files:** I took their sha256 at the start (`c-round-71/gates/owned-sha-start.txt`). At the end all 8 matched, so no source changed during my phase.
- **EOL:** all 8 files have 0 CR. LF counts: 118, 2946, 493, 203, 500, 119, 109, 92.

## R71-S — static: PASS

**`metronome.ts`:** additive only.
- New: `METRONOME_SCHEDULE_HORIZON_SECONDS = 2`, `MetronomeHorizonState`, `nextMetronomeChunk`, and the optional `soundUntil`.
- `soundEnd` falls back to `until` when `soundUntil` is omitted, not finite, or `< until`. The beat-selection loop is unchanged, so the 3-argument path is identical.
- `nextMetronomeChunk` follows steps 1–5. It also has a finite guard on `from/startAt/end/nextFrom` (A's code-review fix L1). The guard is additive, and it prevents a `for(;;)` hang on NaN.

**`ArrangementContext.tsx`:** only the §0.1(2) items.
- The import and `metronomeHorizonRef`.
- `fillMetronomeHorizon` (`useCallback`, `[]`). It never resyncs.
- In `startGraph`:
  - the non-loop clicks are `planMetronomeClicks(bpm, from, horizonUntil, end)`;
  - the loop branch keeps the 3-argument `planMetronomeClicks(metronomeBpm, from, loop.end)`;
  - the state is set right after `handleRef.current = handle`, using the same `from` and `startAt` locals that are passed to `applySchedule`;
  - the state is `null` when the metronome is off or a loop is active.
- Call sites: after `fillLoopIterations()` in `startGraph`, and after the loop-late block and before `releaseRetiredGraphs` in `pumpPlaybackAudio`.
- `stopGraph` sets the state to `null`.
- No new timer, interval, listener or `AudioContext`.

**`metronome-ui.test.tsx`:** only the import plus the UI2, UI4, UI5 and UI10 expectations. The test names and the `it` count (10) are unchanged.

**Docs:**
- doc 059 has exactly two edits: the status line `C PASS (round 66), გამოქვეყნდა b5fb12b` and one sub-item after item 7;
- doc 062 has only its status line;
- doc 063 exists, with every TEMPLATE section and the status line `Round 71 — D-29z36; C-ის შემოწმებას ელოდება`.

**Banned patterns:**
- No `any`, `@ts-ignore`, comments or hardcoded colours.
- No `.skip`, `.only`, `.todo`, retry, `setConfig` or per-`it` timeouts. The UI file has one `describe` with `{ timeout: 15_000 }`.
- The new tests do not import any test file.
- One `as const` (an MH4 key tuple). That is a const assertion, the same pattern used in 29 existing app files, so I'm treating it as info only.

## R71-U — unit and mutation (C's own scratch): PASS, with h as a documented equivalent mutant

**Setup:** `c-round-71/scratch` is a copy of `store/app` plus a `node_modules` junction and my own vitest config. Tools are `tools/cmut71.cjs` and `tools/muts71.cjs`, and the JSON results are in `mut/`. After every mutation the scratch was restored, and `diff -rq` against `store/app` showed it identical.

**Runs on the six files** (the two new files, `metronome-ui`, and the frozen `metronome`, `graph` and `loop` tests):
- **none:** 77/77 passed.
- **red** (the round-70 snapshot `metronome.ts` and `ArrangementContext.tsx`): 14 failed (HU1, HU2, HU3, HU4, HU6, HU8, MH2, MH3, MH4, MH5, UI2, UI4, UI5, UI10). Every frozen test stayed green.

| # | Mutation | Killed by | Required |
|---|---|---|---|
| a | initial clicks planned to `end` | HU1, HU2, HU3, HU6, HU7, HU8, UI2, UI4, UI5, UI10 | HU1, HU8, UI2 ✓ |
| b | the pump never fills | HU2, HU3, HU4, HU6, HU7 | HU2 ✓ |
| c | `soundUntil` ignored | MH2, MH3 | MH2, MH3 ✓ |
| d | refill uses `ctx.currentTime` as `startAt` | HU2, HU3, HU7 | HU2 ✓ |
| e | late rule removed | HU4, MH4, MH5 | MH4, MH5, HU4 ✓ |
| f | a late chunk calls `resyncLoopRef` | HU4 | HU4 ✓ |
| g | old state kept across `startGraph` | HU3, HU5, HU6 | HU3 ✓ |
| h | `stopGraph` does not clear the ref | **survives** | HU5 ✗ (equivalent, see below) |
| i | `nextFrom` not advanced (return after append) | HU2, HU3, HU4, HU6, HU7 | HU2 ✓ |
| j | `until` not capped at `end` | HU6, HU7, MH4, MH5 | MH4, HU7 ✓ |
| k | state also set in the loop branch | UI7 (frozen) | UI7 ✓ |
| l | selection `t ≥ from` (no EPS) | MH2, M4 (frozen) | MH2 ✓ |
| m (extra) | horizon 0.25 | HU1, HU2, HU3, HU4, HU6, UI2, UI4 | info |
| n (extra) | late margin 0 | **survives** | info: test gap |
| o (extra) | `soundUntil` in the loop branch | **survives** | info: test gap |

**Why h is equivalent:**
- `handleRef.current` is assigned in only one place, `startGraph` (l.807). The horizon state is assigned on the very next line (l.808).
- `stopGraph` sets `handleRef` to null, and `fillMetronomeHorizon` returns when `handleRef` is null.
- So h has no observable behaviour, and the §2.3 row "h must kill HU5" cannot be met as written. This is a spec-assumption note for B (INFO-C71-MUT-H-EQUIVALENT), not an implementation defect.

**Alone durations** (the two new files, store, 3 runs): 13/13 each time, in 4.62 s, 5.66 s and 5.22 s.

## G71-1 — gates: PASS

- `npx tsc --noEmit`: rc 0.
- `npx biome check ./app`: 4 errors, 218 warnings, 1 info, the same as the baseline. The 5 owned code and test files: `Checked 5 files … No fixes applied`, with 0 diagnostics.
- **`npm run verify`, attempt 1** (`gates/verify-attempt1.txt`, 22:52–22:55, `node.exe` 51): **RC=0**.
  - agents check, test:agents, lint and typecheck passed;
  - vitest: **Test Files 101 passed (101), Tests 1696 passed (1696)** (1683 + 13);
  - build: `✓ built`.
- **The R9-L2 flake A raised** (`render-budget.test.tsx`): 8 of 8 passed on the final sources in scratch (`gates/rb-series-final.txt`), and it also passed inside the verify run. So that's 9 of 9 for me, against A's 1 failure in 8.
  - Baseline (the round-70 snapshot `metronome.ts` and `ArrangementContext.tsx` swapped into scratch, then restored and `diff -rq` identical): 8 of 8 passed (`gates/rb-series-baseline.txt`).
  - Across A and C: the final sources failed 1 of 17 runs and the baseline 0 of 13. Nothing distinguishes the two versions; this looks like a rare real-time flake. The test never enables the metronome.

## §4.6 / §4.7 browser rows: all PASS

Tool: `tools/mt71.cjs` (logs in `runs/mt71-*.txt`, screenshots in `shots/`).

**Onset detector (INFO-C69), fixed before the runs:**
- A sample counts as an onset when the master-meter `data-level-db` is ≥ −15 dB **and** at least 3 dB above the running minimum.
- After an onset there is a 250 ms refractory period; during it the running minimum follows the level.
- The level is sampled every 10 ms from the DOM, and the tolerance is ± 0.15 s.

**Load procedure:** `domcontentloaded`, then the selector, then 4 s. That took 0.9–1.5 s before the 4 s wait.

**Fixtures:**
- **F-SILENT:** a REAL-mouse (PW) drop of Soft impact on SFX at 20.000, confirmed by the status text.
- **F-LONG-SILENT:** Middle East on music at 1.000, then a REAL click on the music Mute (`aria-pressed=true`). The SFX lane was empty. Clip end = **project end 102.352 s**: the demo clip is 01:41.352, not the 133 s the task assumed (INFO-C71-ME-LENGTH).

| ID | Viewport | Measured | Result |
|---|---|---|---|
| **MT-BEATS*** | 1440 | onsets 0.022 / 1.502 / 3.001 / 4.51 / 6.011 / 7.51 / 9.011 / 10.51 / 12.022; no extras; accents −6.3 vs −12.5 dB (Δ 6.2) | PASS |
| **MT-BEATS*** | 1280 | onsets 0.011 … 12.011, all 9 on the grid, no extras, Δ 6.2 dB | PASS |
| **MH-LONG** | 1440 | BPM 60: onsets on every whole second 0…29 (plus the correct beat at 30.001, sampled at the window end); no extras; accents every 4 s, Δ 6.2 dB; positions never went backwards | PASS (run 2; see the note) |
| **MH-END** | 1440 | Snap off, zoom 8.4 px/s, REAL ruler click → p = 96.483, end 102.352. Onsets at 97.513, 99.004, 100.524 and 102.012; none at or after the end. The transport stopped by itself (not playing 1.5 s later), and the readout ended at `01:42.352` = the end | PASS |
| MT-SEEK | 1440 | BPM 40 playing; at ~5.2 s a REAL ruler click at 7.0 (landed at `00:07.011`); the next onsets were 7.51 and 9.011, then 10.51 | PASS |
| MT-TEMPO-CHANGE | 1440 | 60 typed and Enter committed at pos 2.547 → onsets 3.011, 4.011, 5.011, 6.011, 7.001, 8.011 (1.0 s apart, accents at 4 and 8); toggle still pressed | PASS |
| MT-LIVE-TOGGLE | 1440 | off from 0; toggle on at 3.729 → 4.51, 6.009, 7.51; off at 8.009 → no onsets after; nothing before | PASS |
| **MH-SCRUB** | 1440 | BPM 60, playing from 0; at 3.051 a REAL-mouse (PW) drag of the playhead handle (639 → 1312 px) to 20.000 over 3.1 s. After release: 21.001 … 27.001 on whole seconds (7 onsets over 6 s), no two onsets < 0.5 s apart, no extras. During the scrub: onsets at 4, 8, 12, 16, 20 | PASS (attempt 3; see the note) |
| **MH-NODES*** | 1440 | BPM 999, on, Space from `00:00.000`: **68** `createBufferSource` calls by +0.5 s and **101** by +3 s, in bursts of [35 @ 3 ms, 33 @ 77 ms, 33 @ 2050 ms]. Off: 1 / 1. Run 1 gave 67 / 100 | PASS (≤ 120 / ≤ 200) |
| **MH-NODES*** | 1280 | on **68 / 101** (bursts 35 @ 213 ms, 33 @ 385 ms, 33 @ 2386 ms); off 1 / 1 | PASS |
| MH-SCRUB-PERF | 1440 | BPM 999, playing from 5.000, a 5 s back-and-forth handle scrub. **On:** 2469 calls in 72 bursts, max **67** per burst (one burst merged the initial chunk and its refill; the rest were 33–35); 0 longtasks; max frame gap 32.3 ms. **Off:** 39 calls in 39 bursts of 1; 0 longtasks; gap 30.6 ms. Run 1: on 2699 calls / max 35 per burst, off 40, gaps 27.5 / 30.8 ms | PASS (≤ 5000 total, ≤ 80 per burst) |
| MT-LOOP | 1440 | loop `00:02.000 — 00:05.000`, Space from 2; 42 wraps (the window ran ~117 s); onsets only at 3.0 (43 times) and 4.5 (42 times); none at the wrap and no others | PASS (fixture note) |
| MT-EXPORT-REG | 1440 | WAV with the metronome off vs. BPM 120 with it on. The metronome was audible live at 120 just before the second export (3 onsets in 0–2.2 s). The two files are **byte-identical** (sha256 `ca95ddeb…4d35`): 1 056 000 frames = 22.000 s, 48 kHz / 24-bit / 2 ch, NaN 0, full-scale 2 / 2 (the known DEMO-SFX-FULL-SCALE), RMS 0.045391 in both, max \|Δ\| 0 LSB. **Every sample before 20 s is 0** in both (960 000 frames checked), and the first audible sample is at 20.000 s. No click in the export | PASS |
| MT-OFF | 1440 | metronome off, Space from 0 to 8.022 s: 0 onsets, max level −∞ (−60) | PASS |
| REG-HYD | both | 0 hydration-like console lines on every load (8 PW loads + gstack) | PASS |

**Measurement notes** (these are harness issues; the budget rule is respected and no tolerance was loosened):
- **MH-LONG run 1:** my expectation list stopped at 29. The correct beat at 30.011, sampled at the window end, was therefore counted as an extra. All of 0–29 were hit. In run 2 I made beat 30 optional and kept 0–29 required; it passed.
- **MH-SCRUB:**
  - **Attempt 1 was invalid.** My old `seek(0)` clicked off-screen because Follow had scrolled the view after MH-LONG, so playback started at 30.19 and the drag went 30 → 20. Even so, after release the onsets came at 21–27 on the grid.
  - **Attempt 2 was invalid.** The handle was off-screen and the drag missed: the release position was 9.36. My verdict check was too weak, so that attempt's "PASS" is discarded.
  - I then added checks that the handle is on screen and the release lands within ± 1 s of 20. **Attempt 3** (fresh session) was valid and passed.
  - That is 2 extra attempts used, the maximum.
- **MT-LOOP:** a drag on the **empty** music lane does not create a range (status: `Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.`). As in C round 66, I first dropped Middle East muted on music at 0 (INFO-C71-LOOP-FIXTURE). The first run's MT-LOOP FAIL was a harness failure for exactly this reason.
- **MH-END method (harness deviation):** the task asked for an Alt-click on the ruler, or Home plus keys. I used Snap off (G), zoomed out with `-` until the end was visible, and made a plain REAL ruler click. The goal is met: p = 96.483 was recorded from the readout, about 6 s before the end.
- **MH-SCRUB onsets during the drag:** only 4, 8, 12, 16 and 20 registered. That is the detector, not the app: the −12.5 dB clicks arrive every ~100 ms during the scrub and fall inside the 250 ms refractory and the slow meter decay, so only the louder accents stand out. The spec scores only the onsets after release. Whether every click is heard during a scrub is the Tech Lead's R71-T ear check.
- **MT-SEEK:** the readout landed at 7.011, which is Snap at 1 s with the 11 ms frame lag of the readout. The spec's 7.5 / 9.0 expectation applies directly.

## G71-3 — anonymous workspace and purchase protection: PASS

**gstack (REAL):**
- `/studio-lab` opened directly shows the workspace and the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`. `localStorage` holds only `czaba_session_id`, and `auth_user` is null.
- From the homepage, the header link `a[href='/studio-lab']` (first match) leads to `/studio-lab` with the workspace and the badge.
- `/studio/middle-east` shows "Sign in required" and no workspace (`shots/g71-3-studio-middle-east.png`).
- Anonymous `GET /api/studio-token?product=middle-east&file=mix.mp3` → **401**; with a fake Bearer → **403**.

**Network:**
- In the gstack session, the only R2/workers request was the homepage cover `czaba-r2-proxy…workers.dev/middle-east/cover.jpg` (allowed), plus the `r2.config.ts` dev module.
- In all 8 PW runs: **0** forbidden requests (the filter includes `r2-proxy` and `workers.dev`) and **0** requests with an `Authorization` header. The hosts were 127.0.0.1:5173, localhost:5199 (root `/api/cart`, CORS-blocked, known), Google Fonts, GTM and GA.

## Ableton (§0.2): two verdicts per row

| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| The metronome ticks on every beat while playing | **PASS** (MT-BEATS*, MH-LONG, MH-END, MT-SEEK, MT-TEMPO-CHANGE, MT-LIVE-TOGGLE, MH-SCRUB) | **confirmed**, per Live 12 Manual §19.4 / §19.4.1 as captured by B on 2026-10-19 (`b-round-65/metronome-excerpt-20261019.txt`). C did not re-fetch it, and no Live installation was used |
| How Live schedules click audio internally | **PASS** (MH-NODES*, MH-SCRUB-PERF) | **not applicable**: internal, no visible behaviour. I make no claim that "Ableton does the same" |

## Not run this round (honest)

- **Hidden-tab late pump in a real browser:** not run (environment / scope). Only HU4, MH4 and MH5 cover the late-drop rule, and all three are offline.
- **Out of scope (§4.10):** video sync, C-R27-01, the bars ruler rows, the FB-01..FB-16 stage regression, and `npm run test:e2e:smoke` (root's). The full find sound → add → fit video → export flow was not part of this round; only its export leg was covered, by MT-EXPORT-REG.
- **Tech Lead:** R71-T is open (real Chrome with headphones: fast tempo, long project, scrub). R65-T…R70-T are unchanged.

## For B

- **No bugs.**
- **Info:**
  - INFO-C71-MUT-H-EQUIVALENT: drop or re-phrase §2.3 row h in future tasks.
  - INFO-C71-MUT-N-O-GAPS: test gaps for the late margin and the loop-branch `soundUntil`. Candidates for the Lows batch.
  - INFO-C71-ME-LENGTH: future rows should take 102.352 s as the F-LONG-SILENT end.
  - INFO-C71-LOOP-FIXTURE: the loop fixture needs a clip.
  - INFO-C71-A-VITEST-CACHE: a stray `tmp/studio-real-loop/node_modules/.vitest-cache` from A's phase, for root.
  - INFO-C71-GSTACK-START: the gstack daemon's first-start failure.
- **Architecture note** (A's code-reviewer: a second refill pipeline next to `fillLoopIterations`, with keep-now advice): pass it to ARCH-CHECKPOINT-SRW14-PREFS / ARCH (f). It is not gating.
- **Commit readiness:** round 71 alone (8 paths) is ready for the root gate. My verify attempt returned rc 0, the tree status is exactly the 8 lines, and the owned files did not change during my phase. ROOT-R66-M1 can close on this evidence.
