# B — round 32 result → round 33 dispatch (D-29x)

Dispatcher: B · Date: 2026-10-13 · Inputs read: `tasks/round-32.md` (= the dispatched round-32 task, `cmp`-identical), `a-round-32.md`, `c-round-32.md`, `c-round-32.json`, `backlog.json` v33, `feature-status.md`, `plan.md` (D-29w and the round table), `root-pre-push-review.md` and `publication-checkpoint.json` (read directly in this round, after the advisor's second call, and compared with the carried list in `b-round-31.md` §7 and `c-round-32.md`), `agent-workflow.md`. Sources read for the decision: `StudioWorkspace.tsx` (predicates, keydown handler, lane background pointerdown, scroller JSX), `ArrangementClip.tsx` `beginGesture`, `ArrangementRuler.tsx` (playhead and ruler pointerdowns), `ArrangementLoopBrace.tsx`, `ArrangementLane.tsx` (Pan/Volume handlers), `ArrangementContext.tsx` `blurTrackVolume`/`blurMasterGain`.

**Advisor:** available; called once before writing. Advice applied: a one-bug round; fix focus, not the guard; one capture listener on the scroller; no blur during an active gesture; the pending-commit order as a test oracle; A-R32-REVIEW-1 decided now (Low, to 4b); FB-05 stays bug; re-baseline with `ArrangementLane.tsx` frozen and `fader-guards.test.tsx` appendable; B's own gate re-run before the backlog edit. B checked the advisor's source questions. The ruler's `handlePointerDown` calls `preventDefault` and does not focus. The loop brace and the playhead focus themselves. The clip root has no `tabIndex`.

## 1. Archive and backups

- `tasks/round-32.md` — a copy of the dispatched `current-task.md` (`cmp` SAME). It did not exist before; nothing was overwritten or deleted.
- Backups: `feature-status.before-b-round-32.md`, `backlog.json.bak-before-b-round-32`, `b-next.before-b-round-32.json`, `plan.before-b-round-32.md`.
- Checkpoint: `b-round-32-checkpoint.md`. Scripts: `b-scripts/b-round-32-backlog.cjs`, `b-round-32-feature-status.cjs`, `b-round-32-plan.cjs`.

## 2. Independent verification of C's round-32 result

B re-ran the gates on the current tree (`b-round-32/gates.txt`; `node.exe` 7 at start and end; dev server 200):

| Gate | B result | C result |
|---|---|---|
| `sha256sum -c b-round-31-tree-sha256.txt` | 0 non-OK (375 OK) | 375 OK |
| protected | 4/4 OK | 4/4 OK |
| tsc | exit 0 | exit 0 |
| vitest | 69 files, **1212/1212** | 1212/1212 |
| build | exit 0 | ✓ |
| Biome `./app` | 2 errors (CRLF auth, root) + 218 warnings + 1 info | same |
| HEAD / status | `1cefea1`, 9 lines = §3.2 of round 32 | same |

B did not re-run the browser oracles. They come from C's evidence files (`c-round-32/runs/*`), which C produced independently of A. The backlog changes rest only on C's results and B's gate re-run.

## 3. Round-32 verdict

**C FAIL on one new Medium bug, C-R32-01.** PASS: G32-1..3, R32-BC, R32-K, R32-S, R32-U (a–g killed; b2 survives, as accepted), R32-Doc. R32-DK passes for every isolated row and fails in the real fader → clip/lane → Delete sequence.

**Statuses (C evidence only):**
- **C-R31-01 → closed** (R32-BC).
- **R31-U-GAP-B2 → accepted** (A's enumeration found no reachable path; C's b2 survives as expected).
- **R24-HC-COVERAGE → closed** (the fader-guards Home test; C R32-K).
- **C-R31-02 → fixed in isolation, not closed.** It closes with C-R32-01.
- **FB-05 stays ბაგია.** Round 32 was its fix round, and the dead Delete flow is in the same Pan/Volume code path; it is not pre-existing and it is not elsewhere (the FB-04 precedent does not apply).
- **SRW-13 4a-fix → `c_fail_new_bug`.**

**A's round-32 work is accepted as dispatched.** C confirms that A built exactly what B specified. The gap was in B's spec: round 32's tests set focus directly and never covered the order "fader first, then click".

**C-R32-01 notes for C:** C's correction to round 32's mutation (d) is recorded. The pointerup clear is protected by the pointercancel→key and another-pointer tests, not by the fresh-drag test. Doc 036 records it in round 33.

## 4. Why round 33 is a one-bug round (D-29x)

C-R32-01 is Medium, it is new, and it is caused by round 32's own code. It blocks committing round 32's files. Stage 4b would rework the same faders, so it goes first, as its own round.

**Decisions** (each states the smallest honest behaviour):
1. **Fix the focus, not the guard.** The round-32 guard is right: a key on a fader must not edit the timeline. The defect is that timeline pointerdowns call `preventDefault()`, so they never take focus.
   - Narrowing the guard (focus-visible, selection state, last pointer target) either brings back C-R31-02 or adds hidden state.
   - Blurring reproduces what the browser does without `preventDefault`: focus goes to `document.body`, which is C's passing control case.
2. **One capture handler on the scroller in `StudioWorkspace.tsx`.** It covers the clip header, the clip body, the trims, the lane body, the ruler and the lane headers. `ArrangementClip`, `ArrangementRuler` and `ArrangementLane` stay frozen.
   - Rejected: focusing the clip. The clip root has no `tabIndex`, so this would need a new focusable element in a frozen file.
   - Rejected: one call per handler, which means 3+ files for one rule.
   - The capture phase runs before every claim, so a pending fader commit is not refused as "edit during gesture".
3. **No blur while a gesture is active.** The second pointer is refused anyway, and a blur would cancel the running fader drag (`handlePanBlur`, `blurTrackVolume`).
4. **Range inputs only. FOCUS-TEXT-STALE is recorded, not fixed.** A focused text field keeps focus after a timeline click for the same reason (B's code reading). Blurring the Clip Gain field commits its value, which is a separate contract, and C has not reproduced the case. C records it in round 33. If C confirms it, B plans it as its own bug round.
5. **A-R32-REVIEW-1 → Low, stage 4b (round 34).**
   - C showed that a trusted mouse `pointerup` (id 1) clears the suppression. Touch and pen get `pointercancel`.
   - The only symptom, Pan keys dropped silently, needs a pointer that never releases.
   - Changing how it clears would alter round 32's contract and A's post-review tests.

**Side effect, stated as an oracle:** blurring a fader with a pending keyboard preview commits it through the existing `onBlur`. That gives one `Volume`/Master entry, written before the clicked element's gesture.

**Keys fixed as a by-product** (same root cause, pre-existing): Arrow nudge, Enter and Home after a fader → clip click. Round 33 tests Arrow nudge; C records Enter and checks Home.

**Renumbering:** 4b → round 34 (adds A-R32-REVIEW-1); 4c + polish → round 35.

## 5. Round-33 baseline and ownership

- HEAD `1cefea1` plus the 9 uncommitted lines (`b-round-32-git-status.txt`).
- Frozen: `b-round-32-tree-sha256.txt`, **376 OK**. That is round 31's 375 files plus round 32's `ArrangementLane.tsx`; it excludes the 3 owned files.
- Owned snapshots in `b-round-32-snapshots/`: `StudioWorkspace.tsx` `0bf51b45`, `fader-guards.test.tsx` `c7b071e8`, doc 036 `4aede19f`.
- A appends one `describe` (≥ 11 `it`) to `fader-guards.test.tsx`. The existing 19 `it` blocks stay byte-identical.
- Expected end status: the same 9 lines, or 4 if root commits round 31's files first.

## 6. Ableton

The saved §18.1 capture (`b-round-29/ableton-mixing-20261012.txt`) says nothing about which view receives keys after a click on a clip, or about focus on a mixer control. Every round-33 row is **დაუდასტურებელი** and recorded as a CZABA requirement. B did not browse a new source; deciding a bug fix did not need one, and no Ableton behaviour is claimed.

## 7. Root and Tech Lead items (carried; from `root-pre-push-review.md`, `publication-checkpoint.json`, `c-round-32.md`)

**Commit readiness:**
- Round 31's 7 files were verified by C and re-gated by B.
- Round 32's changes are **not** ready (C FAIL); they wait for round 33's C PASS.
- `ArrangementLane.tsx` and doc 036 carry both round 31 and round 32 changes, so root has two clean options:
  - commit round 31's 5 untouched files now (`ArrangementContext.tsx`, `graph.client.ts`, `model.ts`, `types/arrangement.ts`, `track-pan.test.tsx`);
  - or commit rounds 31 + 32 + 33 together after round 33's C PASS.
- Files under active implementation are not committed. An intermediate checkpoint is not a release.

**Resolved since round 31 (B evidence):** the second remote. `git ls-remote` on 2026-10-13 shows `master` = `1cefea1` on both `TCzaba/czaba-store` and `shavidze/czaba-store`. That matches `publication-checkpoint.json` `oct13Checkpoint.status` ("both … verified at 1cefea1…"). `ROOT-SECOND-REMOTE` is closed in the backlog.

**Direct read of the root files (this round):**
- `root-pre-push-review.md` (2026-10-07): every finding is closed (M1–M3, L1–L4, L6–L8) or already carried. Nothing new.
- `publication-checkpoint.json`: it adds nothing beyond the carried list. Its standing requirements still apply: library/stems done (SRW-12), scrollbars with the Tech Lead (SRW-23), the discoverable entry done, T12 after the original scope, and the final commit/push by root only after everything. `checkpoint-oct13-review.md` suggestions are already triaged into the backlog (for example 9 → `ROOT-AGENT-WRITE-GRANT`, 5 → the 4b pending-commit order, 2 → L3).

**Still open (root):**
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (the clamp stays; no limiter);
- CRLF Biome errors on `auth.ts`/`auth-bugs.test.ts`;
- `frontend-architect.md` grants Write/Bash;
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the fake Bearer gets 500;
- the CDP allowlist;
- `Content-Type` without a charset;
- the dev server's availability;
- the `publication-checkpoint.json` requirements (library/stems done; scrollbars with the Tech Lead; T12; the final commit/push).

**Tech Lead:**
- C-R23-01 (React 19 or an `entry.server.tsx` grant);
- C-R27-01/C-R6-02/C-R8-01 (quiet Chrome);
- DEMO-SFX-FULL-SCALE;
- TL-Q-FB05-FB11;
- R31-T;
- **R33-T (new):** with a real mouse, click a fader, click a clip, press Delete;
- the rest of `feature-status.md` §5.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - C-R32-01 (Medium) is open, and C-R31-02 closes only with it;
  - FB-05 has an open bug;
  - FB-06, FB-07 and FB-09..13 are not started (SRW-14..20);
  - the SRW-21 adapter is not done;
  - Medium bugs C-R27-01, C-R23-01, C-R6-02 and C-R8-01 are with the Tech Lead;
  - the full regression and the root review are owed;
  - then T12.
- **Not BLOCKED:** round 33 needs no external information, approval or credentials, and the dev server answered 200.
- **No Critical/High bug is open.**
