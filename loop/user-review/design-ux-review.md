# Design & UX Review — ნაწილი 1 (D1, D2, D6) და ნაწილი 2 (D3, D4, D5)

რაუნდი 125 (ნაწილი 1) და 126 (ნაწილი 2) · შემმოწმებელი C · თარიღი 2026-10-24 · baseline `608187f` · ბრაუზერი: Playwright Chromium (headless), `http://127.0.0.1:5173/studio-lab`, 1440×900 და 1280×720, ყოველი სესია ახალ context-ში, credentials-ის გარეშე.

**კითხვა:** CZABA Studio ისეთივე კომფორტულია, როგორც Ableton Live 12 (დიზაინი, ფუნქციონალი, shortcut-ები)? და რა გახდის მას Ableton-ზე უკეთესს? ნაწილი 1 პასუხობს კომფორტისა და shortcut-ების ნახევარს რიცხვებით. ნაწილი 2 (რაუნდი 126) — ხახუნის წერტილები, „Ableton-ზე უკეთესი“ იდეები და შეჯამებული ვერდიქტი.

**Live-ის მტკიცებულების დონე:** **F** = Live 12 manual-ის ტექსტი (სექციით); **?** = manual-ში არ არის ან ორაზროვანია. Live-ის აპლიკაცია runner-ზე არ არის; მეხსიერებიდან რიცხვი არ იწერება. როცა Live = ?, „რომელია უფრო მარტივი“ არ ფასდება (**შეუდარებელი**).

## 1. ვერდიქტი

### საბოლოო ვერდიქტი (ნაწილი 2)

**1. არის თუ არა CZABA ისეთივე კომფორტული, როგორც Live 12?**
- **ფუნქციონალი — ძირითად მონტაჟში კი.** ჩასმა, გადატანა, trim, split, duplicate, zoom, loop, mute/solo და export იმავე რაოდენობის მოქმედებით სრულდება (T1–T6, T9, T11 „equal“). მარკერში CZABA უკეთესია (T10). Live უკეთესია ხაზის Volume-ის ზუსტ აკრეფაში (T8 → DUX-R-1).
- **Shortcut-ები — ნაწილობრივ.** 81-დან same 31, different 15, missing 27. Missing-ის უმეტესობა ABL-R-ებსა და DUX-R-7/8-შია. 10 მომუშავე ქცევა არსად ჩანს (DUX-R-2). AltGr-ით Split/Paste timeline-ზე info-ა (F-5).
- **დიზაინი — სუფთა და სწრაფი, მაგრამ იერარქია ბრტყელია.** ყოველი მოქმედების feedback < 100 ms-ია (F-12). Focus ring ყველა stop-ზე ჩანს (9.48–11.13:1, F-11). 12 px-ზე პატარა ტექსტი არ არის (F-10). მინუსები: ერთ ფირუზისფერს იზიარებს content, მონიშვნა და ღილაკები (F-9 → DUX-R-5); ველების საზღვარი 1.51:1-ია (DUX-B-3); არჩეული ბიბლიოთეკის სტრიქონის `muted` 4.38:1-ია (DUX-B-4); resize separator-ები 4–6 px-ია (DUX-B-2); `dim` ტექსტი 3.67:1-ია (DUX-B-1).
- **1280×720 (ლეპტოპი) — ყველაზე სუსტი ადგილი.** Detail panel არჩეულ SFX კლიპს ფარავს (5 px ჩანს). D-29b-ის კონტრაქტი სრულდება და ერთი wheel კლიპს აჩენს, ამიტომ ეს ხახუნია, არა ბაგი (D3-A → DUX-R-3).
- **პირველი ვიზიტი — Live-ზე მოკლე გზა.** ხმა 1 click-ით ისმის, კლიპი ხაზზე 1 click-ით ჯდება, export 2 click-ით იწყება (F-14). ცარიელ აუდიო ხაზში მინიშნება არ არის (DUX-R-4).
- **კლავიატურა.** Export მე-10 Tab stop-ია, მაგრამ კლიპი Tab-ით მიუწვდომელია: 82 stop-იდან 0 (F-13 → DUX-R-6).

**2. რა გახდის CZABA-ს Live-ზე უკეთესს?** Top 5 (§5): **DUX-R-5** (ფერის ერთი წესი, VISUAL-A-სთან ერთად), **DUX-R-3** (არჩეული კლიპი ყოველთვის ჩანს), **DUX-R-1** (აკრეფადი Volume, ჯგუფიც), **DUX-R-4** (პირველი ვიზიტის მინიშნებები), **DUX-R-6** (კლიპი კლავიატურით). შემდეგ: DUX-R-2 (ქართული, ძებნადი shortcut-ების ცნობარი), DUX-R-7…9.

**მტკიცებულების საზღვრები:** Live-ის აპლიკაცია runner-ზე არ არის; Live-ის ყოველი შედარება manual-ის ციტატაა (F) ან „Live ?“. ბრაუზერი მხოლოდ headless Chromium-ია (Playwright); რეალური touch, AltGr-ით ველში ტექსტის ჩაწერა, Ctrl+digit და browser-reserved კლავიშები — blocked: CDP. Subagent tool არ იყო: ექვსივე როლი (`design-philosopher`, `design-auditor`, `flow-sage`, `first-visit-host`, `ableton-arrangement-expert`, `accessibility-auditor`) checklist-ად წავიკითხე (§8). Backend-ის fake-Bearer 403 — blocked: backend unavailable in cloud.

### წინასწარი ვერდიქტი — ნაწილი 1

