# CURRENT TASK — Round 59: SRW-14 stage 4b-2a. Keyboard narrow/widen of the grid with plain `1` / `2`. First close C's round-58 menu test gaps (C-R58-01, C-R58-02, C-R58-INFO-M).

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-18
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- **Decision record:** **D-29z24** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-58.md`.
- **Round size:** one owner (A), one feature area (grid division control), one feature plus three tightly related C test gaps:
  1. **C bugs first (test-only, menu file).** These are the three survivors of C's round-58 mutations:
     - **C-R58-01 (Low):** if the click swallow is armed by a press **inside** the menu, no test fails. The real impact would be that a mouse choice in the menu is eaten.
     - **C-R58-02 (Low):** if the release on the next `pointerdown` also cancels that event, no test fails.
     - **C-R58-INFO-M:** the `followModeRef === 'on'` clause of the menu scroll rule is unguarded (Follow paused while playing).
  2. **Feature: grid narrow/widen keys** (SRW-14 stage 4 scope, Live 12 §6.10). Plain **`1`** narrows the grid (next smaller division) and plain **`2`** widens it (next larger). The menu and the header select stay as they are.
- **This is a reorder of 4b-2, not a cut.**
  - The remaining 4b test gaps go to **round 60**: A-R57-REVIEW-MENU-TEST-GAPS, A-R58-REVIEW-AFTEREACH-RELEASE, and the `pointercancel` / right-button dismiss tests (A-R58 #6).
  - INFO-R55-FREE-ROUND-UNGUARDED and A-R55-REVIEW-SHIFT-MIDDRAG-TEST go into **stage 4c** (round 61). They live in the same file and area (`grid-snap-clip-edges`).
  - The C-R51-01 probe is browser-only. It is C's item whenever the servers are up (§4.7); it is not A's.

> **ROOT ACTION REQUIRED BEFORE C (environment, not BLOCKED) — EIGHTH ROUND.**
> - `http://127.0.0.1:5173` and `:5199` have been down since round 52:
>   - C round 58: `000` at 12:04:19, 12:11:37 and 12:13:26, with no listener;
>   - B: `000` on 2026-10-18 at 12:19 (`b-round-58/gates.txt`).
> - **Never run in a browser:** the stage-4a, 4b-1 and round-58 browser acceptance. The anonymous-workspace / purchase-protection browser check last passed in **round 51** (G51-3), so it has been unverified for **seven rounds**.
> - `root-start-servers.cmd` exists in the loop folder, but the servers were not running. **Root:** start the Store dev server **and** the backend before C, **or answer yes/no: can they be restored here?** Agents never start or stop servers.
> - Round 59 is built and unit-verified offline. Its browser half (§4.6) and the carried halves (§4.7) run only if the servers are up.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every right-click, drag and real-click-after-press case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Do not export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 58 result** (`c-round-58.md`, `c-round-58.json`): **C PASS for every offline ID.**
- **PASS:**
  - G58-2 and R58-S, including C's AST check: the 19 old `it` are identical;
  - the swallow scope was read and confirmed;
  - R58-U: mutations a–h are killed, and round-57 a/d1 still kill;
  - G58-1: tsc 0, Biome at baseline, **88 / 1529**, build, and verify rc 0 on attempt 1.
- **Closed at unit level:** C-R57-01 (GM18), C-R57-02 (GM19) and A-R57-REVIEW-EXPORT-GUARD-TEST (GM20).
- **Fixed at unit level, browser pending, not closed:**
  - A-R57-REVIEW-DISMISS-CLICK (G1): MN-DISMISS-BUTTON is the only proof of the D2 timing assumption.
  - A-R57-REVIEW-FOLLOW-SCROLL (G6): MN-FOLLOW.
- **New C findings:** C-R58-01, C-R58-02 (Low test gaps) and C-R58-INFO-M.
- **Not run (environment, seventh round):** §4.6, §4.7 and G58-3.
- **B rulings on round-58 deviations:**
  - **D1** (the orchestrator said 5173 was up; it was not): noted. Root's status line was wrong; no action for A.
  - **D2** (GM17 uses `editSnapshot` equality): accepted. It is stronger than the spec.
  - **D3** (the second-press click return value in GM16 is not asserted): accepted.

**Why the C gaps come first, and why the keys come now (D-29z24):**
- The rule is C bugs first. The three C items are one-scenario assertions in the file A already owns, so they cost little.
- **Ctrl+digit is decided now instead of waiting for a browser.** CTRL-DIGIT-BROWSER-RESERVED cannot be settled by C even with the servers up. gstack and Playwright dispatch keys over CDP, and CDP keys never reach Chrome's accelerator layer (the same limit as ALT-CHROME-MENU). The question becomes a Tech Lead manual check (R59-T), and B chooses keys that do not depend on it (§0.2).
- Keeping 4b-2 waiting would leave a core SRW-14 behaviour blocked on an unsatisfiable precondition.

## Baseline

Measured by B on 2026-10-18 at 12:19 +04 (`b-round-58/gates.txt`).

