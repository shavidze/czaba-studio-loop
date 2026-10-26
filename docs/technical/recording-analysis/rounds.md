# ჩანაწერების ანალიზი და მეტამონაცემები — რაუნდების გეგმა (B → A → C)

| Field | Value |
|---|---|
| **სტატუსი** | `draft` — დაგეგმვა, კოდი არ შეცვლილა |
| **თარიღი** | 2026-10-26 |
| **წყარო** | `/mnt/user-data/outputs/001-recording-analysis-pipeline.md` (Saba-ს draft) |
| **შემოწმებული repo-ები** | `/home/claude/czaba-api` (HEAD `7792aca`), `/home/claude/czaba-tag-manager` (HEAD `acefccc`), `/home/claude/czaba-store` (**git repo არ არის** — შეიძლება ჩამორჩეს Studio-ს loop-ის HEAD `850445c`-ს) |
| **ექსპერიმენტები** | node-taglib-sharp 6.x + ffmpeg/ffprobe 6.1.1 (Linux); სკრიპტები: `/tmp/claude-0/-home-claude/e616ebd9-a270-5248-a635-0ba2a0ffa4ab/scratchpad/taglib/exp*.mjs` |

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

### 0.2 არსებული loudness/onset/Description (კითხვა 2)
- **loudness/true peak/onset/sync point არსად ითვლება:** grep (`ebur128|loudnorm|lufs|truepeak|spectral flux|onset|syncpoint`) czaba-api-ში, store-ის `app/`-სა და Tag Manager-ის `src/`-ში → ნული (ერთადერთი დამთხვევა `demo-synth.test.ts:89`-ის სახელია). `app/lib/arrangement/hits.ts`, `sync-point.ts`, `library-search.ts` **არ არსებობს** — ისინი SRW-46a/47a/47b-ის ახალი ფაილებია, ხოლო `PHASE2B-SPOTTING` `queued_awaiting_user_go`-შია (`phase-2b-spotting.md`).
- **Description:** სვეტი არსებობს (`015_ProductRecording.sql:16` `NVARCHAR(1000) NULL`; entity `ProductRecording.cs:10`; mapping `CzabaDbContext.cs:126`), API აბრუნებს (`ProductRecordingService.cs:59`, `ProductRecordingResponse.cs:7`), store-ის ტიპშიც არის (`client.ts:265`). **Importer მას არ წერს:** `import-recordings.mjs:189-233`-ის MERGE-ში Description არ შედის → დღეს ყოველთვის `NULL`.

### 0.3 ნუმერაცია, DTO, კონფლიქტები (კითხვა 3)
- ამ clone-ში ბოლოა `017_SfxScene.sql` → **018 სწორია**. Migration-ები ხელით დაწერილი SQL-ია (`docs/database/scripts/migrations/`); `prompts/new-migration.md` EF `dotnet ef migrations`-ს აღწერს, მაგრამ repo-ში EF `Migrations/` საქაღალდე არ არსებობს — მიჰყევით 015/016/017-ის პრაქტიკას (idempotent `IF … IS NULL`, `SET XACT_ABORT ON`, ერთი transaction).
- **SfxScene:** `SfxSceneService.cs:73-120` ჩანაწერიდან იყენებს მხოლოდ `Id`-სა და `DurationMs`-ს; scene JSON ინახავს `recordingId`-ს. Nullable ველები კონფლიქტს არ ქმნის.
- **ლიცენზია:** SFX პროდუქტზე `IsRecordingCovered` ორივე ვარიანტის ჩანაწერს აბრუნებს (`ProductRecordingService.cs:130-135`); ანალიზი ვარიანტის მწკრივზეა (MERGE `ProductVariantId + SourceKey`-ით, `import-recordings.mjs:213`), ანუ Standard და Premium ცალ-ცალკე იზომება — სწორია. `original-access` ყოველთვის `premium-{SourceKey}.wav`-ს აბრუნებს (`:110`) — უცვლელია.
- **StorageKey/SourceKey:** ახალი ველები DTO-ში მათ არ ავლენს. Category, რომელიც ფაილის სახელიდან (= SourceKey) გამოიყვანება, მხოლოდ UCS სიით დადასტურებული CatID-ია; SourceKey-ის სხვა ნაწილი არ ჟონავს.
- **DTO:** `ProductRecordingResponse` არის `class` (არა record), `required Title` — ახალი ველები არჩევითი property-ებია; `SfxSceneServiceTests`/`SfxSceneService.cs:81-88` არ ირღვევა.

---

## 1. PC / backend რაუნდები (Saba-ს Windows PC: SQL Server, ffmpeg, local R2)

