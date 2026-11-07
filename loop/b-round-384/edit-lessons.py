# B round 384 -> 385: lessons.md edits (RETRO 385, D-29z1289). Run once from the loop root.
import pathlib, sys
P = pathlib.Path('lessons.md'); DONE = pathlib.Path('b-round-384/edit-lessons.done')
if DONE.exists(): sys.exit('already applied')
L = P.read_text().split('\n')
assert len([x for x in L if x != '' or True]) and L[2].startswith('Kept by the RETRO rounds.')
def rep(i, old, new):
    assert L[i].count(old) == 1, (i, old); L[i] = L[i].replace(old, new)
rep(2, "`retro-369.md` (windows 123–199 … 353–368).", "`retro-385.md` (windows 123–199 … 369–384).")
L[2] += " **RETRO 385 (D-29z1289):** L58, L59 and L31 gain one clause each; L29 gains the auth-recipe example (all `tech-lead`)."
assert L[19].startswith('31. ')
L[19] += " **Covering set too (RETRO 385):** the same 50 % check covers every test file the task names as covering, not only files that gain rows. Evidence: A STOP 376 (TC10, file unchanged) (1×)."
assert L[17].startswith('29. ')
L[17] += " **Recipe reaches the branch (RETRO 385):** a row aimed at one branch (e.g. 401) uses inputs that pass every earlier check (valid `product`/`file` before the auth check) and B runs it at the baseline. Evidence: B-R383-AUTH-ROW-BARE-URL, C-R382-AUTH-CLAIM-MISMATCH (2×)."
assert L[40].startswith('58. ')
L[40] += " **Release is proved in a browser (RETRO 385):** a release, eviction or retention claim is proved by a Chromium GC×2 liveness or heap-retainer probe on the sketch plus a mutant that keeps the object alive; source reads and jsdom are not that proof. Evidence: C-R382-01, D-29z1277 (1×)."
assert L[58].startswith('59. ')
L[58] += " **Heaviest first, and say why you stopped (RETRO 385):** run the heaviest evidence rows (prod heap, perf, mutants) first; a BLOCKED-for-time JSON carries `progressFile` and `stopSignal`. Evidence: INFO-C340, INFO-C341, C-R383-L59-EARLY-STOP (3×)."
P.write_text('\n'.join(L)); DONE.write_text('ok\n'); print('ok', len(L))
