# C — Round 25 შემოწმება (TM-B28)

Verifier: C · 2026-10-27 · Baseline: HEAD `3d27ba921ab2f27e4b02a8e6bb220c2fad5850d5` (release commit-ის გარეშე) · **taskStatus: PASS**, realVerified=true

A-ს ანგარიში მხოლოდ მითითებად გამოვიყენე. ქვემოთ ყველა შედეგი ჩემი გაშვებიდანაა. log-ები `c-round-25/`-შია.

## R25-1 ownership + process — PASS
- `git status --porcelain --untracked-files=all`: 3 `M` (docs/bugs/001, batch-save test, schema-change test) და ერთი `??`, `tests/renderer/helpers/window-api-mocks.ts`.
- `git diff --quiet 3d27ba9 -- . ':!<3 owned>'` → 0. `git diff --quiet 3d27ba9 -- src` → 0. `docs/bugs/README.md` უცვლელია.
- **helper:**
  - ერთი export, `resetWindowApiMocks(): void`;
  - ექვსი `mockReset().mockResolvedValue(...)` სტრიქონი B-ის რიგით და setup.ts-ის default-ებით;
  - `window.api` ფუნქციის შიგნით იკითხება;
  - import მხოლოდ `vi`-ა;
  - comment, `any`, `@ts-ignore` და `as` არ არის.
- **batch-save file:**
  - წაშლილია მხოლოდ local helper (+ ცარიელი სტრიქონი) და (i3)-ის ძველი სახელი;
  - დამატებულია მხოლოდ import, ახალი სახელი, `saveSchema` once-value და assertion.
- **schema-change file:**
  - წაშლილია მხოლოდ ექვსი inline reset სტრიქონი, მათ ნაცვლად `resetWindowApiMocks();` და import;
  - (s1)–(s7) diff-ში არ ჩანს, ანუ byte-identical-ია;
  - დამატებულია `PATH_C`, `FILE_C` და (s8), describe-ის ბოლო test. მისი assertion-ები spec-ს ემთხვევა, key-list assertion-ის ჩათვლით.
- **A-ს transcript ხელმისაწვდომი იყო** (`24cbe9ab…jsonl`):
  - რეპოში ჩაწერილი 4 ფაილი მხოლოდ Write/Edit-ით შეიცვალა (1 Write, 32 Edit);
  - Bash-ით ჩაწერა მხოლოდ loop folder-ში, `/tmp`-ში და gitignored output-ში მოხდა;
  - `git stash` არ გამოყენებულა;
  - `permission_denials` ცარიელია;
  - transcript-ის რიგით final gate ბოლო docs Edit-ის შემდეგ გაეშვა. checkpoint-ის საათები (14:36Z gate / 14:50Z docs) ერთმანეთს არ ემთხვევა: ეს info-ა და შედეგზე გავლენა არ აქვს.
- დიფები: `c-round-25/diff-tests.patch`, `c-round-25/diff-docs.patch`.

## R25-2 green — PASS
- renderer: **208/208**, 11 file (gate.log).
- `-t "i3"` ცალკე: 1 passed, 207 skipped (`alone-i3.log`).
- `-t "s8"` ცალკე: 1 passed, 207 skipped (`alone-s8.log`).
- src უცვლელია, ამიტომ (s8) `3d27ba9`-ის src-ზე გადის. ეს pin-ია.

## R25-3 mutations — PASS (`c-round-25/mutants.log`, script `/tmp/c25-scripts/mutants.sh`, ასლები `/tmp/c25/*`)
| Mutant | შედეგი |
|---|---|
| MI-1…MI-6 (helper-ის 4–9 სტრიქონი, `mockClear`, `-t "i3"` ცალკე) | 6-ვე **killed**: (i3) 1 failed. MI-6 = `saveSchema` |
| MB (batch-save beforeEach-ის call წაშლილია) | **killed**: 24 failed / 25 passed |
| MBS (schema-change beforeEach-ის call წაშლილია) | **survives**: 8/8 → C-R25-01 (low) |
| MA-1 (`if (!previous[path]) continue;` წაშლილია) | **killed**: მხოლოდ (s8) ვარდება |
| MA-2 (+ `previous[path] ?? {}`) | **killed**: მხოლოდ (s8) ვარდება |
| MW (`window.api` module load-ზე const-შია) | **survives**: schema-change 8/8, batch-save 49/49. call-time წესი მხოლოდ style-ია → C-R25-02 |

**MBS-ის ანალიზი:** once-value არ ჟონავს. ერთადერთი `*Once` (:68, :78) თავისივე test-ში იხარჯება. persistent override-ები ჟონავს (`mockImplementation` :53/:61, `mockRejectedValue` :156/:204/:221/:244, `mockResolvedValue` :220), მაგრამ ყოველი test, რომელსაც ისინი სჭირდება, საკუთარ override-ს თავიდან აყენებს. A-ს ახსნა სწორია.

