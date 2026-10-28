## დიზაინ რეკომენდაცია: Studio-ს სიმშვიდე ("ზედმეტად გადატვირთულია")

**მოკლე პასუხი Saba-ს:** უმეტესობაში მართალია. ცარიელ დემო პროექტზე ეკრანზე 13 ინსტრუქციული წინადადება ჩანს: badge, library notice, Active track, video caption note, "No video added yet", BPM hint, Loop hint, video lane hint, "Select a clip…", ორჯერ "Select a clip first", status და shortcut line. ეს ხელსაწყოს კი არა, ინსტრუქციის ფურცლის შთაბეჭდილებას ქმნის. სამ რამეში კი არ ვეთანხმები. **Overview** ფუნქციაა და არა დეკორაცია. **Status line** ერთადერთი feedback-არხია. **Synthetic demo notice** ჩვენს Perceived Value-ს იცავს. ეს სამი რჩება, ოღონდ უფრო მშვიდი ფორმით.

### ფსიქოლოგიური ანალიზი
- **Perceived Value (Psychological):** ის ტექსტი, რომელიც ეკრანზე სამუდამოდ ხსნის, როგორ ვიმუშაოთ, ინტერფეისის „ბოდიშის მოხდაა“. პროფესიონალი თავდაჯერებულ ეკრანზე თავს შინ გრძნობს, ხოლო ის ეკრანი, რომელიც მუდმივად ასწავლის, მას დამწყებად აქცევს.
- **Desire Gap:** სასურველი „მე“ არის „ფილმის კომპოზიტორი საკუთარ სტუდიაში“, და არა „მომხმარებელი, რომელიც footer-ში კლავიშების სიას კითხულობს“.
- **Aesthetic-Usability (50ms):** პირველ წამში თვალი ჯერ მკრთალ ტექსტზე ჩერდება (footer, ზოლები, detail) და კონტენტამდე მერე მიდის. თვითონ shortcut line ზმნების გარეშეა: „Space · Home · Ctrl+E…“. ახალბედას ის არაფერს ასწავლის, გამოცდილს კი არ სჭირდება.

### Star Brand ლინზები
- **Quiet Luxury:** სივრცე სიმდიდრეა. მუდმივი ტექსტი timeline-ის „ტილოზე“ (BPM/Loop ზოლები) ყველაზე ძვირი ხმაურია, რადგან კონტენტთან ყველაზე ახლოსაა.
- **Craftsmanship:** detail panel-ის ცარიელ მდგომარეობაში ერთი აზრი ოთხჯერ მეორდება. ruler-ზე „0:00“-ის „0“ playhead-ის ხაზის ქვეშ იმალება (`:00` ჩანს): ეს ცალკე Low ნიუანსია.
- **Atelier / კურაცია:** ყოველი მინიშნება მაშინ ჩანს, როცა მისი დროა (hide-until-needed). ამის კარგი მაგალითი უკვე არსებობს: range-ის hint „Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time“ მხოლოდ მონიშვნისას ჩნდება. ეს პრინციპი ყველგან უნდა გავავრცელოთ.
- **Ritual:** shortcut sheet არის „საჩუქრის გახსნის“ ადგილი. კლავიშების ცოდნა მომხმარებელმა თავად უნდა აღმოაჩინოს, ეკრანი მას თავს არ უნდა ახვევდეს.

