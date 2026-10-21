# A — Round 12 report: C-R7-01, post-swap video settle (amended D-19a)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-10 · Task: `current-task.md` (round 12) · Working dir: `C:/Apps/czaba-project/store`

**Scope completed:**
- the pure settle helper;
- the dock wiring at the §2.2 sites only;
- the R12-U tests, including the simulation and a two-part guard proof;
- doc 020 (status and TODO only) and the new doc 021.

Every gate below was actually run. My browser runs are **A's evidence, not a verdict**. **No PASS is claimed. Nothing was committed or pushed.**

## 1. Pre-flight gate

**Assumptions:**
- The cause is already established (C round 10): the D-19 deadband (0.02) against the ±0.01 window. I did not re-diagnose it.
- Settle arms only at a successful standby swap (wrap, boundary or gap-entry). The steady rule, D-24/D-24a, hold/seek and the other dock paths stay byte-unchanged.
- The dock already has a local `settles` (the seek-event handler list). To keep that separate, the new concept is named `postSwapSettle` (state) and `postSwapSettles` (counter), and the dataset key is `data-video-settles` as required.

**K and settle cap: K = 9, band 0.008, rate [0.55, 1.45], cap 1.0 s.**

I used the §4 R12-U model: 60 Hz, the rate takes effect one frame after it is written, the 0.05 step, the swap at offset 0, a 30 ms freeze from +22 ms, and every sample fed through the stall window. The numbers come from `a-round-12/sim/numbers.txt`, using the bundled real helper:

| Model | d(+300) | Max rate | Settle end |
|---|---|---|---|
| Steady only (K=4), control | −0.0183 | 1.10 | — |
| K=8, 30 ms freeze | −0.0069 | 1.25 | +0.200 (re-entry) |
| **K=9, 30 ms freeze** | **−0.0060** | **1.25** | +0.183 (re-entry) |
| K=9, 50 ms freeze | −0.0055 | 1.40 | +0.250 |
| K=9, 70 ms freeze | −0.0076 | 1.45 | +0.300 |
| K=8, 70 ms freeze | −0.0097 | 1.45 | — |

- I chose K = 9 because it keeps more margin under the longer freezes that C actually measured (lag up to about −0.05).
- My peak in the 30 ms model is 1.25. B's text says "≤ 1.35". I am reporting my own number.

**Smallest design:**
- about 50 lines in `video-sync.ts`: 5 constants, 2 types, `videoSettleRateCorrection` and `createVideoSettleState`;
- 14 changed lines in the dock.

**Files, each with its reason:**
- `video-sync.ts`: the helper (§2.1).
- `video-sync.test.ts`: R12-U.
- `ArrangementVideoDock.tsx`: the §2.2 sites.
- Doc 020: the C round-11 status.
- Doc 021: the implementation doc.

**Success:**
- `npx vitest run app/lib/arrangement/__tests__/video-sync.test.ts` is green, with the R12-U tests;
- the guard mutations fail the named tests;
- tsc 0, Biome 0 errors, the build passes, full vitest ≥ 856 + new tests with 0 failures.

## 2. Design

### Helper API (`app/lib/arrangement/video-sync.ts`)

**Constants:**

| Constant | Value |
|---|---|
| `VIDEO_SETTLE_BAND_SECONDS` | 0.008 |
| `VIDEO_SETTLE_GAIN` | 9 |
| `VIDEO_SETTLE_RATE_MAX` | 1.45 |
| `VIDEO_SETTLE_RATE_MIN` | 0.55 |
| `VIDEO_SETTLE_MAX_SECONDS` | 1 |

All five are exported.

**Types:** `VideoSettleRate { rate, settling }` and `VideoSettleState { armSettle(ctxTime), settleRate(ctxTime, drift), endSettle() }`.

**`videoSettleRateCorrection(drift)`:**
- It has the same shape and rounding as `videoRateCorrection`: it returns 1 when |d| ≤ band or d is non-finite.
- Otherwise steps = sign × max(1, round(|K·d| / 0.05)) and rate = round2(1 − steps·0.05), clamped to [MIN, MAX].

