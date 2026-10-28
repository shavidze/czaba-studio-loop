# Round 227: CALM-1a gate fix-up (GATE226-B1) plus two shortcut-sheet copy Lows (C-R226-02, C-R226-03)

**Planned by:** B, at the round 226 → 227 planning, 2026-10-28. **Decisions:** D-29z272…D-29z277.
**Type:** bug fix-up of a C-PASS stage that the root gate blocked. The fix covers 3 tightly related items in the same feature (one test-assertion bug and two copy rows of the new sheet). There is no new feature.
**Read first:** `lessons.md` in full (B, A and C). These apply directly:
- L4: one element, one rule;
- L10: B ruled on every open C row (§1.2);
- L11: STOP;
- L12: no class selectors;
- L23: pre-check done (§0.2);
- L26: docs cite only existing tests;
- L28: doc status line;
- L32/L33: a failing covering test or a regression is a STOP;
- the new **L40**.

**Why this round:**
- C round 226 returned PASS: 16 rows passed, `browserVerified` and `realVerified` true, 4 Low findings, and C-BBOX was left for B's ruling.
- The root gate then **failed**. `gates/gate-round-226.json` has status `failed`, and `gates/round-226/verify.log` shows 1 failed test of 2972: `track-layout.test.tsx` l.859, "reserves the selected-clip row with an aria-hidden placeholder…".
- The `verify` steps are chained with `&&`. `npm run build` was therefore never reached for this code.
- CALM-1a is **not done**, and nothing is published. CALM-1b moves to round 228.
- REGRESSION is due on or after 2026-10-30 (`regression-last.json` = 2026-10-27), so it is not due today.

**Not this round:**
- CALM-1b (keys in titles and `aria-keyshortcuts`), CALM-2 and CALM-3.
- C-R226-04, the playhead-handle focus. B's ruling is in §1.2.
- Any app behaviour change beyond the two sheet rows.

## 0. Baseline and scope

**Baseline:** HEAD = `80fbb3b99d6fe991c4e150a9cc05b1b7332d068c`, the last published commit. Gate 226 failed, so it published nothing. On top of HEAD sits the **round-226 working tree, which must be preserved**: exactly 4 `M` and 5 `??` (`b-round-226/git-status-at-planning.txt`).
- **A must not revert, redo or reformat any round-226 work.**
- If HEAD differs, or `git status` shows any other path at the start: **STOP** (L11).
- The one exception is a root commit that touches only the 4 root files. In that case, re-hash them and continue.

**Frozen:** `b-round-226-r227-tree-sha256.txt` holds 1,072 tracked files: every tracked file except the grants, the 4 root files and the 3 carried `M` files. It gives rc 0 at planning; run it from `store/`. The frozen set includes:
- every protected auth and purchase file: `app/routes/studio.$productId.tsx`, `app/lib/auth.ts`, `AuthContext`, the `api.studio-token` route and `entry.server.tsx`;
- `ui/Modal.tsx`, `ArrangementRuler.tsx`, `ArrangementOverview.tsx` and every test not granted below.

**Carried round-226 files: must keep A's round-226 end hash.** These are listed in `b-round-226-r227-carried-r226-sha256.txt`, which gives rc 0 at planning:
- `StudioWorkspace.tsx`;
- `strings.ts`;
- `workspace-strings-ui.test.tsx`;
- `ArrangementShortcutSheet.tsx`;
- `shortcut-sheet-ui.test.tsx`.

