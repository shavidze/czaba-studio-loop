# Round 510: RETRO 510 (twenty-second retrospective, rounds 495–509; trigger: 15 rounds since RETRO 495) + whole-screen and journey review. No app code. A: nothing to implement. C: checks that the retro is traceable, plus the auth guard, a real-audio Studio smoke test and the screen capture in the browser

**Planned by:** B at the round 509 → 510 planning, 2026-11-14 (started 08:47Z; `b-round-509.md`, `b-round-509/checkpoint.md`).
- **Advisor:** available; consulted after orientation and before hand-off.
- **Archive:** the round-509 task is archived as `tasks/round-509.md`, a byte-identical copy [K11].

## Decisions
All are in `backlog.json` (v513 → v516) under `decisions_log_b` [K10].
- **D-29z1842: round 509 accepted.** C PASS (`c-round-509.json`: 0 bugs, `browserVerified`/`realVerified` true; C9 BLOCKED, backend); gate 509 published `f5d1b9e` [K1]. B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD is closed for the cloud path; FREE-CHECKOUT-REAL-BACKEND stays open.
- **D-29z1843: round 509 follow-ups.** Gate finding 1 → `confirmedBy` on FREE-CHECKOUT-REAL-BACKEND; gate 2–4 and A's two Lows deferred; both Architecture notes → SIG-R509-SELECTED-VERSION-OFFER (not scheduled).
- **D-29z1844: order.** Round 510 = RETRO 510, window 495–509.
- **D-29z1845: RETRO data.** **D-29z1846: L46 rulings** (`user-review/questions-retro-510.md` Q1–Q6). **D-29z1847: lessons, `tools/ledger-check.py`, the systemic task DPG-BUTTON-CONTRACT-TABLE, RC-R510-SKETCH-SCOPE, the screen review.** **D-29z1848: this task and the order after it.** **D-29z1849: advisor closing-check corrections** (stops-head count, 3 of 10 counters, sketch-round count, the 505 row, recorded origins, L26 E7, B dry runs of rows 3 and 10).

## Rules
- **Policy:** "Retrospective: stop, look back, improve" (2026-10-26), "Look back on every issue Saba finds" (2026-10-28), the RETRO journey step (2026-10-31), DPG process rule 5 (primitive staleness at RETRO), `backlog.json` → `retro_policy`.
- **Read `lessons.md` first.** This planning changed it (hunks in [K8]; scripts `b-round-509/edit-lessons.py`, `edit-lessons-2.py`, `edit-lessons-3.py`; logs `edit-lessons.log`, `edit-lessons-2.log`, `edit-lessons-3.log`).
- **L57 / L22:** C's JSON carries all L57 fields. Each is `null` with the reason "RETRO: no assert specified", except `gateChecksNamed` and the four manifest fields. Every bug carries an enum `origin`. Before hand-off C runs `python3 -I tools/l57-check.py c-round-510.json c-round-510/l57-check.txt` and gets rc 0.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. Facts about `store/` are tagged [K19] [K20] [K21] [K23].
- **L59 / L60:** run every row until it has a result, browser rows first. Write `c-round-510/progress.json` after each row. Destructive commands stay inside `c-round-510/`.
- **Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step and the screen budget. Nothing visible changes.
- **No full suite.** The full vitest suite, build and `npm run verify` are `gate` rows (2026-10-21 speed rules); `"passed"` must not claim them.
- **Paths:** loop root `/home/runner/czaba-project/tmp/studio-real-loop`; store `/home/runner/czaba-project/store`.

## Baseline: HEAD `f5d1b9e`, clean tree
- Gate 509 published `f5d1b9e…` on both remotes [K1]. `git rev-parse HEAD` is the truth; `context/head-sha.txt` may be stale.
- At planning `git status --short --untracked-files=all` was empty and HEAD was `f5d1b9e` [K2] [K19].
- **Frozen files:** every tracked file is in `b-round-509/r510-tree-sha256.txt`, **1,428** entries [K3]. From `store/`: `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-509/r510-tree-sha256.txt` — B got rc 0 [K20]. Each of the 11 protected files in `b-round-318/protected-sha256.txt` appears exactly once [K4]; that file also checks rc 0 [K20].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **The RETRO is due:** `retro_policy.next_due` named round 510 (D-29z1769); task 509 §0 said so.
- **Nothing blocks a code-free round:** no Critical is open; the one open High (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED) needs root (backend + protected `app/lib/auth.ts`). The open Mediums are manual, root, Saba or scheduled items.
- **REGRESSION is not due:** `regression-last.json` = 2026-11-13 [K25]; next on or after 2026-11-16.

