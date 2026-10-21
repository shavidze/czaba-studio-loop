# A — Round 10 report: C-R7-01 wrap landing diagnosis + C-R7-02 ruler last tick

Implementer: A (Claude Opus 5.5) · Date: 2026-10-10 · Task: `tasks/round-10` = `current-task.md`. Nothing committed, stashed, pushed or deployed. Dev server `http://127.0.0.1:5173` was used as is (not started or stopped). All browser work went through gstack browse with state `a-browse.json`.

**No acceptance ID is claimed as PASS.** Everything here is A's evidence and is pending C.

## 1. Pre-flight gate

- **Assumptions**
  - C-R7-01 is "diagnose first". Source changes only for a cause (a), (b) or (d) that the numbers confirm.
  - C-R7-02: the extra pixel comes from an element past the content edge, not from the label estimate.
  - Baseline is HEAD `c5ed47b` plus the round-6..9 dirty tree (verified identical to §3.1 at start; vitest baseline 809/809).
- **Instrumentation result.** See §1.1. (a), (b), (d) and (m) as B defined them are each **refuted** by the numbers. Best supported: **(c) environment**, a post-start media-clock freeze. Soft sync recovers it only to the D-19 deadband. It happens on every swap, not only the first.
- **Smallest fix**
  - C-R7-01: **no app-side cause found within the allowed shapes, so no source change** (dock `cmp`-identical to its round-start state).
  - C-R7-02: a one-line `.filter` in `rulerTickMarks` plus the constant `RULER_TICK_LINE_PX = 1`.
- **Files touched**
  - `view.ts`: the fix.
  - `view.test.ts`: new cases plus the named exception.
  - Doc 018: status/TODO only.
  - Doc 019: new.
  - The dock was temporarily probed and then restored.
- **Success commands**
  - `npx vitest run` ≥ 809 + new, 0 fail.
  - `npx tsc --noEmit` 0.
  - Biome on the owned paths and on `./app` 0 errors.
  - `npm run build` OK.
  - Protected hashes OK.
  - `grep a10Probe app/` = 0.
  - Guard: the new tests fail on round-9 `rulerTickMarks`.
  - Post-fix `r702diag.js` overflow ≤ 1 at both viewports.

### 1.1 Wrap instrumentation (C-R7-01)

**Method**
- Temporary probe in `ArrangementVideoDock.tsx` (marker `a10Probe`). Backup `a-round-10/bak/ArrangementVideoDock.base.tsx`; probe copy `bak/ArrangementVideoDock.probe.tsx`.
- Restored with `cp`, `cmp` identical. `grep -rn "a10Probe\|__a10" app/` → 0. `bak/ArrangementVideoDock.fixed.tsx` = base, because there is no fix.
- **Harness.** C's `setup.sh`/`b.sh`/`r.sh`/`drift7.sh`/`sum7.js` were copied to `a-round-10/harness/`, with `BROWSE_STATE_FILE=a-browse.json` and temp files and outputs under `a-round-10/`. `a10run.sh` = `drift7.sh` + probe reset + probe dump. `a10wraps.js` writes `runs/{K}_wraps.json`.
- **Layout.** L6, 1440×900: `setup.sh` (fresh `goto`) → `r3v1lay.js` → `looplay.js` (2–4) → `{vclips R3-V1, durMs 8500, from 1, loop 2–4}`.
- **Runs.** `W_1..W_5` after one fresh load; W_1 is the first run after the load. `F_1` is a second fresh load with a single run. Total 6 runs × 3 wraps = 18 wraps. This is the 5 × 3 budget plus the one fresh-load run.

**Validity.** All 6 runs: 0 app LoAF ≥ 50, 0 hard seek in the wrap windows, 0 fallbacks, 3 swaps per run.
- Stall coverage was 0 % except W_2 (3.6 %, one stall).
- CPU median 12.7–22.7 %.
- Drift raw max 0.0156–0.0202 (`summary.txt`).

**Per-wrap table** (`a-round-10/runs/wrap-table.md`; raw in `runs/{W_1..W_5,F_1}_wraps.json`).
- `seeked` relative to the wrap = pre-seek issue time + seek latency, i.e. about −0.91 to −0.96 s on every probed wrap (first-swap wraps ≈ −0.92: W_1 −0.970 + 0.053 = −0.917, F_1 −0.978 + 0.054 = −0.924).
- "carried" means the standby was prepared at the end of the previous run. `stopAllSlots` keeps `preparedKey`, and the standby was already positioned at 2.0. This is not a bug.

