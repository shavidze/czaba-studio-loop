# C — Round 17 შემოწმება: C-R16-01 (preview-ის აქტიური ხაზის ფიქსირებული ორხაზიანი row) + M-R10-1/M2 (`LibraryPlayheadText` memo), D-29h

შემმოწმებელი: C (Claude Opus 5.5) · თარიღი: 2026-10-11 · დავალება: `current-task.md` (round 17) · A-ს ანგარიში: `a-round-17.md`
Browser: gstack browse, state `c-browse.json`, სერვერი `http://127.0.0.1:5173` (არ გამიშვია/გამიჩერებია). Source-ში ცვლილება არ შემიტანია.

## 0. ვერდიქტი — **PASS**

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R17-P1 (fixed row) | **PASS** (line-count მეტრიკის შენიშვნით, §2.1) | `c-round-17/runs/p1-1440x900.txt`, `p1-1280x720.txt`, `p1-1280x720-stems-fill.txt`, `forced-overflow-1440-288.txt`, `shots/p1-*.png`, `shots/forced-overflow-1440-288.png` |
| R17-P2 (C-R16-01 repro) | **PASS** (P2.3 „ყველა წერტილი“ — ფორმულირების შენიშვნა, §3) | `runs/p2-1440x900-288.txt`, `p2-1280x720-480.txt`, `p2-1280x720-288.txt`, `p2-1440-288-non-preview-points.txt`, `shots/c-r16-01-repro-fixed-1440-288.png` |
| R17-P3 (preview controls) | **PASS** | `runs/p3m-1440-288.txt`, `shots/p3-video-lane-add-disabled-1440-288.png` |
| R17-M (memo, browser) | **PASS** | `runs/p3m-1440-288.txt` |
| R17-U (tests + guard) | **PASS** | `gates/vitest-new.txt`, `gates/guard-c17.txt` |
| R17-Doc | **PASS** | §6 |
| R16-F2 quick | **PASS** | P2 runs + `runs/quicks-1440x900.txt` |
| R16-F3 quick | **PASS** | `runs/quicks-1280x720.txt` |
| R15-P2 quick | **PASS** | `runs/quicks-1280x720.txt`, `quicks-1440x900.txt` |
| R13-F3 quick | **PASS** | იგივე |
| R16-F1 quick | **PASS** | იგივე |
| R11A-1 quick | **PASS** | იგივე |
| Dock quick | **PASS** | იგივე |
| RF7-P2 | **PASS** | `gates/sha-b16.txt`, `gates/vitest-new.txt` |
| G17-1 | **PASS** | `gates/vitest-*.txt`, `tsc.txt`, `biome-*.txt`, `build.txt` |
| G17-2 | **PASS** | `gates/sha-b16.txt`, `owned-sha.txt`, `protected.txt`, `git-status-start/end.txt`, `diff-stat.txt`, `header-diff.txt`, `instr-grep.txt` |
| G17-3 | **PASS** | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |

**C-R16-01 დახურულია** C-ის საკუთარი repro-თი (§3). ახალი ბაგი არ არის.

## 1. Gates

### G17-1 (ჩემი ხელახალი გაშვება, `gates/run-gates.sh`)
- `vitest library-preview + render-budget`: **2 files, 11/11 passed**, exit 0.
- `vitest run` (სრული): **56 files, 983/983 passed** (979 + 4 ახალი), exit 0. `sfx-library` flake არ განმეორდა.
- `tsc --noEmit`: exit 0, output ცარიელი.
- `biome check app/lib/arrangement app/components/arrangement`: 55 ფაილი, 0 error, „No fixes applied“.
- `biome check ./app`: 322 ფაილი, exit 0, 218 warning + 1 info (არსებული), 0 error.
- `npm run build`: exit 0, `build/server/index.js 1,280.56 kB`, „built in 2.32s“.

