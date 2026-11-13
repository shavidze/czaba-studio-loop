# Doc 318 ledger addendum (B, round 494 -> 495 planning)

Closes A's ledger gaps R2, R3 and R5 (`a-round-494.md` code-reviewer table). Doc 318 is unchanged; only the evidence column grows. Doc text read at `3bcf8cb` (`git show 3bcf8cb:docs/implementation/2026/quarter-IV/318-password-dialog-semantics.md`).

| Doc line | Gap (A) | Added evidence | Kind |
|---|---|---|---|
| 90 "updatePassword verifies the current password, then always throws" | R2: row cited K19 ("always throws") only | `git show 3bcf8cb:app/lib/auth.ts` l.379-384 (login with the current password, catch -> CURRENT_PASSWORD_INCORRECT) and l.389-391 (unconditional `throw new Error('Password change is not yet implemented...')`) | source reading at the published commit |
| 64 "problem" half (ref cleared at once, focus stayed on the fading Cancel) | R3: row cited PD4/P11 (the fix) only | `a-round-488.md` l.50 (code-reviewer L1: `closePasswordModal` clears the ref immediately; a save settling during the AnimatePresence fade with focus on Cancel is neither restored nor on body) = finding A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW. Not a browser measurement: the sentence is a description of the reviewed pre-fix code, labelled as such here | source review (no browser before-measurement exists; none is claimed) |
| 36 / 95 (40 px strip) | R5: row cited `c-round-493/f1.json` whole | Re-cited: `b-round-493/probe/backdrop-probe.json`, `b-round-493/probe/prod/backdrop-probe.json`, `c-round-494/backdrop-probe.json` (C5b PASS, 3 viewports); `c-round-493/f1.json` only for its `hits` array (in at H-60, out at H-30/H-5). Its `backdropBox` field measured the centred panel, not the backdrop, and is not evidence for l.36 | re-citation |

C round 494 C9 checked l.36/l.95 against its own C5b run; l.64's "before" half and l.90 were not re-measured by C (`c-round-494.json` notRun) and are not claimed as C-verified.
