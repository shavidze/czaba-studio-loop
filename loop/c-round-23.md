# C — Round 23 შემოწმება: lane header-ის a11y შესწორებები, ნაწილი 1 (`ArrangementLane.tsx`, D-29n)

შემმოწმებელი: C (Claude Opus 5.5) · თარიღი: 2026-10-11 · დავალება: `current-task.md` (round 23) · A-ს ანგარიში: `a-round-23.md`
Browser: gstack browse, state `c-browse.json`, სერვერი `http://127.0.0.1:5173` (არ გამიშვია და არ გამიჩერებია). Source-ში ცვლილება 0, commit 0. ყველა ფაილი `c-round-23/`-შია (`runs/`, `shots/`, `gates/`, `scripts/`, `mut/`, `checkpoint.md`).

## 0. ვერდიქტი — **PASS** + ერთი ახალი ბაგი (C-R23-01, medium, round-ის scope-ის გარეთ)

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R23-F1 | **PASS** | `runs/f1-1440.txt`, `runs/f1-fold-1440.txt` |
| R23-F2 (round 16-ის რეგრესია) | **PASS** | `runs/f2-1440.txt` |
| R23-N (1440×900 და 1280×720) | **PASS** | `runs/n-*.txt`, `shots/n-*.png` |
| R23-R | **PASS** | `runs/r-drops-1440.txt`, `runs/r-taborder-ms-1440.txt`, `runs/n-video-tight-setup-1440.txt` |
| R23-S | **PASS** | `gates/lane-snapshot-*.diff`, `gates/test-snapshot-*.diff` |
| R23-U | **PASS** (ჩემი mutation, scratch copy `store/`-ის გარეთ) | `runs/r23u-*.txt`, `runs/r23u-mut*.diff` |
| R23-Doc | **PASS** | doc 029 |
| G23-1 | **PASS** | `gates/tsc.txt`, `vitest-track-layout.txt`, `vitest-all.txt`, `biome-app.txt`, `biome-owned.txt`, `build.txt` |
| G23-2 | **PASS** (დასაწყისი და ბოლო) | `gates/*-start.*`, `gates/*-end.*` |
| G23-3 | **PASS**: premium auth bypass არ არის | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| Real export sanity (`lay11`) | **გაიარა** (hard-clip: ცნობილი R13-M4) | `runs/export-sanity.txt` |
| **C-R23-01** (ახალი) | **ბაგი, medium**: `/studio-lab`-ის SSR HTML-ში NUL byte-ებია, music-ის სახელის ღილაკის `aria-label`-ში 2 × U+FFFD რჩება | `runs/ssr-1..3.html`, `runs/hydration-console.txt`, §3 |

ყველა რიცხვი ჩემი გაზომვაა. A-ს ციფრები მხოლოდ შედარებისთვის გამოვიყენე.

## 1. Gates, R23-S, R23-U

### 1.1 G23-1 (`gates/g1.sh`, ბრაუზერის run-ებამდე)
- `tsc --noEmit`: exit 0, output ცარიელი.
- `vitest run track-layout.test.tsx`: **33/33**.
- `vitest run`: **57 ფაილი, 1007/1007**, exit 0. 1005 + **2 ახალი `it`** (≥ 2 ✓). `sfx-library` flake არ განმეორდა.
- `biome check ./app` (read-only): 323 ფაილი, 0 error, **218 warning + 1 info**. Round 22-შიც ზუსტად ეს იყო (`c-round-22/gates/biome-app.txt`), ე.ი. რაოდენობა უცვლელია.
- `biome check` ორ owned ფაილზე: „Checked 2 files … No fixes applied“, 0 diagnostic. l.665-ზე unused-suppression არ არის.
- `npm run build`: exit 0 („✓ built in 2.21s“).

