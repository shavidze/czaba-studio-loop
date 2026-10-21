# B — round 35 result → round 36 dispatch (D-29z1)

Dispatcher: B · Date: 2026-10-13

**Inputs read:**
- `tasks/round-35.md` (= the dispatched round-35 task, `cmp`-identical), `a-round-35.md` and its artifacts (`proposed-StudioWorkspace.diff`, `new-describe.tsx.txt`), `c-round-35.md`, `c-round-35.json`, `c-round-35/checkpoint.md`;
- `backlog.json` v36, `feature-status.md`, `plan.md` (D-29z and the round table), `b-round-34.md`, `b-next.json`;
- `root-pre-push-review.md` and `publication-checkpoint.json`. Both are unchanged since round 33 (mtime 2026-10-07 and 2026-10-13 11:45). HEAD is still `1cefea1`.

**Source read for the ruling:** `fader-guards.test.tsx` l.1235–1294 (the conflicting test and its neighbours) and A's proposed diff.

**Advisor:** available; called once before writing, and its advice was applied in full:
- option 1 with exact bytes and a `diff -u` oracle for C;
- round-36 numbering (4b → 37, 4c → 38), backlog v37;
- statuses from C evidence only, so nothing moves to მზადაა;
- the Pan centre row, the marquee in the owner list, and mutation (c) redefined;
- A's artifacts reused, with red-first redone in `store/`;
- CONTINUE, not BLOCKED.

There was no conflict between the advice and B's evidence.

## 1. Archive and backups

- `tasks/round-35.md` is a copy of the dispatched `current-task.md` (`cmp` SAME). It did not exist before; nothing was overwritten or deleted.
- Backups: `feature-status.before-b-round-35.md`, `backlog.json.bak-before-b-round-35`, `b-next.before-b-round-35.json`, `plan.before-b-round-35.md`.
- Checkpoint: `b-round-35-checkpoint.md`.
- Scripts: `b-scripts/b-round-35-backlog.cjs`, `b-round-35-plan.cjs`, `b-round-35-feature-status.cjs`.
- New baseline files:
  - `b-round-35-tree-sha256.txt` is a copy of round 34's 376-file list, still 0 not-OK;
  - `b-round-35-snapshots/` holds the 3 owned files, byte-identical to round 34's snapshots;
  - `b-round-35-git-status.txt` holds the 9 lines.

## 2. Independent verification

B re-ran the gates on the current tree (`b-round-35/gates.txt`, 16:57–16:58; `node.exe` 7 → 7):

| Gate | B result | C result (round 35) |
|---|---|---|
| HEAD / status | `1cefea1`, 9 lines | the same |
| `sha256sum -c b-round-34-tree-sha256.txt` | 0 non-OK (376 OK) | 376 OK |
| owned files | `b64a2cf6` / `11a19bf6` / `e86072b8` (= snapshots) | the same |
| protected | 4/4 OK | 4/4 OK |
| tsc | exit 0 | exit 0 |
| vitest | 69 files, **1247/1247** | 1247/1247 |
| build | exit 0 | ✓ |
| Biome `./app` | 2 errors (CRLF auth, root) + 218 warnings + 1 info | the same |

`store/` is byte-identical to the round-34 baseline. A's stop is confirmed by both A (`a-round-35/scratch-impl-run.txt`) and C's separate scratch (`c-round-35/runs/scratch-impl-arrangement.txt`): the only failure is `fader-guards.test.tsx:1265`.

B did not re-run the browser oracles; they come from C's evidence files.

## 3. Round-35 verdict

- **A: stopped at §1.4** (a frozen test expects the search to keep focus on a Pan pointerdown). This is a correct stop under the task's rules, not a failure of A.
- **C: BLOCKED.**
  - G35-2 and G35-3 **PASS**;
  - R35-CR fails at baseline: **C-R34-01 still reproduces** on Volume, Pan, Master and video Volume, and at 1280;
  - the other IDs were not run, because nothing landed.
- **Statuses (C evidence only):**
  - nothing moves to მზადაა;
  - C-R34-01 stays open (Medium), with new evidence `c-round-35/runs/cr-baseline-*.txt`;
  - C-R34-02 stays open (Low);
  - FB-04 and SRW-13 stay ბაგია;
  - C-R23-01 is unchanged (2 NUL at 28013/28014, 63 520 bytes).
- `rounds[35]` = `a_stopped_c_blocked`. The SRW-13 stage `4a-fix4` = `a_stopped_redispatched`.

## 4. The ruling (D-29z1) and why round 36 re-dispatches the same scope

**Ruling:** A's option 1. The test at l.1258–1278 changes in exactly 3 lines: the title, and l.1265 and l.1272 become `expect(document.activeElement).not.toBe(search)`. The exact bytes are in the task's ruling table. The other 53 existing tests stay byte-identical.

**Rationale** (the smallest honest behaviour):
- The assertion encoded a jsdom-only state; jsdom never moves focus on pointerdown.
- In a real browser, a real click on Pan or Master already moves focus off the search natively. C recorded this in round 35: `activeElement` = `Pan — მუსიკა` / `Master Volume`, search `ab`.
- So the frozen line contradicted real behaviour, not the fix.
- The test keeps its real value: during an active Pan gesture, the clip table is unchanged and the search text stays `ab`.
- The "gesture active → the text field keeps focus" intent moves to new case 10, which uses a realistic `preventDefault` owner (the detail separator).

