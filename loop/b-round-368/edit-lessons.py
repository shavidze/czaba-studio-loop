# B round 368 -> 369: lessons.md edits (RETRO 369, D-29z1213). Run once from the loop root.
import pathlib, sys
P = pathlib.Path('lessons.md')
DONE = pathlib.Path('b-round-368/edit-lessons.done')
if DONE.exists():
    sys.exit('already applied')
s = P.read_text()

def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)

rep("Sources: `retros/retro-200.md` … `retro-353.md` (windows 123–199 … 336–352).",
    "Sources: `retros/retro-200.md` … `retro-369.md` (windows 123–199 … 353–368).")
rep("L28 gains the no-`pending` clause (all `tech-lead`).",
    "L28 gains the no-`pending` clause (all `tech-lead`). **RETRO 369 (D-29z1213):** L58 gains the reviewed-equals-dispatched and ordering-matrix clause, L30 the every-test-root clause (both `tech-lead`); L58 evidence parentheses shortened, no id removed.")
# L58: shorten evidence parentheses (ids kept), then append the RETRO 369 clause
rep("(three B-origin chains, 312–314, 316–317, 318–320; retro-321 §3) (3×)", "(retro-321 §3) (3×)")
rep("C-R322-01 (render-budget positive control hidden by the 81-file `StudioWorkspace` crash; A STOP 322); C-R323-01 (R11-P1e control silenced by the round-323 detail-wrapper memo; A STOP 323; D-29z910) (2×)",
    "C-R322-01 (A STOP 322), C-R323-01 (A STOP 323; D-29z910) (2×)")
rep("An unruled Medium that A's reviewer finds on B's sketch is a planning FAIL. Evidence: C-R327-01 (A-R327-REVIEW-SAME-TEXT-REMOUNT; A STOP 327), C-R350-01, C-R351-01 (3×).",
    "An unruled Medium that A's reviewer finds on B's sketch is a planning FAIL. Evidence: C-R327-01 (A-R327-REVIEW-SAME-TEXT-REMOUNT; A STOP 327), C-R350-01, C-R351-01 (3×). "
    "**Reviewed = dispatched; ordering contracts get a matrix (RETRO 369):** B asks for one review on the frozen sketch (after its mutants and pre-check); `sketch-review.md` names the reviewed sha256 and it equals the dispatched one, and any later edit gets a delta re-review listed with both shas. "
    "For a concurrency or ordering contract (writes, aborts, queues, joins), `sketch-review.md` holds an event-kind × event-kind matrix with one operation in flight (e.g. hit-200, hit-404, miss, abort, disable, delete, join); each cell names a row id or a ruled exclusion, and C counts n² cells. "
    "Evidence: B-R367-FINAL-SKETCH-UNREVIEWED (C-R367-DEDUP-CANCELLED-WRITE; A STOP 367), A-R368-REVIEW-L1 (2×).")
# L30: every test root the task can break is pre-run
old30 = [l for l in s.split('\n') if l.startswith('30. ')]
assert len(old30) == 1
rep(old30[0], old30[0] + " **Every test root is pre-run (RETRO 369):** B's sketch pre-check runs each test root the change can break, with that root's own config when `test:run` omits it (`perf/lib`: the scratch-config command, GATE304-M1); a red file outside the grant is granted, or the item changes, before dispatch. Evidence: C-R363-01 (DC-KINDS; A STOP 363) (1×).")
P.write_text(s)
DONE.write_text('ok\n')
print('ok', len(s.split('\n')))
