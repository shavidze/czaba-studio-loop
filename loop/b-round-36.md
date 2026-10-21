# B — round 36 result → round 37 dispatch (D-29z2)

Dispatcher: B · Date: 2026-10-13

**Inputs read:**
- `tasks/round-36.md` (= the dispatched round-36 task, `cmp` SAME), `a-round-36.md`, `c-round-36.md`, `c-round-36.json`;
- `backlog.json` v37, `feature-status.md`, `plan.md` (D-29z, D-29z1, round table), `b-round-35.md`, `b-next.json`;
- `root-pre-push-review.md` (2026-10-07, unchanged) and `publication-checkpoint.json` (`oct13Checkpoint`, `followupReview`; unchanged since 11:45); `checkpoint-oct13-review.md` (triaged in §6).

**Source read for the contract:** `ArrangementDetailPanel.tsx` l.214–380 (`commitClipGain`), `ArrangementContext.tsx` (`refuseEditDuringGesture`, `beginPointerGesture`, `claimPointerGesture`, `setClipGain`), the `StudioWorkspace.tsx` → panel wiring (l.1469–1483), `clip-gain.test.tsx` l.685–831, `fader-guards.test.tsx` l.1360–1604, and every test that asserts `GESTURE_EDIT_BLOCKED_MESSAGE` (none asserts it after a release, none blurs the Clip Gain field during a gesture).

**Advisor:** available; called twice — before writing and after writing. The first advice was applied: close C-R34-01/02 only on C evidence; FB-04/SRW-13 stay ბაგია; Locus A as the smallest fix; round = C-R36-01 + test nits + doc sentence; triage the checkpoint-oct13 Lows; renumber 4b → 38; CONTINUE. One deviation: the advisor listed all three nits; B keeps l.1272 as is (it is the D-29z1 ruled byte line and harmless), and pins only cases 7 and 8. B had first considered an automatic commit at gesture end; after the advisor's comparison B rejected it as larger than the problem (§4). The second call found two task errors, both fixed: B verified that the detail content is keyed per clip (l.800–801), so the N5/PG-3 selection-change rows hold (now a §1.4 re-check for A); and mutation (c) no longer predicts a `clip-gain.test.tsx` l.815 failure (its reset click sets the status first). The §4.2 invalid-text row now notes that `value` may read `""`.

## 1. Archive and backups

