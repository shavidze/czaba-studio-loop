# CURRENT TASK — Round 49: SRW-14 stage 2 (FB-13) — Snap for trim edges and clip-body time range, Alt momentary bypass/enable; carried GROUP-LANE-REFUSAL-TEXT and LANE-RANGE-OVERLAY-60

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-16
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap).
- Decision record: **D-29z14** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-48.md`.
- Round size: **one feature stage** (stage 2 of SRW-14). Two Low carries go with it because they live in files this round opens anyway: GROUP-LANE-REFUSAL-TEXT (`ArrangementClip.tsx` + a narrow `selection.ts` grant) and LANE-RANGE-OVERLAY-60 (`ArrangementLane.tsx`, one class). C also runs a **bounded stage-1 re-check subset** on the reconciled code (§4.6). That is acceptance, not new scope.

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B's gates (2026-10-16 19:57 +04, `b-round-48/gates-session2.txt`). If it is down, root restarts it. No agent starts or stops it.
>
> **Browse rules** (`backlog.harness_rules`):
> - Never run `$B restart`.
> - Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure, use the approved `server-node.mjs` fallback, started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Record the PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** gstack has no mouse down/move/up. REAL-mouse drags therefore use standalone Playwright (installed chromium, no install), as in round 47. This is a **deviation pending root/user acceptance**. Label it `REAL-mouse (PW)`; never call it gstack.
>
> **Machine load:** `node.exe` was **37** at B's gates. Record `tasklist | grep -ci node.exe` on every A and C run. If a test times out under load, re-run that file alone and report both runs.

## Why this round

**Round 48 result** (`c-round-48.md`, `c-round-48.json`): **C PASS** on R48-S, R48-U (a)–(e), G48-1 (82 / 1387, `npm run verify` exit 0), G48-2 and G48-3. G48-3 was re-run, not just cited: anonymous `/studio-lab` showed the demo badge, the token request got 401, and `/studio/middle-east` showed "Sign in required".
- **Closed:** B-EXPECT-R47-RB.
- **New Low:** C-R48-01, a cold-run timing flake at `render-budget.test.tsx:547` (R9-L2). It is pre-existing and not in this round (§0.7).

**Remote reconciliation by root (after C48)** (`publication-checkpoint.json` → `round48Reconciliation`; `../tmp/studio-remote-reconcile/report.md`, `review-original.md`):
- Root fast-forwarded to the shavidze commit `08b6a5e` (root's fix pass on the round-47 code: integer-ms `snapTimeToGrid`, nudge anchor from `getArrangement()`, select value validated against `GRID_DIVISIONS_SECONDS`, no default `gridSeconds` on lanes, `h-6`/`ring-2` control). Root then added `05e1bc0` (2 retained local assertions + doc 044 round-48 facts).
- Root ran verify **82 files / 1396** and smoke, and an actual reviewer found no blockers. Both remotes were verified by root. B's own `git ls-remote` failed on DNS at 19:57, so the remote state rests on root's evidence.
- **Consequence:** C47/C48 behaviour evidence was taken on the *pre-reconciliation* tree. `grid.ts`, `StudioWorkspace.tsx`, `ArrangementLane.tsx` and both grid tests are different blobs now. §4.6 re-checks the affected stage-1 behaviours on the reconciled code.

**What stage 2 delivers (FB-13, user transcript `2.srt` 05:16–07:53: "clip movement and the play position must follow the chosen grid"; Live 6.10):**
- With Snap on, a **trim edge** and the **time range dragged in a clip body** land on grid lines, like a move does since round 47.
- **Alt** held during a pointer gesture **bypasses** snapping when Snap is on, and **temporarily enables** it when Snap is off (Live 6.10, confirmed text).
- Two old defects in the same files are fixed (the carries).

## Baseline

B verified on 2026-10-16 19:57 +04 (`b-round-48/gates-session2.txt`, `tsc.txt`, `vitest-focus.txt`):
- HEAD **`05e1bc075456c35dde33c1eecbcfc2f676af9ef4`**, `git status --short` **empty**. If HEAD is a newer root commit, report it and continue only if `git diff 05e1bc0 --stat -- app docs` is empty.
- **Frozen list:** `../tmp/studio-real-loop/b-round-48-r49-tree-sha256.txt` → **399 OK** (run from `store/`). It contains every tracked `app/**` and `docs/implementation/**` file except the 5 owned files below.
- **Dispatch snapshots** (`../tmp/studio-real-loop/b-round-48-r49-snapshots/`, `SHA256SUMS.txt` inside; files are CRLF as checked out):

  | File | sha (first 8) |
  |---|---|
  | `grid.ts` | `20a68f5f` |
  | `selection.ts` | `1c2a0e67` |
  | `ArrangementClip.tsx` | `c7db2c27` |
  | `ArrangementLane.tsx` | `e064dbe8` |
  | doc 044 | `03dbf59d` |

- Other checks:
  - protected 4/4 OK; tsc **0**;
  - focused vitest (grid, grid-snap-ui, render-budget, gesture-reentry, gesture-guard, track-layout, selection): **7 files / 131 passed**;
  - full vitest at `05e1bc0`: **82 files / 1396** (root `../tmp/studio-remote-reconcile/root-verify.log`);
  - `/studio-lab` 200.
- **Biome `./app` baseline (B, 19:57, `b-round-48/biome-app.txt`, `biome-app-errors.txt`): 8 errors, 218 warnings, 1 info.**
  - All 8 errors are CRLF-only `format` diagnostics, caused by `core.autocrlf=true` in the checkout (index LF, working copy CRLF; `git ls-files --eol` → `i/lf w/crlf`).
  - The 8 files are `ArrangementClip.tsx`, `ArrangementLane.tsx`, `StudioWorkspace.tsx`, `grid.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`.
  - Working-copy line endings of the owned files: `grid.ts`, `ArrangementClip.tsx`, `ArrangementLane.tsx` and doc 044 are **CRLF**; `selection.ts` is **LF**.
- **Line-ending rule (A and C):**
  - Owned files keep their current working-copy line endings. **Do not run `npx biome check --write` on owned files**, because it would only rewrite EOLs.
  - New files (the test and doc 045) are written LF.
  - A checks format by running `biome format` on an LF copy in scratch (`tr -d ''`); it must report no changes. A also runs `npx biome lint` on the owned files; it must report 0 diagnostics.
  - Diffs against the snapshots use `diff -u --strip-trailing-cr` (C also uses `git diff`, which normalises EOLs).
  - Line-ending churn is a finding. CRLF-only `format` errors on baseline files are not.
- **Before you edit:** confirm HEAD, the clean tree, 399 OK and the 5 snapshot shas. If anything differs, **stop and report**.

**Rules:**
- Do not revert, re-create or reformat anything. Root's reconciled code (integer-ms snap, validated select, `getArrangement()` nudge anchor, named listbox query) stays as it is.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Pure helper — `app/lib/arrangement/grid.ts` (one new export)

`resolveSnapStep(snapSeconds: number | null, gridSeconds: number | undefined, bypass: boolean): number | null`

| `snapSeconds` | `bypass` (Alt) | result |
|---|---|---|
| number | false | `snapSeconds` |
| number | true | `null` (Alt bypasses) |
| `null` | false | `null` (free) |
| `null` | true | `gridSeconds ?? null` (Alt temporarily enables the current division; with no division there is nothing to snap to) |

Nothing else in `grid.ts` changes. The existing exports and their integer-ms behaviour stay byte-identical.

### 0.2 Clip gestures — `app/components/arrangement/ArrangementClip.tsx`

- New **optional** prop `gridSeconds?: number` (default `undefined`). `gesture-reentry`, `gesture-guard`, `track-layout` and `render-budget` render clips without it; they must compile and pass **unchanged**.
- In `handlePointerMove`, the step for every gesture kind is computed once:
  - **move:** `timeLocked ? null : resolveSnapStep(snapSeconds, gridSeconds, event.altKey)`;
  - **trim and range:** `resolveSnapStep(snapSeconds, gridSeconds, event.altKey)`.

  Alt is read from **each** `pointermove`, like Shift. Pressing or releasing Alt without moving takes effect on the next move. Shift time lock on a move still wins: delta 0, no snapping.
- **Move:** the existing round-47 code uses that step instead of `snapSeconds`. Nothing else changes in the move branch, apart from the GROUP-LANE-REFUSAL-TEXT ghost rule in §0.4.
- **Trim** (`trimStart` / `trimEnd`), when the step is a number:
  - requested edge = `snapTimeToGrid(edge + delta, step)`, where edge is `original.start` or `original.start + original.duration`;
  - `trimClipStart` / `trimClipEnd` and their clamping are unchanged; the blocked check (`TRIM_BLOCK_TOLERANCE`) and both blocked texts are unchanged.
  - If the snapped request runs into the source start/end, a neighbour, or the 0.05 s minimum, the edge stops at that limit. The limit may be **off-grid**, and that is the specified result, not a bug. Snapping to clip edges is stage 4.
  - When the step is `null`, behaviour is today's (`roundTime`).
  - Labels, the status after commit and one Undo entry per drag are unchanged.
- **Clip-body range**, when the step is a number:
  - `anchor = clamp(snapTimeToGrid(gesture.anchorTime, step))` and `current = clamp(snapTimeToGrid(gesture.anchorTime + delta, step))`, where `clamp` limits to `[original.start, original.start + original.duration]`;
  - the range is `{ start: min, end: max, trackId }` as today.
  - **Zero width** (both ends on the same line after snapping and clamping): call `setTimeRange(null)`. No range is shown and no status is written. The next move that spans a line shows the range again. This is the smallest honest result: a zero-length "selection" can neither be shown nor acted on.
  - **Click without movement** (below the 3 px threshold) still clears the range and calls `seekTo(gesture.anchorTime)` **unsnapped**. Playhead and insert-marker snapping is stage 3. C records this; it is not a miss.
  - When the step is `null`, behaviour is today's.
- `DRAG_THRESHOLD_PX` and `finishGesture` are unchanged. Snapping is **absolute** (decision F1, §0.6).

### 0.3 Lane — `app/components/arrangement/ArrangementLane.tsx` (two spots)

- Pass `gridSeconds={gridSeconds}` to every `ArrangementClipView` (next to `snapSeconds`, l.868). The lane's own `gridSeconds` prop stays optional with no default (root's F4).
- **LANE-RANGE-OVERLAY-60:** at l.874, change the all-tracks range overlay class `bg-foreground/60` to `bg-foreground/30`. This matches the clip overlay and the detail panel (D-29i design (b)). Nothing else in that element changes.

### 0.4 GROUP-LANE-REFUSAL-TEXT — `selection.ts` (narrow grant) + `ArrangementClip.tsx` group branch

**Defect today** (pre-existing, both Snap states; `c-round-47.md` §5): a group dragged onto another lane, where a member would start **before 0**, is refused with `'out-of-range'`. That refusal's text reads `ჯგუფის ნაწილისთვის ხაზი არ არსებობს — მხოლოდ დრო იცვლება.`, which states the wrong cause, and with Snap on nothing changes at all. The refused ghosts are also drawn at the valid places (planned with the allowed delta).

**`selection.ts` grant — exactly these three spots:**
1. `ClipLaneMoveRefusal` gains `'before-start'`.
2. `CLIP_LANE_REFUSAL_MESSAGES` gains `'before-start': 'ჯგუფის ნაწილი დროის დასაწყისამდე (0) გავიდოდა — ხაზი არ იცვლება.'` (exact text). The other four messages stay byte-identical.
3. In `planClipLaneMove`'s member loop, `trackId === undefined` still returns `'out-of-range'`. A member whose `start < -ARRANGEMENT_EPS` (and whose lane exists) returns `refusedLanePlan('before-start', [anchorPlacement])`. The order of checks is otherwise unchanged.

Nothing else in `selection.ts` changes. `selection.test.ts` is frozen; its l.298 missing-lane case must still give `'out-of-range'`. B grepped for consumers of `ClipLaneMoveRefusal`: there are none outside `selection.ts`, and `CLIP_LANE_REFUSAL_MESSAGES` is used only by `ArrangementClip.tsx`. **Stop and report** if `tsc` or a test shows another consumer; do not widen the change.

**`ArrangementClip.tsx` group cross-lane branch:** when `plan.refusal` is `'before-start'` or `'out-of-range'`, publish **no lane ghosts** (`publishLaneGhosts(gesture, [])`), set `gesture.laneTarget = null` and set the refusal message as status. The time-only preview in the source lanes (`moveClips(… allowed)`) is what the commit will do, so it is the honest picture. For `'overlap'`, `'video-clip'` and `'video-lane'` the branch is unchanged.

The single-clip cross-lane branch is unchanged: a single clip cannot start before 0 and its lane always exists.

### 0.5 Docs

- **New doc 045:** `docs/implementation/2026/quarter-IV/045-studio-lab-grid-snap-stage-2.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Header: date; status `Round 49 — D-29z14; C-ის შემოწმებას ელოდება`; the project. Sections:
  - **კონტექსტი:** FB-13 and stage 2;
  - **მიდგომა:** the Alt table (§0.1); trim snap and its off-grid limit stop; range snap and zero width; click unsnapped; absolute snap (F1) with the reason; the refusal split;
  - **არქიტექტურა:** one Mermaid diagram: pointermove → `resolveSnapStep` → move / trim / range;
  - **შეცვლილი ფაილები**, **პრობლემები და გადაწყვეტები**, **ტესტირება**;
  - **the §4.8 Ableton table**;
  - **TODO:** stages 3–5, the R49-T Tech Lead items.
- **Doc 044** (two spots, no other line):
  - **DOC044-STATUS-LINE:** the whole l.4 becomes exactly the text below. The backticks are literal; copy the text between the indentation.

        **სტატუსი:** Completed — Round 47 C behaviour PASS, Round 48 C PASS (`c-round-47.md`, `c-round-48.md`), commits `08b6a5e`, `05e1bc0`; D-29z12, D-29z13

  - **DOC044-FINDINGS-PATH:** at l.63, replace `` `tmp/studio-real-loop/root-r47-review-findings.md` `` with `` `tmp/claude-cloud-r47-quarantine/tmp/studio-real-loop/root-r47-review-findings.md` ``. That is the only existing copy (reconcile report). Nothing else on the line changes.

### 0.6 B decisions recorded for this round (D-29z14)

- **F1 (absolute snap after the 3 px threshold), Medium, root reviewer:** **accepted as a documented characteristic; code unchanged.**
  - Snap puts the clip start (and now the trim edge and range ends) on the line nearest to the pointer-derived time, which is what the user asked for ("must follow the grid"). Round 47 SN-1 passed on it.
  - A large grid with a small jitter can therefore jump a clip by up to half a division. The move is visible and is one Undo step.
  - A relative or hybrid snap is **not** designed in this round.
  - Tech Lead manual check **R49-T** (real mouse: click-select clips with 10 s and 1 s grids and report any accidental jumps). Reopen only on that evidence.
  - Live's handling of an off-grid clip start is **unconfirmed** (§4.8).
- **Alt and Windows Chrome's app menu:** Chrome on Windows may focus its app-menu button when a lone Alt is released. **CDP-dispatched keys (gstack, Playwright) never reach the browser's accelerator layer, so no headless or automated experiment can answer this.** It is recorded as **unconfirmed** and goes to the Tech Lead as **R49-T** (real Chrome: Alt+drag, release the mouse, release Alt, then press Space → playback toggles and the app menu does not open).
  - No global `preventDefault` on Alt is added: there is no evidence it prevents the menu focus, and it would change browser keyboard accessibility.
  - If the Tech Lead reports the problem, B plans a bounded follow-up.
- **Alt scope:** Alt affects **pointer gestures only** (move, trim, range). Keyboard nudge (ArrowLeft/Right) is unchanged; Alt+Arrow is not handled specially in this round. The G shortcut still ignores Alt (round 47).
- **Lane background:** a drag on the lane background is a marquee and a click there is seek (round 47 LN-4). No lane-background time range exists, so none is snapped. Insert marker and playhead snapping are stage 3. This corrects the "clip body + lane background" wording in the round-47 task and doc 044 TODO; doc 045 states it.

### 0.7 Unchanged / out of this round

**Unchanged (frozen, in the 399 list):**
- `StudioWorkspace.tsx`: the lane already receives `gridSeconds` and `snapSeconds`; no new state or shortcut.
- `ArrangementContext.tsx`, `model.ts` (`trimClipStart`/`trimClipEnd` are called, not edited), `view.ts`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`, `ArrangementLoopBrace.tsx`, the library.
- Every existing test file, including `grid.test.ts`, `grid-snap-ui.test.tsx`, `selection.test.ts`, `render-budget.test.tsx` (named-listbox query) and `clip-gain.test.tsx`.
- Docs 001–043.

**Not this round (scheduled, not deferred):**
- C-R48-01 (Low, frozen `render-budget.test.tsx:547`): next bug/polish batch, or earlier if it reproduces in a root or C gate.
- Stage 3: playhead/insert marker, paste, library drop, loop brace.
- Stage 4: clip-edge snap, right-click division menu, narrow/widen keys.
- SRW-15 (+ stage 5), SRW-16..20, SRW-21, full regression and root review, T12.

**Out of scope for the whole project:** plugins and effects (compressor, limiter, normalise); pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):**
- free trim and free range with Snap off (must be today's behaviour);
- trim blocked texts and limits;
- click-to-seek in a clip body;
- range → Ctrl+Shift+L (all lanes), Ctrl+L loop, Ctrl+Shift+X with a snapped range;
- move with Snap (stage 1, now via `resolveSnapStep`), Shift time lock, group bounds, the cross-lane overlap refusal ghosts;
- Undo atomicity;
- the all-tracks overlay look;
- render cost of a drag;
- SSR/hydration warnings.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short`;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-48-r49-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `(cd ../tmp/studio-real-loop/b-round-48-r49-snapshots && sha256sum -c SHA256SUMS.txt)` against copies, or compare each working file with `cmp`;
   - protected 4/4, Biome numbers, `node.exe`.
3. **Read:**
   - `ArrangementClip.tsx` (all), `grid.ts`, `selection.ts` (l.1–40, l.140–215), `model.ts` `trimClipStart`/`trimClipEnd`;
   - `ArrangementLane.tsx` l.540–560 and l.820–895;
   - `grid-snap-ui.test.tsx` (mount helper, `dragClip`, `stubCapture`, `pressG`), `gesture-reentry.test.tsx` (trim handle lookup);
   - `../tmp/studio-remote-reconcile/report.md` and `review-original.md`;
   - `b-round-46/ableton-6.7-6.10-20261016.txt`.
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.1–§0.4. Code rules:
- no comments, no `any`, no type assertions, no `@ts-ignore`;
- semicolons;
- no reformatting of unrelated lines;
- new exports: only `resolveSnapStep`.

### 2.2 Tests — one new file `app/lib/arrangement/__tests__/grid-snap-edit.test.tsx` (existing test files stay frozen)

- Use the same harness approach as `grid-snap-ui.test.tsx`: mount `StudioWorkspace` under `ArrangementProvider`, copy (do not import) the stubs, and use pointer-capture stubs.
- Trim handles are found by `title="Trim — მარცხენა კიდე"` / `"Trim — მარჯვენა კიდე"`; the range is started on the clip body (`title` starting `drag = დროის მონიშვნა`).
- Pass `altKey: true` on the `pointerMove` events for Alt cases.
- px values assume 40 px/s. If the mounted zoom differs, read it from `arrangement-zoom-readout` and convert, and say so.

| ID | Case | Expected |
|---|---|---|
| SE1 | `resolveSnapStep` all 4 rows of §0.1, plus `(null, undefined, true)` | per table; the last case gives `null` |
| SE2 | Snap off; drag the right trim edge of a clip at 7 (duration ≥ 3 s) by +15 px | end moves by exactly 0.375 s (free, today's behaviour) |
| SE3 | Snap on 1 წმ; fixture clip start 7, duration 2.3, source long enough (end 9.3); drag the right trim edge by +15 px | end = 10.000 (9.675 snapped); one Undo entry `Trim — მარჯვენა კიდე` |
| SE4 | Snap on 1 წმ; left trim edge of a clip at 7.3 with `sourceOffset ≥ 0.6`, drag −10 px | start 7.000; `sourceOffset` reduced by exactly 0.3; one entry `Trim — მარცხენა კიდე` |
| SE5 | Snap on 1 წმ; fixture clip start 7.3, `sourceOffset` 0.25; drag the left trim edge by −40 px (requested 6.3 → snapped 6) | start stops at **7.050** (source start, off-grid limit); status exactly `Trim შეჩერდა: წყაროს დასაწყისი, მეზობელი კლიპი ან მინიმალური სიგრძე (0.05 წმ).` |
| SE6 | Snap on 0.25 წმ; right trim edge so the snapped end would leave < 0.05 s | duration 0.05 (min-length limit), blocked status as today |
| SE7 | Snap on 1 წმ; range drag in the body of a clip at 7–23 from x(7.3) to x(9.6) | range `{start: 7, end: 10}` (each end snapped, within the clip) |
| SE8 | Snap on 1 წმ; range drag that ends beyond the clip end (23) | `end` = 23 (clamped to the clip) |
| SE9 | Snap on 1 წმ; range drag from x(7.3) to x(7.45) (both snap to 7) | `range === null` |
| SE10 | Snap on; click (down/up, < 3 px) in a clip body at x(7.3) | range `null`; playhead/position 7.3 (unsnapped seek) |
| SE11 | Alt bypass: Snap on 1 წმ; drag the clip at 7 by +37 px with `altKey: true` on the moves | start 7.925 (free) |
| SE12 | Alt enable: Snap off, division 1; drag the clip at 7 by +37 px with `altKey: true` | start 8.000; then a drag without Alt by +15 px from 8 → 8.375 (free again; Snap state not changed: `data-snap="off"`) |
| SE13 | Alt on trim and range: Snap on, right trim +15 px with Alt → free (+0.375); Snap off, range with Alt → snapped ends | as stated |
| SE14 | Alt toggled mid-drag: Snap on, start a move without Alt, then a move with Alt, release | the final position is free (the last move wins); exactly one Undo entry |
| SE15 | Shift + Alt on a cross-lane move with Snap off | start unchanged (time lock wins) |
| SE16 | `planClipLaneMove` pure: group whose member would start < 0 on an existing lane | `refusal === 'before-start'`; a missing-lane group still `'out-of-range'`; message map has the exact §0.4 text |
| SE17 | UI group cross-lane, member before 0 (C47 setup: music 7 + stem 0.4 grouped, drag music down one lane by −7.3 s): Snap off and Snap on | status = the `before-start` text; **no** element with `data-ghost-start` in any lane during the move; Snap off: commit = time-only (music 6.6, stem 0.0); Snap on: no change, no history entry |
| SE18 | group cross-lane overlap refusal (unchanged path) | blocked ghosts still rendered (`data-ghost-start` present) and status `აქ ადგილი არ არის` |
| SE19 | all-tracks range (Ctrl+Shift+L after a body range) | the `arrangement-lane-range` overlay class contains `bg-foreground/30` and not `/60` |

**Red/green:** write the tests first and run them against the snapshots (the untouched working copy before your first edit, or a scratch copy outside `store/`) → `a-round-49/red-run.txt`. Expected: SE2, SE10, SE15, SE18 green; SE1 fails on the missing export; the rest red. Explain every difference. Then the green run → `a-round-49/green-run.txt`.

**A's mutations** (scratch copy outside `store/`; remove the `node_modules` junction with `cmd /c rmdir` only; `MSYS_NO_PATHCONV=1`) → `a-round-49/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | trim ignores the step | SE3, SE4 |
| (b) | range ignores the step | SE7 |
| (c) | range anchor not snapped (only `current`) | SE7 |
| (d) | zero-width range kept instead of `null` | SE9 |
| (e) | click seek snapped | SE10 |
| (f) | `resolveSnapStep` ignores bypass | SE11, SE12 |
| (g) | Alt-enable uses a fixed 1 s instead of `gridSeconds` (test SE12 also with division 0.25 → 7.25 for +13 px) | SE12 |
| (h) | move reads `snapSeconds` instead of the resolved step | SE11 |
| (i) | Shift no longer wins over Alt-enable | SE15 |
| (j) | `'before-start'` folded back into `'out-of-range'` | SE16, SE17 |
| (k) | ghosts still published for `before-start` | SE17 |
| (l) | overlay back to `/60` | SE19 |

If any of these survives, strengthen the test (never the code) and report it.

**Test rules:** no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards), no comments; exact strings from the source or rendered output; no snapshot tests; no fake timers.

### 2.3 After the code

- **Self-check:** the frozen suites of §4.7, then the full `npx vitest run` → **82 + 1 = 83 files / 1396 + your new `it` count, 0 failures**.
- **Biome:** follow the §Baseline line-ending rule. Do **not** run `--write` on owned CRLF files. Then run read-only `npx biome check ./app` → **≤ 8 errors, every one a CRLF-only `format` error on a baseline file**; ≤ 218 warnings; 1 info. The new test file and doc 045 must have 0 diagnostics. Run `npx biome lint` on the 4 owned source files → 0.
- **Review:** run the `code-reviewer` agent on the diff (6+ files). If your session cannot spawn subagents, say so; root runs it. Report findings and dispositions. **Architecture notes** go to B (`a-round-49.md` §5), not into the code.
- **Browser smoke** (A; one run; fresh state under `a-round-49/`; not a PASS claim): `/studio-lab` 1440×900 → move `Soft impact` to an off-grid start with Snap off → G → REAL-mouse (PW) drag of its right trim edge inwards by ~−30 px → `data-clip-start` unchanged and the end lands on an integer second (status line or detail panel).
- **`/check`:** `npm run verify` → exit 0. Do not run `npm run test:e2e:smoke` (root only).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.1 only (one new export) |
| `app/lib/arrangement/selection.ts` | A | §0.4 three spots only |
| `app/components/arrangement/ArrangementClip.tsx` | A | §0.2 + §0.4 group-branch ghost rule only |
| `app/components/arrangement/ArrangementLane.tsx` | A | §0.3 two spots only |
| `app/lib/arrangement/__tests__/grid-snap-edit.test.tsx` | A | new (§2.2) |
| `docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md` | A | l.4 and the l.63 path only (§0.5) |
| `docs/implementation/2026/quarter-IV/045-studio-lab-grid-snap-stage-2.md` | A | new (§0.5) |
| `../tmp/studio-real-loop/a-round-49.md`, `a-round-49/` | A | report, gate output, own browse state |
| `../tmp/studio-real-loop/c-round-49.md`, `c-round-49.json`, `c-round-49/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end** (7 paths):
```
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementLane.tsx
 M app/lib/arrangement/grid.ts
 M app/lib/arrangement/selection.ts
 M docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md
?? app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
?? docs/implementation/2026/quarter-IV/045-studio-lab-grid-snap-stage-2.md
```
If root changes something meanwhile, record it as foreign and do not touch it.

### 3.2 Frozen this round

- All **399** files in `b-round-48-r49-tree-sha256.txt`, and everything else under `store/`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase/R2/auth/purchase code;
  - `public/**`, `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and `../tmp/studio-remote-reconcile/**` (root's).
- **Also not allowed:**
  - new dependencies or installs;
  - deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start;
  - starting or stopping the dev server;
  - `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, and 1280×720 where named; fresh load. **Layout L49** = L47:
- the demo video at 0;
- `სრული მიქსი` on music at 7–23;
- `Soft impact` on SFX at 4–6;
- Master 0 dB;
- zoom 40 px/s unless stated (read `arrangement-zoom-readout`).

C may copy its round-47 setup chain into `c-round-49/`.

**Harness rules:**
- **REAL** = `$B click` / `$B press` / `$B type`. Drags are REAL-mouse (PW, labelled; pending deviation GSTACK-NO-MOUSE): `mouse.down` / `move` / `up`, with `keyboard.down('Alt')` / `up` for Alt.
- **SYNTHETIC** (labelled) = dispatched events or `.focus()`. Never use SYNTHETIC events for drag IDs.
- **Reads:** DOM attributes (`data-clip-start`, `data-ghost-start`, `data-range-start/end`, `data-snap`, `data-grid-*`), the status line, the Undo button title, the detail panel time fields. Use `window.__c` only if the setup chain already provides it.
- No source instrumentation. Mutations only in a scratch copy outside `store/`. Record `node.exe` on every run.

**Checkpoint order if the session may end:** G49-2 → R49-S → R49-U → R49-TRIM → R49-RANGE → R49-ALT → R49-GROUP → R49-S1 (stage-1 re-check) → R49-REG → the rest. Write `c-round-49/checkpoint.md` as you go.

### 4.1 R49-S — static (read-only)

- `diff -u --strip-trailing-cr` each owned file against its snapshot (and `git diff`). Changes may appear only where §0.1–§0.5 allow, with no line-ending churn:
  - `grid.ts`: one new export, existing lines byte-identical;
  - `selection.ts`: the three spots;
  - `ArrangementLane.tsx`: one prop line and one class;
  - doc 044: l.4 and l.63 only, both exact.
- `ArrangementClip.tsx`: `finishGesture`, `beginGesture` and `DRAG_THRESHOLD_PX` are byte-identical.
- 399 OK; protected 4/4.
- Banned content in the diff and the new test: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, new component export.

### 4.2 R49-U — unit tests and mutations

- The new file is green. A's red run matches §2.2; otherwise A explains each difference.
- The frozen suites of §4.7 are green.
- C re-runs A's mutations (a)–(l) in its own scratch copy; each must fail its named test. **C extra:**
  - **(m):** `resolveSnapStep(null, g, true)` returns `null` → must fail SE12;
  - **(n):** the trim branch passes the snapped edge **after** clamping, i.e. snaps the clamped result. Use a fixture where the clamped limit is off-grid → must fail SE5 (the edge would leave the source limit). If the clamp-then-snap order cannot be distinguished in a fixture, explain why and substitute an equivalent mutation.

### 4.3 R49-TRIM (REAL-mouse (PW))

| ID | Steps | Expected |
|---|---|---|
| TR-OFF | Snap off; drag the `Soft impact` right edge by −15 px (inwards; the demo SFX source ends at 6) | end = 5.625 ± 0.025; free as before |
| TR-1 | first move `Soft impact` to 4.3 with Snap off (end 6.3); Snap on 1 წმ; drag its right edge by −30 px (requested 5.55) | end = 6.000; one Undo entry `Trim — მარჯვენა კიდე` |
| TR-L | Snap on 1 წმ; on the music clip (7–23), trim the left edge right by ~+0.6 s | start = 8.000, the source offset grows by 1.000 (detail panel); one entry |
| TR-LIMIT | Snap on; trim the `Soft impact` left edge leftwards past its source start | the edge stops at the source start (record the value; off-grid is allowed); the existing blocked status |
| TR-025 | 0.25 წმ; trim either edge inwards by ~0.4 s | the edge lands on a multiple of 0.25 |
| TR-1280 | TR-1 at 1280×720 | same |

### 4.4 R49-RANGE and R49-ALT (REAL-mouse (PW) unless stated)

| ID | Steps | Expected |
|---|---|---|
| RG-1 | Snap on 1 წმ; drag in the music clip body from ~7.3 s to ~9.6 s | range overlay `7.000 – 10.000` (label and detail panel); no history entry |
| RG-CLAMP | drag to beyond 23 s | end 23.000 |
| RG-ZERO | drag from ~7.3 to ~7.45 | no range shown |
| RG-CLICK | click (no move) at ~7.3 | no range; position 7.3 (unsnapped) |
| RG-OFF | Snap off; same as RG-1 | free ends (ms), as before |
| RG-USE | after RG-1: Ctrl+Shift+L, then Ctrl+L, then Ctrl+Z | all-lanes range 7–10 with the `/30` overlay (computed style alpha 0.3); loop brace 7–10; Undo as before |
| AL-1 | Snap on; Alt held; move `Soft impact` by +30 px | free (4.75 ± 0.025) |
| AL-2 | Snap off, division 1; Alt held; move `Soft impact` by about +1.4 s | an integer start; afterwards `data-snap="off"` |
| AL-3 | Snap on; Alt held; trim the `Soft impact` right edge by −15 px | free (ms, not a whole second) |
| AL-4 | Snap off; Alt held; range in the music body | snapped ends |
| AL-MID | Snap on; start a move, press Alt mid-drag, move, release | free final start; one Undo entry |
| AL-FOCUS | after AL-1..4 (released Alt): REAL Space | playback toggles; `document.hasFocus()` true. **Record only:** a CDP key cannot trigger Chrome's app-menu accelerator; the real check is R49-T |

### 4.5 R49-GROUP (REAL-mouse (PW))

| ID | Steps | Expected |
|---|---|---|
| GR-BEFORE | C47 setup (music 7 + stem 0.4 grouped; sfx lane free); drag music down one lane by ~−7.3 s; Snap off, then Snap on | status = the exact `before-start` text; **no** `data-ghost-start` in any lane during the move; Snap off commit: music 6.6, stem 0.0 (time-only, one entry); Snap on: no change, no entry |
| GR-OK | same group, dx ~−0.3 s | ghosts on stems/sfx; lane move committed (as round 47) |
| GR-OVERLAP | a group onto an occupied lane | blocked ghosts shown, status `აქ ადგილი არ არის` (unchanged) |

### 4.6 R49-S1 — stage-1 re-check on the reconciled code (`05e1bc0` + this round)

These IDs passed in round 47 on the pre-reconciliation tree. Re-run them on the reconciled code:
- **SN-1** (integer start);
- **SN-GROUP** (5.000 / 7.700, one entry);
- **SN-LANE** (ghost and final start on the grid);
- **NU-1** (5 / 4 / 3, root's F3 nudge anchor);
- **UI-1** (cell 224 × 28, toolbar 49, the reconciled `h-6` / `ring-2` controls not clipped; measured in the real browser, which nobody has done since root's design pass);
- **UI-5** (select `0.25` → `data-grid-seconds="0.25"`; root's F6 validation: the select offers exactly 7 options);
- **LN-1** (lines every 40 px = 1 s ticks ± 1 px; lanes without `gridSeconds` have no `data-grid-*`, by unit GS15 in G49-1).

**AU-1 must be re-run** (`Soft impact` moved to 6 with Snap on; export decode: onset 6.000 ± 0.010 s, [3.5, 5.99) s below −60 dBFS, RIFF/WAVE 23.000 s). The move branch changes this round (resolved step), so a citation would not cover it.

### 4.7 Gates and frozen suites

**G49-1:**
- tsc 0;
- vitest = **83 files / 1396 + the new `it` count, 0 failures** (record `node.exe`; re-run a timed-out file alone and report both runs; a recurrence of C-R48-01 is recorded under that ID, not as a new bug);
- build passes;
- Biome `./app` read-only: ≤ 8 errors, all CRLF-only `format` errors on the baseline list; ≤ 218 warnings; 1 info. The new files have 0 diagnostics, and `npx biome lint` on the owned source files gives 0;
- **`npm run verify` exit 0**.

**G49-2:** protected 4/4 OK; 399 OK; `git status --short` = §3.1; HEAD at the start and at the end.

**G49-3 (anonymous workspace and purchase protection), fresh browse state:**
- `/studio-lab` direct and via the header link shows the workspace with the demo badge;
- no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code;
- anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401;
- `/studio/middle-east` → "Sign in required".

Known and allowed: the root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Frozen suites** (A self-check, C G49-1): the new file; `grid`; `grid-snap-ui`; `selection`; `model`; `gesture-reentry`; `gesture-guard`; `track-layout`; `render-budget`; `context-hygiene`; `view`; `ArrangementContext.test.ts`; `delete-selection-ui`; `all-lane-clipboard`; `clip-gain`; `detail-panel-polish`; `export-dialog-focus`; `ssr-layout-effect`.

**REG-HYD:** fresh load 1440×900, console for 3 s → no hydration-mismatch, React or `useLayoutEffect` warning. Record the C-R23-01 NUL count and offsets; a move is not a fix.

**Not re-run this round (not PASS):** video sync and C-R27-01 (RF3-1, RF3-2, R5-L6 belong to it); the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root only).

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

**Sources:**
- Live 12 Reference Manual, chapter 6, sections **6.7**, **6.9**, **6.10**: `https://www.ableton.com/en/live-manual/12/arrangement-view/#using-the-editing-grid` (and `#moving-and-resizing-clips`, `#selecting-clips-and-time`). Fetched by B with gstack browse on 2026-10-16 07:43 UTC; text in `b-round-46/ableton-6.7-6.10-20261016.txt`. B re-read that text for this task.
- Shortcuts 42.5 / 42.13 in `b-round-37/ableton-live-keyboard-shortcuts-20261013.txt`.

No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Resizing a clip edge snaps to the grid | 6.10 "the cursor will snap to grid lines"; 6.7 "Dragging a clip's left or right edge changes the clip's length", "Clips snap to the editing grid" | **Confirmed** (text) | same, while Snap is on | R49-TRIM |
| Selecting time inside a clip by dragging its waveform | 6.9 "Clicking and dragging in the clip's waveform … allows you to select time within the clip"; 6.10 cursor snaps | **Confirmed** (text) | range ends snap to lines, clamped to the clip | R49-RANGE |
| Alt during an action bypasses snapping; with the grid off it enables it temporarily | 6.10 "hold down the Alt (Win) … to bypass grid snapping. If the grid is switched off, using the modifier will temporarily enable it"; 42.5 | **Confirmed** (text) | same, for move/trim/range, read per pointermove | R49-ALT, SE11–SE14 |
| Snap also to other clips' edges / locators | 6.7 | **Confirmed** | **stage 4** (edges), SRW-16 (locators). Until then a trim stops at a neighbour/source limit that may be off-grid | TR-LIMIT |
| Bypass while dragging clip **contents** (Ctrl+Alt+Shift) | 6.7 | **Confirmed** | **Not applicable**: CZABA has no slide-contents gesture | — |
| Only the clip bar moves a clip; the waveform selects time | 6.7 | **Confirmed** | same structure (header = move, body = range); unchanged | REG |
| Zero-length selection after snapping | none found | **Unconfirmed** | CZABA decision: no range (§0.2) | RG-ZERO |
| Click in a clip selects a point (insert marker) | 6.9 | **Confirmed** | click → playhead seek, **unsnapped** until stage 3 (deliberate, staged) | RG-CLICK |
| Off-grid clip start under Snap: absolute line vs kept offset | none found | **Unconfirmed** | CZABA decision: absolute (F1, D-29z14) | SN-1 (§4.6) |
| Alt release and the browser menu | n/a (browser behaviour, not Live) | **Not applicable** to Ableton | Tech Lead R49-T | AL-FOCUS (record) |

C gives two verdicts per row: the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed row.

### 4.9 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - C-R48-01 (Low, render-budget :547 cold flake);
  - C-R41-01 (Low, TL-Q-VIEWPORT);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome; C-R27-01 includes the round-3 RF3-1, RF3-2, R5-L6);
  - C-R23-01 + C-R38-01 (Tech Lead).
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, A-R45-SSR4, A-R46-RESTORE-SELECTION, A-R47-GROUP-LANE-DELTA, **F1 (D-29z14)**.
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID (design-philosopher: lines show through video clips); DETAIL-RESET-SHRINK (info); SHIFT-BEFORE-DOWN-NOTE.
- **Root items:**
  - ARCH-CHECKPOINT-SRW13;
  - **ARCH-CHECKPOINT-SRW14-PREFS** (new; `b-round-48.md` §6, wanted before the stage-3 dispatch);
  - GSTACK-ACL / CDP allowlist; GSTACK-NO-MOUSE (pending acceptance); SRW-21; the CRLF Biome errors on the auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load.
  - REMOTE-DIVERGENCE-SHAVIDZE is **closed** on root's `round48Reconciliation` evidence.
- **Tech Lead manual checks:** R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, and **R49-T**:
  1. real-mouse select-clicks with 10 s and 1 s grids (F1);
  2. real Chrome Alt+drag → release Alt → Space plays and the app menu does not open;
  3. trim/range snapping feel.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-48-r49-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-48-r49-snapshots && for f in grid.ts selection.ts; do cmp -s "$f" "../../../store/app/lib/arrangement/$f" && echo "$f same" || echo "$f changed"; done; for f in ArrangementClip.tsx ArrangementLane.tsx; do cmp -s "$f" "../../../store/app/components/arrangement/$f" && echo "$f same" || echo "$f changed"; done)
npx vitest run app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/selection.test.ts app/lib/arrangement/__tests__/gesture-reentry.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest. Do not create test files other than the one named in §2.2.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173` and do not start or stop servers. If it is down, say so and do the offline items (G49-1/2, R49-S, R49-U).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-49.md`:**
1. the pre-flight gate and §1.2 baseline;
2. red run per case, mutations (a)–(l), green run;
3. diff summary per file;
4. smoke result;
5. code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on);
6. verbatim command tails, including `node.exe` and `npm run verify`;
7. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-49.md` and `c-round-49.json`** (the usual schema). For each ID give PASS, FAIL (with a bug ID) or **not run** (with the reason):
- R49-S and the R49-U mutation table, including (m) and (n);
- R49-TRIM, R49-RANGE, R49-ALT, R49-GROUP, with REAL / REAL-mouse (PW) / SYNTHETIC labels;
- R49-S1, stating for each stage-1 ID that it was re-run on the reconciled code;
- AU-1 (re-run, with the decode numbers);
- REG-HYD, G49-1..3;
- the Ableton two-verdict table (§4.8);
- the carried items.

`passed` lists only IDs C ran in this round. State **commit readiness** for root (the 7 paths).

## 7. Next (orientation only; not this round)

- **Round 50 — SRW-14 stage 3:** playhead/insert marker (ruler click/drag, clip-body click), paste position, library drop ghost, loop brace move/resize. Planned after root's answer on ARCH-CHECKPOINT-SRW14-PREFS (edit-preferences slice vs prop plumbing). If that answer is late, B plans stage 3 on the current structure; the checkpoint is non-gating.
- **Then:** stage 4 (clip-edge snap, right-click division menu, narrow/widen keys), SRW-15 (BPM grid, bars/beats, metronome; + stage 5, R14-G1), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, then R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, SETTRACKMIX-NAN-IDENTITY, C-R48-01, then the SRW-21 adapter, full regression and root review, and T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 49 -StartPhase A` and a higher limit.
