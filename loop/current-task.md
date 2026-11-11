# Round 457: STORE-2b-3c-2a re-dispatch — the mount walker follows every local import (ruling on A-R456-REVIEW-M1)

**Planned by:** B, at the round 456 → 457 planning, 2026-11-11 (`b-round-456.md`).
- **Advisor:** available. I consulted it after orientation and before writing. It asked for a ruling on the whole class of bug, not only the ScrollReveal case; a union fix that cannot fail open; re-pinned numbers; new mutants; and a tech-lead review of the exact dispatched sha.
- **Archive:** the round-456 task is saved as `tasks/round-456.md`, byte-identical (`cmp` OK).
- **Baseline:** HEAD `db95f40`. Gate 456 is `skipped` (C FAIL), so gate 455's published `commit` is still the base [K1].
- **The tree is not clean, and that is expected.** A's round-456 work stays in place: the round-456 sketch, applied byte-exact (`b-round-455/sketch-files-sha256.txt`: 3 OK), plus doc 298 l.4 and the new doc 299. There are 5 dirty paths [K2]. This round builds on them and does not revert or redo them.
- **Type:** test-only, plus doc lines. No app source, CSS, route or Studio file changes. The reference-first, `product-designer`, screen-budget and journey rules do not apply (policy: "Not in scope: … test-only"). C still runs the Studio and purchase-protection smoke, so that `browserVerified` stays real.

## Ruling on A-R456-REVIEW-M1 (L10)
- **Accepted as a Medium.** The finding came from B's spec (origin B spec). C confirmed it independently (`c-round-456/flip-probe-c.log`).
- **The bug.** `IMPORT_STATEMENT` drops any `import`/`export … from` statement that has a comment inside its braces.
  - So the walker reported `components/animations/ScrollReveal.tsx` as unmounted, although `routes/_index.tsx:39` imports it through the commented barrel `components/animations/index.ts` [K3][K4].
  - This is the unsafe direction for LT7's "unmounted" verdicts: a mounted file could pass as unmounted.
- **B swept the whole class at the round-456 sketch.** B compared every local specifier literal in `app/` with what the matcher returns (`b-round-456/probe/sweep-sketch456.txt`). Two more silent drops showed up:
  - the five worker files, loaded through `new URL('./x.worker.ts', import.meta.url)` [K5];
  - side-effect `import '…'` and `export * as N from` (none in `app/` today [K6]). These would also fail open, and the tech-lead reproduced `export * as N` in a simulation.
- **The fix lives in the walker only.** `resolvedImports` keeps its matcher. `resolveSpecifier` drops `?query`/`#hash` and trailing slashes, which can only add matches.
  - The walker uses `mountGraphImports`, the union of four sources:
    - the matcher on the raw source;
    - the matcher on the comment-stripped source;
    - side-effect imports and `new URL(…, import.meta.url)` edges, both as whole-module edges;
    - `export * as N` handled as one name: when `N` is requested, the whole target is followed. The raw namespace entry also stays. That over-reach fails closed, and LT8 pins it: the sibling barrel file is reached, its leaf is not.
  - The union is why the fix cannot fail open. Comment stripping alone eats real imports after a string such as `'/*'` or `'audio/*'`; the raw arm keeps them, and LT9 catches the combined case.
- **GT5b switches to the same edges** (`store-gradient-text.test.ts`, one import and one call: `importsDeadModule` uses `mountGraphImports`). `.some` over a larger set can only make GT5b stricter. This is the one grant added since round 456. Without it, GT5b would keep a known blind spot of the same kind (tech-lead finding 8).
- **A permanent guard, LT9.** Every `'~/…'`, `'./…'` or `'../…'` literal in app source must be followed by the walker and must resolve to a script file or a known asset extension. `UNFOLLOWED_SPECIFIER_ALLOW_LIST` is the reasoned escape hatch, empty today, with a no-stale check. The next unusual import syntax therefore turns LT9 red instead of reading "unmounted".
- **Measured effect** (`b-round-456/probe/flips-288-to-v2.txt`) [K12]:
  - the reached set grows from 288 to 294 files and is a strict superset (lost = 0);
  - the 6 new files are ScrollReveal and the 5 workers;
  - none of the four `unmounted` dead consumers (TrackRow, WaveForm, TrackRowSkeleton, PianoLoadingAnimation) flips, so LT7's verdicts at HEAD hold.
