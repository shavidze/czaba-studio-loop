# Studio Lab — panel polish 14a: დაკეცილი ხაზის სახელური, footer-ის რეზერვი, cap → auto-fit off, fold-ის უარის status და Export-ის Enter-ის ტესტი (C-R11-01..03, deviation 9, C-R15-02, C-R15-03; D-29c, D-29g, round 16)

**თარიღი:** 2026-10-11
**სტატუსი:** Completed — C round 16 PASS (`c-round-16.md`): R16-L1, R16-F1, R16-F2, R16-F3, R16-H1, R16-G1, R16-T1, R16-U, R16-Doc, მეზობელი რეგრესიები და G16-1..3; vitest 979/979. C-მ დახურა C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 და A-ს deviation 9. C-მ გახსნა ახალი Low C-R16-01 (preview-ის „აქტიური ხაზი“ ორ ხაზზე იშლება), ის ღიაა და round 17-ზეა გადაცემული (D-29h). A-ს deviation 5 B-ის ფორმულირების შეცდომაა: Esc კლიპის არჩევას არ ხსნის, deselect არის click იმავე ხაზის ცარიელ ადგილას.
**შეცვლილი პროექტი:** Store

## კონტექსტი

Round 11-ის სამი Low დაკვირვება (D-29c) და A-ს deviation 9 panel polish 14a-ში იყო დაგეგმილი. C round 15-მა (`c-round-15.md`) ორი ახალი Low დაამატა:

- **C-R11-01.** დაკეცილ (36 px) ხაზზე სიმაღლის სახელური (6 px) folded clip-ის ქვედა კიდეს ფარავდა. A-ს გაზომვით 1440×900-ზე clip-ის ქვედა 2 px (y 345, 346) `elementFromPoint`-ზე სახელურს აბრუნებდა და არა clip-ს ან trim edge-ს. სახელურზე pointerdown ხაზს შლიდა.
- **C-R11-02.** 1280×720-ზე კლიპის არჩევა footer-ს selected-clip ხაზს უმატებდა (+20 px). Scroller 298 → 280, ხაზები 67 → 61, detail panel 144 → 142 (cap). არჩევის მოხსნისას ყველაფერი უკან ბრუნდებოდა.
- **C-R11-03.** Cap-ის მოქმედებისას (142) ხაზის პირველი ხელით შეცვლა auto-fit-ს თიშავდა, `detailCap` null ხდებოდა და panel 142-დან 144-ზე ხტებოდა.
- **Deviation 9.** Pointer gesture-ის დროს fold ჩუმად იგნორირდებოდა. Mute და რედაქტირების კლავიშები ამ დროს `GESTURE_EDIT_BLOCKED_MESSAGE`-ს წერენ.
- **C-R15-02.** იგივე ძირეული მიზეზი, რაც C-R11-02-ს აქვს. გაფართოებული ვიდეო body-ს ქვედა კიდეზე ლაგდება. ამის შემდეგ კლიპის არჩევა body-ს 20 px-ით ამოკლებდა, ყუთი კი ადგილზე რჩებოდა და preview-ის ზედა 12 px-ს ფარავდა.
- **C-R15-03.** Export-ის „მხოლოდ Tab“ ტესტი C-ის G6 mutation-ს ვერ იჭერდა (handler-ი Enter-საც ამუშავებს).

## მიდგომა

### C-R11-01 — დაკეცილ სახელურს pointer-ის hit area არ აქვს (D-29c 1)

- დაკეცილ მდგომარეობაში სახელური `pointer-events-none`-ს იღებს; `cursor-row-resize` და hover-ის ფონი მოხსნილია.
- გაშლილი სახელურის class-ის სტრიქონი round 15-ის იდენტურია. ტესტი მას ზუსტ სტრიქონს ადარებს.
- სახელური focus-ირებადი რჩება (`role=separator`, `tabIndex=0`, `aria-*` C-R11-04-ის კონვენციით). ↑/↓ ხაზს მხოლოდ შლის, როგორც აქამდე.
- `handleHeightPointerDown`-ის დაკეცილი შტო **დარჩა, მაგრამ unfold-ის ნაცვლად უბრალოდ ბრუნდება**:
  - რეალური pointer მასამდე ვეღარ აღწევს;
  - პირდაპირ ელემენტზე გაგზავნილ სინთეზურ pointerdown-ს CSS `pointer-events` ვერ აჩერებს. შტოს მთლიანად წაშლის შემთხვევაში ის gesture-ს დაიწყებდა და `changeTrackHeight` ხაზს 36 → 80-ზე გაშლიდა, ზუსტად ის ნახტომი, რომელსაც D-29c კრძალავს.
