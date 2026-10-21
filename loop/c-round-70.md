# C — Round 70 verification: ROOT-R65-M1, viewport-windowed bars/beats ruler (D-29z35)

Verifier: C · 2026-10-21 · Task: `current-task.md` (round 70) · Implementer report read as data: `a-round-70.md`.
Artifacts: `c-round-70/` (`checkpoint.md`, `gates/`, `mut/`, `runs/`, `shots/`, `tools/`), `c-round-70.json`.

**Verdict: PASS. `browserVerified: true`.** Every REAL-browser row in §4.6, §4.7 and G70-3 ran. No bugs. Four test-gap and info notes for B (§7). Ready to commit as its own unit (§9).

## 0. Environment

| When | :5173 `/studio-lab` | :5199 `/api/products` | node.exe |
|---|---|---|---|
| Start, 16:30 | 200 | 200 | 10 |
| After the offline items, 16:44 | 200 | 200 | 10 |
| During the PW runs | — | — | 11 (recorded before each run group) |
| End, 16:55 | 200 | 200 | 11 |

- `env-status.json` (root): store 200, backend 200, round 70; copied into the JSON.
- **gstack:** own state file `c-round-70/c-browse.json`. The CLI daemon started on the first try this time, so the `server-node.mjs` fallback was not needed. `browse stop` at the end printed "Unable to connect", which suggests the daemon had already exited on idle. `tasklist` afterwards shows no `browse`, `bun` or `server-node` process. I killed no processes.
- **Order deviation:** I ran G70-3 (gstack) right after G70-1, before §4.6/§4.7, because I wanted to know early whether the gstack daemon would start. The rows themselves are unchanged.
- **REAL-mouse/keyboard (PW):** standalone Playwright from `store/node_modules` with the installed chromium, a fresh context per run, no credentials, no installs (`tools/g70.cjs`, `tools/tb67reg.cjs`, `tools/ru67reg.cjs`).
- **Harness rules applied:**
  - ENV-EXT-LOAD-HANG: wait for `domcontentloaded`, then the workspace selector, then 4 s.
  - INFO-C65 forbidden-host regex (with `r2-proxy` and `workers.dev`) is in every script. I patched the copied TB/RU scripts to add it; RU had no filter before.
  - No metronome rows.

## 1. G70-2 — tree: PASS

At the start and at the end:
- HEAD is `ae4fc3974be258b28d2927ddd0f238f4eb10d736`.
- `git status --short` shows exactly the 8 §3.1 lines.
- Frozen list: 436/436 OK (0 not OK).
- Snapshots `SHA256SUMS.txt`: 5/5 OK.
- Protected files: 4/4 OK.
- The owned-file sha256 values are identical at the start and the end (`gates/owned-sha-start.txt`), so nothing changed during my phase.

## 2. R70-S — static: PASS (`gates/src-diff.txt`)

**`tempo.ts`** (additive):
- New `export interface BarsRulerWindow`; `barsRulerMarks` gets an optional 4th parameter.
- An invalid window (non-finite edge, or `toPx < fromPx`) returns `[]`.
- `pushMark` filters on `leftPx` in `[fromPx, toPx]`.
- `firstBar = max(0, (floor(windowBar / barStep) − 1) · barStep)`, which stays aligned to `barStep`.
- The loop breaks once a bar is past `toPx`.
- Label fit still uses `rulerWidthPx`, and `barStep` still depends only on `pxPerSecond` and `bpm`.
- With no window, `firstBar` is 0 and the loop never breaks early, so that path is unchanged.
- `interface` instead of `type` is cosmetic (same shape).

**`ArrangementTempoRow.tsx`:**
- Three required props.
- The window comes from `useSyncExternalStore(subscribeTimelineScroll, getKey, () => '')`. The key is `"page:vp"`; it is `''` without a tempo or when `vp ≤ 0`.
- `page = floor(max(0, scrollLeft) / vp)`, read from `getTimelineView()` during render.
- The strip gets `fromPx = (page − 1)·vp` and `toPx = (page + 2)·vp`, or `null`, and stays `memo`.
- Mark markup, classes and `data-*` attributes are unchanged.

**`StudioWorkspace.tsx`:** exactly the three props on `<ArrangementTempoRow>`.

