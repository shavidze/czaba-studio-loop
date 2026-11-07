# შეკითხვები Saba-სთვის — PERF-13b-ii (B, 2026-11-07, round 391-ის დაგეგმვა)

## Q1. „Offline“ ნიშანი clip-ზე, რომლის ხმაც ვერ ჩაიტვირთა

- **რა ხდება ახლა (round 391-ის შემდეგ):** თუ განთავსებული clip-ის ხმა ხელახლა ვერ დაიშიფრა, Play მაინც უკრავს. ეს clip ჩუმადაა და status line-ში წერია „“X” failed to load — details are in the library.“. Export უარს ამბობს და ფაილს არ ქმნის.
- **Ableton Live 12:** manual 5.6 „Locating Missing Files“ (https://www.ableton.com/en/live-manual/12/managing-files-and-sets/#locating-missing-files). Status Bar-ში ჩნდება გაფრთხილება, clip-ები „Offline“-ად ინიშნება და Live მათ ადგილას სიჩუმეს უკრავს.
- **განსხვავება:** ჩვენ clip-ზე „Offline“ ნიშანი არ გვაქვს. გაფრთხილება მხოლოდ status line-შია.
- **კითხვა:** დავამატოთ clip-ზე „Offline“ ნიშანი, როგორც Live-შია?
- **Default (product-designer):** ახლა არა, status line საკმარისია. პასუხამდე `awaiting_user`.

## Q2 (ინფორმაციისთვის). Export, როცა clip-ის ხმა ვერ ჩაიტვირთა

Live-ის manual ამ შემთხვევას არ აღწერს (5.1.3 „Exporting Audio and Video“). ამიტომ ეს ჩვენი გადაწყვეტილებაა (D-29z1326): export უარს ამბობს, რომ ედიტორის timeline-ზე არასრული WAV არ მოხვდეს. თუ გირჩევნია, რომ export სიჩუმით გაგრძელდეს და გაფრთხილება აჩვენოს, მოგვწერე.
