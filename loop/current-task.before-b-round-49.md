# CURRENT TASK — Round 48: B-EXPECT-R47-RB — gate repair for SRW-14 stage 1 (render-budget option query scoped to the library listbox) + doc 044 decision lines

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-16
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap).
- Decision record: **D-29z13** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-47.md`.
- Round size: **one bug** (B-EXPECT-R47-RB, Medium, test/task conflict) plus the doc lines that record it and B's decision on C-R47-01. **No app source change.** This is the smallest round that makes round 47 (SRW-14 stage 1, every behaviour ID C PASS) publishable: `npm run verify` is red today only on this test.

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B's gates (2026-10-16 ~17:10 +04). If it is down, root restarts it. No agent starts or stops it. This round needs no browser except the optional G48-3 confirmation (§4.3).
>
> **Browse rules** (only for the optional G48-3 re-check; `backlog.harness_rules`): never `$B restart`; a **new** `BROWSE_STATE_FILE` under `c-round-48/`; after one CLI-daemon failure the approved `server-node.mjs` fallback started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`; stop only your own process.
>
> **Machine load:** `node.exe` was **37** at B's gates. Every A and C run records `tasklist | grep -ci node.exe`. On a timeout under load, re-run that file alone and report both runs (round 47: `track-layout` "folds a lane…" timed out 2 of 7 runs under load, passed alone).

## Why this round

**Round 47 result** (`c-round-47.md`, `c-round-47.json`): **taskStatus FAIL on one contracted gate only.** Every behaviour ID C could run passed with REAL input: G47-2, G47-3, R47-S, R47-U (23 new `it`, mutations a–k all killed), UI-1…UI-6, reload reset, SN-OFF/SN-1/SN-025/SN-GROUP/SN-LANE/SN-SHIFT/SN-MID/SN-BLOCK/SN-VIDEO (1440×900, main drags repeated at 1280×720), NU-1…NU-3, LN-1…LN-4, AU-1 (export decode: SFX onset exactly 6.000 s, [3.5, 5.99) s silent, RIFF/WAVE 23.000 s), AU-2, REG-HYD/TRIM/RANGE/KEYS, R47-Doc.

