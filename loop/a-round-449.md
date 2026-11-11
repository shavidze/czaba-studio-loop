# A round 449 — STORE-2b-3a gradient text → plain light ink

**Status:** implemented as dispatched; no STOP. Baseline `48e16b8`. No commit/push.

**For B first:** code-reviewer Medium A-R449-REVIEW-GT1-TSX (GT1 does not scan TSX) is NOT applied: adding a GT1b would change K24 and break the reviewed-equals-dispatched sketch rule. Details below.

**Pre-flight:** the pre-flight skill was read after the sketch was applied (not before); the change is B's sha-pinned sketch, so assumptions/scope/success criteria were B's task rows; files touched = grants only; success = steps 5–7 below. Primitives read before editing: TAILWIND_FIRST, DESIGN_TOKENS, GEORGIAN_DOCS, TESTING_QUALITY_GATES.

## Steps and evidence (all logs in `a-round-449/`)
1. **Claims before editing:** `claims-pre.txt` is byte-identical to `b-round-448/claims-449-planning-output.txt` (K20 `l58 rc=0`, K16 `absent prefix-294-files=0`, K19 `0 / 0`).
2. **Sketch:** sha256 `288ad78b…af5fab` = `sketch-review.md` l.3 (v3). `git apply` rc 0; no hand-port.
3. **Mutants** (scratch `/tmp/a449-scratch` = `git clone --shared` at `48e16b8` + sketch, committed `19d8c14`; store tree untouched): `mutants.txt` = K13 exactly — BASE none, M1 GT1 GT2 GT3, M2 GT2, M3 GT3, M4 GT1, M5 GT1, M6 none, M7 GT3, M8 GT4, M9 GT1, M10 GT5, M11 GT4. Logs `mutant-*.log`.
4. **Doc 294** written: `docs/implementation/2026/quarter-IV/294-store-2b-3a-gradient-text.md`; l.3 `**თარიღი:** 2026-11-11`, l.4 exact `**სტატუსი:** In Progress (stage 2b-3a of STORE-2b; C round 449 PASS)`; seven TEMPLATE headings in order; cites only GT1–GT5 and NM2; after the advisor check the LEGACY line was corrected to "three home sections are added; PianoLoadingAnimation is already there" (l.4 unchanged); star-brand-audit supersede line present; no "pending".
5. **Checks:**
   - covering (`covering-449.txt`): rc 0, **16 files / 190 tests** passed, total 8.98 s (`covering.log`). Verbose rerun (`covering-verbose.log`, rc 0, 16/190): slowest single test 482 ms; no `testTimeout` in `vitest.config.ts` and no per-test timeout in the covering files → default 5000 ms, 50 % line 2500 ms; none above it.
   - `npm run typecheck` rc 0 (`typecheck.log`).
   - `npm run lint` rc 0, **205 warnings** = HEAD (`lint.log`).
   - scoped `npx biome check` on the 11 changed code paths: rc 0, **2 warnings** = HEAD (`biome-scoped.log`; Biome checked 9 files, same as B's `precheck-biome-scoped.log` "Checked 9 files"; the 2 CSS files are presumably outside Biome's include set, not separately verified).
   - `npm run build` rc 0 (`build.log`).
   - code-reviewer: actually run (below).
6. **Browser** (dev server `:5173` from root; mock API was down, A started `node mock-api/server.mjs` → `/api/products` 200; warmed with `warm.cjs`): `gradient-text-probe.cjs` at 1440,1280,375 → `gt-tree.json`, crops in `shots/`; `compare-gt.py gt-head.json gt-tree.json x` → **`ROWS 24 ALL_OK True`** (`gt-compare.txt`). Every row boxSame=True; tree fill `rgb(236, 230, 218)`, teal ≤ 0.001, core-ink contrast 13.61–15.7 (LEADMAGNET ink [232,226,214], cr 15.05). No NOT-FOUND rows; no own-HEAD capture needed.
7. **Claims after editing** (`claims-post.txt`, `claims-diff.txt`): differing ids are exactly K3 K3b K4 K6 K9 K9b K16 K19 K21 K24; K3/K3b/K4/K6/K9/K9b/K21/K24 equal `claims-449-sketch-output.txt`; K16 = doc l.4 with `prefix-294-files=1`; K19 `dirty-outside-grants 0 dirty-in-grants 12`.
8. **git status:** 10 modified + 2 new, all in `grants-449.txt` (comm check empty).

## Changed files
`app/styles/app.css`, `app/styles/base/utilities.css`, `app/components/home/HeroSection.tsx`, `app/components/home/NewsletterSection.tsx`, `app/components/home/StudioShowcase.tsx`, `app/components/marketing/LeadMagnetPopup.tsx`, `app/routes/$.tsx`, `app/routes/_index.tsx`, `app/routes/about.tsx`, `app/lib/__tests__/studio-naming.test.tsx` (NM2 title only), NEW `app/lib/__tests__/store-gradient-text.test.ts`, NEW `docs/implementation/2026/quarter-IV/294-store-2b-3a-gradient-text.md`. No protected, Studio or out-of-grant file touched.

## code-reviewer (actual subagent run): no Critical/High, 8/10. Not applied: the sketch is B-reviewed, mutant-pinned and K24-pinned. Passed to B.
- **Medium A-R449-REVIEW-GT1-TSX:** GT1 scans CSS only; gradient text re-introduced via Tailwind `bg-clip-text text-transparent`, `[background-clip:text]` or inline `WebkitBackgroundClip` in TSX would pass. Today the only TSX hit is `app/components/loading/CinemaCurtainLoader.tsx:208` (inline teal gradient + clip), which is **dead** (only barrel exports; already in LEGACY-DEAD-STORE-COMPONENTS and the `store-teal-sweep` allow-list), so no live regression. Proposal for B: a GT1b TSX scan in 2b-3b/2b-3c with CinemaCurtainLoader allow-listed.
- Lows (→ B / `deferred_low_polish`): parser ignores CSS strings (`{`/`;` inside `content:`); allow-list key is selector text without file; fill regex misses `rgb(0 0 0 / 0)` / `rgba(0,0,0,0)`; `studio.css` outside GT1 scope (state intent if deliberate); `in ALLOW_LIST` vs `Object.hasOwn`; two identical allow-list types; NM2 local var still named `glow` (not renamed: task requires NM2 assertions byte-identical); `store-header-footer.test.tsx:124` selects `.text-glow` (styling-class selector, now trivially true; outside grants).
- Architecture note: none.

## B acceptance actually passed (A side)
A steps 1–8 as above. My 24-row compare used B's HEAD json; C must run C3 independently against its own HEAD server.

## Not done / known gaps
- C rows C4–C9, C11, C12 not run by A (C's job). C8 WebKit BLOCKED in cloud.
- Full suite / verify not run (speed rules; gate).
- The mock API A started was stopped at its background time limit after A finished; it is down. C must start it with `node mock-api/server.mjs` per the task.

## Exact next C checks
C1 scope (12 grant paths), C2 claims vs planning/sketch outputs, C3 HEAD `:5178` vs tree `:5173` `ROWS 24 ALL_OK True`, C4 default motion, C5 LeadMagnet dialog vs HEAD, C6 selection, C7 forced-colors, C9 Studio 0 px, C10 covering 16/190, C11 mutants on a committed C scratch, C12 Studio + purchase protection, C13 doc 294.
