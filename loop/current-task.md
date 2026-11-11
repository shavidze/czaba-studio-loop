# Round 450: RETRO 450 (eighteenth retrospective, rounds 435–449; trigger: 15 rounds since RETRO 435) + whole-screen and journey review. No app code. A: nothing to implement. C: checks that the retro is traceable, plus the auth guard, a short Studio smoke test and the screen capture in the browser

**Planned by:** B, at the round 449 → 450 planning, 2026-11-11 (`b-round-449.md`). The advisor was available and was consulted after orientation and before writing. The round-449 task is archived as `tasks/round-449.md`, a byte-identical copy [K15].

## Decisions
All are recorded in `backlog.json` (v437 → v439) under `decisions_log_b` [K10].
- **D-29z1597: round 449 accepted.** C PASS in `c-round-449.json` (0 bugs, `browserVerified`/`realVerified` true; C8 WebKit BLOCKED). B's L57 run is OK (`b-round-449/l57-check-c449.txt`). Gate 449 published `a8599a2` [K1].
  - A-R449-REVIEW-GT1-TSX stays Medium. B's grep at `a8599a2` found only one TSX hit, the inline style in the dead `CinemaCurtainLoader` (referenced only by two barrels), so there is no live regression.
  - Gate 449 Low 2 → GATE449-S2-BARE-SPANS (deferred). Low 1, Low 3 and info 4 become `confirmedBy` entries (L7).
  - Logged: INFO-C449-C9-HEAD-CONTROL-FLAKE and ROOT-REQ-ENV-MOCK-API-HEALTH.
- **D-29z1598: RETRO data.** The window is 435–449. `b-next.json` said 436–449; `retro_policy` says 435–449, which wins.
- **D-29z1599: L46 rulings** → `user-review/questions-retro-450.md` Q1–Q7 [K24].
- **D-29z1600: lessons**, the retro-candidate rulings and ROOT-REQ-GATE-L57-UNRULED-MEDIUM.
- **D-29z1601: outputs.** The systemic task SYS-R450-STORE-STYLE-SCAN, screen candidates SR-450-1…5, the order after this round, and this dispatch.

## Rules
- **Policy:** "Retrospective: stop, look back, improve" (2026-10-26), "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28), the RETRO journey step (2026-10-31), and `backlog.json` → `retro_policy`.
- **Window and report:** rounds 435–449 (15 rounds); the report is `retros/retro-450.md`.
- **Read `lessons.md` first.** This planning changed l.3, l.6 (L1), l.9 (L4), l.55 (L22) and l.60 (L60) [K18]. The new L22 clause applies to C from this round on.
- **L57 / L22:** C's JSON carries all L57 fields. Every field is `null` with the reason "RETRO: no assert specified", except `gateChecksNamed` and the four manifest fields. Every bug carries an enum `origin`. Before hand-off, C runs `python3 -I tools/l57-check.py c-round-450.json c-round-450/l57-check.txt` and gets rc 0.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. The only facts about `store/` are HEAD, the tree, the manifest and the protected list [K1] [K2] [K3] [K4] [K19] [K30].
- **L59 / L60:** run every row until it has a result, browser rows first. Write `c-round-450/progress.json` after each row. Destructive commands stay inside `c-round-450/`.
- **Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step and the screen budget. Nothing visible changes.

## Baseline: HEAD `a8599a2`, clean tree
- **Gate:** gate 449 published `a8599a2…` on both remotes [K1]. `context/head-sha.txt` may still show `48e16b8`; `git rev-parse HEAD` is the truth.
- **Tree:** at planning, `git status --short --untracked-files=all` was empty and HEAD was `a8599a2` [K2] [K19].
- **Frozen files:** every tracked file is in `b-round-449/r450-tree-sha256.txt`, **1,369** entries [K3]. Check from `store/` with `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-449/r450-tree-sha256.txt`; B got rc 0 [K30]. Each of the 11 protected files in `b-round-318/protected-sha256.txt` appears exactly once [K4], and that file also checks rc 0 [K30].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **The RETRO is due:** `retro_policy.next_due` named round 450 (D-29z1543).
- **Nothing blocks a code-free round.** No Critical or High finding is open. The only loop-runnable open Medium, A-R449-REVIEW-GT1-TSX, has no live regression and is scheduled in SYS-R450-STORE-STYLE-SCAN. The other open Mediums are manual, root, Saba or scheduled items (2026-10-23 clarification).
- **REGRESSION is not due:** `regression-last.json` says 2026-11-10 [K13], so it is due at the first planning on or after 2026-11-13.

