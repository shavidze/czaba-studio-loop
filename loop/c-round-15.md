# C — Round 15-ის დამოუკიდებელი შემოწმება: C-R14-01 და C-R14-02 (D-29f)

თარიღი 2026-10-11 · შემმოწმებელი C · დავალება `current-task.md` (round 15) · A-ს ანგარიში `a-round-15.md`.

**მტკიცებულებები:** `c-round-15/` (`gates/`, `runs/`, `shots/`, `scripts/`, `guard/`).

**Browser:**
- gstack browse, state `c-browse.json`. ფაილი თავიდან არ არსებობდა, ამიტომ context ახალი იყო: `auth_user` null, cookie "".
- მისამართი `http://127.0.0.1:5173/studio-lab`; viewport-ები 1280×720 და 1440×900.
- Test media: `media/beeps-6s-vp9-opus.webm` (საკუთარი სინთეზური, 6.008 s). ვიდეოხაზზე OS-drop-ით ჩაიდო.

**რა არ გამიკეთებია:**
- source-ში არაფერი შემიცვლია;
- commit, push და deploy არ გამიკეთებია.

**Tree:** ბოლოს ზუსტად ისეთია, როგორც დასაწყისში (`gates/git-status-{start,end}.txt`) და A-ს end status-ის იდენტურია.

## 1. Verdict

**taskStatus: FAIL.** ერთადერთი მიზეზია R15-P3-ის სიტყვასიტყვითი sub-check: „inline `style` ატრიბუტი არ არის“. ✕-ისა და Esc-ის შემდეგ tree-ზე და listbox-ზე ცარიელი `style=""` რჩება (C-R15-01). A-მ ეს თავად მონიშნა „not ready“-ად და B-ის გადაწყვეტილება ითხოვა.

R15-P3-ის დანარჩენი sub-check-ები გავიდა. ესენია: padding, `scrollHeight`, ტექსტები, ◀ → ▶ და pending inset. ფუნქციურად ქცევა სწორია.

**ორივე ძირითადი ბაგი რეალურად გასწორდა:**
- **C-R14-01:** 1280/480-ზე მაუსით find → add მუშაობს. ოთხივე შემთხვევაში ყველა row მისაწვდომია.
- **C-R14-02:** Tab და Shift+Tab ყოველ ნაბიჯზე dialog-ში რჩება.

C-R14-01/02-ის დახურვა B-ის გადაწყვეტილებაა (`feature-status.md`).

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R15-P1 | **PASS** | `runs/p1-*.json`, `p1-1280-temp.*`, `f4-1280-288.txt` |
| R15-P2 | **PASS** | `runs/p2-1280-480.txt`, `p2-last-rows-1440-288.json`, `p2-reach-*.json`, `p2-keyboard-1280-480.txt` |
| R15-P3 | **FAIL** (მხოლოდ `style=""` sub-check; დანარჩენი გავიდა) | `runs/p3-1440-288.txt`, `p3-1280-480.txt`, `p1-1280-temp.txt` |
| R15-E | **PASS** | `runs/e-1440.txt`, `e-quick-1440.txt`, `e5-1440.txt`, `shots/export-focus-x-1440.png` |
| R15-U | **PASS** (Low შენიშვნით, C-R15-03) | `gates/vitest-*.txt`, `gates/guard-c15.txt` |
| R15-Doc | **PASS** | §7 |
| R13-F2 quick (1440/480-დან) | **PASS** | `runs/f2-1440-480.json`, `f2-arrows-resize-1440-480.txt` |
| R13-F3 quick | **PASS** | `runs/f3-1280-480.txt`, `f2-arrows-resize-1440-480.txt` (close) |
| R13-F4 quick | **PASS** (reduced motion მხოლოდ სიმულაციით) | `runs/f4-1280-288.txt`, `p1-1280-temp.txt` |
| R11A-1 quick | **PASS** | `runs/r11a1-1280.txt` |
| Dock quick | **PASS** | `runs/p1-1440-288.json`, `p1-1280-288.json` |
| RF7-P2 | **PASS** | sha უცვლელია, ტესტი 965-ში მწვანეა |
| G15-1 / G15-2 / G15-3 | **PASS** | `gates/` |

