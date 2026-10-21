# A — Round 63 report (SRW-14 4c-1 fix-up, D-29z28)

Implementer: A (Claude Opus 5.5) · 2026-10-19 (shell clock 11:01–11:20 +04) · No PASS claimed; C decides.

## 1. Pre-flight, baseline, red run

**Pre-flight gate**
- Assumptions: only the out-of-bounds branch of `snapGroupMoveDelta` changes, to return the grid-win object; `ArrangementClip.tsx` frozen; tests per §2.2 verbatim.
- Smallest version: grid.ts +4/−2 lines; tests 5 `it` + 1 assertion + 1 import.
- Files: `grid.ts` (fix), `grid-edges.test.ts` (CE9 grant, CE10, CE11), `grid-snap-clip-edges.test.tsx` (import, CG7–CG9), doc 056.
- Success: red = CE9/CE10/CG7 fail, CE11/CG8/CG9 pass; then 89/1574, tsc 0, build 0, verify 0.
- Read before first edit: `rules/read-primitives.md`; primitives AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS; `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`; `skills/pre-flight/SKILL.md`.

**Baseline (before any edit, `a-round-63/` not yet existing; values captured in-session):**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`, `git status --short` 31 lines → **case A**.
- Frozen list `b-round-62-r63-tree-sha256.txt`: non-OK count **0**; at end `sha256sum -c | wc -l` = 420, OK lines = 420.
- Snapshots `SHA256SUMS.txt`: grid.ts OK, grid-edges.test.ts OK, grid-snap-clip-edges.test.tsx OK; `cmp` all 3 "same".
- Protected 4/4 OK.
- `node.exe` 4 (B recorded 13).
- Servers: `:5173/studio-lab` **000**, `:5199/api/products` **000**. Re-checked `localhost:5173` and `[::1]:5173` → 000; `netstat` shows no listener on 5173/5199. **The orchestrator note said :5173 was running; it was not.** I did not start any server.

**Red run** (`a-round-63/red-before-source.txt`, unmodified grid.ts, `cmp` = snapshot):
- × CE9 — `expected 6.4 to be 6`
- × CE10 — `expected { requested: 6.4, allowed: 6 } to deeply equal { requested: 6, allowed: 6 }`
- × CG7 — mid-drag status *was* `GROUP_MOVE_BLOCKED_MESSAGE` (`not.toBe` failed)
- ✓ CE11, ✓ CG8, ✓ CG9
- `Tests 3 failed | 52 passed (55)` — matches §1.3 exactly.

## 2. Diff summary (vs `b-round-62-r63-snapshots`, `a-round-63/diff.patch`)

| File | Change | EOL CR/LF | sha256 prefix |
|---|---|---|---|
| `app/lib/arrangement/grid.ts` | `snapGroupMoveDelta` body only: `const gridResult = { requested: roundGridTime(gridStart - anchorStart), allowed: gridFallback };` grid-win returns `gridResult`; final `return inBounds ? { requested, allowed: requested } : gridResult;` Signature, return type, other functions unchanged. | 0 / 208 | `5341cd83` |
| `app/lib/arrangement/__tests__/grid-edges.test.ts` | CE9 `requested` → `toBe(6)` (only removed test line); CE10, CE11 appended in the D-29z27 describe. 11 `it`. | 0 / 126 | `7e686c0f` |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | `import { GROUP_MOVE_BLOCKED_MESSAGE } from '~/lib/arrangement/selection';` (between the `~/contexts` and `~/types` imports); CG7, CG8, CG9 appended after CG6. No existing line changed. 44 `it`. | 0 / 976 | `785f521d` |
| `docs/implementation/2026/quarter-IV/056-studio-lab-grid-group-oob-edge-status.md` | new (Georgian, §2.5 sections) | 0 / 103 | `1fd9c70b` (after the final verify-result + TODO edit; 0 / 104) |

Removed lines across all code files: exactly 3 (two old `return`s in grid.ts, CE9's old `requested` assertion).

## 3. New / revised tests (alone durations, `a-round-63/alone-owned-tests.txt`)

| ID | Result | Alone |
|---|---|---|
| CE9 (revised) | ✓ | 1 ms |
| CE10 | ✓ | 2 ms |
| CE11 | ✓ | 2 ms |
| CG7 | ✓ | 208 ms |
| CG8 | ✓ | 223 ms |
| CG9 | ✓ | 205 ms |

`grid-snap-clip-edges` alone: 44 passed, tests 2.50 s, Duration 4.57 s. No single test > 3 s.

## 4. Mutations (`a-round-63/mutations.txt`, harness `a-round-63/mut.mjs`, scratch `a-round-63/scratch` with `node_modules` junction, own vitest config)

Command (cwd scratch): `npx vitest run --config vitest.config.mts grid-edges grid-snap-clip-edges grid-snap-edit grid-snap-ui grid.test selection.test --reporter=verbose`. Unmutated: 137 passed.

| # | Mutation | Required | Failed (actual) |
|---|---|---|---|
| a | OOB → `{ requested: edge µs, allowed: gridResult.allowed }` | CE9, CE10, CG7 | CE9, CE10, CG7 ✔ |
| b | tolerance removed (strict bounds) | CE11 | CE11 ✔ |
| c | OOB → `{ requested: gridResult.requested, allowed: edge }` | CE9, CE10 | CE9, CE10, CG4, CG7 ✔ |
| d | OOB → `{ gridResult.allowed, gridResult.allowed }` | CE9 | CE9 ✔ |
| e | (ArrangementClip, scratch) group targets exclude placement-lane clips | CG8 | CG8 ✔ |
| f | `resolveSnapStep` → `null` when Snap off + Alt | CG9 | SE1, CM6, SE12, SE12b, SE13, CG9 ✔ |
| g | (ArrangementClip, scratch) group `gesture.blocked = false` | GS5b | GS5b ✔ (only failing test) |
| r62a | group helper gets `[]`, `[]` | CM10, CG1, CG3, CG8, CG9 | exactly those 5 ✔ |
| r62f | edge clamped to `[minDelta, maxDelta]` | CE9, CG4 | CE9, CE10, CE11, CG4, CG7 ✔ |
| r62h | grid path `requested` in µs | CE7 | CE7 ✔ |
| n (info) | OOB returns gridResult with µs `requested` | — | **survives** (137 passed) — expected: whole-ms anchors cannot distinguish |
| p (info) | in-bounds branch also returns gridResult | CM10, CG1, CG8 | CE8, CE11, CM10, CG1, CG3, CG8, CG9 ✔ |

After the run: grid.ts, ArrangementClip.tsx, selection.ts in scratch `restored=true`. No `store/` file was mutated. No survivor among required mutations → no test strengthening needed.

## 5. Smoke

**Not run (environment).** `:5173` = 000 (127.0.0.1, localhost, [::1]; no listener) at start and at end (11:14). `:5199` = 000. No gstack browse state created. Not a PASS claim either way.

## 6. code-reviewer

Real `code-reviewer` subagent run on the 4-file diff (read-only; also read the frozen `ArrangementClip.tsx`). Score 9/10; **no High or Medium findings**.

| # | Severity | Finding | Disposition |
|---|---|---|---|
| 1 | Info | All three branches match §0.1. Lines 1–185 are identical to the snapshot. The signature, return type and exports are unchanged. | none needed |
| 2 | Info | Re-derived the fixture math by hand: CE9 `{6,5}`, CE10 `{6,6}`, CE11 exact (strict bounds would give `{2,2}` and `{0,0}`), CG7, CG8, CG9 and CG4; `it` counts 11 / 44 | none needed |
| 3 | Info | The tests prove the fix: CE9, CE10 and CG7 fail on the old code (this agrees with my red run) | none needed |
| 4 | Low | CG7's mid-drag check is a negative `not.toBe(GROUP_MOVE_BLOCKED_MESSAGE)`. The post-release positive status assertion is the real proof. | **Kept as is.** §2.2 prescribes this assertion, and mutation a kills CG7. |
| 5 | Info (design → **B**) | **A nearer out-of-bounds edge hides a reachable edge.** In the CG7 fixture, s3's start gives an end touch at 8.2 (delta 6.2 = maxDelta, reachable, 0.15 from raw). That is nearer than grid 8 (0.35), but because 8.4 (0.05, out of bounds) is the nearest, the group falls back to 8. CG7 now pins `m1 === 8`. This is the single-lane version of §0.1's "Recorded consequence". | **Not fixed (outside §0).** I checked the arithmetic and it is correct. Proposed ID for B: **A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE**, logged next to GE-CROSS-OOB. If B wants "the nearest reachable edge wins", that is a new decision: it changes CG7, GE-OOB-STATUS and R63-T (8 → 8.2) and needs a bounds-aware candidate filter. |
| 6 | Info | Frozen consumer `ArrangementClip.tsx:404-421`: a cross-lane group sets `blocked=false` when `planClipLaneMove(requested)` succeeds. This is not new and is the same as the recorded consequence. | report only (file frozen) |
| 7 | Info | Project rules pass: no `.only`/`.skip`/comments/`any`/assertions; semicolons present; the import is in Biome order | none needed |
| 8 | Info | Doc 056 is accurate. The Arabic `ف` in the spec literal is correctly avoided by importing the constant. | none needed |

**Architecture note:** none new. The existing **ARCH-CHECKPOINT-SRW14-PREFS (b)** (one time-precision rule: `gridResult.requested` is whole ms, the edge path is whole µs) still applies and is not re-raised. This is a proposal for B/root, not an in-round refactor.

## 7. Command tails (verbatim, from `a-round-63/*.txt`)

```
$ npx vitest run <focused 6 files> --reporter=verbose      (focused-vitest.txt)
 Test Files  6 passed (6)
      Tests  137 passed (137)
$ npx tsc --noEmit                                          (tsc.txt)
tsc rc=0   (empty output)
$ npx vitest run                                            (vitest-full.txt)
 Test Files  89 passed (89)
      Tests  1574 passed (1574)
vitest rc=0   (no "timed out")
$ npm run build                                             (build.txt)
build/server/index.js                    1,367.46 kB
✓ built in 2.68s
build rc=0
$ npx biome check ./app                                     (biome-app.txt)
Found 5 errors.
Found 218 warnings.
Found 1 info.
  -- read-only `npx biome format ./app` lists the 5 format errors: StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts (baseline CRLF list)
$ npx biome check <3 owned files>                           (biome-owned.txt)
Checked 3 files in 28ms. No fixes applied.   rc=0
$ npm run verify                                            (verify.txt, attempt 1, quiet)
 Test Files  89 passed (89)
      Tests  1574 passed (1574)
✓ built in 9.73s
✓ built in 2.74s
verify rc=0
$ tasklist | grep -ci node.exe
4   (before full vitest; before verify; at end)
$ curl … 127.0.0.1:5173/studio-lab  → 000   (start and end)
$ curl … 127.0.0.1:5199/api/products → 000  (start and end)
```

**End state (`a-round-63/end-state.txt`):** HEAD `038ed5a…`, `git status --short` **32 lines** = 31 start lines + `?? docs/implementation/2026/quarter-IV/056-…md` (case A expectation met). Frozen non-OK 0 (420/420 OK lines). Protected 4/4 OK. git prints the usual autocrlf warning for LF `grid.ts` (root item).

## 8. Deviations

- **D1 — servers down.** The orchestrator override said `:5173` was running; at A start and end both `:5173` and `:5199` returned 000 with no listener. Browser smoke not run (environment). Nothing started or stopped.
- **D2 — transient self-inflicted duplicate import, fixed before any test run.** My first import edit duplicated the `~/types/arrangement` import line; I removed the duplicate immediately. The final file differs from the snapshot only by the one allowed import line plus CG7–CG9 (see `diff.patch`).
- **D3 — CG7 status literal.** The task's Georgian literal contains an Arabic `ف` in `ჯგუفის`; I used the allowed alternative (import `GROUP_MOVE_BLOCKED_MESSAGE` from `selection.ts`), so no literal was copied.
- None of the §2.3 stop conditions occurred (red run matched; no §2.2 assertion failed on the fixed tree; no other existing `it` failed).

## 9. Exact next C checks

- R63-S: `diff -u` against `b-round-62-r63-snapshots` (only `snapGroupMoveDelta` body; CE9 single assertion; 1 import line); AST-equality of existing `it`; EOL LF ×4; frozen 420 OK; protected 4/4; doc 055 unchanged.
- R63-U: red run on the snapshot `grid.ts`; mutations a–g + r62 a/f/h in C's own scratch; extras n (expected survivor) and p.
- G63-1/G63-2 gates; `git status` 32 lines (case A).
- §4.6 browser rows (GE-OOB-STATUS*, GE-OOB-PLAY, GE-BOUNDS-REG, GE-START-REG*, GE-CROSS-REG, GE-ALT-ENABLE*, GE-CROSS-OOB info) and G63-3 — **only once root starts `:5173` (and `:5199` for the token rows)**.

## 10. Scope completed / acceptance status

- Done by A: §0.1 source change; §2.2 tests; §2.3 mutations and re-runs; §2.4 tsc / vitest 89/1574 / build / Biome / verify; §2.5 doc 056.
- Not done: §2.4 browser smoke (environment). All §4 acceptance items are C's; none marked passed here.
- Backlog: not marked complete. C-R62-01, INFO-R62-EDGE-TOL, A-R62-REVIEW-R5-POSITIVE-LANE, C-R62-ALT-ENABLE-GROUP-GAP await C.

## 11. Carried for C/B (unchanged by this round)

- `root-pre-push-review.md`: video sync RF3-1, RF3-2, R5-L6 (C-R27-01) open; R5-L3 partial; R5-L5, R5-E1, R6-S2, R6-S3 unit-only; M1 (loop refill rAF-only, hidden tab silent), M2 (per-frame `position` re-renders consumers); Lows L1–L4, L6–L8.
- `publication-checkpoint.json`: SRW-21 purchased loader hardcodes `middle-east`; portable instruction paths; SRW-23 scrollbar check at 1280×720 and 1440×900; SRW-11/12 library and stems parity; T12 continuation.
- New for B: **A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE** (reviewer #5, info/design).
- Root §6.1: start `:5173` and `:5199` before C round 63 (both 000 during all of A round 63).
