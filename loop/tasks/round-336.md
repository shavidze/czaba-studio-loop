# Round 336: RETRO 336 (tenth retrospective, rounds 321–335) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 335 → 336 planning, 2026-11-04.

**Decisions** (all in `backlog.json` v295 → `decisions_log_b`):
- D-29z1011: round 335 accepted; **PERF-DRAG-PREVIEW c3-i is done**; baseline `f1def9c`.
- D-29z1012: gate-335 rulings.
- D-29z1013: A-R335-REVIEW-WHOLE-NOTE → `deferred_low_polish`.
- D-29z1014: RETRO 336 outputs.
- D-29z1015: lessons.
- D-29z1016: EXP-R321-PRECHECK-GATES interim reading.
- D-29z1017: screen and journey review.
- D-29z1018: L46 deadlines and the split candidates.
- D-29z1019: systemic task SYS-R336-PERF-DRAG-WINDOW.
- D-29z1020: retro-candidate dispositions.
- D-29z1021: what comes next.
- D-29z1022: this task.

**Rules:**
- **Policy:**
  - "Retrospective: stop, look back, improve" (Saba, 2026-10-26);
  - "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28);
  - the RETRO journey step (2026-10-31);
  - `backlog.json` → `retro_policy`.
- **Window:** 321–335 (15 rounds), as `retro_policy.next_due` set it (D-29z882). D-29z1009 chose RETRO for round 336 because this planning date (2026-11-04) is before 2026-11-05.
- **Read first:** `lessons.md`. This planning revised it, and the revision applies from round 336:
  - L58 gains the record wording and the sketch-review clause;
  - **L22 gains the STOP-with-diff short route;**
  - L57 gains `affectedChecksNamed` and `affectedChecksRunOnSketch` from round 337;
  - line 3 now points to retro-336.
