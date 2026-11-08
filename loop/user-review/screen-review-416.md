# ეკრანისა და გზის მიმოხილვა — RETRO 416 (2026-11-08, master `344a59f`)

**ავტორი:** B (D-29z1445). **კონსულტაცია:** `product-designer` (read-only, რეალურად გამოძახებული). მისი აზრი ქვემოთ ასეა მონიშნული. `design-philosopher` და `first-visit-host` B-ის კონსულტაციების სიაში არ არიან (2026-11-04 §6), ამიტომ არ გამომიძახებია.

**სტატუსი:** მხოლოდ კანდიდატები და კითხვები. პოზიციის ცვლა Saba-ს გადაწყვეტილებაა. ამ ფაილიდან არაფერი სრულდება მის პასუხამდე.

## მტკიცებულება
- **სკრიპტები:** `b-round-415/screens/capture.mjs` და `warmup.mjs`. ეს retro 401-ის ასლებია; შეცვლილია მხოლოდ ფაილის სახელის პრეფიქსი (`screen416`, `journey416`).
- **Mock API:** `mock-api/server.mjs` (127.0.0.1:5199) product page-ისთვის. pid: `b-round-415/screens/mock.pid`.
- **სურათები `b-round-415/screens/`-ში:**
  - სრული ეკრანი: `screen416-full-{S0,DEMO}-{1440x900,1280x720}.png`;
  - გზა: `journey416-1-product-*`, `journey416-1b-studio-arrival-*`, `journey416-2-studio-playing-*`, `journey416-3-export-*`, ორივე viewport-ზე.
- **ციფრები:** `screen416.json`, `capture.log`. შედარება: `compare-401-416.txt` (`compare.py`). დამატებითი probe: `melody-probe.mjs` → `melody-probe.json` და `melody-probe-*.png`.

## 1. ფაქტები (გაზომილი)
| ეკრანი | ხილული ტექსტის row-ები 401 → 416 | timeline-ისა და library-ს გარეთ 401 → 416 |
|---|---|---|
| 1440×900 ცარიელი (S0) | 138 → 138 | 97 → 97 |
| 1440×900 demo | 168 → 168 | 124 → 124 |
| 1280×720 ცარიელი (S0) | 118 → 118 | 86 → 86 |
| 1280×720 demo | 144 → 144 | 101 → 101 |

- **ტექსტი:** ოთხივე ეკრანზე სია სიტყვასიტყვით ემთხვევა retro 401-ს (`identical-list True`). ფანჯარაში (401–415) მუდმივად ხილული ტექსტი არ დამატებულა.
- **გზის მარშრუტი:** product page → „Try it in the Studio“ → `/studio-lab?preview=middle-east`. სტატუსის ხაზი ორივე viewport-ზე retro 401-ის იდენტურია: „“Night Pulse · Melody” added to the Stems track at 00:48.000 (nearest free spot).“
- **ერთადერთი სხვაობა (ახსნილი):** `journey.clips` ახლა DOM-ში 3 clip-ს აჩვენებს (left 512/1152/1792), retro 401-ში იყო 4 (…/2432). მიზეზია round 402-ის lane clip virtualization (PERF-14b-ii, doc 256 „Window-ის წესი“): lane მხოლოდ ხილული window-ის ახლოს მყოფ clip-ებს ამაუნტებს. `melody-probe.json` ამას ადასტურებს ორივე viewport-ზე: scroll 0-ზე DOM-ში Pulse/Bass/Pad-ია; timeline-ის ბოლოში scroll-ის შემდეგ Pad და Melody; უკან scroll-ის შემდეგ ისევ Pulse/Bass/Pad. ეს დაგეგმილი ქცევაა და ბაგი არ არის. სტატუსის ხაზი და export-ის დიაპაზონი (00:00.000 — 01:04.000) აჩვენებს, რომ model-ში 4 clip-ია.
- **`positionAfterPlay`:** wallclock-ით იკითხება (00:01.462 ორივე viewport-ზე), როგორც retro 401-ში.

