# Transport, Insert Marker და Grid — Saba-ს სამი შენიშვნის ანალიზი (SABA-B-9 / B-10 / B-11)

**თარიღი:** 2026-10-28 · **ტიპი:** read-only კვლევა (რეპოზიტორი არ შეცვლილა) · **ენა:** ქართული, UI ტერმინები/კლავიშები ინგლისურად

**კოდის baseline:** store master-ის read-only clone `scratchpad/st` = `2d4a93f` (round 222). ბოლო გამოქვეყნებული commit არის `5da0f50` (round 229, `loop/last-publication.json`), მაგრამ ის ამ clone-ში არ არის. რაუნდებმა 226–229 (CALM-1/2a) შეცვალა `ArrangementTransport.tsx` და დაამატა `app/lib/arrangement/shortcuts.ts`. ამიტომ შენიშვნა `SW l.NNNN` ეხება `2d4a93f`-ს. Shortcut sheet-ის მონაცემი აღებულია round 227-ის snapshot-იდან (`loop/b-round-227/granted-start/...`). A-მ დისპეჩამდე ხაზები ხელახლა უნდა გადაამოწმოს `5da0f50`-ზე.

**აღნიშვნები:** SW = `app/components/arrangement/StudioWorkspace.tsx`, AT = `ArrangementTransport.tsx`, AR = `ArrangementRuler.tsx`, AC = `ArrangementClip.tsx`, AL = `ArrangementLane.tsx`, CTX = `app/contexts/ArrangementContext.tsx`, GRID = `app/lib/arrangement/grid.ts`, GDIV = `app/lib/arrangement/grid-divisions.ts`.

**Ableton-ის წყაროები**
- **[AV]** Live 12 Reference Manual, ch. 6 Arrangement View: https://www.ableton.com/en/live-manual/12/arrangement-view. დღეს გავხსენი WebFetch-ით და შევადარე ლოკალურ capture-ს `loop/b-round-71/ableton-arrangement-view-20261021.txt`.
- **[LC]** ch. 3 Live Concepts → Control Bar: https://www.ableton.com/en/live-manual/12/live-concepts/. დღეს გავხსენი WebFetch-ით.
- **[KS]** ch. 42 Live Keyboard Shortcuts: https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/. დღეს WebFetch-მა ეს URL provenance-ის წესით დაბლოკა. ციტატები აღებულია ლოკალური capture-იდან `loop/b-round-71/ableton-shortcuts-20261021.txt` (header-ში იგივე URL-ია, capture 2026-10-21).
- **[NEW12]** Ableton Help „New Keyboard Shortcuts in Live 12“: https://help.ableton.com/hc/en-us/articles/12840878679452 (დღეს).
- **[FORUM]** Ableton forum „How to move Insert Marker position to current location“: https://forum.ableton.com/viewtopic.php?p=1794048. მომხმარებლების ტექსტია, არა ოფიციალური წყარო. ამიტომ მას „მეორადი“ ვუწოდებ.

Live აპლიკაციაში არაფერი დამიტესტავს. წყაროს გარეშე ყოველი დებულება ქვემოთ მონიშნულია როგორც **დაუდასტურებელი**.

---

## 0. მოკლე დასკვნა

| # | Saba-ს შენიშვნა | Live 12 | ჩვენთან | ადრე ნანახი იყო? | ძირითადი მიზეზი, რატომ გამოგვრჩა |
|---|---|---|---|---|---|
| 1 | Play შუაში | Transport არის Control Bar-ის 9 სექციიდან მე-5, ანუ შუა სექცია [LC] | Play ყველაზე მარცხნივაა (AT l.129–145) | **არა.** ექსპერტულმა მიმოხილვამ P1-ში „რეგიონები“ შეამოწმა, Control Bar-ის შიდა წყობა კი არა | VISUAL-A-ს და screen-review-ს წესი „პოზიცია არ იცვლება“. M1-მა (round 181) Play-ს ფორმა შეცვალა და პოზიცია შეგნებულად დატოვა |
| 2 | ლურჯი კურსორი (Insert Marker) | Space იწყებს Insert Marker-იდან, Shift+Space აგრძელებს გაჩერების ადგილიდან [AV 6.3] | ერთი პოზიციაა (playhead). Space ყოველთვის აგრძელებს (CTX l.1269–1316, l.1002) | **დიახ, ორჯერ** (ABL review P8, Q1; DUX shortcut table l.62–66). ორივე შემთხვევაში დაიწერა „შეგნებული განსხვავება D-15“ და ABL-R არ დაიწერა | D-15 B-ის round 1-ის გადაწყვეტილება იყო: „პროტოტიპი ასე მუშაობს“. Saba-ს ის არასდროს ჰკითხეს. R4-P3 D-15-ს მოარგეს. მიმოხილვებმა ⚖ Saba-ს დამტკიცებად ჩათვალეს |
| 3 | Grid: selection ხაზიდან ხაზზე ხტება | Grid ყოველთვის beat-time-ია, ჩვეულებრივ zoom-adaptive [AV 6.10] | წამების fixed ბადე, ნაგულისხმევად 1 s (GRID l.4–6). BPM null-ია (SW l.497). Snap absolute-ია (F1). Adaptive არ არის | **ნაწილობრივ.** ABL-R-8 (adaptive) დამტკიცდა 2026-10-25-ს, მაგრამ `not_started`-ია. F1-ABSOLUTE-SNAP (Medium) „accepted“ არის R49-T-მდე, რომელიც round 49-იდან ღიაა | FB-13 მუსიკალური იყო. B-მ ჯერ წამები ააშენა და „120 არ იგულისხმება“ (D-29z30 R4/R5). Feel-check Tech Lead-ს გადაეცა და არასდროს ჩატარდა |

---

## 1. Play / transport შუაში (SABA-B-9)

### 1.1 Live 12
- **Control Bar-ის წყობა [LC, ch. 3 „The Control Bar“]:** „The Control Bar is where you'll find Live's transport and tempo controls … grouped into nine sections“. სექციები ამ რიგითაა: Browser Options → Tempo Settings and Metronome → Scale Settings → **Follow and Arrangement Position** → **Transport Controls** → Automation and Capture MIDI → Arrangement Loop Settings → MIDI and CPU Settings → View Selector. Transport მე-5 სექციაა, ანუ 9-დან შუაში. მის მარცხნივ არის Follow და Arrangement Position, მარჯვნივ კი Automation და Loop.
- **სიტყვა „centre“ manual-ში არ წერია.** რიგიდან ვასკვნი, რომ Transport შუაშია. ეკრანზე ზუსტად ცენტრშია თუ არა, ფიგურიდან არ გამიზომავს (**დაუდასტურებელი**). Saba-ს აღწერა („შუაში“) ამ რიგს ემთხვევა.
- **Transport-ის შემადგენლობა [LC]:** „controls for starting or stopping playback, and for starting Arrangement recording“. [AV 6.3]: „click the Play button to start playback; to stop playback, click the Stop button … the space bar to toggle playback“. Play და Stop **ცალ-ცალკე ღილაკებია**. ფიგურის სათაურია „The Play and Stop Buttons in the Control Bar“.
- **Stop-ის ორმაგი click [AV 6.3]:** „To return the insert marker to the starting play position, you can double-click the Stop button“.

### 1.2 ჩვენთან (`2d4a93f`)
- Transport toolbar workspace header-ის ქვეშაა (SW l.2243–2246).
- Toolbar ერთი `flex flex-wrap` რიგია (AT l.129). რიგი მარცხნიდან მარჯვნივ:
  1. **Play/Pause** (ერთი toggle ღილაკი, AT l.130–145);
  2. Back to start (AT l.146–154);
  3. პოზიციის საათი და `/ end` (AT l.155–161);
  4. Undo, Redo (l.163–192);
  5. Split, Delete (l.194–218);
  6. Loop (l.220–235);
  7. `ml-auto` მარჯვენა ჯგუფი: Follow, Zoom slider, readout, zoom-range, Zoom back, Fit, Export (l.236–340).
- **ცალკე Stop ღილაკი არ არის.** Play იცვლება Pause-ად (AT l.140–144; `pauseLabel`/`pauseTitle` strings.ts l.217–220). Record არ არის (CZABA-ში ჩაწერა scope-ში არ არის).
- **1280×720-ზე toolbar ორ რიგად იშლება.** Follow, Zoom და Export მეორე რიგზე გადადის (screen-review-230 SR-230-4; plan.md l.527–528: „transport 1280-ზე უკვე 2 რიგია (87 px)“).

