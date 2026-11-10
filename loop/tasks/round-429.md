# Round 429: SYS-2 stage 5 (2b-ii-b, final) — the last inline held-Enter copies move to the shared guard, and a closing repo scan keeps them out

**Planned by:** B, at the round 428 → 429 planning, 2026-11-10 (`b-round-428.md`). The advisor was consulted after orientation, and again before close. The round-428 task is archived as `tasks/round-428.md` [K12].
**Decisions:** D-29z1505 … D-29z1509 (`backlog.json` v409) [K14].

## Read first
- **`lessons.md` in full** [K24]. Most relevant: L4, L11, L23, L26, L28, L29, L31, L38, L47, L50, L56, L57, L58, L59, L60.
- **Primitives, before you apply the sketch:**
  - `AGENT_DISCOVERABLE_CODE.md`
  - `FORWARDREF_COMPONENT.md`
  - `TESTING_QUALITY_GATES.md`
  - `BUG_HUNTING_TESTS.md`
  - `GEORGIAN_DOCS.md`
  - `docs/implementation/TEMPLATE.md`
- **Template round:** `tasks/round-428.md` with `c-round-428.md`. Where this task differs, this task wins.
- **Claims:** run `bash b-round-428/claims-429.sh`. You can override `ROOT=` and `LOOP=`.
  - Planning output on the real store: `b-round-428/claims-429-planning-output.txt`, with an empty stderr file `claims-429-planning.err`.
  - Output on a scratch copy with the sketch applied (no docs): `b-round-428/claims-429-sketch-output.txt`.
  - Expected differences: `b-round-428/claims-429-planning-vs-sketch.diff`.
  - K13 passes when every id is located (in the backlog or the archive) and none is `NOT-FOUND`. K13 is checked by location, not byte for byte: the optimizer may archive a closed id between B and A or C (D-29z1509).
- **Sketch review (L58):** `b-round-428/sketch-review.md` names the dispatched sha256 `c75c6186…`. It also records the v1 review (approve-with-lows on `4a52f823…`) and the delta re-review of the test-only change (approve-with-lows, no Medium). K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `b604cfb`, clean tree
- Gate 428 is `published` at `b604cfb…` on both remotes, and that commit is the baseline [K1]. `git status` is empty [K2].
- **Frozen:** `b-round-428/r429-frozen-sha256.txt` has **1,321** entries: every tracked file except the 7 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none of them is granted [K4]. This round touches no auth, route, purchase or download file.
- If K1 is not `b604cfb` at A1 because root published in between, accept a root-only commit that leaves `git diff b604cfb HEAD -- app` empty, and note it. A re-runs the claims and STOPs only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 428 passed** (D-29z1505). C PASS, 0 bugs, `browserVerified` true [K22].
  - B re-ran C's checks: L57 OK; compare `ALL OK (13 cells)`; the mutant summary is identical.
  - Gate 428 published `b604cfb`. Its review has 3 Lows and no Medium or above [K32]; each is recorded against an existing id (D-29z1509).
- **STEM-LANES still waits for Saba:** no answer and no transcripts [K23]. The regression is due on or after 2026-11-13 [K7].
- **No open Critical or High.** The open Mediums are root-only, manual-only or `awaiting_user`.
- **New: SABA-B-12** (Saba 2026-11-10, browser-default form controls) is recorded and placed after this stage (D-29z1507). It is not part of this round.
- **This round closes SYS-2.**
  - Six inline copies of the held-Enter check are still left [K8]: five in `ArrangementMarkerRow.tsx` (flag, Add, Prev, Next, name editor) and one in `ArrangementLibraryMenu.tsx` (menu container).
  - All six already behave correctly. Real Chromium at HEAD shows **no defect** on these surfaces (`head-defect-cells []`) [K15].
  - So the round is a **behaviour-identical fold** plus a **closing scan** that stops a new inline copy from being added.

## 1. What the code does today (tagged)
- **Inline copies (`event.key === 'Enter' && event.repeat`, non-test, `app/**` and `perf/**`):** 6 in total, MarkerRow 5 and LibraryMenu 1 [K8].
- **The shared helper** is not used in either file today. It is used 64 times across `app` [K8b].
- **The delegated menu form** prevents every Enter and Space, and acts only `if (!event.repeat)` [K9]. It appears in:
  - GridMenu 2
  - MarkerMenu 1
  - DetailPanel 3
  - Library 2
  - GroupHeader 3
