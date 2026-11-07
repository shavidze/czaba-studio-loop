# Round 385: RETRO 385 (thirteenth retrospective, rounds 369–384) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 384 → 385 planning, 2026-11-07 (`b-round-384.md`).

**Decisions** (`backlog.json` v350 → v352, `decisions_log_b`):
- **D-29z1285: round 384 accepted.** C PASS (`c-round-384.json`: 13 rows; `browserVerified` and `realVerified` both true). Gate 384 published `7295618` (rounds 382–384).
  - **PERF-13b-i is done.**
  - Closed: C-R382-01 (Medium) and B-R383-AUTH-ROW-BARE-URL.
- **D-29z1286: gate-384 review routed.**
  - Suggestion 1 → **GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION (Medium)**.
  - Suggestions 2–4 → GATE384-L2/L3/L4.
  - The architecture note → signal SIG-R384-USE-DECODED-SOURCES-HOOK.
  - TL-R376-M1 closed as stale-open: it was fixed and passed in round 377.
- **D-29z1287 / D-29z1291: order.**
  - Round 385 = this RETRO.
  - Round 386 = GATE384-M1 + A-R383-REVIEW-L1, both in `ensureDecoded`.
  - Then REGRESSION-2026-11-08, then PERF-13b-ii, and onward.
