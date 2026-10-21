# C — Round 67 verification: SRW-14 stage 5a (FB-13) musical grid divisions, R14-G1 (D-29z32)

Verifier: C · Date: 2026-10-20 (16:54–18:20 +04) · **Verdict: FAIL**. `browserVerified: true`: every REAL-browser row ran.

- **Offline:** every gate and the tree are clean.
  - verify rc 0, 95 / 1646.
  - Red run: both files fail.
  - My own mutations a–o and q are killed. p survives (info, as expected).
- **Rows:** 27 of 28 acceptance rows PASS (offline 4/4, browser and regression 23/24). **GM-BRACE fails** (C-R67-02, low): after a loop-brace body move, the loop end is 1 ms off the musical line, 3/3 reproductions.
- **Second bug:** I reproduced the A code-reviewer's **M1** in a real browser (C-R67-01, medium).
  - Setup: a clip at 0.187 s, 120 BPM, 1/32, Snap on.
  - ArrowRight goes to **0.250**. It skips the 0.188 line, which is 1 ms away.
  - Both bugs come from §0.1(9) as written, not from a deviation by A. They need a B amendment.
- **Commit readiness:** **not commit-ready** as a C PASS. B decides between an amendment (fix round) and accepting C-R67-02 as a deliberate difference.

Evidence is in `c-round-67/`:
- `checkpoint.md`;
- `gates/` (tsc, Biome, verify, red run);
- `mut/mutations.txt`;
- `runs/` (one log per script and page);
- `shots/`;
- `tools/` (g67lib, ga67, gb67, gc67, ge67, tb67reg, ru67reg, cmut67, muts67);
- `c-browse.json` (gstack state).

## 0. Environment

| When | :5173 `/studio-lab` | :5199 `/api/products` | node.exe |
|---|---|---|---|
| start (16:54) | 200 | 200 | 7 |
| during mutations (DOM-only group A ran in parallel) | — | — | 14 |
| browser rows with timing (GM-PLAY, MT-REG) | — | — | 7 |
| end (18:19) and before the report (18:35) | 200 | 200 | 7 |

**Not done:** a separate curl check of both servers after the offline items. Between 16:54 and 18:19 the store answered 200 on every PW and gstack load (gstack `goto` 200 at ~18:05); the backend was not re-checked until 18:19 (G67-3 curl 401/403 at ~18:15). node.exe was recorded for verify, the mutations, ga67, gb67, gc67 and ge67 (play/mtreg/snreg). It was **not** recorded separately for the scrub, tb67reg and ru67reg runs; it was 7 right before (ge67) and after them (end check).

`env-status.json` (root): store 200, backend 200 (12:53 UTC).

**Harness:**
- Mouse rows used standalone Playwright with the installed chromium, a fresh context and no credentials. They are labelled **REAL-mouse (PW)**.
- Plain clicks and typing went through gstack (G67-3) or PW.
- Every load followed ENV-EXT-LOAD-HANG: `domcontentloaded`, then the selector, then 4 s. Recorded 0.7–4.1 s.
- **Choosing a division:**
  - **Menu (REAL):** right-click on a lane, then click the item. Most rows used this.
  - **Select keys:** `element.focus()`, then REAL ArrowDown/ArrowUp. Used for GM-OPTIONS and G67-3.
  - `selectOption` was never used.

## 1. G67-2 — tree: PASS

At the start and at the end:
- HEAD `b5fb12b9`.
- `git status --short` has exactly the 7 §3.1 lines (3 ` M`, 4 `??`).
- Frozen list: `grep -vc ': OK$'` → 0 (431/431).
- Snapshots: `SHA256SUMS.txt` OK.
- Protected 4/4 OK.
- The owned-file sha256 values at the end equal my start copies (`c-round-67/redsave`, `scratch`).

## 2. R67-S — static: PASS

