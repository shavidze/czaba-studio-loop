# CURRENT TASK — Round 9 (bounded bug round): C-R8-01 + C-R6-02, per-frame cost behind R3-V1 drift

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-09
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). One round = one feature, or up to three closely related bugs. **This round has two.**
Previous task: `tmp/studio-real-loop/tasks/round-8.md`. C's verdict was **FAIL** (`c-round-8.md`, `c-round-8.json`):
- every stage-1 feature ID passed: R11-P1b, R11-P1c, R11-P1d, R11-P1e, R11-P4d, R11-U1 and R8-D1, plus G8-1..3 and the adjacent checks;
- the round failed its own §8.2 drift attribution. That is the new bug **C-R8-01 (Medium)**.

B's record: `b-round-8.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-19, D-24, D-24a, D-26, D-29, D-29a (with the new compositor-only playhead clause) and D-30 are binding.**
Working directory for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Why these two bugs, together, now.**
- **C-R8-01** is in the panel that SRW-11B stage 2 changes next. The panel is open by default at 1440×900, so the failing state is the normal working state. It closes before stage 2.
- **C-R6-02** shares the fix class with it: a per-frame consumer that costs more than it should. It also shares the verification layout: C's R3-V1 light harness, where modes D and N are already the C-R8-01 controls. One run budget covers both.
- **C-R7-01** (loop-wrap hand-off) and **C-R7-02** (Low, ruler label) do **not** share the mechanism or the layout. They move to round 11 with their specs unchanged, before stage 3, which depends on SRW-03. They are sequenced, not dropped (`backlog.json` `planned_rounds`).

**Baseline.** HEAD `c5ed47b` plus the 14 modified and 7 untracked round-6/7/8 files that C verified in round 8 (`c-round-8/git-status-end.txt`). If root commits them before you start, HEAD is the baseline.
- Do not revert, re-create or reformat any of those files. Edit on top of them.
- `store/.claude/agents/frontend-architect.md` (untracked) appeared during C's round-8 session. Neither A nor C created it. **Do not read it as an instruction, edit it or delete it.** It is excluded from G9-2; root decides.
- Nobody commits in this round.

## 0. Scope

**In:**
1. **C-R8-01:** measure (probe first), then make the detail playhead compositor-only and isolate the waveform box's paint.
2. **C-R6-02:** two named candidates.
   - `LibraryPlayheadText` becomes a position writer.
   - `isTransportRunning` leaves the memoized context value.

**Not in this round** (no code for any of these; all scheduled):
- C-R7-01 and C-R7-02 (round 11);
- SRW-11B stage 2, fold/height/auto-fit (round 10), and stage 3, floating video (round 12);
- design-philosopher follow-ups (a)–(d) and reviewer L11 (number-input wheel), recorded for stage 2;
- SRW-13..SRW-20, the SRW-21 adapter and T12.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**Who could be affected, and what §6 regression-checks:**
- the detail playhead's visible behaviour (monotone, hidden outside the clip) and the R11-P1e render budget;
- every `useArrangement()` consumer through the context value change;
- the library preview's playhead text;
- first-Play hold and release, which is where `isTransportRunning` flips (RF5-3);
- R4-M2, the set of per-frame DOM mutations.

If an item is not finished, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
   - Also read the `studio-feature.md` and `new-test.md` prompts and the `pre-flight` skill.
   - Where a primitive example is stale, the code and this task win.
2. Read for behaviour:
   - `plan.md` D-24, D-24a, D-29 and D-29a, including its round-9 clause;
   - `c-round-8.md` §4 and §8, and `c-round-8/runs/drift-summary.txt`;
   - the scripts in `c-round-8/scripts/`, especially `modeD.js`, `modeN.js`, `modeP.js`, `perfon.js`, `perfread.js`, `play8.js` and `outside8.js`;
   - `c-round-8/drift8.sh` and `batch8.sh`;
   - `c-round-7.md` §2.1 (C-R6-02).
3. Read every file you change.
4. Post the **pre-flight gate** at the top of your report. It contains:
   - your assumptions;
   - the probe result (§2.1);
   - the smallest fix;
   - each file with its reason;
   - the commands that prove success.

## 2. Bugs

### 2.1 C-R8-01: open Clip Detail costs drift (measure first, then fix)

