import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    s = fh.read()

R = []

R.append((
    "განახლდა: 2026-10-27, B round 19. round 19 **გამოქვეყნდა** (`3006615`): TM-B22 done. round 20 = TM-B23 (D-29, selection-ის შეცვლა მიმდინარე save-ის დროს, high). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.\n",
    "განახლდა: 2026-10-27, B round 20. round 20 **გამოქვეყნდა** (`b373b08`): TM-B23 done. round 21 = TM-B24 (D-30, save-ის დროს იგივე selection-ზე აკრეფილი ტექსტი არ უნდა დაიკარგოს, medium). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.\n\n"
    "**round 20 დახურულია (C PASS, R20-1…R20-5, realVerified=true, bugs 0):** D-29 დანერგილია (private `isSameSelectionSet`, guard მხოლოდ `skipSyncRef`/`setEditingMetadata`-ზე). red `3006615` worktree-ზე 7 failed / 27 passed ((x1)–(x6) და A-ს დამატებითი (x11) სიმპტომით; (x2) `expected 'A-comment' to be 'B-comment'` = data corruption-ის მტკიცება), green 34/34; M1–M3, M5–M9 მოკლულია, M4 equivalent (დაგეგმილი). gate 173/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია). real built app 3000 ms write delay-ით: a.wav-ის save-ის დროს b.wav-ზე click (333 ms) → ფორმა b.wav-ის მნიშვნელობებს აჩვენებს; ffprobe + music-metadata: b = B-title/B-comment/R20B, a = A-title/A-comment/R20A, genre R20Batch ორივეზე. red reference `3006615` build-ზე: b.wav-ში A-title/A-comment ჩაიწერა ორივე reader-ით. root gate: published `b373b08`, review COMMIT OK (low-ები → RR-R20-01…03, არქიტექტურა RR-R20-04).\n",
))

R.append((
    "**თხოვნა root-ს (განახლდა B R19):** მიაბით `Check` run-ის id და შედეგი `3006615`-ზე, `d015470`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-19.json`-ში Actions run ჯერ არ არის.",
    "**თხოვნა root-ს (განახლდა B R20):** მიაბით `Check` run-ის id და შედეგი `b373b08`-ზე, `3006615`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-20.json`-ში Actions run ჯერ არ არის.",
))

R.append((
    "| TM-B23 | selection-ის შეცვლა მიმდინარე save-ის დროს: შენახული ფაილის მნიშვნელობები ახლად არჩეული ფაილის ფორმაში ჩანს (`MetadataPanel.tsx:105-107` single, `:133-143` batch, selection-ის შემოწმების გარეშე; `skipSyncRef` resync-ს ბლოკავს), `isDirty` false → შემდეგი edit + Save პირველი ფაილის სრულ ველებს მეორე ფაილში წერს | in_progress (**high**), round 20 | qa-engineer P1 (`a-round-19.md`, C-ს არ გაუმეორებია). B R19 კოდის წაკითხვა `3006615`-ზე. harness experiment: `-r` module-ით `meta:write`-ის დაყოვნება source-ის გარეშე (1502 ms) | round 20: D-29 |\n"
    "| TM-B24 | single save-ის დროს ფორმაში აკრეფილი ტექსტი re-read-ის მნიშვნელობით ჩუმად იცვლება (იგივე selection, D-29 არ ფარავს) | todo (medium) | qa-engineer P3 (`a-round-19.md`), B R19 კოდის წაკითხვა | TM-B23-ის შემდეგ |",
    "| TM-B23 | selection-ის შეცვლა მიმდინარე save-ის დროს: შენახული ფაილის მნიშვნელობები ახლად არჩეული ფაილის ფორმაში ჩანს (`MetadataPanel.tsx:105-107` single, `:133-143` batch, selection-ის შემოწმების გარეშე; `skipSyncRef` resync-ს ბლოკავს), `isDirty` false → შემდეგი edit + Save პირველი ფაილის სრულ ველებს მეორე ფაილში წერს | **done** (R20), realVerified=true | C R20-1…R20-5 PASS, `b373b08`: red 7 failed / 27 passed → green 34/34, M1–M3 + M5–M9 მოკლულია (M4 equivalent), gate 173/93/7. real app delay harness-ით: ფორმა ახალ selection-ს მიჰყვება, b.wav თავის მნიშვნელობებს ინარჩუნებს ffprobe-ითა და music-metadata-თი; red reference `3006615`-ზე A-ს მნიშვნელობებს b.wav-ში წერს | — |\n"
    "| TM-B24 | save-ის დროს **იგივე selection set-ზე** აკრეფილი ტექსტი ჩუმად იკარგება: single-ში re-read ცვლის (`setEditingMetadata({...updated})`, `MetadataPanel.tsx:115-118`), batch all-succeeded-ში იწმინდება (`setEditingMetadata({})`, `:154`); შემდეგ `isDirty` false. მოიცავს A → B → A + typing-ს (RR-R20-02) | in_progress (medium), round 21 | qa-engineer P3 (`a-round-19.md`), B R19/R20 კოდის წაკითხვა `b373b08`-ზე, root review R20 (RR-R20-02), A-ს qa-engineer R20. input-ები save-ის დროს disabled არ არის (მხოლოდ Save ღილაკი) | round 21: D-30 |",
))

