# Round 428: SYS-2 stage 4 (2b-ii-a) — a held Enter acts once on the shortcut sheet, the export dialog and the narrow-screen Send link

**Planned by:** B, at the round 427 → 428 planning, 2026-11-10 (`b-round-427.md`). The advisor was used after orientation and before close. The round-427 task is archived as `tasks/round-427.md` [K12].
**Decisions:** D-29z1498 … D-29z1504 (`backlog.json` v407) [K14].

## Read first
- **`lessons.md` in full** [K23]. Most relevant: L4, L11, L23, L26, L28, L29, L31, L47, L50, L56, L57, L58, L59, L60.
- **Primitives, before you apply the sketch:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
- **Template round:** `tasks/round-427.md` with `c-round-427.md`. Where this task differs, this task wins.
- **Claims:** `bash b-round-427/claims-428.sh` (`ROOT=` and `LOOP=` can be overridden).
  - Planning output on the real store: `b-round-427/claims-428-planning-output.txt` (stderr `claims-428-planning.err`, empty).
  - Output on a scratch with the sketch applied (no doc): `b-round-427/claims-428-sketch-output.txt`.
  - Expected differences: `b-round-427/claims-428-planning-vs-sketch.diff`.
  - K13 passes when every id is located and none is `NOT-FOUND`.
- **Sketch review (L58):** `b-round-427/sketch-review.md` names the dispatched sha256 `fa75fa82…`, the first review (approve-with-lows on `fc3d0b63…`), the test-only delta and the delta re-review (approve). K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `ffae71c`, clean tree
- Gate 427 is `published` at `ffae71c…` on both remotes, and that commit is the baseline [K1]. Status is empty [K2].
- **Frozen:** `b-round-427/r428-frozen-sha256.txt` has **1,320** entries: every tracked file except the 7 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `ffae71c` at A1 (root published in between), a root-only commit that leaves `git diff ffae71c HEAD -- app` empty is accepted with a note. A re-runs the claims and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 427 passed** (D-29z1498). C PASS, 0 bugs, `browserVerified` true [K21].
  - B re-ran C's compare (ALL OK, 18 cells). C's mutant summary is identical to B's. L57 OK.
  - Gate 427 published `ffae71c` (266 files, 3,984 tests).
  - **SYS-2 stage 3 (2b-i) is done.** TL-R425-09 is closed by HM5b.
- **STEM-LANES still waits for Saba.** `AGREE-STEM-LANES.md` has no answer, and no transcripts file exists [K22].
  - The regression is due on or after 2026-11-13 [K7].
  - RETRO 435 is not due.
- **Open Criticals/Highs:** none. The open Mediums are root-only, manual-only or `awaiting_user`.
- **The defect, in real Chromium at HEAD** (`b-round-427/probe/head/*.json`, both viewports; Send link at 800×700) [K15]:
  - **sheet Close:** the first Enter closes the shortcut sheet and focus returns to the footer Shortcuts button [K20]. The repeats then click that button and reopen the sheet (`sheetOpens` 1 → 2).
  - **narrow-screen Send link:** each repeat copies the link again (clipboard writes 1 → 4).
- **No defect at HEAD** on the other cells (`head held []`):
  - the footer button alone: focus moves to the sheet search field, which has no Enter action;
  - export Done, which is already guarded inline [K8];
  - the Modal close ✕ and Export: focus goes to the guarded Export opener [K26] or to Done;
  - the grid menu: its container keydown clicks only `if (!event.repeat)` [K29].

## 1. What the code does today (tagged)
- **Inline copies [K8, K8b].** In the four files of this round there is 1 inline `event.key === 'Enter' && event.repeat` copy, on export Done. The whole of `app/**` and `perf/**` (non-test) has 7: ExportDialog 1, MarkerRow 5, LibraryMenu 1.
- **The helper** `preventRepeatedEnterKeyDown` is used only in StudioWorkspace among the four files [K8].
- **Enter scanner** (`b-round-425/button-guard-scan-enter.py`):
  - the four files [K9];
  - the whole folder [K9b];
  - what is left, by file [K9c].
- **None of the five target buttons has an `onKeyDown` today except Done** (its inline copy), and none of them spreads props [K24].
- **Send link** calls `navigator.share` when present, otherwise the clipboard [K30].
- **The /studio-lab import closure** (`b-round-427/tools/import-closure.py`) [K9d]:
  - It reaches `<button>` files outside `app/components/arrangement` only through `app/components/ui/*` [K9d]. This round rules only the Modal close ✕, which the export dialog renders: ExportDialog does not pass `showCloseButton`, and the Modal default is `true` [K26]. The sheet passes `false` [K26]. The rest of the closure is ruled in stage 5 with the closing scan.
  - `app/root.tsx` renders `AuthModal`, `ToastContainer` and `CookieConsent` on every route [K27]. CookieConsent returns early without `GA4_MEASUREMENT_ID` [K27], which the cloud does not set.

