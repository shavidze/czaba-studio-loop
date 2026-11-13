# A round 494: B-R488-PASSWORD-MODAL-DIALOG, docs-only v6 (C-R493-01)

**Result: IMPLEMENTED (no STOP).** I applied the v5→v6 delta and changed no sketch line. Every check A runs is green, and the reviewer found nothing at Medium or above.

## Start state
- HEAD `e4e1d1c`. The tree holds v5 on exactly the 6 granted paths (4 `M`, 2 `??`). The list is in `a-round-494/git-status-end.txt` and did not change during the round.
- **Start check:** `bash ../tmp/studio-real-loop/b-round-493/claims-494.sh` rc 0.
  - stdout is byte-equal (`diff`) to `b-round-493/claims-494-planning-output.txt`.
  - stderr equals `claims-494-planning-stderr.txt`.
  - Saved as `a-round-494/a494-start.txt` and `a494-start-err.txt`.
- **Case:** "Tree holds v5 (expected)".

## Apply
- `git apply --check b-round-493/sketch-494-delta-v5-to-v6.patch.txt`: OK.
- `git apply`: OK.
- **Claims script again:** rc 0.
  - stdout equals `b-round-493/claims-494-sketch-output.txt`, and stderr equals `claims-494-sketch-stderr.txt` (`a-round-494/claims-after.txt`, `claims-after-err.txt`).
  - K5 reads `sketch-494-files ======`, `patch=a4799d4735fe6970` = `recorded`, `delta=29a0ec9eb435433b` = `delta-recorded`, `v5-files ===xxx`, `v3-files ===xxx`.
- Doc 318 l.4 reads `**სტატუსი:** Completed (C round 494 PASS)`.