**ახალი ბაგები B-სთვის** (სამივე Low):
- **C-R15-01:** `style=""` რჩება ✕-ისა და Esc-ის შემდეგ (R15-P3, სიტყვასიტყვით).
- **C-R15-02:** placement-ის შემდეგ footer-ში არჩეული კლიპის ხაზი ჩნდება და body-ს 20 px-ით ამოკლებს. ყუთი body-დან გადის და preview-ის ზედა 12 px-ს ფარავს. Control არ იფარება. მექანიზმი round 14-შიც არსებობდა.
- **C-R15-03:** ტესტის სისუსტეა. Mutation, რომელიც Tab-ის handler-ს Enter-საც ამუშავებინებს, 116/116-ს არ ჩამოაგდებს.

## 2. Gates (C-მ ყველა თავად გაუშვა)

**G15-1:**
- 3 focused ფაილი: **116/116**;
- სრული vitest: **55 ფაილი, 965/965** (945 + 20). `sfx-library` flake არ განმეორდა;
- `tsc`: 0;
- Biome `app/lib/arrangement` + `app/components/arrangement`: 54 ფაილი, 0 შეცდომა;
- Biome `./app`: 0 შეცდომა, 218 warning (round 14-ის რაოდენობა);
- `npm run build`: exit 0.

**G15-2** (`gates/g2.txt`):
- `b-round-14-tree-sha256.txt`: 36 OK, 8 FAILED. FAILED მხოლოდ 8 owned ფაილია. 36 OK-ში შედის dock, `video-sync.ts`, `ArrangementLibraryPreview.tsx`, `Modal.tsx`, `render-budget.test.tsx` და `Header.tsx`;
- A-ს `owned-final-sha256.txt`: 9/9 OK;
- `a-round-15/bak/*.base.*` = B-ის hash-ები, 8/8;
- protected: 4/4 OK;
- `Header.tsx`: `git diff HEAD` ცარიელია; `cc1e531`-ის მიმართ +21/−0;
- აკრძალულ dir-ებში ცვლილება არ არის;
- instrumentation grep: 0;
- ორი უცხო agent ფაილი (`.claude/agents/frontend-architect.md`, `.codex/agents/frontend-architect.toml`) არ წამიკითხავს და არ შემიცვლია. გადაწყვეტილება root-ისაა.

**Diff-ის მიმოხილვა** (base backup-ების მიმართ):
- `panels.ts`: დაემატა ერთი `min()` term (`bodyHeight × 0.5 × 16/9`), `FLOATING_VIDEO_BODY_SHARE` და `floatingVideoLibraryInsetPx`.
- `ArrangementLibrary.tsx`: დაემატა prop და პირობითი `style` 2 ელემენტზე.
- `StudioWorkspace.tsx`: დაემატა import, 1 expression და 1 prop.
- `ArrangementExportDialog.tsx`:
  - content ref, რომელიც გადაეცემა `Modal`-ის `ref`-ს;
  - native keydown listener effect `[isOpen]`-ზე, cleanup-ით;
  - wrapper-ის `onKeyDown` მოხსნილია;
  - effect B-ის no-steal სია ახლა content-იდან მოდის.
- Document listener არ არის, `stopPropagation` არ არის.
- `Modal.tsx`-ის portal სინქრონულია, ამიტომ ref effect-ის დროს უკვე არსებობს.

**G15-3** (ახალი context, credentials-ის გარეშე):
- პირდაპირი `/studio-lab` (`gates/network-anon-direct.txt`, `anon-direct.json`) და header-ის ხილულ „Studio LabDemo“ ბმულზე რეალური click (`network-anon-header.txt`, `anon-header.json`):
  - `/api/studio-token`, `/api/recording-*`, `/api/download` და R2 host-ის მოთხოვნა არის **0**;
  - media მოდის მხოლოდ `/middle-east.mp3`-დან და `/videos/hero/hero-music.mp3`-დან;
  - `auth_user` null-ია, cookie "".
