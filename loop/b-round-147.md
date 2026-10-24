# B round 147 → 148 planning (D-29z113)

Date: 2026-10-24 · Author: B · Advisor: available and used (once before writing, once before finishing).

## Inputs read
- `current-task.md` (round 147). It is archived as `tasks/round-147.md`, an identical copy (sha256 `840d750d…c658`).
- `a-round-147.md`, `c-round-147.md`, `c-round-147.json`.
- `gates/gate-round-147.json`: **published**, commit `34ce5513e6ff9bb337389333401643c0ef197cc0` on both remotes. This is the baseline HEAD for round 148.
- `gates/round-147/review.md`: 9/10, 5 Low suggestions, 1 Architecture note.
- From `backlog.json`, only the IDs needed (python lookups). In `plan.md`, only D-29z110…D-29z112.
- `regression-last.json` (round 122, 2026-10-24): the next regression is due on or after 2026-10-27, so it is not due now.
- `user-review/ableton-decisions.md` and `design-ux-decisions.md`: still absent (checked this planning).
- Store HEAD is `34ce551` and `git status --short` is empty. The dev server returns 200.

## Evidence-based backlog updates (backlog v140; only from C round 147 PASS + gate 147)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-0.5b | in_progress | **done / c_pass** (published 34ce551) | `c-round-147.json`: 12 rows PASS, browserVerified, 0 bugs |
| GATE146-S1 (doc 119) | scheduled r147 | closed | C AN-REVIEW |
| GATE147-S1 (doc 120 status) | — | scheduled r148 (cheap, owned) | review #1 |
| GATE147-S4 (vacuous Georgian negatives) | — | scheduled r148 | review #4; A gap 1; C note 1 |
| GATE141-S2 / S3 (SSR spy, ST40) | V-0.5 forward constraint | scheduled r148 | gate-141 review |
| GATE147-S2 / S3 / S5, A-R147-REVIEW-L2 | — | `deferred_low_polish` (212 entries) | review #2, #3, #5; A review L2 |
| C-R147 note 3 (libbase had no rest nodes) | — | applied (dockbase148 has `measureRest`) | C note 3 |

- The `blocked` rows (PURCHASED-STATUS and the fake-Bearer 403) stay open evidence for a backend-enabled check. They are not a reason to call the round unverified.
- **Architecture notes are recorded as signals and not scheduled:**
  - GATE147-SIGNAL3 (tests importing constants);
  - A-R147-ARCH-NOTE (keep `strings.ts` import-free).

  Both are added to the checkpoint request as questions (d) and (e).

## Round 148 decision: V-0.5c in one round (closes V-0)
- **Measured at 34ce551** with the ST47 comment-stripping rule:
  - `ArrangementVideoDock.tsx`: 18 lines;
  - `studio-lab.tsx`: 1 line;
  - the demo ledger: 9 lines (user content, kept);
  - the other 65 walked files and `ArrangementContext.tsx`: 0.

  The rest of `app/` has only trailing comments, so the scope is not widened.
- **Smallest honest choices:**
  - **New object `studioVideoDockStrings`** (17 keys), following the one-object-per-component pattern. The name clash risk goes to checkpoint question (e).
  - **`lang`:** `lang="en"` already exists at `root.tsx:44`, a forbidden file. There is no change; it becomes a C check.
  - **SSR assertion:** B's probe (`b-round-147/probe/`, a vitest config outside `store/`) showed **0** `console.error` calls on the SSR render, so the new assertion is safe.
  - **ST51** is a directory walk with a ≥ 60-file guard, and the m113 probe file proves that a new file is caught.
  - **RV-1 re-capture** is C's last row before G148-3. It is a capture plus determinism check, valid only if every other row passes and gate 148 publishes that tree.
- **Terms.** The Live 12 manual was captured with curl on 2026-10-24 into `b-round-147/live/` (ch. 6 Arrangement View, ch. 28 Working with Video):
  - `Overview`: confirmed (§6.1);
  - Video Window and gap behaviour: deliberate differences (§28.2.2, §28.2.2.1);
  - `compact view`: glossary D-29z102 R4;
  - `playFailed` mirrors `probeFailed`;
  - label-in-name: `Return` ⊂ `Return the video to the compact view`.
- **Layout baseline captured by B** at 34ce551 before A runs:
  - Tool: `b-round-147/tools/dockbase148.cjs`, testid/structure only, with `measureRest`.
  - Output: `b-round-147/out/dockbase148-{1440,1280}.json` plus `shots/`.
  - States: empty, video, gap, expanded, returned. There were 0 console errors.
  - A whole-body Georgian pre-scan is in `out/bodyscan-34ce551-1440.json`: only ledger content and the dock strings.
- **Grants:**
  - `b-round-147-r148-grants.txt` (9) + `b-round-147-r148-new-files.txt` (2);
  - the temporary m113 path `app/lib/arrangement/zz-rv4-probe.ts`;
  - frozen list 957 (`b-round-147-r148-tree-sha256.txt`, OK);
  - start hashes and copies in `b-round-147/r148-granted-start/` (OK).

## Not scheduled now (kept, not deferred without authorization)
- **After V-0:**
  - the frontend-architect checkpoint (root, at the V-0 boundary);
  - V-1…V-3 and M1/M3/M4;
  - T12-ADVANCED;
  - the deferred-Low polish pass (212 entries).
- **Waiting on others:**
  - Tech Lead manual checks;
  - SRW-21 (`deferred_user`);
  - PROD-SSR-NUL / PROD-MP3 (gate);
  - backend-only evidence;
  - ABL-R / DUX-R recommendations (`awaiting_user`);
  - the phase-2 go-ahead.

## Readiness
- Gate 147 already published round 147. Nothing new is commit-ready until C round 148 passes.
- **B-owned files changed this planning:**
  - `current-task.md`, `tasks/round-147.md` (copy), `b-round-147.md`, `b-next.json`;
  - `backlog.json` (v140), `feature-status.md`;
  - `b-round-136-checkpoint-request.md` (round-147 addendum);
  - `docs/technical/studio-real-workspace/plan.md` (D-29z113 + ownership line);
  - the `b-round-147-*` grant/frozen/start files and `b-round-147/` (tools, out, shots, live, probe, start copies).
- Before-copies: `b-round-147-*-before`. **No store file was touched** (`git status --short` empty after the probes).
