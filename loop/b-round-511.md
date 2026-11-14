# B round 511 → 512 planning (2026-11-14)

**Advisor:** available. B consulted it after orientation and before writing. It recommended option (a), not bundling N3, a browser half, granting doc 330 and an inventory grep. All five are followed.
**Consults run:** `tech-lead` reviewed the doc sketch twice and approved both passes (`b-round-511/sketch-review.md`).
**Gate 511:** `skipped`, reason "C taskStatus FAIL". The next round's baseline is HEAD `f5d1b9e` plus the uncommitted round-511 tree. No published commit is new.

## Round 511 result (from `c-round-511.json` / `c-round-511.md`, D-29z1856)
- **C rows:** C0–C14 all PASS, `browserVerified`/`realVerified` true, 17 passed.
- **Why `taskStatus` is FAIL:** A STOPped on code-reviewer's Medium A-R511-REVIEW-DESIGN-SYSTEM-PRIMARY-EXAMPLES, and B had not ruled on it (L22).
- **Ruling (L10): option (a), a doc-only follow-up.**
  - Origin B spec: the round-511 grant allowed exactly two lines, which goes against L34 (grant the whole section).
  - The stale design doc would steer N3–N9.
  - N2 cannot publish without a C PASS anyway.
  - One finding id: C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES, Medium, with A's STOP id as its alias (L7).
- **Code is unchanged since C checked it:** the round-511 app diff equals `a-round-511/diff.patch`, and the four files are pinned (`b-round-511/r512-a511-pin-sha.txt`).
- **Not re-opened:**
  - The reviewer's mouse-down opacity Low (C3: opacity stayed at 0.5).
  - Pre-ruled items 1–5.

## Round 512 (D-29z1856…D-29z1859)
- **Scope:** docs only. `git apply b-round-511/sketch-512-docs.patch.txt` (sha `ad47fec4…`) on four docs:
  - `DESIGN_SYSTEM.md`: the colour row, the Variant Selection Guide and the Buttons sections, plus a new Buy block;
  - `docs/design/components/button.md`;
  - the Button section of `docs/technical/components/ui-components.md`, including the teal and orange hex values;
  - doc 330: l.4 becomes `Completed (C round 512 PASS)` (L28); its approach paragraph, file list and TODO are updated.
- **Inventory (L1):**
  - `buy` is used only by Buy Now.
  - Proceed to Checkout, Get it free, Upgrade to Premium and Unlock Premium use `primary`.
  - The cart Upgrade colour cites SABA-Q-502.
  - `card.md` l.126 is recorded and not granted, because it is an illustrative Card example.
- **Browser half,** so that N2 can be marked done: default card at 1440 and 1280, the anonymous journey, the Added pulse under both motion settings (record), and protection plus `/studio-lab`.
- **B's pre-check:**
  - Frozen checks rc 0.
  - The sketch applies, and the scratch has 0/0/0 stale strings [K17].
  - No test or script reads the docs [K10].
  - Claims K1–K17 run with empty stderr.
  - L58 OK and LEDGER OK.
- **New Low:** B-R511-CART-PULSE-REDUCED-MOTION. The "Added" pulse scales to 1.04 under reduced motion. It is older than N2 and goes to `deferred_low_polish`.
- **Recorded:**
  - A-R511-L60-SHELL-EDITS and A-R511-PRIMITIVES-PARTIAL-READ (process findings, origin A);
  - `confirmedBy` on SIG-R501-SHARED-BUTTON-SCANNER (three copies of the tag scanner; an Architecture note, not scheduled);
  - `confirmedBy` on INFO-C510-COLD-HYDRATION;
  - SIG-R477-DOCS-OUTSIDE-DESIGN is partly addressed;
  - RETRO input RC-R511-L34-DESIGN-DOC-GRANT.

## Architecture checkpoint
None requested. N2 is one stage of a larger block, and no new structural risk has built up on one owner. The scanner-copy note is already queued as part of DPG-BUTTON-CONTRACT-TABLE.

## Ready for commit
Nothing yet. After C round 512 PASS, root gates the 8 paths: the 6 from round 511 plus `button.md` and `ui-components.md`.

## Order after 512
1. REGRESSION on or after 2026-11-16.
2. NONBRAND N3–N9.
3. PD-R498, DPG-BUTTON-CONTRACT-TABLE, the rest of DPG P1, the DP gate and P2.
4. STORE-2c…5, then ARCH-SPLIT, then REVIEW-RECOMMENDATIONS, and the rest of the queue as before.

## Files written by B this planning
- `tasks/round-511.md` (byte copy)
- `current-task.md`, `b-next.json`, `b-round-511.md`
- `feature-status.md`
- `backlog.json`: v517 → v518, written by the script `b-round-511/update-backlog-512.py`
- `b-round-511/*`:
  - checkpoint;
  - backups: `backlog-before-512.json`, `feature-status-before-512.md`, `b-next-before-512.json`;
  - pins;
  - inventory;
  - docs grep;
  - the sketch, its generator and `scratch/`;
  - `sketch-review.md`, `doc-ledger.md`;
  - the probe and its run;
  - claims and their planning output.

No store file changed. The tree still holds round 511's 6 paths. The mock API B started for the probe was stopped by PID.
