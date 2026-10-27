import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    lines = fh.read().split("\n")


def find_prefix(prefix):
    idx = [i for i, line in enumerate(lines) if line.startswith(prefix)]
    assert len(idx) == 1, (prefix, idx)
    return idx[0]


def has_prefix(prefix):
    return any(line.startswith(prefix) for line in lines)


HEADER = (
    "განახლდა: 2026-10-27, B round 23. round 23 **გამოქვეყნდა** (`59c26d6`, root-ის `bb4671d` v1.4.0 release commit-ის თავზე): "
    "TM-B26 done, D-32 done. round 24 = TM-B27 (MetadataPanel schema re-read, low, D-33): თვითკმარი mock-isolation ტესტი (i3) "
    "(RR-R23-01), save-ის re-read მიმდინარე schema-თი (A-R21-03), ჩავარდნილი schema re-read store-ის ჩანაწერებს ინახავს (B-R23-01), "
    "`handleSchemaChanged`-ის component ტესტები (C-R23-01), `docs/bugs/001`-ის განახლება. სტატუსი `done` ხდება მხოლოდ C-ის რეალური "
    "(არა offline) მტკიცებულებით."
)
lines[find_prefix("განახლდა: 2026-10-27, B round")] = HEADER

R23_PARA = (
    "**round 23 დახურულია (C PASS, R23-1…R23-6, realVerified=true, bugs 0):** D-32 დანერგილია (`handleSave`-ის snapshot ერთი "
    "`useMetadataStore.getState()`-ით, `editingMetadata` deps-იდან ამოღებულია, 6 cast წაიშალა, `grep -c \" as \"` 8 → 2). ძველი src + "
    "ახალი ტესტები 201/201 (behaviour-neutral, (z12) pin-ია); ხუთივე `beforeEach` ხაზი `mockClear`-ზე → (i2) ვარდება 1/49 (`promise "
    "rejected \"Error: leaked\" instead of resolving`); M7 (z12)-ით მოკლულია, MI-1…MI-5 (i2)-ით, MS-1 დაგეგმილი equivalent-ია და "
    "გადარჩა. gate 201/93/7, `--retries=0` 7/7, Biome **8** (იგივე სია). real built app + 3000 ms write delay: single (a: R23A/R23Single), "
    "batch (b, c: R23Batch), D-30 replay (Comment აკრეფილი write-ის დროს რჩება, Save enabled), schema editor-ში R23note-ის დამატება "
    "(ფორმა a-ს მნიშვნელობებს ინარჩუნებს, `Failed to read` არ არის); ffprobe და music-metadata ყველა ველზე ემთხვევა. "
    "`docs/bugs/001-save-and-selection-known-limits.md` 8 ჩანაწერით. root gate: published `59c26d6`, review COMMIT OK (low-ები "
    "RR-R23-01…03, არქიტექტურა RR-R23-04)."
)
if not has_prefix("**round 23 დახურულია"):
    i = find_prefix("**round 22 დახურულია")
    lines[i:i] = [R23_PARA, ""]

i = find_prefix("| TM-B26 |")
cells = lines[i].split("|")
cells[3] = " **done** (R23), realVerified=true "
cells[4] = (
    " **C R23** R23-1…R23-6 PASS, `59c26d6`: ძველი src + ახალი ტესტები 201/201, (i2) red `mockClear`-ზე 1/49, M7 + MI-1…5 მოკლულია, "
    "MS-1 equivalent; gate 201/93/7; real app single/batch/D-30/schema add, ffprobe + music-metadata "
)
lines[i] = "|".join(cells)

T27_ROW = (
    "| TM-B27 | MetadataPanel schema re-read: (a) (i2) არაფერს ამოწმებს, თუ მარტო ან სხვა რიგით გაეშვა (RR-R23-01); (b) save-ის "
    "დროს შენახული schema-ს შედეგს save-ის re-read click-ის დროის `fields`-ით გადაწერს: ახალი ველი store-სა და ფორმაში აკლია "
    "(A-R21-03); (c) `handleSchemaChanged`-ის ჩავარდნილი chunk read ამ ფაილებს metadata map-იდან აგდებს, list-ში untagged ჩანს, "
    "მონიშნული ფაილის ფორმა ცარიელდება (B-R23-01); `handleSchemaChanged`-ს component ტესტი არ ჰქონდა (C-R23-01) | in_progress (low), "
    "round 24 | B R23 experiment (`b-round-23-exp/`, `59c26d6`-ის /tmp ასლში): (s3), (s4), (s5) red ძველ src-ზე (`expected undefined "
    "to be 'fromfile'`, `expected '' to be 'ACat'`), D-33-ით 205/205; (i3) მარტო გადის, MI-all-ზე მარტოც ვარდება, `beforeEach` "
    "helper-ის გარეშე 24 ტესტს აგდებს; tsc 0, Biome 8 | D-33 |"
)
if not has_prefix("| TM-B27 |"):
    lines.insert(find_prefix("| TM-B26 |") + 1, T27_ROW)

i = find_prefix("| A-R21-03 |")
cells = lines[i].split("|")
cells[4] = " TM-B26 (round 23): `docs/bugs/001` entry 3; B R23: გასწორებადია product არჩევანის გარეშე → **TM-B27** (round 24, D-33 ნაწილი 1) "
lines[i] = "|".join(cells)

