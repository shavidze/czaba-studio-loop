# A round 345 — PERF-DRAG-PREVIEW c5-ii — implemented, no STOP

## Pre-flight gate
- Assumptions: apply B's sketch (§0.2/§1.1/§1.2) exactly. HEAD `c79642c`, clean tree. Video drag previews through the store; the dock follows via `useVideoLaneArrangement`.
- Smallest version: the 3 patches + hand edits to docs 232/168.
- Files: the 6 owned files only. `ArrangementContext.tsx`, protected files, config untouched.
- Success: A-TYPE/LINT rc 0; A-UNIT drag-preview 64/64; 4 mutants red; A-PERF 60/60 asserted, 162 EQUAL / 3 DIFF; A-PERF-LIB 34/34.

## Rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | equal to `b-round-344/claims-345-planning-output.txt` | `a-round-345/claims-pre.txt` |
| patches | `git apply` of the 3 patches OK; hunks read against §0.2 (match) | — |
| docs | doc 232 l.1/l.4/c5-ii section (items 72–77)/files/problem/testing/TODO; doc 168 liveness row + მეტრიკები c5-i paragraph | — |
| A-CLAIMS final | equals sketch output except `K2 c79642c 6` and `K12 stage c5-ii of 7 1 11`; K11 0 | `a-round-345/claims-final.txt` |
| A-TYPE | rc 0 | `a-round-345/typecheck.log` |
| A-LINT | rc 0; 205 warnings, 1 info (gate 344 verify.log: 205 warnings) | `a-round-345/lint.log` |
| /check (Biome scoped to owned code files) | rc 0, 3 files (budgets JSON not in Biome's scope) | `a-round-345/biome-owned.log` |
| A-UNIT | 5 files, 136/136; drag-preview 64/64 (slowest test 445 ms) | `a-round-345/unit.log`, `unit-dp-verbose.log` |
| A-MUTANT | scratch `/home/runner/a345-scratch`; head-source 8 red (DP9b, DP13, DP48, DP53, DP57, DP58, DP59, DP62); dock-committed 3 red (DP58, DP59, DP61); dock-whole-preview 1 red (DP60); fade-status-committed 2 red (DP13, DP48) — equal to §0.3; files restored; `git status` of store unchanged | `a-round-345/unit-mutants-summary.txt`, `unit-mut-*.log` |
| A-PERF | production, alone; rc 0, `complete` true, `failures` [], 230 rows, 60/60 asserted PASS (0 FAIL). vs C344: **162 EQUAL, 3 DIFF, 0 NEW** — `interact.drag.video.stopped.move-components-per-move` 98.35 → 23.617 [23.617 ×3] (assert ≤ 24), stopped and playing `move-components-max` 100 → 25 [25 ×3]. Every non-video row EQUAL. Playing ratio (wallclock) [23.617, 23.65, 23.617]; `drag-video-live` [1, 1, 1]; `release-restarts` 31. `durationMs` **476 277** (> 450 000 → recorded Low under ROOT-REQ-PERF-TIMEOUT, not a STOP; 52.9 % of the 15 min timeout) | `a-round-345/perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c344.txt` |
| A-PERF-LIB | 34/34 | `a-round-345/perf-lib.log` |
| A-SCOPE | the 6 files only, 0 untracked; `git diff --stat` 6 files, +270/−71; protected 11 OK (K8) | `a-round-345/claims-final.txt` |
| Review fixes (after A-PERF; source and budgets unchanged, so the perf run still applies) | DP13 Undo label now exact (`'Video Fade In'`, was `.not.toBeNull()`); DP60 positive control (dock renders at mount) and overlay node identity after the drag; doc 232 testing gets A's perf run, the 4 mutants are named, item 61 is marked "until round 345". Re-run: typecheck rc 0, lint rc 0 (205 warnings), Biome on owned files rc 0, A-UNIT 136/136, mutants re-run on a fresh scratch with the same 14 reds, claims final as above | `a-round-345/typecheck-3.log`, `unit-3.log`, `biome-owned-3.log`, `mutants-final/summary.txt`, `claims-final.txt` |
| A-REVIEW | real `code-reviewer` 3 passes. Pass 1: 0 Critical/High, 1 Medium (the doc pointed to an A perf run that was missing) → fixed; Lows fixed: DP13 label, DP60 positive control, stale DP descriptions. Pass 2: 0 Medium+; 2 Lows (DP60 unmount, doc item 61) → fixed. Pass 3: 0 Medium+, both fixes confirmed. **No Medium+ open** | agents' reports summarised here |

## Strengthened hunks (for C's SOURCE-SCOPE `git apply -R --check`)
`tests.patch.txt` no longer reverse-applies cleanly in two hunks of `drag-preview-render.test.tsx`:
- DP13: `expect(live(api).undoLabel).toBe('Video Fade In')` replaces `.not.toBeNull()`.
- DP60: `{ view, clipParts }`, `const overlay = …`, `rendersOf('ArrangementVideoDock') > 0` before the drag, `toBe(overlay)` after it.

`source.patch.txt` and `budgets.patch.txt` are unchanged by A. The docs are hand-written (not from a patch).

## Open Lows for B (not changed; recorded)
- A-R345-REVIEW-DP62-FINALLY (Low): DP62 stops playback with `togglePlayback()` without `try/finally`, and has no mid-drag DOM `data-clip-start` check.
- A-R345-REVIEW-BUDGET-NOTES (Low): the notes on `interact.drag.video.{stopped,playing}.move-to-paint-p95` and `.playing.release-restarts` still say "Record until c5-ii moves…". §1.1 forbids touching other rows this round.
- A-R345-REVIEW-VIDEO-TRACK-ID (Low): `ArrangementVideoDock.tsx` looks up `videoTrackId` twice (hook `''`, component `undefined`).
- A-R345-PERF-DURATION (Low, environment/root): `durationMs` 476 277 > 450 000 → ROOT-REQ-PERF-TIMEOUT.
- Headroom note: `interact.drag.video.stopped.move-components-per-move` 23.617 against `<= 24` (0.38 margin; deterministic).

## Architecture note (for B/root, not acted on)
- ARCH-R345-VIDEO-LANE-TYPE (code-reviewer): `useVideoLaneArrangement` returns a video-lane-only object typed as a full `Arrangement`. Keep it for now. Proposal: narrow the `video.ts` / `video-fades.ts` helper parameters to `Pick<Arrangement, 'tracks' | 'clips'>` so this object cannot reach project-end or audio code. Joins ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE with ARCH-R344-DOCK-SUBTREE.

## Changed files (6)
`app/components/arrangement/ArrangementClip.tsx`, `app/components/arrangement/ArrangementVideoDock.tsx`, `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`, `perf/budgets.interactions.json`, `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`, `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`. 0 untracked; `ArrangementContext.tsx`, perf spec, `perf/lib`, `e2e`, config, protected files are untouched (K8 11, K11 0).

## A acceptance rows passed
A-CLAIMS (pre and final), A-TYPE, A-LINT, A-UNIT, A-MUTANT, A-PERF (60/60, 162/3/0; duration Low recorded), A-PERF-LIB, A-SCOPE, A-REVIEW. No dev server started. A did not run the full suite or `npm run verify` (gate rows).

## Next C checks
CLAIMS (expect `K2 c79642c 6`, `K12 stage c5-ii of 7 1 11`), SOURCE-SCOPE (with the 2 strengthened test hunks above), UNIT, C's own MUTANT on a scratch copy, PERF alone on a production build, DOCK-FOLLOWS and RENDERS on dev :5173 at 1440×900 and 1280×720, PERF-LIB, G345-AUTH, READ, DOCS. Not browser-verified by A: DOCK-FOLLOWS and RENDERS are C rows.

Dev server check after A's work: `curl http://127.0.0.1:5173/studio-lab` → 200 (A started no dev server; perf used its own :5188).
