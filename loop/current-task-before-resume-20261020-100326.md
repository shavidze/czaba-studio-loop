# CURRENT TASK — Round 63: SRW-14 stage 4c-1 fix-up — an unreachable clip edge no longer reports a completed group move as stopped (C-R62-01, D-29z28). Includes INFO-R62-EDGE-TOL (pin the edge bound tolerance), A-R62-REVIEW-R5-POSITIVE-LANE (a placement-lane edge captures the anchor) and C-R62-ALT-ENABLE-GROUP-GAP (Alt with Snap off for a group). Stage 4c-2 (library-drop edges) moves to round 64.

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-19
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- **Decision record:** **D-29z28** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-62.md`.
- **Round size:** one owner (A), **one C bug** (C-R62-01) plus **two closely related test gaps** in the same helper and the same `describe`. Source: **one branch of one function** in `grid.ts`. Tests: two files. `ArrangementClip.tsx` is **frozen**.
- **Why now:** C bugs go first. C round 62 was a PASS with one Low (C-R62-01). This is the same pattern as round 61, the fix-up for 4b-2b. Stage 4c-2 is not cut; it moves to round 64.

> **Servers.** At B's check (2026-10-19 12:35 +04, `b-round-62/gates.txt`): `/studio-lab` **200**, `:5199/api/products` **000**. The backend was down for all of C round 62 (11:41–12:07). Root's round-62 §6.1 request was not met. Root is asked again (§6.1).
> - Check both servers at the start of A and of C, and record the result. Agents never start or stop servers.
> - `/studio-lab` needs no backend for §4.6 (round 61–62 network logs: only the root-allowed `GET /api/cart`).
>   - **If only the backend is down:** run §4.6 and record that the backend was down. G63-3's token rows are then "not run (environment)" (§4.8).
>   - **If `:5173` is down:** write "not run (environment)" for every browser item.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every drag, Ctrl-click selection, held press and wheel uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
> - **ENV-EXT-LOAD-HANG (round 62):** if Google Fonts or GTM requests hang, wait for `domcontentloaded`, then the workspace selector, then 4 s, and record that you did. This changes test setup only.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Do not export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 62 result** (`c-round-62.md`, `c-round-62.json`): **C PASS + one Low.**
- **Offline:** G62-2 (case A, 31 lines; frozen 418; protected 4/4); R62-S; R62-U (a–k, the 4a re-runs, n/p/q and x1 killed; **x2 survives**); G62-1 (tsc 0; Biome 5/218/1; **89 / 1569**; build; verify rc 0 on attempt 1).
- **Browser** (REAL-mouse PW):
  - at 1440×900 and 1280×720: GE-START, GE-END, GE-MEMBER, GE-ALT, GE-OFF, EG-REG;
  - at 1440×900: GE-BOUNDS, GE-CROSS, GE-PLAY (real audio) and EG-GROUP.
- **G62-3:** the workspace (direct and via the header), the network check and the sign-in gate pass. The token rows were not run, because the backend was 000; the recorded codes were 401 and 500.
- **Closed by C evidence:** C-R52-T1, INFO-R55-FREE-ROUND-UNGUARDED, A-R55-REVIEW-SHIFT-MIDDRAG-TEST.

**C-R62-01 (Low; = A-R62-REVIEW-OOB-EDGE-STATUS).** C's repro:
- Fixture: SI 4/2 and Slow rise at 12.3/5, with a neighbour at 19.3, so maxDelta is 2.0. Division 1, raw start 6.025.
- The nearest edge (video end 6.008, delta 2.008) is out of bounds, so the group lands on grid line 6 (delta 2). Before round 62 this was a normal, unblocked move.
- **But** `requested` (2.008) ≠ `allowed` (2), so `gesture.blocked` is true. During the drag and after the release the status reads `ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.`, and the success line is never written.
- The data is correct; the user is told that a completed move was stopped.

## Baseline

Measured by B on 2026-10-19 12:35 +04 (`b-round-62/gates.txt`).

**The content baseline decides; HEAD may differ.** Root may publish pending units (`cb12805` = rounds 50–58; rounds 59, 60, 61, 62) before or during this round. Any of these is valid at the start:
- **(A)** HEAD `038ed5a45f94596a264c14c4ec834607cb407948`, `git status --short` **31 lines** (the round-62 end state; `b-round-62/status-start.txt`).
- **(B)** HEAD `cb128056…` (rounds 50–58 applied), **13 lines** (round 62's case-B end set).
- **(C)** a newer **root** commit with rounds 59–60 but not 61: **9 lines** (round 62's case-C end set).
- **(D)** a newer **root** commit with round 61 but not 62: **5 lines** (` M` `grid.ts`, `ArrangementClip.tsx`, `grid-edges.test.ts`, `grid-snap-clip-edges.test.tsx`; `?? doc 055`).
- **(E)** a newer **root** commit with round 62: `git status --short` is **empty**.

**In every case:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-62-r63-tree-sha256.txt`, **420** entries, all OK (run from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 3 owned files below.
  - **Newly frozen:** `ArrangementClip.tsx` (`97a1bf79`) and doc 055 (`e9fddf7a`), at C's round-62 end hashes.
- **Snapshots:** `../tmp/studio-real-loop/b-round-62-r63-snapshots/` with `SHA256SUMS.txt`. No owned file may differ from its snapshot at the start:

  | File | sha256 prefix | EOL (CRLF / LF) | `it` |
  |---|---|---|---|
  | `app/lib/arrangement/grid.ts` | `d87b9b0c` | 0 / 207 | — |
  | `app/lib/arrangement/__tests__/grid-edges.test.ts` | `1d216557` | 0 / 108 | 9 |
  | `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | `49b35e40` | 0 / 919 | 41 |

- **B's check:** the round-62 frozen list is still 418/418 OK and the new list is 420/420 OK. Protected files 4/4 OK.
- **Anything else is a stop and report:** a frozen or snapshot mismatch, or a status that fits none of A–E.

**Other measurements:**
- `node.exe` 13.
- Full vitest at round-62 end: **89 files / 1569** (A and C rc 0).
- Biome `./app`: **5 / 218 / 1**. The 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`.

**Line endings:** the 3 owned files are LF and stay LF. Never run `biome check --write`, `format --write` or `npm run format`.

**Rules:**
- Do not revert, re-create or reformat anything. The work of rounds 47–62 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z28: an out-of-bounds edge is not a reachable candidate

This changes D-29z27 G3 **only for the out-of-bounds edge case**. G1, G2, G4 and the grid-win path are unchanged.

**New G3 (the helper `snapGroupMoveDelta`):**
- Let `gridResult = { requested: roundGridTime(gridStart − anchorStart), allowed: snapGroupDelta(anchorStart, rawDelta, step, minDelta, maxDelta) }`. This is exactly what the grid-win branch returns today.
- **Grid wins** (`target` equals `gridStart` in whole µs) → `gridResult`. **Unchanged.**
- **An in-bounds edge wins** (`minDelta − 1e-6 ≤ requested ≤ maxDelta + 1e-6`, with `requested` in whole µs) → `{ requested, allowed: requested }`. **Unchanged.**
- **An out-of-bounds edge wins** → **`gridResult`** (new). Today the code returns `{ requested: <edge µs delta>, allowed: gridResult.allowed }`.

**Consequence: the group move behaves byte-for-byte as before round 62 in the out-of-bounds case.** This covers:
- `allowed`;
- `gesture.blocked = |allowed − requested| > 1e-9`;
- the blocked status during the drag;
- the success status on release;
- the cross-lane `planClipLaneMove(… timeDelta: requested)`.

**Effect on the fixtures already on file:**

| Fixture | Bounds | Grid line delta | Edge | Before → after |
|---|---|---|---|---|
| C-R62-01 (browser) | max 2.0 | 2 (in bounds) | 2.008 (out) | blocked → **not blocked**; the success status is written |
| GE-BOUNDS (browser) | max 1.5 | 2 (out) | 2.008 (out) | blocked → blocked (unchanged) |
| CG4 (unit) | max 5.3 | 6 (out) | 6.4 (out) | blocked → blocked (unchanged) |
| GS5b `grid-snap-ui` | — | out | no edges | unchanged |
| CE9 (unit) | max 5 | 6 (out) | 6.4 (out) | `requested` 6.4 → **6**; `allowed` stays 5 |

**Recorded consequence (not a bug; C probes it as info, GE-CROSS-OOB):** in a cross-lane group move whose nearest edge is out of the **source-lane** bounds, that edge is not tried on the target lane. This is the pre-round-62 grid behaviour.

**Where (shape, not literal code):**
- **`grid.ts`:** only the body of `snapGroupMoveDelta`. Its signature, return type and the other two branches are unchanged. No other function or export changes.
- **`ArrangementClip.tsx`:** **frozen**. No edit is needed, because it already derives `blocked` from `requested` and `allowed`.
- No new UI text, state or props.

**Rejected:**
- **(a) Accept the misleading status.** That would ship a status regression without the user's authorisation.
- **(c) Always write the success status when the clips moved.** That would print "moved" for a group that really was stopped (GE-BOUNDS).
- **Recompute the grid delta in `ArrangementClip.tsx`.** It would duplicate the helper's logic, and the cross-lane `requested` would stay the edge delta.

### 0.2 INFO-R62-EDGE-TOL: pin the ±1e-6 bound tolerance

- **Test only (CE11).** C's mutation x2 (the tolerance removed) survived round 62.
- CE11 pins both the max side and the min side: an edge 5e-7 s past the bound still butts.

### 0.3 A-R62-REVIEW-R5-POSITIVE-LANE and C-R62-ALT-ENABLE-GROUP-GAP

- **Test only.**
  - **CG8:** on the placement lane, a clip start captures the anchor's end. CG5 only proved the negative half; the positive half was shown in the browser by GE-CROSS.
  - **CG9:** Alt with Snap off enables the grid and edges for a group. C did not re-test this half in round 62.

### 0.4 Ableton (workflow addendum 2026-10-11)

**Source:** Live 12 Reference Manual, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, §6.7 and §6.10. B capture `b-round-46/ableton-6.7-6.10-20261016.txt` (captured 2026-10-16; re-used, record ID as in D-29z27). No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Status text after a group move that landed on a grid line | — | **not applicable** (the manual describes no status line) | CZABA status behaviour: "moved" when the move completed; "stopped" only if the grid line itself is blocked | CG7, GE-OOB-STATUS, GE-BOUNDS-REG |
| An out-of-bounds edge falls back to the in-bounds grid line | — | **unconfirmed (no source)** | unchanged from D-29z27 (`allowed`); only `requested` changes | CE9, CE10, CG4 |
| Alt temporarily enables snapping while Snap is off | §6.10 (text) | **confirmed** as a general rule | applied to a group anchor with edges (CZABA decision; the manual does not cover multi-selection) | CG9, GE-ALT-ENABLE |
| A placement-lane clip edge captures a dragged clip | §6.7 (text: "the edges of other clips") | **confirmed** for a single dragged clip | the lane rule (D-29z18) and the group anchor rule (D-29z27) are CZABA decisions | CG8, GE-CROSS-REG |

Nowhere may a report claim "Ableton does the same" for the unconfirmed or not-applicable rows.

### 0.5 Source

| File | Change |
|---|---|
| `app/lib/arrangement/grid.ts` | §0.1: the out-of-bounds branch of `snapGroupMoveDelta` returns `gridResult`. Nothing else changes. |

- **Frozen:** everything else, including `ArrangementClip.tsx`, `selection.ts`, `ArrangementLane.tsx`, `StudioWorkspace.tsx`, `ArrangementGridMenu.tsx`, `ArrangementContext.tsx`, every other `grid-snap-*` test, `grid.test.ts` and docs 001–055.
- No comments, no `any`, no type assertions, no `@ts-ignore`; semicolons everywhere.

### 0.6 What could be affected (C checks)

- **Grid wins and in-bounds edge wins:** byte-identical. CE7, CE8, CM10, CG1–CG3, CG5, CG6 and the 4a single-move and trim tests stay unchanged and pass.
- **Group bounds status:** GS5b (`grid-snap-ui`), CG4 and the browser GE-BOUNDS row must still show the stopped status.
- **Cross-lane groups:** CG5 and GE-CROSS are unchanged (their edge is in bounds).
- **Expected suite: 89 files / 1574** (1569 + 5: CE10, CE11, CG7, CG8, CG9). CE9 is revised, not added.
  - `grid-edges`: **11** `it`;
  - `grid-snap-clip-edges`: **44** `it`.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. Musical divisions and triplets belong to SRW-14 stage 5, after the SRW-15 BPM. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case A–E;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-62-r63-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - the snapshots' `SHA256SUMS.txt` and `cmp` for each owned file;
   - protected 4/4; Biome numbers; `node.exe`; both servers.
3. **Red run first:**
   - Write the §2.2 tests before the source change and run them on the **unmodified** `grid.ts`.
   - **CE9 (revised), CE10 and CG7 must fail. CE11, CG8 and CG9 must pass**, because they pin existing behaviour.
   - Record the failing assertions. If the red run differs, stop and report to B.
4. Post the pre-flight gate and the red run at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.1 and §0.5.

### 2.2 Tests

**`app/lib/arrangement/__tests__/grid-edges.test.ts` (LF).**
- **Narrow grant (C checks by AST):** only CE9's `expect(result.requested).toBeCloseTo(6.4, 9);` becomes **`expect(result.requested).toBe(6);`**.
  - CE9's title, its other two `expect` (allowed 5, and A's D1 line at max 5.3) and every other `it` stay unchanged.