NEW_ROWS = [
    "| RR-R23-01 | low | `metadata-panel-batch-save.test.ts:1140-1156` (i2) იზოლაციას ამტკიცებს მხოლოდ მაშინ, როცა (i1) პირდაპირ მის წინ ეშვება; მარტო (`-t i2`) ან shuffle-ით არაფერს ამოწმებს | **TM-B27** (round 24): module-private `resetWindowApiMocks()` + თვითკმარი (i3); docs-comment ვარიანტი არა (no-comments წესი) |",
    "| RR-R23-02 | low | `docs/bugs/001` line ნომრებს hard-code-ით წერს; შემდეგ edit-ზე ძველდება | **TM-B27** (round 24) D-33-ის შემდეგ ყველა `MetadataPanel.tsx` reference-ს ასწორებს (C re-grep); signal: FileList/MetadataPanel-ის ყოველი edit იმავე round-ში ანახლებს docs-ს |",
    "| RR-R23-03 | low | (z12) D-31 deviation 1-ს ამაგრებს, რაც Saba-ს კითხვაა; Explorer-ის პასუხზე ტესტი განზრახ შებრუნდება | record only (= B-R21-02) |",
    "| RR-R23-04 | info | არქიტექტურა: `handleSave` store action-ში ან `useSaveMetadata` hook-ში `{ selectionUnchanged, typedDuringSave }`-ით, rendering-ის გარეშე ტესტირებადი; re-read `useSchemaStore.getState()`-ით entry 3-ს ასწორებს | signal (RR-R12-04, RR-R13-04, RR-R15-05, RR-R20-04, RR-R21-04); entry 3-ის ნაწილი = D-33 ნაწილი 1 (TM-B27), hook-ის გარეშე |",
    "| A-R23-01 | info | `handleSave`-ში `selectedFiles`/`fields` closure-იდან, `startSelection`/snapshot `getState()`-იდან; დღეს ვერ განსხვავდებიან | signal; D-33 `getState()`-ზე მხოლოდ re-read-ის schema-ს გადაიტანს |",
    "| A-R23-02 | info | (i1)-ის სახელი \"every window.api mock\" 16-დან 5-ს ეხება | **TM-B27**: (i1)/(i2)-ს (i3) ცვლის, სახელი ხუთ mock-ს ასახელებს |",
    "| C-R23-01 | info | `handleSchemaChanged` component ტესტით დაფარული არ არის (real app-ში მუშაობს) | **TM-B27** (round 24): `metadata-panel-schema-change.test.ts` (s1)–(s5) |",
    "| B-R23-01 | low | `handleSchemaChanged`: ჩავარდნილი chunk read ამ ფაილებს metadata map-იდან აგდებს; list untagged-ს აჩვენებს, sync effect მონიშნული ფაილის ფორმას ცარიელს ხდის rescan-მდე. დისკზე ფაილები უცვლელია (B experiment (s3)) | **TM-B27** (round 24, D-33 ნაწილი 2) |",
    "| B-R23-02 | low | A-R21-03-ის შებრუნებული რიგი: write-ის დასრულებამდე დაწყებული schema re-read, რომელიც save-ის re-read-ის შემდეგ სრულდება, store-სა და ფორმაში write-მდელ მნიშვნელობებს წერს (isDirty false) შემდეგ წაკითხვამდე; ფაილი სწორია. D-33 ამ რიგს არ ფარავს (B code reading) | **TM-B27**: `docs/bugs/001` entry 9 (ცნობილი შეზღუდვა); ნამდვილი fix = read token ან schema editor-ის ჩაკეტვა save-ის დროს (UX → Saba) |",
    "| B-R23-03 | low | schema-ს შენახვა (Done) unsaved edits-ით მათ ჩუმად ცვლის: `setEditingMetadata` `modifiedFields`/`isDirty`-ს წმენდს, `Unsaved changes were discarded` toast არ ჩანს (selection-ის გზაზე ჩანს) (B code reading) | Saba-ს კითხვა (toast, D-30-ის მსგავსი merge, ან Customize Fields-ის ჩაკეტვა dirty-ზე); **TM-B27**: `docs/bugs/001` entry 10 |",
]
anchor = find_prefix("| A-R22-03 |")
for offset, row in enumerate([r for r in NEW_ROWS if not has_prefix(r.split(" |")[0] + " |")]):
    lines.insert(anchor + 1 + offset, row)

i = find_prefix("| D-32 |")
cells = lines[i].split("|")
cells[3] = " **done** R23 (`59c26d6`, TM-B26; C R23-1…R23-6) "
lines[i] = "|".join(cells)

D33_ROW = (
    "| D-33 | MetadataPanel schema re-read (TM-B27): (1) `handleSave`-ის save-ის შემდეგი re-read (single `readMetadata`, batch "
    "`readMetadataBatch`) იყენებს re-read-ის მომენტის schema-ს, `useSchemaStore.getState().fields`; write click-ის დროის `fields`-ით "
    "რჩება. save-ის დროს შენახული schema save-ის re-read-ს გადაურჩება (A-R21-03). (2) `handleSchemaChanged` ჩავარდნილი chunk-ის "
    "ყოველ path-ს store-ის მიმდინარე ჩანაწერს უტოვებს, metadata map-იდან არ აგდებს (D-22-ის ანალოგი); `Failed to read N files` toast "
    "რჩება. D-21…D-32 უცვლელია. K-4 კონტრაქტს არ ეხება (მხოლოდ renderer-ის ჩვენება) | B R23 close, ტექნიკური, შექცევადი; R24-ში "
    "ხორციელდება (TM-B27) |"
)
if not has_prefix("| D-33 |"):
    lines.insert(find_prefix("| D-32 |") + 1, D33_ROW)

with open(path, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines))