### 1.3 სხვაობა
- Live-ში რიგია Follow · Position · **[Play][Stop]** · Loop, ჩვენთან კი **[Play/Pause]** · ↤ · Position · Undo/Redo · Split/Delete · Loop · … · Follow.
- Transport მარცხენა კიდეზეა და არა შუაში.
- Follow და Position Transport-ის მეზობლები არ არიან.
- Stop ცალკე არ არის, ამიტომ Live-ის „double-click Stop“ ჟესტი შეუძლებელია.

### 1.4 რატომ გამოგვრჩა
- **თავდაპირველი მოთხოვნა.** FB-01…FB-16-ში (`docs/video-to-text-bugs/README.md`) transport-ის ადგილი არსად არის მოთხოვნილი. SRW-01 (round 1) toolbar-მა პროტოტიპის წყობა გადმოიტანა. Layout-ის Ableton reference-ის row ამოცანაში არ ყოფილა: reference-first წესი 2026-10-27-ს გაჩნდა (`policy.local.md` l.227).
- **ექსპერტული მიმოხილვის scope (rounds 123–124).** P1 „Layout და პანელები“ (`ableton-review.md` l.70–85) ამოწმებდა რეგიონებს: Overview, ruler, lanes, Browser, detail, track height. **Control Bar-ის შიდა წყობის row არ იყო.** Toolbar-ის ორ რიგად დაშლა შეამჩნია, მაგრამ ჩაწერა როგორც „DESIGN-UX-REVIEW-ის საკითხი“ (l.76).
- **დიზაინის წესმა პოზიცია გაყინა.** `policy.local.md` l.144/146-ის მიხედვით VISUAL-A-ს საზღვარი არის „colors, icons, typography only“ და „Any layout move … always needs his approval“. ამიტომ:
  - V-3a (D-29z123, plan.md l.1264) Play-ს ზედაპირი შეცვალა;
  - M1 (round 181, D-29z146) Play 32×32 წრედ აქცია და მეზობლები 64 px-ით გადაწია;
  - C-მ **„LAYOUT-M1 … მარჯვენა ჯგუფი და ქვემოთ ყველაფერი ±0“** წარმატებად ჩათვალა (`feature-status`, round 181).
  
  წესი სწორად მუშაობდა, მაგრამ არავის ჰქონდა მოვალეობა, Saba-სთვის **კითხვად** დაეწერა: „Live-ში Play შუაშია, გადავიტანოთ?“.
- **DUX მიმოხილვამ** (F-9, `design-ux-review.md` l.221) ვიზუალური იერარქია შეაფასა („თვალი ჯერ Export-ზე…“). Live-ის layout-თან პოზიციური შედარება არ გაუკეთებია.
- **Screen review 230**-ის რეცენზენტებს მიეწოდა სია „რაც Saba-მ დატოვა (… transport-ის ტექსტური ღილაკები)“ (`screen-review-230.md` l.12). Scope მხოლოდ „clutter“ იყო და არა reference-თან შესაბამისობა.

### 1.5 გაკვეთილი lessons.md-ისთვის (შემოთავაზება)
> **L43. A frozen position is a question, not a pass.** როცა მიმოხილვა ან დიზაინის რაუნდი ხედავს, რომ ელემენტის ადგილი Live-ისგან განსხვავდება და ამ რაუნდს მისი გადატანა არ შეუძლია (positions stay), ის **ყოველთვის** წერს Saba-სთვის კანდიდატს (ABL-R / DUX-R / SR id) Live-ის სექციის ციტატით. „±0 px“ ამ შემთხვევაში წარმატების კრიტერიუმი ვერ იქნება. Evidence: SABA-B-9 (Play მარცხნივაა round 1-იდან; M1 round 181-მა ფორმა შეცვალა, ადგილი დატოვა; P1 Control Bar-ს არ ამოწმებდა) (1×).

---

## 2. Insert Marker (ლურჯი კურსორი) (SABA-B-10)

### 2.1 Live 12: რა არის დადასტურებული
| ქცევა | წყარო | სტატუსი |
|---|---|---|
| „The flashing blue insert marker on a track determines where playback starts. By default, the marker is at the start of the Arrangement. You can click anywhere within a track to move the insert marker and set a new play position.“ | [AV 6.3] | დადასტურებული |
| „Clicking into the Arrangement background selects a point in time, represented by a flashing insert marker. The insert marker can then be moved in time with the left and right arrow keys, or between tracks via the up and down arrow keys. Holding Ctrl (Win) / Option (Mac) while pressing the left and right arrow keys snaps the insert marker to locators and the edges of clips“ | [AV 6.9] | დადასტურებული |
| „To continue playback from where it last stopped, rather than from the insert marker, hold Shift while pressing the space bar.“ | [AV 6.3] | დადასტურებული |
| Insert Marker-ის დასაწყისში დაბრუნება: „double-click the Stop button or press the Home key (Win) or Function + left arrow (Mac)“ | [AV 6.3]; [KS 42.20] „Move Insert Marker to Beginning — Home“ | დადასტურებული |
| 42.20 Transport: „Play from Start Marker/Stop — Space“; „Continue Play from Stop Point — Shift Space“; „Stop Playback at End of Selection — Ctrl Space / Option Space“; „Play Arrangement View Selection — Space“ | [KS 42.20] | დადასტურებული (ტექსტი) |
| 42.16: „Play from Insert Marker in Selected Clip — Ctrl Space / Option Space“; „Move Insert Marker to Playhead Position — Ctrl Shift Space / Cmd Shift Space“ (Live 12-ში ახალია) | [KS 42.16], [NEW12] | დადასტურებული |
| „playback starts at selection“ ნაგულისხმევი ქცევაა. „Set Song Start Time Here“ (locator-ის ან loop brace-ის context menu) მას აუქმებს | [AV 6.4, 6.6] | დადასტურებული |
| Arrangement Position ველის შეცვლა „automatically moves the insert marker“ | [AV 6.3] | დადასტურებული |
| Scrub area-ზე click დაკვრას იწყებს იმ წერტილიდან, თუ ჩართულია „Permanent Scrub Areas“ (Display & Input Settings, ნაგულისხმევად ჩართულია). ნახტომი კვანტდება Control Bar-ის Quantization-ით | [AV 6.3] | დადასტურებული |

**რას აკეთებს Stop პოზიციასთან**
- Manual-ის Arrangement View-ის გვერდი ამას პირდაპირ **არ ამბობს** (WebFetch-ის შედეგი: „The page does not say what happens to the play position when Stop is clicked once“).
- ლოგიკურად ასე გამოდის: Space იწყებს Insert Marker-იდან, Shift+Space კი „where it last stopped“-იდან. მაშასადამე, Stop-ის შემდეგ Insert Marker ადგილზე რჩება და გაჩერების წერტილი ცალკე ინახება. ეს **დასკვნაა 6.3-იდან**. [FORUM] (მეორადი, 2021–2025) იგივეს ადასტურებს: „After stopping, the insert marker stays where playback started“. Live 12-ის „Move Insert Marker to Playhead Position“ ბრძანება [NEW12] სწორედ ამ ორ პოზიციას აერთებს.

**მეორე Stop**
- **Double-click** Stop Insert Marker-ს დასაწყისში აბრუნებს [AV 6.3].
- გაჩერებულ მდგომარეობაში ერთი click Stop-ზე რას აკეთებს: **დაუდასტურებელი**.
- Stop-ის მეორე click Insert Marker-ზე **არ** აბრუნებს. Insert Marker ადგილიდან არ იძვრის, ამიტომ დასაბრუნებელიც არაფერია.

**„Start Marker“**
- 42.20-ის „Play from Start Marker“ manual-ის Arrangement-ის ტექსტში ცალკე ცნებად არ გვხვდება. WebFetch: „The term "Start Marker" does not appear on the page. The closest concept is the insert marker.“
- 42.8 „Set Start Marker Ctrl F9“ ეკუთვნის სექციას „Loop Brace and Start/End Markers“. ეს კლიპის Start/End Marker-ებია Clip View-ში და Arrangement-ის transport-თან კავშირი არ აქვს.
- ჩემი **ინტერპრეტაცია**: 42.20-ის „Start Marker“ = დაკვრის საწყისი წერტილი, ანუ Insert Marker ან მონიშვნის დასაწყისი. ტექსტით ეს დადასტურებული **არ** არის.

**შესაბამისი პარამეტრები:** Permanent Scrub Areas [AV 6.3]; Set Song Start Time Here [AV 6.4, 6.6]. სხვა preference (მაგ. „Stop-ზე დაბრუნება“) manual-ში **ვერ ვიპოვე**.

### 2.2 ჩვენთან
- **ერთი ცვლადია: position / playhead** (`createArrangementPositionStore`, `lib/arrangement/position-store.ts` l.7–28). Insert Marker-ის state არ არსებობს.
- **Stop** = `stopPlayback()`. ის პოზიციას გაჩერების ადგილზე ტოვებს: `updatePosition(stoppedAt)` (CTX l.986–1009, l.1002).
- **Play** = `togglePlayback()` იწყებს `positionRef.current`-იდან (CTX l.1281, l.1295). გამონაკლისი D-27-ია: პროექტის ბოლოში Play 0-დან იწყება, ბოლოს მიღმა კი უარს ამბობს (l.1283–1289, l.1295). Time selection-ს ფუნქცია **არ ითვალისწინებს**. Range-ის drag პოზიციას არ ცვლის (R4-P2).
- **Space:** `event.key === ' ' && !modifier` → `togglePlayback()` (SW l.1769–1775). **Shift არ გამოირიცხება**, ამიტომ Shift+Space = Space. Ctrl+Space არაფერს აკეთებს (DUX table l.62–66).
- **Click ცარიელ lane-ზე** → `seekTo(snapped)` (SW l.1717–1737). Click კლიპის body-ზე → `seekTo` (AC l.730–744). Ruler-ზე click → `onSeek` (AR l.321–345). **დაკვრისას ყველა ეს click დაკვრას იქ გადაიტანს:** `seekTo` graph-ს თავიდან იწყებს (CTX l.1368–1383). Live-ში დაკვრისას click-ს რა ემართება, manual-ში ცალკე **არ წერია** (დაუდასტურებელი).
- **Home / ↤** → `seekTo(0)` (SW l.1993–1998; AT l.146–154).
- **←/→** მონიშნულ კლიპს აწევს (SW l.2010–2039). Playhead handle-ზე ±0.1 s-ია (AR l.209–217). Live-ში ისრები Insert Marker-ს აძრავებს [AV 6.9].
- **ხილვადობა:** ერთი brass ხაზი (`bg-accent`) და handle (AR l.221–241). მოციმციმე marker არ არის.
- **Tooltip/sheet:** `playTitle: 'Play (Space)'` (strings.ts l.219). Round 227-ის sheet: `{ id: 'play-stop', action: 'Play / Stop', keys: ['Space'] }` (`b-round-227/granted-start/app/lib/arrangement/shortcuts.ts` l.19). ფრაზა „continues from where it stopped“ კოდში და sheet-ში **ვერ ვიპოვე** (grep `2d4a93f`-ზე და b-round-226/227 snapshot-ებში). ქცევა კი ზუსტად ეს არის. შესაძლოა Saba-მ ქცევა აღწერა და არა წარწერა.

### 2.3 სხვაობა
| Live | ჩვენთან |
|---|---|
| ორი პოზიციაა: Insert Marker (საწყისი) და stop point | ერთი პოზიციაა |
| Space იწყებს Insert Marker-იდან, ან მონიშვნის დასაწყისიდან | Space აგრძელებს გაჩერების ადგილიდან (ფაქტობრივად Live-ის Shift+Space) |
| Shift+Space აგრძელებს | Shift+Space = Space |
| Ctrl+Shift+Space: Insert Marker → playhead | არ არის |
| Stop ცალკე ღილაკია, double-click Stop → დასაწყისი | Pause toggle, Stop არ არის |
| Insert Marker მოციმციმე და ხილულია | მხოლოდ playhead |
| Space მონიშვნიდან უკრავს | მონიშვნა უგულებელყოფილია |

### 2.4 რატომ გამოგვრჩა
- **თავდაპირველი მოთხოვნა სწორი იყო, გადაწყვეტილებამ ის შეცვალა.** SRW-04-ის სათაურია „Draggable playhead, **insert marker vs playback**, ruler click/seek rules“ (backlog SRW-04). Round 1-ის დაგეგმვაში B-მ მიიღო **D-15**: „Single position model … the prototype the user already saw works this way, and Ableton's TRN-01 insert-marker split is a recorded ⚖ difference. Picking one variable is the smallest unambiguous contract. **R4-P3 was reworded to match**“ (`loop/b-round-1.md` l.49; plan.md l.77). მიზეზი „ყველაზე მცირე კონტრაქტი“ ახლანდელი reference-first წესით მიზეზად არ ჩაითვლებოდა: „"Simpler to build" is not a reason“ (`policy.local.md` l.233).
- **⚖ ჩაითვალა Saba-ს გადაწყვეტილებად.** D-15 არ არის `ableton-decisions.md`-ში, `design-ux-decisions.md`-ში და `orchestrator-decisions.md`-ში (grep: 0). ეს B-ის ჩანაწერია და Saba-ს არასდროს უთქვამს „დიახ, ერთი პოზიცია“.
- **ექსპერტულმა მიმოხილვამ დაინახა, მაგრამ გაფილტრა.**
  - P8 (`ableton-review.md` l.207): „Playhead vs insert marker … შეგნებული განსხვავება (D-15) … Shift+Space = Space; **ABL-R არ იწერება (D-15 უკვე ⚖)**“.
  - Q1 (l.214–215): „Space იწყებს … 2.662-დან, არა 1.000-დან … შეგნებული განსხვავება (D-15)“.
  - Verdict (l.15, l.22): „Space გაჩერების ადგილიდან აგრძელებს — ეს D-15-ით შეგნებული განსხვავებაა“.
  
  Policy-მ (`policy.local.md` l.130) ყოველი behaviour change-ისთვის ABL-R მოითხოვა, მაგრამ მიმოხილვამ D-15 „უკვე გადაწყვეტილად“ ჩათვალა.
- **DUX shortcut parity** (`design-ux-review.md` l.62–66) Space-ს „different“-ად და Ctrl+Shift+Space-ს „არ ეხება (D-15)“-ად მონიშნავს. DUX-R არ დაწერილა.
- **D-15 სხვა ქცევებსაც ედო საფუძვლად:** D-27 (Play ბოლოს მიღმა), paste პოზიციაზე (SP14), ABL-R-10 („CZABA-ს პოზიცია = Ableton-ის insert marker“, plan.md l.2391). რაც უფრო მეტი რამ ეყრდნობოდა D-15-ს, მით უფრო ძვირი ჩანდა მისი გადახედვა.

### 2.5 გაკვეთილი
> **L44. A ⚖ is B's note, not Saba's decision.** Live-ის core flow-დან (transport, selection, editing) B-ის ჩაწერილი ყოველი ⚖ განსხვავება, რომელიც `user-review/*-decisions.md`-ში არ არის, ყოველი expert/screen review-ის დროს Saba-ს **კითხვად** უნდა დაეწეროს Live-ის სექციით, თუნდაც არსებული D-ID ამას „შეგნებულს“ უწოდებდეს. „Simpler contract“ მიზეზი არ არის (reference-first). Evidence: SABA-B-10 (D-15 round 1-იდან; ABL P8/Q1 და DUX l.62 დაინახეს და გაფილტრეს) (1×).

---

## 3. Grid და Snap (SABA-B-11)

### 3.1 Live 12
**6.10 Using the Editing Grid [AV]**
- „the cursor will snap to grid lines that represent the **meter subdivisions of the song tempo**. The grid can be set to be either **zoom-adaptive or fixed**.“
- „You can set the width of both zoom-adaptive and fixed grid lines using the **context menu** available in … the Arrangement View track main lanes“.
- Ctrl/Cmd+1 narrows („doubling the density … eighth → sixteenth“); Ctrl/Cmd+2 widens; Ctrl/Cmd+3 toggles triplets; Ctrl/Cmd+4 „turns grid snapping on or off. When the grid is off, the cursor does not snap to meter subdivisions“; Ctrl/Cmd+5 „toggles fixed and adaptive grid modes“.
- „The current spacing between adjacent grid lines is displayed above the time ruler in the lower right corner“.
- „hold down the **Alt (Win) / Cmd (Mac)** modifier while performing an action to bypass grid snapping. If the grid is switched off, using the modifier will temporarily enable it.“
- [KS 42.13]-ში იგივე კლავიშებია („Fixed/Zoom-Adaptive Grid Ctrl5 Cmd5“; „Bypass Snapping While Dragging Alt / Cmd“). [KS] ბოლოში: context menu-ში არის „detailed options for zoom-adaptive and fixed grid line width“.

