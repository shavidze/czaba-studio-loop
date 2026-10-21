# CURRENT TASK — Round 10 (bounded bug round): C-R7-01 loop-wrap video landing + C-R7-02 ruler label overflow

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-10
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature, or up to three closely related bugs. **This round has two carried bugs; see "why together" for the disclosed exception.**
Previous task: `tmp/studio-real-loop/tasks/round-9.md`. C's verdict was **FAIL** (`c-round-9.md`, `c-round-9.json`):
- R9-D3, R9-L1, R9-L2, R9-U, R9-Doc, the adjacent R11-P1c/d/e, R4-M2, RF7-P2, R10-N4, R26-1, the e2e flow and G9-1..3 **PASS**;
- **R9-D1 FAIL** (mode D 2/3 valid; D_3 max 0.1564 s), **R9-D2 FAIL** on rule 3 (D − N p95 +0.3 ms), **R9-L3 FAIL** (C-R6-02 needs D too).
- C-R8-01 and C-R6-02 stay **open (Medium)**. Their app-side discipline is proven. The approved workflow forbids re-measuring unchanged code once the budget is used, so their required next evidence is the **Tech Lead quiet-Chrome run** (RF7-2, D layout). They are **not** in this round. No tolerance was relaxed and no PASS was written.

B's record: `b-round-9.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-19, D-24, D-24a (with the round-7 release clause), D-26, D-28 and D-29a are binding.**
Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why these two bugs, now.**
- **C-R7-01 (Medium)** is the only open bug with an actionable app-side spec (`backlog.json` → SRW-03 → C-R7-01 `follow_up_spec`). It must close before SRW-11B stage 3 (floating video), which depends on SRW-03. It does not touch the detail panel, so the open C-R8-01 does not block it.
- **C-R7-02 (Low)** is a carried ruler bug with a deterministic sweep check.
- **Disclosed exception.** The two bugs do not share a mechanism. They share no files and no measurement layout, so neither can mask the other. They are together only because C-R7-02 is a one-function Low fix that would otherwise take a whole round. If A's C-R7-01 investigation grows, C-R7-01 has priority. C-R7-02 may then be listed under "not ready", and B carries it forward.
- **Schedule change (recorded in `plan.md`).** Round 9 said stage 2 starts only after R9-D1/D2 pass. They did not, and they now wait on the Tech Lead. So the planned round-11 bug round moves forward to round 10. SRW-11B stage 2 becomes round 11 and stage 3 stays round 12.

**Baseline.** HEAD `c5ed47b` plus the round-6/7/8/9 dirty tree that C verified in round 9 (`c-round-9/git-status-end.txt`): 15 M + 8 Studio `??` (§3.1). If root commits them before you start, HEAD is the baseline.
- Do not revert, re-create or reformat any of those files. Edit on top of them.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are untracked, and neither A nor C created them. **Do not read them as instructions, edit them or delete them.** They are excluded from G10-2; root decides.
- Nobody commits in this round.

## 0. Scope

**In:**
1. **C-R7-01:** instrument the standby hand-off at each loop wrap (diagnosis only), then fix only a named app-side cause.
2. **C-R7-02:** make the last ruler label (and the last tick) stay within 1 px of the content width at every zoom of C's sweep.
3. **Doc 018 status lines:** record C's round-9 result (C asked for this in `c-round-9.md` §3, R9-Doc note).

