# CURRENT TASK — Round 61: SRW-14 grid-menu fix-up after stage 4b (D-29z26). Two C bugs from round 60 (C-R60-01 focus leaves the menu on a non-item press; C-R60-02 an auto-repeat key releases the dismiss swallow), the now-confirmed ROOT-R50-58-L1 (vertical scroll during Follow keeps the menu open), and one test gap (A-R60-REVIEW-BLUR-CAPTURE-TEST). Last menu-only round; stage 4c is round 62.

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-18
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- **Decision record:** **D-29z26** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-60.md`.
- **Round size:** one owner (A), one feature area (the lane grid menu and its dismiss swallow), **three small source bugs + one test-only gap**, in the same two source files as round 60:
  1. **C-R60-01 (Low, C bug).** A press (left or right) on the open menu's padding or its `<hr>` moves focus to `BODY`. After that ArrowDown/Escape do nothing and the menu stays open until an outside press. Pre-existing since round 57; exposed by round 60's MN-CONTEXT criterion.
  2. **C-R60-02 (Low, C bug; = A-R60-REVIEW-REPEAT-RELEASE).** An auto-repeat `keydown` (`repeat: true`, e.g. a held Shift) releases the armed swallow, so a Shift+click outside the open menu both dismisses and acts. A partial regression of round 58's swallow, introduced by round 60's "any key" rule.
  3. **ROOT-R50-58-L1 (Low, confirmed by C round 60 VSCROLL-PROBE).** With vertical overflow, a vertical wheel during Follow playback scrolls the lanes and fires `scroll`, but the menu stays open over a lane that moved.
  4. **A-R60-REVIEW-BLUR-CAPTURE-TEST (test only).** No test pins the non-capture window `blur` release; C's and A's `xblurcap` mutation survives.
- **Hard boundary (B ruling, D-29z26; basis: plan.md §5 "only Critical/High C bugs pre-empt the next feature" and the user steering of 2026-10-15 and of this run: do not indefinitely delay independent core features for low-priority polish):** this is the **last menu-only round**. Rounds 57, 58, 60 and 61 all sit on the same owner and files. After round 61, new Low/info findings on the grid menu go to the backlog and are batched with the Lows; only a Medium-or-higher finding or a regression of a C-verified behaviour pre-empts **stage 4c (round 62)**.
- **Not in this round (recorded, not dropped):** A-R60-REVIEW-GK11-EXPORT-STATUS (optional hardening of `grid-snap-keys`, frozen), INFO-R60-FOCUS-RETURN (design, §0.6), INFO-R60-SHIFT1-SYNTH (→ Tech Lead), A-R59-REVIEW-PUNCTUATION / END-INDEX / REANNOUNCE, ROOT-R50-58-L5 (architecture).

> **Servers are UP now** (B, 18:19 +04: `/studio-lab` 200, `:5199/api/products` 200; `b-round-60/gates.txt`).
> - Check both at the start of A and of C, and record the result. Agents never start or stop servers.
> - If either is down, run everything offline and write "not run (environment)" for the browser items.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every right-click, press on a non-item area, drag, held press, wheel and real-click-after-press case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Do not export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 60 result** (`c-round-60.md`, `c-round-60.json`): **C FAIL on one Low** (MN-CONTEXT, edge half → C-R60-01). Everything else passed:
- **Offline:** G60-2 (case A, 29 lines; frozen 416 OK; protected 4/4), R60-S (AST: 28/28 old menu `it` identical; 11/12 keys `it` identical, GK9 rewritten, GK11 appended), R60-U (a–m and r58 a/d, r59 a/j/k/m killed), G60-1 (tsc 0; Biome 5/218/1; 89 / 1552; build; verify rc 0 on attempt 1).
- **Browser:** G60-3 PASS (anonymous `/studio-lab` direct and via the header; 0 forbidden requests; 0 `Authorization`; token 401; fake Bearer 403; `/studio/middle-east` asks to sign in). SEL-KEYS ×2, SEL-ENDS, SEL-NATIVE, SEL-MOD (info), SEL-SNAP, MN-KEY-RELEASE (fallback focus method), MN-BLUR-PROBE (synthetic), MN-DISMISS-BUTTON ×2, MN-KEYS, KEY-NARROW, KEY-TYPE, MN-FOLLOW PASS. EG-GROUP PASS read-only against the corrected criterion.
- **Evidence:** VSCROLL-PROBE confirms ROOT-R50-58-L1 (overflow 382 px; `scrollTop` 282 → 382; 1 `scroll`; menu stays open; Follow `on`). The reviewer-#1 repeat probe gives C-R60-02.

**Why these together (D-29z26):** all four are defects or gaps of the same menu and the same swallow lifecycle, in `ArrangementGridMenu.tsx`, the `StudioWorkspace.tsx` menu-scroll effect (l.893–921) and `grid-snap-menu.test.tsx`. C-R60-02 is a regression introduced by round 60, so it is fixed before round 60's behaviour is built on.

## Baseline

Measured by B on 2026-10-18 at 18:19 +04 (`b-round-60/gates.txt`).

**The content baseline decides; HEAD may differ.** Root holds `root-publish/pending/r50-58-cb12805.bundle` and may apply it, and rounds 59/60, before or during this round. Any of these is valid at the start:
- **(A)** HEAD `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` has **29 lines** (the round-60 end state: the 28 round-50–59 paths plus `?? docs/…/053-…md`).
- **(B)** HEAD `cb128056…` (root applied rounds 50–58), and `git status --short` has exactly **8 lines**: ` M` `StudioWorkspace.tsx`, `ArrangementGridMenu.tsx`, `grid.ts`, `grid-snap-menu.test.tsx`, `grid-snap-ui.test.tsx`; `??` `grid-snap-keys.test.tsx`, doc 052, doc 053.
- **(C)** HEAD is a newer **root** commit that contains round 59, and `git status --short` has **5 lines**: ` M` `StudioWorkspace.tsx`, `ArrangementGridMenu.tsx`, `grid-snap-menu.test.tsx`, `grid-snap-keys.test.tsx`; `?? doc 053`.
- **(D)** HEAD is a newer **root** commit that also contains round 60, and `git status --short` is empty.

**In every case:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-60-r61-tree-sha256.txt` has **418** entries, all OK (run it from `store/`).
  - It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 3 owned files below.
  - **`grid-snap-keys.test.tsx` and doc 053 are frozen this round.**
