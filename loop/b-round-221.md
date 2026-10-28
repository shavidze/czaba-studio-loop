# B round 221 → 222 planning (2026-10-28)

**Decision: CONTINUE.** Round 222 = **B-R220-LEGACY-EXPORT-NO-STEMS** (Medium). Decisions D-29z237…D-29z242.

## 1. Inputs read
- `context/active-summary.md` and `context/active-backlog.json` (via `b-next.json` and lookups by ID), `lessons.md`, `tasks/round-221.md` §5–§7.
- `a-round-221.md` (read directly: no STOP; the deviation on the signature is correct; its reviewer gave A-R221-REVIEW-L1 and an Architecture note, now recorded as signal ARCH-R221-LICENCE-TEST-READERS), `c-round-221.md` and `c-round-221.json`.
- `gates/gate-round-221.json`: **published**, commit `6dd45a1eb0f2…`, on both remotes. **The next baseline is that commit.**
- `gates/round-221/review.md` (COMMIT OK, 9/10, five suggestions), `env-status.json` (round 221, store 200) and `regression-last.json` (2026-10-27, round 199; due on or after 2026-10-30).
- Source: `ExportDialog.tsx`, the `ExportDialog` mount at `studio.$productId.tsx` l.311, the stem rebuilds in `StudioContext.tsx`, and `Modal.tsx`.
- Live 12 manual §5.1.3.1, the whole page.

## 2. Backlog updated only from independent evidence
**Round 221: C PASS.**
- 13 rows passed; `browserVerified` and `realVerified` are true.
- The 5 browser rows ran at both viewports.
- LEGACY-OWNERSHIP-221 is backend-blocked. That does not make the round unverified.
- The gate verify passed: 202 files, licence test 67/67.

So:
- **PERF-16b-ii → done.** PERF-16 is complete (16a, 16b-i and 16b-ii).
- **GATE220-S1** is closed by LEGACY-UI-STUBBED-221.
- **C-R221-01** (Low) is ruled under D-29z239. DEPS-221 meant "no installed `@ffmpeg` package", and C measured that: `npm ls` is empty, `require.resolve` fails, and the lock has 0 entries. The empty directory is an artifact of root's uninstall. It is gitignored and not recreated by `npm ci`. Closed as an environment artifact; an `rmdir` by root is optional.
- **A's Architecture note** (`a-round-221.md` l.70): the `third-party-licenses.test.ts` JSON readers keep gaining near-duplicates. It is recorded as signal ARCH-R221-LICENCE-TEST-READERS, linked to GATE221-S3. Not scheduled.
- **Gate-221 review:**
  - S1 is the same finding as VITE-EXCLUDE-STALE (with root).
  - S2 is the same as GATE220-S3. It awaits Saba; the gate rates it Medium for agent tooling (§8).
  - S3, S4 and S5 go to `deferred_low_polish`. S5 is the same fact as A-R221-REVIEW-L1, so they share one entry.
  - New Low: LEGACY-EXPORTDIALOG-A11Y-WARNINGS, the 10 pre-existing Biome warnings that are outside the grant.
  - `deferred_low_polish`: 341 → 345.
- No Critical, High or Medium finding is open except B-R220-LEGACY-EXPORT-NO-STEMS, which is now dispatched. The open_tech_lead items stay on the Tech Lead list.

## 3. Why this round
- **The outcome table was fixed in advance** (`tasks/round-221.md` §6, row 1): C PASS and planning before 2026-10-30. Today is 2026-10-28, so REGRESSION is not yet due.
- **Bug-first policy.** This is the only open Medium, and it breaks the core purchased-Studio action: Export is disabled on open.
- **One bug, one component.** The fix lives in the dialog. The protected route and the frozen context are not touched. A `key` prop in the route was rejected because the route is protected.

## 4. Contract and its rationale (D-29z237)
The selection follows the **set** of stem IDs. Same-ID rebuilds (mute, solo, volume, trim, loading), order-only changes and close/reopen keep the user's toggles.

Rejected:
- a reset on every open, which discards a deliberate deselection;
- a `useEffect` on `state.stems` identity, which wipes the toggles on every mute click: `StudioContext` rebuilds the array on l.382, 899, 965, 1007, 1047 and 1055. ES3 and PERSIST-222 guard this.

**Scratch proof** (`b-round-221/scratch-run.txt`, `scratch-fix.diff`, `scratch-test-sketch.tsx`): in `/tmp` on `git archive 6dd45a1`, the sketched ES1 and ES5 are red on the start copy and turn green with a 7-line render-time key adjustment (tsc 0). The repo has no jest-dom; the task says so.

