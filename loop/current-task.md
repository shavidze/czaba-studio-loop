# CURRENT TASK — Round 215: RETRO (second retrospective, rounds 200–214). No app code. A: nothing to implement. C: traceability check of the retro, plus the auth guard and a short Studio smoke in the browser

Decisions: **D-29z209** (round 214 accepted), **D-29z210** (rulings on C round 214's three needsBRuling items), **D-29z211** (RETRO 215 outputs), **D-29z212** (queue: 216 = PERF-1b-ii + SYS-4, or REGRESSION if due).
- Planned by B on 2026-10-28.
- Policy: "Retrospective: stop, look back, improve" (Saba, 2026-10-26); `backlog.json` → `retro_policy`. "After every 15 rounds": retro 200 covered 123–199, so this window is 200–214.

**Read first:** `lessons.md` (loop root). It was revised in this planning step (L23 amended, L28 replaced, L29–L34 added) and applies from round 215.

## Baseline: HEAD `eb9e76e`, clean tree
- Gate 214 published `eb9e76e1bc2b41f6ec1a3e083a391d05cb1a844f` on both remotes (`gates/gate-round-214.json`). This is the round-215 baseline. `git status` was empty at planning (`b-round-214/git-status-at-planning.txt`).
- **Frozen:** every tracked file (1,062 entries), in `b-round-214-r215-tree-sha256.txt`. From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-214-r215-tree-sha256.txt`. B checked it: rc 0.
- **Grants: none.** `b-round-214-r215-grants.txt` and `b-round-214-r215-new-files.txt` are empty on purpose (precedent: round 200). No file in `store/` may change in this round.
- Protected as always: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `.claude/**`, `CLAUDE.md`, all config files.

## 0. Why this round
- **Round 214 PASSED.** C reported `browserVerified` and `realVerified` true, with 0 bugs, and gate 214 published `eb9e76e`. PERF-1b-i is done (D-29z209).
- D-29z208 fixed round 215 as RETRO: 15 rounds have passed since retro 200.
- **Regression:** `regression-last.json` says round 199, 2026-10-27, so the next one is due on or after 2026-10-30. Today is 2026-10-28, so it is not due.
- **Reference first / Ableton:** not applicable (RETRO round, policy "Not in scope").

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-215.md` | The analysis, in Georgian with English technical terms, for Saba. Window: rounds 200–214. |
| `lessons.md` | The living checklist, 47 lines (≤ 60), with three parts (B / A / C). Changed: L23, L28. New: L29, L30, L31, L34 (B) and L32, L33 (A). Before-copy: `b-round-214/lessons-before-215.md`. |
| `b-round-214/*.py`, `*.txt`, `*.json` | The scripts and data behind every number: `collect.py` → `rounds-200-214.json` / `collect.txt`; `cost.py` → `cost.txt` / `cost-rows.json`; `retro-numbers.py`; `fails-detail.py`; `gate-reviews.py`; `classify.py` → `classify.txt` / `classify-out.json`; `window-findings.py`; `l28-status.py`; `totals.py` → `deferred-totals.txt` / `open-medium-plus.txt`; `update-backlog-1..4.py` (the backlog edits of this planning). |
| `backlog.json` v201 | `retro_runs[1]`, `systemic_tasks` SYS-4, `retro_policy.next_due`, D-29z209…D-29z212, round-214 closures. Before-copy: `b-round-214/backlog-before-215.json`. |

## 2. A: nothing to implement
1. From `store/`, confirm three things:
   - `git rev-parse HEAD` = `eb9e76e…`;
   - `git status --short --untracked-files=all` is empty;
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-214-r215-tree-sha256.txt` prints nothing.
2. Write `a-round-215.md` with the three results above and "no change, by RETRO policy". Do not run typecheck, lint, vitest or the code-reviewer; there is no diff.
3. Do not edit `retros/`, `lessons.md` or any B file.
   - If you disagree with a lesson in "Before handing over (A self-check)" (L11–L15, L26–L28, L32, L33), write it in `a-round-215.md` under "Lesson feedback".
   - L28 now asks A to write the final status line itself. Feedback on whether that is workable is especially useful.
   - B rules on any feedback at round-216 planning.

## 3. C: what to verify
C writes `c-round-215.md` and `c-round-215.json` as it goes. Rows:

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | At start and end: HEAD `eb9e76e`, clean status, frozen list OK. | Nothing in `store/` changed. | Any change fails the round, whoever made it. |
| **RT-NUM** | Recompute **every number** in `retro-215.md` from its named file or script. The scripts only read loop files; copy them to `c-round-215/` if you prefer, and run them from the loop root. Check at least: <ul><li>the per-phase cost totals and medians;</li><li>the FAIL-round list and its cost;</li><li>the re-do rounds and their cost;</li><li>the gate counts per status;</li><li>the C bug counts;</li><li>the gate-review item count;</li><li>the window counts in `open_findings` and `deferred_low_polish`;</li><li>the deferred total (and the 319 before-count from `b-round-214/backlog-before-215.json`);</li><li>the 8 stale-status findings.</li></ul> The `classify`/`window-findings`/`l28-status` outputs were taken **after** this planning's backlog edits; the retro says so. | Every number matches its source within rounding (±0.01 USD; counts exact). | A number has no source or does not match. List each one. |
| **RT-CAUSE** | For each row of `retro-215.md` §3 (C FAIL rounds 200, 201, 202, 209; gate 204 and gate 212), open the cited report lines: `c-round-N.md` / `.json`, `a-round-N.md`, `b-round-N.md`, `gates/round-N/review.md`. Pay particular attention to the round 212 claim (`a-round-212.md` l.38–42; `c-round-212.md` l.224) and the round 202 claim (`a-round-202.md` §6). | Each cause traces to a quoted line or id. Every inference is labelled as one. | A cause is invented, or an inference is stated as fact. |
| **RT-IDS** | SYS-4 (`retro-215.md` §6; `backlog.json` → `systemic_tasks`): <ul><li>each id it closes exists and is open or queued;</li><li>`git show eb9e76e:<doc> \| sed -n 4p` for docs 160, 161, 162 and 168 shows a non-final status;</li><li>the target C rounds (203, 204, 205, 214) are the rounds whose `c-round-N.json` is PASS for that work.</li></ul> Also spot-check the L7 closures in §4 (GATE211-S1, GATE206-DOC163-STATUS, GATE208-DOC163-STATUS, GATE211-S6) against their cited evidence. | All ids are real and in class, and each claim reproduces. | An id is missing or out of class, or a claim does not reproduce. |
| **RT-LESSONS** | Three checks on `lessons.md`: <ul><li>it has ≤ 60 lines and exactly the three required parts;</li><li>each lesson is concrete and checkable (it names an observable check);</li><li>each lesson cites at least one evidence id or round that exists. For the new or changed lessons (L23, L28, L29–L34), open each cited line.</li></ul> | All true. | Over 60 lines, a vague lesson, or a citation that does not exist or does not say what the lesson claims. |
| **RT-SABA** | `retro-215.md` §9: every project-rule or config change (`biome.json`, `.claude/primitives/*`, `CLAUDE.md`, `.claude/agents/*`) is phrased as a **proposal**, and no such file changed. | True. | A rule file changed, or a proposal is phrased as already applied. |
| **G215-3 (browser)** | Fresh anonymous context at 1440×900 and 1280×720: <ul><li>`/studio-lab` shows the workspace and the demo badge;</li><li>`/studio/middle-east` shows "Sign in required" and 0 `audio[src]`;</li><li>`GET /api/studio-token?product=middle-east&file=stem1.wav` with no header;</li><li>the same request with a fake Bearer.</li></ul> | <ul><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it.</li><li>**No token is issued.**</li></ul> | Any bypass is Critical. |
| **STUDIO-SMOKE-215 (browser)** | On `/studio-lab` at both viewports: add the demo clip, drag its fade-in handle with the real mouse, then press Ctrl+Z. | <ul><li>The fade changes and one Undo entry appears.</li><li>Undo restores it.</li><li>0 page errors.</li></ul> | Any failure is a regression finding (2026-10-23 bug gate). |

- **Gate rows:** full vitest, typecheck, build, Biome, `npm run verify` and e2e smoke. List them under `"gate"` in the JSON, never in `"passed"`.
- **`browserVerified`:** true only if G215-3 and STUDIO-SMOKE-215 both ran at both viewports. The RT rows are document checks by RETRO policy; they are not skipped browser rows.
- **Ableton:** no new behaviour. Do not claim Ableton parity.
- **Consults (optional):** `qa-engineer` and `consequence-tester` may review the lessons for checkability. Record any disagreement as a finding against the retro, not as an edit.
- **Run budget:** the RT rows are reading work. Do not re-verify unrelated product features.

## 4. Outcome, fixed in advance
| C result | B at round-216 planning |
|---|---|
| All rows PASS, and round-216 planning is **before** 2026-10-30 | Round 216 = **PERF-1b-ii** (WAV export long tasks and peak memory, JS bytes per route, DOM per clip, backing-store MB, GATE206-S5 documented). It also includes **SYS-4**: four one-line grants on docs 160, 161, 162 and 168 l.4, each to exactly `Completed (C round N PASS)`, with N = 203, 204, 205 and 214. B also: <ul><li>rules on the doc 168 PERF candidates;</li><li>files `root-deps-request.json` for mediabunny (PERF-16 next);</li><li>applies the new lessons L29–L31 and L34 in the task text.</li></ul> |
| Round-216 planning is **on or after** 2026-10-30 | Round 216 = **REGRESSION** (3-day rule; `regression-last.json` round 199). SYS-4's four lines may ride along as docs-only grants. PERF-1b-ii moves to round 217. |
| An RT row fails (an untraceable number, an invented cause, a wrong id or citation) | B first corrects `retro-215.md`, `lessons.md` or `systemic_tasks` at round-216 planning, and records the correction in `b-round-215.md`. The next C round re-checks only the changed lines (RT-FIX, as round 201). Round 216 still runs as in the rows above. |
| G215-3 or STUDIO-SMOKE-215 finds Medium+ | Round 216 is a bounded fix-up first (2026-10-23 bug gate). A Low goes to `deferred_low_polish`. |
| SOURCE-SCOPE fails | Stop. Root inspects the change. Nothing is published. |

## 5. Neighbour risk
None in app code: no source file changes. The risk is in the process.
- A wrong lesson would mislead every later round, so RT-LESSONS and RT-CAUSE are the important rows.
- The L28 replacement changes what A writes in every future implementation doc. If C finds it unworkable (for example for multi-stage docs), say so under RT-LESSONS.

## 6. Deliverables
- **A:** `a-round-215.md`.
- **C:** `c-round-215.md` and `c-round-215.json`, with evidence under `c-round-215/`. The JSON carries `taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate` and `rows`.

## 7. Root notes
- **Nothing to publish from `store/`.** If SOURCE-SCOPE shows a change, that change is itself a FAIL. The loop state commit records the retro.
- **Root-runner proposals** are in `retro-215.md` §9 items 3–4.
  - With the new L28, root no longer needs to amend doc l.4 at publication. A check that a new doc's l.4 has no "pending" is optional.
  - GATE213-S7: per-test durations should stay visible in `verify.log` (used by L31).
- **For Saba** (`retro-215.md` §9 items 1–2): the `biome.json` `perf/**` scope proposal, and the unanswered retro-200 rule proposals. Root may forward them.
- **The frontend-architect checkpoint** (D-29z195, `b-round-211-checkpoint-request.md`) is still pending with root. It is non-blocking.
