# A — Round 3 ანგარიში: T-1 recording tag contract + TM-T1-DOC

Implementer: A · 2026-10-26 · Baseline HEAD `c76856791126602a3016e133bd91a5f0ff2ced5b` (tree clean at start). No commit, push or install.

## შედეგი მოკლედ
- `category` → `LIST/INFO` `ICAT` დაემატა `STANDARD_FIELDS`-ის ბოლოს (D-13). `src/shared/types.ts` diff = ზუსტად 1 დამატებული ხაზი. `src/main/ipc/metadata.ts` ხელუხლებელია — ცვლილება საჭირო არ გახდა.
- კონტრაქტის ტესტები raw RIFF ბაიტებზე, SchemaEditor-ის renderer ტესტები, ffprobe CLI + CI step, E2E spec, ქართული კონტრაქტის დოკუმენტი.
- სრული `verifyCommand` სუფთა მდგომარეობიდან: **exit 0**.

## ⚠ B-სთვის: ორი აღმოჩენა
1. **ICMT size არის 28, არა 26** (task-ის T1-1 ტექსტი). B-ის საკუთარი script (`b-round-2-exp-bext.cjs`, `/tmp/a3exp`-ში ხელახლა გაშვებული) ICMT payload-ს 28 ბაიტად აჩვენებს (56 hex), `Buffer.byteLength('მძიმე კარი','utf8') = 28` (9 ქართული ასო × 3 + space), `LIST/INFO` size 74 = 4+(8+8)+(8+10)+(8+28). ქცევა (UTF-8, NUL-ის გარეშე, pad size-ის გარეთ) B-ის აღწერას ემთხვევა — მხოლოდ რიცხვი იყო არასწორად დათვლილი. ამიტომ რაუნდი არ შევაჩერე: ტესტი ამოწმებს `size === byteLength === 28`-ს, დოკუმენტში წერია 28. **`feature-status.md`/task-ის „26“ B-მ უნდა გაასწოროს.**
2. **`tests/renderer/setup.ts` (frozen) ტეხს React DOM event-ებს.** ის `window`-ს ცვლის plain object-ის ასლით (`{...globalThis.window, api}`), ამიტომ `react-dom`-ის ჩატვირთვისას `window.document` არ არსებობს და controlled input-ის `onChange` jsdom-ში **არასდროს** ეშვება (probe-ით დადასტურდა: `fireEvent.change` → state უცვლელი). ამიტომაც არ არსებობდა component ტესტები. `schema-editor.test.ts`-ში ვასწორებ ლოკალურად `vi.hoisted`-ით (`globalThis.window = globalThis`, `api` გადატანილი) — მოქმედებს მხოლოდ ამ ფაილზე (`isolate: true` default). შემოთავაზება: ახალი TM-B `setup.ts`-ის გასასწორებლად (frozen, ამ რაუნდის ownership-ის გარეთ).

## შეცვლილი / ახალი ფაილები (მხოლოდ owned)
| ფაილი | ცვლილება |
|---|---|
| `src/shared/types.ts` | +1 ხაზი: `{ key: 'category', label: 'Category (UCS)', type: 'text', riffChunkId: 'ICAT', standard: true }` ბოლოს |
| `tests/main/riff-chunks.ts` (new) | `parseRiffTopLevelChunks`, `findRiffChunksById`, `findSingleRiffChunk`, `parseListInfoSubChunks` (მხოლოდ `LIST` form type `INFO`, ზუსტად ერთი; duplicate ID → throw), `sha256OfRiffChunk`, `createRecorderBextPayload`, `createRecorderWavBuffer` (`createSineWavBuffer` + `bext` 602 B `sSPEED=025.000-ND` + `iXML` 87 B (კენტი → pad) `data`-მდე; RIFF size ხელახლა ითვლება) |
| `tests/main/recording-tag-contract.test.ts` (new) | 9 ტესტი (ქვემოთ) + artefact `test-results/recording-tag-contract/contract.wav` |
| `tests/renderer/components/schema-editor.test.ts` (new) | 4 ტესტი T1-9 (a)(b)(c) + (d) |
| `tests/contract/check-ffprobe-tags.ts` (new) | ffprobe CLI, guard regex `check-ffprobe-tags\.[cm]?[jt]s$` |
| `tests/e2e/recording-tag-contract.spec.ts` (new) | 1 ტესტი T1-7, სუფთა `XDG_CONFIG_HOME` |
| `.github/workflows/check.yml` | 1 ახალი step „Tag contract ffprobe cross-check“ (Lint… და Build-ს შორის) |
| `docs/recording-tag-contract.md` (new) | K-4 source of truth (ქართულად) |
| `.claude/primitives/WAV_METADATA.md` | `ICAT` riffChunkId row-ში + 1 ხაზი `category`-ზე |
| `docs/plans/002-recording-tag-contract.md` | `:5` status (T-1 მიმდინარეობს round 3-ში), `:77` scoped to round 1, `:27` ffprobe step დამატებული |