- Append to the `describe('SRW-14 stage 4c group move snaps the anchor to edges (D-29z27)')`:

| ID | Call(s) | Must assert |
|---|---|---|
| CE10 an out-of-bounds edge with an in-bounds grid line returns an unblocked grid delta | `snapGroupMoveDelta(2, 2, 6.35, 1, -2, 6.2, [], [10.4])` | `toEqual({ requested: 6, allowed: 6 })`: the end touch 8.4 needs delta 6.4 > 6.2; grid line 8 gives delta 6 |
| CE11 an edge within 1e-6 of a bound still butts | (1) `snapGroupMoveDelta(0, 1, 2.45, 1, 0, 2.4999995, [2.5], [])`; (2) `snapGroupMoveDelta(3, 1, -0.45, 1, -0.4999995, Infinity, [2.5], [])` | (1) `toEqual({ requested: 2.5, allowed: 2.5 })`; (2) `toEqual({ requested: -0.5, allowed: -0.5 })` |

**`app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` (LF).**
- **No change** to any existing line. Only an import of `GROUP_MOVE_BLOCKED_MESSAGE` from `~/lib/arrangement/selection` may be added. Alternatively, use the literal `'ჯგუفის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.'` in a describe-scoped `const`; copy it byte for byte from `selection.ts` l.7.
- Append CG7–CG9 to the end of the `describe('SRW-14 stage 4c group move snaps the anchor to edges of other clips (D-29z27)')`, after CG6.
- Use the existing `selectGroupPair` and the anchor `m1`, with `pointerId: 3` for every group drag.

