# Round 420: RETRO 420 (sixteenth retrospective, rounds 416–419; trigger: end of STUDIO-PERFORMANCE) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 419 → 420 planning, 2026-11-09 (`b-round-419.md`). The round-419 task is archived as `tasks/round-419.md` [K15].

## Decisions
Recorded in `backlog.json` (v395 → v396) under `decisions_log_b` [K10].
- **D-29z1462: round 419 is accepted.** C PASS in `c-round-419.json` (8 rows; `browserVerified`/`realVerified` true; 0 bugs). Gate 419 published `6609dfa` [K1]. SYS-R369-STEM-CACHE-WRITE-COORDINATOR is done; its 8 Lows and TL-R419-L1 are closed. R419-CR-1 → `deferred_low_polish` as A-R419-REVIEW-CR-1-SWEEP-CANCEL-CHECK. The A-419 architecture note → SIG-R419-STEM-CACHE-STORE-COORDINATOR-MODULE (signal, not scheduled).
- **D-29z1463: STUDIO-PERFORMANCE has no loop-runnable stage left** → `loop_complete_remainders_parked`, remainders with deadline RETRO 435. The 2026-10-26 rule (RETRO at the end of each queue entry, whichever comes first) makes this round RETRO 420.
- **D-29z1464: STEM-LANES waits for Saba.** `user-review/AGREE-STEM-LANES.md` and `youtube-request.json` [K24] are written; the Q2 premise "the Stems group already exists" is false at HEAD [K23]. Frontend-architect checkpoint ARCH-CHECKPOINT-STEM-LANES requested of root. GATE368-L3 stays deferred (tech-lead).
- **D-29z1465: RETRO outputs** (§1). **D-29z1466: order after this round** (§5).

## Rules
- **Policy:** "Retrospective: stop, look back, improve" (Saba, 2026-10-26); "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28); the RETRO journey step (2026-10-31); `backlog.json` → `retro_policy`.
- **Window: 416–419** (4 rounds). Report: `retros/retro-420.md`.
- **Read `lessons.md` first.** This planning changed l.3 and L7 (l.12) [K18]; L7's new clause applies from this round.
- **L57 and L22:** C's JSON carries all L57 fields. Every field except `gateChecksNamed` and the four manifest fields is `null` with the reason "RETRO: no assert specified". Every bug carries an `origin`. Before hand-off C runs `python3 -I tools/l57-check.py c-round-420.json`.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. The only facts about `store/` are HEAD, the tree, the manifest and the route facts of [K23] [K2] [K3] [K19].
- **L59, L60:** run every row until it has a result; browser rows first; write `c-round-420/progress.json` after each row; destructive commands stay inside `c-round-420/`.
- **Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step and the screen budget. Nothing visible changes. The AGREE note is an output for Saba, not a dispatched feature.

## Baseline: HEAD `6609dfa`, clean tree
- **Gate:** gate 419 published `6609dfa…` on both remotes [K1]. `context/head-sha.txt` may still show `3579fcc` (pre-gate snapshot); `git rev-parse HEAD` is the truth.
- **Tree:** `git status --short --untracked-files=all` was empty at planning, HEAD `6609dfa` [K2] [K19].
- **Frozen:** every tracked file, **1,319** entries, is in `b-round-419/r420-tree-sha256.txt` [K3]. Check from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-419/r420-tree-sha256.txt`. B ran it at planning: rc 0. Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round. Pending root work: none.

## 0. Why this round
- **The RETRO is due** by the end-of-entry clause (D-29z1463; `tech-lead`: yes, `b-round-419/consult-tech-lead.md` item 1).
- **Nothing blocks a code-free round.** No Critical/High is open; the open Mediums are root-only, manual or `awaiting_user` (2026-10-23 clarification).
- **REGRESSION is not due yet:** `regression-last.json` says 2026-11-07 [K13]; due at the first planning on or after 2026-11-10 (the next planning).

## 1. What B produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-420.md` | Georgian analysis for Saba, 13 sections, window 416–419 |
| `lessons.md` | **60 lines** [K7]. Before-copy `b-round-419/lessons-before-420.md`, diff `b-round-419/lessons-diff.txt`, hunks `3c3` and `12c12` [K18]. Lesson ids unchanged [K12]. L58 unchanged [K14] |
| `user-review/screen-review-420.md` | Nothing worse than 416; SR-420-1, SR-420-2. Captures in `b-round-419/screens/`: `capture.mjs`, `capture.log`, `screen420.json`, 12 PNGs [K5] [K6] [K9] |
| `user-review/AGREE-STEM-LANES.md`, `youtube-request.json` | STEM-LANES questions Q1–Q5 for Saba; 6 search queries [K24]; LIVE-MEAS-STEM-DROP still unmeasured [K25] |
| `b-round-419/consult-tech-lead.md`, `consult-product-designer.md`, `consult-inputs.md` | The consult inputs and the returned reports |
| `b-round-419/root-request-arch-checkpoint-stem-lanes.md` | ARCH-CHECKPOINT-STEM-LANES, three questions |
| `b-round-419/*.py`, `misc-outputs.sh`, `data/*` | Scripts and data behind every number |
| `backlog.json` (v396) | D-29z1462…D-29z1466 and the ids of [K22]. Before-copy `b-round-419/backlog-before-420.json`; edit script `b-round-419/update-backlog.py` (+ `.done`) |
| `feature-status.md` | Round 419 done; RETRO 420 row; STUDIO-PERFORMANCE and STEM-LANES rows |

