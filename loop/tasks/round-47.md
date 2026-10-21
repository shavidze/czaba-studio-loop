# CURRENT TASK — Round 47: SRW-14 stage 1 (FB-13) — seconds grid, Snap on/off (button + G), division select, lane grid lines, snapping for clip move (drag + keyboard nudge)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-16
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint section; **user priority 2026-10-15: round 47 = SRW-14 Grid/Snap stage 1**).
- Decision record: **D-29z12** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-46.md`.
- Round size: **one feature stage** (FB-13 grid model + Snap, applied to clip **move** only). Two carried one-liners ride along because they live in files/docs this round already opens: the `ArrangementClip.tsx` range overlay `/60 → /30` (plan.md l.395 commitment: "fixed when `ArrangementClip.tsx` next opens") and the doc 043 status line (same class as DOC036/DOC042).

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B's gates (2026-10-16 11:49 +04). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **51** at B's gates (39 after the focused vitest). Every A and C run records `tasklist | grep -ci node.exe`. On a timeout under load, re-run that file alone and report both runs.
>
> **Browse rules** (`backlog.harness_rules`): never `$B restart`; a **new** `BROWSE_STATE_FILE` under your own round folder; after **one** CLI-daemon failure use the approved fallback `browse/dist/server-node.mjs` with `BROWSE_PARENT_PID=0`, a fresh state file and a log in your round folder, **started from `tmp/studio-real-loop/`**. Record command, PID, log; stop only your own process (`/T`). Screenshots in a short window: CDP `Page.captureScreenshot`. Delays: bash `sleep` or in-page `performance.now()`. Detail-panel range inputs show `8` / `10`; at 1280×720 the detail panel starts collapsed (36 px); `+`/`−` zoom steps do not push zoom history.

## Why this round

**Round 46 result** (`c-round-46.md`, `c-round-46.json`): **C PASS on every contracted ID C could run, bugs `[]`.** G46-1 (tsc 0, vitest **80 / 1364**, build, Biome 2 baseline CRLF errors / 218 warnings / 1 info), G46-2 (395 OK, protected 4/4), G46-3 (anonymous `/studio-lab` direct + header link, 0 token/recording/download/R2 requests, 0 Authorization, token 401, fake Bearer → 500 no token, `/studio/middle-east` → "Sign in required"), R46-S, R46-U (mutations a–e + C's f1/f2), R46-FOCUS (F-ESC, F-CLOSE, F-X, F-WRAP, F-RENDER incl. a 23.000 s RIFF/WAVE, F-SPACE, F-1280), R46-SSR (Δ 0 ×3), REG-HYD/PLAY/KEYS, R46-Doc. F-VIDEO ✕-as-opener stays **unit-only** (no REAL path).
**Published by root:** `d2f6715` (`fix(studio): restore export opener focus and skip hidden controls`); B `git ls-remote` 11:4x on **both** URLs → `d2f6715`. `publication-checkpoint.json` → `round46Checkpoint` (verify 80/1364, smoke 2).
**Closed by C evidence:** EXPORT-DIALOG-FOCUS-RESTORE, DOC036-STATUS-LINE, DOC042-STATUS-LINE. **B decisions:** A-R46-RESTORE-SELECTION accepted as a documented limit (doc 043; no REAL-input path; `aria-modal`; reopen only on a REAL path); B-EXPECT-R46-F closed (task text was wrong; tree order only makes the green run meaningful).

**The user's request (FB-13, `docs/video-to-text-bugs/README.md`; transcript `2.srt` 05:16–07:53):** the timeline has no grid; the user wants selectable grid divisions, Snap on/off, and free movement must stay ("აქ არ იკეტება … უნდა გვქონდეს ორნაირი"); clip movement and the play position must follow the chosen grid consistently; a button/menu to pick the grid; a Ctrl+key shortcut that switches to free ("კონტროლ … ოთხიანს"). The user's division names are musical (1/4, 1/8, 1/16 …) and need a tempo — that is SRW-15 (FB-09/FB-11). The SRW-15 rule stands: **BPM is user-entered; never silently assume 120.**

**Stage plan for SRW-14 (no scope reduction; every stage is scheduled):**
1. **Round 47 (this):** seconds grid model, Snap toggle (button + G), division select, visible lane grid lines, snapping for clip **move** (drag: single, group, cross-lane; keyboard nudge).
2. Stage 2: trim edges, time-range selection (clip body + lane background), the range overlay; Alt momentary bypass (Live 6.10).
3. Stage 3: playhead/insert marker (ruler click/drag), paste position, library drop ghost, loop brace.
4. Stage 4: snap to clip edges (Live 6.7), right-click division menu on lanes (user, 07:00), narrow/widen keyboard steps.
5. After SRW-15 sets a BPM: musical divisions (bar, 1/2 … 1/32), the original **R14-G1** ("1/4 at 120 BPM → start on 0.5 s multiples"), bars/beats ruler.

## Baseline

B verified on 2026-10-16 11:49 +04 (`b-round-46/gates.txt`, `tsc.txt`, `vitest-focus.txt`, `toolbar-measure.txt`):
- HEAD **`d2f6715`**; `git status --short` **empty**; both master remotes at `d2f6715`. **One starting point only.** If HEAD is a newer root commit, report it and continue only if `git diff d2f6715 --stat -- app docs` is empty.
- **Frozen list:** `../tmp/studio-real-loop/b-round-46-tree-sha256.txt` → **395 OK** (run from `store/`). It is round 46's list minus the four files this round owns (`ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementTransport.tsx`, `StudioWorkspace.tsx`) plus the round-46 files now committed (`ArrangementExportDialog.tsx`, `export-dialog-focus-restore.test.tsx`, docs 036, 042). `ArrangementTransport.tsx` is **not** owned this round but is snapshotted (it must stay byte-identical; see §0.2).
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-46-snapshots/`, `SHA256SUMS.txt` inside):

  | File | sha |
  |---|---|
  | `ArrangementClip.tsx` | `1a890a1f` |
  | `ArrangementLane.tsx` | `855bc517` |
  | `ArrangementTransport.tsx` (must stay identical) | `35b03a95` |
  | `StudioWorkspace.tsx` | `30cdee8b` |
  | doc 043 | `5bc8ff58` |