**6.7 [AV]:** „Clips snap to the editing grid, as well as various objects in the Arrangement including the edges of other clips, locators and time signature changes.“

**6.1 [AV], ორი ruler**
- „In the **beat-time ruler**, time is displayed in bars-beats-sixteenths. Clicking and dragging … scroll … or drag vertically to zoom. Double-clicking … zooms“.
- „In the **time ruler**, time is displayed in minutes-seconds-milliseconds. You can click and drag in the time ruler to scroll left or right.“
- ანუ min:sec ruler მხოლოდ ჩვენება და scroll-ია. Editing-ის ერთეული beat-time-ია.

**6.9 [AV]:** background click აყენებს Insert Marker-ს, „Clicking and dragging selects a timespan“. Background-ზე time selection შესაძლებელია.

**6.3 [AV], scrub area:** click იწყებს დაკვრას. ნახტომი კვანტდება **Control Bar-ის Quantization**-ით და არა editing grid-ით.

**დაუდასტურებელი:**
- Live-ის ნაგულისხმევი ტემპი (120 BPM) და ნაგულისხმევად Snap ჩართულია თუ არა. Manual-ის ტექსტში ვერ ვიპოვე.
- Context menu-ის ზუსტი პუნქტები (Narrowest…Widest, Fixed 8 Bars…1/32, Off).
- Grid off-ის დროს ხაზები ჩანს თუ არა.
- off-grid კლიპი ახლოს მდებარე ხაზზე „absolute“ snap-ით ჯდება თუ offset-ს ინარჩუნებს.
- time selection კლიპის კიდეებზე ჯდება თუ არა.

### 3.2 ჩვენთან
- **დანაყოფები:**
  - წამებში: `GRID_DIVISIONS_SECONDS = [10, 5, 2, 1, 0.5, 0.25, 0.1]`, ნაგულისხმევი `1` (GRID l.4–6; SW l.491–493);
  - მუსიკალური: bar…1/32, triplets 1/2T…1/32T (GDIV l.5–20). ისინი მხოლოდ მაშინ ჩანს, როცა `bpm !== null` (GDIV l.89–108, l.95–97).
- **ტემპი:** `useState<number | null>(null)` (SW l.497). BPM-ს მომხმარებელი ხელით წერს ArrangementTempoRow-ში. `WorkspaceSource`-ს BPM-ის ველი არ აქვს (`app/types/arrangement.ts` l.78–85). კატალოგში BPM არსებობს: `MusicAsset.bpm: number` (`app/types/asset.ts` l.23) და API client-ის `bpm?`/`minBpm` (`app/services/api/client.ts` l.85, l.106, l.486). Studio-მდე ის არ აღწევს. SFX ტიპს BPM არ აქვს (`asset.ts` l.25–).
- **Fixed, adaptive არ არის:** `gridSeconds` zoom-ზე არ არის დამოკიდებული (SW l.501–504). ხაზები იმალება, თუ ბიჯი < 6 px (`gridLinesVisible`, GRID l.173–175; SW l.2207), **მაგრამ snap იგივე ბიჯით გრძელდება.**
- **Snap ნაგულისხმევად გამორთულია:** `useState(false)` (SW l.486). G → `toggleSnap` (SW l.1953–1959; SW l.1283–1292).
- **კლავიშები:** Digit1/Digit2 narrow/widen (SW l.1974–1985), Digit3 triplet (l.1986–1992). Ctrl/Meta-ით არაფერი ხდება (`if (modifier) return`, l.1943). 4 და 5 არ არის. D-29z24-ის მიზეზი: Ctrl+digit Chrome-ის tab-ის კლავიშია.
- **Bypass:** `resolveSnapStep(snap, grid, event.altKey)`: Snap on + Alt → null; Snap off + Alt → ბადე დროებით ირთვება (GRID l.67–76). Live-ს ემთხვევა, ოღონდ Mac-ზე ჩვენთან Option-ია, Live-ში Cmd.
- **ბადის მენიუ:** lane-ზე მარჯვენა click (AL l.873–876 → SW l.1405–1416 → `ArrangementGridMenu.tsx`). მენიუში არის დანაყოფების radio, Triplet checkbox და „Snap (G)“ (`ArrangementGridMenu.tsx` l.9, l.187–245). Fixed/Adaptive არ არის.
- **Ruler-ები:**
  - წამების ruler ინტერაქტიულია (AR l.347–449; `RULER_TICK_STEPS_SECONDS`, `view.ts` l.18);
  - ტაქტების ზოლი მხოლოდ ჩვენებაა (`ArrangementTempoRow.tsx` l.93–114, `pointer-events-none` l.110; D-29z30 R4: „gesture-ები წამების სახაზავზე რჩება“).
  
  ეს Live-ის საპირისპიროა.
- **F1-ABSOLUTE-SNAP:** move/trim/range-ის დროს snap **absolute**-ია: `snapMoveStartToGridOrEdges(start + delta …)` (AC l.139–150; GRID l.272–283). 3 px-იანი ზღვრის მერე off-grid კლიპი უახლოეს ხაზზე ხტება. 10 s ბადეზე 4.3 → 0 (backlog `open_findings` F1-ABSOLUTE-SNAP, Medium, „accepted“, D-29z14).

### 3.3 ჟესტების ცხრილი: რას აკეთებს Live და რას ვაკეთებთ ჩვენ
| ჟესტი | Live 12 | ჩვენთან (`2d4a93f`) | რა არის არასწორი ან განსხვავებული |
|---|---|---|---|
| **Click ruler-ზე** | Beat-time ruler: click/drag = scroll/zoom (6.1). Scrub area: click = **დაკვრა** იმ წერტილიდან, ნახტომი Quantization-ით (6.3). Time ruler: მხოლოდ scroll | Ruler-ზე click (< 4 px) = seek დაკვრის გარეშე, **editing grid-ზე**, თუ Snap on (AR l.321–345; SP3/SP15). Drag = pan/zoom (ემთხვევა) | (a) ერთი ruler ითავსებს scrub area-ს და beat-time ruler-ს, თან **წამებშია**. (b) Snap editing grid-ით ხდება და არა Quantization-ით. D-29z15-მა ეს „შეგნებულ განსხვავებად“ ჩაწერა, ABL review P5-მა კი (l.155) „დადასტურებულად“. ეს წინააღმდეგობაა. (c) click დაკვრას არ იწყებს (D-28/TRN-05) |
| **Click lane-ის ფონზე** | Insert Marker დროის წერტილზე (6.9), კურსორი ბადეზე ჯდება (6.10). Ctrl/Option+←/→ ჯდება კლიპის კიდეებზე და locator-ებზე | Playhead-ის seek ბადეზე **და marker-ებზე**, კლიპის კიდეების გარეშე (SW l.1729–1737). Snap off → თავისუფალი | Insert Marker-ის ნაცვლად playhead გადადის (იხ. §2). დაკვრისას ის ხმას იქ გადაიტანს. ბადე წამებშია |
| **Time selection-ის drag** | Click-drag ფონზე ან კლიპში → timespan (6.9), კურსორი ბადეზე (6.10) | ფონზე drag = **marquee** კლიპების მოსანიშნად, time selection არ ხდება (SW l.1638–1707; backlog SRW-14 stage 2: „lane background has no time-range gesture“). Range მხოლოდ კლიპის waveform-ზეა და **კლიპის საზღვრებით შეზღუდულია** (AC l.677–691). ბადე + marker-ები, კიდეების გარეშე. Snap-ით 0 სიგანე → range არ იქმნება (l.683–686) | ცარიელ ადგილზე (კლიპებს შორის, ბოლოს მიღმა) time selection შეუძლებელია. 1 s fixed ბადე მაღალ zoom-ზე selection-ს **მთელი წამებით** აფართოებს (320 px/s-ზე 320 px-იანი ნახტომი; zoom-ის ზღვარი D-28: 0.5–320 px/s). absolute snap (F1) |
| **კლიპის drag** | Grid + სხვა კლიპების კიდეები, locators, time signature changes (6.7) | Grid + კიდეები (სხვა lane-ები და იგივე lane) + marker-ები, nearest-wins, tie → grid (GRID l.245–283; AC l.580–596; D-29z17/18) | კიდეები/locator-ები ემთხვევა. Absolute snap (F1): მცირე jitter კლიპს ნახევარი დანაყოფით აგდებს. ბადე წამებშია და მუსიკის ტაქტს არ მიჰყვება |
| **Trim** | კლიპი ბადეზე და კიდეებზე ჯდება (6.7 ზოგადად) | Grid + კიდეები (AC l.643–658), clamp source-ის საზღვარზე | ემთხვევა, ოღონდ ბადე წამებშია და fixed |
| **Snap off** | Ctrl+4. „cursor does not snap to meter subdivisions“ | G / მენიუ „Snap (G)“, **ნაგულისხმევად off** (SW l.486). ხაზები ჩანს Snap-ის მიუხედავად (SW l.2207) | კლავიში განსხვავდება (G და არა 4). ნაგულისხმევი მდგომარეობა Live-ში დაუდასტურებელია |
| **Bypass** | Alt/Cmd drag-ისას. off-ზე დროებით რთავს | Alt drag-ისას და click-ის pointerup-ზე. off-ზე რთავს (GRID l.67–76) | ემთხვევა (Mac: Option და არა Cmd) |
| **Narrow/Widen/Triplet** | Ctrl+1/2/3 | 1/2/3 (SW l.1974–1992). მუსიკალური მხოლოდ BPM-ით, triplet BPM-ის გარეშე უარს ამბობს (GDIV l.171–179) | ფუნქცია ემთხვევა. ცარიელ პროექტში მუსიკალური ბადე **არ არსებობს** |
| **Fixed/Adaptive** | Ctrl+5. ორივე რეჟიმი არსებობს | მხოლოდ fixed. ABL-R-8 დამტკიცდა 2026-10-25-ს, `not_started` | Saba-ს „ხტუნვის“ მთავარი წყარო: fixed 1 s ნებისმიერ zoom-ზე |
| **Right-click მენიუ** | Lane-ის context menu: adaptive და fixed სიგანეები (6.10). ზუსტი პუნქტები დაუდასტურებელია | დანაყოფები (წამები და მუსიკალური), Triplet, Snap (G) | Fixed/Adaptive და adaptive-ის „Narrow…Wide“ სიგანეები აკლია |
| **„Off“ grid** | Ctrl+4 off: snap არ ხდება | Snap off. „Off“ ცალკე დანაყოფად არ არის | ფუნქციურად ემთხვევა |
| **დამალული ხაზები** | Adaptive რეჟიმში ეს პრობლემა არ არსებობს | ბიჯი < 6 px-ზე ხაზები იმალება, snap კი უხილავ ბადეზე გრძელდება (GRID l.173–175) | Selection ხტება ხაზებზე, რომლებიც ეკრანზე არ ჩანს |

