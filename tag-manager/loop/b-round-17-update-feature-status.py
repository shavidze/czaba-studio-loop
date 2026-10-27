import re
import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    s = fh.read()


def sub_line(prefix, new_line):
    global s
    pat = re.compile(r"^" + re.escape(prefix) + r".*$", re.M)
    if not pat.search(s):
        raise SystemExit("missing line: " + prefix)
    s = pat.sub(lambda m: new_line, s, count=1)


sub_line(
    "განახლდა: ",
    "განახლდა: 2026-10-27, B round 17. round 17 **გამოქვეყნდა** (`4f8a578`): TM-B20 done. round 18 = TM-B21 (D-27, file list-ის sort არა-string პირველ array ელემენტზე). სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით.",
)

r17 = (
    "**round 17 დახურულია (C PASS, R17-1…R17-5, realVerified=true, bugs 0):** D-26 დანერგილია. red `cb2d76b` worktree-ზე 12 failed / 31 passed "
    "(`reading 'trim'`, `item.trim is not a function`, typeof mismatch), green 43/43; M1–M4 მოკლულია (M2 React-ის `Objects are not valid as a React child`-ით). "
    "gate 135/93/7, `--retries=0` 7/7, Biome 9 warning (იგივე სია). real built app: Artists/Genres/Category UI-დან → `Tagged`, artist უჯრა პირველი "
    "მნიშვნელობა, genre `R17Genre`; ffprobe და music-metadata: `ICAT` `R17Cat`, genre `R17Genre`; artists მხოლოდ ჩაწერილია (TM-B08). malformed ელემენტი "
    "მხოლოდ unit/component ტესტებით მოწმდება (რეალური app-იდან მიუღწეველია). root gate: published `4f8a578`, review COMMIT OK (low-ები → RR-R17-01…04)."
)
anchor = "**round 16 დახურულია"
if "**round 17 დახურულია" not in s:
    if anchor not in s:
        raise SystemExit("missing round 16 paragraph")
    s = s.replace(anchor, r17 + "\n\n" + anchor, 1)

old_req = "**თხოვნა root-ს (განახლდა B R16):** მიაბით `Check` run-ის id და შედეგი `cb2d76b`-ზე, `5854d45`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-16.json`-ში Actions run ჯერ არ არის."
new_req = "**თხოვნა root-ს (განახლდა B R17):** მიაბით `Check` run-ის id და შედეგი `4f8a578`-ზე, `cb2d76b`-ზე ან `35ed18b`-ის შემდეგ ნებისმიერ commit-ზე; `gate-round-17.json`-ში Actions run ჯერ არ არის."
if old_req not in s and new_req not in s:
    raise SystemExit("missing root request")
s = s.replace(old_req, new_req, 1)

if "| TM-B21 |" not in s:
  sub_line(
    "| TM-B20 |",
    "| TM-B20 | file row helper-ები array ელემენტის ტიპს ენდობიან: `hasAnyTagValue` ისვრის `[null]`/`[5]`/`[{}]`-ზე, `formatFirstFieldValue` არა-string პირველ ელემენტს აბრუნებს (object React row-ს ჩააგდებს) (RR-R5-02, B-R16-01). defensive: რეალური app-იდან ახლა არ მიიღწევა | **done** (R17), realVerified=true | **C R17** R17-1…R17-5 PASS: red `cb2d76b` 12 failed, green 43/43; M1–M4 მოკლულია; gate 135/93/7, `--retries=0` 7/7; real app regression ffprobe + music-metadata-ით; malformed case მხოლოდ unit/component. published `4f8a578` | — (RR-R17-01…04 signal-ები) |\n"
    "| TM-B21 | file list-ის sort array ველით (Artist, Genre, ნებისმიერი tags ველი) ისვრის `aStr.localeCompare is not a function`-ს, როცა პირველი ელემენტი string არ არის (`[5]`, `[{}]`, `[true]`); throw `useFilteredFiles`-ში (FileList render) და `selectRange`-ში, რიგზეა დამოკიდებული (A-R17-01). defensive: რეალური app-იდან ახლა არ მიიღწევა | todo (low), round 18 | B R17 ექსპერიმენტი (`b-round-17-exp-sort.mts.txt`): რეალური `4f8a578` store tsx-ით → malformed row მეორედ რომ დგას, throw asc და desc-ზე; `[null]` არ ისვრის | round 18: D-27 |\n"
    "| TM-B22 | Size სვეტი save-ის შემდეგ ძველ ზომას აჩვენებს rescan-მდე (`WavFileEntry.size` მხოლოდ folder scan-იდან მოდის) (C-R17-01). რეალურ app-ში მიიღწევა | todo (low) | C R17-5: save-ის შემდეგ 86.2 KB, relaunch-ის შემდეგ 87.6 KB | B probe: საიდან მოვა ახალი ზომა და სჭირდება თუ არა main/preload ცვლილება |",
)

