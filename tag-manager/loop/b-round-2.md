# B — Round 2 დახურვა და Round 3-ის გეგმა, 2026-10-26

## Round 2-ის შედეგი
- **C: PASS**, realVerified=**true**. R2-1…R2-9 ყველა PASS. R2-6 რეალურ Electron app-ში შემოწმდა: UI-ით, music-metadata-თი, ffprobe-ით და raw INFO-თი, data sha256 უცვლელია.
- Root review: **COMMIT OK**, critical/high მიგნება არ არის.
- Gate: **published**, commit `c76856791126602a3016e133bd91a5f0ff2ced5b`. ეს არის Round 3-ის baseline HEAD. ხე სუფთაა (`git status` ცარიელია).
- Archive: `tasks/round-2.md` შეიქმნა `current-task.md`-ის ასლად. მანამდე ეს ფაილი არ არსებობდა.
- backlog-ის ცვლილებები, მხოლოდ C-ის ევიდენციით:
  - **done:** TM-B04 (R2-1…R2-9) და TM-B07 (R2-7). ორივე realVerified=true, commit `c768567`.
  - TM-B04-ის acceptance სიაში ჩავწერე C-ის რეალური ID-ები. ძველ სიას სხვა ნუმერაცია ჰქონდა.
  - round 0-ის წესი „tsc no-op-ია“ არ წამიშლია, `superseded_by` ავღნიშნე.
  - დაიხურა B-R0-01 და C-R1-02.
- **TM-T0-CI / TM-T0** რჩება in_progress, realVerified=false: Actions run ჯერ არავის უნახავს. Root-მა უნდა მიაბას მწვანე run `c768567`-ზე.

## ახალი finding-ები (signal-ებად ჩაწერილი, არა task-ებად)
- **C-R2-01 (low):** artists იწერება ორ `ISTR`-ად, schema კი `IART`-ს აცხადებს. ffprobe-ის `artist` მხოლოდ პირველ მნიშვნელობას აჩვენებს. ბაგი ძველია, round 2-ს არ შეუქმნია. ჩავწერე **TM-B08**-ად და **D-12**-ად: K-4 კონტრაქტი მხოლოდ `ICAT`/`IKEY`/`ICMT`-ს მოიცავს. Saba-მ უნდა თქვას, შედის თუ არა artists.
- **RR-R2-01 (medium):** `getRiffInfoTags` write path-ზე ისვრის. ეს არ არის regression, WAV-ზე მიუღწეველია.
- **RR-R2-02 (low):** FileList-ის fix-ს ტესტი არ აქვს.
- **RR-R2-03 (low):** `skipLibCheck` preload-ის `.d.ts`-საც ფარავს.
- **RR-R2-04 (info):** არქიტექტურა, RiffTags accessor.
- **A-R2-01:** `002` plan-ის მოძველებული ხაზები. Round 3 ფლობს ამ ფაილს და ასწორებს.

## Round 3 = TM-T1 + TM-T1-DOC
- **რატომ ახლა:** critical/high ბაგი ღია არ არის. T-1 დამოკიდებულებების მიხედვით შემდეგი ეტაპია და K-4 მას ელოდება. TM-T1-DOC მასთან ერთად გადის, რადგან requirements-ში T-1-ის ფაილების სიაშია.
- **B-ის კოდის წაკითხვა `c768567`-ზე:**
  - `category` (`type: 'text'` + `riffChunkId`, `STANDARD_PROP_MAP`-ში არ არის) მიჰყვება `keywords`-ის InfoTag გზას. ამიტომ `metadata.ts` **გაყინულია**. თუ ცვლილება დასჭირდება, A ჩერდება და მოახსენებს.
  - SchemaEditor-ის `RESERVED_RIFF_IDS` `STANDARD_FIELDS`-იდან მოდის, ამიტომ `ICAT` ავტომატურად რეზერვირდება.
  - renderer-ის Vitest მხოლოდ `*.test.ts`-ს კითხულობს. SchemaEditor-ის ტესტი `.ts` ფაილია და `React.createElement`-ს იყენებს.
- **ახალი გადაწყვეტილებები:**
  - **D-13:** `category` ბოლოში ემატება. არსებული რიგი და SchemaEditor-ის insert index არ იცვლება.
  - **D-14:** bext/iXML WAV იქმნება ტესტის helper-ში, fixtures გაყინულია (ეს RR-R1-06-საც პასუხობს). ffprobe-ის შემოწმება ცალკე CI step-ია, Vitest-ს ffprobe არ სჭირდება და Windows dev-ზე `check` არ ტყდება (RR-R1-02 ამით ffmpeg-ს იყენებს).
- **D-10 (მნიშვნელოვანი):** `MetadataPanel.tsx:76` single-file save-ზე მთელ `editingMetadata`-ს აგზავნის. ამიტომ T-1-ის შემდეგ **ყოველი** save დაწერს `ICAT=""`-ს, კატეგორიის გარეშე ფაილებზეც. „ცარიელი არ ჩაიწეროს“ საფრთხილოა: ასეთი write ძველ მნიშვნელობას ვეღარ წაშლის. რეალური ვარიანტებია `""`-ის ჩაწერა ან sub-chunk-ის წაშლა. Round 3 არსებულ ქცევას ტესტით **აფიქსირებს** (T1-10a/b, clear-ის ჩათვლით) და არ ცვლის. დოკუმენტში ჩაიწერება importer-ის წესი: „არ არის = ცარიელი“.
- **რეგრესიის კონტროლი:**
  - TM-T1-MIG: R3-7, მხოლოდ რეგრესია. item done არ გახდება D-07-ის გარეშე.
  - bext → ffprobe `comment` pitfall.
  - batch save `category`-ს არ წერს.
  - panel layout.
- **ზომა:** 1 ხაზი `src`-ში, დანარჩენი ტესტები და დოკუმენტაციაა. ეს ერთი feature stage-ია. scope არ შემიმცირებია: TM-T1-MIG, TM-T1-DUP და TM-B08 ღია რჩება და Saba-ს გადაწყვეტილებას ელოდება.

## ღია კითხვები Saba-სთვის
1. **(D-10)** ცარიელი ველი: `""`-ად ჩაიწეროს (დღევანდელი ქცევა, ყოველ save-ზე `ICAT=""`) თუ sub-chunk წაიშალოს? B-ის რეკომენდაცია: წაიშალოს, ცალკე round-ში, ტესტით.
2. **(D-01)** `ICAT` საბოლოოა? R3 მას ახორციელებს.
3. **(D-07)** არსებული `schema.json`-ის migration არ ხდება, მომხმარებელი Category-ს Schema Editor-ში რთავს. დასტური?
4. **(D-08)** ცარიელი category დასაშვებია. დასტური?
5. **(D-12 / TM-B08)** artists (ISTR) შედის K-4 კონტრაქტში?
6. **(TM-T1-DUP)** ძველ schema-ში custom ველი `ICAT` ID-ით ან `category` key-ით: გაფრთხილება თუ შერწყმა?
7. **(TM-B05, TM-T2-DATA, RR-R1-07)** იგივეა, რაც b-round-1.md-ში.
8. **Root-ისთვის:** მიაბით Actions run-ის URL `c768567`-ზე (TM-T0-CI).

## გადაწყვეტილება
**CONTINUE.** Round 3 = TM-T1 + TM-T1-DOC (`current-task.md`, R3-1…R3-10). user-ის ინფორმაცია ამ round-ს არ სჭირდება: ღია D-ების default-ები ჩაწერილია, D-10 კი არსებული ქცევით ფიქსირდება.

## B-ის ექსპერიმენტი task-ის გაგზავნამდე (`/tmp/bexp3`, script: `b-round-2-exp-bext.cjs`)
`metadata.ts`-ის იგივე node-taglib-sharp გამოძახებებით ჩავწერე sine WAV-ში, რომელსაც სინთეზური `bext` (602 B, `sSPEED=025.000-ND`) და `iXML` ჰქონდა. ჩავწერე `ICAT=DOORWood`, `IKEY=door, slam`, `comment=მძიმე კარი`. შედეგი:
- `bext`, `iXML` და `data` payload-ები ბაიტ-იდენტურია. requirements-ის exp3-ის მტკიცება ამ loop-ში პირველად დადასტურდა. T1-4 `metadata.ts`-ის შეცვლის გარეშე გადის.
- INFO sub-chunk-ების ზომა ზუსტია: `ICAT` 8, `IKEY` 10, `ICMT` 26 (UTF-8). NUL terminator არ იწერება.
- `ICAT=''` ძველ მნიშვნელობას შლის და ტოვებს ნულოვანი ზომის `ICAT`-ს.
- ffprobe: `comment` = `მძიმე კარი` (სწორი UTF-8), raw `ICAT` და `IKEY`. დამატებით ჩანს `time_reference` (`bext`-იდან).

ეს ფაქტები `current-task.md`-ის T1-1 და T1-10 პუნქტებში ჩაიწერა ზუსტ მნიშვნელობებად. advisor-ის შენიშვნების მიხედვით გასწორდა R3-3 (მუტაცია ახლა ტესტის ჩავარდნას ამოწმებს), E2E spec-ში ზუსტად ერთი ტესტია (7/7), ხოლო R3-6-ში დაზუსტდა, სად აჩვენებს music-metadata `ICAT`/`IKEY`-ს.