**რატომ ხედავს Saba „სულ ხტუნვას“.** Snap ჩატვირთვისას გამორთულია (SW l.486), ამიტომ ხტუნვა მხოლოდ Snap on-ის დროს ხდება. Saba-ს სესიის მდგომარეობა **არ ვიცი**. Snap on-ის დროს კი ერთდროულად ოთხი რამ ხდება:
1. ბადე fixed 1 s-ია ნებისმიერ zoom-ზე, adaptive არ არის;
2. ერთეული წამია და ტაქტი არა, ამიტომ მუსიკის დარტყმებს არ ემთხვევა;
3. snap absolute-ია (F1);
4. ბადე უხილავია, თუ ხაზები დამალულია.

Live-ის adaptive ბადე ხაზების სიმჭიდროვეს zoom-ს მიაყოლებს, ამიტომ ნახტომი ეკრანზე დაახლოებით მუდმივი ზომისაა.

### 3.4 დამატება (coordinator-ის შეკითხვა): snap-ის ზომები მუსიკალური უნდა იყოს
**(1) Ableton-ის reference**
- Grid ყოველთვის beat-time-ია: „meter subdivisions of the song tempo“ [AV 6.10]. Adaptive ან fixed არჩევითია.
- Ctrl+1/2 = narrow/widen, Ctrl+3 = triplet, Ctrl+4 = snap on/off, Ctrl+5 = fixed/adaptive [AV 6.10; KS 42.13].
- min:sec time ruler მხოლოდ ჩვენება და scroll-ია [AV 6.1]: „In the time ruler, time is displayed in minutes-seconds-milliseconds. You can click and drag in the time ruler to scroll“. Editing ერთეულად ის არ გამოიყენება.
- წამების ბადე Live-ში **არ არსებობს**.

**(2) ჩვენი ფაქტები** (coordinator-მა `2d4a93f`-ზე შეამოწმა, მეც დავადასტურე):
- GRID l.4 `[10,5,2,1,0.5,0.25,0.1]`, ნაგულისხმევი 1 s (l.6);
- `tempoBpm` null-ით იწყება (SW l.497);
- `gridDivisionOptions` BPM-ის გარეშე მხოლოდ წამებს აბრუნებს (GDIV l.95–97);
- კატალოგის BPM Studio-ს არ გადაეცემა (`WorkspaceSource`-ს BPM არ აქვს, `types/arrangement.ts` l.78–85).

**(3) წინადადება**
- **ტემპის წყარო, პრიორიტეტის რიგით:**
  1. პროექტის/მომხმარებლის BPM;
  2. product-ის BPM (`MusicAsset.bpm`): პირველი music clip-ის წყაროდან ან Studio-ს გახსნისას product-იდან;
  3. 120 BPM ნაგულისხმევად, status-ით: „Tempo 120 (default) — set the project BPM“.
  
  Tempo detection (აუდიოდან) ცალკე, მოგვიანებით. Live-ის Auto-Warp-ის ტემპის ამოცნობა [AV 9.2.5 სათაური] აქ **არ შემიმოწმებია**.
- **ნაგულისხმევი ბადე:** მუსიკალური და **adaptive**, Snap **on** (Live-ის ნაგულისხმევი Snap დაუდასტურებელია, ამიტომ Saba-ს ვეკითხები, Q3).
- **წამები** რჩება მხოლოდ ჩვენების ruler-ად (min:sec), როგორც Live-ის time ruler. ეს FB-09-ის მოთხოვნაცაა: „ვიდეოს მონტაჟისას წამების სკალის საჭიროებასაც ინარჩუნებს“.
- **Trade-off:** მომხმარებლის ხმა შეიძლება არამუსიკალური იყოს (SFX, ambient, დიალოგი BPM-ის გარეშე). ასეთ დროს 120 BPM-იანი ბადე ხელოვნურია, თუმცა Live-იც ასე იქცევა. Film editor-ს ხშირად წამი ან კადრი სჭირდება. ორი ვარიანტი:
  - (a) ყოველთვის beat-time, 120-ით, Live-ის ზუსტი ქცევა;
  - (b) CZABA-ს დამატება (deviation): მენიუში „Time grid (seconds)“, რომელიც ჩაირთვება მხოლოდ მომხმარებლის არჩევით.
  
  ჩემი რეკომენდაცია: (a) + (b)-ის არჩევითი პუნქტი (Q3). Frame-grid ვიდეოსთვის მომავლის საკითხია.
- **მიგრაციის რისკი:** grid preference ისტორიაში არ ინახება (D-29z30 R4), ამიტომ შენახული კლიპები არ იძვრის. ტესტები კი წამების ნაგულისხმევ ბადეს ეყრდნობა (`grid-snap-position.test.tsx` SP3/SP15 „Snap on 1 s“, „10 s“; `grid-snap-*`, `markers-*`).