- **Review.** `tech-lead` reviewed the delta three times (`b-round-456/sketch-review.md`):
  - v1: APPROVE-WITH-CHANGES, findings 1–8, all applied;
  - v2: APPROVE-WITH-CHANGES, N1 (a namespace-target filter failed open) and N2 (GT5b weaker), both Medium, plus N3 (Low). All three were fixed in v3; M30 re-adds the v2 filter and is red;
  - v3: **APPROVE** on the dispatched sha `2b97313c…`, no new Medium+. The sibling-barrel over-reach is accepted as fail-closed.

## Ruling lines (L4)
- **Round-456 sketch vs this delta:** the delta wins only on the lines it changes. Every other byte of the three round-456 sketch files stays as A applied it. C checks this with `sha256sum -c b-round-456/sketch-files-sha256.txt` after apply.
- **No assertion lost; equal or stronger replacements allowed.** The delta only adds `expect(` calls: live-teal goes from 55 to 62; glow-shadow (21), gradient-text (23) and teal-sweep (10) are unchanged [K8]. The LT8 expected list gains entries and drops none.
- **Doc 299:** A rewrites it for this round.
  - l.4 must read exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 457 PASS)` (L28 re-dispatch clause).
  - l.5 lists the 4 test files.
  - The მიდგომა walker sentence must describe the union (raw + comment-stripped matcher, side-effect imports, `import.meta.url` workers, `export * as`) and LT9, not "follows `import`/`export … from`" alone.
  - პრობლემები და გადაწყვეტები gains one A-R456-REVIEW-M1 Problem → Solution entry.
  - The doc cites LT9 and GT5b.
- **Doc 298:** l.4 stays as A wrote it in round 456 (`Completed (C round 455 PASS)`). No byte of doc 298 changes in this round.

## 1. Changes
**A runs `git apply b-round-456/sketch-457-delta.patch.txt` (sha256 `2b97313c…`, in `b-round-456/sketch-457-delta.sha256`) on the current tree, with no hand edits to the four test files, then rewrites doc 299.**

Grants (`b-round-456/grants-457.txt`), exactly these 6 paths, measured against `db95f40`:
1. `app/lib/__tests__/helpers/style-scan.ts`: round-456 sketch + delta.
   - Adds `mountGraphImports` and `unfollowedLocalSpecifiers`, with private `SIDE_EFFECT_IMPORT`, `IMPORT_META_URL_MODULE`, `NAMESPACE_RE_EXPORT`, `LOCAL_SPECIFIER_LITERAL`, `NON_SCRIPT_MODULE`, `wholeModuleImports` and `namespaceReExports`.
   - `reachableScripts` reads `mountGraphImports` and forwards `export * as N` as the whole target.
   - `resolveSpecifier` strips the query, hash and trailing slash.
2. `app/lib/__tests__/store-live-teal.test.ts`: round-456 sketch + delta.
   - LT8 gains these fixtures: a commented barrel, a `'/*'` string before an import, a side-effect import, a worker URL, an `export * as` barrel (with a sibling barrel reached and its leaf not), and a barrel holding both `export *` and `export * as` of the same target.
   - LT9's self-tests also cover `?worker`, `?url`, `#`, a trailing slash, a missing file, and the comment-strip hazard.
   - New LT9 (see the Ruling) and `UNFOLLOWED_SPECIFIER_ALLOW_LIST`.
3. `app/lib/__tests__/store-glow-shadow.test.ts`: round-456 sketch only (unchanged by the delta).
4. `app/lib/__tests__/store-gradient-text.test.ts`: delta only. `mountGraphImports` replaces `resolvedImports` in `importsDeadModule`, and GT5b gains 3 positive rows: `export * as Aud from '~/components/audio'`, a comment-in-brace import and a side-effect import. The `expect(` count is unchanged.
5. `docs/implementation/2026/quarter-IV/298-saba-b-14-store-seek-thumb.md`: l.4 as already written in round 456; nothing new.
6. `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md`: as in the Ruling lines.
   - Georgian, with English technical terms.
   - `docs/implementation/TEMPLATE.md` headings in order.
   - l.3 reads `**თარიღი:** 2026-11-11`.
   - No `pending`.

