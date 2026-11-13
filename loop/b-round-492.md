# B round 492 → 493 planning

**Decision:** CONTINUE. Round 493 re-dispatches the three round-492 Mediums with a docs-only v5.

## Inputs read
- **Inputs:** `context/active-summary.md`, `lessons.md` (L10, L22, L28, L29, L56 and L58 in full), `tasks/round-492.md`, `a-round-492.md`, `c-round-492.md`, `c-round-492.json` and `gates/gate-round-492.json`.
- **Baseline:** the gate status is **skipped** ("C taskStatus FAIL"), so there is no new published commit. The baseline stays `e4e1d1c` (gate 491). The store tree holds sketch v3 on the 6 granted paths, as A left it, and B did not touch the tree (`b-round-492/store-status-start.txt`).
- **Advisor:** available and consulted after orientation. The advice was applied; see `backlog.json` `advisor_used_by_B`.
- **Consults:** `tech-lead`, twice. The v4 docs review returned CHANGES REQUIRED; the v5 delta returned APPROVE (`b-round-492/sketch-review.md`).

## C round 492 (evidence, not "done")
- **Verdict:** FAIL, "STOPPED — routed to B", with `browserVerified` and `realVerified` true.
- **C5:** `PW-CHECK PASS`, 18 rows × 3 viewports on v3. C8: the auth guard and the `/studio-lab` add and play steps pass. C did not verify the "Stopped" step and B does not credit it.
- **Bug:** C-R492-01 (Low, origin B spec). Doc 318 l.22 claimed a ring on open; that is false for a mouse open (SABA-B-4).
- **Backlog effect:** nothing is marked done or **მზადაა**. The three Mediums stay **მუშავდება** and are re-dispatched.

## Rulings
- **The STOP, C-R492-01:** accepted delta, docs-only (D-29z1758). In doc 318:
  - l.22 describes the ring by modality, using C rows P2/P8/P9 and P6/P7;
  - l.4 becomes `C round 493 PASS` (L28);
  - l.63 "browser R7" becomes "P11, P12";
  - the PD8 line is reworded.

  In docs 315 and 317, "round 492" becomes "round 493".
- **tech-lead on v4** found three more false or unverified sentences. All are fixed in v5.
  - **TL-R493-D1:** the "0 px" match holds only at the 16/255 threshold.
  - **TL-R493-D2:** the Ctrl+K Esc closing both is new behaviour, not HEAD behaviour.
  - **TL-R493-D3:** "reopen keeps values" is untested, so it is now worded as an inference.
- **A's reviewer findings:**
  - A-R492-REVIEW-L1 … L9 (Low) and I1 (info) go to `deferred_low_polish` and are listed in the task as already ruled (D-29z1759).
  - L1 (keyCode 229) is fixed later together with the LeadMagnet precedent, which also checks only `isComposing`.
  - L6 (PD8): the secondary assert is vacuous, the primary one is real. The doc now claims only the primary.
- **Architecture note:** "keep". It is recorded as `confirmedBy` on SIG-R487-PROFILE-NAME-EDITOR-EXTRACT. The ARCH-CHECKPOINT-ACCOUNT-PROFILE request to root is still pending; it is not re-sent and does not block.

## Pre-checks on v5 (`b-round-492/`)
- **Patches:**
  - full patch `sketch-493.patch.txt`, sha `ea441270…`;
  - delta `sketch-493-delta-v3-to-v4.patch.txt`, v3 → v5, sha `c70366db…`.

  Both apply: the full patch on a clean `e4e1d1c`, and the delta on v3 and on the store tree (`--check`). Both give a result byte-equal to the scratch.
- **Covering:** 6 files / 97 tests.
- **Build:** the v5 production build is byte-identical to v3 (`build-diff.txt` empty, CSS sha equal). So the v3 browser rows, mutants, full suite and typecheck carry over as pre-checks.
- **B re-ran the doc claims the reviewer introduced** [K25]:
  - The zero-threshold pixel diff gives 823/823/1158 px, max 8/255.
  - Ctrl+K then Esc: at HEAD only the palette closes; on v5 both close (`probe/ctrlk-esc-probe.json`).
- **Clean-tree fallback:** its own start output is `claims-493-clean-start-output.txt`.
- **C8 selector:** `[data-testid="arrangement-playback-state"]` is a `hidden` span. B's probe shows `Stopped → Playing → Stopped` at 1440 and 1280 (`probe/stopped-probe.json`). The task tells C to read it that way.
- **Claims:** `claims-493.sh`, K1–K24. The outputs `claims-493-planning-output.txt` (store tree, v3) and `claims-493-sketch-output.txt` (scratch, v5) were generated after the last edit.

## Next and queue
- **Round 493:** re-dispatch (`current-task.md`). C runs the full C1–C10.
- **On PASS:**
  - the three Mediums and C-R492-01 close;
  - A-R488-REVIEW-L1 and A-R491-REVIEW-PWMODAL-WORDING close.
- **Then:** DPG-BUTTON-CLEANUP (DPG-FIX P1).
- **No regression is due.** The next is due on or after 2026-11-16 (`regression-last.json`, unchanged). RETRO comes at round 495.
- **Retro candidate:** RC-R492-DOC-TRUTH-REVIEW. Three code reviews passed a false doc sentence; the review should truth-check each doc sentence against the saved browser rows.
- **Feature boundary or owner risk:** `account.tsx` was touched in rounds 487, 488, 491, 492 and 493. The checkpoint request ARCH-CHECKPOINT-ACCOUNT-PROFILE is already with root. There is nothing new to request.

## Commit readiness
- Nothing new is ready. Round 492 was not published.
- Round 493's 6 paths become publishable only after C PASS and the root gate.