- Other checks: protected 4/4 OK; tsc **0**; focused vitest (gesture-reentry, gesture-guard, track-layout, render-budget, fader-guards, selection, view) **7 files / 211**; full vitest at `d2f6715` = **80 files / 1364** (root `checkpoint-r46-verify.log`); `/studio-lab` 200.
- Biome `./app`: **2 errors** (root CRLF `format` on `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/auth-bugs.test.ts` — **do not touch**), 218 warnings, 1 info. Your files add 0 errors and 0 warnings.
- **Toolbar measurement (B, `b-round-46/toolbar-measure.txt`, REAL page, fresh load):** at 1440×900 the transport toolbar is **one row, 49 px**, with only **25 px** free between `↻ Loop` and the right group; at 1280×720 it **already wraps to 2 rows (87 px)**. A Snap control in the toolbar would add a row at 1440. Therefore the grid control goes into the **sticky ruler header cell** (224 × 28 px, top-left of the timeline, today the static text `ხაზები`), next to the ruler — the place Live shows the grid spacing ("above the time ruler", 6.10).
- **Before you edit:** confirm HEAD, the clean tree, 395 OK and the 5 snapshot shas. If anything differs, **stop and report**. Record any untracked path you see; do not touch it.

**Rules:** do not revert, re-create or reformat anything. `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root. Only root commits or pushes.

## 0. Scope

### 0.1 Grid model — new `app/lib/arrangement/grid.ts` (pure, no React, no DOM)

Exports (names are part of the contract; A may add private helpers, no other exports):
- `GRID_DIVISIONS_SECONDS = [10, 5, 2, 1, 0.5, 0.25, 0.1] as const` — every value is a whole number of milliseconds (the model rounds every time to 1 ms; 1/16 s or 1/32 s would land off-grid after rounding, so they are not offered).
- `GRID_DEFAULT_DIVISION_SECONDS = 1`.
- `GRID_LINE_MIN_SPACING_PX = 6`.
- `snapTimeToGrid(time: number, step: number): number` → nearest multiple of `step`, a tie goes to the **later** line, result `≥ 0`, rounded to 1 ms.
- `adjacentGridLine(time: number, step: number, direction: -1 | 1): number | null` → the nearest line **strictly** after (`1`) or before (`-1`) `time` (tolerance 1e-6 s), rounded to 1 ms; `null` when `direction` is `-1` and no line `< time` exists at or above 0.
- `snapGroupDelta(anchorStart: number, rawDelta: number, step: number, minDelta: number, maxDelta: number): number` → the delta that puts `anchorStart + delta` on the grid nearest to `anchorStart + rawDelta`; if that delta is outside `[minDelta, maxDelta]`, the grid-aligned delta that lies inside the bounds **and between 0 and the snapped delta** (same direction as the drag) and is nearest to the snapped delta; if none exists, `0` (the group does not move; it never jumps against the drag direction). Result rounded to 1 ms.
- `gridLinesVisible(step: number, pxPerSecond: number): boolean` → `step * pxPerSecond >= GRID_LINE_MIN_SPACING_PX`.
- `formatGridDivision(step: number): string` → `10 წმ`, `5 წმ`, `2 წმ`, `1 წმ`, `0.5 წმ`, `0.25 წმ`, `0.1 წმ`.

Snap state is a **view/edit preference, not arrangement data**: it is not in `Arrangement`, not in history, not in clipboard, not persisted (a reload starts with Snap off, 1 წმ). Undo/Redo never change it.

### 0.2 Grid state, control and shortcut — `StudioWorkspace.tsx`

- State: `useState` in `StudioWorkspace` (like `followMode`): `snapEnabled` (initial **false**) and `gridSeconds` (initial `GRID_DEFAULT_DIVISION_SECONDS`). **`ArrangementContext.tsx` is not touched** (frozen, 2850 lines; the context API does not change).
- **Control, in the sticky ruler header cell** (`StudioWorkspace.tsx` l.1406–1411, today the text `ხაზები`). The cell keeps its size (224 × 28 px), stickiness and border. Its content becomes:
  - a wrapper `data-testid="arrangement-grid-control"` with `data-snap="on|off"`, `data-grid-seconds` (e.g. `1`, `0.25`) and `data-grid-lines="visible|hidden"` (from `gridLinesVisible(gridSeconds, pxPerSecond)`);
  - a toggle `<button type="button">` with text **`Snap`**, `aria-pressed`, `aria-keyshortcuts="G"`, `data-testid="arrangement-snap-toggle"`, `title` exactly `Snap ჩართულია — კლიპი ბადეზე ჯდება (G)` / `Snap გამორთულია — თავისუფალი გადაადგილება (G)`; pressed state uses the existing token pattern of the Follow/Loop buttons (`text-brand` / `border-accent`-type classes; no new colours);
  - a native `<select>` with `aria-label="ბადის დანაყოფი"`, `data-testid="arrangement-grid-division"`, the 7 options of `GRID_DIVISIONS_SECONDS` labelled by `formatGridDivision`, value = `gridSeconds`. When lines are hidden its `title` is exactly `ბადე {label} — ამ მასშტაბზე ხაზები დამალულია; Snap მაინც მუშაობს. გაადიდე Zoom.`; otherwise `ბადე {label}`.
  - The text `ხაზები` may stay only if everything fits in 224 px without clipping the select's value at both viewports; otherwise it is removed (the lane headers name the tracks). A asks the `design-philosopher` agent in pre-flight about this one choice and records the answer.
- **Toolbar unchanged:** `ArrangementTransport.tsx` stays byte-identical to its snapshot. Toolbar height after the change: **49 px at 1440×900, 87 px at 1280×720** (no new row).
- **Status line** (via the context's `setStatus`; no history): toggle on → `Snap ჩართულია — ბადე {label} (G)`; toggle off → `Snap გამორთულია — თავისუფალი გადაადგილება (G)`; division change → `ბადე: {label} (Snap ჩართულია)` or `ბადე: {label} (Snap გამორთულია)`.
- **Shortcut G** in the existing window `keydown` handler, **after** the `if (modifier) { return; }` line: plain `g` by `shortcutLetter(event)` (layout-independent `KeyG`), no Ctrl/Meta/Alt/Shift, `!event.repeat`; `preventDefault()`; toggles Snap. Already filtered by the handler's early return: text fields, the `<select>` (it is a typing target), the open Export dialog. `Ctrl+G` does nothing (reserved for SRW-17 groups).
  - **Not** added to the gesture-blocked edit list (l.1085–1104): toggling Snap is not an edit and writes no history. During a drag it takes effect on the **next** `pointermove`; the drag still ends in exactly one Undo entry. (Review signal P2 in `frontend-architecture-pragmatic-2026-10-15.md` warns about that list; this round documents why G is outside it. The resolver refactor P2 is **not** part of this round.)
  - **Why G and not Ctrl+4 (user said "Ctrl + 4", Live 6.10/42.13):** Chrome and Edge on Windows reserve Ctrl+1…Ctrl+9 for tab switching; the page does not receive them reliably, so C could not test them. The purchased CZABA Studio already uses **G** for "Toggle Snap Grid" (`studio.$productId.tsx:64`, read only). Deliberate difference, recorded in doc 044.

### 0.3 Grid lines — `ArrangementLane.tsx`

- New **optional** props (defaults keep today's behaviour for any other caller): `gridSeconds?: number` and `snapSeconds?: number | null`. `StudioWorkspace` passes `gridSeconds={gridSeconds}` and `snapSeconds={snapEnabled ? gridSeconds : null}`.
- The lane **body** (`laneBodyRef`, l.703–719) draws vertical grid lines every `gridSeconds` from time 0 when `gridLinesVisible(gridSeconds, pxPerSecond)` — in **every** lane (audio, video, folded or not), **in both Snap states** (the user: in free mode the lines are there but nothing locks to them). One background layer per lane body (e.g. an inline `backgroundImage` with a repeating gradient whose colour is a design-token CSS variable, `backgroundSize` = `gridSeconds * pxPerSecond` px) — **no DOM node per line**, no hardcoded colour. The lines sit behind clips, ghosts and the range overlay and never receive pointer events (empty-area marquee, lane click, file drop and library drop keep working).
- The lane body gets `data-grid-seconds` and `data-grid-lines="visible|hidden"`.
- Pass `snapSeconds` to every `ArrangementClipView` (l.811). No other lane change.

### 0.4 Snapping clip moves — `ArrangementClip.tsx` (move gesture only)

- New **optional** prop `snapSeconds?: number | null` (default `null` = free; the frozen harnesses `gesture-reentry`/`gesture-guard` render `ArrangementClipView` without it and must compile and pass unchanged).
- The clip root gets `data-clip-start={clip.start.toFixed(3)}` (read-only aid for C; precedent `data-ghost-start`).
- In `handlePointerMove`, when `snapSeconds` is a number and the gesture is `move` and **not** time-locked (Shift):
  - **single, same lane:** `requestedStart = snapTimeToGrid(original.start + delta, snapSeconds)` instead of `Math.max(0, roundTime(original.start + delta))`. Blocked by a neighbour → the existing blocked status and the clip stays at the last previewed (grid) place. No search for another free grid line.
  - **group** (`gesture.group`): `allowed = snapGroupDelta(original.start, delta, snapSeconds, minDelta, maxDelta)` where `original` is the **grabbed** clip (anchor); the other clips keep their offsets. `gesture.blocked` keeps its meaning (requested ≠ allowed). Same-lane preview uses `allowed`.
  - **cross-lane** (single or group): the `timeDelta` passed to `planClipLaneMove` is the snapped delta (`snapTimeToGrid(original.start + delta) - original.start` for a single clip; `snapGroupDelta(...)` with the group bounds for a group). The lane ghosts therefore show grid starts.
  - **Shift (time lock):** unchanged — `delta = 0`, no snapping, the clip keeps its time.
  - Snap is read on every `pointermove` from the current prop, so a G toggle mid-drag applies on the next move.
- **Not changed this round:** trim (`trimStart`/`trimEnd`), the clip-body range gesture, `finishGesture`, labels/status texts, the drag threshold.
- **Carried one-liner:** l.589 range overlay `bg-foreground/60` → `bg-foreground/30` (plan.md l.395, D-29i design (b): α ≤ 0.5 keeps ≥ 50 % peak contrast; the detail panel already uses `/30`). Nothing else in that element.

### 0.5 Snapping the keyboard nudge — `StudioWorkspace.tsx`

In the ArrowLeft/ArrowRight branch (l.1191–1201), when Snap is on: anchor = the primary selected clip (`current.selectedClipId`) from the current arrangement; `target = adjacentGridLine(anchor.start, gridSeconds, ±1)`; if `target === null` → no call, no history, status `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.`; else `current.nudgeSelectedClip(target - anchor.start)` (the context's existing group/single logic and blocked messages apply). Snap off → today's `±NUDGE_SECONDS` (0.1). The read of Snap state must be current inside the effect (use a ref like `workspaceRef`, or include it in the deps; do not re-register the listener in a way that loses `exportKeyEventRef` marking).

### 0.6 Doc status line (doc-only)

| ID | Doc | Change |
|---|---|---|
| DOC043-STATUS-LINE | `043-studio-lab-export-dialog-focus-restore.md` **l.4** | the whole line becomes target text T3 below. No other line. |

- T3 (exact; backticks literal):

      **სტატუსი:** Completed — Round 46 C PASS (`c-round-46.md`), commit `d2f6715`; D-29z11

### 0.7 Unchanged / out of this round

**Unchanged:** `ArrangementContext.tsx`, `model.ts`, `selection.ts` (`moveClips`, `groupMoveBounds`, `planClipLaneMove` are called, not edited), `view.ts`, `ArrangementRuler.tsx` (ticks stay the seconds ruler), `ArrangementTransport.tsx`, `ArrangementLoopBrace.tsx`, the library, every existing test file, docs 001–042.

**Later SRW-14 stages (scheduled, not deferred):** trim/range/range overlay + Alt bypass (stage 2); playhead/insert marker, paste, library drop, loop brace (stage 3); clip-edge snap, right-click division menu, narrow/widen keys (stage 4); musical divisions + R14-G1 after SRW-15's BPM. **Then:** SRW-15 (FB-09/FB-11; grid only, never audio stretch; metronome not exported) → SRW-16 (FB-10) → SRW-17 (FB-12) → SRW-18 (FB-06) → SRW-19 (FB-07) → SRW-20 → R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, SETTRACKMIX-NAN-IDENTITY → SRW-21 adapter → full regression and root review → T12.

**Out of scope for the whole project:** plugins and effects (compressor, limiter, normalise); pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):** free drag with Snap off (must be today's behaviour), group move bounds and blocked status, cross-lane ghosts and Shift time lock, nudge ±0.1, Undo atomicity of a drag, marquee on empty lane area, file/library drop on lanes, the ruler header cell layout at both viewports, toolbar height, keyboard shortcuts (Space, Delete, Ctrl+Z, arrows) with focus on the new button/select, render cost of a drag, hydration/SSR warnings.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:** `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/studio-feature.md`, `prompts/new-test.md`; `docs/implementation/TEMPLATE.md`; then run the `pre-flight` skill. Ask the `design-philosopher` agent the one placement question of §0.2 (cell content within 224 px) and the grid-line token/opacity; record the answers.
2. **Baseline before any edit:** HEAD, `git status --short`, `sha256sum -c ../tmp/studio-real-loop/b-round-46-tree-sha256.txt | grep -vc ': OK$'` → 0, `(cd ../tmp/studio-real-loop/b-round-46-snapshots && sha256sum -c SHA256SUMS.txt)` against the working files (or compare each sha), protected 4/4, `node.exe`.
3. **Read:** `ArrangementClip.tsx` (all); `ArrangementLane.tsx` l.1–130 and l.700–900; `StudioWorkspace.tsx` l.200–330, l.1027–1260, l.1340–1470; `selection.ts` (`groupMoveBounds`, `moveClips`, `planClipLaneMove`); `model.ts` `moveClip`; `view.ts` (ruler ticks); `gesture-reentry.test.tsx` (pointer-capture stubs, drag harness) and `track-layout.test.tsx` (workspace mount); `b-round-46/ableton-6.7-6.10-20261016.txt`.
4. **Re-check (report each):** `grep -n "useState<TimelineFollowMode>" app/components/arrangement/StudioWorkspace.tsx`; `grep -rn "KeyG\|'g'" app/components/arrangement` → 0 today; `npx biome check` on the 3 owned TS files before the edit (record diagnostics).
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.1–§0.5. No comments, no `any`, no type assertions, no `@ts-ignore`, semicolons, no reformatting of unrelated lines. New exports only those named in §0.1 (plus none in components). Inline `style` only for computed px/gradient values; colours only via design tokens.

### 2.2 Docs

**Doc 044 (new):** `docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`:
- **Header:** date; status `Round 47 — D-29z12; C-ის შემოწმებას ელოდება`; the project.
- **კონტექსტი:** FB-13 (README + transcript times), why seconds divisions before SRW-15, why Snap starts off.
- **მიდგომა:** grid model; state in `StudioWorkspace` (not context, not history); placement in the ruler header cell (toolbar measurement); G vs Ctrl+4 (browser-reserved); lines in both Snap states, hidden below 6 px; move-only scope and the stage list; group anchor rule; nudge rule; Shift precedence.
- **არქიტექტურა:** one Mermaid diagram (state → lane → clip → `snapTimeToGrid`/`snapGroupDelta` → preview/commit).
- **შეცვლილი ფაილები** (no code fragments); **პრობლემები და გადაწყვეტები**; **ტესტირება** (red/green, the C IDs); **the §4.9 Ableton table**; **TODO** (stages 2–5).
- Doc 043 l.4 (§0.6).

### 2.3 Tests (in `store/`)

**New `app/lib/arrangement/__tests__/grid.test.ts`** (pure):

| ID | Case |
|---|---|
| GM1 | `snapTimeToGrid`: 0.4/1 → 0; 0.5/1 → 1 (tie later); 7.926/0.25 → 8; 0.149/0.1 → 0.1; −0.3/1 → 0; every result is a ms-integer (`Math.round(x*1000) === x*1000` within 1e-9) for 1000 seeded values × 7 divisions |
| GM2 | `adjacentGridLine`: (7, 1, 1) → 8; (7, 1, −1) → 6; (7.3, 1, ±1) → 8 / 7; (0, 1, −1) → null; (0.05, 0.1, −1) → 0; (0.1, 0.1, 1) → 0.2 |
| GM3 | `snapGroupDelta`: anchor 7, raw +0.6, step 1, bounds [−7, 10] → 1; anchor 7, raw +0.6, bounds [−7, 0.4] → 0 (the snapped delta 1 is out of bounds; the in-bound grid-aligned deltas are −7…0, nearest is 0); anchor 7.3, raw +0.9, bounds [−7, 3] → 0.7; anchor 7, raw +2.6, bounds [−7, 2.2] → 2; anchor 7.3, raw −0.2, bounds [−0.1, 5] → 0 (snapped delta −0.3 is out of bounds; no aligned delta in [−0.1, 0]; 0.7 is in bounds but against the drag direction, so it is not chosen) |
| GM4 | `gridLinesVisible`: (1, 40) true; (0.1, 40) false; (0.1, 60) true; (10, 0.5) false; `formatGridDivision` for all 7 values |

**New `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx`** (jsdom; mount `StudioWorkspace` under `ArrangementProvider` like `track-layout.test.tsx`; copy, do not import, stubs; pointer-capture stubs like `gesture-reentry.test.tsx`; drag by `pointerDown` on the clip header → `pointerMove` on the clip root → `pointerUp`; read starts from `data-clip-start` or the context; px values assume 40 px/s — if the mounted zoom differs, read it from `arrangement-zoom-readout` and convert, and say so):

| ID | Case | Expected |
|---|---|---|
| GS1 | fresh mount | Snap off (`aria-pressed="false"`, `data-snap="off"`), select `1`, lane bodies `data-grid-lines="visible"`, `data-grid-seconds="1"` |
| GS2 | Snap off, drag a clip at 7 by +37 px | start 7.925 (free, ms) — today's behaviour |
| GS3 | G (keydown on `document.body`) → drag the clip at 7 by +37 px; then by +15 px | status `Snap ჩართულია — ბადე 1 წმ (G)`; past length and undo label unchanged by G; first drag → 8.000; second (from 8, +0.375) → no change, no history entry |
| GS4 | select `0.25` → Snap on → drag the clip at 7 by +13 px (0.325 s) | 7.25 |
| GS5 | group: fixture SFX clip at 4.3 and music clip at 7, both selected; Snap on 1 წმ; grab the SFX clip, drag +36 px (0.9 s → 5.2 → snapped 5) | SFX 5.000, music 7.700 (same delta 0.7); one history entry `გადატანა (2)` |
| GS6 | cross-lane: Snap on, drag an SFX clip (start off-grid) onto the music lane | `data-ghost-start` during the move and the final start are on the 1 s grid; one entry |
| GS7 | cross-lane with Shift held, Snap on | start unchanged (time lock wins) |
| GS8 | nudge: select a clip at 7.3, Snap on, ArrowRight / ArrowLeft / ArrowLeft | 8 / 7 / 6 (one entry each); Snap off ArrowRight → +0.1 |
| GS9 | nudge at 0 with Snap on, ArrowLeft | no history entry; status `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` |
| GS10 | select `0.1` at 40 px/s | `data-grid-lines="hidden"`, select `title` = the hidden text; Snap still snaps a drag to 0.1 |
| GS11 | G ignored: focus the select → G; Ctrl+G; `repeat: true`; Export open → G | Snap unchanged in all four |
| GS12 | Snap off, start a drag, press G mid-drag, move again, release | the post-toggle move lands on the grid; exactly one history entry; Undo restores the original start |
| GS13 | Snap on, drag toward a neighbour so the snapped start overlaps it | no overlap; the existing blocked status; clip at its last free grid place |
| GS14 | `ArrangementTransport` untouched: the toolbar still renders the same buttons (Play, ↤, Undo, Redo, Split, წაშლა, Loop, Follow, Zoom, ⇔, ↩ Zoom, Fit, Export) and no Snap element | true |

**Red/green:** write the tests first and run them against the snapshots (untouched working copy before the first edit, or a scratch copy outside `store/`) → `a-round-47/red-run.txt` (GS2, GS14 green on the snapshot; GM* fail on a missing module; GS1, GS3–GS13 red). Then green → `a-round-47/green-run.txt`.

**A's mutations** (scratch copy outside `store/`; `node_modules` junction removed with `cmd /c rmdir` only; `MSYS_NO_PATHCONV=1`) → `a-round-47/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | single same-lane move ignores `snapSeconds` | GS3, GS4 |
| (b) | group move uses the raw delta | GS5 |
| (c) | cross-lane `timeDelta` unsnapped | GS6 |
| (d) | Shift no longer wins over Snap | GS7 |
| (e) | nudge ignores Snap | GS8 |
| (f) | the G handler ignores `event.repeat` | GS11 (the `repeat: true` case) |
| (g) | `snapTimeToGrid` tie goes earlier | GM1 |
| (h) | `GRID_LINE_MIN_SPACING_PX` check removed | GS10 |
| (i) | G handled before the `modifier` early return (Ctrl+G toggles) | GS11 |

