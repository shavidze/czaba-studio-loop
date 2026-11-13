# Round 495: RETRO 495 (twenty-first retrospective, rounds 480–494; trigger: 15 rounds since RETRO 480) + whole-screen and journey review. No app code. A: nothing to implement. C: checks that the retro is traceable, plus the auth guard, a short Studio smoke test and the screen capture in the browser

**Planned by:** B, at the round 494 → 495 planning on 2026-11-13 (planning started 18:17Z; `b-round-494.md`, `b-round-494/checkpoint.md`).
- **Advisor:** available, and consulted after orientation and before hand-off.
- **Archive:** the round-494 task is archived as `tasks/round-494.md`, a byte-identical copy [K15].

## Decisions
All of these are in `backlog.json` (v483 → v486) under `decisions_log_b` [K10].
- **D-29z1764: round 494 accepted.** C PASS (`c-round-494.json`: 0 bugs, `browserVerified`/`realVerified` true); gate 494 published `3bcf8cb` [K1].
  - The three password-dialog Mediums are done for the client path.
  - These ids closed: C-R492-01, C-R493-01, A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW, A-R491-REVIEW-PWMODAL-WORDING and A-R493-REVIEW-F1, -F3, -F4, -F7.
  - B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) stays open with root.
- **D-29z1765: gate 494 review ruled.**
  - Findings 1 and 3 are recorded as `confirmedBy` on existing ids. Finding 4 is a new deferred Low, GATE494-L4-TEST-BLANK-LINES.
  - The Architecture note goes to SIG-R487-PROFILE-NAME-EDITOR-EXTRACT.
  - A's ledger gaps R2, R3 and R5 are closed by `b-round-494/doc-ledger-addendum.md` (INFO-B494-LEDGER-GAPS).
- **D-29z1766: order.** Round 495 is RETRO 495, window 480–494. Task 494 §5 wrote 481–494; B keeps the 15-round window every earlier retro used.
- **D-29z1767: RETRO data.**
- **D-29z1768: L46 rulings and the screen review.** Opened SABA-DEVICE-CHECKS; `user-review/questions-retro-495.md` Q1–Q6 [K22].
- **D-29z1769: lessons, candidate rulings, the systemic task, and the RETRO 510 counters.**
- **D-29z1770: this task and the order after it.**
- **D-29z1771: advisor closing-check corrections.** These include SABA-B-17 counted as one recurrence of SABA-B-13 (RETRO495-SABA-RECURRENCE-ENTRANCE), B-R471-SKETCH-UNREVIEWED closed, and the `account.tsx` ruling line in §5.

## Rules
- **Policy:** "Retrospective: stop, look back, improve" (2026-10-26), "Look back on every issue Saba finds" (2026-10-28), the RETRO journey step (2026-10-31), DPG process rule 5 (primitive staleness at RETRO, 2026-11-12), and `backlog.json` → `retro_policy`.
- **Read `lessons.md` first.** This planning changed it: hunks in [K18], scripts in `b-round-494/edit-lessons.log` and `edit-lessons-2.log`.
- **L57 / L22:**
  - C's JSON carries all L57 fields. Each is `null` with the reason "RETRO: no assert specified", except `gateChecksNamed` and the four manifest fields.
  - Every bug carries an enum `origin`.
  - Before hand-off, C runs `python3 -I tools/l57-check.py c-round-495.json c-round-495/l57-check.txt` and gets rc 0. This row also applies on any short route (L57 "B enforces it", new at this RETRO).
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. The only facts stated about `store/` are tagged: HEAD, the tree, the manifest, the protected list, primitive counts and lines, `auth.ts` l.379–391, and the two Studio selectors of row 3 [K1] [K2] [K3] [K4] [K19] [K25] [K26] [K27] [K30] [K32].
- **L59 / L60:** run every row until it has a result, browser rows first. Write `c-round-495/progress.json` after each row. Destructive commands stay inside `c-round-495/`.
- **Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step and the screen budget. Nothing visible changes.
- **Paths:** use absolute paths. The loop root is `/home/runner/czaba-project/tmp/studio-real-loop`, and the store is `/home/runner/czaba-project/store`.

