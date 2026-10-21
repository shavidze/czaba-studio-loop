# CURRENT TASK — Round 54: finish SRW-14 stage 4a, part II (FB-13). Exact cross-lane lock (C-R53-01), the CT9 trim guard (SPEC-R53-G-CT8), and the stage-4a browser acceptance that has not run for two rounds

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- Decision record: **D-29z19** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-53.md`.
- Round size: **one Medium bug plus one test guard**, one owner (`selection.ts`), finishing stage 4a. There is no new feature. Stage 4b moves to round 55 and 4c to round 56; nothing is cut.

> **ROOT ACTION REQUIRED BEFORE C (environment, not BLOCKED).** `http://127.0.0.1:5173` and `:5199` were **down** for A and C in round 52 **and** round 53. They were still down at B's measurement (17:59 +04, `b-round-53/gates.txt`: both `000`). As a result, no stage-4a browser ID and no purchase-protection check (G53-3) has run for two rounds.
> - **Probable cause (ENV-VITE-ENOMEM-R53):** the tail of `tmp/studio-real-loop/r42-vite.err.log` shows that the Vite dev server died from an unhandled FSWatcher error: `ENOMEM: not enough memory, scandir 'C:\Apps\czaba-project\store\playwright-report'`. The last out-log line is at 15:28:43.
> - **Root must start the Store dev server, and the backend for G54-3's token 401, before C runs.** No agent starts or stops servers.
> - If the server is still down when C starts, C does the offline items (R54-S, R54-U, G54-1, G54-2) and records every browser ID as **not run (environment)**.
> - B will not dispatch further grid code (4b) without browser evidence for stage 4a.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never run `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure, use the approved `server-node.mjs` fallback, started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Record the PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every clip drag, trim and Alt case uses standalone Playwright (installed chromium, fresh context, no install). Label it **REAL-mouse (PW)**. This is still a deviation pending root/user acceptance. Plain clicks and key presses use gstack (REAL).
> - **Fixture rule:** keep move targets out of the 8 px trim zones; trims start at the trim-handle centre.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every A and C run. If a test times out under load, re-run that file alone and report both runs (C-R48-01).
>
> **Scratch junctions:** create and remove `node_modules` junctions with `cmd //c mklink /J …` / `cmd //c rmdir …` and stdin from `/dev/null`. Do **not** export `MSYS_NO_PATHCONV=1` for these `cmd` calls.

## Why this round

**Round 53 result** (`c-round-53.md`, `c-round-53.json`): **C BLOCKED (environment).**
- **PASS (offline):**
  - R53-S;
  - R53-U: every mutation is killed except (g) on CT8, which is a spec inconsistency;
  - G53-1: quiet `npm run verify` rc 0, 87 files / 1497 / 0, build OK. Run 1 had 2 load timeouts (C-R48-01), and both files were green alone;
  - G53-2.
- **Closed:** C-R52-01, and C-R52-02 for the same lane. **Fixed with unit and probe evidence:** C-R52-03 (browser LN-SHORT still pending).
- **New — C-R53-01 (Medium):** a **cross-lane** move cannot lock onto a sub-millisecond edge of the target lane.
  - C's probe P3x: m1 on music at 2 (length 2) is dragged to stems, where st0 ends at 6.0004 (raw 6.05). The move is refused with `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`
  - The same-lane control P3s lands at 6.0004.
  - **Cause:** `planClipLaneMove` (`selection.ts:172`) rounds the time delta to whole milliseconds. 4.0004 becomes 4.000, the start becomes 6.000, it overlaps st0 by 0.4 ms (more than `ARRANGEMENT_EPS` = 1e-4), and the move is refused.
  - Real decoded and purchased stems keep the raw `buffer.duration`, so FB-13's "lock onto it" fails cross-lane for real assets.
  - This is A's reviewer finding A-R53-REVIEW-CROSSLANE-SUBMS, reproduced by C.
- **SPEC-R53-G-CT8:** the round-53 spec expected mutation (g) (ms-rounded `clipEdgeTimes`) to fail CT8. CT8's neighbour is on the same lane, so under R3 it never passes through `clipEdgeTimes`. An **other-lane** sub-ms trim test is needed instead: CT9.
- **SPEC-R53-STATUS-15:** the round-53 status expectation should have said 15 lines. This task states 15 at the start and **17** at the end.
- **INFO-R53-NARROW-GAP:** by design (D-29z18 rejected "nearest placeable"). It goes to the Tech Lead as input to R52-T(1). No task.

**What round 54 delivers (user `2.srt` 07:00–07:53: "it must jump onto it and lock"):**
- A clip dragged to **another lane** locks exactly onto a target-lane clip edge, including real audio whose length is not a whole millisecond.
- The whole-millisecond behaviour of every existing cross-lane and group move stays bit-identical.
- C finally runs the complete stage-4a browser acceptance: edges, lanes, trims, real audio, regressions, the anonymous workspace and purchase protection.

