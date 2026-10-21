# A — Round 22: C-R21-01 — fast de-click mute (D-29m)

Implementer: A (Claude Opus 5.5) · 2026-10-11 · No commits, pushes, stash, installs or server start/stop. No PASS claimed; C verifies.

## 1. Pre-flight gate

- **Baseline check (before any edit):** `sha256sum -c b-round-21-tree-sha256.txt` → 49 OK. `git status --short` → 42 lines, `diff` against `c-round-21/gates/git-status-end.txt` → identical. HEAD `c5ed47b`. No differences.
- **Read:** `read-primitives.md`, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, AGENT_DISCOVERABLE_CODE, `prompts/studio-feature.md`, `skills/pre-flight`, `docs/implementation/TEMPLATE.md`, `c-round-21.md` §2.2 and §3, all of `graph.client.ts` and `graph.test.ts`, and the caller `ArrangementContext.tsx:674-676`.
- **Assumptions:**
  - Only the τ choice in `setTrackGain` changes. The last target is seeded with the same construction value written to `gain.value`.
  - `syncPlayback` re-sends every track, so same-target calls must stay harmless.
  - The existing `setTrackGain ramps…` test used `sfx`, which the fixture constructs muted (seed 0). Under the new rule that call is 0 → 0.5 → 0.003, but §2.3 says that test goes 0.8 → 0.5 and expects 0.015. I moved it to `music` (deviation 1).
- **Smallest version:** about 10 changed lines in `graph.client.ts`: one constant, a Map with its seed, and the `setTrackGain` body.
- **Files touched:** `graph.client.ts` (the fix), `graph.test.ts` (red-first tests), doc 028 (required doc).
- **Success:** `npx vitest run app/lib/arrangement/__tests__/graph.test.ts` is red on the old code for the mute/unmute/seed cases and green after the fix; tsc 0; full vitest 999 + N; build OK; Biome 0 errors; 45 status lines.

## 2. Red-first, then green

**Red** (new tests against the unchanged `graph.client.ts`; full output in `a-round-22/red.txt`): `Tests 5 failed | 14 passed (19)`.
- `× setTrackGain uses the short de-click constant for mute and unmute`: the mute and unmute got 0.015, expected 0.003.
- `× seeds the last target from construction: muted track unmutes with the short constant`: got 0.015.
- `× seeds a track silenced by another track solo so unsolo uses the short constant`: got 0.015.
- `× keeps the last target per track: muting sfx does not change music smoothing`: `expected [ 0.015, 0.015 ] to deeply equal [ 0.003, 0.003 ]`.
- `× same-target re-sends keep their class and never restart sources`: the 0 → 0 re-send got 0.015.

Of the 6 new `it` blocks, 5 failed and 1 passed: the audible seed 0.8 → 0.6, which expects 0.015. The two updated existing tests (the ramp test, now 0.8 → 0.5 on `music`, and the static render test) also passed on the old code.

**Green** (after the fix; `a-round-22/green.txt`, then `green-final.txt` after the reviewer fix): `Tests 19 passed (19)`.

**Mutation checks (A, on my own file).** I backed up `graph.client.ts`, mutated it, ran the test file, restored it and compared sha256: `RESTORED-IDENTICAL`.
- `MUTE_TIME_CONSTANT = 0.015` → 5 failed (the mute/unmute, both 0-seeds, per-track and re-send tests). Output: `a-round-22/mutation-mute-0015.txt`.
- `previous = trackGain.gain.value` (reading the param instead of the Map) → 1 failed (the mute/unmute test). Output: `a-round-22/mutation-param-value.txt`.

**New `it` blocks: 6.** Full vitest goes from 999 to **1005**. The other additions are not new tests: the static `not.toContain('setTrackGain')` assertion inside the existing render test, and the `timeConstant` field in the existing ramp test's expectation.

## 3. Diff summary

`git diff --stat`: `graph.client.ts | 15 +++-`, `graph.test.ts | 105 ++++++++++++++++++++++++++--`.

Changes in `graph.client.ts`:
- l.8: `const MUTE_TIME_CONSTANT = 0.003;`, not exported. `GAIN_TIME_CONSTANT` stays 0.015.
- l.75: `const lastGainTargets = new Map<string, number>();`.
- l.79-81: the construction value goes into the local `initialGain`, which is written to `trackGain.gain.value` and to `lastGainTargets.set(track.id, initialGain)`. The value expression is unchanged.
- l.166-175: the `setTrackGain` body:
  - an unknown id returns early;
  - `previous = lastGainTargets.get(trackId)`;
  - τ = `value === 0 || previous === 0 ? MUTE_TIME_CONSTANT : GAIN_TIME_CONSTANT`;
  - then `setTargetAtTime(value, ctx.currentTime, τ)`;
  - then the new target is stored.

Nothing else changed: `renderArrangementWav`, `appendPlan`, `stop`, `disconnect`, the exported types and `ScheduleHandle` are as before. There is no `setValueAtTime`, `cancelScheduledValues` or `linearRampToValueAtTime`.

Changes in `graph.test.ts`:
- `FakeParam` records `timeConstant`.
- New helper `gainOfTrack(ctx, bufferId)`.
- The ramp test now uses `music` (0.8 → 0.5, expects 0.015).
- 6 new `it` blocks.
- One static assertion in the render test.
- No test was deleted or weakened.

## 4. Code-reviewer (real `code-reviewer` subagent; score 9/10, no Critical or High)