- **Not reachable on `/studio-lab`:**
  - `AuthModal` opens only from the files listed in [K20]. `/studio-lab` uses no `RequireAuth` [K20], and the layout Header is not rendered on `/studio*` [K20b].
  - Toasts come only from cart, account and purchase code [K21]. `app/components/arrangement` uses no toast [K21].
- **Button scan (`b-round-425/button-guard-scan-enter.py` over `app/components/arrangement/*.tsx`, sketch-identical) [K9c]:** 53 ENTER-GUARD and 9 others. Each of the 9 has a ruling:
  - GridMenu ×4 and MarkerMenu ×1 menuitems: the delegated container (ruling 2);
  - the Library option: its own `!event.repeat` (round 427);
  - the MarkerRow flag: guarded inside `handleFlagKeyDown` (HK2);
  - Transport Fit: the TH5 lock;
  - the VideoDock drag handle: it has no `onClick`.
- **Import closure from `app/routes/studio-lab.tsx` (`b-round-427/tools/import-closure.py`) [K9d]:**
  - 47 files.
  - The only `<button>` files outside the arrangement folder are `app/components/ui/*`, reached through the barrel. Of those, Studio imports only `Modal` (ruled in round 428).
  - No AuthModal opener and no toast caller is in the closure.
- **L50 enumeration** (`b-round-428/data/l50-focus-origins.txt`) [K27]:
  - The L50 regex hits 12 lines in MarkerRow and 3 in LibraryMenu.
  - **0 added or removed source lines** of the sketch match it.
  - **Class ruling:** the sketch adds, moves and removes no focus call, blur handler, pointer-down handler, list render or conditional render. The editor hunk keeps the existing `settleEditor(` call as context. All 15 hits are pre-existing and out of scope. C row 4 checks the focus hand-offs.

## 2. Rulings (B, D-29z1508)
1. **The fold, behaviour-identical per press:**
   - flag keydown: `if (preventRepeatedEnterKeyDown(event)) { return; }`, still the first statement;
   - Add, Prev and Next: `onKeyDown={preventRepeatedEnterKeyDown}`;
   - name editor: inside the existing Enter/Escape branch, `if (preventRepeatedEnterKeyDown(event)) { return; }`. A repeated Escape still settles, as at HEAD.
   - LibraryMenu container: `preventRepeatedEnterKeyDown(event);` as the last statement.
   - Nothing else changes: no text, label, title, class, layout or mount. The screen-budget, product-designer and journey rows do not apply.
2. **The delegated menu form stays** [K9]. It prevents every Enter, not only the repeats, which is a different contract. ARCH-CHECKPOINT-SYS-2 weighs it later.
3. **AuthModal and Toast are out of scope.** They cannot be reached on `/studio-lab` [K20, K20b, K21]. The Modal ✕ and CookieConsent keep their round-428 rulings.
4. **Closing scan (HS1/HS2).** A repo-scan test walks the non-test `.ts`/`.tsx` files under `app/` and `perf/` and fails on any inline held-Enter check.
   - It matches: either operand order, `==` or `===`, quotes or backticks, a condition wrapped across lines, and optional chaining.
   - Out of scope, ruled by B (TL-R429-06; none exists today; doc 277 TODO): a parenthesised operand, a third operand in between, bracket access, and a named constant. ARCH-CHECKPOINT-SYS-2 weighs a lint rule against the scan.
5. **Focus targets (L47).** After the first Enter, focus lands on the element below, and the repeats go there. B measured this in real Chromium at HEAD and on the sketch [K15]:
   - Add (+) → the name editor (`arrangement-marker-name-input`);
   - editor Enter → the new flag (`arrangement-marker`);
   - flag → stays on the flag;
   - library menu link → the library option button. Its text starts with "Middle East"; the menu closes on the first Enter.
6. **Docs (L28, final stage):**
   - l.4 of docs 274, 275 and 276 becomes exactly `**სტატუსი:** Completed (C round 429 PASS)`;
   - new doc `277-sys-held-enter-closing.md` [K6: 276 is the last];
   - doc 272 is already `Completed` [K6].
7. **On C PASS:** SYS-2 is done, A-R107-SWEEP-HELD-ENTER-TOOLBAR closes, and ARCH-CHECKPOINT-SYS-2 is filed with root.

