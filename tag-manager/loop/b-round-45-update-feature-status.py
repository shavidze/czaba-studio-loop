PATH = "/home/runner/czaba-project/tmp/tag-manager-loop/feature-status.md"

with open(PATH, encoding="utf-8") as fh:
    lines = fh.read().split("\n")


def replace_row(prefix, new_row):
    for i, line in enumerate(lines):
        if line.startswith(prefix):
            lines[i] = new_row
            return
    raise KeyError(prefix)


def insert_after_row(prefix, new_rows):
    for i, line in enumerate(lines):
        if line.startswith(prefix):
            lines[i + 1:i + 1] = new_rows
            return
    raise KeyError(prefix)


header = (
    "განახლდა: 2026-10-28, B round 45 დახურვა / round 46 დაგეგმვა. round 45 **PASS** (C R45-1…R45-7, realVerified=true, bugs 0): "
    "renderer 320/320, main 109/109, E2E 7/7 (`--retries=0` 7/7); real app-ში ცარიელი Keywords/Category/custom Note აღარ იწერება და "
    "გასუფთავებული მნიშვნელობა სამივე reader-ში (raw INFO, ffprobe, music-metadata) ქრება. root-მა გამოაქვეყნა **c822d7f** → D-49 **verified**, "
    "TM-B11 stage 1 დასრულდა. **round 46 = TM-B11 stage 2 (Saba Q4, D-50):** number ველის unset marker = `''` (read, input, write); "
    "აკრეფილი `0` იწერება `'0'`-ად; badge ნებისმიერ finite number-ს ითვლის (D-15 იცვლება); template `0`-ს ინახავს. TM-B11 `in_progress` რჩება stage 2-ის C მტკიცებულებამდე. "
    "შემდეგი: Q5 (TM-B05) → Q3 (TM-B08) → Q6 (TM-B06). Q7 ისევ Saba-ს ელოდება (TM-T2-DATA → TM-T2); Q9–Q20 ღიაა. "
    "**Q21 (ახალი, არ ბლოკავს):** batch ფორმა ველებს ცარიელად აჩვენებს, ამიტომ batch-ში ველის გასუფთავება მხოლოდ „აკრიფე და წაშალე“ ხერხით ხერხდება (C-R45-02). "
    "**FYI Saba / importer-ის owner (RR-R45-01):** ცარიელ ფაილზე `LIST/INFO` შეიძლება არსებობდეს sub-chunk-ების გარეშე (size 4); ეს d886bef-ზეც ასე იყო standard ველებით, importer-ის წესი „არ არის = მნიშვნელობა არ არის“ ამას ფარავს. "
    "სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით."
)
assert lines[2].startswith("განახლდა: 2026-10-28, B round 44")
lines[2] = header

closed45 = (
    "**round 45 დახურულია (C PASS, R45-1…R45-7, realVerified=true, bugs 0):** შეიცვალა მხოლოდ 5 owned path; "
    "red d886bef-ის `metadata.ts`-ზე 10 failed / 10 passed (T1-10a/b, e1–e5, e7, e10, e11), green 31/31; mutant M1 (trim) და M2 (`['']`) მოკლულია, "
    "M3 (workaround ყოველთვის) ცოცხალია → RR-R45-02 (workaround real WAV-ზე, სავარაუდოდ, არ მიიღწევა, A F1). verifyCommand EXIT=0. "
    "real app: R45-4 Keywords-ის გასუფთავება IKEY-ს შლის, ICAT/ICMT უცვლელია; R45-5 ახალ WAV-ზე IKEY/ICAT/NOTE არ ჩნდება; R45-6 3-file batch-ში IKEY ქრება, ICAT-ები რჩება, "
    "მოუნიშნავი ფაილები sha256-ით იდენტურია. d886bef build-ის contrast-ში `IKEY:0`/`ICAT:0` ჩანს. root review COMMIT OK: 1 medium FYI (RR-R45-01), 3 low, 1 architecture note."
)
lines.insert(4, closed45)
lines.insert(5, "")

replace_row(
    "| TM-B11 |",
    "| TM-B11 | schema-ში custom Number ველისას ყოველი save წერს `ITKN=\"0\"`-ს (C-R6-01); ცარიელი text/tags იწერებოდა size-0 sub-chunk-ად (`IKEY=\"\"`, `ICAT=\"\"`, `RNOT=''`) | "
    "in_progress — stage 1 (text/tags, D-49) **verified + published c822d7f** (C R45 PASS); stage 2 (numbers, D-50) = round 46 | "
    "C R45-1…R45-7 (`c-round-45/`); C R6: `c-round-6/r6-result.json` | Saba Q4 (D-10 გადაწყდა): ცარიელი არ იწერება, `0` გამოხატვადი რჩება |",
)

