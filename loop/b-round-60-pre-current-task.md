# CURRENT TASK — Round 60: SRW-14 stage 4b-2b, the end of stage 4b. Three grid-control bugs: `1`/`2` on the focused division select (C-R59-01), a right-click on the open menu (ROOT-R50-58-L3), and a lost dismiss release (ROOT-R50-58-L2). Plus the remaining 4b menu test gaps.

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-18
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- **Decision record:** **D-29z25** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-59.md`.
- **Round size:** one owner (A), one feature area (grid division control and its menu), **three tightly related bugs**, plus the test-only 4b-2b gaps planned for this round:
  1. **C-R59-01 (Low, C bug, UX).** With the header division `<select>` focused, `1` jumps to **10 s** through native type-ahead. The same select's tooltip says `1 — უფრო მჭიდრო`. Chrome keeps focus on the select after a mouse choice, so this is the most likely moment to try the hint.
  2. **ROOT-R50-58-L3 (Low).** A right-click on the open grid menu itself shows Chrome's native context menu on top of it.
  3. **ROOT-R50-58-L2 (Low; the same defect as A-R58-REVIEW-HELD-PRESS-KEY-CLICK).** If the dismissing press loses its `pointerup` (for example Alt-Tab while held), the armed swallow eats the next keyboard-activated click (Enter/Space on a button).
  4. **4b-2b tests (test-only):** A-R57-REVIEW-MENU-TEST-GAPS, A-R58-REVIEW-AFTEREACH-RELEASE (= ROOT-R50-58-L4), A-R58-REVIEW-CANCEL-RIGHT-UNTESTED, A-R58-REVIEW-RIGHTCLICK-TRAP.
- **Not in this round (recorded, not dropped):**
  - **ROOT-R50-58-L1** (a vertical scroll during Follow does not close the menu). It would be a fourth source bug, and C could not reproduce it (no vertical overflow with 4 lanes). C runs a probe this round (VSCROLL-PROBE, §4.6). B schedules from that evidence.
  - **ROOT-R50-58-L5** and root's `useArrangementGridMenu` proposal are architecture signals (§6.3).
  - **C-R59-02** (a plain wheel with no vertical overflow scrolls nothing, so the menu stays open) is info and accepted. Rule S is scroll-based; wheel-dismiss would be a contract change that nobody requested.

> **Servers are UP now** (B, 14:15 +04: `/studio-lab` 200, `:5199` 200; `b-round-59/gates.txt`). C saw them come up during round 59 (5199 gave 500 once at 13:23, then 200 at 13:55).
> - Check both at the start of A and of C, and record the result. Agents never start or stop servers.
> - If either is down, run everything offline and write "not run (environment)" for the browser items.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every right-click, drag, held press and real-click-after-press case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Do not export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 59 result** (`c-round-59.md`, `c-round-59.json`): **C PASS**, including the browser half, for the first time since round 51.
- **Offline:** G59-2, R59-S (AST: 25 old menu `it` identical; exactly 3 suffix-only literals in `grid-snap-ui`), R59-U (a–m plus extras q and s killed; n, n2 and p survive as expected), G59-1 (89 / 1544, verify rc 0 on attempt 1).
- **Browser:**
  - **G59-3 PASS:** anonymous workspace; no forbidden requests; token 401; `/studio/middle-east` asks to sign in. A fake Bearer now gives **403**, not 500.
  - KEY-* PASS; the round-58 half PASS (MN-DISMISS-BUTTON at both sizes); the round-57 half PASS (R57-FOCUS closes C-R51-02).
  - The carried 4a half PASS except EG-GROUP (a wording mismatch, C-R59-03).
- **Closed by C evidence:** C-R58-01, C-R58-02, C-R58-INFO-M, A-R57-REVIEW-DISMISS-CLICK (G1), A-R57-REVIEW-FOLLOW-SCROLL (G6) and C-R51-02.
  - C-R52-03, C-R53-01, C-R54-01 and C-R54-02 are closed with a caveat: they are proven at regression level only. V = 6.008 is a whole millisecond, so sub-millisecond exactness stays unit-only.
- **New:** C-R59-01 (Low), C-R59-02 (info), C-R59-03 (B ruling, §0.5). Root's `root-review-r50-58.md` adds five Lows (L1–L5).
- **B rulings on round-59 deviations:**
  - **D1** (the `changeGridDivision` deps hunk): accepted. C showed the Biome warning without it.
  - **D2** (a `readonly number[]` local): accepted. It is an annotation, not an assertion.
  - **D3 / D4** (stronger GM23 and GK4 assertions; the GK10 query): accepted.
  - **D5** (the orchestrator said 5173 was up while it returned 000): this is the second round in a row. Reported to root.

**Why these three bugs together (D-29z25):** all three are input-handling defects of the same grid control and its menu, found by C's browser run and root's review.
- They fit in two owned source files: `StudioWorkspace.tsx` (select) and `ArrangementGridMenu.tsx` (menu).
- The 4b-2b test gaps are in the same menu test file and the same swallow lifecycle, so they close stage 4b in one round. Stage 4c stays at round 61.

## Baseline

Measured by B on 2026-10-18 at 14:15 +04 (`b-round-59/gates.txt`).

**The content baseline decides; HEAD may differ.** Root holds `root-publish/pending/r50-58-cb12805.bundle` (rounds 50–58 on top of `038ed5a`) and may apply it, and round 59, before or during this round. Any of these is valid:
- **(A)** HEAD `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` has **28 lines** (the 26 round-50–58 paths, `?? …grid-snap-keys.test.tsx` and `?? docs/…/052-…md`).
- **(B)** HEAD `cb128056…` (root applied rounds 50–58), and `git status --short` has exactly the **6 round-59 lines**:
  - ` M`: `StudioWorkspace.tsx`, `grid.ts`, `grid-snap-menu.test.tsx`, `grid-snap-ui.test.tsx`;
  - `??`: `grid-snap-keys.test.tsx`, doc 052.
- **(C)** HEAD is a newer **root** commit that also contains round 59, and `git status --short` is empty.

**In every case:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-59-r60-tree-sha256.txt` has **416** entries, all OK (run it from `store/`).
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned files below.
  - **`grid.ts`, `grid-snap-ui.test.tsx` and doc 052 are frozen this round.**
