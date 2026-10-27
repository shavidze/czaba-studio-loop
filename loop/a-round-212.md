# A — round 212 (PERF-FADER-c): waveform outline path, a single release commit, stored gains as a prop

**Status: IMPLEMENTED.** One deterministic-row delta needs a B ruling: `fader.clipgain.stopped.commits-per-move` (1× and 6×) went from 0.926 to 0.917 in both A runs.
- **Which list applies.** The D-29z190 must-be-identical list (`tasks/round-211.md` l.131) names, for clipgain, only `moves-dispatched` and `.restarts`, so this row is **not** on it and is not an L11 STOP. But C's PERF-RUN-212 wording is "every deterministic row equals C round 211's medians, except the release-commits rows", so B should rule before C judges it.
- **Cause**, from `perf/studio-lab.perf.spec.ts` l.426: `commits-per-move = whole-gesture commits / moves`. 0.926 × 121 = 112 and 0.917 × 121 = 111, so it is exactly one commit fewer. That commit is the removed release commit, the same one behind the ruled `release-commits` 2 → 1.
- No code was changed for it. Nothing else is pending from A.

## Changed files (7 grants + the 2 listed new files; nothing else)
| File | Change |
|---|---|
| `app/components/arrangement/ArrangementClip.tsx` | `buildPeakShape` only. Heights are collected first, then emitted as `M0 1`, a forward pass `V{1−h}H{c+1}`, a backward pass `V{1+h}H{c}`, then `Z`. Signature, `columns`, height formula, bucketing and null cases are unchanged. |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | **C-R211-01:** the l.543–545 layout effect is replaced by the render-time `syncedClipGainText` sync. **S1:** `ArrangementDetailGroup.clipGainsDb` is now required. The leaf drops `getArrangement` and takes `storedClipGainsDb` (the group's `clipGainsDb`, or `[clipGainDb ?? 0]` for a single clip). `draftedClipGains` reads that array. The parent keeps `getArrangement` for `readClipGainAnchorDb`. |
| `app/components/arrangement/StudioWorkspace.tsx` | One line: `clipGainsDb: clips.map((clip) => clip.gainDb ?? 0)` in the `detailGroup` memo. |
| `app/lib/arrangement/__tests__/waveform-zoom.test.tsx` | WZ1 asserts (3 lines) plus file-level helpers `columnsOf` / `outlineOf` / `expectOutlineOfRects`. The rect literals stay as the reference geometry. |
| `app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx` | WG1 and WG2 plus file-level helpers (also `rectPathOf`). WG2 checks `rectPathOf(columnsOf(path))` for length 2530 and `WG2_PRE_ROUND_SHA256` (constant unchanged). |
| `app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx` | Appended CP15, CP16 and CP17. CP1–CP14 and the infrastructure are unchanged (single hunk `@@ -1006,0 +1007,122`). |
| `docs/implementation/2026/quarter-IV/166-clip-gain-pointer-preview.md` | l.4 only, with the exact D-29z196 text. |
| new `app/lib/arrangement/__tests__/waveform-outline-path.test.tsx` | PO1–PO5. |
| new `docs/implementation/2026/quarter-IV/167-waveform-outline-path.md` | Georgian, TEMPLATE structure. Status: `In Progress (C round 212 check pending)`. |

Scope checks:
- `sha256sum -c --quiet b-round-211-r212-tree-sha256.txt`: rc 0, at start and at end.
- `git status`: 7 M + 2 ??.
- Each helper parser lives in its own file, because a test file imported into another registers its rows twice and no helper file was granted.

## Tests actually run
- **Pre-change red check:** with only `buildPeakShape` changed, exactly WZ1, WG1 and WG2 were red (3 of 34 in the 3 files). WZ1's output equals B's example literal.
- **Red proof** (`a-round-212/red-start-copy.txt`; the start-copy sources were swapped in, then restored and `cmp`-verified):
  - On the start copy: PO1–PO4 red, and CP15 red ("expected 2 to be 1", i.e. 2 leaf commits on release).
- **Named mutants** (`a-round-212/mutants.txt`; each was restored and `cmp`-verified):
  - **M1:** `ArrangementClip.tsx` `buildPeakShape`, drop `|| columns <= 0` from the null guard → PO5 red ("expected {columns:1…} to be null").
  - **M2:** `ArrangementDetailPanel.tsx` sync block, delete `setClipGainText(displayedClipGainText)` → CP15 red (records `title` / `aria-describedby` / `data-pending` on release) and CP16 red ("expected '-12.0' to be '-3.6'").
  - **M3:** `ArrangementDetailPanel.tsx` `draftedClipGains`, `return 0` instead of `storedClipGainsDb[index] ?? 0` → CP17 red ("expected '−14.4 … 0.0 dB' to be '−14.4 … −3.0 dB'").
- **Static checks:**
  - `npm run typecheck`: rc 0.
  - `npx biome check` on the 7 owned code paths: 0 errors, 0 warnings. Applied read-only; one format issue in my own CP15 hunk was fixed by hand.
- **Targeted vitest:** the 4 owned test files give 42/42. The 16-file list (the task's list plus the owned files, run before CP15–17 were added) gave 209/209.
- **Covering run** (`app/lib/arrangement app/components app/hooks`): 2,230 / 2,231 passed, twice (`covering-run.log`, `covering-run-2.log`). The 1 failure is the **CP12 30 s timeout** (31.8 s and 32.8 s).
  - **Control:** the same test set with the 3 **start-copy** sources (the current test files were kept, so it includes CP15–17 and the PO file, which go red there as expected) also times out CP12, at 33.8 s (`covering-run-startcopy-control.log`).
  - **Alone:** CP12 takes 14.9 / 15.6 s on my tree and 16.9 / 16.9 s on the start copy.
  - So this timeout predates the round and comes from parallel load on this machine. It is not caused by this round. CP12 and the describe timeout are frozen. **Root gate risk:** the full suite may hit the same timeout here (see "For B/root").
- **`npm run test:perf` ×2**, sequential with nothing else running (`a-round-212/perf-run-{1,2}.{log,json}`, comparison in `perfcmp.txt` via `perfcmp.py`):
  - Run 1: exit 0, 9.0 min. Run 2: exit 0, 8.1 min.
  - Both runs: `complete: true`, 316 rows, 0 failing asserts, `failures: []`, restarts 0.

| row | C r211 run1 / run2 | A run1 / run2 |
|---|---|---|
| clipgain.stopped move-to-paint p95 1× | 18.1 / 18.6 | **7.0 / 6.1** |
| clipgain.playing move-to-paint p95 1× | 59.7 / 58.1 | **7.6 / 7.4** |
| clipgain.stopped p95 6× | 34.4 / 33.8 | 47.8 / 40.9 |
| clipgain.playing p95 6× | 43.1 / 42.3 | 61.4 / 56.4 |
| clipgain-members.stopped p95 1× | 7 / 6 | 6.0 / 5.1 |
| clipgain-members.playing p95 1× | 10.2 / 9.4 | 8.3 / 7.8 |
| clipgain-members stopped p95 6× | 30.5 / 29.6 | 42.4 / 39.1 |
| clipgain-members playing p95 6× | 44 / 47.9 | 59.1 / 53.7 |
| clipgain.stopped release-commits (1×, 6×) | 2 / 2 | **1 / 1** |
| clipgain.playing release-commits | 1 / 1 | 1 / 1 |
| clipgain-members release-commits (both) | 1 / 1 | 1 / 1 |
| clipgain move-components-max (both) | 3 / 3 | 3 / 3 |

- **Deterministic rows vs C round 211:** 167 compared, all identical except:
  - the excluded `release-commits` rows;
  - `fader.clipgain.stopped.commits-per-move` (+ `.6x`), the delta that needs a B ruling (above);
  - `load.longtasks-over-50`: 2 in A's runs vs 1 in C's. C r211 notes that this row varies within a run and is outside the identity list.
- **Pixel check** (`a-round-212/pixdiff-a212.json`, PNGs in `a-round-212/px/`; B's pixdiff method):
  - Before was captured from the :5173 dev server on `28a274c` code before any edit; after was captured from the edited tree.
  - Covered: lane + detail, at 1440×900 and 1280×720 with the detail panel expanded; states rest 0 dB, −12 dB, +24 dB (clipping) and zoom 8×.
  - All 16 cases: **0 pixels with delta > 8**. Max channel delta is 5 (detail) and ≤ 4 (lane). Box, `viewBox` and fill colour are identical.
- **Code-reviewer** (real subagent, run on the final code delta): no Blocker or Major findings, score 9/10. Findings:
  - **Minor (behaviour that predates the round, not a regression):** a group→group selection change keeps `key='group'`. If both displayed texts are equal (e.g. both mixed `''`), pending typed text carries over to the new group. The old effect behaved the same way. Left for B.
  - **Nits:**
    - The pixels are not identical, only the geometry (the antialias seams are gone, as designed).
    - `[clipGainDb ?? 0]` creates a new array each render; harmless while the leaf has no `memo`.
    - PO1's reference formula copies the implementation's formula; WG2's sha and the literals are the independent oracles.
    - The helpers are duplicated across files (by necessity).
    - `columnsOf` drops an odd trailing value, which PO2's pair count guards.
  - **Reviewer's open question, closed by A:** the `biome-ignore` at `ArrangementDetailPanel.tsx:1256` predates this round. It is at l.1255 in the start copy `b-round-211/r212-granted-start/…/ArrangementDetailPanel.tsx`, and its text is identical.
  - **Architecture note (verbatim):** "Keep. This round removes a mutable ref read from the `ArrangementDetailClipGain` leaf in favour of props built by the same `detailGroup` memo. It also moves the content owner's text sync from an effect to a guarded render-time update on its own state, made safe by the keyed remount at `ArrangementDetailPanel.tsx:1305` and pinned by CP15. No state or behaviour moved between context, component and `lib/`. The only signal is the leaf's existing ~28-prop list, which is not new this round and does not justify extracting anything now."

## B acceptance criteria actually passed by A
- D-29z197 items 1–4: the exact format, the pins replaced as specified (WG2 via `rectPathOf` + the unchanged sha), and no new sha or literal pasted as the only check.
- D-29z198 items 1–2: C-R211-01 and S1 as specified. Item 3: the single clipgain `release-commits` is 1, as expected.
- D-29z196: doc 166 l.4 matches the exact text.
- Doc 167 is written, with the conditional status. Every cited row exists: PO1–PO5 in `waveform-outline-path.test.tsx`, CP15–17, WZ1, WG1, WG2.
- PO1–PO5 and CP15–CP17 exist; each is red on the start copy or has a named mutant.
- Self-checks: typecheck, Biome, the targeted vitest files, the covering run (except the CP12 timeout above), perf ×2, the pixel check and the code-reviewer.
- **Not claimed:** all of C's rows. In particular LATENCY-212 (my 1× harness values are < 16 ms, but the row is C's), PIX-212's mid-drag states, RELEASE-212, SYNC-212, WAVE-LIVE-212, EXPORT-212 and G212-3.

## Known gaps / for B and root
1. **B ruling:** `commits-per-move` (above; not on the D-29z190 list, but covered by C's PERF-RUN-212 wording).
2. **6× wall-clock went up** for clipgain (+20–45 %) and clipgain-members (+30–40 %) in both runs. Track/group/master/pan at 6× are in C's range or noisy. 1× is far better. A likely cause (hypothesis, not measured) is main-thread path building for one long path under CPU throttle. Raster is not throttled the same way. These are record rows, not the LATENCY-212 criterion, but they matter for low-end CPUs. B may want a measured follow-up.
3. **CP12 timeout** under full parallel vitest load on this runner, which predates this round (control: 33.8 s on the start copy). The root gate's full suite may fail on it. The fix would be a frozen-file change (CP12 or the describe timeout), so it needs a B grant.
4. **Row-id collision:** B-mandated PO1–PO4 also exist in the frozen `pending-status.test.tsx` (pending-order rows). Doc 167 cites them with the file name. B may want unique ids in a later round.
5. The code-reviewer's Minor (group→group pending carry-over, which predates this round).

## Exact next C checks
- **SCOPE-212:** 7 M + 2 ??. In `ArrangementClip.tsx`, only `buildPeakShape` hunks (`@@ -265`, `-274`, `+276,8`). In `StudioWorkspace.tsx`, one added line. Doc 166: one hunk `@@ -4 +4 @@`. In the pinned test files, only WZ1/WG1/WG2 assert hunks plus file-level helper blocks. In CP, a single append hunk.
- **LATENCY-212 / PERF-RUN-212:** check the `commits-per-move` row against B's ruling. Use C's own probe at both viewports, stopped and playing; the baseline is the control.
- **PIX-212**, mid-drag at −12 / +6 and zoom 2×. A covered rest, −12 / +24 typed and zoom 8× only.
- **RELEASE-212:** the typed −12 → drag → release MutationObserver probe, and a members drag.
- **SYNC-212**, including group (−6 / +1) ↔ clip switches; WAVE-LIVE-212; EXPORT-212; DOC-212; AN-REVIEW-212; G212-3.

## Scope completed
All implementation and self-check items of round 212 are done. The only open item is B's ruling on the `commits-per-move` delta. The whole backlog is not complete.