### Ableton-ის ფაქტები (მხოლოდ წყაროთი)
- **6.1 (F):** „The Overview displays the Arrangement's entire layout of clips from start to end and can be used for zooming and navigation.“ Overview layout-ის ნაწილია. წყარო: `/home/claude/czaba-studio-loop/loop/b-round-71/ableton-arrangement-view-20261021.txt`.
- **42.1 (F):** Hide/Show Info View — Shift+?; Hide/Show Overview — Ctrl+Alt+O; Hide/Show Video Window — Ctrl+Alt+V; Close Window/Dialog — Esc. წყარო: `/home/claude/czaba-studio-loop/loop/b-round-71/ableton-shortcuts-20261021.txt`.
- **ch.42 (F):** shortcut-ები manual-ის ცალკე თავშია, Windows/Mac სვეტებით. **6.10 (F):** grid-ის კლავიშები „also available as Options menu commands“, ანუ კლავიში მენიუს ბრძანებასაც ემთხვევა.
- **2.2.2 Info View და 3.2 Status Bar** არსებობს, მაგრამ capture-ში მხოლოდ სარჩევშია. მათი შინაარსის აღწერა ჩვენ არ გვაქვს (**?**), ამიტომ B-მ WebFetch-ით უნდა გადაამოწმოს, სანამ რამეს „Info View-ს მსგავსი“ ეწოდება.
- manual-ის layout-ის აღწერაში (6.1) ეკრანზე მუდმივი shortcut-ზოლი არ ჩანს. „Live-ში არ არის“ capture-ით ვერ დავამტკიცე, ამიტომ ვწერ „manual არ აღწერს“.
- `/home/claude/czaba-studio-loop/docs/technical/studio-real-workspace/next-stage-t12/ableton-notes-source.txt` მხოლოდ Gain/Volume-ზეა. layout-ის ფაქტი მასში არ არის.

---

## 1. ვერდიქტი ელემენტების მიხედვით

ბილიკები `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/`-ის მიმართ.