- **Snapshots:** `../tmp/studio-real-loop/b-round-59-r60-snapshots/` with `SHA256SUMS.txt`. None of the 4 files may differ from its snapshot:

  | File | sha256 prefix | EOL (CRLF / LF) | `it` |
  |---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `44adb8f3` | **CRLF** 1783 / 1783 | — |
  | `app/components/arrangement/ArrangementGridMenu.tsx` | `3b8c309c` | 0 / 197 | — |
  | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | `bb56ecf0` | 0 / 850 | 28 (GM1–GM24 in describe 1; FR1–FR4 in describe 2) |
  | `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` | `c9f82274` | 0 / 421 | 12 (GD1–GD2; GK1–GK10) |

- **B's check:** these hashes equal C's round-59 end hashes (`c-round-59.md` G59-2). The frozen list is 416/416 OK. Protected files are 4/4 OK.
- Anything else is a **stop and report**: a frozen or snapshot mismatch, or a status that fits none of A/B/C.

**Other measurements:**
- `node.exe` 12. Full vitest at round-59 end: **89 files / 1544** (A and C both rc 0).
- Biome `./app`: **5 / 218 / 1**. The 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`.

**Line endings (the CRLF trap):**
- **`StudioWorkspace.tsx` stays CRLF.** After the edit every line is CRLF, with 0 bare LF.
- **Never run `npx biome check --write` or `format --write` on it.** Check its formatting with:

  ```
  biome format --stdin-file-path=app/components/arrangement/StudioWorkspace.tsx < <LF copy>
  ```

  The output must equal the LF copy.
- `ArrangementGridMenu.tsx`, both test files and doc 053 are LF.
- Count EOLs with node (`/\r\n/g` vs `/\n/g`). Diff with `diff -u --strip-trailing-cr` against the snapshots.

**Rules:**
- Do not revert, re-create or reformat anything; the work of rounds 47–59 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z25-S: `1` / `2` on the focused division select (C-R59-01)

**S1. Behaviour.**
- With the header division `<select>` (`arrangement-grid-division`) focused, plain **`1`** (`event.code === 'Digit1'`) narrows and plain **`2`** (`Digit2`) widens, exactly like the workspace shortcut:
  - the same next division;
  - the same status text `ბადე: 0.5 წმ (Snap …)`;
  - the same end messages (`GRID_NARROWEST_MESSAGE` / `GRID_WIDEST_MESSAGE`).
- The keydown is `preventDefault()`ed, which suppresses Chrome's type-ahead for that key.
- Focus stays on the select.
- An `event.repeat` keydown is prevented but does not step (one step per press, as in the window branch).

**S2. Not handled on the select.** These are neither prevented nor stepped:
- Ctrl, Meta, Alt or Shift held;
- every other key: arrows, Home/End, the other digits, letters, Enter, Space and Escape. They keep their native select behaviour, so `5` still type-aheads to `5 წმ`.

While the export dialog is open (`exportOpenRef.current`), the select handler does nothing.

**S3. Where and how (`StudioWorkspace.tsx` only):**
- **Extract the body of the round-59 digit branch** into one `stepGridDivision(direction: 'narrow' | 'widen')` `useCallback`. It reads `gridSecondsRef`, calls `adjacentGridDivision`, then either calls `changeGridDivision(next)` or sets the end status.
- **The window branch** keeps its guards in the same order (after `if (modifier) return;`, `!altKey && !shiftKey`, `preventDefault`, then the repeat return) and then calls `stepGridDivision`.
- **Add an `onKeyDown` to the select** with the S1/S2 guards. It calls the same `stepGridDivision`.
- **No `stopPropagation` is needed.** The window handler already returns early for `isTypingTarget(select)` (l.1148–1153), so there is no double step. C reads this as a scope check. **Do not change `isTypingTarget`.**
- **Effect deps:** exactly what `biome lint` requires, with 0 diagnostics. Round 59's D1 precedent applies.
- `aria-keyshortcuts="1 2"` and both `title` suffixes **stay unchanged**. They are now truthful on that element, which also resolves A-R59 reviewer #3.
  - `grid-snap-ui` is frozen; its three title literals do not change.
  - Reviewer #6's ". · " punctuation is **not** fixed this round. It is recorded as a Low.
- `G` on the focused select still does nothing (unchanged, recorded).
- **This supersedes round 59's GK9 / KEY-SELECT contract** ("digits belong to the native select"). Doc 052 stays frozen; doc 053 records the supersession in one sentence.

### 0.2 Rule D-29z25-C: a right-click on the open menu (ROOT-R50-58-L3)

- Add `onContextMenu={(event) => event.preventDefault()}` on the menu root `div` (`role="menu"`) in `ArrangementGridMenu.tsx`.
- **Effect:** a right-click anywhere on the open menu shows no native menu and changes nothing:
  - the menu stays open;
  - one menu;
  - same position;
  - same focus and same division.
- **Why nothing else happens:**
  - the right `pointerdown` inside the menu already returns early, so there is no close and no swallow;
  - the menu renders at the workspace root (`StudioWorkspace.tsx` l.1769), outside any lane, so the lane's `onContextMenu` (reposition) is never reached.

### 0.3 Rule D-29z25-R: release the armed swallow on a key or a window blur (ROOT-R50-58-L2)

In `armGridMenuDismissClickSwallow` (`ArrangementGridMenu.tsx`):
- **also release** on a capture-phase `keydown` on the window (any key) and on window `blur`;
- **`releaseClickSwallow` removes both listeners**, together with the four existing ones.

**What changes:**
- After a dismissing press whose `pointerup` was lost, the next Enter/Space-activated click (or any click after a key or a blur) is **not** swallowed.
- **Recorded trade-off (doc 053):** if the user presses a key **while still holding** the dismissing press, the eventual release click is no longer swallowed. That is the same as the behaviour before round 58, and it is rarer than a lost `pointerup`.

**What does not change:**
- The pointer path: arm on an outside press, swallow the next click, release on `pointerup`/`pointercancel` plus one macrotask, or on the next `pointerdown`. Nothing that releases may cancel its event (C-R58-02).
- The inside-menu return, M6 reposition, and the menu's own keyboard handling (the menu is closed whenever the swallow is armed).

**Pre-check by B:** no existing `grid-snap-menu` test dispatches a `keyDown` between an arming press and a `click`.
- GM10, GM16, GM17, GM22 and GM23 were read.
- The `keyDown` calls at l.255, 292, 410 and 497 are not in an armed window.
- So the 28 existing assertions should not change. **If any existing `it` fails or must change under this rule, stop and report to B.** Do not edit it.

### 0.4 Rule D-29z25-T: the 4b-2b test gaps

- **A-R57-REVIEW-MENU-TEST-GAPS:**
  - Tab is not prevented and closes the menu → GM30;
  - listener removal on unmount → GM31;
  - "a press inside keeps the menu open" is **already covered** by GM22 l.722–723 (`pointerDown` on an item, then `gridMenu` not null). Closed by this B ruling; no new test.
- **A-R58-REVIEW-AFTEREACH-RELEASE = ROOT-R50-58-L4:** the `afterEach` in `grid-snap-menu` gains a release step and a probe (§2.2 (1)).
- **A-R58-REVIEW-CANCEL-RIGHT-UNTESTED:** the `pointercancel` release → GM28; a right-button dismiss followed by a bare click → GM29.
- **A-R58-REVIEW-RIGHTCLICK-TRAP** (info): this is addressed by the `afterEach` release and by an authoring note in doc 053: "`rightClick()` while the menu is open arms the swallow because it never sends `pointerup`". **The `rightClick` helper does not change.**

### 0.5 B ruling: C-R59-03 (EG-GROUP wording)

- **The documented group rule is the anchor rule** (doc 044 l.23, stage 1; implemented by `snapGroupDelta` / `groupDeltaOnGrid`): the dragged clip's **absolute start** lands on a grid line, and every selected clip moves by that same delta.
- `tasks/round-55.md` §4.5 EG-GROUP said "a multiple of 10 s from their starts". That wording was wrong. **The archive is not edited.**
- **Corrected criterion:** "the anchor's start lands on a grid line (here 10), every selected clip moves by the same delta, or all stay with the group-bounds status; no edge capture."
- C confirms against its existing log `c-round-59/runs/r59e-1440x900-g3_g4.txt` (anchor 4 → 10, music 7 → 13, one delta of 6) **read-only, with no re-run** (§4.7).
- **Status:** C-R59-03 is `closed (task wording)`.
- **Ableton:** unconfirmed. There is no source for Live's multi-clip snap anchor.

### 0.6 Source

| File | Change |
|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | §0.1 S3 only: `stepGridDivision`, the window digit branch calling it, the select `onKeyDown`, deps. CRLF preserved. Nothing else. |
| `app/components/arrangement/ArrangementGridMenu.tsx` | §0.2 (`onContextMenu` on the root) and §0.3 (the `keydown` and `blur` release). Nothing else. |

- **Frozen:** everything else, including `grid.ts`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `selection.ts`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementTransport.tsx`, `grid-snap-ui`, `grid.test.ts` and docs 001–052.
- No comments, no `any`, no type assertions, no `@ts-ignore`, semicolons, Georgian UI text.

