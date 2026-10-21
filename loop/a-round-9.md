# A — Round 9 report (C-R8-01 + C-R6-02)

Implementer: A (Claude Opus 5.5). Date: 2026-10-10. Task: `tasks/round-9` = `current-task.md` (Round 9).
Baseline: HEAD `c5ed47b` plus the round-6/7/8 dirty tree. Nothing was reverted, committed, stashed or pushed.
**Nothing in this report is a PASS claim. Every acceptance ID is for C to verify.**
Raw artefacts: `tmp/studio-real-loop/a-round-9/` (harness copies, `runs/`, `bak/`, guard outputs, gate logs).

## 1. Pre-flight gate and probe

**Pre-flight gate (posted before code):**
- **Assumptions:**
  - The C-R8-01 cost is in rendering (layout/paint/raster), not script, because C saw no forced layout and no app LoAF.
  - A probe can tell "static SVG" (S) and "moving line" (L) apart only if the effect is larger than run-to-run noise, with at most 3 runs each.
  - `isTransportRunning` has no reader in `app/` or `__tests__`. My grep found hits only in `.kilo/worktrees/graceful-mousepad/`, a separate worktree outside this app.
  - `pumpPlaybackAudio` runs from rAF `tick` and from a 200 ms `setInterval`. In vitest, rAF is stubbed, so the hold-release flip lands on the interval inside `waitReal`. The hold is 50 ms (`PLAYBACK_LOOKAHEAD`, `holdUntil = startAt`).
- **Smallest fix (~45 source lines):**
  - Detail playhead: an `absolute inset-0 will-change-transform` wrapper with the line at its left edge, and `translateX(p%)` per frame.
  - `contain-strict` on the waveform box.
  - `LibraryPlayheadText` becomes a position writer.
  - `isTransportRunning` is removed from the type, value, deps and `useState`.
- **Files:** see §3.
- **Success:**
  - `npx vitest run app/lib/arrangement` is green with the new R9 tests, and those tests fail on round-8 code;
  - tsc 0, Biome 0 errors, build OK;
  - both guard proofs fail;
  - in the browser: transform-only mutations and computed `contain` present.

**Probe (temporary edits, restored with `cmp`).**
- Variants are generated from a backup by `a-round-9/mkprobe.js`:
  - **W** = D plus the timing wrapper.
  - **S** = W plus an early return, so the line is never shown (`dpDisp: none` confirmed).
  - **L** = W with the SVG branch disabled (`svg: 0` confirmed in the DOM).
- Harness: C's `drift8` pipeline copied to `a-round-9/drift9.sh` (mode D layout, R3-V1, 13 s, 1440×900), with a `perfread` copy that also dumps the raw writer series. My own gstack state is `a-browse.json`.
- After the probe batch, `cmp` against the original was identical, both times.

| Run | Variant | Verdict | raw max | ex max | cover % | stalls | `tick` + mt p50/p95 | CPU med % |
|---|---|---|---|---|---|---|---|---|
| W_0 (harness smoke) | D + wrapper | PASS | .0208 | .0208 | 1.9 | 2 | 1.3 / 2.7 | 33 |
| W_1 | D + wrapper | PASS | .0203 | .0203 | 1.9 | 2 | 1.2 / 2.3 | 34 |
| S_1 | S | harness error (page lost `__c` after the HMR swap, no data) | — | — | — | — | — | — |
| L_1 | L | PASS | .0215 | .0215 | 1.9 | 2 | 1.2 / 2.2 | 34 |
| W_2 | D + wrapper | PASS | .0159 | .0159 | 7.7 | 3 | 1.2 / 2.2 | 34 |
| S_2 | S | PASS | .0152 | .0152 | 1.9 | 2 | 1.2 / 2.1 | 33 |
| L_2 | L | PASS | .0658 | .0658 | 1.9 | 2 | 1.2 / 2.3 | 27 |
| W_3 | D + wrapper | PASS | .0302 | .0302 | 4.8 | 3 | 1.3 / 2.2 | 24 |
| S_3 | S | PASS | .0202 | .0202 | 4.9 | 3 | 1.2 / 2.3 | 32 |
| L_3 | L | PASS | .0310 | .0310 | 1.9 | 2 | 1.2 / 2.4 | 27 |

