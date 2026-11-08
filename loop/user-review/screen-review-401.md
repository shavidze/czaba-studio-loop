# ეკრანისა და გზის მიმოხილვა — RETRO 401 (2026-11-08, master `c17d0e9`)

**ავტორი:** B (D-29z1372). **კონსულტაცია:** `product-designer` (read-only, რეალურად გამოძახებული). ქვემოთ მისი აზრი ასეა მონიშნული. `design-philosopher` და `first-visit-host` 2026-11-04-ის §6-ის შემდეგ B-ის კონსულტაციების სიაში არ არიან. ამიტომ არ გამომიძახებია (ROOT-REQ-B-RETRO-CONSULTS).

**სტატუსი:** მხოლოდ კანდიდატები და კითხვები. პოზიციის ცვლა Saba-ს გადაწყვეტილებაა; აქედან მის პასუხამდე არაფერი ხორციელდება.

## მტკიცებულება
- **სკრიპტები:** `b-round-400/screens/capture.mjs` და `warmup.mjs`. ეს retro 385-ის ასლებია, შეცვლილია მხოლოდ ფაილის სახელის პრეფიქსი `screen401`/`journey401`.
- **Mock API:** `mock-api/server.mjs` (127.0.0.1:5199) product page-ისთვის. pid ინახება `b-round-400/screens/mock.pid`-ში.
- **სურათები `b-round-400/screens/`-ში:**
  - სრული ეკრანი: `screen401-full-{S0,DEMO}-{1440x900,1280x720}.png`;
  - გზა: `journey401-1-product-*`, `journey401-1b-studio-arrival-*`, `journey401-2-studio-playing-*`, `journey401-3-export-*`, ორივე viewport-ზე.
- **ციფრები:** `screen401.json` და `capture.log`. შედარება: `compare-385-401.txt`.

## 1. ფაქტები (გაზომილი)
| ეკრანი | ხილული ტექსტის row-ები 385 → 401 | timeline-ისა და library-ს გარეთ (401) |
|---|---|---|
| 1440×900 ცარიელი (S0) | 138 → 138 | 97 |
| 1440×900 demo | 168 → 168 | 124 |
| 1280×720 ცარიელი (S0) | 118 → 118 | 86 |
| 1280×720 demo | 144 → 144 | 101 |

- **ტექსტი:** ოთხივე ეკრანზე სიტყვასიტყვით ემთხვევა retro 385-ს. სხვაობა არც ერთი მიმართულებით არ არის (`compare-385-401.txt`). რაუნდები 385–400 performance-ისა და harness-ის რაუნდები იყო.
- **გზის timing:** განსხვავება მხოლოდ `positionAfterPlay`-შია, რომელიც wallclock-ით იკითხება დაახლოებით 1.5 s-ის შემდეგ: 1440-ზე 00:01.462 → 00:01.471, 1280-ზე 00:01.471 → 00:01.451.
- **გზის მარშრუტი:** product page → „Try it in the Studio“ → `/studio-lab?preview=middle-east`. Middle East მონიშნული და focused-ია.
- **stem-ები:** ოთხივე („Night Pulse · Pulse/Bass/Pad/Melody“) ერთ Stems ხაზზე, ერთმანეთის მიყოლებით დგას: left 512/1152/1792/2432 px.

## 2. ახალი კანდიდატები
**Studio-ში არცერთი** (SR-401-* id არ იქმნება). `product-designer`-ის აზრით, ყველაფერი, რაც ჩანს, უკვე ჩაწერილია:
- „Undo: Ad…“ — SR-245-7;
- სამხაზიანი collection label — SR-275-6;
- სტატუსის ხაზი — SR-245-1;
- BPM / Snap / „1s“ მოსვლისას — SR-305-7;
- export-ის subtitle — SR-290-2;
- 1280-ზე „Time selection“ — SR-290-1.

**Store, „1 audio files“** (`journey401-1-product-1440x900.png`). `product-designer` ამას ახალ საკითხად თვლის. B-მ შეამოწმა: ეს უკვე Saba-ს 2026-10-31-ის გადაწყვეტილებაა (PD-REVIEW F3). იქ STORE-4-ის acceptance-ში წერია: „"1 audio files" becomes "1 file"“. ამიტომ ახალი კითხვა არ იქმნება. ფაქტი, რომ ტექსტი mock fixture-იდან ჩანს, STORE-4-ის row-ში შემოწმდება.

## 3. გზა: სად ირღვევა „Personal Mixdown“ (inference, `product-designer`)
1. **მოსვლა:** Middle East მონიშნულია, მაგრამ timeline ცარიელია. ამას ფარავს SR-305-3 და SR-290-10.
2. **stem-ები:** ერთმანეთის მიყოლებით უკრავს და ერთად არა. Music ხაზი ცარიელი რჩება. ამას ფარავს **STEM-LANES**, ხოლო Middle East-ის საკუთარ stem-ებს — SRW-21/F1.
3. **export:** დიალოგი არ ამბობს, რა შედის ფაილში. ამას ფარავს SR-321-6 და SR-321-1, რომლებიც COPY-PD-ში მიდის.
4. **product page:** „Try it in the Studio →“ არ ამბობს, რისი გაკეთება შეიძლება იქ. ამას ფარავს STORE-4 და Q-SR-385-1.

ახალი ხარვეზი გზაში არ არის. ის, რომ რეალური export-ი და ფაილის შემოწმება გზაში არ ხდება, უკვე `STEM-LANES.scope_additions`-შია.

## 4. კითხვები Saba-სთვის (მხოლოდ კითხვები)
- **Q-SR-385-1** ისევ ღიაა: სად იდგეს „Try it in the Studio →“. `product-designer`-ის რეკომენდაცია უცვლელია: დარჩეს ადგილზე, სანამ STEM-LANES და SRW-21 არ დასრულდება.
- ახალი კითხვა არ არის.

## 5. რა არ უნდა შეიცვალოს
- სტატუსის წინადადება „…added to the Stems track at 00:48.000 (nearest free spot)“ (`journey401-2-studio-playing-1440x900.png`). დღეს მხოლოდ ის აჩვენებს, რომ stem-ები ერთმანეთის მიყოლებით დგას.
