# CURRENT TASK — Round 259: bounded fix-up C-R258-01 (stale perf harness: the `Pause` label and the old clip-body title). Test code and docs only; `app/` does not change

Dispatcher: B · Implementer: A · Verifier: C · Planned 2026-10-30 (`date -u`) · Decisions: **D-29z507 … D-29z514** (`backlog.json` → `decisions_log_b`, `rounds[259]`, `open_findings` C-R258-01).

**Read first:**
- `lessons.md` in full. These apply directly:
  - L11 (STOP);
  - L23 (grep before a rename);
  - L26 and L28 (implementation doc);
  - L29 (every named signal has a grep);
  - L30 (Biome ignores `perf/`, so use `npm run typecheck`);
  - L34 (grant the whole doc section);
  - L38 (perf runs alone).
  - L12 and L23 each gain one clause in this planning (D-29z512): a removed or renamed accessible name, title or testid is also grepped in `perf/**`, not only in `app/**/__tests__`.
- **The rules:** `docs/technical/studio-real-workspace/agent-workflow.md` (the speed rules, the 2026-10-23 bug gate and the cloud-runner section).
- **The previous task** is `tasks/round-258.md`, an exact copy of the round-258 `current-task.md` (`cmp` OK). C's result is in `c-round-258.json` and `c-round-258.md`. B's reasoning is in `b-round-258.md`.

## Baseline: HEAD `d732d26`, clean tree
- `gates/gate-round-258.json` = `skipped` ("C taskStatus FAIL"). The last published commit is still `d732d2623fc16032153aa262c3e7d41fca4ed59a` (gate 257, rounds 256 + 257).
- At planning, `git rev-parse HEAD` = `d732d2623fc1…` and `git status --short --untracked-files=all` is empty.
- The 7 protected files stay untouched:
  - `app/routes/studio.$productId.tsx`
  - `app/routes/api.studio-token.ts`
  - `app/routes/account.downloads.tsx`
  - `app/lib/__tests__/download-routes.test.ts`
  - `app/lib/auth.ts`
  - `app/contexts/AuthContext.tsx`
  - `app/entry.server.tsx`

## 0. Why this round (D-29z507)
- **The round-258 regression sweep ran in full:**
  - 114 browser rows PASS at 1440×900 and 1280×720;
  - `browserVerified=true` and `realVerified=true`;
  - smoke PASS;
  - no regression in app behaviour.
- **One Medium finding: C-R258-01, a regression in the harness, not in the app.** `npm run test:perf` aborts every pass of PERF-1a and PERF-1b-i:
  - **PERF-1a** waits for the Play button's `aria-label` to become `Pause`. SABA-B-9 stage 1 (round 256) made Play's name constant and removed Pause. The playing state is now `data-playing="true"`, plus the hidden `aria-describedby` state element from round 257.
  - **PERF-1b-i** looks up the clip-body title `drag = time selection · click = playhead`. SABA-B-10a (rounds 252–253) changed it to `… click = insert marker`.
- **Effect:** the fader, drag and playback budgets have been **unmeasured since gate 225 (`80fbb3b`)**. That includes the SABA-B-5 promise of "0 graph restarts during a drag while playing".
- **Why nobody noticed:**
  - `test:perf` is not a gate row;
  - B's L23 rename greps covered `app/**/__tests__` only (`b-round-258.md` §4, D-29z512).
- **Why a fix-up now:** `tasks/round-258.md` §7 row 2, fixed in advance, makes round 259 a **bounded fix-up**. RETRO 260 comes next, then SABA-B-9 stage 2 (D-29z511).

## 1. B's pre-check (L23, L29): the fix was applied to a scratch copy and run
- **Scratch copy:** `/tmp/b259-scratch/store`, made with `rsync` from `store/` without `.git`, `build` or `test-results`, and with `node_modules` symlinked.
  - Its own `test:perf` webServer built and served the scratch app on :5188.
  - Root's dev server on :5173 was not touched.
- **The scratch change** is H1–H4 of §2.1 (the diff is `b-round-258/precheck/perf-fix.diff`). H5 changes only the `note` text, which the run does not read.
- `npx tsc --noEmit -p .` on the scratch printed no error.
- **Scratch `npm run test:perf`, run alone (L38):** the log is `b-round-258/precheck/perf-run-1.log`, and the reports are under `b-round-258/precheck/reports/`. The result is in §1a.

