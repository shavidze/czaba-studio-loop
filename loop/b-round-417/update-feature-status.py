import os, sys, re
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = LOOP + '/b-round-417/update-feature-status.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = LOOP + '/feature-status.md'
t = open(p).read()
def sub(old, new):
    global t
    assert t.count(old) == 1, (old[:60], t.count(old))
    t = t.replace(old, new)
sub('ავტორი: B (round 416 → round 417 დაგეგმვა, D-29z1450…D-29z1453)', 'ავტორი: B (round 417 → round 418 დაგეგმვა, D-29z1454…D-29z1457)')
old = '  შემდეგი (D-29z1452…D-29z1453): **round 417 = SYS-CLOCK-DETERMINISM — მუშავდება (მხოლოდ ტესტები).**'
sub(old,
    '  - **Round 417 = SYS-CLOCK-DETERMINISM — მზადაა (D-29z1454).** C round 417 PASS: 8 row, `browserVerified`/`realVerified` true (`c-round-417.json`); 5 ფაილი 63/63, 6 mutant B-ის შედეგს ემთხვევა, დატვირთვაზეც 63/63; IM24-ის end-stop, Play/Stop და auth რეალურ Chromium-ში 1440×900 და 1280×720-ზე. Gate 417 გამოქვეყნდა `061068d`. დაიხურა 6 საათის Low და C-R416-CLAIMS-K22-ARCHIVE. ორი Low (B spec): C-R417-L58-SKETCH-REVIEW-MISSING გასწორდა ამ დაგეგმვაში; BW5-ის hoist-ის სისუსტე (A-R417-REVIEW-M1, reviewer-ის Medium → Low მიზეზით) → `deferred_low_polish` (D-29z1455).\n'
    '  შემდეგი (D-29z1456…D-29z1457): **round 418 = SYS-R416-PREVIEW-CONTROLLER — მუშავდება.** ბიბლიოთეკის preview-ს request token (sourceId-ის ნაცვლად), stream-ის fallback `queueMicrotask`-ით (არასოდეს media handler-ის შიგნით), null-owner გამოძახება აღარ აჩერებს მიმდინარე preview-ს, same-url seek-ი error handler-ს ანახლებს, `currentTime`-ის დაცული წაკითხვა. მომხმარებლისთვის ქცევა არ იცვლება: ბრაუზერის 14 cell HEAD-ის ტოლია (`b-round-417/probe/compare-head-vs-sketch.txt`); B-ის ბრაუზერულმა pre-check-მა პირველ sketch-ში რეგრესია იპოვა (R1b) და dispatch-მდე გასწორდა. ხურავს 7 preview Low-ს. შემდეგ: SYS-R369 → STEM-LANES → SYS-1…3; REGRESSION-2026-11-10 — პირველ დაგეგმვაზე 2026-11-10-ზე ან შემდეგ.\n'
    '  ძველი: შემდეგი (D-29z1452…D-29z1453): **round 417 = SYS-CLOCK-DETERMINISM — მუშავდება (მხოლოდ ტესტები).**')
m = re.search(r'\| STUDIO-PERFORMANCE \| \*\*მუშავდება \(D-29z1453\):', t)
assert m
t = t.replace(m.group(0), '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1457): SYS-CLOCK-DETERMINISM მზადაა (round 417, `061068d`); round 418 = SYS-R416-PREVIEW-CONTROLLER; შემდეგ SYS-R369, STEM-LANES.** ძველი: **მუშავდება (D-29z1453):', 1)
open(p, 'w').write(t)
open(DONE, 'w').write('ok\n')
print('feature-status updated')
