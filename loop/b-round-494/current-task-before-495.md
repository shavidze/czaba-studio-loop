# Round 494: re-dispatch of B-R488-PASSWORD-MODAL-DIALOG with a docs-only v6 (C-R493-01): doc 318 l.36 states the measured 40 px backdrop gap, and every doc sentence has a ledger entry

**Planned by:** B, at the round 493 → 494 planning on 2026-11-13 (`b-round-493.md`, `b-round-493/checkpoint.md`).
- **Archive:** the round-493 task is copied byte-equal (`cmp`) to `tasks/round-493.md`. B's second copy is `b-round-493/current-task-before-494.md`.
- **Decisions:** D-29z1761 … D-29z1763 (`backlog.json`, `decisions_log_b`).

## Read first
- `lessons.md`, in full.
- This task.
- `b-round-493/doc-ledger.md`: every doc 318 sentence → its evidence, plus the cross-check against open and deferred findings on the same code.
- `b-round-493/sketch-review.md`: the `tech-lead` v6 review and B's rulings.
- `b-round-492/sketch-review.md` (v4/v5 docs reviews) and `b-round-491/sketch-review.md` (v1–v3 code reviews). They still rule every earlier finding.
- `b-round-493/claims-494.sh` and its saved outputs.

Look up any other id with `python3 -I tools/find-ids.py "$(pwd -P)" <ID>`.

## Baseline: HEAD `e4e1d1c`, tree holds sketch v5 (as A left it in round 493)
- Gate 493 was **skipped** (C FAIL), and so was gate 492. Gate 491 is the last publication, `e4e1d1c` [K1].
- The store tree holds the round-493 sketch v5 on exactly the 6 granted paths [K2; K5 `v5-files ======`]. Nothing is reverted.
- Planning ran on that tree. `b-round-493/claims-494-planning-output.txt` is the start check.

## 0. Why this round
- **C round 493: FAIL, "STOPPED — routed to B"** (short route L22). `browserVerified` is false, because C5 and C7 were not run [K22b].
- A STOPped correctly. Doc 318 l.36 said "the backdrop blocks the pointer on the background", but a bottom strip is outside the backdrop.
  - C confirmed this in the browser (`c-round-493/f1.json`): a click there leaves the dialog open.
  - It was B's own deferred Low, B-R492-PASSWORD-BACKDROP-SHORT. No earlier review had compared the doc against open findings.
- **C-R493-01** (Low, origin B spec) is fixed now, not deferred.
- **Bug gate.** The three Mediums are still open, because C has not passed them:
  - B-R488-PASSWORD-MODAL-DIALOG;
  - B-R492-PASSWORD-FIELDS-UNNAMED;
  - B-R492-PASSWORD-ERROR-NOT-ANNOUNCED.
- No REGRESSION is due (next due on or after 2026-11-16).

## Ruling on the STOP (L10)
- **C-R493-01 → accepted delta: docs-only v6.** B measured instead of copying A's "~40 px".
  - **Backdrop:** on a dev server and on a production build of the v5 tree (the same code), the backdrop is `[0,0,W,H−40]` at 1440×900, 1280×720 and 375×812 (`b-round-493/probe/backdrop-probe.json`, `probe/prod/backdrop-probe.json`).
  - **The strip:** `elementFromPoint` in the strip hits the page's `min-h-screen` div. A click there leaves the dialog open (count 1) at all three viewports [K26] (`b-round-493/probe/backdrop-probe.json`, screenshots `backdrop-*.png`).
  - **Cause:** no transformed ancestor showed at settle, so the cause is not established and the doc does not name one.
  - **Second half of l.36:** "the keyboard is held by the Tab trap" now names the Ctrl+K exception, which is already in the TODO (TL-R492-L4).
- **tech-lead v6 review (`b-round-493/sketch-review.md`).** The draft got CHANGES REQUIRED: two more false sentences, l.93 (the Ctrl+K palette is behind the dialog, not over it; B checked `b-round-492/probe/ctrlk-v5-open.png`) and l.22 (the text caret), plus l.63 and three ledger mappings. All are fixed; the dispatched v6 got APPROVE.
- **Doc-truth method (RC-R492-DOC-TRUTH-REVIEW, second occurrence).** B wrote `b-round-493/doc-ledger.md`. Every declarative sentence maps to a PD test, a C5 P-row, a K line or a probe file, or it is worded as inference or decision. The ledger is cross-checked against every open or deferred finding on `account.tsx`.
- **STOP clause for doc sentences, refined (D-29z1762).** A sentence listed in the ledger with its evidence is ruled. If A's reviewer doubts it, A reports the doubt with the ledger row; that alone is not a STOP. It is a STOP only when A cites an evidence file (or a backlog finding) that contradicts the sentence.