- **Conclusion: INCONCLUSIVE.** C-R8-01 did not reproduce in my session: D passed 4/4. So S and L had nothing to discriminate against, and every variant sat at `tick` + mt 1.2–1.3 / 2.1–2.7.
- Because the probe did not single out the static SVG, I did not change it.
- I implemented the full required contract instead, which covers both candidates: a compositor-only line and paint containment on the box.
- Files: `a-round-9/runs/probe-summary.txt`, `W_*`, `S_*`, `L_*`.

## 2. Fix and the exact DOM contract

- **`[data-testid=arrangement-detail-playhead]`:**
  - Classes: `pointer-events-none absolute inset-0 z-10 will-change-transform`. Initial inline style is `display: none`.
  - Its child, the visible line, is `absolute inset-y-0 left-0 w-px bg-accent`. `left` is constant at 0, set by a class.
- **Per frame:** the only write is `style.transform = "translateX(<p>%)"`, with `p = (position − clip.start) / clip.duration × 100` and no rounding.
  - The percentage refers to the wrapper's own width, which equals the waveform box, so nothing is measured.
  - No `left`/`width`/`height` writes and no layout reads.
- **`display`:** `none` ↔ `block`, only when entering or leaving `[clip.start, clip.start + clip.duration]`. Unchanged from round 8. `transform` is not written while outside.
- **Box:** `contain-strict` was added to `[data-testid=arrangement-detail-waveform]`. In the browser, computed `contain` is `strict`. With `contain: none` the box measures the same, `[536, 752, 704, 91]`, so its size does not collapse and the `contain-paint` fallback was not needed.
  - **At 1280×720** (expanded, music selected, `runs/ck-1280.json`), strict and none both measure `[536, 552, 544, 91]`. No collapse there either.
  - That browser profile carried the panel's expanded view state from the 1440 session. So this is a containment check, not an R11-P1d default-state check: the panel was open at load. The built CSS contains `.contain-strict{contain:strict}` and `.will-change-transform{will-change:transform}`.
- **How C reads the position:**
  - `const t = el.style.transform; p = t.startsWith('translateX(') && t.endsWith('%)') ? parseFloat(t.slice(11)) : NaN`.
  - Equivalent regex: `/^translateX\((-?[\d.e+-]+)%\)$/`.
  - Adapted scripts: `a-round-9/scripts/play9.js` and `outside9.js`, generated from C's `play8`/`outside8` by `a-round-9/mk9.js` with only the reader swapped.
- **`LibraryPlayheadText`** (`ArrangementLibraryPreview.tsx`):
  - It calls `useArrangementPositionStore()` and keeps a ref'd `<span className="tabular-nums" data-testid="arrangement-library-playhead">`.
  - Its initial child text is `formatArrangementTime(store.getPosition())`, the same pattern as `ArrangementTransportPosition`.
  - Through `useArrangementPositionWriter` it writes `textContent` only when the formatted string differs.
  - Same text, place and classes. The `data-testid` is new (reviewer L9).
- **`ArrangementContext.tsx`:**
  - `isTransportRunning` is removed from the `ArrangementContextValue` type, the value object and the memo deps.
  - Its `useState` had no other reader and is removed.
  - `markTransportRunning` now only does `transportRunningRef.current = next`. It is still called from the same three places, and `pumpPlaybackAudio` still reads the ref.
  - No scheduler, hold or loop code changed. `useArrangementPosition` stays exported, now with no callers.

## 3. Files actually changed (a subset of §3.2)

| File | Change |
|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | `ArrangementDetailPlayhead` (ref rename, transform writer, wrapper plus line) and the waveform box class `+contain-strict`. Nothing else. |
| `app/components/arrangement/ArrangementLibraryPreview.tsx` | `LibraryPlayheadText` plus the `~/contexts/ArrangementContext` import (`useArrangementPosition` → `useArrangementPositionStore`, `useArrangementPositionWriter`). No React import change (memo was tried and reverted, see §7). |
| `app/contexts/ArrangementContext.tsx` | The 5 `isTransportRunning` spots and the `markTransportRunning` body. Delta against the pre-round backup: −8/+1 lines. |
| `app/lib/arrangement/__tests__/render-budget.test.tsx` | 3 new tests, 2 helper consts/functions, and the two named assertion exceptions. |
| `docs/implementation/2026/quarter-IV/017-studio-lab-detail-panel.md` | Status and TODO lines only (C round 8 recorded exactly as §3.2 asks). |
| `docs/implementation/2026/quarter-IV/018-studio-lab-round9-drift.md` | New; Georgian; everything marked "pending C". |