Nothing else changes. These stay untouched:
- the protected auth and purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`);
- `app/styles/**`, `app/components/**`, `app/routes/**`, `app/root.tsx`;
- `vitest.config.ts` and `package.json`.

## 2. A: steps
1. Read `lessons.md` (the A part); the primitives `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md` and `AGENT_DISCOVERABLE_CODE.md`; and `docs/implementation/TEMPLATE.md`. The new export names follow the tech-lead's naming review (finding 7). The sha is pinned, so A does not rename anything.
2. `bash b-round-456/claims-457.sh > a-round-457/claims-before.txt 2> a-round-457/claims-before.err`. Expected: equal to `b-round-456/claims-457-planning-output.txt`, with empty stderr.
3. Pre-state check: `sha256sum -c b-round-455/sketch-files-sha256.txt` (3 OK). Then, in `b-round-456`, `sha256sum -c sketch-457-delta.sha256`. Then `git apply b-round-456/sketch-457-delta.patch.txt` in the store. Then `sha256sum -c b-round-456/sketch-files-sha256.txt` (4 OK).
4. Rewrite doc 299 as in the Ruling lines.
5. Run these checks:
   - `npm run typecheck`;
   - `npm run lint`: the warning count must equal 205, the same as `b-round-456/precheck-lint.log`;
   - `npx biome check` on the 4 test files: no format diff;
   - `npx vitest run --reporter=verbose $(cat b-round-456/covering-457.txt)`: 4 files / 27 tests green (B: `b-round-456/precheck-covering.log`) [K13].
6. Mutants on a scratch: `git clone --shared` at `db95f40`, then apply `b-round-455/sketch-456.patch.txt` and commit, then apply `b-round-456/sketch-457-delta.patch.txt` and commit, with `node_modules` symlinked. Run `bash b-round-456/run-mutants.sh <scratch> <abs>/a-round-457/mutants/mutants.txt`. Expected: equal to `b-round-456/mutants/mutants.txt` (34 lines: BASE and C1 green; M1–M32 red).
7. `bash b-round-456/claims-457.sh > a-round-457/claims-after.txt`. Expected: equal to `b-round-456/claims-457-expected-after-A.txt`, with empty stderr.
8. `git status --short --untracked-files=all`: only the 6 grants.
9. 3+ files changed, so run `code-reviewer`. Pass its Architecture notes to B; do not act on them. Findings already on TL-R455-WALKER-LIMITS, or in the tech-lead reviews in `b-round-456/sketch-review.md`, are not new.

**STOP (L11)** if any of these happens:
- a covering test fails;
- a mutant result differs;
- the delta does not apply;
- claims-before differs from the planning output;
- your reviewer shows a Medium+ problem whose fix is outside the grants. This includes a new silent-drop form of the walker.

## 3. C: acceptance rows
**Setup:**
- Use real Chromium (Playwright) for C7.
- Servers: dev `:5173` and the mock API `:5199`. If `:5199` is down, start it detached from the loop folder: `setsid node mock-api/server.mjs > c-round-457/mock-api.log 2>&1 &`.
- Warm the dev server twice with `node b-round-448/probe/warm.cjs http://127.0.0.1:5173 / /products/pulse-loop-kit /studio-lab /studio/middle-east`.
- Run browser probes one at a time, and never during a vitest run (L38).
- Write `c-round-457/progress.json` after every row (L59).
- Run the heaviest row (C5 mutants) first.

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --short --untracked-files=all` | Only the 6 `grants-457.txt` paths. `git diff db95f40 -- docs/implementation/2026/quarter-IV/298-*` is one line (l.4). |
| C2 CLAIMS | `S=<git clone --shared at db95f40 + node_modules symlink> bash b-round-456/claims-457.sh`, then the same script on the tree | The clone's output equals `claims-457-head-output.txt` (B ran the same command on a clean `db95f40` clone). The tree's output equals `claims-457-expected-after-A.txt`. stderr is empty. Run L29's grep over this task. |
| C3 APPLY | In the store: `sha256sum -c b-round-456/sketch-files-sha256.txt` | 4 OK. |
| C4 COVERING | `npx vitest run --reporter=verbose $(cat b-round-456/covering-457.txt)` | 4 files / 27 tests green. LT1–LT9, GS1–GS4, GT1–GT5b and TS1–TS6 each appear as passed. |
| C5 MUTANTS | `run-mutants.sh` on a C scratch: `db95f40`, then A's diff of the 4 test files applied **and committed**; absolute OUT | `mutants.txt` equals `b-round-456/mutants/mutants.txt` (34 lines: BASE and C1 green; M1–M32 red with the same test ids). |
| C6 NO ASSERTION LOST | Read `git diff db95f40 -- app/lib/__tests__` | Write `c-round-457/assert-map.md`, listing every removed `expect(` with its equal or stronger replacement (the round-456 Ruling lines in `tasks/round-456.md` still hold for the sketch-456 part). The `expect(` count per file equals `b-round-456/expect-counts.txt` (live-teal 27 → 62, glow-shadow 18 → 21, gradient-text 23, teal-sweep 10; none lower than HEAD). |
| C7 STUDIO + PURCHASE PROTECTION | From `c-round-457/`: `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> http://127.0.0.1:5173 tree > c12-tree.json` | At 1440 and 1280, `/studio-lab` has 1 clip, shows Playing with `posPlay` > 0, then Stopped, and `stopHeld` is true. Anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. The result equals `c-round-456/c12-tree.json` except the `url`/`posPlay` timing values. |
| C8 WALKER CLASS | On a C scratch with the tree's 4 test files, copy `b-round-456/probe/zz-sweep-v2.test.ts` into its `app/lib/__tests__/` and run it with `SWEEP_OUT=<absolute c-round-457 path>` (B's output: `probe/sweep-fix-v2.txt`) | 0 unfollowed specifiers; reached 294; the reached set equals `probe/sweep-fix-v2.txt`'s `R` lines; `ScrollReveal` is reachable. |
| C9 DOCS | Doc 298 l.4; doc 299 | Doc 298 l.4 is unchanged since round 456. Doc 299: l.4 is exact; the TEMPLATE headings are in order; there is no `pending`; the walker sentence names the union and LT9; there is an M1 Problem → Solution entry; every cited LT/GS/GT id exists in the test files. |
| C10 L57 | `python3 -I tools/l57-check.py c-round-457.json c-round-457/l57-check.txt` | rc 0. |

**Notes for C:**
- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate`. B ran the following on the dispatched sketch (`/tmp/b457-scratch`):
  - full vitest: 284 files / 4151 tests, rc 0 (`b-round-456/precheck-full-raw.log`) [K13];
  - `tsc` rc 0 (`precheck-typecheck.log`);
  - lint: 205 warnings, the same as HEAD (`precheck-lint.log`);
  - scoped Biome on the 4 test files: rc 0, no fixes (`precheck-biome-scoped.log`);
  - `git apply --check` of the delta on the current store tree: rc 0 (`apply-check.txt`).
  - Build was not run: no app file changes.
- **BLOCKED:** none expected (no backend is needed).
- `c-round-457.json` carries all L57 fields:
  - `mutantRedOnSketch` = `b-round-456/mutants/mutants.txt`;
  - `gateChecksNamed` = full vitest, typecheck, build, Biome, verify;
  - `gateChecksRunOnSketch` = `b-round-456/precheck-full-raw.log`;
  - `chainHeadGateRunGreen` (gate 455);
  - `affectedChecksNamed` = covering-457, mutants, walker class, c12;
  - `affectedChecksRunOnSketch` = `b-round-456/precheck-covering.log`.

**For later store rounds:** LT9 scans every app script. A store round that adds a relative `Link`/`navigate`/`fetch` string, or a new worker URL, must put `store-live-teal.test.ts` in its covering set, or it fails only at the gate (SIG-R457-LT9-COVERING).

**Neighbours that could break:**
- `store-gradient-text.test.ts` GT5b (now stricter) and `store-teal-sweep.test.ts`, both in the covering set.
- Nothing user-visible: no app file changes, and C7 confirms it.

## 4. Claims
- K1–K14 are in `b-round-456/claims-457.sh`. K13 pins the precheck numbers (covering, full suite, lint, `tsc`, Biome, apply-check, `expect(` counts); K14 checks that every cited path exists.
- Saved outputs:
  - clean HEAD clone: `claims-457-head-output.txt`;
  - planning: `claims-457-planning-output.txt`, on the store tree at planning;
  - sketch: `claims-457-sketch-output.txt`, on the scratch, where docs are at HEAD;
  - expected after A: `claims-457-expected-after-A.txt`.

## Known limits (recorded, not in scope)
- **TL-R455-WALKER-LIMITS** (Low, `deferred_low_polish`): the walker does not model JSX use, and commented-out imports fail closed. A finding on that list is not a new bug.
- **A-R456-REVIEW-L1 and L2** (Low, `deferred_low_polish`): the `ImportBinding.exported` name, and the `cssRuleBodies` last-compound match. Both are sketch-pinned; owner: ARCH-CHECKPOINT-STYLE-SCAN or the polish pass.

## Architecture checkpoint
- ARCH-CHECKPOINT-STYLE-SCAN (`b-round-455-checkpoint-request.md`) is still open, with no root answer yet.
- The code-reviewer's round-456 suggestion (move the walker to `helpers/import-graph.ts`) is added to it as a signal.
- It is non-blocking, and A does not act on it.

## 5. After this round
1. SABA-B-13 entrance; if round 458 is planned on or after 2026-11-13, REGRESSION-2026-11-13 runs first.
2. 2b-3c-2b.
3. 2b-3d.
4. 2b-4.
5. STORE-2c…5.
6. DP-GATE (root).
7. ARCH-SPLIT.
8. REVIEW-RECOMMENDATIONS.
9. T12-ADVANCED.
10. Phase 2, under the skip rule.

The next RETRO is round 465.
