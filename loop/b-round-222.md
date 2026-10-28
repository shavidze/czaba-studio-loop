# B round 222 → 223 planning (2026-10-28)

**Decision: CONTINUE.** Round 223 = **PERF-HARNESS-SHARED-LIB** (test-only). Decisions D-29z243…D-29z250.

## 1. Inputs read
- `context/active-summary.md`, `lessons.md`, `tasks/round-222.md` (archived copy of `current-task.md`; `cmp` OK).
- `a-round-222.md`, `c-round-222.md`, `c-round-222.json`.
- `gates/gate-round-222.json`: **published**, commit `2d4a93ff6a21…`, on both remotes. **The next baseline is that commit.** The store tree is clean at planning (`b-round-222/git-status-at-planning.txt` is empty).
- `gates/round-222/review.md` (COMMIT OK, 9/10), `env-status.json` (round 222, store 200), `regression-last.json` (2026-10-27, round 199; due on or after 2026-10-30).
- Backlog lookups by ID: PERF-HARNESS-SHARED-LIB, D-29z215, R216-MEM-POLLS-HEADROOM, GATE214-S1..S5, GATE217-S1..S4, ARCH-GATE217-REPORT-HELPERS.
- Source:
  - the three perf specs (helper blocks and report builders);
  - `perf/lib/*`;
  - `playwright.perf.config.ts`;
  - the `tsconfig`, `biome` and `vitest` includes;
  - docs 163, 168 and 169 (headings and the cited lines);
  - `ArrangementLane.tsx` l.692 and `ArrangementClip.tsx` l.210 (the `data-track-id` ancestor, for GATE214-S2).

## 2. Backlog updated only from independent evidence
**Round 222: C PASS.**
- 12 rows passed; `browserVerified` and `realVerified` are true.
- LEGACY-OWNERSHIP-222 is backend-blocked.
- Gate 222 published `2d4a93f`; verify ran 203 files and 2,958 tests.

So:
- **B-R220-LEGACY-EXPORT-NO-STEMS → done.** The feature-status line is now მზადაა.
- **C-R222-01 ruled (L10, D-29z243).** C's control run proves that two exports of the same selection differ by 1 LSB, so "byte- or PCM-identical" could never pass.
  - The criterion is amended to "PCM within 1 LSB on every sample + per-stem spectrum Δ ≤ 0.01 dB". This is recorded in `harness_rules` HR-LEGACY-STUBBED and in the REGRESSION `scope_additions`.
  - The nondeterminism itself goes to `deferred_low_polish` and is input for the export-pipeline checkpoint.
- **C-R222-02** is B's own error: the quote came from my round-222 §3. D-29z247 corrects the record, and the old text is left as written. The doc-174 reword goes to `deferred_low_polish`.
- **C-R222-03** (the footer is cut at 1280×720; pre-existing JSX) → `deferred_low_polish`.
- **A's reviewer Lows:**
  - (a) duplicate ids is the same finding as gate S2 → `deferred_low_polish`;
  - (b) the StrictMode row needs no action; the gate reviewer confirms the pattern is safe;
  - (c) the test helper reads `textContent` → `deferred_low_polish`;
  - (d) is the same as C-R222-02.
- **Gate-222 review:**
  - S1 (the closed dialog re-renders on every playback tick) becomes signal GATE222-S1-DIALOG-TICK-RENDER, attached to the checkpoint;
  - S2 is the same as (a);
  - S3 needs no fix;
  - S4 is the existing LEGACY-EXPORTDIALOG-A11Y-WARNINGS;
  - S5 is acknowledged; there is a precedent.
- **Architecture note** `useStemSelection` → signal ARCH-R222-USE-STEM-SELECTION. Not scheduled.
- `deferred_low_polish`: 345 → 351 (incl. the pre-ruled DOC-PERF-LINEREF-DRIFT-223, D-29z250).
- **No Critical, High or Medium finding is open.** The open_tech_lead items stay on the Tech Lead list.

## 3. Why this round
- **The outcome table was fixed in advance** (`tasks/round-222.md` §8, row 1): C PASS and planning on 2026-10-28, before 2026-10-30. REGRESSION is not yet due. The next RETRO runs at round 230 or at the end of STUDIO-PERFORMANCE.
- **No open bug at Medium or above,** so the next dependency-ordered stage in `execution_order_d29z215` runs.
- **Split (D-29z244), not a scope cut.** The tech-lead and performance-optimizer consults agree that the M2 tolerance, GATE214-S1/S4 and R216 change pass/fail semantics or measurement windows. In the same round they would void the "nothing changes" proof. They form **PERF-HARNESS-SHARED-LIB-b**, queued directly after this round and before PERF-2. A durable `report.test.ts` (it needs a root-owned config include) joins it.
- **Order rationale:** stage b comes before PERF-2, because every later PERF task uses the determinism checks as its proof. B chose to make those checks able to fail first.

## 4. Re-measurement and the oracle (D-29z249)
- B ran `playwright.perf.config.ts` on `git archive 2d4a93f` in `/tmp/b222-base`, with `node_modules` symlinked. The repo was not touched. Result: **3/3 pass in 13.4 min** (`b-round-222/baseline-perf-run.log`, reports in `b-round-222/baseline-results/`).
- **Reproducibility** (`b-round-222/scripts/compare-det.py`):
  - **0 deterministic-median differences** against C round 214 for 1a (167 rows) and 1b-i (122), and between C rounds 220 and 221 for 1b-ii (38);
  - against C round 221, exactly 4 `res.js.*` byte rows differ. Round 222's app change moved them.