### 1a. Scratch run result
- **rc 0, 3/3 specs passed in 13.5 min** (`b-round-258/precheck/perf-run-1.log` l.184, l.289, l.607, l.612–613):
  - PERF-1b-i: 5.2 min;
  - PERF-1b-ii: 1.1 min;
  - PERF-1a: 7.0 min.
- **Every report** (`latest.json`, `latest-interactions.json`, `latest-resources.json`) has `complete: true`, `failures: []`, and 6/6 passes (1× and 6×, 3 each) with `abortedAt: null`, 0 page errors and 0 problems.
- **The playing signal works:** `harness.audio-running` = 1 and `interact.harness.audio-running` = 1.
- **The SABA-B-5 fader budgets pass on the published app** (PERF-1a, track, group and master, 1× and 6×):
  - `*.playing.restarts` = 0;
  - `move-components-max` = 1 (budget ≤ 3);
  - `move-components-per-move` = 0.74–0.75;
  - `release-commits` = 1 (budget ≥ 1).
- **No further stale selector was found.** H1–H4 are sufficient, so no H6 is expected. If A's run differs, §2.1's DEVIATION/STOP rule applies.
- **Preview of the interactions oracle** (report only; `b-round-258/precheck/equiv-interactions.txt`, against `c-round-225/latest-interactions.json`):
  - Every per-commit component count is **+6 to +7** compared with `80fbb3b`. For example, `interact.play.start-components` went 87 → 94, the drag `move-components-max` rows 98 → 105, and `interact.zoom.30.components-per-key` 240 → 247.
  - These are `record` rows, not budgets. B rules them at the 259 → 260 planning from C's run. Until then they are recorded as the signal INFO-B259-COMPONENT-DRIFT for STUDIO-PERFORMANCE.
  - The "kind must become wallclock" lines are the round-224 → 225 reclassification check of that script and are not deltas.

### 1b. Signal greps (L29), at `d732d26`
- `grep -rn "data-playing" app/components` gives 1 hit:
  - `app/components/arrangement/ArrangementTransport.tsx:248`, `data-playing={isPlaying ? 'true' : 'false'}` on the Play button;
  - the button is rendered unconditionally (no surrounding branch).
- `ArrangementTransport.tsx` l.236–273: neither button's name ever changes.
  - Play has `aria-label={studioPlaybackStrings.playLabel}` = `'Play'` (`app/lib/arrangement/strings.ts` l.223).
  - Stop has the `aria-label` `'Stop'` (l.224).
- `app/lib/arrangement/strings.ts` l.694: `rangeBodyTitle: 'drag = time selection · click = insert marker'`.
- `grep -rn "Pause\|click = playhead" perf` over the whole folder gives **6 hits, all six covered by §2.1**:
  - `perf/lib/page.ts` l.63, l.70 and l.76;
  - `perf/studio-lab-interactions.perf.spec.ts` l.110;
  - `perf/budgets.json` l.28 (`note`);
  - `perf/budgets.interactions.json` l.39 (`note`).
- **Docs that describe the old signal (L34):**
  - doc 163, l.73 in `## მეტრიკების განმარტება და ზღვრები` and l.100 in `## პრობლემები და გადაწყვეტები`;
  - doc 168, l.48 in `### Liveness-ის წესები` and l.208 in `## Hygiene (PERF-1a)` (l.205–210).
  - Doc 175 l.59 is a historical record of round 214 and stays as it is.

## 2. A — what changes

### 2.1 Test code (`perf/`), all mandatory
| # | File | Old → new | Why |
|---|---|---|---|
| H1 | `perf/lib/page.ts`, `playButton` (l.62–63) | `getByRole('button', { name: /^(Play|Pause)$/ })` → `getByRole('button', { name: 'Play', exact: true })` | Pause no longer exists. `Stop` is a separate button with its own name. |
| H2 | `perf/lib/page.ts`, `isPlaying` (l.68–71) | Reads `aria-label === 'Pause'` → reads `getAttribute('data-playing') === 'true'`, still **and** `audioRunning(page)` | `data-playing` is the only programmatic playing signal on Play (§1b). The `audioRunning` half (GATE206-S6) stays. |
| H3 | `perf/lib/page.ts`, `setPlayback` (l.73–78) | `toHaveAttribute('aria-label', playing ? 'Pause' : 'Play', { timeout: 15000 })` → `toHaveAttribute('data-playing', playing ? 'true' : 'false', { timeout: 15000 })` | The same wait on the new signal. The 15 s timeout and the Space press are unchanged. |
| H4 | `perf/studio-lab-interactions.perf.spec.ts`, `dragTarget` `'range'` (l.110) | `'drag = time selection · click = playhead'` → `'drag = time selection · click = insert marker'`, keeping `exact: true` | Matches `strings.ts` l.694. |
| H5 | `perf/budgets.json` l.28 and `perf/budgets.interactions.json` l.39 | In each `note`, the words about the Play button's label turning or being `Pause` → the Play button's `data-playing` attribute turning or being `true` | **Only the `note` text changes.** Every `id`, `mode`, `budget`, `unit` and `determinism` field, and the row order, stay byte-identical. C diffs them. |