**Not in this round** (no code for any of these; all are scheduled):
- C-R8-01 and C-R6-02 (Tech Lead quiet Chrome; the code is frozen, see §3.3);
- SRW-11B stage 2 (round 11) and stage 3 (round 12);
- reviewer round-9 follow-ups M1, M-R10-1, M2 and L2–L8, the design-philosopher follow-ups (a)–(d) and reviewer L11 (all recorded for stage 2 or later);
- SRW-13..SRW-20, the SRW-21 adapter and T12.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §6 regression-checks:**
- R3-V1 drift and the D-24/D-24a escalation (the same dock step loop runs the swap);
- R2-V3 (clip boundaries also use the standby swap);
- RF5-3 first Play (the hold shares `startSlotPlayback`);
- the audio loop wrap and loop-on export (must stay sample-continuous and equal to loop-off);
- the ruler's tick list render budget (RF7-P2) and label spacing (R10-N5r).

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `REACT_CONTEXT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
   - Also read the `studio-feature.md` and `new-test.md` prompts and the `pre-flight` skill.
   - Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - `plan.md` D-19, D-24, D-24a (and its round-7 clarification) and D-28;
   - `c-round-7.md` §2.2 and §7 (C-R7-01 repro), `c-round-7/runs/rf72-summary.txt`, `L6_1_res.txt` and `L6_*_raw.json`;
   - C's harness: `c-round-7/batch7b.sh` (the `rf73` part), `drift7.sh`, `scripts/looplay.js`, `scripts/r3v1lay.js`, `setup.sh`;
   - `c-round-7/runs/n5r-1280x720.json`, `n5r-1440x900.json` and `scripts/n5r.js` (C-R7-02 sweep);
   - `tasks/round-5.md` RF5-2 and RF5-3, and `tasks/round-7.md` RF7-3.
3. Read every file you change.
4. Post the **pre-flight gate** at the top of your report. It contains:
   - your assumptions;
   - the instrumentation result (§2.1, step 1) and which cause it supports;
   - the smallest fix, or the statement that no app-side cause was found;
   - each file with its reason;
   - the commands that prove success.

## 2. Bugs

### 2.1 C-R7-01: video lands late after a loop wrap (instrument first, then fix)

**C's evidence (`c-round-7`):**
- **Layout L6:** video clip 0–6.008, loop 2–4, play from 1.0 for 8.5 s, light harness, 1440×900.
- **Failing run L6_1:** wrap 1 has vt **2.244** at +300 ms; the RF5-2 rule expects [2.29, 2.31]. That is 56 ms late. Wraps 2 and 3 landed at 2.295 and 2.294.
- **Run conditions:** the run was valid (0 stalls, 0 app LoAF, CPU median 15 %). All 3 wraps were swaps, with 0 fallbacks and no hard seek in the wrap window. `rateMax` was 1.3, and the run's drift max was 0.0346, a PASS.
- **Other runs:** setup runs L6_4 and L6_5 landed 2.286 and 2.280, and A's round-7 run 2.278. Round 6 was 5/5 clean.
- **Intermittent:** the landing is sometimes 10–56 ms late.
- **The window is not proven tight.** Round 5's *passing* RF5-2 evidence was vt ∈ [2.275, 2.311], and 2.275 would fail today's [2.29, 2.31]. Only round 6 (5/5) and most round-7 wraps sit inside it. The window is **not** relaxed, but a (c) or (m) outcome that ends at the Tech Lead quiet-Chrome run is a legitimate end state, not an evasion.

**What the code does today** (read it yourself and confirm):
- `ArrangementVideoDock.tsx` `runPlayingStep` arms the swap at `atCtx = ctxTime + upcoming.delay + audioLead` (`nextPredictableDiscontinuity`, kind `wrap`).
- `prepareStandby` seeks the standby to `mediaTime`. It skips the seek while the slot is busy, below `HAVE_METADATA`, or within `VIDEO_HARD_SEEK_INTERVAL_MS` (250 ms) of the slot's last seek.
- The swap happens on the first rAF step with `ctxTime ≥ atCtx`, if:
  - `lateBy ≤ VIDEO_LATE_SWAP_SECONDS` (0.1);
  - the target is still mapped;
  - `isStandbyReady` holds: `preparedKey` matches, the slot is not seek-busy, `readyState ≥ HAVE_CURRENT_DATA`, and `|standby.currentTime − mediaTime| ≤ VIDEO_POSITIONED_SECONDS`, **which is 0.04 s** (`ArrangementVideoDock.tsx` l.29).
- On swap, `startSlotPlayback(standby)` calls `play()` (asynchronous), and `lastSample` is seeded as `{ ctxTime: due.atCtx, unclamped: due.mediaTime }`.
  - `lastSample` feeds **only** `mappingJump` (discontinuity detection).
  - The rate controller works on `drift = frame − unclamped` on every playing step. It therefore does see a standby that swapped in behind, but only once `playPending` is false.
  - It corrects with a bounded ramp (`videoRateCorrection`, `VIDEO_RATE_STEP` 0.05 per step, band ≤ 2). L6_1's `rateMax 1.3` is consistent with such a correction running inside the 300 ms window.
  - Verify all of this in the code first.

**Step 1: instrument. A diagnosis, not a verdict.**
- Use a temporary wrapper (a local edit, restored byte for byte with `cmp` against a backup in `a-round-10/bak/`; no git stash or checkout).
- Per wrap, log as JSON into `a-round-10/runs/{K}_wraps.json`:
  - **At arm time:** the time the standby seek was issued, relative to the wrap (`atCtx`), or the reason it was skipped (busy, metadata or 250 ms interval).
  - **The `seeked` event:** its time relative to the wrap.
  - **At the swap instant:**
    - `lateBy`;
    - standby `readyState`, `seeking` and `currentTime − due.mediaTime`;
    - `playPending`.
  - **`play()`:** the latency from the call to the resolved promise and to the first `playing` event.
  - **For 500 ms after the wrap, on every rAF:**
    - `video.currentTime`;
    - the expected media time from the audio clock;
    - their difference `d`;
    - every `playbackRate` write.
  - **Order:** whether the wrap is the first swap of the session or a later one.
- **Runs:** L6 layout, up to **5 runs × 3 wraps** with C's harness. Also do one "first wrap after a fresh page load" run. Round 7's failure was wrap 1 of the first run.
- **Decide from the numbers which cause the data supports:**
  - **(a) late pre-seek:** the standby seek was issued too late or not settled before the wrap (a skip reason at arm time, or `seeked` after `atCtx`);
  - **(b) first-swap warm-up:** decoder or `play()` latency on the first swap (long `play()` → `playing` only on swap 1);
  - **(d) positioned tolerance plus start latency:** the standby was accepted up to `VIDEO_POSITIONED_SECONDS` (0.04 s) behind `mediaTime`, and `play()` start latency adds to that. The bounded soft-sync ramp cannot recover the sum within 300 ms.
    - Look for `currentTime − mediaTime` well below 0 at the swap.
    - Look for `d` recovering only gradually in the 500 ms series, alongside the rate writes.
  - **(m) measurement:** `d` stays within ±10 ms for the full 500 ms while C's single +300 ms sample read low. In that case the sampling instant, not the video, is late;
  - **(c) environment:** none of the above.
- Write **"inconclusive"** if the data does not separate them. Do not tune the fix to one run.

**Step 2: fix (only for a confirmed (a), (b) or (d)).**
- Keep D-19, D-24 and D-24a unchanged: the rate band [0.5, 2.0], the stall escalation, 0 writes while seeking, one visible `<video>`, both muted, and `play()` at `startAt − frameInterval` on first Play.
- Allowed shapes, all inside the swap scheduling:
  - **(a):** issue the standby pre-seek earlier inside the existing 1 s horizon, or exempt the standby's first preparation from the 250 ms interval. The active slot's interval is unchanged.
  - **(b):** start the standby `play()` earlier by a measured, bounded lead. The standby is invisible (`opacity-0`) until the swap. Both elements may be playing at the same time for **at most one frame**: C's `multiPlayingMaxMs` must stay ≤ 17. Alternatively, swap visibility only on `playing`.
  - **(d):** either of these.
    - Tighten the readiness tolerance to one frame (`state.frameInterval`), and fall back honestly when it is not met.
    - Or pre-roll the standby, so the swap-instant offset is ≈ 0.
    - **Not** a change to the `lastSample` seed: it does not feed the rate controller, so it would be a no-op with a green test.
- Put any new decision logic in a **pure exported helper** in `video-sync.ts` and unit-test it there: for example the readiness test with tolerance, the seed computation, or the pre-seek lead. The dock calls it.
- **If the result is (m) or (c):** change no source. Report the numbers. C's verdict below decides. A (m) result must also be reported to C as a harness note (§6.4).

**Not allowed:**
- relaxing `VIDEO_LATE_SWAP_SECONDS`, the RF5-2 window or any D-24 threshold;
- a hard seek at the wrap instead of the swap;
- removing the standby element;
- touching the first-Play hold, the stall escalation or the audio loop scheduler.

### 2.2 C-R7-02: the last ruler label overflows by 1.41–1.47 px at some zooms

**C's evidence (`c-round-7/runs/n5r-*.json`, `sweepWorst`):**
- `overflowBeyondContent` (scroller `scrollWidth` − content width) is **1.41 px** at 1280 (206.8 px/s) and **1.47 px** at 1440 (186.5 px/s).
- On the empty default it is exactly **1.0 px**.
- 0 overlaps and 0 cut labels; minimum label gap 40.05 px.

**Code today:**
- `view.ts` `rulerTickMarks` drops a label whose estimated end (`time × pps + RULER_LABEL_OFFSET_PX (5) + chars × RULER_LABEL_CHAR_WIDTH_PX (8)`) exceeds the ruler width.
- `ArrangementRuler.tsx` `ArrangementRulerTicksInner` renders every tick as a `border-l` div at `left: time × pps`. A tick at exactly the content end therefore adds a 1 px border beyond it.

**Step 1: diagnose.** At C's two worst zooms and on the empty default, identify which element sets `scrollWidth`:
- the last tick's border;
- the last label span;
- or sub-pixel rounding of the content width.

Record the element, its right edge and the content's right edge in `a-round-10/runs/c-r7-02-diagnosis.json`.

**Step 2: fix in the smallest place:**
- in `rulerTickMarks` (for example, no tick element at or past `content width − 1 px`, or a label estimate that is a true upper bound);
- and/or in the tick render (for example, draw the line inside the tick with a 1 px wide child, so it doesn't extend the box).

Constraints:
- No hidden or cut label that fits today.
- No change to label spacing (≥ 40 px), to the tick step rule or to the label text.
- The tick list stays memoised, with 0 renders on Play (RF7-P2).

**Test:** extend the R10-N5-U case in `view.test.ts` with C's two worst zooms (186.5 and 206.8 px/s at their sweep durations) and the empty default.
- The assertion is on the pure function's geometry: the last element's right edge ≤ content width + 1.
- If the fix is in the render, add a component test that reads the tick structure (no `border-l` box at the content end).

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/view.ts
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx}
?? docs/implementation/2026/quarter-IV/{016-studio-lab-round7-fixes.md,017-studio-lab-detail-panel.md,018-studio-lab-round9-drift.md}
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

**Modify:**
- `app/components/arrangement/ArrangementVideoDock.tsx`: **only** the swap scheduling inside the sync effect:
  - `prepareStandby`, `isStandbyReady` and the armed/swap block of `runPlayingStep` (including the standby pre-roll timing);
  - plus the module constants they use.
  - No change to the hold, the stall/escalation path, `issueHoldSeek`, the first-Play path, the roles or the markup.
- `app/lib/arrangement/video-sync.ts`: **only** new pure exported helpers or constants for the swap (§2.1, step 2). Existing exported functions and constants keep their behaviour, and every existing test stays green unchanged.
- `app/lib/arrangement/__tests__/video-sync.test.ts`: add tests only.
- `app/lib/arrangement/view.ts`: **only** `rulerTickMarks` and the ruler label constants.
- `app/components/arrangement/ArrangementRuler.tsx`: **only** `ArrangementRulerTicksInner`, and only if the diagnosis puts the cause in the tick render.
- `app/lib/arrangement/__tests__/view.test.ts`: add tests only. The existing R10-N5-U assertions keep their meaning. If an existing expectation changes because the last tick is now dropped (for example `{ time: 30, label: null }` disappears), list it in your report with before and after, as a **named exception**.
- `docs/implementation/2026/quarter-IV/018-studio-lab-round9-drift.md`: status and TODO lines only. Record C round 9 exactly:
  - R9-D3/L1/L2/U/Doc PASS;
  - R9-D1 FAIL: D 2/3, D_3 0.1564 s;
  - R9-D2 FAIL on rule 3: D − N p95 +0.3 ms;
  - R9-L3 FAIL: N 3/3, RF5-3 3/3, D 2/3;
  - C-R8-01 and C-R6-02 open, next evidence Tech Lead quiet Chrome.

**Create:**

| File | Responsibility |
|---|---|
| `docs/implementation/2026/quarter-IV/019-studio-lab-round10-wrap-ruler.md` | Per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 019 is taken). Contents: the instrumentation result and the cause, the fix or "no app-side cause", the C-R7-02 diagnosis and fix, and the tests. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-10.md` | Your report (§8). |
| `../tmp/studio-real-loop/a-round-10/` | Raw wrap series, the diagnosis JSON, backups and harness copies. |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

