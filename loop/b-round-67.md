# B — Round 67 planning report → Round 68 task (D-29z33)

Dispatcher: B · Date: 2026-10-20

**Inputs:**
- `tasks/round-67.md`: an exact copy of the old `current-task.md` (`cmp` identical). Nothing was deleted.
- `a-round-67.md`, `c-round-67.md` and `c-round-67.json`.
- `gates/gate-round-67.json`: **`skipped`, "C taskStatus FAIL"**. No publication, so the baseline stays `b5fb12b` plus the uncommitted round-67 tree.
- `context/active-summary.md` and `context/active-backlog.json`.
- By ID: `backlog.json`, `plan.md` and `feature-status.md`.
- Loop-brace text from the existing Ableton capture.

**Source reads:** I read `grid.ts`, `loop.ts`, `ArrangementLoopBrace.tsx`, `ArrangementContext.stepLoopRange` and the two round-67 test files, read-only. I changed no app source; `git status --short` is still the 7 round-67 lines.

## 1. Round 67 result (C evidence only)

**C: FAIL, `browserVerified: true`, `realVerified: true`.**
- **Passed:** 27 of 28 rows, among them:
  - R14-G1 at 120 BPM;
  - 90 BPM drags, positions, trim/range, drop, group and nudge;
  - keys, menu and layout at both viewports;
  - GM-PLAY, real audio, onset 4.671;
  - SN/TB/MT/RU-REG, REG-HYD and G67-3;
  - verify rc 0, 95 / 1646.
- **GM-BRACE FAIL → C-R67-02.**
- **C-R67-01:** the reviewer's M1, reproduced in the browser.

**Both bugs come from my round-67 rule §0.1(9). A implemented it as written.**

**Backlog updates (C-evidenced only):**
- SRW-14 stage 5a → **C FAIL → fix round 68**.
- FB-13 and SRW-14 in `feature-status.md` → **ბაგია**. The PASS rows are evidence; the stage is not done.
- Nothing becomes **მზადაა**.

## 2. Rulings

| Item | Ruling |
|---|---|
| C-R67-01 (medium) | Round 68. Stored-line neighbour scan. The reviewer's two-candidate O(1) form is **rejected**: it sticks at 999 BPM 1/4, t = 0.3 (checked in node) |
| A-R67-REVIEW-L1 (low) | Round 68, same rule. B found and confirmed the **ceil** sibling against the live `grid.ts`: `(0.1, −0.0697, 0.0625, −0.069, 10)` → −0.038, so the anchor lands on 0.062, which is not a stored line |
| C-R67-02 | **Medium** by B, under the project table: incorrect behaviour with a common trigger. Round 68: the loop move keeps its length as a line count, for both pointer and keyboard. **Relaxing GM-BRACE was rejected**, because Ableton's brace keeps its length (confirmed in the capture, line 3) |
| Moved clip end / group offsets in ms (same mechanism) | **Deliberate:** clip duration is media time (D-10). GM-GROUP keeps ±0.001. Signal on ARCH (b) |
| Mutation p survives | `INFO-C67-MUT-P` → Lows batch. Round 68 removes the constant |
| A review L2, N2, N4 | Lows batch. L3 is covered by C GM-MENU; N1 is kept by spec; N3 is info |
| GM-DROP ghost lacks `data-ghost-start` | `INFO-C67-DROP-GHOST-ATTR` → Lows batch |
| RU double-click miss 3/47 | watch (TB script only; the dedicated script was 18/18) |
| `tb67reg` narrower forbidden-host regex | harness rule from round 68: every script |
| MT-SCRUB-INFO (0 long tasks, max gap 21.9 ms) | evidence on ROOT-R66-M1; the perf round stays after 5b |
| A Architecture note (Signals 3 and 4; proposed grid/tempo hook after 5b) | `architecture_signals`; fifth ARCH request (§5). Not scheduled on its own |

## 3. Round 68 = fix round (three tightly related bugs, one owner)

**Contract D-29z33.** It applies to non-whole-ms steps only; the whole-ms path goes back to the `b5fb12b` expressions:
1. **`adjacentGridLine`:** the nearest stored line `L(m)` strictly beyond `t`, with a three-candidate scan.
2. **`snapGroupDelta` clamp:** the stored line at or below / at or above the bound.
3. **Constants:** the tolerance constant and its helper are removed.
4. **`moveLoop(arrangement, start, gridStep)`:** when both edges and the new start are on lines, the end is the line at the same index distance. Otherwise the ms length is kept, as today.
   - The brace passes `resolveSnapStep` (pointer, so Alt works) and `snapSeconds` (keys).
   - The context's `stepLoopRange` gets an optional `gridStep`, used for `'move'` only.

