# Round 401: RETRO 401 (fourteenth retrospective, rounds 385–400) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 400 → 401 planning, 2026-11-08 (`b-round-400.md`).

## Decisions
These are recorded in `backlog.json` (v367 → v369) under `decisions_log_b`.

- **D-29z1371: round 400 is accepted.**
  - Evidence: C PASS in `c-round-400.json` (12 rows; `browserVerified` and `realVerified` both true; 0 bugs). Gate 400 published `c17d0e9`, covering rounds 399–400 [K1].
  - **PERF-14b-i is done.**
  - Closed: C-R399-01 and TL-R398-SK-M2.
  - A's four spec Lows → A-R400-REVIEW-SPEC-LOWS (a PERF-14b-ii input). The reviewer's architecture note → signal A-R400-ARCH-READBESIDECLIP.
- **D-29z1372: the RETRO outputs** (§1). `retro_policy.next_due` = round 416.
- **D-29z1373: lessons.** l.3, L4 and L58 change (§1).
- **D-29z1374: RETRO-400 deadlines (L46).** There is no answer to `user-review/questions-arch-leaf-plumbing.md` [K23], so the recorded defaults apply:
  - SYS-R385-LEAF-ACTIONS-CONTEXT is `queued` after PERF-14c;
  - SYS-R369 is `queued` before STEM-LANES;
  - SYS-R388 is `queued`;
  - ARCH-CHECKPOINT-PREVIEW-AFTER-13C gets deadline RETRO 416;
  - B-R382-SCOPED-LOCATORS is retired.
- **D-29z1375: order after this round** (§5). REGRESSION-2026-11-10 is entered.
- **D-29z1376: origin re-tagging; root note.**
  - All 4 C FAILs in the window are re-tagged B-origin.
  - ROOT-NOTE-R387-STOP-NOT-HONOURED is recorded as recurring 4×.
  - `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 and carry nothing new.

## Rules
- **Policy:**
  - "Retrospective: stop, look back, improve" (Saba, 2026-10-26);
  - "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28);
  - the RETRO journey step (2026-10-31);
  - `backlog.json` → `retro_policy`.
- **Window: 385–400** (16 rounds). The retro slipped one round (D-29z1369). Older ids "RETRO 400" / `RETRO-400` refer to this retro. Its file is `retros/retro-401.md`; there is no `retro-400.md`.
- **Read `lessons.md` first.** This planning revised it, and the revision applies from round 401: l.3, L4 (l.9) and L58 (l.41) each gained one clause.
- **L57:** C's JSON carries **all** L57 fields.
  - Every field except `gateChecksNamed` and the four manifest fields is `null`, with the reason "RETRO: no assert specified".
  - `gateChecksNamed` lists the gate rows below.
  - Before hand-off, C runs `python3 -I tools/l57-check.py c-round-401.json c-round-401/l57-check.txt` and fixes its own JSON until it exits 0.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. The only facts about `store/` are the HEAD, the tree and the manifest [K2] [K3] [K19].
- **L59, L60:**
  - run every row until it has a result;
  - run the heaviest rows (the browser rows) first;
  - write `c-round-401/progress.json` after each row;
  - destructive commands stay inside `c-round-401/`.

**Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step, the YouTube request and the screen budget. Nothing visible changes.

## Baseline: HEAD `c17d0e9`, clean tree
- **Gate:** gate 400 published `c17d0e9…` on both remotes [K1].
- **Tree:** `git status --short --untracked-files=all` was empty at planning, with HEAD `c17d0e9` [K2] [K19].
- **Frozen:** every tracked file, **1,294** entries, is listed in `b-round-400/r401-tree-sha256.txt` [K3].
  - Check it from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-400/r401-tree-sha256.txt`. B ran it at planning: rc 0.
  - Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **The RETRO is due.** `retro_policy.next_due` was round 400. It moved to 401 because round 400 finished C-R399-01 on an unpublished tree (D-29z1369).
