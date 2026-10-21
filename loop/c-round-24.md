# C — Round 24 ვერიფიკაცია (Home separator-ზე, detail panel-ის ცხადი ref; D-29o)

Verifier: C · 2026-10-11 · Store: `C:/Apps/czaba-project/store`, HEAD `c5ed47b` + round-6..24 dirty tree · Dev server: არსებული `http://127.0.0.1:5173` (არ დამიწყია/გამიჩერებია) · Browser: gstack browse, state `c-browse.json`.

## 1. ვერდიქტი

**taskStatus: PASS.** ახალი ბაგი არ არის. A-ს ციფრები ხელახლა გავუშვი და ვერ ვენდე; ყველა ქვემოთ მოცემული შედეგი ჩემი გაშვებაა.

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R24-H (1440 + 1280, 4 separator, playback, ისრები) | **PASS** | `c-round-24/runs/h-1440.txt`, `h-1440-scrolled.txt`, `h-1440-playback.txt`, `h-1440-arrows.txt`, `h-1280.txt`, `h-1280-folded-shift.txt` |
| R24-HC | **PASS** | `runs/hc-1440.txt` |
| R24-F (R11-P2a refit, separator drag, floating video, static) | **PASS** | `runs/p2a-1440.txt`, `p2a-1280.txt`, `sepdrag-1280.txt`, `sepdrag-down-1280.txt`, `fv-1440.txt`, `gates/nes-*.txt` |
| R24-R | **PASS** | `runs/r-fold-tab-1440.txt`, `r-space-sep-1440.txt`, `r-drops-1440.txt` |
| R24-S | **PASS** | `gates/snap-*-start.diff`, `snap-*-end.diff` |
| R24-U (red-first + ჩემი 3 mutation) | **PASS** | `runs/r24u-control.txt`, `r24u-mutA/B/C.txt`, `r24u-mut*.diff` |
| R24-Doc | **PASS** | doc 030 (წაკითხული, კოდს ემთხვევა) |
| G24-1 | **PASS** | `gates/tsc.txt`, `vitest-track-layout.txt`, `vitest-all.txt`, `biome-app.txt`, `biome-owned.txt`, `build.txt` |
| G24-2 (start + end) | **PASS** | `gates/head-*.txt`, `git-status-*`, `sha-b23-*.txt`, `protected-*.txt`, `header-diff-*.txt`, `forbidden-status-*.txt`, `owned-sha-*.txt` |
| G24-3 | **PASS** | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| Real export sanity (`lay11`) | **PASS** (hard-clip: ცნობილი R13-M4) | `runs/export-sanity.txt` |
| C-R23-01 info record | **არც PASS, არც FAIL** — უცვლელია | `runs/c-r23-01-record.txt`, `runs/ssr-1..3.html` |

**ამ round-ში არ გაშვებულა** (task §4.6; audio/sync/dock/scheduler/transport ფაილი არ შეცვლილა, G24-2 ამას ადასტურებს): RF5-3, R3-V1, R3-V2, R3-V4, R5-L3, R11-P3 sync, R22-M1/M2. ისინი round 24-ისთვის PASS არ არის; ბოლო მტკიცებულება rounds 21–22-შია.

## 2. Harness და setup

- „რეალური click“ = `$B click <selector>` ელემენტის ცენტრზე; key = რეალური `$B press` (CDP key event, bubbling window-მდე).
- **Synthetic ნაწილები (გულახდილად):**
  - playhead-ის seek 5/9 წმ-ზე: ruler-ზე synthetic pointerdown/up (`C.seekRuler`). gstack-ს კოორდინატული click არ აქვს. Oracle ეხება Home-ს, არა seek-ს.
  - separator-ზე focus: `element.focus()` (Tab-ის ნაცვლად). Tab-ის რიგი ცალკე რეალური Tab-ით შემოწმდა (R24-R).
  - detail separator-ის drag: synthetic pointer harness (როგორც წინა round-ებში).