R.append((
    "D-29 toast-ს არ ცვლის | Saba-ს კითხვა (ტექსტი, ან list-ის ჩაკეტვა save-ის დროს, რასაც reference-first კვლევა სჭირდება) |",
    "D-29 toast-ს არ ცვლის. R20: root review-მაც დაინახა (RR-R20-01) | Saba-ს კითხვა (ტექსტი, ან list-ის ჩაკეტვა save-ის დროს, რასაც reference-first კვლევა სჭირდება) |\n"
    "| RR-R20-01 | low | dirty selection-იდან გადასვლა მიმდინარე save-ის დროს აჩვენებს `Unsaved changes were discarded`-ს, თუმცა edits იწერება (`MetadataPanel.tsx:74-76`); root-ის შეთავაზება: discard toast-ის გამოტოვება, სანამ დატოვებული selection-ის save მიმდინარეობს | B-R19-01-ის იგივე Saba-ს კითხვა |\n"
    "| RR-R20-02 | low | A → B → A და A-ზე აკრეფა write-ის დროს: set უცვლელია, ამიტომ `setEditingMetadata(updated)` ახალ ტექსტს გადაწერს | TM-B24 (round 21, D-30) |\n"
    "| RR-R20-03 | info | conventions OK: კომენტარი არ არის, semicolon-ები, `any` არ არის; `STATE_MANAGEMENT.md`-ის D-29 ხაზი ზუსტია | record only |\n"
    "| RR-R20-04 | info | არქიტექტურა: save token `{selectionKey, editVersion}` save-ის დასაწყისში (editVersion ყოველ `updateField`-ზე იზრდება) ერთ ადგილას ჩაანაცვლებდა `skipSyncRef`-ს, selection snapshot-ს და `isDirty`-ს ლოგიკას; store-ის ცვლილება სჭირდება | signal (RR-R12-04, RR-R13-04, RR-R15-05-თან ერთად), არა task |\n"
    "| A-R20-01 | low | sync effect selection-ს `join('\\0')`-ით ადარებს, ამიტომ იგივე set-ის სხვა რიგი (მაგ. Select All) selection-ის შეცვლად ითვლება და dirty batch edits-ს აგდებს `Unsaved changes were discarded`-ით | signal; TM-B24-ის შემდეგ გადამოწმება |\n"
    "| C-R20-01 | info | A-მ გეგმის გარეთ (x11) დაამატა (იგივე describe, მხოლოდ დამატება); ის კლავს M9-ს, რომელსაც x1–x10 ვერ კლავდა; მიღებულია, რაოდენობა 173 | record only |",
))

R.append((
    "selection ცარიელია) | signal; TM-B23-ის შემდეგ გადამოწმება |",
    "selection ცარიელია). R20 re-check: ფორმის ნაწილი D-29-მა გაასწორა ((x4)); stray key და ახალი folder-ის scan (უშედეგო) რჩება | signal |",
))

R.append((
    "K-4 კონტრაქტს არ ეხება | B R19 close, ტექნიკური, შექცევადი; R20-ში ხორციელდება (TM-B23) |",
    "K-4 კონტრაქტს არ ეხება | **done** R20, published `b373b08` (TM-B23; C R20-1…R20-5) |\n"
    "| D-30 | save-ის დროს იგივე selection-ზე აკრეფილი edits (TM-B24): `handleSave` save-ის დასაწყისში ინახავს `editingMetadata`-ს, რომელსაც წერს (start snapshot). D-29-ის \"იგივე set\" branch-ზე, await-ების შემდეგ ითვლის `typedDuringSave` = მიმდინარე `modifiedFields`-ის key-ები, რომელთა მიმდინარე მნიშვნელობა start snapshot-ისგან განსხვავდება (string/number `===`, tags array სიგრძითა და ელემენტებით რიგით; არარსებული key განსხვავებულად ითვლება). ცარიელი → ზუსტად დღევანდელი (D-21, D-22, D-24, D-28, D-29). არაცარიელი → single: დღევანდელი `skipSyncRef` + `updateFileMetadata` + `setEditingMetadata({...updated})`, შემდეგ `mergeFields(typedDuringSave)`; batch all-succeeded: `setEditingMetadata({})`, შემდეგ `mergeFields(typedDuringSave)`. შედეგი: re-read (ან ცარიელი batch ფორმა) + აკრეფილი მნიშვნელობები, `modifiedFields` = მხოლოდ აკრეფილი key-ები, `isDirty` true, Save enabled; toast-ები უცვლელია. batch partial failure (D-21), write reject, re-read reject (D-24) და D-29-ის \"სხვა set\" branch უცვლელია. store არ იცვლება (editVersion token = RR-R20-04 signal). pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | B R20 close, ტექნიკური, შექცევადი; R21-ში ხორციელდება (TM-B24) |",
))

for old, new in R:
    if new.split("\n")[0] in s and old not in s:
        continue
    if s.count(old) != 1:
        sys.exit(f"anchor count {s.count(old)}: {old[:80]}")
    s = s.replace(old, new)

with open(path, "w", encoding="utf-8") as fh:
    fh.write(s)