- Drag/drop handler-ები ადგილზეა. Folded ხაზზე drop ახლა პირდაპირ ქვემოთ მდებარე lane body-ზე ხვდება.

### C-R11-02 + C-R15-02 — footer selected-clip row-ს მუდმივად იტოვებს (D-29c 2, D-29g)

- `<p data-testid="arrangement-selected-clip">` იღებს `basis-full truncate`-ს და `title`-ს, რომელიც ხილული ტექსტის ზუსტი ასლია. ტექსტი და test id უცვლელია.
- როცა ერთი არჩეული კლიპი არ არის, იმავე ადგილას ჩანს `<p aria-hidden="true" data-testid="arrangement-selected-clip-reserve">` იმავე `tabular-nums text-muted` კლასებითა და `basis-full`-ით. მის შიგნით ერთი non-breaking space-ია (JSX entity `&nbsp;`).
- ყუთის ხელახალი placement **არ** ემატება. ResizeObserver, polling ან re-anchor არ არის: ახალი anchor გაყინულ dock-ში მომხმარებლის drag-ს გააუქმებდა (D-29g). D-29d-ის წესი რჩება: placement-ის შემდეგ ყუთი არ მოძრაობს, მხოლოდ window resize აკეთებს re-clamp-ს.

### C-R11-03 — auto-fit off cap-ის ქვეშ rendered სიმაღლეს ინარჩუნებს (D-29c 3)

Panel-მა უნდა გაარჩიოს „cap გაქრა, რადგან auto-fit გამოირთო“ და „cap გაქრა, რადგან ადგილი გაიზარდა“. ორივე შემთხვევაში cap რიცხვიდან null ხდება.

ყველაზე მცირე პატიოსანი სიგნალი ასეთია. Workspace panel-ს `isLaneAutoFitOn` prop-ს აწვდის (`trackLaneLayout.autoFit`). Panel-ის არსებულ committed-refs `useLayoutEffect`-ში ორი შტო ემატება:

1. **Clamp.** თუ წინა commit-ის cap რიცხვი იყო, ახლა null-ია, auto-fit გამორთულია და შენახული სიმაღლე cap-ზე დიდია:
   - შენახული სიმაღლე = min(შენახული, cap);
   - transition-ი უკვე disarm-ებულია cap-ის resize-ის არსებული წესით;
   - ახალი სიმაღლე paint-მდე იწერება (layout effect).
2. **Restore (reviewer M1).** Clamp-ი იმახსოვრებს {from, to}-ს. თუ auto-fit ისევ ჩაირთო (ეს მხოლოდ workspace-ის snapshot restore-ით ხდება, ანუ გაუქმებული lane drag-ის შემდეგ) და შენახული სიმაღლე ისევ `to`-ა, ის `from`-ს უბრუნდება.
   - გაუქმებული gesture კვალს აღარ ტოვებს: ადგილის გაზრდისას panel ისევ 144-ზე იხსნება.
   - მომხმარებლის მიერ panel-ის ზომის შეცვლა (separator-ის key ან drag) ამ მეხსიერებას შლის (reviewer pass 2, Low 1).

ახალი context, history entry ან effect loop არ არის. Detail playhead-ის ხაზი, მისი writer და waveform SVG უცვლელია.

**დაკეცილი panel (reviewer L1, განზრახ).** Clamp-ი collapsed panel-ზეც მოქმედებს. დაკეცილი separator-ის `aria-valuetext` უკვე capped გახსნის სიმაღლეს აცხადებს („დაკეცილია · 130 px“), ამიტომ ხელახლა გახსნა მასთან Δ 0-ია.

### Deviation 9

`toggleTrackFold` gesture-ის დროს `GESTURE_EDIT_BLOCKED_MESSAGE`-ს წერს და ბრუნდება. ეს ფარავს fold-ის click-ს, Space-ს და დაკეცილ სახელურზე ისრებს. Layout არ იცვლება.

### C-R15-03

`export-dialog-focus.test.tsx`-ს ერთი ტესტი დაემატა: ბოლო control-ზე (`WAV-ის ექსპორტი`) Enter და Space, პირველზე (X) კი Enter. ყველა შემთხვევაში `defaultPrevented === false` და ფოკუსი ადგილზე რჩება. `ArrangementExportDialog.tsx` არ შეცვლილა.

## არქიტექტურა