| ელემენტი (ფაილი:ხაზი) | ვერდიქტი | რატომ | სად გადადის |
|---|---|---|---|
| **Shortcut line** `components/arrangement/StudioWorkspace.tsx:2651–2655` (`arrangement-shortcut-hint`) | **remove** | ზმნის გარეშე 19 კლავიში არაფერს ასწავლის. `dim` 3.67:1-ია (DUX-B-1, baseline 608187f; C ხელახლა გაზომავს). manual-ში shortcut-ები ცალკე თავშია. Quiet Luxury | `?` shortcut sheet + footer-ის ღილაკი „Shortcuts ?“ + კლავიში ყოველი ღილაკის tooltip-ში |
| იგივე slot drag-ისას: lane-move hint `StudioWorkspace.tsx:2638–2649` | **keep, move** | კონტექსტურია და მხოლოდ drag-ისას ჩანს, სწორი პატერნია | footer-ის კონტექსტურ ხაზში (selected-clip ხაზის ადგილას drag-ის დროს) |
| **„ARRANGEMENT · Overview“ label** `ArrangementVideoDock.tsx:890–894`, `lib/arrangement/strings.ts:790` | **remove** (ვიზუალურად) | ობიექტი თავად ჩანს, label დუბლიკატია. `aria-label` (`strings.ts:355`) რჩება | მხოლოდ aria-label და title |
| **Overview** `ArrangementOverview.tsx:282–337` | **keep, slim, toggle** | ფუნქციაა (იხ. §3) | ცარიელ პროექტში მშვიდი მდგომარეობა; Ctrl+Alt+O (Saba-ს თანხმობით) |
| **Video caption note** „· sound from the video track (M/S/Volume)“ `ArrangementVideoDock.tsx:200–208`, `strings.ts:792` | **remove → tooltip** | „Original sound“ ლეიბლი (`strings.ts:656`) იმავეს ამბობს | video ხაზის M/S/Volume-ის title. caption-ში დარჩეს მხოლოდ ფაილის სახელი, როცა ვიდეო ჩატვირთულია |
| Dock „No video added yet“ `ArrangementVideoDock.tsx:960` | **hide-until-needed** | ვიდეოს არარსებობას ეკრანი სამჯერ ამბობს (dock, lane, caption) | მშვიდი ცარიელი მონიტორი (icon ან უბრალოდ ჩარჩო). ქმედების მინიშნება მხოლოდ lane-შია |
| Video lane „No video — use “Your own video” or drop a file here“ `strings.ts:658` | **keep** | ქმედებაზე ორიენტირებულია, DUX-R-4-ის ეტალონი | — |
| **BPM hint** „Bars: set a BPM — grid only, audio is not stretched“ `ArrangementTempoRow.tsx:96–99`, `strings.ts:318` | **move** | „audio is not stretched“ მნიშვნელოვანი ფაქტია: Ableton-ის მომხმარებელი warp-ს ელის. მაგრამ ტილოზე სამუდამოდ არ უნდა ეწეროს | BPM ველის title + ერთჯერადი status BPM-ის დაყენებისას („Tempo 120 BPM — grid only, audio is not stretched.“). ცარიელ ველს placeholder „—“ (DUX-B-3-საც შველის) |
| **Loop hint** „Loop: make a time selection and press Loop (Ctrl+L)“ `ArrangementLoopBrace.tsx:275–278`, `strings.ts:268` | **move** | ერთჯერადი სიტუაციის მუდმივი ინსტრუქციაა | Loop ღილაკის disabled title (DUX-R-4b) + sheet |
| **Library notice** „The stems are a synthetic demo…“ `ArrangementLibrary.tsx:496–500`, `data/studio-lab-demo.ts:154–155` | **keep, shorten** | იცავს Perceived Value-ს (სინთეზური stems-ით CZABA-ს ხარისხი არ უნდა შეფასდეს) და სიმართლეს | ერთი ხაზი: „Synthetic demo stems — not CZABA catalogue audio.“ dismiss-ის ვარიანტი Q2-შია |
| **„Demo collection — no sign-in required“ badge** `StudioWorkspace.tsx:2238–2240`, `lib/arrangement/collection.ts:17` | **keep** | პირველ ვიზიტს ამშვიდებს (F-14 acceptable). „demo“ ეკრანზე 7+-ჯერ მეორდება, მაგრამ badge ყველაზე ნაკლებად იკავებს ადგილს | უცვლელი. სიმეორეს notice-ის შემოკლება ამცირებს |
| **Status line** `StudioWorkspace.tsx:2577–2583` | **keep** | aria-live feedback-ის არხია, უარის ტექსტებიც აქ ჩნდება („Playhead must be inside…“). მისი მოხსნა აღმოჩენადობას და a11y-ს დააზიანებს | first-run ტექსტი (`collection.ts:19`) იწერება ასე: „Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.“ (drag დღეს არსად წერია, ABL-B-1/T1) |
| Selected-clip reserve line `StudioWorkspace.tsx:2629–2637` | **keep** | layout shift-ს იცავს | ხდება ერთადერთი კონტექსტური ხაზი (clip / range / lane-move) |
| **Clip details empty state** `ArrangementDetailPanel.tsx:917–921, 931–934`; reasons `:567, :613`; `strings.ts:707–712` | **collapse text, keep geometry** | „Nothing selected“ + „Select a clip to see its details“ + 2× „Select a clip first“ ერთი და იგივე აზრია | ერთი ხაზი: „Select a clip to edit its time selection and Clip Gain.“ ველები იმავე bbox-ში რჩება disabled სახით, მიზეზი title-ში. არჩევისას არაფერი ხტება |
| **Duplicated labels:** „Active track: Music · playhead 00:00.000“ (`ArrangementLibraryPreview.tsx:278–285`) და lane-ის „· active“ (`strings.ts:653`) | **keep both, reword library line** | lane badge Add-ის სამიზნეს აჩვენებს. library-ს ხაზი Add ღილაკთან ამბობს, სად ჩაჯდება ხმა | „Adds to Music at 00:00.000“: ერთი აზრი, ზმნით |
| „Original sound“ video fader-ის ქვეშ | **keep** | video fader-ს განასხვავებს | — |
| Transport-ის ტექსტიანი ღილაკები (Undo/Redo/Split/Delete/Loop), Snap / grid / Env / 1×, Follow, Zoom, Fit, Export | **keep** (პოზიციები უცვლელი) | კუნთის მეხსიერება და აღმოჩენადობა | title-ებს კლავიში ემატება (Undo/Redo-ს დღეს არ აქვს, R77-BUTTON-SHORTCUT-SUPERSET) |
| Row labels BPM / MARKERS / LOOP, marker + ‹ › | **keep** | Ableton-ის მომხმარებლის ორიენტირებია | — |
| „40 px/s“ readout | **keep** (Low, შეიძლება hover-ზე) | ტექნიკურია, მაგრამ მცირე | — |

