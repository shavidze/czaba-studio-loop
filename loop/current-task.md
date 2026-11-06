# Round 369: RETRO 369 (twelfth retrospective, rounds 353–368) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 368 → 369 planning, 2026-11-06.

**Decisions** (`backlog.json` v331 → v334, `decisions_log_b`):
- D-29z1210: round 368 accepted (C PASS, gate 368 published `29f4b4d`). **PERF-9b-ii is done.** Closed: C-R367-DEDUP-CANCELLED-WRITE (Medium) and the round-367 Lows it covered.
- D-29z1211: round-368 findings routed. **A-R368-REVIEW-L1 is ruled Low** (a deploy race that heals itself; unlike the C-R367 Medium, normal use cannot reach it). It goes to `deferred_low_polish` with A-R368-REVIEW-L3, GATE368-L1 and GATE368-L3. The architecture note becomes the signal GATE368-ARCH-STEM-CACHE-ADAPTER-SPLIT. ARCH-CHECKPOINT-PERF9-STEM-CACHE is now due to root (non-blocking).
- D-29z1212: RETRO 369 outputs.
- D-29z1213: lessons and the candidate dispositions.
- D-29z1214: screen review.
- D-29z1215: the systemic task SYS-R369-STEM-CACHE-WRITE-COORDINATOR (conditional) and ROOT-REQ-B-RETRO-CONSULTS.
- D-29z1216: this task and what comes next.
- D-29z1217: the RT-IDS inventory (`b-round-368/retro369-mentions.py`); B-R363-PRECHECK-PERFLIB adopted into L30; the L58 byte history.

**Rules:**
- **Policy:** "Retrospective: stop, look back, improve" (Saba, 2026-10-26); "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28); the RETRO journey step (2026-10-31); `backlog.json` → `retro_policy`.
- **Window:** 353–368 (16 rounds). RETRO slipped one round from 368 (D-29z1209), so that the round-367 Medium could close first.
- **Read first:** `lessons.md`. This planning revised it, and the revision applies from round 369:
  - L58 gains the clause "Reviewed = dispatched; ordering contracts get a matrix";
  - L30 gains "Every test root is pre-run";
  - line 3 points to retro-369.
- **L57:** C's JSON carries **all** L57 fields. In this RETRO round, every field except `gateChecksNamed` and the four manifest fields is `null` with the reason "RETRO: no assert specified". `gateChecksNamed` lists the gate rows below. Before hand-off, C runs `python3 -I tools/l57-check.py c-round-369.json c-round-369/l57-check.txt` and fixes its own JSON until it exits 0.
- **L29 note:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. Every fact about a `store/` file carries a `[K#]` tag (§8).
- **L59, L60:** run every row until it has a result. Write `c-round-369/progress.json` after each row. Destructive commands stay inside `c-round-369/`.

**Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step, the YouTube request and the screen budget. Nothing visible changes.

