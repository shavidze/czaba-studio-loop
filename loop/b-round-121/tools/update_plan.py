import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    text = f.read()

if "**D-29z87" in text:
    print("already present")
    sys.exit(0)

block = """**D-29z87 — Round 121-ის შედეგი; Round 122: რეგრესიის რაუნდი (ფაზა 1 + T12 V1).**

C round 121 (`tmp/studio-real-loop/c-round-121.md`, `c-round-121.json`) — **PASS**, `browserVerified: true`, `realVerified: true`, 0 ბაგი: WZ-PRESENT და WZ-T7 ორივე viewport-ზე, WZ-LEVELS, WZ-GAIN, WZ-HISTORY, WZ-AUDIO (`1×` და `2×` WAV ბაიტობრივად იდენტურია), WZ-METER (წყვილური Δ 0.000 dB), WZ-NEWCLIP, WZ-KEYS, WZ-RELOAD, G121-3 (401; fake-Bearer 403 — BLOCKED, backend cloud-ში არ არის). Gate 121 გამოქვეყნდა `425a807` (ორივე remote). T12 ეტაპი 4b → `c_pass_published`; **T12 V1 (T12.27-ის 1–8 პუნქტი) დასრულდა**.
- **R1 — რეგრესიის რაუნდი დადგა:** `date -u` 2026-10-24 00:18:55, `regression-last.json` 2026-10-21 (3 დღე). speed rules-ის მიხედვით round 122 ახალი scope-ის ნაცვლად რეგრესიის რაუნდია (round 112-ის ნიმუში: C-only + A-ის ერთი doc ცვლილება).
- **R2 — A:** მხოლოდ doc 102-ისა და doc 103-ის მე-4 ხაზი (სტატუსი Completed, gate 120 / gate 121); gate-121 reviewer-ის შენიშვნა 6. app-ის კოდი არ იცვლება.
- **R3 — C:** ყოველი done/c_pass ერთეულის ერთი მთავარი მიღება ბრაუზერში 1440×900-სა და 1280×720-ზე (RG-01…RG-24, SRW-21-ის გარდა; RG-T1…RG-T4B), რეგრესიისთვის გადადებული row-ები (RP-RANGE-1280, RP-ROW-HANDLE, RP-TOUCH-LONG, RP-HEADER-WIDTH, RG-11B-ში GATE111-SUGG-E2E-S5), `npm run test:e2e:smoke` (მხოლოდ `/cart`, Studio-ს დაფარვა არ არის; სერიულად), G122-3. ანგარიში row-ების მიხედვით ნაწილ-ნაწილ იწერება.
- **R4 — შედეგი წინასწარ:** ყველა PASS → `regression-last.json` ახლდება, round 123 = ABLETON-EXPERT-REVIEW ნაწილი 1; Medium+ → round 123 შეზღუდული გასწორება; Low → `deferred_low_polish`; გაუშვებელი row-ები round 123-ში გრძელდება.
- **R5 — gate-121 შენიშვნები:** S1/S2 (hover-ის და affordance-ის არქონა) → Low GATE121-S1-ZOOM-NO-HOVER + WAVEFORM-ZOOM-DISCOVERABILITY; S3 → Low GATE121-S3-DEFAULT-LITERAL; S4 — მიღებულია; S5 → DESIGN-UX-REVIEW-ის სიგნალი; S7 → RP-HEADER-WIDTH. `deferred_low_polish` — 162.
- **R6 — Architecture:** Signal 4 → ARCH-R121-LANE-VIEW-OPTIONS (keep), ARCH-CHECKPOINT-SRW14-PREFS-ის addendum. T12 V1 feature-ის საზღვარია → root-ს შეზღუდული მოთხოვნა `tmp/studio-real-loop/b-round-121-checkpoint-request.md`; არ ბლოკავს.

"""

anchor = "**D-29z86 — Round 120-ის შედეგი;"
i = text.index(anchor)
text = text[:i] + block + text[i:]

row_anchor = "| 121 | T12 ეტაპი 4b | Waveform Vertical Zoom (`½×–8×`, მხოლოდ ხედი, აუდიო კლიპები ხაზებზე); V1-ს ხურავს; შემდეგ რეგრესიის რაუნდი, მერე ABLETON-EXPERT-REVIEW (D-29z86) |\n"
rows = (
    "| 121 → | (შედეგი) | **C PASS** (`browserVerified`), gate 121 გამოქვეყნდა `425a807`: T12 ეტაპი 4b მზადაა, **T12 V1 დასრულდა** |\n"
    "| 122 | რეგრესია | ფაზა 1 + T12 V1 ბრაუზერში ორივე viewport-ზე, გადადებული row-ები, smoke; A — doc 102/103-ის სტატუსი (D-29z87) |\n"
)
j = text.index(row_anchor) + len(row_anchor)
text = text[:j] + rows + text[j:]

own_anchor = "**D-29z86:** round 121-ში A-ს ეკუთვნის"
k = text.index(own_anchor)
k = text.index("\n", k) + 1
own = "**D-29z87:** round 122-ში A-ს ეკუთვნის მხოლოდ `docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md` (l.4) და `docs/implementation/2026/quarter-IV/103-studio-waveform-vertical-zoom.md` (l.4). დანარჩენი გაყინულია (`b-round-121-r122-tree-sha256.txt`, 935).\n"
text = text[:k] + own + text[k:]

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("ok")
