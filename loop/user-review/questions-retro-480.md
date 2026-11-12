# კითხვები Saba-სთვის — RETRO 480 (რაუნდები 465–479)

**ავტორი:** B, round 479 → 480 დაგეგმვა, 2026-11-12 (D-29z1705, D-29z1707). ყოველ კითხვას აქვს default. თუ პასუხი არ მოვა, loop default-ით აგრძელებს და არაფერს აჩერებს. ანალიზი: `retros/retro-480.md`.

## Q1. სქროლი შენს მოწყობილობაზე (SABA-B-15, TLM-R468-SABA-SCROLL-DEVICE) — პირველი RETRO ვადა
- **რა გაკეთდა:** მთავარ გვერდზე სქროლის კადრებს სამი `blur()` glow აგდებდა. Round 469–470-მა ისინი radial gradient-ით შეცვალა; cloud-ში ნელი კადრები 8/5-დან 0–1-მდე ჩამოვიდა (C round 470 PASS, გამოქვეყნდა `5cd9645`). `/free-downloads` cloud-ში 0 ნელ კადრს აჩვენებს.
- **კითხვა:** Vercel preview-ზე `/` და `/free-downloads` ახლა რბილად მოძრაობს შენს მაუსზე/trackpad-ზე? თუ შეგრძნება („მოცურება“) არ მოგწონს, აირჩიე Lenis-ის ვარიანტი `questions-round-468.md` Q1-დან: (a) დარჩეს, (b) მოკლე `duration` ≈ 0.8, (c) `lerp`, (d) გამორთვა.
- **Default:** (a). SABA-B-15 cloud-ის ნაწილით დასრულებულია, მაგრამ დახურვას შენი შემოწმება სჭირდება. ახალი ვადა RETRO 495; L46-ის მიხედვით, ორი RETRO უპასუხოდ ნიშნავს, რომ საკითხი ჩვეულებრივ task-ად გაიხსნება, რომელიც შენს მოწყობილობაზეა დაბლოკილი.

## Q2. LeadMagnet-ის ტაიმერი client ნავიგაციისას (B-R479-LEADMAGNET-TIMER-CLIENT-NAV) — ახალი
- **რა შეიცვალა:** round 479-მა footer-ის ბმულები გვერდის გადატვირთვის გარეშე ნავიგაციაზე გადაიყვანა. LeadMagnet-ის 8-წამიანი ტაიმერი ახლა გვერდიდან გვერდზე გადასვლისას არ ნულდება: C-მ ნახა, რომ `/`-დან `/faq`-ზე გადასვლიდან 2.2 წამში popup `/faq`-ზე გაიხსნა (`c-round-479.md` C13). ადრე გადატვირთვა ტაიმერს თავიდან იწყებდა. `/products/*`, `/cart` და `/checkout*` ისევ გამორიცხულია.
- **კითხვა:** ტაიმერი დარჩეს „საიტზე ყოფნის დროიდან“ (ახლანდელი ქცევა), თუ ყოველ ახალ გვერდზე თავიდან დაიწყოს?
- **Default:** ახლანდელი ქცევა რჩება. LeadMagnet keep-list-ზეა, ამიტომ loop მის ქცევას შენს გარეშე არ ცვლის.

## Q3. Firefox-ის ხუთი შემოწმება — მესამედ (L46: task იხსნება, დაბლოკილია root-ზე)
- **რა ელოდება:** TLM-PERF15-FIREFOX, TLM-SABA-B-12-FIREFOX-SAFARI-ის Firefox ნაწილი, TLM-R454-FIREFOX-SAFARI-SCROLLBAR, TLM-R455-FIREFOX-SEEK-THUMB, TLM-R459-FIREFOX-SAFARI-ENTRANCE.
- **რატომ:** runner-ზე მხოლოდ Chromium-ია; ROOT-REQ-PLAYWRIGHT-FIREFOX ისევ ღიაა.
- **ახლა:** L46-ის მიხედვით ხუთივე ერთ task-ად იხსნება: **FIREFOX-CHECKS**. ის root-ის Playwright Firefox-ზეა დაბლოკილი. როგორც კი Firefox runner-ზე გამოჩნდება, C ხუთივეს ერთ რაუნდში შეამოწმებს.
- **კითხვა:** root-მა დააყენოს Firefox, თუ შენ თავად გადაამოწმებ?
- **Default:** დაბლოკილი task, root-ის მოთხოვნა რჩება.

## Q4. Safari / WebKit-ის სია და Hire-Us e-mail — მეორედ (L46: task იხსნება, დაბლოკილია შენზე)
- **Safari:** TLM-SABA-B-12-FIREFOX-SAFARI-ის Safari ნაწილი, TLM-R449-WEBKIT-HEADING-INK, TLM-R454/R459-ის Safari ნაწილები, A-R73-SAFARI-FLAG-FOCUS. ერთ task-ად იხსნება: **SAFARI-CHECKS**, დაბლოკილია შენს macOS-ზე.
- **Hire-Us e-mail (TLM-R448-HIREUS-EMAIL-CLIENTS):** cloud-ში Brevo არ არის. task **HIREUS-EMAIL-CLIENTS** იხსნება, დაბლოკილია სატესტო წერილზე Gmail/Outlook/Apple Mail-ში.
- **კითხვა:** როდის შეძლებ ამ ორი სიის გავლას? სიები `feature-status.md` §5-შია.
- **Default:** ორივე დაბლოკილი task რჩება და არაფერს ბლოკავს.

## Q5. STUDIO-PERFORMANCE-ის გაჩერებული ნაწილები — მეოთხედ
PERF-4b, 9c, 11b, 12b, 14c-ii/iii ისევ შენს დიზაინის არჩევანს ელოდება (`questions-perf12b.md`, `questions-perf13b-ii.md`, `questions-perf14c-pyramid-canvas.md`). PERF-9d root-ს ელოდება, PERF-4c კი backend-ს. ეს დიზაინის არჩევანია და არა ხელით შემოწმება, ამიტომ L46-ის „task-ად გახსნა“ მასზე არ ვრცელდება.
- **Default:** გაჩერებული რჩება, ახალი ვადა RETRO 495.

## Q6. IME (ინფორმაცია)
TLM-SYS3-IME-PLATFORMS და TL-R444-L1-REAL-IME-SEARCH-CLEAR RETRO 465-ზე task-ად გაიხსნა, რომელიც რეალურ IME-ზეა დაბლოკილი. სტატუსი არ შეცვლილა. ახალი ვადა RETRO 495.
- **Default:** დაბლოკილი task რჩება; არაფერს ბლოკავს.

## Q7. წინადადებები root-ისთვის და შენთვის (loop თავად არ ცვლის)
დეტალები: `retros/retro-480.md` §12: micro-fix-ის წინადადება (მეორედ), CSS-ის AST reader-ი (`package.json`, root), DP-gate-ის ანგარიშში commit-ის hash, primitives-ის teal და შრიფტის ხაზები (ROOT-REQ-DPG-PRIMITIVES-PATCH).
- **Default:** არაფერი იცვლება; ყველაფერი წინადადებად რჩება, loop პროექტის წესებს თავად არ ცვლის.