## Rulings on A's round-493 reviewer findings (L7, L10)

| Id | Sev | Ruling |
|---|---|---|
| F1 (l.36 backdrop) | Low | = C-R493-01. Fixed in v6: l.36 rewritten; the TODO lists B-R492-PASSWORD-BACKDROP-SHORT |
| F2 (l.85 mutants) | Low | Fixed: "20 jsdom mutants, all red; the trigger's `type="button"` has neither a mutant nor a test" |
| F3 (l.86 "C checks in this round") | Low | Fixed: past tense, "B's measurement and C round 492's PW-CHECK PASS on the same code, 18 rows × 3 viewports" [K22] |
| F4 (l.63 "first sketch") | Info | Fixed: names B's browser mutant O (without `inert`) and rows P11, P12 and P13, red on mutant O and green on the sketch [K12] |
| F5, F6 | Info | Verified true; no change |
| F7 (TODO lacks three Lows) | Info | Fixed: BACKDROP-SHORT, DIALOG-NO-MARGIN-NARROW and SUBMIT-FOCUS-LOST added to the TODO |
| F8 (315 historic lines) | Info | No change: 315 l.59 and l.107–108 describe round 487/488 scope and runs and stay true. The fix is recorded at 315 l.117 |

- **Architecture note:** keep. Recorded as `confirmedBy` on SIG-R487-PROFILE-NAME-EDITOR-EXTRACT. ARCH-CHECKPOINT-ACCOUNT-PROFILE is still waiting for root and does not block.
- Every round-492 ruling (`tasks/round-492.md` §2 "Already ruled") and every A-R492-REVIEW ruling (`tasks/round-493.md` table) carries over.

## Reference: how established practice does it
Unchanged from round 492 (`tasks/round-492.md`, section "Reference"): WAI-ARIA APG Dialog (Modal) pattern, with the same table and deviations.
- It is a Store page, so no Ableton claim applies.
- **product-designer:** not consulted. There is no new element, copy or layout.
- **Screen budget:** no persistent element is added.

## 1. What changes
- **The sketch:** `b-round-493/sketch-494.patch.txt` (v6, full diff against `e4e1d1c`), sha256 in `b-round-493/sketch-494.sha256`.
- **The delta:** `b-round-493/sketch-494-delta-v5-to-v6.patch.txt` (v5 → v6, docs only), sha256 in `b-round-493/sketch-494-delta.sha256`.

Six paths: the same as rounds 492 and 493. Code and tests are byte-equal to v3 [K5 `v3-files ===xxx`]. Only the three docs change:
1. `app/routes/account.tsx`: v3, unchanged.
2. `app/lib/__tests__/account-password-dialog.test.tsx`: v3, unchanged (PD1–PD15).
3. `app/lib/__tests__/account-profile-name.test.tsx`: v3, unchanged (PN10f/PN10g).
4. `docs/implementation/2026/quarter-IV/318-password-dialog-semantics.md`. The rest of v5 stays [K10]:
   - l.4 `**სტატუსი:** Completed (C round 494 PASS)` (L28 re-dispatch);
   - l.22 (the mouse-open visual match names the Current Password text caret exception; the screenshots hide the caret, TL-R494-D2);
   - l.36 (backdrop 40 px gap, scroll-lock decision, Ctrl+K exception);
   - l.63 (mutant O; P11 and P12, with P13 red only through its comparison with P12, TL-R494-D3);
   - l.85 (mutants and the `type="button"` gap);
   - l.86 (C round 492 evidence);
   - l.93 (Ctrl+K opens the palette **behind** the dialog, dimmed under the backdrop, not over it; TL-R494-D1);
   - TODO: three new lines (l.95–97).
5. `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md`: the three "round 493" mentions (l.39, l.105, l.117) become "round 494".
6. `docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md`: l.45 "round 493" becomes "round 494".

**Pre-checks on v6 (B):**
- covering: 6 files / 97 tests (`b-round-493/sketch-494-covering.log`) [K7];
- production build: rc 0, all three CSS sha256 equal v5's and v3's (`b-round-493/css-compare-v6.txt`) [K21]. Tailwind scans the docs, so B checked this.

So C's round-492 browser evidence on v3, B's mutants, the full suite and typecheck carry over as pre-checks [K8, K9, K13]. C still re-runs the rows (§3).

