# C round 214 — PERF-1b-i interaction baselines + harness hygiene — **PASS**

Verifier: C. Source read-only. Evidence folder: `c-round-214/` (tools, out, shots).

## SCOPE-214 start + static review
- SCOPE-214 start: HEAD `fe556fd`; `git status` = 5 M (the grants) + 3 ?? (the new files); `sha256sum -c --quiet b-round-213-r214-tree-sha256.txt` rc 0; grant start copies verify (`sha256sum -c` OK x5). Grant diffs vs `b-round-213/r214-granted-start/`:
  - `perf/studio-lab.perf.spec.ts`: only S3 (`expectedReactMajor`, `reactRendererProblem`, `reactRenderer` field/assignment/report field), S6 (`playPress`, `idleEnd`, `played` snapshot, `harness.audio-running` = running && starts ≥ 1 with detail), S4 (`waitForTimeout(2000)` in `selectClipGainMembers` replaced by `toHaveCount(2)` on `arrangement-clip-waveform`). The Add-window `waitForTimeout(2000)` (now l.653) is unchanged.
  - `perf/lib/instrumentation.ts`: +11 lines, renderer `version` recorded in `inject` with an `in`/`typeof` guard, `rendererVersions()` reader. Nothing else.
  - `perf/budgets.json`: only the `harness.audio-running` `note`.
  - doc 163: l.67 + one pointer sentence appended to l.152.
  - doc 167: l.4, l.23, l.102, l.108, l.110 only.
- AN-REVIEW greps: no `any`, no type assertion, no `@ts-*`, no lint suppression in the added lines (the only ` as ` hits in the PERF-1a spec are pre-existing accessible-name strings "set as the active track").
- `git grep -n antialiased docs/`: no hit (rc 1).
- Doc 168: all 86 cited `interact.*` ids exist in `perf/budgets.interactions.json` except 7 wildcard family references (`interact.click.*`, `interact.zoom.1.*`, …) which are patterns, not row claims. Source line references in §"PERF candidates" checked: `ArrangementClip.tsx:687/503/634/674`, `ArrangementContext.tsx:1572/1588/739` all point at the quoted calls.
- Deviation source check: `ArrangementLane.tsx` l.1016–1026 renders `data-range-start/end` only under `range?.allTracks` — A's claim confirmed. `ArrangementDetailPanel.tsx` ~l.705: the Clip Gain fader enable state (`isClipGainFaderEnabled`) is selection-driven; the row notes describe both substitutes.


## PERF-RUN-214 run 1 (`npm run test:perf`, both specs) — done
- Exit 0, `2 passed (13.6m)` (`c-round-214/out/perf-both.log`). Copies: `out/run1-interactions.json`, `out/run1-perf1a.json`.
- New spec: `harness` PERF-1b-i, `complete` true, `failures []`, `durationMs` 327,728 (5.46 min ≤ 12 min), `reactRenderer` 18.3.1, `innerWidths` [1440], 6 passes, 0 aborts, 0 page errors. 144/144 rows have 3 samples; all 17 asserts pass. All 122 deterministic medians equal A's `final-run-1.json` and `final-run-2.json`.
- PERF-1a: `harness` PERF-1a, `complete`, `failures []`, `durationMs` 477,799, `reactRenderer` 18.3.1, 316 rows × 3, 92 asserts all pass. C's own comparison (`out/perf1a-cmp-c.txt`): 0 of 167 deterministic medians differ from `a-round-212/perf-run-1.json`. `harness.audio-running` detail `contextRunning true, starts 1` ×3.

## PERF-RUN-214 run 2 (new spec alone) — done
- Exit 0, `1 passed (5.5m)` (`out/perf-new-alone.log`, `out/run2-interactions.json`). `complete`, `failures []`, `durationMs` 317,214, `reactRenderer` 18.3.1, 144/144 rows × 3.
- Run 1 vs run 2 (`out/run1-vs-run2.txt`): 0 count-median differences. Wall-clock rows are within trend noise (e.g. 1× move-to-paint p95 4.8–9.6 ms; 6× 38–62 ms).
- `test-results/perf/latest.json` (harness PERF-1a) and `latest-interactions.json` (PERF-1b-i) are separate files. Run 2 (new spec alone, started ~00:03:23) did not touch `latest.json`: mtime 00:02:52 (end of run 1) and `cmp` with `out/run1-perf1a.json` is byte-identical.

