# Round 305: RETRO 305 (eighth retrospective, rounds 290–304) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 304 → 305 planning, 2026-11-02.

**Decisions** (all in `backlog.json` → `decisions_log_b`):
- D-29z799: round 304 accepted; PERF-3c is done; C-R304-01 ruled and closed; C-R304-02 goes to PERF-3d.
- D-29z800: gate-304 triage. GATE304-M1 → root; GATE304-M2/L3 → PERF-3d.
- D-29z801: RETRO 305 outputs.
- D-29z802: screen and journey review.
- D-29z803: lessons.
- D-29z804: experiments and candidates.
- D-29z805: what comes next.
- D-29z806: inventory of every entry that names "RETRO 305".

**Rules:**
- **Policy:**
  - "Retrospective: stop, look back, improve" (Saba, 2026-10-26);
  - "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28);
  - the product-designer rule (2026-10-30);
  - the RETRO journey step (2026-10-31);
  - `backlog.json` → `retro_policy`.
- **Window:** retro 290 covered 275–289, so this one covers 290–304. Precedent: rounds 275 and 290.
- **Read first:** `lessons.md`. This planning revised it, and the revision applies from round 305:
  - L43 is merged into L44;
  - **L57** is new: C writes the harness fields every round;
  - L11, L23, L38 and L56 gain one clause each.

  This task uses L56 itself: every `b-round-304/` file it cites is checked by a `test -f` claim (K8).
- **L29 note:** untagged grep hits in this task are expected values, row ids, loop-artifact paths or descriptions of what C runs. They are not facts about current code; every fact about a `store/` file carries a `[K#]` tag.
- **Loop path:** `tmp/studio-real-loop` is a symlink to `/home/runner/work/czaba-studio-loop/czaba-studio-loop/loop`. Search it with `find -L` (L38). `lessons.md` is there.

## Baseline: HEAD `adf959d`, clean tree
- **Gate:** gate 304 published `adf959d…` on both remotes [K1]. That commit is the round-305 baseline.
- **Tree:** `git status --short --untracked-files=all` was empty at planning, and HEAD was `adf959d` [K2].
- **Frozen:** every tracked file, **1,176** entries, is listed in `b-round-304-r305-tree-sha256.txt` [K3].
  - Check from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-304-r305-tree-sha256.txt`.
  - B ran it after the last consult: rc 0.
  - Each of the 7 protected auth and purchase files appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **Round 304 passed.**
  - C: 8 rows, `browserVerified` and `realVerified` both true, 2 Lows.
  - Gate 304 published `adf959d`.
  - **PERF-3c is done.** The EXIT decision: the PERF-3 target is **not met**. `out` keydown-max median is 80 ms (≥ 50), so PERF-3 stays `in_progress` and PERF-3d fixes it.
- **Round-304 findings (D-29z799):**
  - **C-R304-01 ruling:** the LoAF overlap rule is accepted as the contract. Closed. Its process half becomes the new L11 clause.
  - **C-R304-02** (`interactionSequence` text) is fixed early in PERF-3d. Same file, cheap.
  - **INFO-C304-LESSONS-MISSING** was a false alarm: the loop folder is a symlink.
  - **INFO-C304-REVIEW-POSTFIX** is closed: the gate review covered the whole diff, including `runZoomProbeSteps`.
- **Gate-304 triage (D-29z800):**
  - **GATE304-M1 (Medium):** the gate never runs the `perf/lib` tests. It is `open_root`, the same item as ROOT-REQ-VITEST-PERF-INCLUDE: the fix is in `vitest.config.ts`, outside loop grants [K18]. It does not block the loop. Until root lands it, PERF tasks cite the scratch-config run.
  - **GATE304-M2 (Medium):** the two `== 60` budget rows. **GATE304-L3:** the probe-connected note. Both are fixed in **PERF-3d, round 306**.
  - **L5 cosmetics** go to `deferred_low_polish`.
- **The Mediums wait one round.** RETRO changes no code, so "Medium before new scope" still holds: the first code round after this one, PERF-3d, fixes M2.
- **RETRO is due:** `retro_policy.next_due` was "round 305".
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-02 (round 301), so the next one is due on or after 2026-11-05.
- **No open Critical or High.** The parked Mediums are unchanged:
  - A-R73-SAFARI-FLAG-FOCUS, GATE128-S1, R80-RECORDINGS-FIELD-BORDERS;
  - GATE232-S2, GATE271-S1, GATE274-S1.

  None is a security or data-loss bug.
- **Reference first / Ableton:** not applicable (RETRO round). **Screen budget:** nothing visible changes.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-305.md` | The analysis, in Georgian with English terms, for Saba. Window 290–304 |
| `lessons.md` | **59 lines** (≤ 60) [K7], three parts. Before-copy: `b-round-304/lessons-before-305.md`. Diff: `b-round-304/lessons-diff.txt` |
| `user-review/screen-review-305.md` | Candidates **SR-305-1…10**. Captures in `b-round-304/screens/`: `capture.mjs`, `capture.log`, `screen305.json`, `counts.txt` and the 12 PNGs [K9] |
| `b-round-304/*.py`, `*.txt`, `*.json` | The scripts and data behind every number. <ul><li>Hand files: `fails-cause-hand.txt`, `claims-findings-hand.txt`, `stops.txt`.</li><li>`claims-count.txt` comes from a shell loop; its command is in `b-round-304.md` §3.</li><li>`manifest-fields.py`, `awaiting-user.py` and `retro305-mentions.py` (with the `.txt` outputs) hold the field table, the awaiting-user list and the "RETRO 305" inventory.</li><li>`update-backlog.py` holds this planning's backlog edits.</li></ul> |
| `backlog.json` (version 264) | Decisions D-29z799…D-29z806 [K10]. <ul><li>`retro_runs` 305 and `retro_policy`.</li><li>HR-C-MANIFEST-FIELDS moved into L57.</li><li>`screen_review_candidates` SR-305-*.</li><li>The gate-304 and C-304 ids, and the retro-candidate dispositions.</li></ul> Before-copy: `b-round-304/backlog-before-305.json` |
| `feature-status.md` | Rows 304 and 305, the next line, and the STUDIO-PERFORMANCE row |

