# C round 29 — SRW-24 follow-up: ყველა ხაზის clipboard, Cut Time-ის no-op, footer, doc 034 (დამოუკიდებელი შემოწმება)

**თარიღი:** 2026-10-12 · **შემმოწმებელი:** C · **გარემო:** dev server `127.0.0.1:5173` C-ის დაწყებისას **არ მუშაობდა** (`000`, 16:51). Offline პუნქტები შევასრულე, შემდეგ server-ს დაველოდე: 17:08-ზე root-მა აღადგინა (200). ამის შემდეგ ბრაუზერის ყველა პუნქტი რეალურ Studio-ში შევამოწმე. gstack browse `c-browse.json`; `node.exe` 10–12.

**საბოლოო სტატუსი:** **PASS** ამ რაუნდის მოცულობაზე. ყველა შეცვლილი კრიტერიუმი, რომელიც რეალური UI-დან მიიღწევა, PASS-ია. ახალი ბაგი არ არის.
- **R29-NE** და **R29-NO-ის 40–41 ქვე-შემთხვევა** ბრაუზერში ვერ შესრულდა: ასეთი მონაკვეთის შექმნა რეალურ UI-ში შეუძლებელია (§4). ისინი **არ** არის PASS. დაფარულია მხოლოდ provider ტესტებით და mutation (d)-ით. ეს B-სთვის info-დონის აღმოჩენაა.
- **C-R27-01** ამ რაუნდის მოცულობაში არ შედის (D-29t, row 3, Tech Lead quiet Chrome), ამიტომ სტატუსზე არ მოქმედებს. ის ღიად რჩება (§7). round 28-ის FAIL მხოლოდ მის გამო იყო; ეს ცვლილება ჩუმი გადართვა არ არის.

Artifacts: `c-round-29/` (`gates/`, `runs/`, `shots/`, `scripts/`, `mut/`, `checkpoint.md`) და `c-round-29.json`.

## 1. შედეგები ID-ების მიხედვით

| ID | CZABA მოთხოვნა | მტკიცებულება |
|---|---|---|
| G29-1 | **PASS** | `gates/tsc.txt`, `vitest-new.txt`, `vitest-frozen7.txt`, `vitest-all.txt`, `biome-app.txt`, `build.txt` |
| G29-2 | **PASS** (start = end) | `gates/*-start.*`, `*-end.*` |
| G29-3 | **PASS** | `gates/anon-*.json`, `network-anon-*.txt`, `network-session.txt`, `curl-token.txt`, `shots/anon-*.png` |
| R29-PA | **PASS** (+ export 0 LSB) | `runs/pa.txt`, `pa-export-before.json`, `pa-export-after.json` |
| R29-PB | **PASS** | `runs/pb.txt` |
| R29-PC | **PASS** (+ loop remap, playhead remap) | `runs/pc.txt` |
| R29-PD | **PASS** (3/3) | `runs/pd.txt`, `pd3.txt` |
| R29-NO | **PASS** UI-ში მიღწევად შემთხვევებზე (zero-width, გაჩერებული და დაკვრისას). 40–41 ქვე-შემთხვევა **not run** — UI-დან მიუღწეველია (§4) | `runs/no-zero.txt`, `no-playing.txt`, `no-4041*.txt`, `no-4042-try3.txt` |
| R29-NE | **not run** — UI-დან მიუღწეველია (§4) | `runs/ne-try.txt`, `ne-range-beyond.txt` |
| R29-FT | **PASS** 1440 და 1280 | `runs/ft-geo.txt`, `shots/ft-*.png` |
| R29-UR | **PASS** PA-სა და PC-ზე; NE-ზე not run | `runs/ur-pa.txt`, `ur-pc.txt` |
| R29-K | **PASS** | `runs/k.txt`, `k-delete.txt` |
| R29-R | **PASS** | `runs/r-refusals.txt`, `r-empty-clipboard.txt`, `r-meters.txt` |
| R29-S | **PASS** | `gates/snap-*-start.diff` (= end) |
| R29-U | **PASS** | `runs/r29u-*.txt/.diff`, `r29u-snapshot-red.txt`, `scripts/mut29.mjs` |
| R29-Doc | **PASS** | doc 034 diff, §6 |
| C-R27-02 | **დახურულია** B-ის წესით: 3/3 მწვანე, `node.exe` 10 < 30 | `gates/vitest-r27batch-1..3.txt` |
| C-R23-01 | info record (უცვლელი) | `runs/c-r23-01-record.txt` |

