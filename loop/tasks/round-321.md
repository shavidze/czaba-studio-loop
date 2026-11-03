# Round 321: RETRO 321 (ninth retrospective, rounds 305–320) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 320 → 321 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v280 → `decisions_log_b`):
- D-29z880: round 320 accepted; **PERF-8a is done**; C-R318-01/02/03/04 and C-R319-01/02/03 closed; C-R320-01 becomes a required PERF-10 row.
- D-29z881: gate-320 triage.
- D-29z882: RETRO 321 outputs.
- D-29z883: lessons.
- D-29z884: EXP-R305-SKETCH-MUTANT verdict and the successor EXP-R321-PRECHECK-GATES.
- D-29z885: screen and journey review.
- D-29z886: systemic task SYS-R2-FAKE-FIDELITY.
- D-29z887: architecture checkpoint request ARCH-CHECKPOINT-PERF8-STORE-PATTERN.
- D-29z888: what comes next.
- D-29z889: retro candidates and the inventory dispositions.

**Rules:**
- **Policy:**
  - "Retrospective: stop, look back, improve" (Saba, 2026-10-26);
  - "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28);
  - the product-designer rule (2026-10-30);
  - the RETRO journey step (2026-10-31);
  - `backlog.json` → `retro_policy`.
- **Window:** D-29z877 moved this RETRO from 320 to 321, so it covers 305–320 (16 rounds).
- **Read first:** `lessons.md`. This planning revised it, and the revision applies from round 321:
  - L16 is merged into L3 (alias L16);
  - **L58** is new: an asserted number, name or byte pin is the saved output of C's own command on B's sketch;
  - L54 and L57 gain one clause each;
  - line 3 is now a pointer to the full history.
- **L57 (whole list, per its new clause):** C's JSON carries **all** L57 fields: `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`, an `origin` per finding, `assertsSpecified`, `mutantsRecorded` and `mutantRedOnSketch`. In this RETRO round the last three are `null` with the reason "RETRO: no assert specified". The EXP-R321 fields (`gateChecksNamed`, `gateChecksRunOnSketch`, `chainHeadGateRunGreen`) start in round 322.
- **L29 note:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. Every fact about a `store/` file carries a `[K#]` tag (§8).
- **Loop path:** `tmp/studio-real-loop` is a symlink. Search it with `find -L` (L38).

