# A — round 242: SABA-B-11b-FIX-2 (C-R241-01 focus return after a mouse-opened grid menu)

**No STOP.** No covering test is above 50 % of its timeout. The slowest are UM3 at 3.66 s / 20 s, UC5 at 3.47 s / 20 s and DXM3 at 3.37 s / 20 s. `grid-snap-menu.test.tsx` runs 43 tests in 12.6 s file total, and no row in it is near its 15 s limit.
**For B (ruling needed, not a STOP: pre-existing, not caused by this round, fix outside grants):** A-R242-REVIEW-M1 (Medium, source-confirmed, not browser-verified). See §5.

## 1. Start state (§0) — verified before any edit
- HEAD `04c2a5b4517c70fa2a040fd845c6f257fab24d33`.
- `git status --short --untracked-files=all` == `b-round-241/git-status-at-planning.txt` (14 `M`, nothing else).
- `sha256sum -c --quiet`: start (14) rc 0; frozen tree (1,101) rc 0; grants start rc 0. Root files: `git diff --quiet HEAD` rc 0.
- `git apply --check -p1 b-round-241/precheck-scratch.diff` rc 0.

## 2. Changed files (only the 3 grants)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | Exactly the 3 hunks of `b-round-241/precheck-scratch.diff`, applied with `git apply -p1` (rc 0): <ul><li>`gridMenuPressFocusRef`;</li><li>`handleGridMenuRequest` reads and clears it first, and uses it only when the active element is not an `HTMLElement` or is `body`;</li><li>`handleLaneBackgroundPointerDown` stores the active element on `event.button === 2`, before the existing early return.</li></ul> Nothing else touched. |
| 2 | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | Appended only (same diff): helper `rightPressThenBlur`, GM36–GM39 after GM35. 0 removed lines. |
| 3 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | <ul><li>l.4 = `**სტატუსი:** In Progress (stage 2 of 3; C round 242 PASS)` (byte-checked).</li><li>l.1 title: `# SABA-B-11b — zoom-adaptive grid (ეტაპები 1 და 2a): …`.</li><li>R6 last cell: `ეტაპი 2a (round 241): plain `4` + `G``. R8 last cell: `ეტაპი 2a (round 241)`.</li><li>`ეტაპი 1:` prefix on the `39 ფაილი` line.</li><li>One `**Problem (C-R241-01, Medium, ეტაპი 2a fix-up):**` paragraph (GM36–GM39). After the review it says "BODY or not an `HTMLElement`", to match the code exactly.</li><li>One `## ტესტირება` line (GM36–GM39, MU-NO-PRESS-CAPTURE, MU-PRESS-WINS).</li><li>The `## შეცვლილი ფაილები` stage-2a list gains `grid-snap-menu.test.tsx` (GM36–GM39).</li></ul> The 7 TEMPLATE headings stay in order (`grep -n '^## '`). `grep -n "it('GM3[6-9]"` finds the 4 rows (l.984, 997, 1015, 1034). |

The other 11 round-241 paths were not touched. **Final-state re-check after all edits:** `git status` == the 14 paths of `git-status-at-planning.txt`, `sha256sum -c` on the frozen 1,101 list rc 0, root files `git diff --quiet HEAD` rc 0.

## 3. Checks actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npx biome check` StudioWorkspace.tsx + grid-snap-menu.test.tsx | clean, "No fixes applied" |
| `npm run lint` | rc 0 (532 files; 205 pre-existing warnings, 1 info, no errors) |
| `npx vitest run $(cat b-round-241/covering.txt)` | **61 files / 1,077 tests passed** in 122.5 s (`a-round-242/covering.log`) |
| Mutant MU-NO-PRESS-CAPTURE (capture block deleted), on scratch `/tmp/a242-scratch` | **GM36, GM37, GM39 red**; the other 40 pass (`a-round-242/mu-no-press-capture.log`) |
| Mutant MU-PRESS-WINS: l.1631 replaced by `pressFocus ?? (active instanceof HTMLElement ? active : null)`, the type-correct form of B's `pressFocus ?? active` | **GM38 red**; the other 42 pass (`a-round-242/mu-press-wins.log`) |
| Repo status before and after the mutants | identical (`diff` of `git status --short` is empty) |
| Playwright against `:5173`, with a copy of `b-round-241/focus-probe-242.cjs` (`a-round-242/focus-probe-242.cjs`) | <ul><li>Attempt 1: the 120 s wait for `Demo collection ready` timed out on a cold Vite transform. It is environment-invalid and kept as `a-round-242/shots/focus-attempt1.err`. A status peek afterwards showed the page ready within 5 s.</li><li>Attempt 2: **all 6 cases end on `arrangement-snap-toggle`**, with 0 page errors (`a-round-242/shots/focus-a242.json` and 6 screenshots).</li></ul> |

Playwright detail (attempt 2). Every case ran at both 1440×900 and 1280×720, with a Tab count of 30.
- **Escape:** the active element is the Snap toggle, `:focus-visible` is true, and the outline is `solid 1px` brass at 0.8.
- **`0.5 s`:** the active element is the Snap toggle and `:focus-visible` is false (mouse modality; info under SABA-B-4).
- **`Narrow`:** the same as `0.5 s`.
- **Focus events:** `out:snap-toggle, in:Medium, out, [in:<item>, out], in:arrangement-snap-toggle`. This matches the "Scratch fix" column of B's §0.3.
- **Info:** the probe's `afterRightDown` field (`data-testid || tagName`) reads `BUTTON` (no testid) 100 ms after the right mousedown, not `arrangement-snap-toggle`. On Linux Chromium `contextmenu` fires on mousedown, so the menu is already open and focus is most likely on its `Medium` item (`inMenu` = `Medium`). That is why the blur-to-BODY step does not show as a separate focus event. Not separately verified with a textContent sample.

