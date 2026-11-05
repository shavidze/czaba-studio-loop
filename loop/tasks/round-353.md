# Round 353: RETRO 353 (eleventh retrospective, rounds 336–352) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 352 → 353 planning, 2026-11-05.

**Decisions** (all in `backlog.json` v314 → v316, `decisions_log_b`):
- D-29z1127: round 352 accepted; **PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 is done**; baseline `a55543b`.
- D-29z1128: round-352 Lows and the gate-352 suggestions routed.
- D-29z1129: the architecture checkpoint is requested from root now. It is non-blocking.
- D-29z1130: RETRO 353 outputs.
- D-29z1131: lessons.
- D-29z1132: the systemic task SYS-R353-DP-TEST-POLISH.
- D-29z1133: EXP-R321 closed, candidate dispositions, screen review.
- D-29z1134: this task and what comes next.

**Rules:**
- **Policy:**
  - "Retrospective: stop, look back, improve" (Saba, 2026-10-26);
  - "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28);
  - the RETRO journey step (2026-10-31);
  - `backlog.json` → `retro_policy`.
- **Window:** 336–352 (17 rounds). RETRO slipped twice from 351 so that the open Mediums closed first (D-29z1122, D-29z1126).
- **Read first:** `lessons.md`. This planning revised it, and the revision applies from round 353:
  - L58's sketch-review clause is replaced: sha256 plus per-row mutant logs;
  - L57 gains the checker `tools/l57-check.py`;
  - L28 gains the no-`pending` clause;
  - line 3 points to retro-353.
