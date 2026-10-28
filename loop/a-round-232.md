# A round 232: SABA-B-8 CALM-3 (Overview empty state + Ctrl+Alt+O, GATE229-S2)

## STOP: needs a B ruling on L32 timeout headroom (pre-existing; not caused by this diff)

**The implementation is complete and green: 12 files, 541/541 covering tests.** This STOP is an L32 headroom ruling on a frozen test (`render-budget.test.tsx`). It is not an implementation stop, and the C round should go ahead in full (the L22 short-round rule does not apply).

`app/lib/arrangement/__tests__/render-budget.test.tsx` › "does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play" has no declared timeout, so vitest's default 5,000 ms applies.

| Run | Time | % of 5,000 ms |
|---|---|---|
| Gate 231 `verify.log` (full suite) | 1,749 ms | 35 % |
| A, covering set (32 files) run 1 / run 2 / final | 2,670 / 2,790 / 2,594 ms | 53 / 56 / 52 % |
| A, the file alone (×2) | 1,459 / 1,451 ms | 29 % |
| **Control:** the covering set with the 5 app grant files swapped back to HEAD (mutant-style, restored, hashes checked) | 2,574 ms | 51 % |

- Under the same load, the HEAD app code is also above 50 %. So the lost headroom comes from load or this machine, not from the CALM-3 diff.
- Under L32, the higher time (A's) decides. That makes it a STOP at the top of this report.
- The file is frozen (not granted), so I changed nothing in it.
- The test passes in every run. B's ruling options:
  - accept it as an environment variance;
  - grant a `{ timeout }` on that describe in a later round;
  - split the test.

Logs: `a-round-232/covering-run.log`, `covering-run-2.log`, `covering-run-final.log`, `render-budget-alone.txt`, `baseline-swap/covering-at-head-app.log`.

Every other item in this round is implemented and green. The tree is in its final, consistent state.

**Ask for B:** accept the variance, grant a `{ timeout }` on that describe, or split the test.

## Scope completed
- **Start:** HEAD `e5507ff`, empty status. `sha256sum -c` gives rc 0 on all three start lists (tree, granted-start, root files).
- **§2.1** `strings.ts`: `overviewHidden` and `overviewShown`, directly after `followOn`.
- **§2.2** `shortcuts.ts`: the `overview-toggle` row after `overview-scroll` in `zoom-view`.
- **§2.3** N1 `overview-visibility.ts`: the same pattern as `library-notice.ts` (in-memory value first, server `false`, `'1'` written / key removed, silent try/catch, listeners).
- **§2.4** `ArrangementOverview.tsx`:
  - `data-overview-state`, and a conditional `bg-background` / `bg-transparent`;
  - child 0 is either the byte-identical OV1 overlay or the baseline;
  - frame and playhead get `invisible` when empty.
- **§2.5** `StudioWorkspace.tsx`:
  - the `useSyncExternalStore` read (server snapshot `false`);
  - the `aria-hidden` h-16 slot;
  - the Ctrl/Cmd+Alt+O branch after the floating-video Escape branch, with the repeat and gesture guards, AltGraph ignored and code-based matching. It adds no history entry and does not move focus.
- **§2.6** `ArrangementVideoDock.tsx`: the caption row loses `justify-between gap-2`.
- **§2.7** tests:
  - the grant fixes, exactly as in `precheck-tests.py`;
  - ST-C3 and SC-C3;
  - N2: OV-E1, OV-E2, OV-T1, OV-T2, OV-T4, OV-T5;
  - N4: OV-T3.
- **§2.8** doc 180:
  - l.4 is byte-exact `**სტატუსი:** Completed (C round 232 PASS)`;
  - the 7 TEMPLATE headings are in order;
  - the cited ids exist (grep: 1 file each).

The app hunks are B's reference (`b-round-231/precheck-scratch.diff`), applied with `patch -p0`. The sketch N2 was overwritten by the real N2.

## Changed files (exactly 8 M + N1–N4)
- **M:**
  - `app/components/arrangement/ArrangementOverview.tsx`
  - `app/components/arrangement/StudioWorkspace.tsx`
  - `app/components/arrangement/ArrangementVideoDock.tsx`
  - `app/lib/arrangement/shortcuts.ts`
  - `app/lib/arrangement/strings.ts`
  - `app/lib/arrangement/__tests__/strings.test.ts`
  - `app/lib/arrangement/__tests__/shortcuts.test.ts`
  - `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx`
- **??:**
  - `app/lib/arrangement/overview-visibility.ts`
  - `app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx`
  - `app/lib/arrangement/__tests__/overview-visibility-persist-ui.test.tsx`
  - `docs/implementation/2026/quarter-IV/180-calm-3-overview-empty-toggle.md`
- **Note on grant 8:** Biome's formatter folds the new, shorter literal onto the `className:` line, so the entry goes from 2 lines to 1. The string is exactly B's literal; there is no other change.
- **Evidence:** `a-round-232/changed-end-sha256.txt` and `a-round-232/granted-hunks.diff` (12 files; start copies or HEAD as the base, new files against /dev/null).
- **End state:**
  - the frozen list (`b-round-231-r232-tree-sha256.txt`) gives rc 0;
  - the root files give rc 0;
  - `git diff --quiet HEAD` on the protected auth, purchase and download files gives rc 0.

## Tests actually run
- `npm run typecheck`: rc 0 (re-run after the last test edit).
- `npm run lint`: rc 0. The repo has 205 warnings and 1 info elsewhere; `biome lint` / `biome check` on the 11 owned code and test paths shows **0 diagnostics** and the format is clean.
- **Covering set** (`b-round-231/covering-files.txt`, 32 files including N2 and N4): **32 files, 541 tests passed**, three times, the last after the reviewer fixes (`covering-run-final.log`, 58.4 s).
  - **L40 grep:** `arrangement-overview|arrangement-video-dock|data-overview-state` in test files finds 0 hits outside the covering set.
  - The only test above 50 % of its timeout is the render-budget test in the STOP above.
  - Other slow tests: track-group-collapse UC5 at 3.7 s and UC1 at 3.2 s, both under a 20 s limit.
  - **N2 per-case times** (L31 budget 2.5 s): the slowest is OV-E1 at about 0.33 s (final run).
- **Shuffle:** N2 and N4 with `--sequence.shuffle` pass, 7/7, twice (seeds 1793212939922 and 1793213667211).
- **Mutants** (`a-round-232/mutants/*.log`; the script restores each file and checks its hash):

  | Mutant | Result | Test that turned red |
  |---|---|---|
  | MU-1 (`hasClips` inverted) | red | OV-E1, OV-E2 |
  | MU-2 (AltGraph guard dropped) | red | OV-T2 |
  | MU-3 (repeat guard dropped) | red | OV-T2 |
  | MU-4 (server snapshot = `readOverviewHidden`) | red | OV-T3 (N4) |
  | MU-5 (`'0'` written instead of removing the key) | red | OV-T1, OV-T5 |
  | MU-6 (`null` instead of the slot) | red | OV-T1, OV-T5 |
  | MU-7 (status strings swapped) | red | OV-T1, OV-T5 |
  | MU-8 (`invisible` dropped from the frame) | **green**, as expected: browser-only | — |
  | MU-9, extra (pointer-gesture guard dropped; reviewer L1) | red | OV-T2 |
- **Browser self-check** (Playwright Chromium against the running :5173; no server was started or stopped):
  - `a-round-232/browser/probe-calm3.mjs` is an unchanged copy of B's probe; the output is `browser/scratch.json` plus the screenshots.
  - Its **440 measured values are identical to B's `probe-scratch/scratch.json` (0 differences)**: the empty state, the 1 px baseline, frame and playhead hidden, the slot bbox, status text, focus, persistence after reload, first clip and Undo, the sheet search, and 0 page errors.
  - The first attempt timed out, probably while Vite was recompiling after the edits (a hypothesis; C may hit the same transient first-load timeout); a plain page load then rendered, and the re-run passed.
  - No `a-browse.json` state was needed, because the probe uses fresh contexts.

## code-reviewer (real subagent)
The verdict was no Blocker and no Medium, score 8.5/10. Five Lows:
1. **The pointer-gesture guard was not tested.** Fixed in N2: OV-T2 now claims a gesture through `claimPointerGesture`, and MU-9 proves the case red.
2. **OV-T5's `getItem` spy only matters when OV-T5 runs first**, because the in-memory value wins after any earlier test. The `setItem`/`removeItem` assertions prove the write path. I removed the redundant `mockRestore`. Not fully order-independent; listed as a known gap.
3. **N4 silenced `console.error` across the client render too.** Fixed: the spy now covers only `renderToString`.
4. **The repeat case did not check that the default was prevented.** Fixed: it now checks that `fireEvent` returns `false`.
5. **AltGraph reporting in Firefox (Windows/macOS) is unverified.** This is a hypothesis, not a confirmed defect. Proposal: TLM-R232-MAC should also try Firefox.

**Architecture note** (forwarded to B; no action outside the grants):
- **Keep.** The 18-line keydown branch and the second external-store read in `StudioWorkspace`. Both are already covered by `b-round-231-checkpoint-request.md`.
- **Keep for now.** The two storage helpers (`library-notice.ts` and `overview-visibility.ts`) have different shapes (a per-collection Set versus one boolean). Both call `getItem` on every workspace render until the first write; this is cheap but worth a look at the checkpoint.
- **Proposal.** The roughly 90-line `Fake*` audio and mount scaffold is duplicated across N2, N4 and other workspace tests. It is a candidate for one bounded test-helper task (related to ROOT-RECON-GRID-HARNESS). The helper must never call `setOverviewHidden` at module load.

## Known gaps
- **MU-8** (`invisible`), the visual empty state, the focus ring on the empty Overview, and the hydration flash are browser-only. They belong to C rows C-OVERVIEW-EMPTY and C-TOGGLE-PERSIST.
- **TLM-R232-MAC** (Cmd+Option+O on a real Mac) cannot run in the cloud.
- **OV-T5 depends on test order** (reviewer L2). N2 never reaches the throwing `getItem` path: the in-memory value wins after the first `afterEach`. What OV-T5 proves is the write path (`setItem` and `removeItem` throw, and the toggle still works in the session). A full fix needs either a test-only reset export (not added, following the CALM-2b precedent) or a case in N4, which is granted for OV-T3 only.
- A toggle in another tab does not update this tab until reload (no `storage` event subscription; the same as the library notice).
- The toggle still fires while a `role="menu"` has focus. The spec does not exclude menus; only `?` does.

## Exact next C checks
- **C-SCOPE-232:** HEAD `e5507ff`, 8 M + N1–N4, and these lists give rc 0: frozen, root, and `a-round-232/changed-end-sha256.txt`. Protected diff rc 0. Compare `granted-hunks.diff` with §2.1–§2.7.
- **C-UNIT-232:** the 32-file covering set, plus N2/N4 with `--sequence.shuffle`. Also rule on the render-budget headroom STOP above.
- **C-OVERVIEW-EMPTY** at both viewports, especially:
  - computed `visibility: hidden` on the frame and playhead (MU-8 is only visible here);
  - the transparent root;
  - the 1 px baseline;
  - the keyboard focus ring > 0 px at ≥ 3:1;
  - no ring on a mouse press.
- **C-OVERVIEW-FIRSTCLIP** and **C-TOGGLE**, including the negative cases: library search, open sheet, Ctrl+O, Alt+O, auto-repeat ≥ 10. **Additional cases:**
  - Ctrl+Alt+O with the Export dialog open does nothing;
  - Ctrl+Alt+O during a pointer drag does nothing.
- **C-TOGGLE-FOCUS** and **C-TOGGLE-PERSIST** (flash measurement), plus **C-UNDO-232**, **C-SHEET-232**, **C-CAPTION-232** (long video name), **C-BBOX-232**, **C-BUDGET-232**, **C-LESSON-232**, **G232-3**, **LAB-SMOKE-232**, **AN-REVIEW-232**, **C-REF-232** and **C-SHOTS-232**.
- **§6 neighbours:** Overview gestures with clips, other Alt/Ctrl window shortcuts, floating video and Escape, render-budget.

## Acceptance (A-side only; C decides the rows)
- **Passed by A:**
  - §4.1 start checks;
  - §4.2 static checks;
  - §4.3 covering set green, with the L32 STOP above;
  - §4.4 mutants (MU-1…7 red, MU-8 browser-only, extra MU-9 red);
  - §4.5 optional browser self-check matching B's scratch;
  - §4.6 code-reviewer run and its Lows handled;
  - §4.7 end state.
- **Not claimed:** every C row, every gate row, and TLM-R232-MAC.
