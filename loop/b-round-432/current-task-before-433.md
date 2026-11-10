# Round 432: SABA-B-12 stage 2b — the Export dialog progress bar is drawn by the theme, not the browser

**Planned by:** B, at the round 431 → 432 planning, 2026-11-10 (`b-round-431.md`). The advisor was consulted after orientation. The round-431 task is archived as `tasks/round-431.md` [K12].
**Decisions:** D-29z1521 … D-29z1526 (`backlog.json` v414) [K14].

## Read first
- **Lessons that apply this round, one line each** (`lessons.md` is 54 KB; read these ids in full there if a line is unclear):
  - L11: report a STOP at the top of `a-round-432.md` and change nothing else.
  - L12: never select by styling class in tests.
  - L13: guards parse whole tags.
  - L15: put the contrast you introduce in the doc (B's numbers are in `probe/contrast.txt`).
  - L26: the doc cites only rows that exist.
  - L28: doc l.4 is final as written.
  - L38: never overlap vitest with a browser probe.
  - L54: one journey row through to the downloaded file.
  - L57: write the harness fields in `c-round-432.json`.
  - L58: every asserted number is B's run on the final sketch.
  - L59: do not end C early.
  - L60: destructive commands stay inside your own round folder.
  - L61: native control chrome is a row.
- **Primitives, before you apply the sketch:** `AGENT_DISCOVERABLE_CODE.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `docs/implementation/TEMPLATE.md`. `a-round-432.md` lists what you read, fully or partly.
- **Template round:** `tasks/round-431.md` with `c-round-431.md`. Where this task differs, this task wins.
- **Claims:** `bash b-round-431/claims-432.sh` (override `ROOT=`/`LOOP=` if needed). B's planning output on the real store is `b-round-431/claims-432-planning-output.txt`; its stderr, `claims-432-planning.err`, is empty. K13 passes when every id is located (backlog or archive) and none is `NOT-FOUND`. B also ran the script on a scratch copy with the sketch applied and no doc, saving `claims-432-sketch-output.txt`; the expected differences are in `claims-432-planning-vs-sketch.diff`. K1 there is the scratch commit, not a real head.
- **Sketch review (L58):** `b-round-431/sketch-review.md` names the dispatched sha256 `55d39d7577826fc9…`. The verdict is approve-with-lows with no Medium. TL-R432-02 and -05 are applied; the rest are ruled there. K19 runs `tools/l58-check.py current-task.md` and must print `L58 OK`.

## Baseline: HEAD `1197dcb`, clean tree
- Gate 431 is `published` at `1197dcb…` on both remotes, so that commit is the baseline [K1]. `context/head-sha.txt` and the gate's `head` field still say `5a30894`; both are stale. `git status` is empty [K2].
- **Frozen files:** `b-round-431/r432-frozen-sha256.txt` has **1,335** entries: every tracked file except the 2 granted existing files. `sha256sum -c` gives rc 0 [K3].
- **Protected files:** the 11 files in `b-round-318/protected-sha256.txt` are unchanged, and none is granted [K4]. No auth, route, purchase or download file is touched.
- If K1 is not `1197dcb` at A1 because root published in between, accept a root-only commit that leaves `git diff 1197dcb HEAD -- app` empty, and note it. STOP only if K5 is `no` or K3 is not rc 0.

## 0. Why this round
- **Round 431 passed** (D-29z1521): C PASS, 0 bugs, `browserVerified` true [K20]. B re-judged C's own probe JSONs: ALL OK and EXTRA ALL OK (`b-round-431/recompare/`). The mutant lines are identical and auth passes on attempts 2 and 3. Gate 431 published `1197dcb` with COMMIT OK. **Stage 2a (STUDIO-VIS-2) is done.**
- Round 431's fixed outcome was REGRESSION-2026-11-13 if planning falls on or after 2026-11-13. Today is 2026-11-10 [K7], so this round is **stage 2b**. STEM-LANES still has no Saba answer [K21].
- **What Saba sees today** (B, real Chromium at HEAD, both viewports, `b-round-431/probe/head-final/`):
  - While a WAV export renders, the bar is **Chromium's default green fill on a grey track** with square ends. `accent-foreground` does not reach it.
  - While the MP3 encoder loads, the bar is a flat grey browser bar.
  - Crops: `head/1440x900-determinate.png` and `head/1440x900-indeterminate.png`.

## 1. What the code does today (tagged)
- `ArrangementExportDialog.tsx` has **one** `<progress>`, at l.569–576 [K8], `className="h-2 w-full accent-foreground"`.
  - It renders only under `{isRendering && progress ? (` and carries `value={progress.fraction ?? undefined}` and `aria-valuetext={progressText ?? undefined}` [K8b].
  - It is the only arrangement file with a `<progress>`. `app/components/recordings/SfxSceneExport.tsx` has another one outside `/studio-lab` (SABA-B-12-RECORDINGS-NUMBER → STORE-REDESIGN acceptance).
- **Phases** (`export-progress.ts`):
  - `render`, `wav` and `mp3` are determinate. The value goes back to 0 when render switches to wav, and the label changes in the same frame.
  - `load` is indeterminate: `ArrangementContext.tsx` sets `{ phase: 'load', fraction: null }` before `import('~/lib/arrangement/mp3-encoder.client')` [K8f]. In the browser that is the request `/app/lib/arrangement/mp3-encoder.client.ts`.
- **Pinned tests that collide (L23)** [K8c], both in `label-status-colour-ui.test.tsx`:
  - DXL7c asserts the bar's tokens include `accent-foreground`.
  - DXL8 counts `'h-2 w-full accent-foreground'` = 1.
- **Tokens and CSS** [K8e]: `outline-hover` #2e2a26 and `foreground` #ece6da exist. `app.css` has no global `progress` rule.

## 2. Rulings (B, D-29z1524)
1. **Keep the native `<progress>` and add one shared constant** (product-designer consult, 2026-11-10). `STUDIO_PROGRESS_CLASS` goes in the new `app/components/arrangement/studio-progress.ts`, following the `studio-radio.ts` pattern. It is applied as `className={STUDIO_PROGRESS_CLASS}`.
   - Rejected: `div role=progressbar`. It rebuilds semantics the browser already gives, breaks the `tagName PROGRESS` pins and adds a second pattern.
2. **Look:**
   - Keep the `h-2 w-full` box: 494×8 px on both viewports, the same as HEAD.
   - `appearance-none rounded-full overflow-hidden`.
   - Track `bg-outline-hover` on the element (Firefox) and on `::-webkit-progress-bar` (Chromium).
   - Fill `bg-foreground` on `::-webkit-progress-value` and `::-moz-progress-bar`, with rounded ends.
   - The fill stays **neutral**: DXL7c's deliberate colour role is kept, with no brass and no `accent-*`.
   - No width transition.
3. **Indeterminate (MP3 encoder load):** a dimmed full track `indeterminate:bg-foreground/30` (on the element, on `::-webkit-progress-bar` and on `::-moz-progress-bar`, TL-R432-02), plus `motion-safe:indeterminate:animate-pulse`. That is Tailwind's built-in keyframe, so `app.css` gets no new one. Under `prefers-reduced-motion: reduce` the bar is the same dimmed bar, static.
   - Rejected (a), an empty track: it reads as "0 %" or "stalled", and the load can last up to 120 s.
   - Rejected (c), a sliding segment: it needs a new `@keyframes`, which breaks Tailwind-first, and it is too much motion for a step that usually takes under 2 s.
4. **Forced colours:** `forced-colors:appearance-auto` brings back the system bar.
   - In Chromium's *emulated* forced colours, HEAD and the sketch both draw an all-white bar in both states (`probe/forced-determinate.txt`). That is pre-existing, so C records it and does not assert it.
   - A real Windows High Contrast check is added to TLM-SABA-B-12-FIREFOX-SAFARI (`scope_r432`).
5. **Unchanged:** text, label, `aria-label`, `aria-valuetext`, the render guard, unmount on done, cancel and error, layout and export behaviour. The reset to 0 between phases stays; Live's export bar also resets for each pass (manual 5.1.3.4, see Reference).
6. **Guard (PG2):** top-level `app/components/arrangement/*.tsx`. The only owner is the Export dialog. The count of `<progress` openings equals the count of self-closing tags, each tag carries the constant, and no `</progress>` closing tag exists (TL-R432-05). `SfxSceneExport.tsx` stays out (above).
7. **Firefox/Safari:** the cloud has Chromium only. TLM-SABA-B-12-FIREFOX-SAFARI now also covers the progress bar (deadline RETRO 435). It does not make `browserVerified` false.
8. **Screen budget:** nothing persistent is added or removed, so the row does not apply. The bar exists only while rendering.
9. **Docs:** create `280-saba-b-12-export-progress.md` [K6: 279 is the last]. Its l.4 is exactly `**სტატუსი:** In Progress (stage 2b of 4; C round 432 PASS)` (L28). Doc 279 is not edited.

## Reference: how Ableton Live 12 does it
| Point | Source | Confirmed or inferred | CZABA after this round | C check |
|---|---|---|---|---|
| A progress bar appears in the Export dialog while it renders | Live 12 manual **5.1.3.5 Real-Time Rendering**: "Once the waiting period is over, the render starts and a progress bar appears in the dialog." https://www.ableton.com/en/live-manual/12/managing-files-and-sets/ (fetched 2026-11-10) | Confirmed (manual text; real-time render case) | A bar in the dialog while rendering (pre-existing); its look now comes from the theme | Rows 4, 4b |
| The bar resets when the render has several passes | Same page, **5.1.3.4 Video Rendering Options**: "the progress bar in the dialog resets for each individual pass." | Confirmed (manual text) | Unchanged and consistent: our bar resets to 0 per phase (render → wav, load → mp3), with the label changing at the same moment | Row 4b (label) |
| Live draws its own UI, never an OS-default bar | — | **Inferred** (not measured) | No browser-drawn bar left in the Export dialog | Row 4 |

"No reference found" for the bar's colour, height or indeterminate animation: the manual 5.1.3 text does not describe them, and no official screenshot was found (B searched the web; a search summary also mentioned a Live 12 beta note about stem-separation progress, which B could not open and does not use).

**Deviations:**
- The neutral cream fill and the pulse are CZABA's own look: the Obsidian theme, and DXL7c's colour role.
- Live has no documented indeterminate state; ours exists because the MP3 encoder loads on first use.

**Ableton conformance for C:** bar present = confirmed (5.1.3.5); per-pass reset = confirmed match (5.1.3.4); drawn by the app = inferred; colour and motion = no reference, CZABA's own design.

## Why we missed it (SABA-B-12, already written at D-29z1514)
Stage 1's cause again: screen reviews looked at stills, and no row listed a native control's browser-drawn parts. The green bar is only visible during a render. L61 already lists `progress`, so no new lesson this round; C row 6 checks that L61 still exists.

## 3. What A changes (sketch `b-round-431/sketch-432.patch.txt`, sha256 `55d39d7577826fc9…` [K10])
1. **A1:** run the claims at the start.
2. **Apply the sketch.** From `store/`, run `git apply --check ../tmp/studio-real-loop/b-round-431/sketch-432.patch.txt`, then `git apply ../tmp/studio-real-loop/b-round-431/sketch-432.patch.txt`.
   - It touches 4 files: 2 modified and 2 new. **Do not edit those four files afterwards.**
   - If you or your reviewer find a Medium or worse in the sketch, STOP (L11).
3. **Docs:** create `docs/implementation/2026/quarter-IV/280-saba-b-12-export-progress.md` in Georgian, with English technical terms. It contains:
   - l.4 exactly as ruling 9, and TEMPLATE's 7 `## ` headings in order (L26);
   - rulings 1–9 and the HEAD facts of §1, including the green fill;
   - the browser table from `b-round-431/probe/compare.txt` and `compare-head.txt`, and the contrast numbers from `probe/contrast.txt`;
   - a mutant block that copies the 8 lines of `b-round-431/mutants/summary.txt` byte for byte;
   - the stage list: 1 done, 2a done, 2b this round, 3 search cancel, 4 selects deferred;
   - the Reference rows (manual 5.1.3.5 and 5.1.3.4);
   - a TODO with stage 3, TLM-SABA-B-12-FIREFOX-SAFARI (Firefox `::-moz-progress-bar` and real High Contrast), and the `SfxSceneExport` bar under STORE-REDESIGN.

   Cite only rows that exist: PG1, PG2, DXL7c, DXL8, PU1, PU2.
4. **Report.** Write `a-round-432.md` as you go:
   - changed files;
   - each check with its rc and log path (`a-round-432/`);
   - which primitives and lessons you read;
   - reviewer findings;
   - a For B section with any Architecture note.

## 4. Grants (`b-round-431/grants-432.txt`, 5 paths)
- `app/components/arrangement/ArrangementExportDialog.tsx` (sketch only: 1 import, 1 class swap)
- `app/components/arrangement/studio-progress.ts` (new, sketch only)
- `app/lib/arrangement/__tests__/studio-progress.test.ts` (new, sketch only: PG1, PG2)
- `app/lib/arrangement/__tests__/label-status-colour-ui.test.tsx` (sketch only: the DXL7c and DXL8 replacements)
- `docs/implementation/2026/quarter-IV/280-saba-b-12-export-progress.md` (new, whole file)
- **Nothing else.** At the end, `git status --short --untracked-files=all` shows 2 ` M` and 3 `??` lines.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | Pass |
|---|---|---|
| A1 | `bash b-round-431/claims-432.sh` at the start | Equals `claims-432-planning-output.txt` (K13 by location); stderr empty |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-431/covering-files.txt)`. That is round 431's 29 covering files (every test file that references the Export dialog, its progress, radios or testids, the colour pins, `render-budget`) plus the new `studio-progress` | rc 0; **30 files, 386/386** (`b-round-431/precheck-a2.log` [K18]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 for each. On B's sketch: typecheck rc 0; lint rc 0 with 205 warnings and 1 info, the same as HEAD (`precheck-lint.log`). B's full vitest on the sketch: 270 files, 4,006 tests, rc 0 (`precheck-full.log`; a gate row, not A's) |
| A4 | `npx biome check` on the 4 granted code and test files | rc 0, no fixes (`precheck-biome4.log`) |
| A5 | Claims at the end | Differs from the planning output only in: K2 (`3 ?? 2 M total 5`), K5 `no` (already applied), K6 (doc 280 last, its l.4), K8 (`progress-tags 1 old-class 0 progress-class-uses 1 constant-file present`), K8c (`DXL7c-accent-foreground 0 DXL8-old-class-1 0`), K17 (`1 PG1 1 PG2`). Also K3 1,335 rc 0; K4 rc 0; K19 `L58 OK` |
| A6 | `code-reviewer` on the diff and the doc (5 files) | No Critical/High/Medium in the sketch logic, otherwise STOP (L11). TL-R432-* items are not new findings. Fix doc findings in the doc only |

**Timeout headroom (L31):** in B's covering run on the sketch, `label-status-colour-ui` takes 10 tests in about 2.4 s whole-file (default 5 s per test) and `studio-progress` takes 2 tests in about 11 ms. A test **in these two files** above 50 % of its timeout in A's run is a STOP. The untouched covering tests are records, not STOPs: `render-budget` R11-P1e took 2,006 ms against the 5 s default in B's run (40 %; A's round 431: 2,142 ms). Report its time.

## 6. C's acceptance
**Before hand-off:** write `c-round-432.json` with all L57 fields (`mutantRedOnSketch` = `b-round-431/mutants/summary.txt`) and run `python3 -I tools/l57-check.py c-round-432.json c-round-432/l57-check.txt`.

**Order (L59):** row 3 (mutants) first, then rows 4, 4b and 5 (browser), then the rest. Write `c-round-432/progress.json` after every row. Never run vitest while a browser probe runs (L38). Run no second dev server while row 5 runs.

| # | Row | Pass |
|---|---|---|
| 1 | **SOURCE-SCOPE start + CLAIMS** | The claims equal the A5 expectation; stderr empty; K19 `L58 OK`. Status shows only the 5 granted paths. Frozen 1,335 rc 0. Protected rc 0. `a-round-432.md` lists the primitives and lessons A read |
| 2 | **PATCH-IDENTITY + UNIT** | Apply `sketch-432.patch.txt` to a `git archive HEAD` scratch and `cmp` the 4 files against the working tree: identical. The patch has 4 `diff --git` headers [K10]. A2's command gives 30 files, 386/386 |
| 3 | **MUTANTS** | Base = HEAD + the sketch only:<br>1. `git archive HEAD \| tar -x -C /tmp/c432-mut`; symlink `node_modules`; `git apply` the sketch; `git init && git add -A && git commit`.<br>2. Copy `b-round-431/mutants/run.py` to `c-round-432/mutants/`.<br>3. Run `python3 -I c-round-432/mutants/run.py /tmp/c432-mut $PWD/c-round-432/mutants`. Never write into `b-round-431/`.<br>**Pass = the same 8 lines as B's `summary.txt`** [K16]:<br>MU-PG-ACCENT → DXL7c, DXL8, PG2 red<br>MU-PG-BRASS-FILL → DXL7c, PG1<br>MU-PG-NO-FORCED, MU-PG-NATIVE, MU-PG-ALWAYS-PULSE, MU-PG-MOZ-IND → PG1<br>MU-PG-CLOSING-PAIR, MU-PG-NEW-BAR → PG2 |
| 4 | **PROGRESS BAR IN THE BROWSER (L61, L54)** | Real Chromium on `/studio-lab` at :5173 (A's tree), **1440×900 and 1280×720**, a fresh context per state.<br>**Run:** copy `b-round-431/probe/{progress-probe.mjs,compare-progress.py}` and B's HEAD result `b-round-431/probe/head-final/` to `c-round-432/probe/`. Run `OUT=<abs>/c-round-432/probe/after node <abs>/c-round-432/probe/progress-probe.mjs`, then `python3 -I c-round-432/probe/compare-progress.py c-round-432/probe/after`.<br>**Pass: `ALL OK (2 cells, 4 states each)`** (B's final sketch: `b-round-431/probe/compare.txt`; HEAD gives `NOT ALL OK`, `compare-head.txt`).<br>**Per viewport that means:**<br>**(a) Hold recipes, all real:** a warm-up MP3 export downloads first. The indeterminate state is held by stalling the `mp3-encoder.client` request with `page.route`; after the release, the MP3 still downloads. The determinate state is a WAV render under CDP CPU throttling ×20; the WAV downloads (the journey: dialog → render → file).<br>**(b) Indeterminate:** no `value` attribute; `appearance: none`; `PROGRESS` box 494×8; radius 9999px; corner pixel = surface (rounded ends); animation `pulse`, with opacity varying ≥ 0.2 across 5 samples 400 ms apart; mid pixel a dimmed neutral (R 100–160).<br>**(c) Reduced motion** (`reducedMotion: 'reduce'`): animation `none`, opacity `1` in every sample, the same dimmed fill.<br>**(d) Forced colours** (`forcedColors: 'active'`): `appearance: auto`.<br>**(e) Determinate:** at least one same-phase screenshot. Its fill width lies within the before/after value bracket ±2 px, the fill colour is `rgb(236,230,218)` ±8, the track is `rgb(46,42,38)` ±6, there are **0 green pixels**, and the corner is surface.<br>**(f)** The bar is gone after done; 0 page errors.<br>**Also look at the crops yourself:** `*-determinate-*.png` (cream fill, graphite track, rounded ends, no green), `*-indeterminate.png` and `*-indeterminate-dialog.png` (dimmed bar with the "Loading MP3 encoder…" label), `*-indeterminate-reduced.png`.<br>**Record (not assert):** `forcedDeterminate` colours in `progress-probe.json`. B saw an all-white bar at HEAD and on the sketch alike. Contrast from computed colours: fill vs track (B: 11.45:1) and fill vs surface (B: 14.78:1).<br>**Environment:** warm `/studio-lab` once before the first cell. A cold first load that times out, a missing warm-up download, or no same-phase shot is environment (L38): retry, never FAIL |
| 4b | **NEIGHBOURS IN THE BROWSER** | Copy `b-round-431/probe/compare-neighbours.py`; run `python3 -I c-round-432/probe/compare-neighbours.py c-round-432/probe/after c-round-432/probe/head-final`. **Pass: `NEIGHBOURS OK (2 cells, 3 load-phase states)`** (B's sketch: `b-round-431/probe/compare-neighbours.txt`). In every load-phase sample (indeterminate, reduced motion, forced colours): the label text equals `aria-valuetext` and HEAD's label; the `aria-label` equals HEAD's; the box x/y/w/h is within ±1 px of HEAD. Label = `aria-valuetext` in the render and wav phases is unit row FV1 (covering set) |
| 5 | **AUTH** (fresh context, no credentials, both viewports) | Copy `b-round-429/probe/g430-auth.cjs`. First run it once as a **warm-up** with `OUT=<abs>/c-round-432/auth/warmup` (not judged; it absorbs the cold legacy-route hydration error seen on attempt 1 in rounds 430 and 431). Then run the measured attempt with `OUT=<abs>/c-round-432/auth`. Baseline `c-round-431/auth/r2/g428-auth.json` pass true.<br>**Pass:**<br>• demo `/studio-lab` opens with the demo badge and `auth_user` null;<br>• `/studio/middle-east` shows "Sign in required" at 0.5, 3 and 10 s, with 0 `audio[src]` and no workspace;<br>• `/api/studio-token?product=middle-east&file=mix.wav` without auth → 401; bare → 400;<br>• no body contains a token.<br>Any read with a workspace or `audio[src]` > 0 is **Critical**.<br>**BLOCKED:** the fake-bearer path with a real backend (backend unavailable in cloud). It does not make `browserVerified` false |
| 6 | **DOCS** | Doc 280:<br>• l.4 byte-exact as ruling 9;<br>• the 7 TEMPLATE headings in order;<br>• a mutant block equal to the 8 lines of `b-round-431/mutants/summary.txt`;<br>• cites only rows that exist (PG1, PG2, DXL7c, DXL8, PU1, PU2);<br>• states the forced-colours record and the Tech Lead row.<br>Also: `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits, and `lessons.md` still has L61 and ≤ 60 lines [K22] |
| 7 | **SOURCE-SCOPE end + L57** | As row 1, at the end: the end claims equal the start claims; `git diff HEAD --stat` lists only the 2 granted modified files; the 3 new files are untracked. `tools/l57-check.py` OK |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** Put them under `"gate"`, never under `"passed"` |

**Retries (rows 4–5):** a cold first load, a port in use or an overlapped job is environment (L38). Retry at most twice; it is never a FAIL. A row that fails on a valid setup is a finding.

**Ableton conformance (C reports separately):**
- bar present while rendering: confirmed (5.1.3.5);
- per-pass reset: confirmed match (5.1.3.4);
- drawn by the app: inferred;
- colour and motion: no reference, CZABA's own design.

## 7. The new rows and their mutants (`b-round-431/mutants/run.py`; logs in `b-round-431/mutants/`)
| Row | File | What it proves | Red under |
|---|---|---|---|
| PG1 | studio-progress | The shared class is exactly the token-only neutral bar: no `accent`/`brand`, the pulse only under `motion-safe:indeterminate:`, the Firefox indeterminate fill, and `forced-colors:appearance-auto` | MU-PG-NO-FORCED, MU-PG-NATIVE, MU-PG-ALWAYS-PULSE, MU-PG-BRASS-FILL, MU-PG-MOZ-IND |
| PG2 | studio-progress | The only arrangement file with `<progress>` is the Export dialog. Every opening is one self-closing tag carrying `className={STUDIO_PROGRESS_CLASS}`, and there is no closing-tag pair | MU-PG-ACCENT, MU-PG-CLOSING-PAIR, MU-PG-NEW-BAR |
| DXL7c (replaced) | label-status-colour-ui | The rendered bar during a pending render has exactly the constant's tokens, neutral fill tokens, and no `accent-foreground` or `accent-brand` | MU-PG-ACCENT, MU-PG-BRASS-FILL |
| DXL8 (replaced counts) | label-status-colour-ui | `accent-foreground` 0 in the dialog source and `className={STUDIO_PROGRESS_CLASS}` 1 (equal to or stronger than the old 1) | MU-PG-ACCENT |

**Neighbouring behaviour that could break:**
- PU1 and PU2 (progress phases, no `value` while loading);
- FV1 (`aria-valuetext` equals the label);
- export-cancel (the bar unmounts);
- the dialog footer layout (`export-dialog-footer`);
- render counts (`render-budget`).

All of them are in the covering set.

## 8. Outcome, fixed in advance (for the 432 → 433 planning)
| C result | Next |
|---|---|
| PASS, no Medium+ | The gate publishes, and stage 2b is done. Round 433 is REGRESSION-2026-11-13 if planning falls on or after 2026-11-13. Otherwise it is **SABA-B-12 stage 3** (the shortcut sheet's search cancel ✕), unless Saba answers STEM-LANES. After stage 3, B asks root for ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS |
| A Medium+ finding in the changed code | Round 433 = its bounded fix-up |
| A STOP from A | B rules on it (L10) before re-dispatch |
| A browser row that could run was not run | `browserVerified` false; B re-plans that half |