### 3.5 რატომ გამოგვრჩა
- **თავდაპირველი მოთხოვნა მუსიკალური იყო.** Round 47-ის ტექსტი (plan.md l.911): „მომხმარებლის დანაყოფები მუსიკალურია (1/4, 1/8 …) და tempo-ს საჭიროებს — ეს SRW-15-ია, სადაც BPM-ს მომხმარებელი წერს და 120 ჩუმად არ იგულისხმება“. B-მ ჯერ წამების ბადე ააშენა, როგორც დროებითი მოდელი, და მერე ის ნაგულისხმევად დარჩა.
- **„120 არ იგულისხმება“ ცალსახად გადაწყდა.** D-29z30 R4: „ნაგულისხმევი **არ არის** (120 არ იგულისხმება)“; R5 უარყოფილ ვარიანტებში ასახელებს „ნაგულისხმევი 120“-ს. Product BPM-ის ვარიანტი საერთოდ არ განხილულა: `/studio-lab` მხოლოდ დემოა (`routes/studio-lab.tsx`) და `WorkspaceSource`-ს BPM არ აქვს.
- **Adaptive შეგნებულ განსხვავებად ჩაიწერა.** Backlog SRW-14 `note_round67`: „zoom-adaptive grid confirmed -> deliberate difference (fixed only)“. ABL-R-8 დამტკიცდა 2026-10-25-ს, მაგრამ Low prioritet-ით REVIEW-RECOMMENDATIONS-ში დარჩა. D-29z172-ით ის STUDIO-PERFORMANCE-ის (~25 რაუნდი) შემდეგაა და ჯერ `not_started`-ია.
- **„Feel“ Tech Lead-ს გადაეცა და არავინ შეამოწმა.**
  - F1-ABSOLUTE-SNAP (root reviewer, Medium) B-მ „accepted“-ად ჩათვალა „reopen on Tech Lead R49-T evidence“-ით.
  - R49-T („select-click clips with 10 s and 1 s grids, Snap on — any accidental jump (F1)?“), R50-T, R51-T, R60-T, R67-T, R68-T დღესაც `open`-ია (backlog `tech_lead_manual_checks`).
  - Saba-ს ახლანდელი შენიშვნა ფაქტობრივად **R49-T-ის პასუხია**, ~180 რაუნდის დაგვიანებით.
- **ექსპერტული მიმოხილვის შეცდომა.** P5 row „Snap ყველა ოპერაციაზე … ruler click 4.37 → 4 … დადასტურებული“ (`ableton-review.md` l.155). Live-ში ruler/scrub click-ს Quantization კვანტავს და editing grid არა [AV 6.3]. B-მა თვითონ ჩაწერა ეს D-29z15-ში როგორც „შეგნებული განსხვავება“ (plan.md l.945). მიმოხილვამ „cursor will snap“-ის ზოგადი ფრაზა ყველა ჟესტზე გაავრცელა და time selection-ის ცარიელ ფონზე არარსებობა საერთოდ არ შეამოწმა.
- **Ruler-ების როლები შებრუნდა.** D-29z30 R4-ში ტაქტების ზოლი „მხოლოდ ჩვენებისთვისაა“, რომ წამების ruler უცვლელი დარჩენილიყო. Live-ში პირიქითაა [AV 6.1].

### 3.6 გაკვეთილები
> **L45. Reference units before reference gestures.** თუ Live ერთეულს განსაზღვრავს (beat-time grid, bars-beats ruler, dB taper), ამოცანა ჯერ ამ ერთეულს აშენებს ან მის წყაროს აერთებს (product BPM, ნაგულისხმევი ტემპი). დროებითი ერთეული (წამები) ნაგულისხმევად არ რჩება Saba-ს დასტურის გარეშე. „Never assume X“ ბრძანება ამოცანაში ასახელებს რეალურ წყაროს, რომელიც X-ის ნაცვლად გამოიყენება. Evidence: SABA-B-11 (FB-13 მუსიკალური იყო; წამები 47-ე რაუნდიდან ნაგულისხმევია; კატალოგის BPM Studio-ს არ მიეწოდება) (1×).

> **L46. A parked feel-check has a deadline.** Tech Lead-ის ხელით შესამოწმებელი row (R49-T…R68-T), რომელიც Medium finding-ს აფერხებს (F1-ABSOLUTE-SNAP), ყოველ RETRO-ზე Saba-ს მიეწოდება ერთი კონკრეტული კითხვით. თუ 2 RETRO-ის მერე პასუხი არ არის, finding ხელახლა იხსნება და ჩვეულ ამოცანად იგეგმება. „accepted until feel-check“ ვადის გარეშე არ იწერება. Evidence: F1-ABSOLUTE-SNAP (round 47 → 2026-10-28, R49-T open) (1×).

`lessons.md` ≤ 60 ხაზის წესით: L43–L46 ოთხი ახალი ხაზია. RETRO-მ ერთი ძველი (1×, მოძველებული) უნდა ჩაანაცვლოს. რომელი, ამას B წყვეტს.

---

## 4. შემოთავაზებული loop task-ები

ზოგადი წესი: ყოველ ამოცანას აქვს `Reference: how Ableton does it` და `Why we missed it` (policy 2026-10-27/28), lessons L43–L46 (C ამოწმებს, რომ არსებობს), screen-budget row-ები 1440×900 და 1280×720-ზე, ცარიელი და დემო პროექტი, before/after.

**რიგის რეკომენდაცია:** SABA-B-10a (მოდელი) → SABA-B-9 (layout + Stop ღილაკი) → SABA-B-10b (UI/კლავიშები) → SABA-B-11a → 11b → 11c. B-9 და B-10-ს Stop ღილაკი აერთებს, ამიტომ B-9 Stop-ს ამატებს, B-10 კი მას ქცევას აძლევს.

### 4.1 SABA-B-9: transport შუაში
- **Scope:** `ArrangementTransport.tsx`-ის წყობა სამ ჯგუფად:
  - **მარცხნივ:** Undo, Redo, Split, Delete (edit);
  - **შუაში:** Follow · Position (საათი, `/ end`) · **Play** · **Stop** (ახალი, lucide `Square`) · Back to start · Loop;
  - **მარჯვნივ:** Zoom-ის ჯგუფი, Fit, Export.
  
  Live-ის რიგია Follow/Position → Transport → Loop [LC]. Record არ ემატება. Back to start Live-ში ცალკე ღილაკი არ არის, მაგრამ რჩება, რადგან Saba-მ transport-ის ტექსტური ღილაკები დატოვა.
- **Reference:** [LC] ch. 3 „The Control Bar“, 9 სექციის რიგი; [AV 6.3] „The Play and Stop Buttons in the Control Bar“.
- **Deviations:**
  - Browser Options, Tempo, Scale, MIDI/CPU, View Selector toolbar-ში არ არის. Tempo ArrangementTempoRow-შია (D-29z30 R5: transport-ში ადგილი არ არის 1280-ზე);
  - Undo/Redo/Split/Delete toolbar-ში რჩება: Live-ში ეს მენიუებშია, Saba-მ კი ღილაკები დატოვა;
  - შუა ჯგუფი გეომეტრიულად ცენტრშია (grid `1fr auto 1fr`), მაშინ როცა Live-ში ის რიგით არის შუაში.
- **Acceptance (C, რეალური browser):**
  1. 1440×900: შუა ჯგუფის ცენტრი toolbar-ის ცენტრიდან ≤ 24 px-ზეა (bbox). Play-ის მარცხნივ Position-ია, მარჯვნივ Stop.
  2. 1280×720: toolbar-ის სიმაღლე არ იზრდება HEAD-თან შედარებით (დღეს 2 რიგი, ~87 px). Play/Stop პირველ რიგშია და ცენტრშია. ჯგუფები ერთმანეთს არ ფარავს.
  3. Tab-ის რიგი ვიზუალურ რიგს მიჰყვება. Focus ring SABA-B-4-ის სტილისაა.
  4. Play click → ხმა (output tap). Stop click → სიჩუმე. Space ორივე ღილაკზე იგივეა, რაც დღეს.
  5. Screen budget: მუდმივი ტექსტის ხაზების რაოდენობა ±0 (Stop მხოლოდ icon-ია, title „Stop (Space)“).
  6. Stop-ის double-click → პოზიცია 0 (B-10a-მდე ეს Home-ის ექვივალენტია).
- **Rounds:** ~1.5 (1 + fix-up).
- **რისკები:**
  - `transport-surface-ui.test.tsx` TS1 („all 12 transport buttons“), TS2 (Play-ის ფორმა), TS6 (glyph-ები), L40 data-testid-ის წესი;
  - 1280-ზე მეორე რიგის ქცევა (SR-230-4-ის zoom-ის გამარტივება შეიძლება ერთად გადაწყდეს, მაგრამ ცალკე დამტკიცებაა საჭირო);
  - მცურავი ვიდეოს reference-ები და toolbar-ის სიმაღლე (plan.md l.531 R25-L);
  - CALM-1b-ის tooltip-ები (`studioShortcutTitle`), ახალი row `stop` `shortcuts.ts`-ში.