## Baseline: HEAD `53c5c79`, clean tree
- **Gate:** gate 320 published `53c5c79…` on both remotes [K1]. That commit is the round-321 baseline.
- **Tree:** `git status --short --untracked-files=all` was empty at planning, and HEAD was `53c5c79` [K2].
- **Frozen:** every tracked file, **1,226** entries, is listed in `b-round-320-r321-tree-sha256.txt` [K3].
  - Check from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-320-r321-tree-sha256.txt`.
  - B ran it after the last consult: rc 0.
  - Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **Round 320 passed** (`c-round-320.json`: 24 rows, `browserVerified` and `realVerified` true, 1 Low). Gate 320 published `53c5c79`. **PERF-8a is done:** range drag 108.167 → 9.233 components per move in production, max 30, 4 WAVs byte-identical.
- **Round-320 findings (D-29z880):**
  - **C-R320-01** (Low, B spec: the memo boundaries have no guard that can fail) becomes a **required row in PERF-10**, not `deferred_low_polish`. `tech-lead`: PERF-10 owns the same boundaries (L8).
  - A-R320-REVIEW-WAVEFORM-NAME-POSITIVE is folded into that row. A-R320-REVIEW-EXPORT-RENDER-READ goes to `deferred_low_polish`. A's `useDetailRange` note is an architecture signal for PERF-10.
- **Gate-320 triage (D-29z881):**
  - Finding 1 (Critical, "COMMIT: BLOCK" on the `useArrangement()` shape) is **closed**: the grant is in `tasks/round-318.md` l.102, and root published. The missing doc 230 decision line is GATE320-L1-DOC230-GRANT-LINE (Low), which rides PERF-8b.
  - **GATE320-S2** (`setRange(null)` before the selection write after an `await`): `open_low_provisional`. PERF-8b carries a browser experiment row (`tech-lead`'s method).
  - GATE320-S3 → PERF-10 record row. GATE320-S4 → `deferred_low_polish`. Finding 5 = SIG-R319-DEVOPTIONAL-NOTICES (root). GATE320-S6 → ARCH-CHECKPOINT-PERF8-STORE-PATTERN.
- **RETRO is due:** `retro_policy.next_due` was "round 320 …", and D-29z877 moved it to 321.
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-02 [K14], so the next one is due on or after 2026-11-05.
- **No open Critical or High.** The parked Mediums are unchanged: A-R73-SAFARI-FLAG-FOCUS, GATE128-S1-MIXED-LANGUAGE, R80-RECORDINGS-FIELD-BORDERS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE and GATE304-M1 (root). None is a security or data-loss bug.
- **Reference first / Ableton / product-designer design step:** not applicable (RETRO round). **Screen budget:** nothing visible changes.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-321.md` | The analysis, in Georgian with English terms, for Saba. Window 305–320 |
| `lessons.md` | **59 lines** (≤ 60) [K7], three parts. Before-copy: `b-round-320/lessons-before-321.md`. Diff: `b-round-320/lessons-diff.txt` |
| `user-review/screen-review-321.md` | Candidates **SR-321-1…6**. Captures in `b-round-320/screens/`: `capture.mjs`, `capture.log`, `screen321.json` and the 12 PNGs [K9] |
| `b-round-320/*.py`, `*.txt`, `*.json` | The scripts and data behind every number. <ul><li>Hand file: `fails-cause-hand.txt`.</li><li>`l57-fields.txt`, `stops-count.txt`, `task-titles.txt`, `b-running-median.txt` and `unfailable-assert-fields.txt` came from one-line shell or python commands. Each command is in `b-round-320.md` §3.</li><li>`retro321-mentions.py` (with its two `.txt` outputs) is the "RETRO 320/321" inventory.</li><li>`update-backlog.py` holds this planning's backlog edits.</li></ul> |
| `backlog.json` (version 280) | Decisions D-29z880…D-29z889 [K10]. <ul><li>`retro_runs` 321 and `retro_policy`.</li><li>`screen_review_candidates` SR-321-*.</li><li>`systemic_tasks` SYS-R2-FAKE-FIDELITY.</li><li>`architecture_checkpoint_requests` ARCH-CHECKPOINT-PERF8-STORE-PATTERN.</li><li>The C-320 and gate-320 ids and the retro-candidate dispositions.</li></ul> Before-copy: `b-round-320/backlog-before-321.json` |
| `feature-status.md` | Rows 320 and 321, the next line, the STUDIO-PERFORMANCE row, RETRO 305 and RETRO 321 |

**Order of work (the C-R215-01 lesson):**
- The analysis scripts read the **before** copy.
- Run them from the loop root as `python3 -I b-round-320/<script>.py`: first `collect.py`, then `cost.py`, then the others.
- `cost.py` prints to stdout; B saved that output as `cost.txt`.
- `update-backlog.py` is **not** re-runnable: it refuses to run twice. Do not run it.
- **One post-script correction:** after `update-backlog.py`, B corrected one number by hand in `RC-R275-STOP-ROUTES-TO-B.status` ($77.52 → $78.18; `b-round-320.md` §3). C checks the corrected value.

## 2. A: nothing to implement
1. From `store/`, confirm three things:
   - HEAD = `53c5c79…`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen sha check prints nothing.
2. Write `a-round-321.md` with the three results and "no change, by RETRO policy". Do not run typecheck, lint, vitest or the code-reviewer.
3. Do not edit `retros/`, `lessons.md`, `user-review/` or any B file. If you disagree with a lesson in the A part, or with L58 (it changes what B hands you), write it under "Lesson feedback".