## 2. Gates

**G29-1** (`node.exe` = 10 ყველა გაშვებისას):
- tsc: exit 0.
- ახალი ფაილი `all-lane-clipboard.test.tsx`: **14/14**.
- 7 გაყინული ფაილი: **105/105**.
- სრული vitest: **66 ფაილი, 1133/1133** (= 1119 + 14), 0 ჩავარდნა.
- build: exit 0.
- Biome `./app`: 0 error, **218 warning + 1 info** (= round 28).
- გაყინული ტესტები უცვლელია: 72/72 sha OK.

**G29-2** (start და end იდენტურია):
- HEAD `c5ed47b`.
- `git status --short` = **67** ხაზი. diff baseline-თან არის ზუსტად `?? app/lib/arrangement/__tests__/all-lane-clipboard.test.tsx`.
- `sha256sum -c b-round-28-tree-sha256.txt` → **72 OK**.
- protected **4/4 OK**.
- `Header.tsx`: +21/−0 vs `cc1e531`, HEAD-ის მიმართ diff ცარიელია. Forbidden path-ების status ცარიელია.
- Owned sha-ები start = end.
- ბრაუზერის სესიის და mutation-ების შემდეგ `store/` არ შეცვლილა. `store/node_modules` = 618 → 618 ჩანაწერი.

