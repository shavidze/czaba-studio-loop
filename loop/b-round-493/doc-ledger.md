# Sentence → evidence ledger, doc 318 v6 (after tech-lead TL-R494-D1…D3, L1…L3) (+ changed lines of 315 / 317)

Sketch: `b-round-493/sketch-494/` (full patch sha256 in `sketch-494.sha256`). Line numbers are v6 lines of `318-password-dialog-semantics.md`.
Rule (RC-R492-DOC-TRUTH-REVIEW, 2nd occurrence): every declarative sentence maps to a PD test, a C5 P-row (`c-round-492/pw-check.txt`, same code), a claims K-line, a B probe file, or it is worded as inference / decision. Cross-checked against every open/deferred finding on `account.tsx` / PasswordModal (grep `PASSWORD|TL-R492|A-R492-REVIEW` in backlog.json).

| Line | Sentence (short) | Evidence |
|---|---|---|
| 1 | title: real modal dialog | PD1, P1 |
| 3–5 | date, status (L28 form), scope | L28; K2/K5 (6 paths) |
| 9–16 | HEAD facts: 0 dialog, focus stays on trigger, Esc no close, Cancel→body, fields/eyes unnamed, no alert | `b-round-491/probe/pw-check-head.txt` (48 RED, K11) |
| 18 | three Medium ids, APG + WCAG sources | backlog ids (K16); source names only |
| 22 | change only in account.tsx (code) | K3 other-app-diff 0, K5 |
| 22 | mouse-open pixel match except the Current Password text caret (screenshots taken without caret, Playwright default; HEAD has no caret, focus stays on trigger, pw-check-head P2): 0 px at 16/255, 823–1158 px ≤ 8/255 unthresholded (TL-R494-D2) | `b-round-491/probe/open-pxdiff.txt`, `b-round-492/probe/open-pxdiff-zero.txt` (K25) |
| 22 | focus always moves; ring only for keyboard: keyboard open ring on Current Password, Esc close ring on trigger; mouse open / mouse Cancel / backdrop no ring; SABA-B-4 | P7 `solid 1px`; P6 `solid 1px`; P2, P8, P9 `none 0px` (K22); K19 focus-source rule |
| 24 | role, aria-modal, aria-labelledby | K4; PD1; P1 |
| 25 | initial focus Current Password; effect on isPresent → reopen during fade clears inert, focus to Current Password | PD1, PD14, P2/P7, P18; mutant MR, MT |
| 25 | same instance keeps typed values (inference) | worded as inference, "not tested" |
| 26 | document keydown trap; last→first, first→last; outside focus (body after heading click, disabled-while-focused) → Tab enters; disabled button skipped | PD8, PD9, PD15, PD11; P5 (8 Tabs inside), P10; mutants MI, MJ, MS, MM |
| 27 | Esc closes like Cancel; isComposing ignored like LeadMagnet | PD4, PD13; MH, MQ; K24 leadmagnet guard |
| 28 | all close paths via closePasswordModal; returns focus; idempotent; late update after Esc does not steal | PD4–PD7; P6, P8, P9, P11, P14; MA, MB (idempotence after a late completion: PD7 + MA only; P13 cannot prove it because `updatePassword` always throws, TL-R494-L2) |
| 29 | AnimatePresence keeps it during exit; isPresent false → listener off, inert; Tab from trigger cannot enter | PD10; P11, P12; MD, MO (jsdom), browser mutO RED P11, P12 (P13 RED only through its comparison with P12, TL-R494-D3) |
| 30 | htmlFor/id via useId; eye aria-labels (3 names); trigger `type="button"`; alert | K4 (htmlFor, eye-labels, alert); PD2, PD3, PD12; P3, P15; trigger type: `account.tsx:298` grep (no test, see l.85) |
| 34 | shared Modal: bg-black/95, z-[1000], portal; no initial focus/trap/return; protected | K20 (bg95, z1000, portal, focus-calls 0); `global_forbidden_files` |
| 35 | ARCH-CHECKPOINT-ACCOUNT-PROFILE unanswered; ref stays | backlog `architecture_checkpoint_requests` status (K16 family) |
| 36 | no scroll lock / no background inert (round 492 decision) | `tasks/round-492.md` l.67 |
| 36 | backdrop blocks pointer except bottom 40 px; backdrop 40 px short at 1440×900, 1280×720, 375×812; click there hits page background, dialog stays open | `b-round-493/probe/backdrop-probe.json` (stripPx 40 ×3, firstOutsideHit = page `min-h-screen` div, dialogCountAfterStripClick 1 ×3; dev server on the v5 tree, code = v6; repeated on a production build of the same tree: `b-round-493/probe/prod/backdrop-probe.json`, identical values); C round 493 `c-round-493/f1.json` (1440, 1280) |
| 36 | keyboard Tab / Shift+Tab stay inside; Ctrl+K exception in TODO | PD8, P5; TODO l.93 (K25 ctrlk probe) |
| 43–48 | state diagram (Exiting→Open on reopen) | PD10, PD14, P18 |
| 53–58 | changed files list | K2, K5 |
| 62 | late update after Esc stole focus (C-R487-01 class) → idempotent close | PD7, MA (not P13, TL-R494-L2) |
| 63 | without inert (browser mutant O): Tab entered fading Current Password; fix inert; P11, P12 red on mutO, green on sketch; P13 red only through its comparison with P12 (TL-R494-D3) | `b-round-491/probe/pw-check-mutO.txt` (P11 RED: exitingInert false; P12 RED: Tab → INPUT Current Password inDialog; `pw-check.py:31` P13 compares with P12); `pw-check-sketch.txt`; C 492 PASS |
| 64 | A-R488-REVIEW-L1: close moves focus to trigger at once | PD4, P11 (focus on trigger after in-flight Esc) |
| 68–83 | PD1…PD15 descriptions | test titles in `account-password-dialog.test.tsx` (K10 pd-ids-missing empty); PD8 non-prevented Tab assert (A-R492-REVIEW-L6 ruling) |
| 84 | PN10f/PN10g updated, other PN unchanged | K5 v3 file equal; `b-round-491/sketch-492.patch.txt` hunk |
| 85 | 20 jsdom mutants all RED, each turns ≥ 1 PD/PN red; trigger `type="button"` has no mutant and no test | `b-round-491/mutants/mutants-summary.txt` (20 RED, 0 other, K13); grep of both test files: no `type` assert on the password trigger (PN1/PN2 assert other buttons) |
| 86 | browser facts (1 dialog, focus on open both modalities, 8 Tabs inside, Esc/Cancel/backdrop return, no Tab into fading dialog, reopen not inert, alert); B measurement + C round 492 PW-CHECK PASS 18 × 3 on the same code | `c-round-492/pw-check.txt` (54 PASS, K22): P1, P2, P7, P5, P6, P8, P9, P12, P18, P15; code equal v3 (K5) |
| 90 | updatePassword always throws | K19 |
| 91 | shared Modal lacks focus mgmt | K20 |
| 92 | manual screen reader check | TLM-R492-SR-PASSWORD-DIALOG |
| 93 | Ctrl+K opens the palette behind the dialog, dimmed under the backdrop (HEAD too); now one Esc closes both | `b-round-492/probe/ctrlk-head-open.png`, `ctrlk-v5-open.png` (palette dimmed top right), `Header.tsx:68` (palette inside the sticky z-50 header); Esc: `ctrlk-esc-probe.json` (K25) (TL-R494-D1, L1) |
| 94 | reopen keeps values (inference) | worded as inference |
| 95 | backdrop 40 px short, strip not dimmed, click does not close | backdrop-probe.json; screenshots `b-round-493/probe/backdrop-*.png`; B-R492-PASSWORD-BACKDROP-SHORT |
| 96 | 375 px: panel touches both edges | `b-round-491/probe/shots/sketchprod-open-375x812.png`; B-R492-PASSWORD-DIALOG-NO-MARGIN-NARROW |
| 97 | Update click disables focused button; Chromium focus → body during request, stays after error; next Tab enters | `b-round-491/probe/sketchprod-pw.json` R7_inflight.activeBeforeEsc, R9_errorPath.active; PD15 / P10 (Tab from body enters); B-R492-PASSWORD-SUBMIT-FOCUS-LOST |
| 98 | late success of an earlier open closes the next dialog; unreachable today | TL-R492-L2-LATE-SUCCESS-PREVIOUS-OPEN (backlog); K19 (TL-R494-L3) |
| 315 l.39 / l.105 / l.117, 317 l.45 | "round 494" renumbering | round number of this dispatch (L28 re-dispatch) |

