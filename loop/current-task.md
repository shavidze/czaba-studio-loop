# Round 435: RETRO 435 (seventeenth retrospective, rounds 420–434; trigger: 15 rounds since RETRO 420) + whole-screen and journey review. No app code. A: nothing to implement. C: checks that the retro is traceable, plus the auth guard, a short Studio smoke test and the screen capture in the browser

**Planned by:** B, at the round 434 → 435 planning, 2026-11-10 (`b-round-434.md`). The advisor was consulted after orientation. The round-434 task is archived as `tasks/round-434.md` [K15].

## Decisions
All are recorded in `backlog.json` (v417 → v419) under `decisions_log_b` [K10].
- **D-29z1538: round 434 is accepted.**
  - C PASS in `c-round-434.json`: 0 bugs, `browserVerified`/`realVerified` true.
  - B's own re-runs: L57 OK (`b-round-434/l57-check-c434.txt`). The scrollbar compare gives ALL OK on C's after-probe and NOT ALL OK on HEAD (`b-round-434/recheck/`). The mutant summary is identical. Auth passes.
  - Gate 434 published `8233840` [K1].
- **D-29z1539: round-434 Lows.**
  - GATE434-S1, GATE434-S2 and B-R434-CONFIRMMODAL-NAME go to `deferred_low_polish`.
  - The gate's Firefox finding is recorded as `confirmedBy` on TLM-SABA-B-12-FIREFOX-SAFARI (L7).
  - The Architecture note is a signal on ROOT-REQ-ARCH-CHECKPOINT-STUDIO-CONTROLS Q4.
- **D-29z1540: L46 rulings.** These go to Saba as `user-review/questions-retro-435.md`, Q1–Q4 [K24].
- **D-29z1541: lessons and `tools/l57-check.py`.**
- **D-29z1542: the systemic task SYS-R435-SOURCE-SCAN-HELPER, the screen candidates and REG-PERF-FULL-SUITE.**
- **D-29z1543: the RETRO record and the order after this round** (§5).

## Rules
- **Policy:**
  - "Retrospective: stop, look back, improve" (Saba, 2026-10-26).
  - "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28).
  - The RETRO journey step (2026-10-31).
  - `backlog.json` → `retro_policy`.
- **Window and report:** rounds 420–434 (15 rounds). The report is `retros/retro-435.md`.
- **Read `lessons.md` first.**
  - This planning changed l.3, L37 (l.24) and L56 (l.40) [K18].
  - L56's new clause applies to this task: every number below names its file.
  - `tools/l57-check.py` now also rejects an `origin` value outside the L57 enum (`B spec`, `B pre-check`, `A`, `pre-existing`, `environment`). C's own findings use those values.
- **L57 and L22:**
  - C's JSON carries all L57 fields.
  - Every field is `null` with the reason "RETRO: no assert specified", except `gateChecksNamed` and the four manifest fields.
  - Every bug carries an enum `origin`.
  - Before hand-off C runs `python3 -I tools/l57-check.py c-round-435.json c-round-435/l57-check.txt` and gets rc 0.
- **L29:**
  - Untagged code text below is a row id, a loop-artifact path or a description of what C runs.
  - The only facts about `store/` are HEAD, the tree, the manifest and the protected list [K1] [K2] [K3] [K4] [K19].
- **L59 and L60:**
  - Run every row until it has a result. Browser rows go first.
  - Write `c-round-435/progress.json` after each row.
  - Destructive commands stay inside `c-round-435/`.
- **Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step and the screen budget. Nothing visible changes. The questions file is an output for Saba; it does not dispatch a feature.

## Baseline: HEAD `8233840`, clean tree
- **Gate:** gate 434 published `8233840…` on both remotes [K1].
  - `context/head-sha.txt` may still show `0c22ac9`. That is the snapshot from before the gate.
  - `git rev-parse HEAD` is the truth.
