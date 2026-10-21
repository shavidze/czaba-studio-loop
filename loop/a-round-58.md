# A — Round 58 report (D-29z23: G1 click swallow, G6 Follow scroll, GM18–GM20 test gaps)

Implementer: A (Claude Opus 5.5) · 2026-10-18 · No PASS claimed — C verifies.

## 1. Pre-flight gate and baseline

**Pre-flight gate** (posted before the first edit):
- Assumptions: G1 = module-level self-removing one-shot window-capture set armed only on the consume path of `handleOutsidePointerDown`; G6 = new follow-aware scroll handler inside the open-menu effect, predicate written once, `handleTimelineScroll` untouched; GM18–GM20 test-only; servers down → no browser smoke.
- Smallest version: ~30 source lines + 6 tests.
- Files: the 3 owned files + doc 051 (each mandated by §0.4 / §2.2 / §2.5).
- Success: tsc 0, vitest 88/1529, build rc 0, mutations a–h each killed.

Read before the first edit: `rules/read-primitives.md`, primitives AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS (+ DESIGN_TOKENS via hook), `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`, `skills/pre-flight/SKILL.md`.

**Baseline (between 11:44 prompt mtime and 11:49:50 first vitest start, +04; no `date` call in that run): case (A).**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` = exactly the 25 listed paths.
- Frozen list 414 entries, `grep -vc ': OK$'` → 0. Snapshots `SHA256SUMS.txt` 3× OK; `cmp` 3× same.
- `StudioWorkspace.tsx` EOL 1746/1746. Protected 4/4 OK. `node.exe` 9.
- `curl :5173/studio-lab` → **000**, `:5199` → **000**. The orchestrator note said 5173 was running; curl contradicts it. I did not start any server.

## 2. Diff summary (patch: `a-round-58/diff-source.patch`, vs B snapshots, `--strip-trailing-cr`)

| File | Change | EOL after (CRLF / LF) |
|---|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | +28: module-level `armGridMenuDismissClickSwallow(view: Window)` (capture listeners: `click` → preventDefault+stopPropagation+release; `pointerup`/`pointercancel` → `view.setTimeout(release, 0)` once; `pointerdown` → release without touching the event; release clears the timer and removes all four, idempotent) + one call `armGridMenuDismissClickSwallow(window)` after the existing `preventDefault`/`stopPropagation` in `handleOutsidePointerDown`. Nothing else. | 0 / 197 |
| `app/components/arrangement/StudioWorkspace.tsx` | open-menu effect only: `closeGridMenuOnUserScroll` replaces `closeGridMenu` for the scroller `scroll` add/remove. Returns without closing iff `scroller && isPlaying && followModeRef.current === 'on' && (clampedByBrowser \|\| |scrollLeft − autoScrollLeftRef| ≤ FOLLOW_SCROLL_TOLERANCE_PX)` — clamp expression copied from `handleTimelineScroll`. `handleTimelineScroll` unchanged (no shared callback). `resize`/`blur` unchanged. | **1761 / 1761** (0 bare LF) |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | +6 `it` (GM16–GM21) appended inside the first `describe` after GM15; 19 existing `it` and the describe option untouched. 25 `it` total. | 0 / 794 |
| `docs/implementation/2026/quarter-IV/051-studio-lab-grid-menu-dismiss-click-follow-scroll.md` | new, Georgian, §2.5 sections incl. Mermaid sequence, alternatives, armed-while-unmounted note, known-limit note (reviewer #1), Ableton table, round-57 GM3 correction. | 0 / 103 |

No comments, `any`, type assertions, `@ts-ignore`, hardcoded colours; semicolons kept.

## 3. GM16–GM21 (alone durations, 4-file verbose run `a-round-58/menu-durations.txt`)

| ID | Result | ms |
|---|---|---|
| GM16 Snap toggle + Play: dismissing press's `click` returns `false`, `data-snap` unchanged / not playing; next full press works | pass | 220 |
| GM17 (a) pointerdown+pointerup on sfx lane background, flush one macrotask, `click` on Snap toggles; (b) pointerdown only, new pointerdown on Snap, click toggles; `editSnapshot` unchanged in both | pass | 109 |
| GM18 C-R57-01 focus Snap → contextMenu → click `0.5 წმ` → activeElement = Snap toggle | pass | 77 |
| GM19 C-R57-02 focus Snap → contextMenu music (300,200) → bare contextMenu video lane (30,60), same node → Escape → activeElement = Snap toggle | pass | 63 |
| GM20 G7 Export → `dialog` shown → `contextMenu` returns `false`, no menu | pass | 151 |
| GM21 G6 togglePlayback, `data-follow-mode="on"`; anchor = `scroller.scrollLeft` read before scroll; scroll at anchor keeps menu; `scrollLeft = 200` (read back 200) + scroll closes; division `1` | pass | 76 |

- `data-snap` lives on `arrangement-grid-control`, not on `arrangement-snap-toggle`; tests read `gridControl(view).dataset.snap` and press `arrangement-snap-toggle`.
- **jsdom honoured `scroller.scrollLeft = 200`** (readback asserted). The `Object.defineProperty` fallback was **not** used.
- GM20 prints jsdom's `Not implemented: Window's scrollTo() method`. This is baseline noise from the export dialog path: round-57 full vitest had 33 such lines, round 58 has 34 (+1 = GM20). The test passes.

