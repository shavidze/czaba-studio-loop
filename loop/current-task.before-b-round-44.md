# CURRENT TASK — Round 44: SRW-13 stage 4c — context hygiene in `ArrangementContext.tsx` (dead transport latch, the position-store error text, and a Volume preview that changes nothing does not render)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-15
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic-commit authorisation 2026-10-13; behavioural reverse-engineering 2026-10-14).
- Decision record: **D-29z9** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-43.md`.
- Round size: **two Low items and one info item, all in one file** (`ArrangementContext.tsx`), as planned in the `plan.md` round table (round 44 = stage 4c). No new feature, no UI change, no model change.

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` returned **200** at B's gates (2026-10-15 12:06). If it is down when A or C starts, root restarts it. No agent starts or stops it.
>
> **Machine load:** `node.exe` was **15** at B's gates (32–48 during round 43). Every A and C run records `tasklist | grep -ci node.exe`. On a timeout under load, re-run that file alone and report both runs.
>
> **Browse rule (updated from C round 43, ENV-BROWSE-DAEMON):**
> - **Never use `$B restart`.** Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - **Approved fallback (new):** if a CLI-spawned daemon dies or fails to start **once**, you may launch the gstack `browse/dist/server-node.mjs` yourself as your own background process with `BROWSE_PARENT_PID=0`, a fresh state file and a log file in your round folder. This is what worked for C in round 43. Record the exact command, PID and log path. Do not kill processes you did not start (e.g. a foreign `server-node.mjs`).
> - Use CDP `Page.captureScreenshot` for screenshots inside a short time window. A Playwright screenshot took 2–4 s under playback load in round 43.

## Why this round

