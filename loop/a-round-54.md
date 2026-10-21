# A — Round 54 report (SRW-14 stage 4a part II, D-29z19)

Implementer: A (Claude Opus 5.5) · 2026-10-17 · task `current-task.md` (round 54). No PASS is claimed. C verifies.

## 1. Pre-flight gate and baseline

**Pre-flight gate**
- **Assumptions:**
  - the change is exactly line 172 (`* 1000 / 1000` → `* 1e6 / 1e6`);
  - the tests are pure appends of one `describe` each;
  - case (A) holds;
  - no other file changes.
- **Smallest version:**
  - 1 source line;
  - SL1/SL2 (~40 lines) and CM16/CT9 (~31 lines);
  - the doc 048 section.
- **Files touched:**
  - `selection.ts` (the fix);
  - `selection.test.ts` (SL1, SL2);
  - `grid-snap-clip-edges.test.tsx` (CM16, CT9);
  - doc 048 (the required implementation doc).
- **Success criteria:**
  - red/green exactly as in §2.2, and mutations (a)(b)(c)(g) fail their named tests;
  - full vitest 87 / 1501 / 0, tsc 0, `npm run verify` rc 0;
  - Biome 0 on the owned files, and `./app` within the baseline.

**Primitives and templates read in full:** `read-primitives.md`, `AGENT_DISCOVERABLE_CODE`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`. The inject-primitives hook blocked the first Edit on `selection.ts` and on doc 048 once each; I read the injected primitives and retried.

**Baseline before any edit: case (A).**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` showed exactly the 15 listed paths.
- Frozen list `grep -vc ': OK$'` → `0`.
- Snapshots: `SHA256SUMS.txt` 4/4 OK, and `cmp` shows all 4 owned files the same as their snapshots.
- Protected files 4/4 OK.
- `node.exe` 9.
- `/studio-lab` `000`, `:5199` `000` (18:1x +04). Despite the orchestrator note, **the dev server was down**.

## 2. Red run, mutations, green run

The scratch copy is `a-round-54/scratch` (outside `store/`):
- it holds a copy of `store/app`, its own `vitest.config.mts` (root, cacheDir and alias pointing at `a-round-54`), and a `node_modules` junction;
- I created the junction with `cmd //c "mklink /J …" </dev/null` and no `MSYS_NO_PATHCONV`, and removed it at the end with `cmd //c "rmdir …"`;
- `store/node_modules` is intact (618 entries).

**Red run** (`a-round-54/red-run.txt`; snapshot `selection.ts` plus the new tests; `selection` + `grid-snap-clip-edges`): **2 failed / 51 passed of 53. This matches §2.2 exactly.**
- **Red:**
  - SL1: `expected 'overlap' to be null`, part 1 is refused;
  - CM16: `expected 'music' to be 'stems'`, m1 stays on music.
- **Green:** SL2, CT9 and every existing `it`.
- There are no differences to explain.

**Green run** (`a-round-54/green-run.txt`; line 172 → 1e6; `selection`, `grid-snap-clip-edges`, `grid-edges`): **3 files / 59 passed.**
- CM16's rendered status `გადატანა ხაზზე — სტემები: start 00:06.000.` is asserted verbatim and passes.

**Mutations** (`a-round-54/mutations.txt`, scratch only, same 3 files):

| # | Mutation | Failed | Expected |
|---|---|---|---|
| (a) | `Math.round(params.timeDelta * 1000) / 1000` | SL1, CM16 | SL1, CM16 ✔ |
| (b) | `const delta = params.timeDelta;` | SL2 | SL2 ✔ |
| (c) | `Math.round(params.timeDelta * 1e4) / 1e4` | SL1 | SL1 ✔ |
| (g) | `clipEdgeTimes` pushes `Math.round(x*1000)/1000` for start and end (scratch `grid.ts`) | CE6, CT9; **CT8 passes** | CE6, CT9; CT8 not expected ✔ |

No mutation survived. Both scratch files were restored and checked with `cmp`.

**Post-run formatting fix:** Biome asked to collapse SL1's `fourLaneArrangement([...])` onto one line. This is a format-only change in my appended block. I applied it identically to store, scratch and the tool copy (`cmp` same). The store frozen suites and the full run (below) cover the final bytes. I did not re-run the red run after this format-only change.

## 3. Diff summary per file (all LF, CRLF 0)