**Content baseline:** one of these must hold.
- **(A)** HEAD is `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` lists **exactly these 26 paths**:
  - ` M`: `ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `StudioWorkspace.tsx`, `app/lib/__tests__/sfx-library.test.tsx`, and these under `app/lib/arrangement/__tests__/`: `fader-guards`, `grid-snap-edit`, `grid-snap-ui`, `master-ui`, `selection.test.ts`, `track-layout`; plus `app/lib/arrangement/grid.ts` and `selection.ts`.
  - `??`: `app/components/arrangement/ArrangementGridMenu.tsx`, and these under `app/lib/arrangement/__tests__/`: `grid-edges.test.ts`, `grid-snap-clip-edges`, `grid-snap-loop-drop`, `grid-snap-menu`, `grid-snap-position`; plus docs `046`–`051` in `docs/implementation/2026/quarter-IV/`.
- **(B)** Root has committed some or all of rounds 50–58:
  - HEAD is one or more newer **root** commits on top of `038ed5a`;
  - their combined stat contains only paths from the 26-path list;
  - `git status --short` lists exactly the 26-path list minus the committed paths.

**In both cases:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-58-r59-tree-sha256.txt` has **414** entries, all OK (run it from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned files below. **`ArrangementGridMenu.tsx` is frozen this round.**
- **Snapshots:** `../tmp/studio-real-loop/b-round-58-r59-snapshots/` with `SHA256SUMS.txt`. None of the 4 files may differ from its snapshot:

  | File | sha256 prefix | EOL (CRLF / LF) | `it` |
  |---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `ed3973b0` | **CRLF** 1761 / 1761 | — |
  | `app/lib/arrangement/grid.ts` | `5babc315` | 0 / 172 | — |
  | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | `0fde6b48` | 0 / 794 | 25 (GM1–GM21 in the first describe, FR1–FR4 in the second) |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | `63d3197c` | 0 / 733 | 20 (narrow grant, §0.2 K3) |

- **B's check:** `diff -rq store/app tmp/studio-real-loop/c-round-58/scratch/app` printed nothing, so this tree is byte-identical to the one C verified. The owned hashes equal C's end-of-round hashes.
- Anything else is a **stop and report**: another HEAD, extra paths, or a snapshot or frozen-list mismatch.

**Other measurements:**
- Protected files 4/4 OK; `node.exe` 9; `/studio-lab` 000; `:5199` 000.
- Full vitest at round-58 end: **88 files / 1529** (A and C both rc 0).
- Biome `./app`: **5 / 218 / 1**. The 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`.

**Line endings (the CRLF trap):**
- **`StudioWorkspace.tsx` stays CRLF.** After the edit every line is CRLF, with 0 bare LF.
- **Never run `npx biome check --write` or `format --write` on it.** Check its formatting with:

  ```
  biome format --stdin-file-path=app/components/arrangement/StudioWorkspace.tsx < <LF copy>
  ```

  The output must equal the LF copy.
- **`grid.test.ts` is CRLF too (166/166)** and is a baseline Biome error. **It is not owned. Do not touch it.** The helper tests go into the new LF test file.
- `grid.ts`, the menu test, the new test file and doc 052 are LF.
- Count EOLs with node (`/\r\n/g` vs `/\n/g`). Diff with `diff -u --strip-trailing-cr` against the snapshots.

**Rules:**
- Do not revert, re-create or reformat anything; the work of rounds 47–58 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z24-T: round-58 menu test gaps (test-only)

- The code paths exist and are C-verified. This round adds only the three assertions GM22–GM24 (§2.2).
- **No source change** in `ArrangementGridMenu.tsx` (frozen) or in the menu scroll rule.

### 0.2 Rule D-29z24-K: narrow/widen keys

**K1. Keys (CZABA decision; Live uses Ctrl+1 / Ctrl+2, see §4.8).**
- **Plain `1`** (`event.code === 'Digit1'`) **narrows** the grid: it moves to the next **smaller** entry of `GRID_DIVISIONS_SECONDS` (`[10, 5, 2, 1, 0.5, 0.25, 0.1]`, so 1 → 0.5 → 0.25 → 0.1).
- **Plain `2`** (`event.code === 'Digit2'`) **widens** it: it moves to the next **larger** entry (1 → 2 → 5 → 10).
- Match on `event.code`, as `shortcutLetter` does, so that Georgian and AZERTY layouts work. The numpad (`Numpad1`/`Numpad2`) is not bound; record that in doc 052.
- **Not handled at all:** Ctrl, Cmd (Meta), Alt or Shift held. The existing `if (modifier) return;` already lets Ctrl/Cmd+digit fall through to the browser untouched; keep that. Alt+digit and Shift+digit are ignored and **not** prevented.
- **Why not Ctrl+1/2:** in Chrome, Ctrl+1…8 switch tabs. Whether a page can prevent that cannot be tested by C, because CDP keys never reach the browser accelerator layer. Plain digits are unbound in the workspace today (checked by B in the keydown handler, `timelineNavigationKey` and `ArrangementGridMenu`). Plain digits keep Live's 1 = narrow / 2 = widen mnemonic without depending on the browser.

**K2. Where and how.**
- **A pure helper in `grid.ts`:** `export function adjacentGridDivision(current: number, direction: 'narrow' | 'widen'): number | null`.
  - It returns the neighbour in `GRID_DIVISIONS_SECONDS`.
  - It returns `null` at either end, and for a value that is not in the list (strict equality).
- **The keydown handler in `StudioWorkspace.tsx`:** one new branch **after** `if (modifier) return;`, next to the `'g'` branch, guarded by `!event.altKey && !event.shiftKey`:
  - call `event.preventDefault()`;
  - if `event.repeat`, do nothing more (one step per press, as with G);
  - otherwise call `adjacentGridDivision(gridSecondsRef.current, …)`:
    - if the result is a number, call the existing `changeGridDivision(next)`. That gives the existing status text `ბადე: 0.5 წმ (Snap ჩართულია)` / `(Snap გამორთულია)`;
    - if the result is `null`, set the status, with no state change:
      - narrowing at 0.1: **`ბადე უკვე ყველაზე მჭიდროა — 0.1 წმ (1)`**;
      - widening at 10: **`ბადე უკვე ყველაზე ფართოა — 10 წმ (2)`**.

      Build both strings with `formatGridDivision`, as module-level constants or functions.
- **The existing early returns stay** and therefore apply: the export dialog is open, a typing target (`isTypingTarget`), the Escape and Space branches, and navigation keys.
  - **`isTypingTarget` includes `HTMLSelectElement`** (`StudioWorkspace.tsx` l.220–232, B read it).
  - So with the header division `<select>` focused, `1`/`2` belong to the native select: its own type-ahead or keyboard selection, which reaches `changeGridDivision` through `onChange`. The shortcut does nothing there and does not prevent the default.
  - **Do not widen or narrow `isTypingTarget`.** That is frozen behaviour (GK9). While focus is inside the open grid menu, its `onKeyDown` stops propagation, so `1`/`2` do nothing there (GK10). **The menu is frozen.**
- **During a pointer gesture**, `1`/`2` are allowed, exactly like `G`. They are not added to the gesture-blocked key list, and the next `pointermove` reads the new `gridSecondsRef`. This is not tested this round; record it in doc 052.
- **During playback**, `1`/`2` change the division and playback continues: `changeGridDivision` does not touch transport.
- **Snap off:** the keys still change the division, and Snap stays off.

**K3. Discoverability (smallest; R14-G2 precedent: the shortcut is shown in the tooltip).** On the header division `<select>` (`arrangement-grid-division`):
- add `aria-keyshortcuts="1 2"`;
- append the suffix **` · 1 — უფრო მჭიდრო, 2 — უფრო ფართო`** to **both** existing `title` variants.

The Snap button, the menu items and the transport are unchanged.

**K3 narrow grant (B measured it before dispatch):** `grid-snap-ui.test.tsx` asserts the select `title` with `toBe` in three places. These are GS1 l.297 (`'ბადე 1 წმ'`), GS10 l.572 (the `HIDDEN_LINES_TITLE` constant, l.107–108) and GS10 l.583 (`'ბადე 0.1 წმ'`).
- **A may change only these three expected strings,** appending exactly the same suffix: two literals plus the constant.
- **Nothing else in that file changes:**
  - no other literal, `it`, describe option or harness line;
  - the `it` count stays 20.
- C checks this with an AST diff: only those three string literal nodes may differ.

**K4. Unaffected:** grid lines and their visibility rule, every snapping consumer (they read `gridSecondsRef` / `gridSeconds` as today), `G`, `+`/`-`/`Z`/`X`, arrows, Home, Delete, Enter, and the Ctrl shortcuts.

### 0.3 Source

| File | Change |
|---|---|
| `app/lib/arrangement/grid.ts` | §0.2 K2: the `adjacentGridDivision` export only. |
| `app/components/arrangement/StudioWorkspace.tsx` | §0.2 K2 (keydown branch + the two status constants) and K3 (select attributes). CRLF preserved. Nothing else. |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | the K3 narrow grant only: three expected select-title strings |

- **Frozen:** everything else, including `ArrangementGridMenu.tsx`, `ArrangementLane.tsx`, `selection.ts`, `ArrangementClip.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`, `view.ts`, `components/arrangement/index.ts`, `grid.test.ts` and docs 001–051.
- No comments, no `any`, no type assertions, no `@ts-ignore`, semicolons, Georgian UI text.

### 0.4 What could be affected (C checks)

- **`G` and the Snap button:** unchanged, including GM6 and the `grid-snap-ui` keyboard describe.
- **The header select:** a mouse choice works as before (`grid-snap-ui`), and its `title` gains only the appended suffix.
  - B's grep found the select-`title` `toBe` assertions only in `grid-snap-ui` (the K3 grant).
  - **A re-runs the grep** (§1.2). Any **other** test that asserts the select `title` is a **stop and report**.
  - `title` assertions on other elements (the Snap toggle l.293/l.406, delete, detail, library) are unaffected and stay unchanged.
- **Typing in the library search, the BPM-free inputs and dialogs:** a `1` typed there is text, not a grid change.
- **`grid-snap-ui`** passes with the three granted strings; every other GS test is unchanged.
- **The full suite: 89 files / 1544** (1529 + 15: GD1, GD2, GK1–GK10, GM22–GM24).

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. Musical divisions and triplets (Live Ctrl+3) belong to SRW-14 stage 5, after the SRW-15 BPM. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A) or (B);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-58-r59-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - snapshots `SHA256SUMS.txt` and `cmp` for each owned file;
   - protected files 4/4; Biome numbers; `node.exe`; dev-server state;
   - the §0.4 `title` check: `grep -rn "title" app/lib/ app/components/ --include=*.test.tsx | grep "ბადე"`. Expected hits: `grid-snap-ui` l.107–108, l.297, l.572 and l.583 only.
3. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.2 and §0.3.

### 2.2 Tests

**(1) Extend** `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` (LF) inside the first `describe`, after GM21:
- No change to the 25 existing `it`, the describe options, the harness, `beforeEach` or `afterEach`.
- **Exactly these 3 new `it`:**

| ID | Setup → action | Must assert |
|---|---|---|
| GM22 | **C-R58-01:** open the menu (`rightClick` on a lane) → on the `0.5 წმ` item: `fireEvent.pointerDown` (left, `press`) → `fireEvent.pointerUp` → `fireEvent.click` | the click is not swallowed: the division is `0.5` and the menu is gone. Then a full press on the Snap toggle (`pointerDown` → `pointerUp` → `click`) toggles `data-snap`, so nothing stays armed. |
| GM23 | **C-R58-02:** open the menu → `pointerDown` on the empty lane background (consumed; no `pointerUp`) → the next `fireEvent.pointerDown` on the Snap toggle | that second `fireEvent.pointerDown` **returns `true`**: the releasing press is not cancelled. The `click` that follows toggles `data-snap`. |
| GM24 | **C-R58-INFO-M:** `togglePlayback()` → read `anchor = scroller.scrollLeft` → set `scroller.scrollLeft = anchor + 200` and `fireEvent.scroll` (a user scroll while playing; assert `arrangement-follow` `data-follow-mode` is now `paused`) → open the menu → set `scroller.scrollLeft = anchor` (read it back) → `fireEvent.scroll` | the menu is **gone**: with Follow paused, a scroll back onto the stale follow anchor is a user scroll. Playback is still running, and the division is unchanged. |

**(2) New file** `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` (LF):
- **Harness:** copy the minimal harness from `grid-snap-ui.test.tsx` (fakes, `mountGridWorkspace`, `divisionSelect`, `snapToggle`, the clip helpers). Do not import from another test file.
- **Describe 1:** `'SRW-14 stage 4b-2a adjacentGridDivision'`, no options, pure.
- **Describe 2:** `'SRW-14 stage 4b-2a narrow/widen keys (D-29z24-K)'` with `{ timeout: 15_000 }`.
- **Key events:** dispatch with `fireEvent.keyDown(target, { key: '1', code: 'Digit1', ... })` on `document.body` unless the row says otherwise. Read the division from `arrangement-grid-control` `data-grid-seconds` and the select value. Read the status from the workspace status line, as `grid-snap-ui` does.
- **Exactly these 12 `it`:**

| ID | Setup → action | Must assert |
|---|---|---|
| GD1 | the narrow walk from 10 | 10 → 5 → 2 → 1 → 0.5 → 0.25 → 0.1, then `null` |
| GD2 | the widen walk from 0.1; unknown values | 0.1 → … → 10, then `null`; `adjacentGridDivision(0.3, 'narrow')` and `(0.3, 'widen')` are `null` |
| GK1 | default (1 s, Snap **off**, as GS1) → `1` | `fireEvent.keyDown` returns `false`; `data-grid-seconds` is `0.5` and the select value is `0.5`; the status is `ბადე: 0.5 წმ (Snap გამორთულია)`; the select has `aria-keyshortcuts` `1 2`, and its `title` is `ბადე 0.5 წმ · 1 — უფრო მჭიდრო, 2 — უფრო ფართო` |
| GK2 | default → `2` | returns `false`; `data-grid-seconds` is `2` |
| GK3 | choose 0.25 in the select → `1` → `1`; then choose 5 → `2` → `2` | 0.1, then still 0.1 with the status `ბადე უკვე ყველაზე მჭიდროა — 0.1 წმ (1)`; 10, then still 10 with the status `ბადე უკვე ყველაზე ფართოა — 10 წმ (2)`. Every keydown returns `false`. |
| GK4 | default → `1` with `ctrlKey`, with `metaKey`, with `altKey`, and with `shiftKey` (`key: '!'`, `code: 'Digit1'`); `2` with `ctrlKey` | the division stays `1` throughout. The **Ctrl and Meta** keydowns return `true` (the browser default is untouched). |
| GK5 | focus the library search input → `1` on it; then open the export dialog (`Export` button) → `1` on `document.body` | the division stays `1` in both cases, and the keydown on the input returns `true` |
| GK6 | default → `1` with `repeat: true` | the division stays `1` (the keydown may return `false`) |
| GK7 | turn Snap on (Snap button; assert `data-snap` `on`); select a clip whose start S is a whole second, with free space to its right (header click) → `1` → `ArrowRight` | the clip start is S + 0.5 (not S + 1): the snapping consumer reads the new division |
| GK8 | turn Snap on (`G`; assert `data-snap` `on`) → `1` | the division is `0.5`; `data-snap` stays `on`; the status is `ბადე: 0.5 წმ (Snap ჩართულია)` |
| GK9 | focus the header select (`act(() => select.focus())`) → `1` on the select | returns `true` (not prevented: the select is a typing target); `data-grid-seconds` stays `1` (jsdom has no native type-ahead) |
| GK10 | open the grid menu (`rightClick` on a lane; focus is on the checked item) → `1` on the focused item | the division stays `1`, and the menu is still open (the menu owns its keys) |

**Expected count:** vitest **89 files / 1544** (1529 + 15). `grid-snap-menu` has **28** `it`, and `grid-snap-keys` has **12**.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Use a scratch copy with a `node_modules` junction and your own vitest config, as in round 58. Run on `grid-snap-keys`, `grid-snap-menu`, `grid-snap-ui` and `gesture-guard`. Each mutation must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | the digit branch removed | GK1, GK2 |
| b | the directions swapped (`Digit1` widens) | GK1, GK2 |
| c | the digit branch moved **before** `if (modifier) return;` (no modifier check) | GK4 |
| d | `!event.altKey && !event.shiftKey` dropped | GK4 |
| e | the `event.repeat` check dropped | GK6 |
| f | `event.preventDefault()` dropped | GK1 |
| g | at an end, return without setting the status | GK3 |
| h | helper: at an end, return `current` instead of `null` | GD1, GD2, GK3 |
| i | helper: an unknown value returns `GRID_DEFAULT_DIVISION_SECONDS` | GD2 |
| j | (C's j) arm the swallow before the inside-menu `return` in `handleOutsidePointerDown` | GM22 |
| k | (C's k) `releaseClickSwallow` calls `preventDefault()` on the releasing event | GM23 |
| l | the K3 `title` suffix dropped (both variants) | GK1, GS1, GS10 |
| m | (C's m) drop `followModeRef.current === 'on'` from `closeGridMenuOnUserScroll` | GM24 |

- Mutations j, k and m edit **frozen** code, and only in scratch.
- Write `a-round-59/mutations.txt` with the command, each result line and the failing test names.
- If a mutation survives, **strengthen that test** within §2.2. Do not add tests outside the list.
- **Spec-assumption stop:** GM23 expects the Snap-toggle `fireEvent.pointerDown` to return `true` in the **unmutated** tree, which assumes no other window `pointerdown` listener prevents it for a header button. If it returns `false` before any mutation, **stop and report to B**. Do not rewrite the assertion; that would stop it from killing mutation k. The same applies to any §2.2 assertion that fails on the unmutated tree because of a B assumption (for example GK9).

### 2.4 After the change

- **Self-check:**
  - `npx tsc --noEmit` → 0;
  - full `npx vitest run` → **89 / 1544, 0 failures**;
  - `npm run build` → rc 0.
- **Biome:**
  - read-only `npx biome check ./app` → ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info;
  - the LF owned and new files (`grid.ts`, `grid-snap-menu`, `grid-snap-ui`, `grid-snap-keys`) → 0 diagnostics;
  - `StudioWorkspace.tsx` → `biome lint` 0, and the stdin format check equals the LF copy.
- **Review:** run the real `code-reviewer` subagent on the diff. Put findings and dispositions in the report.
  - **Architecture notes** go to B (`a-round-59.md` §6), not into code.
  - Reviewer items outside §0 go to B; they are not fixed this round.
- **`/check`:** `npm run verify` → exit 0, run quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke (only if the server is up):** one gstack load of `/studio-lab` at 1440×900, press `1` and read `data-grid-seconds` (expected `0.5`). This is not a PASS claim.

### 2.5 Doc 052

New file `docs/implementation/2026/quarter-IV/052-studio-lab-grid-narrow-widen-keys.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 59 — D-29z24; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** Live §6.10 narrow/widen; why not Ctrl+1/2 (Chrome tab accelerators, untestable over CDP); C-R58-01/02/INFO-M;
- **Approach:** K1–K4, the helper, the end messages. **Alternatives:**
  - Ctrl+1/2 (rejected: depends on the browser);
  - `[` / `]` (rejected: layout-dependent `key`, and no Live mnemonic);
  - wrapping around at the ends (rejected: a silent jump from 0.1 to 10 is surprising);
  - repeat stepping (rejected: consistent with `G`).

  Also record: the numpad is not bound, and the keys work during a gesture;
- **Changed files;**
- **Problems and solutions;**
- **Testing:** GD1–GD2, GK1–GK10, GM22–GM24, mutations a–m, gates;
- **Ableton** (the §4.8 table);
- **TODO:** round 60 (the 4b test gaps), the browser probes, then 4c.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.2 K2 helper |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.2 K2, K3 (CRLF kept) |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | A | add exactly GM22–GM24 |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | A | K3 narrow grant: three expected select-title strings |
| `app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` | A | new (§2.2 (2)) |
| `docs/implementation/2026/quarter-IV/052-studio-lab-grid-narrow-widen-keys.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-59.md`, `a-round-59/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-59.md`, `c-round-59.json`, `c-round-59/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:**
- **Case A: 28 lines** — the 26 baseline lines plus `?? app/lib/arrangement/__tests__/grid-snap-keys.test.tsx` and `?? docs/implementation/2026/quarter-IV/052-…md`.
- **Case B:** the remaining baseline lines, plus ` M` for any owned file root committed, plus the two new lines.

The frozen list must stay all OK.

### 3.2 Frozen this round

- Everything in `b-round-58-r59-tree-sha256.txt` and everything else under `store/`.
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

**Checkpoint order:** G59-2 → R59-S → R59-U → G59-1 → (servers up) §4.6 → §4.7 → G59-3.
- Write `c-round-59/checkpoint.md` as you go.
- If the server is down at the start, check again after the offline items and once more before the report, and record each check. Do not start it.

### 4.1 R59-S — static (read-only)

- **`diff -u --strip-trailing-cr` against the snapshots:**
  - `grid.ts`: only `adjacentGridDivision`;
  - `StudioWorkspace`: only the digit branch, the two end-status constants, and the two select attributes;
  - `grid-snap-menu`: only the 3 new `it`; the 25 existing ones are AST-identical (C's `asteq-it.cjs` or equivalent, with a negative control);
  - `grid-snap-ui`: only the three K3 string literals (GS1 l.297, `HIDDEN_LINES_TITLE`, GS10 l.583) gain exactly the suffix. Every other AST node is identical, and there are 20 `it`.
- **The new test file:** 12 `it` with the §2.2 IDs; describe 2 has `{ timeout: 15_000 }`; it does not import from other test files.
- **K1 scope, read in code:**
  - the branch sits after `if (modifier) return;`;
  - it matches `event.code` `Digit1`/`Digit2` only;
  - it is guarded by `!altKey && !shiftKey`;
  - `preventDefault` comes before the repeat check;
  - it is not in the gesture-blocked list;
  - the menu is untouched.
- **EOL:** `StudioWorkspace.tsx` has every line CRLF with 0 bare LF. The other owned and new files are LF.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **Tree:** frozen list 414 OK; protected 4/4. Doc 052 exists with the §2.5 sections.

### 4.2 R59-U — unit and mutation (C's own scratch, own strings)

- **Mutations a–m:** re-run them in your own scratch with your own edits; each must kill its named tests.
- **C extras (info), suggested:**
  - (n) `Numpad1` also narrows → does any test fail? If none, it is info only, because the numpad is deliberately unbound.
  - (p) the branch is added to the gesture-blocked list → expected to survive (untested by design, §0.2). Record it.
- **Re-run of round-58 mutations a and d** on the new tree: they still kill GM16 and GM21.
- **Durations:** run `grid-snap-keys` and `grid-snap-menu` alone and record them. A test over 3 s alone is info.

### 4.3 G59-1 — gates

- tsc 0; build passes.
- **Biome:** read-only `./app` within the baseline; the 4 LF owned/new test and helper files 0 diagnostics; `StudioWorkspace` lint 0 and stdin format unchanged.
- **vitest = 89 files / 1544, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, run quietly, with at most two quiet attempts, each recorded. If neither attempt gives rc 0, G59-1 is FAIL.
- Record any `Test timed out` with file, test and ms.

### 4.4 G59-2 — tree

- Protected files 4/4 OK; frozen list all OK.
- `git status --short` matches §3.1 (28 lines in case A); HEAD at start and end.

### 4.5 Not run if the servers are down

Write "not run (environment)" for §4.6, §4.7 and G59-3, and say plainly in the summary that this is the **eighth** round.

### 4.6 Browser acceptance (servers up; gstack REAL for keys, REAL-mouse (PW) for drags and right-clicks)

Layout L52 (`tasks/round-55.md`). Test at **1440×900**, then repeat the starred items at **1280×720**.

| ID | Steps | Pass |
|---|---|---|
| KEY-NARROW* | focus the timeline (click an empty ruler-free area or the body) → `1` ×3 | `data-grid-seconds` goes 0.5 → 0.25 → 0.1; the select shows the same; the grid lines follow, or the hidden-lines `title` applies at a coarse zoom |
| KEY-WIDEN | from 1 → `2` ×4 | 2 → 5 → 10 → 10, with the widest status on the last press |
| KEY-ENDS | at 0.1 → `1` | no change, with the narrowest status |
| KEY-MOD | `Shift+1`, `Alt+1` | no change (Ctrl/Cmd+digit is **not** testable over CDP: write "not testable (CDP)", never PASS) |
| KEY-TYPE | type `1` into the library search | the text appears; the grid is unchanged |
| KEY-SELECT | focus the header select with the mouse (then close its popup with Escape so it stays focused) → `1` | the shortcut does **not** run: no narrowest/widest status and no one-step narrowing. Whatever the native select does with `1` (e.g. type-ahead to "1 წმ") is native behaviour; record it. The control shows the value the select chose. |
| KEY-SNAP | after `1` (0.5), drag a clip with Snap on (REAL-mouse PW) | it lands on a 0.5 s multiple |
| KEY-PLAY | play the demo with audio → press `1` and `2` | playback and the meter continue without a gap; the division changes |
| KEY-MENU | open the grid menu (REAL-mouse PW right-click) → `1` | nothing changes; the menu stays open; Escape closes it |
| Round-58 browser half | `tasks/round-58.md` §4.6: **MN-DISMISS-BUTTON\* first** (the only proof of the D2 timing assumption), then MN-REPOSITION, MN-FOLLOW, and the round-57 browser half (MN-*, R57-FOCUS / C-R51-02, R57-PLAY real audio, R57-LOOK*, focus-ring probe 4, reviewer #9) | as written there |

### 4.7 Carried browser items (servers up)

- **Stage-4a browser half, unchanged since round 55.** Run exactly the procedures from `tasks/round-55.md`:
  - §4.4 R55-SHIFT;
  - §4.5 R52-EDGE;
  - §4.6 R54-CROSS;
  - §4.7 R53-LANE, R52-TRIM, R52-PLAY (real audio, EP-*);
  - §4.8 R52-REG and REG-HYD.

  Use the same layout, labels, expected values and order, and record V with full double precision.
- **C-R51-01 probe:** drag a library row onto a blocked spot (REAL-mouse PW). Record `dragover`, `dragleave` (with `relatedTarget`), `drop` and `dragend` counts, and whether a blocked release can be told apart from a lane-to-lane move. This is evidence for B; it is not a PASS/FAIL of this round.
- Partial evidence is reported as partial, never as PASS.

### 4.8 G59-3 and the Ableton table

**G59-3 (anonymous workspace and purchase protection; last browser PASS in round 51).** Run it only if the servers are up, with a fresh browse state.
- `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- **No requests** to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code, including during the key, right-click and drag probes.
- An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401.
- `/studio/middle-east` shows "Sign in required".
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton** (workflow addendum 2026-10-11):
- **Re-used sources:**
  - Live 12 Reference Manual §6.10 "Using the Editing Grid", `https://www.ableton.com/en/live-manual/12/arrangement-view/`, from B's capture `b-round-46/ableton-6.7-6.10-20261016.txt` (captured 2026-10-16, re-used 2026-10-18);
  - §42.13 "Grid Snapping and Drawing", `https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/`, from `b-round-37/ableton-live-keyboard-shortcuts-20261013.txt` (captured 2026-10-13).
- **Not available:** no video and no Live installation.
- **C gives two verdicts per row:** the CZABA requirement, and Ableton conformance.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A key narrows the grid (denser lines) | §6.10, §42.13 | yes: Ctrl+1 (Win) / Cmd+1 (Mac), "doubling the density" | **deliberate difference:** plain `1` (browser tab accelerators; not testable over CDP). The step is the next seconds division, not ×2, because the seconds grid has no tempo before SRW-15. | GK1, GK3, KEY-NARROW |
| A key widens the grid | §6.10, §42.13 | yes: Ctrl+2 / Cmd+2, "halving the density" | **deliberate difference:** plain `2`; the next larger seconds division | GK2, KEY-WIDEN |
| Behaviour at the narrowest or widest division | — | unconfirmed (no source) | CZABA: stay, with a status message | GK3, KEY-ENDS |
| Triplet grid (Ctrl+3) | §6.10, §42.13 | yes | does not apply yet: musical divisions belong to SRW-14 stage 5, after the SRW-15 BPM | — |
| Snap on/off (Ctrl+4) | §6.10, §42.13 | yes | deliberate difference: `G` (round 47, R14-G2) | existing GM6 / grid-snap-ui |
| Fixed / zoom-adaptive grid (Ctrl+5) | §6.10 | yes | not requested: the CZABA grid is fixed, and its lines hide below 6 px | — |
| The current spacing is shown | §6.10 ("displayed above the time ruler") | yes | CZABA shows it in the header select and in the status line | GK1 |
| Width from the track context menu | §6.10 | yes (round-57 row, unchanged) | content is a deliberate difference (round 57) | round-57 IDs |
| The dismissing press, Follow scroll, focus return (C-R58 tests) | — | unconfirmed (no source) | CZABA rules D1 / S (round 58) | GM22–GM24 |

### 4.9 Not run this round, and carried items (honest)

**Not run (not PASS) unless §4.6/§4.7 run:** the 4b-2a, 4b-1, round-58 and 4a browser acceptance, the C-R51-01 probe, and G59-3.

**Not run this round in any case:**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- a real `pointercancel`;
- Ctrl/Cmd+digit in a real Chrome (Tech Lead, R59-T).

**Open C bugs:**
- **This round:** C-R58-01, C-R58-02, C-R58-INFO-M.
- **Browser pending (fixed at unit/probe level):**
  - A-R57-REVIEW-DISMISS-CLICK (MN-DISMISS-BUTTON);
  - A-R57-REVIEW-FOLLOW-SCROLL (MN-FOLLOW);
  - C-R51-02 (R57-FOCUS);
  - C-R53-01, C-R54-01, C-R54-02.
- **Later stages:**
  - C-R51-01 (probe §4.7, then B decides);
  - C-R52-T1 (→ 4c).
- **C-R41-01** (TL-Q-VIEWPORT).
- **Tech Lead:**
  - C-R27-01, C-R6-02, C-R8-01 (quiet Chrome);
  - C-R23-01 + C-R38-01.

**Open Low / info:**
- R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE;
- R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE (4b-2a's `1` key is now a faster escape than Alt);
- A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG;
- A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP, A-R54-REVIEW-LOWS;
- INFO-R55-FREE-ROUND-UNGUARDED and A-R55-REVIEW-SHIFT-MIDDRAG-TEST (→ 4c, round 61);
- A-R57-REVIEW-MENU-TEST-GAPS (→ round 60), A-R57-REVIEW-TAB-BODY-FOCUS, A-R57-REVIEW-CONTEXTMENU-KEY, C-R57-PROBE-FOCUS-RING, C-R57-PROBE-REPOSITION, A-R57-REVIEW-PAGE-TRANSITION;
- **new from round 58:**
  - A-R58-REVIEW-HELD-PRESS-KEY-CLICK (Low; a mechanism change, recorded, not scheduled);
  - A-R58-REVIEW-AFTEREACH-RELEASE (→ round 60);
  - A-R58-REVIEW-ANDROID-TAP-CLICK (needs a real device → Tech Lead);
  - A-R58-REVIEW-RIGHTCLICK-TRAP (→ round-60 list);
  - A-R58-REVIEW-GM21-POSITIONSTORE (→ MN-FOLLOW);
  - A-R58-REVIEW-CANCEL-RIGHT-UNTESTED (→ round 60);
  - CTRL-DIGIT-BROWSER-RESERVED (decided in D-29z24; Tech Lead R59-T).

**`root-pre-push-review.md` (mtime 2026-10-07 18:22:57, unchanged):**
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
- **Partially measured:** R5-L3.
- **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
- **Medium:**
  - M1: loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value makes every consumer re-render.
- **Lows:** L1 (undo/redo during a gesture), L2 (`holdUntil` on a reschedule), L3 (Delete ignores `event.repeat`), L4 (a `setPointerCapture` throw leaves gesture state), L6 (export-dialog wording with the loop on), L7 (unbounded history), L8 (unguarded `new AudioContext`).

**`publication-checkpoint.json` (mtime 2026-10-17 11:11:24, unchanged):**
- SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work.
- Instruction files need portable paths.
- **Scrollbar refinement:** tokens on both timeline axes and the library; checks at 1280×720 and 1440×900.
- **Library and stems parity:** the SRW-12 tree and the SRW-11 panel; honest demo stems; find → stems → preview → drag.
- T12 continuation.

**Root items:**
- ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53 (eighth round; §6);
- ROOT-COMMIT-ROUND51: units 50–55, 56, 57 and 58;
- ARCH-CHECKPOINT-SRW14-PREFS (feature boundary at the end of 4b; §6.3) and ARCH-CHECKPOINT-SRW13;
- GSTACK-ACL, GSTACK-NO-MOUSE;
- the CRLF Biome errors on auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; the stray `store/nul`; the git autocrlf warning on LF files.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T, R57-T, R58-T), plus **R59-T:**
- In your own Chrome on `/studio-lab`, `1` and `2` narrow and widen the grid, and typing `1` in the library search stays text.
- Note what **Ctrl+1 / Ctrl+2** do there. Expected: Chrome switches tabs, because the workspace does not handle them. If you want Live's Ctrl+1/2 as well, say so; it would be a separate small B task, gated on this observation.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-58-r59-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-58-r59-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/StudioWorkspace.tsx app/lib/arrangement/grid.ts app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-58-r59-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
node -e "const s=require('fs').readFileSync('app/components/arrangement/StudioWorkspace.tsx','utf8');console.log((s.match(/\r\n/g)||[]).length,(s.match(/\n/g)||[]).length)"
grep -rn "title" app/lib/ app/components/ --include=*.test.tsx | grep "ბადე"
npx vitest run app/lib/arrangement/__tests__/grid-snap-keys.test.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/lib/arrangement/grid.ts app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-keys.test.tsx
npx biome lint app/components/arrangement/StudioWorkspace.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A; needed for C and for completion)

