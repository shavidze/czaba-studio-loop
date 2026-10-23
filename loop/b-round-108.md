# B — Round 108 result → Round 109 plan (D-29z74)

Planner: B · 2026-10-23 (~12:15–12:50 UTC) · Advisor: **available and used**.
- **Before writing:** it set the plan — round 109 is C-R23-01, plus the bookkeeping and the Medium triage.
- **After the task draft:** it led to four tightenings in the task:
  - the self-check working directory;
  - the exact SN6 fixture shape;
  - separate `write()` calls in SN3;
  - naming `app/lib/ssr/` in the ownership note.
- A final review comes after these files are written.

## Inputs read
- `context/active-summary.md` and `context/active-backlog.json`. The full backlog was read by ID only.
- Round 108: `current-task.md` (archived as an exact copy in `tasks/round-108.md`), `a-round-108.md`, `c-round-108.md` and `c-round-108.json`.
- `gates/gate-round-108.json`, `gates/round-108/review.md`, `regression-last.json`, `env-status.json`.
- `root-pre-push-review.md` and `publication-checkpoint.json`: no new item for B.
- **Gate 108: `published`, commit `32a6b08`.** That is the baseline HEAD. B checked: HEAD `32a6b08`, `git status` empty.

## Round 108 outcome (evidence only)
- **C: PASS**, `browserVerified=true`, `realVerified=true`.
  - Every F1 row passed: FL-GAIN-*, FL-UNDO*, FL-REDO, FL-DELETE, FL-ZOOMBACK and FL-UNDO-MOUSE.
  - The regressions passed, and so did AN-REVIEW and T108-TARGETED (66 files / 1126 tests).
  - The fake-Bearer sub-check is BLOCKED (backend unavailable in cloud).
- **notPassed:** F2 on Fit and m9. A stopped there because the frozen TH5 test conflicts with it.
- **New Low: C-R108-01.** A held Enter on ↩ Zoom hands focus to Fit, then repeats Fit and pushes duplicate zoom-history entries. Data is unchanged.
- **Gate 108:** published `32a6b08` (reviewer 8.5/10, "COMMIT: OK").

## Backlog v107 (only from C + gate evidence)
- **To მზადაა:**
  - C-R107-01 and B-R107-FL-HISTORY (C browser PASS, published `32a6b08`);
  - B-R107-FL-ZOOM, for the handoff half only. The Fit F2 half is not done and continues as C-R108-01.
- **C-R108-01, B ruling:** D-29z73 F2 on Fit stands. TH5 pinned the pre-F2 state; it is not a user contract. TH5 is amended, and the Fit guard added, in the held-Enter toolbar sweep (same Transport file). As a Low it goes to `deferred_low_polish`.
- **Stale statuses corrected from evidence:**
  - C-R72-01 → closed (C round 73 PASS).
  - ROOT-R64-M1 → closed as ruled (D-29z18).
  - GATE90-S1 → closed as not reproduced (C round 91).
  - A-R73-SAFARI → Chromium fixed. WebKit is unavailable in the cloud, so it is environment-bound (same class as GATE97-S2). It is **not** done.
- **New:**
  - **B-R108-LIB-FOCUS-LOSS (Medium, B probe; see below);**
  - A-R108-SWEEP-HITS, A-R108-STALE-ARM-GESTURE (the gate-108 S2 microtask proposal is merged into it), GATE108-S1, GATE108-S4 (taken in round 109), and A-R108-CTRLZ-EXHAUST-FOCUS (info).
- **2026-10-23 user decision, recorded:**
  - **139 open Lows** moved to `deferred_low_polish`, each with its id, severity, evidence and repro intact. A pointer finding, `DEFERRED-LOW-POLISH`, stays in `open_findings` so they cannot be lost.
  - SRW-21 → `deferred_user`, with the exact reason.
  - T12 gets `user_decision_2026_10_23`.
  - Ruled, acknowledged and dispatched Lows stay where they were.
- **Architecture:** the gate-108 and A reviewer notes go into addendum (t) of `b-round-91-checkpoint-request.md`. It is a bounded, non-blocking checkpoint request to root.

## B probes (real Chromium / Node, `32a6b08`)
- **SSR baseline** (`b-round-108/probe/ssr-baseline-result.json`; 5 paths × Chrome/Googlebot UA × 2 runs):
  - `/studio-lab`: 69 307 bytes, **4 NUL**, 36 chunks.
  - Every other path: 0 NUL.
  - The sha256 of each body after stripping NUL is identical across runs and UAs, so it is a byte-exact oracle for C.
- **Standalone repro** (`nul-repro2.cjs`, `nul-repro3.cjs`; react-dom 18.3.1, no app code):
  - Georgian labels give NUL; ASCII gives 0.
  - Stripped output equals `renderToString` exactly.
- **Library focus loss** (`lib-focus-probe-result.json`, 1280×720): ◀ collapse, ▶ expand and × search-clear each go to BODY after Enter, and the next Enter adds "CZABA hero" as a clip.
  - This is the same class as C-R107-01, which C rated Medium.
  - It is recorded as Medium from B evidence only. C confirms it in the round that fixes it.

