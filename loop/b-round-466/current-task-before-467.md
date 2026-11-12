# Round 466: STORE-2b-3c-2b. The zero-offset glow scanner finds every zero spelling, function blurs and concatenated blurs (test-only)

**Planned by:** B, at the round 465 → 466 planning on 2026-11-12 (`b-round-465.md`). The advisor was available and was consulted after orientation and before writing. The round-465 task is archived as `tasks/round-465.md`; its byte-identical copy is `b-round-465/current-task-before-466.md` [K18].

## Decisions
All three are in `backlog.json` under `decisions_log_b` [K16].
- **D-29z1642: round 465 (RETRO 465) accepted.**
  - C: PASS, 0 bugs, `browserVerified`/`realVerified` true.
  - Gate 465: skipped, "no real changes" [K1].
  - No Saba answer is new. ARCH-CHECKPOINT-STYLE-SCAN is still unanswered.
- **D-29z1643: this dispatch.**
  - It closes A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC and GATE452-L1-GLOW-REGEX-WHOLE-SOURCE [K17].
  - STORE-2b-4 is ruled into the acceptance of STORE-3 and STORE-4 and into the DP-GATE review. STORE-2b stays open on those rows.
  - Round 467 = REGRESSION-2026-11-13.
  - New deferred Lows: TL-R465-L1…L6 and B-R465-TEST-FIXTURE-CSS-LEAK.
- **D-29z1644: corrections from the advisor's closing check.**
  - STORE-2b stays open on 2b-4's rows.
  - This is the final stage of STORE-2b-3c-2, so the doc 299 line-4 grant follows (L28).
  - The copy recipe and the hash equality are pinned for C.

## Rules
- **Read `lessons.md` first.** It is unchanged since RETRO 465.
- **L57 / L22:** C writes all L57 fields. The following fields name B's files:
  - `mutantRedOnSketch`: `b-round-465/mutants/summary.txt`;
  - `affectedChecksNamed`: the 4 covering files, the corpus compare, GLOW-COMPUTED and BUILD;
  - `affectedChecksRunOnSketch`: `precheck-full.log`, `data/head-vs-sketch-counts.txt`, `probe/glow-computed.json`, `build-compare*.txt`.

  C also writes `mutantRedOnTree` from C4. Every bug carries an enum `origin`. Before hand-off, C runs `python3 -I tools/l57-check.py c-round-466.json c-round-466/l57-check.txt`, and it must exit with rc 0.
- **L29:** every statement below about a file under `store/` carries a `[K#]` tag. Untagged code text is a row id, a loop-artifact path or a description of what A or C runs.
- **L59 / L60:** run the browser rows first. Write `c-round-466/progress.json` after each row. Destructive commands stay inside your own round folder. Never use `git stash` or `git checkout --` in the store tree.
- **Not applicable (test-only round, nothing visible changes):** reference-first, the Ableton conformance check, the product-designer step, the screen budget and the journey row.

## Baseline: HEAD `6d321c7`, clean tree
- Gate 465 is `skipped` and leaves HEAD at `6d321c7`, which gate 464 published [K1]. At planning the tree was clean [K2].
- **Frozen files:** the round-465 manifest `b-round-464/r465-tree-sha256.txt` (1,377 entries) is reused. It checks rc 0, and so does the protected manifest [K3].
- **Grants: exactly these four paths.**
  - `app/lib/__tests__/helpers/style-scan.ts`, changed only by the sketch [K5] [K8];
  - `app/lib/__tests__/store-teal-sweep.test.ts`, changed only by the sketch [K5] [K8];
  - new: `docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md`. Doc 303 is the last doc today [K7];
  - line 4 only of `docs/implementation/2026/quarter-IV/299-store-2b-3c-2-shared-rule-reader.md`, which today reads `In Progress (stage 1 of 2; C round 458 PASS)` [K22]. This round is stage 2 of 2 of STORE-2b-3c-2, the final stage, so L28's multi-stage clause applies. The `In Progress (stage` grep has 21 hits [K22]: the other 20 belong to stages that are still open (the STORE-2b docs stay open on 2b-4's rows in STORE-3/4; PERF and SABA-B-12 have their own stages).

  Every other file stays byte-identical. The protected files stay untouched.

