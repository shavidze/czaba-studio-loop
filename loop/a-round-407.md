# A round 407 — PERF-11c-iii-d-ii (video dock memo inner + video-lane commit signal)

Status: implemented; all A1–A5 checks passed. No STOP.

## Changed files (git status: 3 ` M` + 1 `??`)
- `app/components/arrangement/ArrangementVideoDock.tsx` — patch `b-round-406/sketch-407.patch.txt` (sha256 4ec62e316b8776b7…a2f808) applied byte-for-byte; not edited afterwards.
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` — same patch, byte-for-byte.
- `docs/implementation/2026/quarter-IV/259-perf-video-dock-actions.md` — l.4 only → `**სტატუსი:** Completed (C round 407 PASS)`.
- `docs/implementation/2026/quarter-IV/260-perf-video-dock-memo.md` — new (7 TEMPLATE headings in order, l.4 byte-exact).

## Checks (logs in `a-round-407/`)
| # | Check | Result |
|---|---|---|
| A1 | claims at start | identical to `claims-407-planning-output.txt` (diff rc 0), stderr empty — `claims-start.txt` |
| A2 | `npm run typecheck` | rc 0 — `typecheck.log` |
| A2 | `npm run lint` | rc 0 (`npm run lint`: 205 warnings, 1 info, all pre-existing; B's 2 infos came from a different command, repo-wide `npx biome check`) — `lint.log` |
| A2 | `npx biome check` on the 2 patch files | rc 0 — `biome-patch.log` |
| A3 | 16 covering files | 16 files / 360 tests passed, rc 0 — `covering.log` |
| A3 | slowest vs timeout (L31) | max absolute: render-budget "does not re-render clips…" 3332 ms / 15000 ms (22 %); max ratio: track-layout "folds a lane to a 36 px row…" 1921 ms / 5000 ms default (38 %). None > 50 %. |
| A4 | claims at end | differs from planning only on K2 (4), K5 (no), K6, K6a, K6b (7, pending 0), K7–K9, K11; K7–K11 equal sketch output (sketch diff only K1/K2/K6/K6a/K6b). K3 1297 rc 0; K4 rc 0 — `claims-end.txt`, `claims-end-vs-planning.diff` |
| A5 | `code-reviewer` subagent (4 files, agentId a5b1ccb3e6b6792ac) | No Critical/High; **no Medium in the patch logic**. One Medium was on doc 260 only (see below), fixed in the doc. Score 8/10 |

## Reviewer findings and handling
- **Medium (doc 260 only):** the doc named loop evidence (`sketch-407.patch.txt`, `b-round-406/mutants/summary.txt`, probe files) without saying they are outside the repo; the reviewer's Glob could not find them. The files exist in `tmp/studio-real-loop/b-round-406/` (checked with `ls`). **Fixed in doc 260:** the full loop paths and patch sha256 are given, and it is stated that they are loop evidence outside the repo. Doc 259's l.4 is the L28 post-PASS form B ruled; unchanged.
- **Low 3 (cachedLane lagging top-level fields) = TL-R407-SK-L1, already deferred_low_polish.** The reviewer noted that it applies after any commit that leaves video clips unchanged, not only track-only commits. **Fixed in doc 260's TODO wording** (no code change; the patch is byte-for-byte).
- **Info 6:** stopped re-seek after Undo is unit-gated by DP72 (verified: DP72 calls `undo()` and waits for a new seek write at l.2325–2328); no unit row covers re-seek after Redo (browser row 3 does). This is now said in doc 260 ტესტირება.
- **Low 2 (mutable registry inside `useMemo`), Low 4 (`ArrangementVideoCaptionView` naming vs the folder's `XInner` → `X` pattern), Info 5 (a ref written during render):** patch logic, so no edit (ruling "apply byte-for-byte"). For B to rule or defer.
- **Suggestion:** one unit row that edits the video track without touching its clips (assert inner/caption 0 renders, opacity/gap correct) would pin TL-R407-SK-L1. For B.

## Architecture note (proposal for B/root, not acted on)
- Signal 4: `ArrangementVideoDock.tsx:216-255`. A hook inside the dock now owns a listener registry and publish lifecycle (a small external store). The reviewer says **keep it**: one owner, pinned by tests. Extract to `app/lib/arrangement/video-lane-store.ts` only if a second consumer appears (DP70–DP75 stay green). An alternative is a committed-arrangement external store in `ArrangementContext`; that is a planned task, not this diff.

## Known gaps
- No browser rows were run by A (C's rows 3–5, 7). The browser numbers in doc 260 are B's sketch runs. C must confirm them on the working tree.
- The mutants were not run by A (C row 6).
- The full suite, build and verify were not run (gate, speed rules).

## Exact next C checks
Rows 1–9 of the task in L59 order: 6 (unit 360/360 + 7 mutants on a committed scratch, `OUT=<loop>/c-round-407/mutants`), 5 (leaf probe: caption and `ArrangementVideoDockViewInner` 13 zeros, the dock shell `[0,3,1,1,1,0,1,1,1,1,1,1,2]`), 3 (stopped seek ≤ 0.05 s on all 4 steps, both viewports), 4 (play drift ≤ 0.05 s, record the counters and caption text), then 7 (auth), 2 (patch identity cmp), 8 (docs: doc 260 changed after the review, so recheck the 7 headings and l.4), 1/9 (scope; status = 3 ` M` + 1 `??`).

## Scope completed
§3 items 1–4 done. B acceptance criteria truly passed by A: A1, A2, A3, A4, A5. C rows not claimed.

## For B
- Doc 260's TL-R407-SK-L1 wording is wider than D-29z1411's ("track-only commit"). A checked it against the code: `readVideoLaneArrangement` keeps `cachedLane` whenever `sameClipList` holds, whatever else in `base` changed (`ArrangementVideoDock.tsx:224-233`). Carry the wider text into the backlog entry.
- Doc 260 now also quotes the 9 `mutants/summary.txt` lines verbatim, under its mutant table.
- Rule the reviewer's Low 2 and Low 4 (patch logic, not edited), and decide whether to add the video-track-only unit row with TL-R407-SK-L1.
- Architecture note above (keep; extract only if there is a second consumer).

## Final re-checks (after the doc 260 review fix)
- A scratch was used outside the loop folder (`/tmp/a407chk`, removed). That is a process deviation from L60, and nothing was lost.
- Claims re-run: `a-round-407/claims-end2.txt` is byte-identical to `claims-end.txt`, and stderr is empty.
- `git diff app/ | sha256sum` = `4ec62e316b8776b7…a2f808`, the patch's own sha256. Patch identity was also checked with `git archive HEAD` + apply + `cmp` on the 2 files: `PATCH-IDENTITY-OK`.