**G29-3:**
- **ახალი browser context** (`restart`): `auth_user` null, cookie ცარიელი.
- `/studio-lab` პირდაპირ და header-ის `Studio Lab` ბმულით: 4 ხაზის მეტრი + Master, library 21 ღილაკი.
- curl:
  - ანონიმური `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `Please sign in to access Studio.`;
  - fake Bearer → **500** `Unable to prepare Studio access`, token არ გაცემულა (ცნობილი root item).
- `/studio/middle-east` → „Sign in required“, მეტრები 0. **Premium auth bypass არ არის.**
- სესია (video drop, library drop, all-lane Cut/Copy/Paste, Cut Time, no-op, Delete, Loop, Play, 2 export): ჩემი fetch/XHR hook-ით (browser API hook, source-ს არ ვეხები) fetch-ები მხოლოდ GA collect-ია, `Authorization` **0**, body send 0.
- Network:
  - მედია მხოლოდ `middle-east.mp3`, `hero-music.mp3` და `blob:`;
  - გარდა ამისა მხოლოდ ცნობილი `GET localhost:5199/api/cart` (backend off → ERR_CONNECTION_REFUSED), GA consent-denied `page_view`/`scroll` და fonts;
  - `/api/studio-token`, `/api/recording-*`, `/api/download` და R2 host — **0**.
- Console error-ები მხოლოდ cart-ის ცნობილი შეცდომებია.

## 3. Clip ცხრილები და აუდიო (1440×900)

**Layout:** video `beeps-6s-vp9-opus.webm` 0–6.008 (სინთეზური, საკუთარი) · music `სრული მიქსი` 7–23 · SFX `Soft impact` 4–6. Music solo (ერთი history ჩანაწერი `Solo — მუსიკა`). ცხრილის ფორმატი: [lane, start, length, offset].

**R29-PA:**

| ნაბიჯი | ცხრილი / label / status |
|---|---|
| range 20–22 (detail panel) → Ctrl+Shift+L | range `allTracks:true`; footer `… · სიგრძე 00:02.000 · ყველა ხაზი · Delete = …` |
| Ctrl+X | music [7,13,0], [22,1,15]; label `Cut` |
| SFX ხაზის სახელზე click (active=sfx), seek 20, Ctrl+V | **music [20,2,13]**, SFX-ზე ახალი არაფერია; label `ჩასმა (1)`; status `ჩასმა (1): 00:20.000-ზე.` (SFX არ არის) |

- **Export** (music solo, WAV 48 kHz / 24-bit / 2ch, 23.000 s = 1 104 000 frame, NaN 0):
  - `[20,22)` cut-მდე და paste-ის შემდეგ: max |Δ| = **0 LSB** (peak 0.574);
  - `[0,20)` 0 LSB, `[22,23)` 0 LSB.
- **R29-UR (PA):** Z → cut-ის შემდგომი ცხრილი; Z → საწყისი [7,16,0]; Y, Y → paste-ის ცხრილი ზუსტად. თითო edit = ერთი ნაბიჯი.

**R29-PB:** იგივე Ctrl+C-ით, active SFX, seek 26 → **music [26,2,13]**; status `ჩასმა (1): 00:26.000-ზე.`

**R29-PC** (loop 12–18 Ctrl+L-ით, range 14–16 music-ზე, playhead 26 გაჩერებული):
- Ctrl+Shift+X:
  - music [7,7,0], [14,7,9];
  - შემდეგი კლიპი 26 → **24** (−2.000);
  - loop 12–18 → **12–16**;
  - playhead 26 → **24**;
  - status `1 ნაწილი ბუფერშია; სიცარიელე დაიხურა ყველა ხაზზე.`
- active SFX, seek 30, Ctrl+V → **music [30,2,7]**; status ხაზის გარეშე.
- **R29-UR (PC):** Z/Z/Y/Y ცხრილსა და loop-ს ზუსტად აბრუნებს და ხელახლა ასრულებს.

**R29-PD:**
1. ერთხაზიანი range 20–22, Ctrl+X, active SFX, Ctrl+V → **sfx [20,2,13]**, status `· SFX ხაზზე.` Footer-ში `ყველა ხაზი` არ არის.
2. მონიშნული music კლიპი, Ctrl+C, active SFX, seek 30, Ctrl+V → **sfx [30,16,0]**, `· SFX ხაზზე.`
3. მრავალხაზიანი window: video კლიპზე range 3–6 + Ctrl+Shift+L, Ctrl+Shift+X (2 ნაწილი: video + SFX; music 7 → 4). Ctrl+V 30-ზე, active SFX → **video [30,3,3]** და **sfx [31,2,0]**, ორიგინალ ხაზებზე; label `ჩასმა (2)`.
   - Layout განსხვავებულია round 28-ის R28-CX-ისგან (music აქ 7-ზე იწყება, ამიტომ 3–5 music-ს არ კვეთს). ორი ხაზის window ამოწმებს იმავე R9-C3 გზას.

## 4. Cut Time-ის no-op, NE და მიღწევადობა

**R29-NO, zero-width, გაჩერებული:**
- წინასწარ: SFX კლიპის Ctrl+C, playhead 20.
- zero-width range 15–15 music-ზე clip range gesture-ით: 4 px წინ, შემდეგ უკან. ეს synthetic pointer event-ებია, როგორც round 28-ში.
- Ctrl+Shift+X-ის შედეგი:
  - ცხრილი უცვლელია;
  - undo `Solo — მუსიკა` უცვლელია (history ჩანაწერი არ დაემატა);
  - pos **20**;
  - range 15–15 ჩანს footer-ში;
  - მონიშვნა უცვლელია;
  - status `Cut Time 00:15.000 — 00:15.000: ამოსაჭრელი დრო არ არის — არაფერი შეცვლილა, ბუფერი არ შეცვლილა.` (`სიცარიელე დაიხურა` არ არის).
- შემდეგი Ctrl+V (active SFX) **წინა** clipboard-ს სვამს: sfx [20,2,0].

**R29-NO, დაკვრისას:**
- Play 10-დან, zero-width 15–15, Ctrl+Shift+X.
- pos 11.451 → 11.750 → 12.251 → 12.750 (დახრილობა ≈ 1.0), `playing` true.
- source start/stop რაოდენობა უცვლელია (1/0), ანუ ნახტომი, გაჩერება და reschedule არ ყოფილა. status იგივე no-op ტექსტია.

**მიუღწევადი შემთხვევები (40–41 window და R29-NE).** ორივე საჭიროებს მონაკვეთს, რომლის შიგნით კლიპი არ არის. რეალურ UI-ში ასეთი მონაკვეთი ვერ შევქმენი:
- detail panel 40–41-ს უარყოფს: `მონაკვეთი კლიპის საზღვრებში უნდა იყოს…` (`no-4041.txt`);
- clip range gesture კლიპის საზღვარზე იჭრება: 25→30 იქცევა 25–26-ად (`ne-range-beyond.txt`);
- Undo, კლიპის გადატანა და range-ზე Delete მონაკვეთს შლიან (`no-4041-try2.txt`, `ne-try.txt`, `no-4042-try3.txt`).

ამიტომ არანულოვანი no-op და „ჩუმი ფანჯარა შემდეგი კლიპით“ მხოლოდ კოდის გზებია. მათ ფარავს provider ტესტები, ხოლო mutation (d) 40–41 ტესტში იჭერს. ბრაუზერში ისინი **not run**-ია და PASS არ არის. **B-სთვის info:** ან ჩაიწეროს, რომ ეს გზები UI-დან მიუღწეველია, ან მომავალ რაუნდში განისაზღვროს მათი მიღწევის გზა (მაგ. ruler-იდან range). ბაგი არ არის: ქცევა არასწორი არ ყოფილა, უბრალოდ ვერ მიიღწევა.

**R29-FT** (range 14–16 music-ზე, detail panel ღიაა):

| viewport | footer | range ხაზი (h / ერთი ხაზი / სიგანე) | scroller |
|---|---|---|---|
| 1440 range | 89 | 16 / 1 rect, overflow არ არის / 681 | 476 |
| 1440 ყველა ხაზი | 89 | 16 / 1 rect / 762 | 476 |
| 1280 range | 89 | 16 / 1 rect / 681 | 280 |
| 1280 ყველა ხაზი | 89 | 16 / 1 rect / 762 | 280 |

- რიცხვები ზუსტად ემთხვევა round 28-ის R28-UI-ს.
- `arrangement-range-all-lanes` მხოლოდ Ctrl+Shift+L-ის შემდეგ ჩნდება.
- Screenshot-ები: `shots/ft-range-*.png`, `shots/ft-alllane-*.png`.
- A-მ 1280-ის geometry ვერ შეამოწმა. C-მ შეამოწმა და PASS-ია.

## 5. მეზობელი ქცევა (R29-K, R29-R)

**R29-K:**
- **ყველა ხაზის Delete:** range 20–22 → Ctrl+Shift+L → Delete. შედეგი: music [7,13,0], [22,1,15]; შემდეგი კლიპები (music 28, sfx 24) ადგილზე რჩება; label `წაშლა მონაკვეთზე (ყველა ხაზი)`; Z/Y/Z ზუსტია.
  - `k.txt`-ის პირველი Delete ქვე-ნაბიჯი **არავალიდურია**: ჩემი harness-ის შეცდომით range 20–25 კლიპს გასცდა და უარყოფილი იყო. ამიტომ Delete მონიშნულ კლიპს მოხვდა. იგივე ნაბიჯი ხელახლა ვალიდურად გავიმეორე (`k-delete.txt`).
- **Ctrl+L:** `Loop შეიქმნა` → `Loop გამორთვა` (დიაპაზონი რჩება).
- **Ctrl+Shift+Delete:** ცხრილი, undo და range უცვლელია.
- **Gesture guard:** clip header-ის drag-ის დროს (`gesture:true`) Ctrl+V და Ctrl+Shift+X → `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, ცხრილი უცვლელია. ხელის აშვების შემდეგ ერთი `კლიპის გადატანა`.