## Baseline: HEAD `3bcf8cb`, clean tree
- **Gate:** gate 494 published `3bcf8cb…` on both remotes [K1]. `git rev-parse HEAD` is the truth; `context/head-sha.txt` may be stale.
- **Tree:** at planning, `git status --short --untracked-files=all` was empty and HEAD was `3bcf8cb` [K2] [K19].
- **Frozen files:** every tracked file is listed in `b-round-494/r495-tree-sha256.txt`, **1,405** entries [K3].
  - Check from `store/` with `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-494/r495-tree-sha256.txt`. B got rc 0 [K25].
  - Each of the 11 protected files in `b-round-318/protected-sha256.txt` appears exactly once [K4]. That file also checks rc 0 [K25].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **The RETRO is due:** `retro_policy.next_due` named round 495 (D-29z1706).
- **Nothing blocks a code-free round:**
  - No Critical is open. The one open High, B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED, needs root (backend endpoint plus the protected `app/lib/auth.ts`, [K30]).
  - The open Mediums are manual, root, Saba or scheduled items.
- **REGRESSION is not due:** `regression-last.json` says 2026-11-13 [K13]. The next one is due on or after 2026-11-16.

## 1. What B produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-495.md` | Georgian analysis for Saba, 13 sections, window 480–494 |
| `lessons.md` | [K7] [K14]. Before-copy `b-round-494/lessons-before-495.md`; diff `b-round-494/lessons-diff.txt` [K18]. Lesson numbers unchanged [K12] |
| `user-review/screen-review-495.md` | Line counts equal 480's; no new SR. Captures in `b-round-494/screens/`: `capture.mjs`, `capture.log`, `screen495.json`, `compare.py`, `compare-480.txt`, 12 PNGs [K5] [K6] [K9] |
| `user-review/questions-retro-495.md` | Q1–Q6, each with a default [K22] |
| `b-round-494/consult-tech-lead.md`, `consult-product-designer.md`, `consult-inputs.md` | Consult inputs and the returned reports |
| `b-round-494/primitive-staleness.txt` | Primitive teal, font and focus-example counts and lines [K26] [K27] |
| `b-round-494/doc-ledger-addendum.md` | Doc 318 ledger gaps R2, R3, R5 [K30] |
| `b-round-494/*.py`, `misc-outputs.sh`, `stops-head.sh`, `data/*` | The scripts and data behind every number |
| `backlog.json` (v486) | D-29z1764…D-29z1771 and the ids of [K24] |
| `feature-status.md` | Round 494 result, the RETRO 495 line and the RETRO 495 manual list in §5 |

`backlog.json` support files:
- before-copies `b-round-494/backlog-before-495.json` (before acceptance), `backlog-before-retro.json` and `backlog-before-fix.json`;
- edit scripts `update-backlog-accept.py`, `update-backlog-retro.py` and `update-backlog-fix.py`, each with a `.done` marker;
- retro input `b-round-494/backlog-retro-input.json` (v484) [K23].

`feature-status.md` has a before-copy, `b-round-494/feature-status-before-495.md`.

**Order of work for the scripts:**
1. **Copy.** Copy `b-round-494/*.py` to `c-round-495/scripts/`, except `update-*.py` and `edit-lessons*.py`. Copy `misc-outputs.sh` and `stops-head.sh` too.
   - Rewrite every `b-round-494/data/` output path to `c-round-495/data/`.
   - Keep the inputs `b-round-494/backlog-retro-input.json` and `archive-findings-snapshot.json`.
   - Run everything from the loop root.
2. **Run order** (each stdout = `<name>.txt`):
   1. `collect.py` (also writes `rounds-480-494.json`);
   2. `cost.py` (also writes `cost-rows.json`);
   3. `classify.py`, `fails-detail.py`, `gate-reviews.py`, `l57-coverage.py`, `manifest-fields.py`, `exp-fields.py`, `awaiting-user.py`, `retro495-deadlines.py`, `deferred-added.py`;
   4. `stage-sums.py`;
   5. `misc-outputs.sh c-round-495/data`;
   6. `stops-head.sh > c-round-495/data/stops-head.txt`.

   `cmp` each output with B's file of the same name; any difference is a finding.
   - The data scripts read only `c-round-480.json` … `c-round-494.json` (and their result files), the retro input and the archive snapshot, so C's own `c-round-495.json` cannot change them.
   - `retro495-deadlines.txt` reads the frozen retro input, not the live backlog.
3. **Loops:**
   - `l57-check-window.txt` = `tools/l57-check.py c-round-N.json /dev/null`, last line, for N = 480…494.
   - `l58-check-window.txt` = `tools/l58-check.py tasks/round-N.md`, last line, for N = 481…494.

   Re-run both and `cmp`.
4. **Do not run** `update-backlog-*.py`, `update-feature-status.py` or `edit-lessons*.py`. Their `.done` markers make them refuse.

