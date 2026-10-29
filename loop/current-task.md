# Round 242: SABA-B-11b-FIX-2 — focus returns to its origin after a mouse-opened grid menu closes (C-R241-01), fix-up of round 241

**Planned by:** B, at the round 241 → 242 planning, 2026-10-29. **Decisions:** D-29z375…D-29z381.

**Type:** fix-up round on the same code path (one Medium bug plus the doc housekeeping of the same doc).
- Round 241 is **not** published. Gate 241 is `skipped` (C taskStatus FAIL), so HEAD did not move. Its tree is kept and is this round's start.
- C passed all 13 stage-2a feature rows in real Chromium at both viewports (`c-round-241.json`, `browserVerified: true`, `realVerified: true`). The only failure is the focus clause of C-MENU-CHOOSE-241 (a) and C-MENU-REG-241 (Escape): **C-R241-01**.
- When C passes this round, the gate publishes rounds 241 + 242 together.

| Id | Severity | Origin | One line |
|---|---|---|---|
| **C-R241-01** | Medium (pre-existing since SRW-14; not caused by round 241; not deferrable under the 2026-10-23 gate) | C round 241, measured in Chromium at both viewports; **reproduced by B** on the round-241 tree (§0.3) | Tab to the Snap toggle, right-click an empty lane point, then press Escape, click `0.5 s` or click `Narrow`. The menu closes but `document.activeElement` is BODY. The right-button `mousedown` blurs the Snap toggle before `contextmenu`, so `handleGridMenuRequest` stores BODY as the return target. |
| A-R241-REVIEW-R6 / C note 4 (AN-REVIEW-241 info) | trivial (doc) | A's code-reviewer and C | Doc 186 still has stage-1 text: the l.1 title says "ეტაპი 1", rows R6 and R8 say "ეტაპი 2", and the stage-1 covering line "(39 ფაილი)" has no stage label. The doc is granted anyway (L28 l.4), so this is folded in (D-29z377). |

**Regression and RETRO:**
- The regression round is not due. `regression-last.json` = 2026-10-27, so it is due on or after 2026-10-30. Today is 2026-10-29.
- RETRO is not due; the next is RETRO 245.

**Read first:** `lessons.md` in full. Directly relevant:
- L10: this ruling;
- L11, L32 and L33: STOP;
- L23: B's pre-check (§0.2);
- L26 and L28: doc 186;
- L29: recipes B ran in Chromium (§0.3);
- L31: timeouts;
- L47 (amended at this planning): focus target, and the real event order in jsdom rows;
- L4: one element, one rule (the ring ruling in §2.2).

**Not this round:**
- The rest of the round-241 tree is **frozen at its round-241 hashes**: 11 paths (code, tests and strings). It passed C's round-241 rows and is not reworked.
- **SABA-B-11b stage 2b** (no snap on an invisible grid; closes ABL-R-8). It comes after this round, and after the regression round if that is due at the next planning (§7).
- The menu height (B-R240-MENU-HEIGHT, A-R241-REVIEW-R1), reviewer Lows R3 and R4, and the architecture note: recorded, not scheduled (D-29z379).
- SABA-B-10a/10b/9/11c, SABA-B-7 (`awaiting_user`), and the purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 `deferred_user`).

## 0. Baseline and scope

**Start state.** This is not a clean tree. Do not STOP on it.
- HEAD = `04c2a5b4517c70fa2a040fd845c6f257fab24d33` (gate 240 `published`; gate 241 `skipped`). See `b-round-241/head-at-planning.txt`.
- `git status --short --untracked-files=all` lists **exactly the 14 `M` paths** of `b-round-241/git-status-at-planning.txt` (the round-241 work, no untracked file).
- Each of the 14 has the sha256 in `b-round-241-r242-start-sha256.txt`: `sha256sum -c --quiet` from `store/` gives rc 0.
- **STOP (L11)** in any of these cases:
  - HEAD differs;
  - any other path is dirty;
  - any of the 14 has a different hash.

  One exception: a root commit that touches only the 4 root files. Then re-hash those and continue.