## Baseline

Measured by B on 2026-10-17 at 17:59 +04 (`b-round-53/gates.txt`, `tsc.txt`, `vitest-focus.txt`, `rounding-check.txt`).

**Content baseline** (rounds 50–53 are uncommitted). One of these must hold:
- **(A)** HEAD is `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` lists **exactly** these 15 paths:
  ```
   M app/components/arrangement/ArrangementClip.tsx
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/ArrangementLoopBrace.tsx
   M app/components/arrangement/ArrangementRuler.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
   M app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
   M app/lib/arrangement/grid.ts
  ?? app/lib/arrangement/__tests__/grid-edges.test.ts
  ?? app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx
  ?? app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
  ?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
  ?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
  ?? docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md
  ?? docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md
  ```
- **(B)** HEAD is one or more newer **root** commits on top of `038ed5a`, whose combined stat contains exactly those 15 paths, and `git status --short` is empty. Root was asked **not** to commit before a round C PASS; this case is only tolerated.

In both cases:
- **Frozen list:** `../tmp/studio-real-loop/b-round-53-r54-tree-sha256.txt` → **409** entries, all OK (run from `store/`). It contains every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned files below. `grid.ts`, `ArrangementClip.tsx`, `grid-edges.test.ts` and `grid-snap-ui.test.tsx` are **frozen** this round.
- **Snapshots:** `../tmp/studio-real-loop/b-round-53-r54-snapshots/`, with `SHA256SUMS.txt` inside:

  | File | sha256 prefix | LF lines | `it` |
  |---|---|---|---|
  | `selection.ts` | `0b758b49` | 221 | — |
  | `selection.test.ts` | `71eb6d78` | 325 | 23 |
  | `grid-snap-clip-edges.test.tsx` | `732056d0` | 667 | 26 |
  | doc `048-…-stage-4a.md` | `fb6e5cb4` | 209 | — |

- **Root-commit tolerance (case B):** a `sha256sum -c` mismatch confined to docs 046/047 is root's. Record it as foreign (with the new hash) and continue. A mismatch in doc 048 or under `app/**`, or a root commit with any path beyond the 15, is a stop.
- Anything else (another HEAD, extra paths, a snapshot or frozen mismatch) → **stop and report**.

