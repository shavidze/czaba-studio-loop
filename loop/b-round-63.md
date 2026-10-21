# B — round 63 planning → round 64 task (D-29z29)

**Role:** B (task writer and dispatcher). B owns only `tmp/studio-real-loop/*` planning artifacts and `docs/technical/studio-real-workspace/plan.md`. B did not touch any app code.

## 0. Session and artifacts

- **Single session** (2026-10-19, shell clock ~11:30–12:00 +04).
- **Archived first:** `tasks/round-63.md` (cmp-identical to the dispatched round-63 `current-task.md`; it did not exist before, so nothing was overwritten). Also written:
  - `b-round-63-pre-current-task.md`, `-pre-backlog.json`, `-pre-feature-status.md`, `-pre-b-next.json`;
  - `plan.before-b-round-63-r64.md`;
  - `b-round-63-checkpoint.md`.
- **Baseline artifacts:**
  - `b-round-63/` holds gates, status-start, all/owned/frozen paths, the update scripts, the oracle and the Ableton capture;
  - `b-round-63-r64-tree-sha256.txt` (422 entries);
  - `b-round-63-r64-snapshots/` (2 files + `SHA256SUMS.txt`).
- **Updated:**
  - `backlog.json` v65 → **v66**;
  - `feature-status.md`;
  - `plan.md` (**D-29z29** appended after D-29z28; LF kept, CR count unchanged at 1416);
  - `current-task.md` (round 64), rendered by `b-round-63/render_task.js`. The Georgian UI literals were copied byte-for-byte from the source files, and the script refuses Arabic-block characters.