If any of (a)–(i) survives, strengthen the test (never the code) and report it.

**Test rules:** no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards), no comments; exact strings from the source/rendered output; no snapshot tests; no fake timers.

### 2.4 After the code

- **Self-check:** the frozen suites of §4.8 and the full `npx vitest run` (1364 + your new `it` count).
- **Biome:** `npx biome check --write` **only** on your files; then read-only `npx biome check ./app` → exactly the 2 baseline errors, ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent on the diff (5+ files); report findings and dispositions. **Architecture notes** go to B (`a-round-47.md` §5), not into the code.
- **Browser smoke** (A; one run; fresh state under `a-round-47/`; not a PASS claim): `/studio-lab` 1440×900 → read the control (`data-snap="off"`) → REAL `G` → `data-snap="on"` → REAL drag of the `Soft impact` clip header by ~+50 px → `data-clip-start` is an integer second.
- **Dev-server warning count:** `grep -c "useLayoutEffect does nothing on the server" ../tmp/studio-real-loop/r42-vite.err.log` before/after one `curl` of `/studio-lab` + `sleep 3`; Δ expected 0 (or "not measurable" if `/` does not grow the log either).
- **`/check`:** `npm run verify`. Do not run `npm run test:e2e:smoke`.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch

HEAD `d2f6715`, clean tree.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | new (§0.1) |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.2 (state, header-cell control, G, props to lanes), §0.5 (nudge branch) only |
| `app/components/arrangement/ArrangementLane.tsx` | A | §0.3 only (two optional props, body grid background + data attributes, `snapSeconds` to clips) |
| `app/components/arrangement/ArrangementClip.tsx` | A | §0.4 only (optional prop, `data-clip-start`, move-branch snapping, l.589 `/60`→`/30`) |
| `app/lib/arrangement/__tests__/grid.test.ts` | A | new |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | A | new |
| `docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md` | A | l.4 only (§0.6) |
| `docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md` | A | new (§2.2) |
| `../tmp/studio-real-loop/a-round-47.md`, `a-round-47/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-47.md`, `c-round-47.json`, `c-round-47/` | C | report, runs, shots, gates |
| fresh browse state files and daemon logs in the own round folder | A / C | browse state |