### 4.2 SABA-B-10: Insert Marker
**10a: მოდელი (ქცევა, UI-ის გარეშე)**
- **Scope:** ArrangementContext-ში ორი პოზიციაა:
  - `insertMarker` (დრო; Live-ში track-იც, ჩვენთან ჯერ მხოლოდ დრო);
  - `playhead` (song position).
  
  ქცევა:
  - click lane/clip body/ruler-ზე, Position ველი, ←/→ → იცვლება `insertMarker`. გაჩერებულ მდგომარეობაში playhead მას მიჰყვება;
  - **Space (გაჩერებული):** იწყებს time selection-ის დასაწყისიდან, თუ ის არსებობს, თორემ `insertMarker`-იდან [AV 6.3, 6.4; KS „Play Arrangement View Selection“];
  - **Space (დაკვრისას):** Stop; `insertMarker` უცვლელია; stop point ინახება;
  - **Shift+Space:** stop point-იდან [AV 6.3];
  - **Ctrl/Cmd+Shift+Space:** `insertMarker` = playhead [KS 42.16, NEW12];
  - **Home** / double-click Stop / ↤ → `insertMarker` = 0 [AV 6.3].
  
  Paste, M (გაჩერებული), Ctrl+E (როცა range არ არის) და Enter-ით add იყენებს `insertMarker`-ს. დაკვრისას M იყენებს playhead-ს (ABL-R-10-ის დამტკიცებული ვარიანტი). D-27 ხელახლა იწერება `insertMarker`-ზე.
- **ღია საკითხი Live-ში (დაუდასტურებელი):** დაკვრისას click lane-ზე დაკვრას გადაიტანს თუ მხოლოდ marker-ს. ჩემი რეკომენდაცია: მხოლოდ marker. სხვაგვარად Live-ის „Space starts from the insert marker“ დაკვრის დროს აზრს კარგავს. B-მ ეს `ableton-arrangement-expert`/`docs-explorer`-ით უნდა გადაამოწმოს ან Saba-ს ჰკითხოს (Q1).
- **Deviations:**
  - ერთი time-only marker, track-ის კომპონენტის გარეშე (↑/↓ track-ებს შორის არ გადადის). მიზეზი: ჩვენი track-ის არჩევა ცალკე `activeTrack`-ით ხდება;
  - Ctrl+Space (Stop at End of Selection) არ ემატება: DUX-მა ის უარყო macOS-ის ენის გადართვის გამო (`design-ux-review.md` l.260).
- **Acceptance (C):**
  1. click 2.000 → Space → 1.5 წმ → Space (stop 3.5) → Space: **ხელახლა 2.000-დან** (output onset / position).
  2. იგივე, მაგრამ ბოლოს Shift+Space → 3.5-დან.
  3. Range 5–7 → Space → 5.000-დან.
  4. Stop-ის შემდეგ Ctrl+Shift+Space → marker 3.5-ზე, შემდეგ Space → 3.5-დან.
  5. Home / Stop-ის double-click → marker 0.
  6. Paste, M (გაჩერებული), Ctrl+E marker-ზე ჯდება. M დაკვრისას playhead-ზე ჯდება.
  7. ვიდეოს `currentTime` მიჰყვება stop-ს და შემდეგ marker-ზე დაბრუნებას (Q1-ის მსგავსი გაზომვა ±11 ms).
  8. D-27: ბოლოს მიღმა marker → უარი და status.
  9. Screen reader: status ამბობს „Playing from the insert marker 00:02.000“ / „Continuing from 00:03.500“.
- **Rounds:** ~2 (მოდელი + ტესტების მიგრაცია).
- **რისკები:**
  - ArrangementContext-ის ტესტები D-27-ის ბლოკში (`ArrangementContext.test.ts` l.612–697);
  - R4-P3 / `transport.test.ts`;
  - `grid-snap-position.test.tsx` SP14 (paste ruler click-ის შემდეგ);
  - `markers-*` (M range.start / position);
  - `all-lane-clipboard.test.tsx` („stopped playhead“ l.429/469);
  - 44 test ფაილი იყენებს Space-ს ან `togglePlayback`-ს (grep);
  - video-sync (`video-fades-ui` VU3 „stopped position“);
  - INFO-C101-SPACE, D-29z64 (Space გლობალურია).
  
  B-მ L23-ის pre-check ყველაზე უნდა გაუშვას.

**10b: UI**
- **Scope:** მოციმციმე Insert Marker-ის ხაზი lane-ებზე, გაჩერებისას ხილული. Playhead ჩანს დაკვრისას და stop point-ზე. Stop ღილაკი (B-9) იღებს double-click-ს. Sheet-ის row-ები: `Play from the insert marker · Stop` (Space), `Continue from the stop point` (Shift+Space), `Insert marker to the playhead` (Ctrl+Shift+Space), `Insert marker to the start` (Home · double-click Stop).
- **Deviation:** ფერი Live-ის ლურჯის ნაცვლად CZABA-ს selection/accent token-ია (DUX-R-5: accent = selection/playhead). ციმციმი მხოლოდ `motion-safe:`-ით, `prefers-reduced-motion`-ზე სტატიკურია.
- **Acceptance:**
  1. გაჩერებისას marker ჩანს click-ის ადგილას და ციმციმებს (opacity-ის ცვლა ≥ 2-ჯერ 2 წმ-ში); reduced-motion-ზე ციმციმი არ არის.
  2. Stop-ის შემდეგ ორი ხაზი ჩანს: marker 2.0 და playhead 3.5.
  3. Contrast ≥ 3:1 lane-ის ფონზე (1.4.11).
  4. Sheet-ში 4 ახალი row-ა, `aria-keyshortcuts` ემთხვევა.
  5. Screen budget ±0.
- **Rounds:** ~1–1.5.
- **რისკები:** playhead-ის mask-ის რეგრესია (K8, DUX-R-5b scan-ები); L39/L40.

### 4.3 SABA-B-11: Grid (მუსიკალური, adaptive, Live-ის ჟესტები)
**11a: ტემპი და მუსიკალური ნაგულისხმევი**
- **Scope:**
  - `WorkspaceSource.bpm?: number` (product BPM, `MusicAsset.bpm`); ტემპის seed-ის წესი §3.4(3);
  - grid-ის ნაგულისხმევი: მუსიკალური (Q3-ის პასუხის მიხედვით 1/4 ან 1 bar) და Snap on (Q3);
  - წამების დანაყოფები მენიუში მხოლოდ არჩევით (ან სრულად ქრება, Q3);
  - **ruler-ების როლები:** ტაქტების ruler ხდება ინტერაქტიული (click = Insert Marker, drag = scroll/zoom), წამების ruler კი მხოლოდ ჩვენება და scroll [AV 6.1].
- **Reference:** AV 6.1, 6.10; LC Tempo Settings.
- **Deviations:**
  - 120-ის ნაგულისხმევი Live-ის ნაგულისხმევ ტემპად არ არის დადასტურებული. მიზეზი Saba-ს მოთხოვნაა („მუსიკალური, როგორც Ableton“);
  - „Time grid (seconds)“ CZABA-ს დამატებაა ვიდეოსთვის (Q3);
  - 4/4 ფიქსირებულია (D-29z30).
- **Acceptance:**
  1. ცარიელ `/studio-lab`-ზე grid-ის control აჩვენებს მუსიკალურ დანაყოფს და `data-grid-division` ∈ {bar…1/32}. Status ამბობს „Tempo 120 (default)“.
  2. დემოში BPM-იანი წყარო (fixture: bpm 90) → ტემპი 90, ტაქტების ხაზები 90-ზე, კლიპის drag ჯდება 1/4-ზე = 0.6667 s-ის ჯერადზე.
  3. BPM-ის ხელით შეცვლა seed-ს აჭარბებს.
  4. ტაქტების ruler-ზე click → marker ბადეზე; წამების ruler-ზე click → marker არ იცვლება (მხოლოდ scroll).
  5. WAV export byte-identical (ტემპი აუდიოს არ ცვლის).
  6. Purchased-ის გზა `page.route` stub-ით (L36).
- **Rounds:** ~2.
- **რისკები:**
  - ყველა ტესტი, რომელიც „1 s“ ნაგულისხმევს ეყრდნობა (`grid-snap-*.test.tsx`, SP3/SP15, `markers-*`, `loop-*`);
  - D-29z30 R4/R5-ის გაუქმება D-ID-ით;
  - ARCH-CHECKPOINT-SRW14-PREFS (grid-ის state SW-შია და არა context-ში);
  - backend-ის BPM-ის ფორმატი (Q: მთელი რიცხვია თუ ათწილადი);
  - SFX-ს BPM არ აქვს.

