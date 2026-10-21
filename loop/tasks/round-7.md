# CURRENT TASK — Round 7 (bounded): fix C's round-6 bugs C-R6-02 (drift regression), C-R6-03 (ruler label overflow), C-R6-01 (Volume drag during another gesture)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-09
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`. Approved 2026-10-09; it overrides older instructions on round size, sync run counts and regression breadth. One round = one feature, or up to three related bugs.
Previous task: `tmp/studio-real-loop/tasks/round-6.md`. C's verdict was **FAIL**: RF6-2 and R10-N5 failed, every other round-6 ID passed (`c-round-6.md`, `c-round-6.json`).
B's record: `b-round-6.md`. Progress board: `feature-status.md`.
An earlier, larger round-7 draft (bugs + SRW-11B) is kept at `tasks/round-7-before-bounded-policy.md` for reference only. **SRW-11B is not part of this round.** It is scheduled next, as round 8, in stages. Nothing in its scope is dropped.
Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **The D-24a clarification and D-30 are binding.**
Working dir for every path: `C:/Apps/czaba-project/store` (`../` paths are relative to it).

**Baseline.** HEAD `c5ed47b` plus the 11 uncommitted round-6 files C verified (§2.1). If root commits them before you start, HEAD is the baseline. Either way:
- do not revert, re-create or reformat any round-6 file; edit on top of it;
- nobody commits in this round; root makes the final commit after all the work is done.

## 0. Scope: three related bugs, in this order

All three are regressions or gaps that C found in the round-6 work on the shared timeline: per-frame playback work, the ruler, and the D-26 gesture registry.

| # | Bug | Severity | Section |
|---|---|---|---|
| S1 | **C-R6-02**: drift regression with app-attributed long frames after round 6. Measure first, then fix. | Medium | §3 |
| S2 | **C-R6-03**: after Fit, the last ruler label overflows the timeline tail. | Low | §4 |
| S3 | **C-R6-01**: a Volume drag that started before a clip gesture commits in the middle of it. | Low | §5 |

Also: doc honesty (§6). No new feature UI.

**Who could be affected:** the playback loop and video sync (S1), the R4-M2 render discipline (S1), the ruler, Fit and the overview (S2), and the D-26 registry with all of its gestures (S3). The regression list in §8 covers exactly these.

**If an item is not finished,** list its acceptance IDs under "not ready" for that item. C fails those IDs and B carries them over. Do not fake or soften behaviour.

**Not this round (no UI for these; scheduled later, not dropped):**
- SRW-11B panels (round 8, staged);
- gain/pan/master/meters (SRW-13);
- grid/snap (SRW-14);
- bars/beats/tempo/metronome (SRW-15);
- markers (SRW-16);
- track groups (SRW-17);
- fades/envelopes (SRW-18);
- video opacity fade (SRW-19);
- range/MP3 export (SRW-20);
- purchased-adapter contract (SRW-21);
- T12 Gain/Volume.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives: `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
   - Prompts: `studio-feature.md`, `new-test.md`.
   - Skill: `pre-flight`.
   - Where a primitive example is stale, the code and this task win.
2. Read, for behaviour only:
   - `c-round-6.md` §2.1 (RF6-2), §3 (R10-N5), §6 (bugs), §7.
   - C's raw drift runs `c-round-6/runs/{L_7,L_8,Lr_2,Lr_3,Lr_5,Lr2_2}_raw.json`. Each LoAF has `scripts[]` with `sourceURL`, `invoker`, `duration` and `forcedStyleAndLayoutDuration`.
   - Also: `rafcost-1.json`, `rf62-summary*.txt`, `rf53-summary3.txt` and `F_*.json`.
   - Scripts: `c-round-6/drift.sh`, `c-round-5/scripts/rf5.js`, `rf5an.js`, `c-round-6/scripts/r3v1lay.js`, `n5o.js`, `n5o2.js`, `volpre.js`.
3. Read every file you change.
4. Post the **pre-flight gate** at the top of your report: your assumptions, the smallest fix for each item, each file with the reason, and the commands that prove success.

## 2. File ownership (exact; nothing else may change)

### 2.1 Baseline at dispatch (round-6 session-2 work; keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementLibrary,ArrangementOverview,ArrangementRuler,ArrangementTransport,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
```

`app/components/layout/Header.tsx` is **frozen**: byte-identical to HEAD, so `git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0.