## Commands (actually run)
| Command | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-494/typecheck.log` |
| `npm run lint` | rc 0. 648 files, 183 warnings, 1 info, no errors | `a-round-494/lint.log` |
| Covering vitest (`tasks/round-492.md` §2, 6 files) | 6 files / 97 tests passed. 3.82 s total, far below 50 % of any timeout | `a-round-494/covering.log` |

- **Biome on the owned paths:** `npm run lint` covers the 3 code paths, and they are byte-equal to v3.
  - On doc 318, `npx biome check` printed "No files were processed in the specified paths … ignored" (`biome.json` includes `app/**` only, L30).
- **A self-checks (lessons, A section):**
  - L11: no STOP.
  - L26: doc 318 has the 7 TEMPLATE headings in order, at l.7, 20, 38, 51, 60, 66 and 88.
  - L28: l.4 is byte-exact.
  - `C round N pending` in `docs/implementation`: 0.
  - "round 493" count: 0/0/0 in 315/317/318. "round 492" count: 0/0/2 (K10).
  - L31: covering is tiny, 3.37 s of test time in total.
  - Ledger rows 3–5, 36, 64, 86 and 90 exist as labelled (`doc-ledger.md` l.9, 25–27, 32, 36, 37).
- **315/317 backing:** the reviewer had no shell. The claim that only "493→494" changed rests on the sha-verified delta (K5 `delta` = `delta-recorded`) and the `sketch-494-files ======` match, plus the reviewer's read of the delta and the greps above.
- **Not run, as the task says:** the full suite, the build and browser probes.

## Code-reviewer (actual subagent, on the 3 docs, with the task's instruction)
- **Verdict:** no false sentence in doc 318. All 7 TEMPLATE headings are present.
- **315/317:** only the "round 493"→"494" changes (315 l.39, l.105, l.117; 317 l.45).
- **Medium+:** none, so no STOP.
- **Contradiction rule:** under D-29z1762, a sentence is a STOP only when an evidence file contradicts it. The reviewer cited no such file for any doc sentence.

| # | Sev | Doc line | Ledger row | Ruling |
|---|---|---|---|---|
| R1 | Low | l.4 "Completed (C round 494 PASS)" written before C | row 3–5 | Already ruled (L28, task §2 "doc l.4 written before C") |
| R2 | Low | l.90 "verifies the current password" | row 90 (K19 proves only "always throws") | The sentence is true: `app/lib/auth.ts:379-384` checks the login, then throws at l.389-391. The ledger row lacks that citation, which is a ledger gap for B. Not a STOP, no edit |
| R3 | Low | l.64, the problem half (ref cleared at once, focus on the fading Cancel) | row 64 (PD4, P11 prove the fix only) | No contradicting file. The ledger names no evidence for the earlier behaviour, which is a ledger gap for B. Not a STOP |
| R4 | Low | l.86 "C round 492 PW-CHECK PASS" | row 86 | True: `c-round-492/pw-check.txt:55` reads PASS, 54 rows. A reader could take it for a whole-round PASS, although round 492 was `FAIL ['C-R492-01']` (K22). The wording is accurate and the line is ruled under A-R493 F3. Wording note for B |
| R5 | Info | l.36 / l.95 (40 px strip) | row 36 | See the detail below. Doc not false. B should check whether row 36 should keep citing f1.json |
| R6–R9 | Info | l.63, l.85, l.9–30, l.55, l.68–83, l.93, l.97, structure | various | Checked against the named files: they match |

**A checked R5 directly.**
- **The doc text:** doc 318 l.36 and l.95 assert the 40 px strip, credited to B's measurement at 3 viewports. They also assert the page-background hit and that the dialog stays open. They name no cause and no ancestor.
- **The ledger:** row 36 (`doc-ledger.md` l.26) cites B's two backdrop-probe.json files first and f1.json second.
- **f1.json:** its `backdropBox` [272,319.6,896,255] cannot be the backdrop, because f1's own hit at y=10 is `inDialogRoot: true`. It reads like the centred panel. f1's hits agree with the strip: in at H−60, out at H−30 and H−5.
- **Ruling:** no contradiction, so no STOP. B may want to re-cite row 36 to f1's `hits` only.

**R5 field values (as reported).**
- `c-round-493/f1.json` gives `fixedAncestor "space-y-10"` and `backdropBox [272,319.6,896,255]`.
- `b-round-493/probe/backdrop-probe.json` gives `backdropRect [0,0,1440,860]` and `containingBlockAncestor null`.
- The two files' hit tests agree: inside at y=840, outside at y=870.
- The doc names no cause, so these fields do not make any doc sentence false.

**Architecture note:** none new. SIG-R487-PROFILE-NAME-EDITOR-EXTRACT is kept as ruled.

## Changed files (this round)
Only these 3 docs changed, through the delta:
- `docs/implementation/2026/quarter-IV/318-password-dialog-semantics.md`
- `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`
- `docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md`

The tree still holds v3 code and tests on these paths:
- `app/routes/account.tsx`
- `app/lib/__tests__/account-password-dialog.test.tsx`
- `app/lib/__tests__/account-profile-name.test.tsx`

No protected or forbidden path was touched.

## Known gaps
- **Not verified by A:** C5, C5b, C7, C9 and the browser half of l.22, l.36, l.93 and l.95. These are C's rows.
- Ledger gaps R2 and R3 and the citation question in R5 are for B. I did not edit B's files.
- OWN-BACKEND and B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED stay open with root (backend unavailable in cloud).

## Next C checks (task §3, in full; this is not a short route)
1. C1 SOURCE-SCOPE, C2 CLAIMS (start and end), C3 K5, C4 covering 6/97.
2. C5 PW-CHECK on a fresh production build, then C5b `backdrop-probe.mjs` (`stripPx` 40, the `min-h-screen` hit, dialog count 1, at all 3 viewports).
3. C6 mutants, C7 visual (including the keyboard-opened Current Password crop), C8 auth + Studio.
4. C9 doc truth (including l.93 `ctrlk-esc-probe` on 5195/5196, and l.36/l.95 against C5b).
5. C10 L57.

## B acceptance passed by A
- [x] Start check: v5 case, exact match.
- [x] Delta applied. The claims script equals the sketch output, and K5 is `======` with the patch and delta pairs equal.
- [x] typecheck rc 0, lint rc 0.
- [x] Covering 6 files / 97 tests.
- [x] Code-reviewer run; every finding is mapped above, none is Medium+, and there is no STOP.

The whole backlog item is **not** done: it waits for C round 494.
