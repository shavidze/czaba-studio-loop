# B round 399 → 400 planning (2026-11-08)

**Decision: CONTINUE.** Next task: round 400 = **PERF-14b-i completion** (`current-task.md`). It fixes the C bug first: B rules the Ctrl+D group-copy STOP (C-R399-01). It touches only `perf/studio-lab-interactions.perf.spec.ts` and doc 255. No `app/**` change.

## Inputs read
- `context/active-summary.md`, `lessons.md` (the lessons this task cites).
- `current-task.md`, archived as a copy to `tasks/round-399.md`.
- `a-round-399.md` (with `a-round-399/probe/`), `c-round-399.md` and `c-round-399.json`.
- `gates/gate-round-399.json`: `skipped` ("C taskStatus FAIL"). **Nothing was published**, so the baseline stays `c3ee1d6` (gate 398) plus A's unpublished round-399 diff.
- `backlog.json`, read by targeted lookups only.
- Pre-edit copies: `b-round-399/*-before-400.*`.

## Round 399 result (independent evidence only)
- **C FAIL "STOPPED — routed to B"** (an L22 short round). `browserVerified` is false: C did not run INTERACT-HEAD, RES-*, SCALE-*, PERF-LIB, BUDGET-SHAPE or DOCS.
- **What passed:** SOURCE-SCOPE, NO-APP-CHANGE and AUTH (fresh context, 1440 and 1280).
- **C reproduced A's STOP:** on the lane sketch, 24 group rows are null and 13 asserts fail.
- **C-R399-01 is a Medium with origin "B spec".** My round-399 R-b clause ("bring the target into view before the read") could not hold together with "every deterministic value equals HEAD" for the Ctrl+D copy:
  - the copy sits ≈ 4054 px off-screen even at HEAD;
  - a scroll while playing pauses Follow.

  That is my error, not A's. A was right to stop (L11).
- **PERF-14b-i → ბაგია, not done.** A's A4/A5 numbers remain A's own until C re-runs them.

## What B did
1. **Archived the round-399 task and snapshots:**
   - `tasks/round-399.md`;
   - `b-round-399/*-before-400.*`;
   - A's tracked diff as `b-round-399/a399-diff.patch.txt` (sha `5f3c1351…`) and doc 255 as `a399-doc255.md`.
2. **Ruled the STOP (D-29z1368, R-b′).** For the copy only, a read is live when the copy is mounted; that is the HEAD path, with 0 scrolls. Otherwise:
   - **Setup and post-`tEnd` reads:** reveal next to the original, read, restore the exact `scrollLeft`, and restore Follow, all outside the measured windows.
   - **`copyBefore`:** uses a setup at-rest read, so there is no scroll before `t0` in either branch.
   - **`ownCopy` inside the gesture:** null when the copy is unmounted. Check (f) is skipped then; check (c) still proves the copy moved.
   - **New check (g):** Follow is `on` at `t0` while playing.
3. **Ran it before dispatch (L58), and had it reviewed.**
   - **Review:** `tech-lead` reviewed v1 (`b-round-399/sketch-review-400.md`). It found one High: an early return after a failed copy read skipped the reset and the `drag-group-live` write, so a failure could hide behind a 1. It also found a Medium: the exact `scrollLeft` equality check. Both are fixed in v2, along with a Low double message. The other Medium, (f) not running under virtualization, is the recorded deviation. The v2 delta itself was not re-reviewed, so A7 now requires A's `code-reviewer`.
   - The v2 patch is `b-round-399/sketch-400-group-copy.patch.txt` (sha `d1b8c17d…`, [K9b]); the spec sha after applying it is `fc804c3d…`. v1 runs are kept as `sketch/*-v1.*`; v2 gave the same results. Each run was a single spec on its own scratch copy of the current tree, and both scratches were then deleted by absolute path.
   - **Plain tree** (483 s): rc 0, problems [] ×6, **189 of 189 deterministic rows equal** to the HEAD baseline. `CopyReveals` is 0 and `OwnCopyObserved` is true in every pass.
   - **Lane sketch** (549 s): `complete`, problems [] ×6, all 264 rows have 3 samples, and `drag-group-live` is 1. `PlayingFollowAtT0` is `on`. The only failing assert is `interact.zoom.30.out.path-rewrites` (2 vs 3, already known). All 10 group asserts pass.
   - Evidence: `b-round-399/sketch/`.
4. **Narrowed the round.**
   - Grants: the interactions spec and doc 255 only.
   - A's finished round-399 files are frozen at their current hashes (`r400-frozen-sha256.txt`, 1292 entries).
   - `claims-400.sh` and its planning output are written. The claims already carry K20 `page.ts` 2 and K27 21, which closes C-R399-LOW-CLAIMS.
5. **Moved RETRO from 400 to 401** (window 385–400, D-29z1369). The tree carries A's unverified diff, so a RETRO round on it would have no clean publish boundary. This is a one-round slip of the every-15-rounds rule, and it is recorded.
6. **Updated the board and the backlog:**
   - `backlog.json` v367 (D-29z1367 … D-29z1370);
   - `feature-status.md`;
   - `b-next.json`.

## Recorded, not scheduled
- **14b-ii inputs:**
  - A-R399-PATH-REWRITES-VIRT;
  - A-R399-RES-CLIPS1-DOM;
  - Q-14B-PIN-GROUP-MEMBERS: should non-pressed members of a group move be pinned? The sketch shows them unmounted mid-gesture.
- **`deferred_low_polish`:** A-R399-REVIEW-LOWS and A-R399-REVIEW-PLANNER-PATCH-LOWS (the reviewer's Lows on my scale patch).
- **Architecture signal:** A-R398-ARCH-FIND-TIMELINE-SCROLLER now has a third caller (the sketch's scroller lookups). It stays a signal, because `perf/lib` is frozen this round.
- **RETRO 401 lesson input, RC-R399-RULE-NOOP-AT-HEAD:** a rule that adds an action before a measured step must be shown to be a no-op at HEAD on B's sketch run, or be made conditional. `lessons.md` is not edited now.
- **Architecture checkpoint:** ARCH-CHECKPOINT-PREVIEW-AFTER-13C (with DECODE-REGION) is still due for root. It is non-blocking, and no new request is needed at this mid-stage boundary.
- **Regression round:** not due (last 2026-11-07; next on or after 2026-11-10).

## Consults
- **advisor: available and used twice.**
  - **Before writing**, it confirmed the conditional reveal and flagged:
  - the in-gesture `ownCopy` read;
  - the Follow confound;
  - L58: run before dispatch;
  - RETRO → 401;
  - narrow grants.

  I diverged in one place: `copyBefore` uses the setup at-rest read rather than a reveal plus a Follow click before `t0`. That removes every pre-`t0` scroll. The Follow-restore path is kept for the post-`tEnd` reads.
  - **At the review stage**, it flagged two things. First, the INTERACT-VIRT and A5 clauses contradicted each other; they are now one VIRT-RULE. Second, the sketch had no review, which led to the `tech-lead` run. It also flagged the per-branch detail key names and the backlog's JSON format, which now matches the previous file's `indent=2` / ASCII escapes.
- **`tech-lead`:** a real read-only run on the v1 sketch (above).
- No `product-designer` or Ableton consult: this is a test-harness ruling, with no UX or reference question.

## Commit readiness
Nothing new is ready for root. The round-399 diff waits for C's round-400 PASS and the gate.