## 5. Reference (D-29z242)
Source: the Live 12 manual, §5.1.3.1 "Selection Options".
- **Fact:** the Rendered Track options are Main, All Individual Tracks, Selected Tracks Only, or one named track. Main is the one "most users will choose".
- **Not stated anywhere on the page:** the default selection, and whether settings are remembered. They are recorded as unconfirmed and never claimed.
- **CZABA:** all stems ticked is the full mix, the closest match to Main. Choosing a subset inside the dialog is recorded as better than Live's "selected before opening".

## 6. Consults
- **Advisor (before writing).** Adopted in full:
  - the narrow grant and the ruled test location;
  - the ID-set trigger, with the same-ID regression row;
  - the prescribed mock and L27;
  - honest "not stated" Reference rows;
  - measurable browser rows (RMS against round 221, a spectral check of the subset);
  - a warm-up on the purchased route;
  - the checkpoint request;
  - the rulings;
  - an archive before overwriting.
- **Project subagents:** none consulted. This is a one-component state bug with a fixed contract and no UI, copy or interaction change, and the Ableton reference was read directly from the manual.

## 7. Architecture checkpoint
- `b-round-221-checkpoint-request.md` (D-29z240) covers the export pipeline at the PERF-16 boundary:
  - a neutral encoder with a per-call cancel (ARCH-R218-ENCODER-CANCEL-SCOPE, ARCH-R220-ENCODER-NEUTRAL-MODULE, gate-220 S2);
  - one WAV path;
  - how long the legacy facade lives, against SRW-21.
- It is **non-blocking**. Still pending with root: D-29z195 and `b-round-203/205-checkpoint-request.md`.

## 8. For Saba (`awaiting_user`, re-raised)
- **GATE220-S3 / GATE221-S2.** These still teach `@ffmpeg`/unpkg:
  - `.claude/primitives/AUDIO_ARCHITECTURE.md:174`;
  - `.claude/skills/ffmpeg-wasm/SKILL.md` (and its `.agents` mirror);
  - `.claude/agents/performance-optimizer.md:26` and `studio-specialist.md:98` (and their `.codex` twins);
  - the CLAUDE.md and AGENTS.md skill row.

  The gate-221 reviewer rates this Medium for agent tooling. An agent that follows them would reintroduce the removed package; the licence test would catch it, but only after the edit. Agents may not edit these files. **May the loop update them to the shared LAME encoder, or will you?**
- **Earlier questions, unchanged:** SABA-Q-FFMPEG-FILENAME, SABA-Q-LAME-LGPL, and the retro-200/215 proposals.

## 9. Files written by B
- `tasks/round-221.md`: a copy of the round-221 task (`cmp` OK, nothing deleted).
- `current-task.md`: round 222.
- `b-round-221-checkpoint-request.md`.
- `b-round-221-r222-tree-sha256.txt` (1,069; `sha256sum -c` rc 0), `b-round-221-r222-grants.txt` (1), `b-round-221-r222-new-files.txt` (2), `b-round-221-r222-granted-start-sha256.txt` and `b-round-221-r222-root-files-start-sha256.txt`.
- `b-round-221/`:
  - backups (`backlog-before.json`, `feature-status-before.md`, `lessons-before.md`, `b-next-before.json`, `current-task-before.md`, `regression-last-before.json`);
  - `git-status-at-planning.txt` (empty);
  - `scratch-run.txt`, `scratch-fix.diff` and `scratch-test-sketch.tsx`;
  - `backlog-update.py`.
- `backlog.json`, version 207:
  - round 221 closed and round 222 added;
  - 2 narrow grants;
  - findings updated;
  - +4 deferred Lows;
  - the HR-MP3-WARMUP amendment;
  - the PERF-16 status set to done;
  - `consults_round_222`;
  - the checkpoint request entry;
  - regression `scope_additions` (10/10 expected after round 222);
  - D-29z237…242.
- `feature-status.md`: round 221 marked მზადაა, a round 222 line added, and the STUDIO-PERFORMANCE row and deferred count updated.
- `b-next.json`.

Unchanged:
- `regression-last.json` (not due);
- `lessons.md` (no new failure class);
- `context/*` (generated by root's tooling).

App source was not touched: `git status` at the store is clean, and the scratch work stayed in `/tmp/b221-scratch`.

## 10. Status
**CONTINUE.** The Medium is dispatched. After it come:
- the rest of STUDIO-PERFORMANCE (PERF-HARNESS-SHARED-LIB, PERF-2…15 and the others);
- SYS-1..3;
- STORE-2b..5;
- REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the phase-2b / CMD / RECORDING entries;
- 345 deferred Lows.

Nothing needs outside input to proceed.

**Commit readiness:** round 221 is published. Round 222 becomes commit-ready after C PASS and the root gate.