| Finding | Disposition |
|---|---|
| Low: `FakeParam` sets `value = target` immediately, so a regression to reading `param.value` would pass every test | **Fixed.** The mute/unmute test now sets `musicGain.gain.value = 0.0001` (a mid-ramp value) before the unmute. The mutation check above shows this now fails on the `param.value` variant. |
| Low: doc 028 did not exist yet | The review ran in parallel with writing the doc. Doc 028 now exists. |
| Nit: the first step up from volume 0 (0 → 0.05) also uses τ 0.003 | Accepted. This follows the symmetric rule in §2.1. One line was added to doc 028 so that C does not apply the R22-A1 15 ms oracle to from-0 steps. |
| Nit: NaN and negative values | No action. The behaviour is the same as before: volume is clamped in `model.ts`, `-0 === 0`, and NaN throws in `setTargetAtTime` before the Map is updated. |
| Pre-decided mid-ramp re-send (0.8 → 0.8 at τ 0.015 after an unmute) | Not raised. The §2.1 disposition applies. |

The reviewer had no shell and could not run `git diff`. The diff in §3 above confirms the scope.

## 5. Command tails (verbatim; full output in `a-round-22/gates-final.txt`)

```
== sha256 baseline
49            (0 non-OK lines)
== tsc
tsc exit 0
== vitest
 Test Files  57 passed (57)
      Tests  1005 passed (1005)
== build
build/server/index.js                    1,281.33 kB
✓ built in 2.40s
== biome   (npx biome check ./app, read-only)
Checked 323 files in 529ms. No fixes applied.
Found 218 warnings.
Found 1 info.          (0 errors; exit 0 in the first run)
== git status --short | wc -l
45   (42 baseline + M graph.test.ts, M graph.client.ts, ?? 028-studio-lab-mute-declick.md)
== diff stat
 app/lib/arrangement/__tests__/graph.test.ts | 105 ++++++++++++++++++++++++++--
 app/lib/arrangement/graph.client.ts         |  15 +++-
== header
git diff --stat cc1e531 -- Header.tsx → 1 file changed, 21 insertions(+)   ; vs HEAD → empty
== protected
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
```

The `sfx-library.test.tsx` flake did not recur; both full runs passed 1005/1005. `npx biome check --write` ran only on my 2 code/test files.

## 6. Deviations

1. **The existing ramp test moved from `sfx` to `music`.** In the fixture `sfx` is constructed muted, so its seed is 0 and 0.8 → 0.5 is impossible on it. `music` (seed 0.8) gives the 0.8 → 0.5 / 0.015 that §2.3 asks for. The "no source restart" assertion is kept. The old sfx 0 → nonzero path is now covered, more strictly, by the muted-seed test (0.003).
2. **The browser smoke was not done.** It was optional and earns no PASS. All behaviour evidence for this round has to come from C's R22-M1..A3.
3. **Scratch files:** the backup copy used for the mutation check was deleted after the restore, which was hash-verified. Nothing under `store/` besides the 3 owned files changed.
4. **The mutation check changed `graph.client.ts` in place, so the dev server picked it up.**
   - The two `sed` mutations stayed on disk only for one `graph.test.ts` run each, a few seconds, around 06:49.
   - The shared dev server at 127.0.0.1:5173 watches that file, so Vite HMR may have briefly pushed the mutated module to an open `/studio-lab` tab.
   - The file was restored byte-identical (sha256 checked).
   - C's own R22-U mutation should use a scratch copy outside `store/`, as §4.5 says.
5. **Line endings:** `git ls-files --eol` shows `i/lf w/lf` for both owned files. The "LF will be replaced by CRLF" warning is only the autocrlf notice; Biome did not change any line endings.

## 7. Known gaps / carried items

- **Not verified by A:** the real-browser mute reaches −80 dBFS within W = 35 ms (R22-M1), the ramp shape (R22-M2), volume smoothing in the browser (R22-A1), audio-track M/S (R22-A2), and Play with the lane already muted (R22-A3). All of these are for C.
- **Tech Lead R22-T:** mute/unmute click-freeness by ear, in real Chrome with headphones.
- **Carried from root** (`root-pre-push-review.md` / `publication-checkpoint.json`, unchanged):
  - SRW-21: the purchased loader hardcodes middle-east;
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the R13-M4 export hard-clip;
  - the final commit/push only after everything, and the uncommitted round-6..22 tree;
  - the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - the two foreign agent files (not touched);
  - the fake Bearer gets 500;
  - the CDP allowlist;
  - the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push).

## 8. Exact next checks for C

1. **R22-S:** `git diff -- app/lib/arrangement/graph.client.ts` touches only l.8, l.75, l.79-81 and l.166-175 (§3).
2. **R22-U:**
   - re-run `npx vitest run app/lib/arrangement/__tests__/graph.test.ts` (19 tests);
   - run your own mutation with `MUTE_TIME_CONSTANT` set to 0.015, in a scratch copy outside `store/`. A's run gave 5 failures.
3. **R22-M1** (repro and full runs, W = 35 ms), **R22-M2** (2 ms blocks on the beep tone), and **R22-V** using the round-21 harness plus the `setTargetAtTime` spy. The mute call must show τ = 0.003.
4. **R22-A1:** music volume changes between non-zero values give τ 0.015. A step from or to 0 gives 0.003 by design (doc 028).
5. **R22-A2, R22-A3** and **R22-Doc** (doc 028).
6. **G22-1..3** and the export sanity check. Expect 1005 tests and 864 000 frames.

## Scope completed

All of the A side of §2.1–§2.4 is done: the code change, the red-first tests, doc 028, Biome on the owned files, the code-reviewer with its finding fixed, and the §5 commands. No acceptance criterion is marked PASS. The backlog is not marked complete.
