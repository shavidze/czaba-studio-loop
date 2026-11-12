# Round 465: RETRO 465 (nineteenth retrospective, rounds 450–464; trigger: 15 rounds since RETRO 450) + whole-screen and journey review. No app code. A: nothing to implement. C: checks that the retro is traceable, plus the auth guard, a short Studio smoke test and the screen capture in the browser

**Planned by:** B, at the round 464 → 465 planning, 2026-11-12 (`b-round-464.md`). The advisor was available and was consulted after orientation and before writing. The round-464 task is archived as `tasks/round-464.md`, a byte-identical copy [K15].

## Decisions
All are in `backlog.json` (v456 → v460) under `decisions_log_b` [K10].
- **D-29z1636: round 464 accepted.** C PASS (`c-round-464.json`, 0 bugs, `browserVerified`/`realVerified` true); gate 464 published `6d321c7` [K1].
  - Closed: A-R463-REVIEW-M1, B-R463-DC2-UNDERSCORE, A-R463-REVIEW-L3.
  - Gate findings 1–3 → `confirmedBy` on TL-R464-L1, TL-R464-L2 and SIG-R464-PULSE-KEYFRAMES-SHADOW.
  - A's reviewer Lows L3–L6 are deferred. L4 and L5 (fail-silent / test strength) are ruled Low after B's check: the only keyframes kept solely through the named-utility branch is `pulse`, the correct Tailwind default case (`b-round-464/l4-check.txt`, produced by `b-round-464/l4-check.sh`) [K31].
- **D-29z1637: RETRO data**, window 450–464.
- **D-29z1638: L46 rulings and screen** → `user-review/questions-retro-465.md` Q1–Q7 [K24]; SR-465-1…3.
- **D-29z1639: lessons, candidate rulings, systemic task** SYS-R465-DEAD-CSS-MATCHER (planned with a trigger, not dispatched).
- **D-29z1640: this dispatch** and the order after it.
- **D-29z1641: corrections from the advisor's closing check:** the deferred-Low count (52 → 78, union method), the fix-up-chain and round-463 counter rows, `l4-check.sh` saved, and the L58 heading.

## Rules
- **Policy:** "Retrospective: stop, look back, improve" (2026-10-26), "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28), the RETRO journey step (2026-10-31), and `backlog.json` → `retro_policy`.
- **Read `lessons.md` first.** This planning changed l.3, l.16 (L23), l.36 (L52), l.40 (L56), l.41 (L58), l.53 (L18) and l.60 (L60) [K18]. The new L52 clause ("A guard must be able to disagree with what it checks") applies to C from this round on.
- **L57 / L22:** C's JSON carries all L57 fields. Each field is `null` with the reason "RETRO: no assert specified", except `gateChecksNamed` and the four manifest fields. Every bug carries an enum `origin`. Before hand-off, C runs `python3 -I tools/l57-check.py c-round-465.json c-round-465/l57-check.txt` and gets rc 0.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. The only facts about `store/` are HEAD, the tree, the manifest and the protected list [K1] [K2] [K3] [K4] [K19] [K30].
- **L59 / L60:** run every row until it has a result, browser rows first. Write `c-round-465/progress.json` after each row. Destructive commands stay inside `c-round-465/`.
- **Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step and the screen budget. Nothing visible changes.

## Baseline: HEAD `6d321c7`, clean tree
- **Gate:** gate 464 published `6d321c7…` on both remotes [K1]. `context/head-sha.txt` may be stale; `git rev-parse HEAD` is the truth.
- **Tree:** at planning, `git status --short --untracked-files=all` was empty and HEAD was `6d321c7` [K2] [K19].
- **Frozen files:** every tracked file is in `b-round-464/r465-tree-sha256.txt`, **1,377** entries [K3]. Check from `store/` with `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-464/r465-tree-sha256.txt`; B got rc 0 [K30]. Each of the 11 protected files in `b-round-318/protected-sha256.txt` appears exactly once [K4], and that file also checks rc 0 [K30].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **The RETRO is due:** `retro_policy.next_due` named round 465 (D-29z1601).
- **Nothing blocks a code-free round.** No Critical or High finding is open. The open Mediums are manual, root, Saba or scheduled items (2026-10-23 clarification; `b-round-464/data/open-medium-plus.txt`, 11 lines).
- **REGRESSION is not due:** `regression-last.json` says 2026-11-10 [K13] and the planning date is 2026-11-12. It is due at the first planning on or after 2026-11-13.

