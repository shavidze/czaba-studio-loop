# A round 515: cookie banner, pointer dismissal from a keyboard-opening field, and clearing on focus loss

**Status: implemented. No STOP.** Every A row in §3 ran and passed. C rows C1–C8 have not run; they are C's to run.

**Read first, "For B" item 1:** the code-reviewer raised one Medium. It is a **test-coverage gap, not a behaviour defect**:
- A Chromium probe (`a-round-515/selector-probe.json`) shows that the pinned selector already matches all three inputs:
  - an `input` with no `type`;
  - `contenteditable=""`;
  - `contenteditable="plaintext-only"`.
- The fix would add test rows to a pinned file. Under the strengthen-only ruling (A-R514-SPEC-STRENGTHEN-ONLY), A proposes the rows and does not edit them.
- This is not a STOP: no behaviour contradicts the task table, and no change outside the grants is needed for correctness.

## Baseline and scope
- HEAD `b7cb61f`, no drift. Frozen checks 1, 2 and 3 were rc 0 before the apply.
- `git apply b-round-514/sketch-515.patch.txt` (sha `353e4239…`, verified equal to `sketch-sha.txt`) returned rc 0.
- **Frozen check 4** was rc 0 after the apply and again at the end; the two files match B's post-sketch sha.
- **No other edits to the 2 granted files.**

### Changed files (exactly 3, `a-round-515/git-status.txt` and `frozen-end.log`)
- `M app/components/common/CookieConsent.tsx`: the sketch, byte-equal.
- `M app/components/common/__tests__/CookieConsent.test.tsx`: the sketch, byte-equal.
- `?? docs/implementation/2026/quarter-IV/333-cookie-banner-pointer-field-focus.md`: new, written by A.

### Not touched
- Doc 332 is unchanged (`git diff --quiet` rc 0).
- The protected files are unchanged (check 2 rc 0).
- Nothing else in the 1,430-file tree pin changed (check 1 rc 0 at the end).

## Pre-flight (stated before the apply)
- **Assumptions:** the change is the pinned patch only; A adds only the doc and the ledger.
- **Smallest version:** one `git apply`.
- **Files to touch:** the 2 grants and doc 333.
- **Success criteria:** the §3 numbers below.
- **Read in full before the apply:** FORWARDREF_COMPONENT, AGENT_DISCOVERABLE_CODE, TAILWIND_FIRST, TESTING_QUALITY_GATES, GEORGIAN_DOCS and the `pre-flight` skill.
- **Read only partly before the apply, rest read after it:**
  - BUG_HUNTING_TESTS and `prompts/new-test.md` were read to l.120 before the apply. The rest was read after it, before hand-over.
  - Lessons: the A self-check section and L26/L28 were read before the apply. The full text of l.43–49 was read after the review, before hand-over.
- No unmet obligation was found in the tails. One tail matters here: L11's "Strengthen-only (RETRO 510)" allows A to add test rows in-round. This task's explicit ruling A-R514-SPEC-STRENGTHEN-ONLY ("propose under For B, do not edit the pinned bytes") is more specific. Frozen check 4 and C5 also pin the bytes and the count of 112. So the rows went to "For B".
- **/check:** `source-command-check` → `.claude/commands/check.md` asks for `npm run verify` + `test:e2e:smoke`. The loop speed rules and task §3 make those gate rows. A ran the scoped form instead: typecheck, lint, Biome on the 2 owned code files, and the covering tests. No fixes were applied, and nothing was committed.

## Checks actually run (logs in `a-round-515/`)
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, **171** warnings | `lint.log` |
| scoped `npx biome check` on the 2 files | rc 0, "No fixes applied." | `biome-scoped.log` |
| covering `npx vitest run --reporter=verbose $(cat b-round-514/covering-files.txt)` | rc 0, **6 files / 112 tests**; R515-T1 ×3, T2 ×3, T6 ×3, T3, T7, T4, T5 and R514-F8 all present and passing; slowest test 171 ms (limit 2,500) | `covering.log` |
| scanner `scan-nonbrand-motion.py` | **50** hits in 26 files; 0 CookieConsent entries | `scanner.log`, `scanner.json` |
| doc 333 | l.4 byte-equal `**სტატუსი:** Completed (C round 515 PASS)`; 7 TEMPLATE headings in order; `pending` = 0. Doc ids R514-F8 and R515-T1…T7 each have a grep count of 1. Ledger-only ids R514-F2/F6/F7 also have a count of 1 each (appended section) | `frozen-end.log` |
| `tools/ledger-check.py current-task.md` | LEDGER OK, rc 0 | `ledger-check.txt` |
| C6 greps (preview) | `<button` = 0; `onBlur={handleBannerBlur}` = 1 | `frozen-end.log` |
| end frozen checks 1, 2 and 4 and doc 332 | all rc 0; exactly 3 paths | `frozen-end.log` |
| code-reviewer (actual subagent) on `git diff b7cb61f` + doc 333 | 8/10, findings below; doc re-review: all 3 doc findings resolved | `code-review.md` (a condensed summary by A, not verbatim) |

Not run, by rule (gate rows): full vitest, build, Biome-all, `npm run verify`, `test:e2e:smoke`. **No browser run by A:** C1–C4 are C rows, and the server is C's (port 5174, GA4 set). No mutants: B ran M1–M11, and C re-runs them.