**ასევე შევნიშნე (არ ვთავაზობ ამ ეტაპში):** 1280-ზე toolbar ორ რიგად იყოფა და მეორე რიგი თითქმის ცარიელია (ცნობილი P1 შენიშვნა). ეს 1280-ზე „გადატვირთულობის“ შეგრძნების დიდი წყაროა და ცალკე საკითხია Saba-სთვის.

---

## 2. Shortcut-ების სახლი

**რეკომენდაცია: ერთი modal sheet, სამი შესასვლელით.** ცალკე გვერდზე გადასვლა კონტექსტს აკარგვინებს, modal კი Esc-ით მაშინვე იხურება (Live 42.1: „Close Window/Dialog Esc“, F).

1. **`?` კლავიში** (Shift+/; შედარება `event.key === '?'` ან `code === 'Slash'` + Shift, ქართული განლაგებისთვის, F-5-ის პრინციპით). ტექსტის ველში არ მუშაობს (`isTypingTarget`), Export dialog ღიაა თუ არა. Live-ში Shift+? Info View-ს რთავს, ჩვენთან ცნობარს ხსნის: ეს **Deviation**-ში ჩაიწერება, რადგან ორივე „დახმარების“ კლავიშია.
2. **Footer-ის ღილაკი** shortcut line-ის ადგილას, მარჯვენა კიდეზე: Keyboard icon + „Shortcuts“ + kbd „?“; `aria-label="Keyboard shortcuts (?)"`.
3. **კლავიში ყოველ tooltip-ში**, „Label (Key)“ ფორმატით, რომელიც უკვე გამოიყენება: „Undo (Ctrl+Z)“, „Redo (Ctrl+Shift+Z)“, „Back to start (Home)“, „Play / Stop (Space)“, „Loop selection (Ctrl+L)“; `aria-keyshortcuts`-ც ემთხვევა.

**Craftsmanship:** ერთი წყარო. sheet-ის სია და tooltip-ის კლავიშები ერთი constant-იდან იკითხება (`lib/arrangement/strings.ts` ან `shortcuts.ts`), რომ ერთმანეთს არ დაშორდეს. sheet-ში მხოლოდ მომუშავე კლავიშები ჩანს. როცა ABL-R/DUX-R-7 დაემატება, სტრიქონებიც მაშინ დაემატება.

**ვიზუალი:** Instrument Sans (action) + IBM Plex Mono (kbd chips, 12 px, 1 px outline, radius-sm, pill-ის გარეშე: SABA-B-4-ის ესთეტიკა). 1440-ზე ორი სვეტი, 1280×720-ზე scroll (max-h ~80vh). brass მხოლოდ focus-ზეა (DUX-R-5). ძებნის დამთხვევა foreground weight-ით ჩანს, არა accent-ით. ანიმაცია 200 ms fade + 2 px rise, `motion-reduce` გამორთულია. აქ ჩემს საერთო 300–600 ms-იან წესს შეგნებულად ვამცირებ: DAW-ში ნელი გადასვლა lag-ად აღიქმება, Saba კი უკვე უჩივის სისწრაფეს (SABA-B-5).

**Microcopy:**
- Title: **Keyboard shortcuts**
- Subline: **Ctrl means ⌘ on Mac · Alt means ⌥ · Press ? or Esc to close.**
- Search placeholder: **Search: split, zoom, loop…**
- Empty: **Nothing matches “{query}”.**
- Close: aria **Close (Esc)**

**დაჯგუფება** (ch.42-ის ლოგიკით; ყველა კლავიში D2-ის ცხრილით მომუშავეა):

