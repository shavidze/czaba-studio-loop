# Round 452: SYS-R450-STORE-STYLE-SCAN re-dispatch — sketch v5 restores GT5's HEAD barrel scope (test-only fix-up)

**Planned by:** B at the round 451 → 452 planning, 2026-11-11 (`b-round-451.md`). The advisor was available and was consulted after orientation and before writing. The round-451 task is archived as `tasks/round-451.md`, a byte-identical copy.

## Decisions
All are in `backlog.json` (v440 → v441) under `decisions_log_b`.
- **D-29z1605: round 451 = short FAIL, routed to B.**
  - C round 451: `taskStatus` FAIL (STOPPED), `browserVerified`/`realVerified` true. C1–C3, C10, C11 and C12 passed, and C reproduced the STOP's named check.
  - C4–C9 were **not** C-verified. A's own results for them do not count.
  - Gate 451 was `skipped` (C FAIL), so the baseline stays gate 449's `a8599a2` [K1] [K2].
  - **A-R451-REVIEW-M1-GT5-BARREL-SCOPE (Medium, origin `B spec`)** is open and scheduled here. SYS-R450-STORE-STYLE-SCAN and its 7 ids stay open until this round passes C and the gate.
- **D-29z1606: round 452 = this re-dispatch.**
  - B rules the Medium as **fixed, not accepted** (L10).
  - REGRESSION is due on or after 2026-11-13, not now [K26].
- **D-29z1607: tech-lead review 4 on v5: APPROVE.** The residual rulings are in §5.

