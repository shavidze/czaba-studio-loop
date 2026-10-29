# Round 244: EDITOR-MENU-FOCUS-FIX — after the grid menu closes, focus goes where Enter would have put it, for the editors a right press commits and unmounts

**Planned by:** B, at the round 243 → 244 planning, 2026-10-29. **Decisions:** D-29z389…D-29z398.

**Type:** bug-fix round. Round size (≤ 3 tightly related bugs): two Medium findings with one mechanism (an inline editor commits on its own blur and unmounts), plus one source Low in the same hunk (A-R243-REVIEW-L1, with GATE243-S3 merged). The other three ids (A-R243-REVIEW-L2, A-R243-REVIEW-L3, GATE243-S2) are test-only rows in the owned test file (D-29z393).
- Round 243 passed C (`c-round-243.json`: taskStatus PASS, `browserVerified: true`, `realVerified: true`).
- Gate 243 published round 243 as **`149faab`** on both remotes. That commit is this round's baseline.
- C-R242-01 and A-R242-REVIEW-M1 are closed (D-29z389).

| Id | Severity | Origin | One line |
|---|---|---|---|
| **B-R242-MARKER-EDITOR-MENU-FOCUS** | Medium (pre-existing) | B round-243 planning probe; **re-measured at HEAD `149faab`** (§0.3) | Open the marker **add** editor (`M`) or the **rename** editor (`F2` on a flag). Then right-click an empty lane and press Escape. The marker is committed on the editor's blur, the input unmounts, and focus ends on BODY. |
| **B-R243-GROUP-EDITOR-MENU-FOCUS** | Medium (pre-existing, new id, D-29z391) | B round-244 planning probe (L47 origin classes), HEAD `149faab`, both viewports | The group name editor (`F2` on a group name) behaves the same way: the rename is committed, the input unmounts, and focus ends on BODY. |
| A-R243-REVIEW-L1 (= GATE243-S3) | Low | A round-243 reviewer, gate-243 reviewer | `gridMenuPressFocusRef` is written on right presses only, so a later left press leaves a stale value. Fix: write it on every press (null unless the press is a right press). |
| A-R243-REVIEW-L2 + L3, GATE243-S2 | Low (tests only) | A round-243 reviewer, gate-243 reviewer | <ul><li>L2: no row pins the no-menu header path.</li><li>L3: GM40–GM43 blur by hand, so their BODY setup check cannot fail.</li><li>S2: no row covers the BPM field after a mouse choice.</li></ul> |

**Regression and RETRO:**
- The regression round is **not due**. `regression-last.json` = 2026-10-27, so it is due on or after 2026-10-30, and today is 2026-10-29. It runs first at the first planning on or after 2026-10-30 (D-29z396).
- RETRO is not due. The next is RETRO 245.

**Read first:** `lessons.md` in full. Directly relevant:
- L47, amended at this planning (D-29z395): an editor that commits and unmounts on blur names its successor;
- L4: one element, one rule (§1);
- L11, L32 and L33: STOP;
- L23: B's pre-check (§0.2);
- L26 and L28: the new doc;
- L29: the recipes B ran (§0.3);
- L31: timeouts;
- L40: `data-testid` elements touched.

**Not this round:**
- The `useGridMenuFocusReturn` extraction.
  - This is the third focus change on this code (rounds 242, 243, 244), which meets the gate-243 reviewer's own trigger.
  - It is recorded as **addendum 9** to ARCH-CHECKPOINT-TEMPO-GRID. The re-ask moves to "after round 244" and stays non-blocking (D-29z394).
  - It is not done inside a behaviour round.
