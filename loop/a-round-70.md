# A — Round 70 report: ROOT-R65-M1, a viewport-windowed bars/beats ruler (D-29z35)

Implementer: A (Claude Opus 5.5) · 2026-10-21 · Task: `tasks/round-70` = `current-task.md`. Checkpoint: `a-round-70/checkpoint.md`.

**This report claims no PASS.** `browserVerified` and every C row (R70-S, R70-U, G70-1/2/3, BR-*, TB-REG, RU-REG, TR-RULER-REG, REG-HYD) belong to C. The smoke in §5 is not an acceptance run.

**Resume note:** a previous A session for this round ended with an `api_error` after its baseline step. It had made no store edits; the tree was clean at the start of this session. I re-read everything and re-ran the baseline here.

## 1. Pre-flight, baseline and red run

### Files read in full in this session
- `current-task.md`, `context/active-summary.md`, `.claude/rules/read-primitives.md`
- Primitives: `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `DESIGN_TOKENS`, `TAILWIND_FIRST`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`
- `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`, `skills/pre-flight/SKILL.md`
- Source: `tempo.ts`, `ArrangementTempoRow.tsx`, and the relevant parts of:
  - `StudioWorkspace.tsx`: scroll/resize/view callbacks, wheel, keys, timelineSeconds, TempoRow JSX
  - `ArrangementOverview.tsx`: the subscribe pattern
  - `view.ts`: zoom helpers and keys
  - `tempo-ui.test.tsx` and `render-budget.test.tsx`: the harness

### Pre-flight gate
- **Assumptions:**
  - The window is a px range in scroll space.
  - The render-time window comes from `getTimelineView()` and `getTimelineViewportPx()`.
  - The subscription re-renders the row only when `page:vp` changes.
  - The strip memo on primitives prevents recomputation.
- **Smallest version:** `tempo.ts` +~25 lines, TempoRow +~45, StudioWorkspace +3.
- **Files:** exactly §3.1.
- **Success:**
  - the 5-file vitest run is green;
  - full vitest is 99 files / 1683 tests;
  - tsc 0, build rc 0;
  - Biome on the owned files: 0 diagnostics.

### Baseline (before any edit)
- HEAD `ae4fc3974be258b28d2927ddd0f238f4eb10d736`; `git status --short` empty.
- Frozen list: 0 not OK (436/436).
- Snapshots 5/5 OK; `cmp` 5/5 same.
- Protected files 4/4 OK.
- `node.exe` 9.
- `:5173/studio-lab` 200; `:5199/api/products` 200.

### Red run (new tests written first, source still at baseline)
`a-round-70/red-run.txt` and `red-run-ui-2.txt`.

- **`tempo-window.test.ts`:** BW2–BW6 fail.
  - BW2: 574/756 mismatches.
  - BW5: a 5 994 000-mark list in 2009 ms.
  - BW6: 2215 marks instead of `[]`.
  - BW1 is green, as expected (no-window guard).
- **`tempo-window-ui.test.tsx`:** BU2–BU7 fail.
  - BU2: 2215 marks instead of 127.
  - BU4: call count 2 instead of 3.
  - BU1 and BU8 are green on the baseline. They guard behaviour that must be preserved: the full list when unmeasured, and no work on position frames.
- **Correction during the red phase:** my first UI oracle called `barsRulerMarks(..., window)`. On the baseline that ignores the window, so BU3/5/6/7 passed falsely. I changed the UI oracle to the full list filtered by px, as the spec says. After that, red-run-ui-2 shows 6 failures.
- The frozen `tempo.test.ts` (10), `tempo-ui.test.tsx` (12) and `render-budget.test.tsx` (7) were green on the baseline.

## 2. Diff summary (`a-round-70/source.diff`)

