# CURRENT TASK — Round 184: ROOT-RECON-GRID-HARNESS — one shared test environment for the three grid UI suites

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z149** (`backlog.json` → VISUAL-A-OBSIDIAN `harness_plan_d29z149`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-183.md` is an exact copy of the round-183 `current-task.md` (sha256 `fb745dc5…`, checked with `cmp`). The rationale for this round is in `b-round-183.md`.
- **This is a test-only round.** No application source file changes. No browser-visible behaviour changes.

## Baseline = HEAD `423fbc4` (gate 183 published)
- **Gate:** `gates/gate-round-183.json` is `published`, commit `423fbc4`, on both remotes. `git status` is clean, with **1009 tracked files**.
- **Start state:** `sha256sum -c c-round-183/end-tree-sha256.txt` is OK (1009).
- **Frozen list:** `b-round-183-r184-tree-sha256.txt`, **1005 entries** (1009 minus the 4 grants). B checked it: OK.
- **Grants:** `b-round-183-r184-grants.txt` (4 existing files). **New files:** `b-round-183-r184-new-files.txt` (2 files; neither exists yet).
- **Start hashes:** `b-round-183-r184-granted-start-sha256.txt`. **Start copies:** `b-round-183/r184-granted-start/`.
- **Vitest:**
  - The **before** and **after** lists are the same file: `b-round-183-r184-vitest-base.txt` (the 3 grid UI suites).
  - B ran it on HEAD: **3 files, 45 tests, 45 passed** (grid-snap-ui 20, grid-musical-ui 14, grid-triplet-ui 11).
  - **Name lock:** `b-round-183/out/vitest-base-names.txt` holds the sorted `file :: fullName :: status` list. The raw JSON is `b-round-183/out/vitest-base.json`.
  - The old "44 targeted / 1683 full" numbers belong to the local commit `3ea2e04`, which is not in the cloud. They do not apply here.
- **A's first step:** check that HEAD is `423fbc4`, that `sha256sum -c --quiet b-round-183-r184-tree-sha256.txt` is OK, and that the 4 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z149)
- **Round 183: C PASS, 0 bugs.** `browserVerified` and `realVerified` are both true. Root published it as `423fbc4`. **M4 → მზადაა** (vetoable R44/R45). All four approved M moves are now done or `awaiting_user` (M5).
- **Regression is not due at this planning.** `regression-last.json` is dated 2026-10-24, and today is 2026-10-26: 2 days, below the 3-day threshold.
  - **This reverses the order in round 183's §8**, which assumed planning would happen on 2026-10-27: harness first, then regression.
  - The first planning on or after 2026-10-27 makes the next round the **REGRESSION round**, expected to be round 185. It includes M1, M3 and M4.
- **Bug gate:** no Critical, High or Medium finding is open.
- **This is the last item in the VISUAL-A order.** The user approved it on 2026-10-25 (`agent-workflow.md` reconciliation, item 2): *a separate bounded test-only task: in `helpers/workspace-test-environment.ts`, a `createWorkspaceTestEnvironment` factory; each suite has its own clock/classes; assertions, setup/teardown and new canonical changes stay unchanged; the old doc063 number is taken, so use a new free number.*
- **B checked the source at HEAD:**
  - These three blocks are **byte-identical** (`diff` is empty), 79 lines each, from `const fakeClock` to the end of `class FakeResizeObserver`:
    - `grid-snap-ui.test.tsx` l.23–101;
    - `grid-musical-ui.test.tsx` l.29–107;
    - `grid-triplet-ui.test.tsx` l.30–108.
  - In each file, `fakeClock` appears 3 times: the declaration, `currentTime`, and the `fakeClock.base = …` reset in `beforeEach`.
  - The Fake classes are used outside the block only in the `beforeEach` `vi.stubGlobal` lines.
- **The local commit `3ea2e04` is not in the cloud.** The extraction is done again from the current canonical files. It is not cherry-picked, and no source function is re-implemented.

## 1. What changes (exact; line numbers are on the start tree)
| ID | File | Change |
|---|---|---|
| **H1** | **new** `app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts` | `export function createWorkspaceTestEnvironment()`. The function body contains the 79-line block, moved and unchanged in behaviour: `const fakeClock = { base: 0 };` plus `FakeParam`, `FakeNode`, `FakeGain`, `FakePanner`, `FakeSource`, `FakeAudioContext` (its `currentTime` reads this call's `fakeClock`), `FakeOfflineAudioContext`, `FakeAudioBuffer` and `FakeResizeObserver`. It returns `{ fakeClock, FakeAudioContext, FakeOfflineAudioContext, FakeAudioBuffer, FakeResizeObserver }`. FakeParam, FakeNode, FakeGain, FakePanner and FakeSource are **not** returned or exported. |
| **H2** | `grid-snap-ui.test.tsx` | Delete l.23–101. In their place, put one module-scope line: `const { fakeClock, FakeAudioContext, FakeOfflineAudioContext, FakeAudioBuffer, FakeResizeObserver } = createWorkspaceTestEnvironment();` (Biome may wrap it). Add `import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';` where Biome's import order puts it. |
| **H3** | `grid-musical-ui.test.tsx` | The same, for l.29–107. |
| **H4** | `grid-triplet-ui.test.tsx` | The same, for l.30–108. |

**Constraints:**
- **Each suite must own its environment.** `fakeClock` and every class are created **inside** the factory body. No module-level state in the helper. Two calls return different `fakeClock` objects and different class identities (R47).
- **Leave the other suite code byte-identical:** `vi.mock(...)` blocks, the `beforeEach` / `afterEach` bodies, the constants after the block (`PX_PER_SECOND` …), every helper function, every `describe` / `it` and every assertion. The diff in each suite is exactly **two changes**: the import line, and the block replaced by one destructure.
- **Follow the project rules:**
  - TypeScript strict: no `any`, no `@ts-ignore`, no type assertions. Keep the existing types: `buffer: unknown`, `onended: (() => void) | null`, and the `FakeAudioBuffer` options object type.
  - Semicolons.
  - No code comments.
  - An explicit return type is not required, so let TypeScript infer it. If Biome or the reviewer asks for an exported type, name it `WorkspaceTestEnvironment`.
  - **Config facts (B checked):** `biome.json` has **no `overrides`** (`files.includes` = `app/**/*.ts(x)`). The helper gets exactly the rules the suites already pass with, including the empty methods `disconnect() {}`, `start() {}` and `observe() {}`. `npm run typecheck` is `tsc --noEmit` with no `declaration` / `composite`, so returning locally declared classes from an exported function is fine. If Biome or tsc still reports a diagnostic on the helper, report it. Do not restructure the code to silence it; B rules.
- **Out of scope** (the user approved only these 3 suites):
  - the **73 other suites** that carry a copy of the block;
  - `expectTokens` / `countOccurrences`, which are checkpoint Q2 and root's decision;
  - any file under `app/` outside the 4 test paths;
  - `vitest.config.ts`.

**Rulings (B, vetoable, recorded in `harness_plan_d29z149.rulings`):**
- **R47, destructure at module scope.** `beforeEach` does not build the environment. This keeps setup/teardown byte-identical, as the user's constraint requires. Each suite still owns its clock and classes, through one factory call per module.
- **R48, helper path** `app/lib/arrangement/__tests__/helpers/`. The name has no `.test.`, so vitest `include: ['app/**/*.test.{ts,tsx}']` does not collect it as a suite. `tsconfig` `include: ['**/*.ts', …]` still typechecks it.
- **R49, 45-name lock.** After the change, the sorted `file :: fullName :: status` list must equal `b-round-183/out/vitest-base-names.txt`. Any drift is a **FAIL**, not a note: a renamed, dropped, added or skipped test, or a status other than `passed`.

## 2. Docs (A)
Read `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md` first.

| ID | File | Change |
|---|---|---|
| **D1** | doc 151 `151-studio-m4-cookie-banner-studio.md` | l.4 status → `Completed`. At l.73, strike the TODO and mark it done: C round 183 PASS, published `423fbc4`. l.74 (veto) stays. At l.75, change the next step to "ROOT-RECON-GRID-HARNESS (round 184), then the REGRESSION round". Nothing else changes. |
| **D2** | **new** `docs/implementation/2026/quarter-IV/152-studio-grid-test-harness.md` | Georgian, with the TEMPLATE sections. Include: the approval source (2026-10-25 reconciliation, item 2); why `3ea2e04` is not used; H1–H4; R47–R49; B's identical-block check (line ranges); the 45/45 base (20/14/11); the name-lock result; mutations m312–m313; the 73 remaining copies as a TODO signal, not scheduled; and the §6 row. Status: `In Progress (awaiting C round 184)`. |

## 3. A — files you own (everything else is frozen)
- **The 4 grants:** the 3 grid UI suites (H2–H4 only) and doc 151 (D1 only).
- **The 2 new files:** the helper and doc 152.
- **Protected, byte-identical:**
  - every file under `app/` that is not one of the 4 test paths, including all Studio / arrangement components, `ArrangementContext.tsx`, `app/lib/arrangement/*.ts` source, routes (`studio.$productId.tsx`, `studio-lab.tsx`), `root.tsx`, `app/styles/` and the contexts;
  - `app/lib/auth.ts`, `firebase.client.ts`, the purchase / download / studio-token files, `e2e/`, `.claude/**`, `package.json`, `vitest.config.ts`, `tsconfig.json`, `biome.json` and `vite.config.ts`;
  - the other 73 suites.
- **Process rules:**
  - Read the primitives first: `AGENT_DISCOVERABLE_CODE.md` (export naming), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `.claude/prompts/new-test.md`, `GEORGIAN_DOCS.md` and `docs/implementation/TEMPLATE.md`.
  - Make every lasting edit with Edit/Write. Use shell writes only for the temporary mutations, and restore and sha-check after each one.
  - Write `a-round-184/end-sha256.txt` (6 paths) and `a-round-184/diff-vs-start.patch` (the 4 grants against `b-round-183/r184-granted-start/`, plus the 2 new files in full).
  - Helper scripts go under `a-round-184/tools/`. No commit, no push.

## 4. A — tests and commands (speed rules)
- **Run:** `npx vitest run $(cat ../tmp/studio-real-loop/b-round-183-r184-vitest-base.txt) --reporter=json --outputFile=../tmp/studio-real-loop/a-round-184/vitest-after.json`, then a default-reporter run for the log.
  - Expect **3 files, 45 passed, 0 failed, 0 skipped**.
  - Build the sorted name list with the same format as B's (see `b-round-183.md` §Tools) into `a-round-184/vitest-after-names.txt`.
  - `diff` it against `b-round-183/out/vitest-base-names.txt`: it must be empty.
  - Write the file list to `a-round-184/vitest-files.txt`.
- **Not collected:** in the same run, confirm that `workspace-test-environment.ts` is not listed as a test file (the run reports exactly 3 files).
- **Checks:** `npm run typecheck`, `npm run lint`, and `npx biome check` on the 4 code/test paths. Report every warning against the start tree: no new warnings are allowed.
- **Code review:** 4 changed or new code/test files, so ask the `code-reviewer` subagent. Pass its Architecture note to B verbatim.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and the browser rows.

### 4.1 Mutations (temporary; restore and sha-check after each one)
| ID | Mutation | Must happen |
|---|---|---|
| **m312** (wiring) | Rename the helper's export to `createWorkspaceTestEnvironmentX`. | `npm run typecheck` reports an error in **each** of the 3 suites. The vitest run of the 3 files fails all 3 files. Record the error lines. |
| **m313** (clock wiring, observe) | In the helper, make `currentTime` return `0` instead of `Date.now() / 1000 - fakeClock.base`. | **Observe and report** which of the 45 tests turn red. B does **not** pre-specify the red set. If **0** tests turn red, report that: it means the clock is not asserted through these suites, which is information for B and not A's defect. |

Nothing may be weakened to make a mutation behave. B rules on any surprise.

## 5. C — rows
Real Playwright Chromium on the shared :5173 server. Use 1440×900 and 1280×720, with a fresh anonymous context per session. Pixel reads run at DPR 2 with `--disable-lcd-text`. This round needs **no GA-env servers**.

| Row | What | Pass |
|---|---|---|
| **T184-TARGETED** | Re-run `a-round-184/vitest-files.txt` with the JSON reporter, and rebuild the sorted name list yourself. | 3 files, 45 passed, 0 failed, 0 skipped. **Your** name list equals `b-round-183/out/vitest-base-names.txt` (R49; a drift is a FAIL). The helper is not collected as a test file. |
| **SCOPE-184** | Check the frozen list (1005) at C's start and C's end, and A's `end-sha256.txt`. Run `git status`. | Frozen 1005 OK. `git status` = 4 ` M` + 2 `??` (the `helpers/` folder and doc 152). `git diff 423fbc4 --stat` lists only the 4 grants. Every file under `app/` except the 3 suites + helper is byte-identical to `423fbc4`. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW-184** | Read the diff. | Each suite has exactly 2 changes, H2–H4: the import, and the block replaced by one destructure. `beforeEach` / `afterEach` and everything else are byte-identical. **Mechanical check:** extract the helper's factory body and normalise indentation. It must equal the frozen start copy `b-round-183/r184-granted-start/grid-snap-ui.test.tsx` l.23–101, plus only the `return { … }`. `fakeClock` and the classes are created inside the function, with no module-level state (R47). No `any`, `@ts-ignore`, `as` or comments. D1 and D2 are as written. |
| **MUT-184** (read-only) | Read m312 and m313. | m312: a typecheck error in each of the 3 suites, all 3 vitest files failing, and the restore sha OK. m313: the observed red set is recorded and the restore sha is OK. Any 0-red result is reported to B as information. |
| **STUDIO-RV-184** | :5173 `/studio-lab` rest screenshot at both viewports vs C round 183 (`c-round-183/shots/c183-1440-2/rest-full.png`, `c-round-183/shots/c183-1280-1/rest-full.png`). | 0 changed px. No source changed, so this confirms the served Studio. If the first cold 1440 load is blank (ENV-FIRST-LOAD), discard it and replace it once. |
| **G184-3** | :5173: anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with no `auth_user` and 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Gate rows (not C's):** full vitest (it must still collect the 3 suites, and the helper must not be counted as a file), typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Adjacent behaviour that could break, with the check that catches it:**
- a suite now shares a clock with another → AN-REVIEW R47, plus mutation m313;
- a test is silently dropped or renamed → R49 name lock;
- the helper gets collected as an empty suite → the file count;
- a typecheck gap → the gate.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Test-environment extraction (no user-visible behaviour) | **None.** This is internal test infrastructure. | Nothing. | A user-approved test-only refactor (2026-10-25). | STUDIO-RV-184. Parity: **არ ეხება** (not applicable) |

## 7. Evidence and reporting
- **A:** `a-round-184.md` and `a-round-184/`.
- **C:** `c-round-184.md`, `c-round-184.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-184/`.
- **Both:** write the report files as you go.

## 8. Outcome, fixed in advance (B at round 185 planning)
| Condition | Round 185 |
|---|---|
| **C PASS** | Root publishes round 184. ROOT-RECON-GRID-HARNESS → **მზადაა**, and VISUAL-A-OBSIDIAN is complete (except `awaiting_user` items). Planning on or after 2026-10-27 → **REGRESSION round** (M1, M3, M4, e2e smoke, C-R167-METRONOME-UNDER-MUTE, REG-DUX5-PLAYHEAD-RESCAN). Then STORE-REDESIGN STORE-0 (mock API), unless root's checkpoint answer orders otherwise. |
| C FAIL: name-lock drift, a protected-file change, or shared state | A bounded fix-up in the same 6 files. |
| A browser row could not run | `browserVerified=false` → the harness is not done, and B re-plans the browser half. |

## 9. Root notes
- **Gate (on C PASS):** the 4 grants plus the 2 new files. No application source changes.
- **Feature boundary:** this round closes VISUAL-A. B re-raises the unanswered checkpoint as **one bounded frontend-architect ask**: `b-round-183-checkpoint-request.md`, which supersedes `b-round-180-checkpoint-request.md`. It does not block round 184 or 185.
