# A round 300 — STUDIO-LINK-b ("View in store" from the Studio library)

**Status:** implementation complete; handed to C. No STOP condition hit. Attempt 4 resumed the checkpoint from the previous job without reverting or duplicating work.

## Changed files (exactly the 9 §5 grants, each `cmp`-equal to `b-round-299/sketch-<basename>.txt`; re-verified in attempt 4)
1. `app/data/studio-lab-links.ts` (M)
2. `app/components/arrangement/ArrangementLibraryMenu.tsx` (new)
3. `app/components/arrangement/ArrangementLibrary.tsx` (M)
4. `app/lib/arrangement/strings.ts` (M)
5. `app/lib/arrangement/shortcuts.ts` (M)
6. `app/lib/arrangement/__tests__/shortcuts.test.ts` (M)
7. `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` (M)
8. `app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx` (new)
9. `docs/implementation/2026/quarter-IV/220-studio-link-deep-link.md` (M)

`git status --short` lists exactly 9 entries. No protected, route, context, config or package file was touched.

## Checks actually run
**Provenance:**
- **Earlier attempt of round 300, on a prior runner:** claims before and after, lint, the Biome run on the granted paths, the covering set and the mutants. The logs under `a-round-300/` come from that job; they were restored onto this machine.
- **Attempt 4, on this machine:**
  - `cmp` equality of all 9 files, re-checked;
  - `npm run typecheck`, rc 0;
  - the 3 targeted test files;
  - Biome on the 8 granted code paths: "Checked 8 files… No fixes applied" (`a-round-300/attempt4-biome-granted.log`).
- **Prior attempt result files:** every one ended on `usage_limit_reached`. None recorded a STOP or a finding.
- **Not run by A** (gate rows, per the speed rules): build, the full suite, `verify` and `test:e2e:smoke`.

- **Claims before the edit:** identical to `b-round-299/claims-300-output.txt` (`a-round-300/claims-before.txt`).
- **Claims after:** equal to the after-sketch except for the allowed lines: K1 is HEAD, K2 is 9 lines, and K3 is rc 1, failing only on the 7 modified paths (`a-round-300/claims-after.txt`).
- **`npm run typecheck`:** rc 0. It was re-run in attempt 4 on this machine, rc 0 (`a-round-300/typecheck.log`).
- **`npm run lint`:** rc 0, with 205 warnings, all pre-existing. Biome on the 8 granted code paths reports 0 diagnostics (`a-round-300/lint.log`, `biome-granted.log`).
- **Covering set** (`b-round-299/covering-files.txt`), run alone: 114/114 files and 1855/1855 tests. IM24 passed, and no test took more than 50 % of its timeout (`a-round-300/covering-run.log`).
- **Attempt-4 targeted re-run** (new test, `shortcuts.test`, `panel-radius-ui.test`): 3/3 files and 34/34 tests (`a-round-300/attempt4-targeted.log`).
- **Mutants m1–m10** on A's own scratch: every one turned B's listed rows red. m3 made 7 tests fail, which covers VS5, VS5b, VS6 and VS7b (`a-round-300/mutants/summary.txt`).

## code-reviewer (real subagent, attempt 4): no Medium+ regression, score 8.5/10
Passed to B. A did not act on these, because every grant must stay byte-equal to the sketch (§6.4).
- **A-R300-REVIEW-1 (Low):** `ArrangementLibrary.tsx:467-471`. If the source leaves the results while the menu is open, the effect calls `setLibraryMenu(null)` without restoring focus, so focus could fall to BODY. B's §2.3 says the UI cannot reach this state. Neither A nor the reviewer reproduced it, and there is no test for it.
- **A-R300-REVIEW-2 (Low):** `ArrangementLibrary.tsx:365-368`. The anchor uses `event.button === 2` to tell a mouse open from a keyboard open. On macOS, Ctrl+click may report button 0, so the menu would open below the option instead of at the pointer. The menu still works.
- **A-R300-REVIEW-3 (Low):** `shortcuts.ts:200`. The `?` row lists Right-click and Shift+F10 but not the ContextMenu key, which the code also handles.
- **A-R300-REVIEW-4 (Low, tests):**
  - VS5b does not check that the outside pointerdown is swallowed; it only checks that the menu closes and focus returns.
  - Held Enter and Arrow/Home/End have no tests.
  - jsdom does not turn Enter into a click, so VS7 covers Enter closing the menu only indirectly.
  - The reviewer found no vacuous assertions.
- **Info:**
  - `tabIndex={0}` on the `<a href>` is redundant (`ArrangementLibraryMenu.tsx:135`).
  - The ref is written during render, which copies the marker menu pattern (`:36`).
- **Architecture note (proposal for B and root, not acted on):**
  - `ArrangementLibraryMenu` is the third near-copy of the menu shell, after `ArrangementGridMenu` and `ArrangementMarkerMenu` (clamp, outside, resize and blur dismissal, Esc/Tab).
  - The reviewer says keep it this round, and proposes one bounded later task: extract a `useStudioMenuDismiss(menuRef, onClose)` hook and a `clampStudioMenuAxis`, with the existing menu tests unchanged. This matches B-R299-LIBRARY-MENU-DUPLICATION.
  - The menu state stays in `ArrangementLibrary`.

## B acceptance criteria A truly met
- §5: grants are byte-equal and scope is exactly the 9 paths.
- §6.1: covering set green.
- §6.2: typecheck and lint pass.
- §6.3: all 10 mutants red.
- §6.4: reviewer ran, with no Medium+ finding.
- §3.1 unit: VS1–VS8, 21 tests, green.

A ran **no browser rows**. Every §3.2 row and the CLAIMS, SOURCE-SCOPE, DOC-220 and L50-FOCUS rows belong to C.

## Known gaps
- No browser verification by A (C's job). The new-tab and blur behaviour in a real browser is only B's probe evidence until C runs it.
- The reviewer's Lows above are not fixed, because of the byte-equality grant.

## Exact next C checks
- B-MENU, B-NEWTAB, B-KBD, B-CLOSE (a–d), B-SPACE, B-UNMAPPED, B-PREVIEW-PARITY, B-ADD-INTACT, B-SHEET, B-SCREEN-BUDGET (HEAD scratch with its own port and `cacheDir`), B-JOURNEY (mock API on :5199), and G300-AUTH. Run each at 1440×900 and 1280×720 on http://127.0.0.1:5173.
- Then CLAIMS, SOURCE-SCOPE, TYPECHECK, the covering set run alone, mutants m1/m3/m4/m5/m8 on C's own scratch, L50-FOCUS and DOC-220.
- Extra probe from the review: in a real browser, open the menu with Ctrl+click on macOS-like input, and with the ContextMenu key; record where the menu is anchored (REVIEW-2).