### 0.7 What could be affected (C checks)

- **The header select:**
  - a mouse choice and arrows behave as before (`grid-snap-ui` GS* unchanged);
  - other digits still type-ahead;
  - `G` still does nothing there.
- **The window shortcut:** `1`/`2` on the body are unchanged (GK1–GK8, GK10).
- **Click swallowing:** MN-DISMISS-BUTTON (GM16/GM17) is unchanged; GM22 and GM23 are unchanged.
- **The menu keyboard:** Enter, Space, arrows, Escape and Tab inside the open menu are unchanged (GM7, GM8, GM11).
- **Expected suite: 89 files / 1552** (1544 + 8: GM25–GM31 and GK11; GK9 is rewritten in place).

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. Musical divisions and triplets belong to SRW-14 stage 5, after the SRW-15 BPM. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A), (B) or (C);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-59-r60-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - snapshots `SHA256SUMS.txt` and `cmp` for each owned file;
   - protected files 4/4; Biome numbers; `node.exe`; both servers.
3. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.1–§0.3 and §0.6.

### 2.2 Tests

**(1) `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` (LF).**

- **`afterEach` (ROOT-R50-58-L4):** before the existing two lines, add:
  1. RTL `cleanup()`, **imported from `@testing-library/react` and called first**. It is idempotent. Do not substitute `view.unmount()`: a still-mounted menu would treat the next window `pointerdown` (target `window`, not a `Node`) as an outside press and arm a fresh swallow;
  2. one `pointerdown` on `window` (it releases any swallow a test left armed);
  3. a probe `expect(fireEvent.click(document.body)).toBe(true)`.

  The existing lines stay. If the probe returns `false` for any test on the unmutated tree, **stop and report**. Do not relax it.
