# Round 462: STORE-2b-3d-1. Delete 6 dead Store modules (LEGACY-DEAD-STORE-COMPONENTS)

**Planned by:** B at the round 461 → 462 planning, 2026-11-12 (`b-round-461.md`). D-29z1630 records the round-461 result. D-29z1631 records this dispatch, the reorder and the 2b-3d split.

**Baseline:** store HEAD `a7fa78e`, the gate 461 `published` commit [K1]. `context/head-sha.txt` still says `ffd0c7c`, which is stale.

**Advisor:** available and consulted after orientation, before any artifact was written. It advised three things, and B did all three:
- check the gate-461 review and Saba's answers first;
- dispatch 2b-3d-1, not 2b-3c-2b;
- split 2b-3d into a module-deletion stage and a CSS stage.

**Project agents:**
- `tech-lead` reviewed sketch v1: **APPROVE**, 0 Medium+, 4 Lows ruled. After the advisor's closing check, B removed ArtistBioSection from the deletion list (keep-list stats, §2.1) and wrote v2. tech-lead then delta-reviewed v2. `b-round-461/sketch-review.md` names the dispatched v2 sha256 `2ce4b5e5c942373cd35de535d86e8ceab0faa4b257be434b9345ea1fb0b9353c` and both verdicts [K10].
- `product-designer` is not consulted, and the reference section and screen budget do not apply. This is a dead-code removal with no new or changed UI: the deleted modules are mounted by no route, and the HEAD production build contains none of them [K14].

## 1. Why this round
**Round 461 closed SABA-B-13's last fixable Medium (A-R460-REVIEW-1).** No Medium+ that the loop can fix is open. The remaining Mediums are Tech Lead manual checks, `awaiting_user`, `open_root`, or queued in REVIEW-RECOMMENDATIONS (2026-10-23 root clarification).

**Order change (D-29z1631).** The recorded STORE order (D-29z1629) was 2b-3c-2b → 2b-3d → 2b-4 → STORE-2c…5. B dispatches 2b-3d-1 first, for these reasons:
- **2b-3c-2b is Low/info only.** It adds zero-offset glow regex forms to `helpers/style-scan.ts`, which would be the fourth round on that helper. tech-lead named exactly this as the trigger for extracting the helper, and the root checkpoint ARCH-CHECKPOINT-STYLE-SCAN is still unanswered.
- **Policy:** "do not indefinitely delay independent core features for low-priority polish". The 2026-10-23 rule fixes a Low early only when the round already owns the code.
- **2b-3d-1 is approved product cleanup.** Saba's legacy-removal policy of 2026-11-10 covers it. `user-review/questions-retro-450.md` Q6 (marked `.notified`) gave him the file list with the default "2b-3d deletes them, except Testimonials", and no objection has arrived. **ArtistBioSection is held after all:** it is the only renderer of the "Downloads / Products / 10K+ Happy Producers" stats. The keep-list covers "all other stats and claims", and Q6 wrongly told Saba that only Testimonials had keep-list content. It becomes the Saba question SABA-Q-ARTISTBIO-STATS (D-29z1631).
- **2b-3c-2b is not dropped.** It stays queued after 2b-3d-2, unless the ARCH-CHECKPOINT-STYLE-SCAN answer folds it into the extraction task.

**The 2b-3d split (D-29z1631):**
- **2b-3d-1 (this round):** delete the TS/TSX modules, their barrel lines and their test allow-list entries.
- **2b-3d-2 (next feature round):** remove the dead `app.css` and `utilities.css` rules and tokens under a narrow byte-scoped grant.

**Regression:** `regression-last.json` is dated 2026-11-10, so the next regression is due 2026-11-13. This planning is on 2026-11-12, and the next planning on or after 2026-11-13 is REGRESSION-2026-11-13.

**Promise (L55):** the Store looks and works exactly as now. Only code that nothing renders is removed.

## 2. What changes (grants: exactly 15 paths, `b-round-461/grants-462.txt`)

### 2.1 Sketch, applied byte for byte
A applies `b-round-461/sketch-462.patch.txt` (sha in `sketch-462.sha256`) with `git apply`. It holds every code change of the round.