## Code review: handling
The code-reviewer found nothing Critical or High and no security issue.
- **Doc findings:** l.30 scope, l.22 test claim, the flowchart edge, and the C1 label. All are fixed in doc 333, and the re-review confirmed them. The ledger rows were updated to match.
- **Code and test findings:** they touch pinned bytes, so none was applied. They are listed under "For B" below.
- **No code or test changed after either review.**

**Architecture note (signal only, for B and root):**
- Signal 3, repeated changes to one region: `CookieConsent.tsx:20-52` and `76-86` changed in rounds 512, 514 and 515.
- Verdict: **keep**. It has one owner and one lifecycle, and it is the only user.
- Keep the SIG-R513-COOKIE-FOCUS-GROWTH trigger: extract a shared focus-restore helper only when a second non-modal surface needs it.

## For B
1. **A-R515-REVIEW-SELECTOR-ROWS (reviewer: Medium; A's view: coverage gap only, as the probe shows).** Proposed rows for the next owner of the test file: add these to the R515 text-entry fixture set:
   - `<input aria-label="Page name" />` (no type);
   - `contentEditable=""`;
   - `contentEditable="plaintext-only"`.

   Each should go through T1 (pointer → logo) and T2 (keyboard → field).
2. **A-R515-REVIEW-CE-CASE (Low, confirmed in Chromium).** `contenteditable="FALSE"` matches the selector (`isContentEditable` false), so a pointer dismissal skips a non-editable element.
   - Fix: `[contenteditable="false" i]`.
   - `type` is already compared case-insensitively: `type="CHECKBOX"` does not match.
   - No such element exists in the app today (inference; not grepped app-wide).
3. **A-R515-REVIEW-READONLY (Low).** `input[readonly]` and `inputmode="none"` open no keyboard but are skipped, so focus goes to the logo. Options: add `:not([readonly])`, or accept it and document it.
4. **A-R515-REVIEW-HELPER-ASSERT (Low).** `enterBannerFrom` (test l.327-336) does not assert that `outside.focus()` took effect. T2 covers this indirectly. Proposed: `if (outside) expect(document.activeElement).toBe(outside);`.
5. **A-R515-VOICEOVER (Info).** An iOS VoiceOver double-tap may send `detail: 1`, which would send a screen-reader user in a text field to the logo. This is within pre-ruled 3. It is a candidate row for SABA-DEVICE-CHECKS next to TLM-R515-PHONE-KEYBOARD.
6. **Doc wording tension (resolved in the doc, noted).** B's required sentence "supersedes doc 332's pointer rule for keyboard-opening fields only" is literally true for the skip rule. The `onBlur` clearing, however, also changes the pointer result for ordinary elements once focus has left the banner (T3, T7). Doc 333 keeps B's sentence and adds a separate sentence for the clearing.
7. **Pre-ruled items raised again by the reviewer** (not acted on): the window switch (1), the fallback selector not scoped to the header (GATE514-L3), and the detached node (GATE514-L2).

## Known gaps
- **No browser verification by A.** C1 (P1/P2/P3), C2 (22 rows + layout), C3 (journey) and C4 (`/studio-lab` + protection) are open for C.
- **Manual rows outside the cloud:** the real phone keyboard (TLM-R515-PHONE-KEYBOARD) and real Safari (SAFARI-CHECKS, C-R514-01).
- Code-review findings 1–4 above are open as proposals.

## Exact next C checks
- **C0:** `git status --short --untracked-files=all` should show exactly the 3 paths above. Frozen checks 1, 2 and 4 should be rc 0.
- **C1:** run `node r515-focus.mjs http://127.0.0.1:5174 <dir>` against `b-round-514/probe/sketch/r515.json`.
  - Expected: P1 at 375 and 1280, and P3 textarea → the "CZABA" logo, `focusVisible` false, scrollY unchanged, value "abc". P3 select → SELECT. P2 (simulated) → the logo.
  - Also record one Tab press after P1 at 1280.
- **C2:** run `r514-banner.mjs` and compare with `b-round-513/probe/sketch/r514.json`: 22/22 rows, the 5-width layout, BODY 0/22.
- **C3:** run `n3-journey.mjs` at 1440 and 1280.
- **C4:** studio-only `/studio-lab`, plus `c-round-511/prot.mjs` on :5173.
- **C5:** the covering command (6 files / 112 tests) and `mutants-515.py` M1–M11 against `mut-logs/mutants-summary.json`.
- **C6:** greps, scanner 50, lint 171.
- **C7:** doc 333, `a-round-515/doc-ledger.md`, doc 332 `git diff --quiet`.
- **C8:** `claims-515.sh` compared with the planning output and the allowed delta, then `l57-check.py`.

## Task acceptance A actually passed
- §3.1 frozen checks 1–3 rc 0. Pre-flight and 5 of the 6 primitives were read in full before the apply. BUG_HUNTING_TESTS and `new-test.md` were read to l.120 before it and the rest before hand-over (see Pre-flight).
- §3.2 apply + frozen check 4 rc 0; doc 333 and the ledger are written (doc 332 untouched).
- §3.3:
  - typecheck rc 0;
  - lint 171;
  - scoped Biome clean;
  - covering 6/112 with all R515 rows and F8, none above 2,500 ms;
  - scanner 50 with no CookieConsent entry;
  - code-reviewer run, with its Architecture note.
- §3.4: this report.

Not claimed: any C row, any gate row, or the closing of GATE514-M1, C-R514-01, A-R514-R2 or A-R514-R3. Those close only after C PASS. The whole backlog is not complete.
