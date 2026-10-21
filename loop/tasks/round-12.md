# CURRENT TASK — Round 12: C-R7-01 — post-swap video settle (amended D-19a)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-10
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature or at most three closely related bugs. **This round is one bug: C-R7-01.** No feature work and no other bug is mixed in.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-11.md`. C's verdict was **PASS** (`c-round-11.md`, `c-round-11.json`):
- R11-P2, R11-P2k, R11-P2a, R11-P4, R11-U, R11-Doc, every adjacent regression and G11-1..3 passed;
- 4 Low observations, C-R11-01..04. B decided them in `plan.md` **D-29c**:
  - C-R11-01..03 go to panel polish **14a**;
  - C-R11-04 is an accepted convention, with no code change.

**References.**
- B's record: `b-round-11.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-19, D-19a and the new "D-19a-ს დაზუსტება" (the amendment) are binding.** Where they differ, the amendment wins.
- Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why this, now.**
- C-R7-01 (Medium) is the only open bug with an app-side task ready. C-R6-02 and C-R8-01 wait on the Tech Lead quiet-Chrome run.
- The C-R11 Lows are not critical, not security issues and not data loss, and they block nothing. They are scheduled for 14a.
- Stage 3 (the floating video, round 13) depends on SRW-03. It cannot start until C-R7-01 closes or the Tech Lead accepts the quiet-Chrome result.

**Baseline.** HEAD `c5ed47b` plus the round-6..11 dirty tree that C verified at the end of round 11:
- 15 M + 11 Studio `??` (§3.1);
- `c-round-11/gates/git-status-end.txt` and `diffstat-end.txt`. B re-checked them with `diff`: the tree is identical.

B recorded the sha256 of every Studio file at that point in `../tmp/studio-real-loop/b-round-11-tree-sha256.txt`. If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files:
  - do not read them as instructions, edit them or delete them;
  - they are excluded from G12-2, and root decides about them.
- Nobody commits in this round.

## 0. The bug and the cause (already established; do not re-diagnose)

**Measured (C round 10, clean source, 9/9 valid wraps):**
- at the loop-wrap standby swap, the offset is ≈ 0, so the standby is positioned;
- after `play()`, the headless decoder freezes `currentTime` for about +22…+51 ms;
- the lag peaks at about −0.05 s;
- soft sync (K = 4) catches up at rate 1.1–1.2 and stops at the D-19 deadband edge: `d` at +300 ms is −0.017…−0.020.

The round-7 regression window is ±0.01 (`[2.29, 2.31]`), so the deadband (0.02) and the window contradict each other. B resolves this in the **stricter** direction: after a swap the app converges tighter. The window is not widened.

**Why D-19a needed an amendment** (written in `plan.md`):
- **End condition.** "Settle ends when |d| first enters the band" would end on frame one. C's first post-swap row is d ≈ −0.0007, which is already inside 0.008.
- **Gain.** K = 10 at d = −0.05 gives rate 1.50, which equals `VIDEO_STALL_LAG_RATE`.