### 2.2 May modify or create this round

**Modify:**
- `app/contexts/ArrangementContext.tsx`: S1 per-frame and Play-render work; the S3 volume claim.
- `app/lib/arrangement/position-store.ts` (S1) and `view.ts` (S2 tick labels).
- `app/lib/arrangement/video-sync.ts`: **only** as a named S1 fix, with before and after numbers in your report.
- These components, for the named reasons only:
  - `ArrangementRuler.tsx` (S2);
  - `ArrangementLane.tsx` (S3 slider claim; S1 render-count only);
  - `ArrangementOverview.tsx`, `ArrangementClip.tsx`, `ArrangementLibrary.tsx`, `ArrangementTransport.tsx`, `StudioWorkspace.tsx` (S1: memoisation or per-frame changes the measurements justify);
  - `ArrangementVideoDock.tsx`: the sync-loop `step` and its position subscribers only, for a C-R6-02 fix you name and measure before and after. The two `<video>` elements, their mount and `canEscalateAfterSeeked` stay as they are.
- `app/lib/arrangement/__tests__/*.test.ts` and `*.test.tsx`. An existing test may change only where §3–§5 change its contract; name each one with the reason.
- `docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md`: status/TODO lines only (§6).

**Create:**

| File | Responsibility |
|---|---|
| `app/lib/arrangement/__tests__/render-budget.test.tsx` (name optional) | RF7-P2 render counts and any changed per-frame function |
| `docs/implementation/2026/quarter-IV/016-studio-lab-round7-fixes.md` | Per `.claude/rules/implementation-docs.md` and `docs/implementation/TEMPLATE.md`, in Georgian. If 016 is taken, use the next free number. Covers S1–S3. |
| `../tmp/studio-real-loop/a-round-7.md` | Your report (§10). |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state. |

**Do not change** `app/types/arrangement.ts`. No change is expected there.

**Read-only imports allowed:** `~/lib/sfx-edit`, `~/lib/sfx-video.client`, `~/components/ui`, `~/lib/utils`, `@remix-run/react`.

**Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`;
- `root.tsx`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*`: read only. Copy what you need into your system temp directory.

**Also not allowed:**
- new dependencies or installs;
- deleting files or tests;
- git commit, stash, checkout, push or deploy;
- reverting round-6 work.

## 3. S1 — C-R6-02: drift regression, measure first

**What C found.** RF6-2 (the RF5-1 repeat) failed. Of 30 R3-V1 runs, 22 passed, 6 failed and 2 were invalid. Eight runs had app-attributed LoAFs ≥ 10 ms; round 5 had none:
- ArrangementContext rAF, 16–33 ms;
- VideoDock `step`, 22 ms;
- one React `performWorkUntilDeadline` of 62 ms right after Play (Lr2_2, ex max 0.206).

RF5-3 passed cleanly in 4 of 9 runs. In F_1..3, which came right after five loop runs, the video did not start within 300 ms of Play. The machine ran at 23–100 % CPU. The steady rAF tick costs a median of 0.1–0.2 ms, with peaks of 1.7–7.8 ms. The cause (app or preemption) is **unconfirmed**. D-24 counts app-attributed time against the app, so treat it as an app bug until it is shown otherwise.

Round 6 added per-frame work:
- the overview playhead and frame subscribers;
- the Follow check (A already moved it to cached values);
- overview `setVisibleStart` on scroll;
- more state in `StudioWorkspace`.

**Do this, in order.**
1. **Read C's evidence.** From the LoAF entries of the FAIL runs, list the top app scripts: function or `invoker`, duration, `forcedStyleAndLayoutDuration`, and the time in the run. Name what each one is.
2. **Measure before editing.** On the current tree, using a copy of C's light harness in your temp dir, R3-V1 layout, 13 s. **Run budget: 3 valid runs, plus at most 2 replacements for runs that are invalid because of the environment.**
   - Per-frame cost of `tick()`, of **each** position-store subscriber and of the dock `step`: p50/p95/max per function. Instrument with `performance.now()` in a harness wrapper, or in a temporary local patch that you remove before you finish. Never leave instrumentation in the source.
   - Whether any per-frame path reads layout (`getBoundingClientRect`, `offsetWidth`, `clientWidth`, `scrollLeft`) after writing style in the same frame.
   - The Play click: which components re-render on the `isPlaying` transition (render counts in a test, the R4-M2 pattern), and the app script duration of the LoAF that contains the Play click (median of 5 clicks).
3. **Fix what the measurements show.** Likely candidates; none is mandatory without evidence:
   - (a) per-frame subscribers write only `transform` or other compositor-only properties, and read no layout;
   - (b) components that do not depend on `isPlaying` do not re-render on Play/Pause: clips, overview bars, library rows, ruler ticks and the lanes' clip lists;
   - (c) no React state update on every scroll frame during Follow.
4. **Measure again** the same way and within the same budget. Put the before and after numbers side by side in your report.
5. **RF5-3 F_1..3:** reproduce C's exact order (5 RF5-2 loop runs, then a fresh Play), with at most 3 attempts. The loop runs are setup for the repro, not budgeted drift measurements. If `play()` is not called, or the video does not start within 300 ms, find the cause and fix it. If it does not reproduce, say so and include your runs.

**Acceptance (C).** Per the workflow, the sync budget is **3 valid runs and at most 2 replacements for environment-invalid runs, per layout**. A failed valid run counts. Tolerances and the D-24 rules are **unchanged**. A longer statistical series is a separate milestone regression and is not part of this round.
- **RF7-P1 (per-frame discipline; this is the main verdict for the cause).**
  - C records LoAF during 13 s of R3-V1 playback. These are the **same** 3 valid R3-V1 runs as RF7-2 (the light harness already records LoAF), not extra runs.
  - Every app-attributed script entry in steady playback (excluding the 300 ms after Play) has `forcedStyleAndLayoutDuration` ≤ 1 ms.
  - A's report names each per-frame callback with its before/after p50/p95/max.
- **RF7-P2 (Play render budget).**
  - A test asserts that `ArrangementClip`, the `ArrangementOverview` bars, the library list rows and the ruler tick list render **0 times** over Play→Pause→Play.
  - In the browser, the app-attributed script duration of the LoAF that contains the Play click has a median ≤ 16 ms over 5 Play clicks. C reports all 5 values and the machine CPU.
- **RF7-2 (drift).**
  - R3-V1: 3 valid runs. R2-V3: 3 valid runs.
  - Light harness. Report the raw and the stall-excluded series; an app-attributed LoAF ≥ 10 ms counts against the app.
  - Each run also reports the machine CPU % (sampled every 1 s, for example with `typeperf "\Processor(_Total)\% Processor Time"`), median and max, and the number of app-attributed LoAFs ≥ 10 ms. The CPU column is for information only and does not change the verdict.
- **RF7-3 (first Play after loops).**
  - 3 runs. Each run first plays RF5-2 loops, then a fresh Play. C's failing order was 5 loop runs, so use 5 loops where the machine allows; fewer loops must be recorded.
  - The RF5-2 regression verdict (+300 ms after each wrap, vt in [2.29, 2.31]) is taken from the first 3 wraps of the first run. The remaining loops are setup, not budgeted measurements.
  - Pass: `play()` within ±16.7 ms of `startAt`, w1 ≤ 0.1, w2 ≤ 0.06. C records the rule it uses for a harness `hold:false` artifact and does not count such an artifact as a failure.
- **RF7-U.** The RF7-P2 render-count test, plus tests for every per-frame function you changed. If `video-sync.ts` changed, all D-19/D-24/D-24a tests still pass and you name the contract that changed.
- **If RF7-2 or RF7-3 still fail** within the budget after an honest fix, C records the runs and the uncertainty, and C-R6-02 stays open. Tolerances are not relaxed and no PASS is written. If RF7-P1 and RF7-P2 pass (app discipline proven), B's next step is the Tech Lead quiet-Chrome check, and the next round starts SRW-11B. That is a schedule decision, not an acceptance.
- **Tech Lead (carried; now required evidence):** RF7-2 on a quiet real Windows Chrome, VP9 + H.264.

## 4. S2 — C-R6-03: the last ruler label overflows after Fit