- სესიის fetch hook: `Authorization` 0, binary upload (`bodySends`) 0. `grep Authorization` arrangement-ის source-ში: 0.
- `curl` (`gates/curl-token.txt`):
  - anonymous → **401** `Please sign in to access Studio.`;
  - fake Bearer → 500 `Unable to prepare Studio access`, token-ის გარეშე. Backend 5199 გათიშულია (000).
- `/studio/middle-east` → „Sign in required“. Workspace და media არ ჩაიტვირთა (`anon-studio-me.json`, `shots/anon-studio-middle-east.png`).
- **Premium auth bypass არ არის.**
- ცნობილი და დაშვებული: root-ის `GET localhost:5199/api/cart` (console-ის ერთადერთი error, `runs/console-errors.txt`) და GA consent-denied.

## 3. R15-P1: placement (C-ის rect-ები და D-29f-ის ფორმულა, `scripts/c15.js`)

⤢ ყველგან რეალური `$B click`-ით დავაჭირე და 0.9 s-ის შემდეგ გავზომე. Expected:
- width = max(160, min(640, lib − 16, (h − 16)·16/9, (h/2)·16/9));
- top = max(body.t + 8, body.b − 8 − h);
- left = lib.l + 8.

| შემთხვევა | aside l,w | body t–b (h) | box l,t,w×h | Δ (მაქს.) | 16:9 | h ≤ body/2+1 | body-ში | hit ◀/search/sep/preview | inset (pb = spb) |
|---|---|---|---|---|---|---|---|---|---|
| 1440/288 | 0,288 | 233–684 (451) | 8, 523, 272×153 | 0 | 1.7778 | 153 ≤ 226.5 | კი | 4/4 | 169 px |
| 1440/480 (ArrowRight ×14) | 0,480 | 217–700 (483) | 8, 450.5, 429.33×241.48 | 0.02 | 1.7779 | 241.48 ≤ 242.5 | კი | 4/4 | 257.5 px |
| 1280/288 | 0,288 | 271–504 (233) | 8, 379.5, 207.11×116.48 | 0.02 | 1.7781 | 116.48 ≤ 117.5 | კი | 4/4 | 132.5 px |
| 1280/480 (ArrowRight ×14) | 0,480 | 255–520 (265) | 8, 379.5, 235.55×132.48 | 0.02 | 1.778 | 132.48 ≤ 133.5 | კი | 4/4 | 148.5 px |
| 1280/288, დროებითი გახსნა | 0,288 | 271–504 | 8, 379.5, 207.11×116.48 | 0.02 | 1.7781 | კი | კი | 4/4 | 132.5 px |

- ყველა შემთხვევაში box არის `position: fixed`, z 40. Header, search, preview და separator-ს არ კვეთს. B-ის ცხრილის ოთხივე მნიშვნელობას ემთხვევა.
- **160 px-იან მინიმუმს არცერთი შემთხვევა არ აღწევს.**
- **რეალური click ◀-ზე გაფართოებული მდგომარეობიდან, ხუთივე შემთხვევაში:**
  - 1440/288 (`p1-1440-288.json`): rail 40, box 1268,92 160×90 `relative`;
  - 1440/480 (`p1-1440-480-collapse.json`): იგივე;
  - 1280/288, ჩვეულებრივი გახსნა (`p1-1280-288-collapse.json`): rail 40, box 1108,130 160×90 `relative`;
  - 1280/480 (`p3-1280-480.txt`, C-ნაბიჯი): rail 40;
  - 1280/288, დროებითი გახსნა: ✕-ის გზა (ქვემოთ).
  - ტექსტი სიტყვასიტყვითაა: `ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.`
- **⤢-მდე და ⤢-ის შემდეგ უცვლელია:**
  - placeholder 160×90;
  - dock 1152×107 (1440/288), 960×107 (1440/480), 992×107 (1280/288), 800×107 (1280/480); Δ 0;
  - lane-ები 81×4;
  - detail 144 (1440) და 36 (1280);
  - expand-ის ტექსტები სიტყვასიტყვითაა (ჩვეულებრივი და დროებითი გახსნის);
  - dock-ის counter-ები 0/0/0/0.