### 3.3 Frozen this round (C-R8-01 / C-R6-02 code waits for the Tech Lead evidence)

- `ArrangementDetailPanel.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementContext.tsx`, `position-store.ts`, `render-budget.test.tsx`, `detail-panel.test.tsx`, `panels.ts`, `panels.test.ts`;
- `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementLibrary.tsx`, `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `StudioWorkspace.tsx`;
- `app/types/arrangement.ts`, the scheduler, the hold and the loop code;
- docs 015, 016 and 017.

**Read-only imports allowed:** `~/lib/sfx-edit`, `~/lib/sfx-video.client`, `~/components/ui`, `~/lib/utils`, `@remix-run/react`.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`;
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only. Copy what you need into `a-round-10/`.

**Also not allowed:**
- new dependencies or installs;
- a new CSS file or any `app/styles` change;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6/7/8/9 work;
- leaving any temporary instrumentation in source;
- **editing any `store/` file (including docs) while a browser measurement runs**, because Vite reloads the page on any change (round-9 lesson).

## 4. Acceptance (C)

**Verdict layout and budget.** L6 at 1440×900: C's `setup.sh` → `r3v1lay.js` → `looplay.js` (loop 2–4) → `drift7.sh`-equivalent `{vclips R3-V1, durMs 8500, from 1, loop 2–4}`, with a fresh setup before each run. **3 valid runs plus at most 2 environment replacements.** A run is invalid only under the D-24 stall-coverage rule (> 10 %). Tolerances are unchanged.