### G17-2
- `sha256sum -c b-round-16-tree-sha256.txt`: **44 OK, 2 FAILED** — მხოლოდ owned `ArrangementLibraryPreview.tsx` და doc 025. ყველა §3.3 frozen ფაილი (მათ შორის `render-budget.test.tsx`, `ArrangementLibrary.tsx`, `StudioWorkspace.tsx`, dock, `video-sync.ts`, `ArrangementContext.tsx`, `position-store`-ის მომხმარებლები, `Modal.tsx`, docs 015–024) OK.
- A-ს backups: `bak/ArrangementLibraryPreview.base.tsx` 4216e6bf… და `bak/025-…base.md` 0d200ce1… = B-ის სიის ჰეშები.
- Owned ფაილების ამჟამინდელი sha = A-ს `owned-end-sha256.txt` (c6efc0ef…, b42334fc…, 30f5299e…, f24741ad…).
- Product diff (ჩემი `diff bak → live`): მხოლოდ `memo` import, `LibraryPlayheadTextMemo = memo(LibraryPlayheadText)`, ორი const (`activeLaneName`, `activeLaneVideoNote`), `<p className="line-clamp-2 h-8 text-xs text-muted" title=…>` და `<LibraryPlayheadTextMemo />`. Inner ფუნქცია `LibraryPlayheadText` უცვლელია.
- `git status --short`: 40 ხაზი = baseline 38 + `?? library-preview.test.tsx` + `?? 026-…md`. დასაწყისისა და დასასრულის snapshot იდენტურია (`TREE-UNCHANGED`) — ჩემს შემოწმებას tree არ შეუცვლია.
- `git diff Header.tsx`: ცარიელი; `git diff --stat cc1e531 -- Header.tsx`: +21/−0.
- `git diff -- app/lib/arrangement/library.ts`: ცარიელი.
- Protected-baseline: 4/4 OK.
- `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json`/lock, `studio-lab-demo.ts`, `components/layout`: `git status`-ში ცვლილება არ არის.
- Instrumentation grep (`console.log|debugger|__a17|data-a17|__c17`) owned source-ზე: 0.
- უცხო `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` — არ შემხებია, root-ს ეცნობება.

### G17-3 (ახალი browser context: `$B restart`, credentials არა)
- **პირდაპირი `/studio-lab`** (`anon-direct.json`, `network-anon-direct.txt`, 156 მოთხოვნა): `auth_user` null, cookie ცარიელი, localStorage-ში მხოლოდ `czaba_session_id`; workspace ჩაიტვირთა. `/api/studio-token`, `/api/recording-*`, `/api/download`, R2 host: **0**. ერთადერთი API — ცნობილი root `GET localhost:5199/api/cart` (pending). Media: `/middle-east.mp3`, `/videos/hero/hero-music.mp3`.
- **fetch/XHR hook სესიაში** (`anon-session-hook.json`): preview ▶/■ + search `soft` → option → Enter (1 clip): `Authorization` **0**, fetch 0, XHR 0. `grep Authorization` arrangement source-ში (ტესტების გარეშე): 0.
- **Header-ის ხილულ „Studio LabDemo“ ბმულზე რეალური `$B click`** `/`-დან (`anon-header.json`, `network-anon-header.txt`): `/studio-lab`, auth null, აკრძალული მოთხოვნა 0; media — demo MP3-ები (hero-music homepage-იდანაც).
- **`curl`** (`curl-token.txt`): anonymous → **401** `Please sign in to access Studio.`; fake Bearer → 500 `Unable to prepare Studio access`, token არ გაიცა (round 16-ის იდენტური; carry).
- **`/studio/middle-east`** → „Sign in required“, workspace არა, media 0 (`anon-studio-me.json`, `shots/anon-studio-middle-east.png`).
- **Premium auth-ის bypass არ არის.**

## 2. R17-P1 — ფიქსირებული row (`runs/p1-*.txt`)

Setup: ახალი anonymous გვერდი, C-ის `lay11` (ვიდეო 0–6.008, music 0–16, stems 2–18, SFX 4–6); ბიბლიოთეკის სიგანე რეალური `$B press ArrowRight`-ით separator-ზე (16 px ნაბიჯი). აქტიური ხაზი — synthetic click ხაზის ცარიელ ადგილას, ან, სადაც ცარიელი ადგილი არ იყო, რეალური `$B click` clip-ის header-ზე.

| VP | lib | video | music | stems | SFX | `<p>` | preview | body |
|---|---|---|---|---|---|---|---|---|
| 1440×900 | 288 | 2 | 2 | 2 | 1 | 32 | 167 | 233–664 |
| 1440×900 | 384 | 2 | 1 | 1 | 1 | 32 | 167 | 217–664 |
| 1440×900 | 480 | 1 | 1 | 1 | 1 | 32 | 167 | 217–664 |
| 1280×720 | 288 | 2 | 2 | 2 | 1 | 32 | 167 | 271–484 |
| 1280×720 | 384 | 2 | 1 | 1 | 1 | 32 | 167 | 255–484 |
| 1280×720 | 480 | 1 | 1 | 1* | 1 | 32 | 167 | 255–484 |