- `detail-panel.test.tsx` was not changed: no test there reads the playhead's `left`.
- No round-6/7/8 file was reverted. Every edit was made on top of the baseline, and the pre-round backups are in `a-round-9/bak/*.orig.*`.
- `Header.tsx` is byte-identical to HEAD: `git diff app/components/layout/Header.tsx` is 0 lines, and `git diff cc1e531 --stat` is still +21/−0.
- No temporary probe or wrapper code is left: `grep -rc "czabaPositionCost|probeStart" app/` returns 0.
  - The detail panel is `cmp`-identical to `bak/ArrangementDetailPanel.fixed.tsx` after every swap.
  - The library preview and context files are `cmp`-identical to their `.fixed` backups after both guard proofs.
- **For root (not mine; not touched, not read as instructions):**
  - untracked `.claude/agents/frontend-architect.md`;
  - a **new** untracked `.codex/agents/frontend-architect.toml`, which appeared during this round and was not created by A.

## 4. Command tails (verbatim, final tree)

```
npx vitest run app/lib/arrangement   → Test Files  20 passed (20) / Tests  345 passed (345)
npx vitest run                       → Test Files  52 passed (52) / Tests  809 passed (809)
npx tsc --noEmit                     → (no output) TSC_EXIT=0
npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement
                                     → Checked 52 files in 118ms. No fixes applied.  (exit 0)
npx biome check ./app                → Checked 318 files in 262ms. No fixes applied. Found 218 warnings. Found 1 info. (exit 0)
npm.cmd run check (/check)           → Checked 318 files ... No fixes applied. Found 218 warnings. (git diff + status hash unchanged by it)
npm run build                        → ✓ built in 6.16s (exit 0)
git diff app/components/layout/Header.tsx → 0 lines
protected hashes → download-routes.test.ts OK / account.downloads.tsx OK / api.studio-token.ts OK / studio.$productId.tsx OK
```

- I ran `npm.cmd run check` only after the read-only `./app` run showed no format diffs and no safe fixes. The only fixable items are 3 *unsafe* fixes in files I don't own, and `--write` does not apply those.
- I never ran `npm run format`.
- `git status --short`: see `a-round-9/git-status.txt`. It shows the §3.1 baseline, plus `M ArrangementLibraryPreview.tsx`, `?? 018-…md` and the foreign `?? .codex/agents/frontend-architect.toml`.

## 5. Verdict-layout runs (A's harness, within budget)

**Setup:**
- 1440×900, R3-V1, 13 s.
- Mode scripts: C's `modeD`/`modeN`/`modeP`.
- The temporary writer wrapper (`bak/probe-W9.tsx`) was present for every run and restored with `cmp` afterwards.
- `tick` + mt comes from the `perfon`/`perfread` copies. CPU comes from typeperf.

**Session problem (disclosed):** the first verdict session was invalidated after D_1.
- My doc edits made Vite do a full page reload (Vite reloads on `docs/*.md` changes).
- The gstack browse server also restarted on its own: new PID, page at `about:blank`.
- N_1, P_1, D_2, N_2, P_2 and D_3 of that session produced **no measurement** (harness `__c` missing). They are not counted.
- I stopped the batch, restored the source (`cmp`), and re-ran all modes in a new session, with a per-run harness-presence check and re-setup.
- D_1 is kept and reported as-is.
- **The machine was busy:** Defender (`msmpeng`) at ~27 %, a background download at ~20 %, and other agent apps running. CPU medians were 32–42 %.