## 0. Why this round
- **Order:** D-29z1640 named round 466 = STORE-2b-3c-2b because this planning falls before 2026-11-13, when REGRESSION becomes due [K18]. No Critical or High finding is open, and no C bug came out of round 465.
- **What is wrong today:** `countZeroOffsetGlowHits` is the guard that keeps zero-offset "glow" shadows out of the Store. TS3 and the GS/LT rows use it [K5]. At HEAD, its offset token is only `0` or `0px`, and its blur alternatives are a digit, `var(` or `${` [K4]. So it fails open on:
  - `0rem 0rem 20px` and `-0 0 20px`: A-R451-REVIEW-L2;
  - `0pt` and `0dvh` (found by tech-lead review 1);
  - `0 0 calc(…)`, `min(`, `max(` and `clamp(` blurs, and `'0 0 ' + r + 'px'`: INFO-TL-R451-GLOW-CALC.

  It also runs the whole-source regex on files that contain no shadow at all: GATE452-L1.
- **Why not fold this into SYS-R465-DEAD-CSS-MATCHER:** that task changes another matcher (`store-dead-css`) and has its own trigger. At RETRO 465, tech-lead named two ports in one round as the risk.

## 1. The change: sketch `b-round-465/sketch-466.patch.txt`
sha256 `06b2af46191097c06a45e63c2b32171b73dcef17f1bda25e2a9249c0d58244da`, 2 files [K8].
- **`style-scan.ts`:**
  - New `ZERO_LENGTH`: an optional sign, a zero with optional decimals, and any unit letters.
  - It replaces `0(?:px)?` in all four alternatives.
  - `GLOW_BLUR` also accepts `calc(`, `min(`, `max(` and `clamp(`, and a closing quote followed by `+`.
  - `countZeroOffsetGlowHits` returns 0 early when `/shadow/i` does not match.
- **`store-teal-sweep.test.ts`:** TS1–TS6 are unchanged [K6]. Two rows are added:
  - **TS7:** 15 glow fixtures (1 hit each) and 8 non-glow fixtures (0 each).
  - **TS8:** the pre-check, including upper-case `BOX-SHADOW` and camel-case `TextShadow`.
- **Tailwind leak:** Tailwind v4 scans test files. Three TS7 className fixtures are therefore built with `['…', '…'].join('')`. With plain strings, the production `app.css` gained 3 utilities. With `join`, the build is byte-identical to HEAD [K14].
  - HEAD's own TS6 fixtures already ship 5 utilities. That is B-R465-TEST-FIXTURE-CSS-LEAK, pre-existing and deferred [K15].
  - **Not in scope:** do not touch TS6.

**B's pre-check, all saved under `b-round-465/` [K9]:**
| Check | Result |
|---|---|
| Corpus | HEAD vs sketch counter over 657 `app/**` + `perf/**` sources is equal except the fixture file itself [K12] |
| Mutants | 13 mutants, all red [K10] |
| Chromium | Computed `box-shadow`/`filter` of 22 fixture values agrees with TS7's expected values [K11] |
| Full suite on the sketch | 285 files / 4,188 tests, against gate 464's 4,186 [K13] |
| Typecheck and Biome | rc 0 |
| Build | Production build of the sketch plus the placeholder doc 304 and doc 299's new line 4 equals HEAD: 180 files, 0 differing lines [K14] |
| Review | tech-lead: v1 APPROVE-WITH-CHANGES, then APPROVE on the dispatched sha (`sketch-review.md`) |

**Timeout headroom (L31):** in gate 464, `store-teal-sweep` took 504 ms for 6 tests and `store-live-teal` 1,622 ms for 10, both far below 50 % of the 5 s default [K20].

**Rulings:**
- **The backgroundClip half of INFO-TL-R451-GLOW-CALC stays as it is.** A variable named `backgroundClip` set to `'text'` almost always reaches a style, so the false positive is fail-safe. The info is closed with this rationale, and no row is added, because that scanner's tests are outside the grant (tech-lead agrees).
- **One element, one rule (L4):** TS6's arrays are frozen. New forms go only into TS7 and TS8.

## 2. A: steps
1. **STOP (L11) if the start state is wrong.** From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-464/r465-tree-sha256.txt` and the protected manifest; both must be rc 0, and `git status` must be empty. If not, report the paths and change nothing.
2. Read the mapped primitives (`TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`).
3. From `store/`, run `git apply ../tmp/studio-real-loop/b-round-465/sketch-466.patch.txt`. Then from `store/`, run `sha256sum -c ../tmp/studio-real-loop/b-round-465/sketch-466-files-sha256.txt` (the two post-image hashes; rc 0) and save `git diff -- app` as `a-round-466/applied.patch.txt`. Do not edit the two files further. Any wish to change them is a STOP (L11).
4. Write doc 304 from `b-round-465/doc-304-placeholder.md.txt`, in Georgian with TEMPLATE's 7 `## ` headings in order.
   - **Line 4, exactly:** `**სტატუსი:** Completed (C round 466 PASS)`. This is L28's final-stage form: doc 299 says STORE-2b-3c-2 has two stages, and this is the second.
   - **Doc 299:** set line 4 to exactly `**სტატუსი:** Completed (C round 466 PASS)`. Change no other line.
   - Name the three closed ids, the backgroundClip ruling and B-R465-TEST-FIXTURE-CSS-LEAK.
   - **No Tailwind-candidate literal:** no `name-[…]` and no `[prop:…]` bracket class text. Describe those forms in words.
   - Cite only tests that exist (TS7, TS8) (L26).
5. **Doc-leak self-check.** Copy `a-round-463/tw-doc-leak.mjs` to a temporary file at the store root and run `node <copy> . docs/implementation/2026/quarter-IV/304-store-2b-3c-2b-glow-scanner-forms.md`. Save the output as `a-round-466/tw-doc-leak.txt`; it must say `cssEqual true`. Delete the copy afterwards.
6. Run `npm run typecheck`, then `npx biome check` on the two files, then `npx vitest run` on the 4 covering files (`store-teal-sweep`, `store-live-teal`, `store-glow-shadow`, `store-gradient-text`; 31 tests). The changed set is 4 files, so ask `code-reviewer` for a review. Any Medium+ finding it reports is a STOP (L11) and is not fixed in place.
7. Write `a-round-466.md`: the commands, their rc, test counts and the reviewer result. Do not run the full suite; the gate does.

## 3. C: what to verify
Write `c-round-466.md` and `c-round-466.json` as you go, plus `c-round-466/progress.json` after every row. Browser rows (C6, C8) come first.

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; the r465 manifest with `sha256sum -c` | Exactly 3 `M` (the two granted test files and doc 299) and 1 `??` (doc 304). The manifest reports FAILED only for those 3 paths. `git diff` of doc 299 changes line 4 only. The protected manifest is rc 0. HEAD is `6d321c7` |
| C2 | PATCH-EQUAL | From `store/`: `sha256sum -c ../tmp/studio-real-loop/b-round-465/sketch-466-files-sha256.txt`; `git apply --check -R ../tmp/studio-real-loop/b-round-465/sketch-466.patch.txt` | Both rc 0 |
| C3 | COVERING | `npx vitest run` on the 4 covering files | 4 files and 31 tests pass. TS7 and TS8 are listed |
| C4 | MUTANTS on the tree | **Copy recipe (used by C4, C5 and C7):** `mkdir -p <dir> && git -C <store> archive 6d321c7 | tar -x -C <dir>`; copy the 4 granted files from the store into it; `ln -s <store>/node_modules <dir>/node_modules`; then `sha256sum -c` the files list from `<dir>` (rc 0). C4 and C5 use `<dir>` = `c-round-466/tree-mut`. In it, run `bash <abs>/b-round-465/mutants/run-mutants.sh <abs c-round-466/mutants>` | Each of the 13 lines shows `failed` and the same red rows as `b-round-465/mutants/summary.txt`. `mutantRedOnTree` = 13/13 |
| C5 | CORPUS | In `c-round-466/tree-mut` (after C4; the mutant script restores `style-scan.ts`): place `b-round-465/compare.test.ts.txt` as `app/lib/__tests__/b466/compare.test.ts`, put HEAD's `style-scan.ts` beside it as `helpers/style-scan-head.ts` (`git show 6d321c7:…`), then run it with `B466_OUT=<abs c-round-466/data/head-vs-sketch-counts.txt>` | `cmp` equal to `b-round-465/data/head-vs-sketch-counts.txt`: 657 files [K12], diff 1, which is the fixture file. The store's own `app` + `perf` walk also counts 657 [K23] |
| C6 | GLOW-COMPUTED (browser, Chromium) | From `store/`, run `node <abs>/b-round-465/probe/glow-computed.mjs <abs c-round-466/glow-computed.json>`. Also add your own independent cases, built from the TS7 source strings, not from the probe: `0pt 0 8px red`, and the concat row evaluated with `radius = 8` | `allOk true`, 22 rows, `cmp` equal to B's JSON. Your extra cases read offsets 0 and blur > 0. The probe compares Chromium with TS7's expected values (1 or 0), never with the regex. That is the "guard can disagree" row (L52) |
| C7 | BUILD vs HEAD | Fresh copies: `c-round-466/head` (`git archive 6d321c7` + `node_modules` symlink only) and `c-round-466/tree-build` (the copy recipe, with all 4 granted files). Run `npm run build` in each, then `bash b-round-465/build-compare.sh <head> <tree-build>`. Never build `tree-mut`, which holds C5's extra files | `differing lines: 0` over 180 files. Any added utility means doc 304 or a fixture leaked: FAIL |
| C8 | AUTH + SMOKE (browser, 1440×900 and 1280×720) | Fresh anonymous context. Warm the server first with one untimed load (L38). Open `/studio-lab` and wait for `Demo collection ready`, then add a library item with Enter. Open `/studio/middle-east`. Call `GET /api/studio-token?product=middle-east&file=stem.mp3` without auth | `auth_user` is null and the workspace opens with the clip. The product route shows "Sign in required" and 0 `audio[src]`. The token API returns 401. Fake-bearer path: BLOCKED (backend unavailable in cloud) |
| C9 | DOCS | Docs 304 and 299 | Line 4 of each is exactly as in §2.4. The 7 TEMPLATE `## ` headings are in order. The doc names the 3 closed ids. `grep -nE '[a-z]-\[|\[[a-z-]+:'` gives 0 hits. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits. `a-round-466/tw-doc-leak.txt` says `cssEqual true` |
| C10 | TYPECHECK / LINT | `npm run typecheck`; `npx biome check` on the 2 files | rc 0 and rc 0 |
| C11 | CLAIMS | `bash b-round-465/claims-466.sh` | Compare with `b-round-465/claims-466-planning-output.txt`. The only differences allowed are the ones in `b-round-465/claims-466-expected-after-A.txt`. K16 may differ if root's optimizer rewrote `backlog.json`; the last D-ID must still be D-29z1644. No `MISSING` |
| C12 | SOURCE-SCOPE (end) + L57 | As C1; then `l57-check` | Same as C1; rc 0 |
| gate | Full suite / verify | Root gate | Not claimed in `passed` |

**What could break nearby:** TS3 and the GS/LT rows that call the same counter [K5]. C3 and C5 cover them. The production CSS is covered by C7.

## 4. Claims
The script is `b-round-465/claims-466.sh`. B's run at planning is saved in `b-round-465/claims-466-planning-output.txt`, with stderr in `claims-466-planning.err` (empty).

| Claim | What it checks |
|---|---|
| K1 | Gate 465 and gate 464 |
| K2 | HEAD and status lines |
| K3 | Manifest entries, manifest rc and protected rc |
| K4 | HEAD `GLOW_BLUR` line; `ZERO_LENGTH` and `/shadow/i` absent at HEAD; `0(?:px)?` forms |
| K5 | The importers of `countZeroOffsetGlowHits` in `app/**` and `perf/**` |
| K6 | The TS row ids |
| K7 | Doc 304 absent; the last doc |
| K8 | The sketch applies; its sha; its file count |
| K9 | The pre-check artifacts exist (26), plus the mutant logs |
| K10 | Mutants red |
| K11 | The probe |
| K12 | Corpus |
| K13 | Suite counts |
| K14 | Build compare, with and without the doc |
| K15 | The HEAD fixture leak |
| K16 | Backlog version and last D-ID |
| K17 | Finding statuses |
| K18 | The archived task and the regression date |
| K19 | `l58-check` |
| K20 | Timeouts in gate 464 |
| K21 | A sweep for the new fixture literals as plain strings in `app/**`, `perf/**` and `docs/**` |
| K22 | Doc 299 line 4 and the `In Progress (stage` hit count |
| K23 | The store's `app` + `perf` file count for the corpus extensions |

## 5. After this round (D-29z1643, D-29z1644)
1. **Round 467:** REGRESSION-2026-11-13. It carries every `scope_additions` entry of that item (L6).
2. **Then the rest of the STORE-REDESIGN queue:**
   - STORE-2c (typography: Instrument Sans and Plex Mono are already self-hosted);
   - STORE-2d;
   - STORE-3, STORE-4 and STORE-5.
3. **Root:** round 466 is the last STORE-2b code stage. STORE-2b itself stays open on 2b-4's rows, which live in STORE-3/4. The DP-GATE trigger is "after STORE-2b completes", so root may run the first DP-GATE review (design-philosopher + product-designer) once round 466 passes, or wait for STORE-4. That is root's choice.
4. **Then:** ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, and phase 2 under the skip rule. SYS-R465-DEAD-CSS-MATCHER runs at its first trigger. STEM-LANES moves ahead as soon as Saba answers. The next RETRO is round 480.
