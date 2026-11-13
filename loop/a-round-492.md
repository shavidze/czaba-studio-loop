# A round 492: B-R488-PASSWORD-MODAL-DIALOG

**STOP — needs B ruling on doc 318 l.22 (task §2 STOP clause "a doc 318, 315 or 317 line is false at hand-over").**

Everything else is green, and the sketch is applied byte-equal. The tree is left as it is, with the sketch applied, nothing reverted, and no sketch line edited.

## The STOP
- **The line.** `docs/implementation/2026/quarter-IV/318-password-dialog-semantics.md` l.22 reads: "ვიზუალი უცვლელია, გარდა იმისა, რომ გახსნისას Current Password ველს focus ring უჩნდება". In English: visuals are unchanged, except that on open the Current Password field shows a focus ring.
- **Why it is false.** It does not hold for a mouse open:
  - The task's own Deviation: "Mouse-opened dialog: no ring on the first field", because of the SABA-B-4 rule `html[data-focus-source="pointer"] :focus-visible { outline: none }`. That rule is at `app/styles/app.css:241`; claims K19 confirms it with `focus-source-rule=1`.
  - `b-round-491/probe/open-pxdiff.txt` shows `n:0` px versus HEAD for the mouse-opened dialog at 1440x900, 1280x720 and 375x812.
  - The ring appears only on a keyboard open (C5 P7).
- **Second half.** "Visuals otherwise unchanged" is also incomplete: after a keyboard close, focus now returns to the trigger, which shows the ring (C5 P6).
- **Who found it.** My code-reviewer, Low #1. A Low still falls under this clause, which has no severity floor. `sketch-review.md` has no ruling on this sentence (TL-R492-V2-I3 says every v2 sentence was true; this sentence is in v1–v3). A may not edit sketch lines, and an edit would break K5.
- **Origin:** B spec (dispatched sketch v3).
- **Suggested ruling (B decides):** grant a one-line edit of l.22, for example "keyboard-ით გახსნისას Current Password ველს focus ring უჩნდება, mouse-ით გახსნისას არა (SABA-B-4); keyboard-ით დახურვისას ring trigger-ზე ჩანს". Or rule the line acceptable.

## Start state and apply
- **Start:** HEAD `e4e1d1c961e1390dafa2eda602ee4ba70e7b8460`, clean tree (`a-round-492/start-status.txt`, 0 bytes).
- **Start check:** `bash ../tmp/studio-real-loop/b-round-491/claims-492.sh` gave rc 0 and empty stderr. Its output `a-round-492/claims-start.txt` equals `claims-492-planning-output.txt` (diff empty).
- **Patch:** `sketch-492.patch.txt` sha256 `f530e0f3…0bc5c8` equals `sketch-492.sha256`. `git apply --check` and `git apply` both gave rc 0 (`a-round-492/apply.txt`).
- **Claims after the apply:** `a-round-492/claims-sketch.txt` equals `claims-492-sketch-output.txt` (diff empty), with empty stderr. K5 reads `====== patch=f530e0f3f9661e5d recorded=f530e0f3f9661e5d`.
- **`git status`, exactly the 6 granted paths:** ` M` account.tsx, ` M` account-profile-name.test.tsx, ` M` docs 315 and 317, `??` account-password-dialog.test.tsx, `??` doc 318.

## Commands run (logs in `a-round-492/`)
| Command | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0. 183 warnings repo-wide; gate 491 `verify.log` had 187, so the sketch removes the 4 account.tsx warnings (`lint.log`) |
| `npx biome check app/routes/account.tsx` | rc 0, 0 diagnostics (`biome-account.log`) |
| `npx biome check` on account.tsx and the two test files | rc 0, 0 diagnostics (`biome-owned.log`) |
| The covering vitest command (6 files) | 6 files / 97 tests passed (`covering.log`). The slowest test took 90 ms against the 5 s default timeout, so none is near 50 % |

Not run, per task §2 (gate or C rows): full suite, build, browser probes, mutants.

## Code-reviewer: actually run on the 6 paths
- **Verdict:** 0 Critical, 0 High, 0 Medium. The reviewer scored it 8/10.

