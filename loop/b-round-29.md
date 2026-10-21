# B — Round 29 result → Round 30 dispatch (D-29u)

Author: B · Date: 2026-10-12 · Decision: **CONTINUE**

## 1. Session record (honest)

- **Archive:** `tasks/round-29.md` did not exist. B copied the dispatched round-29 `current-task.md` to it, verified it with `cmp`, and did not overwrite it.
- **Backups before any edit:**
  - `backlog.json.bak-before-b-round-29`;
  - `feature-status.before-b-round-29.md`;
  - `b-scripts/b-next.before-r30.json`;
  - `b-scripts/plan.before-r30.md`.
- **Write order:**
  1. backlog v31 (`b-scripts/b-round-29-backlog.cjs`, plus a one-off fix that restored SRW-09's historical `C-R5-04` record, which the first pass had emptied);
  2. `plan.md` D-29u (`b-scripts/b-round-29-plan.cjs`; CRLF verified: 898 CRLF, 0 bare LF/CR, 4 `D-29u` hits, and only the 6 intended lines changed);
  3. `current-task.md`;
  4. checkpoint `b-round-29-checkpoint.md`;
  5. `feature-status.md` (`b-scripts/feature-status-r30.cjs`);
  6. this file;
  7. `b-next.json`.
- **Advisor (Fable):** available. It was called once after orientation and before writing. It is also called after these files are durable (§8).
  - **Advice applied:**
    - SRW-24/FB-02/SRW-09 → "verifying", not "ready";
    - probe the frozen detail-panel assertions and grant only those lines;
    - a `clipGains` options map so `schedule.ts`/`loop.ts` stay frozen;
    - `scheduleKey` must ignore gain;
    - the handle updates every live source and its stored map;
    - `gainDb` absent unless non-zero, rounded to 0.1 dB;
    - the clipboard carries the gain;
    - the R13-M1 oracle at Master −12 dB;
    - the Ableton bounds are unconfirmed.
  - **Advice not followed:** the advisor suggested mirroring the Master fader preview/gesture machinery. B chose a numeric field + reset instead (§4.3). B records this as a deliberate divergence, not an oversight.

## 2. Independent checks by B (2026-10-12)

| Check | Result |
|---|---|
| HEAD | `c5ed47b` |
| `git status --short` | 67 lines, `cmp`-identical to `c-round-29/gates/git-status-end.txt` (copied to `b-round-29-git-status.txt`) |
| `sha256sum -c b-round-28-tree-sha256.txt` | 72 OK |
| New frozen list `b-round-29-tree-sha256.txt` | 69 OK (72 − types/arrangement.ts, model.ts, graph.client.ts, ArrangementDetailPanel.tsx, detail-panel-polish.test.tsx + all-lane-clipboard.test.tsx, doc 034) |
| Snapshots `b-round-29-snapshots/` | 8 files (shas in `current-task.md`) |
| Dev server | `curl /studio-lab` → **200** |
| `node.exe` | **12** |
| tsc probe (scratch `b-scratch-r30/`, junction removed with `cmd rmdir`; `store/node_modules` 618 entries before and after) | optional `ArrangementClip.gainDb` + `ScheduleHandle.setClipGain` + optional `clipGains` → tsc 0 |
| Frozen detail-panel probe | a fourth column with label + input → `detail-panel-polish.test.tsx` 2 failed (the two "labels … aria-labels" tests); with the two-query amendment → 16/16; `detail-panel.test.tsx` 24/24 |
| Frozen shape constraints read | `schedule.test.ts` and `loop.test.ts` pin `ScheduledClip` with `toEqual`; `graph.test.ts` l.373 counts gain nodes and l.384–390 scans the `renderArrangementWav` source; `clipboard.test.ts` l.133 pins the clipboard with `toEqual`; `scheduleKey` = `JSON.stringify([clips, loop])` |
| Ableton source | Live 12 manual fetched live with gstack `/browse` at 17:23 +04:00 → `b-round-29/` (clip view §8.4.7, §8.13; arrangement view Waveform Vertical Zoom; mixing chapter). No gain bounds, reset or edit-carry statements are in the text |

B did not re-run the live round-29 behaviour; the status changes rest only on C's evidence.

## 3. Round 29 result (C)

**PASS** on every UI-reachable ID:
- R29-PA (export 0 LSB), R29-PB, R29-PC, R29-PD;
- R29-NO (zero-width, stopped and playing);
- R29-FT (geometry identical to round 28);
- R29-UR (PA, PC), R29-K, R29-R (including the owed empty-clipboard refusal), R29-S;
- R29-U (mutations a–g killed; red-first 8/14 reproduced), R29-Doc;
- G29-1..3 (vitest 1133/1133; Biome 218 + 1).

**Not run, by design:** R29-NE and the 40–41 non-zero no-op. Every UI range is clip-bounded, so a "silent window" cannot be created. B accepts C's reachability evidence. These are code paths covered by provider tests and mutation (d). They are **not PASS**, and they are not a behaviour bug.

**Closed:**
- C-R28-01, C-R28-02, A-R28-REVIEW-4;
- C-R27-02, by the pre-registered D-29t rule (3/3 at 10 `node.exe`).

## 4. Decisions (D-29u)

1. **SRW-24, SRW-09, FB-02 → მოწმდება** (all C IDs passed; R28-T is still Tech Lead). They are not მზადაა while a Tech Lead manual check remains. The board reserves "მოწმდება" for that case.
2. **New Low items:**
   - A-R29-REVIEW-1 (the pending fader flush shows the fader label in Undo after a no-op) → stage 4, round 31, with the fader UX;
   - DOC034-UNREACHABLE-NOTE → the next round that owns doc 034, or the final docs pass. Doc 034 is frozen in round 30 to keep the round to one feature.
3. **Round 30 = SRW-13 stage 3, FB-04 Clip Gain** (R13-M1). There is no open C bug that needs an A round.
   - **Data:** `gainDb` is optional and present only when non-zero (history uses JSON equality; the frozen fixtures have no field). The range is −60…+24 dB, at 0.1 dB.
   - **Graph:** the `clipGains` option + `setClipGain`, with no new node and no reschedule. The stored map serves loop appends. `ScheduledClip`, `schedule.ts` and `loop.ts` stay frozen.
   - **UI:** one new detail-panel column. It is enabled for a single **audio** clip only; groups, video clips and an empty selection get a reason.
   - **Clipboard** carries the gain. Split/duplicate/trim/move/Delete Time keep it by spread.
   - **Frozen-test amendment:** exactly the two probed queries in `detail-panel-polish.test.tsx`.
4. **Smallest honest UI (an uncertain contract, so B records its rationale):** a numeric dB field committed on Enter or blur, plus a `0 dB` reset.
   - FB-04 asks for a per-clip gain that is separate from the track Volume. R13-M1 asks for +6 dB on one clip.
   - A field gives exactly one history entry per commit without a third preview/gesture state machine in a 2 600-line context.
   - The slider, live drag preview, Shift fine drag and double-click reset are in the user's own T12 spec (T12.8/T12.9). The same holds for multi-clip relative editing (T12.7) and the waveform following the gain (T12.19). All of them stay queued in T12, **not** deferred FB-04 scope.
   - Ableton's Gain **slider** (§8.4.7) is recorded as a conscious difference.
5. **The R13-M1 oracle is pre-registered at Master −12 dB.** At Master 0, the round-29 music peak of 0.574 would clamp at +6 dB and falsify the ratio. The overload alert at Master 0 is expected information, not a bug.
6. **Ableton (two verdicts):**
   - Confirmed: per-clip dB gain (§8.4.7); the multi-selection range display (§8.4.7, §8.13; CZABA single-clip only = conscious difference); waveform zoom ≠ gain.
   - Unconfirmed: the gain bounds, reset, and carrying the gain through edits.
   - The clip-gain-before-track signal flow is **unconfirmed**: the T12 note's claim was not re-verified in the captured text. B does not claim "Live does it too" for any unconfirmed row.

## 5. Status changes (`feature-status.md`)

- FB-02, SRW-09, SRW-24 → **მოწმდება**.
- FB-04 → **მუშავდება**.
- SRW-13 stays **ბაგია** (C-R27-01), with stage 3 in progress.
- Bugs closed: C-R28-01, C-R28-02, A-R28-REVIEW-4, C-R27-02.
- Added: A-R29-REVIEW-1, DOC034-UNREACHABLE-NOTE, and Tech Lead **R30-T** (clip gain click/zipper and audibility with headphones).
- Nothing becomes **მზადაა** in this round.

## 6. Next task

`current-task.md`, round 30, built on the round-29 baseline.

**A owns:**
- `types/arrangement.ts`, `model.ts`, `graph.client.ts`, `clipboard.ts`;
- `ArrangementContext.tsx`, `ArrangementDetailPanel.tsx`;
- `StudioWorkspace.tsx` (one prop);
- `detail-panel-polish.test.tsx` (two queries);
- the new `clip-gain.test.tsx` (≥ 16 `it`);
- the new doc 035.

The expected end status is 69 lines.

**C checks:**
- R30-GE (export ±0.2 dB, the same-track clip ≤ 1 LSB);
- R30-GV/GL (no new source start; `setTargetAtTime` on that clip's node; loop appends; meter +6 ± 1 dB);
- R30-GH/GK/GD/GN/GUI/GC/K/R/S/U (mutations a–i)/Doc;
- G30-1..3;
- the Ableton two-verdict column.

## 7. Why not COMPLETE / BLOCKED

**Not COMPLETE:**
- FB-04..07 and FB-09..13 are not done (SRW-13 stages 3–4, SRW-14..20);
- SRW-21's adapter is not done;
- C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are open (Medium);
- the Tech Lead manual checks are outstanding;
- the full regression and the root check have not been run.

**Not BLOCKED:**
- nothing in round 30 needs external information, approval or credentials;
- the Tech Lead items (C-R23-01 grant/React 19, quiet Chrome, DEMO-SFX, SRW-21 route mount) block only themselves.

## 8. Root follow-ups carried

B opened `root-pre-push-review.md` (mtime 2026-10-07; verdict, §2 unfinished scope, §3 commit-scope rule, §4 findings) and `publication-checkpoint.json` (mtime 2026-10-09; keys incl. followupReview, scrollbar/library user requests, t12UserReaffirmation, finalCommitPushAuthorization, approvedWorkflow) again in this session. Neither has changed since B confirmed in round 28 that the carried list is complete. They are carried unchanged in `current-task.md` §4.8 and `feature-status.md` §6:
- SRW-21's loader;
- Lenis;
- portable paths;
- the export hard-clip;
- the final commit/push, with the tree at 67 lines;
- `Modal.tsx` focus;
- GA scroll;
- the foreign agent files;
- the fake Bearer → 500;
- the CDP allowlist;
- the missing charset;
- the publication-checkpoint items.

**New root note:** C round 29's invalid first mutation attempt made `npx` fetch vitest 5.0.4 into the npm cache. The project, lockfile and store are unchanged.

## 9. Final advisor call

See the addendum below, written after the call.

### Addendum — final advisor call (2026-10-12, after every file was durable)

- **Verdict:** the decision (CONTINUE) and the deliverables hold. The advisor withdrew its earlier "mirror the Master fader" advice: with a commit-on-Enter/blur field there is no pending preview, so B's divergence (§4.4) is correct.
- **Applied to `current-task.md`:**
  1. A's §5 focused run now includes `master-ui`, `meter-ui` and `track-meter-ui`. `syncPlayback` reaches `handle.setClipGain` in those fake-audio provider tests, and tsc cannot prove that the fake handles implement the method at runtime.
  2. **Selection change with uncommitted text is now a B contract, not A's choice.** The detail content remounts on every selection change (`key={selection?.clip.id …}`, l.664; frozen polish test l.301–305), so dirty text is discarded: there is no commit and no entry, and a blur during the unmount must not commit. The UI test and C's R30-GK check it.
  3. The `0 dB` reset runs the same gesture check first, so a later `false` always means "unchanged", never "refused". Tested and checked by C.
  4. A `JSON.stringify` replacer for `scheduleKey` is offered as an option.
- **Scratch:** `b-scratch-r30/` was deleted after the probes. Its `node_modules` junction had already been removed with `cmd rmdir`, and `store/node_modules` still has 618 entries.