**Docs:**
- Doc 058 has exactly two hunks: the status line and one added sentence. The sentence sits after the "constants and UI texts" sub-bullet of the `tempo.ts` item, not directly under the exports line (info only; A disclosed it).
- Doc 061 changes only its status line.
- Doc 062 exists with all TEMPLATE sections and the status line `Round 70 — D-29z35; C-ის შემოწმებას ელოდება`.

**Bans and hygiene:**
- In the owned files: no new `addEventListener`, timer, `ResizeObserver` or rAF.
- No `any`, assertions, `@ts-ignore`, comments or colour literals.
- The tests have no `.skip`, `.only`, `.todo`, `retry`, `setConfig` or per-`it` numeric timeout. There is one `describe` with `{ timeout: 15_000 }`. The tests import no frozen test file.
- EOL: all 8 files have CR 0 (LF only).

## 3. R70-U — unit and mutation: PASS (`mut/mutations.txt`)

**Setup:** my own scratch tree `c-round-70/scratch` (a copy of `app/` plus a `node_modules` junction and my own vitest config). The run covers the 2 new files plus `tempo.test.ts`, `tempo-ui.test.tsx` and `render-budget.test.tsx` (43 tests).
- Unmutated baseline: 43/43.
- After the mutations, `diff -rq scratch/app store/app` showed the two trees identical.

| # | Mutation (my own edit) | Result: failing tests |
|---|---|---|
| red | the 3 sources replaced by the round-70 snapshots | **11 fail:** BW2–BW6, BU2–BU7 (BW1/BU1/BU8 are guards that stay green, as designed) |
| a | `rulerWindow = undefined` at function entry | BW2–BW6, BU2–BU7 ✔ (needs BW2, BU2) |
| b | `windowBar = 0` and no break (full list built, then filtered) | BW5 ✔ |
| c | `firstBar = max(0, windowBar)` (not aligned to `barStep`) | BW2, BW4 ✔ |
| d | `toPx` exclusive | BW2, BW3 ✔ |
| e | page uses `Math.round` | BU4 ✔ |
| f | `fromPx = page·vp` (no left margin) | BU3–BU7 ✔ |
| g | `useState` bump on every scroll notification (re-renders the row) | BU4 ✔ |
| g2 | g plus the strip `memo` removed | BU4 ✔ |
| h | unmeasured viewport → window `{1, 0}` (= `[]`) | BU1 ✔ (plus frozen U2, U4, U8, U11) |
| i | page from the DOM scroller's `scrollLeft` instead of `getTimelineView()` | BU5 ✔ |
| j | vp cached in a ref on first read | BU6 ✔ |
| k | label fit against `rulerWindow.toPx` | BW2, BW3, BU6 ✔ |

**C extras (info only):**

| # | Mutation | Result |
|---|---|---|
| l | 2-page margin on each side | killed (BU2–BU7). The count bound itself would still hold |
| m | unsubscribe replaced by a no-op | **survives**: no test unmounts and then notifies (same as A) |
| n | no `Math.max(0, …)` on `scrollLeft` | **survives**: no test uses a negative `scrollLeft` (same as A) |
| o | early `break` past `toPx` removed | **survives**: BW5's window sits near the end of the ruler (1e8 of 1.152e8 px), so the "stop after the last bar" half of the cost rule is not pinned |
| p | reversed-window guard removed | survives, but it is **equivalent**: the px filter already yields `[]` |
| q | `hasTempo` removed from the `getKey` deps | killed (BU2–BU7) |

**Durations** (the 2 new files alone, 3 runs; `gates/alone-durations.txt`):
- 14/14 each time; durations 5.99 s, 6.44 s and 5.49 s.
- BW2 took 17, 16 and 16 ms (limit < 2 s).
- BW5 took 5, 6 and 4 ms. Its < 100 ms assertion was stable over all 3 runs.

## 4. G70-1 — gates: PASS

- `npx tsc --noEmit`: rc 0, empty output.
- Biome read-only on `./app`: **4 errors / 218 warnings / 1 info**, equal to the baseline.
- Biome on the 5 owned code/test files: rc 0, "No fixes applied".
- `npm run verify`, **attempt 1: rc 0** (`gates/verify-1.txt`). Vitest inside it: **99 files / 1683 tests, 0 failures**; the build passed.

## 5. §4.6 — browser rows (REAL-mouse/keyboard via PW; fresh `/studio-lab`)