**Frozen:** `b-round-241-r242-tree-sha256.txt`, **1,101** files. That is every tracked file (1,108) except the 3 grants and the 4 root files, at their **working-tree** hashes. So the 11 round-241 paths that are not re-granted are frozen at their round-241 hashes:
- `ArrangementGridMenu.tsx`, `grid-divisions.ts`, `strings.ts`, `shortcuts.ts`;
- `grid-adaptive-ui`, `grid-musical-ui`, `grid-snap-keys`, `grid-snap-ui`, `grid-triplet-ui`, `label-status-colour-ui` and `strings` tests.

At planning, `sha256sum -c --quiet` gives rc 0. The list includes each protected auth and purchase file exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`. Also frozen: `ArrangementLane.tsx`, `ArrangementContext.tsx`, `grid.ts`, `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-241-r242-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes are in `b-round-241-r242-root-files-start-sha256.txt`. `git diff --quiet HEAD` on them gives rc 0. No dependency is needed.

### 0.1 Grants (`b-round-241-r242-grants.txt`; start hashes `b-round-241-r242-grants-start-sha256.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | Exactly the 3 hunks of `b-round-241/precheck-scratch.diff` (§2.1): <ul><li>one new ref `gridMenuPressFocusRef` right after `gridMenuReturnFocusRef`;</li><li>`handleGridMenuRequest`: read and clear the press ref first (before the export/gesture guard), and use it only when the active element is not an `HTMLElement` or is `body`;</li><li>`handleLaneBackgroundPointerDown`: on `event.button === 2`, store the active element in the press ref **before** the existing `button !== 0 / target` early return.</li></ul> Every round-241 hunk stays as it is. Nothing else changes: not `closeGridMenu`, the menu callbacks, the marquee body or any snap or grid function. |
| 2 | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | Appended only (§2.3): <ul><li>a helper `rightPressThenBlur` right after `const press = …`;</li><li>GM36, GM37, GM38 and GM39 at the end of the `SRW-14 stage 4b-1 lane grid menu` describe, after GM35.</li></ul> **0 removed lines** against the start hash. GM1–GM35 and every other line stay byte-identical. |
| 3 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | §2.4: <ul><li>l.4 exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 242 PASS)` (L28 re-dispatch rule);</li><li>the l.1 title;</li><li>the R6 and R8 rows of the `## მიდგომა` table;</li><li>the label of the stage-1 covering line;</li><li>one Problem → Solution paragraph for C-R241-01;</li><li>one `## ტესტირება` line for GM36–GM39 and the 2 mutants;</li><li>the `## შეცვლილი ფაილები` stage-2a list gains `grid-snap-menu.test.tsx` (GM36–GM39).</li></ul> Nothing else. |