- **დროებითი გახსნა 1280/288-ზე** (`runs/p1-1280-temp.txt`, `f4-1280-288.txt`):
  - box placement-ს ელოდება 0–150 ms-ში (aside 40 → 268). ამ დროს inset 0-ია: `style`-ის ატრიბუტი არ არის, padding 4 px;
  - aside-ის width-ის `transitionend` 308 ms-ზე მოხდა. Box 327 ms-ზე დაიდო, D-29f-ის პოზიციაზე, და inset 132.5 გახდა;
  - ✕ library-ს ხელახლა კეცავს. ტექსტი: `ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.`

## 4. R15-P2: row-ების მისაწვდომობა

1. **1280×720, library 480, round-14-ის ზუსტი repro** (`runs/p2-1280-480.txt`):
   - რეალური click search-ზე, `type soft` → 1 row („Soft impact“, 148,259 317×47). `elementFromPoint` ცენტრში row-ს აბრუნებს;
   - `$B click '[role=option]'` → `Clicked`. „Not interactable“ შეცდომა **აღარ არის**;
   - რეალური Enter → კლიპები 1 → 2, status `„Soft impact“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.`;
   - რეალური Undo click → 1 კლიპი, Undo-ს სათაური წინა ჩანაწერია (ვიდეოს დამატება). ე.ი. Undo ჩანაწერი ზუსტად ერთია. Redo კლიპს აღადგენს;
   - box 8,379.5-ზე დარჩა, `expanded` true. Counter-ები 0.
   - Shot: `shots/expanded-1280-480-soft.png`.
2. **1440×900, library 288, ფილტრის გარეშე, list მაქსიმალურ scroll-ზე** (`runs/p2-last-rows-1440-288.json`, `shots/library-rows-scrolled-1440-288.png`):
   - scrollTop 351, `scrollHeight` 802, `clientHeight` 451;
   - „პადი“ 354.25–434.5 → row, box არა;
   - „მელოდია“ 434.5–514.75 → row, box არა (box-ის top 523).
3. **ოთხივე შემთხვევა, ფილტრის გარეშე.** თითო row-ზე მხოლოდ საკუთარი container-ის scroll-ი 4 px-იანი ნაბიჯით; `elementFromPoint` ცენტრში (`runs/p2-reach-*.json`):

| შემთხვევა | list: მისაწვდომი | tree: მისაწვდომი | list sh/ch | tree sh/ch | padding-bottom = scroll-padding-bottom (ორივე) | box h + 16 |
|---|---|---|---|---|---|---|
| 1440/288 | 9/9 | 9/9 | 802/451 | 451/451 | 169px | 169.0 |
| 1440/480 | 9/9 | 9/9 | 769/483 | 483/483 | 257.5px | 257.48 |
| 1280/288 | 9/9 | 9/9 | 765/233 | 358/233 | 132.5px | 132.48 |
| 1280/480 | 9/9 | 9/9 | 660/265 | 374/265 | 148.5px | 148.48 |

   1440-ზე tree overflow-ს არ აკეთებს, და მისი არცერთი row box-ის ქვეშ არ არის.
4. **კლავიატურა, 1280/480** (`runs/p2-keyboard-1280-480.txt`):
   - პირველ option-ზე `.focus()`, შემდეგ რეალური ArrowDown ×9;
   - ყოველი ფოკუსირებული row-ის ცენტრი (282.6–348.1) და ქვედა კიდე (≤ 371.8) box-ის top-ზე (379.5) მაღლაა. `elementFromPoint` row-ს აბრუნებს. ბოლო press ბოლო row-ზე რჩება;
   - რეალური Enter „მელოდია“-ზე → კლიპები 2 → 3, ერთი Undo: `Undo: დამატება — ღამის პულსი · მელოდია`.
   - ახალ სესიაში ვიმეორე და Undo-ს რეალური click დავამატე (`runs/p2-keyboard-undo-1280-480.txt`). კლიპები 1 → 2 → 1, Undo-ს სათაური ვიდეოს დამატებას დაუბრუნდა, box არ განძრეულა. ე.ი. Undo ჩანაწერი ზუსტად ერთია. პირველ მცდელობაში helper არ ჩაიტვირთა და state ვერ ჩაიწერა; ის ფაილშია, მონიშნულად.

