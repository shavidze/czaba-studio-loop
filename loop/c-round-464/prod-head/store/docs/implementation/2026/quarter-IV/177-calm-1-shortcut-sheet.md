# Calm Studio — `?` shortcut sheet, მუდმივი shortcut ხაზის მოხსნა და კლავიშები tooltip-ებში (SABA-B-8 CALM-1a, CALM-1b)

**თარიღი:** 2026-10-28
**სტატუსი:** Completed (C round 228 PASS)
**შეცვლილი პროექტი:** Store

## კონტექსტი

Saba-მ (2026-10-28) Studio-ს ეკრანი გადატვირთულად მიიჩნია. ერთ-ერთი მიზეზი footer-ის ბოლოში
მუდმივი shortcut ხაზი იყო. რაუნდ 9-ში ის ერთ ხაზად დაიწყო, მაგრამ შემდეგ რაუნდებში 19 კლავიშამდე
გაიზარდა. Saba-ს გადაწყვეტილებით (decision 1) shortcut-ები გადადის modal sheet-ში: ის `?`-ით ან
footer-ის მშვიდი ღილაკით „Shortcuts ?“ იხსნება და Esc-ით იხურება. მუდმივი ხაზი ქრება.

CALM-1 ორ ეტაპად იყოფა (D-29z267):
- 1a (რაუნდები 226–227): sheet, `?`, footer ღილაკი, ხაზის მოხსნა და lane-move hint-ის გადატანა კონტექსტურ სლოტში.
- 1b (რაუნდი 228): transport-ის ღილაკების tooltip-ში კლავიში და `aria-keyshortcuts`, იმავე წყაროდან.
  მანამდე Undo/Redo-ს title კლავიშს არ ასახელებდა, „Back to start (0)“ არარსებულ კლავიშს ასახელებდა,
  Split/Loop კი „Ctrl/Cmd+…“-ს წერდა, sheet-ში „Ctrl+…“ ეწერა. ეს ორი წყარო უკვე დაშორდა ერთმანეთს.

## მიდგომა

- **ერთი წყარო:** `shortcuts.ts` ინახავს `STUDIO_SHORTCUT_GROUPS`-ს: 8 ჯგუფსა და 43 სტრიქონს,
  Live 12-ის ch. 42-ის მსგავსად დაჯგუფებულს. sheet ამ მონაცემებიდან იხატება, 1b-ში კი tooltip-ებიც
  აქედან აიღებენ კლავიშებს. ძებნა (`filterStudioShortcutGroups`) case-insensitive substring-ია
  action-ზე, ჯგუფის სათაურსა და კლავიშის ტექსტზე.
- **Sheet:** ჩარჩოდ გამოყენებულია არსებული `Modal` (`ui/Modal.tsx`, უცვლელი), ზომით `xl`. sheet-ს აქვს
  ძებნის ველი, ორსვეტიანი grid და `<kbd>` chip-ები. გახსნისას focus ძებნაზე გადადის, Tab/Shift+Tab
  sheet-ის შიგნით ტრიალებს, დახურვისას კი focus opener-ს უბრუნდება. თუ opener `body` იყო ან აღარ
  არსებობს, focus footer ღილაკზე გადადის. Export dialog-ის pattern ადგილობრივად არის გადმოტანილი;
  საერთო hook-ის მოთხოვნა checkpoint request-შია.
- **`?` კლავიში:** `handleKeyDown`-ში `?` შემოწმდება `key`-ით ან `Shift+Slash` `code`-ით, Ctrl/Alt/Meta-ს
  გარეშე. branch მოთავსებულია export/typing early return-ის შემდეგ, ამიტომ ტექსტურ ველებსა და
  Export-ში `?` ჩვეულებრივად იწერება ან იგნორირდება. გამორიცხულია `role="menu"`, აქტიური pointer
  gesture და `event.repeat`.
- **Sheet ღიაა → Studio ინერტულია:** ყველაზე ზედა early return ყველა სხვა branch-ს ბლოკავს (Space,
  Delete, Ctrl+Z, M, G, ისრები). ერთადერთი გამონაკლისია `?`, რომელიც ხურავს sheet-ს, თუ focus ტექსტურ
  ველში არ არის და კლავიში auto-repeat არ არის.
- **Footer:** მუდმივი ხაზის ნაცვლად ერთი კონტექსტური სტრიქონია. მარცხნივ ერთი სლოტია, რომლის
  პრიორიტეტია lane-move hint → selected-clip ხაზი → reserve. მარჯვნივ Shortcuts ღილაკია
  (`leading-4`, 16 px). footer 69 px-დან 49 px-მდე დაბალდა, timeline კი 20 px-ით გაიზარდა.

