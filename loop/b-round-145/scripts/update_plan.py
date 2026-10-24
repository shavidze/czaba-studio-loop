import sys
P = sys.argv[1]
t = open(P, encoding='utf-8').read()
block = '''**D-29z111 — Round 145-ის შედეგი; V-0.5a — ბაგია (მხოლოდ Low); Round 146: V-0.5a-ის მცირე გასწორება (preview-ის მარკერი ცალკე ხაზზე, C-R145-01 + ABL-B-1) და ტესტების ორი Low.**

C round 145 (`tmp/studio-real-loop/c-round-145.md`, `c-round-145.json`) — **FAIL**, `browserVerified`/`realVerified` — true. ყველა row PASS-ია (ტექსტები, შეცდომები, `stems` ძიება, ლეიბლები, auth, ქსელი), გარდა LAYOUT-LIB (vi)-ისა: **C-R145-01 (Low)** — preview-ის დროს `▶ Playing` 126 px option-ს 12 px-ით მეტად სცდება, ვიდრე baseline-ში, და ეკრანზე `▶ Play`-ად იკითხება. ეს ABL-B-1-ის გაუარესებაა. Gate 145 — skipped; round-145-ის ცვლილებები ხეში რჩება და round 146-თან ერთად გამოქვეყნდება.
- **R1 — §7-ის ხარვეზი:** „C FAIL მხოლოდ რაუნდის მიერ გამოწვეულ Low-ზე“ → შეზღუდული გასწორება იმავე owner-ით, არა waiver. მიზეზი: კრიტერიუმი რაუნდის საკუთარი იყო, რაუნდმა ხარვეზი გააუარესა, C PASS-ის გარეშე არაფერი ქვეყნდება და გასწორება იაფია. ეს row ემატება მომდევნო §7 ცხრილებს.
- **R2 — გასწორების არჩევანი:** მარკერი meta row-იდან გამოდის და option-ის ბოლო შვილად ცალკე ხაზზე ჩნდება (`whitespace-nowrap text-xs text-brand`, მხოლოდ preview-ის დროს). `flex-wrap` უარყოფილია B-ის რეალური Chromium-ის ცდით (`tmp/studio-real-loop/b-round-145/out/flexprobe.json`): wrap-ის დროს `Error: …` span ცალკე ხაზზე გადადის (x 47 → 8, y 0 → 16), ანუ `error` მდგომარეობა შეიცვლებოდა. `previewing`-ში option-ის სიმაღლე (63.5 px) უცვლელი უნდა დარჩეს; C-ს წინასწარ მიეცა ზუსტი ყუთები.
- **R3 — m91:** round-145-ის §3.5-ის მოლოდინი B-ის შეცდომა იყო — `failed-source-refusal`/`status-announcement-ui`-ის fixture-ები ხელით დაწერილ `LOADER_ERROR`-ს აგდებს. ისინი ხელნაწერად რჩება (GATE132-S4). დავალება არ იქმნება.
- **R4 — ზომა:** სამი მჭიდროდ დაკავშირებული ერთეული: C-R145-01 (+ABL-B-1), A-R145-REVIEW-DM-VALUES (DM1–DM4 ზუსტი unit pin), A-R145-REVIEW-GUARD-TEXTS (PC2 ზუსტი შეტყობინებები).
- **R5 — baseline:** HEAD `9a67abd` + round-145-ის დაუკომიტებელი 15 ` M` + 2 `??` (`a-round-145/end-sha256.txt`); გაყინულია 960, grant — 5. round-145-ის ცვლილებები არ ბრუნდება.
- **R6 — Ableton:** Live 12 „Working with the Browser“-ის შენახულ წყაროში row-ის ტექსტური მარკერი დადასტურებული არ არის; CZABA-ს მარკერი საკუთარი ქცევაა, parity-ის მტკიცება არ კეთდება.
- **R7 — შედეგი წინასწარ (round 147):** 2026-10-27-დან — ჯერ რეგრესია; C FAIL Medium+ ან რაუნდის მიერ გამოწვეული Low → შეზღუდული გასწორება; C PASS → rounds 145+146 ერთად ქვეყნდება, V-0.5a — `c_pass`, C-R145-01/ABL-B-1/C-R142-02 იხურება, round 147 = V-0.5b.

'''
anchor = '**D-29z110 — Round 144-ის შედეგი;'
assert t.count(anchor) == 1
t = t.replace(anchor, block + anchor)
own = '**D-29z110:** round 145-ში A-ს ეკუთვნის'
assert t.count(own) == 1
line = ('**D-29z111:** round 146-ში A-ს ეკუთვნის 5 არსებული ფაილი (`tmp/studio-real-loop/b-round-145-r146-grants.txt`): `ArrangementLibrary.tsx` (მხოლოდ PM1 — preview-ის მარკერი ცალკე ხაზზე), '
    '`library-row-strings-ui.test.tsx` (LRS3), `studio-lab-demo.test.ts` (DL-VAL + 4 სათაური), `collection.test.ts` (PC2) და doc 119. დანარჩენი გაყინულია (`b-round-145-r146-tree-sha256.txt`, 960), round-145-ის ცვლილებების ჩათვლით.\n')
t = t.replace(own, line + own)
open(P, 'w', encoding='utf-8').write(t)
print('ok')