| run | wrap | first swap (ordinal) | pre-seek issued rel. wrap | seeked | lateBy s | readyState | seeking | offset at swap s | playPending | play() → resolved / playing ms | harness vt +300 | probe d at +300 s | max abs d 500 ms | rate writes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| W_1 | 1 | yes (1) | -0.97 s after metadata×1 | +53 ms after issue | 0.0113 | 4 | false | 0 | false | 7.7 / 7.6 | 2.292 (ctx+0.31) | -0.0204 | 0.0551 | 1.1,1.2,1.15,1.1,1,1.1,1 |
| W_1 | 2 | no (2) | -0.9887 s | +43.2 ms after issue | 0.0113 | 4 | false | 0 | false | 5.9 / 5.8 | 2.296 (ctx+0.31) | -0.0148 | 0.0538 | 1.1,1.2,1.15,1.1,1.15,1.1,1,1.1,1 |
| W_1 | 3 | no (3) | -0.9887 s | +40.7 ms after issue | 0.0113 | 4 | false | 0 | false | 6.4 / 6.2 | 2.276 (ctx+0.302) | -0.0191 | 0.0552 | 1.1,1.2,1.15,1.1,1.15,1.1,1,1.1,1 |
| W_2 | 1 | no (4) | carried | — | 0.0087 | 4 | false | 0 | false | 6.4 / 6.4 | 2.288 (ctx+0.31) | -0.0226 | 0.0489 | 1.1,1.15,1.2,1.15,1.1,1,1.1,1 |
| W_2 | 2 | no (5) | -0.9913 s | +40.5 ms after issue | 0.0087 | 4 | false | 0 | false | 5.3 / 5.3 | 2.289 (ctx+0.31) | -0.0238 | 0.0498 | 1.1,1.2,1.15,1.2,1.15,1.1,1.15,1.1,1,1.1,1 |
| W_2 | 3 | no (6) | -0.9913 s | +43.9 ms after issue | 0.0087 | 4 | false | 0 | false | 5.1 / 5 | 2.288 (ctx+0.31) | -0.0239 | 0.049 | 1.1,1.15,1.2,1.15,1.1,1.15,1.1,1,1.1,1 |
| W_3 | 1 | no (7) | carried | — | 0.0113 | 4 | false | 0 | false | 5.1 / 4.8 | 2.29 (ctx+0.31) | -0.0218 | 0.0536 | 1.1,1.2,1.15,1.1,1,1.1,1 |
| W_3 | 2 | no (8) | -0.9887 s | +35.8 ms after issue | 0.0113 | 4 | false | 0 | false | 4.6 / 4.5 | 2.292 (ctx+0.31) | -0.0206 | 0.0555 | 1.1,1.15,1.2,1.15,1.1,1,1.1,1 |
| W_3 | 3 | no (9) | -0.9887 s | +37.5 ms after issue | 0.0113 | 4 | false | 0 | false | 5 / 5 | 2.292 (ctx+0.31) | -0.0203 | 0.0535 | 1.1,1.15,1.2,1.15,1.1,1.15,1.1,1,1.1,1 |
| W_4 | 1 | no (10) | carried | — | 0.0007 | 4 | false | 0 | false | 6 / 6 | 2.286 (ctx+0.302) | -0.0157 | 0.0492 | 1.1,1.15,1.2,1.15,1.1,1,1.1,1,1.1,1,1.1,1 |
| W_4 | 2 | no (11) | -0.9887 s | +42.7 ms after issue | 0.0007 | 4 | false | 0 | false | 5.1 / 5.1 | 2.29 (ctx+0.31) | -0.0146 | 0.0498 | 1.1,1.15,1.2,1.15,1.1,1,1.1,1 |
| W_4 | 3 | no (12) | -0.9993 s | +41 ms after issue | 0.0007 | 4 | false | 0 | false | 5.3 / 5.3 | 2.289 (ctx+0.302) | -0.0136 | 0.0498 | 1.1,1.15,1.2,1.15,1.1,1,1.1,1,1.1,1 |
| W_5 | 1 | no (13) | carried | — | 0.0087 | 4 | false | 0 | false | 5.4 / 5.3 | 2.291 (ctx+0.31) | -0.021 | 0.0523 | 1.1,1.15,1.2,1.15,1.1,1.15,1.1,1,1.1,1 |
| W_5 | 2 | no (14) | -0.9913 s | +45 ms after issue | 0.0087 | 4 | false | 0 | false | 5.3 / 5.3 | 2.292 (ctx+0.31) | -0.0207 | 0.0506 | 1.1,1.15,1.2,1.15,1.1,1.15,1.1,1,1.1,1 |
| W_5 | 3 | no (15) | -0.9913 s | +42.4 ms after issue | 0.0087 | 4 | false | 0 | false | 5.4 / 5.3 | 2.291 (ctx+0.31) | -0.0197 | 0.0535 | 1.1,1.2,1.15,1.1,1,1.1,1 |
| F_1 | 1 | yes (1) | -0.978 s after metadata×1 | +53.6 ms after issue | 0.0007 | 4 | false | 0 | false | 7.2 / 7.2 | 2.285 (ctx+0.302) | -0.0172 | 0.0438 | 1.15,1.2,1.15,1.1,1 |
| F_1 | 2 | no (2) | -0.9993 s | +39.2 ms after issue | 0.0007 | 4 | false | 0 | false | 5.4 / 5.3 | 2.284 (ctx+0.302) | -0.0181 | 0.0435 | 1.15,1.1,1,1.1,1,1.1,1 |
| F_1 | 3 | no (3) | -0.9993 s | +38.4 ms after issue | 0.0007 | 4 | false | 0 | false | 5.5 / 5.5 | 2.286 (ctx+0.302) | -0.0166 | 0.0443 | 1.15,1.2,1.15,1.2,1.15,1.1,1,1.1,1 |

