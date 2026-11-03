# A round 308: PERF-COMMIT-RESCHEDULE-b-close (stop guard, required shapes, doc 224)

**Status:** implemented; all A rows done. No STOP. Scope completed: §4.1, §4.2, §4.3, RC12/RC13, 3 mutants, doc 224. PERF-COMMIT-RESCHEDULE closure is NOT final until C's CONT/ENDED/NO-CHANGE browser rows pass (D-29z817); A ran no browser rows this round.

## Changed files (exactly the 3 §5 grants, all modified, none new)
- `app/lib/arrangement/graph.client.ts`: §4.1 guard `state.stopAt <= (when ?? ctx.currentTime)` in both the clip and click loops of `stop(when)`; §4.2 `clipFades`/`clipEnvelopes` required in `ReplaceClipShapes` (`clipGains?` unchanged), `?.` dropped on `shapes.clipFades`/`shapes.clipEnvelopes`; §4.3 TODO line above `replaceClips(` in `ScheduleHandle` (89 chars incl. indent).
- `app/lib/arrangement/__tests__/graph.test.ts`: inside `describe('replaceClips')` only. Added `type ReplaceShapes` (derived from `startFixture`, no new import) and `const noShapes` (explicit empty maps); the 14 `, {});` call sites now pass `noShapes`; RC4/RC7/RC9/RC11 call sites gained the missing map. RC12 and RC13 appended at the end. 0 `expect(` lines removed/changed (`git diff -U0 | grep -c '^-.*expect('` = 0), no row removed or renamed, nothing above l.397 changed.
- `docs/implementation/2026/quarter-IV/224-perf-commit-reschedule.md`: one contract; l.4 = `**სტატუსი:** Completed (C round 308 PASS)`.

## Rows
| Row | Result |
|---|---|
| A-CLAIMS | PASS: before editing, `claims-308.sh` output byte-equal to `claims-308-head-output.txt` (`a-round-308/claims-before.txt`) |
| A-UNIT | PASS: 12 files, 211 tests green (`a-round-308/a-unit.log`). Times: graph 30 ms (32 tests), envelope 54, clip-fades 34, track-group-mix 22, master 57, metronome-horizon-ui 2727 ms (slowest HU1 719 ms / 15 000 ms timeout = 4.8 %), metronome 26, clip-gain 3139 ms (slowest 615 ms / 5 000 ms default = 12 %), video-fades 21, reschedule 11, schedule 6, fader-pointer-preview 7541 ms (slowest FP1 1684 ms / 20 000 ms = 8.4 %). None above 50 % |
| A-MUTANTS | PASS: scratch `tmp/a308-scratch` (rsync copy, node_modules symlinked), logs `a-round-308/mutant-*.log`, diffs `*.patch.txt`. See table |
| A-TYPE/LINT | PASS: `npm run typecheck` rc 0; `npm run lint` rc 0 (205 warnings + 1 info pre-existing; 0 mention a granted path); `npx biome check` on the 2 code paths: clean |
| A-REVIEW | PASS: `code-reviewer` (agent a641ccc6866da3afd) on the 3 granted paths, score 8.5/10, 0 Critical/High; 1 Medium + 2 Low, all ruled below; no finding outside the grants, so no STOP |
| A-DOC | done (see doc) |

### Mutants
| Mutant | Red rows | Restored |
|---|---|---|
| MU-CLIP-STOP-LATER (clip loop keeps `<= ctx.currentTime`) | RC12, RC13 | green (43/43 graph+metronome) |
| MU-CLICK-STOP-LATER (click loop keeps it) | RC13 | green |
| MU-STOP-ONCE (skip any `stopAt !== null`, both loops) | RC13 (immediate part), M10 (`metronome.test.ts`) | green |

## Claims after A (`a-round-308/claims-after.txt`)
K2 `3 d8e5ce5`; K5 empty; K6 l.92 with `clipFades:`/`clipEnvelopes:` required, `clipGains?` unchanged; K7 `418 443` (moved by the TODO line, same content); K9 `397 0 19`; K10 `13 2`; K11 `**სტატუსი:** Completed (C round 308 PASS)`; K18 `1 0`. All other K identical to HEAD output.
`sha256sum -c --quiet` fails on exactly the 3 granted paths.