**C-R15-02 (Low, ახალი, round 14-შიც არსებობდა)** (`runs/selection-footer-1280-480.txt`, `shots/selection-footer-box-over-preview-1280-480.png`).

Placement მხოლოდ expand-ზე და window resize-ზე ითვლება. Footer-ში არჩეული კლიპის ხაზი (+20 px) workspace-ის სიმაღლეს ამცირებს:

| მომენტი | aside | body | box | box-ის ქვედა კიდე | მდგომარეობა |
|---|---|---|---|---|---|
| expand, არჩევანის გარეშე | 122–671 | 255–520 | 8,379.5 235.55×132.48 | 512 | body-ში |
| find → add (კლიპი არჩეულია) | 122–651 | 255–500 | უცვლელი | 512 | preview-ის ზედა 12 px-ს ფარავს (`insideBody` false, `xPreview` true) |

- 72 sample წერტილზე `elementFromPoint` box-ს აბრუნებს.
- **რას არ აზიანებს:**
  - preview-ის control-ები (wave 541–573, toggle 605–639) არ იფარება;
  - row-ები ისევ მისაწვდომია: focus-ის ქვედა საზღვარი 500 − 148.5 = 351.5 < 379.5.
- **Acceptance-თან მიმართება:**
  - R15-P1 გავიდა, როგორც დაწერილია: body-ში ყოფნა placement-ის მომენტში გაიზომა, არჩეული კლიპის გარეშე;
  - R15-P2.1 გავიდა, როგორც დაწერილია: box არ განძრეულა და არ დაბრუნებულა;
  - თუმცა სწორედ R15-P2.1-ის flow 1280/480-ზე იწვევს ამ გადაფარვას. Acceptance-ში კრიტერიუმი, რომელიც placement-ის შემდეგ body-ს ცვლილებას ფარავს, არ არის. ეს ხარვეზი B-მ უნდა გადაწყვიტოს.
- **რატომ Low:** ეს მხოლოდ კოსმეტიკური დარღვევაა წესისა „box body-ს შიგნითაა“. B-მ უნდა გადაწყვიტოს, საჭიროა თუ არა body-ს ცვლილებაზე re-place.

## 5. R15-P3: inset-ის გასუფთავება (`runs/p3-1440-288.txt`, `p3-1280-480.txt`)

**Pre-expand მნიშვნელობები:**
- `style` ატრიბუტი არ არის, padding-bottom 4 px;
- 1440/288: list sh 637, nav sh 451;
- 1280/480 (არჩეული კლიპით): body 245, list sh 516, nav sh 245.

| გზა | nav / list `style` | computed padding-bottom | scroll-padding-bottom | scrollHeight (list/nav) | status |
|---|---|---|---|---|---|
| ✕ (1440/288) | **`""` / `""`** | 4px | auto | 637/451 = pre | `ვიდეო პატარა ხედს დაუბრუნდა.` |
| Esc (1440/288) | **`""` / `""`** | 4px | auto | 637/451 = pre | იგივე |
| ◀ → ▶ (1440/288) | ატრიბუტი არ არის | 4px | auto | 637/451 = pre | ◀-ის ტექსტი |
| ✕ / Esc / ◀ → ▶ (1280/480) | `""` / `""` / არ არის | 4px | auto | 516/245 = pre | იგივე |

- Placement-მდე (დროებითი გახსნა) inset 0-ია (§3).
- **C-R15-01 (Low):** ✕-ისა და Esc-ის შემდეგ ცარიელი `style=""` რჩება. ეს სიტყვასიტყვით ეწინააღმდეგება წესს „no inline style attribute“. ფუნქციური შედეგი არ აქვს.
- A-ს არგუმენტი (React ცარიელ ატრიბუტს არ შლის; dock-ის box-ზე `style=""` R13-F3-ში მისაღებად ითვლება) სწორია. მიუხედავად ამისა, კრიტერიუმი B-მა დაწერა, ამიტომ PASS-ს ვერ ჩავწერ. B ან კრიტერიუმს შეცვლის, ან მექანიზმს დაასახელებს.