## 2. A: nothing to implement
A writes `a-round-495.md` with one line: "RETRO round, no implementation."

**STOP (L11), the only statement of it:** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-495.md` and `c-round-495.json` as it goes, plus `c-round-495/progress.json` after every row. Browser rows (2–4) go first.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r495 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G495-AUTH** (browser) | Fresh anonymous context at 1440×900 and 1280×720. First warm both pages with one untimed browser load (L38). Then open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `localStorage.auth_user` is null and the workspace opens. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. The token API returns 401. The fake-bearer premium path is BLOCKED (backend unavailable in cloud) |
| 3 | **STUDIO-SMOKE-495** (browser) | Both viewports, after `Demo collection ready`: add one library item with Enter; Play for about 1.5 s, then Stop; open Export, then close it | The clip count (distinct `[data-clip-id]` values [K32]) goes 0 → 1. The text of the `arrangement-playback-state` testid [K32] reads `Playing`, then `Stopped`, and the position advances. The dialog opens and closes. Screenshots under `c-round-495/` |
| 4 | **RT-SCREEN** (browser) | See the run recipe below the table | Line counts equal B's [K5]: 138/168/118/144, outside 97/124/86/101. Allow ±2 per cell for status-line timing, and explain each delta. The journey matches [K6]: `?preview=middle-east`, 3 clips at `left` 512 / 1152 / 1792, and the status names the fourth at 00:48.000 "(nearest free spot)". Each statement in `screen-review-495.md` matches its PNG and JSON. "No new SR" is product-designer's opinion; label it so. Record whether SR-290-1 ("Time selection" cut under the footer at 1280) shows in `journey495-3-export-1280x720.png`. The consultant did not open the four `screen495-full-*` PNGs (`screen-review-495.md` "დაფარვა"). C opens all four and records anything that changed from the RETRO 480 PNGs (`b-round-479/screens/screen480-full-*`) |
| 5 | **CLAIMS** | `bash b-round-494/claims-495.sh`, compared with `b-round-494/claims-495-planning-output.txt` | No `MISSING`, and stderr is empty. Differences are allowed only where C's own work changes a value (expected: none), each explained. K10 may differ if root's optimizer rewrote `backlog.json`; check that the last D-ID is still D-29z1771. K11 reads `L57 OK` for `c-round-494` |
| 6 | **RT-NUM** | Re-run the scripts (§1) and `cmp`. Recompute every number in `retro-495.md` §1, §2, §4 and §9 from its named file, at least the list below | Every number matches its source. A number without a source is a finding (origin `B spec`) |
| 7 | **RT-CAUSE** | For each fact in §3, §5, §6, §7 and §8, open the quoted source, at least the list below | Each fact is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No invented cause |
| 8 | **RT-IDS** | [K24], `backlog.json` and the archive (look ids up with `python3 -I tools/find-ids.py <loop root> <ID>`; root's optimizer may archive done or closed `open_findings` between B and C) | `retro_runs` has round 495. `retro_policy.next_due` names round 510. RC-R492-DOC-TRUTH-REVIEW starts `adopted (D-29z1769)`. RC-R471-L58-SKIPPED starts `closed (D-29z1769)`. SABA-DEVICE-CHECKS starts `open_tech_lead_manual`. SYS-R495-SHARED-DIALOG starts `blocked_root` and lists the 8 ids of retro §11. The three password Mediums start `done (D-29z1764)` (in the backlog or the archive). B-R471-SKETCH-UNREVIEWED starts `closed (D-29z1771)`. RETRO495-SABA-RECURRENCE-ENTRANCE exists |
| 9 | **RT-LESSONS** | `lessons.md` against `b-round-494/lessons-before-495.md` | ≤ 60 lines, ≤ 57,500 bytes, and no line over 4,800 bytes [K7], in three parts. The diff touches only the hunks of [K18]. Each change is one of the 35 entries in `edit-lessons.log` + `edit-lessons-2.log`. Removed text is evidence narrative only: the id lists `ids-before.txt` / `ids-after.txt` differ only by `C-STRIP-PLAYING`, a row label [K12]. The 4 added clauses are word for word those named in retro §10. l.3 is a pointer naming `retro-495.md`, `480–494` and `b-round-494/lessons-before-495.md` |
| 10 | **RT-CHECKERS** | The L57 and L58 loops (§1.3); `python3 -I tools/l58-check.py current-task.md` [K28] | The loops equal B's files: L57 OK 11/15 (INCOMPLETE 485, 487, 488, 493); L58 OK 14/14 for 481–494, and task 480 is OK too [K21]. `l58-check` on this task gives rc 0 |
| 11 | **RT-SABA** | `retro-495.md` §12, `screen-review-495.md`, `questions-retro-495.md` | Every rule change and screen item is information, a proposal or a question; nothing is presented as Saba's decision. Each question has a default. Q1 says which task opens (SABA-DEVICE-CHECKS) and what blocks it. Q4 says that hiding or rewording the button needs Saba |
| 12 | **RT-PRIMITIVES** | From `store/`, re-run the K26 and K27 commands and open each hit | Counts and lines equal [K26] [K27]. `b-round-494/primitive-staleness.txt` matches: unchanged since `bbb3193` (0 commits); the focus examples are at FORWARDREF_COMPONENT.md l.57, l.150, l.152 and DESIGN_TOKENS.md l.101 |
| 13 | **RT-LEDGER** | `b-round-494/doc-ledger-addendum.md` against `git show 3bcf8cb:app/lib/auth.ts` l.379–391 [K30] and `a-round-488.md` l.50 | Each cited line says what the addendum says. The l.64 row is labelled as a source review, not a measurement |
| 14 | **SOURCE-SCOPE** (end) + **L57** | As row 1, then `python3 -I tools/l57-check.py c-round-495.json c-round-495/l57-check.txt` | 0 lines and both rc 0; then rc 0 [K31] |

**RT-SCREEN run recipe:**
1. Check `http://127.0.0.1:5199/__mock/health`. If it is not ok, start `node mock-api/server.mjs` in the background. Stop it afterwards by PID (`pkill -f` can match your own shell).
2. Warm `/studio-lab` and `/products/middle-east` once in a browser.
3. From the loop root, run `node /home/runner/czaba-project/tmp/studio-real-loop/b-round-494/screens/capture.mjs /home/runner/czaba-project/tmp/studio-real-loop/c-round-495/screens`.
4. Open the PNGs that `screen-review-495.md` cites.