- **`grid.ts` diff:** only the private `MUSICAL_GRID_INDEX_TOLERANCE = 0.000501`, `isWholeMillisecondStep` and `gridIndexTolerance`, the non-whole-ms branch at the top of `snapTimeToGrid`, and exactly 4 tolerance substitutions (`adjacentGridLine` ×2, `snapGroupDelta` floor/ceil ×2). The in-bounds check keeps `GRID_TIME_TOLERANCE`.
- **`ArrangementGridMenu.tsx`:** the props change to options, `aria-checked` by id, one family `<hr className="my-1 border-outline" />`, and the `formatGridDivision` import removed. Nothing else changed.
- **`StudioWorkspace.tsx`:** only the ten §0.3 edits. No `gridSeconds=`/`snapSeconds=` prop site changed. `GRID_NARROWEST/WIDEST_MESSAGE` are removed, which closes ROOT-R64-L2 in code.
- **`grid-divisions.ts`:** pure; imports only `./grid` and `./tempo`; uses `(beats * 60) / bpm`.
- **Banned patterns:** no `any`, `@ts-`, comments, hardcoded colours, `.skip/.only/.todo/retry/vi.setConfig`, or per-`it` timeouts. The only `as` is `as const`.
- **Literals:** the new strings use only Georgian, ASCII and `·—`. The `✓ ✕ ← → −` in the two components were already there.
- **EOL:** all 7 owned files LF (CR 0).
- **Doc 060** has the §2.5 sections.

## 3. R67-U — unit and mutation: PASS (p survives, info)

**Red run** (`gates/red-run.txt`), on a scratch tree without `grid-divisions.ts` and with the 3 snapshot files:
- `grid-musical.test.ts` fails to import (`Failed to resolve import "../grid-divisions"`).
- All 11 GU tests fail.
- `rc=1`.

**Mutations** (`mut/mutations.txt`): my own replacement forms in my own scratch (node_modules junction), 12 files / 249 tests. The unmutated run is green. Every file was restored, and scratch equals store afterwards.

| # | Mutation (C form) | Failing |
|---|---|---|
| a | non-whole-ms branch removed | GM6, GM8, GM9, GU4 |
| b | musical branch without ms rounding | GM6, GM9, GU4 |
| c | `adjacentGridLine` keeps 1e-6 | GM7, GM9, GU5 |
| d | `snapGroupDelta` keeps 1e-6 | GM8 |
| e | `isWholeMillisecondStep` always false | GM6 + 3 frozen `grid.test.ts` rows |
| f | `1/4` = 0.5 beats | GM1, GM2, GM5, GU2–GU6 |
| g | musical options without a BPM | GM3, GU1, frozen `grid-snap-menu` GM1/GM7 |
| h | clearing keeps the musical step (derived step at 120, no reset) | GU7 |
| i | narrow/widen across families | GM4, GU8, frozen GK3/GK11 |
| j | step not re-derived on a BPM change | GU4, GU5, GU6 |
| k | auto-select 1/4 when a BPM is set | GU2, GU7, GU9, frozen tempo-ui **U3**, U6, U8, U9 |
| l | menu gets the seconds divisions only | GU9 |
| m | musical status via `formatGridDivision(step)` | GM5, GU2, GU8, GU9 |
| n | musical end messages = seconds strings | GM5, GU8 |
| o (extra) | `MUSICAL_GRID_INDEX_TOLERANCE` = 0.0004 | GM9 |
| p (extra) | in-bounds checks also widened to 0.000501 | **none (survives; info: no test sees it)** |
| q (extra) | the family `<hr>` removed | GU9 |

**Note on g:** the frozen `grid-snap-ui` options row does not fail. That is not a gap: the select renders musical options only inside the `tempoBpm !== null` optgroup. The named GM3 and GU1 kill it.

**Durations** (my own alone run, `gates/alone-durations.txt`, rc 0): 2 files / 20 tests in 2.70 s. GM1–GM8 0–1 ms; **GM9 52 ms**; GU1 218, GU2 72, GU3 85, GU4 61, GU5 64, GU6 46, GU7 64, GU8 69, GU9 156, GU10 35, GU11 39 ms. No test is over 3 s, and GM9 is under 1 s.

## 4. G67-1 — gates: PASS

- `npx tsc --noEmit` → rc 0.
- **Biome `./app` (read-only):** 4 errors / 218 warnings / 1 info. The 4 errors are exactly the baseline CRLF `format` list: `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`.
- Biome on the 6 owned code and test files: 0 diagnostics.
- **`npm run verify`, attempt 1, quiet:** **rc=0**. That covers agents check, lint, typecheck, vitest **95 files / 1646 passed**, and build. No `Test timed out`. node 7 before and after.

## 5. §4.6 grid browser rows (1440×900; starred rows also at 1280×720)