`git status --porcelain` = მხოლოდ ზემოთ ჩამოთვლილი 10 ჩანაწერი. `git diff --stat`: 4 tracked ფაილი, +9/−4.

## ტესტები — რეალურად გაშვებული
| ბრძანება | შედეგი |
|---|---|
| Red, ველის გარეშე (`a-round-3/red-before-field.log`, **RERUN 3** ავტორიტეტულია) | main: 8 failed / 1 passed (T1-3 green — მოსალოდნელია, data ჩაწერისგან დამოუკიდებელია); renderer: 4/4 failed. D-13, T1-1, T1-1b, T1-2, T1-4, T1-5, T1-10a, T1-10b და T1-9(a)(b)(c)(d) წითელია. (პირველი ჩანაწერი log-ში renderer-ს setup.ts-ის ბაგის გამო ჩავარდნილს აჩვენებს — RERUN 2/3 სწორი მიზეზით ვარდება.) |
| Green, ველით | main 9/9, renderer 4/4 |
| სრული `verifyCommand` (სუფთა: `rm -rf out test-results playwright-report tests/fixtures/*.wav`) + ffprobe step-ი check-ის შემდეგ (`a-round-3/verify.log`) | **exit 0**. Biome `src/`: 0 errors (9 warnings — baseline-ზეც 9). typecheck node/web/test: 0 errors. renderer **79** (75+4). main **40** (31+9). ffprobe: `ICAT=DOORWood`, `IKEY=door, slam`, `comment=მძიმე კარი`, „passed“. E2E **7/7**. |
| `npm run build && xvfb-run -a npx playwright test --retries=0 --reporter=list` (code review-მდე) | 7/7 |
| ffprobe CLI negatives | `tests/fixtures/sample.wav` → exit 1, 3 mismatch ხაზი; `/tmp/nope.wav` → exit 1 „WAV file not found“; არგუმენტის გარეშე → exit 1 usage; PATH-ში ffprobe-ის გარეშე → exit 1 „ffprobe not found on PATH (install ffmpeg)“ |
| `js-yaml` parse `check.yml` | valid; step-ების რიგი: … Lint, type check and unit tests → **Tag contract ffprobe cross-check** → Build → E2E tests → Upload |

main ტესტების სახელები: `D-13: category is the last STANDARD_FIELDS entry and the only ICAT field` (`toStrictEqual`) · `T1-1: writes ICAT, IKEY and UTF-8 ICMT into LIST/INFO with exact sizes and no NUL` (8/10/28, RIFF size header = file−8, artefact) · `T1-1b: an odd-size ICAT has no NUL, one zero pad byte outside size, and aligned neighbours` (`DOORMetal`, 9) · `T1-2: meta:read returns category, keywords and comment exactly` · `T1-3: the data chunk payload sha256 is unchanged by the write` · `T1-4: bext, iXML and data stay byte-identical on a recorder WAV and ICMT is written` · `T1-5: batch write of category only keeps title, keywords and comment` (raw INAM/IKEY/ICMT ბაიტები + meta:read, 2 ფაილი) · `T1-10a (D-10 pinned): empty keywords and category are written as zero-length sub-chunks` · `T1-10b (D-10 pinned): writing an empty category removes the previous value` (მთელ ფაილში `DOORWood` აღარ არის).