- **Nothing blocks a code-free round.**
  - Round 400 closed the only open Medium from a C FAIL (C-R399-01).
  - The remaining open Mediums are root-only, manual, `awaiting_user` or sketch inputs (TL-R398-SK-M1, fixed inside the PERF-14b-ii sketch before dispatch). They do not block (2026-10-23 clarification).
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-07 [K13]. The next one is due at the first planning on or after 2026-11-10.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-401.md` | The analysis, in Georgian with English terms, for Saba. Window 385–400, 13 sections |
| `lessons.md` | **60 lines** [K7]. Before-copy: `b-round-400/lessons-before-401.md`. Diff: `b-round-400/lessons-diff.txt`. Three lines change: l.3, L4 (l.9) and L58 (l.41) [K18] |
| `user-review/screen-review-401.md` | No new candidates and no new question. Captures are in `b-round-400/screens/`: `capture.mjs`, `warmup.mjs`, `capture.log`, `screen401.json`, `compare-385-401.txt` and 12 PNGs [K5] [K6] [K9] |
| `b-round-400/*.py`, `*.sh`, `data/*` | The scripts and data behind every number. `data/retro-numbers-401.txt` is produced by `b-round-400/retro-numbers.py` |
| `backlog.json` (v369) [K10] | <ul><li>D-29z1371…D-29z1376;</li><li>`retro_runs` 401;</li><li>`retro_policy.next_due`: round 416;</li><li>`retro_candidates` dispositions, plus the new RC-R401-ORIGIN-RETAG;</li><li>`systemic_tasks`: SYS-R385, SYS-R369 and SYS-R388 are `queued`;</li><li>ARCH-CHECKPOINT-PREVIEW-AFTER-13C has the L46 deadline;</li><li>`screen_review_candidates` SR-401-NONE;</li><li>`regression_rounds` REGRESSION-2026-11-10;</li><li>A-R400-REVIEW-SPEC-LOWS;</li><li>A-R400-ARCH-READBESIDECLIP.</li></ul> Before-copy: `b-round-400/backlog-before-401.json`. Edits: `update-backlog-part1.py` (v368) and `update-backlog-part2.py` (v369) |
| `feature-status.md` | Round 400 is done. The next line, the STUDIO-PERFORMANCE row and a RETRO 401 row are updated (`b-round-400/update-feature-status.py`) |

**Order of work (C-R215-01, RC-R336-SCRIPT-OUTPUT-DIR):**
- The analysis scripts read the **before** copy, `b-round-400/backlog-before-401.json`, and write to `b-round-400/data/` by default.
- **First copy the scripts to `c-round-401/scripts/`.** In the copies, rewrite every `b-round-400/data/` output path to `c-round-401/data/`, run them there, and `cmp` your outputs against B's.
- Run order:
  1. `collect.py`;
  2. `cost.py` (its stdout is `cost.txt`);
  3. `retro-numbers.py`;
  4. the others.

  `misc-outputs.sh` takes an output folder argument: give it `c-round-401/data`.
- **Do not run** `update-backlog-part*.py`, `update-feature-status.py` or `edit-lessons.py`. They are not re-runnable: the `.done` markers make them refuse.

## 2. A: nothing to implement
A writes `a-round-401.md` with one line: "RETRO round, no implementation." **STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-401.md` and `c-round-401.json` as it goes, plus `c-round-401/progress.json` after every row. **Run order:** the browser rows first (rows 2–4), then the document rows.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r401 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G401-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720. Open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with **no** Authorization header (valid parameters, L29) | `localStorage.auth_user` is null and the workspace opens. "Sign in required" shows with 0 `audio[src]`. The token API returns **401** with body `Please sign in to access Studio.` and no token. A fake-bearer check goes under `blocked` (no backend) |
| 3 | **STUDIO-SMOKE-401 (browser)** | Both viewports, after `Demo collection ready`: add one library item with Enter; press Play for about 1.5 s, then Stop; open Export and close it | The clip appears, the position advances and then stops, and the dialog opens and closes. Screenshots go under `c-round-401/` |
| 4 | **RT-SCREEN (browser)** | <ul><li>Open the PNGs that `screen-review-401.md` cites and check that they show what is described.</li><li>Check `http://127.0.0.1:5199/api/products`. If it is not 200, start `node mock-api/server.mjs` in the background.</li><li>Run `b-round-400/screens/warmup.mjs` from `store/`, then `node <abs>/b-round-400/screens/capture.mjs <abs c-round-401/screens>`.</li></ul> | <ul><li>Visible-text counts are 138/168/118/144, and the outside-timeline counts are 97/124/86/101 [K5].</li><li>The journey ends at `/studio-lab?preview=middle-east` with 4 clips at left 512/1152/1792/2432 [K6].</li><li>A difference is explained (`positionAfterPlay` is wallclock), or it is a finding with `origin`.</li></ul> |
| 5 | **CLAIMS** | `bash b-round-400/claims-401.sh`, compared with `b-round-400/claims-401-planning-output.txt` | No `MISSING`. Differences are allowed only where C's own work changes a value (none expected); each one is explained |
| 6 | **RT-NUM** | Re-run the scripts as in §1 and `cmp` the outputs. Recompute **every number** in `retro-401.md` §1, §2, §4 and §9 from its named file. At least the list below this table | Every number matches its source. A number without a source is a finding (origin B) |
| 7 | **RT-CAUSE** | For each row of §3 and each fact in §5, §7 and §8, open the quoted source. At least the list below this table | Each "fact" is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No cause is invented |
| 8 | **RT-IDS** | `backlog.json`. The full list is below this table | All present, as stated |
| 9 | **RT-LESSONS** | `lessons.md` | <ul><li>≤ 60 lines, in three parts;</li><li>the diff touches only l.3, 9 and 41 [K18];</li><li>each of l.9 and 41 keeps its old text byte for byte as a prefix and appends one clause;</li><li>l.3 changes only the retro pointer and appends one sentence;</li><li>no lesson id is lost [K12];</li><li>L23 is 5058 bytes and L58 4335, both < 5500 [K14]</li></ul> |
| 10 | **RT-L57** | `python3 -I tools/l57-check.py c-round-400.json c-round-401/l57-c400.txt` (rc 0, K11), then the same on your own `c-round-401.json` | Both rc 0 |
| 11 | **RT-SABA** | `retro-401.md` §12 and `screen-review-401.md` | Every rule change and screen item is phrased as information, a proposal or a question. Nothing is presented as Saba's decision. The defaults in §8 are labelled as defaults under L46, with the question still open |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-401.json` | 0 lines and both rc 0; then rc 0 |

**RT-NUM: the numbers to recompute (at least).**
- Totals: $294.13; B $181.15, A $98.51, C $14.47; B share 61.6 %.
- Medians: round $19.16; B $11.28, A $5.695, C $0.64 [K16].
- Costs: FAIL rounds $101.13 (34.4 %); chains $156.23 (53.1 %); C's cost in the four FAIL rounds $2.68 [K25]; RETRO 385 $10.27; REGRESSION $18.75.
- Results: PASS 12 / FAIL [387, 391, 394, 399] / BLOCKED 0; gate skipped [385, 387, 389, 390, 391, 394, 399] [K20].
- STOP rounds 387, 391, 394, 399 [K17].
- The `classify` counts 5 / 44 and the deferred origins A 25 / gate 13 / C 4 / B 2.
- L57 12/16, with 386, 390, 391 and 392 incomplete.
- Plannings with a sketch and no review: 388, 391, 394, 395 [K21].
- 31 gate-review findings.

**RT-CAUSE: the sources to open (at least).**
- `a-round-387.md` l.1, `a-round-391.md` l.1, `a-round-394.md` l.3 and `a-round-399.md` l.3.
- `c-round-387/391/394/399.json` (bugs with `origin`).
- `b-round-386/sketch-review.md`.
- `b-round-398/sketch-review.md` ("Split after review").
- `c-round-399.json` `affectedChecksRunOnSketch` [K24].
- `data/l58-sketch-review-application.txt`.
- `user-review/questions-arch-leaf-plumbing.md` (the answer line) [K23].

**RT-IDS: what must be in `backlog.json`.**
- These statuses start as stated [K22]:
  - C-R399-01 and TL-R398-SK-M2: `closed`;
  - SYS-R385, SYS-R369 and SYS-R388: `queued`;
  - ARCH-CHECKPOINT-PREVIEW-AFTER-13C: `L46`;
  - B-R382-SCOPED-LOCATORS: `retired`;
  - RC-R394 and RC-R399: `adopted`.
- D-29z1371…D-29z1376 exist.
- `retro_runs` has round 401.
- `retro_policy.next_due` starts with "round 416".
- These ids exist: RC-R401-ORIGIN-RETAG, SR-401-NONE, REGRESSION-2026-11-10, A-R400-REVIEW-SPEC-LOWS and A-R400-ARCH-READBESIDECLIP.
- Every id that retro §11 lists exists in `deferred_low_polish` or `open_findings`.

**Flags and gate rows:**
- **`browserVerified`:** true only if rows 2, 3 and 4 all ran at both viewports. The other rows are document checks.
- **`gate` rows:** verify and the full suite belong to the root gate. There is no source change, so no publication is expected.

**Verdict and routing:**
| Result | What happens |
|---|---|
| Every row PASS | PASS |
| An RT row fails (untraceable number, invented cause, missing disposition, lost clause or id) | B corrects the files at the round-402 planning; the next C round re-checks only the changed lines (RT-FIX) |
| A browser row finds a Medium or worse in the app | It is fixed first (bug gate) |
| A browser row finds a Low | It goes to `deferred_low_polish` |

## 4. Neighbour risk
None in the app: no code changes. The only risk is to loop artifacts. C must not re-run B's `.done` scripts (§1).

## 5. Order after this round (D-29z1375)
1. **Round 402 is PERF-14b-ii, unless REGRESSION-2026-11-10 is due at that planning; if it is, the REGRESSION round goes first.** Before PERF-14b-ii is dispatched:
   - fix `b-round-398/sketch-14bii-lane.patch.txt` for TL-R398-SK-M1 (unpin on window `blur`; remove all three listeners) and TL-R398-SK-L1;
   - re-run VZ and the mutants;
   - get a delta review (the L58 claim);
   - rule Q-14B-PIN-GROUP-MEMBERS, the budget flips and the scroll ceiling;
   - fold in A-R400-REVIEW-SPEC-LOWS.
2. PERF-14c.
3. SYS-R385-LEAF-ACTIONS-CONTEXT.
4. PERF-15.
5. SYS-R2-FAKE-FIDELITY and SYS-R388.
6. SYS-CLOCK-DETERMINISM.
7. SYS-R369.
8. STEM-LANES.
9. SYS-1…3.
10. STORE-2b…5.
11. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
12. The phase-2 entries, under the skip rule.

## 6. Out of scope
App code, tests, docs in `store/` and the protected files.

## 7. Claims
Run `bash b-round-400/claims-401.sh` from the loop root. The output at planning is in `b-round-400/claims-401-planning-output.txt` (0 `MISSING`, stderr empty).

| Tag | Claim |
|---|---|
| K1 | gate 400 published `c17d0e9` |
| K2 | git status was 0 bytes at planning; HEAD `c17d0e9` |
| K3 | 1,294 manifest entries |
| K4 | each protected file appears once |
| K5 | screen counts 138/168/118/144 |
| K6 | journey URL and clip lefts |
| K7 | lessons: 60 lines |
| K8 | every cited artifact exists (`b-round-400/cited-artifacts.txt`) |
| K9 | 12 PNGs |
| K10 | backlog v369, last decision D-29z1376 |
| K11 | l57-check on `c-round-400.json` rc 0 |
| K12 | lesson ids |
| K13 | regression-last 2026-11-07 |
| K14 | L4 / L23 / L58 byte counts |
| K15 | `tasks/round-400.md` equals the before-copy |
| K16 | the B median and the cost totals |
| K17 | the STOP rounds |
| K18 | the lessons diff lines |
| K19 | HEAD and the status line count at planning |
| K20 | the FAIL / BLOCKED / gate-skipped lists |
| K21 | plannings with a sketch patch and no `sketch-review.md` |
| K22 | the finding and task statuses |
| K23 | the leaf-plumbing answer line is still the template (1) and there is no decisions file (0) |
| K24 | `c-round-399.json` records that the migrated specs were not run on a sketch by B |
| K25 | C's cost in the four FAIL rounds |
