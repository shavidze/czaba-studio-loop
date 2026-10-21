# C — Round 52 verification: SRW-14 stage 4a (FB-13), D-29z17 — clips snap to other clips' edges; clip-body cancel; C-R51-T1

Verifier: C (independent) · 2026-10-17, 15:41 → 16:05 +04 · Task: `current-task.md` (Round 52)

**Evidence:**
- `c-round-52/gates/`, `c-round-52/runs/`;
- tools: `c-round-52/tools/` (`run-mut.sh`, `run-mut2.sh`, `mutate.cjs`);
- checkpoint: `c-round-52/checkpoint.md`;
- probe test (scratch only, outside `store/`): `c-round-52/scratch/mut/app/lib/arrangement/__tests__/c-probe-r52.test.tsx`.

I re-ran every check myself and did not rely on A's numbers. I made no app edits, commits, installs or deploys, and did not start or stop any server.

## taskStatus: **FAIL**

1. **G52-1 fails.** The full vitest run has 2 failures (GS3, GS13 in the frozen `grid-snap-ui.test.tsx`), so `npm run verify` exits **1**. I confirmed independently that this is a **spec conflict** in D-29z17 §0.4, not an A defect (**C-R52-01**).
2. **No browser ID could run.** The dev server at `http://127.0.0.1:5173` was **down for the whole session**: curl returned `000` at 15:41, 15:43, 15:47, 15:50, 15:52, 16:02, 16:03 and 16:06, and nothing was listening on :5173 or :5199. Per the task (§5) and the rules, C does not start servers. R52-EDGE, R52-TRIM, R52-PLAY, the browser part of R52-REG, REG-HYD and G52-3 are therefore **not run (environment: dev server down; root restarts it)**. They are listed under `blocked`, not FAIL.
3. **New defects from my probes** (mounted jsdom, scratch copy):
   - **C-R52-02** (Medium): a clip whose length is not a whole millisecond cannot butt-join a neighbour on the same lane.
   - **C-R52-03** (Low): a same-lane candidate that can't be placed shows the blocked text where stage 1 moved freely.

The offline part of the change is sound: the static diff matches §0.2, the red run reproduces, and every mutation is killed.

## 0. Environment and method

- HEAD `038ed5a45f94596a264c14c4ec834607cb407948` at the start (15:41) and at the end (16:03). Baseline case **(A)**.
- Rounds 50–51 were **not** committed during this round.
- node.exe: 10 at the start, 9–14 during my runs. Each run file records its count.
- **No gstack, PW or browser was used**, because the server was down. Browse state `c-round-52/c-browse.json` was never created.
- **Scratch:** `c-round-52/scratch/mut/` holds a copy of `app/`, my own `vitest.config.mts` and a `node_modules` junction.
  - I created the junction with `cmd //c mklink /J`, without `MSYS_NO_PATHCONV`, and with stdin from `/dev/null`.
  - I removed it with `cmd //c rmdir`. `store/node_modules` still has 618 entries, and the scratch has no junction left.

## 1. G52-2 — tree integrity: **PASS**

Evidence: `gates/g52-2-start.txt`, `gates/g52-2-end.txt`, `gates/snapshots-check.txt`.

- `git status --short` = §3.1 case (A) exactly: the 11 baseline paths, plus `?? grid-edges.test.ts`, `?? grid-snap-clip-edges.test.tsx` and `?? doc 048`. This holds at the start and at the end.
- Frozen list: **407 entries, 0 non-OK**, at the start and at the end.
- Snapshots `SHA256SUMS.txt`: 3/3 OK.
- Protected files: 4/4 OK, at the start and at the end.
- `npm run build` changed no tracked path.

## 2. R52-S — static: **PASS**

Evidence: `gates/snap-diff.txt`, from `diff -u --strip-trailing-cr` against `b-round-51-r52-snapshots/`; `gates/static.txt`.

**`grid.ts`**
- `import type { ArrangementClip }`.
- The 3 exports: `clipEdgeTimes`, `snapTimeToGridOrEdges`, `snapMoveStartToGridOrEdges`.
- One **non-exported** helper, `nearestGridOrEdgeMs`:
  - the grid line is the initial best;
  - edge candidates `≥ 0` are sorted ascending;
  - a candidate replaces the best only if strictly nearer (`<`), so ties go to the grid and the earlier edge wins.
- Existing code is byte-identical (hunk `@@ -82,3 +84,57 @@` is a pure tail append).

**`ArrangementClip.tsx`** — exactly the allowed hunks:
- the `grid` import (+3 names);
- `moveStartOnGrid(start, delta, duration, snapStep, edges)`, with the free branch unchanged;
- the single-move call (`original.duration`, `clipEdgeTimes(gesture.before.clips, original.id)`);
- the trim `requested`;
- the `event.type !== 'pointercancel'` guard around `seekTo` in the range `!moved` branch.

`groupDeltaOnGrid`, the group branch, the range move branch, `beginGesture`, the JSX and the props have no hunk.

**`grid-snap-loop-drop.test.tsx`**
- One hunk, `@@ -679,3 +679,75 @@`, with only `+` lines: the helper `moveBraceThenRelease` and a `describe` with SL10, SL11, SL7b and SL7c.
- The 23 existing `it` blocks are untouched. The file has 27 `it` in total.

**Line endings** (counted with node):

| File | Line endings |
|---|---|
| `grid.ts` | LF 140, 0 CRLF |
| `ArrangementClip.tsx` | LF 687, 0 CRLF |
| loop-drop test | LF 753, 0 CRLF |
| `grid-edges.test.ts` | LF 38, 0 CRLF |
| `grid-snap-clip-edges.test.tsx` | LF 573, 0 CRLF |
| doc 048 | LF 108, 0 CRLF |
| `StudioWorkspace.tsx` (not owned) | CRLF 1673/1673 |

There is no EOL churn. A's table gives `grid.ts` LF 135 (snapshot 84 + 56 = 140) and doc 048 105. These are report typos or doc edits made after the table; nothing changes.

**Banned content:** 0 real hits in the added lines and the 2 new tests (no `any`, `@ts-ignore`, `as` assertion, `//`, colour, fake timers or snapshots). The only grep hit was the word "any" inside the CM3 test title, a false positive. `grid.ts` has exactly 3 new `export` lines.

**Test counts:**
- `grid-edges.test.ts`: 3 `it` (CE1–CE3).
- `grid-snap-clip-edges.test.tsx`: 20 `it` (CM1–CM11, **CM9b** beyond §2.2, CT1–CT6, CC1–CC2). CM9b is an in-scope strengthening in A's own new file.

**Doc 048** has:
- the TEMPLATE header (status `Round 52 — D-29z17; C-ის შემოწმებას ელოდება`);
- კონტექსტი, მიდგომა, არქიტექტურა (one Mermaid diagram), შეცვლილი ფაილები, პრობლემები და გადაწყვეტები (with the GS3/GS13 conflict), ტესტირება (with the REAL-mouse (PW) method note and "real `pointercancel` not tested");
- the §4.9 table, with both "does not say" rows marked **დაუდასტურებელი** and "Locators" marked **არ ეხება**;
- TODO items: B GS3/GS13, the review Mediums, 4b, 4c and R52-T.

I found the quoted 6.7/6.10 sentences in `b-round-46/ableton-6.7-6.10-20261016.txt` (1 hit each: "Clips snap to the editing grid", "edges of other clips", "does not snap to meter subdivisions").

## 3. R52-U — unit tests and mutations: **partial — the red run, the 2 new files, the appended cases and mutations (a)–(q) PASS; the §4.2 bullet "frozen suites of §4.8 green" FAILS** (`grid-snap-ui` GS3/GS13 → C-R52-01). R52-U is therefore not listed as passed.

### Red run (`runs/red-run-c.txt`)

Setup: the 3 snapshot sources plus A's final tests, in my scratch copy.
- Result: **12 failed / 38 passed of 50**, which is A's result.
- Red: CE1, CE2 and CE3 (`not a function`), CM1, CM2, CM6, CM8, CT1, CT2, CT3, CT6 and CC1.
- Green: CM3, CM4, CM5, CM7, CM9, CM9b, CM10, CM11, CT4, CT5 and CC2, plus all 27 loop-drop tests (SL10, SL11, SL7b and SL7c are guards).

This matches §2.2 exactly.

### Green

The 3 files give **50/50** in my scratch copy of the working tree (`runs/mutations.txt`, base) and in the full run.

### Mutations (my own strings; `tools/run-mut.sh`, `tools/run-mut2.sh` → `runs/mutations.txt`, `runs/mutations-2.txt`)

Unmutated base: 50/50.

| # | C's mutation | Failed | Verdict |
|---|---|---|---|
| (a) | the edge comparison is never true (grid only) | CE1, CE2, CM1, CM2, CM6, CM8, CT1, CT2, CT3, CT6 | killed |
| (b) | move: end-touch candidates removed | CE2, CM1, CM8 | killed |
| (c) | move: start-touch candidates removed | 3 incl. CE2, CM2 | killed |
| (d) | `<` → `<=` (ties go to the edge) | 3 incl. CE1, CM7 | killed |
| (e) | own clip not excluded | 2 (CE3, CM11) | killed |
| (f) | first try: free branch through a 1 ms grid | none | **vacuous mutation (my error: a 1 ms line always ties at distance 0 and wins)**; replaced by (f2) |
| (f2) | Snap off: free move magnets to an edge within 0.25 s | CM4, CM5, CM9, CM9b | killed |
| (g) | first try: same 1 ms idea | none | vacuous (same reason); replaced by (g2) |
| (g2) | Alt with Snap on keeps a 0.25 s edge magnet (move and trim); Snap off untouched | CM5, CT5 | killed |
| (h) | the `≥ 0` filter disabled | 1 (CE2) | killed |
| (i) | the `pointercancel` guard never true | CC1 | killed |
| (j) | first try: group delta via edges with duration 0 (start-touch only) | none | **survives** → info **C-R52-T1** |
| (j2) | group delta via edges with the anchor duration (start- and end-touch) | CM10 | killed |
| (k) | `clipEdgeTimes` skips `trackId === 'video'` | CE3 | killed |
| (l) | `snapStep = step` (time lock uses edges) | **CM9b only**; CM9 survives | killed. This confirms A: CM9 alone cannot catch (l) |
| (m) | edges filtered to the clip's own lane (both sites) | CM2, CM6, CM8, CT2, CT3 | killed |
| (n) | `finishLoopGesture` re-runs `handleLoopPointerMove(event)` before commit | SL10, SL11 | killed. **C-R51-T1 closed** |
| (o) | brace move `resolveGridTime` removed | SL2, SL4, SL8, SL10, SL11, SL7b | killed |
| **(p)** C | the nearest edge is chosen ignoring the grid line whenever edges exist | CE1, CE2, **CM3, CM7** | killed |
| **(q)** C | trim edges from `getArrangement().clips` (live preview) instead of `gesture.before.clips` | none | **survives, expected** (a single-clip trim never moves another clip, so the edges are equal). Info, not a gap |

**Info C-R52-T1 (test gap, Low):** a group-move mutation that uses only start-touch edges survives CM10. Within 1 s of CM10's raw anchor 8.35 there is only an end-touch candidate (8.4). 4c will revise CM10 anyway; B should give the 4c tests both a start-touch and an end-touch target.

## 4. G52-1 — gates: **FAIL** (C-R52-01)

