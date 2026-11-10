# Round 434: SABA-B-12 stage 3b — Studio dialogs use the Studio scrollbar instead of the store's teal scrollbar

**Planned by:** B, at the round 433 → 434 planning, 2026-11-10 (`b-round-433.md`). The advisor was consulted after orientation. The round-433 task is archived as `tasks/round-433.md` [K12].
**Decisions:** D-29z1532 … D-29z1537 (`backlog.json` v417, plus D-29z1537 close-review follow-ups) [K14].

## Read first
- **Lessons for this round** (one line each; see `lessons.md` for the full text):
  - L11: report a STOP at the top of `a-round-434.md` and change nothing else.
  - L12: never select by styling class in tests. DS1/DS2 read the class tokens of the Modal panel because the class is the contract here, and they find the panel by role (`dialog`), not by a class.
  - L26: the doc cites only rows that exist.
  - L28: doc line 4 is final as written.
  - L38: never run vitest at the same time as a browser probe.
  - L57: write the harness fields in `c-round-434.json`.
  - L58: every number asserted below comes from B's own run on the final sketch, saved in `b-round-433/`.
  - L59: do not end C early.
  - L60: destructive commands stay inside your own round folder.
  - L61: native control chrome gets its own row. Here that is the scrollbar, measured with visible scrollbars (amended this planning).
