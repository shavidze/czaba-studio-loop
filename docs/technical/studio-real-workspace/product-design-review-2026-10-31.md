# CZABA — პროდუქტის დიზაინის მიმოხილვა (Store + Studio)

**თარიღი:** 2026-10-31 · **ავტორი:** product-designer (read-only) · **build:** store master `000da42` (round 281), `http://127.0.0.1:3123` + mock API `:5199` (8 fixture)
**მეთოდი:** მყიდველის რეალური გზა Playwright Chromium-ით: 1440×900, 1280×720, Store-ისთვის 390×844 (isMobile). ყველა screenshot `/home/claude/work/shots/`-შია, სკრიპტები `/home/claude/work/scripts/`-ში. ყოველ მტკიცებას ახლავს screenshot ან `file:line` (store master `000da42`). Live-ის ან კონკურენტის ქცევა, რომელიც წყაროთი ვერ დავადასტურე, მონიშნულია „დაუდასტურებელი“.

---

## 1. ვერდიქტი

CZABA-ს ორი ნახევარი ერთმანეთისგან განსხვავებულ დონეზეა. Studio (`/studio-lab`) უკვე სერიოზული, Live-ის ერთგული ინსტრუმენტია: trim, fade, envelope, selection, undo და status line ზუსტად და სწრაფად პასუხობს, shortcut sheet კი ძლიერია. Store ჯერ კიდევ ძველ ვიზუალურ ენაზეა (teal, Playfair, hero-ში „CZABA“) და მყიდველს არ ეუბნება, რომ ყიდულობს stems-ს, რომლებსაც Studio-ში მოარგებს. **ყველაზე დიდი პრობლემა ის არის, რომ ორ ნახევარს შორის ხიდი არ არსებობს:** product page-ზე Studio-ს ბმული არ არის, nav-ის „Studio“ synthetic demo-ს ხსნის, ნაყიდი track კი `/studio/:handle`-ზე ძველ, legacy mixer-ში იხსნება (`studio.$productId.tsx` → `components/studio`). 281 რაუნდის ნამუშევარი Studio-ში მყიდველამდე დღეს არ აღწევს. ამას ემატება, რომ ერთი track-ის stems ერთდროულად ვერ ჟღერს: Studio-ს ოთხი ფიქსირებული ხაზი აქვს და მეორე stem პირველის შემდეგ ჯდება, არა მის პარალელურად. ეს „Personal Mixdown“-ის დაპირებას არღვევს. **ყველაზე დიდი ძალა** Studio-ს edit core-ია: Live-ის მოდელი (სათაურის ზოლით გადატანა, body-ზე time selection, კიდით trim, fade handle, Fit/X) ზუსტადაა გადმოტანილი, ყოველი მოქმედება status-ში იწერება ზუსტი ციფრებით, Undo კი მოქმედების სახელს ასახელებს.

---

## 2. შეფასების ბარათი

| სფერო | ქულა | მიზეზი (ერთი ხაზი) | Screenshot |
|---|---|---|---|
| Store: პირველი ვიზიტი | 4 | Hero ამბობს „CZABA“-ს და ზოგად slogan-ს, stems-სა და Studio-ზე არაფერს; ~8 წამში full-screen LeadMagnet ფარავს გვერდს | `store-home-1440x900.png`, `home-1440-s03.png` |
| Product page | 5 | Preview ერთი დაჭერით მუშაობს და player კარგია, მაგრამ stems დამალულია, „1 audio files“ წერია, Studio-ს ბმული არ არის | `store-product-middle-east-1440x900-full.png`, `product-me-playing-1440.png` |
| ყიდვის გზა (mock-მდე) | 5 | Buy Now უკონტექსტო Sign-in modal-ს ხსნის; LeadMagnet Add to Cart-ის მომენტში იჭრება | `product-me-buynow-1440.png`, `product-me-addtocart-1440.png` |
| Store → Studio გადასვლა | 2 | Product page-დან და home-დან Studio-ს ბმული არ არის; nav demo-ზე მიდის; ნაყიდი track legacy Studio-ში იხსნება; Studio-დან ყიდვაზე დაბრუნება არ შეიძლება | `store-product-middle-east-1440x900-full.png`, `studio-S0-1440.png` |
| Studio: პირველი გაშვება | 6 | First-run status და ხაზზე hint მკაფიოა, მაგრამ ქართული სახელები, ვიწრო ბიბლიოთეკა და ორი ერთნაირი ინსტრუქცია | `studio-S0-1440.png`, `studio-S0-1280.png` |
| Studio: edit core | 6 | Trim, fade, envelope, selection და undo ზუსტია, მაგრამ ერთი track-ის stems-ს ერთად ვერ დაუკრავ, ქვედა ზოლში კი 3 ხაზი ტექსტი გროვდება | `studio-E1-four-stems-1440.png`, `studio-B2-dragging-1440.png`, `studio-B4-fade-1440.png` |
| Export | 6 | ნათელი ფორმატი და range, disabled-ის მიზეზი ეწერება, მაგრამ ტექსტი ჟარგონულია (LAME, mediabunny, „graph“) და „Done“ გაურკვეველია | `studio-B0-export-empty-1440.png`, `studio-E2-export-content-1280.png` |
| Store ↔ Studio თანმიმდევრულობა | 3 | ერთ პროდუქტს სამი სახელი აქვს; Store-ში Playfair და teal, Studio-ში Instrument Sans და brass; English UI-ში ქართული content | `store-pages-contact.png`, `studio-S0-1440.png` |
| Mobile Store | 5 | Layout-ები მუშაობს, მაგრამ menu-ს „Studio“ გატეხილ desktop layout-ს ხსნის; Buy Now fold-ის ქვემოთაა და version-ის არჩევის წინ დგას | `m-menu-390.png`, `studio-mobile-390.png`, `m-product-full-390.png` |

