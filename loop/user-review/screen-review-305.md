# ეკრანისა და გზის მიმოხილვა — RETRO 305 (Saba-სთვის)

**თარიღი:** 2026-11-02 · **ავტორი:** B (RETRO 305, D-29z802) · **master:** `adf959d`
**წესი:** აქ ყველაფერი **კანდიდატი ან კითხვაა**. loop არაფერს ახორციელებს შენს პასუხამდე (2026-10-28-ის „whole-screen review“ წესი). პოზიციის გადატანა ყოველთვის შენი გადაწყვეტილებაა.

**კონსულტაციები** (read-only, სამივე რეალურად გამოძახებულია): `product-designer` (PD), `design-philosopher` (DP), `first-visit-host` (FVH). DP-ს ჩაწერა აეკრძალა; შემდეგ store-ის tree `sha256sum -c`-ით შევამოწმე: rc 0, `git status` ცარიელი. მათი შეფასებები მათი აზრია; ფაქტები ქვემოთ ცალკეა.

## როგორ გადავიღე
- **სკრიპტი:** `b-round-304/screens/capture.mjs` (RETRO 290-ის ასლი). lane-ს ვირჩევ სახელზე დაჭერით და `Active track:`-ს ვამოწმებ (HR-CAPTURE-LANE-BY-NAME). `laneErrors` = არცერთი (`screen305.json`).
- **გარემო:** რეალური Chromium, `/studio-lab` dev server-ზე (:5173). product page-ისთვის mock backend (`mock-api/server.mjs`, :5199) გავუშვი და გადაღების შემდეგ გავაჩერე (`b-round-304/mock.log`).
- **ეკრანები** (1440×900 და 1280×720): ცარიელი პროექტი (`screen305-full-S0-*`) და demo პროექტი (`screen305-full-DEMO-*`: Middle East → Music, Soft impact → SFX, Bass → Stems).
- **გზა:** `/products/middle-east` (`journey305-1-product-*`) → „Try it in the Studio“ → `/studio-lab?preview=middle-east` (`journey305-1b-studio-arrival-*`; preview მონიშნული და focus-ზეა) → Stems lane-ზე Pulse, Bass, Pad, Melody → Play 1.5 s (`journey305-2-studio-playing-*`; პოზიცია 00:01.483 / 00:01.471) → Export (`journey305-3-export-*`).
- **მუდმივი ტექსტის ხაზები timeline-ის გარეთ** (`counts.txt`): 1440 S0 97, DEMO 124; 1280 S0 86, DEMO 101. RETRO 290-ში: 98 / 125 / 87 / 102. ოთხივე 1-ით შემცირდა.
- **გადაღების შეზღუდვა (FVH):** გზაზე Night Pulse-ის stem-ები დავამატე და არა Middle East. ამიტომ „მოსული ტრეკის მოსმენა და export“ ამ გადაღებით არ დადასტურებულა.

## ყველაზე სუსტი ნაბიჯი (PD, FVH)
„Try it in the Studio“ მომხმარებელს **ცარიელ timeline-ზე** აყენებს. Middle East მონიშნულია, მაგრამ მისი დასამატებლად Add ან Enter უნდა იპოვოს. status ზოგადია („Demo collection ready…“), ხოლო ყველაზე თვალსაჩინო შენიშვნა ამბობს „not CZABA catalogue audio“. დიდი Play ღილაკი აქტიურია, მაგრამ დაჭერისას არაფერი ჟღერს (end 00:00.000); status წერს „Nothing to play — add a clip from the library first.“ (C round 305, `c-round-305/screens/sr-probe.json`). PD-ის ფორმულირებით: დაპირება „try it“ იყო, მიღებული კი „assemble it“-ა. → **SR-305-3**.

## კანდიდატები

