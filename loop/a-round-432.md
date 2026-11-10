# A round 432: SABA-B-12 stage 2b (the Export progress bar is drawn by the theme)

**Status:** implementation complete, handed to C. **No STOP.** No Critical, High or Medium finding in the sketch. No owned test is above 50 % of its timeout.

## Changed files (exactly the 5 granted paths)
`git status --short --untracked-files=all` shows 2 ` M` and 3 `??`:
- ` M app/components/arrangement/ArrangementExportDialog.tsx`: sketch only (1 import, 1 class swap).
- ` M app/lib/arrangement/__tests__/label-status-colour-ui.test.tsx`: sketch only (DXL7c and DXL8).
- `?? app/components/arrangement/studio-progress.ts`: sketch only.
- `?? app/lib/arrangement/__tests__/studio-progress.test.ts`: sketch only (PG1 and PG2).
- `?? docs/implementation/2026/quarter-IV/280-saba-b-12-export-progress.md`: new doc, written by A.

The sketch's sha256 was checked before applying: `55d39d7577826fc9…`. `git apply --check` and `git apply` both gave rc 0. At the end, `git apply -R --check` on the sketch gives rc 0, so the 4 code and test files are byte-identical to the sketch and were not edited after the apply.

## Checks (logs in `a-round-432/`)
| # | Check | Result |
|---|---|---|
| A1 | Claims at the start (`claims-start.txt`; stderr `claims-start.err` is empty) | rc 0. Equal to the planning output except for one K13 line: STUDIO-VIS-2 is now found in `archive` instead of `backlog:open_findings`. It is located (not NOT-FOUND), so K13 passes by location |
| A2 | Covering set: `npx vitest run $(cat …/covering-files.txt)` (`a2-vitest.log`) | rc 0. **30 files, 386/386** |
| A2-t | Timing of the owned files (`a2-timing.log`, verbose) | `studio-progress`: PG1 2 ms, PG2 7 ms. `label-status-colour-ui`: the slowest test is DXL1 at 250 ms (5 %); DXL7c 36 ms, DXL8 3 ms. **None above 50 %.** Record only: `render-budget` R11-P1e took **2,299 ms** against the 5 s default (46 %). B's run: 2,006 ms; round 431: 2,142 ms. It is under 50 % but rising |
| A3 | `npm run typecheck` (`typecheck.log`) | rc 0 |
| A3 | `npm run lint` (`lint.log`) | rc 0. 205 warnings and 1 info, the same as HEAD |
| A4 | `npx biome check` on the 4 granted code and test files (`biome4.log`) | rc 0. Checked 4 files, no fixes applied |
| A5 | Claims at the end (`claims-end.txt`; stderr empty) | Differs from the planning output only in the expected lines: K2 `3 ?? 2 M total 5`; K5 `no`; K6 (doc 280 is the last doc, l.4 exact); K8 `old-class 0 progress-class-uses 1 constant-file present`; K8c `0 / 0`; K17 `1 PG1 1 PG2`. The K13 location line is the same as at A1. K3 frozen 1,335 rc 0; K4 protected rc 0; K19 `L58 OK` |
| A6 | `code-reviewer` subagent on the 5 files | No Critical, High or Medium. The findings are listed below |
| A7 | `npm run build` (`build.log`), run alone with nothing in parallel | rc 0. `build/` is git-ignored. The progress pseudo-element rules in the emitted `app-*.css` (`build-progress-css.txt`) are all **separate** rules: no selector list mixes `::-webkit-*` and `::-moz-*`, so the production minifier cannot make Chromium drop a rule. This answers the reviewer's production-CSS question at the CSS level. The browser probes still run on the dev server |
| A8 | Claims at the end, run again after the last doc edit (`claims-end.txt`) | rc 0, stderr empty, the same expected differences as A5. `/studio-lab` on :5173 answers 200, and `git status` shows the 5 lines |

No browser probe was run by A this round: §5 does not ask for one, and C rows 4, 4b and 5 own it. Nothing ran in parallel with vitest (L38). The dev server on :5173 was left untouched.

## What I read
- **Primitives:** fully, `TAILWIND_FIRST.md` (lines 1–60 before the apply, lines 61–146 after it; neither part has a rule about arbitrary pseudo-element variants) and `GEORGIAN_DOCS.md`; partly, `AGENT_DISCOVERABLE_CODE.md` (rules 1–6), `DESIGN_TOKENS.md` (colours and spacing), `TESTING_QUALITY_GATES.md` (the regression rule and the checklist), `BUG_HUNTING_TESTS.md` (first 40 lines). Fully, `docs/implementation/TEMPLATE.md`.
- **Lessons:** L11, L12, L13, L15, L26, L28, L31, L38, L54, L58, L60 and L61, from `lessons.md`.
- **Pre-flight and context, read late:** I read the `pre-flight` skill and `context/active-summary.md` **after** applying the sketch, not before. Their gate items still hold. Assumptions: the task is B's frozen sketch plus doc 280. Smallest version: the sketch is about 20 lines of code, with no extra abstraction. Files: the 5 grants only. Success: A2–A5. That is A1–A8 in the table above.
- **Also:** the task in full, the sketch patch, `b-round-431/probe/{compare,compare-head,contrast,compare-neighbours,forced-determinate}.txt` and `b-round-431/mutants/summary.txt`. I read doc 279 for the structure.