## Medium triage (the T12 gate: no open Critical/High/Medium)
| ID | Status now | Path |
|---|---|---|
| C-R23-01 (+C-R38-01 Low) | dispatched | **Round 109** |
| B-R108-LIB-FOCUS-LOSS | open (B probe) | The bug round after the regression round |
| C-R27-01, C-R6-02 (SRW-03/05), C-R8-01 (SRW-11B) | measured only on the loaded Windows host | **C-only cloud measurement round**: the same layouts, a 3+2 budget per layout, no tolerance change. PASS closes them; FAIL becomes a bounded bug round. |
| A-R38-REVIEW-TOUCH | unverified hypothesis | Same measurement round: Playwright `hasTouch` + CDP touch dispatch on the Volume/Pan/Master faders. |
| A-R73-SAFARI-FLAG-FOCUS | Chromium fixed; WebKit not available | Environment / Tech Lead manual. **Question for root/user:** is a Chromium-fixed Medium whose only gap is a missing browser a "pending manual check" under the 2026-10-23 rule? B reads it as one (not blocking). |

- SRW-03, SRW-11B and SRW-13 stay open only for C-R6-02, C-R8-01 and C-R27-01 respectively (plus Tech Lead manual checks).

## Round 109 decision (D-29z74)
**Scope:**
- A NUL-stripping byte `Transform` (`app/lib/ssr/strip-nul-bytes.server.ts`) between React's `pipe()` and the response body in `app/entry.server.tsx`.
- Tests SN1–SN7: the real `renderToPipeableStream` control and equality with `renderToString`. Mutations m1–m4 (m2 kills the decode/replace approach).
- Doc 094, and doc 093 l.4 (GATE108-S4).
- Expected end state: 2 M + 3 ??. Frozen list 542 (`b-round-108-r109-tree-sha256.txt`). Snapshot: `b-round-108-r109-snapshots/`.

**Why this is the smallest honest fix:**
- 0x00 is never part of a UTF-8 sequence, so the filter is lossless; B proved the stripped output equals `renderToString`.
- Streaming is unchanged.
- No dependency changes.

**Ownership, stated plainly:**
- `app/entry.server.tsx` is not globally forbidden and is not an auth/purchase file. Plan §6 does not list it for A.
- B grants it narrowly (the import block and the `body` line, plus the new `app/lib/ssr/`) **on B's reading** of the user's 2026-10-23 "fix the open Medium findings first" instruction. **This is not an explicit user grant of the file.**
- If root refuses it at the gate, the round stays unpublished and C-R23-01 returns to the user as the old React 19 vs `entry.server.tsx` question. It is not counted as fixed.

**C rows:** NUL-HTTP, NUL-EQUIV, STREAM-KEPT, AX-NOJS / AX-HYDRATED (1280/1440), REG-FLOW, REG-PAGES, PX-NET, REG-HYD, G109-3, AN-REVIEW, T109-TARGETED, DOC rows, SOURCE-UNCHANGED. PROD-SSR-NUL is a gate row.

**Regression round:** not due (2026-10-21 → 2026-10-23 is 2 days). **The next B planning on or after 2026-10-24 is the regression round**, whatever else is open.

## What follows (order; nothing deferred or dropped without the user)
1. The regression round (≥ 2026-10-24).
2. B-R108-LIB-FOCUS-LOSS (+ an A-R108-SWEEP-HITS probe).
3. The C-only cloud measurement round (C-R27-01, C-R6-02, C-R8-01, A-R38-REVIEW-TOUCH).
4. T12-GAIN-VOLUME, once no Medium+ is open.
5. VISUAL-A-OBSIDIAN.
6. The `deferred_low_polish` pass (including the held-Enter sweep + TH5/Fit).
7. R21-I2 and the final regression.

SRW-21 is deferred by the user. Phase 2 waits for the user's go-ahead.

## Questions (via root; not blocking)
- B-R107-ENTER-ON-BODY (from round 107) is still open. Note that B-R108-LIB-FOCUS-LOSS is a direct consequence of the Enter-on-body contract.
- Round 109: the `entry.server.tsx` grant, as above.
- A-R73-SAFARI: does it count as a manual check under the 2026-10-23 rule?

## Ableton
Not applicable: this is web delivery integrity, not a DAW behaviour.

## Files written by B
- `tasks/round-108.md` (exact copy)
- `current-task.md` (round 109)
- `backlog.json` (v107)
- `feature-status.md`
- `docs/technical/studio-real-workspace/plan.md` (D-29z74, the §5 row, the §6 exception)
- `b-round-91-checkpoint-request.md` (addendum t)
- `b-round-108-r109-tree-sha256.txt`, `b-round-108-r109-snapshots/`, `b-round-108/probe/`
- this file, `b-next.json`, `b-round-108-checkpoint.md`
- backups `b-round-108-*-before.*`

No app source was modified; `git status` in `store/` is still empty.
