# A — Round 110 report (B-R108-LIB-FOCUS-LOSS, D-29z75)

Status: IMPLEMENTED; code-reviewer done (S1 fixed after Chromium confirmation, S2 test added). Waits for C.

## Deviation from D-29z75 (for B)
- F1 says `partner.focus()`; A ships `partner.focus({ preventScroll: true })`. Reason: reviewer S1, confirmed in Chromium. Plain `focus()` scrolled the overflow-hidden aside by 243 px at the start of the width transition and left it at 1 px. With preventScroll the offset is 0 throughout. Evidence: `a-round-110/probe/scroll-probe-result-before-preventScroll.json` vs `scroll-probe-result.json`; LF11 + m6.

## Start state (verified before any edit)
- HEAD `1fe3ba21bd4e6467d6aa2e869604f948e6b8cc2a`, `git status` empty, frozen list `b-round-109-r110-tree-sha256.txt` 544/544 OK, `ArrangementLibrary.tsx` == B snapshot (`32613fe1`).

## Changed files (end sha256 in `a-round-110/end-hashes.txt`)
| Status | File | sha256 |
|---|---|---|
| M | app/components/arrangement/ArrangementLibrary.tsx | 58103e8d… |
| ?? | app/lib/arrangement/__tests__/library-focus-handoff.test.tsx | a01244b3… |
| ?? | docs/implementation/2026/quarter-IV/095-studio-library-toggle-focus.md | 1e1e45c7… |
| M | docs/implementation/2026/quarter-IV/094-studio-ssr-nul-bytes.md (l.4 only) | 72e561eb… |

End `git status --short --untracked-files=all` = exactly these 2 M + 2 ??. Frozen list re-checked at end: 544/544 OK. No protected file touched. No server was started or stopped.

