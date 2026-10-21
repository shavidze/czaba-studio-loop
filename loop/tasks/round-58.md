# CURRENT TASK — Round 58: grid-menu follow-ups on SRW-14 stage 4b-1. The dismissing press must also swallow its click (G1, Medium). Follow auto-scroll must not close the menu (G6). Close C's two focus-test gaps (C-R57-01, C-R57-02) and the untested export guard (G7).

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-18
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- **Decision record:** **D-29z23** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-57.md`.
- **Round size:** one owner (A), one feature area (the lane grid menu from round 57), three tightly related defects:
  1. **G1 (Medium, A's code-reviewer #1 / C open probe 1).** Today's M9 mechanism cancels `pointerdown` only. The browser still dispatches the following `click` (Pointer Events: cancelling `pointerdown` suppresses only the compatibility mouse events, not `click`). So a left click on a **button** outside the open menu closes the menu **and** activates that button (Snap, Play, Export, …). This contradicts M9 ("that press does nothing else"); the contradiction is in B's own round-57 spec.
  2. **G6 (reviewer #2 / C open probe 2).** While playing with Follow on, the auto-scroll sets `scrollLeft`. That fires `scroll`, and the menu closes at every page flip.
  3. **Menu test gaps (test-only).** These cover behaviour that already exists in code:
     - **C-R57-01 (Low):** focus return after a **choice** is unguarded; C's mutation h survives.
     - **C-R57-02 (Low):** focus re-stored while the menu is open is unguarded; C's mutation i survives, and A's claim that GM3 covers it is wrong.
     - **G7 (A's known gap):** the M5 export-dialog guard has no test.
- **This is a reorder, not a cut.** Stage 4b-2 (narrow/widen keys after the Chrome Ctrl+digit check, the C-R51-01 probe, the INFO-R55 and SHIFT-MIDDRAG tests) moves to **round 59**. 4c, SRW-15..20 and the rest follow (§7).

> **ROOT ACTION REQUIRED BEFORE C (environment, not BLOCKED) — SEVENTH ROUND.**
> - `http://127.0.0.1:5173` and `:5199` have been down since round 52:
>   - C round 57: `000` at 21:52, 22:05:36 and 22:05:50, with no listener;
>   - B: `000` on 2026-10-18 at 11:25 (`b-round-57/gates.txt`).
> - **Never run in a browser:**
>   - the stage-4a and 4b-1 browser acceptance;
>   - the anonymous-workspace / purchase-protection browser check, which last passed in **round 51** (G51-3).
> - **Root:** start the Store dev server **and** the backend before C, **or answer yes/no: can they be restored here?** Agents never start or stop servers.
> - Round 58 is built and unit-verified offline. Its browser half (§4.6) and the carried halves (§4.7) run only if the servers are up.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every right-click, drag and real-click-after-press case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Do not export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 57 result** (`c-round-57.md`, `c-round-57.json`): **C PASS for every offline ID.**
- **PASS:**
  - G57-2, R57-S (C's own AST-equivalence check), R57-U a–g, alone durations;
  - G57-1: tsc 0, Biome at baseline, **88 / 1523**, build, verify rc 0 on attempt 1.
- **New C bugs:** C-R57-01 and C-R57-02, both Low test gaps proven by surviving mutations.
- **Closed:** C-R48-01-GRID-RESIDUAL (7 options AST-equivalent, no timeout).
- **Not closed:** C-R51-02. It is fixed at unit level only; browser R57-FOCUS is not run.
- **Not run (environment, sixth round):** §4.6 MN-*, R57-FOCUS, R57-PLAY, R57-LOOK, the carried 4a half and G57-3.
- **B rulings on round-57 deviations:**
  - **D1–D3, D5, D6:** accepted, as C proposed.
  - **D4 (plain function, not `forwardRef`):** accepted, because no ref consumer exists and every `components/arrangement/` sibling is a plain function.
  - **C's AST-equivalence method** (`c-round-57/scripts/asteq.cjs`) **becomes the standard** for describe-option edits. It replaces the whitespace-strip method of R56-S-DEV1.

**Why the menu fixes come before 4b-2 (D-29z23):**
- The rule is C bugs first. G1 is a Medium defect in the feature that was just built, and C asked to schedule its fix now.
- C-R57-01 and C-R57-02 are C-filed and sit in the same file.
- 4b-2's precondition is B's Chrome Ctrl+digit check, and that needs a browser.
- All three items are offline-verifiable in the same three files.

## Baseline

Measured by B on 2026-10-18 at 11:25 +04 (`b-round-57/gates.txt`).

**Content baseline:** one of these must hold.
- **(A)** HEAD is `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` lists **exactly these 25 paths**:
  - ` M`: `ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `StudioWorkspace.tsx`, `app/lib/__tests__/sfx-library.test.tsx`, and these under `app/lib/arrangement/__tests__/`: `fader-guards`, `grid-snap-edit`, `grid-snap-ui`, `master-ui`, `selection.test.ts`, `track-layout`; plus `app/lib/arrangement/grid.ts` and `selection.ts`.
  - `??`: `app/components/arrangement/ArrangementGridMenu.tsx`, and these under `app/lib/arrangement/__tests__/`: `grid-edges.test.ts`, `grid-snap-clip-edges`, `grid-snap-loop-drop`, `grid-snap-menu`, `grid-snap-position`; plus docs `046`–`050` in `docs/implementation/2026/quarter-IV/`.
- **(B)** Root has committed some or all of rounds 50–57:
  - HEAD is one or more newer **root** commits on top of `038ed5a`;
  - their combined stat contains only paths from the 25-path list;
  - `git status --short` lists exactly the 25-path list minus the committed paths.

**In both cases:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-57-r58-tree-sha256.txt` has **414** entries, all OK (run it from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 3 owned files below.
- **Snapshots:** `../tmp/studio-real-loop/b-round-57-r58-snapshots/` with `SHA256SUMS.txt`. None of the 3 files may differ from its snapshot:

  | File | sha256 prefix | EOL (CRLF / LF) | `it` |
  |---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `bacf1c67` | **CRLF** 1746 / 1746 | — |
  | `app/components/arrangement/ArrangementGridMenu.tsx` | `d1f25a45` | 0 / 168 | — |
  | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | `34ebdc11` | 0 / 684 | 19 |

- **B's check:** `diff -rq store/app tmp/studio-real-loop/c-round-57/scratch/app` printed nothing, so this tree is byte-identical to the one C verified.
- Anything else is a **stop and report**: another HEAD, extra paths, or a snapshot or frozen-list mismatch.

**Other measurements:**
- Protected files 4/4 OK; `node.exe` 9; `/studio-lab` 000; `:5199` 000.
- Full vitest at round-57 end: **88 files / 1523** (A and C both rc 0).
- Biome `./app`: **5 / 218 / 1**. The 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`.
- Biome on the 2 LF owned files: rc 0, no diagnostics (`b-round-57/biome-owned-lf.txt`).

**Line endings (the CRLF trap):**
- **`StudioWorkspace.tsx` stays CRLF.** After the edit every line is CRLF, with 0 bare LF.
- **Never run `npx biome check --write` or `format --write` on it.** Check its formatting with:

  ```
  biome format --stdin-file-path=app/components/arrangement/StudioWorkspace.tsx < <LF copy>
  ```

  The output must equal the LF copy.
- The other owned and new files are LF.
- Count EOLs with node (`/\r\n/g` vs `/\n/g`). Diff with `diff -u --strip-trailing-cr` against the snapshots.

**Rules:**
- Do not revert, re-create or reformat anything; the work of rounds 47–57 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z23-D: the dismissing press does nothing else, including its click (G1)

**D1. Contract (replaces the mechanism sentence of round-57 M9; the requirement is unchanged).**
- A `pointerdown` outside the open menu closes it, and that press does nothing else. This includes the `click` the browser dispatches after it.
- Today's `pointerdown` consumption (`preventDefault` + `stopPropagation` in the window capture listener) stays exactly as it is. GM10 is C-verified and remains the contract.

**D2. Mechanism: lifetime is the trap.**
- The outside press calls `onClose`, which unmounts `ArrangementGridMenu` and runs its effect cleanup **before** the `click` arrives (`pointerdown` → close → unmount → `pointerup` → `click`).
- **So the click swallow must not live in the menu's effect cleanup lifecycle.**
- **Required form:** at the moment `handleOutsidePointerDown` consumes a press, it installs a **self-removing** one-shot set of window **capture** listeners. This can be a small module-level function in `ArrangementGridMenu.tsx` that takes the `Window`.
  - **`click`:** call `preventDefault()` and `stopPropagation()`, then remove the whole set.
  - **`pointerup` / `pointercancel`:** schedule the removal for one macrotask later (`view.setTimeout(release, 0)`). If no click follows (a drag-off, a right or middle press), nothing stays armed.
  - **`pointerdown` (the next one):** remove the set **without** touching that event. An armed swallow can never eat the click of a later, unrelated press.
  - Removal is idempotent: calling it twice is harmless, and the pending timer is cleared or ignored.
  - **Timing assumption (explicit):** the `pointerup` + one-macrotask release works because Chromium dispatches `click` in the same task as `pointerup`. jsdom cannot prove it; **MN-DISMISS-BUTTON is the browser check.** If it fails, B decides a fallback (a bounded safety timeout, not a longer macrotask chain). A does not change the timing on its own.
  - **Why the timed release cannot be dropped:** a right-button or drag-off dismiss arms the set with no `click` following. Without the timed release, the next keyboard-activated `click` (Enter on a focused Play button) would be swallowed. GM17(a) guards this path.
- **Never** swallow `contextmenu`, `auxclick`, `dblclick` or keyboard events. Only the one `click` is affected.
- If the workspace unmounts while armed, the set still removes itself on the next pointer event or the macrotask. Record this in doc 051; no extra unmount hook.
- **A press inside the menu** arms nothing, as today (it returns before the consumption).
- **Second right-click (round-57 M6, G5):** the consumed right-button press arms the set, but a right button produces no `click`. `pointerup` releases it, and the following `contextmenu` reopens the menu as before.

**D3. Unaffected:** M1–M8 and M10–M12 of round 57, except that M8's scroll rule is refined by §0.2.

### 0.2 Rule D-29z23-S: only user scrolls close the menu (G6)

- **Smallest honest rule.** The menu chooses a global grid preference. It is not anchored to a time position, and it is `position: fixed`, so content moving under it is coherent.
- Therefore programmatic Follow auto-scroll must not close it. Every other scroll of `arrangement-timeline-scroller` still closes it: wheel, scrollbar, touch, or a user scroll while playing.
- **Discriminator** (reuse the existing one; no new state). The scroll listener registered while the menu is open (`StudioWorkspace.tsx` l.876–889) replaces `closeGridMenu` with a handler that closes **unless** all of these hold:
  - `workspaceRef.current.isPlaying`;
  - `followModeRef.current === 'on'`;
  - and either `Math.abs(scroller.scrollLeft - autoScrollLeftRef.current) <= FOLLOW_SCROLL_TOLERANCE_PX`, or the existing browser-clamp condition from `handleTimelineScroll` (l.898–900) holds.
- That is the same classification `handleTimelineScroll` uses to tell the follow scroll from a user scroll. The follow writer (l.946–948) sets `autoScrollLeftRef` synchronously before the asynchronous `scroll` event.
- **`handleTimelineScroll` itself stays unchanged.**
  - A may move the shared predicate into one small `useCallback` that both use, but only if `handleTimelineScroll`'s behaviour is byte-for-byte equivalent in logic.
  - The follow tests below stay green.
  - Otherwise write the predicate once in the new handler.
- `resize` and `blur` keep closing the menu, as today.

### 0.3 Rule D-29z23-T: menu test gaps (test-only)

- **C-R57-01, C-R57-02 and G7:** the code paths exist (`closeGridMenu` restores on every close; the `gridMenuOpenRef` guard stores focus only from closed; the `exportOpenRef` guard). This round adds only the assertions in §2.2 (GM18–GM20).
- **No source change for these three.**

### 0.4 Source

| File | Change |
|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | §0.1 only: the self-removing click swallow armed from `handleOutsidePointerDown`. Nothing else. |
| `app/components/arrangement/StudioWorkspace.tsx` | §0.2 only: the scroll handler in the open-menu effect (plus the optional shared predicate). CRLF preserved. |

- **Frozen:** everything else, including `ArrangementLane.tsx`, `grid.ts`, `selection.ts`, `ArrangementClip.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`, `components/arrangement/index.ts` and docs 001–050.
- **Doc 050 stays frozen.** Its GM3 sentence claims only "same node, new position, focus unchanged", which is true. The C-R57-02 correction goes in doc 051.
- No comments, no `any`, no type assertions, no `@ts-ignore`, semicolons, Georgian UI text.

### 0.5 What could be affected (C checks)

- **GM10:** a dismissing press on a clip still selects nothing, and the next press selects (the next-`pointerdown` release must not break it).
- **Header Snap button, transport Play, Export, library rows:** a normal click with the menu **closed** works exactly as before. There is no permanent click swallow.
- **Follow:** `follow-*` tests and the existing Follow pause on a user scroll (`handleTimelineScroll`) do not change.
- **The round-57 menu IDs:** GM1–GM15 and FR1–FR4, with GM13 unchanged (a scroll while stopped still closes the menu).
- `gesture-guard`, `floating-video`, `export-dialog-focus*` and `render-budget`.
- **The full suite: 88 files / 1529.**

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A) or (B);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-57-r58-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - snapshots `SHA256SUMS.txt` and `cmp` for each owned file;
   - protected files 4/4; Biome numbers; `node.exe`; dev-server state.
3. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.1, §0.2 and §0.4.

### 2.2 Tests

**Extend** `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` (LF) inside the existing first `describe` (it already has `{ timeout: 15_000 }`):
- No new file, no new describe option, and no change to the 19 existing `it`.
- **Exactly these 6 new `it`, each named with its ID:**

| ID | Setup → action | Must assert |
|---|---|---|
| GM16 | menu open (`rightClick` on a lane) → on the header Snap toggle (`arrangement-snap-toggle`): `pointerDown` (left) → `pointerUp` → `click` | the menu is gone after the `pointerDown`; `fireEvent.click` returns `false`; `data-snap` is **unchanged**. Then a second `pointerDown` → `pointerUp` → `click` on the same button with the menu closed toggles `data-snap`. Repeat once with the transport **Play** button (`getByRole('button', { name: 'Play' })`): the dismissing sequence leaves `isPlaying` `false`, and the next full press starts playback. |
| GM17 | (guards the timed release; see D2) (a) menu open → `pointerDown` + `pointerUp` on the empty lane background (no `click`) → flush one macrotask (`await act(async () => { await new Promise((r) => setTimeout(r, 0)); })`) → `click` on the Snap toggle. (b) Menu open → `pointerDown` on the empty lane background (consumed; no `pointerUp`) → a new `pointerDown` on the Snap toggle → `click` on it. | (a) `data-snap` toggles: the set was released by `pointerup` plus the macrotask. (b) `data-snap` toggles: the set was released by the next `pointerdown`. In both, the menu is closed and the lane press selected nothing. |
| GM18 | **C-R57-01:** focus the Snap toggle (`act(() => el.focus())`; assert it is active) → `fireEvent.contextMenu` on a lane → click `0.5 წმ` | the menu is gone; the division is `0.5`; `document.activeElement` is the Snap toggle again |
| GM19 | **C-R57-02:** focus the Snap toggle (assert) → `contextMenu` on the music lane at (300, 200) → bare `contextMenu` on the video lane at (30, 60) (reposition; assert the same menu node) → `Escape` | the menu is gone; `document.activeElement` is the Snap toggle (not `body`, not a detached item) |
| GM20 | **G7:** open the export dialog (`click` the `Export` button; assert the dialog is shown) → `fireEvent.contextMenu` on a lane | `fireEvent.contextMenu` returns `false` (the Lane still prevents the native menu); no `arrangement-grid-menu` in the DOM |
| GM21 | **G6:** `togglePlayback()` (assert `isPlaying` and the Follow mode `on`) → open the menu → read `scroller.scrollLeft` immediately before the first scroll and use that value (the follow writer may already have moved it; do not assume 0) → `fireEvent.scroll(scroller)` with `scrollLeft` unchanged (= the follow anchor) → then set `scroller.scrollLeft = 200` and `fireEvent.scroll(scroller)` | after the first scroll the menu is **still open** (the follow scroll is ignored). After the second it is **gone** (a user scroll while playing); the division is unchanged. Read `scrollLeft` back after setting it. If jsdom ignores the assignment, define it on the instance with `Object.defineProperty(scroller, 'scrollLeft', { configurable: true, writable: true, value: 200 })`, with no type assertion, and record that in the report. |

**Expected count:** vitest **88 files / 1529** (1523 + 6). `grid-snap-menu` has **25** `it`.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Use a scratch copy with a `node_modules` junction and your own vitest config, as in round 57. Run each mutation on `grid-snap-menu`, `grid-snap-ui` and `gesture-guard`. Each must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | `handleOutsidePointerDown` does not arm the click swallow | GM16 |
| b | the click swallow never removes itself (no release of any kind) | GM16 (second press) |
| c | the swallow is released only by a `click` (no `pointerup` macrotask and no next-`pointerdown` release) | GM17 |
| d | the scroll handler closes on every scroll (back to `closeGridMenu`) | GM21 |
| e | the scroll handler never closes | GM13 |
| f | (C's h) `gridMenuReturnFocusRef.current = null` before `closeGridMenu()` in `chooseGridMenuDivision` | GM18 |
| g | (C's i) the store guard becomes `if (gridMenuOpenRef.current \|\| !gridMenuOpenRef.current)` | GM19 |
| h | the `exportOpenRef.current` clause is dropped from the `handleGridMenuRequest` guard | GM20 |

- Write `a-round-58/mutations.txt` with the command, each result line and the failing test names.
- If a mutation survives, **strengthen that test** within §2.2. Do not add tests outside the list.

### 2.4 After the change

- **Self-check:**
  - `npx tsc --noEmit` → 0;
  - full `npx vitest run` → **88 / 1529, 0 failures**;
  - `npm run build` → rc 0.
- **Biome:**
  - read-only `npx biome check ./app` → ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info;
  - the 2 LF owned files → 0 diagnostics;
  - `StudioWorkspace.tsx` → `biome lint` 0, and the stdin format check equals the LF copy.
- **Review:** run the real `code-reviewer` subagent on the diff. Put findings and dispositions in the report.
  - **Architecture notes** go to B (`a-round-58.md` §6), not into code.
  - Reviewer items outside §0 go to B; they are not fixed this round.
- **`/check`:** `npm run verify` → exit 0, run quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke (only if the server is up):**
  - one gstack load of `/studio-lab` at 1440×900 with a clean console (apart from the known `/api/cart`);
  - one PW probe: right-click a lane, then REAL-click the header Snap toggle, and read `data-snap` (expected unchanged).

  This is not a PASS claim.

### 2.5 Doc 051

New file `docs/implementation/2026/quarter-IV/051-studio-lab-grid-menu-dismiss-click-follow-scroll.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 58 — D-29z23; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:**
  - G1 (the Pointer Events rule on `click` after a cancelled `pointerdown`);
  - G6;
  - C-R57-01/02; G7;
  - the correction to A's round-57 report: GM3 does not cover C's (i); GM19 does now;
- **Approach:**
  - **D1–D3 and S**, with the alternatives:
    - a full-viewport backdrop (rejected: it breaks the M6 reposition);
    - swallowing inside the menu effect (rejected: the effect is cleaned up before the click);
    - a `wheel`-only close rule (rejected: it misses scrollbar and touch scrolls);
    - never closing on scroll (rejected: it drops M8 for user scrolls);
  - the armed-while-unmounted note;
- **Architecture:** one Mermaid sequence: `pointerdown` (consumed, arm) → close/unmount → `pointerup` (schedule release) → `click` (swallowed, release);
- **Changed files;**
- **Problems and solutions;**
- **Testing:** GM16–GM21, mutations a–h, gates;
- **Ableton** (the §4.8 table);
- **TODO:** 4b-2 (round 59), the browser probes MN-DISMISS-BUTTON, G5 and G6-PLAY, then 4c.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | A | §0.1 |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.2 (CRLF kept) |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | A | add exactly GM16–GM21 (§2.2) |
| `docs/implementation/2026/quarter-IV/051-studio-lab-grid-menu-dismiss-click-follow-scroll.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-58.md`, `a-round-58/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-58.md`, `c-round-58.json`, `c-round-58/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:**
- **Case A: 26 lines** — the 25 baseline lines plus `?? docs/implementation/2026/quarter-IV/051-…md`.
- **Case B:** the remaining baseline lines, plus ` M` for any owned file root committed, plus the doc-051 line.

The frozen list must stay all OK.

### 3.2 Frozen this round

- Everything in `b-round-57-r58-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**`.
- **Also not allowed:**
  - new dependencies or installs; deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments (mutations run in scratch only);
  - killing processes you did not start; starting or stopping the dev server;
  - `npm run format`;
  - deleting `playwright-report/` or `store/nul` (root's call).

## 4. Acceptance (C)

**Checkpoint order:** G58-2 → R58-S → R58-U → G58-1 → (servers up) §4.6 → §4.7 → G58-3.
- Write `c-round-58/checkpoint.md` as you go.
- If the server is down at the start, check again after the offline items and once more before the report, and record each check. Do not start it.

### 4.1 R58-S — static (read-only)

- **`diff -u --strip-trailing-cr` against the snapshots:**
  - `ArrangementGridMenu`: only the §0.1 swallow and its arming call;
  - `StudioWorkspace`: only the §0.2 scroll handler (and the optional shared predicate, logic-equivalent in `handleTimelineScroll`);
  - the test file: only the 6 new `it`; the 19 existing ones are AST-identical (C's `asteq.cjs` or equivalent).
- **EOL:** `StudioWorkspace.tsx` has every line CRLF with 0 bare LF. The other owned and new files are LF.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **Tree:** frozen list 414 OK; protected 4/4. Doc 051 exists with the §2.5 sections.
- **Swallow scope:** confirm by reading that it listens only to `click` (swallow) and `pointerup`/`pointercancel`/`pointerdown` (release), all with `capture: true`, and that every path removes all of them.

### 4.2 R58-U — unit and mutation (C's own scratch, own strings)

- **Mutations a–h:** re-run them in your own scratch with your own edits; each must kill its named tests.
- **C extras (info):**
  - (j) arm the swallow on a press **inside** the menu as well → does any test fail? If none, record it as a Low test gap.
  - (k) the release on the next `pointerdown` also calls `preventDefault` on that event → which test fails (expected: GM10 or GM17)?
- **Re-run of round-57 mutations a and d1** on the new tree: they still kill GM1 and GM10.
- **Durations:** run the 25 menu tests alone and record them. A test over 3 s alone is info.

### 4.3 G58-1 — gates

- tsc 0; build passes.
- **Biome:** read-only `./app` within the baseline; the 2 LF owned files 0 diagnostics; `StudioWorkspace` lint 0 and stdin format unchanged.
- **vitest = 88 files / 1529, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, run quietly, with at most two quiet attempts, each recorded. If neither attempt gives rc 0, G58-1 is FAIL.
- Record any `Test timed out` with file, test and ms.

### 4.4 G58-2 — tree

- Protected files 4/4 OK; frozen list all OK.
- `git status --short` matches §3.1 (26 lines in case A); HEAD at start and end.

### 4.5 Not run if the servers are down

Write "not run (environment)" for §4.6, §4.7 and G58-3, and say plainly in the summary that this is the **seventh** round.

### 4.6 Browser acceptance (servers up; REAL-mouse (PW) for right-clicks, drags and click-after-press, gstack for keys)

Layout L52 (`tasks/round-55.md`). Test at **1440×900**, then repeat the starred items at **1280×720**.

| ID | Steps | Pass |
|---|---|---|
| MN-DISMISS-BUTTON* | open the menu → REAL click on the header Snap toggle; reopen → REAL click on Play; reopen → REAL click on `Export` | each time the menu closes and the button does **nothing** (`data-snap` unchanged, not playing, no dialog). The next REAL click on each works. |
| MN-REPOSITION (G5) | right-click a lane at A, then right-click at B without closing | exactly one menu, at B. If the second right-click only closes it, that is a bug for B, not a C failure of this round. |
| MN-FOLLOW (G6) | Follow on, play from 0 at a zoom where a page flip happens within about 6 s, open the menu before the flip | the menu stays open across the flip, and the playhead and meter keep running. A wheel over the timeline then closes it. |
| R57 browser half | the round-57 §4.6 table (`tasks/round-57.md`): MN-OPEN*, MN-EDGE*, MN-NATIVE, MN-CHOOSE, MN-SNAP, MN-KEYS, MN-DISMISS, MN-NOEDIT, R57-FOCUS (C-R51-02), R57-PLAY (real audio), R57-LOOK* | as written there; also record which item shows the focus ring on open (C probe 4) and the first open after navigation (reviewer #9) |

### 4.7 Carried stage-4a browser half (servers up)

- **Unchanged since round 55; run exactly the procedures from `tasks/round-55.md`:**
  - §4.4 R55-SHIFT;
  - §4.5 R52-EDGE;
  - §4.6 R54-CROSS;
  - §4.7 R53-LANE, R52-TRIM, R52-PLAY (real audio, EP-*);
  - §4.8 R52-REG and REG-HYD.
- Use the same layout, labels, expected values and order, and record V with full double precision.
- Partial evidence is reported as partial, never as PASS.

### 4.8 G58-3 and the Ableton table

**G58-3 (anonymous workspace and purchase protection; last browser PASS in round 51).** Run it only if the servers are up, with a fresh browse state.
- `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- **No requests** to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code, including during the right-clicks, drags and click-after-press probes.
- An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401.
- `/studio/middle-east` shows "Sign in required".
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton** (workflow addendum 2026-10-11):
- **Re-used source:** Live 12 Reference Manual ch. 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/` §6.10, from B's capture `b-round-46/ableton-6.7-6.10-20261016.txt` (captured 2026-10-16, re-used 2026-10-18).
- **Not available:** no new capture, video or Live installation.
- **What the source covers:** none of this round's behaviours appear in it. The rows below are CZABA decisions. Their analogy is the native OS context menu and the WAI-ARIA menu pattern, not Live.
- **C gives two verdicts per row:** the CZABA requirement, and Ableton conformance.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| The press that dismisses a context menu, including its click, does nothing else | — | unconfirmed (no source) | CZABA rule D1 (native-menu analogy) | GM10, GM16, GM17, MN-DISMISS-BUTTON |
| The menu stays open while Follow auto-scrolls; a user scroll closes it | — | unconfirmed (no source) | CZABA rule S | GM13, GM21, MN-FOLLOW |
| Focus returns to its origin after a choice or a reposition plus Escape | — | unconfirmed; WAI-ARIA menu pattern, not Live | CZABA rule M10 | GM11, GM18, GM19 |
| No grid menu while the export dialog is open | — | does not apply (modal dialog) | CZABA rule M5 | GM20 |
| Grid width from the lane context menu | §6.10 | yes (round 57 row, unchanged) | content is a deliberate difference (round 57) | round-57 IDs |

### 4.9 Not run this round, and carried items (honest)

**Not run (not PASS) unless §4.6/§4.7 run:** the 4b-1 and 4a browser acceptance, and G58-3.

**Not run this round in any case:**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- a real `pointercancel`.

**Open C bugs:**
- **This round:** C-R57-01, C-R57-02.
- **Browser pending:**
  - C-R51-02 (unit-fixed, R57-FOCUS);
  - C-R53-01, C-R54-01, C-R54-02 (fixed at unit/probe level).
- **Later stages:** C-R51-01 (→ 4b-2 probe, round 59); C-R52-T1 (→ 4c).
- **C-R41-01** (TL-Q-VIEWPORT).
- **Tech Lead:**
  - C-R27-01, C-R6-02, C-R8-01 (quiet Chrome);
  - C-R23-01 + C-R38-01.

**Open Low / info:**
- R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE;
- R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE;
- A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG;
- A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP, A-R54-REVIEW-LOWS;
- INFO-R55-FREE-ROUND-UNGUARDED and A-R55-REVIEW-SHIFT-MIDDRAG-TEST (→ 4b-2);
- **new:**
  - A-R57-REVIEW-MENU-TEST-GAPS (Tab not prevented, a press inside keeps the menu open, listener removal on unmount; → 4b-2 list);
  - A-R57-REVIEW-TAB-BODY-FOCUS (accepted under M10);
  - A-R57-REVIEW-CONTEXTMENU-KEY (consistent with M12);
  - C-R57-PROBE-FOCUS-RING;
  - A-R57-REVIEW-PAGE-TRANSITION.

**`root-pre-push-review.md` (mtime 2026-10-07, unchanged):**
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
- **Partially measured:** R5-L3.
- **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
- **Medium:**
  - M1: loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value makes every consumer re-render.
- **Lows:** L1 (undo/redo during a gesture), L2 (`holdUntil` on a reschedule), L3 (Delete ignores `event.repeat`), L4 (a `setPointerCapture` throw leaves gesture state), L6 (export-dialog wording with the loop on), L7 (unbounded history), L8 (unguarded `new AudioContext`).

**`publication-checkpoint.json` (mtime 2026-10-17 11:11, unchanged):**
- SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work.
- Instruction files need portable paths.
- **Scrollbar refinement:** tokens on both timeline axes and the library; checks at 1280×720 and 1440×900.
- **Library and stems parity:** the SRW-12 tree and the SRW-11 panel; honest demo stems; find → stems → preview → drag.
- T12 continuation.

**Root items:**
- ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53 (seventh round; §6);
- ROOT-COMMIT-ROUND51: units 50–55, 56 and 57;
- ARCH-CHECKPOINT-SRW14-PREFS (re-requested, §6.3) and ARCH-CHECKPOINT-SRW13;
- GSTACK-ACL, GSTACK-NO-MOUSE;
- the CRLF Biome errors on auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; the stray `store/nul`; the git autocrlf warning on LF files.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T, R57-T), plus **R58-T:** with the menu open in your own Chrome, a click on the Snap button, Play or Export only closes the menu and nothing else happens. During playback with Follow on, the menu stays open while the view pages.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-57-r58-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-57-r58-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementGridMenu.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-57-r58-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
node -e "const s=require('fs').readFileSync('app/components/arrangement/StudioWorkspace.tsx','utf8');console.log((s.match(/\r\n/g)||[]).length,(s.match(/\n/g)||[]).length)"
npx vitest run app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/components/arrangement/ArrangementGridMenu.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx
npx biome lint app/components/arrangement/StudioWorkspace.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A; needed for C and for completion)

1. **Servers, seventh round:** start the Store dev server and the backend before C, **or answer yes/no: can they be restored in this environment?**
   - **Yes / started:** C runs §4.6, §4.7 and G58-3 this round.
   - **No:** that is external missing information. B then asks the user how completion is to be evidenced without a browser, because COMPLETE needs browser evidence and the purchase-protection check.
   - **Silence:** B keeps dispatching dependency-ordered, offline-verifiable stages and records the growing browser debt, ID by ID.
2. **Commit units:**
   - **Round 56** (4 test files + doc 049) is commit-ready on C's round-56 PASS.
   - **Round 57** is commit-ready as an **interim, unit-verified** change only. G1 is open, and its hunks share `StudioWorkspace.tsx`, `ArrangementLane.tsx` and `grid-snap-ui` with the uncommitted rounds 50–55, so it cannot be committed alone without splitting hunks.
   - **Rounds 50–55** are root's decision: no open offline defect, but no browser evidence.
   - Committing before A starts keeps round 58 separately reviewable.
3. **ARCH-CHECKPOINT-SRW14-PREFS** (bounded, non-gating; re-requested):
   - **Why now:** this is the sixth consecutive round on the `StudioWorkspace` owner.
   - **A's round-57 signals (recorded, not scheduled):**
     - **signal 4:** grid-menu open state, a mirror ref, a return-focus ref and three listeners in the workspace, making it the fifth view-pref consumer. The proposal is to move open state and return focus into the menu component.
     - **signal 3:** `releaseEditFocusOnTimelinePointerDown` has become a three-branch boolean that is edited round after round. The proposal is a list of (focused-predicate, target-predicate) pairs.
   - **Answer format:** keep/extract, value, risk, ≤ 3 sentences. An approved change becomes its own B task with one owner.
4. **Optional:** a root `testTimeout` or worker cap (the systemic lever from round 56).

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-58.md`:**
1. the pre-flight gate and the §1.2 baseline (case A/B);
2. the diff summary per file with EOL counts;
3. GM16–GM21 with alone durations;
4. mutations a–h;
5. smoke (if any);
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-58.md` and `c-round-58.json`** (usual schema). Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment). Cover:
- R58-S, R58-U, G58-1, G58-2;
- §4.6, §4.7 and G58-3, or "not run (environment)";
- the Ableton rows;
- the carried items.

`passed` lists only IDs run this round. State **commit readiness** for root, separately for round 58, round 57, round 56 and rounds 50–55.

**Next (orientation only):**
- **Round 59:**
  - Round-58 bugs or browser bugs first.
  - Otherwise **stage 4b-2**:
    - narrow/widen keys (B first checks Chrome's handling of Ctrl+1/Ctrl+2, CTRL-DIGIT-BROWSER-RESERVED; without a browser B records it as unconfirmed and picks keys that do not depend on it);
    - the C-R51-01 probe (browser) or its recorded debt;
    - the INFO-R55-FREE-ROUND-UNGUARDED and SHIFT-MIDDRAG tests;
    - the A-R57-REVIEW-MENU-TEST-GAPS items.
- **Then:**
  - stage 4c (C-R52-T1, group-move edges, library-drop edges);
  - SRW-15 (+ stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20;
  - the Lows; SRW-21;
  - full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 58 -StartPhase A` and a higher limit.