### CALM-1b — tooltip-ები და `aria-keyshortcuts` ერთი წყაროდან
- **ერთი წყარო:** `shortcuts.ts`-ს ორი ახალი export აქვს. `studioShortcutTitle(label, id)` აბრუნებს
  `label (პირველი კლავიში)`-ს, ან უბრალოდ `label`-ს, თუ სტრიქონი არ არსებობს. `studioShortcutAria(id)`
  აბრუნებს სტრიქონის `ariaKeyShortcuts`-ს. `strings.ts` title-ებს ამ helper-ით აწყობს (Split, Delete,
  Undo/Redo, Back to start, Play/Pause, Loop). import-ის მიმართულება ცალმხრივია: `strings.ts` →
  `shortcuts.ts`, `shortcuts.ts` არაფერს აიმპორტებს.
- **ფორმატის წესი (D-29z279):** title აჩვენებს სტრიქონის **პირველ** კლავიშს („Undo (Ctrl+Z)“,
  „Redo (Ctrl+Shift+Z)“). `aria-keyshortcuts` ჩამოთვლის **ყველა** მომუშავე კლავიშს, WAI-ARIA-ს
  სინტაქსით: space-ით გამოყოფილი კომბინაციები, modifier-ები წინ. tooltip ერთი შეხედვით იკითხება,
  `aria-keyshortcuts` კი სრული machine-readable სიაა. sheet ყველა კლავიშს აჩვენებს.
- **7 ღილაკი (D-29z280):** Play/Pause `Space`, Back to start `Home`, Loop `Control+L Meta+L`, Undo
  `Control+Z Meta+Z`, Redo `Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y`, Split `Control+E Meta+E`,
  Delete `Delete Backspace`. workspace handler `ctrlKey || metaKey`-ს იღებს, ამიტომ ორივე ჩამოთვლილია.
  Z/X ღილაკები თავიანთ `aria-keyshortcuts="Z"`/`"X"`-ს ინარჩუნებენ; Fit-ს ერთი კლავიში არ აქვს და
  `aria-keyshortcuts`-ს არ იღებს.
- **Undo/Redo:** იცვლება მხოლოდ `title`. ხილული ტექსტი (`Undo: <label>`) და accessible name უცვლელია.
  Delete ინარჩუნებს `aria-label`-ს და time selection-ის title-ს.
- **„Ctrl/Cmd“ → „Ctrl“ (შეგნებული განსხვავება):** title-ში წერია „Ctrl“, როგორც sheet-ში, რომლის
  ქვესათაური ამბობს „Ctrl means ⌘ on Mac“. `aria-keyshortcuts` assistive tech-ისთვის `Meta`-საც შეიცავს.
  ასე title და sheet ერთმანეთს ვეღარ დაშორდება.

### Ableton-თან განსხვავებები (შეგნებული)
- Live 12-ში `?` Info View-ს ხსნის (2.2.2, 42.1). CZABA-ს Info View არ აქვს, ამიტომ `?` shortcut sheet-ს
  ხსნის (Saba decision 1).
- Live 12-ში hover-ის დახმარება Info View-ს panel-ია (2.2.2). CZABA-ში Info View არ არის, ამიტომ კლავიში
  native `title` tooltip-ში ჩანს (Saba decision 1).
- Mac-ის ცალკე სვეტის ნაცვლად ქვესათაურია: „Ctrl means ⌘ on Mac · Alt means ⌥ · Esc closes.“
  (D-29z271). Chromium-ში ⌘/⌥ რეალური glyph-ით იხატება (DejaVu Sans fallback), ამიტომ fallback ტექსტი
  არ დაგვჭირდა.
- PageUp/PageDown სტრიქონზე წერია „bigger step“ და არა dB მნიშვნელობა: ეს ბრაუზერის native range ქცევაა.
- ჯგუფის სათაურები `text-xs`-ია (12 px) და არა `text-label`-ის 11 px. მიზეზი C-A11Y-ის „ყველა ტექსტი
  ≥ 12 px“ მოთხოვნაა.

## არქიტექტურა

```mermaid
flowchart LR
  K[window keydown] --> O{sheet open?}
  O -- yes --> Q{"? and not typing and not repeat"}
  Q -- yes --> C[close sheet]
  Q -- no --> R[return: Studio inert]
  O -- no --> T{export open or typing?}
  T -- yes --> X[return]
  T -- no --> H{"? key"}
  H -- "menu / gesture / repeat" --> X
  H -- yes --> S[open sheet]
  H -- no --> W[existing Studio shortcuts]
  D[(STUDIO_SHORTCUT_GROUPS)] --> SH[ArrangementShortcutSheet]
  D --> F[footer button aria-keyshortcuts]
  D --> HT[studioShortcutTitle / studioShortcutAria]
  HT --> STR[strings.ts titles]
  STR --> TR[ArrangementTransport title]
  HT --> TR2[ArrangementTransport aria-keyshortcuts]
```

