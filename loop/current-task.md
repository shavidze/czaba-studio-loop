# Round 451: SYS-R450-STORE-STYLE-SCAN — one shared style-scan test helper; the teal and gradient-text suites move onto it and close one Medium and six Lows (test-only)

**Planned by:** B at the round 450 → 451 planning, 2026-11-11 (`b-round-450.md`). The advisor was available and was consulted after orientation and before writing. The round-450 task is archived as `tasks/round-450.md`, a byte-identical copy.

## Decisions
All are in `backlog.json` (v439 → v440) under `decisions_log_b`.
- **D-29z1602: round 450 accepted.**
  - C round 450 PASS: 0 bugs, `browserVerified`/`realVerified` true. The fake-bearer premium path is BLOCKED because the backend is unavailable in the cloud.
  - B's L57 run is `L57 OK` (`b-round-450/l57-check-c450.txt`).
  - Gate 450 was `skipped` because no source changed, so the baseline stays gate 449's `a8599a2` [K1]. RETRO-450 is done.
  - C's two notes are logged as INFO:
    - INFO-C450-CAPTURE-CONCURRENCY: running two browser scripts at once broke one capture.
    - INFO-C450-RT-CAUSE-VIA-SCRIPTS: RT-CAUSE was checked through the script outputs, without reopening every source file.
- **D-29z1603: round 451 = SYS-R450-STORE-STYLE-SCAN.**
  - `regression-last.json` is 2026-11-10 [K26], so REGRESSION is due on or after 2026-11-13, not now.
  - The systemic task's order is "before STORE-2b-3b".
  - It owns the only open Medium the loop can run, A-R449-REVIEW-GT1-TSX.
- **D-29z1604: rulings on the sketch** (§2, §3, §5).

## Rules
- **Read `lessons.md` first.** This is the first task under **L4 "Port preserves HEAD"** (RETRO 450): every HEAD pin is mapped in §4, mutants run both ways (§6), and the extraction has a golden test (G1, §1 step 4).
- **Not applicable in a test-only round:** reference-first, the Ableton conformance table, the product-designer step and the screen budget. Nothing visible changes.
- **L57:**
  - C's JSON carries all L57 fields.
  - `mutantRedOnSketch` names `b-round-450/mutants.txt` and `b-round-450/head-mutants/mutants.txt`.
  - Every bug carries an enum `origin`.
  - Before hand-off, C runs `python3 -I tools/l57-check.py c-round-451.json c-round-451/l57-check.txt` and gets rc 0.
- **L29:**
  - Each fact about `store/` ends with a `[K#]` tag. The commands are in `b-round-450/claims-451.sh`, which runs from any directory.
  - B's outputs are `b-round-450/claims-451-planning-output.txt` (HEAD) and `b-round-450/claims-451-sketch-output.txt` (the sketch, run with `STORE_ROOT=/tmp/b451-scratch`).
- **L60:** A never uses `git stash`, `git checkout --` or shell string edits in the store tree. Apply the sketch with `git apply` (§1), then use the editor tools.
- **Speed rules:** A runs `npm run typecheck`, `npm run lint` and the covering files only. C does not run the full suite. Full verify is a gate row.