**`createVideoSettleState()`:**
- It is a closure over `armedAt` and `exceededBand`, driven by audio-clock time.

**`settleRate` order:**
1. Compute the steady rate.
2. If not armed, return steady with `settling: false`.
3. If `ctxTime < armedAt` (clock went backwards) or `ctxTime − armedAt ≥ 1.0 − 1e-9`, end and return steady.
4. If |d| > band, set `exceededBand`.
   - Else, if `exceededBand && |d| ≤ band`, end and return steady. This is the re-entry rule; an in-band first sample does not end settle. NaN is neither exceeded nor re-entered.
5. If `isVideoRateAtStallEdge({drift, rate: steady})`, return steady with `settling: true`. This is the D-24 priority, and settle does not end.
6. Otherwise return `videoSettleRateCorrection(d)` with `settling: true`.

**Unchanged:** `videoRateCorrection`, `VIDEO_RATE_GAIN`, `VIDEO_SOFT_SYNC_DEADBAND_SECONDS` and every `VIDEO_STALL_*` are byte-unchanged; the diff touches none of them.

### Dock sites (`ArrangementVideoDock.tsx`; base line → final line)

| Site | Base | Final |
|---|---|---|
| Import: added `createVideoSettleState` and `type VideoSettleState`; removed the now-unused `videoRateCorrection` | 11–24 | 11–25 |
| `DockSyncState`: added `postSwapSettles: number` and `postSwapSettle: VideoSettleState` | 63–76 | 76, 78 |
| Initialiser | 239–252 | 254, 256 |
| `publishCounters`: `root.dataset.videoSettles = String(state.postSwapSettles)` | after 273 | 279 |
| `issueHoldSeek`: `endSettle()` (covers every hard seek, hold and escalation) | 320–321 | 328 |
| `stopAllSlots`: `endSettle()` | 339 | 347 |
| Swap block: `armSettle(due.atCtx)` and `postSwapSettles += 1` before `publishCounters()`. This is the only arming site and the only counter increment | 406–409 | 415–416 |
| `!target \|\| !source` pause branch: `endSettle()` | 437–438 | 449 |
| Rate write: `const { rate } = state.postSwapSettle.settleRate(clock.ctxTime, drift);` The written rate is still pushed to the stall window; the escalation check and `writeVideoRate` have not moved | 547 | 558 |
| `wasPlaying` reset: `endSettle()` | 591 | 603 |

**Why the hold-release start (base 488–492) and the paused/first-Play start (base 495–521) do not arm:**
- Those paths start an element that seek-and-hold or the start hold has positioned, and `holdRelease` releases it.
- The decoder's post-`play()` freeze after a pre-positioned standby swap is the C-R7-01 cause, and that only happens in the swap block.
- The D-19a amendment explicitly excludes them, and RF5-3 requires `data-video-settles` to stay 0 until the first swap. My runs showed `videoSettles: "0"` before Play.

## 3. Files actually changed (a subset of §3.2)

| File | Change |
|---|---|
| `app/lib/arrangement/video-sync.ts` | M (additions only) |
| `app/lib/arrangement/__tests__/video-sync.test.ts` | M (import list extended plus appended tests; `diff` shows 0 removed lines) |
| `app/components/arrangement/ArrangementVideoDock.tsx` | M (the §2.2 sites only) |
| `docs/implementation/2026/quarter-IV/020-studio-lab-track-fold-autofit.md` | Status line and two TODO lines (`a-round-12/diff-doc020.txt`) |
| `docs/implementation/2026/quarter-IV/021-studio-lab-post-swap-settle.md` | New |

