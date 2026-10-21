# A — Round 35 report (C-R34-01, C-R34-02) — STOPPED: contract conflict (§1.4)

Date: 2026-10-13 · Implementer: A (Claude Opus 5.5) · Status: **BLOCKED for B ruling — no `store/` file changed**

## Headline

The §1.4 bullet-4 stop condition is hit. The task says: "every existing test that expects … a text field to keep focus, when a range is pressed. **If a frozen test expects that, stop and report.**" One frozen test does exactly that:

- `app/lib/arrangement/__tests__/fader-guards.test.tsx` l.1258–1278, `'review: during an active Pan drag a clip header pointerdown keeps the search focus'` (round 34, one of the 54 frozen tests):
  - `typeInSearch(parts, 'ab')` (search focused) → `fireEvent.pointerDown(pan, { ...press, pointerId: 88 })`;
  - **l.1265 `expect(document.activeElement).toBe(search)`** — observed failing. l.1272 (same assertion after the clip-header pointerdown) would fail likewise — **inferred, not executed** (vitest stops at the first failing assertion).
- Under D-29z §0 row 1 / row "Library search `ab`, then a press on a range → focus leaves the search", the new root capture blurs the search at that Pan pointerdown (search is a typing target, Pan is a range, the gesture is not claimed yet because capture runs before Pan's `onPointerDown`). l.1265 then fails.
- **Confirmed empirically, not just by reading** (scratch copy outside `store/`, see below): with the §2.1 handler applied, `npx vitest run app/lib/arrangement` → **1 failed | 788 passed (789)**; the single failure is exactly this test, `expected <body>… to be <input type="search">`.

The test's intent is the "clip header during an active Pan drag" row; the l.1265 assertion is a jsdom artefact (jsdom never moves focus on pointerdown) that encodes the opposite of D-29z. Resolving it is B's call; I did not edit a frozen line and did not narrow/widen the handler to dodge it.

**Resolution options for B (no recommendation forced; my reading):**
1. Allow A to amend the frozen test minimally: l.1265 → `expect(document.activeElement).not.toBe(search)` (or drop it), and l.1272 likewise (the clip-header pointerdown then sees `body`, so "keeps the search focus" no longer holds; the test's remaining value is "no blur/edit during an active Pan drag", which the new case 10 already covers via Master). The test title would then be stale — B decides whether renaming counts as allowed.
2. Re-scope D-29z to exclude the search field (would contradict B's own contract row and the "search `ab` → Master" C row; not recommended).
3. Keep the handler and re-start the clip-header-during-drag part from a non-text focus (rewrite of a frozen test; B's call).

Everything else is ready: the handler (12 lines + 1 JSX attribute) and the 12 new tests are written and pass in scratch; only the frozen-test ruling blocks landing them.

## 1. Pre-flight gate

- Read before any action: `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `REACT_CONTEXT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`; `prompts/studio-feature.md`; `skills/pre-flight/SKILL.md`; `skills/source-command-check` → `.claude/commands/check.md`.
- **Assumptions:** (1) "range target" = native `input[type=range]` only (`isRangeInputTarget`), not `role="slider"`; (2) blur via `focused.blur()` fires React `onBlur` synchronously, so `commitClipGain('blur')` runs before the range's `onPointerDown` claims; (3) the root div's React capture handler runs before the scroller's capture handler and before any target handler, including for the header Master and the Transport Zoom; (4) the video Volume is the same Lane Volume range on the video track (`Volume — ვიდეოს ორიგინალი ხმა`).
- **Smallest version:** one `useCallback` (~13 lines) + one JSX attribute. No new helper/export.
- **Files:** `StudioWorkspace.tsx` (handler), `fader-guards.test.tsx` (append describe), doc 036 (l.355 + header + append). **None was changed** because of the stop.
- **Success:** new describe red on `b64a2cf6`, green with the handler; all 54 existing fader-guards tests + frozen suites green; tsc 0; build ✓; Biome adds 0 errors. → **Not achievable without a B ruling** (frozen l.1265).

### Baseline (before any action)

```
git rev-parse HEAD → 1cefea18500ac98c523caae6bf9626c811254b9e
git status --short → the same 9 lines as the task baseline
sha256sum -c b-round-34-tree-sha256.txt | grep -vc ': OK$' → 0   (376 OK)
StudioWorkspace.tsx b64a2cf6 · fader-guards.test.tsx 11a19bf6 · 036 e86072b8  (= snapshots)
protected: download-routes.test.ts OK, account.downloads.tsx OK, api.studio-token.ts OK, studio.$productId.tsx OK
tasklist | grep -ci node.exe → 7
```

Root had not committed; no partial A work existed (`a-round-35-result.json` was an empty launcher file).

### §1.4 grep results

- **Root div** (`StudioWorkspace.tsx` l.1316–1319): attributes `className`, `data-lenis-prevent` only — **no** `onPointerDown`/`onPointerDownCapture`. Nothing to merge.
- **Every `claimPointerGesture(` call site** and its `pointerdown` `preventDefault()`:

  | Owner | Site | preventDefault | Notes |
  |---|---|---|---|
  | Clip move/range/trim | `ArrangementClip.tsx` l.224/231 | yes (l.228, before claim) | inside scroller |
  | Loop brace | `ArrangementLoopBrace.tsx` l.64/71 | yes (l.68) | inside scroller |
  | Overview | `ArrangementOverview.tsx` l.169 | yes (l.177, after claim) | outside scroller |
  | VideoDock float drag | `ArrangementVideoDock.tsx` l.760 | yes (l.764) | outside; only when floating |
  | Detail divider | `ArrangementDetailPanel.tsx` l.680 | yes (l.690) + stopPropagation | outside |
  | Lane height handle | `ArrangementLane.tsx` l.414 | yes (l.421) | inside |
  | **Lane background marquee** (missing from B's list) | `StudioWorkspace.tsx` l.917 `handleLaneBackgroundPointerDown` | yes (l.921) | inside scroller; round 34 blurs first → not a loss path |
  | Track Volume / Pan / Master | `ArrangementContext.tsx` l.2128 / 2243 / 2374 via `beginTrackVolumeGesture` (Lane l.636), `beginTrackPanGesture` (Lane l.278), `beginMasterGainGesture` (Master l.157) | **no** (native range) | the only loss path |

  `ArrangementLibrary.tsx` l.559 separator has `onPointerDown` but never calls `claimPointerGesture` → not a gesture owner. **No non-range gesture owner without `preventDefault`** → no second loss path.
- **Native `type="range"` in the workspace:** exactly B's four — `ArrangementLane.tsx` l.582 (Pan), l.626 (Volume, also the video Volume), `ArrangementMaster.tsx` l.147, `ArrangementTransport.tsx` l.189 (Zoom).
- **Frozen tests expecting a typed value refused / a text field to keep focus when a range is pressed:** grep of every test file using `clip-gain-input`, `library-search`, `detail-start`, `detail-end` (`clip-gain`, `delete-selection-ui`, `detail-panel`, `detail-panel-polish`, `fader-guards`, `floating-video`) for range pointerdowns → **one hit: `fader-guards.test.tsx` l.1263/1265/1272** (above). Other range pointerdowns in fader-guards (l.372–881) have no text field focused (range focus or body), so unaffected; the scratch run confirms 0 other failures across all 37 arrangement test files.
- **Fixture coverage:** `mountFaderWorkspace` renders Master, music Pan, music Volume, SFX Volume, **video Volume** (`[data-track-id="video"] input[type="range"]`) and Zoom → all five targets testable in jsdom.

## 2. Red-first and green outputs (scratch only)

Scratch copy: `tmp/studio-real-loop/a-round-35/scratch/` (copy of `store/app` + configs; `node_modules` was a junction to store's, **removed after use**, so the scratch cannot run without re-linking). The proposed describe is in `a-round-35/new-describe.tsx.txt` (12 `it`, appended before the outer `});`, existing 54 tests and helpers untouched; new local helpers `inputByTestId`, `videoVolume`, `libraryCount`, `typeGain`, `gainOfSfx`, `expectCommittedAtPress` because round 34's helpers are scoped inside its own describe).

**Red run** on the snapshot source (sha `b64a2cf6` verified immediately before): `Tests 9 failed | 57 passed (66)` (`a-round-35/red-run.txt`).

| # | Case | Snapshot | Why |
|---|---|---|---|
| 1 | Clip Gain `3` → music Volume | **red** | `undoLabel` null, not `Clip Gain` (no blur in jsdom) |
| 2 | → music Pan | **red** | same |
| 3 | → Master | **red** | same |
| 4 | → video Volume (rendered) | **red** | same |
| 5 | → Zoom (regression) | **red** | same (jsdom; a real browser already commits) |
| 6 | unchanged `0.0` → Volume | **red** (B predicted green) | I also assert the field is released, so the test is not always-green; 0 `Clip Gain` entries holds either way |
| 7 | emptied → Master vs plain-blur control | **red** | field not released / status differs |
| 8 | detail start → Master | **red** | focus not released |
| 9 | search `ab` → Master | **red** | focus not released |
| 10 | must-not, gesture active (owner: **detail separator** `arrangement-detail-separator`, id 41; Master id 42) | green | reachable in jsdom; claim confirmed by `isPointerGestureActive() === true`; after id 41 ends, Clip Gain still focused with `3`, and a later blur commits it (1 entry) |
| 11 | decision 4: search → library option (`[role="option"]`) | green | library option has no pointer handler and does not move focus in jsdom |
| 12 | must-not: focused music Volume → Master | green | |

**Green run with the §2.1 handler** (scratch): new describe 12/12 green; full `app/lib/arrangement`: `Test Files 1 failed | 36 passed (37)`, `Tests 1 failed | 788 passed (789)` — the one failure is frozen l.1265 (`a-round-35/scratch-impl-run.txt`).

**Mutations** (scratch, new describe only, `-t "C-R34-01"`):

| Mutation | Killed by |
|---|---|
| (a) JSX attribute removed | cases 1–9 (9 failed) |
| (b) gesture condition removed | case 10 |
| (c) handler on the scroller instead of the root (it **replaced** round 34's scroller handler, so round-34 behaviour was also off; round-34 tests were not run under this mutation) | 3 (Master), 5 (Zoom), 7, 8, 9 |
| (d) `isRangeInputTarget(event.target)` dropped | 10, 11 |
| (e) `isTypingTarget(focused) \|\| isRangeInputTarget(focused)` | 12 |
| (f) `commitClipGain('blur')` no-op | not run (left for C) |

## 3. Diff summary

`store/`: **no changes** (status 9 lines, 376 OK, three owned files still `b64a2cf6`/`11a19bf6`/`e86072b8`).

Proposed (not applied), `a-round-35/proposed-StudioWorkspace.diff`:
- +15 lines: `releaseTypingFocusBeforeRangePointerDown` `useCallback` after `releaseEditFocusOnTimelinePointerDown` (condition: focused `HTMLElement` && `isTypingTarget(focused)` && `isRangeInputTarget(event.target)` && `!workspaceRef.current.isPointerGestureActive()` → `focused.blur()`; no preventDefault/stopPropagation/status/button filter).
- +1 line: `onPointerDownCapture={releaseTypingFocusBeforeRangePointerDown}` on the root `studio-container` div.
- Round 34's handler, predicates, keydown handler untouched.

Doc 036: not edited (the C-R34-02 l.355 correction is independent and ready to apply, but I kept the round atomic so C's R35-S diff is not split across two dispatches).

## 4. Code review

Not run: no `store/` file was changed (0 files, below the 3-file trigger). It must run in the round that lands the change.

## 5. Command tails

```
git rev-parse HEAD → 1cefea18500ac98c523caae6bf9626c811254b9e (start and end)
sha256sum -c ../tmp/studio-real-loop/b-round-34-tree-sha256.txt | grep -vc ': OK$' → 0 (start and end)
protected 4/4 OK (start and end)
git status --short → 9 lines, unchanged
tasklist | grep -ci node.exe → 7 (start) · 7 (end)
scratch red:   Tests  9 failed | 57 passed (66)
scratch green: Test Files  1 failed | 36 passed (37) · Tests  1 failed | 788 passed (789)
```

Not run in `store/` (nothing changed there, B's baseline stands): tsc, full vitest, build, Biome, browser smoke.

## 6. Deviations and self-check

- **Stopped at §1.4** (frozen-test conflict); §2.1–2.3 not landed in `store/`.
- §2.3 append was done **in scratch, not in `store/`**: the live `fader-guards.test.tsx` still has the 54 tests (sha `11a19bf6`) and the store suite count is still 1247, so no red test lands in the tree.
- Case 6 is stricter than B predicted (red on the snapshot).
- Case 10 owner chosen: the detail separator.
- Scratch copy lives under my `a-round-35/` folder (outside `store/`).
- No acceptance criteria are claimed as passed.

## Next for B / C

- **B:** rule on `fader-guards.test.tsx` l.1265/l.1272 (options above), then re-dispatch round 35. The next A can apply `proposed-StudioWorkspace.diff` + `new-describe.tsx.txt` + the frozen-test amendment B allows, then do doc 036, Biome, tsc, vitest, build and code-review.
- **C:** nothing to verify this round in `store/`. C-R34-01 remains open (Medium) and C-R34-02 open (Low, doc).
- Carried root items unchanged: rounds 31–34 (9 status lines) still ready for root's checkpoint commit; `root-pre-push-review.md` / `publication-checkpoint.json` items as listed in the task §4.8.
