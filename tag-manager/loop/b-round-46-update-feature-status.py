PATH = "/home/runner/czaba-project/tmp/tag-manager-loop/feature-status.md"

with open(PATH, encoding="utf-8") as fh:
    lines = fh.read().split("\n")


def replace_line(prefix, new_line):
    for i, line in enumerate(lines):
        if line.startswith(prefix):
            lines[i] = new_line
            return i
    raise KeyError(prefix)


def insert_after(prefix, new_lines):
    for i, line in enumerate(lines):
        if line.startswith(prefix):
            lines[i + 1:i + 1] = new_lines
            return
    raise KeyError(prefix)


def replace_tail(prefix, old, new):
    for i, line in enumerate(lines):
        if line.startswith(prefix):
            if old not in line:
                raise KeyError(old)
            lines[i] = line.replace(old, new)
            return
    raise KeyError(prefix)


assert lines[2].startswith("განახლდა: 2026-10-28, B round 45")
lines[2] = (
    "განახლდა: 2026-10-28, B round 46 დახურვა / round 47 დაგეგმვა. round 46 **PASS** (C R46-1…R46-8, realVerified=true, bugs 0): "
    "renderer 326/326, main 120/120, E2E 7/7 (`--retries=0` 7/7). real app-ში custom Number ველი (Take) Title-only save-ზე აღარ იწერება "
    "(c822d7f build-ზე `TAKE='0'` იწერებოდა). აკრეფილი `0` იწერება `'0'`-ად სამივე reader-ში და მწკრივი Tagged ხდება. single და batch გასუფთავება "
    "ID-ს შლის. root-მა გამოაქვეყნა **1ea34df** → D-50 **verified**, **TM-B11 done** (ორივე stage). "
    "**round 47 = TM-B05 (Saba Q5, D-51):** WAV, რომელსაც ბიბლიოთეკა „WAV file is missing data chunk“-ით უარყოფს, save-ზე იღებს per-file შეცდომას "
    "„Audio data is empty, cannot tag“ (single toast და batch-ის `failed[].error`); ფაილი არ იცვლება. read უცვლელია. "
    "შემდეგი: Q3 (TM-B08) → Q6 (TM-B06). Q7 ისევ Saba-ს ელოდება (TM-T2-DATA → TM-T2); Q9–Q21 ღიაა. "
    "**ახალი კითხვები Saba-სთვის (არ ბლოკავს):** "
    "**Q22** — ფაილი, რომელსაც tag-ი ვერ ეწერება (ცარიელი აუდიო), წაკითხვისას უნდა მოინიშნოს? დღეს ცარიელ ველებს აჩვენებს და შეცდომა მხოლოდ save-ზე ჩანს. "
    "**Q23** — batch save-ის toast („1 saved, 1 failed“) ფაილების მიზეზებსაც აჩვენოს? დღეს მიზეზი მხოლოდ single save-ზე ჩანს. "
    "**Q24** — standard Year/Track #/BPM-ში აკრეფილი `0` ბიბლიოთეკას არ შეუძლია შეინახოს და save-ის შემდეგ ველი ცარიელდება; "
    "ველს `min=1` დავუწესოთ, მინიშნება ვაჩვენოთ, თუ დავტოვოთ (RR-R46-01)? "
    "**FYI (D-50):** ძველი build-ებით ჩაწერილი `ITKN='0'` ახლა `0`-ად და Tagged-ად ჩანს (RR-R46-04). "
    "სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით."
)

insert_after("", [])  if False else None
for i, line in enumerate(lines):
    if line.startswith("**round 45 დახურულია"):
        lines[i:i] = [
            "**round 46 დახურულია (C PASS, R46-1…R46-8, realVerified=true, bugs 0):** შეიცვალა მხოლოდ owned path-ები; red c822d7f-ის `src`-ზე main 9 failed / 13 passed, "
            "renderer 6 failed; mutant-ები M1, M1b, M2–M5 მოკლულია. A-მ number input-ში `String(v)`-ის ნაცვლად `value={v}` გამოიყენა (code-reviewer F1, `1.05` აღარ ხდება `15`; C-მ მიიღო, A-R46-01). "
            "root review COMMIT OK, 4 low და 1 architecture signal (RR-R46-01…05). process: A-მ სამი ხაზი `sed -i`-ით შეცვალა (C-R46-01) — round 47-ში წესი ხელახლა წერია.",
            "",
        ]
        break