---

## 3. მთავარი მიგნებები (რანჟირებული)

### F1 — High · მყიდველი ახალ Studio-მდე ვერ აღწევს და Studio-დან ყიდვაზე ვერ ბრუნდება
- **სად:** `/products/middle-east` (`store-product-middle-east-1440x900-full.png`): Studio-ს ბმული საერთოდ არ არის. ნაყიდი track `account.downloads.tsx:121`-დან `/studio/${handle}`-ზე მიდის. ეს route legacy `StudioProvider`-სა და `components/studio`-ს იყენებს (`studio.$productId.tsx:14-27`). ახალი workspace მხოლოდ `/studio-lab`-ზეა mount-ებული (`studio-lab.tsx:24-31`). Nav-ის „Studio“ (`Header.tsx:81`) synthetic demo-ს ხსნის. უკუგზაც არ არსებობს: Studio-დან გასვლა მხოლოდ „← CZABA“-ით, home-ზეა (`StudioWorkspace.tsx:2758`), ბიბლიოთეკის „Middle East — preview“-დან product page-ზე ვერ გადახვალ.
- **მომხმარებლის გამოცდილება:** მონტაჟორი ყიდულობს track-ს, რადგან Studio-ს დაპირება მოეწონა, და იღებს სხვა, ძველ ხელსაწყოს: სხვა shortcut-ებით (legacy-ში Enter = Stop, `studio.$productId.tsx:46-53`), clip-ების, fade-ების და envelope-ის გარეშე. ვინც demo Studio-ში track-ს მოარგო, მის საყიდლად გზას თვითონ უნდა ეძებდეს.
- **პრინციპი:** Norman, conceptual model (ერთი „Studio“, ორი სხვადასხვა ქცევა); Nielsen, consistency; Jakob (ის, რაც ისწავლე, აქ არ მუშაობს).
- **რეკომენდაცია:** (1) SRW-21 (`deferred_user`) Studio-ს პირველ პროდუქტულ პრიორიტეტად იქცეს PERF-ის შემდეგ. ეს auth-ის მფლობელის root-ნაბიჯია. (2) მანამდე product page-ზე იყოს ბმული „Try it in the Studio“, რომელიც `/studio-lab`-ს ამ პროდუქტის public preview-ით ხსნის. (3) Studio-ს ბიბლიოთეკაში public preview-ს tooltip-ში ან context menu-ში ჰქონდეს „View in store“.
- **დრო:** L (SRW-21), S (ორივე ბმული).
- **კუთვნილება:** SRW-21 (deferred) + STORE-4-ის „Make it yours — open in Studio“; უკუბმული ახალია.

