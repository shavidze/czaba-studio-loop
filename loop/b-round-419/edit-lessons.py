# RETRO 420 lessons edit (D-29z1465). Run from the loop root once.
import os,sys
p='lessons.md'; s=open(p,encoding='utf-8').read()
if os.path.exists('b-round-419/edit-lessons.done'): sys.exit('already applied')
old3a="`retros/retro-200.md` … `retro-416.md` (windows 123–199 … 401–415)"
assert s.count(old3a)==1, 'l3 pointer'
s=s.replace(old3a,"`retros/retro-200.md` … `retro-420.md` (windows 123–199 … 416–419)")
old3b="L58 gains the `tools/l58-check.py` checker."
assert s.count(old3b)==1, 'l3 tail'
s=s.replace(old3b,old3b+" **RETRO 420 (D-29z1465):** L7 gains one clause (`tech-lead`).")
old7="7. **Close what a later round fixed.** When a fix-up closes a bug, grep `deferred_low_polish` and `open_findings` for the same root cause and close or update those ids in the same planning. Evidence: A-R147-REVIEW-L2-BADGE-CLASS-SELECTOR stayed open 21 rounds after round 179 fixed it."
assert s.count(old7)==1, 'L7'
s=s.replace(old7,"7. **Close what a later round fixed; a confirmation is not a new id.** When a fix-up closes a bug, grep `deferred_low_polish` and `open_findings` for the same root cause and close or update those ids in the same planning. A C or gate finding that confirms an existing A or TL id is written as `confirmedBy` on that id, not as a new entry. Evidence: A-R147-REVIEW-L2-BADGE-CLASS-SELECTOR stayed open 21 rounds after round 179 fixed it; round 418 filed eight ids (A-R418-REVIEW-L1/L2/L3, C-R418-×3, TL-R418-L2/L3) for three issues (1×).")
open(p,'w',encoding='utf-8').write(s); open('b-round-419/edit-lessons.done','w').write('ok\n')
