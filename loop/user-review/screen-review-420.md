# ეკრანისა და გზის მიმოხილვა — RETRO 420 (2026-11-09, master `6609dfa`)

**ავტორი:** B (D-29z1465). **კონსულტაცია:** `product-designer` (read-only, რეალურად გამოძახებული, 2026-11-09). `design-philosopher` და `first-visit-host` B-ის კონსულტაციების სიაში არ არიან (2026-11-04 §6), ამიტომ არ გამომიძახებია; root-ს ვთხოვ მათ დაბრუნებას STEM-LANES-ისთვის (`b-round-419.md` §7).

**სტატუსი:** მხოლოდ კანდიდატები და კითხვები. პოზიციის ცვლა Saba-ს გადაწყვეტილებაა.

## მტკიცებულება
- **სკრიპტი:** `b-round-419/screens/capture.mjs` (retro 416-ის ასლი; შეცვლილია მხოლოდ პრეფიქსი `screen420`/`journey420`). Mock API: `mock-api/server.mjs` (127.0.0.1:5199).
- **სურათები `b-round-419/screens/`-ში:** `screen420-full-{S0,DEMO}-{1440x900,1280x720}.png`; გზა: `journey420-1-product-*`, `journey420-1b-studio-arrival-*`, `journey420-2-studio-playing-*`, `journey420-3-export-*`. ტექსტი და clip-ების კოორდინატები: `screen420.json`; რაოდენობები: `capture.log`.

## შედეგი
- **416-თან შედარებით არაფერი გაუარესებულა.** მუდმივი ტექსტის ხაზები: 138 / 168 / 118 / 144 (S0 1440, DEMO 1440, S0 1280, DEMO 1280); timeline-ისა და library-ის გარეთ 97 / 124 / 86 / 101 — 416-ის ზუსტად იგივე.
- **გზა:** product page → „Try it in the Studio“ → `/studio-lab?preview=middle-east` → ოთხი stem → Play → Export. Stems ისევ ერთმანეთის მიყოლებით ჯდება (00:00/16/32/48), Export-ის დიაპაზონი 00:00 — 01:04. ეს F2-ია; ახალი ბაგი არ არის, STEM-LANES-ს ეკუთვნის (`AGREE-STEM-LANES.md`).
- ძველი კანდიდატები უცვლელია (SR-245-7, SR-275-6, SR-245-1, SR-305-7, SR-290-1/2, SR-353-3/4, SR-336-2, SR-321-4, SR-230-5/7, COPY-PD F11, STORE-4, Q-SR-385-1).

## ახალი კანდიდატები (ორივე STEM-LANES-ს ეხება)
| id | სიმძიმე | რა / სად | რატომ | ჩუმი გამოსავალი | პოზიცია? |
|---|---|---|---|---|---|
| SR-420-1 | Medium (product-designer-ის შეფასება; ბაგი არ არის — დღევანდელი ქცევა სწორად ფილტრავს) | Library-ის folder-ის ხაზი „Stems 4“ (`screen420-full-DEMO-*`) მხოლოდ ფილტრს ჰგავს | STEM-LANES ამ ხაზს set-ის დამატებას ავალებს, ეკრანზე კი ამის ნიშანი არ არის | ახალი ელემენტის გარეშე: drag cursor და tooltip „Drag to add all 4 stems“ | ქცევის კითხვა: `AGREE-STEM-LANES.md` Q1 |
| SR-420-2 | Low | 1280×720-ზე ოთხი ხაზი სივრცეს ზუსტად ავსებს (`screen420-full-DEMO-1280x720`) | 4-stem group = 8 ხაზი; set-ის ნაწილი fold-ის ქვემოთ წავა | set-ის დამატების შემდეგ group header ჩანდეს (scroll into view) | არა; STEM-LANES S4-ის მიღების ხაზი |

**არ შეიცვალოს STEM-LANES-მდე:** status „…added to the Stems track at … (nearest free spot)“ — დღეს ის ერთადერთია, რაც მიყოლებით დაკვრას ხსნის.