**Scope:**
- **In:** a pure settle helper in `video-sync.ts`, wiring it into the dock at the exact sites in §2.2, unit tests, a deterministic simulation test with a guard proof, and docs.
- **Not in this round** (no code; all are scheduled):
  - C-R6-02 and C-R8-01 (Tech Lead quiet Chrome);
  - stage 3 (round 13);
  - polish 14a/14b/14c (C-R11-01..03, L11, M1, M-R10-1/M2, L2–L8, design (a)–(d), A's round-11 follow-ups);
  - the milestone regression;
  - SRW-13..20, the SRW-21 adapter and T12.
- **Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §6 regression-checks:**
- clip-boundary and gap-entry swaps, which use the same swap block (R2-V3);
- first Play, which shares `startSlotPlayback` (RF5-3);
- steady-state drift with no swap (R3-V1 mode N, information);
- stall escalation (D-24/D-24a);
- the audio loop and export (R5-L3, R5-E1).

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - also the `studio-feature.md` and `new-test.md` prompts and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - in `plan.md`: D-19, D-19a with its amendment ("D-19a-ს დაზუსტება"), D-24 and D-24a;
   - `c-round-10.md` §2 and §7, and `c-round-10/runs/w-table.txt` with `*_wrapdetail.json` (the post-swap `d` series);
   - `a-round-10.md` §1.1 (your round-10 wrap instrumentation and its fields).
3. Read every file you change:
   - `video-sync.ts`: the whole file;
   - `video-sync.test.ts`;
   - `ArrangementVideoDock.tsx`:
     - the state shape l.56–75 and l.239–252;
     - `issueHoldSeek` l.320–328 and `stopAllSlots` l.330–340;
     - the swap block l.382–411;
     - the soft-sync tail l.523–560;
     - the `wasPlaying` reset l.582–592.
4. Post the **pre-flight gate** at the top of your report. It contains:
   - your assumptions;
   - the chosen K and settle cap, with the simulation numbers that justify them;
   - the smallest design;
   - each file with its reason;
   - the commands that prove success.

## 2. Fix (amended D-19a)

### 2.1 Pure helper in `video-sync.ts`

Names may differ; follow `AGENT_DISCOVERABLE_CODE.md`. Every constant is exported and tested.

**Constants:**

| Constant | Value |
|---|---|
| `VIDEO_SETTLE_BAND_SECONDS` | ≤ 0.008 |
| `VIDEO_SETTLE_GAIN` | K ∈ [8, 9] |
| `VIDEO_SETTLE_RATE_MAX` | ≤ 1.45, strictly `< VIDEO_STALL_LAG_RATE` |
| `VIDEO_SETTLE_RATE_MIN` | ≥ 0.55, strictly `> VIDEO_STALL_LEAD_RATE` |
| `VIDEO_SETTLE_MAX_SECONDS` | 1.0 |

**Rate function.** `videoSettleRateCorrection(drift)` has the same shape as `videoRateCorrection`:
- it returns 1 inside the settle band;
- otherwise it computes `1 − steps × VIDEO_RATE_STEP`, where steps = sign × max(1, round(|K·d| / step));
- the result is clamped to [`VIDEO_SETTLE_RATE_MIN`, `VIDEO_SETTLE_RATE_MAX`].

**The steady-state `videoRateCorrection`, `VIDEO_RATE_GAIN` (4) and `VIDEO_SOFT_SYNC_DEADBAND_SECONDS` (0.02) are byte-unchanged.**

**Settle state.** A small stateful object or pure reducer (like `createVideoStallWindow`), driven by audio-clock time (`ctxTime`), not by `performance.now()`. It has:
- **`armSettle(ctxTime)`**: called at a standby swap.
- **`settleRate(ctxTime, drift)`**: returns `{ rate, settling }`.
  - While armed, it uses `videoSettleRateCorrection`.
  - **Settle ends** at the first of:
    - (a) |d| ≤ band **after |d| has exceeded the band at least once since arming** (the re-entry rule; an in-band first sample does not end it);
    - (b) `ctxTime − armedAt ≥ VIDEO_SETTLE_MAX_SECONDS`;
    - (c) an explicit `endSettle()`.
  - Once settle has ended, it returns `videoRateCorrection(drift)`, exactly the steady rule.
- **`endSettle()`**: called by the dock (§2.2).
- **The D-24 stall path keeps its priority.** While settle is armed, compute the steady rate `videoRateCorrection(d)` first.
  - If that steady rate is at a stall edge (`isVideoRateAtStallEdge({ drift: d, rate: steady })`, i.e. ≥ `VIDEO_STALL_LAG_RATE` when lagging or ≤ `VIDEO_STALL_LEAD_RATE` when leading), return the steady rate. Settle does not end.
  - Otherwise return the settle rate.
  - This makes every stall-edge sample under the steady rule an edge sample under settle, so the escalation sequence is identical and a genuine post-swap stall escalates exactly as today. No separate drift threshold is introduced. The steady rule reaches 1.5 at |d| ≥ 0.11875.
- A clock that runs backwards (ctxTime < armedAt) also ends settle, as `pushStallSample` does with history.

### 2.2 The dock (`ArrangementVideoDock.tsx`): only these sites

1. **State:** add one field for the settle object to `DockSyncState` and its initialiser.
2. **Swap block (l.394–409):** after a successful standby swap, call `armSettle(due.atCtx)`. This is the only arming site. It covers all three swap kinds: wrap, boundary and gap-entry.
3. **Rate write (l.546–559):**
   - replace `videoRateCorrection(drift)` with the settle object's rate for `clock.ctxTime`;
   - push the **written** rate into the stall window, as today;
   - the escalation check and `writeVideoRate` stay where they are.
4. **End sites.** Call `endSettle()` in each of these:
   - `issueHoldSeek` (every hard seek and hold, including escalation);
   - `stopAllSlots`;
   - the `wasPlaying` reset branch;
   - the `!target || !source` pause branch (l.437–444).

   A new swap re-arms, so it restarts the settle.

**Not changed:**
- the hold-release start (l.488–492) and the paused/first-Play start (l.495–521) never arm settle;
- `prepareStandby`, `isStandbyReady`, the `VIDEO_LATE_SWAP_SECONDS` / `VIDEO_POSITIONED_SECONDS` constants, `startSlotPlayback`, `issueHoldSeek`'s body beyond the one call;
- the stall/escalation logic, D-24/D-24a thresholds, `canEscalateVideoSlot`, roles, muting and counters.

**Permanent observability.** Add `data-video-settles`, a count of armed settles, to `publishCounters`. Increment it **only** in the swap block.
- It is the one allowed counter addition, so C can confirm that settle armed exactly once per swap.
- Do not add any other dataset field, log or instrumentation to source.

### 2.3 Not allowed in this fix

- widening any window or tolerance;
- changing K, the deadband or the rate band of the steady rule;
- learned lead or any per-wrap tuning;
- a second rAF;
- changing `VIDEO_STALL_*` constants;
- seeking at the wrap instead of swapping.

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
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx}
?? docs/implementation/2026/quarter-IV/{016-studio-lab-round7-fixes.md,017-studio-lab-detail-panel.md,018-studio-lab-round9-drift.md,019-studio-lab-round10-wrap-ruler.md,020-studio-lab-track-fold-autofit.md}
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- record the sha256 of every §3.3 frozen file into `a-round-12/gates/frozen-start.txt`;
- copy the three owned source files to `a-round-12/bak/*.base.*`, which are the base for your diff and your guard.