## 1. What B produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-450.md` | Georgian analysis for Saba, 13 sections, window 435–449 |
| `lessons.md` | **60 lines** [K7]. Before-copy `b-round-449/lessons-before-450.md`; diff `b-round-449/lessons-diff.txt`, hunks `3c3 6c6 9c9 55c55 60c60` [K18]. Lesson ids unchanged [K12]; L23 and L58 unchanged [K14] |
| `user-review/screen-review-450.md` | No change in line counts from 435; SR-450-1…5. Captures in `b-round-449/screens/`: `capture.mjs`, `capture.log`, `screen450.json`, 12 PNGs [K5] [K6] [K9] |
| `user-review/questions-retro-450.md` | Q1–Q7, each with a default [K24] |
| `b-round-449/consult-tech-lead.md`, `consult-product-designer.md`, `consult-inputs.md` | Consult inputs and returned reports |
| `b-round-449/*.py`, `misc-outputs.sh`, `data/*` | The scripts and data behind every number |
| `backlog.json` (v439) | D-29z1597…D-29z1601 and the ids of [K22] [K26] [K29]. Before-copy `b-round-449/backlog-before-450.json`. Edit scripts `update-backlog-accept.py` and `update-backlog-retro.py`, each with a `.done` marker. Retro input `b-round-449/backlog-retro-input.json` (v438) [K23] |
| `feature-status.md` | Round 449 done; the RETRO 450 row [K27] |

**Order of work for the scripts:**
1. Copy `b-round-449/*.py` and `misc-outputs.sh` to `c-round-450/scripts/`. Rewrite every `b-round-449/data/` output path to `c-round-450/data/`, keeping the inputs `b-round-449/backlog-retro-input.json` and `archive-findings-snapshot.json`. Run from the loop root.
2. Run order: `collect.py` (stdout = `collect.txt`; writes `rounds-435-449.json`) → `cost.py` (stdout = `cost.txt`; writes `cost-rows.json`) → `classify.py`, `fails-detail.py`, `gate-reviews.py`, `l57-coverage.py`, `manifest-fields.py`, `exp-fields.py`, `awaiting-user.py`, `retro450-deadlines.py` (each stdout = `<name>.txt`) → `stage-sums.py` → `misc-outputs.sh c-round-450/data`. `cmp` each output with B's file of the same name. Any difference is a finding.
3. Loops: `l57-check-window.txt` = `tools/l57-check.py c-round-N.json /dev/null`, last line, N = 435…449. `l58-check-window.txt` = `tools/l58-check.py tasks/round-N.md`, last line, N = 436…449. Re-run both and `cmp`.
4. **Do not run** `update-backlog-*.py`, `edit-lessons.py` or `update-feature-status.py`. Their `.done` markers make them refuse.