- **The applied diff:** grants 1–2 are exactly `b-round-241/precheck-scratch.diff` (136 lines; made on a copy of the **round-241 working tree**). `git apply --check -p1` on the current store tree gives rc 0. **A may apply it as is**, then write grant 3.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (Studio file; no audio change);
  - `AGENT_DISCOVERABLE_CODE.md` (one new ref name, no export);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` (doc 186);
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B copied the **round-241 working tree** to `/tmp/b242-scratch` (outside the repo and the loop folder; `node_modules` symlinked) and applied the change there.
- **Static checks:** `npx tsc --noEmit` rc 0 (`b-round-241/tsc.log`). `npx biome check` on both files is clean, with no fixes (`b-round-241/biome.log`).
- **Covering set** (`b-round-241/covering.txt`, **61 files**):
  - round 241's 49 files (`b-round-240/covering.txt`): **49 files, 783/783 green**, 106 s (`b-round-241/covering.log`);
  - plus 12 files hit by `grep -rlE "onBackgroundPointerDown|marquee|claimPointerGesture|lane-background|arrangement-marquee" app --include=*.test.ts --include=*.test.tsx` that are not in the 49 (`b-round-241/covering-extra.txt`), because grant 1 touches the lane press handler: **12 files, 293/293 green** (`b-round-241/covering-extra.log`).

  No red row, so no frozen test needs a grant.
- **Red proofs** (on the scratch copy; logs in `b-round-241/mutants/`):

| Run | Change | Red rows |
|---|---|---|
| BASE-241-CODE | the round-241 `StudioWorkspace.tsx` with the new rows (fix stashed) | **GM36, GM37** (GM38 green: without the capture the active element wins anyway; run before GM39 was added, whose red-proof is MU-NO-PRESS-CAPTURE) |
| MU-NO-PRESS-CAPTURE | delete the `event.button === 2` capture block | **GM36, GM37, GM39** |
| MU-PRESS-WINS | `focused = pressFocus ?? active` (the press-time element always wins) | **GM38** |

- **Clip bodies:** `ArrangementClip.tsx` has no `onContextMenu`, and its `beginGesture` returns on `event.button !== 0` **before** its `stopPropagation()` (l.389–393). So a right press on a clip body bubbles to the lane body's `onPointerDown`, and its `contextmenu` opens the grid menu (GM2/GM3, unchanged). The capture is placed **before** the `target !== currentTarget` guard on purpose, so the clip-body path gets the same focus return. GM39 pins it in jsdom.
- **File:** `grid-snap-menu.test.tsx` 43/43 green after GM39 (`b-round-241/grid-snap-menu-final.log`). The covering logs above predate GM39; the only change since then is GM39 itself.

### 0.3 Recipes, signals, timeouts (L29, L31, L47)
**B ran C's recipe in Chromium.** The script is `b-round-241/focus-probe-242.cjs`: C's `c-round-241/focus-probe.cjs`, plus `:focus-visible`, the computed outline and one screenshot per case. Each case uses a fresh context at 1440×900 and 1280×720, and waits for `Demo collection ready`. Then: Tab until the Snap toggle has focus (30 Tabs), find an empty lane point by hit-test, right-click it, and do one of Escape, click `0.5 s` or click `Narrow`.

| Case | Round-241 tree (`:5173`, `shots/focus-base.json`) | Scratch fix (`:5174`, `shots/focus-scratch.json`) |
|---|---|---|
| Escape | BODY (both viewports) | **Snap toggle**, `:focus-visible` true, outline `solid 1px` brass at 0.8 |
| `0.5 s` | BODY | **Snap toggle**, `:focus-visible` false (mouse modality) |
| `Narrow` | BODY | **Snap toggle**, `:focus-visible` false (mouse modality) |

- The focus events after the fix are `out:snap-toggle`, `in:Medium`, `out`, [`in:<item>`, `out`], `in:arrangement-snap-toggle`. There were 0 page errors in all 12 runs.
- Scratch attempt 1 timed out on a cold Vite start. It is environment-invalid and kept as `shots/focus-scratch-attempt1.err`.
- The scratch server on `:5174` was stopped afterwards, and `:5173` still answers 200.
- **Signals:** the Snap toggle is `[data-testid="arrangement-snap-toggle"]`, and the menu is `[data-testid="arrangement-grid-menu"]` (rendered only while it is open). The others are unchanged from round 241: `arrangement-grid-control` `data-grid-mode`/`data-grid-division`, and `arrangement-status`.
- **Timeouts (L31):**
  - `grid-snap-menu.test.tsx` declares 15 s per test (describe option). On the scratch copy the file ran 42 tests in 5.9 s. The slowest is GM1 at 575 ms, and the new rows take ≤ 450 ms each. No test is near 50 %.
  - Gate 240 measured the file at 11.4 s total for 39 tests.

## 1. Why
- **C-R241-01 (Medium).** WCAG 2.4.3: a keyboard user who right-clicks the lane loses their place, which is 30 Tabs back. It fails the written L47 clause "focus returns to the element that had it, never BODY".
- **Why we missed it.** The SRW-14 jsdom rows GM11 and GM18 fire `contextMenu` without the real right-button `pointerdown` and `mousedown` blur. Round 241's B recipes (L29) measured the menu, but not the focus return in a real browser. The lesson is L47, amended at this planning: a focus-return row for a mouse-opened menu replays the real order (right press → blur to BODY → `contextmenu`) in jsdom, and the browser recipe records `document.activeElement` after closing.
- **Doc 186 housekeeping.** The doc is granted anyway, because of its l.4 (L7, L28). The stale stage-1 text that C and A's reviewer flagged is fixed in the same grant.

## 2. Changes

### 2.1 `StudioWorkspace.tsx` (grant 1; exact code in the pre-check diff)
- **Capture at the press.** In `handleLaneBackgroundPointerDown`, a right-button press (`event.button === 2`) stores `ownerDocument.activeElement` (an `HTMLElement`, else `null`) in `gridMenuPressFocusRef`. This runs before the browser's default `mousedown` blur, and before the handler's existing `button !== 0 || target !== currentTarget` early return. The left-button marquee path is unchanged.
- **Use at the request.** `handleGridMenuRequest` does three things:
  1. It reads and clears the press ref **first**, so even a refused request (Export open, a pointer gesture active) leaves no value behind.
  2. When the menu is not open yet, the return target is the active element if that is an `HTMLElement` other than `body`. Otherwise it is the press-time element.
  3. A reposition (menu already open) keeps the original return target. GM19 is unchanged.
- **`closeGridMenu` is unchanged.** It still skips a `body` or disconnected target.
- **Stale ref ruling (D-29z376).** A right press that never reaches `handleGridMenuRequest` can leave a value until the next request. This is harmless, for three reasons:
  - the next request always clears it;
  - it is used only when the active element is BODY at that request;
  - `closeGridMenu` drops a disconnected element.

  The worst case is that focus returns to an earlier, still-connected control instead of BODY.

### 2.2 Focus target and ring (L47, L4: one element, one rule)
- **Focus target** after Escape, a division choice or a width choice: the element focused before the right press. In C's recipe that is the Snap toggle.
- **The ring:**
  - After **Escape** (a key), the Snap toggle matches `:focus-visible`, with a visible 1px brass outline (B measured `solid 1px`, brass at 0.8).
  - After a **mouse choice**, Chromium keeps the mouse modality and `:focus-visible` is false. **SABA-B-4 wins here**: the ring shows on keyboard `:focus-visible` only, never after a pointer press. So C records the ring after a mouse choice as info, not as a criterion (the same stance as C-MENU-CHECK-241).

### 2.3 New rows (grant 2)
| Row | Case | Expected |
|---|---|---|
| GM36 | Snap toggle focused; right `pointerDown` on the music lane; `snapButton.blur()` (BODY); `contextMenu`; Escape | the menu opens with focus inside; after Escape the menu is closed and `document.activeElement` = Snap toggle |
| GM37 | the same press-then-blur, then click `Narrow`; then the same on the sfx lane, then click `0.5 s` | after each: the menu is closed and `document.activeElement` = Snap toggle; mode `adaptive` after Narrow; `data-grid-seconds` `0.5` after `0.5 s` |
| GM38 | Snap toggle focused; right `pointerDown` (captures Snap); then Play gets focus (not BODY); `contextMenu`; Escape | `document.activeElement` = Play (the element focused at the request wins over the press-time element) |
| GM39 | Snap toggle focused; press-then-blur on the `m1` clip root; `contextMenu` on the clip root; Escape | the menu opens with focus inside; after Escape `document.activeElement` = Snap toggle |

### 2.4 Doc 186 (grant 3)
- l.4 is byte-exact: `**სტატუსი:** In Progress (stage 2 of 3; C round 242 PASS)`.
- **l.1 title:** `# SABA-B-11b — zoom-adaptive grid (ეტაპები 1 და 2a): `5`, `1`/`2` როგორც adaptive density, grid menu-ის ჯგუფები და `4``. The wording is free; it must no longer say only "ეტაპი 1".
- **The `## მიდგომა` table** (find the rows with `grep -n '^| R6 \|^| R8 '`, not by line number):
  - R6's last cell: `ეტაპი 2a (round 241): plain `4` + `G``;
  - R8's last cell: `ეტაპი 2a (round 241)`.