**Other measurements:**
- protected files 4/4 OK;
- tsc 0;
- focused vitest on `selection` + `grid-snap-clip-edges` + `grid-snap-edit` + `grid-edges` + `grid-snap-ui`: **5 files, 100/100**;
- full vitest = C's G53-1 quiet run: **87 files / 1497, 0 failures**;
- Biome `./app` **5 / 218 / 1**. The 5 errors are all CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`;
- `node.exe` 9;
- `/studio-lab` 000, `:5199` 000.

**Line endings:** all 4 owned files are **LF**. Count EOLs with node (`/\r\n/g` vs `/\n/g`), and diff with `diff -u --strip-trailing-cr` against the snapshots. Never run `npx biome check --write` on a file you do not own.

**Rules:**
- Do not revert, re-create or reformat anything. Rounds 47–53 stay as they are.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z19 (C-R53-01)

In `planClipLaneMove`, the time delta is rounded to whole **microseconds** instead of whole milliseconds:

```
const delta = Math.round(params.timeDelta * 1e6) / 1e6;
```

**Why microseconds, not removal:**
- **Same key as D-29z18.** Snap candidates are already compared in whole µs and returned exact.
- **Behaviour-preserving for every whole-ms delta.** For a delta that is a whole millisecond plus float noise (noise far below 0.5 µs), µs and ms rounding give the same double. B checked this in node for every delta in the `planClipLaneMove` unit tests and SE16, plus representative noisy deltas from the free, grid and group branches. This is a sample, not an exhaustive enumeration of the round-47 group-lane tests; A's full-suite red/green is the proof. The checked deltas: 1, 0, 0.5, −7.3, −0.5, 2.5 − 2.123, 0.1 · 3, 8.4 − 2, 9.3 − 4, 6.6 − 4, 3.9 − 4, 7 − 4. µs rounding gives **the same double** as ms rounding for every one of them (`b-round-53/rounding-check.txt`). Only sub-ms deltas such as 6.0004 − 2 differ: 4.0004 instead of 4.
- **Removing the rounding entirely is rejected:** a grid-snapped group delta such as `0.1 * 3` = 0.30000000000000004 would leak float noise into every member's start (SL2 guards this).
- The residual (≤ 0.5 µs) is 200 times smaller than `ARRANGEMENT_EPS` (100 µs), so the overlap check in `findClipPlacementConflict` decides exactly as before.
- **Expected side effect (accepted):** a clip whose start is itself not a whole millisecond, moved **freely** (Snap off) to another lane, now lands on the whole-ms start that the free branch requested. Before, it kept its sub-ms remainder, because the delta was rounded instead of the start. No existing test covers this. C reports it if observed; it is not a defect.

**Unchanged:** `ArrangementClip.tsx`, `grid.ts` (D-29z18 R1–R3), `model.ts`, `groupMoveBounds`, `moveClips`, the refusal texts, the ghosts and the history labels.

### 0.2 Source

**`app/lib/arrangement/selection.ts` (LF):** only line 172, exactly as in §0.1. No other hunk: no new export, parameter, comment or reformatting.

### 0.3 B decisions (D-29z19)

- **C-R53-01 → µs delta in `planClipLaneMove`.** This follows the A-R53 reviewer's architecture note ("one gesture, two precision rules") with the smallest single-owner change.
  - The alternative, "accept the requested start for a single clip", would add a parameter and a second code path to a frozen consumer (`ArrangementClip.tsx`). Rejected.
- **SPEC-R53-G-CT8 → new CT9.** CT9 is a right trim onto a sub-ms start on **another** lane, so mutation (g) reaches it. CT8 stays as it is.
- **INFO-R53-NARROW-GAP:** no task. It is input for R52-T(1).
- **Ableton:** no new source. Exactness across lanes is a CZABA decision (no source); §4.9.

### 0.4 Not in this round (scheduled)

- **Round 55 — stage 4b:**
  - the lane right-click division menu;
  - narrow/widen keys (B first checks Chrome's handling of Ctrl+1/2: CTRL-DIGIT-BROWSER-RESERVED);
  - the C-R51-02 fix;
  - the C-R51-01 probe.
  - It is dispatched only with stage-4a browser evidence, and preferably after ARCH-CHECKPOINT-SRW14-PREFS.
- **Round 56 — stage 4c:** group-move edges (start- and end-touch targets, C-R52-T1) and the library-drop decision.
- **Then:** SRW-15 (+ stage 5), SRW-16..20, the Lows, SRW-21, full regression and root review, T12.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):**
- cross-lane single moves (Snap on and off, Alt);
- group cross-lane moves (they must stay on the grid only, with unchanged starts);
- the Shift time lock (delta 0);
- keyboard lane moves;
- the cross-lane ghost and its refusal texts;
- `before-start` / `out-of-range` refusals.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A) or (B);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-53-r54-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `cmp` each of the 4 owned files with its snapshot, and `(cd ../tmp/studio-real-loop/b-round-53-r54-snapshots && sha256sum -c SHA256SUMS.txt)`;
   - protected files 4/4; the Biome numbers; `node.exe`; the dev-server state.
3. **Read:**
   - `selection.ts` (all);
   - `ArrangementClip.tsx` l.376–475 (the callers, read-only);
   - `model.ts`: `findClipPlacementConflict`, `ARRANGEMENT_EPS` (read-only);
   - the `planClipLaneMove` describe in `selection.test.ts`, and the harness plus CM8/CM15/CT2/CT8 of `grid-snap-clip-edges.test.tsx`;
   - `c-round-53.md` §3 and §6 (C's probes P3x and P3s);
   - `b-round-53/rounding-check.txt`.
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.2:
- no comments, no `any`, no type assertions, no `@ts-ignore`;
- semicolons;
- no reformatting of unrelated lines.

### 2.2 Tests

**`selection.test.ts`** — append one new `describe('planClipLaneMove exact time delta (C-R53-01, D-29z19)', …)` at the end of the file. Existing `it` blocks and helpers stay byte-identical; use the existing `fourLaneArrangement` and `clip` helpers.

| ID | Call | Expected |
|---|---|---|
| SL1 | `fourLaneArrangement([clip('m1', 'music', 2, 2), clip('t0', 'stems', 0, 6.000437)])`. (1) single move of m1 to `stems` with `timeDelta: 6.000437 - 2`. (2) the same with `timeDelta: 4` | (1) `refusal` `null`, `conflict` `null`; m1 is on `stems` with start `toBeCloseTo(6.000437, 9)`. (2) `refusal` `'overlap'`, `conflict.occupantId` `'t0'`: a 0.437 ms overlap is still refused, so the overlap check is unchanged |
| SL2 | `fourLaneArrangement([clip('m1', 'music', 0, 2), clip('t1', 'stems', 3, 2)])`; group `['m1', 't1']`, anchor m1, target `stems`, `timeDelta: 0.1 * 3` | `refusal` `null`; `clips.map((c) => [c.trackId, c.start])` `toEqual([['stems', 0.3], ['sfx', 3.3]])`, exact. This guards against the float noise of unrounded deltas |

**`grid-snap-clip-edges.test.tsx`** — append one new `describe('SRW-14 stage 4a exact cross-lane lock (C-R53-01, D-29z19)', …)` at the end. Existing `it` blocks and helpers stay byte-identical; reuse `MOVE_BLOCKED_TEXT`, `exactClipEnd`, `TRIM_END_BLOCKED` and `TRIM_END_TITLE`. Settings: 40 px/s, Snap on 1 s (`pressG()`).

| ID | Fixture → action | Expected |
|---|---|---|
| CM16 | (C-R53-01, P3x) m1 music 2 dur 2; st0 stems 0 dur **6.0004**. `dragFrom(header, root, 40, [{ dx: 162, y: STEMS_LANE_Y }])` (raw 6.05). Stems is the placement lane, so `startEdges` = {6.0004}; the end-touch 0 − 2 is dropped; 49 600 µs beats the line's 50 000 | m1 `trackId` `'stems'`; start `toBeCloseTo(6.0004, 9)`; start ≥ st0's exact end − 1e-9; Undo `გადატანა ხაზზე — სტემები`; status `გადატანა ხაზზე — სტემები: start 00:06.000.` (A confirms the rendered string verbatim and asserts it) |
| CT9 | (SPEC-R53-G-CT8) m1 music 7 dur 2.3; s1 **sfx** 9.6004 dur 1. Right trim `dragFrom(trimEnd, root, 90, [{ dx: 16 }])` (raw end 9.7). The other-lane start 9.6004 is 99 600 µs away; line 10 is 300 000 µs away | `exactClipEnd(api, 'm1')` `toBeCloseTo(9.6004, 9)`; status ≠ `TRIM_END_BLOCKED`; Undo `TRIM_END_TITLE` |

**New total:** 1497 + 4 = **1501** `it`, in 87 files.

**Red/green.** Work in a scratch copy outside `store/` that holds the current tree, the 4 snapshot files and your new tests.
1. **Red run.** On the snapshot `selection.ts`, expect:
   - **red:** SL1 (part 1 is refused as `overlap`) and CM16 (m1 stays on music at 2);
   - **green:** SL2 and CT9 (guards: today's ms rounding happens to clean SL2, and CT9 goes through the frozen `grid.ts`), plus every existing `it` of both files.

   Explain every difference → `a-round-54/red-run.txt`.
2. **Green run** → `a-round-54/green-run.txt`.

**A's mutations** (scratch copy only) → `a-round-54/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | `selection.ts:172` back to `Math.round(params.timeDelta * 1000) / 1000` | SL1, CM16 |
| (b) | rounding removed: `const delta = params.timeDelta;` | SL2 |
| (c) | rounding to 0.1 ms: `Math.round(params.timeDelta * 1e4) / 1e4` | SL1 (6.0004 vs 6.000437) |
| (g) | `clipEdgeTimes` (`grid.ts`, in the scratch copy) returns ms-rounded values | CE6, **CT9** (CT8 is **not** expected to fail; see SPEC-R53-G-CT8) |