## Baseline: HEAD `29f4b4d`, clean tree
- **Gate:** gate 368 published `29f4b4d…` on both remotes [K1]. That commit is the round-369 baseline.
- **Tree:** `git status --short --untracked-files=all` was empty at planning, with HEAD at `29f4b4d` [K2] [K22].
- **Frozen:** every tracked file, **1,258** entries, is listed in `b-round-368/r369-tree-sha256.txt` [K3].
  - Check from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-368/r369-tree-sha256.txt`.
  - B ran it at planning: rc 0.
  - Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **Round 368 passed** (`c-round-368.json`: 11 rows, `browserVerified` and `realVerified` true). Gate 368 published `29f4b4d`.
- **RETRO is overdue by one round.** `retro_policy.next_due` was round 368.
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-05 [K14], so the next one is due on or after 2026-11-08.
- **No open Critical or High.** The open Mediums are root-only, manual or awaiting_user: A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE and GATE304-M1. The 2026-10-23 clarification says they do not block. None of them is a security or data-loss bug.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-369.md` | The analysis, in Georgian with English terms, for Saba. Window 353–368, 13 sections |
| `lessons.md` | **60 lines** [K7], in three parts. Before-copy: `b-round-368/lessons-before-369.md`. Diff: `b-round-368/lessons-diff.txt`. Three lines change: l.3, L30 (l.19) and L58 (l.41) [K20] |
| `user-review/screen-review-369.md` | No new candidates (no SR-369 id; K19 prints an empty list on both sides). SR-353-4 is marked as a duplicate of SR-290-1/2. Captures are in `b-round-368/screens/`: `capture.mjs`, `warmup.mjs`, `capture.log`, `screen369.json`, `compare-353-369.txt` and the 12 PNGs [K9] |
| `b-round-368/*.py`, `*.sh`, `data/*` | The scripts and data behind every number. `data/retro-numbers-369.txt` indexes the numbers; `b-round-368/retro-numbers.py` recomputes it |
| `backlog.json` (version 334) [K10] | <ul><li>D-29z1210…D-29z1216.</li><li>`retro_runs` 369 and `retro_policy` (`next_due` round 384).</li><li>`retro_candidates` dispositions.</li><li>`systemic_tasks` SYS-R369-STEM-CACHE-WRITE-COORDINATOR and SYS-R353-DP-TEST-POLISH done.</li><li>SR-353-4 `duplicate_of`.</li><li>ROOT-REQ-B-RETRO-CONSULTS.</li></ul> Before-copy: `b-round-368/backlog-before-369.json`. Edits: `update-backlog-part1.py` (v332), `update-backlog-part2.py` (v333) and `update-backlog-part3.py` (v334, inventory) |
| `feature-status.md` | Round 368 is now done, the next line is updated, and a RETRO 369 row is added (`update-feature-status.py`) |
| `b-round-368/root-request-arch-checkpoint.md` | The ARCH-CHECKPOINT-PERF9-STEM-CACHE request for root (non-blocking) |
| `b-round-367/sketch-review.md` | Appended annotation: its ordering-table claim is falsified by A-R368-REVIEW-L1 |

**Order of work (C-R215-01, RC-R336-SCRIPT-OUTPUT-DIR):**
- The analysis scripts read the **before** copy, `b-round-368/backlog-before-369.json`. They write to `b-round-368/data/` by default.
- **First copy the scripts to `c-round-369/scripts/`.** Rewrite every `b-round-368/data/` output path in the copies to `c-round-369/data/`, run them there, and `cmp` or diff your outputs against B's.
- Run order: `collect.py`, then `cost.py` (stdout = `cost.txt`), then `retro-numbers.py`, then the others. `misc-outputs.sh` takes an output folder argument: give it `c-round-369/data`.
- `update-backlog-part*.py`, `update-feature-status.py` and `edit-lessons.py` are **not** re-runnable: the `.done` markers make them refuse. Do not run them.

## 2. A: nothing to implement
1. From `store/`, confirm three things:
   - HEAD is `29f4b4d…`;
   - `git status --short --untracked-files=all` is empty;
   - the frozen sha check prints nothing.
2. Write `a-round-369.md` with the three results and "no change, by RETRO policy". Do not run typecheck, lint, vitest or the code-reviewer.
3. Do not edit `retros/`, `lessons.md`, `tools/`, `user-review/` or any B file. If you disagree with a lesson in the A part, or with the new L30/L58 clauses (they change B's pre-check, not A's work), write it under "Lesson feedback".

## 3. C: what to verify
C writes `c-round-369.md` and `c-round-369.json` as it goes, with **all** L57 fields.

