# Round 463: STORE-2b-3d-2. Delete the dead Store CSS rules (and fix C-R462-01)

**Planned by:** B at the round 462 → 463 planning, 2026-11-12 (`b-round-462.md`). D-29z1632 records the round-462 result; D-29z1633 records this dispatch.

**Baseline:** store HEAD `eb4d6df`, the gate 462 `published` commit [K1, K2]. `context/head-sha.txt` (`a7fa78e`) is stale.

**Advisor:** available and consulted after orientation, before any artifact was written. Its advice, all applied:
- close round 462 only from C's files, and rule A's K23 STOP;
- record gate-462 finding 1 (`email.server.ts`) for root, not as closed;
- delete only rules with zero source consumers;
- make the pre-check tree equal the delivered tree (Tailwind scans `docs/*.md`);
- use a style-sensitive browser row, run on the sketch first.

**Project agents:** `tech-lead` reviewed sketch v1: APPROVE, with 2 Mediums. Both are fixed in the dispatched v2: compound selectors must have every class rendered, and `.is-playing` is ruled dead. tech-lead then delta-reviewed v2. Both verdicts and B's rulings are in `b-round-462/sketch-review.md` [K12]. `product-designer` and the reference section do not apply: this is dead-code removal with no visible change (§3, C7). No persistent screen element is added.

## 1. Why this round
- **No Medium+ that the loop can fix is open.** The open Mediums are manual checks, `awaiting_user`, `open_root` or queued in REVIEW-RECOMMENDATIONS (2026-10-23 root clarification). The new gate-462 Medium flag on `email.server.ts` is a policy question for root, not a code defect (`b-round-462.md`).
- **Recorded order (D-29z1631):** 2b-3d-1 (done, round 462) → **2b-3d-2 (this round)** → 2b-3c-2b → 2b-4 → STORE-2c…5.
- **Regression:** `regression-last.json` is dated 2026-11-10. It is not due today (2 days). **The next planning on or after 2026-11-13 is REGRESSION-2026-11-13.**
- **Permission:** Saba's legacy-removal policy of 2026-11-10 ("legacy code that is not used anywhere must be removed incrementally") and the round-462 Q6 default.
- **Promise (L55):** every Store page and `/studio-lab` look and behave exactly as now. Only CSS that no element can match is removed.

## 2. What changes (grants: exactly 7 paths, `b-round-462/grants-463.txt`)

### 2.1 Sketch, applied byte for byte
A applies `b-round-462/sketch-463.patch.txt` (sha in `b-round-462/sketch-463.sha256`) with `git apply`. It holds every code change of the round.

**Narrow grants on `app/styles/**` (globally forbidden):** `app/styles/app.css` and `app/styles/base/utilities.css` may change **only** by the deletions in the sketch. After A, both files are byte-equal to the sha pins in `b-round-462/sketch-463-files-sha256.txt`. The Studio obsidian block stays byte-identical [K6].

**CSS deletion rule.** The generator is `b-round-462/css-prune.py`, which uses `css-inventory.py`; the full list is `b-round-462/pruned-list.txt` [K5]. It deletes:
- every rule block, including blocks nested in `@media`, that has no live selector branch: **306 blocks** [K4, K5].
  - A top-level comma branch is live when every class it requires is rendered. Classes inside `:not(...)` are not required.
  - A class is rendered when it appears as a whole token in non-test app source (ts, tsx, js, md under `app/`, with `__tests__` and `*.test.*` excluded), or when the Lenis library sets it at runtime.
  - So `.filter-pill.active` is dead even though `active` is used elsewhere;
- `@media` wrappers left empty;
- the comment lines that directly introduce a deleted block;
- the **6 `@keyframes`** that no remaining CSS and no app source names [K5].

The diff is pure deletion: `diff --minimal` shows 0 added CSS lines.

**What stays, on purpose:**
- **The Lenis rules** (`.lenis.lenis-smooth` …). The library sets those classes at runtime (`node_modules/lenis/dist/lenis.mjs`).
- **Dead-labelled rules whose class still has a source consumer in a kept, unmounted file.** These are `audio-preview-inline-button` with `audioPlayingPulse`, `waveform-bar` and `track-row-waveform`. They stay with the LEGACY-DEAD remainder, so the round deletes no TSX; the backlog keeps a task to delete the unmounted chain together with this CSS.
- The `@theme` teal tokens (6 hits). The frozen legacy Studio `.stems-loader-list` and `slider-thumb-teal`.

