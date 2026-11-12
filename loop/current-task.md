# Round 458: STORE-2b-3c-2a re-dispatch v3: the walker resolves directory specifiers like both real resolvers and keeps names across comments (ruling on A-R457-REVIEW-M1)

**Planned by:** B, at the round 457 → 458 planning, 2026-11-12 (`b-round-457.md`).

**Process:**
- **Advisor:** available, and consulted after orientation. It asked for three things:
  - a ruling on the whole class, not only P1 and P2;
  - an explicit ruling on P4b, P5 and the reviewer's Lows;
  - a stop-loss, so that this walker does not take a fourth round.
- **Archive:** the round-457 task is saved as `tasks/round-457.md`, byte-identical (`cmp` OK).
- **Baseline:** HEAD `db95f40`. Gate 457 is `skipped` (C FAIL), so gate 455's published `commit` is still the base [K1].

**Tree state:** not clean, as expected. It holds:
- the round-456 sketch, the round-457 delta and the round-457 doc 299;
- 6 dirty paths, which are exactly the 6 grants [K2]. `sha256sum -c b-round-456/sketch-files-sha256.txt` gives 4 OK [K11].

This round builds on that work and reverts nothing.

**Type:** test-only, plus doc lines. No app source, CSS, route or Studio file changes. The reference-first, `product-designer`, screen-budget and journey rules do not apply (policy: "Not in scope: … test-only"). C still runs the Studio and purchase-protection smoke, so `browserVerified` stays real.

## Ruling on A-R457-REVIEW-M1 (L10)

**Accepted as a Medium,** origin B spec.
- A found it with the code-reviewer, and C reproduced it independently (`c-round-457/probe-replay.txt`). C's replay is recorded as `confirmedBy` on this id (L7).
- Exposure today is latent. `app/` has one file/folder pair with the same name, `lib/utils` [K3], and no non-test importer uses a directory-form, `'.'` or `'..'` specifier [K4].

**What the real resolvers do.** B measured both, and they disagree:
- **Vite/vitest:** relative `'./u/'` → the file `u.ts`; alias `'~/…/u/'` → `u/index.ts`; `'./u/index'` → `u/index.ts`. Source: `b-round-457/probe/vite-resolution.txt` [K5], from a real vitest import on the scratch.
- **TypeScript:** `tsc --moduleResolution bundler` resolves `'./u/'` to `u/index.ts`. A measured this (`a-round-457.md`).

The walker must therefore follow every file that either resolver may pick.

**The fix** lives in the walker only (`style-scan.ts`). The target string stays exactly as now (extension and `/index` removed), so GT5b's equality checks do not change.

`resolveSpecifier` now returns `{ target, form }` (new export `SpecifierForm`, field `ResolvedImport.form` [K6]), and the new `scriptFilesFor` resolves each form:

| Form | Specifier shape | Follows |
|---|---|---|
| `'module'` | plain (`'~/lib/u'`) | the file first, then the index. Unchanged; both resolvers agree. |
| `'directory'` | trailing slash (`'~/lib/u/'`) | **both** the file and the index, when present. Over-reach is fail-closed. |
| `'index'` | explicit `/index` or `/index.tsx` | the index only. Both resolvers agree; dropping the sibling file is correct (tech-lead). |

`unfollowedLocalSpecifiers` (LT9) compares `form|target` pairs. So `'./a/index'` next to a lone `a.tsx` is now reported as unfollowed.

**P4b and P5 are fixed in the same delta.** Both lose names (not targets), so the target-level LT9 could not see them.
- A third union arm, `withoutCommentsOutsideStrings`, strips comments but keeps string literals. Strings like `'audio/*'` therefore no longer open a fake comment, and P5 is closed.
- On that arm only, a clause that fails the strict grammar `IMPORT_CLAUSE_GRAMMAR` becomes a whole-module edge. This closes P4b, where `interface P {}` was swallowed into the clause.
- B tried the grammar fallback on every arm first. That over-reached by 2 files, because the comment `// Barrel export for …` starts a pseudo statement (`b-round-457/probe/grammar-fallback-hits.txt`). Hence the fallback is limited to this arm.

