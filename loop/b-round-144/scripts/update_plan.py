import sys
P = sys.argv[1]
t = open(P, encoding='utf-8').read()
a1 = '**D-29z109 — Round 143-ის შედეგი;'
a2 = '**D-29z109:** round 144-ში A-ს ეკუთვნის'
assert t.count(a1) == 1 and t.count(a2) == 1
block = """**D-29z110 — Round 144-ის შედეგი; V-0.4e — მზადაა, V-0.4 სრულია; Round 145: V-0.5a (ჩატვირთვის შეცდომები, ბიბლიოთეკის რიგის სტატუსი, დემო ლეიბლები, ძიების keywords).**

C round 144 (`tmp/studio-real-loop/c-round-144.md`, `c-round-144.json`) — **PASS**, `browserVerified`/`realVerified` — true, ახალი ბაგი არ არის; C-R143-01 დაიხურა. Gate 144-მა rounds 142+143+144 გამოაქვეყნა `9a67abd`-ად ორივე remote-ზე. V-0.5 ხელახლა გაიზომა `9a67abd`-ზე: 82 ქართული ხაზი 7 ფაილში.
- **R1 — დაყოფა დამოკიდებულებით:** ბიბლიოთეკის რიგი ბეჭდავს `შეცდომა: ${error}`-ს, error კი `collection.ts`-იდან, `studio-lab-demo.ts`-იდან და Context-ის fallback-იდან მოდის. ამიტომ V-0.5a ყველა ჩატვირთვის შეცდომას რიგის სტატუსთან (ArrangementLibrary l.118–126) ერთად ცვლის — ერთ რიგში ორი ენა არ შეხვდება (GATE128-S1). V-0.5b — ბიბლიოთეკის დანარჩენი, preview და კოლექციის სტატუსები; V-0.5c — video dock, route title, `lang="en"`, RV-4, RV-1.
- **R2 — LIB-SEARCH-KEYWORDS:** `LIBRARY_KIND_SEARCH_KEYWORDS` (`music`; `stem`, `stems`; `sfx`) ძიებას ჩვენებისგან აშორებს; ლეიბლები უცვლელია. ქართული სინონიმები არ ემატება (არავის უთხოვია; V-0 ინგლისურია) — სიგნალი LIB-SEARCH-GEORGIAN-SYNONYMS. C-R142-02 ამ რაუნდში სწორდება (`library.ts` რაუნდს ეკუთვნის).
- **R2b:** `sfx`-ით Music preview-ების პოვნა კოლექციის ლეიბლით განზრახულია (LIB-03).
- **R3 — დემო ხმების სათაურები რჩება** (D-29z92): l.13, 35–38, 44, 51, 72, 73. ლეიბლები, შენიშვნა და შეცდომები ინგლისურდება.
- **R4 — მდებარეობა:** `studioSourceLoadStrings` (13 key) `strings.ts`-ში; დემო ლეიბლები და შენიშვნა — ინგლისური literal-ები data ფაილში.
- **R5 — layout:** RV-1 V-0-ის ტექსტის სიგანის გამონაკლისი მხოლოდ ბიბლიოთეკის სვეტში, text-flow წესით; baseline — B-ის `b-round-144/out/libbase-{1440,1280}.json` (რეალური Chromium, `9a67abd`).
- **R6 — Ableton:** Live 12 manual „Working with the Browser“ §4.2 (AND ძიება, „All“ label) და §4.5 (Collections, unfold) — დადასტურებული ტერმინები, B-მ 2026-10-24-ს ჩამოტვირთა; რიგის ტექსტები — CZABA-only, დაუდასტურებელი.
- **R7 — gate-144 review:** #1 (doc 118 status) → round 145; #4 → R2; #2, #3, #5 → `deferred_low_polish` (GATE144-S2/S3/S5, DetailPanel ამ ეტაპს არ ეკუთვნის); #6 და Architecture note — info/keep.
- **R8 — შედეგი წინასწარ (round 146):** 2026-10-27-დან — ჯერ რეგრესია; C FAIL Medium+ — გასწორება; FAIL მხოლოდ ლიტერალურ კრიტერიუმზე — წერილობითი დასკვნა და ხელახალი შემოწმება; C PASS — V-0.5b.

"""
t = t.replace(a1, block + a1)
own = "**D-29z110:** round 145-ში A-ს ეკუთვნის 15 არსებული ფაილი და 2 ახალი (`tmp/studio-real-loop/b-round-144-r145-grants.txt`): `strings.ts` (ახალი `studioSourceLoadStrings`), `library.ts` (KW1), `collection.ts` (CO1, სტატუსები l.16–30 უცვლელი), `studio-lab-demo.ts` (DM1–DM5), `ArrangementContext.tsx` (მხოლოდ l.3468 + import), `ArrangementLibrary.tsx` (მხოლოდ l.118–126 + import), `strings.test.ts`, `library.test.ts`, 6 pin ფაილი, doc 118 (status), ახალი `library-row-strings-ui.test.tsx` და doc 119. დანარჩენი გაყინულია (`b-round-144-r145-tree-sha256.txt`, 948).\n"
t = t.replace(a2, own + a2)
open(P, 'w', encoding='utf-8').write(t)
print('ok')
