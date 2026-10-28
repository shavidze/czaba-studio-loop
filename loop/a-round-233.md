# A round 233: CALM-3 follow-up (GATE232-S1 focus rescue + C-R232-01)

## STOP: needs a B ruling on C-R232-01 (task premise invalid; not caused by this diff)

- **Fact (primary source):** `git show HEAD:app/lib/arrangement/__tests__/render-budget.test.tsx`. The test "does not re-render clips, overview bars, library rows or ruler ticks over Play → Pause → Play" (opens l.303) **already declares `15000` at HEAD**, closing at **l.336** `  }, 15000);`. It has done so since commit 4c07d5f (round 154-155 era).
- **l.377**, the line the task grants, closes the *next* test: "moves the playhead, ruler handle and transport time on playback frames without React renders" (l.338). That test took 991 ms at gate 232 (20 % of the 5,000 ms default).
- **So round 232's L32 STOP (`a-round-232.md` l.3-7) was a misread, and so is the premise of C-R232-01 / D-29z315.** The 2,806 ms (gate 232) and 3,017 ms (A, this round) times of the l.303 test are 19-20 % of its declared 15,000 ms. No headroom problem existed.
- **What I did:** I applied the literal grant (§0.1 row 3: l.377 `});` → `}, 15000);`, one changed line). It is harmless, keeps C-SCOPE-233's "3 M + N1 / exactly one changed line" true, and leaves a consistent tree.
- **I do not claim that it closes C-R232-01.** B rules: mark C-R232-01 invalid, and decide whether the extra `15000` on "moves the playhead…" stays or is granted for removal later. Doc 181 states this situation truthfully; it does not claim the timeout was added to the l.303 test.
- Found by the code-reviewer (Minor 1) and confirmed by me with `git diff -U0` and `git show HEAD`.

No other STOP. No test failed or timed out. No covering test is above 50 % of its timeout (see §3).

## 1. Scope
- Baseline: HEAD `bd71144292b1e82e5f0c8934f23bd28ecef0ae3c`, status empty at start. The tree, granted-start and root-files lists all gave rc 0 at start.
- End: `git status` shows exactly 3 `M` plus N1 `??`:
  - M `app/components/arrangement/StudioWorkspace.tsx`: §2.1 only. Module-level `focusPastHiddenOverview` next to `isOverviewTarget`, plus `if (hidden) { focusPastHiddenOverview(); }` in the Ctrl+Alt+O branch, after the repeat/gesture return and before `setOverviewHidden(hidden)`. Same as B's pre-check sketch; the `compareDocumentPosition` filter is kept, with no test claimed for it (MU-2).
  - M `app/lib/arrangement/__tests__/overview-visibility-ui.test.tsx`: OV-T6 added after OV-T2; existing cases unchanged.
  - M `app/lib/arrangement/__tests__/render-budget.test.tsx`: l.377 only (see STOP).
  - ?? `docs/implementation/2026/quarter-IV/181-calm-3-overview-focus-rescue.md` (N1). l.4 is exactly `**სტატუსი:** Completed (C round 233 PASS)` (L28). The L26 headings are in order (კონტექსტი … TODO).
- End checks: the frozen list `b-round-232-r233-tree-sha256.txt` rc 0, the root list rc 0, and the protected files `git diff --quiet HEAD` rc 0.
- A-end artifacts: `a-round-233/changed-end-sha256.txt` (rc 0) and `a-round-233/granted-hunks.diff` (tracked hunks; N1 is untracked, so it is not in it).

### OV-T6 (deviation from B's sketch, allowed by §2.2)
- **Step 1** uses the transport Play button, as §2.2 prefers, instead of the search field. Focus Play, hide with Meta+Alt+O, then show again: focus stays on Play both times, and the Overview really hides/shows.
- **Steps 2-4** are as specified:
  - focused Overview + hide: `activeElement` = `arrangement-video-expand`;
  - show: focus stays there;
  - floating (click expand) + focused Overview + hide: `arrangement-video-placeholder-return`.