### 1.2 G23-2 (`gates/g2.sh start|end`)
- HEAD `c5ed47b`. `git status --short`: **46 ხაზი**. `c-round-22/gates/git-status-end.txt`-თან სხვაობა მხოლოდ `?? docs/implementation/2026/quarter-IV/029-studio-lab-lane-header-a11y.md`-ია. დასაწყისისა და ბოლოს status იდენტურია.
- `sha256sum -c b-round-22-tree-sha256.txt`: **50 OK** (დასაწყისი და ბოლო).
- Protected: 4/4 OK. `Header.tsx`: HEAD-თან diff ცარიელია, `cc1e531`-თან +21/−0.
- აკრძალული გზები (`app/styles`, `root.tsx`, `routes/`, `animations`, `ui`, `layout`, `public`, `package*.json`, `studio-lab-demo.ts`): 0 ხაზი.
- 3 owned ფაილის sha დასაწყისში და ბოლოს ერთნაირია (`ArrangementLane.tsx` `cdaf07f4…776e`, test `fba42d8a…b325`, doc `38414675…cefe`).

### 1.3 R23-S
`diff -u b-round-22-snapshots/ArrangementLane.tsx` (sha `5b427e3e…`) ცოცხალ ფაილთან:
- `useId,` react-ის import-ში;
- `const laneBodyId = useId();`;
- `aria-controls={laneBodyId}` fold ღილაკზე;
- `focus-visible:ring-inset` სახელის ღილაკზე, `ring-2`-ის შემდეგ;
- `id={laneBodyId}` lane body-ზე (`ref={laneBodyRef}`-ის შემდეგ);
- l.665-ის `biome-ignore` მიზეზი, სიტყვასიტყვით ArrangementDetailPanel l.620-დან. Rule-ის სახელი იგივეა.

სულ 6 დამატებული და 2 წაშლილი ხაზია, მეტი არაფერი. Test-ის diff (`426586b3…`-თან): **0 წაშლილი, 59 დამატებული**. ეს მხოლოდ 2 ახალი `it` ბლოკია ბოლო describe-ში.

### 1.4 R23-U
- §2.4-ის შემთხვევები არსებობს და მწვანეა. R23-F1 ამოწმებს არაცარიელ, უნიკალურ, resolve-ებად id-ს; target-ი იმავე row-შია, header-ის გარეთ, `=== header.nextElementSibling`; შეიცავს clip-ებს; fold/unfold-ის შემდეგ იგივეა. R23-N ამოწმებს `ring-2`, `ring-inset` და `ring-brand` კლასებს დაკეცილ და გაშლილ music/video ხაზზე.
- A-ს red-first ფაილიდან დავადასტურე (`a-round-23/red-first.txt`): **2 failed | 31 passed**, R23-F1-ზე `expected '' not to be ''`, R23-N-ზე `to include 'focus-visible:ring-inset'`.
- **ჩემი mutation:** მთელი `store/app` დავაკოპირე `c-round-23/mut/app`-ში (`store/`-ის გარეთ). `node_modules` დროებითი junction-ით მივაბი და ბოლოს მოვხსენი. საკუთარი `vitest.config.mts`-ით `~` alias copy-ზე მიუთითებს.
  - Control (უცვლელი copy): **33/33**.
  - Mut A, `aria-controls={laneBodyId}` წაშლილი: **1 failed** (R23-F1, `expected '' not to be ''`) / 32 passed.
  - Mut B, `focus-visible:ring-inset` მოხსნილი **მხოლოდ** სახელის ღილაკიდან (fold-ს რჩება, `runs/r23u-mutB.diff`): **1 failed** (R23-N) / 32 passed.
  - ბოლოს copy-ის sha = store-ის sha `cdaf07f4…`; store-ის ფაილს არ შევხებივარ.
  - **არავალიდური:** პირველი control run 33/33 ჩავარდა `React is not defined`-ით. ეს ჩემი scratch config-ის შეცდომა იყო (JSX runtime). `esbuild.jsx='automatic'`-ით გავასწორე და ყველაფერი თავიდან გავუშვი.

## 2. ბრაუზერის run-ები

**Setup.** `c-round-23/setup.sh` (round 21-ის setup + `c-round-23/b.sh`), შემდეგ `lay11`.
- Clip table (`runs/lay11-1440.txt`): video 0–6.008 (`beeps-6s-vp9-opus.webm`), music 0–16 (`სრული მიქსი`), stems 2–18 (`პულსი`), SFX 4–6 (`Soft impact`).
- ყველა track: volume 1, mute/solo false. `auth_user` null.
- რეალური click = `$B click` ელემენტის ცენტრზე (selector-ისთვის დროებითი `data-c23*` attribute). Keys = რეალური `$B press`.

### 2.1 R23-F1 (1440×900)
| Lane | `aria-controls` | resolve | row-ში | header-ში | `= header.nextElementSibling` | clips row-ში / target-ში |
|---|---|---|---|---|---|---|
| video | `:R1ajmr5:` | DIV (`arrangement-video-dropzone`) | ✓ | ✗ | ✓ | 1 / 1 |
| music | `:R2ajmr5:` | DIV | ✓ | ✗ | ✓ | 1 / 1 |
| stems | `:R3ajmr5:` | DIV | ✓ | ✗ | ✓ | 1 / 1 |
| sfx | `:R4ajmr5:` | DIV | ✓ | ✗ | ✓ | 1 / 1 |

- 4 მნიშვნელობა უნიკალურია. თითო id DOM-ში ერთხელ გვხვდება.
- რეალური click fold-ზე (music, შემდეგ video): `aria-expanded="false"`, row **36**. იგივე id იმავე row-ში resolve-დება. მეორე click: `true`, row **81** (წინა სიმაღლე). id ისევ resolve-დება.
- **Space** ფოკუსირებულ SFX fold-ზე: 81 → 36, მეორე Space → 81. Transport: `playing:false`, `pos:0`, ღილაკი `Play`. Undo უცვლელია, ე.ი. fold history-ში არ იწერება.
- SSR HTML-ში `aria-controls=":R3jmr5:"` ორჯერ ჩანს. ეს detail panel-ის არსებული pattern-ია (ორი control ერთ შიგთავსზე) და არა დუბლირებული id.

### 2.2 R23-F2 (`runs/f2-1440.txt`)
- Round 16-ის harness: synthetic pointerdown stems clip-ის header-ზე + 4 move, release-ის გარეშე (`gesture:true`). CDP `Input.dispatchMouseEvent`-ს კრძალავს.
- **Space** ფოკუსირებულ music fold-ზე drag-ის დროს: row 81, `aria-expanded="true"`. Status ზუსტად `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`. Release.
- **ჩემი შეცდომა:** release-ის შემდეგ Ctrl+Z დავაჭირე, რადგან ვფიქრობდი, რომ drag commit-დებოდა. ის არ commit-ებულა (stems [2,16] უცვლელი), ამიტომ Ctrl+Z-მა SFX-ის დამატება გააუქმა. Ctrl+Shift+Z-ით აღვადგინე, 4 clip ისევ ადგილზეა.
- **რეალური `$B click`** fold-ზე მეორე held drag-ის დროს: row 81, `aria-expanded` true, status იგივე ტექსტია.
- Release-ის შემდეგ (და ზემოთ აღწერილი redo-ს შემდეგ) **ერთი რეალური click** → row 36, `false`. მეორე click → 81.

### 2.3 R23-N — focus ring-ის rect-ები (`runs/n-*.txt`, `shots/n-*.png`)
Fold ღილაკზე focus, შემდეგ **რეალური Tab** სახელის ღილაკზე, შემდეგ Shift+Tab უკან fold-ზე. Video ხაზი 52-მდე დავიყვანე რეალური ↑ დაჭერებით ფოკუსირებულ handle-ზე: 80 → 72 → 64 → 56 → 52 (clamp, row 53). ↓ = +8 (52 → 60).