## 2. Rulings (B, D-29z1500, D-29z1503)
1. **Guards added.** Each is `onKeyDown={preventRepeatedEnterKeyDown}`:
   - `StudioWorkspace.tsx`: the footer Shortcuts button;
   - `ArrangementShortcutSheet.tsx`: the sheet Close;
   - `StudioNarrowScreen.tsx`: Send link;
   - `ArrangementExportDialog.tsx`: Cancel and Export (the primary button).
2. **Fold, behaviour-identical:** the export Done inline copy becomes `onKeyDown={preventRepeatedEnterKeyDown}`.
3. **Preventive guards:** Export and Cancel have no reproduced Chromium defect at HEAD.
   - Export becomes natively disabled while it renders, and focus ends on Done.
   - Cancel unmounts on its first Enter, and focus moves to Done (CU1).

   They are guarded so that the dialog follows one rule. Doc 276 says they are preventive (TL-R427-03).
4. **Out of scope, ruled with evidence:**
   - **Modal ✕** (`app/components/ui/Modal.tsx`, shared Store UI): XMODALX shows no defect at HEAD. The ✕ unmounts on the first Enter, and focus returns to the guarded Export opener [K26].
   - **CookieConsent:** it is not rendered without a GA4 id [K27], and Accept/Decline unmount it.
   - **AuthModal and Toast:** not probed in this round. They are ruled in stage 5 together with the closing scan.
   - **The sheet search field:** it has no Enter action. HQ1 pins that its repeats are not prevented.
   - **The grid menu and marker menu:** the container clicks only `if (!event.repeat)` [K29]. This delegated form is ruled in stage 5.
   - **Transport Fit (TH5), the video drag handle and the library option:** as ruled in round 427.
   - **The grid menu focus return:** choosing from a pointer-opened menu with no prior focus returns focus to BODY, at HEAD and on the sketch. This is pre-existing, with the same root cause as C-R301-01 (recorded there as `confirmedBy`, D-29z1504) [K13]. The GMENU cell records focus and does not assert it.
