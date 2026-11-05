# A round 347: PERF-DRAG-PREVIEW stage c6-ii (lane MixFader and DetailClipGain memo)

**Status:** implemented. No STOP condition was hit. The ClipGain-half fallback (§4) was not used, so both halves ship.
**Baseline:** HEAD `4895732`. No dev server was started: the perf specs started and stopped their own production server on :5188, and :5173 was left alone. No browser probe was run by A.

## Changed files (7, exactly the task's list)
1. `app/hooks/useStableHandler.ts` (new). From B's `source.patch.txt`, unchanged.
2. `app/hooks/__tests__/useStableHandler.test.ts` (new). SH1–SH4.
3. `app/components/arrangement/ArrangementMixFader.tsx`. Patch applied unchanged.
4. `app/components/arrangement/ArrangementLane.tsx`. Patch applied unchanged.
5. `app/components/arrangement/ArrangementDetailPanel.tsx`. Patch applied unchanged.
6. `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`:
   - DP64: the 5-tick loop is replaced by `waitFor` (closes GATE346-L1), and `waitFor` is added to the import.
   - DP65 added at the end of the c6-i describe block, with no new describe. It follows B's prototype without the `console.log`, plus one precondition per gesture: `getSelectedClipIds()` equals `['c1']` (from code-reviewer L3).
7. `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`:
   - l.4 status updated to c6-ii and "C round 347 pending"; this closes GATE346-INFO3.
   - Title line extended.
   - New section `### ეტაპი c6-ii`, items 82–87: the premise, the change, the hook contract (never call it during render), the rejected options, the known limits and B's numbers.
   - Changed-files, testing and TODO entries added. `## ` count is still 7.

`git apply -R --check b-round-346/sketch/source.patch.txt` is clean, so the source is exactly B's sketch.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | equals `claims-347-planning-output.txt` | (diff empty) |
| A-CLAIMS final | K3/K4/K5 equal the sketch output. K2 `4895732 7`; K6 `hook present export 1 test present SH-it 4`; K7 `DP it( 67 DP64 1 DP65 1 tick-loop 0 waitFor 1`; K8 11; K10 `0` / `untracked 0`; K11 `7 1 0`; K12 `230 60` | `a-round-347/claims-final.txt` |
| A-TYPE | rc 0 | `typecheck-final.log` |
| A-LINT | rc 0, **205 warnings, exactly at the ≤ 205 ceiling** | `lint-final.log` |
| /check (Biome, 6 code files) | rc 0, no fixes | `biome-check.log` |
| A-UNIT | 18 files, 395/395 tests; drag-preview-render 67/67; SH 4/4. After the DP65 precondition edit, the hook file and drag-preview-render were re-run: 71/71. DP63/64/65 take 97–141 ms each, and no covering test is slow | `unit.log`, `unit-final-dp.log`, `dp-verbose.log` |
| A-MUTANT (scratch `/home/runner/a347-scratch/sc`, an rsync copy with symlinked node_modules; restored and checked with `diff -rq app`; `store/` git status unaffected) | All red. (1) `memo` removed from MixFader → DP65. (2) Lane volume `onChange={(event) => handleVolumeChange(event)}` (the inline-again class) → DP65. (3) `memo` removed from ClipGain → DP65. (4) `storedClipGainsDb` inline array literal → DP65. (5) `isPanCentred` dropped from the deps only → 2 `track-pan.test.tsx` tests red; the `disabled={storedPan === 0}` variant was not needed. (6a) The hook returns `handler` → SH1. (6b) The ref is never updated → SH2. Mutants 1–4 were re-run on the final DP65, with the selection precondition copied into the scratch: still red | `mutant-*.log` (1–4 overwritten by the re-run) |
| A-PERF (production, alone) | rc 0, `complete`, `failures` [], 230 rows, 60/60 asserted pass. Against C346: 100 EQUAL, 65 DIFF, 0 NEW, **every DIFF lower, none higher**. Per move: trim 17.7 → **14.75** (max 18 → 15); move 18.467 → **15.317** (max 89 → 82); fade 5.9 → **3.933** (max 6 → 4); click 88 → 83; group 21.219 → 18.031. All identical to B's sketch. `durationMs` 432344 | `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c346.txt`, `perf.log` |
| A-FADER-PERF (production, alone, run after A-PERF) | rc 0, `complete`, `failures` [], 321 rows, 94/94 asserted pass. Against C341: 164 compared rows, all EQUAL; 0 DIFF; 0 NEW; no `fader.*` row higher. `durationMs` 402658 | `fader-perf-results/latest.json`, `fader-perf-rowcmp-vs-c341.txt`, `fader-perf.log` |
| A-PERF-LIB | 40/40 | `perf-lib.log` |
| A-REVIEW | `code-reviewer` (real subagent, 7 files): 0 Critical/High/Medium, 3 Low; score 8/10 | below |

