# CURRENT TASK — Round 230: RETRO (third retrospective, rounds 215–229) + whole-screen review. No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

**Planned by:** B, at the round 229 → 230 planning, 2026-10-28. **Decisions:** D-29z292 (round 229 accepted), D-29z293 (rulings on C's round-229 notes), D-29z294 (RETRO 230 outputs), D-29z295 (lessons), D-29z296 (SABA-B-7 recorded; SYS-5; checkpoint addendum), D-29z297 (doc 170 ride-along), D-29z298 (round 231).
- Policy: "Retrospective: stop, look back, improve" (Saba, 2026-10-26) and "Look back on every issue Saba finds, and guard the whole screen" (Saba, 2026-10-28); `backlog.json` → `retro_policy`. Retro 215 covered 200–214, so this window is 215–229.
- **Read first:** `lessons.md` (loop root). It was revised in this planning step (L23, L26, L28, L29 amended; L41, L42 added) and applies from round 230.

## Baseline: HEAD `5da0f50`, clean tree
- Gate 229 published `5da0f506a8d09d851cf34fe7d663b1c4a223b2eb` on both remotes (`gates/gate-round-229.json`, status `published`). This is the round-230 baseline. `git status --short --untracked-files=all` was empty at planning (`b-round-229/git-status-at-planning.txt`).
- **Frozen:** every tracked file (1,087 entries) in `b-round-229-r230-tree-sha256.txt`. From `store/`: `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-229-r230-tree-sha256.txt`. B checked it: rc 0.
- **Grants: none.** `b-round-229-r230-grants.txt` and `b-round-229-r230-new-files.txt` are empty on purpose (precedent: rounds 200 and 215). No file in `store/` may change in this round.
- Protected as always: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `entry.server.tsx`, `.claude/**`, `CLAUDE.md`, all config files.

## 0. Why this round
- **Round 229 PASSED.** C: 15 rows, `browserVerified` and `realVerified` true, 1 Low (C-R229-01). Gate 229 published `5da0f50`. CALM-2a is done (D-29z292).
- `retro_policy.next_due_d29z262`: RETRO at round 230, 15 rounds after retro 215. It includes the whole-screen review.
- **Regression:** `regression-last.json` says round 199, 2026-10-27; the next one is due on or after 2026-10-30. Today is 2026-10-28, so it is not due.
- **Reference first / Ableton:** not applicable (RETRO round, policy "Not in scope"). No Ableton parity is claimed.
- **Screen budget:** nothing visible changes (no source change).

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-230.md` | The analysis, in Georgian with English technical terms, for Saba. Window: rounds 215–229. |
| `lessons.md` | 51 lines (≤ 60), three parts. Changed: L23, L26, L28, L29. New: L41, L42. Blank lines inside sections removed. Before-copy: `b-round-229/lessons-before-230.md`. |
| `user-review/screen-review-230.md` | Whole-screen review candidates SR-230-1…10 for Saba (`design-philosopher` + `first-visit-host`), with screenshots `b-round-229/screens/screen230-full-{S0,DEMO}-{1440x900,1280x720}.png`, the inventory `screen230.json`, the capture script `screens.mjs`, and the probe `probe-active-track.mjs` / `.txt`. |
| `b-round-229-checkpoint-request.md` | Root request: SABA-B-7 envelope-curve addendum to the export-pipeline checkpoint (non-blocking). |
| `b-round-229/*.py`, `*.txt`, `*.json` | The scripts and data behind every number: `collect.py` → `rounds-215-229.json` / `collect.txt`; `cost.py` → `cost.txt` / `cost-rows.json`; `retro-numbers.py` → `retro-numbers.txt`; `fails-detail.py` → `fails-detail.txt`; `gate-reviews.py` → `gate-reviews.txt`; `classify.py` → `classify.txt` / `classify-out.json`; `window-findings.py` → `window-findings.txt`; `l28-status.py` → `l28-status.txt`; `totals.py` → `deferred-totals.txt` / `open-medium-plus.txt`; `experiments.py` → `experiments.txt`; `window-mediums.py` → `window-mediums.txt`; `update-backlog.py` (this planning's backlog edits). |
| `backlog.json` v215 | `retro_runs[2]`, `systemic_tasks` SYS-5, queue entry `SABA-B-7-ENVELOPE-DB`, `screen_review_candidates`, `retro_policy.next_due`, D-29z292…D-29z298. Before-copy: `b-round-229/backlog-before-230.json`. |

**Order of work (C-R215-01 lesson):** every analysis script reads `b-round-229/backlog-before-230.json`, the copy taken **before** this planning's edits. So the window counts do not include this planning's new ids. Run them from the loop root: `python3 -I b-round-229/<script>.py`. (`cost.py` and `retro-numbers.py` read the JSON written by `collect.py` and `cost.py`; run `collect.py` first.)

## 2. A: nothing to implement
1. From `store/`, confirm:
   - `git rev-parse HEAD` = `5da0f50…`;
   - `git status --short --untracked-files=all` is empty;
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-229-r230-tree-sha256.txt` prints nothing.
2. Write `a-round-230.md` with the three results and "no change, by RETRO policy". Do not run typecheck, lint, vitest or the code-reviewer: there is no diff.
3. Do not edit `retros/`, `lessons.md`, `user-review/` or any B file. If you disagree with a lesson in "Before handing over (A self-check)" (especially the amended **L26**, TEMPLATE headings), write it under "Lesson feedback" in `a-round-230.md`. B rules on it at round-231 planning.

## 3. C: what to verify
C writes `c-round-230.md` and `c-round-230.json` as it goes. Rows:

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | At start and end: HEAD `5da0f50`, clean status, frozen list rc 0. | Nothing in `store/` changed. | Any change fails the round, whoever made it. |
| **RT-NUM** | Recompute **every number** in `retro-230.md` §1, §2, §5, §6 and §9 from its named file or script (copy the scripts to `c-round-230/` if you prefer; run from the loop root). At least: <ul><li>the per-phase totals and medians, and the top-5 rounds and top-6 phases;</li><li>the FAIL-round list and its cost;</li><li>the re-do rounds and their cost;</li><li>the gate counts per status;</li><li>the C bug counts;</li><li>the gate-review count (63 items in **12** reviews; check `ls gates/round-2{15..29}/review.md`);</li><li>the window counts in `open_findings`, `deferred_low_polish` and `closed_findings_d29z163`;</li><li>the deferred total 353 (from the before-copy);</li><li>the experiment numbers (`experiments.txt`): 0 window status findings, doc 170's l.4 at `5da0f50`, no "timed out" in gate 226's log.</li></ul> | Every number matches its source (±0.01 USD; counts exact). | A number has no source or does not match. List each one. |
| **RT-CAUSE** | For each row of `retro-230.md` §3 (C FAIL 215, 216; gate 226; STOP 223) and each root cause in §4, open the quoted line: `c-round-215.json` C-R215-01; `c-round-216.md` l.22 and `b-round-216.md` l.13, l.41; `gates/round-226/verify.log` l.2000 and `tasks/round-227.md` l.75–80; `a-round-223.md` l.3–4; `tasks/round-229.md` §0.2 (T10); `c-round-229.json` notes (Escape). Also the SABA-B-7 claim: `grep -c SABA-B-7 b-round-229/backlog-before-230.json b-round-229/feature-status-before-230.md` gives 0 and 0. | Each cause traces to the quoted line or id. Every inference is labelled as one. | A cause is invented, misquoted, or an inference is stated as fact. |
| **RT-IDS** | <ul><li>**SYS-5** (`retro-230.md` §7; `backlog.json` → `systemic_tasks`): each id it closes exists in `open_findings` or `deferred_low_polish` (C-R229-01, GATE229-S1 as its alias, ROOT-R66-L3, C-R130-ADD-DISABLED-NO-REASON), is open, and is about a disabled control's reason.</li><li>**SABA-B-7**: the queue entry `SABA-B-7-ENVELOPE-DB` sits directly after `SABA-B-8-CALM-STUDIO` and before `STUDIO-PERFORMANCE` in `post_current_stage_queue`, and its scope matches the policy section "SABA-B-7" (bottom −∞, the same curve when scheduling, stored points keep their gain, the four C checks).</li><li>**Doc 170**: `git show 5da0f50:docs/implementation/2026/quarter-IV/170-perf-16a-mp3-mediabunny.md \| sed -n 4p` is `**სტატუსი:** In Progress (stage 1 of 2; C round 218 PASS)`, and `c-round-221.json` is PASS for PERF-16b-ii.</li><li>The L7 closure in §4: `retro_runs[1]` (retro 215) is closed because `c-round-216.json` `passed` contains `RT-FIX-216`.</li></ul> | All ids are real and in class; each claim reproduces. | An id is missing or out of class, the queue order is wrong, or a claim does not reproduce. |
| **RT-LESSONS** | `lessons.md`: <ul><li>≤ 60 lines, exactly the three required parts;</li><li>each lesson is concrete and checkable;</li><li>each lesson cites an evidence id or round that exists. For the changed or new lessons (L23, L26, L28, L29, L41, L42), open each cited source;</li><li>diff against `b-round-229/lessons-before-230.md`: only those six lessons, the header line and removed blank lines differ.</li></ul> | All true. | Over 60 lines, a vague lesson, a citation that does not exist or does not say what the lesson claims, or another lesson changed. |
| **RT-SABA** | Two checks. (1) `retro-230.md` §12 and `screen-review-230.md`: every project-rule or config change and every screen candidate is phrased as a **proposal**, and no such file changed (SOURCE-SCOPE). (2) Saba-issue rule (2026-10-28): for each Saba-found issue in the window (§5: SABA-B-8, SABA-B-7), the lesson the retro names exists in `lessons.md` (L39; L41 and L42), and SABA-B-8's `Why we missed it` exists at `tasks/round-226.md` §1.1. | True. | A proposal is phrased as applied, a rule file changed, or a named lesson or section is missing. |
| **RT-SCREEN** | `screen-review-230.md`: <ul><li>every candidate SR-230-1…10 names a screenshot or file that exists under `b-round-229/screens/`;</li><li>each candidate is visible in the cited screenshot as described (open the PNGs; a mismatch is a finding against the review, not the app);</li><li>no candidate repeats an item already scheduled in CALM-2b/CALM-3 (`docs/technical/studio-real-workspace/calm-studio-review.md` and policy "SABA-B-8") or one Saba kept;</li><li>`backlog.json` → `screen_review_candidates` lists the same 10 ids as `awaiting_user`;</li><li>**browser:** SR-230-10 — run `node ../tmp/studio-real-loop/b-round-229/screens/probe-active-track.mjs` once from `store/`; its output matches `probe-active-track.txt` (the Stems name button sets the active track and Enter adds there).</li></ul> | All true. | A missing file, a candidate not visible as described, a duplicate of scheduled work, or the probe output differs. |
| **G230-3 (browser)** | Fresh anonymous context at 1440×900 and 1280×720: <ul><li>`/studio-lab` shows the workspace and the demo badge; `localStorage.auth_user` is null;</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`;</li><li>`GET /api/studio-token?product=middle-east&file=stem1.wav` with no header;</li><li>the same with a fake Bearer.</li></ul> | <ul><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it (round 229 saw 500).</li><li>**No token is issued.**</li></ul> | Any bypass is Critical. |
| **STUDIO-SMOKE-230 (browser)** | On `/studio-lab` at both viewports: add the first demo clip, drag its fade-in handle with the real mouse, then press Ctrl+Z. Also confirm the CALM-2a state: the BPM and Loop strips have no text, and the disabled Loop button's `title` is `Loop: make a time selection first (Ctrl+L)`. | <ul><li>The fade changes and one Undo entry appears; Undo restores it.</li><li>The CALM-2a state holds.</li><li>0 page errors.</li></ul> | Any failure is a regression finding (2026-10-23 bug gate). |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and e2e smoke. List them under `"gate"`, never in `"passed"`.
- **`browserVerified`:** true only if G230-3 and STUDIO-SMOKE-230 ran at both viewports and the RT-SCREEN probe ran. The other RT rows are document checks by RETRO policy; they are not skipped browser rows.
- **Consults (optional):** `qa-engineer` and `consequence-tester` may review the lessons for checkability. Record any disagreement as a finding against the retro, not as an edit.
- **Run budget:** the RT rows are reading work. Do not re-verify unrelated product features.

## 4. Outcome, fixed in advance (D-29z298)
| C result | B at round-231 planning |
|---|---|
| All rows PASS, and round-231 planning is **before** 2026-10-30 | Round 231 = **CALM-2b**: the Clip details empty state as one line (fields keep their geometry), the library notice as one dismissible line ("Synthetic demo stems — not CZABA catalogue audio.", remembered per browser), the first-run status teaching drag, Enter and `?`, and the DUX-R-4(a) empty-lane hint (active empty lane only, before the first clip). It also carries: <ul><li>doc 178 l.4 → `Completed (C round 231 PASS)` (CALM-2 has 2 stages; amended L28);</li><li>doc 170 l.4 → exactly `**სტატუსი:** Completed (C round 221 PASS)` (D-29z297);</li><li>GATE229-S3 (`videoSoloTitle`) if `strings.ts` and `ArrangementLane.tsx` are granted; GATE229-S5 (one doc-178 sentence).</li></ul> B applies L23 (typecheck on the scratch copy), L28 (`grep -rn 'In Progress (stage' docs/implementation`), L29 (every state recipe run once in the browser) and L39 (budget row). Then round 232 CALM-3, then SABA-B-7, then SYS-5, then PERF b-ii. |
| Round-231 planning is **on or after** 2026-10-30 | Round 231 = **REGRESSION** (3-day rule; `regression-last.json` round 199). Its `scope_additions` are copied as named rows (L6), plus CALM-1/CALM-2a key rows (the `?` sheet, the transport titles, the 4 removed lines). CALM-2b moves to round 232. |
| An RT row fails (an untraceable number, an invented cause, a wrong id or citation, a screen candidate not as described) | B corrects `retro-230.md`, `lessons.md`, `screen-review-230.md` or the backlog at round-231 planning and records it in `b-round-230.md`. The next C round re-checks only the changed lines (RT-FIX, as rounds 201 and 216). Round 231 still runs as in the rows above. |
| G230-3 or STUDIO-SMOKE-230 finds Medium+ | Round 231 is a bounded fix-up first (2026-10-23 bug gate). A Low goes to `deferred_low_polish`. |
| SOURCE-SCOPE fails | Stop. Root inspects the change. Nothing is published. |

## 5. Neighbour risk
None in app code: no source file changes. The risk is in the process.
- A wrong lesson misleads every later round, so RT-LESSONS and RT-CAUSE matter most.
- The amended L28 adds a grant to the final stage of every multi-stage feature. If C finds it unworkable (for example, which C round M to cite), say so under RT-LESSONS.
- The screen review goes to Saba. A candidate that misdescribes the screen would waste his decision, so RT-SCREEN opens every screenshot.

## 6. Deliverables
- **A:** `a-round-230.md`.
- **C:** `c-round-230.md` and `c-round-230.json`, with evidence under `c-round-230/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate` and `rows`.

## 7. Root notes
- **Nothing to publish from `store/`.** If SOURCE-SCOPE shows a change, that change is itself a FAIL. The loop state commit records the retro.
- **New root request:** `b-round-229-checkpoint-request.md`, the SABA-B-7 envelope-curve addendum to the export-pipeline checkpoint (`b-round-221-checkpoint-request.md`). Non-blocking; wanted before SABA-B-7 is dispatched (after CALM-3). Still pending and non-blocking: the `b-round-211`, `-221` and `-225` requests.
- **For Saba:** `user-review/screen-review-230.md` (10 candidates; he can answer in `screen-review-230-decisions.md`), and `retro-230.md` §12 (the unanswered rule proposals, and a note that SABA-B-7 was recorded late with no lost round). Root may forward them.