| ID | Fixture → drag of `m1` | Must assert |
|---|---|---|
| CG7 an unreachable edge does not report a completed group move as stopped (C-R62-01) | m1 music 2/2, s2 sfx 2/2, **s3 sfx 10.2/0.8** (s2 maxDelta 6.2), st1 stems 10.4/1.6; `pressG()`; select m1 + s2; `dragFrom(…, [{ dx: 254 }], { pointerId: 3, release: false })` (raw 8.35; nearest = st1 end touch 8.4, delta 6.4 out of bounds; grid 8, delta 6 in bounds) | **mid-drag:** the status is **not** the blocked message; then `fireEvent.pointerUp(parts.root, { pointerId: 3, clientX: 294, clientY: MUSIC_LANE_Y })`; **after the release:** m1 **=== 8**, s2 **=== 8**, s3 **=== 10.2**; `undoLabel` `გადატანა (2)`; status **`გადატანა (2): 2 კლიპი გადავიდა 00:06.000-ით მარჯვნივ.`** |
| CG8 a placement-lane clip start captures the anchor end in a cross-lane group move | m1 music 2/2, st2 stems 0/1, **st9 stems 10.4/1**; `pressG()`; select m1 + st2 (`STEMS_LANE_Y`); dx **254** with **y = STEMS_LANE_Y** (raw 8.35, end 10.35; st9's start 10.4 is an end target on the placement lane → 8.4 at 0.05; grid 8 at 0.35) | m1 on **stems** at `toBeCloseTo(8.4, 9)`; st2 on **sfx** at `toBeCloseTo(6.4, 9)`; st9 unchanged (stems, 10.4); `undoLabel` `გადატანა (2)`; status `გადატანა (2): start 00:08.400.` |
| CG9 Alt with Snap off enables grid and edges for a group | the CM10 fixture (m1 music 2/2, s2 sfx 2/2, st1 stems 10.4/1.6); **no** `pressG()`; assert `snapState(view)` `off`; select m1 + s2; dx 254 with `altKey: true` | m1 and s2 `toBeCloseTo(8.4, 9)`; `snapState(view)` still `off`; `undoLabel` `გადატანა (2)` |

**Expected count:** vitest **89 files / 1574**; `grid-edges` **11** `it`; `grid-snap-clip-edges` **44** `it`.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Use a scratch copy with a `node_modules` junction and your own vitest config, as in round 62.
- **Run on:** `grid-edges`, `grid-snap-clip-edges`, `grid-snap-edit`, `grid-snap-ui`, `grid.test`, `selection.test`.
- Each mutation must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | the out-of-bounds branch returns `{ requested: <edge µs delta>, allowed: gridResult.allowed }` (round 62) | CE9, CE10, CG7 |
| b | the edge-path tolerance removed (strict `minDelta ≤ requested ≤ maxDelta`) | CE11 |
| c | the out-of-bounds branch returns `{ requested: gridResult.requested, allowed: <edge µs delta> }` (bounds ignored) | CE9, CE10 |
| d | the out-of-bounds branch returns `{ requested: gridResult.allowed, allowed: gridResult.allowed }` (never blocked) | CE9 |
| e | (`ArrangementClip.tsx`, scratch only) the targets exclude the placement lane's clips | CG8 |
| f | `resolveSnapStep` returns `null` when Snap is off and Alt is held | CG9 |
| g | (`ArrangementClip.tsx`, scratch only) `gesture.blocked` is always `false` in the group branch | GS5b (record every failing test) |

**Re-runs on the new tree:**
- round-62 a (the group helper gets `[]`, `[]`) → CM10, CG1, CG3, CG8, CG9;
- round-62 f (an edge clamped to `[minDelta, maxDelta]`) → CE9, CG4;
- round-62 h (the grid path in µs) → CE7.

**Rules:**
- Write `a-round-63/mutations.txt` with the command, each result line and the failing test names.
- If a mutation survives, **strengthen that test** within §2.2. Do not add tests outside the list.
- **Spec-assumption stop:** if any §2.2 assertion fails on the **fixed** tree, stop and report to B; do not rewrite the assertion. The same applies if the red run (§1.3) differs or if any existing `it` other than CE9 fails.

### 2.4 After the change

- **Self-check:**
  - `npx tsc --noEmit` → 0;
  - full `npx vitest run` → **89 / 1574, 0 failures**;
  - `npm run build` → rc 0.
- **Biome:**
  - read-only `npx biome check ./app` → ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info;
  - the 3 owned files → 0 diagnostics.
- **Review:** run the real `code-reviewer` subagent on the diff and put its findings and dispositions in the report.
  - Architecture notes go to B (`a-round-63.md` §6), not into code.
  - Reviewer items outside §0 go to B; they are not fixed this round.
- **`/check`:** `npm run verify` → exit 0, run quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke (`:5173` up):** one gstack load of `/studio-lab` at 1440×900. Confirm the workspace and badge render and the network has no forbidden request. This is not a PASS claim.

### 2.5 Doc 056

New file `docs/implementation/2026/quarter-IV/056-studio-lab-grid-group-oob-edge-status.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 63 — D-29z28; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** C-R62-01 (C's repro), INFO-R62-EDGE-TOL, R5, the Alt-enable gap;
- **Approach:** the new G3 (§0.1) and the fixture table;
- **Alternatives:** (a), (c), and the recompute in `ArrangementClip.tsx` (all rejected);
- **Recorded consequence:** cross-lane with an out-of-bounds edge;
- **Changed files; problems and solutions; testing** (the red run, CE9–CE11, CG7–CG9, mutations a–g and the re-runs, gates);
- **Ableton** (the §0.4 table);
- **TODO:** round 64 (4c-2 library-drop edges, plus the INFO-R62-LIB-LOADING-DROP probe); the ARCH checkpoint; GROUP-SUBMS-GRID-EDGE (still open).

Doc 055 is **frozen**. Do not edit its status line; root or a later round updates it.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.1 (the out-of-bounds branch of `snapGroupMoveDelta`) |
| `app/lib/arrangement/__tests__/grid-edges.test.ts` | A | the CE9 narrow grant; CE10 and CE11 appended |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | A | one optional import; CG7–CG9 appended (§2.2) |
| `docs/implementation/2026/quarter-IV/056-studio-lab-grid-group-oob-edge-status.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-63.md`, `a-round-63/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-63.md`, `c-round-63.json`, `c-round-63/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end.** The owned files keep their start status codes; the new doc adds one `??` line.

| Case | Lines | Content |
|---|---|---|
| A | **32** | the 31 start lines + `?? doc 056` |
| B | **14** | 13 + 1 |
| C | **10** | 9 + 1 |
| D | **6** | 5 + 1 |
| E | **4** | ` M` for the 3 owned files + `?? doc 056` |

The rule in every case: **no path outside §3.1 may appear or change.** The frozen list must stay 420/420 OK.

### 3.2 Frozen this round

- Everything in `b-round-62-r63-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**` and `root-publish/**`.
- **Also not allowed:**
  - new dependencies or installs;
  - deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start;
  - starting or stopping the dev server or the backend;
  - `npm run format`;
  - deleting `playwright-report/`, `store/nul`, `a-round-6x/scratch/` or `c-round-62/scratch/` (root's call; the scratch folders hold `node_modules` junctions).

## 4. Acceptance (C)

**Checkpoint order:** G63-2 → R63-S → R63-U → G63-1 → G63-3 → §4.6 → §4.7.
- Write `c-round-63/checkpoint.md` as you go.
- Check both servers at the start, after the offline items and before the report, and record each check. Do not start them.

### 4.1 R63-S — static (read-only)

- **`diff -u` against the snapshots:**
  - **`grid.ts`:** only the body of `snapGroupMoveDelta` changes. Every other function is byte-identical, and the signature and return type are unchanged. Read it against §0.1: the out-of-bounds branch returns exactly the grid-win object.
  - **Tests:** the existing `it` are AST-identical, except CE9, where only the `requested` assertion changes (6.4 → `toBe(6)`). Use your `asteq-it.cjs` with a negative control. CE10, CE11 and CG7–CG9 are present with the §2.2 fixtures. In `grid-snap-clip-edges`, at most one import line is added outside the new `it`.
- **`ArrangementClip.tsx`:** in the frozen list (`97a1bf79`).
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **EOL:** all owned files LF.
- **Tree:** frozen list 420 OK; protected 4/4. Doc 056 exists with the §2.5 sections; doc 055 is unchanged.

### 4.2 R63-U — unit and mutation (C's own scratch, own strings)

- **Red run:** apply the new tests to a scratch copy of the **round-62** `grid.ts` (the snapshot). CE9, CE10 and CG7 fail; CE11, CG8 and CG9 pass.
- **Mutations a–g and the §2.3 re-runs:** re-run them in your own scratch with your own edits. Each must kill its named tests.
- **C extras (info), suggested:**
  - (n) the out-of-bounds branch returns `gridResult` but with `requested` in whole µs (`toWholeMicroseconds(gridStart − anchorStart) / 1e6`). Record whether a test kills it; whole-ms anchors cannot tell the two apart;
  - (p) the in-bounds edge branch also returns `gridResult` (edges are never used) → CM10, CG1, CG8 must kill it.
- **Durations:** run `grid-snap-clip-edges` alone and record it. A single test over 3 s is info.

### 4.3 G63-1 — gates

- tsc 0; build passes.
- **Biome:** read-only `./app` within the baseline; owned files 0 diagnostics.
- **vitest = 89 files / 1574, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, quietly, with at most two quiet attempts, each recorded. If neither gives rc 0, G63-1 is FAIL.
- Record any `Test timed out` with file, test and ms.

### 4.4 G63-2 — tree

- Protected 4/4 OK; frozen 420 OK.
- `git status --short` matches §3.1 for the observed case; record HEAD at start and end.

### 4.5 Not run, or not testable

- **If `:5173` is down:** write "not run (environment)" for §4.6 and §4.7.
- **Sub-ms:** no `/studio-lab` asset has a sub-ms duration (round 62). The (n) distinction is unit-only.

### 4.6 Browser acceptance (`:5173` up) — REAL-mouse (PW), 1440×900, then the starred rows at 1280×720

**Setup:**
- Use the round-62 method: the L52 fixture, `tools/pw62.cjs` as a template, Snap via REAL `g`, division via REAL `select`.
- **Group selection:** REAL click on the anchor's header, then **Ctrl**+REAL click on the other header, only if the pair is not already selected. Check that both are selected.
- Record every clip's `start`, `duration` and `trackId` before each drag.
- Write the oracle's candidate list in the run log (round 62 §4.6), **including whether the winning edge is out of bounds and the grid line's own delta against the bounds**.
- **Before each Ctrl+Z, record the undo title** (INFO-R62-GEPLAY-UNDO). After it, record the starts.

| ID | Steps | Pass |
|---|---|---|
| GE-OOB-STATUS* | C-R62-01's exact steps (`c-round-62.json` `bugs[0].steps`): neighbour `Middle East` at **19.3** (Slow rise maxDelta 2.0), division 1, drag `Soft impact` +81 px (raw 6.025) | SI **6**, Slow rise **14.3**, no overlap; **during the drag the status is not** `ჯგუფის გადატანა შეჩერდა …`; after the release the status is **`გადატანა (2): 2 კლიპი გადავიდა 00:02.000-ით მარჯვნივ.`** (verbatim); Undo `გადატანა (2)`; Ctrl+Z restores both |
| GE-OOB-PLAY (real audio) | After GE-OOB-STATUS (before its Ctrl+Z): video Mute, REAL ruler click at 5 (division 1), REAL Space; sample SI's track meter (the round-62 GE-PLAY method) | SI's meter is −∞ until the readout is ≥ 5.95 and rises by ≤ 6.15 |
| GE-BOUNDS-REG | round-62 GE-BOUNDS (neighbour at **18.8**, maxDelta 1.5, raw 6.025) | as in round 62: SI 5, Slow rise 13.3; **the blocked status appears during the drag** and no success line is written after the release; nothing overlaps |
| GE-START-REG* | round-62 GE-START | SI 7, Slow rise +3, the verbatim round-62 status |
| GE-CROSS-REG | round-62 GE-CROSS | as in round 62: Slow rise on SFX at 6, music on stems at 0.7, status `გადატანა (2): start 00:06.000.` |
| GE-ALT-ENABLE* | Snap **off**. Group `Soft impact` + `Slow rise`. Hold **Alt** through the drag, with SI's raw start within 0.2 s of a non-member edge that is nearer than the grid line (C picks it from the oracle; e.g. GE-START's +104 px) | SI lands on the oracle's edge; Slow rise moves by the same delta; Snap stays off. If the browser's Alt opens a menu or loses the press, record it and mark the row "not testable (harness)", not PASS |
| GE-CROSS-OOB (info) | A cross-lane group move where the nearest edge on the target lane needs a delta outside the **source-lane** bounds while the grid line is in bounds (C builds it from the library) | Record the result. Expected per D-29z28: the grid-line result (the edge is not tried). An overlap, a lost clip or a wrong lane is a bug with its own ID |

### 4.7 Carried items

- **Round 62 regressions:** GE-BOUNDS-REG, GE-START-REG and GE-CROSS-REG above. The rest of round 62's rows are not required: the change cannot reach them (§0.6).
- **INFO-R61-XLEAK** (the static gate when `ArrangementGridMenu.tsx` changes): not applicable; the file is frozen.

### 4.8 G63-3 — anonymous workspace and purchase protection

Use a fresh browse state, as in G62-3.
- **Workspace:** `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- **Network:** no requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code. This includes every §4.6 run.
- **Sign-in gate:** `/studio/middle-east` shows "Sign in required".
- **Token rows (backend `:5199` must be up):**
  - an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns **401**;
  - a fake Bearer returns **403** (re-check; the last 403 was on 2026-10-18).
  - **If the backend is down, both are "not run (environment)", not PASS.** Record the codes either way.
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

### 4.9 Not run this round, and carried items (honest)

**Not run this round in any case:**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- the round 57–61 menu browser re-run.

**Open C items:**
- **This round:** C-R62-01, INFO-R62-EDGE-TOL, A-R62-REVIEW-R5-POSITIVE-LANE, C-R62-ALT-ENABLE-GROUP-GAP.
- **Round 64 (4c-2):** library-drop edges:
  - LD-BLOCK as the C-R51-01 regression;
  - **a required probe of dropping a library source that has not finished loading** (INFO-R62-LIB-LOADING-DROP; a severity call-out if it reproduces).
- **C-R41-01** (TL-Q-VIEWPORT).
- **Tech Lead:** C-R27-01, C-R6-02, C-R8-01 (quiet Chrome); C-R23-01 + C-R38-01.

**Open Low / info (batched after 4c unless Medium+):**
- **General:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE.
- **Rounds 49–55:**
  - R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE;
  - A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG;
  - A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE;
  - A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP;
  - A-R54-REVIEW-LOWS.
- **Round 62:** GROUP-SUBMS-GRID-EDGE, INFO-R62-CROSS-FLOAT, INFO-R62-GEPLAY-UNDO, ENV-EXT-LOAD-HANG.
- **Grid-menu batch:**
  - A-R57-REVIEW-TAB-BODY-FOCUS, A-R57-REVIEW-CONTEXTMENU-KEY, A-R57-REVIEW-PAGE-TRANSITION;
  - A-R58-REVIEW-ANDROID-TAP-CLICK;
  - C-R59-02;
  - A-R59-REVIEW-END-INDEX, A-R59-REVIEW-REANNOUNCE, A-R59-REVIEW-PUNCTUATION;
  - A-R60-REVIEW-GK11-EXPORT-STATUS;
  - INFO-R60-FOCUS-RETURN, INFO-R60-SHIFT1-SYNTH;
  - INFO-R61-XSPAN, A-R61-REVIEW-CLOSEST-SCOPE.
- **Architecture:** ROOT-R50-58-L5 + A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP; A-R62-ARCH-PRECISION-BOUNDARY → ARCH-CHECKPOINT-SRW14-PREFS (b).

**`root-pre-push-review.md`** (mtime 2026-10-18 12:46:34, unchanged):
- **Video sync:**
  - RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
  - **Partially measured:** R5-L3.
  - **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
- **Medium:**
  - M1: the loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value re-renders every consumer.
- **Lows:** L1–L4 and L6–L8.
- **`root-review-r50-58.md`:** L1–L4 closed by C (rounds 60–61); L5 is the architecture item.

**`publication-checkpoint.json`** (mtime 2026-10-17 11:11:24, unchanged):
- SRW-21: the purchased loader hardcodes `middle-east`; do not claim that every product's stems work.
- Portable instruction paths.
- The SRW-23 scrollbar check at 1280×720 and 1440×900.
- SRW-11/12 library and stems parity.
- T12 continuation.

**Root items:**
- The publisher: `cb12805` and rounds 59, 60, 61 and 62 are separate units. `root-claude-checkpoint.md` says the publisher has never run.
- ARCH-CHECKPOINT-SRW14-PREFS (§6.3) and ARCH-CHECKPOINT-SRW13.
- GSTACK-ACL, GSTACK-NO-MOUSE, ENV-BROWSE-DAEMON, ENV-EXT-LOAD-HANG.
- The CRLF Biome errors on the auth files.
- The stray `store/nul`; the git autocrlf warning on LF files.
- INFO-R61-FAKEBEARER-500; ENV-BACKEND-DOWN-R61.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T, R57-T, R58-T, R59-T, R60-T, R61-T, R62-T), plus **R63-T:**
- Select two clips and turn Snap on. Drag the group so that reaching another track's clip edge would push the second clip into its neighbour, while a grid line before that point is free. The group lands on the grid line, and the status says the clips moved (`… 2 კლიპი გადავიდა …`), not that the move stopped.
- Turn Snap off and hold Alt during a group drag. The group clicks onto another track's clip edge.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-62-r63-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-62-r63-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/grid.ts app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-62-r63-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/selection.test.ts --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/lib/arrangement/grid.ts app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A)

1. **Start the backend (`:5199`) before A starts, and keep both servers up through C round 63.**
   - It has been down since the 2026-10-19 machine restart: all of C round 62 (11:41–12:07) and B at 12:35.
   - G63-3's token rows need it. The fake-Bearer 403 has not been re-checked since 2026-10-18.
2. **Commit units** (all interim checkpoints, not a release; only via root's publisher flow; never by hand):
   - **Rounds 50–58:** the pending `cb12805` bundle. C-ready; C round 62 re-ran the 4a regressions green.
   - **Rounds 59, 60 and 61:** ready, each as its own unit.
   - **Round 62:** **ready** (C PASS: 4 owned files + doc 055). C-R62-01 is Low and gets fixed in round 63; it does not block this commit.
   - **Round 63:** only after C.
   - `root-claude-checkpoint.md` (2026-10-18) says `root-publisher.cmd` has never run. Starting it is the user's action.
3. **ARCH-CHECKPOINT-SRW14-PREFS — re-requested** (no answer recorded for (a), (b) or (c)). Please run the bounded read-only frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`). Questions:
   - (a) the snap-preference plumbing versus a non-history edit-preferences slice;
   - (b) one time-precision rule (`roundTime` ms, `roundGridTime` ms, `toWholeMicroseconds`, `planClipLaneMove` µs, and now `snapGroupMoveDelta`; A-R62-ARCH-PRECISION-BOUNDARY, where the reviewer said keep for now);
   - (c) the shared grid test harness;
   - (d) `useArrangementGridMenu` + `isFollowAutoScroll`: still keep-for-now?

   **Answer format:** keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task with one owner and behaviour-preserving tests. **Rounds 63–64 do not wait for the answer.**
