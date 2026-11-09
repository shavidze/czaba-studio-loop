import os, sys, re
LOOP = '/home/runner/czaba-project/tmp/studio-real-loop'
DONE = LOOP + '/b-round-418/update-feature-status.done'
if os.path.exists(DONE):
    sys.exit('already applied')
p = LOOP + '/feature-status.md'
t = open(p).read()
def sub(old, new):
    global t
    assert t.count(old) == 1, (old[:60], t.count(old))
    t = t.replace(old, new)
sub('განახლდა: 2026-11-08 · ავტორი: B (round 417 → round 418 დაგეგმვა, D-29z1454…D-29z1457)',
    'განახლდა: 2026-11-09 · ავტორი: B (round 418 → round 419 დაგეგმვა, D-29z1458…D-29z1461)')
old = '  შემდეგი (D-29z1456…D-29z1457): **round 418 = SYS-R416-PREVIEW-CONTROLLER — მუშავდება.**'
sub(old,
    '  - **Round 418 = SYS-R416-PREVIEW-CONTROLLER — მზადაა (D-29z1458).** C round 418 PASS: 8 row, `browserVerified`/`realVerified` true (`c-round-418.json`); 117/117, 12 mutant-ის ხაზი B-ის შედეგს ემთხვევა, დატვირთვაზე 40/40; ბრაუზერის 14 cell (R1, R1b, R5, R6, R7, R9, R10 × 2 viewport) HEAD-ის ტოლია, Play/Stop და auth რეალურ Chromium-ში. Gate 418 გამოქვეყნდა `3579fcc`. დაიხურა 7 preview Low და C-R417-L58-SKETCH-REVIEW-MISSING. ახალი Low-ები (A-R418-REVIEW-L1…L3, GATE418-L4) → `deferred_low_polish` (D-29z1459); reviewer-ების Architecture note → სიგნალი SIG-R418-PREVIEW-CONTROLLER-EXTRACT (არ იგეგმება).\n'
    '  შემდეგი (D-29z1460…D-29z1461): **round 419 = SYS-R369-STEM-CACHE-WRITE-COORDINATOR — მუშავდება.** stem cache-ის ერთი per-key operation map (write/delete) `writes`/`deletes`-ის ნაცვლად: 200 → 404 → 200 აღარ კარგავს ჩანაწერს (tombstone), integrity miss შლის მხოლოდ იმ ჩანაწერს, რაც წაიკითხა, ფაილის სახელები უნიკალურია (time-counter-random) და ერთნაირ სახელს store უარყოფს, victim-ებს შორის cancel-ის შემოწმება, `idle()` ყველა per-key ოპერაციას ელოდება. ხურავს 8 Low-ს (SC34–SC41, SC26). GATE368-L3 რჩება `deferred_low_polish`-ში: ლიმიტი STEM-LANES-ის დაგეგმვისას გაიზომება. მომხმარებლისთვის ქცევა არ იცვლება (production build-ზე 4 ფაზა × 2 viewport HEAD-ის ტოლია, `b-round-418/probe/compare-head-vs-sketch.txt`). შემდეგ: REGRESSION-2026-11-10 (პირველი დაგეგმვა 2026-11-10-ზე ან შემდეგ) → STEM-LANES → SYS-1…3.\n'
    '  ძველი: შემდეგი (D-29z1456…D-29z1457): **round 418 = SYS-R416-PREVIEW-CONTROLLER — მუშავდება.**')
m = re.search(r'\| STUDIO-PERFORMANCE \| \*\*მუშავდება \(D-29z1457\):', t)
assert m
t = t.replace(m.group(0), '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1461): SYS-R416-PREVIEW-CONTROLLER მზადაა (round 418, `3579fcc`); round 419 = SYS-R369-STEM-CACHE-WRITE-COORDINATOR; შემდეგ REGRESSION-2026-11-10, STEM-LANES.** ძველი: **მუშავდება (D-29z1457):', 1)
open(p, 'w').write(t)
open(DONE, 'w').write('ok\n')
print('feature-status updated')