## Reference
- **No Ableton reference applies.** No per-press behaviour changes; this is a refactor and test round.
- Ableton conformance: არ ეხება (does not apply).
- **Deviations:** none.

## 3. What A changes (sketch `b-round-428/sketch-429.patch.txt`, sha256 `c75c6186…` [K10])
1. **A1:** run the claims at the start.
2. From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-428/sketch-429.patch.txt`, then `git apply` the same file.
   - It touches 5 files: 4 modified and 1 new (`held-enter-source-scan.test.ts`).
   - **Do not edit those five files afterwards.**
   - If you or your reviewer find a Medium or worse in the sketch logic, STOP (L11). Do not edit around it.
3. **Docs:**
   - Set l.4 of `docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md`, `275-sys-held-enter-panels.md` and `276-sys-held-enter-dialogs.md` to exactly `**სტატუსი:** Completed (C round 429 PASS)`. Change no other line of those docs.
   - Create `docs/implementation/2026/quarter-IV/277-sys-held-enter-closing.md` in Georgian, with English technical terms:
     - l.4 is exactly `**სტატუსი:** Completed (C round 429 PASS)` (L28);
     - TEMPLATE's 7 `## ` headings, in order (L26);
     - rulings 1–7;
     - the HEAD inline-copy list from K8;
     - a mutant block that copies the 13 lines of `b-round-428/mutants/summary.txt` byte for byte;
     - the browser table from `b-round-428/probe/compare.txt`;
     - the closure of A-R107-SWEEP-HELD-ENTER-TOOLBAR, listing the rows across stages 1–5;
     - TODO: ARCH-CHECKPOINT-SYS-2 (per-button opt-in vs wrapper or lint rule, the scan's literal-form limits TL-R429-06, and SIG-R427-HELD-ENTER-TEST-HELPER).
   - Cite only rows and files that exist (L26).
4. Write `a-round-429.md` as you go. Include:
   - the changed files;
   - each check with its rc and log path (`a-round-429/`);
   - the reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-428/grants-429.txt`, 9 paths)
- `app/components/arrangement/ArrangementMarkerRow.tsx` (sketch only)
- `app/components/arrangement/ArrangementLibraryMenu.tsx` (sketch only)
- `app/lib/arrangement/__tests__/markers-ui.test.tsx` (sketch only: HK1–HK3)
- `app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx` (sketch only: HK4)
- `app/lib/arrangement/__tests__/held-enter-source-scan.test.ts` (new, sketch only: HS1, HS2)
- `docs/implementation/2026/quarter-IV/274-sys-held-enter-mixer.md` (l.4 only)
- `docs/implementation/2026/quarter-IV/275-sys-held-enter-panels.md` (l.4 only)
- `docs/implementation/2026/quarter-IV/276-sys-held-enter-dialogs.md` (l.4 only)
- `docs/implementation/2026/quarter-IV/277-sys-held-enter-closing.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 7 ` M` lines and 2 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-428/claims-429.sh` at the start | Equals `claims-429-planning-output.txt` (K13 by location); stderr empty |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-428/covering-files.txt)`. The list has 47 files: every test file that references the marker row, the library menu, `repeat: true`, the helper or the render log, plus the new scan file | rc 0; **47 files, 920/920** (`b-round-428/precheck-a2.log` [K18]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0 (`precheck-typecheck.log`); lint rc 0 with 205 warnings and 1 info, the same as HEAD (`precheck-lint.log`) |
| A4 | `npx biome check` on the 5 granted code and test files | rc 0, no fixes (`precheck-biome5.log`) |
| A5 | Claims at the end | Differs from the planning output only in the lines listed in `claims-429-planning-vs-sketch.diff`, with these exceptions:<br>• K1 stays `b604cfb…`;<br>• K5 becomes `no`;<br>• K2 becomes `2 ?? 7 M total 9`;<br>• K6 shows doc 277 as the last doc, and l.4 of 274–277 as `Completed (C round 429 PASS)`;<br>• K6b no longer lists 274, 275 or 276.<br>K8, K8b, K17 and K26 equal `claims-429-sketch-output.txt`. K2b is 0; K3 is 1,321 rc 0; K4 is rc 0; K19 is `L58 OK` |
| A6 | `code-reviewer` on the diff and the 4 docs (9 files) | No Critical, High or Medium in the sketch logic; otherwise STOP (L11). The TL-R429-01…08 items in `sketch-review.md` are not new findings. Fix doc findings in the docs only |

**Timeout headroom (L31) [K26]:**
- `markers-ui`: describe timeout 15 s; the whole file took 4.2 s at gate 428 and 4.1 s on the sketch.
- `studio-link-view-in-store-ui`: describe timeout 15 s; the whole file took 2.3 s.
- The scan file takes 0.07 s.
- No covering test is above 50 % of its timeout. The slowest is CP12c: 3.3 s on the sketch and 3.6 s at gate 428, against a 30 s timeout [K31].

## 6. C's acceptance
**Before hand-off:** write `c-round-429.json` with **all L57 fields**, with `mutantRedOnSketch` = `b-round-428/mutants/summary.txt`. Then run `python3 -I tools/l57-check.py c-round-429.json c-round-429/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4 and 5 (browser), then the rest. Write `c-round-429/progress.json` after every row. Never run vitest while a browser probe runs (L38). **Never run a second dev server while row 5 (auth) runs** (INFO-C428-AUTH-SECOND-VITE).

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation (K13 by location) and **stderr is empty**. K19 prints `L58 OK`. K13 lists every id with a location, none `NOT-FOUND`. Status shows only the 9 granted paths. Frozen: 1,321 rc 0. Protected: rc 0 |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-429.patch.txt` to a `git archive HEAD` scratch and `cmp` the 5 files against the working tree: identical. The patch has 5 `diff --git` headers [K10]. A2's command gives 47 files, 920/920 |
| 3 | **MUTANTS** | **Base = HEAD with nothing applied:**<br>1. `git archive HEAD \| tar -x -C /tmp/c429-mut`;<br>2. symlink `node_modules`;<br>3. `git init && git add -A && git commit`;<br>4. copy `b-round-428` to `c-round-429/b428copy/`;<br>5. run `python3 -I c-round-429/b428copy/mutants/run.py /tmp/c429-mut $PWD/c-round-429/b428copy`.<br>Never write into `b-round-428/`.<br>**Pass = the same 13 lines as B's `summary.txt`** [K16]:<br>• MU-HEAD-SRC turns HS1 red (1 failed, 59 passed of 60);<br>• MU-ADD, MU-PREV and MU-NEXT turn HK1 red, each on its own button (`mutants/hk1-params.txt`);<br>• MU-FLAG turns HK2 red;<br>• MU-EDITOR turns HK3 red;<br>• MU-LIBMENU turns HK4 red;<br>• the six MU-FORM-* lines turn HS1 red. They are: arrow, if-return, nested, container, the reversed operand order in `perf/lib`, and the wrapped reversed operand.<br>Also re-run the three `grep -oE` lines that produced `hk1-params.txt` on C's logs |
| 4 | **HELD-ENTER BROWSER + FOCUS** | Real Chromium on `/studio-lab` at :5173 (A's tree), at **1440×900 and 1280×720**, with a fresh context per cell.<br>Copy `b-round-428/probe/{held-enter-s5.mjs,compare.py}` to `c-round-429/probe/`, and B's HEAD results `b-round-428/probe/head/*.json` to `c-round-429/probe/head/`.<br>Run `OUT=<abs>/c-round-429/probe/sketch node <abs>/c-round-429/probe/held-enter-s5.mjs`, then `python3 -I c-round-429/probe/compare.py c-round-429/probe`.<br>**Pass: `ALL OK (8 cells)`** [K15]. In each cell (MADD, MEDIT, MFLAG, LMENU):<br>• the first Enter acts;<br>• three held Enter keydowns change nothing: markers, editor, library menu, status, undo, insert marker, clock, popup count;<br>• 0 page errors;<br>• the first-press state equals HEAD's;<br>• focus follows ruling 5, with `focusVisible` true and outline `solid`.<br>**This row proves equivalence, not the fix.** HEAD had no defect here. In the browser, the held repeats reach the editor (MADD) and the flag (MEDIT, MFLAG), so these cells would show a lost editor or flag guard. A lost Add, Prev, Next or LibraryMenu guard would not show, because focus leaves those elements on the first Enter or the menu closes. The mutants (row 3) are the discriminating proof for those guards.<br>Warm `/studio-lab` once in a browser before the first cell (L38). A cold first load that times out is environment-invalid and is retried |
| 5 | **AUTH** (fresh context, no credentials, both viewports) | Copy `b-round-428/probe/g429-auth.cjs` and run it with `OUT=<abs>/c-round-429/auth`. B ran it at HEAD: `probe/auth-head/g428-auth.json`, pass true [K28].<br>The mock API (`mock-api/server.mjs` [K29]) is optional. If you start it, record its PID in `c-round-429/mock.pid` and stop only that PID.<br>Pass:<br>• the demo `/studio-lab` opens with the demo badge and `auth_user` null;<br>• `/studio/middle-east` shows "Sign in required" on every read at 0.5, 3 and 10 s, with 0 `audio[src]` and no workspace;<br>• `/api/studio-token?product=middle-east&file=mix.wav` without auth returns 401;<br>• bare `/api/studio-token` returns 400;<br>• no body contains a token.<br>Any read with a workspace or with `audio[src]` > 0 is a **Critical** finding.<br>**BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud). It does not make `browserVerified` false |
| 6 | **DOCS** | l.4 of docs 274, 275, 276 and 277 is byte-exact `**სტატუსი:** Completed (C round 429 PASS)`. `git diff HEAD` on 274–276 changes only l.4.<br>Doc 277:<br>• has the 7 TEMPLATE headings, in order;<br>• has a mutant block equal to the 13 lines of `b-round-428/mutants/summary.txt`;<br>• cites only row ids that exist in the test files;<br>• states the scan's literal-form limits (ruling 4).<br>`grep -rn 'In Progress (stage' docs/implementation` no longer lists 274–276. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |
| 7 | **SOURCE-SCOPE end + L57** | As row 1, at the end. The end claims equal the start claims. `git diff HEAD --stat` lists only the 7 granted modified files, and the 2 new files are untracked. `tools/l57-check.py` is OK |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** These are gate rows: put them under `"gate"` in the JSON, never under `"passed"`. B's full vitest on the final sketch: 267 files, 3,998 tests, rc 0 (`b-round-428/precheck-full.log` [K25]) |

**Retries (rows 4–5):** a cold-server first load, a port already in use or an overlapped job is an environment problem (L38). Retry at most twice; it is never a FAIL. A row that fails on a valid setup is a finding.

## 7. The new rows and their mutants (`b-round-428/mutants/run.py`; logs in `b-round-428/mutants/`)
| Row | File | What it proves | Red under |
|---|---|---|---|
| HK1 (×3) | markers-ui | A repeated Enter on Add, Prev or Next is prevented; a fresh Enter is not | MU-ADD, MU-PREV, MU-NEXT (one each) |
| HK2 | markers-ui | A repeated Enter on a flag is prevented and changes nothing (arrangement, menu and focus); a fresh Enter is not prevented | MU-FLAG |
| HK3 | markers-ui | A repeated Enter in the name editor does not settle it (editor open, no marker, no undo); a fresh Enter commits one marker | MU-EDITOR |
| HK4 | studio-link-view-in-store-ui | A repeated Enter on the store link is prevented by the menu, and the menu stays open with focus on the link; a fresh Enter is not prevented | MU-LIBMENU |
| HS1 | held-enter-source-scan | No inline held-Enter check in non-test `app/` or `perf/` sources, and the helper export exists | MU-HEAD-SRC and the 6 MU-FORM-* mutants |
| HS2 | held-enter-source-scan | The scan pattern matches its 6 positive forms and ignores the helper form, the menu form and `!event.repeat` | (pattern self-test) |

**Neighbouring behaviour that could break:**
- M, Enter, Escape and blur on the marker editor (MU1, MU2 and the rest of `markers-ui`);
- marker flag keys: the arrows, the context menu, and Delete;
- library menu Space, Escape and Tab (the VS rows);
- the render counts (`render-budget` and the render-log files in the covering set).

**Ableton conformance:** does not apply (see Reference).

## 8. Outcome, fixed in advance (for the 429 → 430 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | The gate publishes. SYS-2 is done, and ARCH-CHECKPOINT-SYS-2 goes to root. Round 430 = REGRESSION-2026-11-13 if planning falls on or after 2026-11-13, otherwise SABA-B-12 (browser audit at that planning), unless Saba answers STEM-LANES |
| A Medium+ finding in the changed code | Round 430 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |
