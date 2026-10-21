# A — Round 55 report (SRW-14 stage 4a, D-29z20: Shift time lock with a sub-ms start)

Implementer: A (Claude Opus 5.5) · 2026-10-17 · task `current-task.md` (round 55). No PASS is claimed; C verifies.

## 1. Pre-flight gate and baseline

**Pre-flight gate**
- **Assumptions:**
  - the change is exactly the single-clip `requestedStart` conditional (`timeLocked ? original.start : moveStartOnGrid(...)`);
  - the tests are a pure append of one `describe` (CM9c–CM9e);
  - case (A) holds; no other file changes;
  - the dev server is down, so the smoke is not run.
- **Smallest version:** 1 logical source change (8 → 10 lines after Biome reflow), 40 test lines, the doc 048 section.
- **Files:** `ArrangementClip.tsx` (the fix), `grid-snap-clip-edges.test.tsx` (CM9c–CM9e), doc 048 (required implementation doc).
- **Success:** red run fails CM9c/d/e only; green 3 files / 62; mutations (a)(b)(c) fail exactly their named tests; full vitest 87 / 1504; tsc 0; Biome 0 on owned files; `npm run verify` rc 0.

**Read in full before the first edit:** `rules/read-primitives.md`, `AGENT_DISCOVERABLE_CODE`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `FORWARDREF_COMPONENT`, `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`, `skills/pre-flight/SKILL.md`. The inject-primitives hook blocked the first Edit once per file (test file, `ArrangementClip.tsx`, doc 048); I read the injected primitives (also `DESIGN_TOKENS`, `TAILWIND_FIRST` — no styling touched) and retried the same edit.

**Baseline before any edit (between 19:41, prompt file mtime, and 19:44:12, first test-file write; +04): case (A).**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` = exactly the 17 listed paths.
- Frozen list `grep -vc ': OK$'` → `0`.
- Snapshots `SHA256SUMS.txt` 3/3 OK; `cmp` → all 3 owned files `same`.
- Protected files 4/4 OK. `node.exe` 9.
- `/studio-lab` `000`, `:5199` `000`. **The dev server was down despite the orchestrator note.**

## 2. Red run, mutations, green run

Scratch: `a-round-55/scratch` (outside `store/`) = copy of `store/app` + own `vitest.config.mts` (round-54 config with paths → `a-round-55`) + `node_modules` junction created with `cmd //c "mklink /J …" </dev/null` (no `MSYS_NO_PATHCONV`), removed at the end with `cmd //c "rmdir …"`; `store/node_modules` intact (618 entries).

**Red run** (`a-round-55/red-run.txt`; snapshot `ArrangementClip.tsx` + new tests; `grid-snap-clip-edges` + `selection` + `grid-edges`): **3 failed / 59 passed of 62 — matches §2.2 exactly.**
- CM9c: `expected 'music' to be 'stems'` (refused, stays on music);
- CM9d: `expected 6 to be 6.0004`;
- CM9e: `expected 6 to be 6.0004` (fails at the start assertion, before the Undo assertion);
- every existing `it` green, incl. CM9, CM9b, CM16, CT9. No differences to explain.

**Green run** (`a-round-55/green-run.txt`, after the fix, Biome-formatted file copied in): **3 files / 62 passed.**

