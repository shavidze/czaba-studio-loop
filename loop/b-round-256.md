# B round 256 → 257 planning

**Date:** 2026-10-29, about 23:18–23:45 UTC. **Decisions:** D-29z491…D-29z498. **Advisor:** used before writing (available). **Project agents:** none consulted (see D-29z498).

## Inputs read
- **C:** `c-round-256.json` and `c-round-256.md`.
  - **Verdict:** FAIL, with `browserVerified` and `realVerified` both true. 16 rows PASS.
  - **Bugs:** C-R256-01 (Medium) and C-R256-02 (Low). The purchased origin is BLOCKED because the backend is unavailable.
- **Gate:** `gates/gate-round-256.json` is `skipped` ("C taskStatus FAIL"). Nothing was published. The last publication is still `a061d52` (gate 255).
- **A:** `a-round-256.md`. It had no STOP. Its reviewer scored 8/10; M-1 was fixed, and M-2 is the same issue as C-R256-01.
- **Task:** the round-256 task, archived **before** any edit as `tasks/round-256.md`.
  - Snapshots: `b-round-256/*-before-257`, `head-at-planning.txt` and `git-status-at-planning.txt` (14 lines = the round-256 diff).
- **Context:** `context/active-summary.md` (its header lines only), `lessons.md`, `regression-last.json` (2026-10-27), and targeted greps of `backlog.json` and `feature-status.md`.

## Backlog updates (only from independently evidenced C results)
- **Round 256 is not done.** SABA-B-9 stage 1 is **ბაგია**, not მზადაა: C FAIL, gate skipped.
  - Every other row passed in the browser. They carry by diff identity into round 257 (D-29z493).
  - B-R249-PAUSE-LABEL stays open until round 257 passes.
- **Opened:**
  - C-R256-01 (Medium), dispatched in round 257;
  - C-R256-02 (Low), fixed in round 257 rather than deferred (D-29z494);
  - A-R256-REVIEW-STALE-GUARD (info);
  - A-R256-REVIEW-INFO (pre-existing info: no `role=group`, separators without `aria-hidden`, the token name, the Stop title).
- **`deferred_low_polish` (426):** + A-R256-REVIEW-SPACE-ON-FOCUSED, which is also SABA-Q-9-TRANSPORT (e).
- **Architecture signal (not scheduled):** A-R256-ARCH-PLAY-STOP-COMMANDS. It and the stale guard go to the pending, non-blocking ARCH-CHECKPOINT-TRANSPORT-POSITIONS through `b-round-256-checkpoint-addendum.md`.
  - SABA-B-9 stage 1 is a feature boundary on the same owner, so the request goes to root again. Stage 2 does not wait for it.
- **Regression:** REGRESSION-ROUND-2026-10-30 `scope_additions` gains C-A11Y-257 (together with the round-256 rows).

## Ruling on C-R256-01 (D-29z492; L10)
- **Chosen:** Play and Stop get `aria-describedby`, pointing to one hidden state element: `display: none`, not live, not focusable, with the text "Playing" or "Stopped" from `strings.ts`.
  - The name `Play` stays constant.
  - It adds 0 visible text lines.
  - It fits grant 1 and needs no context change.
- **Rejected:**
  - **`aria-pressed`:** a second press on Play is a no-op (R5), so a "pressed" toggle would misdescribe it.
  - **A status write:** `StudioWorkspace.tsx` and `ArrangementContext.tsx` are frozen, and it would need an L51 clobber analysis.
  - **A transport live region:** it would compete with the conditional stop status (`StudioWorkspace.tsx` l.1928–1941) and with the ready and refusal texts.
  - **`sr-only` text:** a stray word in browse mode.
- **Listed deviations:** DV1 (no announcement on change), DV2 (the description replaces the title-derived "Play (Space)") and DV3.
- **Reference:** I searched the Live 12 accessibility chapter (41.x, WebFetch) and the web. Neither says how Live exposes the Play state: "no reference found". 41.4.1.1 "accessible groupings" is recorded.
- **Correction made while writing (L29):** the first draft said the status line "already announces the stop". The grep showed that it does so only after a while-playing marker or Follow-paused text. DV1 and question (f) were reworded.

## Pre-check (L23)
- **Scratch:** the whole working tree in `/tmp/b256-scratch` with the sketch (`b-round-256/probe/sketch.diff`).
  - `tsc` rc 0.
  - `vitest run app/lib/arrangement app/components/arrangement app/contexts`: 170 files, 2,513 tests; 1 fail = ST10 (granted as C10).
- **Chromium CDP** (port 5181, stopped): at both viewports the description is Stopped, then Playing, then Stopped; the names are constant; the toolbar is 49 / 87 px; the state element's box is null.
  - **Control (the :5173 round-256 tree):** the description was the title `Play (Space)`.
- **Hash artifacts:** `b-round-256-r257-{grants,carried,root-files}.txt` and their sha256 files, plus `b-round-256-r257-tree-sha256.txt` (1,106 files; the 7 protected files are inside). The carried diff sha is `b261346f…` and the full `git diff HEAD` sha is `7faaa604…`.

### Advisor final-check fixes
- **jsdom:** no jest-dom in this repo, so TC10 uses `getByRole(..., { description })`. The probe went green on the sketch and red under a mutant (`probe/jsdom-description-probe.txt`).
- **Biome:** clean on the scratch sources.
- **L50:** 2 hits on the working tree and 2 on the scratch. The new multi-line ternary matches 0 times; B ruled on it by hand.
- **M9:** reworded to the lines that really go red first (l.330, l.362 and the new l.472-site line).
- **L31:** headroom cited from `a-round-256.md` §5.
- **C-A11Y control column:** it cites the existing evidence; no new HEAD server is needed.
- **Cleanup:** the scratch at `/tmp/b256-scratch` was removed, and the store status is unchanged (14 lines).

## Lessons (D-29z495)
- L29 gains the removed-accessible-signal clause (C-R256-01).
- L4 gains the collision-row wording clause (A-R256 rows 5/6).
- The file stays at 58 lines.

## Next task
- **Round 257:** the SABA-B-9 stage 1 fix-up (`current-task.md`).
  - **A:** 7 grants.
  - **C:** new C-A11Y-257, plus short re-runs of ONSTATE, FOCUS, KEYS, LAYOUT, BUDGET, LAB-SMOKE and Auth. Round-256 rows carry by diff identity.
- **After a PASS and publication:**
  - REGRESSION-ROUND-2026-10-30, if the date is 2026-10-30 or later; it is not due today (2 days, and the diff is unpublished);
  - then SABA-B-9 stage 2 (master volume bottom-right), SABA-B-11c, and SABA-B-7 when Saba answers;
  - RETRO at round 260.

## Decision: CONTINUE
- A large approved scope remains.
- No critical or high bug is open from C.
- Nothing needs outside information to proceed. The Saba questions all have defaults and do not block.
- So the decision is neither COMPLETE nor BLOCKED.

## Readiness for root
Nothing is ready to commit from this planning: round 256 is unpublished and failed C. The round-256 + 257 diff becomes publishable after C round 257 PASS and the gate.
