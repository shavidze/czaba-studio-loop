# A round 493: STOP. Needs a B ruling on doc 318 l.36 (reviewer F1 vs B-R492-PASSWORD-BACKDROP-SHORT)

**STOP — needs B ruling on doc 318 l.36.** The task's STOP threshold (§2) includes "a doc 318 … line is false at hand-over". The code-reviewer flagged l.36, and the evidence that B already holds contradicts it. No ruling covers it.

- **The l.36 text:** `Pointer-ს ფონზე backdrop ბლოკავს, keyboard-ს Tab-ის ჩაკეტვა.` ("the backdrop blocks the pointer on the background").
- **What contradicts it:**
  - B's own deferred Low **B-R492-PASSWORD-BACKDROP-SHORT** (D-29z1757) records the backdrop box as `[0,0,1440,860]` at 1440×900. The bottom ~40 px strip is not dimmed, and a click there does not close the dialog.
  - Screenshot `b-round-491/probe/shots/sketchprod-open-1440x900.png` shows the undimmed bottom band (y ≈ 860–900), as does the 375×812 shot. Those shots are of the sketch production build, and the v5 code is byte-equal to it.
  - So over that strip the pointer reaches the background. I did not run a new probe; the task forbids it.
- **Not ruled:** I grepped `backdrop|inert|scroll lock|pointer|l\.36` in `b-round-492/sketch-review.md`, `b-round-491/sketch-review.md`, and the "Already ruled" block of `tasks/round-492.md` §2.
  - That block only rules "no scroll lock", which is a design choice. It does not rule the truth of the pointer sentence.
  - The v4/v5 reviewer's verified list covers l.24–30 and l.34, but not l.36.
- **Suggested wording for B (v6, docs only):** `APG scroll lock-ს არ მოითხოვს. Pointer-ს ფონზე backdrop ბლოკავს (ქვედა ~40 px ზოლის გარდა, B-R492-PASSWORD-BACKDROP-SHORT, deferred Low), keyboard-ს Tab-ის ჩაკეტვა.` ("APG does not require a scroll lock. The backdrop blocks the pointer on the background, except a bottom ~40 px strip, B-R492-PASSWORD-BACKDROP-SHORT, deferred Low; the keyboard is held by the Tab trap.")
- **Tree state:** a diff **exists**. The v3 → v5 delta is applied, and K5 is `======`. I edited no doc line beyond the delta, reverted nothing and stashed nothing. **C must not take the L22 no-diff short route as if the tree were unchanged.** Under L22, C runs C1, C2 and C8 and reports "STOPPED — routed to B".

## Start state
- HEAD `e4e1d1c`.
- `git status --short` at start: `M account-profile-name.test.tsx`, `M account.tsx`, `M 315…md`, `M 317…md`, `?? account-password-dialog.test.tsx`, `?? 318…md`. This is the "tree holds v3" case.

## Start check and apply
- **Start check:** `bash ../tmp/studio-real-loop/b-round-492/claims-493.sh` gave rc 0. Its output equals `claims-493-planning-output.txt` (`diff` empty), and stderr is empty (`a-round-493/claims-start.txt`, `.err`).
- **Case used:** the tree holds v3. `git apply sketch-493-delta-v3-to-v4.patch.txt` gave rc 0, with `--check` first.
- **Claims after the apply:** rc 0, and the output equals `claims-493-sketch-output.txt`. Stderr is empty (`a-round-493/claims-after.txt`).
- **K5:** `K5 sketch-493-files ====== patch=ea441270f326dfab recorded=ea441270f326dfab delta=c70366dbf866b3b0 delta-recorded=c70366dbf866b3b0 v3-files ===xxx`. The `xxx` covers the three docs, which differ from v3 as expected.