## 1. What B produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-465.md` | Georgian analysis for Saba, 13 sections, window 450–464 |
| `lessons.md` | **60 lines, 57,320 bytes** [K7]. Before-copy `b-round-464/lessons-before-465.md`; diff `b-round-464/lessons-diff.txt`, hunks `3c3 16c16 36c36 40,41c40,41 53c53 60c60` [K18]. Lesson ids unchanged [K12] |
| `user-review/screen-review-465.md` | Line counts equal 450's; SR-465-1…3. Captures in `b-round-464/screens/`: `capture.mjs`, `capture.log`, `screen465.json`, `compare-450.txt`, 12 PNGs [K5] [K6] [K9] |
| `user-review/questions-retro-465.md` | Q1–Q7, each with a default [K24] |
| `b-round-464/consult-tech-lead.md`, `consult-product-designer.md`, `consult-inputs.md` | Consult inputs and returned reports |
| `b-round-464/*.py`, `misc-outputs.sh`, `stops-head.sh`, `data/*` | The scripts and data behind every number |
| `backlog.json` (v460) | D-29z1636…D-29z1641 and the ids of [K22] [K26] [K29]. Before-copy `b-round-464/backlog-before-465.json`. Edit scripts `update-backlog-accept.py`, `update-backlog-retro.py`, `update-backlog-fix.py` and `update-backlog-fix2.py`, each with a `.done` marker. Retro input `b-round-464/backlog-retro-input.json` (v457) [K23] |
| `feature-status.md` | Round 464 done; the RETRO 465 row; the RETRO 465 manual list at the top of §5 [K27] |

**Order of work for the scripts:**
1. Copy `b-round-464/*.py` (except `update-*.py` and `edit-lessons*.py`), `misc-outputs.sh` and `stops-head.sh` to `c-round-465/scripts/`. Rewrite every `b-round-464/data/` output path to `c-round-465/data/`, keeping the inputs `b-round-464/backlog-retro-input.json` and `archive-findings-snapshot.json`. Run from the loop root.
2. Run order:
   1. `collect.py` (stdout = `collect.txt`; writes `rounds-450-464.json`);
   2. `cost.py` (stdout = `cost.txt`; writes `cost-rows.json`);
   3. `classify.py`, `fails-detail.py`, `gate-reviews.py`, `l57-coverage.py`, `manifest-fields.py`, `exp-fields.py`, `awaiting-user.py`, `retro465-deadlines.py`, `deferred-added.py` (each stdout = `<name>.txt`);
   4. `stage-sums.py`;
   5. `misc-outputs.sh c-round-465/data`;
   6. `stops-head.sh > c-round-465/data/stops-head.txt`.

   `cmp` each output with B's file of the same name; any difference is a finding. The data scripts read only `c-round-450.json` … `c-round-464.json`, so C's own `c-round-465.json` cannot change them.
3. Loops: `l57-check-window.txt` = `tools/l57-check.py c-round-N.json /dev/null`, last line, N = 450…464. `l58-check-window.txt` = `tools/l58-check.py tasks/round-N.md`, last line, N = 451…464. Re-run both and `cmp`.
4. **Do not run** `update-backlog-*.py`, `edit-lessons.py`, `edit-lessons-2.py` or `update-feature-status.py`. Their `.done` markers make them refuse.

