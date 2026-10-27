# C — Round 27 ანგარიში: TM-B29 (D-34) re-verification, `c2c19a7..6c956b4`

**taskStatus: PASS** · realVerified: **true** · ბაგი: 0 · დაკვირვება: 2 (info)

ყველა ლოგი, სკრიპტი და screenshot `c-round-27/`-შია. დაკვირვებები C-R27-01/02 მხოლოდ ამ md-შია (JSON task-ის schema-ს მიჰყვება). source-ში არაფერი ჩამიწერია: `git status --porcelain --untracked-files=all` ცარიელია ჩემი ფაზის დასაწყისშიც და ბოლოსაც, HEAD = `6c956b41dee3580d01c6285c9c7c3e1c8495101c`. mutation-ები და old/new build-ები repository-ს გარეთ, `/tmp/c-r27-{red,new,old,mut}`-ში გავუშვი (`git archive` + `node_modules` symlink).

## R27-1 ownership + process — PASS
- HEAD = `6c956b4` (parent `c2c19a7`), release commit არ არის. tree სუფთაა, ანუ A-ს ფაზის შემდეგ ცვლილება არ არის. A-ს `a-round-27-result.json`: `permission_denials` = [], A ამბობს, რომ repository-ში არაფერი ჩაუწერია.
- `git diff --stat c2c19a7 6c956b4`: ზუსტად round 26-ის 8 owned path (232+/27−). `git diff --quiet c2c19a7 6c956b4 -- . ':!<8 path>'` → exit 0.
- `file-store.ts` diff-ში მხოლოდ ესაა: `writeGeneration`, `pathWriteGenerations` (interface-ში, initial `0` და `{}`), `markPathsWritten` (interface-ში და implementation-ში).
- სამ test file-ში მხოლოდ დამატებებია (numstat 154/0, 2/0, 12/0). schema-change test-ში ერთადერთი `-` ხაზი diff header-ია, ამიტომ (s1)–(s8) და არსებული file-store ტესტები byte-identical-ია. `reset-stores.ts`-ში დამატებულია ზუსტად 2 reset ხაზი.
- `git show 6c956b4:…/MetadataPanel.tsx | grep -c " as "` → **2**.
- `src/`-ის დამატებულ ხაზებში `//`, `/*`, `any` და `@ts-ignore` არ არის (grep ცარიელია).
- `STATE_MANAGEMENT.md` diff: 1 დამატებული ხაზი (D-34).
- original implementation-ის Edit/Write-only process: **unknown**. transcript არ არსებობს (B-R26-01), ამიტომ ეს FAIL არ არის.

## R27-2 red → green — PASS
- old src + new tests (`/tmp/c-r27-red`: `c2c19a7`-ის `file-store.ts` და `MetadataPanel.tsx`, დანარჩენი `6c956b4`): **210 passed / 6 failed**, 11 file. ლოგი: `c-round-27/r27-2-old-src-new-tests.log`.

| ტესტი | პირველი ჩავარდნილი assertion | symptom |
|---|---|---|
| (s9) | `metadata-panel-schema-change.test.ts:301` `metadata[PATH_A]).toEqual(FRESH_A)` | category `ACat` (stale), მოსალოდნელია `R24Cat` |
| (s10) | `:319` იგივე | category `ACat` |
| (s13) | `:371` იგივე | category `ACat` |
| (s14) | `:390` იგივე | `ACat` და `r24note`-ის გარეშე: reject-time snapshot |
| (s15) | `:406` იგივე (A path) | `ACat` |
| (g1) | `file-store.test.ts:325` | `TypeError: markPathsWritten is not a function`. runtime-ში ვარდება, collection და compile-ის დროს არა |

ყველა ხუთი UI ტესტი ჩავარდა symptom-ზე (stale entry store-ში) და არა setup-ზე: წინა `expect(toast)` assertion-ები (`Tags saved…`) გაიარა. (s11) და (s12) ძველ src-ზე მწვანეა, ისევე როგორც pin-ები.
- `6c956b4`: **216/216**, 11 file (`verify.log`).
- (s9)–(s15) და (g1) ცალ-ცალკე `-t`-ით: თითოეული `1 passed` (`r27-2-alone.log`).

## R27-3 mutations — PASS (12/12 killed, survivor არ არის)
სკრიპტი: `c-round-27/mut.py`. ლოგი ზუსტი diff-ით: `c-round-27/mutants.log`. ორივე TM-B29 test file თითოეულ mutant-ზე გავუშვი (50 ტესტი). baseline (mutant-ის გარეშე): 50/50.

| Mutant | ზუსტი ცვლილება | killed by |
|---|---|---|
| MG-1 | `if (false && (pathWriteGenerations[path] ?? 0) > readGeneration)` | (s9)(s10)(s13)(s15) |
| MG-2 | single: `markPathsWritten([path])` გადატანილია `writeMetadata`-ის წინ | (s10)(s13) |
| MG-3 | `>` → `>=` | (s1)(s2)(s10)(s11)(s12)(s15) |
| MG-4 | `readGeneration` = loop-ის წინ ერთხელ წაკითხული `startGeneration` | (s12) |
| MG-5 | catch-ში `rejectSnapshot[path]`, kept loop: `rejectSnapshot[path] ?? currentMetadata[path]` | (s14) |
| MG-6 | batch: `markPathsWritten(paths)` (failed-იც) | (s15) |
| MG-7a | superseded path: `accumulated[path] = currentMetadata[path] ?? meta` keptPaths-ის ნაცვლად (ფორმა reset-დება) | (s10) |
| MG-7b | `if (current && !keptPaths.has(...))` → `if (current)` | (s6)(s7)(s10) |
| MG-8 | single mark ამოღებულია | (s10)(s13) |
| MG-9 | batch mark ამოღებულია | (s9)(s15) |
| MG-10 | superseded შედარება chunk-ის resolve-ზე: try-ში resolve-დროის `pathWriteGenerations`-ით ფილტრი, push `readGeneration: +Infinity` | (s13) |
| MS-1 | `state.writeGeneration + 1` → `state.writeGeneration` | (g1)(s9)(s10)(s13)(s15) |

ყველა მოსალოდნელი killer დადასტურდა (MG-1/3/4/5/6/7/10, MS-1).