| # | Sev | Finding | Mapping |
|---|---|---|---|
| 1 | Low | Doc 318 l.22: the ring claim is false for a mouse open; a ring now shows on the trigger after a keyboard close | **STOP** (above) |
| 2 | Low | Doc 318 l.4 says PASS before C has run | Ruled: TL-R492-L7 / L28 |
| 3 | Low | The Esc guard checks only `e.isComposing`. The project helpers (`app/lib/focus-source.ts:50`, `studio-ime-composition.ts:9`) also treat `keyCode === 229` as composing; Safari sends the composition-ending Esc with `isComposing=false`. PD13 cannot catch this | New, **A-R492-REVIEW-L1-IME-KEYCODE229**. Same gap as the LeadMagnet precedent. **Flag for B** |
| 4 | Low | The same error submitted twice is not announced again: the batched `setError('')` then `setError(msg)` leaves the alert node unchanged | New, **A-R492-REVIEW-L2-REPEAT-ALERT** |
| 5 | Low | Esc, Cancel or the backdrop during a pending submit, followed by a failure: the error goes to the closing instance and the user sees nothing. Reachable today, because `updatePassword` always throws | The focus half is ruled (matrix cell "closed, fading × E"). The silent-error half is new: **A-R492-REVIEW-L3-DISMISSED-ERROR-SILENT** |
| 6 | Low | The fading backdrop still catches clicks, so a reopen during the fade works by keyboard only. PD14 uses `fireEvent` and skips hit-testing | New, **A-R492-REVIEW-L4-REOPEN-MOUSE**. Related to the TL-R492-V2-L1 and P18 rulings |
| 7 | Low | The trap selector is hard-coded to `'input, button'` (no `a[href]`, `select` or `[tabindex]`) | New, **A-R492-REVIEW-L5-TABBABLE-SELECTOR**. Fine for today's markup |
| 8 | Low | PD8 (test l.188): `toBe(middle)` cannot fail, because jsdom never moves focus on Tab | New, **A-R492-REVIEW-L6-PD8-VACUOUS** (L52). **Flag for B** |
| 9 | Low | PD10 (test l.210): `not.toBe(true)` also passes when the value is `undefined`; PD14 uses `toBe(false)` | New, **A-R492-REVIEW-L7-PD10-WEAK** |
| 10 | Low | PD3 checks only one of the three Hide names | New, **A-R492-REVIEW-L8-PD3-PARTIAL** |
| 11 | Low | PD11 and PD15: jsdom cannot show the browser's focus fixup when a focused button becomes disabled | New, **A-R492-REVIEW-L9-DISABLED-FOCUS-BROWSER**. C5 P11 is the nearest browser row |
| 12 | Info | The keydown listener re-subscribes on every parent render (new `onClose` identity) | Ruled: TL-R492-I6 |
| 13 | Info | Esc does not `stopPropagation`; with Ctrl+K open, the trap pulls focus back into the dialog | Palette: ruled, TL-R492-L4. The pull-back detail is new info: **A-R492-REVIEW-I1-PALETTE-TRAP** |
| 14 | Info | No `aria-invalid` or `aria-describedby` on the inputs | Info; optional in APG |

All new ids are below the Medium threshold. None was fixed, because all of them are inside sketch lines.

## Architecture note (proposal for B and root, not done)
- **Recommendation:** keep, from signals 4 and 2. `passwordModalOpenRef` is now shared by the name editor's focus arbitration and the dialog's idempotent close, and `PasswordModal` gained its own focus, trap, Esc and inert lifecycle. Extracting it now would duplicate the open-state bookkeeping while ARCH-CHECKPOINT-ACCOUNT-PROFILE waits for root.
- **After root answers:** one bounded task for a local `usePasswordDialogFocus(dialogRef, isPresent, onClose)` with a real tabbable query. PD1–PD15 and PN10f/PN10g would stay unchanged.
- **Longer term:** the reviewer notes that a native `<dialog>` with `showModal()` is the better base for the shared Modal work (shared-modal-no-focus-management).

## Acceptance status
- **Passed by A:**
  - start check equal;
  - apply rc 0 and K5 `======`;
  - claims after the apply equal;
  - typecheck rc 0;
  - lint rc 0;
  - Biome on account.tsx: 0 warnings;
  - covering 6 files / 97 tests;
  - code-reviewer run, with every finding mapped.
- **Not passed:** "doc 318, 315 and 317 lines true at hand-over". Doc 318 l.22 is the STOP. Docs 315 and 317 and the other lines of doc 318 were checked by the reviewer and found true; every PD id doc 318 names exists in the test file.
- **Not claimed:** any browser, mutant, full-suite or build row.

## Next C checks (L22, a STOP on a ruled clause, with a diff)
- **C1 SOURCE-SCOPE:** the 6 paths above.
- **C2 CLAIMS:** the output equals `claims-492-sketch-output.txt`.
- **C8 AUTH + STUDIO**.
- **The STOP's named check:** doc 318 l.22 against `open-pxdiff.txt` and the task's Deviation bullet.
- **Report:** a short FAIL, "STOPPED — routed to B".
- **If B grants the doc 318 l.22 change:** A applies only that line on re-dispatch. C then runs the full §3 table, C1–C10.