- **No other change in `perf/`.** In particular:
  - no budget value, window, scenario order, wait, repetition count or `determinism` class changes;
  - `perf/lib/report.ts`, `determinism.ts`, `stats.ts`, `budgets.ts`, `instrumentation.ts` and `report.test.ts` do not change.
- **If A's own `npm run test:perf` aborts at a step that §1a did not list:**
  - **The same kind of drift** is a locator or expected text that an intended app change renamed, with the D-ID or round found through `git log -p` of the app file. A adapts that one locator and reports it as **"DEVIATION H6: <file:line> old → new, app source <file:line>, changing round <N>"**. C checks it.
  - **Anything else** (a changed scenario, a budget, a timing) is a **STOP — needs B ruling** (L11).
- **A budget assertion that fails on a valid, isolated run is not A's to fix.**
  - A reports it at the top of `a-round-259.md` with the row id, the value and the budget.
  - A does not change the budget, the window or the scenario.
  - B rules the severity (§6), not A.

### 2.2 Docs (L34: whole sections granted)
- **Doc 163** (`docs/implementation/2026/quarter-IV/163-studio-perf-harness.md`):
  - granted: the whole `## მეტრიკების განმარტება და ზღვრები` section (l.58–83) and the whole `## პრობლემები და გადაწყვეტები` section (l.95–104);
  - replace the "Play label Pause" wording with the `data-playing` wording. Nothing else changes in meaning.
- **Doc 168** (`docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`):
  - granted: the whole `### Liveness-ის წესები` section (l.39–52) and the whole `## Hygiene (PERF-1a)` section (l.205–210);
  - the same replacement. The range row of the liveness table needs no change.
- **Doc 175** l.59 is a historical record of round 214 and is **not** granted.
- **New implementation doc:** `docs/implementation/2026/quarter-IV/194-perf-harness-playing-signal.md`.
  - 194 is the next free number (`ls` ends at `193-saba-b-9-centre-transport.md`).
  - Georgian, with technical terms in English.
  - Its `## ` headings contain the seven TEMPLATE headings in order (L26).
  - l.4 is exactly `**სტატუსი:** Completed (C round 259 PASS)` (L28).
  - It names C-R258-01, the six stale hits, the rounds that renamed them (252–253 and 256), and the new grep rule (D-29z512).
  - It cites only tests that exist (L26).
- **Docs not granted:** every other file under `docs/`. The `docs/technical/**` files that mention a "Pause" button describe the legacy player and are outside this round.

### 2.3 Forbidden
- Everything in `global_forbidden_files` and `global_forbidden_actions`.
- The 7 protected files.
- **All of `app/`.** This round changes no app source and no app test.
- `package.json`, `package-lock.json`, `playwright.perf.config.ts`, `biome.json`, `tsconfig.json` and `.claude/**`.
- Commit, push, stash, checkout, deploy and dev-server restarts. Root's server runs on :5173; `test:perf` starts its own on :5188 and stops it.

### 2.4 A's checks (speed rules)
- `npm run typecheck`. It covers `perf/**`; Biome does not (L30).
- `npm run lint` (app scope). It must stay clean even though `app/` does not change.
- `npm run test:perf`, **alone** (L38): no vitest, tsc, build or browser job runs at the same time. Paste its summary into `a-round-259.md`: rc, specs passed, `complete`, aborts and failed budget rows.
- No full vitest and no `npm run verify`: those are gate rows.
- **Code review:** the change touches 4 test files and 3 docs (7 files), so A asks `code-reviewer` (3+ files).
  - Its findings go into the report with severities.
  - An Architecture note goes to B as a signal.

