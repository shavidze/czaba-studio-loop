import sys
fs_path, plan_path = sys.argv[1], sys.argv[2]

L = open(fs_path, encoding='utf-8').read().split('\n')
if not any('Round 125 (DESIGN-UX-REVIEW, ნაწილი 1) — C PASS' in l for l in L):
    assert L[2].startswith('განახლდა:')
    L[2] = 'განახლდა: 2026-10-24 · ავტორი: B (round 125 → round 126 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
    i = next(k for k, l in enumerate(L) if l.startswith('- **Round 124 (ABLETON-EXPERT-REVIEW, ნაწილი 2) — C PASS'))
    L.insert(i + 1, "- **Round 125 (DESIGN-UX-REVIEW, ნაწილი 1) — C PASS, `browserVerified: true`, `partComplete: true`; D6, D1, D2 შესრულდა, გადატანილი არცერთი; store არ შეცვლილა (gate 125 skipped, baseline `608187f`).** კომფორტის ცხრილი (11 ამოცანა): T1–T6, T9, T11 Live-ის ტოლია; T10 (მარკერი) CZABA-ში მარტივია; T8 (ხაზის Volume ზუსტად) Live-ში მარტივია; T7 და Clip Gain — შეუდარებელი (Live ?). Shortcut-ები (81 Live ბრძანება): same 31, different 15, missing 27, CZABA-only 14. VISUAL-A-ს baseline (RV-1/RV-2) აღებულია: `c-round-125/out/bbox-baseline-{1280,1440}.json`, `contrast-baseline.json`, `under24px.json` (დეტერმინიზმი 0 px). ბაგი **DUX-B-1 (Low)** — `dim` ტექსტი 3.67:1 → `deferred_low_polish` (V-1-ში RV-2-ით უნდა დაიხუროს). იდეები DUX-R-1 (ხაზის Volume-ის აკრეფა), DUX-R-2 (shortcut-ების ცნობარი) → `awaiting_user`. **Round 126 (D-29z91) — DESIGN-UX-REVIEW, ნაწილი 2:** ხახუნის წერტილები (D3; პირველად — 1280-ზე SFX ხაზი detail panel-ის ქვეშ, D-29b-ის წინასწარ დადგენილი ტესტით), „Ableton-ზე უკეთესი“ იდეები (D4, DUX-R-3-დან) და საბოლოო ვერდიქტი (D5); A კოდს არ ცვლის.")
    k = next(k for k, l in enumerate(L) if l.startswith('| VISUAL-A-OBSIDIAN |'))
    rest = L[k].split('|', 3)[3]
    L[k] = "| VISUAL-A-OBSIDIAN | **მუშავდება** — ნაბიჯი 1 DESIGN-UX-REVIEW: ნაწილი 1 **შესრულდა** (Round 125, C PASS `browserVerified`, `partComplete`; `c-round-125.json`, `user-review/design-ux-review.md`; RV-1/RV-2 baseline აღებულია), ნაწილი 2 — Round 126 (D-29z91; D3 ხახუნის წერტილები, D4 DUX-R იდეები, D5 ვერდიქტი); შემდეგ V-0. DUX-B-1 (Low) → `deferred_low_polish`; DUX-R-1/2 → `awaiting_user` |" + rest
    open(fs_path, 'w', encoding='utf-8').write('\n'.join(L))
    print('fs ok')
else:
    print('fs already')

s = open(plan_path, encoding='utf-8').read()
if 'D-29z91 —' in s:
    print('plan already'); sys.exit(0)