- **Primitives, before you apply the sketch:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md` (this round edits the Modal component), `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`. List in `a-round-434.md` what you read, fully or partly.
- **Template round:** `tasks/round-433.md` with `c-round-433.md`. Where this task differs, this task wins.
- **Claims:** run `bash b-round-433/claims-434.sh` (override `ROOT=`/`LOOP=` if needed).
  - B's planning output is `b-round-433/claims-434-planning-output.txt`, and its stderr `claims-434-planning.err` is empty.
  - K13 passes when every id is found in the backlog or the archive.
- **Sketch review (L58):** `b-round-433/sketch-review.md` names the dispatched sha256 `8aed38f329cada7b…`. The tech-lead verdict is approve-with-lows: no Medium, and TL-R434-01…05 are ruled there. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `0c22ac9`, clean tree
- Gate 433 is `published` at `0c22ac9…` on both remotes, so that commit is the baseline [K1]. The gate's `head` field (`1a417fb`) is stale.
- `git status` is empty [K2].
- **Frozen files:** `b-round-433/r434-frozen-sha256.txt` has **1,338** entries: every tracked file except the 4 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected files:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none of them is granted [K4]. This round touches no auth, route, purchase or download file.
- If K1 is not `0c22ac9` at A1 because root published in between, accept a root-only commit that leaves `git diff 0c22ac9 HEAD -- app` empty, and note it. STOP only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 433 passed** (D-29z1532): C PASS, 0 bugs, `browserVerified` true [K20]. B re-judged C's probe (ALL OK). The mutant lines are identical, and the measured auth run passes. Gate 433 published `0c22ac9`. **Stage 3 is done.**
- Today is 2026-11-10, before the regression date of 2026-11-13 [K7]. No Critical or High bug is open. Saba's SABA-B-12 request names scrollbars, and stage 3b (D-29z1529) is the remaining Studio part of it.
- **What Saba sees today.** B ran real Chromium 143 at HEAD with visible scrollbars (`b-round-433/probe/head/`, `compare-head.txt`):
  - Press `?`. The shortcut sheet scrolls on both viewports (1410 px of content in 808 / 646 px).
  - Its scrollbar is **teal**, the old brand colour: computed `scrollbar-color` is `rgba(18, 217, 200, 0.4)` and `scrollbar-width` is `thin`. About 1,750 teal pixels sit in the right 13 px strip, against roughly 2.60:1 contrast on the surface.
  - The Export dialog shows the same teal bar at 1280×720, where it scrolls (691 px of content in 646). At 1440×900 it fits and has no bar.
  - Every other Studio scroller (Library, Detail panel, timeline) uses `STUDIO_SCROLLBAR_CLASS`: `scrollbar-color` `auto`, a 10 px bar and a warm `bg-dim` thumb.
  - Crops: `head/1280x720-sheet-edge.png`, `head/1280x720-export-edge.png`.

## 1. What the code does today (tagged)
- `Modal.tsx` hard-codes `styled-scrollbar` on its panel [K8]. `app/styles/base/utilities.css` defines `.styled-scrollbar` **outside any `@layer`**: a teal `scrollbar-color`, `scrollbar-width: thin`, and 4 px `::-webkit-scrollbar` rules [K8e]. Unlayered CSS beats Tailwind's layered utilities.
- Four places render `<Modal>` [K8d]:
  - the two Studio dialogs (`ArrangementShortcutSheet.tsx`, `ArrangementExportDialog.tsx`);
  - `ConfirmModal`, inside `Modal.tsx`;
  - the frozen legacy `app/components/studio/ExportDialog.tsx`.

  The store's only Modal user is `/cart`'s remove confirmation (`ConfirmDialog` → `Modal`, default skin). It needs cart items, so it cannot be opened in the cloud (no backend); DS1 proves the default at unit level.
- **B's in-page experiments at HEAD** (`probe/exp-studio-only-classes/`, `probe/exp-studio/`):
  - Adding the Studio classes alone changes nothing. The standard `scrollbar-color` wins over `::-webkit-scrollbar`.
  - Forcing `scrollbar-color: auto` while `styled-scrollbar` stays gives a **4 px bar with an invisible thumb**: the unlayered width wins, and the Studio thumb's `border-2` eats it.
  - So `styled-scrollbar` must be **removed** from the Studio dialogs, not overridden.

## 2. Rulings (B, D-29z1534; tech-lead in `b-round-433/sketch-review.md`)
1. **The Modal gets an optional prop.** `scrollbarClassName?: string`, default `'styled-scrollbar'`, replaces the hard-coded token. `ConfirmModal` and the legacy dialog keep the store look byte for byte. The default is unchanged for every caller that does not pass the prop.
2. **New dialog skin.** `STUDIO_DIALOG_SCROLLBAR_CLASS` is the Studio lane skin without `[scrollbar-gutter:stable]`. `STUDIO_SCROLLBAR_CLASS` becomes `'[scrollbar-gutter:stable] ' + STUDIO_DIALOG_SCROLLBAR_CLASS`, byte-identical to HEAD (DS3 pins it).
   - **Why there is no gutter:** a stable gutter would narrow the non-scrolling Export dialog at 1440 by 10 px. B measured that the sheet and the Export dialog keep their HEAD geometry without it: the search box is 660 px wide, the columns sit at x 385/731 and 305/651, and the Export dialog is 560 px wide with a 558 px client at 1440.
3. **Both Studio dialogs** pass `scrollbarClassName={STUDIO_DIALOG_SCROLLBAR_CLASS}`.
4. **The look matches the other Studio scrollers:**
   - a 10 px bar;
   - a warm `bg-dim` thumb, 5.38:1 against the surface;
   - `foreground` on hover, 14.78:1 (`probe/contrast.txt`);
   - no teal.

   No new colour and no new token.
5. **Firefox** ignores `::-webkit-scrollbar`, so the Studio dialogs there get the OS default bar, as the Studio lanes already do (TL-R434-01). Doc 282 records this so nobody "fixes" it with a `scrollbar-color`. The Firefox half goes to TLM-SABA-B-12-FIREFOX-SAFARI.
6. **The prop replaces the default skin.** Doc 282 states this (TL-R434-04): Studio passes only `STUDIO_DIALOG_SCROLLBAR_CLASS`. No code comment is added (project rule).
7. **DS4's reach is the top-level `app/components/arrangement/*.tsx`.** That is the same reach as SF2 and PG2 (round 433 ruling 8), and every Studio Modal lives there today [K8d]. DS4 also proves the legacy dialog still uses the default. This is ruled, not a finding (TL-R434-02).
8. **Doc line 4** is exactly `**სტატუსი:** In Progress (stage 3b of 4; C round 434 PASS)`.

## Reference: how Ableton Live 12 does it
| Point | Source | Live | CZABA | C checks |
|---|---|---|---|---|
| Scrollbar look in a scrolling panel | no reference found. B fetched the Live 12 manual pages [Working with the Browser](https://www.ableton.com/en/live-manual/12/working-with-the-browser/) and [Arrangement View](https://www.ableton.com/en/live-manual/12/arrangement-view/) on 2026-11-10 and searched the full HTML: "scroll bar" 0 hits, and "scrollbar" appears only in page scripts (`b-round-433/reference-scrollbar.txt`). The text describes scrolling actions, not the bar's look | — | Same skin as every other Studio scroller (`bg-dim` thumb, `foreground` on hover) | Row 4 |
| Behaviour | not changed this round | — | Wheel and drag scrolling unchanged; only the paint changes | Row 4 `sheet-overflows`, geometry rows |

This is a visual-consistency fix inside CZABA's own theme. Deviations: none; the Obsidian & Brass theme rules.

## Why we missed it (SABA-B-12)
- Saba named scrollbars on 2026-11-10, but the stage list B wrote (D-29z1514) covered only spin buttons, radios, progress and the search cancel. B found the gap at round 432 (D-29z1529).
- **Cause:** the cloud RETRO screen reviews and C rows use Playwright headless, which passes `--hide-scrollbars`, so their screenshots could not show a scrollbar. (B did not audit the pre-cloud rounds.)
- **Lesson (this planning):** L61 is amended in place: its parts list now names the scrollbar, and it states the `--hide-scrollbars` trap and the `ignoreDefaultArgs` rule (lessons.md stays at 60 lines; the previous copy is `b-round-433/lessons-before-434.md`). C row 6 checks it [K22].

## 3. What A changes (sketch `b-round-433/sketch-434.patch.txt`, sha256 `8aed38f329cada7b…` [K10])
1. **A1:** run the claims at the start.
2. **Apply the sketch.** From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-433/sketch-434.patch.txt`, then `git apply ../tmp/studio-real-loop/b-round-433/sketch-434.patch.txt`.
   - It touches 5 files: 4 modified (`Modal.tsx`, `studio-scrollbar.ts`, `ArrangementShortcutSheet.tsx`, `ArrangementExportDialog.tsx`) and 1 new (`studio-dialog-scrollbar.test.tsx`).
   - **Do not edit those five files afterwards.**
   - If you or your reviewer find a Medium or worse in the sketch, STOP (L11).
3. **Docs:** create `docs/implementation/2026/quarter-IV/282-saba-b-12-dialog-scrollbar.md` in Georgian, with English technical terms. It contains:
   - line 4 exactly as ruling 8, and TEMPLATE's 7 `## ` headings in order (L26);
   - rulings 1–7 and the §0/§1 HEAD facts, including the two in-page experiments;
   - the browser table from `b-round-433/probe/compare.txt` and `compare-head.txt`, and the numbers from `probe/contrast.txt`;
   - a mutant block that copies the 9 lines of `b-round-433/mutants/summary.txt` byte for byte;
   - the stage list: 1, 2a, 2b and 3 done; 3b this round; 4 (selects) in REVIEW-RECOMMENDATIONS;
   - the Firefox note (ruling 5) and the prop note (ruling 6);
   - a TODO with TLM-SABA-B-12-FIREFOX-SAFARI and the ARCH checkpoint (`b-round-433-checkpoint-request.md`).

   Cite only rows that exist: DS1–DS4.
4. **Report.** Write `a-round-434.md` as you go:
   - changed files;
   - each check with its rc and log path (`a-round-434/`);
   - which primitives and lessons you read;
   - reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-433/grants-434.txt`, 6 paths)
- `app/components/ui/Modal.tsx` (sketch only)
- `app/components/arrangement/studio-scrollbar.ts` (sketch only)
- `app/components/arrangement/ArrangementShortcutSheet.tsx` (sketch only: 1 import + 1 prop)
- `app/components/arrangement/ArrangementExportDialog.tsx` (sketch only: 1 import + 1 prop)
- `app/lib/arrangement/__tests__/studio-dialog-scrollbar.test.tsx` (new, sketch only: DS1–DS4)
- `docs/implementation/2026/quarter-IV/282-saba-b-12-dialog-scrollbar.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 4 ` M` and 2 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-433/claims-434.sh` at the start | Equals `claims-434-planning-output.txt` (K13 by location); stderr empty |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-433/covering-files.txt)` (30 files: the new suite, every suite that renders the sheet or the Export dialog, the scrollbar constant users, strings, store-theme tokens) | rc 0; **30 files, 442/442** (`b-round-433/precheck-covering.log` [K18]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 for each. On B's sketch: typecheck rc 0; lint rc 0 with 205 warnings and 1 info, the same as HEAD (`precheck-lint.log` [K15c]) |
| A4 | `npx biome check` on the 5 granted code and test files | 0 errors. `Modal.tsx` keeps its 5 HEAD warnings (a11y, pre-existing) |
| A5 | Claims at the end | Differs from the planning output only in these lines:<br>• K2: `2 ?? 4 M total 6`<br>• K5: `no` (already applied)<br>• K6: doc 282 is last, with its line 4<br>• K8: `styled-scrollbar-literal 1 prop-decl 1 default 1`<br>• K8b: `dialog-const 1 gutter 1 lane-const 1`<br>• K8c: `sheet 1 export 1 legacy 0`<br>• K17: one each of `it('DS1` … `it('DS4`<br>Also: K3 1,338 rc 0; K4 rc 0; K19 `L58 OK` |
| A6 | `code-reviewer` on the diff and the doc (6 files) | No Critical, High or Medium in the sketch logic, otherwise STOP (L11). TL-R434-* items are not new findings. Fix doc findings in the doc only |

**Timeout headroom (L31):** DS1–DS4 took 113 ms in total in B's run. A test in the new file above 50 % of its timeout is a STOP. Record `render-budget` R11-P1e's time (round 433: 979 ms of 5 s).

## 6. C's acceptance
**Before hand-off:** write `c-round-434.json` with all L57 fields (`mutantRedOnSketch` = `b-round-433/mutants/summary.txt`) and run `python3 -I tools/l57-check.py c-round-434.json c-round-434/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4, 4b and 5 (browser), then the rest. Write `c-round-434/progress.json` after every row. Never run vitest while a browser probe runs (L38). Run no second dev server while row 5 runs.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation; stderr empty; K19 `L58 OK`. Status shows only the 6 granted paths. Frozen 1,338 rc 0. Protected rc 0. `a-round-434.md` lists the primitives and lessons A read |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-434.patch.txt` to a `git archive HEAD` scratch and `cmp` the 5 files against the working tree: identical. The patch has 5 `diff --git` headers [K10]. A2's command gives 30 files, 442/442 |
| 3 | **MUTANTS** | Base = HEAD + the sketch only:<br>1. `git archive HEAD \| tar -x -C /tmp/c434-mut`; symlink `node_modules`; `git apply` the sketch.<br>2. Copy `b-round-433/mutants/run.py` to `c-round-434/mutants/`.<br>3. Run `python3 -I c-round-434/mutants/run.py /tmp/c434-mut $PWD/c-round-434/mutants`. Never write into `b-round-433/`.<br>**Pass = the same 9 lines as B's `summary.txt`** [K16]:<br>M1 Modal ignores the prop → DS2<br>M2 sheet without the prop → DS4<br>M3 Export without the prop → DS4<br>M4 `styled-scrollbar` kept beside the skin → DS2<br>M5 dialog skin keeps the gutter → DS3<br>M6 lane skin loses the gutter → DS3<br>M7 store default changed → DS1<br>M8 legacy dialog opts in → DS4<br>sketch green 4/4 |
| 4 | **DIALOG SCROLLBAR IN THE BROWSER (L61)** | Real Chromium on `/studio-lab` at :5173 (A's tree), **1440×900 and 1280×720**, a fresh context per viewport, **launched with `ignoreDefaultArgs: ['--hide-scrollbars']`** (the probe does this; headless hides bars otherwise).<br>**Run:** copy `b-round-433/probe/{scrollbar-probe.mjs,compare-scrollbar.py}` and B's HEAD result `b-round-433/probe/head/` to `c-round-434/probe/`. Run `node <abs>/c-round-434/probe/scrollbar-probe.mjs http://127.0.0.1:5173 <abs>/c-round-434/probe/after none`, then `python3 -I c-round-434/probe/compare-scrollbar.py c-round-434/probe/after`.<br>**Pass: `ALL OK (2 cells)`** (B's sketch: `b-round-433/probe/compare.txt`; HEAD gives `NOT ALL OK`, `compare-head.txt`).<br>**Per viewport that means:**<br>• the sheet still scrolls, with computed `scrollbar-color`/`scrollbar-width` `auto` and no `styled-scrollbar` class;<br>• a 10 px bar, the same as the Library scroller;<br>• **0 teal pixels** in the right 13 px strip (HEAD about 1,750);<br>• more than 500 warm thumb pixels, and the thumb turns bright on hover;<br>• the search box is 660 px wide, with the two columns at HEAD's x;<br>• Export: 560 wide with no gutter. At 1440 it fits with no bar (client 558). At 1280 it scrolls with a 10 px bar, 0 teal and a warm thumb; focus is inside the dialog;<br>• 0 page errors.<br>**Also look at the crops yourself:** `*-sheet-edge.png` (warm thumb, no teal) and `1280x720-export-edge.png`.<br>**Environment:** warm `/studio-lab` once before the first cell. A cold first load that times out is environment (L38): retry, never FAIL |
| 4b | **NEIGHBOUR: SEARCH CLEAR (hidden-bar harness)** | Copy `b-round-433/probe/neighbour-clear/{clear-probe.mjs,compare-clear.py}` to `c-round-434/probe/clear/`. Run `node <abs>/c-round-434/probe/clear/clear-probe.mjs http://127.0.0.1:5173 <abs>/c-round-434/probe/clear/after`, then `python3 -I c-round-434/probe/clear/compare-clear.py c-round-434/probe/clear/after`. **Pass: `ALL OK (2 cells)`**, including `input-box-670x38` (B on the sketch: `b-round-433/probe/neighbour-clear/compare.txt`). The 670 is the hidden-bar width; with visible bars it is 660 at HEAD and on the sketch (row 4) |
| 5 | **AUTH** (fresh context, no credentials, both viewports) | Copy `b-round-429/probe/g430-auth.cjs`. Run it once as a **warm-up** with `OUT=<abs>/c-round-434/auth/warmup` (not judged), then the measured attempt with `OUT=<abs>/c-round-434/auth`. Baseline: `c-round-433/auth/measured.log`, pass true.<br>**Pass:**<br>• demo `/studio-lab` opens with the demo badge and `auth_user` null;<br>• `/studio/middle-east` shows "Sign in required" at 0.5, 3 and 10 s, with 0 `audio[src]` and no workspace;<br>• `/api/studio-token?product=middle-east&file=mix.wav` without auth → 401; bare → 400;<br>• no body contains a token.<br>Any read with a workspace or `audio[src]` > 0 is **Critical**.<br>**BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud). It does not make `browserVerified` false |
| 6 | **DOCS** | Doc 282:<br>• line 4 byte-exact as ruling 8;<br>• the 7 TEMPLATE headings in order;<br>• a mutant block equal to the 9 lines of `b-round-433/mutants/summary.txt`;<br>• cites only DS1–DS4;<br>• states the Firefox note, the prop note and the Tech Lead row.<br>Also: `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits, and `lessons.md` has ≤ 60 lines with L61 naming `scrollbar` and `--hide-scrollbars` [K22] |
| 7 | **SOURCE-SCOPE end + L57** | As row 1, at the end: the end claims equal the start claims; `git diff HEAD --stat` lists only the 4 granted modified files; the 2 new files are untracked. `tools/l57-check.py` OK |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** Put them under `"gate"`, never under `"passed"` |

**Neighbours that could break, and where they are covered:**
- the store default for `ConfirmModal` and the legacy dialog (DS1, DS4);
- the Studio lane scrollers (DS3 byte pin; Library reference in row 4);
- sheet search geometry and the two-column wrap (row 4), and round 433's search Clear contract under the default hidden-scrollbar harness (row 4b);
- Export focus (row 4 and the covering Export suites).

**Ableton conformance:** the look has "no reference found" (above), and behaviour is unchanged. C reports CZABA-requirement status and conformance separately.