- **`b-round-222/scripts/equiv-check.py`** encodes the EQUIV-223 contract:
  - the envelope keys and their order;
  - the row ids and their order, and the row key order;
  - the descriptive fields;
  - the deterministic medians and the assert `pass`;
  - complete, failures, aborted passes and page errors.

  It exits 0 for the oracle against itself and against C round 214's 1a report. It **detects the 4 real byte changes** when the oracle is compared with C round 221, which is the positive control.

## 5. Consults
- **tech-lead:**
  - put the playback helpers in `page.ts` as well;
  - the report core returns `{complete, failures, rows}`, and each spec keeps its own envelope, which keeps the key order;
  - an options object, without unifying the 5 differences;
  - no unit test this round (the vitest include is `app/**` only);
  - noted that `noUnusedLocals` is off, so a scratch tsconfig is prescribed.
- **performance-optimizer:**
  - the helper diff map;
  - `faderRowId` and 1a's fixed 2,000 ms Add wait stay in the spec;
  - the in/out verdict per Low;
  - the `storeRoot` and `evaluate`-closure traps;
  - the round-trip order;
  - which fields must be equal.

  **One disagreement, resolved by B:** the optimizer would include GATE214-S4. B keeps it in stage b, because it changes a liveness check, and the tech lead's rule excludes semantic changes in this round.
- **Advisor (before writing):** adopted in full:
  - the split;
  - the core contract and the trap rows;
  - the oracle with a HEAD-rerun clause;
  - scratch report equivalence with the named mutants M-A, M-B and M-C;
  - the scratch tsconfig;
  - the round-222 rulings.
- **ableton-arrangement-expert / docs-explorer:** not consulted. There is no user-facing behaviour, so "Reference first" is excluded for this test-only round.

## 6. Architecture checkpoint (export pipeline, D-29z240): round-222 additions (D-29z248)
- **C-R222-01:** the offline render of the legacy WAV path is not bit-deterministic. The hypothesis is float summation order. C found no dither and no `Math.random` in the path.
- **GATE222-S1:** the closed legacy `ExportDialog` re-renders on every playback tick, because the `StudioContext` value includes `currentTime` (`StudioContext.tsx:1665`, a protected file).

The request is still non-blocking. Still pending with root:
- D-29z195;
- `b-round-203/205-checkpoint-request.md`;
- `b-round-215-root-request-l28.md`;
- `b-round-220-root-request-vite.md`.

## 7. For Saba (`awaiting_user`, unchanged)
- GATE220-S3 / GATE221-S2: stale ffmpeg guidance in `.claude`, `.codex`, CLAUDE.md and AGENTS.md (b-round-221 §8).
- SABA-Q-FFMPEG-FILENAME, SABA-Q-LAME-LGPL.
- The retro-200/215 proposals.

## 8. Files written by B
- `tasks/round-222.md`: a copy of the round-222 task (`cmp` OK, nothing deleted).
- `current-task.md`: round 223.
- `b-round-222-r223-tree-sha256.txt` (1,065; `sha256sum -c` rc 0), `-grants.txt` (7), `-new-files.txt` (3; none exist yet), `-granted-start-sha256.txt` and `-root-files-start-sha256.txt`.
- `b-round-222/`:
  - backups (`backlog-before.json`, `feature-status-before.md`, `lessons-before.md`, `b-next-before.json`, `regression-last-before.json`, `current-task-before.md`);
  - `git-status-at-planning.txt` (empty);
  - `baseline-perf-run.log` and `baseline-results/`;
  - `scripts/compare-det.py` and `scripts/equiv-check.py`;
  - `backlog-update.py`.
- `backlog.json`, version 208:
  - round 222 closed and round 223 added;
  - 4 grant entries;
  - findings ruled;
  - +6 deferred Lows;
  - the HR-LEGACY-STUBBED amendment;
  - stage b added, with `execution_order_d29z244`;
  - `consults_round_223`;
  - the checkpoint additions;
  - REGRESSION `scope_additions` amended and extended;
  - D-29z243…249.
- `feature-status.md`: round 222 marked მზადაა, a round-223 line added, and the STUDIO-PERFORMANCE row and deferred count updated.
- `b-next.json`.

Unchanged:
- `regression-last.json` (not due);
- `lessons.md` (no new failure class: C-R222-02 is a single quote slip, already covered by "each point has a source");
- `context/*` (generated by root).

App source was not touched. The store `git status` is clean. The perf run used `/tmp/b222-base`.

## 9. Status
**CONTINUE.** Round 223 is dispatched. After it:
- PERF-HARNESS-SHARED-LIB-b, then PERF-2…15, PERF-COMMIT-RESCHEDULE and PERF-DRAG-PREVIEW;
- SYS-1..3;
- STORE-2b..5;
- REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the gated and queued phase-2 / 2b / CMD / RECORDING entries;
- 351 deferred Lows.

REGRESSION is due on or after 2026-10-30, and RETRO at round 230 or at the end of the stage. Nothing needs outside input to proceed.

**Commit readiness:** round 222 is published. Round 223 becomes commit-ready after C PASS and the root gate.
