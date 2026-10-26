# Czaba Tag Manager — მოთხოვნები ლუპისთვის

2026-10-26 · Saba Shavidze · წყარო: ჩანაწერების ანალიზის ნაკადის რაუნდების გეგმა (`czaba-api/docs/plans/2026/quarter-IV/001-recording-analysis-pipeline.md`-ის დაზუსტება, არქიტექტორის მიერ კოდით შემოწმებული).

B ამ ფაილს მასალად კითხულობს და არა ინსტრუქციად. ქვემოთ T-0, T-1, T-2 ცალკეული, შემოწმებადი ეტაპებია; ფაილების სიები და ხაზების ნომრები 2026-10-26-ის კოდს ეყრდნობა და B მათ თავიდან ამოწმებს.

## მიზანი

Tag Manager-ით დაწერილი SFX ჩანაწერის კატეგორია (UCS CatID), keywords და აღწერა WAV-ში ფიქსირებულ, დოკუმენტირებულ ადგილას უნდა ჩაიწეროს, რომ CZABA-ს backend-ის იმპორტმა ისინი უცვლელად წაიკითხოს. კონტრაქტი: LIST/INFO `ICAT` / `IKEY` / `ICMT`.

## პრიორიტეტი და რიგი

1. **T-0** — Linux-ზე შემოწმებადი baseline. პირველია, რადგან სანამ ის არ დასრულდება, gate-ის verify ვერ გაივლის.
2. **T-1** — tag-კონტრაქტი. backend-ის K-4 რაუნდი მას ელოდება.
3. **T-2** — UCS CatID-ის არჩევა. UCS სიის ფაილს Saba ამზადებს ლიცენზიის დადასტურებით; მის გარეშე T-2 BLOCKED-ია.

## T-0-ს დამატებითი ფაქტი (root, 2026-10-26, Linux-ზე გაშვებით)

- `npx tsx tests/fixtures/create-fixtures.ts`-ის შემდეგ `npm run check` გადის: renderer 75/75, main 30/30.
- `xvfb-run -a npm run test:e2e`: 6-დან 5 გადის. ვარდება `tests/e2e/folder-workflow.spec.ts` „can read and write metadata via IPC“: `meta:write` → „WAV file is missing data chunk“. სპეციფიკაციის `createMinimalWav()` 44-ბაიტიან ფაილს წერს ცარიელი data chunk-ით. B ადგენს, fixture-ია არასწორი თუ writer-ი. ეს T-0-ის ნაწილია.
- Electron ამ გარემოში `--no-sandbox`-ის გარეშეც გაეშვა (root container). GitHub runner-ზე AppArmor-ის ქცევა გადასამოწმებელია.

## რა არ შედის

- Windows/macOS-ის build და installer (ღრუბელში მიუწვდომელია).
- backend-ის import tool და ბაზა — ცალკე ნაკადია Saba-ს PC-ზე.
- ახალი npm დამოკიდებულებები: საჭიროებისას BLOCKED, პაკეტის, ლიცენზიისა და მიზეზის მითითებით.

---

## 0. კოდიდან დადასტურებული ფაქტები (ყველა რაუნდის საფუძველი)

### 0.1 რას წერს Tag Manager და რას კითხულობს ffprobe (კითხვა 1)

**კოდი:**
- სტანდარტული ველები იწერება `file.tag`-ის (CombinedTag) property-ებით — `src/main/ipc/metadata.ts:25-95` (`STANDARD_PROP_MAP`), ჩაწერა `:154-161`.
- custom ველები და `keywords` იწერება **მხოლოდ RIFF `LIST/INFO`-ში**, `InfoTag.setValuesFromStrings(riffChunkId, …)` — `metadata.ts:164-185`. `InfoTag` თუ არ არსებობს, `tag.title`-ის მინიჭებით იქმნება (`:170-174`).
- `keywords` = `riffChunkId: 'IKEY'`, `type: 'text'` — `src/shared/types.ts:32`. `publisher` და `isrc`-ს `riffChunkId` არ აქვს (`types.ts:28-29`) → მხოლოდ ID3.
- custom ველის RIFF ID მომხმარებლის schema-დან მოდის (`app.getPath('userData')/schema.json`, `src/main/ipc/schema.ts:9-35`). ავტომატური ID = ველის სახელის პირველი 4 ასო (`src/renderer/src/lib/utils.ts:24-31`) — „Category" → `CATE`. ანუ **დღეს category-სთვის სტაბილური კონტრაქტი არ არსებობს**.