**საერთო წესები ყველა K-რაუნდისთვის**
- Primitives: `.claude/CLAUDE.md`, `MINIMAL_CONTROLLER.md`, `ERROR_TAXONOMY.md` (import SQL-ის THROW: 50001-50099 validation, 50301 not found), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `SECURITY_AUDIT.md`, `prompts/generate-table.md`, `prompts/new-dto.md`, `GEORGIAN_DOCS.md`.
- ვერიფიკაცია: `dotnet build` (0 error; არსებული NU1903 warning დასაშვებია), `dotnet test`, migration და import **ორჯერ**, scratch ბაზაზე (`CzabaDb_RecordingScratch`), გარე rollback-იან transaction-ში (როგორც `002-sfx-recording-catalog.md`). `upload` — მხოლოდ `--local --dry-run`.
- ყველა K-რაუნდში გაყინულია: `SfxSceneService.cs`, `DownloadService`, `ProductRecordingsController.cs` (endpoint-ები არ იცვლება), migration-ები 001–017, `Czaba.Api/Program.cs`, appsettings, ყველა სხვა entity.
- Implementation doc: `docs/implementation/2026/quarter-IV/006-…` (შემდეგი ნომერი; 001–005 არსებობს).

### K-1 — spike: გაუქმებულია როგორც agent-რაუნდი
კითხვა „რომელ chunk-ში და კითხულობს თუ არა ffprobe" §0.1-ში ექსპერიმენტით არის პასუხგაცემული. დარჩენილი ორი რამ რაუნდი არ არის:
- **H-1 (ადამიანი, Saba, ~15 წთ):** 10 ნამდვილ ჩანაწერზე პირველი დარტყმის ხელით მონიშვნა DAW-ში → `tools/recording-import/fixtures/sync-reference.json` (`sourceKey`, `hitMs`, `note`). საჭიროა მხოლოდ K-3b-სთვის.
- PC-ის ffmpeg-ის ვერსიის და Tag Manager-ის ფაილის PC-ზე წაკითხვის დადასტურება → K-4-ის მიღების მწკრივი (K4-6).

### K-2 — სქემა და API (ეტაპი A)
- **მიზანი:** 018 migration, entity, mapping, DTO; API ახალ ველებს აბრუნებს (ჯერ ყველა `NULL`).
- **დამოკიდებულება:** არცერთი.
- **ფაილები (A ფლობს):**
  - ახალი `docs/database/scripts/migrations/018_ProductRecording_Analysis.sql`;
  - `Czaba.Domain/Entities/ProductRecording.cs`;
  - `Czaba.Persistence/Database/CzabaDbContext.cs` — მხოლოდ `ProductRecording` ბლოკი (`:120-131`);
  - `Czaba.Application/DTOs/Recordings/ProductRecordingResponse.cs`;
  - `Czaba.Application/Services/ProductRecordingService.cs` — მხოლოდ projection (`:55-65`);
  - `Czaba.Application.Tests/Services/ProductRecordingServiceTests.cs`;
  - ახალი `docs/implementation/2026/quarter-IV/006-recording-analysis-schema.md`.
- **გაყინული:** `import-recordings.mjs` (ამ რაუნდში ახალი სვეტები NULL რჩება), დანარჩენი — საერთო სიის მიხედვით.
- **ჩონჩხი:**
  ```sql
  -- 018: ALTER TABLE ADD და იმავე batch-ში CHECK ახალ სვეტზე = "Invalid column name" (batch კომპილირდება ADD-მდე).
  -- ამიტომ constraint-ები EXEC(N'...')-ით ან ცალკე GO batch-ით.
  Category        NVARCHAR(32)  NULL  CK: NULL OR (LEN BETWEEN 2 AND 32 AND NOT LIKE '%[^A-Za-z0-9]%')
  Keywords        NVARCHAR(400) NULL
  LoudnessLufs    DECIMAL(4,1)  NULL  CK: NULL OR BETWEEN -70.0 AND 10.0
  TruePeakDbtp    DECIMAL(4,1)  NULL  CK: NULL OR BETWEEN -100.0 AND 20.0
  SyncPointMs     INT           NULL  CK: NULL OR (>= 0 AND <= DurationMs)
  AnalysisVersion INT           NULL  CK: NULL OR >= 1
  ```
  ```csharp
  public string? Category { get; set; }
  public IReadOnlyList<string> Keywords { get; set; } = [];   // DB string → Split(',', Trim|RemoveEmpty)
  public decimal? LoudnessLufs { get; set; }
  public decimal? TruePeakDbtp { get; set; }
  public int? SyncPointMs { get; set; }
  ```
  `AnalysisVersion` API-ში **არ** ბრუნდება (შიდა ველია). EF: `HasMaxLength(32)`, `HasMaxLength(400)`, `HasPrecision(4,1)`.
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | K2-1 | `sqlcmd -b -i 018…sql` ორჯერ scratch-ზე, გარე `BEGIN TRAN … ROLLBACK` | ორივე გაშვება 0 შეცდომა; მეორე არაფერს ცვლის | `sys.columns` + `sys.check_constraints` შედეგის ასლი ანგარიშში, ორივე გაშვების შემდეგ |
  | K2-2 | 018 ბაზაზე 10 არსებული ჩანაწერით | რაოდენობა 10; ახალი სვეტები NULL | `SELECT COUNT(*), COUNT(Category) …` |
  | K2-3 | CHECK-ების დარღვევა: `Category='DOOR Wood'`, `LoudnessLufs=-80`, `SyncPointMs=DurationMs+1` | სამივე `INSERT/UPDATE` ვარდება 547-ით | sqlcmd გამოსავალი |
  | K2-4 | `dotnet test --filter ProductRecordingServiceTests` | ახალი ტესტები: ველები ბრუნდება; `Keywords` NULL → `[]`; `"a, b,,c"` → `["a","b","c"]` | ტესტის სახელები + რაოდენობა ანგარიშში |
  | K2-5 | JSON serialization ტესტი `ProductRecordingResponse`-ზე | `storageKey`, `sourceKey`, `analysisVersion` key-ები JSON-ში არ არის | `System.Text.Json`-ით serialize + `ContainKey` false |
  | K2-6 | არსებული უარყოფის ტესტები (სხვისი პროდუქტი, Standard-ის ლიცენზია) | უცვლელად გადის | სრული `dotnet test` (ბაზისი: 404 ტესტი) |
