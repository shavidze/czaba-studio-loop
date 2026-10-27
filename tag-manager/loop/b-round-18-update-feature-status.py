import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    s = fh.read()


def replace_once(text, old, new, marker):
    if marker in text:
        return text
    if text.count(old) != 1:
        raise SystemExit(f"anchor not unique or missing: {old[:80]!r}")
    return text.replace(old, new)


def insert_after(text, anchor_line_start, new_line, marker):
    if marker in text:
        return text
    lines = text.split("\n")
    idx = [i for i, ln in enumerate(lines) if ln.startswith(anchor_line_start)]
    if len(idx) != 1:
        raise SystemExit(f"anchor line not unique: {anchor_line_start!r}")
    lines.insert(idx[0] + 1, new_line)
    return "\n".join(lines)


old_header = s.split("\n")[2]
new_header = (
    "განახლდა: 2026-10-27, B round 18. round 18 **გამოქვეყნდა** (`d015470`): TM-B21 done. round 19 = TM-B22 "
    "(D-28, Size/Date სვეტები save-ის შემდეგ). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით."
)
if old_header.startswith("განახლდა:") and old_header != new_header:
    lines = s.split("\n")
    lines[2] = new_header
    s = "\n".join(lines)

r18 = (
    "**round 18 დახურულია (C PASS, R18-1…R18-5, realVerified=true, bugs 0):** D-27 დანერგილია (private `getFieldSortKey`). "
    "red `4f8a578` worktree-ზე 6 failed / 30 passed (ყველა `aStr.localeCompare is not a function`; (c)-ის 5 pin ძველზეც გადის), green 36/36; "
    "M1–M5 მოკლულია (M5 order assertion-ით). gate 146/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია). real built app: Artist asc/desc, "
    "Genre asc, shift-click range sort-ის რიგით, დანარჩენი header-ები page error-ის გარეშე, relaunch იგივე; ffprobe + music-metadata genre (`IGNR`); "
    "artists მხოლოდ ჩაწერილია (TM-B08). malformed ელემენტი მხოლოდ unit/component ტესტებით მოწმდება. root gate: published `d015470`, review "
    "COMMIT OK (low-ები → RR-R18-01…04)."
)
s = insert_after(s, "განახლდა:", "\n" + r18, "**round 18 დახურულია")

s = replace_once(
    s,
    "**თხოვნა root-ს (განახლდა B R17):** მიაბით `Check` run-ის id და შედეგი `4f8a578`-ზე, `cb2d76b`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-17.json`-ში Actions run ჯერ არ არის.",
    "**თხოვნა root-ს (განახლდა B R18):** მიაბით `Check` run-ის id და შედეგი `d015470`-ზე, `4f8a578`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-18.json`-ში Actions run ჯერ არ არის.",
    "განახლდა B R18):** მიაბით",
)

old_b21 = [ln for ln in s.split("\n") if ln.startswith("| TM-B21 |")]
if len(old_b21) != 1:
    raise SystemExit("TM-B21 row")
new_b21 = (
    "| TM-B21 | file list-ის sort array ველით ისროდა `aStr.localeCompare is not a function`-ს, როცა პირველი ელემენტი string არ იყო "
    "(`[5]`, `[{}]`, `[true]`) (A-R17-01). defensive: რეალური app-იდან არ მიიღწევა | **done** (R18), realVerified=true | **C R18** R18-1…R18-5 PASS: "
    "red `4f8a578` 6 failed, green 36/36; M1–M5 მოკლულია; gate 146/93/7, `--retries=0` 7/7; real app sort regression ffprobe + music-metadata-ით; "
    "malformed case მხოლოდ unit/component. published `d015470` | — (RR-R18-01…04, A-R18-01/02 signal-ები) |"
)
s = s.replace(old_b21[0], new_b21)

old_b22 = [ln for ln in s.split("\n") if ln.startswith("| TM-B22 |")]
if len(old_b22) != 1:
    raise SystemExit("TM-B22 row")
new_b22 = (
    "| TM-B22 | Size და Date სვეტები save-ის შემდეგ ძველ მნიშვნელობას აჩვენებს rescan-მდე (`WavFileEntry.size`/`modifiedAt` მხოლოდ folder scan-იდან "
    "მოდის) (C-R17-01). რეალურ app-ში მიიღწევა | in_progress (low), round 19 | C R17-5: save-ის შემდეგ 86.2 KB, relaunch-ის შემდეგ 87.6 KB. B R18 probe: "
    "`meta:write` აბრუნებს `void`-ს, preload დაცულია, ყველა ფაილი `folderPath`-ის ქვეშაა → `scanFolder(folderPath)` ერთადერთი წყაროა | round 19: D-28 |"
)
s = s.replace(old_b22[0], new_b22)