- **No other change** to the harness, `beforeEach`, the helpers or the 28 existing `it`. **Exactly these 7 new `it`**, appended inside the first `describe` after GM24:

| ID | Setup → action | Must assert |
|---|---|---|
| GM25 | **L3:** `rightClick` on a lane → `fireEvent.contextMenu` on the `0.5 წმ` item, then on the menu root | both return **`false`** (prevented); exactly 1 menu; the menu's `style.left`/`top` are unchanged; focus is still inside the menu; the division is `1` |
| GM26 | **L2 keydown:** open → `fireEvent.pointerDown` on the empty `sfx` lane (consumed; **no** `pointerUp`) → `fireEvent.keyDown(snapToggle, { key: 'Enter', code: 'Enter' })` → bare `fireEvent.click(snapToggle)`. Then reopen → arm the same way → `fireEvent.keyDown(document.body, { key: 'Shift', code: 'ShiftLeft', shiftKey: true })` (a non-shortcut key: proves that **any** key releases) → bare click on the Snap toggle | each click returns **`true`**; `data-snap` goes `on`, then `off`; `isPlaying` stays **`false`** throughout (Enter on a button has no workspace branch, l.1363–1366; **do not use Space**: on a non-typing target it toggles playback, l.1169) |
| GM27 | **L2 blur:** open → arm as in GM26 → `fireEvent.blur(window)` → bare `fireEvent.click(snapToggle)` | returns `true`; `data-snap` is `on` |
| GM28 | **cancel:** open → `pointerDown` on the `sfx` lane → `fireEvent.pointerCancel` with the same `pointerId` → one macrotask (`await act(async () => { await new Promise((r) => setTimeout(r, 0)); })`) → bare click on the Snap toggle | the menu is closed; the click returns `true`; `data-snap` is `on` |
| GM29 | **right-button dismiss:** open → `fireEvent.pointerDown(snapToggle, { button: 2, buttons: 2, pointerId: 32 })` → `fireEvent.pointerUp(snapToggle, { button: 2, pointerId: 32 })` (**`button: 2` must be explicit**: the default 0 would let mutation k survive) → `fireEvent.contextMenu(snapToggle)` → one macrotask → bare click on the Snap toggle | the menu closes on the press; `contextMenu` returns **`true`** (native, no CZABA menu; `gridMenu` stays null); the bare click returns `true`; `data-snap` is `on` |
| GM30 | **Tab:** open (focus on the checked item) → `fireEvent.keyDown(focused, { key: 'Tab', code: 'Tab' })` | returns **`true`** (not prevented); the menu is closed; the division is unchanged |
| GM31 | **unmount:** open → `view.unmount()` → `fireEvent.pointerDown(document.body, press)` → `fireEvent.click(document.body)` | both return **`true`** (no window listener survives the unmount) |

"Bare click" means `fireEvent.click` with no `pointerdown` before it. That is deliberate: a `pointerdown` would release the swallow on its own path and hide the rule under test.

**(2) `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` (LF).**

- **Narrow grant: GK9 only.** Its name and body are rewritten. The other 11 `it`, the harness and the describe options are unchanged.
- **One new `it`:** GK11, appended after GK10 in describe 2. Result: 13 `it`.

| ID | Setup → action | Must assert |
|---|---|---|
| GK9 (rewritten) | **C-R59-01:** `act(() => select.focus())` → `1` on the select → `2` on the select | each keydown returns **`false`**; after `1`: `data-grid-seconds` and the select value are `0.5`, the status is `ბადე: 0.5 წმ (Snap გამორთულია)`, and focus is still the select; after `2`: back to `1` |
| GK11 | **S2 guards on the focused select:** Ctrl+`1`, Meta+`1`, Alt+`1`, Shift+`1` (`key: '!'`); `1` with `repeat: true`; `5` (`code: 'Digit5'`); then choose `0.1` via the select `change` → `1`; then open the export dialog → `1` on the select | the four modifier keydowns and `5` return **`true`** and change nothing; the repeat returns `false` and changes nothing; at `0.1`, `1` returns `false`, stays `0.1` and shows the narrowest status; with the export dialog open the division is unchanged |

