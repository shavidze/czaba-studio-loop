# B — Round 109 result → Round 110 plan (D-29z75)

Planner: B · 2026-10-23 (~13:05–13:45 UTC) · Advisor: **available and used** (once before writing; its points are applied: write order, the unmount-vs-disabled predicate, the required repeat guard, video-neutral rows, the frozen-list arithmetic, the architecture addendum). A second advisor review after writing found one spec defect: mutation m2 (arm unconditionally) could not turn LF5 red, because the body/null check still protects focus on Play. Fix: a new case LF5b (nothing focused → no move) is m2's target. It also confirmed the frozen-list count of 544 (docs are never listed).

## Inputs read
- `context/active-summary.md`, `context/active-backlog.json`; the full backlog by ID only.
- Round 109: `current-task.md` (archived as an exact copy in `tasks/round-109.md`), `a-round-109.md`, `c-round-109.md`, `c-round-109.json`.
- `gates/gate-round-109.json` (**published, commit `1fe3ba2`** → the baseline HEAD), `gates/round-109/review.md`, `regression-last.json`, `env-status.json`.
- `root-pre-push-review.md` and `publication-checkpoint.json`: unchanged since 12:33 (before round 109's gate); no new item for B.
- Source read (read-only): `ArrangementLibrary.tsx`, `StudioWorkspace.tsx` (collapse state, video float, Enter handler), `ArrangementVideoDock.tsx` (float focus restore), `ArrangementLane.tsx` (pan reset), doc 093, `floating-video.test.tsx` l.705–726.
- B checked: HEAD `1fe3ba2`, `git status` empty.

## Round 109 outcome (evidence only)
- **C: PASS**, `browserVerified=true`, `realVerified=true`. 15 rows passed. NUL-HTTP 20/20 had NUL 0, and NUL-EQUIV 20/20 matched B's stripped hashes. STREAM-KEPT had 36 events. AX-NOJS and AX-HYDRATED passed at 1280 and 1440, REG-FLOW (real WAV 101.352 s) passed, and so did the remaining rows. The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud).
- **Gate 109:** published `1fe3ba2`. Reviewer 9/10, "COMMIT: OK".
- **New Low:** C-R109-OBS-01. With JS disabled, the page is black, because the page-transition wrapper has opacity 0. It is pre-existing.

## Backlog v108 (only from C + gate evidence)
- **To მზადაა:**
  - C-R23-01, C-R38-01 and GATE108-S4 (C browser PASS, published `1fe3ba2`).
  - SRW-01 in the board: its last open bug was C-R23-01. The backlog item was already `done`.
- **Still open:**
  - **PROD-SSR-NUL** (gate-109 F2): no one has measured the production HTML. It is a gate/Tech Lead row; it is noted on C-R23-01 and not hidden.
- **Gate 109 findings:**
  - F1, ownership: root published, so the grant is ratified in practice. Plan §6 now says that `entry.server.tsx` and `app/lib/ssr/**` are frozen again.
  - F2: PROD-SSR-NUL, as above.
  - F3: the biome-ignore in the test fixture → `deferred_low_polish`.
  - F4 (tripwire) and F5 (the abort timer is never cleared): info.
  - F6: doc 094 l.4 → owned in round 110.
  - The Architecture note → a signal (ARCH-R109-NUL-FILTER-REMOVAL), not scheduled.
- **C's observations, recorded as info:**
  - `/products` returns 200 with a 404 title. This depends on the backend.
  - The export alert says 14 clipped samples, while C's scan counted 30 at |x| ≥ 0.9999.
- **Moved to `deferred_low_polish`:** C-R109-OBS-01 and GATE109-F3. The pointer finding now says 141.
- **A-R108-SWEEP-HITS:**
  - The video part did not reproduce in a B probe (see below). C confirms it in round 110's LF-SWEEP-NEG.
  - Pan reset stays a deferred Low.

## B probes (real Chromium, `1fe3ba2`, `b-round-109/probe/`)
- **`lib-focus-probe-result.json` (1280):** ◀, ▶ and × each reproduce the bug. After Enter 1, focus is on BODY; Enter 2 adds „CZABA hero“ (clips 0 → 1).
- **`video-focus-probe-result.json` (1280 and 1440):**
  - Video placeholder „დაბრუნება“, float ✕ and ⤢: after Enter, focus is on ⤢, and Enter 2 adds no clip. **Not reproduced.**
  - Pan reset with the mouse: focus goes to the Pan slider, not BODY.

## Why round 110 is B-R108-LIB-FOCUS-LOSS, not the regression round
- `regression-last.json` = 2026-10-21. Today is 2026-10-23, so 2 days have passed and the 3-day rule is not met.
- Round 108's "what follows" listed the regression round first, on the assumption that the next planning would be on or after 10-24. It is not.
- **The next B planning on or after 2026-10-24 is the regression round**, whatever else is open.

## Round 110 decision (D-29z75)
- **F1 handoff:**
  - ◀ → ▶ and ▶ → ◀. The partner mounts in the next render, so an armed ref plus one deps-free layout effect moves the focus.
  - × → the search input, synchronously.
  - Focus moves only if the button had focus at click time and focus is now on body or null.
  - Collapse/expand driven by the video never moves focus.
- **F2:** Enter with `repeat` → `preventDefault` on all three buttons. This is **required**: without it, a held Enter would toggle ◀ and ▶ back and forth (ping-pong).
- **Contract left alone:** B-R107-ENTER-ON-BODY stays a user question. `StudioWorkspace.tsx` and `ArrangementContext.tsx` stay frozen.
- **Scope:**
  - `ArrangementLibrary.tsx`, narrow;
  - new `library-focus-handoff.test.tsx` (LF1–LF9 + LF5b, fail-before, m1–m5);
  - new doc 095;
  - doc 094 l.4.
  - Expected end state: 2 M + 2 ??. Frozen list: 544 (`b-round-109-r110-tree-sha256.txt`). Snapshot: `b-round-109-r110-snapshots/`.
- **C rows:**
  - LF-COLLAPSE, LF-EXPAND, LF-CLEAR (each at 1280 and 1440);
  - LF-MOUSE, LF-HOLD, LF-VIDEO-NEUTRAL, LF-SWEEP-NEG;
  - R12-L2-ENTER-ADD, REG-LIB, FV-710;
  - PX-NET, REG-HYD, G110-3, AN-REVIEW, T110-TARGETED, DOC-095/DOC-094-L4, SOURCE-UNCHANGED.
- **Ableton:** does not apply. This is CZABA's own keyboard/a11y rule, and no Live claim is made.

## Architecture
- The arm-ref + layout-effect handoff now exists in a third component: Transport, DetailPanel and now Library.
- This is recorded as addendum (u) to `b-round-91-checkpoint-request.md`. It is non-blocking, and no extraction is scheduled.
- No checkpoint result from root has arrived for (s)/(t). As announced in (t), round 110 uses the inline convention.

## What follows (order; nothing deferred or dropped without the user)
1. Round 110: B-R108-LIB-FOCUS-LOSS.
2. The regression round (B planning on or after 2026-10-24).
3. The C-only cloud measurement round (C-R27-01, C-R6-02, C-R8-01, A-R38-REVIEW-TOUCH).
4. T12-GAIN-VOLUME, once no Medium+ is open.
5. ABLETON-EXPERT-REVIEW.
6. VISUAL-A-OBSIDIAN.
7. The `deferred_low_polish` pass.
8. R21-I2 and the final regression.

SRW-21 is deferred by the user. Phase 2 waits for the user's go-ahead. Professional plugins, effects, pitch and multiple video layers stay out of scope; grid tempo is not audio stretch.

## Questions (via root; not blocking)
- B-R107-ENTER-ON-BODY (still open).
- A-R73-SAFARI: does a Medium that is fixed in Chromium and only lacks WebKit count as a manual check under the 2026-10-23 rule? B reads it as yes.
- Optional: root may record gate-109 F1 explicitly ("narrow grant ratified").

## Commit readiness
Round 109 is already published (`1fe3ba2`). Round 110 is not yet implemented.

## Files written by B
- `tasks/round-109.md` (exact copy), `current-task.md` (round 110)
- `backlog.json` (v108), `feature-status.md`
- `docs/technical/studio-real-workspace/plan.md` (D-29z75, the §5 row 110, the §6 note)
- `b-round-91-checkpoint-request.md` (addendum u)
- `b-round-109-r110-tree-sha256.txt`, `b-round-109-r110-snapshots/`, `b-round-109/probe/`
- this file, `b-next.json`
- backups `b-round-109-*-before.*`

No app source was modified; `git status` in `store/` is still empty.