## 3. C: what to verify
C writes `c-round-321.md` and `c-round-321.json` as it goes, with **all** L57 fields (see Rules).

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: HEAD `53c5c79`, a clean status, and the frozen list with rc 0 | Nothing in `store/` changed. Any change fails the round, whoever made it |
| **CLAIMS** | Run `bash b-round-320/claims-321.sh` from the loop root, **first** (L56). Compare its output with `b-round-320/claims-321-output.txt` | Every line is equal. K8 prints `done` with no `MISSING` |
| **RT-NUM** | Recompute **every number** in `retro-321.md` §1, §2, §3, §9 and §12 from its named file or script. C may copy the scripts to `c-round-321/`; run them from the loop root. At least: <ul><li>**Totals:** $192.26 / $110.06 / $92.42 / $394.74; the round median $24.46; the phase medians B $12.12, A $6.84, C $5.42; the FAIL-round cost $150.14; the B share 49%.</li><li>**Groups:** $19.79 / $202.23 / $64.63 / $108.09; the fix-ups 18.59 / 24.97 / 13.59 / 26.80 / 24.14; the STOP-round sum $78.18.</li><li>**Counts:** C PASS/FAIL 10/6; gate 10/6/0; C `bugs[]` Medium 8, Low 10; 10 review.md files with 51 findings; the `classify.txt` origin sums C 41, gate 29, A 27, B 7 and 75 + 29 = 104; 574 / 34; 82 awaiting_user ids; 3 STOPs; first feature stages 3 of 7.</li><li>**§9:** the running B median above $11.70 from round 305 (`b-running-median.txt`); the manifest fields absent in 313/315/318/320 [K11]; L23 5,058 bytes and line 3 808 bytes, both by `sed -n Np lessons.md | wc -c` [K15].</li></ul> | Each number matches its source, or the difference is ≤ $0.01 rounding |
| **RT-CAUSE** | For each row of §3 and each fact in §9, open the quoted source: <ul><li>`c-round-305.json`, `c-round-312.json`, `c-round-313.json`, `c-round-316.json`, `c-round-318.json`, `c-round-319.json`, `c-round-320.json` (`bugs[].origin`);</li><li>`a-round-313.md`, `a-round-318.md`, `a-round-319.md` (the STOP lines);</li><li>`tasks/round-318.md` l.102 (the grant behind GATE320-C1);</li><li>`tasks/round-313.md`, `-314`, `-315`, `-318`, `-320` (the L57 field lists), `tasks/round-319.md` l.233;</li><li>`gates/round-320/review.md` (findings 1–6).</li></ul> | Each stated cause is what the source says; no cause is invented. The EXP-R305 verdict follows from its written rule in `retros/retro-305.md` §10. Consultant opinions are labelled as opinions |
| **RT-IDS** | <ul><li>**Round 320 closure:** PERF-8a status starts with `done (D-29z880)`. C-R318-01/02/03/04 and C-R319-01/02/03 start with `closed (D-29z880)`. C-R320-01 is `open, scheduled` with PERF-10, and PERF-10 has `required_rows_d29z880`.</li><li>**Gate-320 ids:** GATE320-C1-HOOK-SHAPE closed; GATE320-L1-DOC230-GRANT-LINE open (rides PERF-8b); GATE320-S2-POST-AWAIT-ORDER `open_low_provisional`; GATE320-S3 scheduled; GATE320-S4 in `deferred_low_polish`; GATE320-S6 requested.</li><li>**Systemic task:** SYS-R2-FAKE-FIDELITY exists in `systemic_tasks` and in the STUDIO-PERFORMANCE stages, and its four closed ids carry "scheduled in SYS-R2-FAKE-FIDELITY".</li><li>**Inventory (D-29z889):** every id in `b-round-320/retro321-mention-ids.txt` has a disposition in `retro-321.md` §8. Also grep the **before** copy for `retro[ -_]?32[01]` case-insensitive, `RETRO \(32[01]\)` and `round 32[01]` to catch other spellings. An entry with no disposition is a finding.</li><li>**Candidates:** RC-R305-CAPTURE-TEXT-SLICE adopted; RC-R305-LESSON-CHAR-CAP partly adopted; RC-R308-SPLICE-PROBE retired; RC-R275-STOP-ROUTES-TO-B carries $78.18.</li></ul> | All present as stated |
| **RT-LESSONS** | `lessons.md`: <ul><li>≤ 60 lines, with the three parts;</li><li>`diff b-round-320/lessons-before-321.md lessons.md` touches only l.3, L3 (now with alias L16), L16 (removed from the C part), L54, L57 and the new L58;</li><li>L3, L54 and L57 start with their old text byte for byte (prefix compare) and only append;</li><li>L3 keeps every evidence id of the old L16 (C-R142-01, C-R145-01, C-R146-01);</li><li>the old line 3 is byte-equal to l.3 of `b-round-320/lessons-before-321.md`, which the new line 3 names;</li><li>no other line changed; the id list equals K13</li></ul> | As stated. A lost clause or evidence id is a finding |
| **RT-SABA** | `retro-321.md` §12 and `screen-review-321.md`: every rule change and screen candidate is phrased as a **proposal or question** | SR-321-2, -3 and -5 are questions. SR-321-5's monitor/lane variant says it is a position move that needs Saba. RC-R275 is a proposal |
| **RT-SCREEN (browser)** | Every SR-321 candidate names a screenshot that exists and shows what it describes; C opens the PNGs. C then re-runs `b-round-320/screens/capture.mjs` (or an equivalent) **with the mock backend** at both viewports, writing to `c-round-321/screens/`. First check `http://127.0.0.1:5199/__mock/health`: if it answers, use the running instance and do not stop it; otherwise start your own (`node mock-api/server.mjs`, log under `c-round-321/`) and stop it afterwards. Check: <ul><li>`laneErrors` is none;</li><li>the journey reaches `/studio-lab?preview=middle-east` with the preview selected [K12];</li><li>the position after Play is ≥ 00:01.000;</li><li>the persistent-line counts (`outsideTimelineLib` in the log) are within ±2 of 97 / 124 / 86 / 101;</li><li>SR-321-1's file name: export one WAV in the browser and read the download's `suggestedFilename` (it rests on PD's code reading, so it gets a real check here).</li></ul> Per L54's new clause, any claim about cut or overflowing text is checked on the screenshot or with `scrollWidth` vs `clientWidth` | Each candidate is as described. A mismatch is a finding against the review, not against the app |
| **G321-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720 (warm up in a browser first, L38; wait for a non-empty body): <ul><li>`/studio-lab` shows the workspace and the demo badge; `localStorage.auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;</li><li>`/api/studio-token` returns 401 with no header. A fake bearer gives 403 with the mock running, or a 500 that fails closed without it.</li></ul> | As stated. No token in any body |
| **STUDIO-SMOKE-321 (browser)** | On `/studio-lab` at both viewports, after `Demo collection ready` (L48): <ul><li>add `Bass` (Enter);</li><li>Play, then after 1.5 s `[data-testid=arrangement-position]` reads ≥ `00:01.000`;</li><li>Play's `data-playing` goes `false` → `true` → `false` [K5];</li><li>body-drag a time selection across the clip and release: the range readout shows a non-empty label (PERF-8a's store path);</li><li>export a WAV: RIFF/WAVE, 48 kHz, length 16.000 s, non-silent (peak > 0)</li></ul> | As stated. A hash compare is not required |

- **Gate rows:** the full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"`, never under `"passed"`.
- **`browserVerified`:** true only if G321-AUTH, STUDIO-SMOKE-321 and the RT-SCREEN re-run all ran at both viewports. The other RT rows are document checks.
- **Consults (optional):** `consequence-tester` may review L58 and EXP-R321-PRECHECK-GATES for checkability. Record any disagreement as a finding against the retro.

## 4. Outcome, fixed in advance (D-29z888)
| C result | B at the round-322 planning |
|---|---|
| All rows PASS, planning on or after 2026-11-05 | Round 322 is **REGRESSION** (one short check per done or `c_pass` item, both viewports, smoke), with the C-R318-06 repro and root-cause row carried (L6). `regression-last.json` is updated when it closes |
| All rows PASS, planning before 2026-11-05 | Round 322 is **PERF-8b** (selection store). <ul><li>B consults `performance-optimizer` and `tech-lead` and re-measures HEAD first (L37).</li><li>Every asserted row follows L58: C's command run on B's sketch, output saved.</li><li>It carries the GATE320-S2 browser experiment row and the GATE320-L1 doc 230 line.</li><li>It reads ARCH-CHECKPOINT-PERF8-STORE-PATTERN if root has answered; otherwise it follows D-29z193 (zustand).</li></ul> |
| An RT row fails (an untraceable number, an invented cause, a missing disposition, a lost clause, a candidate not as described) | B corrects the files at the round-322 planning. The next C round re-checks only the changed lines (RT-FIX, as rounds 216, 231, 246, 261, 276, 291 and 306), together with the round-322 task |
| G321-AUTH, STUDIO-SMOKE-321 or RT-SCREEN finds a Medium or worse in the app | It is fixed first (2026-10-23 bug gate). A Low goes to `deferred_low_polish` |
| SOURCE-SCOPE fails | Stop. Root inspects. Nothing is published |

**After that:** PERF-DRAG-PREVIEW / PERF-9 / PERF-10 (with the C-R320-01 row) … PERF-15 → SYS-R2-FAKE-FIDELITY → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

## 5. Neighbour risk
App code carries none: no source file changes. The risk is in the process:
- **L58** makes B run C's exact command on the sketch before any asserted row, which costs B time. EXP-R321's stop is a B median above $13.94; the countermetric is A's cost per round.
- **L57's new clause** asks C for three more fields from round 322, and forbids subset lists in tasks.
- **The L16 → L3 merge** must keep L16's evidence ids. **Line 3** is now a pointer, so its history must stay byte-equal in the before-copy. RT-LESSONS checks both.
- **The screen review goes to Saba.** RT-SCREEN re-runs the capture, and checks SR-321-1 in a real download.

## 6. Deliverables
- **A:** `a-round-321.md`.
- **C:** `c-round-321.md` and `c-round-321.json`, with evidence under `c-round-321/`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`;
  - `passed`, `failed`, `blocked`, `gate`, `rows`;
  - all L57 fields.

## 7. Root notes
- **Nothing to publish from `store/`.** A change there is itself a FAIL. The loop-state commit records the retro.
- **For Saba:**
  - `user-review/screen-review-321.md`: 6 candidates; the weakest step is still SR-305-3;
  - `retro-321.md` §12: RC-R275-STOP-ROUTES-TO-B, raised for the fourth time (3 STOPped rounds reached C, all FAIL, $78.18);
  - 82 awaiting-user ids.
- **For root:**
  - **ARCH-CHECKPOINT-PERF8-STORE-PATTERN** (new, non-blocking): a bounded `frontend-architect` checkpoint at the PERF-8 boundary, per `store/.claude/references/architecture-checkpoint.md`. Questions are in `b-round-320.md` §5. Best answered before the PERF-8b planning.
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) is still open.

## 8. Claims (L29 + L56 form)
Run `bash b-round-320/claims-321.sh` from the loop root. The expected output is `b-round-320/claims-321-output.txt`.

| Tag | Claim | Expected (from the output file) |
|---|---|---|
| K1 | gate 320 published `53c5c79` | `published 53c5c79` |
| K2 | clean tree and HEAD at planning | `0 53c5c79` |
| K3 | 1,226 frozen entries | `1226` |
| K4 | each protected file appears once | eleven `1` |
| K5 | Play's playing signal and name in `store/` | `274: data-playing=…` and `233: playLabel: 'Play',` |
| K6 | screen-capture element counts; no lane errors | `{'1440x900-S0': 138, '1440x900-DEMO': 168, '1280x720-S0': 118, '1280x720-DEMO': 144} None` |
| K7 | lessons line count | `59` |
| K8 | every cited artifact exists (L56) | `done` |
| K9 | the screenshots exist | `12` |
| K10 | backlog version and last decision | `280 D-29z889` |
| K11 | C JSONs in 305–320 without `manifestPaths` | `313 315 318 320` |
| K12 | journey facts | `/studio-lab?preview=middle-east`, `00:01.483` / `00:01.471`, 4 clips, at both viewports |
| K13 | lesson ids after the merge (no 16, new 58) | the id list in the output file |
| K14 | regression-last date | `2026-11-02` |
| K15 | L23 and line 3 length in bytes (`wc -c`, locale-free) | `5058 808` |
| K16 | the round-320 archive equals the old task | `archive-equal` |
| K17 | B median and window total | `12.12 394.74` |