| Gate | Result | Evidence |
|---|---|---|
| tsc | exit 0 | `gates/tsc.txt` |
| full vitest (node.exe 9, quiet) | **87 files / 1488 tests: 2 failed, 1486 passed.** × GS3, × GS13 (`grid-snap-ui.test.tsx`). No load timeouts this time; C-R48-01 did not recur | `gates/vitest-full.txt` |
| `grid-snap-ui` alone | 2 failed / 18 passed. GS3 l.413 `expected 8.5 to be 8`; GS13 l.620 `expected 8.5 to be 8` | `gates/grid-snap-ui-alone.txt` |
| `npm run verify` (quiet, nothing in parallel) | **exit 1**. agents:check, test:agents, lint and typecheck pass; test:run gives the same 2 failures, so build was not reached inside verify | `gates/verify-build.txt`, `gates/verify-raw.txt` |
| `npm run build` (separately) | exit 0 (`✓ built in 29.83s` / `5.63s`) | `gates/build-raw.txt` |
| Biome `./app` | 5 errors (the baseline CRLF `format` list: StudioWorkspace, auth-bugs, grid.test, render-budget, auth.ts) / 218 warnings / 1 info | `gates/biome.txt` |
| Biome, owned 5 files | 0 diagnostics | `gates/biome.txt` |
| Frozen suites (§4.8) | all green in the full run **except `grid-snap-ui` (GS3, GS13)** | `gates/vitest-full.txt` |

The 1488 total is 1461 + 27 new `it`: CE 3 + mounted 20 + loop-drop 4.

**A's arithmetic, checked by hand** against `grid-snap-ui.test.tsx` DEFAULT_CLIPS (m1 music 7, length 4; m2 music 12.5–14.5):
- **GS3**, the second drag from 8 by +15 px: raw 8.375. The grid line 8 is 0.375 away. The end-touch 12.5 − 4 = 8.5 is 0.125 away. E2 gives 8.5.
- **GS13:** raw 8.4 → 8.5 (0.1 against 0.4). At raw 8.6 the grid line 9 would overlap, but the edge 8.5 fits, so the blocked status never appears.

D-29z17 §0.4 says "every stage 1–3 result with no nearer edge is unchanged"; that is true, but these two fixtures do have a nearer edge. The premise "R47 … tests stay green" is therefore false.

## 5. Browser acceptance — **not run (environment)**

| ID | Status |
|---|---|
| EG-OFF, EG-1, EG-VIDEO, EG-LINE, EG-ALT, EG-ALT-ON, EG-CROSS, EG-GROUP, EG-1280 | not run: dev server down |
| ET-START, ET-END, ET-ALT, ET-CLAMP | not run: dev server down |
| EP-VIDEO, EP-OFF (real audio graph: source `when`, SFX meter, stop at 6.008) | not run: dev server down |
| R52-REG browser spot checks (SN-1, NU-1, SE3-like, RU-1, LB-MOVE, LD-1, clip-body click → 8.000), REG-HYD | not run: dev server down |
| G52-3 (anonymous `/studio-lab`, no token/R2/Authorization requests, `/api/studio-token` 401, `/studio/middle-east` "Sign in required") | not run: dev server down. **Purchase protection is not re-verified this round.** The 4 protected files are unchanged (sha256), and this round's diff does not touch auth or routes |
| Real `pointercancel` in a browser | not run (also out of scope, §4.7); CC1 is unit-only |

Unit coverage of the same rules: CM1–CM11 and CT1–CT6 are green, and their mutations are killed. **That is not browser evidence; none of these browser IDs is PASS.**

Note for the re-run on L52:
- The demo SFX are generated at whole seconds: `demo-synth.ts`, 48 000 Hz × `SOFT_IMPACT_DURATION` / `SLOW_RISE_DURATION`.
- C-R52-02 is therefore **not expected** to show on L52 with `Soft impact` or `Slow rise`.
- The video clip's exact length (6.008) must be read from `window.__c` before EG-VIDEO.

## 6. Bugs and findings for B

### C-R52-01 — Medium (gate): D-29z17 E2 contradicts frozen stage-1 tests GS3 and GS13

**Steps:**
1. `npx vitest run app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` on the round-52 tree.

**Expected:** 20/20, as D-29z17 §0.4 promised.

**Actual:** GS3 and GS13 fail (8.5 against 8). `npm run verify` exits 1.

**Cause:**
- The spec is at fault, not A. E2 correctly makes m1's end touch m2's start (12.5).
- GS3 asserts "a sub-half drag changes nothing". Under E2, a **15 px nudge now moves the clip 0.5 s** to butt-join the neighbour.
- This is the product question R52-T(1): is the magnet "too strong"? With nearest-wins and no pixel radius, any edge closer than the nearest line wins. A 15 px drag stops being a no-op whenever a neighbour sits within `duration + ½ step`.