**Reviewer Low #3 is fixed here,** because it fails open in LT7's unsafe direction. The `tokenPattern` lookahead `(?![\w-])` becomes `(?![A-Za-z0-9-])` [K7], so `animate-[playButtonPulse_1s_infinite]` and `[&_.value-card_span]` count as consumers. LT10 pins both forms and the `value-card-x` control.

**Measured effect:**
- The reached set is **identical** to round 456: 294 files, `same_as_v2=yes` [K12].
- No LT7 verdict flips.
- A's probe on the sketch: P1, P2, P4b and P5 now reach the leaf; the P3 and P4 controls are unchanged (`b-round-457/probe/probe-457-on-sketch458.txt`).

**The false sentence is withdrawn.** "`resolveSpecifier` … can only add matches" was wrong: stripping is what merged `u/` into `u`. Doc 299 l.24 contains the sentence today [K9]; A rewrites it (see the Ruling lines).

**The other reviewer Lows:**
- **#4** (a duplicate `bodies.length` assertion) and **#5** (the unreachable `target === null`) are moved to `deferred_low_polish` as A-R457-REVIEW-L4 and L5. They change nothing about any verdict.
- **#2** (P4b and P5) is closed by this delta.
- **#6** (the doc sentence) is closed by the doc rewrite.

**Union arms are each pinned.** The round-457 mutants M21 and M22 are re-anchored, and each now deletes the arms it named together with the new string-aware arm. To keep every arm pinned on its own, two single-arm mutants were added; both are red on LT9:
- **M21a** deletes only the `withoutComments` arm. Its first run survived, so B added one LT9 fixture: a regex literal with a backtick, then an import with a comment in its braces, then a template literal. The string-aware arm swallows that import, and the raw arm cannot parse it, so only this arm follows it.
- **M22a** deletes only the raw arm.

The survivor run is kept in `b-round-457/mutants/SUPERSEDED-mutants-single-arm-before-fixture.txt` (superseded by `mutants.txt`); the final `mutants.txt` has 42 lines.

**Review.** `tech-lead` gave **APPROVE** on sha `20a2cd7e…`, then re-reviewed the dispatched sha `39839288…`, which adds only that fixture (`b-round-457/sketch-review.md`). Neither review found a Medium or higher issue. Its four Lows go to `deferred_low_polish` and onto TL-R455-WALKER-LIMITS; each has zero occurrences in `app/`:
- **TL-R458-L1:** a regex literal containing `/*` or a backtick blinds the comment-stripping arms.
- **TL-R458-L2:** `'.'` and `'..'` are classified as plain modules.
- **TL-R458-L3:** an explicit `.tsx` specifier loses to a sibling `.ts` file. This predates the round.
- **TL-R458-L4:** a leading `_` is still rejected. This fails closed.

**Stop-loss for this walker (adopted with tech-lead).** It answers two separate questions, and the first rule wins over any severity a reviewer assigns.
1. **Does round 458 close?** This is decided mechanically. A newly found fail-open walker form is a **STOP** only when one of these holds:
   - its occurrence count in non-test `app/` is above 0;
   - it flips a named LT7 or GT5b verdict on the tree.

   Otherwise it is a Low on TL-R455-WALKER-LIMITS, and the round continues to C even if the reviewer labels it Medium. For a form that `b-round-457/walker-forms.py` does not count, A saves its grep command and count in `a-round-458/new-walker-forms.txt`, and C replays it.
2. **What does B schedule next?** If a third Medium-class walker form is found (after A-R456-REVIEW-M1 and A-R457-REVIEW-M1), B plans a separate task at the next planning. That task replaces the regex matcher with a parser-based walker (the TypeScript compiler API), never a regex patch. This never stops round 458.
- tech-lead's CI-tripwire amendment is recorded as TL-R458-TRIPWIRE-GUARD (`deferred_low_polish`). This round uses C8b instead.