- **ძირითადი მონტაჟი Live-ის ტოლია:** ჩასმა drag-ით, გადატანა, trim, split, duplicate, zoom (Z/X, +/−, Ctrl+wheel), loop (Ctrl+L), mute/solo და export იმავე რაოდენობის მოქმედებით სრულდება, რასაც Live-ის manual აღწერს (T1–T6, T9, T11 — „equal“).
- **CZABA უკეთესია მარკერის დამატება-დასახელებაში:** M მაშინვე ხსნის სახელის ველს. Live-ში locator-ის დამატების შემდეგ ცალკე საჭიროა მონიშვნა და Ctrl+R (T10).
- **Live უკეთესია ხაზის Volume-ის ზუსტ მნიშვნელობაში:** Live-ში მნიშვნელობა იკრიფება (42.6). CZABA-ში −3 dB = 30 × ↓ ან ~45 px Shift-drag (T8) → **DUX-R-1**.
- **Undo ყველა შემოწმებულ ამოცანაზე ერთი ნაბიჯით აბრუნებს** მდგომარეობას (ჩასმა, გადატანა, trim, split, duplicate, Clip Gain, Volume, Solo, მარკერის წაშლა, Cut Time).
- **Shortcut-ები (81 Live ბრძანება ch.42-დან):** same 31, different 15, missing 27, არ ეხება 6, blocked: CDP 2 (Ctrl+F, Ctrl+Shift+R); CZABA-only 14. Missing-ის უმეტესობა უკვე ABL-R-ებშია (ABL-R-1, -2, -3, -7, -8, -11, -14); ახალი: S (Solo), W/H, typed Volume, F/Ctrl+Alt+F (fade), Alt+U, 0, Ctrl+J.
- **აღმოჩენადობა:** hint line ორივე viewport-ზე ერთ ხაზზე ეტევა (ტექსტის მარჯვენა კიდე 1201 px), მაგრამ 10 მომუშავე ქცევა არცერთ ეკრანზე არ ჩანს (Alt bypass, Shift-drag fine, Ctrl/Shift+click და სხვ.) → **DUX-R-2**.
- **კონტრასტი:** `dim` token (hint line, detail panel-ის label-ები) 3.67:1-ია ფონზე (pixel-ით დადასტურებული) — 4.5-ზე ნაკლები → **DUX-B-1 (Low)**; VISUAL-A-ს დაგეგმილი `dim` (#8A8276) ამას ასწორებს.
- **Ableton-თან შესაბამისობა:** ქცევითი შესაბამისობა მხოლოდ F-წყაროს მქონე სტრიქონებზეა დადასტურებული; T7-ის დაკვრის დაწყების წერტილი და Clip Gain Live-ში — დაუდასტურებელი.

## 2. კომფორტის ცხრილი Ableton-თან (D1)

დათვლა: ყველა ბილიკი ბრაუზერში გაეშვა, ახალ context-ში, მითითებული საწყისი მდგომარეობიდან (S0 = ცარიელი; „1 კლიპი“ = პულსი stems-ზე 2 წმ-ზე; S1 = §7-ის fixture). Script-ები: `c-round-125/tools/d1.cjs`; შედეგები: `c-round-125/out/d1/`. 1280-ზე T1, T6, T8, T10, T11 გამეორდა: რაოდენობა იგივეა, გარდა T8-ისა (detail panel დაკეცილია, +1 click — HR-1280-DETAIL-COLLAPSED).

| # | ამოცანა | CZABA (ყველაზე მოკლე / მხოლოდ მაუსი) | Live (F/?) | უფრო მარტივი | რატომ | feedback | აღმოჩენადობა | Undo |
|---|---|---|---|---|---|---|---|---|
| T1 | ხმის ჩასმა ხაზზე არჩეულ დროს | **1 drag** ბიბლიოთეკიდან ხაზზე (3 წმ). კლავიატურა: ხაზი + ruler + ელემენტი + Enter = 3 click + 1 key. მაუსი: 4 click (＋ დამატება) | 1 drag — §5 (F) „Dragging and dropping content from the browser into … tracks“. Enter: „onto whatever track is currently selected“ — დრო ? | equal (drag) | drag ორივეგან 1 მოქმედებაა. Enter-ის ბილიკი შეუდარებელია: Live არ ამბობს, სად ჩნდება კლიპი. | status: „„Soft impact“ დაემატა SFX ხაზზე 00:03.000-ზე.“, კლიპი მონიშნულია | საწყისი status: „აირჩიე ხაზი და დაამატე ხმა (Enter ან ＋ დამატება)“; drag არსად წერია (ABL-B-1) | 1 ნაბიჯი ✓ |
| T2 | კლიპის გადატანა (იმავე / სხვა ხაზზე) | 1 drag თავზე (+1 წმ → 3.000; SFX ხაზზე). კლავიატურა: click + → (0.1 წმ) | 1 drag — §6.7 (F); ←/→ nudge 42.16 (F); Alt — 42.13 (F) | equal | ჟესტი იგივეა. Alt Snap-ს ორივეგან აუქმებს (Snap on: 3.000 → Alt: 3.370). | status „კლიპის გადატანა: start 00:03.000 …“; → nudge-ზე status არ იცვლება, ჩანს footer-ის clip ხაზი და Undo-ს label | Alt არსად წერია | 1 ნაბიჯი ✓ |
| T3 | trim დასაწყისი/ბოლო | 1 drag კიდეზე (ბოლო −4 წმ → 12 წმ; დასაწყისი +1.5 → offset 1.5) | 1 drag — §6.7 (F) | equal | 1 drag ორივეგან. CZABA status-ში start/length/offset-ს წერს. | „Trim — მარჯვენა კიდე: … length 00:12.000 …“ | კიდის კურსორი | 1 ნაბიჯი ✓ |
| T4 | split | click კლიპის სხეულში 6 წმ-ზე (playhead + მონიშვნა) + Ctrl+E = 1 click + 1 key. მაუსი: select + ruler + ✂ Split = 3 click | §6.12 (F): click waveform-ში + Ctrl+E ან Split context menu | equal | 1 click + Ctrl+E ორივეგან. Live-ის context menu-ს CZABA-ში ანალოგი არ აქვს (კლიპზე მარჯვენა click ბადის მენიუს ხსნის). | „კლიპი გაიყო 00:06.000-ზე.“; კლიპის გარეთ: „Playhead არჩეული კლიპის შიგნით უნდა იყოს.“ | ✂ Split title (Ctrl/Cmd+E), hint line | 1 ნაბიჯი ✓ |
| T5 | duplicate | select + Ctrl+D = 1 click + 1 key (ასლი 18.000-ზე, კლიპის ბოლოს) | Ctrl+D — 42.5 (F); მაუსით ? | equal | 2 მოქმედება ორივეგან. CZABA-ში მაუსით duplicate არ არსებობს. | „დუბლირება (1): ასლები 00:18.000-დან.“ | მხოლოდ hint line | 1 ნაბიჯი ✓ |
| T6 | zoom მონიშნულზე და უკან; შორს გადასვლა | range drag + Z (40 → 137.7 px/წმ, ჩანს 4.67–16.01) + X (ზუსტად აბრუნებს). Fit 1 click (6.1 px/წმ). overview click → 108.8 წმ. Ctrl+wheel 40 → 46 | §6.2 (F): Z / X, +/−, Ctrl+wheel; overview drag, ორმაგი click = მთლიანი; W 42.16 (F) | equal | კლავიშები და რაოდენობა იგივეა. Fit CZABA-ში ღილაკია, Live-ში W (ორივე 1 მოქმედება). ABL-B-2 ცნობილია. | zoom readout; „Zoom მონიშნულზე … X აბრუნებს.“ | Z/X ღილაკები aria-keyshortcuts-ით, hint line | Undo ამ რაუნდში არ შემოწმდა; X წინა ხედს ზუსტად აბრუნებს |
| T7 | loop-ის დაყენება და მოსმენა | range drag 8→6 + Ctrl+L + Space = 3. დაკვრა playhead-იდან (1 წმ) იწყება, loop-ში 5 წმ-ში შედის და 7.85 → 6.10 ტრიალებს. მაშინვე მოსასმენად +1 ruler click (4) | §6 (F) Ctrl+L = loop მონიშვნაზე; 42.20 Space. დაკვრის საწყისი წერტილი loop-თან მიმართებით — ? | შეუდარებელი (Live ?) | Setup 3 მოქმედებაა ორივეგან. სად იწყებს Live დაკვრას, manual-ში არ წერია. | „Loop ჩანაცვლდა ახალი მონაკვეთით: 00:06.000 — 00:08.000.“, ღილაკი ანთია | ↻ Loop title, hint line | Undo ამ რაუნდში არ შემოწმდა |
| T8 | Clip Gain −3 dB, შემდეგ ხაზის Volume −3 dB | Clip Gain: ველი + Ctrl+A + „-3“ + Enter = 1 click + 4 key (1280: +1 click detail-ის გასაშლელად). **Volume: ციფრის ველი არ არის:** 30 × ↓ (0.1 dB), PageDown = −6 dB ნახტომი, drag 0.66 dB/px (91 px), Shift-drag 0.066 dB/px (~45 px). 6 px drag არაფერს ცვლის | Volume: 42.6 (F) „Type In Value 0…9“ + Enter. Clip Gain: ch.8 არ არის აღებული — ? | Volume: **Live**; Clip Gain: შეუდარებელი (Live ?) | ზუსტი −3 dB ხაზზე Live-ში იკრიფება, CZABA-ში 30 დაჭერა ან ზუსტი drag სჭირდება (DUX-R-1). | „Clip Gain: Soft impact — −3.0 dB.“; Volume readout „−6.0“ | fader-ის კლავიშები არსად წერია | Clip Gain და Volume — 1 ნაბიჯი ✓ |
| T9 | ერთი ხაზის mute, მეორის solo | 2 click (M SFX, S მუსიკა). ჩვეულებრივი S ექსკლუზიურია, Ctrl+click ამატებს | §18 (F): Track Activator, Solo; „one at a time unless Ctrl … is held“; 42.19 S (F) | equal | 2 click ორივეგან და solo-ს წესიც იგივეა. Live-ში S კლავიშიც არის, CZABA-ში — არა. | ღილაკი ანთია | Solo title „Ctrl/Cmd+click ამატებს“ | Solo — 1 ნაბიჯი ✓ |
| T10 | მარკერი playhead-ზე, სახელი, გადასვლა | ruler 7 წმ + M (სახელის ველი მაშინვე) + Ctrl+A + „Drop“ + Enter. გადასვლა: ▶ 1 click მარკერზე. Ctrl+→ კლიპის კიდეებზეც ჩერდება (1 → 4 → …) | §6 (F) Set Locator; §6.4 (F) Ctrl+R მონიშნულ locator-ზე; Previous/Next Locator | **CZABA** | CZABA-ში ერთი კლავიში ამატებს და სახელის ველს ხსნის; Live-ს ცალკე მონიშვნა + Ctrl+R სჭირდება. გადასვლა 1 click-ია ორივეგან. | „მარკერი «Drop» დაემატა: 00:07.000.“ | M ღილაკი aria-keyshortcuts=M; ◀ ▶ „Ctrl+←/→“ (R77-BUTTON-SHORTCUT-SUPERSET) | მარკერის წაშლა — 1 ნაბიჯი ✓ |
| T11 | WAV export: მთელი პროექტი; მონაკვეთი | Export + „WAV-ის ექსპორტი“ = 2 click (WAV და პროექტი default-ია). WAV: 150.372 წმ, 48 kHz / 24-bit / stereo, 1.96 წმ. მონაკვეთი: drag + 2 click (range თავად არჩეულია) → 4.000 წმ = 192000 frame | 42.3 (F) Ctrl+Shift+R; §5.1.3 (F) range time selection-იდან; „click the Export button“ | equal | 2 მოქმედება ორივეგან. Time selection ორივეგან range ხდება. ბრაუზერში Ctrl+Shift+R hard reload-ია. | dialog status „WAV შეიქმნა: 02:30.372, 24-bit · 48 kHz · stereo.“ | Export ღილაკი | export state-ს არ ცვლის |

## 3. Shortcut-ების შესაბამისობა (D2)

ყველა CZABA კლავიში 1440×900-ზე დაჭერილია S1 fixture-ში, ცვლილება წინა/შემდეგი snapshot-ით (status, clip-ები, snap, zoom, loop, მარკერები, ჯგუფები, playhead, focus, ზომები): `c-round-125/out/d2/d2-1440-main.json`, `d2-1440-redo.json`, `d2c.json`, `d2d.json`, `d2e.json`. Script: `tools/d2.cjs`, `d2c.cjs`, `d2d.cjs`, `d2e.cjs`, `d2disc.cjs`. ცხრილი JSON-ად: `out/d2/d2-table.json`. „{}“ = ხილული ცვლილება არ ყოფილა.

**ჯამი:** same 31 · different 15 · missing 27 · არ ეხება 6 · blocked: CDP 2 · CZABA-only 14 (+3 code only / გვერდითი ეფექტი).

| Live ბრძანება | Live კლავიში (ch.42 §, F) | CZABA | სტატუსი | ბრაუზერის მტკიცებულება | აღმოჩენადობა |
|---|---|---|---|---|---|
| Play/Stop | Space (42.20) | Space — Play/Stop; Stop-ის შემდეგ Space აგრძელებს გაჩერების ადგილიდან (D-15) | different | d2 transport Space: playhead 1→1.861; Space-stop 1.861→1.882 | hint line |
| Continue Play from Stop Point | Shift+Space (42.20) | Shift+Space = Space (აგრძელებს) | same | d2 Shift+Space 1.882→2.282 | none |
| Move Insert Marker to Beginning | Home (42.20) | Home → 0 (დაკვრისას 0-დან აგრძელებს) | same | d2 Home 2.282→0.388 (დაკვრისას) | hint line; ↤ ღილაკის title „დასაწყისზე (0)“ კლავიშს არ ასახელებს |
| Stop at End of Selection / Play from Insert Marker in clip | Ctrl+Space (42.20/42.16) | არაფერი | missing | d2 Ctrl+Space {} | — |
| Move Insert Marker to Playhead | Ctrl+Shift+Space (42.16) | არაფერი; CZABA-ს ერთი პოზიცია აქვს (D-15) | არ ეხება | d2 Ctrl+Shift+Space {} | — |
| Toggle Metronome | O (42.20) | არაფერი (ABL-R-1) | missing | d2 O {} | — |
| Cut | Ctrl+X (42.5) | Ctrl+X — Cut, სიცარიელე რჩება | same | d2 Ctrl+X status „Cut: 1 ნაწილი ბუფერშია“ | hint line |
| Copy | Ctrl+C (42.5) | Ctrl+C | same | d2 Ctrl+C „Copy: 1 კლიპი ბუფერშია.“ | hint line |
| Paste | Ctrl+V (42.5) | Ctrl+V — playhead-ზე აქტიურ ხაზზე; დაკავებულ ადგილზე უარი ტექსტით | same | d2 Ctrl+V „ჩასმა (1): 00:01.000-ზე“; D1 T5 უარი | hint line |
| Duplicate | Ctrl+D (42.5) | Ctrl+D — ასლი კლიპის ბოლოს | same | D1 T5 stems@18; d2 Ctrl+D | hint line |
| Delete | Delete (42.5) | Delete/Backspace — წაშლა, სიცარიელე რჩება (2026-10-11 გადაწყვეტილება) | same | d2-redo Delete/Backspace „კლიპი წაიშალა; სიცარიელე დარჩა.“ | hint line; ⌫ ღილაკის title |
| Undo | Ctrl+Z (42.5) | Ctrl+Z | same | d2 Ctrl+Z „Undo: Group Tracks“ | hint line (Undo ღილაკის title კლავიშს არ ასახელებს) |
| Redo | Ctrl+Y (42.5) | Ctrl+Y და Ctrl+Shift+Z | same | d2 Ctrl+Y / Ctrl+Shift+Z „Redo: Group Tracks“ | hint line მხოლოდ Ctrl+Shift+Z |
| Rename | Ctrl+R (42.5/42.19/6.4) | F2 (მარკერი, ჯგუფი); Ctrl+R ბრაუზერის reload-ია | different | d2 marker-F2, group-F2 → editor; Ctrl+R browser-reserved (არ გაიგზავნა) | მარკერის/ჯგუფის title, მარკერის მენიუ |
| Select All | Ctrl+A (42.5) | Ctrl+A — ყველა კლიპი | same | d2 Ctrl+A ყველა კლიპი * | hint line |
| Select multiple (nonadjacent) | Ctrl+click (42.5/42.9) | Ctrl+click კლიპზე ამატებს | same | d2c ctrlClick sfx@4*,sfx@8* | none |
| Select first-to-last | Shift+click (42.5 (F) „Select Multiple Items by First and Last Item“) | Shift+click მხოლოდ დაწკაპუნებულ კლიპს ამატებს (შუა კლიპი არა) | different | d2d shiftClickOneLane: sfx@2 → Shift sfx@13 = 2 მონიშნული, sfx@6 არა | none |
| Ignore grid while dragging | Alt (42.5/42.13) | Alt drag-ისას Snap-ს გვერდს უვლის | same | D1 T2: Snap on 3.000 → Alt 3.370 | none |
| Decrement/Increment | ↑/↓ (42.6) | fader-ზე ↑/↓ = 0.1 dB; Clip Gain fader 0.1 dB | same | d2 fader-ArrowDown 0→−0.1; d2-redo gain-ArrowUp 0.0→0.1 | none |
| Fine adjustment | Shift+↑/↓ (42.6) | Shift+↓ იგივე 0.1 dB ბიჯია | different | d2 fader-Shift+ArrowDown −0.1→−0.2 | none |
| Finer resolution when dragging | Shift drag (42.6) | Shift-drag 10-ჯერ ნელია | same | D1 T8b: −30 px → −19.8 dB; Shift −30 px → −2.0 dB | none |
| Return to Default | Delete (42.6) | Delete არაფერს აკეთებს; ორმაგი click აბრუნებს (ABL-R-14) | different | d2 fader-Delete {}; D1 T8b dblclick → 0 | Pan → C ღილაკი მხოლოდ pan-ზე |
| Type in value + Enter | 0…9, Enter (42.6) | ხაზის Volume-ს ციფრის ველი არ აქვს (Clip Gain-ს აქვს) | missing | D1 T8: −3 dB = 30×↓ ან ~45 px Shift-drag | — |
| Toggle Automation Mode | A (42.7) | A — Envelope რეჟიმი (კლიპის volume envelope) | same | d2 A „Envelope რეჟიმი: ჩართულია.“ | Env ღილაკის title, aria-keyshortcuts=A |
| Momentarily toggle fade controls | F (42.7/42.16) | არაფერი | missing | d2 F {} | — |
| Nudge loop brace | ←/→ (brace focus) (42.8) | ←/→ 0.1 წმ (Snap-ით ბადეზე) | same | d2 brace-ArrowRight 2.0→2.1 | brace aria-label |
| Move loop by loop length | ↑/↓ (42.8) | არაფერი (ABL-R-11) | missing | d2 brace-ArrowUp {} | — |
| Halve/Double loop | Ctrl+↑/↓ (42.8) | არაფერი (ABL-R-11) | missing | d2 brace-Ctrl+ArrowUp {} | — |
| Shorten/Lengthen loop | Ctrl+←/→ (42.8/42.16) | Ctrl+→ მთელ brace-ს გადაწევს; სიგრძეს Shift+→ ცვლის (ABL-R-11) | different | d2 brace-Ctrl+ArrowRight 2.1–4.2 → 2.2–4.3; Shift+→ 4.1→4.2 | brace aria-label (Shift + ← →) |
| Set loop start/end, start/end markers | Ctrl+F9…F12 (42.8) | არაფერი | missing | d2 Ctrl+F9/F10 {} | — |
| Select material in loop | Ctrl+Shift+L (42.8/42.16) | Ctrl+Shift+L მონიშვნას ყველა ხაზზე ავრცელებს (CZABA-ს მნიშვნელობა) | different | d2 Ctrl+Shift+L „მონიშვნა ყველა ხაზზე: 00:06.000 — 00:10.000.“ | hint line |
| Toggle Loop Brace / Loop Selection | Ctrl+L (42.16/6) | Ctrl+L — loop მონიშვნიდან / ჩართვა-გამორთვა | same | d2 Ctrl+L, Ctrl+L-toggle | ↻ Loop title, hint line |
| Zoom in/out | + / − (42.9/6.2) | + / − | same | d2 + 40→50 px/წმ, − 50→40 | zoom slider title, hint line |
| Zoom with Ctrl+wheel | Ctrl+wheel (6.2) | Ctrl+wheel | same | D1 T6: 40→46 px/წმ | zoom slider title, hint line |
| Zoom to selection / back | Z / X (42.16/6.2) | Z / X (ABL-B-2) | same | d2 Z „Zoom მონიშნულზე… X აბრუნებს.“, X „წინა ხედი აღდგა.“ | ღილაკების title + aria-keyshortcuts, hint line |
| Scroll left/right | Shift+scroll (42.9) | Shift+wheel ჰორიზონტალურად | same | d2c shiftWheel scrollLeft 0→400 | none |
| Follow playback | Alt+Shift+F / Ctrl+Shift+F (42.9/42.16) | Follow ღილაკი; კლავიში არ არის | missing | d2 Alt+Shift+F {}, Ctrl+Shift+F {} | Follow title |
| Optimize Arrangement Width | W (42.16) | Fit ღილაკი / ორმაგი click ruler-ზე ან overview-ზე; კლავიში არ არის | missing | d2 W {}; D1 T6 Fit 1 click | Fit title, overview title |
| Optimize Arrangement Height | H (42.16) | არაფერი | missing | d2 H {} | — |
| Hide/Show Overview | Ctrl+Alt+O (42.1) | არაფერი | missing | d2 Ctrl+Alt+O {} | — |
| Narrow/Widen grid | Ctrl+1 / Ctrl+2 (42.13) | 1 / 2 (Ctrl-ის გარეშე; Ctrl+digit ბრაუზერის tab-ია, blocked: CDP) | different | d2 1 → 0.5 წმ, 2 → 1 წმ | grid select title + aria-keyshortcuts |
| Triplet grid | Ctrl+3 (42.13) | 3 (მხოლოდ BPM-ით) | different | d2 3 „ტრიოლები მხოლოდ ტემპით — ჯერ ჩაწერე BPM (3)“ | aria-keyshortcuts „1 2 3“ BPM-ით |
| Snap to grid | Ctrl+4 (42.13) | G | different | d2 G off→on→off | Snap title + aria-keyshortcuts=G |
| Fixed/Zoom-adaptive grid | Ctrl+5 (42.13) | არაფერი (ABL-R-8) | missing | — | — |
| Draw mode | B (42.13) | არაფერი | არ ეხება | d2 B {} — MIDI/automation drawing | — |
| Split | Ctrl+E (42.16/6.12) | Ctrl+E (playhead არჩეული კლიპის შიგნით) | same | D1 T4; d2 Ctrl+E უარის ტექსტი clip-ის გარეთ | ✂ Split title, hint line |
| Consolidate | Ctrl+J (42.16) | არაფერი | missing | d2 Ctrl+J {} | — |
| Create fade | Ctrl+Alt+F (42.16) | არაფერი (fade მხოლოდ handle-ით) | missing | d2 Ctrl+Alt+F {} | — |
| Delete fades | Ctrl+Alt+Backspace (42.16) | არაფერი | missing | d2 Ctrl+Alt+Backspace {} | — |
| Insert Silence | Ctrl+I (42.16) | არაფერი (ABL-R-7) | missing | d2 Ctrl+I {} | — |
| Cut Time | Ctrl+Shift+X (42.16) | Ctrl+Shift+X | same | d2 „Cut Time 00:06.000 — 00:10.000 … სიცარიელე დაიხურა ყველა ხაზზე.“ | hint line, range line |
| Copy/Paste Time | Ctrl+Shift+C / V (42.16) | არაფერი, ტექსტიც არა (ABL-R-7) | missing | d2 {} {} | — |
| Duplicate Time | Ctrl+Shift+D (42.16) | არ სრულდება; status ხსნის (ABL-R-7) | missing | d2 „დუბლირება კლიპებზე მუშაობს; Duplicate Time არ არის.“ | status |
| Delete Time | Ctrl+Shift+Delete (42.16) | არაფერი (ABL-R-7) | missing | d2 {} | — |
| Fold/Unfold selected tracks | U (42.16/42.19) | U — მხოლოდ ჯგუფი; ჩვეულ ხაზზე ტექსტი (ABL-R-3) | different | d2 U collapse/expand; U-lane „დასაკეცად მონიშნე ჯგუფი…“ | group fold title (U), hint line |
| Unfold all | Alt+U (42.16) | არაფერი | missing | d2 Alt+U {} | — |
| Adjust track height | Alt+= / Alt+− (42.16) | არაფერი (ABL-R-2); separator-ზე ↑/↓ მუშაობს | missing | d2 Alt+= {}; height-ArrowDown 81→89 | none |
| Deactivate selection | 0 (42.16) | არაფერი | missing | d2 0 {} | — |
| Nudge selection | ←/→ (42.16/42.26) | ←/→ 0.1 წმ ან ბადის ხაზი | same | D1 T2-keys 2→2.1; d2 ArrowRight/Left | hint line „←/→“ |
| Reverse audio | R (42.16) | არაფერი | არ ეხება | d2 R {} — აუდიოს დამუშავება | — |
| Jump to track title | Esc (42.16) | Escape მონიშვნას არ ცვლის (HR-ESCAPE-NO-DESELECT) | missing | d2-redo Escape-sel {} | — |
| Snap insert marker to locators/clip edges | Ctrl+←/→ (6.6 (F)) | Ctrl+←/→ — მარკერები ∪ მონიშნული ხაზების კლიპის კიდეები (D-29z42) | same | d2 Ctrl+→ 1→4 (SFX კლიპის დასაწყისი), Ctrl+← 4→1 | ◀ ▶ title/aria-keyshortcuts ამბობს „მარკერი“ (R77-BUTTON-SHORTCUT-SUPERSET) |
| Group / Ungroup | Ctrl+G / Ctrl+Shift+G (42.19) | Ctrl+G / Ctrl+Shift+G | same | d2 Ctrl+G „ჯგუფი «ჯგუფი 2» შეიქმნა“, Ctrl+Shift+G „დაიშალა“ | group name title, hint line |
| Solo selected tracks | S (42.19) | არაფერი | missing | D1 T9-S-key; d2 S {} | — |
| Solo multiple | Ctrl+click Solo (18 (F)) | Ctrl+click Solo ამატებს; ჩვეულებრივი click ექსკლუზიურია | same | D1 T9 plain [false,true], Ctrl [true,true] | Solo title |
| Arm | C (42.19) | — | არ ეხება | recording | — |
| Insert track | Ctrl+T (42.19) | — | არ ეხება | CZABA-ს ხაზები ფიქსირებულია (ABL-R-5) | — |
| Show/Hide grouped tracks | + / − (42.19) | + / − მხოლოდ zoom-ია | different | d2 + / − zoom | — |
| Browser scroll | ↑/↓ (42.22) | ↑/↓ ბიბლიოთეკის სიაში | same | d2 option-ArrowDown middle-east→synth-mix | wave aria-label მხოლოდ preview-სთვის |
| Load selected item | Enter (42.22) | Enter — აქტიურ ხაზზე, playhead-ზე ან უახლოეს თავისუფალ ადგილზე | same | d2 option-Enter „დაემატა … 00:11.000-ზე (უახლოესი თავისუფალი ადგილი)“ | status at load, hint line |
| Preview selected file | Shift+Enter / → (42.22) | Shift+Enter ამატებს (არ უსმენს); → არაფერი; preview = Space პრევიუს ტალღაზე ან ▶ მოუსმინე | different | d2 option-Shift+Enter → clip added; d2-redo option-ArrowRight {}; wave-Space ▶→■ | preview wave aria-label |
| Close/Open folders | ←/→ (42.22) | საქაღალდე ფილტრის ღილაკია; ← არაფერი, Enter ფილტრავს | different | d2c folder: ← null, Enter → 2 option | — |
| Search in browser | Ctrl+F (42.22) | blocked: CDP / browser-reserved (ABL-R-4) | blocked: CDP | Ctrl+F ბრაუზერის ძებნაა, არ გაიგზავნა | — |
| Jump to search results | ↓ / Enter (42.22) | ↓ ძებნიდან პირველ ელემენტზე | same | d2 search-ArrowDown focus→BUTTON | — |
| Hide/Show browser | Ctrl+Alt+B (42.1/42.22) | არაფერი (ABL-R-1) | missing | d2 Ctrl+Alt+B {} | ◀ ღილაკი |
| Hide/Show clip/detail view | Ctrl+Alt+3 (42.1) | არაფერი (ABL-R-1) | missing | d2 Ctrl+Alt+3 {} | detail toggle ღილაკი |
| Hide/Show video window | Ctrl+Alt+V (42.1) | Ctrl+Alt+V = Paste (Ctrl+V-ის ფილიალი Alt-ს არ ამოწმებს) | different | d2-redo Ctrl+Alt+V „ჩასმა (1): 00:01.000-ზე“ | — |
| Close window/dialog | Esc (42.1) | Escape ხურავს Export dialog-ს | same | d2c dlgOpen true → false | dialog ✕ |
| Info View | Shift+? (42.1) | არაფერი; shortcut-ების ცნობარი არ არსებობს | missing | d2 Shift+?, ?, F1 {} | — |
| Export Audio/Video | Ctrl+Shift+R (42.3) | blocked: CDP / browser-reserved (hard reload); Export ღილაკი | blocked: CDP | ABL review Q6; CDP-ით არ გაიგზავნა | Export ღილაკი |
| New/Open/Save Set | Ctrl+N/O/S (42.3) | — | არ ეხება | Live Set ფაილები; CZABA-ში project ფაილი არ არის | — |

**CZABA-only:**

| CZABA კლავიში | ეფექტი | მტკიცებულება | აღმოჩენადობა |
|---|---|---|---|
| Enter (კლავიატურა არა-ღილაკზე) | ბიბლიოთეკის არჩეული ხმა აქტიურ ხაზზე playhead-ზე | d2 Enter-lane „დაემატა SFX ხაზზე 00:00.658-ზე“ | status, hint line |
| M | მარკერი playhead-ზე და სახელის ველი მაშინვე | D1 T10 editor true; d2 M | Add marker title + aria-keyshortcuts=M |
| მარკერზე ←/→ / Delete / Shift+F10 | მარკერის გადაწევა 0.1 წმ / წაშლა / მენიუ | d2 marker-ArrowRight 1.0→1.1; marker-Delete; menu items | marker title + aria-keyshortcuts |
| Playhead handle ←/→ | ±0.1 წმ | d2 handle-ArrowRight 1→1.1 | handle title |
| Overview ←/→ | გადახვევა 5 წმ | d2 overview-ArrowRight scroll 0→200 | overview aria-label |
| Preview wave Space/←/→/Home/End | პრევიუს ▶/■ და კურსორი 1 წმ | d2-redo wave-Space ▶↔■, → 1→2, Home 2→0 | wave aria-label |
| Separator ←/→ ↑/↓ | ბიბლიოთეკის სიგანე (+16 px), detail სიმაღლე (+16 px), ხაზის სიმაღლე (+8 px) | d2-redo libsep 288→304, detailsep 144→160; d2 height 81→89 | none |
| Shift+drag ხაზის შეცვლისას | დროის ჩაკეტვა | code only, not exercised this round (round 124 Q1 evidence) | drag-ის დროს ჩანაცვლებული hint |
| ბადის მენიუ (კლიპზე/ხაზზე მარჯვენა click): ↑/↓/Home/End/Enter, Esc/Tab | ზომის არჩევა, Snap (G) ჩართვა; Esc და Tab ხურავს | d2d gridMenuKeys: ↓ 1→0.5, End → Snap (G), Home → 10 წმ, Enter → „Snap ჩართულია“ | Snap (G) მენიუში |
| მარკერის მენიუ (მარჯვენა click ან Shift+F10): ↓/Enter, Tab | სახელი / დაკვრა აქედან / წაშლა | d2e: ↓ → „დაკვრა აქედან“, Enter → დაკვრა 9.0-დან (9.861 → 10.361); Shift+F10 ხსნის; Tab ხურავს | მენიუს ჩანაწერები (F2), (Delete) |
| ხაზის / ჯგუფის fold ღილაკზე Space | ხაზის დაკეცვა (81 → 36 px) / ჯგუფის დაკეცვა; დაკვრას არ რთავს | d2d laneFoldSpace, groupFoldSpace collapsed=true | fold title (ჯგუფზე U) |
| BPM ველი Enter / Esc | შენახვა / გაუქმება | d2d tempo: 120 Enter → „ტემპი 120 BPM …“; 90 Esc → 120 | tempo title |
| detail range ველები Enter | მონიშვნა ველებიდან (Esc დრაფტს არ აბრუნებს: ველი 8, მონიშვნა 7–9) | d2d detailRangeEnterEscape | none |
| Clip Gain ველი Esc | დრაფტის დაბრუნება | code only, not exercised this round (plan l.631; round 36 evidence) | pending ტექსტი „Enter ინახავს, Esc აბრუნებს“ |
| პრევიუს ტალღა Enter | ▶/■ (Space-ის მსგავსად) | d2d previewWaveEnter ▶ → ■ → ▶ | wave aria-label (Space) |
| გაშლილი ვიდეო: Esc / drag handle-ზე ისრები | dock-ში დაბრუნება / გადაწევა 16 px | d2d video 160 → 272 px, ArrowRight x 8 → 24, Esc → 160 | handle aria-label „ისრებით 16 px“ |
| Alt-ის გარეშე Ctrl+Alt+E | Split (AltGr-ის გვერდითი ეფექტი) | d2-redo Ctrl+Alt+E „Playhead არჩეული კლიპის შიგნით უნდა იყოს.“ | — |

### აღმოჩენადობა
- **Hint line** (`arrangement-shortcut-hint`): 12 px, `text-dim`, 19 ჩანაწერი. 1440-სა და 1280-ზე **ერთ ხაზზე ეტევა** (ბლოკი 1189 px, ტექსტის მარჯვენა კიდე 1201 px, scrollWidth = clientWidth; overflow არ არის). `title` არ აქვს. Lane drag-ის დროს მის ადგილს lane-move hint იკავებს. კონტრასტი 3.67:1 (DUX-B-1). `D2-hint-1280.png`: ხაზი მთლიანად იკითხება, ბოლოს „F2 · U“.
- **Tooltip-ები:** 29 ელემენტს აქვს კლავიშის მოხსენიება `title`-ში ან `aria-label`-ში. `aria-keyshortcuts` აქვს: Z, X, M, Ctrl+←/→, G, 1 2 (3), A და მარკერის flag-ს. Custom tooltip (`role=tooltip`) არ არსებობს, მხოლოდ native `title`.
- **Undo/Redo ღილაკების title კლავიშს არ ასახელებს** („Undo“ / „Redo“); ↤ ღილაკი — „დასაწყისზე (0)“, Home-ს არა. ეს hint line-ში ჩანს.
- **მხოლოდ ცოდნით მისაწვდომი (არცერთ ეკრანზე):** Alt (Snap bypass drag-ისას), Shift-drag fine fader-ზე, Ctrl/Shift+click მრავლობითი მონიშვნა (Shift ერთს ამატებს, არა პირველიდან ბოლომდე), ბადისა და მარკერის მენიუს კლავიატურა, Shift+Space, PageDown/↑/↓ fader-ებზე და Clip Gain fader-ზე, separator-ების ისრები, Shift+wheel, Ctrl+←/→-ის გაჩერება კლიპის კიდეებზე (ღილაკები მხოლოდ „marker“-ს ამბობს — R77-BUTTON-SHORTCUT-SUPERSET), Shift+Enter ბიბლიოთეკაში ამატებს.
- **მენიუები:** კლიპზე და ხაზზე მარჯვენა click — მხოლოდ ბადის მენიუ (ზომები + „Snap (G)“, `D2-menu-clip-1440.png`); მარკერზე — „სახელის შეცვლა (F2) / დაკვრა აქედან / წაშლა (Delete)“; ruler-სა და ხაზის header-ზე მენიუ არ არის. 1280-ზე S1-ში SFX ხაზი detail panel-ის ქვეშაა, ამიტომ მარჯვენა click panel-ს ხვდება (ნაწილი 2-ის ხახუნი).

### კონფლიქტები
- **Ctrl+Alt+V ჩასვამს, Ctrl+Alt+E ყოფს** (Ctrl-ასოს ფილიალები Alt-ს არ გამორიცხავს). Windows-ზე AltGr = Ctrl+Alt. კონტრაქტი არ არსებობს, ამიტომ ბაგად არ ჩაიწერა; ნაწილი 2 შეაფასებს. მტკიცებულება: `d2-1440-redo.json` (Ctrl+Alt+V „ჩასმა (1): 00:01.000-ზე“, Ctrl+Alt+E „Playhead არჩეული კლიპის შიგნით უნდა იყოს.“).
- **ბრაუზერის კლავიშები (blocked: CDP / browser-reserved, არ გაიგზავნა):** Ctrl+R (rename), Ctrl+F (search, ABL-R-4), Ctrl+Shift+R (export), Ctrl+1…5 (ბადე).
- **Space focus-ზეა დამოკიდებული:** პრევიუს ტალღაზე Space ბიბლიოთეკის preview-ს რთავს (▶ → ■), სხვაგან timeline-ს (INFO-C101-SPACE-A-VS-C, ცნობილი).

## 4. ხახუნის წერტილები (D3, ნაწილი 2)

რაუნდი 126 · baseline `608187f` · Playwright Chromium headless, ახალი context ყოველ სესიაში, credentials-ის გარეშე. Scrollbar-ის რიგებში `--hide-scrollbars` მოხსნილია (HR-REAL-SCROLLBARS), ამიტომ 10 px-იანი scrollbar ჩანს, როგორც ჩვეულებრივ Chrome-ში. Script-ები: `c-round-126/tools/`; შედეგები: `c-round-126/out/`; screenshot-ები: `c-round-126/shots/`. ყველა screenshot გავხსენი და აღვწერე (`c-round-126.md`).

### D3-A — SFX ხაზი detail panel-ის ქვეშ, 1280×720 (C-R125-OBS-1280-SFX-LANE-UNDER-PANEL)

**კონტრაქტი:** D-29b (`plan.md` l.255). სანამ auto-fit ჩართულია და მომხმარებელს panel-ის ზომა არ შეუცვლია, panel = min(შენახული, cap). Cap [120, 280]-ში ყველაზე დიდი სიმაღლეა, რომლითაც ყველა ხაზი auto-fit-ის მინიმუმით ჩანს. თუ ასეთი სიმაღლე არ არსებობს, panel 120 px-ია.

**Auto-fit ჩართული იყო:** ცალკე UI toggle არ აქვს (`StudioWorkspace.tsx` l.235 `autoFit: true`; ითიშება მხოლოდ ხაზის ხელით resize-ზე, l.760). გაზომვით: panel-ის გაშლისას ხაზები 80 → 61 px-მდე შემცირდა, დაკეცვისას — 70 px-მდე.

| გაზომვა (S1, 1280×720, რეალური scrollbar) | ჯგუფით (§7 S1) | ჯგუფის გარეშე (ნაბიჯი 9 გამოტოვებული) |
|---|---|---|
| detail panel rendered / `aria-valuenow` | **120 / 120** | **120 / 120** |
| scroller `clientHeight` / `scrollHeight` | 292 / 348 | 292 / 320 |
| ხაზები (top–bottom, სიმაღლე) | ვიდეო 313–366 (53) · ჯგუფის row 366–394 (28) · მუსიკა 394–455 (61) · სტემები 455–516 (61) · **SFX 516–577 (61)** | ვიდეო 313–366 · მუსიკა 366–427 · სტემები 427–488 · **SFX 488–549** |
| SFX-ის ხილული ნაწილი (scroller-ის ქვედა კიდე 521) | **5 px**; კლიპი არ ჩანს, click detail-ის header-ს ხვდება | **33 px**; კლიპის თავი ჩანს და click-ს იღებს |
| (1) wheel ხაზებზე | ✓ 1 მოქმედება: scrollTop 0 → 56 (max), SFX 460–521 სრულად ჩანს, click კლიპს ირჩევს | ✓ scrollTop → 28 (max) |
| (2) ვერტიკალური scrollbar | ✓ 1 drag: scrollTop → 56 | ✓ |
| (3) დაკეცვის ღილაკი | ✓ 1 click: panel 36, ხაზები 70 px, SFX 534–604 ჩანს | ✓ |
| (4) separator-ის drag | ✗ ქვემოთ +60 px — panel 120-ზე რჩება (120 მინიმუმია; ზემოთ drag მხოლოდ ზრდის) | ✗ |

Wheel-ის შემდეგ ვიდეოს ხაზი sticky ruler/marker/loop ზოლის ქვეშ გადადის (ჩვეულებრივი scroll), ანუ ერთდროულად ოთხივე ხაზი არ ჩანს. Headless-ში დამალული scrollbar-ით (HR-REAL-SCROLLBARS) `clientHeight` 302-ია და SFX-იდან 15 px ჩანს. Tech Lead-ის Chrome 10 px-იან scrollbar-ს აჩვენებს, ამიტომ ძირითად შედეგად რეალური scrollbar-ის 5 px-ს ვიღებ.

**ვერდიქტი (წინასწარ დაწერილი წესით, task §3 D3-A, მეორე ხაზი):** panel = 120 px (D-29b-ის fallback; 120-ზეც კი ხაზების მინიმუმები არ ეტევა) და SFX კლიპამდე wheel-ით ან scrollbar-ით 1 მოქმედებით მივდივართ → **ხახუნი, არა ბაგი**. → **DUX-R-3**.

ვინ ზარალდება: 1280-ზე მომუშავე ყველა მომხმარებელი. პარადოქსი: მომხმარებელი SFX კლიპს ირჩევს, panel-ს შლის, რომ მისი დეტალები ნახოს, და panel სწორედ ამ კლიპს ფარავს. Screenshot-ები: `D3A-S1-withGroup-real-…0431.png` (ქვემოთ მხოლოდ 5 px-იანი ფირუზისფერი ზოლი ჩანს, panel-ში კი „Soft impact · SFX“ წერია); `D3A-P1wheel-…` (SFX ხაზი და მონიშნული კლიპი ჩანს, ვიდეო ruler-ის ქვეშაა); `D3A-P3collapse-…` (ოთხივე ხაზი და ჯგუფი ჩანს).

### D3-B — გადმოტანილი საკითხები

| # | რა | სად / გაზომვა | ვინ ზარალდება | ვერდიქტი |
|---|---|---|---|---|
| F-2 | Export dialog-ის range card footer-ის ქვეშ (C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER) | 1280, S2. **Range-ის გარეშე:** disabled card 62 px-დან 45 px footer-ის ქვეშაა; card-ის შუაში click footer-ს ხვდება; ჩანს მხოლოდ 3 px (`D3B-export-1280-…0436.png`). Disabled radio Tab-ს არ იღებს. **აქტიური range-ით (6–10 წმ):** 13 px ქვეშაა, card-ის შუა click-ს იღებს; „მთელი პროექტი“-დან ↓ card-ს სრულად აჩენს (scrollTop 16, overlap 0); dialog-ის ქვესათაურშიც წერია „მონიშნული მონაკვეთი · 00:06.000 — 00:10.000“ (`…0437.png`). Wheel → scrollTop 121–153, overlap 0 | პირველად შემოსული მომხმარებელი (range-ის გარეშე ვერ ხედავს, რომ მონაკვეთის export არსებობს და როგორ ჩაირთვება) | **acceptable / ციტირება:** მთავარ შემთხვევაში (range არჩეულია) card ჩანს და მუშაობს. დამალული disabled მინიშნება ARCH-R101-MODALBODY-PADDING-SLOT / GATE102-S3-TALL-CARD-NO-CAP-ს ეკუთვნის; ახალი id არ იწერება |
| F-3 | ჯგუფის Volume-ის მნიშვნელობა ეკრანზე არ ჩანს (GROUP-VOLUME-VISIBLE-READOUT) | 1280/1440 S1: ჯგუფის row-ის ტექსტი „▣ ჯგუფი 1“; 30 × ↓-ის შემდეგ `title` „Volume −3.0 dB“, ეკრანზე კი არაფერი და status-იც უცვლელია (`D3B-group-…png`: ჯგუფის fader-ს readout არ აქვს, ხაზებს კი „+0.0“ აქვთ) | ხშირი მომხმარებელი (mix) | **DUX-R-1-ში გაერთიანდა** (ხილული და აკრეფადი readout ჯგუფზეც) |
| F-4 | 24 px-ზე პატარა სამიზნეები (`under24px.json`, 50/48) | რეალური hit area `elementFromPoint`-ით (`out/d3c/d3c-hit-*.json`): **Volume/Pan/Master fader-ები** box 4 px, მაგრამ hit 16 px (−8…+6); 2.5.8-ის spacing გამონაკლისი სრულდება. **Resize separator-ები:** ბიბლიოთეკის 4 px სიგანე, detail-ის და ხაზის სიმაღლის 6 px, hit area = box, გაზრდილი ზონა არ აქვს, მეზობელ სამიზნეებთან 12 px-ში → spacing გამონაკლისი არ სრულდება (`out/d3c/wcag258-spacing.json`: 1440 S0 6, S1 5; 1280 S0 8, S1 8 შემთხვევა). ბიბლიოთეკის საქაღალდის ▾: box 16×58, hit-ის სიგანე 16 px (`d3c-hit2-*.json`), ფილტრის ღილაკის გვერდით. 1280 S1-ის 8 შემთხვევაში შედის SFX-ის კონტროლებიც, რომლებიც panel-ის ქვეშაა (baseline-ის `vis()` scroller-ის clipping-ს არ ითვალისწინებს); ვერდიქტი პირდაპირ გაზომილ separator-ებსა და ▾-ს ეყრდნობა. **Playhead handle:** 12×20, hit მხოლოდ 7 px სიგანის, მაგრამ იგივეს ruler-ზე click აკეთებს (Equivalent). **Export radio-ები** 13×13 დიდ label-ში (Equivalent). BPM/მარკერის ღილაკები — ROOT-R65-L2, ROOT-R73-S3-MARKER-BUTTON-SIZE; envelope point — GATE83-L2-POINT-HIT-AREA (ციტირება) | მაუსით/trackpad-ით მომუშავე, მოტორიკის სირთულის მქონე მომხმარებელი; კლავიატურით ↑/↓/←/→ separator-ებზე მუშაობს, ამიტომ გამოყენებას არ ბლოკავს | **DUX-B-2 (Low)** — separator-ები და საქაღალდის ▾. დანარჩენი: acceptable (გამონაკლისი/Equivalent) ან ციტირება |
| F-5 | Ctrl+Alt+V / Ctrl+Alt+E და AltGr (C-R125-OBS-CTRL-ALT-PASTE-SPLIT) | კოდი: `shortcutLetter()` (`StudioWorkspace.tsx` l.421) ადარებს **`event.code`**-ს (KeyE → e), არა `event.key`-ს. Ctrl-ასოს ფილიალები (l.1790 Split, l.1855 Paste) `altKey`-ს არ გამორიცხავს; `isTypingTarget` (l.361) ტექსტის ველში ადრე აბრუნებს. Trusted CDP event (Ctrl+Alt, key „€“ / code KeyE; key „@“ / code KeyV): ძებნის, BPM-ის, Clip Gain-ისა და მარკერის სახელის ველში — arrangement უცვლელია (8/8; `TEXT_INPUT_TYPES` l.359 მოიცავს text/search/number-ს). **Timeline-ზე: playhead 5 მონიშნული SFX კლიპის შიგნით → კლიპი გაიყო 5.000-ზე; playhead 10 → ჩასმა 10.000-ზე.** თითოეულს 1 Undo აბრუნებს (`out/d3b/d3b-altgr2-*.json`) | AltGr-იანი განლაგების (DE/PL/HU…) მომხმარებელი, რომლის focus timeline-ზეა და „€“-ს ან „@“-ს კრეფს | **info, არა ბაგი** (task-ის წესი 3/4: ველში აკრეფისას ცვლილება არ ხდება, Undo 1 ნაბიჯია). `code`-ზე შედარება ქართული განლაგებისთვის საჭიროა. შენიშვნა B-სთვის. „€“-ის ველში ჩაწერა Ctrl-modifier-იანი CDP-ით ვერ შემოწმდა → blocked: CDP |
| F-6 | Volume fader-ის „6 px dead zone“ (C-R125-OBS-VOLUME-DEADZONE-6PX) | **Harness-ის არტეფაქტი.** ნაწილ 1-ში press გამოთვლილ thumb-ის ცენტრზე იყო. მნიშვნელობა max (0 dB) იყო, ამიტომ წერტილი input-ის მარჯვენა საზღვარზე, x = 459-ზე მოხვდა, `elementFromPoint` კი იქ მშობელ DIV-ს აბრუნებს. Input-ის შიგნით ნებისმიერი press (კიდიდან 1, 3, 6, 8 px; ტრეკის 50%, 80%) **პირველივე px-იდან** ცვლის მნიშვნელობას: −0.6, −1.2 … −3.5 dB 6 px-ზე (1440, 103 px, 0.58 dB/px); 1280-ზე −3 px = −2.0 dB (0.66 dB/px). ვერტიკალური 6 px drag არაფერს ცვლის (fader ჰორიზონტალურია) | — | **acceptable** — dead zone არ არსებობს. ნაწილ 1-ის T8-ის ფრაზა „6 px drag არაფერს ცვლის“ ამ შესწორებით იკითხება (ნაწილ 1-ის ტექსტი უცვლელია) |
| F-7 | Waveform Zoom-ის აღმოჩენადობა (WAVEFORM-ZOOM-DISCOVERABILITY) | ღილაკზე მხოლოდ „1×“ წერია, 28×24; ახსნა მხოლოდ `title`/`aria-label`-შია („Waveform Zoom 100% — მხოლოდ ხედი, ხმა არ იცვლება“) | პირველად შემოსული | **DUX-R-2-ში** (ცნობარი); ახალი id არა |
| F-8 | Shift+click (`different`, ნაწილ 1-ის D2) და Esc detail range-ის draft-ზე | Shift+click მხოლოდ დაწკაპუნებულ კლიპს ამატებს (d2d). Live 42.5 (F) „Select Multiple Items by First and Last Item“. Esc detail range-ის ველში draft-ს არ აბრუნებს (ველი 8, მონიშვნა 7–9), Clip Gain-ის ველში კი აბრუნებს (CZABA-only ცხრილი) | ხშირი მომხმარებელი | Shift+click → **DUX-R-8**; Esc → **DUX-R-9** (კონტრაქტი არ არის, ბაგი არა) |

### D3-C — ხახუნი კატეგორიების მიხედვით (S0, S1, S2; 1440 და 1280)

| # | კატეგორია | რა ვნახე / გაზომე | ვერდიქტი |
|---|---|---|---|
| F-9 | **ვიზუალური იერარქია** (`design-auditor`, `design-philosopher`) | S0 (`D3C-S0-1440-…png`, `…1280-…png`): თვალი ჯერ შევსებულ ფირუზისფერ **Export**-ზე (ზედა მარჯვენა კუთხე) გადადის, შემდეგ ფირუზისფერი ჩარჩოს **Play**-სა და „＋ დამატება“-ზე, მერე ქარვისფერ დემო badge-ზე. S1 (`D3C-S1-1440-…png`): ყველაზე ძლიერი ფირუზისფერი waveform-ებია, შემდეგ ვიდეოს thumbnail, შემდეგ მონიშნული კლიპი. **ერთი და იგივე ფირუზისფერი (rgb 18,217,200) აქვს waveform-ებს, მონიშნული კლიპის ჩარჩოს, Export-ს, Play-ს ჩარჩოს, fader-ის thumb-ებს და focus ring-ს.** მონიშვნა content-ისგან ფერით არ გამოირჩევა. Play (outline) Export-ზე (fill) სუსტია; M1 უკვე დამტკიცებულია | **DUX-R-5** (ფერი; `fitsVisualA: true`) |
| F-10 | **სიმჭიდროვე** | 12 px-ზე პატარა ტექსტი: **0** ორივე viewport-ზე (S0, S1). მოჭრილი ტექსტი: S0 — 1 (ბიბლიოთეკის სახელი 204 > 194 px, `title`-ით), S1 — 2 (Undo-ს label „Undo: Gr…“ 131 > 74 px, „Soft impact“ კლიპზე, ორივე `title`-ით). Toolbar: 1440 — ერთი ხაზი 49 px, 1280 — ორი ხაზი 87 px (baseline, ცნობილი) | acceptable |
| F-11 | **კონტრასტი, არატექსტური (1.4.11)** | **Focus ring:** ყველა Tab stop-ზე 2 px ფირუზისფერი outline: S0 67 stop, S1 82 stop, ორივე viewport-ზე. ფონთან კონტრასტი 9.48–11.13; ring არცერთ stop-ზე არ აკლია; `:focus-visible` ყველგან true. ღილაკი (Play) 10.43, slider (Volume) 10.43; lane clip-ზე ring-ის გაზომვა შეუძლებელია, რადგან კლიპი Tab stop არ არის (F-13). **ველების საზღვარი:** `border-outline` rgb(48,53,65) ფონზე rgb(17,19,24) = **1.51:1** (pixel-ით); ველის შიდა ფონი rgb(8,10,12) vs ფონი = 1.07:1, ამიტომ ცარიელ BPM ველს (placeholder-ის გარეშე) სხვა საზღვარი არ აქვს. იგივე ჩანს ძებნაზე, detail-ის ველებზე, Snap-სა და grid select-ზე. **Slider-ის შეუვსებელი ტრეკი:** 2.34:1, მაგრამ thumb და შევსებული ნაწილი 10.43-ია, ამიტომ მნიშვნელობა ჩანს | **`muted` ტექსტი (`dim`-ის გარდა):** ბიბლიოთეკის არჩეულ სტრიქონზე ტიპი და ხანგრძლივობა (12 px) rgb(129,136,152) ფონზე rgb(17,39,42) = **4.38:1**, ორივე viewport-ზე (`c-round-125/out/contrast-baseline.json`). ჯგუფის „▣“ 3.10 — icon, ≥ 3 → pass. ველების საზღვარი → **DUX-B-3 (Low)**; არჩეული სტრიქონის `muted` → **DUX-B-4 (Low)**; ღილაკების ჩარჩო acceptable (ღილაკს ტექსტი ასახელებს); slider-ის ტრეკი acceptable |
| F-12 | **Feedback** (`flow-sage`) | MutationObserver + input timestamp (`out/d3c/d3c-feedback-*.json`), ორივე viewport-ზე: **add** — კლიპი და status 6–8 ms-ში; **move** — კლიპი პირველი pointer move-იდან 21–23 ms-ში მოძრაობს, pointerup-იდან status 4 ms-ში; **trim** — იგივე (21 / 4 ms); **Undo** — 4 ms (კლიპი + status); **mute** — ღილაკის `aria-pressed`/ფერი 3.6 ms-ში, status **არ** იცვლება; **export start** — footer 0.5–2 ms-ში, WAV 2 წმ-ში და შედეგის ხაზი dialog-ში. Status ერთადერთი feedback არცერთ შემთხვევაში არ არის | acceptable |
| F-13 | **კლავიატურა და focus** (`accessibility-auditor`) | Tab გვერდის ჩატვირთვიდან (S0): **Export — მე-10 stop**; პირველი ხაზის კონტროლი — 38-ე stop; 67 stop-ის შემდეგ focus BODY-ზე ბრუნდება. S1-ში (ზედა მარცხენა წერტილიდან): 82 stop, Export მე-14-ე; **lane clip არცერთი stop არ არის** (ArrangementClip-ს `tabIndex`/role არ აქვს). კლიპი კლავიატურით მხოლოდ Ctrl+A-ით (ყველა) ან Enter-ით (ახლის დამატება) ირჩევა | კონტრაქტი ან მიღებული WCAG წესი (§4-ის სია) არ ირღვევა → **DUX-R-6**. Ring-ის ნაკლებობა არ არის, Medium არ იწერება |
| F-14 | **პირველი ვიზიტის სიცხადე** (`first-visit-host`) | ახალი S0, წინასწარი ცოდნის გარეშე (`out/d3c/d3c-first-*.json`, ორივე viewport): (a) **ხმა ისმის: 1 click** „▶ მოუსმინე“ (რეალურ output-ზე peak 0.374); Play ცარიელ პროექტზე ჩუმია და მკაფიოდ ხსნის: „დასაკრავი არაფერია — ჯერ ბიბლიოთეკიდან დაამატე კლიპი.“ (b) **კლიპი ხაზზე: 1 click** „＋ დამატება“ (მუსიკის ხაზი და ბიბლიოთეკის ჩანაწერი წინასწარ არჩეულია) → „Middle East“ 0-ზე. (c) **Export: 2 click** → WAV 101.352 წმ, 48 kHz / 24-bit / stereo, 4 864 896 frame, NaN 0; dialog-ში შედეგი ჩნდება: „გადატვირთვა: პიკი +0.0 dBFS — 14 sample შეიზღუდა“ — ერთი დემო კლიპი default-ზეც ამ გაფრთხილებას იწვევს. **სად შეიძლება გაჭედოს:** მუსიკის, სტემებისა და SFX-ის ცარიელ ხაზებში მინიშნება არ არის, ვიდეოს ხაზში კი არის („ვიდეო არ არის — „＋ საკუთარი ვიდეო“ ან ჩააგდე ფაილი აქ“); drag არსად წერია. Undo/Redo/Split/წაშლა/Loop disabled-ია და `title` მხოლოდ ქმედებას ასახელებს, მიზეზს არა (Split: „გაყოფა playhead-ზე (Ctrl/Cmd+E)“); Zoom-ის, მეტრონომისა და detail ველების `title` მიზეზს ამბობს. Demo badge („დემო კოლექცია — ავტორიზაცია არ სჭირდება“) მკაფიოა | **DUX-R-4** (ცარიელი ხაზის მინიშნება + disabled-ის მიზეზი); export-ის გაფრთხილება acceptable (სიმართლეა და გამოსწორების გზას ამბობს) |

## 5. „Ableton-ზე უკეთესი“

ნაწილი 2 (Round 126). ნაწილი 1-ში ჩაწერილი იდეები (არაფერი ხორციელდება Saba-ს დასტურამდე — `user-review/design-ux-decisions.md`):

| ID | რა | რატომ (Live-თან) | ზომა (რაუნდი) | პრიორიტეტი | VISUAL-A-ს ფარგლებში? |
|---|---|---|---|---|---|
| DUX-R-1 | ხაზის Volume-ის (და Master-ის) ციფრით აკრეფა readout-ზე click-ით, Clip Gain-ის ველივით: −3, Enter | Live 42.6 (F) მნიშვნელობის აკრეფას იღებს. CZABA-ში −3 dB = 30 × ↓ ან ~45 px Shift-drag (T8). Live-ს გაუთანაბრდება ყველაზე ნელ ნაბიჯში | 1 | Medium | არა — ქცევის ცვლილება |
| DUX-R-2 | Shortcut-ების ცნობარი (მაგ. `?` ან ღილაკი hint line-თან), სადაც ყველა კლავიში ჩანს, მათ შორის ის 10, რაც დღეს არსად წერია | Live-ს Info View და მენიუები აქვს. Hint line 19 ჩანაწერს აჩვენებს, 10 მომუშავე ქცევა კი არცერთ ეკრანზე არ ჩანს. Live-ზე უკეთესი იქნება, თუ ქართულად და ძებნადი იქნება | 1 | Low | არა — ახალი UI |

### ნაწილი 2 — ახალი იდეები (D4, რაუნდი 126)

**წესები:** თითო იდეა ეყრდნობა D3-ის ან ნაწილ 1-ის ბრაუზერის მტკიცებულებას. Live-ის ქცევა მითითებულია მხოლოდ manual-ის ციტატით (**F**); სადაც ციტატა არ არის, წერია **Live ?** (მეხსიერებიდან არაფერი იწერება). `fitsVisualA` = true მხოლოდ მაშინ, როცა იდეა მხოლოდ ფერს, icon-ს ან typography-ს ცვლის. **არცერთი იდეა Saba-ს დასტურამდე არ ხორციელდება** (`user-review/design-ux-decisions.md`).

| ID | რა | რატომ (Live-თან) | დღეს CZABA-ში (მტკიცებულება) | ზომა (რაუნდი) | პრიორიტეტი | VISUAL-A-ს ფარგლებში? |
|---|---|---|---|---|---|---|
| DUX-R-3 | **არჩეული კლიპი ყოველთვის ჩანდეს.** როცა კლიპს ვირჩევთ, detail panel-ს ვშლით ან ხაზს ვააქტიურებთ, მისი ხაზი არ ჩანს, timeline თავისით უნდა გადაიწიოს ისე, რომ ხაზი გამოჩნდეს (ან 1280-ზე panel თავად დაიკეცოს) | Live ? — manual-ის შენახულ ტექსტში ასეთი ქცევა არ არის. Live-ზე უკეთესი იქნება, რადგან CZABA-ს detail panel და timeline ერთ სვეტს იყოფს და მცირე ეკრანზე სწორედ ეს ფარავს კლიპს | D3-A: 1280-ზე SFX კლიპის არჩევა + panel-ის გაშლა → SFX ხაზიდან 5 px ჩანს; ერთი wheel აჩენს (`D3A-S1-withGroup-real-…png`). D-29b სწორად მუშაობს — ეს მისი ფარგლების შემდეგი ნაბიჯია | 1 | **Medium** | არა — ქცევა |
| DUX-R-4 | **პირველი ვიზიტის მინიშნებები:** (a) ცარიელ აუდიო ხაზში მკრთალი ტექსტი, მაგ. „ჩააგდე ხმა ბიბლიოთეკიდან ან ＋ დამატება“ (ვიდეოს ხაზს ასეთი უკვე აქვს); (b) disabled ღილაკების `title` მიზეზს ამბობდეს (Split: „ჯერ აირჩიე კლიპი და playhead მის შიგნით“; Undo: „ჯერ არაფერი შეცვლილა“), როგორც ეს Zoom-სა და მეტრონომს უკვე აქვს | Live ? (ცარიელი track-ის ტექსტი შენახულ capture-ში არ არის). CZABA-ს მომხმარებელი ფილმის მემონტაჟეა და DAW შეიძლება პირველად ხედავდეს; drag დღეს არსად წერია (ნაწილი 1, T1) | D3-C F-14: სამ აუდიო ხაზში ტექსტი 0 სიმბოლოა, ვიდეოში — მინიშნება; Split/Undo/Redo/Loop/წაშლის `title` მიზეზს არ ამბობს (`out/d3c/d3c-disabled-*.json`) | 0.5 | **Medium** | არა — ახალი ტექსტი |
| DUX-R-5 | **content-ისა და აქცენტის ფერის გაყოფა:** waveform-ები ნეიტრალური / ხაზის content-ის ფერით; `brand` მხოლოდ მონიშვნისთვის, playhead-ის, ძირითადი ქმედებისა და focus-ისთვის. Waveform-ის ფერი VISUAL-A-ში ჯერ განსაზღვრული არ არის (`visual-direction-a.md` l.46: brand = „ერთადერთი აქცენტი: playhead, არჩეული კლიპი, ძირითადი ქმედება, focus“) | Live ? (Live-ის კლიპის ფერის წესი შენახულ capture-ში არ არის). M5 (ხაზების ფერები) **არ** არის — ეს იდეა მხოლოდ waveform-ს ნეიტრალურს ხდის. `design-philosopher`: „ერთი გააზრებული აქცენტი“ | F-9: ერთი ფირუზისფერი (rgb 18,217,200) აქვს waveform-ებს, მონიშნულ კლიპს, Export-ს, Play-ს, fader-ებს და focus-ს (`D3C-S1-1440-…png`) | 0.5 (V-1-ში) | **High** | **დიახ** — მხოლოდ ფერი |
| DUX-R-6 | **კლიპების არჩევა კლავიატურით:** კლიპი Tab-ით ან ისრით მისაწვდომი იყოს (მაგ. აქტიური ხაზის კლიპებზე სვლა), ხილული ring-ით; არჩევის შემდეგ ←/→ nudge, Ctrl+E, Delete და სხვა კლავიშები ისე მუშაობს, როგორც დღეს | Live 42.2 (F): „Move Focus to the Arrangement View Alt 2“; „Move to Next Focusable Control Tab“ (Tab-ით გადაადგილება Settings-იდან ირთვება). კლიპიდან კლიპზე სვლის კლავიში შენახულ ტექსტში არ არის → ამ ნაწილში Live ? | F-13: S1-ში 82 Tab stop-დან კლიპი 0-ია; კლიპი კლავიატურით მხოლოდ Ctrl+A-ით (ყველა) ირჩევა. `accessibility-auditor`-ის checklist-ში WCAG 2.1.1 წერია, მაგრამ task §4-ის მიღებულ წესებში არ არის | 1–2 | **Medium** | არა — ქცევა |
| DUX-R-7 | **Live-ის მარტივი კლავიშები:** S — მონიშნული ხაზის Solo; W — Fit (ზომის ოპტიმიზაცია სიგანეზე); H — ხაზების სიმაღლე auto-fit-ზე; Alt+U — ყველა ჯგუფის/ხაზის გაშლა; Alt+Shift+F — Follow | 42.19 (F) „Solo Selected Tracks S“; 42.16 (F) „Optimize Arrangement Width W“, „Optimize Arrangement Height H“, „Unfold All Tracks Alt U“; 42.9 (F) „Scroll Display to Follow Playback Alt Shift F“ | ნაწილი 1 D2: S, W, H, Alt+U, Alt+Shift+F — ყველა `{}` (არაფერს აკეთებს). **კოლიზია:** CZABA-ში არცერთი არ არის მიბმული (CZABA-only: M, U, G, A, Z/X, 1/2/3, Enter); Chrome-ის ცნობილ accelerator-ს არცერთი არ ემთხვევა; ასოები ტექსტის ველში ისედაც იგნორირდება (`isTypingTarget`) | 1 | Low | არა — ქცევა |
| DUX-R-8 | **Shift+click პირველიდან ბოლომდე:** ერთ ხაზზე Shift+click მონიშნავს ყველა კლიპს ბოლოს არჩეულიდან დაწკაპუნებულამდე (Ctrl+click ცალკეს რჩება) | 42.5 (F) „Select Multiple Items by First and Last Item: Shift click“ | ნაწილი 1 D2 `different`: Shift+click მხოლოდ დაწკაპუნებულს ამატებს (d2d: sfx@2 → Shift sfx@13 = 2, sfx@6 არა) | 0.5 | Low | არა — ქცევა |
| DUX-R-9 | **Esc ყველა ველში draft-ს აბრუნებს:** detail range-ის ველებიც Clip Gain-ის ველივით | Live ? | ნაწილი 1 CZABA-only: range ველზე Esc → ველი 8 რჩება, მონიშვნა 7–9; Clip Gain-ის ველზე Esc აბრუნებს | 0.5 | Low | არა — ქცევა |

**გათვალისწინებული და უარყოფილი / გაერთიანებული (task §3 D4 სია):**
- **ჯგუფის ხილული readout (F-3)** → DUX-R-1-ს ემატება: ხაზის, Master-ისა და ჯგუფის Volume ერთნაირად ჩანდეს და იკრიფებოდეს.
- **Export range card footer-ის ქვეშ (F-2)** → ARCH-R101-MODALBODY-PADDING-SLOT / GATE102-S3-TALL-CARD-NO-CAP; ახალი id არა.
- **Waveform Zoom „1×“ (F-7), Shift-drag fine (SHIFT-FINE-DISCOVERABILITY)** → DUX-R-2 (ცნობარი).
- **Export-ის გადატვირთვის გაფრთხილება default-ზე (F-14)** → ABL-R-18 (Normalize); ახალი id არა.
- **AltGr (F-5)** → შენიშვნა B-სთვის. Ctrl+Alt კლავიშები ახალ იდეებში არ შემოდის.
- **F / Ctrl+Alt+F (fade)** → T12-ADVANCED-ში (crossfade/micro fade დაგეგმილია); Ctrl+Alt+F-ს AltGr-ის რისკიც აქვს (F-5).
- **0 (Deactivate)** → უარყოფილია: კლიპის ცალკე „გამორთული“ მდგომარეობა ახალი მოდელია; ფილმის მონტაჟში ხაზის Mute ფარავს.
- **Ctrl+J (Consolidate)** → უარყოფილია: Chrome-ში Ctrl+J Downloads-ს ხსნის (browser-reserved), და ახალი აუდიოს render-ს მოითხოვს, რაც მარტივი მონტაჟის ფარგლებს სცდება.
- **Ctrl+Space** → უარყოფილია: macOS-ში ენის გადართვაა (პლატფორმის კონვენცია, აქ არ შემოწმებულა); Space უკვე Play/Stop-ია.
- **Demo badge** → acceptable (მკაფიოა, F-14).
- **Mute/export feedback (F-12)** → acceptable; ახალი იდეა არ სჭირდება.
- **ცალკე არ შემოთავაზებულა:** M5 (ხაზების ფერები, `not_approved_yet`) — მხოლოდ ციტირება; ABL-R-1…18, T12-ADVANCED.

### Top 5 Saba-სთვის (ღირებულება ფილმის მემონტაჟისთვის ÷ ღირებულება რაუნდებში)

| # | ID | რატომ ახლა | ზომა | VISUAL-A-სთან ერთად? |
|---|---|---|---|---|
| 1 | DUX-R-5 | ფერის ერთი წესი: მონიშვნა content-ისგან გამოირჩევა; V-1-ში თითქმის უფასოა | 0.5 | **დიახ** (`fitsVisualA: true`) |
| 2 | DUX-R-3 | 1280-ზე (ლეპტოპი) არჩეული კლიპი panel-ის ქვეშ იმალება | 1 | არა |
| 3 | DUX-R-1 (+ ჯგუფი) | −3 dB დღეს 30 დაჭერაა; ჯგუფის მნიშვნელობა საერთოდ არ ჩანს | 1 | არა |
| 4 | DUX-R-4 | პირველი წუთი: ცარიელ ხაზში არაფერი წერია, drag-ს ვერ ხვდები | 0.5 | არა |
| 5 | DUX-R-6 | კლავიატურით მომუშავე მემონტაჟე დღეს კლიპს ცალკე ვერ ირჩევს | 1–2 | არა |

შემდეგი რიგით: DUX-R-2 (ცნობარი), DUX-R-7, DUX-R-8, DUX-R-9.

## 6. ბაგები

| ID | severity | section | steps | expected (contract) | actual | evidence |
|---|---|---|---|---|---|---|
| DUX-B-1 | Low | D6b | ახალი context `/studio-lab` (1440×900 ან 1280×720) → S1 (SFX კლიპი მონიშნულია) → hint line, detail panel-ის label-ები (ხაზი, დასაწყისი, სიგრძე, წყაროდან, საიდან/სადამდე, „Clip Gain, dB“), ბიბლიოთეკის საქაღალდეების რიცხვები, ვიდეოს caption | ჩვეულებრივი ზომის ინფორმაციული ტექსტი ≥ 4.5:1 (WCAG 2.2 AA 1.4.3; `visual-direction-a.md` l.113, `dim` l.45 „≥ 4.5:1 (შესამოწმებელი)“) | `text-dim` rgb(103,111,126) ფონზე rgb(17,19,24) = **3.67:1** (pixel-ით იგივე); არჩეულ ბიბლიოთეკის სტრიქონზე rgb(17,39,42) = 3.08:1. 53/53 `dim` ელემენტი 4.5-ზე დაბალია, არცერთი disabled. არჩეულ სტრიქონზე `muted` = 4.38:1. ძირითადი ტექსტი არ არის → Low. გამოსწორება: VISUAL-A-ს `dim` (#8A8276) | `c-round-125/out/contrast-baseline.json` (`byToken.text-dim`, `pixelSamples`), `shots/D6-S1-1440.png` |
| DUX-B-2 | Low | D3-B/F-4 | ახალი context `/studio-lab`, 1440×900 ან 1280×720 → S0/S1 → ბიბლიოთეკის separator (4 px სიგანე), detail panel-ის separator და ხაზის სიმაღლის სახელური (6 px სიმაღლე), ბიბლიოთეკის საქაღალდის ▾ (16 px სიგანე) → `elementFromPoint` box-ის გარეთ | ≥ 24×24 px სამიზნე ან spacing გამონაკლისი (WCAG 2.2 2.5.8; პროექტში Low, თუ გამოყენებას არ ბლოკავს) | hit area box-ის ტოლია (separator-ები 4–6 px, ▾ 16 px სიგანე), გაზრდილი ზონა არ აქვს; 24 px-იანი წრე მეზობელ სამიზნეს კვეთს (1440 S0 6, S1 5; 1280 S0 8, S1 8). კლავიატურით (↑/↓, ←/→) მუშაობს → არ ბლოკავს. Baseline-იდან (608187f) არსებობს, რეგრესია არ არის | `c-round-126/out/d3c/d3c-hit-*.json`, `d3c-hit2-*.json`, `out/d3c/wcag258-spacing.json` (1280 S1-ის რიცხვი panel-ის ქვეშ დამალულ კონტროლებსაც შეიცავს), `c-round-125/out/under24px.json` |
| DUX-B-3 | Low | D3-C/F-11 | ახალი context → S0 → BPM ველი (ცარიელი, placeholder-ის გარეშე), ბიბლიოთეკის ძებნა, detail-ის ველები → ველის საზღვრის pixel-ი vs გარე ფონი | UI კომპონენტის საზღვარი ≥ 3:1 მეზობელ ფერთან (WCAG 2.2 1.4.11, task §3 D3-C წესი) | `border-outline` rgb(48,53,65) ფონზე rgb(17,19,24) = **1.51:1**, შიდა ფონთან 1.62:1; ველის შიდა ფონი vs გარე = 1.07:1, ამიტომ საზღვარი ერთადერთი მინიშნებაა. VISUAL-A-ს `outline` #24211E (`visual-direction-a.md` l.40) მას კიდევ შეამცირებს. რეგრესია არ არის (baseline) | `c-round-126/out/d3c/d3c-first-*.json` (`boundaries`), `shots/D3C-S0-1440-*.png` |
| DUX-B-4 | Low | D3-C/F-11 | ახალი context `/studio-lab`, 1440×900 ან 1280×720 → S0 (ან S1-ში SFX ელემენტი) → ბიბლიოთეკის არჩეული სტრიქონის მეტა (ტიპი, ხანგრძლივობა) | ჩვეულებრივი ტექსტი ≥ 4.5:1 (WCAG 2.2 1.4.3) | `text-muted` rgb(129,136,152) არჩეული სტრიქონის ფონზე rgb(17,39,42) = **4.38:1** (12 px); ძირითადი ტექსტი არ არის → Low. `dim`-ისგან (DUX-B-1) განსხვავებული token-ია; VISUAL-A V-1-ის token-ების გადასინჯვაში გასასწორებელია. რეგრესია არ არის (baseline) | `c-round-125/out/contrast-baseline.json` (`byToken.text-muted.failSamples`) |

**ცნობილი, ციტირებული და არა ხელახლა ჩაწერილი:** ABL-B-1, ABL-B-2, ABL-R-1…18, R77-BUTTON-SHORTCUT-SUPERSET, C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER (1280-ზე range card footer-ის ქვეშ, `D6-S2-1280.png`), ROOT-R65-L2, ROOT-R73-S3-MARKER-BUTTON-SIZE, GATE83-L2-POINT-HIT-AREA, HR-ESCAPE-NO-DESELECT, INFO-C101-SPACE-A-VS-C.

## 7. დანართი: VISUAL-A baseline (D6) — „pre-V-0 baseline (608187f)“

**ფაილები:** `c-round-125/out/bbox-baseline-1280.json`, `bbox-baseline-1440.json`, `contrast-baseline.json`, `under24px.json` (ოთხივეს პირველი ველი: „pre-V-0 baseline (608187f)“). Script: `tools/d6.cjs`, `tools/d6build.py`. Screenshots: `shots/D6-S{0,1,2}-{1280,1440}.png`.

**მდგომარეობები:**
- **S0** — ახალი `/studio-lab`, დემო კოლექცია მზადაა, არაფერია მონიშნული (1280-ზე detail panel დაკეცილია).
- **S1** — ზუსტი აწყობა: (1) ახალი context, storage-ის გარეშე; cookie banner — Decline; (2) Snap off; (3) მუსიკის ხაზის სახელი → ruler 0 (Home) → `demo-hero-music` focus → Enter; (4) stems → ruler 2 წმ → `demo-stem-pulse` → Enter; (5) sfx → ruler 4 წმ → `demo-soft-impact` → Enter; (6) ვიდეოს input → `media/beeps-6s-h264-aac.mp4` (0–6 წმ); (7) ruler 1 წმ → M (Marker 1); (8) range drag stems კლიპის სხეულზე (65% სიმაღლე) **4 → 2 წმ** (2 წმ-დან დაწყება კლიპის მარცხენა კიდეს იჭერს) → Ctrl+L (Loop 2–4); (9) მუსიკის სახელი click, stems-ის სახელი Ctrl+click, Ctrl+G («ჯგუფი 1»); (10) SFX კლიპის თავზე click; (11) მხოლოდ 1280: detail toggle → გაშლა; (12) blur, მაუსი (2,2)-ზე. ყველა მდგომარეობაში zoom 40 px/წმ, scroll 0, dpr 1.
- **S2** — S1-დან Export dialog (ელემენტები `document.body`-დან, რადგან dialog portal-შია).

**ელემენტების რაოდენობა:** 1280 — S0 103, S1 121, S2 130; 1440 — S0 111, S1 122, S2 131. გასაღების წესი: data-testid / aria-label / role+ტექსტი + ხაზის/კლიპის/მარკერის კონტექსტი + #რიგითი ნომერი; box-ები არ იჭრება viewport-ზე, 0.5 px-მდე დამრგვალებული.

**დეტერმინიზმი:** თითო მდგომარეობა ორჯერ, ორ ახალ context-ში: **მაქსიმალური სხვაობა 0 px** ექვსივე მდგომარეობაში, გასაღებების სია იდენტურია.

**კონტრასტი token-ების მიხედვით** (S0+S1, ორივე viewport; ნორმალური ტექსტი ≥ 4.5, დიდი ტექსტი და icon ≥ 3; disabled ელემენტები ჩათვლილია, მაგრამ WCAG-ით გამონაკლისია):

| token | ელემენტები (S0+S1, ორივე viewport) | გამოთვლილი | ? (ფონი: waveform/ვიდეო/gradient) | min | max | 4.5 / 3-ზე დაბალი |
|---|---|---|---|---|---|---|
| accent | 8 | 8 | 0 | 4.97 | 9.49 | 0 |
| brand | 30 | 30 | 0 | 6.94 | 10.43 | 0 |
| brand-foreground | 8 | 4 | 4 | 11.13 | 11.13 | 0 |
| dim | 53 | 53 | 0 | 3.08 | 3.67 | 53 |
| foreground | 186 | 174 | 12 | 3.45 | 17.23 | 33 |
| muted | 404 | 396 | 8 | 2.21 | 5.58 | 14 |

- `foreground`-ის 33 დაბალი მნიშვნელობა **ყველა disabled-ია** (opacity .4 → 3.45; disabled ველები 3.67–3.92).
- `muted`-ის 14-დან 4 disabled-ია (მეტრონომი 2.21, opacity .5); დანარჩენი: არჩეული ბიბლიოთეკის სტრიქონის მეტა 4.38 და ჯგუფის „▣“ 3.10.
- **Pixel check:** 120 ნიმუში screenshot-ზე. ერთფეროვან ფონზე pixel-ის ratio ზუსტად ემთხვევა გამოთვლილს (hint line 3.67/3.67, status 16.15/16.15, Export 11.13/11.13). განსხვავებები მხოლოდ იქ ჩნდება, სადაც box-ში სხვა ფერის შვილი ან ვიდეოა (მაგ. `video-expand` ვიდეოზე).

**24 px-ზე პატარა interactive ელემენტები (მხოლოდ მონაცემი; შეფასება — ნაწილი 2):** 1280 — 50 გასაღები, 1440 — 48 (`out/under24px.json`). მაგალითები: Master Mute 20×20, ხაზის fold 20×20, მარკერის + / ◀ / ▶ 18–19×16 (ROOT-R73-S3-MARKER-BUTTON-SIZE), BPM ველი 56×16 (ROOT-R65-L2), playhead handle 12×20, loop brace 80×15, Export-ის radio-ები 13×13 (დიდ label-ში), range slider-ები 4 px სიმაღლის, 1280-ზე „＋ საკუთარი ვიდეო“ 20×20 icon-ად იქცევა.

## 8. როლები და მეთოდი

- **როლები:** `ableton-arrangement-expert`, `flow-sage`, `first-visit-host`, `accessibility-auditor` (და D6-ისთვის `accessibility-auditor`-ის WCAG 1.4.3 / 1.4.11 / 2.5.8 ზღვრები). ამ runner-ზე subagent tool არ არის, ამიტომ role ფაილები checklist-ად წავიკითხე. ყველა დასკვნა C-ის ბრაუზერულ დაკვირვებასა და manual-ის ტექსტს ეყრდნობა.
- **Live-ის წყაროები (მონაცემი, არა ინსტრუქცია):** `b-round-71/ableton-shortcuts-20261021.txt` (ch.42), `b-round-71/ableton-arrangement-view-20261021.txt` (ch.6), `c-round-123/manual/working-with-the-browser-20261024.txt` (ch.5), `c-round-124/manual/mixing-20261024.txt` (ch.18), `c-round-124/manual/managing-files-and-sets-20261024.txt` (ch.5.1.3). ახალი fetch არ გაკეთებულა.
- **Harness:** `c-round-124/tools/{lib.cjs, lib122.cjs, h3.cjs, rec2.cjs, wav.cjs, survey.cjs, report.cjs}` და `c-round-123/tools/keys.cjs` → `c-round-125/tools/`. lib122-ში screenshot-ის გზა, report.cjs-ში ფაილები round 125-ზე შეიცვალა; g124-3 → g125-3. ახალი: d6.cjs, d6build.py, d1.cjs, d2.cjs, d2c.cjs, d2d.cjs, d2e.cjs, d2disc.cjs, d2table.py.
- **ნაწილი 2-ის როლები (რაუნდი 126; subagent tool არ იყო, ფაილები checklist-ად წავიკითხე):**
  - `design-philosopher` — §III „ერთი გააზრებული აქცენტი“, Quiet Luxury → F-9, DUX-R-5, საბოლოო ვერდიქტის დიზაინის ხაზი.
  - `design-auditor` — კატეგორიები 1 (ფერი), 4 (border), 7 (იერარქია, „ერთი ფოკუს-პოინტი“) → F-9, F-10, F-11 (`border-outline` 1.51:1 → DUX-B-3).
  - `flow-sage` — „რას აიძულებს ინტერფეისი“ → D3-A (wheel / panel-ის დაკეცვა), F-12 feedback, DUX-R-3.
  - `first-visit-host` — ცარიელი მდგომარეობები, დამალული შემდეგი ნაბიჯები → F-14, DUX-R-4.
  - `ableton-arrangement-expert` — მხოლოდ F-წყარო, ფაქტი და აზრი ცალკე → D4 Live-ის სვეტი (42.2, 42.5, 42.9, 42.16, 42.19).
  - `accessibility-auditor` — 2.4.7, 2.5.8, 1.4.11, 2.1.1 → F-4 (DUX-B-2), F-11, F-13 (DUX-R-6).
  - როლის აზრი მხოლოდ input-ია; ყოველი დასკვნა C-ის ბრაუზერულ გაზომვასა და manual-ის ტექსტს ეყრდნობა.
- **ნაწილი 2-ის harness:** `c-round-125/tools/*.cjs` → `c-round-126/tools/` (lib122, d1, d6 — screenshot-ის გზა; report.cjs — round 126; g125-3 → g126-3). ახალი: d3a.cjs, d3b-altgr.cjs, d3b-altgr2.cjs, d3b2.cjs, d3b3.cjs, d3b-dead.cjs, d3b-dead2.cjs, d3c-focus.cjs, d3c-hit.cjs, d3c-feedback.cjs, d3c-first.cjs, d3c-disabled.cjs. ყოველი გაშვება უნიკალური სახელის ფაილს წერს (run id / UTC). D6-ის baseline ფაილები არ შეცვლილა. Invalid run: 1 (ENV-FIRST-LOAD, hydration — გაუქმდა და გამეორდა).
- **ქსელი/console ნაწილ 2-ის ყველა სესიაში:** 0 მოთხოვნა `/api/studio-token`-ზე (G126-3-ის პირდაპირი 401-ის შემოწმების გარდა), recording, download ან R2-ზე; 0 Authorization header; 0 hydration; 0 pageerror (ENV-FIRST-LOAD გარდა).
- **ქსელი/console ყველა სესიაში:** 0 მოთხოვნა `/api/studio-token`-ზე, recording, download ან R2-ზე; 0 Authorization header; 0 hydration; 0 pageerror (პირველი ჩატვირთვის ENV-FIRST-LOAD გარდა, რომელიც გაუქმდა).

## 9. ინდექსი

**ბაგები (DUX-B):**

| ID | severity | სტატუსი |
|---|---|---|
| DUX-B-1 | Low | `deferred_low_polish`; VISUAL-A V-1-ის `dim` (#8A8276) ასწორებს (RV-2) |
| DUX-B-2 | Low | `deferred_low_polish` (resize separator-ები 4–6 px, საქაღალდის ▾ 16 px; WCAG 2.5.8) |
| DUX-B-3 | Low | `deferred_low_polish`; V-1-ში `outline` token-ის შეცვლისას ველის საზღვარი ≥ 3:1 უნდა დარჩეს |
| DUX-B-4 | Low | `deferred_low_polish`; V-1-ის token-ების გადასინჯვისას `muted` არჩეულ სტრიქონზე ≥ 4.5:1 |

Critical, High ან Medium DUX-B არ არის, ამიტომ V-0-მდე fix-up არ არის საჭირო.

**იდეები (DUX-R), ყველა `awaiting_user`:**

| ID | პრიორიტეტი | `fitsVisualA` |
|---|---|---|
| DUX-R-1 | Medium | false |
| DUX-R-2 | Low | false |
| DUX-R-3 | Medium | false |
| DUX-R-4 | Medium | false |
| DUX-R-5 | High | **true** |
| DUX-R-6 | Medium | false |
| DUX-R-7 | Low | false |
| DUX-R-8 | Low | false |
| DUX-R-9 | Low | false |

## კითხვები Saba-სთვის

პასუხი ჩაწერე `user-review/design-ux-decisions.md`-ში: approve / reject / change.

- **DUX-R-1:** ხაზის, Master-ისა და ჯგუფის Volume ციფრით იკრიფებოდეს და ჯგუფის dB ეკრანზე ჩანდეს? (approve / reject / change)
- **DUX-R-2:** shortcut-ების ცნობარი (`?` ან ღილაკი hint line-თან), ძებნადი? (approve / reject / change)
- **DUX-R-3:** არჩეული კლიპის ხაზი ავტომატურად გამოჩნდეს, ან 1280-ზე panel თავად დაიკეცოს? რომელი ვარიანტი? (approve / reject / change)
- **DUX-R-4:** ცარიელ აუდიო ხაზში მინიშნება და disabled ღილაკებზე მიზეზი? (approve / reject / change)
- **DUX-R-5:** waveform-ები ნეიტრალური ფერით, ფირუზისფერი (VISUAL-A-ში სპილენძი) მხოლოდ მონიშვნის, playhead-ის, ძირითადი ღილაკისა და focus-ისთვის — VISUAL-A V-1-ში? (approve / reject / change)
- **DUX-R-6:** კლიპის არჩევა კლავიატურით (Tab/ისრები, ხილული ring)? (approve / reject / change)
- **DUX-R-7:** Live-ის კლავიშები S, W, H, Alt+U, Alt+Shift+F? (approve / reject / change)
- **DUX-R-8:** Shift+click პირველიდან ბოლომდე მონიშვნა, როგორც Live-ში? (approve / reject / change)
- **DUX-R-9:** Esc detail range-ის ველშიც აბრუნებდეს draft-ს? (approve / reject / change)
