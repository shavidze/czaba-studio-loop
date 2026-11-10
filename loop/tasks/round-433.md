# Round 433: SABA-B-12 stage 3 — the shortcut sheet search draws its own clear button, not the browser's

**Planned by:** B, at the round 432 → 433 planning, 2026-11-10 (`b-round-432.md`). The advisor was consulted after orientation. The round-432 task is archived as `tasks/round-432.md` [K12].
**Decisions:** D-29z1527 … D-29z1531 (`backlog.json` v415) [K14].

## Read first
- **Lessons that apply this round, one line each** (`lessons.md` is long; read these ids in full there if a line is unclear):
  - L11: report a STOP at the top of `a-round-433.md` and change nothing else.
  - L12: never select by styling class in tests.
  - L13: guards parse whole tags (SF1 proves the scanner on braces, quotes and arrows).
  - L14: unique accessible names in the dialog you touch (SC1).
  - L26: the doc cites only rows that exist.
  - L28: doc l.4 is final as written.
  - L38: never overlap vitest with a browser probe.
  - L47: an action that unmounts the focused element names its focus target. Here that target is the search input, always.
  - L57: write the harness fields in `c-round-433.json`.
  - L58: every asserted number is B's run on the final sketch.
  - L59: do not end C early.
  - L60: destructive commands stay inside your own round folder.
  - L61: native control chrome is a row.
- **Primitives, before you apply the sketch:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (component edit), `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`. `a-round-433.md` lists what you read, fully or partly.
- **Template round:** `tasks/round-432.md` with `c-round-432.md`. Where this task differs, this task wins.
- **Claims:** `bash b-round-432/claims-433.sh` (override `ROOT=`/`LOOP=` if needed). B's planning output on the real store is `b-round-432/claims-433-planning-output.txt`; its stderr, `claims-433-planning.err`, is empty. K13 passes when every id is located (backlog or archive) and none is `NOT-FOUND`.
- **Sketch review (L58):** `b-round-432/sketch-review.md` names the dispatched sha256 `82d7d76c346748cf…`. The tech-lead verdict is approve-with-lows (no Medium), and TL-R433-01…05 are applied in v2. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `1a417fb`, clean tree
- Gate 432 is `published` at `1a417fb…` on both remotes, so that commit is the baseline [K1].
- The gate's `head` field and `context/head-sha.txt` still say `1197dcb`; both are stale.
- `git status` is empty [K2].
- **Frozen files:** `b-round-432/r433-frozen-sha256.txt` has **1,337** entries: every tracked file except the 3 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected files:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `1a417fb` at A1 because root published in between, accept a root-only commit that leaves `git diff 1a417fb HEAD -- app` empty, and note it. STOP only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 432 passed** (D-29z1527): C PASS, 0 bugs, `browserVerified` true [K20].
  - B re-judged C's own probe JSON: ALL OK and NEIGHBOURS OK (`b-round-432/recompare/`). The mutant lines are identical, and the measured auth run passes.
  - Gate 432 published `1a417fb` with COMMIT OK. **Stage 2b is done.**
- Today is 2026-11-10, earlier than the 2026-11-13 regression date [K7]. STEM-LANES has no Saba answer [K21]. The STORE direction file exists (direction A, 2026-10-25) [K21], so STORE-2b…5 are not direction-gated; they wait only for the 2026-10-27 order (SYS-1…3 first, note_d29z1448). No Critical or High bug is open.
- So, per round 432's fixed outcome, this round is **stage 3**.
- **What Saba sees today** (B, real Chromium at HEAD, both viewports, `b-round-432/probe/head/`): type in the `?` sheet's search and **Chromium's blue ✕** appears at the field's right end, with 8 blue pixels in its right 42 px. That is a browser-drawn control inside an Obsidian & Brass dialog. Crops: `head/1440x900-typed.png`, `head/1280x720-typed.png`.

## 1. What the code does today (tagged)
- `ArrangementShortcutSheet.tsx` has **one** `type="search"`, with class `… bg-background px-3 py-2 text-sm …`, and no cancel rule [K8].
- `ArrangementLibrary.tsx`'s search already hides the native cancel and draws its own clear button [K8b]:
  - the input carries `[&::-webkit-search-cancel-button]:hidden`;
  - the button has `data-testid="arrangement-library-search-clear"` and the label "Clear search";
  - it refocuses the input only when the button had focus;
  - Esc clears the query there.
