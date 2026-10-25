# B round 162 → round 163 planning (D-29z128)

Author: B · Date: 2026-10-25 · Next task: `current-task.md` (round 163, V-3c-3a) · Archive of the completed task: `tasks/round-162.md` (sha256 `e6acddcc…a929816`, an exact copy)

## 1. What I read (as data)
- **Loop files:** `current-task.md` (round 162), `a-round-162.md`, `c-round-162.md` (verdicts and AN-REVIEW), `c-round-162.json`, `gates/gate-round-162.json`, `gates/round-162/review.md`, `context/active-summary.md` (head and grep), `b-round-161.md`, `b-next.json`.
- **Backlog, by ID only:** VISUAL-A `v3c_plan_d29z126`/`v3c2_plan_d29z127`, C-R154-02, GATE139-EMPTY-VIDEO-FORMATTER, Q-V3-ICON-SIZE, ARCH-CHECKPOINT-V3C, ARCH-R161-ICON-RECIPE, ENV-FIRST-LOAD-LUCIDE.
- `regression-last.json` (2026-10-24, so the next regression is due 2026-10-27) and `user-review/` (no decision files).
- **Source, read-only, at `9a83018`:**
  - `ArrangementVideoDock.tsx` l.1–35, l.57–59, l.795–830, l.955–1005;
  - `ArrangementDetailPanel.tsx` l.1130–1150;
  - `ArrangementMarkerRow.tsx` l.705–740;
  - `ArrangementGridMenu.tsx` l.190–250;
  - `StudioWorkspace.tsx` l.2190–2202 and l.2610;
  - the `strings.ts` glyph lines;
  - the test lines that mention the glyphs.
- `visual-direction-a.md` § „იკონები“.
- **Advisor:** the configured advisor tool was available and was consulted before writing. Its points were applied: a fresh baseline count, the float-guard grep before the probe, the split, a fresh probe, and the d6 rename.

## 2. Backlog changes, from independent evidence only
- **Round 162 → `c_pass_published`.**
  - C's report has `browserVerified=true` and `realVerified=true`, 0 bugs, and 12 passed rows. The only blocked row is the backend-only fake-Bearer 403.
  - Gate 162 published `9a83018` on both remotes. Its verify passed: 171/171 files, 2543/2543 tests, build OK.
  - **V-3c-2 → მზადაა.**
- **Closed by C's explicit closure evidence:**
  - C-R154-02: no U+25A3; the group name renders in Instrument Sans only.
  - GATE139-EMPTY-VIDEO-FORMATTER: the placeholder text is exact, and LG2 is green.