replace_line(
    "| TM-B11 |",
    "| TM-B11 | schema-ში custom Number ველისას ყოველი save წერს `ITKN=\"0\"`-ს (C-R6-01); ცარიელი text/tags იწერებოდა size-0 sub-chunk-ად (`IKEY=\"\"`, `ICAT=\"\"`, `RNOT=''`) "
    "| **done** — stage 1 (D-49) verified + published c822d7f; stage 2 (D-50) verified + published 1ea34df (C R46 PASS) "
    "| C R45-1…R45-7 (`c-round-45/`); C R46-1…R46-8 (`c-round-46/`); C R6: `c-round-6/r6-result.json` | Saba Q4 (D-10 გადაწყდა): ცარიელი არ იწერება, `0` გამოხატვადი რჩება |",
)
replace_line(
    "| TM-B05 |",
    "| TM-B05 | ცარიელი data chunk-ის მქონე WAV-ს tag-ი ვერ ეწერება (node-taglib-sharp 6.0.1) | in_progress — round 47 (D-51) | B R0, C R1-5, B R46 probe | "
    "Saba Q5: მკაფიო per-file შეცდომა „Audio data is empty, cannot tag“ + ტესტი, upstream patch-ის გარეშე; read-ის მხარე → Q22 |",
)
replace_line(
    "| RR-R5-03 |",
    "| RR-R5-03 | info | number ველი Tagged-ია მხოლოდ `> 0`-ზე | **closed** — D-50 / D-15, C R46-5 (აკრეფილი 0 → Tagged), `1ea34df` |",
)
replace_line(
    "| C-R6-01 |",
    "| C-R6-01 | low | custom Number ველი → ყოველი save `ITKN=\"0\"` (size 1), pre-existing | **closed** — D-50, C R46-4 (c822d7f build-ის contrast-ით), `1ea34df` |",
)
insert_after("| A-R45-01 |", [
    "| RR-R46-01 | low | standard Year/Track #/BPM-ში `0` → ბიბლიოთეკა item-ს შლის და save-ის შემდეგ ველი უსიტყვოდ ცარიელდება (D-50 Deviation 1) | Saba Q24 (UX, reference-first) |",
    "| RR-R46-02 | low | number სვეტით sort `''`-ს და რიცხვებს `localeCompare`-ით ადარებს; რიგი სწორია, მაგრამ ტესტი არ არის | signal (test gap) |",
    "| RR-R46-03 | info | number input ნაწილობრივ აკრეფაზე (`-`, `1e`) `''`-ს აბრუნებს, ველი აკრეფისას unset-ია | signal, ცვლილების გარეშე |",
    "| RR-R46-04 | info | ძველი build-ის `ITKN='0'` ახლა 0-ად და Tagged-ად ჩანს | record (D-50 Deviation 3) |",
    "| RR-R46-05 | low | number-ის მნიშვნელობა სამ ადგილასაა (main, panel, TemplatePicker `parseInt`); template dialog `1.5`-ს `1`-მდე ჭრის, panel `1.05`-ს ინახავს. shared `toNumberFieldValue` | signal (architecture) |",
    "| C-R46-01 | low | process: A-მ `metadata.ts`-ის სამი ხაზი `sed -i`-ით შეცვალა Edit tool-ის ნაცვლად | process; round 47-ში წესი ხელახლა |",
    "| A-R46-01 | info | number input `value={v}` `String(v)`-ის ნაცვლად (F1: `1.05` → `15` ბაგი), (r5) აფიქსირებს | record, მიღებულია (D-50 notes) |",
    "| C-R46-02 | info | (r3) c822d7f-ზე მწვანეა (ძველი 0 main read-იდან მოდიოდა); red მხარე = (n2) | record |",
    "| C-R46-03 | info | music-metadata ICMT `კარი`-ს latin1-ად კითხულობს, ffprobe სწორად | signal (C-R6-02-თან) |",
])
replace_tail("| D-50 |", "| planned round 46 (TM-B11 stage 2; Saba Q4) |",
             "| **verified** C R46 PASS, published `1ea34df` (TM-B11 stage 2; Saba Q4); input `value={v}` (A-R46-01) |")
insert_after("| D-50 |", [
    "| D-51 | TM-B05 (Saba Q5): `writeTagsToFile` ფაილს module-private helper-ით ხსნის; თუ `File.createFromPath` ისვრის შეცდომას ზუსტად "
    "„WAV file is missing data chunk“ (6.0.1-ის ტექსტი; ასევე data chunk-ის გარეშე და ფაილზე დიდი data size-ისას), ისვრის `Error('Audio data is empty, cannot tag')`. "
    "`meta:write` → „Failed to write metadata: Audio data is empty, cannot tag“ (toast-ს Electron-ის prefix ემატება, როგორც დღეს); `meta:write-batch` → ამ ფაილის "
    "`failed[].error` = „Audio data is empty, cannot tag“, დანარჩენი ფაილები იწერება. სხვა შეცდომების ტექსტი უცვლელია. ფაილი არ იცვლება. read უცვლელია (Q22). "
    "კონტრაქტს არ ეხება (არაფერი იწერება) | planned round 47 (Saba Q5) |",
])
replace_tail("| D-15 |", "R46 (planned): number წესი იცვლება D-50-ით — finite number (0 და უარყოფითიც) = tagged",
             "R46: number წესი შეიცვალა D-50-ით — finite number (0 და უარყოფითიც) = tagged (**verified** C R46-5, `1ea34df`)")

with open(PATH, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines))
print("ok")
