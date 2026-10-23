# A — Round 94 report: collection load status (empty, swap reset) + purchased MP3 names test (D-29z59)

Implementer: A (Claude Opus 5.5) · 2026-10-23 · Status: **implementation done, waiting for C** (no commit/push/deploy).

## Baseline (verified before the first edit)
- HEAD `85fcb05`, `git status --short` empty, frozen list 518/518 OK, five owned hashes match (`140f17ec`, `210cfdc0`, `456335d4`, `944c6480`, `e6465055`), all LF.
- **Mount-safety grep (re-checked as B asked):**
  - No provider effect declared before l.3000 calls `setStatus`. The effects there are: l.535 (a layout effect that only updates `lastNonRefusalStatusRef`), l.2981 (export abort cleanup) and l.2987 (import controller / video URL cleanup).
  - Child mount effects call `setStatus` only from handlers or callbacks, never in an effect body: `StudioWorkspace` 633/1053/1316/1392/1457/1467/1498/1677, `ArrangementDetailPanel` 272, `ArrangementMarkerRow` 189.
  - `routes/studio-lab.tsx` has no `setStatus`, and `StrictMode` does not appear anywhere in `app/`.
  - `getDecodeContext` (l.677) and `patchSourceState` (l.644) are `useCallback(..., [])`.
  - No mount-time status writer was found, so the stop condition did not apply. The code-reviewer independently reached the same conclusion.

## Changed files (end state: 5 M + 2 ??, frozen 518/518 unchanged)
| File | Change | End sha256 prefix |
|---|---|---|
| `app/contexts/ArrangementContext.tsx` | L1 only: hoisted `copy`; empty branch `setStatus(copy.empty)` + `return () => controller.abort()`; otherwise `setStatus(copy.loading)`; removed the inner `copy` in `settle` (hunks: +6 lines inserted after old l.3001, and old l.3014 removed — both inside baseline l.3000–3016) | `c98fc743` |
| `app/lib/arrangement/collection.ts` | L2 only: `empty: string` + demo and purchased texts exactly as specified | `e37aed51` |
| `app/lib/arrangement/__tests__/collection.test.ts` | PC9: two `empty` keys only | `f0db400f` |
| `app/lib/arrangement/__tests__/collection-load-status.test.tsx` | **new**: LS1, LS2, LS3, LS3b, LS4×2 (resolve/reject), LS5, LS6, LS7, PM1 (10 tests) | `215e6113` |
| `docs/implementation/2026/quarter-IV/081-…md` | l.4 → `**სტატუსი:** C PASS (Round 93), გამოქვეყნდა 85fcb05 (D-29z58)` | `65a4c44a` |
| `docs/technical/arrangement-workspace.md` | l.44 only (one Georgian line: empty text + reset on change; fixed in round 94, closes after C) | `a9811b63` |
| `docs/implementation/2026/quarter-IV/082-studio-workspace-collection-load-status.md` | **new**, per TEMPLATE, status `Round 94 — C-ის შემოწმებას ელოდება (D-29z59)` | `c44c0b2b` |

All end hashes are in `a-round-94/end-hashes.txt`. `git diff -U0` hunks: context `@@ -3001,0 +3002,6 @@` (insert after old l.3001) and `@@ -3014 +3019,0 @@` (old l.3014 removed; 3019 is only its new-side position), both inside baseline l.3000–3016; collection.ts @9/@19/@29; collection.test.ts @378/@388; doc 081 @4; workspace doc @44.

## Tests actually run
- **New file and `collection.test.ts`:** green (24 tests total, after the review fix).
- **Fail-before** (baseline snapshots `140f17ec`/`210cfdc0` in scratch `a-round-94/mut/`; see `a-round-94/fail-before.txt`):
  - **7 red:** LS1, LS2, LS3, LS3b, LS4 (resolve), LS4 (reject), LS5.
  - **3 green:** LS6, LS7, PM1.
  - **Deviation from B's expectation:** B expected LS4 to pass on both versions. However, B's own LS4 spec requires the status to be exactly purchased `loading` after the swap, and the baseline cannot produce that. The baseline fails only on that post-swap assertion: it keeps the demo loading text.
  - LS4's stale-guard part is a preservation lock. Mutation **e** proves it.
