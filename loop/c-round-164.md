# C round 164 — SABA-B-1 (envelope visibility) + SABA-B-2 (overview corners)

Verifier: C · Date: 2026-10-25 · Task: `current-task.md` round 164 (D-29z129) · A report: `a-round-164.md` (I re-ran everything myself; I did not rely on A's claims).
Environment: `env-status.json` store 200 (round 164). Real Playwright Chromium (headless, installed) on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, at 1440×900 and 1280×720. Fonts were loaded in every valid session; no Google Fonts response was non-200.

## Verdict: **PASS**. browserVerified = realVerified = **true**. 0 bugs.
Every row that can run in the cloud was run in a real browser at both viewports. The only blocked row is the fake-Bearer 403, because the backend is unavailable in the cloud.

## Rows

| Row | Result | Evidence |
|---|---|---|
| T164-TARGETED | PASS: 94/94 (A: 94/94). EV1 and OV1 are present and green. | `c-round-164/out/vitest-targeted.json` |
| SOURCE-SCOPE | PASS. <ul><li>HEAD is `0e4287f`.</li><li>The 977 frozen files are OK at start and at end.</li><li>The end hashes equal `a-round-164/end-sha256.txt` at start and at end.</li><li>`git status` = 5 ` M` (the grants) + 1 `??` (doc 133).</li><li>The protected-path diff vs `0e4287f` is empty.</li><li>No source changed during C's phase.</li></ul> | `out/source-start.txt`; end check in the log of this run |
| AN-REVIEW | PASS. <ul><li>The diff matches E1 (svg `text-accent` removed), E2 (halo `stroke-background`/4 + line `stroke-foreground`/1.5, same points, no `stroke=`), E3 (exact point class) and O1 (`rounded-xs` → `rounded-sm`), and nothing else.</li><li>The tests only add EV1 and OV1. `expect(` counts rose: clip-envelope-ui 136 → 153, studio-theme-obsidian 72 → 76.</li><li>Doc 132 changes only line 4.</li><li>Doc 133 has the TEMPLATE sections (კონტექსტი, მიდგომა, არქიტექტურა, შეცვლილი ფაილები, პრობლემები, ტესტირება, TODO). It also has the content D2 asks for: R1–R4, a before/after class table, the DUX-R-5 coordination, mutations m178–m181, and the TODO items (DUX-R-5 re-check, V-3c-3b, V-3c-5 radius lock).</li><li>No new token, hex, arbitrary value, `style=` change, transition, gesture, key or aria change. The computed `transition` is `all/0s`.</li></ul> | `git diff 0e4287f` |
| ENV-VIS (SABA-B-1) | PASS: 6 states × 2 viewports at DPR 2 (table below). | `out/env/env-{1440,1280}-1.json`, `shots/env/*` |
| ENV-FUNC | PASS at both viewports (details below). | `out/func/func-{1440,1280}-1.json` |
| OV-CORNERS (SABA-B-2) | PASS (notch counts below). | `out/ov/notch-*.json`, `shots/ov/*` |
| RV1-SABA | PASS (details below). | `out/rv1-saba.json`, `out/d6/` |
| OV-FUNC | PASS at both viewports (details below). | `out/ov/ov-{1440-2,1280-1}.json` |
| G164-3 | PASS: <ul><li>`/studio-lab` is anonymous (no `auth_user`, 0 cookies), with the workspace and the "Demo collection — no sign-in required" badge.</li><li>`/studio/middle-east` at 1440 and 1280 shows "Sign in required", no workspace, 0 `audio[src]`.</li><li>`GET /api/studio-token` returns **401** "Please sign in to access Studio."</li></ul>Fake-Bearer 403: **BLOCKED**, backend unavailable in cloud. Only that sub-row is blocked, and it is listed under `blocked` in the JSON. Premium auth is not bypassed. | `out/g164-3.json`, `shots/g164-3-*.png` |
| PX-NET / REG-HYD | PASS. Every valid session (env ×2, ov ×2, func ×2, d6 ×2, g164-3) has 0 forbidden requests, 0 Authorization headers, 0 hydration messages and 0 pageerror. The only noise is the expected cart errors (2 per session). | `net` in each JSON |

**ENV-FUNC details:**
- The A key turns Env on (`Envelope mode: on.`).
- A double-click adds a point (`Envelope: point added — 4.000 s · 0.0 dB.`).
- An 18 px drag gives `Envelope: 4.000 s · −3.9 dB.` at 1440 (gain 0.64) and `−4.0 dB` at 1280 (gain 0.6327).
- A double-click on the point gives `Envelope: point deleted — 4.000 s.`.
- Ctrl+Z restores the point, Ctrl+Shift+Z deletes it again, and Ctrl+Z restores it again.
- The A key turns Env off (points hidden, the line stays) and on again.

**ENV-FUNC real audio:** I dragged the point to the bottom (`−∞ dB`, gain 0) and played for 1.3 s with an output tap on the AudioDestination.
- With gain 0 the peak over 100–1100 ms is **0.00000**, both from 0 s and from 20 s, at both viewports.
- Reference (Undo returns the point to −3.9/−4.0 dB, not 0 dB):
  - 1440: 0.190 from 0 s and 0.535 from 20 s;
  - 1280: 0.188 and 0.237.
- The ratio is **0 < 25 %**. The reference was at −4 dB, below a true 0 dB reference, so a 0 dB reference would only make the ratio smaller. The AudioContext was `running` and the tap had 0 errors.

**OV-FUNC details:**
- A drag from 80 % to 30 % moves the view: 1440 frame left 94.06 % → 27.04 %, scrollLeft 14547 → 4181. 1280 shows the same behaviour.
- A double-click fits: left 0 %, width 100 %, status `Fit: the entire project is visible (01:41.352). X goes back.`
- With the overview focused, ArrowRight moves scrollLeft 0 → 172 (1440) or 142 (1280), and ArrowLeft ×2 returns it to 0.
- The focus ring shows: `:focus-visible` is true, with a 2 px `rgb(201,164,106)` ring box-shadow (`shots/ov/ov-*-focus.png`).

**RV1-SABA details:**
- I ran the copied d6 (sha `3abc88fe…`) once per viewport and compared it with `c-round-163/out/d6/d6-{1440,1280}-r1.json`.
- S0/S1/S2: 0 keys missing, 0 added, max Δ **0 px** at both viewports.
- contrastS0 and contrastS1 have 0 changed entries. The failing list equals the reference (pre-existing disabled spans and Zoom/Metronome entries).
- No d6 key covers the envelope or the frame radius, as B predicted.

## ENV-VIS table (DPR 2; the `sample()` metric copied from `b-round-163/saba-sim.cjs`)
Columns:
- **line core vs halo**: min / p10 / median.
- **cols < 3**: the number of sampled columns below 3:1.
- **handle centre vs border**: left, right, top, bottom.
- **above/below**: max(centre, border) vs the pixel 2 px above and below the handle.

Pass needs ≥ 3:1 everywhere.

| VP | State | Clip | Columns | Line core vs halo (min/p10/med) | Cols < 3 | Handle centre vs border (l,r,t,b) | Above/below | Point box |
|---|---|---|---|---|---|---|---|---|
| 1440 | e-fresh-0dB-selected | selected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 8.32, 13.94 | 10×10 scale none |
| 1440 | a-selected | selected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 13.94, 4.79 | 10×10 scale none |
| 1440 | b-normal | unselected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 13.94, 4.79 | 10×10 scale none |
| 1440 | c-hover | unselected | 101 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 3.48, 15.62, 7.71 | 13.94, 3.26 | 12.5×12.5 scale 1.25 |
| 1440 | d-muted | unselected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 13.94, 4.79 | 10×10 scale none |
| 1440 | f-env-off | unselected | 105 | 15.62 / 15.62 / 15.62 | 0 | — (no point) | — | — |
| 1280 | e-fresh-0dB-selected | selected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 8.32, 13.94 | 10×10 scale none |
| 1280 | a-selected | selected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 13.94, 4.79 | 10×10 scale none |
| 1280 | b-normal | unselected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 13.94, 4.79 | 10×10 scale none |
| 1280 | c-hover | unselected | 101 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 3.48, 15.62, 15.62 | 13.94, 4.79 | 12.5×12.5 scale 1.25 |
| 1280 | d-muted | unselected | 102 | 15.62 / 15.62 / 15.62 | 0 | 15.62, 15.62, 15.62, 15.62 | 13.94, 4.79 | 10×10 scale none |
| 1280 | f-env-off | unselected | 105 | 15.62 / 15.62 / 15.62 | 0 | — (no point) | — | — |

**Computed values, every state and both viewports:**
- 2 polylines with equal points.
- The halo is `stroke-background` with stroke rgb(14,13,12) and width 4px. The line is `stroke-foreground` with stroke rgb(236,230,218) and width 1.5px. There is no `stroke` attribute.
- The point has background rgb(236,230,218) and border rgb(14,13,12). Its offset box is 10×10. In the hover state the computed `scale` is `1.25` and the rendered box is 12.5×12.5 (`matchMedia('(hover: hover)')` = true).

**Baselines from B (§0.1):** line min 1.74, handle 1.88.

**Notes:**
- The two lowest handle values, 3.48 and 3.26, are in the hover state. There the scaled box sits on fractional device pixels (665.75), so the 0.5 px border sample hits an anti-aliased edge. Both are still ≥ 3:1.
- State (e) was sampled right after the point was added (gain 1.0). A new point takes the line's gain, so a 0 dB point is only possible before the drag. The setup is otherwise identical to §0.1.
- In state (f) no point exists, so `sample()` uses the known gain of state (b) and skips the handle part. The metric is otherwise unchanged; only the DOM-injection step was removed.
- The muted state (d) equals the normal state (b), as B predicted. This is not a finding.

## OV-CORNERS notch counts (DPR 4, 16×16 CSS-px crops, `notch-metric.cjs` sha `57a1dfd9…` unchanged)
**Metric check first:** I re-ran the tool on B's baseline crops.

| Crops | tl | tr | bl | br |
|---|---|---|---|---|
| `notch-{1440,1280}-baseline-*` | 3 | 13 | 3 | 15 |
| `notch-1440-sim-frame-rounded-sm-*` | 1 | 0 | 1 | 0 |
| `saba-probe2-1440-corner-empty-*` | 3 | 13 | 3 | 15 |

These are identical to B's numbers, so the metric run is **valid**.

**Measured crops (both viewports):**

| State | tl | tr | bl | br | Judged |
|---|---|---|---|---|---|
| (a) empty project, frame `0% / 100%`, after | **1** | **0** | **1** | **0** | all 4. Each is ≤ 1 and below its baseline (3/13/3/15). |
| (b) `demo-middle-east`, zoom 152.6 px/s, frame right edge on the root's right edge, after | 171 | **0** | 169 | **0** | Right corners only (tr, br). The left corners are the plain outline band, with no frame there. |

**Frame position in (b):**
- 1440: frame 94.06 % + 5.94 %, box right 1255.96 vs root right 1256.
- 1280: frame 95.10 % + 4.90 %, box right 1095.97 vs root right 1096.

**Radius:** the computed `border-radius` of the root, the outline overlay and the frame is **6px** in both states at both viewports.

**Comparison images:** `shots/ov/ov-{1440-2,1280-1}-{a-empty,b-right}-{tl,tr,bl,br}.png` (C) next to `b-round-163/out/notch-*-baseline-*.png` (B). The visual check of `ov-1440-2-b-right-br.png` and `ov-1440-2-a-empty-bl.png` shows a continuous bright arc with no notch. The single bl/tl pixel is the overview playhead at 0 %, as B described.

## Invalid or replaced runs (`c-round-164/out/invalid/`)
- **`d6-1440` attempt 1:** this was the first browser load of the job, on a cold dev server, and it started at the same time as `c164-env 1440`, so two first loads ran at once. React reported "Invalid hook call" and a hydration error, and the workspace never mounted. That is the same symptom class as C-R124-ENV-FIRST-LOAD and ENV-FIRST-LOAD-LUCIDE, so it uses the ENV-FIRST-LOAD rule's single replacement. Attempt 2 and every later session were clean.
- **`ov-1440-1`:** the harness scrolled to `scrollWidth`, which is past the project end. The frame was at `left 100%`, outside the overview, so the state (b) precondition (frame touching the right side) was not met. I replaced it with a bisected scrollLeft (`ov-1440-2`). It is not an environment fault.

## Notes for B (not bugs this round)
- **N1 (pre-existing, observation):** when the timeline is scrolled past the project end, `overviewFrame` clamps `left` to 100 %. The view frame then sits fully outside the overview and is invisible, so the user has no view indicator. Seen at 1440 with `scrollLeft = scrollWidth`. This round did not cause it. B may decide whether it is a Low.
- **N2 (observation):** at 0 dB on a selected clip, the 10 px handle (z-30) now covers about 2 letters of the clip name in the header (`shots/env/env-1440-1-e-fresh-0dB-selected.png`). The handle was 8 px before, so the overlap is not new. It is more visible now because the handle is white.
- **N3:** A's reviewer Low 5 (a narrow frame becomes pill-shaped at high zoom) was not measured beyond state (b). There the frame is 39–57 px wide and looks normal.

## Ableton
- **CZABA requirement:** met (ENV-VIS, ENV-FUNC, OV-CORNERS).
- **Ableton parity:** *unverified, not claimed* for the envelope colour, size and hover, per the task §5. The overview corners are *not applicable*. I opened no Ableton source this round.

## Not run / gate
- **Not run** (task §4, code unchanged): V-3c-3a dock, V-3c-2 lane, V-3c-1 library, V-3b transport, CONTRAST-V3A and the V-2 rows. The full find sound → add → fit video → export flow was also not re-run this round; it is not this round's scope.
- **Gate (root's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## Tools
- I copied the tools unchanged and recorded their sha256 in `c-round-164/out/tool-sha256.txt`:
  - `d6.cjs` (`3abc88fe…`), `lib`, `lib122`, `wav`, `report` and `h3` from `c-round-163`;
  - `saba-sim`, `saba-probe2` and `notch-metric` into `tools/b163/`.
- The new scripts are `c164-env.cjs` (its `sample()` is copied from saba-sim), `c164-ov.cjs`, `c164-func.cjs`, `cmp-d6-164.cjs` (derived from `cmp-d6-163.cjs`, with no renames) and `g164-3.cjs` (a copy of `g163-3.cjs`).
