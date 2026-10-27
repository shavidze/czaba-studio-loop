# C — Round 18 ვერიფიკაცია: TM-B21 / D-27 (A-R17-01)

**შედეგი: PASS**, realVerified=true, bug-ები: 0. ყველა evidence `c-round-18/`-შია.

## R18-1 ownership + process — PASS
- HEAD `4f8a578`. `git status --porcelain --untracked-files=all` აჩვენებს მხოლოდ 3 owned path-ს, სამივე `M`-ია და untracked ფაილი არ არის.
- `git diff --quiet 4f8a578 -- . ':!…3 owned…'` → exit 0.
- `git diff --stat`: file-store.ts 11, file-list.test.ts 29, file-store.test.ts 114 (150+/4-).
- `^-[^-]` წაშლილი ხაზები tests/-ში მხოლოდ ორი import ხაზია. ორივე იმავე სახელებით ბრუნდება და ემატება ახალი სახელი: `fireEvent` და `WavMetadata`.
- src diff შეიცავს ერთ private helper-ს, `getFieldSortKey(value: FieldValue | undefined): string`, და მის გამოყენებას `aStr`/`bStr` ხაზებში:
  - comment, `any`, `@ts-ignore` და `as` cast არ არის;
  - export არ არის;
  - `file-row-display` import არ არის;
  - `FieldValue` უკვე იყო import-ში, ამიტომ import diff არ არის.
- Tests: malformed მონაცემი მოდის `JSON.parse`-იდან typed annotation-ით ან არსებული `parseUntypedMetadata`-ით. `as` არ არის და `parseUntypedMetadata`-ის მესამე ასლიც არ არის.
- `a-round-18-result.json`: `permission_denials: []`. `subagent_stats.by_type` = `{code-reviewer: 1, qa-engineer: 1}`, ორივე completed. ეს ადასტურებს, რომ ორივე review გაეშვა.
- **შეზღუდვა (C-R12-01-ის მსგავსად):** A-ს სრული tool transcript ხელმისაწვდომი არ არის. "Bash-ით რეპოში ჩაწერა არ ყოფილა" მხოლოდ ირიბად დასტურდება: ცარიელი denial-ები, A-ს განცხადება და ის, რომ diff-ში მხოლოდ owned `M` ფაილებია. A წერს, რომ read-primitives hook ამ რაუნდშიც არ ამოქმედდა. A-R17-02 root-ისთვის ღია რჩება.

## R18-2 red/green — PASS
- Worktree `/tmp/c-r18-old` (`4f8a578`, `node_modules` symlink, `git stash` არ გამოყენებულა). მასში A-ს ორი test ფაილი ჩავაკოპირე → **6 failed | 30 passed (36)** (`c-round-18/red-old.log`).
  - ჩავარდა (a) ოთხივე (`artists [5]`, `[{}]`, `[true]`, `genres [{}]`), (b) `[{}, "Mid"]` და (R18-e).
  - შეტყობინება ყველგან ერთია: `AssertionError: <label> expected [Function] to not throw an error but 'TypeError: aStr.localeCompare is not …' was thrown`, Received `"TypeError: aStr.localeCompare is not a function"`. (R18-e) ჩავარდა `fireEvent.click`-ზე, file-list.test.ts:190.
  - (c)-ის ხუთივე pin გაიარა ძველ კოდზე: `["Mid"]`, `[null]`, `[]`, bpm numeric, bpm vs missing.
- A-ს კოდზე (ასლში) → **36/36 passed** (`green-new.log`).

## R18-3 mutations — PASS (5/5 killed)
Mutant-ები `/tmp/c-r18-mut` ასლში გავუშვი. Script არის `mutate.py`, diff-ები `M*.diff`-შია, ლოგები `M*.log`-ში.

| Mutant | შედეგი | მკვლელი ტესტი |
|---|---|---|
| M1 `aVal[0] ?? ''` | 6 failed | (a)×4, (b), (R18-e): `localeCompare is not a function` |
| M2 `String(value[0] ?? '')` | 1 failed | (a) `[true]`: asc მიიღო `z,y,x` ("true" ხვდება Abe-სა და Zed-ს შორის) |
| M3 number vs non-number → 0 (direct tie: `return 0`, როცა ზუსტად ერთი მხარე number-ია; task-ის `''`-key ვარიანტის ეკვივალენტური observable tie) | 1 failed | (c) "sorts a bpm number against missing metadata as before" |
| M4 `find` first string | 1 failed | (b) "uses only the first element" |
| M5 old code + try/catch → 0 | 6 failed | (a)×4, (b), (R18-e). ყველა **order assertion**-ით ჩავარდა (მაგ. `expected ['x.wav','y.wav','z.wav'] to deeply equal ['y.wav','z.wav','x.wav']`) და არა throw-ით |