**Decision for B and the Tech Lead** (C does not decide):
- (a) update GS3/GS13 to document FB-13: move m2 out of reach, or assert the 8.5 touch and the non-blocked status;
- (b) amend E2 (a radius, or edges only within some px), which would also change CM1/CM8/CT1 and EG-1/EG-VIDEO.

Until this is resolved, G52-1 cannot pass and the round is **not commit-ready**.

### C-R52-02 — Medium: a clip whose length is not a whole millisecond cannot butt-join a same-lane neighbour (edge rounding)

**Steps** (mounted StudioWorkspace, jsdom, scratch probe `c-probe-r52.test.tsx` P1m / P1c; `runs/probe-p1-p2.txt`):
1. Music lane: m1 at 2, length **2.0004**; m2 at 10.4, length 2.6. 40 px/s, Snap on 1 s.
2. Drag m1's header in samples of +160 / +200 / +230 / +254 px (raw 8.35).

**Expected:** m1's end touches m2 (start ≈ 8.3996), as it does for the control.

**Actual:**
- m1 stays at **8**, and the status reads `გადատანა დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი. კლიპი ბოლო თავისუფალ ადგილას დარჩა.`
- Control P1c (length exactly 2): lands at **8.4**, with status `კლიპის გადატანა: start 00:08.400, …`.

**Cause:**
- `clipEdgeTimes` and `snapMoveStartToGridOrEdges` round edges and lengths to whole ms and return the rounded candidate. The real end then overlaps by up to 0.5 ms.
- `moveClip` refuses any overlap above EPS 1e-4, which is about 40 % of random sub-ms fractions.
- P1s (start-touch after a neighbour ending at 6.0004) is also refused with the blocked text. Stage 1 would refuse it too, because the grid line 6 overlaps as well. The edge-specific defect is that the magnet should rescue it with 6.0004, but its candidate is rounded to 6.0.
- **Trim path not probed at runtime.** The reviewer says "trims are safe (clamped)". By code reading only: `trimClipEnd` clamps to the exact neighbour start, and `TRIM_BLOCK_TOLERANCE = 0.01` (`ArrangementClip.tsx` l.32) exceeds the ≤ 0.5 ms difference, so no blocked status is expected. This is unverified.