## PROBE-214 — done (prod `remix-serve` on :5189, 1440×900, C's own counter)
- C's counter (`tools/probe214.cjs`) is independent of `perf/lib/instrumentation.ts`: full fiber walk; a component fiber counts when it is a fresh object in the committed tree vs the previous commit AND (PerformedWork or a new mount). Own `AudioBufferSourceNode.start` hook and capture-phase pointer listeners. 60 steps (30+30), +120 px.
- range body, stopped ×3: **101.283** components/move (A 101.283; 0 % diff), 1.983 commits/move, per-commit histogram 59×98 + 59×5. Range label `00:06.275 – 00:07.775` at mid-drag → `… – 00:09.275` at end; `[data-range-start]` count 0 throughout (confirms A's deviation premise and that the label substitute is live).
- fade-in, stopped ×3: **96.367** (A 96.367; 0 %), 0.983 commits/move (A's 1× row says 1.000; window-edge difference of one commit, C's window starts after the first in-page move), fade 0 → 1.500 → 3.000.
- playing (`Pause` label, context `running`) ×3 each: restarts per move **0** for range and fade; at release range 0, fade 1 — equal to A's rows.

## REDPROOF-214 — done
C's own mutants on a scratch copy `/tmp/c214-scratch/store` (store tree untouched; frozen rc 0 at the end):
| Mutant | Change | Result |
|---|---|---|
| C1 (liveness of the deviated range signal) | new spec: `rangeLabelEnd` regex made unmatchable | exit 1. Asserts fail only on `interact.harness.drag-range-live` and `.6x` (median 0 [0,0,0]); their per-pass problem lines "interact.drag.range.{stopped,playing} … drag did not change its target" (12). No other row (`out/mutant-C1C2.{diff,log,json}`) |
| C2 (S3, same run) | `instrumentation.ts`: the `rendererVersions.push` line removed (no renderer recorded) | "no React renderer was injected into the devtools hook" in all 6 passes; report `reactRenderer` = "" |
| C3 (impossible assert) | `PERF_BUDGETS_INTERACTIONS=/tmp/c214-m3-budgets.json`: `interact.drag.range.stopped.move-components-per-move` turned into `assert <= 3` | exit 1, the only failure: `assert failed interact.drag.range.stopped.move-components-per-move: measured median 101.283 [101.283, 101.283, 101.283], budget <= 3`; `budgetsFile` points at the override (`out/mutant-C3.*`) |
A's M1–M4 logs checked (`a-round-214/mutant-*`): M1 fails `drag-fade-live` (+ `.6x`) with "row not measured 3 times" on the stopped-fade rows (consequence of the dead drag); M2 fails `harness.audio-running` (and `harness.restart-live`, which also counts `start()`) and `interact.harness.audio-running`; M3 shows "React renderer major is not 18: 17.0.2" in both reports; M4 fails `interact.harness.clips-30` only.

## HYGIENE-214 — PASS
- S3: `reactRendererProblem` returns a problem for an empty list and for any major ≠ "18"; pushed into `problems` → `failures` in both specs (proved red by A M3 and C C2).
- S6: `harness.audio-running` = `running` (Pause label + tracked context `running`) **and** `played.starts.length >= 1` over `[playPress, idleEnd]` (proved red by A M2). New spec has `interact.harness.audio-running` with the same rule.
- S4: `selectClipGainMembers` has no `waitForTimeout`; it waits for 2 clips and 2 `arrangement-clip-waveform`. The Add-window `waitForTimeout(2000)` (l.653, `harness.hook-live` window) is unchanged per ruling.

## AN-REVIEW-214 — PASS
- No `any`, no type assertion, no `@ts-*`, no suppressions in added lines; semicolons present (Biome formatter clean).
- `npm run typecheck` rc 0 (`out/typecheck.log`).
- `npx biome check perf/` with the repo config is **vacuous** ("These paths were provided but ignored": `biome.json` includes only `app/**`) — same as A found. Substitute: a clean copy of `perf/` in `/tmp/c214-biome` with `files.includes: ["perf/**"]`: `Checked 7 files … No fixes applied`, rc 0, no diagnostics (`out/biome-perf-scratch.log`).

## DOC-214 — PASS
- Doc 168: template sections present (კონტექსტი, მიდგომა, არქიტექტურა, მეტრიკები, შედეგები, PERF candidates, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, TODO); l.4 `In Progress (C round 214 check pending)`; reset method and the row table with A's numbers; §"PERF candidates" with one line per scenario and file:line preview paths (verified). Every exact cited row id exists (79/79; the 7 others are `.*` family patterns).
- Doc 167: l.4 new status, `anti-aliased`; `git grep -n antialiased docs/` → no hit. Doc 163: l.67 + one pointer sentence.

## G214-3 (auth guard, browser) — PASS
Fresh contexts, no credentials (`out/g214-3.json`, shots `g214-3-*`): `/studio-lab` opens at 1440×900 and 1280×720 with "Demo collection — no sign-in required", `auth_user` null, 0 cookies. `/studio/middle-east` at both viewports: "Sign in required", no workspace, 0 `audio[src]`. `/api/studio-token?product=middle-east&file=stem1.wav`: no header → **401**; fake Bearer → **500** "Unable to prepare Studio access" (the :5199 mock is not running: curl 000 — allowed by the task). No token, no Set-Cookie, 0 forbidden requests, 0 page errors.

## STUDIO-SMOKE-214 (browser) — PASS at both viewports
`/studio-lab` anonymous, Add the demo clip, real-mouse drag of `arrangement-clip-fade-in-handle` +40 px, Ctrl+Z (`out/smoke-{1440,1280}.json`, shots `smoke-*`): fade-in 0.000 → 1.000 (live during the drag, Undo title unchanged during the drag) → Undo title `Undo: Fade In` (one entry) → after Ctrl+Z fade 0.000, start/width unchanged, Undo back to `Undo: Add — …`, Redo `Redo: Fade In`. 0 page errors, 0 non-environment console errors.

## SCOPE-214 end — PASS
HEAD `fe556fd`; same 5 M + 3 ??; frozen list rc 0; granted files' mtimes all predate C's phase (none changed during verification); hashes in `out/scope-end.txt`.

## Verdict table
| Row | Result |
|---|---|
| SCOPE-214 | PASS |
| PERF-RUN-214 | PASS |
| PROBE-214 | PASS (0 % diff vs A for range and fade; 0 restarts per move while playing) |
| REDPROOF-214 | PASS |
| HYGIENE-214 | PASS |
| DOC-214 | PASS |
| AN-REVIEW-214 | PASS (Biome via scratch config; repo-config run is vacuous) |
| G214-3 | PASS |
| STUDIO-SMOKE-214 | PASS |
| full vitest / build / Biome full / verify / e2e smoke | gate (not claimed) |

**CZABA requirement (SABA-B-5 "measure the other continuous drags"):** met for range, fade-in, trim start and clip move (stopped and playing), with a measured candidate list in doc 168. Trim/move release restarts with 30 clips are not measured (doc marks them as inference). **Ableton conformance:** not applicable (performance harness).

## For B (no bugs; rulings needed)
1. **A-R214-DEV-RANGE-LIVE (needs B ruling, L10):** the task's `[data-range-end]` liveness signal is impossible for a clip-body range (source `ArrangementLane.tsx` l.1016 renders it only for `allTracks`; C's probe saw 0 `[data-range-start]` while the range label moved 07.775 → 09.275). A's substitute (the clip's range label end must exist at mid and end and grow) is live and red-provable (C1). C recommends accepting it.
2. **A-R214-DEV-CLICK-LIVE (minor):** the Clip Gain fader is always rendered; A uses enabled/disabled as the selection signal. Reasonable; B to note.
3. **A-R214-DEV-AUDIO-RUNNING-1X (minor):** `interact.harness.audio-running` is 1×-only (no `.6x` row), although §2.3 measures step 5 at both rates. At 6× a non-running play still pushes a failure (`play: audio not running …`), so liveness is enforced; B to confirm the 1×-only row id.
4. **C-R214-BIOME-PERF-VACUOUS (info, pre-existing since rounds 206/208):** `npx biome check perf/` processes nothing under the repo `biome.json`; task acceptance "clean" can only be shown with a scratch config. Future tasks should say so, or a config change should be proposed to root (`biome.json` is protected).
5. Evidence for the round-216 ruling: C's independent counter confirms the range drag re-renders ~98 components per move (2 commits/move: 98 + 5) and fade 98 per move; fade with 30 clips restarts 30 sources at release (spec rows, both runs).
