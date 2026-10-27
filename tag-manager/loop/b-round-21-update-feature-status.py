import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    lines = fh.read().split("\n")

HEADER = (
    "განახლდა: 2026-10-27, B round 21. round 21 **გამოქვეყნდა** (`601dc4a`): TM-B24 done. round 22 = TM-B25 (D-31, Shift-click-ის "
    "anchor save-ის, sort-ისა და search-ის შემდეგ არ უნდა დაიკარგოს, low). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) "
    "მტკიცებულებით."
)
R21 = (
    "**round 21 დახურულია (C PASS, R21-1…R21-5, realVerified=true, bugs 0):** D-30 დანერგილია (module-private `isSameFieldValue`, "
    "`collectFieldsTypedDuringSave`, `mergeFieldsTypedDuringSave`; store არ შეცვლილა). red `b373b08` worktree-ზე 9 failed / 39 passed "
    "((y1) `expected 'A-title' to be 'TypedTitle'`, (y2) 1 write call 2-ის ნაცვლად, (y3), (y5b), (y6)–(y10)); pin-ები (y4), (y5), "
    "(y11)–(y13) და (x1)–(x11) ორივეზე გადის; green 48/48. M1–M7 მოკლულია, M8 equivalent (დაგეგმილი, run-ით დადასტურდა). gate 187/93/7, "
    "`--retries=0` 7/7, Biome 9 warning (იგივე სია). real built app 3000 ms write delay-ით: a.wav-ის save-ის დროს აკრეფილი Comment "
    "`R21Typed` (551 ms, toast 3101 ms) ფორმაში რჩება, Save enabled; A → B → A + Title `R21Back` და batch b+c + Copyright `R21Copy` "
    "ასევე რჩება; ffprobe + music-metadata: a comment `R21Typed` + ICAT `R21A`, b title `R21Back` + ICAT `R21Batch` + copyright "
    "`R21Copy`, c comment `R21C` + ICAT `R21Batch` + copyright `R21Copy`. red reference `b373b08` build-ზე: Comment ცარიელი, Save "
    "disabled, a.wav-ში comment არ არის. root gate: published `601dc4a`, review COMMIT OK (low-ები → RR-R21-01…03, არქიტექტურა "
    "RR-R21-04)."
)
TM_B24_ROW = (
    "| TM-B24 | save-ის დროს **იგივე selection set-ზე** აკრეფილი ტექსტი ჩუმად იკარგებოდა: single-ში re-read ცვლიდა, batch all-succeeded-ში "
    "იწმინდებოდა; შემდეგ `isDirty` false. მოიცავს A → B → A + typing-ს (RR-R20-02) | **done** (R21), realVerified=true | C R21-1…R21-5 "
    "PASS, `601dc4a`: red 9/39 → green 48/48, M1–M7 მოკლული, M8 equivalent; gate 187/93/7; real app delay harness-ით, ffprobe + "
    "music-metadata; red reference `b373b08` build-ზე აკრეფილი Comment იკარგება | — (D-30) |"
)
TM_B25_ROW = (
    "| TM-B25 | Shift-click range-ის anchor ყოველი save-ის შემდეგ იკარგება: `FileList.tsx:105-109` `lastClickRef`-ს (row index) reset-ს "
    "უკეთებს, როცა სია იცვლება, და ყოველი save მას ცვლის (`updateFileMetadata`, D-28 `updateFileStats`). click a → save → Shift-click c "
    "მხოლოდ c-ს ირჩევს a..c-ის ნაცვლად, ამიტომ შემდეგი batch edit ერთ ფაილზე მიდის. იგივე ხდება sort-ის ან search-ის შეცვლისას "
    "(RR-R19-02) | in_progress (low), round 22 | root review R19 (RR-R19-02). B R21 experiment (`b-round-21-exp/anchor-old-output.txt`): "
    "`601dc4a`-ზე component ტესტი `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]` | round 22: D-31 |"
)
NEW_FINDING_ROWS = [
    "| RR-R21-01 | low | `MetadataPanel.tsx:128` start snapshot render closure-იდან მოდის და არა `getState()`-იდან; write იმავე closure-ს იყენებს, ამიტომ დღეს თანმიმდევრულია | signal; MetadataPanel hygiene round (RR-R13-02/RR-R15-02-თან ერთად). B-ის experiment: `b-round-21-exp/casts-snapshot.diff.txt` |",
    "| RR-R21-02 | low | D-30: save-ის დროს snapshot-ის მნიშვნელობაზე დაბრუნებული ველი \"აკრეფილად\" არ ითვლება; თუ writer-მა მნიშვნელობა ნორმალიზება გაუკეთა, ფორმა re-read-ს აჩვენებს ((y4)-ით განზრახ არის pin-ული). = A-R21-02 | signal; `docs/bugs/`-ში ჩანაწერი hygiene round-ში |",
    "| RR-R21-03 | low | batch save-ის დროს set-ის შეცვლა + აკრეფა-ზე pin არ არის | record only: (x11) ზუსტად ამ შემთხვევას ფარავს (B R21 წაკითხვა) |",
    "| RR-R21-04 | info | არქიტექტურა: save-ის შემდეგი reconciliation pure ფუნქციად metadata store-ში, `skipSyncRef`-ის გარეშე | signal (RR-R12-04, RR-R13-04, RR-R15-05, RR-R20-04) |",
    "| A-R21-01 | low | snapshot-ში არარსებული ველი save-ის დროს აკრეფილი და წაშლილი → `''`/`0` merge-დება, batch-ის შემდეგი Save ყველა ფაილში `''`-ს წერს (წინასწარ არსებული ქცევა) | signal |",
    "| A-R21-02 | info | revert snapshot-ის მნიშვნელობაზე იკარგება, თუ re-read განსხვავდება | = RR-R21-02 |",
    "| A-R21-03 | low | schema-ს შეცვლა single save-ის დროს: re-read save-ის დაწყების `fields`-ით გადააწერს `handleSchemaChanged`-ის შედეგს (წინასწარ არსებული) | signal |",
    "| A-R21-04 | low | test ფაილში once-mock რიგი შეიძლება შემდეგ ტესტში გადავიდეს, თუ ტესტი Save-მდე ჩავარდება; nested `beforeEach` + `mockReset` | signal; hygiene round |",
    "| C-R21-01 | info | R21-5 ნაბიჯი 4: `Unsaved changes were discarded` save-ის დროს გადასვლისას (უცვლელი) | = B-R19-01 / RR-R20-01 |",
    "| C-R21-02 | info | `Tags saved` toast ~3 s ფარავს Save ღილაკს | = C-R15-01 |",
    "| C-R21-03 | info | C-ის პირველ R21-5 run-ში music-metadata-ს RIFF INFO `exif:` namespace-ის გარეშე იკითხებოდა (C-ის harness bug, გასწორდა, ხელახლა გაეშვა) | record only |",
    "| B-R21-01 | info | A-R20-01 დღევანდელი UI-დან მიუღწეველია (toggle ბოლოში ამატებს, selectRange რიგს ინარჩუნებს, Select All მხოლოდ მაშინ, როცა set განსხვავდება). კოდის წაკითხვა, არა C-ის მტკიცებულება | A-R20-01 signal-ად რჩება |",
    "| B-R21-02 | low | D-31-ის reference-ისგან (Explorer/GTK) განზრახ გადახვევები: Shift-click anchor-ს ცვლის; Shift range არსებულ selection-ს ემატება (Explorer: ცვლის); ბოლო მონიშნულის Ctrl-ით მოხსნა anchor-ს აგდებს | Saba-ს კითხვების პაკეტი |",
    "| B-R21-03 | info | `App.tsx:64`, `FolderBrowser.tsx:112,148` `as Record<string, WavMetadata>` cast-ები საჭიროა: `readMetadataChunked` (`lib/utils.ts:49`) `Record<string, Record<string, unknown>>`-ს აბრუნებს | signal; hygiene round |",
]
D31_ROW = (
    "| D-31 | Shift-click anchor (TM-B25): `FileList` anchor-ს ინახავს file path-ად და არა row index-ად. ყოველი click (plain, Ctrl/Cmd, Shift) "
    "anchor-ს clicked row-ის path-ზე აყენებს (როგორც დღეს). Shift-click-ზე anchor path იძებნება ამ მომენტში დახატულ სიაში (sorted + "
    "filtered, იგივე რიგი, რასაც `selectRange` იყენებს); თუ იპოვა, `selectRange(anchorIndex, clickedIndex)` უცვლელად (range კვლავ "
    "არსებულ selection-ს ემატება). anchor null ან უხილავი (search-ით დამალული, rescan-ის შემდეგ აღარ არის) → დღევანდელი ქცევა anchor-ის "
    "გარეშე: Ctrl/Cmd toggle, სხვა შემთხვევაში მხოლოდ clicked row. anchor ცოცხლობს metadata-ს განახლებას, D-28 Size/Date refresh-ს, "
    "sort-ის შეცვლას და search-ს, რომელიც მას ხილულს ტოვებს (item-ს მიჰყვება, არა row-ს). anchor იშლება, როცა selection ცარიელი ხდება "
    "(open folder, rescan, close, Deselect All). store არ იცვლება. Reference: GTK listview \"Implement extending selections\" (Windows "
    "Explorer-ის იმიტაცია, item tracker). გადახვევები: B-R21-02. pure fix; K-4 კონტრაქტს არ ეხება | B R21 close, ტექნიკური, შექცევადი; "
    "R22-ში ხორციელდება (TM-B25) |"
)