### 3.2 May modify or create this round

**Modify:**
- `app/lib/arrangement/video-sync.ts`: add the §2.1 constants and the helper. The existing exports keep their behaviour byte for byte.
- `app/lib/arrangement/__tests__/video-sync.test.ts`: **add tests only**. Every existing test passes unchanged; if you change one, list it as a named exception with before and after.
- `app/components/arrangement/ArrangementVideoDock.tsx`: only the §2.2 sites.
- `docs/implementation/2026/quarter-IV/020-studio-lab-track-fold-autofit.md`: status and TODO lines only. Record C round 11 exactly:
  - R11-P2, P2k, P2a, P4, U and Doc PASS; adjacent regressions and G11-1..3 PASS;
  - 4 Low observations, C-R11-01..04;
  - C-R11-01..03 go to polish 14a under D-29c, and C-R11-04 is an accepted convention;
  - no "resolved" wording for C-R11-01..03.

**Create:**

| File | Responsibility |
|---|---|
| `docs/implementation/2026/quarter-IV/021-studio-lab-post-swap-settle.md` | Per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 021 is taken). Contents: the cause, the amended D-19a, the constants and their justification, the simulation model, the tests and your runs. Everything is "pending C". |
| `../tmp/studio-real-loop/a-round-12.md` | Your report (§8). |
| `../tmp/studio-real-loop/a-round-12/` | Runs, gates, guard outputs, backups. |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