**Root-owned, must equal HEAD:** `b-round-226-r227-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes: `b-round-226-r227-root-files-start-sha256.txt`.

### 0.1 Grants (`b-round-226-r227-grants.txt`; start sha in `b-round-226-r227-granted-start-sha256.txt`)
| # | Path | What may change |
|---|---|---|
| 1 | `app/lib/arrangement/__tests__/track-layout.test.tsx` | **Only** the case "reserves the selected-clip row with an aria-hidden placeholder and renders the real line as one truncated full-width row (C-R11-02, C-R15-02)" (l.849–880 at planning). Its title stays byte-identical. Imports may also change: adding `within` to the `@testing-library/react` import, and `studioShortcutSheetStrings` from `../strings`. See §2.1. |
| 2 | `app/lib/arrangement/shortcuts.ts` (round-226 new file) | Only the `keys` of rows `fit` and `waveform-zoom` (§2.2). All other rows, ids, actions and order stay byte-identical. |
| 3 | `app/lib/arrangement/__tests__/shortcuts.test.ts` (round-226 new file) | Add the case **SC4** (§2.3). SC1–SC3 stay unchanged. |
| 4 | `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` (round-226 `M`) | Only the UC12 `it(...)` title string (l.986): "UC12 the shortcut hint lists…" → `UC12 the shortcut sheet lists the group keys and track fold stays independent`. The body stays byte-identical. This is A's round-226 L7 note. |
| 5 | `docs/implementation/2026/quarter-IV/177-calm-1-shortcut-sheet.md` (round-226 new) | l.4 and two new entries (§2.4). |

Nothing else changes. No new file. In particular:
- `StudioWorkspace.tsx` is **not** granted. The footer DOM stays as A built it in round 226 (D1); the fix is in the test, not the app.
- `ArrangementShortcutSheet.tsx` and `shortcut-sheet-ui.test.tsx` stay at their round-226 end hash.

### 0.2 B's collision pre-check (L23, done)
B made a scratch copy (`git ls-files -co`) of the current tree into `/tmp/b227` and applied there exactly:
- the two className assertions removed from the track-layout case;
- the two `keys` edits from §2.2.

B then ran `npx vitest run` on 6 files: track-layout, shortcuts, shortcut-sheet-ui, lane-strings-ui, workspace-strings-ui and track-group-collapse-ui. Result: **6 files, 89 tests, all green**.

`grep -rn "1× button\|Double-click the ruler\|Fit the whole project"` over `app/` finds the strings only in `shortcuts.ts`. No test pins them, and SC1 pins keys only for `split` and `shortcuts`.

The gate's full run (`gates/round-226/verify.log`) shows that track-layout is the **only** red file of 205. Its l.867–869 `arrayContaining(['basis-full', …])` on the selected line would also fail once reached, because D1 moved `basis-full` to the row wrapper. Both assertions are in the grant.

## 1. Why (evidence)

### 1.1 GATE226-B1: why it happened, and why we missed it
- **The fact.** Round 226 deviation D1 (A) moved `basis-full` from each footer slot `<p>` to a new row wrapper (`flex min-w-0 basis-full items-center gap-x-4`). It gave the slots `min-w-0 flex-1 truncate`.
  - `track-layout.test.tsx` (frozen in round 226, not in the covering set) pins the exact class list of `arrangement-selected-clip-reserve` (equality) and `arrangement-selected-clip` (`arrayContaining`, including `basis-full`).
  - The browser behaviour is correct. C-SLOT and C-GEOM measured one 16 px row, truncated, with no overflow at both viewports. The test pinned **styling classes, not behaviour**: this is an L8/L12 time bomb.
- **Why we missed it:**
  - **B:** the L23 pre-check ran on B's own skeleton (line removed, button added). It did not cover A's later structural deviation D1, so the pre-check is necessary but not sufficient once A restructures.
  - **A:** L12 already says "before removing a class token, grep `app/**/__tests__`". A removed `basis-full` from two `data-testid` elements without grepping. The covering set was B's static list, and `track-layout.test.tsx` was not in it.
  - **C:** not at fault. Full-suite rows are gate rows.
  - **Gate:** caught it, as designed.
- **The rule that would have caught it: L40** (added this planning; C checks it, row C-LESSON-227): "Any change to an element that carries a `data-testid` (classes, wrapper, structure) → A greps that testid in `app/**/__tests__` and adds every hit file to the covering set. A hit that pins classes in a frozen file is a STOP with the hit list."
- **Fix direction (D-29z273).** Do **not** re-pin the new class list; CALM-2 and CALM-3 will touch the footer again (L8). Replace the class pins with behaviour and structure assertions (§2.1).

### 1.2 B's rulings on the open round-226 rows (L10)
- **C-R226-01 (C-BBOX, Low, spec gap): accepted, closed by ruling D-29z274.**
  - At 1280×720 the lane-fit cascade is a deterministic consequence of the 20 px taller scroller (`panels.ts` `fitLaneHeights`, cause proved by C, `c-round-226/bbox-diff.txt`). The criterion is amended with exception **(d)**: at 1280×720 only, the lane rows may change as follows:
    - video header h +0…+4;
    - audio headers h +0…+1;
    - lane controls y +0…+7;
    - playhead h +0…+7;
    - nothing else.
  - 1440×900 keeps exceptions (a)–(c) only.
  - C re-runs C-BBOX in this round with the amended criterion (row C-BBOX-227).
- **A D2 (sheet group headings `text-xs`, 12 px, instead of `text-label`, 11 px): accepted (D-29z274).** The C-A11Y "all text ≥ 12 px" row wins (L4). C measured it in round 226.
- **C-R226-02 and C-R226-03 (Low, copy): fixed in this round** (§2.2). The round owns `shortcuts.ts`, and the fix costs two literals.
- **C-R226-04 (Low, pre-existing, frozen files): not this round (D-29z275).**
  - **The issue:** after a ruler click or double-click, focus stays on the playhead handle (`role=slider`), so ←/→ and +/− act on the playhead. It is a behaviour change in frozen `ArrangementRuler.tsx` and in `releaseEditFocusOnTimelinePointerDown` (SW).
  - **Why it is not simply buried:** the new sheet advertises those keys.
  - **Ruling:**
    - It goes to `deferred_low_polish`, with `candidate_round: CALM-1b`. If the round-228 planning grants `StudioWorkspace.tsx` anyway and a reference check (Live 12: keyboard focus after a ruler click) supports it, CALM-1b adds the playhead handle to the release clause: one clause plus one test. Otherwise it is fixed in the polish pass.
    - B re-decides at the round-228 planning and writes the result there.
- **Doc 177 l.4:** per L28 (N = this round), A writes `**სტატუსი:** In Progress (stage 1 of 2; C round 227 PASS)`.

## 2. Changes

### 2.1 `track-layout.test.tsx`: the one granted case
- **Remove** the placeholder class equality (l.859–861 at planning) and the selected line `arrayContaining([... 'basis-full' ...])` (l.867–869).
- **Keep** every other existing assertion byte-identical:
  - testid present or absent;
  - `aria-hidden="true"`;
  - `textContent` = NBSP;
  - the exact text;
  - `title` = text;
  - the selected line has no `aria-hidden`;
  - the placeholder returns after deselection.
- **Add** structure assertions with no class tokens (L12):
  1. Before selection, capture `const row = placeholder?.parentElement`. Assert that `row` is non-null and contains the footer button: `within(row).getByRole('button', { name: studioShortcutSheetStrings.footerButtonLabel })`. The label is `'Keyboard shortcuts (?)'` (`strings.ts` l.816).
  2. After `selectClip('music-1')`: `selected?.parentElement` is **the same node** as `row` (`toBe(row)`).
  3. After `selectClip(null)`: `reserve()?.parentElement` is again `toBe(row)`.
- Write it without `any`, `@ts-ignore` or type assertions (`as`). `expect(...).not.toBeNull()` does not narrow the type, so the accepted guard is `if (!row) throw new Error('footer row missing');` before `within(row)`, and the same for `placeholder`.
- Geometry ("one truncated full-width row") stays a browser row (C-SLOT-227). jsdom does not lay out, so the case does not assert it.

### 2.2 `shortcuts.ts`: the two rows (D-29z276)
| id | action (unchanged) | keys before | keys after |
|---|---|---|---|
| `fit` | `Fit the whole project` | `['Double-click the ruler or the overview']` | `['Double-click the overview', 'Double-click the ruler (no selection)']` |
| `waveform-zoom` | `Waveform zoom (view only, the sound does not change)` | `['1× button']` | `['Waveform Zoom menu']` |

**Why these words (the smallest honest behaviour):**
- `fit`:
  - The overview double-click always fits (round-226 C-ROWS: overview double-click → Fit, with and without a selection; overview 9 px/s).
  - The ruler double-click fits only when there is no time selection; with one, it zooms to it (`StudioWorkspace.tsx` `handleRulerDoubleClick` l.1269–1275).
  - Zoom to the selection already has its own row (`zoom-range`: Z), and the ruler title says "double-click = Fit / Zoom to selection".
  - Two chips keep each one short at 1280 (the widest row in round 226 was this one, at 276 px).
- `waveform-zoom`: the control is a `<select>` whose accessible name starts "Waveform Zoom" (`strings.ts` l.373; `data-testid="arrangement-waveform-zoom"`). "menu" names its kind, and the shown value changes (½×…8×), so it is not quoted.

### 2.3 `shortcuts.test.ts`: new case SC4
**SC4:** `findStudioShortcut('fit')?.keys` equals the two strings above in that order, and `findStudioShortcut('waveform-zoom')?.keys` equals `['Waveform Zoom menu']`. It also checks that no row's keys contain the word `button` (case-insensitive; this catches the C-R226-02 class of error). B checked that no other row's keys contain "button" today.

### 2.4 Doc 177
- l.4: exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 227 PASS)` (L28).
- Under „პრობლემები და გადაწყვეტები“, two entries in Problem → Solution form, in Georgian:
  1. GATE226-B1: class pins in track-layout → structure assertions.
  2. C-R226-02/03 → the new keys.