## code-reviewer findings and rulings
- **Medium, doc l.4 "Completed (C round 308 PASS)" before C ran:** not changed. L28 and A-DOC require exactly this string at A's hand-off (post-PASS value; `c-round-308.json` stays the source of truth). The reviewer also could not see `tmp/studio-real-loop/a-round-308/*` and `b-round-307/probe/onended-probe.json` because they live outside the repo; A checked that both exist. Doc l.101 lists C's round-308 rows by name only and claims no result for them.
- **Low, a past `when` (`when < ctx.currentTime`) with `stopAt` between `when` and now calls `source.stop(when)` again:** accepted, not changed. This is the literal §4.1 contract. No caller passes a past `when` (`ArrangementContext.tsx` l.1093 passes `ctx.currentTime` or `startAt`). A second stop does not throw and is silent, and `stopAt` only moves earlier. If B wants it, a `Math.max(when ?? now, now)` bound is the reviewer's alternative.
- **Low, the doc's "no `expect(` changed" needs git:** A checked it: `git diff -U0 graph.test.ts | grep -c '^-.*expect('` = 0.
- Info: the reviewer confirmed the guard is behaviour-neutral for every runtime `.stop(` caller. Export never calls `handle.stop`. M10 still yields `[21, undefined]`. RC12/RC13 can fail under each mutant.

## Architecture note (for B/root; a proposal, not an instruction)
- **Signal:** `graph.client.ts` `applySchedule` now has 3 paths that write `stopAt` with the same "only earlier" rule (two loops in `stop`, plus `replaceClips`), and a prune block copied 3× (`appendPlan`, `appendClicks`, `replaceClips`). **Keep** while there is no caller. Before any `replaceClips` caller: one bounded task extracting a source registry (`prune`, `stopNoLaterThan(bound)`, `activeCount`) inside `graph.client.ts`, with RC6/RC10/RC12/RC13/M10 unchanged. Value medium, risk low–medium (audio stop timing). Same signal as round 307's note and doc 224's TODO item 5. No new request.

## Known gaps
- A ran no browser rows (none were A's). CONT-1, CONT-30, ENDED, NO-CHANGE, PLAY-SMOKE-308 and G308-AUTH are C's.
- Full vitest, build, `npm run verify` and the e2e smoke were not run by A (speed rules; gate rows).
- `npm run lint` has 205 pre-existing warnings repo-wide; none of them is in a granted path.
- Scratch `/home/runner/czaba-project/tmp/a308-scratch` (outside `store/`) was left in place. It does not survive the job.

## Exact next C checks
1. SOURCE-SCOPE: `git status --short --untracked-files=all` should show exactly 3 `M` paths, and `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-307-r308-tree-sha256.txt` should fail only on them. `ArrangementContext.tsx`, `reschedule.ts`, `metronome.test.ts` and the protected files have no diff.
2. CLAIMS: `bash b-round-307/claims-308.sh` should equal `a-round-308/claims-after.txt`.
3. TESTS-READ: RC12/RC13 semantics; mutant logs `a-round-308/mutant-MU-*.log` with `.patch.txt` diffs.
4. Browser rows on a production build of this tree (L38: run them alone and warm up first): CONT-1, CONT-30 (click rule), ENDED, NO-CHANGE (1440/1280), PLAY-SMOKE-308, G308-AUTH.
5. DOC: l.4 byte-exact; the TEMPLATE heading subsequence holds (7 headings present in order, checked by A with `grep -n '^## '`).

## Post-review doc pass (advisor)
- L34 is about granting and checking the whole contract section, so nothing was required. To make doc 224 read as one contract, A still folded the round-308 sub-lists into the single changed-files, test-row and mutant lists. Every loop artifact path now carries `tmp/studio-real-loop/`, and each one was checked with `test -e`: all exist. The content is unchanged, l.4 is unchanged, and the 7 TEMPLATE headings are present in order.
- Claims re-run after the last edit; `a-round-308/claims-after.txt` was refreshed. The deltas are the same as listed above (K20 unchanged = `done`).
