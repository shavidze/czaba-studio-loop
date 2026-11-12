# Round 464: STORE-2b-3d-3. Delete the 4 orphan keyframes and make DC2 count only real animation use (A-R463-REVIEW-M1 = C-R463-01)

**Planned by:** B at the round 463 → 464 planning, 2026-11-12 (`b-round-463.md`). D-29z1634 records the round-463 result; D-29z1635 records this dispatch.

**Baseline:** store HEAD `d55ec17`, the gate 463 `published` commit [K1, K2]. The store tree is clean. `context/head-sha.txt` (`eb4d6df`) is stale.

**Advisor:** available and consulted after orientation, before any artifact was written. Its advice, all applied:
- read the gate-463 review and re-run the new-input check before choosing the round (done: gate review "COMMIT OK", all Lows; no new Saba or root file);
- classify all 15 keyframes, not only the 4 (§2.1);
- list every whole-word hit of the 4 names, including `style.animation`, multi-line declarations and pre-hydration strings (done: 0 animation uses, §2.1);
- Tailwind scans test files and docs (no `@source` rule), so DC4's utility fixtures are built with `join()` and C6 compares the delivered tree including doc 303;
- keep the matcher in `store-dead-css.test.ts`; `helpers/style-scan.ts` is not touched;
- close C-R462-01 only after checking the 12 utilities are really gone (done: 0 of 12 in the `d55ec17` build, `b-round-463/c-r462-01-head-utilities.txt` [K12]).

**Project agents:** `tech-lead` reviewed sketch v1: **APPROVE WITH CHANGES**, no High or Medium. Its Low on the comment stripper (`/*` or `//` inside a string, such as `accept="video/*"`, was read as a comment) is fixed in the dispatched **v3** (v2 fixed block comments, v3 line comments), with two DC4 fixtures and mutants M8 and M9. tech-lead's delta review of v3: **APPROVE**, no Medium or above. Every Low is ruled in `b-round-463/sketch-review.md`, which opens with v3's sha256 [K10, K20]. `product-designer`, `performance-optimizer` and `ableton-arrangement-expert` were not needed: no visible change, no performance path, no Studio behaviour. The reference-first section does not apply (dead-code cleanup, no UX). No persistent screen element is added.

## 1. Why this round
- **Bug first.** A-R463-REVIEW-M1 (Medium, test strength; C confirmed it as C-R463-01, Low, origin B spec): DC2 counted a keyframes name as "used" when the word appeared anywhere (a comment, a JS variable, a type field). So the 4 keyframes whose only animation users round 463 deleted stayed in the shipped CSS.
  - **B ruling (L10, L7):** the Medium stands for the test contract (DC2 could not see an orphan); there is no visible effect. C-R463-01 is recorded as `confirmedBy` on A-R463-REVIEW-M1, not as a separate bug.
  - The fix is small and in code round 463 already owned, so it goes before 2b-3c-2b.
- **Same root cause, three ids closed together (≤ 3 related bugs):**
  - A-R463-REVIEW-M1 / C-R463-01: the orphans and the matcher;
  - B-R463-DC2-UNDERSCORE: the old matcher missed `animate-[name_1s]`; DC4 now covers it;
  - A-R463-REVIEW-L3: two comment headers left over an orphan keyframes or over nothing.
- **Recorded order (D-29z1631, D-29z1633):** 2b-3d-2 (done, round 463) → **2b-3d-3 (this fix-up)** → 2b-3c-2b → 2b-4 → STORE-2c…5.
- **Regression and RETRO:** `regression-last.json` is dated 2026-11-10; today is 2026-11-12, so it is not due. **RETRO 465** follows this round (15-round rule). If the round-465 planning happens on or after 2026-11-13, REGRESSION-2026-11-13 runs first (precedent D-29z1448: "first at the first planning on/after") and RETRO 465 right after it.
- **Promise (L55):** every Store page and `/studio-lab` look and behave exactly as now. Only 4 `@keyframes` that no element can run are removed.

## 2. What changes (grants: exactly 3 paths, `b-round-463/grants-464.txt`)