**Mutations** (`a-round-55/mutations.txt`, scratch only, same 3 files; each mutation's diff vs snapshot is in the file):

| # | Mutation | Failed | Expected |
|---|---|---|---|
| (a) | snapshot `requestedStart` | CM9c, CM9d, CM9e | ✔ |
| (b) | snapshot + `timeDelta: timeLocked ? 0 : requestedStart - original.start` | CM9e only | ✔ |
| (c) | snapshot + `moveClip(gesture.before, original.id, timeLocked ? original.start : requestedStart)` | CM9c, CM9d | ✔ |

No mutation survived. Scratch restored to the store file (`cmp` same).

## 3. Diff summary per file (all LF, CRLF 0)

Full diff: `a-round-55/diff-vs-snapshots.txt`.

| File | Hunks | LF lines (before → after) | Change |
|---|---|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | `@@ -433,14 +433,16 @@` | 692 → 694 | single-clip `requestedStart` only; `:454` still `timeDelta: requestedStart - original.start` |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | `@@ -696,3 +696,43 @@` | 698 → 738 | appended `describe('SRW-14 Shift time lock keeps a sub-millisecond start (C-R54-01, C-R54-02, D-29z20)')`: CM9c, CM9d, CM9e (28 → 31 `it`) |
| `docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` | `@@ -1,7 +1,7 @@`, `@@ -267,3 +267,68 @@` | 269 → 334 | status line → `Round 52–55 — D-29z17, D-29z18, D-29z19, D-29z20; C-ის შემოწმებას ელოდება`; appended `## Round 55 — Shift-ით დროის ჩაკეტვა sub-ms start-ზე (D-29z20)` |

- **Rendered strings confirmed verbatim (no deviation from §2.2):** CM9c status `გადატანა ხაზზე — სტემები: start 00:06.000.`, Undo `გადატანა ხაზზე — სტემები`; CM9e pre-drag `undoLabel` is `null` (asserted, then asserted equal after the drag), status `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` (built from `MOVE_LABEL`).
- **Final state:** `git status --short` → **17 lines**, identical to baseline; frozen list 0 mismatches; protected 4/4 OK; HEAD unchanged.
- **Banned content in the new code/tests:** no `any`, `as`, `@ts-ignore`, `//` comments, fake timers, snapshots or colours.

## 4. Browser smoke

**Not run (environment).** `curl /studio-lab` → `000` at the start and at 19:52:35 +04; `:5199` → `000` both times. No server started, no browse state created. Root must start the Store dev server and backend before C (ENV-DEV-SERVER-DOWN-R52 / ENV-VITE-ENOMEM-R53 — fourth round).

## 5. code-reviewer: findings and dispositions

Ran the actual `code-reviewer` subagent (read-only) on the 3-file diff. **Score 9/10; no Critical/High/Medium.**

- Correctness confirmed: cross-lane delta exactly 0; same lane → equal arrangement → no history; start 0 OK; whole-ms starts unchanged; Shift pressed/released mid-drag, group path, video clips (pinned to own lane → no-change), trims/ranges/keys unaffected; ghosts from the same planner call.
- **Low — A-R55-REVIEW-NONCANONICAL-START:** a start that is a non-canonical float (e.g. `7.000400000000001` from `anchor.start + delta`) was previously "normalised" by `roundTime` on a same-lane Shift drag and wrote `კლიპის გადატანა`; now it reports no change. Consistent with the contract (Shift keeps the start exactly). **Disposition:** accepted, info for B; no code change.
- **Low — A-R55-REVIEW-SHIFT-MIDDRAG-TEST:** no test for Shift pressed only on the last step after a non-Shift step on the same lane (preview must revert, no history), and the Shift ghost position is not asserted. Not required by §2.2; mutations are killed without them. **Disposition:** not added (keeps the B-specified 1504 count); proposed to B/C as a C probe or a later test.
- **Info:** `clipEdgeTargets` still computed under Shift (accepted in §0.1). Doc 048 l.267 earlier TODO "4b (რაუნდი 55)" is stale but earlier text is frozen; the new TODO is correct.
- **Architecture note (for B, not acted on):**
  - Signal 3 — `ArrangementClip.tsx` single-move branch + `selection.ts:172` + `grid.ts`: fourth consecutive round on this boundary, two precision bugs. Keep this round; supports ARCH-CHECKPOINT-SRW14-PREFS (extended) asking for one time-precision rule (`roundTime` / `roundGridTime` / `toWholeMicroseconds` / inline µs). Value medium.
  - Signal 1 — `handlePointerMove` (`:358-535`) handles group, single move, trims and ranges in one handler. Keep (shared gesture ref/lifecycle). Possible later proposal: a pure `resolveSingleMoveRequest(...)` with unit tests, only after the checkpoint answer.

## 6. Command tails (full output in `a-round-55/`)

```
git rev-parse HEAD                      → 038ed5a45f94596a264c14c4ec834607cb407948 (start and end)
git status --short | wc -l              → 17 (start and end; same paths)
frozen sha256 grep -vc ': OK$'          → 0 (start and end)
snapshots SHA256SUMS                    → 3/3 OK (start)
protected                               → 4/4 OK (start and end)
focused suites (§5 list, 11 files)      → Test Files 11 passed (11) / Tests 227 passed (227)   [frozen-suites.txt]
npx tsc --noEmit                        → rc 0                                                  [tsc.txt]
npx vitest run                          → Test Files 87 passed (87) / Tests 1504 passed (1504), rc 0   [full-vitest.txt]
npm run build                           → rc 0, ✓ built                                         [build.txt]
biome check <2 owned code/test files>   → Checked 2 files. No fixes applied. rc 0               [biome-owned.txt]
biome check ./app --diagnostic-level=error → Found 5 errors (format only: StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, auth.ts = baseline CRLF list)
biome check ./app                       → Checked 360 files; Found 5 errors / 218 warnings / 1 info (= baseline)
npm run verify (quiet, 1 attempt)       → rc 0; Test Files 87 passed / Tests 1504 passed; build ✓   [verify.txt]
tasklist | grep -ci node.exe            → 9 (start, before focused suites, before full run, before verify, end)
curl /studio-lab                        → 000 (start; 19:52:35 +04)
curl :5199                              → 000 (start; 19:52:35 +04)
```

No C-R48-01 timeout occurred in any of my runs (machine at 9 `node.exe`).

## 7. Deviations and observations

- None from the B task in code/tests/doc. No rendered string differed from §2.2.
- Doc 048 status line was changed with a node string replace (exact match asserted), the section with Edit; both LF.
- Scratch `a-round-55/scratch/app` copy and `tools/mut-b.tsx`, `tools/mut-c.tsx` are left for C reference; the junction is removed.
- Loop runner's `a-round-55-result.json` (empty) left untouched.
- Smoke not run (environment).

## Scope completed (A self-check only; not C acceptance)

- §0.2 source change: done (one hunk).
- §2.2 CM9c–CM9e: done; red run, green run and mutations (a)–(c) match the spec.
- §2.3 self-check: the §5 focused 11-file run (227/227); the 8 extra §4.8 suites (gesture-reentry, track-layout, context-hygiene, view, ArrangementContext.test.ts, ssr-layout-effect, delete-selection, delete-selection-ui) were covered only by the full run, not a separate focused run; full vitest 87/1504, tsc, build, Biome, `npm run verify` rc 0, code-reviewer run.
- §3.3 doc 048 section: done.
- Browser smoke: **not run (environment)**.
- Not claimed: any C acceptance ID (R55-S, R55-U, G55-1/2/3, R55-SHIFT, R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM, R52-PLAY, R52-REG).

## Exact next checks for C

1. G55-2 / R55-S: HEAD `038ed5a`, 17-line status, frozen 410 OK, protected 4/4; `diff -u --strip-trailing-cr` vs `b-round-54-r55-snapshots/` → hunks `@@ -433,14 +433,16 @@` (clip), `@@ -696,3 +696,43 @@` (test), `@@ -1,7 +1,7 @@` + `@@ -267,3 +267,68 @@` (doc); CRLF 0 on all three.
2. R55-U: own mutations (a)–(c) + info (d) (`Math.max(0, start + delta)` in the free branch on the snapshot caller); probes PS-TOUCH/PS-FREE/PS-SAME → 6.0004 and texts as §4.2; P3x 6.0004, P3x-END 8.4004, PF-FREE 7, PG-GROUP2/P1m/P1s/P2m/P4/P5 unchanged; new PS-GROUP.
3. Extra probe suggested by the reviewer: same-lane drag `[{dx: 40}, {dx: 40, shiftKey: true}]` on m1 at 6.0004 → start 6.0004, no history, no-change status; and Shift ghost start under a cross-lane hover.
4. G55-1 gates (87/1504, verify quiet ≤ 2 attempts, record `node.exe`).
5. Browser IDs only if root has started the servers (R55-SHIFT with SH-NOTE, R52-EDGE, R54-CROSS, R53-LANE, R52-TRIM, R52-PLAY, R52-REG, G55-3); otherwise **not run (environment)**.

## Follow-up for B / root (carried, incl. root-pre-push-review / publication items)

- ENV: dev server + backend down for the fourth A run (ENV-VITE-ENOMEM-R53); root must start both before C.
- C-R48-01 root decision (§6.2) still open; no recurrence in A's runs this round.
- ARCH-CHECKPOINT-SRW14-PREFS (extended) — reviewer note above supports it.
- New Lows for the backlog: A-R55-REVIEW-NONCANONICAL-START (info), A-R55-REVIEW-SHIFT-MIDDRAG-TEST.
- Rounds 50–55 form one 17-path commit only after a round-55 C PASS (root).
- From `root-pre-push-review.md` (read 2026-10-17; still listed as not run in §4.10): RF3-1, RF3-2, R5-L6 video-sync FAILs and G3-R/G3-3/G3-shots runtime evidence remain open (carried as C-R27-01 scope); not touched this round.
- From `publication-checkpoint.json`: SRW-21 (purchased loader hardcodes `middle-east`; do not claim all products' stems work), portable paths in instruction files, and the user's scrollbar refinement request remain backlog items; not touched this round.
