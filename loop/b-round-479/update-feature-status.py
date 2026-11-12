import os
import shutil
import sys

ROOT = '/home/runner/czaba-project/tmp/studio-real-loop'
P = ROOT + '/feature-status.md'
DONE = ROOT + '/b-round-479/update-feature-status.done'
if os.path.exists(DONE):
    print('refused: .done marker exists')
    sys.exit(0)
shutil.copyfile(P, ROOT + '/b-round-479/feature-status-before-480.md')
L = open(P, encoding='utf-8').read().split('\n')

i3 = next(i for i, l in enumerate(L) if l.startswith('განახლდა: 2026-11-12 · ავტორი: B (round 478'))
L[i3] = L[i3].replace('B (round 478 → round 479 დაგეგმვა, D-29z1695…D-29z1699)', 'B (round 479 → round 480 დაგეგმვა, D-29z1700…D-29z1706)')

inext = next(i for i, l in enumerate(L) if l.startswith('  შემდეგი (D-29z1697…D-29z1699): **round 479 = DPG-FOOTER-LINKS'))
L[inext] = L[inext].replace('  შემდეგი (D-29z1697', '  ძველი: შემდეგი (D-29z1697', 1)
new = [
    '  - **Round 479 = DPG-FOOTER-LINKS (DPG P1) — C PASS; ელოდება DP-gate-ის ხელახალ შეფასებას (D-29z1700).** C round 479 PASS: C1–C12, C13 ჩაწერილი, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-479.json`); gate 479-მა გამოაქვეყნა `bbb3193`. გვერდი აღარ გადაიტვირთება, scrollY 0, პირველი Tab ლოგოზე. gate-ის Medium: client ნავიგაცია გვერდის სათაურს ეკრანის მკითხველს აღარ აცნობს — **GATE479-M1-ROUTE-ANNOUNCE (ბაგია, Medium; გადაწყვეტილება D-29z1704)**. header-ის 15 `<Link>`-ს ეს ხარვეზი round 479-მდეც ჰქონდა. LeadMagnet-ის ტაიმერი client ნავიგაციაზე → Low + Saba-ს კითხვა (D-29z1701).',
    '  შემდეგი (D-29z1702…D-29z1706): **round 480 = RETRO 480 (რაუნდები 465–479) — მოწმდება.** ანგარიში `retros/retro-480.md`, ეკრანი `user-review/screen-review-480.md` (SR-480-1…3), კითხვები `user-review/questions-retro-480.md` (Q1–Q7). App კოდი არ იცვლება. შემდეგ: round 481 = REGRESSION-2026-11-13, შემდეგ GATE479-M1-ROUTE-ANNOUNCE და B-R478-DEAD-MUSIC-LINK (D-29z1704), შემდეგ DPG-BUTTON-CLEANUP.',
]
L[inext:inext] = new

i5 = next(i for i, l in enumerate(L) if l.startswith('**RETRO 465-ის ხელით სია'))
L[i5:i5] = [
    '**RETRO 480 (D-29z1705; `user-review/questions-retro-480.md`):** Firefox-ის ხუთი შემოწმება → task FIREFOX-CHECKS (დაბლოკილია, ROOT-REQ-PLAYWRIGHT-FIREFOX); Safari-ის სია → task SAFARI-CHECKS (დაბლოკილია, Saba-ს macOS); TLM-R448-HIREUS-EMAIL-CLIENTS → task HIREUS-EMAIL-CLIENTS (დაბლოკილია, Brevo/Saba); TLM-R468-SABA-SCROLL-DEVICE → Q1, ვადა RETRO 495; IME და PERF-ის გაჩერებული ნაწილები → ვადა RETRO 495. არაფერს ბლოკავს.',
    '',
]
open(P, 'w', encoding='utf-8').write('\n'.join(L))
open(DONE, 'w').write('applied\n')
print('applied')