- **Added (reviewer Minor 5):** the three focused-Overview toggles also assert that `fireEvent.keyDown(...)` returns `false` (preventDefault). No assertion was removed.

## 2. Pre-flight / primitives
- Pre-flight gate written before coding.
- Read: AGENT_DISCOVERABLE_CODE (helper name is 3 words), TESTING_QUALITY_GATES (OV-T6 asserts the correct behaviour and fails before the fix), GEORGIAN_DOCS (N1).
- Skimmed: FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS and AUDIO_ARCHITECTURE, as the hook asked. No styling or audio change.

## 3. Tests actually run (no full suite, no verify; speed rule)
- `npm run typecheck` rc 0, run twice (after the main edits and at the end).
- `npm run lint` rc 0. The repo has 205 pre-existing warnings and 1 info; `biome lint --max-diagnostics=500 .` shows **0** diagnostics in the 3 grants.
- `npx biome check` on the 3 changed files: clean, no fixes needed. N1 is a `.md` file, which Biome does not check.
- **Covering set** (`b-round-232/covering-files.txt`, 32 files): **32 files / 542 tests passed, rc 0**, in 59.8 s wall time. Log: `a-round-233/covering.log`.
  - This ran before the Minor-5 assertion additions. After those, `overview-visibility-ui.test.tsx` was re-run: 7/7 green.
  - render-budget l.303 test: **3,017 ms / 15,000 (20 %)**; gate 232: 2,806 ms.
  - R11-P1e: 1,835 ms / 15,000.
  - The highest others were UC5 3,747 ms, UC1 2,938 ms and UC2 2,476 ms in `track-group-collapse-ui.test.tsx`, whose describe declares `{ timeout: 20_000 }` (≤ 19 %). Gate 232: 3,677 / 2,829 / 2,592 ms.
  - No other test exceeded 2,000 ms.
- `overview-visibility-ui.test.tsx --sequence.shuffle` (seed 1793217136975): 7/7 green. OV-T6 alone takes ~330 ms.
- **MU-1** (removed the `if (hidden) { focusPastHiddenOverview(); }` call): OV-T6 red and the other 6 green, both on the initial and the final OV-T6. The file was restored from a backup each time, and its sha256 was checked equal to the pre-mutant value (`97bdff1e…` at the first run; the end hash is in `changed-end-sha256.txt`). `git diff --stat` shows only the intended hunks.
- **Browser self-check** (Playwright Chromium against the running :5173; I did not start or stop a server):
  - B's `probe-focus.mjs` and `probe-focus2.mjs` were copied into `a-round-233/` unchanged. The outputs `a-round-233/probe/focus.json` and `focus2.json` are **identical** (sorted-key JSON diff) to B's `b-round-232/probe-fix/focus.json` and `focus2.json`.
  - Probe 1's first attempt timed out in `waitForFunction` (Add button, 90 s), probably while Vite recompiled after my edit (a hypothesis). The log is kept as `probe/run1-attempt1-timeout.out`. The re-run passed.
  - My own `probe-float.mjs`, at 1440×900 and 1280×720 (`probe/float-hide.json`):
    - docked hide → `arrangement-video-expand`;
    - floating hide → `arrangement-video-placeholder-return`;
    - both match `:focus-visible` with a `solid 1px` outline, and there are 0 page errors.
    - Screenshots: `probe/a-docked-hide-*.png`, `probe/a-float-hide-*.png`.
  - Note: `afterEscapePlaceholder: false` means Escape after the floating hide returned the floating video (the placeholder is gone). That is the expected C-FOCUS-FLOAT-233 behaviour, but C must confirm it independently.

## 4. code-reviewer (actual subagent, 4 files)
Score 8/10, no Blocker or Major.

