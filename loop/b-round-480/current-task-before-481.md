# Round 480: RETRO 480 (twentieth retrospective, rounds 465–479; trigger: 15 rounds since RETRO 465) + whole-screen and journey review. No app code. A: nothing to implement. C: checks that the retro is traceable, plus the auth guard, a short Studio smoke test and the screen capture in the browser

**Planned by:** B, at the round 479 → 480 planning, 2026-11-12 (planning started 22:43Z; `b-round-479.md`, `b-round-479/checkpoint.md`). The advisor was available and was consulted after orientation and before hand-off. The round-479 task is archived as `tasks/round-479.md`, a byte-identical copy [K15].

## Decisions
All are in `backlog.json` (v466 → v469) under `decisions_log_b` [K10].
- **D-29z1700: round 479 accepted.** C PASS (`c-round-479.json`, 0 bugs, `browserVerified`/`realVerified` true); gate 479 published `bbb3193` [K1]. DPG-FOOTER-LINKS is C-verified and waits for the DP gate. Gate finding 1 becomes the open Medium GATE479-M1-ROUTE-ANNOUNCE.
- **D-29z1701: round-479 rulings.** Seven Lows deferred (incl. B-R479-LEADMAGNET-TIMER-CLIENT-NAV, a Saba question); `ArrangementLibraryMenu.tsx:131` ruled out; SIG-R479-INTERNAL-LINK-WRAPPER.
- **D-29z1702: order.** Round 480 = RETRO 480; round 481 = REGRESSION-2026-11-13 (not due at this planning: `regression-last.json` 2026-11-10 [K13]).
- **D-29z1703: RETRO data**, window 465–479.
- **D-29z1704: GATE479-M1-ROUTE-ANNOUNCE ruling** and the post-regression order.
- **D-29z1705: L46 rulings and screen** → `user-review/questions-retro-480.md` Q1–Q7 [K22]; SR-480-1…3; FIREFOX-CHECKS, SAFARI-CHECKS, HIREUS-EMAIL-CLIENTS opened as blocked tasks.
- **D-29z1706: lessons, candidate rulings, systemic task, counters for RETRO 495.**
- **D-29z1707: advisor closing-check corrections** (single-runner counter 1×, non-blocking class of the three new tasks, four more inputs ruled, staleness check widened to fonts, L47 clause "once an announcer exists").

## Rules
- **Policy:** "Retrospective: stop, look back, improve" (2026-10-26), "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28), the RETRO journey step (2026-10-31), DPG process rule 5 (primitive staleness at RETRO, 2026-11-12), and `backlog.json` → `retro_policy`.
- **Read `lessons.md` first.** This planning changed it; the hunks are in [K18] and `b-round-479/lessons-diff.txt`.
- **L57 / L22:** C's JSON carries all L57 fields. Each is `null` with the reason "RETRO: no assert specified", except `gateChecksNamed` and the four manifest fields. Every bug carries an enum `origin`. Before hand-off, C runs `python3 -I tools/l57-check.py c-round-480.json c-round-480/l57-check.txt` and gets rc 0.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. The only facts about `store/` are HEAD, the tree, the manifest, the protected list, the primitive counts and lines, the Header link count, the root.tsx Studio guard and the routes without `meta` [K1] [K2] [K3] [K4] [K19] [K25] [K26] [K30] [K31] [K32] [K33].
- **L59 / L60:** run every row until it has a result, browser rows first. Write `c-round-480/progress.json` after each row. Destructive commands stay inside `c-round-480/`.
- **Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step and the screen budget. Nothing visible changes.

