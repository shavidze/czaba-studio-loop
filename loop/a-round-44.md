# A — Round 44 report (SRW-13 stage 4c, D-29z9)

Implementer: A (Claude Opus 5.5) · 2026-10-15 · No commit or push. Not a PASS claim; C verifies.

## 1. Pre-flight gate (before the first edit)

- **Assumptions:**
  - §0.1 is a pure removal. The only reader of the ref is the l.836 guard, so the stop condition is not hit.
  - §0.3 compares the target track's `volume` in `setTrackMix(...)`'s result with the stored value, so the model's clamp is used. A missing track returns explicitly.
  - The "consumer render" count is a probe component that calls `useArrangement()` and increments a counter.
- **Smallest version:** −16/+11 lines in the context; one test file; doc 041.
- **Files:** exactly the 3 in §3.2.
- **Success:** PV1–PV4 and L8a red on the snapshot and green after; the frozen suites, full vitest, tsc, build and verify pass; grep finds 0.
- **Rules and primitives read in full** before editing:
  - `read-primitives.md`;
  - the primitives AGENT_DISCOVERABLE_CODE, REACT_CONTEXT, AUDIO_ARCHITECTURE, ERROR_TAXONOMY, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and GEORGIAN_DOCS;
  - the prompts new-test, new-context and studio-feature;
  - `TEMPLATE.md` and the `pre-flight` skill.

  The hook gate fired on the first Write/Edit of each path. I retried each identical edit after confirming the primitive had already been read.
- **Baseline:**
  - HEAD `2c0f800d44bd1b3b7d448a0bde380a165e53402f`; `git status --short` empty.
  - 391 list: 0 non-OK (391 OK).
  - `ArrangementContext.tsx` `91fa12d6…` = snapshot.
  - Protected files 4/4 OK. node.exe 27 at the baseline check.
  - Dev server `/studio-lab` 200.
- **§1.4 re-checks:**
  - `grep -rn "transportRunning\|markTransportRunning" app/`: 10 matches, all in `ArrangementContext.tsx` (l.532, 564, 565, 757, 772, 836, 837, 843, 1032, 1045). The only reader is the l.836 guard, so the stop condition is not hit.
  - `grep -rn "must be used within" app/lib app/components`: **0 matches**, so no test pins the L8 text.
  - Callers of `setTrackMix` and `previewTrackVolume` outside tests:
    - `ArrangementLane.tsx` l.338 (drag `previewValue`), l.343 (`resetTrackVolume`) and l.682 (`onChange`);
    - context l.2048 (Mute, unchanged) and l.2080.

    No caller depends on the extra render or `syncPlayback`; the code-reviewer confirmed this independently (§5). Tests that reference these: `clip-gain`, `master-ui`, `model.test`, `pending-status`; all green.
  - `npx biome check app/contexts/ArrangementContext.tsx` **before** the first edit: exit 0, no diagnostics (`a-round-44/biome-before.txt`). After the edit: exit 0, no diagnostics.

## 2. Red run, mutations, green run

**Red run** (untouched working copy = snapshot `91fa12d6`, `a-round-44/red-run.txt`):

| Case | Result | Failure text |
|---|---|---|
| PV1 | red | `expected 1 to be +0` |
| PV2 | red | `expected 1 to be +0` |
| PV3 | red | `expected 1 to be +0` |
| PV4 | red | `expected 1 to be +0` (the provider pin, see the deviation below) |
| PV5–PV8 | green | — |
| L8a | red | `expected 'useArrangementPosition must be used w…' to be 'useArrangementPositionStore must be u…'` |
| L8b | green | — |