**R29-R:**
- **Overlap refusal:**
  - ერთხაზიანი clipboard → `ჩასმა ვერ შესრულდა: მუსიკა ხაზზე 00:15.000–00:17.000 დაკავებულია. არაფერი შეცვლილა.`
  - ყველა ხაზის clipboard, active SFX → იგივე refusal **music**-ის სახელით (conflict-ის ხაზი სწორია).
- **ცარიელი clipboard** fresh page-ზე: Ctrl+V → `ბუფერი ცარიელია — ჯერ Copy ან Cut.`, კლიპები 0, Undo disabled. ეს round 28-დან ვალად იყო.
- **Ctrl+Shift+X range-ის გარეშე** (კლიპი მონიშნულია) → `Cut Time-ისთვის ჯერ მონიშნე მონაკვეთი (Ctrl+Shift+X).`
- **Track meters დაკვრისას:** music −6.8 / −8.6 / −9.1 / −6.9 / −7.7 dB, Master იგივე. სხვა ხაზები solo-ს გამო −∞-ზეა. Pause-ზე ყველა −∞.
- **დამატებითი, დაუგეგმავი:** Escape და ხაზის სახელზე click მონაკვეთს არ შლის, ამიტომ ერთი Ctrl+Shift+X შემთხვევით 10–12 all-lane window-ზე შესრულდა. loop 10–12 ზუსტად ფანჯარას ემთხვეოდა, ამიტომ მოიხსნა status-ით `Loop-ის დიაპაზონი … მოიხსნა`. Undo-მ ცხრილიც და loop-იც აღადგინა (`r-refusals.txt`). ეს შეესაბამება არსებულ R5-L5 კონტრაქტს და ბაგად არ ვწერ.

