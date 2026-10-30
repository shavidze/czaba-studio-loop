# Round 269: SABA-B-7. The clip volume envelope moves onto the lane fader's dB scale (Medium, agreed by Saba 2026-10-30, option A)

**Planned by:** B, at the round 268 → 269 planning, 2026-10-30.

**Decisions:**
- D-29z576: the round-268 result (C PASS, gate 268 published `3058a7c`; GATE264-S2 and C-R267-01 closed);
- D-29z577: C-R268-01 = A-R268-REVIEW-SPACE-ALTGRAPH, one Low, deferred; D-29z572's wording narrowed;
- D-29z578: SABA-B-7 design (the depth scale, interpolation, scheduling, storage precision, legacy gains);
- D-29z579: lessons L29 clause (HEAD drift), consults, checkpoint note.

The saved-project consequence (the shape between points and the on-screen height change; stored gains do not) is Saba's answer, recorded as D-29z573. This task cites it and does not re-decide it.

**Read first:** `lessons.md` in full. These apply directly:
- L41 (perceptual axes follow the reference curve; three interior points);
- L23 (B's scratch pre-check, §6);
- L29 (claims, §9);
- L31 (timeouts);
- L28 (the doc's l.4);
- L11 (STOP);
- L26 (docs cite only tests that exist).

**Previous task:** `tasks/round-268.md` (exact copy of the round-268 `current-task.md`).
- C: `c-round-268.json` = **PASS**, with `browserVerified` and `realVerified` true.
- Gate 268: **published**, commit `3058a7c` on both remotes.

## Baseline: HEAD `3058a7c`, clean tree
`git rev-parse HEAD` = `3058a7c18c558f4139edff0cd6c2cc76ccc47d2e` and `git status --porcelain` prints nothing [K1]. If root commits again before A starts (an agent file, as in round 268), C accepts the drift only when `git diff 3058a7c HEAD -- app` is empty (L29 clause, D-29z579).

## 1. What Saba asked for, and why we missed it

**Saba (2026-10-28):** he dragged an envelope point to the bottom, and the music did not go fully silent.

**Saba (2026-10-30), option A:**
- The envelope's vertical axis is dB-linear from 0 to −60 dB, and the bottom is −∞.
- It uses the same scale as the lane Volume fader.
- The readout stays in dB.
- Saved projects keep their point gains; the shape between points and the points' height change, with no legacy flag.
- Scheduling uses short linear ramps of ≤ 0.5 dB, with no `setValueCurveAtTime` and no exponential ramp to 0.

**Today's code:**
- The line between two points is linear in **gain** [K2].
- Playback and export ramp linearly in gain straight to each point [K3].
- A point's height is `1 − gain`, and a drag maps pixels linearly to gain [K4].

So a 0 dB → −∞ line reads −2.5 / −6.0 / −12.0 dB at 25 / 50 / 75 % of its length (`user-review/AGREE-SABA-B-7.md`; B's HEAD probe, §6), and the music stays loud until the very end.

**Why we missed it:** the envelope was built in rounds 82–83, before the reference-first rule existed. No task cited a reference curve, and no C row measured an interior point; only the ends were checked (round 83 EN-DRAG measured the bottom as 0.0000). The rule that catches it is **L41** ("Perceptual axes follow the reference curve…"), already in `lessons.md` since round 230. C's LESSON row greps it.

## 2. Reference: how Ableton Live 12 does it

| # | Behaviour | Source | Confirmed fact | CZABA decision |
|---|---|---|---|---|
| R1 | The vertical axis of an envelope is the control's value; horizontal is time | [Live 12 manual 25.5](https://www.ableton.com/en/live-manual/12/automation-and-editing-envelopes/) | confirmed (unit not stated) | same |
| R2 | A clip's volume envelope is relative to the clip volume and never boosts. Its bottom is silence | [27.2.3](https://www.ableton.com/en/live-manual/12/clip-envelopes/); `reference/youtube/SABA-B-7-transcripts.md` (FEzm 5:04, OkAX 19:05) | confirmed | same: top = 0 dB (gain 1), bottom = −∞ |
| R3 | Live's volume fader taper: dB-linear from 0 to −36 dB, slightly compressed below, −∞ at the bottom | `reference/ableton-live-measurements-2026-10-30.md` §1 (root, measured in Live 12 on Saba's PC) | measured: −12/−24/−36 dB sit at 0.22/0.42/0.63 of the scale | **option A:** dB-linear 0…−60 dB, −∞ at the bottom; the same constant as the lane fader (`TRACK_VOLUME_DB_MIN` = −60 [K5]). Within 0.03 of Live down to −36 dB |
| R4 | Live's clip Gain envelope is linear in its own % axis (a midpoint reads 49.6 %) | measurements §2 | measured; the % → dB mapping is **not** measured | dB axis on the fader scale (deviation D3) |
| R5 | Breakpoint editing: double-click adds, drag moves, double-click on a point deletes | [Learn Live: Clip automation](https://www.youtube.com/watch?v=IdQYUk8w5jM) 1:38–2:46 (transcripts file) | confirmed | unchanged (rounds 82–83) |
| R6 | A breakpoint shows a value label when it is created | measurements, "Also observed" | measured | unchanged: the status line and the point's title show dB |

**Cursor, hover, selected states, shortcuts and modifiers:** unchanged by this round. The `A` key and the Env button toggle the mode; double-click adds or removes; drag moves. Point size and colour are unchanged (SABA-B-1's look stays).

**Deviations (with reasons):**
- **D1. The readout is in dB, not %.** Saba's decision of 2026-10-30 (item 2). A film editor reads dB, and the lane fader shows dB.
- **D2. The floor is −60 dB, and below it the value is −∞.** Live compresses a little below −36 dB. Saba accepted option A: the lane fader already uses −60, and one Studio should not have two dB scales.
- **D3. Interpolation runs in dB on the fader scale.** Live's clip Gain line is straight in %, and whether % is gain or fader position is unmeasured (R4). Saba chose A knowing this.

**Later candidates, not in scope** (Saba 2026-10-30): Alt-drag curves, Edit Value, and grid snap of points (LATER-SABA-B-7-*). Do not build them.

**Consults:** `ableton-arrangement-expert` and `docs-explorer` were consulted at round-232 planning (`b-round-232/saba-b-7-reference-*.md`). Neither found a published taper, and root's Live measurement now outranks both. `product-designer` was not consulted: this is a Saba-fixed change to an existing control, with no new screen element; Saba chose the taper, the readout and the saved-project behaviour himself (D-29z579).

## 3. The contract (D-29z578)

Put every function in `app/lib/arrangement/envelope.ts`. Names are A's choice; the behaviour is fixed.

**3.1 Depth scale.** "Depth" is the point's height from the top as a fraction of the clip body: 0 at the top, 1 at the bottom.
- `depth(gain)`:
  - gain ≤ 0, or not finite → 1;
  - otherwise `clamp(20·log10(gain) / TRACK_VOLUME_DB_MIN, 0, 1)`.
- `gain(depth)`:
  - depth ≥ 1, or not finite → 0;
  - depth ≤ 0 → 1;
  - otherwise `10^(TRACK_VOLUME_DB_MIN·depth / 20)`.

Import `TRACK_VOLUME_DB_MIN` from `track-volume-db.ts` [K5]. Do not copy −60 as a literal.

**3.2 Interpolation** (`clipEnvelopeGainAtSource`, today linear in gain [K2]). Between two bracketing points L and R at fraction f (0 < f < 1):
- **Both gains > 0:** interpolate linearly in dB (`dB = dB_L + (dB_R − dB_L)·f`, unclamped), so a segment between two gains below −60 dB keeps its level.
- **Either gain is 0:** interpolate linearly in depth (§3.1, with depth(0) = 1) and convert back.
- **At f = 0 or 1, and outside the first and last point:** return the **stored** gain exactly. No round trip through depth.

**3.3 Scheduling** (`scheduleClipEnvelopeGain` in `graph.client.ts` [K3]; playback and export both reach it [K7]).
- The scheduler keeps `setValueAtTime(initial)` at the clip's start in the window.
- The scheduler then calls `linearRampToValueAtTime` once per **step**, from a pure helper in `envelope.ts` that returns the steps for a source window `[from, to]`:
  - **Knots:** the window start, every point strictly inside, and the window end.
  - **Steps per knot pair:** `n = max(1, ceil(span / 0.5))`, where `span` is the dB distance (both gains > 0) or the depth distance × 60 (either gain is 0).
  - **Step values:** step k lands on the curve value at `from + (to − from)·k/n`; the last step lands exactly on the knot's gain.
  - **Name the step size** as an exported constant (0.5 dB).
- So a 0 dB → −∞ segment takes 120 steps. Each step is ≤ 0.5 dB until the last one, which ramps linearly to exactly 0.
- A flat segment, including two points at 0, is one step.
- No `setValueCurveAtTime`, no `exponentialRampToValueAtTime`, and no `setTargetAtTime` on the envelope gain.
- Do not change the fade gain, clip gain, track gain or any other node.

**3.4 Display** (`ArrangementClipEnvelope.tsx`):
- A point's `top` = depth × 100 %.
- Every polyline vertex `y` = depth, for the first, last and every visible point [K4].
- A line straight in depth is the curve itself, so no extra vertices are drawn.
- The two polylines keep identical `points` (EU5 checks halo = line).

**3.5 Drag:**
- The new gain is `gain(depth(originalGain) + dy / bodyHeight)` [K4]. A drag below the bottom gives 0 (−∞ dB); above the top gives 1 (0 dB).
- **A vertical delta of exactly 0 keeps the stored gain byte for byte.** A horizontal-only drag never rewrites a gain. This protects legacy gains below −60 dB and keeps the "drag back to the start = no change" rule.
- Threshold, clamps, Esc/pointercancel revert, single history entry, status strings and labels: all unchanged.

**3.6 Storage:**
- Points keep `{ time, gain }`, with gain rounded to 4 decimals by `roundEnvelopeGain` [K6]. **Keep 4 decimals.** `data-envelope` / `data-gain` (`toFixed(4)` [K8]), clipboard copies and stored points stay byte-identical in format.
- **Accepted limit:** below about −50 dB one stored step is coarser than the 0.1 dB readout (at −55 dB a step is about 0.5 dB). The readout shows the stored value.
- **Accepted limit (legacy only):** a stored gain below −60 dB (possible only from the old linear drag) is drawn at the bottom, while the dB-interpolated line towards it is not quite at the bottom. Display and sound disagree only for such points, and `/studio-lab` has none. DB5 pins the sound half.
- No migration, and no legacy flag (Saba, D-29z573).

**3.7 Unchanged:**
- `formatClipEnvelopeGain` (the dB readout and `−∞ dB`);
- add/move/remove point rules (ms rounding, the 1 ms gap, the window);
- split, trim and clipboard behaviour (points live in source time).

Adding a point on a line keeps the sound: the new point takes the curve's value, so the line through it stays the same.

## 4. Grants (exact, `b-round-268-r269-grants.txt`)

Only these paths may change. `git status --porcelain` must list exactly the changed subset.
1. `app/lib/arrangement/envelope.ts`: §3.1, §3.2, the step helper and its constant.
2. `app/lib/arrangement/graph.client.ts`: `scheduleClipEnvelopeGain` and its import line only.
3. `app/components/arrangement/ArrangementClipEnvelope.tsx`: the `top` style, the polyline vertices, and the drag gain mapping in the pointer-move handler (plus its import). Nothing else, including the classes and SABA-B-1's look.
4. `app/lib/arrangement/__tests__/envelope.test.ts`: the rewrites in §5.1 and the new rows in §5.2.
5. `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx`: the rewrites in §5.1 and the new rows in §5.2.
6. `app/lib/arrangement/__tests__/export-range.test.ts`: **XR2 only**.
7. New `docs/implementation/2026/quarter-IV/200-saba-b-7-envelope-db-taper.md`: the seven TEMPLATE headings in order (L26). l.4 is exactly `**სტატუსი:** Completed (C round 269 PASS)` (L28). It is written in Georgian, with technical terms in English.

**Not granted:**
- `ArrangementContext.tsx` (its playback call already passes the shapes [K7]), `track-volume-db.ts`, `ArrangementClip.tsx`, `strings.ts`, and every other test;
- `perf/**`, `e2e/**`, `package.json`, `.claude/**`, `CLAUDE.md`;
- the protected auth and purchase files and the rest of `global_forbidden_files` in `backlog.json` (for example `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth*`, `app/contexts/AuthContext.tsx`).

A needed change outside the grants is a STOP (L11).

## 5. Tests

### 5.1 Tests that change, and why (Saba's rule: a rewrite whose only change is removing an assertion is a Medium bug)

B ran the sketch (`b-round-268/sketch.diff`) on a scratch copy over the whole `app/lib/arrangement/__tests__` folder: 167 files, 164 passed and **15 tests in 3 files failed** (`b-round-268/precheck-arrangement-folder-tail.txt`). Every failure pins the old linear-gain value. Each is rewritten to the new contract with **an equal or stronger** assertion. The title changes where it names "linear" or "1 − gain". Test lines are at HEAD [K9].

| File, test | Old pinned value | New expected (pre-check value) |
|---|---|---|
| envelope.test.ts EV1 (l.85) | midpoints 0.6256 (linear between 1 and 0.2512) | ≈ 0.501199 (−6.0 dB, half of 0 → −12 dB); exact at points unchanged |
| EV2 (l.110) | added point 0.75 between 1 and 0.5 | 0.7071 (−3.0 dB); the other cases re-derived |
| EV4 (l.244) | 0.6256 | ≈ 0.501199 |
| EV5a (l.442), EV5b (l.456), EV5c (l.469), EV5e (l.494), EV6b (l.602) | 3–5 calls (one ramp per point) | `set` first, then the §3.3 steps. Assert: the first `set` value; each knot lands exactly at its time and gain; the step count per segment = `ceil(dB span / 0.5)`; every consecutive step ≤ 0.5 dB + 1e-9; times strictly increasing; the last call on the window end. A full literal list is allowed but not required |
| export-range.test.ts XR2 (l.263) | starts at 0.5 (linear midpoint of 0 → 1) | starts at ≈ 0.031623 (−30 dB = depth 0.5), then steps up to 1 at render time 1, then holds 1 |
| clip-envelope-ui.test.tsx EU2 (l.449) | `10.000:0.7500` | `10.000:0.7071` |
| EU3 (l.465, "quarter of the body gives 0.75") | 0.7500, status −2.5 dB | 0.1778, status `Envelope: 6.000 s · −15.0 dB` (and with a period after release) |
| EU3 (l.504) | `data-gain` 0.0012 after dy 20 | 0.0447 |
| EU3 (l.547) | `6.000:0.7500;…` | `6.000:0.1778;…` |
| EU7 (l.604) | `0,0.7488 80,0.7488` | y ≈ 0.2000 (depth of 0.2512) on both vertices. Compare numerically within 1e-4, or exactly if A writes rounded vertices |
| EU5 (l.734, "y = 1 − gain") | `320,0.7488` | `320,≈0.2000`; the rest of that string unchanged |

The other tests in these 3 files passed on the sketch unchanged and stay unchanged (add-only around them).

### 5.2 New rows (each red on a named mutant, §7)

In `envelope.test.ts`, describe `SABA-B-7 dB envelope (DB)`:
- **DB1:** points 0 dB → 0 over 4 s. At 25 / 50 / 75 %, the value is −15 / −30 / −45 dB ± 0.01 dB. At both points it equals the stored gain exactly (`toBe`).
- **DB2:** depth and gain round-trip:
  - −6, −12, −24, −36 and −48 dB within 1e-9;
  - `depth(1)` = 0 and `depth(0)` = 1;
  - `gain(1)` = 0, `gain(0)` = 1 and `gain(1.2)` = 0.
- **DB3 (same scale as the lane fader):** for dB in {−6, −12, −30, −59.9}, `gain(−dB/60)` equals `trackVolumeFromDb(dB)` within 1e-12.
- **DB4 (steps):**
  - 0 dB → 0: 120 steps; each step to step ≤ 0.5 dB + 1e-9 except the last; the last step is exactly gain 0 at the point's time.
  - Two points at 0: exactly one step, at gain 0.
  - Two points at 0.5: one step.
  - A window that starts mid-segment starts its steps from the curve value there.
- **DB5 (legacy gains below −60 dB):** with [0: 0.0005, 4: 0.0005], the value at 2 is 0.0005. With [0: 1, 4: 0.0005], the ends are exact and the midpoint is the dB midpoint (≈ −33 dB).
- **DB6 (adding keeps the line):** on 0 dB → 0, add a point at 50 % (gain 0.0316). The value at 25 % before and after the add differs by ≤ 0.05 dB.

In `clip-envelope-ui.test.tsx`, describe `SABA-B-7 dB envelope UI (EUDB)`:
- **EUDB1:** with points at gain 1, 0.5, 0.0316 and 0, the `top` styles are 0 %, ≈ 10.03 %, ≈ 50 % and 100 % (± 0.1 %).
- **EUDB2:** a point at 0 dB dragged down by half the body reads `−30.0 dB` in the status and commits one entry. Dragged past the bottom, it reads `−∞ dB` with `data-gain` `0.0000`.
- **EUDB3:** a point stored at 0.0005, dragged horizontally only (dy 0), keeps `data-gain` `0.0005` and moves in time.

Timeouts (L31): at gate 268, `clip-envelope-ui.test.tsx` ran 28 tests in 5280 ms. B's sketch run: slowest test 224 ms; `envelope.test.ts` 66 ms; `export-range.test.ts` 721 ms. All are far below 50 % of the 5 s default. Add no explicit timeouts.

### 5.3 A runs (speed rules)
- `npm run typecheck`, `npm run lint`, and `npx biome check` on the changed files.
- `npx vitest run` on the 3 granted test files plus `clip-gain-waveform.test.tsx`, `header-meter-envelope-strings-ui.test.tsx`, `clip-fades.test.ts` and `video-fades.test.ts` (envelope and fade neighbours, all in `app/lib/arrangement/__tests__`). All must pass.
- A red-proof for each mutant in §7, on a scratch copy outside `store/`.
- The `code-reviewer` subagent (3 code files change).

The full suite, the build and `npm run verify` are gate rows.

## 6. B's pre-check (L23)
- **Sketch** (`b-round-268/sketch.diff`): scratch `/tmp/b268-scratch`; `tsc` rc 0; Biome is clean on the 3 files.
- **Value check** (`b-round-268/b268-sanity.test.ts`): 0 dB → −∞ reads −15.000 / −30.000 / −45.000 dB; 120 steps, worst step 0.500 dB.
- **Folder run:** see §5.1. No consumer of `clipEnvelopeGainAtSource` or `scheduleClipEnvelopeGain` exists outside the 4 files [K10]. No `perf/**` or `e2e/**` file references them.
- **Browser** (`b-round-268/probe-envelope.mjs`). It ran at HEAD on :5173 (`probe-envelope-head.json`) and on the sketch on :5180 (`probe-envelope-sketch.json`), at 1440×900 and 1280×720, with 0 page errors.
  - **Recipe:** fresh context, `/studio-lab`, wait for `Demo collection ready`, focus the first library option and press Enter (one clip), blur, then click `arrangement-envelope-toggle` [K12].
  - **Points:** double-click the editor at x + 20 (0.725 s) and at x + 420 (10.725 s), both with y + 5 px. Drag the last point 400 px down. Double-click at x + 220 (5.725 s). Drag the first point down a quarter of the 50 px body.

  | | HEAD | Sketch |
  |---|---|---|
  | Mid point added on 0 dB → −∞ | `5.725:0.5000`, "−6.0 dB" | `5.725:0.0316`, "−30.0 dB", depth 0.5 |
  | Quarter drag from 0 dB | 0.7500, "−2.5 dB" | 0.1778, "−15.0 dB" |
  | Point dragged to the bottom | `0.0000`, `−∞ dB` | same |

## 7. Mutants (A red-proofs them; C re-runs them on its own scratch)
- **M-LINEAR:** interpolation back to linear gain. DB1 and EV1 go red.
- **M-NO-STEPS:** step count forced to 1. DB4 and the EV5 step-count asserts go red.
- **M-DISPLAY:** `top` back to `(1 − gain)`. EUDB1 goes red.
- **M-DRAG:** drag back to `originalGain − dy/bodyHeight`. The EU3 quarter row and EUDB2 go red.
- **M-DY0:** the dy = 0 rule removed. EUDB3 goes red.
- **M-FLOOR:** a literal −40 in place of `TRACK_VOLUME_DB_MIN`. DB3 goes red.

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720, fresh anonymous contexts)

Use B's recipe (§6; `probe-envelope.mjs` and `probe-meter.mjs` may be reused). For export, use the round-83 method (EN-EXPORT; `c-round-83/tools/wav.cjs` parses the WAV). The round-83 browser scripts predate the export dialog rewrite (PERF-16): the method is the reference, and C adapts the selectors. Export WAV twice from the same one-clip project:
- **Export A:** no points.
- **Export B:** three points, made as in `b-round-268/probe-meter.mjs`: double-click the editor at x + 20 and at x + 220, drag the second point past the bottom, then double-click at x + 420 (it takes −∞ from the line). At HEAD this gives `0.725:1.0000;5.725:0.0000;10.725:0.0000` [K13].
- **Point times:** C reads `p1`, `p2` and `p3` from the clip's `data-envelope` and computes every time below from them. 0.725 / 5.725 / 10.725 are the values B measured, not constants. A different clip start or zoom in C's context must not fail a correct implementation.

**Envelope gain at t:** the offline render gives B = A · g(t) sample for sample. g(t) is the **median of the per-sample ratios B/A** inside a 20 ms window centred at t, on samples where |A| > 0.01.

| Row | What C checks | Pass |
|---|---|---|
| SOURCE-SCOPE | `git status --porcelain` ⊆ the grants file; HEAD per the baseline clause | exact |
| HUNK-SCOPE | `graph.client.ts`: only `scheduleClipEnvelopeGain` and the import change. `ArrangementClipEnvelope.tsx`: only `top`, the polyline vertices, the drag mapping and the import. No class token changes | exact |
| CLAIMS | K1–K14 re-run verbatim (§9) | all match |
| TESTS-TARGETED | the §5.3 file set | all pass |
| TEST-REWRITES | each §5.1 row: the new assertion is equal or stronger. Diff each rewritten test; any removed `expect` without a replacement on the same subject is a Medium | none lost |
| MUTANTS | the 6 mutants in §7 | each red as listed; unmutated green |
| TAPER-EXPORT | Export B at p1 + 25 / 50 / 75 % of (p2 − p1) (B measured 1.975 / 3.225 / 4.475 s) | −15 / −30 / −45 dB ± 0.5 dB |
| CURVE-EXPORT | every 50 ms from p1 + 0.025 s to p1 + 0.75·(p2 − p1) (the curve is ≥ −45 dB there) | within 0.2 dB of `−60·(t − p1)/(p2 − p1)` |
| SILENCE-EXPORT | every sample of Export B in [p2, p3], all channels, and the clip after p3 | exactly 0 |
| NO-CLICK-EXPORT | over [p1, p2] the per-sample ratio, where \|A\| > 0.01: \|ratio − curve gain\| | ≤ 0.002 everywhere |
| UNITY-EXPORT | Export B before p1 | ratio = 1 within 1e-4 |
| DRAG-READOUT | from 0 dB, drag a point down 25 / 50 / 75 % of the body | status and title read −15.0 / −30.0 / −45.0 dB (± 0.6 dB for pixel rounding); the point's centre depth = the dB / −60 ± 0.03; the bottom reads `−∞ dB` |
| LINE-THROUGH | after DRAG-READOUT, the visible line passes through each point's centre (± 1 px), and a double-click at the line's middle adds a point whose dB is the mean of its neighbours' dB (both > 0) or the depth midpoint (one is −∞) | ± 0.2 dB |
| HORIZONTAL-DRAG | drag a point sideways only | `data-gain` unchanged byte for byte; one entry |
| UNDO | after DRAG-READOUT, Ctrl+Z restores the previous `data-envelope` byte for byte; Ctrl+Shift+Z re-applies it | exact |
| PLAY-THROUGH | play Export B's project from 0 (Home, then Space) and poll every 250 ms. The `arrangement-track-meter` of the lane holding the clip [K11] reads `data-level-db` = `-inf` at every sample in [p2 + 2.0 s, p3]. At every sample before p1 + 0.5·(p2 − p1) (−30 dB on music that meters about −10 to −20 dB, above the −60 dB meter floor [K14]) it is not `-inf`. No page errors; the position advances monotonically. Baseline: at HEAD the meter reads `-inf` from about p2 + 1.3 s (meter decay) and reads −10.6 dB at 0.46 s, at both viewports [K13] | as stated |
| PLAY-EDIT | drag a point during playback (EN-PLAY-EDIT, round 83) | no console error; the position stays monotonic; one entry |
| MULTIPLY-EXPORT | fade-in 1 s + Clip Gain −6 dB + Export B's points | ratio = fade · 0.5012 · curve within 0.002 (EN-MULTIPLY) |
| SCREEN-BUDGET | persistent text lines outside the timeline, before and after | equal (no new persistent element, L39) |
| LESSON | `grep -n '^41\. \*\*Perceptual axes' lessons.md` | 1 hit |
| DOC-200 | l.4 byte-exact; the 7 TEMPLATE headings in order; every test id the doc names exists (L26) | exact |
| G269-AUTH | `/studio-lab` opens anonymously; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; `/api/studio-token` without a header returns 401 | as round 268 |
| Gate rows | full vitest, build, Biome full, `npm run verify`, e2e smoke | `gate`, not claimed |

**Ableton conformance (separate verdicts):**
- R3 confirmed by measurement (option A within 0.03 down to −36 dB);
- D1–D3 are deliberate differences approved by Saba;
- R5 and R6 unchanged.

**Neighbours that could break:**
- fades and Clip Gain (MULTIPLY-EXPORT);
- loop playback of an enveloped clip (unit EV5e);
- range export (XR2);
- split and trim (EV3/EV4);
- the envelope-mode refusals mid-drag (EU3 "the A key and the Env button").

## 9. Claims (L29). Run from `store/` at HEAD
- **K1:** `git rev-parse HEAD; git status --porcelain | wc -l` → `3058a7c18c558f4139edff0cd6c2cc76ccc47d2e`, `0`.
- **K2:** `grep -n "left.gain + ((right.gain - left.gain)" app/lib/arrangement/envelope.ts` → `95:`.
- **K3:** `grep -n "function scheduleClipEnvelopeGain\|envelopeGain.gain.linearRampToValueAtTime" app/lib/arrangement/graph.client.ts` → `122:`, `137:`, `143:`.
- **K4:** `grep -n "1 - \|gainDelta" app/components/arrangement/ArrangementClipEnvelope.tsx` → `261:`, `267:`, `370:`, `400:`, `401:`, `402:`.
- **K5:** `grep -n "export const TRACK_VOLUME_DB_MIN = -60;" app/lib/arrangement/track-volume-db.ts` → `3:`.
- **K6:** `grep -n "Math.round(value \* 10000) / 10000" app/lib/arrangement/envelope.ts` → `29:`.
- **K7:** `grep -rn "clipEnvelopes: clipEnvelopeShapes(arrangement)" app --include=*.ts --include=*.tsx | grep -v __tests__` → `app/lib/arrangement/graph.client.ts:483` and `app/contexts/ArrangementContext.tsx:1008` (2 hits).
- **K8:** `grep -n "toFixed(4)" app/lib/arrangement/envelope.ts app/components/arrangement/ArrangementClipEnvelope.tsx` → `envelope.ts:122` (`formatClipEnvelopeData`) and `ArrangementClipEnvelope.tsx:366` (`data-gain`).
- **K9:** `grep -c "it('EV1 is\|it('EV2 a new\|it('EV4 a start\|it('EV5[abce] \|it('EV6b\|it('XR2 an env\|it('EU2 a point added between\|it('EU3 dragging\|it('EU3 a press\|it('EU3 the A key\|it('EU7 the line stays\|it('EU5 the line passes" app/lib/arrangement/__tests__/envelope.test.ts app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx app/lib/arrangement/__tests__/export-range.test.ts` → `8`, `6`, `1` (15 tests; lines as in §5.1 with `grep -n`).
- **K10:** `grep -rlnE "clipEnvelopeGainAtSource|clipEnvelopeGainAt\b|scheduleClipEnvelopeGain" app perf e2e | sort` → exactly `app/components/arrangement/ArrangementClipEnvelope.tsx`, `app/lib/arrangement/__tests__/envelope.test.ts`, `app/lib/arrangement/envelope.ts` and `app/lib/arrangement/graph.client.ts`.
- **K11:** `grep -n "data-testid=\"arrangement-track-meter\"" app/components/arrangement/ArrangementTrackMeter.tsx; grep -n "return '-inf';" app/lib/arrangement/meter.ts` → `76:` and `125:`.
- **K12:** `grep -rn "data-testid=\"arrangement-envelope-toggle\"\|data-testid=\"arrangement-clip-envelope-editor\"\|data-testid=\"arrangement-clip-envelope-point\"\|data-testid=\"arrangement-clip-envelope-line\"" app/components/arrangement | wc -l` → `4` (`StudioWorkspace.tsx` 1, `ArrangementClipEnvelope.tsx` 3).
- **K13:** `b-round-268/probe-meter.mjs` run at HEAD (`node probe-meter.mjs http://127.0.0.1:5173 out.json`).
  - **Expected** (`b-round-268/probe-meter-head.json`, both viewports, 0 page errors): `data-envelope` = `0.725:1.0000;5.725:0.0000;10.725:0.0000` on lane `music`.
  - That lane's meter (2nd of 4) reads `-10.6` at ≈ 0.46 s, then `-52.9` at ≈ 6.5 s, then `-inf` from ≈ 7.0 s to the end.
  - The other 3 meters read `-inf` throughout.
- **K14:** `grep -n "export const METER_FLOOR_DB = -60;" app/lib/arrangement/meter.ts` → `2:`.
- **State recipe (§6):** `b-round-268/probe-envelope-head.json` (B ran it at HEAD at both viewports).

## 10. STOP conditions (L11)
- a change is needed outside the grants;
- a §5.1 rewrite cannot keep an equal or stronger assertion;
- a test outside §5.1 goes red;
- a mutant stays green;
- any covering test runs above 2.5 s;
- the export path does not reach `scheduleClipEnvelopeGain`.

## 11. After C PASS
- SABA-B-7 and SABA-B-7-ENVELOPE-DB → done.
- Next: round 270 GATE266-S1 (+ GATE266-S4, B-R266-CLIPS-SPLIT-COPY), then 271 SABA-B-11c stage 2, then SYS-6.
- REGRESSION comes first on or after 2026-11-02.