If a mutation survives, strengthen the test, never the code, and report it.

**Test rules:**
- no `any`, `@ts-ignore`, type assertions (`instanceof` guards) or comments;
- exact strings taken from the source or the rendered output;
- no snapshot tests, no fake timers.

### 2.3 After the code

- **Self-check:** run the frozen suites of §4.8, then the full `npx vitest run` → **87 files / 1501, 0 failures**.
- **Biome:**
  - read-only `npx biome check ./app` → ≤ 5 errors, each a CRLF-only `format` error on the baseline list; warnings ≤ 218; 1 info;
  - `npx biome check` on the 3 owned code/test files → 0 diagnostics.
- **Review:** run the `code-reviewer` agent on the diff. If your session cannot spawn subagents, say so; root then runs it. Report the findings and your dispositions. **Architecture notes** go to B (`a-round-54.md` §5), not into the code.
- **Browser smoke** (one run, gstack, fresh state under `a-round-54/`; this is not a PASS claim):
  - only if the dev server is up;
  - `/studio-lab` at 1440×900 loads;
  - a REAL `g` press works **after** the demo status reads ready;
  - the console is clean apart from the known `/api/cart`.
- **`/check`:** `npm run verify` → exit 0, run quiet (no PW probe in parallel). Do not run `npm run test:e2e:smoke` (root only).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/selection.ts` | A | line 172 only (§0.2) |
| `app/lib/arrangement/__tests__/selection.test.ts` | A | append SL1, SL2 (new `describe` at the end) |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | A | append CM16, CT9 (new `describe` at the end) |
| `docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` | A | status line → `Round 52–54 — D-29z17, D-29z18, D-29z19; C-ის შემოწმებას ელოდება`; append a section `Round 54 — სხვა ხაზზე ზუსტი ჩაკეტვა (D-29z19)` (§3.3); earlier text unchanged |
| `../tmp/studio-real-loop/a-round-54.md`, `a-round-54/` | A | report, gate output, own browse state |
| `../tmp/studio-real-loop/c-round-54.md`, `c-round-54.json`, `c-round-54/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end (case A): 17 lines.** That is the 15 baseline lines plus ` M app/lib/arrangement/selection.ts` and ` M app/lib/arrangement/__tests__/selection.test.ts`. Both are tracked and clean at baseline, so editing them necessarily adds a line. `grid-snap-clip-edges.test.tsx` and doc 048 are already among the 15. Case (B): ` M` for the 4 owned files, plus nothing else. The frozen list must stay all OK.