- **D-29z1288: RETRO outputs.**
- **D-29z1289: lessons and retro candidates.**
- **D-29z1290: deadline dispositions.** ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING goes to Saba. SYS-R385-LEAF-ACTIONS-CONTEXT is added as `awaiting_user`. ROOT-REQ-L57-CHECK-PROGRESS is filed.
- **D-29z1292:** `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07. Nothing new in them to carry.

**Rules:**
- **Policy:**
  - "Retrospective: stop, look back, improve" (Saba, 2026-10-26);
  - "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28);
  - the RETRO journey step (2026-10-31);
  - `backlog.json` → `retro_policy`.
- **Window:** 369–384 (16 rounds). Older ids "RETRO 384" / `RETRO-384` refer to this retro. Its file is `retros/retro-385.md`; there is no `retro-384.md`.
- **Read first: `lessons.md`.** This planning revised it, and the revision applies from round 385: l.3, L29, L31, L58 and L59 each gained one clause.
  - **C reads L59's new clause:** run the heaviest rows first. A BLOCKED-for-time JSON carries `progressFile` and `stopSignal`.
- **L57:** C's JSON carries **all** L57 fields.
  - Every field except `gateChecksNamed` and the four manifest fields is `null`, with the reason "RETRO: no assert specified".
  - `gateChecksNamed` lists the gate rows below.
  - Before hand-off, C runs `python3 -I tools/l57-check.py c-round-385.json c-round-385/l57-check.txt` and fixes its own JSON until it exits 0.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. Every fact about a `store/` file carries a `[K#]` tag (§7).
- **L59, L60:**
  - run every row until it has a result;
  - write `c-round-385/progress.json` after each row;
  - destructive commands stay inside `c-round-385/`.

**Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step, the YouTube request and the screen budget. Nothing visible changes.

## Baseline: HEAD `7295618`, clean tree
- **Gate:** gate 384 published `7295618…` on both remotes [K1].
- **Tree:** `git status --short --untracked-files=all` was empty at planning, with HEAD `7295618` [K2] [K19].
- **Frozen:** every tracked file, **1,280** entries, is listed in `b-round-384/r385-tree-sha256.txt` [K3].
  - Check it from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-384/r385-tree-sha256.txt`. B ran it at planning: rc 0.
  - Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round.

## 0. Why this round
- **RETRO is overdue by one round.** `retro_policy.next_due` was round 384. Round 384 had to finish the C-R382-01 evidence first.
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-05 [K13]; the next one is due at the first planning on or after 2026-11-08.
- **One new Medium: GATE384-M1.** It is a gate-review finding:
  - the problem is an unhandled rejection if `syncPlayback` throws inside `ensureDecoded` [K22];
  - it is not a security or data-loss bug, and it is not reproduced in a browser.
  - **This round changes no code, so the Medium is fixed in round 386** (D-29z1287).
- **The other open Mediums** are root-only, manual or `awaiting_user`, as at retro 369. They do not block (2026-10-23 clarification).

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-385.md` | The analysis, in Georgian with English terms, for Saba. Window 369–384, 13 sections |
| `lessons.md` | **60 lines** [K7]. Before-copy: `b-round-384/lessons-before-385.md`. Diff: `b-round-384/lessons-diff.txt`. Five lines change: l.3, L29 (l.18), L31 (l.20), L58 (l.41) and L59 (l.59) [K18] |
| `user-review/screen-review-385.md` | No new candidates. One question for Saba: Q-SR-385-1. Captures are in `b-round-384/screens/`: `capture.mjs`, `warmup.mjs`, `capture.log`, `screen385.json`, `compare-369-385.txt` and 12 PNGs [K5] [K6] [K9] |
| `user-review/questions-arch-leaf-plumbing.md` | The L46 question to Saba: A / B / B-actions, with the default |
| `b-round-384/*.py`, `*.sh`, `data/*` | The scripts and data behind every number. `data/retro-numbers-385.txt` is produced by `b-round-384/retro-numbers.py` |
| `backlog.json` (v352) [K10] | <ul><li>D-29z1285…D-29z1292;</li><li>`retro_runs` 385;</li><li>`retro_policy.next_due`: round 400;</li><li>`retro_candidates` dispositions;</li><li>`systemic_tasks` SYS-R385-LEAF-ACTIONS-CONTEXT;</li><li>`root_requests_b` ROOT-REQ-L57-CHECK-PROGRESS;</li><li>Q-SR-385-1;</li><li>a STEM-LANES `scope_additions` row;</li><li>`regression_rounds` REGRESSION-2026-11-08.</li></ul> Before-copy: `b-round-384/backlog-before-385.json`. Edits: `update-backlog-part1.py` (v351) and `update-backlog-part2.py` (v352) |
| `feature-status.md` | Round 384 is done; the next line, the STUDIO-PERFORMANCE row and a RETRO 385 row are updated (`update-feature-status.py`) |

**Order of work (C-R215-01, RC-R336-SCRIPT-OUTPUT-DIR):**
- The analysis scripts read the **before** copy, `b-round-384/backlog-before-385.json`, and write to `b-round-384/data/` by default.
- **First copy the scripts to `c-round-385/scripts/`.** Rewrite every `b-round-384/data/` output path in the copies to `c-round-385/data/`, run them there, and `cmp` your outputs against B's.
- Run order:
  1. `collect.py`;
  2. `cost.py` (its stdout is `cost.txt`);
  3. `retro-numbers.py`;
  4. the others.

  `misc-outputs.sh` takes an output folder argument: give it `c-round-385/data`.
- **Do not run** `update-backlog-part*.py`, `update-feature-status.py`, `edit-lessons.py` or `retro-fill.py`. They are not re-runnable: the `.done` markers make them refuse.

## 2. A: nothing to implement
A writes `a-round-385.md` with one line: "RETRO round, no implementation." **STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-385.md` and `c-round-385.json` as it goes, plus `c-round-385/progress.json` after every row. **Run order:** the browser rows first (rows 2–4), then the document rows.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r385 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G385-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720. Open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with **no** Authorization header (valid parameters, L29) | `localStorage.auth_user` is null and the workspace opens. "Sign in required" shows with 0 `audio[src]`. The token API returns **401** with body `Please sign in to access Studio.` and no token. The fake bearer goes under `blocked` (no backend) |
| 3 | **STUDIO-SMOKE-385 (browser)** | Both viewports, after `Demo collection ready`: add one library item with Enter; press Play for about 1.5 s, then Stop; open Export and close it | The clip appears; the position advances and stops; the dialog opens and closes. Screenshots go under `c-round-385/` |
| 4 | **RT-SCREEN (browser)** | <ul><li>Open the PNGs that `screen-review-385.md` cites and check that they show what is described.</li><li>Check `http://127.0.0.1:5199/api/products`; if it is not 200, start `node mock-api/server.mjs` in the background.</li><li>Run `b-round-384/screens/warmup.mjs`, then `node b-round-384/screens/capture.mjs <abs c-round-385/screens>`.</li></ul> | Visible-text counts 138/168/118/144 [K5]. The journey ends at `/studio-lab?preview=middle-east` with 4 clips at left 512/1152/1792/2432 [K6]. A difference is explained, or it is a finding with `origin` |
| 5 | **CLAIMS** | `bash b-round-384/claims-385.sh` compared with `b-round-384/claims-385-output.txt` | No `MISSING`. Differences are allowed only where C's own work changes a value (none expected); each one is explained |
| 6 | **RT-NUM** | Re-run the scripts as in §1 and `cmp` the outputs. Recompute **every number** in `retro-385.md` §1, §2, §4 and §9 from its named file. At least: <ul><li>totals $320.36; B $195.21, A $102.83, C $22.32; B share 60.9 %; round median $19.63; phase medians $12.505 / $5.885 / $1.01 [K16];</li><li>non-PASS rounds $70.84; chains 376–377 $36.78 and 382–384 $54.07;</li><li>PASS 13 / FAIL [382] / BLOCKED [376, 383]; gate skipped [369, 376, 382, 383] [K20];</li><li>the STOP rounds 376 and 382 [K17];</li><li>the classify counts 46 / 32, and the totals 715 / 1106 / 96;</li><li>L57 15/16 with 383 absent; L23 5058 and L58 3717 bytes [K14]</li></ul> | Every number matches its source. Any number without a source is a finding (origin B) |
| 7 | **RT-CAUSE** | For each row of §3 and each fact in §5, §7 and §8, open the quoted source: <ul><li>`c-round-376.md`, `a-round-376.md` l.3, `c-round-382.json` (bugs with `origin`), `a-round-382.md` l.1, `c-round-383.json` [K21], `tasks/round-382.md` K32 [K24];</li><li>`b-round-381/` has no sketch review [K23];</li><li>`data/l58-l30-application.txt`;</li><li>`c-round-377.json` FL11 and PASS [K26]</li></ul> | Each "fact" is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No invented cause |
| 8 | **RT-IDS** | `backlog.json`: <ul><li>the statuses of C-R382-01, B-R383-AUTH-ROW-BARE-URL and TL-R376-M1 start with `closed`; GATE384-M1 is `scheduled` [K25];</li><li>D-29z1285…D-29z1292 exist;</li><li>`retro_runs` has round 385;</li><li>`retro_policy.next_due` starts with "round 400";</li><li>every retro candidate in retro §8 has the stated status;</li><li>SYS-R385-LEAF-ACTIONS-CONTEXT lists 8 `closes` ids, each of which exists in `open_findings` or `deferred_low_polish`;</li><li>ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING has `awaiting_user`;</li><li>ROOT-REQ-L57-CHECK-PROGRESS, Q-SR-385-1, the STEM-LANES `scope_additions` row and REGRESSION-2026-11-08 exist</li></ul> | All present, as stated |
| 9 | **RT-LESSONS** | `lessons.md` | <ul><li>≤ 60 lines, in three parts;</li><li>the diff touches only l.3, 18, 20, 41 and 59 [K18];</li><li>each of l.18, 20, 41 and 59 keeps its old text byte for byte as a prefix and appends one clause;</li><li>no lesson id is lost [K12]</li></ul> |
| 10 | **RT-L57** | `python3 -I tools/l57-check.py c-round-384.json c-round-385/l57-c384.txt` (rc 0, K11), then the same on your own `c-round-385.json` | Both rc 0 |
| 11 | **RT-SABA** | `retro-385.md` §12, `screen-review-385.md` and `questions-arch-leaf-plumbing.md` | Every rule change and screen item is phrased as information, a proposal or a question. Nothing is presented as Saba's decision |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-385.json` | 0 lines, both rc 0; rc 0 |

- **`browserVerified`:** true only if rows 2, 3 and 4 all ran at both viewports. The other rows are document checks.
- **`gate` rows:** verify and the full suite belong to the root gate. There is no source change, so no publication is expected.

**Verdict and routing:**
| Result | What happens |
|---|---|
| Every row PASS | PASS |
| An RT row fails (untraceable number, invented cause, missing disposition, lost clause or id) | B corrects the files at the round-386 planning; the next C round re-checks only the changed lines (RT-FIX) |
| A browser row finds a Medium or worse in the app | It is fixed first (bug gate) |
| A browser row finds a Low | It goes to `deferred_low_polish` |

## 4. Neighbour risk
None in the app: no code changes. The only risk is to loop artifacts. C must not re-run B's `.done` scripts (§1).

## 5. Order after this round (D-29z1291)
1. **Round 386:** GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION + A-R383-REVIEW-L1-STALE-ENSURE-DECODED (+ GATE384-L2 if cheap). All are in `ensureDecoded`/`startLibraryPreview` [K22].
2. REGRESSION-2026-11-08.
3. PERF-13b-ii.
4. PERF-13c, 13d, 14 and 15.
5. SYS-R2-FAKE-FIDELITY and SYS-CLOCK-DETERMINISM.
6. STEM-LANES, then SYS-1…3, then STORE-2b…5.
7. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
8. The phase-2 entries, under the skip rule.

PERF-11c-iii-d/e hold until Saba answers `questions-arch-leaf-plumbing.md`. Without an answer, the default applies at RETRO 400.

## 6. Out of scope
App code, tests, docs in `store/` and the protected files.

## 7. Claims
Run `bash b-round-384/claims-385.sh` from the loop root. The output at planning is in `b-round-384/claims-385-output.txt` (0 `MISSING`).

| Tag | Claim |
|---|---|
| K1 | gate 384 published `7295618` |
| K2 | git status 0 bytes at planning; HEAD `7295618` |
| K3 | 1,280 manifest entries |
| K4 | each protected file appears once |
| K5 | screen counts 138/168/118/144; no lane errors |
| K6 | journey URL and clip lefts |
| K7 | lessons: 60 lines |
| K8 | every cited artifact exists (`b-round-384/cited-artifacts.txt`) |
| K9 | 12 PNGs |
| K10 | backlog v352, last decision D-29z1292 |
| K11 | l57-check on `c-round-384.json` rc 0 |
| K12 | lesson ids |
| K13 | regression-last 2026-11-05 |
| K14 | L23 / L58 byte counts |
| K15 | `tasks/round-384.md` equals the before-copy |
| K16 | B median and the cost totals |
| K17 | STOP rounds |
| K18 | lessons diff lines |
| K19 | HEAD and status line count at planning |
| K20 | FAIL / BLOCKED / gate-skipped lists |
| K21 | round 383 had no `progress.json` |
| K22 | `ensureDecoded` at l.1409; `void ensureDecoded` at l.1646 and l.1727 (plus the ref call at l.927) |
| K23 | 0 sketch reviews in `b-round-381/` |
| K24 | round-382 K32 text |
| K25 | finding statuses |
| K26 | `c-round-377.json`: FL11 present, PASS |
