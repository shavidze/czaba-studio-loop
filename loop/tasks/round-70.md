# CURRENT TASK — Round 70: ROOT-R65-M1 (SRW-15 perf) — viewport-windowed bars/beats ruler (D-29z35)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-21
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15; Loop v2 2026-10-19.
- **Decision record:** **D-29z35** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-69.md`. Previous task: `tasks/round-69.md` (an exact copy).
- **Round size:** one Medium bug (ROOT-R65-M1-BEAT-DENSITY), one owner (A), plus two one-line doc status fixes. The second perf Medium (ROOT-R66-M1, metronome horizon) is a different subsystem and is **round 71**, not this round (b-round-69.md §4).
- **Why now:**
  - C round 69 = **PASS**, `browserVerified: true`, no bugs (`c-round-69.md`, `c-round-69.json`). Root published it as **`ae4fc39`** on both remotes (`gates/gate-round-69.json`: `published`). SRW-14 (FB-13) stages 1–5 are all C-verified.
  - No C bug is open. The two reviewer perf Mediums were queued for "after stage 5b" (b-round-68.md §6), and an open Medium blocks COMPLETE. ROOT-R65-M1 goes first because it has a **measured** cost (C round 66 BD-INFO: 2215 marks, 69–107 ms per zoom step at 999 BPM on the 133 s timeline); ROOT-R66-M1 measured no cost at 5 s (MT-SCRUB-INFO).

> **Servers.** B check (2026-10-21 ~14:00 +04): `/studio-lab` **200**, `:5199/api/products` **200**, `node.exe` 8. Check both at the start of A and of C and record the result. Agents never start or stop servers.
> - **If `:5173` is down:** every browser item is "not run (environment)", `browserVerified: false`, and no browser row may be marked PASS.
> - **If only the backend is down:** run everything except G70-3's token rows, which are "not run (environment)".
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder. After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`; record its PID and log, stop only your own process.
> - **GSTACK-NO-MOUSE:** drags, held presses and wheel use standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and typing use gstack (REAL) or PW.
> - **ENV-EXT-LOAD-HANG:** wait for `domcontentloaded`, then the workspace selector, then 4 s, and record it.
> - **INFO-R62-GEPLAY-UNDO:** record the Undo title before every Ctrl+Z.
> - **INFO-C65-HARNESS-R2-REGEX:** the forbidden-host filter matches `r2-proxy` and `workers.dev` in **every** page script, including regression scripts.
> - **INFO-C69-METER-POST-ACCENT (new, from round 70):** metronome timing rows use the ≥3 dB rise to ≥ −15 dB detector with 0.25 s refractory (C round 69 try 3), or a single onset. Not needed this round unless a metronome row is added.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run. Scratch junctions: `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Never `npx <pkg>` for a package not in `node_modules`; for TS scratch scripts use `node --experimental-strip-types`.

## Why this round

**Round 69 result: PASS** (`c-round-69.md`). C ran every row, the starred ones at both viewports: G69-1/2/3, R69-S, R69-U (mutations a–k and extras l–t all killed), TR-NOBPM, TR-TOGGLE*, TR-MENU*, TR-DRAG, TR-NUDGE, TR-KEYS, TR-SELECT, TR-BRACE, TR-TEMPO, TR-PLAY* (real audio onset 4.450 / 4.461 on the 4.444 line), TR-RULER, TR-UNDO, TR-LAYOUT*, GM-REG, GK-REG, MENU-REG, REG-HYD. **SRW-14 stage 5b is closed; SRW-14 is C-verified in full** and waits only for the Tech Lead feel checks R67-T/R68-T/R69-T.

The root reviewer (`gates/round-69/review.md`, 9/10, `COMMIT: OK`) gave five Lows and an Architecture note. B's dispositions:

| # | Finding | Disposition |
|---|---|---|
| 1 | The triplet item is clickable when it can only refuse | Lows batch (ROOT-R69-L1). The status line **is** `aria-live="polite"` (`StudioWorkspace.tsx` `<output aria-live="polite" data-testid="arrangement-status">`), so the refusal is announced; `aria-disabled` is a product question for R69-T |
| 2 | `3` not in the select's title | Lows batch (ROOT-R69-L2; test-locked string TR6/TU3) |
| 3 | Two optional props should be one object | Lows batch (ROOT-R69-L3) |
| 4 | Narrower return types | Lows batch (ROOT-R69-L4) |
| 5 | Doc 061 status line is stale | **This round**, §2.5, one line |
| Arch | `useGridPreferences` and a shared harness | Signals, merged into ARCH-CHECKPOINT-SRW14-PREFS (a) and (c); not scheduled |

**The defect (ROOT-R65-M1, `loop-v2/gates/round-65/review.md` #1; `plan.md` D-29z30 R2).** `barsRulerMarks` returns one mark per bar and per beat over the **whole** timeline, and `ArrangementBarsRuler` renders one absolute `div` per mark. The count is `seconds × bpm / 60` (beats) once beats are shown; it grows with project length and tempo, not with what is on screen. The reviewer's 16 px floor does not bound it: at 999 BPM and 320 px/s a beat is 19.2 px apart, above the floor, and `barStep === 1` already guarantees ≥ 10 px. C measured 2215 marks and 69–107 ms per zoom step on the 133 s demo timeline (c-round-66.md BD-INFO); a 10-minute project would be ~10 000 marks. **Fix: render only the marks inside a window around the visible viewport**, the length-independent bound that `plan.md` D-29z30 R2 already named.

## Baseline

Measured by B on 2026-10-21 ~14:00 +04:
- **HEAD `ae4fc3974be258b28d2927ddd0f238f4eb10d736`** (round 69, published on both remotes; `gates/gate-round-69.json`). `git status --short` is **empty**.
- **Valid start:** exactly that state. If root has committed something newer that changes none of the owned or frozen files, record it and continue. Anything else (a dirty tree, a frozen or snapshot mismatch) means: stop and report.
- **Frozen list:** `../tmp/studio-real-loop/b-round-69-r70-tree-sha256.txt`, **436** entries, 436/436 OK (run from `store/`). It covers every tracked `app/**` and `docs/implementation/**` file except the 5 existing owned files below. `tempo.test.ts`, `tempo-ui.test.tsx`, `render-budget.test.tsx`, `view.ts`, `ArrangementOverview.tsx`, `ArrangementRuler.tsx` and every grid/metronome file are **frozen**.
- **Snapshots:** `../tmp/studio-real-loop/b-round-69-r70-snapshots/` with `SHA256SUMS.txt`:

  | File | sha256 prefix | EOL (CR / LF) |
  |---|---|---|
  | `app/lib/arrangement/tempo.ts` | `6a0b0fef` | 0 / 87 |
  | `app/components/arrangement/ArrangementTempoRow.tsx` | `adb6483d` | 0 / 185 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `7671c7de` | 0 / 1963 |
  | `docs/implementation/2026/quarter-IV/058-studio-lab-tempo-bars-ruler.md` | `8a5f68d4` | 0 / 141 |
  | `docs/implementation/2026/quarter-IV/061-studio-lab-grid-triplets.md` | `05b42970` | 0 / 88 |

- **Protected files:** 4/4 OK (B re-checked).
- **Biome `./app` (read-only):** **4 errors / 218 warnings / 1 info** (baseline CRLF list: `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`); `b-round-69/biome-baseline.txt`.
- **Vitest baseline:** **97 files / 1669** (root gate `gates/round-69/verify.log`).
- **Line endings:** every owned file is LF. Count CR with node. Never run `biome check --write`, `format --write` or `npm run format`.

**Rules:** do not revert, re-create or reformat anything; the work of rounds 47–69 stays. `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root. Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z35: viewport-windowed bars/beats ruler

**Sources:** reviewer finding ROOT-R65-M1 (Medium, perf); C round 66 BD-INFO (measurement); `plan.md` D-29z30 R2 ("the real fix is viewport culling"). User scope: FB-09/FB-11 (SRW-15 bars/beats ruler, D-10 grid only). **The visible ruler does not change**: the same marks, at the same positions, with the same labels, kinds, classes and `data-*` attributes wherever the user can see them.

**Pure function** (`tempo.ts`, additive):
- New exported type `BarsRulerWindow = { fromPx: number; toPx: number }`.
- `barsRulerMarks(seconds, pxPerSecond, bpm, window?: BarsRulerWindow)`:
  - **without `window`**: byte-identical to today for every input (frozen T1–T8 stay green unchanged);
  - **with `window`**: returns **exactly** `barsRulerMarks(seconds, pxPerSecond, bpm).filter((m) => m.time * pxPerSecond >= fromPx && m.time * pxPerSecond <= toPx)` — same objects by value, same order, same labels (the label-fit rule still uses the **whole** ruler width), same bar thinning (`barStep` still depends only on `pxPerSecond` and `bpm`, and thinned bars stay multiples of `barStep` counted from bar 0);
  - **cost:** with `window`, the loop must start at the first bar whose marks can fall inside the window and stop after the last one. It must **never** build the full list (BW5 proves it on a 100-hour timeline);
  - **invalid window** (`fromPx` or `toPx` not finite, or `toPx < fromPx`): returns `[]`. No new `NaN` path.

**Window rule** (`ArrangementTempoRow.tsx`):
- `vp = getTimelineViewportPx()` (the timeline viewport without the 224 px header; the same callback `ArrangementOverview` uses). If `vp <= 0` (not measured yet: SSR, first paint, jsdom) → **no window** (today's full list).
- Otherwise `page = Math.floor(Math.max(0, view.scrollLeft) / vp)` with `view = getTimelineView()`, and the window is `{ fromPx: (page − 1) × vp, toPx: (page + 2) × vp }`. The visible range `[scrollLeft, scrollLeft + vp]` is always inside it, with one viewport of margin on each side.
- **Updates:**
  - subscribe with `subscribeTimelineScroll` (scroll, Follow auto-scroll and resize already notify it — `StudioWorkspace` `handleTimelineScroll` and the `ResizeObserver`); on a notification, recompute `(page, vp)` and re-render the strip **only if one of them changed**. Scrolling inside a page renders nothing;
  - a change of `pxPerSecond`, `bpm` or `seconds` re-renders as today; the window used in that render must come from `getTimelineView()` at that moment (during a zoom it returns the pending view), so the first committed render after a zoom already contains every visible mark.
- `ArrangementBarsRuler` stays `memo` and receives primitives (`fromPx`/`toPx` numbers or `null`), so a parent render with the same page does not recompute the marks.
- **No** new window/document listener, timer or `ResizeObserver`; **no** layout read on playhead position frames (the frozen `render-budget` test checks `clientWidth` reads per frame); no change to the hint, classes or the seconds ruler.

**`StudioWorkspace.tsx`: one edit only** — pass the existing `getTimelineView`, `getTimelineViewportPx` and `subscribeTimelineScroll` callbacks (all `[]`-stable) to `<ArrangementTempoRow>`. Nothing else changes in that file.

**Worked oracle** (B, from the formulas, with the jsdom stub vp = 1216, i.e. scroller `clientWidth` 1440 − 224; in the browser vp is whatever C reads, about 900–950 px at 1440×900 with the library open; A's BW tests are the authority):

| Input | Full list | Window | Windowed |
|---|---|---|---|
| 999 BPM, 320 px/s, 133 s (C's BD fixture) | 2215 marks (`133 × 999 / 60` beats incl. bars) | vp 1216, page 0 → [−1216, 2432] | marks with `time × 320 ≤ 2432` → `floor(2432 / 19.219…) + 1` = **127** |
| same, `scrollLeft` 20 000 | 2215 | page 16 → [18 240, 21 888] | ≈ 190 marks (3 × 1216 / 19.22) |
| 120 BPM, 40 px/s, 10 s (frozen T6) | 20 marks | page 0, vp 1216 | **20** (whole ruler inside the window: identical to today) |

C's hard bound: **DOM mark count ≤ 400** at 1440×900 and at 1280×720 on the BD fixture at any scroll position (3 viewports ÷ 19.2 px + bars ≈ 240 at most).

**Rejected:**
- **A beat-density floor (reviewer's fix).** It does not bound the measured case (19.2 px > 16 px) and the count still grows with length.
- **Beats as a CSS gradient.** It removes the `data-kind="beat"` marks that the frozen `tempo-ui` tests and C's TB/TR-RULER harnesses read, and labelled beats still need nodes.
- **Scroll state in `StudioWorkspace`.** It would re-render the whole workspace per scroll; the existing `subscribeTimelineScroll` channel keeps the update local (ARCH (a) signal not worsened).

### 0.2 Ableton (workflow addendum 2026-10-11)

**Source:** Live 12 Reference Manual §6.10 "Using the Editing Grid", captured with gstack `/browse` on 2026-10-16 (`b-round-46/ableton-6.7-6.10-20261016.txt`), re-used; nothing re-fetched; no video, no Live installation.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| The grid/ruler density adapts to zoom | §6.10 ("zoom-adaptive" grid) | **confirmed** for the editing grid | CZABA's bars ruler keeps its round-65 thinning rules unchanged (bars every 2ⁿ, beats only with `barStep === 1`) | BR-ZOOM |
| How Live renders ruler marks outside the view | — | **not applicable** (internal rendering; no visible behaviour) | CZABA renders a window of 3 viewports; the visible result is identical | BR-COUNT*, BR-SCROLL* |

No report may claim "Ableton does the same" for the rendering technique.

### 0.3 Source

| File | Change |
|---|---|
| `app/lib/arrangement/tempo.ts` | **Additive.** `BarsRulerWindow` type; the optional 4th parameter of `barsRulerMarks` per §0.1. Every other export unchanged |
| `app/components/arrangement/ArrangementTempoRow.tsx` | Three new required props (`getTimelineView: () => TimelineView`, `getTimelineViewportPx: () => number`, `subscribeTimelineScroll: (listener: () => void) => () => void`, the types used by `ArrangementOverview`); the window rule and subscription of §0.1; `ArrangementBarsRuler` gets `fromPx`/`toPx` (`number \| null`). The tempo input, metronome button, hint, mark markup, classes and `data-*` attributes unchanged |
| `app/components/arrangement/StudioWorkspace.tsx` | **One edit:** the three props on `<ArrangementTempoRow>` |
| `app/lib/arrangement/__tests__/tempo-window.test.ts` | **new**, §2.2 |
| `app/lib/arrangement/__tests__/tempo-window-ui.test.tsx` | **new**, §2.2. Copy only the harness helpers you need from `tempo-ui.test.tsx`; do not import from frozen tests (ARCH (c) signal, accepted) |
| `docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md` | **new**, §2.5 |
| `docs/implementation/2026/quarter-IV/058-studio-lab-tempo-bars-ruler.md` | **two edits only**, §2.5 |
| `docs/implementation/2026/quarter-IV/061-studio-lab-grid-triplets.md` | **status line only**, §2.5 |

- **Frozen:** everything else, including `view.ts`, `ArrangementOverview.tsx`, `ArrangementRuler.tsx`, `ArrangementContext.tsx`, `metronome.ts`, `grid*.ts`, every existing test file (`tempo.test.ts`, `tempo-ui.test.tsx`, `render-budget.test.tsx`, `metronome*.test.*` …) and docs 001–057, 059, 060.
- No comments, no `any`, no type assertions, no `@ts-ignore`, no hardcoded colours. Semicolons everywhere.

### 0.4 What could be affected (C checks)

- **The visible ruler:** marks, labels and positions at every zoom/scroll (BR-COUNT*, BR-SCROLL*, BR-ZOOM, BR-LOOK*); the round-65 TB rows (TB-REG).
- **Follow during playback:** auto-scroll crosses pages; visible marks must stay complete (BR-FOLLOW).
- **Resize:** a narrower viewport changes `vp` (BR-RESIZE).
- **Render budget:** no extra renders or layout reads on position frames (frozen `render-budget`, BU8).
- **Seconds ruler, lanes, Overview:** unchanged (RU-REG).
- **Expected suite: 99 files / 1683** (1669 + BW1–BW6 + BU1–BU8).

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo is never audio stretch. `/studio-lab` stays demo-only. Purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:** `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`. Then run the `pre-flight` skill. **Record in `a-round-70/checkpoint.md` which files you read.**
2. **Baseline before any edit:** HEAD and `git status --short` (empty); `sha256sum -c ../tmp/studio-real-loop/b-round-69-r70-tree-sha256.txt | grep -vc ': OK$'` → 0; the snapshot `SHA256SUMS.txt` and `cmp` for the 5 owned existing files; protected 4/4; Biome 4/218/1; `node.exe`; both servers.
3. **Red run first:** write the two new test files (§2.2) before any source change and run them. **Expected:** the run fails (wrong mark counts, missing props). Record the output, then implement. The frozen `tempo.test.ts`, `tempo-ui.test.tsx` and `render-budget.test.tsx` stay green on the baseline; record that.
4. Post the pre-flight gate and the red run at the top of your report.

## 2. A: the change

### 2.1 Source
Implement exactly §0.1 and §0.3.

### 2.2 Tests (new files only)

**`app/lib/arrangement/__tests__/tempo-window.test.ts`** (6 `it`)

| ID | Must assert |
|---|---|
| BW1 no window | For the frozen T5–T8 inputs and (999, 320, 133): `barsRulerMarks(s, p, b)` `toEqual` `barsRulerMarks(s, p, b, undefined)`; the 133 s / 999 BPM / 320 px/s full list has length **2215** |
| BW2 oracle sweep | BPM [20, 60, 90, 92.5, 120, 133.33, 999] × px/s [0.5, 5, 15, 40, 190.7, 320] × seconds [10, 133, 600] × windows {[−500, 700], [0, 1216], [k·1216 − 1216, k·1216 + 2432] for k = 3 and k = the last page, [width − 100, width + 5000], [width + 10, width + 20]}: windowed `toEqual` full filtered by `m.time * p >= fromPx && m.time * p <= toPx`. Failures/count form `toEqual({ count: 0, first: [] })`; under 2 s alone |
| BW3 boundaries | A mark whose `time × p` equals `fromPx` or `toPx` exactly is included (pick a window at a bar's exact px, e.g. 90 BPM 40 px/s bar 2 at 106.666…, `toBeCloseTo`-free: use the mark's own `time * p`); a window wholly past the end → `[]`; a negative `fromPx` → starts at bar 0 |
| BW4 thinning alignment | 120 BPM, 5 px/s, 600 s (`barStep` 4): the window starting at bar 7's px returns first the bar labelled `9` (bars 1, 5, 9 … counted from 0), equal to the filtered full list; no beats |
| BW5 cost | 999 BPM, 320 px/s, **360 000 s**, window [1e8, 1e8 + 3648]: result length between 180 and 240, every mark inside the window, consecutive marks `60 / 999` s apart (`toBeCloseTo(…, 9)`), every 4th mark of kind `bar` and the rest `beat`, labels `null` for beats, and the call takes **< 100 ms** (`performance.now`). The full list would be ~6 million marks |
| BW6 invalid window | `{ NaN, 100 }`, `{ 0, Infinity }`, `{ 500, 100 }` → `[]` |

**`app/lib/arrangement/__tests__/tempo-window-ui.test.tsx`** (8 `it`, one `describe` with `{ timeout: 15_000 }`). The harness stubs the scroller's `clientWidth` (1440 − 224 → vp **1216**) and keeps a `FakeResizeObserver` that stores its callback. To count strip renders, wrap `barsRulerMarks` with `vi.mock('~/lib/arrangement/tempo', …)` that delegates to the actual implementation and counts calls (this file only).

| ID | Must assert |
|---|---|
| BU1 unmeasured | `clientWidth` 0: BPM 90 at 40 px/s → the DOM `arrangement-bars-mark` list (`data-time`, `data-kind`, label text) equals `barsRulerMarks(seconds, 40, 90)` in full |
| BU2 window at load | vp 1216, a timeline ≥ 133 s (a clip ending past 133 s), BPM 999, zoom to 320 px/s: DOM marks = the full list filtered to [−1216, 2432] (by `data-time`), count ≤ 400, and every full-list mark with px in [0, 1216] is present |
| BU3 page change | `scroller.scrollLeft = 6090` + a `scroll` event → page 5 → DOM marks = filtered to [4864, 8512] exactly; every mark in [6090, 7306] present |
| BU4 no render inside a page | from BU3: `scrollLeft` 6090 → 6500 → 7200 (+ scroll events) → `barsRulerMarks` call count unchanged and DOM unchanged; then 7300 (page 6) → exactly **+1** call and the window [6080, 9728] |
| BU5 zoom | at 40 px/s scrolled to `scrollLeft` 800, zoom in with the workspace zoom path (keyboard `=` or the zoom control, as `tempo-ui` U11 does) → the first committed DOM after the zoom contains every full-list mark inside the new visible range `[view.scrollLeft, view.scrollLeft + 1216]` taken from the new view, without an extra scroll event |
| BU6 resize | stub `clientWidth` to 1000 + 224 and invoke the stored `ResizeObserver` callback → the window uses vp 1000 (DOM = filtered to the new window) |
| BU7 BPM clear and set | BPM 999 windowed → clear → the hint, 0 marks → 90 → windowed marks for 90 BPM; with no BPM a scroll notification calls `barsRulerMarks` 0 times |
| BU8 position frames | BPM 999 windowed, 30 playhead position updates through the position store (no scroll) → `barsRulerMarks` call count unchanged and `clientWidth` getter reads by the strip 0 (spy as `render-budget` does) |

**Rules:** no `.skip`, `.only`, `.todo`, retries or per-`it` timeouts; times compared with `toBe`/`toEqual` against the pure function's own output (no hand-rounded constants except BW1's 2215 and BW5's bounds). **Expected:** vitest **99 files / 1683**.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Scratch copy with a `node_modules` junction and your own vitest config, as in rounds 65–69. Run on the two new files plus `tempo.test.ts`, `tempo-ui.test.tsx` and `render-budget.test.tsx`. Restore after each mutation.

| # | Mutation | Must fail |
|---|---|---|
| a | the window parameter is ignored (full list) | BW2, BU2 |
| b | windowed = full list then `.filter` | BW5 |
| c | the first bar is `floor(fromPx / barPx)` without rounding up to a multiple of `barStep` | BW4 |
| d | `toPx` exclusive | BW3 |
| e | page uses `Math.round` | BU3 or BU4 |
| f | no left margin (`fromPx = page × vp`) | BU3 |
| g | the strip re-renders on every scroll notification | BU4 |
| h | unmeasured viewport → `[]` | BU1 |
| i | the window reads `scroller.scrollLeft` at render instead of `getTimelineView()` | BU5 |
| j | the resize notification is ignored (vp cached at mount) | BU6 |
| k | label fit uses the window width instead of the ruler width | BW2 |

Write `a-round-70/mutations.txt` (command, result lines, failing test names). A survivor → strengthen that test within §2.2. **Spec-assumption stop:** if a §2.2 assertion fails on the finished tree for a reason that is not an implementation bug (a wrong oracle row, a frozen test that conflicts with §0.1, the zoom path not exposing the pending view), stop and report to B. Never edit a frozen test.

### 2.4 After the change
- **Self-check:** `npx tsc --noEmit` → 0; full `npx vitest run` → **99 / 1683, 0 failures**; `npm run build` → rc 0.
- **Biome:** read-only `npx biome check ./app` → ≤ 4 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info. The 5 owned code/test files → 0 diagnostics.
- **Review:** run the real `code-reviewer` subagent on the diff against the snapshots. Put findings and dispositions in the report; Architecture notes go to B (`a-round-70.md` §6), not into code.
- **`/check`:** `npm run verify` → exit 0, quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke` (root's).
- **Browser smoke (`:5173` up):** one load of `/studio-lab` at 1440×900; BPM 999; zoom to max; record the DOM mark count. Not a PASS claim.

### 2.5 Docs
- **New `docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md`** per `TEMPLATE.md`, in Georgian with technical terms in English. Status line: `Round 70 — D-29z35; C-ის შემოწმებას ელოდება`. Cover: context (ROOT-R65-M1, BD-INFO numbers), the window rule and why a floor/gradient were rejected, files, BW1–BW6 / BU1–BU8, mutations and gates, TODO (ROOT-R66-M1 → round 71).
- **Doc 058, two edits only:** (1) the status line → `Round 65 — D-29z30; C PASS (round 65), გამოქვეყნდა 3e55c5c`; (2) one sentence directly after the paragraph that lists `barsRulerMarks` among the exports, saying that from round 70 the strip renders only a 3-viewport window (doc 062).
- **Doc 061, status line only** → `Round 69 — D-29z34; C PASS (round 69), გამოქვეყნდა ae4fc39`.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/tempo.ts` | A | §0.3 |
| `app/components/arrangement/ArrangementTempoRow.tsx` | A | §0.3 |
| `app/components/arrangement/StudioWorkspace.tsx` | A | the one §0.3 edit |
| `app/lib/arrangement/__tests__/tempo-window.test.ts` | A | new, BW1–BW6 |
| `app/lib/arrangement/__tests__/tempo-window-ui.test.tsx` | A | new, BU1–BU8 |
| `docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md` | A | new |
| `docs/implementation/2026/quarter-IV/058-studio-lab-tempo-bars-ruler.md` | A | the two §2.5 edits |
| `docs/implementation/2026/quarter-IV/061-studio-lab-grid-triplets.md` | A | the status line |
| `../tmp/studio-real-loop/a-round-70.md`, `a-round-70/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-70.md`, `c-round-70.json`, `c-round-70/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end: 8 lines** — ` M` for `tempo.ts`, `ArrangementTempoRow.tsx`, `StudioWorkspace.tsx`, doc 058 and doc 061; `??` for the two test files and doc 062.

### 3.2 Frozen this round
- Everything in `b-round-69-r70-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code; `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**`, `root-publish/**`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server or the backend; `npm run format`; deleting `playwright-report/`, `store/nul` or any `*-round-6x/scratch/` folder.

## 4. Acceptance (C)

**Checkpoint order:** G70-2 → R70-S → R70-U → G70-1 → §4.6 (browser rows) → §4.7 (regressions) → G70-3. Write `c-round-70/checkpoint.md` as you go. Check both servers at the start, after the offline items and before the report. `browserVerified` is `true` only if every REAL-browser row in §4.6, §4.7 and G70-3's workspace rows ran.

### 4.1 R70-S — static (read-only)
- **`diff -u` against the round-70 snapshots:** `tempo.ts` additive (type + optional parameter; the no-window path unchanged); `ArrangementTempoRow.tsx` only the props, the window rule/subscription and the two strip props; `StudioWorkspace.tsx` exactly the three props on `<ArrangementTempoRow>`; doc 058 exactly the two edits; doc 061 only the status line.
- No new `window`/`document` listener, timer or `ResizeObserver` in the owned files.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts. The new test files do not import from frozen test files.
- **EOL:** LF only. **Doc 062** exists with the TEMPLATE sections and the status line.

### 4.2 R70-U — unit and mutation (C's own scratch, own edits)
- **Red run:** the two new files against a scratch tree holding the round-70 **snapshots** of the three source files → they fail (record how).
- **Mutations a–k** in your own scratch; each must kill its named tests.
- **C extras (info), suggested:** (l) window margin 2 pages each side (count bound still holds? record); (m) `subscribeTimelineScroll` unsubscribe removed (leak; does any test notice?); (n) `page` from `scrollLeft` without `Math.max(0, …)` with a negative scroll.
- Record survivors as test gaps. **Durations:** the two files alone; BW2 < 2 s; BW5's timing assertion stable over 3 runs (record).

### 4.3 G70-1 — gates
tsc 0; build; Biome read-only `./app` within 4/218/1 and the 5 owned code/test files 0 diagnostics; **vitest 99 files / 1683, 0 failures** (quiet); **`npm run verify` exit 0** (at most two quiet attempts, each recorded; neither rc 0 → FAIL); `node.exe` recorded.

### 4.4 G70-2 — tree
Protected 4/4 OK; frozen 436/436 OK; `git status --short` = the 8 §3.1 lines; HEAD at start and end.

### 4.5 Reading values
- **DOM:** `[data-testid=arrangement-bars-mark]` (`data-time`, `data-kind`, label text), `arrangement-bars-ruler` (`data-bpm`, width), the scroller `arrangement-timeline-scroller` (`scrollLeft`, `clientWidth`), the zoom readout.
- **Expected visible set** (C computes it in-page from the formula, not from the app): for `barStep === 1` (bar px ≥ 40), every `k × 60 / bpm` with `k × 60 / bpm × pps` in `[scrollLeft, scrollLeft + clientWidth − 224]` and `≤ rulerWidth − 1`; kind `bar` when `k % 4 === 0`. With thinning (bar px < 40), only bars `k = 4 × barStep × n`.
- **Complete** = every expected visible mark is in the DOM with that `data-time` (6-decimal rounding as the attribute) and kind.
- **Mark totals are not comparable across rounds:** from round 70 the DOM holds a window, not the whole ruler (round 69 TR-RULER counted 78 on its page). Compare counts within one run or against the formula, never against an earlier round's total. A short timeline (e.g. the empty 30 s demo at 40 px/s) still fits inside the window, so its full list is unchanged.
- **Timing:** per zoom step, the PerformanceObserver `longtask` duration (or the max frame gap in the 500 ms after a REAL `=`), as BD-INFO.

### 4.6 Browser rows — fresh `/studio-lab`, 1440×900; starred rows also at 1280×720

Fixture **BD** (as c-round-66.md BD-INFO): add `Middle East` (133 s timeline), BPM `999`, REAL `=` to the maximum zoom 320 px/s. Use one fresh page per group of rows and record which rows shared a page.

| ID | Steps | Pass |
|---|---|---|
| **BR-COUNT*** | BD at scroll 0; then REAL-mouse (PW) scrollbar/wheel to the middle and to the end | at each position: DOM mark count **≤ 400** (record it; round 66: 2215) and the visible set **complete** |
| **BR-SCROLL*** | BD; REAL-mouse (PW) horizontal wheel through the whole timeline in ~300 px steps, reading after one animation frame each step (record the step count) | visible set complete at **every** step; count ≤ 400 at every step; record the max count |
| BR-ZOOM | BD scrolled to ~60 s; REAL `-` step by step to the minimum zoom, then REAL `=` back to 320 | complete at every step; at the minimum zoom the DOM list equals the whole-ruler formula list (the window covers the ruler); per-step timing recorded at the five highest zooms — **FAIL if the median ≥ 69 ms** (BD-INFO's lowest high-zoom value); record the comparison |
| BR-FOLLOW | BD, Follow on, REAL Alt-click the ruler at 10 s, REAL Space, play ~6 s, sample every 200 ms | ≥ 25 samples, **0 incomplete**, page changes observed (record scrollLeft range); REAL Space stops |
| BR-RESIZE | BD at max zoom scrolled to ~60 s; PW `setViewportSize` 1440×900 → 1280×720 → 1440×900 | complete after each resize (after one frame), count ≤ 400 |
| BR-90 | fresh page, no clip moves: BPM `90` at the default 40 px/s | bars `2` and `3` at 106.66 px and 213.33 px (round-65 TB-SET90), beats unlabelled; DOM list = whole-ruler formula list (short timeline inside the window) |
| **BR-LOOK*** | BD at scroll 0 and at the middle; 90 BPM at 40 px/s | screenshots; labels and marks look as in round 65/69 shots (bar numbers, beat ticks); no horizontal page overflow; chrome height unchanged |

### 4.7 Regressions (directly related)
- **TB-REG:** round 65's TB script rows TB-SET90, TB-120, TB-ZOOM, TB-CLEAR (bars rescale on tempo/zoom, the hint on clear).
- **RU-REG:** the seconds ruler click/double-click Fit as in round 67 RU (the dedicated RU script).
- **TR-RULER-REG (static + one run):** the bars strip mark count and first 4 positions identical before and after a grid `3` toggle at 90 BPM (round 69 TR-RULER, no audio needed).
- **REG-HYD:** no hydration warning on the `/studio-lab` load.

### 4.8 G70-3 — anonymous workspace and purchase protection
- Fresh browse state. `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- No requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 (`r2.cloudflarestorage`, `r2.dev`, `r2-proxy`, `workers.dev`), and no `Authorization` header from workspace code, in every §4.6–§4.7 run.
- `/studio/middle-east` shows "Sign in required". Anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; a fake Bearer → **403**.
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image and the homepage R2 cover image, Google Fonts.

### 4.9 Ableton
Two verdicts for each §0.2 row: the CZABA requirement (PASS/FAIL) and the Ableton match (confirmed / deliberate difference / unconfirmed / not applicable).

### 4.10 Not run this round, and carried items (honest)
- **Not run:** video sync and C-R27-01; the full find → add → fit video → export flow (no export change); the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root); metronome audio rows (no metronome change; ROOT-R66-M1 is round 71).
- **Tech Lead:** R65-T … R69-T unchanged. **R70-T:** in your Chrome at 999 BPM and maximum zoom, scroll and zoom the bars ruler — does it feel smooth, and do you ever see a missing mark at the edges while scrolling fast?
- **Carried (Lows batch / own tasks):** see `b-round-69.md` §6.

## 5. Commands

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-69-r70-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-69-r70-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/tempo.ts app/components/arrangement/ArrangementTempoRow.tsx app/components/arrangement/StudioWorkspace.tsx docs/implementation/2026/quarter-IV/058-studio-lab-tempo-bars-ruler.md docs/implementation/2026/quarter-IV/061-studio-lab-grid-triplets.md; do cmp -s "$f" "../tmp/studio-real-loop/b-round-69-r70-snapshots/$(basename "$f")" && echo "same $f" || echo "changed $f"; done
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){const s=fs.readFileSync(f,'utf8');console.log(f,'CR',(s.match(/\r/g)||[]).length,'LF',(s.match(/\n/g)||[]).length)}" app/lib/arrangement/tempo.ts app/components/arrangement/ArrangementTempoRow.tsx app/components/arrangement/StudioWorkspace.tsx
npx vitest run app/lib/arrangement/__tests__/tempo-window.test.ts app/lib/arrangement/__tests__/tempo-window-ui.test.tsx app/lib/arrangement/__tests__/tempo.test.ts app/lib/arrangement/__tests__/tempo-ui.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/lib/arrangement/tempo.ts app/components/arrangement/ArrangementTempoRow.tsx app/components/arrangement/StudioWorkspace.tsx app/lib/arrangement/__tests__/tempo-window.test.ts app/lib/arrangement/__tests__/tempo-window-ui.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

## 6. Requests to root (non-gating for A)

1. **Commit unit:** round 70 alone, after a C PASS. ROOT-R65-M1 then closes on C evidence.
2. **ARCH-CHECKPOINT-SRW14-PREFS** (sixth request, made in round 69 at the SRW-14 boundary) is still open; round 69's reviewer added the same `useGridPreferences` (a) and shared-harness (c) signals. SRW-14 is now complete, so this is the natural moment. Bounded read-only frontend-architect per `store/.claude/references/architecture-checkpoint.md`; answer keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task. **Round 70 does not wait.**
3. **INFO-R61-FAKEBEARER-500, INFO-C65-LS-SESSION:** unchanged, root's notes.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-70.md`:** (1) pre-flight gate (with the files read), baseline and red run; (2) diff summary per file with EOL counts; (3) BW1–BW6 and BU1–BU8 with alone durations; (4) mutations a–k; (5) smoke; (6) code-reviewer findings, dispositions and any Architecture note; (7) verbatim command tails incl. `node.exe` and `npm run verify`; (8) deviations. Do not claim PASS. On a stop condition, stop and report.

**C → `c-round-70.md` and `c-round-70.json`** (usual schema with `browserVerified`): each ID PASS, FAIL with a bug ID, or **not run** with the reason; two verdicts for the Ableton rows; `passed` lists only IDs run this round; commit readiness.

**Next (orientation only):**
1. C bugs from this round first.
2. **Round 71: ROOT-R66-M1** — horizon-based non-loop metronome clicks (`from → min(end, from + horizon)` in `startGraph`, refill via `appendClicks` from `pumpPlaybackAudio`, late-pump rule), with a narrow grant to the three `metronome-ui` UI2/UI4/UI5 assertions that pin `PROJECT_END`, doc 059 status line + superseding sentence (DOC-059-STATUS-LINE), real-audio C rows across the horizon boundary, seek and scrub. `createMetronomeBuffers` extraction stays an ARCH (f) signal.
3. SRW-16 (FB-10) named markers, then SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, and the SRW-24 follow-ups.
4. The Lows batch; SRW-21; the full regression and root review; T12.