### 2.1 Sketch, applied byte for byte
A applies `b-round-463/sketch-464.patch.txt` (sha in `b-round-463/sketch-464.sha256`) with `git apply`. It holds every code change of the round. After A, the two files are byte-equal to `b-round-463/sketch-464-files-sha256.txt`.

**Narrow grant on `app/styles/app.css` (`app/styles/**` is globally forbidden [K9]).** The file may change **only** by the sketch's deletions: 45 lines deleted, 0 added [K3, K5]. It deletes:
- `@keyframes float`, `@keyframes grain` with its "Film Grain Overlay" comment header, `@keyframes fadeInUp` and `@keyframes fadeOut`;
- the "PREMIUM ANIMATIONS" comment header, which introduces no rule (A-R463-REVIEW-L3).

The Studio obsidian block stays byte-identical [K6]. The missing blank line before the skeleton header (L3's last nit) is left, so the diff stays pure deletion.

**Why the 4 are dead [K4, K16, K18].** A grep over `app/` (ts, tsx, css; tests excluded) for an `animation`/`animation-name` declaration, an `animate-` utility or an inline style naming them finds 0 for each. Their other whole-word hits:
- `float`: a comment in `audio-encoder.worker.ts` and `data-video-float-*` attributes;
- `grain`: a JSX comment in `SpotlightLoader.tsx`;
- `fadeInUp`: framer-motion variant objects (`about.tsx`, `ScrollReveal.tsx`), which are JS, not CSS keyframes;
- `fadeOut`: clip and SFX data fields.

No `style.animation =`, `animationName` or template-literal animation string exists in `app/` [K16]. The built HEAD client and server bundle (bundled libraries included) has no animation consumer of the 4 names (`b-round-463/bundle-animation-grep.txt`; its single hit is the keyframes definition itself). tech-lead also checked the `root.tsx` inline scripts, the EntranceCover pre-hydration CSS string and `public/`. HEAD's computed `animation-name` on 13 pages × 2 viewports never shows them (`b-round-463/probe/run1`, `deadAnimHead` 0).

**All 15 keyframes classified [K17, K19].** v3's DC2 run on HEAD fails with exactly the 4 names (`b-round-463/dc2-v3-on-head.log`). The 11 that stay each have a real user:
- `insert-marker-blink`: `--animate-insert-marker-blink`;
- `fade-in` and `slide-up`: the `.animate-fade-in`/`.animate-slide-up` rules, used by Modal, AuthModal, LeadMagnetPopup and CookieConsent;
- `pulse`: Tailwind `animate-pulse`;
- `navLoadingProgress`, `audioPlayingPulse`, `slideUpPlayer`, `waveform-pulse`, `shimmer`, `light-flicker-on`, `pulse404`: each named by an `animation:` declaration.

**Test (`store-dead-css.test.ts`):**
- **DC2 (rewritten):** a keyframes name counts as used only when, with block and line comments stripped, it appears in
  - a CSS `animation`, `animation-name` or `--animate-*` declaration value (all `app/**/*.css`, and the same pattern in scripts),
  - an inline style string `animation:`/`animationName:` `'…'`,
  - an arbitrary utility `animate-[name_…]` (underscore form included: closes B-R463-DC2-UNDERSCORE),
  - a named utility `animate-name`.
- **DC4 (new):**
  - eight positive fixtures: a shorthand with the name last, a multi-line `animation-name`, `--animate-*`, an arbitrary utility, a named utility, an inline style, an inline style placed after a `video/*` attribute string and before a JSX comment, and an inline style after an `href='//…'` string (neither string may open a comment);
  - six negative ones: a block comment, a line comment, a JSX comment, an identifier, an object field and a type field.
  - The two utility fixtures are built with `['animate-', '…'].join('')` so Tailwind's scanner cannot emit them into the bundle.
- Comment stripping starts a block or line comment only at the start of a source or after whitespace or one of `{ } ; , (`, so `/*` or `//` inside a string is kept (tech-lead Low, mutants M8 and M9).
- `cssWithoutKeyframesHeaders` and DC3's text-match assertion on `animation: dc-dead-spin` are replaced by `animatedNames` [K7]. DC1 and DC3's class-rule part are unchanged.
- **Known limit (recorded, not fixed):** a keyframes reached only through a custom property not named `--animate-*` (`--x: float 1s; animation: var(--x)`) would read as unused. None exists today, and such a false red would block a change, not delete anything. **One limit fails silently:** a comment directly after a character outside the list (`"x"/* … */`, `)// …`) is kept as text, so a commented-out use there would keep a dead keyframes alive and DC2 would stay green (the same direction as A-R463-REVIEW-M1). There are 0 such cases in `app/` today; tech-lead's v3 Low is accepted and filed as TL-R464-L1-COMMENT-AFTER-UNLISTED-CHAR (deferred). The fail-red forms are TL-R464-L2-MATCHER-FAILS-RED-FORMS. Both are in `sketch-review.md`.

### 2.2 Doc 303 (A writes it)
`docs/implementation/2026/quarter-IV/303-store-2b-3d-3-orphan-keyframes.md`, Georgian, TEMPLATE order (7 `## ` headings as in doc 302).
- Line 4 exactly: `**სტატუსი:** In Progress (stage 2b-3d-3 of STORE-2b; C round 464 PASS)`. No word "pending" (`grep -ci pending` = 0).
- **No class, utility or `animate-…` literal, and no CSS declaration text.** Tailwind v4 scans `docs/*.md`: `app.css` has no `@source` rule [K15] (C-R462-01; SIG-R463-TAILWIND-DOCS-SOURCE). The 4 keyframes names are not Tailwind utilities, so naming them in prose is allowed; do not write `@keyframes …` code. C6 catches any leak.
- Body: why they survived round 463 (text-match rule), the new DC2 rule, DC4, the known limits (custom-property indirection and template-built names fail red; a comment right after an unlisted character passes silently, TL-R464-L1), the note that the project's own pulse keyframes overrides Tailwind's (SIG-R464-PULSE-KEYFRAMES-SHADOW), and the 3 ids closed.
- TODO: the remaining A-R463-REVIEW Lows (deferred), SIG-R463-TAILWIND-DOCS-SOURCE, and the shared "used" definition (architecture signal, ARCH-CHECKPOINT-STYLE-SCAN).
- Doc 302 is **not** edited (its TODO names the follow-up in words only [K14]).

## 3. Steps for A
1. Read `lessons.md` (A part) and the primitives TAILWIND_FIRST, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and GEORGIAN_DOCS.
2. From the loop root: `bash b-round-463/claims-464.sh > a-round-464/claims-before.txt 2> a-round-464/claims-before.err`. It must equal `b-round-463/claims-464-planning-output.txt`, and stderr must be empty. A mismatch is a STOP.
3. `cd b-round-463 && sha256sum -c sketch-464.sha256`; then, in the store, `git apply <loop>/b-round-463/sketch-464.patch.txt`; then, inside the store, `sha256sum -c <loop>/b-round-463/sketch-464-files-sha256.txt` → 2 OK.
4. Write doc 303 (§2.2).
5. Checks (logs in `a-round-464/`):
   - `npm run typecheck`;
   - `npm run lint` (192 warnings expected, as at HEAD);
   - `npx biome check app/lib/__tests__/store-dead-css.test.ts`;
   - `npx vitest run $(cat <loop>/b-round-463/covering-464.txt)` → 14 files / 149 tests green.
6. Mutants: on a scratch clone at `d55ec17` with the sketch committed, `bash <loop>/b-round-463/mutants/run-mutants.sh <scratch> <loop>/a-round-464/mutants.txt`. The file must be identical to `b-round-463/mutants/mutants.txt`.
7. **Required** doc-leak self-check, because C6 hard-fails on a leak. `a-round-463/tw-doc-leak.mjs` [K20] takes `<store root> <doc path>`. It needs the store's `node_modules`, so copy it to a temporary file at the store root, run `node <copy> . docs/implementation/2026/quarter-IV/303-store-2b-3d-3-orphan-keyframes.md`, save the output as `a-round-464/tw-doc-leak.txt` (`cssEqual true`), and **delete the temporary copy before C1** (as A did in round 463). C6 stays the real check.
   - Note: the mutant script prints Python `SyntaxWarning` lines on stderr for M8/M9. They are harmless; only the `mutants.txt` content counts.
8. `claims-after.txt` must equal `b-round-463/claims-464-expected-after-A.txt`, with empty stderr.
9. code-reviewer: 3 paths change, so it is required.
10. Not run by A (gate rows): the full suite, `verify` and `npm run build`.

**STOP rules:** stop and report (do not improvise) if the patch does not apply, a sha does not match, the covering set is not 14/149 green, or the mutants differ.

## 4. What C checks (`c-round-464.json`, evidence in `c-round-464/`)

| Row | Command / action | PASS when |
|---|---|---|
| C1 SCOPE | `git status --short --untracked-files=all` in the store | exactly the 3 paths of `b-round-463/grants-464.txt` |
| C2 CLAIMS | `bash b-round-463/claims-464.sh` from the loop root | output `cmp`-equal to `b-round-463/claims-464-expected-after-A.txt`, stderr 0 bytes; the L29 grep of this task's file paths and lines all resolve |
| C3 APPLY | `sha256sum -c b-round-463/sketch-464-files-sha256.txt` in the store | 2 OK |
| C4 COVERING | `npx vitest run $(cat b-round-463/covering-464.txt)` | 14 files / 149 tests green; DC1–DC4 present and green in verbose output |
| C5 MUTANTS | C's own scratch (`d55ec17` + the store's two changed code files, committed), `bash b-round-463/mutants/run-mutants.sh <scratch> c-round-464/mutants/mutants.txt` | byte-identical to `b-round-463/mutants/mutants.txt` (BASE all green; M1–M9 each red on the listed rows) |
| C6 BUILD vs HEAD | `R=<store> bash b-round-459/probe/serve-prod.sh start <loop>/c-round-464/prod-head 5190 d55ec17` and `… start <loop>/c-round-464/prod-tree 5191 TREE` (mock API on :5199); then `python3 -I b-round-463/build-compare.py <head build> <tree build> > c-round-464/build-compare.txt` and `python3 -I b-round-463/root-chunk-diff.py <head build> <tree build> > c-round-464/root-chunk-diff.txt`; also list the `@keyframes` names in both built `app-*.css` | `build-compare.txt` is `cmp`-equal to `b-round-463/build-compare.txt` (server 0 lines; JS differing only in `root`; CSS 5 percent-selectors removed, 0 added). The last line of `root-chunk-diff.txt` is `non-identifier-changes=0` (B's HEAD-vs-HEAD control: `build-compare-head-head.txt`). Built keyframes: tree = HEAD minus exactly `fadeInUp`, `fadeOut`, `float` and `grain`. Any added selector means doc 303 or the test leaked a utility: FAIL |
| C7 PAGES (browser, prod) | with both C6 servers up: `node b-round-462/probe/dead-css-pages.cjs http://127.0.0.1:5190 http://127.0.0.1:5191 b-round-463/pruned-list-464.txt <loop>/c-round-464/pages`; then the non-vacuity run with the extra arguments `'h1 { animation-name: float !important; }' /store` into `c-round-464/nonvacuity` | 26 rows, each with: equal `status`; `reducedControlEqual` and `reducedHeadTreeEqual` true; on the 22 rows other than `/` and `/no-such-page-463`, `controlHeadHeadEqual` and `headTreeEqual` true; on those two, `headTreeDiffering` ≤ 6 (B: ≤ 4, `probe/run1`); `deadAnimHead` = `deadAnimTree` = 0; `invalidSelectors` 0; an empty `chunk404`; `consoleErrorsTree` holding only the expected no-backend noise. Non-vacuity: both `/store` rows show `deadAnimTree` 1 and `reducedHeadTreeEqual` false (B: `probe/nonvacuity`). A row whose reduced control is false is environment-invalid: re-run it (L37); it is not a FAIL. Keep the screenshots |
| C8 STUDIO + PROTECTION (dev, both viewports) | the round-461 C8 probe (copy `c-round-461/c8/probe.cjs` [K20]) on dev :5173 | at 1440 and 1280: `/studio-lab` opens the demo anonymously with 1 clip, goes Playing → Stopped, and `stopHeld` is true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. A first `NO-BODY` read is the dev first-compile race; re-run it up to 3 times |
| C9 DOCS | doc 303 | line 4 exact (§2.2); `grep -ci pending` 0; 7 TEMPLATE `## ` headings in order; no `@keyframes`, `animate-` or `animation:` text; the body names the 3 closed ids and the custom-property limit; `grep -rn 'C round [0-9]* pending' docs/implementation` 0 |
| C10 L57 | `python3 -I tools/l57-check.py` on `c-round-464.json` | rc 0 |
| gate | full vitest, typecheck, build, Biome, lint, verify | gate rows, not claimed by C |

- **Heaviest first (L59):** run the C6 builds, then C7 on the same servers, then stop them (`serve-prod.sh stop 5190`, `stop 5191`).
- **browserVerified** depends on C7 and C8. Both run in the cloud with the mock API. No backend-blocked rows are expected.
- **Ableton conformance:** not applicable (no behaviour change).

## 5. What could break nearby
- An element that really animates with one of the 4 names would freeze. C7's `deadAnimHead` (0 at HEAD) and the reduced computed-style compare catch it.
- A Tailwind leak from the DC4 fixtures or doc 303 would add CSS. C6's `added=0` and `cmp` catch it.
- The new DC2 could miss a real consumer in future and demand a wrong deletion. DC4's positives and mutants M3–M9 guard it; the custom-property limit is documented.
- Studio: `insert-marker-blink` is untouched. DC2 still sees it through `--animate-insert-marker-blink`, and mutant M6 shows DC4 depends on that branch.

## 6. Closes on C PASS
A-R463-REVIEW-M1 (`confirmedBy` C-R463-01), B-R463-DC2-UNDERSCORE and A-R463-REVIEW-L3.

Already closed by evidence at this planning: C-R462-01 (round 463 C6, plus `c-r462-01-head-utilities.txt`), A-R453-REVIEW-L-BOXSHADOW-TRANSITION, GATE453-I5 and GATE462-L2 (round 463 C PASS, gate 463 published).

## 7. Claims (`[K#]`)
Script: `b-round-463/claims-464.sh` (run from the loop root; `S=<store>` optional). Planning output: `b-round-463/claims-464-planning-output.txt`, stderr `claims-464-planning.err` (0 bytes). Expected after A: `b-round-463/claims-464-expected-after-A.txt`, which differs from the planning output only in K3, K5, K7, K8 and K17.
- K1: gate 463 published `d55ec17`. K2: store HEAD `d55ec17`.
- K3: 4 orphan keyframes, 15 in total, app.css 1691 lines at HEAD (after A: 0, 11, 1646).
- K4: 0 animation consumers for each of the 4 names.
- K5: the PREMIUM ANIMATIONS and Film Grain headers are present (after A: 0 and 0).
- K6: obsidian block sha `e9afeed85faec382`, unchanged after A.
- K7: DC2 text rule present, DC4 absent (after A: 0, 1, 1).
- K8: doc 303 absent (after A: present). K9: `app/styles/**` is globally forbidden.
- K10: 20/20 planning artifacts exist. K11: build-compare 5 removed, 0 added, root non-identifier changes 0. K12: C-R462-01 utilities, 0 of 12 at HEAD. K13: mutants 9 red, BASE 0 red.
- K15: 0 `@source` rules in app.css. K16: 0 JS animation style assignments. K17: the keyframes names in app.css (after A: the 11 kept). K18: the non-test files with a whole-word hit of each of the 4 names. K19: v3's DC2 on HEAD lists 4 of 4 names. K20: the v2/v3 artifacts 8/8, `tw-doc-leak.mjs` and the C8 probe present. K14: doc 302 names none of the 4.