**BD fixture**, built in every BD run:
- REAL library drag of `Middle East` onto the music lane at 1 s, giving a 133 s timeline (ruler 5320 px at 40 px/s).
- BPM `999` typed into the field, then REAL `=` until the zoom stops changing at **320 px/s** (ruler 42 560 px).

**Expected visible set:**
- Computed in-page from the formula, independent of the app: `beatPx = 60/bpm·pps`; `barStep` doubles while `4·barStep·beatPx < 40`; for each k, `k·beatPx` must lie in `[scrollLeft, scrollLeft + clientWidth − 224]` and `k·beatPx + 1 ≤ rulerWidth`; kind is `bar` when `k % 4 === 0`.
- Compared with `data-time` at 6 decimals, kind and the bar label.
- I read only after the scroll position had stayed the same for 2 rAFs, plus 1 more rAF.

**Page sharing:**
- P-count (BR-COUNT, BR-SCROLL, BR-LOOK BD shots) per viewport.
- P-zoom, P-follow and P-resize at 1440.
- P-b90 (BR-90, BR-LOOK 90 shot, TR-RULER-REG) per viewport.
- P-fast (info) per viewport.

| ID | Result | Evidence |
|---|---|---|
| **BR-COUNT** 1440×900 | **PASS** | `runs/g70-1440x900-count.txt`. vp 918. At scroll 0 / middle 20 821 / end 41 632: DOM marks **96 / 143 / 113** (round 66: 2215). Expected visible 48 / 48 / 47; **0 missing**; 0 bad labels |
| **BR-COUNT** 1280×720 | **PASS** | `runs/g70-1280x720-count.txt`. vp 758. Marks **79 / 118 / 85**; expected visible 40 / 39 / 39; 0 missing |
| **BR-SCROLL** 1440×900 | **PASS** | 140 REAL horizontal wheel steps of 300 px from 0 to the end. Complete at **every** step. **Max count 144** (≤ 400). The window moved through 46 pages |
| **BR-SCROLL** 1280×720 | **PASS** | 141 steps, complete at every step, max count 119, 56 pages |
| BR-ZOOM (1440) | **PASS** | `runs/g70-1440x900-zoom.txt`. Scrolled to 60 s; REAL `-` down to 0.5 px/s (29 steps), then REAL `=` back to 320 (29 steps). **0 incomplete steps** out of 58. At the minimum zoom the DOM list equals the whole-ruler formula list (15 = 15, `barStep` 512). Timing at the five highest zooms (132.3 → 320): see the note below. **Baseline BD-INFO: 69–107 ms → now ~26 ms** |
| BR-FOLLOW (1440) | **PASS** | `runs/g70-1440x900-follow.txt`. Follow `on`. REAL Alt-click on the ruler at 10 s → `00:10.000`; REAL Space; ~6 s of play; REAL Space stops at `00:15.961` (position stable afterwards). **33 samples** at 200 ms, **0 incomplete**, `scrollLeft` 2900 → 4673, pages 3, 4, 5. Per-rAF counter: **395 frames, 0 incomplete** |
| BR-RESIZE (1440) | **PASS** | BD at max zoom, scroll 19 200 (60 s). PW `setViewportSize`: 1440×900 (vp 918, 143 marks), 1280×720 (vp 758, 118), 1440×900 (vp 918, 143). Complete after each resize, 0 missing |
| BR-90 1440×900 | **PASS** | `runs/g70-1440x900-b90.txt`. 40 px/s: bar `2` at 106.667 px, bar `3` at 213.333 px; 0 labelled beats; DOM list = whole-ruler formula list (45 = 45). Window inequality 2·vp = 1836 ≥ ruler 1200 |
| BR-90 1280×720 | **PASS** | Same values; 2·vp = 1516 ≥ 1200; 45 = 45 |
| **BR-LOOK** 1440×900 | **PASS** | `shots/br-look-1440x900-bd-{start,middle,end}.png` and `-90bpm-40pps.png`. Bar numbers with beat ticks (e.g. 272–283 in the middle), no gap at either edge. The 90 BPM strip matches round 65 `c-round-65/shots/tb-set90-1440x900.png`; the only difference is the metronome button, which round 66 added. Page `scrollWidth` = viewport width (no horizontal overflow); chrome 64 px; strip 20 px |
| **BR-LOOK** 1280×720 | **PASS** | Same shot set at 1280: labels and ticks render; page `scrollWidth` 1280; chrome 64 px; strip 20 px |