**Option 2 is rejected** (exclude the search field): it contradicts D-29z's own search row and today's browser behaviour. **Option 3** (rewrite the frozen test from a non-text focus) would be a larger edit of a frozen test than needed.

**Clarifications from C's §6:**
- The Pan centre click is 0 → 0 and writes no Pan entry. The browser row checks only the Clip Gain commit; the two-entry tails come from Volume, Master and video Volume.
- The lane-background marquee is added to the owner list.
- Mutation (c) is a composed scroller capture (the new handler, then round 34's handler), with the root attribute removed. React allows one `onPointerDownCapture` per element.
- Case 6 being red on the snapshot is accepted.
- Mutation (f) stays C's.

**Reuse, not duplication:**
- A's `proposed-StudioWorkspace.diff` (`3ec3dca1`) and `new-describe.tsx.txt` (`ab95eb26`, 12 `it`) are the dispatched implementation.
- Red-first is redone in `store/`, with an intermediate run that shows the l.1265 failure before the amendment.
- The full `npx vitest run` in `store/` is the first time the 32 test files outside `app/lib/arrangement` meet the handler.
- Expected counts: 1259 total, fader-guards 66.

Round size: the same one Medium bug plus one doc Low (the workflow rule).

**Renumbering:** 4b → round 37, 4c + polish → round 38.

## 5. Round-36 baseline and ownership

- HEAD `1cefea1` plus the 9 uncommitted lines (`b-round-35-git-status.txt`).
- Frozen: `b-round-35-tree-sha256.txt` (376 OK).
- Owned:
  - `StudioWorkspace.tsx`: the handler and its attribute;
  - `fader-guards.test.tsx`: the 3 ruled lines and the appended describe;
  - doc 036: the l.355 parenthesis, the header line and an append.
- Expected end status: the same 9 lines, or 3 if root commits rounds 31–34 first.
- C IDs: R36-CR, R36-OT, R36-CL, R36-R34, R36-K, R36-S, R36-U (a–f), R36-Doc, G36-1..3.

## 6. Ableton

This is a bug round, and no new source was browsed.
- §18.1 (`b-round-29/ableton-mixing-20261012.txt`) does not describe when a value box commits, or focus on a fader press. Both rows are **დაუდასტურებელი** and recorded as CZABA requirements (D-29u, native browser focus).
- The double-click reset is **confirmed** in §18.1 and stays in 4b (round 37).

## 7. Root and Tech Lead items (carried; from `root-pre-push-review.md`, `publication-checkpoint.json`, `c-round-35.md`)

**Commit readiness:**
- **Rounds 31 + 32 + 33 + 34 (the same 9 status lines) are C-verified and B-re-gated (round 35 changed nothing). They are ready for root's checkpoint commit.** Root runs its own check/typecheck/tests/build and review, and pushes to both remotes per the 2026-10-13 authorization.
- Round 36 touches the same 3 files for the fifth round in a row. Commit **before A starts round 36** or after C passes it, never mid-round.
- **Nothing new from round 35 is ready to commit.**

**Unchanged:**
- `publication-checkpoint.json` `oct13Checkpoint`: both remotes at `1cefea1`;
- `root-pre-push-review.md` (2026-10-07): every finding is closed or carried.

**Still open (root):**
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- the CRLF Biome errors on `auth.ts`/`auth-bugs.test.ts`;
- `frontend-architect.md` grants Write/Bash;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the fake Bearer gets 500 (C round 35 saw it again; no token is issued);
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability;
- the remaining `publication-checkpoint.json` requirements: scrollbars with the Tech Lead, T12, and the final commit/push.

**Tech Lead:**
- C-R23-01 (React 19 or an `entry.server.tsx` grant);
- C-R27-01/C-R6-02/C-R8-01 (quiet Chrome);
- DEMO-SFX-FULL-SCALE;
- TL-Q-FB05-FB11;
- R30-T, R31-T, R33-T and R34-T;
- **R35-T** (meaningful once round 36 lands; it is now in `backlog.json` `tech_lead_manual_checks`);
- the rest of `feature-status.md` §5.

## 8. Decision

**CONTINUE.**
- **Not BLOCKED:**
  - round 35's only blocker was a contract ruling that belongs to B, and B issues it here (D-29z1);
  - no external information, approval or credentials are needed;
  - the dev server answered 200 during C round 35.
- **Not COMPLETE:**
  - C-R34-01 (Medium) is open;
  - FB-06, FB-07 and FB-09..13 are not started (SRW-14..20);
  - stage 4b/4c and the polish items are open;
  - the SRW-21 adapter is not done;
  - the Medium bugs C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are with the Tech Lead;
  - the full regression and the root review are owed;
  - then T12.
- **No Critical/High bug is open.** Purchase protection is preserved (G35-3: 401 anonymously; `/studio/middle-east` shows "Sign in required").