**Keep-list ruling (L4).** Saba's keep-list (LeadMagnet, Free downloads, SpecialOffers, Limited badges, testimonials and stats) is untouched. Deleted rule families with keep-list-like names — special-offer, testimonial, stat, badge and newsletter — have no element that renders them: the live components use Tailwind classes [K4]. `/` and `/about` compare equal in C7. Where a name matches, the rendered element decides, not the name.

**Measured effect** [K3, K4, K14, K15]:
- `app.css` goes from 3850 to 1691 lines and `utilities.css` from 279 to 208.
- The re-run inventory finds **0** blocks with no consumer.
- The 5 `transition … box-shadow` rules are gone, which closes A-R453-REVIEW-L-BOXSHADOW-TRANSITION.
- The brand-tinted `.track-card` shadow and `glow-pulse` are gone, which closes GATE453-I5.

**Tests in the sketch:**
- `store-live-teal.test.ts`: the allow-lists shrink to the remaining hits. `CSS_TEAL_ALLOW_LIST` becomes app.css 14 and utilities.css 3. The 14 deleted rule entries leave `TEAL_RULE_ALLOW_LIST` and `DEAD_RULE_TOKENS`: the 12 dead rules, `.audio-player-progress.is-playing` and `@keyframes playButtonPulse`. Both token-read allow-lists become `{}`. `'loading-brand'` leaves `DEAD_TOKEN_CONSUMERS`, and `playButtonPulse` leaves `DEAD_KEYFRAME_RULE_TOKENS`.
- `store-gradient-text.test.ts`:
  - `GRADIENT_TEXT_ALLOW_LIST` becomes `{}`, because `.loading-brand` is deleted.
  - The `DELETED_STORE_MODULES` key `sendOrderEmail` becomes `sendOrderPaidEmail`, the real deleted export (gate-462 finding 2) [K10].
- **New `store-dead-css.test.ts`** (kept out of `helpers/style-scan.ts` while ARCH-CHECKPOINT-STYLE-SCAN is open):
  - **DC1:** every class rule in the two files has a selector branch whose required classes are all rendered. `RUNTIME_CLASSES` lists the 4 Lenis classes the CSS uses, each with its reason.
  - **DC2:** every `@keyframes` in the two files is named by other CSS or by app source.
  - **DC3:** non-vacuity. At least 150 class rules are scanned. A fixture rules on 8 cases: a dead rule inside `@media`; a compound with one dead class; a comma list with one live branch; `:not(...)`; a Lenis runtime class; an attribute value; a substring-only consumer; and a dead keyframes.

**C-R462-01 fix (doc 301).** Tailwind v4 also scans `docs/*.md`. Doc 301 named the 12 retired utility strings literally, so the published round-462 CSS still carried them. The sketch replaces that paragraph with a corrected statement that cites `b-round-461/css-removed-live-grep.txt` and names no utility literal [K7, K16]. The 12 utilities then leave the bundle (§3).

### 2.2 Implementation doc 302 (A writes it)
Create `docs/implementation/2026/quarter-IV/302-store-2b-3d-2-dead-store-css.md`. The number is free [K8]. Write it in Georgian, following `docs/implementation/TEMPLATE.md`.
- **Line 4:** exactly `**სტატუსი:** In Progress (stage 2b-3d-2 of STORE-2b; C round 463 PASS)`, the form of docs 292–301 (L28; never `pending`).
- **No literal CSS class name, keyframes name or Tailwind utility string anywhere in the doc** (C-R462-01: Tailwind would generate a utility from it, and C6 would no longer be `cmp`-equal). Refer to the lists by file instead: `b-round-462/pruned-list.txt` and `b-round-462/build-compare.txt`. Describe the families in words, for example "the old about, music-listing, product-detail and track-card styles". File paths are allowed. Self-check: `python3 -I <loop>/b-round-462/doc-class-literals.py <doc> <loop>/b-round-462/pruned-list.txt` prints `literals=0`.
- **Body:**
  - the deletion rule and the permission;
  - what stays and why (the Lenis runtime rules, the dead-labelled rules with kept consumers, `@theme`, frozen legacy Studio);
  - that the keep-list UI is untouched (below);
  - DC1–DC3;
  - the doc-301 correction and its cause;
  - the build and browser evidence (§3).
- **TODO:**
  - the LEGACY-DEAD remainder (the kept consumers, ArtistBioSection, TestimonialsSection, IconButton, ChatButton);
  - TL-R462-L2;
  - the `docs/` Tailwind-source signal (SIG-R463-TAILWIND-DOCS-SOURCE);
  - TL-R463-L3 (the test scans ts/tsx, the generator also js/md; equal today), TL-R463-L7 (`:is`/`:where`/`:has` classes count as required) and B-R463-DC2-UNDERSCORE (a keyframes name used as `animate-[name_1s]` is not counted as a consumer; 0 such uses today);
  - 2b-3c-2b.