- **The stage-1 covering line** (`grep -n '39 ფაილი'`): it gets the prefix `ეტაპი 1:`. The number stays, because it was true for stage 1.
- **`## პრობლემები და გადაწყვეტები`:** one paragraph `**Problem (C-R241-01, Medium, ეტაპი 2a fix-up):**`. Cause: the right-button `mousedown` blur comes before `contextmenu`. Solution: capture at the press, with the fallback only for BODY. Name GM36–GM39.
- **`## ტესტირება`:** one line naming GM36, GM37, GM38, GM39 and the mutants MU-NO-PRESS-CAPTURE and MU-PRESS-WINS.
- **`## შეცვლილი ფაილები`:** the stage-2a list gains `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` (GM36–GM39). `StudioWorkspace.tsx` is already listed.
- The 7 TEMPLATE headings stay in order (L26). Cite only rows that exist (`grep -n "it('GM3[6-9]"`).

## 3. Reference
This is a bug-fix round (focus management). The reference-first rule does not apply to the behaviour. The focus return itself is the WAI-ARIA Authoring Practices menu pattern: on Escape or on activating an item, the menu closes and focus returns to the element that had it before the menu opened. The Ableton rows of round 241 (M1–M10, ⚖3–⚖5) are unchanged and are not re-judged.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. Run the start-state check (§0): HEAD; the 14 paths and their hashes (`b-round-241-r242-start-sha256.txt`); `sha256sum -c` on the frozen list (1,101) and on the root list.
2. Apply `b-round-241/precheck-scratch.diff` (`git apply -p1`), then write grant 3.
3. `npm run typecheck` rc 0. `npx biome check` on grants 1–2 is clean. `npm run lint` rc 0.
4. Run `npx vitest run $(cat ../tmp/studio-real-loop/b-round-241/covering.txt)`: 61 files, all green (1,077 expected: 783 + 293 from B's covering runs, plus GM39, which was added afterwards). Any test above 50 % of its timeout goes at the top of the report (L32).
5. Run MU-NO-PRESS-CAPTURE and MU-PRESS-WINS on a scratch copy outside `store/`. Expect GM36/GM37/GM39 red and GM38 red, as in §0.2. The repo `git status` must be identical before and after.
6. The `code-reviewer` is **required**: 3 changed files this round, and 14 dirty paths in total. Pass its Architecture note to B.
7. Run Playwright against `:5173` at both viewports: copy `b-round-241/focus-probe-242.cjs`; do not edit it in place. Expect the "Scratch fix" column of §0.3.
8. Write `a-round-242.md`: the hunks, the tests run with counts, the mutants, the reviewer result, and any STOP at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-242 | HEAD, status, hashes | <ul><li>HEAD is `04c2a5b`, and exactly the 14 paths of `b-round-241/git-status-at-planning.txt` are `M`, with nothing else.</li><li>`sha256sum -c` on `b-round-241-r242-tree-sha256.txt` (1,101) and on the root list gives rc 0. The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>Grant 1: `git diff HEAD` of `StudioWorkspace.tsx` = the round-241 hunks (`b-round-240/precheck-scratch.diff`) plus exactly the 3 hunks of `b-round-241/precheck-scratch.diff`. To isolate them, `diff` the working copy against `b-round-241/StudioWorkspace.r241.tsx` (the round-241 copy saved at planning): only those 3 hunks differ.</li><li>Grant 2: `diff` against `b-round-241/grid-snap-menu.r241.test.tsx` shows 0 removed lines; GM1–GM35 are byte-identical; GM36–GM39 and `rightPressThenBlur` are added.</li></ul> |
| C-UNIT-242 | `b-round-241/covering.txt` (61 files) | All green, including GM36–GM39. The full suite is a gate row. |
| C-MUT-242 | MU-NO-PRESS-CAPTURE and MU-PRESS-WINS, once each, on a scratch copy outside the repo | GM36, GM37 and GM39 red; GM38 red. The repo status is identical before and after. |
| C-FOCUS-242 | C-R241-01, C's own round-241 recipe: Tab to the Snap toggle, right-click an empty lane point (hit-test), then (a) Escape, (b) click `0.5 s`, (c) click `Narrow` | <ul><li>In all 3 cases at both viewports, the menu closes, the choice is applied as in round 241, and `document.activeElement` is `[data-testid="arrangement-snap-toggle"]`, never BODY.</li><li>(a) After Escape, `:focus-visible` matches and the outline is visible (≥ 1 px painted, brass).</li><li>(b) and (c): record `:focus-visible` as info (§2.2).</li><li>Screenshots.</li></ul> |
| C-FOCUS-CLIP-242 | The same recipe on a **clip body** after the 120 BPM seed (`demo-synth-mix`): right-click a point whose `elementFromPoint` is inside a clip but not its header, then Escape | The grid menu opens (GM2 shape), and after Escape `document.activeElement` = Snap toggle. If no such point exists at a viewport, record that as info. B did not run this case in the browser. It rests on source (§0.2) and jsdom GM39, so a failure is reported as a bug with evidence and is not a task contradiction. |
| C-MENU-REG-242 | Neighbours | <ul><li>**Reposition:** with the menu open, a second right-click elsewhere closes or moves the menu, and the final Escape returns focus to the Snap toggle.</li><li>**Swallow:** with the menu open, click Play; the menu closes and nothing plays, then a second click plays.</li><li>**Choose while playing:** choosing `0.25 s` keeps playback (the playhead advances, master RMS > 0).</li><li>**Header:** a right-click on a track header opens no grid menu and is not prevented.</li><li>**Marquee:** a left-drag on an empty lane still draws the marquee and selects clips, as in round 241.</li></ul> |
| C-2A-SPOT-242 | Short re-check of round 241's stage-2a rows on the final tree, one viewport each, unless something fails | Menu groups and one check at mount (`Medium`); `4` toggles Snap with `Snap on — grid … (G)`; the select AX description holds `Adaptive: follows zoom`. These are the same values as `c-round-241.md`. |
| C-BUDGET-242 | L39 | The persistent text lines outside the timeline match round 241: empty 85/69, demo 101/85 at 1440/1280. |
| AN-REVIEW-242 | Doc 186 | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>The l.1 title no longer says only "ეტაპი 1".</li><li>The R6 and R8 rows name stage 2a.</li><li>The `39 ფაილი` line has `ეტაპი 1:`.</li><li>C-R241-01 has a Problem → Solution paragraph.</li><li>It cites only GM36–GM39, which exist.</li></ul> |
| LAB-SMOKE-242 | `/studio-lab` | It loads. Space plays and pauses. The export WAV for the untouched demo has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94` (rounds 237–241). 0 page errors. |
| Auth | Standing check | In a fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required" with no workspace and no `audio[src]`. `/api/studio-token` with no header returns 401. |
| Purchased origin (browser) | The menu focus on the purchased copy | BLOCKED: backend unavailable in cloud. Grant 1 adds no origin branch: grep `origin` in the 3 new hunks = 0. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **The left-button lane press** (marquee, empty-lane click to clear a selection, a time selection on an empty lane). Grant 1 adds a statement before its early return. The covering files cover it in jsdom; C-MENU-REG-242 checks the marquee.
- **Reposition and dismiss.** The menu's window-capture `pointerdown` closes the menu and stops propagation, so the lane handler does not run while the menu is open. The press ref is not written then.
- **A keyboard-opened context menu** (Shift+F10 or the Menu key) targets the focused element, not the lane, so it opens no grid menu. This is unchanged and not a row.
- Any `(G 4)` or `(4)` text, or any change to the stage-2a statuses, is a regression (frozen files).

## 7. Outcomes for B's next planning
- **PASS and gate published (rounds 241 + 242):**
  - SABA-B-11b stage 2a is done.
  - C-R241-01, GATE239-S4, C-R240-01 and GATE240-S2 close.
  - **If the next planning is on or after 2026-10-30**, the REGRESSION round comes first (rule: `regression-last.json` 2026-10-27, so 3 or more days old). It carries every `scope_additions` entry of the due `regression_rounds` item (L6), including the stage-2a key acceptance and C-FOCUS-242. **Otherwise**, SABA-B-11b stage 2b comes next, with the facts in `tasks/round-241.md` §7.
- **FAIL:** a fix-up on the same grants.
- The architecture checkpoint ARCH-CHECKPOINT-TEMPO-GRID is re-asked after 2b. Addendum 7 records the round-241 reviewer's note (a `GridMenuItem` extraction and a shared `setAdaptiveDensity(level, source)` primitive).
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.