### ArrangementLibrary.tsx diff vs snapshot (only the allowed parts)
- `react` import: added `type MouseEvent`. New import `useIsomorphicLayoutEffect` from `~/hooks/useIsomorphicLayoutEffect` (placed after the `~/contexts` import for Biome's import order).
- New refs: `libraryExpandButtonRef`, `libraryCollapseButtonRef`, `librarySearchInputRef`, `libraryToggleFocusRef` (`'expand' | 'collapse' | null`). No new state.
- One `useIsomorphicLayoutEffect` without a dependency array. On every render it reads and clears the armed ref. If armed, the partner `isConnected` and `activeElement` is body or `null`, it calls `partner.focus({ preventScroll: true })` (preventScroll added after reviewer S1; see below).
- `changeLibraryCollapsedFromToggle(event, collapsed)` arms only when `document.activeElement === event.currentTarget`, then calls `onCollapsedChange`.
- `clearLibrarySearch(event)`: records whether × had focus, calls `setQuery('')`, then focuses the input if × had focus.
- `preventRepeatedLibraryEnter`: `Enter` + `repeat` → `preventDefault()` (no stopPropagation).
- ◀/▶: `ref`, the new `onClick`, `onKeyDown`. ×: the new `onClick`, `onKeyDown`. Search `<input>`: `ref`. No class, label, title or data-testid changes. The option component, search filtering, `handleSearchKeyDown`, tree, list, separator, resize and preview are byte-identical.

## Commands run and results
| Command | Result |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run lint -- --max-diagnostics=500` | exit 0; 218 warnings + 1 info repo-wide (pre-existing); grep for `ArrangementLibrary.tsx` / `library-focus-handoff` in the log = **0** (`a-round-110/lint.log`) |
| `npx biome check <2 owned code/test files>` (no --write) | clean ("No fixes applied", 0 errors). The test file was formatted through `biome format --stdin-file-path` → stdout. |
| `npx vitest run app/lib/arrangement/__tests__/library-focus-handoff.test.tsx` | 13/13 pass |
| Targeted: `npx vitest run $(cat a-round-110/targeted-list.txt)` | **13 files, 309 tests, all pass** (re-run after the review fixes) (`a-round-110/targeted.log`). The grep gave 12 files (B expected 12 incl. the new one); `self-disabling-focus.test.tsx` was not in the grep and was appended → 13. `floating-video`, `render-budget` and `self-disabling-focus` are included. |
| Full suite / `npm run verify` / build / e2e smoke | NOT run (speed rules; gate) |

## Tests (LF0–LF11, 13 tests)
- LF0 (control): the harness arms the hazard (selected source `song`); Enter on BODY adds +1 clip (context and `[data-clip-id]`). It proves that LF4 can fail.
- LF1 ◀ → ▶ focus; LF2 ▶ → ◀ focus; LF3 × → search input focus (× disconnected, query empty).
- LF4 (separate test): after the focused ◀, ▶ and × clicks, an Enter on `document.activeElement` adds no clip (context count and `[data-clip-id]` count).
- LF5: Play focused, unfocused ◀/▶ clicks → focus stays on Play.
- LF5b: nothing focused (body), ◀/▶ clicks → focus stays on body.
- LF6: library collapsed, Play focused → ⤢ (`arrangement-video-expand`) opens the library, then flushFrames → ⤢ again returns the video and re-collapses; then ⤢ + window Escape. `activeElement` is **Play** after every step; never ◀/▶. Observed: in jsdom `fireEvent.click` does not focus ⤢, so the dock's `floatFocusRef` stays false and its own refocus rule does not fire. In a browser, a mouse click on ⤢ focuses ⤢; C's LF-VIDEO-NEUTRAL covers that.
- LF7: written. A bare host (`ArrangementLibrary` + `ArrangementProvider`, no StudioWorkspace) whose `onCollapsedChange` focuses a host Play button before calling its own setter. Focused ◀ click → focus stays on host Play, not ▶.
- LF8: on the bare host (no workspace window listener, because the workspace itself preventDefaults Space as transport toggle): repeated Enter prevented on ◀, ×, ▶; fresh Enter not prevented; repeated Space not prevented.
- LF9: focused ◀ click → focus ▶ → `keydown Enter repeat:true` on ▶ is defaultPrevented, the library stays collapsed, focus stays on ▶, clip count unchanged. The real hold is left to C's LF-HOLD.
- LF10 (reviewer S2): with the video floating, a focused ◀ click collapses the library, returns the video, and focus is on ▶ (not ⤢, not BODY). It positively asserts the layout-effect vs. dock-cleanup order.
- LF11 (reviewer S1): spies on `HTMLElement.prototype.focus`; the ◀→▶ and ▶→◀ handoffs each call it exactly once with `{ preventScroll: true }`.
- Exact assertions only (`toBe`/`toEqual`); no `as`, no `@ts-`, no `any`.

## Fail-before (scratch `a-round-110/mut/store`, node_modules symlink, Vitest `cacheDir` = `a-round-110/mut/.vite-cache`, `ArrangementLibrary.tsx` = B snapshot)
- **Red:** LF1, LF2, LF3, LF4 (`expected 3 to be 2`, a clip was added), LF8, LF9, LF10, LF11.
- **Green:** LF0, LF5, LF5b, LF6, LF7.
- Matches B §1 exactly (LF0 is an additional control; LF10/LF11 are additional, added after the review).
- Raw: `a-round-110/mut/results/fail-before.json`; driver `a-round-110/mut/mutate.py`; summary `a-round-110/mut/results/summary.json`.

## Mutations (scratch only; control 13/13 green before AND after; the scratch file was restored to the fixed version)
| ID | Mutation (exact string change in mutate.py) | Red |
|---|---|---|
| m1 | `partner.focus({ preventScroll: true })` and `librarySearchInputRef.current?.focus()` → `void …` | LF1, LF2, LF3, LF4, LF9, LF10, LF11 |
| m2 | arm = `collapsed ? 'expand' : 'collapse'` (ignores "had focus") | LF5b (LF5 stays green, as B predicted) |
| m3 | effect condition → `partner?.isConnected && activeElement !== partner` (body/null check dropped) | LF7 |
| m4 | `onKeyDown={preventRepeatedLibraryEnter}` removed from ◀ and ▶ | LF8, LF9 |
| m5 | partner for `'expand'` = the search input ref | LF1, LF4, LF9, LF10, LF11 |
| m6 (extra) | `partner.focus({ preventScroll: true })` → `partner.focus()` | LF11 |
The final run (after the review fixes) meets B's expectation for every mutation. The extra reds (LF9/LF10/LF11 under m1/m5, LF4 under m5) are expected, because those tests assert focus on ▶ or count clips after the dropped handoff.

## Browser self-check (A evidence, NOT C acceptance)
- `cd a-round-110/probe && node ../../b-round-109/probe/lib-focus-probe.cjs` (port 5173, B's file unedited).
- Attempt 1: `locator.focus` timed out waiting for the `demo-middle-east` option (30 s), most likely a dev-server reload right after my edit. A separate debug script (`a-round-110/probe/debug-options.cjs`) then saw all 9 demo options with only the expected cart/connection-refused noise.
- Attempt 2 (console output only; its JSON and 3 screenshots were **overwritten by attempt 3**, so only attempt 3's files remain on disk):
  - collapse: Enter 1 → collapsed, active = `arrangement-library-expand`; Enter 2 → expanded, active = `arrangement-library-collapse`; clips 0 → 0.
  - expand: Enter 1 → expanded, active = collapse; Enter 2 → collapsed, active = expand; clips 0 → 0.
  - clear: Enter 1 → active = `arrangement-library-search`; Enter 2 → unchanged; clips 0 → 0.
  - errors [] (after the noise filter), forbidden requests [].
- Attempt 3 (after the preventScroll fix; the files on disk are `lib-focus-probe-result.json` + `lib-{collapse,expand,clear}-1280x720.png`): identical results to attempt 2, errors [], forbidden [].
- Scroll probe (`a-round-110/probe/scroll-probe.cjs`, 1280×720; Enter on a focused ▶, aside `scrollLeft` sampled every animation frame for 700 ms):
  - before preventScroll: max `scrollLeft` **243 px**, ending at **1 px** (`scroll-probe-result-before-preventScroll.json`). This confirms reviewer S1 as a real visual regression of the first implementation.
  - after: `scrollLeft` **0** in every sample (`scroll-probe-result.json`).

## Code-reviewer (real `code-reviewer` subagent; score 8/10, no Critical)
Its answers to B's three questions: (1) the layout effect cannot steal focus from the video dock. The layout effect runs before the dock's passive cleanup, and video-driven changes never arm. (2) Render count is unchanged (refs only). (3) No held-Enter ping-pong.

| ID | Severity | Finding | Disposition |
|---|---|---|---|
| S1 | Medium | `partner.focus()` without `preventScroll` may scroll the overflow-hidden aside while the width is still 40 px | **Confirmed in Chromium** (scrollLeft 243 → 1 px). **Fixed:** `focus({ preventScroll: true })`; re-measured 0. LF11 + m6 added. |
| S2 | Medium | No positive test of the same-commit race (focused ◀ while the video floats) | **Fixed:** LF10 (red in fail-before, red under m1/m5). |
| S3 | Low | Stale arm if a parent refuses without re-rendering the library; a later video-driven collapse could consume it | Not fixed. It cannot happen with the current `changeLibraryCollapsed`, which always commits. The suggested `isCollapsed` post-condition would not help (▶ exists only when collapsed). Recorded for B as a Low. |
| S4 | Low | LF9's collapsed/clip assertions and LF8's Space lines cannot fail in jsdom; only the `preventDefault` result does work | Accepted. LF9's guard assertion is the oracle (red under m4), and the real hold is C's LF-HOLD. |
| S5 | Medium, out of scope | The library was opened by the video and focus is inside it → Escape returns the video and re-collapses the library → the focused element unmounts → focus drops to BODY and the next Enter adds a clip | **Reproduced by A in Chromium 1440×900** (`a-round-110/probe/s5-probe.cjs`, `s5-probe-result.json`, `s5-{collapse,option}-1440.png`). Focus on ◀ or on the selected option → Escape → active BODY, library collapsed → Enter → clips **0 → 1**. Not fixed: the path goes through the frozen `returnFloatingVideo` and never arms this round's ref; D-29z75 forbids video-driven collapse from moving focus. This is pre-existing by code path; A did not re-run it against the snapshot in a browser. **New candidate finding for B (Medium, same class as B-R108-LIB-FOCUS-LOSS).** |
| S6 | Low nits | ref name, redundant `isConnected`, duplicate LF6 lines, copied harness, test file named after the feature | Kept as is (matches the folder convention; no behaviour impact). |

**Architecture note (verbatim):**
> There are now two copies of the arm-then-layout-effect focus handoff with a repeated-Enter guard (ArrangementTransport.tsx:78-107, ArrangementLibrary.tsx:173-231), and they differ in one structural way: Transport only hands off after confirming the action took effect (`source.disabled`), while the library checks nothing. Keep both inline for now, because extracting a helper before that difference is settled would bake one of the two behaviours into it. Proposal for the planner: a bounded task to add a `useFocusHandoffAfterCommit` hook plus a shared `preventRepeatedEnterKeyDown`, owned by `app/hooks/`, with a required "action took effect" check, migrating both callers with their existing tests (Transport's round-108 tests, library-focus-handoff, floating-video l.710-726, render-budget) passing unchanged.

## Known gaps / not done
- LF-HOLD (real auto-repeat), LF-MOUSE, LF-VIDEO-NEUTRAL with a real mouse ⤢ focus, 1440 viewport, FV-710 in the browser: C's rows; A did not run them.
- B-R107-ENTER-ON-BODY (user question) is unchanged by design.
- Shared focus-handoff helper: not extracted (architecture checkpoint question; see reviewer note).
- Reviewer S3 (Low) goes to B. **S5 (Medium) is reproduced in Chromium (A evidence) and goes to B as a new candidate finding**; it is not fixed this round.

## Exact next C checks
LF-COLLAPSE (1280, 1440), LF-EXPAND (1280, 1440), LF-CLEAR (1280, 1440), LF-MOUSE (1280), LF-HOLD (1280; record whether Playwright emits `repeat` keydowns, otherwise CDP `autoRepeat`), LF-VIDEO-NEUTRAL (1440; record activeElement after each step; ⤢ refocus after ✕ from a float control is the dock's rule), LF-SWEEP-NEG (1280, 1440, `video-focus-probe.cjs` from C's dir), R12-L2-ENTER-ADD, REG-LIB (also check that the aside `scrollLeft` stays 0 during the keyboard ▶/◀ transition; rail 40 px, panel ≥ 288 px, separator ±16 px, Escape in search keeps focus), FV-710 (1440), PX-NET, REG-HYD, G110-3, AN-REVIEW (re-run m1, m2 → LF5b, m4 with C's own strings), T110-TARGETED (13 files), DOC-095 / DOC-094-L4, SOURCE-UNCHANGED (2 M + 2 ??, 544/544).

## B acceptance criteria A can claim
- §1 changes implemented within ownership; fail-before matches; m1–m5 behave as specified; typecheck/lint/biome/targeted green; docs written. All C rows are C's to verify, and the gate rows belong to root.