**BR-ZOOM timing at the five highest zooms (1440):**
- Poll method, the same as BD-INFO (keypress until the zoom readout changes): 25.8, 22.1, 28.5, 25.7, 29.2 ms, **median 25.8 ms**.
- Long tasks: none (max 0 ms).
- Max frame gap in the 500 ms after each `=`: **16.8 ms** median.
- Both medians are under the 69 ms FAIL line, so the methods agree.

**§0.1 zoom clause in the browser (info probe, `runs/g70-*-probe.txt`):**
- §0.1 says the first committed render after a zoom must already contain every visible mark.
- Method: BD scrolled to 3000 px at 22 px/s, then 12 REAL `=` presses up to 320 px/s with the per-rAF completeness counter running.
- Result: **0 incomplete frames** out of 242 at 1440 and out of 237 at 1280.
- This adds browser evidence to BU5 (where mutation i is killed). BR-ZOOM itself reads after the scroll settles.

**Info probe for R70-T (fast scrolling; not an acceptance row):**
- Method: BD at 320 px/s, 25 REAL wheel events 16 ms apart, with a per-rAF completeness check.
- 1440: 600 px events (0 → 15 000), −600 px (back to 0) and 1500 px (0 → 37 500). That is 79, 79 and 78 frames, **0 incomplete frames**.
- 1280: the same three sweeps, 81 / 81 / 80 frames, 0 incomplete.
- Caveat: headless Chromium wheel scrolling is not smooth-animated. R70-T on a real trackpad stays with the Tech Lead.

**Invalid tries (harness faults, not app behaviour), each replaced by a valid run:**
- `count` try 1: the wheel point used the lane body's left edge, which is off-screen once scrolled.
- `count` try 2: my end check used `scrollWidth − clientWidth`, but the wheel stops 10 px earlier (see INFO-C70-SCROLL-END).
- `b90` try 1: the grid division was still `1 წმ`, so `3` was correctly refused. I added the REAL lane-menu choice of `1/4`, as round 69 did.

## 6. §4.7 — regressions

| ID | Result | Evidence |
|---|---|---|
| TB-REG (1440) | **PASS** | `runs/tb67reg-1440x900-ui_full.txt`: TB-DEFAULT, TB-SET90 (106.66 / 213.33 px, labels 2/3), TB-SECONDS, TB-LAYOUT, TB-UNDO, **TB-120**, TB-INVALID, TB-DECIMAL, TB-ESC, **TB-CLEAR** (hint, 0 marks), TB-KEYS and **TB-ZOOM** (16.4 px/s thinned to 1, 3, 5 …; 97.7 px/s beat labels 1.2, 1.3, 1.4) all PASS. The script's built-in ruler double-click row missed once (91.4 → 77 → 77). That is the known watch item INFO-C66-RU-DBLCLICK-MISS-2, always in this script; the seconds ruler is frozen this round. The RU-REG verdict uses the dedicated script, per §4.7 |
| RU-REG | **PASS** | `runs/ru67reg-1440x900-run{1,2,3}.txt`: **18/18**. Seek `00:03.000`, a drag zooms 91.4 → 77, and a double-click Fits back to 91.4, both without a BPM and at 120 BPM |
| TR-RULER-REG | **PASS** | `runs/g70-*-b90.txt`, both viewports: 90 BPM, `1/4` chosen with a REAL right-click on the lane menu plus a REAL click. The grid goes 0.667 → `3` → 0.444 → `3` → 0.667. The bars strip holds 45 marks before and after, with identical first 4 (`0, 0.666667, 1.333333, 2` at `0, 26.6667, 53.3333, 80 px`). Statically, the round-70 diff does not touch grid code |
| REG-HYD | **PASS** | 0 hydration-like console lines on every load whose script checks it: 14 `g70.cjs` loads (including the invalid tries, the fast probe and the zoom/scroll-end probe) and the TB load. `ru67reg` does not check hydration. The only console errors are the known root `GET /api/cart` CORS errors |

## 7. G70-3 — anonymous workspace and purchase protection: PASS