**Round 43 result** (`c-round-43.md`, `c-round-43.json`): **C PASS on every contracted ID**:
- G43-1: tsc 0, vitest **76 files / 1341**, build, `npm run verify` exit 0, Biome only the 2 baseline CRLF errors.
- G43-2 and G43-3: anonymous `/studio-lab` works directly and via the header link. Token, recording, download and R2 requests are 0; Authorization headers are 0. The anonymous token call → 401, a fake Bearer → 500 with no token, and `/studio/middle-east` → "Sign in required".
- R43-S, R43-HT (real playback at 1440 and 1280: the Master hold tick is fully inside the meter at ≥ +6 dB and unchanged within 0.061 px at ≤ +5 dB), R43-U (mutations a–e; C independently confirmed A's A-R38 equivalence argument), R43-REG and R43-Doc.

**Closed by C evidence:** MASTER-HOLD-TICK-EDGE, A-R38-TEST-ORDER, A-R37-TEST-HARDENING. A-R38-TEST-ORDER closes as equivalence confirmed: the S1–S5 pins are contract pins and do not detect the order (doc 040).

**Root commit:** round 43 is `2c0f800` (`fix(studio): keep master peak marker inside meter`). B verified **both** master remotes at `2c0f800` with `git ls-remote` at 12:06. `publication-checkpoint.json` now has `round42Checkpoint` (`b6a96f8`) but no `round43Checkpoint` yet; root records it.

**B dispositions this planning (D-29z9, no code; rationale in `b-round-43.md` §3):**
- **TASK-R43-HTZERO → closed (task wording).** Under L43 the demo video's own audio adds to the SFX hit. At Master 0 dB the max hold is +3.4, not ≈ 0.0. **Standing harness rule:** any meter fixture that expects ≈ 0 dBFS uses **video Mute on** (REAL click; 1 entry).
- **A-R43-EXACT-5DB → accepted.** At exactly +5.0 dB both branches meet every §0.1 rule of round 43:
  - unclamped centre 78.79 px vs clamped 79 px: Δ 0.21 ≤ 0.5;
  - both inside the box;
  - C saw the 0.21 px step as allowed (`c-round-43.md` §8).
- **A-R43-REVIEW-W66 → accepted with a watch condition.** The +5 dB threshold is monotonic only while the meter is at least 66 px wide. The meter is `w-20` (80 px) and frozen. Any future task that changes the Master meter width must re-measure R43-HT.
- **A-R43-REVIEW-ROOTFONT → accepted (info).** The guarantee holds at the Store's 16 px root font. Browser zoom scales px and rem alike. Only a user root-font override differs, and that is recorded in doc 040.
- **ROOT-ROUND42-CHECKPOINT-RECORD → closed** (`publication-checkpoint.json` `round42Checkpoint`). New root item: **ROOT-ROUND43-CHECKPOINT-RECORD**.

**So this round is stage 4c**, the next code stage in the plan:

| ID | Severity | Today (source read, HEAD `2c0f800`) |
|---|---|---|
| **R9-REVIEWER-M1** (part of R9-REVIEWER-M1-L8) | Low | `transportRunningRef` (l.532) is written by `markTransportRunning` (l.564–566), which is called at l.757 (`stopPlayback`), l.836–838 (`pumpPlaybackAudio`) and l.1032 (`play`). **Its only reader is the guard at l.836**, and that guard only decides whether to call `markTransportRunning(true)` again. Nothing acts on the value; the round-9 reviewer called it "a latch nothing acts on". |
| **R9-REVIEWER-L8** (part of R9-REVIEWER-M1-L8) | Low | `useArrangementPositionStore` (l.2795–2801) throws `'useArrangementPosition must be used within an ArrangementProvider'`. That text names a different hook. No test in `app/lib` pins any `must be used within` text (B grep). |
| **PREVIEW-VOLUME-IDENTITY** | info | `previewTrackVolume` (l.2068–2085) always does `updateHistory` + `syncPlayback`, even when the value does not change. `setTrackMix` (`model.ts` l.439) always returns a new object. A double-click on a Volume already at 100 % (`resetTrackVolume`, Lane l.342–345) costs one provider render and one `syncPlayback` and writes 0 entries. `previewMasterGain` (l.2316–2336) already returns early when `setMasterMix` returns the same object (l.2326). |

## Baseline

B verified on 2026-10-15 12:06 (`b-round-43/gates.txt`):
- HEAD **`2c0f800`** on both master remotes. `git status --short` is **empty**.
- Round-43 files at HEAD equal C's shas: `ArrangementMaster.tsx` `849e6b40`, `fader-guards.test.tsx` `f60b34d9`, `master-hold-tick.test.tsx` `93eb697a`, `fader-focus-order.test.tsx` `113d74b4`, doc 040 `f91ab6cb`.
- **Frozen list:** `../tmp/studio-real-loop/b-round-43-tree-sha256.txt` → **391 OK**. That is the round-42 list of 387, minus `ArrangementContext.tsx` (opened this round), plus the 5 round-43 files. Run it from `store/`.
- Protected files 4/4 OK. tsc **0** (`b-round-43/tsc.txt`). vitest **76 files / 1341 passed** (`b-round-43/vitest.txt`, node.exe 15). Dev server `/studio-lab` 200.
- Biome `./app` (C round 43): **2 errors**, both the root CRLF `format` errors on `app/lib/auth.ts` and `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`. **Do not touch them.** Also 218 warnings and 1 info. Your files must add 0 errors and 0 warnings.
- **Dispatch snapshot** (`../tmp/studio-real-loop/b-round-43-snapshots/`, `SHA256SUMS.txt` inside): `ArrangementContext.tsx` **`91fa12d6`** = HEAD.
- **Before you edit:** confirm that HEAD is `2c0f800`, or a newer root commit that leaves the snapshot file unchanged and the 391 list OK. If anything differs, **stop and report**.
- Do not touch new untracked paths; record any you see. `.kilo/` shows only as ignored.

**Rules:**
- Do not revert, re-create or reformat anything.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 R9-REVIEWER-M1 — remove the dead transport latch (no behaviour change)

**Chosen form: removal** (B, D-29z9). A rename would keep code that nothing reads; the smallest honest change is to delete it.
- Delete `transportRunningRef` and `markTransportRunning`, their three call sites, and the `markTransportRunning` entries in the `useCallback` dependency arrays of `stopPlayback`, `pumpPlaybackAudio` and `play`.
- In `pumpPlaybackAudio`, everything else stays as it is and in the same order: the `isPlayingRef` return, `fillLoopIterations()` → `resyncLoopRef.current()`, and `releaseRetiredGraphs(false)`. If removing the guard leaves `const ctx` unused, remove that line too.
- `anchorRef.current.holdUntil` and its other uses (e.g. l.647) are unchanged.
- **Stop condition:** if `grep -rn "transportRunning\|markTransportRunning" app/` finds any reader outside `ArrangementContext.tsx`, or a reader inside it other than the l.836 guard, **stop and report**.
- No test can catch re-adding dead code, and none is required. The acceptance is: grep finds 0 matches; the full suite passes, including `render-budget` (R9-L2, "keeps the context value … when the start hold releases"); and C's transport checks in the browser pass (§4.3).

### 0.2 R9-REVIEWER-L8 — the error text names the right hook

- `useArrangementPositionStore` throws `'useArrangementPositionStore must be used within an ArrangementProvider'`.
- Nothing else changes. `useArrangementPosition` and `useArrangementPositionWriter` delegate to it and keep doing so; their error then names the store hook, which is the hook that actually failed.
- The other `must be used within` texts in the file are already correct and are unchanged.

### 0.3 PREVIEW-VOLUME-IDENTITY — a no-change Volume preview does nothing

**Contract:** `previewTrackVolume(trackId, volume)` returns without `updateHistory` and without `syncPlayback` when the call would not change the stored arrangement. That is, when either:
- the track `trackId` does not exist in `historyRef.current.present`, or
- its stored `volume` already equals the **clamped** value (`[0, 1]`, the same clamp `setTrackMix` applies; compare the result, not the raw argument).

**Placement mirrors `previewMasterGain`:**
1. the gesture refusal check (unchanged);
2. `flushPendingMaster()` when no Volume preview is pending (unchanged; it still runs before the identity check, as `flushPendingVolume` does in `previewMasterGain`);
3. **the identity check (new);**
4. only then set `volumeBeforeRef` (if unset), `updateHistory` and `syncPlayback`.

**Form:** inside `ArrangementContext.tsx` only. `model.ts` is **frozen**: `setTrackMix` is also used by the Mute toggle (l.2048), and B does not open the model for an info item. A may compare the target track's `volume` in `setTrackMix(...)`'s result with the stored one. A may also read the stored track and compare it with a clamped value. No new export, no new helper file.

**Must not change:**
- a value-changing preview still updates the value, `syncPlayback`s and, on commit, writes exactly one `Volume` entry;
- a preview that returns to the same value **while a preview is already pending** keeps the original `before` snapshot, so the later commit still writes one entry relative to the value before the gesture (or 0 if the net change is zero, as today via `commitHistory`);
- `commitTrackVolume`, `revertTrackVolumePreview`, `flushPendingVolume`, the gesture refusal and the key/drag paths;
- `previewMasterGain`, Pan and Clip Gain.

### 0.4 Unchanged / out of this round

**Unchanged:**
- every other function in `ArrangementContext.tsx`, the context value shape and every exported name and type;
- `model.ts`, `ArrangementLane.tsx`, `ArrangementMaster.tsx`, `useRelativeFaderDrag.ts`, `StudioWorkspace.tsx`;
- every existing test file, and docs 001–040.

**Out of this round** (queued, not deferred scope):
- **round 45 — polish:** SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, and the doc notes DOC035-NOTES, DOC034-UNREACHABLE-NOTE, DOC036-R37-TAIL, DOC036-ROUND-REF, DOC015-DELETE-GAP-NOTE (split if over the round size);
- **then:** SRW-14 stage 1 (FB-13 grid model, Snap on/off, divisions; clip move first) → SRW-15 (FB-09/FB-11; never audio stretch) → SRW-16 (FB-10) → SRW-17 (FB-12) → SRW-18 (FB-06) → SRW-19 (FB-07) → SRW-20, R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, the SRW-21 adapter, the full regression and the root check; then T12;
- **waiting for the Tech Lead:** C-R41-01 (TL-Q-VIEWPORT), C-R23-01/C-R38-01, C-R27-01, and the manual checks.

**Out of scope for the whole project:** plugins and effects (including compressor, limiter and normalise), pitch, multiple video layers, and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected (C checks):**
- play, stop, resume, play to the end, loop playback and seek (the pump loses a guard);
- the meters while playing (the pump drives the loop and graph release, not the meters, but C confirms);
- Volume double-click reset, drag and keys; Mute (another `setTrackMix` caller, unchanged); Master;
- the frozen suites `render-budget`, `ArrangementContext.test.ts`, `clip-gain`, `pending-status`, `master-ui`, `fader-click`, `fader-guards`, `fader-focus-order`, `gesture-guard`, `track-pan`, `meter-ui`, `track-meter-ui`.

## 1. Mandatory before acting (A)

1. **Read the rules and primitives in full, before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `ERROR_TAXONOMY.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/new-test.md`, `prompts/new-context.md` and `prompts/studio-feature.md`; `docs/implementation/TEMPLATE.md`;
   - then run the `pre-flight` skill.
2. **Check the baseline and report it before any edit:**
   - HEAD and `git status --short`;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-43-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - the snapshot sha;
   - protected 4/4;
   - `node.exe`.
3. **Read:**
   - `ArrangementContext.tsx` l.520–600, l.740–850 (stop, meters, pump, tick), l.925–975 (flush, `applyEdit`), l.1000–1060 (`play`), l.2040–2185 (Mute, Volume preview/commit/begin/blur), l.2316–2340 (`previewMasterGain`), l.2785–2840 (the store hooks);
   - `model.ts` l.430–475;
   - `ArrangementLane.tsx` l.320–345 and l.670–690 (double-click reset);
   - `master-ui.test.tsx`: the `renderLog` harness (l.29 ff.) and l.600–640 (a render-count pin);
   - `render-budget.test.tsx`: the R9-L2 test;
   - `a-round-9.md` §7 (M1, L8); `checkpoint-r38-review.md` #6.
4. **Re-check (report each):**
   - `grep -rn "transportRunning\|markTransportRunning" app/` (stop condition in §0.1);
   - `grep -rn "must be used within" app/lib app/components` (no existing test pins the L8 text; if one does, **stop and report**);
   - `grep -rn "setTrackMix\|previewTrackVolume" app/ --include=*.ts --include=*.tsx`: list every caller and confirm none depends on the extra render or `syncPlayback` of a no-change preview;
   - `npx biome check app/contexts/ArrangementContext.tsx` before and after: no new diagnostic. Run "before" **before** the first edit (in round 43 this step was skipped).
5. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 `ArrangementContext.tsx`

The diff is limited to §0.1, §0.2 and §0.3.

**Rules:**
- No comments, no new exports, no `any`, no type assertions, no `@ts-ignore`. Semicolons.
- Nothing else in the file changes. No reformatting, no reordering of unrelated hooks.

### 2.2 Doc 041 (new)

`docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md` (Georgian, technical terms in English):
- თარიღი, სტატუსი (`Round 44 — D-29z9; C-ის შემოწმებას ელოდება`), შეცვლილი პროექტი;
- კონტექსტი: the three items with today's code paths (the table above), and the round-43 dispositions in one short paragraph;
- მიდგომა: why removal rather than rename (no reader). Reconcile explicitly with the round-9 record (`a-round-9.md` §7: "reviewer #2 later confirmed the ref works as a latch and is not dead"): say what read the ref in round 9 (if anything outside its own guard) and what reads it at `2c0f800`, with line references, so C can verify the "no reader" claim beyond the grep; the L8 text; the identity check, its placement relative to the flush (mirrors `previewMasterGain`), the clamp, and why `model.ts` stays unchanged;
- შეცვლილი ფაილები (no code fragments);
- პრობლემები და გადაწყვეტები (Problem → Solution);
- ტესტირება: red/green per case, the C IDs;
- the Ableton table (§4.8);
- TODO: round 45 (polish), then SRW-14 stage 1.

### 2.3 Tests (in `store/`)

**New file `app/lib/arrangement/__tests__/context-hygiene.test.tsx`.**
- Copy the provider/fixture set-up and the `renderLog` render-count harness you need from `master-ui.test.tsx`, `pending-status.test.tsx` or `clip-gain.test.tsx`. **Copy; do not import from another test file.**
- The render count is a count of **provider-consumer renders** (a consumer of `useArrangement` inside the provider) between two points. State in the `describe` title that it counts React renders, not audio.

| ID | Case | Expected | Snapshot |
|---|---|---|---|
| PV1 | Music track at its stored `volume` 1 → `previewTrackVolume('music', 1)` | 0 consumer renders; `undoLabel` and `past.length` unchanged | **red** |
| PV2 | Same track at 1 → `previewTrackVolume('music', 1.5)` (clamps to 1) | 0 renders, value 1, no entry | **red** |
| PV3 | `previewTrackVolume('no-such-track', 0.5)` | 0 renders, no entry | **red** |
| PV4 | UI: the music Volume fader at 100 % → `fireEvent.doubleClick` (the Lane reset path) | 0 consumer renders, 0 entries, value 1 | **red** (renders), entries 0 on both |
| PV5 | Off-default round trip: preview 0.72 → commit → **one** `Volume` entry; double-click reset → value 1 and **one more** `Volume` entry; undo → 0.72 | as stated | green |
| PV6 | Pending preview kept: preview 0.72 (no commit) → preview 0.72 again → commit | exactly **one** `Volume` entry; undo returns to the value before the first preview | green |
| PV7 | Flush order parity: a pending Master preview (`previewMasterGain(-3)`, no commit) → `previewTrackVolume('music', 1)` at 1 (no change) | the Master entry is flushed exactly once (`Master Volume` in the undo chain), the same as on the snapshot | green |
| PV8 | Return to the start while pending: preview 0.72 (no commit) → preview 1 (the value before the first preview) → commit | value 1, **0** entries (the net change is zero), no blocked status | green |
| L8a | Render a component that calls `useArrangementPositionStore()` **outside** a provider | throws `useArrangementPositionStore must be used within an ArrangementProvider` (spy and restore `console.error`) | **red** |
| L8b | The same for `useArrangement()` outside a provider | throws `useArrangement must be used within an ArrangementProvider` | green (must-not pin) |

**Red/green runs:**
- Write the tests first. Run them against the **snapshot** `ArrangementContext.tsx` (`b-round-43-snapshots/`, applied in a scratch copy outside `store/`, or the untouched working copy before your first edit). PV1–PV4 (render part) and L8a must be red; the others green → `a-round-44/red-run.txt`. Report the failure texts.
- Then the green run → `a-round-44/green-run.txt`.
- **A's own mutations (scratch copy outside `store/`)** → `a-round-44/mutations.txt`:
  - (b) the identity check moved **before** `flushPendingMaster()` → PV7 must fail;
  - (c) the identity check compares the **raw** argument instead of the clamped value → PV2 must fail;
  - (d) the L8 text reverted → L8a must fail.
  - (e) the identity check also returns when the new value equals the pending `before` volume → PV8 must fail.
  If a mutation survives, strengthen the test (never the code) and report it.

**Rules:**
- no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards only), no comments;
- exact strings come from the rendered DOM, the thrown error or exported constants;
- no snapshot tests; no fake timers unless the copied harness already uses them.

### 2.4 After the code

- **Self-check:** run the frozen suites of §4.7 and the full `npx vitest run` (1341 plus your new `it` count).
- **Biome:**
  - run `npx biome check --write` **only** on `ArrangementContext.tsx` and the new test;
  - then a read-only `npx biome check ./app`: exactly the 2 baseline CRLF errors and ≤ 218 warnings.
- **Review:** run the `code-reviewer` agent on the diff. Report its findings and your dispositions.
- **Browser smoke** (A; one run if the server and daemon are up; a fresh state file under `a-round-44/`; not a PASS claim): REAL Space play from 0 → stop after about 3 s → REAL Space resume → stop. Record that the position resumes from the stop point and the console has no error.
- **Mutations:** only in a scratch copy outside `store/`. If you link `node_modules` into the scratch copy with a directory junction, remove it with `cmd /c rmdir` only (never `rm -rf`).
- **`/check`:** run `npm run verify`. Do not run `npm run test:e2e:smoke`: it starts its own dev server.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

HEAD `2c0f800` with an empty `git status`, or a newer root commit that leaves the snapshot file unchanged and the 391 list OK.

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/contexts/ArrangementContext.tsx` | A | §0.1–§0.3 only |
| `app/lib/arrangement/__tests__/context-hygiene.test.tsx` | A | new (§2.3) |
| `docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md` | A | new (§2.2) |
| `../tmp/studio-real-loop/a-round-44.md`, `a-round-44/` | A | report and gate output |
| `../tmp/studio-real-loop/c-round-44.md`, `c-round-44.json`, `c-round-44/` | C | report, runs, shots, gates |
| fresh browse state files and daemon logs in the own round folder | A / C | browse state |

- `a-round-43/`, `c-round-43/` and `b-round-43/` are read-only.
- **Expected `git status --short` at the end:**
  - ` M app/contexts/ArrangementContext.tsx`
  - `?? app/lib/arrangement/__tests__/context-hygiene.test.tsx`
  - `?? docs/implementation/2026/quarter-IV/041-studio-lab-context-hygiene.md`

  Nothing else. If root changes something meanwhile, record it as foreign and do not touch it.

### 3.3 Frozen this round

- All **391** files in `b-round-43-tree-sha256.txt`, and everything else under `store/`.
- This includes: `model.ts`, `ArrangementLane.tsx`, `ArrangementMaster.tsx`, `ArrangementTrackMeter.tsx`, `meter.ts`, `useRelativeFaderDrag.ts`, `ArrangementDetailPanel.tsx`, `StudioWorkspace.tsx`; every existing test; docs 001–040.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**`;
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`, the playwright configs, `../backend/**`;
- env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
- the other roles' files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, fresh load (`viewport`, then `goto`, then the setup chain). **Layout L44** = L43: the demo video at 0; `სრული მიქსი` on music at 7; `Soft impact` on SFX at 4. Master at 0 dB.

**Harness rules:**
- **REAL** = `$B click` at the element centre, `$B press` or `$B type`.
- **SYNTHETIC** (label it): `PointerEvent` dispatch with an explicit `pointerId` (C uses **41**), `dblclick` dispatch (headless cannot do a real double-click), `.blur()`, `.focus()`, a native value setter + `input`/`change`.
- C may read state through the existing `window.__c` reader (undo labels, positions, stored values) and read the meter attributes. Label it. No source instrumentation. Mutations run only in a scratch copy outside `store/`.
- Meter fixtures that expect ≈ 0 dBFS use **video Mute on** (TASK-R43-HTZERO).
- No `$B restart`; fresh state files; the approved daemon fallback in the header.
- Every run and gate records `node.exe`.

**Checkpoint order if the session may end:** G44-2 → R44-S → R44-U → R44-TR → R44-REG → the rest. Write `c-round-44/checkpoint.md` as you go.

### 4.1 R44-S — static (read-only)

- `diff -u ../tmp/studio-real-loop/b-round-43-snapshots/ArrangementContext.tsx app/contexts/ArrangementContext.tsx` shows only:
  - the removal of `transportRunningRef`, `markTransportRunning`, its three call sites and its dependency entries (and `const ctx` in the pump if it became unused);
  - the L8 text;
  - the identity return in `previewTrackVolume`, placed after the `flushPendingMaster` block and before `volumeBeforeRef` is set.
- `grep -rn "transportRunning\|markTransportRunning" app/` → 0.
- 391 OK.
- No `any`, `@ts-ignore`, type assertion, `//` comment, hardcoded colour or new export in the diff or the new test.

### 4.2 R44-U — unit tests and mutations

- The new tests are green. A's red run matches §2.3 (PV1–PV4 render pins and L8a red on the snapshot; the others green), or A explains each difference with the failure text.
- The frozen suites of §4.7 are green.
- **Mutations** (scratch copy outside `store/`; each must make a test fail):

| # | Mutation | Must be caught by |
|---|---|---|
| (a) | The snapshot `ArrangementContext.tsx` | PV1, PV2, PV3, PV4 (renders), L8a |
| (b) | The identity check before `flushPendingMaster()` | PV7 |
| (c) | The identity check compares the raw argument (no clamp) | PV2 |
| (d) | The L8 text reverted | L8a |
| (e) | The identity check also returns early when a preview is pending and the new value equals the volume stored in `volumeBeforeRef` (so the present stays at the preview value) | PV8 (if it survives: C-R44-xx, Low test gap) |
| (f) | `previewTrackVolume` never short-circuits for a missing track | PV3 |

### 4.3 R44-TR — transport after the latch removal (REAL)

| ID | Steps | Expected |
|---|---|---|
| TR-PLAY | REAL Space from 0 → about 3 s → REAL Space → REAL Space → about 2 s → REAL Space | the playhead advances; after the first stop the position holds; the resume starts at the stop point (± 0.1 s, `window.__c` reader); the Master meter moves while playing and floors on stop |
| TR-END | Move the playhead (ruler click) to about 1 s before the project end → REAL Space | playback stops at the end with the round-26 end behaviour; REAL Space again starts from 0 |
| TR-LOOP | Select a time range of about 2 s (e.g. 8–10 s) with the existing range selection used in earlier rounds (label REAL or SYNTHETIC) → REAL click on the transport **`↻ Loop`** button (`ArrangementTransport.tsx` l.153; title "Loop მონიშნულ მონაკვეთზე (Ctrl/Cmd+L)"; or REAL Ctrl+L) → `aria-pressed=true` → REAL Space → about 7 s → REAL Space | at least 2 wraps (position samples fall back to the loop start); audio continues after each wrap (the Master meter `data-level-db` stays above the floor within 300 ms after the wrap); no console error |
| TR-SEEK | During playback, REAL click on the ruler at about 10 s | playback continues from about 10 s; no console error |
| TR-PREVIEW | Library preview of `Soft impact` → REAL Space on the arrangement | the preview stops and arrangement playback starts (unchanged behaviour) |

Not a sync measurement. Video sync and C-R27-01 are not re-measured this round.

### 4.4 R44-REG — regression (REAL where possible)

| ID | Expected |
|---|---|
| REG-VOL-DBL | Music Volume at 100 %: SYNTHETIC `dblclick` → value 100 %, **0** entries, status unchanged. SYNTHETIC drag (pointerId 41) to about 72 % → **1** `Volume` entry; SYNTHETIC `dblclick` → 100 %, **1** more entry; REAL Ctrl+Z → about 72 % |
| REG-VOL-PLAY | The same `dblclick` at 100 % **during playback** → no audible or metered change (the music track meter keeps its level pattern), 0 entries |
| REG-VOL-KEY | REAL ArrowLeft/ArrowRight on the music Volume → one entry per key (FADER-KEY-ENTRIES) |
| REG-MUTE | REAL click on the music Mute → 1 entry `Mute — მუსიკა`; during playback the music track meter drops to the floor; REAL click again → it returns |
| REG-MASTER | Master at 0 dB: SYNTHETIC `dblclick` → 0 entries; REAL ArrowLeft/ArrowRight → one `Master Volume` entry per key |
| REG-DEL | SFX clip selected, focus on the music Volume: REAL Delete/Backspace keep the clip with 0 entries (C-R31-02); after a REAL click on an empty lane area and the clip, REAL Delete removes it with one entry |

### 4.5 R44-Doc

Doc 041 exists, follows `TEMPLATE.md`, is in Georgian, matches the code (removal, the L8 text, the identity check placement and clamp) and has the §4.8 table.

### 4.6 Gates

**G44-1:** tsc 0; vitest = 1341 + the new `it` count, 0 failures (record `node.exe`; re-run a timed-out file alone and report both runs); the build passes; Biome `./app` read-only: exactly the 2 baseline CRLF errors, 0 in Studio files, warnings ≤ 218, plus 1 info.

**G44-2:** protected 4/4 OK; `sha256sum -c b-round-43-tree-sha256.txt` → 391 OK; `git status --short` = §3.2; HEAD at the start and at the end.

**G44-3:** anonymous `/studio-lab`, opened directly and via the header link, in a **fresh** browse state:
- no request to `/api/studio-token`, `/api/recording-*` or `/api/download`, no R2 host, and no `Authorization` header from workspace code;
- media is only the 2 demo MP3s and `blob:`;
- an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
- `/studio/middle-east` shows "Sign in required".

Known and allowed: the root `CartContext` `GET /api/cart`, the root GA consent-denied events, GTM, the dev-module requests, the homepage hero image from `images.unsplash.com`, Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`).

**Not re-run this round** (not PASS): exports and WAV integrity; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; the detail-panel geometry.

### 4.7 Frozen suites (A self-check, C G44-1)

`context-hygiene`, `render-budget`, `ArrangementContext.test.ts`, `clip-gain`, `pending-status`, `master-ui`, `meter-ui`, `track-meter-ui`, `fader-click`, `fader-guards`, `fader-focus-order`, `gesture-guard`, `track-pan`, `pan-release-recovery`, `master-hold-tick`.

### 4.8 Ableton source and compliance (workflow addendum 2026-10-11)

No Live behaviour is copied. No new browsing and no video.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A transport-internal flag that nothing reads is removed | none | **Not applicable** (CZABA scheduler internals; never presented as Live's implementation) | D-29z9 §0.1 | R44-S, R44-TR |
| The position-store hook error names the right hook | none | **Not applicable** (developer error text) | D-29z9 §0.2 | R44-U |
| A Volume double-click at the default writes nothing and does no work | none | **Not applicable** (CZABA render budget; the 0-entry behaviour is unchanged since round 38) | D-29z9 §0.3 | R44-U, R44-REG |

C gives two verdicts per row. Never write "Ableton does it this way" for a not-applicable row.

### 4.9 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - **C-R41-01** (Low, 1024×768, TL-Q-VIEWPORT; not re-run);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead). Record the NUL count and offsets from `curl -s http://127.0.0.1:5173/studio-lab` and the hydrated U+FFFD `aria-label`s. Round 43: 64 312 bytes, **3 NUL** at 11729, 28025, 28026; **1** U+FFFD label (library collapse).
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1 (D-29z8); A-R43-EXACT-5DB, A-R43-REVIEW-W66 (watch: Master meter width), A-R43-REVIEW-ROOTFONT (D-29z9). **To the Tech Lead:** A-R33-REVIEW-TOUCH (with R38-T).
- **Open Low items:** R26-M1; SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, the DOC034/035/036/015 notes (round 45); A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS; DETAIL-RESET-SHRINK (info); ESC-DESELECT-NOTE (record).
- **Root items** (`root-pre-push-review.md` 2026-10-07: M1–M3, L1–L4 and L6–L8 **closed**, L5 accepted, nothing else open from it; `publication-checkpoint.json`):
  - ROOT-ROUND43-CHECKPOINT-RECORD (`2c0f800` is on both remotes; no `round43Checkpoint` entry yet). Round 44 becomes checkpoint-ready only after C PASS;
  - GSTACK-ACL; the ignored `.kilo/`; `npm run test:e2e:smoke` (root only); SRW-21 (the purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap; GA `scroll` with consent denied; fake Bearer → 500; the CDP allowlist; `Content-Type` without a charset;
  - dev-server availability; ENV-BROWSE-DAEMON (CLI daemons died idle in round 43; the approved fallback is in the header); machine load.
- **Tech Lead manual checks:** R23-1 (including the detail scroller), R23-2; R38-T (with A-R38-REVIEW-TOUCH and A-R33-REVIEW-TOUCH); R35-T, R30-T, R31-T, R33-T, R34-T; TL-Q-FB05-FB11, TL-Q-VIEWPORT.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-43-tree-sha256.txt | grep -vc ': OK$'
sha256sum app/contexts/ArrangementContext.tsx
grep -rn "transportRunning\|markTransportRunning" app/
npx vitest run app/lib/arrangement/__tests__/context-hygiene.test.tsx
npx vitest run app/lib/arrangement/__tests__/context-hygiene.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/clip-gain.test.tsx app/lib/arrangement/__tests__/pending-status.test.tsx app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/meter-ui.test.tsx app/lib/arrangement/__tests__/track-meter-ui.test.tsx app/lib/arrangement/__tests__/fader-click.test.tsx app/lib/arrangement/__tests__/fader-guards.test.tsx app/lib/arrangement/__tests__/fader-focus-order.test.tsx app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-pan.test.tsx app/lib/arrangement/__tests__/pan-release-recovery.test.tsx app/lib/arrangement/__tests__/master-hold-tick.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npm run verify
diff -u ../tmp/studio-real-loop/b-round-43-snapshots/ArrangementContext.tsx app/contexts/ArrangementContext.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest.
- Do not create test files other than the one named in §2.3.
- C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items (G44-1/2, R44-S, R44-U, R44-Doc). Use gstack `/browse` with a fresh state file under `c-round-44/` (fallback per the header).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-44.md`:**
1. the pre-flight gate, including the §1.4 re-checks;
2. the red run (per case), A's mutations (b)–(d), and the green run;
3. the diff summary;
4. the smoke result (if run);
5. the code-reviewer findings and your dispositions;
6. the verbatim command tails, including `node.exe`;
7. the deviations and the §2.4 self-check results.

Do not claim PASS. If you hit a stop condition, stop and report. Do not widen or narrow the change to avoid it.

**C → `c-round-44.md` and `c-round-44.json`** (the usual schema): for each ID, PASS, FAIL (with a bug ID) or **not run** (with the reason). Include:
- the R44-S diff verdict;
- the R44-U mutation table;
- R44-TR with the position samples and labelled REAL/SYNTHETIC steps;
- R44-REG;
- the Ableton two-verdict table (§4.8);
- the gates, the C-R23-01/C-R38-01 record and the carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 45 — polish:** SSR-LAYOUT-EFFECT-WARN (isomorphic alias pattern), EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, and the doc notes (split if over the round size).
- **Then SRW-14 stage 1 (FB-13):**
  - the grid model (`grid.ts`, a seconds grid without tempo);
  - Snap on/off with a visible state and a shortcut;
  - divisions;
  - applied to clip move first.

  Later stages cover trim, range, playhead, paste and clip-edge snap; then SRW-15 (bars/beats, project BPM as a grid only, a metronome that is not exported). B prepares the Ableton source table (Live 12 manual, grid/snap section, via gstack `/browse`) when it writes that task.
- **TL-Q-VIEWPORT / C-R41-01:** if the Tech Lead puts widths below 1280 in scope, it is scheduled next (candidate in `b-round-41.md` §4).
- **C-R23-01 / C-R38-01** as soon as the Tech Lead answers. **C-R27-01** when the quiet-Chrome result arrives.
- **A-R38-REVIEW-TOUCH / A-R33-REVIEW-TOUCH:** if R38-T confirms a touch problem, B schedules the pre-specified fix.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 44 -StartPhase A` and a higher limit.