**Confirmations:**
- **Baseline at start.** `sha256sum -c b-round-11-tree-sha256.txt` gave 37/37 OK at start (`a-round-12/gates/b11-check-start.txt`, empty means all OK).
- **Frozen files.** `gates/frozen-start.txt` holds the 33 non-owned entries of `b-round-11-tree-sha256.txt`.
  - At the end, `sha256sum -c frozen-start.txt` gives 0 non-OK lines.
  - At the end, `sha256sum -c b-round-11-tree-sha256.txt` shows only my 4 owned files as changed: `ArrangementVideoDock.tsx`, `video-sync.test.ts`, `video-sync.ts` and doc 020.
- **No round-6..11 file was reverted or reformatted.** `biome --write` ran only on my 3 code files.
- **Base backups** are `a-round-12/bak/{video-sync.base.ts, video-sync.test.base.ts, ArrangementVideoDock.base.tsx, 020-…base.md}`. Their sha256 equals `b-round-11-tree-sha256.txt` (64206a93…, 699516c3…, a4c4f17e…, 65672f45…).
- **`Header.tsx`:**
  - `git diff app/components/layout/Header.tsx` is empty, so it is identical to HEAD;
  - `git diff cc1e531 --stat -- Header.tsx` shows +21/−0.
- **Protected files:** all 4 OK (`gates/protected.txt`).
- **Instrumentation grep** (`console.|debugger|window.__` in the two source files): 0 lines (`gates/instrumentation-grep.txt`).
  - No wrapper was ever added to source. The wrap runs used only the existing dataset and C's harness.
  - Final dock copy: `bak/ArrangementVideoDock.final.tsx`. Final hashes: `gates/owned-final-sha256.txt` (dock af27c1f7…).
- **Git status:** the §3.1 paths plus the new doc 021. The foreign `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` are untouched and unread; I report them to root.

## 4. Command tails (verbatim; full logs in `a-round-12/gates/`)

```
$ npx vitest run app/lib/arrangement/__tests__/video-sync.test.ts
 Test Files  1 passed (1)
      Tests  58 passed (58)
$ npx vitest run app/lib/arrangement
 Test Files  21 passed (21)
      Tests  413 passed (413)
$ npx vitest run
 Test Files  53 passed (53)
      Tests  877 passed (877)
   Duration  39.56s
$ npx tsc --noEmit            -> exit 0, no output
$ npx biome check app/lib/arrangement app/components/arrangement
Checked 52 files in 351ms. No fixes applied.        (exit 0)
$ npx biome check ./app
Checked 319 files in 152ms. No fixes applied.
Found 218 warnings.
Found 1 info.                                        (exit 0; 0 warnings in my files, same count as round 11)
$ npm run build              -> exit 0
build/server/index.js                    1,257.44 kB
✓ built in 2.15s
$ git diff app/components/layout/Header.tsx   -> (empty)
$ node -e "...protected-baseline..."
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ git diff --stat
 17 files changed, 2156 insertions(+), 263 deletions(-)
```

**Notes:**
- Every gate in this section (video-sync, arrangement, full vitest 877, tsc, Biome, build) ran after the last edit to any code or test file; the final source hashes are in `gates/owned-final-sha256.txt`. The docs were written afterwards.
- The `sfx-library` flake did not recur.
- `npm.cmd run check` was **not** run. `biome check --write` was used only on my 3 code files, and the read-only `./app` run shows no format diffs, so nothing else needed it.

## 5. A's own wrap runs (evidence, not a verdict)

**Setup:**
- C's round-10 harness, copied to `a-round-12/` (`setup.sh`, `b.sh`, `r.sh`, `drift10.sh`, `sum10.js`, `scripts/wrapdetail.js`) with the state file `a-browse.json`. C's own files were not edited.
- Batch: `a-round-12/batch12.sh`, which also records the dock dataset before and after each run.
- Layout L6 at 1440×900: fresh `goto` → `r3v1lay.js` → `looplay.js` (loop 2–4) → `drift10` `{vclips R3-V1, durMs 8500, from 1, loop 2–4}`.
- 3 runs, each with a fresh page load. None was invalid: cover 0 in all three, so no replacements were used.
- Server: the existing http://127.0.0.1:5173. No `store/` edit was made during the runs (19:52–19:54); the docs were written afterwards.

