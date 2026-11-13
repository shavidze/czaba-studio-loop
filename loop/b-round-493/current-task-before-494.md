# Round 493: re-dispatch of B-R488-PASSWORD-MODAL-DIALOG with a docs-only v5 (C-R492-01): doc 318 l.22 tells the true focus-ring story, and the round number moves to 493

**Planned by:** B, at the round 492 → 493 planning on 2026-11-13 (`b-round-492.md`, `b-round-492/checkpoint.md`).
- **Archive:** the round-492 task is copied byte-equal (`cmp`) to `tasks/round-492.md`. B's second copy is `b-round-492/current-task-before-493.md`.
- **Decisions:** D-29z1758 … D-29z1760 (`backlog.json`, `decisions_log_b`).

## Read first
- `lessons.md`, in full.
- This task.
- `b-round-492/sketch-review.md`: the docs-only delta reviews (v4 CHANGES REQUIRED, v5 APPROVE) and B's rulings.
- `b-round-491/sketch-review.md`: the v1–v3 code reviews. They still rule every code finding.
- `b-round-492/claims-493.sh` and its two saved outputs.

Look up any other id with `python3 -I tools/find-ids.py "$(pwd -P)" <ID>`.

## Baseline: HEAD `e4e1d1c`, tree holds sketch v3 (as A left it in round 492)
- Gate 492 was **skipped** (C FAIL). Gate 491 is the last publication, `e4e1d1c` [K1].
- The store tree holds the round-492 sketch v3 on exactly the 6 granted paths [K2, K5 `v3-files ======`]. Nothing is reverted.
- Planning ran on that tree. `b-round-492/claims-493-planning-output.txt` is the start check.

## 0. Why this round
- **C round 492: FAIL, "STOPPED — routed to B"** [K22]. `browserVerified` true. C5 `PW-CHECK PASS` (54 rows) on v3. The only bug is C-R492-01 (Low, origin B spec).
  - Doc 318 l.22 said the Current Password field shows a focus ring on open. That holds only for a keyboard open.
  - On a mouse open the ring is hidden: `outline none 0px`, `focusSource pointer` (C5 P2) [K22]. This comes from the SABA-B-4 rule [K19].
  - A STOPped correctly under the no-floor clause "a doc line is false at hand-over".
- **Bug gate.** The three Mediums of round 492 are still open, because C did not pass them. Fixing them is still the top priority:
  - B-R488-PASSWORD-MODAL-DIALOG;
  - B-R492-PASSWORD-FIELDS-UNNAMED;
  - B-R492-PASSWORD-ERROR-NOT-ANNOUNCED.
- No REGRESSION is due (next due on or after 2026-11-16). RETRO comes at round 495.

## Ruling on the STOP (L10)
- **C-R492-01 → accepted delta.** B grants a docs-only v5. A's suggested wording is used, made precise from C's rows [K22]:
  - keyboard open: ring on Current Password (P7 `solid 1px`);
  - Esc close: ring on the trigger (P6);
  - mouse open, mouse Cancel and backdrop click: no ring (P2, P8, P9 `none 0px`).
- **Round number.** The fix now lands in round 493. Under L28, doc 318 l.4 becomes `Completed (C round 493 PASS)`. B also renumbers the "round 492" lines of docs 315 and 317 to 493 [K10 `round492-in-docs`]. Finding ids such as `B-R492-*` and `TL-R492-*` keep their names.
- **More doc-truth fixes in v5.** B re-read doc 318 line by line, and a `tech-lead` sentence-by-sentence review rejected v4. Together they found these (`b-round-492/sketch-review.md`):
  - l.63 cited "browser R7", a key from B's private probe. It now cites C5 rows P11 and P12, the rows that prove it [K10 `d318-P11P12`].
  - l.76's PD8 line now states what PD8 pins: Tab on the middle field is not `preventDefault`ed. This relates to A-R492-REVIEW-L6, below.
  - TL-R493-D1: the "0 px" pixel match is true only at the probe's 16/255 threshold [K10 `open-pxdiff-threshold`]. The line now states the threshold and the unthresholded residue (823–1158 px, ≤ 8/255).
  - TL-R493-D2: the Ctrl+K line said "one Esc closes both (HEAD too)". At HEAD, Esc did not close the modal. The line now says that only the stacking exists at HEAD [K10 `d318-ctrlk`].
  - TL-R493-D3: "the same instance keeps typed values (HEAD too)" is untested. It is now worded as an inference (l.25, l.94 at v5) [K10 `d318-inference`].
  - B re-ran the two numeric and behaviour claims that the new lines carry, rather than relying on the reviewer [K25]:
    - The zero-threshold pixel diff gives 823 / 823 / 1158 px, max 8/255 (`b-round-492/probe/open-pxdiff-zero.txt`).
    - Ctrl+K and then Esc on production builds, 1440×900, signed-in stub: at HEAD the palette opens over the dialog and Esc closes only the palette. On v5 one Esc closes both (`b-round-492/probe/ctrlk-esc-probe.json`, screenshots `ctrlk-*-esc.png`).