1. **Servers, eighth round:** start the Store dev server and the backend before C, **or answer yes/no: can they be restored in this environment?**
   - **Yes / started:** C runs §4.6, §4.7 and G59-3 this round. MN-DISMISS-BUTTON and G59-3 come first.
   - **No:** that is external missing information. B then asks the user how completion is to be evidenced without a browser, because COMPLETE needs browser evidence and the purchase-protection check.
   - **Silence:** B keeps dispatching dependency-ordered, offline-verifiable stages and records the growing browser debt, ID by ID.
2. **Commit units:**
   - **Round 56** (4 test files + doc 049) is commit-ready on C's round-56 PASS.
   - **Rounds 57 and 58** are commit-ready as **interim, unit-verified** changes only. G1 and G6 have no browser proof, and their hunks share `StudioWorkspace.tsx` (plus `ArrangementLane.tsx` and `grid-snap-ui` for 57) with the uncommitted rounds 50–55. They cannot be committed alone without splitting hunks.
   - **Rounds 50–55** are root's decision: no open offline defect, but no browser evidence.
   - Committing before A starts keeps round 59 separately reviewable.
3. **ARCH-CHECKPOINT-SRW14-PREFS** (bounded; the feature-boundary trigger):
   - **Why now:** stage 4b ends with round 60, so this is the feature boundary. It is also the **eighth** consecutive round on the `StudioWorkspace` owner. Please answer **before the round-61 (4c) dispatch**.
   - **Signals (recorded, not scheduled):**
     - round 57, signal 4: grid-menu state, refs and listeners live in the workspace;
     - round 57, signal 3: the three-branch `releaseEditFocusOnTimelinePointerDown`;
     - **round 58: the scroll classification now exists twice** (the menu scroll rule and `handleTimelineScroll`). The proposal is a pure `classifyTimelineScroll` in `lib/arrangement`;
     - round 59 adds a sixth grid-preference consumer (the keys) to the same keydown handler.
   - **Answer format:** keep/extract, value, risk, ≤ 3 sentences. An approved change becomes its own B task with one owner and behaviour-preserving tests.