### F2 — High · ერთი track-ის stems ერთდროულად ვერ ჟღერს
- **სად:** `/studio-lab`, `studio-E1-four-stems-1440.png`. Stems ხაზზე ოთხი stem-ის დამატებისას ისინი 00:00, 00:16, 00:32 და 00:48-ზე ჯდება („nearest free spot“, status-ის ლოგი სკრიპტში `scripts/studio-5.cjs`). Studio-ს ოთხი ფიქსირებული ხაზი აქვს (`studio-lab.tsx:17-22`). `shortcuts.ts`-ში track-ის დამატება არ არის, მხოლოდ Group (Ctrl+G).
- **მომხმარებლის გამოცდილება:** stems ერთი მიქსის ნაწილებია და ერთად უნდა ჟღერდეს. მონტაჟორი ელის, რომ „drums ჩაჩუმდება, strings დარჩება“. ამის ნაცვლად იღებს ოთხ ნაწილს ერთმანეთის მიყოლებით. ყველაზე მეტი 3 ხმა ჟღერს ერთად (Music + Stems + SFX), Premium-ის 6 stem კი ვერასდროს.
- **პრინციპი:** Norman, mapping (ერთი stem = ერთი ხაზი, Live-ის მოდელი); Rams, useful; Tesler (სინქრონი სისტემამ უნდა იტვირთოს, არა მომხმარებელმა).
- **Reference:** Live-ში ყოველ audio clip-ს თავისი track აქვს, ახალი track კი Arrangement-ის drop area-ში ჩაგდებით იქმნება ([Live 12 manual 6.1, item 12](https://www.ableton.com/en/live-manual/12/arrangement-view)). რამდენიმე ფაილის ერთდროულად ჩაგდებისას Live მათ ერთ track-ზე მიმდევრობით სვამს თუ ცალ-ცალკე track-ებზე: **დაუდასტურებელი** (manual-ში ვერ ვიპოვე). **Live measurement request:** ჩააგდე 4 wav ერთად Arrangement-ში, ჯერ modifier-ის გარეშე, მერე Ctrl-ით, და ჩაიწერე, სად დაჯდა თითოეული.
- **რეკომენდაცია:** stem-ის ან stem set-ის დამატებისას თითო stem-ს თავისი ხაზი ჰქონდეს. ყველა ხაზი ერთსა და იმავე insert marker-ზე იწყება და „Stems“ group-ში ჯდება (group უკვე არსებობს). ბიბლიოთეკის folder-ზე („Stems 4“) ერთი Enter ან drag მთელ set-ს ამატებს. Purchased adapter-მაც (`createPurchasedWorkspaceCollection`) იგივე წესი უნდა გამოიყენოს.
- **დრო:** M–L.
- **კუთვნილება:** ახალია; კითხვა Q2, ხაზების მოდელი Saba-ს გადასაწყვეტია.

### F3 — High · Product page არ ამბობს, რას ყიდულობ (stems და Studio)
- **სად:** `store-product-middle-east-1440x900.png` და `product-me-playing-1440.png`. Version-ის ბარათებზე წერია „1 audio files“ / „6 audio files“ (`VersionSelector.tsx:132`, თან გრამატიკულად არასწორად). „Individual stems included“ ჩანს მხოლოდ მაშინ, როცა Premium არჩეულია **და** „What's included“ გახსნილია. Studio პროდუქტის გვერდზე არსად იხსენიება. სამი ტერმინი ერთ ცნებაზე: „audio files“, „tracks included“, „stems“.
- **მომხმარებლის გამოცდილება:** მყიდველი $29-იან Standard-ს ყიდულობს, ელის stems-ს და ვერ იღებს. ან პირიქით, ვერ ხედავს, რატომ ღირს Premium $99.
- **პრინციპი:** Nielsen, match with the real world; §3g, ერთი ცნება — ერთი ტერმინი; Hick (არჩევანი იმის გარეშე, რაც მას განასხვავებს).
- **რეკომენდაცია:** version-ის ბარათზე პირველი ხაზი იყოს „Full mix · WAV“ / „Full mix + 5 stems · WAV · opens in Studio“ (ციფრები მხოლოდ data-დან). „1 audio files“ → „1 file“. „What's included“-ის ზედა სტრიქონი ბარათზე ჩანდეს და არა accordion-ში.
- **დრო:** S–M.
- **კუთვნილება:** STORE-4 (D5–D8 product page). დასამატებელია acceptance row: „stems-ის რაოდენობა და Studio ჩანს version-ის ბარათზე, accordion-ის გახსნის გარეშე“.

### F4 — Medium · LeadMagnet-ის full-screen ფენა ყიდვის მომენტში იჭრება
- **სად:** `home-1440-s03.png` (home, Studio-ს სექციის შუაში) და `product-me-addtocart-1440.png` (product page, Add to Cart-ის დაჭერის დროს). `LeadMagnetPopup.tsx:137`: `fixed inset-0 bg-background`, ანუ გაუმჭვირვალე ფენა მთელ ეკრანზე. Trigger: 8 წამის შემდეგ, თუ გვერდი 40 %-ზეა ჩამოსქროლილი (`useLeadMagnet.ts:24-25,150-160`). Product page მოკლეა (1193px), ამიტომ ~117px scroll საკმარისია. Popup ჩნდება Store-ის ყველა გვერდზე, `/studio*`-ის გარდა (`root.tsx:153-158`). დახურვის შემდეგ აღარ ჩნდება (`dismissed` localStorage-შია). კომენტარი ამბობს „Max 2 views per day“, მნიშვნელობა კი `10`-ია (`useLeadMagnet.ts:23`).
- **მომხმარებლის გამოცდილება:** ახალი ვიზიტორი, რომელიც უკვე ყიდვას იწყებს, უცებ შავ ეკრანს ხედავს „FREE DOWNLOAD“-ით.
- **პრინციპი:** Calm Technology (ყურადღების ბიუჯეტი); Nielsen, user control and freedom.
- **რეკომენდაცია (keep-list-ია, ამიტომ მხოლოდ კითხვა, Q3):** შინაარსი უცვლელი რჩება, მაგრამ popup არ ჩნდება `/products/*`, `/cart` და `/checkout*`-ზე. ტექნიკური ტექსტის გასწორება (comment ↔ 10) არის Low, ქცევას არ ცვლის.
- **დრო:** S.
- **კუთვნილება:** keep-list (Saba). ახალი კითხვა.

### F5 — Medium · Home არ ამბობს, რა არის CZABA, და Studio-ს teaser სხვა პროდუქტს აჩვენებს
- **სად:** `store-home-1440x900.png`: H1 „CZABA“ teal gradient-ით, sub „Create cinematic masterpieces…“, CTA „Discover the Collection“. `home-1440-s02.png`: „Personal Mixdown Studio“ macOS ფანჯრად, S/M/Vol და sine ტალღებით; ტექსტი „No DAW required“; CTA „Browse the Collection“. Studio-ში გადასვლის ღილაკი home-ზე საერთოდ არ არის.
- **მომხმარებლის გამოცდილება:** ვიზიტორი ვერ იგებს, რომ აქ stems იყიდება და იქვე მოერგება. ვინც Studio-ს გახსნის, ხვდება Ableton-ის მსგავს arrangement-ს და არა teaser-ის მიქსერს.
- **პრინციპი:** Nielsen, match / recognition; Aesthetic-usability (ლამაზი mock-up ნდობას ზრდის, მაგრამ ცრუ მოლოდინს ქმნის).
- **რეკომენდაცია:** STORE-3-ის დამტკიცებული hero („Music you finish yourself.“ + „Listen“ + „Open the Studio →“) უცვლელად. Studio-ს ბლოკში რეალური `/studio-lab`-ის crop (არანჟირება, soloed stem brass ფერით, როგორც direction-ის board-შია), „No DAW required“-ის ნაცვლად ის, რაც ეკრანზე ჩანს, და CTA „Open the Studio“.
- **დრო:** S–M.
- **კუთვნილება:** STORE-3 (hero) + direction-ის board-ის „Studio block“. ბლოკის acceptance-ში ჩაემატოს „რეალური Studio-ს სურათი“.

### F6 — Medium · ერთი პროდუქტი, სამი სახელი და ორი ვიზუალური ენა
- **სად:** nav „Studio“ (`Header.tsx:81`); home „Personal Mixdown Studio“ (`home-1440-s02.png`); Studio-ს header „CZABA Studio Lab · Workspace“ და `<title>` „Studio Lab — Demo workspace“ (`studio-lab.tsx:13`); legacy-ში „Studio“ / „Open in Studio“ (`account.downloads.tsx:127`). ტიპოგრაფია: Store-ში Playfair და teal (`store-store-1440x900.png`, `store-pages-contact.png`), Studio-ში Instrument Sans და brass.
- **მომხმარებლის გამოცდილება:** „Personal Mixdown Studio“ და „Studio Lab“ სხვადასხვა ხელსაწყოს ჰგავს; „Lab“ დაუმთავრებელს ნიშნავს.
- **პრინციპი:** §3g, ერთი ცნება — ერთი ტერმინი; Nielsen, consistency.
- **რეკომენდაცია:** ყველგან „CZABA Studio“ (nav-ში „Studio“); demo-ს სტატუსს badge ატარებს და არა სახელი. ვიზუალური ნაწილი STORE-2b-ის ამოცანაა (Playfair, teal და glow გადის).
- **დრო:** S (სახელი), STORE-2b (ვიზუალი).
- **კუთვნილება:** STORE-2b (ვიზუალი); სახელი ახალია, კითხვა Q4.

### F7 — Medium · English UI-ში ქართული content
- **სად:** `studio-S0-1440.png`, `studio-E1-four-stems-1440.png`: „Middle East — საჯარო preview“, „ღამის პულსი · სრული მიქსი“, „პულსი / ბასი / პადი / მელოდია“. წყარო: `app/data/studio-lab-demo.ts:15,47,54,75`. Studio-ს `strings.ts` ქართულს კრძალავს (plan R5), demo-ს data კი არა. ერთ ბარათზე ერთი სახელი სამჯერ მეორდება („Synthetic demo · ღამის პულსი“).
- **მომხმარებლის გამოცდილება:** უცხოელი მონტაჟორი ვერ კითხულობს clip-ის სახელს, რომელიც status-ში, ხაზზე, Clip details-ში და footer-ში 4–5-ჯერ ჩანს.
- **პრინციპი:** §3g (Store და Studio UI English-ზეა); Nielsen, match.
- **რეკომენდაცია:** demo-ს სახელები English-ზე („Night Pulse · Full mix“, „… · Bass“, „Middle East — public preview“). ბარათზე collection label ერთხელ, როგორც ჯგუფის სათაური (SR-230-6).
- **დრო:** S. Studio-ს data-ს ფაილია და არა protected.
- **კუთვნილება:** ახალია; SR-230-6-სა და SR-275-6-ს უკავშირდება.

### F8 — Medium · Mobile-ზე „Studio“ გატეხილ ეკრანს ხსნის
- **სად:** `m-menu-390.png` → `studio-mobile-390.png`: toolbar-ის ღილაკები ერთმანეთს ფარავს („Undo“ / „40 px/s“ / „Split“ / „Export“), timeline ეკრანს გარეთაა. Legacy route `MobileBlocker`-ს იყენებს (`studio.$productId.tsx:24`), `/studio-lab` კი არა.
- **მომხმარებლის გამოცდილება:** Instagram-დან მობილურით მოსული ვიზიტორი Studio-ს გატეხილად ხედავს და პროდუქტს ნაკლებად ენდობა.
- **პრინციპი:** Calm, „still work when it fails“; Rams, thorough (edge state).
- **რეკომენდაცია:** 900px-ზე ნაკლებ სიგანეზე მშვიდი ცარიელი მდგომარეობა: „The Studio works on a computer. Listen here, or send yourself the link.“ + preview player. Desktop-only გადაწყვეტილება უცვლელია.
- **დრო:** S.
- **კუთვნილება:** ახალია (Studio-ს route-ის ფაილი, loop-ის ფარგლებში).

### F9 — Medium · SFX-ის გვერდი შეიძლება „$0.00 USD“-ს აჩვენებდეს აქტიური Buy Now-ით
- **სად:** `/products/door-slams` (`store-product-door-slams-1440x900.png`). `createDisplayVersions` SFX-ისთვის, რომელსაც variants არ აქვს, `[]`-ს აბრუნებს (`lib/product-utils.ts:85`), `ProductDetailPage.tsx:68` კი `selectedVersion?.price ?? 0`-ს იყენებს. ბარათზე იმავე პროდუქტს $9 აწერია (`store-store-1440x900-full.png`).
- **მომხმარებლის გამოცდილება:** ფასი $0.00 და ღილაკი Buy Now: ან უნდობლობა, ან გაურკვეველი checkout.
- **შენიშვნა:** mock-ის fixture-ს variants არ აქვს. Production-ში SFX-ს ყოველთვის მოსდევს თუ არა „Universal“ variant, დაუდასტურებელია. თუ მოსდევს, ეს Low edge-case-ია.
- **რეკომენდაცია:** fallback `standardPrice`/`minPrice`-ზე (როგორც ხაზი 92 სხვა ტიპებისთვის აკეთებს). თუ ფასი უცნობია, Buy disabled, tooltip-ით „Price unavailable — contact us“.
- **დრო:** S.
- **კუთვნილება:** ახალი bug, STORE-4-ის ფაილებია.

### F10 — Medium · `/store`-ზე ბარათიდან ვერ მოუსმენ, 7 პაკეტი 4 ეკრანზეა გაშლილი
- **სად:** `store-store-1440x900-full.png`: 1440-ზე 2 სვეტია (`store.tsx:370` `md:grid-cols-2 gap-20 md:pl-16`), play არ არის, BPM, ხანგრძლივობა და stems არ ჩანს. Home-ის ბარათებს Play preview აქვს (`home-1440-s01.png`), ამიტომ ორი სია ერთმანეთისგან განსხვავებულად იქცევა.
- **მომხმარებლის გამოცდილება:** მუსიკას მოსმენით არჩევენ. ყოველი track-ისთვის გვერდის გახსნა და დაბრუნება მოსმენას ნელს ხდის.
- **Reference:** Epidemic-ში stems რიგის ღილაკითაა, Spitfire-ის ყოველ ბარათს კი „Play demo“ და „Now playing“ აქვს (`research/competitors.md` §1.3, §2.1).
- **პრინციპი:** Fitts, Doherty (მოსმენა ≤100 ms).
- **რეკომენდაცია:** STORE-4-ის „Play on every /store card“ + mono meta (ხანგრძლივობა · BPM · „Stems“, მხოლოდ data-დან). 1440-ზე 3 სვეტი.
- **დრო:** M.
- **კუთვნილება:** STORE-4 (უკვე რიგშია); სვეტების რაოდენობა დასამატებელია.

### F11 — Medium · Export dialog-ის ტექსტი ჟარგონულია, ღილაკები ორაზროვანი
- **სად:** `studio-E2-export-content-1280.png`, `studio-B0-export-empty-1440.png`: „LAME (mediabunny) — 320 kbps CBR; the encoder loads with the first MP3 export“, „Entire project, the same graph as playback“. ღილაკი „Done“ (testid `arrangement-export-cancel`) dialog-ს ხურავს ექსპორტის გარეშე. „Export WAV“ outline-ია, ისეთივე წონის, როგორც მეორეხარისხოვანი ღილაკები. ცარიელ პროექტში toolbar-ის Export brass outline-ით აქტიურად გამოიყურება, თუმცა dialog-ი ამბობს „Export is disabled: the project is empty“.
- **მომხმარებლის გამოცდილება:** „Done“-ზე დაჭერის შემდეგ შეიძლება ეგონოს, რომ ფაილი შეიქმნა; „graph“ და „mediabunny“ არაფერს ეუბნება.
- **პრინციპი:** §3g (ღილაკი ზმნითა და შედეგით ასახელებს მოქმედებას; მომხმარებლის სიტყვები); Norman, constraints.
- **რეკომენდაცია:** „MP3 · 320 kbps — smaller file for review links“, „WAV · 24-bit / 48 kHz — for your edit timeline“. „Done“ → „Cancel“. Primary ღილაკი შევსებული brass-ით. ცარიელ პროექტში toolbar-ის Export soft-disabled, tooltip-ით „Add a clip to export“.
- **დრო:** S.
- **კუთვნილება:** ახალია (copy round).

### F12 — Low · Studio-ში feedback ხელისგან შორს ჩანს
- **სად:**
  - envelope point-ის მნიშვნელობა მხოლოდ status-შია, ქვედა მარცხენა კუთხეში („Envelope: 70.858 s · −∞ dB“, `studio-C2-envelope-drag-bottom-1440.png`). Live point-ის გვერდით label-ს აჩვენებს (`ableton-live-measurements-2026-10-30.md`: „value label on creation“);
  - time selection-ის შემდეგ ქვედა ზოლი 3 ხაზად იზრდება: status + time selection + Clip (`studio-B2-dragging-1440.png`);
  - Clip details-ში From/To წამებშია („84.941“), დანარჩენი ყველგან mm:ss.mmm-ია (`studio-B4-fade-1440.png`);
  - „+“ marker-ზე დაჭერა, როცა name editor უკვე ღიაა, marker-ს ქმნის და იმავე წამს წერს „A marker already exists at this time“ (`scripts/studio-4.cjs`-ის ლოგი, `studio-D1-after-plus-1440.png`).
- **პრინციპი:** Norman, feedback და mapping; Calm (ტექსტი პერიფერიაში და ერთხელ).
- **რეკომენდაცია:** drag-ის დროს მნიშვნელობა point-ის გვერდით (tooltip-ის სტილით, მხოლოდ gesture-ის დროს). From/To mm:ss.mmm-ში. მეორე „+“ editor-ს commit-ავს და შეტყობინებას არ წერს.
- **დრო:** S.
- **კუთვნილება:** ნაწილობრივ SR-230-1 და SR-245-1 (ზოლები); დანარჩენი ახალია, deferred Low-ში.

---

## 4. რა მუშაობს კარგად (არ შეიცვალოს)

1. **Shortcut sheet** (`studio-B8-shortcut-sheet-1440.png`): ძებნა, ჯგუფები, „Ctrl means ⌘ on Mac“, ქმედება ზმნით, გასაღები მარჯვნივ. Recognition over recall-ის სანიმუშო მაგალითია და calm-ის წესით სწორ ადგილზე დგას.
2. **Status line ზუსტი შედეგით და Undo მოქმედების სახელით:** „Trim — right edge: start 00:00.000, length 01:24.941“, „Fade Out: 13.861 s.“, „Undo: Add Marker“ (სკრიპტის ლოგები). ეს Nielsen-ის visibility of status-ია, ეკრანზე ახალი ელემენტის დამატების გარეშე.
3. **Live-ის edit მოდელი:** clip-ის სათაურის ზოლით გადატანა, body-ზე time selection snap-ით (`studio-B2-dragging-1440.png`), კიდეზე `ew-resize` cursor-ითა და trim-ით, კუთხის fade handle-ით (`studio-B4-fade-1440.png`), Fit/X. ეს Jakob-ის კანონს ემსახურება Ableton-ის მომხმარებლისთვის.
4. **Export-ის სიმართლე:** disabled მდგომარეობის მიზეზი წინადადებით ეწერება, Range გვთავაზობს time selection-ს, default არის WAV 24-bit / 48 kHz (`studio-B0-export-empty-1440.png`), ანუ ის, რაც მონტაჟის timeline-ს სჭირდება.
5. **Product page-ის preview და მუდმივი player** (`product-me-playing-1440.png`): ერთი დაჭერა, ქვედა player progress-ით. ეს „Listen first“-ის საფუძველია.
6. **Obsidian & Brass Studio-ში:** მშვიდი, 1280×720-ზეც იკითხება (`studio-A4-playing-1280.png`). Store-ის მიმართულება A სწორედ ამ ენას უნდა მიჰყვეს.

---

## 5. პოზიცია screen-review-ის კანდიდატებზე

**SR-230**
- **SR-230-1** (footer „Clip: …“, როცა details ღიაა): **endorse.** სელექციის შემდეგ ქვედა ზოლი 3 ხაზს აღწევს (`studio-B2`).
- **SR-230-2** (სახელი details-ის body-ში): **endorse.**
- **SR-230-3** („source file stays unchanged“): **endorse.** გადავიდეს tooltip-სა და sheet-ში, ნდობის ფრაზა არ ქრება.
- **SR-230-4** (Zoom ჯგუფი): **modify.** „40 px/s“ readout გადავიდეს slider-ის tooltip-ში (ჟარგონია, §3g). „↶ Zoom“ დარჩეს icon-ად + tooltip-ით. Layout-ის ცვლილება ჯერ არა.
- **SR-230-5** (Demo chip): **drop.** ეს პატიოსნების სიგნალია, purchased-ში კი badge სხვა ტექსტს მიიღებს.
- **SR-230-6** (collection label ყოველ ბარათზე): **endorse + F7.** ერთხელ, ჯგუფის სათაურად, English-ზე.
- **SR-230-7** („Active track: … · playhead“): **modify.** SR-260-1-ში გაერთიანდეს: Add-ის label „Add to Music“.
- **SR-230-8** („· active“): **drop.** მხოლოდ ფერი WCAG 1.4.1-ს არღვევს.
- **SR-230-9** (ახალი clip ეკრანს გარეთ): **endorse** შეზღუდვით: scroll მხოლოდ მაშინ, როცა clip მთლიანად ხედს გარეთაა. F2-ის შემდეგ stem-ები 0-ზე დაჯდება და შემთხვევა იშვიათი გახდება.
- **SR-230-10:** **drop.** სკრიპტის შეცდომა იყო; copy-ის ნაწილს SR-275-2 ფარავს.

**SR-245**
- **SR-245-1** (ხუთი ფაქტი status-ში): **modify.** მოკლე დადასტურება + „audio is not stretched“ (Saba-ს CALM-ის გადაწყვეტილება რჩება); „Snap on — grid 1/2“ ამოვარდეს, რადგან chip აჩვენებს.
- **SR-245-2** (Add-ის შემდეგ ავტომატური snap): **info.** რჩება; F2-ის stem-set-ის ფლოუში status-მა ერთხელ თქვას „Snap on (G)“.
- **SR-245-3** (BPM, MARKERS და LOOP ზოლები): **modify.** BPM-ს placeholder „—“ და Metronome-ის მიზეზი tooltip-ში, დიახ; ზოლების დამალვა, არა (layout-ის სტაბილურობა, FVH-ის არგუმენტი).
- **SR-245-4** (ორი სახაზავი): **drop.** Saba-ს გადაწყვეტილებით min:sec ყოველთვის ჩანს, მონტაჟორისთვის წამები მთავარია.
- **SR-245-5** („1/2“): **endorse** tooltip-ით „Grid: ½ bar“. Chip-ში წილადი რჩება, როგორც Live-ში.
- **SR-245-6** („1×“): **endorse.** Icon + tooltip „Waveform height“.
- **SR-245-7** („Undo: Ad…“): **endorse.** კვლავ ჩანს (`studio-A2-demo-1440.png`); მოქმედების სახელი tooltip-სა და status-შია.
- **SR-245-8** (Clip Gain სამჯერ): **endorse.** SR-275-1-თან ერთად (ერთი dB ფორმატი).

**SR-260**
- **SR-260-1** (ბიბლიოთეკის ხაზის დრო არ ემთხვევა): **endorse, პირველი ნომრით.** ეკრანი ფაქტს ამახინჯებს: „Adds to Music at 01:43.352“.
- **SR-260-2** („insert marker“ ხილულ ტექსტში): **modify.** ხილულ ტექსტში „Adds at 00:00.000“, ტერმინი tooltip-სა და sheet-ში.
- **SR-260-3** (Follow ხმამაღალია): **endorse.** ჩართული მდგომარეობა outline-ით, tooltip „Follow playhead“.
- **SR-260-4** (Loop ორჯერ, disabled მიზეზის გარეშე): **modify.** Transport-ის ტექსტური ღილაკები Saba-ს CALM-ის წესით რჩება, ამიტომ icon-only არა; disabled tooltip კი „Drag on the LOOP lane to set a loop range“.
- **SR-260-5** (insert marker სქელ კიდეს ჰგავს): **endorse კითხვად.** Default: marker ჩანს მხოლოდ მაშინ, როცა playhead-ს არ ემთხვევა.
- **SR-260-6** („Preview“ და Play): **drop.** Label „Preview“ უკვე წერია, უმნიშვნელოა.

**SR-275**-ზე მოკლედ (Saba-ს კითხვაში არ იყო): SR-275-1, -2(b), -3 და -7 endorse; -5 endorse (ბარათზე „1:42“).

**რა გამორჩა მიმოხილვებს:** ოთხივე screen-review მხოლოდ `/studio-lab`-ის screenshot-ებს უყურებდა და clutter-ს ითვლიდა. ვერცერთმა ვერ დაინახა ის, რაც მხოლოდ ინტერაქციით ჩანს: stems პარალელურად ვერ ჟღერს (F2), Studio-ში შესასვლელი და გამოსასვლელი გზა არ არსებობს (F1), English UI-ში ქართული content-ია (F7), mobile-ზე Studio გატეხილია (F8), Export-ის copy ჟარგონულია (F11). **შემოთავაზება:** RETRO-ს whole-screen review-ს დაემატოს ერთი 3-ნაბიჯიანი journey screenshot-ების მიმდევრობით: product page → Studio → export.

---

## 6. რეკომენდებული რიგი

| # | რა | სად ჯდება loop-ის რიგში |
|---|---|---|
| 0 | Saba პასუხობს Q1–Q5-ს | ახლავე; PERF-ს არ აჩერებს |
| 1 | F9 ($0.00 fallback), F8 (mobile Studio-ს ცარიელი მდგომარეობა), F7 (demo-ს სახელები English-ზე) | Bug gate (2026-10-23) Medium-ებს „ახლავე“ ასწორებს. თითო მცირე fix-up რაუნდი PERF-ის ამოცანებს შორის; PERF-ის კოდს არ ეხება |
| 2 | **F2 stem-lane მოდელი** (AGREE + reference + Live measurement) | STUDIO-PERFORMANCE-ის შემდეგ, **SYS-1…3-ის წინ**. Studio-ს ძირითადი ღირებულებაა, ხოლო SYS polish-ია |
| 3 | **F1 / SRW-21** purchased mount | root + auth-ის მფლობელის პარალელური ნაკადი. მიზანი: STORE-4-მდე დასრულდეს, რომ „Make it yours — open in Studio“ ახალ Studio-ზე მივიდეს. ბმული demo-ზე (F1-2) S-ზომისაა და STORE-4-ში ჯდება |
| 4 | SYS-1…3 | უცვლელად |
| 5 | STORE-2b (F6-ის ვიზუალი) → STORE-3 (F5, hero და Studio-ს ბლოკი) → STORE-4 (F3, F10, F1-ის ბმული) → STORE-5 | უცვლელი რიგი; F3, F5 და F10 დაემატოს ამ ეტაპების acceptance row-ებად |
| 6 | Copy-ის რაუნდი: F11 + დამტკიცებული SR copy (SR-260-1/2, SR-245-1/5/7, SR-230-3/4) | STORE-5-ის შემდეგ ან REVIEW-RECOMMENDATIONS-ში |
| 7 | F4 (LeadMagnet), Saba-ს პასუხის მიხედვით | STORE-2b-ში, რადგან popup-ს მაინც იქ restyle-ავენ |
| — | F12 | `deferred_low_polish` |

---

## 7. კითხვები Saba-სთვის

1. **SRW-21-ის ვადა.** Purchased Studio-ს mount (auth-ის მფლობელთან ერთად) გავხადოთ Studio-ს პირველი პროდუქტული პრიორიტეტი PERF-ის შემდეგ? **Default: დიახ.** მანამდე product page-ზე იყოს „Try it in the Studio“ demo-ზე, track-ის public preview-ით.
2. **Stem-ების ხაზები.** Stem set-ის დამატებისას თითო stem-ს თავისი ხაზი ჰქონდეს, ყველა ერთ დროზე დაიწყოს და „Stems“ group-ში ჩაჯდეს? **Default: დიახ.** Video, Music და SFX ხაზები უცვლელია; Ctrl+T-ის ტიპის „ახალი ხაზი“ მოგვიანებით.
3. **LeadMagnet (keep-list).** შინაარსი და ქცევა რჩება, მაგრამ popup არ ჩნდება `/products/*`, `/cart` და `/checkout*`-ზე? **Default: დიახ, მხოლოდ ეს გამონაკლისი.**
4. **ერთი სახელი.** „CZABA Studio“ ყველგან (nav-ში „Studio“); „Personal Mixdown Studio“ და „Lab · Workspace“ გადის, demo-ს სტატუსს badge ატარებს. **Default: დიახ.**
5. **Body-drag მონტაჟორისთვის.** Live-ის წესი რჩება (body-ზე drag აკეთებს time selection-ს, გადატანა სათაურის ზოლით ხდება). Premiere-ის მომხმარებლისთვის first-run status-ში ერთხელ ვთქვათ „Drag a clip by its name bar to move it“? **Default: დიახ, მხოლოდ პირველი clip-ის შემდეგ ერთხელ;** ქცევა არ იცვლება.

---

## 8. რა ვერ შევამოწმე

- **Sign-in, cart-ის ცვლილება, checkout, გადახდა, downloads, `/account/downloads`** და მისგან გახსნილი legacy `/studio/:handle`: mock 401/501-ს აბრუნებს. Legacy Studio-ს ქცევა მხოლოდ კოდიდან ვიცი, ეკრანზე არ მინახავს.
- **რეალური product data:** SFX-ის variants (F9), stem-ების მასივი, ამიტომ „Play Stems“ ღილაკი ეკრანზე არ გამოჩნდა, demo-ს წყაროების BPM (Middle East-ს Studio-ში BPM არ აქვს, catalogue-ში 90-ია, tempo კი 120 synthetic stem-იდან დადგა).
- **ხმის მოსმენა:** headless-ში ყური არ მაქვს. Clipping-ის ნიშანი (master peak „+1.5“ წითლად, `studio-A4-playing-1440.png`) ვნახე, მაგრამ export-ის ფაილი არ შემიქმნია და overload-ის გაფრთხილება dialog-ში ვერ დავინახე.
- **სიჩქარის შეგრძნება** (fader-ის lag, SABA-B-5): headless-ში არ იზომება.
- **Video import, screen reader, რეალური touch-მოწყობილობა, LCP/CLS** არ გამიზომავს.
- **czaba.store:** WebFetch-ის ნებართვის მოთხოვნას დროულად არ უპასუხეს, production-თან შედარება არ შედგა.
- **Ableton Live:** წვდომა არ მქონდა. F2-ის multi-file drop დაუდასტურებელია და measurement request-ად არის ჩაწერილი; envelope point-ის double-click და click Live-ში ასევე დაუდასტურებელია.
