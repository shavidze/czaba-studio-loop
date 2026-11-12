# Button Component Migration

**თარიღი:** 2026-03-08
**სტატუსი:** Completed
**შეცვლილი პროექტი:** Store

## კონტექსტი

Design audit-მა გამოავლინა, რომ ბევრ ადგილას inline `<button>` ელემენტები გამოიყენებოდა custom className-ებით, ნაცვლად არსებული `Button` UI კომპონენტისა. ეს იწვევდა სტილის არათანმიმდევრობას და კოდის დუბლირებას.

## მიდგომა

1. `Button` კომპონენტს დაემატა ორი ახალი variant: `buy` და `destructive`
2. გამოვლინდა ~20-30 inline button რომელიც შესაფერისი იყო მიგრაციისთვის (171-დან)
3. პირველ ეტაპზე გადმოვიტანეთ 7 ფაილის button-ები რომლებიც პირდაპირ მეპდებოდა არსებულ variant-ებზე
4. Tab-ები, toggle-ები, icon-only button-ები და conditional-styling button-ები დარჩა inline — ეს სპეციალიზებული UI ელემენტებია

## შეცვლილი ფაილები

- `app/components/ui/Button.tsx` — დაემატა `buy` და `destructive` variant-ები
- `app/routes/account.tsx` — password modal-ის Cancel/Submit button-ები
- `app/routes/store.tsx` — Clear Filters button
- `app/routes/account.downloads.tsx` — Download, License, Studio button-ები
- `app/components/studio/DownloadDialog.tsx` — Close button
- `app/components/auth/RequireAuth.tsx` — Sign In button
- `app/components/errors/ErrorBoundary.tsx` — Try Again button

## პრობლემები და გადაწყვეტები

- **პრობლემა:** ყველა inline button არ იყო მიგრაციის კანდიდატი — tab navigation, audio control toggle-ები და icon-only button-ები სპეციფიკურ styling-ს მოითხოვენ
- **გადაწყვეტა:** მხოლოდ ის button-ები გადმოვიტანეთ რომლებიც სტანდარტულ variant-ებს შეესაბამებოდა

## ტესტირება

- `npm run build` — წარმატებით გაივლის
- `npm run check` — pre-existing warning-ები, ახალი error-ები არ დამატებულა

## TODO / შემდეგი ნაბიჯები

- Design audit Issue #3: Font family inconsistency (font-serif)
- Design audit Issue #4: Arbitrary spacing
- Design audit Issue #5: Arbitrary text sizes
