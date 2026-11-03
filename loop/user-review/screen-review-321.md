# ეკრანისა და გზის მიმოხილვა — RETRO 321 (Saba-სთვის)

**თარიღი:** 2026-11-03 · **ავტორი:** B (RETRO 321, D-29z885) · **master:** `53c5c79`
**წესი:** აქ ყველაფერი **კანდიდატი ან კითხვაა**. loop არაფერს ახორციელებს შენს პასუხამდე. პოზიციის ან ქცევის ცვლილება ყოველთვის შენი გადაწყვეტილებაა.

**კონსულტაციები** (read-only, სამივე რეალურად გამოძახებულია): `product-designer` (PD), `design-philosopher` (DP), `first-visit-host` (FVH). კონსულტაციების შემდეგ store-ის tree შემოწმდა: `sha256sum -c` rc 0, `git status` ცარიელი.

## როგორ გადავიღე
- **სკრიპტი:** `b-round-320/screens/capture.mjs`. ეს RETRO 305-ის ასლია ერთი ცვლილებით: ხილული ტექსტი JSON-ში 2,000 სიმბოლომდე ინახება და აღარ იჭრება 120-ზე (C-R305-01 → L54).
- **გარემო:** რეალური Chromium, `/studio-lab` dev server-ზე (:5173). product page-ისთვის გავუშვი mock backend (`mock-api/server.mjs`, :5199; `b-round-320/mock.log`).
- **ეკრანები** (1440×900 და 1280×720): ცარიელი პროექტი (`screen321-full-S0-*`) და demo პროექტი (`screen321-full-DEMO-*`).
- **გზა:** `/products/middle-east` (`journey321-1-product-*`) → „Try it in the Studio“ → `/studio-lab?preview=middle-east` (`journey321-1b-studio-arrival-*`) → Night Pulse-ის 4 stem + Play (`journey321-2-studio-playing-*`) → Export (`journey321-3-export-*`). ფაქტები `screen321.json`-სა და `capture.log`-შია.
- **მუდმივი ტექსტის ხაზები timeline-ის გარეთ** (`capture.log`): 1440 S0 97, DEMO 124; 1280 S0 86, DEMO 101. **RETRO 305-ის ზუსტად იგივე.** ელემენტების რაოდენობაც იგივეა: 138 / 168 / 118 / 144.
- **ხილული ცვლილება 305-ის შემდეგ არ არის** (PD ეკრანებს წყვილებად შეადარა). ფანჯარა 305–320 მხოლოდ performance-ს ეხებოდა. product page-ზე 1 px-იანი წანაცვლება font-ის rendering-ია და არა ცვლილება.
- **გადაღების შეზღუდვა (FVH, PD):** გზაზე ისევ Night Pulse-ის stem-ებს ვამატებ და არა Middle East-ს. ამიტომ „მოვუსმინო ტრეკს, რისთვისაც მოვედი, და ექსპორტი გავაკეთო“ ჯერ არცერთ screenshot-ზე არ ჩანს.

## ყველაზე სუსტი ნაბიჯი (PD, FVH)
ისევ **SR-305-3**: „Try it in the Studio“ ცარიელ timeline-ზე ჩერდება. Middle East მონიშნულია, მაგრამ დიდი Play არაფერს აკეთებს, სანამ მყიდველი „+ Add“-ს ან Enter-ს არ იპოვის. ეს კითხვა ჯერ კიდევ შენ გელოდება.

## ახალი კანდიდატები

