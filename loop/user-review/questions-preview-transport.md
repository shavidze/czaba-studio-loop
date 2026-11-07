# კითხვა Saba-სთვის: preview აჩერებს თუ არა timeline-ს (Q-PREVIEW-STOPS-TRANSPORT)

თარიღი: 2026-11-07 · ავტორი: B (round 385 → 386 დაგეგმვა, D-29z1299) · წესი L44 (Live-ისგან შეგნებული განსხვავება ერთხელ მიდის Saba-სთან)

**დადასტურებული ფაქტი (Live 12 manual, Working with the Browser, „Previewing Files“, https://www.ableton.com/en/live-manual/12/working-with-the-browser/):** „By default, the Raw button is deactivated, which allows Live to preview files at the beginning of the next bar when transport is running.“ ანუ Live-ში ბიბლიოთეკის preview Arrangement-ის დაკვრას არ აჩერებს — ხმა შემდეგი bar-იდან ერთვება, გაშვებული transport-ის თანხვედრით.

**CZABA ახლა:** ბიბლიოთეკის Preview timeline-ის დაკვრას აჩერებს და მხოლოდ preview ისმის (ძველი ქცევა, `ArrangementContext.tsx` direct preview). Round 386 ცვლის მხოლოდ იმ შემთხვევას, როცა ხმა ჯერ decode-ს ელოდება: დაკვრა აღარ ჩერდება click-ზე, მხოლოდ მაშინ, როცა preview რეალურად იწყება.

**კითხვა:** დავტოვოთ ასე (Preview = timeline ჩერდება, ერთი ხმა ისმის), თუ გავხადოთ Live-ის მსგავსი (Preview ერთვება გაშვებულ timeline-ს თან, მაგ. შემდეგი bar-იდან ან მაშინვე)?

- (a) დარჩეს როგორც არის — უფრო მარტივი, მყიდველი სუფთად ისმენს ერთ ხმას.
- (b) Live-ის მსგავსად: timeline არ ჩერდება, preview ზემოდან ერთვება (ზომა: დაახლ. 1–2 რაუნდი; bar-ზე მიბმა ცალკე საკითხია).

B-ის რეკომენდაცია: (a) ახლა, (b) — STEM-LANES-ის შემდეგ, თუ Saba ისურვებს. პასუხამდე არაფერი იცვლება; სტატუსი `awaiting_user`.