- These are the only two `type="search"` fields in `app/components/arrangement` [K8d].
- **Esc in the sheet:** the sheet's capture handler calls `preventDefault` on Escape, and `Modal.tsx`'s document handler closes the sheet [K8c]. So the browser's own "Esc clears the search" never runs.
- **Focus trap:** the trap's focusable selector includes every `button:not([disabled])`, and it is re-read on every Tab [K8c].
- **Strings:** `studioShortcutSheetStrings` has no `clearSearch` [K8e]. `strings.test.ts` pins the Library's `clearSearch` only, and nothing pins the sheet object's key count.
- **Out of scope here:** the sheet sits in `Modal.tsx`'s `styled-scrollbar`, which has a teal `scrollbar-color` [K8f]. That is stage 3b (SABA-B-12-DIALOG-SCROLLBAR, D-29z1529), the next UI round. Do not touch `Modal.tsx` or the CSS.

## 2. Rulings (B, D-29z1530; product-designer and tech-lead in `b-round-432/sketch-review.md`)
1. **Hide the native cancel, draw our own button.** Follow the Library pattern, one step up for a 38 px field:
   - input `pl-3 pr-9` + `[&::-webkit-search-cancel-button]:hidden`;
   - button `absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 rounded-sm text-muted hover:text-foreground`, lucide `X` `size-3.5`, `strokeWidth={2}`, with `aria-label` and `title` "Clear search" (new `studioShortcutSheetStrings.clearSearch`).
   - Rejected: only hiding the ✕, because that removes a function the user has today; `CircleX` (a new visual for the same idea); copying the Library's exact `h-6`/`size-3` (too small in this field).
2. **Visibility:** the button shows while `query !== ''`, spaces included, so spaces can be cleared too. It is not rendered when the field is empty, so there is no disabled state.
3. **Click, Enter or Space** clears the query and **always focuses the search input** (L47). The button unmounts, and a dialog must not drop focus to the body. This is a deliberate difference from the Library, which refocuses only when the button had focus. Held Enter acts once (`preventRepeatedEnterKeyDown`).
4. **Tab order:** Close → search → Clear → Close. The button is a normal tab stop (`tabIndex` 0), and the existing trap needs no change.
5. **Esc unchanged:** with a query typed, Esc in the search box or on Clear **closes the sheet**, and the next open starts empty. This keeps Saba's CALM-1 contract (SS2; the subline says "Esc closes."). It differs from Live (see Reference). This is the existing CALM-1 decision, not a new deviation.
6. **`?` on Clear** closes the sheet, the same as on Close (SS5's rule for buttons). `?` in the search box types text.
7. **Focus ring:** the existing global keyboard focus style (B measured a 1px brass outline at 80 %, offset 2px). No new ring, no new token.
8. **No shared search constant now** (TL-R433-06): only one token is shared with the Library. It goes to ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS.
   - **SF2's reach is ruled, not a finding:** it scans the top-level `.tsx` files of `app/components/arrangement` only, the same shape as PG2 (RV432-5, deferred). Today every Studio search field lives there [K8d]. `app/components/recordings/*` is under SABA-B-12-RECORDINGS-NUMBER.
9. **Doc l.4** is exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 433 PASS)`.

## Reference: how Ableton Live 12 does it
| Point | Live 12 source (fetched 2026-11-10; both quotes checked verbatim in the page HTML) | Live | CZABA | C checks |
|---|---|---|---|---|
| Clear button in the search field | [Manual 4.2 Search Bar](https://www.ableton.com/en/live-manual/12/working-with-the-browser/) | "You can click the x button in the search bar to clear any search terms." | Same: an X in the field clears the terms | Row 4 |
| What clearing restores | 4.2 | Clear removes the search terms (filters stay) | All rows come back (the sheet has no filters) | Row 4 (`afterClick` rows = full count) |
| Esc | 4.2, keyboard steps | "Esc to clear the search field and show all items" | Esc **closes** the sheet (Saba CALM-1); the X clears | Row 4 `esc-closes-with-query` |
| Visual of the X | no reference found (the manual text only) | — | Our muted X, foreground on hover; 7.07:1 against the field | Row 4 crops |

Live's search is the browser search, not a shortcut sheet; Live has no searchable shortcut sheet. Deviations: Esc (the CALM-1 decision above); English labels; the shared focus style.

## Why we missed it (SABA-B-12, already written at D-29z1514)
This has the same cause as stages 1–2: no row listed a field's browser-drawn parts. L61 lists the search cancel, so there is no new lesson this round. C row 6 checks that L61 still exists [K22].

## 3. What A changes (sketch `b-round-432/sketch-433.patch.txt`, sha256 `82d7d76c346748cf…` [K10])
1. **A1:** run the claims at the start.
2. **Apply the sketch.** From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-432/sketch-433.patch.txt`, then `git apply ../tmp/studio-real-loop/b-round-432/sketch-433.patch.txt`.
   - It touches 4 files: 3 modified and 1 new. **Do not edit those four files afterwards.**
   - If you or your reviewer find a Medium or worse in the sketch, STOP (L11).
