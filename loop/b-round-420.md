# B round 420 → 421 planning (2026-11-09)

**Decision: CONTINUE.** Next is round 421, SYS-R418-PREVIEW-LIFECYCLE (`current-task.md`).

**Advisor:** available and used twice, after orientation and before close. **Consults:** `tech-lead`, which reviewed the frozen sketch (`b-round-420/sketch-review.md`, verdict approve). No other consult was needed: this round has no user-visible change and no performance budget.

## 1. Round 420 (RETRO 420) is accepted (D-29z1467)
- **C PASS** (`c-round-420.json`): 11 rows passed; `browserVerified` and `realVerified` are true; there are 0 app bugs.
- **Browser rows** at 1440×900 and 1280×720 in real Chromium:
  - The auth guard holds: anonymous `/studio-lab` opens; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; the token API returns 401.
  - The Studio smoke passes: one clip added, Play/Stop, and the Export dialog opens and closes.
  - The screen and journey recapture matches B's numbers exactly.
- **Row 5 (CLAIMS) is partial,** because of two Lows with origin `environment` in B's claims script (see §2). C checked every underlying fact directly.
- **L57 check** on `c-round-420.json` is rc 0 (`b-round-420/l57-check-c420.txt`).
- **Gate 420:** `skipped` (no real changes), so **the baseline for 421 stays `6609dfa`**, which gate 419 published. `context/head-sha.txt` agrees.
- The task is archived as `tasks/round-420.md`, byte-identical to the task (K13).
- `retro_runs[420]` now records the C verdict. The next RETRO is round 435.

## 2. C's findings (D-29z1468): the whole class is fixed, not just these two
| Id | Sev / origin | Ruling |
|---|---|---|
| C-R420-CLAIMS-K22-ARCHIVE-AGAIN | Low / environment | The same class as C-R416. A per-script fix (D-29z1451) did not carry over to new scripts. Now **one shared tool**, `tools/find-ids.py`, looks up ids in the backlog and the archive. `claims-421.sh` K14 uses it, and the L56 clause says every claims script must. Closes on C round 421 row 1 |
| C-R420-CLAIMS-K8-K24-YOUTUBE-REQUEST-CONSUMED | Low / environment | A request file that root consumes is never a claims input (L56). K20 claims the AGREE note and the search result. `AGREE-STEM-LANES.md` row 5 was stale; it now cites `reference/youtube/STEM-LANES.md`, names B's picks #1–#4 (three official Ableton videos and one Drum Rack split) and asks root for their transcripts. Closes on C round 421 row 1 |

`lessons.md` stays at 60 lines. Only l.40 (L56) changed: its last clause was replaced. Diff: `b-round-420/lessons-diff.txt`.

## 3. Why SYS-R418-PREVIEW-LIFECYCLE now
- **REGRESSION-2026-11-10 is not due yet.** Today is 2026-11-09; it is due at the first planning on or after 2026-11-10, which will be the 421 → 422 planning.
- **The recorded order** (D-29z1466) puts SYS-R418 next in that case.
- **No Critical or High findings are open.** The open Mediums are root-only, manual or `awaiting_user`.
- **STEM-LANES still waits for Saba** (`AGREE-STEM-LANES.md`).

## 4. The sketch (L58 chain, all on sha `8d5fc47d…`)
**What changes:**
- The collection teardown calls `stopLibraryPreview` (the token bump on collection change and on unmount).
- `setStart` and `readTime` are added on the internal stream preview.
- The watchdog's tick read falls back to `armedAt`.
- The offset read is guarded.
- PC12 is retitled, and PL1–PL9 are added.

**Evidence:**

| Check | Result | Evidence |
|---|---|---|
| Mutants | 7 lines; each mutant turns exactly its rows red; 3 lock rows are named | `b-round-420/mutants/summary.txt` |
| Full suite | 264 files, 3951/3951 | `precheck-full.log` |
| Covering files | 14 files, 286/286 | `precheck-a2.log` |
| Loaded replicate | 49/49 | `precheck-loaded.log` |
| typecheck, lint, biome | all rc 0 | `precheck-*.log` |
| Browser, HEAD (:5173) vs sketch (:5174 from the scratch) | ALL EQUAL over 16 cells, including the new R11 (the preview keeps playing through Snap and zoom re-renders) | `probe/compare-head-vs-sketch.txt` |
| `tech-lead` review | approve; 5 Lows, each ruled by id | `sketch-review.md` |

**The one new user-observable rule:** a preview stops when the collection changes. It cannot be reached in `/studio-lab`, and it is recorded with its reason in D-29z1469. It is not a deviation from Live (Live has no equivalent), so it is not an L44 question.

**Claims:**
- planning output: `claims-421-planning-output.txt`, stderr 0 bytes;
- sketch output: `claims-421-sketch-output.txt`;
- diff: `claims-421-planning-vs-sketch.diff`;
- `l58-check` on the task: `L58 OK`.

The store tree was clean at the end of B's phase. All experiments ran in `/tmp/b420-scratch`, `/tmp/b420-mut` and `/tmp/b421-review`, and the scratch dev server on :5174 is stopped.

## 5. Architecture signals and checkpoints
- **A-420 had no architecture note** (a RETRO round).
- **The preview region keeps changing.** Rounds 393–395, 418 and 421 all changed `ArrangementContext.tsx`'s preview controller and `preview.client.ts`.
  - ARCH-CHECKPOINT-PREVIEW-AFTER-13C (`b-round-393/root-request-arch-checkpoint-preview.md`) is still unanswered, and its L46 default (SYS-R416, then this round) is now spent. After round 421 the preview Lows are all closed.
  - **Request to root (unchanged, bounded):** run the frontend-architect checkpoint on the preview controller when convenient. Should the preview token, the fallback set and the player move into one `useLibraryPreviewController` hook? It does not block anything.
- **ARCH-CHECKPOINT-STEM-LANES** is still requested of root (`b-round-419/root-request-arch-checkpoint-stem-lanes.md`).

## 6. Order after this round (D-29z1470)
1. **421:** SYS-R418-PREVIEW-LIFECYCLE.
2. **422:** REGRESSION-2026-11-10 (due). Its scope:
   - the items of rounds 391–401 and their `scope_additions`;
   - one short check for each item done in rounds 402–421, at both viewports;
   - `test:e2e:smoke`.
3. **STEM-LANES S1–S4** once Saba answers. Until then, SYS-1…3, then STORE-2b…5 (skip-while-waiting rule). STEM-LANES goes first as soon as the answer arrives.
4. REVIEW-RECOMMENDATIONS.
5. T12-ADVANCED.
6. Phase 2 (skip rule).

The next RETRO is round 435.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE.** Still open:
  - STEM-LANES;
  - SYS-1…3;
  - STORE-REDESIGN 2b–5;
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the phase-2 entries;
  - the deferred Lows, which must all be fixed before release;
  - SRW-21 (`deferred_user`);
  - the parked STUDIO-PERFORMANCE remainders.
- **Not BLOCKED.** Round 421 runs fully on the cloud runner and needs no backend.

## Files written by B in this planning
- `current-task.md` (round 421)
- `tasks/round-420.md` (archive)
- `b-next.json`
- `backlog.json` (v397, via `b-round-420/update-backlog.py` + `.done`)
- `feature-status.md`
- `lessons.md` (L56)
- `tools/find-ids.py`
- `user-review/AGREE-STEM-LANES.md` (row 5)
- `b-round-420/*`: the sketch and its generators, mutants, probe, prechecks, claims, grants, frozen manifest, before-copies and checkpoint