## 6. Static, mutation-ები და doc

**R29-S** (`diff -u` `b-round-28-snapshots`-თან):
- `clipboard.ts`, 3 hunk:
  - (1) interface `allTracks?: true`;
  - (2) `copyRangeToClipboard` flag-ს მხოლოდ `range.allTracks`-ზე ამატებს, სხვა შემთხვევაში იგივე ობიექტს აბრუნებს;
  - (3) `planClipboardPaste`-ში მხოლოდ `!clipboard.allTracks &&` პირობა.
  - `cutTimeToClipboard`, `copyClipsToClipboard` და `cutRangeFromArrangement` byte-identical-ია (hunk-ის გარეთ).
- `ArrangementContext.tsx`, 1 hunk: მხოლოდ `cutTimeSelection`:
  - `applyEdit` გადატანილია clipboard-ის ჩაწერამდე;
  - `false`-ზე: no-op status + `return`;
  - flag-იანი clipboard.
- `StudioWorkspace.tsx`, 1 hunk: `arrangement-range` პარაგრაფის span. კლასი და ფერი არ აქვს.
- hardcoded ფერი და `any`/`@ts-ignore` არ არის.
- `copySelection` და `cutSelection` ცოცხალ `range`-ს გადასცემენ (l.1658, l.1686), ამიტომ flag მიდის.
- **დამატებით შემოწმდა:** `commitHistory` (`model.ts` l.519) history-ს cap-ს ან label coalescing-ს არ აკეთებს. ამიტომ `applyEdit`-ის `false` ⇔ „არაფერი ჩაიწერა“; ფარული გზა არ არის. `cutTimeSelection` ამ boolean-ის პირველი მომხმარებელია. Fader-ის flush-ის შემთხვევაშიც `present` არ იცვლება, ამიტომ doc-ის შენიშვნა სწორია.
- A-ს §1.4 grep გავიმეორე: იგივე შედეგია (frozen `cutTimeSelection`+`pasteClipboard` მხოლოდ l.505 no-op და l.523 R9-C3-შია).

**R29-U:**
- **Scratch:** `c-round-29/mut/`, `app/`-ის ასლი, `store/node_modules`-ის junction (ბოლოს მოხსნილია `rmdir`-ით; 618 → 618).
- **Test set:** ახალი ფაილი + `delete-selection`, `delete-selection-ui`, `ArrangementContext`, `clipboard`, `gesture-guard`. Control **88/88**.
- თითო mutation ზუსტი string replace-ია count==1-ით და შემდეგ აღდგენილია (`restored=true`; ბოლოს `diff -r store/app mut/app` ცარიელია).

| mutation | მოკლული (failed tests) |
|---|---|
| (a) `planClipboardPaste` flag-ს ვერ ხედავს | 5 (pure 1, pure 4, C repro, Copy, Cut Time music) |
| (b) `copyRangeToClipboard` flag-ს არ სვამს | 4 |
| (c) `cutTimeSelection` flag-ის გარეშე ინახავს | 1 (Cut Time … pastes back on music) |
| (d) no-op playhead-ს remap-ს უკეთებს | 1 (40–41 test, playhead 45) |
| (e) no-op range-ს შლის | 2 |
| (f) no-op ძველ `სიცარიელე დაიხურა` status-ს წერს | 2 |
| (g1) single-lane-ზე `allTracks: undefined` | 1 (`Object.hasOwn`) |
| (g2) single-lane-ზე `allTracks: false` | 3 (გაყინული `delete-selection.test.ts` + `clipboard.test.ts`-ის `toEqual` + `hasOwn`) |

