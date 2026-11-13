import os, sys
ROOT = '/home/runner/czaba-project/tmp/studio-real-loop'
P = ROOT + '/feature-status.md'; DONE = ROOT + '/b-round-494/update-feature-status.done'
if os.path.exists(DONE): sys.exit('refused: .done marker exists')
L = open(P, encoding='utf-8').read().split('\n')
def idx(prefix):
    h = [i for i, l in enumerate(L) if l.startswith(prefix)]
    if len(h) != 1: sys.exit(f'anchor {prefix[:50]!r}: {len(h)} hits')
    return h[0]
i = idx('განახლდა: 2026-11-13 · ავტორი: B (round 493 → round 494 დაგეგმვა, D-29z1761…D-29z1763)')
L[i] = L[i].replace('B (round 493 → round 494 დაგეგმვა, D-29z1761…D-29z1763)', 'B (round 494 → round 495 დაგეგმვა, RETRO 495, D-29z1764…D-29z1770)')
n = idx('  შემდეგი (D-29z1761…D-29z1763): **round 494 =')
L[n] = L[n].replace('  შემდეგი (D-29z1761', '  ძველი: შემდეგი (D-29z1761', 1)
L[n:n] = [
 '  - **Round 494 = B-R488-PASSWORD-MODAL-DIALOG + B-R492-PASSWORD-FIELDS-UNNAMED + B-R492-PASSWORD-ERROR-NOT-ANNOUNCED — მზადაა client path-ისთვის (D-29z1764).** C round 494 PASS: C1–C10 + C5b, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-494.json`); PW-CHECK 18 row × 1440/1280/375, backdrop-ის ზოლი 40 px გაზომილია, doc 318-ის სიმართლე შემოწმდა (C9); gate 494-მა გამოაქვეყნა `3bcf8cb`. დაიხურა C-R492-01, C-R493-01, A-R488-REVIEW-L1, A-R491-REVIEW-PWMODAL-WORDING, A-R493-REVIEW-F1/F3/F4/F7. backend-ის ნაწილი (OWN-BACKEND) BLOCKED რჩება; B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) root-თანაა. gate-ის review: 4 Low → confirmedBy / GATE494-L4-TEST-BLANK-LINES (D-29z1765).',
 '  შემდეგი (D-29z1766…D-29z1770): **round 495 = RETRO 495 (რაუნდები 480–494) — მოწმდება.** ანგარიში `retros/retro-495.md`, ეკრანი `user-review/screen-review-495.md` (ახალი SR არ არის), კითხვები `user-review/questions-retro-495.md` (Q1–Q6), lessons 57,164 B. App კოდი არ იცვლება. შემდეგ: round 496 = DPG-BUTTON-CLEANUP (REGRESSION, თუ დაგეგმვა 2026-11-16-ზე ან მის შემდეგაა); SYS-R495-SHARED-DIALOG — root-ის grant-ის შემდეგ.',
]
for pre_, new in [('| B-R488-PASSWORD-MODAL-DIALOG |', 'მზადაა'), ('| B-R492-PASSWORD-FIELDS-UNNAMED |', 'მზადაა'), ('| B-R492-PASSWORD-ERROR-NOT-ANNOUNCED |', 'მზადაა'), ('| C-R492-01 |', 'დახურულია'), ('| C-R493-01 |', 'დახურულია')]:
    k = idx(pre_)
    parts = L[k].split(' | ', 2)
    L[k] = parts[0] + ' | ' + parts[1] + ' | **' + new + '** (client path) — C round 494 PASS, browserVerified true, გამოქვეყნდა `3bcf8cb` (D-29z1764). ძველი: ' + parts[2]
k = idx('**RETRO 480 (D-29z1705;')
L[k:k] = ['**RETRO 495 (D-29z1768; `user-review/questions-retro-495.md`):** TLM-R468-SABA-SCROLL-DEVICE ორ RETRO-ზე უპასუხოდ დარჩა → task **SABA-DEVICE-CHECKS** (დაბლოკილია Saba-ს მოწყობილობაზე; SABA-B-15 მასთან ერთად დაიხურება). TLM-R485-SR-ROUTE-ANNOUNCE, TLM-R489-SABA-ENTRANCE-FEEL, TLM-R489-TOUCH-SWIPE, TLM-R491-PHONE-NAME-EDITOR → Q2, ვადა RETRO 510. Firefox/IME → ვადა RETRO 510. არაფერს ბლოკავს.', '']
open(P, 'w', encoding='utf-8').write('\n'.join(L)); open(DONE, 'w').write('applied\n'); print('applied')