## Doc 280
- l.4 is exactly `**სტატუსი:** In Progress (stage 2b of 4; C round 432 PASS)`.
- It has the 7 TEMPLATE headings, in order (re-checked with grep after the last edit). The row-id grep was re-run after the last edit too.
- It covers rulings 1–9 and the §1 HEAD facts, including the green fill.
- It has the browser table from compare/compare-head, with the HEAD green pixels at 226–406 across both viewports and both shots.
- It has the contrast from `contrast.txt`.
- Its mutant block is the 8 lines of `summary.txt`, byte for byte. `grep -Fx -f summary.txt` matches doc lines 83–90, in order.
- It has the stage list, the Reference rows for 5.1.3.5 and 5.1.3.4, and a TODO with stage 3, TLM-SABA-B-12-FIREFOX-SAFARI and the `SfxSceneExport` bar.
- The only row ids it cites are PG1, PG2, DXL7c, DXL8, PU1 and PU2, all checked with grep: PU1 and PU2 are in `export-progress-ui.test.tsx`.
- **The reviewer found two doc issues, fixed in the doc only:**
  - ruling 3 now gives the reviewer's inference, marked as not measured: Chromium probably paints two stacked `bg-foreground/30` layers. Their computed colour, ~#837f7a, is close to the measured ~#7f7b76 (4.37:1). One layer would give about 2.5:1, and the pulse's low point is about 1.5:1;
  - the Firefox TODO now names the single-layer risk.
- B's WAV and MP3 download claim in the doc table comes from B's `probe/sketch/*.json` (`wavDownload`, `download`).

## Code-reviewer findings (subagent run, score 8.5/10; none Medium+)
The sketch files are frozen for A ("Do not edit those four files afterwards"), so the code Lows below are passed to B and not fixed:
- **Low, RV432-1:** the indeterminate contrast depends on Chromium painting the two layers on top of each other (`studio-progress.ts:15-17`). In Firefox it may fall to about 2.5:1 (one layer), below the 3:1 non-text guideline. The doc now says so. Suggest adding it to the TLM-SABA-B-12-FIREFOX-SAFARI check.
- **Low, RV432-2:** at its low point, `animate-pulse` takes the bar to about 1.5:1 against the surface. The label and `aria-valuetext` carry the state, and the bar is still under reduced motion. This is a record.
- **Low, RV432-3:** the track against the surface is 1.29:1, so the bar's outline cannot be seen at value 0, which happens on every phase reset. It is already ruled ("track carries no meaning"). Noted so the decision is explicit.
- **Low, RV432-4:** in `label-status-colour-ui.test.tsx:243`, `brassLabelTokens` still exempts `accent-foreground`, and no component uses that class any more. It is a leftover exemption: DXL7c and DXL8 still cover the bar. Removing it is out of this round's sketch.
- **Low, RV432-5:** PG2 passes when it should not if a later `{...spread}` or a `style=` on the same tag overrides the class. It also misses `createElement('progress')` and wrappers in `.ts` files, and it reads only the top-level directory. The cheap hardening is to reject `{...` and `style=` inside the matched tag.
- **Info:** PG1 mirrors the constant, so the browser half depends on C's probe. The reviewer also asked whether the browser probe ran on a production build: if Lightning CSS ever merged `::-webkit-*` and `::-moz-*` selectors, the browsers would drop the rule. B's probe and C's row 4 run on the **dev server** :5173. A7 checked the production CSS at the source level: the rules are separate. It has not been checked in a browser.
- **Architecture note:** none ("the diff adds a class constant, no new state or owner change").

## For B
- RV432-1…5 and the production-build question above are candidates for `deferred_low_polish`, or for an extra row in the stage 3 or RETRO plan. For RV432-5, a hardened PG2 needs a test grant.
- R11-P1e is at 2,299 ms (46 % of 5 s), up from 2,006 and 2,142 ms. It is near the L31 threshold.
- No Architecture note from the reviewer.

## Known gaps
- No browser verification by A. C's rows 3–5 are pending.
- Firefox and Safari, and real High Contrast, are not verified. They are the Tech Lead row. The production bundle was checked as CSS text only (A7), not in a browser.

## Next C checks (from the task §6)
1. Row 3, the mutants on HEAD plus the sketch: the 8 lines must equal `b-round-431/mutants/summary.txt`.
2. Rows 4 and 4b, at 1440×900 and 1280×720: `ALL OK (2 cells, 4 states each)` and `NEIGHBOURS OK (2 cells, 3 load-phase states)`, plus a visual check of the crops.
3. Row 5, auth: a warm-up run, then the measured run.
4. Rows 1 and 7: claims equal the A5 expectation, the status shows the 5 granted paths, frozen 1,335 rc 0, protected rc 0.
5. Row 6, docs: l.4, the headings, the mutant block, the cited rows, the forced-colours record and the Tech Lead row, `lessons.md` L61 and ≤ 60 lines.

## Scope completed
§3 steps 1–4 and A1–A8 are done. These B acceptance rows are met on A's side: A1–A6, plus the extra A7 build check. C's rows 1–7 have not been verified by A and are not claimed.