Full diff: `a-round-54/diff-vs-snapshots.txt`; git diff of the 2 tracked files: `a-round-54/git-diff-owned.txt`.

| File | Hunks | LF lines (before → after) | Change |
|---|---|---|---|
| `app/lib/arrangement/selection.ts` | `@@ -169,7 +169,7 @@` | 221 → 221 | line 172 only |
| `app/lib/arrangement/__tests__/selection.test.ts` | `@@ -323,3 +323,43 @@` | 325 → 365 | appended `describe('planClipLaneMove exact time delta (C-R53-01, D-29z19)')`: SL1, SL2 (23 → 25 `it`) |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | `@@ -665,3 +665,34 @@` | 667 → 698 | appended `describe('SRW-14 stage 4a exact cross-lane lock (C-R53-01, D-29z19)')`: CM16, CT9 (26 → 28 `it`); reuses `MOVE_BLOCKED_TEXT`, `exactClipEnd`, `TRIM_END_BLOCKED`, `TRIM_END_TITLE` |
| `docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` | `@@ -1,7 +1,7 @@`, `@@ -207,3 +207,63 @@` | 209 → 269 | status line → `Round 52–54 — D-29z17, D-29z18, D-29z19; C-ის შემოწმებას ელოდება`; appended `## Round 54 — სხვა ხაზზე ზუსტი ჩაკეტვა (D-29z19)`, which also records the reviewer residual (§5) |

- **Final state:**
  - `git status --short` → **17 lines**: the 15 baseline lines plus ` M app/lib/arrangement/selection.ts` and ` M app/lib/arrangement/__tests__/selection.test.ts`;
  - frozen list 0 mismatches; protected files 4/4 OK; HEAD unchanged.
- **Banned content in the new code:** no `any`, `as`, `@ts-ignore`, `//` comments, fake timers, snapshots or colours.

## 4. Browser smoke

**Not run (environment).**
- `curl /studio-lab` → `000` at the start of A's round and again at 18:41:34 +0400, and `:5199` → `000` both times.
- I did not start a server and did not create a browse state.
- Root must start the Store dev server, and the backend for G54-3, before C runs (ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53, now three rounds).

## 5. code-reviewer: findings and dispositions

I ran the actual `code-reviewer` subagent (read-only) on the diff. **Score 8/10; no Critical findings.**

- **Medium — A-R54-REVIEW-SHIFT-SUBMS (new; for B; not fixed, because it is outside ownership).**
  - **Mechanism:**
    - with Shift held, `ArrangementClip.tsx:371-373` sets delta 0 and `snapStep` null;
    - `moveStartOnGrid` (`:106-107`) then returns `roundTime(start)`, the start rounded to whole ms;
    - `:452` passes `timeDelta: requestedStart − original.start`, which is −0.0004 for a start of 6.0004 instead of 0.
  - **Before the change:** ms rounding turned −0.0004 into −0, so the start stayed exact.
  - **Now:**
    - the clip moves 0.4 ms while it is time-locked;
    - if the target lane has a neighbour ending at 6.0004, the move is refused.
  - **Reproduced by A** with a scratch probe (`a-round-54/probe-shift.txt`; scratch test `probe-r54-shift.test.tsx`, never in `store/`):

    | Probe | Snapshot `selection.ts` | Round-54 `selection.ts` |
    |---|---|---|
    | P-SHIFT-FREE (m1 music 6.0004, Shift-drag to empty stems) | stems, 6.0004 | stems, **6** |
    | P-SHIFT-TOUCH (+ st0 stems 0–6.0004) | stems, 6.0004 | **refused**: stays on music, `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` |

  - **Scope:** whole-ms starts (CM9, CM9b, the L52 browser fixtures) are unchanged. The §0.4 statement "the Shift time lock (delta 0)" holds only for whole-ms starts. The case is reachable after a round-53/54 sub-ms lock followed by a Shift cross-lane drag.
  - **Proposed fix (B; it touches the frozen `ArrangementClip.tsx`):** pass `timeDelta: 0` when `timeLocked`, plus a new CM9c (sub-ms start + Shift cross-lane keeps its start exactly).
  - **Disposition:** reported, not fixed. Ownership allows `selection.ts:172` only, and I neither widened nor narrowed the prescribed change. C should run P-SHIFT-TOUCH as a probe and record it under this ID.