## Baseline: HEAD `a8599a2`, clean tree
- **Gate:** gate 449 published `a8599a2`, and gate 450 is `skipped` [K1]. HEAD is `a8599a2` [K2].
- **Frozen files:**
  - `b-round-450/r451-tree-sha256.txt` lists every tracked file except the grants, **1,366** entries. From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-450/r451-tree-sha256.txt` gives rc 0.
  - The 11 protected files in `b-round-318/protected-sha256.txt` also check rc 0 [K3].
- **Grants:** 5 paths, listed in `b-round-450/grants-451.txt`. No other file in `store/` may change [K4].

| Path | What may change |
|---|---|
| `app/lib/__tests__/helpers/style-scan.ts` | New file: the shared helper |
| `app/lib/__tests__/store-teal-sweep.test.ts` | Port onto the helper; TS3 gains the zero-offset glow check; new TS6 |
| `app/lib/__tests__/store-gradient-text.test.ts` | Port onto the helper; GT1 scans every app CSS file; new GT1b, GT4b and GT5b; GT4 and GT5 gain probes and entries |
| `app/lib/__tests__/studio-naming.test.tsx` | Only the NM2 local variable is renamed, `glow` → `emphasis` [K10]; the assertions stay byte-identical |
| `docs/implementation/2026/quarter-IV/295-sys-r450-store-style-scan.md` | New implementation doc; number 295 is free [K21] |

**Frozen and read only:** `app/styles/studio.css` and `app/styles/pages/studio.css` (legacy Studio, under Saba's legacy policy; both exist and have 0 clip lines today [K5] [K6]). They are **scanned, never edited**.

Ruling line: *`studio.css` and `pages/studio.css`: "frozen legacy" wins over "scan roots include them".* The scan reads them, and a hit there fails GT1. The fix for such a hit belongs to the legacy removal, never to an edit in this round.

## 0. Why this round
- **The class it closes.** The RETRO 450 systemic task (D-29z1601, `tech-lead`) removes one whole class of problem: the style guards scan too narrowly or parse too loosely.
- **The ids it closes** (7 [K23]):
  - A-R449-REVIEW-GT1-TSX (Medium).
  - TL-R449-L3-SCAN-ROOTS, A-R447-REVIEW-L2, A-R447-REVIEW-L3, TL-R449-L4-PARSER-QUOTES, A-R449-REVIEW-L-FILL-REGEX and A-R449-REVIEW-L-TEST-HYGIENE (all Low).
- **No live regression today.** The only script gradient-text hits are 3 lines in the dead `CinemaCurtainLoader.tsx` [K7]. Its only references are the two barrels [K8].
- **Why now:** the next Store stage, 2b-3b (glow shadows), should start with guards that see TSX, legacy CSS and inline glows.

## 1. What A does
1. **Read the primitives first** (L60: before any edit, including the `git apply`) that the hook maps for `app/lib/__tests__/**`: `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, and `AGENT_DISCOVERABLE_CODE.md` (for the new exports).
2. **Apply the sketch.** From `store/`, run `git apply ../tmp/studio-real-loop/b-round-450/sketch-451.patch.txt`.
   - Its sha256 is in `b-round-450/sketch-451.sha256`, and the review in `b-round-450/sketch-review.md` names it [K13].
   - B ran `git apply --check` with this exact command from `store/` at HEAD: rc 0 (`b-round-450/apply-check.txt`) [K32].
   - Apply it as is; §5 assigns no fix-ups. Any other change you want is a STOP (L11).
   - Afterwards, `sha256sum -c ../tmp/studio-real-loop/b-round-450/sketch-files-sha256.txt` from `store/` gives rc 0. The 4 sketch files are byte-equal to B's scratch at `da459e5` [K29].
3. **Run the checks** and save the logs under `a-round-451/`:
   - `npm run typecheck`;
   - `npm run lint`;
   - the covering set: `npx vitest run app/lib/__tests__/store-teal-sweep.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/studio-naming.test.tsx`.

   Compare with B's sketch results:
   - typecheck rc 0; lint rc 0 with 205 warnings, the same as HEAD [K18];
   - covering run: 3 files, 16 tests passed (`b-round-450/precheck-covering.log`) [K31];
   - the full suite on the sketch (a gate row, for information only): 282 files, 4,128 tests [K19].
4. **Run the golden test (G1).**
   - Copy `b-round-450/golden/style-scan-golden.test.ts` into `app/lib/__tests__/` of a **throwaway clone** of your tree (`git clone --shared`, with `node_modules` symlinked). Never put it in `store/`.
   - Run it with `GOLDEN_OUT=<loop>/a-round-451/golden.json`. It must pass with `equal: true`.
5. **Code-reviewer:** 4 files change, so ask it once. Every Medium+ it raises is a STOP unless §5 already rules on it (L11, L22).
6. **Write implementation doc 295** with the template headings (L26). Line 4 is exactly `Completed (C round 451 PASS)` (L28). Cite only tests that exist.

## 2. What changes (the sketch)
**`helpers/style-scan.ts`** exports:
- `APP_ROOT` and `PERF_ROOT`;
- the extension regexes;
- `listFiles`, `readFrom` and `readApp`;
- `countTealHits`: HEAD's per-line `gi` count with the pattern verbatim;
- `countZeroOffsetGlowHits` and `countScriptGradientTextHits` (both over the whole source, not per line);
- `hitsByFile`, `hitsByRootedFile` and the typed `SCRIPT_SCAN_ROOTS` table (`app`, `perf`);
- `resolvedImports(source, importer)`: `import`/`export … from` and dynamic `import()` specifiers, with `~/` and relative paths resolved, the extension and `/index` stripped, and the bound names and namespace flag;
- `cssGradientTextHits`: HEAD's parser, plus a one-pass tokenizer (comments blanked, `{};` blanked inside strings), `@apply bg-clip-text`, and alpha-zero fills (any alpha-0 `rgb`/`rgba`, `#rgb0`, `#rrggbb00`);
- `allowListViolations`, which uses `Object.hasOwn`;
- one shared `StyleScanAllowListEntry` / `StyleScanAllowList` type.

**store-teal-sweep:**
- TS1–TS5 keep their meaning, constants, allow-list and counts.
- TS3 now also fails on a zero-offset glow in any shadow layer, where the blur is non-zero (`[1-9]`, a fraction such as `.5rem` or `0.5px`, `var(`, or `${`): inline `boxShadow`/`textShadow` (also wrapped onto the next line, ternaries and `inset`), Tailwind `shadow-[…]`/`drop-shadow-[…]`/`text-shadow-[…]`, `[box-shadow:…]`/`[text-shadow:…]`, `drop-shadow(0 0 …)` (also with `_`), and CSS `box-shadow`/`text-shadow`. A shadow value span stops at `;`, `}` or a `, key:` and is bounded to 300 characters.
- The new **TS6** probes the glow scanner: 19 spellings hit; 7 do not (3 offset shadows, 2 `0 0 0 1px` rings, a `margin: '0 0 12px'` after `boxShadow: 'none',`, and `rgb(0 0 20 / 0.5)` inside an offset shadow).

**store-gradient-text:**
- **GT1** reads every CSS file under `app/`: 5 files [K5], including the frozen legacy Studio CSS and `assets/fonts/fonts.css`. The allow-list key is now `<file> <selector>`: `styles/app.css .loading-brand` with 3 hits.
- The new **GT1b** scans every `.ts` and `.tsx` file under `app/` and `perf/` (tests excluded). It looks for:
  - the classes `bg-clip-text`, `[background-clip:text]` (also with `_`), `[-webkit-background-clip:text]` and `[-webkit-text-fill-color:<transparent value>]`;
  - inline or assigned `WebkitBackgroundClip`/`backgroundClip` (quoted key, `=` assignment, any case) whose value within 200 characters before `,` `}` or `;` contains `'text'` (ternaries and a value wrapped onto the next line included), and `style.setProperty('-webkit-background-clip', 'text')`;
  - inline `WebkitTextFillColor` set to a transparent value;
  - the whole CSS pattern, so CSS text inside a `<style>` block, a template or an HTML/e-mail string is scanned too.

  Its allow-list is `app/components/loading/CinemaCurtainLoader.tsx` with 3 hits [K7].
- **GT4** also requires `styles/studio.css` and `styles/pages/studio.css` in the scan. It gains two probes:
  - quoted `{;}`, alpha-zero fills and `@apply`: the result is `['.r', '.s', '.t', '.w', '.x']`; `rgb(0 0 0)` without alpha and `rgba(0,0,0,0.5)` are not hits;
  - a comment marker inside strings (`content:"/*"` … `"*/"`): the result is `['.b']`;
  - an `Object.hasOwn` probe using `toString`.