## 1. What B produced (the objects under test)
1. `retros/retro-510.md` (Georgian): §1 summary, §2 numbers, §3 FAIL/STOP table, §4 findings, §5 prevention, §6 Saba and screen, §7 consult conclusions and B rulings, §8 L46 rulings, §9 counters, §10 lessons, §11 systemic task, §12 proposals, §13 next.
2. **Data:** scripts in `b-round-509/` (`collect.py`, `cost.py`, `stage-sums.py`, `classify.py`, `deferred-added.py`, `deferred-closed.py`, `fails-detail.py`, `gate-reviews.py`, `l57-coverage.py`, `awaiting-user.py`, `retro510-deadlines.py`, `misc-outputs.sh`, `stops-head.sh`), inputs `b-round-509/backlog-retro-input.json` (v514) and `b-round-509/archive-findings-snapshot.json`, outputs `b-round-509/data/` (plus `stops-true.txt`, `l58-check-window.txt`, `ledger-check-window.txt`).
3. **Consults:** `b-round-509/consult-tech-lead.md`, `b-round-509/consult-product-designer.md`; inputs `b-round-509/consult-inputs.md`.
4. **Lessons:** `lessons.md` (before: `b-round-509/lessons-before-510.md`; diff `b-round-509/lessons-diff.txt`).
5. **New tool:** `tools/ledger-check.py` (L26).
6. **Saba / root:** `user-review/screen-review-510.md`, `user-review/questions-retro-510.md`.
7. **Backlog:** v515; `retro_runs` round 510; `systemic_tasks` DPG-BUTTON-CONTRACT-TABLE; `screen_review_candidates` SR-510-1; `open_findings` INFO-B510-CAPTURE-GAP; `retro_candidates` RC-R510-SKETCH-SCOPE [K18].
8. **Screens:** `b-round-509/screens/` (12 PNG, `screen510.json`, `capture.log`, `capture.mjs`) [K5] [K6] [K9].
9. **Board:** `feature-status.md` (round 509 accepted, round 510 line, RETRO 510 L46 line).

## 2. A: nothing to implement
A changes no file in `store/`. If A is invoked, it writes `a-round-510.md` with "RETRO round — no implementation" and exits.