## 6. R15-E: Export-ის ფოკუსი X-ით (1440×900, რეალური კლავიშები, არაცარიელი პროექტი: ვიდეო + Soft impact)

1. **C-R14-02-ის ზუსტი repro** (`runs/e-1440.txt`):
   - რეალური click Export-ზე → `დახურვა`;
   - `.focus()` X-ზე → `Close`;
   - Shift+Tab → `WAV-ის ექსპორტი`; Shift+Tab → `დახურვა`. ყოველ ნაბიჯზე `inDialog` true;
   - Enter → dialog დაიხურა, blobs 0 (render არ დაწყებულა). Detail 144 → 144, pos 0, `Play`, კლიპები 2. ფოკუსი Export-ს დაუბრუნდა.
   - Shot: `shots/export-focus-x-1440.png`.
2. **სრული ციკლი:**
   - Tab ×8: WAV → X → radio → დახურვა → WAV → X → radio → დახურვა;
   - Shift+Tab ×8: radio → X → WAV → დახურვა → radio → X → WAV → დახურვა;
   - 16-ვე ნაბიჯზე ფოკუსი dialog-შია. Disabled radio-ები გამოტოვებულია.
3. **X-ის გზები:**
   - X → Tab → radio;
   - Shift+Tab → X;
   - Enter X-ზე → dialog დაიხურა, ფოკუსი Export-ზეა (connected opener).
4. **R14-E quick, ვიდეო გაფართოებულია** (`runs/e-quick-1440.txt`):
   - **E1:** click-ით გახსნა → `დახურვა`; Enter ხურავს. ვიდეო გაფართოებული და floating რჩება, ფოკუსი Export-ზეა.
   - **E3:**
     - Space radio-ზე → dialog ღია რჩება;
     - Space `დახურვა`-ზე → dialog იხურება;
     - ორივე შემთხვევაში pos 0, `Play`, render არ არის.
   - **E4:** Esc ხურავს. ვიდეო გაფართოებული რჩება, ფოკუსი Export-ს უბრუნდება.
   - **E5** (`runs/e5-1440.txt`): Export-ზე `.focus()`, რეალური Enter → `დახურვა`; Tab → WAV; Enter. შედეგი:
     - RIFF/WAVE, format 1 (PCM), 2 ch, 48000 Hz, 24-bit;
     - data 1 730 304 B = **288 384 frame = 6.008 s**. ეს dialog-ის `00:06.008`-ს და ვიდეოს ბოლოს ემთხვევა.
     - NaN 0, DC ≈ −7e-6.
     - RMS: Soft impact 0–0.5 s −9.84 dBFS; 1–6 s ყოველ წამში −19.0 dBFS (ვიდეოს beep-ები); 6–6.008 სიჩუმეა. Round 14-ის WAV-ის იდენტურია.
     - Peak 1.0, 1018 sample full scale-ზეა. ეს ცნობილი R13-M4/SRW-13 hard-clip-ია (carry).
5. **ფოკუსი render-ის დროს (sample-ით გაზომილი):**
   - 656 sample 5 ms-იანი ინტერვალით: 0 dialog-ის გარეთ;
   - 169–217 ms-ზე ფოკუსი wrapper-ზე იყო, 223 ms-ზე `დახურვა`-ზე.

## 7. R15-U და R15-Doc

**R15-U.** ტესტები ხელახლა გავუშვი: 116/116 და 965/965. Named exception-ები და ახალი ტესტები A-ს §6-ს ემთხვევა.

**C-ის guard** (`gates/guard-c15.txt`):
- ასლი `c-round-15/guard/`, `node_modules` junction-ით; source-ს არ ვეხები;
- ყოველი mutation-ის შემდეგ `cmp` source-თან OK;
- ბოლოს 116/116.

| Mutation | ჩავარდა |
|---|---|
| G1: body-share term მოხსნილია | 6 (2 named exception, 3 D-29f geometry, 160-ის მინიმუმი) |
| G2: `ArrangementLibrary`-ში `bottomInsetPx > 0` → `false` | 6 (inset-ის ყველა component ტესტი) |
| G3: `StudioWorkspace` inset-ად 0-ს გადასცემს | 6 (იგივე) |
| G4: listener და სია wrapper-ზეა (content-ის ნაცვლად) | 6 (wrap ×2, mid-render, wrapper Tab, X-ის ციკლი, C-R14-02 repro) |
| G5: effect B-ის no-steal check wrapper-ის სიით | 1 („does not steal focus from the X …“) |
| **G6: Tab handler Enter-საც ამუშავებს** | **0 (116/116)** → C-R15-03 |