## Ruling lines (L4)
- **Tree vs this delta:** the delta wins only on the lines it changes. Every other byte of the four test files stays as it is in the tree. C checks this with `sha256sum -c b-round-457/sketch-files-sha256.txt` after apply (4 OK).
- **No assertion lost; equal or stronger replacements allowed.** One assertion value changes:
  - The LT9 row `"const accept = 'audio/*'; … from './q'"` goes from `['./q']` to `[]`, because the hazard it pinned is now followed.
  - Its equal-or-stronger replacement: the new LT9 row with a regex literal `/\/*/` still expects `['./q']`. It is the remaining hazard, caught by LT9.
  - LT10 pins the followed case (`kit/Row.tsx` reached).
  - New LT9 rows: the regex-literal backtick row (followed, `[]`, which pins M21a) and the `'./a/index'` row.
  - The `expect(` count goes from 62 to 76 in live-teal. Glow-shadow (21), gradient-text (23) and teal-sweep (10) are unchanged [K8].
- **Doc 299:** A rewrites it for this round.
  - **l.4** reads exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 458 PASS)` (L28 re-dispatch clause).
  - **l.24 (მიდგომა):** the sentence "… რაც მხოლოდ დამთხვევებს ამატებს" is removed. It is replaced by the three-form rule, with both measured resolvers named (Vite: `b-round-457/probe/vite-resolution.txt`; TypeScript: A round 457), the string-aware arm and its grammar fallback. After A, the grep in [K9] returns 0.
  - **პრობლემები და გადაწყვეტები** gains one A-R457-REVIEW-M1 Problem → Solution entry, covering P1, P2, P4b and P5.
  - **ტესტირება** cites LT9 and LT10 and the mutant range M1–M38.
  - **TODO** names the stop-loss and TL-R458-L1..L4.
  - The doc keeps the TEMPLATE headings in order, has no `pending`, and keeps l.3 as `**თარიღი:** 2026-11-11`.
- **Doc 298:** no byte changes. l.4 stays `Completed (C round 455 PASS)`.

## 1. Changes
**A runs `git apply b-round-457/sketch-458-delta.patch.txt` (sha256 in `b-round-457/sketch-458-delta.sha256`) on the current tree. A makes no hand edits to the four test files, then rewrites doc 299.**

The grants (`b-round-457/grants-458.txt`) are the same 6 paths as round 457, measured against `db95f40`:
1. `app/lib/__tests__/helpers/style-scan.ts`: the tree + delta. It adds:
   - `SpecifierForm` and the field `ResolvedImport.form`;
   - private `ResolvedSpecifier`, `IMPORT_CLAUSE_GRAMMAR`, `QUOTED_OR_COMMENT` and `withoutCommentsOutsideStrings`.

   `scriptFileFor` becomes `scriptFilesFor`, which returns a list. `resolvedImports` gains an optional `wholeOnUnparsedClause = false`.
2. `app/lib/__tests__/store-live-teal.test.ts`: the tree + delta. It contains:
   - the `tokenPattern` lookahead change;
   - the LT9 changes described in the Ruling lines;
   - two added LT9 rows: the regex-literal backtick row (followed), and `'./a/index'` unfollowed while `'./dir/index'` and `'./a/'` are followed;
   - the new LT10.
3. `app/lib/__tests__/store-glow-shadow.test.ts`: unchanged this round.
4. `app/lib/__tests__/store-gradient-text.test.ts`: unchanged this round.
5. `docs/implementation/2026/quarter-IV/298-saba-b-14-store-seek-thumb.md`: unchanged this round (l.4 as written in round 456).
6. `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md`: as in the Ruling lines. It stays in Georgian, with English technical terms.

Nothing else changes. These stay untouched:
- the protected auth and purchase files (`app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`);
- `app/styles/**`, `app/components/**`, `app/routes/**`, `app/root.tsx`;
- `vitest.config.ts` and `package.json` [K10].

## 2. A: steps
1. **Read** these files:
   - `lessons.md`, the A part;
   - the primitives `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `AGENT_DISCOVERABLE_CODE.md` (the delta adds the export `SpecifierForm`; tech-lead reviewed the name);
   - `docs/implementation/TEMPLATE.md`.

   The sha is pinned, so A renames nothing.
2. **Claims before.** Run `bash b-round-457/claims-458.sh > a-round-458/claims-before.txt 2> a-round-458/claims-before.err`. Expected: equal to `b-round-457/claims-458-planning-output.txt`, with empty stderr.
3. **Pre-state and apply.**
   - Run `sha256sum -c b-round-456/sketch-files-sha256.txt`: 4 OK.
   - In `b-round-457`, run `sha256sum -c sketch-458-delta.sha256`.
   - Run `git apply b-round-457/sketch-458-delta.patch.txt` in the store.
   - Run `sha256sum -c b-round-457/sketch-files-sha256.txt`: 4 OK.
4. **Rewrite doc 299** as in the Ruling lines.
5. **Checks:**
   - `npm run typecheck`: rc 0.
   - `npm run lint`: rc 0, and the warning count equals 205 (`b-round-457/precheck-lint.log`).
   - `npx biome check` on the 4 test files: rc 0, no fixes.
   - `npx vitest run --reporter=verbose $(cat b-round-457/covering-458.txt)`: 4 files and 28 tests green, with LT1–LT10 each passed (B's run: `b-round-457/precheck-covering.log`) [K13].
6. **Mutants on a scratch.**
   - Set it up: `git clone --shared` the store at `db95f40`; copy the 4 test files from the tree after step 3 and commit them; symlink `node_modules`.
   - Run `bash b-round-457/run-mutants.sh <scratch> <abs>/a-round-458/mutants/mutants.txt`.
   - Expected: `cmp`-equal to `b-round-457/mutants/mutants.txt` (42 lines: BASE and C1 green; M1–M38, M21a and M22a red, with the same test ids).
7. **Claims after.** Run `bash b-round-457/claims-458.sh > a-round-458/claims-after.txt`. Expected: equal to `b-round-457/claims-458-expected-after-A.txt`, with empty stderr.
8. **Scope.** `git status --short --untracked-files=all` shows only the 6 grants.
9. **Review.** 3+ files are in the round diff, so run `code-reviewer` on the applied delta. Pass its Architecture notes to B; do not act on them. Findings already ruled are not new; apply the stop-loss above to them:
   - TL-R455-WALKER-LIMITS;
   - TL-R458-L1..L4;
   - `b-round-457/sketch-review.md`;
   - the tech-lead reviews in `b-round-456/sketch-review.md`.

   A new zero-occurrence walker form is reported as a Low and does **not** STOP (stop-loss rule 1). Save its grep and count in `a-round-458/new-walker-forms.txt`.

**STOP (L11)** if any of these happens:
- a covering test fails;
- a mutant result differs;
- the delta does not apply;
- claims-before differs from the planning output;
- the reviewer reports a Medium+ problem whose fix is outside the grants. For walker forms, the stop-loss rule 1 decides instead: count above 0 in non-test `app/`, or a named verdict flip. Anything else is a Low and the round continues.

## 3. C: acceptance rows
**Setup:**
- Use real Chromium (Playwright) for C7.
- Servers: dev `:5173` and the mock API `:5199`. If `:5199` is down, start it detached from the loop folder: `setsid node mock-api/server.mjs > c-round-458/mock-api.log 2>&1 &`.
- Warm the dev server twice with `node b-round-448/probe/warm.cjs http://127.0.0.1:5173 / /products/pulse-loop-kit /studio-lab /studio/middle-east`.
- Run browser probes one at a time, and never during a vitest run (L38).
- Write `c-round-458/progress.json` after every row (L59).
- Run the heaviest row (C5 mutants) first.

| Row | Action | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --short --untracked-files=all` | Only the 6 `grants-458.txt` paths. `git diff db95f40 -- docs/implementation/2026/quarter-IV/298-*` is one line (l.4). |
| C2 CLAIMS | `S=<git clone --shared at db95f40 + node_modules symlink> bash b-round-457/claims-458.sh`, then the same script on the tree | The clone's output equals `claims-458-head-output.txt`. The tree's output equals `claims-458-expected-after-A.txt`. stderr is empty. Run L29's grep over this task. |
| C3 APPLY | In the store: `sha256sum -c b-round-457/sketch-files-sha256.txt` | 4 OK. |
| C4 COVERING | `npx vitest run --reporter=verbose $(cat b-round-457/covering-458.txt)` | 4 files / 28 tests green. LT1–LT10, GS1–GS4, GT1–GT5b and TS1–TS6 each appear as passed. |
| C5 MUTANTS | `run-mutants.sh` (b-round-457) on a C scratch: `db95f40` plus the tree's 4 test files, **committed**; absolute OUT | `mutants.txt` equals `b-round-457/mutants/mutants.txt` (42 lines; BASE and C1 green; M1–M38, M21a and M22a red, with the same test ids). |
| C6 NO ASSERTION LOST | Read `git diff db95f40 -- app/lib/__tests__` | Write `c-round-458/assert-map.md`. List every removed `expect(` or changed expected value with its equal or stronger replacement (the round-456 and round-457 Ruling lines in `tasks/round-456.md` and `tasks/round-457.md` still hold for their parts). The `expect(` count per file equals `b-round-457/expect-counts.txt` (sketch458 column). |
| C7 STUDIO + PURCHASE PROTECTION | From `c-round-458/`: `node <copy of b-round-453/probe/c12-run/c12-from-c448.cjs> http://127.0.0.1:5173 tree > c12-tree.json` | At 1440 and 1280, `/studio-lab` has 1 clip, shows Playing with `posPlay` > 0, then Stopped, and `stopHeld` is true. Anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. The result equals `c-round-457/c12-tree.json` except the `url`/`posPlay` timing values. |
| C8 WALKER CLASS | (a) On a C scratch with the tree's 4 test files: copy `b-round-456/probe/zz-sweep-v2.test.ts` into `app/lib/__tests__/` and run it with `SWEEP_OUT=<absolute c-round-458 path>`. (b) On the same scratch: copy `a-round-457/zz-a457-probe.test.ts` into `app/lib/__tests__/`, run it, and keep the `^\+ +"P` lines. | (a) reached 294; the `R` lines equal `b-round-457/probe/sweep-fix-v3.txt`; `ScrollReveal` is reachable. (b) The lines equal `b-round-457/probe/probe-457-on-sketch458.txt`: P1 and P2 reach `lib/u/Y.tsx`; P4b and P5 reach `kit/Row.tsx`; P3 and P4 are unchanged from `a-round-457/probe-dir-slash.txt`. |
| C8b WALKER LIMIT FORMS | `python3 -I b-round-457/walker-forms.py <store>` on the tree and on the HEAD clone; replay every grep in `a-round-458/new-walker-forms.txt`, if that file exists | Both print `brace_comment=1 dir_form=0 dot_spec=0 brace_comment_files_with_star_or_backtick=0`, and the single brace hit is `components/animations/index.ts`. Each replayed grep gives A's count. This is the stop-loss's zero-occurrence check for TL-R458-L1/L2 and any new form. A form with a count above 0, or a named verdict flip, is a FAIL (Medium); otherwise it is a Low and the row stays PASS. |
| C9 DOCS | Doc 298 l.4; doc 299 | Doc 298 is unchanged since round 456. Doc 299: l.4 is exact; the [K9] grep returns 0; the მიდგომა names the three forms and both measured resolvers; there is an A-R457-REVIEW-M1 Problem → Solution entry; the TEMPLATE headings are in order; there is no `pending`; every cited LT/GS/GT id exists in the test files. |
| C10 L57 | `python3 -I tools/l57-check.py c-round-458.json c-round-458/l57-check.txt` | rc 0. |

**Notes for C:**
- **Gate rows** (full vitest, typecheck, build, Biome, verify) are `gate`. B ran these on the dispatched sketch (`/tmp/b458`):
  - full vitest: 284 files / 4152 tests, rc 0 (`b-round-457/precheck-full.txt`, raw in `precheck-full-raw.log`) [K13];
  - `tsc`: rc 0;
  - lint: 205 warnings;
  - scoped Biome: rc 0;
  - `git apply --check` on the store tree: OK.

  Build was not run, because no app file changes.
- **BLOCKED:** none expected (no backend is needed).
- **Stop-loss for C:** rule 1 of the Ruling applies to C's own findings too. A new walker form with zero occurrences and no verdict flip is a Low in `c-round-458.json` and does not fail the round.
- `c-round-458.json` carries all L57 fields:
  - `mutantRedOnSketch` = `b-round-457/mutants/mutants.txt`;
  - `gateChecksNamed` = full vitest, typecheck, build, Biome, verify;
  - `gateChecksRunOnSketch` = `b-round-457/precheck-full-raw.log`;
  - `chainHeadGateRunGreen` (gate 455);
  - `affectedChecksNamed` = covering-458, mutants, walker class, walker limit forms, c12;
  - `affectedChecksRunOnSketch` = `b-round-457/precheck-covering.log`.

**Neighbours that could break:**
- GT5b reads the same edges. Its target strings are unchanged, and it is in the covering set.
- LT7's consumer lookahead is now wider, which can only add consumers (fail-closed). LT7 stays green on the sketch.
- Nothing user-visible: no app file changes, and C7 confirms it.
- SIG-R457-LT9-COVERING still holds: a later store round that adds a relative URL string or worker must put `store-live-teal.test.ts` in its covering set.

## 4. Claims
- K1–K14 are in `b-round-457/claims-458.sh`.
- K13 pins the precheck numbers. K14 checks that every cited artifact exists (L56).
- Saved outputs:
  - clean HEAD clone: `claims-458-head-output.txt`;
  - store tree at planning: `claims-458-planning-output.txt`;
  - scratch, docs at HEAD: `claims-458-sketch-output.txt`;
  - expected after A: `claims-458-expected-after-A.txt`.

## Known limits (recorded, not in scope)
- **TL-R455-WALKER-LIMITS** (Low): JSX use is not modelled, and commented-out imports fail closed. It is extended by TL-R458-L1..L4.
- **TL-R458-TRIPWIRE-GUARD** (Low): tech-lead's CI-guard idea.
- **A-R456-REVIEW-L1/L2** and **A-R457-REVIEW-L4/L5** (Low): in `deferred_low_polish`.

## Architecture checkpoint
- ARCH-CHECKPOINT-STYLE-SCAN (`b-round-455-checkpoint-request.md`) is still open, with no root answer yet.
- New signals for it:
  - the round-457 code-reviewer suggests `helpers/mount-graph.ts`, with LT8/LT9/LT10 as its acceptance tests;
  - this is the **third consecutive round** on one owner (`style-scan.ts`);
  - under the stop-loss, a parser-based walker is the escalation path.
- `b-round-457/checkpoint-request-addendum.md` asks root for a bounded `frontend-architect` checkpoint. It is non-blocking, and A does not act on it.

## 5. After this round
1. REGRESSION-2026-11-13, if round 459 is planned on or after 2026-11-13 (`regression-last.json`: next due on or after 2026-11-13).
2. SABA-B-13 entrance (STORE-2b-ENTRANCE).
3. 2b-3c-2b.
4. 2b-3d.
5. 2b-4.
6. STORE-2c…5.
7. DP-GATE (root).
8. ARCH-SPLIT.
9. REVIEW-RECOMMENDATIONS.
10. T12-ADVANCED.
11. Phase 2, under the skip rule.

The next RETRO is round 465.