### 3.2 Frozen this round

- Everything in `b-round-53-r54-tree-sha256.txt`, and everything else under `store/`. That includes:
  - `grid.ts`, `ArrangementClip.tsx`, `grid-edges.test.ts`, `grid-snap-ui.test.tsx`, `grid-snap-loop-drop.test.tsx`, `grid-snap-edit.test.tsx`, `grid-snap-position.test.tsx`;
  - `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `ArrangementContext.tsx`;
  - `model.ts`, `loop.ts`, `library.ts`, and every other test file.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase/R2/auth/purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - docs 001–047;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**`.
- **Also not allowed:**
  - new dependencies or installs;
  - deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work (the uncommitted rounds 50–53 are work to keep);
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start;
  - starting or stopping the dev server;
  - `npm run format`;
  - deleting `playwright-report/`, which is root's call (ENV-VITE-ENOMEM-R53).

### 3.3 Doc 048, round-54 section

Write it per `TEMPLATE.md` and `GEORGIAN_DOCS.md`, in Georgian, with technical terms in English.
- **Context:** C-R53-01, and SPEC-R53-G-CT8.
- **Approach:** §0.1, including why removal and "accept the requested start" were rejected, and the accepted free-move side effect.
- **Changed files.**
- **Problems and solutions.**
- **Testing:** SL1, SL2, CM16, CT9, the mutations, and the REAL-mouse (PW) method note.
- **Ableton row:** the §4.9 row on cross-lane exactness (no source).
- **TODO:** 4b (round 55), 4c (round 56, C-R52-T1), R52-T.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, and 1280×720 where named; fresh load.

**Layout L52:**
- the demo video at 0 → V, where **V = the exact video-clip end** read from `window.__c` before acting (about 6.008). Record V with full double precision;
- `სრული მიქსი` on music at 7–23;
- `Soft impact` (2 s) on SFX at 4–6;
- Master 0 dB; zoom 40 px/s.

Record each fixture's exact `start`/`duration` from `window.__c` (and `data-clip-start`) and the status line before acting.

**Harness rules:**
- **REAL** = `$B click` / `$B press` / `$B select`.
- **REAL-mouse (PW)** = `page.mouse` / `page.keyboard`, for every drag, trim and Alt case.
- **SYNTHETIC** (labelled) is allowed only for setup.
- Reads: `data-clip-start`, the status line, the Undo button title, the transport readout, `window.__c` (reads only).
- No source instrumentation. Mutations only in a scratch copy outside `store/`.
- Record `node.exe` on every run.

**Checkpoint order if the session may end:** G54-2 → R54-S → R54-U → G54-1 → R52-EDGE → R54-CROSS → R53-LANE → R52-TRIM → R52-PLAY → R52-REG → G54-3 → the rest. Write `c-round-54/checkpoint.md` as you go.

**If the server is down at the start:** check again after the offline items, and once more before you write the report. Record each time. Do not start it.

### 4.1 R54-S — static (read-only)

- `diff -u --strip-trailing-cr` each owned file against its snapshot, and `git diff`:
  - **`selection.ts`:** exactly one changed line, 172, as in §0.1;
  - **the 2 test files:** a pure append of one `describe` each; the existing `it` blocks and helpers are byte-identical;
  - **doc 048:** the status line and an appended section.
- LF everywhere, with no EOL churn.
- Frozen list 409 OK; protected files 4/4.
- Banned content in the diff and the new tests: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, fake timers or snapshots.

### 4.2 R54-U — unit tests, mutations, probes

- SL1, SL2, CM16 and CT9 are green. A's red run matches §2.2, or A explains each difference.
- The frozen suites of §4.8 are green.
- C re-runs (a)–(c) and (g) with its **own** mutation strings in its own scratch copy; each must fail its named tests.
- **C extras:**
  - **(d)** µs rounding applied to the **start** instead of the delta (`start: Math.max(0, Math.round((clip.start + params.timeDelta) * 1e6) / 1e6)` for every member) → no named failure is expected, because this is an equivalent alternative. Report the result as info;
  - **(e)** in the scratch `ArrangementClip.tsx`, the single cross-lane call passes `timeDelta: roundTime(requestedStart) - original.start` → **CM16** must fail (SL1 stays green). This proves that the mounted path reaches the planner unrounded.
- **C probe re-run** (your round-53 scratch probes against the round-54 tree):
  - **P3x** → m1 on stems at ≈ 6.0004, not refused, status `გადატანა ხაზზე — სტემები: start 00:06.000.`;
  - P3s → unchanged 6.0004;
  - P1m, P1s, P2m, P4 → unchanged from round 53;
  - P5 → unchanged (by design).

### 4.3 G54-1 — gates

