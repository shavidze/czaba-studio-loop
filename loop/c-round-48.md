# C — Round 48 verification: B-EXPECT-R47-RB (render-budget query scoped to the library listbox) + doc 044 D1–D4

Verifier: C (independent) · Date: 2026-10-16 17:39–17:50 +04 · Task: `current-task.md` (Round 48, D-29z13)
Evidence: `c-round-48/runs/`, screenshots `c-round-48/*.png`, scratch `c-round-48/scratch/` (+ `tools/mutate.mjs`, `check-doc.mjs`).
I re-ran every check myself and did not rely on A's numbers. I made no app/source edits, commits, installs or server starts/stops.

**taskStatus: PASS** for the round-48 scope. One new Low finding (C-R48-01, a pre-existing timing flake) is returned to B; it does not block this round.

## 0. Environment

- HEAD at the start **and** the end: `d2f6715df3be47e1a2e31112d7fcde04c54e8d2a` (`runs/start-state.txt`, `runs/end-state.txt`).
- node.exe was 33–35 throughout and peaked at 35 during tsc. No gate timed out.
- `/studio-lab` returned 200. The dev server was root's; I did not touch it.

## 1. R48-S — static: **PASS**

- `render-budget.test.tsx` vs the `b-round-47-r48-snapshots/` copy (`runs/diff-rb.txt`): exactly 2 changed lines, byte-identical to §0.1:
  - l.1 `import { act, fireEvent, render, within } from '@testing-library/react';`
  - l.309 `    expect(within(view.getByRole('listbox')).getAllByRole('option')).toHaveLength(2);`
  - The expected count is still 2, and the `it` count is 7 in both versions. The diff has no line-ending churn. New sha `8694f324…`.
- Snapshots are intact (`SHA256SUMS.txt` 2/2 OK), so the baseline for the diff is genuine.
- Doc 044 vs the snapshot (`runs/diff-044.txt`) has 4 hunks covering D1, D2, D3, and D4 plus the `round 48→49` token. `runs/doc-exact.txt` confirms programmatically that:
  - all 4 target texts from the task occur verbatim in the doc and none occurs in the snapshot;
  - the `(round 49)` token is present and `(round 48)` is gone;
  - l.4 (status) is unchanged; LF line endings; 112 lines before and after.
  - The text is Georgian, with technical terms in English.
- `sha256sum -c b-round-47-r48-tree-sha256.txt`: **401 OK + 1 FAILED (doc 044 only)**. render-budget is not in the list (0 matches). Protected files: 4/4 OK.

## 2. R48-U — the scoped assertion still means something: **PASS** (a)–(e)

C ran its own scratch copy (`c-round-48/scratch/`, a copy of `store/app` identical by `diff -rq`, own vitest config, `node_modules` junction via PowerShell, removed with `cmd /c rmdir`; `store/node_modules` still has 618 entries). Before each mutation the 3 touched files were restored from `store/`, and each edit had to match exactly once. Output: `runs/mutations.txt`.

| # | Mutation | Expected | Result |
|---|---|---|---|
| (a) | scoped query `toHaveLength(9)` | fail | **fail** :309:70 "length of 9 but got 2" (select options are not counted) |
| (b) | `toHaveLength(3)` | fail | **fail** :309:70 "length of 3 but got 2" |
| (c) | 8th `<option value={99}>` in the scratch grid `<select>` | green | **7/7 green** |
| (d1) | scratch `ArrangementLibrary` renders `results.slice(0, 1)` | fail | **fail** :309:70 "length of 2 but got 1" (missing rows) |
| (d2) | C variant: a 3rd demo source in the test fixture `budgetCollection` | fail | **fail** :310:70 "length of 2 but got 3" (more than 2 rows) |
| (e) | C extra: an additional empty `<div role="listbox" aria-label="second" />` next to the library list | fail | **fail** :309:24 `TestingLibraryElementError: Found multiple elements with the role "listbox"` |

After the series the files were restored and found identical to `store/`.

**Unmutated base:** the first (cold) run **failed one other test** at :547 (R9-L2, `expected 0.0050000667572021595 to be +0`). Two base re-runs were 7/7. See C-R48-01.

**Live cross-check (browser):** at 1440×900 the real anonymous `/studio-lab` has exactly **1** `[role=listbox]` and the grid select has **7** options (`runs/g48-3.txt`). This matches the test's assumption that the select is not a listbox.

