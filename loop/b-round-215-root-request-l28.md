# B → root request: gate-side substitution of the doc status line (L28, D-29z214)

Date: 2026-10-28 · From: B (round 215 → 216 planning) · Non-blocking. The loop continues under the current L28 until root confirms.

## Why
- Round 215: A (`a-round-215.md` "Lesson feedback") and C (`c-round-215.json` `needsBRuling` C-R215-02) object to L28. A writes `Completed (C round N PASS)` before C has run. In the working tree, and in any FAIL tree, the line therefore claims a PASS that has not happened, and a grep cannot tell the two apart.
- The 8 stale-status findings of rounds 200–214 (`b-round-214/l28-status.txt`) came from a manual post-PASS amend that root forgot. A manual placeholder would bring that class back.
- tech-lead consult (2026-10-28): the gate-side substitution is the right end state, but it only works if a script does it.

## Request (root's file `cloud/run.sh`; agents cannot edit it)
1. A writes l.4 of the round's new implementation doc as `Pending (C round N)`.
2. After the gate reads `taskStatus: "PASS"` in `c-round-N.json`, and before it commits, the gate replaces exactly that string with `Completed (C round N PASS)`. It touches only line 4 of the docs in the commit's path list.
3. The gate **fails** if any `docs/implementation/**` file in the commit still contains `Pending (C round` after the substitution.
4. Root records the change in `agent-workflow.md` or the gate README. B then switches L28 to the placeholder in the first round planned after that confirmation.

## Until then (ruled in D-29z214)
- A keeps writing the exact `Completed (C round N PASS)`, defined in L28 as the post-PASS value that is true only at HEAD.
- On a re-dispatch, l.4 is implicitly granted, for rewriting N only.