4. **Optional:** a root `testTimeout` or worker cap (the systemic lever from round 56).

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-59.md`:**
1. the pre-flight gate, the §1.2 baseline (case A/B) and the `title` grep output;
2. the diff summary per file with EOL counts;
3. GD1–GD2, GK1–GK10 and GM22–GM24, with alone durations;
4. mutations a–m (including l);
5. smoke (if any);
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-59.md` and `c-round-59.json`** (usual schema). Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment / not testable). Cover:
- R59-S, R59-U, G59-1, G59-2;
- §4.6, §4.7 and G59-3, or "not run (environment)";
- the Ableton rows, with two verdicts each;
- the carried items.

`passed` lists only IDs run this round. State **commit readiness** for root, separately for round 59, round 58, round 57, round 56 and rounds 50–55.

**Next (orientation only):**
- **Round 60:** round-59 bugs or browser bugs first. Otherwise **stage 4b-2b** (test-only, `grid-snap-menu`), the last part of 4b:
  - A-R57-REVIEW-MENU-TEST-GAPS (Tab not prevented, a press inside keeps the menu open, listener removal on unmount);
  - A-R58-REVIEW-AFTEREACH-RELEASE;
  - A-R58 #6: the `pointercancel` path, and a right-button dismiss followed by a left click;
  - A-R58-REVIEW-RIGHTCLICK-TRAP.
- **Round 61:** root's ARCH-CHECKPOINT answer, if any (as its own B task), then **stage 4c**:
  - group-move edge snap, with the C-R52-T1 start- and end-touch targets;
  - the library-drop edge decision;
  - the INFO-R55 and SHIFT-MIDDRAG tests;
  - B's C-R51-01 decision from the probe.
- **Then:**
  - SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20;
  - the Lows; SRW-21;
  - full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 59 -StartPhase A` and a higher limit.