- **No code change.** `account.tsx` and both test files are byte-equal to v3 [K5].
  - The production build of v5 is byte-identical to v3: `build/` diff empty, CSS sha equal [K21]. Tailwind scans the docs, so B checked this.
  - So C's v3 browser evidence and B's v3 mutants, full suite and typecheck carry over as pre-checks [K8, K9, K13]. C still re-runs the rows (§3).

## Rulings on A's round-492 reviewer findings (L7, L10)
All go to `deferred_low_polish` (D-29z1759). They are **already ruled and not a STOP**. Any code fix here would void the mutant and browser evidence of an unchanged code sketch.

| Id | Sev | Ruling |
|---|---|---|
| A-R492-REVIEW-L1-IME-KEYCODE229 | Low | Deferred. The LeadMagnet precedent checks only `isComposing` too [K24]; both are fixed together in the deferred polish pass. A Safari-only path, also on the SAFARI-CHECKS list |
| A-R492-REVIEW-L2-REPEAT-ALERT | Low | Deferred |
| A-R492-REVIEW-L3-DISMISSED-ERROR-SILENT | Low | Deferred. Reachable today only because `updatePassword` always throws [K19]; fix with B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED |
| A-R492-REVIEW-L4-REOPEN-MOUSE | Low | Deferred, next to TL-R492-V2-L1 |
| A-R492-REVIEW-L5-TABBABLE-SELECTOR | Low | Deferred. Correct for today's markup (P5) |
| A-R492-REVIEW-L6-PD8-VACUOUS | Low | Deferred as a test-quality Low. PD8's `fireEvent.keyDown(middle) === true` (not prevented) assert can fail; only its following `activeElement` assert is vacuous. The doc line now claims only the first. Browser P5 proves native Tab order inside the dialog |
| A-R492-REVIEW-L7-PD10-WEAK, -L8-PD3-PARTIAL, -L9-DISABLED-FOCUS-BROWSER | Low | Deferred. C5 P11 is the browser row for L9 |
| A-R492-REVIEW-I1-PALETTE-TRAP | Info | Recorded with TL-R492-L4 |

- **Architecture note:** keep. Recorded as `confirmedBy` on SIG-R487-PROFILE-NAME-EDITOR-EXTRACT. ARCH-CHECKPOINT-ACCOUNT-PROFILE is still waiting for root and does not block.

## Reference: how established practice does it
Unchanged from round 492 (`tasks/round-492.md`, section "Reference"): WAI-ARIA APG Dialog (Modal) pattern, with the same table and deviations. It is a Store page, so no Ableton claim applies. **product-designer:** not consulted. There is no new element, copy or layout. **Screen budget:** no persistent element is added.

## 1. What changes
- **The sketch:** `b-round-492/sketch-493.patch.txt` (v5, full diff against `e4e1d1c`), sha256 in `b-round-492/sketch-493.sha256`.
- **The delta:** `b-round-492/sketch-493-delta-v3-to-v4.patch.txt` (v3 → v5, docs only; the file name keeps "v4"), sha256 in `b-round-492/sketch-493-delta.sha256`.