- **L57 (all fields):** C's JSON carries **all** L57 fields:
  - `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding;
  - `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`;
  - `gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`.

  In this RETRO round, `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`, `gateChecksRunOnSketch` and `chainHeadGateRunGreen` are `null` with the reason "RETRO: no assert specified". `gateChecksNamed` lists the gate rows below. The affected-check fields start in round 337.
- **L29 note:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. Every fact about a `store/` file carries a `[K#]` tag (§8).
- **Loop path:** `tmp/studio-real-loop` may be a symlink. Search it with `find -L` (L38).

## Baseline: HEAD `f1def9c`, clean tree
- **Gate:** gate 335 published `f1def9c…` on both remotes [K1]. That commit is the round-336 baseline.
- **Tree:** `git status --short --untracked-files=all` was empty at planning, and HEAD was `f1def9c` [K2].
- **Frozen:** every tracked file, **1,236** entries, is listed in `b-round-335-r336-tree-sha256.txt` [K3].
  - Check from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-335-r336-tree-sha256.txt`.
  - B ran it after both consults: rc 0.
  - Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **Round 335 passed** (`c-round-335.json`: 11 rows, `browserVerified` and `realVerified` true, 0 bugs). Gate 335 published `f1def9c`. **PERF-DRAG-PREVIEW c3-i is done.** `c-round-335/lane-rows.txt` is the c3-ii baseline.
- **Round-335 findings:**
  - A-R335-REVIEW-WHOLE-NOTE (Low) → `deferred_low_polish` (D-29z1013).
  - The gate-335 suggestions (D-29z1012):
    - S1, S3 and S4 → Lows;
    - S2 → closed info;
    - the Architecture note → ARCH-R335-DRAG-WINDOW-HELPER;
    - A's pre-existing Info → INFO-A335-SEQUENCE-ORDER.

    The Lows, the Info and the signal are all scheduled in **SYS-R336-PERF-DRAG-WINDOW** (D-29z1019).
- **RETRO is due:** `retro_policy.next_due` = round 336 (D-29z882). D-29z1009 fixed the order: if this planning is before 2026-11-05, round 336 is RETRO.
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-02 [K14], so the next one is due on or after 2026-11-05.
- **No open Critical or High.** The open Mediums are root-only or manual (A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE, GATE304-M1), and the 2026-10-23 clarification says they do not block. None is a security or data-loss bug.
- **Not applicable in a RETRO round:**
  - reference first, Ableton and the product-designer design step;
  - the screen budget, because nothing visible changes.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-336.md` | The analysis, in Georgian with English terms, for Saba. Window 321–335 |
| `lessons.md` | **59 lines** (≤ 60) [K7], three parts. Before-copy: `b-round-335/lessons-before-336.md`. Diff: `b-round-335/lessons-diff.txt` (four lines change: l.3, L22, L57, L58) |
| `user-review/screen-review-336.md` | Candidates **SR-336-1 and SR-336-2** [K19]. Captures are in `b-round-335/screens/`: `capture.mjs`, `capture.log`, `screen336.json`, `compare-321-336.txt` and the 12 PNGs [K9] |
| `b-round-335/*.py`, `*.txt`, `*.json` | The scripts and data behind every number (`retro-336.md` header). The hand files are `fails-cause-hand.txt` and `gate-reviews-hand.txt`. `update-backlog.py` holds this planning's backlog edits |
| `backlog.json` (version 295) | <ul><li>Decisions D-29z1011…D-29z1022 [K10].</li><li>`retro_runs` 336 and `retro_policy`.</li><li>`screen_review_candidates` SR-336-*.</li><li>`systemic_tasks` SYS-R336-PERF-DRAG-WINDOW.</li><li>The gate-335 ids and the retro-candidate dispositions.</li></ul> Before-copy: `b-round-335/backlog-before-336.json` |
| `feature-status.md` | <ul><li>Rows 335 and 336, and the next line.</li><li>The STUDIO-PERFORMANCE row.</li><li>RETRO 321, now done (RT-FIX PASS in C round 322).</li><li>RETRO 336.</li></ul> |

**Order of work (the C-R215-01 lesson):**
- The analysis scripts read the **before** copy.
- Run them from the loop root as `python3 -I b-round-335/<script>.py`: first `collect.py`, then `cost.py`, then the others.
- `cost.py` prints to stdout; B saved that output as `cost.txt`. `retro-numbers.py` reads `cost-rows.json` and `rounds-321-335.json`.
- `retro336-mentions.py` takes two arguments: `b-round-335/backlog-before-336.json` and an output folder. C should give its own folder, e.g. `c-round-336`.
- `misc-outputs.sh` re-creates `task-titles.txt`, `stops-count.txt`, `deferred-totals.txt`, `open-medium-plus.txt`, `archived-mediums.txt` and `c-models.txt`. Run it as `bash b-round-335/misc-outputs.sh c-round-336` and `cmp` the results.
- `candidates.txt` was consult input only; no retro number comes from it.
- `update-backlog.py` is **not** re-runnable: it refuses when `b-round-335/update-backlog.done` exists. Do not run it.

## 2. A: nothing to implement
1. From `store/`, confirm three things:
   - HEAD = `f1def9c…`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen sha check prints nothing.
2. Write `a-round-336.md` with the three results and "no change, by RETRO policy".
   - Do not run typecheck, lint, vitest or the code-reviewer.
3. Do not edit `retros/`, `lessons.md`, `user-review/` or any B file.
   - If you disagree with a lesson in the A part, write it under "Lesson feedback". The same goes for L58's new sketch-review clause or the record wording, which change what B hands you.

## 3. C: what to verify
C writes `c-round-336.md` and `c-round-336.json` as it goes, with **all** L57 fields (see Rules).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: HEAD `f1def9c`, a clean status, and the frozen list with rc 0 | Nothing in `store/` changed. Any change fails the round, whoever made it |
| **CLAIMS** | Run `bash b-round-335/claims-336.sh` from the loop root, **first** (L56). Compare its output with `b-round-335/claims-336-output.txt` | Every line is equal. K8 prints `done` with no `MISSING` |
| **RT-NUM** | Recompute **every number** in `retro-336.md` §1, §2, §3, §9 and §10 from its named file or script. C may copy the scripts to `c-round-336/`; run them from the loop root. At least: <ul><li>**Totals:** $150.61 / $112.15 / $77.00 / $339.76; the round median $20.23; the phase medians B $9.20, A $5.44, C $5.90; the FAIL-round cost $117.06; the B share 44%.</li><li>**Groups:** $25.54 / $212.93 / $86.26 / $15.03, and fix-ups total $101.29. Per fix-up: 323 16.35, 324 36.20, 326 15.03, 328 18.14, 330 15.57.</li><li>**STOP rounds:** $65.40 (322 + 323 + 327).</li><li>**Counts:** <ul><li>C PASS/FAIL 10/5; gate 9/5/1; C `bugs[]` Medium 3, Low 13;</li><li>9 review.md files with 42 findings (38 by script + 4 by hand for 334);</li><li>the `classify.txt` origin sums gate 20, A 15, C 8, B 1 and 28 + 16 = 44;</li><li>592 deferred; 88 awaiting_user ids; 4 STOPs; first feature stages 3 of 9.</li></ul></li><li>**Medians:** B 322–335 $8.685; A $7.655 / $4.54; C $6.32 / $1.23.</li><li>**§9:** `gateChecksRunOnSketch` 0–2 of 6 in 322–335 (`exp-fields.txt`).</li><li>**§10:** L23 5058 bytes and L58 2803 bytes, both by `sed -n Np lessons.md \| wc -c` [K15]. L22's "C $19.04" is the sum of the C costs of 322, 323 and 327 in `cost.txt`.</li></ul> | Each number matches its source, or the difference is ≤ $0.01 rounding |
| **RT-CAUSE** | For each row of §3 and each fact in §7 and §9, open the quoted source: <ul><li>`c-round-321.json`, `c-round-322.json`, `c-round-323.json`, `c-round-324.json`, `c-round-327.json`, `c-round-329.json` (`bugs[].origin`);</li><li>`a-round-322.md`, `a-round-323.md`, `a-round-324.md`, `a-round-327.md` (the STOP lines);</li><li>`gates/round-325/verify.log` l.733 and l.4918; `tasks/round-326.md` (title);</li><li>`b-round-321.md` l.56 (the type-sketch collision lists);</li><li>`gates/round-335/review.md` (suggestions 1–4 and the Architecture note);</li><li>`c-round-322.md` row RT-FIX (RETRO 321 now done);</li><li>the closure of C-R322-01, C-R323-01 and C-R327-01: `tasks/round-323.md`, `tasks/round-324.md`, `tasks/round-328.md` (titles), `c-round-324.json` and `c-round-328.json` (`taskStatus` PASS);</li><li>the two Mediums missing from the active view: `b-round-335/archived-mediums.txt`, made from `archive/findings-archived.json`;</li><li>the model change: `b-round-335/c-models.txt`.</li></ul> | <ul><li>Each stated cause is what the source says; no cause is invented.</li><li>The EXP-R321 interim reading follows from its written rule in `retros/retro-321.md` §10.</li><li>Consultant opinions are labelled as opinions.</li><li>The model change is a fact (`c-models.txt`); that the cost drop is due **only** to it is labelled as an inference.</li></ul> |
| **RT-IDS** | <ul><li>**Round 335 closure:** PERF-DRAG-PREVIEW status starts with `in_progress (D-29z1011)` and says c3-i done. `rounds[335].status` starts with `c_pass_published f1def9c`.</li><li>**Gate-335 ids:** GATE335-S1-MOUSE-UP-FINALLY, -S3-LANE-SEGMENT-CONSTANTS, -S4-REPEATED-NOTES (Low, in `deferred_low_polish` and `open_findings`, "scheduled in SYS-R336-PERF-DRAG-WINDOW"); GATE335-S2-PERMOVE-DENOMINATOR `closed_info`; INFO-A335-SEQUENCE-ORDER; ARCH-R335-DRAG-WINDOW-HELPER in `architecture_signals`.</li><li>A-R335-REVIEW-WHOLE-NOTE is in `deferred_low_polish`.</li><li>**Systemic task:** SYS-R336-PERF-DRAG-WINDOW exists in `systemic_tasks` (its `closes` list has the six ids) and in the STUDIO-PERFORMANCE stages.</li><li>**Inventory (D-29z1018…D-29z1020):** every id in `b-round-335/retro336-mention-ids-v2.txt` has a disposition in `retro-336.md` §8. Also grep the **before** copy for `retro[ -_]?33[56]` case-insensitive, `RETRO \(33[56]\)`, `round 33[56]` and `RETRO-336` to catch other spellings. An entry with no disposition is a finding.</li><li>**Candidates:** RC-R321-RECORD-WORDING adopted; RC-R275 status names L22; RC-R305-LESSON-CHAR-CAP watches L58 too; RC-R332-COMPARATOR-BRANCH and RC-R333-STALE-DERIVED-MUTANT exist.</li><li>`retro_runs[-2]` (321) status starts with `done`.</li></ul> | All present as stated |
| **RT-LESSONS** | `lessons.md`: <ul><li>≤ 60 lines, with the three parts;</li><li>`diff b-round-335/lessons-before-336.md lessons.md` touches only l.3, L22, L57 and L58;</li><li>L22, L57 and L58 start with their old text byte for byte (prefix compare) and only append;</li><li>line 3 changes only in the sources span (`retro-321.md` → `retro-336.md`, `305–320` → `321–335`) and the appended RETRO 336 sentence;</li><li>no other line changed; the id list equals K13</li></ul> | As stated. A lost clause or evidence id is a finding |
| **RT-SABA** | `retro-336.md` §12 and `screen-review-336.md`: every rule change and screen candidate is phrased as a **proposal, information or question** | SR-336-1 and SR-336-2 are questions. §12.1 says the L22 mitigation is loop-local and asks for no runner change now. §12.5 is a proposal |
| **RT-SCREEN (browser)** | Every SR-336 candidate names a screenshot that exists and shows what it describes; C opens the PNGs. Then C re-runs `b-round-335/screens/capture.mjs` (or an equivalent) **with the mock backend** at both viewports, writing to `c-round-336/screens/`: <ul><li>First check `http://127.0.0.1:5199/__mock/health`. If it answers, use the running instance and do not stop it. Otherwise start your own (`node mock-api/server.mjs`, log under `c-round-336/`) and stop it afterwards.</li></ul> Check: <ul><li>`laneErrors` is none;</li><li>the journey reaches `/studio-lab?preview=middle-east` [K12];</li><li>the position after Play is ≥ 00:01.000;</li><li>the visible row counts equal 138 / 168 / 118 / 144 [K6], or differ only by dynamic text you name;</li><li>for SR-336-2, measure in the browser that the library list's first visible option is cut at the top: its top is above the list's top, read from `getBoundingClientRect`;</li><li>per L54, any claim about cut or overflowing text is checked on the screenshot or by measurement</li></ul> | Each candidate is as described. A mismatch is a finding against the review, not against the app |
| **G336-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720 (warm up in a browser first, L38; wait for a non-empty body): <ul><li>`/studio-lab` shows the workspace and the demo badge; `localStorage.auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;</li><li>`/api/studio-token` returns 401 with no header. A fake bearer gives 403 with the mock running, or a 500 that fails closed without it</li></ul> | As stated. No token in any body |
| **STUDIO-SMOKE-336 (browser)** | On `/studio-lab` at both viewports, after `Demo collection ready` (L48): <ul><li>add `Bass` (Enter);</li><li>Play, then after 1.5 s `[data-testid=arrangement-position]` reads ≥ `00:01.000`;</li><li>Play's `data-playing` goes `false` → `true` → `false` [K5];</li><li>drag the clip by its name bar one lane **down**, to the lane directly below the one the clip landed on (if it landed on the last audio lane, one lane up instead; record the start and target `[data-track-id]`), and release: the clip's `[data-track-id]` lane is the target and the Undo title reads "Undo: Move clip" (the c3-i path);</li><li>Ctrl+Z restores the lane;</li><li>export a WAV: RIFF/WAVE, 48 kHz, length 16.000 s, non-silent (peak > 0)</li></ul> | As stated. A hash compare is not required |

- **Gate rows:** the full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if G336-AUTH, STUDIO-SMOKE-336 and the RT-SCREEN re-run all ran at both viewports. The other RT rows are document checks.
- **Consults (optional):** `product-designer` in review mode on SR-336-1/2 (at most 7 findings). Record any disagreement as a finding against the review.

## 4. Outcome, fixed in advance (D-29z1021)
| C result | B at the round-337 planning |
|---|---|
| All rows PASS, planning on or after 2026-11-05 | Round 337 is **REGRESSION** (REGRESSION-ROUND-2026-11-05): <ul><li>one short check per done or `c_pass` item, at both viewports, plus the smoke;</li><li>every `scope_additions` entry as a named row (L6), including the C-R318-06 repro and root-cause row.</li></ul> `regression-last.json` is updated when it closes. Then SYS-R336-PERF-DRAG-WINDOW |
| All rows PASS, planning before 2026-11-05 | Round 337 is **SYS-R336-PERF-DRAG-WINDOW** (test-only; acceptance in `systemic_tasks`): <ul><li>B runs the perf spec on its sketch first (L58);</li><li>B runs the code-reviewer on the sketch diff (the new L58 clause);</li><li>B writes the affected-check fields (L57).</li></ul> |
| An RT row fails (an untraceable number, an invented cause, a missing disposition, a lost clause, a candidate not as described) | B corrects the files at the round-337 planning. The next C round re-checks only the changed lines (RT-FIX, as rounds 216, 231, 246, 261, 276, 291, 306 and 322), together with the round-337 task |
| G336-AUTH, STUDIO-SMOKE-336 or RT-SCREEN finds a Medium or worse in the app | It is fixed first (2026-10-23 bug gate). A Low goes to `deferred_low_polish` |
| SOURCE-SCOPE fails | Stop. Root inspects. Nothing is published |

**After that:** SYS-R336 (if not yet run) → PERF-DRAG-PREVIEW c3-ii (with the liveness assert) → c4 → c5 → the record → assert conversions → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

## 5. Neighbour risk
App code carries no risk: no source file changes. The risk is in the process:
- **L58's sketch-review clause** adds one code-reviewer run to B's planning. The countermetric is B's median; it was $8.685 in 322–335.
- **L22's short route** could hide a real defect when A STOPs on a ruled clause. The clause keeps the auth guard and the STOP's own check. A claim-value STOP keeps the full run (round 324).
- **SYS-R336 before c3-ii** risks changing row values mid-stage. Its acceptance pins every deterministic row EQUAL to C round 335's run.
- **The screen review goes to Saba.** RT-SCREEN re-runs the capture and measures SR-336-2.

## 6. Deliverables
- **A:** `a-round-336.md`.
- **C:** `c-round-336.md` and `c-round-336.json`, with evidence under `c-round-336/`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`;
  - `passed`, `failed`, `blocked`, `gate`, `rows`;
  - all L57 fields.

## 7. Root notes
- **Nothing to publish from `store/`.** A change there is itself a FAIL. The loop-state commit records the retro.
- **For Saba:**
  - `user-review/screen-review-336.md`: 2 new candidates; the weakest step is still SR-305-3;
  - `retro-336.md` §12: the STOP-routing mitigation is now loop-local (information);
  - 88 awaiting-user ids.
- **For root:**
  - checkpoint D-29z915 is still unanswered, with the SIG-R331/SIG-R332 L46 questions added (`b-round-335.md` §8);
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) is still open.