**C-R15-03 (Low, ტესტის სისუსტე):**
- „only Tab“ ტესტი Enter-ს მხოლოდ X-ზე (პირველ control-ზე) აჭერს, სადაც mutated handler არაფერს აკეთებს;
- ბოლო control-ზე (WAV) Enter-ის გადაჭერა (preventDefault + ფოკუსი X-ზე) ტესტებით არ დაიჭირება;
- რეალურ browser-ში Enter WAV-ზე ახლა მუშაობს (E5). ეს მხოლოდ regression-ის დაცვის ხარვეზია;
- R15-U-ს ოთხივე სავალდებულო guard ჩემითაც დადასტურდა. ამიტომ R15-U PASS-ია, ამ შენიშვნით.

**R15-Doc:**
- **Doc 023:** diff მხოლოდ სტატუსის ხაზსა და TODO-შია. ჩამოთვლილია C round 14 PASS, C-R13-01..03 დახურვა, C-R14-01 (Medium) და C-R14-02 (Low) → round 15 (D-29f). „Resolved“-ის ფორმულირება არ არის.
- **Doc 024:**
  - ქართულადაა და TEMPLATE-ის სექციები აქვს;
  - სტატუსი „In Progress — pending C“-ა;
  - `style=""`-ის deviation და ცნობილი ზღვრები (ფოკუსი `body`-ზე, 160-ის მინიმუმი) ჩაწერილია;
  - A-ს browser-ის შედეგი მონიშნულია, როგორც „C-ის verdict არ არის“;
  - გადაუმოწმებელი PASS არ არის.

## 8. მიმდებარე რეგრესიები

**R13-F2 quick, 1440/480-ის ახალი placement-იდან (8,450.5)** (`runs/f2-1440-480.json`, `f2-arrows-resize-1440-480.txt`):
- drag +200/+100 → 208,551 (start 8,451 rounded);
- ⠿ რეალური ArrowRight ×3 → +48 (260 → 308). pos 0, Undo უცვლელია;
- ქვედა-მარჯვენა კუთხე 1010.66,658.5 → resize 1280×720 → 850.66,478.5 (clamp);
- მეორე pointer clip-ზე drag-ის დროს იგნორირდება: clip უცვლელია, Undo უცვლელია;
- history-ში ჩანაწერი არ დაემატა;
- drag-ის, ისრებისა და resize-ის დროს inset 257.5 px უცვლელი რჩება;
- ✕ → 160×90, `style=""`, same nodes.

**R13-F3 quick** (`runs/f3-1280-480.txt`):
- placeholder და Esc → 160×90 dock-ში, `style=""`, `isSameNode` true. ✕ იგივეა (F2-ის ბოლოს);
- Esc ძებნის პრიორიტეტით:
  - Esc1 query-ს ასუფთავებს და ვიდეო გაფართოებული რჩება;
  - Esc2 ფოკუსირებულ ცარიელ search-ში ვიდეოს გაფართოებულს ტოვებს;
  - blur-ის შემდეგ Esc ვიდეოს აბრუნებს და დაბრუნების ტექსტს წერს.
- Round 14-ის იდენტურია.

**R13-F4 quick** (`runs/f4-1280-288.txt`):
- დროებითი გახსნა: box დაიდო width-ის `transitionend`-იდან 19 ms-ში, D-29f-ის პოზიციაზე (Δ ≤ 0.02);
- reduced-motion სიმულაცია: inline `transition-property: none`, computed `none | 0.3s`. Box დაიდო 25 ms-ზე, მეორე frame-ზე;
- ✕ library-ს ხელახლა კეცავს და re-collapse ტექსტს წერს;
- ნამდვილი `prefers-reduced-motion` → Tech Lead.