| Viewport | Lane | `:focus-visible` | name `box-shadow` | name rect (t/b) | header rect (t/b) | top inset | fold `box-shadow` |
|---|---|---|---|---|---|---|---|
| 1440×900 | music folded (36) | ✓ | `rgb(18,217,200) 0 0 0 2px inset` | 320.5 / 340.5 | 316 / 351 | 4.5 | inset ✓ |
| 1440×900 | video tight (52) | ✓ | inset ✓ | 235 / 255 | 235 / 287 | **0** | inset ✓ |
| 1280×720 | video tight (52) | ✓ | inset ✓ | 273 / 293 | 273 / 325 | **0** | inset ✓ |
| 1280×720 | music folded (36) | ✓ | inset ✓ | 330.5 / 350.5 | 326 / 361 | 4.5 | inset ✓ |

- `document.activeElement` = სახელის ღილაკი (`{name} — აქტიური ხაზის არჩევა`).
- ყველაზე ახლო clipping ancestor არის header (`overflow-hidden`, `pt-0`). ღილაკი მის შიგნითაა, ხოლო inset ring ღილაკის შიგნით იხატება.
- Tight video ხაზზე ღილაკის top header-ის top-ს ემთხვევა (inset 0). ზუსტად აქ მოიჭრებოდა გარე ring.
- Crop-ებზე ოთხივე შემთხვევაში ჩანს სრული ჩარჩო ოთხივე გვერდით (`shots/n-1440x900-video-tight52-name.png`, `n-1280x720-*-name.png` და სხვ.). Fold ring-იც სრულია (`*-fold.png`).

### 2.4 R23-R
- **File drop** (`runs/r-drops-1440.txt`, ახალი load): `beeps-6s-vp9-opus.webm` video lane body-ზე (`id=":R1ajmr5:"`, fold-ის target-ია). Dragover-ზე hint `ჩააგდე ვიდეო აქ`. შედეგი **ერთი clip 0–6.008**.
- **Library drop:** `სრული მიქსი` music-ზე 7-ზე → **ერთი clip 7–23** (`["music",7,16]`). Undo: `დამატება — ღამის პულსი · სრული მიქსი`.
- **Tab-ის რიგი** (`runs/r-taborder-ms-1440.txt`, რეალური Tab):
  - music (81): fold → `მუსიკა — აქტიური ხაზის არჩევა` → `Mute — მუსიკა` → `Solo — მუსიკა…` → `Volume — მუსიკა` (range) → `მუსიკა სიმაღლე` → stems fold;
  - video: fold → name → `＋ საკუთარი ვიდეო` → `Mute — ვიდეოს ორიგინალი ხმა` → Solo → Volume → `ვიდეო სიმაღლე`.
  - რიგი უცვლელია. ყოველ ნაბიჯზე `:focus-visible` true.
  - **შენიშვნა:** video ამ დროს 84 იყო (row 85; 52-დან ↓ ×4), default 80 არა. ორივე „full“ density-ია.
- **R11-P2 quick:** music დაკეცილია (36), M/S 24×24 px. რეალური click M-ზე → `aria-pressed="true"` (Undo `Mute — მუსიკა`), მეორე click → `false`. Handle ↑/↓ = ∓8/±8 (§2.3).

### 2.5 Real export sanity (`runs/export-sanity.txt`, `lay11`, 1440×900)
- რეალური `$B click`: `Export` → `WAV-ის ექსპორტი` → `დახურვა`. Dialog: `მთელი პროექტი · 0:00 — 00:18.000`. Status: `WAV შეიქმნა: 00:18.000, 24-bit · 48 kHz · stereo.`
- WAV: RIFF/WAVE/fmt/data, PCM (1), 2 ch, 48 kHz, 24-bit. Header თავსებადია (dataSize + 44 = byteLength, RIFF size სწორია).
- **864 000 frame = 18.000 წმ** = projectEnd ✓. **NaN 0.** Full-scale **1800**, peak 1.0 (ცნობილი R13-M4). ბოლო არანულოვანი sample 17.99998 წმ-ზე. RMS −15.48 dBFS. Dialog დაიხურა.
- **Harness-ის შენიშვნა:** `WAV-ის ექსპორტი`-ზე პირველ click-ში არასწორი selector გამოვიყენე (`data-c23x=16`, სწორი 15 იყო). Click არ მომხდარა. მეორე ცდა სწორი selector-ით გავიდა.

