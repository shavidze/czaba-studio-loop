import sys

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    text = f.read()

if "Round 122 (D-29z87)" in text:
    print("already present")
    sys.exit(0)

old_hdr = "განახლდა: 2026-10-23 · ავტორი: B (round 120 → round 121 დაგეგმვა)"
assert old_hdr in text
text = text.replace(old_hdr, "განახლდა: 2026-10-24 · ავტორი: B (round 121 → round 122 დაგეგმვა)", 1)

old_bullet_start = "- **T12 ეტაპი 4b — მუშავდება. Round 121 (D-29z86): Waveform Vertical Zoom**"
i = text.index(old_bullet_start)
j = text.index("\n", i)
new_bullet = (
    "- **T12 ეტაპი 4b (Waveform Vertical Zoom) — მზადაა (Round 121, C PASS `browserVerified`, გამოქვეყნდა `425a807`). T12 V1 (T12.27-ის 1–8 პუნქტი) დასრულდა.** "
    "`c-round-121.json`: WZ-PRESENT / WZ-T7 1440×900-სა და 1280×720-ზე, WZ-LEVELS (`½×`–`8×`), WZ-AUDIO (`1×` და `2×` WAV ბაიტობრივად იდენტურია), WZ-METER (Δ 0.000 dB), WZ-HISTORY, WZ-RELOAD; 0 ბაგი. "
    "**Round 122 (D-29z87) — რეგრესიის რაუნდი** (3 დღე 2026-10-21-დან): C ბრაუზერში ორივე viewport-ზე ამოწმებს ყველა მზა ერთეულს (SRW-01…SRW-24, SRW-21-ის გარდა, და T12-ის ეტაპები 1–4b), რეგრესიისთვის გადადებულ row-ებს და smoke-ს; A მხოლოდ doc 102/103-ის სტატუსს ასწორებს. შემდეგ — ABLETON-EXPERT-REVIEW. "
    "Tech Lead-ისთვის (არ ბლოკავს): `appearance-none` არჩევანს ისარი და hover არ აქვს (WAVEFORM-ZOOM-DISCOVERABILITY, Low GATE121-S1-ZOOM-NO-HOVER)."
)
text = text[:i] + new_bullet + text[j:]

old_row_start = "| T12-GAIN-VOLUME | **მუშავდება** — ეტაპი 1 **მზადაა**"
k = text.index(old_row_start)
k_end = text.index("\n", k)
row = text[k:k_end]
row = row.replace("| T12-GAIN-VOLUME | **მუშავდება** — ეტაპი 1", "| T12-GAIN-VOLUME | **V1 მზადაა** (Round 121, `425a807`) — ეტაპი 1", 1)
old_4b = "4b (Waveform Vertical Zoom) — **მუშავდება** (Round 121, D-29z86; V1-ს ხურავს; შემდეგ რეგრესიის რაუნდი)"
assert old_4b in row
row = row.replace(old_4b, "ეტაპი 4b (Waveform Vertical Zoom) **მზადაა** (Round 121 C PASS `browserVerified`, `425a807`; V1 დასრულდა; Round 122 — რეგრესია)", 1)
row = row.replace("ARCH-R120-PEAKSHAPE-TO-PEAKS.", "ARCH-R120-PEAKSHAPE-TO-PEAKS, ARCH-R121-LANE-VIEW-OPTIONS, GATE121-S5-ARIA-LANGUAGE.", 1)
text = text[:k] + row + text[k_end:]

old_aer = "| ABLETON-EXPERT-REVIEW | **არ დაწყებულა** | მომხმარებლის 2026-10-23-ის გადაწყვეტილება: T12-ის შემდეგ, VISUAL-A-მდე."
assert old_aer in text
text = text.replace(old_aer, "| ABLETON-EXPERT-REVIEW | **არ დაწყებულა** (წინაპირობა — T12 V1 — შესრულდა `425a807`-ში; იწყება Round 122-ის რეგრესიის შემდეგ) | მომხმარებლის 2026-10-23-ის გადაწყვეტილება: T12-ის შემდეგ, VISUAL-A-მდე. Round 121-დან შემოსული დაუდასტურებელი საკითხები: საფეხურიანი zoom vs Live-ის slider, zoom Undo-ში არ არის, detail panel არ დიდდება (`backlog.json` → `inputs_from_round121`).", 1)

old_reg = "სრული რეგრესია ისევ საჭიროა ეტაპის დასრულებისას (SRW-13..20-ის შემდეგ) და საბოლოოდ, root-ის შემოწმებამდე."
assert old_reg in text
text = text.replace(old_reg, old_reg + "\n\n**Round 122 (D-29z87) — სამდღიანი რეგრესიის რაუნდი — მოწმდება.** ფაზა 1-ის ყველა მზა ერთეული და T12 V1, ბრაუზერში, ორივე viewport-ზე, თითო მოკლე შემოწმება (RG-* row-ები `current-task.md` §3-ში); გადადებული row-ები: RP-RANGE-1280 (C-R83-S-1280-RANGE-SHIFT), RP-ROW-HANDLE (GATE85-S6), RP-TOUCH-LONG (TOUCH-LONGPRESS-CONTEXTMENU), RP-HEADER-WIDTH (gate-121 S7), GATE111-SUGG-E2E-S5; `npm run test:e2e:smoke` (მხოლოდ `/cart`). `regression-last.json` round 123-ის დაგეგმვისას განახლდება (§6). ეს საბოლოო სრულ რეგრესიას (REGRESSION-FULL) არ ცვლის.", 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("ok")
