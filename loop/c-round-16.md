# C — Round 16-ის დამოუკიდებელი შემოწმება: panel polish 14a (C-R11-01..03, deviation 9, C-R15-02, C-R15-03)

თარიღი 2026-10-11 · შემმოწმებელი C · დავალება `current-task.md` (round 16) · A-ს ანგარიში `a-round-16.md`.

**მტკიცებულებები:** `c-round-16/` (`gates/`, `runs/`, `shots/`, `scripts/`, `guard/`).

**Browser:**
- gstack browse, state `c-browse.json`.
- სესიის დასაწყისში ფაილი არ არსებობდა. G16-3-ის წინ server გავაჩერე და ფაილი წავშალე, ამიტომ context ორივეჯერ ახალი იყო: `auth_user` null, cookie "".
- მისამართი `http://127.0.0.1:5173/studio-lab`; viewport-ები 1440×900 და 1280×720.
- Media მხოლოდ საკუთარი სინთეზურია:
  - `media/beeps-6s-vp9-opus.webm`;
  - truncation-ის ტესტისთვის მისი ასლი გრძელი სახელით: `c-round-16/media/`.

**რა არ გამიკეთებია:**
- source-ში არაფერი შემიცვლია;
- commit, push და deploy არ გამიკეთებია.

**Tree:** ბოლოს ზუსტად ისეთია, როგორც დასაწყისში (`gates/git-status-{start,end}.txt`) და A-ს end status-ის იდენტურია.

## 1. Verdict

**taskStatus: PASS.** round 16-ის ყველა acceptance ID და §6-ის ყველა მიმდებარე რეგრესია C-მ თავად გაზომა და გავიდა.

**ახალი ბაგი:** ერთი, Low (**C-R16-01**, §9). ის C-R15-02-ის კლასისაა, მაგრამ სხვა, round 16-მდე არსებული მექანიზმით ჩნდება. ამ რაუნდის რეგრესია არ არის და acceptance-ს არ ეხება.

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R16-L1 | **PASS** (7/7) | `runs/l1-1440.txt`, `shots/folded-handle-1440.png` |
| R16-F1 | **PASS** | `runs/f1-1440x900.txt`, `f1-1280x720.txt`, `f1-extra-1280.txt`, `long-title-1280.json`, `residual-1440.txt`, `shots/footer-selected-1280.png`, `long-title-truncate-1280.png` |
| R16-F2 | **PASS** | `runs/f2-1440-288.txt`, `f3-1280-480.txt` (EXPANDED), `shots/f2-1440-288.png` |
| R16-F3 | **PASS** (ერთი არავალიდური მცდელობა შენახულია) | `runs/f3-1280-480.txt`, `shots/c-r15-02-flow-1280-480.png`, `range-residual-1280-480.png` |
| R16-H1 | **PASS** (1–6) | `runs/h1-1280.txt`, `h1-control-1440.txt`, `cancel-restore-1280.txt`, `gates/detailpanel-hunks.txt`, `shots/cap-autofit-off-1280.png` |
| R16-G1 | **PASS** | `runs/g1-1440.txt` |
| R16-T1 | **PASS** | `gates/guard-c16.txt` (M5, M6) |
| R16-U | **PASS** | `gates/vitest-*.txt`, `gates/guard-c16.txt` |
| R16-Doc | **PASS** | §7 |
| R15-P3 quick (D-29g) | **PASS** | `runs/quick-1440-288.txt` |
| R13-F2 quick / R13-F3 quick | **PASS** | `runs/quick-1440-288.txt` |
| R11-P2 / P2a quick (ორივე viewport) | **PASS** | `runs/p2-quick-1280x720.txt`, `p2-quick-1440x900.txt` |
| R14-E quick (E1, E4, Tab ციკლი) | **PASS** | `runs/e-1440.txt`, `e4-export-1440.txt` |
| R11A-1 quick, Dock quick | **PASS** | `runs/r11a1-dock-1280.txt`, `quick-1440-288.txt` (DOCK) |
| RF7-P2 | **PASS** | `render-budget.test.tsx`-ის sha B-ისას უდრის; ტესტი 979-ში მწვანეა |
| G16-1 / G16-2 / G16-3 | **PASS** | `gates/` |

## 2. Gates

