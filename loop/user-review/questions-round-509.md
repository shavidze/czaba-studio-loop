# კითხვები საბასთვის — რაუნდი 509 (დაგეგმილია 508 → 509-ზე) (2026-11-14)

## Q1. SABA-Q-509-FREE-DELIVERY — როგორ უნდა მიიღოს მომხმარებელმა უფასო (Complimentary, $0) პროდუქტი?
პროდუქტის გვერდზე "Complimentary Download" ღილაკი არაფერს აკეთებდა (B-R507-SIDEBAR-FREE-DOWNLOAD-DEAD, Medium). რაუნდი 509 მას აქცევს **"Get it free"** ღილაკად, რომელიც Buy Now-ის იმავე გზას იყენებს: ჯერ Sign in, შემდეგ $0-იანი შეკვეთა ჩვეულებრივი checkout-ით, ფაილი კი ჩნდება My Downloads-ში. ეს product-designer-ის რეკომენდაციაა.
- **Default (უკვე იგზავნება):** $0 შეკვეთა sign-in-ის შემდეგ → My Downloads.
- **ალტერნატივა 1:** ბმული e-mail-ით (Brevo), როგორც /free-downloads-ზე.
- **ალტერნატივა 2:** $0 პროდუქტები საერთოდ აღარ გვქონდეს და ღილაკი მოიხსნას.
- **გასათვალისწინებელი:** უცნობია, მიიღებს თუ არა Stripe $0-იან checkout session-ს. შეიძლება backend-მა $0 შეკვეთაზე Stripe გამოტოვოს. ეს backend-ის საკითხია და cloud-ში ვერ მოწმდება.

## Q2. SABA-Q-509-BUYNOW-FREE-LABEL — $0 პროდუქტზე header-ის "Buy Now" ღილაკსაც "Get it free" ერქვას?
product-designer-ის რეკომენდაციაა "კი": ერთ მოქმედებას ერთი სახელი უნდა ჰქონდეს. რაუნდი 509 header-ს **არ ცვლის**, რადგან ეს ყველაზე მცირე ცვლილებაა. თქვენი პასუხის შემდეგ ცალკე პატარა დავალება გაკეთდება.

## Q3. SABA-Q-509-FREE-LABEL-WORDING — "Get it free" თუ "Complimentary"?
მაღაზია $0 პროდუქტს ბარათზე, badge-ზე და /free-downloads-ზე "Complimentary"-ს უწოდებს. ახალი ღილაკის ტექსტი კი "Get it free" იქნება (product-designer: მოქმედების სახელი, რომელიც ზუსტად ამბობს, რა მოხდება).
- **Default (უკვე იგზავნება):** ღილაკზე "Get it free", სხვაგან "Complimentary" უცვლელია.
- **ალტერნატივა:** ღილაკზე "Get it — Complimentary" ან "Claim complimentary copy".