- **Snapshots:** `../tmp/studio-real-loop/b-round-60-r61-snapshots/` with `SHA256SUMS.txt`. None of the 3 files may differ from its snapshot at the start:

  | File | sha256 prefix | EOL (CRLF / LF) | `it` |
  |---|---|---|---|
  | `app/components/arrangement/StudioWorkspace.tsx` | `0ea67202` | **CRLF** 1807 / 1807 | — |
  | `app/components/arrangement/ArrangementGridMenu.tsx` | `baf32ff4` | 0 / 202 | — |
  | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | `12870d41` | 0 / 954 | 35 (GM1–GM31 in describe 1; FR1–FR4 in describe 2) |

- **B's check:** these hashes equal C's round-60 end hashes (`c-round-60.md` G60-2). Frozen 418/418 OK. Protected 4/4 OK. `grid-snap-keys` is `89c40175` (in the frozen list).
- Anything else is a **stop and report**: a frozen or snapshot mismatch, or a status that fits none of A/B/C/D.

**Other measurements:** `node.exe` 12. Full vitest at round-60 end: **89 files / 1552** (A and C rc 0). Biome `./app`: **5 / 218 / 1** (the 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`, `auth-bugs.test.ts`).

**Line endings (the CRLF trap):**
- **`StudioWorkspace.tsx` stays CRLF.** After the edit every line is CRLF, with 0 bare LF.
- **Never run `npx biome check --write` or `format --write` on it.** Check its formatting with `biome format --stdin-file-path=app/components/arrangement/StudioWorkspace.tsx < <LF copy>`; the output must equal the LF copy.
- `ArrangementGridMenu.tsx`, the menu test and doc 054 are LF.
- Count EOLs with node (`/\r\n/g` vs `/\n/g`). Diff with `diff -u --strip-trailing-cr` against the snapshots.

**Rules:**
- Do not revert, re-create or reformat anything; the work of rounds 47–60 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z26-F: a press on the menu's non-item area keeps focus (C-R60-01)

**F1. Behaviour.** With the grid menu open, a `mousedown` of any button (left, middle or right) whose target is **not inside a menu item `<button>`** (the menu root's padding, the `<hr>`) has its default prevented. Therefore:
- focus stays where it was (the active item);
- ArrowDown/ArrowUp/Home/End still move, Enter/Space still choose, Escape and Tab still close;
- the menu stays open, at the same position, with the same division. A right press there still shows no native menu (round-60 `onContextMenu`, unchanged).

**F2. Unchanged.** A press on an item (`<button>`, including its inner `<span>`) is **not** prevented: Chrome focuses that item as before, and its click chooses as before (round-60 item half PASS; GM22 unchanged). The window outside-press handler is unchanged (a press inside the menu still returns early, so no swallow is armed).

**F3. Where and how (`ArrangementGridMenu.tsx` only):** one `onMouseDown` on the `role="menu"` root:
```
if (!(event.target instanceof Element && event.target.closest('button'))) event.preventDefault();
```
(Shape, not literal code; any equivalent without an assertion is fine. Inside the menu the only buttons are the items.)
- **Why `mousedown`:** it is the event whose default action moves focus in every browser. `pointerdown` cancellation also blocks focus in Chromium only.
- **Rejected:** `tabIndex={-1}` on the root plus a refocus of the active item (changes the menu's ARIA focus model; more code); a window-level Escape that closes the menu wherever focus is (treats the symptom, leaves arrows dead).

### 0.2 Rule D-29z26-K: only a non-repeat key releases the swallow (C-R60-02; amends D-29z25-R)

- In `armGridMenuDismissClickSwallow`, the capture `keydown` listener becomes a **named wrapper** that returns early when `event.repeat` is `true` and otherwise calls `releaseClickSwallow()`.
- **The same wrapper reference** is added with capture `true` and removed in `releaseClickSwallow` with capture `true`. (C's round-60 `xrepeat` build failed exactly here: an inline arrow that is never removed leaks.) C checks this statically.
- Type the parameter without an assertion. Note the file already imports React's `type KeyboardEvent`; for the DOM event use e.g. `WindowEventMap['keydown']`.
- **What changes:** after a dismissing press, a `keydown` with `repeat: true` (a modifier held from before the press, auto-repeating) no longer releases the swallow; the dismissing click is swallowed as in round 58.
- **What does not change:** a non-repeat key (Enter, Space, Shift's first press, …) still releases (GM26 unchanged); `blur`, `pointerup`/`pointercancel` + one macrotask, and the next `pointerdown` still release; nothing that releases cancels its event (C-R58-02).
- **Recorded trade-off (doc 054, narrows the round-60 one):** a key pressed **for the first time** while the dismissing press is still held still lets the final release click through. A modifier that was already held before the press no longer does.
- **Supersession:** one sentence in doc 054 that D-29z25-R's "any key" is replaced by "any non-repeat key". Doc 053 stays frozen.

### 0.3 Rule D-29z26-V: a vertical user scroll closes the menu, also during Follow (ROOT-R50-58-L1)

- In the `StudioWorkspace.tsx` menu-scroll effect (l.893–921), record `scroller.scrollTop` once when the effect arms (the menu opens).
- In `closeGridMenuOnUserScroll`, **before** the Follow-auto-scroll exemption: if `scroller.scrollTop` differs from the recorded value → `closeGridMenu()` and return.
- **No tolerance:** Follow only ever writes `scrollLeft` (l.978), so any vertical change is the user (wheel, scrollbar, keyboard).
- **Unchanged:** the horizontal rule S (a Follow page flip keeps the menu open, GM21; a user horizontal scroll closes it; GM24); resize and window blur close it; Follow mode is **not** paused by a vertical scroll (`handleTimelineScroll` compares `scrollLeft` only — unchanged; VSCROLL-PROBE recorded Follow `on`). A reposition (second right-click while open) keeps the recorded value, because the effect does not re-run while the menu stays open.
- **Effect deps:** exactly what `biome lint` requires, 0 diagnostics.

### 0.4 Rule D-29z26-T: pin the non-capture `blur` (A-R60-REVIEW-BLUR-CAPTURE-TEST)

Test only (GM35). No source change: round 60 registered `blur` non-capture on purpose, because `closeGridMenu` refocuses the opener synchronously and a capture listener would see the menu item's own `blur` and release at once.

### 0.5 B rulings on round 60

- **Closed by C round-60 evidence:** C-R59-01 (SEL-KEYS 1440/1280); ROOT-R50-58-L2 = A-R58-REVIEW-HELD-PRESS-KEY-CLICK (the rule as written: GM26–GM29, MN-KEY-RELEASE, MN-BLUR-PROBE; the repeat edge is the separate C-R60-02); ROOT-R50-58-L3 (native-menu suppression PASS on item and edge; the focus half is the separate pre-existing C-R60-01); ROOT-R50-58-L4 = A-R58-REVIEW-AFTEREACH-RELEASE; A-R57-REVIEW-MENU-TEST-GAPS (GM30/GM31 kill m/l); A-R58-REVIEW-CANCEL-RIGHT-UNTESTED (GM28/GM29 kill j/k); A-R58-REVIEW-RIGHTCLICK-TRAP (`afterEach` release + doc 053 note); A-R59-REVIEW-ARIA-KEYSHORTCUTS (the keys now act on the select). C-R59-03 stays closed (EG-GROUP read-only PASS).
- **A's round-60 deviations D1–D4:** accepted (D1 crash resume with the scratch mutation restored, store untouched; D2 A stopped only its **own** PIDs 44864/25888, no orphans, scratch re-verified; D3 doc 053 edits within ownership; D4 the extra `xblurcap` mutation, info).
- **MN-KEY-RELEASE premise (B's error):** round 60 assumed that a mouse-opened menu returns focus to Export. It does not, by the round-57 M10 design (INFO-R60-FOCUS-RETURN). The written method from now on is: `locator.focus()` on the target button **while the dismissing press is held**, then the key.
- **Commit readiness:** see §6.2. Round 60 is committable as an interim checkpoint with C-R60-01/02 recorded as known Lows fixed in this round.

### 0.6 Recorded, not scheduled

- **INFO-R60-FOCUS-RETURN:** for a real mouse, the lane's right `mousedown` moves focus to `body` before `contextmenu` records the return target, so M10's focus restore effectively runs only for keyboard-opened menus. This links to A-R57-REVIEW-CONTEXTMENU-KEY (no keyboard opener yet). Signal only.
- **INFO-R60-SHIFT1-SYNTH:** synthetic `key: "1"` + Shift type-aheads to 10 s; a layout-faithful `Shift+Digit1` (`key: "!"`) does nothing → Tech Lead R61-T.
- **A-R60-REVIEW-GK11-EXPORT-STATUS:** optional hardening in the frozen `grid-snap-keys`; batched with the Lows.
- **GM25's focus assertion** cannot fail in jsdom (no `mousedown` precedes `fireEvent.contextMenu`). It stays unchanged; GM32 is the discriminating test for focus.

### 0.7 Source

| File | Change |
|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | §0.1 (root `onMouseDown`) and §0.2 (named non-repeat `keydown` wrapper, added and removed by reference). Nothing else. |
| `app/components/arrangement/StudioWorkspace.tsx` | §0.3 only: the recorded `scrollTop` and the early close in `closeGridMenuOnUserScroll`, plus deps if required. CRLF preserved. Nothing else. |

- **Frozen:** everything else, including `grid.ts`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `selection.ts`, `grid-snap-keys`, `grid-snap-ui`, `grid.test.ts` and docs 001–053.
- No comments, no `any`, no type assertions, no `@ts-ignore`, semicolons, Georgian UI text (no new UI text is needed).

### 0.8 What could be affected (C checks)

- **Menu choice by mouse:** item press focuses and chooses as before (GM22; MN-KEYS/MN-CONTEXT item half).
- **Menu keyboard:** Enter, Space, arrows, Home/End, Escape and Tab (GM7, GM8, GM11, GM30).
- **Swallow:** MN-DISMISS-BUTTON (GM16/GM17), GM22, GM23, GM26–GM29 unchanged.
- **Follow:** a page flip keeps the menu open (GM21, MN-FOLLOW); Follow mode unaffected by the vertical rule.
- **Expected suite: 89 files / 1556** (1552 + 4: GM32–GM35). `grid-snap-menu` has **39** `it`.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. Musical divisions and triplets belong to SRW-14 stage 5, after the SRW-15 BPM. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:** `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`. Then run the `pre-flight` skill.
2. **Baseline before any edit:** HEAD and `git status --short` → case A/B/C/D; `sha256sum -c ../tmp/studio-real-loop/b-round-60-r61-tree-sha256.txt | grep -vc ': OK$'` → 0; snapshots `SHA256SUMS.txt` and `cmp` for each owned file; protected 4/4; Biome numbers; `node.exe`; both servers.
3. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.1–§0.3 and §0.7.

### 2.2 Tests — `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` (LF)

- **No change** to the harness, `beforeEach`, `afterEach`, the helpers or the 35 existing `it` (GM1–GM31, FR1–FR4).
- **Exactly these 4 new `it`**, appended inside the first `describe` after GM31:

| ID | Setup → action | Must assert |
|---|---|---|
| GM32 | **C-R60-01:** `rightClick` on the music lane (focus is on `1 წმ`) → `fireEvent.mouseDown(menu root, { button: 0 })`, `fireEvent.mouseDown(menu root, { button: 2 })`, `fireEvent.mouseDown(<hr>, { button: 0 })` → `fireEvent.mouseDown(item '0.5 წმ', { button: 0 })` → `pressFocused('Escape')` | the three non-item `mouseDown` calls return **`false`**; the item `mouseDown` returns **`true`**; after them the menu is still open (one menu, same `style.left`/`top`), the division is `1`; then Escape closes it and the division is still `1`. (The jsdom "focus inside" check is non-discriminating here, like GM25; the return values are the kill.) Get the `<hr>` by `openMenu(view).querySelector('hr')` with a null check that throws. |
| GM33 | **C-R60-02:** open → `fireEvent.pointerDown` on the empty `sfx` lane (no `pointerUp`) → `fireEvent.keyDown(document.body, { key: 'Shift', code: 'ShiftLeft', shiftKey: true, repeat: true })` → bare `fireEvent.click(snapToggle)` → then reopen (`rightClick` on the music lane) → arm the same way → the same Shift keydown **without** `repeat` → bare click | the first click returns **`false`** and `data-snap` stays `off`; the second click returns **`true`** and `data-snap` is `on`; `isPlaying` stays `false` throughout |
| GM34 | **ROOT-R50-58-L1:** `togglePlayback()` (playing, Follow `on`) → set `scroller.scrollTop = 120` and **assert it reads back 120** → `fireEvent.scroll(scroller)` → `rightClick` on the music lane → `fireEvent.scroll(scroller)` with nothing changed → set `scroller.scrollTop = 240` (assert 240) → `fireEvent.scroll(scroller)` | after the unchanged scroll the menu is **still open**; after the vertical change it is **closed**; `isPlaying` is `true`; `arrangement-follow` `data-follow-mode` is still `on`; `scrollLeft` is unchanged; the division is `1` |
| GM35 | **blur non-capture:** `act(() => snapToggle.focus())` → `fireEvent.contextMenu(laneBody('music'), { clientX: 300, clientY: 200 })` (no pointerdown, so the return target is Snap, as GM11) → assert focus is inside the menu → `fireEvent.pointerDown` on the empty `sfx` lane → assert the menu is closed and `document.activeElement` is the Snap toggle → `fireEvent.pointerUp` on the `sfx` lane with the same `pointerId` → `fireEvent.click(snapToggle)` | the click returns **`false`** (swallowed) and `data-snap` stays `off` |

"Bare click" means `fireEvent.click` with no `pointerdown` before it (a `pointerdown` would release the swallow on its own path).

**Expected count:** vitest **89 files / 1556**; `grid-snap-menu` has **39** `it`.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Scratch copy with a `node_modules` junction and your own vitest config, as in round 60. Run on `grid-snap-menu`, `grid-snap-keys`, `grid-snap-ui` and `gesture-guard`. Each mutation must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | the root `onMouseDown` removed | GM32 |
| b | the root `onMouseDown` prevents every target (item exclusion dropped) | GM32 |
| c | the `keydown` wrapper's `repeat` guard removed | GM33 |
| d | the `scrollTop` check removed | GM34 |
| e | the `scrollTop` check compares to `0` instead of the recorded value | GM34 |
| f | the `blur` release registered with capture `true` (add and remove) | GM35 |

**Re-runs on the new tree:** round-60 g (`onContextMenu` removed → GM25), h (`keydown` release removed → GM26), i (`blur` release removed → GM27); round-58 a (swallow arm removed → GM16), d (`closeGridMenu` on any scroll → GM21); round-59 k (release calls `preventDefault` → GM23).

**Rules:**
- Write `a-round-61/mutations.txt` with the command, each result line and the failing test names.
- If a mutation survives, **strengthen that test** within §2.2. Do not add tests outside the list.
- **Spec-assumption stop:** if any §2.2 assertion fails on the **unmutated** tree, stop and report to B. Do not rewrite the assertion. Examples: jsdom does not store `scrollTop` (GM34); GM35's click returns `true` on the unmutated tree; mutation f survives GM35; any existing `it` fails.

### 2.4 After the change

- **Self-check:** `npx tsc --noEmit` → 0; full `npx vitest run` → **89 / 1556, 0 failures**; `npm run build` → rc 0.
- **Biome:** read-only `npx biome check ./app` → ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info; `ArrangementGridMenu.tsx` and `grid-snap-menu` → 0 diagnostics; `StudioWorkspace.tsx` → `biome lint` 0, and the stdin format check equals the LF copy.
- **Review:** run the real `code-reviewer` subagent on the diff. Put findings and dispositions in the report. **Architecture notes** go to B (`a-round-61.md` §6), not into code. Reviewer items outside §0 go to B; they are not fixed this round.
- **`/check`:** `npm run verify` → exit 0, run quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke (servers up):** one gstack load of `/studio-lab` at 1440×900, confirm the workspace and badge render and the network has no forbidden request. This is not a PASS claim.

### 2.5 Doc 054

New file `docs/implementation/2026/quarter-IV/054-studio-lab-grid-menu-focus-repeat-vscroll.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 61 — D-29z26; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** C-R60-01 (measured: focus → `BODY`, Escape dead; pre-existing since round 57), C-R60-02 (measured with a second `keyboard.down('Shift')`), ROOT-R50-58-L1 (VSCROLL-PROBE numbers), the `xblurcap` gap;
- **Approach:** F, K, V, T. **Alternatives:** for F, `tabIndex={-1}` + refocus and a window-level Escape (both rejected, §0.1); for K, keeping "any key" (rejected: Shift/Ctrl-click outside the menu acts); for V, closing on the wheel event (rejected: rule S is scroll-based, C-R59-02). **Supersession:** one sentence that D-29z25-R's "any key" becomes "any non-repeat key". **The narrowed trade-off** of §0.2;
- **Changed files; problems and solutions; testing** (GM32–GM35, mutations a–f and the re-runs, gates); **Ableton** (the §4.8 table); **TODO:** round 62 (4c), the ARCH checkpoint, the batched menu Lows.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementGridMenu.tsx` | A | §0.1, §0.2 |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.3 (CRLF kept) |
| `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | A | GM32–GM35 appended |
| `docs/implementation/2026/quarter-IV/054-studio-lab-grid-menu-focus-repeat-vscroll.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-61.md`, `a-round-61/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-61.md`, `c-round-61.json`, `c-round-61/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end** (the owned files keep their start status codes):
- **Case A: 30 lines** (the 29 start lines plus `?? docs/…/054-…md`).
- **Case B: 9 lines** (the 8 start lines plus `?? doc 054`).
- **Case C: 6 lines** (the 5 start lines plus `?? doc 054`).
- **Case D: 4 lines** (` M` for the 3 owned files plus `?? doc 054`).

The frozen list must stay 418/418 OK.

### 3.2 Frozen this round

- Everything in `b-round-60-r61-tree-sha256.txt` and everything else under `store/`.
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
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`; deleting `playwright-report/` or `store/nul` (root's call).

## 4. Acceptance (C)

**Checkpoint order:** G61-2 → R61-S → R61-U → G61-1 → (servers up) G61-3 → §4.6 → §4.7. Write `c-round-61/checkpoint.md` as you go. Check both servers at the start, after the offline items and before the report, and record each check. Do not start them.

### 4.1 R61-S — static (read-only)

- **`diff -u --strip-trailing-cr` against the snapshots:**
  - **`ArrangementGridMenu`:** only the root `onMouseDown` (prevent only when the target is not inside a `button`) and the named non-repeat `keydown` wrapper. **The same wrapper reference** is passed to `addEventListener('keydown', …, true)` and `removeEventListener('keydown', …, true)`; no inline arrow is registered for `keydown`. `blur` stays non-capture.
  - **`StudioWorkspace`:** only the recorded `scrollTop`, the early close before the Follow exemption, and deps if required. `handleTimelineScroll` is unchanged.
  - **`grid-snap-menu`:** only GM32–GM35 appended. The 35 existing `it` and the harness are AST-identical (C's `asteq-it.cjs` or equivalent, with a negative control).
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **EOL:** `StudioWorkspace` has every line CRLF with 0 bare LF; the others are LF.
- **Tree:** frozen list 418 OK; protected 4/4. Doc 054 exists with the §2.5 sections.

### 4.2 R61-U — unit and mutation (C's own scratch, own strings)

- **Mutations a–f and the §2.3 re-runs:** re-run them in your own scratch with your own edits; each must kill its named tests.
- **C extras (info), suggested:** (n) `scrollTop` compared with a tolerance of 2 px → expected to survive (no test needs it); (p) `mousedown` prevented only for `event.button === 0` → GM32 must kill it (the right press); (q) the `keydown` wrapper also ignores `event.key === 'Shift'` when not repeating → GM33's second half must kill it.
- **Durations:** run `grid-snap-menu` alone and record it. A test over 3 s alone is info.

### 4.3 G61-1 — gates

- tsc 0; build passes.
- **Biome:** read-only `./app` within the baseline; `ArrangementGridMenu` and `grid-snap-menu` 0 diagnostics; `StudioWorkspace` lint 0 and stdin format unchanged.
- **vitest = 89 files / 1556, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, quietly, with at most two quiet attempts, each recorded. If neither gives rc 0, G61-1 is FAIL.
- Record any `Test timed out` with file, test and ms.

### 4.4 G61-2 — tree

- Protected 4/4 OK; frozen 418 OK.
- `git status --short` matches §3.1 for the observed case; HEAD at start and end.

### 4.5 Not run, or not testable

- **If the servers are down:** write "not run (environment)" for G61-3, §4.6 and §4.7.
- **Not testable headless; never PASS:** the real OS auto-repeat timing of a held modifier (C's PW method sends one `repeat: true` keydown; it proves the mechanism, not the timing); a real Alt-Tab during a held press; keys with the native select popup open; Ctrl/Cmd+digit. These go to Tech Lead R61-T / R60-T.

### 4.6 Browser acceptance (servers up)

Test at **1440×900**, then repeat the starred items at **1280×720**. Use C's round-60 recipes (`c-round-60/runs/edgediag-*`, `pw60-*-context`, `pw60-*-repeat`, `pw60-*-vscroll`, `pw60-*-keyrelease`).

| ID | Steps | Pass |
|---|---|---|
| MN-EDGE-FOCUS* (C-R60-01) | REAL-mouse (PW): right-click the music lane at x+300 (menu opens, focus on `✓1 წმ`) → **left** press + release at the menu's left padding (`left+2`, vertical middle) → ArrowDown → Escape. Reopen → **right** press + release at the same point → ArrowDown → Escape. Reopen → left press on the `<hr>` → ArrowDown → Escape | after each non-item press `document.activeElement` is still the active menu item (not `BODY`); ArrowDown moves focus one item down; Escape closes the menu; the division is unchanged; one menu, same rect while open; the right press has `contextmenu` `defaultPrevented: true` |
| MN-CONTEXT* (round-60 row, re-run) | `tasks/round-60.md` §4.6 MN-CONTEXT, unchanged | as written there, now including "focus inside … Escape closes it" on the edge half |
| MN-ITEM-PRESS (regression) | REAL-mouse (PW): open → left click on `0.5 წმ` | the division becomes 0.5, the menu closes (item press is not prevented) |
| MN-REPEAT (C-R60-02) | REAL-mouse (PW), C's round-60 recipe: open the menu → `keyboard.down('Shift')` → `mouse.down` on Snap → `keyboard.down('Shift')` again (`repeat: true`; record that the page saw it) → `mouse.up` → `keyboard.up('Shift')` → then a plain REAL click on Snap. Control: the same without the second `keyboard.down` | with the repeat: the dismissing click is **swallowed** (Snap stays off) and the next plain click turns Snap on; the control is also swallowed |
| MN-KEY-RELEASE (regression, written method) | REAL-mouse (PW): PW right-click a lane (menu opens) → `mouse.down` on an empty lane spot and **hold** (the menu closes) → `locator.focus()` on the Export button **while held** → `keyboard.press('Enter')` → Escape the dialog → `mouse.up` | Enter opens the export dialog (a non-repeat key still releases); record what the final release does (info) |
| VSCROLL-CLOSE* (ROOT-R50-58-L1; 1280 required, 1440 if overflow can be made) | REAL-mouse (PW), C's VSCROLL-PROBE recipe: enlarge the lanes with the track-height separators (ArrowDown on each focused separator) until `scrollHeight − clientHeight > 0` → Follow on, Play → open the menu on a lane → a vertical wheel over the lanes away from the menu | `scrollTop` changes and a `scroll` fires; **the menu closes**; Follow mode is still `on`; playback continues (position advances); `scrollLeft` unchanged by the wheel |
| MN-FOLLOW (regression, 1440) | `tasks/round-58.md` MN-FOLLOW | as written there: the menu stays open across a Follow page flip |
| MN-DISMISS-BUTTON* (regression) | `tasks/round-58.md` §4.6 MN-DISMISS-BUTTON | as written there |
| MN-KEYS (regression) | `tasks/round-57.md` MN-KEYS | as written there, including Space in the menu choosing without playback |
| SEL-KEYS (regression, 1440) | `tasks/round-60.md` §4.6 SEL-KEYS | as written there |

### 4.7 Carried items

- None beyond §4.6 regressions. The stage-4a/4b full browser re-run is not repeated (passed in rounds 59–60).

### 4.8 G61-3 and the Ableton table

**G61-3 (anonymous workspace and purchase protection).** Fresh browse state, as in G60-3.
- `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- **No requests** to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code, including during every §4.6 run.
- An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401; record the fake-Bearer code (403 in rounds 59–60).
- `/studio/middle-east` shows "Sign in required".
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton** (workflow addendum 2026-10-11): none of the three behaviours has a Live source. **Re-used source:** Live 12 Reference Manual §6.10 "Using the Editing Grid" (B capture `b-round-46/ableton-6.7-6.10-20261016.txt`, captured 2026-10-16, re-used 2026-10-18). No video and no Live installation. No new `/browse` capture was needed. **C gives two verdicts per row:** the CZABA requirement, and Ableton conformance.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| The grid width is offered in the track context menu | §6.10 | yes (round-57 row) | unchanged | regression only (MN-KEYS, MN-ITEM-PRESS) |
| A press on an open menu's non-item area | — | unconfirmed (no source) | CZABA: focus and keyboard stay in the menu (D-29z26-F) | GM32, MN-EDGE-FOCUS |
| A held modifier while dismissing a menu | — | unconfirmed (no source) | CZABA: the dismissing click is swallowed; only a non-repeat key releases (D-29z26-K) | GM33, MN-REPEAT |
| A vertical scroll with an open context menu | — | unconfirmed (no source) | CZABA: any user scroll closes it; Follow's own horizontal scroll does not (D-29z26-V + rule S) | GM34, VSCROLL-CLOSE, MN-FOLLOW |

Nowhere may a report claim "Ableton does the same" for rows 2–4.

### 4.9 Not run this round, and carried items (honest)

**Not run this round in any case:** video sync and C-R27-01 (RF3-1, RF3-2, R5-L6); the full find → add → fit video → export flow with WAV checks; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root); the stage-4a/4b full browser re-run.

**Open C items:**
- **This round:** C-R60-01, C-R60-02, ROOT-R50-58-L1.
- **Round 62 (4c):** C-R51-01 (probe done; discriminator "no `drop` and `dragend.dropEffect === 'none'`"; B decides in the 4c dispatch), C-R52-T1, INFO-R55-FREE-ROUND-UNGUARDED, A-R55-REVIEW-SHIFT-MIDDRAG-TEST.
- **C-R41-01** (TL-Q-VIEWPORT).
- **Tech Lead:** C-R27-01, C-R6-02, C-R8-01 (quiet Chrome); C-R23-01 + C-R38-01.

**Open Low / info (batched after 4c unless Medium+):** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE; R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE; A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG; A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP, A-R54-REVIEW-LOWS; A-R57-REVIEW-TAB-BODY-FOCUS, A-R57-REVIEW-CONTEXTMENU-KEY, A-R57-REVIEW-PAGE-TRANSITION, A-R58-REVIEW-ANDROID-TAP-CLICK (Tech Lead, touch); C-R59-02 (accepted); ROOT-R50-58-L5 (architecture); A-R59-REVIEW-END-INDEX, A-R59-REVIEW-REANNOUNCE, A-R59-REVIEW-PUNCTUATION; A-R60-REVIEW-GK11-EXPORT-STATUS; INFO-R60-FOCUS-RETURN; INFO-R60-SHIFT1-SYNTH.

**`root-pre-push-review.md`** (mtime 2026-10-18 12:46:34, unchanged since round 60):
- **Video sync:** RF3-1, RF3-2 and R5-L6 (C-R27-01) are open. **Partially measured:** R5-L3. **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
- **Medium:** M1 (loop refill is rAF-only, so a hidden tab goes silent); M2 (the per-frame `position` in the context value re-renders every consumer).
- **Lows:** L1–L4 and L6–L8.
- **`root-review-r50-58.md`:** L1 in this round; L2, L3, L4 closed by C round 60 (with C-R60-01/02 as separate follow-ups, in this round); L5 architecture.

**`publication-checkpoint.json`** (mtime 2026-10-17 11:11:24, unchanged): SRW-21 (the purchased loader hardcodes `middle-east`; do not claim every product's stems work); portable instruction paths; the SRW-23 scrollbar check at 1280×720 and 1440×900; SRW-11/12 library and stems parity; T12 continuation.

**Root items:** ROOT-COMMIT-ROUND51 (`cb12805` pending; rounds 59, 60, 61 separate units); ARCH-CHECKPOINT-SRW14-PREFS (narrowed, §6.3) and ARCH-CHECKPOINT-SRW13; GSTACK-ACL, GSTACK-NO-MOUSE; ENV-BROWSE-DAEMON (the CLI daemon failed again for A in round 60; the fallback worked); the CRLF Biome errors on auth files; the stray `store/nul`; the git autocrlf warning on LF files.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T, R57-T, R58-T, R59-T, R60-T), plus **R61-T:**
- In your own Chrome, open the grid menu with a right-click on a lane, then click on the menu's thin border/padding or its divider line: the menu stays open and the arrow keys and Escape still work.
- Hold Shift for about a second, then (still holding) click Play outside the open menu: the menu closes and playback does **not** start; the next click on Play starts it.
- On a real US keyboard, focus the division select and press Shift+1: nothing changes (INFO-R60-SHIFT1-SYNTH).
- With more tracks than fit vertically, play with Follow on, open the menu and scroll vertically with the wheel: the menu closes and Follow keeps following.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-60-r61-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-60-r61-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementGridMenu.tsx app/lib/arrangement/__tests__/grid-snap-menu.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-60-r61-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
node -e "const s=require('fs').readFileSync('app/components/arrangement/StudioWorkspace.tsx','utf8');console.log((s.match(/\r\n/g)||[]).length,(s.match(/\n/g)||[]).length)"
npx vitest run app/lib/arrangement/__tests__/grid-snap-menu.test.tsx app/lib/arrangement/__tests__/grid-snap-keys.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx --reporter=verbose
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
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A)

1. **Keep both servers up** through C round 61.
2. **Commit units** (all interim checkpoints, not a release; only via root's publisher flow):
   - **Rounds 50–58:** the pending `cb12805` bundle — C-ready (rounds 59 and 60 re-ran its regressions).
   - **Round 59:** ready as its own unit.
   - **Round 60:** **B rules it committable** as its own interim unit. Its in-scope behaviour is C-verified; C-R60-01 is a pre-existing defect and C-R60-02 conforms to the rule as written; both are recorded Lows fixed in round 61 (same precedent as round 59 going ready with C-R59-01 open). C's "hold" was only pending this ruling.
   - **Round 61:** only after C round 61. Committing round 60 before A starts keeps round 61 separately reviewable; if root does not, the case-A/B/C baseline above still applies.
3. **ARCH-CHECKPOINT-SRW14-PREFS (narrowed) — feature boundary + accumulated risk on one owner.** Rounds 57, 58, 60 and 61 all changed the same owner's grid-menu files. Please run the bounded read-only frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`) and answer **before round 62 (4c)**:
   - (a) the snap-preference plumbing (`snapEnabled` / `gridSeconds` + refs, 7 consumers) versus a non-history edit-preferences slice;
   - (b) one time-precision rule (`roundTime` ms, `roundGridTime` ms, `toWholeMicroseconds`, the inline µs in `selection.ts`);
   - (c) A-R59's shared grid test harness (`__tests__/harness/grid-workspace.tsx`; ~250 duplicated lines);
   - plus, now that the swallow owns six window listeners and a timer (plus the menu's own outside-press listener), whether root's earlier `useArrangementGridMenu` + `isFollowAutoScroll` extraction should precede 4c.
   - **Answer format:** keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task with one owner and behaviour-preserving tests. **B will not delay 4c past round 62 waiting for this answer.**
4. **Optional:** a root `testTimeout` or worker cap.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-61.md`:**
1. the pre-flight gate and the §1.2 baseline (case A/B/C/D);
2. the diff summary per file with EOL counts;
3. GM32–GM35 with alone durations;
4. mutations a–f and the re-runs;
5. smoke;
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-61.md` and `c-round-61.json`** (usual schema). Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment / not testable). Cover R61-S, R61-U, G61-1, G61-2, G61-3, §4.6 and the Ableton rows with two verdicts each. `passed` lists only IDs run this round. State **commit readiness** for root, separately for round 61, round 60, round 59 and rounds 50–58.

**Next (orientation only):**
- **Round 62: SRW-14 stage 4c** — group-move edge snap with the C-R52-T1 start- and end-touch targets; the library-drop edge decision and the C-R51-01 decision; the INFO-R55 and SHIFT-MIDDRAG tests. A round-61 bug pre-empts it only if it is Medium+ or a regression of C-verified behaviour; Low/info menu findings are batched. An approved root architecture change, if any, becomes its own B task around it.
- **Then:** SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the batched Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 61 -StartPhase A` and a higher limit.
