# ეკრანისა და გზის მიმოხილვა — RETRO 353 (master `a55543b`)

**თარიღი:** 2026-11-05 · **ავტორი:** B (RETRO 353-ის დაგეგმვა) · **სტატუსი:** კანდიდატები Saba-სთვის. loop არცერთს არ ახორციელებს, სანამ პასუხი არ მოვა.

**კონსულტაცია:** `product-designer` (read-only). B-ის კონსულტაციების სიაშია; მისი შედეგი ქვემოთ, „PD-ის შეფასება“ სექციაშია. თუ სექცია ცარიელია, კონსულტაცია არ ჩატარებულა და PD-ის სახელით არაფერი იწერება. `design-philosopher` და `first-visit-host` ამ დაგეგმვის კონსულტაციების სიაში არ არის (2026-11-04-ის წესი §6: B-ისთვის მხოლოდ `product-designer`, `tech-lead`, `performance-optimizer`, `ableton-arrangement-expert`). ამიტომ მათი სახელით აზრი არ იწერება.

## როგორ გადავიღე
- Chromium (Playwright), `/studio-lab`, 1440×900 და 1280×720. ორი მდგომარეობა: ცარიელი პროექტი (S0) და demo პროექტი (DEMO).
- გზა: product page (`/products/middle-east`, mock backend `127.0.0.1:5199`, ამ რაუნდში B-მ გაუშვა და მერე გააჩერა) → „Try it in the Studio“ → `/studio-lab?preview=middle-east` → Stems ტრეკზე Night Pulse-ის ოთხი stem → Play → Export dialog.
- სკრიპტი: `b-round-352/screens/capture.mjs`. ეს არის `b-round-335/screens/capture.mjs`-ის ასლი, რომელშიც მხოლოდ ფაილის სახელები შეიცვალა (336 → 353). გადაღებამდე ბრაუზერში warm-up გაეშვა (`warmup.mjs`, L38).
- შედეგები: `b-round-352/screens/screen353.json`, `capture.log` და 12 PNG. retro 336-თან შედარება: `compare-336-353.txt` (`compare.py`).

## მთავარი: 17 რაუნდში (336–352) ეკრანზე არაფერი შეცვლილა
- ხილული ტექსტის row-ები ზუსტად იგივეა, რაც retro 336-ში: 138 / 168 / 118 / 144 (1440-S0 / 1440-DEMO / 1280-S0 / 1280-DEMO). ახალი ან დაკარგული ხაზი არ არის.
- timeline-ის გარეთ მუდმივი ტექსტის ხაზები (`outsideTimelineLib`): 97 / 124 / 86 / 101, ისევ retro 336-ის ტოლი.
- `laneErrors` არ არის. გზაში ერთადერთი განსხვავება Play-ის შემდეგ პოზიციაა. 1440-ზე `00:01.483` (336-ში `00:01.462`), 1280-ზე `00:01.491` (336-ში `00:01.471`). ეს wallclock-ის ხმაურია და ქცევის ცვლილება არ არის.
- გზაში clip-ები ოთხივე ზომაზე retro 336-ის ტოლია: Pulse / Bass / Pad / Melody, left 512 / 1152 / 1792 / 2432 px.
- 337–352 performance და ტესტის რაუნდები იყო. ისინი სიჩქარეს ცვლიდა და არა იმას, რასაც ხედავ.

## ახალი კანდიდატები
| ID | რას ვხედავ (screenshot / გაზომვა) | რატომ არის მნიშვნელოვანი | ტიპი |
|---|---|---|---|
| SR-353-1 | `journey353-2-studio-playing-1440x900.png` და `-1280x720.png`. ბოლო დამატებული clip „Night Pulse · Melody“ არჩეულია. Clip details და status line ამ clip-ს ასახელებენ („added to the Stems track at 00:48.000“). თვითონ clip კი ეკრანზე არ ჩანს: მისი left 2432 px-ია (`screen353.json` → `journey.*.clips`), viewport-ის სიგანე კი 1440 / 1280 px | მყიდველი Add-ს აჭერს, მაგრამ ვერ ხედავს, სად ჩაჯდა მისი ხმა. ეს SR-336-1-ის ეკრანული შედეგია, ერთი ადგილის ნაცვლად „nearest free spot“. STEM-LANES (Q2, დამტკიცებულია და რიგშია) stem-ებს insert marker-ზე, ცალ-ცალკე lane-ებზე ჩასვამს, და ეს შემთხვევა იქ თავისთავად ქრება. **კითხვა:** STEM-LANES-მდე საჭიროა თუ არა, რომ Add-ის შემდეგ view ახალ clip-ზე გადავიდეს? ეს view-ის ქცევაა, ამიტომ შენი პასუხის გარეშე loop არ ცვლის. Ableton-ის ქცევა ამ წერტილისთვის აქ შემოწმებული არ არის | ქცევა (Low); კითხვა |

