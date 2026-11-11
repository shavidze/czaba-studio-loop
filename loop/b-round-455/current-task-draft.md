# Round 456: STORE-2b-3c-2a — one shared CSS rule reader, and proof that the "dead" teal rules really have no mounted consumer

**Planned by:** B, at the round 455 → 456 planning, 2026-11-11 (`b-round-455.md`).
- **Advisor:** available, and consulted after orientation and before writing.
- **Archive:** the round-455 task is saved as `tasks/round-455.md`, a byte-identical copy (`cmp` OK).
- **Baseline:** HEAD `db95f40` = gate 455 `commit` (published) [K1][K2]. `context/head-sha.txt` and the gate's `head` field still name `2e26962`; the `commit` field wins.
- **Type:** test-only (plus two doc lines). No app source, CSS, route or Studio file changes. The reference-first, `product-designer`, screen-budget and journey rules do not apply (policy: "Not in scope: … test-only"). C still runs the Studio and purchase-protection smoke so `browserVerified` stays real.

## Why this round
- **A-R454-REVIEW-M-DEAD-UNCHECKED (open Medium, promised to round 456).** `store-live-teal.test.ts` LT3/LT5/LT6 allow-list teal in rules labelled "dead", but nothing proves those classes have no mounted consumer. Four of the dead tokens do appear in component source today [K6].
- **One CSS parser instead of three.** `store-live-teal.test.ts` has a line-regex rule reader (`hitsByEnclosingRule`, `TOP_LEVEL_HEADER`) [K4], `store-glow-shadow.test.ts` has a second one (`ruleBodiesFor`) [K5], and `helpers/style-scan.ts` has a brace-aware walker only for gradient text [K3]. Signals SIG-R453-CSSRULEBODIES and SIG-R454-HITSBYRULE asked for one nesting-aware reader.
- **Lows owned by the same change:** TL-R454-L-BRACE-PREFIX-HEADER (a `} .live:hover {` line escapes attribution), A-R454-REVIEW-L3 (LT1 sees only top-level exact lines), A-R454-REVIEW-L4 (the `@theme` bucket never closes), A-R453-REVIEW-L-GS-TEST-GAPS (GS2 misses `shadow-glow-accent`, GS3's reader skips nested/quoted braces, GS3 does not assert the `.button-primary` fill).
- **Ruling owed from round 455 (L10):** doc 298 l.4 reads `In Progress (SABA-B-14, round 455)` at HEAD [K10]. It was B's task text that pinned it against lesson L28; the origin is B spec (B-R455-DOC298-STATUS-LINE). This round grants that one line.
- **Order:** the recorded order stands (D-29z1616/1617, D-29z1619): 2b-3c-2a now, then SABA-B-13 (entrance; needs its own `product-designer` consult, reference section and production-build probe), then 2b-3c-2b (the zero-offset glow regex forms A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC, GATE452-L1 — Low/info only). REGRESSION-2026-11-13 runs first if round 457 is planned on or after 2026-11-13.

## What B measured at HEAD `db95f40`
- **Rule-reader keys equal the old allow-list.** On the sketch, `hitsByCssRule` over `styles/app.css` and `styles/base/utilities.css` returns exactly the 23 old `TEAL_RULE_ALLOW_LIST` keys without the trailing ` {`, with the same counts (app.css 37, utilities.css 6) (sketch run: LT3/LT5 green; `b-round-455/precheck-covering.log`).
- **Dead-token consumers** [K6]: `audio-preview-inline-button` → `components/audio/AudioPreviewButton.tsx`; `waveform-bar` → `components/audio/WaveForm.tsx`, `components/product/TrackRow.tsx`; `track-row-waveform` → `components/loading/TrackRowSkeleton.tsx`, `components/product/TrackRow.tsx`; `loading-brand` → `components/loading/PianoLoadingAnimation.tsx`. The other 12 dead tokens have no script consumer.
- **Reachability** (`b-round-455/probe/reach.py`, a Python prototype; `reach-head.txt`) [K7]: from `root.tsx`, `entry.client.tsx`, `entry.server.tsx` and `routes/**` (37 roots, 288 of 349 app scripts reached), TrackRow, WaveForm, TrackRowSkeleton and PianoLoadingAnimation are **unreachable**; AudioPreviewButton and the frozen legacy StemsLoadingAnimation are reachable. **Control:** following whole barrels instead of imported names marks all four reachable (`wholebarrel-control.txt`), so the name-precise rule is what makes the check meaningful.
- **AudioPreviewButton:** default `variant = 'overlay'`; 3 JSX uses, all `variant="overlay"`, no spread [K8]. So the inline class is never rendered.
- **Dead keyframes:** `audioPlayingPulse` is used only by `.audio-preview-inline-button.playing`, `playButtonPulse` only by `.audio-player-button-play.is-playing` [K9]; no script sets `is-playing` [K6].
- **A legitimate `@media` copy:** `.audio-player-artwork` has a top-level rule and one nested `@media` copy (size only) [K14]. LT1 therefore expects 2 rules for it.
- **GS facts:** no script uses `shadow-glow-accent`, and no script reads a dead teal theme token by utility or `var()` [K15]; `.button-primary` is `background: var(--color-brand); color: var(--color-brand-foreground);` [K16].

## Ruling lines (L4)
- **Allow-list keys change form, counts do not.** Every key in `TEAL_RULE_ALLOW_LIST` and `TEAL_TOKEN_READ_RULE_ALLOW_LIST` loses its trailing ` {` (the rule reader returns the normalized header). Counts and reasons are unchanged. This is the only allowed edit to those two tables.
- **No assertion lost; equal or stronger replacements allowed.** The old `lineCount` header rows become `cssRuleSelectorCount` rows (every rule whose selector list names the selector, at any nesting) plus a teal-free and glow-free check of each such body; `.audio-player-artwork` becomes 2. The old LT6 fixture expectations keep their cases with the new keys, and gain the brace-prefix, nested at-rule, quoted-brace, comment and `@theme` cases. GS4's `'--shadow-glow shadow-glow-accent'` → 0 row becomes two rows: `'--shadow-glow --shadow-glow-accent'` → 0 and `'hover:shadow-glow-accent shadow-glow-accents'` → 1 (stronger: the accent utility is now caught).
- **`StyleScanAllowList` reasons:** LT7 treats a key as dead when its reason starts with `dead`. The frozen-legacy keys (`stems-loader-list`) are not dead and are not in LT7.
- **Where the walker stops:** `reachableScripts` follows `import`/`export … from` and `import('…')` with `~/` or relative specifiers; it treats a file as a barrel only when every statement is `export … from`; it follows a named import from a barrel only into re-exports of those names, and passes the names through `export *`. It does not model JSX usage (an imported but unused component counts as mounted — fail-safe).

## 1. Changes
**A `git apply`s `b-round-455/sketch-456.patch.txt` (sha in `b-round-455/sketch-456.sha256`, reviewed in `b-round-455/sketch-review.md`) with no hand edits to the three test files, then writes the two docs.**

Grants (`b-round-455/grants-456.txt`, exactly these 5 paths):
1. `app/lib/__tests__/helpers/style-scan.ts` — sketch only. Adds `CssRuleBlock`, `cssRuleBlocks`, `cssRuleBodies`, `cssRuleBlocksListing`, `cssRuleSelectorCount`, `cssRuleKey`, `hitsByCssRule`, `isReExportBarrel`, `reachableScripts`, `appScriptSources`. Existing exports unchanged.
2. `app/lib/__tests__/store-live-teal.test.ts` — sketch only. Drops `hitsByEnclosingRule`, `TOP_LEVEL_HEADER`, `TOP_LEVEL_SELECTOR_CONTINUATION`, `lineCount`; LT1/LT5/LT6 use the shared reader; new **LT7** (dead-labelled keys ↔ `DEAD_RULE_TOKENS`; each token's consumer files equal `DEAD_TOKEN_CONSUMERS`; every `unmounted` consumer outside `reachableScripts`; AudioPreviewButton reachable, SpotlightLoader reachable, default `'overlay'`, ≥ 3 JSX uses each without spread and without a non-overlay `variant=`; every CSS rule that animates a dead keyframe has the dead class in its header) and **LT8** (walker on a synthetic file map: named barrel import, namespace import, dynamic import, `export *` chain, orphan file; token-pattern and tag-parser self-tests).
3. `app/lib/__tests__/store-glow-shadow.test.ts` — sketch only. `ruleBodiesFor` removed, GS3/GS4 use `cssRuleBodies`; `RETIRED_UTILITY_PATTERN` also matches `shadow-glow-accent`; GS3 asserts `background: var(--color-brand);` in `.button-primary` and no `gradient(` in any primary-button body; GS4 sample gains `.a::after { content: '}'; }` and a `@supports`→`@media` nested `.a`.
4. `docs/implementation/2026/quarter-IV/298-saba-b-14-store-seek-thumb.md` — **l.4 only**, to exactly `**სტატუსი:** Completed (C round 455 PASS)`. No other byte of doc 298 changes.
5. `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md` — new (Georgian, English technical terms; `docs/implementation/TEMPLATE.md` headings in order; l.3 `**თარიღი:** 2026-11-11`; l.4 exactly `**სტატუსი:** In Progress (stage 2a of 2; C round 456 PASS)` (L28 stage form); no `pending`). It cites LT1, LT5, LT6, LT7, LT8, GS2, GS3, GS4 (each present in the test files, L26), the walker's limits (Ruling lines), the closed/advanced ids, and that 2b-3c-2b is next for the glow regex forms.

Nothing else changes. Protected auth/purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`), `app/styles/**`, `app/components/**`, `app/routes/**`, `app/root.tsx`, `vitest.config.ts`, `package.json` are untouched.

## 2. A: steps
1. Read `lessons.md` (A part), the primitives `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `docs/implementation/TEMPLATE.md`.
2. `bash b-round-455/claims-456.sh > a-round-456/claims-before.txt 2> a-round-456/claims-before.err` → equal to `b-round-455/claims-456-planning-output.txt`, stderr empty.
3. `cd b-round-455 && sha256sum -c sketch-456.sha256`; `git apply b-round-455/sketch-456.patch.txt` in the store; `sha256sum -c b-round-455/sketch-files-sha256.txt` → 3 OK.
4. Edit doc 298 l.4; write doc 299.
5. `npm run typecheck`, `npm run lint` (warning count equal to HEAD's), `npx biome check` on the 3 test files (no format diff), `npx vitest run $(cat b-round-455/covering-456.txt)` → 4 files green (B: 26 tests, `precheck-covering.log`).
6. Mutants on a scratch (`git clone --shared` at `db95f40` + the sketch applied, `node_modules` symlinked): `bash b-round-455/run-mutants.sh <scratch> a-round-456/mutants/mutants.txt` → equal to `b-round-455/mutants/mutants.txt` (BASE and C1 green, M1–M15 red).
7. `bash b-round-455/claims-456.sh > a-round-456/claims-after.txt` → equal to `b-round-455/claims-456-sketch-output.txt` except K2 (dirty count 5 instead of 3), K10 (doc 298 l.4 and `299=1`), K13; stderr empty.
8. `git status --short --untracked-files=all` → only the 5 grants.
9. 3+ files changed → run `code-reviewer`; pass Architecture notes to B, do not act on them.

**STOP (L11)** if a covering test fails, a mutant result differs, the sketch does not apply, or claims-before differs from the planning output.

## 3. C: acceptance rows
**Setup:** real Chromium (Playwright) for C7; dev `:5173` and the mock API `:5199`. Run browser probes one at a time and never during a vitest run (L38). Write `c-round-456/progress.json` after every row (L59).

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --short --untracked-files=all` | Only the 5 `grants-456.txt` paths; `git diff db95f40 -- docs/implementation/2026/quarter-IV/298-*` is one line (l.4) |
| C2 CLAIMS | `S=<git clone --shared at db95f40 + node_modules symlink> bash b-round-455/claims-456.sh`; then on the tree | Clone = `claims-456-planning-output.txt`; tree = `claims-456-sketch-output.txt` except K2/K10/K13 as in A step 7; stderr empty. Run L29's grep over this task |
| C3 APPLY | `sha256sum -c b-round-455/sketch-files-sha256.txt` in the store | 3 OK |
| C4 COVERING | `npx vitest run $(cat b-round-455/covering-456.txt)` | 4 files green; LT1–LT8 and GS1–GS4 each listed as passed |
| C5 MUTANTS | `run-mutants.sh` on a C scratch (`db95f40` + A's diff applied **and committed**; absolute OUT) | `mutants.txt` equals `b-round-455/mutants/mutants.txt` (17 lines: BASE, C1 green; M1–M15 red with the same test ids) |
| C6 NO ASSERTION LOST | Read `git diff db95f40 -- app/lib/__tests__` | Every removed `expect(` has an equal or stronger replacement per the Ruling lines (list each old → new pair in `c-round-456/assert-map.md`); `expect(` count per file not lower than HEAD |
| C7 STUDIO + PURCHASE PROTECTION | From `c-round-456/`: `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> http://127.0.0.1:5173 tree > c12-tree.json` | At 1440 and 1280: `/studio-lab` has 1 clip, Playing with `posPlay` > 0, then Stopped, `stopHeld` true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. Also open `/products/pulse-loop-kit` and `/` at both viewports: page renders, no new console error beyond the cloud list in the policy |
| C8 DOCS | doc 298 l.4; doc 299 | Doc 298 l.4 exactly `**სტატუსი:** Completed (C round 455 PASS)`. Doc 299: l.4 exact, TEMPLATE headings in order, no `pending`, every cited LT/GS id present in the test files |
| C9 L57 | `python3 -I tools/l57-check.py c-round-456.json c-round-456/l57-check.txt` | rc 0 |

**Notes for C:**
- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate`. B's run on the sketch: see `b-round-455/precheck-full-raw.log`, `precheck-typecheck.log`, `precheck-lint.log`.
- **BLOCKED:** none expected (no backend needed).
- `c-round-456.json`: all L57 fields; `mutantRedOnSketch` = `b-round-455/mutants/mutants.txt`; `affectedChecksRunOnSketch` = `b-round-455/precheck-covering.log`.

**Neighbours that could break:** the other `helpers/style-scan.ts` importers (`store-gradient-text.test.ts`, `store-teal-sweep.test.ts`) — in the covering set; nothing user-visible (no app file changes; C7 confirms).

## 4. Claims
`b-round-455/claims-456.sh`; planning output `b-round-455/claims-456-planning-output.txt` (HEAD `db95f40`), sketch output `b-round-455/claims-456-sketch-output.txt` (scratch with the sketch applied).

## 5. After this round
SABA-B-13 entrance (or REGRESSION-2026-11-13 first if planned on/after 2026-11-13), then 2b-3c-2b, 2b-3d, 2b-4, STORE-2c…5, DP-GATE (root), ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 (skip rule). Next RETRO: round 465.