```mermaid
sequenceDiagram
  participant U as მომხმარებელი
  participant L as ArrangementLane (სახელური)
  participant W as StudioWorkspace (trackLaneLayout)
  participant P as ArrangementDetailPanel
  U->>L: ↓ (პირველი ხელით ცვლილება)
  L->>W: changeTrackHeight
  W->>W: autoFit=false, detailCap=null
  W->>P: openHeightCap=null, isLaneAutoFitOn=false
  P->>P: layout effect: releasedCap=142 → expandedHeight=min(144,142)=142, {from:144,to:142}
  Note over P: rendered 142 → 142 (Δ 0, transition არ არის)
  U-->>L: (pointercancel lane drag-ზე)
  L->>W: snapshot restore: autoFit=true, detailCap=142
  W->>P: isLaneAutoFitOn=true
  P->>P: expandedHeight=to → from (144); rendered min(144,142)=142
```

## გაზომვები (headless Chromium, `tmp/studio-real-loop/a-round-16/runs/`)

### კოდამდე (`pre-*.json`, `pre-fold-1440.json`)

| Viewport | მდგომარეობა | footer | scroller | ხაზები | panel | body (h) |
|---|---|---|---|---|---|---|
| 1440×900 | არჩევის გარეშე | 49 | 516 | 81×4 | 144 | 451 |
| 1440×900 | ერთი კლიპი | 49 (ხაზი shortcut-თან ერთ row-შია) | 516 | 81×4 | 144 | 451 |
| 1280×720 | არჩევის გარეშე | 49 | 298 | 53/67/67/67 | 144 | 233 |
| 1280×720 | ერთი კლიპი | 69 | 280 | 53/61/61/61 | 142 | 213 |

- ყველაზე გრძელი არჩეული ტექსტი („ღამის პულსი · სრული მიქსი“) 580 px-ია და 1280-ზე ერთ ხაზზე ეტევა.
- Range-only მდგომარეობა UI-ით ვერ მივიღე. Range drag კლიპსაც ირჩევს; ctrl-toggle, lane click, marquee და Ctrl+A კი range-ს შლის.

### შემდეგ (`f1-*.txt`, `post-*.json`)

| Viewport | არჩევის გარეშე = ერთი კლიპი | Δ select ↔ deselect |
|---|---|---|
| 1440×900 | footer 69, scroller 496, ხაზები 81×4, panel 144, body 233–664 (431) | 0 |
| 1280×720 | footer 69, scroller 280, ხაზები 53/61/61/61, panel 142 (cap), body 271–484 (213) | 0 |

**ფასი (D-29g, მიღებული).**
- **1440×900:** მუდმივი +20 px row (footer 49 → 69). Scroller 516 → 496, body 451 → 431. ხაზები 81-ზე რჩება, cap არ ირთვება.
- **1280×720:** ზედმეტი row არ ემატება. Layout round 15-ის „არჩეულ“ მდგომარეობაზეა ფიქსირებული.

**Residual (D-29c 2-ის გარეთ).** Range, ≥ 2 კლიპი და lane-move:

| მდგომარეობა | 1440×900 | 1280×720 |
|---|---|---|
| range + კლიპი | +20 (69 → 89) | +20 (69 → 89); panel 122 |
| Ctrl+A | +20 (69 → 89) | +20 (69 → 89); panel 122 |
| lane-move | 0 (hint shortcut-ის row-ს ანაცვლებს) | 0 (hint shortcut-ის row-ს ანაცვლებს) |

**Body-ს confounder.** Preview-ის „აქტიური ხაზი: …“ ხაზი 288 px-ზე „მუსიკა“-სთვის ორ ხაზად იშლება და „SFX“-ისთვის არა, ამიტომ ±16 px აქტიური ხაზის შეცვლაზეა დამოკიდებული და არა არჩევაზე. გაყინული `ArrangementLibraryPreview.tsx`-ის ქცევაა. Δ 0 იზომება მაშინ, როცა არჩევის მოხსნა იმავე ხაზზე ხდება.

## შეცვლილი ფაილები

- `app/components/arrangement/ArrangementLane.tsx` — დაკეცილი სახელურის class-ი და pointerdown-ის დაკეცილი შტო.
- `app/components/arrangement/StudioWorkspace.tsx` — footer-ის რეზერვი, `isLaneAutoFitOn` prop და status `toggleTrackFold`-ში.
- `app/components/arrangement/ArrangementDetailPanel.tsx` — `isLaneAutoFitOn` prop, clamp/restore layout effect-ში, მეხსიერების წაშლა user resize-ზე.
- `app/lib/arrangement/__tests__/track-layout.test.tsx`, `detail-panel.test.tsx`, `export-dialog-focus.test.tsx` — ტესტები.
- `docs/implementation/2026/quarter-IV/024-studio-lab-library-rows-modal-x.md` — მხოლოდ სტატუსი და TODO.
- `panels.ts` და `panels.test.ts` არ შეცვლილა (helper საჭირო არ გახდა).