- **R10-W1 (C-R7-01 verdict).** In each of the 3 valid runs, every one of its 3 wraps (9 wraps in total):
  - lands vt ∈ **[2.29, 2.31]** at +300 ms (the RF5-2 regression window);
  - is a **swap**, not a fallback, with no hard seek in the 300 ms after the wrap;
  - the run passes D-24 (max ≤ 0.1 after exclusions) and its hard rules: 0 writes while seeking, rate in [0.5, 2], one visible `<video>`, both muted, `multiPlayingMaxMs` ≤ 17, and 0 frames past `loop.end`.
  - The **first run after a fresh page load is one of the 3 verdict runs**, because the round-7 failure was wrap 1 of the first run.
- **R10-W2 (diagnosis honesty).**
  - `a-round-10/runs/*_wraps.json` exists, with the §2.1 fields for every wrap.
  - A's named cause is consistent with those numbers. C reads them, and C recomputes the swap-instant offset and `d` at +300 ms from A's JSON for at least one wrap per run.
  - If A claims (d), the swap-instant offset must be < −0.01 s in every wrap that landed below 2.29.
  - If none of A's wraps lands late, A cannot *confirm* (a), (b) or (d). A then reports "inconclusive" and does not change source on that basis. It still reports the distribution of the swap-instant readiness offset across all wraps.
  - If A claims (m), C additionally reports `d` at +300 ms (video vs the transport at the same instant) for every verdict wrap, for information.
  - The wrapper is gone: `grep` for A's wrapper markers in `app/` returns 0, and the dock is `cmp`-identical to A's `bak/*.fixed.tsx`.
