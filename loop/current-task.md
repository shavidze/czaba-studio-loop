# CURRENT TASK — Round 200: RETRO (first retrospective, rounds 123–199). No app code. A: nothing to implement. C: traceability check of the retro, plus one parked browser row and the auth guard

Decision: **D-29z165** · Planned by B on 2026-10-27 (from 00:59 UTC) · Policy: "Retrospective: stop, look back, improve" (Saba, 2026-10-26), `backlog.json` → `retro_policy`.

Read first, as every round from now on: **`lessons.md`** (loop root). It was written in this planning step and applies from round 200.

## Baseline: HEAD `5b1a2bb`, clean tree
- Gate 199 published `5b1a2bba0c98dcc86564be8441fbdf989cc8f7b8` on both remotes (`gates/gate-round-199.json`). This is the round-200 baseline.
- Frozen list: **every tracked file** (1032 entries), in `b-round-199-r200-tree-sha256.txt`. Check it with `sha256sum -c --quiet` from `store/`.
- Grants: **none** (`b-round-199-r200-grants.txt` is empty). No file in `store/` may change in this round. Root does not publish when nothing changed; the loop state commit records the retro.
- Protected files (unchanged, as always): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`.

## 0. Why this round
- Round 199 (REGRESSION) C PASS: 91 rows, 0 bugs, 0 regressions, `browserVerified=true`. Pre-written outcome (`tasks/round-199.md` §7, first row): round 200 = **RETRO**.
- Retro policy: "the first one runs right after STORE-REDESIGN or at round 200, whichever comes first". This is round 200.
- `regression-last.json` was set to 2026-10-27 / round 199 **before** this planning applied the 3-day rule. The next regression round is due on or after 2026-10-30.

## 1. What B already produced (the objects under test)
| File | Content |
|---|---|
| `retros/retro-200.md` | The analysis, in Georgian with English technical terms, for Saba. Window: rounds 123–199. |
| `lessons.md` | The living checklist, ≤ 60 lines, with three parts (B / A / C). |
| `b-round-199/*.py`, `*.json`, `*.txt` | The scripts and data behind every number: `collect.py` → `rounds-123-199.json`; `cost.py` → `cost-rows.json` (B cost shifted: `b-round-(N−1)-result.json` is the planning of round N); `fails.py` → `fails.txt`; `fails-detail.txt`; `classify.py` → `classify-out.json`; `deferred-list.txt`. |
| `backlog.json` v185 | `retro_runs[0]` (summary), `systemic_tasks` (SYS-n), `retro_policy.next_due`, round-199 rulings. |

## 2. A — nothing to implement
1. From `store/`: confirm `git rev-parse HEAD` = `5b1a2bb…`, `git status --short --untracked-files=all` is empty, and `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-199-r200-tree-sha256.txt` prints nothing.
2. Write `a-round-200.md`: the three results above and "no change, by RETRO policy". Do not run typecheck, lint, vitest or the code-reviewer; there is no diff.
3. Do not edit `retros/`, `lessons.md` or any B file. If you disagree with a lesson in part "Before handing over (A self-check)", write it in `a-round-200.md` under "Lesson feedback". B rules on it at round-201 planning.

## 3. C — what to verify
C writes `c-round-200.md` and `c-round-200.json`, incrementally. Rows:

| Row | Check | PASS means | FAIL means |
|---|---|---|---|
| **SOURCE-SCOPE** | Start and end: HEAD `5b1a2bb`, clean status, frozen list OK. | Nothing in `store/` changed. | Any change is a FAIL of the round, whoever made it. |
| **RT-NUM** | Recompute **every number** in `retro-200.md` from its named file or script. Re-run the `b-round-199/*.py` scripts; they only read loop files (copy them into `c-round-200/` first if you prefer, and run them from the loop root). Check at least: the per-phase cost totals, the FAIL-round list and its cost, the PASS/FAIL counts, the gate published/skipped counts, the deferred-Low totals and the window counts. | Every number matches its source within rounding (±0.01 USD; counts exact). | A number has no source or does not match. List each one. |
| **RT-CAUSE** | For each of the 14 C FAIL rounds in `retro-200.md` §3, open the cited C report (`c-round-N.md` / `.json`) and, where cited, the B ruling. Is the stated cause what the evidence says? | Each cause is traceable to a quoted line or id. Anything that is an inference is labelled as one. | A cause is invented, or an inference is stated as fact. |
| **RT-IDS** | For each systemic task SYS-n (`retro-200.md` §6 and `backlog.json` → `systemic_tasks`): every Low id it claims to close exists in `deferred_low_polish` or `open_findings`, is still open, and fits the stated root cause. Spot-check each SYS-n's code claim with one `grep` at HEAD. | All ids are real, open and in class; each code claim reproduces. | An id is missing, closed or out of class, or a code claim does not reproduce. |
| **RT-LESSONS** | `lessons.md` has ≤ 60 lines, exactly the three required parts, and each lesson is concrete and checkable (it names an observable check). Each lesson cites at least one evidence id or round that exists. | All true. | Over 60 lines, a vague lesson ("be careful…"), or a citation that does not exist. |
| **RT-SABA** | `retro-200.md` "For Saba": every project-rule change (`.claude/primitives/*`, `CLAUDE.md`, `.claude/agents/*`) is phrased as a **proposal**, and no such file changed. | True. | A rule file changed, or a proposal is phrased as already applied. |
| **R200-P1 (browser)** | REG-DUX5-PLAYHEAD-RESCAN (parked from C-R180-K8-PLAYHEAD-MASK; B did not carry it into round 199). `/studio-lab`, 1440×900 and 1280×720, default scene. Move the playhead to ~10 s with a ruler click, then run the round-180/199 "no brass" scan (R−B ≥ 45 device px) on the ring/hint boxes and the unselected clip bodies. Reuse `c-round-199/tools` (RV-TOKENS). | Brass pixels only on the playhead line and the overview playhead, at their new position; 0 elsewhere. | Brass elsewhere is a new finding. It is Low unless it hides content; the 2026-10-23 bug gate applies. |
| **G200-3 (browser)** | Fresh anonymous context, both viewports: `/studio-lab` shows the workspace and the demo badge; `/studio/middle-east` shows "Sign in required" and 0 `audio[src]`; `GET /api/studio-token` with no header → 401; with a fake Bearer → 403 (mock-backed on :5199). | As stated. | Any bypass is Critical. |

- **Gate rows** (`"gate"` in the JSON, never in `"passed"`): full vitest, typecheck, build, Biome, `npm run verify`, PROD-MP3-UNVERIFIED.
- **`browserVerified`:** true only if R200-P1 and G200-3 ran at both viewports. They are the round's only browser rows. The RT-* rows are document checks by RETRO policy; they are not skipped browser rows.
- **Ableton:** no new behaviour. Do not claim Ableton parity.
- **Consults (optional):** `qa-engineer` and `consequence-tester` may review the lessons for checkability. Record any disagreement as a finding against the retro, not as an edit.
- **Run budget:** the RT rows are reading work. Do not re-verify unrelated product features.

## 4. Outcome, fixed in advance
| C result | B at round-201 planning |
|---|---|
| All rows PASS | Round 201 = **SABA-B-4 stage 2**: store pages, one shared focus style on every store focusable, with the store half of GLOBAL-FOCUS-VISIBLE-UNLAYERED and C-R196-03. Then the systemic tasks in the order given in `retro-200.md` §6 and `backlog.json` → `systemic_tasks`, before STORE-2b. |
| An RT row fails (untraceable number, invented cause, wrong id) | B corrects `retro-200.md` / `lessons.md` / `systemic_tasks` **first** at round-201 planning and records the correction in `b-round-200.md`. The correction needs another C check only when a lesson or a SYS task changes substantively; then the next C round re-checks only the changed lines. SABA-B-4 stage 2 is still round 201. |
| R200-P1 finds Medium+ | Round 201 = bounded fix-up first (2026-10-23 bug gate). A Low goes to `deferred_low_polish`. |
| SOURCE-SCOPE fails | Stop. Root inspects the change. Nothing is published. |

## 5. Neighbour risk
None in app code: no source file changes. The risk is in the process. A wrong lesson would mislead every later round, so RT-LESSONS and RT-CAUSE are the important rows.

## 6. Deliverables
- A: `a-round-200.md`.
- C: `c-round-200.md`, `c-round-200.json` (`taskStatus`, `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, `rows`), evidence under `c-round-200/`.

## 7. Root notes
- Nothing to publish from `store/` unless SOURCE-SCOPE shows a change, and that change would itself be a FAIL.
- No-grant precedent: rounds 123–126 had only a `b-round-N-rN+1-tree-sha256.txt` and no grants file. The empty `b-round-199-r200-grants.txt` is deliberate and means "no grants"; there is no `granted-start` file.
- Proposal for root (`retro-200.md` §8 item 4): point the B/A/C runner prompts at `lessons.md`, and do not start C when `a-round-N.md` reports a STOP and no `b-round-N*` ruling exists.
- `retros/retro-200.md` "For Saba" lists rule-change proposals and two open questions (C-R188-I6 testimonials; OBS-R199-LEDGER demo titles). Root may forward them.
- The frontend-architect checkpoint request (`b-round-197.md` §6, + ARCH-R198-FOCUS-REGION) is still pending and non-blocking.
