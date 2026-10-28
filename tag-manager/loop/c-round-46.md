# C — Round 46: TM-B11 stage 2 (D-50) — დამოუკიდებელი შემოწმება

**taskStatus: PASS** · bugs: 0 · realVerified: true
`build:win`/`build:mac`: BLOCKED — "Windows packaging is not available in the cloud" (A-ს ნამუშევრის FAIL არ არის).

ყველა evidence: `c-round-46/`. Probe script: `c-round-46/r46-probe.mjs`. შედეგები: `r46-results-a.json` (A-ს tree) და `r46-results-base.json` (c822d7f build).

## Process notes root-ისა და B-სთვის (verdict-ს არ ცვლის)
- A-მ `metadata.ts`-ის სამი getter ხაზი `sed -i`-ით შეცვალა, Edit tool-ის ნაცვლად. ეს task-ის „Edit/Write only“ წესს არღვევს, თუმცა A თვითონ აცხადებს. diff-ის შინაარსი ზუსტად სპეციფიცირებულია. ამ დარღვევაზე გადაწყვეტილება root-ისაა.
- **A2 deviation (მიღებულია, bug არ არის):** `value={numVal}` (number) ნაცვლად `String(v)`-ისა, code-reviewer F1-ის გამო.
  - spec-ის განზრახვა („`0` ჩანს, unset ცარიელია“) real app-ში დადასტურდა.
  - `1.05` აკრეფა ტექსტს ინარჩუნებს (`d1`: input `1.05`, raw/ffprobe/mm `TAKE=1.05`).
  - B-მ ჩაწეროს.
- (r3) A5-ში „must fail“ სიაშია, მაგრამ c822d7f-ზე მწვანეა.
  - A-ს ახსნა სწორია: ძველი `0` main-ის read-იდან მოდიოდა და არა renderer-იდან.
  - red მხარეს (n2) ფარავს, რომელიც c822d7f-ზე ჩავარდა.

## R46-1 ownership — PASS
- HEAD `c822d7f1a60a03741c5c1052f19e934d39a85d08`. 12 tracked ფაილი შეცვლილია და 2 untracked ახალი ტესტია. ყველა ownership ცხრილშია.
- Per-file diff:
  - `file-list.test.ts`: მხოლოდ :22.
  - `metadata-panel-batch-save.test.ts`: მხოლოდ :44.
  - `busy-buttons-focus.test.ts`: მხოლოდ :45.
  - `metadata-empty-values.test.ts`: მხოლოდ (e6) title.
  - `file-row-display.test.ts`: ზუსტად ჩამოთვლილი flips და +1 case.
  - `TemplatePicker.tsx`: მხოლოდ :130.
  - `MetadataPanel.tsx`: მხოლოდ number Input block.
  - `file-row-display.ts`: ერთი ხაზი.
- Frozen და protected paths: `git diff --quiet` = 0. შემოწმებულია:
  - `package*.json`, `.github`, `app.css`;
  - `src/shared`, `src/preload`, schema/file-system/channels, stores;
  - `tests/e2e`, `tests/contract`, `tests/fixtures`, renderer helpers/setup/stores;
  - `riff-chunks.ts`, `riff-info-nul.test.ts`, `metadata.test.ts`.
- Source-ის hash ჩემი phase-ის დასაწყისში და ბოლოს იგივეა (`tree-hash-start.txt`).

## R46-2 red/green + mutants — PASS
Temp copy `/tmp/c46base`: `git archive c822d7f`, A-ს 7 ტესტ-ფაილი, `node_modules` symlink.
- **Main** (`r46-2-red-main.log`): 9 failed / 13 passed.
  - RED: (n1), (n2), (n3), (n5 'abc'), (n6 clear), (n6 year 0), (n7), (n8), (n9).
  - GREEN: (n4), (n5 '0\0'), (e6) retitled და empty-values-ის ყველა 11.
- **Renderer** (`r46-2-red-renderer.log`): 6 failed / 117 passed.
  - RED: (r1), (r2), (r4), file-row-display `zero`, `negative number` და `typed 0`.
  - GREEN on baseline: (r3) (იხ. Process notes) და (r5).
- **Mutants** (A-ს tree-ს ასლი, სრული main და renderer suite; logs `r46-2-M*.log`):
  - M1 (`getDefaultValue` number→0) მოკლა (n9).
  - M1b (absent RIFF number→0) მოკლეს (n1), (n2), (n3).
  - M2 (empty onChange→0) მოკლა (r2).
  - M3 (badge `> 0`) მოკლა 3 file-row-display case-მა.
  - M4 (number `''` არ ითვლება empty-ად) მოკლეს (n2), (n3), (n6 clear), (n7), (n8) და riff-info-nul (f).
  - M5 (standard getter ინარჩუნებს 0-ს) მოკლეს (n1) და (n6)×2.
  - control: 120/120 და 326/326.
  - ყველა mutant მოკლულია.