**The one failure — B-EXPECT-R47-RB (Medium, B's task conflict, not an app defect):** G47-1 full vitest = **1 failed / 1386 passed (1387)**. `app/lib/arrangement/__tests__/render-budget.test.tsx:309` asserts `expect(view.getAllByRole('option')).toHaveLength(2)`. That line counts the **library listbox rows** (2 demo rows in the mounted fixture). Round 47 §0.2 required a native `<select>` with 7 `<option>` elements, so the whole view now has 9. B froze the test and required the select in the same task; both could not hold. A did not touch either (correct). **C and A each proved in scratch** that scoping only this query to the listbox makes the file **7/7** (`c-round-47/runs/rb-scratch-scoped.txt`, `a-round-47/rb-scratch-scoped-query.txt`), and that the unmodified file fails only at :309 (`a-round-47/rb-scratch-unmodified.txt`). The render budget itself is unaffected.

**B decision on C-R47-01 = A-R47-GROUP-LANE-DELTA (Low): accepted, no code.** B traced C's −7.3 s case (`c-round-47/runs/grouplane2-*.txt`):
- Snap **off**: requested −7.3 → the lane plan is refused (`out-of-range`, the stem would start below 0) → time-only move by the clamped −0.4 (C saw music 6.6, stem 0.0).
- Snap **on** (A's code): requested −7 → refused the same way → `snapGroupDelta` with the source-lane bounds gives 0 → no change.
- Round 47 §0.4 text (lane plan with the bounded delta) would make Snap-on **change lanes** where Snap-off **refuses** — a new inconsistency. A and the code-reviewer are right that `groupMoveBounds` describes the **source** lanes' neighbours, not the target lane. The contract text was wrong; A's structure stays. §0.4 is corrected in D-29z13 and doc 044 (this round).
- **What is genuinely wrong** (pre-existing, both Snap states, Low): the refusal says `ჯგუფის ნაწილისთვის ხაზი არ არსებობს — მხოლოდ დრო იცვლება.` although the cause is "a member would start before 0" (and with Snap on nothing changes), and the refused ghosts are drawn at the valid places. Recorded as **GROUP-LANE-REFUSAL-TEXT** → carried into SRW-14 stage 2 (round 49), where `ArrangementClip.tsx` opens again.

**Harness finding (C):** the gstack browse CLI, its CDP allowlist and the `server-node.mjs` fallback have **no mouse down/move/up**; C produced REAL-mouse drags with a standalone Playwright 1.57 script (installed chromium, no install). The round-47 task wrongly named the fallback as a mouse source. B updated `harness_rules` honestly: this is a **deviation from the gstack-only browsing rule pending root/user acceptance** (with the CDP-allowlist root item), not a blessed path. Round 48 needs no drags.

## Baseline

B verified on 2026-10-16 ~17:10 +04 (`b-round-47/gates.txt`, `tsc.txt`, `vitest-focus.txt` from the first B47 session at 16:46; re-checked by this session):
- HEAD **`d2f6715`** (local; `origin` fetch URL TCzaba → `d2f6715`). **Working tree = exactly the 8 round-47 paths**, each sha-identical to C's verified tree (`../tmp/studio-real-loop/b-round-47/round47-verified-tree-sha256.txt` → 8 OK):
  ```
   M app/components/arrangement/ArrangementClip.tsx
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md
  ?? app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
  ?? app/lib/arrangement/__tests__/grid.test.ts
  ?? app/lib/arrangement/grid.ts
  ?? docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md
  ```
  If HEAD is a newer root commit (root may publish round 47+48 together), report it and continue only if `git diff HEAD --stat -- app docs` shows nothing outside §3.2.
- **Frozen list:** `../tmp/studio-real-loop/b-round-47-r48-tree-sha256.txt` → **402 OK** (run from `store/`) = round-46 list (395) − `render-budget.test.tsx` + the 8 C-verified round-47 paths. Note: `b-round-47-tree-sha256.txt` (401 lines) is a draft from the interrupted first B47 session; **do not use it**.
- **Dispatch snapshots:** `../tmp/studio-real-loop/b-round-47-r48-snapshots/` — `render-budget.test.tsx` sha `4670cdf6…` and `044-studio-lab-grid-snap-stage-1.md` sha `c9f8cfad…` (= C47's verified doc 044; `SHA256SUMS.txt` inside). `render-budget.test.tsx` is **not** in the 402 list; doc 044 is.
- Other checks: protected 4/4 OK; tsc **0**; full vitest (C47) **82 files / 1387, 1 failure at :309**; `/studio-lab` 200.
- Biome `./app`: **2 errors** (root CRLF `format` on `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/auth-bugs.test.ts` — **do not touch**), 218 warnings, 1 info.
- **Before you edit:** confirm HEAD, the 9-path expectation (8 now), 402 OK, the snapshot sha. If anything differs, **stop and report**.

**Rules:** do not revert, re-create or reformat anything. `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root. Only root commits or pushes.

## 0. Scope

### 0.1 B-EXPECT-R47-RB — `app/lib/arrangement/__tests__/render-budget.test.tsx` (narrow grant to A: exactly two lines)

`within` is **not** imported today (l.1 imports `act, fireEvent, render`). The grant is therefore **l.1 and l.309, nothing else**:

| Line | Today | Target (exact) |
|---|---|---|
| 1 | `import { act, fireEvent, render } from '@testing-library/react';` | `import { act, fireEvent, render, within } from '@testing-library/react';` |
| 309 | `    expect(view.getAllByRole('option')).toHaveLength(2);` | `    expect(within(view.getByRole('listbox')).getAllByRole('option')).toHaveLength(2);` |

- Rationale: the assertion guards that the **library rows** are mounted (the `WATCHED_LISTS` include library rows) before the render count is measured; the grid select's options are not library rows. Scoping keeps the original intent and the original count (2). `getByRole('listbox')` also asserts that exactly one listbox exists.
- No other line of the file changes (no reformatting; `npx biome check --write` only if it changes nothing beyond these two lines — check the diff). `it` count unchanged (7).
- **Not allowed:** changing the expected number, `it.skip`/`it.fails`, deleting the assertion, touching the `<select>` in `StudioWorkspace.tsx`, or any app file.

### 0.2 Doc 044 — `docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md` (four text spots, no other line)

Find each spot by its current text; replace exactly. Self-check: `diff -u ../tmp/studio-real-loop/b-round-47-r48-snapshots/044-studio-lab-grid-snap-stage-1.md` against the edited file shows only D1–D4. Keep l.4 (status) unchanged — it gets the publish hash after root's commit.

- **D1** — in the bullet that starts `- **სხვა ხაზზე გადატანა:**` (l.36), replace the last sentence `ეს §0.4-ის ტექსტისგან განსხვავებაა და B-ს გადაეცა (A-R47-GROUP-LANE-DELTA).` with:

      B-მ ეს სტრუქტურა მიიღო (D-29z13, A-R47-GROUP-LANE-DELTA): Snap-ის გარეშეც იგივე ჯგუფური გადატანა ხაზს არ იცვლის, ამიტომ შემოსაზღვრული delta-ს გადაცემა Snap-ის ჩართვისას ხაზის შეცვლას დაუშვებდა იქ, სადაც თავისუფალი რეჟიმი უარს ამბობს. უარის ტექსტი და უარყოფილი ghost-ების ადგილი ცალკე Low საკითხია (GROUP-LANE-REFUSAL-TEXT, ეტაპი 2).

- **D2** — in the `render-budget` problem bullet (l.69), replace the sentence `B-ს გადაეცა **B-EXPECT-R47-RB**: query-ის შეზღუდვა listbox-ზე.` with:

      Round 48-ში (D-29z13, **B-EXPECT-R47-RB**) ტესტში მხოლოდ ორი ხაზი შეიცვალა: `within`-ის import და query `within(view.getByRole('listbox')).getAllByRole('option')`; მოსალოდნელი რაოდენობა (2) და ტესტის მიზანი — ბიბლიოთეკის რიგების შემოწმება — უცვლელია.

- **D3** — replace the whole bullet `- სრული vitest: 1386/1387. ერთადერთი ჩავარდნა `render-budget.test.tsx:309`-ია (იხ. ზემოთ).` with:

      - სრული vitest: round 47-ში 1386/1387 (ერთადერთი ჩავარდნა `render-budget.test.tsx:309`); round 48-ის შემდეგ — 1387/1387 (`tmp/studio-real-loop/a-round-48.md`).

- **D4** — replace the TODO bullet that starts `- **B-EXPECT-R47-RB:**` with:

      - **ეტაპი 2-ს თან ერთვის:** GROUP-LANE-REFUSAL-TEXT (ჯგუფის უარის ტექსტი და ghost-ების ადგილი) და lane-ის „ყველა ხაზის“ range overlay-ის `bg-foreground/60` → `/30` (`ArrangementLane.tsx`, LANE-RANGE-OVERLAY-60).

- Also replace in the first TODO bullet the text `**ეტაპი 2 (round 48):**` with `**ეტაპი 2 (round 49):**` (one token; counts as part of D4).

No implementation doc 045 is needed: a two-line test correction is below the `implementation-docs.md` threshold, and doc 044 records it.

### 0.3 Unchanged / out of this round

**Unchanged:** every app file, including the 8 round-47 paths except doc 044 (`ArrangementClip.tsx`, `ArrangementLane.tsx`, `StudioWorkspace.tsx`, `grid.ts`, both grid tests, doc 043 must stay at C47's shas), `ArrangementTransport.tsx`, `ArrangementContext.tsx`, every other test file.

**Next (scheduled, not deferred):** round 49 = SRW-14 stage 2 (trim edges and clip-body time-range snapping, Alt momentary bypass — Live 6.10 "hold Alt … to bypass grid snapping. If the grid is switched off, using the modifier will temporarily enable it", confirmed text) + carried GROUP-LANE-REFUSAL-TEXT and LANE-RANGE-OVERLAY-60. Then stage 3 (playhead/insert marker, lane-background click, paste, library drop, loop brace), stage 4 (clip edges, right-click division menu, narrow/widen), SRW-15 (+ stage 5), SRW-16..20, SRW-21, full regression and root review, T12.

**Out of scope for the whole project:** plugins and effects (compressor, limiter, normalise); pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):** only the render-budget suite's meaning (the scoped query must still fail when the library rows are missing or more than 2, and must not count the select). No runtime behaviour changes.

## 1. Mandatory before acting (A)

1. Read: `.claude/rules/read-primitives.md`; `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/new-test.md`; `docs/implementation/TEMPLATE.md`. Run the `pre-flight` skill (scope: 2 test lines + 5 doc spots).
2. Baseline before any edit: the §5 commands up to the snapshot check; record `node.exe`.
3. Read `render-budget.test.tsx` l.1–60 and l.280–330 (mount helper, `WATCHED_LISTS`, the test at l.303); confirm in the mounted fixture that exactly one element has `role="listbox"` (grep the library component, read-only) and report where it comes from.

## 2. A: the change

### 2.1 Red / green / mutations

- **Red:** `npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx` on the untouched file → 1 failure at :309 (`expected … length of 2 but got 9`) → `a-round-48/red-run.txt`.
- Apply §0.1 → **green** 7/7 → `a-round-48/green-run.txt`.
- **Mutations** (scratch copy outside `store/`; `node_modules` junction removed with `cmd /c rmdir` only; `MSYS_NO_PATHCONV=1`) → `a-round-48/mutations.txt`. Each must make the named test fail, except (c), which must stay green:

| # | Mutation (scratch only) | Expected |
|---|---|---|
| (a) | the scoped query expects `9` instead of `2` | the l.303 test fails (the query does not count select options) |
| (b) | the scoped query expects `3` | fails (it is still an exact count of library rows) |
| (c) | in the scratch copy's `StudioWorkspace.tsx`, add an 8th `<option>` to the grid select (any value) | the l.303 test **stays green** (select options are outside the scope) |
| (d) | in the scratch copy's fixture/collection used by the mount helper, remove one library item (or make the listbox render one row) | fails (the count still guards the library rows) — if the fixture makes this impractical, explain and substitute an equivalent mutation |

### 2.2 After the change

- Frozen/focused suites: `render-budget`, `context-hygiene`, `grid`, `grid-snap-ui`, `gesture-reentry`, `gesture-guard`, `track-layout`.
- Full `npx vitest run` → **82 files / 1387, 0 failures**.
- `npx tsc --noEmit` 0; `npm run build`; Biome on the test file (no changes beyond §0.1) and read-only `npx biome check ./app` → exactly the 2 baseline errors, ≤ 218 warnings, 1 info.
- **`/check` = `npm run verify` → exit 0** (the real gate this round). Record `node.exe`. If it fails only on a load timeout, re-run the failing file alone and then `npm run verify` once more; report every run. Do not run `npm run test:e2e:smoke` (root only).
- **code-reviewer:** not required (2 files, docs + 2 test lines); A may run it. If run, report findings; Architecture notes go to B.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/__tests__/render-budget.test.tsx` | A | l.1 and l.309 only (§0.1) |
| `docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md` | A | D1–D4 only (§0.2) |
| `../tmp/studio-real-loop/a-round-48.md`, `a-round-48/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-48.md`, `c-round-48.json`, `c-round-48/` | C | report, runs, gates |

**Expected `git status --short` at the end** (9 paths):
```
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/lib/arrangement/__tests__/render-budget.test.tsx
 M docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md
?? app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
?? app/lib/arrangement/__tests__/grid.test.ts
?? app/lib/arrangement/grid.ts
?? docs/implementation/2026/quarter-IV/044-studio-lab-grid-snap-stage-1.md
```
If root commits round 47 meanwhile, the list shrinks accordingly; record it as root's, do not touch it.

### 3.2 Frozen this round

- All **402** files in `b-round-47-r48-tree-sha256.txt` **except doc 044** (it is in the list at its C47 sha and changes by D1–D4 only; A and C diff it against the snapshot). Everything else under `store/`.
- **Forbidden to modify:** `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx` (C checks by sha256 against `protected-baseline.json`); `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`, `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/**` (all, this round), `app/styles/**`, `lib/sfx-*`, `app/routes/**`, firebase/R2/auth/purchase code, `public/**`, `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`, playwright/vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`, other roles' files under `../tmp/studio-real-loop/`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

### 4.1 R48-S — static

- `diff -u` `render-budget.test.tsx` against `b-round-47-r48-snapshots/render-budget.test.tsx` → exactly 2 changed lines, matching §0.1 byte for byte.
- `diff -u` doc 044 against `b-round-47-r48-snapshots/044-studio-lab-grid-snap-stage-1.md` → only D1–D4 (+ the `round 48`→`round 49` token); l.4 unchanged; Georgian.
- `sha256sum -c b-round-47-r48-tree-sha256.txt` → **401 OK + exactly 1 FAILED (doc 044)** (render-budget is not in the list; its change is checked against the snapshot above); protected 4/4.

### 4.2 R48-U — the test still means something

- Re-run A's mutations (a)–(d) in C's own scratch copy; (a), (b), (d) fail, (c) stays green.
- **C extra (e):** in the scratch copy, render a second `role="listbox"` element in the mounted tree (e.g. duplicate the library list's role on another element of the scratch `ArrangementLibrary`) → the test must fail (`getByRole` finds multiple), proving the scope is unambiguous. If impractical, explain.

### 4.3 Gates

**G48-1:** tsc 0; full vitest **82 files / 1387, 0 failures** (record `node.exe`; re-run a timed-out file alone and report both runs); build passes; Biome `./app` read-only: exactly the 2 baseline CRLF errors, warnings ≤ 218, 1 info; **`npm run verify` exit 0**.

**G48-2:** protected 4/4 OK; 401 OK + doc 044 FAILED only (§4.1); `git status --short` = §3.1; HEAD at the start and at the end; the 7 unchanged round-47 paths still at C47's shas (`b-round-47/round47-verified-tree-sha256.txt`: all OK except doc 044).

**G48-3 (anonymous workspace and purchase protection):** no app file changes this round, so C may **cite G47-3** (`c-round-47/runs/g47-3.txt`) **together with the sha proof** of G48-2 (every `app/**` file except the one test equals C47's verified tree). If the dev server is up, C additionally runs the short check: fresh browse state → `/studio-lab` direct shows the workspace with the demo badge; anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; `/studio/middle-east` → "Sign in required". State which of the two was done.

**Not re-run this round (not PASS):** every round-47 behaviour ID (unchanged code, sha-proven); video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root only).

### 4.4 Ableton

**Not applicable** (test-only correction, no behaviour change). The round-47 two-verdict table stands (`c-round-47.md` §11).

### 4.5 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:** C-R41-01 (Low, TL-Q-VIEWPORT); C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome); C-R23-01 + C-R38-01 (Tech Lead; round 47: SSR 66 072 bytes, 3 NUL at 11729/28025/28026, 1 hydrated U+FFFD `aria-label`). **New Low (round 49):** GROUP-LANE-REFUSAL-TEXT, LANE-RANGE-OVERLAY-60.
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, A-R45-SSR4, A-R46-RESTORE-SELECTION, **A-R47-GROUP-LANE-DELTA** (D-29z13).
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS; DETAIL-RESET-SHRINK (info); SHIFT-BEFORE-DOWN-NOTE (record: Shift held before mouse-down starts no gesture — pre-existing; Shift+click is "add to selection").
- **Root items:** `root-pre-push-review.md` (2026-10-07) has nothing open; `publication-checkpoint.json` `round46Checkpoint` = `d2f6715`, `release:false`. **New: REMOTE-DIVERGENCE-SHAVIDZE** — B's `git ls-remote` at ~17:10: TCzaba master `d2f6715`, **shavidze master `08b6a5e`** (object not in the local repo). Root reconciles before the next push (no force push). Also: ARCH-CHECKPOINT-SRW13; BIOME-HOOKS-DEPS; GSTACK-ACL; **GSTACK-NO-MOUSE** (REAL-mouse drags need standalone Playwright; acceptance pending); SRW-21; the CRLF Biome errors on the auth files; fake Bearer → 500; the CDP allowlist; ENV-BROWSE-DAEMON; machine load.
- **Tech Lead manual checks:** R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, **R47-T** (real mouse with Snap on/off, G on a Georgian layout, grid-line readability — C measured the lines as faint: median luminance 10 → line ≥ 13).

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-47-r48-tree-sha256.txt | grep -v ': OK$'
sha256sum app/lib/arrangement/__tests__/render-budget.test.tsx ../tmp/studio-real-loop/b-round-47-r48-snapshots/render-budget.test.tsx
sha256sum -c ../tmp/studio-real-loop/b-round-47/round47-verified-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/context-hygiene.test.tsx app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/gesture-reentry.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist (e.g. `context-hygiene` has a different extension), find it with `ls app/lib/arrangement/__tests__ | grep context-hygiene`, report it and run the rest.
- C re-runs the gates itself and does not trust A's numbers.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-48.md`:** (1) pre-flight and the listbox origin (§1.3); (2) red, green, mutations (a)–(d); (3) the exact diff of both files; (4) verbatim command tails incl. `node.exe` and `npm run verify`; (5) deviations. Do not claim PASS.

**C → `c-round-48.md` and `c-round-48.json`** (usual schema). For each ID: PASS, FAIL (with a bug ID) or **not run** (with the reason): R48-S, R48-U (a)–(e), G48-1, G48-2, G48-3 (say cited or re-run), the carried items. `passed` lists only IDs C ran in this round. State **commit readiness** for root: round 47 + 48 paths together.

## 7. Next (orientation only; not this round)

- **Round 49 — SRW-14 stage 2:** trim edges (left/right) and clip-body time-range snap to the grid; **Alt momentary bypass** read per pointermove like Shift (`event.altKey` on the pointer event; today `altKey` appears only in the keydown handler) — while Snap is on Alt frees, while Snap is off Alt snaps (Live 6.10, confirmed text); carried GROUP-LANE-REFUSAL-TEXT (cause-specific wording for the `out-of-range` time case; ghosts not drawn as "valid" places when refused) and LANE-RANGE-OVERLAY-60 (`ArrangementLane.tsx` all-tracks overlay `/60` → `/30`); doc 044 status line with the publish hash. Behavioural uncertainty to settle in B's stage-2 planning: whether Alt+drag conflicts with Windows Chrome (menu-bar focus on a lone Alt release) — B runs a small gstack experiment before dispatch.
- **Then:** stage 3, stage 4, SRW-15 (+ stage 5), SRW-16..20, SRW-21, full regression, T12.
- **Architecture checkpoint (root, non-gating):** ARCH-CHECKPOINT-SRW13 still requested. New round-47 signals (A): view-preference states/refs next to `followMode` (a view-preferences hook when stages 2–3 add consumers), keydown handler growth (P2), parallel requested/allowed shapes in the clip move branch. Recorded, not scheduled. At the SRW-14 feature boundary (after stage 4) B will request a bounded frontend-architect checkpoint on `StudioWorkspace.tsx`/`ArrangementClip.tsx` from root.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 48 -StartPhase A` and a higher limit.
