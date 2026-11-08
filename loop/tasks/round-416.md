# Round 416: RETRO 416 (fifteenth retrospective, rounds 401–415) + whole-screen and journey review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 415 → 416 planning, 2026-11-08 (`b-round-415.md`). The round-415 task is archived as `tasks/round-415.md` [K15].

## Decisions
These are recorded in `backlog.json` (v391 → v392) under `decisions_log_b`.
- **D-29z1444: round 415 is accepted.** C PASS in `c-round-415.json` (8 rows; `browserVerified`/`realVerified` true; 0 bugs). Gate 415 published `344a59f` [K1].
  - **SYS-R388-FAKE-WEB-AUDIO-HELPER is done.** A-R388-REVIEW-L3 is closed for the helper guard.
  - The call-site residual (A's reviewer = gate reviewer #1 = C's note) → new Low A-R415-REVIEW-L1-CALLSITE-FLAG (deferred; candidate row for SYS-CLOCK-DETERMINISM). Gate reviewer #2–#4 → info GATE415-S2-S4.
- **D-29z1445: the RETRO outputs** (§1). `retro_policy.next_due` = round 431 or the end of STUDIO-PERFORMANCE.
- **D-29z1446: lessons.** l.3, L22, L38, L56, L57 and L58 change (§1, §3 row 9). New checker `tools/l58-check.py`.
- **D-29z1447: L46 deadlines.** ARCH-CHECKPOINT-PREVIEW-AFTER-13C is unanswered [K23] → its recorded default: new **SYS-R416-PREVIEW-CONTROLLER**, queued after SYS-CLOCK-DETERMINISM. TLM-PERF15-FIREFOX → one question to Saba (retro §12), new deadline RETRO 431.
- **D-29z1448: order after this round** (§5).
- **D-29z1449: data notes.** The stops regex excludes "STOP: none". Round 409's planning cost is a lower bound. A-R411-REVIEW-M1 is re-tagged origin `B spec`.

## Rules
- **Policy:** "Retrospective: stop, look back, improve" (Saba, 2026-10-26); "Look back on every issue Saba finds, and guard the whole screen" (2026-10-28); the RETRO journey step (2026-10-31); `backlog.json` → `retro_policy`.
- **Window: 401–415** (15 rounds). Its file is `retros/retro-416.md`.
- **Read `lessons.md` first.** This planning revised it, and the revision applies from round 416: l.3, L22 (l.55), L38 (l.57), L56 (l.40), L57 (l.58) and L58 (l.41) [K18].
- **L57 and L22:** C's JSON carries **all** L57 fields. Every field except `gateChecksNamed` and the four manifest fields is `null`, with the reason "RETRO: no assert specified". `gateChecksNamed` lists the gate rows below. Every bug carries an `origin` (the L57 origin clause: the phase whose artifact first held the defect). Before hand-off, C runs `python3 -I tools/l57-check.py c-round-416.json c-round-416/l57-check.txt` and fixes its own JSON until it exits 0.
- **L29:** untagged code text below is a row id, a loop-artifact path or a description of what C runs. The only facts about `store/` are the HEAD, the tree and the manifest [K2] [K3] [K19].
- **L59, L60:** run every row until it has a result; run the browser rows first; write `c-round-416/progress.json` after each row; destructive commands stay inside `c-round-416/`.

**Not applicable in a RETRO round:** reference-first, the Ableton conformance check, the product-designer design step, the YouTube request and the screen budget. Nothing visible changes.

## Baseline: HEAD `344a59f`, clean tree
- **Gate:** gate 415 published `344a59f…` on both remotes [K1]. `context/head-sha.txt` may still show `5be9294` (pre-gate snapshot); `git rev-parse HEAD` is the truth.
- **Tree:** `git status --short --untracked-files=all` was empty at planning, with HEAD `344a59f` [K2] [K19].
- **Frozen:** every tracked file, **1,316** entries, is listed in `b-round-415/r416-tree-sha256.txt` [K3]. Check it from `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-415/r416-tree-sha256.txt`. B ran it at planning: rc 0. Each of the 11 protected files of `b-round-318/protected-sha256.txt` appears exactly once [K4].
- **Grants: none.** No file in `store/` may change in this round. **Pending root work:** none (no `cloud/root-commits/`).