- Setup: `c-round-24/setup.sh` (round 23-ის setup, `c-round-24/b.sh`), შემდეგ `lay11`. Media მხოლოდ `media/`-დან (synthetic beeps), გარეთ არაფერი ატვირთულა.
- **Clip table (`runs/lay11-1440.txt`):** video 0–6.008 (`beeps-6s-vp9-opus.webm`), music 0–16 (`სრული მიქსი`), stems 2–16 სიგრძით (2–18), SFX 4–6 (`Soft impact`). Undo: `დამატება — Soft impact`.
- **არავალიდური ცდა (გადაგდებული):** პირველ ჯერზე `lay11` ორჯერ გავუშვი (eval-ის output ცარიელი იყო, async), რის გამოც ვიდეო ორჯერ დაემატა. გვერდი გადავტვირთე და setup თავიდან გავაკეთე; ყველა გაზომვა სუფთა `lay11`-ზეა.
- Window-ზე დავამატე read-only `keydown` logger (`__klog`: key, `defaultPrevented`, target). წყაროში არაფერი შემიცვლია.

## 3. R24-H — Home separator-ზე

### 3.1 1440×900 (`runs/h-1440.txt`)

ყოველ separator-ზე: seek 5 → focus → რეალური Home → 400 ms.

| Separator | pos before → after | activeElement | `aria-valuenow` | scroller top/left, `scrollY` | status | `defaultPrevented` |
|---|---|---|---|---|---|---|
| music `მუსიკა სიმაღლე` | 00:05.000 → 00:05.000 | separator | 80 → 80 | 0/0, 0 | უცვლელი | true |
| video `ვიდეო სიმაღლე` | 00:05.000 → 00:05.000 | separator | 80 → 80 | 0/0, 0 | უცვლელი | true |
| detail `დეტალების სიმაღლე` (ღია, 144) | 00:05.000 → 00:05.000 | separator | 144 → 144 | 0/0, 0 | უცვლელი | true |
| library `ბიბლიოთეკის სიგანე` (288) | 00:05.000 → 00:05.000 | separator | 288 → 288 | 0/0, 0 | უცვლელი | true |

Status ყველგან: `„Soft impact“ დაემატა SFX ხაზზე 00:04.000-ზე.`

**Scroll-ის oracle-ის სისუსტე და დამატებითი ცდა:** 1440-ზე scroller ვერტიკალურად არ სქროლდება (`scrollHeight` = `clientHeight` = 496), გვერდიც არა (docH 900). ამიტომ `scrollTop`/`scrollY` = 0 მარტო ბევრს არ ამტკიცებს. ჰორიზონტალურად scroller სქროლდება (2144 > 1142), ამიტომ ცალკე ცდა გავაკეთე `scrollLeft = 300`-ით და pos 9-ით (`h-1440-scrolled.txt`): music, detail, library — pos 00:09.000 → 00:09.000, `scrollLeft` 300 → 300, focus და `aria-valuenow` უცვლელი, `defaultPrevented` true სამივეზე.

### 3.2 1280×720 (`runs/h-1280.txt`)

ოთხივე separator: pos 00:05.000 → 00:05.000, focus რჩება, `aria-valuenow` 80/80/144/288 უცვლელი, `scrollLeft` 40 → 40, `scrollY` 0, status უცვლელი, `defaultPrevented` true ოთხივეზე.

**დამატებით (A-ს მიერ browser-ში შეუმოწმებელი, `h-1280-folded-shift.txt`):**
- დაკეცილი music (row 36) → მისი handle-ზე Home: pos 5 → 5, focus რჩება.
- Shift+Home იმავე handle-ზე: pos 5 → 5 (კონტრაქტს ემთხვევა: Shift modifier-ად არ ითვლება).
- გაშლა click-ით → row 81, transport `Play` (გაჩერებული).

### 3.3 დაკვრის დროს (`runs/h-1440-playback.txt`)

Seek 2 → focus music handle → Space (დაკვრა დაიწყო) → ~0.8 წმ → Home:
- Home-მდე: pos 2.99, `Pause` ღილაკი (ე.ი. უკრავს);
- Home-ის მომენტში: **3.31**; 200 ms-ის შემდეგ: **3.71** (> 3.31 ✓); 700 ms-ის შემდეგ: 4.441, ისევ უკრავს;
- 0-ზე გადახტომა არ მომხდარა; focus და `aria-valuenow` 80 უცვლელი; Home `defaultPrevented` true.
- შემდეგ Space → `Play` (გაჩერდა).

