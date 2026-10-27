import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    s = fh.read()

R = []

R.append((
    "განახლდა: 2026-10-27, B round 18. round 18 **გამოქვეყნდა** (`d015470`): TM-B21 done. round 19 = TM-B22 (D-28, Size/Date სვეტები save-ის შემდეგ). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.\n",
    "განახლდა: 2026-10-27, B round 19. round 19 **გამოქვეყნდა** (`3006615`): TM-B22 done. round 20 = TM-B23 (D-29, selection-ის შეცვლა მიმდინარე save-ის დროს, high). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.\n\n"
    "**round 19 დახურულია (C PASS, R19-1…R19-5, realVerified=true, bugs 0):** D-28 დანერგილია (file-store `updateFileStats` + private `refreshSavedFileStats`). red `d015470` worktree-ზე 11 failed / 46 passed ((n),(o),(p),(s),(t) `expected \"vi.fn()\" to be called 1 times, but got 0 times`; (s1)–(s6) missing API; pin-ები ძველზეც გადის), green 57/57; M1–M8 + M3b მოკლულია. gate 162/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია). real built app: single save `a.wav` 86.2 KB → 88.3 KB = `formatFileSize(stat)`, Date 1/2/2020 → 10/27/2026 = stat mtime; batch b+c stat-ს ემთხვევა; `chmod 444` partial: b-ს mtime განახლდა, c-ს cell-ები და stat უცვლელია; Size sort ზრდადობით; ffprobe + music-metadata `ICAT`/`IGNR`; relaunch იგივე; `Unsaved changes` toast არ გამოჩენილა. 200 ფაილზე save 169 ms (დაკვირვება). root gate: published `3006615`, review COMMIT OK (medium RR-R19-01 → Saba B-R18-01; low-ები → RR-R19-02…04).\n",
))

R.append((
    "**თხოვნა root-ს (განახლდა B R18):** მიაბით `Check` run-ის id და შედეგი `d015470`-ზე, `4f8a578`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-18.json`-ში Actions run ჯერ არ არის.",
    "**თხოვნა root-ს (განახლდა B R19):** მიაბით `Check` run-ის id და შედეგი `3006615`-ზე, `d015470`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-19.json`-ში Actions run ჯერ არ არის.",
))

R.append((
    "(C-R17-01). რეალურ app-ში მიიღწევა | in_progress (low), round 19 | C R17-5: save-ის შემდეგ 86.2 KB, relaunch-ის შემდეგ 87.6 KB. B R18 probe: `meta:write` აბრუნებს `void`-ს, preload დაცულია, ყველა ფაილი `folderPath`-ის ქვეშაა → `scanFolder(folderPath)` ერთადერთი წყაროა | round 19: D-28 |",
    "(C-R17-01). რეალურ app-ში მიიღწევა | **done** (R19), realVerified=true | C R19-1…R19-5 PASS, `3006615`: red 11 failed / 46 passed → green 57/57, M1–M8 + M3b, gate 162/93/7. real app: single/batch/partial save-ის შემდეგ Size და Date = `fs.stat`, Size sort, ffprobe + music-metadata, relaunch იგივე | — (ფასი: RR-R19-01/B-R18-01 → Saba) |\n"
    "| TM-B23 | selection-ის შეცვლა მიმდინარე save-ის დროს: შენახული ფაილის მნიშვნელობები ახლად არჩეული ფაილის ფორმაში ჩანს (`MetadataPanel.tsx:105-107` single, `:133-143` batch, selection-ის შემოწმების გარეშე; `skipSyncRef` resync-ს ბლოკავს), `isDirty` false → შემდეგი edit + Save პირველი ფაილის სრულ ველებს მეორე ფაილში წერს | in_progress (**high**), round 20 | qa-engineer P1 (`a-round-19.md`, C-ს არ გაუმეორებია). B R19 კოდის წაკითხვა `3006615`-ზე. harness experiment: `-r` module-ით `meta:write`-ის დაყოვნება source-ის გარეშე (1502 ms) | round 20: D-29 |\n"
    "| TM-B24 | single save-ის დროს ფორმაში აკრეფილი ტექსტი re-read-ის მნიშვნელობით ჩუმად იცვლება (იგივე selection, D-29 არ ფარავს) | todo (medium) | qa-engineer P3 (`a-round-19.md`), B R19 კოდის წაკითხვა | TM-B23-ის შემდეგ |",
))

R.append((
    "რეალურ app-ში მიიღწევა | TM-B22, round 19 (D-28) |",
    "რეალურ app-ში მიიღწევა | **closed** — TM-B22 R19, published `3006615` |",
))