## Commands
| Command | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-493/typecheck.log` |
| `npm run lint` | rc 0 (183 warnings, 1 info, repo-wide, pre-existing) | `a-round-493/lint.log` |
| `npx biome check` on `account.tsx` + 2 test files (scoped /check) | rc 0, no diagnostics | `a-round-493/biome-owned.log` |
| Covering vitest (6 files from `tasks/round-492.md` §2) | **6 files / 97 tests passed**; slowest test PD1 200 ms of the 5000 ms default (4 %); duration 2.92 s | `a-round-493/covering.log` |

I did not run the full suite, the build or the browser probes, per the task.

## Code-reviewer (actually invoked, on the 3 docs, "check every sentence of doc 318 against `c-round-492/pw-check.txt`")
**Reviewer's limits:** it had no shell. It checked the 315/317 changes against the patch hunks, not `git diff`; they match the working tree. It did not run tests. It reported "no false sentence" in the strict sense and scored the docs 9/10. Mapping of its findings:

| Id | Sev | Line | Mapping |
|---|---|---|---|
| F1 | Low | 318:36 "the backdrop blocks the pointer on the background" | **STOP** (above). No ruling; contradicted by B-R492-PASSWORD-BACKDROP-SHORT and the sketch screenshot |
| F2 | Low | 318:85 "each change's deletion turns ≥1 PD/PN test red" | Ruled: `b-round-492/sketch-review.md` l.25 "l.85: 20 mutants" (verified). The sentence sits under "B's mutants (20)". For B, a test-coverage Low: the trigger's `type="button"` has no mutant or test |
| F3 | Low | 318:86 "C checks in this round" | Not false while the tree is a claim pending C (L28). Wording Low for B (it could become "C confirmed …") |
| F4 | Info | 318:63 "B's first sketch" | Info for B: the behaviour is proven by `pw-check-mutO.txt` P12, but the sketch may not have been the "first" |
| F5 | Info | 318:22 pixel numbers | Verified correct (823/823/1158, max 8; 0 px > 16/255) |
| F6 | Info | 318:26 disabled-while-focused | True (PD15). Relates to B-R492-PASSWORD-SUBMIT-FOCUS-LOST (deferred) |
| F7 | Info | 318 TODO list | Three deferred Lows are not listed: BACKDROP-SHORT, DIALOG-NO-MARGIN-NARROW, SUBMIT-FOCUS-LOST. For B |
| F8 | Info | 315:59, 315:107–108 (unchanged lines) | These historical "out of scope" lines name issues that round 493 fixed. For B (a "(fixed, doc 318)" note) |

There is no Medium+ finding.

**Architecture note (proposal for B/root, not acted on):** keep. `account.tsx:326–391` (PasswordModal lifecycle) and `120–156` (trigger ref, idempotent close) are cohesive and well covered. After root answers ARCH-CHECKPOINT-ACCOUNT-PROFILE, consider moving the focus trap and focus return into the shared `Modal` (shared-modal-no-focus-management), plus an open counter for TL-R492-L2 once the backend exists. Recorded against SIG-R487-PROFILE-NAME-EDITOR-EXTRACT.

## Changed files (working tree, this round)
Only the three docs changed, through the delta: `318-password-dialog-semantics.md`, `315-profile-name-keyboard.md` and `317-profile-editor-narrow-overflow.md`. `account.tsx` and both test files are byte-equal to v3 (K5).

## Acceptance criteria truly passed by A
- Start check equal, the apply, the claims after the apply, and K5.
- typecheck, lint, scoped Biome and the covering tests (97/97).
- A real code-reviewer run with each finding mapped.

**Not passed:** "no doc 318 line false at hand-over" (l.36, see the STOP).

## Next C checks
- If B rules before C runs, follow B's v6 instructions.
- Otherwise, under L22 (STOP), run C1 SOURCE-SCOPE, C2 CLAIMS (the output should equal `claims-493-sketch-output.txt`, since the delta is applied) and C8 AUTH + STUDIO, then report "STOPPED — routed to B".
- C may also confirm F1 in the browser: the backdrop box and a pointer hit-test at y ≈ 880 on 1440×900.