## Baseline: HEAD `bbb3193`, clean tree
- **Gate:** gate 479 published `bbb3193…` on both remotes [K1]. `context/head-sha.txt` may be stale (it said `75a6028` at planning); `git rev-parse HEAD` is the truth.
- **Tree:** at planning, `git status --short --untracked-files=all` was empty and HEAD was `bbb3193` [K2] [K19].
- **Frozen files:** every tracked file is in `b-round-479/r480-tree-sha256.txt`, **1,391** entries [K3]. Check from `store/` with `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-479/r480-tree-sha256.txt`; B got rc 0 [K25]. Each of the 11 protected files in `b-round-318/protected-sha256.txt` appears exactly once [K4], and that file also checks rc 0 [K25].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **The RETRO is due:** `retro_policy.next_due` named round 480 (D-29z1640).
- **Nothing blocks a code-free round.** No Critical or High finding is open. The open Mediums are manual, root, Saba or scheduled items, plus GATE479-M1 (ruled D-29z1704; it is scheduled after the regression and does not need this round).
- **REGRESSION is not due:** `regression-last.json` says 2026-11-10 [K13] and planning started 2026-11-12T22:43Z. It is round 481.

## 1. What B produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-480.md` | Georgian analysis for Saba, 13 sections, window 465–479 |
| `lessons.md` | [K7]. Before-copy `b-round-479/lessons-before-480.md`; diff `b-round-479/lessons-diff.txt` [K18]. Lesson ids unchanged [K12] |
| `user-review/screen-review-480.md` | Line counts equal 465's; SR-480-1…3. Captures in `b-round-479/screens/`: `capture.mjs`, `capture.log`, `screen480.json`, `compare.py`, `compare-465.txt`, 12 PNGs [K5] [K6] [K9] |
| `user-review/questions-retro-480.md` | Q1–Q7, each with a default [K22] |
| `b-round-479/consult-tech-lead.md`, `consult-product-designer.md`, `consult-inputs.md` | Consult inputs and returned reports |
| `b-round-479/primitive-staleness.txt` | The primitive teal and font counts, B's reading of each hit, and the SIG-R477 doc counts [K26] [K32] [K33] |
| `b-round-479/*.py`, `misc-outputs.sh`, `stops-head.sh`, `data/*` | The scripts and data behind every number |
| `backlog.json` (v469) | D-29z1700…D-29z1707 and the ids of [K24]. Before-copies `b-round-479/backlog-before-480.json` (before acceptance), `backlog-before-retro.json` and `backlog-before-fix.json`. Edit scripts `update-backlog-accept.py`, `update-backlog-retro.py`, `update-backlog-fix.py`, each with a `.done` marker. Retro input `b-round-479/backlog-retro-input.json` (v467) [K23] |
| `feature-status.md` | Round 479 result; the RETRO 480 row; the RETRO 480 manual list at the top of §5. Before-copy `b-round-479/feature-status-before-480.md` |

**Order of work for the scripts:**
1. Copy `b-round-479/*.py` (except `update-*.py` and `edit-lessons*.py`), `misc-outputs.sh` and `stops-head.sh` to `c-round-480/scripts/`. Rewrite every `b-round-479/data/` output path to `c-round-480/data/`, keeping the inputs `b-round-479/backlog-retro-input.json` and `archive-findings-snapshot.json`. Run from the loop root.
2. Run order:
   1. `collect.py` (stdout = `collect.txt`; writes `rounds-465-479.json`);
   2. `cost.py` (stdout = `cost.txt`; writes `cost-rows.json`);
   3. `classify.py`, `fails-detail.py`, `gate-reviews.py`, `l57-coverage.py`, `manifest-fields.py`, `exp-fields.py`, `awaiting-user.py`, `retro480-deadlines.py`, `deferred-added.py` (each stdout = `<name>.txt`);
   4. `stage-sums.py`;
   5. `misc-outputs.sh c-round-480/data`;
   6. `stops-head.sh > c-round-480/data/stops-head.txt`.

   `cmp` each output with B's file of the same name; any difference is a finding. The data scripts read only `c-round-465.json` … `c-round-479.json` (and their result files), the retro input and the archive snapshot, so C's own `c-round-480.json` cannot change them.
