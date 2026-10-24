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