- The new **GT4b** probes the script scanner: 17 spellings hit once each, 4 near-misses do not, the live scan contains the CinemaCurtainLoader key, and the roots are `['app', 'perf']`.
- **GT5** adds `CinemaCurtainLoader` to `DEAD_COMPONENTS`, and `components/audio/index.ts` and `components/index.ts` to the barrels.
- The new **GT5b** guards the two dead modules with common names in `TEAL_ALLOW_LIST`, `components/audio/Timeline.tsx` and `lib/email.server.ts`, by resolved import (a name guard cannot work: the word `Timeline` is in live files). A file uses a dead module when it imports the module itself, or imports `Timeline` or a namespace from one of its barrels (`components/audio`, and the root `components`, which does `export * from './audio'` [K28]). Today no file outside their own file and the barrels imports them [K27]. It carries 11 positive and 4 negative probes.

**Unchanged:** `store-header-footer.test.tsx` lines 124, 187 and 196, which assert that `.text-glow` is absent [K10].
- **Ruling D-29z1604-a:** these asserts stay as deliberate header-level redundancy with GT3. They are not deleted (L4: no assertion lost).
- This ruling closes that sub-point of the hygiene Low.

## 3. Rulings
- **D-29z1604-b: the teal scan stays TS/TSX-only.** CSS teal belongs to STORE-2b-3c. GT1 adds CSS roots for gradient clips only.
- **D-29z1604-c: TS3 stays on the 9 granted files.**
  - Today the zero-offset glow scanner finds 5 hits in 4 files [K9] [K17]: `CinemaCurtainLoader` 2, `PurchaseHeader` 1, `GlobalPlayhead` 1 and `routes/store.tsx` 1. Source: `b-round-450/golden/golden-sketch.json` → `extra.zeroOffsetGlowApp`.
  - They are STORE-2b-3b's inventory, not this round's, and are not asserted app-wide here.