**Impact:**
- Library drops store the raw `buffer.duration` (`ArrangementContext.tsx` l.1236/1245). Purchased stems and decoded MP3s therefore get arbitrary lengths, and FB-13's "lock onto it" silently fails for them.
- The synthetic demo uses whole seconds, so L52 hides this.
- A's code-reviewer raised it (A §5, "for B"). I reproduced it, so it is now a bug and no longer a hypothesis.
- Suggested direction (reviewer's): compare in ms, return the exact candidate.

### C-R52-03 — Low: an unplaceable same-lane candidate wins and shows the blocked status where stage 1 moved freely

**Steps** (probe P2m):
1. Music lane: m1 at 2, length 4; m2 at 12–12.5. Snap on 1 s.
2. Drag m1 +160 / +236 / +256 px (raw 8.4).

**Expected (stage-1 behaviour):** m1 lands at 8 with the normal move status.

**Actual:**
- The nearest candidate is 8.5 (m1's end on m2's end, which always overlaps), so the move is refused.
- m1 stays at 8, the last free sample, and the status reads the blocked text.
- With a single sample (P2) m1 does not move at all (start 2, "ცვლილება არ მოხდა").

**Cause:** E2 lists "end on another clip's end" and "start on another clip's start" for clips on the **target lane**, and those always overlap. The reviewer proposed dropping them, or taking the nearest **placeable** candidate. B should decide together with C-R52-01.

### C-R52-T1 — Low (test gap, info)

Described in §3: CM10 does not catch a start-touch-only group magnet. This is for the 4c tests.

## 7. Ableton two-verdict table (§4.9)

| Behaviour | CZABA requirement (this round) | Ableton conformance |
|---|---|---|
| Clips snap to the grid | Unit PASS (CM3, CM7; GS* green apart from the C-R52-01 conflict). Browser EG-LINE/SN-1 **not run** | **დადასტურებული** (6.7 text) |
| Clips snap to other clips' edges (single move and trim) | Unit PASS (CM1/2/6/8, CT1/2/3/6). **Fails for sub-ms lengths (C-R52-02).** Browser EG-1/EG-VIDEO/EG-CROSS/ET-* **not run** | **დადასტურებული** (6.7 "edges of other clips"); groups/drop are 4c |
| Snap distance, grid vs edge priority | Implemented as specified (nearest; tie → grid; earlier edge), proven by (d) and (p). The strength question is C-R52-01 / R52-T(1) | **დაუდასტურებელი**: 6.7 does not say |
| Which edge aligns on a move (start or end) | Both, proven by (b) and (c) | **დაუდასტურებელი** |
| Locators / time-signature targets | — | **არ ეხება** (no locators yet; SRW-16) |
| Grid off → no snapping | Snap off = fully free (CM4, f2) | subdivisions **დადასტურებული** (6.10); objects with the grid off **დაუდასტურებელი** → CZABA **შეგნებული განსხვავება**/choice (user's free mode) |
| Alt bypass / temporary enable, including for edges | Unit PASS (CM5, CM6, CT5; g2). Browser EG-ALT* / ET-ALT **not run** | **დადასტურებული** for the grid (6.10); extending it to edges is a CZABA decision (**დაუდასტურებელი** in Live) |
| A cancelled press does not move the playhead | Unit PASS (CC1, mutation i); no real `pointercancel` | **No source** (არ ეხება / no claim) |

## 8. Carried items (honest; unchanged unless stated)

- **Closed this round:** **C-R51-T1**. Mutation (n) is now killed by SL10/SL11.
- **Open C bugs:**
  - C-R51-01 (Low → 4b probe) and C-R51-02 (Low → 4b fix);
  - C-R48-01 (Low; no recurrence in my full run this round);
  - C-R41-01;
  - **C-R27-01 with RF3-1, RF3-2 and R5-L6** (from `root-pre-push-review.md`: still FAIL; not re-measured, §4.7);
  - C-R6-02, C-R8-01, C-R23-01 and C-R38-01 (Tech Lead).
- **Root review follow-ups** (`publication-checkpoint.json` followupReview): the purchased Studio loader hardcodes `middle-east` (an inherited limitation; do not claim every product's stems work) and the instruction files need portable paths. Both are still open.
- **Open Low/info list** in §4.10, unchanged. New info: A-R52 sub-ms, now **C-R52-02**; the reviewer's unplaceable-candidate finding, now **C-R52-03**.
- **Not run this round (§4.7):** video sync, the full find → add → fit video → **export** flow (WAV data, duration and sample integrity were **not** measured this round), the FB-01..FB-16 stage regression, and `test:e2e:smoke` (root).
- **R52-T (Tech Lead):** still open, and directly informed by C-R52-01 (a 15 px nudge now jumps 0.5 s to a neighbour).

## 9. Commit readiness for root

- **Rounds 50 + 51** (11 paths) were not committed during round 52 (HEAD `038ed5a` throughout). C's round-51 readiness statement still stands for those 11 paths **as they were before round 52**. Two of them (`ArrangementClip.tsx`, `grid.ts`) now contain round-52 hunks, so committing the current tree commits round 52 as well.
- **Round 52: NOT commit-ready.** `npm run verify` exits 1 (C-R52-01). The browser acceptance is entirely unrun (environment), and C-R52-02 is open.

## 10. Next steps for B

1. Decide C-R52-01 together with C-R52-03 (same rule), and C-R52-02 (exact-value return).
2. Ask root to restart `http://127.0.0.1:5173`. C then re-runs, in order:
   - R52-EDGE, R52-TRIM, R52-PLAY;
   - the browser part of R52-REG, plus REG-HYD;
   - G52-3 (anonymous workspace and purchase protection), in a fresh browse state.
3. Add start-touch and end-touch targets to the 4c group tests (C-R52-T1).
