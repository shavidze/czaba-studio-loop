# B round 493 → 494 planning

**Decision: CONTINUE.** Round 494 re-dispatches the same three Mediums (B-R488-PASSWORD-MODAL-DIALOG, B-R492-PASSWORD-FIELDS-UNNAMED, B-R492-PASSWORD-ERROR-NOT-ANNOUNCED) with a docs-only v6. Decisions D-29z1761 … D-29z1763.

## Inputs read
- `context/active-summary.md`, `lessons.md` (L10, L22, L28, L57, L58, L60 re-read by grep), `current-task.md` (round 493), `a-round-493.md`, `c-round-493.md`, `c-round-493.json`, `c-round-493/f1.json`.
- Gate: `gates/gate-round-493.json` = **skipped** ("C taskStatus FAIL"). Not published, so the baseline stays `e4e1d1c` (gate 491).
- `regression-last.json`: last 2026-11-13 (round 484). The next one is due on or after 2026-11-16, so no REGRESSION round now. RETRO is due at round 495.

## Acceptance evidence used for the backlog (C only)
- **C round 493: FAIL (short route L22).** `browserVerified`/`realVerified` false: C5 (PW-CHECK) and C7 were not run.
  - C1 SOURCE-SCOPE, C2 CLAIMS, C3 APPLY and C8 AUTH + STUDIO passed. The auth guard holds: `/account` and `/studio/middle-east` show "Sign in required" with 0 `audio[src]`, and `/studio-lab` opens anonymously.
  - C's clip-count selector was ambiguous (8 matches), so "Enter adds 1 clip" is not credited.
- **Nothing is marked done.** The three Mediums stay **მუშავდება**.
- **C-R493-01** (Low, origin B spec) is recorded and fixed now, not deferred.

## Ruling on A's STOP (L10)
- **Accepted delta: docs-only v6** (`b-round-493/sketch-494*.patch.txt`).
- **B measured the backdrop** on a dev server and on a production build of the tree. At 1440×900, 1280×720 and 375×812 it ends exactly 40 px above the viewport bottom. The strip hits the page's `min-h-screen` div, and a click there leaves the dialog open (`b-round-493/probe/backdrop-probe.json`, `probe/prod/backdrop-probe.json`). The cause is not established; the doc names none.
- **l.36 rewritten:**
  - no scroll lock (round 492 decision);
  - the backdrop blocks the pointer except the bottom 40 px strip;
  - Tab and Shift+Tab stay inside, with the Ctrl+K exception in the TODO.
- **A's reviewer findings, by id:**
  - fixed: F2 (l.85, and the `type="button"` gap is now stated), F3 (l.86), F4 (l.63, mutant O) and F7 (three deferred Lows added to the TODO);
  - verified true, no change: F5 and F6;
  - no change: F8 (historic lines stay true).
- **Doc-truth method.** `b-round-493/doc-ledger.md` maps every sentence to its evidence and cross-checks each against the open and deferred findings on the same code. A's STOP clause for doc sentences now needs a contradicting file (D-29z1762). This is the second occurrence of RC-R492-DOC-TRUTH-REVIEW; it goes to RETRO 495 as a lesson candidate.

## Pre-checks on v6 (B, saved)
- **Apply:** the delta applies on the store tree (`--check`), and the full patch applies on a clean `e4e1d1c`.
- **covering:** 6 files / 97 tests (`sketch-494-covering.log`).
- **Build:** rc 0, and all three CSS sha256 are equal to v5/v3 (`css-compare-v6.txt`).
- **C8 clip selector:** distinct `[data-clip-id]` goes 0 → 1 after Enter at both viewports (`probe/clip-probe.json`).
- **tech-lead v6 review** (`b-round-493/sketch-review.md`):
  - The draft got CHANGES REQUIRED, with two more false sentences. l.93 said the Ctrl+K palette opens *over* the dialog; it opens behind it, dimmed (B checked `b-round-492/probe/ctrlk-v5-open.png`). l.22's "visually equal to HEAD" ignored the text caret. There was also a P13 nuance on l.63 and three wrong ledger mappings.
  - All are fixed. B also dropped an unevidenced "focus fell to body" clause.
  - The dispatched v6 (`a4799d47…`, delta `29a0ec9e…`) got APPROVE.
  - TL-R492-L4-CTRLK-OVER-DIALOG gets a correction note in the backlog: its title says "over", but the palette is behind the dialog.
- **Claims:** `claims-494.sh` outputs on the store tree (planning), the v6 scratch (sketch) and a clean `e4e1d1c` (clean start; its stderr is the missing doc 318). L58 OK.

## For root
- **ROOT-NOTE-R494-OPEN-MEDIUMS-ARCHIVED.** `cloud/optimize-backlog.py` moved the three open Mediums (B-R488-PASSWORD-MODAL-DIALOG, B-R492-PASSWORD-FIELDS-UNNAMED, B-R492-PASSWORD-ERROR-NOT-ANNOUNCED) into `archive/findings-archived.json`. Their status text was "re-dispatched … not done …", and none of them has a C PASS.
  - B copied them back into `open_findings` with a neutral `open (D-29z1761) …` status. The archive copy is untouched.
  - It also archived LEGACY-DEAD-STORE-COMPONENTS (in_progress, stage 1 only); B restored that one the same way. Recorded as **ROOT-REQ-OPTIMIZER-ARCHIVES-OPEN** in `root_requests_b`.
  - Please check the optimizer's closed-status matcher. A substring such as "done" inside "not done" may be the trigger; B could not read the script, because `cloud/` is not in this runner's paths.

## Store tree
B did not modify the store tree (`b-round-493/store-status-start.txt`). All edits were made in `/tmp` scratch copies.

## Architecture
A's note (keep; later move the focus trap into the shared `Modal`) is recorded as `confirmedBy` on SIG-R487-PROFILE-NAME-EDITOR-EXTRACT. It is not scheduled. ARCH-CHECKPOINT-ACCOUNT-PROFILE is still waiting for root. No new checkpoint request is needed: the code is unchanged, and the risk is in doc text, not structure.

## Outcome fixed in advance
- **PASS:** the three Mediums are done for the client path. Round 495 = RETRO 495, then DPG-BUTTON-CLEANUP.
- **FAIL:** the fix-up takes round 495, and RETRO moves to 496.
- REGRESSION comes first if planning happens on or after 2026-11-16.

## Advisor
Available and consulted after orientation. Its advice was applied: measure the backdrop rather than copy "~40 px"; check the Tab half of l.36; build a ledger with a findings cross-check; rule F2–F8; run the tech-lead review with a shell; re-run the pre-checks; probe the C8 selector; fix the 494-vs-RETRO outcome in advance.