**R11A-1 quick** (`runs/r11a1-1280.txt`):
- ▶/◀ მუშაობს, rail 40;
- separator: ArrowLeft ×3 → 288, ArrowRight ×16 → 480, უკან → 288;
- preview:
  - output tap-ის peak 0.3449 („■ შეჩერება“);
  - collapse-ის შემდეგ **0**;
  - ხელახლა გახსნისას „▶ მოუსმინე“.

**Dock quick:**
- 1440: 1152×107; 1280: 992×107; ვიდეო 160×90;
- ერთი `<video>` ჩანს, ორივე muted.

**Sync:** run-ები არ გამიშვია (§6). P1, P2 და E-ის დროს dock-ის counter-ები (swaps/fallbacks/hardSeeks/escalations) 0 დარჩა. Stall და hard seek არ შემინიშნავს.

**RF7-P2:** `render-budget.test.tsx`-ის sha უცვლელია და ტესტი 965-ში მწვანეა.

**Harness H1–H3:**
- კლავიშები რეალური `$B press`-ით;
- synthetic pointer-ები `buttons: 1`-ით;
- დასახელებული click-ები რეალური `$B click`-ით;
- `data-c15` marker-ები მხოლოდ browser-ში, `$B js`-ით დაისვა (Undo, Redo, Export, header link).

**ჩემი ერთი არავალიდური გაზომვა:** P3-ის პირველი მცდელობა 1280/480-ზე უკვე გაფართოებული მდგომარეობიდან დაიწყო. ის `p3-1280-480-attempt1-started-expanded.txt`-ში ინახება და ხელახლა გაეშვა.

## 9. A-ს deviation-ები (C-ის აზრი)

1. **`style=""` ✕-ისა და Esc-ის შემდეგ:** დადასტურდა → C-R15-01. ქცევის სიტყვასიტყვითი ფორმა B-მ უნდა გადაწყვიტოს.
2. **Inset-ის ტესტები `floating-video.test.tsx`-შია:** დასაშვებია.
3. **Helper-ის სახელი:** დავალებას ემთხვევა.
4. **E3 Space WAV-ზე:** C-მ round 14-ის გზა გამოიყენა (radio და `დახურვა`). ორივემ გაიარა.
5. **E4 ხელახლა გაშვება:** C-ის run პირდაპირ გავიდა.
6. **Mechanism probe:** C-მ P2.4 რეალურ კოდზე გაზომა და გავიდა.

## 10. B-სთვის / carry

**ახალი ბაგები:**
- C-R15-01 (Low): R15-P3, `style=""`;
- C-R15-02 (Low): footer-ის არჩეული კლიპის ხაზი body-ს ამოკლებს expand-ის შემდეგ, ყუთი preview-ის 12 px-ს ფარავს;
- C-R15-03 (Low): „only Tab“ ტესტის სისუსტე.

**Carry (უცვლელი; `root-pre-push-review.md`, `publication-checkpoint.json` და დავალების §6.5):**
- purchased loader middle-east-ს hardcode-ავს (SRW-21);
- Lenis `/studio/*`-ზე (Tech Lead);
- instruction ფაილების portable path-ები;
- export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13). ამ რაუნდის WAV-შიც 1018 sample FS-ზეა;
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ;
- round 6..15-ის uncommitted tree;
- საერთო `Modal.tsx`-ის focus gap (root/UI owner). ამაში შედის `body`-ზე ფოკუსის შემთხვევა, რომელიც doc 024-ში წერია; C-ს ცალკე არ შეუმოწმებია;
- root GA consent-denied რეჟიმშიც აგზავნის `scroll`-ს;
- ორი უცხო agent ფაილი root-ის გადასაწყვეტია;
- `publication-checkpoint.json`-ის მოთხოვნები (library/stems/scrollbars, T12, საბოლოო commit/push) ძალაში რჩება.

**ამ რაუნდში არ მოწმდებოდა** (PASS არ არის):
- C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome);
- C-R12-01 (RF5-3);
- polish 16–18;
- 21 regression-debt ID;
- SRW-13..20, SRW-21 adapter, T12;
- Tech Lead-ის R11-P3m, R11-SB და ნამდვილი reduced motion.