## 2. A: nothing to implement
A writes `a-round-465.md` with one line: "RETRO round, no implementation." **STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-465.md` and `c-round-465.json` as it goes, plus `c-round-465/progress.json` after every row. Browser rows (2–4) go first.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r465 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G465-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720: open `/studio-lab`, then `/studio/middle-east` (warm both first with one untimed browser load, L38), then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `localStorage.auth_user` is null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake-bearer premium path: BLOCKED (backend unavailable in cloud) |
| 3 | **STUDIO-SMOKE-465 (browser)** | Both viewports, after `Demo collection ready`: add one library item with Enter; Play about 1.5 s, then Stop; open Export, then close it | The clip appears; the position advances and then stops; the dialog opens and closes. Screenshots under `c-round-465/` |
| 4 | **RT-SCREEN (browser)** | Check `http://127.0.0.1:5199/api/products`; if it is not 200, start `node mock-api/server.mjs` in the background and stop it afterwards. Run `b-round-415/screens/warmup.mjs` from `store/`. Then, from the loop root, run `node <abs>/b-round-464/screens/capture.mjs <abs c-round-465/screens>`, and open the PNGs `screen-review-465.md` cites | Line counts equal B's [K5]: 138/168/118/144, outside 97/124/86/101; ±2 per cell for status-line timing, each delta explained. The journey: 3 clips at `left` 512 / 1152 / 1792, and the status names the fourth at 00:48.000 "(nearest free spot)" [K6]. Each SR-465-n statement matches its PNG: the "✦ PREMIUM" chip above the name "Premium" (SR-465-1); "WAV" and "24-bit / 48 kHz" on both version cards (SR-465-2); the half-cut top row of the library list after Melody is added (SR-465-3) |
| 5 | **CLAIMS** | `bash b-round-464/claims-465.sh` compared with `b-round-464/claims-465-planning-output.txt` | No `MISSING`; stderr empty. Differences only where C's own work changes a value (expected: none), each explained. K10 may differ if root's optimizer rewrote `backlog.json`; check that the last D-ID is still D-29z1641 |
| 6 | **RT-NUM** | Re-run the scripts (§1) and `cmp`. Recompute every number in `retro-465.md` §1, §2, §4 and §9 from its named file, at least the list below | Every number matches its source. A number without a source is a finding (origin `B spec`) |
| 7 | **RT-CAUSE** | For each fact in §3, §5, §6, §7 and §8, open the quoted source, at least the list below | Each fact is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No invented cause |
| 8 | **RT-IDS** | [K22], [K26], [K29]; in `backlog.json`: the five RETRO465-* `retro_candidates` each start with `ruled (D-29z1639)`; `retro_runs` round 465; `retro_policy.next_due` names round 480 | All present, with the status the retro states. SYS-R465-DEAD-CSS-MATCHER `closes` lists exactly the 6 ids of retro §11; each of the 5 Low ids carries `systemic_task` SYS-R465-DEAD-CSS-MATCHER; its status says "planned, not dispatched" and names the three triggers |
| 9 | **RT-LESSONS** | `lessons.md` against `b-round-464/lessons-before-465.md` | ≤ 60 lines and fewer bytes than the before-copy, three parts. The diff touches only the hunks of [K18]. L52, L56 and L18 each keep all their old text and append exactly the clause quoted in `b-round-464/consult-tech-lead.md` §1, word for word. L60 only adds `, INFO-A451-L60-SED-DOC` and changes `(1×)` to `(2×)` in its store-tree clause. L23 and L58 only remove the evidence text named in `consult-tech-lead.md` §3 (L58 also drops "and the review claim" from its RETRO 401 heading and changes that clause's `(2×)` to `(1×)`, because the removed sentence carried its second case), and no finding id disappears from either line (compare the id lists before and after). l.3 is a pointer that names `retro-465.md`, `450–464`, `b-round-464/lessons-before-465.md` and the RETRO 465 note |
| 10 | **RT-CHECKERS** | The L57 and L58 loops (§1.3); `python3 -I tools/l58-check.py current-task.md` [K28] | The loops equal B's files: L57 OK 15/15; L58 OK except 458 INCOMPLETE [K21]. l58 on this task gives rc 0 ("no sketch") |
| 11 | **RT-SABA** | `retro-465.md` §12, `screen-review-465.md`, `questions-retro-465.md` | Every rule change and screen item is information, a proposal or a question; nothing is presented as Saba's decision. Each question has a default. Q7 is labelled a proposal that the loop does not apply. Q3 states that the IME task is open but blocked on a real IME platform |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-465.json` | 0 lines and both rc 0; then rc 0 |

**RT-NUM, at least:**
- **Totals [K16]:** $282.31; B $202.43, A $70.17, C $9.71.
- **Medians and averages (`data/cost.txt`):**
  - round $20.25 and B $14.44;
  - B min/max 1.51/21.04;
  - A average FAIL 6.38, PASS 4.06;
  - FAIL rounds $72.53 and the top five.
- **Stage sums (`data/stage-sums.txt`):** the eight stage values of retro §2; B share 71.7 %.
- **2b-3b…3d B average $15.08:** the mean of the eight B values (453, 454, 456–458, 462–464) in `data/cost-rows.json`. The baseline $13.73 comes from `retro-450.md` §2.
- **Verdicts [K20]:** 11 PASS, FAIL [451, 456, 457, 459], gate skipped [450, 451, 456, 457, 459], `browserVerified` 15/15.
- **STOPs [K17]:** 451, 456, 457, 459, 462 (`data/stops-head.txt`); the old regex gives 451, 456, 462 (`data/stops-count.txt`). Also read the first 3 lines of each `a-round-N.md`, N = 450…464, and confirm the five by hand.
- **Findings:**
  - C bugs 10 with severities (`data/fails-detail.txt`), origin 10/10 (`data/l57-coverage.txt`);
  - new deferred **78** by the union method and its split by method (a 52, b 78, c 73) and prefix (`data/deferred-added.txt`); spot-check 5 of the 29 rows that `classify.txt` (49) does not count and confirm each is a window entry;
  - 49 and the category counts (`data/classify.txt`);
  - archive window 18, Medium 6 (`classify.txt`, `data/archived-mediums.txt`).
- **Gate reviews:** 10 reviews, 51 items: low 15, info 7, medium 1, unlabelled 28 (`data/gate-reviews.txt`).
- **Checkers:** L57 15/15; L58 458 INCOMPLETE.
- **Fix-up chains (retro §9):** 451→452, 456→457→458, 459→460→461, 463→464, from `data/task-titles.txt`.
- **Round 463 unruled Medium (retro §9):** `a-round-463.md` l.3, `c-round-463.json` PASS, `gates/gate-round-463.json` `checkedUtc` 08:18Z, and D-29z1634 in `backlog.json`.
- **Lesson sizes [K7] [K14]:** 58,399 → 57,320; L23 4623, L58 4689.
- **Cluster counts in §4:** 10 and 7, counted from the ids listed there.
- **Screen counts [K5].**

**RT-CAUSE, at least:**
- 451: `a-round-451.md`, `c-round-451.json` and `b-round-451/scope-sweep.md`;
- 456: `a-round-456.md` and `c-round-456.json`;
- 457: `a-round-457.md`, `c-round-457.json` and `b-round-457.md` (Vite vs tsc);
- 459: `a-round-459.md`, `c-round-459.json` (C-R459-01) and `tasks/round-460.md` "Why we missed it";
- 462: `a-round-462.md` l.3 (STOP K23) and `c-round-462.json` (C-R462-01);
- the Saba-found issues: `tasks/round-455.md` and `tasks/round-459.md` "Why we missed it", and the L61 "Painted range fill" and L18 "First painted frame" clauses in `lessons.md`;
- the 459 B-cost limit: `b-round-458-result.json.attempt1.json` is 0 bytes;
- the candidates: `backlog.json` → `retro_candidates` (the five RETRO465-* texts) and the TL-R455-WALKER-LIMITS status (D-29z1621 / D-29z1623, the stop-loss ruling);
- the consults: `b-round-464/consult-tech-lead.md` §1–§6 and `consult-product-designer.md`;
- `b-round-464/l4-check.txt`: from `store/`, run `bash ../tmp/studio-real-loop/b-round-464/l4-check.sh` and `cmp` it with `l4-check.txt` (pulse: hyphen-aware 0 declaration uses).

## 4. Claims
The script is `b-round-464/claims-465.sh`. B's run is saved in `b-round-464/claims-465-planning-output.txt`, with stderr in `b-round-464/claims-465-planning.err` (empty).

| Claim | What it checks |
|---|---|
| K1 | Gate 464 |
| K2 | The tree at planning |
| K3 | The manifest count |
| K4 | Each protected file appears once in the manifest |
| K5 | Screen line counts |
| K6 | Journey clips |
| K7 | `lessons.md` lines and bytes |
| K8 | Every artifact in `b-round-464/cited-artifacts.txt` exists |
| K9 | PNG count |
| K10 | Backlog version and last D-ID |
| K11 | l57 check on `c-round-464.json` |
| K12 | Lesson ids equal the before-copy |
| K13 | Regression date |
| K14 | L23, L58, L52 and L56 byte counts |
| K15 | The archived task equals B's copy |
| K16 | Cost medians and totals |
| K17 | STOP rounds (new and old method) |
| K18 | Lessons diff hunks |
| K19 | HEAD and status now |
| K20 | Fail, gate-skipped and browser counts |
| K21 | l58-check on tasks 451–464 |
| K22 | Finding ids (`tools/find-ids.py`, archive-aware) |
| K23 | The retro input is v457 |
| K24 | The questions file has 7 questions |
| K25 | AGREE-STEM-LANES answer-word count (2 at planning; a change means Saba answered, so report it) and no STEM-LANES transcripts |
| K26 | SR-465-1…3, the signal, the systemic task and the two RETRO480 counters; `retro_runs` 465; `next_due`; 5 rulings |
| K27 | The feature-status RETRO row and 3 SR rows in the screen review |
| K28 | l58-check on this task |
| K29 | The systemic task's `closes` list and its tags |
| K30 | Protected manifest and r465 manifest rc |
| K31 | Last line of `l4-check.txt` |
| K32 | Installed Playwright browsers (the Q1 premise) |

## 5. After this round (D-29z1640)
1. **Round 466:** REGRESSION-2026-11-13 if it is planned on or after 2026-11-13, with its `scope_additions` (L6). Otherwise **STORE-2b-3c-2b**.
2. Then:
   - 2b-3c-2b, if not yet done;
   - 2b-4 and STORE-2c…5;
   - ARCH-SPLIT;
   - REVIEW-RECOMMENDATIONS;
   - T12-ADVANCED;
   - phase 2, under the skip rule.

   SYS-R465-DEAD-CSS-MATCHER runs at its first trigger.
3. **STEM-LANES** jumps ahead as soon as Saba answers AGREE-STEM-LANES.
4. **Next RETRO:** round 480.
