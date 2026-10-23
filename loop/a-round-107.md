# A — Round 107 report (HK held shortcuts, HE held Enter, NZ time-0 refusal, doc 092)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · Task: `current-task.md` (round 107, D-29z72). No commits, pushes, deploys, installs or server starts/stops.

## Scope completed
- **R1 (HK):** in `StudioWorkspace.handleKeyDown`, Ctrl/Cmd+E, Ctrl/Cmd+L, Ctrl/Cmd+Shift+L and Ctrl/Cmd+C now ignore `event.repeat`. `preventDefault()` still runs on every repeat. The Ctrl+C `getSelection()` early return stays before `preventDefault`. Undo/Redo, Ctrl+A and the gesture-refusal branch are untouched.
- **R2 (HE):** the marker `+`, ◀ and ▶ buttons and the detail `მონიშვნა` and `0 dB` buttons prevent a repeated Enter keydown. This is the export-dialog convention; there is no `stopPropagation`.
- **R3:** in the marker name editor, a repeated Enter does `preventDefault` + `stopPropagation` but does not call `settleEditor`. A fresh Enter commits; Escape is unchanged.
- **R4 (NZ):** `export const NUDGE_AT_TIME_START_MESSAGE` lives in `ArrangementContext.tsx`. `nudgeSelectedClip` (single-clip path) compares the clamped target with `clip.start`; when they are equal it announces the constant (updater form on `keyRepeat`) and writes nothing else. The workspace imports the constant and its local copy is deleted.
- **C-R106-03 / doc 092:** the l.4 status now names round 107 and `35112cd`. The A-R104-REPEAT-DRAG status (old l.94) and the round 106 status now read C PASS / published. Added HK, HE and NZ problem entries, the round 107 changed files, the testing section and the TODO.

## Changed files (end sha256: `a-round-107/end-hashes.txt`)
| File | sha256 prefix |
|---|---|
| app/components/arrangement/StudioWorkspace.tsx | e83fa485 |
| app/contexts/ArrangementContext.tsx | 3c02b824 |
| app/components/arrangement/ArrangementMarkerRow.tsx | c7799b9b |
| app/components/arrangement/ArrangementDetailPanel.tsx | 02583893 |
| app/lib/arrangement/__tests__/status-announcement-ui.test.tsx | e540ad73 |
| docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md | 8e4fd333 |

**State checks:**
- HEAD is `35112cd`. The status at the start was empty; at the end it is exactly **6 M + 0 ??**.
- The frozen list checks 536/536 (`sha256sum -c` quiet OK).
- Test l.1–705 are byte-identical to the snapshot (`cmp` OK).
- Every hunk lies inside B's narrow ranges:
  - StudioWorkspace: import l.14, deleted l.150, Ctrl+E l.1761, Ctrl+L l.1780, Ctrl+C l.1804;
  - Context: l.171, and `nudgeSelectedClip` l.1705–1709;
  - MarkerRow: the three header buttons and the editor `onKeyDown`;
  - DetailPanel: the apply and `0 dB` buttons.
- `toggleLoopSelection`, `splitSelection`, `extendRangeToAllTracks`, `copySelection` and the reducer are unchanged.

