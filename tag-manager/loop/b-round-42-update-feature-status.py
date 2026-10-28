PATH = "/home/runner/czaba-project/tmp/tag-manager-loop/feature-status.md"

with open(PATH, encoding="utf-8") as fh:
    lines = fh.read().split("\n")


def index_of(prefix):
    hits = [i for i, line in enumerate(lines) if line.startswith(prefix)]
    if len(hits) != 1:
        raise SystemExit(f"expected one line starting with {prefix!r}, got {len(hits)}")
    return hits[0]


lines[index_of("განახლდა: ")] = (
    "განახლდა: 2026-10-28, B round 42 დახურვა / round 43 დაგეგმვა. round 42 **PASS** (C R42-1…R42-7, realVerified=true), "
    "published `cf4e147`, review COMMIT OK. **TM-T1-DUP done** (D-47 verified), RR-R3-01 closed. "
    "**round 43 = TM-B44** (Saba Q8, medium RR-R19-01 / B-R18-01, D-48): save-ის D-28 stats refresh სრული რეკურსიული `scanFolder`-ის ნაცვლად "
    "ვიწრო `fs:stat-files` IPC-ით მხოლოდ ჩაწერილ path-ებს კითხულობს; იმავე რაუნდში C-R42-01-ის docs შესწორება (001 entry 23 Reference). "
    "შემდეგი: Q4 (TM-B11) → Q5 (TM-B05) → Q3 (TM-B08) → Q6 (TM-B06). Q7 (UCS სია + ლიცენზია) ისევ Saba-ს ელოდება (TM-T2-DATA → TM-T2); "
    "Q9–Q17 ღიაა; Q18 (B-R42-01) ახლა R42-6-ის ფაქტითაც: სტანდარტული Category-ის Hide (X) custom ველის განსაზღვრებასაც შლის; ახალი Q19 (D-47-ის განზოგადების დადასტურება). "
    "სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით."
)

r41 = index_of("**round 41 დახურულია")
lines.insert(r41, "")
lines.insert(
    r41,
    "**round 42 დახურულია (C PASS, R42-1…R42-7, realVerified=true):** შეიცვალა მხოლოდ 6 owned path (`SchemaEditor.tsx`, `schema-editor.test.ts`, 4 docs), "
    "helper ფაილი არ შექმნილა. red: `a5c6a6b`-ის src + ახალი ტესტ-ფაილი 7 failed / 4 passed → green 11/11. real app (planted `schema.json`): "
    "(a) custom `category`/`CATE` და (b) custom `ucs_cat`/`ICAT` → `+ Category (UCS)` chip არ ჩანს, ზუსტი warning, color `rgb(245, 158, 11)`; "
    "save `DOORWood` → (a) მხოლოდ `CATE`, `ICAT` არც ერთ reader-ში (raw INFO, music-metadata, ffprobe); (b) ზუსტად ერთი `ICAT`. Trash2 → chip ბრუნდება. "
    "R42-5 (D-07): 13 key, relaunch-ის შემდეგ `ICAT=DOORWood`. gate EXIT=0: renderer 317, main 93, E2E 7/7 (`--retries=0` 7/7). "
    "R42-6 (Q18): ორივე ველის შემცველ schema-ში ერთი მნიშვნელობა `ICAT`-შიც და `CATE`-შიც იწერება, Hide (X) ორივე ველს შლის. C-R42-01 (low): B-ის Mp3tag reference წყაროებით არ დასტურდება → round 43.",
)

dup = index_of("| TM-T1-DUP |")
lines[dup] = (
    "| TM-T1-DUP | ძველი custom ველი `ICAT` ID-ით ან `category` key-ით (მაგ. auto `CATE`) + ახალი სტანდარტული ველი | **done** (round 42), realVerified=true | "
    "C R42-1…R42-7 PASS, published `cf4e147`: chip იმალება + warning, guard, ერთი `ICAT` writer (სამი reader), D-07 რეგრესია მწვანე | "
    "— (ორივე ველის შემცველი schema: B-R42-01 / Q18; განზოგადება: Q19) |"
)

b43 = index_of("| TM-B43 |")
lines.insert(
    b43 + 1,
    "| TM-B44 | ყოველი save ელოდება ღია folder-ის სრულ რეკურსიულ `scanFolder`-ს (D-28 stats refresh) `isSaving`-ის დროს; ნელია 1000+ ფაილზე ან network drive-ზე (RR-R19-01, B-R18-01) | "
    "in_progress (round 43, D-48; Saba Q8: preload-ში მხოლოდ `fs:stat-files`) | root review R19 (medium); C R19: 169 ms 200 ფაილზე | "
    "round 43: `fs:stat-files` + renderer chunk-ები 50-ით; C: preload diff, real app Size/Date, დროის შედარება `cf4e147`-თან |",
)