- **რეგრესიის რისკი:** GO/EXEC-ის გარეშე migration პირველივე გაშვებაზე ვარდება; `decimal`-ის precision-ის გარეშე EF warning; `Keywords`-ის split-ის ლოგიკის გამეორება store-ში.
- **ღია გადაწყვეტილებები:** (1) `Keywords` API-ში `string[]` (default) თუ raw string; (2) LUFS/TP `DECIMAL(4,1)` (default; ebur128 0.1 სიზუსტით ბეჭდავს) თუ draft-ის `(5,2)`.

### K-3a — ხმამაღლობა `prepare`-ში (ეტაპი B, ნაწილი 1)
- **მიზანი:** `prepare` ზომავს integrated LUFS-ს და true peak-ს წყარო-ფაილზე (არა m4a-ზე), წერს manifest-ში და `recordings.sql`-ში; MERGE ხდება NULL-safe.
- **დამოკიდებულება:** K-2.
- **ფაილები:**
  - `tools/recording-import/import-recordings.mjs`;
  - ახალი `tools/recording-import/analysis.mjs` (სუფთა ფუნქციები: `parseEbur128Summary(stderr)`, `normalizeLoudness({ durationMs, i, peak })`);
  - ახალი `tools/recording-import/analysis.test.mjs` (`node --test`, ffmpeg-ის გარეშე, stderr-ის fixture string-ებით);
  - ახალი `docs/implementation/2026/quarter-IV/007-recording-loudness-import.md`.
- **გაყინული:** ყველა C# ფაილი, 018, `upload()`-ის ლოგიკა (`:235-258`).
- **ფაქტები:** ebur128-ის summary stderr-ზე info დონეზე იბეჭდება — არსებული `run()` (`:55-60`) მხოლოდ stdout-ს აბრუნებს და `-loglevel error` summary-ს მალავს; საჭიროა stderr-ის დამბრუნებელი ვარიანტი. გაზომილი: < 400 ms ფაილი → `I: -70.0 LUFS` (შეცდომის გარეშე), სიჩუმე → `-70.0` და `Peak: -inf dBFS`.
- **წესი:** `durationMs < 400` ან `I <= -70.0` → `LoudnessLufs = NULL`; `-inf` → `TruePeakDbtp = NULL`; `AnalysisVersion = 1` ყველა გაანალიზებულ მწკრივზე (`NULL` LUFS-ის შემთხვევაშიც — „გაზომილია, შედეგი არ არის" ≠ „არ გაზომილა").
- **MERGE:** `target.X <> source.X` (`:214-218`) NULL-ზე UNKNOWN-ს იძლევა → NULL→მნიშვნელობა არასოდეს განახლდება. გამოიყენეთ `WHEN MATCHED AND NOT EXISTS (SELECT target.<cols> INTERSECT SELECT source.<cols>)` (ყველა ვერსიაზე მუშაობს; `IS DISTINCT FROM` მხოლოდ SQL Server 2022-ია). `USING`-ში ახალი სვეტები `CAST(… AS DECIMAL(4,1))`, რომ ყველა-NULL `VALUES` სვეტი `int`-ად არ დაიტიპოს.
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | K3a-1 | `node --test tools/recording-import/` | parse-ის ტესტები: ჩვეულებრივი, `-70.0`, `-inf`, < 400 ms, დაზიანებული stderr → მკაფიო შეცდომა | ტესტების რაოდენობა |
  | K3a-2 | `prepare` ნამდვილ Mall Premium ZIP-ზე (10 ფაილი, 96 kHz/24-bit/stereo) | manifest-ში 10 × `loudnessLufs`, `truePeakDbtp`, `analysisVersion: 1` | manifest-ის ამონარიდი |
  | K3a-3 | დამოუკიდებელი გაზომვა: `ffmpeg -i <wav> -af ebur128=peak=true -f null -` ხელით, 10 ფაილზე | manifest = ffmpeg ±0.1 LU / ±0.1 dB | ცხრილი ანგარიშში (ffmpeg-ის ვერსიით) |
  | K3a-4 | სინთეზური ფაილები: 1 kHz −24 dBFS 1 წმ, 200 ms, სიჩუმე | −27.0±0.1 LUFS; NULL; NULL/NULL | ffmpeg lavfi-ით გენერირებული, `node --test` |
  | K3a-5 | `recordings.sql` ორჯერ scratch-ზე, rollback-ით | პირველი: 10 `UPDATE` (NULL→მნიშვნელობა); მეორე: 0 `OUTPUT` მწკრივი | `$action` გამოსავალი |
  | K3a-6 | prepare → სხვა LUFS-ით ხელით შეცვლილი manifest → SQL | ერთი `UPDATE` | sqlcmd |
  | K3a-7 | `upload --local --dry-run` | იგივე 10 key; m4a-ები ბაიტ-იდენტურია წინა გაშვებისას (ანალიზი encode-ს არ ცვლის) | sha256 სია |