## 3. C — acceptance (perf alone, in this order)
| Row | What | PASS when |
|---|---|---|
| SOURCE-SCOPE-start / -end | `git status --short --untracked-files=all` and `git diff --name-only` | <ul><li>Only these paths changed: `perf/lib/page.ts`, `perf/studio-lab-interactions.perf.spec.ts`, `perf/budgets.json`, `perf/budgets.interactions.json`, docs 163 and 168, and the new doc 194.</li><li>`git diff --quiet` on the 7 protected files and on `app/` returns rc 0.</li></ul> |
| H-DIFF | `git diff -U0 perf/` | <ul><li>The hunks are exactly H1–H5, plus any reported DEVIATION H6 with its app source cited.</li><li>In `budgets*.json`, `note` is the only changed key on any row: the files with `note` removed are identical before and after (`jq` or equivalent).</li></ul> |
| H-GREP | `grep -rn "Pause\|click = playhead" perf` | 0 hits. |
| H-SIGNAL | Browser, `/studio-lab` on :5173 at 1440×900 and 1280×720. Count `getByRole('button', { name: 'Play', exact: true })`. Wait for `Demo collection ready` (L48). A fresh lab is an **empty** arrangement, where Space only says "Nothing to play — add a clip from the library first." (C round 258 RP-SPACE-EMPTY). So first run the harness's own recipe (`perf/studio-lab.perf.spec.ts` l.565–570): click `getByRole('button', { name: 'Add', exact: true })` and wait until `[data-clip-kind="audio"]` has count 1. Then blur the active element (`document.activeElement.blur()`, as `blurActive` does in `perf/lib/page.ts` l.32) and press Space twice, ≥ 1.5 s apart | <ul><li>Exactly 1 Play match.</li><li>`data-playing` goes `false` → `true` on the first Space and back to `false` on the second.</li><li>This proves the new locator and signal on the live dev app, independently of the harness. B's scratch PERF-1a run (§1a) is the baseline evidence that this sequence flips the attribute on the built app.</li><li>B ran this exact recipe at `d732d26` on :5173 (`b-round-258/probe/hsignal.cjs` → `hsignal.json`): both viewports gave count 1, `false` → `true` → `false`, with 1 clip.</li></ul> |
| RR-PERF-259 | `npm run test:perf` alone, after H-SIGNAL, with nothing else running (L38) | <ul><li>rc 0 and 3/3 specs pass.</li><li>Every pass has `complete: true`, 0 aborts and 0 page errors.</li><li>Every budget row passes its contract.</li><li>**Explicitly:** `harness.audio-running` = 1 and `interact.harness.audio-running` = 1 (the playing signal works).</li><li>Every PERF-1a fader row for graph restarts during a drag while playing = 0.</li><li>The committed-components-per-move rows are within budget, and the release rows show ≥ 1 commit. This is SABA-B-5 / RR-FADER, carried from round 258.</li></ul> |
| RR-PERF-ORACLE | `python3 -I b-round-224/scripts/equiv-check-b2.py` against `c-round-225/latest-interactions.json` and `latest-resources.json` | <ul><li>Report only, not a pass criterion.</li><li>List every deterministic row that differs, with the scenario id and both values.</li><li>B rules the deltas at the 259 → 260 planning (L10). B's scratch run (§1a) is a preview, not the ruling.</li></ul> |
| DOC-259 | The granted sections of docs 163 and 168; doc 194 | <ul><li>The granted sections describe the live `perf/lib/page.ts` signal (`data-playing`, `audioRunning`, `start()` ≥ 1) and no longer say Pause (L34).</li><li>Doc 194 has the TEMPLATE headings in order (L26), l.4 byte-exact `**სტატუსი:** Completed (C round 259 PASS)` (L28), and every test it cites exists.</li></ul> |
| G259-AUTH | As G258-3 | <ul><li>`/studio-lab` shows the workspace and the demo badge anonymously; `auth_user` is null.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>`/api/studio-token` with no header → 401; with a fake Bearer → 403 or 500. Never 200.</li><li>The SRW-21 mount is BLOCKED (backend unavailable in cloud).</li></ul> |
| Gate rows (not claimed) | full vitest, typecheck, build, Biome, `npm run verify` | Root's gate. |

