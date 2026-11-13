# კითხვები Saba-სთვის — RETRO 495 (რაუნდები 480–494)

**ავტორი:** B, round 494 → 495 დაგეგმვა, 2026-11-13 (D-29z1767 … D-29z1770). თითოეულ კითხვას default აქვს. თუ პასუხი არ მოვა, loop default-ით გააგრძელებს და არაფერი გაჩერდება. ანალიზი: `retros/retro-495.md`.

## Q1. სქროლი შენს მოწყობილობაზე (SABA-B-15, TLM-R468-SABA-SCROLL-DEVICE) — მეორე RETRO უპასუხოდ
- **რა გაკეთდა:** რაუნდები 468–470, C PASS, გამოქვეყნდა `5cd9645`. cloud Chromium-ში `/` და `/free-downloads` ნელ კადრს თითქმის აღარ აჩვენებს. პირველად RETRO 480-ის Q1-ში გკითხე, პასუხი არ მოსულა.
- **ახლა (L46):** ორი RETRO უპასუხოდ გავიდა, ამიტომ საკითხი ჩვეულებრივ task-ად იხსნება: **SABA-DEVICE-CHECKS**. ის შენს მოწყობილობაზეა დაბლოკილი, როგორც SAFARI-CHECKS. იქვე გადადის Q2-ის ოთხი შემოწმებაც, თუ RETRO 510-მდე პასუხი არ მოვა.
- **კითხვა:** Vercel preview-ზე `/` და `/free-downloads` შენს მაუსზე და trackpad-ზე რბილად მოძრაობს? თუ შეგრძნება არ მოგწონს, აირჩიე Lenis-ის ვარიანტი (`questions-round-468.md` Q1): (a) დარჩეს, (b) `duration` ≈ 0.8, (c) `lerp`, (d) გამორთვა.
- **Default:** (a). SABA-B-15 ღია რჩება შენს შემოწმებამდე და loop-ს არ ბლოკავს.

## Q2. ოთხი ახალი ხელით შემოწმება — პირველი RETRO ვადა
| Id | რა უნდა ნახო | სად |
|---|---|---|
| TLM-R485-SR-ROUTE-ANNOUNCE | screen reader (NVDA/VoiceOver) ახალი გვერდის სათაურს კითხულობს client ნავიგაციისას (header/footer ბმული) | ნებისმიერი Store გვერდი |
| TLM-R489-SABA-ENTRANCE-FEEL | პირველი შესვლის ანიმაცია (≥ 3.5 წმ) საკმარისად გრძელია და კარგად იგრძნობა | `/`, ცარიელი cache |
| TLM-R489-TOUCH-SWIPE | ტელეფონზე swipe ანიმაციის დროს გვერდს უხილავად არ ასქროლავს და ანიმაციას გამოტოვებს | `/`, ტელეფონი |
| TLM-R491-PHONE-NAME-EDITOR | Account → Full Name რედაქტორი ტელეფონზე ეტევა, Save/Cancel დაჭერადია | `/account`, ტელეფონი |

- **Default:** ოთხივე ღია რჩება, ახალი ვადა RETRO 510. მაშინაც უპასუხოდ თუ დარჩა, SABA-DEVICE-CHECKS-ს დაემატება. არაფერს ბლოკავს.
- **ინფორმაცია:** TLM-R492-SR-PASSWORD-DIALOG-ს (პაროლის დიალოგი screen reader-ით) ვადა RETRO 510-ია და ახლა არ იკითხება.

## Q3. Firefox / Safari / Hire-Us e-mail — სტატუსი უცვლელია
- **FIREFOX-CHECKS** ისევ ROOT-REQ-PLAYWRIGHT-FIREFOX-ს ელოდება, **SAFARI-CHECKS** შენს macOS-ს, **HIREUS-EMAIL-CLIENTS** კი Brevo-ს და სატესტო წერილს. RETRO 480-ზე სამივე დაბლოკილ task-ად გაიხსნა.
- **Default:** დაბლოკილი რჩება. ერთადერთი ცვლილება ის არის, რომ Firefox-ის ხუთივე TLM-ის ვადა RETRO 510-ზე გადადის.

## Q4. პაროლის შეცვლა საერთოდ არ მუშაობს (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED, High) — root-თან
- `app/lib/auth.ts` `updatePassword` ამოწმებს მიმდინარე პაროლს და მერე ყოველთვის აგდებს "Password change is not yet implemented". საჭიროა backend-ის endpoint და დაცული ფაილის ცვლილება, ორივე loop-ის გარეთ (ROOT-REQ-PASSWORD-CHANGE-ENDPOINT). რაუნდებმა 492–494 დიალოგის accessibility გაასწორა; თავად შეცვლა ისევ ვერ ხერხდება.
- **კითხვა:** backend-ზე endpoint-ს როდის დაამატებთ? თუ დრო არ არის, ღილაკი დროებით დაიმალოს ან "Use Forgot password" ტექსტით შეიცვალოს? ეს ქცევისა და copy-ის ცვლილებაა, ამიტომ შენს ნებართვას საჭიროებს.
- **Default:** ღილაკი რჩება, High ღია რჩება root-თან და საბოლოო COMPLETE-ს ბლოკავს.

## Q5. STUDIO-PERFORMANCE-ის გაჩერებული ნაწილები და IME — მეხუთედ, ინფორმაცია
PERF-4b, 9c, 11b, 12b, 14c-ii/iii შენს დიზაინის არჩევანს ელოდება; IME-ის task-ები (TLM-SYS3-IME-PLATFORMS, TL-R444-L1-REAL-IME-SEARCH-CLEAR) რეალურ IME-ს. სტატუსი უცვლელია.
- **Default:** გაჩერებული რჩება, ახალი ვადა RETRO 510.

## Q6. წინადადებები root-ისთვის და შენთვის (loop თავად არ ცვლის)
`retros/retro-495.md` §12-ში ჩამოთვლილია:
- primitives-ის teal, შრიფტისა და focus-ის მაგალითები: ROOT-REQ-DPG-PRIMITIVES-PATCH, RC-R486-PRIMITIVE-FOCUS-EXAMPLES;
- B-ის planning attempt-ის ცარიელი result ფაილი, რის გამოც ხარჯის მონაცემი იკარგება.
- **Default:** არაფერი იცვლება; ორივე წინადადებად რჩება.