3. Loops: `l57-check-window.txt` = `tools/l57-check.py c-round-N.json /dev/null`, last line, N = 465…479. `l58-check-window.txt` = `tools/l58-check.py tasks/round-N.md`, last line, N = 466…479. Re-run both and `cmp`.
4. **Do not run** `update-backlog-*.py`, `update-feature-status.py` or `edit-lessons*.py` (four lesson scripts). Their `.done` markers make them refuse.

## 2. A: nothing to implement
A writes `a-round-480.md` with one line: "RETRO round, no implementation." **STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-480.md` and `c-round-480.json` as it goes, plus `c-round-480/progress.json` after every row. Browser rows (2–4) go first.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r480 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G480-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720: open `/studio-lab`, then `/studio/middle-east` (warm both first with one untimed browser load, L38), then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `localStorage.auth_user` is null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake-bearer premium path: BLOCKED (backend unavailable in cloud) |
| 3 | **STUDIO-SMOKE-480 (browser)** | Both viewports, after `Demo collection ready`: add one library item with Enter; Play about 1.5 s, then Stop; open Export, then close it | The clip appears; the position advances and then stops; the dialog opens and closes. Screenshots under `c-round-480/` |
| 4 | **RT-SCREEN (browser)** | Check `http://127.0.0.1:5199/api/products`; if it is not 200, start `node mock-api/server.mjs` in the background and stop it afterwards (by PID; `pkill -f` can match your own shell). Run `b-round-415/screens/warmup.mjs` from `store/`. Then, from the loop root, run `node <abs>/b-round-479/screens/capture.mjs <abs c-round-480/screens>`, and open the PNGs `screen-review-480.md` cites | Line counts equal B's [K5]: 138/168/118/144, outside 97/124/86/101; ±2 per cell for status-line timing, each delta explained. The journey: 3 clips at `left` 512 / 1152 / 1792, and the status names the fourth at 00:48.000 "(nearest free spot)" [K6]. Each SR-480-n statement matches its PNG: Store header "CZABA" brass vs Studio "← CZABA" in the text colour (SR-480-1; record the computed `color` of both); the play button over the cover's brand mark (SR-480-2); the bordered "Demo collection — no sign-in required" box (SR-480-3; record the computed `border-top-width`) |
| 5 | **CLAIMS** | `bash b-round-479/claims-480.sh` compared with `b-round-479/claims-480-planning-output.txt` | No `MISSING`; stderr empty. Differences only where C's own work changes a value (expected: none), each explained. K10 may differ if root's optimizer rewrote `backlog.json`; check that the last D-ID is still D-29z1707 |
| 6 | **RT-NUM** | Re-run the scripts (§1) and `cmp`. Recompute every number in `retro-480.md` §1, §2, §4 and §9 from its named file, at least the list below | Every number matches its source. A number without a source is a finding (origin `B spec`) |
| 7 | **RT-CAUSE** | For each fact in §3, §5, §6, §7 and §8, open the quoted source, at least the list below | Each fact is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No invented cause |
| 8 | **RT-IDS** | [K24]; in `backlog.json`: `retro_runs` round 480; `retro_policy.next_due` names round 495; every RETRO480-* and RC-R47x entry in `retro_candidates` has a status starting `ruled (D-29z1706)` (RETRO480-SINGLE-RUNNER-CONTROL then says "still 1x", D-29z1707); FIREFOX-CHECKS starts `open_root`, SAFARI-CHECKS and HIREUS-EMAIL-CLIENTS start `open_tech_lead_manual`; FIREFOX-CHECKS, SAFARI-CHECKS and HIREUS-EMAIL-CLIENTS each list the TLM ids that retro §8 names | All present, with the status the retro states |
| 9 | **RT-LESSONS** | `lessons.md` against `b-round-479/lessons-before-480.md` | ≤ 60 lines and ≤ 57,500 bytes [K7], three parts. The diff touches only the hunks of [K18]. Each change is the one retro §10 describes: removed text is evidence or explanation only (no finding id disappears; the only id that leaves is D-29z1639, the RETRO 465 note in the l.3 pointer, kept in the before-copy; compare the id lists, `b-round-479/lesson-finding-ids.txt`), and added clauses are word for word those quoted in retro §10. Read `edit-lessons.log` and `edit-lessons-2.log` for the exact removed spans. l.3 is a pointer that names `retro-480.md`, `465–479` and `b-round-479/lessons-before-480.md` |
| 10 | **RT-CHECKERS** | The L57 and L58 loops (§1.3); `python3 -I tools/l58-check.py current-task.md` [K28] | The loops equal B's files: L57 OK 10/15 (INCOMPLETE 469, 470, 472, 475, 477); L58 OK 13/14 (471 INCOMPLETE) [K21]. l58 on this task gives rc 0 |
| 11 | **RT-SABA** | `retro-480.md` §12, `screen-review-480.md`, `questions-retro-480.md` | Every rule change and screen item is information, a proposal or a question; nothing is presented as Saba's decision. Each question has a default. Q2 states that LeadMagnet is on the keep-list and its behaviour is unchanged until Saba answers. Q3/Q4 state which task opens and what blocks it |
| 12 | **RT-PRIMITIVES** | From `store/`, re-run the K26, K32 and K33 commands and open each hit | Counts and lines equal [K26] [K32] [K33]. B's reading in `b-round-479/primitive-staleness.txt` matches each hit (teal: DESIGN_TOKENS l.9 and l.108 stale, l.26 inline example; TAILWIND_FIRST l.15 and l.18 bad-example hex; DESIGN_SYSTEM l.1536 changelog. Fonts: DESIGN_TOKENS l.57–59, TAILWIND_FIRST l.101/105 and DESIGN_SYSTEM l.750–761 name Playfair Display / Inter while app.css l.113–115 has Instrument Sans / IBM Plex Mono) |
| 13 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-480.json` | 0 lines and both rc 0; then rc 0 |

**RT-NUM, at least:**
- **Totals [K16]:** $214.36; B $133.40, A $68.69, C $12.27; B share 62.2 % [K29].
- **Medians and averages (`data/cost.txt`):** round $15.29; B $9.38; B min/max 1.95/13.45; A average FAIL 4.90, PASS 4.43; FAIL rounds $60.45 and the top five.
- **Stage sums (`data/stage-sums.txt`):** the nine stage values of retro §2.
- **Retro 465 comparison:** $282.31, $20.25 and 71.7 % come from `retros/retro-465.md` §1/§2; "24 % cheaper" = 1 − 214.36/282.31.
- **Verdicts [K20]:** 10 PASS, FAIL [466, 471, 472, 476], BLOCKED [469], gate skipped [465, 466, 468, 469, 471, 472, 476], `browserVerified` 13/15.
- **STOPs [K17]:** 466, 471, 472, 475, 476 (`data/stops-head.txt` and `data/stops-count.txt`). Also read the first 3 lines of each `a-round-N.md`, N = 465…479, and confirm the five by hand.
- **Findings:** C bugs 11 with severities (`data/fails-detail.txt`); new deferred 43 and its split by method (a 43, b 36, c 40) and prefix (`data/deferred-added.txt`); 7 of the 43 carry `added` "2026-11-12 B round 479 -> 480 planning"; classify window open 6, deferred 31, archive 8 (`data/classify.txt`).
- **Gate reviews:** 8 reviews, 35 items: low 15, info 6, unlabelled 13, medium 1 (`data/gate-reviews.txt`).
- **Checkers:** L57 10/15; L58 13/14.
- **Fix-up chains (retro §4):** 466→467, 469→470, 471→472→473, 476→477, from `data/task-titles.txt`.
- **Lesson sizes [K7] [K14]:** after 57,487 B; before 59,870 B (`b-round-479/lessons-before-480.md`), L23 4,622 and L58 5,400 (bytes of the line without its newline; `wc -c` on `grep -m1` adds 1).
- **Screen counts [K5].**

**RT-CAUSE, at least:**
- 466: `a-round-466.md` l.3–4 and `c-round-466.json` (C-R466-01);
- 469/470: `c-round-469.json` (C-R469-01) and `tasks/round-470.md` "Why we missed it";
- 471: `a-round-471.md` l.3, `c-round-471.json` (C-R471-01), `backlog.json` RC-R471-L58-SKIPPED;
- 472: `a-round-472.md` l.3 and `c-round-472.json` (C-R472-01), RC-R472-DOC-GRANT-LINES;
- 475: `a-round-475.md` l.3 and `c-round-475.json` (C-R475-01), RC-R475-STOP-CLAUSE;
- 476: `a-round-476.md` l.3 and `c-round-476.json` (C-R476-STOP-R1);
- 479 gate Medium: `gates/round-479/review.md` finding 1; the Header link count at `75a6028`, the root.tsx Studio guard and the routes without `meta` [K30] [K31];
- the Saba-found issues: `tasks/round-468.md` l.62–65 and the L18 "Scroll frames" clause; the SABA-B-16 status in `backlog.json`;
- the consults: `b-round-479/consult-tech-lead.md` and `consult-product-designer.md`.

## 4. Claims
The script is `b-round-479/claims-480.sh`. B's run is saved in `b-round-479/claims-480-planning-output.txt`, with stderr in `b-round-479/claims-480-planning.err` (empty).

| Claim | What it checks |
|---|---|
| K1 | Gate 479 |
| K2 | The tree at planning |
| K3 | The manifest count |
| K4 | Each protected file appears once in the manifest |
| K5 | Screen line counts |
| K6 | Journey clips |
| K7 | `lessons.md` lines and bytes |
| K8 | Every artifact in `b-round-479/cited-artifacts.txt` exists |
| K9 | PNG count |
| K10 | Backlog version and last D-ID |
| K11 | l57 check on `c-round-479.json` |
| K12 | Lesson ids equal the before-copy |
| K13 | Regression date |
| K14 | L23, L58, L29 and L37 byte counts |
| K15 | The archived task equals B's copy |
| K16 | Cost medians and totals |
| K17 | STOP rounds (new and old method) |
| K18 | Lessons diff hunks |
| K19 | HEAD and status now |
| K20 | Fail, blocked, gate-skipped and browser counts |
| K21 | l58-check on tasks 466–479 |
| K22 | The questions file has 7 questions |
| K23 | The retro input is v467 |
| K24 | New ids, `retro_runs` 480, `next_due` |
| K25 | r480 manifest and protected manifest rc |
| K26 | Primitive teal counts |
| K27 | Installed Playwright browsers (the Q3 premise) |
| K28 | l58-check on this task |
| K29 | B share |
| K30 | Header `<Link>` count at `75a6028`; root.tsx `isStudioPage` lines; root.tsx `meta` count |
| K31 | `meta` count in the 7 routes retro §7 names |
| K32 | Teal hit lines in the 3 primitive/design files |
| K33 | Font hit lines; DESIGN_SYSTEM l.750–761; app.css l.113–115 |

## 5. After this round (D-29z1704)
1. **Round 481:** REGRESSION-2026-11-13, with any `scope_additions` from `regression_rounds`.
2. Then GATE479-M1-ROUTE-ANNOUNCE (ruling D-29z1704) and B-R478-DEAD-MUSIC-LINK (`account.orders` only).
3. Then DPG-BUTTON-CLEANUP and the rest of DPG P1, the DP-gate findings when root publishes them, SYS-R465-DEAD-CSS-MATCHER, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2 under the skip rule.
4. **STEM-LANES** jumps ahead as soon as Saba answers AGREE-STEM-LANES.
5. **Next RETRO:** round 495.
