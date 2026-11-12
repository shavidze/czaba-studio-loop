import os, sys
L = '/home/runner/czaba-project/tmp/studio-real-loop'
done = os.path.join(L, 'b-round-467/update-feature-status-468.done')
if os.path.exists(done): sys.exit('already applied')
p = os.path.join(L, 'feature-status.md')
t = open(p, encoding='utf-8').read()
old_hdr = 'განახლდა: 2026-11-12 · ავტორი: B (round 466 → round 467 დაგეგმვა, D-29z1645…D-29z1646)'
assert t.count(old_hdr) == 1
t = t.replace(old_hdr, 'განახლდა: 2026-11-12 · ავტორი: B (round 467 → round 468 დაგეგმვა, D-29z1647…D-29z1649)')
anchor = '  შემდეგი (D-29z1646): **round 467 = STORE-2b-3c-2b fix-up'
assert t.count(anchor) == 1
new = (
 '  - **Round 467 = STORE-2b-3c-2b fix-up — მზადაა (D-29z1647).** C round 467 PASS: C1–C13, `browserVerified`/`realVerified` true, 0 ბაგი (`c-round-467.json`); gate 467 გამოქვეყნდა `9ba13ac`. TS8 ახლა spy-ით ამოწმებს pre-check-ს (M14 და 3 ხაზის წაშლა TS8-ს წითლად აქცევს, `c-round-467/c13-delete-lines.log`). დაიხურა C-R466-01, A-R451-REVIEW-L2-ZERO-OFFSET-UNITS, INFO-TL-R451-GLOW-CALC, GATE452-L1-GLOW-REGEX-WHOLE-SOURCE; STORE-2b-ის კოდის ეტაპები დასრულდა (2b-4-ის რიგები STORE-3/4-სა და DP-GATE-შია). Low A-R467-REVIEW-L1 → `deferred_low_polish`. fake-bearer — BLOCKED (cloud-ში backend არ არის).\n'
 '  - **Saba-ს 2026-11-12-ის საკითხები (D-29z1648, L42):** **SABA-B-15** (Medium) — Store-ის scroll არ არის რბილი → round 468; **SABA-B-16-LOGO-OLD-COLORS** (Medium) — ლოგოს ძველი ფერები → პირველი DP-GATE-ის შემავალი (root, ROOT-REQ-DP-GATE-FIRST; რომელი ასეტია, დასადასტურებელია); **SABA-Q-CTRLK-CONTENT** და **SABA-Q-GIFTCARDS-HEADER** — შენს პასუხს ელოდება; შეფასების „ობიექტურად კრიტიკული“ პოზიცია ჩაიწერა DP-GATE-ის მოთხოვნაში. კითხვები: `user-review/questions-round-467.md` (Q1–Q4). Tech Lead: TLM-R468-SABA-SCROLL-DEVICE (შენს მოწყობილობაზე, ვადა RETRO 480).\n'
 '  შემდეგი (D-29z1649): **round 468 = SABA-B-15 ეტაპი 1 (Store-ის მთავარი გვერდის scroll) — მუშავდება.** B-მ `9ba13ac`-ის production build-ზე გაზომა (`b-round-467/probe/scroll-prod-9ba13ac-cpu1.json`, LeadMagnet გათიშული): `/`-ზე scroll-ისას 33 ms-ზე გრძელი კადრების მედიანა 9 (1440) და 8 (1280), გრძელი კადრები Lenis-ის `raf`-შია; `/free-downloads` cloud-ის Chromium-ში სუფთაა (0). A ჯერ scratch ასლზე bisect-ით პოულობს მიზეზს; ასწორებს მხოლოდ `useSmoothScroll.ts`-ში, სხვა ფაილის შემთხვევაში STOP-ით ითხოვს grant-ს. C: მედიანა ≤ 2 ორივე viewport-ზე, Lenis-ის რბილი scroll შენარჩუნებული, LeadMagnet და modal-ები როგორც HEAD-ზე, auth/Studio smoke. შემდეგ: REGRESSION-2026-11-13 (პირველი დაგეგმვა 11-13-ზე ან შემდეგ), STORE-2c … STORE-5.\n'
 '  ძველი: ')
t = t.replace(anchor, new + anchor.lstrip(), 1)
open(p, 'w', encoding='utf-8').write(t)
open(done, 'w').write('ok\n')
print('ok')
