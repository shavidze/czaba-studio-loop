# C round 208 — PERF-FADER-a0 verification (harness only)

**Verdict: PASS.** browserVerified = realVerified = **true** (PERF-RUN, METRIC-LIVE, WINDOW and G208-3 all ran in real Playwright Chromium). No app source touched by C. Gate rows are not claimed.

Baseline `d2a920c`. Env: `env-status.json` round 208, store 200. Mock `:5199` not running (curl 000) → G208-3 fake-Bearer expectation is 500.

Evidence folder: `c-round-208/` — `out/perf-run{1,2}.{log,json}`, `out/probe-1440.json` (2 passes), `out/probe-1280.json` (1 pass), `out/g208-3.json`, `out/grants-end-sha256.txt`, `shots/`, probe PNGs in `out/`. Tools: `tools/c208probe.cjs` (C's own; imports nothing from `perf/`), `tools/g208-3.cjs` + `glib.cjs` (copied from C round 206, output names only).

## Rows

| Row | Result | Evidence |
|---|---|---|
| SCOPE-208 (start + end) | **PASS** | HEAD d2a920c both times; `git status` = 5 M, 0 untracked; frozen 1,044 `sha256sum -c` OK at start and end; `perf/lib/stats.ts` byte-identical to start copy; `perf/lib/move-latency.ts` absent (optional; listed in new-files.txt); `app/` 0 changes. Doc 164 diff = l.4 only, exact R114 text. Doc 163 hunks: l.4 (conditional status), l.54 (metric-table row, components-per-commit note), l.60, l.66–70 (table), l.114–146 (new section) — all within "l.4, l.60, the metric table, the new section". Grant mtimes all predate C's phase (latest 13:33:40); end hashes in `out/grants-end-sha256.txt`. |
| PERF-RUN-208 | **PASS** | `npm run test:perf` ×2, sequential, nothing else building: both exit 0, `1 passed (7.2m)`, durationMs 417 473 / 420 318 (< 12 min). Each: `complete: true`, 266 rows, 0 failures, 0 problems, 0 `abortedAt`, **18/18 assert pass** incl. `.sync` (31.7–31.9 / 31.6–31.8), `.deferred` (31.3 / 31.2–31.3), `harness.move-samples-live` 0, `harness.move-window-live` 83. Every row has 3 samples. 0 `event-share-16` rows. `harness.move-latency-control` mode record (1.3–1.4 ms), listeners 1 → 1. R-4: `fader.pan.stopped.move-to-paint-p95.1x` 1.3–1.5 ms, `.playing` 3.2–3.5 ms — not the injected ~31 ms values. All 141 deterministic rows: medians identical run1 vs run2 and vs A's run3 (0 outside ±10 %/±2). |
| R-2 / R-3 (C script on budgets.json vs start copy) | **PASS** | 161 → 266 rows; asserts 14 → 18, added exactly the 4 liveness ids, removed 0, no existing assert budget changed. The only changed existing rows are the 20 `components-per-commit` (budget `null`, note says it includes pointerdown + release commits and is not the per-move metric). 20 `event-share-16` removed. 20 `moves-dispatched` still `== 121`. Owners: clipgain → PERF-FADER-b, track/group/master/pan → PERF-FADER-a. |
| METRIC-LIVE-208 (independent) | **PASS** | C probe on the production build (`remix-serve build/` from run2, :5188), own move→rAF→MessageChannel sampler paired by payload id, own injected 30 ms listener. Pan — Music stopped, p95: **sync 31.8 / 31.6 / 31.8 ms**, **deferred 31.1 / 31.2 / 31.3 ms**, **control 1.3 / 1.2 / 1.3 ms** (1440 pass 0, 1440 pass 1, 1280). Harness: sync 31.6–32.0, deferred 31.2–31.3, control 1.3–1.4. Same direction, ≥ 30 with injection, < 30 without. CDP listener count back to start after removal. 121/121 samples per drag. |
| WINDOW-208 (independent) | **PASS** | C devtools-hook stub; commits split before-first-move / move window / after pointerup. 1440 (2 passes) and 1280 identical: track 83 (per-move 62.25, release 1), master 80 (63.333 stopped / 59.333 playing, release 1), group 85 (63.75, release 1), pan 4 (3.5, release 2) — **exactly** the harness medians (±0). Before-first-move commits = 0 in every drag. Bug still present: move-window max ≥ 50 for track, group, master, stopped and playing. 0 realtime `AudioBufferSourceNode.start()` during every drag, stopped and playing (no graph restart). |
| DRAG-ENDS-208 | **PASS** | From both run JSONs (`components-per-commit` details, all 3 passes) and C probe: no `none` case. strict: pan (both), master stopped, clip gain stopped. max (start = high = max, low < start): track and group (max 0 dB, both states), master playing (max +6), clip gain playing (max +24). Matches A's statement and doc 163. |
| DOC-208 | **PASS** (with C-R208-01 Low) | l.60 now defines `move-to-paint` (rAF→MessageChannel, "real paint not measured directly"), states why `event-share-16` was removed. Every backticked row id in doc 163 exists in budgets.json; the 6 new metrics exist. Notes match the code (window = after in-page pointerdown's first move to in-page pointerup; release from pointerup; samples include the hover move). Status line conditional (L28). Stale lines outside the grant: see C-R208-01. |
| AN-REVIEW-208 | **PASS** | `perf/` diff: no `any`, no `@ts-ignore`, no `as` assertion (grep hits at spec l.670/673 are inside the string "set as the active track" — false positives), no `route(`. Injected listener removed in `finally`; CDP count checked; control p95 ≥ 30 is a run problem. New window listeners are `{capture, passive}`. |
| G208-3 | **PASS** | Fresh contexts, no credentials. `/studio-lab` 1440 and 1280: workspace renders, demo badge, `auth_user` null, 0 cookies, 0 forbidden/authorization requests. `/studio/middle-east` 1440 and 1280: "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token` no header → **401**; fake Bearer → **500** "Unable to prepare Studio access" (condition: `:5199` mock not running), no set-cookie, 0 cookies. No token issued. |
| gate | not claimed | full vitest, typecheck, build, Biome, verify, e2e smoke → root gate. |

## Findings for B

- **C-R208-01 (Low, docs).** Doc 163 lines outside this round's grant now contradict the harness: l.16 "161 სტრიქონი" and "no `wallclock` row is assert" (now 266 rows, two wallclock asserts); l.83 "161"; l.18 rejected-alternative text; l.24–31 pass sequence without step 9 (liveness); l.74 determinism list without `move-components-*`; l.149 TODO says PERF-FADER flips `components-per-commit` to assert (now null budget). The new section corrects each, so a reader can resolve it, but the doc is internally inconsistent. A flagged it. Suggest granting these lines in round 209 (cheap, same owner) rather than deferring.
- **I-208-a (info, ratification).** A opens the move window at the first move after the in-page pointerdown and divides `-per-move` by 120, where §2.2 says "after the first pointermove" ÷ moves. C's probe: before-first-move commits = 0 in all 30 drags, so the numbers are identical at baseline. B should ratify before stage a, where a pointerdown commit could appear.
- **I-208-b (info, stage a design).** Track and group drags start at max (0 dB), so the high end only proves a return to max, never a strict increase. Stage a's bit-identity and revert rows may want a start below max.
- **I-208-c (info).** Liveness margin is 1.2–2.0 ms over the 30 ms floor; the floor is a busy-wait, so the margin can only grow under load. Not a flake risk in the down direction.
- **Baseline evidence for SABA-B-5 (not new):** clip gain `move-to-paint-p95.1x` playing 64.0–72.8 ms, stopped 25.4–25.5 ms; track/group/master 1× 2.9–5.5 ms. Move-window components: 80–87 per commit for track/group/master/clip gain vs 4 for pan.

## Product / Ableton
- CZABA requirement: met for this harness-only stage (metrics can now fail honestly). SABA-B-5 itself is **not** fixed this round (by design, round 209).
- Ableton conformance: **not applicable** (perf/test-only round, no behaviour change).
- User flow (find sound → add → fit video → export): only "find → Add → fader drags" exercised as harness setup; video and export are unchanged code and were not in scope.

## Final integrity checks
- `out/probe-1280.json` parses: 1 pass, 7 fader rows + 3 liveness drags (sync, deferred, control) + listener counts.
- R-3: all 20 `components-per-commit` rows have `budget: null` and the "NOT the per-move budget metric" note (C script, not only the first row).
- Independent support for A's red-proof (ii): in C's probe the pan move-window max is 4 while its release commit renders 83, so widening the window to include the release must raise pan's max to 83, as A reported.
- Servers started by C (:5188) stopped; tree at end = 5 M, 0 untracked, frozen OK.