**Swap-instant readiness offset distribution (all 18 wraps):** min 0.0000, max 0.0000. Harness vt +300 < 2.29 in **9/18** wraps; both first-swap wraps (W_1 w1 2.292, F_1 w1 2.285) are included in the 18.

**Verbatim d series, W_1 wrap 1.** Each entry is [rel s, vt, d, rate, playPending, paused]:
```
[0.0113,2,-0.0113,1,1,0],[0.03,2.0147,-0.0153,1,0,0],[0.0407,2.0152,-0.0255,1.1,0,0],[0.062,2.0152,-0.0468,1.2,0,0],[0.0807,2.0256,-0.0551,1.2,0,0],[0.0913,2.0414,-0.05,1.2,0,0],[0.11,2.0607,-0.0493,1.2,0,0],[0.1313,2.0793,-0.052,1.2,0,0],[0.142,2.0997,-0.0423,1.15,0,0],[0.1607,2.1195,-0.0412,1.15,0,0],[0.182,2.1391,-0.0429,1.15,0,0],[0.19,2.1585,-0.0315,1.15,0,0],[0.2113,2.1778,-0.0335,1.15,0,0],[0.23,2.1969,-0.0331,1.15,0,0],[0.2513,2.2176,-0.0338,1.15,0,0],[0.262,2.2353,-0.0267,1.1,0,0],[0.2807,2.2544,-0.0263,1.1,0,0],[0.2913,2.2731,-0.0182,1,0,0],[0.31,2.2896,-0.0204,1.1,0,0],...
```
The rVFC presented frames in F_1 (`F_1_probe.json` `frames`) show the same pattern. The first new presented frame after the swap arrives at +0.07 s with mediaTime 2.033 (30 fps content), and presented frames then lag 0.014–0.038 s.

**Cause (c): environment, a post-start media-clock freeze; plus a spec interaction. Not (a), (b), (d) or (m).**
- **(a) refuted.**
  - The pre-seek is issued 0.97–1.00 s before the wrap.
  - `seeked` comes 36–54 ms later, so about 0.91–0.96 s before the wrap.
  - The only skip is one `metadata` rAF on the first swap of a session.
- **(b) refuted.**
  - `play()` → `playing` is 4.5–7.7 ms on every swap. First swaps: 7.6 and 7.2 ms; later swaps: 4.5–6.4 ms.
  - There is no first-swap-only outlier.
  - The landing error is the same size on later swaps.