## შეცვლილი ფაილები

- `app/lib/arrangement/shortcuts.ts` (ახალი): shortcut-ების ერთი წყარო, `findStudioShortcut` და `filterStudioShortcutGroups`.
- `app/components/arrangement/ArrangementShortcutSheet.tsx` (ახალი): modal sheet, ძებნა, focus trap/restore.
- `app/components/arrangement/StudioWorkspace.tsx`: sheet-ის state/ref/render, `?` branch, sheet-open early return და footer-ის კონტექსტური სტრიქონი.
- `app/lib/arrangement/strings.ts`: `studioShortcutSheetStrings`.
- `app/lib/arrangement/__tests__/shortcuts.test.ts` (ახალი): SC1–SC5.
- `app/lib/arrangement/__tests__/shortcut-sheet-ui.test.tsx` (ახალი): SS1–SS10.
- `app/lib/arrangement/__tests__/workspace-strings-ui.test.tsx`: WSU1.
- `app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx`: UC12-ის პირველი assertion.
- `app/lib/arrangement/__tests__/track-layout.test.tsx` (რაუნდი 227): selected-clip row-ის შემთხვევის class pin-ები სტრუქტურის assertion-ებით შეიცვალა.

CALM-1b (რაუნდი 228):
- `app/lib/arrangement/shortcuts.ts`: 7 სტრიქონის `ariaKeyShortcuts`, `fit`-ის მეორე კლავიში, `studioShortcutTitle` და `studioShortcutAria`.
- `app/lib/arrangement/strings.ts`: helper-ზე აწყობილი title-ები, `undoTitle` და `redoTitle`.
- `app/components/arrangement/ArrangementTransport.tsx`: Undo/Redo-ს `title` helper-იდან და 7 ღილაკზე `aria-keyshortcuts`.
- `app/lib/arrangement/__tests__/strings.test.ts`: ST6, ST10, ST17-ის literal-ები, ST8-ის `EDIT_FORMATTER_SAMPLES`-ში `undoTitle`/`redoTitle` და ახალი ST-K1.
- `app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx`: NS1, NS2-ის literal-ები და ახალი NS5.
- `grid-snap-loop-drop.test.tsx`, `status-announcement-ui.test.tsx`, `markers-ui.test.tsx`, `self-disabling-focus.test.tsx`, `waveform-zoom.test.tsx`: Undo/Redo-ს title literal-ები `studioEditStrings.undoTitle`/`redoTitle`-ით შეიცვალა.

## პრობლემები და გადაწყვეტები

- **Problem:** Modal-ის Esc listener `document`-ზეა, workspace-ის კი `window`-ზე. Esc-ით დახურვის შემდეგ
  იმავე event-ს floating video-ს Escape branch-ი შეიძლება მისწვდენოდა.
  **Solution:** sheet ღიაობისას window capture-ში Escape-ს `preventDefault`-ს უკეთებს. floating-video
  branch `defaultPrevented`-ს ამოწმებს და ამ event-ს აღარ ამუშავებს.
- **Problem:** workspace-ის `keyup` Space-ზე `preventDefault`-ს აკეთებს, ამიტომ Space Close ღილაკს ვერ
  გაააქტიურებდა.
  **Solution:** sheet-ის content-ზე React `onKeyUp` Space-ის propagation-ს აჩერებს. Browser-ში Space
  Close-ზე sheet-ს ხურავს და playback არ იწყება.
- **Problem:** `?`-ზე თითის დაჭერისას auto-repeat ძებნის ველში „????“-ს წერდა.
  **Solution:** sheet ღიაობისას repeat `?` keydown-ს `preventDefault`-ით ბლოკავს (SS3).
- **Problem:** TH10 (studio-theme-obsidian) კრძალავს `font-semibold`-ს.
  **Solution:** სათაური `font-medium`-ია.
- **Problem (GATE226-B1):** footer-ის slot-ები ახალ row wrapper-ში გადავიდა და `basis-full` wrapper-ზე
  აღმოჩნდა. `track-layout.test.tsx`-ის შემთხვევა „reserves the selected-clip row with an aria-hidden
  placeholder and renders the real line as one truncated full-width row (C-R11-02, C-R15-02)“ კლასების
  ზუსტ სიას ამოწმებდა, ამიტომ root gate ჩავარდა. Browser-ში ქცევა სწორი იყო.
  **Solution:** class pin-ები ამოღებულია. იმავე შემთხვევაში სტრუქტურის assertion-ებია: placeholder-ის
  მშობელი row შეიცავს „Keyboard shortcuts (?)“ ღილაკს, და მონიშნული clip-ის ხაზი და placeholder
  მონიშვნისა და მოხსნის შემდეგ იმავე row-ში რჩება. Geometry browser-ში მოწმდება.
