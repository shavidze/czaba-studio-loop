# B-R487-PROFILE-EDITOR-NARROW-OVERFLOW: Account Profile-ის სახელის რედაქტორი ვიწრო ეკრანზე ეტევა

**თარიღი:** 2026-11-13
**სტატუსი:** Completed (C round 491 PASS)
**შეცვლილი პროექტი:** Store (1 route, ეს დოკუმენტი, doc 315-ის ერთი TODO ხაზი)

## კონტექსტი

`/account`-ზე "Full Name"-ის რედაქტორის row არის `flex` ორი `w-40` input-ით და ორი 32 px icon ღილაკით (Save name ✓, Cancel name edit ✕), `gap-3`-ით. მისი შიგთავსი 420 px-ია. 375×812-ზე სვეტი 343 px-ია, ამიტომ ✓ და ✕ ეკრანის მარჯვენა კიდის მიღმა იყო: mouse click და touch tap ვერ აღწევდა მათ, შენახვა მხოლოდ Enter-ით და გაუქმება მხოლოდ Esc-ით შეიძლებოდა. B-მ HEAD `53ff249`-ის production build-ზე 375, 360 და 320 px-ზე დაადასტურა: ✓-ზე click და tap 0 `PUT /api/auth/profile`-ს აგზავნიდა და რედაქტორი ღია რჩებოდა. 1440 და 1280 px-ზე პრობლემა არ იყო.

მიზეზი: flex item-ის ნაგულისხმევი `min-width: auto`. Input-ისთვის ეს ავტომატური მინიმუმი `w-40`-ის 160 px-ია, ამიტომ `flex-shrink: 1`-ის მიუხედავად input-ები არ ვიწროვდებოდა და row სვეტიდან გადადიოდა.

## მიდგომა

ორივე input-ს ემატება `min-w-0`. `w-40` რჩება flex-basis-ად: სადაც ადგილი საკმარისია (≥ 420 px შიგთავსისთვის), ზომები უცვლელია. ვიწრო სვეტში ორივე input თანაბრად ვიწროვდება, ღილაკები კი 32×32-ად რჩება და row-ში ეტევა.

განხილული და უარყოფილი ვარიანტები:
- `flex-wrap`: ღილაკები ცალკე ხაზზე, input-ებისგან მოშორებით გადადიოდა და row-ის სიმაღლე იცვლებოდა.
- სვეტად დაწყობა (`flex-col` ვიწრო ეკრანზე): მეტი layout ცვლილება ერთი მიზეზისთვის.
- `min-w-0 flex-1 sm:w-40 sm:flex-none` input-ებზე და `shrink-0` ღილაკებზე: იგივე შედეგი, მაგრამ `flex-1`, `sm:*` და `shrink-0`-ის მოხსნა browser mutant-ში არაფერს ცვლიდა. ზედმეტი token-ები არ დავტოვეთ.

## არქიტექტურა

კომპონენტის სტრუქტურა, state, focus-ის წესები (round 487/488) და ტესტები უცვლელია. იცვლება მხოლოდ ორი `className`.

## შეცვლილი ფაილები

- `app/routes/account.tsx` — ორივე სახელის input-ს დაემატა `min-w-0`.
- `docs/implementation/2026/quarter-IV/315-profile-name-keyboard.md` — TODO ხაზი B-R487-PROFILE-EDITOR-NARROW-OVERFLOW-ზე ახლა ამ დოკუმენტზე მიუთითებს.
- `docs/implementation/2026/quarter-IV/317-profile-editor-narrow-overflow.md` — ეს დოკუმენტი.

## პრობლემები და გადაწყვეტები

- **Problem:** 375 px-ზე ✓/✕ ეკრანს გარეთ იყო და click/tap ვერ აღწევდა. **Solution:** `min-w-0` input-ებზე; input-ები 121.5 px-მდე ვიწროვდება (320 px-ზე 94 px-მდე), ღილაკები სვეტის მარჯვენა კიდემდე რჩება.
- **Problem:** layout-ის ცვლილება jsdom-ში ვერ მოწმდება, ხოლო class-ის assert ტესტში აკრძალულია (styling-class selector). **Solution:** ეს გეომეტრიის ცვლილებაა და მისი მტკიცებულება browser row-ია: HEAD-ის build წითელია, sketch მწვანე, ხოლო DOM mutant `min-w-0`-ის მოხსნით ისევ წითლდება.

## ტესტირება

- Browser (production build, Chromium, signed-in stub): 1440×900 და 1280×720-ზე რედაქტორის ყველა box HEAD-ის ტოლია. 375×812, 360×780 და 320×640-ზე ✓ და ✕ viewport-შია, `elementFromPoint` თავად ღილაკს აბრუნებს, mouse click და touch tap ✓-ზე 1 PUT-ს აგზავნის და რედაქტორს ხურავს, ✕ რედაქტორს ხურავს. (გვერდის ჰორიზონტალური scroll HEAD-ზეც არ იყო, რადგან row-ის ზედმეტი ნაწილი ჩამოჭრილია; ამიტომ ეს მაჩვენებელი ბაგს ვერ ავლენს და მტკიცებულებად არ გამოიყენება.)
- Mutant: `min-w-0`-ის მოხსნა browser-ში ✓/✕-ს ისევ ეკრანს გარეთ გადააქვს (375 და 320 px).
- Unit: `account-profile-name.test.tsx` (PN1–PN10h) უცვლელად მწვანეა; ახალი unit row არ ემატება, რადგან ცვლილება მხოლოდ layout-ია.

## TODO / შემდეგი ნაბიჯები

- B-R488-PASSWORD-MODAL-DIALOG (Medium): "Change password" modal-ს dialog semantics აკლდა; გამოსწორდა round 492-ში (doc 318).
- გაზომილია მხოლოდ Chromium-ში. რეალურ ტელეფონზე (iOS Safari, Android Chrome: touch, ვირტუალური კლავიატურა) და WebKit/Firefox-ში შემოწმება Tech Lead-ის ხელით შესამოწმებელ სიაშია (TLM-R491-PHONE-NAME-EDITOR).
- მუდმივი ავტომატური guard: role-ით მოძებნილი Save/Cancel-ის viewport-ში ყოფნის Playwright ტესტი 375 px-ზე (signed-in stub-ით) შემდგომი დავალებაა; დღეს smoke config-ს signed-in stub არ აქვს.
