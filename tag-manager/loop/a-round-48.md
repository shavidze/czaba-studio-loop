# A — Round 48 (TM-B08, Saba Q3, D-12): Artists-ის დღევანდელი კოდირების pin + docs

## Baseline
- HEAD `ede35de5e5ef06521cede8eef43a92417527c131`, working tree სუფთა იყო დაწყებისას (`git status --porcelain --untracked-files=all` ცარიელი).
- პირველ edit-მდე წავიკითხე `TESTING.md`, `WAV_METADATA.md`, `TYPESCRIPT_STRICT.md`, `AGENT_DISCOVERABLE_CODE.md`.

## შეცვლილი ფაილები (ownership-ის ფარგლებში)
| ფაილი | ცვლილება |
|---|---|
| `tests/main/metadata-artists.test.ts` (ახალი) | (b1)–(b7), in-test `LIST/INFO` builder (`INAM "T\0"`, `IART "Rec\0"`, `fmt ` და `data`-ს შორის, RIFF size გასწორებული), ordered `listInfoSubChunkEntries` (trailing `\0` strip, UTF-8) |
| `docs/recording-tag-contract.md` | line 5 header-ში ახალი ტესტი (header ტესტებს ჩამოთვლის); `### Artists (D-12, Saba Q3, 2026-10-28)` ქვესექცია D-12 სექციაში; `## შემოწმება`-ში ახალი bullet |
| `.claude/primitives/WAV_METADATA.md` | ერთი ქართული ხაზი STANDARD_PROP_MAP ცხრილის ქვეშ (Edit tool, standing `.claude/**` permission) |

- `src/**` უცვლელია. `git diff --quiet ede35de -- src tests/fixtures tests/e2e tests/renderer tests/contract docs/plans docs/bugs package.json package-lock.json .github` → exit 0.
- **არცერთ Bash ბრძანებას რეპოზიტორიაში არ ჩაუწერია.** სამივე ფაილი Write/Edit tool-ით შეიქმნა/შეიცვალა. Bash-ის redirect-ები მხოლოდ loop-ის ფოლდერში (`a-round-48/*.log`, checkpoint) წერდა. `npm run check`/`test:e2e`-ის build `out/`-ს და fixtures-ს წერს (gitignored, verifyCommand-ის ნაწილი).

## (b1)–(b7) green on baseline (Deviation 2)
`npx vitest run --config vitest.config.main.ts tests/main/metadata-artists.test.ts --reporter=verbose` → **7/7 passed** (log: `a-round-48/new-test-run.log`). `src/` = ede35de, ასე რომ ეს არის baseline run. builder-ის shape-მა ბიბლიოთეკაზე B-ის ffmpeg probe-ის იგივე შედეგი მისცა ((b6) `artists []`, `title "T"`; (b7) `IART "Rec"` რჩება, `ISTR ["New"]` ემატება). stop-and-report არ დასჭირდა.
- (b5)-ში დავამატე ერთი დამხმარე assertion `INAM = ["Only title"]` (message `title written`), რომ ტესტი ცარიელ/არ-ჩაწერილ ფაილზე ცრუ-green არ იყოს.
- (b6)-ში წინაპირობის assertion `builder wrote IART` = `["Rec"]`; (b4)-ში `seeded ISTR`.

## გაშვებული შემოწმებები (ნამდვილად)
| ბრძანება | შედეგი |
|---|---|
| `npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check` | exit 0. Biome `Checked 34 files`, **0 errors, 8 warnings** (უცვლელი). tsc ok. Renderer **326/326** (22 files). Main **135/135** (15 files) = 128 + 7. log `a-round-48/check.log` |
| `npx tsc -p tsconfig.test.json --noEmit` | exit 0 |
| `xvfb-run -a npm run test:e2e` (build + Playwright) | exit 0, build ok, **7/7 passed** (retries config-ის default-ით) log `a-round-48/e2e.log` |
| `xvfb-run -a npx playwright test --retries=0` (იმავე build-ზე) | exit 0, **7/7 passed**, log `a-round-48/e2e-retries0.log` |
| `npx biome check tests/main/metadata-artists.test.ts` | Biome ფაილს ignore-ს უკეთებს (`tests/` lint-ის გარეთაა, TM-B06). ხელით: double quotes (მეზობელი main ტესტების მსგავსად), semicolons, კომენტარი არ არის, `any` არ არის |