## 2. A: nothing to implement
A writes `a-round-450.md` with one line: "RETRO round, no implementation." **STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-450.md` and `c-round-450.json` as it goes, plus `c-round-450/progress.json` after every row. Browser rows (2–4) go first.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r450 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G450-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720: open `/studio-lab`, then `/studio/middle-east` (warm both first with one untimed browser load, L38), then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `localStorage.auth_user` is null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake-bearer premium path: BLOCKED (backend unavailable in cloud) |
| 3 | **STUDIO-SMOKE-450 (browser)** | Both viewports, after `Demo collection ready`: add one library item with Enter; Play about 1.5 s, then Stop; open Export, then close it | The clip appears; the position advances and then stops; the dialog opens and closes. Screenshots under `c-round-450/` |
| 4 | **RT-SCREEN (browser)** | Check `http://127.0.0.1:5199/api/products`; if it is not 200, start `node mock-api/server.mjs` in the background and stop it afterwards. Run `b-round-415/screens/warmup.mjs` from `store/`. Then, from the loop root, run `node <abs>/b-round-449/screens/capture.mjs <abs c-round-450/screens>`, and open the PNGs `screen-review-450.md` cites | Line counts equal B's [K5]: 138/168/118/144, outside 97/124/86/101; ±2 per cell for status-line timing, each delta explained. The journey: 3 clips in view at `left` 512 / 1152 / 1792, and the status names the fourth at 00:48.000 "(nearest free spot)" [K6]. Each SR-450-n statement matches its PNG: the Expand/Collapse chevrons (SR-450-1), "0.0" field + "0 dB" read-out (SR-450-2), the filled header Sign In (SR-450-3), the grey unselected Premium name/price (SR-450-4), "$29.00 USD" vs "$29" (SR-450-5) |
| 5 | **CLAIMS** | `bash b-round-449/claims-450.sh` compared with `b-round-449/claims-450-planning-output.txt` | No `MISSING`; stderr empty. Differences only where C's own work changes a value (expected: none), each explained. K10 may differ if root's optimizer rewrote `backlog.json`; check that the last D-ID is still D-29z1601 |
| 6 | **RT-NUM** | Re-run the scripts (§1) and `cmp`. Recompute every number in `retro-450.md` §1, §2, §4, §9 and §12 (counters) from its named file, at least the list below | Every number matches its source. A number without a source is a finding (origin `B spec`) |
| 7 | **RT-CAUSE** | For each fact in §3, §5, §6, §7 and §8, open the quoted source, at least the list below | Each fact is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. The B-cost cause in §2 stays labelled a hypothesis. No invented cause |
| 8 | **RT-IDS** | [K22], [K26], [K29]; and in `backlog.json`: `retro_candidates` (the 7 ids of §8) each carry a `ruled (D-29z1600)` or `counter` status; `retro_runs` round 450; `retro_policy.next_due` names round 465 | All present, with the status the retro states. SYS-R450-STORE-STYLE-SCAN `closes` lists exactly the 7 ids of §11, and each of those carries `systemic_task` SYS-R450-STORE-STYLE-SCAN |
| 9 | **RT-LESSONS** | `lessons.md` against `b-round-449/lessons-before-450.md` | ≤ 60 lines, three parts. The diff touches only l.3, l.6, l.9, l.55 and l.60. Each of those lines keeps all of its old text and only appends: l.3 the pointer change (`retro-450.md`, `435–449`) plus the RETRO 450 sentence; l.6 the inventory-grep evidence sentence; l.9 the "Port preserves HEAD" clause; l.55 the "A STOP naming an unruled Medium+" clause; l.60 the "Store tree" clause. The rule sentences of the L4, L22 and L60 clauses equal the quoted clause text in `b-round-449/consult-tech-lead.md` §1 / §5 word for word. The bold heading label, the round numbers in parentheses and the evidence list may differ: B added the heading label, A-R441-REVIEW-L1-OUTLINE-ORDER's full id, and in L22 the second case A-R439-REVIEW-M1 (2×, advisor follow-up). l.6 adds one evidence sentence, which `tech-lead` asked for as "evidence id only" |
| 10 | **RT-CHECKERS** | The L57 and L58 loops (§1.3); `python3 -I tools/l58-check.py current-task.md` [K28] | The loops equal B's files: 442, 443, 447 L57 INCOMPLETE and all others OK; L58 OK 14/14 [K21]. l58 on this task gives rc 0 ("no sketch") |
| 11 | **RT-SABA** | `retro-450.md` §12, `screen-review-450.md`, `questions-retro-450.md` | Every rule change and screen item is information, a proposal or a question; nothing is presented as Saba's decision. Each question has a default. Q5 is labelled a proposal (`.claude/` is not changed by the loop). Q6 states that TestimonialsSection is not deleted |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-450.json` | 0 lines and both rc 0; then rc 0 |

**RT-NUM, at least:**
- **Totals [K16]:** $264.79; B $198.56, A $55.61, C $10.62.
- **Medians and averages (`data/cost.txt`):** round $17.87; B $13.11; B min/max 8.14/19.78; A average FAIL 5.47, PASS 3.58.
- **Per-round rows:** `data/cost-rows.json`.
- **Stage sums (`data/stage-sums.txt`):** STORE-2b $74.65, SYS-3 $62.04, SYS-R435 $43.67, COPY-PD-VIS $35.47, SYS-1 $34.28, RETRO 435 $14.68; B share 75.0 %.
- **Verdicts [K20]:** 14 PASS, FAIL [438], gate skipped [435, 438], `browserVerified` 15/15.
- **STOPs [K17]:** 439, 442.
- **Findings:** C bugs 5 with severities (`data/fails-detail.txt`); deferred Lows in the window 45 (A 25, gate 18, B 1, C 1) with the regex categories; archive window 11 (`data/classify.txt`).
- **Gate reviews:** 13 reviews, 54 items: low 21, info 14, unlabelled 19 (`data/gate-reviews.txt`).
- **Checker coverage:** L57 INCOMPLETE on 442/443/447 (`data/l57-check-window.txt`); L58 14/14 (`data/l58-check-window.txt`).
- **Lesson sizes [K14]:** L23 5058 and L58 4988.
- **retro-435 comparison:** 255.35, 15.62, 11.63, 4.37 (`b-round-434/data/cost.txt`); B share 70.5 % (`b-round-434/data/stage-sums.txt`).
- **446–449 B average $13.73:** the mean of the four B values in `data/cost-rows.json`.
- **Cluster counts in §4:** 10 and 11, counted from the ids listed there.
- **Screen counts [K5].**