4. **INFO-R61-FAKEBEARER-500:** with the backend unreachable, a fake Bearer gets 500 instead of 403/503. It is still fail-closed. `api.studio-token.ts` is protected, so this is root's decision.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-63.md`:**
1. the pre-flight gate, the §1.2 baseline (case A–E) and the red run;
2. the diff summary per file with EOL counts;
3. CE9–CE11 and CG7–CG9, each with its alone duration;
4. mutations a–g and the re-runs;
5. smoke;
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-63.md` and `c-round-63.json`** (usual schema).
- Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment / not testable).
- Cover R63-S, R63-U, G63-1, G63-2, G63-3, §4.6 and the Ableton rows, with two verdicts each.
- `passed` lists only IDs run this round.
- State **commit readiness** for root, separately for round 63, round 62, rounds 59–61 and rounds 50–58.

**Next (orientation only):**
- **Round 64: SRW-14 stage 4c-2.** The library drop's ghost and drop start snap to clip edges:
  - the same G1/G2 rules; the dragged item's duration from `getLibraryDragSource()`; no exclusion; the lane rule on the drop lane;
  - `dragged === null` → grid only; the video lane stays refused;
  - LD-BLOCK as the C-R51-01 regression;
  - the INFO-R62-LIB-LOADING-DROP probe.
- **Then:** SRW-14 stage 4 closes; SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the batched Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 63 -StartPhase A` and a higher limit.
