# Round 431: SABA-B-12 stage 2a (STUDIO-VIS-2) — the Export dialog radios are drawn by the theme, not the browser

**Planned by:** B, at the round 430 → 431 planning, 2026-11-10 (`b-round-430.md`). The advisor was consulted after orientation. The round-430 task is archived as `tasks/round-430.md` [K12].
**Decisions:** D-29z1515 … D-29z1520 (`backlog.json` v412) [K14].

## Read first
- **`lessons.md` in full** (A: at least the A self-check part and L1, L4, L12, L13, L15, L23, L26, L28, L58, L61). A self-reported in round 430 that it read primitives and lessons only partly; this round C row 1 asks A's report to list what it read.
- **Primitives, before you apply the sketch:** `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`.
- **Template round:** `tasks/round-430.md` with `c-round-430.md`. Where this task differs, this task wins.
- **Claims:** `bash b-round-430/claims-431.sh` (override `ROOT=`/`LOOP=` if needed). B's planning output on the real store: `b-round-430/claims-431-planning-output.txt` (stderr `claims-431-planning.err` empty). K13 passes when every id is located (backlog or archive) and none is `NOT-FOUND`. B also ran it on a scratch copy with the sketch applied and committed (no doc): `b-round-430/claims-431-sketch-output.txt`; the expected differences are in `b-round-430/claims-431-planning-vs-sketch.diff` (K1 there is the scratch commit, not a real head).
- **Sketch review (L58):** `b-round-430/sketch-review.md` names the dispatched sha256 `18d59a2fbe599fa8…`. tech-lead verdict approve-with-lows, no Medium; all three Lows (TL-R431-01…03) are already applied in the dispatched sketch. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `5a30894`, clean tree
- Gate 430 is `published` at `5a30894…` on both remotes; that commit is the baseline [K1]. `git status` is empty [K2].
- **Frozen files:** `b-round-430/r431-frozen-sha256.txt` has **1,330** entries: every tracked file except the 4 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected files:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `5a30894` at A1 because root published in between, accept a root-only commit that leaves `git diff 5a30894 HEAD -- app` empty, and note it. STOP only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 430 passed** (D-29z1515): C PASS, 0 bugs, `browserVerified` true [K20]. B re-ran L57 (OK), the spin compare (ALL OK, 6 cells), the mutant lines (identical) and auth (pass). Gate 430 published `5a30894`; its review has only Lows (D-29z1516). **SABA-B-12 stage 1 is done.**
- Round 430's fixed outcome: REGRESSION-2026-11-13 if planning falls on or after 2026-11-13 (today is 2026-11-10 [K7]), otherwise **SABA-B-12 stage 2**. STEM-LANES still has no Saba answer [K21].
- **Stage 2 is split** (D-29z1517, full scope kept): **2a = the 6 radios (this round)**; 2b = the `<progress>` bar (SABA-B-12-STAGE-2B-PROGRESS, next UI round), because its determinate and indeterminate states need a repeatable real-Chromium hold recipe first (L58), and DXL7c/DXL8 pin its tokens.
- **What Saba sees today (B, real Chromium at HEAD, `b-round-430/probe/head/`):** every radio is the browser's own 13×13 control (`appearance: auto`) tinted by `accent-brand`; the Video radio has no class at all. Root table: STUDIO-VIS-2 **High / Next**.

## 1. What the code does today (tagged)
- `ArrangementExportDialog.tsx` has **6** `type="radio"` inputs [K8]: format WAV / MP3 / Both / Video (disabled, no class), scope Whole project / Time selection (disabled without a range, and both scope radios disabled while rendering). 5 carry `className="accent-brand"`; it is the only arrangement file with radios.
- Each radio sits in a card `<label>` with `border-brand bg-brand/10` when selected and `border-outline` otherwise (unchanged this round).
- The one global focus style is `:focus-visible { outline: 1.5px … brand 80% ; outline-offset: var(--focus-offset, 2px) }`, suppressed under `html[data-focus-source="pointer"]` [K8d]. Tokens `outline-strong`, `brand-hover`, `brand-foreground` exist [K8e].
- Pinned tests that collide (L23) [K8c]: DXA7 (`affordance-colour-ui.test.tsx`, KEPT `accent-brand` = 5) and DXL8 (`label-status-colour-ui.test.tsx`, `accent-brand` = 5). DXL7c (progress `accent-foreground`) is **not** touched this round [K8b].
- Browser facts at HEAD (both viewports): Tab stops in the dialog = Close, wav, mp3, both, project, Done, Export WAV; ArrowDown cycles wav → mp3 → both → wav (skips disabled Video); a mouse press on a radio does not match `:focus-visible`.

