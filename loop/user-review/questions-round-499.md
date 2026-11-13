# Saba-სთვის კითხვები — round 499 (DPG-BUTTON-CLEANUP-2, ეტაპი 2b-1)

B, 2026-11-13. არცერთი კითხვა ლუპს არ აჩერებს: სანამ პასუხი არ მოვა, მოქმედებს რეკომენდებული ვარიანტი. წყარო: `b-round-498/consult-product-designer.md` (product-designer).

## Q1 — SABA-Q-499-BUTTON-CASE: ღილაკების წარწერების რეგისტრი

ახლა რეგისტრი შერეულია:
- შეცდომის გვერდზე წერია „Try Again“ და „Go Home“;
- `/store`-ის შეცდომაზე წერია „Try again“;
- recordings-ის გვერდზე „Go to Downloads“-ის გვერდით წერია „Browse the store“.

ტექსტს ამ რაუნდში არ ვცვლით, რადგან ეს თქვენი გადაწყვეტილებაა.

- **რეკომენდებული (default):** ყველა ღილაკზე Title Case: „Try Again“, „Browse the Store“. ასე წერია Store-ის სხვა CTA-ებზეც.
- **ალტერნატივა:** Sentence case ყველგან: „Try again“, „Go home“.

## Q2 — SABA-Q-499-ERROR-EMPHASIS: შეცდომის გვერდზე რომელი ღილაკია მთავარი

ამ რაუნდში „Try Again“ ხდება brass pill. „Go Home“ ხდება მშვიდი ghost pill. ადგილები არ იცვლება. ადრე სიტუაცია პირიქით იყო: „Go Home“ იყო brass, „Try Again“ კი ჩარჩოიანი.

- **რეკომენდებული (default):** აღდგენა („Try Again“) მთავარია. route-ის შეცდომაზე ის ხშირად ერთადერთი ღილაკია, ხოლო `/store`-ზე „Try again“ უკვე brass-ია.
- **ალტერნატივა:** „Go Home“ რჩება მთავარი, „Try Again“ კი ghost ხდება.
