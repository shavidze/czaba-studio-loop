# ეკრანისა და გზის მიმოხილვა — RETRO 385 (2026-11-07, master `7295618`)

**ავტორი:** B (D-29z1288). **კონსულტაცია:** `product-designer` (read-only, რეალურად გამოძახებული; ქვემოთ მისი აზრი ასეა მონიშნული). `design-philosopher` და `first-visit-host` 2026-11-04-ის §6-ის შემდეგ B-ის კონსულტაციების სიაში არ არიან, ამიტომ არ გამომიძახებია (ROOT-REQ-B-RETRO-CONSULTS, retro-369 §12.3).

**სტატუსი:** მხოლოდ კანდიდატები. პოზიციის ცვლა Saba-ს გადაწყვეტილებაა; აქედან არაფერი ხორციელდება მის პასუხამდე.

## მტკიცებულება
- სკრიპტი: `b-round-384/screens/capture.mjs` (retro 369-ის ასლი, მხოლოდ ფაილის სახელები შეიცვალა), warm-up `warmup.mjs`, mock API `mock-api/server.mjs` (127.0.0.1:5199) product page-ისთვის.
- სურათები `b-round-384/screens/`: `screen385-full-{S0,DEMO}-{1440x900,1280x720}.png`; გზა: `journey385-1-product-*`, `journey385-1b-studio-arrival-*`, `journey385-2-studio-playing-*`, `journey385-3-export-*` (ორივე viewport).
- ციფრები: `screen385.json`, `capture.log`; შედარება `compare-369-385.txt`.

## 1. ფაქტები (გაზომილი)
| ეკრანი | ხილული ტექსტის row-ები 369 → 385 | timeline-ისა და library-ს გარეთ (385) |
|---|---|---|
| 1440×900 ცარიელი (S0) | 138 → 138 | 97 |
| 1440×900 demo | 168 → 168 | 124 |
| 1280×720 ცარიელი (S0) | 118 → 118 | 86 |
| 1280×720 demo | 144 → 144 | 101 |

- ოთხივე ეკრანზე ტექსტი სიტყვასიტყვით ემთხვევა retro 369-ს: ორივე მიმართულებით 0 განსხვავება (`compare-369-385.txt`).
- გზაში განსხვავება მხოლოდ timing-შია: `positionAfterPlay` 1440-ზე 00:01.483 → 00:01.462 (ხმაური).
- product page → „Try it in the Studio“ → `/studio-lab?preview=middle-east`, Middle East მონიშნული და focused. ოთხი stem („Night Pulse · Pulse/Bass/Pad/Melody“) ერთ Stems ხაზზე ერთმანეთის მიყოლებით დგება: left 512/1152/1792/2432 px. Export: „Entire project · 00:00.000 — 01:04.000“.

## 2. ახალი კანდიდატები
**არცერთი** (SR-385-* id არ იქმნება). `product-designer`-ის აზრი: ჯგუფის სახელი ორჯერ ჩანს (კატეგორიაში და სიის სათაურად), მაგრამ „All“ ხედში ის ჯგუფებს ყოფს და საქმეს აკეთებს. დანარჩენი უკვე ჩაწერილია: SR-275-6, SR-336-2, SR-305-1, SR-353-2, SR-290-7, SR-305-2. 1280-ზე export-ის „Time selection“-ის მოჭრა = SR-290-1 (awaiting_user).

## 3. გზა: სად ირღვევა „Personal Mixdown“ (inference, `product-designer`)
1. **stem-ების დამატება:** stem-ები ერთმანეთის მიყოლებით უკრავს და ერთად არა, ამიტომ export-ი 64 s-იანი თანმიმდევრობაა და არა mix. ამას ფარავს **STEM-LANES (F2)**, რომელიც STUDIO-PERFORMANCE-ის შემდეგ, SYS-1…3-მდეა რიგში.
2. **Middle East-იდან მოსული ვიზიტორი stem-ებს მხოლოდ Night Pulse-ით ცდის.** ამას ფარავს F1/SRW-21 (`deferred_user`, დაცული ფაილები), SR-290-10, SR-305-3 და SR-305-8.
3. export-ის ტექსტი → COPY-PD (F11); product page-ის ტექსტი → STORE-4 (F3).
- **დაკვირვება სატესტო გზაზე (ახალი, ბაგი არ არის):** journey არასოდეს აკეთებს რეალურ export-ს და მის შემოწმებას. B ამას STEM-LANES-ის მიღების კრიტერიუმის კანდიდატად ინახავს: export → ფაილის წაკითხვა → stem-ები ერთდროულად (L55). backlog-ში ის ჩაიწერა `STEM-LANES.scope_additions`-ში (D-29z1288).

## 4. კითხვა Saba-სთვის (მხოლოდ კითხვა)
- **Q-SR-385-1:** გადავიდეს თუ არა „Try it in the Studio →“ product title-ის ქვემოდან ყიდვის სვეტში, version card-ების გვერდით, რომ „Standard / Premium / ჯერ სცადე“ ერთ ადგილას იყოს? `product-designer` გირჩევთ, ადგილზე დატოვოთ STEM-LANES-ისა და SRW-21-ის დასრულებამდე. STUDIO-LINK-ის მიმდინარე განლაგება Saba-ს უკვე მიღებული გადაწყვეტილებაა.

## 5. რა არ უნდა შეიცვალოს
- სტატუსის წინადადება, რომელიც ასახელებს, სად დაჯდა clip-ი („…at 00:48.000 (nearest free spot)“). დღეს მხოლოდ ის აჩვენებს, რომ stem-ები ერთმანეთის მიყოლებით დგება.