dec = """**D-29z91 — Round 125-ის შედეგი; DESIGN-UX-REVIEW ნაწილი 1 დასრულდა; Round 126: DESIGN-UX-REVIEW, ნაწილი 2.**

C round 125 (`tmp/studio-real-loop/c-round-125.md`, `c-round-125.json`) — **PASS**, `browserVerified: true`, `realVerified: true`, `allRowsRan: true`, `partComplete: true`: D6, D1, D2 შესრულდა, გადატანილი არცერთი; SOURCE-SCOPE (`608187f`, 937) დასაწყისშიც და ბოლოსაც OK; G125-3 (401, „Sign in required“, 0 `audio[src]`; fake-Bearer 403 — BLOCKED, backend cloud-ში არ არის). Gate 125 — `skipped`; baseline რჩება `608187f`.
- **R1 — B-ის შემოწმება:** WAV header-ები (პროექტი 7217877 frame, 48 kHz / 24-bit / stereo ორივე viewport-ზე; range 192000 frame = 4.000 წმ); `contrast-baseline.json`-ში `text-dim` 53/53 4.5-ზე დაბალია (3.08–3.67); `g125-3.json` (401); baseline-ის ოთხივე ფაილს label აქვს „pre-V-0 baseline (608187f)“; სურათები `D6-S1-1280.png`, `D2-hint-1440.png` C-ის აღწერას ემთხვევა.
- **R2 — DUX-B-1 (Low) → `deferred_low_polish`** (167). ის VISUAL-A V-1-ის `dim` token-ით უნდა დაიხუროს და RV-2-მა იმავე ელემენტებზე ≥ 4.5:1 უნდა აჩვენოს; სიაში რჩება, სანამ C არ დაადასტურებს (ორჯერ არ იგეგმება).
- **R3 — DUX-R-1 და DUX-R-2 → `design_ux_recommendations`, `awaiting_user`.** DUX-R-1 უკავშირდება TRACK-VOLUME-NUMERIC-FIELD-ს (ვიწრო header-ის გამო შეგნებული განსხვავება — წესი არ უქმდება, გადაწყვეტა Saba-სია) და ABL-R-14-ს; DUX-R-2 — SHIFT-FINE-DISCOVERABILITY-ს და WAVEFORM-ZOOM-DISCOVERABILITY-ს.
- **R4 — RV-1/RV-2 baseline აღებულია** (`c-round-125/out/bbox-baseline-{1280,1440}.json`, `contrast-baseline.json`, `under24px.json`; დეტერმინიზმი 0 px) და გაყინული შემავალი მონაცემია.
- **R5 — 1280-ზე SFX ხაზი detail panel-ის ქვეშ (C-R125-OBS-1280-SFX-LANE-UNDER-PANEL) — წინასწარი წესი D-29b-ის მიხედვით:** panel > 120 px და რომელიმე ხაზი არ ჩანს (auto-fit ჩართულია, მომხმარებელს არ შეუცვლია ზომა) → Medium DUX-B; panel = 120 და SFX wheel-ით/scrollbar-ით მისაწვდომია → ხახუნი; მხოლოდ panel-ის დაკეცვით/separator-ით → Low DUX-B; მიუწვდომელი → Medium DUX-B. Medium → შეზღუდული გასწორება V-0-მდე.
- **R6 — ნაწილი 2-ის წესები:** ექვსივე როლი (`design-philosopher` და `design-auditor` სახელით); DUX-R-3-დან ყველა იდეას აქვს `fitsVisualA`; D5 საბოლოო ვერდიქტს §1-ის თავში ამატებს, ნაწილი 1-ის §2, §3, §7 არ იცვლება (backup + მწკრივების შემოწმება); D6-ის ფაილები არ გადაიწერება; ახალი harness წესი — ყოველი გაშვების ფაილს უნიკალური სახელი აქვს (C-R125-HARNESS-OVERWRITE).
- **R7 — შედეგი წინასწარ (round 127):** 2026-10-27-ზე ან შემდეგ — ჯერ რეგრესია; გადატანილი სექციები ან `reviewComplete: false` — პირველად; Critical — გასწორება; High/Medium DUX-B — შეზღუდული გასწორებები V-0-მდე; სხვაგვარად DESIGN-UX-REVIEW → done და round 127 = V-0, ეტაპი 1 (root-ის პასუხით `b-round-124-checkpoint-request.md` Q1-ზე, თუ არის; სხვაგვარად იქ ჩაწერილი fallback). Architecture note ამ რაუნდში არ ყოფილა; ARCH-CHECKPOINT-PHASE1-BOUNDARY ისევ უპასუხოა და არ ბლოკავს.

"""
anchor = "**D-29z90 — Round 124-ის შედეგი"
assert s.count(anchor) == 1
s = s.replace(anchor, dec + anchor)
row_old = "| 126 | (წინასწარ) | 2026-10-27-დან რეგრესია; Medium+ DUX-B-ის გასწორებები; სხვაგვარად DESIGN-UX-REVIEW 2 (D3–D5) |"
assert s.count(row_old) == 1
s = s.replace(row_old, "| 125 → | (შედეგი) | **C PASS** (`browserVerified`, `partComplete`, D6/D1/D2); DUX-B-1 (Low) → deferred; DUX-R-1/2 → `awaiting_user`; RV-1/RV-2 baseline; gate 125 skipped |\n| 126 | DESIGN-UX-REVIEW 2 | D3 ხახუნის წერტილები (D3-A: 1280 SFX ხაზი / D-29b), D4 DUX-R-3+, D5 საბოლოო ვერდიქტი და ინდექსი; A — არაფერი (D-29z91) |\n| 127 | (წინასწარ) | 2026-10-27-დან რეგრესია; Medium+ DUX-B-ის გასწორებები; სხვაგვარად VISUAL-A V-0, ეტაპი 1 |")
own_old = "**D-29z90:** round 125-ში A-ს არცერთი ფაილი არ ეკუთვნის"
i = s.index(own_old); j = s.index("\n", i)
s = s[:j+1] + "**D-29z91:** round 126-ში A-ს არცერთი ფაილი არ ეკუთვნის (მხოლოდ `a-round-126.md`). C წერს მხოლოდ loop საქაღალდეში (`user-review/design-ux-review.md` — ნაწილი 1-ის გადაწერის გარეშე, `c-round-126*`). ყველაფერი გაყინულია (`b-round-125-r126-tree-sha256.txt`, 937).\n" + s[j+1:]
open(plan_path, 'w', encoding='utf-8').write(s)
print('plan ok')