**Deletes 6 files.** They exist at HEAD [K2], and each has 0 importers outside its own barrels [K3, K4]:
- `app/components/home/VideoShowcase.tsx`
- `app/components/loading/PianoLoadingAnimation.tsx`
- `app/components/loading/PianoCurtainLoader.tsx`
- `app/components/loading/CinemaCurtainLoader.tsx`
- `app/components/audio/Timeline.tsx`
- `app/lib/email.server.ts`

**Removes from the barrels** the 8 export lines of these names, plus the `// Page Loaders` comment [K5]:
- `app/components/home/index.ts`
- `app/components/loading/index.ts`
- `app/components/common/index.ts`
- `app/components/audio/index.ts`

**Updates the 4 style-scan tests** that pinned the deleted files [K8].

`store-gradient-text.test.ts`:
- removes the VideoShowcase entry from the retired-class allow-list;
- empties `SCRIPT_GRADIENT_TEXT_ALLOW_LIST`, and GT1b also asserts that it is empty;
- GT4b's non-vacuity check no longer uses CinemaCurtainLoader: it counts ≥ 200 scanned scripts, including `app/root.tsx`, `app/components/loading/SpotlightLoader.tsx` and one `perf/` file;
- `DEAD_COMPONENTS` keeps only ArtistBioSection and TestimonialsSection;
- GT5b keeps its import-form self-test on `FIXTURE_DEAD_MODULES`. Its real-tree loop is dropped because both modules are deleted (ruled drop: tsc and GT6 cover it);
- new **GT6**: the 6 files stay deleted, every `DEAD_COMPONENTS` file is present, and none of the 5 barrels (home, loading, common, audio, components) names a deleted export.

Other test files:
- `store-teal-sweep.test.ts`: the 3 entries for `email.server`, `Timeline` and `CinemaCurtainLoader` are removed.
- `store-glow-shadow.test.ts`: the VideoShowcase entry is removed.
- `store-live-teal.test.ts`: the `.loading-brand` reason text is updated, and `DEAD_TOKEN_CONSUMERS['loading-brand']` becomes `{}`, so LT7 now proves the rule has no consumer at all.

**Ruling lines (L4):**
- **TestimonialsSection and ArtistBioSection:** the keep-list clause wins over the dead-code clause. Neither is deleted, and both barrel lines stay [K6]. Both wait on Saba: SABA-Q-TESTIMONIALS-UNMOUNTED and the new SABA-Q-ARTISTBIO-STATS.
- **IconButton and ChatButton:** not on the Q6 list Saba was told about, so they are not deleted. They stay allow-listed and remain a LEGACY-DEAD signal.
- **Dead CSS rules** (`.loading-brand` ×2 in `app.css` [K9] and the rest): out of scope here; they belong to 2b-3d-2. `app/styles/**` is not granted.

**Not touched:** three historical doc mentions of deleted files are not granted; doc 301 lists them (TL-R462-L3) [K21]:
- `docs/technical/future/stripe-migration-guide.md`, l.556 and l.746;
- `docs/technical/video-sync.md`, l.463.

No `.claude`, script, config, e2e or perf file names a deleted module [K7].

### 2.2 What the build and the pages change (measured on v2)
B built HEAD and the v2 sketch in production mode (`npx remix vite:build` on a `git archive` of each, builds in `/tmp/b462-headbuild` and `/tmp/b462-treebuild`). `python3 -I b-round-461/build-compare.py <head build> <tree build>` gives `b-round-461/build-compare.txt` [K19]:
- **Server bundle:** 0 lines differ after normalizing the 8-character asset hashes, the manifest version and the manifest name.
- **Client JS:** 101 chunk bases, none of which differs after normalization.
- **CSS:** 12 Tailwind utility selectors disappear and 0 are added:
  - `h-[400px]`, `hover:bg-foreground/20`, `left-[15%]`, `md:group-hover:opacity-100`;
  - `md:opacity-0`, `opacity-30`, `opacity-[0.03]`, `origin-top`;
  - `right-[15%]`, `shadow-teal-500/50`, `w-[1px]`, `w-[3px]`.

  Tailwind v4 generated them only from the deleted files' class strings. `python3 -I b-round-461/css-live-grep.py <root>` finds each one only in deleted files at HEAD (`css-live-grep-head.txt`) and 0 times in live source on the sketch (`css-removed-live-grep.txt`) [K20]. Variant forms such as `disabled:opacity-30` are different selectors, and they stay.
