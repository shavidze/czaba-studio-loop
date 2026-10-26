# SABA-B-4, ეტაპი 1 — Studio-ს ერთი თხელი focus ring და ერთი slider thumb

**თარიღი:** 2026-10-26
**სტატუსი:** In Progress (ელოდება C-ის შემოწმებას, რაუნდი 196)
**შეცვლილი პროექტი:** Store (Studio, `/studio-lab`)

## კონტექსტი

საბამ 2026-10-26-ს აღნიშნა, რომ Pan slider-ზე keyboard focus-ის დროს ჩანს სქელი brass „აბი“ ფართო ღრეჩოთი, ხოლო slider-ების thumb-ები ერთმანეთს არ ემთხვევა: Pan-ის thumb სუფთა თეთრი და დიდია, Volume-ის კი კრემისფერი. შემდეგ მოთხოვნა გააფართოვა: „ყველგან გაასწორე, მარტო აქ არ არის“. პოლიტიკით სამუშაო ორ რაუნდად იყოფა: ჯერ Studio (ეს დოკუმენტი), შემდეგ store-ის გვერდები.

ძირითადი მიზეზი: `app.css`-სა და `base/utilities.css`-ში არსებობდა ორი **unlayered** `:focus-visible { outline: 2px … }` წესი. Tailwind v4-ის utility-ები `@layer utilities`-შია, ამიტომ unlayered წესი ყოველთვის იმარჯვებდა `focus-visible:outline-none`-ზე. Studio-ს დაახლოებით 50 control-ზე ერთდროულად ჩანდა ორი ზოლი: გლობალური outline და საკუთარი `ring-2` box-shadow. Pan-ის „აბი“ კი reset ღილაკის `::before` ელემენტი იყო (`w-12 h-4 rounded-full`).

## მიდგომა

გადაწყვეტილებები R83–R87 (B-ის D-29z161; საბას შეუძლია ნებისმიერის ვეტო):

- **R83 — ერთი საერთო focus style = ერთი გლობალური წესი.** `app.css`-ში რჩება ერთი unlayered წესი: `outline: 1.5px solid color-mix(in srgb, var(--color-brand) 80%, transparent); outline-offset: var(--focus-offset, 2px);`. `utilities.css`-ის დუბლიკატი წაიშალა. Studio-ს control-ებს საკუთარი ring recipe აღარ აქვთ. Outline layout-ს არ ცვლის და ელემენტის `border-radius`-ს მიჰყვება.
  - უარყოფილი ალტერნატივები: (a) `@layer base`-ში გადატანა ახლავე — store-ის 27 `focus:outline-none` ველი ერთადერთ ინდიკატორს დაკარგავდა (ეს მე-2 ეტაპის საქმეა); (b) `!important`-იანი `@utility focus-ring` — მეორე მექანიზმი, რომელიც გლობალურ წესს ეჯიბრება; (c) `[data-studio-theme]`-ზე შეზღუდული selector — ST6/TH4 ტესტები `app.css`-ში marker-ების რაოდენობას 2-ზე კეტავს.
  - **ცნობილი ეფექტი (არა FAIL):** store-ის გვერდებზე ring ახლავე თხელდება. store-ის control-ები, რომლებსაც თავისი `ring-2` აქვთ, მე-2 ეტაპამდე ორ ზოლს აჩვენებს.