rr301 = index_of("| RR-R3-01 |")
lines[rr301] = "| RR-R3-01 | medium | ძველი custom `category` (`CATE`) + სტანდარტული toggle → ორი ველი ერთი key-ით | **closed**: TM-T1-DUP round 42 (D-47; C PASS, `cf4e147`) |"

rr4103 = index_of("| RR-R41-03 |")
new_rows = [
    "| RR-R19-01 / B-R18-01 | medium / info | save ელოდება სრულ რეკურსიულ `scanFolder`-ს | TM-B44 round 43 (D-48, Saba Q8) |",
    "| B-R42-01 | low | ორივე ველის (სტანდარტული `category`/`ICAT` + custom `category`/`CATE`) შემცველი `schema.json` არ სწორდება. C R42-6: ერთი მნიშვნელობა ორ chunk-ში; Hide (X) **ორივე** ველს შლის (custom ველის განსაზღვრება იკარგება; WAV-ის მონაცემი ხელუხლებელია) | Saba Q18 |",
    "| B-R42-02 | info | TM-B11-ის რაუნდმა T1-10 და K-4 docs უნდა შეცვალოს; C R42-4: ცარიელი `IKEY` (size 0) კვლავ იწერება | TM-B11 (Saba Q4) |",
    "| C-R42-01 | low | B-ის Mp3tag reference (R1) cited წყაროებში არ არის: thread მხოლოდ TXXX-ზე საუბრობს, mapping docs same-name შემთხვევას არ ეხება; 001 entry 23 მას ფაქტად წერს | round 43 docs შესწორება |",
    "| RR-R42-01 | low | `riffChunkId` შედარება case-sensitive-ია; ხელით ჩაწერილი `icat` chip-ს არ ბლოკავს. writer ID-ს უცვლელად წერს (`metadata.ts:179-197`), ამიტომ ეს ცალკე `icat` chunk-ია და არა მეორე `ICAT` writer | signal: Q13 / RR-R42-04 |",
    "| RR-R42-02 | low | D-47 warning უბრალო `<p>`-ია, chip-თან კავშირის გარეშე (a11y; შეტყობინება ველს ასახელებს) | record (Q9–Q17-თან) |",
    "| RR-R42-03 | low | D-47 ყველა 13 სტანდარტულ ველზე ვრცელდება; განზოგადება B-ისაა | Saba Q19 |",
    "| RR-R42-04 | info | არქიტექტურის signal: ერთი წესი („ერთი key / RIFF ID = ერთი ველი“) ორ ადგილასაა; საერთო `findFieldSlotConflict` schema-store-ში | signal |",
    "| A-R42-01 | info | `standard` flag-ის გარეშე ხელით ჩაწერილი სტანდარტული ველი custom-ად ითვლება და საკუთარ ტყუპზე warning-ს იწვევს | signal: Q13 |",
    "| A-R42-02 | info | T-e guard-ს `getState`-ის mock-ით ამოწმებს (UI-დან მხოლოდ race-ით მიღწევადი) | record |",
]
for offset, row in enumerate(new_rows, start=1):
    lines.insert(rr4103 + offset, row)

d47 = index_of("| D-47 |")
cells = lines[d47].split(" | ")
cells[-1] = "**verified** (C R42 PASS, published `cf4e147`; Saba Q2; ყველა სტანდარტულ ველზე განზოგადება — Saba Q19) |"
lines[d47] = " | ".join(cells)
lines.insert(
    d47 + 1,
    "| D-48 | D-28-ის stats refresh save-ის შემდეგ მხოლოდ ჩაწერილ path-ებს კითხულობს ახალი `fs:stat-files` არხით (`window.api.statFiles(paths)` → `WavFileEntry[]`), და არა სრული რეკურსიული `scanFolder(folderPath)`-ით. main: ≤ 50 არაცარიელი string-ის მასივი, სხვა შემთხვევაში `Invalid paths`; `.wav` (case-insensitive) ჩვეულებრივი ფაილი → `{ name: basename, path: input, size, modifiedAt }`, დანარჩენი გამოტოვებულია, რიგი = input. renderer: chunk-ები 50-ით, თანმიმდევრულად, re-read-მდე; reject-ილი chunk ჩუმად გამოიტოვება. D-28-ის დანარჩენი წესები უცვლელია. K-4-ს არ ეხება | planned, round 43 (TM-B44; Saba Q8) |",
)

with open(PATH, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines))
print("ok")