## Commands and results (actually run)
| Command | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run lint -- --max-diagnostics=500` | exit 0. Repo-wide: 218 warnings + 1 info, all pre-existing. **0** lines in the owned files (grep). |
| `npx biome check <5 owned code/test files>` (no `--write`) | "Checked 5 files … No fixes applied", exit 0 |
| Targeted: `npx vitest run $(cat a-round-107/targeted-list.txt)` | **69 files, 1152 tests, all passed**. The list (69) is identical to round 106's, so there are no extra files. 1152 = 1138 + 14 new (HK1–HK6, HE1–HE4, NZ1–NZ4). |
| Owned file alone | 32/32 |
No frozen test pinned the silent time-0 nudge, so R4 is kept. Full suite and `npm run verify` were not run (they belong to the gate).

## Tests added (append-only `describe` after l.705)
- HK1–HK5 and HE1–HE4, NZ1–NZ4 as specified.
- **HK6** was added for reviewer F1: Ctrl+C, and its repeat, on selected page text are not prevented and add no span.

**Differences from B's literal spec:**
1. **HE1 "a repeated Space on ◀ returns `true`" cannot hold, and this is not caused by this round.** The workspace Space branch (`StudioWorkspace.tsx` l.1699) calls `preventDefault()` for Space on any non-typing, non-slider target, buttons included. So `fireEvent.keyDown` returns `false` for Space on ◀, both at baseline and now.
   - I assert the intended property instead: the button's own handler leaves Space alone. A document-level bubble listener (after React's root, before the window handler) sees `defaultPrevented === false` for a repeated Space on ◀ and `true` for a repeated Enter. Helper: `preventedBeforeWindow`.
   - B spec error; please correct the HE1 wording.
2. NZ4 is Snap on only and compares with the same constant as NZ1 (`toEqual([NUDGE_SNAP_BLOCKED_TEXT])`). B expected it to be green before the fix, and it is.
3. `0 dB` is disabled when `clip.gainDb === undefined`, so the HE4 clip has `gainDb: 0`. In the browser, a fresh clip has `0 dB` disabled; see the HE-CLIPGAIN-RESET section.
4. HK1 asserts the Undo label through `undoLabel` and the transport button `title="Undo: Loop გამორთვა"`. After the hold it also checks: one Undo → enabled and history empty; one separate Ctrl+L → off (one span); one more → on (`Loop ჩართულია.`).

## Fail-before (scratch `a-round-107/mut/`, the 4 code files = B snapshots, final test file)
- Red: **HE1, HE2, HE3, HE4, HK1, HK2, HK3, HK4, NZ1, NZ2, NZ3** (11).
- Green: HK5, HK6, NZ4, SU1–SU6, SK1–SK12 (21).
- This matches B exactly. HK6 is a regression guard and was already correct at baseline.
- Each red failed on its intended assertion, for example:
  - HK1 `[false,true,false,true]`;
  - HK2 three extra `Playhead არჩეული კლიპის შიგნით უნდა იყოს.`;
  - HE* repeated Enter not prevented;
  - NZ* `[]`.
- Logs: `mut/results/fail-before.raw`, `summary.txt`. Pass 1 is in `summary-pass1.txt`.

## Mutations (scratch only; final test file; `mut/mutate.py`)
| ID | Mutation | Red |
|---|---|---|
| control (before/after) | none | — (32/32) |
| h1 | Ctrl+L guard → `!event.repeat \|\| !event.shiftKey` | HK1 |
| h2 | Ctrl+E guard removed | HK2 |
| h3 | Ctrl+L guard → `!event.repeat \|\| event.shiftKey` | HK3 |
| h4 | Ctrl+C guard removed | HK4 |
| h5 | Ctrl+Z also ignores repeat | HK5 |
| h6 | ◀ `onKeyDown` removed | HE1 |
| h7 | `+` `onKeyDown` removed | HE2 |
| h8 | repeated Enter settles the editor | HE3 |
| h9 | `0 dB` `onKeyDown` removed | HE4 |
| h10 | R4 branch removed | NZ1, NZ2, NZ3 |
| h11 | R4 refusal as a plain string on keyRepeat | NZ2, NZ3 |
| h12 | `!event.repeat` guard on the nudge action | NZ3, SK7 |
| h13 | Ctrl+C `preventDefault` moved above the `getSelection` check | HK6 |

**Notes:**
- Ctrl+L and Ctrl+Shift+L share one branch and one guard, so h1 and h3 are split with the two forms shown.
- h11 also reds NZ3: there the first refusal arrives on a repeat, so the following repeat would re-announce. This is stricter than B's expectation and is correct.

## Code-reviewer (actual `code-reviewer` subagent): 8/10, "nothing blocks"
The reviewer had no shell and rebuilt the diff from the snapshots.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| F1 | Low | Ctrl+C `getSelection` early return untested | **Fixed:** HK6 + mutation h13 |
| F2 | Low | R4 returns before the old no-op `applyEdit` + `setRange(null)`, so a time range is now kept on a time-0 refusal | Matches "writes nothing else" and the neighbour path. **Recorded** in doc 092 (NZ entry). No test pins it. Signal for B. |
| F3 | Nit | `target === clip.start` is also true for delta 0 or below 0.5 ms (public API) | B chose the generic comparison. Workspace paths cannot produce it. Recorded in doc 092. |
| F4 | Low (existing) | A clip start that is not a whole millisecond (e.g. 0.0004) takes an invisible sub-ms move before the refusal | Not changed (only if the model allows such starts). Signal for B. |
| F5 | Note | With Snap on, `nudgeSelectedClip` is never called at 0, so NZ4 pins text equality, not R4 | Accepted; that is the spec. |
| F6 | Nit | HK4 precondition could pass vacuously | **Fixed:** `isCollapsed` `toBe(true)` |
| F7 | Nit | NZ4 `.join` | **Fixed:** `toEqual([text])`. The frozen constant name `NUDGE_SNAP_BLOCKED_TEXT` cannot be renamed (append-only). |

**Architecture note (verbatim):**
> The time-start refusal is now owned by both `ArrangementContext.nudgeSelectedClip` (updater form) and the Snap-on branch in `StudioWorkspace.handleKeyDown` (render-time `current.status` check), which is a coupling signal tied to GATE106-S1/S2; keep it for now, because moving it touches the gesture/status reducer invariants. The `if (event.key === 'Enter' && event.repeat) preventDefault()` guard is now copied inline on eight buttons across five files, and Sweep 1 finds about ten more toolbar toggles that need it. The proposal for B is one bounded task: add a shared prop-level guard (or a typed handler constant) to the transport, workspace grid and tempo-row buttons, with HK-style tests for Loop, Snap and Fit; it does not cover reducer or hook shape changes.

### Sweep 1: buttons and held Enter (reviewer). For B, outside ownership; nothing changed.
- **Harmful, no guard:**
  - Transport **Loop** (`ArrangementTransport.tsx:151`): the same toggle and history bug as Ctrl+L. This is the strongest follow-up.
  - Play (`:77`), Split (`:127`).
  - Snap (`StudioWorkspace.tsx:2221`), Env (`:2301`).
  - Follow (`ArrangementTransport.tsx:164`).
  - Fit (`:236`) and Zoom to range (`:207`): these pollute zoom history.
  - Zoom back (`:221`).
  - Metronome (`ArrangementTempoRow.tsx:233`).
  - Video expand/return (`ArrangementVideoDock.tsx:975`).
- **No status, but they toggle or write history:**
  - track and group Mute/Solo (`ArrangementLane.tsx:565/583`, `ArrangementGroupHeader.tsx:247/263`);
  - master mute (`ArrangementMaster.tsx:162`);
  - track and group fold and the detail toggle.
- **Low:** ↤ and the marker flags restart the audio graph during playback on each repeat.
- **Intended or idempotent:** Undo/Redo buttons; ⌫; pan reset; ✕; export dialog; library expand; menus; library rows and preview; the round-107 buttons.

### Sweep 2: modifier branches (reviewer)
- `handleKeyDown` modifier branches are now consistent:
  - guarded: E, L, Shift+L, D, C, X, V, G and Alt zoom;
  - repeating on purpose: Z, Y, zoom ±, Ctrl/Alt+Arrow;
  - harmless: Ctrl+A and the gesture refusal.
- **Remaining (Low/Nit, outside ownership):**
  - the group name editor (`ArrangementGroupHeader.tsx:205-211`) calls `settleEditor` on a repeated Enter (Nit; the R3 pattern);
  - a held Escape that cancels the marker editor lets repeats return an expanded floating video (Low, existing);
  - Home has no guard and restarts the graph during playback (Low).

## A browser self-check (evidence, not C acceptance), `a-round-107/browser/`
Real Chromium (Playwright), `:5173/studio-lab`, fresh context per run. Script: `a107-self.cjs` (helpers copied from C's kr106).

| Row | 1280×720 | 1440×900 |
|---|---|---|
| HE-MARKER-ADD (hold Enter on `+` 1+6; editor open and focused, 0 markers, Undo unchanged; type Intro + Enter → 1 marker «Intro») | pass | pass |
| HE-MARKER-PREV (hold 1+10 → the text once; separate Enter → once more) | pass | pass |
| HK-CTRL-L (range 3→12 s with Snap on, Ctrl+L created; hold 1+10 → `aria-pressed` false at all 11 samples, one span, `Undo: Loop გამორთვა`; Ctrl+Z → true; separate Ctrl+L → false with one span; screenshot `a107-ctrl-l-*.png`) | pass | pass |
| NZ-TIME0 (press; hold 1+30; separate press → exactly one time-start span each; clip and Undo unchanged; same `<output>`) | pass | pass |

- Every counted session had 0 console errors, 0 hydration warnings, 0 forbidden requests and 0 Authorization headers.
- The very first marker-add attempt hit a Vite dependency re-optimisation on first load ("Invalid hook call", duplicate React chunk). That is environmental; it is kept as `a107-marker-add-1280x720-attempt1-vite-reopt.json` and the row was re-run clean.
- The code is unchanged since these runs; only the test file and the doc changed afterwards.

### HE-CLIPGAIN-RESET: B spec correction (measured in real Chromium, 1280×720)
- On a **freshly added clip, `0 dB` is disabled** (`disabled=true`, input `0.0`; `a107-gain-reset-1280x720.json`).
- After typing 1 + Enter it is enabled. One click on `0 dB` sets the gain to 0 (`Clip Gain: Middle East — საჯარო preview — 0.0 dB.`), and the button is **disabled again**: the model stores 0 as no `gainDb`.
- So `Clip Gain უცვლელია: 0.0 dB.` cannot be produced from this button in the browser. B's row as written cannot run. The HE4 jsdom fixture uses `gainDb: 0`, which the UI never produces.
- **Reachable scenario, measured with the fix:** gain 1 dB, focus `0 dB`, hold Enter 1+10. Result: exactly one span `Clip Gain: Middle East — საჯარო preview — 0.0 dB.`, input `0.0`, the button ends disabled, Undo label `Undo: Clip Gain` (one entry), 0 errors (`a107-gain-reset-one-1280x720.json`).
- **Caveat:** in this flow the button disables after the first click, so the repeats would be harmless even without R2. The browser cannot independently prove R2 on `0 dB`; HE4 and h9 cover it in jsdom.
- **Proposed C setup:** the reachable scenario above, PASS = one `Clip Gain: … — 0.0 dB.` span and nothing else.

## Known gaps
- HE1's Space clause differs from the literal spec (see above, B spec error).
- HE-CLIPGAIN-RESET is unreachable as written (B spec error; corrected setup above).
- F2 (range kept on a time-0 refusal) is not pinned by a test.
- The sweep findings (transport Loop button and others) are open signals for B.
- Not run: the full vitest suite, build and `npm run verify` (gate).
- Browser rows not self-checked: HK-CTRL-E, HK-CTRL-SHIFT-L, HK-CTRL-C, HK-UNDO-STILL-REPEATS, HE-MARKER-NEXT, HE-CLIPGAIN-RESET, HE-DETAIL-APPLY, NZ-MOVES, NZ-SNAPON-SAME and the regression rows. These are C's.

## Exact next C checks
Run all §2 rows of `current-task.md`:
- **Browser:** HK-CTRL-L (1280, 1440), HK-CTRL-E, HK-CTRL-SHIFT-L, HK-CTRL-C, HK-UNDO-STILL-REPEATS, HE-MARKER-PREV (1280, 1440), HE-MARKER-NEXT, HE-MARKER-ADD (1280, 1440), HE-CLIPGAIN-RESET (use the corrected setup: gain 1 dB first; see the section above), HE-DETAIL-APPLY, NZ-TIME0 (1280, 1440), NZ-MOVES, NZ-SNAPON-SAME, KR-NUDGE-NEIGHBOUR, SR-REPEAT-SPACE, HD-BLOCKED-HOLD, SR-TEXT-REG, PX-NET, REG-HYD, G107-3.
- **Offline:**
  - AN-REVIEW: re-run h1, h5, h8, h10 and h12 with your own strings; note the HE1 Space clause and HK6/h13.
  - T107-TARGETED: expect 69 files / 1152 tests.
  - DOC-092.
  - SOURCE-UNCHANGED: compare the end hashes above.
- **Gate rows** (not claimed): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED.

## B acceptance criteria A truly passed
- §1 code R1–R4 within ownership.
- Tests HK1–HK5, HE1–HE4 (with the HE1 Space clause asserted as described), NZ1–NZ4 green.
- Fail-before matches B's expected list.
- h1–h12 red as specified (h11 also reds NZ3).
- SU1–SU6 and SK1–SK12 unchanged and green.
- typecheck, lint, biome and the targeted list all pass.
- Doc 092 items done.
- Code-reviewer run and addressed.

C's browser acceptance is **not** claimed.