- **D-29z1604-d: A-R447-REVIEW-L3** (the perf root) was already met by TS5 in round 448. The port keeps it through the helper's `PERF_ROOT`, and mutant N4 proves the perf root is live.
- **D-29z1604-e: honest scope note.** HEAD already caught the `drop-shadow-[0_0_` class, because HEAD's token `shadow-[0_0_` is a substring of it: head mutant N3b is red at HEAD [K15]. A-R447-REVIEW-L2's real gaps were the inline `boxShadow`, a wrapped second layer and `textShadow` (N3, N3c, N3d: green at HEAD, red on the sketch).
- **D-29z1604-f: allow-list key format.** GT1b keys carry the root prefix (`app/…`) because GT1b scans two roots; the teal and GT3 lists scan one root and keep HEAD's bare paths (tech-lead review 1, Low 8).
- **D-29z1604-h: not fixed here (info).** Fills written as `hsl(… / 0)`, `color-mix(…)` or `var()`, and comments that mention a spelling (they count as hits, which fails safe), are logged as INFO-TL-R451-FILL-FORMS.
- **D-29z1604-g: the walker stays HEAD-identical** (it scans untracked files and follows symlinks; golden G1). Logged as INFO-TL-R451-WALKER-HOST, not changed here.

## 4. HEAD pin map (L4)
Every HEAD assertion and constant maps to an equal or stronger row on the sketch.

| HEAD pin | Sketch |
|---|---|
| TS1: unexpected teal files = [] | TS1, via `allowListViolations(...).unexpected` |
| TS2: `MIN_SCANNED_SOURCES` 200, the 9 granted files listed, allow-list counts 1/5/5/7/1/1 | TS2 with the same constants, via `.drifted` |
| TS3: `GLOW_TOKENS` and teal on the granted files | TS3, the same tokens **plus** the zero-offset glow |
| TS4: SpotlightLoader has no clip tokens | TS4 unchanged |
| TS5: perf has ≥ 10 files and 0 teal | TS5, via `listFiles(PERF_ROOT, …)` |
| GT1: CSS selector allow-list `.loading-brand`: 3, over `app.css` and `styles/base/*` | GT1 over **all** app CSS, key `styles/app.css .loading-brand`: 3 |
| GT2: `--gradient-text` absent in css/ts/tsx | GT2 unchanged |
| GT3: retired classes in 3 dead files, 1 each (whole-file count) | GT3, via `hitsByFile` (whole-file count) |
| GT4: `app.css` and `base/utilities.css` in the list, ≥ 200 scripts, probe `['.b','.b','.d','.d','.d']` | GT4, the same **plus** the legacy CSS, the quote/alpha probe and the `hasOwn` probe |
| GT5: 4 dead components, 3 barrels | GT5 **plus** `CinemaCurtainLoader` and the audio barrel; GT5b adds the two dead modules by import specifier |
| Per-line `gi` teal count; `__tests__` skipped; sorted walk | The helper's `countPerLine` and `listFiles` (golden G1: equal) |

