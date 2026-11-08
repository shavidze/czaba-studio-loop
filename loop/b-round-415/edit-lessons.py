import os, sys
P='/home/runner/czaba-project/tmp/studio-real-loop/lessons.md'
M='/home/runner/czaba-project/tmp/studio-real-loop/b-round-415/edit-lessons.done'
if os.path.exists(M): sys.exit('already applied (marker)')
L=open(P,encoding='utf-8').read().split('\n')
def ln(i, prefix):
    assert L[i-1].startswith(prefix), (i, L[i-1][:40]); return i-1
i=ln(3,'Kept by the RETRO rounds.')
old='Sources: `retros/retro-200.md` … `retro-401.md` (windows 123–199 … 385–400).'
assert old in L[i]
L[i]=L[i].replace(old,'Sources: `retros/retro-200.md` … `retro-416.md` (windows 123–199 … 401–415).')+' **RETRO 416 (D-29z1446):** L22, L38, L56, L57 and L58 gain one clause each (all `tech-lead`); L58 gains the `tools/l58-check.py` checker.'
i=ln(55,'22. **A stopped with no diff')
L[i]+=' **A short FAIL is still a full JSON (RETRO 416):** every short route writes all L57 fields (`null` with the reason) and an `origin` per bug, and `tools/l57-check.py` runs on it before hand-off. Evidence: `c-round-411.json` (no L57 field, A-R411-REVIEW-M1 without `origin`) (1×).'
i=ln(57,'38. **Perf runs alone (A and C).**')
L[i]+=' **Reviewers work on a copy (RETRO 416):** a reviewer or mutant run gets its own copy of B\'s scratch and never edits it; B commits the scratch only while no reviewer runs. Evidence: TL-R413-I1 (a concurrent reviewer mutant landed in B\'s scratch commit) (1×).'
i=ln(40,'56. **Every cited artifact exists at hand-off.**')
L[i]+=' **A sentence that describes a file change is read from that file (RETRO 416):** a retro, report or task line saying what changed in a file is written from that file\'s saved diff after the last edit, never from the plan. Evidence: C-R401-01 (retro-401 §10 named an l.3 pointer change the file did not have) (1×).'
i=ln(58,'57. **Write the harness fields every round')
L[i]+=' **Origin (RETRO 416):** `origin` is the phase whose artifact first held the defect, not who found it; a defect in B\'s dispatched sketch or task text is `B spec` even when A\'s reviewer or C finds it, and becomes `A` only where A changed that text. Evidence: RC-R401-ORIGIN-RETAG (387, 391 re-tagged), 411 untagged (2×).'
i=ln(41,'58. **An asserted number, name or byte pin')
L[i]+=' **Host-independent artifacts; the review is checked (RETRO 416):** a generator, fixture or committed asset pins every host-dependent input (sample rate, locale, time zone, random seed) and its test reads the pinned value from the artifact\'s meta; the sketch review asks what the host decides. Each dispatch runs `python3 -I tools/l58-check.py current-task.md` inside the claims script (rc 0: `sketch-review.md` names the unbroken sha256 of every `git apply` sketch and has a verdict). Evidence: A-R411-REVIEW-M1 / B-R411-SKETCH-M1-MISSED (round 411 lost); round 415 dispatched with no `sketch-review.md` (`b-round-415/data/l58-check-window.txt`) (2×).'
open(P,'w',encoding='utf-8').write('\n'.join(L))
open(M,'w').write('applied\n')
print('ok')