### 3.4 ისრები separator-ებზე (`runs/h-1440-arrows.txt`)

| Separator | ↑ | ↓ | ← / → | pos |
|---|---|---|---|---|
| music | 80 → 72; 88 → 80 | 72 → 80; 80 → 88 | 80 → 80 / 80 → 80 | 8.811 უცვლელი |
| video | 80 → 72; 88 → 80 | 72 → 80; 80 → 88 | უცვლელი | უცვლელი |
| detail | 144 → 160; 128 → 144 (panel-ის სიმაღლეც) | 160 → 144; 144 → 128 | უცვლელი | უცვლელი |
| library | უცვლელი | უცვლელი | ← 288 → 288 (min 288); → 288 → 304; შემდეგ ← 304 → 288 (min/max 288/480) | უცვლელი |

ხაზის სიმაღლე: ↑ = −8, ↓ = +8 ✓. Detail ბიჯი 16 (round 21-ის ტოლი). Library ბიჯი 16.

## 4. R24-HC — გლობალური Home სხვაგან (`runs/hc-1440.txt`)

| Focus | pos before → after | შენიშვნა |
|---|---|---|
| body (რეალური click status-ის ტექსტზე → `BODY`) | 00:05.000 → **00:00.000** | `defaultPrevented` true |
| music fold ღილაკი | 00:05.000 → **00:00.000** | `defaultPrevented` true |
| მონიშნული clip (stems clip-ზე რეალური click; ფოკუსი `BODY`, selection 1) | 00:10.000 → **00:00.000** | clip-ზე click playhead-ს click-ის წერტილზე აყენებს (10.000); clip თვითონ focusable არ არის (`tabIndex -1`), ამიტომ focus body-ზეა. Selection Home-ის შემდეგ რჩება |
| music volume `input[type=range]` | 00:05.000 → 00:05.000 | value 1 → **0** (ნატიური min), `defaultPrevented` **false**, seek არ მომხდარა |

Volume აღდგა რეალური End-ით: value 0 → 1, pos 5 უცვლელი. (Volume-ის ცვლილება history-ში `Volume` ჩანაწერად ჩაიწერა — ნორმალური mixer ქცევაა. ეს ტესტი გადატვირთვამდე იყო, R24-F/export სუფთა გვერდზე გაიზომა.)

პირველ ცდაში clip-ზე click-მა focus fold ღილაკზე დატოვა (clip focus-ს არ იღებს). ამიტომ case გავიმეორე body-დან დაწყებით (ცხრილში ეს ცდაა). ორივე ცდაში Home → 0.

## 5. R24-F — refactor ქცევას არ ცვლის

### 5.1 R11-P2a refit (`runs/p2a-1440.txt`, `runs/p2a-1280.txt`)

სუფთა reload + `lay11` თითო viewport-ზე. გაზომვა: row-ების `style` MutationObserver, panel-ის `transitionend` და 50 ms-იანი sample-ები. Toggle რეალური click-ით.

**1440×900** (reference: round 16 `p2-quick-1440x900.txt`: 81×4 / 144, scroller 496; round 21 §2.6: 496 ↔ 604):
- start: panel 144, scroller 496, rows 81/81/81/81;
- დაკეცვა: `transitionend` (height) 487 ms → panel 36, scroller 604, rows 81×4, row mutation **0** (ადგილი იზრდება, lane-ები default 80-ზე მეტად არ იზრდება);
- გაშლა: `transitionend` 494 ms → panel 144, scroller 496, rows 81×4, mutation 0.
- = reference. ამ viewport-ზე toggle lane-ებს არ ცვლის, ამიტომ refit-ის ნამდვილი oracle 1280-ია.