### 2.6 G23-3 (`$B restart` → ახალი context, credentials-ის გარეშე)
- **პირდაპირი `/studio-lab`** (`anon-direct.json`, 156 მოთხოვნა):
  - `auth_user` null, cookie ცარიელი, localStorage-ში მხოლოდ `czaba_session_id`;
  - workspace ჩაიტვირთა, „Sign in required“ არ ჩანს;
  - media: მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`;
  - `studio-token`, `recording`, `download`, R2 host: **0**;
  - API მხოლოდ root `GET localhost:5199/api/cart` (pending, ნებადართული).
- **სესიაში fetch/XHR hook** (`anon-session-hook.json`): რეალური click search-ზე, `$B type soft`, რეალური click `Soft impact`-ზე, Enter → clip 0 → 1. fetch 0, XHR 0, `Authorization` 0.
- **Header-ის `Studio LabDemo` ბმულზე რეალური click** `/`-დან (`anon-header.json`): `/studio-lab`, auth null, აკრძალული მოთხოვნა 0, media მხოლოდ 2 demo MP3 (hero-music ორჯერ, რადგან მთავარი გვერდიც ტვირთავს).
- **`/studio/middle-east`** → „Sign in required“, workspace არ ჩანს, media 0 (`shots/anon-studio-middle-east.png`).
- **`curl`**: anonymous → **401** `Please sign in to access Studio.`; fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (carry).

## 3. ახალი ბაგი B-სთვის — C-R23-01 (medium)

**SSR stream-ი NUL byte-ებს სვამს; music-ის სახელის ღილაკის `aria-label` hydration-ის შემდეგაც დაზიანებული რჩება.**

**რეპროდუქცია:**
1. `curl -s http://127.0.0.1:5173/studio-lab -o ssr.html`. სამჯერ გავუშვი, სამივე იდენტურია (55 611 B, `runs/ssr-1..3.html`).
2. NUL byte-ების რაოდენობაა **4**, offset-ებზე 26019–26020 და 42403–42404:
   - `…Arrangement <span class="text-dim">· \0\0მთლიანი პროექტი…` (ხილული ტექსტი);
   - `aria-label="მუსიკა — \0\0აქტიური ხაზის არჩევა"` (music-ის სახელის ღილაკი).
   - `/`-ზე და `/studio/middle-east`-ზე NUL 0-ია.
3. ბრაუზერში, ახალ tab-ში და harness-ის გარეშე (`window.__c` არ არსებობს), music-ის label-ის სიგრძეა 31. Code point-ები: `… 20 2014 20 fffd fffd 10d0 …`. Video/stems/SFX სუფთაა (`runs/hydration-console.txt`: `[false,true,false,false]`).
4. ხილული ტექსტი hydration-მა გაასწორა: `innerText`-ში U+FFFD არ არის. Attribute კი **არ გასწორდა**, მთელი სესიის განმავლობაში. Console-ში hydration-ის warning არ ჩანს.

**Expected:** SSR HTML-ში NUL byte არ უნდა იყოს. Label უნდა იყოს `მუსიკა — აქტიური ხაზის არჩევა`.
**Actual:** screen reader-ს music-ის სახელის ღილაკზე `მუსიკა — ��აქტიური…` მიეწოდება. JS-მდე ან hydration-ის ჩავარდნისას `Arrangement · ��მთლიანი პროექტი` ჩანს.