| Group | Action | Keys |
|---|---|---|
| **Transport** | Play / Stop (continues from where it stopped) | Space |
| | Back to start | Home |
| | Loop the selection · Loop on/off | Ctrl+L |
| **Edit** | Undo | Ctrl+Z |
| | Redo | Ctrl+Shift+Z · Ctrl+Y |
| | Copy · Cut · Paste | Ctrl+C · Ctrl+X · Ctrl+V |
| | Duplicate | Ctrl+D |
| | Delete (the gap remains) | Delete · Backspace |
| | Select all clips | Ctrl+A |
| | Add a clip to the selection | Ctrl+click · Shift+click |
| | Rename marker or group | F2 |
| **Time & clips** | Split at the playhead or selection | Ctrl+E |
| | Cut Time (closes the gap on all tracks) | Ctrl+Shift+X |
| | Extend the time selection to all tracks | Ctrl+Shift+L |
| | Nudge selection | ← / → |
| | Previous / next marker or clip edge | Ctrl+← / Ctrl+→ |
| | Add marker at the playhead | M |
| | Add the selected sound at the playhead | Enter · double-click |
| | Move to another track, keep the time | Shift while dragging |
| **Grid & snap** | Snap on / off | G |
| | Narrower / wider grid | 1 / 2 |
| | Triplet grid (needs BPM) | 3 |
| | Ignore snap while dragging | Alt + drag |
| | Envelope mode | A |
| **Zoom & view** | Zoom in / out | + / − · Ctrl+wheel |
| | Scroll left / right | Shift+wheel |
| | Zoom to selection · Previous zoom | Z · X |
| | Fit the whole project | Double-click the ruler or the overview |
| | Overview: scroll 5 s | ← / → (overview focused) |
| **Tracks & mix** | Group · Ungroup | Ctrl+G · Ctrl+Shift+G |
| | Fold / unfold group | U |
| | Add another Solo | Ctrl+click S |
| | Fader ±0.1 dB | ↑ / ↓ |
| | Fader −6 dB step | PageDown (B ამოწმებს PageUp-ს, სანამ სიაში შევა) |
| | Fine adjustment | Shift + drag |
| | Reset to default | Double-click |
| **Library** | Jump to results · move in the list | ↓ · ↑ / ↓ |
| | Add to the active track | Enter |
| | Clear search | Esc |
| | Preview from a point | Click the preview waveform · Space |
| **General** | Keyboard shortcuts | ? |
| | Close a dialog | Esc |

ეს ფარავს hint line-ის 19 ჩანაწერს და 10-ვე „უხილავ“ ქცევას (DUX §3, აღმოჩენადობა), F-7-ის (1×) გარდა. 1×-ს ახსნა უკვე title-ში აქვს და sheet-ში „Zoom & view“-ს დაემატება: „Waveform zoom (view only, sound unchanged) — 1× button“.

---

## 3. Overview: keep, slim, toggleable

**ფუნქციით და არა გემოვნებით.** 1440-ზე lane-ის ხილული სიგანე ~927 px-ია. 40 px/s-ზე ეს ~23 წმ-ია, CZABA hero კი 150 წმ-ია, ანუ timeline პროექტის ~1/6-ს აჩვენებს. Overview ერთადერთი ადგილია, სადაც მთელი cue ერთად ჩანს. მისი ფუნქციებია click = centre, drag = scroll, ↕ = zoom, double-click = Fit, ← → = 5 s (`strings.ts:355–357`). Live-ში იგივე როლი აქვს (6.1, F) და იმალება კიდეც (42.1 Ctrl+Alt+O, F). Saba-ს შეგრძნება გასაგებია: ცარიელ პროექტში ეს ცარიელი ჩარჩოა სათაურით, ანუ ფორმა შინაარსის გარეშე.