(რიცხვები ლაინებში = შინაარსის ხაზები `rangeLines`-ით.)

- **P1.1:** ყველა 24 უჯრაში `offsetHeight` 32 = 2 × `line-height` 16px (`twoLh` true), font 12px; computed `-webkit-line-clamp: 2`, `overflow: hidden`, `-webkit-box-orient: vertical`. `scrollHeight` ყველგან 32, `scrollHeight > offsetHeight` არასდროს, ამიტომ ellipsis საჭირო არ არის; `· playhead` span ყველგან ხილულია.
- **P1.2:** `title` ზუსტად `აქტიური ხაზი: {name}{note}`, trailing space-ის გარეშე; `title === textContent.split('·')[0].trim()` ყველა უჯრაში; ვიდეოზე `(აუდიო აქ არ ემატება)`.
- **P1.3:** `textContent` = `აქტიური ხაზი: {name}{note} · playhead {time}` (round 16-ის ფორმა).
- **P1.4 Δ0 ხაზებს შორის:** ერთ viewport/სიგანეზე preview 167 და body იდენტურია ოთხივე ხაზზე.
- **P1.5 Δ0 სიგანეებს შორის:** preview 167 ყველა სიგანეზე. Body-ს ზედა კიდე 288→384-ზე 233→217 / 271→255 იცვლება — ეს ბიბლიოთეკის header-ის reflow-ია (round 16-შიც ასე იყო), preview-ის სიმაღლეს არ ეხება.
- **\* არავალიდური რიგი:** `p1-1280x720.txt` W480 stems — ცარიელ-ხაზის click-მა `arrangement-track-header`-ს მოარტყა (x 700, scroller 480-ზე ვიწროა), ხაზი „მუსიკა“ დარჩა. ვალიდური ნიმუში: `p1-1280x720-stems-fill.txt` (რეალური click stems clip-ის header-ზე): `<p>` 32, rangeLines 1, title „…სტემები“, preview 167, body 255–484; ასევე `p2-1280x720-480.txt` STEMS_CLICK. Harness-ის ხარვეზია, არა პროდუქტის.

**§2.1 მეტრიკის შენიშვნა (B-სთვის).** P1.1-ის ლიტერალური `round(scrollHeight / line-height)` ფიქსირებულ `h-8`-ზე სტრუქტურულად ყოველთვის 2-ია (scrollHeight ≥ clientHeight), ამიტომ ერთხაზიან მდგომარეობებში A-ს pre-code 1-ს ვერ დაემთხვევა არცერთი სწორი იმპლემენტაციით. შინაარსის ხაზები ორი დამოუკიდებელი გზით გავზომე:
1. `Range.getClientRects()`-ის განსხვავებული top-ები (`rangeLines`) — ყველა ვალიდურ უჯრაში = A-ს §1.4(a) ცხრილი;
2. page-state-only unclamp (`p.className = "text-xs text-muted"`, შემდეგ აღდგენა) 1280/480 stems-ზე: `<p>` 16 (1 ხაზი), preview 151 → აღდგენის შემდეგ 32/167.

ორივე ≤ 2 და pre-code რაოდენობას ემთხვევა, ამიტომ P1 PASS-ად ჩავთვალე მეტრიკის ჩანაცვლებით. **B:** შემდეგ დავალებებში ფორმულირება `rangeLines`-ით (ან unclamp-ით) ჩაასწორე.

**Clamp-ის მექანიზმი (page-state only, `forced-overflow-1440-288.txt`, `shots/forced-overflow-1440-288.png`).** 1440/288, ვიდეო ხაზი (რეალური clip click), `<p>` inline width 140px: `offsetHeight` 32, `scrollHeight` 48, rangeLines 3, preview 167 უცვლელი; screenshot-ში მე-2 ხაზის ბოლოს ჩანს `(აუდიო აქ არ ემატებ…`. Playhead span ამ შემთხვევაში დამალულია — ეს R17-T-ის რისკია (Tech Lead, Windows-ის ქართული ფონტები). Style მოხსნის შემდეგ: scrollHeight 32, rangeLines 2. (პირველი მცდელობა იმავე ფაილში არავალიდურია: ხაზი SFX დარჩა და 140px-ზე 2 ხაზში ეტეოდა.)