| ID | რას ვხედავთ (screenshot) | შეთავაზება / უარყოფილი ვარიანტი | სახე | პრიორიტეტი |
|---|---|---|---|---|
| SR-305-1 | არჩეული clip სამჯერ ჩანს: Clip details-ის სათაურში, მის body-ში და status-ის მეორე ხაზში „Clip: … source offset“ (`screen305-full-DEMO-1440x900.png`; PD, DP) | status-ის „Clip:“ ხაზი დაიმალოს, როცა Clip details ღიაა. „Source offset“ → „Starts at (in file)“. უარყოფილი: panel-ის body-ის შემცირება, რადგან ის რედაქტირების ადგილია (PD) | copy/ქცევა | Low |
| SR-305-2 | **კითხვა.** demo/synthetic-ის შენიშვნა ~4-ჯერ მეორდება: header-ის chip, ბიბლიოთეკის შენიშვნა, tree და list-ის სათაურები (`journey305-1b-studio-arrival-1440x900.png`, `screen305-full-S0-*`; PD, DP). FVH: „Synthetic demo stems — not CZABA catalogue audio“ პირდაპირ მონიშნული Middle East-ის ზემოთაა, რომელიც ნამდვილი CZABA preview-ა, ამიტომ მომხმარებელმა შეიძლება ის ყალბად ჩათვალოს | ზუსტი ტექსტი: „Night Pulse stems are synthetic; CZABA previews are real public previews.“ (FVH). PD/DP: ერთხელ თქმა header-ის chip-ის tooltip-ით. უარყოფილი: გამჟღავნების მოხსნა. **შენიშვნა:** ბიბლიოთეკის ერთხაზიანი შენიშვნა SABA-B-8-ით შენ დაამტკიცე. ამიტომ გამეორებების რაოდენობა და ტექსტი შენი გადაწყვეტილებაა | copy, შენი გადაწყვეტილება | Medium |
| SR-305-3 | **კითხვა.** „Try it in the Studio“-დან ცარიელ timeline-ზე ვხვდებით (`journey305-1b-*`; PD, FVH) | (a) PD-ის default: მოსვლისას preview Music-ზე 00:00-ზე ჩაჯდეს ერთი undoable მოქმედებით, status: „Middle East added to Music. Press Space to play.“ (b) მხოლოდ copy (FVH): status ასახელებს მონიშნულს: „Middle East — public preview is selected. Press Enter or + Add to place it on Music, then Play.“ უარყოფილი: autoplay (ბრაუზერი ბლოკავს და აფრთხობს) | ქცევა (a) / copy (b), შენი გადაწყვეტილება | Medium |
| SR-305-4 | Add-ის შემდეგ status ერთ წინადადებაში ხუთ ფაქტს ატევს (added, tempo, bars on, grid only, snap). ეს **სიმჭიდროვის** საკითხია და არა წაკვეთის: წინადადება 1440-ზეც და 1280-ზეც სრულად ჩანს ერთ ხაზზე (C round 305 გაზომვა: scrollWidth = clientWidth, 1416/1416 და 1256/1256; `c-round-305/screens/sr-probe-status-1440x900.png`, `screen305-full-DEMO-1440x900.png`; PD, DP). შესწორებულია RT-FIX-ით (C-R305-01; ადრე აქ შეცდომით ეწერა „1440-ზე წყდება“ — capture-ის JSON ტექსტს 120 სიმბოლოზე ჭრიდა) | შემოკლება: „Added to Stems at 00:48 · Tempo 120 from clip · audio is not stretched“. **შეზღუდვა:** SABA-B-8-ის მიხედვით „audio is not stretched“ BPM-ის დაყენებისას status-ში რჩება, ამიტომ DP-ის „? sheet-ში გადატანა“ ამ ნაწილზე უარყოფილია | copy | Low |
| SR-305-5 | zoom-ის ჯგუფი ხმაურიანია: „ZOOM“ label, „40 px/s“ readout, მეორე „Zoom“ ღილაკი და „Fit“ ერთად (`screen305-full-S0-1440x900.png`; PD) | readout slider-ის tooltip-ში; „Zoom“ (back) icon-ად, tooltip „Previous zoom“. უარყოფილი: Fit-ის მოხსნა | copy/visual | Low |
| SR-305-6 | Clip details-ის ცარიელი მდგომარეობა: ცარიელი input-ები, waveform-ის ყუთი, „Set selection“ და Clip Gain ჩანს მაშინაც, როცა არაფერია მონიშნული (`screen305-full-S0-*`; PD, DP) | PD: მხოლოდ hint ხაზი და ჩამქრალი input-ები; geometry უცვლელი რჩება (SABA-B-8/CALM-2-ის „fields keep their geometry“-ს შესაბამისად). DP-ის ვარიანტი, panel default-ად დაკეცილი, პოზიციის გადატანაა და ეწინააღმდეგება CALM-2-ის შენს გადაწყვეტილებას. ამიტომ მხოლოდ კითხვად რჩება | visual | Low |
| SR-305-7 | **კითხვა (მონაცემი).** demo-ში Middle East preview-ს BPM არ აქვს (`app/data/studio-lab-demo.ts`-ში `bpm` მხოლოდ synthetic stem-ებზეა). ამიტომ მის გვერდით Stem-ის დამატებისას tempo 120 ხდება და Music-ის ტრეკს ბარები არ ემთხვევა (`journey305-2-studio-playing-1440x900.png`; PD). **დაუდასტურებელია:** product page-ის „90 BPM“ mock fixture-იდანაა და არა რეალური კატალოგიდან | preview-მ კატალოგის BPM ატაროს. შენი წესი „mixed project takes its tempo from the music asset“ (SABA-B-11a) მაშინ იმუშავებს. უარყოფილი: მომხმარებელს BPM-ის ხელით აკრეფა მოვთხოვოთ | მონაცემი/ქცევა, შენი გადაწყვეტილება | Low |
| SR-305-8 | product page Premium-ზე წერს „6 audio files“, Studio-ში კი ამ ტრეკისთვის მხოლოდ ერთი preview-ა (`journey305-1-product-1440x900.png` → `journey305-1b-*`; FVH) | link-ის ქვეშ ერთი ხაზი: „Preview mix only; stems come with Premium.“ ტექსტი brand voice-ით შენ უნდა შეამოწმო. SR-290-10-ს უკავშირდება | store copy (STORE-4) | Low |
| SR-305-9 | **კითხვა.** export dialog არაფერს ამბობს, რისთვის შეიძლება ექსპორტირებული preview-ს გამოყენება (`journey305-3-export-*`; FVH) | ერთი ხაზი ლიცენზიის რეალური პირობებით. ტექსტი ლიცენზიაზეა დამოკიდებული, ამიტომ შენი გადაწყვეტილებაა | copy, შენი გადაწყვეტილება | Low |
| SR-305-10 | A-R302-INFO-CZABA-DOUBLE-READOUT: screen reader კითხულობს „CZABA CZABA Studio“ (back link + H1) | PD: მხოლოდ link-ის accessible name შეიცვალოს, ხილული „← CZABA“ და H1 უცვლელი რჩება. **B-ის შესწორება:** WCAG 2.5.3 (Label in Name) მოითხოვს, რომ სახელში ხილული „CZABA“ ეწეროს, ამიტომ „Back to CZABA store“ და არა „Back to store“. პოზიცია არ იცვლება | a11y copy | Low |