**Order of work (C-R215-01, RC-R336-SCRIPT-OUTPUT-DIR):**
- The analysis scripts read the **before** copy `b-round-419/backlog-before-420.json` and write to `b-round-419/data/` by default. **Copy them to `c-round-420/scripts/` first**, rewrite every `b-round-419/data/` output path to `c-round-420/data/`, run them there and `cmp` against B's outputs.
- Run order: `collect.py` (writes `rounds-416-419.json`), then `cost.py` (stdout = `cost.txt`; it writes `cost-rows.json`), then the others; `misc-outputs.sh c-round-420/data`.
- **Do not run** `update-backlog.py` or `edit-lessons.py` (their `.done` markers make them refuse).
- `cost.py`'s `gate` line was made order-stable (sorted) by B after the first run; the numbers did not change.

## 2. A: nothing to implement
A writes `a-round-420.md` with one line: "RETRO round, no implementation." **STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-420.md` and `c-round-420.json` as it goes, plus `c-round-420/progress.json` after every row. Browser rows (2–4) first.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r420 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G420-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720: open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `localStorage.auth_user` null and the workspace opens; "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake-bearer premium path: BLOCKED (backend unavailable in cloud) |
| 3 | **STUDIO-SMOKE-420 (browser)** | Both viewports after `Demo collection ready`: add one library item with Enter; Play about 1.5 s, then Stop; open Export and close it | Clip appears; position advances then stops; dialog opens and closes. Screenshots under `c-round-420/` |
| 4 | **RT-SCREEN (browser)** | Open the PNGs `screen-review-420.md` cites and check they show what it says. Check `http://127.0.0.1:5199/api/products`; if not 200 start `node mock-api/server.mjs` in the background. Run `b-round-415/screens/warmup.mjs` from `store/` first (cold dev server), then `node <abs>/b-round-419/screens/capture.mjs <abs c-round-420/screens>` from the loop root | Line counts equal B's [K5]: 138/168/118/144 and outside 97/124/86/101 (±2 per cell allowed for status-line timing, each delta explained); the journey shows the stems one after another on one lane: 3 clips in view at `left` 512 / 1152 / 1792 and the status naming the fourth (Melody) at 00:48.000 "(nearest free spot)" [K6]; the review's statements match the PNGs |
| 5 | **CLAIMS** | `bash b-round-419/claims-420.sh` compared with `b-round-419/claims-420-planning-output.txt` | No `MISSING`; stderr empty; differences only where C's own work changes a value (expected: none), each explained |
| 6 | **RT-NUM** | Re-run the scripts (§1) and `cmp` outputs. Recompute every number in `retro-420.md` §1, §2, §4 and §9 from its named file; at least the list below | Every number matches its source; a number without a source is a finding (origin B) |
| 7 | **RT-CAUSE** | For each fact in §5, §7 and §8 open the quoted source; at least the list below | Each fact is in its source; each opinion is labelled as `tech-lead`'s or `product-designer`'s; no invented cause |
| 8 | **RT-IDS** | `backlog.json`, the ids of [K22] | All present with the stated status |
| 9 | **RT-LESSONS** | `lessons.md` vs `b-round-419/lessons-before-420.md` | ≤ 60 lines, three parts; diff only l.3 and l.12; l.12 keeps the old L7 evidence sentence and adds exactly the `confirmedBy` clause and the round-418 evidence; l.3 changes only the pointer (`retro-420.md`, `416–419`) and appends the RETRO 420 sentence |
| 10 | **RT-CHECKERS** | `python3 -I tools/l57-check.py c-round-419.json` [K11]; `python3 -I tools/l58-check.py current-task.md` [K28]; `tools/l58-check.py tasks/round-{417,418,419}.md` [K21] | l57 rc 0; l58 on this task rc 0 ("no sketch"); the window values equal [K21] |
| 11 | **RT-SABA** | `retro-420.md` §12, `screen-review-420.md`, `AGREE-STEM-LANES.md` | Every rule change and screen item is information, a proposal or a question; nothing is presented as Saba's decision; the AGREE note names the false premise and gives each question a default; the cost-counter change is labelled a loop counter, not a project rule |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-420.json` | 0 lines, both rc 0; then rc 0 |

