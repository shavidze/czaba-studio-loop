# ეკრანის მიმოხილვა — RETRO 495 (რაუნდები 480–494)

**ავტორი:** B, round 494 → 495 დაგეგმვა, 2026-11-13 (D-29z1768). **master:** `3bcf8cb`. კონსულტაცია: `product-designer` (`b-round-494/consult-product-designer.md`). `design-philosopher` და `first-visit-host` B-ის consult სიაში არ არიან (2026-11-04 §6), ამიტომ ამჯერად არ გამოიძახეს. ეს ფაილი მხოლოდ კანდიდატებს შეიცავს. პოზიციის ყოველი ცვლილება Saba-ს თანხმობას საჭიროებს.

## გადაღება
- სკრიპტი: `b-round-494/screens/capture.mjs` (RETRO 480-ის სკრიპტის ასლი, ახალი ფაილების სახელებით). log: `capture.log`; მონაცემები: `screen495.json`. mock API (:5199) გაეშვა პროდუქტის გვერდისთვის (`mock-api.log`).
- 12 PNG: `screen495-full-{S0,DEMO}-{1440x900,1280x720}.png` და `journey495-{1-product,1b-studio-arrival,2-studio-playing,3-export}-{1440x900,1280x720}.png`.

## ხაზების რაოდენობა (`compare-480.txt`)
| ეკრანი | ყველა ხაზი (480 → 495) | timeline-ისა და library-ის გარეთ |
|---|---|---|
| 1440×900 ცარიელი | 138 → 138 | 97 → 97 |
| 1440×900 დემო | 168 → 168 | 124 → 124 |
| 1280×720 ცარიელი | 118 → 118 | 86 → 86 |
| 1280×720 დემო | 144 → 144 | 101 → 101 |

**ფანჯარაში Studio-ს კოდი არ შეცვლილა**, ამიტომ ახალი მუდმივი ტექსტი არ დამატებულა.

## გზა: product → Studio → export
- **პროდუქტის გვერდი** (`/products/middle-east`): „Try it in the Studio“ ბმული `/studio-lab?preview=middle-east`-ს ხსნის. Middle East მონიშნული და focus-ში ჩანს. (480-ის იგივე.)
- **Studio:** ოთხი stem (Pulse, Bass, Pad, Melody) ერთ Stems lane-ზე, ერთმანეთის მიყოლებით ჯდება (`left` 512 / 1152 / 1792; მეოთხე „00:48.000 (nearest free spot)“-ზეა).
  - `product-designer`-ის შეფასებით, დაპირებას „ერთი ტრეკის stem-ები ერთად ჟღერს“ ეს არ ასრულებს.
  - ეს STEM-LANES-ის ცნობილი ხარვეზია. AGREE-STEM-LANES ისევ Saba-ს პასუხს ელოდება.
- **Export:** დიაპაზონი 00:00.000 — 01:04.000. footer მშვიდია; `product-designer`: „ნუ შეცვლი“.

## ახალი კანდიდატები
**დაფარვა:** `product-designer`-მა journey-ის 6 PNG გახსნა. ოთხი `screen495-full-*` (ცარიელი და დემო, 1440 და 1280) არ გაუხსნია; მათზე მხოლოდ ტექსტის ხაზების რაოდენობა შეადარა (`screen495.json`, `compare-480.txt`). B-მ ეს ოთხი PNG არც თავად შეაფასა. ამიტომ ქვემოთ „არცერთი“ ამ ოთხ ეკრანზე ვიზუალურ მტკიცებულებას არ ეყრდნობა.

**არცერთი.** `product-designer`-მა ახალი SR-495-* არ შექმნა. რაც ნახა, ყველაფერი უკვე ღიაა:
- SR-480-1, SR-480-2, SR-480-3;
- SR-290-1 („Time selection“ 1280-ზე footer-ის ქვეშაა მოჭრილი);
- სხვა ძველი SR-ები: `b-round-494/consult-product-designer.md` §1.

ორი საკითხი განიხილა და არ წამოჭრა: header-ის Studio ბმული და export-ის „the same graph as playback“ ტექსტი, რომელიც უკვე COPY-PD F11-შია.

## Saba-სთვის
- პოზიციის ახალი კითხვა არ არის. Q-SR-385-1 და SR-480-2 ისევ პასუხს ელოდება.
- ყველაზე მნიშვნელოვანი პასუხი: **AGREE-STEM-LANES**.
