# A — Round 31: TM-B33 — overlapping folder loads become latest-wins (D-38)

**სტატუსი:** DONE (A-ს ნაწილი). realVerified (A-ს local checks) = true; R31-3 mutations და R31-5 real app C-ს ეკუთვნის და A-ს არ გაუშვია.

## Baseline
- HEAD `bf83c7dc5e2462304159acc3df56ededbcd9d517`, `git status --porcelain --untracked-files=all` ცარიელი იყო round-ის დასაწყისში.
- ყველა repository ცვლილება Edit/Write tool-ით გაკეთდა; Bash-ით repository ფაილში არაფერი ჩაწერილა (Bash მხოლოდ read-only ბრძანებებს, test/build-ს და loop folder-ის log-ებს წერდა). `.claude/primitives/STATE_MANAGEMENT.md` — Edit tool, path (b).
- წაკითხული primitives: `TESTING.md`, `STATE_MANAGEMENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `prompts/new-store.md`, `GEORGIAN_DOCS.md`, `TYPESCRIPT_STRICT.md`.

## შეცვლილი ფაილები (მხოლოდ owned)
| ფაილი | ცვლილება |
|---|---|
| `src/renderer/src/stores/file-store.ts` | `folderLoadId: number` (`:16`), `beginFolderLoad: () => number` (`:38`), `create<FileState>((set, get) => …)` (`:41`), `folderLoadId: 0` (`:52`), action `beginFolderLoad` (`:155-158`), `export function isFolderLoadCurrent` (`:161-163`) |
| `src/renderer/src/components/sidebar/FolderBrowser.tsx` | import; `handleOpenFolder`: id `:99` (`if (!path) return;`-ის შემდეგ), guards `:107`, `:123`, `:134`, `finally` `:141`; `handleCloseFolder` `:146-147` + `setIsScanning` dependency `:154`; `handleRescan`: id `:158`, guards `:165`, `:181`, `:192`, `finally` `:197` |
| `src/renderer/src/App.tsx` | import; `openFolder`: id `:44` (პირველი statement), guards `:59`, `:75`, `:86`, `finally` `:93` |
| `tests/renderer/components/folder-read-overlap.test.ts` (ახალი, untracked) | (o1)–(o16), ერთი `describe("overlapping folder loads are latest-wins (TM-B33, D-38)")` |
| `tests/renderer/stores/file-store.test.ts` | მხოლოდ დამატება: ახალი import ხაზი `import { isFolderLoadCurrent } from "~/stores/file-store";` (არსებული import ხაზი უცვლელია, `git diff` 0 წაშლილი ხაზი) და ბოლოში `describe("folder load id (TM-B33, D-38)")` (f1) |
| `docs/bugs/001-save-and-selection-known-limits.md` | header, D-38 bullet, entry 14, entry 12 (k7), ყველა shifted ref |
| `docs/bugs/README.md` | row 001: `ცნობილი შეზღუდვების სია (14 ჩანაწერი; 6 გასწორდა, 5 მათგანი Saba-ს კითხვაა)` |
| `.claude/primitives/STATE_MANAGEMENT.md` | ერთი ხაზი D-36 ხაზის შემდეგ (ზუსტად task-ის ტექსტი) |

src-ის `+/-` ხაზები byte-for-byte ემთხვევა B-ს `b-round-30-exp/prototype.diff.txt`-ს (შემოწმდა `diff`-ით: `SAME_AS_PROTOTYPE`). არც comment, არც `any`/`@ts-ignore`, არც ახალი `as`.

`git diff --quiet bf83c7d -- . ':!<8 owned paths>'` → exit 0 (`OUTSIDE_CLEAN`).

## Red run (baseline src + ახალი ტესტები) — `a-round-31/red-run.log`
`npx vitest run --config vitest.config.renderer.ts` → **Test Files 2 failed | 12 passed (14); Tests 16 failed | 241 passed (257)**. (o8) green.

შენიშვნა: red run-ის დროს `file-store.test.ts`-ში import ჯერ ერთ ხაზად იყო (`import { isFolderLoadCurrent, useFileStore }`); მოგვიანებით ცალკე დამატებულ ხაზად გადავიტანე, რომ diff მხოლოდ დამატება იყოს. ქცევა იგივეა; C-ს R31-2 ამას ხელახლა ამოწმებს.

პირველი ჩავარდნილი assertion (ყველა symptom-ია, არა setup):
| ტესტი | ხაზი | პირველი ჩავარდნა |
|---|---|---|
| (o1) | 123 | `metadata` = `{ '/fa/a.wav': A }`, expected `{ '/fb/b.wav': B }` |
| (o2) | 137 | `files` = `[a.wav]`, expected `[b.wav]` |
| (o3) | 151 | `isScanning` false, expected true |
| (o4) | 169 | toast `'Failed to read 1 files'`, expected null |
| (o5) | 187 | `metadata` = `{ '/fa/a.wav': A }`, expected `{}` |
| (o6) | 207 | `metadata` A, expected B |
| (o7) | 224 | `metadata` A, expected B |
| (o9) | 253 | `files` = `[]`, expected `[b.wav]` |
| (o10) | 268 | `isScanning` false, expected true |
| (o11) | 288 | `files` `[a.wav]`, expected `[b.wav]` |
| (o12) | 302 | `files` `[]`, expected `[b.wav]` |
| (o13) | 318 | `files` `[a.wav]`, expected `[b.wav]` |
| (o14) | 332 | toast `'Rescan late'`, expected null |
| (o15) | 347 | `isScanning` false, expected true |
| (o16) | 360 | `TypeError: isFolderLoadCurrent is not a function` (missing export) |
| (f1) | 394 (red-run ხაზი) | `TypeError: beginFolderLoad is not a function` (missing export) |

## Green / gate (A-ს tree)
- renderer: `npx vitest run --config vitest.config.renderer.ts` → **257/257, 14 files** (`a-round-31/green-run.log`).
- სრული `verifyCommand` სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), `a-round-31/verify.log`: **EXIT=0**
  - `Fixtures created successfully`
  - Biome: `Checked 34 files`, 0 errors, **8 warnings**; სია = `c-round-30/biome-new.txt` (წესი+ფაილი ემთხვევა, `a-round-31/biome-new.txt`)
  - typecheck (node, web, test) 0 error
  - renderer **257/257**, main **93/93 (11 files)**
  - build OK, E2E **7 passed**
- `xvfb-run -a npx playwright test --retries=0` → **7 passed** (`a-round-31/e2e-retries0.log`).
- ყოველი ახალი ტესტი ცალკე `-t`-ით: (o1)–(o16) და (f1) თითო **1 passed** (`a-round-31/isolated.log`).
- `tsc --noEmit -p tsconfig.test.json` import ცვლილების შემდეგ ხელახლა: OK; `file-store.test.ts` 38/38.

## Line map (before → after) docs-ისთვის
**file-store.ts:** 1–15 → იგივე; 16–36 → +1; 37–49 → +2; 50–150 → +3; 151–152 → +8; 153+ → +12.
კონკრეტულად: `:35`→`:36`, `:84-98`→`:87-101`, `:123-131`→`:126-134`, `:133-150`→`:136-153`, `:137`→`:140`, `:142-143`→`:145-146`, `:145-148`→`:148-151`.

**FolderBrowser.tsx:** 1–98 იგივე; 99–105 +1; 106–120 +2; 121–130 +3; 131–141 +4; 142–151 +6; 152–157 +7; 158–172 +8; 173–182 +9; 183+ +10.
კონკრეტულად: `:111-126`→`:113-129`, `:123`→`:126`, `:124-126`→`:127-129`, `:127-129`→`:130-132`, `:130-135`→`:133-139`, `:163-178`→`:171-187`, `:175`→`:184`, `:176-178`→`:185-187`, `:179-181`→`:188-190`, `:182-185`→`:191-195`.

**App.tsx:** 1–43 იგივე; 44–57 +1; 58–72 +2; 73–82 +3; 83+ +4.
კონკრეტულად: `:63-78`→`:65-81`, `:75`→`:78`, `:76-78`→`:79-81`, `:79-81`→`:82-84`, `:82-87`→`:85-91`.

ჩანაცვლებული ადგილები docs-ში: D-34 bullet, D-35, D-36, D-37 bullets, entry 6 (`selectRange`), entry 9, entry 11, entry 12, entry 13. entries 1–5, 7, 8, 10 file-store/FolderBrowser/App ref-ს არ შეიცავს და უცვლელია. ძველი ნომრების grep (`111-126|163-178|133-150|123-131|84-98|63-78|82-87|182-185|130-135|:137|:142-143|:145-148`) docs-ში 0 match-ს იძლევა; დარჩენილი `127-129`/`79-81`/`FolderBrowser.tsx:123`/`App.tsx:75` ახალი მნიშვნელობებია (toast-ის ხაზები და D-38 guard-ები).

grep: (o1)–(o16), (f1), (k7) სრული სახელით — docs-ში 1 match თითო, tests/renderer-ში 1 match თითო.

## Code-reviewer (project `code-reviewer` subagent, read-only; shell არ ჰქონდა, working tree-ს ფაილები პირდაპირ წაიკითხა)
შედეგი: **blocking finding არ არის**; guard-ები, dependency array-ები, TS strict, style და docs-ის ყველა `file:line` (D-35…D-38, entries 6, 9, 11–14) სწორად დადასტურდა. low/info შენიშვნები და A-ს გადაწყვეტილება:
| # | Severity | შენიშვნა | A-ს ქმედება |
|---|---|---|---|
| CR-1 | info | App.tsx:140→:44 — drop id-ს `resolveDroppedPaths`-ის await-ის შემდეგ იღებს; თუ dialog ამ დროს დაბრუნდა, drop უფრო ახალ id-ს იღებს და იმარჯვებს | ცვლილება არ არის: task-ის მიხედვით id `openFolder`-ის პირველი statement-ია; latest-started-wins თანმიმდევრულია. ჩანიშნულია B-სთვის |
| CR-2 | info | App.tsx:52-58 — schema-ს ლოდინის დროს superseded load მაინც იძახებს `scanFolder`-ს (მხოლოდ ზედმეტი IPC, store-ში არაფერი იწერება) | ცვლილება არ არის; B-R30-01-ის (superseded load-ის ადრე შეჩერება) ოჯახია |
| CR-3 | low | (o5) Close ღილაკს `svg.lucide-x`-ით პოულობს (fragile; ღილაკს accessible name არ აქვს, pre-existing) | ცვლილება არ არის (FolderBrowser-ის markup task-ის scope-ს გარეთაა); follow-up: Close ღილაკს `aria-label` |
| CR-4 | low | (o16) id counter-ს ამოწმებს და (f1)-ს იმეორებს | task-ის contract-ია (GM-7 მხოლოდ (o16)-ით კვდება); უცვლელი |
| CR-5 | low | (o4) "read rejects" რეალურად post-read guard-ს ტესტავს (`readMetadataChunked` chunk reject-ს თვითონ იჭერს); `catch` guard-ებს (o9)/(o12)/(o14) ფარავს | სწორია, contract-ის მიხედვითაა; ცვლილება არ არის |
| CR-6 | low | Close-ის ტესტი მხოლოდ pending read-ზეა; Close pending scan-ის ან App drop-ის დროს ტესტი არ აქვს | დამატება არ გავაკეთე: task ზუსტად 17 ახალ ტესტს / 257-ს აფიქსირებს და C ამას ითვლის. follow-up ტესტ-gap-ად B-სთვის |
| CR-7 | low | `waitMs(100)` App ტესტებში — მცირე flakiness-ის რისკი load-ის ქვეშ | B-ს reproduction-ს და არსებულ App ტესტებს (`folder-read-rejected-chunk.test.ts`) მიჰყვება; isolated და სრული run-ები გაიარა |

## QA-engineer (project `qa-engineer` subagent, read-only, `read-primitives.md`-ის "after bug fixes" წესით)
- **D-38-ის regression არ არის.** QA-მ renderer suite დამოუკიდებლად გაუშვა: 257/257 (14 files). შეამოწმა: ბოლო load ვერ იკარგება; `isScanning` true-ზე ვერ რჩება (`finally` ყოველთვის ეშვება, Close flag-ს აქრობს); D-35/D-36/D-37 მიმდინარე load-ისთვის კვლავ მუშაობს; MetadataPanel save flow-ს და `handleSchemaChanged`-ს `folderLoadId` არ ეხება.
- info: drop-ის schema-wait loop-ის დროს superseded load მაინც იძახებს `scanFolder`-ს, შემდეგ კი შედეგს `App.tsx:59`-ზე აგდებს (= CR-2). შესაძლო follow-up არის guard loop-ის შემდეგ. ეს ცვლილება task-ის D-38 shape-ს გარეთაა, ამიტომ არ გამიკეთებია.
- **ახალი signal B-სთვის. A-R31-01 (QA-ს შეფასებით medium, pre-existing, D-38-მდე არსებობდა):**
  - **ფაილი:** `MetadataPanel.tsx:209-243` (`handleSchemaChanged`).
  - **მექანიზმი:** ის folder A-ს ფაილებს კითხულობს, `:243`-ზე კი მთელ `metadata`-ს ცვლის.
  - **Reproduction:**
    1. folder A გახსნილია.
    2. schema save → A-ს re-read მიმდინარეობს.
    3. Open Folder B → B-ს load სრულდება.
    4. A-ს schema re-read ბოლოს სრულდება → `metadata` მხოლოდ A-ს path-ებს შეიცავს, B-ს ფაილების ფორმა ცარიელია.
  - **სტატუსი:** A-ს მიერ დაუდასტურებელი hypothesis (ტესტი არ დამიწერია). `MetadataPanel.tsx` frozen-ია.
  - **შესაძლო fix:** `handleSchemaChanged` დასაწყისში `folderLoadId`-ს იღებს და `setMetadata`-მდე ამოწმებს. RR-R28-03-ის ოჯახია.
- info: Close Folder save-ის დროს → `updateFileMetadata` დახურულ folder-ში ერთ entry-ს აბრუნებს. ეს უკვე ჩაწერილი RR-R28-03/RR-R30-01 კლასია.

## /check
`/check` (Biome + `tsc --noEmit`) ცალკე არ გამიშვია: იგივე ბრძანებები `npm run check`-ის ნაწილად გაეშვა `verify.log`-ში (`biome check src/` → 0 errors / 8 warnings; `npm run typecheck` node+web+test → 0).

## Known gaps
- R31-3 (mutants) და R31-5 (real app old vs new, ორი build, harness) A-ს არ გაუშვია — C-ს acceptance-ია.
- Biome `tests/`-ს არ ამოწმებს (RR-R3-04); ტესტები double quote style-ითაა, როგორც დანარჩენი.
- `file-store.test.ts`-ში ერთი module-დან ორი import ხაზია (additions-only მოთხოვნის გამო).
- task-ის გარეთ დარჩენილი (backlog-შია): RR-R28-03/A-R19-02/RR-R30-01 (save re-read folder switch-ის შემდეგ), B-R30-01 (superseded `readMetadataChunked`-ის ადრე შეჩერება — superseded load IPC read-ს ბოლომდე აგრძელებს, უბრალოდ შედეგს აგდებს), RR-R29-02/RR-R30-03 (`loadFolderContents` helper).

## C-ს შემდეგი შემოწმებები
1. R31-1: `git status --porcelain --untracked-files=all` (8 ხაზი: 7 `M` + 1 `??`), `git diff --stat bf83c7d`, `git diff --quiet bf83c7d -- . ':!<8 owned>'`; `git diff bf83c7d -- tests/renderer/stores/file-store.test.ts | grep -c '^-[^-]'` → 0.
2. R31-2: throwaway copy-ში `bf83c7d`-ის სამი src ფაილი + A-ს ტესტები → 241/16; A-ს tree → 257/257; თითო ტესტი `-t`.
3. R31-3: GM-1…GM-19 `b-round-30-exp/mutants.log`-ის მიხედვით, ოთხი test ფაილი.
4. R31-4: verifyCommand სუფთა მდგომარეობიდან + `--retries=0`.
5. R31-5: L/J/S/C სცენარები ორ build-ზე (`c-round-29/harness.cjs`-ის ადაპტაცია), sha256 + music-metadata + ffprobe.
6. R31-6: ყოველი `file:line` docs-ში grep-ით (map ზემოთ).

## Acceptance, რომელიც A-მ რეალურად გაიარა (A-ს local runs; C-ის დამოუკიდებელი შემოწმება მაინც საჭიროა)
- R31-1 (ownership): local-ად შემოწმდა — PASS A-ს მხრიდან.
- R31-2 (red → green): red 241/16 და green 257/257, ცალკე გაშვება — PASS A-ს მხრიდან (baseline src-ზე red run repository-ში გაეშვა src-ის შეცვლამდე, არა throwaway copy-ში).
- R31-4 (gate): verifyCommand EXIT 0, Biome 8 warnings იგივე სია, 257 / 93 / E2E 7, `--retries=0` 7/7 — PASS A-ს მხრიდან.
- R31-6 (docs): grep-ებით შემოწმდა — PASS A-ს მხრიდან.
- R31-3, R31-5: **არ გაუშვია** (C).
