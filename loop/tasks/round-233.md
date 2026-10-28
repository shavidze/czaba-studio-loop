# Round 233: CALM-3 follow-up — hiding the focused Overview must not drop focus to `body` (GATE232-S1, Medium) + render-budget timeout headroom (C-R232-01)

**Planned by:** B, at the round 232 → 233 planning, 2026-10-28. **Decisions:** D-29z313…D-29z320.

**Type:** bug-fix round. It covers two tightly related findings from the round-232 CALM-3 verification and gate.

- **GATE232-S1 (Medium, a11y; gate 232 code-reviewer suggestion 1).** When the Overview slider has keyboard focus and the user presses Ctrl+Alt+O, the Overview unmounts and focus falls to `document.body`.
  - C measured this in round 232 (C-TOGGLE-FOCUS: `activeElement` = BODY).
  - B reproduced it at the baseline (`b-round-232/probe/focus.json`: `afterHide: "BODY"` at both viewports).
  - The round-232 task chose "focus is not moved by code" (D-29z309). B now rules that choice wrong (D-29z314): a keyboard command that removes the focused control must hand focus to a defined control.
- **C-R232-01 (Low, test infra; A's L32 STOP in round 232).** `render-budget.test.tsx` › "does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play" declares no timeout, so the vitest default of 5,000 ms applies. Its times:
  - 2,806 ms (56 %) at **gate 232** (`gates/round-232/verify.log` l.1370);
  - 2,620–2,790 ms in the A and C covering runs;
  - 1,485 ms alone.

  This round's covering set contains that test, so without a ruling A would hit the same L32 STOP. **Fix:** declare `15000` on that one test, the value its sibling R11-P1e already declares (l.432).

**Read first:** `lessons.md` in full. These lessons apply directly:
- L10 (the ruling on A's round-232 STOP, below);
- L11, L32 and L33 (STOP);
- L12 (no class selectors);
- L23 (pre-check done, §0.2);
- L26 and L28 (doc 181);
- L29 (B ran every recipe below in the browser, at the baseline and on a scratch copy);
- L31 (§0.3);
- L39 (no persistent text);
- L40;
- L47 (new: this round names its focus target and C checks it).

**Ruling on A's round-232 L32 STOP (L10).** Accepted as pre-existing load, not caused by the CALM-3 diff: A's HEAD-app control took 2,574 ms, and the test alone takes 1,485 ms. This round resolves it by declaring the timeout (D-29z315). The test's assertion (React commit counts) is unchanged; time is not what it measures.

**Not this round:**
- **GATE232-S2 (AltGr on Windows):** it needs a real Windows AltGr layout. It goes on the Tech Lead list as `TLM-R232-ALTGR-WIN`, next to TLM-R232-MAC, together with C's Firefox suggestion. The guard is not changed on a hypothesis (D-29z316).
- **GATE232-S4 (the hidden slot repeats the Overview's `h-16`):** deferred Low (D-29z316).
  - Moving the height into one wrapper would change the Overview root literal.
  - The frozen `panel-radius-ui.test.tsx` (l.76, l.501) and the OV1 case of `studio-theme-obsidian.test.tsx` pin that literal.
  - C's bbox rows guard against the slot and the Overview drifting apart.
- **GATE232-S5, S6 and S7** (Mac copy, cross-tab sync, interactive empty strip): deferred Low or info (D-29z316).
- **The reviewer's Architecture note** (`studioChordAction` in `shortcuts.ts`): a signal, appended to `b-round-231-checkpoint-request.md` (D-29z317).
- **SABA-B-7-ENVELOPE-DB:** next round (234). Its reference consults are already saved in `b-round-232/saba-b-7-reference-*.md`.

## 0. Baseline and scope

**Baseline:** HEAD = `bd71144292b1e82e5f0c8934f23bd28ecef0ae3c` (gate 232 `published`, its `commit`). At the start, `git status --short --untracked-files=all` must be empty. B checked this: `b-round-232/git-status-at-planning.txt` has 0 lines.
- If HEAD differs, or any path is dirty at the start: **STOP** (L11).
- One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-232-r233-tree-sha256.txt` lists 1,087 tracked files: every tracked file except the 3 grants and the 4 root files. From `store/`, `sha256sum -c --quiet` gives rc 0 at planning. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/routes/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx` and `entry.server.tsx`;
- `.claude/**`, `CLAUDE.md` and every config file;
- `ArrangementOverview.tsx`, `ArrangementVideoDock.tsx`, `overview-visibility.ts`, `strings.ts` and `shortcuts.ts`;
- every other test.

**Root-owned, must equal HEAD:** the files in `b-round-232-r233-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Their start hashes are in `b-round-232-r233-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | §2.1 only: one module-level helper and one call in the Ctrl+Alt+O branch. |
| 2 | `app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx` | §2.2: add case OV-T6. Existing cases unchanged. |
| 3 | `app/lib/arrangement/__tests__/render-budget.test.tsx` | §2.3: l.377 `  });` → `  }, 15000);` and nothing else. |
| N1 | `docs/implementation/2026/quarter-IV/181-calm-3-overview-focus-rescue.md` | New (§2.4). |

The grants' start hashes are in `b-round-232-r233-granted-start-sha256.txt`. The lists are `b-round-232-r233-grants.txt` and `b-round-232-r233-new-files.txt`.

### 0.2 B's collision pre-check (L23, done)
B applied the §2 sketch on a scratch copy (`git archive HEAD` → `/tmp/b232-scratch`, with `node_modules` symlinked), outside the repo and the loop folder. The diff is `b-round-232/precheck-scratch.diff`.
- **Static:** `tsc --noEmit` rc 0. `npx biome check` on the 3 files is clean after `biome format`, which wraps the ternary over three lines as in the diff.
- **Covering set** `b-round-232/covering-files.txt` (the same 32 files as round 232): **32 files / 542 tests green**, rc 0 (`b-round-232/precheck-covering.log`). The render-budget test took 2,799 ms there, now against a 15,000 ms limit.
- **Grep:** at HEAD, no test asserts `document.activeElement` after Ctrl+Alt+O (`grep -rn "activeElement" app/lib/arrangement/__tests__/overview-visibility*`: 0 hits). No test besides N2/N4 sends the chord.
- **Mutant MU-1** (remove the `if (hidden) { focusPastHiddenOverview(); }` call): OV-T6 turns red, and the 6 other cases stay green.
- **Mutant MU-2** (drop the `compareDocumentPosition` filter): OV-T6 stays green, because today no dock button comes before the Overview. The filter is defensive. A may keep it (recommended), but must not claim a test for it.

### 0.3 Render conditions, timeouts and testids (L29, L31, L40)
**Focus targets (L29).** B ran these in Chromium at the baseline (`b-round-232/probe/focus.json`) and on the scratch build (`b-round-232/probe-fix/focus.json` and `focus2.json`, port 5174, now stopped).
- **Recipe for "Overview focused":** focus `arrangement-library-separator`, then press Tab.
- **Docked video** (the default `/studio-lab`): after the Overview, the Tab order is `arrangement-video-expand` → `arrangement-snap-toggle` → `arrangement-grid-division`.
- **Floating video** (click `arrangement-video-expand` once): the dock shows `arrangement-video-placeholder`. After the Overview, the Tab order is `arrangement-video-placeholder-return` → `arrangement-video-drag` → `arrangement-video-expand`.
- **Dock buttons:** the buttons that follow the Overview in DOM order are exactly those Tab stops. None is `disabled` (`grep -n disabled ArrangementVideoDock.tsx`: 0 hits).
- **Scratch build, after the fix:**
  - Hiding moves `activeElement` to `arrangement-video-expand` (docked) or `arrangement-video-placeholder-return` (floating). It matches `:focus-visible`, with a solid 1 px outline.
  - The next Tab lands on `arrangement-snap-toggle`. Shift+Tab lands on `arrangement-library-separator`.
  - With focus on the transport Play button or on `body`, hide and show leave focus unchanged.
  - 0 page errors.
  - Clips are not focus targets: B's attempt to focus a clip left focus on `body`, so no clip row is set.

**Timeouts (L31).** From gate 232's `verify.log` (l.1369–1373):
- the render-budget file took 7,506 ms;
- the l.303 test took 2,806 ms (56 % of 5,000; fixed here);
- R11-P1e took 1,792 ms against its declared 15,000;
- the others took < 1,400 ms each.

Each `overview-visibility-ui.test.tsx` case took < 500 ms in B's run.

**Testids (L40).** No element with a `data-testid` changes. The helper only reads `data-timeline-overview` and `data-testid="arrangement-video-dock"`. The same file already uses this pattern in `libraryRailExpandButton` and `trackRowNameButton`.

## 1. Why
A keyboard or screen-reader user who hides the Overview while it has focus loses their place, because focus falls to `body`.
- Chromium keeps the sequential-navigation start point, so the next Tab still works (C round 232).
- But a screen reader's virtual cursor and the visible focus ring are lost, and nothing tells the user where focus went.

WCAG 2.4.3 (Focus Order) and the WAI-ARIA APG practice agree: when the focused element is removed, move focus to a logical neighbour. The codebase already does this in two places:
- `pendingLibraryRailFocusRef` rescues focus to the library rail button;
- the library notice's dismiss moves focus to search (D-29z307 R6).

## 2. Changes

### 2.1 `StudioWorkspace.tsx`
- **New helper.** Add one module-level function next to `isOverviewTarget` (for example `focusPastHiddenOverview`):
  - It runs **only when hiding**.
  - If `document.activeElement` is inside `[data-timeline-overview]`, it finds the enclosing `[data-testid="arrangement-video-dock"]`.
  - It focuses, with `{ preventScroll: true }`, the first `button` in that dock that is not `disabled`, has `tabIndex >= 0`, and follows the Overview in document order.
  - If there is no such button, or focus is not on the Overview, it does nothing.
- **The call.** In the Ctrl+Alt+O branch, call it **before** `setOverviewHidden(true)`, while the Overview is still mounted. Put it after the existing `repeat`/gesture return, so every existing guard keeps its order. Nothing else in the branch changes.
- **Showing** the Overview moves no focus, because nothing unmounts. Focus anywhere else is never moved.

**Why this target (L4, one rule).** It is the element the next Tab would have reached (B's baseline probe). Focus moves "forward by one", which is the smallest change a keyboard user can predict.

B rejected the reviewer's suggestion, the timeline scroller. It has no `tabIndex`, so `.focus()` on it does nothing (`StudioWorkspace.tsx` l.2349–2355). Adding a `tabIndex` there would create a new Tab stop and trigger `revealKeyboardFocusBelowChrome`.

### 2.2 Test OV-T6 (`overview-visibility-ui.test.tsx`)
Add it after OV-T2, as in `b-round-232/precheck-scratch.diff`. A may reword it but keeps every assertion:
1. Focus a control outside the Overview, preferably the transport Play button (a real user cannot send the chord from the search field, because the text-field guard swallows it; B's scratch sketch used the search field), then send the chord with Meta: focus stays on that control. Send it again to show.
2. Focus the Overview and send the chord: the Overview is gone, and `document.activeElement` is `arrangement-video-expand`.
3. Send the chord again (show): focus stays on `arrangement-video-expand`.
4. Click `arrangement-video-expand` (floating video), focus the Overview and send the chord: `activeElement` is `arrangement-video-placeholder-return`.

The existing `afterEach` (`setOverviewHidden(false)`) resets the module state.

### 2.3 `render-budget.test.tsx`
Change line 377 only: the closing `  });` of the l.303 test becomes `  }, 15000);`, the same literal its sibling uses at l.432. No other byte changes. This closes C-R232-01.

### 2.4 Doc N1
Write `docs/implementation/2026/quarter-IV/181-calm-3-overview-focus-rescue.md` in Georgian with English technical terms, following TEMPLATE.md and the L26 headings.
- Line 4 is exactly `**სტატუსი:** Completed (C round 233 PASS)` (L28).
- Cite only OV-T6 and the render-budget test by name.
- State the target rule, the rejected scroller option and why, and that showing moves no focus.
- TODO: TLM-R232-ALTGR-WIN, TLM-R232-MAC, and B-R232-DOC180-FOCUS-STALE (doc 180 l.42–51 still describes the round-232 "focus is not moved" rule; doc 181 supersedes it; doc 180 is frozen this round and gets a one-line note at the next owner touch or in the polish pass).

At planning, `grep -rn 'In Progress (stage' docs/implementation` returns only doc 176, which is tied to the open PERF-HARNESS-SHARED-LIB-b-ii stage. No other doc line is granted.

## 3. Reference
- **Ableton Live 12: no reference found.** Manual 6.1 and 42.1 (re-fetched in round 232) describe the Overview and Ctrl+Alt+O but say nothing about keyboard focus. In Live the Overview is not a Tab stop. CZABA's Overview is a focusable slider (an earlier CZABA choice), so the focus handoff is CZABA's own rule.
- **Secondary (accessibility):**
  - WCAG 2.2 SC 2.4.3 Focus Order: https://www.w3.org/WAI/WCAG22/Understanding/focus-order
  - WAI-ARIA APG, "Developing a Keyboard Interface": https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/ (focus is not lost when content is removed).
- **Deviation:** none from Live, because Live has no equivalent focus state. The status message ("Overview hidden. Ctrl+Alt+O shows it again.") is unchanged.
- **Screen budget (L39):** no persistent element or text is added or removed.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start:**
   - HEAD is `bd71144` and the status is empty;
   - from `store/`, `sha256sum -c --quiet` gives rc 0 on `b-round-232-r233-tree-sha256.txt`, `b-round-232-r233-granted-start-sha256.txt` and `b-round-232-r233-root-files-start-sha256.txt`.
2. **Static:**
   - `npm run typecheck` rc 0;
   - `npm run lint` rc 0, with 0 diagnostics in the grants and N1;
   - `npx biome check` on the 3 changed files: clean.
3. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-232/covering-files.txt)`, all green. Also run `overview-visibility-ui.test.tsx` once with `--sequence.shuffle`.
   - L32: a failure, a timeout, or a test above 50 % of its timeout is a STOP at the top of `a-round-233.md`. Report your time and the gate-232 time.
4. **Mutant:** MU-1 (§0.2) turns OV-T6 red. Restore the file and check with `git diff`.
5. **Optional browser self-check:** copy `b-round-232/probe-focus.mjs` and `probe-focus2.mjs` into `a-round-233/` and run them against :5173. Do not edit B's files. Compare the results with `b-round-232/probe-fix/`.
6. **code-reviewer** (3+ files changed): forward its Architecture note to B. Do not act on it outside the grants.
7. **End:**
   - `git status` shows exactly 3 `M` and N1 as `??`;
   - the frozen and root lists give rc 0;
   - write `a-round-233/changed-end-sha256.txt` and `a-round-233/granted-hunks.diff`.

## 5. C: acceptance (real Chromium on `/studio-lab` at 1440×900 and 1280×720)
B's numbers are in `b-round-232/probe/focus.json` (before) and `b-round-232/probe-fix/focus.json` and `focus2.json` (after, on the scratch build). The gate rows (full vitest, typecheck, build, lint, verify, e2e smoke) are `gate` and are not claimed.

| Row | Check | Pass when |
|---|---|---|
| C-SCOPE-233 | HEAD, status, hashes, hunks | <ul><li>HEAD is `bd71144`;</li><li>3 `M` plus N1;</li><li>the frozen, root and A-end lists give rc 0;</li><li>protected files: `git diff --quiet HEAD` gives rc 0;</li><li>the hunks are §2.1–§2.3 only (render-budget: exactly one changed line).</li></ul> |
| C-UNIT-233 | Covering set | <ul><li>`b-round-232/covering-files.txt` (32 files) is green.</li><li>OV-T6 exists (grep: 1 hit).</li><li>`overview-visibility-ui.test.tsx` passes with `--sequence.shuffle`.</li><li>The l.303 render-budget test declares `15000`; report its time.</li></ul> |
| C-FOCUS-DOCKED-233 | Overview focused (separator → Tab), then Ctrl+Alt+O; both viewports | <ul><li>`activeElement` is `arrangement-video-expand`, it matches `:focus-visible`, and its ring is painted (brass px > 0).</li><li>The status is exactly "Overview hidden. Ctrl+Alt+O shows it again."</li><li>The next Tab lands on `arrangement-snap-toggle`.</li><li>After a fresh hide, Shift+Tab from the expand button lands on `arrangement-library-separator`.</li><li>The same with Meta+Alt+O.</li></ul> |
| C-FOCUS-FLOAT-233 | Video floating (click expand), Overview focused, then Ctrl+Alt+O; both viewports | `activeElement` is `arrangement-video-placeholder-return`, with a visible ring. Escape still returns the floating video. |
| C-FOCUS-OTHER-233 | Focus elsewhere | <ul><li>With focus on `body`, on the transport Play button, or on `arrangement-library-separator`, Ctrl+Alt+O hides and shows the Overview, and `activeElement` is unchanged each time.</li><li>Showing from the expand button leaves focus on it.</li></ul> |
| C-TOGGLE-233 | Round-232 neighbours (short check) | <ul><li>Hide: the slot sits at the Overview's former bbox ±1 px.</li><li>Show: the Overview returns.</li><li>A reload while hidden keeps it hidden.</li><li>A held key toggles once.</li><li>Inside the library search field, nothing happens.</li></ul> |
| C-BUDGET-233 (L39) | Persistent text rows | The text inventory at S0 and S1, at both viewports, equals C round 232's (`c-round-232/inv/`): 0 added, 0 removed. |
| G233-3 | Purchase protection | <ul><li>`/studio-lab` returns 200, shows the demo badge, and `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required", with 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401.</li><li>No token is issued.</li></ul> |
| LAB-SMOKE-233 | Real audio | Add, then Export WAV: 24-bit, 48 kHz, stereo. The length and RMS equal C round 232 (101.352 s; −65.21 / −21.59 / −21.54 dB). 0 page errors. |
| C-LESSON-233 | `lessons.md` | L47 exists ("a key or action that unmounts the focused element names its focus target"). |
| AN-REVIEW-233 | Doc 181 | <ul><li>l.4 is byte-exact `**სტატუსი:** Completed (C round 233 PASS)`;</li><li>the L26 headings are present;</li><li>the cited test names exist.</li></ul> |
| C-REF-233 | §3 | "No reference found" for Live is recorded, and there is no unlisted difference. |
| C-SHOTS-233 | Screenshots | Before (B's `b-round-232/probe/float-*`) and after: the focused target with its ring, docked and floating, at both viewports. |
| TLM-R232-MAC, TLM-R232-ALTGR-WIN | Tech Lead manual checks | They cannot be claimed in the cloud. Mark them `blocked`, with the reason "needs a Mac" or "needs a Windows AltGr layout". This is not a FAIL. |

**Ableton conformance:** not applicable (no reference). Live's Overview is not a focus stop.

## 6. Neighbouring behaviour that could break (C probes these first)
- The round-232 Ctrl+Alt+O guards: AltGr, Shift, repeat, text fields, the open sheet, an open Export dialog, a pointer gesture.
- Space on the focused Overview still plays, and ← / → still move it.
- The floating video's Escape return and its placeholder.
- render-budget: Play → Pause → Play still re-renders the Overview 0 times.

## 7. Outcomes for B's next planning
- **C PASS and gate PASS:** GATE232-S1 and C-R232-01 close, and SABA-B-8 is complete (მზადაა). Root runs `b-round-231-checkpoint-request.md` (non-blocking). Then:
  - If round-234 planning falls on or after 2026-10-30, the next round is **REGRESSION** (carry every `scope_additions` entry, L6).
  - Otherwise it is **SABA-B-7-ENVELOPE-DB**, using `b-round-232/saba-b-7-reference-*.md`. Before dispatch, B must still define CZABA's taper function with a D-ID, because the manual does not publish Live's fader law.
- **C FAIL:** a fix-up on the same grants.

## 8. Root notes
- **Checkpoint:** `b-round-231-checkpoint-request.md` (ARCH-CHECKPOINT-SABA-B-8-END) is **ready to run now**, because its trigger (C round 232 PASS) has happened. It now also carries the gate-232 Architecture note (D-29z317). It is non-blocking.
- **New Tech Lead check:** TLM-R232-ALTGR-WIN (Windows with a Polish or German layout, left Ctrl+Alt+O; also Firefox). TLM-R232-MAC is unchanged.
- **Scratch:** B's scratch copy (`/tmp/b232-scratch`) and its dev server (port 5174) were outside the repo, and the server is stopped. `store/` was not touched: HEAD `bd71144`, empty status, and the frozen list gives rc 0.
