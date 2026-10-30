# B — Round 258 → 259 planning

Date: 2026-10-30 · Author: B · Decisions: D-29z507 … D-29z514 · Output: `current-task.md` (round 259), `tasks/round-258.md` (archive, `cmp` OK), `b-next.json`.

## 1. Inputs read
- `context/active-summary.md`.
- `gates/gate-round-258.json`: `skipped` ("C taskStatus FAIL"). No new publication, so the baseline stays `d732d26` (gate 257).
- `c-round-258.json` and `c-round-258.md`: 114 PASS, 1 FAIL (RR-PERF), 5 BLOCKED (backend), `browserVerified=true`, `realVerified=true`.
- `a-round-258.md`: baseline only, no change, as the task asked.
- `tasks/round-258.md` §6–§10.
- `lessons.md`.
- The perf harness source (`perf/lib/page.ts`, `perf/studio-lab-interactions.perf.spec.ts`, `perf/budgets*.json`), `ArrangementTransport.tsx` l.225–273, `strings.ts` l.223/224/694, and docs 163, 168 and 175.
- The backlog entries looked up by id: STUDIO-PERFORMANCE stages, `regression_rounds[-1]`, INFO-C248-ADAPTIVE-3, `rounds`.
- `user-review/`: no new Saba decision file. AGREE-SABA-B-7 is still awaiting him.

## 2. Ruling on C round 258 (D-29z507)
- **Was the sweep complete?** Yes. Every runnable browser row ran at both viewports. The five BLOCKED rows are backend-only, and under the cloud rule they do not make the round unverified.
- **Finding C-R258-01 (Medium):** I accept C's severity and C's analysis.
  - I re-checked the source myself. `perf/lib/page.ts` l.63/70/76 still uses `Pause`, and the interactions spec l.110 still uses the old title. The app exposes `data-playing` at `ArrangementTransport.tsx:248` and the new title at `strings.ts:694`.
  - It is a test-code regression, not an app defect: RR-TRANSPORT and RG-04 pass in the browser.
  - It is Medium because it hides the fader/drag/playback budgets, which is the task's own §6 rule.
- **Outcome:** `tasks/round-258.md` §7 row 2 applies.
  - `regression-last.json` is set to 2026-10-30, round 258, because the sweep ran. The next sweep is due on or after 2026-11-02.
  - Round 259 is a bounded fix-up.
- **Item statuses (§7 note):** only PERF-HARNESS-SHARED-LIB changes, to ბაგია. PERF-FADER a–c stay მზადაა, because no app defect was reproduced. Their restart and commit evidence is flagged as stale since gate 225 and is re-measured in round 259 (D-29z513).
- **Oracle deltas (L10, D-29z508):**
  - PERF-1b-ii resources: the 15 deterministic deltas are all smaller pages and bundles. I accept them as intended drift.
  - Interactions: no comparison was possible because the run aborted. That ruling moves to the 259 → 260 planning, and C's valid round-259 run becomes the new oracle.
- **Observations:**
  - SA-28 cannot be reached in adaptive mode, so the row is reworded for the next sweep (D-29z509).
  - C's lookups (stale template values) are recorded as `template_corrections_d29z510` on the regression entry.
  - RS-4B's pre-existing Lows are unchanged and keep their deferred entries (INFO-C258-OBS).

## 3. Pre-check on a scratch copy (L23, L29)
- **The scratch:** `/tmp/b259-scratch/store`, an `rsync` of `store/` without `.git`, `build` or `test-results`, with `node_modules` symlinked. Root's :5173 server was not touched; the perf webServer used :5188.
- **Side effect to note:** the scratch build ran with `node_modules` symlinked into `store/`, so Vite/Playwright may have written their caches under `store/node_modules/.vite` (gitignored). `git status --short --untracked-files=all` in `store/` was still empty afterwards, and HEAD was still `d732d26`. Nothing tracked was touched.
- **The changes:** H1–H4 applied (`b-round-258/precheck/perf-fix.diff`). `tsc --noEmit` printed no error.
- **The run:** `npm run test:perf` alone. Its log and reports are under `b-round-258/precheck/`.
- **Result:** rc 0 and 3/3 specs passed (13.5 min). All reports have `complete: true`, 0 aborts and 0 page errors. Both audio-running rows = 1. The fader rows pass on the published app: restarts while playing = 0, at most 1 component per move, and 1 commit on release. No further stale selector was found. The interactions oracle preview shows +6 to +7 components per commit since `80fbb3b` on record rows, recorded as INFO-B259-COMPONENT-DRIFT and ruled from C's run (details in `current-task.md` §1a).
- **Greps:** `perf/**` has exactly 6 stale hits, all of them granted. `data-playing` has 1 render site, which is unconditional.

## 4. Why we missed it (for RETRO 260)
- **Which phase should have caught it:** B's L23 pre-check in rounds 252 (the title) and 256 (the Pause name).
- **Why it did not:**
  - L23 and L12 named `app/**/__tests__` as the grep root.
  - `perf/**` is Playwright code, not vitest, so A's covering tests never ran it.
  - The gate does not run `test:perf`.
  - So the harness was silently stale for 33 rounds.
- **The rule (D-29z512):** grep `perf/**` as well as `app/**/__tests__` for every removed or renamed accessible name, title, label or testid. This is added as a clause to L23 and L12, with no new id, and the file stays at 59 lines.
- **The systemic option** (import the strings, or a gate-side perf smoke) is recorded as the retro candidate PERF-HARNESS-STRINGS-DRIFT. It is not granted in round 259, to keep the fix bounded and because Playwright import resolution of `app/` code was not proven in this planning.

## 5. Order (D-29z511)
- **259:** the fix-up.
- **260:** RETRO. It is 15 rounds after 245, and it should analyse this miss while it is fresh.
- **261:** SABA-B-9 stage 2 (master volume to the bottom-right, plus the cheap gate-257 Lows if `ArrangementTransport.tsx` is granted).
- **Then:** SABA-B-11c, after the `ableton-arrangement-expert` consult on the off-grid offset.
- **If a Medium budget finding appears in 259,** it gets its own bounded round after RETRO 260 and before stage 2.

## 6. Consults (D-29z514)
- **Advisor:** available and used before writing. It confirmed the fix-up and the regression date, asked for the scratch run, the `perf/**` lesson clause and RETRO first, and asked me to keep the strings import out of scope.
- **No project agent was consulted.** This is a test-only harness fix with no feature behaviour, and the reference-first rule does not apply to test-only rounds.
- **No web search.**
- **Architecture:** nothing new. No frontend-architect checkpoint is requested at this boundary, because the existing pending checkpoints (TRANSPORT-POSITIONS and others) are unchanged.

## 6a. Advisor fix before hand-off
- **H-SIGNAL rewritten.** A fresh lab is empty, so Space does not play there (C round 258 RP-SPACE-EMPTY). The row now adds a clip with the harness's Add recipe and blurs focus before Space. B ran it on :5173 at both viewports (`b-round-258/probe/hsignal.json`): 1 Play match, `false` → `true` → `false`.

## 7. Not COMPLETE, not BLOCKED
- **Not COMPLETE:** C-R258-01 is open (Medium). Also remaining are SABA-B-9 stage 2, SABA-B-11c, SABA-B-7 (awaiting_user), STUDIO-PERFORMANCE, STORE-REDESIGN 2b–5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and the deferred Lows.
- **Not BLOCKED:** round 259 is runnable in the cloud.