**Expected count:** vitest **89 files / 1552**. `grid-snap-menu` has **35** `it`, and `grid-snap-keys` has **13**.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Use a scratch copy with a `node_modules` junction and your own vitest config, as in round 59. Run on `grid-snap-keys`, `grid-snap-menu`, `grid-snap-ui` and `gesture-guard`. Each mutation must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | the select `onKeyDown` removed | GK9 |
| b | the select `preventDefault()` removed (the step stays) | GK9 |
| c | the select modifier guard dropped | GK11 |
| d | the select `repeat` check dropped | GK11 |
| e | the select `exportOpenRef` guard dropped | GK11 |
| f | `stepGridDivision` ignores its argument (always `'narrow'`) | GK2, GK9 |
| g | the menu `onContextMenu` removed | GM25 |
| h | the swallow `keydown` release removed | GM26 |
| i | the swallow `blur` release removed | GM27 |
| j | the swallow `pointercancel` listener removed | GM28 |
| k | `scheduleClickSwallowRelease` ignores non-primary buttons (`if (event.button !== 0) return;`) | GM29 |
| l | the menu's window `pointerdown` effect returns no cleanup | GM31 |
| m | the menu Tab branch calls `event.preventDefault()` | GM30 |

**Re-runs on the new tree:**
- round-58 a (swallow arm removed → GM16) and d (`closeGridMenu` on any scroll → GM21);
- round-59 a (window digit branch removed → GK1, GK2), j (arm before the inside return → GM22), k (release calls `preventDefault` → GM23) and m (`followModeRef === 'on'` dropped → GM24).

**Rules:**
- Write `a-round-60/mutations.txt` with the command, each result line and the failing test names.
- If a mutation survives, **strengthen that test** within §2.2. Do not add tests outside the list.
- **Spec-assumption stop:** if any §2.2 assertion fails on the **unmutated** tree, stop and report to B. Do not rewrite the assertion. Examples:
  - GM29's `contextMenu` returning `true`;
  - GM25's position check;
  - GM26's `isPlaying` staying `false`;
  - the `afterEach` probe.

### 2.4 After the change

- **Self-check:**
  - `npx tsc --noEmit` → 0;
  - full `npx vitest run` → **89 / 1552, 0 failures**;
  - `npm run build` → rc 0.
- **Biome:**
  - read-only `npx biome check ./app` → ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info;
  - the LF owned files (`ArrangementGridMenu.tsx`, `grid-snap-menu`, `grid-snap-keys`) → 0 diagnostics;
  - `StudioWorkspace.tsx` → `biome lint` 0, and the stdin format check equals the LF copy.
- **Review:** run the real `code-reviewer` subagent on the diff. Put findings and dispositions in the report.
  - **Architecture notes** go to B (`a-round-60.md` §6), not into code.
  - Reviewer items outside §0 go to B; they are not fixed this round.
- **`/check`:** `npm run verify` → exit 0, run quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke (servers up):** one gstack load of `/studio-lab` at 1440×900 → click the division select → Escape → `1` → read `data-grid-seconds` (expected `0.5`). This is not a PASS claim.

### 2.5 Doc 053

New file `docs/implementation/2026/quarter-IV/053-studio-lab-grid-select-keys-menu-release.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 60 — D-29z25; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** C-R59-01 (measured in the browser: the jump to 10 s); root L2/L3/L4; the 4b-2b gaps; the end of stage 4b;
- **Approach:** S1–S3, C, R.
  - **Alternatives:**
    - (a) move the hint off the select (rejected: the jump stays after a mouse choice);
    - (b) blur after `onChange` (rejected: breaks arrow navigation on a closed select);
    - for L2, release only on Enter/Space (rejected: any key is simpler and covers keyboard activation).
  - **Supersession:** one sentence that round 59's GK9 / KEY-SELECT contract (doc 052) is replaced by D-29z25-S.
  - **The recorded trade-off** of §0.3; the `rightClick()` authoring note;
- **Changed files;**
- **Problems and solutions;**
- **Testing:** GM25–GM31, GK9, GK11, the `afterEach` probe, mutations a–m and the re-runs, gates;
- **Ableton** (the §4.8 table);
- **TODO:** round 61 (4c), VSCROLL-PROBE → L1, the ARCH checkpoint.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.1 S3 (CRLF kept) |
| `app/components/arrangement/ArrangementGridMenu.tsx` | A | §0.2, §0.3 |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | A | the `afterEach` addition and GM25–GM31 |
| `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` | A | narrow grant: GK9 rewritten, plus GK11 |
| `docs/implementation/2026/quarter-IV/053-studio-lab-grid-select-keys-menu-release.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-60.md`, `a-round-60/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-60.md`, `c-round-60.json`, `c-round-60/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:**
- **Case A: 29 lines.** The 28 baseline lines plus `?? docs/…/053-…md`. The owned files keep their baseline status codes (StudioWorkspace ` M`; ArrangementGridMenu, grid-snap-menu and grid-snap-keys `??`).
- **Case B: 8 lines.** The 6 round-59 lines, plus ` M ArrangementGridMenu.tsx` and `?? doc 053`.
- **Case C: 5 lines.** ` M` StudioWorkspace, ArrangementGridMenu, grid-snap-menu and grid-snap-keys, plus `?? doc 053`.

