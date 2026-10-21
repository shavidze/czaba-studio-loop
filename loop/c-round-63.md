# C — Round 63 verification (SRW-14 4c-1 fix-up, D-29z28)

Verifier: C · 2026-10-19, shell clock 11:20–11:30 +04 · Evidence: `c-round-63/`

## Verdict: **BLOCKED** (`browserVerified: false`)

- All offline acceptance passes: R63-S, R63-U, G63-1, G63-2.
- C-R62-01 is a bug in status text the user sees in the browser. Its browser row, GE-OOB-STATUS, and every other §4.6 row could not run. G63-3 could not run either.
- The reason is the environment. `:5173/studio-lab` and `:5199/api/products` returned **000** all three times I checked: 11:20, 11:23 and 11:28. `netstat` showed no listener on 5173 or 5199.
- Agents do not start servers. Root's §6.1 request was not met again.
- Under Loop v2, round 63 cannot be marked **მზადაა** ("ready").
- **No new bugs.** One info/design item goes to B (§6).

## 1. G63-2 — tree: PASS

| Check | Start (11:20) | End (11:28) |
|---|---|---|
| HEAD | `038ed5a45f94…` | same |
| `git status --short` | 32 lines = case A (31 + `?? doc 056`) | 32, identical to start |
| Frozen list `b-round-62-r63-tree-sha256.txt` | 420 OK / 0 non-OK | 420 / 0 |
| Protected files | 4/4 OK | 4/4 OK |
| Owned files (sha256 prefix) | grid.ts `5341cd83`, grid-edges `7e686c0f`, clip-edges `785f521d`, doc 056 `1fd9c70b` | same |
| Other | `ArrangementClip.tsx` `97a1bf79` and doc 055 `e9fddf7a` are in the frozen list, both OK | `package.json` and the lockfile are unchanged |
| node.exe | 4 | 4 |

Evidence: `gates/g63-2-start.txt`, `gates/g63-2-end.txt`, `gates/status-end.txt`.

## 2. R63-S — static: PASS

- **`grid.ts`** (`diff-grid.txt`):
  - Only the body of `snapGroupMoveDelta` changed: +1 `gridResult` const, and the two `return`s were rewritten.
  - The grid-win branch returns `gridResult`, which is the same object as before.
  - The in-bounds edge branch returns `{ requested, allowed: requested }`.
  - The out-of-bounds branch returns `gridResult`, exactly as §0.1 requires.
  - The signature, return type and all other lines are byte-identical.
- **AST equality** (`scripts/asteq-it.cjs`, `gates/r63-s.txt`):
  - `grid-edges`: 9 → 11 `it`. 8 are identical, and only CE9 changed: its one diff line is `toBeCloseTo(6.4, 9)` → `toBe(6)`. CE10 and CE11 were added.
  - `grid-snap-clip-edges`: 41 → 44 `it`. All 41 are identical. CG7, CG8 and CG9 were added, plus one import line (`GROUP_MOVE_BLOCKED_MESSAGE` from `selection`).
  - **Negative control:** I changed one fixture literal in a copy (`scripts/neg.tsx`). The tool flagged the 12 `it` that use it.
- **Fixtures** match §2.2 verbatim: CE10 args, both CE11 calls, the CG7 m1/s2/s3/st1 fixture with its dx and mid-drag release, CG8 st9 10.4/1 with `y = STEMS_LANE_Y`, and CG9 with no `pressG` and `altKey`.
- **Banned patterns:** none.
  - The grep's only hits were false positives: the word "as" inside a test title, and `toBeCloseTo(x, 9)`, where 9 is a precision argument, not a timeout.
  - No `.skip`, `.only`, `.todo`, `retry` or `setConfig`, and no comments.
- **EOL:** all 4 owned files are LF with 0 CR (208 / 126 / 976 / 104 LF).
- **Doc 056:** it has the §2.5 sections.
  - Status: `Round 63 — D-29z28; C-ის შემოწმებას ელოდება`.
  - Its Ableton table keeps the labels "არ ეხება" (not applicable) and "დაუდასტურებელი" (unconfirmed).
  - Its TODO names round 64, INFO-R62-LIB-LOADING-DROP, the ARCH checkpoint, GROUP-SUBMS-GRID-EDGE and A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE.
  - Doc 055 is frozen and OK.

## 3. R63-U — unit and mutation (C's own scratch `c-round-63/scratch`, with a junction to `store/node_modules`): PASS