| Run/wrap | d300 | ctx at row | max \|d\| 0–500 ms | Settle-window rate writes | Swap | Hard seek in window |
|---|---|---|---|---|---|---|
| W_1 w1 | +0.0036 | +0.310 | 0.0551 | 1.15,1.2,1.4,1.45,1.4,1.35,1.4,1.25,1 | yes | no |
| W_1 w2 | +0.0072 | +0.310 | 0.0566 | 1.15,1.2,1.4,1.45,1.4,1.3,1.25,1.1,1 | yes | no |
| W_1 w3 | +0.0066 | +0.310 | 0.0526 | 1.15,1.2,1.4,1.45,1.35,1.45,1.35,1.25,1.2,1.1,1 | yes | no |
| W_2 w1 | +0.0074 | +0.310 | 1.9838 *(see note)* / 0.0558 excl. | 1.15,1.2,1.4,1.45,1.4,1.25,1.2,1.1,1.05,1.1,1 | yes | no |
| W_2 w2 | +0.0035 | +0.310 | 0.0391 | 1.15,1.25,1.3,1.35,1.25,1.15,1 | yes | no |
| W_2 w3 | −0.0092 | +0.302 | 0.0380 | 1.1,1.25,1.35,1.25,1.15,1 | yes | no |
| W_3 w1 | −0.0008 | +0.302 | 0.0461 | 1.2,1.4,1.3,1.25,1.15,1.1,1.15,1 | yes | no |
| W_3 w2 | +0.0002 | +0.310 | 0.0477 | 1.2,1.4,1.35,1.45,1.4,1.3,1.25,1.15,1 | yes | no |
| W_3 w3 | +0.0006 | +0.310 | 0.0488 | 1.2,1.4,1.45,1.4,1.3,1.25,1.15,1.1,1.15,1 | yes | no |

**Per-run results (rf7/rf5an):**
- verdict PASS, raw max 0.0176/0.0171/0.0165, cover 0, stalls 0;
- multi 0, sets while seeking 0, rate [1, 1.45], one visible element, both muted, frames past `loop.end` 0;
- `appLoaf50` empty and CPU median 8–10 %;
- one hard seek per run at ≈ 8.46–8.49, the gap-entry seek outside every wrap window. The same seek appears in C's round-10 runs.

**Counters (`runs/w-summary.txt`):**
- before each run: `videoSwaps 0, videoSettles 0, videoEscalations 0`;
- after each run: `videoSwaps 3, videoSettles 3, videoEscalations 0, videoFallbacks 0`.

So settles increased by exactly 1 per swap, and there were 0 escalations.

**Settle end time and reason:** these are **inferred, not instrumented**. No source instrumentation is allowed, so the end shows in the series where the rate returns to 1 with |d| ≤ 0.008 after exceeding it. For example, in W_1 w1 the end is at about +0.21 s (d −0.0068 after a peak of −0.055), which is a re-entry. None of the wraps hit the 1.0 s cap.

**Note on W_2 w1, `maxAbsD500 = 1.98`:**
- A single row at ctx +0.0007 s still shows the outgoing element `v1` at 3.9844, before the dock's swap rAF in the same frame. The next row (+0.022) is `v2` at d −0.021.
- This is the ordering of the harness rAF against the dock rAF within one frame. The swap timing code is unchanged this round (`due.atCtx` and `lateBy` were not edited).
- Excluding that row, the max is 0.0558. C should judge it under its own rules; I am not filtering it.

## 6. New and changed tests

**Named exception:**
- The `video-sync.test.ts` import list was extended with the new and needed symbols: `createVideoSettleState`, `isVideoRateAtStallEdge`, `VIDEO_RATE_STEP`, `VIDEO_SETTLE_*`, `VIDEO_STALL_LAG_RATE`, `VIDEO_STALL_LEAD_RATE`, `type VideoSettleState` and `videoSettleRateCorrection`.
- Before: 17 imported names. After: 29.
- No existing assertion or test changed, and the diff has 0 removed lines. "uses a gain K inside [2, 5]" passes unchanged.