- tsc 0.
- vitest = **87 files / 1501, 0 failures**. Record `node.exe`. Re-run a file that timed out alone and report both runs; a recurrence of C-R48-01 is recorded under that ID.
- build passes.
- Biome `./app` read-only, within the baseline; the owned code/test files have 0 diagnostics.
- **`npm run verify` exit 0**, run quiet.

### 4.4 R52-EDGE — REAL-mouse (PW) moves on L52 (carried from rounds 52–53, never run)

Division is set via REAL `select`, Snap via REAL `g`.

**State between cases:**
- Every case starts from `Soft impact` at 4.000: undo with Ctrl+Z or use a fresh page, and record `start` before every drag.
- EG-* **and the R52-REG spot checks (§4.8)** run with **no** `Slow rise` on SFX: before the R53-LANE/R52-TRIM setup, or on a fresh page. Otherwise its edges (~9.4 / ~14.4) are valid targets, and LD-1's drop at 9 would overlap it and be refused (a false FAIL).
- With Snap on, press `g` only **after** the demo status reads ready.

| ID | Steps | Expected |
|---|---|---|
| EG-OFF | Snap off; drag the `Soft impact` header +104 px (raw 6.6) | 6.6 ± 0.025, free |
| EG-1 | Snap on, division **10**; same drag | start **7.000** (touches the music clip's start on another lane); status `კლიპის გადატანა: start 00:07.000, …`; Undo `კლიპის გადატანა`; Ctrl+Z → 4 |
| EG-VIDEO | Snap on, division 10; drag −4 px (raw 3.9) | start = **V − 2** exactly (`|start − (V − 2)| < 1e-6` from `window.__c`); end = **V** (touches the video end on another lane); record the status verbatim |
| EG-LINE | Snap on, division 1; drag +212 px (raw 9.3) | **9.000** (no edge nearer) |
| EG-ALT | division 10, Snap on, Alt held through the drag | free 6.6 ± 0.025 |
| EG-ALT-ON | Snap off, division 10, Alt held | **7.000** |
| EG-CROSS | division 10, Snap on; drag `Soft impact` down to the empty stems lane at raw ~6.6 | ghost and commit at **7.000** on stems (music is another lane); status `გადატანა ხაზზე — სტემები: start 00:07.000.` (record it exactly) |
| EG-GROUP | division 10, Snap on; click the `Soft impact` header, Ctrl-click the music clip header (selection 2), then drag `Soft impact` +104 px | both clips move by **one** grid-snapped delta (a multiple of 10 s), or both stay put with the existing group-bounds status; no edge capture. Record both starts and the status |
| EG-1280 | EG-1 at 1280×720 | same as EG-1 |

### 4.5 R54-CROSS — cross-lane exactness in the browser (new; REAL-mouse (PW))

| ID | Steps | Expected |
|---|---|---|
| CX-VIDEO | Snap on, division 10; drag the `Soft impact` header onto the empty stems lane (record the lane order and the y used) at raw ≈ 3.9 (dx −4 px) | `Soft impact` on stems with start = **V − 2** (`|start − (V − 2)| < 1e-6`) and end = V; status `გადატანა ხაზზე — სტემები: start …` (record verbatim); Undo `გადატანა ხაზზე — სტემები`; Ctrl+Z restores SFX 4 |
| CX-NOTE | — | **Discriminating only if `V · 1000` is not an integer.** Record V; if V is a whole millisecond, state that CX-VIDEO is a regression check only and that the sub-ms exactness of C-R53-01 is **unit-only** (SL1, CM16). If C finds a real `/studio-lab` asset with a sub-ms duration, also run a cross-lane end-touch with it and report it |

### 4.6 R53-LANE — same-lane rule in the browser (carried; REAL-mouse (PW))

**Setup:** Snap off; drag `Slow rise` (5 s) from the library to SFX at ~9.4 (as LD-OFF). Record its exact start **S** and duration **D** (D = 5). Then Snap on, division 1.

| ID | Steps | Expected |
|---|---|---|
| LN-TOUCH | Drag the `Soft impact` header so that raw start ≈ S − 2 − 0.1 (dx = round((S − 2.1 − 4) × 40)) | start = **S − 2** exactly (end touches `Slow rise` on the same lane; the grid line and the music start are farther); not blocked; Ctrl+Z |
| LN-AFTER | Drag `Soft impact` so that raw start ≈ S + D + 0.1 | start = **S + D** exactly (start touches `Slow rise`'s end); Ctrl+Z |
| LN-SHORT (C-R52-03) | Before dragging, confirm that 16–17 s is inside the visible timeline (scroll if not), and record the exact S and Ls **before** computing any dx. (1) Snap off: right-trim `Soft impact` to an end of ≈ 4.5 and record its exact length Ls (≈ 0.5). (2) Snap on, division 1: move `Soft impact` to start 16 (raw ≈ 16.1) → record 16.000. (3) Drag the `Slow rise` header so that raw start ≈ 16 − D + 0.4 = 11.4 | `Slow rise` start **11.000**, end **16.000** (it touches `Soft impact`); status = the normal move text, **not** the move-blocked text. Record the arithmetic with the exact S, Ls and raw; Ctrl+Z back to the setup |

### 4.7 R52-TRIM and R52-PLAY (carried)

**R52-TRIM** (REAL-mouse (PW)). Use the same `Slow rise` setup as §4.6, with `Soft impact` back at 4–6. Snap on, division 1.

| ID | Steps | Expected |
|---|---|---|
| ET-START | music clip left trim (handle centre) to raw ≈ S − 0.05 | start = **S** exactly; offset = S − 7; record the status text |
| ET-END | music clip right trim to raw ≈ S + D − 0.05 | end = **S + D** exactly |
| ET-ALT | ET-END with Alt held | free (raw ± 0.025) |
| ET-CLAMP | `Soft impact` right trim towards the music start, 7 (its source is 2 s) | blocked at the source end (6.000) with the existing blocked text; F1 unchanged |

**R52-PLAY** — real audio.

| ID | Steps | Expected |
|---|---|---|
| EP-VIDEO | Video **not** muted. After EG-VIDEO (`Soft impact` at V − 2 to V), do a REAL ruler click at ~3 s with division 1 → 3.000, then REAL Space. Sample the `h30` source-start hook and the SFX meter every 25 ms | SFX source `when` ≈ (V − 2 − 3) s after the start, `dur 2`; the SFX meter is above −∞ from a readout ≥ (V − 2) − 0.02 and ≤ (V − 2) + 0.10; the SFX source stops at V ± 0.03 while the video reaches its end |
| EP-OFF | The same with the clip moved Snap off to raw 3.9 | `when` ≈ 0.9 s (contrast) |
| EP-CROSS | After CX-VIDEO (`Soft impact` on stems at V − 2), ruler 3.000, Space | the stems source starts at ≈ (V − 2 − 3) s, `dur 2`, and the stems meter rises, not the SFX one; it stops at V ± 0.03 |

### 4.8 R52-REG — directly related regressions (carried)

- **REG-HYD:** fresh load at 1440×900, console for 3 s → no hydration, React or `useLayoutEffect` warning. Record the C-R23-01 NUL count and offsets.
- **Spot checks, one each:**
  - SN-1: Snap on 1 s, `Soft impact` +30 px → 5.000;
  - NU-1: REAL ArrowRight on a selected clip → 5;
  - a stage-2 trim (SE3-like): music right trim to a line with no edge nearer;
  - RU-1: ruler 7.3 → 7;
  - LB-MOVE: brace bar +10 px → a whole second;
  - LD-1: library drop → 9.000;
  - a Shift-locked cross-lane drag (R8-M style) keeps its start exactly.
- **Clip-body click:** PW click on the music body at ~8.4 with Snap on → seek 8.000.
- **G toggle and division texts** are unchanged. `render-budget.test.tsx` and `gesture-guard.test.tsx` are green in the full run.
- **Frozen suites** (A self-check, C G54-1):
  - `selection`, `grid-edges`, `grid-snap-clip-edges`, `grid-snap-ui`, `grid-snap-loop-drop`, `grid-snap-position`, `grid-snap-edit`;
  - `grid`, `model`, `gesture-guard`, `gesture-reentry`, `track-layout`, `render-budget`, `context-hygiene`, `view`;
  - `ArrangementContext.test.ts`, `ssr-layout-effect`, `delete-selection`.

### 4.9 G54-2, G54-3 and the Ableton table

- **G54-2:**
  - protected files 4/4 OK;
  - the frozen list all OK;
  - `git status --short` = §3.1 (17 lines in case A);
  - HEAD at the start and at the end.
- **G54-3 (anonymous workspace and purchase protection; not browser-verified for two rounds), fresh browse state:**
  - `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge;
  - no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code, including during the drags;
  - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401;
  - `/studio/middle-east` → "Sign in required".
  - Known and allowed: the root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton (workflow addendum 2026-10-11).**
- Source: Live 12 Reference Manual, chapter 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, sections **6.7** and **6.10**.
- B's gstack capture is `b-round-46/ableton-6.7-6.10-20261016.txt`; B re-used it on 2026-10-17 without a new capture, because no new behaviour is being matched.
- No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Clips snap to the editing grid | 6.7 | **Confirmed** (text) | same | EG-LINE, SN-1 |
| Clips snap to the edges of other clips | 6.7 "… including the edges of other clips …" | **Confirmed** (text) | single moves and trims (4a); groups/drop in 4c | EG-1, EG-VIDEO, EG-CROSS, CX-VIDEO, LN-TOUCH, LN-AFTER, ET-START, ET-END |
| Snap distance / grid-vs-edge priority | 6.7 does not say | **Unconfirmed** | nearest wins (µs), tie → grid, then the earlier edge; no radius (D-29z18) | EG-1 vs EG-LINE; GS3 |
| Exactness of the lock (sub-ms), same lane | — | **No source** | CZABA: the exact edge value (D-29z18) | CM12, CM13, CT8 (unit) |
| Exactness of the lock (sub-ms), across lanes | — | **No source** | CZABA: µs delta in the lane plan (D-29z19) | SL1, CM16, CT9 (unit); CX-VIDEO (discriminating only if V is sub-ms) |
| Which edge pairs count on the same lane | 6.7 does not say | **Unconfirmed** | CZABA: start→end and end→start only on the placement lane; all pairs on other lanes | LN-SHORT, CM14, CM15, CT7 |
| Grid off → no snapping | 6.10 | **Confirmed** for subdivisions; **unconfirmed** for objects | Snap off = fully free | EG-OFF |
| Alt bypasses / temporarily enables | 6.10 | **Confirmed** (text) | also applies to edges | EG-ALT, EG-ALT-ON, ET-ALT |
| Locators / time-signature targets | 6.7 | **Confirmed** | **not applicable yet** (SRW-16) | — |

C gives two verdicts per row: the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed or no-source row.

### 4.10 Not run this round, and carried items (honest)

**Not run (not PASS):**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`);
- the full find → add → fit video → export flow;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- a real `pointercancel` in the browser (CC1 is unit-only).

**Open C bugs:**
- C-R51-01 (Low → round 55 probe), C-R51-02 (Low → round 55 fix);
- C-R52-T1 (→ round 56);
- C-R48-01 (recurred in round 53), C-R41-01 (TL-Q-VIEWPORT);
- C-R27-01, C-R6-02, C-R8-01 (Tech Lead, quiet Chrome);
- C-R23-01 + C-R38-01 (Tech Lead).

**Open Low / info:**
- R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS;
- VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE, R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE;
- A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG;
- A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP.

**Root items:**
- **ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53** (restart before C; two rounds now);
- **do not commit rounds 50–53 before a round C PASS** (root's own rule; C has no offline objection, `c-round-53.md` §9). After round-54 C PASS, commit rounds 50–54 together (17 paths);
- ARCH-CHECKPOINT-SRW14-PREFS (wanted before round 55; non-gating), ARCH-CHECKPOINT-SRW13;
- GSTACK-ACL, GSTACK-NO-MOUSE;
- SRW-21: the purchased loader hardcodes `middle-east`, an inherited limitation (`publication-checkpoint.json` followupReview). Do not claim that every product's stems work;
- portable paths in the instruction files (followupReview);
- the CRLF Biome errors on the auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load.

**Tech Lead manual checks:**
- the earlier list: R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T 1–3, R50-T 1–3, R51-T 1–4;
- **R52-T:**
  1. With a real mouse: does the edge magnet feel right, or too strong (GS3)? Input: INFO-R53-NARROW-GAP. When a gap is shorter than the dragged clip, the nearest edge can win and refuse the move where the grid alone would place it.
  2. Should the magnet also work with Snap off?

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-53-r54-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-53-r54-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/selection.ts app/lib/arrangement/__tests__/selection.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md; do cmp -s "$f" "../tmp/studio-real-loop/b-round-53-r54-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/selection.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/model.test.ts app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
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

- If a test path above does not exist, report it and run the rest. Do not create test files beyond §2.2.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-54.md`:**
1. the pre-flight gate and the §1.2 baseline (case A or B);
2. the red run, mutations (a)–(c) and (g), and the green run;
3. a diff summary per file, with EOL counts;
4. the smoke result;
5. code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on);
6. verbatim command tails, including `node.exe` and `npm run verify`;
7. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-54.md` and `c-round-54.json`** (the usual schema). Give each ID one of:
- PASS;
- FAIL, with a bug ID;
- **not run**, with the reason (including **not run (harness)** and **not run (environment)**).

Cover:
- R54-S, and R54-U with the mutation table, (d)–(e) and the probe re-run;
- G54-1;
- R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM and R52-PLAY, each with its REAL / REAL-mouse (PW) / SYNTHETIC label;
- R52-REG, REG-HYD, G54-2 and G54-3;
- the Ableton two-verdict table;
- the carried items.

`passed` lists only IDs that C ran in this round. State **commit readiness** for root: whether rounds 50–54 together are ready.

## 7. Next (orientation only; not this round)

- **Round 55 — stage 4b:**
  - the lane right-click division menu (user 07:00; Live 6.10 context menu);
  - narrow/widen keys (Chrome's Ctrl+digit handling is checked first);
  - the C-R51-02 fix in `releaseEditFocusOnTimelinePointerDown`;
  - the C-R51-01 probe.
  - It is dispatched only with stage-4a browser evidence. If root answers ARCH-CHECKPOINT-SRW14-PREFS first, its approved change is planned as its own task.
- **Round 56 — stage 4c:** group-move edges (start- and end-touch targets, C-R52-T1) and the library-drop edge decision.
- **Then:** SRW-15 (+ stage 5; R14-G1), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 54 -StartPhase A` and a higher limit.