## 8. Claims (L29 + L56 form)
Run `bash b-round-335/claims-336.sh` from the loop root. The expected output is `b-round-335/claims-336-output.txt`.

| Tag | Claim | Expected (from the output file) |
|---|---|---|
| K1 | gate 335 published `f1def9c` | `published f1def9c` |
| K2 | clean tree and HEAD at planning | `0 f1def9c` |
| K3 | 1,236 frozen entries | `1236` |
| K4 | each protected file appears once | eleven `1` |
| K5 | Play's playing signal and name in `store/` | the `data-playing` line in `ArrangementTransport.tsx` and `playLabel: 'Play',` in `strings.ts` |
| K6 | screen-capture row counts; no lane errors | `{'1440x900-S0': 138, '1440x900-DEMO': 168, '1280x720-S0': 118, '1280x720-DEMO': 144} None` |
| K7 | lessons line count | `59` |
| K8 | every cited artifact exists (L56) | `done` |
| K9 | the screenshots exist | `12` |
| K10 | backlog version and last decision | `295 D-29z1022` |
| K11 | C JSONs in 321–335 without `manifestPaths` | `none-missing` |
| K12 | journey facts | `/studio-lab?preview=middle-east`, the positions and clip counts in the output file |
| K13 | lesson ids | the id list in the output file |
| K14 | regression-last date | `2026-11-02` |
| K15 | L23 and L58 length in bytes (`wc -c`) | `5058 2803` |
| K16 | the round-335 archive equals the old task | `archive-equal` |
| K17 | B median 322–335 and window total | `8.685 339.76` |
| K18 | rounds with an A STOP line | `322 323 324 327` |
| K19 | SR-336 ids in the review equal the backlog ids | `sr-ids-equal` |
