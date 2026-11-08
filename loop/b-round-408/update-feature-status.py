# B round 408 -> 409: feature-status.md update (header, round 408 done line, next line, STUDIO-PERFORMANCE row). Not re-runnable.
import os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-408/update-feature-status.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/feature-status.md'
s = open(p).read()
old_hdr = 'განახლდა: 2026-11-08 · ავტორი: B (round 407 → round 408 დაგეგმვა, D-29z1412…D-29z1415)'
assert s.count(old_hdr) == 1
s = s.replace(old_hdr, 'განახლდა: 2026-11-08 · ავტორი: B (round 408 → round 409 დაგეგმვა, D-29z1416…D-29z1420)')
old_next = '  შემდეგი (D-29z1414…D-29z1415): **round 408 = PERF-11c-iii-e-i — მუშავდება.**'
assert s.count(old_next) == 1
new_lines = ('  - **Round 408 = PERF-11c-iii-e-i — მზადაა (C round 408 PASS, 8 row, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 408 გამოქვეყნდა `37b1db8`; D-29z1416).** Lane-ის 29 callback actions context-იდან მოდის (36 → 59 key); ბრაუზერის lane probe (mute/solo/volume/pan/Undo) ორივე viewport-ზე OK, leaf probe — 0 სხვაობა sketch-თან, 5/5 mutant წითელია C-ის scratch-ზე. TL-R406-SK-L1/L2/L3 დაიხურა; A-R408-REVIEW-AC8-PAN-TITLE → `deferred_low_polish` (D-29z1417). fake-bearer row — blocked (backend cloud-ში არ არის).\n'
             '  შემდეგი (D-29z1418…D-29z1420): **round 409 = PERF-11c-iii-e-ii — მუშავდება.** Lane ხდება თხელი shell (`useArrangement()` რჩება) + `memo` inner (`ArrangementLaneViewInner`), track-ის ველების შედარებით. B-ის ბრაუზერის probe (15 ნაბიჯი, ორივე viewport, დატვირთულ replicate-შიც): inner `[0,8,4,4,0,0,0,1,1,4,4,0,0,1,1]` shell-ის `[0,12,4,4,0,0,0,4,4,4,4,4,8,4,4]`-ის ნაცვლად — mute/Undo/Solo-ზე 1 ხაზი 4-ის ნაცვლად, ბიბლიოთეკის preview-ზე 0. ქცევა არ იცვლება (lane probe HEAD-სა და sketch-ზე OK; Solo ველის mutant ბრაუზერში წითელია). PERF-11c-iii ამით სრულდება; შემდეგ PERF-15. Root-ს გაეგზავნა ეტაპის საზღვრის არქიტექტურული checkpoint (ARCH-CHECKPOINT-PERF11C-III-BOUNDARY, არ ბლოკავს).\n'
             '  ძველი: შემდეგი (D-29z1414…D-29z1415): **round 408 = PERF-11c-iii-e-i — მუშავდება.**')
s = s.replace(old_next, new_lines)
old_row = '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1415): PERF-11c-iii-d — მზადაა (C round 407 PASS, `5508f70`); round 408 = PERF-11c-iii-e-i (Lane-ის callback-ები actions context-იდან); შემდეგ e-ii (Lane memo), PERF-15.** ძველი: '
assert s.count(old_row) == 1
s = s.replace(old_row, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1420): PERF-11c-iii-e-i — მზადაა (C round 408 PASS, `37b1db8`); round 409 = PERF-11c-iii-e-ii (Lane memo inner, PERF-11c-iii-ის ბოლო ეტაპი); შემდეგ PERF-15.** ძველი: **მუშავდება (D-29z1415): PERF-11c-iii-d — მზადაა (C round 407 PASS, `5508f70`); round 408 = PERF-11c-iii-e-i (Lane-ის callback-ები actions context-იდან); შემდეგ e-ii (Lane memo), PERF-15.** ძველი: ')
open(p, 'w').write(s)
open(done, 'w').write('applied\n')
print('ok feature-status')