s = s.replace(
    "| A-R17-01 | low | `file-store.ts:125-127` sort array ველით: `aVal[0] ?? ''` + `aStr.localeCompare` → არა-string პირველ ელემენტზე `TypeError` `useFilteredFiles`-ში (FileList) და `selectRange`-ში; რიგზეა დამოკიდებული (B probe). რეალური app-იდან მიუღწეველია | TM-B21, round 18 (D-27) |",
    "| A-R17-01 | low | `file-store.ts:125-127` sort array ველით: `aVal[0] ?? ''` + `aStr.localeCompare` → არა-string პირველ ელემენტზე `TypeError` `useFilteredFiles`-ში (FileList) და `selectRange`-ში; რიგზეა დამოკიდებული (B probe). რეალური app-იდან მიუღწეველია | **closed** — TM-B21 (D-27), C R18, `d015470` |",
)
s = s.replace(
    "| root: job-ის `~/.claude/settings.json` hook-ები; R18 task: მხოლოდ Edit/Write |",
    "| root: job-ის `~/.claude/settings.json` hook-ები; R18 task: მხოლოდ Edit/Write. R18: hook კვლავ არ ამოქმედდა (A), C ირიბად ადასტურებს |",
)
s = s.replace(
    "| C-R17-01 | low | Size სვეტი save-ის შემდეგ ძველია rescan-მდე (86.2 KB → relaunch-ზე 87.6 KB); რეალურ app-ში მიიღწევა | TM-B22 (todo) |",
    "| C-R17-01 | low | Size სვეტი save-ის შემდეგ ძველია rescan-მდე (86.2 KB → relaunch-ზე 87.6 KB); რეალურ app-ში მიიღწევა | TM-B22, round 19 (D-28) |",
)

new_rows = [
    "| RR-R18-01 | low | `getFieldSortKey`: არა-array malformed მნიშვნელობა (`{\"artists\":{}}`) კვლავ `'[object Object]'`-ად სორტირდება (throw არ არის, R18-მა არ შეცვალა) | signal (A-R18-01, RR-R17-04-თან) |",
    "| RR-R18-02 | low | number vs ტექსტი/გამოტოვებული ტექსტად შედარდება (`'120'` vs `''`); უცვლელია, R18 (c) pin-ით დაფიქსირებული | signal, product არჩევანი |",
    "| RR-R18-03 | low | R18 store ტესტები sort-ის რიგს `selectRange`-ით კითხულობს (selection-ზეა მიბმული); `renderHook(useFilteredFiles)` ნაკლებად მყიფე იქნებოდა | signal; `file-store.test.ts`-ის შემდეგ შეხებაზე |",
    "| RR-R18-04 | info | არქიტექტურა: TM-B20 და TM-B21 ორივე არა-string array ელემენტს იცავს; metadata ერთხელ normalise IPC საზღვარზე ან `setMetadata`/`updateFileMetadata`-ში | signal (RR-R17-04, RR-R6-05, RR-R5-06-თან), არა task |",
    "| A-R18-01 | low | არა-array malformed object, რომლის `toString` არ არის callable, `String(v)`-ზე ისვრის; D-27-მა არა-array path განზრახ უცვლელი დატოვა | signal (RR-R18-01, RR-R18-04-თან) |",
    "| A-R18-02 | info | R18-3 M2-ს მხოლოდ `[true]` კლავს და ICU collation-ზეა დამოკიდებული; `['!']`-ის მსგავსი მეზობელი ან key-ს პირდაპირი assertion უკეთესი იქნებოდა | signal |",
    "| C-R18-01 | info | R18-3 M3 direct tie-ით განხორციელდა (`return 0`, როცა ზუსტად ერთი მხარე number-ია); იგივე observable tie, იგივე ტესტით მოკლული | record only |",
    "| B-R18-01 | info | D-28 Size/Date-ს ყოველ save-ზე ერთი სრული recursive `scanFolder`-ით ანახლებს, რადგან preload დაცულია; ცალკე `fs:stat-files` channel (main + preload) მხოლოდ ჩაწერილ path-ებს გააკეთებდა stat-ს. C R19-ში ~200 ფაილზე save-ის დროს ჩაწერს (დაკვირვება) | Saba-ს კითხვა (preload-ის ცვლილების ნებართვა) |",
]
anchor = "| C-R17-01 |"
for row in reversed(new_rows):
    rid = row.split("|")[1].strip()
    s = insert_after(s, anchor, row, f"| {rid} |")

s = s.replace(
    "pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | B R17 close, ტექნიკური, შექცევადი; R18-ში ხორციელდება (TM-B21) |",
    "pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | **done** R18, published `d015470` (TM-B21; C R18-1…R18-5) |",
)
d28 = (
    "| D-28 | Size/Date სვეტების განახლება save-ის შემდეგ (TM-B22): დადასტურებული write-ის შემდეგ `MetadataPanel` იძახებს "
    "`window.api.scanFolder(folderPath)`-ს და ჩაწერილი ფაილების `size`/`modifiedAt`-ს ახალი file-store action-ით "
    "`updateFileStats(entries: WavFileEntry[])` ანახლებს: არსებული entry-ები path-ით patch-დება, არაფერი ემატება, იშლება ან გადალაგდება; "
    "`name`/`path`, `selectedPaths` და `metadata` უცვლელია. რიგი: write → refresh (await) → re-read → არსებული ლოგიკა, ასე რომ D-24-ის "
    "re-read-rejects path-იც ანახლებს. single: ერთი path; batch: `result.failed`-ში არმყოფი path-ები, მხოლოდ `succeeded > 0`-ზე. refresh არ ხდება, "
    "თუ write reject-დება ან `folderPath` არის `null`. `scanFolder`-ის reject ჩუმია (სვეტები ძველი რჩება; toast, `isDirty`, edits უცვლელია), რადგან "
    "save თავად წარმატებულია. main, preload, ტიპები, `FileList.tsx` უცვლელია. ფასი: ერთი recursive scan ყოველ save-ზე (B-R18-01). pure fix: "
    "reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | B R18 close, ტექნიკური, შექცევადი; R19-ში ხორციელდება (TM-B22) |"
)
s = insert_after(s, "| D-27 |", d28, "| D-28 |")

with open(path, "w", encoding="utf-8") as fh:
    fh.write(s)