## R18-4 gate — PASS
- სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`) გავუშვი `{ npx --yes tsx@4 tests/fixtures/create-fixtures.ts && npm run check && xvfb-run -a npm run test:e2e; }` → **EXIT=0**, 31 წმ (`verify.log`).
  - Biome: 0 errors, **9 warnings**. სია იგივეა, რაც `4f8a578`-ზე. ფაილი/rule შევადარე line number-ის გარეშე: `biome-old.txt` / `biome-new.txt`, diff ცარიელია.
  - Typecheck: `tsconfig.node.json`, `tsconfig.web.json` და `tsconfig.test.json` → 0.
  - Renderer: **146/146** (10 files) = 135 + 11. Main: **93/93** (11 files). E2E: **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7/7**, exit 0 (`e2e-retries0.log`).

## R18-5 real app sort regression — PASS
Built app (A-ს tree, `out/`), Playwright `_electron`, `xvfb-run`, viewport 1400×900. Folder dialog stub-ით გავხსენი, დანარჩენი UI-ით ვმართე. Driver: `drive-r18-5.mjs`, შედეგი: `r18-5-result.json`, ლოგი: `r18-5.log`. ყველა phase-ში `pageErrors` **ცარიელია**.

1. Editor-ით `a-zed.wav`-ს მივანიჭე Artists `R18 Zed` და Genres `R18 Rock`, `c-abe.wav`-ს კი Artists `R18 Abe` და Genres `R18 Ambient`. ორივე save-ზე toast იყო "Tags saved" (`r18-5-1-after-saves.png`).
2. Artist asc → `b-untagged, c-abe, a-zed` (`r18-5-2a-artist-asc.png`). Desc → `a-zed, c-abe, b-untagged` (`r18-5-2b-artist-desc.png`).
   - შენიშვნა: JSON-ის პირველ session-ში მე-4 `c-abe.wav` ჩანაწერი ჩანს. ეს editor panel-ის header-ია (არჩეული ფაილი) და არა list row. Screenshot-ზე სია 3 row-ია.
3. Genre asc → `b-untagged, c-abe, a-zed` (`r18-5-3-genre-asc.png`).
4. Artist asc-ზე დავაჭირე პირველ row-ს და shift-click გავაკეთე მეორეზე. მონიშნულია `b-untagged` და `c-abe`, `a-zed` არა (row class `bg-brand/10`). UI აჩვენებს "2 selected · 3 files" / "2 files selected" (`r18-5-4-shift-range.png`).
5. Name, Size, BPM და Date header-ები: page error არ იყო, სამივე row ჩანს (`r18-5-5-other-headers.png`).
6. Independent reader-ები:
   - **Hard check (genre):**
     - `a-zed`: ffprobe `genre` = `R18 Rock`, music-metadata `common.genre` = `["R18 Rock"]`, native `IGNR` = `R18 Rock` ✔.
     - `c-abe`: ffprobe `genre` = `R18 Ambient`, mm `["R18 Ambient"]`, `IGNR` ✔.
   - **Artists (record only, TM-B08 / C-R2-01):**
     - ffprobe-ში არის `artist` = `R18 Zed` / `R18 Abe` და `ISTR` იგივე მნიშვნელობით.
     - mm-ში `common.artist(s)` ემთხვევა. Native RIFF-ში `ISTR` არის და `IART` არ არის. Native key-ებია `ID3v2.4` და `exif`, ანუ ID3 chunk არსებობს (C-R1-01).
     - ეს ცნობილი TM-B08 მდგომარეობაა და FAIL არ არის.
   - `IKEY=""` და `ICAT=""` იწერება (C-R1-01 / RR-R3-03, ცნობილია). `b-untagged` ხელუხლებელია: ffprobe tags `{}`, mm native ცარიელია.
7. Relaunch → rescan → Artist asc → `b-untagged, c-abe, a-zed`, იგივე რაც (2) (`r18-5-7-relaunch-artist-asc.png`).

**პირდაპირ:** malformed (non-string first element) შემთხვევა მხოლოდ R18-2/R18-3-ით მოწმდება. Real app-იდან მისი მიღება შეუძლებელია, რადგან main ყველა element-ს string-ად აქცევს. R18-5 მხოლოდ regression check-ია და defect fix-ს არ ამტკიცებს.

## დაკვირვებები (არა bug-ები, ამ რაუნდის scope-ს გარეთ)
- Save-ის შემდეგ Size სვეტი ყველა ფაილზე 86.2 KB-ს აჩვენებს (TM-B22 / C-R17-01, უკვე backlog-შია). ამიტომ Size sort-მა R18-5(5)-ში რიგის შესახებ ინფორმაცია არ მოგვცა.
- A-R18-01 და A-R18-02 (A-ს შენიშვნები) დავადასტურე კოდის წაკითხვით:
  - non-array path უცვლელია, D-27-ის მიხედვით;
  - M2-ს მხოლოდ `[true]` კლავს (`"5"` და `"[object Object]"` ისედაც `Abe`-ს წინ ხვდება).
- Integrity: source ჩემს phase-ში არ შეცვლილა. 3 owned ფაილის md5 დასაწყისში და ბოლოს ერთნაირია (`md5-start.txt`, `md5sum -c` OK). Worktree და mutant ასლი წავშალე. `git worktree list`-ში მხოლოდ მთავარი tree დარჩა.
- Windows packaging: BLOCKED, რადგან Windows packaging cloud-ში ხელმისაწვდომი არ არის. ამ რაუნდის ნაწილი არ არის.