- **(d) refuted as defined.** R10-W2 needs an offset < −0.01 in every late wrap; the offset is 0.000 in 18/18. `readyState` 4, `seeking` false, `playPending` false at every swap.
- **(m) refuted.** `d` does not stay within ±10 ms: it peaks at 0.044–0.055 and is −0.014 to −0.024 at +300 ms.
- **Mechanism, every swap:**
  1. `play()` is called 0–12 ms after the wrap; `playing` follows 5–8 ms later.
  2. `currentTime` stalls at about 2.015 from about +22 to +51 ms. No app action happens in that interval: rate is 1 and there is no seek.
  3. Peak lag is 0.044–0.055 at +60…+130 ms.
  4. D-19 soft sync applies 1.1–1.2. It stops at |d| ≤ 0.02 (deadband), so the error settles at the deadband edge.
- **Spec interaction (B/Tech Lead decision; A changed nothing).**
  - RF5-2's half-window is 0.01, while D-19 stops correcting at 0.02.
  - The steady-state median |d| in these runs is already 0.010–0.013.
  - So under D-19 as written, any post-swap transient above 20 ms lands at or outside [2.29, 2.31].
  - This is consistent with round 5's passing range [2.275, 2.311].
- **Harness note for C (§6.4; not a claim of (m)).**
  - The +300 sample is the first rAF with ctx ≥ wrap + 0.3. Depending on the run phase it falls at ctxRel 0.302 or 0.310, and it is compared against a fixed 2.30.
  - The same ≈ −0.02 lag therefore reads 2.276 (W_1 w3 @0.302) or 2.292 (W_1 w1 @0.31).
  - The probe's "expected" uses the app clock (`getLivePosition`). The harness uses raw `ctx.currentTime`, and they can differ by one ctx quantum in the same frame (W_1 w3: harness ctx 0.302 vs probe 0.2913 for vt 2.2755/2.2751).
  - For recomputation, use `harnessRowAt300` (harness clock) and `at300` (app clock), both in `*_wraps.json`.

**Why no fix in an allowed shape:**
- Pre-roll through a ~30 ms freeze would need both elements playing for more than one frame, which `multiPlayingMaxMs ≤ 17` forbids.
- Starting `play()` one frame early is not a confirmed cause and would be tuning to the run.
- Tightening readiness is irrelevant because the offset is already 0.
- A deadband or window change is forbidden.

## 2. Fixes

- **C-R7-01: no source change.** `ArrangementVideoDock.tsx` and `video-sync.ts` are `cmp`-identical to their round-start state (`bak/*.base.*`); `video-sync.test.ts` is unchanged. R10-W3 is "not applicable" per §4 (C confirms).
- **C-R7-02 diagnosis** (`a-round-10/runs/c-r7-02-diagnosis.json`; raw `c-r7-02-diag-{1280x720,1440x900}.json`, pre-fix):
  - At the empty default and at every sweep zoom with overflow > 1, the rightmost element in the scroller content is the **last ruler tick** (`div.pointer-events-none.absolute.top-0.bottom-0`, `border-l`).
  - It sits at `left = seconds × pps` = content right edge, and its right edge is content + 1.000 px.
  - Chrome rounds `scrollWidth`, so overflow = round(w + 1) − w ∈ [0.5, 1.5]:
    - 1280: 206.796 px/s → 1.406;
    - 1440: 186.4894 → 1.469;
    - empty → 1.0.
  - The last label is always inside the content (−8.4 px at empty, −53/−43 px at the worst zooms).
  - Timeline `seconds = ceil(projectEnd + 30)` (`StudioWorkspace.tsx:779`): 30 when empty, 1652 during the sweep.
- **C-R7-02 fix** (`view.ts`):
  - `rulerTickMarks(...).filter((mark) => mark.time * pxPerSecond + RULER_TICK_LINE_PX <= rulerWidthPx)` with new `export const RULER_TICK_LINE_PX = 1`.
  - A labelled tick can never be removed: a label needs `x + 5 + 8·len ≤ W`, and the shortest label `0:00` needs `x ≤ W − 37`.
  - Labels, spacing, step rule and the render component are unchanged. The tick list stays memoised.
  - Visible change (intentional, documented in 019): the 1 px line at the content end is gone. It is in the 30 s tail.
- **A's post-fix measurement** (`runs/c-r7-02-postfix-*.json`; not C's verdict):
  - max overflow 0.5 px (1280×720) and 0.484 px (1440×900), empty default 0, 0 zooms > 1;
  - `nLabels` per sweep zoom identical to C's `c-round-7/runs/n5r-*.json` at both viewports;
  - overlap and cut are not counted by A's script (C's `n5r` does).

