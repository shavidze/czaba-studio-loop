import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
if 'D-29z90 —' in s: print('already'); sys.exit(0)
dec = """**D-29z90 — Round 124-ის შედეგი; ABLETON-EXPERT-REVIEW დასრულდა; Round 125: DESIGN-UX-REVIEW, ნაწილი 1 (VISUAL-A-ს პირველი ნაბიჯი).**

C round 124 (`tmp/studio-real-loop/c-round-124.md`, `c-round-124.json`) — **PASS**, `browserVerified: true`, `realVerified: true`, `allRowsRan: true`, `reviewComplete: true`: Q1–Q7 შესრულდა, გადატანილი არცერთი, ახალი ბაგი 0; SOURCE-SCOPE (`608187f`, 937) დასაწყისშიც და ბოლოსაც OK; G124-3 (401, „Sign in required“; fake-Bearer 403 — BLOCKED, backend cloud-ში არ არის). Gate 124 — `skipped`; baseline რჩება `608187f`.
- **R1 — B-ის შემოწმება:** ნაწილი 1-ის 97-ვე ცხრილის ხაზი გაერთიანებულ `user-review/ableton-review.md`-ში უცვლელადაა; `out/Q5-1440.json` (pad RMS 0.04082 → 0.02046 = −6.0 dB), `out/Q3-1440.json` (ჯგუფის Volume 0.5012), `out/g124-3.json`; სურათები `Q6-dialog-1280.png`, `Q3-nested-1440.png` C-ის აღწერას ემთხვევა.
- **R2 — ABLETON-EXPERT-REVIEW → done** (round 125-ის §7-ის მე-5 ხაზი round 124-ის ამოცანიდან): ყველა P/Q სფეროს აქვს ბრაუზერის მტკიცებულება, Medium+ ABL-B არ არის.
- **R3 — რეკომენდაციები ABL-R-11…18 → `awaiting_user`.** კავშირები: ABL-R-11 ↔ ABLETON-LOOP-KEYS-NOT-REQUESTED; ABL-R-13 ↔ ENVELOPE-SNAP; ABL-R-15 ↔ MASTER-FINE-STEP (შეფასდა); ABL-R-16 — ლიცენზიის კითხვა (ხაზების ცალკე export შეძენილ სტემებს ცალ-ცალკე გასცემს), purchase-ის წესი უცვლელია; ABL-R-17 უკვე რიგშია SRW-40-ად (ფაზა 2, მომხმარებლის go-ს ელოდება); ABL-R-18 ნაწილობრივ ემთხვევა SRW-41b-ს.
- **R4 — DESIGN-UX-REVIEW ორ ნაწილად** (ერთ რაუნდში ხუთი სექცია და ექვსი role checklist ძალიან დიდია; Ableton-ის review-იც ორად გაიყო): round 125 = D1 კომფორტის ცხრილი, D2 shortcut-ების შედარება და აღმოჩენადობა, D6 VISUAL-A-ს baseline (ყველა control-ის bounding box 1280/1440-ზე და კონტრასტის ცხრილი რეალურ ზედაპირებზე — RV-1/RV-2-ს აქამდე საწყისი გაზომვა არ ჰქონდა); round 126 = D3 ხახუნის წერტილები, D4 „Ableton-ზე უკეთესი“ (DUX-R), D5 ვერდიქტი და ინდექსი. A კოდს არ ცვლის.
- **R5 — მტკიცებულების წესი:** CZABA-ს კლიკები/ღილაკები — ბრაუზერიდან დათვლილი; Live-ის რიცხვი — მხოლოდ manual-ის ციტირებული ტექსტიდან (F), სხვაგვარად `?` და „რომელია უფრო მარტივი“ არ ფასდება. Live-ის აპლიკაცია runner-ზე არ არის. CZABA-ს keymap-ის წყარო: `StudioWorkspace.tsx`-ის `handleKeyDown` და კომპონენტების key handler-ები (მხოლოდ კითხვა) + ბრაუზერი; hint-ის ხაზი სრული სია არ არის.
- **R6 — შედეგი წინასწარ (round 126):** 2026-10-27-ზე ან შემდეგ — ჯერ რეგრესია; გადატანილი სექციები — პირველად; Critical DUX-B — გასწორება; High/Medium DUX-B — შეზღუდული გასწორებები V-0-მდე; Low → `deferred_low_polish`; DUX-R → `design_ux_recommendations`, `awaiting_user`; სხვაგვარად round 126 = DESIGN-UX-REVIEW ნაწილი 2.
- **R7 — Architecture:** ARCH-CHECKPOINT-PHASE1-BOUNDARY ხელახლა ეგზავნება root-ს (`tmp/studio-real-loop/b-round-124-checkpoint-request.md`): V-0 შემდეგი კოდის owner-ია და ~30 წყარო + ~58 ტესტ-ფაილს ეხება; checkpoint ყველაზე სასარგებლოა ამ ორი უკოდო რაუნდის დროს. არ ბლოკავს.

"""
anchor = "**D-29z89 — Round 123-ის შედეგი"
assert s.count(anchor) == 1
s = s.replace(anchor, dec + anchor)
row_old = "| 125 | (წინასწარ) | 2026-10-27-დან რეგრესია; Medium+ ABL-B-ის გასწორებები; სხვაგვარად DESIGN-UX-REVIEW (VISUAL-A) |"
assert s.count(row_old) == 1
s = s.replace(row_old, "| 124 → | (შედეგი) | **C PASS** (`browserVerified`, `reviewComplete`, Q1–Q7, 0 ბაგი); ABL-R-11…18 → `awaiting_user`; ABLETON-EXPERT-REVIEW → done; gate 124 skipped |\n| 125 | DESIGN-UX-REVIEW 1 | D1 კომფორტის ცხრილი, D2 shortcut-ები, D6 RV-1/RV-2 baseline; A — არაფერი (D-29z90) |\n| 126 | (წინასწარ) | 2026-10-27-დან რეგრესია; Medium+ DUX-B-ის გასწორებები; სხვაგვარად DESIGN-UX-REVIEW 2 (D3–D5) |")
own_old = "**D-29z89:** round 124-ში A-ს არცერთი ფაილი არ ეკუთვნის"
i = s.index(own_old); j = s.index("\n", i)
s = s[:j+1] + "**D-29z90:** round 125-ში A-ს არცერთი ფაილი არ ეკუთვნის (მხოლოდ `a-round-125.md`). C წერს მხოლოდ loop საქაღალდეში (`user-review/design-ux-review.md`, `c-round-125*`). ყველაფერი გაყინულია (`b-round-124-r125-tree-sha256.txt`, 937).\n" + s[j+1:]
open(p, 'w', encoding='utf-8').write(s)
print('ok')