- `tasks/round-36.md` — a copy of the dispatched `current-task.md` (`cmp` SAME). It did not exist before; nothing was overwritten or deleted.
- Backups: `feature-status.before-b-round-36.md`, `backlog.json.bak-before-b-round-36`, `b-next.before-b-round-36.json`, `plan.before-b-round-36.md`. Checkpoint: `b-round-36-checkpoint.md`.
- Scripts: `b-scripts/b-round-36-backlog.cjs`, `b-round-36-plan.cjs`, `b-round-36-feature-status.cjs`.
- New baseline files: `b-round-36-tree-sha256.txt` (376 = round 35's list minus `ArrangementDetailPanel.tsx`, plus `StudioWorkspace.tsx` `7fe98434`; 0 not-OK); `b-round-36-snapshots/` (DetailPanel `60d24bb0`, fader-guards `ca3153ad`, doc 036 `d5f206c1`, with `SHA256SUMS.txt`); `b-round-36-git-status.txt` (9 lines).

## 2. Independent verification (`b-round-36/gates.txt`, 17:49–17:50, `node.exe` 7 → 7)

| Gate | B | C round 36 |
|---|---|---|
| HEAD / status | `1cefea1`, 9 lines | the same |
| `b-round-35-tree-sha256.txt` | 0 non-OK | 376 OK |
| owned shas | `7fe98434` / `ca3153ad` / `d5f206c1` | the same |
| protected | 4/4 OK | 4/4 OK |
| tsc | exit 0 | exit 0 |
| vitest | 69 files, **1259/1259** | 1259/1259 |
| build | exit 0 | ✓ |
| Biome `./app` | 2 errors (CRLF auth, root) + 218 warnings + 1 info | the same |

B did not re-run browser oracles; they come from C's evidence files. The dev server answered 200 at 17:49.

## 3. Round-36 verdict (C evidence only)

- **C PASS on every ID:** G36-1..3, R36-CR (5/5 targets, two Undos, 1280), R36-OT, R36-CL (3/3 valid, 0 replacements), R36-R34, R36-K, R36-S, R36-U (a–f killed), R36-Doc.
- **Closed:** C-R34-01 (`c-round-36/runs/cr-1440.txt`, `cr-1280.txt`, `cl.txt`), C-R34-02 (`gates/snap-036.diff`).
- **New:** C-R36-01 (Medium, pre-existing, = A-R36-REVIEW-1; `runs/ot.txt` OT-5b); A-R36-TEST-NITS (Low); DOC036-R36-REVIEW-SENTENCE (Low). The stale refusal status was seen again (stage 4b).
- **Statuses:** SRW-13 stage 4a-fix4 → done. **FB-04 and SRW-13 stay ბაგია** (C-R36-01 is on the Clip Gain commit path; C-R27-01 Tech Lead). Nothing moves to მზადაა. C-R23-01 unchanged (2 NUL at 28013/28014, 63 520 bytes).
- `rounds[36]` = `c_pass_new_bug`; backlog v38.

## 4. Round 37 — the contract (D-29z2) and why

**Cause** (read in source): `commitClipGain` l.333–336 handles a gesture-blocked commit identically for Enter and blur — status plus `setClipGainText(currentText)`. On a blur the field has already lost focus, so the reset destroys the only copy of what the user typed.

**Fix (Locus A, the smallest honest behaviour):** the gesture branch resets the text only for `trigger === 'enter'`. The blur keeps the typed text visible and uncommitted, with the blocked status ("release first"). After the gesture ends, Enter or a later blur commits it through the existing path.

**Why Enter stays:** Enter is voluntary, the field keeps focus, and the user can retry. The frozen `clip-gain.test.tsx` l.815–831 pins it. Changing it would amend a frozen test for no reported loss.

**Rejected:**
- (B) `preventDefault` in the root capture during a gesture: it amends D-29z decision 5 and suppresses every second-pointer range press, Zoom included.
- (C) an automatic commit at gesture end: it needs a new context API across three source files for a multi-pointer-only path.

**Honest limitation, recorded:** the pending text follows the existing D-29u selection rule. If another clip is selected before the commit, the text is discarded (frozen `clip-gain.test.tsx` l.803). The blocked status was shown when focus was taken, so this is not silent. C checks it as PG-3 (PASS = matches this row).

**Round size:** one Medium bug plus two Lows of the same code path (the round-36 describe's nits, doc 036's outdated sentence), within the "max three closely related bugs" rule.

**Ownership:**
- `ArrangementDetailPanel.tsx` (one branch);
- `fader-guards.test.tsx` (3 additive `expect` lines in cases 7/8 + one nested describe of 5 `it` inside the round-36 describe);
- doc 036 (one clause, header, append).

`StudioWorkspace.tsx` is now frozen. Expected end status: **10** lines (9 + ` M ArrangementDetailPanel.tsx`), or 3 if root commits first. Expected counts: fader-guards 71, full 1264. Red: 3 failed | 68 passed (N1–N3).

**C IDs:** R37-PG (C's own OT-5b harness: PG-1 Enter, PG-2 blur, PG-3 limitation, 1280), R37-MN, R37-CR, R37-K, R37-S, R37-U (mutations a–e), R37-Doc, G37-1..3. Live audio is not re-run (the commit path is the existing `setClipGain`).

## 5. Ableton

This is a bug round, and no new source was browsed. §18.1 (`b-round-29/ableton-mixing-20261012.txt`) does not cover a value box when focus is taken during another drag. Both rows are **დაუდასტურებელი** and recorded as CZABA decisions (D-29z2, D-29u). The double-click reset is confirmed in §18.1 and is planned for 4b-1 (round 38) with a fresh source table.

## 6. Triage of `checkpoint-oct13-review.md` (so C stops carrying it)

| # | Suggestion | B decision |
|---|---|---|
| 1 | doc 015 does not mention that Delete keeps a gap | new **DOC015-DELETE-GAP-NOTE** (Low, final docs pass) |
| 2 | track meter taps never removed | = **L3-REMOVED-TRACK-TAPS** (exists) |
| 3 | per-frame meter cost | evaluate in 4c or accept (Low perf; fine at today's 5 tracks) |
| 4 | meters double-count during a crossfade | evaluate in 4c or accept (cosmetic) |
| 5 | order of pending gain commits | = stage 4b pending-commit order |
| 6 | export dialog focus restore / hidden filter | new **EXPORT-DIALOG-FOCUS-RESTORE** (Low, polish) |
| 7 | clip gain can clip the export | accepted (clamp + warning; per-clip over indicator = T12) |
| 8 | post-swap video settle may skip a tick | → C-R6-02/C-R8-01 (Tech Lead quiet Chrome) |
| 9 | `frontend-architect.md` grants Write/Bash | = ROOT-AGENT-WRITE-GRANT (root) |
| 10 | tests replaced, not weakened | informational |

## 7. Root and Tech Lead items (carried)

**Commit readiness:**
- **Rounds 31 + 32 + 33 + 34 + 36 (the same 9 status lines) are C-verified and B-re-gated. They are ready for root's checkpoint commit.** Root runs its own check/typecheck/tests/build, review and `npm run test:e2e:smoke` (A and C may not start servers), and pushes to both remotes per the 2026-10-13 authorization.
- Commit **before A starts round 37** or after C passes it, never mid-round.

**Still open (root):**
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (clamp stays; no limiter);
- the CRLF Biome errors on `auth.ts`/`auth-bugs.test.ts`;
- `frontend-architect.md` Write/Bash;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the fake Bearer → 500 (no token issued);
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability;
- the remaining `publication-checkpoint.json` requirements: scrollbars with the Tech Lead, T12, the final commit/push.

`root-pre-push-review.md`: every finding is closed or carried (unchanged).

**Tech Lead:**
- C-R23-01 (React 19 or an `entry.server.tsx` grant);
- C-R27-01/C-R6-02/C-R8-01 (quiet Chrome);
- DEMO-SFX-FULL-SCALE;
- TL-Q-FB05-FB11;
- **R35-T is now meaningful** (round 36 PASS);
- R30-T, R31-T, R33-T, R34-T;
- optionally a two-finger C-R36-01 check after round 37;
- the rest of `feature-status.md` §5.

## 8. Decision

**CONTINUE.**
- **Not BLOCKED:** no external information, approval or credentials are needed for round 37. The dev server is up.
- **Not COMPLETE:**
  - C-R36-01 (Medium) is open;
  - FB-06, FB-07 and FB-09..13 are not started (SRW-14..20);
  - stage 4b/4c and polish are open;
  - the SRW-21 adapter is not done;
  - the Medium bugs C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are with the Tech Lead;
  - the full regression and the root review are owed;
  - then T12.
- **No Critical/High bug is open.** Purchase protection is preserved: G36-3 gave 401 anonymously, and `/studio/middle-east` shows "Sign in required".
