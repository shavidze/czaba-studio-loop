# CURRENT TASK — Round 55: fix the Shift time lock for clips with a sub-millisecond start (C-R54-01 regression + C-R54-02), and run the stage-4a browser acceptance that has never run

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- Decision record: **D-29z20** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-54.md`.
- Round size: **two tightly related bugs with one root cause and one owner** (`ArrangementClip.tsx`). No new feature. Nothing is cut; stage 4b and 4c move later (§7).

> **ROOT ACTION REQUIRED BEFORE C (environment, not BLOCKED) — THIRD ROUND.** `http://127.0.0.1:5173` and `:5199` were down for A and C in rounds 52, 53 **and** 54 (C round 54: `000` at 18:47, 19:09, 19:18; B at 19:25 +04: both `000`, `b-round-54/gates.txt`). No stage-4a browser ID and **no purchase-protection check has run for three rounds**.
> - Probable cause (ENV-VITE-ENOMEM-R53): Vite died on an unhandled FSWatcher `ENOMEM … scandir 'C:\Apps\czaba-project\store\playwright-report'` (`r42-vite.err.log` tail).
> - Root must start the Store dev server **and** the backend before C. No agent starts or stops servers.
> - If the server is still down, C does the offline items (R55-S, R55-U, G55-1, G55-2) and records every browser ID as **not run (environment)**.
> - B will not dispatch stage 4b (more grid code) without stage-4a browser evidence.
>
> **Browse rules** (`backlog.harness_rules`, unchanged): never `$B restart`; a **new** `BROWSE_STATE_FILE` under your own round folder; after one CLI-daemon failure use the approved `server-node.mjs` fallback from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0` (record PID and log, stop only your own process). **GSTACK-NO-MOUSE:** every drag, trim, Shift and Alt case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)** (deviation pending root/user acceptance). Plain clicks and keys use gstack (REAL). Fixture rule: move targets stay out of the 8 px trim zones; trims start at the trim-handle centre.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every A and C run. A test that times out under load is re-run alone; report both runs under C-R48-01.
>
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`; do **not** export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 54 result** (`c-round-54.md`, `c-round-54.json`): **C FAIL.**
- **PASS:** G54-2 (17 lines, frozen 409 OK, snapshots 4/4, protected 4/4), R54-S (only `selection.ts:172` changed; pure appends), R54-U (mutations (a)(b)(c)(g) killed as specified; (d) equivalent; (e) killed by CM16). Probe P3x now lands on stems at 6.0004 and P3x-END at 8.4004 → **C-R53-01 is fixed at unit/probe level** (browser CX-VIDEO still pending).
- **FAIL — C-R54-01 (Medium, regression introduced by D-29z19).** A Shift time-locked cross-lane move of a clip whose start is **not a whole millisecond** no longer keeps its start:
  - PS-TOUCH: m1 music **6.0004** dur 2, st0 stems 0–6.0004, Snap on 1 s, Shift-drag header +40 px to stems → **refused** (`კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`, no undo). The round-53 tree placed it at 6.0004.
  - PS-FREE: same without st0 → lands at **6** (moved 0.4 ms while "time-locked").
  - **Cause:** with Shift, `ArrangementClip.tsx:371-373` sets delta 0 and `snapStep` null, but `moveStartOnGrid` (`:106-107`) still returns `roundTime(start)` = 6.000, so `:452` passes `timeDelta` −0.0004. Millisecond rounding in the planner used to swallow it; D-29z19's microsecond rounding keeps it.
  - Reachable: sub-ms starts are produced by the round-53/54 edge locks onto real decoded audio (`buffer.duration` is rarely a whole ms). Same finding as A's reviewer A-R54-REVIEW-SHIFT-SUBMS.
- **C-R54-02 (Low, pre-existing in both trees).** The same path on the **same lane**: Shift-drag of m1 at 6.0004 → start **6**, Undo `კლიპის გადატანა`, status `კლიპის გადატანა: start 00:06.000, …`. The contract (CM9/CM9b: "the Shift time lock keeps the start exactly"; an unchanged drag reports `ცვლილება არ მოხდა — ისტორია არ შეიცვალა`) says nothing should change.
- **G54-1 FAIL — C-R48-01 recurred** in 3 of 3 C full runs (roaming 5000 ms timeouts in unchanged StudioWorkspace-mounting files: `track-layout`, `sfx-library`, `master-ui`, `fader-guards`; ~2.1 s alone). A got one quiet `npm run verify` rc 0. Not caused by the round-54 diff; scheduled separately (§7, D-29z20).
- **Browser:** every ID not run (environment), third round.