## 2. Rulings (B, D-29z1517)
1. **Option (b), not `sr-only`** (product-designer consult, 2026-11-10): a theme-drawn dot on the real input. Reasons: the global ring stays on the input (no second ring style, no hidden focusable, L1); selection keeps a shape cue (hollow ring vs brass ring with dark centre), so it is not colour-only (WCAG 1.4.1/1.4.11); native arrow-key cycling and forced-colors stay. The audit text leaned to `sr-only`; this is the product-designer's own choice with the trade-off recorded.
2. **One shared constant** `STUDIO_RADIO_CLASS` in new `app/components/arrangement/studio-radio.ts` (the `studio-fader.ts` pattern): `size-4 shrink-0 appearance-none rounded-full border border-outline-strong bg-transparent checked:border-4 checked:border-brand checked:bg-brand-foreground enabled:not-checked:hover:border-brand-hover disabled:cursor-not-allowed disabled:opacity-50 forced-colors:appearance-auto`. Applied as `className={STUDIO_RADIO_CLASS}` to **all 6** radios, Video included. `accent-brand` leaves the dialog.
3. **Card highlight stays** as the secondary cue and the large target. No text, label, layout, keyboard or export behaviour changes. Label boxes stay within ±1 px of HEAD (B measured 0).
4. **States:** unchecked = hollow `outline-strong` ring; checked = brass ring, dark centre; disabled = the same shape at 50 % opacity (Video, Time selection without a range, and both scope radios while rendering = disabled-checked); hover changes only an enabled unchecked ring (to `brand-hover`); keyboard focus = the global ring around the 16 px dot; mouse press = no ring; **forced colours** = the system radio (`forced-colors:appearance-auto`). B verified every state in real Chromium on the sketch (rows 4 and 4b).
5. **Motion:** no new transition token (TL-R431-01: the unlayered global `input { transition … }` rule wins over utilities; its 150 ms colour fade is pre-existing and unchanged).
6. **Guard scope (RD2):** top-level `app/components/arrangement/*.tsx`; any `<input>` without a literal `type="…"` fails, so a radio cannot hide behind a spread or a variable. `app/components/recordings/SfxSceneExport.tsx` keeps a native radio: outside `/studio-lab`, carried to STORE-REDESIGN acceptance (TL-R430-10). Doc 279 lists this.
7. **Firefox/Safari:** Chromium only in the cloud. TLM-SABA-B-12-FIREFOX-SAFARI now also covers the radio dot (deadline RETRO 435). It does not make `browserVerified` false.
8. **Screen budget:** nothing persistent is added or removed; the row does not apply.
9. **Docs:** new doc `279-saba-b-12-export-radios.md` [K6: 278 is the last]. l.4 exactly `**სტატუსი:** In Progress (stage 2a of 4; C round 431 PASS)` (L28). Doc 278 is not edited.

## Reference: how Ableton Live 12 does it
| Point | Source | Confirmed or inferred | CZABA after this round | C check |
|---|---|---|---|---|
| Live's Export Audio/Video dialog uses **choosers** (Rendered Track, File Type, Sample Rate, Bit Depth) and on/off **options** (Encode PCM, Encode MP3, Normalize…), not radio dots | Live 12 manual **5.1.3 Exporting Audio and Video**, https://www.ableton.com/en/live-manual/12/managing-files-and-sets/ (read 2026-11-10) | Confirmed (manual text names the control types; it says nothing about their visual style) | Pre-existing difference, unchanged: our dialog keeps card radios (Saba-approved F11/COPY-PD export design). This round changes only how the dot is drawn | none (not changed) |
| Live never shows an OS-default control in its dialogs | — | **Inferred** (Live draws its own UI; not measured) | No browser-drawn radio left in the Studio export dialog | Row 4 |
| Keyboard: Tab between controls, arrows within a group | Live 12 manual **42 Keyboard Shortcuts** (general navigation) | Inferred for radios specifically | Unchanged native behaviour: Tab stops equal HEAD; ArrowDown cycles the enabled format radios | Row 4 |

**Deviations:** the card radios vs Live's choosers (pre-existing, Saba-approved design; not a new difference, so no new Saba question under L44). Ableton conformance for C: dialog control types = deliberate pre-existing difference; drawn-by-app = inferred.