## ძველი კანდიდატები: ისევ მართებულია (ხელახლა არ ვთავაზობ)
- **SR-336-1** (Active track-ის ხაზი insert marker 00:00-ს ასახელებს, დამატება 00:48-ზე ხდება): ისევ ასეა (`journey353-2-studio-playing-1440x900.png`; status-ის ტექსტი 336-ის ტოლია).
- **SR-336-2** (library სია არჩეულ Melody-მდე გადაიხვევა და ზედა row შუაზე იჭრება): 1440-ზე „CZABA hero — public preview“ row-ს ზედა ნაწილი ისევ მოჭრილია, screenshot-ზე ჩანს (`journey353-2-studio-playing-1440x900.png`). ეს დასკვნა screenshot-ს ეყრდნობა (L54); DOM-ში ცალკე არ გამიზომავს.
- **SR-305-3** (ჩამოსვლისას ცარიელი timeline): ისევ ასეა (`journey353-1b-studio-arrival-*.png`, `end 00:00.000`).
- **SR-305-7** (ჩამოსვლისას BPM ცარიელია, Snap გამორთულია, grid „1s“): ისევ ასეა (`journey353-1b-studio-arrival-1280x720.png`). stem-ის დამატების შემდეგ BPM 120-ია და grid 1/2 (`journey353-2-studio-playing-1440x900.png`).
- **SR-321-6** (export-ის ფაილში Middle East არ შედის, პროექტის ბოლო 01:04-ია): ისევ ასეა (`journey353-3-export-1280x720.png`: „Entire project · 00:00.000 — 01:04.000“).
- **SR-245-7** („Undo: Ad…“ იჭრება, DEMO): ისევ ასეა (`journey353-2-studio-playing-1440x900.png`). copy-ს ნაწილი COPY-PD-შია.
- **SR-290-4** (ruler-ის „0:00“ წარწერა playhead-ის/insert marker-ის ქვეშაა): ისევ ასეა (`screen353-full-S0-1440x900.png`).
- export-ის „Done“ და „LAME (mediabunny)“ ტექსტები COPY-PD-შია (რიგშია, STORE-5-ის შემდეგ). ეკრანზე ისევ ასეა (`journey353-3-export-1280x720.png`).

## PD-ის შეფასება
`product-designer` რეალურად გამოვიძახე (read-only, ფაილი არ დაუწერია), 12 PNG-ით, `compare-336-353.txt`-ით და ამ draft-ით. ქვემოთ მოცემულია **მისი აზრი**. severity-ები მისია; loop ამათგან არაფერს ახორციელებს შენი პასუხის გარეშე.

- **SR-305-3, SR-336-1, SR-336-2 ისევ მართებულია.** მისი დამატება: SR-336-2 1280-ზეც ჩანს („Full mix“ row-ის ზედა კიდე იჭრება). ეს screenshot-ს ეყრდნობა, DOM-ში არ გაზომილა (L54).
- **SR-353-1: modify** (მისი შეფასებით Medium). პრობლემას ეთანხმება, „Add-ის შემდეგ view გადავიდეს“-ს არა. თუ view 00:48-ზე გადახტება, playhead და insert marker 00:00-ზე რჩება. Follow ჩართულია, ამიტომ შემდეგი Play view-ს უკან დააბრუნებს: ერთ მოქმედებას ორი ნახტომი მოჰყვება. **მისი შეთავაზება შენთვის:** დაელოდეთ STEM-LANES-ს, სადაც ეს შემთხვევა ქრება. თუ ფიქსი მანამდე გინდა: მხოლოდ გაჩერებულ მდგომარეობაში, და მხოლოდ იმდენი, რომ clip-ის კიდე გამოჩნდეს (ცენტრირების გარეშე), ახალი ხილული ელემენტის გარეშე. Ableton Live 12-ის ქცევა: **უცნობია**, წყარო არ მოიძებნა. დადასტურება `ableton-arrangement-expert`-ს ან root-ის Live-ის გაზომვას სჭირდება.
- **უცვლელი უნდა დარჩეს:** status-ის წინადადება „…added to the Stems track at 00:48.000 (nearest free spot).“ ეს ერთადერთი პატიოსანი უკუკავშირია იმაზე, სად ჩაჯდა clip.

| ID | მისი severity | სად | რა | უფრო მშვიდი ადგილი (წინადადება/კითხვა) |
|---|---|---|---|---|
| SR-353-2 | Low | `journey353-2-studio-playing-1440x900.png`: Clip details-ის სათაური, body, status line-ის მე-2 row | „Night Pulse·Melody“ ქვედა მესამედში 3-ჯერ ჩანს (status-ის წინადადებით 4-ჯერ); start/length/source offset ორჯერ | status-ის მე-2 row მხოლოდ მაშინ, როცა Clip details დაკეცილია (1280-ზე სასარგებლოა) |
| SR-353-3 | Low | Clip details body: „The source file stays unchanged“ | მუდმივი ახსნითი წინადადება | tooltip „Source offset“-ზე ან `?` sheet |
| SR-353-4 | Low | `journey353-3-export-1280x720.png` | „Entire project · 00:00.000 — 01:04.000“ ორჯერ ჩანს (subtitle და Range); 1280-ზე Range-ის ვარიანტები ქვემოთაა მოჭრილი (screenshot-ით, DOM-ში არ გაზომილა) | subtitle-ის მოხსნა; COPY-PD-ის ნაწილებს (Done, LAME) არ იმეორებს |
| SR-353-5 | Low | Video track, „Original sound“ | მუდმივი წარწერა fader-ის ქვეშ audio-only პროექტში | fader-ის tooltip; შეამოწმე SR-321-5-თან კავშირი. შენიშვნა: 2026-10-28-ის SABA-B-8 წესი „Original sound“-ს **დატოვებულ** ელემენტებში ასახელებს, ამიტომ ეს მხოლოდ კითხვაა |

## პასუხს ელოდება
- SR-305-1…10, SR-321-1…6 და SR-336-1…2: 18 კითხვა, ყველა `awaiting_user`. SR-230, SR-245, SR-260, SR-275 და SR-290-ის დარჩენილი კანდიდატების სტატუსი `backlog.json` → `screen_review_candidates`-შია.
- ახალი: SR-353-1 … SR-353-5 (5 კითხვა/წინადადება).