**What round 55 delivers (user `2.srt` 07:00–07:53 "jump onto it and lock"; the R8-M Shift lane-change contract):** a clip that has been locked onto a real-audio edge (sub-ms start) can then be Shift-moved to another lane without losing or changing its exact start; a Shift drag on its own lane changes nothing and writes no history. Whole-ms behaviour is unchanged.

## Baseline

Measured by B on 2026-10-17 at 19:25–19:32 +04 (`b-round-54/gates.txt`, `tsc.txt`, `vitest-focus.txt`).

**Content baseline** (rounds 50–54 are uncommitted). One of these must hold:
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
- **(B)** HEAD is one or more newer **root** commits on top of `038ed5a` whose combined stat contains exactly those 17 paths, and `git status --short` is empty. Root was asked not to commit before a round C PASS; this case is only tolerated.

In both cases:
- **Frozen list:** `../tmp/studio-real-loop/b-round-54-r55-tree-sha256.txt` → **410** entries, all OK (run from `store/`). It contains every tracked and untracked `app/**` and `docs/implementation/**` file except the 3 owned files below. **`selection.ts`, `selection.test.ts`, `grid.ts`, `grid-edges.test.ts` are frozen this round** (the planner is correct; the caller is the bug).
- **Snapshots:** `../tmp/studio-real-loop/b-round-54-r55-snapshots/` with `SHA256SUMS.txt`:

  | File | sha256 prefix | LF lines | `it` |
  |---|---|---|---|
  | `ArrangementClip.tsx` | `1f6ae7b6` | 692 | — |
  | `grid-snap-clip-edges.test.tsx` | `ed042be9` | 698 | 28 |
  | doc `048-…-stage-4a.md` | `d26827ec` | 269 | — |

- **Root-commit tolerance (case B):** a mismatch confined to docs 046/047 is root's (record it as foreign with the new hash, continue). A mismatch in doc 048 or under `app/**`, or a root commit with any path beyond the 17, is a stop.
- Anything else (another HEAD, extra paths, a snapshot or frozen mismatch) → **stop and report**.

