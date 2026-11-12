# B round 467 → 468 planning (2026-11-12)

**Decision:** CONTINUE. The next task is round 468, SABA-B-15 stage 1: diagnosis, with no store change (`current-task.md`).

**Advisor:** available, and consulted after orientation (before writing) and before hand-off. The project consult agents were not needed: this is a performance fix, not a new user-visible feature.

## 1. Round 467 result (from `c-round-467.json` only)
- **C PASS:** 13 rows (C1–C13), `browserVerified` and `realVerified` true, 0 bugs. The fake-bearer path is BLOCKED (backend unavailable in cloud) and stays open backend evidence.
- **Gate 467:** published `9ba13ac` (`gates/gate-round-467.json`). The store HEAD is `9ba13ac` and clean, which is this round's baseline.
- **D-29z1647:**
  - Closed: C-R466-01, A-R451-REVIEW-L2-ZERO-OFFSET-UNITS and GATE452-L1-GLOW-REGEX-WHOLE-SOURCE (in `backlog.json`), and INFO-TL-R451-GLOW-CALC (an info id the optimizer had already moved to `archive/findings-archived.json`; it is closed by the decision text, and the archive was not edited).
  - The STORE-2b-3c-2b code stage is done, which closes the STORE-2b code stages. The 2b-4 rows stay in STORE-3/4 and DP-GATE.
  - A-R467-REVIEW-L1 (Low, cosmetic) goes to `deferred_low_polish`.
  - **L7:** no other open id shares the pre-check root cause.

## 2. Saba's 2026-11-12 policy items (L42, D-29z1648)
| Item | ID | Status |
|---|---|---|
| Store scroll not smooth (`/free-downloads`) | SABA-B-15 (Medium) | Round 468. Includes `Why we missed it`; the lesson is merged into L18 |
| Ctrl+K needs more content | SABA-Q-CTRLK-CONTENT | `awaiting_user` (the policy says "pending Saba decision") |
| Gift Cards in the header? | SABA-Q-GIFTCARDS-HEADER | `awaiting_user`. R57 (round 188) removed it from the header |
| Logo still uses the old colours | SABA-B-16-LOGO-OLD-COLORS (Medium) | Input to the first DP-GATE. Which asset is meant is unconfirmed: the wordmark is already `text-foreground`; the candidates are `public/` favicon and og-image (root) and the loader wordmark |
| Review stance: objectively critical | — | Recorded on ROOT-REQ-DP-GATE-FIRST |

The questions are in `user-review/questions-round-467.md` (Q1–Q4).

## 3. Why SABA-B-15 next
- There are no open C bugs.
- Every open Medium is manual-only, root-only, `awaiting_user` or already scheduled.
- SABA-B-15 is a new Saba Medium on a mounted Store screen. This is the SABA-B-14 precedent, so it goes ahead of STORE-2c.
- Regression is not due: `regression-last.json` is dated 2026-11-10, and 2026-11-10 + 3 days = 2026-11-13, later than today (2026-11-12).

**B's evidence** (`b-round-467/probe/`, frozen probe `store-scroll-probe.cjs`, sha in `store-scroll-probe.sha256`):
- **Build:** a production build of `9ba13ac` (`HEAD-BUILD.txt`, `build-head.log`), with the mock API running and the LeadMagnet suppressed. Each viewport gets 3 passes.
- **`/` (home) is reproduced.** The medians of frames over 33.4 ms while the page moves are 9 (1440×900) and 8 (1280×720). Long frames run 50–96 ms (`scroll-prod-9ba13ac-cpu1.json`). The dev run attributes them to `useSmoothScroll.ts` `raf` (`scroll-dev-9ba13ac-cpu1.json`).
- **The attribution is not a cause.** B's bisect (`probe/bisect-b.md`, run after the advisor's second consult) settled it:
  - With Lenis off, the drops remain (medians 5/4). The long frames have no script, and the wheel is no longer eased (20 moving frames).
  - Removing the header `backdrop-blur-lg` (10/8), the hero's two backdrop blurs (10/9) or the hero video's autoplay (9/6) does not help.
  - So the cost is page rendering, in a file not yet known. A first draft of this task granted only the Lenis hook. It was replaced before hand-off; the copy kept as `current-task-before-468.md` is the round-467 task.
