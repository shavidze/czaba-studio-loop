# A — Round 105 report: A-R104-REPEAT-DRAG + GATE104-S3

Implementer: A (Claude Opus 5.5) · Date: 2026-10-23 · Task: `current-task.md` (round 105, D-29z70)

## Scope completed
- **T1** `reduceArrangementStatus(previous, next, gestureActive: boolean)`: the parameter is required (no default). Same string during a gesture → `previous`. Any other string → new object with sequence + 1. The function branch is unchanged. The module stays pure.
- **T2** `ArrangementContext.tsx` (narrow): `const gestureCountRef = useRef(0);` moved from old l.615 to directly above `useReducer`. The reducer argument is now an inline `(previous: ArrangementStatusEntry, next: ArrangementStatusUpdate) => reduceArrangementStatus(previous, next, gestureCountRef.current > 0)`. The two type imports were added to the existing `status-announcement` import block. The second and third `useReducer` args are byte-identical. Diff vs snapshot = exactly these 4 hunks; no `setStatus(` line changed.
- **Tests:** in the SA file, only the five SA1–SA5 **call lines** changed (third argument `false`); no assertion line changed. SA6 and SA7 are appended. In the UI file, lines 1–314 (helpers + SU1–SU4) are byte-identical to the snapshot. The snapshot's line 315, the closing `});` of the describe, is now at the end of the file after SU5/SU6. So `cmp` against the snapshot reports a first difference at byte 10312 / line 315; that is the relocated `});`, not a change to SU1–SU4. `diff` shows a single pure-addition hunk `314a315,390`.
- **Doc 092 (owned sections only):** status line (l.4), the l.59 entry made accurate, the l.60 problem entry replaced with the round 105 solution (gesture-aware reducer, why it lives in the provider, the moved `useRef` and the TDZ `ReferenceError`, the 4 recorded semantics incl. the concurrent-replay case, the rejected options), testing section (round 105 subsection) and TODO (C rows, R104-T extended with a held drag). The diff vs snapshot has hunks only at l.4, l.59–60, l.74 (testing) and l.78–79 (TODO). An interim edit to the changed-files list was restored to the snapshot text, because that section is outside B's listed doc sections.

## Changed files (end sha256, `a-round-105/end-hashes.txt`)
| File | sha256 |
|---|---|
| `app/lib/arrangement/status-announcement.ts` | `f72b2ec4…` |
| `app/contexts/ArrangementContext.tsx` | `939e720c…` |
| `app/lib/arrangement/__tests__/status-announcement.test.ts` | `639bcead…` |
| `app/lib/arrangement/__tests__/status-announcement-ui.test.tsx` | `b6b54dc7…` |
| `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md` | `651428dd…` |

End hashes were regenerated **after** the code-review doc fixes. Code and test files did not change after the review (their hashes are the same as before it).

All LF (CR=0). `git status --short` at the end = the same 3 M + 4 ?? paths; no new path. HEAD `3b6178b`. Frozen list `b-round-104-r105-tree-sha256.txt` 537/537 OK at start and end.

## Commands run and results
- `npm run typecheck` → exit 0.
- `npx biome check <4 owned code/test files>` (no `--write`) → "Checked 4 files … No fixes applied", 0 diagnostics.
- `npm run lint` → exit 0, with 218 warnings and 1 info, all pre-existing elsewhere. The output is truncated at 20 diagnostics, so I also ran `npx biome lint --max-diagnostics=2000 .` and grepped it: 0 diagnostics in the owned files (`a-round-105/lint-full.log`).
- Targeted vitest: `grep … | sort > a-round-105/targeted-list.txt` → **69** files. `npx vitest run $(cat …)` → **69 files, 1126/1126 passed** (1122 + SA6, SA7, SU5, SU6), log `a-round-105/targeted.log`.
- Not run (gate): full suite, `npm run verify`, build, e2e smoke.

## Fail-before (scratch `a-round-105/mut/`, round 104 snapshots of `status-announcement.ts` + `ArrangementContext.tsx`, new tests)
- Red: **SA6** (`expected { text: 'blocked', sequence: 10 } to be { … sequence: 9 }`) and **SU5** (span identity at step 3).
- Green: SA1–SA5, SA7, SU1–SU4, SU6.
- **Matches B's expectation exactly.**

## Mutations (scratch; `a-round-105/run-mutations.py`, `mutation-results.json`, `mutations.log`)
| Mutation | Red tests |
|---|---|
| unmutated control (before and after) | none, 13/13 green |
| m6 provider passes `false` | SU5 |
| m7 reducer ignores `gestureActive` | SA6, SU5 |
| m8 provider inverts flag (`=== 0`) | SU1, SU2, SU5 (SA all green) — matches B |
| m9 `gestureCountRef` left at old line | SU1–SU6, all `ReferenceError: Cannot access 'gestureCountRef' before initialization` — matches B |