## Why we missed it (SABA-B-12, already written at D-29z1514)
Same cause as stage 1: screen reviews looked at stills and nobody listed a native control's browser-drawn parts as a row. **L61** already exists and covers radios and progress. No new lesson this round; C row 6 checks L61 still exists.

## 3. What A changes (sketch `b-round-430/sketch-431.patch.txt`, sha256 `18d59a2fbe599fa8…` [K10])
1. **A1:** run the claims at the start.
2. From `store/`: `git apply --check ../tmp/studio-real-loop/b-round-430/sketch-431.patch.txt`, then `git apply ../tmp/studio-real-loop/b-round-430/sketch-431.patch.txt`. It touches 6 files: 4 modified and 2 new. **Do not edit those six files afterwards.** If you or your reviewer find a Medium or worse in the sketch, STOP (L11).
3. **Docs:** create `docs/implementation/2026/quarter-IV/279-saba-b-12-export-radios.md` in Georgian with English technical terms: l.4 exactly as ruling 9; TEMPLATE's 7 `## ` headings in order (L26); rulings 1–9; the HEAD facts of §1; the browser table from `b-round-430/probe/compare.txt` plus the contrast numbers from `b-round-430/probe/contrast.txt`; a mutant block copying the 7 lines of `b-round-430/mutants/summary.txt` byte for byte; the stage list (1 done, 2a this, 2b progress, 3 search cancel, 4 selects deferred); TODO: stage 2b, the RD2 limits (ruling 6), TLM-SABA-B-12-FIREFOX-SAFARI. Cite only rows and files that exist (RD1, RD2, RD3, DXA7, DXL8).
4. Write `a-round-431.md` as you go: changed files; each check with rc and log path (`a-round-431/`); which primitives and lessons you read; reviewer findings; a For B section with any Architecture note.

