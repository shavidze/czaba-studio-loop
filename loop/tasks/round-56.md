# CURRENT TASK — Round 56: C-R48-01, add test-timeout headroom to the four StudioWorkspace test files that time out under load (test-only), and carry the stage-4a browser acceptance

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- Decision record: **D-29z21** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-55.md`.
- Round size: **one Medium bug, one owner (A), test files only.** No app source changes and no new feature. Nothing is cut: stage 4b, 4c and SRW-15..20 move later (§7).

> **ROOT ACTION REQUIRED BEFORE C (environment, not BLOCKED) — FOURTH ROUND.** `http://127.0.0.1:5173` and `:5199` were down in rounds 52–55: A round 55 at 19:41–19:52; C round 55 `000` at 19:55, 20:04 and 20:06; B `000` at 20:07 and 20:11 (`b-round-55/gates.txt`). No stage-4a browser ID and **no purchase-protection browser check (G-3) has ever run.**
> - Probable cause: ENV-VITE-ENOMEM-R53 (Vite FSWatcher `ENOMEM … scandir playwright-report`).
> - Root: start the Store dev server **and** the backend before C, **or** answer yes/no: can they be restored? A "no" changes B's round-57 decision (`b-round-55.md` §6). Agents never start or stop servers.
> - Round 56 does not need the browser for its own change. If the servers are up, C also runs the carried browser half (§4.5).
>
> **Browse rules** (`backlog.harness_rules`, unchanged): never `$B restart`; a **new** `BROWSE_STATE_FILE` under your own round folder; after one CLI-daemon failure use the approved `server-node.mjs` fallback from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0` (record PID and log; stop only your own process). **GSTACK-NO-MOUSE:** every drag, trim, Shift and Alt case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
>
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`; do **not** export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 55 result** (`c-round-55.md`, `c-round-55.json`): **C BLOCKED (environment).**
- **PASS (offline):**
  - G55-2: HEAD `038ed5a`, 17 lines, frozen list 410 OK, protected 4/4.
  - R55-S: one hunk in `ArrangementClip.tsx`; the test change is a pure append.
  - R55-U: mutations (a), (b) and (c) killed exactly their named tests. Probes PS-TOUCH/PS-FREE/PS-SAME → 6.0004; PS-GHOST and PS-MIDDRAG pass.
  - G55-1: tsc 0, 87 / 1504, build OK, verify rc 0, Biome at baseline.
- **C-R54-01 and C-R54-02 are fixed at unit/probe level.** The browser checks SH-CROSS and SH-SAME are pending. No new defect was found.
- **Not run (environment):** every browser ID and G55-3.

**Why C-R48-01 now:** D-29z20 made round 56 conditional. Root did not answer the config request (no root activity since 11:11), and stage-4a has no browser evidence. **C-R48-01 (Medium)** makes the `npm run verify` gate unreliable: all 3 of C's full runs in round 54 failed on 5000 ms timeouts in unchanged files. One quiet pass in round 55 does not close it. Fixing it needs no browser, and B does not add more grid code without stage-4a browser evidence.

**The real victim set**, taken only from `Test timed out in` lines in A/C runs of rounds 51–54:

| Test | File | Count |
|---|---|---|
| `folds a lane to a 36 px row …` | `track-layout.test.tsx` | 8 |
| `writes no history for fold, height or auto-fit …` | `track-layout.test.tsx` | 1 |
| `adds three sounds from two collections …` | `sfx-library.test.tsx` | 5 |
| `searches tags, filters collections …` | `sfx-library.test.tsx` | 1 |
| `renders the Master group with Mute …` | `master-ui.test.tsx` | 1 |
| `Clip Gain typed "3" → the same SFX header click …` | `fader-guards.test.tsx` | 1 |
| GS14 | `grid-snap-ui.test.tsx` | 1 |
| SD1 | `grid-snap-loop-drop.test.tsx` | 1 |

The two `grid-snap-*` files are **out** of this round. Each had a single timeout, and both belong to the uncommitted round 50–55 unit that root will commit as one piece. The residual is recorded as `C-R48-01-GRID-RESIDUAL` (Low).