## 4. Mutations a–h (`a-round-58/mutations.txt`, scratch `a-round-58/scratch`, own `vitest.config.mts`, `node_modules` junction)

Command (cwd scratch): `npx vitest run --config vitest.config.mts grid-snap-menu grid-snap-ui gesture-guard --reporter=verbose` (64 tests).

| # | Mutation | Result | Failing tests |
|---|---|---|---|
| a | no arm call | 1 failed | GM16 |
| b | release removes nothing | 5 failed | GM15, GM16, GM17, GM18, GM20 |
| c | only `click` listener added (no pointerup/cancel/pointerdown release) | 2 failed | GM15, GM17 |
| d | scroll add/remove back to `closeGridMenu` | 1 failed | GM21 |
| e | scroll handler returns immediately | 2 failed | GM13, GM21 |
| f | `gridMenuReturnFocusRef.current = null` before `closeGridMenu()` in `chooseGridMenuDivision` | 1 failed | GM18 |
| g | store guard `gridMenuOpenRef.current \|\| !gridMenuOpenRef.current` | 1 failed | GM19 |
| h | `exportOpenRef.current` dropped from the request guard | 1 failed | GM20 |

All restored (`restored=true` ×2). In b and c the extra GM15/GM18/GM20 failures are cross-test leakage of a never-released window set within the same jsdom file — expected under those mutations, not under the real code. No test needed strengthening.

## 5. Smoke

**Not run.** `:5173` and `:5199` returned 000 at the start (11:4x) and end (11:58:48). No gstack/PW probe; no browse state created.

## 6. code-reviewer

The real `code-reviewer` subagent ran on the diff and 4 files. Score 8/10. **No Critical, High or Medium findings.** It confirmed:
- every path removes all 4 capture listeners and clears the timer;
- the pointerdown listener added during the same dispatch does not fire;
- double arming is safe; drag-off and right/middle button paths work; unmount while armed is harmless;
- the scroll predicate gives the same answer as `handleTimelineScroll` in both listener orders;
- no fake-timer leakage across files.

| # | Sev | Finding | Disposition |
|---|---|---|---|
| 1 | Low | While a dismissing press is held, or if its `pointerup` is lost (blur mid-press, no `pointercancel`), the set stays armed until the next pointerdown. A keyboard-activated `click` (Enter/Space) in that window is swallowed once. Doc 051 said "keyboard events are not stopped". | **Doc fixed** (in ownership): doc 051 now says `keydown`/`keyup` are not stopped and lists this as a known limit. **Mechanism → B** (A-R58-REVIEW-HELD-PRESS-KEY-CLICK). Possible guard: release without swallowing when `event.detail === 0`; GM16 would then need `{ detail: 1 }`. Not done, because the spec fixes the mechanism. |
| 2 | Low | The `afterEach` has no window-listener release probe. A future test that ends armed would swallow the next test's first click. All current tests end released. | **→ B** (A-R58-REVIEW-AFTEREACH-RELEASE). Outside §2.2, which allows only the 6 `it`. |
| 3 | Low | On Chrome Android, the tap's `click` can arrive after the `pointerup` + macrotask release, so the dismissing tap may still activate the control under it. | **→ B** (A-R58-REVIEW-ANDROID-TAP-CLICK). Needs a real device. Proposal: for `pointerType === 'touch'`, release only on the click or the next pointerdown. |
| 4 | Info | Trap for future tests: calling `rightClick()` while the menu is open arms the set. An immediate synchronous menu-item click would then be swallowed. | → B, add to the A-R57-REVIEW-MENU-TEST-GAPS list. |
| 5 | Info | GM21 does not drive the real `positionStore` Follow write. In jsdom `scrollWidth − clientWidth = 0`, so the clamp branch and a leftward user scroll are covered only in the browser (MN-FOLLOW). | → B / C (MN-FOLLOW). |
| 6 | Info | Strength: GM16 fails on revert. GM17 guards the release paths. GM18–GM20 guard behaviour from round 57, as the spec intends. Not tested: the `pointercancel` path, and a right-button dismiss followed by a left click. | → B, for the 4b-2 test-gap list. |