- **Advisor:** available. Consulted once after orientation, before any writing, and once after the outputs were written (§9).
- **Outside B-owned artifacts (recorded):** B ran `loop-v2/build-context.mjs` once after the backlog update; it regenerated `context/active-backlog.json` and `context/active-summary.md` (root's generator, 103 KB, findings 64). The loop regenerates them each phase anyway.
- **Gate file:** `loop-v2/gates/gate-round-63.json` = `skipped` ("C taskStatus BLOCKED"). Nothing was published, so the baseline for round 64 is the working tree by content, not a gate commit.

## 1. C round 63 → backlog (independent evidence only)

- **C verdict:** **BLOCKED (environment)**, `browserVerified: false`, **no bugs** (`c-round-63.md`, `c-round-63.json`).
- **Offline, all PASS:**
  - G63-2: case A, 32 lines; frozen 420; protected 4/4.
  - R63-S.
  - R63-U: red run 3 failed / 52 passed. Mutations a–g, r62 a/f/h and p were killed; n survives as expected, because the anchors are whole-ms.
  - G63-1: tsc 0; 89 / 1574; build; Biome 5/218/1; verify rc 0 on attempt 1.
- **Not run (environment):** every §4.6 browser row and G63-3. `:5173` and `:5199` returned 000 at all three of C's checks.
- **Closed only on C unit evidence.** Both were test-only gaps with no browser behaviour of their own:
  - INFO-R62-EDGE-TOL: CE11 passes, and mutation b kills it.
  - A-R62-REVIEW-R5-POSITIVE-LANE: CG8 passes, and mutation e kills it. Its positive browser half was already shown by GE-CROSS in round 62.
- **Not closed (V2 rule: a browser half that has not run is never მზადაა, "ready"):**
  - C-R62-01: GE-OOB-STATUS has not run.
  - C-R62-ALT-ENABLE-GROUP-GAP: GE-ALT-ENABLE has not run.
  - Both are now **მუშავდება** ("in progress"), and their browser rows are carried into round 64.
- **SRW-14** stays **მუშავდება**.
- **New records:**
  - A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE (Low, ruled in §3);
  - C-R63-NPX-CACHE (info, root);
  - B-R63-SPEC-LITERAL (info, B's own error, closed);
  - ENV-SERVERS-DOWN-R63 (info, root);
  - R64-T-TECH-LEAD.
- **A round-63 deviations accepted:**
  - D1: servers down, so no smoke;
  - D2: a transient duplicate import, removed before any test run;
  - D3: A imported `GROUP_MOVE_BLOCKED_MESSAGE` instead of using the task literal. That literal contained an Arabic `ف` — **B's error**.

## 2. Decision D-29z29 — round 64 = SRW-14 stage 4c-2 + the round-63 browser rows

**Why not a browser-only round:**
- C said the code needs no re-implementation, only its browser half.
- The servers have been down for rounds 62–63 and at this planning (B 11:38: both 000, `b-round-63/gates.txt`). A browser-only round in that state would produce nothing.
- The 2026-10-09 rule says an environment problem that is not security or data loss does not stop an independent feature.
- **Precedent:** rounds 57/58 → 59, where the browser rows were carried into a round with new code.

So A implements 4c-2. C runs every round-63 browser row **first** (§4.6, unchanged rows), then G64-3, then the new LD-* rows and the probe.

**The 4c-2 rule.** The library drop uses the single-move G1/G2 rules (D-29z17/18):
- `step = resolveSnapStep(snapSeconds, gridSeconds, altKey)`;
- if `step` is `null` → free;
- on the video lane, or when `getLibraryDragSource() === null` → grid only;
- otherwise `clipEdgeTargets(getArrangement().clips, '', track.id)` + `snapMoveStartToGridOrEdges(raw, dragged.duration, …)`.

Overlap handling is unchanged. B read both placement paths: `canPlaceLibraryClip` allows touching within `LIBRARY_PLACEMENT_EPS`, and `addClip` → `findFreeStart` keeps an exactly touching `desired` (it fits with `ARRANGEMENT_EPS` and is the distance-0 candidate), so `dropLibrarySource`'s `|clip.start − start| > ARRANGEMENT_EPS` refusal does not fire for butting drops. A winning candidate that overlaps gives the red ghost (LD-BLOCK).

**Why `grid.ts` stays frozen:**
- Every helper 4c-2 needs is already exported.
- Freezing it means the carried round-63 browser rows run on an unchanged `grid.ts` and `ArrangementClip.tsx`.
- Ownership is two files plus doc 057.

**SD6 narrow grant — verified, not assumed.** `b-round-63/oracle/oracle.mts` runs the real `grid.ts` helpers under `node --experimental-strip-types`.
- SD6's first half (raw 6.2, division 5) would now snap to s1's end at 6 and no longer be blocked.
- Moving the two coordinates to 4.6 keeps its purpose: grid 5, blocked, the same assertions. It passes on both the old and the new code.
- SD1–SD5 and SD7 are unchanged.
- `track-layout` and `gesture-guard` drop with Snap off, so they are unaffected.

**Tests:**
- DE1–DE9 on a non-integer fixture, so edges and grid lines differ.
- The red run is predicted as `4 failed | 32 passed (36)`: DE1, DE2, DE3 and DE6 fail.
- Mutations a–i each have a named killer. In the oracle, the wrong lane gives 4.4 (killed by DE4), duration 0 gives 6.4 (killed by DE5), and start targets only gives 5 (killed by DE2).
- Suite: **89 / 1583**.

**Uncertain UI contract, smallest honest behaviour:**
- A not-ready source snaps to the grid only. Its duration is unknown, so end touches would be invented.
- The video lane stays grid-only. It is refused anyway, so the ghost time is informational.
- Edges are not filtered by placement. The single-move rule does not filter either, and the red ghost already tells the user.

**Rejected:**
- a new helper in `grid.ts`;
- placement-aware candidate filtering;
- duration-0 edges for a not-ready source.

## 3. Ruling: A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE

**The issue:** a nearer out-of-bounds edge hides a reachable edge that is nearer than the grid line. C reproduced it: the call returns `{6,6}`; without st1 it returns `{6.2,6.2}`.

**Ruling:** this is a known Low limitation of D-29z28, the same kind as GROUP-SUBMS-GRID-EDGE. It is **not scheduled**, so CG7, GE-OOB-STATUS and R63-T keep 8. The reasons:
- The result is a valid, non-overlapping grid move with a correct status.
- "Nearest reachable edge" would be a new rule: a bounds-aware candidate filter, with changes to CG7, GE-OOB-STATUS and R63-T (8 → 8.2). The user did not ask for it.
- Changing it now would also change the very browser row that round 64 must first verify.

It stays in `remaining` and in the Lows batch.

## 4. Ableton

**Live 12 manual §5.10** (`https://www.ableton.com/en/live-manual/12/working-with-the-browser/`). B read it with gstack `/browse` on 2026-10-19; see `b-round-63/ableton-5.10-excerpt-20261019.txt` and the full page text. It confirms only that browser items drop into Arrangement tracks. It says nothing about snapping on a drop.

| Behaviour | Ableton status | Basis / CZABA position |
|---|---|---|
| Drop-start snapping to grid or edges | **unconfirmed (no source)** | CZABA decision, for consistency with single moves. §6.7 covers moving clips and is not used as drop evidence. |
| Alt | **confirmed as a general rule** | §6.10; applying it to drops is CZABA's decision |
| Overlap on drop | not applicable / unconfirmed | — |

No video was watched and no Live installation was used.

## 5. Baseline and ownership (round 64)

- **Content baseline:** cases A–F (A = `038ed5a` + 32 lines); frozen `b-round-63-r64-tree-sha256.txt` (422 OK). It newly freezes `grid.ts` `5341cd83`, `grid-edges` `7e686c0f`, `grid-snap-clip-edges` `785f521d` and doc 056 `1fd9c70b`, which are C's round-63 end hashes.
- **Snapshots:** `ArrangementLane.tsx` `c16ba6b0` (LF 934) and `grid-snap-loop-drop.test.tsx` `4a5eb6ea` (LF 757, 27 `it`).
- **Check:** the round-63 frozen list is still 420/420 OK. Protected files are 4/4. `node.exe` count is 4.
- **Owned:**
  - `ArrangementLane.tsx`: `libraryDropStart`, its two call sites and the grid import line;
  - `grid-snap-loop-drop.test.tsx`: SD6's two coordinates, `DROP_EDGE_FIXTURE` and DE1–DE9;
  - doc 057.
- **Unchanged rules:** the protected auth and token files stay untouched; `/studio-lab` stays demo-only and public; real audio is required (LD-PLAY, GE-OOB-PLAY).

## 6. Root follow-ups (current-task §6, §4.10)

1. **Servers.**
   - **Start both `:5173` and `:5199` before A and keep them up through C.** This is the third round without browser acceptance.
   - **Env gate:** `loop-v2/env-status.json` does not exist. Root should make the loop hold C while `:5173` is 000.
2. **Commit units.**
   - `cb12805` (rounds 50–58) and rounds 59, 60, 61 and 62 are ready, each as its own unit.
   - **Round 63 is not ready** until its carried browser rows pass. Rounds 63 and 64 may be published together after C; that is root's call.
3. **ARCH-CHECKPOINT-SRW14-PREFS.** Re-requested at the SRW-14 stage-4 boundary, before SRW-15 adds BPM consumers of the grid preferences. It does not gate anything. A-R63 reports no new architecture note; the (b) precision question is again visible in C's mutation n.
4. **INFO-R61-FAKEBEARER-500:** root's decision (protected file).
5. **`root-pre-push-review.md` and `publication-checkpoint.json`:** their mtimes have not changed (2026-10-18 12:46:34 and 2026-10-17 11:11:24). Their remaining findings are carried verbatim in current-task §4.10.

## 7. Commit readiness (for root; B does not commit)

| Unit | Status |
|---|---|
| `cb12805` (rounds 50–58) | ready |
| Rounds 59, 60, 61, 62 | ready, each as its own unit |
| Round 63 | **not ready** (offline C PASS only; `browserVerified: false`) |
| Round 64 | after C |

None of this is a release.

## 8. Decision

**CONTINUE.** The work is not complete:
- SRW-14 still needs its 4c-1 browser half, 4c-2 and stage 5;
- SRW-15..20 (FB-06/07/09/10/11/12) have not started;
- items are still in progress or have bugs: FB-08 C-R8-01, FB-16, SRW-01/03/11B/13;
- SRW-21 is blocked on Tech Lead evidence;
- the final regression, root review and T12 remain.

**Not BLOCKED.** The servers being down is an environment condition that root controls, and it is already requested. No external information, approval or credential is missing for round 64, and A's work does not need the servers.

## 9. Advisor (after outputs)

The second consultation ran after every artifact above was written. It confirmed the decision, the scope, the oracle values, the red-run prediction, the mutation killers, the literals, `b-next.json` and the Ableton row, and raised two items:
- **Fixed — §3.1 end-state counts for cases B–E.** The first draft copied round 63's "+1" pattern. Both round-64 owned files were last changed in round 57, so they are not in the B–E start sets and each adds a ` M` line: B 17, C 13, D 9, E 7 (A 33 and F 3 were right). The template now states the rule by content and `current-task.md` was re-rendered.
- **Checked — exact butting through `findFreeStart`.** It returns the touching `desired` unchanged (see §2), so DE1–DE3 and LD-EDGE do not hit a spec-assumption stop.
- Also recorded at its request: the `build-context.mjs` run (§0).