## R25-4 gate — PASS (`c-round-25/gate.log`)
სუფთა state-იდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) სრული `verifyCommand`-ის შედეგი **GATE_EXIT=0**:
- Biome: 0 error, **8 warning**: FileList:82, TagsInput:45, AudioPlayer:138, FolderBrowser:213, TemplatePicker:195, input:13, select:13, toast:12. src უცვლელია, ამიტომ ეს `3d27ba9`-ის სიაა.
- typecheck (node, web, test) → 0. `tsconfig.test.json` ახალ helper-საც ფარავს.
- renderer **208/208**, main **93/93**, E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7**, R0_EXIT=0.

## R25-5 real app smoke — PASS (`c-round-25/drive-r25-5.mjs`, `r25-5.json`, `r25-5-*.png`)
აგებული app გავუშვი Playwright `_electron`-ით `xvfb-run`-ის ქვეშ (`--no-sandbox`, იზოლირებული `XDG_CONFIG_HOME`). `sample.wav` დავაკოპირე როგორც `a.wav` და `b.wav`. folder dialog stub-ით შევცვალე, დანარჩენი მხოლოდ UI-ით ვმართე.
1. `a.wav`-ზე click, Title `R25T`, `Save Tags` → toast `Tags saved`, ფორმაში `R25T` (`r25-5-1-saved.png`).
2. `Customize Fields` → ველი `R25note` → `Add Field` → `Done`. ფორმაში დარჩა Title `R25T`, `R25note` ველი ჩანს და `Failed to read` toast არ გამოჩენილა (`r25-5-2a-field-added.png`, `r25-5-2b-after-done.png`).
3. დამოუკიდებელი reader-ები `a.wav`-ზე:
   - ffprobe `title=R25T`;
   - music-metadata `exif:INAM=R25T` (common.title `R25T`);
   - field-by-field შედარება: INAM↔title, IKEY↔IKEY (""), ICAT↔ICAT ("") — 3/3 ემთხვევა, სხვაობა 0.
- `pageErrors` ცარიელია. Artists მხოლოდ ჩაწერილია (TM-B08): ცარიელი, ჩაწერა არ შემოწმებულა.

## R25-6 docs — PASS
- ქართულია, English technical terms-ით, entry-ის ფორმატი იგივეა.
- D-33 bullet-ში RR-R24-01-ის note არის.
  - A-ს გადახვევა **A-R25-01 სწორია**: ფაილზე გადასვლა disk-იდან არ კითხულობს. `MetadataPanel.tsx:111` store-ის entry-ს იღებს.
  - ჩამოთვლილი read-ის გზები src-ში არსებობს: rescan/open (`FolderBrowser.tsx:105/141`, `App.tsx:57`), save-ის re-read (`:138/:169`) და schema-ს შემდეგი ცვლილება (`:212`).
- entry 3-ის title: `(single და batch)`.
- entry 9:
  - step 4 (RR-R24-02, chunk-ებს შორის, `:224`) დამატებულია;
  - decision line-ში guard ტექნიკურია, UX მხოლოდ lock-ია;
  - status `ცნობილი შეზღუდვა` და `ტესტი არ არის` უცვლელია.
- entry 10-ში (s6) და (s7) ზუსტი სახელით წერია. grep-მა test file-ის :202 და :218 იპოვა.
- `MetadataPanel.tsx:` ref-ები ყველა შევამოწმე: :43, :101-102, :111, :138, :149, :156-158, :169, :201-235, :212, :224, :228. `metadata-store.ts:32-33` ასევე. ყველა აღწერილ კოდზე მიუთითებს.
- entry 1, 2, 4–8, header და README უცვლელია (diff hunk-ები მხოლოდ D-33-ს, entry 3-ის title-ს, entry 9-სა და entry 10-ს ეხება).

## Findings B-სთვის (ყველა low, არცერთი არ არის A-ს FAIL)
- **C-R25-01:** MBS survives. schema-change file-ის reset-ს test არ იცავს (RR-R24-03-ის gap მეორე file-ისთვის).
- **C-R25-02:** MW survives. call-time წესი მხოლოდ style-ია.
- **C-R25-03 (= A-R25-02):** entry 3 step 3 (`:52`) ისევ წერს „სხვა ფაილზე გადასვლა და დაბრუნება“. ეს ახალ D-33 note-ს და `:111`-ს ეწინააღმდეგება.
- **C-R25-04 (= A-R25-03):** entry 10 step 3-ის „ფორმა არ იცვლება და edits რჩება“ მხოლოდ single selection-ზეა სწორი. batch-ზე `:229-230` reject-ის დროსაც `setEditingMetadata({})`-ს იძახებს.

## BLOCKED
Windows packaging is not available in the cloud. ეს ამ round-ის ნაწილი არ არის.

C-ს phase-ის განმავლობაში source არ შემიცვლია. ბოლოს `git status` ისევ იგივე 4 path-ს აჩვენებდა, hash-ები: `c-round-25/final-hashes.txt`.