**1280×720** (reference: round 11 §2.3 R11-P2a: მონიშნული clip-ით 142 და 53/61/61/61; collapse → 81):
- mount: panel **36**, `aria-valuetext` `დაკეცილია · 142 px`, scroller 386, rows 81×4 (= round 11);
- გაშლა: `transitionend` 484 ms; row mutation-ები **ერთხელ, ოთხივე row-ზე 521 ms-ზე** (`53px`, `61px`, `61px`, `61px`), ე.ი. transition-ის შემდეგ. Transition-ის დროს sample-ები 36 → 142, lane-ები 81-ზე რჩება (შუალედური სიმაღლე არ არის). ბოლოს panel **142**, scroller 280, rows **53/61/61/61** = round 11;
- დაკეცვა: `transitionend` 480 ms; mutation-ები ერთხელ 493 ms-ზე (81 ×4). Panel 36, scroller 386, rows 81×4 = round 11.

### 5.2 Detail separator-ის drag (1280, auto-fit ჩართული; `sepdrag-1280.txt`, `sepdrag-down-1280.txt`)
- ზემოთ −24 px: panel 142 → 166 (`aria-valuenow` 166), scroller 280 → 256. Rows 53/61/61/61 რჩება — ისინი უკვე მინიმუმზეა (video 52 + 1, დანარჩენი 60 + 1), ამიტომ შემცირება შეუძლებელია. ეს ცდა refit-ს არ ამტკიცებს.
- ქვემოთ +48 px: panel 166 → 120 (min). Lane-ები drag-ის დროს და release-ზე იზრდება: 142 → 53/61/61/61, 136 → 53/63/63/63, 130 → 65, 124 → 67, 120 → **53/68/68/68**. Scroller 302. Refit მუშაობს.
- Undo ორივეგან `დამატება — Soft impact`, ე.ი. history-ში არ იწერება.

### 5.3 Floating video (1440; `runs/fv-1440.txt`, `shots/fv-1440.png`)
- Library რეალური click-ით დაიკეცა (rail 40), შემდეგ რეალური click ⤢-ზე.
- Library-ის width `transitionend` 505 ms-ზე (target = aside). Box 471 ms-მდე (aside 288-ია) dock-ში რჩება 1268,92 160 px-ზე და **524 ms-ზე** (transitionend-ის შემდეგ პირველივე frame) იდება **8,503 272×153**-ზე = round 21 R11-P3 1440/288 reference. Status: `ბიბლიოთეკა დროებით გაიხსნა გაფართოებული ვიდეოსთვის; …`.
- ✕ (რეალური click) → box 160×90 dock-ში, `style=""`, library ისევ დაიკეცა (40). შემდეგ library-ის ხელახლა გაშლა → 288.

### 5.4 Static
`grep -c nextElementSibling app/components/arrangement/StudioWorkspace.tsx` → **0** (`gates/nes-start.txt`, `nes-end.txt`).

## 6. R24-R — მიმდებარე რეგრესიები

- **Fold** (`r-fold-tab-1440.txt`): music click → `folded=true` 36; click → 81; focus + Space → 36; Space → 81. Transport ყველგან `Play` (გაჩერებული), pos 0, Undo უცვლელი.
- **Header-ის Tab რიგი** (რეალური Tab, fold-იდან): fold → `მუსიკა — ��აქტიური ხაზის არჩევა` → Mute → Solo → Volume (range) → `მუსიკა სიმაღლე` (separator) → `სტემები დაკეცვა ან გახსნა`. Round 23-ის `r-taborder-ms-1440.txt`-ის იდენტურია (U+FFFD-ის ჩათვლით, C-R23-01).
- **Space ფოკუსირებულ separator-ზე** (`r-space-sep-1440.txt`): music, detail და library handle-ზე Space ერთნაირად მუშაობს. პირველი Space → `Pause` (დაკვრა იწყება, pos 0 → ~0.75), მეორე → `Play`. `aria-valuenow` და focus უცვლელია.
  - Round 23-ში separator-ზე Space-ის browser ჩანაწერი **არ არის**, ამიტომ პირდაპირი შედარება არ გამოდის. შედარება diff-ით: Space-ის branch (`StudioWorkspace.tsx` ~l.1002) round 24-ის diff-ში არ შეცვლილა (`gates/snap-StudioWorkspace.tsx-end.diff`, მხოლოდ Home-ის hunk-ია). ეს ქცევა round 23-ის კოდთან იგივეა. Space-ზე დაკვრა DAW-ის გლობალური transport კონვენციაა.
  - დაკვრის დროს status-ში ჩანდა `ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.`. ეს წინა floating-video close-ის ტექსტია (§5.3) და ახალი არ არის.
