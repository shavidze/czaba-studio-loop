# A round 243 — C-R242-01-FIX (grid-menu focus return to a released edit control)

**No STOP.** No covering test failed. No test is above 50 % of its timeout: the slowest is 2.51 s (`track-group-collapse-ui` UC5, 20 s limit). The slowest new row is GM40 at 0.23 s (15 s limit).

## Start state (§0)
- HEAD = `7e5b23ce4636320d4a4a5087d2bf7565075f49f4`. `git status` was empty before the edit.
- `sha256sum -c --quiet` gave rc 0 on all three lists:
  - the frozen list (`b-round-242-r243-tree-sha256.txt`, 1,102 files);
  - the root list;
  - the grant start hashes.
- I re-ran the frozen-list and root-list checks after the edits: rc 0 on both.

## Changed files (grants 1–3 only)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | `git apply -p1 b-round-242/precheck-scratch.diff`. Two code hunks: <ul><li>**+3:** `if (event.button === 2) { gridMenuPressFocusRef.current = focused instanceof HTMLElement ? focused : null; }`, the first statement after `const focused` in `releaseEditFocusOnTimelinePointerDown`.</li><li>**−4:** the `button === 2` capture block at the top of `handleLaneBackgroundPointerDown`.</li></ul> |
| 2 | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | From the same diff: FR3 rewritten to the D-29z382 contract, and GM40–GM43 appended after GM39. |
| 3 | `docs/implementation/2026/quarter-IV/187-c-r242-01-menu-edit-focus-return.md` | New doc. <ul><li>l.4 is exactly `**სტატუსი:** Completed (C round 243 PASS)`.</li><li>The 7 TEMPLATE headings appear in order.</li><li>It has a Mermaid sequence diagram.</li><li>It cites only GM36–GM43 and FR1–FR4, all of which exist (grep l.984–1170).</li></ul> |

**Scope check:**
- The +/− lines of `git diff HEAD` on grants 1–2 match the lines of `precheck-scratch.diff` exactly (`diff` of the extracted lines gave identical).
- `origin` appears 0 times in the code hunk.
- Final status: `M` on grants 1–2 and `??` on doc 187, with nothing else.

## Checks run (actual results)
- `npm run typecheck`: rc 0.
- `npx biome check` on grants 1–2: 2 files, no fixes.
- `npm run lint`: rc 0 (205 warnings and 1 info, all pre-existing; 0 errors).
- **Covering set** (`b-round-242/covering.txt`): **67/67 files, 1153/1153 tests passed**, 95 s.
  - Log: `a-round-243/covering.log`; JSON: `a-round-243/covering.json`.
  - GM36–GM43 and FR1–FR4 are all green.
- **Mutants**, run on `/tmp/a243-scratch` (made with `git archive HEAD`, outside the repo). Each run used `grid-snap-menu.test.tsx` (47 tests). Logs are in `a-round-243/mutants/`.

  | Mutant | Red rows | Matches §0.2 |
  |---|---|---|
  | MU-LANE-CAPTURE-ONLY | FR3, GM40, GM41, GM42, GM43 (5) | yes |
  | MU-NO-SCROLLER-CAPTURE | FR3, GM36, GM37, GM39, GM40, GM41, GM42, GM43 (8) | yes |
  | MU-PRESS-WINS | GM38 (1) | yes |
  | FIX-CONTROL | 0 (47/47 green) | — |

  The repo `git status` was byte-identical before and after.
- **Playwright** (installed Chromium), against `http://127.0.0.1:5173`.
  - I ran a copy of B's probe: `a-round-243/focus-probe-243.cjs`. Results are in `a-round-243/focus-a243.json` and `focus-a243-fader-rerun.json`, with 15 screenshots `a-round-243/focus-a243*.png`. I did not start or stop any server. Each row used a fresh browser context, so no browser storage state was written and `a-browse.json` was not needed or changed.
  - Attempt 1 of `fader/escape@1440` was environment-invalid: the 120 s wait for `Demo collection ready` timed out on a cold Vite start, the same thing B saw. I re-ran it once with the `^fader$` filter, and it passed at both viewports.

  | Origin | 1440×900 | 1280×720 |
  |---|---|---|
  | Volume fader, Escape | focus on the fader, `:focus-visible` true, outline brass 0.8 solid 1px | same |
  | Volume fader, `0.5 s` | focus on the fader, `:focus-visible` false (mouse) | same |
  | BPM field, Escape | `arrangement-tempo-input`, focus-visible, brass 1px | same |
  | Loop brace, Escape | `arrangement-loop-brace`, focus-visible, brass 1px | same |
  | Marker flag, Escape | `arrangement-marker`, focus-visible, brass 1px | same |
  | Marker editor (info) | BODY, markers 0 → 1 (unchanged; this is B-R242-MARKER-EDITOR-MENU-FOCUS) | same |

  - Event order for the fader: `pointerdown[b2] active=fader` → `out:fader` → `mousedown active=BODY` → `contextmenu active=BODY` → `in:BUTTON` → `out:BUTTON` → `in:fader`.
  - 0 page errors.
  - I did **not** run C-BRACE-KEYS-243 (a) or (b) in the browser. That is C's row.

