# C round 228 — SABA-B-8 CALM-1b (transport tooltips with keys, `aria-keyshortcuts`, one source)

**Verdict: PASS.** browserVerified = realVerified = true. 0 new bugs. Real Chromium (Playwright) on `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720, in fresh anonymous contexts. env-status: store 200 (round 228, attempt 1).
Scripts and evidence are in `c-round-228/`: `c228.cjs` → `out/c228-<vp>.json` plus screenshots; `g228.cjs` → `g/g228.json`; `bbox-after.mjs` → `bbox-after.json`, `geom-after.json`; `unit.log`; `scope-start.txt`.

## Acceptance (CZABA requirement)
| Row | Result | Evidence |
|---|---|---|
| C-SCOPE-228 | PASS | HEAD is `d32464e`. `git status` lists exactly the 12 grants, all `M`, with no `??`. The tree, root-files and A `changed-end` lists give rc 0, and the 5 protected files give `git diff --quiet` rc 0. Hunks against `granted-start` match §0.1. Grants 7–11 contain only R1 swaps, imports and Biome wrapping. Compared with B's `precheck-scratch.diff`, the only extra lines are A's new SC5, ST-K1 and NS5. |
| C-UNIT-228 | PASS | shortcuts, strings, navigation-strings-ui and grid-snap-loop-drop: 4 files, 108/108 green. SC5, ST-K1 and NS5 exist. `grep -c Ctrl/Cmd strings.ts` = 3 (l.655, 656, 685: solo only). |
| C-TITLES-228 | PASS (both vp) | S0: `Play (Space)`, `Back to start (Home)`, `Undo (Ctrl+Z)`, `Redo (Ctrl+Shift+Z)`, `Split at the playhead (Ctrl+E)`, `Delete clip — leaves a gap (Delete)`, `Loop on / off (Ctrl+L)`. Playing: `Pause (Space)`. S2: `Split at both edges of the time selection (Ctrl+E)`, `Loop the time selection (Ctrl+L)`, and the Delete range hint is unchanged. S3: `Undo: Add Marker (Ctrl+Z)`. S4: `Redo: Add Marker (Ctrl+Shift+Z)`. Fit equals the §2.2 literal. The Z, X and Follow titles come from unchanged string entries. |
| C-ARIA-228 | PASS (both vp) | The 7 values match the §2.1 table byte-exactly in S0 to S4. Z = `Z`, X = `X`, footer = `Shift+/`. Fit and Follow have no attribute. Accessible names are unchanged: the bbox keys (aria-label or text) for all 154/156/143/146 elements match round 227 one-to-one. |
| C-PARITY-228 | PASS | In S0, S1 and S3 (with no time selection), the key in each title's last `(…)` appears in the open sheet's row for the 7 buttons plus Z and X: 0 mismatches. Listed only: Snap G, Env A, Marker M, prev/next Ctrl+←/→. All of them match their sheet rows. |
| C-KEYS-228 | PASS | Home: 00:05.000 → 00:00.000 (both vp). Space: plays (0.87 s, Pause), then stops (both vp). At 1440: Ctrl+E split 2→3 clips. Ctrl+Z → 2. Ctrl+Shift+Z → 3. Ctrl+Z → 2. Ctrl+Y → 3. Delete on S1 removes the first clip while the second keeps l=4566.1 (the gap remains). Ctrl+L on S2 sets Loop pressed false→true. Meta variants were not run (Mac manual check; not claimed). |
| C-HOVER-228 | PASS (recorded) | A real-mouse hover of 1.7 s on Undo in S3. Headless Chromium paints **no native tooltip** (`out/<vp>-S3-undo-hover.png`). The DOM title is correct, so C-TITLES stands. |
| C-ROWS-228 | PASS (both vp) | 43/43 rows, 0 mismatches, 0 extra. `fit` = [`Double-click the overview`, `Double-click the ruler (no time selection)`]. The chip is 304×18 with sw = cw. There is no kbd overflow and no x-scroller. |
| C-SEARCH-228 | PASS | `time selection` → [extend-all-tracks, fit]. ruler, menu, split, cut, zzzz and ctrl+e give the same ids as round 227. |
| C-BBOX-228 | PASS | Against `c-round-227/bbox-after.json`: 0 deltas over 1 px in all 4 states (identical element counts). The Undo/Redo boxes stay 112 px. |
| C-BUDGET-228 | PASS | The footer text and line count (2) are identical to round 227 in S0 and S1 at both vp, and the bbox element sets are equal. No granted hunk adds rendered text, only the `title` and `aria-keyshortcuts` attributes (`a-round-228/granted-hunks.diff`), so no other region can change. |
| C-OPEN-228 | PASS | A footer click opens the sheet with focus on Search, and Esc closes it with focus back on the footer button. `?` opens it and Esc closes it. |
| G228-3 | PASS | `/studio/middle-east` shows "Sign in required" with 0 audio. The token API gives 401 with no header and 500 (no token) with a fake bearer. The fresh lab shows the demo badge, and `auth_user` is null. 0 page errors. |
| LAB-SMOKE-228 | PASS | Exported WAV: PCM 24-bit, 48 kHz, stereo, 101.352 s, frameDiff 0. Every segment RMS is identical to round 227. 0 page errors. |
| AN-REVIEW-228 | PASS | l.4 is byte-exact. The SC1–SC5 lists are at l.103 and l.160. `track-layout.test.tsx` is listed. Every cited id resolves (grep: tests, tasks and b-round files). |
| C-REF-228 | PASS | See below. |
| gate | not claimed | Full suite, build, verify and e2e smoke belong to the root gate. |

Neighbours (§6):
- Held Ctrl+L (6 keydowns) gives one toggle and one distinct status.
- One Delete-button click puts focus on `Undo: Delete clip`.
- The long Undo label truncates inside `w-28` (screenshot).
- Sheet Space keyup is untouched (frozen file).

## Ableton conformance (checked separately)
| # | Status | Note |
|---|---|---|
| K1 hover help | **Intentional deviation** (Saba decision 1) | The Live 12 shortcuts page fetched today does not mention tooltips. Info View is Shift+?. |
| K2 key names | **Confirmed**, with a recorded difference | Live ch.42 (fetched 2026-10-28): Undo Ctrl/Cmd+Z; Redo Ctrl+Y (Win) or Cmd+Shift+Z (Mac); Split Ctrl/Cmd+E; Toggle Loop Brace Ctrl/Cmd+L; Space; Home; Delete. CZABA shows `Ctrl+Shift+Z` first for Redo (Saba's example) and keeps Ctrl+Y in aria and in the sheet. Backspace is a CZABA addition that predates this round. |
| K3 Mac modifier | **Intentional deviation** D-29z279 | |
| K4 aria syntax | **Confirmed** (MDN, fetched today) | Space-separated combinations with modifiers first. `Meta` = Command. `Shift+/` follows the "keys pressed, not the result" rule. |

## For B (no bug, observations)
- With a time selection active, the Delete title ends with "…Ctrl+Shift+X" (range hint), not "(key)". The task excludes this state from C-PARITY by design, and C confirmed it; no need to re-probe.
- A's code-reviewer raised a Medium: the "Ctrl" wording drops the ⌘ hint for Mac users in the tooltips. This is B's ruled deviation D-29z279 / K3, so it is not filed as a bug. B may revisit it if Saba wants a "Ctrl/⌘" display form in both the sheet and the titles.
- The A-forwarded architecture notes (no-import guard for `shortcuts.ts`, a structured key model, and SW l.2692 using `studioShortcutAria`) are proposals only.
- The smoke WAV has peak 1.0 and 30 full-scale samples, identical to round 227. This predates the round and is not caused by it.