**Deviation (PV4, test-only):**
- The first red run (`red-run-1-consumer-only.txt`) had PV4 **green** with only the consumer-render pin.
- **Cause:** `resetTrackVolume` runs preview and commit in one event. `commitHistory` (model.ts l.603–604) returns `{ ...history, present: before }`, which restores the original `present` object, so the memoized context value comes out unchanged. Consumers do not re-render. The waste on the snapshot is one **provider** render and two `syncPlayback` calls.
- **Fix:** PV4 now also pins `ArrangementProvider` renders = 0, using the fiber `renderLog` copied from `master-ui.test.tsx` (not imported). The probe checks itself with `> 0` before `clear()`, and the consumer pin (0) stays.
- I changed the test, not the code. PV4 is then red on the snapshot.

**C's R44-U table should read:** mutation (a) is caught in PV4 through the provider-render pin, not the consumer pin.

**Mutations** (scratch copy of `store/app` in `a-round-44/scratch/`; `node_modules` was a junction, removed with `cmd /c rmdir`; script `a-round-44/tools/mutate.cjs`; output `a-round-44/mutations.txt`; node.exe 19):

| # | Mutation | Failed tests | Expected |
|---|---|---|---|
| (a) | snapshot | PV1, PV2, PV3, PV4, L8a | ✓ |
| (b) | identity check before `flushPendingMaster()` | PV7 | ✓ |
| (c) | compare the raw argument | PV2 | ✓ |
| (d) | L8 text reverted | L8a | ✓ |
| (e) | also return when the new value equals the `volumeBeforeRef` volume | PV8 | ✓ |
| (f) | no short-circuit for a missing track (`stored && …` compare, no guard) | PV3 | ✓ |
| control | current file | 10/10 green | ✓ |

**Note on (f):** if (f) only deleted the guard and used `stored?.volume`, it would survive by construction (`undefined === undefined`). That is why the code keeps an explicit missing-track return and why (f) is written as above. The reviewer gave C the same advice.

**Green run** (`a-round-44/green-run.txt`, final test sha `63b5dbe5`): **10/10**.

## 3. Diff summary (`a-round-44/diff.txt` against the snapshot)

`app/contexts/ArrangementContext.tsx` (final sha `623f381e…`), +11/−16:
- **Removed:** `transportRunningRef`; `markTransportRunning`; its calls in `stopPlayback`, `pumpPlaybackAudio` and `togglePlayback`; their 3 dependency entries; the guard; the now-unused `const ctx` in the pump. The pump order is unchanged.
- **L8:** the text is now `'useArrangementPositionStore must be used within an ArrangementProvider'`.
- **`previewTrackVolume`:** the check comes after the `flushPendingMaster` block. If the track is missing, it returns. Otherwise it computes `next = setTrackMix(...)` and returns when the target's volume in `next` equals `stored.volume`. Only after that does it set `volumeBeforeRef`, call `updateHistory` and call `syncPlayback`.

  The `const next = setTrackMix(…)` line **moved up** within this block; it is not a new statement. C's R44-S should expect this.

New files:
- `app/lib/arrangement/__tests__/context-hygiene.test.tsx`: 10 `it`s. No `any`, `as`, `@ts-ignore` or comments; `instanceof` is the only narrowing. `console.error` is spied and restored.
- `docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md` (sha `5dadac1f`).

Final `git status --short`, exactly §3.2:

```
 M app/contexts/ArrangementContext.tsx
?? app/lib/arrangement/__tests__/context-hygiene.test.tsx
?? docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md
```

## 4. Browser smoke (A; not a PASS claim; `a-round-44/smoke.txt`)

**Setup:**
- gstack `/browse` with a fresh state file `a-round-44/a-browse.json`. The CLI started its own daemon; no `$B restart`; the fallback was not needed.
- 1440×900, then `/studio-lab`.
- REAL click on `სრული მიქსი`, then `＋ დამატება` (music at 0; end 00:16.000).
- REAL click on `↤`, then `.blur()` (SYNTHETIC) to leave focus on the body.

**Runs 1–2 are invalid:** `$B wait N` did **not** delay; page time advanced about 277 ms across a `wait 2000`. A clock probe showed the AudioContext runs 1:1 (ctx 1.992 s / wall 2.002 s).