R.append((
    "C R19-ში ~200 ფაილზე save-ის დროს ჩაწერს (დაკვირვება) | Saba-ს კითხვა (preload-ის ცვლილების ნებართვა) |",
    "C R19: 200 ფაილზე single save click → toast 169 ms (დაკვირვება); root review R19 ამას medium-ად აფასებს (RR-R19-01) | Saba-ს კითხვა (preload-ის ცვლილების ნებართვა) |\n"
    "| RR-R19-01 | medium | ყოველი save ელოდება სრულ recursive `scanFolder`-ს (depth 20, stat ყოველ WAV-ზე, timeout-ის გარეშე) re-read-მდე; 1000+ ფაილზე ან network drive-ზე ნელია. fix: `statFiles(paths)` IPC (main + დაცული preload) ან write IPC-ები stat-ებს აბრუნებს; ან refresh await-ის გარეშე toast-ის შემდეგ | Saba-ს კითხვა B-R18-01 (preload); D-28-ის რიგის შეცვლაც გადაწყვეტილებაა |\n"
    "| RR-R19-02 | low | `updateFileStats` match-ზე ახალ `files` array-ს აბრუნებს, ამიტომ `FileList.tsx:107-109` ყოველი წარმატებული save-ის შემდეგ `lastClickRef`-ს reset-ს უკეთებს (R19-მდეც ხდებოდა metadata-ს გამო) | signal; D-28-ში დოკუმენტირება ან effect path-ებზე |\n"
    "| RR-R19-03 | info | `refreshSavedFileStats` `folderPath`-ს write-ის შემდეგ კითხულობს; save-ის დროს გახსნილი folder დასკანერდება, მაგრამ მხოლოდ ჩაწერილი path-ები patch-დება | record only |\n"
    "| RR-R19-04 | info | არქიტექტურა: stat refresh store action-ში `statFiles` IPC-ით, ან `meta:write`/`meta:write-batch` stat-ებს აბრუნებს | signal (B-R18-01, RR-R19-01), preload სჭირდება |\n"
    "| A-R19-01 | low | batch-ზე `scanFolder` reject-ის ცალკე ტესტი არ არის (helper საერთოა, M5 (u)-ით მოკვდა) | signal; ტესტ ფაილის შემდეგ შეხებაზე |\n"
    "| A-R19-02 | low | folder-ის დახურვა/შეცვლა მიმდინარე save-ის დროს: `updateFileMetadata` ძველი folder-ის path-ს ახალი folder-ის metadata-ში ამატებს (stray key); ფორმის ნაწილს D-29 ფარავს (selection ცარიელია) | signal; TM-B23-ის შემდეგ გადამოწმება |\n"
    "| C-R19-01 | info | 2-ფაილიანი batch save-ის შემდეგ Genres ველი placeholder-ს აჩვენებს, თუმცა ორივე ფაილს `R19 Batch` აქვს; D-21-ის მიხედვით მოსალოდნელია (`setEditingMetadata({})`) | record only |\n"
    "| B-R19-01 | low | selection-ის შეცვლა მიმდინარე save-ის დროს აჩვენებს `Unsaved changes were discarded`-ს, თუმცა edits იწერება; D-29 toast-ს არ ცვლის | Saba-ს კითხვა (ტექსტი, ან list-ის ჩაკეტვა save-ის დროს, რასაც reference-first კვლევა სჭირდება) |",
))

R.append((
    "K-4 კონტრაქტს არ ეხება | B R18 close, ტექნიკური, შექცევადი; R19-ში ხორციელდება (TM-B22) |",
    "K-4 კონტრაქტს არ ეხება | **done** R19, published `3006615` (TM-B22; C R19-1…R19-5) |\n"
    "| D-29 | save-ის დროს შეცვლილი selection (TM-B23): `MetadataPanel` `handleSave` save-ის დასაწყისში კითხულობს `useFileStore.getState().selectedPaths`-ს. write-ის (D-28 refresh-ისა და re-read-ის) შემდეგ ადარებს მიმდინარე `selectedPaths`-ს როგორც set-ს (ზომა + წევრები, რიგი არ აქვს მნიშვნელობა). იგივე set → ყველაფერი დღევანდელივით (D-21, D-22, D-24, D-28). სხვა set (სხვა ფაილი, ცარიელი selection, ახალი folder) → ფაილის მხარის განახლებები რჩება (`updateFileStats`, `updateFileMetadata`), toast-ები უცვლელია, მაგრამ ფორმას არ ეხება: `skipSyncRef` არ დგება და `setEditingMetadata` არ იძახება (არც `{...updated}`, არც `{}`). sync effect მიმდინარე selection-ს განახლებული store-იდან აჩვენებს, ან ახალ selection-ზე აკრეფილ edits-ს ინარჩუნებს. write-reject და re-read-reject (D-24) path-ები უცვლელია. `Unsaved changes were discarded` toast უცვლელია (B-R19-01). list save-ის დროს **არ** იკეტება: ეს ახალი UX იქნებოდა (reference-first + Saba). pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | B R19 close, ტექნიკური, შექცევადი; R20-ში ხორციელდება (TM-B23) |",
))

for old, new in R:
    if new.split("\n")[0] in s and old not in s:
        continue
    if s.count(old) != 1:
        sys.exit(f"anchor count {s.count(old)}: {old[:80]}")
    s = s.replace(old, new)

with open(path, "w", encoding="utf-8") as fh:
    fh.write(s)
