import sys, os
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = L + '/b-round-367/update-feature-status.done'
if os.path.exists(done):
    sys.exit('already applied')
p = L + '/feature-status.md'
s = open(p).read().split('\n')
old = 'B (round 366 → round 367 დაგეგმვა, D-29z1201…D-29z1205)'
assert old in s[2]
s[2] = s[2].replace(old, 'B (round 367 → round 368 დაგეგმვა, D-29z1206…D-29z1209)')
i = next(k for k, l in enumerate(s) if l.startswith('  - **Round 367 = PERF-9b-ii — მუშავდება'))
assert s[i + 1].startswith('  შემდეგი (D-29z1205):')
s[i] = ('  - **Round 367 = PERF-9b-ii — ბაგია (C round 367 FAIL, `browserVerified` true; gate 367 skipped; D-29z1206).** '
        'A-მ STOP გააკეთა code-reviewer-ის განუჩინებელ Medium-ზე, C-მ დამოუკიდებლად გაიმეორა: C-R367-DEDUP-CANCELLED-WRITE — ერთი key-ს მეორე ჩატვირთვა `writes.has(key)`-ით ჩაწერას ტოვებდა, '
        'პირველი კი abort-ის გამო უქმდებოდა, ასე რომ ფაილი cache-ში არ ინახებოდა (მხოლოდ ეფექტურობა, არასწორი ბაიტები არა). ბრაუზერის row-ები (INTEGRITY, VALIDATOR ორივე viewport-ზე, G367-AUTH) გაიარა. '
        'მტკიცებულება: `c-round-367.md`, `c-round-367.json`, `a-round-367.md`. ძველი ჩანაწერი: ' + s[i].split('**', 2)[2].strip())
new = [
    '  - **Round 368 = PERF-9b-ii ხელახალი დავალება — მუშავდება (D-29z1208).** B-ის განჩინება (L10): ერთი key-ს ახალი ჩატვირთვა pending ჩაწერას **უერთდება** (თავის signal-ს ამატებს); '
    'ჩაწერა უქმდება მხოლოდ მაშინ, როცა ყველა შეერთებული signal გაუქმებულია. ახალი row-ები SC30–SC33 (abort → reload, join → abort, held body + 404, quota retry-ის abort), SC22-ის სათაური დაზუსტდა. '
    'B-ის pre-check: covering 35/35, v1 კლიენტი SC30/SC31-ზე წითელია, 19 mutant წითელი, production probe ორივე viewport-ზე იდენტური, tech-lead-ის შეფასება საბოლოო sketch-ზე: Medium+ არაა (`b-round-367/sketch-review.md`). '
    'doc 236 l.4 → `Completed (C round 368 PASS)`.',
    '  შემდეგი (D-29z1209): round 368 PERF-9b-ii → RETRO 369 (ფანჯარა 353–368) → REGRESSION (პირველი დაგეგმვა 2026-11-08-ზე ან შემდეგ, რომელიც RETRO არ არის) → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 (skip rule). Root-ს: ARCH-CHECKPOINT-PERF9-STEM-CACHE 368-ის PASS-ის შემდეგ (არ ბლოკავს).',
]
s[i + 1] = '  ძველი (round 367-ის დაგეგმვა): ' + s[i + 1].lstrip()
s[i + 2:i + 2] = new
j = next(k for k, l in enumerate(s) if l.startswith('| STUDIO-PERFORMANCE | **მუშავდება ('))
s[j] = s[j].replace('| STUDIO-PERFORMANCE | **მუშავდება (', '| STUDIO-PERFORMANCE | **მუშავდება (D-29z1208: PERF-9b-ii round 367 FAIL → round 368 ხელახლა (join fix); ', 1)
open(p, 'w').write('\n'.join(s))
open(done, 'w').write('ok\n')
print('ok')