**Architecture notes (to B, not acted on):**
- **Scroll classification exists twice:** once in the menu scroll handler and once in `handleTimelineScroll`. The grid-menu region has been changed in docs 046–051. Proposal: one small B task for a pure `classifyTimelineScroll` in `lib/arrangement` with unit tests, used by both listeners. Reviewer verdict: keep it this round, because `handleTimelineScroll` was frozen.
- **The window-level swallow lifecycle owned by `ArrangementGridMenu`** outlives the component. Reviewer verdict: keep it. It is small and self-contained, and extracting it would add plumbing for no gain.
- A full-screen backdrop alternative was considered again and rejected (M6, wheel/scroll targeting).

After the doc edit, doc 051 is still LF; no source or test changed after the gates.

## 7. Command tails (verbatim)

```
$ git rev-parse HEAD                      → 038ed5a45f94596a264c14c4ec834607cb407948
$ git status --short | wc -l              → 26   (25 baseline + ?? docs/…/051-…md)
$ sha256sum -c …r58-tree-sha256.txt | grep -vc ': OK$' → 0
$ protected                               → 4× OK
$ StudioWorkspace EOL                     → 1761 1761
$ npx tsc --noEmit                        → rc 0 (empty output)
$ npx vitest run                          → Test Files 88 passed (88) · Tests 1529 passed (1529) · Duration 51.22s · rc 0
$ npm run build                           → ✓ built in 3.17s · rc 0
$ npx biome check ./app                   → Found 5 errors. Found 218 warnings. Found 1 info.
    errors (format, CRLF baseline): StudioWorkspace.tsx, bug-hunting/auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts
$ npx biome check ArrangementGridMenu.tsx grid-snap-menu.test.tsx → Checked 2 files … No fixes applied. rc 0
$ npx biome lint StudioWorkspace.tsx      → Checked 1 file … rc 0
$ biome format --stdin-file-path=…StudioWorkspace.tsx < sw-lf.tsx → cmp equal ("STDIN FORMAT EQUAL")
$ npm run verify                          → rc 0 on attempt 1 (Test Files 88 passed · Tests 1529 passed · build ✓)
$ tasklist | grep -ci node.exe            → 9 (before vitest, before verify, at end)
$ curl :5173/studio-lab                   → 000 ; curl :5199 → 000
```

Post-doc-edit recheck 12:03: doc 051 103 LF lines, `git status --short` 26 lines, frozen-list failures 0 (`end-state.txt` predates the doc edit, which showed 102).

No `Test timed out` lines in any run. Files: `tsc.txt`, `vitest-full.txt`, `build.txt`, `biome-app.txt`, `biome-app-errors.txt`, `biome-owned.txt`, `biome-sw-lint.txt`, `sw-lf.tsx`, `sw-fmt.tsx`, `verify.txt`, `menu-durations.txt`, `mutations.txt`, `end-state.txt`, `checkpoint.md`.

## 8. Deviations

- **D1:** the orchestrator said the test server was running on 5173; it was not (000 throughout). No server started; smoke not run.
- **D2:** GM17 `editSnapshot` equality is used for "the lane press selected nothing" (stronger than `selectedClipIds` alone: also position, range, clips).
- **D3:** GM16 second-press `fireEvent.click` return value is not asserted (`data-snap` / `isPlaying` are asserted instead), because the button handlers' `preventDefault` behaviour is not part of the contract.
- Nothing else; no file outside §3.1 touched.

## Scope completed / B acceptance

Implemented: §0.1 (D1/D2), §0.2 (S), §0.3 (GM18–GM20), §2.2 GM16–GM21, §2.3 mutations a–h, §2.4 gates, §2.5 doc 051. **Not done:** §2.4 browser smoke (servers down). Browser IDs (MN-DISMISS-BUTTON, MN-REPOSITION, MN-FOLLOW, R57 browser half, 4a carried half, G58-3) remain **not run** — seventh round of browser debt if C also finds the servers down.

## Exact next C checks

1. R58-S: `diff -u --strip-trailing-cr` of the 3 owned files vs `b-round-57-r58-snapshots/`; AST-equality of the 19 old `it` (`asteq.cjs`); swallow scope (only `click` swallowed; `pointerup`/`pointercancel`/`pointerdown` release; all `capture: true`; every path removes all four).
2. R58-U: own-string mutations a–h + extras (j) arm inside the menu, (k) preventDefault on the releasing pointerdown; re-run round-57 a and d1.
3. G58-1/2 gates; 26-line status; frozen 414 OK; protected 4/4.
4. If servers up: MN-DISMISS-BUTTON first (it is the only proof of the `pointerup` + one-macrotask timing assumption), then MN-FOLLOW, MN-REPOSITION, the R57 browser half, §4.7 and G58-3.