**RT-NUM, at least:** totals $63.35, B $45.81, A $14.77, C $2.77 [K16]; B share 72.3 % and 67.9 % without round 416 [K16]; medians round $15.51, B $11.74; A PASS avg $3.69; per-round 13.06 / 15.32 / 19.27 / 15.70; PASS 4, FAIL none, gate skipped [416] [K20]; `browserVerified` 4/4 [K20]; STOP rounds none [K17]; 6 C Lows and their origins (`data/manifest-fields.txt`); deferred Lows in window 15 (A 7, C 4, gate 4) and categories (`data/classify.txt`); gate reviews 417 0, 418 8.5/4, 419 9/4 (`data/gate-reviews.txt`); L57 4/4 (`data/l57-coverage.txt`); the retro-416 comparison values (round 18.97, B 13.85, A PASS 5.53; `retros/retro-416.md` §2 and `b-round-415/data/cost.txt`).

**RT-CAUSE, at least:** `c-round-417.json` (C-R417-L58-SKETCH-REVIEW-MISSING) and K21 for 417; `c-round-418.json` (C-R418-*); `a-round-419.md` (R419-CR-1, architecture note); `b-round-419/consult-tech-lead.md` items 1, 2, 4, 6; `b-round-419/consult-product-designer.md` Part A; [K23] for the Stems-is-a-track fact; `backlog.json` STUDIO-PERFORMANCE stages for §8.

## 4. Claims (`b-round-419/claims-420.sh`; B's run: `b-round-419/claims-420-planning-output.txt`, stderr `b-round-419/claims-420-planning.err`)
K1 gate 419 · K2 tree at planning · K3 manifest count · K4 protected files in manifest · K5 screen line counts · K6 journey clips · K7 lessons lines · K8 cited artifacts exist · K9 PNG count · K10 backlog version/last D-ID · K11 l57 on c-round-419 · K12 lesson ids · K13 regression date · K14 L7/L58 bytes · K15 archive equal · K16 cost totals and shares · K17 STOP rounds · K18 lessons diff hunks · K19 HEAD + status now · K20 fail/blocked/gate-skipped/browser · K21 l58-check on tasks 417–419 · K22 backlog ids · K23 fixed tracks in the `/studio-lab` route file and no group in the route or the demo data file · K24 youtube request · K25 LIVE-MEAS-STEM-DROP request and no measurement file · K28 l58-check on this task.

## 5. After this round (D-29z1466)
421 REGRESSION-2026-11-10 if due at that planning (on or after 2026-11-10), else SYS-R418-PREVIEW-LIFECYCLE first and REGRESSION at the first planning on or after 2026-11-10 → SYS-R418-PREVIEW-LIFECYCLE → STEM-LANES S1…S4 once Saba answers AGREE-STEM-LANES (if not yet: SYS-1…3, then STORE-2b…5; STEM-LANES first when the answer arrives) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 (skip rule). Next RETRO round 435.