**რას ვთავაზობ:**
1. label-ის მოხსნა (§1).
2. **ცარიელ პროექტში მშვიდი მდგომარეობა:** ჩარჩო და frame არ ჩანს, მხოლოდ hairline baseline. სრული ხედი პირველ კლიპთან ჩნდება. bbox უცვლელია (h-16, ±1 px).
3. **Toggle:** Ctrl+Alt+O, Live-ის მსგავსად, localStorage-ით და sheet-ის „Zoom & view“ ჯგუფში. ახალი ხილული ღილაკი არ ემატება. modifier-ის ზუსტი შემოწმება აუცილებელია (F-5, AltGr: Ctrl+Alt+O = „ó“ ზოგ განლაგებაში; ტექსტის ველში ისედაც იგნორირდება).

**გულახდილი შეზღუდვა:** dock-ის რიგის სიმაღლეს (~97 px) video monitor განსაზღვრავს (160×90, `ArrangementVideoDock.tsx` dock), და არა Overview. Overview-ს დამალვა სიმშვიდეს აძლევს, სივრცეს არა. სივრცე მაშინ გამოთავისუფლდება, თუ ვიდეოს გარეშე მთელი რიგი დაიკეცება. ეს layout-ის ცვლილებაა და Saba-ს გადასაწყვეტია (Q3).

---

## 4. Before / After

**Before (S0, 1440):** footer-ში სამი ხაზია: status, ცარიელი reserve და 19 კლავიშის რიგი. timeline-ის ზოლებზე BPM და Loop-ის წინადადებები წერია. dock-ში არის „ARRANGEMENT · Overview“, caption note და „No video added yet“. detail panel ოთხჯერ ამბობს „არაფერია არჩეული“. ბიბლიოთეკაში სამხაზიანი notice-ია. სულ 13 ინსტრუქციული სტრიქონია.

**After:** footer-ში ორი ხაზია: status (first-run-ზე: drag, Enter და ? ერთ წინადადებაში) და კონტექსტური ხაზი, მარჯვნივ კი მშვიდი „Shortcuts ?“. timeline-ის ზოლებზე მხოლოდ labels რჩება (BPM, MARKERS, LOOP) და ტილო სუფთაა. dock-ში ცარიელი overview hairline-ია, მონიტორი კი ჩუმი ჩარჩო. detail panel ერთ ხაზს წერს, ველები იმავე ადგილზეა. notice ერთხაზიანია. ცარიელ ეკრანზე 13-ის ნაცვლად ~5 სტრიქონი რჩება და ყველა ფაქტი მისაწვდომია tooltip-ში, status-ში ან sheet-ში. timeline-ს ~20 px ემატება, რაც 1280×720-ზე DUX-R-3-საც ეხმარება.

**Top 5 სიმშვიდის მიხედვით:**
1. Shortcut line → `?` sheet + footer ღილაკი + კლავიში tooltip-ებში.
2. BPM და Loop-ის წინადადებები ტილოდან → title, ერთჯერადი status და disabled-ის მიზეზი.
3. Detail empty state: 4 სტრიქონი → 1, გეომეტრია უცვლელი.
4. Dock: Overview label, caption note და „No video added yet“ → aria/title და მშვიდი ცარიელი მდგომარეობები.
5. Demo-ს სიმეორე: notice-ის შემოკლება და first-run status, რომელიც drag-ს და `?`-ს ასწავლის.

**არ უნდა მოიხსნას:** status line (aria-live, უარის ტექსტები), range hint (კონტექსტურია, სწორი პატერნი), lane-move/Shift hint drag-ისას, video lane-ის ქმედების მინიშნება, „Original sound“, Active track ინდიკაცია, Overview-ს ფუნქცია და keyboard/aria, transport-ის ტექსტიანი ღილაკები და ყველა პოზიცია, row labels, title და aria-keyshortcuts, synthetic notice რაიმე ფორმით, clock და „/ end“.

**შეფასება ისევ S1-ში:** ცარიელი დემო გადატვირთულობის ყველაზე ცუდი შემთხვევაა. კლიპებით სავსე ეკრანზე კონტენტი თვალს იკავებს. C-მ before/after ორივე მდგომარეობაში უნდა აჩვენოს.