| Row | Check | PASS means |
|---|---|---|
| **SOURCE-SCOPE** | At the start and the end: HEAD `29f4b4d`, a clean status, and the frozen list check with rc 0 | Nothing in `store/` changed. Any change fails the round, whoever made it |
| **CLAIMS** | Run `bash b-round-368/claims-369.sh` from the loop root, **first** (L56). Compare its output with `b-round-368/claims-369-output.txt` | Every line is equal. K8 prints `done` with no `MISSING` |
| **RT-NUM** | Recompute **every number** in `retro-369.md` §1, §2, §4 and §9 from its named file or script. At least: <ul><li>**Totals:** B $173.19, A $99.77, C $14.95, all $287.91; B share 60.2 %; the round median $16.73; the phase medians B $11.46, A $6.07, C $0.76 [K17].</li><li>**Groups:** FAIL rounds $54.00; the chains 357–359 $44.02, 363–364 $31.85, 367–368 $42.99 (total $118.86); STOP rounds $75.04; the top five rounds.</li><li>**Counts:** C PASS/FAIL/BLOCKED 13/3/0 and gate 12/4/0 [K23]; STOP rounds 357, 361, 363, 367 [K18]; classify: open 30 (C 7, gate 7, A 12, B 4; Medium 1, Low 22, info 7) and deferred 39 (A 28, gate 5, B 3, C 3), plus the §4 category counts; 678 deferred and 1049 open in the before copy; 95 awaiting_user; gate-review script count 13 (356: 4, 358: 3, 366: 6) and the round-368 hand count (3 Low + 2 info, `gates/round-368/review.md`).</li><li>**L57:** 16 of 16 JSONs have all 12 fields, and 21 of 21 bugs carry an `origin` (`data/l57-coverage.txt`) [K24].</li><li>**§10 bytes:** L58 2908 (after RETRO 353, `b-round-353/lessons-before-354.md`) → 2931 (D-29z1136) → 3430 and L30 407 → 750, measured with `grep -m1 '^N\. ' <file> \| wc -c` on the before and after files [K15].</li><li>**The retro-353 comparison column:** each value equals `retros/retro-353.md` §1/§2.</li></ul> | Each number matches its source, or the difference is ≤ $0.01 rounding |
| **RT-CAUSE** | For each row of §3 and each fact in §5, §7 and §8, open the quoted source: <ul><li>`c-round-357.json`, `c-round-358.json`, `c-round-363.json`, `c-round-367.json`, `c-round-368.json` (bugs, status, `browserVerified`);</li><li>the STOP lines in `a-round-357.md`, `a-round-361.md`, `a-round-363.md` and `a-round-367.md`, and the top section of `a-round-368.md`;</li><li>`b-round-366/sketch-review.md` l.3 and l.5 (the dispatched sha `66ce5455…` and the reviewed v1 `18a264e6`);</li><li>the annotation at the end of `b-round-367/sketch-review.md`;</li><li>`gates/round-368/review.md` (findings 1–3 and the Architecture note);</li><li>`data/c-models.txt` (model facts);</li><li>the consult attributions to `tech-lead` and `product-designer`. B reports them; C checks that every consultant opinion is labelled as an opinion</li></ul> | <ul><li>Each stated cause is what the source says; no cause is invented.</li><li>Inferences are labelled: the B-median reading in §2, the C-cost reading against the model, 361 as L31 working, and the §4 root-cause groups.</li><li>The A-R368-REVIEW-L1 severity ruling (§7) follows from the stated reachability difference.</li></ul> |
| **RT-IDS** | <ul><li>**Round 368 closure:** `rounds[368].status` starts with `c_pass_published 29f4b4d`. C-R367-DEDUP-CANCELLED-WRITE, C-R367-STATUS-LINE-PREMATURE, C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN, A-R367-REVIEW-L-ABF, A-R365-REVIEW-L3…L6 and C-R365-OBS-INTEGRITY have a status starting `closed (D-29z1210)`.</li><li>**New ids:** A-R368-REVIEW-L1, A-R368-REVIEW-L3, GATE368-L1-REMOVEFILE-SAME-NAME and GATE368-L3-QUEUED-BUFFER-RETENTION are in `deferred_low_polish` and `open_findings`. GATE368-ARCH-STEM-CACHE-ADAPTER-SPLIT is in `architecture_signals`. ARCH-CHECKPOINT-PERF9-STEM-CACHE has `signals_round_368`.</li><li>**Systemic task:** SYS-R369-STEM-CACHE-WRITE-COORDINATOR is in `systemic_tasks`. Its `closes` list has the 9 ids of retro §11, and each of those ids carries "scheduled in SYS-R369-STEM-CACHE-WRITE-COORDINATOR". SYS-R353-DP-TEST-POLISH starts with `done (D-29z1215)`.</li><li>**Candidates:** the 11 `retro_candidates` statuses start as retro §8 says. ROOT-REQ-B-RETRO-CONSULTS exists. SR-353-4 has `duplicate_of`.</li><li>**Inventory:** run a copy of `b-round-368/retro369-mentions.py` (output folder argument `c-round-369/data`) on the before copy and `cmp` with `b-round-368/data/retro369-mention-ids.txt` (36 hits, 33 ids). Also grep the before copy, case-insensitive, for other spellings of RETRO 368/369. Every RETRO input named has a disposition in retro §8 or a D-ID D-29z1210…D-29z1217 (B-R363-PRECHECK-PERFLIB: D-29z1217). An entry with no disposition is a finding.</li><li>`retro_runs[-1]` is 369; `retro_policy.next_due` names round 384.</li></ul> | All present as stated |
| **RT-LESSONS** | `lessons.md`: <ul><li>≤ 60 lines, with the three parts;</li><li>`diff b-round-368/lessons-before-369.md lessons.md` touches only l.3, l.19 (L30) and l.41 (L58) [K20];</li><li>L30 keeps its old text byte for byte and only appends one clause at the end;</li><li>L58 keeps every rule. Only two evidence parentheses are shortened, and **no evidence id may be lost**: compare the id sets of the before and after files. List every removed word;</li><li>line 3 changes only the sources span and adds the RETRO 369 note;</li><li>the id list equals K13</li></ul> | As stated. A lost clause or evidence id is a finding |
| **RT-L57** | Run `python3 -I tools/l57-check.py c-round-368.json c-round-369/l57-c368.txt`: it must exit 0, as in K11. Then a mutant check: a copy of `c-round-368.json` under `c-round-369/` with one field deleted makes it exit 1. Finally your own `c-round-369.json` exits 0 | The checker does what L57 says |
| **RT-SABA** | `retro-369.md` §12 and `screen-review-369.md`: every rule change and screen item is phrased as **information, a proposal or a question** | §12.1 is information plus one proposal. §12.3 is a proposal to root. §12.5 says there is no project-rule proposal |
| **RT-SCREEN (browser)** | Open the PNGs that `screen-review-369.md` and its SR-353 table cite, and check they show what is described. Then re-run `b-round-368/screens/capture.mjs` **with the mock backend** at both viewports, writing to `c-round-369/screens/`: <ul><li>first check `http://127.0.0.1:5199/__mock/health`. If it answers, use the running instance and do not stop it. Otherwise start your own (`node mock-api/server.mjs`, log under `c-round-369/`) and stop it afterwards by its PID.</li></ul> Check: <ul><li>`laneErrors` is none;</li><li>the journey reaches `/studio-lab?preview=middle-east` [K12];</li><li>the position after Play is ≥ 00:01.000;</li><li>the visible row counts equal 138 / 168 / 118 / 144 [K6], or differ only by dynamic text you name;</li><li>SR-353-1: the last-added clip's left edge is beyond the timeline's visible right edge at both viewports (`getBoundingClientRect`);</li><li>SR-353-5: "Original sound" is visible under the Video track at 1440 and not at 1280, as the review states;</li><li>per L54, any claim about cut or overflowing text is checked on the screenshot or by measurement</li></ul> | Each item is as described. A mismatch is a finding against the review, not against the app |
| **G369-AUTH (browser)** | A fresh anonymous context at 1440×900 and 1280×720. Warm up in a browser first (L38) and wait for a non-empty body: <ul><li>`/studio-lab` shows the workspace and the demo badge; `localStorage.auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`;</li><li>`/api/studio-token` returns 401 with no token. A fake bearer gives 403 with the mock running, or a 500 that fails closed without it (record that under `blocked`)</li></ul> | As stated. No token in any body |
| **STUDIO-SMOKE-369 (browser)** | On `/studio-lab` at both viewports, after `Demo collection ready` (L48) [K5]: <ul><li>add `Bass` (Enter);</li><li>Play, then after 1.5 s `[data-testid=arrangement-position]` reads ≥ `00:01.000`;</li><li>Play's `data-playing` goes `false` → `true` → `false` [K5];</li><li>drag the clip by its name bar one lane down, to the lane directly below the one it landed on (one lane up if it landed on the last audio lane; record the start and target `[data-track-id]`), and release: the clip's lane is the target, and the Undo title reads "Undo: Move clip";</li><li>Ctrl+Z restores the lane;</li><li>reload the page once: the demo stems come back ready (the stem cache path of PERF-9), and Play again reaches ≥ `00:01.000`;</li><li>export a WAV: RIFF/WAVE, 48 kHz, non-silent (peak > 0); record its length</li></ul> | As stated. A hash compare is not required |