Six paths: the same as round 492, with identical code and tests. Only the three docs differ from v3 [K5]:
1. `app/routes/account.tsx`: v3, unchanged.
2. `app/lib/__tests__/account-password-dialog.test.tsx`: v3, unchanged (PD1–PD15).
3. `app/lib/__tests__/account-profile-name.test.tsx`: v3, unchanged (PN10f/PN10g).
4. `docs/implementation/2026/quarter-IV/318-password-dialog-semantics.md`:
   - l.4 `**სტატუსი:** Completed (C round 493 PASS)`;
   - l.22 rewritten (ring by modality, 0 px mouse-open pixel diff);
   - l.63 "browser P11, P12";
   - the PD8 line;
   - l.25, the Ctrl+K TODO line and the reopen TODO line (TL-R493-D1…D3) [K10].
5. `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`: three "round 492" mentions become "round 493" (l.39, l.105, l.117 at v3) [K10].
6. `docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md`: one "round 492" becomes "round 493" [K10].

Every round-492 ruling line, sweep (K6) and L50 focus-origin table (K18, 22 hits, same lines) carries over unchanged. See `tasks/round-492.md` §1.

## 2. A: grants, forbidden, checks
- **Granted paths (only these):** the 6 paths of §1, changed only by the delta (or the full v5 sketch, see below). A changes no sketch line.
- **Forbidden:** as in round 492:
  - every other path;
  - `global_forbidden_files`, including `app/root.tsx`, `app/styles/**`, `app/contexts/AuthContext.tsx`, `app/lib/auth*` and `app/components/ui/Modal.tsx`;
  - the protected purchase files `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts` and `app/routes/account.downloads.tsx` [K3];
  - `global_forbidden_actions`: commit, push, stash, checkout, reset, deploy, and restarting the :5173 dev server.
- **STOP threshold (the only statement of it; L10).** STOP and report, editing nothing, if:
  - the start check differs (except K14 if root rewrote the task);
  - `git apply` fails, or after the apply K5 is not `======` on both `sketch-493-files` and the patch/delta sha pairs;
  - a covering test fails or exceeds 50 % of its timeout;
  - a Medium+ finding from your code-reviewer is not ruled in this task, `b-round-492/sketch-review.md` or `b-round-491/sketch-review.md`;
  - a doc 318, 315 or 317 line is false at hand-over;
  - a path outside the grants would need to change.
- **Already ruled, not a STOP, whatever severity your reviewer gives them:**
  - every item listed under "Already ruled" in `tasks/round-492.md` §2;
  - every A-R492-REVIEW id in the table above;
  - doc l.4 written before C (L28).
- **A runs:**
  - The start check: `bash ../tmp/studio-real-loop/b-round-492/claims-493.sh`.
    - **Tree holds v3 (expected):** the output must equal `b-round-492/claims-493-planning-output.txt`. Then `git apply ../tmp/studio-real-loop/b-round-492/sketch-493-delta-v3-to-v4.patch.txt`.
    - **Tree clean at `e4e1d1c`** (the job restore lost the v3 work): the output must equal `b-round-492/claims-493-clean-start-output.txt`, which B ran on a clean `e4e1d1c` copy. Its stderr must equal `b-round-492/claims-493-clean-stderr.txt` (doc 318 does not exist yet). Then `git apply ../tmp/studio-real-loop/b-round-492/sketch-493.patch.txt`.
    - Any other start state is a STOP. Record which case applied. Either case ends with the same 6 files.
  - The claims script again. It must equal `b-round-492/claims-493-sketch-output.txt`.
  - `npm run typecheck` and `npm run lint`.
  - The covering vitest command from `tasks/round-492.md` §2 (expected: 6 files / 97 tests; B's run on v5: `b-round-492/sketch-493-covering.log`, slowest 1442 ms) [K7].
  - The code-reviewer on the three changed docs, with the instruction "check every sentence of doc 318 against `c-round-492/pw-check.txt`".
- **A does not run** the full suite, the build or browser probes.
- **Report in `a-round-493.md`:**
  - the start HEAD and `git status`;
  - the start check;
  - which apply case was used, its output, and K5;
  - the commands with their pass counts;
  - each reviewer finding mapped to a ruling id or a STOP.

## 3. C: rows
The full §3 table of `tasks/round-492.md` applies, with these changes:
- the output folder is `c-round-493/`;
- the claims script is `b-round-492/claims-493.sh`;
- every round number is 493.

C runs every row; this is not a short route.

| Row | Change from round 492 | Pass when |
|---|---|---|
| C1 SOURCE-SCOPE | — | The same 6 paths. K3 reads `0 … 0 … 0` |
| C2 CLAIMS | `bash b-round-492/claims-493.sh`, at start and at end | Every line equals `b-round-492/claims-493-sketch-output.txt`. Stderr is empty. K14 may differ only if root rewrote this task |
| C3 APPLY | K5 | `sketch-493-files ======`; `patch` = `recorded`; `delta` = `delta-recorded` |
| C4 COVERING | — | 6 files / 97 tests green |
| C5 DIALOG (browser) | Fresh production build of the v5 tree; out `c-round-493/` | `PW-CHECK PASS`, 18 rows × 3 viewports. K21 predicts the build equals v3 byte for byte; C may record the `build/` sha comparison |
| C6 MUTANTS | On a copy, as in round 492 (L60) | `M0` 33 passed; MA … MT: 20 RED, 0 SURVIVED, 0 NOT-APPLIED |
| C7 VISUAL | Also one keyboard-opened crop of Current Password per viewport | The brass ring shows on a keyboard open. Mouse-open screenshots look like HEAD's |
| C8 AUTH + STUDIO | The playback state is read from `[data-testid="arrangement-playback-state"]` `textContent`. That span is `hidden`, so visible-text regexes miss it [K23] | `/account` and `/studio/middle-east` show "Sign in required" (0 `audio[src]`). `/studio-lab`: `auth_user` null, `Demo collection ready`. Enter adds 1 clip. Space → `Playing`, clock > `00:00.000`. Space → `Stopped`. B's probe: `Stopped → Playing → Stopped` at both viewports [K23] |
| C9 DOC | Full truth check of doc 318, plus the changed lines of 315 and 317, against `c-round-493` C5 rows | l.4 is byte-exact `**სტატუსი:** Completed (C round 493 PASS)`. 7 TEMPLATE headings. `C round N pending` count 0. `pd-ids-missing` empty. `round492-in-docs` 0 for all three files. l.22 agrees with C5: P2, P8, P9 `none 0px`; P6, P7 `solid 1px` |
| C10 L57 | `python3 -I tools/l57-check.py c-round-493.json c-round-493/l57-check.txt` | rc 0. `mutantRedOnSketch` = `b-round-491/mutants/mutants-summary.txt` and `b-round-491/probe/pw-check-mutO.txt` |
| OWN-BACKEND | — | BLOCKED: backend unavailable in cloud, and `updatePassword` always throws. Not in `passed` |
| gate | — | Root gate only |

- **L22:** if A STOPs with no diff, run only C1, C2 and C8 and report "STOPPED — routed to B".
- **Manual row:** TLM-R492-SR-PASSWORD-DIALOG. It does not block; deadline RETRO 510.

## 4. Sketch review and mutants (L58)
`b-round-492/sketch-review.md` names the full v5 sha256 and the delta sha256 (plus the rejected v4), with the `tech-lead` delta verdict. It also names the v3 sha and points to `b-round-491/sketch-review.md` for the code reviews and the ordering matrix. The mutants are unchanged (code equals v3): `b-round-491/mutants/mutants-summary.txt`, 20 RED [K13], and the browser mutant `pw-check-mutO.txt` [K12].

## 5. Outcome fixed in advance
- **C PASS with `browserVerified` true:**
  - The three Mediums become done for the client path.
  - These close: A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW, A-R491-REVIEW-PWMODAL-WORDING and C-R492-01.
  - OWN-BACKEND and B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED stay open with root.
- **Next:** DPG-BUTTON-CLEANUP (DPG-FIX P1). RETRO at round 495. A REGRESSION round comes first if planning happens on or after 2026-11-16.
- **FAIL:** a fix-up comes first.
- **PARTIAL (time):** the same round resumes from `c-round-493/progress.json`.