### 3.3 Frozen this round (C checks them by sha256)

**C's reference is `b-round-11-tree-sha256.txt`, which is C's round-11 end tree, B-hashed.** A's `frozen-start.txt` must match it, and any difference is reported before you code.

Frozen files:
- **every round-11 file:** `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementDetailPanel.tsx`, `panels.ts`, `panels.test.ts`, `detail-panel.test.tsx`, `track-layout.test.tsx`;
- `ArrangementContext.tsx`, `ArrangementLibraryPreview.tsx`, `position-store.ts` and `render-budget.test.tsx` (the C-R8-01/C-R6-02 targets for the Tech Lead run);
- `ArrangementLibrary.tsx`, `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx`, `ArrangementContext.test.ts`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts`, `graph.client.ts`;
- docs 015–019.

**Read-only imports allowed:** `~/lib/utils` and the existing imports of the owned files. **Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`;
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only. Copy what you need (for example `setup.sh`, `r3v1lay.js`, `looplay.js`, `drift10.sh`, `wrapdetail.js`) into `a-round-12/`.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6..11 work;
- leaving temporary instrumentation in source (a wrapper used for your own runs must be gone, and `cmp` must show it);
- **editing any `store/` file (including docs) while a browser measurement runs**, because Vite reloads the page.

## 4. Acceptance (C)

**Verdict layout and budget.** This is the same layout as R10-W1, so the result is comparable:
- **L6 at 1440×900:**
  - C's `c-round-10/setup.sh` (fresh `goto`, fresh page load) → `r3v1lay.js` → `looplay.js` (loop 2–4);
  - then `drift10.sh` `{vclips R3-V1, durMs 8500, from 1, loop 2–4}`;
  - analysed with `rf7.js` + `rf5an.js` + `wrapdetail.js`.
- Fresh setup before each run.
- **3 valid runs plus at most 2 environment replacements.** A run is invalid only under the D-24 stall-coverage rule (> 10 %).
- **The first run after a fresh page load is one of the 3 verdict runs.** Its wrap 1 is the session's first swap.
- Tolerances are unchanged.

**R12-W1 (the C-R7-01 verdict, rule H3).** In each of the 3 valid runs, every one of its 3 wraps (9 in total) must meet all of these:
- **Landing:** |vt − expected(ctx)| ≤ **0.01** at the first rAF with ctx ≥ wrap + 0.300, where expected = loop.start + (ctx − wrapCtx). Equivalently, `wrapdetail.js` `d300`. C reports `d300` and max |d| over 500 ms for each wrap.
- It is a **swap**, not a fallback, and there is no hard seek in the 300 ms after the wrap.
- **`data-video-settles` increases by exactly 1 per swap.**
- **`data-video-escalations` does not change** over the run.

The run must also:
- pass D-24 (max ≤ 0.1 after exclusions);
- meet the hard rules:
  - 0 writes while seeking;
  - rate in [0.5, 2] overall and **≤ 1.45 at every row inside a settle window (swap → +1.0 s) with |d| ≤ 0.11** (the steady rule is below 1.5 there)
  - one visible `<video>`, both muted;
  - `multiPlayingMaxMs` ≤ 17;
  - 0 frames past `loop.end`.

**R12-S (no rate hunting outside settle).** In the 3 verdict runs, look at the rows outside the settle windows (swap → swap + 1.0 s):
- a rate ≠ 1 is only ever written when |d| > 0.02 at that row (the steady D-19 rule);
- C reports the count of rows with rate ≠ 1 and the share outside settle;
- C also reports the median |d| outside settle, for information only. The steady-state check is R3-V1 mode N (§6).

**R12-U (unit and simulation, `video-sync.test.ts`):**
- **Constants** are in their ranges, with `VIDEO_SETTLE_RATE_MAX < VIDEO_STALL_LAG_RATE` and `VIDEO_SETTLE_RATE_MIN > VIDEO_STALL_LEAD_RATE`.
- **`videoSettleRateCorrection`:**
  - returns 1 inside the band;
  - rate is monotone non-increasing in the drift;
  - never outside [MIN, MAX];
  - uses the 0.05 step.