- **Red-first-ის გადამოწმება:** snapshot-ის 3 წყარო scratch-ში, ახალი ფაილი → **8 failed / 6 passed (14)**. ემთხვევა A-ს 8 red-ს; მე-14 Undo ტესტი guard-ია და მწვანეა.
- **პირველი mutation-ის მცდელობა არავალიდურია** (`runs/attempt1-invalid/`): `node_modules` არ იყო და config ვერ ჩაიტვირთა. `npx`-მა ამ დროს `vitest@5.0.4` npm cache-ში ჩამოტვირთა. პროექტი, lockfile და store არ შეცვლილა. ეს ჩემი deviation-ია.

**R29-Doc** (doc 034):
- Paste-ის წესის წინადადება შესწორებულია (ყველა ხაზის clipboard → ორიგინალ ხაზებზე; D-25 ერთხაზიან/კლიპების clipboard-ზე).
- Round 29 სექცია: no-op / არა no-op, footer, ფაილები, ტესტები.
- Ableton ცხრილი: Ctrl+Shift+L-ის ხაზი გასწორებულია და დაემატა 4 ხაზი §4.5-დან.
- კოდს ემთხვევა.
- **შენიშვნა B-სთვის:** doc no-op-ს „არანულოვან ფანჯარაზე“ აღწერს. რეალურ UI-ში ეს შემთხვევა მიუღწეველია (§4); doc ამას არ ახსენებს.
- სტატუსის ხაზის (l.4) შეცვლა B-ის §2.4-ის სიის გარეთაა (A-მ ეს თავად გაამჟღავნა). შინაარსობრივად უვნებელია.

## 7. Ableton-თან შესაბამისობა (§4.5)

**წყარო:** B-ის მიერ შენახული Live 12 Reference Manual (`b-round-27/ableton-*-20261012.txt`). C-მ 2026-10-12-ს ხელახლა გაფილტრა (`runs/ableton-grep.txt`):
- §42.8 `Select Material in Loop` Ctrl+Shift+L;
- §42.16 `Toggle Loop Brace` Ctrl+L, `Select Loop Brace Contents` Ctrl+Shift+L, `Cut Time` Ctrl+Shift+X, `Paste Time` Ctrl+Shift+V, `Delete Time` Ctrl+Shift+Delete;
- §6.11 „standard commands like Cut, Copy and Paste only affect the current selection“, „Paste Time places copied time into the Arrangement“;
- ჩვეულებრივი Paste-ის სამიზნე ხაზი ტექსტში **არ არის**.

ვიდეო არ გამოყენებულა.

| ქცევა | CZABA მოთხოვნა | Ableton-თან შესაბამისობა |
|---|---|---|
| ყველა ხაზის მონიშვნიდან აღებული მასალის Paste → ორიგინალ ხაზებზე | **PASS** (PA, PB) | **დაუდასტურებელი**: წყარო სამიზნე ხაზს არ ასახელებს |
| Paste Cut Time-ის შემდეგ (Ctrl+V, დროს არ ამატებს) | **PASS** (PC) | **შეგნებული განსხვავება**: Live-ს აქვს Paste Time (Ctrl+Shift+V); CZABA-ში ის არ არის და არც მოთხოვნილა |
| Cut Time, როცა შესაცვლელი არაფერია | **PASS** zero-width-ზე; არანულოვანი not run | **დაუდასტურებელი**: წყარო ამას არ აღწერს |
| Ctrl+Shift+L | **PASS** (K, FT) | **შეგნებული განსხვავება**: Live-ში დადასტურებულია როგორც Select Material in Loop / Select Loop Brace Contents; CZABA მონაკვეთს ყველა ხაზზე ავრცელებს (მომხმარებლის მოთხოვნა). B-ის round 27-ის „not confirmed“ სწორად გასწორდა |
| Delete Time Ctrl+Shift+Delete | **PASS** (ცხრილი უცვლელია) | **შეგნებული განსხვავება**: Live-ში დადასტურებულია; CZABA-ში მასზე არაფერია მიბმული |