**Run 3** uses real delays (`node -e setTimeout`); node.exe 20:

| Step | `arrangement-position` | Master `data-level-db` | Button |
|---|---|---|---|
| start | 00:00.000 | -inf | Play |
| REAL Space, +3.47 s | 00:03.270 | -8.0 | Pause |
| REAL Space (stop) | 00:03.419 | -inf | Play |
| +1.3 s | 00:03.419 (holds) | -inf | Play |
| REAL Space (resume), read about 0.34 s later | 00:03.551 | -5.9 | Pause |
| +2.3 s | 00:05.871 | -9.9 | Pause |
| REAL Space (stop) | 00:06.031 | -inf | Play |
| +1.1 s | 00:06.031 (holds) | -inf | Play |

- Resume starts at the stop point. 3.419 → 3.551 is consistent with about 0.34 s of wall time minus the lookahead.
- Console errors for the page lifetime: only the known root `GET /api/cart` `ERR_CONNECTION_REFUSED` / "Failed to load cart". No workspace errors.
- Not run by A: TR-END, TR-LOOP, TR-SEEK, TR-PREVIEW, REG-*.

## 5. code-reviewer (actual subagent, run once on the diff)

**Score 9/10. No Critical or High findings.**

The reviewer confirmed:
- the latch had no reader and its removal changes no behaviour (`holdUntil` is still used at l.642, in `transport.ts` and in `ArrangementVideoDock.tsx`);
- the identity check is placed correctly and re-reads `historyRef` after the flush;
- the clamp comes from the model;
- pending `before` is kept (PV6) and the return-to-start case is handled (PV8);
- the drag, reset, onChange, keyboard, cancel, blur and claim-revert paths are all safe with a null `before`.

| Finding | Disposition |
|---|---|
| Low (process): PV4 deviates from §2.3 (red only through the provider pin) | **Accepted and reported** (§2 above; doc 041 "პრობლემები"). |
| Nit: describe title said "consumer renders" | **Fixed:** "counts React renders (consumer and provider), not audio". After the change I re-ran the file (10/10), Biome and tsc. |
| Low (C harness): mutation (f) must skip the missing-track return, not rely on `stored?.volume` | **Accepted.** A's (f) is written that way and caught by PV3; passed to C. |
| Low, pre-existing: `setTrackMix` has no `Number.isFinite` guard (NaN would be written; same on the baseline; a range input cannot produce NaN) | **Recorded for B; not changed** (model.ts frozen). Candidate: when model.ts is next opened, make `setTrackMix` return the same object when nothing changes and add an `isFinite` guard (reviewer alternative A). |
| Nit: two `find`s and one allocation per preview | Accepted as negligible; the alternative would copy the clamp or open the frozen model. |
| Nit: PV8 uses `renderHook`, the others use a probe | Kept; both are fine. |
| Info: test-local label constants (`MASTER_VOLUME_LABEL` is not exported) | Kept; the frozen suites do the same, and adding an export is not allowed. |

## 6. Command tails (verbatim; full outputs in `a-round-44/`)

```
git rev-parse HEAD                     -> 2c0f800d44bd1b3b7d448a0bde380a165e53402f (start and end)
sha256sum -c b-round-43-tree-sha256.txt | grep -vc ': OK$'   -> 0   (start and end)
sha256sum app/contexts/ArrangementContext.tsx -> 623f381e0408927c0a87cdc2a598df2db9cc2d610d57a0618f0bb679bf7ab35c
grep -rn "transportRunning\|markTransportRunning" app/       -> (no output; 0)
vitest context-hygiene                 -> Tests  10 passed (10)
frozen 15 suites (node.exe 27)         -> Test Files  15 passed (15) / Tests  287 passed (287)
npx tsc --noEmit                       -> exit 0 (again after the title fix: 0)
npx vitest run (node.exe 27)           -> Test Files  77 passed (77) / Tests  1351 passed (1351)
npm run build                          -> ✓ built in 2.44s / build exit 0
npx biome check ./app                  -> Checked 348 files … Found 2 errors. Found 218 warnings. Found 1 info.
   errors (diagnostic-level=error): app\lib\__tests__\bug-hunting\auth-bugs.test.ts format; app\lib\auth.ts format (baseline CRLF)
   matches for ArrangementContext.tsx|context-hygiene in the output: 0
npm run verify                         -> Test Files 77 passed / Tests 1351 passed / ✓ built / verify exit 0
protected-baseline                     -> 4/4 OK
tasklist | grep -ci node.exe           -> 27 (baseline), 19 (mutations), 27 (gates), 20 (smoke)
```