out = []
done_marker = any(l.startswith("| TM-B25 |") for l in lines)
for line in lines:
    if line.startswith("განახლდა: "):
        out.append(HEADER)
        continue
    if line.startswith("**round 20 დახურულია") and not any(l.startswith("**round 21 დახურულია") for l in lines):
        out.append(R21)
        out.append("")
        out.append(line)
        continue
    if line.startswith("**CI:**"):
        line = line.replace(
            "**თხოვნა root-ს (განახლდა B R20):** მიაბით `Check` run-ის id და შედეგი `b373b08`-ზე,",
            "**თხოვნა root-ს (განახლდა B R21):** მიაბით `Check` run-ის id და შედეგი `601dc4a`-ზე, `b373b08`-ზე,",
        ).replace("`gate-round-20.json`-ში Actions run ჯერ არ არის", "`gate-round-21.json`-ში Actions run ჯერ არ არის")
        out.append(line)
        continue
    if line.startswith("| TM-B24 |"):
        out.append(TM_B24_ROW)
        if not done_marker:
            out.append(TM_B25_ROW)
        continue
    if line.startswith("| RR-R19-02 |"):
        cells = line.split(" | ")
        cells[-1] = "**TM-B25** (round 22, D-31): B R21-მა component ტესტით გაიმეორა |"
        out.append(" | ".join(cells))
        continue
    if line.startswith("| A-R20-01 |"):
        cells = line.split(" | ")
        cells[-1] = "signal; B R21: UI-დან მიუღწეველია (B-R21-01) |"
        out.append(" | ".join(cells))
        continue
    if line.startswith("| C-R20-01 |"):
        out.append(line)
        if not any(l.startswith("| RR-R21-01 |") for l in lines):
            out.extend(NEW_FINDING_ROWS)
        continue
    if line.startswith("| D-30 |"):
        cells = line.split(" | ")
        cells[-1] = "**done** R21, published `601dc4a` (TM-B24; C R21-1…R21-5) |"
        out.append(" | ".join(cells))
        if not any(l.startswith("| D-31 |") for l in lines):
            out.append(D31_ROW)
        continue
    out.append(line)

with open(path, "w", encoding="utf-8") as fh:
    fh.write("\n".join(out))