**11b: adaptive ბადე და კლავიშები (ABL-R-8-ს ხურავს)**
- **Scope:**
  - Adaptive რეჟიმი, ნაგულისხმევად ჩართული: დანაყოფი ისე ირჩევა, რომ ხაზებს შორის მანძილი მიზნობრივ px-დიაპაზონში იყოს. Narrow/Widen adaptive რეჟიმში სიმჭიდროვის დონეს ცვლის [AV 6.10: „width of both zoom-adaptive and fixed grid lines“];
  - კლავიში **5** = Fixed/Adaptive, **4** = Snap (G რჩება alias-ად), როგორც Live-ის Ctrl+4/5 Ctrl-ის გარეშე (D-29z24-ის მიზეზი);
  - მენიუში ემატება „Adaptive / Fixed“ და adaptive-ის სიგანეები;
  - **snap არასდროს ხდება უხილავ ბადეზე:** fixed რეჟიმში, თუ ხაზები დამალულია (< 6 px), snap ხილულ ბიჯზე გადადის ან status-ს წერს.
- **Deviation:** plain digit-ები და არა Ctrl+digit (Chrome-ის tab-ები). Mac-ზე bypass Option-ია და არა Cmd (Cmd+drag ბრაუზერში სხვა მნიშვნელობისაა; Live-ში Cmd-ია). B-მ ეს თავიდან უნდა შეაფასოს.
- **Acceptance:**
  1. Adaptive: zoom 40 → 160 px/s → `data-grid-division` ავტომატურად ვიწროვდება, ხაზებს შორის ≥ 6 px და ≤ 2× მიზნობრივი მანძილი.
  2. 5 → fixed: დანაყოფი zoom-ზე აღარ იცვლება. 5 ხელახლა → adaptive.
  3. 4 = G (snap toggle), ტექსტურ ველში არაფერს აკეთებს.
  4. 320 px/s-ზე range drag ეკრანზე ≤ 1 ხილულ დანაყოფზე ხტება (არა 320 px).
  5. Fixed 1/32 და Fit (5 px/s): snap არ ხდება უხილავ ხაზზე.
- **Rounds:** ~1.5.
- **რისკები:** R60-T (native select და 1/2), SP15, grid-menu-ის ტესტები (MN-*), shortcut sheet-ის row-ები (`shortcuts.ts` l.76–79).

**11c: ჟესტები, როგორც Live-ში**
- **Scope:**
  - **time selection ცარიელ ფონზეც:** lane-ის ფონზე drag ქმნის range-ს, როგორც Live 6.9-ში. Marquee გადადის modifier-ზე ან clip header-ის ზონაზე, B-ის `flow-sage` consult-ით და Saba-ს კითხვით, რადგან დღევანდელ ქცევას ცვლის;
  - **range კლიპის საზღვრით აღარ იზღუდება;**
  - **relative snap (F1):** off-grid კლიპის drag ინარჩუნებს offset-ს, ან ბადეზე ჯდება მხოლოდ ზღვრის შემდეგ. Live-ის ქცევა **დაუდასტურებელია**, ამიტომ `ableton-arrangement-expert`-ის consult-ი აუცილებელია. წყაროს გარეშე B წერს „no reference found“ და Saba-ს ეკითხება;
  - **ruler click:** Insert Marker editing grid-ით. თუ დაკვრის დაწყება ემატება, ნახტომი Quantization-ით [AV 6.3] (Q2-ის მიხედვით).
- **Acceptance:**
  1. ცარიელ ადგილზე drag 12.3 → 15.8 (Snap on, 1/4 @120) → range 12.5–16.0. Space → 12.5-დან (B-10a).
  2. Range ორი კლიპის გავლით, საზღვრის გარეშე.
  3. Clip 4.3 (off-grid), 3 px jitter → start უცვლელია; 1 დანაყოფით drag → offset შენარჩუნებულია ან ხაზზე ჯდება (გადაწყვეტილების მიხედვით).
  4. Alt ყველაფერს აუქმებს.
  5. Marquee ხელმისაწვდომია ახალი ჟესტით.
- **Rounds:** ~2.
- **რისკები:**
  - SP13 („a marquee drag from an empty lane selects and does not seek“), marquee-ს ტესტები (SRW-06/07);
  - `grid-snap-edit.test.tsx` (range-ის clamp);
  - F1-ის ცვლილება ცვლის D-29z14/17/18/27/28-ის nearest-wins ლოგიკას (`snapGroupMoveDelta`, GRID l.285–307);
  - R4-P2 (range drag დაკვრისას დაკვრას არ ცვლის) უნდა დარჩეს.

**SABA-B-11 ჯამში ~5.5 რაუნდია. B-9 + B-10 + B-11 ერთად ~10 რაუნდი.**

---

## 5. კითხვები Saba-სთვის (≤ 4, თითოეულს აქვს რეკომენდებული ნაგულისხმევი)

1. **დაკვრისას click lane-ზე:** მხოლოდ Insert Marker გადაიტანოს (დაკვრა გაგრძელდეს ძველი ადგილიდან) თუ დაკვრაც იქ გადავიდეს, როგორც დღეს? **ნაგულისხმევი:** მხოლოდ marker. ასე Space→Stop→Space ყოველთვის იმ ადგილიდან იწყება, სადაც კურსორი დასვი. Live-ის ტექსტი ამას პირდაპირ არ ამბობს, ამიტომ ვამოწმებთ.
2. **Ruler-ზე click:** მხოლოდ marker დასვას, თუ Live-ის scrub area-ს მსგავსად დაკვრაც დაიწყოს? **ნაგულისხმევი:** ტაქტების ruler-ის ზედა ზოლზე click იწყებს დაკვრას (Live 6.3), lane-ზე click კი მხოლოდ marker-ს სვამს.
3. **ბადე ხმისთვის, რომელსაც BPM არ აქვს (SFX, ambient):** ყოველთვის მუსიკალური 120 BPM-ით, Live-ის მსგავსად, თუ მენიუში დარჩეს არჩევითი „Time grid (seconds)“? **ნაგულისხმევი:** მუსიკალური + adaptive + Snap on ყველგან. ტემპი product-იდან, თორემ 120. წამების ბადე მენიუში არჩევით პუნქტად რჩება ვიდეოს მონტაჟისთვის. min:sec ruler ყოველთვის ჩანს.
4. **Play შუაში და ცალკე Stop ღილაკი:** შუა ჯგუფი იყოს `Follow · საათი · Play · Stop · ↤ · Loop`, Undo/Redo/Split/Delete მარცხნივ, Zoom/Export მარჯვნივ? **ნაგულისხმევი:** დიახ. Stop ემატება icon-ის სახით (double-click → დასაწყისი). Toolbar 1280-ზე არ უნდა გაიზარდოს.

---

## 6. მტკიცებულებები (ბილიკები)
- Ableton capture-ები: `/home/claude/czaba-studio-loop/loop/b-round-71/ableton-arrangement-view-20261021.txt`, `.../ableton-shortcuts-20261021.txt`
- მიმოხილვები: `/home/claude/czaba-studio-loop/loop/user-review/ableton-review.md` (l.15, 22, 70–85, 144–158, 195–217), `design-ux-review.md` (l.62–66, 221, 260), `screen-review-230.md` (l.12, 21), `ableton-decisions.md`
- Policy: `/home/claude/czaba-studio-loop/loop/policy.local.md` l.123–147 (review/VISUAL-A), l.227–238 (reference-first), l.255–270 (Why we missed it, screen budget)
- D-15: `/home/claude/czaba-studio-loop/loop/b-round-1.md` l.49; `/home/claude/czaba-studio-loop/docs/technical/studio-real-workspace/plan.md` l.77, 185–190 (D-27), 192–197 (D-28), 911 (FB-13 → წამები), 940–945 (D-29z15), 1110–1113 (D-29z30 R4/R5), 2391
- Backlog: `/home/claude/czaba-studio-loop/loop/backlog.json`: items SRW-04, SRW-14 (stages, note_round67), `open_findings` F1-ABSOLUTE-SNAP, `tech_lead_manual_checks` R49-T/R50-T/R51-T/R60-T/R67-T/R68-T, REVIEW-RECOMMENDATIONS (ABL-R-8 `not_started`)
- FB: `/home/claude/czaba-project/docs/video-to-text-bugs/README.md` l.27 (FB-01), 35 (FB-09), 39 (FB-13)
- Shortcut sheet: `/home/claude/czaba-studio-loop/loop/b-round-227/granted-start/app/lib/arrangement/shortcuts.ts` l.19, 76–79