## code-reviewer (`code-reviewer` subagent, read-only)
reviewer-მა წაიკითხა `node-taglib-sharp`-ის source, მაგრამ არაფერი გაუშვია. ჩემი ტესტის assertion-ებში შეცდომა არ უპოვია. builder, parser და sha check სწორია. მისი ანალიზით M1–M5 (და „setter also clears albumArtists“) ყველა იჭერება.
- **M1 (medium) — დადასტურებულია probe-ით, გასწორდა docs-ში.** `tag.performers` `LIST/MID ` chunk-შიც წერს `IART`-ს (library-ის MovieId tag). A-ს probe (`a-round-48/probe/probe.cjs`, ffmpeg-ის sine WAV, `["A","B"]`) აჩვენებს: `LIST/INFO ISTR="A" ISTR="B"` და `LIST/MID  IART="A" IART="B"`. docs-ში „არა `IART`“ ახლა ეხება მხოლოდ `LIST/INFO`-ს (contract-ის 70-ე ხაზი, Artists bullets, WAV_METADATA-ის ხაზი), და დაემატა `LIST/MID`-ის bullet. (b1)/(b2)/(b5)-ის სახელებში ახლა წერია „no LIST/INFO IART“. `LIST/MID` unit ტესტში **არ** დამიფიქსირებია, რადგან scope-ს მიღმაა: **A-R48-01** (low) B-სთვის.
- **M2 (medium) — დადასტურებულია probe-ით, გასწორდა docs-ში.** ID3 chunk არის **v2.4** და შეიცავს **ერთ** `TPE1` frame-ს `A\0B`-ით (raw bytes probe-ში), ასე რომ თითო მნიშვნელობაზე ცალკე `TPE1` არ არის. music-metadata მას `TPE1` ×2-ად აჩვენებს (B-ის cell-ში „TPE1 ×2“ music-metadata-ის ხედვაა). ffprobe `artist: A`, `ISTR: B`, music-metadata `common.artists ["A","B"]`: B-ის ცხრილს ემთხვევა.
- **L1** docs-ში ახლა წერია, რომ ffprobe/music-metadata-ის შედეგები ხელით არის გაზომილი.
- **L2** (`encodeRiffSubChunk` `riff-chunks.ts`-ის private `encodeRiffChunk`-ის ასლია): არ გასწორდა, რადგან `riff-chunks.ts` frozen-ია. **L3** (odd-padding path არ ეშვება) და **L4** (UTF-8 decode non-ASCII-ზე): მხოლოდ შენიშვნებია, ცვლილება არ გამიკეთებია.
- review-ის შემდეგ ხელახლა: fixtures + `npm run check` exit 0 (renderer 326/326, main 135/135, Biome 0 errors / 8 warnings), `tsc -p tsconfig.test.json` exit 0 (log `a-round-48/check-2.log`). E2E review-მდე გავუშვი. review-ის შემდეგ შეიცვალა მხოლოდ docs და ტესტების სახელები.

## ცნობილი ხარვეზები
- red proof არ არსებობს (Deviation 2): pin-ების ძალას მხოლოდ C-ის მუტანტები (R48-2) ამტკიცებს. ჩემი ანალიზით: M1 → (b1)/(b2)/(b3) (`ISTR` ცარიელი, `IART` ჩნდება); M2 → (b1)/(b3) (ერთი `ISTR "A; B"`); M3 → (b1)/(b3) read-back; M4 → (b6) (`["Rec"]`); M5 → (b4). მუტანტები თავად **არ** გამიშვია.
- **A-R48-01 (low, ახალი):** `artists` ასევე წერს `LIST/MID ` `IART`-ს თითო მნიშვნელობაზე. ეს გაზომილია, მაგრამ ტესტით არ არის დაფიქსირებული. ის Q25-ს ეხება: სხვა პროგრამამ `IART` შეიძლება `LIST/MID`-იდან წაიკითხოს. C-მ R48-4-ში ეს chunk ჩაიწეროს.
- ID3 `TPE1` unit ტესტში არ არის (Deviation 3); docs-ში ეს B-ის probe-ის ფაქტია, C ამოწმებს R48-4-ში music-metadata-ით.
- docs-ის ffprobe/music-metadata ფაქტები B-ის probe ცხრილიდანაა; რეალური app-ით არ გამიზომავს (C: R48-4/R48-5).
- `build:win`/`build:mac` BLOCKED: „Windows packaging is not available in the cloud“.

## C-სთვის შემდეგი შემოწმებები
1. R48-1: `git diff --stat ede35de` + untracked → მხოლოდ სამი owned ფაილი; `src/` უცვლელი.
2. R48-2: temp ასლში M1–M5 `src/main/ipc/metadata.ts` `STANDARD_PROP_MAP.artists`-ზე, თითო მუტანტი, `npx vitest run --config vitest.config.main.ts tests/main/metadata-artists.test.ts`.
3. R48-3: სრული `verifyCommand` + `xvfb-run -a npx playwright test --retries=0`.
4. R48-4/R48-5: real app (`tone.wav`, `rec.wav`, `other.wav`), raw INFO + ffprobe + music-metadata.
5. R48-6: docs diff vs B-ის probe და C-ის გაზომვები.

## Acceptance, რაც ჩემით ნამდვილად გავიდა
- **R48-1-ის ნაწილი** (ჩემი diff/frozen check, ზემოთ) — საბოლოო ვერდიქტი C-ისაა.
- **R48-3-ის ნაწილი**: `npm run check` (fixtures-ით) და `xvfb-run -a npm run test:e2e` exit 0 (7/7) და `--retries=0` 7/7.
- R48-2, R48-4, R48-5, R48-6 — **არ** გამიშვია (C-ის). realVerified=false ამ ID-ებზე ჩემი მხრიდან.
