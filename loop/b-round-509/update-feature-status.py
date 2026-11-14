import os, sys
ROOT = '/home/runner/czaba-project/tmp/studio-real-loop'
P = ROOT + '/feature-status.md'; DONE = ROOT + '/b-round-509/update-feature-status.done'
if os.path.exists(DONE): sys.exit('refused: .done marker exists')
L = open(P, encoding='utf-8').read().split('\n')
def idx(prefix):
    h = [i for i, l in enumerate(L) if l.startswith(prefix)]
    if len(h) != 1: sys.exit(f'anchor {prefix[:50]!r}: {len(h)} hits')
    return h[0]
i = idx('განახლდა: 2026-11-14 · ავტორი: B (round 508 → round 509 დაგეგმვა, D-29z1837…D-29z1840)')
L[i] = L[i].replace('B (round 508 → round 509 დაგეგმვა, D-29z1837…D-29z1840)', 'B (round 509 → round 510 დაგეგმვა, RETRO 510, D-29z1842…D-29z1848)')
n = idx('  - **შემდეგი: round 509 = B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD')
L[n] = L[n].replace('  - **შემდეგი: round 509', '  ძველი: **შემდეგი: round 509', 1)
L[n:n] = [
 '  - **Round 509 = B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD — მზადაა cloud-ში შემოწმებადი ნაწილისთვის (D-29z1842).** C round 509 PASS: C0–C8, C10–C14, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-509.json`); „Get it free“ 1440/1280/375-ზე, anonymous → sign-in modal + toast, keyboard, version switch, paid პროდუქტი უცვლელი; signed-in, owned და journey row-ები STUBBED (L36). gate 509-მა გამოაქვეყნა `f5d1b9e`. **ღიაა:** რეალური $0 order (C9 BLOCKED, backend cloud-ში არ არის) → FREE-CHECKOUT-REAL-BACKEND; B-R509-AUTHMODAL-NOT-A-DIALOG (Medium, root grant). gate-ის 3 Low + A-ს 2 Low → `deferred_low_polish`; Architecture → SIG-R509-SELECTED-VERSION-OFFER (D-29z1843). NONBRAND: ProductSidebar l.75 დასრულდა.',
 '  - **შემდეგი (D-29z1844…D-29z1848): round 510 = RETRO 510 (რაუნდები 495–509) — მოწმდება.** ანგარიში `retros/retro-510.md`; ეკრანი `user-review/screen-review-510.md` (SR-510-1 Low); კითხვები `user-review/questions-retro-510.md` (Q1–Q6); lessons 57,435 B / 59 ხაზი (L1, L11, L26, L52); ახალი `tools/ledger-check.py`; სისტემური ამოცანა DPG-BUTTON-CONTRACT-TABLE (18 Low, N2–N9-ის შემდეგ). App კოდი არ იცვლება. შემდეგ: round 511 = REGRESSION (თუ 2026-11-16-ზე ან მის შემდეგ), თორემ NONBRAND N2 (PurchaseHeader-ის in-card ღილაკები + PlayStems).',
]
for pre_, new in [('| B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD |', 'მზადაა (cloud ნაწილი)')]:
    h = [k for k, l in enumerate(L) if l.startswith(pre_)]
    for k in h:
        parts = L[k].split(' | ', 2)
        L[k] = parts[0] + ' | ' + parts[1] + ' | **' + new + '** — C round 509 PASS, browserVerified true, გამოქვეყნდა `f5d1b9e`; რეალური $0 order → FREE-CHECKOUT-REAL-BACKEND (D-29z1842). ძველი: ' + parts[2]
k = idx('| DPG-FIX |')
parts = L[k].split(' | ', 2)
L[k] = parts[0] + ' | **მუშავდება** (D-29z1848: round 509 sidebar „Get it free“ C PASS, `f5d1b9e`; round 510 RETRO 510; შემდეგ REGRESSION/NONBRAND N2–N9, StemsPlayerModal, PD-R498, DPG-BUTTON-CONTRACT-TABLE, P1-ის დანარჩენი, DP gate, P2). ძველი: ' + parts[1] + ' | ' + parts[2]
k = idx('**RETRO 495 (D-29z1768;')
L[k:k] = ['**RETRO 510 (D-29z1846; `user-review/questions-retro-510.md`):** TLM-R485-SR-ROUTE-ANNOUNCE, TLM-R489-SABA-ENTRANCE-FEEL, TLM-R489-TOUCH-SWIPE, TLM-R491-PHONE-NAME-EDITOR ორ RETRO-ზე უპასუხოდ → შეუერთდა **SABA-DEVICE-CHECKS**-ს. TLM-R492-SR-PASSWORD-DIALOG → Q2, ვადა RETRO 525. Firefox/Safari/IME → ვადა RETRO 525. ARCH-CHECKPOINT-ACCOUNT-PROFILE — root-ის პასუხი არ არის. არაფერს ბლოკავს.', '']
open(P, 'w', encoding='utf-8').write('\n'.join(L)); open(DONE, 'w').write('applied\n'); print('applied')