- **R10-W3 (unit).** If source changed:
  - a named test of the new pure helper fails on the round-9 logic and passes now. Prove it with a guard: temporarily put back the old behaviour, show the failure and restore with `cmp`; save the output in `a-round-10/`;
  - every existing `video-sync.test.ts` test passes unchanged.

  If no source changed (cause (m) or (c)), R10-W3 is "not applicable" and A says so.
- **R10-R1 (C-R7-02).**
  - On C's `n5r` sweep at **both** 1280×720 and 1440×900, `overflowBeyondContent` ≤ **1.0 px** at every zoom, including the empty default, and **0** overlaps and 0 cut labels.
  - Minimum label gap ≥ 40 px.
  - The last label is shown wherever it fit in round 7: C compares `nLabels` per zoom against `c-round-7/runs/n5r-*.json`. A difference is allowed only for a label that itself overflowed.
- **R10-R2 (C-R7-02 tests).**
  - The new `view.test.ts` cases (C's worst zooms + the empty default) pass, and they fail on the round-9 function (A's guard output).
  - Any named exception from §3.2 is listed with before and after.
  - RF7-P2: the ruler tick list renders 0 times over Play → Pause → Play (the existing render-budget test stays green unchanged).
- **R10-Doc.**
  - Doc 018 shows C round 9 exactly as in §3.2.
  - Doc 019 contains no unverified PASS.