**P1.6 ფასი (A-ს §1.4(c)-თან შედარება).** Round 16 / pre-code: ერთხაზიან მდგომარეობაში preview 151. ახლა ყველგან 167:

| VP / lib | +16 px მდგომარეობები | body ერთხაზიან მდგომარეობაში: ადრე → ახლა | A-ს §1.4(c) |
|---|---|---|---|
| 1440 / 288 | SFX | 233–680 → 233–664 (C round 16 `active-lane-residual`) | ემთხვევა |
| 1440 / 384 | music, stems, SFX (video +0) | 217–680 → 217–664 | ემთხვევა |
| 1440 / 480 | ოთხივე | 217–680 → 217–664 | ემთხვევა |
| 1280 / 288 | SFX | 271–500 → 271–484 (C round 16 `f1-extra-1280`) | ემთხვევა |
| 1280 / 384 | music, stems, SFX (video +0) | 255–500 → 255–484 | ემთხვევა |
| 1280 / 480 | ოთხივე | 255–500 → 255–484 (C round 16 R16-F2 body) | ემთხვევა |

ფასი გამჟღავნებულია და A-ს რიცხვს ემთხვევა → D-29h-ის ფასი, არა ჩავარდნა.

## 3. R17-P2 — C-R16-01-ის ზუსტი repro (`runs/p2-*.txt`)

თანმიმდევრობა: SFX (ცარიელი ხაზის click) → რეალური `$B click` ⤢ → რეალური click music clip header → stems header → SFX → video → SFX. ფორმულა: w = max(160, min(640, lib−16, (h−16)·16/9, (h/2)·16/9)), top = max(body.t+8, body.b−8−w·9/16), left = lib.l+8.

| VP / lib | body (ყველა ნაბიჯში) | ყუთი ⤢-ის შემდეგ (l, t, w×h, bottom) | Δ ფორმულა | inset (= h+16) | top-12 px: preview / ყუთში |
|---|---|---|---|---|---|
| 1440 / 288 | 233–664 | 8, 503, 272×153, 656 | 0/0/0/0 | 169px | 210/216 / **0** |
| 1280 / 480 | 255–484 | 8, 361.5, 203.55×114.48, 475.98 | 0/0/−0.01/−0.02 | 130.5px | 354/360 / **0** |
| 1280 / 288 | 271–484 | 8, 369.5, 189.33×106.48, 475.98 | 0/0/0/−0.02 | 122.5px | 210/216 / **0** |

- ყველა ხაზის ცვლილებაზე (SFX↔music↔stems↔video): **body Δ0, ყუთი უცვლელი**, preview 167, footer 69.
- ყუთის ქვედა კიდე = body.bottom − 8 (bvb 0 / −0.02) ≤ body.bottom − 8 + 1.
- Wave, toggle, ◀, search, separator — თითოეული თავის თავს hit-test-ავს ყველა ნაბიჯში.
- **P2.3 „ყველა წერტილი preview-ში“:** 6 წერტილი (x = 284, y 664.5–674.5) `arrangement-library-separator`-ს ხვდება (`p2-1440-288-non-preview-points.txt`) — ბიბლიოთეკის კიდის სახელური, იგივე რაც round 16-ის baseline-ში (210/216, მაშინ PASS). ყუთში 0. ლიტერალური ფორმულირება არ სრულდება, მაგრამ ეს რეგრესია არ არის; **B:** grid-ი separator-ის სვეტის გარეშე ან ფორმულირება „0 ყუთში, დანარჩენი preview ან separator“.
- Round 16-ის repro (SFX → music, 1440/288): ადრე body 233–680 → 233–664, ყუთი 8,519 bottom 672, ყუთში 136/216. ახლა body 233–664 მუდმივად, ყუთი 8,503 bottom 656 < preview top 664, ყუთში 0. **C-R16-01 დახურულია.**
- Shot: `shots/c-r16-01-repro-fixed-1440-288.png` (music აქტიური, ყუთი preview-ის ზემოთ).

## 4. R17-P3 და R17-M (`runs/p3m-1440-288.txt`, 1440×900, lib 288)

Master output-ზე AudioWorklet tap (`c-round-2/scripts/setup-base.js`).

