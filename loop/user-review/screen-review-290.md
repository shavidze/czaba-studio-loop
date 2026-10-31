# ეკრანისა და გზის მიმოხილვა — RETRO 290 (კანდიდატები Saba-სთვის)

**თარიღი:** 2026-10-31 · **ავტორი:** B (D-29z714) · **HEAD:** `5a911ff` (round 289-ის შემდეგ)
**წესები:**
- „Whole-screen review at every RETRO“ (Saba, 2026-10-28);
- product-designer-ის წესი (Saba, 2026-10-30);
- სამნაბიჯიანი გზა „product page → Studio → export“ (Saba, 2026-10-31).

**ეს მხოლოდ კანდიდატებია.** შენს პასუხამდე არცერთი არ განხორციელდება. პოზიციის გადატანა და ქცევის ცვლილება ყოველთვის შენი გადასაწყვეტია.

## როგორ გადავიღე
Screenshot-ები `tmp/studio-real-loop/b-round-289/screens/`-შია. გამოვიყენე Playwright Chromium, ანონიმური სესია და `Demo collection ready`-ის მოლოდინი. სკრიპტია `capture.mjs`.

**ეკრანი:**
- `screen290-full-S0-{1440x900,1280x720}.png`: ცარიელი პროექტი;
- `screen290-full-DEMO-*.png`: სამი ხმა დამატებულია.

ხილული ტექსტის ელემენტები S0 / DEMO:
- 1440: 139 / 167;
- 1280: 119 / 143.

timeline-ისა და ბიბლიოთეკის გარეთ: 98 / 125 (1440) და 87 / 102 (1280). round 275-ზე იყო 98 / 126 და 87 / 103. ჯამი არ გაზრდილა (`counts.txt`).

**გზა.** product page გაიხსნა loop-ის mock backend-ზე (`mock-api/server.mjs`, :5199). გადაღების შემდეგ mock გავაჩერე.
1. `journey290-1-product-*.png`: `/products/middle-east`. Studio-ზე ბმული მხოლოდ nav-ის „Studio → /studio-lab“-ია. „Try it in the Studio“ ჯერ არ არის; ეს STUDIO-LINK-ია.
2. `journey290-2-studio-playing-*.png`: Night Pulse-ის ოთხი stem დამატებულია და Play დაჭერილია. position 1.5 წამში 00:01.47-მდე მივიდა.
3. `journey290-3-export-*.png`: export dialog.

**გადაღების შეცდომა (გულწრფელად).** სკრიპტის კლიკი Stems lane-ის სათაურზე pan slider-ს მოხვდა, ამიტომ active lane ისევ Music დარჩა. ეს SR-230-10-ის მსგავსი შეცდომაა. ამის გამო DEMO-სა და გზის screenshot-ებზე stem-ები Music-ზეა.

შევამოწმე ცალკე probe-ით (`stems-probe.json` / `.png`, ორივე viewport):
- lane-ის სახელზე კლიკი Stems-ს ააქტიურებს, და შემდეგ Add stem-ს Stems-ზე სვამს;
- მონიშვნის გარეშე პირველი Add stem-ს Music-ზე სვამს, რადგან Music default-ად active-ია.

ამიტომ SR-290-3 სწორ ფაქტს ეყრდნობა, მაგრამ screenshot-ზე არა. შემდეგი retro-სთვის capture სკრიპტი lane-ს სახელით აირჩევს (HR-CAPTURE-LANE-BY-NAME).

**ვინ ნახა** (სამივე read-only, მხოლოდ screenshot-ებითა და JSON-ით):
- `product-designer` (PD);
- `design-philosopher` (DP): ფაილის ჩაწერა აეკრძალა. store-ის tree შემდეგ `sha256sum -c`-ით შემოწმდა, rc 0;
- `first-visit-host` (FVH).

ერთნაირი მიგნებები ერთ ID-ში გავაერთიანე. ის, რაც SR-230/245/260/275-სა და 2026-10-31-ის მიმოხილვის F1–F12-ში უკვე იყო, აქ აღარ გავიმეორე.

## ყველაზე სუსტი ნაბიჯი (PD, FVH)
ნაბიჯი 2, Studio. stem-ების ყიდვის აზრი მათი ერთად მოსმენაა. დღეს ისინი ერთ ხაზზე ერთმანეთის მიყოლებით ჯდება (F2, STEM-LANES უკვე რიგშია). ამის გამო export-ის range 1:04 გამოდის 0:16-ის ნაცვლად. ეს არის „არასწორი სიგრძის ფაილი“, რომელსაც მომხმარებელი შეიძლება ვერ შეამჩნიოს (PD).

## კანდიდატები