**G16-1** (C-მ თავად გაუშვა):
- 3 focused ფაილი: **74/74**;
- სრული vitest: **55 ფაილი, 979/979** (965 + 14). `sfx-library` flake არ განმეორდა;
- `tsc`: exit 0;
- Biome `app/lib/arrangement` + `app/components/arrangement`: 54 ფაილი, 0 შეცდომა;
- Biome `./app`: 0 შეცდომა, 218 warning (round 15-ის რაოდენობა);
- `npm run build`: exit 0.

**G16-2** (`gates/g2.txt`, `sha-b15.txt`):
- `b-round-15-tree-sha256.txt`: 38 OK, 7 FAILED. FAILED ზუსტად A-ს 7 owned ფაილია: 3 product, 3 test და doc 024;
- §3.3-ის frozen ფაილები, თითო-თითოდ B-ის hash-ის მიმართ, ყველა OK:
  - dock, `video-sync.ts`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementExportDialog.tsx`;
  - `ArrangementContext.tsx`, `Modal.tsx`, `render-budget.test.tsx`;
  - `panels.ts`, `panels.test.ts`, `Header.tsx`;
- A-ს `frozen-start.txt`: 35/35 OK;
- `a-round-16/bak/*.base.*` = B-ის hash-ები, 9/9;
- protected: 4/4 OK;
- `Header.tsx`: `git diff HEAD` ცარიელია; `cc1e531`-ის მიმართ +21/−0;
- აკრძალულ dir-ებში ცვლილება არ არის. გამონაკლისია ორი უცხო agent ფაილი (`.claude/agents/frontend-architect.md`, `.codex/agents/frontend-architect.toml`), რომლებიც უცვლელად `??`-ად რჩება; არ წამიკითხავს. გადაწყვეტილება root-ისაა;
- instrumentation grep owned source-ში: 0;
- `git status` = start = A-ს end.

**Diff-ის მიმოხილვა** (`gates/product-diff.txt`, base backup-ების მიმართ):
- **Lane:**
  - folded-ის class string დამოუკიდებელია: `pointer-events-none`, cursor-ისა და hover-ის გარეშე;
  - unfolded string round 15-ის byte-ზე იდენტურია;
  - folded branch `handleHeightPointerDown`-ში ახლა მხოლოდ `return`-ს აკეთებს.
- **Workspace:**
  - `setStatus` მხოლოდ `toggleTrackFold`-ში დაემატა;
  - prop `isLaneAutoFitOn`;
  - footer-ში `basis-full truncate` + `title` და `aria-hidden` placeholder (`&nbsp;`).
- **Panel:**
  - prop;
  - clamp/restore branch-ები არსებულ committed-refs `useLayoutEffect`-ში;
  - `autoFitClampRef` user resize-ის ორივე გზაზე იშლება.
- ახალი context, ResizeObserver, polling ან history ჩანაწერი არ არის.

**G16-3** (ახალი context, credentials-ის გარეშე):
- **პირდაპირი `/studio-lab`** (`gates/anon-direct.json`, `network-anon-direct.txt`):
  - `/api/studio-token`, `/api/recording-*`, `/api/download` და R2 host: **0**;
  - media მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`;
  - ერთადერთი API მოთხოვნა ცნობილი root-ის `GET localhost:5199/api/cart`-ია.
- **Header-ის ხილულ „Studio LabDemo“ ბმულზე რეალური click** (`anon-header.json`, `network-anon-header.txt`): იგივე შედეგი.
- **სესიის fetch hook** ძებნა → add-ის დროს (`anon-session-bodysends.json`):
  - `Authorization` 0, `bodySends` 0;
  - ერთადერთი fetch GA-ია (consent denied).
- `grep Authorization` arrangement-ის source-ში: 0.
- **`curl`** (`gates/curl-token.txt`):
  - anonymous → **401** `Please sign in to access Studio.`;
  - fake Bearer → 500, token-ის გარეშე;
  - backend 5199: 000.
- **`/studio/middle-east`** → „Sign in required“; workspace და media არ ჩაიტვირთა (`anon-studio-me.json`, `shots/anon-studio-middle-east.png`).
- **Premium auth-ის bypass არ არის.**

## 3. R16-L1: დაკეცილი ხაზის სახელური (1440×900, `runs/l1-1440.txt`)

Fold რეალური `$B click`-ით: music 81 → 36.

1. **Handle:**
   - computed `pointer-events: none`, cursor `auto`;
   - class `… h-1.5 pointer-events-none touch-none focus-visible:…`;
   - tabIndex 0, role `separator`, `aria-valuetext` „დაკეცილია · 80 px“.
2. **`elementFromPoint` clip-ის ქვედა 3/2/1 px-ზე** (clip 320–347, y 344/345/346):
   - ცენტრი → clip ×3;
   - მარჯვენა trim edge → TRIM-R, TRIM-R, clip-ის root (trim edge-ის rect 346-ზე მთავრდება);
   - handle არცერთხელ.
3. **Synthetic trim** მარჯვენა კიდეზე, ქვედა −2 px-ზე, −40 px:
   - duration 16 → 15;
   - Undo `დამატება — Soft impact` → `Trim — მარჯვენა კიდე`;
   - row 36, folded.
   - რეალური Ctrl+Z → 16, Undo-ს სათაური უკან დაბრუნდა. ე.ი. ჩანაწერი ზუსტად ერთია.
4. **Synthetic pointerdown/move/up handle-ის ძველ rect-ზე:**
   - პირდაპირ handle ელემენტზე dispatch-ით → row 36, folded;
   - `elementFromPoint`-ის target-ზე (lane body DIV) → 36, folded, history-ს ჩანაწერის გარეშე.
5. **კლავიშები** (handle-ზე `.focus()`):
   - რეალური ArrowDown → 81, „80 px“;
   - fold-ის რეალური click → 36, „დაკეცილია · 80 px“;
   - რეალური ArrowUp → 81 (მხოლოდ unfold).
6. **Handle drag +20 unfolded-ზე** → 81 → mid 101 → 101, valuenow 100. Undo უცვლელია.
7. **DragEvent drop** (app-ის საკუთარი `dragstart` library option-ზე, MIME `application/x-czaba-workspace-source`), დაკეცილი music ხაზის ქვედა −2 px-ზე (1380, 350):
   - target lane body-ა;
   - music 1 → 2, სხვა ხაზები უცვლელია;
   - ერთი Undo: `დამატება — Middle East — საჯარო preview`;
   - ხაზი დაკეცილი რჩება.

Ableton TRK-04: სიმაღლე split line-ით იცვლება გაშლილ ტრეკზე, fold კი 36 px-ს იძლევა. ეს ქცევა ემთხვევა.

## 4. R16-F1: footer-ის რეზერვი

Select: რეალური `$B click` music clip-ის header-ზე. Deselect: ცარიელ music ხაზზე (იგივე აქტიური ხაზი). ორ-ორი ციკლი.

| Viewport | ხუთივე მდგომარეობა (none / sel / desel / sel / desel) |
|---|---|
| 1440×900 | footer **69**, scroller 496, ხაზები 81/81/81/81, panel 144, body 233–664: **Δ0** |
| 1280×720 (panel გახსნილია) | footer **69**, scroller 280, ხაზები 53/61/61/61, panel 142 (cap), body 271–484: **Δ0** |

- **Row-ები:** status 7, reserve/selected 27, shortcut 47 (ორივე viewport-ზე).
- **Reserve:**
  - `aria-hidden="true"`, ერთი U+00A0 (code 160);
  - class `basis-full tabular-nums text-muted`, სიმაღლე 16;
  - `arrangement-selected-clip` არ არსებობს.
- **არჩეული ხაზი:**
  - `კლიპი: ღამის პულსი · სრული მიქსი · start 00:00.000 · length 00:16.000 · source offset 00:00.000`;
  - `title === textContent`;
  - scrollWidth/clientWidth 1416/1416 (1440) და 1256/1256 (1280);
  - `nowrap` + `ellipsis`.
- **ვიდეო, stems და SFX clip-ების არჩევა 1280-ზე:** footer 69, ხაზები და panel უცვლელია.
- **გრძელი სახელი** (საკუთარი სინთეზური ფაილის ასლი, 140+ სიმბოლო):
  - ერთი ხაზი, ellipsis, 1287 > 1256;
  - footer 69, `title === text`.
- **C-R11-02 repro 1280-ზე:** ხაზები 61 (lane 60) და cap 142 ახლა მუდმივია.
- **Footer-ის ფასი (D-29g):**
  - **1440:** 49 → 69, +20 px-იანი მუდმივი row. Scroller 516 → 496, body 451 → 431 (round 15-ის C-ის body 233–684 → ახლა 233–664). ხაზები 81-ზე რჩება, cap არ ირთვება;
  - **1280:** ზედმეტი row არ ემატება round 15-ის „არჩეულ“ layout-თან შედარებით.
  - A-ს §1.4a-ს და doc 025-ის ციფრებს ემთხვევა და გამჟღავნებულია.
- **Residual (ინფორმაცია):**

| მდგომარეობა | 1440×900 (`residual-1440.txt`) | 1280/480, ვიდეო გაფართოებულია (`f3-1280-480.txt`) |
|---|---|---|
| clip + range | footer 89 (+20), scroller 476, body 233–644 | footer 89, body 255–480 |
| Ctrl+A | footer 89 (+20), count + selected row | — |

  A-ს ცხრილს ემთხვევა.
- **Esc:** კლიპის არჩევას არ ხსნის (`f1-extra-1280.txt`, AFTER_ESC). ეს Ableton PNL-02/VID-06-ს შეესაბამება: Esc დიდ ვიდეოს/ძიებას ხურავს. ბაგი არ არის.
- **დადასტურებული confounder:** აქტიური ხაზის შეცვლა (SFX ↔ music) body-ს ±16 px-ით ცვლის 1280/288-ზე (271–500 ↔ 271–484); footer ამ დროს 69 რჩება. იხ. C-R16-01.

## 5. R16-F2 და R16-F3: გაფართოებული ვიდეო

Expected (D-29f):
- width = max(160, min(640, lib − 16, (h − 16)·16/9, (h/2)·16/9));
- top = max(body.t + 8, body.b − 8 − h);
- left = lib.l + 8.

| შემთხვევა | body | box l,t,w×h | Δ (მაქს.) | inset | hit-ები ◀/search/sep/preview | round 15 (C) |
|---|---|---|---|---|---|---|
| 1440/288 | 233–664 (431) | 8, 503, 272×153 | 0 | 169px = 153+16 | 4/4 | body 233–684, box 8,523 |
| 1280/480 | 255–500 (245) | 8, 369.5, 217.77×122.48 | 0.02 | 138.5px = 122.48+16 | 4/4 | body 255–520, box 8,379.5 235.55×132.48 |

**R16-F3** (1280×720, library 480, ვიდეო იმპორტირებულია, კლიპი არ არის არჩეული):
- ერთხელ ავირჩიე SFX ხაზზე deselect. მერე library 480-მდე separator-ზე რეალური ArrowRight ×14-ით გავაფართოვე.
- **არავალიდური მცდელობა 1** შენახულია (`runs/f3-1280-480-attempt1-invalid-selection-kept.txt`):
  - deselect 480-ზე ვერ მოხერხდა, რადგან music clip ხილულ ხაზს მთლიანად ფარავს;
  - flow არჩეული Soft impact-ით დაიწყო. ხელახლა გავუშვი.

| ნაბიჯი | body | box | box bottom − (body.b − 8) | preview ზედა 12 px: box-ში / sample | control-ები | footer |
|---|---|---|---|---|---|---|
| pre (არჩევის გარეშე) | 255–500 | compact 160×90 | — | 0/360 | ყველა OK | 69 |
| ⤢ (რეალური) | 255–500 | 8, 369.5, 217.77×122.48 | −0.02 | 0/360 | ყველა OK | 69 |
| search (რეალური click), `soft`, option (რეალური click), რეალური Enter | **255–500 (Δ0)** | **უცვლელი**, expanded | −0.02 | **0/360** | ყველა OK | 69 |
| deselect (SFX ხაზი) | 255–500 (Δ0) | უცვლელი | −0.02 | 0/360 | ყველა OK | 69 |
| residual: range drag music clip-ზე | 255–**480** (−20) | უცვლელი | **+19.98** | **162/360** | ყველა OK, არცერთი დაფარული არ არის | 89 |

- **Add:**
  - კლიპები 4 → 5;
  - status `„Soft impact“ დაემატა მუსიკა ხაზზე 00:18.450-ზე.`;
  - ახალი კლიპი არჩეულია;
  - box არც განძრეულა და არც დაბრუნებულა;
  - dock-ის counter-ები 0.
- **Undo:**
  - Undo-ს სათაური add-მდეც და მის შემდეგაც `დამატება — Soft impact`-ია, რადგან `lay11` იმავე სახელით მთავრდება;
  - ერთი რეალური Ctrl+Z-ით 5 → 4 კლიპი: მხოლოდ დამატებული `music 18.45` წაიშალა;
  - box უცვლელი და expanded დარჩა. ე.ი. ჩანაწერი ზუსტად ერთია.
- **თანმიმდევრობის დაზუსტება (`runs/f3-1280-480.txt`):**
  - `DESEL2` (ცარიელი music ადგილი 480-ზე ვერ მოიძებნა) no-op იყო. მისი შემდეგი `DESELECTED` ხაზი ჯერ კიდევ არჩეულ კლიპს აჩვენებს (`sel` = Soft impact 18.45);
  - ამიტომ range residual არჩეული კლიპით გაიზომა (clip + range, ერთადერთი მისაწვდომი range მდგომარეობა);
  - ნამდვილი deselect (`DESELECTED_SFX`, SFX ხაზი) ამის **შემდეგ** მოხდა და არჩევაც, range-იც მოხსნა: footer 69, body 255–500 (Δ0 EXPANDED-თან), box უცვლელი;
  - ცხრილში „deselect“-ის სტრიქონი ამ `DESELECTED_SFX`-ის მნიშვნელობებია. F3.3 ამ მონაცემებზე სრულდება.
- **Range residual:** control-ები (wave, toggle, ◀, search, separator) არ იფარება. ამიტომ ეს D-29g-ის ინფორმაციაა და არა ბაგი, დავალების §4 F3.4-ის მიხედვით.

## 6. R16-H1: cap → auto-fit off (1280×720, `runs/h1-1280.txt`)

Pre: panel 142 (cap), valuetext „142 px“, ხაზები 53/61/61/61, class `transition-[height]`.

1. **SFX handle-ზე `.focus()` და რეალური ArrowDown:**
   - 100 rAF sample-ში მხოლოდ `[142]` ჩანს, `getAnimations()` მაქსიმუმი 0;
   - ხაზები 53/61/61/69;
   - შემდეგ transition `all 0s`.
2. **Viewport 1440×900** → 142; **უკან 1280×720** → 142.
3. **Toggle (რეალური) collapse** → 36 („დაკეცილია · 142 px“); **reopen** → **142**.
4. **Synthetic separator drag (+10 სიმაღლე):**
   - mid 144…152, შემდეგ 152, valuenow 152;
   - Undo უცვლელია;
   - resize 1440 → 1280-ის შემდეგ 152 რჩება (D-29b).
5. **Control 1440×900** (`h1-control-1440.txt`): პირველი რეალური ArrowDown → panel **144**, sample-ები `[144]`, ხაზები 81/81/81/89.
6. **R9-D3 სტატიკური შემოწმება** (`gates/detailpanel-hunks.txt`):
   - hunk-ები: `71a72 380a382 403a406 418a422 420c424 429c433,454 466a492 511a538`;
   - `writeDetailPlayhead` l.102, writer l.120, `arrangement-detail-playhead` l.126, `arrangement-detail-waveform` l.167;
   - 72–380-ში hunk არ არის. Playhead line, writer და waveform უცვლელია.

**A-ს deviation 2 (cancel → restore)** (`runs/cancel-restore-1280.txt`):

| ნაბიჯი | panel |
|---|---|
| cancel-ით მოსრული lane drag, მის დროს | 142 |
| cancel-ის შემდეგ | 142, auto-fit აღდგა (53/61/61/61) |
| viewport 1440 | **144** (როგორც round 16-მდე) |
| უკან 1280 | 142 |
| commit-ად ArrowDown | 142 |
| viewport 1440 | **142** (შენარჩუნებული) |

კონტრაქტს ემთხვევა: „cap-ის სხვა მიზეზით მოხსნა ისევე იქცევა, როგორც ადრე“.

## 7. R16-G1, R16-T1, R16-U, R16-Doc

**R16-G1** (`runs/g1-1440.txt`):
- clip drag ეჭირა: synthetic pointerdown stems clip-ის header-ზე + 4 move, release-ის გარეშე;
- **Space-ის გზა:**
  - წინა status: add-ის ტექსტი;
  - fold-ზე focus და რეალური Space → არ დაიკეცა (81);
  - status ზუსტად `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` (= `GESTURE_EDIT_BLOCKED_MESSAGE`, `ArrangementContext.tsx`).
- **Click-ის გზა:**
  - წინა status: Ctrl+Z-ის `Undo: …` ტექსტი, ე.ი. ორი გზა ერთმანეთისგან დამოუკიდებლად შემოწმდა;
  - მეორე pointer-ის (id 9) synthetic click → არ დაიკეცა (81), status იგივე ტექსტია.
- pointerup-ის შემდეგ ერთი რეალური click fold-ს აკეთებს (81 → 36).

**R16-T1 + R16-U guard** (`gates/guard-c16.txt`):
- ასლი `c-round-16/guard/`, `node_modules` junction-ით;
- base 74/74; ყოველი mutation-ის შემდეგ ფაილები `cmp`-ით source-ის იდენტურია; ბოლოს 74/74.

| Mutation | ჩავარდა |
|---|---|
| M1: folded handle-ს `pointer-events-none` აღარ აქვს | 1 (C-R11-01 class test) |
| M2: placeholder მოხსნილია (`: null`) | 1 (reserve test) |
| M3: clamp `Math.min` → `previous` | 8 |
| M3b: clamp-ის პირობა `false`-ია | 8 |
| M4: `toggleTrackFold`-ში `setStatus` მოხსნილია | 1 (deviation 9) |
| **M5: C-ის G6** (`Tab && Enter`) | **1** (C-R15-03 test) |
| **M6: ყველა კლავიშს ამუშავებს** (`if (false)`) | **1** (C-R15-03 test) |
| M7: არჩეულ ხაზს `basis-full truncate` აღარ აქვს | 1 |

**R16-U:**
- ტესტების რაოდენობა: track-layout 23 → 31, detail-panel 19 → 24, export 18 → 19;
- წაშლილი ხაზები მხოლოდ A-ს ორი named exception-ია (81 → 36; 144 → 130). ეს diff-ით შევამოწმე.
- **C-R11-03-ის ბულეტები სახელით:**
  - (a) პირველი ცვლილება rendered სიმაღლეს ინახავს: `track-layout` l.860 „keeps the capped panel height when the first manual lane change turns auto-fit off, through resize and reopen“ და `detail-panel` l.651;
  - (b) resize და collapse/reopen სიმაღლეს არ ცვლის: იგივე l.860 და `detail-panel` l.679;
  - (c) cap-ის მოხსნა ადგილის ზრდით 144-ს აღადგენს: `track-layout` l.892 და `detail-panel` l.663;
  - დამატებით: cancel-ის გზა l.904, l.922 და l.940;
- **C-R11-01:** l.807; **C-R11-02:** l.830; **deviation 9:** l.957.

**R16-Doc:**
- **Doc 024:** diff მხოლოდ სტატუსის ხაზსა და TODO-შია.
  - ჩაწერილია: C round 15 FAIL მხოლოდ R15-P3-ის ატრიბუტზე; C-R14-01/02 C-მ დახურა; C-R15-01 B-მ მიიღო (D-29g); C-R15-02/03 → round 16 „pending C“.
  - „Resolved“-ის ფორმულირება არ არის.
- **Doc 025:**
  - ქართულადაა და TEMPLATE-ის სექციები აქვს;
  - „In Progress — pending C“;
  - footer-ის ფასი, residual-ები და confounder ჩაწერილია;
  - გადაუმოწმებელი PASS არ არის.

## 8. მიმდებარე რეგრესიები და product flow

**R15-P3 quick, D-29g-ის წაკითხვით** (1440/288, `runs/quick-1440-288.txt`):
- ✕, placeholder და Esc-ის შემდეგ nav/list-ზე `style.cssText === ''` (ატრიბუტი ცარიელია);
- padding-bottom 4px;
- scrollHeight list 637, nav 431. ეს run EXPANDED-იდან იწყება, ამიტომ პირველი expand-ის pre-expand sample არ მაქვს. ტოლობა **დასკვნილია**: ✕-ის შემდეგი მნიშვნელობა მეორე expand-ის pre-ა, და placeholder/Esc მას უდრის. nav-ის sh = clientHeight 431 (overflow არ არის). list-ის 637 round 15-ის pre-expand მნიშვნელობას უდრის (`c-round-15/runs/p3-1440-288.txt`).

**R13-F2 quick:**
- drag +200/+100 → 8,503 → 208,603 (Δ 200/100);
- ⠿ რეალური ArrowRight ×3 → +48;
- Undo უცვლელია; inset 169px უცვლელი რჩება.

**R13-F3 quick:**
- ✕ / placeholder / Esc → 1268,92 160×90, `isSameNode` true, ტექსტი `ვიდეო პატარა ხედს დაუბრუნდა.`

**R11-P2 / P2a quick:**
- **1440:** auto-fit 81×4 / 144; fold/unfold 36 ↔ 81; handle +20 → 101; separator mid 146…154 ნახტომის გარეშე; history არ იცვლება.
- **1280:**
  - mount collapsed (D-29a);
  - open → 142, 53/61/61/61;
  - fold SFX → panel 144 (ადგილი გაიზარდა, cap მოიხსნა), unfold → 142;
  - handle +20 → 81;
  - separator mid 144…152 ნახტომის გარეშე.

**R14-E quick** (1440):
- **E1:** click → `დახურვა`; X → Shift+Tab ×2 → Enter ხურავს, ფოკუსი Export-ზე;
- **Tab ×8 და Shift+Tab ×8:** 16-ვე ნაბიჯი dialog-შია;
- **E4:** Esc ხურავს, ფოკუსი Export-ზე.

**R11A-1 quick + dock** (1280):
- ◀ → rail 40, ▶ → 288;
- separator: ArrowLeft ×3 → 288, ArrowRight ×16 → 480, უკან → 288;
- dock 992×107 (480-ზე 800×107; 1440-ზე 1152×107);
- ვიდეო 160×90, ერთი ხილული `<video>`, ორივე muted.

**ნამდვილი Export** (find → add → fit video → export; `runs/e4-export-1440.txt`):
- **პროექტი:** ვიდეო 6.008 s, music 0–16, stems 2–18, SFX 4–6.
- **Dialog:** `0:00 — 00:18.000`. Export-ზე რეალური Tab → `WAV-ის ექსპორტი`, რეალური Enter.
- **WAV:**
  - RIFF/WAVE, PCM, 2 ch, 48 000 Hz, 24-bit;
  - data 5 184 000 B = **864 000 frame = 18.000 s**, dialog-ის ტოლი;
  - NaN 0, DC 6.6e-4, onset 0;
  - RMS: 0–0.5 s −14.5; 4–5 s (SFX) −11.2; 8–16 s −15.6; 16–17.9 s (stems-ის კუდი) −24.7; ბოლო 10 ms −73 dBFS.
- **Peak 1.0, 1802 sample FS-ზე.** ეს ცნობილი R13-M4/SRW-13 hard-clip-ია (carry), ახალი არ არის.

**დაკვრა** (sanity, არა sync run; `runs/play-1280.txt`):
- რეალური Space 3 s;
- master tap-ზე სიგნალია (peak 1.29 limiter-მდე, RMS max 0.61);
- ხილული `<video>` − transport 14 sample-ზე: |Δ| ≤ 11 ms;
- pause ორივეს 3.182-ზე აჩერებს;
- dock-ის counter-ები 0/0/0/0.
- Stall, hard seek და counter-ის ცვლილება არ შემინიშნავს.

**RF7-P2:** `render-budget.test.tsx`-ის sha B-ისას უდრის; ტესტი 979-ში მწვანეა.

**Harness:**
- კლავიშები რეალური `$B press`-ით;
- synthetic pointer-ები `buttons: 1`-ით;
- დასახელებული click-ები რეალური `$B click`-ით. Marker-ები `data-c16*` მხოლოდ browser-ში დაისვა.
- ცარიელ ხაზზე deselect synthetic-ია (gstack-ის allowlist რეალურ კოორდინატულ click-ს არ უშვებს), ისევე როგორც A-სთან.

## 9. ახალი ბაგი B-სთვის

**C-R16-01 (Low): აქტიური ხაზის შეცვლა გაფართოებული ვიდეოს დროს body-ს 16 px-ით ამოკლებს, ყუთი კი preview-ს ფარავს.**
(`runs/active-lane-residual-1440-288.txt`, `shots/active-lane-residual-1440-288.png`)

**Repro** (1440×900, library 288):
1. ცარიელ SFX ხაზზე click (აქტიური SFX, არჩევის გარეშე) → body 233–680.
2. ⤢ (რეალური) → box 8,519 272×153, bottom 672 = body.b − 8.
3. რეალური click music clip-ზე → აქტიური „მუსიკა“, რომლის preview ტექსტი 2 ხაზად იშლება → body 233–**664**.
4. Box bottom 672 = preview-ის ზედა 8 px-ზე. Preview-ის top 12 px-ის sample-ებიდან **136/216** box-ს აბრუნებს.

**რა არ ზიანდება:**
- footer 69 მუდმივია (round 16-ის fix მუშაობს);
- control-ები (wave, toggle, ◀, search, separator) არ იფარება.

**მიზეზი:** გაყინული `ArrangementLibraryPreview.tsx`-ის „აქტიური ხაზი: …“ wrap-ი (A-ს §1 confounder) და D-29g-ის წესი „placement-ის შემდეგ re-place არ ხდება“. ეს მექანიზმი round 16-მდეც არსებობდა, ამიტომ რეგრესია არ არის.

**B-ის გადასაწყვეტია:** preview ტექსტის ერთ ხაზზე დატოვება (`truncate`) round 18-ის 14c-ში (preview ფაილი), ან გადაფარვის მიღება D-29g-ის ფასად.

**ინფორმაცია (D-29g residual, ბაგი არ არის):** range ან ≥ 2 კლიპი footer-ს +20-ს უმატებს. 1280/480-ზე გაფართოებული ყუთი ამის შემდეგ preview-ის ზედა 162/360 sample-ს ფარავს, control-ების გარეშე.

## 10. A-ს deviation-ები (C-ის აზრი)

1. **Folded pointerdown branch `return`-ს აკეთებს და არ არის წაშლილი:** დასაშვებია, რადგან დავალება ორივე ვარიანტს უშვებს. L1.4-ში direct dispatch-მა unfold არ გამოიწვია.
2. **Cancel-ის restore:** C-მ browser-ში დაადასტურა (§6). „ისევე, როგორც ადრე“-ს ემთხვევა.
3. **Clamp collapsed მდგომარეობაშიც:** reopen 142-ზე ხდება, რაც announced მნიშვნელობას უდრის (H1.3). B-ის გადასაწყვეტია, თუ მხოლოდ open-ზე უნდა მოქმედებდეს.
4. **`&nbsp;`:** DOM-ში ერთი U+00A0-ა (code 160).
5. **Esc არ ხსნის არჩევას:** დადასტურდა. ეს Ableton PNL-02/VID-06-ს შეესაბამება. დავალებაში „or Esc“ ჩანაწერი B-მ უნდა დააზუსტოს.
6. **„Range only“ UI-დან მიუწვდომელია:** C-მაც მხოლოდ clip + range მიიღო.
7. **CDP-ის კოორდინატული click დაბლოკილია:** იგივე შეზღუდვა C-საც აქვს (§8 harness).

## 11. Carry (უცვლელი; `root-pre-push-review.md`, `publication-checkpoint.json`, დავალების §6.5)

- purchased loader middle-east-ს hardcode-ავს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead);
- instruction ფაილების portable path-ები;
- export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13). ამ რაუნდის WAV-ში 1802 sample FS-ზეა;
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ;
- round 6..16-ის uncommitted tree;
- საერთო `Modal.tsx`-ის focus gap (root/UI owner), `body`-ზე ფოკუსის შემთხვევის ჩათვლით;
- root GA consent-denied რეჟიმშიც აგზავნის `scroll`/`page_view`-ს;
- ორი უცხო agent ფაილი root-ის გადასაწყვეტია;
- `publication-checkpoint.json`-ის მოთხოვნები (library/stems/scrollbars, T12, საბოლოო commit/push).

**ამ რაუნდში არ მოწმდებოდა** (PASS არ არის):
- C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome);
- C-R12-01 (RF5-3);
- polish 14b/14c (round 17–18);
- 21 regression-debt ID;
- SRW-13..20, SRW-21 adapter, T12;
- Tech Lead-ის ხელით შემოწმებები: R11-P3m, R11-SB, R13-RM, R15-SB. მათ შორისაა 1280-ის cap ნამდვილი 10 px-იანი scrollbar-ით.
