# B — Round 107 result → Round 108 plan (D-29z73)

Planner: B · 2026-10-23 (~11:10–11:30 UTC) · Advisor: **available and used** twice: before the plan was fixed, and in a final review. The final review led B to fix four things: the redo discriminator in FL-UNDO/REDO/DELETE, a wider targeted grep (+`StudioWorkspace`), the `useIsomorphicLayoutEffect` import permission, and ownership of doc 092 l.4. B followed all of its points: the partner-target trap on a held Enter, "only on exhaustion", `toBe(partner)` assertions because jsdom keeps focus on a disabled button, no change to Enter-on-body, the bookkeeping and addendum (s).

## Inputs read
- `context/active-summary.md` and `context/active-backlog.json` (sections only).
- `current-task.md` (round 107; archived unchanged as `tasks/round-107.md`), `a-round-107.md`, `c-round-107.md` / `.json`.
- `gates/gate-round-107.json`, `gates/round-107/review.md`, `regression-last.json`, `b-round-106.md`.
- The full backlog was looked up by ID only.
- `root-pre-push-review.md` / `publication-checkpoint.json`: unchanged since round 106 planning (10:11); no new item.
- **Gate 107: `published`, commit `fc08617`.** That makes it the baseline HEAD. B checked: HEAD `fc08617`, `git status` empty.

## Round 107 outcome (evidence only)
- **C: PASS**, `browserVerified=true`, `realVerified=true`.
  - Every runnable row passed.
  - The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud).
  - HE-CLIPGAIN-RESET passed with a deviation: B's setup could not run, so C used A's corrected setup.
- **One Medium, C-R107-01.** It is pre-existing; that is C's inference from the diff.
- **Gate 107: published `fc08617`** (reviewer 8.5/10, "COMMIT: OK").

## Backlog changes (v106; only from C + gate evidence)
- **To მზადაა** (C browser PASS + published `fc08617`): C-R106-01, C-R106-02, C-R106-03, A-R106-REVIEW-F5.
  - Note: R2 on `0 dB` is proven in jsdom only (HE4 + h9). The button disables itself, so the browser cannot isolate it. This is recorded, not a gap.
- **New:**
  - C-R107-01;
  - B-R107-FL-HISTORY and B-R107-FL-ZOOM (from the B probe);
  - B-R107-ENTER-ON-BODY (a user question);
  - GATE107-S1..S4 (S4 closed as accepted);
  - A-R107-SWEEP-HELD-ENTER-TOOLBAR, A-R107-F2 (closed by decision: the range is kept on a time-0 refusal), A-R107-F4;
  - B-R107-SPEC-ERRATA (HE-CLIPGAIN-RESET setup, HE1 Space clause; the archive stays an exact copy).
- **Architecture signal:** ARCH-R107-SHARED-ENTER-GUARD → addendum (s) in `b-round-91-checkpoint-request.md`. This is a **bounded checkpoint request to root** (accumulated risk on one class); it does not block round 108.
- **Feature items:** none changed status. SRW-21 stays blocked-partial (auth owner); the others keep their Tech Lead manual checks.

## B probe (real Chromium, 1280×720, `b-round-107/probe/`)
- Each button was focused and activated with one Enter.
- **Undo** of the last entry → Undo disabled, focus BODY. The next Enter **adds a library clip**, which also wipes the redo entry just created.
- **Redo** of the last entry → the same; clips 1 → 2.
- **↩ Zoom** at its last step → the same; clips 2 → 3.
- **⌫ წაშლა** on the selected clip → disabled (no selection), focus BODY. The next Enter adds a clip at 00:02.688.
- 0 console errors, 0 forbidden requests.

## Round 108 decision (D-29z73)
**Scope:** one bug class ("a focused button disables itself; focus falls to BODY; the next Enter edits silently"), in two files, with one owner:
1. `0 dB` (C-R107-01);
2. Undo / Redo / ⌫;
3. ↩ Zoom.

**F1 — partner focus:**

| Button | Partner |
|---|---|
| `0 dB` | Clip Gain input |
| Undo | Redo |
| Redo | Undo |
| ⌫ | Undo |
| ↩ Zoom | Fit |

Focus moves only when all three hold: the button held focus, it is disabled after the action (exhaustion), and focus has not gone elsewhere.

**F2 — repeated Enter:** Undo, Redo, ⌫, ↩ Zoom and Fit ignore a repeated Enter, so a held Enter cannot oscillate Undo ↔ Redo or push Fit repeatedly. The shortcuts keep repeating.

**Uncertain UI contract, the smallest honest choice:**
- Keep the existing `disabled` semantics and hand focus to the one sibling that is guaranteed enabled. B rejected `aria-disabled`, a global focus listener, and changing Enter-on-body.
- A focused Redo/Undo after exhaustion is visible and labelled. A fresh Enter there does the labelled, undoable action, not a hidden library add.
- "Buttons act once per press" is a new explicit contract. B found no accepted contract for a held Enter repeating on the Undo button.

**Size and ownership:**
- 2 code files (narrow ranges), 1 new test file, 1 new doc (093).
- Doc 092 l.4 (the status line) only, so the stale "round 107 waits for C" is not filed again (as C-R106-03 was).
- Expected end state: 3 M + 2 ??.
- Frozen list: 539 (`b-round-107-r108-tree-sha256.txt`). Snapshots: `b-round-107-r108-snapshots/`.

**Regression round:** not due (2026-10-21 → 2026-10-23, 2 days). **The next B planning on or after 2026-10-24 is the regression round**, whatever else is open.

**What follows (order, unchanged scope):**
1. The regression round.
2. The root checkpoint (addendum s), then the held-Enter toolbar sweep (transport Loop first, GATE107-S1).
3. GATE104-S2 and the export/grid/tempo/marker Lows (incl. GATE106-S1/S2/S4, GATE107-S2/S3).
4. R21-I2 full regression.
5. T12.
6. VISUAL-A-OBSIDIAN.

SRW-21-PREMOUNT and the purchased mount wait for the auth owner's release. Phase 2 stays gated on the user's go-ahead. Nothing is deferred or dropped.

## Question for the user (via root; not blocking)
**B-R107-ENTER-ON-BODY:** when keyboard focus is on the page body (nothing focused), Enter adds the active library item to the active track. SRW-12 only specifies Enter from the results list. Should a body-level Enter keep adding, or only Enter from the library? Round 108 does not change this.

## Ableton
Not applicable: these are CZABA's own accessibility/keyboard rules, and no Live claim is made (table in the task §3).

## Files written by B
- `tasks/round-107.md` (exact copy of the round 107 task)
- `current-task.md` (round 108)
- `backlog.json` (v106)
- `feature-status.md`
- `docs/technical/studio-real-workspace/plan.md` (D-29z73)
- `b-round-91-checkpoint-request.md` (addendum s)
- `b-round-107-r108-tree-sha256.txt`, `b-round-107-r108-snapshots/`, `b-round-107/probe/`
- this file, `b-next.json`, `b-round-107-checkpoint.md`
- backups `b-round-107-*-before.*`

No app source was modified; `git status` in `store/` is still empty.