## 3. C: what to verify
C writes `c-round-510.md` and `c-round-510.json` as it goes, plus `c-round-510/progress.json` after every row. Browser rows (2–4) go first.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r510 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G510-AUTH** (browser) | Fresh anonymous context at 1440×900 and 1280×720. Warm each page once untimed (L38). Open `/studio-lab`, `/studio/middle-east`, `/account/downloads`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `localStorage.auth_user` null; `/studio-lab` opens the demo workspace ("no sign-in required"); `/studio/middle-east` and `/account/downloads` show the sign-in requirement and **no** download link or stem URL; the token request is not 2xx and returns no URL. 0 page errors except the expected cloud console errors (cart / `ERR_CONNECTION_REFUSED`) |
| 3 | **STUDIO-SMOKE-510** (browser, real audio) | Both viewports, after `Demo collection ready`: add one library item with Enter; Play about 1.5 s, then Stop; open Export, choose WAV, export the entire project and save the download into `c-round-510/` | Clip count (distinct `[data-clip-id]` [K23]) 0 → 1; `arrangement-playback-state` testid [K23] reads `Playing`, then `Stopped`; the position readout advanced; the downloaded file is a RIFF/WAVE file whose PCM data has peak > 0 and RMS > 0 (C's own decode script, saved in `c-round-510/`). B's dry run [K26] (`b-round-509/probe/play-wav.mjs`, first library item, Space play/stop): 24-bit stereo 48 kHz, 101.352 s, peak 1.0, RMS 0.172 at both viewports; C's exported clip may differ, so only peak > 0 / RMS > 0 / bad = 0 are asserts, the rest is `record`. If the download cannot run, the row is FAIL with the reason, not PASS |
| 4 | **RT-SCREEN** (browser) | Recipe below the table | Line counts equal B's [K5]: 138/168/118/144, outside 97/124/86/101, ±2 per cell for status-line timing, each delta explained. Journey equals [K6]: `?preview=middle-east`, 3 clips at `left` 512/1152/1792, status names the fourth at 00:48.000 "(nearest free spot)" |
| 5 | **CLAIMS** | `bash b-round-509/claims-510.sh`, compared with `b-round-509/claims-510-planning-output.txt` | No `MISSING`, stderr empty. Differences allowed only where C's own work changes a value (expected: none), each explained. K10 may differ if root's optimizer rewrote `backlog.json`; the last B D-ID must still be D-29z1849 |
| 6 | **RT-NUM** | Re-run the scripts (§1 item 2) without touching B's files: copy them to `c-round-510/scripts/`, change only the **output** paths with `sed 's#b-round-509/data#c-round-510/data#g'` (the inputs `b-round-509/backlog-retro-input.json` and `archive-findings-snapshot.json` stay; `cost.py`/`stage-sums.py` then read C's own intermediate files), run them from the loop root, then `diff -r b-round-509/data c-round-510/data` (expected: only files B wrote by hand — `stops-true.txt`, `l58-check-window.txt`, `ledger-check-window.txt` — are absent in C's tree). Recompute every number in `retro-510.md` §1, §2, §4 and §9 from its named file, at least the list below | Every number matches its source. A number without a source is a finding (origin `B spec`) |
| 7 | **RT-CAUSE** | For each fact in §3, §5, §6, §7 and §8 open the quoted source, at least the list below | Each fact is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No invented cause |
| 8 | **RT-IDS** | [K18], `backlog.json` and the archive (`python3 -I tools/find-ids.py <loop root> <ID>`; root's optimizer may archive closed `open_findings` between B and C) | `retro_runs` has round 510; `retro_policy.next_due` names round 525; DPG-BUTTON-CONTRACT-TABLE `closes` has 18 ids, each found in `deferred_low_polish` (or archive) with a status starting "closes with systemic task DPG-BUTTON-CONTRACT-TABLE (D-29z1847)"; RC-R496-SKETCH-TEST-STRENGTH, RC-R499-L58-PLANNING-FAIL, RC-R507-SWAP-MUTANT start `adopted (D-29z1847)`; the four TLM ids of Q1 start `joined task SABA-DEVICE-CHECKS (D-29z1846)` |
| 9 | **RT-LESSONS** | `lessons.md` against `b-round-509/lessons-before-510.md` | ≤ 60 lines, ≤ 57,500 bytes, no line over 4,800 bytes [K7], three parts. The diff touches only the hunks of [K8]. Each change is one of E1–E6 in `edit-lessons.log`, T1 in `edit-lessons-2.log` or E7 in `edit-lessons-3.log`. E1–E3 wording equals `consult-tech-lead.md` §5 A–C, except E3/E7 name `tools/ledger-check.py`, add "5/11 in 495–509", "per input origin" and "greps open findings on touched files" (B's changes, stated in retro §10) |
| 10 | **RT-CHECKERS** | The L57/L58 loops and `tools/ledger-check.py` on tasks 496–509; `python3 -I tools/l58-check.py current-task.md` and `python3 -I tools/ledger-check.py current-task.md` | Equal [K15] [K16]: L57 15/15, L58 13/15 (INCOMPLETE 507, 508); ledger-check rc 1 on 498, 499, 500, 502, 503, 504, 507, 508, rc 0 elsewhere. Both checkers on this task: rc 0. Also the fixture test: in a new folder `c-round-510/ledger-test/` copy B's fixture `b-round-509/probe/ledger-test/task.md` and `b-round-509/probe/ledger-test/b-round-9999/sketch-9999.patch.txt` (one apply line naming the sketch; the sketch adds one `docs/implementation/x.md` line citing `ZZ9`), without the ledger; from **inside** `c-round-510/ledger-test/` (the tool resolves paths relative to the working directory) run the tool: no ledger → rc 1; `b-round-9999/doc-ledger.md` without `ZZ9` → rc 1; with `ZZ9` → rc 0. B's run: [K27] (`b-round-509/probe/ledger-test/`). Nothing is created outside `c-round-510/` |
| 11 | **RT-SABA** | `retro-510.md` §12, `screen-review-510.md`, `questions-retro-510.md` | Every rule change and screen item is information, a proposal or a question; nothing is presented as Saba's decision. Each question has a default. SR-510-1 is `awaiting_user` and moves no position |
| 12 | **RT-PRIMITIVES** | From `store/`, re-run the K21 commands and open each hit | Counts and lines equal [K21]; `b-round-509/primitive-staleness.txt` matches (0 commits on `.claude/primitives` since `3bcf8cb`) |
| 13 | **SOURCE-SCOPE** (end) + **L57** | As row 1, then `python3 -I tools/l57-check.py c-round-510.json c-round-510/l57-check.txt` | 0 lines and both rc 0; then rc 0 |

**RT-SCREEN run recipe:**
1. Check `http://127.0.0.1:5199/__mock/health`. If not ok, start `node mock-api/server.mjs` in the background and stop it afterwards by PID (`pkill -f` can match your own shell). Do not stop a mock that was already running.
2. Warm `/studio-lab` and `/products/middle-east` once in a browser.
3. From `store/`, run `node /home/runner/czaba-project/tmp/studio-real-loop/b-round-509/screens/capture.mjs /home/runner/czaba-project/tmp/studio-real-loop/c-round-510/screens`.
4. Open the PNGs that `screen-review-510.md` cites.

**RT-NUM, at least:**
- **Totals [K12]:** $294.02; B $230.74, A $52.68, C $10.60; B share 78.5 %; round median $19.39; B median $15.16; B min/max $6.74/$24.80; A average $5.67 (FAIL) / $3.07 (PASS); FAIL rounds $43.12; the top five (`data/cost.txt`).
- **Retro 495 comparison:** $247.20 from `retros/retro-495.md` §1; "+19 %" = 294.02/247.20; the B/A/C deltas from both files.
- **Stage sums** (`data/stage-sums.txt`): the twelve values of retro §2.
- **Verdicts [K13]:** PASS 12, FAIL [499, 507], BLOCKED [496]; published 11; `browserVerified` 12/15.
- **STOPs [K14]:** 496, 499, 505, 507. Also read the first 3 lines of each `a-round-N.md`, N = 495…509, and confirm by hand; confirm that `data/stops-head.txt` misses only 496. Counters met: 3 of 10 (retro §1, §9).
- **Findings:** C bugs 4 with severities (`data/fails-detail.txt`); new deferred 79, closed in window 3, and the prefix split (`data/deferred-added.txt`, `data/deferred-closed.txt`); classify categories (`data/classify.txt`); gate reviews 11 / 44 items (`data/gate-reviews.txt`).
- **Checkers [K15] [K16]; lesson sizes [K7]** (before 57,164 B, 60 lines, longest 4,753 B from `b-round-509/lessons-before-510.md`); **screen counts [K5].**
- **Doc ledger 5/11:** impl-doc paths in `gates/gate-round-N.json` for N = 495…509 and `ls b-round-(N-1)/doc-ledger.md`.

**RT-CAUSE, at least:**
- `a-round-496.md` l.3 and l.27–37; `a-round-499.md` l.3; `a-round-505.md` l.3; `a-round-507.md` l.1; `c-round-496.json`, `c-round-499.json`, `c-round-507.json`.
- `b-round-495/mutants.txt` l.1–8; `b-round-495/sketch-review.md` l.9; `b-round-498/sketch-review.md` l.10; `b-round-504/mutants-505.txt` l.7–8; `b-round-506/sketch-review.md` l.5 and l.10–13; `b-round-506/sketch-delta-v1-v2.diff.txt` l.17–42; `b-round-507/sketch-review.md` l.3, l.8–10.
- `a-round-509.md` "Deviations" 0–2 and `app/hooks/useAnalytics.ts` l.77 at `f5d1b9e` (dev 1).
- The B cost of 497/508/509 in `data/cost-rows.json` (tech-lead §3).
- The 18 ids of §11 against their `deferred_low_polish` titles.

## 4. Claims
`b-round-509/claims-510.sh` prints K1–K25; B's output is `b-round-509/claims-510-planning-output.txt` (stderr `claims-510-planning.err`, empty). Tags: [K1] gate, [K2] tree at planning, [K3] manifest size, [K4] protected once each, [K5] screen counts, [K6] journey, [K7] lesson size, [K8] lesson hunks, [K9] PNG count, [K10] backlog version and last D-ID, [K11] archive equal, [K12] cost, [K13] verdicts, [K14] STOPs, [K15] L57/L58, [K16] ledger-check, [K17] deferred, [K18] backlog ids, [K19] HEAD and status, [K20] manifests rc, [K21] primitive staleness, [K22] questions/placeholders, [K23] Studio selectors, [K24] this task's L57 row and L58, [K25] regression date, [K26] B's WAV dry run, [K27] ledger-check fixture.

## 5. After this round (D-29z1848)
- **Round 511:** REGRESSION if B plans on or after 2026-11-16 (B updates `regression-last.json` when it closes); otherwise **NONBRAND N2** (product page: PurchaseHeader in-card siblings Open in Studio / Downloads / Add to Cart / Buy Now radius + PlayStems; the sidebar was done in 509) under RC-R510-SKETCH-SCOPE (A writes tests and doc against B's site × attribute contract; L11 strengthen-only applies).
- Then N3–N9, the StemsPlayerModal pair (needs the stems half of ROOT-REQ-MOCK-STEMS-AND-FREE-FIXTURE), PD-R498-404-SECONDARY-ALIGN, DPG-BUTTON-CONTRACT-TABLE, the rest of DPG P1, the DP gate, P2; then STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, STUDIO-PERFORMANCE remainder, STEM-LANES, T12-ADVANCED and the phase-2 entries.
- **RETRO 525** counters: `retro_policy.signals_for_next_retro[0]`.
