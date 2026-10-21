# C — Round 53 verification: SRW-14 stage 4a finish (FB-13), D-29z18 — exact sub-ms edges (C-R52-02), lane rule (C-R52-03), GS3/GS13 (C-R52-01)

Verifier: C (independent) · 2026-10-17, 17:27 → 17:50 +04 · Task: `current-task.md` (round 53)

**Evidence:**
- `c-round-53/gates/` (`verify-2.txt`, `timeouts-alone.txt`, `biome.txt`) and `c-round-53/verify.txt` (first verify run);
- `c-round-53/runs/` (`mutations.txt`, `probes.txt`);
- tools: `c-round-53/tools/` (`run-mut.sh`, `mutate.cjs`);
- checkpoint: `c-round-53/checkpoint.md`;
- probe file (scratch only, outside `store/`): `c-round-53/scratch/mut/app/lib/arrangement/__tests__/c-probe-r52.test.tsx`, which contains the round-52 probes plus the new `C probe r53` describe blocks.

I re-ran every check myself. I made no app edits, commits, installs or deploys, did not start or stop any server, and changed no settings.

## taskStatus: **BLOCKED** (environment)

The offline part is **sound**:
- R53-S PASS;
- R53-U PASS: every mutation is killed except (g) on CT8, which is a spec inconsistency;
- G53-1 PASS on the quiet run;
- G53-2 PASS.

The round's stated deliverable, however, is that "C runs the complete round-52 browser acceptance", and **no browser ID could run**.
- `http://127.0.0.1:5173/studio-lab` returned `000` at 17:27, 17:41 and 17:47.
- `netstat` shows nothing listening on :5173 or :5199.
- Per §5, C does not start servers. `c-round-53/c-browse.json` was therefore never created; no gstack, PW or browser was used.
- **Purchase protection (G53-3) is again not re-verified in a browser this round.** The 4 protected-file sha256 values are unchanged, but that does not substitute for G53-3.

No new defect in this round's change was found. Two observations from probes go to B (C-R53-01 Medium, which is the known frozen-code gap; INFO-R53-NARROW-GAP, which is by design).

## 0. Environment and method

- HEAD `038ed5a45f94596a264c14c4ec834607cb407948` at the start (17:27) and at the end (17:47).
- Baseline case **(A)**. Rounds 50–52 are still uncommitted.
- node.exe: 9 in every run.
- **Scratch:** `c-round-53/scratch/mut/` holds a copy of the working-tree `app/` and my own `vitest.config.mts`.
  - The `node_modules` junction was created with `cmd //c mklink /J` (stdin `/dev/null`, no `MSYS_NO_PATHCONV`).
  - It was removed with `cmd //c rmdir`. `store/node_modules` still has 618 entries.

## 1. G53-2 — tree integrity: **PASS**

- `git status --short` has **15 lines**: the 14 baseline paths plus ` M app/lib/arrangement/__tests__/grid-snap-ui.test.tsx`.
  - That file is the §0.3 narrow-grant file. It was tracked and clean at baseline, so editing it necessarily adds a ` M` line.
  - B's §3.1 note "all 6 owned files already appear in the 14" is wrong for this file (A §7.1).
  - **Not a stop:** the extra path is explicitly granted.
- Frozen list `b-round-52-r53-tree-sha256.txt`: 407 entries, **0 non-OK**, at the start and at the end. This confirms that nothing else moved.
- Snapshots `SHA256SUMS.txt`: 0 non-OK.
- Protected files: 4/4 OK at the start and at the end.
- Builds changed no tracked path (still 15 lines).

## 2. R53-S — static: **PASS**

Method: `diff -u --strip-trailing-cr` against `b-round-52-r53-snapshots/`.

**`grid.ts`**
- Snapshot l.1–87 is byte-identical. The first hunk is `@@ -85,24 +85,66 @@`; the added lines start after `formatGridDivision`.
- New private helpers `toWholeMicroseconds` and `sortedUniqueEdgeTimes`: sort ascending, then µs-dedupe against the last kept value, so the smallest value is kept.
- `clipEdgeTimes` pushes the exact `start` and `start + duration`.
- **One** new export, `clipEdgeTargets(clips, excludeClipId, laneTrackId)`, per R3:
  - other-lane edges come from `clipEdgeTimes`;
  - lane-clip ends go to `startEdges`, lane-clip starts to `endEdges`.
- The private `nearestGridOrEdge`:
  - the grid line is the initial best;
  - the µs distance is compared with strict `<`;
  - candidates are filtered by µs ≥ 0 and sorted;
  - it returns the exact candidate.