- **`/free-downloads` is not reproduced.** It renders its 3 free items (`free-downloads-fullpage.png`, 1475 px tall) and has 0 slow frames in every build. This goes to Saba as a device check, TLM-R468-SABA-SCROLL-DEVICE (deadline RETRO 480).
- **The scrollY = 0 jump is not a bug.** It is the keep-list LeadMagnet's scroll lock. The exploratory scripts and runs are kept in `probe/superseded/` and are not claims.
- **Third advisor consult (before hand-off).**
  - **Floor control:** with all content hidden at the same page height, there are 0/0 slow frames and 140 moving frames. So the bound ≤ 2 is reachable here, and the cost is painting visible content.
  - **Bands:** the slow frames sit at scrollY ≈ 360–850 and ≈ 1850–2000. The first draft's "1400–1700" was corrected from `slowFrames`.
  - **`git apply` trap:** the loop folder is a git work tree, so C applies diffs with `patch -p1` (K21).
  - **Screening:** A screens with the `HIDE_CSS` floor probe, with no rebuild per suspect.
- **Cleanup:** the scratch builds were removed after the runs. The diffs (`*.diff.txt`, unified; `git apply --check` rc 0 on `9ba13ac`) and the logs are kept.

**Task shape (stage 1 = diagnosis):**
- **No grants in the store tree.**
  - A traces the frames and bisects the untried suspects in scratch copies only.
  - A delivers `a-round-468/proposal.diff.txt` with before/after visuals.
  - C reproduces HEAD, applies the proposal in its own scratch copy and checks it, then runs the Lenis-off guard mutant.
- **Rulings:**
  - **R-468-1:** keep Lenis's curve (a feel change is only an option for Saba).
  - **R-468-2:** keep-list items are restyle only.
  - **R-468-3:** no `root.tsx` or `app/styles/**` change without a root request.
- **Stage 2 (round 469):** the fix with exact grants. B re-runs the bound on the sketch (L58).
- **Claims:** `b-round-467/claims-468.sh` (K1–K20), with B's run in `claims-468-planning-output.txt` (stderr empty). The output is stable on a re-run, and `l58-check` is OK (no sketch).
- **REGRESSION-2026-11-13** gains `REG-SCROLL-HOME-FRAMES` in `scope_additions`.

## 4. Backlog and boards
- **`backlog.json` v464.** The changes were applied by `b-round-467/update-backlog-468.py` (`.done` marker):
  - D-29z1647, D-29z1648 and D-29z1649;
  - ROOT-REQ-DP-GATE-FIRST;
  - SABA-B-15 and TLM-R468-SABA-SCROLL-DEVICE;
  - the round-468 entry, with round 467 marked done.
- **`feature-status.md`:** the round-467 row (მზადაა), the Saba items row and the round-468 row (მუშავდება). Applied by `update-feature-status-468.py`.
- **`lessons.md`:** L18 gains the scroll-frame clause. The file stays at 60 lines.
- **Backups:** the pre-edit copies are in `b-round-467/*-before-468.*`. The task archive is `tasks/round-467.md`.

## 5. Architecture signals and root
- **Architecture:** A-467 reported no new note. No checkpoint is requested this round. ARCH-CHECKPOINT-STYLE-SCAN and its addendum stay with root, non-blocking.
- **Root, non-blocking:**
  - ROOT-REQ-DP-GATE-FIRST: the first design-philosopher + product-designer review of the Store. The STORE-2b code stages are closed. Include SABA-B-16 and the critical stance.

## 6. Ready for commit
Nothing new is in the store tree: round 467 is already published as `9ba13ac`. Round 468 starts from a clean `9ba13ac`.
