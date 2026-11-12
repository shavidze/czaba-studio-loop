# კითხვები Saba-სთვის — RETRO 465 (რაუნდები 450–464)

**ავტორი:** B, round 464 → 465 დაგეგმვა, 2026-11-12 (D-29z1638). ყოველ კითხვას აქვს default: თუ პასუხი არ მოვა, loop default-ით აგრძელებს და არაფერს აჩერებს. ხელით შემოწმებები (Tech Lead) T12-ს და Store-ს არ ბლოკავს (2026-10-23 root clarification). `questions-retro-450.md`-ის Q1–Q7-ზე პასუხი არ მოსულა; ქვემოთ ისინი გაერთიანებულია, ძველი კითხვა თავიდან არ იწერება.

## Q1. Firefox — ხუთი შემოწმება ერთად
- **რა ელოდება:** TLM-PERF15-FIREFOX (მეხუთე კითხვა), TLM-SABA-B-12-FIREFOX-SAFARI-ის Firefox ნაწილი, TLM-R454-FIREFOX-SAFARI-SCROLLBAR (Store-ის scrollbar), TLM-R455-FIREFOX-SEEK-THUMB (Store player-ის thumb), TLM-R459-FIREFOX-SAFARI-ENTRANCE (შესვლის ანიმაცია). ბოლო სამის ვადა RETRO 465 იყო, ეს პირველი კითხვაა.
- **რატომ:** cloud runner-ზე მხოლოდ Chromium-ია (`~/.cache/ms-playwright`: `chromium-1200`, `chromium_headless_shell-1200`, `ffmpeg-1011`). ROOT-REQ-PLAYWRIGHT-FIREFOX ისევ ღიაა.
- **კითხვა:** root-მა დააყენოს Playwright Firefox runner-ზე (მაშინ C ხუთივეს ერთ რაუნდში შეამოწმებს), თუ შენ თავად გადაამოწმებ Firefox-ში?
- **Default:** root-ის მოთხოვნა რჩება; ხუთივე ერთ სიაშია `feature-status.md` §5-ში, ახალი ვადა RETRO 480.

## Q2. Safari / WebKit — ერთი ხელით სია
- **რა ელოდება:** TLM-SABA-B-12-FIREFOX-SAFARI-ის Safari ნაწილი, TLM-R449-WEBKIT-HEADING-INK (სათაურის ink), TLM-R454 და TLM-R459-ის Safari ნაწილები, A-R73-SAFARI-FLAG-FOCUS.
- **კითხვა:** როდის შეძლებ ამ სიის Safari-ში გავლას (macOS)? სია და ნაბიჯები `feature-status.md` §5-შია.
- **Default:** ხელით რჩება, ახალი ვადა RETRO 480; არაფერს ბლოკავს.

## Q3. IME — მეორედ (L46)
- **რა ელოდება:** TLM-SYS3-IME-PLATFORMS და TL-R444-L1-REAL-IME-SEARCH-CLEAR: Studio-ს ველებში რეალური IME (იაპონური/ჩინური/კორეული) macOS-სა და Windows-ზე.
- L46-ის მიხედვით, ორი RETRO პასუხის გარეშე ნიშნავს, რომ საკითხი ჩვეულებრივ task-ად იხსნება. Cloud-ში რეალური IME არ არის, ამიტომ task **იხსნება, მაგრამ დაბლოკილია** შენს კომპიუტერზე (Chromium-ის IME სიმულაცია უკვე PASS-ია, round 442–445).
- **კითხვა:** გადაამოწმებ, თუ სურვილი გაქვს ეს ნაწილი „არ ეხება“ ჩაიწეროს?
- **Default:** ღია task, დაბლოკილი შენს შემოწმებაზე; T12-ს და Store-ს არ ბლოკავს.

## Q4. STUDIO-PERFORMANCE-ის გაჩერებული ნაწილები — მესამედ
PERF-4b, 9c, 11b, 12b, 14c-ii/iii ისევ შენს დიზაინის არჩევანს ელოდება (`questions-perf12b.md`, `questions-perf13b-ii.md`, `questions-perf14c-pyramid-canvas.md`); PERF-9d root-ს, PERF-4c backend-ს. ეს ხელით შემოწმება არ არის, ამიტომ L46-ის „ხელახლა გახსნა“ არ ეხება.
- **Default:** გაჩერებული რჩება, ახალი ვადა RETRO 480.

## Q5. Hire-Us-ის e-mail რეალურ კლიენტებში (TLM-R448-HIREUS-EMAIL-CLIENTS) — პირველად
Round 448-ის შიდა e-mail-ის გაგზავნა Gmail/Outlook/Apple Mail-ში cloud-ში ვერ მოწმდება (Brevo არ არის).
- **კითხვა:** გაგზავნი სატესტო წერილს და გადახედავ სამ კლიენტში?
- **Default:** ხელით რჩება, ვადა RETRO 480.

## Q6. ეკრანის ახალი კანდიდატები (ინფორმაცია + ერთი კითხვა)
`screen-review-465.md`: SR-465-1 (Premium chip იმეორებს სახელს), SR-465-2 (WAV / 24-bit ორივე ბარათზე), SR-465-3 (library-ის სიის ზედა ხაზი შუაზე იჭრება). SR-450-1…5 ისევ ელოდება.
- **კითხვა (მხოლოდ თუ SR-465-2-ს ამტკიცებ):** საერთო ფორმატის ხაზი „What's included“-ში თუ „Select version“-ის ქვეშ?
- **Default:** არაფერი ხორციელდება; „What's included“ თუ დაამტკიცებ.

## Q7. პროცესის წინადადება (root-ისთვის და შენთვის; loop თავად არ ცვლის)
`tech-lead`-ის დაკვირვება: hash-ით დაფიქსირებულ sketch-ში A-ს reviewer-ის ყოველი Medium ხდება STOP + C FAIL + ახალი რაუნდი (451, 456, 457, 459). **წინადადება:** B-ს წინასწარ ჩაწერილი „micro-fix“ დაშვება — A-ს შეუძლია sketch-ის ერთი მცირე ცვლილება, თუ ის B-ის task-ში დასახელებული კლასისაა და mutant-ით მტკიცდება. ეს „Writer does not verify“ წესს ეხება, ამიტომ მხოლოდ შენი და root-ის თანხმობით.
- **Default:** არ იცვლება; წინადადება RETRO 480-მდე counter-ად რჩება (RETRO480-PINNED-SKETCH-MICRO-FIX).