**მიზეზი (წაკითხული, არ შემიცვლია):** `react-dom@18.3.1`, `react-dom-server.node.*.js`-ის `writeStringChunk`. როცა 3-byte-იანი ქართული სიმბოლო 2048-byte-იანი view-ის ბოლოს არ ეტევა (`read < stringChunk.length`), კოდი `writeToDestination(destination, currentView)`-ს უშვებს, ე.ი. **მთელ** view-ს წერს, შეუვსებელი 1–2 byte-ის (0x00) ჩათვლით. Production build-შიც იგივე ლოგიკაა (`…d<b.length&&(t(a,k),k=new Uint8Array(2048)…`). `app/entry.server.tsx` სტანდარტული `renderToPipeableStream`-ია.

**ატრიბუცია (პატიოსნად):**
- მექანიზმი round 23-ზე ძველია: პირველი წყვილი (offset 26019) ხაზების markup-მდეა.
- რომ მეორე წყვილი სწორედ music-ის label-ზე მოხვდა, ეს byte-layout-ზეა დამოკიდებული. Round 23-მა ამ წერტილამდე byte-ები დაამატა (`aria-controls`/`id`), ამიტომ შესაძლოა ამ round-ში გადმოინაცვლა. Round 22-ის SSR capture არ მაქვს, ამიტომ ვერც „ძველია ამ label-ზე“-ს ვამტკიცებ და ვერც „A-მ გამოიწვია“-ს.
- Round 23-ის acceptance-ს ეს არ არღვევს: ყველა ID-ის oracle გავიდა.

**Routing:** `package.json` და `entry.server.tsx` გაყინულია. გამოსწორების გზები:
- React 19 (`subarray(0, writtenBytes)`);
- `entry.server`-ის workaround;
- dependency patch.

ეს **Tech Lead/root-ის** გადაწყვეტილებაა და არა A-ს round 24-ის scope. Store-ის ყველა SSR გვერდი ქართული ტექსტით პოტენციურად დაზარალებულია, თუ 2048-byte-იან საზღვარზე 3-byte-იანი სიმბოლო მოხვდება.

## 4. არავალიდური გაზომვები და ჩემი შეცდომები

| რა | მიზეზი | შედეგი |
|---|---|---|
| R23-U პირველი control run (33 failed) | ჩემი scratch config (JSX runtime, `React is not defined`) | გასწორდა, ყველა run თავიდან გაეშვა |
| Export-ის პირველი click | არასწორი selector-ის სიგრძე (16 ≠ 15); click არ მომხდარა | მეორე ცდა გავიდა |
| R23-F2-ის Ctrl+Z | ჩემი არასაჭირო Undo-მ SFX-ის დამატება გააუქმა | Ctrl+Shift+Z-ით აღდგა; საბოლოო click redo-ს შემდეგ შესრულდა |

## 5. დაკვირვებები B-სთვის (არა ბაგი)
- A-ს code-reviewer-ის Low 3: დაკეცილი ხაზის clip-ები accessibility tree-ში რჩება, ამიტომ `aria-expanded=false` „დამალულზე“ სუსტი დაპირებაა. ეს არსებული ქცევაა; doc 029-ის TODO-შია.
- Tight video ხაზზე სახელის ღილაკის top = header-ის top (inset 0). Inset ring-ით ეს უსაფრთხოა.
- 1280×720-ზე viewport-ის შეცვლისას layout შენარჩუნდა (video 53, დანარჩენი 81).

## 6. Product flow და Ableton-თან შედარება
- **Find → add:** anon search `soft` → option → Enter; library drag music-ზე 7-ზე; ვიდეო file drop-ით video lane body-ზე (ახლა fold-ის `aria-controls` target-იცაა).
- **Fit video / lane მართვა:** fold 36 px ↔ წინა სიმაღლე click-ითა და Space-ით, transport-ის დაწყების გარეშე. History-ში არ იწერება (Ableton TRK-04-ის fold, წინა round-ების ID; source-ები ამ round-ში ხელახლა არ წამიკითხავს). Keyboard-ით სრულად ხელმისაწვდომია, ring არ მოიჭრება.
- **Export:** WAV 18.000 წმ, NaN 0. Hard-clip (R13-M4) ჯერ ღიაა, SRW-13.