The frozen list must stay 416/416 OK.

### 3.2 Frozen this round

- Everything in `b-round-59-r60-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**` and `root-publish/**`.
- **Also not allowed:**
  - new dependencies or installs; deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments (mutations run in scratch only);
  - killing processes you did not start; starting or stopping the dev server;
  - `npm run format`;
  - deleting `playwright-report/` or `store/nul` (root's call).

## 4. Acceptance (C)

**Checkpoint order:** G60-2 → R60-S → R60-U → G60-1 → (servers up) G60-3 → §4.6 → §4.7.
- Write `c-round-60/checkpoint.md` as you go.
- Check both servers at the start, after the offline items and before the report, and record each check. Do not start them.

### 4.1 R60-S — static (read-only)

- **`diff -u --strip-trailing-cr` against the snapshots:**
  - **`StudioWorkspace`:** only `stepGridDivision`, the window digit branch now calling it (its guards and their order unchanged), the select `onKeyDown`, and the deps.
    - The window handler still returns early for `isTypingTarget`, so there is no double step on the select. Read it.
    - `isTypingTarget` is unchanged.
  - **`ArrangementGridMenu`:** only the root `onContextMenu`, and the `keydown` (capture) and `blur` release, with both added to `releaseClickSwallow`.
  - **`grid-snap-menu`:** the `afterEach` addition and the 7 new `it`. The 28 existing `it` are AST-identical (C's `asteq-it.cjs` or equivalent, with a negative control).
  - **`grid-snap-keys`:** only GK9 differs among the old 12, and GK11 is appended.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **EOL:** `StudioWorkspace` has every line CRLF with 0 bare LF; the others are LF.
- **Tree:** frozen list 416 OK; protected 4/4. Doc 053 exists with the §2.5 sections.

### 4.2 R60-U — unit and mutation (C's own scratch, own strings)

- **Mutations a–m and the §2.3 re-runs:** re-run them in your own scratch with your own edits; each must kill its named tests.
- **C extras (info), suggested:**
  - (n) the `afterEach` release removed → does any test fail? Info either way.
  - (p) the select handler also handles `Numpad1` → expected to survive (unbound by design).
  - (q) `stopPropagation` added to the select handler → expected to survive (no double step either way). Record it.
- **Durations:** run `grid-snap-keys` and `grid-snap-menu` alone and record them. A test over 3 s alone is info.

### 4.3 G60-1 — gates

- tsc 0; build passes.
- **Biome:** read-only `./app` within the baseline; the 3 LF owned files 0 diagnostics; `StudioWorkspace` lint 0 and stdin format unchanged.
- **vitest = 89 files / 1552, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, run quietly, with at most two quiet attempts, each recorded. If neither attempt gives rc 0, G60-1 is FAIL.
- Record any `Test timed out` with file, test and ms.

### 4.4 G60-2 — tree

- Protected files 4/4 OK; frozen list 416 OK.
- `git status --short` matches §3.1 for the observed case; HEAD at start and end.

### 4.5 Not run, or not testable

- **If the servers are down:** write "not run (environment)" for G60-3, §4.6 and §4.7.
- **Not testable headless; never PASS:**
  - keys while the native select popup is **open** (Chrome renders it outside the page);
  - a real Alt-Tab during a held press;
  - Ctrl/Cmd+digit (CDP).

  These go to Tech Lead R60-T.

### 4.6 Browser acceptance (servers up; gstack REAL for keys, REAL-mouse (PW) for right-clicks and held presses)

Test at **1440×900**, then repeat the starred items at **1280×720**.

| ID | Steps | Pass |
|---|---|---|
| SEL-KEYS* | REAL click on the division select → Escape (the popup closes, focus stays) → `1` → `2` → `1` → `1` → `1` | 1 → 0.5 → 1 → 0.5 → 0.25 → 0.1; status after each step; focus stays on the select; no jump to `10 წმ` |
| SEL-ENDS | on the focused select at 0.1 → `1`; set 10 with `2` presses → `2` | narrowest / widest status, no change |
| SEL-NATIVE | focused select → `5`; → ArrowUp / ArrowDown | `5` type-aheads to `5 წმ` (native); arrows move one option each (native `change`); record both |
| SEL-MOD | focused select → `Shift+1`, `Alt+1` | no step; record what native does (expected: nothing) |
| SEL-SNAP | after SEL-KEYS at 0.5 with Snap on (`G` on the body), drag a clip (REAL-mouse PW) | it lands on a 0.5 s multiple |
| MN-CONTEXT* | open the menu (PW right-click on a lane) → PW right-click on a menu item, then on the menu edge | `contextmenu` `defaultPrevented: true` both times; one menu, same rect, focus inside; division unchanged; Escape closes it |
| MN-KEY-RELEASE | before opening, focus the Export button (`locator.focus()`; record the method) → PW right-click a lane (menu opens) → `mouse.down` on an empty lane spot and **hold** (the menu closes and focus returns to Export) → `keyboard.press('Enter')` → Escape the dialog → `mouse.up` | **Enter opens the export dialog** (not swallowed). Record what the final release does (expected: the release click is no longer swallowed — the §0.3 trade-off); info |
| MN-BLUR-PROBE | arm as above (held press) → `page.evaluate(() => window.dispatchEvent(new Event('blur')))` → `mouse.up` far away → a REAL click on Snap | **synthetic probe, labelled PROBE, not REAL.** Snap toggles on the first click |
| MN-DISMISS-BUTTON* (regression) | `tasks/round-58.md` §4.6 MN-DISMISS-BUTTON, unchanged | as written there |
| MN-KEYS (regression) | `tasks/round-57.md` MN-KEYS | as written there, including Space in the menu choosing without playback |
| KEY-NARROW, KEY-TYPE (regression) | `tasks/round-59.md` §4.6 | as written there |
| MN-FOLLOW (regression, 1440 only) | `tasks/round-58.md` MN-FOLLOW | as written there |
| VSCROLL-PROBE (ROOT-R50-58-L1 evidence) | 1280×720: make the lanes taller with the track-height handle (REAL-mouse PW) or its keyboard (Arrow on the focused separator) until the timeline scroller has `scrollHeight − clientHeight > 0` → Follow on, Play → open the menu → a vertical wheel over the lanes away from the menu | record `scrollTop` before and after, whether a `scroll` event fired, whether the menu stayed open, and the Follow mode. **Evidence for B, not PASS/FAIL.** Expected per root: the menu stays open |

### 4.7 Carried items (servers up; read-only where stated)

- **EG-GROUP (C-R59-03), read-only:** check the corrected criterion of §0.5 against `c-round-59/runs/r59e-1440x900-g3_g4.txt`. Record PASS or FAIL against it, with no re-run.
- **SEL-AFTER-MOUSE (Tech Lead):** choose a division with the mouse in the open native popup, then press `1`. Not testable headless; this is R60-T.

### 4.8 G60-3 and the Ableton table

**G60-3 (anonymous workspace and purchase protection).** Run it with a fresh browse state, as in G59-3.
- `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- **No requests** to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code, including during the SEL, MN and probe runs.
- An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401. Record the fake-Bearer code (403 in round 59).
- `/studio/middle-east` shows "Sign in required".
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton** (workflow addendum 2026-10-11):
- **Re-used source:** Live 12 Reference Manual §6.10 "Using the Editing Grid", `https://www.ableton.com/en/live-manual/12/arrangement-view/`, from B's capture `b-round-46/ableton-6.7-6.10-20261016.txt` (captured 2026-10-16, re-used 2026-10-18).
- **Not available:** no video and no Live installation.
- **C gives two verdicts per row:** the CZABA requirement, and Ableton conformance.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Narrow/widen keys act wherever the grid control has focus | §6.10 (Ctrl+1/2) | the shortcuts are confirmed; focus on a division widget is **not applicable** (Live has no division select) | CZABA: `1`/`2` act on the body and on the focused select alike (D-29z25-S) | GK9, GK11, SEL-KEYS |
| The grid width is offered in the track context menu | §6.10 | yes (round-57 row) | unchanged | regression only |
| A right-click on an open context menu | — | unconfirmed (no source) | CZABA: no native menu; nothing changes | GM25, MN-CONTEXT |
| A dismissed menu's click, after a key or a window blur | — | unconfirmed (no source) | CZABA rule D-29z25-R | GM26–GM29, MN-KEY-RELEASE |
| Multi-clip move: the anchor snaps to the grid | — | unconfirmed (no source) | CZABA anchor rule (doc 044 l.23) | EG-GROUP (read-only) |

### 4.9 Not run this round, and carried items (honest)

**Not run this round in any case:**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- the stage-4a/4b full browser re-run (passed in round 59; only the §4.6 regressions run).

**Open C items:**
- **This round:** C-R59-01.
- **Later stages:**
  - C-R51-01: the probe is done. The discriminator is "no `drop` and `dragend.dropEffect === 'none'`". **B decides in the 4c dispatch.**
  - C-R52-T1 (→ 4c).
- **C-R41-01** (TL-Q-VIEWPORT).
- **Tech Lead:**
  - C-R27-01, C-R6-02, C-R8-01 (quiet Chrome);
  - C-R23-01 (5 NUL bytes in round 59) + C-R38-01.

**Open Low / info:**
- R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE;
- R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE;
- A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG;
- A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP, A-R54-REVIEW-LOWS;
- INFO-R55-FREE-ROUND-UNGUARDED and A-R55-REVIEW-SHIFT-MIDDRAG-TEST (→ 4c, round 61);
- A-R57-REVIEW-TAB-BODY-FOCUS, A-R57-REVIEW-CONTEXTMENU-KEY, A-R57-REVIEW-PAGE-TRANSITION, A-R58-REVIEW-ANDROID-TAP-CLICK (Tech Lead, touch);
- **from round 59:**
  - C-R59-02 (accepted);
  - ROOT-R50-58-L1 (VSCROLL-PROBE first);
  - ROOT-R50-58-L5 (architecture);
  - A-R59-REVIEW-END-INDEX (reviewer #4: `GRID_DIVISIONS_SECONDS[6]` / `[0]`);
  - A-R59-REVIEW-REANNOUNCE (#5);
  - A-R59-REVIEW-PUNCTUATION (#6).

**`root-pre-push-review.md`** (mtime 2026-10-18 12:46:34; root appended the rounds 50–58 note; the 2026-10-07 content is unchanged):
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
- **Partially measured:** R5-L3.
- **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
- **Medium:**
  - M1: loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value makes every consumer re-render.
- **Lows:** L1–L4 and L6–L8.
- **`root-review-r50-58.md`:** L1–L5, as above. L2–L4 are in this round.

**`publication-checkpoint.json`** (mtime 2026-10-17 11:11:24, unchanged):
- SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work.
- Instruction files need portable paths.
- **Scrollbar refinement:** SRW-23 checks at 1280×720 and 1440×900.
- **Library and stems parity:** SRW-11/12.
- T12 continuation.

**Root items:**
- ROOT-COMMIT-ROUND51: the `cb12805` bundle (rounds 50–58) is pending; round 59 is its own 6-path unit;
- the orchestrator status line was wrong about 5173 two rounds in a row;
- ARCH-CHECKPOINT-SRW14-PREFS (narrowed; §6.3) and ARCH-CHECKPOINT-SRW13;
- GSTACK-ACL, GSTACK-NO-MOUSE;
- the CRLF Biome errors on auth files; ENV-BROWSE-DAEMON; the stray `store/nul`; the git autocrlf warning on LF files.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T, R57-T, R58-T, R59-T), plus **R60-T:**
- In your own Chrome, choose a division in the open select popup with the mouse, then press `1` and `2`: the grid steps, with no jump to 10 s.
- With the popup **open**, `1` may still type-ahead inside the popup. That is native; record what you see.
- While holding the mouse on an empty lane after opening the grid menu, Alt-Tab away and back: the next Enter on a focused button works.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-59-r60-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-59-r60-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementGridMenu.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-keys.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-59-r60-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
node -e "const s=require('fs').readFileSync('app/components/arrangement/StudioWorkspace.tsx','utf8');console.log((s.match(/\r\n/g)||[]).length,(s.match(/\n/g)||[]).length)"
npx vitest run app/lib/arrangement/__tests__/grid-snap-keys.test.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/components/arrangement/ArrangementGridMenu.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-keys.test.tsx
npx biome lint app/components/arrangement/StudioWorkspace.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A)

1. **Keep both servers up** through C round 60. Please also correct the orchestrator status line: it reported 5173 up while it returned 000, in rounds 58 and 59.
2. **Commit units:**
   - **Rounds 50–58:** the pending `cb12805` bundle. C now has browser evidence: G59-3, the round-57/58 halves and the 4a half. EG-GROUP is a wording ruling, not a defect.
   - **Round 59:** ready as its own interim unit (4 modified + 2 new, after `cb12805`).
   - **Round 60:** only after C round 60. Committing before A starts keeps round 60 separately reviewable.
   - All of these are interim checkpoints, not a release.
3. **ARCH-CHECKPOINT-SRW14-PREFS (narrowed).**
   - **Already answered:** `root-review-r50-58.md` gave root's verdict for the grid-menu part, recorded as of 2026-10-18: "extract `useArrangementGridMenu(...)` + shared `isFollowAutoScroll` in one bounded task; keep for now".
   - **Still open, please answer before the round-61 (4c) dispatch** (round 60 is the 4b feature boundary):
     - (a) the snap-preference plumbing (`snapEnabled` / `gridSeconds` + refs, now with 7 consumers including the select handler) versus a non-history edit-preferences slice;
     - (b) one time-precision rule (`roundTime` ms, `roundGridTime` ms, `toWholeMicroseconds`, the inline µs in `selection.ts`);
     - (c) A-R59's proposal of a shared grid test harness (`__tests__/harness/grid-workspace.tsx`; about 250 duplicated lines across `grid-snap-*`).
   - **Answer format:** keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task with one owner and behaviour-preserving tests.
4. **Optional:** a root `testTimeout` or worker cap.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-60.md`:**
1. the pre-flight gate and the §1.2 baseline (case A/B/C);
2. the diff summary per file with EOL counts;
3. GM25–GM31, GK9, GK11 and the `afterEach` probe, with alone durations;
4. mutations a–m and the re-runs;
5. smoke;
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-60.md` and `c-round-60.json`** (usual schema). Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment / not testable). Cover:
- R60-S, R60-U, G60-1, G60-2, G60-3;
- §4.6, §4.7 and the Ableton rows, with two verdicts each.

`passed` lists only IDs run this round. State **commit readiness** for root, separately for round 60, round 59 and rounds 50–58.

**Next (orientation only):**
- **Round 61:** round-60 bugs first. Otherwise root's ARCH answer, if any, as its own B task. Otherwise **stage 4c**:
  - group-move edge snap, with the C-R52-T1 start- and end-touch targets;
  - the library-drop edge decision and the C-R51-01 decision;
  - the INFO-R55 and SHIFT-MIDDRAG tests.

  ROOT-R50-58-L1 is scheduled from the VSCROLL-PROBE evidence.
- **Then:**
  - SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20;
  - the Lows; SRW-21;
  - full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 60 -StartPhase A` and a higher limit.
