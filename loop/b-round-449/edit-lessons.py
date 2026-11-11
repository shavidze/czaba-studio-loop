# RETRO 450 lessons edit (D-29z1600). Run from the loop root once. In-place clauses only; line count stays 60.
import os, sys
p = 'lessons.md'
if os.path.exists('b-round-449/edit-lessons.done'): sys.exit('already applied')
s = open(p, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)
rep("`retros/retro-200.md` … `retro-435.md` (windows 123–199 … 420–434)", "`retros/retro-200.md` … `retro-450.md` (windows 123–199 … 435–449)")
rep("`tools/l57-check.py` validates `origin` values.", "`tools/l57-check.py` validates `origin` values. **RETRO 450 (D-29z1600):** L4, L22 and L60 gain one clause each (all `tech-lead`); L1 gains one evidence id.")
rep("B-R203-LEADMAGNET-AUTO-OPEN-FOCUS (1×).", "B-R203-LEADMAGNET-AUTO-OPEN-FOCUS (1×). An inventory grep is a scanner too: RETRO450-B-INVENTORY-TOOL-FIRST-PASS (round-449 planning; the advisor caught it) (1×).")
rep("Evidence: C-R394-01, A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING, D-29z1350 (1×).",
    "Evidence: C-R394-01, A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING, D-29z1350 (1×). **Port preserves HEAD (RETRO 450):** when a sketch rewrites, ports or extracts a test or module, B lists every assertion, position and output HEAD pins (sibling suites included) and maps each to a row or a ruled drop. Mutants run both ways: red where HEAD was wrong, and red when a HEAD pin is removed. Extraction gets a golden test. Evidence: C-R438-01, A-R439-REVIEW-M1, A-R441-REVIEW-L1-OUTLINE-ORDER, RETRO450-B-SKETCH-NO-GOLDEN (4×).")
rep("Evidence: `c-round-411.json` (no L57 field, A-R411-REVIEW-M1 without `origin`) (1×).",
    "Evidence: `c-round-411.json` (no L57 field, A-R411-REVIEW-M1 without `origin`) (1×). **A STOP naming an unruled Medium+ (RETRO 450)** is a short FAIL even when every row passes; the gate never publishes an unruled Medium. Evidence: C-R442-M1 (round 442: PASS written, gate published `4aa3c82` before B ruled) (1×).")
rep("Evidence: INFO-C341-DELETE-MISTAKE (round 341 deleted untracked evidence WAVs across the loop folder after a failed `cd`) (1×).",
    "Evidence: INFO-C341-DELETE-MISTAKE (round 341 deleted untracked evidence WAVs across the loop folder after a failed `cd`) (1×). **Store tree (RETRO 450):** never use `git stash`, `git checkout --` or shell string-replace edits in the store tree; source edits go through the editor tools or a reviewed `git apply` sketch, after the mapped primitives are read. Evidence: RETRO450-A-SHELL-EDITS-BYPASS-HOOK (round 447) (1×).")
open(p, 'w', encoding='utf-8').write(s); open('b-round-449/edit-lessons.done', 'w').write('ok\n'); print('ok')