- **Mutation proofs** (scratch copy with its own `vitest.config.ts` and its own `cacheDir`; script `a-round-94/run-mutations.py`; results in `a-round-94/mutation-results.json`). Files run: the new file, `collection.test`, `purchased-collection-ui` and `export-mp3`.

  | ID | Red tests |
  |---|---|
  | a (drop `setStatus(copy.loading)`) | LS3, LS3b, LS4×2, LS5 |
  | b (drop the empty branch) | LS1, LS2, LS5 |
  | c (empty branch sets `ready`) | LS1, LS2, LS5 |
  | d (empty branch always uses the demo copy) | LS2, LS5 |
  | e (remove the `aborted` guard in `then`) | LS4 (resolve) |
  | f (`fileStem` hardcoded to `'czaba-studio-lab'`) | PM1 |
  | unmutated control | 41/41 pass |

  - Mutation e turns only the resolve case red. That is expected: the reject case goes through `catch`, whose guard e does not remove.
- **`npm run typecheck`:** exit 0.
- **`npm run lint`:** exit 0. It reports repository-wide warnings, none of them in owned files.
- **Scoped `npx biome check` / `biome lint`** on the four owned code and test files: exit 0 with no diagnostics. Output is saved to `a-round-94/biome-lint-owned.txt` and `biome-check-owned.txt`.
- **Formatting:** checked through stdin. The formatter output is identical to each file.
- **Targeted vitest:** the list is in `a-round-94/targeted-list.txt`. It has 39 files, chosen by grepping for the status texts and `arrangement-status`, plus any test that both rerenders and uses `ArrangementProvider`. Result: **39 files / 716 tests pass** (`targeted-vitest.log`).
- Not run, per the speed rules: the full suite, build and `npm run verify`. These are gate rows.
- **A's own smoke** (not C evidence): Playwright Chromium at 1440×900 on `:5173/studio-lab`, script and output in `a-round-94/smoke/`.
  - The SSR status is exactly `დემო კოლექცია იტვირთება…`.
  - With both demo audio requests held, the status stayed on that exact text. After release it changed to exactly the demo `ready` text.
  - Each demo audio URL was requested once.
  - There was no hydration warning and no non-noise console error.
  - There were no token, R2, download or unpkg requests and 0 `Authorization` headers.

## Code review (required, 7 files) — actual `code-reviewer` subagent
- **Score: 8/10.** No Critical or High findings.
- **Effect ordering on mount:** safe.
- **Stale settle after a swap:** fully blocked, because cleanup aborts synchronously before the new effect body runs.
- **SSR/hydration:** unchanged.
- **Findings addressed:**
  - **Medium, untested same-origin swap:** added **LS3b** (demo A ready → new demo object → exactly demo `loading` → `ready`). It is red at baseline and red under mutation a.
  - **Low, LS4 pinned leftover source state (`'loading'`):** now asserts the old source is neither `ready` nor `error`. The stale settle still provably does not write, and a future cleanup on swap would not be flagged as a regression.
  - **Low, misleading LS7 title:** renamed to "right after the mount commit".
  - **Low, contradictory wording in workspace doc l.44:** changed to "fixed in round 94; closes after C".
- **Not addressed, outside my grant:**
  - Workspace doc l.45 still points to doc 080 rather than 082 (only l.44 was granted).
  - Leftover `sourceStates`, `buffersRef`, `sourcePeaks` and `selectedSourceId` are not cleared on a swap. This predates the change. I suggest a backlog line before SRW-21.
- **Info items left as they are:**
  - The empty branch creates an `AbortController` only so its cleanup matches the other branch.
  - PM1 sits in the load-status file because it shares the harness.

### Architecture note (verbatim from reviewer, for B)
> Signal 3 (repeated costly change): the collection-load effect in `app/contexts/ArrangementContext.tsx:3000–3051` has been revisited across rounds 92–94, and each change needs a roughly 300-line copied provider harness to test. Proposal for the planner only: if SRW-21 adds more load or swap rules, consider one bounded task that moves the per-run load bookkeeping (pending/failed counting, choosing the status text) into a pure `lib/arrangement` helper with its own unit tests. The effect, the refs, the abort ownership and the shape of `useArrangement()` would stay unchanged. Until then, keeping it as is is reasonable, because the logic is cohesive and shares one lifecycle.

