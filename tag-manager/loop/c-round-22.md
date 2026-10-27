# C — Round 22 ვერიფიკაცია: TM-B25 / D-31 (Shift-click anchor)

თარიღი: 2026-10-27 · Verifier: C · HEAD `601dc4a` + A-ს working tree · **taskStatus: PASS · realVerified: true · bugs: 1 low (C-R22-01, test gap)**

ყველა ლოგი, screenshot და harness: `c-round-22/`. Source-ს არ შევხებივარ. C-ის ფაზის ბოლოს `git status` = იგივე 2 `M`. Worktree `/tmp/c-r22-old` და mutant ასლები წაშლილია.

## R22-1 ownership + process — PASS
- `git status --porcelain --untracked-files=all` → მხოლოდ `M FileList.tsx`, `M file-list.test.ts`. Untracked ფაილი არ არის.
- `git diff --quiet 601dc4a -- . ':!…FileList.tsx' ':!…file-list.test.ts'` → exit 0.
- `git diff 601dc4a -- tests/ | grep '^-[^-]'` → მხოლოდ პირველი import ხაზი. ის ბრუნდება იგივე სახელებით და დამატებული `act`-ით.
- ახალი ტესტები ერთ ახალ describe-შია ფაილის ბოლოს: `FileList Shift-click anchor (TM-B25, D-31)`, (z1)–(z11).
- src diff (`c-round-22/src.diff`) წავიკითხე. მასში არ არის კომენტარი, `any`, `@ts-ignore`, ახალი `as` ან ახალი export. `FileRow` module-private რჩება. Store-ები ხელუხლებელია.
- `a-round-22-result.json`: `permission_denials: []`. სრული tool transcript ხელმისაწვდომი **არ იყო**, ამიტომ "repo writes მხოლოდ Edit/Write-ით" დადასტურებულია მხოლოდ ირიბად: ცარიელი permission_denials და A-ს განცხადება.

## R22-2 red/green — PASS (`red.log`, `green.log`)
- Worktree `601dc4a`-ზე, A-ს ტესტ ფაილით: **6 failed / 13 passed (19)**.
  - TM-B25 სიმპტომი (მოინიშნა მხოლოდ დაკლიკული ფაილი):
    - (z2) `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]`;
    - (z3) იგივე;
    - (z4) `expected [ 'e.wav' ] … [ 'b.wav', 'c.wav', 'd.wav', 'e.wav' ]`;
    - (z5) `expected [ 'c.wav' ] …`;
    - (z11) `expected [ 'd.wav' ] to deeply equal [ 'a.wav', 'd.wav' ]`.
  - ახალი D-31 ქცევა: (z8) `expected [ 'a.wav', 'b.wav', 'c.wav' ] to deeply equal [ 'c.wav' ]`.
  - გადის: (z1), (z6), (z7), (z9), (z10) და ძველი 8 ტესტი ((a)–(f), (R17-e), (R18-e)).
- A-ს tree-ზე: **19 passed (19)**.

## R22-3 mutations — PASS (`mut.py`, `mutants.log`)
| Mutant | შედეგი | Killers |
|---|---|---|
| M1 ძველი კოდი (index anchor + reset effect) | 6 fail | z2, z3, z4, z5, z8, z11 |
| M2 path anchor, იწმინდება `[files]` ცვლილებაზე | 6 fail | z2, z3, z4, z5, z8, z11 |
| M3 ცარიელ selection-ზე არ იწმინდება | 2 fail | z7, z8 |
| M4 lookup `getState().files`-ში | 2 fail | z4, z11 |
| M5 გამოტოვებული anchor → index 0 | 3 fail | z7, z8, z9 |
| M6 anchor მხოლოდ plain click-ზე | 1 fail | z10 |

ყველა prescribed mutant მოკვდა. აღდგენის შემდეგ: 19/19.