**ექსპერიმენტი** (Tag Manager-ის ჩაწერის ზუსტი გამეორება, `exp.mjs`):
- შენახვის შემდეგ ფაილში ოთხი tag-ბლოკია: `id3 ` chunk (ID3v2.4), `LIST/INFO`, `LIST/MID ` (MovieId), `IDVX` (DivX), + `JUNK` 1024 B. **`data` chunk ბაიტ-იდენტურია** (sha256 შემოწმდა), არსებული `bext` და `iXML` chunk-ები რჩება (`exp3.mjs`). **BEXT და iXML-ში Tag Manager არაფერს წერს.**
- `ffprobe -show_entries format_tags` კითხულობს ID3-ს, INFO-ს და bext-ს ერთ dictionary-ში:
  | Tag Manager ველი | chunk/frame | ffprobe key |
  |---|---|---|
  | title | ID3 `TIT2` + INFO `INAM` | `title` |
  | artists | ID3 `TPE1` + INFO `IART`/`ISTR` | `artist` (+ `ISTR`) |
  | album | ID3 `TALB` + INFO `IPRD` | `album` |
  | genres | ID3 `TCON` + INFO `IGNR` | `genre` |
  | comment | ID3 `COMM` + INFO `ICMT` | `comment` |
  | keywords | **მხოლოდ** INFO `IKEY` | `IKEY` |
  | publisher / isrc | მხოლოდ ID3 `TPUB` / `TSRC` | `publisher` / `TSRC` |
  | custom (მაგ. `ICAT`) | INFO, ნებისმიერი 4-ასოიანი ID | raw key, მაგ. `ICAT` ✔ |
- **სამი ხაფანგი, რის გამოც importer-მა ffprobe-ის `format_tags` არ უნდა გამოიყენოს:**
  1. **multi-value იკარგება:** `genres=['DOORWood','DOORMetal']` → ffprobe `genre: DOORMetal`; `artists=['A','B']` → `artist: A` (`exp2.mjs`).
  2. **bext description → `comment`:** recorder-ის ფაილში (Sound Devices-ის `bext`) ICMT-ის გარეშე ffprobe-ის `comment` = bext-ის ტექსტი (`exp3.mjs`). ICMT-ის ჩაწერისას INFO იმარჯვებს (`exp4.mjs`), მაგრამ ffprobe წყაროს ვერ განასხვავებს → recorder-ის ნაგავი (`sSPEED=…`) შეიძლება Description-ად გამოქვეყნდეს.
  3. **კოდირება:** node-taglib-sharp INFO-ს UTF-8-ით წერს; music-metadata იმავე ბაიტებს latin1-ად კითხულობს (mojibake ქართულზე, `exp2.mjs`). ffprobe raw ბაიტებს აბრუნებს (სწორია UTF-8-ზე, სხვა პროგრამის cp1252 INFO-ზე — არა).
- **დასკვნა:** round-trip მუშაობს INFO-ში ერთი მნიშვნელობის string-ზე. Importer-მა `LIST/INFO` თავად უნდა წაიკითხოს (~40 ხაზი Node, დამოკიდებულების გარეშე, UTF-8 fatal → latin1 fallback). საჭირო Tag Manager ცვლილება: **ფიქსირებული სტანდარტული ველი `category` → INFO `ICAT`** (+ UCS CatID-ის არჩევა/ვალიდაცია), Description = `comment` (`ICMT`), keywords = `IKEY`, ერთი string, `,`/`;` გამყოფით. ICMT-ის ID3 ასლი დამატებითია და importer მას არ კითხულობს.


---

## 2. Tag Manager — ახალი cloud loop (Linux GitHub Actions, Windows/SQL Server არ არის)