## 2. ახალი კანდიდატები
**Studio-ში ახალი clutter არ არის.** `product-designer`-ის აზრით, ყველაფერი, რაც ჩანს, უკვე ჩაწერილია: SR-245-7 („Undo: Ad…“), SR-275-6 (სამხაზიანი collection label), SR-245-1 (სტატუსის ხაზი), SR-305-7 (ცარიელი BPM და „1s“ მოსვლისას), SR-290-2 / SR-353-4 (export-ის subtitle), SR-290-1 („Time selection“ 1280-ზე), COPY-PD F11 („LAME (mediabunny)“, „Done“), STORE-4 („1 audio files“).

**SR-416-1 (კითხვა, არა ბაგი).** Round 411-მა library preview-ს დაამატა დაბნელებული waveform, სანამ MP3 ჩაიტვირთება, title-ით „Preview — wait for the sound to load“. ეს მდგომარეობა არცერთ capture-ზე არ ჩანს: warm-up-მა ხმა წინასწარ ჩატვირთა (`product-designer`, inference). მისი შენიშვნა: title მხოლოდ hover-ზე ჩანს, ამიტომ keyboard-ისა და screen reader-ის მომხმარებელმა შეიძლება ვერ გაიგოს მიზეზი. ეს **დაუდასტურებელია**. Round 411-ის C row 3-მა `aria-disabled="true"` და `tabIndex -1` გაზომა, მაგრამ ხმოვანი ახსნა არ შეუმოწმებია. კითხვები Saba-სთვის:
  1. შემდეგ RETRO-ზე გადავიღოთ თუ არა ერთი capture ნელ ქსელზე, რომ ეს მდგომარეობა და მისი tooltip შეფასდეს?
  2. სჭირდება თუ არა ამ მიზეზს ხმოვანი ან keyboard-ით მისაწვდომი ახსნა? ეს accessibility-ის შემოწმების თემაა და გადაწყვეტილება არ არის.

## 3. გზა: სად ირღვევა „Personal Mixdown“ (inference, `product-designer`)
1. **product page:** „Try it in the Studio →“ მუშაობს: Middle East მონიშნული და focused-ია. რას ამბობს ბმული, ისევ ღიაა (Q-SR-385-1, STORE-4).
2. **მოსვლა:** timeline ცარიელია და დასასრული 00:00.000-ს აჩვენებს. ამას ფარავს SR-305-3 და SR-290-10.
3. **stem-ები:** ოთხივე ერთ Stems ხაზზე, ერთმანეთის მიყოლებით დგას; დასასრული 01:04.000-ია (4 × 16 s); Music ხაზი ცარიელია. **მთავარი ხარვეზი ისევ STEM-LANES-ია** (Saba-ს Q2, 2026-10-31).
4. **export:** დიალოგი „Entire project 00:00.000 — 01:04.000“-ს გვთავაზობს. მყიდველი 64 წამს მიიღებს, სადაც stem-ები ერთმანეთის მიყოლებით ჟღერს, და არა mix-ს. ეს იგივე ხარვეზის შედეგია და არა ცალკე საკითხი; STEM-LANES-მა ესეც უნდა გამოასწოროს. რა შედის ფაილში, დიალოგი ისევ არ ამბობს (SR-321-1, SR-321-6 → COPY-PD).

ახალი ხარვეზი გზაში არ არის.

## 4. კითხვები Saba-სთვის (მხოლოდ კითხვები)
- **Q-SR-385-1** ისევ ღიაა.
- **SR-416-1** (ზემოთ, §2).

## 5. რა არ უნდა შეიცვალოს
- სტატუსის წინადადება „…added to the Stems track at 00:48.000 (nearest free spot)“ (`journey416-2-studio-playing-1440x900.png`). STEM-LANES-მდე მხოლოდ ის ხსნის, რატომ ჟღერს stem-ები ერთმანეთის მიყოლებით (`product-designer`).
