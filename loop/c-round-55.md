# C — Round 55 verification (SRW-14 stage 4a, D-29z20: Shift time lock on a sub-ms start)

Verifier: C · 2026-10-17 19:55–20:05 +04 · Task: `current-task.md` (round 55) · A report: `a-round-55.md` (A's claims re-checked, not trusted).

**Verdict: BLOCKED (environment).** Every offline item passed: G55-2, R55-S, R55-U, G55-1. **No browser ID ran for the fourth round.** `http://127.0.0.1:5173/studio-lab` and `:5199` returned `000` at 19:55, 20:04 and 20:06 +04 (`c-round-55/server-checks.txt`; the 19:55 check is from the orientation command and was not saved at the time). C did not start any server. Stage-4a browser acceptance and the purchase-protection check (G55-3) have **never run**. Without them this round cannot PASS.

## 1. G55-2 — baseline and integrity: PASS

`c-round-55/g55-2-start.txt` (19:55) and `g55-2-end.txt` (20:04):
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948` at start and end; this is case (A).
- `git status --short`: the same 17 paths at start and end.
- Frozen list (410 entries): 0 not OK, at start and end.
- Snapshots `SHA256SUMS.txt`: 3/3 OK at start.
- Protected files: 4/4 OK at start and end.
- `node.exe`: 9 at every measurement.

## 2. R55-S — static checks: PASS

`c-round-55/diff-vs-snapshots.txt` (`diff -u --strip-trailing-cr` against the snapshots):
- **`ArrangementClip.tsx`:** one hunk, `@@ -433,14 +433,16 @@`. It is exactly `const requestedStart = timeLocked ? original.start : moveStartOnGrid(...)` with the arguments unchanged. `timeDelta: requestedStart - original.start` is unchanged (now l.454). No import, prop, helper or comment was added. LF 694, CRLF 0.
- **Test file:** a pure append, `@@ -696,3 +696,43 @@`, with one `describe` holding CM9c, CM9d and CM9e. LF 738, CRLF 0.
- **Doc 048:** the status line changed (`@@ -1,7 +1,7 @@`) and a section `## Round 55 — …` was appended (`@@ -267,3 +267,68 @@`). LF 334, CRLF 0.
- **Banned content in the diff:** none. No `any`, `@ts-ignore`, `as`, `//` comment, colour, fake timer or snapshot.

## 3. R55-U — unit tests, mutations and probes: PASS

### 3.1 Mutations

I ran these in my own scratch copy (`c-round-55/scratch/mut`) with my own mutation strings, using `tools/run-mut.sh`. Output is in `runs/mutations.txt`. The test set was `selection`, `grid-snap-clip-edges` and `grid-edges`; (d) also ran `grid-snap-ui`, `-loop-drop`, `-position`, `-edit` and `gesture-guard`.

| # | C's mutation | Result | Expected |
|---|---|---|---|
| base | unmutated round-55 copy | 3 files / 62 passed | — |
| (a) | `const requestedStart = false ? original.start : moveStartOnGrid(…)` | **CM9c, CM9d, CM9e** fail; all 59 existing `it` green. This independently reproduces A's red run. | ✔ |
| (b) | (a) + `timeDelta: timeLocked ? 0 : requestedStart - original.start` | **CM9e only** fails | ✔ |
| (c) | (a) + `moveClip(gesture.before, original.id, timeLocked ? original.start : requestedStart)` | **CM9c, CM9d** fail | ✔ |
| (d) info | **snapshot** caller with `Math.max(0, start + delta)` in the Snap-off branch | **all green**, 8 files / 170 | — |
| (d2) info | round-55 caller with the same edit | all green, 8 / 170 | — |

The scratch file was restored afterwards (`cmp` same).

**INFO-R55-FREE-ROUND-UNGUARDED (info for B; not a defect):** on the snapshot caller, mutation (d) also fixes CM9c–CM9e and breaks none of 170 tests. So the reason B gave for rejecting this alternative ("pixel noise in Snap-off starts") is **not covered by any test**. The jsdom drags use whole pixels at 40 px/s, so no sub-ms noise can appear in them. Only a browser drag with fractional pointer coordinates, or a unit test with a fractional `dx`, could tell the two fixes apart. D-29z20 is still a reasonable choice. B may want one guarding test for `roundTime` in the Snap-off branch.

### 3.2 Probes

`runs/probes.txt` runs the round-52/53/54 probes plus the new round-55 probes against two trees: the round-55 tree, and the same copy with the snapshot `ArrangementClip.tsx`.

| Probe | Round 55 | Snapshot caller | Expected |
|---|---|---|---|
| PS-TOUCH | stems **6.0004**, `გადატანა ხაზზე — სტემები: start 00:06.000.`, Undo `გადატანა ხაზზე — სტემები` | refused, stays on music 6.0004 | ✔ (C-R54-01 fixed) |
| PS-FREE | stems **6.0004** | stems 6 | ✔ |
| PS-SAME | music **6.0004**, `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`, undo `null` | music 6, Undo `კლიპის გადატანა` | ✔ (C-R54-02 fixed) |
| P3x / P3x-END | stems 6.0004 / start 8.4004, end 10.4004 | — | unchanged ✔ |
| PF-FREE | stems 7 | — | unchanged (accepted D-29z19 side effect) ✔ |
| PG-GROUP2, P1, P1m, P1c, P1s, P2, P2m, P3s, P4, P5 | identical to round 54 | — | ✔ |
| PS-GROUP (B fixture: m1 music 6.0004 + t2 sfx 2, anchor to stems) | refused, `გადატანა (2): ცვლილება არ მოხდა …`; m1 6.0004, t2 2 | identical | ✔, but **not discriminating** (below) |
| **PS-GROUP-B** (C fixture: m1 music 6.0004 + t2 music 2, Shift anchor to stems) | both on stems, **6.0004** and **2** exact, `გადატანა (2): start 00:06.000.` | identical | ✔ (the group path is unaffected) |
| PS-MIDDRAG (same lane: plain step, then a Shift step) | music 6.0004, no history, no-change status | music 6, Undo `კლიპის გადატანა` | ✔ |
| PS-MIDDRAG-X (stems: plain step, then a Shift step) | stems 6.0004 | stems 6 | ✔ |
| PS-GHOST (Shift hover over stems next to st0 0–6.0004) | ghost on stems, `blocked=false`, `left: 240.016px` (= 6.0004 × 40), `data-ghost-start` `6.000` | ghost `blocked=true`, `left: 240px` | ✔ |
| PS-WHOLE (whole-ms 7.3, Shift to stems next to st0 0–7.3) | stems 7.3 | identical | ✔ (whole-ms unchanged) |
| PS-BEFORE / PS-BEFORE-WHOLE (Shift onto an overlapping stems clip 5–7) | refused; final status `კლიპის გადატანა: ცვლილება არ მოხდა …` | identical | see the info item below |

Notes:
- **PS-GROUP as B specified is trivially true.** The group is refused because t2 would have to leave the last lane, so both starts are unchanged on both trees. PS-GROUP-B is the real check.
- **PS-GHOST confirms §0.1:** the Shift ghost is drawn at the exact start. `data-ghost-start` reads `6.000` only because of `toFixed(3)`. PS-GHOST, PS-MIDDRAG and PS-MIDDRAG-X cover A's reviewer Low A-R55-REVIEW-SHIFT-MIDDRAG-TEST at probe level. They are not committed tests.
- **INFO-R55-REFUSAL-STATUS-ON-RELEASE (Low/info, pre-existing on both trees, whole-ms and sub-ms):** when a refused cross-lane move is released (PS-BEFORE, PS-GROUP, and round-54 PS-TOUCH), the final status is the generic `… ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`. The refusal reason shown during the hover is replaced. This round did not cause it. It is listed for B to triage.

## 4. G55-1 — gates: PASS

`c-round-55/gates/summary.txt`. All runs were quiet and sequential, with `node.exe` 9 throughout.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npx biome check ./app --diagnostic-level=error` | 5 errors, all `format`: `StudioWorkspace.tsx`, `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `auth.ts`. This is the baseline CRLF list. |
| `npx biome check ./app` | 5 errors / 218 warnings / 1 info (= baseline) |
| Biome on the 2 owned code/test files | 0 diagnostics, rc 0 |
| `npx vitest run` (19:59:46) | **87 files / 1504 passed**, rc 0 |
| `npm run build` | rc 0 (✓ built) |
| `npm run verify` (attempt 1, 20:01:48) | **rc 0**, 87 / 1504, build ✓ |

C-R48-01 did not recur in this round's runs (one full run plus one verify, 0 timeouts). That is one quiet pass; it does not close C-R48-01. The frozen suites of §4.8 were all green inside the full run and the verify run; I did not run them separately.

## 5. Browser acceptance — not run (environment)

The server returned `000` at 19:55, 20:04 and 20:06 +04 (`server-checks.txt`). No browse state was created and no gstack or Playwright session ran. Nothing below is a PASS:

- **R55-SHIFT:** SH-CROSS, SH-SAME, SH-NOTE. V was not measured, so it is unknown whether the browser case can test sub-ms starts at all.
- **R52-EDGE:** EG-OFF, EG-1, EG-VIDEO, EG-LINE, EG-ALT, EG-ALT-ON, EG-CROSS, EG-GROUP, EG-1280.
- **R54-CROSS:** CX-VIDEO, CX-NOTE.
- **R53-LANE:** LN-TOUCH, LN-AFTER, LN-SHORT.
- **R52-TRIM:** ET-START, ET-END, ET-ALT, ET-CLAMP.
- **R52-PLAY:** EP-VIDEO, EP-OFF, EP-CROSS, EP-SHIFT. No real audio graph, source `when`/`dur`, meter or video transport was measured.
- **R52-REG:** the browser spot checks SN-1, NU-1, the stage-2 trim, RU-1, LB-MOVE, LD-1, the whole-ms Shift check and the clip-body click; REG-HYD (C-R23-01 NUL count).
- **G55-3, the anonymous workspace and purchase protection:** `/studio-lab` direct and via the header link; no request to `/api/studio-token`, recording, download or R2 from workspace code; anonymous token request → 401; `/studio/middle-east` → "Sign in required". **This is the fourth round without runtime evidence that premium auth is not bypassed.** The unit route tests (`download-routes.test.ts`, unchanged, protected) pass inside the full run. That is not browser evidence.
- **Also not run:** the full find → add → fit video → export flow with WAV data, duration and sample checks; the FB-01..FB-16 stage regression; video sync.

## 6. Ableton table (two verdicts)

Source: B's capture `b-round-46/ableton-6.7-6.10-20261016.txt` (Live 12 manual, ch. 6, §6.7 and §6.10). C did not take a new capture, watched no video and used no Live installation.

| Behaviour | CZABA requirement (C) | Ableton conformance |
|---|---|---|
| Shift keeps the time when changing lanes | **Fixed at unit/probe level** (CM9c–CM9e, PS-TOUCH/FREE/SAME/GHOST/MIDDRAG); browser SH-* not run | No source → **unconfirmed**; CZABA decision R8-M |
| Clips snap to the editing grid | not run (browser; EG-LINE, SN-1) | Confirmed (6.7 text) |
| Clips snap to the edges of other clips | not run (browser); unit/probe P3x, P3x-END, P1* unchanged | Confirmed (6.7 text) |
| Snap distance / grid-vs-edge priority | not run (browser) | Unconfirmed (6.7 is silent); deliberate CZABA rule D-29z18 |
| Lock exactness (sub-ms), same lane and across lanes | unit/probe only (CM16, P3x, PS-*); CX-VIDEO not run | No source → unconfirmed; CZABA decision |
| Which edge pairs count on the same lane | not run (LN-SHORT) | Unconfirmed |
| Grid off → no snapping | not run (EG-OFF) | Confirmed for subdivisions; unconfirmed for objects |
| Alt bypasses / temporarily enables | not run (EG-ALT, EG-ALT-ON, ET-ALT) | Confirmed (6.10 text) |
| Locators / time-signature targets | not applicable yet (SRW-16) | Confirmed in 6.7; not applicable |

## 7. Bugs and status of open items

- **C-R54-01 (Medium):** fixed at unit and probe level. Browser SH-CROSS is pending.
- **C-R54-02 (Low):** fixed at unit and probe level. Browser SH-SAME is pending.
- **C-R53-01:** fixed at unit and probe level. Browser CX-VIDEO is pending; the sub-ms case may stay unit-only, depending on CX-NOTE.
- **C-R48-01:** no recurrence in one full run plus one verify. It stays open until root answers §6.2.
- **New info for B:** INFO-R55-FREE-ROUND-UNGUARDED and INFO-R55-REFUSAL-STATUS-ON-RELEASE (§3).
- **No new reproducible defect** was found in the round-55 diff.

## 8. Commit readiness (for root)

On the code side, the 17-path round 50–55 diff has no open C defect:
- C-R54-01/02 are fixed at unit and probe level, and C-R53-01 at unit level.
- Gates: tsc 0, 87/1504, build and verify rc 0, Biome at baseline.
- Integrity: frozen and protected files OK.

**However, stage-4a browser evidence does not exist, and G55-3 (premium auth not bypassed) has not run for four rounds.** C does not write PASS. Committing on unit evidence alone is root's decision. Before stage 4b, root must start the Store dev server and the backend (ENV-VITE-ENOMEM-R53) so that C can run §4.4–§4.9.

## 9. Carried items (unchanged)

- **From `root-pre-push-review.md`:** RF3-1, RF3-2, R5-L6 (video sync FAILs) and G3-R / G3-3 / G3-shots (no runtime evidence). C-R27-01 is in that scope.
- **From `publication-checkpoint.json`:**
  - SRW-21: the purchased loader hardcodes `middle-east`, so do not claim that every product's stems work.
  - Portable paths in instruction files.
  - The scrollbar refinement request.
  - The library/stems parity requirements.
- **Open C bugs:** C-R51-01, C-R51-02, C-R52-T1, C-R41-01, C-R27-01, C-R6-02, C-R8-01, C-R23-01, C-R38-01.
- **Root items:** C-R48-01 config decision; ARCH-CHECKPOINT-SRW14-PREFS (time-precision question; A's reviewer signal 3 supports it); GSTACK-NO-MOUSE; stray `store/nul`.

## Evidence

All under `tmp/studio-real-loop/c-round-55/`:
- `checkpoint.md`, `g55-2-start.txt`, `g55-2-end.txt`, `diff-vs-snapshots.txt`;
- `runs/mutations.txt`, `runs/probes.txt`;
- `gates/{summary,tsc,biome-errors,biome-app,biome-owned,full-vitest,build,verify}.txt`;
- `tools/run-mut.sh`, `tools/mutate.cjs`; the probe source is in `scratch/mut/app/lib/arrangement/__tests__/c-probe-r55.test.tsx`. The scratch junction has been removed and `store/node_modules` is intact (618).