- **Library drop** (`r-drops-1440.txt`; სუფთა გვერდზე, round 23-ის `drops.js`): ფაილი → video 0–6.008; `სრული მიქსი` → music **7**, ერთი clip `["music",7,16]`. Undo `დამატება — ღამის პულსი · სრული მიქსი`. Round 23-ის იდენტურია.

## 7. R24-S — diff-ის აუდიტი (`gates/snap-*.diff`, start = end)

- **`StudioWorkspace.tsx`** (snapshot `47e33554…` → live `324061ea…`), 5 hunk:
  1. `const detailPanelRef = useRef<HTMLElement>(null);`;
  2. `refreshTrackLaneLayout`: `const panel = detailPanelRef.current;`, `panel ? panel.offsetHeight : 0`, `panel !== null &&` (`instanceof`-ის null-check-ად ქცევა §2.2-ით ნებადართულია);
  3. `handleDetailPanelTransitionEnd`: `event.target === detailPanelRef.current`. Biome-მა 4 ხაზი 1-ზე გააერთიანა; A-მ ეს deviation 5-ში აღნიშნა და ის read site-ის შიგნითაა;
  4. Home: `preventDefault()` რჩება, `if (!isSeparatorTarget(event.target)) { current.seekTo(0); }`;
  5. `panelRef={detailPanelRef}`.

  სხვა ცვლილება არ არის. `isSliderTarget` და modifier-ის რიგი უცვლელია.
- **`ArrangementDetailPanel.tsx`** (`f28e069f…` → `1d1fa845…`): +4/−0. ცვლილებებია `type RefObject` import, `panelRef?: RefObject<HTMLElement>;`, `panelRef,` destructuring-ში და `ref={panelRef}` root `<section>`-ზე. სხეული ხელახლა არ დაინდენტებულა. `forwardRef` 0-ჯერ გვხვდება, l.404 `export function ArrangementDetailPanel(`.
- **`track-layout.test.tsx`** (`fba42d8a…` → `8e08f456…`): წაშლილი ხაზი **0**, დამატებული 130. 3 ახალი `it`: R24-H (diff l.87), R24-HC (l.109), R24-F (l.135).

## 8. R24-U

- **A-ს red-first:** `a-round-24/red-track-layout.txt` (2 failed: R24-H `expected +0 to be 5`, R24-F `expected null not to be null`) და `red-final-scratch.txt` (საბოლოო ტესტები snapshot წყაროზე, იგივე 2 failed / 34 passed). წავიკითხე; ეს A-ს output-ია.
- **ჩემი mutation-ები:**
  - **როგორ:** `store/app` მთლიანად დავაკოპირე `c-round-24/mut/app`-ში, `store/`-ის გარეთ. `node_modules` დროებითი junction-ით მივაბი და ბოლოს `rmdir`-ით მოვხსენი (მხოლოდ link; store-ის `node_modules` ხელუხლებელია, 618 entry). საკუთარი `vitest.config.mts`-ის `~` alias copy-ზე მიუთითებს, `esbuild.jsx='automatic'`. ყოველი mutation python-ის ზუსტი string replace-ით გაკეთდა (count == 1 assert), ყოველი run-ის შემდეგ ფაილი store-დან აღვადგინე და `cmp`-ით დავადასტურე.
  - **Control:** 36/36 passed (`r24u-control.txt`).
  - **Mut A** (`r24u-mutA.diff`, Home-ის პირობა დაბრუნებულია: `current.seekTo(0);` პირობის გარეშე): **1 failed** (R24-H) / 35 passed.
  - **Mut B** (`r24u-mutB.diff`, `ref={panelRef}` წაშლილია `<section>`-იდან): **10 failed** / 26. მათ შორისაა **R24-F** და R11-P2a refit ტესტი; დანარჩენი cap/auto-fit ტესტებიც ვარდება, რადგან workspace ref-ის გარეშე panel-ის სიმაღლეს ვეღარ კითხულობს. ესე იგი wiring კარგად არის დაცული.
  - **Mut C** (optional, `r24u-mutC.diff`, `event.target === null`): **1 failed**, ზუსტად l.543-ის `skips the lane refit while the detail panel animates and refits once on its height transitionend`.