**Golden G1** runs HEAD's functions, copied verbatim, against the helper on the same tree. Result: `equal: true`. Sizes [K16]:
- 349 app scripts and 17 perf scripts;
- 5 CSS files and 354 styled files;
- 6 teal files;
- 1 CSS selector;
- 3 GT3 files;
- 5 probe hits.

## 5. Sketch review
`b-round-450/sketch-review.md` (`tech-lead`) names the dispatched sha256 and has a verdict [K13]. There were three reviews:
- **Review 1, on v2:** APPROVE-WITH-CHANGES, 5 Mediums. All were fixed in v3.
- **Review 2, on v3:** APPROVE-WITH-CHANGES, 2 Mediums. Both were fixed in v4.
- **Review 3, on v4 (the dispatched sketch):** **APPROVE**, no Medium+. Its 4 Lows go to `deferred_low_polish` as TL-R451-L1…L4 (2026-10-23 bug gate; 0 live cases). A changes none of them in this round.

There are **no fix-ups for A**: apply v4 as is.

**Ruled residuals.** If A's code-reviewer raises one of these again, it is already ruled. It is not a STOP and is not re-filed (L7: add `confirmedBy`):
- deferred Lows: TL-R451-L1-RESOLVER-COMMENTS, TL-R451-L2-SIDE-EFFECT-IMPORT, TL-R451-L3-RESOLVER-FORMS, TL-R451-L4-BRACKET-KEY;
- INFO-TL-R451-FILL-FORMS, INFO-TL-R451-GLOW-CALC, INFO-TL-R451-WALKER-HOST and TL-R451-CODE4-TEAL-TEXT-SHADOW (scheduled for STORE-2b-3c);
- signal SIG-R451-STYLE-SCAN-ENGINE-POLICY;
- rulings D-29z1604-a…i.

A reviewer finding outside this list at Medium+ is a STOP (L11, L22).

## 6. Pre-check evidence (B, on the sketch)
- **Mutants on the sketch:** `b-round-450/mutants.txt`, 54 lines (BASE plus 53 mutants: P1–P9, M1–M11 and 33 N-mutants) [K14]; the table is `b-round-450/mutants.py`, the runner `b-round-450/run-mutants.sh`. BASE is green.
  - The HEAD-pin mutants P1–P9 and the round-448 mutants M1–M11 turn red at the predicted rows. M6 (a commented-out rule) stays green by design.
  - One mutant per closed id, each red on the sketch:

    | Mutant | Red row |
    |---|---|
    | N1, N1b, N1c, N1d (CSS text in a template), N1e (perf root) | GT1b |
    | N2, N2b (legacy CSS) | GT1 |
    | N3, N3b, N3c (wrapped second layer), N3d (`textShadow`) | TS3 |
    | N4 | TS5 |
    | N5, N5b (two-pass tokenizer) | GT4 |
    | N6 | GT4 and GT4b |
    | N6b | GT1 |
    | N7 | GT4 |
    | N7b | GT1 |
    | N8 | GT5 |
    | N8b (`Timeline` import), N8c (`email.server` import), N8d (relative path), N8e (namespace import), N8f (root barrel), N8g (resolver namespace off) | GT5b |
    | N9, N9b (ring guard removed), N9d (integer-only blur), N9e (span crosses into the next property) | TS6 |
    | N9c (`.5rem` blur in a granted file) | TS3 |
    | N10 | GT4b |
    | N10b (`setProperty`), N10c (value wrapped onto the next line) | GT1b |
- **The same mutants on HEAD:** `b-round-450/head-mutants/mutants.txt` [K15].
  - Green at HEAD, so the gap is real: N1, N1b, N1c, N1d, N1e, N2, N2b, N3, N3c, N3d, N6b, N7b, N8, N8b, N8c, N8d, N8e, N8f, N9c, N10b and N10c.
  - Red at HEAD: N3b (see D-29z1604-e).
  - The helper-only mutants show `EDIT-FAILED`, because HEAD has no helper.
- **Typecheck, lint and the full suite on the sketch:** [K18] [K19].
- **Timeouts (L31):** at gate 449 the covering files took 158 ms, 334 ms and 406 ms, against the 5 s default [K20].

## 7. Acceptance (C)
C runs from a clean copy of A's tree wherever a row needs edits. Destructive work stays under `c-round-451/` (L60).