**P3**
1. Source „Middle East — საჯარო preview“ (01:41.352) რეალური click-ით. რეალური `$B click` wave-ზე (ელემენტის ცენტრი ≈ 50 %): ▶ → ■, valuenow 51 / `00:50.788`; 1.4 s-ის შემდეგ 52 / `00:52.388`. Master tap ბოლო 1 s: RMS **−14.9 dBFS**, peak 0.998 — preview რეალურად ჟღერს.
2. რეალური click `■ შეჩერება`-ზე → ▶, `00:52.836`; tap stop-ის შემდეგ 0.3 s: −240 dB (სიჩუმე). Focused wave-ზე რეალური Space → ■ (53.527), კიდევ Space → ▶ (53.676); რეალური ArrowRight → **54.676 = +1.000 s**.
3. Find → add: რეალური click search-ზე, `type soft` (1 option „Soft impact SFX 00:02.000“), რეალური click option-ზე, რეალური Enter → clips **4 → 5**, სტატუსი „„Soft impact“ დაემატა SFX ხაზზე 00:02.000-ზე (უახლოესი თავისუფალი ადგილი)“. **Undo entry-ის დათვლა:** ერთი რეალური Ctrl+Z → clips 4 (ზუსტად lay11-ის ნაკრები), Ctrl+Shift+Z → 5. ე.ი. add = **ერთი** Undo entry (A-მ ეს არ შეამოწმა).
4. ვიდეო ხაზი აქტიური → `＋ დამატება` disabled; row და `title` ორივე შეიცავს `(აუდიო აქ არ ემატება)` (`shots/p3-video-lane-add-disabled-1440-288.png`).

**M**
- Library preview 3 s, transport გაჩერებული: `arrangement-library-playhead` `isSameNode` true 0 / 1.5 / 3 s-ზე; ტექსტი `00:00.000` = transport; preview cursor 55.041 → 56.743 → 58.441.
- Home, შემდეგ body-ზე რეალური Space (arrangement Play): 1 s — library `00:01.142` = transport `00:01.142`; 2 s — `00:02.361` = `00:02.361`; Pause — `00:02.782` = `00:02.782`; იგივე node. Master tap Play-ის დროს: RMS −15.1 dBFS, peak 1.13 (graph-ში limiter-მდე; ცნობილი R13-M4 კონტექსტი).
- Dock counters ყველა run-ის ბოლოს: swaps 0, fallbacks 0, hardSeeks 0, escalations 0. Stall/hard seek არ შემიმჩნევია. Sync run არ ჩამიტარებია (§6).

## 5. R17-U (ტესტები + guard)

- `library-preview.test.tsx`: 4 ტესტი (audio-ს row, ვიდეოს note/title + იგივე node, `—` მდგომარეობა, memo 12 cursor ნაბიჯი). წავიკითხე სრულად: probe ითვლის სახელით (`render-budget`-ის pattern-ის ასლი, frozen ფაილიდან import არ არის); class token-ები `h-8`, `line-clamp-2`, არა `truncate`; title ზუსტი; `· playhead 00:00.000`; `ArrangementLibraryPreview` ≥ 10 render, `LibraryPlayheadText` 0.
- `render-budget.test.tsx` sha = B-ის სია; მწვანეა.
- **ჩემი guard proof** (`gates/guard-c17.txt`; `app/`-ის იზოლირებული ასლი `c-round-17/guard/`-ში, live source ხელუხლებელია; ყოველი მუტაციის შემდეგ ასლი აღდგა და `cmp` იდენტური):

| # | მუტაცია | შედეგი |
|---|---|---|
| G1 | `line-clamp-2 h-8` მოხსნა | ტესტი 1 ვარდება: `expected [ 'text-xs', 'text-muted' ] to include 'h-8'` |
| G2 | `title` მოხსნა | ტესტები 1–3: `expected null to be 'აქტიური ხაზი: …'` |
| G3 | `<LibraryPlayheadText />` memo-ს ნაცვლად | ტესტი 4: `expected 12 to be +0` |
| G4 | inner ფუნქცია → `LibraryPlayheadTextInner` | ტესტი 4 **და frozen `render-budget` R9-L1**: `expected 0 to be greater than 0` — სახელის შეზღუდვა load-bearing-ია |
| G5 (დამატებითი) | `h-8` → `min-h-8` | ტესტი 1: `… to include 'h-8'` |
| G6 (დამატებითი) | title-ში trailing space | ტესტები 1–3: `expected 'აქტიური ხაზი: მუსიკა ' to be 'აქტიური ხაზი: მუსიკა'` |
| G7 (დამატებითი) | ვიდეოს note → `''` | ტესტი 2: `expected 'აქტიური ხაზი: ვიდეო' to be '… (აუდიო აქ არ ემატება)'` |