- `snapTimeToGridOrEdges` keeps its signature. `snapMoveStartToGridOrEdges` gains only the optional `endEdges = edges`.
- The export list (grep `^export`) = the baseline plus `clipEdgeTargets`.

**`ArrangementClip.tsx`** — exactly 4 hunks:
- the import (`clipEdgeTimes` → `clipEdgeTargets`);
- `moveStartOnGrid(…, startEdges, endEdges)`, with the free branch byte-identical;
- the single move uses `clipEdgeTargets(gesture.before.clips, original.id, hoverTrackId)`;
- the trim `requested` uses `clipEdgeTargets(…, original.trackId)[trimStart ? 'startEdges' : 'endEdges']`, in the snapped branch only.

The group branch, `groupDeltaOnGrid`, the range branches, the `pointercancel` guard, `beginGesture`, the JSX and the props have no hunk.

**Tests**
- `grid-edges.test.ts`: the import is extended (wrapped by the Biome width; A §7.4). CE1–CE3 are byte-identical, and the CE4–CE6 `describe` is appended.
- `grid-snap-clip-edges.test.tsx`: one pure append at l.573: `MOVE_BLOCKED_TEXT`, `exactClipEnd`, and CM12–CM15, CT7, CT8.
- `grid-snap-ui.test.tsx`: only the GS3 and GS13 titles and bodies differ, exactly per §0.3: 8.5, `'8.500'`, undoAll 2, then 7; and 156 → 8.5 not blocked, 176 → blocked, kept at 8.5, undoAll 1.

**Doc 048**
- Status line exactly `Round 52–53 — D-29z17, D-29z18; C-ის შემოწმებას ელოდება`.
- Appended `## Round 53 — შესწორებები (D-29z18)`, containing:
  - კონტექსტი;
  - მიდგომა, including the rejected pixel radius and "nearest placeable";
  - one Mermaid diagram;
  - შეცვლილი ფაილები, პრობლემები;
  - ტესტირება, with the REAL-mouse (PW) note;
  - the Ableton rows, with distance and same-lane pairs marked **დაუდასტურებელი** plus the line "დაუდასტურებელ სტრიქონებზე არ ითქმის…";
  - TODO 4b, 4c (C-R52-T1) and R52-T.
- Earlier text is unchanged (the diff shows only l.4 and the 108a append).

**Line endings and banned content**
- LF only, 0 CRLF: grid.ts 172, ArrangementClip 692, grid-edges 81, clip-edges 667, grid-snap-ui 733, doc 209.
- Banned content in the added lines: 0 hits (no `any`, `@ts-ignore`, `as` assertion, `//`, hex colour, fake timers or snapshots).

## 3. R53-U — unit tests, mutations, probes: **PASS**

**A's red run** (`a-round-53/red-run.txt`, read): 9 failed / 43 passed.
- Red: CE4, CE5, CE6, CM12, CM13, CM14, CM15, CT7, CT8.
- Green: CE1–CE3, CM1–CM11 incl. CM9b, CT1–CT6, CC1–CC2 and GS1–GS14, including the new GS3 and GS13.
- This matches §2.2. The green run is 52/52.

**C base:** 3 files, 52/52 in my scratch copy (`runs/mutations.txt`).