- **რეგრესია:** prepare-ის დრო (10 × 96 kHz ფაილი — დამატებითი decode; ჩაწერეთ წამები); მოსმენის ასლების `-map_metadata -1` (`:164`) უცვლელი უნდა დარჩეს.
- **ღია:** ზღვარი 400 ms (default, BS.1770-ის gating block) თუ უფრო გრძელი.

### K-4 — ადამიანის ველები: INFO tags + UCS (ეტაპი C)
- **მიზანი:** importer კითხულობს `LIST/INFO`-ს `ICAT`/`IKEY`/`ICMT`-ს, ამოწმებს CatID-ს UCS სიით, ცდის UCS fallback-ს ფაილის სახელიდან, წერს Category/Keywords/Description-ს.
- **დამოკიდებულება:** K-3a (NULL-safe MERGE); **Tag Manager T-1 merged** (`ICAT` კონტრაქტი); UCS სიის ფაილი ერთი ვერსიით (T-2-თან საერთო sha256).
- **ფაილები:**
  - `tools/recording-import/import-recordings.mjs`;
  - ახალი `tools/recording-import/riff-info.mjs` (`readRiffInfo(buffer) → Map<string,string>`; UTF-8 `fatal` → latin1 fallback; მხოლოდ `LIST/INFO`; ID3/bext იგნორირდება);
  - ახალი `tools/recording-import/ucs.mjs` (`isUcsCatId`, `catIdFromSourceKey`);
  - ახალი `tools/recording-import/ucs-categories.json` (`{ version, source, catIds[] }`);
  - `tools/recording-import/analysis.test.mjs` ან ახალი `tags.test.mjs`;
  - ახალი fixture-ები `tools/recording-import/fixtures/` (ტესტში გენერირებული WAV-ები; ერთი Tag Manager-ით დაწერილი ფაილი — < 50 KB);
  - ახალი `docs/implementation/2026/quarter-IV/008-recording-tags-ucs.md`.