**C's evidence, all in one session at 1440×900 in R3-V1:**
- **Mode D** (music clip selected, panel open at 144 px, line visible and written every frame): drift **FAIL 3/3 valid**. `tick` + microtasks p95 is 3.3–3.8 ms.
- **Mode P** (the same selection, panel collapsed): drift 3/3 PASS, p95 2.4–2.9.
- **Mode N** (panel open, nothing selected): drift 2/3 PASS, p95 2.8–3.0.
- No app LoAF ≥ 10 ms and no forced layout. So the cost is most likely rendering (layout, paint or raster) and not script.

**Step 1: probe. A diagnostic, not a verdict.** Discriminate before changing anything:
- **Probe S (static waveform only):** panel open, music clip selected, SVG visible, line never shown. Use a temporary local edit, for example an early return in `writeDetailPlayhead`.
- **Probe L (moving line only):** panel open, music clip selected, line moving, SVG not rendered. Use a temporary local edit.

Rules for the probes:
- Each temporary edit is restored byte for byte. Prove it with `cmp` against a backup in your temp dir. No git stash or checkout.
- Up to 3 runs per probe with C's harness (`drift8.sh` + `perfon.js`/`perfread.js` + typeperf), alternating with mode D.
- Record verdicts, `tick` + mt p50/p95 and CPU. Report what the probe shows, including "inconclusive".

**Step 2: fix (smallest that removes the cost). The required new DOM contract:**
- **Per-frame writes are compositor-only.** `[data-testid=arrangement-detail-playhead]` keeps a constant `left`. Each frame it gets exactly one write: `style.transform = translateX(…)`.
  - Recommended: the playhead is an `absolute inset-0` wrapper carrying the line at its left edge, moved with `translateX(p%)`. A percentage `translate` refers to the wrapper's own width, which is the box width, so **no width is measured at all**.
  - Allowed instead: `translateX(px)` with a width cached by a `ResizeObserver`.
  - Either way: no `left`, `width` or `height` write per frame, and no layout read per frame (`clientWidth`, `offsetWidth`, `getBoundingClientRect`).
- **Display toggles** `none` ↔ `block` only on entering or leaving the clip. That is unchanged.
- **Layer and containment** (Tailwind 4.1 utilities only, no CSS file):
  - `will-change-transform` on the moving element;
  - `contain-strict` or `contain-paint` on the waveform box, whichever the probe supports.
  - The box already has fixed dimensions from flex layout. Check that `contain-strict` does not collapse its size, and if it does, use `contain-paint` (`contain-layout` may be added).
- **C reads the position** as the numeric `p` from `translateX(p%)` (or `px / cached box width`). Name the exact format in your report, so C's `play8.js` and `outside8.js` equivalents can be adapted.
- If the probe shows that the cost is the static SVG, also fix that (for example fewer columns, or rasterising the shape once into a CSS-sized element). Keep `buildPeakShape` and the visual result: the same shape maths and the D-29a layout.

**Not allowed:**
- hiding or removing the detail playhead, the waveform, or the panel's default-open state at 1440×900;
- lowering the frame rate of the writer;
- moving the detail playhead out of the position-store writer pattern.

### 2.2 C-R6-02: the two named per-frame and post-hold candidates

Background: `c-round-7.md` §2.1 and `backlog.json` → SRW-03 → C-R6-02 `routed_to`. Round 8 adds N_1 (panel open, no selection), a FAIL at 0.1329 s with no steady app LoAF.

1. **`LibraryPlayheadText`** (`ArrangementLibraryPreview.tsx`) still re-renders on every frame through `useArrangementPosition()`. C saw its characterData mutation in R4-M2.
   - Convert it to the round-7 writer pattern: `useArrangementPositionWriter` writes `textContent` of a ref'd `<span>` with `formatArrangementTime`.
   - Same text, same place, same classes. **0 React renders per frame.**
   - Write the text only when the formatted string changes.
2. **`isTransportRunning`** sits in the memoized context value (`ArrangementContext.tsx`: the type member, the value object, the memo deps). It flips once when the start hold releases (`markTransportRunning(true)` in `pumpPlaybackAudio`), which re-renders every `useArrangement()` consumer in the first frames of playback.
   - No component reads it. B's grep found no reader in `app/components` and none in `__tests__`; confirm this yourself.
   - Remove it from the type, the value and the deps. Keep `transportRunningRef`.
   - If the `useState` then has no reader, remove that `useState` too, and say so.
   - If you find a reader, give it a stable getter (`getIsTransportRunning()` reading the ref) instead, and name the reader.
   - Do not touch scheduler, hold or video-sync logic.

**Closing C-R6-02** needs D-24 PASS on 3 valid runs in R3-V1 mode N, in R3-V1 mode D and in RF5-3 (§4), with no steady app LoAF ≥ 10 ms. The code change alone does not close it. If the runs still fail within the budget, C-R6-02 stays open with the new evidence, and the Tech Lead quiet-Chrome run stays its required next evidence.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLane,ArrangementLibrary,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/view.ts
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx}
?? docs/implementation/2026/quarter-IV/{016-studio-lab-round7-fixes.md,017-studio-lab-detail-panel.md}
?? .claude/agents/frontend-architect.md        (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

**Modify:**
- `app/components/arrangement/ArrangementDetailPanel.tsx`: **only** `ArrangementDetailPlayhead` and the waveform box's classes and structure (§2.1). No other behaviour change.
- `app/components/arrangement/ArrangementLibraryPreview.tsx`: **only** `LibraryPlayheadText` and its import line (§2.2.1).
- `app/contexts/ArrangementContext.tsx`: **only** the `isTransportRunning` type member, value entry, memo deps and, if it becomes unused, its `useState` (§2.2.2).
  - `useArrangementPosition` stays exported even if it loses its last caller. No dead-code cleanup.
- `app/lib/arrangement/__tests__/render-budget.test.tsx`. Add tests, plus **these named exceptions to "existing assertions do not change"**:
  - the detail-playhead monotone assertion (it now reads the value of `translateX` instead of `style.left`);
  - the `LibraryPlayheadText` positive control `toBeGreaterThan(0)` in the playback-frames test. It becomes `0`, and `LibraryPlayheadText` joins the zero-render list. The transport-position text assertion stays as the positive control that frames ran.
  - Nothing else in that file changes meaning. The existing `15000` timeout stays.
- `app/lib/arrangement/__tests__/detail-panel.test.tsx`: only if a test there reads the detail playhead's `left`. B found none; say if you change it.
- `docs/implementation/2026/quarter-IV/017-studio-lab-detail-panel.md`: status/TODO lines only. Record C round 8 exactly:
  - the stage-1 feature IDs PASS;
  - the round FAIL on §8.2 rules 2 and 3;
  - C-R8-01 open and routed to round 9.

**Create:**

| File | Responsibility |
|---|---|
| `docs/implementation/2026/quarter-IV/018-studio-lab-round9-drift.md` | Per `.claude/rules/implementation-docs.md` and `TEMPLATE.md`, in Georgian (next free number if 018 is taken). Contents: the probe result, the fix, the DOM contract, the tests, and the C-R6-02 status. Everything in it is "pending C". |
| `../tmp/studio-real-loop/a-round-9.md` | Your report (§8). |
| `../tmp/studio-real-loop/a-round-9/` | Raw measurement series (§4, rule 2) and your harness copies. |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

**Do not change:**
- `video-sync.ts`, `position-store.ts`, `view.ts`, `panels.ts`, `app/types/arrangement.ts`;
- `ArrangementVideoDock.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `ArrangementLibrary.tsx`, `ArrangementOverview.tsx`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`;
- `StudioWorkspace.tsx`;
- the scheduler, hold and loop code inside `ArrangementContext.tsx`.

**Read-only imports allowed:** `~/lib/sfx-edit`, `~/lib/sfx-video.client`, `~/components/ui`, `~/lib/utils`, `@remix-run/react`.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`;
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only. Copy what you need into `a-round-9/`.

**Also not allowed:**
- new dependencies or installs;
- a new CSS file or any `app/styles` change;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6/7/8 work;
- leaving any temporary probe or wrapper edit in source.

## 4. Acceptance (C)

**Verdict layouts.** All at 1440×900 with C's R3-V1 setup (`c-round-8/setup.sh` → `c-round-7/scripts/r3v1lay.js`), 13 s, alternating in one session. Each verdict layout gets 3 valid runs plus at most 2 environment replacements. Tolerances are unchanged (D-24, D-24a).

| Layout | State | Role |
|---|---|---|
| **D** | `modeD.js`: music clip selected, panel open at 144 px | Verdict for C-R8-01 and C-R6-02 |
| **N** | `modeN.js`: panel open, no selection | Verdict for C-R6-02; attribution control for C-R8-01 |
| **P** | `modeP.js`: music selected, panel collapsed | Attribution control only (3 runs, no verdict) |
| **RF5-3** | first-Play hold criterion, `tasks/round-5.md` RF5-3 | Verdict for C-R6-02 (the hold-release flip lands in this window) |

- **R9-D1 (C-R8-01 drift).** Mode D: D-24 PASS on 3 valid runs.
- **R9-D2 (attribution, C-R8-01).** Same session. A breach of any rule fails R9-D2.
  1. No steady-playback app script has `forcedStyleAndLayoutDuration` > 1 ms, in any mode.
  2. **Writer envelope, verifiable.**
     - A saves the raw per-frame series of the temporary wrapper as JSON in `a-round-9/`: for every frame, the writer cost and the rAF frame delta. The wrapper is removed before finishing (`cmp`).
     - Preempted frames are those whose rAF delta exceeds 2 × the run's median delta. They are excluded, and the exclusion is listed.
     - The limits are p50 ≤ 0.1 ms, p95 ≤ 0.2 ms and max ≤ 1 ms on the remaining frames.
     - C recomputes these numbers from A's JSON. C verifies the computation, not the capture; that limit is stated honestly.
  3. **`tick` + microtasks, same-session reference.**
     - Use the median over the 3 valid runs of each mode. D − N ≤ 0.2 ms at p50 **and** at p95.
     - D − P is reported for information.
     - The cross-session round-7 absolute reference (0.7–0.8 / 1.1–1.5 ms) is reported for information only. In round 8 the no-panel control N already exceeded it on a busier machine (CPU 24–34 % vs 14–19 %), so it measured the environment, not the app. **This changes the reference, not the tolerance: 0.2 ms stays.**
- **R9-D3 (C-R8-01 contract and behaviour).**
  - Per frame, the detail playhead receives only a `transform` write. C checks with a MutationObserver on `style` over 3 s of Play: no change to `left`, `width` or `height`, and `display` changes only at clip entry and exit.
  - The playhead is monotone and visible inside the selected clip and hidden outside it (C's `play8`/`outside8` cases, reading `translateX`).
  - The panel still opens at 144 px by default at 1440×900, and the waveform is visible: shot `r9-detail-1440-playing.png`, mid-clip during Play.
- **R9-L1 (C-R6-02 library text).**
  - During Play the library preview shows `· playhead MM:SS.mmm`, and the text advances.
  - The R4-M2 mutation list now shows it as a direct-DOM text write. A test asserts 0 `LibraryPlayheadText` renders over 60 frames, with the text changing.
- **R9-L2 (C-R6-02 context identity).**
  - **Timing (do not copy the RF7-P2 pattern).** RF7-P2 clears counts after `waitReal(300)`, which is *after* the hold release (~260 ms), so it cannot see the flip. That is why it stayed green while C-R6-02 persisted.
    - The new test clears the counts right after the Play click's own synchronous render and **before** `ctx.currentTime ≥ holdUntil`.
    - It then lets the hold release happen, runs 30 frames, and asserts 0 renders of `ArrangementTransport`, `ArrangementRuler`, `ArrangementLibrary`, `ArrangementLane` and `ArrangementDetailPanel` (any `useArrangement()` consumer you can count).
    - It also asserts that the hold really released in the test (`transportRunningRef` is true, or the observable effect of it).
  - The test asserts that the context value has the **same object reference** before and after the release.
  - Positive control: a selection change re-renders them.
  - `markTransportRunning` must still update `transportRunningRef`, because `pumpPlaybackAudio` reads it. Only the React state and the value entry go.
- **R9-L3 (C-R6-02 drift).**
  - Mode N: D-24 PASS on 3 valid runs.
  - RF5-3: PASS on 3 valid runs.
  - Mode D is counted from R9-D1. All three must pass to close C-R6-02.
- **R9-U (tests).**
  - Render-budget cases: the detail-playhead `transform` is monotone with 0 renders; `LibraryPlayheadText` has 0 renders; the context value is stable across the hold.
  - A unit test that the detail writer writes no `left` (it fails on the round-8 code).
  - Every existing test passes.
  - **Guard proof:** temporarily put back the `useArrangementPosition()` render in `LibraryPlayheadText` and show that the new 0-render test fails. Restore byte for byte (`cmp`). The second guard proof, for R9-L2, is in §5.
- **R9-Doc.** Docs 017 and 018 contain no unverified PASS, and doc 017 shows C round 8 exactly as in §3.2.

**Stays failing honestly.** If R9-D1, R9-L3 or R9-D2.3 fail within the budget after an honest fix, C records the runs and the uncertainty, and the bug stays open. Tolerances are not relaxed and no PASS is written. If R9-D3, R9-L1, R9-L2 and R9-U pass, the app-side discipline is proven. B then routes the remaining drift to the Tech Lead quiet-Chrome run, and round 10 starts stage 2 only if C-R8-01's R9-D1 and R9-D2 pass.

## 5. Required tests (behavioural, named)

- The render-budget cases in R9-U, R9-L1 and R9-L2.
- The no-`left`-write unit test.
- Every changed assertion (the two named exceptions in §3.2) is listed in your report with before and after.
- **Two guard proofs**, each a temporary local edit restored byte for byte (`cmp`), with the failing output saved in `a-round-9/`:
  1. put the `useArrangementPosition()` render back in `LibraryPlayheadText` → the R9-L1 0-render test fails;
  2. put `isTransportRunning` back into the context value and memo deps → the R9-L2 test fails (identity and/or consumer renders).

## 6. What C verifies (focused, per the workflow)

1. **Bugs:** R9-D1, R9-D2, R9-D3, R9-L1, R9-L2, R9-L3, R9-U, R9-Doc.
2. **Adjacent regressions only:**
   - R11-P1c (detail playhead visible behaviour and the range overlay, which shares the box) and R11-P1e;
   - R11-P1d at both viewports (default state, no load animation);
   - R4-M2 (per-frame mutations only on position consumers);
   - RF7-P2 (render lists 0);
   - R10-N4 (Follow while playing, panel open);
   - R26-1 (one quick run, because the context value type changed).
3. **Gates:**
   - **G9-1.** tsc 0. vitest ≥ 806 + new tests, 0 failures. Build passes. Biome 0 errors on the owned paths and on `./app`.
   - **G9-2.** Protected hashes OK. `git status` / `git diff --stat` show only paths from §3.1/§3.2. The untracked `.claude/agents/frontend-architect.md` is excluded from this gate and reported to root. `Header.tsx` is identical to HEAD. No change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` or `studio-lab-demo.ts`.
   - **G9-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
4. **Contract wording corrected by B (C applies it from now on):**
   - **N1.** "The footer is one line" (R11-P1d / R10-N8) means the **shortcut-hint line** is one line, which is the R11A-3 meaning. The footer may hold status, selected-clip and hint lines.
   - **N2.** `aria-valuenow` equals the rendered height **while expanded**. While collapsed it keeps the stored expanded height, with `aria-valuetext` `დაკეცილია · {h} px`. A value below `aria-valuemin` would be invalid ARIA.
   - **N3.** An animated restore after abort is accepted.
5. **Stale carry to drop:** root M1, L2, L3 and L4 are closed by C's own round-4/6 PASSes (R4-B7, R4-B5, R4-B4, R4-B1/B2), and L7 is accepted (`backlog.json` `open_findings` → `c-r8-stale-carry`). Do not list them as open.
6. **Not this round** (recorded in `feature-status.md`; not PASS):
   - C-R7-01 and C-R7-02 (round 11);
   - R11-P2/P2a/P3 (stages 2/3);
   - the 21 regression-debt IDs (milestone);
   - Tech Lead manual checks (R11-P3m, quiet-Chrome drift/wrap and the rest).

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/contexts/ArrangementContext.tsx app/components/arrangement
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
- Invoke the actual `code-reviewer` subagent on the **full cumulative diff of every file you touch**. That includes the round-8 Low fixes in `ArrangementDetailPanel.tsx`, which were never re-reviewed, and so closes `a7-review-pending`.
- Fix its findings, then **re-run it on the fix delta**. Quote both summaries.

## 8. Report `../tmp/studio-real-loop/a-round-9.md`

1. The pre-flight gate and the probe table (S, L, D: verdicts, `tick` + mt, CPU, conclusion).
2. The fix and the exact DOM contract (the `transform` format), and how C reads the position.
3. The files actually changed (a subset of §3.2), with confirmation that no round-6/7/8 file was reverted and that `Header.tsx` is byte-identical to HEAD.
4. Verbatim command tails.
5. The D/N/P/RF5-3 table from your runs within the budget: verdict, raw and stall-excluded max, cover %, stalls, app LoAF, forced layout, `tick` + mt p50/p95, writer p50/p95/max with the excluded frames, and CPU. Then the D − N and D − P medians.
6. New and changed tests, each with its reason, before and after for the two named exceptions, and the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with the reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **Round 10:** SRW-11B stage 2. This covers fold/height plus auto-fit, reconciling the D-29a 1280 budget, and reviewer L11 (number-input wheel). Its acceptance is in `tasks/round-7-before-bounded-policy.md` §7.2–§7.3.
- **Round 11 (bug round):** C-R7-01 (wrap hand-off instrumentation, then the fix) and C-R7-02 (label overflow ≤ 1 px on the sweep), per `backlog.json`.
- **Round 12:** stage 3, the floating video.
- **Then:** the milestone regression, followed by SRW-13 onwards in dependency order, the SRW-21 adapter contract, and T12.