## Cross-check against open/deferred findings on the same code
- B-R492-PASSWORD-BACKDROP-SHORT → l.36, l.95 (now consistent).
- B-R492-PASSWORD-DIALOG-NO-MARGIN-NARROW → l.96.
- B-R492-PASSWORD-SUBMIT-FOCUS-LOST → l.97; l.26 "button that became disabled while focused" consistent (PD15).
- TL-R492-L4-CTRLK-OVER-DIALOG / A-R492-REVIEW-I1-PALETTE-TRAP (Ctrl+K) → l.36 names the exception, l.93 (palette is behind the dialog, not above it; its title says "over", corrected in backlog).
- TL-R492-L2-LATE-SUCCESS-PREVIOUS-OPEN → l.98. TL-R492-V2-L1-REOPEN-KEEPS-VALUES → l.25, l.94 (inference). A-R492-REVIEW-L3 (dismissed error silent) → not claimed anywhere in doc 318 (no sentence says the error is announced after dismissal).
- A-R492-REVIEW-L1 (IME keyCode 229) → l.27 says only `isComposing`, which is true.
- A-R492-REVIEW-L4 (reopen by mouse) → not contradicted (l.22 lists modalities measured).
- A-R492-REVIEW-L6 (PD8) → l.76 claims only the non-prevented Tab assert.
- B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED → l.90.

## A's round-493 reviewer findings
F1 → fixed (l.36, l.95). F2 → fixed (l.85). F3 → fixed (l.86 past tense, C round 492). F4 → fixed (l.63 names mutant O). F5, F6 → verified true, no change. F7 → fixed (l.95–97). F8 → no change: 315 l.59 and l.107–108 describe round 487/488 scope and runs and stay true historically; the fix is recorded at 315 l.117.