## A's own browser self-check (not C acceptance)
These runs use C's round 104 script `sr104.cjs` with only the output paths changed (`a-round-105/browser/sr105-self.cjs`). The protocol is 60 moves plus 20 one-pixel wiggles, on fresh Playwright contexts against the running `:5173` server. No `a-browse.json` state was used.
- **blocked 1280x720:** 81 pointermoves → **2** added element nodes. The blocked sentence was added ×1 and the release text `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` ×1. The `<output>` is the same node and was replaced 0 times. Undo label is unchanged and there is no overlap (clips at x 512 / 889). Round 104: 81 spans.
- **blocked 1440x900:** same result, 81 moves → 2 nodes (blocked ×1, release ×1).
- **fade drag 1280x720:** 81 moves → 61 added nodes **over the whole drag** (59 distinct moving readouts `Fade In: 1.696 წმ` … `100.059 წმ`, each ×1; the clamped readout `Fade In: 101.352 წმ` ×1; the release text `Fade In: 101.352 წმ.` (with a period) ×1). Inside the clamp window, the clamped readout was added **once**. Each distinct readout appears once, and the clamped readout `Fade In: 101.352 წმ` appears **×1** (round 104: 21). Final status `Fade In: 101.352 წმ.`, fade-in 101.352, Undo label `Undo: Fade In`, Ctrl+Z → 0.000.
- No pageerror, hydration warning, forbidden request or Authorization header. The only failed request is `localhost:5199/api/cart` (expected cloud noise).
- The first blocked attempt failed in session setup: the MutationObserver target did not exist yet (`parameter 1 is not of type 'Node'`). A retry passed. This is an environment timing issue, not a product result.

## Code-reviewer (actual `code-reviewer` subagent; verdict approve, score 8/10, 0 critical)
| # | Finding | Disposition |
|---|---|---|
| 1 | Low: the inline reducer reads a ref at render time. Concurrent rebasing (a pending continuous-lane pointermove update replayed after a discrete pointerup release) can bump once more at the gesture end. Never a miss or a double during the gesture. | Accepted; it is semantics item 1. Doc 092 now names the concurrent-replay mechanism explicitly. No code change (B's spec). |
| 2 | Low: no test for "dispatch during gesture, render after release" (pin +1). Optional SA case with an updater and `gestureActive=true`. | **Not added**: outside B's test list (SA6/SA7, SU5/SU6) and it would change the expected 1126 count. Proposed to B as a follow-up test. |
| 3 | Low (doc): the Approach section l.16 still says the string branch "always" bumps; the Mermaid diagram shows only the keyboard path. | **Not edited**: outside B's listed doc 092 sections (l.4, l.59/l.60, testing, TODO). The l.59/l.60 entries describe the new rule. Proposed to B: one-line l.16 qualifier + a Mermaid line. |
| 4 | Low (doc): "pure" claim too broad (the closure reads a mutable ref). | Fixed in the l.60 entry. |
| 5 | Low (doc): "commit doesn't happen" → "no DOM change / consumer re-render". | Fixed in l.59 and semantics item 2. |
| 6 | Info: the reviewer had no shell and could not verify 1126 / typecheck / Biome. It asked for a byte-level check of the frozen files. | Verified by A: targeted log 1126/1126; `sha256sum -c` 537/537 OK (includes `StudioWorkspace.tsx` and doc 091). |

**Architecture note (verbatim):** "The provider's status reducer now depends on the gesture-lifecycle ref (signals 2 and 4, `ArrangementContext.tsx:543-546`). Keep it for now: one rule covers every drag path, and the public hook shape and frozen call sites stay unchanged. Proposal for the planner once call sites unfreeze: switch to a status action that records the gesture flag at dispatch time, so the reducer becomes pure, with SU5/SU6 and a new release-in-same-batch test as acceptance."
(Proposal for B/root only; no refactor done.)

## Known gaps
- The browser rows are A's self-check only. C must run HD-BLOCKED-HOLD with its own protocol (≥ 40 steps, ≥ 20 wiggles, counting window), plus HD-FADE-CLAMP's counting window and HD-READOUT-CHANGING.
- The "reducer reads the flag at render time" semantics are inferred and not measured separately. In my self-check, no late bump appeared on the last move.
- Residual cost: a coalesced update still runs the provider body once, then React bails out. I did not measure it in the browser.
- Real screen reader (R104-T) is not tested.

## Exact next C checks
HD-BLOCKED-HOLD (1280 and 1440), HD-FADE-CLAMP (1280), HD-READOUT-CHANGING (1280), SR-REPEAT-SPACE, SR-REPEAT-FAILED-ROW, SR-TEXT-REG, PX-NET, REG-HYD, G105-3 (fake-Bearer BLOCKED: backend unavailable in cloud), AN-REVIEW (C's own m6/m7 strings; SU1–SU4 vs snapshot = lines 1–314), T105-TARGETED (expect 69 files), SOURCE-UNCHANGED (ArrangementContext diff = 4 hunks listed above).

## B acceptance self-assessment (A's checks only; C decides)
- T1/T2/tests/doc written as specified: yes.
- Fail-before and m6–m9 match §1: yes.
- typecheck / owned-file lint / Biome / targeted 69 files: pass.
- Browser rows: not claimed. The self-check numbers are above.

Backlog is not complete; this round only covers A-R104-REPEAT-DRAG and GATE104-S3.