- **გაყინული:** C# ფაილები, 018, `upload()`.
- **წესები (B-ის გადაწყვეტილებები, Saba-ს ვეტოთი):**
  - Category: `ICAT` (trim) → უცნობი CatID **აჩერებს** `prepare`-ს (`ERROR: <sourceKey>: unknown UCS CatID "<x>" (list v<ver>)`). `ICAT` ცარიელია → fallback: ჩამოვაჭრათ `^\d{1,4}_` (`readPosition`-ის პრეფიქსი), პირველი `_`-მდე token, **ზუსტი, case-sensitive** დამთხვევა სიასთან; დამთხვევის გარეშე → `NULL`, შეცდომის გარეშე (წინააღმდეგ შემთხვევაში ყველა არსებული `ShoppingMall_…` ფაილი ჩავარდებოდა).
  - Keywords: `IKEY` → split `[,;]`, trim, lowercase, dedupe, join `", "`; > 400 სიმბოლო → შეცდომა (ჩუმი truncate არა).
  - Description: მხოლოდ `ICMT` (არა bext, არა ID3 COMM), control სიმბოლოები `\n`-ის გარდა იშლება; > 1000 → შეცდომა.
  - manifest-ში თითო ველს აქვს `…Source: "tag" | "filename" | null` — ადამიანი upload-მდე ხედავს წარმომავლობას.
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | K4-1 | `riff-info` ტესტები: INFO UTF-8 ქართული, cp1252 INFO, INFO-ს გარეშე, კენტი ზომის chunk + pad byte, დაზიანებული ზომა | სწორი Map; დაზიანებულზე მკაფიო შეცდომა, crash არა | `node --test` |
  | K4-2 | fixture: `bext` description + ICMT-ის გარეშე | Description = NULL (bext არ ჟონავს) | ტესტი |
  | K4-3 | Tag Manager-ით (T-1-ის build) დაწერილი ფაილი: `category=DOORWood`, keywords `door, slam`, comment ქართულად | manifest: `DOORWood`, `door, slam`, ქართული ტექსტი ბაიტ-ზუსტად; `categorySource: "tag"` | manifest + SQL scratch-ზე → `SELECT` |
  | K4-4 | ფაილი `DOORWood_SlamHeavy_CZB_Test.wav`, ტეგის გარეშე | `DOORWood`, `categorySource: "filename"` | ტესტი |
  | K4-5 | `ICAT=DOORWOOD` (არასწორი რეგისტრი) და `ICAT=FOOBar` | `prepare` ჩერდება შეტყობინებით, exit 1, manifest არ იწერება | stderr ასლი |
  | K4-6 | იგივე Tag Manager ფაილი PC-ზე: `ffprobe -show_entries format_tags` | `ICAT`, `IKEY`, `comment` ჩანს (§0.1-ის Linux-ის შედეგის დადასტურება PC-ის ffmpeg-ით) | გამოსავალი + `ffmpeg -version` |
  | K4-7 | ნამდვილი Mall ZIP (ტეგების გარეშე) prepare + SQL ორჯერ | Category/Keywords/Description NULL, 0 შეცდომა; მეორე გაშვება 0 ცვლილება | `$action` |
  | K4-8 | SQL injection: ICMT = `'; DROP TABLE x;--` და `N'` | ტექსტი უცვლელად ინახება, SQL არ იშლება | scratch `SELECT` |
  | K4-9 | `ucs-categories.json` sha256 = Tag Manager-ის `src/shared/ucs-categories.json` sha256 | ტოლია | ორივე hash ანგარიშში |
- **რეგრესია:** `SOURCE_KEY_PATTERN` (`:7`) space-ს არ უშვებს → სტანდარტული UCS სახელები (`DOORWood_Door Slam_…`) **დღესვე** უარყოფილია — ეს რაუნდი pattern-ს **არ** აფართოებს (SourceKey-ის ფორმა `original-access`-ის ვალიდაციასაც ეხება, `ProductRecordingService.cs:102`); fallback მხოლოდ space-ის გარეშე სახელებზე მუშაობს.
- **ღია:** (1) UCS სიის ლიცენზია/წყარო repo-ში ჩასადებად — **Saba-ს დასადასტურებელი**; default: მხოლოდ CatID-ების სია, ვერსია და წყაროს URL; (2) ცარიელი ტეგი ხელახალ იმპორტზე DB-ის მნიშვნელობას შლის — default: დიახ, ფაილები სიმართლის წყაროა (manifest-ის review-ით).

### K-3b — sync point (ეტაპი B, ნაწილი 2)
- **მიზანი:** `SyncPointMs` = პირველი დარტყმა პირველ 2 წამში; დარტყმის გარეშე `0`.
- **დამოკიდებულება:** H-1 (`sync-reference.json`); **SRW-46a done** (`hits.ts` და მისი ტესტ-ვექტორები) — draft ამბობს „ემთხვევა hits.ts-ს", მაგრამ ფაილი ჯერ არ არსებობს. default: K-3b ელოდება SRW-46a-ს და გადმოაქვს მისი პარამეტრები + ვექტორები (JSON ფაილის ასლი sha256-ით), არა პირიქით.
- **ფაილები:** `analysis.mjs` (`firstHitMs(samples, sampleRate)`), `import-recordings.mjs` (ffmpeg → `-ac 1 -ar 48000 -f f32le -t 2 pipe:1`), ახალი `tools/recording-import/fixtures/hits-vectors.json` (SRW-46a-ის ასლი), `fixtures/sync-reference.json`, ტესტები, doc `009-…`.
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | K3b-1 | იგივე ვექტორები, რაც store-ის `hits.ts`-ის ტესტში | ყველა ვექტორზე იგივე პასუხი ±1 ms | `node --test` + vectors sha256 = store-ის ასლი |
  | K3b-2 | 10 ჩანაწერი vs `sync-reference.json` | ≥ 9/10 ±10 ms | ცხრილი |
  | K3b-3 | სინთეზური: სიჩუმე, თანაბარი ხმაური, დარტყმა 2.5 წმ-ზე | `0`, `0`, `0` | ტესტი |
  | K3b-4 | **m4a vs WAV:** იგივე ალგორითმი ffmpeg-ით დეკოდირებულ playback m4a-ზე | სხვაობა ≤ 2 ms (ffmpeg edit list-ს ითვალისწინებს) | ცხრილი |
  | K3b-5 | import ორჯერ | მეორე — 0 ცვლილება | `$action` |