The full vitest run, build and verify ran **before** the title-only change (same `it` count). After it, A re-ran only the file, Biome on the 2 files and tsc.

## 7. Deviations, known gaps, scope

**Deviations:**
1. PV4 red comes through the provider pin (§2).
2. Smoke runs 1–2 are invalid because of the `$B wait` behaviour; only run 3 counts.
3. `a-round-44/scratch/` (a copy of `store/app` plus a vitest config) is left in A's folder. The junction is removed. I did not delete anything.

**Not done by A** (C scope): TR-END, TR-LOOP, TR-SEEK, TR-PREVIEW, REG-VOL-DBL/PLAY/KEY, REG-MUTE, REG-MASTER, REG-DEL, G44-3 anonymous network audit, and the C-R23-01/C-R38-01 NUL record.

**B acceptance items A actually ran and passed** (C re-verifies):
- R44-S: diff content (+ the moved `next` line), grep 0, 391 OK;
- R44-U: new tests green, red run as described with the PV4 deviation, mutations (a)–(f) caught, frozen suites green;
- G44-1: tsc, vitest 1351, build, Biome;
- G44-2: protected 4/4, 391 OK, git status = §3.2, HEAD unchanged;
- R44-Doc: doc 041 written.

**Not claimed:** R44-TR (only the A smoke of TR-PLAY), R44-REG, G44-3, and the Ableton verdicts (all three rows are "not applicable").

**For B / root:**
- **New record:** setTrackMix-NaN / identity (Low, pre-existing, model.ts frozen).
- **Root:** `publication-checkpoint.json` now has a `round43Checkpoint` key, so ROOT-ROUND43-CHECKPOINT-RECORD looks recorded and B should verify and close it.
- **Carried from `root-pre-push-review.md`:** M1–M3, L1–L4 and L6–L8 are closed and L5 is accepted (per the task); A found nothing new there.

## 8. Exact next C checks

1. G44-2 first, then `diff -u` against the snapshot (expect the hunks in §3 including the moved `next` line), then grep 0.
2. R44-U: re-run red/green yourself.
   - Mutation (a) is caught in PV4 through the `ArrangementProvider` render pin.
   - Write (f) as "skip the missing-track return" (`stored && …`), not `stored?.volume`.
   - `a-round-44/tools/mutate.cjs` reproduces (b)–(f) against the current file.
3. R44-TR: TR-PLAY, TR-END, TR-LOOP (≥ 2 wraps, meter above the floor within 300 ms of each wrap), TR-SEEK, TR-PREVIEW.
   - **Warning:** `$B wait N` did not delay in A's daemon. Use a real delay, e.g. `node -e "setTimeout(()=>{},N)"`, or in-page timestamps from `performance.now()`.
4. R44-REG: REG-VOL-DBL (0 entries at 100 %; drag to 72 % gives 1; dblclick gives 1 more; Ctrl+Z gives 72 %), REG-VOL-PLAY, REG-VOL-KEY, REG-MUTE, REG-MASTER, REG-DEL.
5. G44-1 (`render-budget` R9-L2 included), G44-3, R44-Doc, the Ableton two-verdict table, and the C-R23-01/C-R38-01 record.