---

## 5. ადგილი ლუპში

- **გაფართოება:** **DUX-R-2** უკვე დამტკიცებულია (`design-ux-decisions.md`, 2026-10-25 later) და REVIEW-RECOMMENDATIONS-ში მე-10-ეა. ცნობარი მისი სამუშაოა, დუბლიკატს არ ვქმნი. DUX-R-2-ის ტექსტში წერია „ქართულად“, მაგრამ მოქმედი წესი „English-only labels“ არის (policy, Reference-first Deviations). ამიტომ sheet ინგლისურია.
- **ახალი მცირე ეტაპი: SABA-B-8 „Calm Studio“.** ის მოიცავს DUX-R-2-ს და დამატებით layout/copy ცვლილებებს, რომლებიც DUX-R-2-ში არ შედის და Saba-ს დასტურს მოითხოვს.
  - **CALM-1 (1–1.5 რაუნდი):** sheet + `?` + footer ღილაკი + shortcut line-ის მოხსნა + lane-move hint კონტექსტურ ხაზში + კლავიშები transport-ის title-ებში (ხურავს R77-BUTTON-SHORTCUT-SUPERSET-ის tooltip ნაწილს).
  - **CALM-2 (1 რაუნდი):** copy: BPM/Loop/caption/dock/detail/notice/first-run status. **DUX-R-4-მდე ან მასთან ერთად**, რადგან DUX-R-4(a) ცარიელ ხაზებში ტექსტს ამატებს. ვთავაზობ შესწორებას: hint მხოლოდ **აქტიურ** ცარიელ ხაზზე და მხოლოდ პირველ კლიპამდე. DUX-R-4(b) (disabled-ის მიზეზი title-ში) სწორედ ის სახლია, სადაც ზოლების ტექსტი გადადის.
  - **CALM-3 (0.5–1 რაუნდი, Q3-ის შემდეგ):** Overview-ს ცარიელი მდგომარეობა + Ctrl+Alt+O.
  - სულ ~3 რაუნდი. ყოველ task-ს სჭირდება `Reference: how Ableton does it` სექცია (6.1, 42.1, ch.42, 6.10) და `Deviations` (`?` ≠ Info View; English-only).
- **C-ის acceptance rows (1440×900 და 1280×720):**
  1. `arrangement-shortcut-hint` აღარ არის. footer-ის სიმაღლე მცირდება და timeline scroller-ის `clientHeight` იზრდება იმავე რაოდენობით (±1 px).
  2. `?` ხსნის და ხურავს sheet-ს body-დან, timeline-დან, overview-დან და ruler-იდან. ძებნის, BPM, Clip Gain და მარკერის ველებში „?“ იკრიფება და sheet არ იხსნება. Export dialog-ის დროს არ იხსნება. Esc ხურავს, focus opener-ს უბრუნდება. ქართულ განლაგებაზეც მუშაობს (code-based).
  3. Sheet-ის სია D2-ის ცხრილთან შედარებით: hint line-ის 19 ჩანაწერიდან და 10 უხილავი ქცევიდან 0 აკლია. ყოველი სტრიქონი დაჭერით მოწმდება და 0 სტრიქონი „არაფერს აკეთებს“.
  4. ძებნა: „split“ → Ctrl+E; „cut“ → Ctrl+X და Ctrl+Shift+X; უცნობი სიტყვა → empty text.
  5. Transport-ის ყოველი ღილაკის title-ში კლავიშია და `aria-keyshortcuts` ემთხვევა (Undo, Redo, Home, Space, Split, Delete, Loop, Z, X).
  6. Clip lane drag-ისას lane-move და Shift-lock hint ჩანს, layout shift ≤ 1 px.
  7. მოხსნილი ფაქტები მისაწვდომია: BPM title-ში წერია „audio is not stretched“ და BPM-ის დაყენების status-შიც. Loop-ის disabled title მიზეზს ამბობს. video M/S/Volume-ის title-ში წერია „sound from the video“.
  8. Detail empty: ერთი ხილული სტრიქონია, ველების bbox ±1 px. clip-ის არჩევისას არაფერი ხტება.
  9. Overview: click/drag/↕/double-click Fit/←→ უცვლელია, aria-label უცვლელია. ცარიელ პროექტში მშვიდი მდგომარეობაა. toggle reload-ის შემდეგ ინახება (თუ დამტკიცდა).
  10. დანარჩენი ყველა ელემენტის bbox-ის diff ≤ 1 px წინა baseline-თან (D6 მეთოდი).
  11. Sheet-ს აქვს dialog role, aria-labelledby და focus trap. ტექსტი ≥ 12 px, ≥ 4.5:1. focus ring არის საერთო SABA-B-4 სტილი.
  12. Screenshot-ები: S0 და S1, before/after, ორივე viewport.

