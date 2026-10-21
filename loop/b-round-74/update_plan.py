import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
anchor = '**D-29z39 — Round 73-ის შედეგი; Round 74: SRW-16 (FB-10) ეტაპი 2a — მარკერის გადატანა და მარკერის მენიუ.**'
assert t.count(anchor) == 1
block = '''**D-29z40 — Round 74-ის შედეგი; Round 75: SRW-16 ეტაპი 2a-ს გასწორება (C-R74-01, A-R74-MU8E-POINTERUP, C-R74-02).**

C round 74 (`tmp/studio-real-loop/c-round-74.md`, `c-round-74.json`) — **FAIL, `browserVerified: true`**. რეალურ ბრაუზერში ყველა რიგი PASS-ია ორივე viewport-ზე, მაგრამ `markers-ui.test.tsx` MU8 (l.526) წითელია. Gate 74 გამოტოვდა (`gates/gate-round-74.json`), კოდი tree-ში რჩება გამოუქვეყნებელი და არ ბრუნდება.

- **R1 — რიგი:** ერთი medium ბაგი და ორი მასთან დაკავშირებული low — ერთი რაუნდი (≤3 ბაგი). ეტაპი 2b Round 76-ზე გადადის (დაგეგმილია, არ გადადებულა): 2b-ის FAIL გასწორებას გამოქვეყნებას არ დაუბლოკავს.
- **R2 — C-R74-01:** stage 1-ის assertion „ისრები ფოკუსირებულ flag-ზე ისტორიას არ ქმნის“ D-29z39-ის B5-ს ეწინააღმდეგება. ეს B-ის spec-ის ხარვეზია, არა A-ს გადახვევა. ნებართვა: MU8-ის სათაური, l.526 → `toBe('Move Marker')`, ერთი assertion — მარკერების დროები →/←-ის შემდეგ უცვლელია; MU8e — ორი `pointerUp` და ერთი assertion, რომ ჟესტი გათავისუფლდა.
- **R3 — C-R74-02, უმცირესი პატიოსანი ქცევა:** მენიუ კონკრეტულ flag-ზეა მიბმული, ამიტომ იხურება, როცა flag ეკრანზე გადაადგილდება: მომხმარებლის ჰორიზონტალური scroll (იგივე წესი, რაც grid-მენიუს: Follow-ის ავტო-scroll დაკვრისას — არა, რომ MK-MENU-PLAY-ის „დაკვრისას გადასვლა“ არ დაირღვეს) და `pxPerSecond`-ის ცვლილება. ვერტიკალური scroll მენიუს არ ხურავს — მარკერების ხაზი sticky-ა და flag ადგილზე რჩება (C73-4b). დახურვისას ფოკუსი flag-ს უბრუნდება `preventScroll`-ით. Follow-ის წესის მეორე ასლი (grid-მენიუს effect + `handleTimelineScroll`) არქიტექტურულ სიგნალად ჩაიწერა, refactor არ კეთდება.
- **Ableton:** არ ეხება (ტესტის კონტრაქტი და მენიუს დახურვა CZABA-ს UI-ის წესია).
- **სიგნალები:** A-ს reviewer-ის Architecture note (pointer-gesture-ის scaffold-ის მესამე ასლი) ARCH-CHECKPOINT-SRW14-PREFS-ს დაემატა; checkpoint-ის თხოვნა root-ს SRW-16-ის საზღვარზე (2b-ის შემდეგ). ახალი info: INFO-C74-KEYBOARD-CONTEXTMENU-BUTTON (CDP-ით შეუმოწმებელი), INFO-C74-MENU-BOTTOM-UNREACHABLE, A-R74-MACOS-CTRL-CLICK (Low-ები), R74-T (Tech Lead).
- **შემდეგ:** Round 76 — ეტაპი 2b, შემდეგ SRW-17…SRW-20.

'''
t = t.replace(anchor, block + anchor)
old_row_prefix = '| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 72–73 (ეტაპი 1, C PASS, `6b574e8`), 74 (2a), 75 (2b) |'
assert t.count(old_row_prefix) == 1
t = t.replace(old_row_prefix, '| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 72–73 (ეტაპი 1, C PASS, `6b574e8`), 74–75 (2a + გასწორება, D-29z40), 76 (2b) |')
open(p, 'w', encoding='utf-8').write(t)
print('ok')