- **Tree:** at planning, `git status --short --untracked-files=all` was empty and HEAD was `8233840` [K2] [K19].
- **Frozen files:** every tracked file is in `b-round-434/r435-tree-sha256.txt`, **1,344** entries [K3].
  - Check it from `store/` with `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-434/r435-tree-sha256.txt`. B ran it at planning: rc 0.
  - Each of the 11 protected files in `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round. No root work is pending.

## 0. Why this round
- **The RETRO is due.** Fifteen rounds have passed since RETRO 420 (`retro_policy.next_due`, D-29z1465).
- **Nothing blocks a code-free round.** No Critical or High finding is open. The open Mediums are scheduled (STUDIO-VIS-4/6, SABA-B-12 stage 4), root-only, manual or `awaiting_user` (2026-10-23 clarification).
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-10 [K13], so it is due at the first planning on or after 2026-11-13.

## 1. What B produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-435.md` | Georgian analysis for Saba, 13 sections, window 420–434 |
| `lessons.md` | **60 lines** [K7]. Before-copy `b-round-434/lessons-before-435.md`; diff `b-round-434/lessons-diff.txt`, hunks `3c3`, `24c24` and `40c40` [K18]. Lesson ids unchanged [K12]. L23 and L58 unchanged [K14] |
| `tools/l57-check.py` | Validates the `origin` enum. Before-copy `b-round-434/l57-check-before-435.py`; diff `b-round-434/l57-check-diff.txt`. Backfill: `b-round-434/data/l57-enum-backfill.txt` |
| `user-review/screen-review-435.md` | No change from 420; SR-435-1 and SR-435-2. Captures in `b-round-434/screens/`: `capture.mjs`, `capture.log`, `screen435.json` and 12 PNGs [K5] [K6] [K9] |
| `user-review/questions-retro-435.md` | Q1–Q4, each with a default [K24] |
| `b-round-434/consult-tech-lead.md`, `consult-product-designer.md`, `consult-inputs.md` | The consult inputs and the returned reports |
| `b-round-434/*.py`, `misc-outputs.sh`, `data/*` | The scripts and data behind every number |
| `backlog.json` (v419) | D-29z1538…D-29z1543 and the ids of [K22]. Before-copy `b-round-434/backlog-before-435.json`. Edit scripts `b-round-434/update-backlog-accept.py` and `update-backlog-retro.py` (each with `.done`). Retro input snapshot `b-round-434/backlog-retro-input.json` (v418) [K23] |
| `feature-status.md` | Round 434 done; RETRO 435 row; the TLM and STUDIO-PERFORMANCE rows |

**Order of work (C-R215-01, RC-R336-SCRIPT-OUTPUT-DIR):**
1. The analysis scripts read `b-round-434/backlog-retro-input.json` and `b-round-434/archive-findings-snapshot.json`, and write to `b-round-434/data/`.
2. **Copy them to `c-round-435/scripts/` first.** Rewrite every `b-round-434/data/` output path to `c-round-435/data/`, run them there, and `cmp` the results against B's outputs.
3. Run order:
   - `collect.py`, which writes `rounds-420-434.json`;
   - then `cost.py` (stdout = `cost.txt`; it also writes `cost-rows.json`);
   - then `classify.py`, `fails-detail.py`, `gate-reviews.py`, `l57-coverage.py`, `retro435-deadlines.py`;
   - then `stage-sums.py` and `misc-outputs.sh c-round-435/data`.
   - `collect.py` skips the B phase on purpose. B is costed by `cost.py` from `b-round-(N-1)-result*.json`. `b-round-434-result*.json` appears only after this planning and is outside the window. So `collect.txt` and `cost.txt` are expected to `cmp` equal; any difference is a finding.
4. **Do not run** `update-backlog-*.py`, `edit-lessons.py` or `update-feature-status.py`. Their `.done` markers make them refuse.
5. `l57-enum-backfill.txt` and `l58-check-window.txt` are loops over `tools/l57-check.py c-round-N.json` (N = 420…434) and `tools/l58-check.py tasks/round-N.md` (N = 421…434). Re-run both loops.

## 2. A: nothing to implement
A writes `a-round-435.md` with one line: "RETRO round, no implementation."

**STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-435.md` and `c-round-435.json` as it goes, plus `c-round-435/progress.json` after every row. Browser rows (2–4) go first.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r435 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G435-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720: open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `localStorage.auth_user` is null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake-bearer premium path: BLOCKED (backend unavailable in cloud) |
| 3 | **STUDIO-SMOKE-435 (browser)** | Both viewports, after `Demo collection ready`: add one library item with Enter; Play about 1.5 s, then Stop; open Export, then close it | The clip appears; the position advances, then stops; the dialog opens and closes. Screenshots under `c-round-435/` |
| 4 | **RT-SCREEN (browser)** | Open the PNGs that `screen-review-435.md` cites and check they show what it says. Check `http://127.0.0.1:5199/api/products`; if it is not 200, start `node mock-api/server.mjs` in the background and stop it afterwards. Run `b-round-415/screens/warmup.mjs` from `store/` first (the dev server is cold). Then run `node <abs>/b-round-434/screens/capture.mjs <abs c-round-435/screens>` from the loop root | Line counts equal B's [K5]: 138/168/118/144, and outside 97/124/86/101. ±2 per cell is allowed for status-line timing, with each delta explained. The journey shows the stems one after another on one lane: 3 clips in view at `left` 512 / 1152 / 1792, and the status naming the fourth at 00:48.000 "(nearest free spot)" [K6]. The review's statements (incl. SR-435-1's "48"/"64" next to "Start 00:48.000" and SR-435-2's "source offset" footer text) match the PNGs |
| 5 | **CLAIMS** | `bash b-round-434/claims-435.sh` compared with `b-round-434/claims-435-planning-output.txt` | No `MISSING`; stderr empty. Differences only where C's own work changes a value (expected: none), each explained. K10 may differ if root's optimizer rewrote `backlog.json` between planning and C; check that the last D-ID is still D-29z1543 |
| 6 | **RT-NUM** | Re-run the scripts (§1) and `cmp` the outputs. Recompute every number in `retro-435.md` §1, §2, §4, §8 and §9 from its named file, at least the list below | Every number matches its source. A number without a source is a finding (origin `B spec`) |
| 7 | **RT-CAUSE** | For each fact in §3, §5, §6 and §7, open the quoted source, at least the list below | Each fact is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No invented cause. C-R423-01's cause stays labelled a hypothesis (not bisected) |
| 8 | **RT-IDS** | `python3 -I tools/find-ids.py . $(cat b-round-434/k22-ids.txt)` [K22]; plus in `backlog.json`: `tech_lead_manual_checks` TLM-PERF15-FIREFOX, `retro_candidates` RC-R435-NUMBER-CHECKER and RC-R423-PERF-SPEC-ON-STRUCTURE, `screen_review_candidates` SR-435-1 and SR-435-2, `retro_runs` round 435, `regression_rounds` REGRESSION-2026-11-13 `scope_additions` REG-PERF-FULL-SUITE | All present, with the status the retro states. C-R425-01 is NOT-FOUND, and C-R425-01-RVM-COLD-DEV-EMPTY is present (one id, §4). The 11 ids of §11 each carry `systemic_task` SYS-R435-SOURCE-SCAN-HELPER |
| 9 | **RT-LESSONS** | `lessons.md` against `b-round-434/lessons-before-435.md` | ≤ 60 lines and three parts. The diff touches only l.3, l.24 and l.40. l.24 keeps all of the old L37 text and appends exactly the "Fiber-structure change" clause. l.40 changes only "a count names the file it was counted from" into the RETRO 435 clause. l.3 changes only the pointer (`retro-435.md`, `420–434`) and appends the RETRO 435 sentence |
| 10 | **RT-CHECKERS** | `tools/l57-check.py` against `b-round-434/l57-check-before-435.py` (diff = `b-round-434/l57-check-diff.txt`); the backfill loop (§1); `python3 -I tools/l58-check.py current-task.md` [K28]; the l58 loop over tasks 421–434 [K21] | The diff adds only the enum check. The backfill equals B's file: 423 and 425 are INCOMPLETE (`origin-not-enum`), all others OK, and 434 OK [K11]. l58 on this task gives rc 0 ("no sketch"). The window values equal [K21] |
| 11 | **RT-SABA** | `retro-435.md` §12, `screen-review-435.md`, `questions-retro-435.md` | Every rule change and screen item is information, a proposal or a question. Nothing is presented as Saba's decision. Each question has a default, and Q4's default is Saba's approved "From"/"To". The three project-rule items are labelled proposals |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-435.json` | 0 lines and both rc 0; then rc 0 |

