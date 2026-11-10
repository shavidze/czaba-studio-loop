# Screen review 435 — მთელი ეკრანი და მყიდველის გზა (RETRO 435)

**ავტორი:** B, round 434 → 435 დაგეგმვა, 2026-11-10. **master:** `8233840`. **review:** `product-designer` (read-only; `b-round-434/consult-product-designer.md`).
**გადაღება:** `b-round-434/screens/capture.mjs` (retro 420-ის სკრიპტის ასლი; შეცვლილია მხოლოდ ფაილების სახელები). შედეგები: `screen435.json`, `capture.log` და 12 PNG. მოთხოვნები mock API-ზე (`mock-api/server.mjs`) გაეშვა, გადაღების შემდეგ ის გაჩერდა.
`design-philosopher` და `first-visit-host` B-ის consult სიაში არ არიან (2026-11-04 §6) და არ გამომიძახებია. ეს **კანდიდატებია**: არაფერი სრულდება Saba-ს პასუხამდე.

## ციფრები (`capture.log`)
| ეკრანი | მუდმივი ტექსტის ხაზი | timeline-ისა და library-ის გარეთ | 420 |
|---|---|---|---|
| 1440×900 ცარიელი | 138 | 97 | 138 / 97 |
| 1440×900 demo | 168 | 124 | 168 / 124 |
| 1280×720 ცარიელი | 118 | 86 | 118 / 86 |
| 1280×720 demo | 144 | 101 | 144 / 101 |

420-თან შედარებით ცვლილება არ არის. SABA-B-12-ს მუდმივი ტექსტი არ დაუმატებია.

## გზა (product page → Studio → stems → play → Export; `journey435-*`)
- „Try it in the Studio“ ხსნის `/studio-lab?preview=middle-east`-ს. Middle East მონიშნულია.
- ოთხი stem ისევ ერთი მეორის მიყოლებით ლაგდება ერთ „Stems“ ხაზზე: ხედში 3 clip-ია, `left` 512 / 1152 / 1792. სტატუსი მეოთხეზე (Melody) წერს „00:48.000 (nearest free spot)“. ეს F2-ია და STEM-LANES-ს ეკუთვნის (Saba-ს პასუხს ელოდება).
- **უკეთესია 420-თან შედარებით:** Clip details-ის From/To/Clip Gain ველებზე spin-ისრები აღარ ჩანს. Export-ის radio-ები brass ფერისაა.
- **ამ სურათებზე არ ჩანს, ამიტომ შემოწმებულად არ ითვლება:** progress bar, sheet-ის ძებნის ✕ და dialog-ის scrollbar. ესენი C-მ 432–434 რაუნდებში ცალკე შეამოწმა.

## კანდიდატები
| id | სიმძიმე (`product-designer`) | რა | B-ის გადაწყვეტილება |
|---|---|---|---|
| SR-435-1 | Medium (შეფასება, არა ბაგი) | STUDIO-VIS-6 „From, s“-ს ცვლის „From“-ით. ველებში რიცხვი რჩება („48“, „64“), გვერდით კი წერია „Start 00:48.000“; ერთეულის გარეშე რიცხვი ორაზროვანია | დამტკიცებულ ფორმულირებას არ ვცვლი. კითხვა Saba-ს: `questions-retro-435.md` Q4. Default = დამტკიცებული „From“ / „To“ |
| SR-435-2 | Low | ქვედა სტატუსის ხაზში მცირე ასოებით წერია „· source offset 00:00.000“. ეს ცალკე string-ია, არა `sourceOffsetLabel` | ახალი task არ არის. COPY-PD-VIS-ის (STUDIO-VIS-4) scope-ს ემატება: ორივე ზომაზე DOM-ში „source offset“ აღარ უნდა დარჩეს |

**STEM-LANES-ის კიდევ ერთი სიმპტომი** (ახალი id-ის გარეშე): Clip details აჩვენებს „Night Pulse · Melody“-ს 00:48-ზე, თუმცა ეს clip ეკრანს გარეთაა და playhead 00:01-ზე მოძრაობს. ემატება SR-420-2-ის S4-ის მიღების კრიტერიუმს.

**არ იცვლება:** მისვლის მდგომარეობა (Middle East მონიშნული და focus-ში, Music აქტიური, ცარიელ ხაზზე „Drag a sound here, or press Enter to add it“). ასევე სტატუსი „(nearest free spot)“, სანამ STEM-LANES არ შესრულდება.

**აღარ მეორდება** (უკვე ჩაწერილია და ეკრანზე ისევ იგივეა): SR-245-1/7/8, SR-275-3/4/6, SR-290-1/2/4, SR-305-6/7, SR-321-6, SR-353-3/4, SR-230-3/7, COPY-PD F11, STORE-4 და SR-420-1/2. ჩამონათვალი: `b-round-434/consult-product-designer.md`.