## უკვე დამტკიცებული ან რიგში მყოფი (ახალი არ არის)
- export-ის ტექნიკური ტექსტი („LAME (mediabunny)…“, „the same graph as playback“, „Done“ → „Cancel“) უკვე **COPY-PD-შია** (F11, შენ დაამტკიცე 2026-10-31). PD #7 და DP #5 მას ადასტურებს.
- stem-ები ერთმანეთის მიყოლებით ჯდება („nearest free spot“, `screen305.json` clips) → STEM-LANES (Q2).
- 1280-ზე toolbar ორ რიგად იშლება → SABA-Q-9-TRANSPORT.
- store-ის ვიზუალი → STORE-2b…5 (direction gate).

## რა უნდა დარჩეს (PD)
მოსვლისას preview უკვე მონიშნული და focus-ზეა, ხოლო Preview და Add მის გვერდითაა. ეს კარგად მუშაობს.

## პირველი ექსპერიმენტი (FVH, შენთვის)
ერთ ახალ მომხმარებელს მიეცით დავალება: „Middle East-ის გვერდიდან მოუსმინე მას Studio-ში და გააკეთე WAV export“, დახმარების გარეშე. ჩაიწერეთ: რამდენჯერ დააჭირა Play-ს „+ Add“-მდე, რას იკითხავს და დაასრულა თუ არა. თუ უმეტესობა ცარიელ Play-ს არ აჭერს, SR-305-3 მოიხსნას.