**RT-NUM, at least:**
- **Totals [K16]:** $247.20; B $175.31, A $47.47, C $24.42; B share 70.9 %.
- **Medians and averages (`data/cost.txt`):**
  - round median $16.77; B median $12.58; B min/max 1.60/20.52;
  - A average $4.92 on FAIL rounds and $2.53 on PASS rounds;
  - FAIL rounds total $69.53;
  - the top five rounds.
- **Stage sums (`data/stage-sums.txt`):** the nine stage values of retro §2.
- **Retro 480 comparison:** $214.36, $15.29 and 62.2 % come from `retros/retro-480.md` §1/§2. "15 % more expensive" = 247.20/214.36. The B/A/C deltas come from both files.
- **Verdicts [K20]:**
  - PASS 11 and FAIL [487, 489, 492, 493];
  - published [481, 485, 486, 488, 490, 491, 494];
  - `browserVerified` 13/15, false in 483 and 493.
- **STOPs [K17]:** 487, 489, 492, 493. Also read the first 3 lines of each `a-round-N.md`, N = 480…494, and confirm the four by hand.
- **Findings:**
  - C bugs 5 named + 4 info, with severities (`data/fails-detail.txt`);
  - new deferred 56, 6 closed, and the prefix split (`data/deferred-added.txt`);
  - classify window: open 7, deferred 52, archive 14, and the deferred categories (`data/classify.txt`);
  - the "23 password-dialog / 9 entrance" grouping in retro §4: `grep -cE` on the prefixes it names over the id list in `data/deferred-added.txt` (from line 5).
- **Gate reviews:** 7 reviews, 30 items: medium 1, low 12, info 8, unlabelled 9 (`data/gate-reviews.txt`).
- **Checkers:** L57 11/15; L58 15/15.
- **Fix-up chains (retro §4):** 487→488, 489→490, 492→493→494, from `data/task-titles.txt` [K29].
- **Lesson sizes [K7] [K14]:** after 57,164 B, maximum line 4,771 B; before 58,361 B, l.41 4,941 B (`b-round-494/lessons-before-495.md`).
- **Screen counts [K5].**

**RT-CAUSE, at least:**
- **487:**
  - `a-round-487.md` l.3 and l.5 (the second STOP, the §1/§2 conflict) and `c-round-487.md` (C-R487-01);
  - `b-round-486/sketch-review.md` l.9 (Q1 "correct");
  - the `account.tsx` focus hits 132, 137, 160 and 173 listed in `b-round-486/l50-hits.txt`;