**Other measurements:** protected files 4/4 OK; tsc 0; focused vitest `grid-snap-clip-edges` + `selection` + `grid-edges` → **3 files, 59/59**; full vitest at round-54 end = **87 files / 1501** (A's quiet verify rc 0; C 3/3 full runs had load timeouts, C-R48-01); Biome `./app` **5 / 218 / 1** (the 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`, `auth-bugs.test.ts`); `node.exe` 9; `/studio-lab` 000, `:5199` 000.

**Line endings:** all 3 owned files are **LF**. Count EOLs with node (`/\r\n/g` vs `/\n/g`); diff with `diff -u --strip-trailing-cr` against the snapshots. Never run `npx biome check --write` on a file you do not own.

**Rules:** do not revert, re-create or reformat anything (rounds 47–54 stay). `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, vitest/playwright configs and the agent files belong to root. Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z20 (C-R54-01, C-R54-02)

**A Shift time-locked single-clip move requests the clip's own start, unrounded.** In `handlePointerMove`, single-clip `move` branch:

```
const requestedStart = timeLocked ? original.start : moveStartOnGrid(…unchanged arguments…);
```

Consequences (all intended):
- **Cross-lane:** `timeDelta` = `original.start − original.start` = **0** exactly, so the planner (`Math.round(0 * 1e6) / 1e6` = 0) places the clip at its exact start. PS-TOUCH and PS-FREE keep 6.0004 (C-R54-01).
- **Same lane:** `moveClip(before, id, original.start)` yields an arrangement equal by value (`isSameArrangement` is `JSON.stringify` equality, `model.ts:589`), so `commitArrangement` returns false and the existing no-change status `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` is shown with no history entry (C-R54-02). For whole-ms starts this is exactly today's behaviour.
- **Unchanged:** the group path (`groupDeltaOnGrid` with `snapStep` null → `roundTime(0)` = 0, already exact); every non-Shift move (Snap on/off, Alt, edges, D-29z18/D-29z19); trims, ranges, keyboard nudges and keyboard lane moves (they never set `timeLocked`); ghosts, refusal texts, history labels; `selection.ts`, `grid.ts`, `model.ts`.

**Why at the caller, not in the planner or by rounding back to ms:** `selection.ts` now does the right thing for the delta it receives (C-R53-01 fixed, P3x/P3x-END). The bug is that the frozen caller computed a non-zero delta for a time-locked gesture. Re-introducing ms rounding would re-open C-R53-01; special-casing in the planner would need a new parameter. Removing `roundTime` from the Snap-off branch of `moveStartOnGrid` was rejected: it would change every free (Snap off) drag, leaking pixel noise into starts (C runs it as info mutation (d)).

**Ghosts:** with Shift, the cross-lane ghost comes from the same planner call, so it is drawn at the exact original start (no change to ghost texts or colours).

**Accepted, recorded:** a Shift time-locked move still computes `targets` (edge candidates) and ignores them; no behaviour depends on it.

### 0.2 Source

**`app/components/arrangement/ArrangementClip.tsx` (LF):** one logical change at the single-clip `requestedStart` assignment (today l.436–443): the `timeLocked ? original.start : moveStartOnGrid(...)` conditional, Biome-formatted (the multi-line call may reflow; that is part of the one hunk). **No other hunk:** no new import, export, prop, helper, comment or reformatting elsewhere. `:452` stays `timeDelta: requestedStart - original.start`.

### 0.3 B decisions (D-29z20)

- C-R54-01 + C-R54-02 → one caller-side change (§0.1). The reviewer's "shared time-precision helper" (four places: `roundTime`, `roundGridTime`, `toWholeMicroseconds`, inline µs in `selection.ts`) is **not** folded in: it is a structural change on an owner touched in rounds 52–55 and goes to root as a bounded architecture checkpoint (§6, ARCH-CHECKPOINT-SRW14-PREFS, extended). Keep/extract is root's answer.
- C-R53-01 status: **fixed (unit + probe), browser pending**. Not closed until CX-VIDEO/EP-CROSS run (and stays unit-only for sub-ms if V is a whole ms, CX-NOTE).
- C-R48-01 → **not in this round** (different files, test-infra). Root request in §6; round 56 conditional (§7).
- A's reviewer Lows of round 54 (snap-off group `allowed` sub-ms only in the refused ghost; SL2 guards the planner contract only; cross-lane lock is µs-exact) → info signals, no task.
- **Ableton:** no source covers the Shift time lock across tracks; CZABA decision (R8-M). §4.9.

### 0.4 What could be affected (C checks)

Shift cross-lane drags (whole-ms and sub-ms starts, next to a touching neighbour and on an empty lane), Shift same-lane drags, Shift group drags, non-Shift cross-lane single moves (Snap on/off, Alt), CM16/P3x/P3x-END, the cross-lane ghost and refusal texts, `before-start` / `out-of-range` refusals.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:** `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `FORWARDREF_COMPONENT.md` (component file); `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`. Then run the `pre-flight` skill.
2. **Baseline before any edit:** HEAD and `git status --short` → case (A)/(B); `sha256sum -c ../tmp/studio-real-loop/b-round-54-r55-tree-sha256.txt | grep -vc ': OK$'` → 0; `cmp` each owned file with its snapshot and `(cd ../tmp/studio-real-loop/b-round-54-r55-snapshots && sha256sum -c SHA256SUMS.txt)`; protected files 4/4; Biome numbers; `node.exe`; dev-server state.
3. **Read:** `ArrangementClip.tsx` l.90–130 and l.358–490 and `finishGesture` (l.535–600); `model.ts` `moveClip`, `isSameArrangement`, `commitHistory` (read-only); `selection.ts` l.150–200 (read-only); the harness, `dragFrom`, CM9, CM9b and CM16 in `grid-snap-clip-edges.test.tsx`; `c-round-54.md` §3 and §6 (probes PS-FREE, PS-TOUCH, PS-SAME); `a-round-54.md` §5.
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.2: no comments, no `any`, no type assertions, no `@ts-ignore`; semicolons; no reformatting of unrelated lines.

### 2.2 Tests

**`grid-snap-clip-edges.test.tsx`** — append one new `describe('SRW-14 Shift time lock keeps a sub-millisecond start (C-R54-01, C-R54-02, D-29z20)', …)` at the end of the file. Existing `it` blocks and helpers stay byte-identical; reuse `mountEdgeWorkspace`, `clipAt`, `clipOf`, `exactClipEnd`, `live`, `statusText`, `pressG`, `dragFrom`, `STEMS_LANE_Y`, `MOVE_LABEL`. Settings: 40 px/s, Snap on 1 s (`pressG()`).

| ID | Fixture → action | Expected |
|---|---|---|
| CM9c | (PS-TOUCH) m1 music **6.0004** dur 2; st0 stems 0 dur **6.0004**. `dragFrom(header, root, 40, [{ dx: 40, y: STEMS_LANE_Y, shiftKey: true }])` | m1 `trackId` `'stems'`; start **`toBe(6.0004)`** (bit-exact: delta 0); start ≥ `exactClipEnd(api, 'st0')` − 1e-9; Undo `გადატანა ხაზზე — სტემები`; status `გადატანა ხაზზე — სტემები: start 00:06.000.` (A confirms the rendered string verbatim) |
| CM9d | (PS-FREE) m1 music **6.0004** dur 2 only. Same drag | m1 on `'stems'`, start **`toBe(6.0004)`**; Undo `გადატანა ხაზზე — სტემები` |
| CM9e | (PS-SAME) m1 music **6.0004** dur 2 only. `dragFrom(header, root, 40, [{ dx: 40, shiftKey: true }])` (same lane) | m1 on `'music'`, start **`toBe(6.0004)`**; `live(api).undoLabel` equals its value read before the drag (expected `null` on a fresh mount; A confirms and asserts the pre-drag value); status `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` |

If a rendered string differs from the one above, A asserts the rendered string verbatim and reports the difference (do not loosen to `not.toBe`).

**New total:** 1501 + 3 = **1504** `it`, in 87 files.

**Red/green** in a scratch copy outside `store/` (current tree + the 3 snapshot files + your new tests):
1. **Red run** on the snapshot `ArrangementClip.tsx`: **red** CM9c (refused; m1 stays on music), CM9d (start 6), CM9e (start 6, Undo `კლიპის გადატანა`); **green** every existing `it`, including CM9, CM9b, CM16, CT9. Explain every difference → `a-round-55/red-run.txt`.
2. **Green run** → `a-round-55/green-run.txt` (`grid-snap-clip-edges` + `selection` + `grid-edges`).

**A's mutations** (scratch only) → `a-round-55/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | revert to the snapshot `requestedStart` | CM9c, CM9d, CM9e |
| (b) | cross-lane-only fix: keep the snapshot `requestedStart`, change the planner call to `timeDelta: timeLocked ? 0 : requestedStart - original.start` | **CM9e only** (proves same-lane coverage) |
| (c) | same-lane-only fix: keep the snapshot `requestedStart`, change the same-lane call to `moveClip(gesture.before, original.id, timeLocked ? original.start : requestedStart)` | **CM9c, CM9d** (proves cross-lane coverage) |

If a mutation survives, strengthen the test, never the code, and report it.

**Test rules:** no `any`, `@ts-ignore`, type assertions or comments; exact strings from source or rendered output; no snapshot tests, no fake timers.

### 2.3 After the code

- **Self-check:** the frozen suites of §4.8, then full `npx vitest run` → **87 files / 1504, 0 failures**. A load timeout in an unchanged file is re-run alone and reported under C-R48-01 (both runs).
- **Biome:** read-only `npx biome check ./app` → ≤ 5 errors (baseline CRLF list only), warnings ≤ 218, 1 info; `npx biome check` on the 2 owned code/test files → 0 diagnostics.
- **Review:** run the `code-reviewer` agent on the diff (if you cannot spawn subagents, say so; root runs it). Findings and dispositions in the report; **Architecture notes** go to B (`a-round-55.md` §5), not into code.
- **Browser smoke** (one run, gstack, fresh state under `a-round-55/`; not a PASS claim), only if the dev server is up: `/studio-lab` at 1440×900 loads; a REAL `g` press works after the demo status reads ready; console clean apart from the known `/api/cart`.
- **`/check`:** `npm run verify` → exit 0, run quiet (no PW probe in parallel). Do not run `npm run test:e2e:smoke` (root only).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | A | the single-clip `requestedStart` assignment only (§0.2) |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | A | append CM9c, CM9d, CM9e (new `describe` at the end) |
| `docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` | A | status line → `Round 52–55 — D-29z17, D-29z18, D-29z19, D-29z20; C-ის შემოწმებას ელოდება`; append a section `Round 55 — Shift-ით დროის ჩაკეტვა sub-ms start-ზე (D-29z20)` (§3.3); earlier text unchanged |
| `../tmp/studio-real-loop/a-round-55.md`, `a-round-55/` | A | report, gate output, own browse state |
| `../tmp/studio-real-loop/c-round-55.md`, `c-round-55.json`, `c-round-55/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end (case A): 17 lines** — the same 17 as the baseline (all three owned paths are already listed). Case (B): ` M` for the owned paths only. The frozen list must stay all OK.

### 3.2 Frozen this round

- Everything in `b-round-54-r55-tree-sha256.txt` and everything else under `store/`, including `selection.ts`, `selection.test.ts`, `grid.ts`, `grid-edges.test.ts`, `grid-snap-ui.test.tsx`, `grid-snap-loop-drop.test.tsx`, `grid-snap-edit.test.tsx`, `grid-snap-position.test.tsx`, `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `ArrangementContext.tsx`, `model.ts`, `loop.ts`, `library.ts` and every other test file.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`): `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`; `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`; `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`; `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`; firebase/R2/auth/purchase code; `public/**`, `package.json`, the lockfile; `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`; the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`; docs 001–047; the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work (rounds 50–54 are work to keep); in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`; deleting `playwright-report/` or `store/nul` (root's call).

### 3.3 Doc 048, round-55 section

Georgian, technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`.
- **Context:** C-R54-01 (regression from D-29z19, = A-R54-REVIEW-SHIFT-SUBMS), C-R54-02 (pre-existing).
- **Approach:** §0.1, including why the caller (not the planner, not ms rounding, not removing `roundTime` from the free branch) was chosen.
- **Changed files; Problems and solutions; Testing** (CM9c–CM9e, red run, mutations (a)–(c), REAL-mouse (PW) note).
- **Ableton row:** §4.9 (Shift lock across lanes — no source; CZABA decision R8-M).
- **TODO:** 4b, 4c (C-R52-T1), C-R48-01, ARCH-CHECKPOINT time-precision question, R52-T.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, and 1280×720 where named; fresh load.

**Layout L52:** the demo video at 0 → V, where **V = the exact video-clip end** read from `window.__c` before acting (record with full double precision); `სრული მიქსი` on music at 7–23; `Soft impact` (2 s) on SFX at 4–6; Master 0 dB; zoom 40 px/s. Record each fixture's exact `start`/`duration` (`window.__c`, `data-clip-start`) and the status line before acting.

**Harness:** **REAL** = `$B click` / `$B press` / `$B select`; **REAL-mouse (PW)** = `page.mouse` / `page.keyboard` for every drag, trim, Shift and Alt case; **SYNTHETIC** (labelled) only for setup. Reads: `data-clip-start`, the status line, the Undo title, the transport readout, `window.__c` (reads only). No source instrumentation; mutations only in a scratch copy outside `store/`. Record `node.exe` on every run.

**Checkpoint order:** G55-2 → R55-S → R55-U → G55-1 → R52-EDGE → R55-SHIFT → R54-CROSS → R53-LANE → R52-TRIM → R52-PLAY → R52-REG → G55-3 → the rest. Write `c-round-55/checkpoint.md` as you go.

**If the server is down at the start:** check again after the offline items and once more before the report. Record each time. Do not start it.

### 4.1 R55-S — static (read-only)

- `diff -u --strip-trailing-cr` against the snapshots and `git diff`: `ArrangementClip.tsx` — exactly one hunk at the single-clip `requestedStart` assignment, as §0.2; the test file — a pure append of one `describe`; doc 048 — the status line plus an appended section.
- LF everywhere, no EOL churn. Frozen list 410 OK; protected 4/4.
- Banned content in the diff and new tests: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, fake timers or snapshots.

### 4.2 R55-U — unit tests, mutations, probes

- CM9c, CM9d, CM9e green; A's red run matches §2.2 or A explains each difference; the frozen suites of §4.8 green.
- C re-runs (a)–(c) with its **own** mutation strings in its own scratch copy; each must fail exactly its named tests.
- **C extra (d), info:** remove `roundTime` from the Snap-off branch of `moveStartOnGrid` (`Math.max(0, start + delta)`) on the **snapshot** caller → report which tests fail (expected: CM9c–CM9e may pass, free-move tests may fail). Equivalent-or-not is information, not a defect.
- **C probe re-run** (round-54 scratch probes against the round-55 tree): **PS-TOUCH** → stems 6.0004, status `გადატანა ხაზზე — სტემები: start 00:06.000.`; **PS-FREE** → stems 6.0004; **PS-SAME** → music 6.0004, no history, no-change status; P3x → stems 6.0004 and P3x-END → 8.4004 (unchanged from round 54); PF-FREE → 7 (the D-29z19 accepted side effect, unchanged); PG-GROUP2 → unchanged; P1m, P1s, P2m, P4, P5 → unchanged. **New PS-GROUP:** group m1 music 6.0004 + t2 sfx 2, Shift-drag anchor m1 to stems → both starts unchanged (group path unaffected).

### 4.3 G55-1 — gates

- tsc 0; build passes; Biome `./app` read-only within the baseline; owned code/test files 0 diagnostics.
- vitest = **87 files / 1504, 0 failures**. Record `node.exe`. Re-run a timed-out file alone; record every recurrence under C-R48-01.
- **`npm run verify` exit 0**, run quiet; at most two quiet attempts, each recorded. Tolerances and timeouts are not changed. If neither attempt is rc 0, G55-1 is FAIL (C-R48-01), not PASS.

### 4.4 R55-SHIFT — Shift lock in the browser (new; REAL-mouse (PW))

Discriminating for the sub-ms case **only if a sub-ms start can be produced in the browser.** Record V first.

| ID | Steps | Expected |
|---|---|---|
| SH-CROSS | Snap on, division 10; EG-VIDEO's end state as setup (`Soft impact` → start V − 2, end V; EG-VIDEO's result is recorded once, under R52-EDGE). Then Shift-drag its header to the empty stems lane (+40 px x) | `Soft impact` on stems, start **unchanged** (`|start − before| < 1e-9` from `window.__c`); status `გადატანა ხაზზე — სტემები: start …` (verbatim); Undo `გადატანა ხაზზე — სტემები`; Ctrl+Z restores SFX at the same start |
| SH-SAME | From SFX at V − 2, Shift-drag +40 px on the same lane | start unchanged; status `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`; Undo title unchanged from before the drag |
| SH-NOTE | — | If `(V − 2) · 1000` is an integer, state that SH-CROSS/SH-SAME are regression checks only and the sub-ms fix is **unit-only** (CM9c–CM9e, PS-*). If C finds a real `/studio-lab` asset with a sub-ms duration, lock onto its edge first and repeat both |

### 4.5 R52-EDGE — REAL-mouse (PW) moves on L52 (carried, never run)

Division via REAL `select`, Snap via REAL `g`. Every case starts from `Soft impact` at 4.000 (Ctrl+Z or fresh page; record `start` before every drag). EG-* and the R52-REG spot checks run with **no** `Slow rise` on SFX (before the R53-LANE/R52-TRIM setup or on a fresh page). Press `g` only after the demo status reads ready.

| ID | Steps | Expected |
|---|---|---|
| EG-OFF | Snap off; drag the `Soft impact` header +104 px (raw 6.6) | 6.6 ± 0.025, free |
| EG-1 | Snap on, division **10**; same drag | start **7.000** (music clip's start on another lane); status `კლიპის გადატანა: start 00:07.000, …`; Undo `კლიპის გადატანა`; Ctrl+Z → 4 |
| EG-VIDEO | Snap on, division 10; drag −4 px (raw 3.9) | start = **V − 2** (`|start − (V − 2)| < 1e-6`); end = V; status verbatim |
| EG-LINE | Snap on, division 1; drag +212 px (raw 9.3) | **9.000** |
| EG-ALT | division 10, Snap on, Alt held through the drag | free 6.6 ± 0.025 |
| EG-ALT-ON | Snap off, division 10, Alt held | **7.000** |
| EG-CROSS | division 10, Snap on; drag `Soft impact` to the empty stems lane at raw ~6.6 | ghost and commit at **7.000** on stems; status `გადატანა ხაზზე — სტემები: start 00:07.000.` |
| EG-GROUP | division 10, Snap on; select `Soft impact` + Ctrl-click the music header; drag `Soft impact` +104 px | both move by one grid-snapped delta (multiple of 10 s) or both stay with the existing group-bounds status; no edge capture; record both starts and the status |
| EG-1280 | EG-1 at 1280×720 | same as EG-1 |

### 4.6 R54-CROSS — cross-lane exactness (carried; REAL-mouse (PW))

| ID | Steps | Expected |
|---|---|---|
| CX-VIDEO | Snap on, division 10; drag the `Soft impact` header onto the empty stems lane at raw ≈ 3.9 (dx −4 px; record lane order and y) | on stems with start = **V − 2** (`< 1e-6`), end = V; status `გადატანა ხაზზე — სტემები: start …` (verbatim); Undo `გადატანა ხაზზე — სტემები`; Ctrl+Z restores SFX 4 |
| CX-NOTE | — | Discriminating only if `V · 1000` is not an integer; otherwise CX-VIDEO is a regression check and C-R53-01's sub-ms exactness stays **unit-only** (SL1, CM16) |

### 4.7 R53-LANE, R52-TRIM, R52-PLAY (carried)

**Setup for R53-LANE / R52-TRIM:** Snap off; drag `Slow rise` (5 s) from the library to SFX at ~9.4. Record its exact start **S** and duration **D**. Then Snap on, division 1.

| ID | Steps | Expected |
|---|---|---|
| LN-TOUCH | Drag `Soft impact` so raw start ≈ S − 2.1 | start = **S − 2** exactly; not blocked; Ctrl+Z |
| LN-AFTER | raw start ≈ S + D + 0.1 | start = **S + D** exactly; Ctrl+Z |
| LN-SHORT (C-R52-03) | Confirm 16–17 s is visible; record S and Ls first. (1) Snap off: right-trim `Soft impact` to ≈ 4.5, record Ls. (2) Snap on, division 1: move `Soft impact` to 16 (raw ≈ 16.1). (3) Drag the `Slow rise` header to raw ≈ 11.4 | `Slow rise` start **11.000**, end **16.000**; the normal move status, not the blocked text; record the arithmetic; Ctrl+Z back |
| ET-START | music left trim (handle centre) to raw ≈ S − 0.05 | start = **S**; offset = S − 7; record status |
| ET-END | music right trim to raw ≈ S + D − 0.05 | end = **S + D** |
| ET-ALT | ET-END with Alt held | free (raw ± 0.025) |
| ET-CLAMP | `Soft impact` right trim towards 7 | blocked at its source end (6.000) with the existing blocked text |

**R52-PLAY — real audio** (video not muted; sample the `h30` source-start hook and the meters every 25 ms):

| ID | Steps | Expected |
|---|---|---|
| EP-VIDEO | after EG-VIDEO: REAL ruler click ~3 s (division 1 → 3.000), REAL Space | SFX source `when` ≈ (V − 5) s after start, `dur 2`; SFX meter above −∞ from readout ≥ (V − 2) − 0.02 and ≤ (V − 2) + 0.10; source stops at V ± 0.03 |
| EP-OFF | same with the clip moved Snap off to raw 3.9 | `when` ≈ 0.9 s |
| EP-CROSS | after CX-VIDEO: ruler 3.000, Space | the **stems** source starts at ≈ (V − 5) s, `dur 2`; the stems meter rises, not SFX; stops at V ± 0.03 |
| EP-SHIFT | after SH-CROSS: ruler 3.000, Space | the stems source starts at the same `when` as before the Shift move (start unchanged), stems meter rises |

### 4.8 R52-REG — directly related regressions (carried)

- **REG-HYD:** fresh load 1440×900, console for 3 s → no hydration, React or `useLayoutEffect` warning; record the C-R23-01 NUL count and offsets.
- **Spot checks, one each:** SN-1 (Snap on 1 s, `Soft impact` +30 px → 5.000); NU-1 (REAL ArrowRight on a selected clip → 5); a stage-2 trim (music right trim to a line with no edge nearer); RU-1 (ruler 7.3 → 7); LB-MOVE (brace bar +10 px → a whole second); LD-1 (library drop → 9.000); a whole-ms Shift-locked cross-lane drag keeps its start exactly (R8-M).
- **Clip-body click:** PW click on the music body at ~8.4 with Snap on → seek 8.000.
- G toggle and division texts unchanged; `render-budget.test.tsx` and `gesture-guard.test.tsx` green in the full run.
- **Frozen suites** (A self-check, C G55-1): `selection`, `grid-edges`, `grid-snap-clip-edges`, `grid-snap-ui`, `grid-snap-loop-drop`, `grid-snap-position`, `grid-snap-edit`; `grid`, `model`, `gesture-guard`, `gesture-reentry`, `track-layout`, `render-budget`, `context-hygiene`, `view`; `ArrangementContext.test.ts`, `ssr-layout-effect`, `delete-selection`, `delete-selection-ui`.

### 4.9 G55-2, G55-3 and the Ableton table

- **G55-2:** protected files 4/4 OK; frozen list all OK; `git status --short` = §3.1 (17 lines in case A); HEAD at start and end.
- **G55-3 (anonymous workspace and purchase protection; not browser-verified for three rounds), fresh browse state:** `/studio-lab` opened directly and via the header link shows the workspace with the demo badge; no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code, including during the drags; anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; `/studio/middle-east` → "Sign in required". Known and allowed: root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton (workflow addendum 2026-10-11).** Source: Live 12 Reference Manual ch. 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, §6.7 and §6.10; B's gstack capture `b-round-46/ableton-6.7-6.10-20261016.txt` (re-used 2026-10-17, no new capture; nothing new is matched). In the capture, Shift appears only for slip-editing the clip contents and for extending a selection; **no source** describes a Shift time lock when moving clips across tracks. No video watched, no Live installation used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Shift keeps the time when changing lanes | — | **No source** | CZABA (R8-M): Shift = lane change at the exact start, edges and grid ignored; same lane = no change | CM9, CM9b, CM9c–CM9e; SH-CROSS, SH-SAME |
| Clips snap to the editing grid | 6.7 | **Confirmed** (text) | same | EG-LINE, SN-1 |
| Clips snap to the edges of other clips | 6.7 | **Confirmed** (text) | single moves and trims (4a); groups/drop in 4c | EG-1, EG-VIDEO, EG-CROSS, CX-VIDEO, LN-TOUCH, LN-AFTER, ET-START, ET-END |
| Snap distance / grid-vs-edge priority | 6.7 does not say | **Unconfirmed** | nearest wins (µs), tie → grid, then the earlier edge; no radius (D-29z18) | EG-1 vs EG-LINE |
| Lock exactness (sub-ms), same lane / across lanes | — | **No source** | CZABA: exact edge (D-29z18), µs delta (D-29z19) | CM12, CM13, CT8, SL1, CM16, CT9 (unit); CX-VIDEO |
| Which edge pairs count on the same lane | 6.7 does not say | **Unconfirmed** | start→end and end→start on the placement lane; all pairs on other lanes | LN-SHORT |
| Grid off → no snapping | 6.10 | **Confirmed** for subdivisions; **unconfirmed** for objects | Snap off = fully free | EG-OFF |
| Alt bypasses / temporarily enables | 6.10 | **Confirmed** (text) | also applies to edges | EG-ALT, EG-ALT-ON, ET-ALT |
| Locators / time-signature targets | 6.7 | **Confirmed** | **not applicable yet** (SRW-16) | — |

C gives two verdicts per row: the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed or no-source row.

### 4.10 Not run this round, and carried items (honest)

**Not run (not PASS):** video sync and C-R27-01 (RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`; G3-R, G3-3, G3-shots); the full find → add → fit video → export flow with WAV checks; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root); a real `pointercancel`.

**Open C bugs:** C-R53-01 (fixed unit/probe; browser pending); C-R51-01, C-R51-02 (→ 4b); C-R52-T1 (→ 4c); C-R48-01 (Medium, recurring; §6/§7); C-R41-01 (TL-Q-VIEWPORT); C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 + C-R38-01 (Tech Lead).

**Open Low / info:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE, R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE, A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG, A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE, A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP, A-R54-REVIEW-LOWS.

**Root items:** ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53 (third round); C-R48-01 config request (§6); do not commit rounds 50–54 before a round C PASS (after a round-55 C PASS, rounds 50–55 form one commit, 17 paths); ARCH-CHECKPOINT-SRW14-PREFS (extended with the time-precision question), ARCH-CHECKPOINT-SRW13; GSTACK-ACL, GSTACK-NO-MOUSE; SRW-21 (the purchased loader hardcodes `middle-east`; do not claim every product's stems work); portable paths in instruction files; CRLF Biome errors on auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load; stray `store/nul`; git autocrlf warning on owned LF files (A round 54 §7).

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T with INFO-R53-NARROW-GAP).

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-54-r55-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-54-r55-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/ArrangementClip.tsx app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md; do cmp -s "$f" "../tmp/studio-real-loop/b-round-54-r55-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
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

If a test path above does not exist, report it and run the rest. C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A; needed for C and for completion)

1. **Start the Store dev server and backend before C** (third round; ENV-VITE-ENOMEM-R53). Keeping `playwright-report/` out of the Vite watcher is root's call.
2. **C-R48-01 (Medium, gate reliability):** in round 54 C's full vitest and both quiet `npm run verify` runs failed on 5000 ms timeouts in unchanged StudioWorkspace-mounting files (`track-layout` "folds a lane to a 36 px row…" in 4 of 5 C multi-file runs; `sfx-library`, `master-ui`, `fader-guards`); each is ~2.1 s alone. The lever is root-owned (`vitest.config` `testTimeout` for the jsdom StudioWorkspace suites, or a worker cap). Please answer with one of: (a) root changes the config (state the value), or (b) B schedules a bounded A task with per-file timeouts in the named test files (round 56).
3. **ARCH-CHECKPOINT-SRW14-PREFS, extended (bounded, non-gating):** the same owner (`ArrangementClip.tsx` / `selection.ts` / `grid.ts`) has changed in rounds 52, 53, 54 and 55, and two of those were precision bugs at the boundary between them. Question for frontend-architect (`store/.claude/references/architecture-checkpoint.md`): keep or extract a single time-precision rule (today `roundTime` ms in `ArrangementClip.tsx:94`, `roundGridTime` ms in `grid.ts:11`, `toWholeMicroseconds` in `grid.ts:88`, inline µs in `selection.ts:172`), together with the earlier StudioWorkspace view/edit-prefs question. Answer: keep/extract, value, risk, ≤ 3 sentences. An approved change becomes its own B task with one owner and behaviour-preserving tests.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-55.md`:** (1) pre-flight gate and §1.2 baseline (case A/B); (2) red run, mutations (a)–(c), green run; (3) diff summary per file with EOL counts; (4) smoke result; (5) code-reviewer findings, dispositions, any Architecture note; (6) verbatim command tails incl. `node.exe` and `npm run verify`; (7) deviations. Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-55.md` and `c-round-55.json`** (usual schema). Each ID: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment). Cover R55-S, R55-U (mutation table, (d), probes), G55-1, R55-SHIFT, R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM, R52-PLAY, R52-REG, REG-HYD, G55-2, G55-3, the Ableton two-verdict table and the carried items. `passed` lists only IDs run this round. State **commit readiness** for root (rounds 50–55 together).

**Next (orientation only):**
- **Round 56:** if root answers §6.2 with (b), or has not answered, → C-R48-01 bounded test-headroom task (no browser needed). If root fixed it by config **and** stage-4a browser evidence exists → stage 4b.
- **Stage 4b** (lane right-click division menu; narrow/widen keys after the Chrome Ctrl+digit check; C-R51-02 fix; C-R51-01 probe) — only with stage-4a browser evidence.
- **Stage 4c:** group-move edges (start- and end-touch targets, C-R52-T1), library-drop edge decision.
- **Then:** SRW-15 (+ stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 55 -StartPhase A` and a higher limit.