- **A-ს deviation-ები 1–5 განვიხილე.** Dev 1 (`createRef`-ის ნაცვლად `{ current: null }`) მიღებულია. B-ის §2.3 (`createRef`) და R24-S (ტესტის ფაილში მხოლოდ დამატებული ხაზები) ერთმანეთს ეწინააღმდეგებოდა, რადგან `createRef`-ს არსებული `react` import-ის ხაზის შეცვლა სჭირდება. B-მ შემდეგ ჯერზე ერთი უნდა აირჩიოს. Dev 2–5 (position store probe, scratch დირექტორია, synthetic smoke seek, Biome reflow) დასაშვებია, ქცევას არ ცვლის და §7/§8-ში შემოწმდა.
- A-ს scratch-ის junction (`a-round-24/scratch/node_modules`) მართლაც მოხსნილია (`ls -la`: მხოლოდ `app/` და config-ები).
- §11-ის შენიშვნა: export-ის status `WAV შეიქმნა…` dialog-ის live region-შია. Workspace-ის `arrangement-status` ძველ ტექსტს ინარჩუნებს. `ArrangementExportDialog.tsx` frozen-ია (51 OK), ამიტომ round 23-ის ჩანაწერმა, სავარაუდოდ, სხვა element-ი წაიკითხა. ქცევა არ შეცვლილა.

## 9. R24-Doc

Doc 030 (`docs/implementation/2026/quarter-IV/030-studio-lab-separator-home-detail-ref.md`) ქართულადაა და TEMPLATE-ის სექციები აქვს. მასში წერია:
- separator-ის Home კონტრაქტი: `preventDefault` რჩება, seek არ ხდება, ახალი Home/End არ ემატება, End ისევ არ მუშავდება; დასაბუთებულია;
- რატომ იყო `nextElementSibling` მყიფე;
- რატომ `panelRef` და არა `forwardRef`: render-budget ითვლის `fiber.type.name`-ით function ტიპებს, inline `forwardRef`-ზე Biome ხელახლა დააინდენტებდა, პრეცედენტია `asideRef`/`bodyRef`;
- ტესტები და gate-ები.

Mermaid flow კოდს ემთხვევა (§7 diff). სტატუსის ხაზი „C-ის შემოწმება მოლოდინშია“ სწორია. Doc-ის gate-ის ციფრები A-სია; ჩემი ციფრები მათ ემთხვევა (§10).

## 10. Gates

**G24-1** (`c-round-24/gates/g1.sh`, ჩემი გაშვება):
- `npx tsc --noEmit` → exit 0, ცარიელი;
- `track-layout.test.tsx` → **36/36**;
- `npx vitest run` → **57 ფაილი, 1010/1010**, exit 0 (1007 + 3 ახალი `it`). `sfx-library` flake არ განმეორდა;
- `npx biome check ./app` → exit 0, **218 warning + 1 info**, 0 error (= round 23). Owned 3 ფაილი: `No fixes applied`, exit 0;
- `npm run build` → exit 0 (`build/server/index.js 1,281.53 kB`);
- `render-budget.test.tsx` და `detail-panel.test.tsx` მწვანეა სრულ run-ში და უცვლელია (ორივე `b-round-23-tree-sha256.txt`-შია → 51 OK).

**G24-2** (`gates/g2.sh start|end`):
- HEAD `c5ed47b`;
- `git status --short` = **47** ხაზი: c23-ის 46 + მხოლოდ `?? docs/implementation/2026/quarter-IV/030-studio-lab-separator-home-detail-ref.md`;
- start = end (status, diff-stat, owned sha იდენტური);
- `sha256sum -c b-round-23-tree-sha256.txt` → **51 OK**, start და end;
- protected **4/4 OK**;
- `Header.tsx` HEAD-ის იდენტურია (`git diff` ცარიელი; `cc1e531`-თან +21/−0);
- forbidden paths-ის status ცარიელია (`app/entry.server.tsx`-ის ჩათვლით);
- owned sha: StudioWorkspace `324061ea…`, DetailPanel `1d1fa845…`, test `8e08f456…`, doc 030 `ff9e74da…`.