## 4. Grants (`b-round-430/grants-431.txt`, 7 paths)
- `app/components/arrangement/ArrangementExportDialog.tsx` (sketch only: 1 import, 5 class swaps, 1 class added on Video)
- `app/components/arrangement/studio-radio.ts` (new, sketch only)
- `app/lib/arrangement/__tests__/studio-radio.test.ts` (new, sketch only: RD1, RD2)
- `app/lib/arrangement/__tests__/export-dialog-a11y-copy.test.tsx` (sketch only: import + RD3)
- `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` (sketch only: RADIO_PATH + DXA7 tables)
- `app/lib/arrangement/__tests__/label-status-colour-ui.test.tsx` (sketch only: DXL8 counts)
- `docs/implementation/2026/quarter-IV/279-saba-b-12-export-radios.md` (new, whole file)
- **Nothing else.** At the end `git status --short --untracked-files=all` shows 4 ` M` and 3 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-430/claims-431.sh` at the start | Equals `claims-431-planning-output.txt` (K13 by location); stderr empty |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-430/covering-files.txt)` (29 files: every test file that references the Export dialog, its radios or its testids, the colour pins, `render-budget`, and the new `studio-radio`) | rc 0; **29 files, 384/384** (`b-round-430/precheck-a2.log` [K18]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each. On B's sketch: typecheck rc 0; lint rc 0 with 205 warnings and 1 info, the same as HEAD (`b-round-430/precheck-lint.log`). B's full vitest on the sketch: 269 files, 4,004 tests, rc 0 (`precheck-full.log`; gate row, not A's) |
| A4 | `npx biome check` on the 6 granted code and test files | rc 0, no fixes (`b-round-430/precheck-biome6.log`) |
| A5 | Claims at the end | Differs from the planning output only in: K2 (`3 ?? 4 M total 7`), K2b 0, K5 `no` (already applied), K6 (doc 279 last, its l.4), K8 (`radios 6 accent-brand 0 radio-class-uses 6 constant-file present`), K8c (`DXA7-kept 0 DXL8-accent5 0 DXL7c-progress 1`), K17 (`1 RD1 1 RD2 1 RD3`), all equal to `claims-431-sketch-output.txt`. K3 1,330 rc 0; K4 rc 0; K19 `L58 OK` |
| A6 | `code-reviewer` on the diff and the doc (7 files) | No Critical/High/Medium in the sketch logic, otherwise STOP (L11). TL-R431-* items are not new findings. Fix doc findings in the doc only |

**Timeout headroom (L31):** whole-file times in B's full run on the sketch (`precheck-full.log`): `label-status-colour-ui` 10 tests 2,361 ms, `affordance-colour-ui` 7 tests 2,176 ms (default 5 s per test), `export-dialog-a11y-copy` 10 tests 1,837 ms (15 s describe timeout), `studio-radio` 2 tests 34 ms. Gate 430 `verify.log`: 2,418 / 2,078 / 1,615 ms. No test is near 50 % of its timeout; a covering test above that in A's run is a STOP.

## 6. C's acceptance
**Before hand-off:** write `c-round-431.json` with all L57 fields (`mutantRedOnSketch` = `b-round-430/mutants/summary.txt`) and run `python3 -I tools/l57-check.py c-round-431.json c-round-431/l57-check.txt`.
**Order (L59):** row 3 (mutants) first, then rows 4, 4b and 5 (browser), then the rest. Write `c-round-431/progress.json` after every row. Never run vitest while a browser probe runs (L38); no second dev server while row 5 runs.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation; stderr empty; K19 `L58 OK`. Status shows only the 7 granted paths. Frozen 1,330 rc 0. Protected rc 0. `a-round-431.md` lists the primitives and lessons A read |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-431.patch.txt` to a `git archive HEAD` scratch and `cmp` the 6 files against the working tree: identical. The patch has 6 `diff --git` headers [K10]. A2's command gives 29 files, 384/384 |
| 3 | **MUTANTS** | Base = HEAD + the sketch only: `git archive HEAD \| tar -x -C /tmp/c431-mut`; symlink `node_modules`; `git apply` the sketch; `git init && git add -A && git commit`; copy `b-round-430/mutants/run.py` to `c-round-431/mutants/`; run `python3 -I c-round-431/mutants/run.py /tmp/c431-mut $PWD/c-round-431/mutants`. Never write into `b-round-430/`. **Pass = the same 7 lines as B's `summary.txt`** [K16]: MU-RD-ONE-ACCENT and MU-RD-VIDEO-BARE → DXA7, DXL8, RD2, RD3 red; MU-RD-NO-FORCED, MU-RD-NATIVE, MU-RD-HOVER-CHECKED → RD1 red; MU-RD-NEW-RADIO, MU-RD-SPREAD-TYPE → RD2 red |
| 4 | **RADIOS IN THE BROWSER (L61)** | Real Chromium on `/studio-lab` at :5173 (A's tree), **1440×900 and 1280×720**, fresh context per viewport. Copy `b-round-430/probe/{radio-probe.mjs,compare-radio.py}` and B's HEAD results `b-round-430/probe/head/` to `c-round-431/probe/`; run `OUT=<abs>/c-round-431/probe/after node <abs>/c-round-431/probe/radio-probe.mjs`, then `python3 -I c-round-431/probe/compare-radio.py c-round-431/probe after`. **Pass: `ALL OK (2 cells, 6 radios each)`** (B's final sketch: `b-round-430/probe/compare.txt`). That means per viewport: computed `appearance: none`, box 16×16 on all 6; checked ring `rgb(201, 164, 106)` 4 px with dark centre, unchecked ring `rgb(115, 107, 96)` 1 px; hover changes an enabled unchecked ring only (checked and disabled unchanged); label boxes ±1 px of HEAD; Tab stops equal HEAD; ArrowDown cycles wav → mp3 → both → wav with `:focus-visible` on mp3; a mouse press does not match `:focus-visible`; 0 page errors. **Also look at the crops yourself:** `*-rest`, `*-hover`, `mp3-key-focus` (ring around the dot), `wav-mouse-pressed` (no ring), `both-checked` and the full `*-dialog.png`: no OS radio anywhere, disabled Video and Time selection show the faded hollow ring. **Record (not assert):** contrast of the unchecked ring vs the card (B: 3.5:1) and the brass ring vs the selected card (B: 6.74:1) from computed colours. Warm `/studio-lab` once before the first cell; a cold first load that times out is environment-invalid and is retried |
| 4b | **FORCED COLOURS + DISABLED-CHECKED + EXPORT** | Copy `b-round-430/probe/{radio-extra-probe.mjs,compare-extra.py}`; run `OUT=<abs>/c-round-431/probe/after-extra node <abs>/c-round-431/probe/radio-extra-probe.mjs`, then `python3 -I c-round-431/probe/compare-extra.py c-round-431/probe/after-extra`. **Pass: `EXTRA ALL OK (2 cells)`** (B's sketch: `b-round-430/probe/compare-extra.txt`; HEAD gives NOT OK). That means per viewport: with `emulateMedia({ forcedColors: 'active' })` all 6 radios compute `appearance: auto` (the system radio comes back); while a WAV export renders, the Whole-project scope radio is disabled and checked, its first sample `appearance: none`, and 250 ms later opacity `0.5` with the brass ring `rgb(201, 164, 106)` 4 px; the WAV download completes (L54 journey: dialog → render → file); 0 page errors. Look at `*-forced-colors-dialog.png` and `*-project-disabled-checked.png` yourself. A render that ends before the 250 ms sample is environment (retry), not a FAIL |
| 5 | **AUTH** (fresh context, no credentials, both viewports) | Copy `b-round-429/probe/g430-auth.cjs` and run it with `OUT=<abs>/c-round-431/auth`. Baseline `c-round-430/auth/g428-auth.json` pass true. Pass: demo `/studio-lab` opens with the demo badge and `auth_user` null; `/studio/middle-east` shows "Sign in required" at 0.5, 3 and 10 s, with 0 `audio[src]` and no workspace; `/api/studio-token?product=middle-east&file=mix.wav` without auth → 401; bare → 400; no body contains a token. Any read with a workspace or `audio[src]` > 0 is **Critical**. **BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud); it does not make `browserVerified` false |
| 6 | **DOCS** | Doc 279 l.4 byte-exact as ruling 9; the 7 TEMPLATE headings in order; mutant block equal to the 7 lines of `b-round-430/mutants/summary.txt`; cites only rows that exist (RD1, RD2, RD3, DXA7, DXL8); states the RD2 limits and the Tech Lead row. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. `lessons.md` still has L61 and ≤ 60 lines [K22] |
| 7 | **SOURCE-SCOPE end + L57** | As row 1 at the end; end claims equal start claims; `git diff HEAD --stat` lists only the 4 granted modified files; the 3 new files untracked. `tools/l57-check.py` OK |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** Put them under `"gate"`, never under `"passed"` |

**Retries (rows 4–5):** a cold first load, a port in use or an overlapped job is environment (L38): retry at most twice; never a FAIL. A row that fails on a valid setup is a finding.

**Ableton conformance (C reports separately):** dialog control types = deliberate pre-existing difference (choosers in Live, card radios here); drawn-by-app = inferred; keyboard = unchanged.

## 7. The new rows and their mutants (`b-round-430/mutants/run.py`; logs in `b-round-430/mutants/`)
| Row | File | What it proves | Red under |
|---|---|---|---|
| RD1 | studio-radio | The shared class is exactly the token-only dot, has no `accent-*`, keeps `forced-colors:appearance-auto`, and the hover excludes checked | MU-RD-NO-FORCED, MU-RD-NATIVE, MU-RD-HOVER-CHECKED |
| RD2 | studio-radio | The only arrangement file with radios is the Export dialog; each of its 6 radio tags carries `className={STUDIO_RADIO_CLASS}`; no `<input>` hides its type | MU-RD-ONE-ACCENT, MU-RD-VIDEO-BARE, MU-RD-NEW-RADIO, MU-RD-SPREAD-TYPE |
| RD3 | export-dialog-a11y-copy | All 6 rendered radios (2 disabled) have exactly the shared class | MU-RD-ONE-ACCENT, MU-RD-VIDEO-BARE |
| DXA7, DXL8 (replaced counts) | affordance-colour-ui, label-status-colour-ui | `accent-brand` 0, `STUDIO_RADIO_CLASS` 6, `checked:border-brand` 1 (equal or stronger than the old 5) | MU-RD-ONE-ACCENT, MU-RD-VIDEO-BARE |

**Neighbouring behaviour that could break:** AN1–AN4 radio names/descriptions and label-click selection; export-range scope switching; export-cancel and export-progress (scope radios disabled while rendering); dialog focus trap and tab stops (`export-dialog-tab-stops`, `export-dialog-focus*`); render counts (`render-budget`). All are in the covering set.

## 8. Outcome, fixed in advance (for the 431 → 432 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | The gate publishes; stage 2a done. Round 432 = REGRESSION-2026-11-13 if planning falls on or after 2026-11-13; otherwise **SABA-B-12 stage 2b** (the `<progress>`; B first proves a hold recipe for both states at HEAD), unless Saba answers STEM-LANES |
| A Medium+ finding in the changed code | Round 432 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |
