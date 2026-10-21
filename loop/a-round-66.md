# A round 66 — SRW-15 stage 2 (FB-09): metronome (D-29z31)

Implementer: A (Claude Opus 5.5) · 2026-10-20 · **Not a PASS claim.** C verifies.

## 1. Pre-flight gate, baseline and red run

**Pre-flight gate (posted on resume):**
- **Assumptions.**
  - The task means exactly §0.1/§0.3: a pure metronome module, an additive graph, and enumerated edits in the context, the tempo row and the workspace.
  - The metronome is live-only, through the master. The export is untouched.
  - The previous attempt (2026-10-19, it stopped at the session limit) left partial work. I continue it and do not rewrite it.
- **Smallest version.** About 160 inserted source lines across 4 existing files (0 deletions), plus the 73-line `metronome.ts`.
- **Files.** Only the 8 paths in §3.1. Each is required by §0.3, §2.2 or §2.5.
- **Success.** `npx tsc --noEmit` 0; vitest 93/1626; build 0; Biome owned 0 / `./app` ≤ 4/218/1; mutations a–p each kill their named tests; `npm run verify` 0.

**Required reading.** Done this session in full:
- `.claude/rules/read-primitives.md`;
- the 9 primitives named in §1;
- `prompts/studio-feature.md` and `prompts/new-test.md`;
- `docs/implementation/TEMPLATE.md`;
- the `web-audio-api` and `pre-flight` skills.

The project hook also injected REACT_CONTEXT, FORWARDREF_COMPONENT, DESIGN_TOKENS, TAILWIND_FIRST, AUDIO_ARCHITECTURE, AGENT_DISCOVERABLE_CODE and GEORGIAN_DOCS before the edits. `studio-specialist` was not consulted (optional).

**Resume state.** This is attempt 2. Attempt 1 ended with "weekly limit" (`a-round-66-result.json`, `.attempt1.json`). When attempt 2 started:
- HEAD was `3e55c5c`;
- `git status` showed ` M graph.client.ts`, ` M ArrangementContext.tsx`, `?? metronome.ts` and the two test files;
- the frozen list was 426/426 OK.

I inspected the partial diff and kept it. Attempt 1 wrote the baseline (`a-round-66/biome-baseline.txt`: 4/218/1) and the red run.
- `ArrangementTempoRow.tsx` and `StudioWorkspace.tsx` were clean at HEAD `3e55c5c`, which is the exact tree B snapshotted with an empty status. So both started at the snapshot.
- `graph.client.ts` and `ArrangementContext.tsx` already had attempt 1's edits. I inspected and kept them.
- The click-buffer cache: the only place `audioContextRef.current` is reset is the unmount cleanup (`ArrangementContext.tsx` l.2615). The cache is reset next to it (l.2619), so there is no second reset point to cover.

**Red run** (`a-round-66/red-run.txt`, attempt 1, 2026-10-19 17:49, before `metronome.ts` existed): **both files failed**, `Failed to resolve import "../metronome"`, 2 failed suites, no tests ran.
- **Honesty note.** I cannot prove that attempt 1 left the test files unchanged between its red run and the session end.
- In attempt 2 I changed the test files in exactly two ways:
  - (a) a Biome formatting wrap of the `<ArrangementProvider …>` JSX in `metronome-ui.test.tsx`;
  - (b) assertions added to M10, M11 and UI10 after the code review (§6). No `it` was added or removed.

**Servers at start:** `/studio-lab` 200, `:5199/api/products` 200, `node.exe` 7.

## 2. Diff summary (all LF: CRLF 0)

`git diff --stat`: 4 files, **159 insertions, 0 deletions**.

| File | Change | LF lines |
|---|---|---|
| `app/lib/arrangement/metronome.ts` (new) | constants, `MetronomeClick`, `planMetronomeClicks`, `generateMetronomeClickSamples`, `metronomeStatusMessage`, the two titles; imports only `./model`, `./tempo` | 73 |
| `app/lib/arrangement/graph.client.ts` | `import type { MetronomeClick }`; `ApplyScheduleOptions.metronome?`; `ScheduleHandle.appendClicks`; `ScheduledClickState`; metronome gain only when `options.metronome` → `master`; click sources in their own list with `onended`; `appendClicks` prunes ended clicks and is a no-op after `disconnect` or without a metronome; `stop(when)` loop over clicks with the same `when`; `disconnect` covers clicks + gain. `renderArrangementWav`, `measureExportOverload`, `ScheduleAudioContext` unchanged | 373 |
| `app/contexts/ArrangementContext.tsx` | (1) import; (2) `metronomeBpmRef` and `metronomeBuffersRef`; (3) `startGraph` lazily creates the click buffers (`new AudioBuffer` + `copyToChannel`) only when the BPM is non-null, and passes `metronome` with clicks to `loop ? loop.end : projectEnd(arrangement)`; (4) `fillLoopIterations` → `appendClicks(planMetronomeClicks(bpm, timing.from, timing.until), timing.from, timing.startAt)`; (5) `setMetronomeBpm` (non-finite/≤0 → null; same value → no-op; playing → `syncPlayback(present, undefined, true)`); (6) in the value and the deps; (7) cache reset on unmount | 2906 |
| `app/components/arrangement/ArrangementTempoRow.tsx` | props `metronomeOn`, `onMetronomeToggle`; the button after `4/4` (`h-4`, Snap's pressed tokens `border-accent bg-accent/20 text-accent`, `disabled:` tokens); import. `gap-1.5` **unchanged** (the smoke showed no clipping) | 185 |
| `app/components/arrangement/StudioWorkspace.tsx` | (1) `metronomeOn` state; (2) `toggleMetronome`; (3) `changeTempo(null)` → `setMetronomeOn(false)`; (4) one `useEffect` → `workspaceRef.current.setMetronomeBpm(...)`; (5) the two props; (6) import | 1852 |
| `__tests__/metronome.test.ts` (new) | M1–M11 | 358+ |
| `__tests__/metronome-ui.test.tsx` (new) | UI1–UI10 | 468+ |
| `docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md` (new) | doc 059 | — |

## 3. Tests (run alone, `a-round-66/alone-owned-test.txt`, verbose)

| ID | Result | ms |
|---|---|---|
| M1 120 BPM | ✓ | 2 |
| M2 index (`toBe`) | ✓ | 2 |
| M3 window | ✓ | 1 |
| M4 EPS start | ✓ | 0 |
| M5 truncation | ✓ | 0 |
| M6 empty | ✓ | 0 |
| M7 samples | ✓ | 2 |
| M8 messages | ✓ | 0 |
| M9 routing | ✓ | 3 |
| M10 append/stop/prune/disconnect | ✓ | 1 |
| M11 no metronome | ✓ | 0 |
| UI1 | ✓ | 130 |
| UI2 | ✓ | 87 |
| UI3 | ✓ | 62 |
| UI4 | ✓ | 46 |
| UI5 | ✓ | 53 |
| UI6 | ✓ | 58 |
| UI7 | ✓ | 47 |
| UI8 | ✓ | 50 |
| UI9 | ✓ | 47 |
| UI10 | ✓ | 42 |

No single test is over 3 s.

## 4. Mutations (scratch `a-round-66/scratch/`, `node_modules` junction, own vitest config; `mut.mjs`)

`a-round-66/mutations.txt` holds run 1 followed by run 2 under a dated header. The copies are `mutations-run1.txt` and `mutations-run2.txt`. The command runs the 8 files of §2.3 with `--reporter=verbose`. Unmutated: 8 files / 121 passed. All five owned source files were restored (`restored=true`, both runs).

| # | Mutation | Killed (failing tests) |
|---|---|---|
| a | accent on every beat | M1, M2, M3, M4, M5, M9 |
| b | `time += 60 / bpm` | M2 |
| c | `time >= from` (no EPS) | M4 |
| d | no truncation at `until` | M5 |
| e | metronome gain → `destination` | M9 |
| f | clicks → first track gain | M9 |
| g | clicks pushed into `sources` | M10 |
| h | metronome gain always created | M11 + 2 frozen `graph.test.ts` |
| i | `setMetronomeBpm` never resyncs | UI3, UI4, UI5 |
| j | clearing the tempo keeps it on | UI6 |
| k | eager click buffers in `ensureAudioContext` | **frozen** `master-ui` ×3, `render-budget` ×4 (`copyToChannel` missing on the frozen fakes) |
| l | loop refill without `appendClicks` | UI7 |
| m | toggle never disabled | UI1, UI6 |
| n | toggle writes no status | UI2, UI3 |
| o1 | export gets an extra click-buffer map key | UI9 |
| o2 | export gets a third argument | UI9 |
| p1 | clicks `stop()` immediately (ignore `when`) | M10 |
| p2 | clicks skipped by `stop(when)` | M10 |
| q (extra) | `when = time` (no clamp) | M4 |
| r (extra) | resync without `force` | UI3, UI4, UI5 |
| s (extra) | accent on `k % 4 === 1` | M1, M2, M3, M4, M9 |
| t (extra, run 2) | `appendClicks` does not prune ended clicks | M10 (strengthened after review) |
| u (extra, run 2) | Space keyup not `preventDefault`ed (StudioWorkspace) | UI10 (strengthened after review) |

Run 2 re-ran g, h, p1 and p2 with the strengthened tests; all were still killed. **No survivors.**

## 5. Browser smoke (gstack; not a PASS claim). Evidence: `a-round-66/smoke.txt`, `smoke-1440-on.png`, `smoke-1280-on.png`

- **Daemon:**
  - The gstack CLI daemon failed once (`Server failed to start within 15s`).
  - It left one `server-node.mjs` (PID 21088) that my own call had launched. I checked its command line and state file (my round folder), then stopped it.
  - I started my own fallback `server-node.mjs`: `BROWSE_PARENT_PID=0`, state `a-round-66/a-browse.json`, log `a-round-66/daemon.log`, PID 2224.
  - `browse chain` printed nothing on this host (`smoke-1440.txt` is that empty file), so I ran the commands one by one (`smoke.txt`).
  - At the end `browse stop` exited, PID 2224 is gone, the state file was removed and `node.exe` is 7. I killed nothing else and did no `$B restart`.
- **Steps:** at each viewport, a fresh `/studio-lab` → wait for the toggle + 4 s → measure → click the BPM field, type `40`, Enter → measure → click the toggle → measure → screenshot.

| Viewport | State | disabled / pressed | btn.right ≤ cell.right | cell scrollW = clientW | chrome h | page scrollW |
|---|---|---|---|---|---|---|
| 1440×900 | no BPM | true / false, title `მეტრონომი — ჯერ მიუთითე BPM` | 496.73 ≤ 512 ✓ | 223 = 223 ✓ | 64 | 1440 |
| 1440×900 | BPM 40 | false / false, enabled title verbatim | ✓ | ✓ | 64 | 1440 |
| 1440×900 | on | false / **true**, status = `metronomeStatusMessage(40)` verbatim | ✓ | ✓ | 64 | 1440 |
| 1280×720 | no BPM / BPM 40 / on | same as 1440 | 496.73 ≤ 512 ✓ | 223 = 223 ✓ | 64 | 1280 |

- The button is 16 px tall in a 20 px cell. No `gap-1` change was made (§2.4 rule not triggered).
- Console: only the known root `GET /api/cart` CORS error. The network log has no `r2.cloudflarestorage`, `r2.dev`, `r2-proxy`, `workers.dev`, `studio-token`, `recording-` or `/api/download` request (grep count 0).
- **Not run by A:** any audio or meter row (MT-BEATS, MT-EXPORT, …). These belong to C.

## 6. Code review (real `code-reviewer` subagent, read-only; score 8.5/10; no Critical/High)

| # | Finding | Disposition |
|---|---|---|
| 1 Medium | UI10 cannot fail on "does not toggle": jsdom never turns a keyup into a click | **Fixed:** UI10 now asserts that `fireEvent.keyDown` and `fireEvent.keyUp` on the button return `false` (default prevented). Mutation u kills it. |
| 2 Med/Low | M10 never exercises the `appendClicks` pruning | **Fixed:** after `onended`, `appendClicks([], 2, 20)`. It asserts that the source count is unchanged, the ended click is disconnected and the others are not. Mutation t kills it. |
| 3 Low | UI7 covers only `from === loop.start` (mid-loop start not tested) | **Open → B** (a new `it` would change the 1626 count; §2.3 says no tests outside the list). Production uses `loopIterationTiming` (`from: loop.start` for iteration ≥ 1). |
| 4 Low | M11 does not pin down panners and master outputs | **Fixed in M11:** panner count = tracks and `master.outputs` = `[destination]`. |
| 5 Low | Scrub re-plans every click up to `projectEnd` (×N per scrub) | **Open → B / C:** add the scrub case to METRONOME-UPFRONT-NODES / MT-PERF-INFO. |
| 6 Low | No guard if the `AudioBuffer` constructor throws (old browsers) | **Open → B (Lows).** Not changed: a silent fallback would hide a failure. The constructor is supported in current Chrome/Firefox/Safari. |
| 7 Low | `h-4` button below the WCAG 2.5.8 24 px target (row is 20 px) | **Open → Lows batch** (same as ROOT-R65-L2 for the BPM input). |
| 8 Low (latent) | No `setMetronomeBpm(null)` cleanup on workspace unmount | **Open → info:** the provider and the workspace share one lifetime today. |

**Architecture notes (proposals for B/root, not done):**
- **ARCH-A-R66-PREFS-AUDIO.** A component-local listening preference (`metronomeOn` + `tempoBpm` in StudioWorkspace) now drives audio state in the context through one effect. **Keep** this round. Fold it into ARCH-CHECKPOINT-SRW14-PREFS (a): a small hook if another such preference arrives.
- **ARCH-A-R66-STOP-LOOP-DUP.** `stop()` repeats the same loop over `sources` and `clickSources`. **Keep:** existing members had to stay unchanged. A shared `stopScheduledStates(states, when)` helper would fit when the region is next unfrozen.

## 7. Commands and tails (store/, attempt 2)

- `npx tsc --noEmit; echo rc=$?` → `rc=0`.
- `npx vitest run` → `Test Files 93 passed (93)`, `Tests 1626 passed (1626)`, rc 0 (`a-round-66/vitest-full.txt`, before the review edits). Then `npm run verify` (final, after the review edits) → **rc 0**, `Test Files 93 passed (93)`, `Tests 1626 passed (1626)`, two builds `✓ built in 7.31s` / `2.25s` (`a-round-66/verify-final.txt`). An earlier verify run before the review edits was also rc 0 (`verify.txt`). No `Test timed out`.
- `npm run build` → rc 0 (`build.txt`).
- `npx biome check <7 owned files>` → `Checked 7 files … No fixes applied.`, rc 0, **0 diagnostics** (`biome-owned.txt`).
- `npx biome check ./app` → **4 errors / 218 warnings / 1 info** = baseline (`biome-app.txt`).
- End state (`a-round-66/end-state.txt`): HEAD `3e55c5c8bb67e50be303a8e180a0559df953c3fd`; `git status --short` = the **8 expected lines**; frozen list **0 not OK (426/426)**; protected **4/4 OK**; `node.exe` **7**; `/studio-lab` 200, backend 200.
- No commit, push, install, `--write`, deletion or server start/stop.

## 8. Deviations

1. **`planMetronomeClicks` also returns `[]` for a non-finite `from`/`until`.** The spec names only `bpm` and `until ≤ from`. Without this guard, `until = Infinity` would loop forever. No oracle row changes.
2. **The loop starts at `k = max(0, floor(from·bpm/60) − 1)`**, not at 0. It skips beats long before the window, but every `time` is still `(k * 60) / bpm` from the index (M2 `toBe` holds; mutation b is killed).
3. **`generateMetronomeClickSamples` returns `Float32Array<ArrayBuffer>`**, needed for lib.dom's `copyToChannel` signature.
4. **`setMetronomeBpm` deps `[syncPlayback]`.** This is the same pattern as 3 other callbacks in the file. `render-budget.test.tsx` is green unchanged.
5. **The red run comes from attempt 1** (see §1). Test edits since then: one formatting change and stronger assertions after the review.
6. **Browse state is under `a-round-66/a-browse.json`**, not `tmp/studio-real-loop/a-browse.json`. It is in my own round folder and satisfies both instructions.

## 9. Scope completed and next C checks

**Done (A side, unverified by C):**
- §0.3 source changes;
- §2.2 tests (11 + 10);
- §2.3 mutations a–p (+ q, r, s, t, u);
- §2.4 gates and smoke;
- §2.5 doc 059.

**No §4 acceptance row is claimed PASS.**

**Exact next C checks:**
- G66-2, R66-S (`diff -u` against the snapshots: additive only), R66-U (own scratch: red run + mutations a–p), G66-1.
- §4.6, hardest on:
  - **MT-BEATS** (40 BPM, 9 rises, accents at 0/6/12 ≥ 4 dB);
  - **MT-EXPORT** (byte-identical WAVs off vs on; zeros before frame 192000);
  - **MT-MASTER**, MT-LOOP, MT-LIVE-TOGGLE, MT-KEYS*, MT-LAYOUT* (A's smoke measured the cell only).
- Add the scrub case to MT-PERF-INFO (review #5).
- §4.7 regressions, G66-3.

**Known gaps:** review items 3, 5, 6, 7 and 8 above. Real audio was not observed by A.