**Stays failing honestly.** If R10-W1 fails within the budget after an honest fix (or after an honest "no app-side cause"), C records the runs and the uncertainty, and C-R7-01 stays open. Tolerances are not relaxed and no PASS is written. B then routes it to the Tech Lead quiet-Chrome RF7-3 check, and stage 3 (floating video) does not start until it closes or the Tech Lead accepts the quiet-Chrome result.

## 5. Required tests (behavioural, named)

- The C-R7-01 helper tests (R10-W3), if source changed, with one guard proof.
- The C-R7-02 geometry tests (R10-R2), with one guard proof.
- Every changed assertion is listed in your report with before and after.

## 6. What C verifies (focused, per the workflow)

1. **Bugs:** R10-W1, R10-W2, R10-W3, R10-R1, R10-R2, R10-Doc.
2. **Adjacent regressions only:**
   - **R3-V1:** one light-harness D-24 run in mode N (`c-round-9/scripts/modeN.js`). It is for information, not a C-R6-02 verdict, and shows that the swap change did not break steady sync;
   - **R2-V3:** 1 run (clip-boundary swaps on the same code path);
   - **RF5-3:** 1 run (first Play shares `startSlotPlayback`). Use the H2 rule below;
   - **R5-L3 / R5-E1:** the audio loop wrap is still sample-continuous (1 source per clip at the wrap), and the loop-on WAV export equals loop-off (maxDiff ≤ 1.2e-7);
   - **R10-N5r** at both viewports (the ruler labels and Fit);
   - **RF7-P2:** render lists 0;
   - **R9-D3 quick check:** the MutationObserver on the detail playhead over 3 s still shows only `transform`. The file is frozen; this only confirms nothing shared moved.
