# B round 158 → round 159 planning (D-29z124)

Date: 2026-10-25 · Author: B · Advisor: **used** (available; called before writing and before finishing; advice followed — fix-up rather than deferral, the `motion-reduce` half, no app.css route, baseline = the round-158 tree, doc 127 end hash corrected, code-reviewer required, CASCADE-SCOPE tagName check)

## Inputs read
- `context/active-summary.md` (head), `gates/gate-round-158.json` (**skipped**, C taskStatus FAIL → no publication, baseline HEAD stays `f8a316a`), `env-status.json` (store 200).
- `current-task.md` (round 158), `a-round-158.md`, `c-round-158.md`, `c-round-158.json`, `b-next.json` (round 157).
- `backlog.json`: looked up by ID only (VISUAL-A-OBSIDIAN, open_findings B-R157-*, rounds, architecture_signals, deferred_low_polish count 219).
- `regression-last.json`: 2026-10-24, so the regression is due on or after 2026-10-27 (not due today).
- `user-review/`: no `ableton-decisions.md` and no `design-ux-decisions.md`.
- Source, read only: `app/styles/app.css` l.280–330 (the global transition rule; no `prefers-reduced-motion` block anywhere in the file); `ArrangementTransport.tsx` l.40–41; `transport-surface-ui.test.tsx` TS1; `package.json` versions (tailwindcss ^4.1.18, tailwind-merge ^3.4.0).

## C round 158 evidence → backlog (only what C evidenced)
| Item | C evidence | Backlog / status |
|---|---|---|
| V-3a | All rows PASS at both viewports except SURFACE-STYLE (h)/(h-rm); `browserVerified` and `realVerified` true | **ბაგია**, not მზადაა. `rounds[158]` = `c_fail_low` |
| C-R158-01 (Low) | `c-round-158/out/surface-*.md` (h) 0/24, (h-rm) 0/12; served CSS shows the unlayered rule | open, scheduled round 159 |
| B-R157-EXPORT-PEAK | OVERLOAD-CHECK: warning rendered, count = the file's exact full-scale samples (797/797, 4688/4688) | **closed (info)** |
| ENV-FIRST-LOAD (cold Vite + new lucide import) | 1 invalid run, 0 recurrences in 8 warm sessions | root note ENV-FIRST-LOAD-LUCIDE |
| Idle toolbar readability (A + C note) | screenshots | A-R158-IDLE-TOOLBAR-NOTE, on the D-29z123 R3 veto list (not a finding) |

The round-158 working tree matches `a-round-158/end-sha256.txt` 4/4, re-checked by B at planning.

## Decision D-29z124: a bounded fix-up, not deferral
- `tasks/round-158.md` §7 "C FAIL Low only" allows a fix-up when the failure is in V-3a's own code and the fix is cheap. Both hold:
  - the failing string is `toolButtonClass`;
  - the fix is 4 tokens in 1 file plus 1 test.
- **Why not defer:**
  - V-3b and V-3c copy this recipe into about 8 more components. Deferring means fixing it many times later.
  - Root cannot publish V-3a without a C PASS, and stacking V-3b on an unpublished failing stage raises risk.
- **Mechanism, checked before writing:**
  - `b-round-158/tw-probe.mjs` (the store's Tailwind 4.1 compiler) shows that the trailing-`!` forms generate `!important` inside the right media queries.
  - `b-round-158/cascade-probe.cjs` in real Chromium on `/studio-lab` returns `background-color, color` / `0.18s` / `cubic-bezier(0.2, 0.8, 0.2, 1)`; with `reducedMotion: 'reduce'` it returns `transition-property: none`.
  - This is planning data, not a C row.
- **Rejected: the app.css route.** It is Store-wide: moving the rule into `@layer base` would also activate dead transition utilities on Store pages. It is recorded as the root signal **ROOT-GLOBAL-TRANSITION-RULE**.
- **Rationale for the smallest honest behaviour:** the spec says 180 ms colour motion, and R3 promised no motion under reduced motion. The fix delivers exactly that on the transport only. CASCADE-SCOPE checks that nothing else changes. The accepted side effect is that the transport focus ring now appears at once, without the global 0.25 s fade.

## Round 159 summary (`current-task.md`)
- **Owner A, 3 grants:** `ArrangementTransport.tsx` (F1), `transport-surface-ui.test.tsx` (TS1 only) and doc 128 (D2'). No new files.
- **Frozen:** 975 files. Doc 127 is frozen at its round-158 hash.
- **Mutations:** m156 and m157.
- **A's generation check:** read the served dev CSS. It proves that the rules are generated, not that they win the cascade.
- **C rows:** T159-TARGETED, SOURCE-SCOPE, AN-REVIEW, SURFACE-STYLE (a)–(i) plus (h-rm) on computed style at both viewports, CASCADE-SCOPE (new), RV1-V3A (one run), short FUNC-SMOKE-T, G159-3 and PX-NET/REG-HYD.
- **Outcome table (§7):**
  - On PASS, root publishes rounds 158+159 together and round 160 = V-3b.
  - If B plans on or after 2026-10-27, the regression round comes first.
  - If (h) fails again, B re-plans with options; nothing is silently deferred.

## Architecture signals (recorded, not scheduled)
- ARCH-R158-TOOL-BUTTON-RECIPE: A reviewer note 1. It is added as question 4 in `b-round-158-checkpoint-request.md`, an addendum to the pending `b-round-157-checkpoint-request.md`, not a re-ask. The natural point is before V-3c; it is non-blocking.
- ARCH-R158-AUDIOCONTEXT-FIXTURE: A reviewer note 2 (81 test files each define FakeAudioContext). Keep for now.

## Scope check (nothing shrunk, nothing newly deferred)
- **Still to do:** V-3a (fix-up), V-3b, V-3c, M1, M3, M4, the deferred Lows (219), T12-ADVANCED, the 3-day regression (due 2026-10-27) and the final regression.
- **Awaiting the user:** V-2b-DISPLAY, B-R153-PREVIEW-DUR, Q-V3-ICON-SIZE (default chosen, vetoable), ABL-R, DUX-R, M5 and phase 2.
- **Deferred by the user:** SRW-21.
- **Out of scope, unchanged:** professional plugins/effects, pitch and multiple video layers. Grid tempo is not audio stretch.
- **Purchase protection:** G158-3 PASS (401 for the token route, "Sign in required" on `/studio/middle-east`). The reusable `/studio-lab` workspace opens anonymously.

## Ready for commit?
- No. Round 158 is not publishable: C FAILed it and gate 158 skipped it.
- Rounds 158+159 become publishable together after a C PASS in round 159.
