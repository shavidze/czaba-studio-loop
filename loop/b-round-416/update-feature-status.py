import os, sys, re

LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = LOOP + '/b-round-416/update-feature-status.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = LOOP + '/feature-status.md'
t = open(p).read()


def sub(old, new):
    global t
    assert t.count(old) == 1, (old[:60], t.count(old))
    t = t.replace(old, new)


sub('ავტორი: B (round 415 → round 416 დაგეგმვა, D-29z1444…D-29z1449)',
    'ავტორი: B (round 416 → round 417 დაგეგმვა, D-29z1450…D-29z1453)')

old_next = '  შემდეგი (D-29z1445…D-29z1449): **round 416 = RETRO 416 — მუშავდება (კოდი არ იცვლება).**'
sub(old_next,
    '  - **Round 416 = RETRO 416 — მზადაა (D-29z1450).** C round 416 PASS: 11 row, `browserVerified`/`realVerified` true, 0 app ბაგი (`c-round-416.json`); auth guard, Studio smoke და ეკრანის/journey row-ები 1440×900 და 1280×720-ზე; retro-ს რიცხვები და ID-ები მიკვლევადია. ერთი environment Low (C-R416-CLAIMS-K22-ARCHIVE, B-ის claims script) — გასწორდა B-ის tooling-ში (D-29z1451), C ამოწმებს round 417-ში. Gate 416: skipped (კოდი არ შეცვლილა); baseline რჩება `344a59f`.\n'
    '  შემდეგი (D-29z1452…D-29z1453): **round 417 = SYS-CLOCK-DETERMINISM — მუშავდება (მხოლოდ ტესტები).** ხუთი jsdom row (EN10, VDS3, SF11, IM24, BW5) აღარ არის დამოკიდებული რეალურ საათზე: გაყინული `Date.now` / fake `Date`+`performance`, დროის წინ წაწევა ხელით; IM24-ის ბოლო ნაწილი ამოწმებს პროექტის ბოლოს გაჩერებას, როგორც ბრაუზერში (C-R326-01); BW5-ში wall-clock ზღვარი შეიცვალა ოპერაციების დათვლით. ხურავს 6 Low/info-ს. Sketch `b-round-416/sketch-417.patch.txt`, mutant-ები `b-round-416/mutants/summary.txt`. REGRESSION 2026-11-10-დან.\n'
    '  ძველი: შემდეგი (D-29z1445…D-29z1449): **round 416 = RETRO 416 — მუშავდება (კოდი არ იცვლება).**')

m = re.search(r'\| RETRO 416 \| \*\*მუშავდება \(D-29z1445\):\*\*', t)
assert m
t = t.replace(m.group(0), '| RETRO 416 | **მზადაა (D-29z1450):** C round 416 PASS (`c-round-416.json`, 11 row, ბრაუზერი ორივე viewport-ზე). ძველი: **მუშავდება (D-29z1445):**', 1)

m = re.search(r'\| STUDIO-PERFORMANCE \| \*\*მუშავდება \(D-29z1448\):', t)
assert m
t = t.replace(m.group(0), '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1453): RETRO 416 მზადაა; round 417 = SYS-CLOCK-DETERMINISM (მხოლოდ ტესტები); შემდეგ SYS-R416-PREVIEW-CONTROLLER, SYS-R369, STEM-LANES.** ძველი: **მუშავდება (D-29z1448):', 1)

open(p, 'w').write(t)
open(DONE, 'w').write('ok\n')
print('feature-status updated')