| ID | რას ვხედავთ | შეთავაზება | სახე | პრიორიტეტი |
|---|---|---|---|---|
| SR-290-1 | 1280-ზე export dialog scroll-დება: Range-ის „Time selection“ footer-ის ქვეშაა. გამორთული „Video (with audio)“ რიგის მიზეზი ორ ხაზზეა (PD, DP) | მიზეზი tooltip-ში გადავიდეს, რომ Range-ის ორივე არჩევანი scroll-ის გარეშე ჩანდეს | copy/visual, COPY-PD-ს (F11) უერთდება | Medium |
| SR-290-2 | „Entire project · 00:00.000 — 01:04.000“ ორჯერ ჩანს: სათაურის ქვეშ და Range-ში (PD, DP, FVH) | subtitle შედეგს აჩვენებს („4 clips · 1:04 · WAV“) ან საერთოდ ქრება | copy, COPY-PD | Low |
| SR-290-3 | **კითხვა.** Add ყველაფერს active lane-ზე სვამს. Music default-ად active-ია, ამიტომ პირველი ვიზიტისას Stem Music-ზე ხვდება (B-ის probe) | STEM-LANES-ის მიღების კრიტერიუმში ჩაიწეროს: „Stem item stem lane-ებზე მიდის, რომელი lane-იც არ უნდა იყოს active“. PD და FVH-ის default: კი. საწინააღმდეგო არგუმენტი: ვინც Music განზრახ აირჩია, ის ამ არჩევანს კარგავს | ქცევა, შენი გადაწყვეტილება | Medium |
| SR-290-4 | ruler-ის დროის წარწერა playhead-ის თავის ქვეშ ექცევა (`:00`) | წარწერა tick-ის მარჯვნივ. Live-ში ასეა თუ არა, დაუდასტურებელია | visual | Low |
| SR-290-5 | Overview ზოლი თითქმის თეთრია და ეკრანზე ყველაზე კაშკაშაა | waveform-ის ტონამდე დაბნელდეს; პოზიცია უცვლელია (SABA-B-8) | visual | Low |
| SR-290-6 | product page-ზე ფასი ორ ფორმატშია: „$29.00 USD“ და „$29“ | ყველგან „$29“, ხოლო „USD“ მხოლოდ ფასის ბლოკის label-ში. DP ფიქრობს, რომ ფასის ბლოკი cart-ისთვის დარჩეს (უთანხმოება) | store copy (STORE-4) | Low |
| SR-290-7 | Video lane-ზე Original sound, fader, M/S და ცარიელი შავი monitor ვიდეომდეც ჩანს (DP) | პირველ ვიდეომდე დაბნელდეს, არ წაიშალოს (CALM-ის წესი „Original sound“-ს ტოვებს) | visual | Low |
| SR-290-8 | pan-ის „C“ ყველა audio lane-ზე (DP) | მნიშვნელობა ჩანდეს მხოლოდ მაშინ, როცა pan ცენტრში არ არის; tooltip „Pan: centre“ | copy/visual | Low |
| SR-290-9 | product page-ზე „WAV · 24-bit / 48 kHz“ ორივე version card-ზე მეორდება (DP) | ერთი საერთო ხაზი „Select version“-ის ზემოთ. card-ებზე მხოლოდ განსხვავება დარჩეს: იქ, სადაც F3-ის stems ხაზი ჯდება | store copy (STORE-4) | Low |
| SR-290-10 | **კითხვა.** Middle East-ის გვერდიდან Studio-ში მოსულს ამ ტრეკის stem-ები არ ხვდება (FVH) | ბიბლიოთეკაში ერთი ხაზი: „Full mix only — try stems with Night Pulse“. Night Pulse-ის პირველ ადგილზე გადატანა პოზიციის გადატანაა | copy (კითხვა), STUDIO-LINK | Low |

**კითხვა SABA-Q-LIB-SINGLE-RUN** (C-R289-INFO-02 + gate-289 S2, SR-275-6-თან ერთად). როცა ძიება ან შეძენილი ბიბლიოთეკა ერთ კოლექციას აჩვენებს, card-ზე მხოლოდ „Bass“ ჩანს. კოლექციის სახელი მხოლოდ hover-ის title-ში, screen reader-ის აღწერასა და preview-ის სათაურშია. ასეთ დროსაც ვაჩვენოთ ერთი heading? დღეს: არა. ეს არ გვაჩერებს.

**უკვე შენთანაა (ახალი არ არის).** DP-მ შენიშნა, რომ 1280-ზე transport ორ რიგად იშლება. ეს უკვე SABA-Q-9-TRANSPORT (c) კითხვაა, round 255-ის გაზომვით.

## ცალკე
- FVH-ის ექსპერიმენტი (5 ახალი მომხმარებელი: „add, play, export“) კანდიდატად ჩავიწერე. loop-ში ადამიანებზე ტესტი არ ტარდება.
- STORE-ის კანდიდატები (SR-290-6, SR-290-9) STORE-4-ის მიმართულების გადაწყვეტილებასთან ერთად განიხილება.