- **Validity and budget:**
  - The perf run gets one valid run, plus at most two replacements for environment-invalid runs (an overlapped job, a cold-compile timeout).
  - A failure that repeats is a finding.
  - A tolerance is never loosened.
- **Budget failures are judged row by row (fixed in advance):**
  - **Medium:** a fader, drag or playback budget that fails on a valid isolated run. It is filed against the item that owns the budget (PERF-FADER-a/b/c or PERF-1b-i), not against this harness fix.
  - **Low:** any other budget failure.
  - **FAIL of this round:** an abort, `complete: false`, or a liveness row at 0.
- `browserVerified` covers H-SIGNAL and RR-PERF-259 (the perf specs drive a real Chromium).

## 4. Neighbour risk
| Risk | Check |
|---|---|
| The new `playButton` matches more than one button (for example a library "Play" preview) | H-SIGNAL counts exact matches with a clip added; Playwright's strict mode would also abort on 2 |
| H-SIGNAL on an empty lab never plays (Space only reports "Nothing to play") | H-SIGNAL adds a clip first with the harness's own Add recipe, then blurs focus before Space |
| `data-playing` flips before the audio really runs | `isPlaying` keeps `audioRunning`; `harness.audio-running` still needs ≥ 1 `start()` (GATE206-S6) |
| A budget changes silently along with the note edit | H-DIFF compares `budgets*.json` with `note` removed |
| The perf run disturbs root's :5173 server or C's tabs | L38: perf runs alone, on :5188 |
| After the range drag, Space now plays from the time selection's start (SABA-B-10a) | The harness presses Home before each playing drag (`studio-lab-interactions.perf.spec.ts` l.295, l.513). B's scratch run (§1a) shows that this order still yields "playing" |

## 5. Deliverables
- **A:** `a-round-259.md`, with:
  - the start HEAD;
  - the diff summary for H1–H5, plus any H6;
  - the `npm run typecheck`, `npm run lint` and `npm run test:perf` results;
  - the code-reviewer findings, and the Architecture note if there is one.
- **C:**
  - `c-round-259.json`, with `browserVerified`, `realVerified`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `observations`, `invalidRuns` and `lookups`;
  - `c-round-259.md`;
  - evidence under `c-round-259/`.
- **Every bug** gets:
  - an id `C-R259-NN`;
  - a severity;
  - the item;
  - the steps;
  - the evidence path;
  - "regression yes/no", with the round of the last pass.

## 6. Outcome, fixed in advance
| C result | B at the round 259 → 260 planning |
|---|---|
| PASS | <ul><li>Close C-R258-01. PERF-HARNESS-SHARED-LIB goes back to **მზადაა**, and the PERF-FADER "0 restarts while playing" evidence is current again.</li><li>Round 260 = **RETRO** (15 rounds after 245; it analyses this miss).</li><li>Round 261 = **SABA-B-9 stage 2** (master volume to the bottom-right, plus the cheap gate-257 Lows if it grants `ArrangementTransport.tsx`).</li><li>Then SABA-B-11c.</li></ul> |
| FAIL on the harness itself (an abort, liveness 0) | Round 260 = the same fix-up again, with B's ruling. RETRO moves one round. |
| PASS on the harness, but a Medium budget finding | That finding gets its own bounded round, after RETRO 260 and before SABA-B-9 stage 2, under the 2026-10-23 bug gate. |
| Low budget findings only | They go to `deferred_low_polish`; otherwise the same as PASS. |

## 7. Root notes
- **Gate on C PASS:** the diff is test code and docs only. The gate's full verify does not run `test:perf`, so C's RR-PERF-259 is the evidence for the perf half.
- **Systemic candidate for RETRO 260 (not a 259 grant): PERF-HARNESS-STRINGS-DRIFT.**
  - The perf harness could import its labels and titles from `app/lib/arrangement/strings.ts` (which imports only `./shortcuts`).
  - Or the gate could run a short `test:perf` smoke.
  - Either way, the next rename would then break a checked run instead of silently breaking the harness.
  - B records it in `retro_candidates`, and RETRO 260 decides. A rule change to the gate is a proposal for Saba and root.
- The existing root request `b-round-223-root-request-vitest.md` (include `perf/**/*.test.ts` in vitest) still stands. It would not have caught this miss, because the spec files are Playwright specs, not vitest tests.