**Pages** (which rows shared a page):
- **ga67** (one page per viewport): NOBPM, OPTIONS, LAYOUT, MENU, KEYS, UNDO.
- **gb67:** B1 G1; B2 GM-90, NUDGE, GROUP, SNAPOFF, UNDO-history; B3 POS; B4 M1 repro.
- **gc67:** C1 TRIM-RANGE, BRACE (invalid attempt), DROP; C2 TEMPO, CLEAR; C3 BRACE ×3.
- **ge67:** E1 PLAY; E2 MT-REG; E3 SN-REG; E4 SCRUB ×2.

| ID | Result | Evidence |
|---|---|---|
| GM-NOBPM* | **PASS** both | 7 options `10 … 0.1` / `… წმ`, no optgroup; `data-grid-division` `1`; REAL right-click → 7 radios, one `<hr>`, then `Snap (G)` (`shots/gm-nobpm-menu-*.png`) |
| GM-OPTIONS* | **PASS** both | After `120`: value `1`, grid `1` (no auto-switch); 13 options, optgroup `ტაქტები · 120 BPM` with the 6 labels. Select keys → `1/4`: status `ბადე: 1/4 · 0.5 წმ 120 BPM-ზე (Snap გამორთულია)` verbatim; division `1/4`; all 4 lanes `0.5` with gradient period 20 px = 0.5 × 40; title verbatim; the first 8 bars-ruler marks at k × 20 px (0 px off) |
| GM-G1 (R14-G1) | **PASS** | REAL-mouse (PW), Snap on, 1/4 at 120. Raw 3.3 → **3.5**; raw 3.8 → **4.0**; raw 2.3 (leftwards) → **2.5**. All multiples of 0.5, none ambiguous |
| GM-90 | **PASS** | Raw 3.9 → 4.000 (k 6); raw 3.45 → 3.333 (k 5); raw 15.308 → **15.333** (k 23). The clip left edge is 1125.31 px vs the bars mark at 15.333333 at 1125.33 (0.02 px) |
| GM-POS | **PASS** | Ruler clicks at 6.1 → `00:06.000` and 7.1 → `00:07.333`; playhead-handle drag to raw 9.45 → `00:09.333` |
| GM-TRIM-RANGE | **PASS** | 1/8 at 90. End trim from raw 81.313 → end **81.333** (k 244), `Undo: Trim — მარჯვენა კიდე`. Range drag 1.2 → 2.9 → `00:01.333 — 00:03.000` |
| GM-DROP | **PASS** | Drop at raw 4.6 → ghost label `00:04.667`, clip `4.667`, status `„Soft impact“ დაემატა SFX ხაზზე 00:04.667-ზე.` The drop ghost has no `data-ghost-start` attribute (that is on the lane-move ghost), so I read the ghost's time label |
| **GM-BRACE** | **FAIL → C-R67-02** | Loop drawn on 1/4 at 90: `1.333 — 2.667`, length 1.334. Body drag → **2.000 — 3.334** (line 3.333). Repeats: 2.667 — **4.001** (line 4.000) and 4.667 — **6.001** (line 6.000). The start always lands on a line, and the end-edge drag lands on a line (4.667 / 5.333 / 7.333). The first C1 attempt was harness-invalid: that loop was drawn on 1/8 (length 1.667) and was replaced |
| GM-NUDGE | **PASS** | From 2.000: ArrowRight 2.667, 3.333; ArrowLeft 2.667, 2.000, 1.333. Never stuck |
| GM-GROUP | **PASS** | Ctrl+click on two clips, drag of the anchor: raw 2.783 → **2.667**; the other clip goes 6.667 → 8.001, offset 5.334 kept (0.000) |
| GM-KEYS* | **PASS** both | `1` ×3 → `1/8`, `1/16`, `1/32` (status each); 4th `1` → `ბადე უკვე ყველაზე მჭიდროა — 1/32 (1)`. `2` ×5 → `1/16 … 1 ტაქტი`; 6th `2` → `ბადე უკვე ყველაზე ფართოა — 1 ტაქტი (2)`. `data-grid-division` never shows a seconds id. After `1 წმ` from the menu, `1` → `0.5 წმ` with status `ბადე: 0.5 წმ (Snap გამორთულია)` |
| GM-MENU* | **PASS** both | 13 radios (7 seconds, `---`, 6 musical, `---`, Snap); only `1/4` checked; ArrowDown from index 6 (`0.1 წმ`) → index 7 (`1 ტაქტი`), ArrowUp → 6; REAL click on `1/8` → division `1/8`, grid 0.25, its status; the menu is closed |
| GM-TEMPO | **PASS** | 1/4 at 120, clip at 1.500; type 60 → status `ტემპი 60 BPM · 4/4 — ტაქტების სახაზავი განახლდა. მხოლოდ ბადეა: აუდიო არ იწელება.` verbatim; grid `1`; period 40 px = 1 × Z on 4 lanes; value `1/4`; clip `1.500`; Undo title unchanged |
| GM-CLEAR | **PASS** | `0.5 წმ`, then 90, then `1/4`, then clear → `ტემპი წაიშალა — ტაქტების სახაზავი დამალულია. აუდიო არ შეცვლილა. ბადე დაბრუნდა წამებზე: 0.5 წმ.` verbatim; 7 options, value/division/grid `0.5`; 90 again → value stays `0.5`, 13 options |
| GM-SNAPOFF | **PASS** | Snap off: raw 3.592 → 3.592 (free, off-line); Snap off + Alt → raw 4.667 → 4.667 (k 7) |
| GM-PLAY (real audio) | **PASS** | 90 BPM 1/4 Snap on; drop → `4.667`; Alt ruler click → `00:03.500`; Space. SFX meter onset at **4.671** (0 dB from -60); last silent sample 4.650; all earlier samples silent. 5.0 (the 1 s alternative) is excluded. 4.5 cannot be excluded (row note); the snap itself is proven by `data-clip-start` |
| GM-UNDO | **PASS** | Empty history: title `Undo` unchanged; Ctrl+Z leaves `1/8`. With history: title `Undo: გადატანა (2)` before and after choose/step; Ctrl+Z undoes the clip move (starts change) while the division stays `1/4` |
| GM-LAYOUT* | **PASS** both | With `1 ტაქტი`, `1/32` and `0.25 წმ`: select 346.88–438.88 inside the cell 288–512, `scrollWidth` 223 = `clientWidth` 223, Snap inside, chrome 64, no page overflow. Lanes and detail identical to round 66 MT-LAYOUT: 1440 lanes 255/336/417/498 (h 81), detail 687/144; 1280 lanes 293/358/439/520 (65/81/81/81), detail 615/36 (`shots/gm-layout-*`) |
| MT-SCRUB-INFO (info) | recorded | Fixture: music + SFX, 120 BPM; a 5 s REAL-mouse playhead-handle scrub during playback. Metronome off: 0 longtasks, max frame gap 20.9 ms. On: 0 longtasks, 21.9 ms. The scrub was done with the playhead handle (the F-R65 fixture was not re-created). Not gating |