- **Fingerprints:** the tree build contains 0 fingerprints of the deleted modules, and the control `function SpotlightLoader` gives 1 [K19].

**Browser (prod, mock API):** B ran `node b-round-461/probe/store-pages.cjs http://127.0.0.1:5190 http://127.0.0.1:5191 <out>` with HEAD served on :5190 and the tree on :5191 (`b-round-461/probe/run1/store-pages.json`) [K22]. It covered `/`, `/store`, `/products/middle-east`, `/free-downloads`, `/about` and `/studio-lab` at 1440×900 and 1280×720 (12 rows). Every row:
- `headTreeEqual` true;
- `controlHeadHeadEqual` true;
- the same status, `h1` count and "Free Samples" flag on HEAD and tree;
- `tokenElsHead` = `tokenElsTree` = 0 (no element carries any of the 12 tokens);
- `chunk404` empty.

### 2.3 Implementation doc (A writes it)
Create `docs/implementation/2026/quarter-IV/301-store-2b-3d-1-dead-store-modules.md`; the number is free [K15]. Write it in Georgian, following `docs/implementation/TEMPLATE.md`.
- **Line 4:** exactly `**სტატუსი:** In Progress (stage 2b-3d-1 of STORE-2b; C round 462 PASS)`, the form the earlier STORE-2b docs 292, 293, 294, 296 and 297 use [K23] (L28; never `pending`).
- **Body:**
  - the 6 deleted files and the permission (Saba's 2026-11-10 policy plus the Q6 default);
  - why ArtistBioSection, TestimonialsSection, IconButton and ChatButton stay;
  - that GT6 lives in `store-gradient-text.test.ts`;
  - that tsc and GT6 replace the GT5 word scan of the 4 deleted names (TL-R462-L1);
  - the 12 CSS utilities that leave the bundle, with B's whole-token evidence.
- **TODO:**
  - 2b-3d-2 (the dead CSS);
  - TL-R462-L2;
  - the stale doc mentions (TL-R462-L3).
- **Checks:** `grep -ci pending` on the doc = 0, and the doc names only test rows that exist (L26).

## 3. What B measured on the sketch (scratch `/tmp/b462-scratch` = `a7fa78e` + the sketch)
- **Typecheck:** `npm run typecheck` rc 0.
- **Lint:** `npm run lint` gives 192 warnings, against 207 at HEAD; the deleted files carried 15 [K13].
- **Before the test edits (measured on v1, which also deleted ArtistBioSection):** the bare deletion failed 9 rows (GS2, GS4, GT1b, GT3, GT4b, GT5, GT5b, LT7, TS2). That is why the tests are part of the sketch.
- **Covering set:** 6 files / 77 tests green (`covering-462.txt`, `precheck-covering.log`) [K12].
- **Full suite on the sketch (L23):** 284 files / 4182 tests passed, rc 0 (`precheck-full.log`, `precheck-summary.txt`) [K12].
- **Mutants:** whole files, `b-round-461/mutants/mutants.sh` → `mutants/mutants.txt` [K11]. BASE is GREEN. The v1 run is kept in `v1-superseded/`.

  | Mutant | Rows that turn red |
  |---|---|
  | M1, a deleted file restored | GS2, GT3, GT6 |
  | M2, a barrel re-exports a deleted name | GT6 |
  | M3, a live file clips text again | GT1b |
  | M4, `.loading-brand` gets a consumer | LT7 |
  | M5, Testimonials deleted | GT3, GT5, GT6 |
  | M6, Timeline restored | GT6, TS1 |
  | M7, a barrel drops off the checked list | GT6 |
  | M8, empty perf root | GT4b, TS5 |
  | M9, ArtistBioSection deleted by mistake | GT3, GT5, GT6 |
- **Production builds and browser:** HEAD and the sketch were built, compared and probed in Chromium (§2.2) [K19, K20, K22].
- **Agent checks:** `npm run agents:check` and `npm run test:agents` pass on the sketch, rc 0 (`precheck-agents.log`) [K12].
- **Apply check:** `git apply --check` on the store tree is OK [K18].
- **L31 headroom:** every covering test is far below its timeout. The whole 6-file run took about 2 s of test time (`precheck-covering.log`).

## 4. A steps
1. **Read:** the A part of `lessons.md`, and the primitives `AGENT_DISCOVERABLE_CODE.md` (deleted exports), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`.
2. **Claims before:** run `bash b-round-461/claims-462.sh` from the loop root. The output must be identical to `b-round-461/claims-462-planning-output.txt`, and stderr must be empty.
3. **Apply the sketch:**
   - `cd b-round-461 && sha256sum -c sketch-462.sha256` must give 1 OK;
   - from the store root: `git apply /home/runner/czaba-project/tmp/studio-real-loop/b-round-461/sketch-462.patch.txt`;
   - then, from the store root: `sha256sum -c /home/runner/czaba-project/tmp/studio-real-loop/b-round-461/sketch-462-files-sha256.txt` must give 8 OK.

   No hand edits. No `git rm`, `git stash` or `git checkout --` (L60); `git apply` performs the deletions.
4. **Doc 301:** write it as described in §2.3.
5. **Checks:**
   - `npm run typecheck`;
   - `npm run lint` (192 warnings);
   - `npx biome check` on the 4 barrels and the 4 test files;
   - `npx vitest run` on the 6 files in `b-round-461/covering-462.txt`.

   **Mutants:**
   - build a scratch: `git clone -q --shared /home/runner/czaba-project/store /tmp/a462-mut && cd /tmp/a462-mut && git checkout -q a7fa78e && git apply <sketch> && git add -A && git -c user.email=a@loop -c user.name=A commit -qm sketch && ln -s /home/runner/czaba-project/store/node_modules node_modules`;
   - run `bash <loop>/b-round-461/mutants/mutants.sh /tmp/a462-mut <loop>/a-round-462/mutants`;
   - `mutants.txt` must be identical to B's.

   Run code-reviewer (≥ 3 files changed). Its Architecture note goes to B. Do not run the full suite, `verify` or the build; those are gate rows.
6. **Claims after:** the output must be identical to `b-round-461/claims-462-expected-after-A.txt`, with empty stderr.
7. **Scope:** `git status --short --untracked-files=all` shows exactly the 15 grant paths: 6 `D`, 8 `M` and doc 301 untracked.

## 5. C rows
| Row | Command / where | PASS when |
|---|---|---|
| C1 SOURCE-SCOPE | `git status --short --untracked-files=all` | exactly the 15 paths of `grants-462.txt` (6 D, 8 M, doc 301 new) |
| C2 CLAIMS | `bash b-round-461/claims-462.sh` and the L29 grep below | output identical to `claims-462-expected-after-A.txt`, with empty stderr; every L29 hit is a grant path, a command argument, a planned change or a `[K#]` claim |
| C3 APPLY | from the store root: `sha256sum -c …/b-round-461/sketch-462-files-sha256.txt`; `ls` of the 6 deleted paths | 8 OK; all 6 absent; ArtistBioSection and TestimonialsSection present |
| C4 COVERING | `npx vitest run` on the 6 files in `covering-462.txt` | 6 files / 77 tests green; GT1b, GT4b, GT5, GT5b, GT6, LT7, TS2 and GS2 listed as passed |
| C5 MUTANTS | C's own scratch (`a7fa78e` + the sketch, committed as in A step 5), then `bash b-round-461/mutants/mutants.sh <scratch> <loop>/c-round-462/mutants` | `mutants.txt` identical to B's: BASE GREEN, M1–M9 RED with the listed rows |
| C6 BUILD vs HEAD | `R=<store> bash b-round-459/probe/serve-prod.sh start <loop>/c-round-462/prod-head 5190 a7fa78e` and `… start <loop>/c-round-462/prod-tree 5191 TREE` (mock API on :5199), then `python3 -I b-round-461/build-compare.py <loop>/c-round-462/prod-head/store/build <loop>/c-round-462/prod-tree/store/build > c-round-462/build-compare.txt` | `cmp` with `b-round-461/build-compare.txt` is equal (server 0 lines, JS none differing, CSS exactly the 12 removed and 0 added, fingerprints 0, control 1). On any difference, C records the lines and judges whether a live element is affected |
| C7 STORE PAGES (browser, prod) | with both servers from C6 still up: `node b-round-461/probe/store-pages.cjs http://127.0.0.1:5190 http://127.0.0.1:5191 <loop>/c-round-462/pages` | in `pages/store-pages.json`, all 12 rows (6 pages × 2 viewports) have `headTreeEqual` true, `controlHeadHeadEqual` true, the same status, `h1` count and `freeSamples` flag in both entries, `tokenElsHead` = `tokenElsTree` = 0 and an empty `chunk404`; `consoleErrorsTree` holds only the expected no-backend noise. B's run is `b-round-461/probe/run1/store-pages.json` [K22]. Screenshots stay as evidence. A `controlHeadHeadEqual` false makes that row environment-invalid: re-run it (L37), it is not a FAIL |
| C8 STUDIO + PROTECTION | the round-461 C8 probe (copy `c-round-461/c8/probe.cjs`) on dev :5173 | at 1440 and 1280: `/studio-lab` opens the demo anonymously with 1 clip, goes Playing → Stopped, and `stopHeld` is true; anonymous `/studio/middle-east` shows "Sign in required" with `audioSrc` 0 and `media` 0. A first `NO-BODY` read is the dev first-compile race; re-run it ×3 |
| C9 DOCS | doc 301 | line 4 exact (§2.3); `grep -ci pending` = 0; `grep -rn 'C round [0-9]* pending' docs/implementation` = 0; TEMPLATE headings in order (L26); the body names the 6 files, the permission, the four kept components, GT6, TL-R462-L1 and the 12 utilities; the TODO lists 2b-3d-2, TL-R462-L2 and TL-R462-L3 |
| C10 L57 | `python3 -I tools/l57-check.py c-round-462.json c-round-462/l57-check.txt` | rc 0 |
| gate | full vitest, typecheck, build, Biome, lint, verify | marked `gate`, not claimed in `passed` |

**C2's L29 grep** (from the loop root):

```bash
grep -nE 'l\.[0-9]+|(app|perf|docs)/[^ `]+|data-testid|aria-[a-z-]+' current-task.md > c-round-462/l29.txt
```

B's run is `b-round-461/l29-planning.txt`. Every hit is a grant path, a planned change, a command argument or a tagged claim.

**Notes for C:**
- `c-round-462.json` carries all L57 fields and an `origin` on every finding:
  - `mutantRedOnSketch` = `b-round-461/mutants/mutants.txt`;
  - `affectedChecksRunOnSketch` = `b-round-461/precheck-covering.log` and `b-round-461/build-compare.txt`.
- **Heaviest first (L59):** run the C6 builds, then C7 on the same servers, then stop them (`serve-prod.sh stop 5190`, `stop 5191`).
- **browserVerified** depends on C7 and C8. Both run in the cloud with the mock API.
- **Expected environment noise:** "Failed to load cart" and `ERR_CONNECTION_REFUSED` (no backend). A chunk 404 is a failure.

**What closes on C PASS:**
- LEGACY-DEAD-STORE-COMPONENTS, stage 1: the 6 modules. ArtistBioSection, TestimonialsSection, IconButton and ChatButton remain.
- TL-R449-D1-LOADING-BRAND-CLASS, by C4 (LT7 with an empty consumer set) and C5 (M4).
- TL-R449-D2-BARREL-ALIAS, by C3 and C5 (M2); the modules it guarded are gone.

**Neighbours that could break:**
- a page that reached a deleted module through a barrel (tsc proves there is none);
- a Remix route or a dynamic import that names a deleted file (none [K3, K7]);
- a live element that relied on one of the 12 utilities (none, [K20]; C7 compares the pages);
- the other style scanners reading the same tree (C4 runs all 6);
- the keep-list (ArtistBioSection and TestimonialsSection stay; M5, M9).

## 6. Claims
Run from the loop root: `bash b-round-461/claims-462.sh`. Every `b-round-461/` file this task cites exists [K17].
- **Planning output:** `b-round-461/claims-462-planning-output.txt`.
- **After-A expectation:** `b-round-461/claims-462-expected-after-A.txt`. This is the script's output on B's sketch scratch (`S=/tmp/b462-scratch`) with a placeholder doc 301 added for K15.
- **Expected differences:** the planning and after-A outputs differ only in K2, K3, K5, K8 and K15 (`diff` of the two files).
- **Stderr:** both stderr files are empty.