## R46-3 gate — PASS (`verify.log`, `e2e-retries0.log`)
- `verifyCommand`: exit 0.
  - Biome: 0 errors, 8 warnings.
  - renderer **326/326** (320 + 6), main **120/120** (109 + 11).
  - build OK, E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0`: **7/7**, exit 0.

## R46-4 real app: unset custom number არ იწერება (C-R6-01) — PASS
Built app, Playwright `_electron`, `xvfb-run`, temp `XDG_CONFIG_HOME`. Customize Fields → Take, Number, auto ID → Done. Schema: `{key:take,type:number,riffChunkId:TAKE}`.
- ffmpeg-ის ახალ WAV-ზე (`a4`) მხოლოდ Title `R46` → Save. Toast `Tags saved`.
- raw INFO = `{ISFT, INAM:R46}`. ffprobe `title:R46`, `TAKE` არ არის. music-metadata (exif) `INAM:R46`, `TAKE` არ არის. size-0 sub-chunk არ არის.
- Take input ხელახალი არჩევის შემდეგ ცარიელია (placeholder `0`). ეს probe-ის `inputValue()`-მ ჩაწერა.
  - `r46-4-after-a.png` აჩვენებს Title `R46`-სა და Tagged-ს, მაგრამ Take viewport-ის ქვემოთაა.
  - ცარიელი Take dimmed `0` placeholder-ით ჩანს `r46-6-single-after-a.png`-ში.
- **Contrast c822d7f build** (`r46-results-base.json`, `r46-4-after-base.png`): იგივე ნაბიჯები წერს `TAKE='0'`-ს სამივე reader-ში. ბაგი გამოსწორებულია.

## R46-5 real app: აკრეფილი 0 იწერება და ჩანს — PASS
- `a5`-ზე Take-ში აკრეფილია `0` → Save. Toast `Tags saved`.
- raw `TAKE` size **1**, payload `'0'`. ffprobe `TAKE:"0"`, mm `TAKE:"0"`.
- სხვა ფაილზე გადასვლის და დაბრუნების შემდეგ Take = `0`. მწკრივი **Tagged**-ია (save-მდე Tagged არ იყო; u1 Tagged არ არის).
- Screenshots (Deviation 2, Saba-სთვის):
  - `r46-5-zero-a.png`: Take-ში ნორმალური `0`, Track #-ში კი dimmed placeholder `0`. ორივე მდგომარეობა ერთ კადრში ჩანს.
  - `r46-6-single-after-a.png`: Take-ის ცარიელი მდგომარეობა, dimmed placeholder `0`-ით.
  - `r46-5-empty-placeholder-a.png`: save-მდე მდგომარეობა. აქ Take viewport-ის ქვემოთაა, ჩანს მხოლოდ Year/BPM/Track-ის placeholder `0`. Probe-მა Take input value `''` და placeholder `'0'` ჩაწერა.

## R46-6 real app: number-ის გასუფთავება — PASS
- **Single** (`s6`): UI-ით seed: Take `7`, ICAT `DOORWood`, ICMT `კარი`. სამივე reader-ში `TAKE=7`.
  - Take გასუფთავდა → Save. `TAKE` სამივე reader-ში აღარ არის. ICAT და ICMT უცვლელია.
  - Input ცარიელია (`r46-6-single-before-a.png` / `-after-a.png`).
- **Batch** (`b1` ICAT `DOORWood`, `b2` ICAT `GLASBrk`, ორივეს Take `7`, UI-ით seeded):
  - არჩეულია ორივე. Take ცარიელია, placeholder `Multiple values`.
  - აკრეფილია `1`, შემდეგ Backspace → `Save to 2 files`. Toast **`Tags saved to 2 files`** (`r46-6-batch-after-a.png`).
  - ორივე ფაილს `TAKE` მოეხსნა და თავისი ICAT დარჩა (raw, ffprobe და mm).
- 6 არაარჩეული ფაილი byte-identical-ია (sha256). `pageErrors` = [] და `consoleErrors` = [].

## R46-7 standard Year (FYI, Deviation 1) — ჩაწერილია
- Year `2024` → raw `ICRD=2024`, ffprobe `date=2024`, mm `ICRD=2024`.
- გასუფთავების შემდეგ ICRD სამივე reader-ში აღარ არის, input ცარიელია.
- Year `0` → არაფერი იწერება. ხელახალი წაკითხვის შემდეგ input ცარიელია (probe `inputValue`). ეს ბიბლიოთეკის ზღვარია და მოსალოდნელია.

## R46-8 docs — PASS
- `recording-tag-contract.md` შეიცავს ყველა მოთხოვნილ პუნქტს:
  - D-50 header-ში;
  - unset არ იწერება და გასუფთავება შლის;
  - typed `0` = `'0'`, importer-ისთვის ნამდვილი 0;
  - standard Year/Track/BPM 0-ს ვერ ინახავს;
  - ძველი `ITKN='0'`, migration-ის გარეშე;
  - `metadata-number-values.test.ts` და (e6)-ის ახალი wording.
- `WAV_METADATA.md` და `STATE_MANAGEMENT.md`-ს D-50 ხაზები აქვს. ტექსტი ქართულია, English technical terms-ით.

## შენიშვნები B-სთვის (არა ბაგი)
- music-metadata ICMT `კარი`-ს latin1-ად კითხულობს (`a\u0003…`), ffprobe კი სწორად. ეს წინა რაუნდებიდან არსებული reader-ის ქცევაა და D-50-ს არ ეხება.
- code-reviewer-ის FYI-ები (`-`/`1.` ნაწილობრივი აკრეფა → `''`; `'abc'` ITKN იშლება Title-only save-ზე; `'0x10'`→16) spec-ის პირდაპირი შედეგია. C-მ ისინი real app-ში არ გამოსცადა.