**Order of work (the C-R215-01 lesson):**
- The analysis scripts read the **before** copy.
- Run them from the loop root as `python3 -I b-round-304/<script>.py`: first `collect.py`, then `cost.py`, then the others.
- `cost.py` prints to stdout; B saved that output as `cost.txt`.
- `update-backlog.py` is **not** re-runnable: it refuses to run twice. Do not run it.

## 2. A: nothing to implement
1. From `store/`, confirm three things:
   - HEAD = `adf959d…`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen sha check prints nothing.
2. Write `a-round-305.md` with the three results and "no change, by RETRO policy". Do not run typecheck, lint, vitest or the code-reviewer.
3. Do not edit `retros/`, `lessons.md`, `user-review/` or any B file. If you disagree with a lesson in the A part (L11's new clause in particular), write it under "Lesson feedback".

## 3. C: what to verify
C writes `c-round-305.md` and `c-round-305.json` as it goes.

**The JSON carries the L57 fields:**
- `manifestPaths`, `missingPaths`, `countMismatches`, `claimCheckMinutes`;
- an `origin` per finding;
- `assertsSpecified`, `mutantsRecorded`, `mutantRedOnSketch`. These three are `null`, with the reason "RETRO: no assert specified".

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: HEAD `adf959d`, a clean status, and the frozen list with rc 0 | Nothing in `store/` changed. Any change fails the round, whoever made it |
| **CLAIMS** | Run `bash b-round-304/claims-305.sh` from the loop root, **first** (L56). Compare its output with `b-round-304/claims-305-output.txt` | Every line is equal. K8 prints `done` with no `MISSING` |
| **RT-NUM** | Recompute **every number** in `retro-305.md` §1, §2, §9 and §10 from its named file or script. C may copy the scripts to `c-round-305/`; run them from the loop root. At least: <ul><li>**Totals:** $146.29 / $71.43 / $86.42 / $304.14; the round median $18.39; the phase medians B $9.75, A $3.70, C $3.86; the FAIL-round cost $52.14; the B share 48%.</li><li>**Groups:** $19.95 / $35.36 / $115.23 / $44.31 / $15.96 / $73.33; the fix-ups 12.98 / 14.60 / 11.43 / 18.39 / 15.93; the 297–299 chain $45.75.</li><li>**Counts:** gate 11 / 3 / 1; C `bugs[]` Medium 2, Low 11; 11 review.md files with 51 findings; the `classify.txt` origin and category counts; 544 / 28 / 516; 70 awaiting_user ids.</li><li>**Origins in §4:** C 29, gate 25, A 23, B 9 (the `open_findings` + `deferred_low_polish` window sums).</li><li>**Other:** 3 STOPs; `[K#]` range 4–29; manifest fields in 290–299 only [K11, K15].</li></ul> | Each number matches its source, or the difference is ≤ $0.01 rounding |
| **RT-CAUSE** | For each row of §3 and each item of §9, open the quoted source: <ul><li>`c-round-290.json`;</li><li>`c-round-292.json` (`bugs[0].origin`);</li><li>`gates/round-293/verify.log` [K14];</li><li>`b-round-296.md` … `b-round-298.md`, `gates/round-297/review.md` (Critical 1);</li><li>`c-round-298.json`;</li><li>`c-round-295.json`, `a-round-295.md`, `a-round-303.md`;</li><li>`a-round-304.md` l.19–23 and l.107.</li></ul> | Each stated cause is what the source says; no cause is invented. The EXP-R290 verdict follows from its written rule in `retros/retro-290.md` §10 |
| **RT-IDS** | <ul><li>**Round 304 closure:** PERF-3c is `done (D-29z799)`. PERF-3 is `in_progress`. C-R304-01 is `closed by ruling`. C-R304-02 is `open`, named in PERF-3d.</li><li>**Gate-304 ids:** GATE304-M1 is Medium `open_root`. GATE304-M2 is Medium `open`, named in PERF-3d's status. GATE304-L3 is `open`. GATE304-L5-COSMETIC is in `deferred_low_polish`. GATE304-ARCH-ZOOM-LIVE-RULE is in `architecture_signals`.</li><li>**Inventory (D-29z806):** every id in `b-round-304/retro305-mention-ids.txt` has a disposition in `retro-305.md` §8, §10 or §12. Also grep the **before** copy for `retro[ -_]?305` case-insensitive, `RETRO (305)` and `round 305` to catch other spellings. Any entry with no disposition is a finding.</li><li>**Candidates:** RC-R290-PRECHECK-FULL-SUITE is adopted; RC-R295 is merged; RC-R284, RC-R290-AX-TREE-ROW and RC-R290-L50 are retired; RC-R305-LESSON-CHAR-CAP is added.</li></ul> | All present as stated |
| **RT-LESSONS** | `lessons.md`: <ul><li>≤ 60 lines, with the three parts;</li><li>`diff b-round-304/lessons-before-305.md lessons.md` touches only l.3, L11, L23, L38, L43 (removed), L44, L56 and the new L57;</li><li>L11, L23, L38, L44 and L56 start with their old text byte for byte (prefix compare) and only append;</li><li>L44 keeps every evidence id of the old L43;</li><li>no other line changed</li></ul> | As stated. A lost clause or evidence id is a finding |
| **RT-SABA** | `retro-305.md` §12 and `screen-review-305.md`: every rule change and screen candidate is phrased as a **proposal or question** | SR-305-2, -3, -7 and -9 are questions. SR-305-6's collapse variant says it is a position move that needs Saba. The CLAUDE.md tagline is a proposal only |
| **RT-SCREEN (browser)** | Every SR-305 candidate names a screenshot that exists and shows what it describes; C opens the PNGs. C then re-runs `b-round-304/screens/capture.mjs` (or an equivalent) **with the mock backend** at both viewports, writing to `c-round-305/screens/`. First check `http://127.0.0.1:5199/__mock/health`: if it answers, use the running instance and do not stop it; otherwise start your own (`node mock-api/server.mjs`, log under `c-round-305/`) and stop it afterwards. Check: <ul><li>`laneErrors` is none;</li><li>the journey reaches `/studio-lab?preview=middle-east` with the preview selected;</li><li>the timeline is empty on arrival (SR-305-3);</li><li>the position after Play is ≥ 00:01.000;</li><li>the persistent-line counts are within ±2 of `counts.txt`.</li></ul> **SR-305-7** rests on the source [K13], not on the screenshots | Each candidate is as described. A mismatch is a finding against the review, not against the app |
| **G305-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720 (wait for a non-empty body; INFO-C304-AUTH-ATTEMPT1): <ul><li>`/studio-lab` shows the workspace and the demo badge; `localStorage.auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;</li><li>`/api/studio-token` returns 401 with no header. A fake bearer gives 403 with the mock running, or a 500 that fails closed without it.</li></ul> | As stated. No token in any body |
| **STUDIO-SMOKE-305 (browser)** | On `/studio-lab` at both viewports, after `Demo collection ready` (L48): <ul><li>add `Bass` (Enter);</li><li>Play, then after 1.5 s `[data-testid=arrangement-position]` reads ≥ `00:01.000`;</li><li>Play's `data-playing` goes `false` → `true` → `false` [K5];</li><li>export a WAV: RIFF/WAVE, 48 kHz, length 16.000 s, non-silent (peak > 0)</li></ul> | As stated. A hash compare is not required |

- **Gate rows:** the full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"`, never under `"passed"`.
- **`browserVerified`:** true only if G305-AUTH, STUDIO-SMOKE-305 and the RT-SCREEN re-run all ran at both viewports. The other RT rows are document checks.
- **Consults (optional):** `consequence-tester` may review L57 and EXP-R305-SKETCH-MUTANT for checkability. Record any disagreement as a finding against the retro.

## 4. Outcome, fixed in advance (D-29z805)
| C result | B at the round-306 planning |
|---|---|
| All rows PASS | Round 306 is **PERF-3d**, the band-crossing fix. <ul><li>B consults `performance-optimizer` and `tech-lead` and re-measures HEAD first (policy; L37). C's data: wheel step 4 has LoAF 0 and step 7 has 70–80, both with 30 rewrites.</li><li>The task grants both `== 60` budget rows with their post-fix values (GATE304-M2), adds the probe-connected note (GATE304-L3), and fixes `interactionSequence` (C-R304-02).</li><li>The `perf/lib` tests are cited with the scratch config until root lands ROOT-REQ-VITEST-PERF-INCLUDE.</li><li>The L23 full suite on the sketch applies if PERF-3d changes `app/**`.</li></ul> |
| An RT row fails (an untraceable number, an invented cause, a missing disposition, a lost clause, a candidate not as described) | B corrects the files at the round-306 planning. The next C round re-checks only the changed lines (RT-FIX, as rounds 216, 231, 246, 261, 276 and 291), together with PERF-3d |
| G305-AUTH, STUDIO-SMOKE-305 or RT-SCREEN finds a Medium or worse in the app | It is fixed first (2026-10-23 bug gate). A Low goes to `deferred_low_polish` |
| SOURCE-SCOPE fails | Stop. Root inspects. Nothing is published |

**After that:** REGRESSION (on or after 2026-11-05) → the rest of STUDIO-PERFORMANCE → STEM-LANES → SYS-1…3 → STORE-2b…5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

## 5. Neighbour risk
App code carries none: no source file changes. The risk is in the process:
- **L57** asks C for three new fields every round. EXP-R305-SKETCH-MUTANT stops if C leaves them blank in 2 rounds.
- **L23's full-suite clause** adds about 5 minutes to B's pre-check on `app/**` tasks. The EXP stop is a B median above $11.70.
- **L43 → L44 merge** must keep the old L43 evidence. RT-LESSONS checks this.
- **The screen review goes to Saba.** RT-SCREEN re-runs the capture, because SR-305-3 rests on it.

## 6. Deliverables
- **A:** `a-round-305.md`.
- **C:** `c-round-305.md` and `c-round-305.json`, with evidence under `c-round-305/`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`;
  - `passed`, `failed`, `blocked`, `gate`, `rows`;
  - the L57 fields.

## 7. Root notes
- **Nothing to publish from `store/`.** A change there is itself a FAIL. The loop-state commit records the retro.
- **For Saba:**
  - `user-review/screen-review-305.md`: 10 candidates; the weakest step is SR-305-3;
  - `retro-305.md` §12: RC-R275-STOP-ROUTES-TO-B, raised for the third time (3 STOPped rounds reached C);
  - the CLAUDE.md tagline proposal;
  - 70 awaiting-user ids.
- **For root:**
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1), before PERF-3d if possible.
  - No new frontend-architect checkpoint: PERF-3c was a test-only change on one owner, so GATE304-ARCH-ZOOM-LIVE-RULE stays a signal. ARCH-CHECKPOINT-STUDIO-LINK is still unanswered and non-blocking.

## 8. Claims (L29 + L56 form)
Run `bash b-round-304/claims-305.sh` from the loop root. The expected output is `b-round-304/claims-305-output.txt`.

| Tag | Claim | Expected (from the output file) |
|---|---|---|
| K1 | gate 304 published `adf959d` | `published adf959d` |
| K2 | clean tree and HEAD at planning | `0 adf959d` |
| K3 | 1,176 frozen entries | `1176` |
| K4 | each protected file appears once | `1 1 1 1 1 1 1` |
| K5 | Play's playing signal and name in `store/` | `272: data-playing=…` and `233: playLabel: 'Play',` |
| K6 | screen-capture element counts; no lane errors | `{'1440x900-S0': 138, '1440x900-DEMO': 168, '1280x720-S0': 118, '1280x720-DEMO': 144} None` |
| K7 | lessons line count | `59` |
| K8 | every cited artifact exists (L56) | `done` |
| K9 | the screenshots exist | `12` |
| K10 | backlog version and last decision | `264 D-29z806` |
| K11 | manifest fields only in 290–299 | `c-round-290.json` … `c-round-299.json` (10 files) |
| K12 | journey facts | `/studio-lab?preview=middle-east`, `00:01.483` / `00:01.471`, 4 clips, at both viewports |
| K13 | demo data: `bpm` only at l.79 and l.89 of `app/data/studio-lab-demo.ts`; none in the Middle East block | `79 89 \| middle-east block bpm: 0 \| id l.45: id: 'demo-middle-east',` |
| K14 | gate 293's failing file | `1 3069` |
| K15 | tasks 300–304 do not name the manifest rule | `0 0 0 0 0` |
| K16 | no post-frame recurrence in the window | `0` |
| K17 | lesson ids after the merge (no 43, new 57) | the id list in the output file |
| K18 | vitest include is `app/**` only | `include: ['app/**/*.test.{ts,tsx}'],` |
| K19 | the round-304 archive equals the old task | `archive-equal` |
