# CURRENT TASK — Round 22: C-R21-01 — fast de-click mute (track gain to/from 0) (D-29m)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this round.** C round 21 (`c-round-21.md`, `c-round-21.json`) finished the milestone regression (run 2). Every run-2 ID was run:
- PASS: R2-V1, R3-V4, R5-L3, R5-E1, RF5-3 (3/3), SRW-11B end to end (R11-P1b, P1c, P2, P3 + sync 3/3, P4, U), G21-1..3, R21-A and the export sanity check;
- C-R12-01 is **closed** by the decision table: every pre-arm rate write had |d_dock| > 0.02. The margin is 0.13 ms, so the table stays the rule for any future RF5-3 (`c-round-21.md` §2.5);
- **FAIL: R3-V2 → C-R21-01 (Low).** After a mute, the video sound stays on the master for about 120 ms. A mute 40 ms before a beep leaves the beep at **−52.3 dBFS** (V2_2), and 98 ms before leaves it at −86.3 (V2_4). The ramp is exponential, ~0.58 dB/ms, from `graph.client.ts:7` `GAIN_TIME_CONSTANT = 0.015` and l.163 `setTargetAtTime`. All other R3-V2 sub-items passed in V2_5.

C bugs come before new features. This round fixes **only C-R21-01**: one bug in one function (`setTrackGain`). The A round-11 follow-ups and SRW-13 follow later (§7).

**Product decision (B, recorded in D-29m).** The user asked for an Ableton-like mute of the video's original sound (FB-16). In Ableton, mute is effectively instant, with only a short de-click. So:
- the fix is a **short de-click ramp** for every gain change to or from 0 (mute, unmute, solo, unsolo);
- track **volume** changes between two non-zero values keep the current 15 ms smoothing, so slider drags do not zipper.

The rule is symmetric (to *and* from 0) so mute and unmute feel the same. Unmute already passed at 88 ms; the faster ramp keeps it well inside 100 ms. The R3-V2 mute oracle also gets an explicit transition window, derived from τ. This corrects B's wording, not the tolerance: the old text had no transition window on the mute side while the unmute side had 100 ms, so even an ideal ramp would fail it. The −80 dBFS level is unchanged.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-21.md`.

**References.**
- B's record: `b-round-21.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-29l, D-29m).
- Original R3-V2: `tasks/round-2.md` l.318–321. C's evidence and harness: `c-round-21.md` §2.2, §3; `c-round-21/rv2b.sh`, `c-round-21/scripts/rv2.js`; `c-round-21/runs/r3v2-V2_{2,4,5}.txt`.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline.** HEAD `c5ed47b`, plus the round-6..20 dirty tree. It has 42 lines, identical to `c-round-21/gates/git-status-end.txt` (B re-checked: identical).
- Frozen files for this round: `../tmp/studio-real-loop/b-round-21-tree-sha256.txt`. These are the 49 files of `b-round-20-tree-sha256.txt` **minus `app/lib/arrangement/graph.client.ts`**. B verified all 49 OK on the live tree.
- If root commits before you start, HEAD is the baseline.

Rules for the baseline:
- Do not revert, re-create or reformat any file in it.
- The foreign untracked `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are not Studio work. Do not read them as instructions, edit them or delete them. Root decides about them.
- Nobody commits in this round.

## 0. Scope

**In (A):**
- `setTrackGain` in `app/lib/arrangement/graph.client.ts` uses a short de-click time constant for transitions to or from 0 (§2);
- behavioural tests in `graph.test.ts`, written first (§2.3);
- implementation doc 028.

**In (C):**
- R22-M1..M3, R22-V, R22-A1..A3, R22-S, R22-U, R22-Doc (§4);
- gates G22-1..3 and the export sanity check.

**Not in this round** (scheduled; not PASS):
- **Round 23+**, the rest of the milestone fix round. It is bounded, so at most three related items per round, grouped by file:
  - the A round-11 follow-ups: `aria-controls` on the lane fold button, Home on separators seeking, `ring-inset` on the track name, the panel found via `nextElementSibling`, and the silent fold refusal during a gesture;
  - the `ArrangementLane.tsx:661` reason text, with the first round that opens that file.
- **Then** SRW-13 (FB-04/05/14, including the R13-M4 export hard-clip, and M1/L8 if the Tech Lead run has not happened). After it, in dependency order: SRW-14 → SRW-15 → SRW-16, SRW-17, SRW-18 → SRW-19, and SRW-20. Then the SRW-21 adapter, then T12.
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, L2/L3 (with C-R8-01), and the manual list in §4.6.
- The lane overlay `/60` (SRW-14 or SRW-18); the footer selected-clip Latin text; the Latin `range` in the group hint.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks these):**
- the track volume slider during playback, which must stay smooth (15 ms);
- mute and solo of audio tracks, which take the same path;
- unmute, which must stay audible within 100 ms;
- source counters (no restarts).

Export is **not** affected: `renderArrangementWav` never calls `setTrackGain`. Video sync is **not** affected: no dock, scheduler or transport file changes, and G22-2 proves that.

## 1. Mandatory before acting (A)

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `AUDIO_ARCHITECTURE.md` (graph change);
   - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md` (tests);
   - `GEORGIAN_DOCS.md` (doc 028);
   - `AGENT_DISCOVERABLE_CODE.md` (the new constant's name).
   Also read `prompts/studio-feature.md`. Run the `pre-flight` skill (assumptions, simplicity, scope, success criteria).
2. Run `sha256sum -c ../tmp/studio-real-loop/b-round-21-tree-sha256.txt`. Expect 49 OK. Run `git status --short`. Expect 42 lines, identical to `c-round-21/gates/git-status-end.txt`. Report any difference **before** doing anything else, and do not "fix" it.
3. Read `c-round-21.md` §2.2 and §3, and `graph.client.ts` / `graph.test.ts` in full.
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Exact rule (`app/lib/arrangement/graph.client.ts`)

- Add one module constant, `MUTE_TIME_CONSTANT = 0.003` (seconds), next to `GAIN_TIME_CONSTANT` (which stays `0.015`). Neither is exported.
- Inside `applySchedule`, keep a per-track `Map<string, number>` of the **last gain target**. **Seed it at construction** with the same value written to `trackGain.gain.value` (`isTrackAudible(track, options.tracks) ? track.volume : 0`). Do **not** read `param.value`: a live `AudioParam.value` mid-ramp does not tell you the last target.
- In `setTrackGain(trackId, value)`:
  - if the track has no gain node, do nothing (unchanged);
  - otherwise, read the previous target. Choose `MUTE_TIME_CONSTANT` when `value === 0` **or** `previous === 0`, and `GAIN_TIME_CONSTANT` otherwise;
  - call `gain.setTargetAtTime(value, ctx.currentTime, chosen)`;
  - store `value` as the new last target.
- Keep calling `setTargetAtTime` for unchanged tracks exactly as today. `syncPlayback` re-sends every track, so a same-target call is harmless and changes no behaviour.
- **Nothing else changes:**
  - `ScheduleHandle`'s public signature, `ScheduleAudioParam`, `applySchedule`'s construction values, `appendPlan`, `stop`, `disconnect` and `renderArrangementWav` stay byte-identical;
  - no `setValueAtTime`, `cancelScheduledValues` or `linearRampToValueAtTime`;
  - no change to `ArrangementContext.tsx` or any other file.
- A volume slider dragged to exactly 0 uses the short constant. This is accepted: arriving at silence fast is the mute intent.

Rationale for τ = 3 ms: in 1 ms the level drops 2.9 dB (a ramp, not a click), and from 0 dBFS it reaches −80 dBFS in 9.21·τ = 27.6 ms.

### 2.2 Doc

Create `docs/implementation/2026/quarter-IV/028-studio-lab-mute-declick.md` in Georgian, following `docs/implementation/TEMPLATE.md`. Cover:
- context (C-R21-01, with the numbers);
- the approach, including the rejected alternatives: a global τ change (zipper on volume drags) and a criterion-only change (keeps the 120 ms tail);
- the τ derivation;
- the changed files;
- the tests;
- the amended R3-V2 oracle (§4.1).

### 2.3 Tests (`app/lib/arrangement/__tests__/graph.test.ts`), written first

**Order:**
1. Write the new tests against the **unchanged** `graph.client.ts` and run `npx vitest run app/lib/arrangement/__tests__/graph.test.ts`. Paste which tests fail and why. The mute/unmute/seed cases must fail on the old 0.015 rule.
2. Then implement and re-run.

**Required:**
- `FakeParam.setTargetAtTime` records `timeConstant` as well. Update the existing `setTrackGain ramps…` expectation to include it. It goes 0.8 → 0.5 and expects **0.015**.
- An audible track goes 0.8 → 0 (mute) and expects **0.003**. Then 0 → 0.8 (unmute), also **0.003**.
- **Seeding:**
  - a track constructed **muted** (initial 0) whose first `setTrackGain(…, 0.8)` expects **0.003**;
  - a track constructed audible at 0.8 whose first `setTrackGain(…, 0.6)` expects **0.015**;
  - a track silenced by **another track's solo** at construction (initial 0), unsolo → **0.003**.
- **Per-track independence:** muting `sfx` does not change the constant chosen next for `music` (nonzero → nonzero stays 0.015).
- A same-target re-send (0.8 → 0.8) expects 0.015, and (0 → 0) expects 0.003, with no throw.
- No source restarts: every source still has exactly 1 `start` after all of the above.
- The existing `renderArrangementWav` static test stays green. Add one static assertion that the `renderArrangementWav` slice does not contain `setTrackGain`.

No test may be deleted or weakened.

### 2.4 After the code

- Self-check (edge cases: unknown track id, a value of exactly 0, repeated calls).
- `npx biome check --write` **only** on your 2 code/test files, then a read-only `npx biome check ./app`.
- Three files changed, so run the `code-reviewer` agent and report its findings and your dispositions.
- Run the §5 commands.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx,library-preview.test.tsx,detail-panel-polish.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..027}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen** and stays byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/graph.client.ts` | A | §2.1 only: one constant, the seeded last-target map, and the `setTrackGain` body |
| `app/lib/arrangement/__tests__/graph.test.ts` | A | §2.3: `FakeParam` records `timeConstant`, the updated expectation, new tests |
| `docs/implementation/2026/quarter-IV/028-studio-lab-mute-declick.md` | A | new doc (§2.2) |
| `../tmp/studio-real-loop/a-round-22.md`, `a-round-22/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-22.md`, `c-round-22.json`, `c-round-22/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

**Expected `git status --short` at the end: 45 lines.** These are the 42 baseline lines plus exactly:

```
 M app/lib/arrangement/__tests__/graph.test.ts
 M app/lib/arrangement/graph.client.ts
?? docs/implementation/2026/quarter-IV/028-studio-lab-mute-declick.md
```

### 3.3 Frozen this round

**All 49 files in `b-round-21-tree-sha256.txt`, and everything else under `store/`**, including:
- `ArrangementContext.tsx`, `schedule.ts`, `model.ts`;
- `ArrangementVideoDock.tsx`, `video-sync.ts`;
- all components, docs 015–027, `app/types/*` and `components/ui/Modal.tsx`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting round-6..21 work; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

Viewport 1440×900.

**Harness rules:**
- "Real click" means `$B click` at the element centre, and keys mean real `$B press`.
- `$B type` goes only into an **enabled, focused** input.
- Use the round-21 R3-V2 harness (`rv2b.sh`, `scripts/rv2.js`; the M label is `Mute — ვიდეოს ორიგინალი ხმა`) plus a read-only spy on `AudioParam.prototype.setTargetAtTime` that logs `(target, startTime, timeConstant)` and the timeline position.
- No source instrumentation.

**Setup.** Use the round-21 R3-V2 layout: imported `beeps-6s-vp9-opus.webm` at 0–6.008 (beeps at k..k+0.1 s, k = 0..5), music at 7, Play from 0. Beep windows are [k + 0.005, k + 0.095]. Record the clip table. If the demo differs, adapt the numbers, keep the assertion type and every level, and write down the mapping.

**Anchor.** `t_m` is the timeline time of the `setTargetAtTime` call with target 0 and τ 0.003 issued by the mute toggle (`pos = from + (startTime − startAt)`). `t_u` is the same for the unmute call (target > 0). Anchoring on the spied call, not on the click, takes click latency out of the verdict.

### 4.1 R22-M1 — mute reaches silence within the transition window (C-R21-01; amended R3-V2 mute oracle)

**Transition window: W = 35 ms.** Derivation: the worst case is 0 dBFS → −80 dBFS, which takes 80 / 8.686 · τ = 27.6 ms at τ = 3 ms, plus one 128-frame render quantum (2.7 ms). That is 30.3 ms, rounded up to 35. If the measured pre-mute level differs, C may recompute W from the same formula and must report it. The −80 dBFS level does not change.

**Oracle:** every beep window that starts ≥ t_m + W, while muted, has master RMS **< −80 dBFS**. Windows that start inside [t_m, t_m + W) are reported for information only.

**Required runs (2 valid executions, plus at most 2 replacements for runs the environment made invalid; name the cause):**
- **Repro run:** the mute lands **40–100 ms before a beep onset**, as in round 21's V2_2/V2_4. That beep's window must be < −80 dBFS. Round 21 measured −52.3 and −86.3 here; this is the C-R21-01 check.
- **Full run:** like V2_5, a mute, then an unmute that lands before a later beep; covers R22-V below.

The spy must show the mute call with **τ = 0.003** in both runs.

### 4.2 R22-M2 — the mute is a ramp, not a hard cut

Mute the **music** track during sustained music (music at 0–16, video lane empty or muted; mute at about 3 s). Take the master in 0.5 ms RMS blocks.
- **Ramp exists:** the time from the first block ≥ 3 dB below the pre-mute level (L0, the RMS of the 10 ms before t_m) to the first block ≥ 23 dB below L0 is **≥ 3 ms**. A pure τ = 3 ms exponential takes ≈ 6.9 ms; a hard cut takes < 1 ms.
- **Silent fast:** every block starting ≥ t_m + 35 ms is < −80 dBFS while muted.

One valid execution.

### 4.3 R22-V — the rest of R3-V2 (unchanged text, `tasks/round-2.md` l.319–321)

In the R22-M1 runs:
- `video.paused === false` throughout, and `video.muted === true` on both `<video>` elements on every frame;
- source counters unchanged by the toggles (+0 start / +0 stop);
- audible within **100 ms** of unmute: the first beep window that starts ≥ t_u + 100 ms is within 1 dB of its unmuted level. Also report the click-anchored latency as round 21 did;
- **Solo on music** silences the video beeps (< −80 in windows ≥ W after the solo's target-0 call on the video gain). The video does not stop.
- Dock counters before and after (expected 0 → 0).

### 4.4 Adjacent regressions

- **R22-A1, volume keeps its smoothing.** During playback, change the music track's volume between two non-zero values (real keys on the focused slider, or a synthetic drag; say which). Every spied call with a non-zero previous and non-zero new target has **τ = 0.015**. Check by ear-free measurement: no block-to-block step larger than the target change.
- **R22-A2, audio-track mute/solo.** Music M on/off and S on/off during playback: the target-0 and from-0 calls have τ 0.003, there are no source restarts, and History gets the same entries as before (mixer entries, unchanged behaviour).
- **R22-A3, Play start unchanged.** A fresh Play with the video lane already muted: the video beeps are < −80 from the first beep (gain constructed at 0; no ramp is needed). Unmute then gives τ 0.003.

### 4.5 R22-S, R22-U and R22-Doc

**R22-S (static, read-only):** `git diff -- app/lib/arrangement/graph.client.ts` touches only:
- the new constant;
- the last-target map (declaration, seed at construction);
- the `setTrackGain` body.

`renderArrangementWav`, `appendPlan`, `stop`, `disconnect` and the construction values are unchanged. No `setValueAtTime`, `cancelScheduledValues` or `linearRampToValueAtTime`. No exported API change.

**R22-U:**
- `graph.test.ts` contains the §2.3 cases and is green;
- A's report shows the red-first run, and the failing cases are the mute/unmute/seed ones;
- C runs one **mutation check**: in a scratch copy outside `store/` (or by reasoning on the diff, if a copy cannot run), setting `MUTE_TIME_CONSTANT` back to 0.015 makes at least the mute, unmute and seed tests fail. Report how it was done.

**R22-Doc:** doc 028 exists and is in Georgian. It states the τ derivation, the rejected alternatives and the amended oracle, and it matches the code.

### 4.6 Gates

- **G22-1:**
  - tsc 0;
  - vitest ≥ **1004** with 0 failures (999 plus at least 5 new tests). If the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both runs;
  - the build passes;
  - Biome 0 errors on `./app` (read-only).
- **G22-2:**
  - protected hashes 4/4 OK;
  - `sha256sum -c b-round-21-tree-sha256.txt` gives **49 OK**;
  - `git status --short` shows the 42 baseline lines plus exactly the 3 lines in §3.2 (45 lines);
  - `Header.tsx` is identical to HEAD;
  - nothing else under `store/` changed.
- **G22-3:** anonymous `/studio-lab`, opened directly and via the header link:
  - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
  - media only from the 2 demo MP3s and `blob:`;
  - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
  - `/studio/middle-east` shows "Sign in required".

  These are known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts` (a Vite module, not an R2 host).
- **Real export sanity:** one real `WAV-ის ექსპორტი` of the demo through the dialog. Report the frames, duration, NaN count and the full-scale sample count. The oracle is internal consistency: duration = projectEnd shown in the dialog, NaN 0, a valid header. With an unchanged demo, the expected values are 864 000 frames = 18.000 s, as in rounds 16–20. The R13-M4 hard-clip is a known carry.

**Not re-run this round** (no dock, scheduler or transport change; G22-2 proves it): RF5-3, R3-V1, R3-V4, R5-L3, R11-P3 sync. They are not PASS for round 22. Their latest evidence is round 21.

### 4.7 Carried, honest (not PASS, not new bugs unless they change)

Root (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything;
- the uncommitted round-6..22 tree;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4, A round-19 deviation 5 and C round-21's own stuck python probe (pid 1045, killed by C);
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push).

Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

Tech Lead manual checks: R23-1/2, R12-L4 (real drag), RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, Lenis `/studio/*`, the positive MP4/MOV import path, and **R22-T: the mute/unmute click-freeness by ear in real Chrome with headphones**.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-21-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/graph.test.ts
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
git status --short
git diff --stat -- app/lib/arrangement/graph.client.ts app/lib/arrangement/__tests__/graph.test.ts
git diff --stat cc1e531 -- app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A may use the browser (`a-browse.json`) for one smoke check: mute and unmute of the video lane during playback on `/studio-lab`, with no console error. This is not a PASS claim.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-22.md`:**
1. the pre-flight gate;
2. the red-first test output, then the green output;
3. the diff summary (graph.client.ts lines touched);
4. the code-reviewer findings and your dispositions;
5. the verbatim command tails;
6. deviations.

Do not claim PASS.

**C → `c-round-22.md` and `c-round-22.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (budget, with the reason);
- the t_m/t_u anchors and the spied τ values;
- the W used (35 ms or the recomputed value);
- the setup mapping;
- the gates;
- carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 23:** A round-11 follow-ups, part 1, in `ArrangementLane.tsx`: `aria-controls` on the lane fold button, `ring-inset` on the track name, the silent fold refusal during a gesture (it gets a status reason), plus the `ArrangementLane.tsx:661` reason text. This is three related lane-header items plus a comment-only line.
- **Round 24:** part 2 (`StudioWorkspace.tsx`): Home on separators must not trigger the global seek, and the panel found via `nextElementSibling` becomes an explicit reference.
- **Then:**
  - SRW-13 (FB-04 clip gain, FB-05 pan, FB-14 master volume/mute and the overload indicator; the R13-M4 hard-clip; M1/L8 if still open). It may split into stages;
  - SRW-14 (FB-13 grid/snap/free) → SRW-15 (FB-09/FB-11 bars/beats, metronome, grid tempo, never audio stretch) → SRW-16 (FB-10 markers);
  - SRW-17 (FB-12 track groups);
  - SRW-18 (FB-06 fades and the volume envelope) → SRW-19 (FB-07 video opacity fade);
  - SRW-20 (range export, MP3).
- **Then** the SRW-21 adapter contract (the route mount needs Tech Lead or auth-owner permission), then T12.
- **Loop runner:** if `run-loop.ps1` was restarted with a tight `-RoundLimit` for round 21, raise it again to dispatch round 22 (`-StartRound 22 -StartPhase A`).