sub_line(
    "| RR-R5-02 |",
    "| RR-R5-02 | low | `file-row-display.ts:11` `item.trim()` ვარაუდობს string ელემენტს; `null` row-ს render-ს ჩააგდებს | **closed** — TM-B20 (D-26), C R17, `4f8a578` |",
)
sub_line(
    "| B-R16-01 |",
    "| B-R16-01 | low | `formatFirstFieldValue` `value[0]`-ს ნებისმიერი ტიპით აბრუნებს: `[5]` → number, `[{}]` → object (React child-ად ისვრის); `hasAnyTagValue` `[null]`/`[5]`/`[{}]`-ზე ისვრის. რეალური app-იდან ახლა არ მიიღწევა | **closed** — TM-B20 (D-26), C R17, `4f8a578` |",
)

new_rows = [
    "| RR-R17-01 | low | `file-row-display.test.ts:74-75` ორი ცალკე `import type … from \"~/types\"` ხაზი (A-მ ძველი ხაზი განზრახ byte-identical დატოვა) | signal; ფაილის შემდეგ შეხებაზე |",
    "| RR-R17-02 | low | `parseUntypedMetadata` helper ორ ტესტ-ფაილშია (`file-list.test.ts`, `file-row-display.test.ts`); შეიძლება `tests/renderer/helpers/`-ში გადავიდეს | signal; R18 მესამე ასლს არ ამატებს |",
    "| RR-R17-03 | low | `formatFirstFieldValue(['', 'B'])` → `''`, `hasAnyTagValue` → true: row შეიძლება `Tagged` იყოს ცარიელი artist უჯრით. ძველი ქცევაა, D-26-ში განზრახ (შემდეგ string-ს არ ეძებს) | Saba-ს კითხვა (D-15, RR-R5-01, RR-R5-06-თან) |",
    "| RR-R17-04 | info | არქიტექტურა: renderer-ში შესვლისას `FieldValue` array-ის ფორმას არავინ ამოწმებს (`TemplatePicker.tsx:21` `join`, store-ის sort, ფორმა); ერთხელ normalise main-ის read handler-ში ან file-store setter-ში | signal (RR-R6-05, RR-R5-06-თან), არა task |",
    "| A-R17-01 | low | `file-store.ts:125-127` sort array ველით: `aVal[0] ?? ''` + `aStr.localeCompare` → არა-string პირველ ელემენტზე `TypeError` `useFilteredFiles`-ში (FileList) და `selectRange`-ში; რიგზეა დამოკიდებული (B probe). რეალური app-იდან მიუღწეველია | TM-B21, round 18 (D-27) |",
    "| A-R17-02 | low | პროცესი: A-ს R17 სესიაში read-primitives hook არ ამოქმედდა; src Bash heredoc-ით დაიწერა, primitives რედაქტირების შემდეგ წაიკითხა. C-მ diff-ში დარღვევა ვერ იპოვა | root: job-ის `~/.claude/settings.json` hook-ები; R18 task: მხოლოდ Edit/Write |",
    "| C-R17-01 | low | Size სვეტი save-ის შემდეგ ძველია rescan-მდე (86.2 KB → relaunch-ზე 87.6 KB); რეალურ app-ში მიიღწევა | TM-B22 (todo) |",
]
m = re.compile(r"^\| B-R16-01 \|[^\n]*$", re.M).search(s)
if "| RR-R17-01 |" not in s:
    s = s[: m.end()] + "\n" + "\n".join(new_rows) + s[m.end():]

if "| D-27 |" not in s:
  sub_line(
    "| D-26 |",
    "| D-26 | D-15-ის დაზუსტება არასწორი ტიპის მონაცემზე (file row helper-ები, `src/renderer/src/lib/file-row-display.ts`). array ელემენტი არაცარიელია მხოლოდ მაშინ, როცა ის string-ია არა-whitespace შიგთავსით; ნებისმიერი არა-string ელემენტი (`null`, number, object, boolean) ცარიელია და შეცდომას არ ისვრის. `formatFirstFieldValue` აბრუნებს `value[0]`-ს მხოლოდ მაშინ, როცა ის string-ია, სხვა შემთხვევაში `''` (`String()` coercion არ არის, შემდეგ string ელემენტს არ ეძებს: `['', 'x']` → `''`, როგორც დღეს). D-15-ის მთლიანი მნიშვნელობის წესები უცვლელია. `FieldValue` ტიპი, main, preload, store-ები უცვლელია. pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | **done** R17, published `4f8a578` (TM-B20; C R17-1…R17-5) |\n"
    "| D-27 | file list-ის sort (`file-store.ts` `getSortedFiles`, default branch): array მნიშვნელობის sort key არის `value[0]`, თუ ის string-ია, სხვა შემთხვევაში `''` (D-26-ის წესი; ელემენტის `String()` coercion არ არის, შემდეგ string-ს არ ეძებს). inline `typeof` store-ში, `file-row-display`-ის import-ის გარეშე. არა-array მნიშვნელობები უცვლელია: ორივე number → რიცხვითი, სხვა შემთხვევაში `String(value ?? '')` + `localeCompare`. ტიპები, main, preload, `FileList.tsx` უცვლელია. pure fix: reference-first გამონაკლისი. K-4 კონტრაქტს არ ეხება | B R17 close, ტექნიკური, შექცევადი; R18-ში ხორციელდება (TM-B21) |",
)

with open(path, "w", encoding="utf-8") as fh:
    fh.write(s)
print("ok")