- **Settle state:**
  - an in-band first sample (d = −0.0007) does **not** end settle;
  - after |d| exceeds the band, the first in-band sample ends it;
  - it ends at `armedAt + 1.0 s`;
  - `endSettle()` ends it;
  - a backward clock ends it;
  - after the end, every result equals `videoRateCorrection(d)` over a drift grid from −1.2 to +1.2;
  - with no arming at all, the result equals `videoRateCorrection` (the steady state is unchanged).
- **Deterministic simulation** (pure, no timers). The model:
  - 60 Hz frames;
  - the rate takes effect one frame after it is written;
  - the 0.05 step;
  - video position frozen from +22 ms for 30 ms after a swap at offset 0;
  - each sample fed through the stall window (`createVideoStallWindow`) exactly as the dock does.

  The required results:
  - |d| at the first frame ≥ +300 ms is ≤ **0.01**. Report the value; B's first-order model gives about −0.006;
  - `shouldEscalateStall()` is false at every frame;
  - the maximum written rate is ≤ `VIDEO_SETTLE_RATE_MAX`;
  - after settle ends with |d| ≤ band, a constant |d| of 0.012 gives rate 1 (no hunting).
- **Stall priority simulation:** a swap followed by a 400 ms freeze. Escalation (`shouldEscalateStall()` true) happens at **exactly the same frame** as in the steady-rule-only control, and every sample that is at the stall edge in the control is at the stall edge with settle. Settle must not delay D-24.
- **Steady-state control:** the same simulation with the steady rule only (no arming) gives |d(+300)| > 0.01. This documents the bug and is the basis of the guard.
- **Guard proof.** Save it in `a-round-12/guard-proof.txt`:
  1. Temporarily change the end rule to "first in-band sample ends settle". The re-entry test and the simulation test fail.
  2. Temporarily set `VIDEO_SETTLE_RATE_MAX` to 1.5. The constants test fails.

  Restore with `cmp` against your pre-guard copy.
- Every existing `video-sync.test.ts` test passes unchanged, including "uses a gain K inside [2, 5]" (steady K = 4).

**R12-Doc.**
- Doc 020's status lines show C round 11 exactly as in §3.2.
- Doc 021 contains no unverified PASS.

**Stays failing honestly.** If R12-W1 fails within the budget after this fix:
- C records the runs, the `d300` table and the uncertainty;
- C-R7-01 stays open;
- tolerances are not relaxed and no PASS is written.

B then routes C-R7-01 to the Tech Lead quiet-Chrome RF7-3 run. Stage 3 waits for that run or for the bug to close. A fix that passes R12-W1 but fails R12-S or creates escalations is a FAIL.

## 5. Required tests (behavioural, named)

- Everything in R12-U, with the two-part guard proof.
- Every changed assertion is listed in your report with before and after.

## 6. What C verifies (focused, per the workflow)

1. **The bug:** R12-W1, R12-S, R12-U, R12-Doc.
2. **Adjacent regressions only:**
   - **R2-V3 ×1:** clip-boundary swaps now arm settle. C uses the round-10 R2-V3 layout and tolerances, unchanged, and also reports `data-video-settles` and escalations;
   - **RF5-3 ×1 under H2:** first Play must not arm settle. `data-video-settles` stays 0 until the first swap;
   - **R3-V1 mode N ×1, light harness:** for information only, not a C-R6-02 verdict. It must be no worse than round 10's N run (.0131/.0207, cover 0, app LoAF 0). C reports max, cover, app LoAF and `tick` + mt p95;
   - **R5-L3 / R5-E1:**
     - the audio wrap is still 1 source per clip per wrap, with seam 0 samples;
     - the loop-on export equals loop-off with **maxDiff ≤ 1.2e-7** (not 0). This follows the accepted finding `export-clip-onset-1lsb`;
   - **RF7-P2:** `render-budget.test.tsx` sha unchanged and green;
   - **Dock quick check at 1440×900 and 1280×720:** the compact dock is ≥ 160×90, there is one visible `<video>`, and the R10-N8 transport layout matches round 11. The dock markup is unchanged apart from the new dataset attribute.