**საერთო:** ვერიფიკაცია მხოლოდ `npm ci && npm run check` (Biome `src/` + `tsc --noEmit` + Vitest renderer/main) და `npm run build && xvfb-run -a npx playwright test`. WAV fixture-ები ტესტში გენერირდება. Primitives: `WAV_METADATA.md`, `ELECTRON_IPC.md`, `TESTING.md`, `TYPESCRIPT_STRICT.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `GIT_RULES.md`. ყველა T-რაუნდში გაყინულია: `.github/workflows/release.yml`, `package.json`-ის `version` და `build` ბლოკი, `electron-builder` კონფიგი, `src/preload/*` (თუ რაუნდი სხვას არ ამბობს), დიზაინ-ტოკენები.

### T-0 — Linux-ზე შემოწმებადი baseline
- **მიზანი:** სუფთა clone-ზე `check` და E2E მწვანეა; C-ს აქვს გასაშვები workflow.
- **ფაქტები:** `tests/main/metadata.test.ts:26,77-78,95-96` აკოპირებს `tests/fixtures/sample.wav`-ს, რომელიც `.gitignore`-შია და მას არცერთი script/config არ აგენერირებს (`create-fixtures.ts` ხელით ეშვება) → **სუფთა clone-ზე main-ის ტესტები ENOENT-ით ვარდება** (დასკვნა კოდიდან; ამ სესიაში არ გაშვებულა). CI-ში მხოლოდ `release.yml`-ია (Windows/mac build, check-ის გარეშე). E2E Electron-ს `--no-sandbox`-ის გარეშე უშვებს (`tests/e2e/*.spec.ts`); ubuntu-24.04-ზე AppArmor-ის გამო Electron-ის sandbox ხშირად ვარდება — **გადასამოწმებელი**.
- **ფაილები:**
  - `vitest.config.main.ts` (`globalSetup`);
  - ახალი `tests/main/global-setup.ts` (ან `create-fixtures.ts` → ექსპორტირებული ფუნქცია; `__dirname` ESM-ში არ არსებობს — შეამოწმეთ);
  - `tests/fixtures/create-fixtures.ts`;
  - `tests/e2e/app-launch.spec.ts`, `tests/e2e/folder-workflow.spec.ts` — მხოლოდ launch args (`--no-sandbox` Linux CI-ზე);
  - ახალი `.github/workflows/check.yml` (ubuntu-latest, Node 22, `npm ci`, `npm run check`, `npm run build`, `xvfb-run -a npx playwright test`, `apt-get install -y ffmpeg` — T-1-ის cross-check-ისთვის);
  - ახალი `docs/plans/NNN-recording-tag-contract.md` (rule `plan-to-docs.md`).
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | T0-1 | სუფთა clone (`git clean -xfd`), `npm ci && npm run check` | 0 error, ყველა ტესტი გადის; `tests/fixtures/sample.wav` ავტომატურად შეიქმნა | workflow-ის ლოგი |
  | T0-2 | `npm run build && xvfb-run -a npx playwright test` | 2 spec, ყველა გადის, retry-ის გარეშე | Playwright report |
  | T0-3 | red proof: `globalSetup`-ის დროებით ამოღება | main ტესტები ENOENT-ით ვარდება | ლოგი |
  | T0-4 | `release.yml`, `src/**` | ბაიტ-იდენტური | `git diff --stat` |
- **რეგრესია:** `npm ci`-ის `postinstall` (`electron-builder install-app-deps`) Linux-ზე; Playwright-ის `retries: 1` ფლეიკს მალავს — C ამოწმებს, რომ პირველივე ცდაზე გადის.
- **ღია:** workflow Tag Manager-ის repo-შია (default) თუ ახალ `czaba-tagmanager-loop` repo-ში (როგორც `czaba-studio-loop`). Default: check.yml Tag Manager-ის repo-ში, loop-ის მეხსიერება ცალკე repo-ში.

### T-1 — ჩანაწერის tag-კონტრაქტი (ტეგების ჩაწერა, რომელსაც K-4 კითხულობს)
- **მიზანი:** ფიქსირებული სტანდარტული ველი `category` → INFO `ICAT`; `keywords` (`IKEY`) და `comment` (`ICMT`) round-trip ტესტებით; ჩაწერა აუდიოს და recorder-ის chunk-ებს არ ცვლის.
- **დამოკიდებულება:** T-0.
- **ფაილები:**
  - `src/shared/types.ts` (`STANDARD_FIELDS`-ში `{ key: 'category', label: 'Category (UCS)', type: 'text', riffChunkId: 'ICAT', standard: true }`);
  - `src/main/ipc/metadata.ts` (მხოლოდ თუ საჭიროა; `category` STANDARD_PROP_MAP-ში **არ** შედის — `keywords`-ის მსგავსად INFO path-ით);
  - `tests/main/metadata.test.ts`;
  - ახალი `tests/main/riff-chunks.ts` (ტესტის helper: RIFF chunk-ების სია + `LIST/INFO` → Map, დამოკიდებულების გარეშე);
  - ახალი `tests/main/recording-tag-contract.test.ts`;
  - ახალი `docs/recording-tag-contract.md` (ქართულად: ველი → chunk → importer-ის წესი; K-4-ის წყარო);
  - `.claude/primitives/WAV_METADATA.md` (ცხრილში `ICAT`).
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | T1-1 | write `{category:'DOORWood', keywords:'door, slam', comment:'მძიმე კარი'}` → raw RIFF parse | `LIST/INFO` შეიცავს `ICAT=DOORWood`, `IKEY=door, slam`, `ICMT` UTF-8 ბაიტებს | `recording-tag-contract.test.ts` |
  | T1-2 | იგივე → `meta:read` | სამივე ველი ზუსტად ბრუნდება | ტესტი |
  | T1-3 | `data` chunk-ის sha256 ჩაწერამდე/შემდეგ | ტოლია | ტესტი |
  | T1-4 | fixture `bext` + `iXML`-ით (ტესტში აწყობილი) → write | ორივე chunk ბაიტ-იდენტურია | ტესტი |
  | T1-5 | batch write მხოლოდ `category`-ით 2 ფაილზე | სხვა ველები უცვლელია | ტესტი |
  | T1-6 | CI-ში `ffprobe -show_entries format_tags` T1-1-ის ფაილზე | `ICAT`, `IKEY`, `comment` key-ები | workflow step-ის ლოგი |
  | T1-7 | Playwright: `window.api.writeMetadata` category-ით → `readMetadata` | `DOORWood` | `folder-workflow.spec.ts` (ან ახალი spec) |
  | T1-8 | red proof: `ICAT`-ის ამოღება `STANDARD_FIELDS`-იდან | T1-1, T1-2 ვარდება | ლოგი |
  | T1-9 | SchemaEditor-ში custom ველის შექმნა `ICAT` ID-ით | უარყოფილია „already in use" (`SchemaEditor.tsx:21-23,101-104`-ის არსებული ლოგიკა) | renderer ტესტი |
- **რეგრესია:** არსებულ მომხმარებელს `schema.json` უკვე აქვს → ახალი სტანდარტული ველი **ავტომატურად არ გამოჩნდება** (`schema.ts:23-35` STANDARD_FIELDS-ს მხოლოდ ფაილის არქონისას აბრუნებს); ის SchemaEditor-ის „disabled standards"-ში ჩანს (`SchemaEditor.tsx:38-39`). ძველ schema-ში custom ველი `ICAT`-ით → ორი ველი ერთ chunk-ზე.
- **ღია:** (1) `ICAT` (default; არასტანდარტული INFO ID, მაგრამ ffprobe raw-ად კითხულობს) vs `IGNR` (genre — მუსიკის ჟანრს ეჯახება, multi-value იკარგება) vs iXML `USER/CATID` (ინდუსტრიული, მაგრამ node-taglib-sharp არ წერს, ffprobe არ კითხულობს) vs `ISBJ`; (2) არსებული `schema.json`-ის migration (`category` ავტომატურად დამატება) — default: არა, მხოლოდ toggle + README შენიშვნა.

### T-2 — UCS CatID-ის არჩევა და ვალიდაცია
- **მიზანი:** `category` ველზე combobox UCS სიიდან (CatID + Category/SubCategory), უცნობი მნიშვნელობა save-ს ბლოკავს; batch-ში ერთი CatID ბევრ ფაილზე.
- **დამოკიდებულება:** T-1; UCS სიის ფაილი (იგივე sha256, რაც K-4-ში).
- **ფაილები:**
  - ახალი `src/shared/ucs-categories.json`;
  - ახალი `src/shared/ucs.ts` (`isUcsCatId`, `searchUcs(query, limit)`);
  - ახალი `src/renderer/src/components/metadata-editor/UcsCategoryInput.tsx` (forwardRef, Tailwind tokens);
  - `src/renderer/src/components/metadata-editor/MetadataPanel.tsx` (`key === 'category'` → `UcsCategoryInput`; `FieldType` union **არ** იცვლება, რომ `schema.ts:12-21` ვალიდაცია და ძველი schema-ები არ დაირღვეს);
  - ახალი `tests/renderer/utils/ucs.test.ts`, `tests/renderer/...UcsCategoryInput.test.tsx`;
  - ახალი `tests/e2e/ucs-category.spec.ts`.
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | T2-1 | `searchUcs('door')` | `DOOR*` CatID-ები პირველად, დეტერმინისტული რიგი, ≤ limit | unit |
  | T2-2 | `isUcsCatId('DOORWood')` / `('doorwood')` / `('')` | true / false / false | unit |
  | T2-3 | E2E: ფაილი → category ველში „door" → ArrowDown+Enter → Save → `readMetadata` | `ICAT` = არჩეული CatID | Playwright + main-side read |
  | T2-4 | E2E: ხელით `FOOBar` → Save | Save გათიშულია ან შეცდომა ჩანს; ფაილი უცვლელი (mtime + sha) | Playwright |
  | T2-5 | batch: 3 ფაილი → category → Save | 3/3 `ICAT`, სხვა `modifiedFields` არა (`WAV_METADATA.md` Save Flow §6) | Playwright + read |
  | T2-6 | კლავიატურა: Tab/Escape combobox-ში | ფოკუსი არ იკარგება, Escape ხურავს სიას | Playwright |
  | T2-7 | `src/shared/ucs-categories.json` sha256 | = czaba-api `tools/recording-import/ucs-categories.json` (K4-9) | hash |
- **რეგრესია:** `isDirty`/`skipSyncRef` (STATE_MANAGEMENT) — combobox-ის onChange ფორმას dirty-დ უნდა ნიშნავდეს; bundle-ის ზომა (~750 CatID, < 100 KB).
- **ღია:** ცარიელი category დასაშვებია (default: დიახ — ყველა ფაილი SFX არ არის).

---