**დამატებითი mutant (C-ის, task-ში არ ეწერა):** M7 = `if (!e.shiftKey) anchorPathRef.current = file.path;`. ეს ნიშნავს, რომ Shift-click anchor-ს აღარ გადააადგილებს. შედეგი: **გადარჩა**, 19/19 (`mutant-m7-shift-anchor.log`).
- (z1)–(z11)-ში არცერთ ტესტს არ აქვს ორი Shift-click ზედიზედ. ამიტომ target behaviour #2 ("every click, **including Shift**, sets the anchor") და deviation 1 unit დონეზე არ არის დაცული. M6 მოკლა მხოლოდ Ctrl-ის გზამ (z10).
- ფიქსირდება როგორც **C-R22-01 (low, test gap)**. Prescribed M1–M6 ყველა მოკვდა, ამიტომ round FAIL-ს არ იწვევს.

## R22-4 gate — PASS (`verify.log`, `e2e-retries0.log`)
- გაშვება სუფთა მდგომარეობიდან (`rm -rf out test-results playwright-report tests/fixtures/*.wav`). სრული `verifyCommand` → **exit 0**, 26 s.
- Biome: 0 error, **8 warnings**. ეს არის `601dc4a`-ის 9 (`biome-old.txt`) გამოკლებული `FileList.tsx lint/correctness/useExhaustiveDependencies` (`biome-old-list.txt` და `biome-new-list.txt`, diff = მხოლოდ ეს ერთი ხაზი). ახალი წესი ან ფაილი არ გამოჩნდა.
- Typecheck 0. Renderer **198/198** (10 files). Main **93/93** (11 files). E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` → **7 passed**, exit 0.

## R22-5 real app — PASS (`drive-r22-5.mjs`, `r22-5-new.json`, `r22-5-old.json`, `r22-5-*.png`)
გაშვება: built app, Playwright `_electron`, `xvfb-run`, `--no-sandbox`, viewport 1400×900. Folder dialog stubbed-ია. 5 ასლი `sample.wav`-ისა (a–e).
1. a.wav-ზე Category `R22A` → `Tags saved` → Shift-click c.wav. შედეგი: panel `3 files selected`, toolbar `3 selected ·`, მონიშნულია a, b, c. ✅
2. Category `R22Range` → ღილაკი `Save to 3 files` → `Tags saved to 3 files`. ✅
3. click b → `Name` header (რიგი e, d, c, b, a) → Shift-click e. შედეგი: `4 files selected`, b–e. ✅
4. click c → search `.wav` → Shift-click a. შედეგი: `3 files selected`, a–c. ✅
5. search გასუფთავდა → Select All (5) → Deselect All (0) → Shift-click d. შედეგი: მხოლოდ d (`1 selected`, ერთი ფაილის panel). ✅
6. დამოუკიდებელი readers (ffprobe `format_tags`, music-metadata `exif:ICAT`):
   - a, b, c: ICAT = `R22Range` ორივე reader-ში;
   - d, e: ICAT არ აქვთ ორივე reader-ში. ✅
7. **Red reference (`601dc4a` build):**
   - ნაბიჯი 1-ის შემდეგ მონიშნულია მხოლოდ c.wav (`1 selected`, panel-ის header `c.wav`);
   - ნაბიჯ 2-ში ღილაკი `Save Tags` იყო;
   - readers: a = `R22A`, b = ICAT არ აქვს, c = `R22Range` (ორივე reader-ში).
   - ბაგი რეალური იყო და reproduce-დება. ✅
- `pageErrors`: ცარიელია ყველა run-ში.
- Artists (record only, TM-B08): ffprobe `artist` და mm `artist` ყველა ფაილზე null-ია. ეს მოსალოდნელია, რადგან Artists არ შეცვლილა.
- **Deviations (ნანახი, უცვლელია):**
  - **1** — Shift-click anchor-ს გადააადგილებს.
    - ძირითად run-ში: click b → Shift d = b, c, d → Shift a = a, b, c, d. ეს შედეგი **ვერ არჩევს** მოდელებს: deviation 2-ის გამო (range ემატება) იგივე სიმრავლე მიიღება მაშინაც, თუ anchor b-ზე დარჩებოდა.
    - ამიტომ ცალკე, გამარჩეველი run გავუშვი (`drive-r22-dev1.mjs`, `r22-dev1-new.json`, `r22-5-new-dev1-discriminating.png`). ფაილები: a, b, cx, dx, e.
      - click a → Shift cx: მოინიშნა a, b, cx.
      - search `x`: ჩანს cx, dx.
      - Shift-click dx: შედეგი **cx, dx** (`2 selected`).
      - თუ Shift anchor-ს არ გადააადგილებდა, anchor a დამალული იქნებოდა, fallback იმუშავებდა და მოინიშნებოდა მხოლოდ dx. ესე იგი anchor cx-ზე გადავიდა. Deviation 1 დადასტურებულია.
    - პირველი, ასევე არაგამარჩეველი ცდა (a…e, search `c`) შენახულია `r22-dev1-nondiscriminating.json`-ში. იქ შედეგი მხოლოდ c იყო ორივე მოდელში, რადგან `selectRange` (frozen store, file-store.ts:78-80) შედეგიდან ყრის search-ით დამალულ მონიშნულ ფაილებს.
  - **2** — range ემატება. click b → Ctrl d → Shift e = b, d, e.
  - **3** — ცარიელი selection anchor-ს აგდებს. click a → Ctrl a (ცარიელი) → Shift c = მხოლოდ c.
- Harness შენიშვნა: პირველ გაშვებაში (`r22-5-new-run1-harness-bug.json`) check 3 ცრუდ ჩავარდა. მიზეზი ჩემი selector-ია: `span.truncate.text-foreground` panel-ის header-საც (ფაილის სახელს) ითვლიდა row-ად და `order`-ში დუბლიკატი `b.wav` ჩნდებოდა. თავად selection სწორი იყო (`4 files selected`, b–e). Selector row-ის grid-ზე შევზღუდე და ხელახლა გავუშვი: ყველა 11 check PASS. Old run-ის check-ები `order`-ზე არ არის დამოკიდებული.

## What could break — შემოწმდა
- Plain/Ctrl/Shift selection უშენახვოდ: (z1), (z9), (z10) და real app-ის ნაბიჯი 3 (sort-ის მიხედვით range) — სწორია.
- Select All/Deselect All: (z8) და ნაბიჯი 5 — სწორია.
- Open/rescan/close: (z7) `clearSelection()`-ს თავად იძახებს, ხოლო real-app run-ში ეს გზები არ გამიშვია. ის, რომ ისინი selection-ს წმენდენ (და ამით anchor-საც), ჩემი grep-ით დავადასტურე frozen ფაილებში: `FolderBrowser.tsx:102,129,138` და `App.tsx:47`, ყველგან `clearSelection();`. ეს არის კოდის წაკითხვით მიღებული დაკვირვება, real-app-ში გავლილი არ არის.
- MetadataPanel flows: `metadata-panel-batch-save.test.ts` byte-identical და მწვანეა (198-ში შედის).
- Performance: ყველა row იღებს ერთსა და იმავე memoised `useFilteredFiles()` მასივს (`visibleFiles={files}`). `findIndex` O(n) სრულდება მხოლოდ Shift-click-ზე. Row-ზე O(n) გადათვლა არ ხდება. FileList ახლა selection-ის empty↔non-empty გადასვლაზეც re-render-დება (A-R22-03, info).

## Bugs
- **C-R22-01 / low / test gap**: Shift-click-ით anchor-ის გადაადგილებას (target behaviour #2, deviation 1) unit ტესტი არ იცავს.
  - Mutant M7 (`if (!e.shiftKey) anchorPathRef.current = file.path;`) 19/19-ით გადარჩება.
  - Product-ის ქცევა სწორია (real app-ში დადასტურდა).
  - შემოთავაზებული killer B-სთვის: ფაილები a, b, cx, dx; click a → Shift cx → `setSearchQuery("x")` → Shift dx ⇒ უნდა მივიღოთ `[cx, dx]` (M7-ზე მიიღება `[dx]`).

Product ბაგი არ არის. A-ს low დაკვირვებებს (A-R22-01, A-R22-02) ვეთანხმები: ორივე deviation 2/3-ისა და B-R21-02 Saba-ს კითხვის ფარგლებშია.

## Blocked
- Windows packaging is not available in the cloud (ამ რაუნდის ნაწილი არ არის).
