# Round 338 sketch review (c3-ii) — consults and B's dispositions

Both consults were read-only (Read/Grep/`sed`; neither ran a command while B's perf spec ran). `code-reviewer` is not on this phase's consult list, so `tech-lead` reviewed the sketch (same precedent as D-29z1027).

## tech-lead (sketch v2 = `apply-sketch.py` + hand-added DP49)
| # | Sev | Finding | Disposition |
|---|---|---|---|
| TL-1 | Medium | v2's `if (getArrangement() !== gesture.before)` guard skips `previewActiveRef = true` on a direct cross-lane drag. The video-import wait (`ArrangementContext.tsx` ~l.2718) checks only `previewActiveRef`, so an import could publish history mid-drag and the release would commit from a stale `before` | **Applied in v3** (`apply-sketch-v3.py`): always `previewGeometry(gesture.before)`. The new clear branch in `previewClipGeometry` makes the repeat call render-free. DP49 asserts `isArrangementPreviewActive()` true after the first (direct) cross move; mutant MU-GUARD-V2 (the v2 guard) is red there (`unit-mutants/MU-GUARD-V2.log`) |
| TL-2 | Low | Names: `ClipLaneDragState` vs `ArrangementLaneDragState`; three spellings (clipLaneDrag / laneDrag / laneMove) | **Applied** in the task: file `clip-lane-drag-store.ts`, `ArrangementClipLaneDragStoreState`, `ArrangementClipLaneDragStore`, `createArrangementClipLaneDragStore`, `useArrangementClipLaneDragStore`, `useArrangementClipLaneDrag`. Selector names keep the existing `selectLane…` family (they select per lane). B applied the rename to its sketch (`apply-sketch-v4-rename.py`) and re-ran typecheck and the covering files |
| TL-3 | Low | Type re-export from the context | **Applied**: no re-export; `ArrangementClip.tsx` and the test probes import the types from the lib file |
| TL-4 | Low | No unit test for the selectors | **Applied** as rows CL1–CL4 in a new `app/lib/arrangement/__tests__/clip-lane-drag-store.test.ts` (A writes it; B sketched it, see the task) |
| TL-5 | Low | Docs describe `clipLaneDrag` as context value | doc 232 granted whole (L34): stage c3-ii section, header/status, files, tests, TODO. doc 168 `## მეტრიკები` granted whole for the asserted lane rows. doc 014 (round-era history) and doc 233 l.75 (a TODO that this stage satisfies) stay unchanged: implementation docs are history; ruled in the task |
| — | — | Checked fine: the clear branch for trim/fade/same-lane callers, Esc/stale cancel, undo/redo, playback sync (no effect depends on `history`), video and group untouched, SSR, per-lane subscriptions | — |

## performance-optimizer
| Point | Disposition |
|---|---|
| Assert `move-components-per-move` (≤, integer, headroom ≤ ~1/move and below the "lane subscribes everything" mutant), `release-commits == 1`, playing `move-restarts == 0` | Applied: `<= 26` (sketch 24.906), `== 1`, `== 0`, 1x rows only (the existing pattern: `.6x` copies of component rows stay record) |
| `release-restarts` | Kept record: a release restart is the commit's normal graph sync, not this stage's contract |
| `move-components-max` does not test c3-ii (101 is the same-lane commit) | Kept record |
| `cross-`/`lane-components-per-move` are wallclock (L37) | Kept record |
| Liveness hardening: require the target ghost start to advance (dedupe/snap could make moves no-ops) | Applied in v3: `readLaneGhosts` returns `targetStart`, an entry read after the 1-step down, check (e) `cross > entry` |
| DP49: `previewOf(api)` null right after the first cross move | Applied in v3 (plus `getArrangement() === arrangement`) |
| Mutant A (unconditional `previewArrangement(gesture.before)`) red on the perf assert | Run in production: `perf-mutant-guard.log` |
| Signals (not scheduled): ghost layer as its own memo child (SIG-R338-GHOST-LAYER); group cross-lane branch still calls `previewArrangement(gesture.before)` per move (→ stage c4 scope, SIG-R338-GROUP-CROSS-PREVIEW) | Recorded in `backlog.json` `architecture_signals` |