## Code review
`code-reviewer` subagent გაეშვა. გასწორდა ownership-ში: (1) T1-9(a)/(b) reserved-ს ვერ ამოწმებდა, რადგან `ICAT` უკვე „in use“ იყო → დაემატა (d) pre-T-1 schema-ზე; (2) კენტი INFO size არ იყო ტესტში → T1-1b; (5) RIFF size header-ის შემოწმება T1-1/T1-1b/T1-4-ში; (6) `toStrictEqual`; (4) T1-4-ის სათაური აღარ ამტკიცებს „ICMT wins over bext“-ს (node-taglib-sharp `bext`-ს საერთოდ არ კითხულობს, ეს assertion ვერ ჩავარდებოდა); (8) plan `:27`. დარჩა: plan `:73` „main 30/30“ ისტორიული T-0 ჩანაწერია, არ შევცვალე.

## ცნობილი ხარვეზები
- **bext → ffprobe `comment` ხაფანგი CI-ში არ მოწმდება**: CI-ის ffprobe step `contract.wav`-ს კითხულობს (`sample.wav`-ის ასლი, `bext`-ის გარეშე). recorder ფაილზე ffprobe `comment` = ICMT მხოლოდ C-ის R3-6-ით მოწმდება.
- `parseListInfoSubChunks` duplicate sub-chunk-ზე throw-ს აკეთებს → ფაილზე 2+ artist-ით (`ISTR` × N, D-12) ის ვერ გამოდგება. კონტრაქტის ფაილებზე პრობლემა არ არის; C-მა საკუთარი reader უნდა გამოიყენოს.
- GitHub Actions run-ს ვერ ვხედავ — T1-6 CI ნაწილი realVerified=false (TM-T0-CI, root).
- R3-6/R3-7/R3-8 (real UI, screenshots, music-metadata) A-ს არ გაუშვია — ეს C-ის მიღებაა.

## C-სთვის შემდეგი შემოწმებები
1. R3-2: `/tmp/c-r3-red`-ში `category` ამოიღე → main 8 red (T1-3 green), renderer 4 red; შეადარე `a-round-3/red-before-field.log` RERUN 3.
2. R3-3: ასლში `bext` payload-ის ერთი ბაიტი write-ის შემდეგ (T1-4, `await writeMetadataViaIpc` და `parseRiffTopLevelChunks(readFileSync)`-ს შორის) შეცვალე; ცალკე `findSingleRiffChunk(…, "bext")` / parser-ი გამოტოვოს `bext`. ორივე წითელი უნდა იყოს.
3. R3-4: `check-ffprobe-tags.ts` სამ path-ზე; ffprobe-ის გარეშე PATH-ითაც (`env PATH=<only node> node <tsx cli.mjs> …`).
4. R3-6: recorder ფაილზე ffprobe `comment` ≠ `sSPEED=…`; მესამე `sample.wav` მხოლოდ Title-ით → `ICAT` size 0 (D-10 მოსალოდნელი).
5. R3-8: real UI-ში `Client`/`ICAT` — და ასევე Category-ის დამალვის შემდეგ (case d-ის ანალოგი).
6. R3-9: `git diff c768567 -- src/shared/types.ts` = 1 ხაზი; `.claude` = მხოლოდ `WAV_METADATA.md`.

## Acceptance (A-ს მხრიდან რეალურად გაშვებული ნაწილი; საბოლოო PASS C-ისაა)
- R3-1: unit ნაწილი გაშვებული (main 40/40) — C-ის დამოუკიდებელი dump-ი დარჩა.
- R3-2: A-ს red log არსებობს ✔.
- R3-4: CLI exit 0 + 3 negative exit 1, YAML valid, step-ის რიგი ✔ (Actions run — არა).
- R3-5: სრული verifyCommand exit 0 და `--retries=0` E2E 7/7 ✔.
- R3-9: ownership/porcelain/1-line diff/no any ✔.
- R3-3, R3-6, R3-7, R3-8, R3-10 — A-მ არ გაუშვია (C).

STATUS: DONE