## 0. Why this round
- **The RETRO is due.** `retro_policy.next_due` was round 416 (window 401–415).
- **Nothing blocks a code-free round.** No Critical/High is open. The open Mediums are root-only, manual or `awaiting_user` (2026-10-23 clarification); none is from this window.
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-07 [K13]; the next one is due at the first planning on or after 2026-11-10.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-416.md` | The analysis, in Georgian with English terms, for Saba. Window 401–415, 13 sections |
| `lessons.md` | **60 lines** [K7]. Before-copy: `b-round-415/lessons-before-416.md`. Diff: `b-round-415/lessons-diff.txt`. Hunks `3c3`, `40,41c40,41`, `55c55`, `57,58c57,58` [K18] |
| `tools/l58-check.py` | New checker: every `git apply` sketch in a task has a `sketch-review.md` that names its unbroken sha256 and a verdict. Window run: `b-round-415/data/l58-check-window.txt` [K21] |
| `user-review/screen-review-416.md` | No new clutter; one question SR-416-1. Captures in `b-round-415/screens/`: `capture.mjs`, `warmup.mjs`, `capture.log`, `screen416.json`, `compare.py`, `compare-401-416.txt`, `melody-probe.mjs`, `melody-probe.json` and 14 PNGs [K5] [K6] [K9] [K26] |
| `b-round-415/*.py`, `*.sh`, `data/*` | The scripts and data behind every number. `data/retro-numbers-416.txt` is produced by `b-round-415/retro-numbers.py` |
| `backlog.json` (v392) [K10] | D-29z1444…D-29z1449; `retro_runs` 416; `retro_policy.next_due` round 431; `retro_candidates` RC-R416-L58-CHECKER, RC-R416-PREDECODE-CAPTURE, RC-R401-ORIGIN-RETAG adopted, RC-R305 watch; `systemic_tasks` SYS-R416-PREVIEW-CONTROLLER; `screen_review_candidates` SR-416-1; the IDs of [K22]. Before-copy: `b-round-415/backlog-before-416.json`. Edits: `update-backlog-part1.py` (v391) and `update-backlog-part2.py` (v392) |
| `feature-status.md` | Round 415 done; RETRO 416 row; STUDIO-PERFORMANCE row (`b-round-415/update-feature-status.py` plus two hand edits listed in `b-round-415.md`) |

**Order of work (C-R215-01, RC-R336-SCRIPT-OUTPUT-DIR):**
- The analysis scripts read the **before** copy, `b-round-415/backlog-before-416.json`, and write to `b-round-415/data/` by default.
- **First copy the scripts to `c-round-416/scripts/`.** In the copies, rewrite every `b-round-415/data/` output path to `c-round-416/data/`, run them there, and `cmp` your outputs against B's.
- Run order: 1. `collect.py`; 2. `cost.py` (its stdout is `cost.txt`); 3. `retro-numbers.py`; 4. the others. `misc-outputs.sh` takes an output folder argument: give it `c-round-416/data`.
- **Do not run** `update-backlog-part*.py`, `update-feature-status.py` or `edit-lessons.py`. They are not re-runnable: the `.done` markers make them refuse.

## 2. A: nothing to implement
A writes `a-round-416.md` with one line: "RETRO round, no implementation." **STOP (L11):** if the frozen manifest is not rc 0, A reports the failing paths and changes nothing.

## 3. C: what to verify
C writes `c-round-416.md` and `c-round-416.json` as it goes, plus `c-round-416/progress.json` after every row. **Run order:** the browser rows first (rows 2–4), then the document rows.

| # | Row | Check | PASS means |
|---|---|---|---|
| 1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all` in `store/`; the r416 manifest and the protected manifest | 0 lines; both rc 0 |
| 2 | **G416-AUTH (browser)** | Fresh anonymous context at 1440×900 and 1280×720. Open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with **no** Authorization header | `localStorage.auth_user` is null and the workspace opens. "Sign in required" shows with 0 `audio[src]`. The token API returns **401** with no token. A fake-bearer check goes under `blocked` (no backend) |
| 3 | **STUDIO-SMOKE-416 (browser)** | Both viewports, after `Demo collection ready`: add one library item with Enter; press Play for about 1.5 s, then Stop; open Export and close it | The clip appears, the position advances and then stops, and the dialog opens and closes. Screenshots under `c-round-416/` |
| 4 | **RT-SCREEN (browser)** | <ul><li>Open the PNGs that `screen-review-416.md` cites and check that they show what is described.</li><li>Check `http://127.0.0.1:5199/api/products`. If it is not 200, start `node mock-api/server.mjs` in the background.</li><li>Run `b-round-415/screens/warmup.mjs` from `store/`, then `node <abs>/b-round-415/screens/capture.mjs <abs c-round-416/screens>` and `node <abs>/b-round-415/screens/melody-probe.mjs <abs c-round-416/screens>`.</li></ul> | <ul><li>Visible-text counts 138/168/118/144 and outside-timeline counts 97/124/86/101 [K5].</li><li>The journey ends at `/studio-lab?preview=middle-east` with **3 mounted clips** at left 512/1152/1792 and the status ending "…at 00:48.000 (nearest free spot)." [K6]. The 4th clip (Melody) is absent at scroll 0 by design (round-402 virtualization, doc 256 "Window-ის წესი").</li><li>The melody probe: at scroll 0 the last mounted clip is Pad; at the end of the timeline Pad and Melody are mounted; back at 0, three clips [K26].</li><li>A difference is explained (`positionAfterPlay` is wallclock), or it is a finding with `origin`.</li></ul> |
| 5 | **CLAIMS** | `bash b-round-415/claims-416.sh`, compared with `b-round-415/claims-416-planning-output.txt` | No `MISSING`; stderr empty. Differences allowed only where C's own work changes a value (none expected); each one explained |
| 6 | **RT-NUM** | Re-run the scripts as in §1 and `cmp` the outputs. Recompute **every number** in `retro-416.md` §1, §2, §3, §4 and §9 from its named file. At least the list below | Every number matches its source. A number without a source is a finding (origin B) |
| 7 | **RT-CAUSE** | For each row of §3 and each fact in §5, §7 and §8, open the quoted source. At least the list below | Each "fact" is in its source. Each opinion is labelled as `tech-lead`'s or `product-designer`'s. No cause is invented |
| 8 | **RT-IDS** | `backlog.json`. The list below | All present, as stated |
| 9 | **RT-LESSONS** | `lessons.md` against `b-round-415/lessons-before-416.md` | <ul><li>≤ 60 lines, in three parts;</li><li>the diff touches only l.3, 40, 41, 55, 57 and 58 [K18];</li><li>each of l.40, 41, 55, 57 and 58 keeps its old text byte for byte as a prefix and appends exactly one bold-labelled clause containing "(RETRO 416)";</li><li>l.3 changes only the retro pointer (`retro-416.md`, `401–415`) and appends one sentence beginning "**RETRO 416 (D-29z1446):**";</li><li>no lesson id is lost [K12];</li><li>L23 5058 and L58 4988 bytes, both < 5500 [K14];</li><li>**retro §10 describes exactly these hunks and clauses** (L56: compare the prose with `lessons-diff.txt`, not with the plan)</li></ul> |
| 10 | **RT-CHECKERS** | `python3 -I tools/l57-check.py c-round-415.json c-round-416/l57-c415.txt` (K11); `python3 -I tools/l58-check.py current-task.md` (K28); re-run the window loop `for n in 402…415: tools/l58-check.py tasks/round-$n.md` | l57 rc 0; l58 on this task rc 0 with "no sketch"; the window result equals `b-round-415/data/l58-check-window.txt` (rc 1 only for 402 and 415) [K21] |
| 11 | **RT-SABA** | `retro-416.md` §12 and `screen-review-416.md` | Every rule change and screen item is phrased as information, a proposal or a question. Nothing is presented as Saba's decision. The ARCH default is labelled as an L46 default, with root's answer still able to override it |
| 12 | **SOURCE-SCOPE** (end) + **L57** | As row 1; then `l57-check` on `c-round-416.json` | 0 lines and both rc 0; then rc 0 |

**RT-NUM: the numbers to recompute (at least).**
- Totals: $286.64; B $192.66, A $79.92, C $14.06; B share 67.2 % [K16].
- Medians: round $18.97; B $13.85, A $5.0, C $0.71.
- Costs: FAIL rounds $37.22 (13.0 %); chains $76.98 (26.9 %); pure fix-up 411–412 $35.78 (12.5 %); C in the FAIL rounds $1.07 and $0.52 [K25]; RETRO 401 $14.72; the top-5 rounds.
- Results: PASS 13 / FAIL [401, 411] / BLOCKED 0; gate skipped [401, 411] [K20]; `browserVerified` 15/15.
- STOP rounds [411] [K17]; the 403 false hit of the old regex (`a-round-403.md` l.3).
- The `classify` counts 22 / 40 with their origin, severity and category splits; `deferred_low_polish` 830, `open_findings` 1139.
- L57 14/15 (411 absent) [K24]; sketch plannings without review: 415 [K27]; 26 gate-review findings; `score None` rounds 402, 406, 408, 412, 413.
- The retro-401 comparison column (from `retros/retro-401.md` §2).

**RT-CAUSE: the sources to open (at least).** `c-round-401.json` (C-R401-01); `a-round-411.md` l.3; `c-round-411.md`; `b-round-410/sketch-review.md` (v5 APPROVE); `b-round-414.md` (tech-lead review as prose, no `sketch-review.md`); `b-round-412/sketch-review.md` (TL-R413-I1); `c-round-411.md` "WAVEFORM-BEFORE-READY" (the §5 claim about `middleEastBegins 0`); `b-round-393/root-request-arch-checkpoint-preview.md` and [K23] (no answer); `data/saba-window.txt`; `data/retro416-deadlines.txt` (the §8 entries); doc 256 "Window-ის წესი" (the virtualization explanation).

**RT-IDS: what must be in `backlog.json`** (statuses as in [K22]):
- SYS-R388-FAKE-WEB-AUDIO-HELPER `done`; A-R388-REVIEW-L3-SF11-SETINTERVAL-STUB `closed`; A-R415-REVIEW-L1-CALLSITE-FLAG `deferred_low_polish` (and listed in SYS-CLOCK-DETERMINISM `may_close`); GATE415-S2-S4 `recorded`.
- B-R411-SKETCH-M1-MISSED and TL-R413-I1 `closed`; ARCH-CHECKPOINT-PREVIEW-AFTER-13C `L46 default applied`; SYS-R416-PREVIEW-CONTROLLER `queued`, with the 7 ids of retro §11 in `closes`, each of those 7 `assigned`.
- RC-R401-ORIGIN-RETAG `adopted`; RC-R416-L58-CHECKER `adopted`; RC-R416-PREDECODE-CAPTURE and SR-416-1 `awaiting_user`; TLM-PERF15-FIREFOX deadline RETRO 431.
- D-29z1444…D-29z1449 exist; `retro_runs` has round 416; `retro_policy.next_due` starts with "round 431"; STORE-REDESIGN has `note_d29z1448`.

**Flags and gate rows:**
- **`browserVerified`:** true only if rows 2, 3 and 4 all ran at both viewports. The other rows are document checks.
- **`gate` rows:** verify and the full suite belong to the root gate. There is no source change, so no publication is expected.

**Verdict and routing:**
| Result | What happens |
|---|---|
| Every row PASS | PASS |
| An RT row fails (untraceable number, invented cause, missing disposition, lost clause or id, §10 not matching the diff) | B corrects the files at the round-417 planning; the next C round re-checks only the changed lines (RT-FIX) |
| A browser row finds a Medium or worse in the app | It is fixed first (bug gate) |
| A browser row finds a Low | It goes to `deferred_low_polish` |

## 4. Neighbour risk
None in the app: no code changes. The only risk is to loop artifacts. C must not re-run B's `.done` scripts (§1).

## 5. Order after this round (D-29z1448)
1. **REGRESSION-2026-11-10**, if the round-417 planning date is on or after 2026-11-10.
2. **SYS-CLOCK-DETERMINISM** (closes A-R388-REVIEW-L4 and others; may close A-R415-REVIEW-L1).
3. **SYS-R416-PREVIEW-CONTROLLER** (a root answer to ARCH-CHECKPOINT-PREVIEW-AFTER-13C before its dispatch overrides the default).
4. SYS-R369 (only with a root checkpoint answer; otherwise skipped, and its Lows stay deferred).
5. STEM-LANES.
6. SYS-1…3.
7. STORE-2b…5 (direction A was decided 2026-10-25; paused only by the 2026-10-27 order).
8. REVIEW-RECOMMENDATIONS, then T12-ADVANCED.
9. The phase-2 entries, under the skip rule.

## 6. Out of scope
App code, tests, docs in `store/` and the protected files.

## 7. Claims
Run `bash b-round-415/claims-416.sh` from the loop root. The output at planning is in `b-round-415/claims-416-planning-output.txt` (0 `MISSING`, stderr empty).

| Tag | Claim |
|---|---|
| K1 | gate 415 published `344a59f` |
| K2 | git status was 0 bytes at planning; HEAD `344a59f` |
| K3 | 1,316 manifest entries |
| K4 | each protected file appears once |
| K5 | screen counts 138/168/118/144, outside 97/124/86/101 |
| K6 | journey URL, 3 mounted clip lefts, status tail |
| K7 | lessons: 60 lines |
| K8 | every cited artifact exists (`b-round-415/cited-artifacts.txt`) |
| K9 | 14 PNGs |
| K10 | backlog v392, last decision D-29z1449 |
| K11 | l57-check on `c-round-415.json` rc 0 |
| K12 | lesson ids |
| K13 | regression-last 2026-11-07 |
| K14 | L22 / L23 / L38 / L56 / L57 / L58 byte counts |
| K15 | `tasks/round-415.md` equals the before-copy |
| K16 | the B median and the cost totals |
| K17 | the STOP rounds |
| K18 | the lessons diff hunks |
| K19 | HEAD and the status line count |
| K20 | the FAIL / BLOCKED / gate-skipped lists |
| K21 | l58-check rc per window task |
| K22 | the RT-IDS statuses |
| K23 | ARCH preview question unanswered |
| K24 | `c-round-411.json`: 0 L57 fields, origin None |
| K25 | C cost of 401 and 411 |
| K26 | melody probe summary |
| K27 | sketch-415 sha and no `b-round-414/sketch-review.md` |
| K28 | `tools/l58-check.py current-task.md` rc 0 (this task has no sketch) |
