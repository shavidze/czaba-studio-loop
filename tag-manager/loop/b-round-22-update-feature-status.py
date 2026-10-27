import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    lines = fh.read().split("\n")

HEADER = (
    "განახლდა: 2026-10-27, B round 22. round 22 **გამოქვეყნდა** (`9d1c97e`): TM-B25 done. round 23 = TM-B26 (save/selection hygiene, "
    "low): (z12) pin D-31-ის deviation 1-ისთვის (C-R22-01), mock isolation `metadata-panel-batch-save.test.ts`-ში (A-R21-04), "
    "MetadataPanel-ის snapshot ერთი `getState()`-ით და 6 ზედმეტი cast-ის წაშლა (D-32), `docs/bugs/` ჩანაწერი D-29/D-30/D-31-ის ცნობილ "
    "შეზღუდვებზე. სტატუსი `done` ხდება მხოლოდ C-ის რეალური (არა offline) მტკიცებულებით."
)
R22 = (
    "**round 22 დახურულია (C PASS, R22-1…R22-5, realVerified=true, 1 low test gap C-R22-01):** D-31 დანერგილია (anchor = file path, "
    "lookup rendered `useFilteredFiles()` სიაში, იწმინდება ცარიელ selection-ზე; store არ შეცვლილა). red `601dc4a` worktree-ზე 6 failed / "
    "13 passed ((z2), (z3) `expected [ 'c.wav' ] to deeply equal [ 'a.wav', 'b.wav', 'c.wav' ]`, (z4), (z5), (z11) სიმპტომით; (z8) ახალი "
    "D-31 ქცევა), green 19/19. M1–M6 მოკლულია; C-ის დამატებითი M7 (Shift-click anchor-ს არ ცვლის) გადარჩა → C-R22-01 → round 23. gate "
    "198/93/7, `--retries=0` 7/7, Biome **8** warning (`FileList.tsx` `useExhaustiveDependencies` გაქრა). real built app: a.wav-ის save → "
    "Shift-click c.wav → `3 files selected`, `Save to 3 files` R22Range; ffprobe + music-metadata `exif:ICAT` R22Range a, b, c-ზე, d, e-ზე "
    "არა; sort (Name desc, b → Shift e = b–e), search (`.wav`, c → Shift a = a–c), Deselect All → Shift d = მხოლოდ d. red reference "
    "`601dc4a` build-ზე: step 1-ის შემდეგ მხოლოდ c.wav, ღილაკი `Save Tags`, a = R22A, b-ს ICAT არ აქვს. deviations 1–3 ნანახია (1 — "
    "გამარჩეველი run-ით: a, Shift cx, search x, Shift dx → cx, dx). root gate: published `9d1c97e`, review COMMIT OK (low-ები → "
    "RR-R22-01…04, არქიტექტურა RR-R22-05)."
)
TM_B25_ROW = (
    "| TM-B25 | Shift-click range-ის anchor ყოველი save-ის შემდეგ იკარგებოდა (`lastClickRef` row index, reset სიის ყოველ ცვლილებაზე; "
    "`updateFileMetadata`, D-28 `updateFileStats`, sort, search) (RR-R19-02) | **done** (R22), realVerified=true | C R22-1…R22-5 PASS, "
    "`9d1c97e`: red 6/13 → green 19/19, M1–M6 მოკლული; gate 198/93/7; real app save → Shift-click → batch 3 ფაილზე, ffprobe + "
    "music-metadata ICAT a, b, c-ზე და არა d, e-ზე; red reference `601dc4a` build-ზე მხოლოდ c.wav | — (D-31; test gap C-R22-01 → TM-B26) |"
)
TM_B26_ROW = (
    "| TM-B26 | save/selection hygiene: (a) unit pin D-31 deviation 1-ზე (C-R22-01, M7 გადარჩა); (b) `metadata-panel-batch-save.test.ts`-ის "
    "once-mock რიგი შემდეგ ტესტში გადადის (`mockClear` once-მნიშვნელობებს ტოვებს, A-R21-04); (c) MetadataPanel snapshot ერთი "
    "`getState()`-ით + 6 ზედმეტი cast (D-32; RR-R21-01, RR-R13-02, RR-R15-02); (d) `docs/bugs/` ჩანაწერი D-29/D-30/D-31-ის ცნობილ "
    "შეზღუდვებზე | in_progress (low), round 23 | B R22 experiment (`b-round-22-exp/b-round-22-exp.diff.txt`, `9d1c97e`-ის /tmp ასლში): "
    "(z12) გადის ძველზე, M7-ზე `expected [ 'dx.wav' ] to deeply equal [ 'cx.wav', 'dx.wav' ]`; (i2) ძველ `beforeEach`-ით ვარდება "
    "(`promise rejected \"Error: leaked\" instead of resolving`), `mockReset`-ით გადის, ხუთივე ხაზი ცალ-ცალკე მოკლულია; tsc 0, renderer "
    "201/201, Biome 8; ახალი ტესტები ძველ src-ზეც 201/201 | round 23 |"
)
NEW_FINDING_ROWS = [
    "| C-R22-01 | low | test gap: D-31 target behaviour #2 / deviation 1 (Shift-click anchor-ს გადააადგილებს) unit ტესტით დაცული არ არის; mutant M7 19/19-ით გადარჩა. product სწორია (real app) | **TM-B26** (round 23): (z12) |",
    "| RR-R22-01 | low | `FileList.tsx:63-70` Shift-click anchor-ს clicked row-ზე გადააქვს; Explorer-ში ის ადგილზე რჩება. რეგრესია არ არის | = B-R21-02 (Saba); `docs/bugs/` ჩანაწერში (TM-B26) |",
    "| RR-R22-02 | low | `FileList.tsx:66` + `:112-114` ბოლო row-ის Ctrl-deselect anchor-ს წმენდს; Explorer ინარჩუნებს. მისაღებია, მაგრამ `docs/`-ში D-31-ის ქვეშ უნდა ჩაიწეროს | **TM-B26** (round 23): `docs/bugs/` |",
    "| RR-R22-03 | low | index-ების გადაცემა კვლავ ეყრდნობა იმას, რომ component და store სიას ერთნაირად ალაგებენ (ფარული კონტრაქტი, დღეს სწორია) | signal → RR-R22-05 |",
    "| RR-R22-04 | low | row-ები clickable `div`-ებია keyboard/ARIA selection-ის გარეშე (pre-existing) | signal; keyboard selection UX ფიჩერია (reference study + Saba-ს პრიორიტეტი) → Saba-ს პაკეტი |",
    "| RR-R22-05 | info | არქიტექტურა: `selectRange(anchorPath, targetPath)` store-ში + `selectionAnchorPath` store state-ად; index კონტრაქტი და `hasSelection` effect ქრება | signal, არა task |",
    "| A-R22-01 | low | Select All → Shift-click: anchor-ით არაფერი იცვლება (range ემატება, deviation 2), anchor-ის გარეშე selection ერთ row-მდე იკუმშება | = B-R21-02; `docs/bugs/` (TM-B26) |",
    "| A-R22-02 | low | anchor იწმინდება მხოლოდ non-empty → empty გადასვლაზე render-ის შემდეგ; clear + reselect ერთ batch-ში anchor-ს დატოვებდა. ასეთი კოდი დღეს არ არის | signal; `docs/bugs/` (TM-B26); RR-R22-05 მოხსნიდა |",
    "| A-R22-03 | info | FileList re-render-დება selection-ის empty ↔ non-empty გადასვლაზე; `findIndex` O(n) მხოლოდ Shift-click-ზე | record only |",
]
ROUTING = {
    "RR-R21-01": "**TM-B26** (round 23, D-32) |",
    "RR-R13-02": "**TM-B26** (round 23, D-32): MetadataPanel-ის 6 cast |",
    "RR-R15-02": "**TM-B26** (round 23, D-32): MetadataPanel-ის 6 cast |",
    "A-R21-04": "**TM-B26** (round 23): `beforeEach` `mockReset` + (i1)/(i2) |",
    "RR-R21-02": "**TM-B26** (round 23): `docs/bugs/` ჩანაწერი (ცნობილი შეზღუდვა, (y4) pin) |",
    "A-R21-01": "**TM-B26** (round 23): `docs/bugs/` ჩანაწერი; batch-ის ცარიელი ველის სემანტიკა შესაძლო Saba-ს კითხვაა |",
    "A-R21-02": "**TM-B26** (round 23): `docs/bugs/` (= RR-R21-02) |",
    "A-R21-03": "**TM-B26** (round 23): `docs/bugs/` ჩანაწერი (ცნობილი შეზღუდვა) |",
}
D32_ROW = (
    "| D-32 | MetadataPanel snapshot (TM-B26): `handleSave` save-ის დასაწყისში ერთხელ კითხულობს `useMetadataStore.getState().editingMetadata`-ს და "
    "ამ ერთ მნიშვნელობას იყენებს single write-ის payload-ად, batch payload-ად (modified keys) და D-30-ის შედარებისთვის; `editingMetadata` "
    "`handleSave`-ის deps-იდან გადის. 6 ზედმეტი cast იშლება (მნიშვნელობები უკვე typed-ია `src/preload/index.d.ts`-ში). render-ის 2 "
    "narrowing (`as string[]` / `as string`) რჩება: ის FieldValue union-ს input-ის prop type-მდე ავიწროებს და runtime narrowing-ს მოითხოვს, "
    "ეს ცალკე ცვლილებაა. ხილული ქცევა არ იცვლება; store არ იცვლება; D-21…D-30 უცვლელია. K-4 კონტრაქტს არ ეხება | B R22 close, ტექნიკური, "
    "შექცევადი; R23-ში ხორციელდება (TM-B26) |"
)