- ROOT-RECON-MARKER-ENTER (Enter during an active pointer gesture). It is a different path; `settleEditor` keeps its Enter guard byte-identical.
- **B-R243-UNDO-MARKER-FOCUS** (Medium, pre-existing, found by B's Undo probe at this planning, D-29z397). With the new flag focused, `Ctrl+Z` removes the marker and focus falls to BODY at both viewports (`shots/undo-head.json`). It is a different path (Undo unmounts the focused element) and is scheduled after the regression round, before SABA-B-11b stage 2b. C records it as info only.
- SABA-B-11b stage 2b, SABA-B-10a/10b/9/11c, SABA-B-7 (`awaiting_user`), and the protected purchased route (SRW-21 `deferred_user`).

## 0. Baseline and scope

**Start state:**
- HEAD = `149faab85978dff06c7450526e5cefb12013bb91` (gate 243 `published`; `b-round-243/head-at-planning.txt`).
- `git status --short --untracked-files=all` is **empty** (`b-round-243/git-status-at-planning.txt`, 0 bytes).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files. Then re-hash those files and continue.

**Frozen:** `b-round-243-r244-tree-sha256.txt`, **1,101** files. That is every tracked file (1,109) except the 4 tracked grants and the 4 root files.
- At planning, `sha256sum -c --quiet` gives rc 0.
- Each of the 7 protected auth and purchase files appears exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen, each listed once:
  - `ArrangementGroupHeader.tsx` (the group fix lives in `StudioWorkspace.tsx`);
  - `ArrangementLane.tsx`, `ArrangementContext.tsx`, `ArrangementGridMenu.tsx`, `ArrangementTempoRow.tsx`, `ArrangementLoopBrace.tsx`;
  - doc 187 and every other test file;
  - `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-243-r244-root-files.txt` lists `package.json`, `package-lock.json`, `vite.config.ts` and `vitest.config.ts`. Start hashes are in `b-round-243-r244-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-243-r244-grants.txt`; start hashes of the 4 tracked ones in `b-round-243-r244-grants-start-sha256.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/ArrangementMarkerRow.tsx` | Exactly the hunks of `b-round-243/precheck-scratch.diff` for this file: <ul><li>The handle gains `focusEditorSuccessor: (element: HTMLElement) => boolean`.</li><li>A `blurSuccessorRef` (`{ input, markerId } \| null`), cleared in `openEditor`.</li><li>In `settleEditor`, after the existing blur-during-gesture return, a local `noteBlurSuccessor(markerId)` records `{ input: inputRef.current, markerId }` **only when `reason === 'blur'`**. It is called on three paths: add-existing (`result.existing.id`), add-commit (`result.marker.id`), and rename once the marker is found (`editor.id`, before the escape, empty-draft and unchanged returns).</li><li>`focusEditorSuccessor` reads the ref and **clears it on every call** (D-29z398), then returns false unless the recorded input **is** the given element. On a match it calls `focusMarkerTarget(markerId)`. A successor recorded by a left-press blur is therefore dropped at the next menu close or the next `openEditor`, whichever comes first.</li></ul> Nothing else changes. `moveFocus`, the Enter gesture guard, the Escape restore, the status texts and every commit stay byte-identical. |
| 2 | `app/components/arrangement/StudioWorkspace.tsx` | Exactly the hunks of the same diff for this file: <ul><li>A module function `groupNameEditorRowId(element)`. It returns the `data-group-id` of the closest group row when the element is `[data-testid="arrangement-group-name-input"]`, and null otherwise.</li><li>Two refs, `gridMenuPressGroupIdRef` and `gridMenuReturnGroupIdRef`.</li><li>**L1:** the first statements after `const focused` in `releaseEditFocusOnTimelinePointerDown` become `const pressFocus = event.button === 2 && focused instanceof HTMLElement ? focused : null;`, then `gridMenuPressFocusRef.current = pressFocus;` and `gridMenuPressGroupIdRef.current = groupNameEditorRowId(pressFocus);`. This stays the single writer and still runs before the release condition.</li><li>`handleGridMenuRequest` reads and clears both press refs first. It stores the group id as the return group only when `focused === pressFocus`.</li><li>`closeGridMenu` reads and clears both return refs. A null or BODY target returns. A connected target is focused, as before. For a **disconnected** target it first calls `markerRowRef.current?.focusEditorSuccessor(returnFocus)`. If that returns false and a return group id exists, it calls `trackRowNameButton(scrollerRef.current, id)?.focus({ preventScroll: true })`.</li></ul> The release condition, the menu callbacks, the lane and clip handlers and the marquee do not change. |
| 3 | `app/lib/arrangement/__tests__/grid-snap-menu.test.tsx` | Exactly the test part of the same diff: <ul><li>import `groupSelectedRows` from `../groups`;</li><li>a helper `rightPress(target, clientX = 300, clientY = 200)` (a right `pointerDown` only, pointerId 44);</li><li>**L3:** GM40–GM43 call `rightPress` instead of `rightPressThenBlur`, so the real release does the blur and their BODY setup assertion can fail. Their other lines are unchanged;</li><li>**GM44–GM49 are appended** after GM43, at the end of the `SRW-14 stage 4b-1 lane grid menu` describe (§2.3).</li></ul> GM1–GM39, FR1–FR4, `rightPressThenBlur` (still used by GM36–GM39) and every other line stay byte-identical. |
| 4 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | **One new line** after l.265 (the line that ends `GM39 (clip-ის სხეული).`), before the blank l.266. The exact text is the single line of `b-round-243/doc186-line.txt` (byte for byte; it names `releaseEditFocusOnTimelinePointerDown`, doc 187 and doc 188). Nothing else in doc 186 changes. (The gate-243 reviewer noted that l.259–260 describe the old write site.) |
| 5 | `docs/implementation/2026/quarter-IV/188-marker-group-editor-menu-focus.md` | **New** implementation doc (§2.4). 188 is the next free number: 187 is the last. |

- **The applied diff:** grants 1–3 are exactly `b-round-243/precheck-scratch.diff` (378 lines, 20 hunks, made against HEAD `149faab`). `git apply --check -p1` on the clean store tree gives rc 0. **A may apply it as is**, then write grants 4–5.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (Studio files; no audio change);
  - `AGENT_DISCOVERABLE_CODE.md`: one new handle method `focusEditorSuccessor` and one module function `groupNameEditorRowId`. The names follow the existing `focusMarkerTarget` and `trackRowNameButton`;
  - `FORWARDREF_COMPONENT.md` (the marker row's imperative handle);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`;
  - `.claude/prompts/studio-feature.md`.

### 0.2 B's pre-check (L23, done)
B extracted HEAD to `/tmp/b244-scratch` with `git archive` (outside the repo; `node_modules` symlinked) and applied the change there.
- **Static checks:** `npx tsc --noEmit` rc 0. `npx biome check --write` on the 3 files: "No fixes applied".
- **Covering set** (`b-round-243/covering.txt`, **67 files**): **67 files, 1,159/1,159 green** in 96 s (`b-round-243/covering.log`). It is the union of:
  - round 243's 67 files (`b-round-243/covering-base.txt`);
  - the `grep -rlE "arrangement-marker-name-input|arrangement-group-name-input|nameInputLabel|nameFieldLabel|arrangement-marker-add|arrangement-group-name'|settleEditor|key: 'F2'"` hits in `app/**` tests (`b-round-243/covering-grep.txt`, 11 files). All 11 were already in the base set.

  No row was red, so no frozen test needs a grant. The 1,159 = 1,153 + the 6 new rows.
- **Red proofs** (on the final scratch copy, after the D-29z398 clear-on-call change; `grid-snap-menu.test.tsx`, 53 tests, unless noted; logs in `b-round-243/mutants/`; the covering run above was also repeated on the final copy):

| Run | Change | Red rows |
|---|---|---|
| FIX-CONTROL | none | none (53/53) |
| MU-HEAD | HEAD's `StudioWorkspace.tsx` and `ArrangementMarkerRow.tsx` with the new tests | **GM44, GM45, GM46, GM47, GM49** |
| MU-NO-MARKER-FALLBACK | drop the `focusEditorSuccessor` call in `closeGridMenu` | **GM44, GM45** |
| MU-NO-GROUP-FALLBACK | drop the `trackRowNameButton(…)?.focus` line | **GM46, GM49** |
| MU-L1-REVERT | write `gridMenuPressFocusRef` only when `pressFocus !== null` | **GM47** |
| MU-RELEASE-LEFT-ONLY | add `event.button !== 2 &&` to the release condition | **GM40, GM41, GM42, GM43, GM44, GM45, GM46, GM47, GM48, GM49** (proves L3: the setup BODY checks now depend on the real release) |
| MU-SUCCESSOR-NO-IDENTITY | `focusEditorSuccessor` drops the `successor.input !== element` check | **GM49** |
| MU-ALWAYS-SUCCESSOR | `const moveFocus = true` in `settleEditor` (focus the flag on every blur); run on `covering-grep.txt` + `grid-snap-menu.test.tsx` (270 tests) | **GM44, GM45, MU14** (MU14 in `markers-ui.test.tsx` already guards the left-press blur neighbour) |

- **Timeouts (L31):**
  - `grid-snap-menu.test.tsx` has 15 s per test (describe option).
  - In B's loaded covering run, the whole file (53 tests) took 11.2 s. In gate 243's `verify.log` it was 47 tests in 9.1 s.
  - The slowest test printed is GM1, at about 0.4–0.6 s. No test is near 50 %.

### 0.3 Recipes and signals (L29, L47)
B's script is `b-round-243/editor-probe-244.cjs`, a copy of `b-round-242/focus-probe-243.cjs` with editor origins.
- Each case uses a fresh context at 1440×900 and 1280×720, and waits for `Demo collection ready`.
- It sets up one origin, right-clicks an empty lane point (hit-test on `[data-track-id] [data-grid-lines]`), then presses Escape.

| Origin and how it is reached | HEAD `149faab` (`:5173`, `shots/editor-head.json`, `editor-head-group.json`) | Scratch fix (`:5174`, `shots/editor-scratch.json`, `editor-scratch-markerAdd.json`) |
|---|---|---|
| Marker add editor: focus BODY, press `M` (focus in `arrangement-marker-name-input`) | BODY; markers 0 → 1; status `Marker “Marker 1” added at 00:00.000.` | **the new `arrangement-marker` flag**, `:focus-visible` true, brass `solid 1px` at 0.8; markers 0 → 1, same status |
| Marker rename editor: `M`, `Enter` (flag), `F2`, type `Hit` | BODY; name `Hit`; status `Marker name: “Hit”.` | **the renamed flag**, `:focus-visible` true, brass 1px; same name and status |
| Group name editor: <ol><li>click the name button of track 2 (`[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]`, index 1);</li><li>Ctrl+click index 2;</li><li>`Control+g`;</li><li>focus `arrangement-group-name`;</li><li>`F2`, type `X`.</li></ol> | BODY; group name `X`; status `Group name: “X”.` | **`arrangement-group-name`** of that group, `:focus-visible` true, brass 1px; same name and status |
| Control: track Volume fader (first header range input), right-click, Escape | the fader | the fader (unchanged) |

- **Neighbour probe** `b-round-243/neighbour-probe-244.cjs` (`shots/neighbour-head.json`, `neighbour-scratch.json`), both viewports:
  - **Left click** on an empty lane while the marker add editor is open: the marker is committed and no menu opens. Focus is **BODY at HEAD and on the fix** (unchanged; D-29z22-F, the left press owns the focus).
  - **Mouse choice** `0.5 s` from the marker add editor: BODY at HEAD; the new flag on the fix.
  - **Detached `closest`:** a detached input returns `closest('[data-group-id]') === null`. That is why the group id is captured at the press, while the input is still attached.
- **Event order** on the fix (marker add): `pointerdown[b2] active=arrangement-marker-name-input` → `out:arrangement-marker-name-input` (the release) → `mousedown active=BODY` → `contextmenu active=BODY` → `in:BUTTON` → `out:BUTTON` → `in:arrangement-marker`.
- **Probe timing:** the scratch browser probe ran before the D-29z398 change (clear the successor ref on every `focusEditorSuccessor` call). That change only drops a non-matching value earlier; on the probed paths the successor matches. The jsdom rows, all 7 mutants and the covering set were re-run on the final copy. A's and C's browser runs are on the final code.
- **Invalid attempt:** the scratch `markerAdd@1440` row had one environment-invalid attempt, a 120 s wait on a cold Vite start (kept as `shots/editor-scratch-attempt1.json`). It was re-run (`editor-scratch-markerAdd.json`).
- There were 0 page errors. The scratch server on `:5174` is stopped, and `:5173` still answers 200.
- **Signals:**
  - the menu is `[data-testid="arrangement-grid-menu"]`, rendered only while it is open;
  - the marker editor input is `[data-testid="arrangement-marker-name-input"]`, rendered only while an editor session is open; the flag is `[data-testid="arrangement-marker"]`;
  - the group editor input is `[data-testid="arrangement-group-name-input"]`, rendered only while editing. Otherwise the name button `[data-testid="arrangement-group-name"]` is rendered, inside `[data-group-id]`.
- **No clip rename editor exists.** The doc-187 TODO hypothesis ("a clip rename field may behave like the marker editor") is falsified. The only inline name inputs in `app/components` are the marker and group ones (`grep -rn "name-input\|rename-input" app/components`). GATE243-S4 closes (D-29z393).

## 1. Ruling D-29z392: after the menu closes, focus goes where Enter would have put it

- **The conflict (L4).** Two clauses bind the editor input at a right press:
  - D-29z22-F and D-29z382: the release blurs the edit control at the press, so its edit commits;
  - L47: a dismissed menu returns focus to the element that had it, and BODY is never an expected value.

  The element that had focus no longer exists after the commit.
- **Ruling:**
  - The commit at the press stays. The editor's own blur commits it as today: the same history entry, the same status, the same name rules.
  - When the menu closes and its return target is disconnected, focus goes to that editor's **successor**: the element Enter would have focused. Per path:

    | Editor path | Successor |
    |---|---|
    | marker add, committed | the new marker's flag |
    | marker add at a time that already has a marker | the existing marker's flag |
    | marker rename: committed, empty draft (name kept) or unchanged | the flag of `editor.id` |
    | group rename | that group's name button (`trackRowNameButton`) |

  - The successor is recorded at the settle. It is not read from the selection, because the empty-draft rename path returns before `setSelectedMarkerId`.
  - It is used only when the menu's recorded return element **is** that editor's input (an identity check, GM49). A blur from a left press also records it, but nothing consumes it, so focus does not move (MU14, C-LEFT-NEIGHBOUR-244).
- **Rejected option:** skip the release on a right press so the editor stays alive. This cannot work. The menu itself takes focus (`in:BUTTON` in the event log), so that blur would commit and unmount the editor anyway. It would also change the no-menu paths.
- **What stays:**
  - a **left** press on the timeline (FR1, FR2, FR4, MU14). The press owns the focus, and a click on a non-focusable lane leaves BODY at HEAD and on the fix;
  - a right press anywhere that opens no grid menu (headers, ruler, loop strip: GM14, GM47);
  - Escape inside an editor (restore, unchanged);
  - Enter inside an editor (focus moves, unchanged, including the gesture guard).
- **Why we missed it.**
  - Round 243's L47 amendment listed origin classes by what a press handler *blurs*. It did not list what the blur *does*: two editors unmount on their own blur.
  - B's round-243 probe found the marker editor but filed it alone, and did not grep for other blur-unmount editors.
  - The rule (L47, amended, D-29z395): "an editor that commits and unmounts on blur names its successor (where Enter would land), and the recipe greps `settleEditor('blur')` for every such editor".

## 2. Changes

### 2.1 Source (grants 1–2)
These are exactly the diff. There is no new dependency and no new export besides the handle method. The new `closeGridMenu` keeps deps `[]`; it reads `markerRowRef` and `scrollerRef`, which are refs only.

### 2.2 Focus target and ring (L47, L4)
- **Focus target** after Escape, a division, a width or the Snap item: the successor of §1. It is never BODY when an editor was the origin.
- **The ring:**
  - After **Escape** (a key), the successor matches `:focus-visible` with a visible brass outline (SABA-B-4: 1px, brass at 0.8, as each element already draws it).
  - After a **mouse choice**, `:focus-visible` is info: SABA-B-4 mouse modality, as in rounds 242 and 243.

### 2.3 Rows (grant 3)
| Row | Case | Expected |
|---|---|---|
| GM40–GM43 (setup changed, L3) | as before, but with `rightPress` (the real release) | expectations unchanged; their `activeElement === body` setup check is now red under MU-RELEASE-LEFT-ONLY |
| GM44 | click `arrangement-marker-add`; `rightPress` the music lane; `contextMenu`; Escape | after the press: BODY, 1 marker, the editor input gone. After Escape: focus on the new `arrangement-marker`, still 1 marker |
| GM45 | commit `k1` at 20 s; focus the flag; `F2`; change the name to `Hit`; `rightPress` sfx; `contextMenu`; click `0.5 s` | after the press: BODY and name `Hit`. Then grid `0.5` and focus on the flag |
| GM46 | group music + sfx as `g1` through `groupSelectedRows` + `commitArrangement`; focus `arrangement-group-name`; `F2`; type `Drums`; `rightPress`; `contextMenu`; Escape | after the press: BODY and no input. After Escape: focus on `arrangement-group-name` inside `[data-group-id="g1"]`; the group name is `Drums` |
| GM47 (L1, L2) | fader focused; `rightPress` the music track header; `contextMenu` on the header; left press and release on the header; `contextMenu` on the music lane; Escape | the header `contextMenu` is not prevented and opens no grid menu; BODY after the header press; the menu opens from the lane; after Escape focus is **not** the fader (the left press cleared the stale value) |
| GM48 (GATE243-S2) | BPM field focused; `rightPress`; `contextMenu`; click `0.5 s` | BODY after the press; grid `0.5`; focus on the BPM field; its `value` attribute unchanged |
| GM49 (identity) | marker add editor blurred by hand (it commits and records a successor that nothing consumes); then group `g1`, `F2` on its name; `rightPress`; `contextMenu`; Escape | focus on `arrangement-group-name`, not on the marker flag |

### 2.4 Doc 188 (grant 5)
- Path: `docs/implementation/2026/quarter-IV/188-marker-group-editor-menu-focus.md`.
- l.4 is exactly `**სტატუსი:** Completed (C round 244 PASS)` (L28).
- Its `## ` headings contain the seven TEMPLATE headings in order (L26): `## კონტექსტი` … `## TODO / შემდეგი ნაბიჯები`.
- **Content:**
  - the date and the changed project;
  - the context: B-R242-MARKER-EDITOR-MENU-FOCUS, B-R243-GROUP-EDITOR-MENU-FOCUS, and the Lows of D-29z393;
  - the approach: the D-29z392 successor table, the identity check, the rejected option, and why the group id is captured at the press (a detached node has no `closest`);
  - a small Mermaid sequence: right `pointerdown` (the capture records the input and the group id, then releases) → the editor's blur commits and unmounts → `contextmenu` → request → close → successor focus;
  - the changed files (a list, no code);
  - Problem → Solution entries for the two Medium findings and the three Lows;
  - testing: GM40–GM49, FR1–FR4, MU14, the mutants and the browser probe. Cite only rows that exist (grep the row ids);
  - TODO: ARCH-CHECKPOINT-TEMPO-GRID addendum 9 (`useGridMenuFocusReturn`) and ROOT-RECON-MARKER-ENTER (separate). State that the clip rename hypothesis of doc 187 was checked and that no such editor exists.

## 3. Reference
This is a bug-fix round (focus management), so the reference-first rule does not apply to the behaviour.
- The focus return is the WAI-ARIA Authoring Practices menu pattern: on Escape or on activating an item, the menu closes and focus returns to the element that had it before the menu opened. When that element is gone, the successor rule of §1 applies.
- Ableton Live has no DOM focus model to compare. The Live rows of earlier rounds are unchanged and are not re-judged.
- Nothing new becomes permanently visible (see the L39 count row in §5).

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start state (§0):** HEAD, empty status, and `sha256sum -c` on the frozen 1,101 list, on the root list and on the grant start list.
2. **Apply** `b-round-243/precheck-scratch.diff` (`git apply -p1`), then write grants 4 and 5.
3. **Static checks:** `npm run typecheck` rc 0; `npx biome check` on grants 1–3 clean; `npm run lint` rc 0.
4. **Covering set:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-243/covering.txt)`. Expect 67 files, all green (1,159). Any test above 50 % of its timeout goes at the top of the report (L32).
5. **Mutants:** run the 7 mutants of §0.2 on a scratch copy outside `store/`. Expect exactly those red rows. The repo `git status` must be identical before and after.
6. **code-reviewer:** run it, since 5 files change. Pass its Architecture note to B.
7. **Playwright** against `:5173` at both viewports. Copy `b-round-243/editor-probe-244.cjs` and `neighbour-probe-244.cjs`; do not edit them in place. Expect the "Scratch fix" column of §0.3 and the neighbour results.
8. **Report:** write `a-round-244.md` with the hunks, the tests run with counts, the mutants, the reviewer result, and any STOP at the top.

## 5. C: acceptance
Use real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-244 | HEAD, status, hashes | <ul><li>HEAD is `149faab`. Status is exactly `M` on grants 1–4 and `??` on the doc 188 path, with nothing else.</li><li>`sha256sum -c` on `b-round-243-r244-tree-sha256.txt` (1,101) and on the root list gives rc 0. The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>`git diff HEAD` of grants 1–3 equals `b-round-243/precheck-scratch.diff` hunk for hunk.</li><li>Doc 186 has exactly one added line, at the place and with the text of grant 4.</li></ul> |
| C-UNIT-244 | `b-round-243/covering.txt` (67 files) | All green, including GM40–GM49, FR1–FR4 and MU14. The full suite is a gate row. |
| C-MUT-244 | the 7 mutants of §0.2, once each, on a scratch copy outside the repo | Red rows as listed. The repo status is identical before and after. |
| C-EDITOR-ORIGINS-244 | B-R242-MARKER-EDITOR-MENU-FOCUS and B-R243-GROUP-EDITOR-MENU-FOCUS: C's own recipe for the marker add editor, the marker rename editor and the group name editor (B's setup in §0.3, or C's own equivalent) | <ul><li>For every origin at both viewports, after Escape the menu is closed and `document.activeElement` is the successor of §1, never BODY. `:focus-visible` matches and a brass outline is painted (≥ 1 px).</li><li>Marker add with a mouse choice `0.5 s`: focus on the new flag and grid `0.5`; `:focus-visible` is info.</li><li>Screenshots.</li></ul> |
| C-EDITOR-COMMIT-244 | The commit is unchanged | <ul><li>Marker add: count 0 → 1 and status `Marker “Marker 1” added at 00:00.000.`</li><li>Rename: name `Hit` and status `Marker name: “Hit”.`</li><li>Group: name as typed and status `Group name: “…”.`</li><li>After Escape, one `Ctrl+Z` (focus on the successor) undoes exactly that commit: the marker is gone, or the old marker or group name returns.</li><li>B ran Undo with focus on the flag and on the group name button at HEAD (`b-round-243/undo-probe-244.cjs`, `shots/undo-head.json`, both viewports): marker 1 → 0; `Hit` → `Marker 1`; `X` → `Group 1`.</li><li>**Info, not a pass criterion:** record `document.activeElement` after the Undo. At HEAD, undoing a marker add while its flag is focused unmounts the flag and leaves BODY. That is the separate pre-existing **B-R243-UNDO-MARKER-FOCUS** (Medium, D-29z397), not this round's regression.</li></ul> |
| C-LEFT-NEIGHBOUR-244 | D-29z22-F left press | <ul><li>With the marker add editor open, a **left** click on an empty lane commits the marker, opens no menu, and does **not** move focus to the flag. B measured BODY at HEAD and on the fix; record the value.</li><li>The same for the group name editor: the group is renamed and focus is not on the group name button. B did not run the group case in the browser.</li></ul> |
| C-FOCUS-243-REG | Round-243 origins on the changed capture | <ul><li>The track Volume fader, the BPM field, the loop brace and the marker flag still get focus back after Escape (C-FOCUS-ORIGINS-243).</li><li>GATE243-S2: with the BPM field and `0.5 s`, focus is on the field and its value is unchanged. Record `selectionStart`/`selectionEnd` and whether text is selected (info).</li></ul> |
| C-STALE-244 | No-restore regression on the header path (the stale-value pin itself is GM47, jsdom only by construction: in Chromium the left click focuses a connected button, so the request never reads the press value) | Focus the fader, then: <ol><li>right-click a track header (native menu, not prevented);</li><li>press Escape;</li><li>left-click that header's name button;</li><li>right-click an empty lane;</li><li>press Escape.</li></ol> Focus is on the element the left click focused (or BODY if none), and **not** on the fader. |
| C-MENU-REG-244 | Neighbours | <ul><li>**Reposition:** with the menu open from the marker add editor, a second right-click elsewhere, then Escape, puts focus on the new flag. B did not run this in the browser; it rests on source (the outside-press close focuses the flag, which the next press then records).</li><li>**Swallow:** with the menu open, the first Play click only closes the menu; the second plays.</li><li>**Header:** a right-click on a track header opens no grid menu and is not prevented.</li><li>**Marquee:** a left-drag on an empty lane draws the marquee and selects clips.</li></ul> |
| C-BUDGET-244 | L39 | The persistent text lines outside the timeline match round 243: empty 85/69 and demo 101/85 at 1440/1280. |
| AN-REVIEW-244 | Doc 188 and the doc 186 line | <ul><li>Doc 188 l.4 is byte-exact.</li><li>The 7 headings are in order.</li><li>D-29z392, the successor table and the rejected option are explained.</li><li>Every cited row exists (GM40–GM49, FR1–FR4, MU14, and any other cited).</li><li>Addendum 9 is in TODO.</li><li>Doc 186 has the grant-4 line.</li></ul> |
| LAB-SMOKE-244 | `/studio-lab` | It loads. Space plays and pauses. The export WAV for the untouched demo has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94` (rounds 237–243). 0 page errors. |
| Auth | Standing check | In a fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required" with no workspace and no `audio[src]`. `/api/studio-token` with no header returns 401. |
| Purchased origin (browser) | The editors on the purchased copy | BLOCKED: backend unavailable in cloud. Grants 1–2 add no origin branch. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **Keyboard ownership after a left press** (D-29z22-F: FR1, FR2, FR4, MU14; C-LEFT-NEIGHBOUR-244). A successor is recorded on every blur settle, but only the menu close consumes it.
- **The marker editor's Escape and Enter.** `settleEditor`'s early returns and `moveFocus` are byte-identical:
  - Enter still moves focus to the flag;
  - Escape still restores the add origin;
  - Enter during an active pointer gesture is still refused (ROOT-RECON-MARKER-ENTER is not touched).
- **The marker context menu** (`closeMenu` → `focusMarkerTarget`). The new handle method reuses `focusMarkerTarget`, which defers through `pendingFocusRef` when the flag is not yet mounted.
- **Group rename with the same or an empty name.** The group header still calls `onRenameGroup` on blur; the group id and the name button survive the rename.
- **Round 243's capture.** The press capture still runs before the release condition; only its value on a non-right press changes (null).
- Any change to the stage-2a texts or statuses, or to the marker and group status texts, is a regression (frozen files).

## 7. Outcomes for B's next planning
- **PASS and gate published:**
  - B-R242-MARKER-EDITOR-MENU-FOCUS, B-R243-GROUP-EDITOR-MENU-FOCUS, A-R243-REVIEW-L1 (= GATE243-S3), A-R243-REVIEW-L2, A-R243-REVIEW-L3 and GATE243-S2 close.
  - **Next:** the **REGRESSION round**, at the first planning on or after 2026-10-30 (`regression-last.json` 2026-10-27). It carries every `scope_additions` entry of REGRESSION-ROUND-2026-10-30 (L6), including C-FOCUS-ORIGINS-243 and this round's C-EDITOR-ORIGINS-244. If the next planning is still on 2026-10-29, **B-R243-UNDO-MARKER-FOCUS** (Medium) comes first.
  - Then B-R243-UNDO-MARKER-FOCUS (if the regression round ran first), then **SABA-B-11b stage 2b**, with the facts in `tasks/round-241.md` §7. Ask root again about ARCH-CHECKPOINT-TEMPO-GRID (addendum 9) after round 244 and before SABA-B-10a.
- **FAIL:** a fix-up on the same grants.
- If Saba answers `AGREE-SABA-B-7.md`, SABA-B-7 is scheduled right after the running stage.