- **რეგრესია / ღია რისკი:** AAC encoder priming = 1024 sample (გაზომილი: პირველი packet `pts=-0.021333`). ბრაუზერის `decodeAudioData` MP4 edit list-ს შეიძლება არ ითვალისწინებდეს → Studio-ში ~21 ms წანაცვლება. ეს **PC-ზე ვერ შემოწმდება** — S-1-ის მწკრივია.
- **ღია:** სჭირდება თუ არა საერთოდ შენახული SyncPointMs, თუ SRW-47a მას ყოველ ჩატვირთვაზე ითვლის. default: სვეტი 018-შია (იაფია), შევსება K-3b-მდე გადადებულია.

### K-6 — AI შეთავაზებები, არჩევითი (ეტაპი D)
- **დამოკიდებულება:** K-4 (UCS სია), Saba-ს ნებართვა (CLAP-ის სასწავლო მონაცემების ლიცენზია; `laion/larger_clap_general`-ის წონები Apache-2.0 — **ამ სესიაში არ გადამოწმებულა**).
- **ფაილები:** ახალი `tools/recording-analysis/` (Python, `requirements.txt` pinned, `suggest.py`, `README.md`), `import-recordings.mjs` — მხოლოდ `suggestions.json`-ის არჩევითი წაკითხვა manifest-ში `suggestedCategory`/`suggestedScore`-ისთვის.
- **მიღება:** K6-1 10 ხელით კატეგორიზებულ ჩანაწერზე სწორი CatID top-3-ში ≥ 7; K6-2 `recordings.sql`-ში `suggested*` არ ჩანს და `Category` იგივეა, რაც შეთავაზების გარეშე (diff); K6-3 manifest-ის ერთი და იგივე გაშვება დეტერმინისტულია (CPU, fixed seed).
- **ღია:** embedding-ების ფაილად შენახვა — default: არა (YAGNI, სემანტიკური ძიება ცალკე გეგმაა).

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

## 3. Studio loop (cloud; backend მიუწვდომელია)

### ფაქტი, რომელიც draft-ის ეტაპ E-ს ცვლის
`WorkspaceSource`-ს `meta` **არ აქვს** (`app/types/arrangement.ts:78-85`) — ის SRW-47b-ში ემატება (`phase-2b-spotting.md`, 47b). `app/lib/arrangement/collection.ts:47-82` (`createPurchasedWorkspaceCollection`) აწყობს **მხოლოდ მუსიკის stems**-ს (`stem.audioUrl`); შეძენილი SFX ჩანაწერები (`getProductRecordingCatalog`/`getSfxLibrary`) იტვირთება მხოლოდ `recordings.$productId.tsx`, `scenes.$productId.tsx` და `app/components/recordings/*`-ში. ანუ production-ში „ProductRecording → WorkspaceSource" ხიდი Studio-ში **დღეს არ არსებობს** (ადგილობრივ clone-ში; loop-ის HEAD-ზე გადასამოწმებელი). E არ არის „ველის მიბმა" — ის მოითხოვს შეძენილი SFX-ის კოლექციას Studio-ში, stream-access token-ებს და დაცული `studio.$productId.tsx`-ის ცვლილებას.

### S-1 (SRW-47c) — ჩანაწერის მეტამონაცემების mapping, fixture-ით
- **მიზანი:** სუფთა ფუნქცია API-ს ჩანაწერიდან `WorkspaceSource['meta']`-ში; `ProductRecording` ტიპი ახალ ველებს იცნობს; production-ის მიბმა — ცალკე, root-ის ნაბიჯი.
- **დამოკიდებულება:** SRW-47b `done` (`WorkspaceSource.meta`, `library-search.ts`); K-2-ის DTO-ს ფორმა გაყინული (JSON shape ამ დოკუმენტიდან). SyncPoint-ის მწკრივი — SRW-47a + K-3b.
- **ფაილები (grants):**
  - `app/services/api/client.ts` — მხოლოდ `ProductRecording` interface (`:262-271`): `category?: string | null; keywords?: string[]; loudnessLufs?: number | null; truePeakDbtp?: number | null; syncPointMs?: number | null`;
  - ახალი `app/lib/arrangement/recording-meta.ts` (`recordingToSourceMeta(recording): WorkspaceSource['meta'] | undefined` — ცარიელი სტრიქონები/მასივები `undefined`-ად; UCS CatID-ის ჩვენება როგორც `category`);
  - ახალი `app/lib/arrangement/__tests__/recording-meta.test.ts`;
  - ახალი fixture `app/data/__fixtures__/recording-catalog-analysis.json` (K-2-ის JSON shape, 3 ჩანაწერი: სრული, ნაწილობრივი, ძველი — ახალი ველების გარეშე);
  - implementation doc.