Baseline ასლზე: 11/11 მწვანე.

## 6. R17-Doc

- **Doc 025** (diff backup-თან): სტატუსი „Completed — C round 16 PASS“ R16 ID-ებით, vitest 979/979; C-R11-01..03, C-R15-02/03 და deviation 9 დახურულია C-ის მიერ; C-R16-01 „ღიაა“ → round 17 (D-29h); deviation 5 = B-ის ფორმულირება (deselect = იმავე ხაზის ცარიელი ადგილი). „resolved“ ფორმულირება C-R16-01-ზე არ არის. შეიცვალა მხოლოდ სტატუსი და TODO/C-round ხაზები.
- **Doc 026**: სტატუსი „In Progress — pending C“, არცერთი PASS-ის მტკიცება; D-29h-ის დასაბუთება (ორი ხაზი და არა `truncate`, re-placement არა), გაზომვები, ფასის ცხრილი (+16 px ერთხაზიან უჯრებში; 1280/480 ყუთი 8,369.5 217.77×122.48 → 8,361.5 203.55×114.48), ტესტები და R17-T რისკი.

## 7. მეზობელი რეგრესიები (`runs/quicks-1280x720.txt`, `quicks-1440x900.txt`)

- **R16-F2 quick** (selection-ის გარეშე, რეალური ⤢): 1440/288 **8,503 272×153** — round 16-ის იდენტური (მაშინაც ორხაზიანი მდგომარეობა იყო). 1280/480 **8,361.5 203.55×114.48**, inset 130.5 (round 16: 8,369.5 217.77×122.48) — ცვლილება მხოლოდ ფასია (body 245 → 229). 1440/480 (baseline არ აქვს): 8,432.5 397.33×223.48, Δ ფორმულა 0/0/0/−0.02, inset 239.5. ◀/search/separator/preview hit-test-ები სწორია.
- **R16-F3 quick** (1280/480, expanded, find → add): body 255–484 Δ0, ყუთი უცვლელი, top-12 ყუთში 0, clips 4 → 5, footer 69. 1440/480-ზეც იგივე.
- **R15-P2 quick:** რეალური click `soft` row-ზე (ყუთი row-ს არ ფარავს) + Enter → ზუსტად 1 clip. ბოლო row („მელოდია … სინთეზური დემო“) max scroll-ზე (1280/480: scrollTop 413 = max, row 290–353.75 < box top 361.5; 1440/480: 304 = max, 361–424.75 < 432.5) hit-test-ავს თავის თავს; padding-bottom = h+16 (130.5 / 239.5).
- **R13-F3 quick:** ✕, placeholder „დაბრუნება“ და Esc → ყუთი 160×90, იგივე `<video>` node-ები (`same=true`), ორივე muted.
- **R16-F1 quick:** footer 69 ორივე viewport-ზე; select ↔ deselect (იმავე ხაზის ცარიელი ადგილი) ×2 → body და scroller Δ0 (1280: 271–484 / 386; 1440: 233–664 / 496).
- **R11A-1 quick:** ◀ → rail 40, ▶ → 288; separator ArrowLeft ×3 → 288 (ქვედა ზღვარი), ArrowRight ×16 → 480 (ზედა ზღვარი).
- **Dock quick:** 1440: 1152×107 (480-ზე 960, rail-ზე 1400); 1280: 992×107 (480-ზე 800, rail-ზე 1240); ვიდეო 160×90, ერთი ხილული `<video>`, ორივე muted; counters 0/0/0/0.
- **RF7-P2:** `render-budget.test.tsx` sha უცვლელი, მწვანე.
- **Harness-ის არავალიდური მცდელობა:** `runs/quicks-1280x720-attempt1-invalid-wrong-separator.txt` — `window.__c.sep()` სხვა separator-ზე (valuenow 142, არა ბიბლიოთეკის) მიუთითებდა, ამიტომ ბიბლიოთეკა 288-ზე დარჩა. Selector `[data-testid=arrangement-library-separator]`-ით ჩავასწორე და გავიმეორე.