**RT-NUM, at least:**
- **Totals [K16]:** $255.35; B $180.02, A $61.73, C $13.60.
- **Medians and averages:** round $15.62, B $11.63, B min/max 7.85/17.02, A PASS average $4.37 (`data/cost.txt`).
- **Per-round rows:** `data/cost-rows.json`.
- **Stage sums:** SYS-2 $104.72, SABA-B-12 $76.04, rounds 423–425 $42.41; the B share is 70.5 % (`data/stage-sums.txt`, from `b-round-434/stage-sums.py`).
- **Verdicts:** 14 PASS, FAIL [423], gate skipped [420, 423, 425], `browserVerified` 15/15 [K20].
- **STOPs:** none [K17].
- **Findings:**
  - C bugs 4, with origins (`data/fails-detail.txt`, `data/manifest-fields.txt`).
  - Deferred Lows in the window: 37 (A 25, gate 6, B 4, C 2), with categories; archive window 4 (`data/classify.txt`).
- **Gate reviews:** 12; score 9 on 422/424/426/430/432/433/434; 46 items: low 18, info 4, unlabelled 24 (`data/gate-reviews.txt`).
- **Checker coverage:** L57 15/15 (`data/l57-coverage.txt`); l58 12 of 12 sketches OK (`data/l58-check-window.txt`); `confirmedBy` 13 (`data/counters-extra.txt`).
- **Lesson sizes:** L23 5058 and L58 4988 bytes [K14].
- **retro-420 comparison:** 15.51, 11.735 and 3.69 (`b-round-419/data/cost.txt`).
- **Screen counts:** [K5].

**RT-CAUSE, at least:**
- `c-round-423.json` (C-R423-01, its origin text);
- D-29z1482 and D-29z1483 in `archive/decisions-archived.json`;
- `c-round-425.json` (C-R425-01);
- `a-round-434.md` "For B" and `gates/round-434/review.md` (findings 1–3, Architecture note);
- `b-round-434/consult-tech-lead.md` items 1–6;
- `b-round-434/consult-product-designer.md`;
- `publication-checkpoint.json` key `scrollbarUserRequest` (the 2026-10-07 recurrence);
- `lessons.md` L61 (the SABA-B-12 lesson);
- `backlog.json` SABA-LANE-RESIZE-HANDLE (no lesson).

## 4. Claims
The script is `b-round-434/claims-435.sh`. B's run is saved in `b-round-434/claims-435-planning-output.txt`, with stderr in `b-round-434/claims-435-planning.err` (empty).

| Claim | What it checks |
|---|---|
| K1 | Gate 434 |
| K2 | The tree at planning |
| K3 | The manifest count |
| K4 | Each protected file appears once in the manifest |
| K5 | Screen line counts |
| K6 | Journey clips |
| K7 | `lessons.md` line count |
| K8 | Every artifact in `b-round-434/cited-artifacts.txt` exists |
| K9 | PNG count |
| K10 | Backlog version and last D-ID |
| K11 | The new l57 check on `c-round-434` |
| K12 | Lesson ids |
| K13 | Regression date |
| K14 | L23, L58 and L61 byte counts |
| K15 | The archived task equals B's copy |
| K16 | Cost medians and totals |
| K17 | STOP rounds |
| K18 | Lessons diff hunks |
| K19 | HEAD and status now |
| K20 | Fail, blocked, gate-skipped and browser counts |
| K21 | l58-check on tasks 421–434 |
| K22 | Backlog ids (archive-aware, `tools/find-ids.py`) |
| K23 | The retro input is v418 |
| K24 | The questions file has 4 questions |
| K25 | AGREE-STEM-LANES answer-word count (2 at planning; a change means Saba answered, so report it) and no STEM-LANES transcripts |
| K28 | l58-check on this task |

## 5. After this round (D-29z1543)
1. **REGRESSION-2026-11-13** runs at the first planning on or after 2026-11-13, with REG-PERF-FULL-SUITE.
2. Otherwise **436 = COPY-PD-VIS**: STUDIO-VIS-4/6/7/10, SABA-LANE-RESIZE-HANDLE and SR-435-2. STUDIO-VIS-6 uses Q4's default unless Saba answers first.
3. Then, in order:
   - SYS-R435-SOURCE-SCAN-HELPER;
   - SYS-1;
   - SYS-3;
   - STORE-REDESIGN 2b…5;
   - ARCH-SPLIT, with the L37 perf clause;
   - REVIEW-RECOMMENDATIONS;
   - T12-ADVANCED;
   - phase 2, under the skip rule.
4. **STEM-LANES** jumps ahead as soon as Saba answers AGREE-STEM-LANES.
5. **Next RETRO:** round 450.