## 3. Files actually changed this round

- `app/lib/arrangement/view.ts`: `rulerTickMarks` plus `RULER_TICK_LINE_PX` (one new constant line, and the existing `return Array.from(...)` statement extended with `.filter(...)`; see `round10-delta.diff`; `bak/view.base.ts` → `bak/view.fixed.ts`).
- `app/lib/arrangement/__tests__/view.test.ts`: the named exception plus the new `it.each` and the import (`bak/view.test.base.ts` → `bak/view.test.fixed.ts`).
- `docs/implementation/2026/quarter-IV/018-studio-lab-round9-drift.md`: status line and TODO only.
- `docs/implementation/2026/quarter-IV/019-studio-lab-round10-wrap-ruler.md`: new.
- `ArrangementVideoDock.tsx`: probed temporarily, then restored `cmp`-identical to its round-start state. `ArrangementRuler.tsx`, `video-sync.ts` and `video-sync.test.ts`: untouched (`cmp`).
- Round-10 delta: `a-round-10/round10-delta.diff`.

Integrity checks:
- No round-6/7/8/9 work was reverted; the edits sit on top of the dirty tree.
- All 15 §3.3 frozen files match their round-start sha256 (`gates/frozen-check.txt`, 15/15 OK).
- `Header.tsx`: `git diff HEAD` is empty; vs `cc1e531` it is +21/−0.
- No change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json`, `app/data` or `app/types`.
- Protected hashes: 4/4 OK.
- `git status` = §3.1 baseline + `?? 019-…md`. The two foreign agent files (`.claude/agents/frontend-architect.md`, `.codex/agents/frontend-architect.toml`) are still untracked and untouched; **root must decide them**.

## 4. Command tails (verbatim; full logs in `a-round-10/gates/`)

```
npx vitest run app/lib/arrangement
 Test Files  20 passed (20)
      Tests  348 passed (348)
exit 0

npx vitest run            (final run, 17:06:59)
 Test Files  52 passed (52)
      Tests  812 passed (812)
exit 0
```

The previous full run at 17:05:11 had **1 failed | 811 passed**: `app/lib/__tests__/sfx-library.test.tsx > Purchased SFX library > adds three sounds ... save/open` → `Error: Test timed out in 5000ms` (`gates/vitest-all-run1-timeout.txt`). The file was not touched this round. It passed alone (3/3, 3.09 s) and in the full re-run, so it is a load-sensitive flake and is reported, not hidden.

```
npx tsc --noEmit                                  exit 0
npx biome check app/lib/arrangement app/components/arrangement
  Checked 51 files in 183ms. No fixes applied.    exit 0
npx biome check ./app
  Checked 318 files in 656ms. No fixes applied.
  Found 218 warnings.  Found 1 info.              exit 0   (same 218 as c-round-9 baseline; 0 errors)
