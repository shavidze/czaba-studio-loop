# A round 406 — PERF-11c-iii-d-i: actions context hands out getLivePosition/getPlaybackClock; VideoDock reads its getters from it

**No STOP.** Scope: only the B task for round 406. No commit, push or deploy. No protected file was touched (K4 rc 0, granted-protected 0).

## Changed files (`git status --short --untracked-files=all`, 4 lines)
```
 M app/components/arrangement/ArrangementVideoDock.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/__tests__/actions-context.test.tsx
?? docs/implementation/2026/quarter-IV/259-perf-video-dock-actions.md
```
- I applied the 3 source/test files from `b-round-405/sketch-406.patch.txt`. Its sha256 is `60bdf24c7a0fff14a9fd477bb724af81d371f45f93da6aff720bdbbb98fba870`, which equals K14. `git apply --check` was clean, I applied it byte-for-byte, and I did not edit those files afterwards. Diff stat: 11 insertions, 10 deletions.
- Doc 259 is new.
  - l.4 is byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 406 PASS)`.
  - It has the 7 TEMPLATE headings in order.
  - The 4 mutant lines are also included verbatim in a fenced block: `grep -F -c -f <(grep '^MU-' b-round-405/mutants/summary.txt)` on doc 259 = 4.
  - ტესტირება contains: the AC7 34→36 change, the 4 mutant rows (copied from `b-round-405/mutants/summary.txt`), the leaf probe (0 differences, VideoDock `[0,3,1,1,1,0,1,1,1,1,1,1,2]`), the 4 drift rows from `drift-summary.txt`, and A's own check results.
  - TODO lists d-ii (memo inner, the video-lane reader, the caption memo, the stopped video-Undo re-seek row) and TL-R406-SK-L1…L3.

## Checks (actually run, round 406, working tree)
| # | Check | Result | Evidence |
|---|---|---|---|
| A1 | claims at start | Same as `claims-406-planning-output.txt` (diff empty); stderr 0 bytes | `a-round-406/claims-start.txt`, `claims-start-stderr.txt` |
| A2 | `npm run typecheck` / `npm run lint` / `npx biome check` on the 3 patch files | rc 0 / rc 0 (205 warnings, 1 info — the same counts as `gates/round-405/verify.log`) / rc 0 | `a-round-406/typecheck.log`, `lint.log`, `biome.log` |
| A3 | `npx vitest run` on the 8 files in `covering.txt` | 8 files, **180/180 pass**, rc 0 | `a-round-406/vitest.log` |
| A3 L31 | slowest test vs its declared timeout | render-budget "does not re-render clips, overview bars, library rows or ruler ticks over Play → Stop → Play": 2810 ms / 15 000 ms = 18.7 % (gate 405: 2283 ms). Highest ratio: "detail panel content over 60 position frames … (R11-P1e)", 1717 ms against the default 5 000 ms = 34 % (gate 405: 1743 ms). RB-IM: 1842 / 15 000. VU4: 1377 / 5 000 = 28 %. **None above 50 %** | `a-round-406/vitest.log` |
| A4 | claims at end | Differs from planning only on K2 (4), K5 (`no`), K6 (`1` + l.4), K6b (8, pending 0) and K7–K11. K7–K11 equal `claims-406-sketch-output.txt`: against the sketch output only K1 (scratch commit), K2 (3→4), K6 and K6b differ. K3 frozen 1296 rc 0. K4 protected rc 0. stderr 0 bytes | `a-round-406/claims-end.txt` (re-run after the last doc 259 edit, on the tree being handed over) |
| A5 | `code-reviewer` subagent (4 files), real run | **Critical 0, High 0, Medium 0, Low 3**, score 9/10 | below |

Note on A3's default timeout: I took the vitest default of 5 000 ms. I found no `testTimeout` setting in `vitest.config.ts` (the grep found no hits), and the reviewer did not check this.

## code-reviewer findings (A5)
The reviewer confirmed the following against the source:
- `livePosition` (ArrangementContext.tsx:1102-1113) and `getPlaybackClock` (:1115-1126) are both `useCallback([])` and read only refs.
- The value object already mapped `getLivePosition: livePosition` (:4733).
- The Pick, the memo and the deps each have 36 entries.
- The dock's sync-effect deps (VideoDock.tsx:764) keep the same identities.
- The dock still subscribes to `useArrangement()`, so its render count does not change.
- The doc's claims are accurate. For example, `pausePlaybackWithStatus` is read through a ref at :369-370.

Lows (none is in the patch logic, and none needed a code edit):
- **R406-CR-L1 (doc):** doc 259 cites B evidence that lives outside the repo (`b-round-405/...`). I kept it, because the task requires it. C can check those files. The tests the doc names (AC7) exist (L26).
- **R406-CR-L2:** I did not trace the dependency chain of `pausePlaybackWithStatus`. d-ii must either keep the ref or prove the chain stable before the dock drops `useArrangement()`.
- **R406-CR-L3:** AC7 compares actions with value, so a wrong mapping made the same way in both would not be caught. The risk is low because the value-side mapping did not change. No behavioural test pins what `getLivePosition` returns through actions.

**Architecture note (proposal for B/root, not acted on):** ArrangementContext.tsx:4620-4697+ is a region with repeated, costly changes. Four places must be kept in sync by hand: the Pick, the actions memo, the deps and the value memo, plus the test count. The reviewer's verdict is to keep it as it is now (the const-tuple option was ruled out, and AC7 catches drift). At the Lane (e) planning, consider one bounded task: either rename `livePosition` to `getLivePosition` (TL-R406-SK-L2), or move the actions building into its own hook. Invariants to keep: callback identity, AC7, and the audio-timing refs.

## For B
- **Architecture note (code-reviewer):** keep it as it is now. Revisit at the Lane (e) planning: one bounded task, either the `livePosition`→`getLivePosition` rename (TL-R406-SK-L2) or moving the actions building into its own hook. Invariants: callback identity, AC7's count and `toBe` loop, and the audio-timing refs. Not acted on.
- **Proposed dispositions:**
  - R406-CR-L1 (doc cites loop artifacts): informational only, no action.
  - R406-CR-L2 (`pausePlaybackWithStatus` chain not traced): a precondition for d-ii, which must keep the ref or prove the chain stable.
  - R406-CR-L3 (no behavioural pin on what `getLivePosition` returns through actions): a candidate d-ii row; otherwise `deferred_low_polish`.
- No STOP. No edits outside the 4 granted paths.

## Known gaps
- **No browser check by A.** I did not run VIDEO-SYNC or LEAF-PROBE on the working tree. They are C rows 3 and 4. B's sketch runs (K21, K22) are B's evidence, not A's.
- **Mutants not run by A.** That is C row 5. The rows in the doc are B's sketch results.
- **Gate rows** (full vitest, build, verify) were not run (speed rules).

## Next C checks (in this order, L59)
1. Row 5: the A3 set, then `S=/tmp/c406-scratch OUT=<loop>/c-round-406/mutants python3 -I b-round-405/mutants/run.py` on a committed scratch copy. Expect 4/4 RED, pristine rc 0 before and after, scratch status 0 lines.
2. Row 4: `node b-round-405/probe/leaf-probe-406.mjs http://127.0.0.1:5173 <out>.json`. Expect VideoDock `[0,3,1,1,1,0,1,1,1,1,1,1,2]` and StudioWorkspace equal to `leaf-sketch-406.json`.
3. Row 3: `node b-round-405/video/video-playsync-probe.mjs http://127.0.0.1:5173 <out>.json <viewport>` at 1440×900 and 1280×720. Expect paused false and |drift| ≤ 0.05 s.
4. Rows 1, 2, 6, 7 and 8 as the task describes: PATCH-IDENTITY `cmp`, AUTH, doc 259 l.4 and headings, claims at start and end, `tools/l57-check.py`.

## Scope completed
B §3 steps 1–4 and A1–A5 pass on the working tree. I am not marking any C acceptance row or backlog item as complete.