Both perf runs measured the final source; nothing in the source changed after them. The only later edit is the test-only DP65 precondition, which is re-run above.

**Per half (D-29z1097):**
- **Lane half** (MixFader memo plus 10 lane stable handlers): DP65 MixFader `=== 0` passes; mutants 1, 2 and 5 are red; the fader perf rows are EQUAL.
- **ClipGain half:** DP65 DetailClipGain `=== 0` passes; mutants 3 and 4 are red; the clip-gain unit files are green.

## Code-reviewer findings and disposition
- **L1 (Low): the ref is updated in a layout effect.** An earlier sibling's layout effect that blurs the clip-gain field in the same commit could run the previous handler. No current code path does this; the reviewer checked StudioWorkspace, MarkerRow, Transport and Library. Suggested fix: `useInsertionEffect` plus an SH5 test.
  - **Not applied.** It would change the hook away from B's patch, and C's SOURCE-SCOPE reverse-applies that patch. Routed to B as **A-R347-REVIEW-L1**.
- **L2 (Low): `parseClipGainDbKey` filters out non-finite values instead of mapping them.** A non-finite gain would shorten the array and misalign `storedClipGainsDb[index]`. This is unreachable today, because every write is clamped by `normalizeClipGainDb` to −60…+24. B's choice is deliberate (no `[]` → `[0]`).
  - **Not applied**, for the same reason. Routed as **A-R347-REVIEW-L2**.
- **L3 (Low): DP65 does not prove the selection state.** **Applied, test-only:** each gesture asserts `getSelectedClipIds()` equals `['c1']` before measuring. The reviewer's extra group-selection case was not added (scope). Note that mutants 3 and 4 already prove the ClipGain memo is exercised.
- **Architecture note (for B, signal only, not acted on):** there are now two "latest callback" mechanisms with different timing. `useRelativeFaderDrag.ts:36` updates in a passive `useEffect`, while `useStableHandler` updates in a layout effect, and `handleClipGainFaderPointerDown` goes through both. Proposal: one bounded task to move `useRelativeFaderDrag` onto `useStableHandler`, with the existing fader tests as acceptance.
- **Deliberate, per task §5:** the hook's "never call during render" contract lives only in doc 232, not in `docs/technical/`.

## Known gaps
- No browser rows were run by A; they are C's rows.
- L1 and L2 above are open Lows for B.
- Recorded limits (D-29z1098): the ClipGain memo does not hold in the no-selection state (`reasonNode`), and Master and GroupHeader still pass inline props.

## Exact next C checks
- CLAIMS: compare against `a-round-347/claims-final.txt`.
- SOURCE-SCOPE: 5 modified + 2 untracked; the reverse patch applies.
- READ, UNIT, and MUTANT (C's own 3).
- NAMES at :5173 after a browser warm-up. Expected: fade [4×4], trim [15×4], move [12, 12, 82, 12], click [83, 0]. No MixFader or DetailClipGain in fade, trim or non-crossing move commits.
- FADER-LANE (d) and (e), and FADER-CLIPGAIN (c) and (f), are the stale-closure probes; run all FADER rows at both viewports.
- VISUAL `outerHTML` identity.
- PERF and FADER-PERF, each alone.
- PERF-LIB 40/40, G347-AUTH, and DOCS.

## Scope completed
All §1 items and all A rows in §2.1 passed as stated. Not claimed: any C row, gate rows, or backlog completion.