3. **Docs:** create `docs/implementation/2026/quarter-IV/281-saba-b-12-search-clear.md` in Georgian, with English technical terms. It contains:
   - l.4 exactly as ruling 9, and TEMPLATE's 7 `## ` headings in order (L26);
   - rulings 1–8 and the §1 HEAD facts, including the blue ✕;
   - the browser table from `b-round-432/probe/compare.txt` and `compare-head.txt`, and the numbers from `probe/contrast.txt`;
   - a mutant block that copies the 9 lines of `b-round-432/mutants/summary.txt` byte for byte;
   - the stage list: 1 done, 2a done, 2b done, 3 this round, 3b dialog scrollbar next, 4 selects deferred;
   - the Reference table above;
   - a TODO with stage 3b, TLM-SABA-B-12-FIREFOX-SAFARI (Safari/Firefox search field) and the ARCH checkpoint (TL-R433-06).

   Cite only rows that exist: SC1–SC6, SF1, SF2, SS2, SS5, SS6, SS9.
4. **Report.** Write `a-round-433.md` as you go:
   - changed files;
   - each check with its rc and log path (`a-round-433/`);
   - which primitives and lessons you read;
   - reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-432/grants-433.txt`, 5 paths)
- `app/components/arrangement/ArrangementShortcutSheet.tsx` (sketch only)
- `app/lib/arrangement/strings.ts` (sketch only: one `clearSearch` line)
- `app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx` (sketch only: helpers + SC1–SC6)
- `app/lib/arrangement/__tests__/studio-search-field.test.ts` (new, sketch only: SF1, SF2)
- `docs/implementation/2026/quarter-IV/281-saba-b-12-search-clear.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 3 ` M` and 2 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-432/claims-433.sh` at the start | Equals `claims-433-planning-output.txt` (K13 by location); stderr empty |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-432/covering-files.txt)`. That is 10 files: the sheet suite, the new scan, `strings.test`, every suite that names the sheet's strings or footer button (overview-visibility, library-group-heading, meter, track-layout, master) and the two Library clear-button suites | rc 0; **10 files, 196/196** (`b-round-432/precheck-covering.log` [K18]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 for each. On B's sketch: typecheck rc 0; lint rc 0 with 205 warnings and 1 info, the same as HEAD (`precheck-lint.log` [K15c]). B's full vitest on the sketch: 271 files, 4,014 tests, rc 0 (`precheck-full.log` [K15b]; a gate row, not A's) |
| A4 | `npx biome check` on the 4 granted code and test files | rc 0, no fixes |
| A5 | Claims at the end | Differs from the planning output only in: K2 (`2 ?? 3 M total 5`), K5 `no` (already applied), K6 (doc 281 last, its l.4), K8 (`cancel-hidden 1 clear-label 2 px-3-input 0`; the label is used for `aria-label` and `title`), K8e (`sheet-clearSearch 1`), K17 (one `it('SC1` … `it('SC6` and one `it('SF1`, `it('SF2`). The sketch-side lines are in `b-round-432/claims-433-sketch-output.txt` (a scratch clone with the sketch applied and no doc, so its K2 shows `1 ?? 3 M total 4`); the expected differences are in `claims-433-planning-vs-sketch.diff`. Also K3 1,337 rc 0; K4 rc 0; K19 `L58 OK` |
| A6 | `code-reviewer` on the diff and the doc (5 files) | No Critical, High or Medium in the sketch logic, otherwise STOP (L11). TL-R433-* items are not new findings. Fix doc findings in the doc only |