- **Gate rows:** the full vitest, typecheck, build, Biome, `npm run verify` and the e2e smoke. List them under `"gate"` and in `gateChecksNamed`, never under `"passed"`.
- **`browserVerified`:** true only if G369-AUTH, STUDIO-SMOKE-369 and the RT-SCREEN re-run all ran at both viewports. The other RT rows are document checks.
- **Consults (optional):** `product-designer` in review mode on `screen-review-369.md` (at most 7 findings). Record any disagreement as a finding against the review.

## 4. Outcome, fixed in advance (D-29z1216)
| C result | B at the round-370 planning |
|---|---|
| All rows PASS, planning on or after 2026-11-08 | Round 370 is **REGRESSION** (mock API health is the first row; every done or c_pass item once at both viewports, plus `npm run test:e2e:smoke`) |
| All rows PASS, planning before 2026-11-08 | Round 370 is **SYS-R369-STEM-CACHE-WRITE-COORDINATOR** if root has answered ARCH-CHECKPOINT-PERF9-STEM-CACHE with extract or keep-and-fix. Otherwise it is **PERF-11**, with consults with `performance-optimizer` and `tech-lead`, a fresh measurement, and B's sketch pre-check under the new L30/L58 clauses |
| An RT row fails (an untraceable number, an invented cause, a missing disposition, a lost clause or id, an item not as described) | B corrects the files at the round-370 planning. The next C round re-checks only the changed lines (RT-FIX), together with the round-370 task |
| G369-AUTH, STUDIO-SMOKE-369 or RT-SCREEN finds a Medium or worse in the app | It is fixed first (2026-10-23 bug gate). A Low goes to `deferred_low_polish` |
| SOURCE-SCOPE fails | Stop. Root inspects. Nothing is published |