- **L57 (all fields, and the new checker):** C's JSON carries **all** L57 fields:
  - `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding;
  - `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`;
  - `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`;
  - `affectedChecksNamed`, `affectedChecksRunOnSketch`.

  In this RETRO round, every field except `gateChecksNamed` and the four manifest fields is `null` with the reason "RETRO: no assert specified". `gateChecksNamed` lists the gate rows below. **Before hand-off, C runs `python3 -I tools/l57-check.py c-round-353.json c-round-353/l57-check.txt` and fixes its own JSON until it exits 0** (new L57 clause). An absence is C's bookkeeping to fix, not a row FAIL.
- **L29 note:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. Every fact about a `store/` file carries a `[K#]` tag (§8).
- **Loop path:** `tmp/studio-real-loop` may be a symlink. Search it with `find -L` (L38). Destructive commands stay inside `c-round-353/` (L60).
- **L59:** run every row until it has a result. Write `c-round-353/progress.json` after each row.

## Baseline: HEAD `a55543b`, clean tree
- **Gate:** gate 352 published `a55543b…` on both remotes [K1]. That commit is the round-353 baseline.
- **Tree:** `git status --short --untracked-files=all` was empty at planning, and HEAD was `a55543b` [K2] [K22].
- **Frozen:** every tracked file, **1,242** entries, is listed in `b-round-352/r353-tree-sha256.txt` [K3].
  - Check from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-352/r353-tree-sha256.txt`.
  - B ran it after the consults: rc 0.
  - Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **Round 352 passed** (`c-round-352.json`: 9 rows, `browserVerified` and `realVerified` true, 0 bugs). Gate 352 published `a55543b`. PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 is done.
- **Five findings closed:** C-R351-01 and A-R350-REVIEW-SEEK-TEST (Medium), and C-R350-01, A-R351-REVIEW-GLOBAL-SPY and A-R351-REVIEW-TRY-SPAN (Low).
- **New Lows:** A-R352-REVIEW-COMMIT-EXACT, -DRAG-DISTANCE and -WINDOW-PRECONDITION, plus GATE352-S1 and S2, go to `deferred_low_polish`. The gate-352 Architecture note becomes the signal GATE352-ARCH-DOCK-LIFECYCLE (D-29z1128).
- **RETRO is overdue.** `retro_policy.next_due` was round 351, and it slipped twice.
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-05 [K14], so the next one is due on or after 2026-11-08.
- **No open Critical or High.** The open Mediums are root-only or manual (A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE, GATE304-M1). The 2026-10-23 clarification says they do not block. None is a security or data-loss bug.
- **Not applicable in a RETRO round:**
  - reference first, Ableton and the product-designer design step;
  - the screen budget, because nothing visible changes.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-353.md` | The analysis, in Georgian with English terms, for Saba. Window 336–352, 13 sections |
| `lessons.md` | **60 lines** (≤ 60) [K7], three parts. Before-copy: `b-round-352/lessons-before-353.md`. Diff: `b-round-352/lessons-diff.txt`. Four lines change: l.3, L58 (l.41), L28 (l.50) and L57 (l.58) [K20] |
| `tools/l57-check.py` | The L57 checker. On `c-round-352.json` it exits 1 with 9 absent fields [K11] (`b-round-352/l57-check-c352.txt`) |
| `user-review/screen-review-353.md` | Candidates **SR-353-1 … SR-353-5** [K19], with the `product-designer` section. Captures are in `b-round-352/screens/`: `capture.mjs`, `capture.log`, `screen353.json`, `compare-336-353.txt` and the 12 PNGs [K9] |
| `b-round-352/*.py`, `*.txt`, `*.json` | The scripts and data behind every number. `retro-numbers-353.txt` indexes each number with its source, and `claims-data.txt` gives a recompute command per number. The hand files are `fails-cause-hand.txt`, `stops.txt`, `gate-reviews-hand.txt`, `rc-recurrence.txt` and `exp-r321-final.txt` |
| `backlog.json` (version 316) [K10] | <ul><li>D-29z1127…D-29z1134.</li><li>`retro_runs` 353 and `retro_policy` (`next_due` round 368).</li><li>`screen_review_candidates` SR-353-*.</li><li>`systemic_tasks` SYS-R353-DP-TEST-POLISH.</li><li>The candidate dispositions, ROOT-REQ-B-CONSULT-CODE-REVIEWER and the ARCH checkpoint request.</li></ul> Before-copy: `b-round-352/backlog-before-353.json`. Edits: `update-backlog.py` (part 1, v315) and `update-backlog-part2.py` (v316) |
| `feature-status.md` | Round 352 is now done, the next line is updated, and a RETRO 353 row is added. Edit script: `b-round-352/update-feature-status.py` |
| `b-round-352/root-request-arch-checkpoint.md` | The non-blocking request for root (question 4 is new) |

**Order of work (the C-R215-01 lesson, and RC-R336-SCRIPT-OUTPUT-DIR):**
- The analysis scripts read the **before** copy, `b-round-352/backlog-before-353.json`.
- **First copy the scripts to `c-round-353/scripts/` and run them there.** `collect.py`, `classify.py` and `awaiting-user.py` (and possibly others) write into `b-round-352/` by default. Change the output paths in your copies so they never overwrite B's files, then `cmp` or diff your outputs against B's.
- Order: `collect.py`, then `cost.py` (stdout = `cost.txt`), then the others. `retro-numbers.py` reads `cost-rows.json` and `rounds-336-352.json`. `misc-outputs.sh` and `retro353-mentions.py` take an output folder argument: give them `c-round-353`.
- `update-backlog*.py`, `update-feature-status.py` and `edit-lessons.py` are **not** re-runnable: the `.done` markers refuse, and `edit-lessons.py` would fail its asserts. Do not run them.

## 2. A: nothing to implement
1. From `store/`, confirm three things:
   - HEAD = `a55543b…`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen sha check prints nothing.
2. Write `a-round-353.md` with the three results and "no change, by RETRO policy".
   - Do not run typecheck, lint, vitest or the code-reviewer.
3. Do not edit `retros/`, `lessons.md`, `tools/`, `user-review/` or any B file.
   - If you disagree with a lesson in the A part, write it under "Lesson feedback". The same goes for the new L28 clause, which changes the doc l.4 string you write.

## 3. C: what to verify
C writes `c-round-353.md` and `c-round-353.json` as it goes, with **all** L57 fields (see Rules).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: HEAD `a55543b`, a clean status, and the frozen list with rc 0 | Nothing in `store/` changed. Any change fails the round, whoever made it |
| **CLAIMS** | Run `bash b-round-352/claims-353.sh` from the loop root, **first** (L56). Compare its output with `b-round-352/claims-353-output.txt` | Every line is equal. K8 prints `done` with no `MISSING` |
| **RT-NUM** | Recompute **every number** in `retro-353.md` §1, §2, §3, §9 and §10 from its named file or script (`retro-numbers-353.txt`, `claims-data.txt`). At least: <ul><li>**Totals:** $160.75 / $86.52 / $30.38 / $277.65; the round median $17.01; the phase medians B $11.51, A $5.93, C $0.95; the B share 57.9%; the B median for 337–352 $9.98 [K17].</li><li>**Groups:** RETRO $14.17, REGRESSION $29.51, feature $212.05, fix-up $21.92 (351 $9.91, 352 $12.01); the chain cost $43.44; FAIL/STOP rounds $31.43; the top five rounds.</li><li>**Counts:** <ul><li>C PASS/FAIL/BLOCKED 14/2/1; gate 11/6/0; `bugs[]` Medium 1, Low 6; 1 of 7 with `origin`;</li><li>11 review.md files, 49 items (28 by script + 21 by hand);</li><li>classify: open 26 (C 8, A 12, gate 6) + deferred 35 (A 24, gate 8, C 3), and the severity and category counts in §4;</li><li>634 deferred; 90 awaiting_user; STOPs 350, 351 [K18]; first-time C fail 1 of 11.</li></ul></li><li>**L57:** 5 of 16 JSONs complete (337, 338, 339, 341, 344) in `l57-coverage.txt`.</li><li>**§9:** B median 322–337 $9.93; A median $5.35.</li><li>**§10:** L23 5058 and L58 2803 → 2908 bytes, by `sed -n Np \| wc -c` on the before and after files [K15].</li><li>**The retro-336 comparison column:** each value equals `retros/retro-336.md` §1/§2 or `tasks/round-336.md` RT-NUM.</li></ul> | Each number matches its source, or the difference is ≤ $0.01 rounding |
| **RT-CAUSE** | For each row of §3 and each fact in §5, §7 and §9, open the quoted source: <ul><li>`c-round-340.json`, `c-round-341.json`, `c-round-350.json`, `c-round-351.json`, `c-round-352.json` (bugs, status, `browserVerified`);</li><li>`a-round-350.md` l.3 and `a-round-351.md` l.3 (the STOP lines), and `a-round-351/review.md` F1;</li><li>`c-round-340.md` l.3 and l.7; `c-round-351.md` l.1–3 (the short route);</li><li>`b-round-349/` (no M-B2 log; list the folder);</li><li>`decisions_log_b` D-29z1123 (sketch review skipped in round 350);</li><li>`gates/round-352/review.md` (suggestions 1–3 and the Architecture note);</li><li>`b-round-352/c-models.txt` (model facts);</li><li>`retros/retro-321.md` §10 (the EXP rule);</li><li>the consult attributions in §7 and §10, to `tech-lead` and `product-designer`. B reports them; C checks that every consultant opinion is labelled as an opinion</li></ul> | <ul><li>Each stated cause is what the source says; no cause is invented.</li><li>The EXP-R321 verdict follows from its written rule.</li><li>Inferences are labelled: the C cost drop vs the model, the B-share reading in §2, the 350 STOP-route reading, the RC-R333 2× reading, the §4 root-cause groups.</li></ul> |
| **RT-IDS** | <ul><li>**Round 352 closure:** `rounds[352].status` starts with `c_pass_published a55543b`. C-R351-01, A-R350-REVIEW-SEEK-TEST, C-R350-01, A-R351-REVIEW-GLOBAL-SPY and A-R351-REVIEW-TRY-SPAN have a status starting `closed (D-29z1127)`.</li><li>**New ids:** A-R352-REVIEW-COMMIT-EXACT, -DRAG-DISTANCE, -WINDOW-PRECONDITION, GATE352-S1 and GATE352-S2 are in `deferred_low_polish` and `open_findings`. GATE352-ARCH-DOCK-LIFECYCLE is in `architecture_signals`. ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE has `question_4_d29z1129`.</li><li>**Systemic task:** SYS-R353-DP-TEST-POLISH is in `systemic_tasks` (its `closes` list has the four ids) and in the STUDIO-PERFORMANCE stages. The four ids carry "scheduled in SYS-R353-DP-TEST-POLISH".</li><li>**Inventory:** every id in `b-round-352/retro353-mention-ids-v2.txt` has a disposition in `retro-353.md` §8. Also grep the **before** copy, case-insensitive, for `retro[ -_]?35[123]`, `RETRO \(35[123]\)`, `round 35[123]` and `RETRO-35[123]`, to catch other spellings. An entry with no disposition is a finding.</li><li>**Candidates:** the eight `retro_candidates` statuses start as §8 says. ROOT-REQ-PERF-TIMEOUT's status starts with `question to Saba`. ROOT-REQ-B-CONSULT-CODE-REVIEWER exists.</li><li>`retro_runs[-1]` is 353; `retro_policy.next_due` names round 368.</li></ul> | All present as stated |
| **RT-LESSONS** | `lessons.md`: <ul><li>≤ 60 lines, with the three parts;</li><li>`diff b-round-352/lessons-before-353.md lessons.md` touches only l.3, l.41 (L58), l.50 (L28) and l.58 (L57) [K20];</li><li>L28 and L57 keep their old text byte for byte and each only adds one clause. each appends its clause at the end of the line;</li><li>L58: the "B's sketch is reviewed before dispatch" clause is replaced by the RETRO 353 clause, which keeps its rule (an unruled Medium that A's reviewer finds is a planning FAIL) and its evidence (C-R327-01, A-R327-REVIEW-SAME-TEXT-REMOUNT); elsewhere only wording is trimmed. List every removed word. **No evidence id and no rule may be lost**;</li><li>line 3 changes only the sources span and the RETRO note;</li><li>the id list equals K13</li></ul> | As stated. A lost clause or evidence id is a finding |
| **RT-L57** | Run `python3 -I tools/l57-check.py c-round-352.json c-round-353/l57-c352.txt`: rc 1 with 9 absent, as K11. Then a mutant check: a copy of `c-round-339.json` (rc 0 at planning) with one field deleted, saved under `c-round-353/`, makes it exit 1. Finally your own `c-round-353.json` exits 0 | The checker does what L57 says |
| **RT-SABA** | `retro-353.md` §12 and `screen-review-353.md`: every rule change and screen candidate is phrased as a **proposal, information or question** | SR-353-1…5 are questions or proposals. §12.1 is one question. §12.4 and §12.5 are proposals |
| **RT-SCREEN (browser)** | Every SR-353 candidate names a screenshot that exists and shows what it describes; C opens the PNGs. Then C re-runs `b-round-352/screens/capture.mjs` (or an equivalent) **with the mock backend** at both viewports, writing to `c-round-353/screens/`: <ul><li>First check `http://127.0.0.1:5199/__mock/health`. If it answers, use the running instance and do not stop it. Otherwise start your own (`node mock-api/server.mjs`, log under `c-round-353/`) and stop it afterwards.</li></ul> Check: <ul><li>`laneErrors` is none;</li><li>the journey reaches `/studio-lab?preview=middle-east` [K12];</li><li>the position after Play is ≥ 00:01.000;</li><li>the visible row counts equal 138 / 168 / 118 / 144 [K6], or differ only by dynamic text you name;</li><li>for SR-353-1, measure in the browser that the last-added clip's left edge is beyond the timeline's visible right edge at both viewports (`getBoundingClientRect`);</li><li>for SR-353-4, measure at 1280×720 whether the export dialog's Range options lie outside the dialog's visible area (scrollHeight vs clientHeight, or bottom vs viewport). The review says "not DOM-measured"; record the result;</li><li>per L54, any claim about cut or overflowing text is checked on the screenshot or by measurement</li></ul> | Each candidate is as described. A mismatch is a finding against the review, not against the app |
| **G353-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720 (warm up in a browser first, L38; wait for a non-empty body): <ul><li>`/studio-lab` shows the workspace and the demo badge; `localStorage.auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;</li><li>`/api/studio-token` returns 401 with no header. A fake bearer gives 403 with the mock running, or a 500 that fails closed without it</li></ul> | As stated. No token in any body |
| **STUDIO-SMOKE-353 (browser)** | On `/studio-lab` at both viewports, after `Demo collection ready` (L48) [K5]: <ul><li>add `Bass` (Enter);</li><li>Play, then after 1.5 s `[data-testid=arrangement-position]` reads ≥ `00:01.000`;</li><li>Play's `data-playing` goes `false` → `true` → `false` [K5];</li><li>drag the clip by its name bar one lane **down**, to the lane directly below the one it landed on (if it landed on the last audio lane, one lane up instead; record the start and target `[data-track-id]`), and release: the clip's lane is the target and the Undo title reads "Undo: Move clip";</li><li>Ctrl+Z restores the lane;</li><li>export a WAV: RIFF/WAVE, 48 kHz, non-silent (peak > 0); record its length</li></ul> | As stated. A hash compare is not required |

- **Gate rows:** the full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if G353-AUTH, STUDIO-SMOKE-353 and the RT-SCREEN re-run all ran at both viewports. The other RT rows are document checks.
- **Consults (optional):** `product-designer` in review mode on SR-353-1…5 (at most 7 findings). Record any disagreement as a finding against the review.

## 4. Outcome, fixed in advance (D-29z1134)
| C result | B at the round-354 planning |
|---|---|
| All rows PASS, planning before 2026-11-08 | Round 354 is **PERF-CAND-VIDEO-TRIM-FADE-COST stage 2**: <ul><li>the 22 video rows go from record to assert at C round 350 values: budgets only, and no new interactions-spec rows while ROOT-REQ-PERF-TIMEOUT is open;</li><li>doc 232 l.4 moves to the L28 form;</li><li>B runs the perf spec on its sketch (L58), saves `sketch-review.md` with the sha256 and the mutant logs (the new L58), and runs `tools/l57-check.py` on `c-round-353.json`</li></ul> |
| All rows PASS, planning on or after 2026-11-08 | Round 354 is **REGRESSION** in two parts, with the mock API health as the first row. Stage 2 follows |
| An RT row fails (an untraceable number, an invented cause, a missing disposition, a lost clause, a candidate not as described) | B corrects the files at the round-354 planning. The next C round re-checks only the changed lines (RT-FIX, as rounds 306 and 322), together with the round-354 task |
| G353-AUTH, STUDIO-SMOKE-353 or RT-SCREEN finds a Medium or worse in the app | It is fixed first (2026-10-23 bug gate). A Low goes to `deferred_low_polish` |
| SOURCE-SCOPE fails | Stop. Root inspects. Nothing is published |

**After that:** stage 2 → REGRESSION (due ≥ 2026-11-08) → SYS-R353-DP-TEST-POLISH → PERF-CAND-MASTER-GROUP-FADER-PROPS → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

## 5. Neighbour risk
App code carries no risk, because no source file changes. The risk is in the process:
- **The new L58 form** adds a sha256 line and per-mutant logs to B's planning. The countermetric is B's median: $9.98 in 337–352, with a stop line of $13.94. L58 grew 2803 → 2908 bytes (the retro-353 §7 reason); the RC-R305 trigger is 5500.
- **The L57 checker** could make C spend time on bookkeeping. It does not fail rounds: an absence is fixed before hand-off.
- **L28's no-`pending` rule** changes the l.4 string A writes for doc 232 in the next stage. Round 354's task grants that line explicitly.
- **The screen review goes to Saba.** RT-SCREEN re-runs the capture and measures SR-353-1 and SR-353-4.

## 6. Deliverables
- **A:** `a-round-353.md`.
- **C:** `c-round-353.md` and `c-round-353.json`, with evidence under `c-round-353/` and `c-round-353/progress.json`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`;
  - `passed`, `failed`, `blocked`, `gate`, `rows`;
  - all L57 fields, with `tools/l57-check.py` at rc 0.

## 7. Root notes
- **Nothing to publish from `store/`.** A change there is itself a FAIL. The loop-state commit records the retro.
- **For Saba:**
  - `retros/retro-353.md` §12.1: ROOT-REQ-PERF-TIMEOUT, asked once (raise the limit, or split the spec);
  - `user-review/screen-review-353.md`: 5 new candidates;
  - 90 awaiting-user ids.
- **For root:**
  - `b-round-352/root-request-arch-checkpoint.md`: the frontend-architect checkpoint, now at a feature boundary. It is non-blocking;
  - ROOT-REQ-B-CONSULT-CODE-REVIEWER: add `code-reviewer` to B's consult list (a proposal);
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) is still open.

## 8. Claims (L29 + L56 form)
Run `bash b-round-352/claims-353.sh` from the loop root. The expected output is `b-round-352/claims-353-output.txt`, and stderr is empty (`claims-353-stderr.txt`).

| Tag | Claim | Expected (from the output file) |
|---|---|---|
| K1 | gate 352 published `a55543b` | `published a55543b` |
| K2 | clean tree and HEAD at planning | `0 a55543b` |
| K3 | 1,242 frozen entries | `1242` |
| K4 | each protected file appears once | eleven `1` |
| K5 | Play's playing signal, its name, and the ready text in `store/` | `ArrangementTransport.tsx` l.286 `data-playing`, `strings.ts` l.233 `playLabel: 'Play',`, and 1 `'Demo collection ready.` line in `collection.ts` |
| K6 | screen-capture row counts; no lane errors | `{'1440x900-S0': 138, '1440x900-DEMO': 168, '1280x720-S0': 118, '1280x720-DEMO': 144} None` |
| K7 | lessons line count | `60` |
| K8 | every cited artifact exists (L56; list `b-round-352/cited-artifacts.txt`) | `done` |
| K9 | the screenshots exist | `12` |
| K10 | backlog version and last decision | `316 D-29z1134` |
| K11 | the L57 checker on `c-round-352.json` | `L57 INCOMPLETE rc=1` |
| K12 | journey facts | `/studio-lab?preview=middle-east`, positions `00:01.483` / `00:01.491`, 4 clips each |
| K13 | lesson ids | the id list in the output file |
| K14 | regression-last date | `2026-11-05` |
| K15 | L23 and L58 length in bytes (`wc -c`) | `5058 2908` |
| K16 | the round-352 archive equals the old task | `archive-equal` |
| K17 | B median 337–352 and the window total | `9.98 277.65` |
| K18 | rounds with an A STOP line | `350 351` |
| K19 | SR-353 ids in the review equal the backlog ids | `sr-ids-equal` |
| K20 | the lessons diff hunks | `3c3 41c41 50c50 58c58` |
| K21 | implementation docs with the `C round N pending` form at HEAD | only `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` |
| K22 | HEAD and status count when the claims run | `a55543b 0` |