has_r22 = any(l.startswith("**round 22 დახურულია") for l in lines)
has_b26 = any(l.startswith("| TM-B26 |") for l in lines)
has_new = any(l.startswith("| C-R22-01 |") for l in lines)
has_d32 = any(l.startswith("| D-32 |") for l in lines)

out = []
for line in lines:
    if line.startswith("განახლდა: "):
        out.append(HEADER)
        continue
    if line.startswith("**round 21 დახურულია") and not has_r22:
        out.append(R22)
        out.append("")
        out.append(line)
        continue
    if line.startswith("**CI:**"):
        line = line.replace(
            "**თხოვნა root-ს (განახლდა B R21):** მიაბით `Check` run-ის id და შედეგი `601dc4a`-ზე,",
            "**თხოვნა root-ს (განახლდა B R22):** მიაბით `Check` run-ის id და შედეგი `9d1c97e`-ზე, `601dc4a`-ზე,",
        ).replace("`gate-round-21.json`-ში Actions run ჯერ არ არის", "`gate-round-22.json`-ში Actions run ჯერ არ არის")
        out.append(line)
        continue
    if line.startswith("| TM-B25 |"):
        out.append(TM_B25_ROW)
        if not has_b26:
            out.append(TM_B26_ROW)
        continue
    matched = False
    for fid, cell in ROUTING.items():
        if line.startswith("| " + fid + " |"):
            cells = line.split(" | ")
            cells[-1] = cell
            out.append(" | ".join(cells))
            matched = True
            break
    if matched:
        continue
    if line.startswith("| B-R21-03 |"):
        out.append(line)
        if not has_new:
            out.extend(NEW_FINDING_ROWS)
        continue
    if line.startswith("| D-31 |"):
        cells = line.split(" | ")
        cells[-1] = "**done** R22, published `9d1c97e` (TM-B25; C R22-1…R22-5). deviations 1–3 → Saba (B-R21-02) |"
        out.append(" | ".join(cells))
        if not has_d32:
            out.append(D32_ROW)
        continue
    out.append(line)

with open(path, "w", encoding="utf-8") as fh:
    fh.write("\n".join(out))