`a-round-46/`, `c-round-46/`, `b-round-46/` and the snapshots are read-only.

**Expected `git status --short` at the end:**
```
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md
?? app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
?? app/lib/arrangement/__tests__/grid.test.ts
?? app/lib/arrangement/grid.ts
?? docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md
```
If root changes something meanwhile, record it as foreign and do not touch it.

### 3.3 Frozen this round

- All **395** files in `b-round-46-tree-sha256.txt`, `ArrangementTransport.tsx` (snapshot `35b03a95`), and everything else under `store/`, including `ArrangementContext.tsx`, `model.ts`, `selection.ts`, `view.ts`, `ArrangementRuler.tsx`, `gesture-reentry.test.tsx`, `gesture-guard.test.tsx`, `track-layout.test.tsx`, `render-budget.test.tsx`, `app/hooks/index.ts`, `vitest.config.ts`, `biome.json`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`: `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`; and `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`, `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`, firebase/R2/auth/purchase code, `routes/api.*`, `public/**`, `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`, the other roles' files under `../tmp/studio-real-loop/`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900 (and 1280×720 where named); fresh load. **Layout L47** = L46: the demo video at 0; `სრული მიქსი` on music at 7–23; `Soft impact` on SFX at 4–6; Master 0 dB (C's round-46 `fresh46.sh` chain may be copied to `c-round-47/`). Zoom 40 px/s unless stated (read `arrangement-zoom-readout`).

**Harness rules:** **REAL** = `$B click`/drag through Playwright pointer actions at element coordinates, `$B press`, `$B type`. **SYNTHETIC** (label it) = dispatched events, `.focus()`. Reads: DOM attributes (`data-clip-start`, `data-ghost-start`, `data-snap`, `data-grid-*`), the status line, the Undo button title; `window.__c` only if the setup chain already provides it. No source instrumentation. Mutations only in a scratch copy outside `store/`. Record `node.exe` on every run. If a REAL drag cannot be produced by the browse CLI, use the fallback's Playwright mouse (`mouse.down/move/up`) and label it REAL-mouse; never SYNTHETIC `dispatchEvent` for the drag IDs.

**Checkpoint order if the session may end:** G47-2 → R47-S → R47-U → R47-UI → R47-SNAP → R47-NUDGE → R47-LINES → R47-AUDIO → R47-REG → the rest. Write `c-round-47/checkpoint.md` as you go.

### 4.1 R47-S — static (read-only)

- `diff -u` each owned file against its snapshot: changes only where §0.2–§0.5 allow; `ArrangementTransport.tsx` `cmp`-identical; `ArrangementContext.tsx`, `selection.ts`, `model.ts`, `view.ts`, `ArrangementRuler.tsx` in the 395 list → OK.
- `ArrangementClip.tsx`: trim and range branches byte-identical to the snapshot; l.589 now `bg-foreground/30`; `data-clip-start` present.
- `grid.ts` exports exactly the §0.1 names; `GRID_DIVISIONS_SECONDS` values are ms-integers.
- G is handled after the `modifier` early return and is **not** in the gesture-blocked list.
- 395 OK; protected 4/4. Banned content in the diff and new tests: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, new component export.

### 4.2 R47-U — unit tests and mutations

- The new tests are green; A's red run matches §2.3; otherwise A explains each difference.
- The frozen suites of §4.8 are green.
- **C's mutations** (scratch copy; each must make a test fail): A's (a), (b), (c), (d), (e), (g), (h), (i); **C extra (j):** `snapGroupDelta` returns the clamped raw delta when out of bounds (must fail GM3); **(k):** the lane grid background rendered only when Snap is on (must fail GS1 — lines must be visible with Snap off).

### 4.3 R47-UI — the control (REAL)

| ID | Steps | Expected |
|---|---|---|
| UI-1 | fresh load 1440×900 | control in the ruler header cell; `Snap` `aria-pressed="false"`; select `1 წმ`; cell 224 × 28 px; no clipped select value (screenshot); toolbar height **49** |
| UI-2 | fresh load 1280×720 | same; toolbar height **87** (unchanged, no third row) |
| UI-3 | REAL click `Snap` | `data-snap="on"`, pressed style, status `Snap ჩართულია — ბადე 1 წმ (G)`; the Undo button title unchanged |
| UI-4 | REAL `G` with focus on body / on a clip | toggles; REAL `G` with focus in the library search field → no toggle; Ctrl+G → no toggle |
| UI-5 | REAL select `0.25 წმ` (keyboard: focus + ArrowDown, or click + option) | `data-grid-seconds="0.25"`; status `ბადე: 0.25 წმ (Snap …)`; focus on the select + REAL Space → **no** playback (select is a typing target; record) |
| UI-6 | focus `Snap` (REAL Tab or click) → REAL Enter → REAL Space | Enter toggles Snap; Space starts/stops playback (global Space; not a bug — record) |

### 4.4 R47-SNAP — drags (REAL)

| ID | Steps | Expected |
|---|---|---|
| SN-OFF | Snap off; REAL drag `Soft impact` header by +30 px | start = 4 + 30/40 = 4.75 ± 0.025 (pointer resolution); free placement as before |
| SN-1 | Snap on, 1 წმ; REAL drag `Soft impact` by about +1.4 s worth of px | `data-clip-start` an integer (e.g. `5.000` or `6.000`, whichever is nearest to the dropped position); status `კლიპის გადატანა: start …`; one Undo entry |
| SN-025 | 0.25 წმ; REAL drag by ~+0.6 s | start a multiple of 0.25 |
| SN-GROUP | Snap off: move `Soft impact` to 4.3 first; Ctrl+click `სრული მიქსი`; Snap on 1 წმ; REAL drag `Soft impact` by ~+1 s | `Soft impact` on an integer second; `სრული მიქსი` moved by the same delta; status `გადატანა (2): 2 კლიპი გადავიდა …`; one entry |
| SN-LANE | Snap on; REAL drag `Soft impact` vertically onto the music lane at a free spot | ghost `data-ghost-start` on the grid during the move; final start on the grid on the music lane; one entry `გადატანა ხაზზე — …` |
| SN-SHIFT | as SN-LANE with Shift held during the drag | start unchanged (time lock) |
| SN-MID | Snap off; REAL mouse down on the header, move, REAL `G`, move again, up | final start on the grid; one Undo entry; Ctrl+Z restores the original |
| SN-BLOCK | Snap on; drag `Soft impact` toward a neighbour on the same lane (place one first) | no overlap; blocked status text; clip at a free grid place |
| SN-VIDEO | Snap on; REAL drag the demo video clip by ~+0.6 s at 1 წმ | start an integer; the video preview follows (frame at the new offset; record) |

### 4.5 R47-NUDGE

| ID | Steps | Expected |
|---|---|---|
| NU-1 | Snap on 1 წმ; select `Soft impact` at 4.3 (REAL click); REAL ArrowRight, ArrowLeft, ArrowLeft | 5, 4, 3 (one entry each; Undo labels `კლიპის ჩაჩოჩება`) |
| NU-2 | Snap off; REAL ArrowRight | +0.1 |
| NU-3 | Snap on; clip at 0 (move it there first); REAL ArrowLeft | no entry; status `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` |

### 4.6 R47-LINES — grid lines (REAL view, DOM + screenshot)

| ID | Steps | Expected |
|---|---|---|
| LN-1 | fresh load, Snap off | lines visible in every lane body (`data-grid-lines="visible"`), every 40 px, x of each line = x of the matching 1 s ruler tick ± 1 px (measure 3 ticks); lines behind clips; screenshot |
| LN-2 | select `0.1 წმ` at 40 px/s | `data-grid-lines="hidden"`, no lines drawn, select `title` = the hidden text; REAL zoom in until ≥ 60 px/s → lines visible every 0.1 s |
| LN-3 | Snap on/off | lines identical in both states |
| LN-4 | with lines visible: REAL marquee on an empty lane area; REAL click on the lane background; library drag of a sound onto a lane | all behave as before (marquee selects, click sets the insert/playhead as before, drop ghost appears and adds the clip) |

### 4.7 R47-AUDIO, R47-REG, R47-Doc

| ID | Steps | Expected |
|---|---|---|
| AU-1 | REAL click the video lane's original-sound **Mute** (harness rule round 44; the demo video audio runs 0–6.008 s and would mask the window) → Snap on 1 წმ → REAL drag `Soft impact` from 4 to 6 → Export WAV | decode: in [3.5, 6.9) s the first sample above −40 dBFS is at **6.000 ± 0.010 s**; [3.5, 5.99) s is below −60 dBFS (no onset at 4 s); header RIFF/WAVE; 23.000 s |
| AU-2 | REAL Space after the snapped move | the SFX is heard at 6 s (playhead at 6 → meter of the SFX track rises; record the meter read) |
| REG-HYD | fresh load 1440×900; console 3 s | no hydration-mismatch, React or `useLayoutEffect` warning (root `GET /api/cart` refusal allowed) |
| REG-TRIM | Snap on; REAL drag a trim edge by ~+0.37 s | **free** (ms), not snapped — stage 1 contract (record; not a bug) |
| REG-RANGE | Snap on; REAL drag in the clip body (time range) | free (stage 2); the range overlay is `bg-foreground/30` (computed style) |
| REG-KEYS | after the drags: Ctrl+Z / Ctrl+Shift+Z, Delete on a clip, Ctrl+D | as before |
| REG-RB | `render-budget` and `context-hygiene` suites in G47-1 | green |

**R47-Doc:** doc 044 exists, follows `TEMPLATE.md`, Georgian, matches the code, has the §4.9 table and the stage list; doc 043 differs from its snapshot on **l.4 only**, with the exact T3 text.

### 4.8 Gates and frozen suites

**G47-1:** tsc 0; vitest = **1364 + the new `it` count**, 0 failures (record `node.exe`; re-run a timed-out file alone and report both runs); build passes; Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218, 1 info.

**G47-2:** protected 4/4 OK; 395 OK; `ArrangementTransport.tsx` = snapshot; `git status --short` = §3.2; HEAD at the start and at the end.

**G47-3:** anonymous `/studio-lab`, directly and via the header link, in a **fresh** browse state: no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, no `Authorization` header from workspace code; media only the 2 demo MP3s and `blob:`; anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, a fake Bearer gets no token; `/studio/middle-east` shows "Sign in required". **Known and allowed:** the root `GET /api/cart`; GA consent-denied events; GTM; dev-module requests; the homepage hero image from `images.unsplash.com`; Google Fonts.

**Frozen suites** (A self-check, C G47-1): the two new files; `gesture-reentry`; `gesture-guard`; `track-layout`; `render-budget`; `context-hygiene`; `selection`; `model`; `view`; `ArrangementContext.test.ts`; `fader-guards`; `delete-selection-ui`; `all-lane-clipboard`; `floating-video`; `detail-panel-polish`; `export-dialog-focus`; `ssr-layout-effect`.

**Not re-run this round** (not PASS): video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression.

### 4.9 Ableton source and compliance (workflow addendum 2026-10-11)

Source: Live 12 Reference Manual, chapter 6 "Arrangement View", sections **6.7 Moving and Resizing Clips**, **6.9 Selecting Clips and Time**, **6.10 Using the Editing Grid** — `https://www.ableton.com/en/live-manual/12/arrangement-view/#using-the-editing-grid`, fetched by B with gstack browse on **2026-10-16 07:43 UTC**, text in `b-round-46/ableton-6.7-6.10-20261016.txt`; shortcuts chapter 42.5/42.13 in `b-round-37/ableton-live-keyboard-shortcuts-20261013.txt` (fetched 2026-10-13). No video was watched; no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Moving a clip snaps to grid lines | 6.10 "the cursor will snap to grid lines"; 6.7 "Clips snap to the editing grid" | **Confirmed** (text) | same, while Snap is on | R47-SNAP |
| Grid = meter subdivisions of the song tempo | 6.10 | **Confirmed** | **Deliberate difference until SRW-15:** seconds divisions (10 … 0.1 s) because CZABA has no BPM until the user enters one (SRW-15 rule) | R47-UI, GM1 |
| Snap on/off toggle, Ctrl+4 | 6.10; 42.13 "Snap to Grid Ctrl 4" | **Confirmed** | toggle exists; shortcut **G** (Chrome/Edge reserve Ctrl+1…9 for tabs; purchased CZABA Studio already uses G) — deliberate difference | UI-3, UI-4, GS11 |
| Grid spacing shown "above the time ruler" | 6.10 | **Confirmed** | division select in the ruler header cell (top-left of the ruler) | UI-1 |
| Zoom-adaptive vs fixed grid (Ctrl+5), narrow/widen (Ctrl+1/2), triplets (Ctrl+3) | 6.10 | **Confirmed** | **Deliberate simplification:** fixed user-chosen division; lines hidden below 6 px; narrow/widen keys → stage 4; triplets → with musical divisions (after SRW-15) | LN-2 |
| Division picked from the track lanes' context menu | 6.10 | **Confirmed** | select now; right-click menu → stage 4 (user also asked for right-click, 07:00) | — |
| Alt bypasses snapping during an action (or enables it when off) | 6.10; 42.5 "Ignore Grid Quantization When Dragging: Alt" | **Confirmed** | stage 2 | — |
| Clips also snap to other clips' edges and locators | 6.7 | **Confirmed** | stage 4 (edges); locators with SRW-16 | — |
| Arrow keys nudge the selection | 6.9 "You can nudge a selection … left and right arrow keys"; 42.5 | **Confirmed** (nudge exists) | with Snap on CZABA nudges to the next/previous grid line; **the Live step size is not stated in the fetched text → unconfirmed**, CZABA decision | R47-NUDGE |
| Grid lines remain while snapping is off | 6.10 "When the grid is off, the cursor does not snap" — says nothing about the lines | **Unconfirmed** | CZABA follows the user (lines visible in free mode, transcript 06:41) | LN-3 |
| Snap/grid settings are not undoable | none found | **Unconfirmed** | CZABA decision: view preference, never in history | GS3, UI-3 |
| Snap starts off | none (Live's default not in the text) | **Unconfirmed** | CZABA decision: keeps today's free behaviour and every existing test | UI-1 |

C gives two verdicts per row (CZABA requirement; Ableton conformance: confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed row.

### 4.10 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:** C-R41-01 (Low, 1024×768, TL-Q-VIEWPORT); C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 + C-R38-01 (Tech Lead; record NUL count/offsets and hydrated U+FFFD `aria-label`s — round 46: 3 NUL at 11729/28025/28026, 64 312 bytes; 1 label). **Note:** this round changes the SSR HTML of `/studio-lab` (the header cell), so byte offsets may move; record them, do not call a move a fix.
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, A-R45-SSR4, **A-R46-RESTORE-SELECTION** (documented limit). **To the Tech Lead:** A-R33-REVIEW-TOUCH (with R38-T).
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS (root/config, 8 sites); DETAIL-RESET-SHRINK (info); ESC-DESELECT-NOTE (record).
- **Root items** (`root-pre-push-review.md` 2026-10-07: nothing open; `publication-checkpoint.json` `round46Checkpoint` = `d2f6715`, both remotes, `release:false`): ARCH-CHECKPOINT-SRW13 (requested in `b-round-45.md` §6; related evidence `docs/technical/studio-independent-reviews/frontend-architecture-pragmatic-2026-10-15.md` at `ca85109` — not confirmed by root as the answer); BIOME-HOOKS-DEPS; GSTACK-ACL; `.kilo/`; `npm run test:e2e:smoke` (root only); SRW-21 (purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset; the homepage SSR `fetch failed` (info); dev-server availability; ENV-BROWSE-DAEMON (reproduced rounds 45–46; fallback works); machine load.
- **Tech Lead manual checks:** R23-1 (incl. the detail scroller), R23-2; R38-T (with A-R38-REVIEW-TOUCH, A-R33-REVIEW-TOUCH); R35-T, R30-T, R31-T, R33-T, R34-T; TL-Q-FB05-FB11, TL-Q-VIEWPORT; **new R47-T:** real mouse drag with Snap on/off and the G key on a Georgian keyboard layout.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-46-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-46-snapshots && for f in ArrangementClip.tsx ArrangementLane.tsx ArrangementTransport.tsx StudioWorkspace.tsx; do cmp -s "$f" "../../../store/app/components/arrangement/$f" && echo "$f same" || echo "$f changed"; done)
npx vitest run app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/gesture-reentry.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
grep -c "useLayoutEffect does nothing on the server" ../tmp/studio-real-loop/r42-vite.err.log
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest. Do not create test files other than the two named in §2.3.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items (G47-1/2, R47-S, R47-U, R47-Doc). gstack `/browse` with a fresh state file under `c-round-47/` (fallback per the header).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-47.md`:** (1) the pre-flight gate, the design-philosopher answers and the §1.4 re-checks; (2) the red run per case, the mutations (a)–(i), the green run; (3) the diff summary per file; (4) the smoke result and the dev-server Δ; (5) the code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on); (6) verbatim command tails incl. `node.exe`; (7) deviations and the §2.4 self-check. Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-47.md` and `c-round-47.json`** (the usual schema). For each ID: PASS, FAIL (with a bug ID) or **not run** (with the reason). Include R47-S, the R47-U mutation table, R47-UI/SNAP/NUDGE/LINES with labelled REAL/SYNTHETIC steps and reads, AU-1 decode numbers, R47-REG, R47-Doc, the Ableton two-verdict table (§4.9), the gates, the C-R23-01/C-R38-01 record and the carried items. `passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 48 — SRW-14 stage 2:** trim edges and time-range selection snap (clip body + lane background), the Alt momentary bypass, range overlay; Ableton rows from 6.7/6.9/6.10 already fetched.
- **Then:** stage 3 (playhead/insert marker, paste, library drop, loop brace), stage 4 (clip-edge snap, right-click division menu, narrow/widen keys), SRW-15 (BPM grid, bars/beats ruler, metronome; musical divisions + R14-G1), SRW-16..20, SRW-21, full regression, T12.
- **Architecture checkpoint (root, parallel, non-gating):** ARCH-CHECKPOINT-SRW13 remains requested; review signals P1–P3 recorded in the backlog.
- **TL-Q-VIEWPORT / C-R41-01** if the Tech Lead puts widths below 1280 in scope; **C-R23-01 / C-R38-01**, **C-R27-01** when the Tech Lead answers.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 47 -StartPhase A` and a higher limit.