| # | Row | Pass when |
|---|---|---|
| C1 | SOURCE-SCOPE, start and end | Changed paths ⊆ `grants-451.txt`; `r451-tree-sha256.txt` rc 0; protected files rc 0 |
| C2 | CLAIMS | Re-run `b-round-450/claims-451.sh` from `store/` on A's tree. Every line equals B's sketch output (`claims-451-sketch-output.txt`) except two: K2, which equals the planning output (`a8599a2`, because A does not commit), and K21, which becomes `doc-next 1 last 295-sys-r450-store-style-scan.md`. Empty stderr |
| C3 | APPLY | From `store/`, `sha256sum -c ../tmp/studio-real-loop/b-round-450/sketch-files-sha256.txt` gives rc 0 (the 4 files, the untracked helper included, equal the sketch) [K29] |
| C4 | COVERING | The 3 covering files pass. These rows exist: TS1–TS6, GT1, GT1b, GT2, GT3, GT4, GT4b, GT5, GT5b [K12] |
| C5 | GOLDEN G1 | `golden/style-scan-golden.test.ts`, run in a throwaway clone of A's tree, passes with `equal: true` and the same sizes as [K16] |
| C6 | MUTANTS on A's tree | Build `S=/tmp/c451-src` as `git clone --shared` of `store`. Copy A's 4 grant files plus the doc into it (`cp --parents`) and commit inside the clone only. Then run `SRC=$S OUT=<loop>/c-round-451/mutants bash <loop>/b-round-450/run-mutants.sh`. `mutants.txt` equals `b-round-450/mutants.txt` line for line (54 lines). Write `mutantRedOnTree` |
| C7 | HEAD control | Build `H=/tmp/c451-head`, a clone at `a8599a2`. Run `SRC=$H OUT=<loop>/c-round-451/head-mutants IDS="BASE $(python3 -I <loop>/b-round-450/mutants.py --list \| tr ' ' '\n' \| grep '^N' \| tr '\n' ' ')" bash <loop>/b-round-450/run-mutants.sh`. The output equals `b-round-450/head-mutants/mutants.txt` (34 lines) |
| C8 | NO-WEAKENING | Each HEAD `expect(` in the two suites has its mapped §4 row. The `grep -c "expect("` count per file on A's tree equals `b-round-450/expect-counts.txt` (teal 10 vs HEAD 8; gradient 23 vs HEAD 10; naming 6 vs 6) [K30]. `store-header-footer.test.tsx` is unchanged (manifest) |
| C9 | DOC 295 | Template headings in order (L26); line 4 is `Completed (C round 451 PASS)` (L28); every cited row id exists; no `pending` |
| C10 | G451-AUTH (browser, 1440×900 and 1280×720) | Round 450's G450-AUTH recipe, verbatim. In a fresh anonymous context, open `/studio-lab`, then `/studio/middle-east` (warm both first with one untimed browser load, L38), then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header. Expected: `localStorage.auth_user` is null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns 401. Baseline at this same HEAD: `c-round-450/auth-smoke.json` [K33]. The fake-bearer premium path is BLOCKED (backend unavailable in cloud) |
| C11 | STUDIO-SMOKE (browser, both viewports) | Enter adds a clip, Play moves the position, Stop holds it, and Export opens and closes with Esc. A sanity row: this round changes no runtime code |
| C12 | L57 | `tools/l57-check.py` rc 0 |
| gate | Full verify, typecheck, build, lint | `gates/gate-round-451.json` |

**What could break nearby:** nothing at runtime, because only tests change. The real risk is a weaker guard, and C6–C8 cover it. STORE-2b-3b will edit these suites' allow-lists next, so the helper's export names are the contract.

## 8. After this round
- **Round 452:** REGRESSION-2026-11-13 if it is planned on or after 2026-11-13. Otherwise STORE-2b-3b (glow shadows: the 5 zero-offset hits in [K17], plus `--shadow-glow` and `ui/Button`).
- **Then, in order:** 2b-3c, 2b-3d with the dead-file deletion, 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, then phase 2 under the skip rule.
- **Next RETRO:** round 465.

## claims
`b-round-450/claims-451.sh`, K1–K33. Outputs: `b-round-450/claims-451-planning-output.txt` (HEAD) and `b-round-450/claims-451-sketch-output.txt` (sketch).