- **R84 — ერთი ვარიანტი, inset.** `app/components/arrangement/studio-focus.ts` → `STUDIO_FOCUS_RING_INSET_CLASS = '[--focus-offset:-2px]'`. ის აქვს ყველა ყოფილ `ring-inset` ადგილს (11). გარდა ამისა, ბრაუზერში გაზომვამ 11 ადგილზე აჩვენა, რომ default ring-ს overflow-იანი მშობელი ჭრის (8) ან შემდეგი რიგი ფარავს (group M/S, group name editor, marker flag); ესენიც inset-ზე გადავიდა. ჯამში კონსტანტა 22-ჯერ გამოიყენება. Playhead handle default-ზე რჩება: inset ring brass ფონზე brass იქნებოდა.
- **R85 — mouse press-ის შემდეგ ring არ ჩანს.** `app/lib/focus-source.ts`: `document`-ზე capture ფაზაში `pointerdown` წერს `html[data-focus-source="pointer"]`-ს, ხოლო ნებისმიერი არა-modifier `keydown` წერს `keyboard`-ს. CSS: `html[data-focus-source="pointer"] :focus-visible { outline: none; }`. Hook (`useFocusSourceAttribute`) მიმაგრებულია `StudioWorkspace`-ში. Unmount-ზე listener-ები და ატრიბუტი იშლება. შედეგი, რომლის ვეტოც შეიძლება: mouse-ით აღებულ fader-ზე arrow key-ის დაჭერა ring-ს აჩენს. ეს `:focus-visible`-ის ევრისტიკას ემთხვევა და text field-ებზეც იგივე წესი მოქმედებს.
- **R86 — ერთი thumb, ერთი track.** `studio-fader.ts`: `STUDIO_SLIDER_THUMB_CLASS` (14 px, `bg-foreground` #ECE6DA, hover/active ცვლილება არ აქვს), `STUDIO_SLIDER_TRACK_CLASS` (`h-1 bg-outline-hover`), `STUDIO_NEUTRAL_SLIDER_CLASS` (Pan, Zoom — brass fill-ის გარეშე), `STUDIO_LEVEL_FADER_CLASS` (+ brass fill, რომელიც thumb-ის ცენტრამდე აღწევს: `1.75 / 3.5 × spacing`). ექვსივე range input-ს ერთი box აქვს, `h-4`. წაიშალა `STUDIO_FADER_FOCUS_*` სამივე კონსტანტა და ყველა `!` focus modifier.
- **R87 — focus არ ცვლის fill-ს, border-ს ან shadow-ს.** Library separator-ს მოეხსნა `focus-visible:bg-brand`, search ველს `focus:border-brand`, clip-gain pending-ს `focus-visible:ring-warning` (`border-warning` რჩება), ხოლო marker flag-ს `ring-offset-*`. გამონაკლისია ExportDialog-ის `focusTrapRef` კონტეინერი (`focus:outline-none`), რომელიც უცვლელია.

## არქიტექტურა

```
keydown / pointerdown (capture, document)
        │
        ▼
html[data-focus-source = keyboard | pointer]
        │
        ▼
:focus-visible { outline 1.5px brass 80%, offset var(--focus-offset, 2px) }
html[data-focus-source="pointer"] :focus-visible { outline: none }
        │
        ├── default sites: offset +2px
        └── inset sites:  [--focus-offset:-2px]
```

## შეცვლილი ფაილები

- `app/styles/app.css`, `app/styles/base/utilities.css`
- `app/components/arrangement/studio-fader.ts`, ახალი `studio-focus.ts`
- `app/lib/focus-source.ts` (ახალი)
- Studio-ს 17 კომპონენტი: DetailPanel, ExportDialog, GridMenu, GroupHeader, Lane, Library, LibraryPreview, LoopBrace, MarkerMenu, MarkerRow, Master, Overview, Ruler, TempoRow, Transport, VideoDock, StudioWorkspace
- ტესტები: ახალი `app/lib/__tests__/focus-source.test.tsx` და `app/lib/arrangement/__tests__/studio-focus-ring.test.ts`. ძველი focus token-ების assertion-ები განახლდა 11 granted ტესტში.

## პრობლემები და გადაწყვეტები

- **Problem:** default ring Snap/Grid/Env/Waveform Zoom-ზე, tempo ველზე და marker ღილაკებზე overflow-იანი მშობლის მიერ ზემოდან იჭრებოდა (T1.5 px), Library separator-ზე კი R2/T3/B3. → **Solution:** ეს ადგილები inset ვარიანტზე გადავიდა. გაზომვა: `a-round-196/r84-clip-1440.json`.
- **Problem:** Chromium 143 `outline-width: 1.5px`-ს ითვლის როგორც `1px` (computed), DPR 2-ზე კი ხატავს 2 device px-ს. stylesheet-ში მნიშვნელობა `1.5px` რჩება, ანუ ეს build-ის ბრალი არ არის. Chromium სიგანეს მთელ CSS px-მდე ამრგვალებს ქვემოთ (`2.5px` → `2px`, border `1.5px` → `1px`). → **Solution:** კოდი B-ის R83 მნიშვნელობას იცავს. საკითხი B-ს გადაეცა: ან მიიღოს 1 px-იანი ფაქტობრივი ring, ან R83 შეცვალოს 2px-ზე.
- **Problem:** ახალი import-ის შემდეგ Vite-ის პირველი ცივი ჩატვირთვა ცარიელ გვერდს და „Invalid hook call“-ს აჩვენებს (dependency re-optimization). → **Solution:** ეს გარემოს ერთჯერადი მოვლენაა (ENV-FIRST-LOAD); მეორე ჩატვირთვაზე console-ში შეცდომა 0-ია.

## ტესტირება

- ახალი სუიტები: SFR1–SFR5 + walker guard, FS-a…FS-g. Red proof: start copies-ზე SFR1–SFR5 წითელია, `focus-source` კი ვერ იტვირთება. მუტანტები m1–m6 ყველა დაიჭირა.
- სრული `app/lib/arrangement` + `app/components` (vitest), typecheck, Biome შეცვლილ ფაილებზე, `npm run lint` (214 warning + 1 info, round 195-ის ტოლი).
- Playwright Chromium, :5173, DPR 2, 1440×900 და 1280×720. Rest diff მხოლოდ range input-ების box-ებშია, მათ გარეთ 0 px. Thumb-ები 14 px-ია, #ECE6DA. Mouse press-ის შემდეგ outline არ ჩანს, ArrowUp/Tab-ის შემდეგ ჩანს.

## TODO / შემდეგი ნაბიჯები

- მე-2 ეტაპი (store): გლობალური წესის `@layer`-ში გადატანა, store-ის token-ების sweep, R85-ის store mount-ის გადაწყვეტა.
- `C-R191-01` (ivory thumb vs brass fill 1.82:1) რჩება `awaiting_user`.
- 1.5px vs Chromium-ის computed 1px — B/საბას გადაწყვეტილება.