**What C found.** At 1280×720, after Fit (Middle East on music at 0, Ctrl+D ×2, end 05:04.056), `scroller.scrollWidth` is 1074 px while the timeline content is 1054.7 px. The last label `5:30` (`absolute left-1 whitespace-nowrap`) hangs 19.2 px past the content and adds scroll width beyond the 30 s tail. On an empty project the overflow is 31.6 px (label `0:30`).

**Fix:** only the outcome is specified; the mechanism is yours. For example: skip a label that would not fit inside the content, right-anchor the last label, or clip the ruler's label layer.

**R10-N5r (C).** At 1280×720 and 1440×900:
- In C's two cases (Fit after Ctrl+D ×2; an empty project at the default zoom and after Fit): `scroller.scrollWidth − timeline content width ≤ 1 px`.
- Labels are ≥ 40 px apart and do not overlap.
- No visible label is cut in half.
- R10-N5's other parts still pass: Fit on 4 and 20 minutes; the overview extent grows.

**R10-N5-U:** a view or ruler test for the label-fit rule.

## 5. S3 — C-R6-01: a Volume drag is a gesture (D-30)

**What C found.** A Volume slider preview that starts **before** a clip gesture can be committed during that gesture and writes a `Volume` entry in the middle of it. Nothing is lost and the undo chain stays consistent. This is checkpoint-r6-review #10. Today the slider commits on `onPointerUp`/`onKeyUp`/`onBlur` → `commitTrackVolume` (`ArrangementLane.tsx`).

**D-30 (binding; amends D-26 rule 3).** A **pointer drag** on a track Volume slider is a pointer gesture:
- its `pointerdown` claims the D-26 registry: `claimPointerGesture(pointerId, abort)`;
- its abort reverts the preview to the stored value, writes no history and releases the claim;
- it ends on pointerup, change, lostpointercapture, blur or a same-pointer takeover.

While it is active:
- a clip, brace, marquee, ruler or playhead pointerdown from another pointer is ignored (D-26 rule 1);
- Mute/Solo and the other refused commands are refused (D-26 rule 3).

If the claim is refused because another gesture is active, the slider does not move; the existing snap-back and status stay as they are. Keyboard changes on a focused slider stay single commits and are refused during a gesture, as now.

**Acceptance (C).**
- **R30-1.** C's `volpre.js` order: slider pointerdown + move (preview); pointer 7 tries to drag a clip header; the slider is released; pointer 7 is released. Expected:
  - the clip does not move;
  - pointer 7 writes no history entry;
  - exactly one `Volume` entry, written when the slider is released;
  - `isPointerGestureActive()` is false afterwards.
- **R30-2.** A normal slider drag still writes one entry with the final value, and Ctrl+Z restores the old value. The R26-2 order (clip drag first, then the slider) still snaps back with the status message.
- **R30-U.** Component tests for both orders and for the abort path (blur in the middle of a drag → stored value restored, no entry). The first test must fail on the round-6 code. Say how you know: run it once before the fix, or reason from the old code path. No git stash or checkout.

## 6. Docs honesty

### 6.1 Doc 015 (status/TODO lines only)
- C round 6 failed RF6-2 (C-R6-02) and R10-N5 (C-R6-03); every other round-6 ID passed.
- C-R6-01 is open.
- The 21 G6-R IDs that C did not re-run are not PASS. They are due at the milestone regression.
- The Tech Lead real-mouse / quiet-Chrome list.

No PASS claim beyond C's.

### 6.2 Doc 016
Covers S1–S3, including the before/after measurement table. Mark everything "pending C"; no PASS claim.

### 6.3 D-24a release wording (binding for C; no code)
This applies only when the RF6-1 regression runs (§8). "After the forcing stops" means:
- no escalation whose qualifying `T`-window **began after** the release;
- at most **one** in-flight escalation from a window that was already qualified at the release, issued ≤ `T` + 150 ms after it;
- then |d| ≤ 0.1 within 1.5 s, and no further escalation.

**R7-D1 (C):**
- doc 015 and doc 016 make no unverified PASS claim;
- doc 015 lists RF6-2 and R10-N5 as failed in round 6, and C-R6-01..03 as open (or as fixed in round 7, pending C).

## 7. Required tests (behavioural, named)

- RF7-P2 render-count test, plus a test for every per-frame function you change (RF7-U).
- R10-N5-U: the label-fit rule.
- R30-U: both orders and the abort path.
- Any new status or refusal text is asserted by a test.

## 8. What C will verify (in this order; focused per the workflow)

1. **S1:** RF7-P1, RF7-P2, RF7-2, RF7-3, RF7-U.
2. **S2:** R10-N5r, R10-N5-U.
3. **S3:** R30-1, R30-2, R30-U.
4. **Docs:** R7-D1.
5. **Adjacent regressions only** (these are the behaviours the three fixes can break):
   - RF6-1 with the §6.3 wording, **only if** the dock `step` or `video-sync.ts` changed. Use C's 20 s fixture; 3 forced runs (budget as in §3).
   - R10-N6 (navigation while playing with video).
   - R4-M2 (per-frame DOM mutations only on position consumers).
   - R10-N1, R10-N3, R10-N5 (other parts) and R10-N8 (ruler, overview, layout), if the ruler, view or overview changed.
   - R26-1, R26-2, R26-3 (the D-26 registry, now including the slider).
   - R27-1 (Play from position), if the Play path changed.
   - R3-V3 / R5-B1r: video export oracle, if any video or schedule path changed.
6. **Gates:**
   - **G7-1.** tsc 0. vitest ≥ 761 + new tests, 0 failures. Build passes. Biome 0 errors on the owned paths and on `./app`.
   - **G7-2.** Protected hashes OK. `git status` / `git diff --stat` show only paths from §2.1/§2.2. `Header.tsx` is identical to HEAD. No change to `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` or `studio-lab-demo.ts`.
   - **G7-3.** Anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart` and the root GA consent-denied `page_view` are known and allowed.
7. **Not this round (recorded in `feature-status.md`; due at the milestone regression, not PASS):** the 21 G6-R IDs C did not re-run in round 6. These are R1-B5, R2-V1, R3-V2, R3-V4, R4-B1, R5-L3, R5-L4, R5-L5, R6-S5, R7-D2..D5, R8-M3, R8-M4, R9-C5, R11A-2 (keys half), R12-L2, R12-L4, R5-B5 and R5-B1u.
8. **Harness notes:**
   - Light harness only for drift; raw and stall-excluded series per D-24; the per-run CPU column.
   - Synthetic pointers are acceptable for R30-*; every synthetic pointerdown that should start a gesture needs `buttons: 1`.
   - Real `$B press` for keys.
   - Record the real-mouse limits.

## 9. Commands (paste the real output tails into your report)

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
- use `--write` only on paths you own this round, never on `Header.tsx`;
- run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files; then re-run the hash check;
- never run `npm run format`.

**Dev server and browser:**
- Use the running `http://127.0.0.1:5173`. Do not start or stop servers.
- Do all browser work through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`.
- Media: `../tmp/studio-real-loop/media/` and C's `../tmp/studio-real-loop/c-round-6/media/long-20s-vp9-opus.webm` (read only).
- Drift harness: adapted copies in your system temp dir, never in `c-round-*`.
- Do not work on, publish or test the standalone prototype or any Sites copy.

**Review.** Invoke the actual `code-reviewer` subagent (3+ files change), fix its findings, and quote its summary.

## 10. Report `../tmp/studio-real-loop/a-round-7.md`

1. The pre-flight gate.
2. Files actually changed (a subset of §2.2), with confirmation that no round-6 file was reverted and that `Header.tsx` is byte-identical to HEAD.
3. Verbatim command tails.
4. S1 evidence:
   - C's top LoAF scripts, with names;
   - your before/after table: per-frame p50/p95/max per callback, forced layout, Play render counts, Play-click LoAF median;
   - what you changed and why;
   - your own RF7-2/RF7-3 runs within the budget: count, worst run, app LoAF count, CPU.
5. Changed tests, each with the reason; new tests listed; for R30-U, how you know it fails on the old code.
6. code-reviewer findings and your fixes.
7. Deviations, each with the reason.
8. **"Not ready" acceptance IDs per item** (S1, S2, S3, docs).

Do not claim PASS.

## 11. Next (for orientation only; not this round)

Round 8 is **SRW-11B stage 1 (detail panel, PNL-01)** under D-29. The fold, height and auto-fit stage and the floating-video stage follow as separate rounds. Before round 8, B runs the design-philosopher pre-step. Full SRW-11B scope is preserved: `tasks/round-7-before-bounded-policy.md` §7 holds the draft acceptance.