**Timeout headroom (L31):** the sheet suite declares `{ timeout: 20_000 }`. In B's covering run, the slowest new row took 303 ms, and the slowest existing sheet row about 0.7 s. A test **in the two changed test files** above 50 % of its timeout in A's run is a STOP. The others are records: report `render-budget` R11-P1e's time (round 432: 2,299 ms of 5 s).

## 6. C's acceptance
**Before hand-off:** write `c-round-433.json` with all L57 fields (`mutantRedOnSketch` = `b-round-432/mutants/summary.txt`) and run `python3 -I tools/l57-check.py c-round-433.json c-round-433/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4 and 5 (browser), then the rest. Write `c-round-433/progress.json` after every row. Never run vitest while a browser probe runs (L38). Run no second dev server while row 5 runs.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation; stderr empty; K19 `L58 OK`. Status shows only the 5 granted paths. Frozen 1,337 rc 0. Protected rc 0. `a-round-433.md` lists the primitives and lessons A read |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-433.patch.txt` to a `git archive HEAD` scratch and `cmp` the 4 files against the working tree: identical. The patch has 4 `diff --git` headers [K10]. A2's command gives 10 files, 196/196 |
| 3 | **MUTANTS** | Base = HEAD + the sketch only:<br>1. `git archive HEAD \| tar -x -C /tmp/c433-mut`; symlink `node_modules`; `git apply` the sketch.<br>2. Copy `b-round-432/mutants/run.py` to `c-round-433/mutants/`.<br>3. Run `python3 -I c-round-433/mutants/run.py /tmp/c433-mut $PWD/c-round-433/mutants`. Never write into `b-round-432/`.<br>**Pass = the same 9 lines as B's `summary.txt`** [K16]:<br>M1 (HEAD component) → SC1–SC6, SF2<br>M2 native cancel shown → SF2<br>M3 no refocus → SC2, SC4<br>M4 no held-Enter guard → SC4<br>M5 `trim()` hides spaces → SC1<br>M6 `tabIndex -1` → SC3<br>M7 Library's `hadFocus` guard → SC2<br>M8 `type={'search'}` unhidden → SF2<br>sketch green 23/23 |
| 4 | **SEARCH CLEAR IN THE BROWSER (L61, L47)** | Real Chromium on `/studio-lab` at :5173 (A's tree), **1440×900 and 1280×720**, a fresh context per viewport.<br>**Run:** copy `b-round-432/probe/{clear-probe.mjs,compare-clear.py}` and B's HEAD result `b-round-432/probe/head/` to `c-round-433/probe/`. Run `node <abs>/c-round-433/probe/clear-probe.mjs http://127.0.0.1:5173 <abs>/c-round-433/probe/after`, then `python3 -I c-round-433/probe/compare-clear.py c-round-433/probe/after`.<br>**Pass: `ALL OK (2 cells)`** (B's sketch: `b-round-432/probe/compare.txt`; HEAD gives `NOT ALL OK`, `compare-head.txt`).<br>**Per viewport that means:**<br>• no Clear when the field is empty; exactly one after typing "loop"; the rows filter;<br>• **0 blue pixels** in the field's right 42 px (HEAD: 8);<br>• the input box is 670×38, as at HEAD;<br>• the text end (right − border − padding) is ≤ the button's x, and the 28×28 button sits inside the field;<br>• hover changes the icon colour;<br>• **real keyboard Tab** goes search → Clear → Close, and Shift+Tab goes back to Clear; the keyboard focus outline is not `none`;<br>• held Enter (3 keydowns), Space and a mouse click each clear the query, leave the focus in "Search shortcuts", and bring back every row; Space does not start playback (`data-playing` stays false);<br>• Esc with a query closes the sheet, and reopening shows an empty field;<br>• 0 page errors.<br>**Also look at the crops yourself:** `*-typed.png` (our muted X, no blue ✕), `*-long.png` (the 120-character query stops before the X), `*-clear-focus.png` (the ring around the X).<br>**Environment:** warm `/studio-lab` once before the first cell. A cold first load that times out is environment (L38): retry, never FAIL |
| 5 | **AUTH** (fresh context, no credentials, both viewports) | Copy `b-round-429/probe/g430-auth.cjs`. Run it once as a **warm-up** with `OUT=<abs>/c-round-433/auth/warmup` (not judged). Then run the measured attempt with `OUT=<abs>/c-round-433/auth`. Baseline: `c-round-432/auth/g428-auth.json`, pass true.<br>**Pass:**<br>• demo `/studio-lab` opens with the demo badge and `auth_user` null;<br>• `/studio/middle-east` shows "Sign in required" at 0.5, 3 and 10 s, with 0 `audio[src]` and no workspace;<br>• `/api/studio-token?product=middle-east&file=mix.wav` without auth → 401; bare → 400;<br>• no body contains a token.<br>Any read with a workspace or `audio[src]` > 0 is **Critical**.<br>**BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud). It does not make `browserVerified` false |
| 6 | **DOCS** | Doc 281:<br>• l.4 byte-exact as ruling 9;<br>• the 7 TEMPLATE headings in order;<br>• a mutant block equal to the 9 lines of `b-round-432/mutants/summary.txt`;<br>• cites only rows that exist (SC1–SC6, SF1, SF2, SS2, SS5, SS6, SS9);<br>• states the Esc decision and the Tech Lead row.<br>Also: `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits, and `lessons.md` still has L61 and L47 and ≤ 60 lines [K22] |
| 7 | **SOURCE-SCOPE end + L57** | As row 1, at the end: the end claims equal the start claims; `git diff HEAD --stat` lists only the 3 granted modified files; the 2 new files are untracked. `tools/l57-check.py` OK |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** Put them under `"gate"`, never under `"passed"` |

**Retries (rows 4–5):** a cold first load, a port in use or an overlapped job is environment (L38). Retry at most twice; it is never a FAIL. A row that fails on a valid setup is a finding.

**Tech Lead row (not C's):** Safari and Firefox draw no native cancel and do show our Clear button. This goes into TLM-SABA-B-12-FIREFOX-SAFARI (deadline RETRO 435).

**Ableton conformance (C reports separately):**
- the X clears the terms: confirmed (4.2);
- Esc: CZABA's listed difference (closes the sheet; Saba CALM-1);
- the look of the X: no reference.

## 7. The new rows and their mutants (`b-round-432/mutants/run.py`; logs in `b-round-432/mutants/`)
| Row | File | What it proves | Red under |
|---|---|---|---|
| SC1 | shortcut-sheet-ui | Clear shows only while the query is not empty (spaces count); its name and title are "Clear search"; every button name in the dialog is unique | M1, M5 |
| SC2 | shortcut-sheet-ui | A click empties the query, brings back every row and removes the no-match line; the focus lands in search both when Clear had focus and when nothing had focus | M1, M3, M7 |
| SC3 | shortcut-sheet-ui | With a query, Clear has `tabIndex` 0, the dialog focusables are [Close, search, Clear] in that order, and Tab and Shift+Tab wrap through Clear | M1, M6 |
| SC4 | shortcut-sheet-ui | A held Enter on Clear is prevented; the first press clears once and focuses search | M1, M3, M4 |
| SC5 | shortcut-sheet-ui | Esc with a query closes the sheet, from search and from Clear; the next open is empty | M1 |
| SC6 | shortcut-sheet-ui | `?` in search with a query stays text; `?` on Clear closes the sheet | M1 |
| SF1 | studio-search-field | The whole-tag scanner handles an arrow inside braces, a quoted `>`, `{'}'}` and the three spellings of `type="search"` (L13) | (scanner self-test) |
| SF2 | studio-search-field | The search fields in `app/components/arrangement` are exactly Library and the sheet, and each hides the native cancel | M1, M2, M8 |

**Neighbouring behaviour that could break:**
- SS2 (Esc closes, focus returns);
- SS5 (`?` on Close, `?` in search);
- SS6 (Tab wrap with an empty query);
- SS7 (search filters, no-match line);
- SS9 (unique names);
- HQ1 and HQ2 (held Enter on the footer button and on Close);
- the Library clear button (`library-row-strings-ui`, `library-focus-handoff`).

All of them are in the covering set.

## 8. Outcome, fixed in advance (for the 433 → 434 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | The gate publishes, and stage 3 is done. Round 434 is REGRESSION-2026-11-13 if planning falls on or after 2026-11-13. Otherwise it is **SABA-B-12 stage 3b** (SABA-B-12-DIALOG-SCROLLBAR), unless Saba answers STEM-LANES. B files ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS with root at that planning. RETRO-435 follows at round 435 |
| A Medium+ finding in the changed code | Round 434 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |
