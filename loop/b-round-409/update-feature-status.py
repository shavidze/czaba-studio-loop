# B round 409 -> 410: feature-status.md update (header, round 409 done line, next line, STUDIO-PERFORMANCE row). Not re-runnable.
import os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = f'{L}/b-round-409/update-feature-status.done'
if os.path.exists(done):
    sys.exit('already applied')
p = f'{L}/feature-status.md'
s = open(p).read()
old_hdr = 'განახლდა: 2026-11-08 · ავტორი: B (round 408 → round 409 დაგეგმვა, D-29z1416…D-29z1420)'
assert s.count(old_hdr) == 1
s = s.replace(old_hdr, 'განახლდა: 2026-11-08 · ავტორი: B (round 409 → round 410 დაგეგმვა, D-29z1421…D-29z1426)')
old_next = '  შემდეგი (D-29z1418…D-29z1420): **round 409 = PERF-11c-iii-e-ii — მუშავდება.**'
assert s.count(old_next) == 1
new_lines = ('  - **Round 409 = PERF-11c-iii-e-ii — მზადაა (C round 409 PASS, 8 row, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 409 გამოქვეყნდა `9616d3a`; D-29z1421).** Lane = shell + `memo` inner; leaf probe ორივე viewport-ზე: inner `[0,8,4,4,0,0,0,1,1,4,4,0,0,1,1]`; lane probe 8/8; 9/9 mutant + tsc guard წითელია C-ის scratch-ზე. **PERF-11c-iii და PERF-11c — მზადაა.** სამი Low → `deferred_low_polish` (A-R409-REVIEW-L4-TRACK-FIELD-COVERAGE, GATE409-L1, GATE409-L2); signal SIG-R409-SOURCE-DURATIONS-IDENTITY checkpoint-ს დაემატა (D-29z1422). fake-bearer row — blocked (backend cloud-ში არ არის).\n'
             '  შემდეგი (D-29z1423…D-29z1426): **round 410 = PERF-15a — მუშავდება.** წინასწარ გამოთვლილი peaks (BBC audiowaveform JSON): parser, `WorkspaceCollection.peaksUrl` (optional) და collection load-ში fallback — 16-bit + სიგრძის დამთხვევისას worker აღარ ეშვება, 8-bit მხოლოდ placeholder-ია, decoded შედეგი ყოველთვის იმარჯვებს, decode-ის შეცდომისას peaks იშლება. `/studio-lab` არ იცვლება (დემოს `peaksUrl` არ აქვს; probe HEAD-სა და sketch-ზე: 9 წყარო × 96 სვეტი, peaks request 0). B-ის sketch: სრული vitest 3903/3903, 14/14 mutant წითელია. **PERF-15 ჯერ არ არის მზადაა:** ბრაუზერში „waveform decode-მდე“ მტკიცება PERF-15b-შია (`page.route` stub, `product-designer`). „decode-მდე“ ნიშნავს მხოლოდ ბიბლიოთეკის preview-ს (lane-ს `ready` სჭირდება). Backend-ის handoff: `docs/technical/studio-real-workspace/perf-15-backend-peaks-handoff.md`.\n'
             '  ძველი: შემდეგი (D-29z1418…D-29z1420): **round 409 = PERF-11c-iii-e-ii — მუშავდება.**')
s = s.replace(old_next, new_lines)
old_row = '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1420): PERF-11c-iii-e-i — მზადაა (C round 408 PASS, `37b1db8`); round 409 = PERF-11c-iii-e-ii (Lane memo inner, PERF-11c-iii-ის ბოლო ეტაპი); შემდეგ PERF-15.** ძველი: '
assert s.count(old_row) == 1
s = s.replace(old_row, '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1426): PERF-11c-iii-e-ii — მზადაა (C round 409 PASS, `9616d3a`), PERF-11c — მზადაა; round 410 = PERF-15a (precomputed peaks loader, worker fallback); შემდეგ PERF-15b (ბრაუზერის მტკიცება), SYS-R2-FAKE-FIDELITY + SYS-R388.** ძველი: **მუშავდება (D-29z1420): PERF-11c-iii-e-i — მზადაა (C round 408 PASS, `37b1db8`); round 409 = PERF-11c-iii-e-ii (Lane memo inner, PERF-11c-iii-ის ბოლო ეტაპი); შემდეგ PERF-15.** ძველი: ')
open(p, 'w').write(s)
open(done, 'w').write('applied\n')
print('ok feature-status')