## R27-4 gate — PASS
სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) გავუშვი სრული `verifyCommand`. ლოგი: `verify.log`, `EXIT=0`.
- Biome: 0 error, **8** warning. სია იგივეა, რაც `c2c19a7`-ზე (`biome-old.txt` vs `biome-new.txt`, diff ცარიელია): FileList:82, TagsInput:45, AudioPlayer:138, FolderBrowser:213, TemplatePicker:195, input:13, select:13, toast:12.
- typecheck (`tsconfig.node`, `tsconfig.web`, `tsconfig.test`): 0 error (`npm run check` exit 0).
- renderer **216/216**, main **93/93**, E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0`: **7/7** (`e2e-retries0.log`).

## R27-5 real app, old vs new — PASS
- build-ები: `/tmp/c-r27-new` (`6c956b4`) და `/tmp/c-r27-old` (`c2c19a7`); `npm run build` exit 0 ორივეზე.
- გაშვება: Playwright `_electron`, `xvfb-run -a`, `--no-sandbox`, isolated `XDG_CONFIG_HOME`, `-r c-round-27/harness.cjs`. harness აკეთებს სამ რამეს:
  - `meta:write`/`meta:write-batch`-ს real listener-ის წინ 3 s აყოვნებს;
  - პირველ `meta:read-batch`-ს, რომლის schema-ში `r27note`-ია, real listener-ით მაშინვე უშვებს, reply-ს კი 6 s აყოვნებს;
  - ყველა call-ს timestamp-ით წერს log-ში.
- driver: `c-round-27/drive.mjs`. ფაილები: `sample.wav` → `a.wav`, `b.wav`. მხოლოდ folder dialog-ია stubbed. მთელი UI ხელით იმართება: click, fill, `Save Tags`, `Customize Fields`, `Add Field`, `Done`.

timing (ms Save click-იდან; ორივე build-ზე თითქმის ერთნაირია, `r27-5-{new,old}.json` → `ipc`):

| მოვლენა | new | old |
|---|---|---|
| `meta:write` start | 42 | 40 |
| schema `read-batch` start (late, ფაილს write-მდე კითხულობს: a.wav category `''`) | 1158 | 1173 |
| `meta:write` end | 3048 | 3046 |
| save-ის `meta:read` (R27Cat) | 3051 | 3049 |
| late `read-batch` reply | 7159 | 7175 |

(ციფრები მეორე, საბოლოო run-იდანაა და ამ JSON ფაილებს ემთხვევა. პირველი run-ის ციფრები ±30 ms-ში იგივე იყო.)

schema read write-ის დასრულებამდე დაიწყო და save-ის re-read-ის შემდეგ დააბრუნა reply, როგორც გეგმა მოითხოვდა.

| შემოწმება | `6c956b4` | `c2c19a7` (red) |
|---|---|---|
| ფორმა late read-ის შემდეგ (step 3) | Category **R27Cat**, a.wav `Tagged` | Category `''`, a.wav-ს `Tagged` აღარ აქვს |
| ფორმა b→a-ს შემდეგ (step 4) | **R27Cat** | `''` |
| step 5 save, `Tags saved` | ✓ | ✓ |
| ffprobe `format_tags` a.wav | `ICAT=R27Cat`, `title=R27T2`, `RNOT=''`, `IKEY=''` | `ICAT=''`, `title=R27T2` |
| music-metadata a.wav | `exif:ICAT=R27Cat`, `exif:INAM=R27T2`, `ID3v2.4:TIT2=R27T2`, common.title `R27T2` | `exif:ICAT=''`, `exif:INAM=R27T2` |
| pageErrors | [] | [] |
| artist (record only, TM-B08) | ffprobe და mm: artist არ არის (sample-ს არ აქვს, არც ჩაწერილა) | იგივე |

- old build-ზე data-loss path reproduce-დება: საწყისი ICAT ცარიელი იყო (ffprobe `{}`), save-მა `R27Cat` ჩაწერა, მერე stale read-მა ფორმა reset-ა, და step 5-ის save-მა დისკზე ICAT ისევ `''`-ით გადაწერა.
- new build-ზე ორივე reader field by field `R27Cat`/`R27T2`-ს აჩვენებს.
- driver ორჯერ გავუშვი ორივე build-ზე (მეორედ Category-ის scroll-ით screenshot-ებისთვის), შედეგი ორივეჯერ ერთნაირი იყო.
- screenshots: `r27-5-{new,old}-00…08-*.png`. მთავარი მტკიცებულება: `07-step4-after-b-a` (new: Category R27Cat; old: ცარიელი).

## R27-6 docs — PASS
- ენა: ქართული, English technical terms-ით.
- entry 9: `გასწორდა (D-34, TM-B29)`. (s9), (s10), (s13), (s14) და (s15) სრული სახელებით არის, ტესტის სახელებს ემთხვევა. reproduction history (steps 1–4) დარჩა. დაემატა step 5 (production reachability) და (a)/(b) rare cases.
  - step 5-ის claim-ები: main-ის single write სინქრონულია, batch კი ყოველ 5 ფაილზე yield-ს აკეთებს. ეს `src/main/ipc/metadata.ts:289-290`-ს ემთხვევა (`i % 5 === 4` → `setImmediate`).
- entry 3 step 3: "სხვა ფაილზე გადასვლა"-ის ნაცვლად ახლა რეალური read path-ებია: rescan, folder-ის ხელახლა გახსნა, save-ის re-read, schema-ს შემდეგი ცვლილება (C-R25-03).
- entry 10 step 3: "edits რჩება" მხოლოდ single selection-ზე ვრცელდება. 2+ selection-ზე ახლა წერია `setEditingMetadata({})`, `:249` (C-R25-04).
- header: "(3) და (9)" გასწორებულად არის მონიშნული. D-33 bullet-ს (2) store-write-time entry ემატება, D-34 bullet ახალია.
- line references: ყველა reference `6c956b4`-ზე grep-ით შევამოწმე და ყველა აღწერილ კოდზე მიუთითებს.
  - `MetadataPanel.tsx`: 48, 106-107, 116, 140, 144, 155, 162-164, 170, 177, 209-254, 219, 221, 232, 239-242/243, 247, 249;
  - `file-store.ts`: 79-93 (`selectRange`), 118-126 (`markPathsWritten`).
- entries 1, 2, 4–8: შინაარსი უცვლელია. 1, 2, 4 და 6-ში მხოლოდ line-number reference შეიცვალა (43→48, 149→155, 156-158→162-164, 101-102→106-107, file-store 74-88→79-93). ეს line-reference მოთხოვნის ნაწილია (ownership C.1) და code shift-ს (+5 ხაზი `SchemaChunkRead` interface-იდან) ემთხვევა. იგივე R27-6 row მოითხოვს, რომ ყველა `MetadataPanel.tsx:`/`file-store.ts:` reference `6c956b4`-ის კოდზე მიუთითებდეს. ძველი ნომრები რომ დარჩენილიყო, ეს bullet FAIL იქნებოდა.
- README row 001: `ცნობილი შეზღუდვების სია (10 ჩანაწერი; 2 გასწორდა, 5 მათგანი Saba-ს კითხვაა)` ✓.
- `STATE_MANAGEMENT.md`: ერთი ხაზია და კოდს ემთხვევა (mark after write, batch მხოლოდ non-failed, generation per chunk, შედარება store-write-ზე, superseded/kept → current entry, ფორმა არ იცვლება). ასევე ემთხვევა `backlog.json` D-34-ს.

## "What could break" re-check
- (s1)–(s8) მწვანეა. batch-save, single-save, `file-list.test.ts` და sort ტესტები 216/216-ის ნაწილია.
- `markPathsWritten` `handleSave`-ში `writeMetadata`/`writeMetadataBatch`-ის resolve-ის შემდეგ და `refreshSavedFileStats`-მდე დგას (`MetadataPanel.tsx:140`, `:170`). ის re-read-ის შემდეგ არ არის, ამიტომ MG-2/MG-8 class-ის ბაგი არ არის.
- Biome hook-deps: იგივე 8 warning.

## დაკვირვებები (info, ბაგი არ არის, არცერთი არ არის ამ diff-ის ბრალი)
- **C-R27-01 (info):** `SchemaEditor.tsx:130-131`-ში `Done` ჯერ `await onSave()`-ს (`handleSchemaChanged`) ელოდება და მხოლოდ მერე `onClose()`-ს იძახებს. ნელი schema read-ის დროს editor ღია რჩება (R27-5: `Done` click 1.16 s-ზე, editor კი ჯერ კიდევ ღია იყო 3.06 s-ზე, "Tags saved" toast-ის დროს; `r27-5-new-05-step3-tags-saved.png`). ორივე build-ზე ასეა, ანუ ეს pre-existing ქცევაა. D-34 doc-ის "schema editor არ იკეტება" ეხება lock-ს, არა ამას. UX-ის საკითხია, B-მ შეიძლება Saba-ს batch-ში ჩასვას.
- **C-R27-02 (info):** step 5-ის save-მა a.wav-ში `RNOT=''` (ახალი custom ველი) ჩაწერა ცარიელი მნიშვნელობით. ეს არსებული D-10/C-R1-01 class-ის ქცევაა (ცარიელი ველიც იწერება) და ამ diff-ს არ ეხება.

## Windows packaging
BLOCKED: Windows packaging is not available in the cloud. ამ round-ის ნაწილი არ არის.

## დასკვნა
R27-1…R27-6 გავიდა რეალური შემოწმებით: real Electron app ორ build-ზე, ორი დამოუკიდებელი reader. TM-B29 (D-34, commit `6c956b4`) შეიძლება `done` გახდეს. C-R25-03/04 (= A-R25-02/03) docs findings დახურულია.
