# A round 491: B-R487-PROFILE-EDITOR-NARROW-OVERFLOW

**Result:** sketch applied byte-equal. All A checks green. No STOP. Hand-over to C.

## Start
- HEAD `53ff249`; `git status --short` was empty (clean).
- Start check `bash b-round-490/claims-491.sh` rc 0, stderr empty. The output is **equal** to `claims-491-planning-output.txt` (`a-round-491/claims-start.txt`).

## Apply
- `git apply ../tmp/studio-real-loop/b-round-490/sketch-491.patch.txt`: rc 0, no output (`a-round-491/apply.log`). Patch sha256 `a3b6e637…0561` equals `sketch-491.sha256`.
- After applying, the claims script output is **equal** to `claims-491-sketch-output.txt` (empty diff in `a-round-491/claims-after-vs-sketch.diff`). K5: `sketch-491-files === patch=a3b6e637eedddbe2 recorded=a3b6e637eedddbe2`.
- `git status --short --untracked-files=all`:
  - ` M app/routes/account.tsx`
  - ` M docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`
  - `?? docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md`

## Changed files (granted only; no line outside the sketch)
1. `app/routes/account.tsx`: `min-w-0` added to the two name inputs (l.238, l.247).
2. `docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md`: new file.
3. `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`: one TODO line changed.

## Checks run by A
| Command | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `a-round-491/typecheck.log` |
| `npm run lint` | rc 0; 187 warnings + 1 info repo-wide (not compared to a baseline; the only changed code file has exactly the 4 expected warnings, see the next row) | `a-round-491/lint.log` |
| `npx biome check app/routes/account.tsx` | rc 0; 4 warnings, the expected pre-existing ones: 3 × `noLabelWithoutControl` (l.387, 407, 428, PasswordModal) and 1 × `useButtonType` (l.291), as in `sketch-491-biome.log` | `a-round-491/biome-account.log` |
| covering vitest (5 files, as in §2) | rc 0; **5 files, 82 tests passed** | `a-round-491/covering.log` |

A did not run the full suite, the build or browser probes (as the task says). The root gate runs those.

## Code-reviewer (real subagent, 3 files)
- Verdict: nothing Critical, High or Medium. Score 9/10. It confirmed the width arithmetic (121.5 / ~114 / 94 px). It found that the buttons cannot shrink below 32 px even without `shrink-0`, because their min-content is 32 px. The reviewer only read files and ran nothing.
- **Findings for B to rule** (none is a STOP, none makes a doc line false, and A may not edit sketch lines):
  - A-R491-REVIEW-PWMODAL-WORDING (Low): doc 317 l.45 says B-R488-PASSWORD-MODAL-DIALOG is planned for the "next round". Doc 315 l.117 says "after round 490". Both are true today (round 492), but the wording differs.
  - A-R491-REVIEW-420-WORDING (info): in doc 317 l.15, "(≥ 420 px შიგთავსისთვის)" is ambiguous. It means a column of at least 420 px, which is a viewport of about 452 px.
  - A-R491-REVIEW-PS-LABELS (info): doc 317 uses English **Problem/Solution** labels; doc 315 uses პრობლემა/გადაწყვეტა.
  - A-R491-REVIEW-RESOLVED-IN-TODO (info): doc 315 l.115 is a resolved item inside the TODO section, with no `TODO:` prefix.
  - Target size (info): 32×32 passes WCAG 2.5.8 AA, but not 2.5.5 AAA (44 px). Nothing needed.
  - The known Lows the task already ruled (no unit test, Chromium only, 94 px at 320, no `shrink-0`, status line written early): the reviewer sees no reason to raise them.
- **Architecture note (backlog signal only):** keep. The diff changes only two `className`s. The name-editor region has now been touched in rounds 487, 488 and 491 (signal 3, "repeated changes"), but each change was cheap.

## Hand-over state (re-run after all checks and the review)
- `git status --short --untracked-files=all`: the same 3 paths, nothing else.
- `claims-491.sh`: rc 0, stderr empty, output **equal** to `claims-491-sketch-output.txt` (`a-round-491/claims-handover.txt`).
- Lessons self-check:
  - L11: no STOP condition met.
  - L12: no class token removed or renamed, and no `data-testid` touched.
  - L15: no colour change.
  - L26: doc 317 cites `PN1`–`PN10h`. All of them exist in `account-profile-name.test.tsx` (PN1, PN1b, PN2…PN10h). The `## ` headings equal TEMPLATE's 7, in order. There is 0 `pending`.
  - L28: l.4 is as pinned.
- Pre-flight gate: the skill was read and the gate was posted in chat before `git apply`.
- The browser numbers in doc 317's Testing section (box equality, 121.5/94 px, PUT counts, mutant RED) are B's probe data. A did not re-measure them. They are C's to verify (C5–C7, C10).

## Other observations (proposals for B/root; nothing edited)
- `.claude/primitives/DESIGN_TOKENS.md` still lists brand as `#13D9CC` (Teal). This is the known DPG-DOCS-UPDATE item and is outside this round.

## B acceptance passed by A
- §2 start check equal: PASS.
- `git apply` + K5 `===`: PASS.
- typecheck / lint / biome (4 pre-existing warnings): PASS.
- Covering tests, 5 files / 82 tests: PASS.
- code-reviewer run, with no Medium+ finding: PASS.
- Not claimed by A: C1–C11 browser and doc rows. These are C's to verify.

## Known gaps
- No browser verification by A, by design. Real-phone, WebKit and Firefox checks are TLM-R491-PHONE-NAME-EDITOR (manual). OWN-BACKEND is BLOCKED (backend unavailable in cloud).
- Doc 317 l.4 `Completed (C round 491 PASS)` was written in advance, per L28. It becomes true only on a C PASS.

## Exact next C checks
C1 (3 paths, K3 zeros) → C2 (claims equal `claims-491-sketch-output.txt` at start and at end) → C3 K5 → C4 covering 5/82 → C5 `narrow-491.mjs` on the tree build at :5193 + `desk-eq.py` (1440/1280 equal) → C6 `c6-check.py` → `C6 PASS` → C7 `mut-491.mjs` (M0 PASS, MA_no_min_w_0 RED at 375 and 320) → C8 screenshots → C9 auth + `/studio-lab` → C10 docs → C11 `l57-check.py`. Stub `/api/downloads` 200 `[]` in any signed-in probe.

## Scope
The round-491 A task is complete. The backlog is not marked complete.