## 6. §4.7 regressions

| ID | Result | Evidence |
|---|---|---|
| SN-REG | **PASS** | No BPM, 1 s grid, Snap on: raw 3.6 → 4, raw 3.2 → 3. `0.5 წმ`: raw 4.15 → 4.0, raw 3.4 → 3.5. Keys: `0.25`, `0.1`, then `ბადე უკვე ყველაზე მჭიდროა — 0.1 წმ (1)`; `2` up to `10` → `ბადე უკვე ყველაზე ფართოა — 10 წმ (2)`. Byte-identical to before |
| TB-REG | **PASS** | `tb67reg ui,full`: TB-DEFAULT, TB-SET90 (bar 2 at 106.66 px = 2.666667 × 40), TB-SECONDS, TB-LAYOUT, TB-UNDO, TB-120, TB-INVALID, TB-DECIMAL, TB-ESC, TB-CLEAR, **TB-KEYS** (`g12 ` stays text; snap/grid/pos unchanged), TB-ZOOM, FOCUS-REG. Setting a BPM does not change `data-grid-seconds` (also GM-OPTIONS) |
| MT-REG | **PASS** | Metronome on at 40, 1/4 = 1.5 s lines (grid `1.5`), F-SILENT at 20 s: master rises at 0.003, 1.502, 3.011 in the 4 s window; no extra |
| RU-REG | **PASS** | Dedicated `ru67reg` 3 runs, **18/18**: seek `00:03.000`, a drag zooms 91.4 → 77, double-click Fits back to 91.4. Inside the TB script, one double-click Fit missed (77 → 77). That is the watch item INFO-C66-RU-DBLCLICK-MISS-2; it is now 3 misses in 47 tries, all in the TB script |
| REG-HYD | **PASS** | No hydration-like console line on any `/studio-lab` load (PW and gstack). Only the known root `/api/cart` CORS error |