- **489:** `a-round-489.md` l.3 and `c-round-489.json` (C-R489-A-STOP-NONZOOM-TEST-GAP);
- **492:** `c-round-492.json` (C-R492-01) and `a-round-492.md`;
- **493:** `c-round-493.json` (C-R493-01), the B-R492-PASSWORD-BACKDROP-SHORT entry in `backlog.json`, and `tasks/round-493.md` l.96–102 (the STOP list `tech-lead` cites);
- **the Saba-found issue:** `tasks/round-489.md` l.46–49 ("Why we missed it") and the L18 "felt quantity" clause. The recurrence of SABA-B-13 is counted in retro §6;
- **the consults:** `b-round-494/consult-tech-lead.md` and `consult-product-designer.md`;
- **the gate 494 rulings:** `gates/round-494/review.md` findings 1–5 against D-29z1765.

- **L22:** if A STOPs, run rows 1, 2, 5 and 14 only, and report "STOPPED — routed to B".

## 4. Claims
The script is `b-round-494/claims-495.sh`. B's run is saved in `b-round-494/claims-495-planning-output.txt`, with stderr in `b-round-494/claims-495-planning.err` (empty).

| Claim | What it checks |
|---|---|
| K1 | Gate 494 |
| K2 | The tree at planning |
| K3 | The manifest count |
| K4 | Each protected file appears once in the manifest |
| K5 | Screen line counts |
| K6 | Journey clips |
| K7 | `lessons.md` lines, bytes and longest line |
| K8 | Every artifact in `b-round-494/cited-artifacts.txt` exists |
| K9 | PNG count |
| K10 | Backlog version and last D-ID |
| K11 | l57 on `c-round-494.json`, and `c-round-494/l57-check.txt` reads `L57 OK` |
| K12 | Lesson numbers equal the before-copy; the lost token list |
| K13 | Regression date |
| K14 | L26, L47, L57 and L58 byte counts (`wc -c` of the line, including its newline) |
| K15 | The archived task equals B's copy |
| K16 | Cost totals, medians and B share |
| K17 | STOP rounds |
| K18 | Lessons diff hunks |
| K19 | HEAD and status now |
| K20 | FAIL, BLOCKED, published and browser counts |
| K21 | Count of l57 INCOMPLETE; l58 rc on tasks 480–494 |
| K22 | The questions file has 6 questions |
| K23 | The retro input is v484 |
| K24 | New ids (backlog), `retro_runs` 495, `next_due`; the password Mediums and the INFO ids through `tools/find-ids.py` |
| K25 | r495 manifest and protected manifest rc |
| K26 | Primitive teal and font counts |
| K27 | Primitive focus-example lines; commits to primitives since `bbb3193` |
| K28 | l58-check on this task |
| K29 | New deferred count, closed count, fix-up/re-dispatch titles |
| K30 | `auth.ts` l.379–391 at `3bcf8cb` has the login check and the unconditional throw |
| K31 | This task names the l57-check row |
| K32 | The `arrangement-playback-state` testid (ArrangementTransport.tsx) and the `data-clip-id` attribute exist in `app/components/arrangement` |

## 5. After this round (D-29z1770)
1. **Round 496:** DPG-BUTTON-CLEANUP (DPG P1). It includes the L8 rows for B-R492-PASSWORD-SUBMIT-FOCUS-LOST and GATE488-L3-SAVE-CANCEL-FOCUS-DISABLED. If planning happens on or after 2026-11-16, REGRESSION comes first.
2. **Then:**
   - the rest of DPG P1;
   - the DP-gate re-run with root;
   - SYS-R465-DEAD-CSS-MATCHER, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
   - phase 2 under the skip rule.
3. **STEM-LANES** jumps ahead as soon as Saba answers AGREE-STEM-LANES. **SYS-R495-SHARED-DIALOG** starts when root grants ROOT-REQ-SHARED-DIALOG-GRANT.
4. **No new `app/routes/account.tsx` task** until root answers ARCH-CHECKPOINT-ACCOUNT-PROFILE (deadline RETRO 510), except for a Critical, High or Medium fix.
   - **Ruling line (L4): account.tsx hold (item 4) vs the two L8 rows (item 1): the hold wins.** One exception: when DPG-BUTTON-CLEANUP's own button inventory hits `account.tsx`, that DPG P1 button grant wins over the hold and the two L8 rows ride along. Otherwise they stay deferred (D-29z1771).
5. **Next RETRO:** round 510.