5. **Per press, nothing changes.**
   - A fresh Enter, Space or mouse click acts exactly as at HEAD (the probe's `firstEqualsHead True` on all 13 cells).
   - No text, label, title, class or layout changes, and nothing new mounts.
   - The screen-budget, product-designer and journey rows do not apply.
6. **Focus targets (L47, L50).** After the first Enter, focus lands on the element named below, and the repeats go there:
   - sheet Close → the footer Shortcuts button (the opener) [K20]. It is guarded only after this round; without the guard this is the HEAD bug.
   - footer Shortcuts → the sheet search field. Its repeats are not prevented, and nothing happens.
   - Send link → stays on Send link.
   - Cancel → Done (CU1).
   - Done and the Modal ✕ → the Export opener [K26].
   - **L50 enumeration** (`b-round-427/data/l50-focus-origins.txt` [K31]): the L50 regex gives 19 / 8 / 4 / 17 hits in the four granted source files, and **0 added or removed lines** of the sketch match it. **Class ruling:** the sketch adds, moves and removes no focus call, blur handler, pointer-down handler, list render or conditional render. All 48 hits are pre-existing and out of scope. The hand-offs above are checked by C row 4.
7. **Stage numbering (D-29z1500).** SYS-2 now has 5 stages:
   - stage 1: round 422, doc 272;
   - stage 2 (2a): round 426, doc 274;
   - stage 3 (2b-i): round 427, doc 275;
   - stage 4 (2b-ii-a): this round, doc 276;
   - stage 5 (2b-ii-b): next. It covers the MarkerRow (5) and LibraryMenu (1) inline copies, the delegated-form ruling, and a closing grep over `app/**` and `perf/**` with one mutant per copy form. It grants l.4 of docs 274, 275 and 276 to `Completed` (L28).

   The published l.4 of docs 274 and 275 stays as is in this round [K6].
8. **Doc:** `276-sys-held-enter-dialogs.md` [K6: 275 is the last].

## Reference
- **No Ableton reference applies.** The change removes Chromium's auto-repeat activation of a focused button. No per-press behaviour changes, so there is no Live behaviour to match.
- Ableton conformance: არ ეხება (does not apply). The reference is the project's own convention (rounds 108, 422, 426, 427).
- **Deviations:** none.

## 3. What A changes (sketch `b-round-427/sketch-428.patch.txt`, sha256 `fa75fa82…` [K10])
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-427/sketch-428.patch.txt`, then `git apply` the same file. It touches 7 files, all modified.
   - **Do not edit those seven files afterwards.**
   - If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11). Do not edit around it.
3. **Doc:** create `docs/implementation/2026/quarter-IV/276-sys-held-enter-dialogs.md` in Georgian, with English technical terms.
   - l.4 is exactly `**სტატუსი:** In Progress (stage 4 of 5; C round 428 PASS)` (L28).
   - It has TEMPLATE's 7 `## ` headings, in order (L26).
   - Content:
     - rulings 1–8, stating that Export and Cancel are preventive (ruling 3);
     - A-R107-SWEEP-HELD-ENTER-TOOLBAR → HQ1, HQ2, HN1, HX1–HX3 (partial; it stays open for stage 5);
     - the HEAD defect cells from §0;
     - a mutant block that copies the 7 lines of `b-round-427/mutants/summary.txt` byte for byte;
     - the browser HEAD-vs-sketch table from `b-round-427/probe/compare.txt`;
     - TODO: SYS-2 stage 5 (ruling 7).
   - It cites only rows and files that exist (L26).
4. Write `a-round-428.md` as you go. It has:
   - the changed files;
   - each check with its rc and log path (`a-round-428/`);
   - the reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-427/grants-428.txt`, 8 paths)
- `app/components/arrangement/ArrangementExportDialog.tsx` (sketch only)
- `app/components/arrangement/ArrangementShortcutSheet.tsx` (sketch only)
- `app/components/arrangement/StudioNarrowScreen.tsx` (sketch only)
- `app/components/arrangement/StudioWorkspace.tsx` (sketch only)
- `app/lib/arrangement/__tests__/export-cancel-ui.test.tsx` (sketch only: HX1–HX3)
- `app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx` (sketch only: HQ1, HQ2)
- `app/lib/arrangement/__tests__/studio-narrow-gate-ui.test.tsx` (sketch only: HN1)
- `docs/implementation/2026/quarter-IV/276-sys-held-enter-dialogs.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 7 ` M` lines and 1 `??` line.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-427/claims-428.sh` at the start | Equals `claims-428-planning-output.txt`; stderr empty |
| A2 | `npx vitest run $(grep '^app/' ../tmp/studio-real-loop/b-round-427/covering-files.txt)` from `store/`. That is 59 files: every test file that references the changed buttons, their labels, testids or strings, the three dialogs, `repeat: true` or the helper, plus the render-log and held-Enter files | rc 0; **59 files, 996/996** (`b-round-427/precheck-a2.log` [K18]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info (`precheck-lint.log`) |
| A4 | `npx biome check` on the 7 granted code and test files | rc 0, no fixes (`precheck-biome7.log`) |
| A5 | Claims at the end | Differs from the planning output only in the lines that `claims-428-planning-vs-sketch.diff` lists, with these exceptions: K1 stays `ffae71c…`; K5 becomes `no` (the sketch is already applied); K2 becomes `1 ?? 7 M total 8` (the scratch has no doc); K6 shows the doc 276 name and its l.4. K8, K8b, K9, K9b, K9c, K17 and K24 equal `claims-428-sketch-output.txt`. K2b is 0; K3 is 1,320 rc 0; K4 is rc 0 |
| A6 | `code-reviewer` on the diff and doc 276 (8 files) | No Critical, High or Medium in the sketch logic (otherwise STOP, L11). Rulings 1–8 and the TL-R427-01…06 items in `sketch-review.md` are not new findings. Fix doc findings in the doc only |

**Timeout headroom (L31).** The higher of the sketch and gate-427 times decides [K32]:
- `shortcut-sheet-ui`: 20 s describe timeout; SS2 is 1.4 s at gate 427, and HQ2 is 0.4 s on the sketch;
- `studio-narrow-gate-ui`: 15 s describe timeout; NG5 is 2.2 s at gate 427;
- `export-cancel-ui`: 15 s describe timeout; the whole file takes 2.2 s at gate 427.
- From the covering set: CP12c is 4.7 s against 30 s, and TC10 is 3.9 s against 15 s.

No covering test is above 50 % of its timeout.

## 6. C's acceptance
**Before hand-off:** write `c-round-428.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-427/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-428.json c-round-428/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4–6 (browser), then the rest. Write `c-round-428/progress.json` after every row. Never run vitest while a browser probe runs (L38).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation and **stderr is empty**. K19 prints `L58 OK`. K13 lists every id with a location, none `NOT-FOUND`. Status shows only the 8 granted paths. Frozen: 1,320 rc 0. Protected: rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-428.patch.txt` to a `git archive HEAD` scratch and `cmp` the 7 files against the working tree: identical. The patch has 7 `diff --git` headers. A2's command gives 59 files, 996/996 |
| 3 | **MUTANTS** | **Base = HEAD with nothing applied:** `git archive HEAD \| tar -x -C /tmp/c428-mut`, symlink `node_modules`, then `git init && git add -A && git commit`. Copy `b-round-427` to `c-round-428/b427copy/` and run `python3 -I c-round-428/b427copy/mutants/run.py /tmp/c428-mut $PWD/c-round-428/b427copy`. Never write into `b-round-427/`. **Pass = the same 7 lines as B's `summary.txt`** [K16]: MU-HEAD-SRC turns HN1, HQ1, HQ2, HX1 and HX2 red (5 failed, 42 passed of 47). SHEET-FOOTER turns HQ1 and HQ2 red. SHEET-CLOSE turns HQ2 red. NARROW-SEND turns HN1 red. EXPORT-PRIMARY turns HX1 red. EXPORT-CANCEL turns HX2 red. EXPORT-DONE turns HX2 and HX3 red. HX3 is green at HEAD by design, because Done was guarded inline there (ruling 2) |
| 4 | **HELD-ENTER BROWSER + FOCUS** | Real Chromium, `/studio-lab` on :5173 (A's tree), at **1440×900 and 1280×720**, with Send link at 800×700 (the narrow screen shows below 900 px), and a fresh context per cell. Copy `b-round-427/probe/{held-enter-2bii.mjs,compare.py}` to `c-round-428/probe/`, and B's HEAD results `b-round-427/probe/head/*.json` to `c-round-428/probe/head/`. Run `OUT=<abs>/c-round-428/probe/sketch node <abs>/c-round-428/probe/held-enter-2bii.mjs`, then `python3 -I c-round-428/probe/compare.py c-round-428/probe`. **Pass: `ALL OK (13 cells)`** [K15]. That means the first Enter acts, three repeated Enter keydowns change nothing, and there are 0 page errors. "Nothing" includes the side-effect counters: offline renders, clipboard and share calls, sheet and dialog mounts, and downloads. The first-press state also equals HEAD's (`firstEqualsHead`), so per-press behaviour is unchanged. **Focus after the repeats:**<br>• SFOOTER: `Search shortcuts`<br>• SCLOSE: the footer button `Keyboard shortcuts (?)`<br>• XDONE and XMODALX: the `Export` opener<br>• XEXPORT: `Done`<br>• NSEND: `Send link`<br>Each of those has `focusVisible` true and outline `solid`. GMENU focus is recorded only (ruling 4). XEXPORT leaves `downloads` out of the A/B and HEAD comparisons and asserts the totals instead: 1 render and 1 download (D-29z1504). `compare.py` with HEAD as the sketch fails 3 of 13 (`b-round-427/probe/compare-head-as-sketch.txt` [K33]). Warm `/studio-lab` once in a browser before the first cell (L38). A cold first load that times out is environment-invalid and is retried |
| 5 | **PER-PRESS + NEIGHBOURS** (browser, 1440×900; `record — not run on sketch: B's probe covers the per-press Enter state only`, so a failure here is a finding, not a planning FAIL) | In one fresh context:<br>1. `?` opens the sheet, Esc closes it, and focus returns to the opener;<br>2. a mouse click on the footer button opens the sheet, and a click on Close closes it;<br>3. with one clip added (library option, then Enter), Export → Export starts exactly 1 offline render, and Done closes the dialog;<br>4. Space on the focused footer button opens the sheet once.<br>Record each, with its counts and page errors, in `c-round-428/probe/neighbours.json`. An action that acts more or less than once is a finding |
| 6 | **AUTH** (fresh context, no credentials, both viewports) | Copy `b-round-427/probe/g428-auth.cjs` (B ran it at HEAD: `probe/auth-head/g428-auth.json`, pass true [K34]) and run it with `OUT=<abs>/c-round-428/auth`. You may start the mock API from `mock-api/server.mjs` on :5199; if you do, record its PID in `c-round-428/mock.pid` and stop only that PID. **The script reads the legacy route in a settled state** (D-29z1502): samples at 0.5, 3 and 10 s, then "Sign in required" or 10 s. Every read records the workspace and `audio[src]`. Pass:<br>• the demo `/studio-lab` opens with the demo badge and `auth_user` null;<br>• `/studio/middle-east` shows "Sign in required", with 0 `audio[src]` and no workspace on every read;<br>• `/api/studio-token?product=middle-east&file=mix.wav` without auth → 401;<br>• bare `/api/studio-token` → 400;<br>• no token in any body.<br>Any read with a workspace or `audio[src]` > 0 is a **Critical** finding. **BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud). It does not make `browserVerified` false |
| 7 | **DOC** | Doc 276 l.4 is byte-exact `**სტატუსი:** In Progress (stage 4 of 5; C round 428 PASS)`. The 7 TEMPLATE headings are in order. Its mutant block equals the 7 lines of `b-round-427/mutants/summary.txt` byte for byte. Every row id it cites exists in the test files, and it says that Export and Cancel are preventive. No other doc differs from HEAD; docs 274 and 275 keep their l.4. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |
| 8 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims. `git diff HEAD --stat` lists only the 7 granted modified files. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | Not run by C. These are gate rows: they go under `"gate"` in the JSON, never under `"passed"`. B's full vitest on the final sketch: 266 files / 3,990 tests, rc 0 (`b-round-427/precheck-full.log` [K25]) |

**Retries (rows 4–6):** a cold-server first load, a port already in use or an overlapped job is an environment problem (L38). Retry at most twice; it is never a FAIL. A row that fails on a valid setup is a finding.

The browser probe ran on v1 (`fc3d0b63…`). Its 4 source files are byte-identical to the final sketch, and the delta changes tests only (`sketch-delta-fc3d0b63-to-final.patch.txt`).

## 7. The new rows and their mutants (`b-round-427/mutants/run.py`; logs in `b-round-427/mutants/`)
| Row | File | Closes / advances | What it proves | Red under |
|---|---|---|---|---|
| HQ1 | shortcut-sheet-ui | A-R107 (footer Shortcuts) | A repeated Enter on the footer button is prevented and opens nothing. A fresh Enter opens the sheet once with focus in search. The repeats in search are deliberately not prevented, and the sheet stays open | HEAD-SRC, SHEET-FOOTER |
| HQ2 | shortcut-sheet-ui | A-R107 (sheet Close), HEAD defect | A repeated Enter on Close is prevented. A fresh Enter closes once, and focus goes to the footer button. The repeats there are prevented and do not reopen the sheet (`aria-expanded` false) | HEAD-SRC, SHEET-FOOTER, SHEET-CLOSE |
| HN1 | studio-narrow-gate-ui | A-R107 (Send link), HEAD defect | A repeat before the press copies nothing. A fresh Enter copies once ("Link copied"), and 3 repeats are prevented. 1 `writeText` call; focus stays on Send link | HEAD-SRC, NARROW-SEND |
| HX1 | export-cancel-ui | A-R107 (Export, preventive) | A repeat that reaches Export before a fresh press is prevented and starts no render. The fresh Enter starts 1 render and disables the button | HEAD-SRC, EXPORT-PRIMARY |
| HX2 | export-cancel-ui | A-R107 (Cancel, preventive) | During a render, a repeated Enter on Cancel is prevented and does not abort. A fresh Enter cancels once, and focus goes to Done. The repeats there are prevented, and the dialog stays open | HEAD-SRC, EXPORT-CANCEL, EXPORT-DONE |
| HX3 | export-cancel-ui | fold characterization | A repeat on Done is prevented and keeps the dialog open; a fresh Enter closes it | EXPORT-DONE (green at HEAD by design) |

**Neighbouring behaviour that could break:**
- `?` and Esc on the sheet (SS2, SS5);
- the sheet's search and Tab trap (covering `shortcut-sheet-ui`);
- export Cancel in every phase (CU1–CU10) and the dialog tab stops (`export-dialog-tab-stops`);
- the narrow screen's Space/Delete isolation (NG6) and the share/clipboard paths (NG7a–d);
- the footer render counts (`render-budget` and the render-log files in the covering set).

**Ableton conformance:** does not apply (see Reference).

## 8. Outcome, fixed in advance (for the 428 → 429 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | The gate publishes. Round 429 = REGRESSION-2026-11-13 if planning falls on or after 2026-11-13. Otherwise it is SYS-2 stage 5 (2b-ii-b), unless Saba answers STEM-LANES |
| A Medium+ finding in the changed code | Round 429 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |
