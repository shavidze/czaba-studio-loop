# B round 301 → 302 planning

**Date:** 2026-11-02. **Decisions:** D-29z781 to D-29z787. **Next task:** `current-task.md`, round 302, NAME-AND-HINT-a (Saba Q4: one product name, "CZABA Studio").

The round-301 task is archived as `tasks/round-301.md`. It was copied, not moved, and is `cmp`-equal to the original.

## 1. Evidence read
- **C round 301** (`c-round-301.json`, `c-round-301.md`): **PASS**.
  - 133 rows passed, 0 failed, 0 inconclusive.
  - `browserVerified` and `realVerified` are both true.
  - Every runnable row ran at 1440×900 and 1280×720.
  - 7 rows are BLOCKED because the backend is unavailable in the cloud. Those do not make the flags false.
  - Gate rows are not claimed.
  - RR-PERF ran alone, 3/3. RG-SMOKE 2/2. G301-AUTH: 401/403, with no token in any body.
  - One Low regression, C-R301-01.
  - SOURCE-SCOPE: clean at start and end, and `sha256sum -c` gave 0 failures.
- **A round 301:** baseline report only, with no change (`a-round-301.md`).
- **Gate 301** (`gates/gate-round-301.json`): `skipped`, "no real changes", head `aa7a6ef`. The baseline for round 302 stays gate 300's commit, `aa7a6ef`, which B re-checked as HEAD [K1].
- **No new Saba, root or user-review decision files.** Every file carries the job-restore time.

## 2. Backlog updates (C and gate evidence only)
Script: `b-round-301/update-backlog.py`. The backlog version is now 261. Backups are `b-round-301/*-before-302.*`.
- **REGRESSION-ROUND-2026-11-02 → completed** (D-29z781).
  - `regression-last.json` = `{"date":"2026-11-02","round":301}`. Every row ran, so the date advances.
  - REGRESSION-ROUND-2026-11-05 is planned, due on or after that date.
  - `rounds[301]` → `c_pass_no_source_change`.
- **C-R301-01 → `deferred_low_polish`** (D-29z782).
  - Low, under the 2026-10-23 bug gate. It is a regression since round 258.
  - It is in L47's class. B cross-checked it against C-R241-01, C-R242-01 and GATE232-S1 (L7): all are closed, and none covers this origin (pointer-opened menu, nothing focused before).
  - Cause hypothesis: the DOM order changed after the master move (262/263). This is unconfirmed.
  - It is not scheduled, because NAME-AND-HINT does not own the grid menu. RETRO 305 counts it.
- **RR-PERF deltas ruled** (D-29z783, B-R301-PERF-ORACLE-DELTAS):
  - PERF-1a and PERF-1b-i have 0 deterministic deltas.
  - PERF-1b-ii has 9 growth rows: DOM +12 nodes per page, studio-lab JS +2.9 KB, home JS +1.2 KB.
  - They are accepted as the intended growth of rounds 286–300 (price fallback, narrow screen, deep link, library menu). All budgets pass.
  - The new oracle is `c-round-301/perf/`.
- **Record-only rows** (D-29z784):
  - SA-28 is closed as expected.
  - RP-MENU-SHEET closes the b-round-299 §9 candidate with no finding.
  - RP-LINK-NATIVE-MENU and RP-LINK-DRAG are attached as C evidence to GATE300-S2/S3, which stay deferred.
  - RP-NARROW: 0 overlaps.
  - NO-SHIFT-203 is carried again.
- **Item status:** no item left done. The only failure class is the deferred Low, and C ruled no reproducible Medium+ regression.

## 3. Round 302: NAME-AND-HINT-a, and why it is split (D-29z785)
- **The rule:** round 301's outcome table (D-29z780) gave "all PASS or Lows only → round 302 = NAME-AND-HINT". The round-size rule allows one feature stage per round.
- **Why split:** Q4 (naming across Store and Studio) and Q5 (a one-time status hint) touch different code and different lesson classes:
  - Q4: L3 box rows, L23 string collisions, the repo scan.
  - Q5: an L51 clobber/lifetime analysis on the status line, an L39 status-only budget, the Live reference and a product-designer consult on the hint.
- **The two stages:**
  - **NAME-AND-HINT-a = Q4**, round 302.
  - **NAME-AND-HINT-b = Q5**, round 303, unless 302 yields Medium+.
- Q5 is scheduled, not deferred. Doc 221 stays `In Progress (stage 1 of 2 …)` until b passes.

### 3.1 Rulings (D-29z786)
- **product-designer was consulted:**
  - title `CZABA Studio — Demo collection`;
  - h1 `CZABA Studio`, with the suffix removed;
  - home h2 `CZABA <glow>Studio</glow>`;
  - mockup title `CZABA Studio`;
  - checkout step `Access CZABA Studio anytime`.

  B took all of these.
- **Deviation from product-designer:** the export file stem stays `czaba-studio-lab`.
  - It is not in Q4's list, and a filename and URL are an external contract.
  - It has 28 hits in 10 files, including the perf liveness row, which is exactly the `perf/**` class that broke silently in C-R258-01.
  - It goes to Saba once as **SABA-Q-NAME-LAB-URL-FILE** (L44), together with the `/studio-lab` URL.
- **The testimonial** "The Mixdown Studio" is on the keep-list, so it stays verbatim. It goes to Saba as **SABA-Q-NAME-TESTIMONIAL**, with "keep" as the default.
- **Recorded, not in scope:**
  - 8 docs with the old names (B-R301-DOCS-OLD-NAME). The `CLAUDE.md` tagline is a proposal "For Saba" at RETRO 305.
  - The stale e2e badge "Personal Studio Included" (B-R301-E2E-STALE-PERSONAL-STUDIO).

### 3.2 B's scratch pre-check (L23)
The scratch is `/tmp/b301-scratch`: the tracked files plus `node_modules` linked. Artifacts are in `b-round-301/`.
- **Sketch:** `sketch.patch.txt` and `sketch-<basename>.txt` for all 11 code and test paths.
- **Covering run:** 18 files, 317/317 tests pass (`sketch-covering-run.log`). This includes the 7 repo-scan tests that read the tree. The 6 `*colour-ui` workspace files were run as well, for the removed span's classes: 44/44 pass (`sketch-colour-ui-run.log`). The covering set is 24 files, 361 tests.
- **Typecheck:** `npm run typecheck` rc 0 (`sketch-tsc.log`).
- **Biome:**
  - The final check has 0 errors (`sketch-biome-final.log`).
  - The mockup span had to collapse to one line (L5). The first check, `sketch-biome.log`, showed that.
  - The 2 `noArrayIndexKey` warnings in `checkout.success.tsx` are pre-existing [K11].
- **Mutants:**
  - A (mockup title) → NM1 and NM2 red.
  - C (checkout step) → NM1 red.
  - G (glow word) → NM2 red.
  - The control is green.
  - m4 (suffix restored) → NM1, ST31, PW1 and PW6 red (`mutant-m4.log`).
- **Claims:** `claims-302.sh`. Its output at HEAD is `claims-302-output.txt` (K20: every cited artifact exists, L56). K5–K10 on the sketch are in `claims-302-after-sketch.txt`.

### 3.3 What C checks, and what counts as success
See task §3:
- the unit covering set;
- the browser rows N-TITLE-H1, N-RETIRED-TEXT, N-HOME (1440, 1280, 390, and reduced motion), N-CHECKOUT, N-NAV, N-NARROW and N-EXPORT-NAME;
- the L54 journey N-JOURNEY (home → nav → Studio → add, play → export → back);
- N-SCREEN-BUDGET (no added persistent lines);
- SOURCE-SCOPE, CLAIMS, DOC, RV-EN and G302-AUTH.

The purchased-origin heading has no browser path (SRW-21 `deferred_user`), so it is BLOCKED in the browser and proven by unit PW1/PW6.

**Neighbours at risk:**
- the Studio header row;
- telling the purchased origin from the demo (only the badge does it now);
- the home showcase reveal;
- the export filename.

## 4. Consults
- **Advisor:** available, consulted once after orientation and before writing. It recommended:
  - ruling the RR-PERF deltas and the C-R301-01 L7 cross-check;
  - recording the split as a D-ID;
  - making the fileStem deviation explicit, with its blast radius, plus one Saba question;
  - the claims block and the artifact checks;
  - reusing the round-300 grant format;
  - checking "Personal Studio" and the docs;
  - the checkout, box, purchased and screen-budget rows;
  - writing "no reference found" for Live.

  B followed all of it. B consulted it a second time before finishing. That review led B to:
  - add the post-A values of K17 and K18;
  - tag the protected-label fact (K21) and the l.121 fact;
  - run m4;
  - put round 300's measured screen budget (96 / 79) into the row;
  - confirm `/checkout/success` has no parent route;
  - add the 6 colour files to the covering set.
- **product-designer:** consulted (§3.1). Its states checklist became the C rows.
- **Ableton reference:** none found for product naming. B searched once ("Ableton Live 12 manual window title bar Set name") and claims nothing.
- **Others:** none. A copy round adds no interaction to judge.

## 5. Order after 302
1. Round 303: NAME-AND-HINT-b (Q5), or a bounded fix-up first if C finds a Medium or worse.
2. PERF-3c and the rest of STUDIO-PERFORMANCE.
3. STEM-LANES.
4. SYS-1…3.
5. STORE-2b…5.
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. The phase-2 entries, under the skip rule.

SRW-21-PLAN stays parallel. RETRO is at round 305. The next regression is due on or after 2026-11-05.

## 6. Frontend-architect checkpoint (D-29z787)
The STUDIO-LINK boundary request (`b-round-300.md` §6) is now recorded as ARCH-CHECKPOINT-STUDIO-LINK in `architecture_checkpoint_requests`, and it is still unanswered. Root's step is unchanged: call the read-only `frontend-architect` on `aa7a6ef` with the three inputs listed there. It is non-blocking, and round 302 touches none of its files.

## 7. Ready for commit?
- **Round 301:** no source change. The loop-state commit records the sweep and `regression-last.json`.
- **Round 302:** after C PASS and the gate, root publishes the 12 granted paths.

## 8. Why not COMPLETE or BLOCKED
- **Not COMPLETE:** these all remain:
  - NAME-AND-HINT a and b;
  - STUDIO-PERFORMANCE (PERF-3c…15), STEM-LANES and SYS-1…3;
  - STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - every deferred Low, which must be fixed and verified before final acceptance.

  SRW-21 is `deferred_user`.
- **Not BLOCKED:** nothing external is missing. The Saba questions are non-blocking.

## 9. Housekeeping
- **The store tree is untouched:** HEAD is `aa7a6ef` and `git status` is empty. B wrote only to `/tmp/b301-scratch` and the loop folder.
- **No servers were started.**
- **`lessons.md` is unchanged** (59 lines). C-R301-01 falls under the existing L47, and planning found no new failure class.
- **`context/active-*`** files are root-generated and were not edited.
