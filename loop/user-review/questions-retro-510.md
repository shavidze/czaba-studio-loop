# RETRO 510 — კითხვები Saba-სთვის (B, 2026-11-14)

წყარო: `retros/retro-510.md` §8, `backlog.json` (D-29z1846). არცერთი კითხვა loop-ს არ აჩერებს. ყველა ნაგულისხმევი პასუხი უკვე მოქმედებს, სანამ სხვას არ იტყვი.

## Q1. ხელით შემოწმებები შენს მოწყობილობაზე — მესამე RETRO უპასუხოდ (SABA-DEVICE-CHECKS)
- SABA-B-15 / TLM-R468-SABA-SCROLL-DEVICE (სქროლი `/free-downloads`-სა და `/`-ზე, Vercel preview, mouse wheel + trackpad) კვლავ ღიაა.
- RETRO 495-ის Q2-ის ოთხი შემოწმება ორი RETRO-ის შემდეგ ამავე task-ს **ახლა შეუერთდა** (L46): TLM-R485-SR-ROUTE-ANNOUNCE (screen reader, გვერდის გადასვლის გამოცხადება), TLM-R489-SABA-ENTRANCE-FEEL (entrance-ის 3–4 წამის შეგრძნება), TLM-R489-TOUCH-SWIPE (touch swipe), TLM-R491-PHONE-NAME-EDITOR (სახელის რედაქტორი ტელეფონზე).
- **ნაგულისხმევი:** ყველა ერთ სიაშია, loop-ს არ აჩერებს, საბოლოო COMPLETE-მდე უნდა შემოწმდეს. როცა შეამოწმებ, მოკლე „OK / არა + screenshot“ საკმარისია.

## Q2. პაროლის დიალოგი screen reader-ით (TLM-R492-SR-PASSWORD-DIALOG) — პირველი RETRO ვადა
- NVDA (Windows Chrome/Firefox) და VoiceOver (macOS Safari): `/account` → Change password: „Change Password, dialog“, ველების სახელები, Show/Hide, შეცდომის გამოცხადება, Esc → focus უბრუნდება ღილაკს.
- თავად პაროლის შეცვლა ჯერ საერთოდ ვერ ხერხდება (B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED, High, root-თან: საჭიროა backend endpoint და დაცული `app/lib/auth.ts`). დიალოგის UI ამის მიუხედავად შემოწმებადია.
- **ნაგულისხმევი:** ახალი ვადა RETRO 525; თუ მაშინაც უპასუხოა, SABA-DEVICE-CHECKS-ს შეუერთდება.

## Q3. Firefox / Safari / Hire-Us e-mail / IME — სტატუსი უცვლელია
- FIREFOX-CHECKS ელოდება root-ის ROOT-REQ-PLAYWRIGHT-FIREFOX-ს; SAFARI-CHECKS — შენს macOS Safari-ს; HIREUS-EMAIL-CLIENTS — Brevo-ს და სატესტო გაგზავნას.
- IME (TLM-SYS3-IME-PLATFORMS, TL-R444-L1-REAL-IME-SEARCH-CLEAR): macOS/Windows-ზე ქართული ან იაპონური IME-ით BPM-ისა და ძებნის ველში აკრეფა და Esc. მეექვსე RETRO ვადაა.
- **ნაგულისხმევი:** ყველაფერი ვადით RETRO 525; არაფერს ბლოკავს, საბოლოო COMPLETE-მდე სჭირდება.

## Q4. root-ისთვის: ღია მოთხოვნები, რომლებიც loop-ს არ შეუძლია
- **B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High)** — backend + `auth.ts`.
- **ARCH-CHECKPOINT-ACCOUNT-PROFILE** — frontend-architect-ის checkpoint `account.tsx`-ზე პასუხი ჯერ არ არის; სანამ არ იქნება, `account.tsx`-ზე მხოლოდ Medium+ ფიქსი იგეგმება. ახალი ვადა RETRO 525.
- **ROOT-REQ-DPG-PRIMITIVES-PATCH** — `.claude/primitives/DESIGN_TOKENS.md` ჯერ კიდევ teal-ს ასახელებს (3 hit), `TAILWIND_FIRST.md` 2 hit, `FORWARDREF_COMPONENT.md`-ის focus მაგალითები `ring-2`-ია, მაშინ როცა Store-ის საერთო სტილი 1.5px outline-ია (`b-round-509/primitive-staleness.txt`). primitives loop-ის grant-ში არ არის.
- **SYS-R495-SHARED-DIALOG / ROOT-REQ-SHARED-DIALOG-GRANT** — AuthModal-ს (B-R509-AUTHMODAL-NOT-A-DIALOG, Medium) dialog-ის სემანტიკა აკლია; გამოსწორება საერთო dialog primitive-ის grant-ს ელოდება.

## Q5. round 509-ის ღია კითხვები (`questions-round-509.md`) — შეხსენება
- SABA-Q-509-FREE-DELIVERY: $0 პროდუქტი ჩვეულებრივი checkout-ით, sign-in-ის შემდეგ → My Downloads (ნაგულისხმევი, უკვე მუშაობს cloud-ში stub-ით; რეალური $0 order backend-ს ელოდება — FREE-CHECKOUT-REAL-BACKEND).
- SABA-Q-509-BUYNOW-FREE-LABEL: header-ის „Buy Now“ $0-ზეც „Buy Now“ რჩება (ნაგულისხმევი).
- SABA-Q-509-FREE-LABEL-WORDING: ბარათებზე „Complimentary“, ღილაკზე „Get it free“.

## Q6. წინადადებები (loop თავად არ ცვლის; იხ. `retros/retro-510.md` §12)
- **RETRO-ს consult სია:** retro policy `qa-engineer`-ს, `consequence-tester`-ს, `design-philosopher`-ს და `first-visit-host`-ს ითხოვს, B-ის სიაში კი ოთხი აგენტია. **ნაგულისხმევი:** სია უცვლელია; RETRO-ს ეკრანს მხოლოდ `product-designer` უყურებს.
- **A-ს pre-flight hook:** round 509-ში A-მ primitives კოდის შემდეგ წაიკითხა. წინადადება — hook-მა პირველ Edit-მდე pre-flight-ის კვალი მოითხოვოს. **ნაგულისხმევი:** არ იცვლება; A-ს task-ში ეს STOP-ის პირობად იწერება.
- **ახალი loop-ის წესები (უკვე მოქმედებს, ინფორმაციისთვის):** A-ს შეუძლია B-ის sketch-ის ტესტის გამაძლიერებელი ფიქსი რაუნდშივე (L11); სრული byte sketch მხოლოდ რისკიან კოდზე (RC-R510-SKETCH-SCOPE, საცდელად 511–525) — მიზანი B-ის ხარჯის შემცირებაა ($15.16 → ≤ $12 მედიანა).