## Rules
- **Read `lessons.md` first.** L4 "Port preserves HEAD" applies again. The v4 miss is exactly the class L4 names: a HEAD exclusion list was widened and mapped as "stronger". This round adds the HEAD-pin mutants N11/N11b and a whole scope sweep (§6).
- **Not applicable in a test-only round:** reference-first, the Ableton conformance table, the product-designer step and the screen budget. Nothing visible changes.
- **L57:** C's JSON carries all L57 fields. `mutantRedOnSketch` names `b-round-451/mutants.txt` and `b-round-451/head-mutants/mutants.txt`. Every bug carries an enum `origin`. Before hand-off, C runs `python3 -I tools/l57-check.py c-round-452.json c-round-452/l57-check.txt` and gets rc 0.
- **L29:**
  - Each fact about `store/` ends with a `[K#]` tag. The commands are in `b-round-451/claims-452.sh`.
  - B's outputs are `b-round-451/claims-452-planning-output.txt` (run on A's round-451 tree in `store/`, before this round) and `b-round-451/claims-452-sketch-output.txt` (run with `STORE_ROOT=/tmp/b452-atree`: A's tree plus the v5 delta plus doc 295 l.4 set to 452, i.e. the expected end state).
- **L60:** A never uses `git stash`, `git checkout --`, `sed -i` or other shell string edits in the store tree. Apply the sketch with `git apply`, then edit doc 295 with the editor tools only. Round 451 used one `sed -i` on doc 295 (INFO-A451-L60-SED-DOC); do not repeat it.
- **Speed rules:** A runs `npm run typecheck`, `npm run lint` and the covering files only. C does not run the full suite. Full verify is a gate row.

## Baseline: HEAD `a8599a2`, tree = A's round-451 work (v4 applied + doc 295)
- **Gate:** gate 449 published `a8599a2`; gates 450 and 451 are `skipped` [K1]. HEAD is `a8599a2` [K2].
- **Frozen files:**
  - `b-round-451/r452-tree-sha256.txt` lists every tracked file except the grants, **1,366** entries (identical to round 451's manifest). From `store/`, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-451/r452-tree-sha256.txt` gives rc 0 [K3].
  - The 11 protected files in `b-round-318/protected-sha256.txt` also check rc 0 [K3].
- **The tree at planning** holds v4: `sha256sum -c b-round-450/sketch-files-sha256.txt` gives rc 0 from `store/` [K29]. Nothing outside the grants is dirty [K4].
- **Grants:** the same 5 paths, listed in `b-round-451/grants-452.txt`. No other file in `store/` may change [K4].

| Path | What may change in this round |
|---|---|
| `app/lib/__tests__/store-gradient-text.test.ts` | Only the v5 delta (§2). It is applied by `git apply`, with no hand edits [K4] |
| `app/lib/__tests__/helpers/style-scan.ts`, `app/lib/__tests__/store-teal-sweep.test.ts`, `app/lib/__tests__/studio-naming.test.tsx` | Nothing. They stay byte-equal to v4 = v5 (`b-round-451/sketch-files-sha256.txt`) [K29] |
| `docs/implementation/2026/quarter-IV/295-sys-r450-store-style-scan.md` | The whole doc. l.4 is rewritten to 452 (L28 re-dispatch clause), and a Problem → Solution for the barrel scope is added (§1 step 6) [K21] |

**Frozen and read only (unchanged from round 451):** `app/styles/studio.css` and `app/styles/pages/studio.css` exist and have 0 clip lines today [K11]. They are scanned, never edited.

## 0. Why this round
- **The Medium (C round 451, reproduced).** v4 appended `components/audio/index.ts` and `components/index.ts` to the shared `BARREL_FILES`, which GT5 and GT5b both use as their exclusion list. GT5's name scan therefore skipped 2 files that HEAD scanned.
  - Mutant: appending `export { ArtistBioSection as Bio } from './home';` to the root barrel makes GT5 red at HEAD and green on v4 (`c-round-451/mutant-gt5.txt`; B's `b-round-451/v4-mutants/mutants.txt`).
  - This breaks L4.
- **Why B missed it:**
  - B's §4 pin map recorded "GT5 plus … the audio barrel" as stronger.
  - None of the 53 mutants removed a HEAD exclusion pin.
  - Three reviews read the wider list as a strengthening.
  - Recorded as retro candidate RETRO465-B-EXCLUSION-LIST-AS-STRONGER.
- **The rest of SYS-R450 is unchanged.** It still closes A-R449-REVIEW-GT1-TSX (Medium) and the 6 Lows of round 451's §0.

## 1. What A does
1. **Read the primitives first** (L60: before any edit, including the `git apply`):
   - `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `AGENT_DISCOVERABLE_CODE.md`, which the hook maps for `app/lib/__tests__/**`;
   - `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`, for doc 295.
2. **Check the start state, then apply.** From `store/`, run `sha256sum -c ../tmp/studio-real-loop/b-round-450/sketch-files-sha256.txt`.
   - **rc 0** (expected; v4 is in the tree [K29]): run `git apply ../tmp/studio-real-loop/b-round-451/sketch-452-delta-v4-v5.patch.txt`. Its sha256 is in `b-round-451/sketch-452.sha256`. B ran `git apply --check` of it on a copy of A's round-451 tree: rc 0 (`b-round-451/apply-check.txt`) [K32].
   - **rc ≠ 0** because the 4 files are back at HEAD (`git status` shows them clean): run `git apply ../tmp/studio-real-loop/b-round-451/sketch-452-full-v5.patch.txt` instead. This is v4 plus the same delta; B's check on clean HEAD gave rc 0 [K32].
   - **Doc 295 missing** in either branch: write it fresh from TEMPLATE (same file name), with every §1 step 7 item.
   - **Any other start state:** STOP (L11).
   - Afterwards, `sha256sum -c ../tmp/studio-real-loop/b-round-451/sketch-files-sha256.txt` gives rc 0 [K29]. There are no fix-ups. Any other code change you want is a STOP (L11).
3. **Run the checks** and save the logs under `a-round-452/`:
   - `npm run typecheck`;
   - `npm run lint`;
   - the covering set: `npx vitest run app/lib/__tests__/store-teal-sweep.test.ts app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/studio-naming.test.tsx`.

   B's results on the sketch [K18] [K20]: typecheck rc 0; lint rc 0 with 205 warnings, the same as HEAD; covering 3 files and 16 tests. The full suite on the sketch, for information only (a gate row): 282 files, 4,128 tests [K19].
4. **Run golden G1** in a throwaway clone (`git clone --shared`, with `node_modules` symlinked; never in `store/`).
   - Copy `b-round-450/golden/style-scan-golden.test.ts` into its `app/lib/__tests__/`.
   - Run it with `GOLDEN_OUT=<loop>/a-round-452/golden.json`. It must pass with `equal: true` and the sizes in [K17].
5. **Run the named check from round 451** on a throwaway clone, never in `store/`. `run-mutants.sh` clones commits, not the working tree, so:
   - `git clone -q --shared . /tmp/a452-src`, then `cp --parents` the 4 code grant files into it;
   - commit inside that clone only;
   - run `SRC=/tmp/a452-src OUT=<loop>/a-round-452/mutants IDS="BASE N11-GT5-ROOT-BARREL-ALIAS N11b-GT5-AUDIO-BARREL-ALIAS N8h-GT5b-OWN-BARRELS-DROPPED" bash <loop>/b-round-451/run-mutants.sh`.

   Expected [K14]: BASE none; N11 GT5; N11b GT5; N8h GT5b. Remove the clone afterwards (L60).
6. **Code-reviewer:** one file of code changes, plus the doc. Ask it once, on the delta and doc 295.
   - Every Medium+ it raises is a STOP unless §5 already rules on it (L11, L22).
   - Its Lows go into your report.
7. **Doc 295** (editor tools only):
   - **l.4** is exactly `**სტატუსი:** Completed (C round 452 PASS)` (L28) [K21].
   - **Problem → Solution:** add one entry in Georgian. Problem: v4 widened GT5's exclusion to five barrels. Solution: GT5 keeps HEAD's 3, and GT5b excludes only each dead module's own barrels (`deadModuleBarrelFiles`).
   - **Citations:** the N11/N11b mutants are loop artifacts, cited by path, not as row ids (L26). Every row id you cite exists [K12].
   - **Headings:** the TEMPLATE heading order is kept (L26).

## 2. What changes (the delta, `store-gradient-text.test.ts` only)
- `BARREL_FILES` goes back to HEAD's three: `components/home/index.ts`, `components/loading/index.ts`, `components/common/index.ts` [K5] [K6]. **GT5 uses it exactly as HEAD did.**
- New `deadModuleBarrelFiles(dead)` = `dead.barrels.map((barrel) => \`${barrel}/index.ts\`)`.
  - **GT5b** excludes only the dead module's own file and its own barrels: Timeline → `components/audio/index.ts` and `components/index.ts`; email.server → none [K7].
  - These two are the only re-exporters of the dead modules: the audio barrel names `Timeline`, and the root barrel does `export * from './audio'` [K10].
- GT5b's title becomes "… outside their own file and their own barrels". The `it('GT5b` prefix is unchanged [K12].
- No `expect(` is added or removed: teal 10, gradient 23, naming 6 (HEAD 8 / 10 / 6) [K30].
- **Everything else in v4 stays:** §2–§4 of `tasks/round-451.md`, including the rulings D-29z1604-a…i.

## 3. HEAD pin map change (L4)
Only the GT5 row of round 451's §4 changes. Every other row stands as written there.

| HEAD pin | Sketch v5 |
|---|---|
| GT5: 4 dead components, **exclusion = 3 barrels** | GT5: the same 3 barrels (**equal**) [K5] [K6], DEAD_COMPONENTS + `CinemaCurtainLoader` (stronger). Pin mutants N11/N11b are red at HEAD and on v5 [K14] [K15] |
| (none at HEAD) | GT5b: per-module own barrels, narrower than v4's shared five (stronger; review 4, TL-a) |

**Whole sweep:**
- Every constant, allow-list and file filter of both HEAD suites was compared with v5 (`b-round-451/scope-sweep.md`; command in [K8]).
- Only `DEAD_COMPONENTS` (a superset) and the GT1 allow-list key format (ruled D-29z1604-f) differ.
- Every HEAD row scans an equal or larger file set.
- tech-lead checked the same independently, including the `stripComments` → tokenizer row.

## 4. Pre-check evidence (B, on the sketch)
- **Mutants on v5:** `b-round-451/mutants.txt`, 57 lines. These are round 450's 54 plus three new ones [K14]:
  - **N8h** (`deadModuleBarrelFiles` returns `[]`) → GT5b;
  - **N11** (root-barrel alias) → GT5;
  - **N11b** (audio-barrel alias `export { ArtistBioSection as Bio } from '../home';`) → GT5.

  The other 54 lines equal `b-round-450/mutants.txt`.
- **HEAD control:** `b-round-451/head-mutants/mutants.txt`, 37 lines. N11 and N11b are red at GT5 (HEAD pins); N8h shows EDIT-FAILED. The other 34 lines equal `b-round-450/head-mutants/mutants.txt` [K15].
- **v4 control:** `b-round-451/v4-mutants/mutants.txt`. N11 and N11b are green: this is the bug [K16].
- **Golden G1 on v5:** `equal: true`, sizes appTs 349, perfTs 17, appCss 5, appAny 354, tealApp 6, tealPerf 0, cssBySelectorAppAndBase 1, gt3 3, probe 5 [K17].
- **Timeouts (L31):** at gate 449 the covering files took 158 ms, 334 ms and 406 ms [K31]; on the v5 sketch 208, 266 and 177 ms [K20]. All are below 50 % of the 5 s default.

## 5. Sketch review and ruled residuals
`b-round-451/sketch-review.md` (`tech-lead`, review 4) names the dispatched delta sha256 and the fallback's. **Verdict: APPROVE**, no Medium+ [K13].

**Ruled residuals.** If A's code-reviewer raises one of these again, it is already ruled: not a STOP and not re-filed (L7: add `confirmedBy`).
- **Everything ruled in round 451 §5:**
  - TL-R451-L1…L4;
  - INFO-TL-R451-FILL-FORMS, INFO-TL-R451-GLOW-CALC, INFO-TL-R451-WALKER-HOST and TL-R451-CODE4-TEAL-TEXT-SHADOW;
  - SIG-R451-STYLE-SCAN-ENGINE-POLICY;
  - D-29z1604-a…i.
- **D-29z1606-a:** the alias hole **through HEAD's own three barrels** is pre-existing at HEAD: a barrel re-exports a dead component under an alias, and a consumer imports the alias.
  - It is the existing deferred Low TL-R449-D2-BARREL-ALIAS, which closes with the dead-file deletion in STORE-2b-3d. It is not fixed here.
  - Today the five barrels contain no `as` word at all [K9]; the grep was checked on a known single-line and multi-line alias (`b-round-451/k9-known-hit.txt`).
- **D-29z1606-b: A-R451-REVIEW-L1-SCRIPT-CSS-MULTILINE** fails safe → `deferred_low_polish`.
- **D-29z1606-c: A-R451-REVIEW-L2-ZERO-OFFSET-UNITS** → `deferred_low_polish`.
  - The offsets `0rem`, `0em` and `-0` are not matched. It fails open, but the scanner is new in this sketch, so this is not a regression against HEAD.
  - It is separate from INFO-TL-R451-GLOW-CALC, which is about the blur-value forms.
  - STORE-2b-3b, which next owns the glow scanner, re-checks both ids.
- **D-29z1606-d: A-R451-REVIEW-L3-REREAD** (about 200 ms) → `deferred_low_polish`.
- **D-29z1607:**
  - INFO-TL-R452-SELECTOR-SHIFT: quote blanking can move a hit to another selector; it fails loud.
  - TL-R451-L2-SIDE-EFFECT-IMPORT gets `confirmedBy` review 4.
- **Architecture note** (helper mixes the regex library, walker and resolver): `confirmedBy` on SIG-R451-STYLE-SCAN-ENGINE-POLICY. It is a signal only.

A reviewer finding outside this list at Medium+ is a STOP (L11, L22).

## 6. Acceptance (C)
C runs the **full** C1–C12. Round 451 C-verified only C1–C3 and C10–C12.

C runs from a clean copy of A's tree wherever a row needs edits. Destructive work stays under `c-round-452/` (L60).

| # | Row | Pass when |
|---|---|---|
| C1 | SOURCE-SCOPE, start and end | Changed paths ⊆ `b-round-451/grants-452.txt`; `r452-tree-sha256.txt` rc 0; protected files rc 0 |
| C2 | CLAIMS | Re-run `b-round-451/claims-452.sh` from `store/` on A's tree. Every line equals `b-round-451/claims-452-sketch-output.txt` (B's run on the expected end state), with no allowed delta. Empty stderr. The planning output (`claims-452-planning-output.txt`, A's v4 tree) is for reference only |
| C3 | APPLY | From `store/`, `sha256sum -c ../tmp/studio-real-loop/b-round-451/sketch-files-sha256.txt` gives rc 0 (4 files, the untracked helper included) [K29] |
| C4 | COVERING | The 3 covering files pass. Rows TS1–TS6, GT1, GT1b, GT2, GT3, GT4, GT4b, GT5 and GT5b exist [K12] |
| C5 | GOLDEN G1 | `b-round-450/golden/style-scan-golden.test.ts`, run in a throwaway clone of A's tree, passes with `equal: true` and the sizes in [K17] |
| C6 | MUTANTS on A's tree | Build `S=/tmp/c452-src` as `git clone --shared` of `store`. Copy A's 4 grant files plus the doc into it (`cp --parents`) and commit inside the clone only. Run `SRC=$S OUT=<loop>/c-round-452/mutants bash <loop>/b-round-451/run-mutants.sh`. `mutants.txt` equals `b-round-451/mutants.txt` line for line (57 lines). Write `mutantRedOnTree` |
| C7 | HEAD control | `H=/tmp/c452-head`, a clone at `a8599a2`. Run `SRC=$H OUT=<loop>/c-round-452/head-mutants IDS="BASE $(python3 -I <loop>/b-round-451/mutants.py --list \| tr ' ' '\n' \| grep '^N' \| tr '\n' ' ')" bash <loop>/b-round-451/run-mutants.sh`. The output equals `b-round-451/head-mutants/mutants.txt` (37 lines). N11 and N11b must be red at GT5 |
| C8 | NO-WEAKENING | Every HEAD `expect(` maps to its row (round 451 §4 + §3 here). The `grep -c "expect("` counts on A's tree equal `b-round-451/expect-counts.txt` [K30]. `BARREL_FILES` equals HEAD's [K5] [K6]. `store-header-footer.test.tsx` is unchanged (manifest) |
| C9 | DOC 295 | TEMPLATE headings in order (L26). l.4 is exactly `**სტატუსი:** Completed (C round 452 PASS)` [K21]. It has a barrel-scope Problem → Solution. Every cited row id exists. No `pending` [K22] |
| C10 | G452-AUTH (browser, 1440×900 and 1280×720) | Round 451's G451-AUTH recipe, verbatim. In a fresh anonymous context: `/studio-lab`, then `/studio/middle-east` (warm both first with one untimed browser load, L38), then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header. Expected: `localStorage.auth_user` null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns 401. Baseline: `c-round-451/auth-smoke.json` [K33]. Fake-bearer premium path: BLOCKED (backend unavailable in cloud) |
| C11 | STUDIO-SMOKE (browser, both viewports) | Enter adds a clip, Play moves the position, Stop holds it, Export opens and closes with Esc. A sanity row: no runtime code changes |
| C12 | L57 | `tools/l57-check.py` rc 0 |
| gate | Full verify, typecheck, build, lint | `gates/gate-round-452.json` |

**What could break nearby:** nothing at runtime, because only a test file and a doc change. The risk is a weaker guard; C6–C8 cover it. STORE-2b-3b edits these suites' allow-lists next.

## 7. After this round
- **Round 453:** REGRESSION-2026-11-13 if it is planned on or after 2026-11-13. Otherwise STORE-2b-3b (glow shadows: the zero-offset inventory of `tasks/round-451.md` D-29z1604-c, `--shadow-glow` and the shared Button), whose task re-checks A-R451-REVIEW-L2 and INFO-TL-R451-GLOW-CALC.
- **Then, in order:** 2b-3c, 2b-3d with the dead-file deletion (closes TL-R449-D2-BARREL-ALIAS), 2b-4, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, then phase 2 under the skip rule.
- **Next RETRO:** round 465.

## claims
`b-round-451/claims-452.sh`: K1–K27 and K29–K33 (there is no K28). Outputs: `b-round-451/claims-452-planning-output.txt` and `b-round-451/claims-452-sketch-output.txt`.