**Mutations** (C's own strings; `tools/run-mut.sh` → `runs/mutations.txt`, node.exe 9):

| # | C's mutation | Must fail | Failed | Verdict |
|---|---|---|---|---|
| (a) | distances `Math.round(…·1e3)·1e3` (whole ms), both sites | CE4 (row 2), CM13 | CE4, CM13 | killed |
| (b) | `return Math.round(best·1000)/1000` | CE4, CM12, CT8 | CE4, CM12, CM13, CT8 | killed |
| (c) | other-lane filter `trackId !== lane \|\| id !== exclude` (lane clips give both edges to both lists) | CE5, CM14, CM15, CT7 | CE5, CM14, CM15, CT7 | killed |
| (d) | laneClips = all others; other-lane edges = ∅ | CE5, CM2 | CE5, CM2, CM6 | killed |
| (e) | move passes `original.trackId` | CM15 | CM15 | killed |
| (f) | trims use `clipEdgeTimes(gesture.before.clips, original.id)` | CT7 | CT7 | killed |
| (g) | `clipEdgeTimes` pushes ms-rounded values | CE6, CT8 | **CE6 only; CT8 survives** | partial: **spec inconsistency confirmed** (see below) |
| (g2) C extra | the shared sort/dedupe rounds every list to ms | — | CE6, CM13, CT8 | killed (CT8 does guard exactness) |
| (h) | dedupe by `time !== last` | CE6 | CE6 | killed |
| (r1) | nearest helper candidate list not sorted | CE2 | CE2 | killed |
| (i) | cancel guard → `event.type.length > 0` | CC1 | CC1 | killed |
| (j) | `distance < bestDistance − 500` (±500 µs tie window, line wins) | CM13, CE4 row 2 | CE4, CM13 | killed |
| (k) | group branch snaps via `snapMoveStartToGridOrEdges` with `clipEdgeTargets(…, hoverTrackId)` | CM10 | CM10, GS5b | killed |

**(g) on CT8:**
- CT8's neighbour is on the **same** lane. Under R3 its start reaches `endEdges` directly from `laneClips` and never passes through `clipEdgeTimes`.
- So the §2.2 expectation "(g) fails CT8" contradicts R3. This is not a code or test defect.
- → **B:** re-word (g), or add an **other-lane** sub-ms trim test ID if that guard is wanted (suggested: a right trim onto a 9.6004 start on another lane).

**Probe re-run** (round-53 tree; `runs/probes.txt`):

| Probe | Expected (§4.2) | Result | Verdict |
|---|---|---|---|
| P1 / P1m (m1 length 2.0004 → m2 at 10.4) | ≈ 8.3996, not blocked | **8.3996**; `კლიპის გადატანა: start 00:08.400, length 00:02.000, source offset 00:00.000.`; Undo `კლიპის გადატანა` | PASS (C-R52-02 fixed same-lane) |
| P1c (control, length 2) | 8.4 | 8.4, normal text | PASS |
| P1s (m0 ends 6.0004) | 6.0004, not blocked | **6.0004**; `… start 00:06.000 …` | PASS |
| P2 / P2m (m2 12–12.5) | 8, normal status | **8**; `კლიპის გადატანა: start 00:08.000, length 00:04.000, source offset 00:00.000.`; not blocked | PASS (C-R52-03 fixed) |
| **P4** C new: left trim onto a previous end at 6.8504 | — | start **6.8504**, offset 0.1504, end 11.3, normal trim text | PASS. This fills R52's "trim path not probed at runtime" gap |
| **P3x** C new: cross-lane move (music → stems) where a stems clip ends at 6.0004, raw 6.05 | — | **refused**: stays on music at 2, `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` | → **C-R53-01** |
| P3s same-lane control of P3x | — | 6.0004, normal text | contrast |
| **P5** C new: narrow gap (m1 0.3 s; a 3.3–3.4, b 3.5) raw 3.4 | — | no move (start 0, "ცვლილება არ მოხდა"); stage 1 would place at 3 | → **INFO-R53-NARROW-GAP** (by design) |

## 4. G53-1 — gates: **PASS** (on the quiet run; C-R48-01 recurrence recorded)

| Gate | Result | Evidence |
|---|---|---|
| `npm run verify` run 1 (17:28–17:33, node.exe 9) | **rc 1**: agents:check, test:agents, lint and typecheck pass; vitest 87 files, **2 failed / 1495**. Both failures are `Test timed out in 5000ms`: `grid-snap-loop-drop` SD1 and `track-layout` "writes no history for fold…". Build was not reached. **Not quiet:** my `cp -r app` and `mklink` ran in parallel during the first minute | `c-round-53/verify.txt` |
| The 2 timed-out files alone | 2 files, **63/63** passed | `gates/timeouts-alone.txt` |
| `npm run verify` run 2 (quiet, 17:41, node.exe 9) | **rc 0**. tsc 0; vitest **87 files / 1497, 0 failures**; build ✓ (21.03 s / 5.43 s) | `gates/verify-2.txt` |
| Biome `./app` (read-only) | 5 errors, all `format` on the baseline CRLF list (StudioWorkspace, auth-bugs, grid.test, render-budget, auth.ts) / 218 warnings / 1 info | `gates/biome.txt` |
| Biome, the 5 owned code/test files | 0 diagnostics, rc 0 | `gates/biome.txt` |
| Frozen suites (§4.8) | all green inside the quiet full run | `gates/verify-2.txt` |

**C-R48-01** (Low) recurred: 5 s timeouts under load, in different files than A's pair. The files are untouched this round and green alone.

## 5. Browser acceptance — **not run (environment: dev server down)**

| ID group | Status |
|---|---|
| R52-EDGE: EG-OFF, EG-1, EG-VIDEO, EG-LINE, EG-ALT, EG-ALT-ON, EG-CROSS, EG-GROUP, EG-1280 (REAL-mouse (PW)) | not run (environment) |
| R53-LANE: LN-TOUCH, LN-AFTER, LN-SHORT (REAL-mouse (PW)) | not run (environment). LN-SHORT's logic is covered by unit CM14 plus probe P2/P2m only |
| R52-TRIM: ET-START, ET-END, ET-ALT, ET-CLAMP (REAL-mouse (PW)) | not run (environment) |
| R52-PLAY: EP-VIDEO, EP-OFF (real audio graph: source `when`, SFX meter, stop at V) | not run (environment). **No audio output was measured this round** |
| R52-REG browser part: SN-1, NU-1, SE3-like, RU-1, LB-MOVE, LD-1, clip-body click → 8.000, G/division texts | not run (environment). The unit part is green (§4) |
| REG-HYD (hydration warnings, C-R23-01 NUL count) | not run (environment) |
| G53-3 (anonymous `/studio-lab` via direct URL and the header link, no token/R2/Authorization requests, `/api/studio-token` → 401, `/studio/middle-east` "Sign in required") | not run (environment). **Purchase protection is not re-verified in a browser for a second round** |
| A browser smoke | also not run by A (`000`) |

## 6. Findings for B

### C-R53-01 — Medium (known gap, frozen code, not a round-53 regression): a cross-lane move cannot lock onto a sub-millisecond edge of the target lane

This is A's code-reviewer finding `A-R53-REVIEW-CROSSLANE-SUBMS`, now reproduced.

**Steps** (mounted StudioWorkspace, jsdom, probe P3x):
1. Set up m1 on music at 2 (length 2) and st0 on stems at 0, length **6.0004**. Snap on, 1 s, 40 px/s.
2. Drag m1's header from x 80 by +162 px with y on the stems lane (raw 6.05).

**Expected:** m1 lands on stems at 6.0004, touching st0's end, as the same-lane control P3s does.

**Actual:** the move is refused. m1 stays on music at 2, with `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`

**Cause:**
- `planClipLaneMove` (`selection.ts`, frozen) rounds the time delta to ms, so 6.0004 → 6.000 overlaps st0 by 0.4 ms.
- Purchased or decoded stems keep the raw `buffer.duration`, so FB-13's "lock onto it" fails cross-lane for real assets.

**Note for B:** schedule it as its own bounded task, per A's architecture note: keep an exact single-clip delta, and the CM15 variant with a 6.0004 target-lane edge commits.

### INFO-R53-NARROW-GAP — info (by design, D-29z18 §0.4)

The lane rule removes always-overlapping pairs, but the nearest remaining candidate can still be unplaceable when the gap between two lane clips is shorter than the dragged clip.

**Probe P5:**
- Fixture: m1 is 0.3 s long; a sits at 3.3–3.4 and b at 3.5. Raw 3.4.
- Result: a's end, 3.4, wins at distance 0 but overlaps b, so m1 is not moved.
- Stage 1 (grid only) would place it at 3.

B explicitly rejected "nearest placeable", so this is not a bug. It is evidence for R52-T(1) (magnet strength) for the Tech Lead.

### Spec notes

- **SPEC-R53-G-CT8:** mutation (g) cannot reach CT8 under R3 (§3).
- **SPEC-R53-STATUS-15:** §3.1's expected `git status` should list 15 lines for case (A).

## 7. Ableton two-verdict table (§4.9)

Source: Live 12 manual ch. 6, §6.7/§6.10, B's capture `b-round-46/ableton-6.7-6.10-20261016.txt`. No video was watched, no Live installation was used, and C did no new web capture.

| Behaviour | CZABA requirement (this round) | Ableton conformance |
|---|---|---|
| Clips snap to the editing grid | Unit PASS (CM3, CM7, GS3 first drag, CM14). Browser EG-LINE/SN-1 **not run** | **დადასტურებული** (6.7 text) |
| Clips snap to the edges of other clips | Unit and probe PASS for single moves and trims, same-lane and other-lane (CM1/2/6/8, CT1–3/6, P1/P1s/P4). Cross-lane onto a sub-ms target edge **fails** (C-R53-01). Browser EG-1/EG-VIDEO/EG-CROSS/LN-*/ET-* **not run** | **დადასტურებული** (6.7 "edges of other clips"); groups/drop are 4c |
| Snap distance / grid-vs-edge priority | Implemented as specified (nearest in µs, tie → grid, then the earlier edge; no radius); proven by (a), (j) and (r1), and by GS3/GS13 | **დაუდასტურებელი** (6.7 does not say) |
| Exactness of the lock (sub-ms) | Unit PASS (CM12, CM13, CT8, CE4/CE6; probes P1m, P1s, P4). Except cross-lane (C-R53-01) | **No source** (CZABA decision) |
| Which edge pairs count on the same lane | Unit PASS (CE5, CM14, CM15, CT7; probes P2/P2m). LN-SHORT browser **not run**. Narrow-gap residual by design | **დაუდასტურებელი** (6.7 does not say) |
| Grid off → no snapping | Unit PASS (CM4, GS2). EG-OFF **not run** | subdivisions **დადასტურებული** (6.10); objects with the grid off **დაუდასტურებელი** → CZABA choice |
| Alt bypasses / temporarily enables | Unit PASS (CM5, CM6, CT5). EG-ALT/EG-ALT-ON/ET-ALT **not run** | **დადასტურებული** for the grid (6.10); extending it to edges is a CZABA decision (**დაუდასტურებელი**) |
| Locators / time-signature targets | — | **არ ეხება** (SRW-16) |

## 8. Carried items (unchanged unless stated)

- **Closed this round:**
  - **C-R52-01**: GS3/GS13 re-specified, and verify is green on the quiet run;
  - **C-R52-02**: same-lane moves and trims are exact (P1m, P1s, CM12, CM13, CT8, P4); the cross-lane remainder is **C-R53-01**;
  - **C-R52-03**: always-overlapping pairs are removed (P2, P2m, CM14, CM15, CT7).
- **Open C bugs:**
  - C-R53-01 (new, Medium, known);
  - C-R52-T1 (round 55);
  - C-R51-01 and C-R51-02 (round 54);
  - C-R48-01 (recurred);
  - C-R41-01;
  - **C-R27-01 with RF3-1, RF3-2 and R5-L6** (`root-pre-push-review.md`: video-sync FAIL, not re-measured);
  - C-R6-02, C-R8-01, C-R23-01 and C-R38-01 (Tech Lead).
- **`root-pre-push-review.md` open items:**
  - R5-L3 is partial;
  - R5-L5, R5-E1, R6-S2 and R6-S3 are unit-only;
  - G3-R, G3-3 and G3-shots were not re-run at runtime;
  - the M1/M2 sync levers.
- **`publication-checkpoint.json` `followupReview`:**
  - the purchased Studio loader hardcodes `middle-east` (SRW-21; do not claim that every product's stems work);
  - the instruction files need portable paths.
  - The `scrollbarUserRequest` and `libraryUserRequest` (SRW-11/12, real demo stems, find → stems folder → preview → drag) status belongs to B's `feature-status.md`. C did not re-verify them.
- **Not run this round:**
  - video sync;
  - the full find → add → fit video → **export** flow: no WAV data, duration or sample-integrity measurement this round;
  - the FB-01..FB-16 stage regression;
  - `test:e2e:smoke` (root);
  - a real-browser `pointercancel`.
- **Root:**
  - ENV-DEV-SERVER-DOWN (now rounds 52 **and** 53);
  - GSTACK-NO-MOUSE;
  - ARCH-CHECKPOINT-SRW14-PREFS;
  - the CRLF Biome errors;
  - fake Bearer → 500.
- **Tech Lead:** R52-T(1)/(2). INFO-R53-NARROW-GAP is added as input to (1).

## 9. Commit readiness for root

- Root's own rule is "do not commit rounds 50–52 before round-53 C PASS". **This round is BLOCKED, not PASS, so by that rule rounds 50–53 are not commit-ready.**
- **C has no offline objection:**
  - the static diff conforms to §0.2;
  - the frozen list is 407 OK and the protected files are 4/4;
  - `npm run verify` rc 0 on the quiet run (87/1497/0, build OK);
  - Biome is within the baseline;
  - every mutation is killed except the spec-inconsistent (g) on CT8.
- The missing part is the entire browser acceptance, including purchase protection. Relaxing the rule is root's decision, not C's.

## 10. Next steps

1. **Root:** start `http://127.0.0.1:5173` (and the backend, if G53-3 needs `/api/studio-token`). Then re-dispatch C for the browser half only, in order:
   - R52-EDGE → R53-LANE (LN-SHORT) → R52-TRIM → R52-PLAY;
   - then R52-REG/REG-HYD → G53-3.
   - The offline items do not need re-running unless the tree changes. Check the frozen list and the 6 owned files' hashes first.
2. **B:**
   - schedule C-R53-01 (exact cross-lane delta) as its own task;
   - fix the (g)/CT8 expectation and the 15-line status note in the next task;
   - pass INFO-R53-NARROW-GAP to R52-T.