- Cite only test ids that exist (L26): the track-layout case title, SC4.

## 3. A: checks to run (speed rule: no full suite, no `verify`)
1. **Start:**
   - HEAD `80fbb3b`;
   - `git status` = the 9 round-226 paths;
   - `sha256sum -c` rc 0 for the tree, carried, granted-start and root-files lists.
2. `npm run typecheck` rc 0; `npm run lint` rc 0 (0 new warnings in the granted files); `npx biome check` on the 4 granted code/test paths is clean.
3. **Covering set (L40 applied by B; A extends it with its own testid grep):**

   `npx vitest run` on:
   - track-layout;
   - shortcuts;
   - shortcut-sheet-ui;
   - lane-strings-ui;
   - workspace-strings-ui;
   - track-group-collapse-ui;
   - waveform-zoom;
   - navigation-strings-ui;
   - every other file that A's `grep -rln "arrangement-selected-clip\|arrangement-lane-move-hint\|arrangement-shortcut" app --include=*.test.*` returns.

   All must be green. Report the times: any test above 50 % of its timeout goes at the top of the report (L32).
4. **Mutants** (restore each and verify the sha):
   - **MU-1:** a temporary edit of `StudioWorkspace.tsx`, reverted after: render the selected-clip `<p>` as a sibling of the row wrapper instead of inside it. The track-layout case must go red. Restore and verify that `StudioWorkspace.tsx` equals its carried hash.
   - **MU-2:** revert the `fit` keys. SC4 must go red.
   - **MU-3:** set the `waveform-zoom` keys to `['1× button']`. SC4 must go red.
