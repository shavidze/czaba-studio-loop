# B round 352 -> 353: lessons.md edits (RETRO 353, D-29z1131). Run once from the loop root.
import pathlib, sys
P = pathlib.Path('lessons.md')
s = P.read_text()
assert len(s.split('\n')) in (61, 60), len(s.split('\n'))
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)
rep("Sources: `retros/retro-200.md` … `retro-336.md` (windows 123–199 … 321–335).",
    "Sources: `retros/retro-200.md` … `retro-353.md` (windows 123–199 … 336–352).")
rep("**RETRO 336 (D-29z1015):** L58 gains the sketch-review clause and the record wording; L22 gains the STOP-with-diff short route; L57 gains the affected-check fields (all `tech-lead`).",
    "RETRO 336: D-29z1015. **RETRO 353 (D-29z1131):** rules that existed but were not applied become checkable artifacts: L58 sketch-review clause replaced (sha256 + per-row mutant logs), L57 gains the `tools/l57-check.py` checker, L28 gains the no-`pending` clause (all `tech-lead`).")
rep("**B's sketch is reviewed before dispatch:** B runs the code-reviewer on the sketch diff; each Medium+ finding is fixed in the sketch or ruled by id in the task. An unruled Medium that A's reviewer then finds on B's sketch is a planning FAIL. Evidence: C-R327-01 (A-R327-REVIEW-SAME-TEXT-REMOUNT; A STOP 327) (1×).",
    "**Sketch review and mutant logs are claims (RETRO 353):** `b-round-N/sketch-review.md` opens with the sha256 of the dispatched sketch and rules each Medium+ by id (reviewer: code-reviewer, or `tech-lead` while it is off B's list); each predicted mutant → red row has a saved `mutant-<id>.log` run with the new tests, and its `[K#]` greps that row failing (`test -f` alone is not a claim). Evidence: C-R327-01, C-R350-01 (M-B2 pair never run), C-R351-01 (review skipped) (3×).")
rep("Evidence: `b-round-335/exp-fields.txt` (gateChecksRunOnSketch 0–2 of 6 in 322–335) (1×).",
    "Evidence: `b-round-335/exp-fields.txt` (gateChecksRunOnSketch 0–2 of 6 in 322–335) (1×). **Checker (RETRO 353):** C does not hand off until `python3 -I tools/l57-check.py c-round-N.json c-round-N/l57-check.txt` exits 0 (an absence is C's bookkeeping to fix, not a row FAIL); B runs it at planning and logs absences as INFO. Evidence: fields absent in 8 of 16 JSONs 337–352, `origin` on 1 of 7 bugs (`b-round-352/l57-coverage.txt`) (2×).")
rep("Evidence: 8 stale-status findings in rounds 200–214 under the old rule",
    "**No `pending` form (RETRO 353):** multi-stage docs use the same form; `C round N pending` is never written, and C's DOCS row greps `docs/implementation` for it (0 hits). Evidence: doc 232 published `C round 352 pending` at `a55543b` after C passed (RC-R351-L28-PENDING-FORM) (1×). Evidence: 8 stale-status findings in rounds 200–214 under the old rule")
P.write_text(s)
print('ok')