## 7. Carried (უცვლელი; არა PASS, არა ახალი ბაგი)
Root (`root-pre-push-review.md`, `publication-checkpoint.json`):
- purchased loader middle-east-ზე hardcoded (SRW-21);
- Lenis `/studio/*`-ზე;
- portable instruction-file paths;
- export hard-clip 0 dBFS (R13-M4, SRW-13; 1800 full-scale sample);
- საბოლოო commit/push მხოლოდ ბოლოს; uncommitted round-6..23 tree;
- საერთო `Modal.tsx` focus gap;
- root GA `scroll`/`page_view` consent denied-ით;
- ორი უცხო agent ფაილი (არ წამიკითხავს, არ შემხებია);
- A round-17 dev. 4, A round-19 dev. 5, A round-22 dev. 4 და C-ის python probe-ები rounds 21–22-ში;
- fake Bearer → 500 token-ის გარეშე;
- CDP allowlist `Input.dispatchMouseEvent`-ს კრძალავს;
- publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, საბოლოო commit/push).

Root M1, M2, M3, L1–L4, L6, L7, L8 დახურულია.

Tech Lead-ის ხელით: R23-1/2 (round 4-ის scrollbar; ამ round-ის R23-F/N/R/S/U-თან კავშირი არ აქვს), R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, Lenis `/studio/*`, MP4/MOV-ის დადებითი import.

ღია C ბაგები: C-R6-02, C-R8-01 (Tech Lead quiet Chrome), **C-R23-01 (ახალი)**.

ამ round-ში ხელახლა არ გაშვებულა (task §4.6; audio/sync/dock/scheduler ფაილი არ შეცვლილა, G23-2): RF5-3, R3-V1, R3-V2, R3-V4, R5-L3, R11-P3 sync, R22-M1/M2. ისინი round 23-ისთვის PASS არ არის; ბოლო მტკიცებულება rounds 21–22-შია.

## 8. Deviations და გარემო
- `$B restart` G23-3-ისთვის (ახალი daemon). ერთი დამატებითი tab გავხსენი C-R23-01-ის harness-ის გარეშე შესამოწმებლად და შემდეგ დავხურე.
- Browser-ის side effects მხოლოდ demo local state-ია (layout, fold, სიმაღლეები, mute toggle, რომელიც უკან დავაბრუნე).
- Dev server-ს არ შევხებივარ. Source-ში ცვლილება 0 (G23-2-ის ბოლოს owned sha იგივეა).
- Mutation მხოლოდ `c-round-23/mut/`-შია (`store/`-ის გარეთ). `node_modules`-ის junction მოვხსენი, მიზანი (`store/node_modules`) ხელუხლებელია.
- python არ გამიშვია. ბოლოს ჩემი vitest პროცესი არ დარჩენილა.
- Scripts: `c-round-23/{b,r,setup,n}.sh`, `gates/{g1,g2}.sh`, `scripts/{f1,nmeas,drops,wav}.js` + წინა round-ების helper-ები (`c-round-11/scripts/lay11.js`, `c-round-16/scripts/{hold,release}.js`).

## 9. შემდეგი (B)
- **C-R23-01** → Tech Lead/root (dependency ან `entry.server`; ორივე გაყინულია). A-ს round 24-ში არ შედის. თუ B მის გამოსწორებას დაგეგმავს, oracle უნდა იყოს: `/studio-lab`-ის (და სხვა ქართული SSR გვერდების) HTML-ში NUL = 0, და DOM-ში არც ერთ attribute-ში U+FFFD.
- Round 24: task §7-ის მიხედვით (Home separator-ზე, `forwardRef` detail panel-ისთვის).
- `feature-status.md`: lane-header a11y ნაწილი 1 → **მზადაა** (ამ round-ის მტკიცებულებით).