| Run | Mode | Verdict | raw med / max | ex max | cover % | stalls | hard rules | app LoAF ≥10 ms | forced (steady) | `tick` + mt p50 / p95 | writer p50 / p95 / max (excluded) | CPU med / max |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| D_1 (session 1) | D | **FAIL** | .0147 / .196 | .1377 | 6.4 | 4 | **false** (hard seek v2, 76 ms @ 10.8 s) | 0 | 0 | 0.3 / 0.9 | 0 / 0.1 / **16.7** (4: rafΔ 66.6, 50, 50, 150) | 33 / 58 |
| D_2 | D | PASS | .0098 / .021 | .021 | 2.0 | 2 | true | 0 | 0 | 0.4 / 1.2 | 0 / 0.1 / 0.7 (0) | 39 / 49 |
| N_1 | N | PASS | .0114 / .0881 | .0881 | 6.6 | 4 | true | 0 | 0 | 0.3 / 0.8 | — (no writer) | 41 / 66 |
| P_1 | P | PASS | .0109 / .0583 | .0583 | 0 | 0 | true | 0 | 0 | 0.4 / 0.9 | 0.1 / 0.1 / **1.6** (0) | 40 / 53 |
| D_3 | D | PASS | .0088 / .1587 | .05 | 2.8 | 2 | true | 0 | 0 | 0.4 / 0.9 | 0 / 0.1 / 0.3 (4: frames 25, 552–554, rafΔ 50/50/33.5/66.5) | 32 / 45 |
| N_2 | N | PASS | .0075 / .0242 | .0242 | 0 | 0 | true | 0 | 0 | 0.3 / 0.7 | — | 35 / 48 |
| P_2 | P | PASS | .0109 / .0886 | .0886 | 0 | 0 | true | 0 | 0 | 0.4 / 1.0 | 0 / 0.2 / 0.7 (1: frame 533, rafΔ 50) | 42 / 52 |
| D_4 | D | PASS | .0084 / .0184 | .0184 | 0 | 0 | true | 0 | 0 | 0.4 / 0.9 | 0.1 / 0.2 / 0.9 (0) | 39 / 57 |
| N_3 | N | PASS | .0087 / .0486 | .0486 | 0 | 0 | true | 0 | 0 | 0.3 / 0.7 | — | 33 / 47 |
| P_3 | P | PASS | .0073 / .0233 | .0233 | 0 | 0 | true | 0 | 0 | 0.4 / 0.9 | 0.1 / 0.1 / 0.9 (0) | 35 / 52 |

**Medians, session 2, 3 valid runs per mode:**
- `tick` + mt: D 0.4 / 0.9, N 0.3 / 0.7, P 0.4 / 0.9.
- **D − N = +0.1 ms at p50 and +0.2 ms at p95. Both are at or under the 0.2 ms limit; p95 is exactly at the limit.**
- D − P = 0 / 0.
- Including D_1 changes nothing: D is still 0.4 / 0.9.

