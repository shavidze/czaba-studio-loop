# RETRO 435 lessons edit (D-29z1541). Run from the loop root once. In-place clauses only; line count stays 60.
import os, sys
p = 'lessons.md'
if os.path.exists('b-round-434/edit-lessons.done'): sys.exit('already applied')
s = open(p, encoding='utf-8').read()
old3a = "`retros/retro-200.md` … `retro-420.md` (windows 123–199 … 416–419)"
assert s.count(old3a) == 1
s = s.replace(old3a, "`retros/retro-200.md` … `retro-435.md` (windows 123–199 … 420–434)")
old3b = "**RETRO 420 (D-29z1465):** L7 gains one clause (`tech-lead`)."
assert s.count(old3b) == 1
s = s.replace(old3b, old3b + " **RETRO 435 (D-29z1541):** L37 and L56 gain one clause each (both `tech-lead`); `tools/l57-check.py` validates `origin` values.")
old56 = "and B runs the claims script after the last edit; a count names the file it was counted from."
assert s.count(old56) == 1
s = s.replace(old56, "and B runs the claims script after the last edit; a count, name or pixel number written in a task names its file and JSON key, and C's CLAIMS row greps that value there (RETRO 435; evidence: B-R433-HEAD-BLUE-PX-MISCOUNT, task 8 px vs probe 32; B-R434-CONFIRMMODAL-NAME, 2×).")
old37 = "Evidence: C-R318-02 (≤ 15 never deducted the 5-fiber layout-effect commit; A STOP), C-R318-01 (load tolerance ambiguous) (1×)."
assert s.count(old37) == 1
s = s.replace(old37, old37 + " **Fiber-structure change → full perf suite on the sketch (RETRO 435):** a task that splits, wraps, memoises or moves components on a measured path (every ARCH-SPLIT stage) runs `npm run test:perf` alone (L38) on a production build of the sketch and saves the log as a `[K#]` claim; `test:perf` and `perf/lib` are not gate rows. Evidence: C-R423-01 (splits in 405–409, no perf run in 405–422), SIG-R424-BOUNDARY-FIBER-GUARD, GATE304-M1 (2×).")
open(p, 'w', encoding='utf-8').write(s); open('b-round-434/edit-lessons.done', 'w').write('ok\n'); print('ok')