ტესტის PASS Ableton-ის ანალოგიურობას არ ამტკიცებს.

## 8. §4.1 გადმოტანილი

- **C-R27-02:** round 27-ის 8 ფაილიანი batch სამჯერ: 152/152 ×3, `node.exe` **10** (< 30) → B-ის წესით **დახურულია**. ტესტი არ შეცვლილა.
- **C-R27-01:** ამ რაუნდში არ გაზომილა (row 3, Tech Lead quiet Chrome). ღიაა.
- **C-R23-01 (info, არც PASS, არც FAIL):** `curl /studio-lab` ×3 → 60 494 byte, **2 NUL** offset-ებზე **28013/28014**, ტექსტში `Arrangement <span class="text-dim">· \0\0მთლიანი პროექტი`. round 28-ის იდენტურია.

## 9. ღია და გადმოტანილი (უცვლელი, ახალი ბაგი არ არის)

- **C ბაგები:** C-R27-01 (Medium, Tech Lead quiet Chrome; vm-5 287.6 ms), C-R23-01 (Medium, Tech Lead), C-R6-02, C-R8-01. C-R27-02 ამ რაუნდში დაიხურა.
- **დახურული round 28-ის ბაგები:** C-R28-01 და C-R28-02 დახურულია (PA/PB/PC/PD, NO). A-R28-REVIEW-4 დახურულია (FT).
- **Low:** R26-M1, Master hold tick (stage 4), DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, R9-REVIEWER-M1-L8.
- **A review finding 1 (Low, არსებული ქცევა):** pending fader preview-ის დროს no-op Cut Time-ის შემდეგ `undoLabel` fader-ის ჩანაწერს აჩვენებს. ბრაუზერში არ შემიმოწმებია; B-მ შეიძლება დაგეგმოს.
- **Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - purchased loader middle-east-ს hardcode-ავს (SRW-21);
  - Lenis `/studio/*`-ზე;
  - portable instruction-file path-ები;
  - export-ის hard-clip 0 dBFS-ზე;
  - საბოლოო commit/push ყველაფრის შემდეგ, ხოლო ხე commit-ის გარეშეა (ახლა 67 ხაზი);
  - `Modal.tsx`-ის focus gap;
  - GA `scroll` consent denied-ის დროს;
  - 2 უცხო agent ფაილი;
  - A r17/r19/r22 deviation-ები და C-ის python probe-ები;
  - fake Bearer → 500;
  - CDP allowlist;
  - publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, final commit/push);
  - `Content-Type`-ში charset არ არის;
  - **dev server ამ რაუნდშიც ჩამოვარდნილი იყო** A-ს და C-ის დაწყებისას; root-მა 17:08-ზე აღადგინა.
- **Tech Lead manual:** სია §4.7-ის მიხედვით, R28-T გაფართოებით. იგივე PA-ც შევამოწმე headless-ში და PASS-ია, მაგრამ Tech Lead-ის ხელით შემოწმებას არ ანაცვლებს.

## 10. Deviation-ები

- Server 16:51–17:08 არ მუშაობდა. ჯერ offline პუნქტები შევასრულე, შემდეგ server-ს ერთხელ, შეზღუდული დროით დაველოდე. Server არ დამიწყია და არ გამიჩერებია.
- Range-ები, zero-width gesture, seek (ruler pointer event) და library drop (DragEvent) synthetic event-ებით კეთდება, როგორც წინა რაუნდებში. Key-ები რეალური `$B press`-ია, ხოლო ღილაკებზე click რეალური `$B click`-ია. Source instrumentation არ გამოყენებულა; React context-ს მხოლოდ ვკითხულობ.
- §3-ის layout round 28-ის layout-ს არ ემთხვევა (music 7-ზე, როგორც §4.2 ითხოვს), ამიტომ PD-3-ისთვის 3–6 window გამოვიყენე.
- `npx`-ის ჩამოტვირთვა npm cache-ში მოხდა პირველ, არავალიდურ mutation მცდელობაზე (§6).
- `browse restart`-მა დაწერა „Server failed to start within 15s“, მაგრამ შემდეგი ბრძანებები ახალ, სუფთა context-ში შესრულდა (auth null, cookie ცარიელი).