npm.cmd run check   Checked 318 files in 602ms. No fixes applied. Found 218 warnings. exit 0 — git diff --stat identical before/after
npm run build       ✓ built in 2.67s   exit 0
git diff --stat     15 files changed, 1179 insertions(+), 176 deletions(-)
git diff app/components/layout/Header.tsx          (empty vs HEAD)
protected:  download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
grep -rn "a10Probe\|__a10" app/ | wc -l            0
```

## 5. A's L6 runs (instrumented, within budget; not a verdict)

| run | drift verdict (rf5an) | wraps vt +300 | swap/fallback | hard seek in wrap window | raw max d | stalls / cov | app LoAF ≥ 50 | CPU med |
|---|---|---|---|---|---|---|---|---|
| W_1 (fresh load) | PASS | 2.292 / 2.296 / **2.276** | 3/0 | 0 | 0.0183 | 0 / 0 % | 0 | 16.0 % |
| W_2 | PASS | **2.288 / 2.289 / 2.288** | 3/0 | 0 | 0.0183 | 1 / 3.6 % | 0 | 12.7 % |
| W_3 | PASS | 2.29 / 2.292 / 2.292 | 3/0 | 0 | 0.0156 | 0 / 0 % | 0 | 18.5 % |
| W_4 | PASS | **2.286** / 2.29 / **2.289** | 3/0 | 0 | 0.0194 | 0 / 0 % | 0 | 21.7 % |
| W_5 | PASS | 2.291 / 2.292 / 2.291 | 3/0 | 0 | 0.0174 | 0 / 0 % | 0 | 22.1 % |
| F_1 (fresh load) | PASS | **2.285 / 2.284 / 2.286** | 3/0 | 0 | 0.0202 | 0 / 0 % | 0 | 22.7 % |

Notes:
- These runs carried the probe, so they are diagnostic only.
- `multiPlayingMaxMs`, `setsWhileSeeking`, rate range and `framesPastLoopEnd` are in each `runs/*_res.txt`.
- **R10-W1 would FAIL on A's data**: 9/18 wraps < 2.29.

## 6. Tests

- **New:** `view.test.ts`, `it.each([[30, 40, 30], [1652, 186.4894, 3304], [1652, 206.796, 3304]])` "keeps the last ruler tick line and label inside %s s at %s px/s (C-R7-02, R10-R2)". It asserts:
  - every tick line ≤ width;
  - the last label estimate ≤ width;
  - the label count is unchanged (30 / 3304 / 3304, as in C's round-7 sweep).

  The assertion is stricter than B's literal "≤ content + 1" because that bound passes on the round-9 function (1200 + 1 ≤ 1201) and would give no guard.
- **Named exception** (`view.test.ts`, "drops the label of a tick whose text would hang past the ruler end (C-R6-03, R10-N5-U)"):
  - before: `toHaveLength(31)`; `at(-1)` = `{ time: 30, label: null }`; `at(-2)` = `{ time: 29, label: '0:29' }`
  - after: `toHaveLength(30)`; `at(-1)` = `{ time: 29, label: '0:29' }`; `filter(label !== null)` has length 30
  - Meaning kept: the unlabelled end tick no longer exists, and no label is lost.
  - The `fit` (335, 2.48) expectations and the 6-case R10-N5-U sweep are unchanged.
- **Guard proof** (`a-round-10/guard-c-r7-02.txt`):
  - The `.filter` was removed (round-9 behaviour) and `-t "C-R7-02"` gave `Tests 3 failed | 38 skipped`, e.g. `expected 341627.99199999997 to be less than or equal to 341626.99199999997`.
  - The file was then restored from `bak/view.fixed.ts`: `cmp`-identical.
- **RF7-P2:** `render-budget.test.tsx` is unchanged (frozen sha OK) and green in the suites above.
- **R10-W3:** not applicable, because there is no dock/`video-sync.ts` change. No helper or test was added.

## 7. code-reviewer (actual subagent, two passes)

- **Pass 1 (full round-10 delta), score 8.5/10, no Critical/High.** Quote: "The filter in `view.ts:241` is correct. Its floating-point behaviour holds, it can never drop a labelled tick, and at every reachable zoom it removes only the content-end tick … The remaining issues are in the documentation and tests."

  | Finding | Severity | Response |
  |---|---|---|
  | doc 019 stated `scrollWidth − width ≤ 0.5` as fact | Medium | Reworded as an expectation pending R10-R1; post-fix measurement added |
  | The end line disappears without being mentioned | Low | Disclosed as intentional |
  | `find(label === '0:30')` assertion was vacuous | Low | Replaced with a labelled-count 30 assertion |
  | Bound "x ≤ W − 13" was loose | Low | Corrected to W − 37 |
  | "decoder transient" stated as fact | Low | Hedged |
  | "R10-W3 not applicable" stated as A's decision | Low | Now "per §4, C confirms" |

  Not changed:
  - seconds = 0 returns `[]` (unreachable: seconds ≥ 30);
  - the suggested zoom-sweep test (kept minimal; the 3304-label assertions already catch over-filtering).
- **Pass 2 (fix delta), score 9/10, no Critical.** Quote: "All six fixes from the first review are in place. Doc 019 matches the JSON evidence … The doc makes no unverified PASS claim. Nothing new turned up in the code or the doc."

  | Housekeeping item | Response |
  |---|---|
  | Stale gate logs | Re-ran all gates (§4) |
  | Stale `round10-delta.diff` | Regenerated |
  | Doc wording on the 0.5–1 overflow range | Clarified |

## 8. Deviations

1. **No C-R7-01 source change.** The data refutes (a), (b) and (d) (§1.1); the task allows fixes only for those.
2. **Harness copies** live in `a-round-10/harness/`. C's `b.sh`/`r.sh` point at `c-browse.json` and write into `c-round-7/`; C's eval scripts were only read.
3. The probe evaluated `isStandbyReady` once more per due step. Its only side effect, clearing a > 1.5 s stale pending seek, is idempotent. The probe is removed.
4. The R10-R2 test assertion is stricter than B's literal wording (§6).
5. I ran six instrumented runs: 5 runs × 3 wraps plus 1 extra fresh-load run, as allowed.
6. One unrelated flaky timeout in the full suite (§4).
7. Doc 018's TODO records the round order 10 = C-R7-01/02, 11 = stage 2, 12 = stage 3, per B's schedule change in `current-task.md`.

## 9. Not ready / acceptance status (no PASS claimed)

- **R10-W1: not ready, expected FAIL.**
  - A's runs: 9/18 wraps < 2.29, both fresh-load runs included.
  - There was no source change, because no app-side cause was found.
  - Per §4 "stays failing honestly": C-R7-01 stays open → B / Tech Lead quiet-Chrome RF7-3, plus a decision on the RF5-2 window vs the D-19 deadband (§1.1).
- **R10-W2:** the evidence exists and A believes it is consistent; C must recompute.
- **R10-W3:** not applicable per §4 (C confirms).
- **R10-R1, R10-R2, R10-Doc:** implemented and A-measured; **pending C**.

## 10. Exact next C checks

1. R10-W1: 3 valid L6 runs at 1440×900 per §4, the first after a fresh load.
   - Record vt +300, `harnessRowAt300`-style ctxRel, and swap/fallback/hard-seek per wrap.
   - Also check `multiPlayingMaxMs ≤ 17` and `framesPastLoopEnd 0`.
2. R10-W2:
   - read `a-round-10/runs/*_wraps.json`;
   - recompute the offset at swap (`swapInstant.offset`) and d at +300 (`at300.d` vs `harnessRowAt300`) for ≥ 1 wrap per run;
   - `grep -rn "a10Probe\|__a10" app/` → 0;
   - `cmp app/components/arrangement/ArrangementVideoDock.tsx ../tmp/studio-real-loop/a-round-10/bak/ArrangementVideoDock.fixed.tsx`.
3. R10-R1: C's `n5r.js` at 1280×720 and 1440×900. Check:
   - overflow ≤ 1.0 at every zoom including the empty default;
   - 0 overlaps and 0 cut labels;
   - min gap ≥ 40;
   - `nLabels` vs `c-round-7/runs/n5r-*.json`.
4. R10-R2: run the new `view.test.ts` cases, check the named exception (§6) and the guard output, and confirm render-budget is green and unchanged.
5. R10-Doc: doc 018 status = C round 9 exactly; doc 019 contains no PASS.
6. Adjacent (§6.2):
   - R3-V1 mode N ×1;
   - R2-V3 ×1;
   - RF5-3 ×1 (rule H2);
   - R5-L3/R5-E1;
   - R10-N5r at both viewports (labels + Fit; the end line is intentionally gone);
   - RF7-P2;
   - R9-D3 quick check.
7. Gates G10-1..3: vitest ≥ 812; watch for the `sfx-library.test.tsx` timeout flake.

## 11. Carried for B / root (unchanged, honest)

- **C-R8-01 and C-R6-02:** open, waiting for the Tech Lead quiet-Chrome run (D layout).
- **C-R7-01:** see §9. It blocks SRW-11B stage 3 until it closes or the Tech Lead accepts the quiet-Chrome result.
- **Root carry** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*` (Tech Lead);
  - portable instruction-file paths;
  - final commit/push only after everything.
- **Root decision needed:** the two untracked foreign agent files (`.claude/agents/frontend-architect.md`, `.codex/agents/frontend-architect.toml`).

## 12. Session end

- A's gstack browse session (`a-browse.json`) was sent `stop` at the end. The CLI answered "Unable to connect", so the server was either already gone or unreachable. If a headless Chrome from A's state is still alive, root/C may close it before the R10-W1 timing runs. The dev server (`:5173`) was not touched and still answers 200.
- After the advisor review, doc 019 changed only in the `seeked` range wording (0.91–0.96 s) and the summary in §3. Biome does not check `.md`, and no code changed after the final gates.
