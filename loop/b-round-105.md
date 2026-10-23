# B — Round 105 result → Round 106 plan (D-29z71)

Planner: B · 2026-10-23 (~09:00–09:20 UTC) · Advisor: available and used (before the plan was fixed).

## Inputs read
- Read: `context/active-summary.md`, `current-task.md` (round 105, archived unchanged as `tasks/round-105.md`), `a-round-105.md`, `c-round-105.md` / `.json`, `gates/gate-round-105.json`, `gates/round-105/review.md`, `env-status.json`, `regression-last.json`.
- Looked up specific backlog IDs only (by grep).
- Plan: the D-29z70 record.
- `root-pre-push-review.md` and `publication-checkpoint.json` have no new item for this round.
- Gate 105 status is `blocked`, not `published`, so the baseline HEAD stays `3b6178b` (last publication, round 103).

## Round 105 outcome (evidence only)
- **C: PASS**, `browserVerified=true`, `realVerified=true`.
  - Every acceptance row passed.
  - The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud).
  - One Low finding: C-R105-01 (doc 092 l.16).
- **Gate 105: BLOCKED** (`COMMIT: BLOCK`, 6/10).
  - **#1 Medium:** an arrow key held at a boundary re-announces the same refusal on every auto-repeat.
  - **#2 Low:** the doc 092 changed-files list is stale.
  - It also gave an Architecture note.
- **Backlog changes:**
  - A-R104-REPEAT-DRAG and GATE104-S3 → `c_pass round 105, NOT published`.
  - GATE96-S2 and GATE103-S5 stay `c_pass`, unpublished.
  - **Nothing became "მზადაა"**, because nothing was published.
  - New entries: GATE105-S1 (Medium), C-R105-01, GATE105-S2, A-R105-REVIEW-2 (Lows batch), and ARCH-R105-STATUS-INTENT (a signal, added to checkpoint addendum (q); not scheduled).

## Round 106 decision
**Scope: GATE105-S1 + C-R105-01 + GATE105-S2.** That is one bug class and its doc, with one owner.

**The sweep.**
- The gate reviewer said its own sweep was partial, so B read every keydown handler in `app/components/arrangement` and the workspace `handleKeyDown`.
- **Five repeat-reachable refusal paths:**
  - clip nudge, Snap off, single clip and group;
  - clip nudge, Snap on, time start;
  - loop brace step;
  - marker flag nudge (time start and conflict);
  - Ctrl/Option+Arrow marker step end.
- **One more path of the same class:** a held Enter in the detail panel range and Clip Gain inputs.
- The safe paths are listed in the task.

**The rule.**
- On `event.repeat`, a refusal is dispatched only if its text differs from the current status. The action itself still repeats.
- A deliberate press always announces.
- **Mechanism:**
  - in the provider, the updater form, through the reducer's existing function branch;
  - in components, `!event.repeat || status !== MESSAGE`.

**Why not the obvious alternatives:**
- **Skip every repeat refusal:** this was B's first draft, corrected before dispatch. It would announce nothing when a hold first reaches the boundary, which `3b6178b` announced once. Mutation k9 and SK7 pin this.
- **Text-merge in the reducer:** forbidden, because it breaks GATE96-S2. Mutation k8 pins this.
- **Widen the public `setStatus` type:** that would break frozen test fakes under `strictFunctionTypes`. This is an inference from TS function-property variance, not compiled.
- **A provider-global keydown listener:** that adds another hidden ref read at render time.

**B probe** (`b-round-105/probe/`): Playwright `keyboard.down` held produces in-page `repeat: true`, and `press` produces `false`. The C rows depend on this fact.

**Uncertain contract, and the smallest honest choice:** the detail panel's held Enter skips the repeat entirely, as the workspace Enter and library Enter already do. This is the existing project convention, not a new behaviour.

**Size and ownership.**
- 5 code files, each narrow, plus 1 owned test file and doc 092.
- Expected state: 6 M + 4 ??. Frozen list: 535 entries. Snapshots are in `b-round-105-r106-snapshots/`.
- `ArrangementContext.tsx` and `StudioWorkspace.tsx` have been touched again in rounds 104–106. This is not a new structural risk beyond ARCH-R105-STATUS-INTENT, which has already been sent to the pending checkpoint, so B makes no new frontend-architect request.

**Regression round:** not due yet. It is 2 days since 2026-10-21; **the next B planning on or after 2026-10-24 is the regression round.**

**Publication:** rounds 104–106 are one change set. Root publishes only after C passes round 106 and the gate reviewer approves.

## Ableton
Not applicable. This is CZABA's own accessibility rule for the browser status line, and no Ableton claim is made.

## Files written by B
- `tasks/round-105.md` (a copy)
- `current-task.md` (round 106)
- `backlog.json` (v104)
- `feature-status.md`
- `docs/technical/studio-real-workspace/plan.md` (D-29z71)
- `b-round-91-checkpoint-request.md` (addendum q)
- `b-round-105-r106-tree-sha256.txt`, `b-round-105-r106-snapshots/`, `b-round-105/probe/`
- this file and `b-next.json`
- backups `b-round-105-*-before.*`

No app source was modified.