**Before and after (same harness):**
- Before the fix (round-8 code, every run this session and C's round-8 runs), `tick` + mt was **p50 1.2–1.5 / p95 2.1–3.8**.
- After the fix it is **0.3–0.4 / 0.7–1.2** in every mode.
- The main microtask cost was the per-frame `LibraryPlayheadText` React render (C-R6-02), not the detail panel.
- The round-7 cross-session reference (0.7–0.8 / 1.1–1.5) is for information only. p50 is now below it, and p95 is inside it.

**Writer envelope (R9-D2.2):**
- Raw per-frame JSON: `a-round-9/runs/{K}_writer-frames.json`. Each frame has `costMs`, `frameTs` (`document.timeline.currentTime`) and `rafDeltaMs`.
- Summary: `runs/envelope9.json`. Calculator: `a-round-9/envelope9.js`. Rule: exclude frames whose rAF delta exceeds 2 × the run median (median 16.7 ms in every run).
- **Session 2 D runs:** D_2, D_3 and D_4 are within the envelope (p50 ≤ 0.1, p95 ≤ 0.2, max ≤ 0.9).
- **Outside the envelope:**
  - **D_1** (max 16.7 and 14.3 ms on frames with a normal rAF delta);
  - **P_1** (max 1.6 ms, at frame 110 with a 16.7 ms delta).
- A transform-only write cannot plausibly take 14–17 ms. These samples look like the thread being preempted inside the timed block.
- The rule as written excludes only frames with a long rAF delta, so these frames stay in. I have not excluded them.
- Timer resolution is 0.1 ms (not cross-origin isolated). That limits p50/p95 precision.

**RF5-3 (F_1..F_3, `c-round-5/scripts/rf43.js` after the R3-V1 setup):** the harness verdict is **`pass:false` ×3** (`holdOk:false`, because `preAllPaused:false`).
- In each run the only non-paused pre-start row is the `play()` row itself, at ctxRel −0.010 s. The video time there is 1.1 / 2.1 / 1.7 ms, below one frame.
- `playTimingOk: true` (−10 ms, inside the window); w1 0.0385 / 0.0363 / 0.0398 (≤ 0.1); w2 0.0423 / 0.0365 / 0.0357 (≤ 0.06); one `v1` active `play` per run.
- This is the shape of C's round-7 "hold:false artefact" rule (`c-round-7.md` l.59). However, C applied that rule at `preMaxAbsVt` ≤ 0.0006, and these runs are 0.0011–0.0021.
- **I do not claim RF5-3 PASS. The call is C's.**

## 6. Tests

| Test | Status | Reason |
|---|---|---|
| `writes only transform on the detail playhead per frame and never left, width or height (R9-D3, C-R8-01)` | new | See the R9-D3 detail below. |
| `writes the library playhead text on 60 position frames without rendering LibraryPlayheadText (R9-L1, C-R6-02)` | new | See the R9-L1 detail below. |
| `keeps the context value and its consumers unchanged when the start hold releases (R9-L2, C-R6-02)` | new | See the R9-L2 detail below. |
| R11-P1e test: monotone assertion | **named exception 1** | **Before:** `lefts.push(Number.parseFloat(detailPlayhead.style.left))`. **After:** `lefts.push(detailTranslatePercent(detailPlayhead))`. The expected values are unchanged (1.5 → 90, strictly increasing), and so is the 15000 timeout. |
| Playback-frames test: `LibraryPlayheadText` | **named exception 2** | **Before:** `expect(renderLog.counts.get('LibraryPlayheadText') ?? 0).toBeGreaterThan(0)`, then `countsOf(POSITION_CONSUMERS)` must equal the five zeros. **After:** `expect(countsOf([...POSITION_CONSUMERS, 'LibraryPlayheadText'])).toEqual({ …five zeros, LibraryPlayheadText: 0 })`. The transport-text assertions stay as the positive control. |

**R9-D3 test:**
- Uses a MutationObserver on `style`. The first entry frame has 2 records (transform and display), each later frame exactly 1, and the exit has 1.
- `left`, `width` and `height` stay empty, and no style snapshot contains them.
- `translateX` ends at 75 % and `display` is `none` after exit.
- Seven layout-read spies are installed for the frames and the exit: `getBoundingClientRect`, `getClientRects`, `clientWidth`/`Height`, `offsetWidth`/`Height` and `getComputedStyle`. All must stay at 0 (reviewer L9b and L-R10-1).
- On round-8 code it fails with `expected '75%' to be ''` (`a-round-9/pre-fix-render-budget.txt`).

**R9-L1 test:**
- The span is found by `data-testid`. The test checks that the `<p>` contains `· playhead 00:00.000`, that the class is exactly `tabular-nums`, and that the mount render count is > 0.
- Then it clears the counts and runs 60 frames.
- Expectations: 0 renders, 60 distinct texts from `formatArrangementTime(0.1)` to `formatArrangementTime(6)`, and the same DOM node.
- On round-8 code the pre-L9 version of this test failed with `expected 60 to be +0`.
  - That result is in `a-round-9/pre-fix-render-budget.txt`, which **predates the L9 test edits** (the testid query and the layout spies).
  - The current test queries `data-testid="arrangement-library-playhead"`, which round-8 code doesn't have. On round-8 code it would therefore fail at the lookup, not at the render count.
  - **The current-version proof for R9-L1 is guard 1:** `guard1-variant.tsx` keeps the testid and puts back only the render, and the test fails at line 528 with `expected 60 to be +0`.
- The R9-D3 claim doesn't depend on the testid. On round-8 code it still reaches `expected '75%' to be ''`, because the spy assertion passes there too: round-8 code reads no layout either.

**R9-L2 test:**
- Clicks Play, then captures `valueAtPlay` and asserts `getLivePosition() === 0`, which shows the hold is still active and the clear happens before `holdUntil`.
- Clears the counts immediately, then runs `waitReal(450)` (two 200 ms pump intervals) and 30 frames.
- Asserts the position is > 0.3, so the hold has released, and that `api.current` is the same reference as `valueAtPlay`.
- Asserts 0 renders for `ArrangementTransport`, `ArrangementRuler`, `ArrangementLibrary`, `ArrangementLane` and `ArrangementDetailPanel`.
- Positive control: `selectClip` changes the value, and all five then render more than 0 times.
- On round-8 code it fails on identity: `expected {…(77)} to be {…(77)}`.

**Guard proofs** (temporary edit, then `cmp` restore; outputs in `a-round-9/`):
1. `guard1-library-render.txt`. The variant (`bak/guard1-variant.tsx`, built by `mkguard1.js`) changes only `LibraryPlayheadText` back to `useArrangementPosition()` with a React render (the testid is kept).
   - Result: **2 failed**, R9-L1 (`expected 60 to be +0`, line 528) and the playback-frames zero list (line 353).
   - Restored `cmp`-identical.
2. `guard2-transport-running.txt`. The context was swapped back to the round-8 version (with `isTransportRunning` in the type, value, deps and state).
   - Result: **1 failed**, R9-L2 on identity (line 547).
   - Restored `cmp`-identical.
   - This shows the test sees the hold-release flip, which is the RF7-P2 blind spot B warned about.

## 7. code-reviewer (actual subagent, ×2)

**Review #1** (full cumulative state: the whole `ArrangementDetailPanel.tsx` including the round-8 Low fixes, the library preview, the context and the render-budget test). **Score 8.5/10. No Critical or High findings.**

> *"The round-9 changes are clean and meet their goal. Each frame, the detail playhead does one `transform` write with no layout reads or writes. The library text no longer causes a React render per frame. The context value stays the same object across the start-hold release, and tests cover all of this. The one thing that shouldn't ship silently is M1: removing `isTransportRunning` left `transportRunningRef`/`markTransportRunning` as a latch nothing acts on, so the brief's "pumpPlaybackAudio reads it" overstates what remains. Removing it changes no behavior. The rest is low-severity polish…"*

| Finding | Action |
|---|---|
| **M1:** the ref is now a latch only | **Declined.** The task explicitly says to keep `transportRunningRef` and that `markTransportRunning` must still update it, and forbids touching hold logic. Routed to B (reviewer #2 later confirmed the ref works as a latch and is not dead). |
| **M2:** the library preview re-renders at 20 Hz during preview (pre-existing) | Not this round's scope. Routed to B. |
| **L1:** `memo` around `LibraryPlayheadText` | **Tried and reverted.** `const LibraryPlayheadText = memo(function LibraryPlayheadText…)` made the bundler rename the inner function to `LibraryPlayheadText2` (seen in the probe keys), which breaks the name-based render probe. Declined; see the correction under review #2. |
| **L2:** the writer runs while the panel is collapsed | Outside "only `ArrangementDetailPlayhead` and the box" (it needs a collapsed prop threaded through other components). Routed to B for stage 2. |
| **L3:** at exactly the clip end, `translateX(100%)` puts the line past the edge | Same behaviour as round-8 `left: 100%`, and C's outside contract depends on it. Routed to B. |
| **L4–L7:** round-8 detail-panel items (input reset on an unrelated range, pointer capture, `biome-ignore` comment text, 6 px separator hit area) | Outside this round's ownership. Routed to B for stage 2. |
| **L8:** `useArrangementPositionStore` throws a message naming `useArrangementPosition` (pre-existing) | Outside this round's ownership. Routed to B. |
| **L9:** test brittleness and coverage | **Accepted:** the span `data-testid`, plus layout-read spies in R9-D3. |

**Review #2** (the fix delta). **Score 8.5/10. No Critical or High findings.**

> *"Both fixes, L9a and L9b, are correct and not flaky … Both declines are acceptable, but the L1 rationale contains two factual errors, and a fix for L1 does exist within the same file."*

- **M-R10-1 (accepted as a correction to my report).** Two of my L1 reasons were wrong:
  - The usage site (`· playhead <LibraryPlayheadText />`, around l.270) **is in the same file**. The real obstacle is the task's wording, "only `LibraryPlayheadText` and its import line", not file ownership.
  - The parent does **not** re-render only on context changes. During a *library preview* (not arrangement playback), `setPreviewCursor` re-renders it up to 20×/s, so `LibraryPlayheadText` re-renders as well.
  - The per-playback-frame contract (0 renders) holds.
  - Reviewer's fix, for B to allow or reject: `const LibraryPlayheadTextMemo = memo(LibraryPlayheadText)` and a one-token change at the usage site. The probe name stays the same.
- **L-R10-1 (applied):** added `getComputedStyle`, `clientHeight`, `offsetHeight` and `getClientRects` spies.
- **L-R10-2 (applied):** added an assertion message, "no position writer reads layout per frame", because the spies are global.
- **L-R10-3:** the exact `tabular-nums` className lock is intentional and recorded in doc 018.

After these edits I re-ran the tests: render-budget 7/7, arrangement 345/345, full 809/809, tsc 0, Biome 0 errors, build OK.

## 8. Deviations

1. **Probe result.** It was inconclusive (C-R8-01 did not reproduce for A). The static SVG was not changed, and the full contract was applied.
2. **Verdict session 1.**
   - It was invalidated after D_1: a Vite page reload on my doc edit, plus a gstack server restart.
   - D therefore has 4 valid runs in total: D_1 FAIL in session 1, and D_2–D_4 PASS in session 2. That is within 3 valid plus 2 replacements.
   - The six empty session-1 attempts produced no data.
   - D − N is computed on session 2 only, which is the same session as N.
3. **`data-testid="arrangement-library-playhead"`** was added to the library span. It is an attribute, not a class or text, and it comes from reviewer L9.
4. **R9-L2 reads the hold** through `getLivePosition() === 0` (before) and `> 0.3` (after), because `transportRunningRef` is not observable from outside. Guard proof 2 shows the flip lands inside the window.
5. **C-R8-01 probe S_1** was a harness error and was not replaced, so S has 2 valid runs.
6. **The R9-D3 test name** still says "detail playhead", but its layout-read spies are global, covering all position writers. An assertion message says so.

## 9. Not ready / not claimed (C decides)

None of these is self-marked PASS:
- **R9-D1:** C's 3 valid mode D runs. A: 3/3 PASS in session 2, 1 FAIL (D_1) in the session that broke.
- **R9-D2:**
  - .1: forced 0 everywhere in A's runs.
  - .2: the envelope is outside the limits in D_1 (16.7 ms max) and P_1 (1.6 ms max) under the rule as written. A's own evidence therefore does **not** satisfy R9-D2.2 for every run.
  - .3: D − N is +0.1 / **+0.2** ms, exactly at the limit.
- **R9-L3:** N 3/3 PASS in A's runs, but RF5-3 is **`pass:false` ×3 on the raw harness** (see the artefact shape in §5). **C-R6-02 cannot be closed on A's evidence.**
- **R9-D3, R9-L1, R9-L2, R9-U, R9-Doc:** A's checks pass (§5, §6; browser runs `ck9-1440.json`, `outside9-1440.json`, `libtxt9.json`, `play9-1440.json`; shot `a-round-9/r9-detail-1440-playing.png`). They are pending C.

**Exact next checks for C:**
1. Hashes and `git status`:
   - check that the `.codex/agents/frontend-architect.toml` + `.claude/agents/frontend-architect.md` exclusion is reported to root;
   - check that `Header.tsx` has a 0-line diff.
2. Before measuring, check that no `czabaPositionCost`/`probeStart` is left in `app/`. Use C's own wrapper or A's `bak/probe-W9.tsx` (restore from `bak/ArrangementDetailPanel.fixed.tsx`).
3. R3-V1 D/N/P alternating, plus RF5-3 ×3. Read the detail playhead with the `translateX` parser. **Do not edit any `store/` file during runs**, because Vite reloads the page on docs too.
4. Recompute the envelope from `a-round-9/runs/*_writer-frames.json` (`envelope9.js`).
5. Check R9-D3 with a MutationObserver on `style` over 3 s of Play (A saw 180/180 transform-only and 0 display changes mid-clip). Check `outside9` (A: 0 violations, monotone 0.02 → 99.82, hidden at 12.02 s).
6. R4-M2: the library text now shows as `arrangement-library-playhead:childList` (or `arrangement-library-preview:childList` with C's play8 labeller), like `arrangement-position`.
7. Adjacent checks: R11-P1c, R11-P1d at both viewports, R11-P1e, RF7-P2, R10-N4 (A: 66 samples, 0 invisible, Follow on), R26-1, and G9-3.

**For B (follow-ups, not done):**
- Reviewer M1 (rename or remove the latch, spec permitting).
- M-R10-1 (memo via `LibraryPlayheadTextMemo`; needs a one-token scope allowance).
- M2 (20 Hz preview re-renders).
- L2–L8 (stage 2 candidates).
- Root review findings still listed but not re-verified by A this round: root L6 (export-dialog wording with the loop on), L8 (`new AudioContext` not wrapped), M3 (docs honesty).
- `publication-checkpoint.json` follow-ups: purchased loader hard-codes `middle-east`, instruction-file portable paths, and the scrollbar request.
- Root M1 and L2–L4 are closed per B (stale carry).

**Scope completed:** the C-R8-01 fix with tests, and the C-R6-02 code changes (both candidates) with tests. The probe ran and was inconclusive. The R9 runs above are A's measurements only. Backlog not marked complete.
