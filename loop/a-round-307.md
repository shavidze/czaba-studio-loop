# A round 307: PERF-COMMIT-RESCHEDULE stage a

**Status:** implemented. No STOP. The code review ran twice (the second time after the fixes), and no Medium or higher finding is open.
**Baseline:** HEAD `ecb832a`, clean tree at start.

## Changed files (the §5 paths only)
Modified (2):
- `app/lib/arrangement/graph.client.ts`: `ReplaceClipShapes`, `ScheduleHandle.replaceClips` and its implementation, the copied maps `clipFadeTargets` and `clipEnvelopeTargets`, and `startPlan` reading them.
- `app/lib/arrangement/__tests__/graph.test.ts`: one import line (`planChangedClips`) and a new top-level `describe('replaceClips')` after the final `});`, with the specified RC1–RC9 plus **RC10 and RC11**, which the reviewer asked for (see A-REVIEW). `git diff` has **0 removed lines**.

New (3):
- `app/lib/arrangement/reschedule.ts`: `ClipScheduleDiff`, `diffClipSchedule`, `planChangedClips`.
- `app/lib/arrangement/__tests__/reschedule.test.ts`: RS1–RS10.
- `docs/implementation/2026/quarter-IV/224-perf-commit-reschedule.md`.

`git status --short --untracked-files=all` lists exactly these 5 paths. `sha256sum -c --quiet b-round-306-r307-tree-sha256.txt` fails only on the 2 modified paths. Protected files, `ArrangementContext.tsx` and `schedule.ts` have no diff.

## Rows
| Row | Result |
|---|---|
| A-CLAIMS | **PASS.** Before editing, `bash b-round-306/claims-307.sh` was byte-equal to `claims-307-head-output.txt` (`diff` empty) |
| A-UNIT | **PASS.** RS1–RS10 and RC1–RC9 are written and green, and so are the two extra rows RC10 and RC11. Covering set: 10 files, **185 tests**, all green (`a-round-307/covering.log`; file times below) |
| A-MUTANTS | **PASS.** 7/7 specified mutants are red on their listed rows and green when restored. Two extra mutants for RC10 are also red (table below) |
| A-TYPE/LINT | **PASS.** `npm run typecheck` rc 0. `npm run lint` rc 0 on the final tree (205 warnings + 1 info repo-wide, pre-existing). Scoped `npx biome check` on the 4 granted code paths: no diagnostics |
| A-REVIEW | **Done, 2 passes.** Pass 1 (`code-reviewer`, 5 paths): no Critical or High, no regression outside the grants, 8/10. **Medium (coverage):** the not-ended `stopAt <= startAt` skip, the pull-forward of a later stop, and envelope set/delete were not exercised. **Fixed** inside the granted describe with RC10 (repeated replace in forward and reverse order without `onended`) and RC11 (`clipEnvelopes` set, then removed with `{}`; the automation equals a fresh `applySchedule`). Two new mutants prove RC10 can fail. Pass 2 on the changed lines: "earlier Medium is resolved", 9/10. Its Low (the equal-boundary case) is fixed with one more assert in RC10 and the MU-STOP-EQUAL mutant; its doc nit is fixed. Lows not applied, as notes for B: (1) every field of `ReplaceClipShapes` is optional, so `{}` deletes fades and envelopes, and stage b must always pass both maps. Making them required would change the §4.2 signature, so I did not. (2) The prune block is copied from `appendPlan`; `appendPlan` may not change this round. (3) The `Parameters<typeof planChangedClips>[0]` type alias exists only because of the one-import rule. The reviewer's stage-b traps (the `clipGains` source and the mix sync after a replace, `ended` firing for a source stopped before it starts, the duplicated `gainDb` rule) are written into doc 224's TODO |
| A-DOC | **Done.** Doc 224 with TEMPLATE's 7 headings in order (l.7, 18, 29, 45, 53, 60, 68); l.4 is byte-exact `**სტატუსი:** In Progress (stage 1 of 2; C round 307 PASS)`. It cites only RS1–RS10, RC1–RC11 and the mutant ids that exist in the logs |

### Covering-set times (final run, `a-round-307/covering.log`)
| File | Tests | Time |
|---|---|---|
| reschedule.test.ts | 10 | 8 ms |
| graph.test.ts | 30 | 24 ms |
| schedule.test.ts | 12 | 5 ms |
| clip-fades.test.ts | 25 | 15 ms |
| envelope.test.ts | 30 | 44 ms |
| clip-gain.test.tsx | 28 | 843 ms (slowest single test 954 ms, in an earlier verbose run) |
| video-fades.test.ts | 12 | 10 ms |
| metronome.test.ts | 11 | 18 ms |
| master.test.ts | 17 | 23 ms |
| track-group-mix.test.ts | 10 | 25 ms |

No `testTimeout` override in `vitest.config.ts` or `clip-gain.test.tsx`, so the default 5,000 ms applies. The slowest test (954 ms) is 19 % of it. Under the L31 50 % line.