**21 new tests (856 → 877):**

| Describe | Tests (reason) |
|---|---|
| D-19a post-swap settle constants (R12-U) | **Ranges:** band ≤ 0.008, K ∈ [8, 9], MAX ≤ 1.45 and `< VIDEO_STALL_LAG_RATE`, MIN ≥ 0.55 and `> VIDEO_STALL_LEAD_RATE`, cap = 1 |
| videoSettleRateCorrection (R12-U) | **Band:** 1 inside the band, including NaN. **Just outside the band:** it corrects where the steady rule returns 1. **Monotone:** non-increasing over −1.2…1.2. **Range and step:** within [MIN, MAX] and on the 0.05 step over −3…3. **Gain:** d = −0.02 is 4 steps |
| createVideoSettleState (R12-U) | **Never armed:** equals the steady rule over a 2401-point grid. **In-band first sample:** d −0.0007 does not end settle. **Re-entry:** ends it, then the steady rule applies over the grid. **No hunting:** constant ±0.012 after the end gives rate 1. **Cap:** ends at `armedAt + 60/60`, steady grid afterwards. **Below the cap:** still settling at cap − 1e-6. **`endSettle()`** ends it, steady grid afterwards. **Backward clock** ends it, steady grid afterwards. **New arm** restarts settle. **D-24 priority:** ±0.119, −0.12, −0.3, 0.2 return the steady rate with settle continuing; −0.11 gives 1.45 and +0.11 gives 0.55. **Stall-edge property:** a fresh armed state per grid drift marks a stall edge exactly when the steady rule does, and is still settling. **NaN:** neither leaves nor re-enters the band |
| post-swap settle simulation (C-R7-01, R12-U) | **Steady control:** \|d(+300)\| > 0.01, which documents the bug. **Settle:** \|d(+300)\| ≤ 0.01 and ≈ −0.006 (measured −0.00603), no escalation at any frame, max rate ≤ MAX, and after the re-entry end every frame has rate 1 with settling false. **400 ms freeze:** the escalation frame equals the steady control's (frame 27), and every control edge sample is an edge sample with settle |

**Guard proof** (`a-round-12/guard-proof.txt`, run on the final source):
- **Guard 1.** The end rule was changed to `else if (|d| ≤ band)`, so the first in-band sample ends settle.
  - Three tests fail: "does not end on an in-band first sample (d = −0.0007)", "restarts on a new arm" and "lands within 0.01 at +300 ms…" (the simulation).
  - Restored; `cmp` is identical.
- **Guard 2.** `VIDEO_SETTLE_RATE_MAX` was set to 1.5.
  - Three tests fail: the constants test, the stall-edge property test and the 400 ms stall-priority comparison.
  - Restored; `cmp` is identical.
- After restore, 58/58 pass, and the sha256 before and after is `ae3c143e…`.
- An earlier guard run, made before the review fix, is kept in `guard-proof-v1-prereview.txt`.

## 7. Code review (the actual `code-reviewer` subagent)

**Review 1** (full diff of the 3 code files): **"No Critical, High or Medium issues… two Low findings and three Nits."**

| Finding | What it said | Action |
|---|---|---|
| Low 1 | Settle can stay armed after `sourceChanged` (dock base l.462–465), or after an unforced paused restart, for at most 1.0 s. The reviewer said this is a spec gap for B. | **Not changed**, because §2.2 restricts the dock to the listed sites. Escalated to B (§9). |
| Low 2 | There is no full-grid property test that settle never adds or removes a stall-edge sample. | **Fixed:** I added the property test, and guard 2 now also fails it. |
| Nit 1 | NaN counts as re-entry. | **Fixed:** re-entry now requires `\|d\| ≤ band`, and I added a NaN test. |
| Nit 2 | There is no dock-level arm test. | Not done. C covers it through `data-video-settles`. |
| Nit 3 | There is no test just below the cap. | **Fixed:** I added it. |