**Offline proof** (`b-round-67/oracle.mjs`; `live-probe.ts` against the live code):
- Neighbours: 2.52 M inputs, 0 mismatches (today: 484). No change on stored lines.
- Loop: 953 768 checks, 0 failures.
- Group clamp: 74 556 checks, 0 failures.

**Files:**
- `grid.ts`;
- `loop.ts`;
- `ArrangementLoopBrace.tsx` (two call sites);
- `ArrangementContext.tsx` (`stepLoopRange` only);
- tests appended to round 67's files: GM10–GM12 and GU12–GU14 → **95 / 1652**;
- doc 060 amended, not a new 061: round 67 is unpublished and both rounds publish together.

**C checks:**
- FX-M1* (C's exact repro) and FX-M1-90;
- GM-BRACE* (the round-67 steps, strict), GM-BRACE-ALT, GM-BRACE-KEYS, and GM-BRACE-PLAY with real audio across the wraps;
- GM-NUDGE, GM-GROUP, GM-GROUP-CLAMP (best effort, non-gating, because the unit test GM11 covers it) and GM-G1;
- SN/LB/GM-KEYS-REG, REG-HYD and G68-3.

**Round-67 rows not re-run:** those whose code is frozen this round. Their PASS stands.

## 4. Baseline for round 68 (B-measured, ~17:40 +04)

- **HEAD `b5fb12b`**, plus the 7 uncommitted round-67 lines.
- **Frozen:** `b-round-67-r68-tree-sha256.txt`, 431 entries, 0 not OK.
- **Snapshots:** `b-round-67-r68-snapshots/`, 7 files, all LF.
- **Protected:** 4/4 OK.
- **Servers:** 200/200; `node.exe` 7.
- **Biome:** 4/218/1 and vitest 95/1646. These are C's G67-1 values; B did not re-run them.

## 5. Requests to root

1. **Commit unit:** rounds 67 + 68 together, after a C PASS of round 68. Round 67 alone is not commit-ready.
2. **ARCH-CHECKPOINT-SRW14-PREFS, fifth request.** This is accumulated risk on one owner: a precision-rule fix round. Items:
   - (a) grid/tempo hook;
   - (b) time-precision ownership, including the deliberate ms rule for clips;
   - (c)–(f) as before.

   Non-gating; round 68 does not wait.

## 6. Carried (unchanged, honest)

- **Lows batch:** ROOT-R64-L3…L6, ROOT-R65-L2/L4/L5/L6, ROOT-R66-L3, INFO-C65-SELECT-FOCUS, INFO-C66-UI9-NO-PLAY, A-R65 hint anchoring, A-R66 #3/#6/#7, the doc 058/059 status lines, and the older batch. New: A-R67-REVIEW-RESIDUALS, INFO-C67-MUT-P and INFO-C67-DROP-GHOST-ATTR.
- **Open Mediums (own tasks):** ROOT-R65-M1-BEAT-DENSITY, ROOT-R66-M1-METRONOME-HORIZON, and root-pre-push M1/M2.
- **Other open items:**
  - SRW-14 stage 5b;
  - SRW-03 video sync (C-R27-01);
  - the SRW-05/09/10/11B/13/23/24 open items;
  - SRW-16…20 not started;
  - SRW-21 blocked-partial;
  - the final regression, root review and T12.
- **Tech Lead:** R52-T … R67-T, plus R68-T.

## 7. Decision

**CONTINUE.** Round 67 failed with two open Medium C bugs, and the scoped work (stage 5a fix, 5b, perf, SRW-16…20, …) remains. **Not BLOCKED:** no external information, approval or credential is missing.

## Advisor

The advisor was available and was consulted twice: after orientation and before writing, then after writing and before reporting.
- **Second call, adopted (all verified in node first):**
  - The GM12 sweep would fail a correct implementation, because `MIN_LOOP_LENGTH` (0.1) owns w = 1 at 0.0625: 800 cases. The sweep is now limited to `w × step ≥ MIN_LOOP_LENGTH` (11 011 checks, 0 failures), plus the guard oracle row {0.063, 0.126}.
  - `x` is defined in §0.1(2).
  - R68-S compares the whole-ms arithmetic expressions, not the new branch structure.
  - Brace keys are dispatched on the brace element. The existing `pressArrow` targets `document.body`; B found that while checking `pressG`.
  - C turns Snap off with the Snap button in GM-BRACE-KEYS.
- **First call:**
- **Adopted:**
  - an explicit baseline with the round-67 tree and a regenerated frozen list;
  - the normative stored-line scan; the reviewer form's stuck case was verified;
  - verifying the ceil instance against the live code;
  - including the keyboard loop move;
  - the deliberate ruling on clip end/group offset;
  - C-evidence-only statuses;
  - the Ableton citation;
  - bounded sweeps and mutations.
- **Diverged:** none.
