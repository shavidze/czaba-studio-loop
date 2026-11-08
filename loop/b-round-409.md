# B round 409 → 410 planning report

**Date:** 2026-11-08. **Baseline:** gate 409 published `9616d3a` on both remotes (`gates/gate-round-409.json`); HEAD `9616d3a`, clean tree.
**Advisor:** available, used after orientation and before hand-off.
**Consults** (read-only project agents): `performance-optimizer` once; `tech-lead` twice (v1, then a delta re-review of the dispatched v2).

## 1. Round 409 acceptance (independent C evidence only)
- `c-round-409.json`: `taskStatus` PASS, 8/8 rows passed, `failed` [], `bugs` [], `browserVerified` true, `realVerified` true.
- Gate 409 published `9616d3a` (review COMMIT OK, no blockers).
- **Now done:** PERF-11c-iii-e-ii, PERF-11c-iii and PERF-11c (D-29z1421). PERF-11 stays in progress only on 11b (`awaiting_user`).
- **Still open evidence:** the fake-bearer `/api/studio-token` row is BLOCKED (backend unavailable in the cloud). It is not a PASS.
- **Rulings (D-29z1422):**
  - Three Lows → `deferred_low_polish`: A-R409-REVIEW-L4-TRACK-FIELD-COVERAGE, GATE409-L1-COMPARATOR-OBJECT-IS-TRAP and GATE409-L2-ARRANGEMENT-CLIPS-ALIAS.
  - Both Architecture notes (A's reviewer and gate 409) say "keep". Both propose an identity-stable `sourceDurations`. That becomes the signal SIG-R409-SOURCE-DURATIONS-IDENTITY, attached to ARCH-CHECKPOINT-PERF11C-III-BOUNDARY.
  - The checkpoint has no root result yet. It is non-blocking, so B continues with PERF-15.
- Backlog v383 → v384 (`b-round-409/update-backlog.py`).

## 2. Next task: round 410 = PERF-15a (`current-task.md`; round 409 archived in `tasks/round-409.md`)

**Why this one:**
- No C bug is open, and no Critical or High.
- The open Mediums are root, manual or `awaiting_user` only.
- The regression is not due (last run 2026-11-07; next on or after 2026-11-10). The RETRO is at 416.
- PERF-15 is next in the dependency order (D-29z1420).

**Premise, measured at HEAD:**
- The library preview draws `sourcePeaks` in any load state (dimmed while loading).
- Lanes need `ready`.
- So in this feature, "waveform visible before decode" means the library preview only. That limit is now written into PERF-15.

**Split (D-29z1424):**
- **15a:** the parser, the optional `WorkspaceCollection.peaksUrl`, and the collection-load fallback.
  - The worker is skipped only for 16-bit peaks whose length matches the decoded audio. 8-bit peaks are a placeholder.
  - Decoded peaks always win, and late peaks are ignored.
  - Error cleanup and swap cleanup are included.
  - Nothing sets `peaksUrl` yet, so `/studio-lab` is unchanged.
- **15b:** the demo's URL-backed sources get a `peaksUrl`, plus a real-browser "waveform before ready" row with `page.route` stubs, the purchased adapter input, and a `product-designer` consult on the dimmed loading waveform.

**Backend half:** B wrote the handoff note `docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md`:
- audiowaveform runs as an external process;
- `-b 16 --split-channels`, `spp = sample_rate/100`;
- the same decoded asset or the WAV master;
- versioned, protected `peaksUrl`s.

**Dispatched patch:** `b-round-409/sketch-410.patch.txt` v2, sha `8f22c005…`, 5 files.

| Check | Result |
|---|---|
| tsc, Biome, lint | rc 0 |
| Full vitest | 264 files, 3,906/3,906 |
| Covering set | 274/274 |
| Mutants | 17/17 red |
| Browser no-regression probe and round-409 lane probe | ok on HEAD and on v2 at both viewports |

- `tech-lead` gave APPROVE WITH LOWS on v1, and the delta re-review on v2 also gave APPROVE WITH LOWS (`b-round-409/sketch-review.md`).
- SK-2 and SK-4 are fixed in v2. SK-1, SK-5 and SK-6 are in the docs. SK-3 is a deferred Low. SK-8 is fixed (`mutants/equivalent.txt`).

**Grants (6):** 5 patch files plus the new doc 263 (l.4 `In Progress (stage 1 of 2; C round 410 PASS)`). Frozen 1,301; the 11 protected files are untouched. Claims: `b-round-409/claims-410.sh`; the planning and sketch outputs are saved, and both stderr files are empty.

**Process facts:**
- The v1 artifacts are kept: `sketch-410-v1.patch.txt`, `mutants/v1/`, `probe/v1/`, `lane/v1/`, and `precheck-full-v1.*`.
- The sketch server on :5174 used its own Vite `cacheDir`. It was stopped, and the scratch `vite.config.ts` was reverted.
- `store/` was never edited (K2 = 0), and :5173 answers 200.

## 3. Architecture
- ARCH-CHECKPOINT-PERF11C-III-BOUNDARY (requested in round 408's planning, `b-round-408/root-request-arch-checkpoint-perf11c-iii.md`) is still open with root. It is non-blocking, and it now includes SIG-R409-SOURCE-DURATIONS-IDENTITY.
- PERF-15a interacts with that signal: peaks can now land before `ready` and re-render every lane through whole-map deps. This costs extra renders only, never a stale view, and it is recorded in the task's side-effects table.
- No new checkpoint request. PERF-15 is mid-feature, and the risk on `ArrangementContext.tsx` is the same open question.

## 4. Status
- Backlog v385 (D-29z1421…D-29z1426).
- `feature-status.md` updated: the header, the round 409 line, the next line and the STUDIO-PERFORMANCE row.
- `regression-last.json` is unchanged (no regression round closed).
- **Ready to commit:** round 409 is already published. Round 410 is not ready until C PASS and the root gate. The handoff note in `docs/technical/studio-real-workspace/` is a B planning artifact outside `store/`.
- **Decision: CONTINUE.** Many scoped items remain (see `b-next.json`). PERF-15 itself is not done until 15b's browser row passes. Nothing needs external input to proceed.