replace_row(
    "| C-R1-01 |",
    "| C-R1-01 | low | ცარიელი Keywords → `IKEY=\"\"`. Save ამატებს `id3 `, `LIST/MID `, `IDVX`, `JUNK` chunk-ებს და `data` ბოლოში გადადის (აუდიო ბაიტები იგივეა) | "
    "`IKEY=\"\"` ნაწილი **closed** D-49-ით (C R45, c822d7f); დამატებითი chunk-ები = ბიბლიოთეკის ქცევა, signal |",
)
replace_row(
    "| RR-R3-03 |",
    "| RR-R3-03 | info | editor-ის ყოველი save `ICAT=\"\"`-ს წერს (D-10 განზრახ ფიქსირდება) | **closed** — D-49, C R45-4/R45-5, `c822d7f` |",
)
replace_row(
    "| RR-R5-03 |",
    "| RR-R5-03 | info | number ველი Tagged-ია მხოლოდ `> 0`-ზე | TM-B11 stage 2, round 46 (D-50: finite number = tagged) |",
)
replace_row(
    "| C-R6-01 |",
    "| C-R6-01 | low | custom Number ველი → ყოველი save `ITKN=\"0\"` (size 1), pre-existing | TM-B11 stage 2, round 46 (D-50) |",
)
replace_row(
    "| C-R27-02 |",
    "| C-R27-02 | info | ახალი custom Text ველის შემდეგ save `RNOT=''`-ს წერს (ცარიელი მნიშვნელობა); D-10 / C-R1-01 კლასი | **closed** — D-49, C R45-5 (ცარიელი Note არ იწერება), `c822d7f` |",
)
replace_row(
    "| B-R42-02 |",
    "| B-R42-02 | info | TM-B11-ის რაუნდმა T1-10 და K-4 docs უნდა შეცვალოს | **closed** — round 45 T1-10a/b flip + K-4 docs (C R45-2, R45-7), `c822d7f` |",
)

insert_after_row("| RR-R44-04 |", [
    "| RR-R45-01 | medium | ყველა ველი ცარიელია → ბიბლიოთეკა წერს ცარიელ `LIST/INFO`-ს (size 4); importer-ის owner-ს უნდა ვაცნობოთ | FYI Saba / importer; B probe: d886bef-ზეც ასე იყო standard ველებით; „არ არის = მნიშვნელობა არ არის“ ფარავს |",
    "| RR-R45-02 | low | INFO-creation workaround (`tag.title ?? ''`) real WAV-ზე, სავარაუდოდ, არ მიიღწევა (A F1, e9); M3 ცოცხალია; all-empty + no-InfoTag წესი ტესტით არ არის დაფიქსირებული (C O1) | signal: test-only pin ან cleanup |",
    "| RR-R45-03 | low | trim-ის ასიმეტრია: whitespace-only = ცარიელი, არაცარიელი მნიშვნელობა სივრცეებს ინარჩუნებს (`' KM184'`) | signal, განზრახ, დოკუმენტირებულია |",
    "| RR-R45-04 | low | renderer ტესტი `'   '`-ის აკრეფა → save → ფორმა აღარ არის dirty — არ არსებობს | signal (test gap) |",
    "| RR-R45-05 | info | Architecture: ერთი `toRiffWriteOp(field, value)` → remove / set(strings) ორივე path-ისთვის | signal |",
    "| C-R45-01 | low | emptiness `field.type`-ით ისაზღვრება: text ველზე `['']` ან tags ველზე `''` ისევ size-0-ს წერს (renderer ასე არ აგზავნის) | signal (IPC shape validation) |",
    "| C-R45-02 | info | batch ფორმა ცარიელია (D-21), ამიტომ batch-ში გასუფთავება = „აკრიფე და წაშალე“ | Saba Q21 (UX) |",
    "| A-R45-01 | info | A-მ (e9)–(e11) დაამატა დაგეგმილზე მეტად (additions only, owned ახალ ფაილში) | signal, მიღებულია |",
])

for i, line in enumerate(lines):
    if line.startswith("| D-49 |"):
        lines[i] = line.replace(
            "| planned round 45 (TM-B11 stage 1; Saba Q4) |",
            "| **verified** C R45 PASS, published `c822d7f` (TM-B11 stage 1; Saba Q4); whitespace = ცარიელი → Q20 |",
        )
        lines.insert(i + 1,
            "| D-50 | number ველი (TM-B11 stage 2): unset marker = `''` (`FieldValue`-შია, `types.ts` არ იცვლება). read: `getDefaultValue('number')` = `''`; custom number, რომელიც არ არის, ცარიელია ან finite არ არის → `''`, finite payload → Number (`'0'` → 0); standard year/bpm/track → `''`, როცა ბიბლიოთეკა 0-ს აბრუნებს. write: `''`/whitespace string/non-finite number = ცარიელი → standard setter 0 (ბიბლიოთეკა შლის), `riffChunkId` → `removeValue`; finite number (0-ის ჩათვლით) იწერება, როგორც დღეს. renderer: input `''`-ს ცარიელად აჩვენებს, 0-ს `0`-ად; ცარიელი input → `''`. badge (D-15 იცვლება): finite number = tagged. template `0`-ს ინახავს. sort უცვლელია. limit: standard year/track/bpm `0`-ს ვერ ინახავს; ძველი build-ით ჩაწერილი `ITKN='0'` 0-ად იკითხება. K-4: importer-ის წესი უცვლელია, custom `'0'` ნამდვილი 0-ია | planned round 46 (TM-B11 stage 2; Saba Q4) |",
        )
        break
else:
    raise KeyError("D-49")

for i, line in enumerate(lines):
    if line.startswith("| D-15 |"):
        lines[i] = line.rstrip()[:-1].rstrip() + "; R46 (planned): number წესი იცვლება D-50-ით — finite number (0 და უარყოფითიც) = tagged |"
        break
else:
    raise KeyError("D-15")

with open(PATH, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines))
print("ok")