- **gstack** (fresh state `c-round-70/c-browse.json`, 1440×900):
  - `/studio-lab` opened directly shows the workspace (`arrangement-grid-control`) and the badge `დემო კოლექცია — ავტორიზაცია არ სჭირდება` (`shots/g70-3-studio-lab-1440.png`).
  - From `/`, a REAL click on the header link `Studio Lab Demo` (@e7) lands on `/studio-lab` with the workspace and the badge.
- `/studio/middle-east` shows "Sign in required" and no workspace (`shots/g70-3-studio-middle-east.png`).
- `curl` (`runs/curl-token.txt`): anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; a fake Bearer → **403**.
- **Network:**
  - In every PW run (count ×2, zoom, follow, resize, b90 ×2 + 1 invalid, fast ×2, TB, RU ×3): **0** forbidden requests and **0** requests with an `Authorization` header. Hosts seen: 127.0.0.1:5173, localhost:5199 (`/api/cart`), Google Fonts, GTM, GA.
  - gstack network log: one `czaba-r2-proxy…workers.dev/middle-east/cover.jpg`, from the **homepage** visit. That is the allowed homepage R2 cover image; workspace code made none. `Authorization` count: 0.
- `localStorage` on `/studio-lab` holds only `czaba_session_id` (root cart; INFO-C65-LS-SESSION).

## 8. Ableton (§0.2, §4.9)

| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| Grid/ruler density adapts to zoom | **PASS**: BR-ZOOM and TB-ZOOM show the round-65 thinning unchanged (`barStep` 512 at 0.5 px/s, bars every 2 at 16.4, beats at ≥ 97.7) | **Confirmed** for zoom-adaptive density: Live 12 §6.10 describes a zoom-adaptive editing grid (source re-used from `b-round-46/ableton-6.7-6.10-20261016.txt`; nothing re-fetched). Note: CZABA's exact thinning steps (bars every 2ⁿ, beats only with `barStep === 1`) are its own and were not compared with Live |
| Rendering of ruler marks outside the view | **PASS**: the visible result is identical (BR-COUNT/SCROLL/FOLLOW/RESIZE complete), and the DOM holds a window of ≤ 144 marks | **Not applicable.** This is internal rendering with no visible behaviour. I make no claim that Live does the same |

## 9. Notes for B (none of them blocks)

- **INFO-C70-MUT-O-BREAK** (low, test gap): mutation o survives. Suggestion: a BW5-style window in the middle or start of a 100-hour ruler with the < 100 ms bound.
- **INFO-C70-MUT-M-UNSUB / -N-NEGSCROLL** (low, test gaps): the same as A's extras m/n.
- **INFO-C70-MUT-P-EQUIV** (info): an equivalent mutant; no action.
- **INFO-C66-RU-DBLCLICK-MISS-2** (watch): +1 miss in the TB script; the dedicated script is 18/18.
- **INFO-C70-DOC058-PLACEMENT** (info): the doc 058 sentence is placed one sub-bullet lower than "directly after" the exports line.
- **INFO-C70-SCROLL-END** (info, predates round 70):
  - The scroller's layout maximum is 10 px below `scrollWidth − clientWidth`. Setting `scrollLeft = 1e9` reads back 41 632 (vs 41 642) at 1440 and 41 792 (vs 41 802) at 1280, so this is not a wheel-delivery limit.
  - `offsetWidth − clientWidth` = 10 px, the width of the vertical scrollbar. The last ~10 px of a long ruler never come into view.
  - Round 70 does not touch the scroller or the timeline width, and the 436 frozen files are unchanged, so this predates round 70. For B to triage (`runs/g70-*-probe.txt`).
- **Code-review Lows that A kept** (layout reads on row renders; the non-`memo` row): not measurable here. BU8 and BR-FOLLOW show no work on position frames.
- **Not run (by scope, §4.10):** video sync / C-R27-01, the full find → add → fit video → export flow (no export or audio change this round), the FB-01..FB-16 stage regression, `npm run test:e2e:smoke` (root's) and metronome audio rows.
- **Tech Lead:** R70-T (real-Chrome feel at 999 BPM, max zoom, fast trackpad scroll) remains open; the headless probe above saw 0 incomplete frames. R65-T … R69-T are unchanged.

**Commit readiness:** round 70 can be committed alone (the 8 §3.1 paths). ROOT-R65-M1 can close on this evidence.
