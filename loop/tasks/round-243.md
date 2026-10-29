# Round 243: C-R242-01-FIX — focus returns to an edit control the right press released, after the grid menu closes

**Planned by:** B, at the round 242 → 243 planning, 2026-10-29. **Decisions:** D-29z382…D-29z388.

**Type:** bug-fix round. It fixes one Medium bug on one code path, with three sibling origins.
- Round 242 passed C (`c-round-242.json`: taskStatus PASS, `browserVerified: true`, `realVerified: true`).
- Gate 242 published rounds 241 + 242 as **`7e5b23c`**. That commit is this round's baseline, and SABA-B-11b stage 2a is done.

| Id | Severity | Origin | One line |
|---|---|---|---|
| **C-R242-01** (merges A-R242-REVIEW-M1) | Medium. Pre-existing since D-29z22-F (round 57); not caused by round 242; it cannot be deferred under the 2026-10-23 gate. | C round 242 measured it in Chromium at both viewports. **B reproduced it at HEAD for 4 origins** (§0.3). | Tab to a track Volume fader, the BPM field, the loop brace or a marker flag. Then right-click an empty lane point and press Escape: focus ends on BODY. `releaseEditFocusOnTimelinePointerDown` (the scroller's `onPointerDownCapture`) blurs the control in the capture phase. Only then does the lane's bubble handler store the press-time focus (round 242), so it stores BODY. |

**Regression and RETRO:**
- The regression round is **not due**. `regression-last.json` = 2026-10-27, so it is due on or after 2026-10-30, and today is 2026-10-29.
- RETRO is not due. The next is RETRO 245.

**Read first:** `lessons.md` in full. Directly relevant:
- L47, amended at this planning: probe one origin per blurred class;
- L4: one element, one rule (the D-29z382 ruling in §1);
- L10: this ruling;
- L11, L32 and L33: STOP;
- L23: B's pre-check (§0.2);
- L26 and L28: the new doc;
- L29: the recipes B ran (§0.3);
- L31: timeouts.

**Not this round:**
- **B-R242-MARKER-EDITOR-MENU-FOCUS** (Medium, new, found by B at this planning). The marker add/rename editor commits and **unmounts** on its own blur, so no return target exists. It is a different mechanism and needs `ArrangementMarkerRow` plumbing, so it is filed separately (§7). C records it as info only (C-MARKER-EDITOR-INFO-243).
- The `useGridMenuFocusReturn` extraction (reviewer note). It is recorded as addendum 8 to ARCH-CHECKPOINT-TEMPO-GRID and is not scheduled (D-29z386).
- SABA-B-11b stage 2b, SABA-B-10a/10b/9/11c, SABA-B-7 (`awaiting_user`), and the protected purchased route (SRW-21 `deferred_user`).

## 0. Baseline and scope

**Start state:**
- HEAD = `7e5b23ce4636320d4a4a5087d2bf7565075f49f4` (gate 242 `published`; `b-round-242/head-at-planning.txt`).
- `git status --short --untracked-files=all` is **empty** (`b-round-242/git-status-at-planning.txt`, 0 bytes).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-242-r243-tree-sha256.txt`, **1,102** files. That is every tracked file (1,108) except the 2 tracked grants and the 4 root files.
- At planning, `sha256sum -c --quiet` gives rc 0.
- Each of the 7 protected auth and purchase files appears exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen: `ArrangementLane.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementTempoRow.tsx`, `ArrangementContext.tsx`, `ArrangementGridMenu.tsx`, doc 186, `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-242-r243-root-files.txt` lists `package.json`, `package-lock.json`, `vite.config.ts` and `vitest.config.ts`. Start hashes are in `b-round-242-r243-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-242-r243-grants.txt`; start hashes `b-round-242-r243-grants-start-sha256.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | Exactly the 2 hunks of `b-round-242/precheck-scratch.diff`: <ul><li>**add**: the first statement after `const focused = …` in `releaseEditFocusOnTimelinePointerDown` is `if (event.button === 2) { gridMenuPressFocusRef.current = focused instanceof HTMLElement ? focused : null; }`. It runs before the release condition, so it records the element before any blur.</li><li>**remove**: the 4-line `event.button === 2` capture block at the top of `handleLaneBackgroundPointerDown`. That makes one writer instead of two (reviewer signal 4).</li></ul> Nothing else changes: not `handleGridMenuRequest`, `closeGridMenu`, the release condition, the menu callbacks or the marquee. |
| 2 | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | Exactly the test part of the same diff: <ul><li>**FR3 is rewritten** to the D-29z382 contract (§2.3). It is a changed assertion, not a removal.</li><li>**GM40–GM43 are appended** after GM39, at the end of the `SRW-14 stage 4b-1 lane grid menu` describe.</li></ul> GM1–GM39, FR1, FR2, FR4, the helpers and every other line stay byte-identical. |
| 3 | `docs/implementation/2026/quarter-IV/187-c-r242-01-menu-edit-focus-return.md` | **New** implementation doc (§2.4). 187 is the next free number: 186 is the last. |

- **The applied diff:** grants 1–2 are exactly `b-round-242/precheck-scratch.diff` (127 lines, made against HEAD `7e5b23c`). `git apply --check -p1` on the clean store tree gives rc 0. **A may apply it as is**, then write grant 3.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (Studio file; no audio change);
  - `AGENT_DISCOVERABLE_CODE.md` (no new export or name);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B extracted HEAD to `/tmp/b243-scratch` with `git archive` (outside the repo; `node_modules` symlinked) and applied the change there.
- **Static checks:**
  - `npx tsc --noEmit`: rc 0 (`b-round-242/tsc.log`).
  - `npx biome check` on both files: clean, no fixes (`b-round-242/biome.log`).
- **Covering set** (`b-round-242/covering.txt`, **67 files**): **67 files, 1,153/1,153 green** in 152 s (`b-round-242/covering.log`). It is the union of three lists:
  - round 242's 61 files (`covering-base.txt`);
  - the `grep -rlE "button: 2|onPointerDownCapture|arrangement-timeline-scroller|keyboard ownership|releaseEditFocus"` hits in `app/**` tests (`covering-grep.txt`). This added `fader-click` and `tempo-window-ui`;
  - the `grep -rlE "arrangement-loop-brace|arrangement-tempo-input|'arrangement-marker'"` hits (`covering-grep2.txt`). This added `affordance-colour-ui`, `metronome-horizon-ui`, `metronome-ui` and `studio-theme-obsidian`.

  No red row, so no frozen test needs a grant. FR3 is the only existing row that changes, and it is in grant 2.
- **Red proofs** (on the scratch copy; logs in `b-round-242/mutants/`):

| Run | Change | Red rows |
|---|---|---|
| MU-LANE-CAPTURE-ONLY | HEAD's `StudioWorkspace.tsx` (the round-242 lane capture) with the new tests | **GM40, GM41, GM42, GM43, FR3** (GM36–GM39 green) |
| MU-NO-SCROLLER-CAPTURE | the fix minus the new scroller block (no capture anywhere) | **GM36, GM37, GM39, GM40, GM41, GM42, GM43, FR3** |
| MU-PRESS-WINS | `focused = pressFocus ?? (active instanceof HTMLElement ? active : null)` | **GM38** |

- **Timeouts (L31):** `grid-snap-menu.test.tsx` has 15 s per test (describe option). On scratch, its 47 tests took 6.5 s; the slowest is GM1 at 556 ms. A's round-242 covering run had the file at 12.6 s file total. No test is near 50 %.

### 0.3 Recipes and signals (L29, L47)
B's script is `b-round-242/focus-probe-243.cjs`. Each case uses a fresh context at 1440×900 and 1280×720, and waits for `Demo collection ready`. It sets up one origin, right-clicks an empty lane point (hit-test on `[data-track-id] [data-grid-lines]`), then presses Escape (and, for the fader, also clicks `0.5 s`).

| Origin and how it is reached | HEAD `7e5b23c` (`:5173`, `shots/focus-head*.json`) | Scratch fix (`:5174`, `shots/focus-scratch*.json`) |
|---|---|---|
| Track Volume fader: add `demo-stem-pulse`, then 19 Tabs to `Volume — Original video sound` | BODY (Escape and `0.5 s`, both viewports) | **the fader**. Escape: `:focus-visible` true at both viewports, brass `solid 1px` at 0.8. `0.5 s`: `:focus-visible` false (mouse modality) |
| BPM field `arrangement-tempo-input` (35 Tabs) | BODY | **the BPM field**, `:focus-visible` true, brass outline |
| Loop brace: add `demo-stem-pulse`, drag a time selection at 30–50 % of the clip body (70 % height), `Ctrl+L`, then Tab to the brace (69 Tabs at 1440, 64 at 1280) | BODY | **the brace**, `:focus-visible` true, brass outline |
| Marker flag: `M`, then `Enter` (focus on `arrangement-marker`) | BODY | **the marker flag**, `:focus-visible` true, brass outline |
| Marker editor: `M` (focus in `arrangement-marker-name-input`) | BODY, marker committed (0 → 1) | BODY, marker committed. **Unchanged; this is B-R242-MARKER-EDITOR-MENU-FOCUS, filed separately** |

- **Event order** for the brace on the fix: `pointerdown[b2] active=brace` → `out:brace` (the release) → `mousedown active=BODY` → `contextmenu active=BODY` → `in:<menu item>` → `out` → `in:arrangement-loop-brace`.
- The scratch fader row at 1440 had one environment-invalid attempt (a 120 s wait on a cold Vite start; `shots/focus-scratch-attempt1.json`). It was re-run (`shots/focus-scratch-fader.json`).
- There were 0 page errors. The scratch server on `:5174` is stopped, and `:5173` still answers 200.
- **Signals** (rendered as listed in the table above):
  - the menu is `[data-testid="arrangement-grid-menu"]`, rendered only while it is open;
  - the brace is `[data-testid="arrangement-loop-brace"]`, rendered only when a loop exists;
  - the flag is `[data-testid="arrangement-marker"]`, a button;
  - the BPM field is `[data-testid="arrangement-tempo-input"]`.

## 1. Ruling D-29z382: a right press that opens the grid menu does not take keyboard ownership

- **The conflict (L4).** D-29z22-F (round 57, `tasks/round-57.md` §0.2) extended the edit-focus release to "any button", and FR3 pinned "the menu does not restore the brace; ArrowRight nudges the clip". L47 and the WAI-ARIA menu pattern say the opposite: a dismissed menu returns focus to the element that had it, and BODY is never an expected value. Both cannot bind a right press on a lane.
- **Ruling:**
  - A right press on a lane or clip body edits nothing. `handleLaneBackgroundPointerDown` and the clip's `beginGesture` both return on a non-left button, and the press's only effect is the menu. So "keyboard ownership follows the last timeline press" has nothing to follow.
  - **The menu's focus return wins.** After Escape, a division, a width or the Snap item, focus goes back to the element focused before the press. That covers the fader, pan, BPM field, brace, marker flag or any other element.
  - The release itself stays. The control is still blurred at the press, so its edit commits as before, and the menu takes focus.
- **What stays as D-29z22-F:**
  - a **left** press on the timeline (FR1, FR2, FR4);
  - a right press anywhere that opens no grid menu (headers, ruler, loop strip: GM14, native menu). There the release still blurs and nothing restores it. The task does not change those paths.
- **Stale value (D-29z384).** The scroller capture writes on every right press inside the scroller, including presses on paths with no grid menu. This is harmless, for three reasons:
  - every request reads and clears the value first, even a refused one;
  - the value is used only when the active element is BODY or not an `HTMLElement` at the request;
  - the next right press overwrites it, and `closeGridMenu` skips a disconnected element.

  A Mac Ctrl+click is `button 0`; it starts a lane gesture, so its request is refused and the value cleared (A's round-242 reviewer).
- **Why the capture moves.** The scroller's capture handler always runs before the lane's bubble handler, so a lane-side capture can never see an element that the release blurs. Moving the single capture to the first line of the release handler records the element before the blur decision. The other option, skipping the release on a right press, was rejected: it would also change the paths with no menu, and it would leave two writers.

- **Why we missed it.** Round 242's L47 recipe probed only the Snap toggle. The release ignores buttons, but its path names four other classes: range input, typing field, loop brace and marker. The lesson is L47, amended at this planning (D-29z387): the recipe probes one origin per class that a press handler on the path blurs.

## 2. Changes

### 2.1 `StudioWorkspace.tsx` (grant 1)
This is exactly the diff. There is no new name, export or dependency, and the hook deps stay `[]`.

### 2.2 Focus target and ring (L47, L4)
- **Focus target** after Escape, a division, a width or the Snap item: the element focused before the right press (§0.3 origins). It is never BODY.
- **The ring:**
  - After **Escape** (a key), the origin matches `:focus-visible` with a visible brass outline. That is the SABA-B-4 style: 1px, brass at 0.8; inset or offset as each element already draws it.
  - After a **mouse choice**, `:focus-visible` is false in Chromium. SABA-B-4 wins, as in round 242 (D-29z378), so it is info.

### 2.3 Rows (grant 2)
| Row | Case | Expected |
|---|---|---|
| **FR3 (rewritten, D-29z382)** | select `s1`; focus the brace; `rightClick` on the sfx lane (600, 250) | the menu is open and focus is not on the brace; after Escape the menu is closed and focus is **on the brace**; `ArrowRight` moves the loop to 12.4 / 14.2, and `s1` stays at 4.3. **Old:** focus not restored, the clip moved to 4.4, the loop unchanged. **Why:** §1. The new row asserts the opposite outcome positively and removes no check without replacing it. |
| GM40 | focus `Volume — მუსიკა` (range); `rightPressThenBlur` on the music lane; assert BODY; `contextMenu`; Escape; then the same on sfx and click `0.5 s` | after each close, `document.activeElement` = the fader; `data-grid-seconds` `0.5` after the choice |
| GM41 | focus `arrangement-tempo-input`; the same press, then Escape | the menu opens with focus inside; after Escape the active element is the BPM field |
| GM42 | commit one marker `k1` at 20 s through `commitArrangement`; focus `arrangement-marker`; the same press, then Escape | the active element is the marker flag |
| GM43 | focus the fader; press-then-blur on the `m1` clip root; `contextMenu` on the clip root; Escape | the active element is the fader (the clip-body path) |

### 2.4 Doc 187 (grant 3)
- Path: `docs/implementation/2026/quarter-IV/187-c-r242-01-menu-edit-focus-return.md`.
- l.4 is exactly `**სტატუსი:** Completed (C round 243 PASS)` (L28).
- Its `## ` headings contain the seven TEMPLATE headings in order (L26): `## კონტექსტი` … `## TODO / შემდეგი ნაბიჯები`.
- **Content:**
  - the date and the changed project;
  - the context (C-R242-01, A-R242-REVIEW-M1);
  - the approach: the D-29z382 ruling, why the capture moved, and the rejected option;
  - a small Mermaid sequence: right `pointerdown` (scroller capture records, then releases) → `mousedown` → `contextmenu` → request → close → focus;
  - the changed files (2);
  - Problem → Solution (C-R242-01; FR3's old contract);
  - testing: GM40–GM43, FR3 and the 3 mutants, with the counts A actually ran;
  - TODO: B-R242-MARKER-EDITOR-MENU-FOCUS and the `useGridMenuFocusReturn` note.
- Cite only rows that exist (`grep -n "it('GM4[0-3]\|it('FR3"`). Georgian text, English technical terms.

## 3. Reference
This is a bug-fix round (focus management), so the reference-first rule does not apply to the behaviour. The focus return is the WAI-ARIA Authoring Practices menu pattern: on Escape or on activating an item, the menu closes and focus returns to the element that had it before the menu opened. Ableton has no DOM focus model to compare. The round-241 Ableton rows are unchanged and are not re-judged.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):** HEAD, empty status, `sha256sum -c` on the frozen 1,102 list and on the root list.
2. **Apply** `b-round-242/precheck-scratch.diff` (`git apply -p1`), then write grant 3.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–2 clean; `npm run lint` rc 0.
4. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-242/covering.txt)`. Expect 67 files, all green (1,153). Any test above 50 % of its timeout goes at the top of the report (L32).
5. **Mutants:** run MU-LANE-CAPTURE-ONLY, MU-NO-SCROLLER-CAPTURE and MU-PRESS-WINS on a scratch copy outside `store/`. Expect the red rows of §0.2. The repo `git status` must be identical before and after.
6. **code-reviewer:** run it. 3 files change; pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Copy `b-round-242/focus-probe-243.cjs`; do not edit it in place. Expect the "Scratch fix" column of §0.3.
8. **Report:** write `a-round-243.md` with the hunks, the tests run with counts, the mutants, the reviewer result, and any STOP at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-243 | HEAD, status, hashes | <ul><li>HEAD is `7e5b23c`. Status is exactly `M` on grants 1–2 and `??` on the doc 187 path, with nothing else.</li><li>`sha256sum -c` on `b-round-242-r243-tree-sha256.txt` (1,102) and on the root list gives rc 0. The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD` of grants 1–2 equals `b-round-242/precheck-scratch.diff` hunk for hunk: 2 code hunks, the FR3 replacement, and GM40–GM43 appended.</li><li>`origin` appears 0 times in the code hunks.</li></ul> |
| C-UNIT-243 | `b-round-242/covering.txt` (67 files) | All green, including GM36–GM43 and FR1–FR4. The full suite is a gate row. |
| C-MUT-243 | the 3 mutants of §0.2, once each, on a scratch copy outside the repo | Red rows as listed. The repo status is identical before and after. |
| C-FOCUS-ORIGINS-243 | C-R242-01: C's own round-242 `faderInfo` recipe, plus the BPM field, the loop brace and the marker flag (B's setup in §0.3, or C's own equivalent) | <ul><li>For every origin at both viewports, after Escape the menu is closed, `document.activeElement` is that origin (never BODY), `:focus-visible` matches, and a brass outline is painted (≥ 1 px).</li><li>Fader with `0.5 s`: focus is on the fader and the grid is `0.5`; `:focus-visible` is info.</li><li>Screenshots.</li></ul> |
| C-BRACE-KEYS-243 | D-29z382 in the browser | <ul><li>(a) After the brace returns from Escape, `ArrowRight` moves the loop start by one step, and no clip moves.</li><li>(b) D-29z22-F left press unchanged: with the brace focused, a **left** click on a clip header selects the clip, the brace loses focus, and `ArrowRight` nudges that clip while the loop is unchanged.</li><li>B did not run (a) or (b) in the browser. Its probe reads `document.activeElement` only, and (a)/(b) rest on jsdom FR3/FR1. A failure is a bug with evidence, not a task contradiction.</li></ul> |
| C-FOCUS-242-REG | Round-242 behaviour on the new capture site | <ul><li>C-FOCUS-242 (a)/(b)/(c) on the Snap toggle still returns focus to the toggle.</li><li>C-FOCUS-CLIP-242 with the **fader** as origin (a right-click inside a clip body, below its header, after the `demo-synth-mix` seed) returns focus to the fader.</li></ul> |
| C-MENU-REG-243 | Neighbours | <ul><li>**Reposition:** with the menu open, a second right-click elsewhere, then Escape, returns focus to the origin.</li><li>**Swallow:** with the menu open, the first Play click only closes the menu; the second plays.</li><li>**Choose while playing:** `0.25 s` keeps playback (playhead advances, master RMS > 0).</li><li>**Header:** a right-click on a track header opens no grid menu and is not prevented.</li><li>**Marquee:** a left-drag on an empty lane draws the marquee and selects clips.</li><li>**Info:** with the fader focused, a right-click on the track header (native menu): record `document.activeElement`. This path is unchanged (§1).</li></ul> |
| C-MARKER-EDITOR-INFO-243 | Marker editor origin (`M`, then right-click an empty lane, then Escape) | **Info only.** Record `document.activeElement` and the marker count before and after. B measured BODY and a committed marker at HEAD and on the fix. This is B-R242-MARKER-EDITOR-MENU-FOCUS, scheduled separately. Any other result is reported with evidence. |
| C-BUDGET-243 | L39 | The persistent text lines outside the timeline match round 242: empty 85/69 and demo 101/85 at 1440/1280. |
| AN-REVIEW-243 | Doc 187 | <ul><li>l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z382 and the moved capture are explained.</li><li>Every cited row exists (GM40–GM43, FR3, and any other cited).</li><li>The marker-editor follow-up is in TODO.</li></ul> |
| LAB-SMOKE-243 | `/studio-lab` | It loads. Space plays and pauses. The export WAV for the untouched demo has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94` (rounds 237–242). 0 page errors. |
| Auth | Standing check | In a fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required" with no workspace and no `audio[src]`. `/api/studio-token` with no header returns 401. |
| Purchased origin (browser) | The menu focus on the purchased copy | BLOCKED: backend unavailable in cloud. Grant 1 adds no origin branch. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Keyboard ownership after a left press** (D-29z22-F: FR1, FR2, FR4; C-BRACE-KEYS-243 (b)). The release condition is unchanged; only a statement is added before it.
- **The left-button lane press** (marquee, empty-lane click to clear, a time selection on an empty lane). Grant 1 removes the lane's right-button block, which ran before its early return. The left path is byte-identical.
- **A focused BPM field returning after Escape.** `handleTempoFocus` runs again. Check that the field shows the committed value and that no tempo change or status flash happens beyond what the blur already did. Record it in C-FOCUS-ORIGINS-243. B did not observe this in the browser; it rests on source only.
- **The marker flag returning.** Arrow keys then act on the marker, as before the menu.
- Any change to the stage-2a texts or statuses is a regression (frozen files).

## 7. Outcomes for B's next planning
- **PASS and gate published:**
  - C-R242-01 and A-R242-REVIEW-M1 close.
  - **Next:** if the next planning is on or after 2026-10-30, the **REGRESSION round** comes first (`regression-last.json` 2026-10-27). It carries every `scope_additions` entry of REGRESSION-ROUND-2026-10-30 (L6), including C-FOCUS-242 and this round's C-FOCUS-ORIGINS-243.
  - Then **B-R242-MARKER-EDITOR-MENU-FOCUS** (Medium; candidate focus target: the committed marker's flag, which needs `ArrangementMarkerRow` plumbing; B runs the L47 recipe at that planning).
  - Then **SABA-B-11b stage 2b**, with the facts in `tasks/round-241.md` §7.
  - If the next planning is still on 2026-10-29, the marker-editor fix comes next, and the regression round runs at the first planning on or after 2026-10-30.
- **FAIL:** a fix-up on the same grants.
- ARCH-CHECKPOINT-TEMPO-GRID is re-asked after stage 2b; addendum 8 records the reviewer's trigger.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.