- **გაყინული / root-only:** `app/routes/studio.$productId.tsx` (**დაცული, root-only**), `api.studio-token.ts`, `collection.ts` (purchased SFX კოლექცია ცალკე feature-ია), `account.downloads.tsx`, `AuthContext.tsx`, `app/lib/auth.ts`, mock-api.
- **მიღება:**
  | ID | მოქმედება | მოსალოდნელი | შემოწმება |
  |---|---|---|---|
  | S1-1 | `recordingToSourceMeta` fixture-ის 3 ჩანაწერზე | სრული → `{description, category, keywords[]}`; ძველი → `undefined`; `null`/`""`/`[]` არასოდეს ჩანს meta-ში | vitest |
  | S1-2 | SRW-47b-ის `library-search` fixture-ის meta-თი: ძებნა „DOORWood"/„slam" | ჩანაწერი პოულობს category/keyword-ით; სათაურით ძებნის რანჟირება უცვლელი | vitest |
  | S1-3 | `/studio-lab` demo fixture S1-ის mapping-ით (თუ SRW-47b demo-ს იყენებს) | „ხმა აქ" პანელში შედეგი keyword-ით ჩანს | Playwright (browserVerified) |
  | S1-4 | `npm run typecheck`, `lint`, `test:run` | 0 error; warning-ები ბაზისზე არ იზრდება | ლოგი |
  | S1-5 | SyncPoint (მხოლოდ SRW-47a + K-3b-ის შემდეგ): synthetic m4a (1024-sample priming) `decodeAudioData` → `firstHit` vs `syncPointMs` fixture | სხვაობა ≤ 10 ms; თუ > 10, B წერს root-ისთვის: ბრაუზერი edit list-ს არ ითვალისწინებს | Chromium-ში გაზომვა |
- **რეგრესია:** `ProductRecording` ტიპს იყენებს `SfxSoundLibrary`, `SfxSceneBuilder`, `SfxQuickEdit`, `RecordingCatalogRow` — ველები არჩევითია, render უცვლელი.
- **Root-only ნაბიჯი (ბექლოგში, არა S-1-ში):** „Purchased SFX collection in Studio" — ახალი feature: `createPurchasedSfxCollection` + stream-access token + `studio.$productId.tsx`. Saba წყვეტს, სჭირდება თუ არა; მის გარეშე meta production-ში მხოლოდ `recordings`/`scenes` გვერდებზე გამოდგება (არა Studio-ში).

---

## 4. შესწორებები draft-ში (მტკიცებულებით)

1. **„იმპორტი ტეგებს `ffprobe -show_entries format_tags`-ით კითხულობს"** → არა. multi-value იკარგება, bext description `comment`-ად ჟონავს, წყაროს ვერ განასხვავებს (§0.1, `exp2-4.mjs`). Importer-მა `LIST/INFO` თავად უნდა წაიკითხოს.
2. **კატეგორიის ტეგი დღეს არ არსებობს:** Tag Manager-ში category ველი არ არის; custom ველის ID მომხმარებლის schema-ზეა დამოკიდებული (`utils.ts:24-31` → `CATE`). საჭიროა ფიქსირებული `ICAT` (T-1).
3. **„უცნობი CatID `prepare`-ს აჩერებს"** → მხოლოდ ტეგიდან მოსულ CatID-ზე. ფაილის სახელის fallback-ზე უცნობი token = `NULL` (სხვაგვარად ყველა `ShoppingMall_…` ფაილი ჩავარდება).
4. **UCS ფაილის სახელის fallback** სტანდარტულ UCS სახელებზე (`FXName`-ში space) ვერ იმუშავებს — `SOURCE_KEY_PATTERN` (`import-recordings.mjs:7`) space-ს უარყოფს, ხოლო position-ის პრეფიქსი (`readPosition`, `:169-172`) CatID-ის წინ დგას.
5. **MERGE NULL-safe არ არის** (`:214-218`) — ახალი nullable სვეტები `<>`-ით ვერასოდეს განახლდება NULL-დან. `INTERSECT`-იანი შედარება + `CAST` `USING`-ში (K-3a).
6. **`ebur128`-ის გამოსავალი stderr-ზეა**, `run()` (`:55-60`) მას აგდებს; < 400 ms → `-70.0`, სიჩუმე → `-inf` (გაზომილია) — NULL-ის წესი ცხადად.
7. **`DECIMAL(5,2)`** ცრუ სიზუსტეა; ebur128 0.1-ს ბეჭდავს → `DECIMAL(4,1)` + CHECK-ები. migration-ში CHECK ახალ სვეტზე იმავე batch-ში ვერ დაიწერება (GO/EXEC).
8. **„sync point ემთხვევა store-ის `hits.ts`-ს"** — `hits.ts` არ არსებობს; SRW-46a ჯერ არ გახსნილა. K-3 გაიყო: K-3a (loudness, ახლა) და K-3b (SRW-46a-ის შემდეგ, ვექტორების ასლით).
9. **AAC priming** (1024 sample ≈ 21 ms) — WAV-ზე გაზომილი SyncPointMs Studio-ში m4a-ის decode-ზე შეიძლება წაინაცვლოს; draft ამას არ ახსენებს (K3b-4, S1-5).
10. **ეტაპი E:** `WorkspaceSource.meta` არ არსებობს (SRW-47b ამატებს) და Studio-ს purchased კოლექცია მხოლოდ stems-ია (`collection.ts:47-82`). E = mapping (S-1) + ცალკე root-only feature.
11. **K-1 spike** ზედმეტია როგორც agent-რაუნდი: chunk/ffprobe-ის კითხვა პასუხგაცემულია; რჩება H-1 (ადამიანის მონიშვნა) და PC-ის დადასტურება K4-6-ში.
12. **„სხვისი პროდუქტი 403/404" ტესტი K-2-ში** უკვე არსებობს (`ProductRecordingServiceTests` 18 ტესტი) — K-2-ში ის რეგრესიაა, ახალი ტესტი არა; ახალი ტესტი = JSON-ში `storageKey`/`sourceKey`/`analysisVersion`-ის არარსებობა (K2-5).
13. **Tag Manager-ის CI ტესტები სუფთა clone-ზე ვარდება** (gitignored `sample.wav`) — cloud loop-ის პირველი რაუნდი T-0 უნდა იყოს.