- **Low — Snap-off group `allowed` can be sub-ms.** It is clamped by the raw `groupMoveBounds` and only reaches the refused-move ghost preview, never a commit. Info, no action.
- **Low — SL2 guards the planner contract only.** UI group callers already ms-round their delta. **Disposition:** kept SL2 (B's spec), and doc 048 now says so.
- **Low — the cross-lane lock is µs-exact, not bit-exact** (`anchor.start` + µs delta, residual ≤ 0.5 µs, far below EPS). **Disposition:** stated in doc 048.
- **Info:** CT9 does not reach `selection.ts`. It is the guard for (g), not coverage for D-29z19, which matches B's §2.2.
- **Reviewer's answers to the caller checks:**
  - whole-ms group and single deltas give bit-identical results;
  - no keyboard path calls `planClipLaneMove`; its only callers are `ArrangementClip.tsx:389, 412, 448`;
  - before-start and overlap verdicts are unchanged for whole-ms deltas;
  - single moves from a sub-ms start now land on the grid line or whole-ms edge across lanes, which is consistent with the same-lane path. This extends the accepted free-move side effect to Snap-on cross-lane moves from sub-ms starts.

**Architecture note (for B; not acted on).**
- **Signals:** coupling, plus the same region changed in rounds 52, 53 and 54.
- **The time-precision rule lives in four places:**
  - `ArrangementClip.tsx:94` `roundTime` (ms);
  - `grid.ts:11` `roundGridTime` (ms);
  - `grid.ts:88` `toWholeMicroseconds` (µs);
  - `selection.ts:172` (inline µs).
- **Why it matters:** the planner's exactness depends on what the frozen caller passes it, and the Shift case proves this.
- **Reviewer's proposal:** one bounded task, with a single owner and behaviour-preserving tests:
  - a shared time-precision helper in `lib/arrangement`;
  - bundled with the Shift `timeDelta: 0` fix and CM9c.
- **Status:** a candidate input for ARCH-CHECKPOINT-SRW14-PREFS / root. Keep it for this round.

## 6. Command tails (verbatim summaries; full output in `a-round-54/`)

```
git rev-parse HEAD → 038ed5a45f94596a264c14c4ec834607cb407948 (start and end)
git status --short | wc -l → 17
sha256sum -c b-round-53-r54-tree-sha256.txt | grep -vc ': OK$' → 0
protected: download-routes.test.ts OK / account.downloads.tsx OK / api.studio-token.ts OK / studio.$productId.tsx OK
npx tsc --noEmit → rc 0 (tsc.txt)
npx biome check <3 owned code/test files> → rc 0, "Checked 3 files … No fixes applied." (biome-owned.txt)
npx biome check ./app → Found 5 errors. Found 218 warnings. Found 1 info. (biome-app.txt)
  errors (all format, baseline CRLF list): StudioWorkspace.tsx, bug-hunting/auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts
frozen suites (18 files of §4.8) → 1 failed | 359 passed (360): track-layout "folds a lane to a 36 px row…" Test timed out in 5000ms
  track-layout.test.tsx alone → 36 passed (36)  [C-R48-01, load; file not changed]
npx vitest run (full) → Test Files 1 failed | 86 passed (87); Tests 1 failed | 1500 passed (1501): sfx-library.test.tsx:107 Test timed out in 5000ms
  sfx-library.test.tsx alone → 3 passed (3)  [C-R48-01, load; file not changed]
npm run build → rc 0, "✓ built in 7.02s"
npm run verify (quiet) → rc 0; Test Files 87 passed (87); Tests 1501 passed (1501); "✓ built in 7.15s"
tasklist | grep -ci node.exe → 9 (before frozen suites, before full run, after full run, before verify, at end)
curl 5173/studio-lab → 000 ; curl 5199 → 000 (start and 18:41:34 +0400)
```

**Verbatim tails** (from `a-round-54/tails.txt`):

```
--- verify.txt (tail)
 Test Files  87 passed (87)
      Tests  1501 passed (1501)
build/server/.vite/manifest.json             0.57 kB
build/server/assets/studio-DTQ5s2Tn.css      1.35 kB
build/server/assets/app-B8VTN8jX.css       197.42 kB
build/server/index.js                    1,354.07 kB
✓ built in 7.15s
--- full-vitest.txt (tail)
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 86 passed (87)
      Tests  1 failed | 1500 passed (1501)
   Start at  18:22:47
   Duration  251.69s (transform 27.51s, setup 0ms, import 204.44s, tests 363.57s, environment 326.01s)

--- frozen-suites.txt (tail)

 Test Files  1 failed | 17 passed (18)
      Tests  1 failed | 359 passed (360)
   Start at  18:20:44
   Duration  61.97s (transform 24.01s, setup 0ms, import 63.35s, tests 113.33s, environment 47.87s)

--- track-layout-alone.txt (tail)
 Test Files  1 passed (1)
      Tests  36 passed (36)
   Start at  18:22:01
   Duration  18.41s (transform 2.75s, setup 0ms, import 4.67s, tests 11.00s, environment 1.97s)

--- sfx-library-alone.txt (tail)
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:27:17
   Duration  8.45s (transform 818ms, setup 0ms, import 2.20s, tests 3.55s, environment 2.02s)

--- biome-app.txt (counts)
Checked 360 files in 2s. No fixes applied.
Found 5 errors.
Found 218 warnings.
Found 1 info.
--- biome-owned.txt
Checked 3 files in 78ms. No fixes applied.
```

**C-R48-01 recurred twice** under the standalone runs, in unchanged files (`track-layout`, `sfx-library`). Both files are green alone, and the quiet `npm run verify` run is 87 / 1501 / 0.

## 7. Deviations and observations

- **Dev server down:** the orchestrator said `:5173` was running, but it returned `000` throughout, so the smoke was not run. I did not start or stop any server.
- **Biome format fix:** described in §2. The red run used the semantically identical pre-format bytes.
- **Doc 048:** I also recorded the reviewer's Medium residual and the µs-exact note in my own appended section. Earlier text is unchanged.
- **Untracked `store/nul`:** a stray root-level file. It is not mine and I did not touch it; root should look at it. It does not appear in `git status --short`, probably because of Windows device-name handling.
- **Root-review findings still open** (`root-pre-push-review.md`, `publication-checkpoint.json` followupReview; listed only, not acted on):
  - RF3-1 (video sync not 15/15; R2-V3 layout unmeasured), RF3-2 (`play()` 22–30 ms after `startAt`; |d| above 0.06 in the first 300 ms) and R5-L6 (wrap seeks 0.3–1 s; drift above 0.1) — FAIL, not re-run this round;
  - G3-R, G3-3 and G3-shots were not re-run at runtime;
  - the purchased Studio loader hardcodes `middle-east` (inherited; SRW-21). Do not claim that every product's stems work;
  - portable paths in the instruction files still need follow-up;
  - the protected-auth permission is unchanged.
- **git autocrlf:** `git diff` warned `LF will be replaced by CRLF the next time Git touches it` for both tracked owned files. This is repo config and pre-existing. The round is sha256/LF-gated, so any future git checkout or stash would change those bytes. Root should know; no action.
- **Scratch leftovers** (outside `store/`, mine): `a-round-54/scratch/app` and the `probe-r54-shift.test.tsx` probe. The junction was removed.

## Scope completed (A self-check only; not C acceptance)

- §0.2 source change: done.
- §2.2 tests: SL1, SL2, CM16 and CT9 added; red/green as specified; mutations (a)(b)(c)(g) behave as specified.
- §2.3: tsc 0; owned files Biome 0; `./app` within the baseline; the code-reviewer actually ran; `npm run verify` rc 0. The smoke was **not run (environment)**.
- §3.1: exact ownership; 17 status lines; frozen list and protected files OK.

## Exact next checks for C

1. G54-2 / R54-S: the diff hunks above (`selection.ts:172` only; two pure appends; doc status line and appended section); LF; frozen 409 OK; protected 4/4.
2. R54-U: C's own mutation strings (a)–(c) and (g), and extras (d)/(e). Re-run P3x (expect stems 6.0004, status `… start 00:06.000.`) and P3s. **Add a P-SHIFT-TOUCH probe** for A-R54-REVIEW-SHIFT-SUBMS (expected to reproduce the refusal).
3. G54-1: tsc, vitest 87 / 1501, build, Biome, quiet `npm run verify`.
4. Browser IDs (R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM, R52-PLAY, R52-REG, G54-3) only after root restarts `:5173` and `:5199`.