| File | Change | CR / LF |
|---|---|---|
| `app/lib/arrangement/tempo.ts` | Additive: `export interface BarsRulerWindow { fromPx; toPx }` (an interface, to match the file's `BarsRulerMark` style). `barsRulerMarks(seconds, pxPerSecond, bpm, rulerWindow?)`. Invalid window → `[]`. `pushMark` drops marks whose `leftPx` is outside `[fromPx, toPx]`. `firstBar = max(0, (floor(floor(fromPx / barPx) / barStep) − 1) · barStep)`. The loop breaks once a bar's px is past `toPx`. Without a window, `firstBar` is 0 and there is no break, so the path is identical to before. Label fit and `barStep` are unchanged | 0 / 115 |
| `app/components/arrangement/ArrangementTempoRow.tsx` | Three required props: `getTimelineView`, `getTimelineViewportPx`, `subscribeTimelineScroll`. `readBarsRulerPage` returns null if `vp ≤ 0`, otherwise `{ page: floor(max(0, scrollLeft)/vp), vp }`. `rulerPage = parseBarsRulerPageKey(useSyncExternalStore(subscribeTimelineScroll, getBarsRulerPageKey, getServerBarsRulerPageKey))` with the snapshot `"page:vp"` (`''` without a tempo or unmeasured). `getSnapshot` runs during render, so the render after a zoom reads the pending view. The strip `memo` gets `fromPx = (page−1)·vp` and `toPx = (page+2)·vp`, or `null`. Input, metronome button, hint, markup, classes and `data-*` are unchanged | 0 / 257 |
| `app/components/arrangement/StudioWorkspace.tsx` | Exactly three props on `<ArrangementTempoRow>` | 0 / 1966 |
| `app/lib/arrangement/__tests__/tempo-window.test.ts` | New: BW1–BW6 | 0 / 156 |
| `app/lib/arrangement/__tests__/tempo-window-ui.test.tsx` | New: BU1–BU8. Harness helpers are copied, not imported from frozen tests. The devtools-hook render counter is copied from `render-budget` | 0 / 524 |
| `docs/.../062-studio-lab-bars-ruler-window.md` | New, per TEMPLATE. Status `Round 70 — D-29z35; C-ის შემოწმებას ელოდება` | 0 / 109 |
| `docs/.../058-…` | Exactly two edits: the status line, and one sentence after the exports list item | 0 / 142 |
| `docs/.../061-…` | Status line only | 0 / 88 |

- **Listeners and timers:** none added. `useSyncExternalStore` uses the existing channel.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or colours.
- **Tests:** no `.skip`, `.only`, `.todo`, retries or per-`it` timeouts. The new UI file uses one `describe` with `{ timeout: 15_000 }`.

## 3. Tests (alone run: `a-round-70/alone-run.txt`, 14/14)

- The table below is the first green alone run (Duration 3.55 s).
- Re-run on the final tree: 14/14, Duration 5.87 s, BW5 5 ms.

| ID | Result (ms) | Notes |
|---|---|---|
| BW1 | ✓ 10 | T5–T8 inputs plus (133, 320, 999): `toEqual` with `undefined`; length 2215 |
| BW2 | ✓ 12 | 7 × 6 × 3 × 6 = **756** cases; `{count: 0, first: []}` |
| BW3 | ✓ 0 | `[barTwoPx, barTwoPx]` → `[bar 2]`; the window ends and starts on bar 2; past the end → `[]`; negative `fromPx` starts at `{0, bar, '1'}` |
| BW4 | ✓ 0 | 120 BPM, 5 px/s, 600 s, window `[70, 270]` → labels `9, 13, 17, 21, 25`; first mark `{16, bar, '9'}`; no beats |
| BW5 | ✓ 3 | 360 000 s window `[1e8, 1e8 + 3648]`: 180–240 marks, all inside, spacing `60/999` (9 digits), bar every 4th, beat labels null, **elapsed < 100 ms** (3 ms) |
| BW6 | ✓ 0 | NaN, Infinity, reversed → `[]` |
| BU1 | ✓ 218 | `clientWidth` 0 → DOM equals the full 200-mark list (90 BPM, 40 px/s, 133 s) |
| BU2 | ✓ 141 | vp 1216, 999 BPM, 320 px/s, 133 s: DOM = full list filtered to `[−1216, 2432]` = **127**; ≤ 400; visible `[0, 1216]` complete |
| BU3 | ✓ 137 | `scrollLeft` 6090 → `[4864, 8512]` exact; visible complete |
| BU4 | ✓ 123 | 6500 and 7200: call count unchanged, 0 renders of `ArrangementTempoRow` and `ArrangementBarsRulerInner`, DOM unchanged. 7300: +1 call, `[6080, 9728]` exact |
| BU5 | ✓ 78 | Playhead 40 s, `scrollLeft` 1000 (page 0), REAL-path `=` keydown → 50 px/s, `scrollLeft` 1400 (page 1). The first committed DOM is complete for `[1400, 2616]` and equals the page-1 window. No scroll event is fired |
| BU6 | ✓ 100 | Width 1224 plus the stored `ResizeObserver` callback → vp 1000, `[5000, 8000]` exact |
| BU7 | ✓ 96 | 999 windowed → clear (hint, 0 marks, scroll → 0 calls) → 90 BPM at page 6 window exact |
| BU8 | ✓ 114 | 30 position-store frames: 0 calls, 0 `clientWidth` reads (any element), 0 renders, DOM unchanged |

Suite totals:
- The 5-file run (two new files plus `tempo.test.ts`, `tempo-ui.test.tsx`, `render-budget.test.tsx`) is 43/43 (`green-5files.txt`; re-run on the final tree: 43/43).
- Full suite: **99 files / 1683 tests, 0 failures** (`vitest-full.txt`).

## 4. Mutations (`a-round-70/mutations.txt`; script `mut.mjs`; scratch `a-round-70/scratch` with a `node_modules` junction and its own config)

These are final-tree results. Scratch was restored after each mutation; `diff -rq scratch/app store/app` is identical.

| # | Mutation | Killed by |
|---|---|---|
| red | round-70 snapshots of the 3 sources | BW2–BW6, BU2–BU7 (11) |
| a | window ignored | BW2, BW3, BW4, BW5, BW6, BU2–BU7 |
| b | full list, then `.filter` | BW5 |
| c | first bar `floor(fromPx/barPx)`, not aligned | BW2, BW4 |
| d | `toPx` exclusive | BW2, BW3 |
| e | page uses `Math.round` | BU4 |
| f | no left margin | BU3, BU4, BU5, BU6, BU7 |
| g | every scroll notification re-renders the row | BU4 |
| g2 | g plus strip `memo` removed | BU4 |
| h | unmeasured → `[]` | BU1 (plus frozen U2, U4, U8, U11) |
| i | `scroller.scrollLeft` (DOM) instead of `getTimelineView()` | BU5 |
| j | vp cached at mount | BU6 |
| k | label fit uses the window width | BW2, BW3, BU6 |
| l (C extra) | 2-page margin | BU2–BU7 (the count bound itself would still hold) |
| m (C extra) | unsubscribe replaced by a no-op | **survives**: no test unmounts and re-notifies (test gap) |
| n (C extra) | no `Math.max(0, scrollLeft)` | **survives**: no test sets a negative `scrollLeft` (test gap) |

The same table held on all three trees:
- pre-review: effect + ref (`mut-all-pre-review.log`);
- after review 1: `useSyncExternalStore` + a second read (`mut-all-pass2.log`);
- final, after review 2: the window parsed from the snapshot key (`mut-all.log`). Its failing test names are identical to pass 2; only the order differs.

g/g2/m were re-anchored for the final structure. In g, the snapshot appends a notification counter to the key.

**Process note:** my first re-run after review 1 crashed with a syntax error in `mut.mjs` before writing a log. I noticed, fixed the script and re-ran.

## 5. Browser smoke (A, not a PASS claim; `a-round-70/smoke-1440.txt`, `smoke-1440.png`)

### Attempt 1: invalid (ENV-BROWSE-DAEMON)
- The gstack CLI daemon failed again and again (`Server failed to start within 15 s`).
- My background chain kept spawning `server-node.mjs` daemons. I traced my own bash chain (PID 29436, started 15:59:51 by my agent process 2476) and ended it.
- I also ended the five `server-node.mjs` processes my CLI calls had launched after 15:59:51, with their `bun terminal-agent` children: 3940, 17612, 32524, 13936, 32416. Their parent CLIs had exited, and the state file was mine.
- I killed nothing else and ran no `$B restart`.

### Attempt 2: approved fallback
- `server-node.mjs`, `BROWSE_PARENT_PID=0`, state `tmp/studio-real-loop/a-browse.json` (orchestrator path), log `a-round-70/daemon.log`, PID 10820.
- Fresh `/studio-lab` at 1440×900 → 200. Waited for the grid control selector, then 4 s.
- REAL click on the BPM field, typed `999`, Enter (focus → BODY).
- At 40 px/s: 16 marks, ruler 1200 px.
- After 11 REAL `=`: **320 px/s**, ruler 9600 px, scroller `clientWidth` 1142 (vp 918), **96 marks in the DOM**. The whole-ruler list would be about 500. `[−918, 1836]` → last mark 5.705706 s.
- In-page formula check of the visible set (k·60/999, kind bar when k%4 = 0):

  | Position | scrollLeft | Visible marks expected | Missing | DOM marks |
  |---|---|---|---|---|
  | start | 0 | 48 | **0** | 96 |
  | middle | 4341 | 48 | **0** | 143 |
  | end | 8672 | 47 | **0** | 117 |

- The screenshot shows bar labels 114–125 and beat ticks at the end of the timeline.
- Forbidden requests (`studio-token|recording-|/api/download|r2.cloudflarestorage|r2.dev|r2-proxy|workers.dev`): **0**.
- Console errors: only the known root `GET /api/cart` CORS errors. Hydration messages: 0.
- **Cleanup:**
  - `browse stop` printed "Unable to connect".
  - PID 10820 is gone and the state file was removed.
- The 30 s empty demo was used, not the BD fixture (Middle East, 133 s). That is C's.

### Attempt 3: final tree, after review 2 (`smoke-1440-final.txt`, `smoke-1440-final.png`)
- Own fallback `server-node.mjs`, PID 22628, the same state path, log `daemon-2.log`.
- Same steps → 320 px/წმ.
- Marks at start / middle / end: 96 / 143 / 117, with **0 missing**. Expected visible: 48 / 48 / 47.
- Forbidden requests: 0. Hydration messages: 0.
- One console error line without "cart" in its text. It is the `net::ERR_FAILED` of the same root `/api/cart` preflight, as in attempt 2.
- `browse stop`; PID 22628 is gone and the state file was removed.

## 6. Code review (real `code-reviewer` subagent: 8.5/10, `COMMIT: OK`, no Critical/High/Medium)

| # | Finding | Disposition |
|---|---|---|
| 1 Low | A ref was written during render (a concurrent-render stale-key risk; not reachable today) | **Fixed:** replaced with `useSyncExternalStore` (the reviewer's alternative). It removed the ref, the version state and the effect. Re-ran tsc, Biome, the 5 files, full vitest, build, verify and all mutations |
| 2 Low | `clientWidth`/`scrollLeft` are read on every row render while a tempo is set | Kept. Not on position frames (BU8). Switching to `viewportWidthRef` would mean changing `StudioWorkspace` beyond the one allowed edit. Noted in doc 062 TODO |
| 3 Low | BW1's `toEqual(..., undefined)` cannot fail | Kept as spec'd (§2.2 BW1). The frozen T5–T8 pin the no-window output |
| 4 Low | The devtools-hook fiber walk is brittle | Kept. Without it mutation g survives, because the strip memo hides re-renders from the call count. `<Profiler>` cannot wrap a row rendered inside `StudioWorkspace`. Same harness as the frozen `render-budget` |
| 5 Low | Hard-coded 127 and 1400 | Kept. 127 is B's oracle value. The 1400/page-1 check stops BU5 from becoming vacuous (mutation i) |
| 6 Low | BW5 has a wall-clock bound | Kept as spec'd (< 100 ms); measured 3–4 ms |
| 7 Info | A future restored tempo would render the full list once on the first paint | Noted in doc 062 |

### Second pass: the real `code-reviewer` on the final `useSyncExternalStore` file (8/10, `COMMIT: OK`, no Critical/High/Medium)

The first pass reviewed the effect/ref version, which no longer exists, so I ran a second pass scoped to the final `ArrangementTempoRow.tsx` and the diff.

| # | Finding | Disposition |
|---|---|---|
| Q1 Low | The discarded `useSyncExternalStore` value plus a second live `readBarsRulerPage` read. They cannot disagree in a client render. During hydration, however, the hook returns `''` while the second read is live. That is safe today only because `tempoBpm` starts null | **Fixed:** the window is now parsed from the returned key (`parseBarsRulerPageKey`) and the second read is gone. That makes hydration consistent by construction and halves the layout reads. Re-ran tsc, Biome, 5 files 43/43, full vitest 99/1683, build, verify rc 0, all mutations and the browser smoke |
| Q2 | Hydration path correct | — |
| Q3 | The dev double `getSnapshot` cannot differ (synchronous; strings); no loop | — |
| Q4 | No re-subscribe churn (`subscribeTimelineScroll` is stable); no missed update on a `hasTempo` change | — |
| Low | Layout reads during render of a non-memo row on every workspace render; suggests `memo` on the row | Kept. Not on position frames (BU8). Wrapping the row in `memo` is a behaviour/perf change outside §0.3's allowed edit list; recorded for B |
| Info | `''` means both "no tempo" and "unmeasured"; both correctly mean no window | — |

The second-pass reviewer did not review the test bodies; the first pass did.

**Architecture note (for B, not acted on):**
- `ArrangementTempoRow` gained state and a lifecycle (signal 4). It is the second consumer of the `getTimelineView` / `getTimelineViewportPx` / `subscribeTimelineScroll` trio, after `ArrangementOverview` (signal 2).
- Reviewer verdict: **keep for now**.
- Proposal if a third consumer appears: a bounded `useTimelinePageKey` hook on `useSyncExternalStore`, accepted when BU1–BU8 and the Overview tests pass unchanged. This could join ARCH-CHECKPOINT-SRW14-PREFS (a)/(c).
- **Second pass, signal 2:** the same three getters and the subscribe function are now passed to three consumers (`StudioWorkspace.tsx` ~1672–1674, 1797, 1813–1815).
  - Verdict: **keep**.
  - Proposal if a fourth consumer appears: one `TimelineViewportSource` object prop. Acceptance: stable subscribe identity, pending-view behaviour unchanged, BU1–BU8 green.

## 7. Command tails (verbatim, final tree; files under `a-round-70/`)

```
$ git rev-parse HEAD
ae4fc3974be258b28d2927ddd0f238f4eb10d736
$ git status --short
 M app/components/arrangement/ArrangementTempoRow.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/lib/arrangement/tempo.ts
 M docs/implementation/2026/quarter-IV/058-studio-lab-tempo-bars-ruler.md
 M docs/implementation/2026/quarter-IV/061-studio-lab-grid-triplets.md
?? app/lib/arrangement/__tests__/tempo-window-ui.test.tsx
?? app/lib/arrangement/__tests__/tempo-window.test.ts
?? docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md
$ sha256sum -c ../tmp/studio-real-loop/b-round-69-r70-tree-sha256.txt | grep -vc ': OK$'
0
$ node -e "...protected-baseline.json..."
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ npx tsc --noEmit        (tsc.txt, 0 bytes)
tsc rc 0
$ npx vitest run          (vitest-full.txt)
 Test Files  99 passed (99)
      Tests  1683 passed (1683)
   Duration  71.36s (transform 7.31s, setup 0ms, import 47.29s, tests 88.14s, environment 115.27s)
$ npm run build           (build.txt)
build/server/index.js                    1,395.51 kB
✓ built in 3.07s
build rc 0
$ npx biome check ./app   (biome-app.txt)
Checked 377 files in 403ms. No fixes applied.
Found 4 errors.
Found 218 warnings.
Found 1 info.
$ npx biome check <tempo.ts ArrangementTempoRow.tsx StudioWorkspace.tsx tempo-window.test.ts tempo-window-ui.test.tsx>   (biome-owned.txt)
Checked 5 files in 43ms. No fixes applied.
biome owned rc 0
$ npm run verify          (verify.txt; one quiet attempt, no PW probe in parallel)
build/server/.vite/manifest.json             0.57 kB
build/server/assets/studio-DTQ5s2Tn.css      1.35 kB
build/server/assets/app-Bo8OcdZs.css       197.67 kB
build/server/index.js                    1,395.51 kB
✓ built in 3.30s
verify rc 0
 Test Files  99 passed (99)        (inside verify)
      Tests  1683 passed (1683)
$ tasklist | grep -ci node.exe
9 (start) · 10 (before verify) · 11 (smoke start) · 10 (after smoke stop / end)
$ curl :5173/studio-lab ; curl :5199/api/products   (end)
200 200
```

## 8. Deviations and known gaps

- **`BarsRulerWindow` is an `interface`, not a `type` alias.** It has the same shape and matches the file's `BarsRulerMark` style.
- **The update mechanism changed after review:** effect, ref and counter became `useSyncExternalStore`. Its behaviour satisfies §0.1:
  - render-time window from `getTimelineView()`;
  - re-render only on a `page`/`vp` change;
  - no new listeners.
- **BU2 zooms with `setPxPerSecond(320)`,** as the frozen `tempo-ui` harness does. BU5 covers the real keyboard zoom path.
- **C's extras m and n survive.** They are recorded as test gaps, not fixed (outside a–k).
- **Doc 058 placement:** the new sentence is a sub-bullet placed after the whole `tempo.ts` list item: after "exports" and then "constants and UI texts". It is not between those two sub-bullets. It is still exactly one added line, two hunks in total.
- **Update mechanism.** It went through three versions:
  1. effect + ref;
  2. `useSyncExternalStore` with a second read (after review 1);
  3. `useSyncExternalStore` with the window parsed from the snapshot key (after review 2).

  Gates, mutations and the smoke were re-run on version 3.
- **Smoke:**
  - The first gstack attempt was invalid (ENV-BROWSE-DAEMON) and I cleaned up only my own processes.
  - The smoke used the empty 30 s demo, not the BD fixture.
- **Not done by A:** every §4.6/§4.7 browser row (BR-COUNT*, BR-SCROLL*, BR-ZOOM timing, BR-FOLLOW, BR-RESIZE, BR-90, BR-LOOK*), TB-REG, RU-REG, TR-RULER-REG, REG-HYD, G70-3, the Ableton verdicts and R70-T.

## Scope completed and acceptance (A side only)

**Done:**
- §0.1 / §0.3 source.
- §2.2 tests BW1–BW6 and BU1–BU8 (red → green).
- §2.3 mutations a–k all killed.
- §2.4 gates: tsc, vitest 99/1683, build, Biome, verify, the real reviewer, the smoke.
- §2.5 docs 062, 058 (two edits) and 061 (status line).
- The tree matches §3.1 exactly.

**Not marked:** the C acceptance rows. `browserVerified` stays with C. ROOT-R65-M1 closes only on C evidence.

## Next C checks (exact)

1. G70-2: HEAD `ae4fc39`, the 8 status lines, frozen 436/436, protected 4/4.
2. R70-S:
   - `diff -u` against `b-round-69-r70-snapshots`. Note that `ArrangementTempoRow` now uses `useSyncExternalStore` plus the `getServerBarsRulerPageKey` helper; it has no effect or ref.
   - Banned patterns; LF only.
3. R70-U:
   - red run on the snapshots;
   - mutations a–k in C's own scratch. g in this design means "the snapshot changes on every notification"; `mut.mjs` shows one way to write it;
   - extras l/m/n;
   - BW5 timing three times.
4. G70-1: tsc, Biome, vitest 99/1683, verify.
5. §4.6 BD fixture (Middle East, 999 BPM, max zoom) at 1440×900 and 1280×720:
   - BR-COUNT/BR-SCROLL: ≤ 400 and complete at every step;
   - BR-ZOOM: median of the five highest zoom steps < 69 ms;
   - BR-FOLLOW: page changes during playback;
   - BR-RESIZE, BR-90, BR-LOOK.
6. §4.7: TB-REG, RU-REG, TR-RULER-REG, REG-HYD. Then G70-3 (purchase protection, 401/403, forbidden hosts).
7. Expect ENV-BROWSE-DAEMON. The CLI daemon failed on its first attempt again today; use the `server-node.mjs` fallback right away.
