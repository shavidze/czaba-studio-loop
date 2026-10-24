import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
if 'D-29z89 —' in s: print('already'); sys.exit(0)
dec = """**D-29z89 — Round 123-ის შედეგი; Round 124: ABLETON-EXPERT-REVIEW, ნაწილი 2 (Q1–Q7).**

C round 123 (`tmp/studio-real-loop/c-round-123.md`, `c-round-123.json`) — **PASS**, `browserVerified: true`, `realVerified: true`, `allRowsRan: true`: P1–P8 ყველა სფერო შესრულდა, გადატანილი არცერთი; SOURCE-SCOPE (`608187f`, 937) დასაწყისშიც და ბოლოსაც OK; G123-3 (401; fake-Bearer 403 — BLOCKED, backend cloud-ში არ არის). Gate 123 — `skipped` (რეალური ცვლილება არ არის); baseline რჩება `608187f`.
- **R1 — ნაწილი 1:** შედეგი `tmp/studio-real-loop/user-review/ableton-review.md`-შია (ქართულად). B-მ მტკიცებულება შეამოწმა: ABL-B-1-ის სურათი (`c-round-123/shots/P2-badge-demo-soft-impact-1440.png` — „▶“ ბარათს გარეთაა, „ისმის“ იჭრება) და `out/P2c.json` (scrollWidth 139–152 > 126); ABL-B-2 — `out/P8b.json` (მეორე Z-ის შემდეგ პირველი X ხედს არ ცვლის, ორივე viewport-ზე).
- **R2 — Low-ები:** ABL-B-1 და ABL-B-2 → `deferred_low_polish` (166) და `open_findings`; ABL-B-2 დაკავშირებულია C-R108-01-თან (იგივე ოჯახი).
- **R3 — რეკომენდაციები:** ABL-R-1…10 → `backlog.json` `ableton_recommendations`, `awaiting_user` (მომხმარებლის 2026-10-23-ის გადაწყვეტილება: საბას დასტურამდე არ ხორციელდება). ABL-R-7 და ABL-R-10-ის „Medium“ C-ის შეთავაზებაა და არა ბაგის severity — bug gate მათზე არ ვრცელდება. ABL-R-10 ეწინააღმდეგება SRW-16-ის R3-ს (სახელის ველი მაშინვე იხსნება) — საბა წყვეტს. ABL-R-6 = B-R107-ENTER-ON-BODY (ერთი კითხვა, არ მეორდება); ABL-R-3 ↔ TRACK-FOLD-U; ABL-R-10 ↔ ROW-RANGE-M.
- **R4 — ექსპერტი აგენტი:** `ableton-arrangement-expert` ამ runner-ზე ვერ გამოიძახება (subagent tool არ არის). C-მ მისი role ფაილი checklist-ად გამოიყენა; დასკვნები მხოლოდ ბრაუზერსა და manual-ის ტექსტს ეყრდნობა. ჩაიწერა ABL-EXPERT-AGENT-UNAVAILABLE (info); Q7-ში საბას პირდაპირ ეცნობება. Review ამით არ უქმდება — policy მოითხოვს ბრაუზერის მტკიცებულებასა და manual-ს, ორივე არსებობს.
- **R5 — Round 124 = ნაწილი 2:** Q1 ტრანსპორტი/ვიდეო, Q2 loop/range, Q3 ჯგუფები, Q4 fade/envelope, Q5 gain/volume/pan/mute/solo/meters (T12 1–4a), Q6 export, Q7 საბოლოო გაერთიანებული ვერდიქტი და ინდექსი. Q1 და Q5 — სრულად ორივე viewport-ზე. ახალი წყაროები: `working-with-video/` (`/video/` 404-ია), `automation/`, `clip-envelopes/`, `managing-files-and-sets/`. ABL-B — 3-დან, ABL-R — 11-დან; ნაწილი 1 არ გადაიწერება (ასლი `c-round-124/ableton-review-part1.md`).
- **R6 — შედეგი წინასწარ (round 125):** 2026-10-27-ზე ან შემდეგ — ჯერ რეგრესია; გადატანილი სფეროები — პირველად; Critical/უსაფრთხოება — გასწორება; High/Medium — შეზღუდული გასწორებები VISUAL-A-მდე; სხვაგვარად ABLETON-EXPERT-REVIEW → done და round 125 = DESIGN-UX-REVIEW (VISUAL-A-ს პირველი ნაბიჯი).
- **R7 — Architecture:** ARCH-CHECKPOINT-PHASE1-BOUNDARY (`tmp/studio-real-loop/b-round-121-checkpoint-request.md`) ჯერ უპასუხოა; არ ბლოკავს (მიმოხილვის რაუნდები კოდს არ ცვლის); ყველაზე სასარგებლოა VISUAL-A V-0-მდე. ახალი Architecture note round 123-ს არ მოუტანია.

"""
anchor = "**D-29z88 — Round 122-ის შედეგი"
assert s.count(anchor) == 1
s = s.replace(anchor, dec + anchor)
row_old = "| 124 | ABLETON-EXPERT-REVIEW 2 | Q1–Q7, საბოლოო ვერდიქტი (თუ Critical არ გამოჩნდა) |"
assert s.count(row_old) == 1
s = s.replace(row_old, "| 123 → | (შედეგი) | **C PASS** (`browserVerified`, P1–P8, 0 გადატანილი); 2 Low (ABL-B-1/2) → `deferred_low_polish`; ABL-R-1…10 → `awaiting_user`; gate 123 skipped (ცვლილება არ არის) |\n| 124 | ABLETON-EXPERT-REVIEW 2 | Q1–Q6 ბრაუზერში Live 12-ის manual-თან + Q7 საბოლოო ვერდიქტი; A — არაფერი (D-29z89) |\n| 125 | (წინასწარ) | 2026-10-27-დან რეგრესია; Medium+ ABL-B-ის გასწორებები; სხვაგვარად DESIGN-UX-REVIEW (VISUAL-A) |")
own_old = "**D-29z88:** round 123-ში A-ს არცერთი ფაილი არ ეკუთვნის"
i = s.index(own_old); j = s.index("\n", i)
s = s[:j+1] + "**D-29z89:** round 124-ში A-ს არცერთი ფაილი არ ეკუთვნის (მხოლოდ `a-round-124.md`). C წერს მხოლოდ loop საქაღალდეში (`user-review/`, `c-round-124*`). ყველაფერი გაყინულია (`b-round-123-r124-tree-sha256.txt`, 937).\n" + s[j+1:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