- **Problem (C-R226-02, C-R226-03):** `fit` სტრიქონი ამბობდა, რომ ruler-ზე ორმაგი დაწკაპუნება ყოველთვის
  მთელ პროექტს ატევს, თუმცა time selection-ისას ის selection-ზე აზუმავს. `waveform-zoom` სტრიქონი
  არარსებულ „1× button“-ს ასახელებდა, რეალური control კი `<select>`-ია.
  **Solution:** `fit`-ის keys: „Double-click the overview“ და „Double-click the ruler (no selection)“
  (რაუნდი 228-ში დაზუსტდა, იხ. C-R227-01).
  `waveform-zoom`-ის key: „Waveform Zoom menu“. SC4 ამოწმებს ორივეს და იმას, რომ არცერთი key-ში
  სიტყვა „button“ არ წერია.

- **Problem (B-R225-BACK-TO-START-KEY):** Back to start-ის title „Back to start (0)“ იყო, მაგრამ `0`
  კლავიში არ არსებობს; binding Home-ია.
  **Solution:** title `studioShortcutTitle`-ით იწყობა `back-to-start` სტრიქონიდან: „Back to start (Home)“.
- **Problem (C-R227-01):** „Double-click the ruler (no selection)“ არაზუსტი იყო: clip-ის მონიშვნისას,
  time selection-ის გარეშე, ruler-ის ორმაგი დაწკაპუნება მაინც Fit-ს აკეთებს.
  **Solution:** `fit`-ის მეორე კლავიში „Double-click the ruler (no time selection)“-ია, Fit-ის title კი
  „Fit — the entire project is visible (double-click the overview, or the ruler with no time selection)“.
  ერთი ფაქტი, ერთი ფორმულირება. SC4 ამოწმებს.
- **Problem (C-R227-02):** ამ doc-ის ტესტების სიები SC1–SC3-ს ასახელებდა და changed-files სიაში
  `track-layout.test.tsx` აკლდა.
  **Solution:** სიები განახლდა (SC1–SC5, ST-K1, NS5, SS1–SS10) და ფაილი დაემატა.

## ტესტირება

- Unit/UI: SC1–SC5, ST-K1, NS5 და SS1–SS10, ასევე განახლებული WSU1 და UC12. რაუნდი 227-ის covering
  ნაკრები (25 ფაილი, 320 ტესტი) მწვანე იყო; repo-scan ტესტები (focus-ring, panel-radius, obsidian, cursor-map, colour suites) მწვანე დარჩა.
- Mutants: MU-a → SS5, MU-b → SS3, MU-c (open/close) → SS3, MU-d → SS2/SS10, MU-e → SS6, MU-f → SS8.
- Code review-ის შემდეგ დამატებული mutants:
  - MU-g: Esc-ის `preventDefault`-ის მოხსნა → SS2 წითელია;
  - MU-h: Space keyup stop-ის მოხსნა → SS5 წითელია;
  - MU-i: focus ყოველთვის fallback-ზე ბრუნდება → SS2 წითელია (opener = Snap ღილაკი).
- Browser (Chromium, 1440×900 და 1280×720):
  - footer 49 px, timeline scroller-ის `clientHeight` 516/406, კონტექსტური სტრიქონი 16 px;
  - footer ღილაკის contrast 6.68:1 (rest), 14.78:1 (hover);
  - ⌘/⌥ რეალური glyph-ითაა;
  - `fit` სტრიქონის chip არ იჭრება, sheet-ს ჰორიზონტალური overflow არ აქვს.

- CALM-1b (რაუნდი 228):
  - covering ნაკრები: 27 ფაილი, 488 ტესტი, მწვანე; `npm run typecheck` და `npm run lint` rc 0.
  - Mutants: MU-1 (`studioShortcutTitle` აბრუნებს `label`-ს) → SC5, NS1, NS2, NS5 წითელია; MU-2 (`undo`-ს
    `ariaKeyShortcuts`-ის წაშლა) → SC5, NS5; MU-3 (`fit` → „(no selection)“) → SC4; MU-4 (Split-ის
    `aria-keyshortcuts`-ის მოხსნა) → NS5; MU-5 (`loop` = `Control+L`) → SC5.

## TODO / შემდეგი ნაბიჯები

- Snap (G), grid (1/2/3), Envelope (A) და marker-ის ღილაკები კლავიშს უკვე title-სა და `aria-keyshortcuts`-ში
  ასახელებენ, მაგრამ ჯერ არა `studioShortcutTitle`-ით. მათი ერთ წყაროზე გადაყვანა ცალკე დავალებაა.
- საერთო dialog focus hook (Export + shortcut sheet): checkpoint request `b-round-225-checkpoint-request.md`.
- CALM-2 (copy-ს გადატანა) და CALM-3 (Overview).