## 7. G67-3 — anonymous workspace and purchase protection: PASS

**gstack**, fresh state `c-round-67/c-browse.json`, 1440×900 (`runs/g67-3-*.txt`, `shots/g67-3-studio-lab-1440-90-1-4.png`):
- **Direct `/studio-lab`:** 4 lanes and the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება`; cookie length 0; `localStorage` only `czaba_session_id`; `scrollWidth` 1440; 7 options.
- **REAL gstack:** clicked the BPM field and typed `90` + Enter; select keys → status `ბადე: 1/4 · 0.667 წმ 90 BPM-ზე (Snap გამორთულია)`.
- **Header link:** from `/`, the visible `Studio LabDemo` link (CSS `>> visible=true`; the `@e7` ref went stale between calls) lands on `/studio-lab` with 4 lanes and the badge.
- **`/studio/middle-east`:** `Sign in required`, no workspace.
- **curl:** anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; fake Bearer → **403**.
- **Network:**
  - gstack (688 log lines): no `studio-token`, `recording-` or `/api/download` request and 0 `Authorization`. The only R2 hits are `czaba-r2-proxy…workers.dev/middle-east/cover.jpg`, loaded only after the two `/` homepage navigations (the allowed homepage cover).
  - Every PW run (ga/gb/gc/ge, filter incl. `r2-proxy|workers.dev`): 0 forbidden, 0 `Authorization`.
  - The `tb67reg` copy kept round 66's narrower regex (my patch did not apply); it reported 0 forbidden on the narrower filter only, so the r2-proxy check for that page rests on the same fresh page load in ga67.
- The gstack daemon was stopped by me.

## 8. Bugs (to B)

### C-R67-01 — medium — Snap-on nudge skips a musical line from an off-line position (reviewer M1, browser-reproduced)

**Steps** (`runs/gb67-1440x900-m1-repro-fractional.txt`, `shots/m1-repro-1440x900.png`):
1. Fresh `/studio-lab`. Drop `Soft impact` on SFX. Type BPM `120`. Snap off. Zoom to the maximum (320 px/s).
2. Drag the clip freely to start **0.187**. A fractional-pixel REAL-mouse drag: the selected-clip readout shows `start 00:00.187`.
3. Choose `1/32` from the lane menu (step 0.0625; stored line 3 = 0.188). Snap on (`g`). Select the clip.
4. Press ArrowRight. The Undo title before was `Undo: კლიპის გადატანა`.

**Expected:** 0.188, the nearest stored line above 0.187 (FB-13: movement follows the chosen grid consistently).

**Actual:** **0.250** (`Undo: კლიპის ჩაჩოჩება`); it skips the 0.188 line. ArrowLeft then gives 0.188.

**Cause:** §0.1(9)'s fixed `MUSICAL_GRID_INDEX_TOLERANCE` = 0.000501 in `adjacentGridLine` treats a time up to 0.501 ms below `k × step` as "on line k". 0.187 is 0.5 ms below 3 × 0.0625 = 0.1875, so the next line becomes k + 1.
- It triggers when a line's ms rounding goes up by 0.5 ms, e.g. every odd k at 120 BPM 1/32, and the start is 1 ms below the stored line. A's probe: 484 of 1.5 M inputs, forward only.
- The loop-brace arrow keys use the same `adjacentGridLine` (`ArrangementLoopBrace.tsx:191`).
- A's L1 sibling in `snapGroupDelta` (returns 0 when 0.125 is reachable) is unit-only; I did not run it in a browser.

**Note:** this follows the spec rule; it is not an implementation deviation.
- **Fix direction (reviewer, B decides):** in the non-whole-ms branch, compare against stored lines, i.e. forward `L(k) > t + 1e-6 ? L(k) : L(k+1)`.
- **Test gap:** GM9 starts only from stored lines; add an off-line whole-ms sweep.

### C-R67-02 — low — loop-brace body move puts the loop end 1 ms off the musical line (GM-BRACE)

Severity is rated on impact, not frequency. The error is 1 ms, inaudible unless a clip starts exactly on the wrap line. The trigger itself is not rare on musical grids: any body move where the stored length is an odd line difference. If B rates by frequency, this is Medium under the project table.

**Steps** (`runs/gc67-1440x900-c3*.txt`, `shots/gm-brace-c3-1440x900.png`):
1. Fresh `/studio-lab`. Drop `Middle East — საჯარო preview` on music. BPM `90`. Lane menu `1/4`. Snap on.
2. Range drag on the clip body from raw 1.2 to 2.9 → `00:01.333 — 00:02.667`. Ctrl+L → `Loop 00:01.333 — 00:02.667`.
3. REAL-mouse drag of the brace body by +0.9 s (and, as repeats, +1.6 s and +3.05 s).

**Expected (GM-BRACE):** loop start and end on `round(k × 2/3, 3)`, i.e. `2.000 — 3.333`.

**Actual:** **`2.000 — 3.334`**; repeats `2.667 — 4.001` and `4.667 — 6.001` (3/3).
- The start always lands on a line, and an end-edge drag lands on a line.
- The body move keeps the stored length 1.334, which is 2.667 − 1.333, the difference of two ms-rounded lines.

**Cause:** `ArrangementLoopBrace` calls `moveLoop(before, resolveGridTime(original.start + delta, …))`, which keeps the length. With non-whole-ms steps, the distance between stored lines alternates (0.666 / 0.667), so a length-keeping move leaves the end 1 ms off.
- Seconds steps are unaffected.
- The same mechanism keeps a group-moved clip's offset (GM-GROUP allows ±0.001) and leaves a moved clip's end off-line.

**Impact:**
- 1 ms: the loop wraps 1 ms late, and a clip that starts on the line 3.333 plays 1 ms of audio at each wrap.
- The row's strict criterion fails.

**Options for B:** snap the end too, or move by a line-index delta, or rule it a deliberate difference and relax GM-BRACE.

## 9. Ableton (§0.2): two verdicts

| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| Grid lines from the song tempo's meter subdivisions | PASS (GM-OPTIONS, GM-NOBPM) | deliberate difference (seconds grid without a BPM; musical only after a BPM is set and chosen) |
| Grid width from the lane context menu | PASS (GM-MENU) | confirmed (§6.10) |
| Narrow/widen halves/doubles line density | PASS (GM-KEYS: 1/4 → 1/8 → 1/16 → 1/32 and back to 1 ტაქტი, within the family) | confirmed for the musical family (§6.10); the plain `1`/`2` keys instead of Ctrl+1/2 are a deliberate difference (D-29z24) |
| Triplet mode | not in this round (5b) | not applicable |
| Zoom-adaptive vs fixed grid | fixed only | deliberate difference |
| The current spacing is displayed | PASS (select value/title, status with seconds) | confirmed in substance (§6.10, lower right corner); placement differs |
| Alt bypass, and Alt with the grid off | PASS (GM-SNAPOFF; GM-PLAY seek) | confirmed (§6.10) |
| Fixed width list bars … 1/32 | PASS (list as backlog) | **unconfirmed** (not in the captured text); no claim |
| Clips keep their beat position on a tempo change | PASS for the CZABA rule (GM-TEMPO: clip stays 1.500, no stretch) | **unconfirmed**; CZABA keeps seconds (D-10). I make no "Ableton does the same" claim |

No Live installation and no video were used. The source is B's re-used capture of §6.10 (`b-round-46/ableton-6.7-6.10-20261016.txt`).

## 10. Not run / carried

- **Not run** (out of round scope per §4.10): video sync and C-R27-01; the full find → add → fit video → export flow (there was no export change this round, so no WAV was produced); the FB-01..FB-16 stage regression; `test:e2e:smoke` (root's); triplets.
- **R67-T** (Tech Lead real-mouse feel) is still open.
- **Info:**
  - mutation p survives (the in-bounds widening is unseen by tests);
  - RU double-click miss in the TB script, 3/47 total (watch);
  - GM-DROP reads the drop-ghost time label, because that ghost has no `data-ghost-start`;
  - the gstack `@ref` from `snapshot -i` went stale between CLI calls, so I used a CSS `visible=true` selector.
- A's code-review residuals L2/L3/N1–N4 are unchanged (A report §6). L3 (keyboard across the `<hr>`) is now covered in the browser by GM-MENU.