---

## 6. კითხვები Saba-სთვის
1. **Shortcut-ები:** modal sheet Studio-ს თავზე (`?` + footer-ის „Shortcuts ?“, ჩემი რეკომენდაცია) თუ ცალკე გვერდი?
2. **Footer და ზოლების ტექსტი:** footer-იდან კლავიშების ხაზის მოხსნა footer-ის ზედა კიდეს ~20 px-ით ამოძრავებს. ეს და BPM/Loop/caption/Overview label-ის tooltip-სა და status-ში გადატანა დასტურდება? Library notice ერთხაზიანი დარჩეს, თუ dismiss-იც ჰქონდეს?
3. **Overview:** ყოველთვის ჩანდეს (გამხდარი), თუ Live-ის მსგავსად Ctrl+Alt+O-ით იმალებოდეს? ვიდეოს გარეშე მთელი dock-ის რიგი იკეცებოდეს (layout-ის ცვლილებაა)?
4. **რიგი:** SABA-B-8 მიმდინარე PERF რაუნდის შემდეგ მაშინვე გავუშვათ, თუ REVIEW-RECOMMENDATIONS-ში დარჩეს (DUX-R-2 ახლა მე-10-ეა)?

---

**ფაილები:**
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/StudioWorkspace.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/ArrangementVideoDock.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/ArrangementOverview.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/ArrangementTempoRow.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/ArrangementLoopBrace.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/ArrangementLibrary.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/ArrangementLibraryPreview.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/components/arrangement/ArrangementDetailPanel.tsx`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/lib/arrangement/strings.ts`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/lib/arrangement/collection.ts`
- `/tmp/claude-0/-home-claude/72729bf1-565e-5110-b663-3943d8ff14e4/scratchpad/st/app/data/studio-lab-demo.ts`
- `/home/claude/czaba-studio-loop/loop/user-review/design-ux-review.md`
- `/home/claude/czaba-studio-loop/loop/user-review/design-ux-decisions.md`
- `/home/claude/czaba-studio-loop/loop/user-review/ableton-review.md`
- `/home/claude/czaba-studio-loop/loop/user-review/ableton-decisions.md`
- `/home/claude/czaba-studio-loop/loop/policy.local.md`
- `/home/claude/czaba-studio-loop/loop/b-round-71/ableton-arrangement-view-20261021.txt`
- `/home/claude/czaba-studio-loop/loop/b-round-71/ableton-shortcuts-20261021.txt`

**მეხსიერებისთვის (main session-მა შეინახოს, თუ საჭიროა):** Saba-ს მიაჩნია, რომ Studio-ს ეკრანი გადატვირთულია. მას სურს shortcut-ები ცალკე popup-ში ან გვერდზე, და Overview-სა და დამხმარე ტექსტებს ზედმეტად თვლის. შეთავაზებულია SABA-B-8 „Calm Studio“, რომელიც DUX-R-2-ს აფართოებს; ის ჯერ დაუმტკიცებელია და Q1–Q4 ღიაა.