**G24-3** (`$B restart` → ახალი context, credentials-ის გარეშე):
- **პირდაპირი `/studio-lab`** (`anon-direct.json`, `network-anon-direct.txt`, 155 მოთხოვნა):
  - `auth_user` null, cookie ცარიელი, localStorage-ში მხოლოდ `czaba_session_id`;
  - workspace ჩაიტვირთა, „Sign in required“ არ ჩანს;
  - media მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`;
  - `studio-token`, `recording`, `download`, R2 host: **0**;
  - hosts: 127.0.0.1:5173, `localhost:5199/api/cart` (pending, ნებადართული), Google fonts, GTM, GA `collect` `gcs=G100` (consent denied, ნებადართული).
- **Session hook** (`anon-session-hook.json`): fetch/XHR wrapper; რეალური click search-ზე, `$B type soft`, რეალური click `Soft impact`-ზე, Enter → clip 0 → 1. **fetch 0, XHR 0, Authorization 0.**
- **Header-ის `Studio LabDemo` ბმული** (ხილულ ბმულზე რეალური click `/`-დან; `anon-header.json`): `/studio-lab`, auth null, აკრძალული მოთხოვნა 0, media მხოლოდ 2 demo MP3 (hero-music ორჯერ, რადგან მთავარი გვერდიც ტვირთავს).
- **`/studio/middle-east`** (`anon-studio-me.json`, screenshot): „Sign in required“, workspace არ ჩანს, media 0. ქსელში ჩანს `app/components/studio/DownloadDialog.tsx` dev module (Vite source module, არა `/api/download`) და `api/cart`.
- **`curl`** (`curl-token.txt`):
  - anonymous → **401** `Please sign in to access Studio.`;
  - fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (carry).

**Premium auth bypass არ არის.**

## 11. Real export sanity (`runs/export-sanity.txt`, სუფთა `lay11`, 1440×900)

- რეალური `$B click`: `Export` → `WAV-ის ექსპორტი` → `დახურვა`.
- Dialog: `მთელი პროექტი · 0:00 — 00:18.000`, `WAV · 24-bit · 48 kHz · stereo`.
- Status (dialog-ის live region): `WAV შეიქმნა: 00:18.000, 24-bit · 48 kHz · stereo.`
- **WAV header:** RIFF/WAVE/fmt/data, PCM (1), 2 ch, 48 kHz, 24-bit; dataSize 5 184 000 + 44 = byteLength 5 184 044, RIFF size სწორია.
- **864 000 frame = 18.000 წმ** = projectEnd ✓. **NaN 0.**
- Full-scale **1800**, peak 1.0 (ცნობილი R13-M4). ბოლო არანულოვანი sample 17.99998 წმ-ზე. RMS −15.48 dBFS (= round 23).
- Dialog დაიხურა.

## 12. C-R23-01 information record (არც PASS, არც FAIL)

- `curl -s /studio-lab` ×3: **55 611 B**, თითოეულში **4 NUL** (offset-ები 26019, 26020, 42403, 42404). Round 23-ის ზუსტად იგივეა, ე.ი. ამ round-ის markup-ის ცვლილებამ byte boundary არ გადაწია.
- `/`, `/products`, `/about`, `/studio/middle-east`: NUL 0.
- Lane-ის სახელის ღილაკების `aria-label`-ები hydration-ის შემდეგ:
  - video: 28 char, U+FFFD 0;
  - **music: 31 char, U+FFFD ×2** (`10db 10e3 10e1 10d8 10d9 10d0 20 2014 20 fffd fffd 10d0…`);
  - stems: U+FFFD 0;
  - sfx: U+FFFD 0.
- მთელ DOM-ში U+FFFD/NUL-იანი ატრიბუტი 1-ია (music-ის `aria-label`). ხილულ ტექსტში 0.
- სტატუსი: ღიაა, medium, Tech Lead-ის ნებართვას ელოდება (§7 task).

## 13. ახალი ბაგები

**არცერთი.**

დაკვირვებები (ბაგი არ არის; ცნობისთვის):
- Clip-ზე click focus-ს არ იღებს (`tabIndex -1`), ამიტომ „Home მონიშნულ clip-ზე“ რეალურად body/წინა focus-იდან სრულდება. ეს ცნობილი a11y მდგომარეობაა: folded clips/clip-ების keyboard მისაწვდომობა SRW-17-ის კანდიდატია.
- დაკეცილი lane-ის handle-ს `aria-valuenow` 80-ს აჩვენებს, row კი 36-ია (შენახული სიმაღლე). ეს უკვე არსებული ქცევაა და round 23-ის შემდეგ არ შეცვლილა.
- Anonymous session-ში `Soft impact` Enter-ით music ხაზზე 00:00-ზე დაემატა (აქტიური ხაზი music-ია). Library-ის ცნობილი default-ია და ამ round-ის scope-ში არ შედის.

## 14. Carried (ღია, არ დახურულა)

**ღია C ბაგები:**
- **C-R23-01** (medium, SSR NUL; Tech Lead: React 19 ან `entry.server.tsx`-ის ვიწრო grant);
- C-R6-02 და C-R8-01 (Tech Lead, quiet Chrome).

**Root (`root-pre-push-review.md`, `publication-checkpoint.json`):**
- purchased loader-ში middle-east hardcode-ია (SRW-21);
- Lenis `/studio/*`-ზე;
- portable instruction-file paths;
- export hard-clip 0 dBFS-ზე (R13-M4, SRW-13; ამ round-შიც 1800 full-scale sample);
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, uncommitted round-6..24 tree (ახლა 47 ხაზი);
- shared `Modal.tsx`-ის focus gap;
- root GA `scroll`/`page_view` consent-denied-ით (ამ round-შიც 1 `collect` `gcs=G100`);
- ორი foreign agent ფაილი (`.claude/agents/frontend-architect.md`, `.codex/agents/frontend-architect.toml`; არ შემხებია);
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4 და C-ის python probe-ები rounds 21–22-ში;
- fake Bearer → 500 token-ის გარეშე (ამ round-შიც);
- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს (ამიტომ seek და drag synthetic-ია);
- publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, final commit/push);
- `entry.server.tsx`-ის `Content-Type: text/html` charset-ის გარეშე (დაკვირვება, იგივე Tech Lead-ის კითხვა).

**სხვა scheduled:**
- `ArrangementLibrary.tsx:549`-ის `biome-ignore` მიზეზი;
- lane overlay `/60`;
- footer-ის selected-clip-ის ლათინური ტექსტი;
- group hint-ის ლათინური `range`;
- folded clips a11y tree-ში;
- SRW-13 → SRW-14..20 → SRW-21 → T12.

**Tech Lead manual:**
- R23-1/2, R12-L4, RF7-2/RF7-3;
- R8-M1/M2, R10-N1/N2, R30-H1;
- R11-P3m, R11-SB, R13-RM, R15-SB;
- R17-T, R18-T, R19-T, R22-T;
- Lenis `/studio/*`;
- MP4/MOV-ის დადებითი import path.

## 15. B-სთვის

- Round 24-ის scope დახურულია C-ის მტკიცებულებით: R24-H/HC/F/R/S/U/Doc, G24-1..3, export sanity. `feature-status.md`-ში D-29o ნაწილი 2 შეიძლება მოინიშნოს „მზადაა“.
- C-R23-01 ღიაა და უცვლელია (4 NUL, იგივე offset-ები). Tech Lead-ის პასუხის შემდეგ ის SRW-13-ზე ადრე უნდა დაიგეგმოს, როგორც task §7 ამბობს.
- შემდეგი feature round: SRW-13, stage 1 (R13-M4 hard-clip + master bus).

## 16. ფაილები

- `c-round-24/{b,setup,r,h,p2a}.sh`, `gates/{g1,g2}.sh`;
- `scripts/{h,p2a,sepdrag,sepdrag-down}.js` და წინა round-ების helper-ები (`c-round-11/scripts/lay11.js`, `c-round-13/scripts/fv.js`, `c-round-23/scripts/{drops,wav}.js`);
- `runs/*`, `gates/*`, `shots/{h-1280-after,fv-1440,anon-studio-middle-east}.png`;
- `mut/` (scratch copy; junction მოხსნილია).