- **Checks:** `grep -ci pending` on the doc = 0, and the doc names only test rows that exist (L26).

## 3. What B measured on the sketch
The scratch is `/tmp/b463-scratch` = `eb4d6df` + the sketch + a placeholder doc 302 with the required line 4 (so the pre-check tree equals the delivered tree).

**Static checks and tests:**
- **Typecheck:** rc 0 (`precheck-typecheck.log`).
- **Lint:** 192 warnings, equal to HEAD (`precheck-lint.log`).
- **Covering set:** `covering-463.txt`, 14 files / 148 tests green (`precheck-covering.log`). This includes every test that reads a CSS file.
- **Full suite (L23):** 285 files / 4185 tests passed, rc 0 (`precheck-full.log`).
- **Mutants:** `mutants/mutants.sh` → `mutants/mutants.txt` [K12]. BASE is GREEN.

  | Mutant | Rows that turn red |
  |---|---|
  | M1, HEAD app.css restored | DC1, DC2, GT1, LT3, LT5, LT6 |
  | M2, dead class rule re-added (utilities.css) | DC1 |
  | M3, orphan keyframes | DC2 |
  | M4, dead rule inside `@media` | DC1 |
  | M5, vacuous required-class extractor | DC3 |
  | M6, gradient-text rule re-added | DC1, GT1 |
  | M7, a barrel re-exports `sendOrderPaidEmail` | GT6, LT9 |
  | M8, dead teal rule re-added | DC1, LT3, LT5 |
  | M9, compound with a generic live class re-added (`.filter-pill.active`) | DC1 |
  | M10, a Lenis class dropped from `RUNTIME_CLASSES` | DC1, DC3 |
  | M11, selector list of two dead branches | DC1 |

**Production build, HEAD vs sketch** (`b-round-461/build-compare.py` → `build-compare.txt`; `build-compare-explained.txt`; `root-chunk-diff.py` → `root-chunk-diff.txt`):
- the server bundle shows 0 normalized diff lines;
- all 101 client JS chunks are equal after normalization (`root-chunk-diff.txt`: 0 non-equal spans; an earlier v1 build showed identifier-only renames in `root`, which `root-chunk-diff.py` tolerates);
- **CSS: 2068 → 1794 selectors, 274 removed and 0 added.** Every removed selector is explained: 262 dead-rule selectors and the 12 round-461 utilities (`unexplained 0`).

**Browser (prod, mock API):** `node b-round-462/probe/dead-css-pages.cjs http://127.0.0.1:5190 http://127.0.0.1:5191 b-round-462/pruned-list.txt <out>` → `probe/run1/dead-css-pages.json`.
- **Coverage:** 13 pages × 2 viewports = 26 rows: `/`, `/store`, `/products/middle-east`, `/free-downloads`, `/about`, `/hire-us`, `/support`, `/faq`, `/cart`, `/search`, `/account/login`, a 404 path and `/studio-lab`.
- **What it compares:** the computed-style fingerprint of every element, HEAD vs tree, with a HEAD-HEAD control. Settings: reduced motion, a fake clock and frozen animations.
- **Results:**
  - The reduced fingerprint (no box, transform or opacity) is equal on all 26 rows, and so are the controls.
  - The full fingerprint is equal on 22 rows. The 4 others are `/` and the 404 path. Their infinite hero and 404 animations move the HEAD-HEAD control as well.
  - 0 elements match any of the 222 removed selector branches, with pseudo-classes stripped (`selectorsChecked`, `invalidSelectors` 0). A superseded v2 run that counted single classes found generic ones such as `active`, which shows the counting path is not vacuous (`probe/superseded/run1-v2-classcount/`).
  - 0 computed `animation-name` values are a removed keyframes.
  - No chunk 404.
- **Non-vacuity:** injecting `h1 { letter-spacing: 3px !important }` into the tree reads of `/store` turns both the full and the reduced compare false (`probe/nonvacuity/`).
- The v1 runs are kept in `v1-superseded/` and `probe/superseded/`.
- `css-prune.py` re-run on a clean `eb4d6df` clone reproduces both CSS files sha-identically to the sketch pins.

**Other pre-checks:**
- No deleted class appears in `public/`, `e2e/` or `perf/`.
- No template-literal class prefix builds any deleted family.
- `git apply --check` on the store tree is OK.