## 3. G48-1 — gates: **PASS**

| Gate | Result | File |
|---|---|---|
| `npx tsc --noEmit` | exit 0 (node.exe 35) | `runs/tsc.txt` |
| Focused 7 suites (render-budget, context-hygiene, grid, grid-snap-ui, gesture-reentry, gesture-guard, track-layout) | 7 files / **109 passed** | `runs/focused.txt` |
| Full `npx vitest run` | **82 files / 1387 passed, 0 failed** (node.exe 33) | `runs/full-vitest.txt` |
| `npm run build` | exit 0 | `runs/build.txt` |
| `npx biome check ./app` (read-only) | 355 files; **2 errors** = `app\lib\auth.ts` format and `app\lib\__tests__\bug-hunting\auth-bugs.test.ts` format (root CRLF baseline); **218 warnings**; **1 info** | `runs/biome-app.txt`, `runs/biome-app-errors.txt` |
| Biome on the test file | "No fixes applied" | `runs/biome-rb.txt` |
| **`npm run verify`** | check-agents, biome lint, tsc, vitest 82/1387, build → **VERIFY EXIT 0** (node.exe 33→33) | `runs/verify.txt` |
| render-budget alone in `store/`, 3 more runs | 7/7 ×3 | `runs/rb-store-repeat.txt` |

## 4. G48-2 — tree: **PASS**

- `git status --short` matches §3.1 exactly (9 paths), at the start and the end.
- `round47-verified-tree-sha256.txt`: 7 OK; only doc 044 FAILED (expected, D1–D4).
- `git diff HEAD --stat -- app docs` plus untracked files cover only the 9 paths.
- Protected files 4/4 OK; HEAD unchanged.
- Every `app/**` file except `render-budget.test.tsx` equals C47's verified tree. Proof: `git diff HEAD --stat -- app docs` and `git ls-files --others` list only the 9 paths, the 7 code/test round-47 paths match `round47-verified-tree-sha256.txt`, and the 402 list adds the frozen files.

## 5. G48-3 — anonymous workspace / purchase protection: **PASS (re-run, not only cited)**

I used gstack browse with a fresh state file `c-round-48/anon/c-browse.json`, no credentials and no restart, at 1440×900. Output: `runs/g48-3.txt`.

- **`/studio-lab` direct:** the workspace is shown. `auth_user=null`, cookie empty, and the demo badge reads `დემო კოლექცია — ავტორიზაცია არ სჭირდება` (`studio-lab-anon-1440.png`).
- **Anonymous `/api/studio-token?product=middle-east&file=mix.mp3`:** **401** `{"error":"Please sign in to access Studio."}`.
- **`/studio/middle-east`:** "Sign in required"; the workspace is absent and no media elements load (`studio-premium-anon-1440.png`).
- The premium auth is **not bypassed**. I stopped my own browse server afterwards. Its state file is removed, and PID 31000 no longer runs. A later `status` call auto-started a second daemon on the same state file; I stopped it too, but its PID was not captured.
- G47-3 (`c-round-47/runs/g47-3.txt`) is consistent with this; the sha proof in §4 covers it too.
- 1280×720 was not re-run: this round has no layout change.

## 6. Ableton

**Not applicable**: this is a test-only correction with no behaviour change. The round-47 two-verdict table (`c-round-47.md` §11) stands.

## 7. Not run this round (not PASS)

- Every round-47 behaviour ID: the code is unchanged and sha-proven, so I did not re-run them.
- Video sync / C-R27-01.
- The full find sound → add → fit video → export flow, including export WAV decode.
- FB-01..FB-16 stage regression.
- `npm run test:e2e:smoke` (root only).

None of these are claimed here.

## 8. Bugs / findings to B

### C-R48-01 — Low — R9-L2 render-budget test (:547) is timing-sensitive on a cold run (pre-existing, frozen test)

- **Steps:**
  1. Copy `store/app` to a fresh scratch dir with a fresh vite cache.
  2. Run `npx vitest run --config <scratch>/vitest.config.mts app/lib/arrangement/__tests__/render-budget.test.tsx` on the unmutated files.