**Review 2** (the fix delta): **"The delta is correct. I found no Critical, High or Medium issues and no new behavioural problems."** Score 9/10. It raised two Lows:

| Finding | What it said | Action |
|---|---|---|
| Low | The property test does not assert `settling`. | **Fixed:** added `expect(settling).toBe(true)`. |
| Low (nit) | The test name says "non-finite", but only NaN is covered. | **Fixed:** renamed to "NaN drift". |

Both fixes are test-only, so the source sha `ae3c143e…` and the guard proof still hold. I re-ran the tests afterwards: 58/58 for video-sync, 413/413 for arrangement, tsc 0 and Biome 0.

## 8. Deviations

1. **K = 9, not 8.** Both are allowed; K = 9 is more robust in the 70 ms freeze model.
2. **The re-entry test needs `exceededBand && |d| ≤ band`,** not just `else if (exceededBand)`. This is the review fix for NaN; behaviour for finite drift is identical.
3. **Settle end time and reason are inferred from the rate series,** because source instrumentation is not allowed.
4. **The 400 ms stall test uses ±0.119 for the steady edge.** At exactly 0.11875 the steady rule gives 1.45 because of floating point (4·0.11875/0.05 = 9.4999…). This is recorded in doc 021.

## 9. Not ready, pending C, and follow-ups

**Not ready (unfinished scope): none.** Everything in task §2 and every R12-U item is implemented and green, and the two-part guard proof is done.

**Pending C's verdict (A claims no PASS):**
- **R12-W1, R12-S:** need C's 3 verdict runs. Mine are only evidence.
- **R12-Doc:** needs C's check.
- **Adjacent regressions:** R2-V3 ×1, RF5-3 ×1 (H2), R3-V1 mode N ×1, R5-L3/R5-E1, RF7-P2 and the dock quick check at 1440×900 and 1280×720. These are C's checks by design; A did not run them.
- **G12-3** (anonymous network): C's check; A did not run it.

**Exact next C checks:**
1. R12-W1/H3 under the L6 layout, with 3 valid runs, the first one after a fresh load. Use `wrapdetail.js` `d300` and max |d| over 500 ms, plus `data-video-settles` before and after (`a-round-12/counters.js` reads the whole dock dataset).
   - Decide how to treat the same-frame pre-swap row (W_2 w1, +0.0007, `v1`).
2. R12-S: rows outside swap → +1.0 s must have rate ≠ 1 only when |d| > 0.02.
3. R12-U: `npx vitest run app/lib/arrangement/__tests__/video-sync.test.ts` gives 58. Re-run the guard proof.
4. The §6 adjacent checks:
   - R2-V3: settles count = boundary swaps.
   - RF5-3: `videoSettles` stays 0 until the first swap.
   - R3-V1 N: no worse than .0131/.0207.
   - Export: maxDiff ≤ 1.2e-7.
5. Gates G12-1..3.
   - For the dock `cmp`, use `a-round-12/bak/ArrangementVideoDock.final.tsx`. Hashes are in `gates/owned-final-sha256.txt`.

**For B:**
- **Review Low 1:** `endSettle()` at `sourceChanged`, a 5th end site. The alternative is to accept the 1.0 s bound.
- **Carried root items** (§6.5; still open and honest):
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - export hard-clip at 0 dBFS (R13-M4/SRW-13);
  - the final commit/push only after everything.
- **`root-pre-push-review.md` / `publication-checkpoint.json`:** their remaining items are already in that carried list and in `feature-status.md`. The scrollbar request and the inherited middle-east loader stay with B. Nothing new from this round.
- **Foreign files:** `.claude/agents/frontend-architect.md` and `.codex/agents/frontend-architect.toml` are for root to decide.