5. **`npm run build` rc 0, run once** (insurance: gate 226 never reached build for the round-226 code). This is not the full suite. Put the log in `a-round-227/build.log`.
6. The browser self-check is optional and short: open the sheet at 1280×720 and confirm that the `fit` row has 2 chips, each on one line, with no horizontal overflow.
7. **code-reviewer:** run it. The round changes 5 files (the 3+ file rule). Forward its Architecture notes to B.
8. **End:**
   - `git status` = the same 9 paths plus `track-layout.test.tsx` `M` (10 paths);
   - the carried, frozen and root lists give rc 0;
   - write `a-round-227/changed-end-sha256.txt` covering all 10 paths.

## 4. C: acceptance (real Chromium on `/studio-lab`, 1440×900 and 1280×720; S0 = a fresh anonymous empty demo, S1 = one clip added and selected)
| Row | What | Pass |
|---|---|---|
| C-SCOPE-227 | HEAD, `git status`, all four hash lists, and the granted hunks | HEAD `80fbb3b`. Exactly 10 paths (§3.8). Frozen, carried and root lists rc 0. The granted files' end hashes equal A's `changed-end-sha256.txt`. The protected files are clean against HEAD. **Hunk scope:** for each grant, `diff -u b-round-226/granted-start/<path> store/<path>` shows only the hunks §0.1 permits. These are start copies made by B at planning; their sha equals `b-round-226-r227-granted-start-sha256.txt`. Three grants are untracked and one already carries round-226 changes, so `git diff HEAD` cannot show the round-227 scope. |
| C-UNIT-227 | `npx vitest run` on track-layout, shortcuts and track-group-collapse-ui (changed-code tests, not the full suite) | Green. The track-layout case contains no class-token assertion: grep for `className` in that case gives 0. SC4 exists. The UC12 title is renamed and its body is unchanged: `diff -u b-round-226/granted-start/app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx` against the store file shows only the title line. |
| C-ROWS-227 | The sheet DOM against the task table, programmatically | The table = `tasks/round-226.md` §3.1 with exactly the two §2.2 rows changed: 43/43 rows, 0 mismatches, 0 extra, at both viewports. |
| C-FIT-227 | Real behaviour of the `fit` row | (a) With no selection, a ruler double-click fits the whole project. (b) An overview double-click fits. (c) With a time selection, a ruler double-click zooms to the selection, which matches "(no selection)". Measure px/s for each. |
| C-WZ-227 | The `waveform-zoom` row names the real control | The control with the accessible name starting "Waveform Zoom" is a `<select>` (combobox), and changing it to 2× gives the "view only" status. |
| C-SEARCH-227 | Search | `ruler` → `fit`. `menu` → `waveform-zoom`. `split`, `cut`, `zzzz` and `ctrl+e` give the round-226 results. |
| C-WIDE-227 | The widest row at 1280×720 (L3) | In the `fit` row, each chip is one line (h ≤ 18) and `scrollWidth` = `clientWidth`. The sheet has no horizontal overflow. Screenshot of the row at both viewports. |
| C-BBOX-227 | `c-round-226/bbox-after.mjs` against `b-round-225/bbox-before.json` | Only exceptions (a)–(c) from the round-226 task, plus (d) from §1.2 at 1280 only. The result equals C's round-226 `bbox-after.json` within ±1 px: the footer is unchanged this round. |
| C-SLOT-227 | The footer row in the browser, S0, S1 and during a lane-move drag | The reserve, the selected line and the lane-move hint each render as one 16 px line in the same row as the "Shortcuts ?" button. Footer 49 px. No overflow. Matches round 226. |
| C-OPEN-227 | Short neighbour check | `?` on body opens the sheet, and Esc closes it with focus back on the opener. A footer click opens it. |
| C-LESSON-227 | `lessons.md` | L40 is present. §1.1 of this task has "Why we missed it". |
| G227-3 | Auth guard | `/studio/middle-east` → "Sign in required", 0 `audio`. `/api/studio-token` with no header → 401. A fresh `/studio-lab` → demo badge, and `auth_user` is null. |
| LAB-SMOKE-227 | Add a clip, then Export WAV | 1 clip. The WAV is 24-bit, 48 kHz, stereo. The RMS segments are identical to round 226. 0 page errors. |
| AN-REVIEW-227 | Doc 177 | l.4 is byte-exact, as in §2.4. The two new entries exist. Every cited test id exists. |
| gate | full suite, build, lint, `verify`, e2e smoke | Not claimed by C. |

**Reference (Live 12) for this round:** no behaviour changes. The round-226 reference rows R1–R5 and their deviations stand (`tasks/round-226.md` §2). The `fit` wording now matches CZABA's real behaviour. There is no Live claim about the ruler double-click; none is made.
**Screen budget (L39):** nothing permanently visible is added. The footer text line count stays at 2. C-SLOT-227 covers it.

## 5. Neighbouring behaviour that could break (C probes these first)
- The footer row with a lane-move refusal at 1280: one line, no truncation of the refusal prefix (round-226 C-SLOT).
- Sheet search over the new chip text: the chips are searchable through `keys`, as in round 226.
- The UC12 title rename: the id `UC12` must stay greppable.

## 6. Outcomes for B's next planning
- **C PASS + gate PASS:** CALM-1a → done, and D-29z274's C-R226-01 stays closed. Round 228 = CALM-1b, unless REGRESSION is due (on or after 2026-10-30). Then REGRESSION goes first, and CALM-1b follows it.
- **C FAIL:** a fix-up on the same grants.
- **Gate fail on another test:** B re-runs L23 against the actual tree, and the fix-up is granted precisely.