| ID | რას ვხედავთ (screenshot) | შეთავაზება / უარყოფილი ვარიანტი | სახე | პრიორიტეტი |
|---|---|---|---|---|
| SR-321-1 | export ვერ ამბობს, რა ფაილს მიიღებ. ფაილის სახელი ყოველთვის `czaba-studio-lab.wav` / `.mp3`-ია (selection-ზე `-range`), mix-ის შინაარსის მიუხედავად (PD, კოდის წაკითხვით; `journey321-3-export-*`) | PD: სახელი შინაარსიდან, მაგ. `Middle East - CZABA mix.wav`. ის dialog-ის ერთადერთ subtitle-ად ჩანს და ცვლის range-ის განმეორებას, რომელსაც SR-290-2 უკვე აშორებს, ამიტომ ახალი ხილული ელემენტი არ ემატება | copy / მცირე ქცევა | low |
| SR-321-2 | **კითხვა.** „Try it“-ის შემდეგ ერთადერთი ხილული გასასვლელი „← CZABA“-ა და ის `/`-ზე მიდის. „View in store“ მხოლოდ კონტექსტურ მენიუსა და `?` sheet-შია (PD; `journey321-2-*`, `journey321-1b-*`) | PD-ის default: თუ Studio `?preview=`-ით გაიხსნა, „← CZABA“ იმავე product page-ზე დააბრუნებს. label და პოზიცია იგივე რჩება. უარყოფილია: ხილული „View in store“ ღილაკი, რადგან ელემენტს ამატებს. ეს შენი STUDIO-LINK-ის (2026-10-31) ელემენტის ქცევას ცვლის, ამიტომ კითხვაა | ქცევა (კითხვა) | medium |
| SR-321-3 | **კითხვა (copy).** product page-ის Provenance ბლოკი ამბობს „What you hear in the preview is exactly what you get — no compromises, no fillers.“ (კოდში ჩაწერილი). Studio-ში პირველივე ხაზია „Synthetic demo stems — not CZABA catalogue audio.“ Premium-ში 6 ფაილია, preview-ში კი არა (PD; `journey321-1-product-*` → `journey321-1b-*`) | PD: ერთი ზუსტი წინადადება, მაგ. „The preview is the full mix; Premium adds the stems.“ ის STORE-4-ს შეუერთდება და SR-305-2-თან ერთად უნდა წაიკითხო (ნდობის ერთი და იგივე საკითხია). preview-ს ხარისხზე არაფერს ვამტკიცებ | store copy (კითხვა) | low |
| SR-321-4 | აქტიური lane სამნაირად ჩანს: amber ზოლი, გამოკვეთილი სახელი და სიტყვა „· active“. ბიბლიოთეკის footer ამას ისევ იმეორებს: „Active track: … · insert marker …“ (DP; `screen321-full-DEMO-1440x900.png`, `screen321-full-S0-1440x900.png`) | DP: ზოლი და გამოკვეთა რჩება; სიტყვა „active“ accessible name-სა და tooltip-ში გადადის; footer-ის ხაზი ერთადერთ ტექსტურ ჩანაწერად რჩება, რადგან insert marker-საც შეიცავს. უარყოფილია ზოლის მოხსნა | copy / a11y | low |
| SR-321-5 | **კითხვა (პოზიცია).** აუდიო-პროექტში video-ს ადგილი რჩება: Video lane პირველია hint-ით „No video — use 'Your own video' or drop a file here“ და „Original sound“-ით, ხოლო „+ Your own video“ hint-ის სიტყვებს იმეორებს (DP; `screen321-full-DEMO-1440x900.png`). ცარიელი monitor უკვე SR-290-7-შია | DP: hint მხოლოდ პირველ clip-მდე ჩანს (empty-state-only), შემდეგ მხოლოდ ღილაკი რჩება. monitor-ის ჩაკეცვა ან Video lane-ის გადაადგილება layout-ის ცვლილებაა და შენი გადაწყვეტილებაა | copy (hint) / პოზიცია (კითხვა) | low |
| SR-321-6 | export dialog არ ამბობს, რომელი track-ები შევა ფაილში. ამ გზაზე Music ცარიელია, ამიტომ WAV-ში მხოლოდ synthetic stem-ები იქნება და არა Middle East (FVH; `journey321-3-export-1440x900.png`) | FVH: ერთი ხაზი შინაარსზე, მაგ. „Stems only — Music is empty“. SR-321-1-ის subtitle-თან ერთად უნდა გადაწყდეს, რომ ერთი ხაზი დარჩეს და არა ორი. ჰიპოთეზაა (FVH) | copy | low |

## უკვე რიგში ან ადრე ჩაწერილი (ახალი არ არის)
- „1 audio files“ product card-ზე → STORE-4 (PD-REVIEW F3). FVH-მ მიზეზი კოდში იპოვა (`VersionSelector.tsx`); ეს გამოსწორებისას გამოდგება.
- „Try it in the Studio“ სუსტად ჩანს → STORE-4 F1 (copy) და STORE-2b (ვიზუალური წონა).
- „Undo: Ad…“ იჭრება → SR-245-7 → COPY-PD.
- export-ის subtitle range-ს იმეორებს და disabled „Video (with audio)“-ს გრძელი მიზეზი აქვს → SR-290-1 / SR-290-2.
- Done/Cancel, primary ღილაკი და „LAME (mediabunny)…“ → COPY-PD F11.
- ახლად დამატებული clip ეკრანს გარეთაა → SR-230-9.
- stem-ები ერთმანეთის მიყოლებით ჯდება და export 01:04-მდე გრძელდება → STEM-LANES (Q2).
- ცარიელი video monitor → SR-290-7. Follow ყველაზე ხმამაღალი control-ია → SR-260-3. overview-ს თითქმის თეთრი ზოლი → SR-290-5.
- 1280-ზე toolbar ორ რიგად იშლება → SABA-Q-9-TRANSPORT.
- From/To წამებშია → F12, `deferred_low_polish`.

## დაუდასტურებელი შენიშვნა (PD)
Clip details 1280-ზე დაკეცილია, 1440-ზე ღია. PD-მ კოდში მიზეზი ვერ იპოვა, ამიტომ კანდიდატად არ შეიტანა. თუ ეს სიმჭიდროვის შეგნებული წესია, დადასტურება სჭირდება.

## პირველი ექსპერიმენტი (FVH, შენთვის; არ ჩატარებულა)
ერთ ახალ მომხმარებელს მიეცით დავალება მითითებების გარეშე: „Middle East-ის გვერდიდან მოუსმინე მას Studio-ში და WAV-ად გაიტანე.“ ჩაიწერეთ:
- იპოვა თუ არა „Try it in the Studio“;
- რამდენჯერ დააჭირა Play-ს, სანამ „+ Add“-ს დააჭერდა;
- რას იკითხავს ხმამაღლა და შეიცავს თუ არა ფაილი Middle East-ს.

countermetric: რამდენ ხანში იწყებს პროექტს უკვე ნაცნობი მომხმარებელი. თუ უმრავლესობა link-ს იპოვის და ცარიელ timeline-ზე Play-ს გარეშე „+ Add“-ს დააჭერს, SR-305-3 და FVH-ის N2 მოიხსნება.