## code-reviewer (actual subagent run): 8/10, no Critical, High or Medium
None of the Lows is fixed. Each fix is outside the exact-diff grant, and C-SCOPE requires the diff to match hunk for hunk. They are passed to B:
- **A-R243-REVIEW-L1 (Low): stale ref.**
  - Every right press in the scroller writes `gridMenuPressFocusRef`; left presses never clear it.
  - Suggested fix: `gridMenuPressFocusRef.current = event.button === 2 && focused instanceof HTMLElement ? focused : null;`. That clears the ref on every press.
  - The reviewer says this is narrow in real browsers: Menu key and Shift+F10 fire on the focused element, and Ctrl+click and long-press claim a gesture. It is easy to hit in jsdom with a bare `contextMenu`.
  - It agrees with B's D-29z384 "harmless" ruling, but it would remove the whole class of stale values.
- **A-R243-REVIEW-L2 (Low): test gap.** No row checks that the paths with no menu stay unchanged: a right press on a header or the ruler blurs and is never restored. Suggested rows:
  - fader focused, right pointerDown on `arrangement-track-header`, then BODY with no restore;
  - a lane `contextMenu` with no right press, which pins L1.
- **A-R243-REVIEW-L3 (Low): vacuous setup assertion.** GM40–GM42 call `rightPressThenBlur`, which blurs by hand, so their `activeElement === body` setup check can never fail.
  - The final focus-return assertions do depend on the fix; the mutants above confirm this.
  - FR3 is the only row that runs the real release.
  - Suggestion: fire the pointerDown alone and assert BODY before any manual blur.
- **Doc nits, fixed in doc 187 (grant 3):**
  - "the first line" now reads "the first statement after `const focused`";
  - the Ctrl+click wording is narrowed;
  - an unverified hypothesis is added to TODO: a clip rename field that unmounts on blur may behave like the marker editor.
- **Not fixable:** doc 186 l.259–260 still describes the old write site. Doc 186 is frozen, so a pointer to 187 is for B or root.
- **Architecture note (for B and root, not acted on):** signal 3. `StudioWorkspace.tsx` l.576–578, l.1608–1636 and l.1843–1863 were changed in rounds 57, 241 and 242, each time with jsdom focus choreography.
  - The reviewer's verdict is keep for now: it is one lifecycle and one ref.
  - The proposal stays as already parked: a `useGridMenuFocusReturn` hook that owns the open flag, the return target and the press snapshot (ARCH-CHECKPOINT-TEMPO-GRID addendum 8). Its acceptance would be GM11, GM18, GM19, GM35–GM43 and FR1–FR4 passing unchanged.

## Known gaps
- B-R242-MARKER-EDITOR-MENU-FOCUS is unchanged and out of scope. The browser shows BODY and a committed marker at both viewports.
- I did not run the full suite, `verify`, build or e2e smoke. Those are gate rows under the speed rule.
- The purchased route is not touched. Its browser row is BLOCKED because the backend is unavailable in the cloud.

## Exact next checks for C
- **C-SCOPE-243:** compare `git diff HEAD` with `b-round-242/precheck-scratch.diff`, and run `sha256sum -c` on the 1,102-file list and the root list.
- **C-FOCUS-ORIGINS-243:** use C's own recipe for the fader, BPM field, brace and marker flag. Also check that the BPM field shows its committed value after Escape (§6), which A did not measure.
- **C-BRACE-KEYS-243 (a) and (b)** in the browser. Not run by A.
- **C-FOCUS-242-REG:** the Snap toggle, and the fader origin on a clip body.
- **C-MENU-REG-243:** reposition, swallow, choose while playing, header, marquee.
- **C-MARKER-EDITOR-INFO-243, C-BUDGET-243, AN-REVIEW-243, LAB-SMOKE-243** (export sha), and the auth rows.

## B acceptance criteria A actually passed
- §4.1 start state.
- §4.2 apply and doc.
- §4.3 static checks.
- §4.4 covering set: 67 files, 1153 tests.
- §4.5 mutants, exact red rows.
- §4.6 code-reviewer run, with its findings passed on.
- §4.7 Playwright at both viewports, matching the "Scratch fix" column. One environment-invalid attempt was replaced.

All C rows remain for C.