---

## 5. რაუნდების რაოდენობა

| გარემო | min | expected | optional D-ით |
|---|---|---|---|
| PC / backend | 3 (K-2, K-3a, K-4) | 5 (+ K-3b, + 1 fix round) | 6 (+ K-6) |
| Tag Manager cloud loop | 2 (T-0, T-1) | 4 (+ T-2, + 1 fix round) | 4 |
| Studio loop | 1 (S-1) | 1–2 (S1-5 SyncPoint-ისთვის ცალკე, თუ K-3b გვიან მოდის) | 2 |
| ადამიანი (არა-რაუნდი) | H-1 (sync-ის მონიშვნა), UCS ლიცენზია, CLAP ნებართვა | | |

---

## 6. ნაკადებს შორის თანმიმდევრობა

```
K-2 (schema/API) ──► K-3a (loudness + NULL-safe MERGE) ─────────────┐
T-0 (CI baseline) ──► T-1 (ICAT/IKEY/ICMT contract) ──► K-4 (tags+UCS) ◄── UCS list (საერთო sha256) ──► T-2 (picker)
SRW-46a (hits.ts) + H-1 ──► K-3b (SyncPointMs) ──► S1-5
SRW-47b (meta + library-search) + K-2 JSON shape ──► S-1 (S1-1..S1-4)
K-4 ──► K-6 (optional)
S-1 ──► [root-only] Purchased SFX in Studio (studio.$productId.tsx) — ცალკე feature, Saba-ს გადაწყვეტილება
```

- K-2 და T-0 პარალელურია (სხვადასხვა გარემო, საერთო ფაილი არა).
- **T-1 უნდა იყოს merged K-4-მდე** — K4-3 Tag Manager-ის ნამდვილი build-ით დაწერილ ფაილს იყენებს.
- UCS სია ერთხელ მზადდება (ადამიანის მიერ, ლიცენზიის დადასტურებით) და ორ repo-ში ერთი sha256-ით კოპირდება (K4-9 = T2-7).
- S-1 SRW-47b-ზეა დამოკიდებული, ხოლო SRW-47b — `PHASE2B-SPOTTING`-ის გახსნაზე (Saba-ს go).

## 7. გადაუმოწმებელი
- ექსპერიმენტები Linux-ზე, ffmpeg 6.1.1-ით; PC-ის ffmpeg/ffprobe — K4-6.
- სუფთა clone-ზე Tag Manager-ის main ტესტების ჩავარდნა კოდიდან დასკვნაა, `npm ci` არ გაშვებულა.
- ubuntu-24.04-ზე Electron-ის sandbox/xvfb ქცევა — T0-2.
- ბრაუზერის `decodeAudioData` და MP4 edit list — S1-5.
- UCS სიის ლიცენზია/გადანაწილება, CLAP-ის წონების ლიცენზია.
- store-ის ადგილობრივი clone loop-ის `850445c`-ს შეიძლება ჩამორჩეს (Studio-ში purchased SFX შეიძლება უკვე არსებობდეს).