**Red run** (snapshot `grid.ts` + the new tests, `runs/red-run.txt`):
- ×CE9 `expected 6.4 to be 6`;
- ×CE10 `{6.4, 6}` vs `{6, 6}`;
- ×CG7: the mid-drag status was the blocked message;
- ✓CE11, ✓CG8, ✓CG9.
- Total: `3 failed | 52 passed (55)`, which matches §1.3.

**Mutations** (`scripts/cmut63.cjs`, `scripts/muts63.cjs`, `mutations.txt`; 6 files, 137 tests; every mutation applied once and was restored; afterwards `diff -rq` showed scratch identical to `store/app`):

| # | Mutation | Must fail | Failed |
|---|---|---|---|
| none | — | — | 0 / 137 |
| a | OOB → `{edge µs, gridResult.allowed}` | CE9, CE10, CG7 | CE9, CE10, CG7 ✔ |
| b | strict bounds (no tolerance) | CE11 | CE11 ✔ |
| c | OOB → `{gridResult.requested, edge}` | CE9, CE10 | CE9, CE10, CG4, CG7 ✔ |
| d | OOB → `{gridResult.allowed ×2}` | CE9 | CE9 ✔ |
| e | ArrangementClip group targets exclude the placement-lane clips | CG8 | CG8 ✔ |
| f | `resolveSnapStep` → `null` for Snap off + Alt | CG9 | CM6, CG9, SE1, SE12, SE12b, SE13 ✔ |
| g | group `gesture.blocked = false` | GS5b | GS5b ✔ (only one) |
| r62a | group helper gets `[]`, `[]` | CM10, CG1, CG3, CG8, CG9 | exactly those ✔ |
| r62f | edge clamped to bounds | CE9, CG4 | CE9, CE10, CE11, CG4, CG7 ✔ |
| r62h | grid path `requested` in µs | CE7 | CE7 ✔ |
| n (info) | OOB `gridResult` with µs `requested` | — | **survives** (expected: the anchors are whole-ms) |
| p (info) | the in-bounds branch also returns `gridResult` | CM10, CG1, CG8 | CE8, CE11, CM10, CG1, CG3, CG8, CG9 ✔ |

**Duration** (`gates/alone-clip-edges.txt`): `grid-snap-clip-edges` run alone gives 44 passed, tests 1.98 s, Duration 3.86 s. CG7 45 ms, CG8 49 ms, CG9 44 ms; no test was over 3 s.

## 4. G63-1 — gates: PASS

- `npx tsc --noEmit`: rc 0, empty output.
- Full `npx vitest run`: **89 files / 1574 passed**, rc 0, no `timed out`. node.exe 4.
- `npm run build`: rc 0 (`build/server/index.js 1,367.46 kB`).
- Biome `./app` (read-only): **5 errors / 218 warnings / 1 info**. The 5 errors are the baseline CRLF format files: StudioWorkspace, auth-bugs.test, grid.test, render-budget.test, auth.ts (`gates/biome-app-errors.txt`).
- Biome on the 3 owned files: 0 diagnostics, rc 0.
- `npm run verify`: **rc 0 on attempt 1**, run quietly with no parallel probe (`gates/verify-1.txt`, `verify-1.meta`).

## 5. Browser and anonymous checks: NOT RUN (environment)

`:5173` was 000 at 11:20, 11:23 and 11:28, so no gstack state file or Playwright context was created. That means:

| ID | Status |
|---|---|
| GE-OOB-STATUS (1440×900, 1280×720) | not run (environment). This is the browser proof of C-R62-01; only CG7 proves it at unit level. |
| GE-OOB-PLAY (real audio) | not run (environment) |
| GE-BOUNDS-REG | not run (environment). At unit level: GS5b, CG4, mutation g. |
| GE-START-REG (both viewports) | not run (environment) |
| GE-CROSS-REG | not run (environment). At unit level: CG5, CG8. |
| GE-ALT-ENABLE (both viewports) | not run (environment). At unit level: CG9. |
| GE-CROSS-OOB (info) | not run (environment) |
| G63-3 workspace (direct and via header), network, sign-in gate | not run (environment, `:5173` 000) |
| G63-3 token rows (401, fake Bearer 403) | not run (environment, `:5199` 000) |