This is a proposal only; nothing was extracted. It is related to ARCH-R93-TEST-HARNESS: the new test file copies the harness again.

## B acceptance (A's part) — what truly passed
- [x] L2: the `empty` field and both exact texts; nothing else in `collection.ts` changed.
- [x] L1: hoisted `copy`, the empty branch, `setStatus(copy.loading)`. The initializer, deps, abort guards and every other `setStatus` are unchanged.
- [x] PC9: only the `empty` keys were added.
- [x] New test file: LS1–LS7 and PM1, plus LS3b. Every assertion uses exact strings, counts or file names.
- [x] Fail-before is reported. The deviation from B's prediction for LS4 is explained above.
- [x] Mutations a–f each turn at least one listed test red.
- [x] Docs: 081 l.4, workspace doc l.44, and the new 082.
- [x] Typecheck, lint, scoped Biome and targeted vitest all pass. The targeted list is written.
- [x] A smoke run at 1440 shows loading, then ready, with no hydration warning.
- [x] The code-reviewer ran and its findings were addressed.
- [ ] The browser half of COLLECTION-EMPTY-STATUS and GATE92-S1 is **unreachable** on `/studio-lab`: it has one fixed demo collection, and the purchased mount is blocked. These two are proven by unit tests only.

## Known gaps
- An empty collection and a collection swap cannot be reproduced in the browser until the SRW-21 mount.
- Workspace doc l.45 still links to 080 (outside the grant).
- Old source state persists across a swap. This predates the change; see the review.
- The full suite, build, verify, e2e smoke and the production bundle belong to the root gate.
- `a-browse.json.lock` (PID 15616) is stale: the process is not running. I left it in place, as instructed, and used my own state file `a-browse.json` without problems.

## Exact next C checks
1. **DEMO-LOAD-REG** at 1280 and 1440:
   - SSR `arrangement-status` is exactly `დემო კოლექცია იტვირთება…`.
   - With audio held, the status is that same text; after release it is exactly the demo `ready` text.
   - With one aborted file, the status is exactly `დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.`.
2. **STATUS-PERSIST** at 1440: after ready, press Ctrl+L with no range and record the exact text. Then wait 5 s, open and close Export, and resize 1440 → 1280 → 1440. The text should be unchanged, and each demo audio URL requested exactly once (`/middle-east.mp3`, `/videos/hero/hero-music.mp3`).
3. **EMPTY-SWAP-REACH:** expect unreachable; record it as unit-only (LS1–LS5, LS3b).
4. **EXPORT-REG:** `czaba-studio-lab-range.wav` at 1280 (range 4–9) and `czaba-studio-lab.mp3` at 1440.
5. **PX-NET, REG-HYD, G94-3:** as written in the task.
6. **AN-REVIEW:** on a fresh machine first run `a-round-94/setup-scratch.sh` (copies `app`, `package.json`, `tsconfig.json` into `a-round-94/mut/`, symlinks `node_modules`, writes a scratch `vitest.config.ts` with its own `cacheDir`). Then run `python3 -I a-round-94/run-mutations.py a b f`; its `sync()` copies the current store versions of the four touched files before each mutation. For fail-before, run `setup-scratch.sh baseline` (it overlays B's two baseline snapshots) and then run the new test file in `mut/`. Expected red tests are in the table above. Check that the PC9 diff only adds `empty`.
7. **T94-TARGETED:** run `npx vitest run $(cat ../tmp/studio-real-loop/a-round-94/targeted-list.txt)`. Expected: 39 files, 716 tests.
8. **SOURCE-UNCHANGED:** HEAD `85fcb05`; 5 M + 2 ??; frozen 518/518; end hashes from `a-round-94/end-hashes.txt`; hunks as listed above; protected hashes as in the baseline.

## Scope completed
Round 94 A scope is complete: L1, L2, PC9, the new test file, three doc edits, checks and review. COLLECTION-EMPTY-STATUS, GATE92-S1 and GATE92-S2 still wait for C. The backlog is **not** complete; Lows part 3, the regression round and T12 remain.