**Durations run alone** (B, 20:12, `node.exe` 9, `b-round-55/named-before-verbose.txt`; 4 files, 128/128):

| Test | ms |
|---|---|
| fold | 1579 |
| adds three | 1845 |
| searches | 692 |
| renders | 413 |
| no-history | 251 |
| Clip Gain "3" (`fader-guards`) | 84 |

Under load these exceeded 5000 ms, up to 8454 ms (`fader-guards` in C round 54). B also measured Biome on the 4 files: **0 diagnostics**, "Checked 4 files … No fixes applied", rc 0 (`b-round-55/biome-owned.txt`). The "0 diagnostics" criterion below is therefore a no-regression criterion.

## Baseline

Measured by B on 2026-10-17 at 20:11 +04 (`b-round-55/gates.txt`).

**Content baseline** (rounds 50–55 are uncommitted). One of these must hold:
- **(A)** HEAD is `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` lists **exactly** these 17 paths:
  ```
   M app/components/arrangement/ArrangementClip.tsx
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/ArrangementLoopBrace.tsx
   M app/components/arrangement/ArrangementRuler.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
   M app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
   M app/lib/arrangement/__tests__/selection.test.ts
   M app/lib/arrangement/grid.ts
   M app/lib/arrangement/selection.ts
  ?? app/lib/arrangement/__tests__/grid-edges.test.ts
  ?? app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx
  ?? app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
  ?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
  ?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
  ?? docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md
  ?? docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md
  ```
- **(B)** Root has committed the round 50–55 unit: HEAD is one or more newer **root** commits on top of `038ed5a`, their combined stat contains exactly those 17 paths, and `git status --short` is empty. Root may commit on unit evidence; that is root's decision (ROOT-COMMIT-ROUND51).

In both cases:
- **Frozen list:** `../tmp/studio-real-loop/b-round-55-r56-tree-sha256.txt` has **409** entries, all OK (run it from `store/`).
  - It contains every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned test files.
  - The round-55 files `ArrangementClip.tsx`, `grid-snap-clip-edges.test.tsx` and doc 048 are now **frozen**.
- **Snapshots:** `../tmp/studio-real-loop/b-round-55-r56-snapshots/` with `SHA256SUMS.txt`. Every snapshot file is LF with 0 CRLF, and none is modified in git:

  | File | sha256 prefix | LF lines | `it` lines (grep `^\s*it\(`) | tests run alone |
  |---|---|---|---|---|
  | `track-layout.test.tsx` | `8e08f456` | 1175 | 36 | 36 |
  | `sfx-library.test.tsx` | `b449496a` | 182 | 3 | 3 |
  | `master-ui.test.tsx` | `ee7fafe1` | 701 | 18 | 18 |
  | `fader-guards.test.tsx` | `f60b34d9` | 1721 | 63 | 71 |

- Anything else is a **stop and report**: another HEAD, extra paths, or a snapshot or frozen-list mismatch. If case (B) holds, a frozen-list mismatch inside exactly the 17 committed paths is impossible, because their content is unchanged.