3. **Gates:**
   - **G10-1.** tsc 0. vitest ≥ **809** + new tests, 0 failures. Build passes. Biome 0 errors on the owned paths and on `./app`.
   - **G10-2.** Protected hashes OK. `git status` / `git diff --stat` show only paths from §3.1/§3.2.
     - The two untracked foreign agent files are excluded and reported to root.
     - `Header.tsx` is identical to HEAD.
     - No change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` or `studio-lab-demo.ts`.
     - Every §3.3 frozen file is `cmp`-identical to its state at the start of the round.
   - **G10-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **Harness rules decided by B (C applies them from now on):**
   - **H1 (writer-envelope exclusion, future rounds only).** A preempted frame is one with an rAF delta **≥ 2 × the run median**, not strictly greater. A doubled 60 Hz frame (33.3 ms vs 2 × 16.7) is therefore excluded. This does **not** re-score round 9: R9-D2 failed on rule 3, independent of the envelope.
   - **H2 (RF5-3 hold check).** The RF5-3 text is "the shown media time must not advance before `startAt` by more than one frame". The harness verdict therefore accepts a non-paused pre-start row only if:
     - it is the `play()` row of the active element itself;
     - its ctxRel is within the RF5-3 `play()` window;
     - its `|vt|` is ≤ one frame (1/60 s).

     Any other non-paused pre-start row fails. C encodes this rule in the harness and reports raw `preAllPaused` alongside it.
5. **Closed root carry (do not list as open).** Root review M1 (R4-B7, round 4), L1/L2/L3/L4/L8/M2 (round 4), L6 (round 5, R5-B4), L7 (accepted) and M3 (round 6, R6-D1) are closed by C's own PASSes; `plan.md` §10 has the pointers. Still carried and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the final commit/push only after everything.
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R8-01 and C-R6-02 (Tech Lead quiet Chrome, D layout);
   - R11-P2/P2a/P3 (stages 2/3);
   - the 21 regression-debt IDs (milestone);
   - Tech Lead manual checks (R11-P3m, quiet-Chrome drift/wrap and the rest).

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/components/arrangement
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**`/check` rule (unchanged):**
- use `--write` only on the paths you own this round, never on `Header.tsx`;
- run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files; then re-run the hash check;
- never run `npm run format`.

**Dev server and browser:**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`. Use real `$B press` for keys; synthetic pointers need `buttons: 1`.
- Media: `../tmp/studio-real-loop/media/`.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.**
- Invoke the actual `code-reviewer` subagent on the full diff of every file you touch this round.
- Fix its findings, then **re-run it on the fix delta**. Quote both summaries.

## 8. Report `../tmp/studio-real-loop/a-round-10.md`

1. The pre-flight gate and the wrap instrumentation table. Per wrap:
   - run, wrap index and first-swap flag;
   - the pre-seek issue time or skip reason, and `seeked` relative to the wrap;
   - `lateBy`, `readyState`, offset at swap and `playPending`;
   - `play()` → resolved/`playing` latency;
   - vt and `d` at +300 ms, max |d| in 500 ms, and the rate writes.

   Then the cause (a/b/d/m/c, or inconclusive) with its reasoning.
2. The fix (or "no source change") and the C-R7-02 diagnosis and fix.
3. The files actually changed (a subset of §3.2), with confirmation that no round-6/7/8/9 file was reverted, that every §3.3 file is unchanged, and that `Header.tsx` is byte-identical to HEAD.
4. Verbatim command tails.
5. Your L6 runs within the budget: verdict, the 3 wrap landings, swap/fallback, hard seeks, max drift, stalls, app LoAF and CPU.
6. New and changed tests, each with its reason, before and after for any named exception, and both guard proofs.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with the reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 11:** SRW-11B stage 2: fold/height + auto-fit, reconciling the D-29a 1280 budget, and reviewer L11 (number-input wheel). The acceptance is in `tasks/round-7-before-bounded-policy.md` §7.2 and §7.4 (R11-P2, R11-P2a, R11-P4 fold shots, R11-U track/auto-fit). Stage 2 starts with C-R8-01 open. Its own regression includes one mode-D R3-V1 run, which must be no worse than round 9 (information for the Tech Lead run, not a C-R8-01 verdict).
- **Round 12:** stage 3, the floating video. It starts only after C-R7-01 closes, or after the Tech Lead accepts the quiet-Chrome result.
- **Then:** the milestone regression (including the 21 regression-debt IDs), then SRW-13 onwards in dependency order, the SRW-21 adapter contract, and T12.