- The anonymous/premium check was not run, so I make **no claim** that anonymous users cannot bypass premium auth this round. The protected route and token files are unchanged by sha256 (4/4).
- Audio graph, video transport and WAV export were not measured; they are out of this round's scope (§4.9) and need the browser anyway.

## 6. Info for B (no bug)

**A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE** (info/design). I reproduced it myself in scratch with `scripts/r5.mts`:
- **Setup:** the CG7 fixture as a helper call: m1 at 2 with duration 2, rawDelta 6.35, maxDelta 6.2, and the edges of s3 and st1.
- **Result:** the helper returns `{ requested: 6, allowed: 6 }`. The group lands on grid line 8.
- **Without st1** (only the reachable end-touch on s3's start at 10.2): it returns `{ 6.2, 6.2 }`.
- **Why:** the out-of-bounds st1 end-touch (8.4, 0.05 from raw) wins the nearest-candidate test. That hides the reachable end-touch at 8.2 (0.15 from raw), which is nearer than the grid line (0.35).
- **Rule check:** this follows D-29z28 as written ("an out-of-bounds edge falls back to the grid line"). R63-T expects 8.
- **For B to rule on:** should the nearest *reachable* edge win instead? That would need a new decision, a bounds-aware candidate filter, and changes to CG7, GE-OOB-STATUS and R63-T (8 → 8.2).

**C-R63-NPX-CACHE (info):** my reproduction above ran `npx tsx`, which fetched `tsx@4.23.15` into the user npm cache. The project, `package.json` and the lockfile are unchanged (`git diff --stat` empty). This is the same pattern as C-R29-NPX-CACHE.

## 7. Ableton — two verdicts per row (source: Live 12 manual §6.7 and §6.10, B capture `b-round-46/ableton-6.7-6.10-20261016.txt`; no video, no Live installation)

| Behaviour | CZABA requirement | Ableton match |
|---|---|---|
| Status text after a group move that landed on a grid line | Unit PASS (CG7, mutation a). Browser not run. | **Not applicable** (the manual describes no status line) |
| An out-of-bounds edge falls back to the in-bounds grid line | Unit PASS (CE9, CE10, CG4) | **Unconfirmed** (no source) |
| Alt enables snapping while Snap is off, for a group | Unit PASS (CG9, mutation f). Browser not run. | **Confirmed as a general rule** (§6.10). Applying it to a group is a CZABA decision. |
| A placement-lane clip edge captures the dragged anchor | Unit PASS (CG8, mutation e). Browser not run. | **Confirmed for a single clip** (§6.7). The lane and group-anchor rules are CZABA decisions. |

This report claims "Ableton does the same" for none of these rows.

## 8. Commit readiness for root

- **Round 63:** **not ready.** The offline proof is complete; only §4.6 and G63-3 remain. B should schedule a **browser-only follow-up** with the same tree, once `:5173` and `:5199` are up. The code does not need to be re-implemented.
- **Round 62:** ready. This is unchanged from B §6.2 (C round 62 PASS; C-R62-01 was Low and is now fixed at unit level).
- **Rounds 59, 60 and 61:** ready, each as its own unit. Unchanged.
- **Rounds 50–58 (`cb12805`):** ready. Unchanged.
- A commit is never a release or a full PASS.

## 9. Carried (unchanged, not re-tested)

- **`root-pre-push-review.md`:**
  - Video sync: RF3-1, RF3-2 and R5-L6 (C-R27-01) are open. R5-L3 is partly measured. R5-L5, R5-E1, R6-S2 and R6-S3 are unit-only.
  - Medium: M1 (the loop refill is rAF-only, so a hidden tab goes silent) and M2 (the per-frame `position` re-renders every consumer).
  - Lows: L1–L4 and L6–L8.
- **`publication-checkpoint.json`:**
  - SRW-21: the purchased loader hardcodes `middle-east`;
  - portable instruction paths;
  - the SRW-23 scrollbar check at 1280×720 and 1440×900;
  - SRW-11/12 library and stems parity;
  - T12 continuation.
- **Root:**
  - ENV-BACKEND-DOWN-R61, now extended: `:5173` is also down for the whole of A and C round 63;
  - INFO-R61-FAKEBEARER-500;
  - GSTACK-NO-MOUSE;
  - ARCH-CHECKPOINT-SRW14-PREFS (b) (time precision, again visible in mutation n).
- **Not touched:** the scratch junction `c-round-63/scratch/node_modules` is left in place, per the rule.