## 4. A steps
1. **Read:** the A part of `lessons.md`, and the primitives `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. **Claims before:** from the loop root, run `bash b-round-462/claims-463.sh 2>a-round-463/claims-before.err`. The output must be identical to `b-round-462/claims-463-planning-output.txt`, and stderr must be empty.
3. **Apply:**
   - `cd b-round-462 && sha256sum -c sketch-463.sha256` must give 1 OK;
   - from the store root: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-462/sketch-463.patch.txt`;
   - from the store root: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-462/sketch-463-files-sha256.txt` must give 6 OK.

   No hand edits to these 6 files. No `git stash`, `git checkout --` or `git rm` (L60).
4. **Doc 302:** write it as described in §2.2.
5. **Checks:**
   - `npm run typecheck`;
   - `npm run lint` (192 warnings);
   - `npx biome check` on the 3 test files;
   - `npx vitest run $(cat <loop>/b-round-462/covering-463.txt)`: 14 files / 148 tests.

   **Mutants:**
   - build a scratch: `git clone -q --shared /home/runner/czaba-project/store /tmp/a463-mut && cd /tmp/a463-mut && git checkout -q eb4d6df && git apply <sketch> && git add -A && git -c user.email=a@loop -c user.name=A commit -qm sketch && ln -s /home/runner/czaba-project/store/node_modules node_modules`;
   - run `bash <loop>/b-round-462/mutants/mutants.sh /tmp/a463-mut <loop>/a-round-463/mutants`;
   - `mutants.txt` must be identical to B's.

   Run code-reviewer (≥ 3 files changed). Its Architecture note goes to B. Do not run the full suite, `verify` or the build; those are gate rows.
6. **Claims after:** the output must be identical to `b-round-462/claims-463-expected-after-A.txt`, with empty stderr.
7. **Scope:** `git status --short --untracked-files=all` in the store shows exactly the 7 grant paths: 5 `M`, plus `??` for `store-dead-css.test.ts` and for doc 302.

## 5. C rows
| Row | Command / where | PASS when |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --short --untracked-files=all` | exactly the 7 paths of `grants-463.txt` (5 M, 2 new) |
| C2 CLAIMS | `bash b-round-462/claims-463.sh` and the L29 grep below | output identical to `claims-463-expected-after-A.txt`, with empty stderr; every L29 hit is a grant path, a command argument, a planned change or a `[K#]` claim |
| C3 APPLY | from the store root: `sha256sum -c …/b-round-462/sketch-463-files-sha256.txt` | 6 OK; ArtistBioSection and TestimonialsSection present [K13] |
| C4 COVERING | `npx vitest run $(cat b-round-462/covering-463.txt)` | 14 files / 148 tests green; DC1, DC2, DC3, GT1, GT6, LT3, LT5, LT6 and LT7 listed as passed |
| C5 MUTANTS | C's own scratch (`eb4d6df` + the sketch, committed as in A step 5), then `bash b-round-462/mutants/mutants.sh <scratch> <loop>/c-round-463/mutants` | `mutants.txt` identical to B's: BASE GREEN, M1–M11 RED with the listed rows |
| C6 BUILD vs HEAD | `R=<store> bash b-round-459/probe/serve-prod.sh start <loop>/c-round-463/prod-head 5190 eb4d6df` and `… start <loop>/c-round-463/prod-tree 5191 TREE` (mock API on :5199), then `python3 -I b-round-461/build-compare.py <head build> <tree build> > c-round-463/build-compare.txt` and `python3 -I b-round-462/root-chunk-diff.py <head build> <tree build> > c-round-463/root-chunk-diff.txt` | `cmp` with `b-round-462/build-compare.txt` is equal (server 0 lines; JS none differing; CSS 274 removed and 0 added). If only `root` differs, the last line of `root-chunk-diff.txt` must say `non-identifier-changes=0`, and C records it. A CSS difference usually means doc 302 named a class or utility (§2.2), which is a FAIL of this row |
| C7 STORE PAGES (browser, prod) | with both C6 servers up: `node b-round-462/probe/dead-css-pages.cjs http://127.0.0.1:5190 http://127.0.0.1:5191 b-round-462/pruned-list.txt <loop>/c-round-463/pages`, then the non-vacuity run with the extra arguments `'h1 { letter-spacing: 3px !important; }' /store` into `c-round-463/nonvacuity` | in `pages/dead-css-pages.json`, all 26 rows have: equal `status`; `reducedControlEqual` and `reducedHeadTreeEqual` true; on the 22 rows other than `/` and `/no-such-page-463`, `controlHeadHeadEqual` and `headTreeEqual` true; on `/` and `/no-such-page-463` (infinite hero/404 animations ignore reduced motion, so each read jitters independently) `headTreeDiffering` ≤ 6 (B's runs: ≤ 4, `probe/run1`, `probe/superseded/`); `removedClassElsHead` = `removedClassElsTree` = 0 (elements matching a removed selector branch); `invalidSelectors` 0; `deadAnimHead` = `deadAnimTree` = 0; an empty `chunk404`; `consoleErrorsTree` holding only the expected no-backend noise. The non-vacuity run shows `reducedHeadTreeEqual` false on both rows. A row whose reduced control is false is environment-invalid: re-run it (L37), it is not a FAIL. Keep the screenshots |
| C8 STUDIO + PROTECTION | the round-461 C8 probe (copy `c-round-461/c8/probe.cjs`) on dev :5173 | at 1440 and 1280: `/studio-lab` opens the demo anonymously with 1 clip, goes Playing → Stopped, and `stopHeld` is true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. A first `NO-BODY` read is the dev first-compile race; re-run it up to 3 times |
| C9 DOCS | doc 302 and doc 301 | doc 302: line 4 exact (§2.2); `grep -ci pending` = 0; TEMPLATE headings in order (L26); the body and TODO hold the §2.2 items; `python3 -I b-round-462/doc-class-literals.py <store>/docs/implementation/2026/quarter-IV/302-store-2b-3d-2-dead-store-css.md b-round-462/pruned-list.txt` prints `literals=0`. Doc 301: K7 = 0 and K16 as expected; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0 |
| C10 L57 | `python3 -I tools/l57-check.py c-round-463.json c-round-463/l57-check.txt` | rc 0 |
| gate | full vitest, typecheck, build, Biome, lint, verify | marked `gate`, not claimed in `passed` |

**C2's L29 grep** (from the loop root):

```bash
grep -nE 'l\.[0-9]+|(app|perf|docs)/[^ `]+|data-testid|aria-[a-z-]+' current-task.md > c-round-463/l29.txt
```

B's run is `b-round-462/l29-planning.txt`.

**Notes for C:**
- `c-round-463.json` carries all L57 fields and an `origin` on every finding:
  - `mutantRedOnSketch` = `b-round-462/mutants/mutants.txt`;
  - `affectedChecksRunOnSketch` = `b-round-462/precheck-covering.log`, `b-round-462/build-compare.txt` and `b-round-462/probe/run1/dead-css-pages.json`.
- **Heaviest first (L59):** run the C6 builds, then C7 on the same servers, then stop them (`serve-prod.sh stop 5190`, `stop 5191`).
- **browserVerified** depends on C7 and C8. Both run in the cloud with the mock API.
- **Expected environment noise:** "Failed to load cart" and `ERR_CONNECTION_REFUSED` (no backend). A chunk 404 is a failure.
- **Hover-only rules:** a deleted `:hover` rule whose branch has an unrendered class cannot match any element, so C7's selector count covers it. C does not need a hover sweep.

**What closes on C PASS:**
- STORE-2b-3d-2 and C-R462-01.
- A-R453-REVIEW-L-BOXSHADOW-TRANSITION [K14], GATE453-I5-BRAND-TINT-GLOWS-OUTSIDE-GRANT [K15] and gate-462 finding 2 (`sendOrderEmail` key) [K10].
- LEGACY-DEAD-STORE-COMPONENTS stays open for its remainder.

**Neighbours that could break:**
- a page whose element relied on a deleted rule (none: DC1 and C7's class count);
- a class that a library sets at runtime (Lenis: kept through `RUNTIME_CLASSES`, M10; C7 compares every element);
- an animation (6 keyframes removed; C7's `deadAnim` = 0, and DC2);
- the Studio obsidian block (byte-identical, K6) and `/studio-lab` (C7, C8);
- the other style scanners (C4 runs all 14 CSS-reading files).

## 6. Claims
Run from the loop root: `bash b-round-462/claims-463.sh`. Every `b-round-462/` file this task cites exists [K12].
- **Planning output:** `b-round-462/claims-463-planning-output.txt` (store at `eb4d6df`).
- **After-A expectation:** `b-round-462/claims-463-expected-after-A.txt`. This is the script's output with `S=/tmp/b463-scratch` (the sketch plus the placeholder doc 302). Its K2 line is replaced with the planning value, because A does not commit and the store HEAD stays `eb4d6df`.
- **Expected differences:** the planning and after-A outputs differ only in K3, K4, K7, K8, K9, K10, K14, K15 and K16 (`b-round-462/claims-463-diff.txt`).
- **Stderr:** both stderr files are empty.