Not run by A (these are C rows):
- C-FOCUS-CLIP-242 in the browser (A has jsdom GM39 only);
- C-MENU-REG-242, C-2A-SPOT-242, C-BUDGET-242;
- the LAB-SMOKE-242 export hash;
- Auth.

The full suite, build, `verify` and e2e smoke are gate rows.

## 4. code-reviewer (actually invoked, agent a78ae8005839b9193): no Critical, 8.5/10
- **Medium, A-R242-REVIEW-M1:** see §5.
- **Low, "the doc pre-declares PASS on l.4": rejected.** L28 requires exactly this post-PASS string, and the task prescribes it byte for byte.
- **Info, doc wording "only BODY": fixed.** The code also falls back when the active element is not an `HTMLElement`, and the grant-3 paragraph now says so.
- **Info, other notes:**
  - The stale ref is not reachable. It is cleared on every request, refused ones included, and nothing inside the lane body is focusable. No test would catch a "never clear" mutant.
  - A pen barrel button is captured. A touch long-press and a Mac Ctrl+click are `button 0`, so nothing is captured; the gesture guard refuses the Ctrl+click, as before.
  - There is no browser evidence for the clip-body path. That is C's row C-FOCUS-CLIP-242.
- **What the reviewer found good:**
  - the ordering before the guard and before the early return;
  - hook deps stay `[]`;
  - the `isConnected`/body check in `closeGridMenu`;
  - no `any` and no type assertions;
  - GM36/GM39 assert BODY before the open, so they are not vacuous;
  - GM37's second pass re-captures;
  - the doc cites only rows that exist.
- **Architecture note (a proposal for B/root, not a refactor instruction):**
  - The grid-menu focus/dismiss region was patched in rounds 60, 241 and 242 (signal 3).
  - The lane "Background" press handler now takes part in the menu's focus lifecycle (signal 4).
  - Verdict: **keep** for now. If this region is touched again, extract `gridMenuOpenRef`, `gridMenuReturnFocusRef`, `gridMenuPressFocusRef`, `closeGridMenu` and `handleGridMenuRequest` into one `useGridMenuFocusReturn` hook. GM32–GM39 and FR1 would be the acceptance tests, and the `useArrangement()` shape would stay unchanged.
  - Alternative considered and rejected: `preventDefault` on the right mousedown. It is browser-dependent and would not fix M1.

## 5. A-R242-REVIEW-M1 (Medium, pre-existing since D-29z22-F; source-confirmed by A; NOT browser-verified)
- **What:** `releaseEditFocusOnTimelinePointerDown` (`StudioWorkspace.tsx` l.1843–1860, `onPointerDownCapture` at l.2594) has no `event.button` check. The function is byte-identical to round 241.
- **Effect:**
  1. A **right** press on the timeline blurs a focused element (a range input such as a fader or slider, a typing field, a loop brace or a marker) in the capture phase.
  2. That happens before the lane's bubble handler stores the press focus, so the capture records BODY.
  3. When the grid menu closes, focus is lost.

  This is the same WCAG 2.4.3 class as C-R241-01, but the origin element is not the Snap toggle.
- **Why it is not fixed here:**
  - it is outside the grants, and that hunk is frozen;
  - this round did not cause it; it only narrowed the class;
  - the intended behaviour needs a ruling. The blur is a deliberate release of edit focus, so B decides between two options: a right press skips that release (a `button === 0` gate), or focus returns to the released element.
- **Suggested C probe:** focus a marker or a track Volume fader by keyboard, right-click an empty lane, press Escape, and read `document.activeElement`.

## 6. Acceptance self-assessment (only what A actually ran)
- **C-SCOPE-242 inputs:** the start state was verified, only the 3 grants changed, and the diff is B's pre-checked diff, applied verbatim.
- **C-UNIT-242:** 61 files / 1,077 tests green in A's run.
- **C-MUT-242:** both mutants went red as specified, and the repo was unchanged (A's run).
- **C-FOCUS-242** (lane background, cases a/b/c, both viewports): matches the expected column in A's Playwright run. C's own run decides.
- **AN-REVIEW-242:** l.4 is byte-exact; the headings are in order; the title, R6, R8 and `ეტაპი 1:` are updated; GM36–GM39 exist.
- **Not claimed:** C-FOCUS-CLIP-242 (browser), C-MENU-REG-242, C-2A-SPOT-242, C-BUDGET-242, LAB-SMOKE-242, Auth, and the gate rows.

## 7. Exact next C checks
1. **C-SCOPE-242:**
   - diff the working copy against `b-round-241/StudioWorkspace.r241.tsx`: only the 3 hunks should differ;
   - diff the test file against `b-round-241/grid-snap-menu.r241.test.tsx`: 0 removed lines;
   - check the frozen 1,101 list and the root list.
2. **C-FOCUS-242 and C-FOCUS-CLIP-242** in real Chromium at both viewports. The clip-body case has only jsdom evidence (GM39).
3. **C-MENU-REG-242:** reposition, swallow, choose while playing, header, marquee. The left-press path gained one statement before its early return.
4. **Optional info probe for A-R242-REVIEW-M1** (§5), to give B browser evidence.
5. **LAB-SMOKE-242** (export sha256 `1fea093b…3f94`), C-BUDGET-242, Auth and AN-REVIEW-242.

**Scope completed:** grants 1–3 of round 242. SABA-B-11b stage 2b is not started, and the backlog is not marked complete.