### Mutants
Scratch: `/tmp/a307/scratch` (`git archive HEAD` + A's 4 code files + a `node_modules` symlink). Script `/tmp/a307/mutants.py`. Logs and diffs: `a-round-307/mut-*.log|diff`. Each run covers `reschedule.test.ts` + `graph.test.ts` (40 tests). The table is the final run on the final test files; the script is copied to `a-round-307/mutants.py`.

| Mutant | Red rows | Required |
|---|---|---|
| control | none, 40/40 | — |
| MU-DIFF-FADE (`fadeIn`/`fadeOut` dropped from the diff JSON) | RS3 | RS3 ✓ |
| MU-TRACK-SET (track-id check removed) | RS7 | RS7 ✓ |
| MU-SHAPES-IGNORED (fade and envelope map set/delete removed) | RC4, RC9, RC11 | RC4, RC9 ✓ |
| MU-STOP-NOW (stop at `ctx.currentTime`) | RC1, RC2, RC3, RC6, RC10 | RC1 ✓ |
| MU-SOUNDING-ONLY (skip states whose scheduled start is > `startAt`; the start is recorded in a scratch-only map) | RC1, RC3, RC10 | RC3 ✓ |
| MU-NO-PRUNE (prune in `replaceClips` disabled) | RC6 | RC6 ✓ |
| MU-ID-FILTER (start every item) | RC5 | RC5 ✓ |
| *extra* MU-STOP-SKIP-ANY (skip every state that has a `stopAt`) | RC10 | — |
| *extra* MU-STOP-EQUAL (`<=` → `<`) | RC10 | — |
| restored | none, 40/40 | — |

After the run, the scratch `graph.client.ts` and `reschedule.ts` are byte-equal to the store files (`cmp`).

## Claims after A (`a-round-307/claims-after.txt`)
- K2 `5 ecb832a` ✓. K6 `217` (only the `clipGainTargets` copy line) ✓. K10 `53` (> 0) ✓. K11 `present present` ✓. K16 `224-perf-commit-reschedule.md 1` ✓.
- K5: `applySchedule` moved 168 → 181 (the new interface members). The content is the same (D-29z793). ScheduleHandle 72, appendPlan 73 and activeSourceCount 81 are unchanged.
- K15: the fakes moved 43/51/64 → 44/52/65 because of the one granted import line. The content is the same.
- **K14 `30 711`, not `19`.** This is a mismatch in B's expectation, not in the code. The new `describe('replaceClips')` is top-level, so its `it(` rows are also indented by 2 spaces and `^  it\(` counts them: 19 + 11 = 30 (RC1–RC9 plus the review rows RC10 and RC11). The way to keep 19 would be a nested describe, which §5 does not ask for, so I did not bend the format. For C: a `countMismatches` entry with origin "B spec".
- All other K values equal the HEAD output.

## Notes on choices within the grants
- The RC fixture keeps the RS fixture's times and offsets. Each clip gets its own buffer (`src-a`, `src-b`, `src-c`, per "buffers for all three sources") so that fake sources can be told apart.
- `graph.test.ts` does not import `planSchedule`, and only one import line may be added. The initial `applySchedule` plan is therefore `planChangedClips(fixture, ['a','b','c'], 0)`, which is `planSchedule(fixture, 0)` filtered to every id, so the two are equal. The `Arrangement` type comes from `Parameters<typeof planChangedClips>[0]`.
- RC4 and RC9: the existing `FakeParam` records only `setTargetAtTime`. The new describe defines `AutomationParam`/`AutomationGain`/`AutomationContext` subclasses (new lines only) that record `setValueAtTime` and `linearRampToValueAtTime`. RC4 also asserts that the expected event list is not empty (L52).
- `replaceClips` copies the `appendPlan` prune block inline instead of extracting a helper, because `appendPlan`'s lines must not change (SOURCE-SCOPE). The stop loop also skips `state.ended`. After the prune nothing is ended, so this changes nothing on the real path. It keeps an ended source from being stopped under MU-NO-PRUNE.
- `diffClipSchedule` also returns `null` when either side holds duplicate clip ids (defensive; not a §4 case).

## Known gaps
- Nothing on the runtime path uses `replaceClips`/`diffClipSchedule` yet (stage b). A ran no browser rows: NO-CHANGE, PLAY-SMOKE-307 and G307-AUTH belong to C.
- `diffClipSchedule` compares by `JSON.stringify`, which depends on key order. Arrangement edits made through spreads keep the order. A clip rebuilt with keys in another order would show as "changed", which costs an extra replace but is not a wrong sound. Flagged for B in stage b.

## Next C checks
1. SOURCE-SCOPE: the 5 paths; `sha256sum -c` fails only on the 2 modified ones; `git diff app/lib/arrangement/__tests__/graph.test.ts | grep -c '^-[^-]'` = 0.
2. CLAIMS: re-run `claims-307.sh`. Expect K14 = `30 711` (see above), with origin B spec. K10 = 53.
3. TESTS-READ: RS1–RS10 and RC1–RC9 against §6, plus the extra RC10 and RC11 (not in `assertsSpecified` = 19; C may record 21 written). Mutant logs `a-round-307/mut-*.log`.
4. NO-CHANGE on a production build of this tree at both viewports (30 starts per release, `playing` true).
5. PLAY-SMOKE-307 and G307-AUTH as in §3.2.

## Scope completed
Stage a only (§4.1, §4.2). The stage-b wiring, harness rows and budgets are not started. The whole backlog is not complete.

## For B (Architecture note from the code-reviewer; a proposal, not an instruction)
- **Signal** `graph.client.ts` `applySchedule`: the closure now has three operations that change the `sources` lifecycle (append, stop, replace), a copied prune block, and two new mutable maps. **Keep for now**, because nothing is wired yet and audio timing is untouched. **After stage b lands:** one bounded task that extracts a source registry (prune, `stopAt`, active count) inside `graph.client.ts`, with RC6/RC10-style tests. Value medium, risk low.
- **Alternative the reviewer raised (not taken):** for fade-only or envelope-only edits, keep the source and re-schedule its gain automation (`cancelScheduledValues`) instead of splicing. Revisit only if stage b's continuity probe hears a click.