**RT-CAUSE, at least:**
- `c-round-438.json` (C-R438-01) and `backlog.json` → `retro_candidates` B-R438-REVERSE-DIRECTION-MATRIX and B-R439-SIBLING-SUITE-GAP;
- `c-round-442.json` (C-R442-M1, no `origin`), `a-round-442.md` (STOP) and `gates/gate-round-442.json` (published `4aa3c82`);
- `a-round-447.md` and the candidate RETRO450-A-SHELL-EDITS-BYPASS-HOOK;
- `b-round-448.md` §2 (the inventory first pass) and §1 (A-R448-REVIEW-M1-GOLDEN);
- `a-round-449.md` (code-reviewer) and `gates/round-449/review.md`;
- `b-round-449/consult-tech-lead.md` §1–§6 and `consult-product-designer.md`;
- the dead-file list in Q6 and the GT1-TSX hit: run `bash b-round-449/dead-importers.sh > c-round-450/data/dead-importers.txt` and `cmp` it with `b-round-449/data/dead-importers.txt` [K31]. Word hits outside barrels for `Timeline` are comments or aria text; the "JSX use or import" section is empty, and both importer counts are 0;
- `a-round-439.md` l.3 (STOP on A-R439-REVIEW-M1), `c-round-439.json` (C-R439-01, PASS) and `gates/gate-round-439.json` (published `efd71f6`): the second L22 case.

## 4. Claims
The script is `b-round-449/claims-450.sh`. B's run is saved in `b-round-449/claims-450-planning-output.txt`, with stderr in `b-round-449/claims-450-planning.err` (empty).

| Claim | What it checks |
|---|---|
| K1 | Gate 449 |
| K2 | The tree at planning |
| K3 | The manifest count |
| K4 | Each protected file appears once in the manifest |
| K5 | Screen line counts |
| K6 | Journey clips |
| K7 | `lessons.md` line count |
| K8 | Every artifact in `b-round-449/cited-artifacts.txt` exists |
| K9 | PNG count |
| K10 | Backlog version and last D-ID |
| K11 | l57 check on `c-round-449.json` |
| K12 | Lesson ids |
| K13 | Regression date |
| K14 | L23, L58 and L61 byte counts |
| K15 | The archived task equals B's copy |
| K16 | Cost medians and totals |
| K17 | STOP rounds |
| K18 | Lessons diff hunks |
| K19 | HEAD and status now |
| K20 | Fail, blocked, gate-skipped and browser counts |
| K21 | l58-check on tasks 436–449 |
| K22 | Finding ids (`tools/find-ids.py`, archive-aware) |
| K23 | The retro input is v438 |
| K24 | The questions file has 7 questions |
| K25 | AGREE-STEM-LANES answer-word count (2 at planning; a change means Saba answered, so report it) and no STEM-LANES transcripts |
| K26 | Ids in `screen_review_candidates`, `architecture_signals`, `tech_lead_manual_checks` and `root_requests_b`; `retro_runs` 450; `next_due` |
| K27 | The feature-status RETRO row and 5 SR rows in the screen review |
| K28 | l58-check on this task |
| K29 | The systemic task's `closes` list |
| K30 | Protected manifest and r450 manifest rc |
| K31 | `dead-importers.sh` output equals `b-round-449/data/dead-importers.txt` |

## 5. After this round (D-29z1601)
1. **Round 451:** REGRESSION-2026-11-13 if it is planned on or after 2026-11-13, with its `scope_additions` (L6). Otherwise **SYS-R450-STORE-STYLE-SCAN**.
2. Then:
   - SYS-R450-STORE-STYLE-SCAN, if not yet done;
   - STORE-2b-3b, after B identifies INFO-C449-C9-HEAD-CONTROL-FLAKE;
   - 2b-3c;
   - 2b-3d, with the dead-file deletion of Q6;
   - 2b-4 and STORE-2c…5;
   - ARCH-SPLIT;
   - REVIEW-RECOMMENDATIONS;
   - T12-ADVANCED;
   - phase 2, under the skip rule.
3. **STEM-LANES** jumps ahead as soon as Saba answers AGREE-STEM-LANES.
4. **Next RETRO:** round 465.