- **New deferred Lows** (gate reviewer suggestions 1 and 4 and A's reviewer notes; 2026-10-23 rule): REVIEW-R162-STATIC-CN-DEAD-TEXT, REVIEW-R162-REPLACE-NOOPS, REVIEW-R162-STALE-GLYPH-DOCS. The list now has 224 entries; 2 more are now closed.
- **New signals, not scheduled:**
  - INFO-R162-CLIP-SVG-DOM (reviewer suggestion 2: measure later);
  - INFO-C162-VIDEO-INPUT-MULTIPLE (pre-existing `isMultiple=true`).
- **Q-V3-ICON-SIZE gains `note_d29z128`:** `gap-0.75`/`gap-1.25` are off the `--spacing` step scale (reviewer suggestion 3, not a bug), and V-3c-3a puts a 10 px icon in a 24 px button.
- **ARCH-CHECKPOINT-V3C:** still unanswered. The round-162 architecture note was "none".
- `backlog.json` version is now 152. The pre-revision copies are in `b-round-162/`.

## 3. Decision for round 163: V-3c-3a
**Why:**
- It follows from `tasks/round-162.md` §7 (C PASS row: V-3c-3, split if the grants exceed about 12).
- The regression is not due.
- No Critical, High or Medium finding is open, and no user decision has arrived.

**Split (scope unchanged; only the order is set):**
- The full V-3c-3 inventory is about 13 grants.
- The dock is the only part with gesture and focus risk, so **V-3c-3a = the dock** (6 grants + doc 132).
- **V-3c-3b = round 164:** marker row ◀▶, detail Expand/Collapse, grid ✓, and `← CZABA`. Its inventory with line numbers is in `v3c3a_plan_d29z128.v3c3b_inventory`. B probes it at the next planning.

**Probe** (`b-round-162/v3c3a-probe.cjs` → `out/v3c3a-probe.json` + 6 png): 3 states × 2 viewports.
- Glyphs: ⤢ 10×15, ⠿ 8.80×15, ✕ 10.06×15 at 12 px, in fixed 24×24 buttons.
- A 10×10 svg swap moves nothing: **0.000 px** for every keyed element, and the svg is centred exactly.
- The `before` arrays are C's DOCK-STATES-BOX baseline.

**Pointer guards:** `handleFloatPointerDown` uses `Element` + `closest()`, so it is SVG-safe and no `pointer-events-none` is needed. Mutation m177 checks that LVD2 would catch a guard that reads the target directly.

**d6:** 1 contrast-key rename, 0 collisions (`b-round-162-r163-d6-key-renames.json`).

**Vitest base:** 8 files, **197/197** at `9a83018`. The tree was clean afterwards.

### Rulings (user-vetoable; in `feature-status.md` and `backlog.json`)
- **R1:** R2'' size (`size-2.5`, stroke 2.4). `VIDEO_FLOAT_BUTTON_CLASS` stays byte-identical.
- **R2:**
  - `GripVertical` for the handle;
  - `Maximize2` for expand (spec), **in both states** because the old glyph did not change (`Minimize2` is the alternative for Saba);
  - `X` for close.
- **R3 (SG):** "Esc or ✕ brings it back" → "Esc or Close brings it back", matching the close title `Close (Esc)`.
- **Smallest honest behaviour:** icons only. No change to labels, titles, focus, gestures or surfaces.

### Ableton
Not applicable. This is a CZABA brand decision, and Live has no comparable video dock; no parity claim is made.

## 4. Neighbour risks and the rows that cover them
- Float drag, handle focus and no drag from actions → FUNC-SMOKE-DOCK and LVD2.
- Esc and close focus return → FUNC-SMOKE-DOCK and the focus suites in the vitest list.
- Library re-collapse sentence → FUNC-SMOKE-DOCK and LG3.
- Expanded playback → FUNC-SMOKE-DOCK (real video `currentTime` and audio tap).
- Boxes → RV1-V3C3A and DOCK-STATES-BOX.

## 5. Architecture checkpoint
- No new request. `b-round-160-checkpoint-request.md` is still pending; it already carries ARCH-R161-ICON-RECIPE. Round 162's note was "none".
- The StudioWorkspace grant in V-3c-3b is a one-line children change and is not a structural signal.
- The checkpoint is still needed before V-3c-4. Without an answer by then, fallback (c) applies.

## 6. Completion status
**CONTINUE.** Still open:
- V-3c-3a/3b, V-3c-4/5, M1/M3/M4, RV-1/2/3/5;
- the deferred Low polish;
- T12-ADVANCED and the final regression;
- the awaiting_user items, SRW-21 (deferred_user), and the Tech Lead manual checks.

The regression round is due at the planning on or after 2026-10-27. Nothing needs external input to continue.

## 7. Ready for commit
- Round 162 is already published by root (`9a83018`).
- Round 163 starts from a clean tree.

## 8. Artifacts
- **Root files:**
  - `current-task.md`, `tasks/round-162.md`;
  - `b-round-162-r163-{grants,new-files,tree-sha256,granted-start-sha256}.txt`;
  - `b-round-162-r163-vitest-base.txt`, `b-round-162-r163-d6-key-renames.json`.
- **`b-round-162/`:**
  - `r163-granted-start/`, `v3c3a-probe.cjs`, `out/` (probe JSON and png, `vitest-base-r163.json`), `tools/` (copies of C's helpers and `d6.cjs`), `update-backlog.py`, `checkpoint.md`;
  - pre-revision copies of `backlog.json`, `b-next.json` and `feature-status.md`.
