import re
P='/home/runner/czaba-project/tmp/studio-real-loop/feature-status.md'
s=open(P,encoding='utf-8').read().split('\n')
def rep(prefix,new):
    idx=[i for i,l in enumerate(s) if l.startswith(prefix)]
    assert len(idx)==1,(prefix,idx)
    s[idx[0]]=new
rep('| A-R88-REVIEW-EDGES |','| A-R88-REVIEW-EDGES | Low | **დაიხურა** — #1: C round 102 CARD-1280 (1280 done: Tab → `scope-project` scroll 0 → 59, ბარათის ქვედა კიდე footer-ზე 8 px-ით მაღლა, `elementFromPoint` = ბარათი, ბარათის ზედა კიდე panel-ის ქვემოთ), CARD-IDLE-REG — scroll არ ხდება; გამოქვეყნდა `b6c9716`. #2 — გადაწყვეტილებით (= GATE89-S5; gate 102 #2 → GATE102-S2), #3 — მიუწვდომელია, #4 — round 101 | `c-round-102.md` CARD-1280, CARD-IDLE-REG | — |')
rep('| GATE101-S1/S2 |','| GATE101-S1/S2 | Low / Info | **დაიხურა** — C round 102 AX-ONCE: WAV render-ისა და MP3-ის ნიმუშში ტექსტი AX ხეში ერთხელაა (0 StaticText, 1 progressbar „ექსპორტის პროგრესი“); VALUETEXT-REG 0 შეუსაბამობა; S2 — მუტაცია e ეკვივალენტურია. გამოქვეყნდა `b6c9716`. სხვა ბრაუზერები → GATE102-S1 | `c-round-102.md` AX-ONCE, VALUETEXT-REG, AN-REVIEW | — |')
rep('| GATE101-S4 |','| GATE101-S4 | Low | **დაიხურა** — C round 102 SOURCE-UNCHANGED (doc 089 მხოლოდ l.4); გამოქვეყნდა `b6c9716` | `c-round-102.md` | — |')
rep('| INFO-B101-VALUETEXT-CDP |','| INFO-B101-VALUETEXT-CDP | Info | **დაიხურა** — C round 102: CDP-ის valuetext-ის Latin-1 → UTF-8 ხელახალი დეკოდირება ქართულ label-ს ემთხვევა; DOM-ის ატრიბუტი სწორია (CDP-ის არტეფაქტი). რეალური screen reader → GATE102-S1 | `c-round-102.json` notes | Tech Lead (GATE102-S1) |')
i=[k for k,l in enumerate(s) if l.startswith('| INFO-B101-VALUETEXT-CDP |')][0]
s[i+1:i+1]=[
'| GATE102-S1 | Low | **დაბლოკილია** (გარემო: მხოლოდ Chromium) — ფაზის ტექსტი ახლა მხოლოდ native `<progress>`-ის `aria-valuetext`-შია; Firefox/WebKit-ისა და რეალური screen reader-ის მხარდაჭერა შეუმოწმებელია. GATE97-S2/GATE101-S3-თან ერთად | `gates/round-102/review.md` #1 | Tech Lead |',
'| GATE102-S2 | Low | **მიღებულია** (= GATE89-S5): ბარათის ზომვის გამო მაუსის click 1280 done-ზე ~16 px-ით მეტად სქროლავს; reviewer-ის ანალიზით click იმავე ბარათში რჩება. `:focus-visible` — მხოლოდ UX-ის მოთხოვნით | `gates/round-102/review.md` #2 | სიგნალი |',
'| GATE102-S3 | Low | **ბაგია** (დღეს მიუწვდომელი) — ძალიან მაღალი ბარათისთვის guard-ს ზედა ზღვარი არ აქვს; გამოსწორდება იმ რაუნდში, რომელიც მაღალ ბარათებს დაამატებს | `gates/round-102/review.md` #3 | პირობითი |',
'| GATE102-S4 | Info | **არ დაწყებულა** — `progressText`-ის ტიპი `string \\| undefined`; შემდეგ dialog-ის რაუნდში | `gates/round-102/review.md` #4 | Low-ების პაკეტი |',
'| GATE102-S5 | Low | **მუშავდება** → Round 103: doc 090 l.4 | `gates/round-102/review.md` #5 | A → C (SOURCE-UNCHANGED) |',
'| ARCH-R102-FOOTER-GUARD-PURE-FN | Info | სიგნალი (არ არის დაგეგმილი) — guard-ის არითმეტიკა pure ფუნქციაში ან dialog-ის ოთხი focus effect ერთ hook-ში; checkpoint-ის მოთხოვნის დამატება (o) | `gates/round-102/review.md`, `a-round-102.md` Architecture note | root checkpoint |',
]
# C-R90 / GATE89-S3 / A-R87 rows: append dispatch note
for pref,note in [('| C-R90-MUT-B-CU4-GAP |',' **მუშავდება → Round 103 (D-29z68):** CU10 — cancel დასრულებულ encode-სა და ჩამოტვირთვას შორის; რჩება მხოლოდ თუ მუტაცია m6 3/3-ჯერ წითელია, თორემ დაიხურება გადაწყვეტილებით.'),
                  ('| GATE89-S3/S4/S6 |',' **S3 — მუშავდება → Round 103 (D-29z68):** worker-ის stall watchdog 30 წმ (ყოველი message თავიდან რთავს) + worker-ის შეცდომის ტექსტი.'),
                  ('| A-R87-L5 / A-R87-LOW-PU-ORDER |',' **PU-ORDER — მუშავდება → Round 103 (D-29z68):** პირველი PU4 ცალკე describe-ში, gate-ის release მთავარ beforeEach-ში; `-t PU2` ცალკე გადის.')]:
    k=[j for j,l in enumerate(s) if l.startswith(pref)]
    assert len(k)==1,pref
    cells=s[k[0]].split(' | ')
    cells[2]=cells[2]+note
    s[k[0]]=' | '.join(cells)
log='Round 103 (D-29z68): Export-ის pipeline-ის Low-ები. GATE89-S3: WAV worker-ის stall watchdog 30 წმ (ყოველ message-ზე თავიდან იწყება; complete/error/abort ასუფთავებს; terminate ერთხელ + ზუსტი ქართული შეტყობინება) და worker-ის შეცდომის ტექსტი constant-ს ემატება. C-R90-MUT-B-CU4-GAP: CU10 (პირობითი, m6 3/3). A-R87-LOW-PU-ORDER: PU ტესტები ცალკე გაშვებადია (cancel-ui-ს pattern). GATE102-S5: doc 090 l.4; ახალი doc 091. C: WD-STALL, WD-CANCEL, WD-ERRTEXT, WD-MP3, WD-SLOW (CPU 6×), EXPORT-REG, CANCEL-REG, PX-NET, REG-HYD, G103-3, PU-ALONE. Round 102 → C PASS `browserVerified`, გამოქვეყნდა `b6c9716` (A-R88 #1, GATE101-S1/S2/S4, INFO-B101 დაიხურა). **შემდეგი B-ის დაგეგმვა 2026-10-24-ზე ან შემდეგ — რეგრესიის რაუნდი.** შემდეგ: GATE96-S2 → grid/tempo და marker Low-ები → R21-I2 → T12 → VISUAL-A-OBSIDIAN. ფარგლები არ მცირდება.'
k=[j for j,l in enumerate(s) if l.startswith('Round 102 (D-29z67)')][0]
s[k:k]=[log,'']
open(P,'w',encoding='utf-8').write('\n'.join(s))
print('ok')