## პრობლემები და გადაწყვეტები

- **სინთეზური pointerdown დაკეცილ სახელურზე.** CSS `pointer-events` მხოლოდ hit-testing-ს ზღუდავს. თუ შტოს წავშლიდით, პირდაპირ გაგზავნილი მოვლენა 36 → 80-ს გამოიწვევდა. გადაწყვეტა: შტო უბრალოდ ბრუნდება (დასახელებული გამონაკლისი ტესტში).
- **გაუქმებული lane drag panel-ის შენახულ სიმაღლეს სამუდამოდ ამცირებდა (code-reviewer M1).** Clamp პირველ move-ზე ხდება, cancel კი მხოლოდ workspace-ს აბრუნებს. გადაწყვეტა: {from, to} მეხსიერება და restore auto-fit-ის დაბრუნებისას.
- **Raw U+00A0 წყაროში (reviewer L3).** Editor-მა ან formatter-მა შეიძლება ჩვეულებრივი space-ით შეცვალოს. გადაწყვეტა: JSX `&nbsp;`, ტესტში `String.fromCharCode(160)`.
- **Panel-ის ზომის შეცვლა lane drag-ის დროს (reviewer pass 2, Low 1).** ↑↓ separator-ზე 130 → 146 → 130 და შემდეგ cancel 144-ს აღადგენდა. გადაწყვეტა: user resize clamp-ის მეხსიერებას შლის.

## ტესტირება

- `track-layout.test.tsx` 23 → 31, `detail-panel.test.tsx` 19 → 24, `export-dialog-focus.test.tsx` 18 → 19. სამივე ფაილი: 74/74.
- **დასახელებული გამონაკლისები:**
  - „pointerdown დაკეცილ სახელურზე“: იყო 81 (გაიშალა), ახლა 36, gesture-ის გარეშე;
  - cap-ის ტესტის ბოლო ორი assertion: იყო `144px`/`'144'`, ახლა `130px`/`'130'`.
- **Guard proof** (`tmp/studio-real-loop/a-round-16/guard-proof.txt`). თითოეული mutation-ის დროს ≥ 1 ტესტი ვარდება, აღდგენა `cmp` IDENTICAL:
  - G1–G5 სავალდებულოა;
  - G3b და G3c დამატებითია.
- **Gates:**
  - vitest 979/979 (965 + 14), arrangement 515/515;
  - tsc 0, build OK;
  - Biome 0 შეცდომა (owned და `./app`, 218 warning, როგორც round 15-ში);
  - protected 4/4, frozen 35/35, `Header.tsx` = HEAD.
- **A-ს browser-ის გაზომვა** (C-ის verdict არ არის; დეტალები `tmp/studio-real-loop/a-round-16.md`-ში):
  - **L1:** დაკეცილზე pe none, clip-ის ქვედა 3 px clip-ს აბრუნებს, trim −1 წმ ერთი Undo-თი, 36 რჩება; drop +1 კლიპი; ↓/↑ შლის; drag +20.
  - **F1:** Δ 0 ორივე viewport-ზე.
  - **F2:** ყუთი ფორმულაზეა (Δ ≤ 0.02).
  - **F3:** body Δ 0 add/select/deselect-ზე, preview-ის ზედა 12 px არ იფარება.
  - **H1:** 142 → 142, transition-ის გარეშე; resize, collapse/reopen 142; separator drag +10 → 152; 1440-ზე control 144.
  - **G1:** fold-ზე უარი ზუსტი ტექსტით, release-ის შემდეგ ერთი click კეცავს.

## TODO / შემდეგი ნაბიჯები

- **C round 16: PASS** (`c-round-16.md`). დაიხურა C-R11-01, C-R11-02, C-R11-03, C-R15-02, C-R15-03 და deviation 9.
- **C-R16-01 (Low, ღიაა):** preview-ის „აქტიური ხაზი“ wrap-ი body-ს ±16 px-ით ცვლის აქტიური ხაზის მიხედვით → round 17 (D-29h, doc 026).
- **B:**
  - range-ის და ≥ 2 კლიპის residual row-ები (+20; 1280-ზე panel 122). F3-ის range-ზე ყუთი preview-ის ზედა ნაწილს ფარავს, control-ები კი არა;
  - workspace-ის snapshot-ში panel-ის სიმაღლის აწევა (reviewer-ის ალტერნატივა) — მხოლოდ თუ cancel-ის სხვა გზები გაჩნდება.
- **Round 17:** C-R16-01 + M-R10-1/M2 (D-29h). **Round 18:** polish 14b.
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3 quiet Chrome; ნამდვილი 10 px scrollbar-ით 1280-ის cap.