| Finding | Disposition |
|---|---|
| **Minor 1:** timeout line vs doc | Confirmed. This is the STOP above. Doc 181 was corrected to the facts. |
| **Minor 2:** helper does not skip `hidden`/`inert`/`display:none` buttons | No action. All dock buttons are conditionally rendered today. Forwarded to B as a future-hardening signal. |
| **Minor 3:** doc l.4 says PASS while C is pending | No action. L28 makes l.4 the post-PASS value by rule. |
| **Nit 4:** testid used as a runtime selector | No action. Same pattern exists at l.447 (`arrangement-loop-brace`), and §0.3 L40 accepts it. |
| **Nit 5:** OV-T6 does not assert preventDefault | Fixed inside the OV-T6 grant. |
| **Nit 6:** OV-T6 sits between T2 and T4 | Cosmetic, as the task placed it. |

**Architecture note (for B/root; not acted on):** The workspace now depends on `ArrangementVideoDock`'s internal DOM (its testid and button order). The dock already has its own focus rescue (`ArrangementVideoDock.tsx` l.757-781, `floatFocusRef` → `expandButtonRef`), so two components now own the "where does focus go when part of the dock disappears" decision. The reviewer recommends keeping it this round, because a dock-side effect would run after unmount and briefly drop focus to body. Proposal: a bounded later task where the dock owns the rescue, either reacting when its `overview` prop switches to the hidden slot or exposing `focusAfterOverview()`. OV-T6 would be its acceptance, with timing and guards unchanged.

## 5. B acceptance: what I actually passed (A-side only; C verifies)
- §4.1 start checks: pass.
- §4.2 static: pass.
- §4.3 covering + shuffle: pass, no L32 item.
- §4.4 MU-1: pass.
- §4.5 optional browser self-check: done, identical to B's scratch results.
- §4.6 code-reviewer: done.
- §4.7 end checks: pass.
- **GATE232-S1:** implemented, with unit and browser self-check evidence.
- **C-R232-01:** NOT closed. Its premise is invalid; it needs a B ruling (STOP above).

## 6. Exact next C checks
- **C-SCOPE-233:** HEAD `bd71144`; 3 M + N1; the tree, root and `a-round-233/changed-end-sha256.txt` lists rc 0; protected `git diff --quiet HEAD` rc 0. The render-budget hunk is exactly one line, at l.377. Please also confirm independently that l.336 is `}, 15000);` at HEAD (`git show HEAD:…render-budget.test.tsx | sed -n 336p`).
- **C-UNIT-233:** 32 covering files green; `grep -c "OV-T6" overview-visibility-ui.test.tsx` = 1; shuffle green. "The l.303 test declares 15000" is true at HEAD regardless of this diff (l.336).
- **C-FOCUS-DOCKED-233 / C-FOCUS-FLOAT-233 / C-FOCUS-OTHER-233** at both viewports: brass ring px > 0, next Tab → `arrangement-snap-toggle`, Shift+Tab → `arrangement-library-separator`, Meta+Alt+O variant, Escape returns the floating video.
- **C-TOGGLE-233, C-BUDGET-233, G233-3, LAB-SMOKE-233, C-LESSON-233, AN-REVIEW-233, C-REF-233, C-SHOTS-233** as written. For AN-REVIEW-233: the doc cites OV-T6 and two render-budget test names, both of which exist.
- First probes from §6: Space and ← / → on the focused Overview; the round-232 guards; render-budget Overview re-renders = 0.
- TLM-R232-MAC and TLM-R232-ALTGR-WIN: blocked (needs a Mac / a Windows AltGr layout).

## 7. Known gaps
- C-R232-01 is unresolved (see STOP).
- Reviewer Minor 2 (hidden/inert dock buttons) is not handled; it is latent and has no effect today.
- Doc 180 l.42-51 is still stale (B-R232-DOC180-FOCUS-STALE, TODO in doc 181).
- No real Mac or Windows AltGr check.