**Other measurements:**
- Protected files 4/4 OK; tsc 0; `node.exe` 9; `/studio-lab` 000, `:5199` 000.
- Full vitest at round-55 end: **87 files / 1504** (A and C both rc 0).
- Biome `./app`: **5 / 218 / 1**. The 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`.

**Line endings:** the 4 owned files are **LF**. Count EOLs with node (`/\r\n/g` vs `/\n/g`). Diff with `diff -u --strip-trailing-cr` against the snapshots. Never run `npx biome check --write` on a file you do not own.

**Rules:**
- Do not revert, re-create or reformat anything; the work of rounds 47–55 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z21 (C-R48-01)

**Every top-level `describe` in the 4 owned files gets the suite option `{ timeout: 15_000 }` as its second argument.** Nothing else in those files changes.

| File | Top-level `describe` (line in snapshot) |
|---|---|
| `app/lib/arrangement/__tests__/track-layout.test.tsx` | l.256 `track fold, height and lane auto-fit (SRW-11B stage 2, D-29, R11-U)`; l.790 `panel polish 14a (…)`; l.1042 `separator Home and the detail-panel ref (…)` |
| `app/lib/__tests__/sfx-library.test.tsx` | l.92 `Purchased SFX library` |
| `app/lib/arrangement/__tests__/master-ui.test.tsx` | l.260 `Master bus (SRW-13 stage 1, FB-14, D-29p)` (the 4 nested describes inherit) |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | l.251 `fader keys and pointers (C-R31-02, C-R31-01; D-29w)` (every nested describe inherits, including the 2-level one at l.1607) |

Form: `describe('<unchanged title>', { timeout: 15_000 }, () => {`. Biome may wrap the line; that is part of the same hunk. A literal `15000` is also acceptable if Biome prefers it. The value must be exactly 15 000 ms.

**Mechanism, checked by B in the installed runner** (vitest 4.0.16, `node_modules/@vitest/runner/dist/index.js`):
- `describe(name, options, fn)` is the supported form. Options as the third argument throw in Vitest 4 (l.727).
- Suite options are merged into each test's options (l.817–818).
- Nested describes inherit the parent's options (l.942–944).
- A test's timeout falls back to `runner.config.testTimeout` (5000) only when it has none (l.757).
- Hook timeouts (`beforeEach` etc.) are **not** changed (they keep `hookTimeout`).

A must prove this behaviour empirically (§2.2).

**What this is and is not:**
- **It is headroom, not a speed fix.** A real hang still fails, at 15 s instead of 5 s.
- **No assertion, fixture, helper, `it` title, `it` count or test order changes.** `it` stays at **1504** in 87 files.
- **No config change.** `vitest.config.ts` belongs to root.
- **No `vi.setConfig`, no per-`it` numeric timeouts, no `retry`, no `.skip`/`.todo`, no fake timers.**
- **Why 15 000:** the slowest of these tests takes about 1.85 s alone, and the worst observed under load was 8.45 s. 15 s gives about 1.8× the worst observation and about 8× the alone time, and it stays far below a value that would hide a hang (no 60 s).

**Why not the root config, why not every mounting file:** the config is root's lever; B asked twice and got no answer, and it remains welcome (§6). 26 test files mount `StudioWorkspace`. Only these 4 (plus the 2 grid residuals) have ever timed out, so the change stays bounded to the evidenced set.

### 0.2 Source

**No app source file changes.** Only the 4 owned test files (one describe line each, 6 lines in total) and the new doc 049.

### 0.3 B decisions (D-29z21)

- **C-R48-01 → this round** (test-only, as named in D-29z20 §6.2 option (b)).
- **C-R54-01, C-R54-02** → fixed (unit + probe), not closed; the browser checks SH-CROSS and SH-SAME are carried (§4.5). **C-R53-01** is the same: CX-VIDEO and EP-CROSS are carried.
- **INFO-R55-REFUSAL-STATUS-ON-RELEASE → accepted.** It matches D-29z4 / R39-ST: a temporary refusal message ends with the gesture, and the release writes the unchanged-drag status. No task.
- **INFO-R55-FREE-ROUND-UNGUARDED and A-R55-REVIEW-SHIFT-MIDDRAG-TEST → stage 4b's test additions.** That round reopens the grid-snap tests. Not this round.
- **A-R55-REVIEW-NONCANONICAL-START → accepted** (consistent with the Shift contract).
- **Architecture:** the round-55 reviewer's signals 3 and 1 are appended to ARCH-CHECKPOINT-SRW14-PREFS. They are not scheduled (§6).

### 0.4 What could be affected (C checks)

- The 4 files' tests must stay green with identical counts and comparable alone-durations.
- A hang inside an owned file must still fail (at 15 s).
- Tests outside the owned files must keep the 5 s default.
- The rest of the full suite: 87 / 1504, `render-budget`, `gesture-guard`.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `AGENT_DISCOVERABLE_CODE.md`;
   - `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A) or (B);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-55-r56-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `(cd ../tmp/studio-real-loop/b-round-55-r56-snapshots && sha256sum -c SHA256SUMS.txt)` and `cmp` each owned file with its snapshot;
   - protected files 4/4; Biome numbers; `node.exe`; dev-server state.
3. **Alone-durations before the edit:** `npx vitest run <the 4 files> --reporter=verbose` → `a-round-56/named-before.txt`. Record every test listed in "Why this round".
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Test files

Exactly §0.1: 6 describe lines across the 4 files. No other byte changes. No comments, `any`, type assertions or `@ts-ignore`; semicolons stay as they are. Run `npx biome check` on the 4 files; the result must be 0 diagnostics. Biome's `--write` may be applied to these 4 files only.

### 2.2 Mechanism proof (scratch only, outside `store/`)

Make a scratch copy of the current tree with the edited files, a `node_modules` junction and your own vitest config, as in round 55. Write `a-round-56/mechanism.txt` with the command, the result line and the reported timeout for each case:

| # | Scratch change | Expected |
|---|---|---|
| M1 | In `track-layout` the fold test, insert `await new Promise<void>(() => undefined);` as its first statement | that test fails with `Test timed out in 15000ms`; the other 35 pass |
| M2 | Same insertion in the `fader-guards` test nested two levels deep (inside the l.1607 describe; pick its first `it`) | fails with `Test timed out in 15000ms` (proves nested inheritance) |
| M3 | M1, plus remove `{ timeout: 15_000 }` from that describe | fails with `Test timed out in 5000ms` (proves the option is what applies) |
| M4 | Same insertion in a non-owned mounting file: `grid-snap-ui` GS14 | fails with `Test timed out in 5000ms` (default untouched outside the owned files) |

If a case does not behave as expected, **stop and report**. Do not change the mechanism without B.

### 2.3 After the change

- **Alone-durations after the edit:** the same command → `a-round-56/named-after.txt`. Every test must pass. A duration that changes by more than 2× in either direction must be explained, because it would mean the edit did more than add a timeout.
- **Self-check:**
  - `npx tsc --noEmit` → 0;
  - full `npx vitest run` → **87 files / 1504, 0 failures**;
  - `npm run build` → rc 0.
- **Biome:** read-only `npx biome check ./app` must show ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings and 1 info. The 4 owned files must have 0 diagnostics (B baseline: 0).
- **Review:** run the `code-reviewer` agent on the diff; the round touches 5 files. If you cannot spawn subagents, say so and root runs it. Put findings and dispositions in the report. **Architecture notes** go to B (`a-round-56.md` §5), not into code.
- **`/check`:** `npm run verify` → exit 0, run quietly with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke:** not needed (no app change). If the server is up, one gstack load of `/studio-lab` at 1440×900 with a clean console (apart from the known `/api/cart`) is welcome. It is not a PASS claim.

### 2.4 Doc 049

New file `docs/implementation/2026/quarter-IV/049-studio-test-timeout-headroom.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 56 — D-29z21; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** C-R48-01 history from round 48 to 55; the victim table; the alone-durations versus the loaded runs;
- **Approach:** §0.1, with the rejected alternatives: root config, every mounting file, per-`it` timeouts, `vi.setConfig`, `retry`;
- **Architecture:** the runner mechanism (source lines), no diagram needed;
- **Changed files;**
- **Problems and solutions;**
- **Testing:** M1–M4, before/after durations, full run, verify;
- **Ableton:** does not apply (test infrastructure);
- **TODO:** C-R48-01-GRID-RESIDUAL, the root config option, stage-4a browser acceptance, 4b.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/__tests__/track-layout.test.tsx` | A | 3 top-level describe lines (§0.1) |
| `app/lib/__tests__/sfx-library.test.tsx` | A | 1 top-level describe line |
| `app/lib/arrangement/__tests__/master-ui.test.tsx` | A | 1 top-level describe line |
| `app/lib/arrangement/__tests__/fader-guards.test.tsx` | A | 1 top-level describe line |
| `docs/implementation/2026/quarter-IV/049-studio-test-timeout-headroom.md` | A | new (§2.4) |
| `../tmp/studio-real-loop/a-round-56.md`, `a-round-56/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-56.md`, `c-round-56.json`, `c-round-56/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:**
- **Case A: 22 lines** — the 17 baseline lines, plus ` M` for each of the 4 owned test files, plus `?? docs/implementation/2026/quarter-IV/049-studio-test-timeout-headroom.md`.
- **Case B: 5 lines** — the 4 ` M` lines and the `??` line.

The frozen list must stay all OK.

### 3.2 Frozen this round

- Everything in `b-round-55-r56-tree-sha256.txt` and everything else under `store/`. This includes all app source, all other test files (`grid-snap-*`, `selection`, `grid-edges`, `render-budget`, `gesture-guard`, …), and docs 001–048.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**`.
- **Also not allowed:**
  - new dependencies or installs; deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments; M1–M4 run in scratch only;
  - killing processes you did not start; starting or stopping the dev server;
  - `npm run format`;
  - deleting `playwright-report/` or `store/nul` (root's call).

## 4. Acceptance (C)

**Checkpoint order:** G56-2 → R56-S → R56-U → G56-1 → R56-LOAD → (servers up) the browser half in §4.5 → G56-3. Write `c-round-56/checkpoint.md` as you go. If the server is down at the start, check again after the offline items and once more before the report, and record each check. Do not start it.

### 4.1 R56-S — static (read-only)

- `diff -u --strip-trailing-cr` against the snapshots: **6 hunks, one per top-level describe** (3, 1, 1, 1). Each hunk only adds the `{ timeout: 15_000 }` (or `15000`) second argument to that `describe(` call. Biome will probably wrap the call; the expected wrapped shape is:
  ```
  describe(
    'track fold, height and lane auto-fit (SRW-11B stage 2, D-29, R11-U)',
    { timeout: 15_000 },
    () => {
  ```
  Only Biome's re-indentation of the callback body is acceptable beyond the wrap. If Biome re-indents the whole body, that is allowed only when the diff with `-w` (ignoring whitespace) shows nothing but the added argument; record both `diff` and `diff -w`. No other byte changes.
- `grep -c` of `^\s*it\(` per file is unchanged (36 / 3 / 18 / 63). There are no new `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig`, fake timers or numeric per-`it` timeouts.
- LF everywhere, with no EOL churn. Frozen list 409 OK; protected 4/4. Doc 049 exists and has the §2.4 sections.

### 4.2 R56-U — mechanism (C's own scratch, own strings)

- Re-run M1–M4 (§2.2) in your own scratch copy with your own insertion strings. Each must report exactly the expected timeout (15000 / 15000 / 5000 / 5000).
- **C extra (info):** M5 — hang a test in `sfx-library` (top-level suite, single level) → 15000.
- **Alone-durations:** take your own before measurement (on the snapshot files in scratch) and after measurement (on the store files) for the tests named in "Why this round". Record them. A change of more than 2× is a finding.

### 4.3 G56-1 — gates

- tsc 0; build passes; read-only Biome `./app` within the baseline; the 4 owned files have 0 diagnostics.
- vitest = **87 files / 1504, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, run quietly; at most two quiet attempts, each recorded. Tolerances and timeouts outside the 4 owned files are not changed. If neither attempt is rc 0, G56-1 is FAIL.

### 4.4 R56-LOAD — the bug under load (new)

**Load generator:** in a second shell, start a loop that runs `npx tsc --noEmit` back-to-back. Start it **before** the vitest run and stop it **after** the vitest run ends. Sample `tasklist | grep -ci node.exe` at the start, in the middle and at the end, and record the generator's PID and iteration count. Then run `npx vitest run` (full suite) in the first shell.

- **A valid measurement** is one where the generator is alive for the whole vitest run and the run completes.
- **Budget** (workflow): 3 valid runs, plus at most 2 extra attempts to replace runs invalid for environment reasons.
- **Verdict:**
  - Any `Test timed out` in one of the 4 owned files → **FAIL** (C-R48-01 stays open; B reconsiders).
  - A timeout in a **non-owned** file → recorded as a recurrence with file, test and ms. The round is **not** failed by it, but C-R48-01 is not closed: it becomes the residual, with a list of affected files.
  - Report the per-run wall time and the slowest test of each owned file per run (`--reporter=verbose` or the JSON reporter into `c-round-56/runs/`).
- **Control run (info, outside the 3+2 budget):** before the valid runs, run one full suite with the same generator and the same sampling on C's scratch copy holding the **snapshot** versions of the 4 files. Record any timeouts. This shows whether the generator reproduces the bug at all.
- **Closure rule (two honest forms):**
  - Control shows ≥ 1 timeout at 5000 ms in an owned file, and all 3 valid runs show 0 timeouts in every file, and G56-1 passes → **"closed — reproduced under load and fixed"**.
  - Control shows 0 timeouts, and the 3 valid runs show 0, and G56-1 passes → **"closed as not reproduced under test load; headroom proven only by M1–M5"**.
  - In every other case C-R48-01 narrows to the observed residual set.

  C-R48-01 is never reported as plain "closed" without saying which form applies.

### 4.5 Carried browser half — only if the servers are up (otherwise "not run (environment)")

App code is unchanged since round 55. Run **exactly** the round-55 procedures from `tasks/round-55.md`:
- §4.4 R55-SHIFT (SH-CROSS, SH-SAME, SH-NOTE);
- §4.5 R52-EDGE;
- §4.6 R54-CROSS (CX-VIDEO, CX-NOTE);
- §4.7 R53-LANE, R52-TRIM, R52-PLAY (real audio: EP-VIDEO, EP-OFF, EP-CROSS, EP-SHIFT);
- §4.8 R52-REG and REG-HYD.

Use the same layout L52, the same harness labels, the same expected values and the same order (R52-EDGE before R55-SHIFT). Record V with full double precision first.

### 4.6 G56-2, G56-3 and the Ableton table

- **G56-2:** protected files 4/4 OK; frozen list all OK; `git status --short` matches §3.1 (22 lines in case A); HEAD at start and end.
- **G56-3 (anonymous workspace and purchase protection; never browser-verified in rounds 52–55), only if the servers are up, with a fresh browse state:**
  - `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
  - No request goes to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and workspace code sends no `Authorization` header, including during the drags.
  - An anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns 401.
  - `/studio/middle-east` shows "Sign in required".
  - Known and allowed requests: root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.
  - If the servers are down: **not run (environment)**, fifth round. Say so plainly in the summary.
- **Ableton (workflow addendum 2026-10-11):** the round-56 change is test infrastructure, so the row is "does not apply", with no Ableton claim. If §4.5 runs, use the round-55 Ableton table (`tasks/round-55.md` §4.9) and give the two verdicts per row (CZABA requirement; Ableton conformance: confirmed / deliberate difference / unconfirmed / does not apply). Source: Live 12 Reference Manual ch. 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/` §6.7 and §6.10, via B's capture `b-round-46/ableton-6.7-6.10-20261016.txt` (re-used 2026-10-17; no video, no Live installation). Never write "Ableton does it this way" for an unconfirmed or no-source row.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Test timeout headroom for jsdom suites | — | does not apply | test infrastructure only; no user-visible behaviour | R56-U, R56-LOAD |

### 4.7 Not run this round, and carried items (honest)

**Not run (not PASS) unless §4.5 runs:**
- the whole stage-4a browser acceptance;
- G56-3.

**Not run this round in any case:**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`; G3-R, G3-3, G3-shots);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- a real `pointercancel`.

**Open C bugs:**
- C-R53-01, C-R54-01, C-R54-02 (fixed at unit/probe level; browser pending);
- C-R51-01, C-R51-02 (→ 4b);
- C-R52-T1 (→ 4c);
- C-R48-01 (this round) and C-R48-01-GRID-RESIDUAL;
- C-R41-01 (TL-Q-VIEWPORT);
- C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
- C-R23-01 + C-R38-01 (Tech Lead).

**Open Low / info:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE, R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE, A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG, A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP, A-R54-REVIEW-LOWS, INFO-R55-FREE-ROUND-UNGUARDED, A-R55-REVIEW-SHIFT-MIDDRAG-TEST.

**Root items:**
- ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53 (fourth round; the yes/no question in §6);
- ROOT-COMMIT-ROUND51: the rounds 50–55 unit, 17 paths, on root's decision; round 56 is a separate unit;
- ARCH-CHECKPOINT-SRW14-PREFS and ARCH-CHECKPOINT-SRW13;
- GSTACK-ACL, GSTACK-NO-MOUSE;
- SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work;
- portable paths in instruction files; the scrollbar refinement request and the library/stems parity requirements (`publication-checkpoint.json`);
- the CRLF Biome errors on auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load; the stray `store/nul`; the git autocrlf warning on LF files.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T with INFO-R53-NARROW-GAP).

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-55-r56-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-55-r56-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/__tests__/sfx-library.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-55-r56-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/__tests__/sfx-library.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app --diagnostic-level=error --max-diagnostics=100
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A; needed for C and for completion)

1. **Servers, fourth round:** start the Store dev server and the backend before C, **or answer yes/no: can they be restored in this environment?**
   - **Yes / started:** C runs §4.5 and G56-3 this round; round 57 then goes to 4b.
   - **No:** that is external missing information. B will ask the user whether to start a non-grid feature (SRW-15, stage 1) offline, with the browser debt recorded, rather than add more grid code.
   - Silence is treated like round 55: B keeps working on browser-independent items and repeats the question.
2. **C-R48-01:** this round implements option (b). A root config change (`testTimeout` for the jsdom suites, or a worker cap) is still welcome and would also cover C-R48-01-GRID-RESIDUAL. Please state the value if you make it.
3. **ARCH-CHECKPOINT-SRW14-PREFS (bounded, non-gating, wanted before 4b):** the same request as round 55 (time-precision rule in four places, plus the StudioWorkspace view/edit-prefs question). New supporting signals from the round-55 reviewer:
   - signal 3: the fourth consecutive round on this boundary;
   - signal 1: `handlePointerMove` handles group, single, trims and ranges in one handler; a possible pure `resolveSingleMoveRequest` could follow the answer.

   Answer format: keep/extract, value, risk, ≤ 3 sentences.
4. **Commit units:** rounds 50–55 (17 paths) on root's decision; C round 55 found no open defect, but there is no browser evidence. Round 56 is its own `test(store): CZABA… C-R48-01 timeout headroom` unit (4 test files + doc 049), commit-ready only after a round-56 C PASS on R56-S/U/LOAD and G56-1/2.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-56.md`:**
1. the pre-flight gate and the §1.2 baseline (case A/B);
2. M1–M4 and the before/after durations;
3. a diff summary per file with EOL counts;
4. smoke (if any);
5. code-reviewer findings, dispositions and any Architecture note;
6. verbatim command tails, including `node.exe` and `npm run verify`;
7. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-56.md` and `c-round-56.json`** (usual schema). Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment). Cover:
- R56-S, R56-U (M1–M5, durations), G56-1, R56-LOAD (3 valid runs), G56-2;
- the §4.5 browser half and G56-3 (or "not run (environment)");
- the Ableton rows;
- the carried items.

`passed` lists only IDs run this round. State **commit readiness** for root, separately for round 56 and for rounds 50–55.

**Next (orientation only):**
- **Round 57:**
  - Servers up and the §4.5 half passes → **stage 4b**: lane right-click division menu; narrow/widen keys after the Chrome Ctrl+digit check; C-R51-02 fix; C-R51-01 probe; plus the INFO-R55-FREE-ROUND-UNGUARDED and SHIFT-MIDDRAG tests.
  - Servers up and §4.5 fails → those bugs first.
  - Servers still down → the root answer in §6.1 decides (see there).
  - C-R48-01 not closed by R56-LOAD → B narrows it with the evidence before any feature.
- **Then:** stage 4c (C-R52-T1, library-drop edges), SRW-15 (+ stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 56 -StartPhase A` and a higher limit.