**ნამდვილი Export sanity** (find → add → video → export, `runs/export-1440.txt`): dialog „მთელი პროექტი · 0:00 — 00:18.000“; რეალური click „WAV-ის ექსპორტი“ → `czaba-studio-lab.wav`. RIFF/WAVE PCM, 2 ch, 48 000 Hz, 24-bit, data 5 184 000 B = **864 000 frame = 18.000 s**; NaN 0, DC 6.6e-4; RMS 0–0.5 −14.5, 4–5 (SFX) −11.2, 8–16 −15.6, 16–17.9 (stems-ის კუდი) −24.7, ბოლო 10 ms −73.5 dBFS. Peak 1.0, 1802 sample FS-ზე — ცნობილი R13-M4/SRW-13 hard-clip (carry), round 16-ის იდენტური რიცხვები.

## 8. Harness და გარემო

- კლავიშები — რეალური `$B press`; დასახელებული click-ები — რეალური `$B click`; ცარიელ ხაზზე click — synthetic (`buttons: 1`). Browser marker-ები (`data-c16`, `data-c17`, `window.__c17node`) მხოლოდ page state-შია.
- **CDP:** `$B cdp Input.dispatchMouseEvent` → `DENIED: … not on the CDP allowlist` (`runs/cdp-probe.txt`) — A-ს deviation 3 დადასტურდა; კოორდინატული რეალური click ამ გარემოში შეუძლებელია.
- **ჩემი ინციდენტი:** `c-round-17/guard`-ში `ln -s node_modules` Git Bash-მა ასლად შექმნა (547 MB, reparse point არ იყო — `fsutil`-ით შემოწმდა). Guard ამ ასლზე გაეშვა, შემდეგ ასლი წავშალე. Store-ის `node_modules` ხელუხლებელია (618 ჩანაწერი). Source-ზე გავლენა არ ჰქონია.
- Vite reload არ ყოფილა: source არ შემიცვლია.

## 9. B-სთვის / root-ისთვის

**ახალი ბაგი:** არცერთი.

**დახურული:** C-R16-01 (C-ის საკუთარი repro, §3).

**ფორმულირების შენიშვნები (არა ბაგები):**
1. R17-P1.1: `round(scrollHeight / lh)` ფიქსირებულ სიმაღლეზე სტრუქტურულად 2-ია → `rangeLines` ან page-state unclamp.
2. R17-P2.3: separator-ის x = 284 სვეტი grid-იდან ამოიღე ან ფორმულირება „0 ყუთში“.

**Tech Lead:** R17-T — ორხაზიანი row Windows-ის ქართული ფონტებით. მესამე ხაზის შემთხვევაში clamp `· playhead` დროს მალავს (forced-overflow-ით დადასტურდა).

**Root carry (ღია, უცვლელი):**
- A-ს deviation 4: `taskkill //F //IM python.exe`-მა 2 python პროცესი მოკლა (ერთი უცნობი); root-მა დაადასტუროს, რომ არცერთი საჭირო helper (მაგ. `watch-context.py`) არ უნდა ყოფილიყო გაშვებული. C-ს ეს არ გადაუმოწმებია.
- CDP allowlist უარყოფს `Input.dispatchMouseEvent`-ს — real-mouse harness-ებისთვის.
- ორი უცხო agent ფაილი (`.claude/agents/frontend-architect.md`, `.codex/agents/frontend-architect.toml`).
- Fake Bearer → 500 (token არ გაიცემა; 401 უფრო სწორი იქნებოდა) — round 16-ის იდენტური.
- `root-pre-push-review.md` / `publication-checkpoint.json`: purchased loader-ი middle-east-ზე hardcoded (SRW-21); Lenis `/studio/*`-ზე; portable instruction-file paths; export-ის hard-clip 0 dBFS-ზე (R13-M4, SRW-13); საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ; uncommitted round-6..17 tree; საერთო `Modal.tsx` focus gap (body-ზე focus trap-იდან გადის); root GA consent-denied `scroll`; library/stems/scrollbars და T12-ის მოთხოვნები.

**ამ რაუნდში არა და არა PASS:** C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome); C-R12-01 (RF5-3); polish 14b (round 18); M1/L8; L2/L3; 21 regression-debt ID (milestone); SRW-13..20; SRW-21 adapter; T12; Tech Lead manual checks (R11-P3m, R11-SB, R13-RM, R15-SB, R17-T).