## 2. A: grants, forbidden, checks
- **Granted paths (only these):** the 6 paths of §1, changed only by the delta (or the full v6 sketch, see below). A changes no sketch line.
- **Forbidden:**
  - every other path;
  - `global_forbidden_files`, including `app/root.tsx`, `app/styles/**`, `app/contexts/AuthContext.tsx`, `app/lib/auth*` and `app/components/ui/Modal.tsx`;
  - the protected purchase files `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts` and `app/routes/account.downloads.tsx` [K3];
  - `global_forbidden_actions`: commit, push, stash, checkout, reset, deploy, and restarting the :5173 dev server.
- **STOP threshold (the only statement of it; L10).** STOP and report, editing nothing, if:
  - the start check differs (except K14 if root rewrote the task);
  - `git apply` fails;
  - after the apply, K5 is not `======` on `sketch-494-files`, or a patch/delta sha pair differs;
  - a covering test fails, or takes more than 50 % of its timeout;
  - a Medium+ finding from your code-reviewer is not ruled in this task or in the three `sketch-review.md` files;
  - a doc 318, 315 or 317 sentence is contradicted by an evidence file or backlog finding you cite (see the refined clause above; a ledger-listed sentence is otherwise ruled);
  - a path outside the grants would need to change.
- **Already ruled, not a STOP, whatever severity your reviewer gives them:** everything listed under "Already ruled" in `tasks/round-492.md` §2; every A-R492-REVIEW and A-R493 F-id above; doc l.4 written before C (L28).
- **A runs:**
  1. **The start check:** `bash ../tmp/studio-real-loop/b-round-493/claims-494.sh`. Record which case applies:
     - **Tree holds v5 (expected).** The output must equal `b-round-493/claims-494-planning-output.txt`. Then run `git apply ../tmp/studio-real-loop/b-round-493/sketch-494-delta-v5-to-v6.patch.txt`, with `--check` first.
     - **Tree clean at `e4e1d1c`** (the job restore lost the v5 work). The output must equal `b-round-493/claims-494-clean-start-output.txt`, which B ran on a clean `e4e1d1c` copy; stderr must equal `b-round-493/claims-494-clean-stderr.txt`. Then run `git apply ../tmp/studio-real-loop/b-round-493/sketch-494.patch.txt`.
     - Any other start state is a STOP. Either case ends with the same 6 files.
  2. **The claims script again.** It must equal `b-round-493/claims-494-sketch-output.txt`.
  3. `npm run typecheck` and `npm run lint`.
  4. **The covering vitest command** from `tasks/round-492.md` §2. Expected: 6 files / 97 tests [K7].
  5. **The code-reviewer** on the three changed docs, with this instruction: "check every sentence of doc 318 against `b-round-493/doc-ledger.md` and the evidence files it names; report a sentence as false only with the contradicting file".
- **A does not run** the full suite, the build or browser probes.
- **Report in `a-round-494.md`:**
  - the start HEAD and `git status`;
  - the start check;
  - which apply case was used, its output, and K5;
  - the commands with their pass counts;
  - each reviewer finding mapped to a ledger row, a ruling id or a STOP.

## 3. C: rows
The full §3 table of `tasks/round-492.md` applies, with these changes:
- the output folder is `c-round-494/`;
- the claims script is `b-round-493/claims-494.sh`;
- every round number is 494.

C runs every row; this is not a short route. Probes run alone, after one untimed warm-up load (L38).

| Row | Change from round 492 | Pass when |
|---|---|---|
| C1 SOURCE-SCOPE | — | The same 6 paths. K3 reads `0 … 0 … 0` |
| C2 CLAIMS | `bash b-round-493/claims-494.sh`, at start and at end | Every line equals `b-round-493/claims-494-sketch-output.txt`, and stderr is empty. K14 may differ only if root rewrote this task. K1 and K22b may differ only by a gate file written after planning |
| C3 APPLY | K5 | `sketch-494-files ======`; `patch` = `recorded`; `delta` = `delta-recorded` |
| C4 COVERING | — | 6 files / 97 tests green |
| C5 DIALOG (browser) | Fresh production build of the v6 tree (`b-round-491/probe/serve-prod.sh`); out `c-round-494/` | `PW-CHECK PASS`, 18 rows × 3 viewports. K21 predicts the CSS equals v5/v3; C may record the build's CSS sha256 |
| C5b BACKDROP (browser, new) | `node b-round-493/probe/backdrop-probe.mjs http://127.0.0.1:<port> <abs c-round-494>` on the same production build | At 1440×900, 1280×720 and 375×812: `stripPx` 40, `firstOutsideHit` is the page `min-h-screen` div, and `dialogCountAfterStripClick` is 1. These are the doc l.36 and l.95 facts. Another value is a doc-truth FAIL of C-R493-01, not of the code |
| C6 MUTANTS | On a copy, as in round 492 (L60) | `M0` 33 passed; MA … MT: 20 RED, 0 SURVIVED, 0 NOT-APPLIED |
| C7 VISUAL | Also one keyboard-opened crop of Current Password per viewport | The brass ring shows on a keyboard open. Mouse-open screenshots look like HEAD's |
| C8 AUTH + STUDIO | The playback state is read from `[data-testid="arrangement-playback-state"]` `textContent` [K23]. The clip count is the number of distinct `[data-clip-id]` values: 0 before Enter, 1 after, at both viewports (B's probe: `b-round-493/probe/clip-probe.json`) [K27] | `/account` and `/studio/middle-east` show "Sign in required" (0 `audio[src]`). `/studio-lab`: `auth_user` null, `Demo collection ready`. Enter adds 1 clip. Space → `Playing`, clock > `00:00.000`. Space → `Stopped` |
| C9 DOC | Full truth check of doc 318, plus the changed lines of 315 and 317, against `b-round-493/doc-ledger.md` and C's own C5/C5b rows | l.4 is byte-exact `**სტატუსი:** Completed (C round 494 PASS)`. 7 TEMPLATE headings. `C round N pending` count 0. `pd-ids-missing` empty. `round493-in-docs` is 0 for all three files. `round492-in-docs` is 0 for 315 and 317 and exactly 2 for 318 (the historic mentions at l.36 and l.86) [K10]. l.22 agrees with C5 (P2, P8, P9 `none 0px`; P6, P7 `solid 1px`); l.22's caret clause holds because `pw-492.mjs` screenshots use Playwright's default caret hiding, so C records that the caret is outside its pixel evidence. l.93 (assert): start the v6 production build on port 5195 and a HEAD build on 5196 (`serve-prod.sh start <abs c-round-494>/head 5196 e4e1d1c`), then `mkdir -p <abs c-round-494>/ctrlk && cd <abs c-round-494>/ctrlk && node <abs loop>/b-round-492/probe/ctrlk-esc-probe.mjs > ctrlk-esc-probe.json`. The JSON equals `b-round-492/probe/ctrlk-esc-probe.json` (Esc closes both on v5/v6; at HEAD only the palette). Record: `ctrlk-v5-open.png` and `ctrlk-head-open.png` show the palette dimmed behind the dialog at the top right (the script's `v5` label is the tree build). l.36 and l.95 agree with C5b. Each ledger row C checks names its evidence; record any sentence with no ledger row |
| C10 L57 | `python3 -I tools/l57-check.py c-round-494.json c-round-494/l57-check.txt` | rc 0. All L57 fields are written. `mutantRedOnSketch` = `b-round-491/mutants/mutants-summary.txt` and `b-round-491/probe/pw-check-mutO.txt` |
| OWN-BACKEND | — | BLOCKED: backend unavailable in cloud, and `updatePassword` always throws. Not in `passed` |
| gate | — | Root gate only |

- **L22:** if A STOPs with no diff, run only C1, C2 and C8 and report "STOPPED — routed to B". If A STOPs with a diff, run C1, C2, C8 and the STOP's named check.
- **Manual row:** TLM-R492-SR-PASSWORD-DIALOG. It does not block; deadline RETRO 510.

## 4. Sketch review and mutants (L58)
- `b-round-493/sketch-review.md` names the full v6 sha256 and the delta sha256, with the `tech-lead` verdict on v6 (sentence-by-sentence, with a shell, against the ledger and the evidence files).
- It points to `b-round-492/sketch-review.md` for v4/v5 and to `b-round-491/sketch-review.md` for the code reviews and the ordering matrix.
- The mutants are unchanged, because the code equals v3: `b-round-491/mutants/mutants-summary.txt`, 20 RED [K13], and the browser mutant `pw-check-mutO.txt` [K12].

## 5. Outcome fixed in advance
- **C PASS with `browserVerified` true:**
  - The three Mediums become done for the client path.
  - These close: A-R488-REVIEW-L1-EXIT-ANIMATION-WINDOW, A-R491-REVIEW-PWMODAL-WORDING, C-R492-01, C-R493-01 and A-R493-REVIEW-F1, -F2, -F3, -F4, -F7 (fixed in v6 text).
  - OWN-BACKEND and B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED stay open with root.
  - **Next: round 495 = RETRO 495** (rounds 481–494). It adds the doc-truth lesson (RC-R492-DOC-TRUTH-REVIEW, 2×). Then DPG-BUTTON-CLEANUP. A REGRESSION round comes first if planning happens on or after 2026-11-16.
- **FAIL:** the fix-up takes round 495 (bug gate: the Mediums first), and RETRO moves to round 496.
- **PARTIAL (time):** the same round resumes from `c-round-494/progress.json`.