- **Expected:** 7/7.
- **Actual:** the first cold run gave `1 failed | 6 passed`, failing "keeps the context value and its consumers unchanged when the start hold releases (R9-L2, C-R6-02)" at `render-budget.test.tsx:547:44` with `expected 0.0050000667572021595 to be +0` (node.exe 34).
- **Repeat runs:** 2 scratch re-runs and 6 `store/` runs (focused, full, verify, 3× alone) were all green.
- **A saw the same failure once:** mutation (b) first run, `0.077 ≠ 0` (node.exe 31→43).
- **Assessment:** `getLivePosition()` advances by a few ms before the assertion while the start hold should keep it at 0. This is either test timing (real clock in jsdom) or a real start-hold leak under slow transforms. The failure is not caused by round 48: l.547 is outside the 2-line diff and identical to the snapshot.
- **Hand-off:** B decides whether to make the test deterministic (fake clock) or investigate the start hold.
- **Evidence:** `c-round-48/runs/mutations.txt` (base), `runs/mutations-base-rerun.txt`, `runs/rb-store-repeat.txt`, `a-round-48/mutations.txt`.

No other new bug. GROUP-LANE-REFUSAL-TEXT and LANE-RANGE-OVERLAY-60 are unchanged and are the round-49 carry-ins.

## 9. Carried items (status unchanged unless stated)

- **Open C bugs:**
  - C-R41-01 (Low, TL-Q-VIEWPORT)
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome)
  - C-R23-01 + C-R38-01 (Tech Lead)
  - New Low (round 49): GROUP-LANE-REFUSAL-TEXT, LANE-RANGE-OVERLAY-60.
  - None was re-tested this round.
- **Accepted by B:** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, A-R45-SSR4, A-R46-RESTORE-SELECTION, A-R47-GROUP-LANE-DELTA (doc 044 D1 now records it, verified in §1).
- **Open Low:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, DETAIL-RESET-SHRINK (info), SHIFT-BEFORE-DOWN-NOTE; plus **C-R48-01**.
- **Root items:**
  - **REMOTE-DIVERGENCE-SHAVIDZE, re-confirmed by C at 17:48 +04** (`runs/remotes.txt`): `git ls-remote` gives TCzaba master `d2f6715`, shavidze master `08b6a5eda321…`. The `08b6a5e` object is **not in the local repo**, so it cannot be an ancestor-checked fast-forward. This contradicts `publication-checkpoint.json`, which lists both remotes as pushed. Root must fetch and reconcile shavidze before the next push, with no force push.
  - Also open: ARCH-CHECKPOINT-SRW13, GSTACK-ACL / CDP allowlist, GSTACK-NO-MOUSE (pending acceptance), SRW-21, the CRLF Biome errors on the auth files, fake Bearer → 500, ENV-BROWSE-DAEMON, machine load.
- **`root-pre-push-review.md`:** this is the **round-3** review (2026-10-07). It records that it could not write itself and ran no gates.
  - Its FAIL/unmeasured IDs **RF3-1, RF3-2 and R5-L6 appear in no C report after `c-round-3.md`**: I grepped `c-round-*.md` and `feature-status.md`. So they have no explicit by-ID closure; the sync family is tracked as C-R27-01 (open, Tech Lead).
  - R5-L3 and R5-E1 have later C evidence (`feature-status.md`: "R5-L3 seam 0, R5-E1 maxDiff 0").
  - R5-L5 has later C evidence up to c-round-29, R6-S2 up to c-round-11, and R6-S3 up to c-round-6.
  - **B follow-up:** add an explicit mapping in `feature-status.md` (RF3-1/RF3-2/R5-L6 → C-R27-01, or closed with the evidence round). I did not re-verify any of them this round.
- **Tech Lead manual checks:** R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T.

## 10. Commit readiness (for root)

**Ready from C's side: the round 47 + 48 paths together** (the 9 paths in §4).
- Round 47's only failed gate (G47-1, render-budget :309) is fixed. `npm run verify` exits 0 and full vitest is 1387/1387.
- Doc 044 l.4 still reads "C-ის შემოწმებას ელოდება" by design; root fills in the publish hash afterwards.

**Conditions:**
1. Resolve REMOTE-DIVERGENCE-SHAVIDZE before pushing (no force).
2. Root runs its own `test:e2e:smoke`.
3. This is an intermediate commit, not a release or a full PASS. The FB-01..FB-16 regression, the find→add→fit video→export flow and video sync were not re-verified this round.