3. **Gates:**
   - **G12-1.**
     - tsc 0;
     - vitest ≥ **856** + the new tests, 0 failures. If the known `sfx-library.test.tsx` load flake recurs, re-run that file alone and report both results;
     - build passes;
     - Biome 0 errors on the owned paths and on `./app`.
   - **G12-2.**
     - Protected hashes OK.
     - `git status` / `git diff --stat` show only §3.1/§3.2 paths. The two foreign agent files are excluded and reported to root.
     - `Header.tsx` is identical to HEAD.
     - Every §3.3 file matches `b-round-11-tree-sha256.txt`.
     - The owned files' base backups `a-round-12/bak/*.base.*` match `b-round-11-tree-sha256.txt`.
     - No change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` or `studio-lab-demo.ts`.
     - Instrumentation grep = 0, and the dock is `cmp`-identical to A's final.
   - **G12-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **Harness rules:**
   - H1 and H2 (round 10) still apply.
   - **H3 is in force from this round's verdict.**
5. **Closed root carry (do not list as open).** Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed by C's own PASSes. Still carried, and honest:
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the export hard-clip at 0 dBFS (R13-M4, SRW-13; peak 1.0 seen again in round 11);
   - the final commit/push only after everything.
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R6-02 and C-R8-01 (Tech Lead quiet Chrome);
   - stage 3 (round 13);
   - polish 14a–14c;
   - the 21 regression-debt IDs (milestone);
   - Tech Lead manual checks, including RF7-3 in quiet Chrome on VP9 + H.264, which remains required evidence for SRW-03 whatever R12-W1 shows.

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement/__tests__/video-sync.test.ts
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
- **Your own wrap runs:**
  - same layout as §4;
  - the same budget (3 valid + 2 replacements);
  - an optional wrapper is allowed for your runs only, and it must be removed afterwards (`cmp`).
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** The task touches 3 source/test files plus docs:
- invoke the actual `code-reviewer` subagent on the full diff of every file you touch;
- fix its findings, then re-run it on the fix delta;
- quote both summaries.

## 8. Report `../tmp/studio-real-loop/a-round-12.md`

1. The pre-flight gate, including the K/cap choice and the simulation numbers.
2. The design:
   - the helper API;
   - the end rule;
   - the dock sites, each with line numbers before and after;
   - why the hold-release and first-Play starts do not arm.
3. The files actually changed (a subset of §3.2), with confirmation that:
   - no round-6..11 file was reverted;
   - `frozen-start.txt` equals `b-round-11-tree-sha256.txt` for every §3.3 file;
   - `Header.tsx` is byte-identical to HEAD;
   - instrumentation is gone.
4. Verbatim command tails.
5. Your own wrap runs, marked as A's evidence and not a verdict: a per-wrap `d300` table, max |d| over 500 ms, settle end time and reason, escalations, and the settles counter.
6. New and changed tests, each with its reason and before/after for any named exception, plus the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with the reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 13: SRW-11B stage 3, the floating video (VID-06).**
  - It starts if C-R7-01 closes in round 12, or after the Tech Lead accepts the quiet-Chrome result.
  - If R12-W1 fails, B dispatches **polish 14a** (C-R11-01..03, D-29c) in round 13 instead, because it is independent of SRW-03, and stage 3 waits.
- **Then:**
  - polish 14a, 14b and 14c;
  - the milestone regression, including the 21 regression-debt IDs;
  - SRW-13 onwards in dependency order (13 → 14/15 → 16 → 17 → 18 → 19 → 20);
  - the SRW-21 adapter contract;
  - T12.