**After that:** REGRESSION (due ≥ 2026-11-08) → SYS-R369 (conditional) → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule). PERF-9c is awaiting_user; PERF-9d is with root.

## 5. Neighbour risk
No source file changes, so app code carries no risk. The risk is in the process:
- **The new L58 clause** adds a reviewed-sha line and, for ordering contracts, an n² matrix to B's planning. The countermetric is B's median: $11.46 in this window, with a stop line of $13.94. L58 is 3430 bytes; the RC-R305 trigger is 5500.
- **The new L30 clause** adds pre-runs of test roots outside `test:run` (perf/lib) to B's pre-check. It does not change A or C rows.
- **The screen review goes to Saba** with no new candidates and one merge proposal.

## 6. Deliverables
- **A:** `a-round-369.md`.
- **C:** `c-round-369.md` and `c-round-369.json`, with evidence under `c-round-369/` and `c-round-369/progress.json`. The JSON carries:
  - `taskStatus`, `browserVerified`, `realVerified`;
  - `passed`, `failed`, `blocked`, `gate`, `rows`;
  - all L57 fields, with `tools/l57-check.py` at rc 0.

## 7. Root notes
- **Nothing to publish from `store/`.** A change there is itself a FAIL. The loop-state commit records the retro.
- **For Saba:** `retros/retro-369.md` §12.1 (no screen change; the SR-353-4 merge proposal) and §12.2 (95 awaiting-user ids, none new).
- **For root:**
  - `b-round-368/root-request-arch-checkpoint.md`: ARCH-CHECKPOINT-PERF9-STEM-CACHE, now due. It is non-blocking, and its answer decides whether SYS-R369 runs;
  - ROOT-REQ-B-RETRO-CONSULTS: a proposal;
  - ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) is still open.

## 8. Claims (L29 + L56 form)
Run `bash b-round-368/claims-369.sh` from the loop root. The expected output is `b-round-368/claims-369-output.txt`, and stderr is empty (`claims-369-stderr.txt`).

| Tag | Claim |
|---|---|
| K1 | gate 368 published `29f4b4d` |
| K2 | clean tree and HEAD at planning |
| K3 | 1,258 frozen entries |
| K4 | each protected file appears once |
| K5 | Play's `data-playing` in `ArrangementTransport.tsx`, `playLabel: 'Play'` in `strings.ts`, and 1 `'Demo collection ready.` line in `collection.ts` |
| K6 | screen-capture row counts; no lane errors |
| K7 | lessons line count |
| K8 | every cited artifact exists (L56; list in `b-round-368/cited-artifacts.txt`) |
| K9 | the 12 screenshots exist |
| K10 | backlog version and last decision |
| K11 | the L57 checker on `c-round-368.json` |
| K12 | journey facts |
| K13 | lesson ids |
| K14 | regression-last date |
| K15 | L23 and L58 length in bytes |
| K16 | the round-368 archive equals the old task |
| K17 | B median and the window total |
| K18 | rounds with an A STOP line |
| K19 | SR-369 ids in the review and in the backlog (both empty) |
| K20 | the lessons diff hunks |
| K21 | implementation docs with the `C round N pending` form at HEAD |
| K22 | HEAD and status count when the claims run |
| K23 | C FAIL rounds and gate-skipped rounds |
| K24 | `l57-coverage.txt` line count and the number of complete JSONs |
