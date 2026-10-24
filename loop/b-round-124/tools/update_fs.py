import sys
p = sys.argv[1]
L = open(p, encoding='utf-8').read().split('\n')
if any('Round 124 (ABLETON-EXPERT-REVIEW, ნაწილი 2) — C PASS' in l for l in L): print('already'); sys.exit(0)
assert L[2].startswith('განახლდა:')
L[2] = 'განახლდა: 2026-10-24 · ავტორი: B (round 124 → round 125 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
i = next(k for k, l in enumerate(L) if l.startswith('- **Round 123 (ABLETON-EXPERT-REVIEW, ნაწილი 1) — C PASS'))
L.insert(i + 1, "- **Round 124 (ABLETON-EXPERT-REVIEW, ნაწილი 2) — C PASS, `browserVerified: true`, `reviewComplete: true`, Q1–Q7 ყველა სფერო, გადატანილი არცერთი, ახალი ბაგი 0; store არ შეცვლილა (gate 124 skipped, baseline `608187f`).** ABLETON-EXPERT-REVIEW → **მზადაა** (ორივე ნაწილი ბრაუზერის მტკიცებულებით; Medium+ ABL-B არ არის). საბოლოო ვერდიქტი და ინდექსი: `user-review/ableton-review.md`. გაზომვები: Clip Gain და Volume −6 dB = 0.5012 გამოსავალზე; ჯგუფის Volume −6 dB = 0.5012; loop 3 wrap 2.000 s-ზე; export-ის onset-ები sample-ზუსტი, MP3 correlation 1.000. ახალი რეკომენდაციები **ABL-R-11…18** — `awaiting_user` (ABL-R-16: ხაზების ცალ-ცალკე export — ლიცენზიის კითხვა საბასთვის; ABL-R-17 უკვე რიგშია SRW-40-ად, ფაზა 2). **Round 125 (D-29z90) — DESIGN-UX-REVIEW, ნაწილი 1** (VISUAL-A-ს პირველი ნაბიჯი): კომფორტის ცხრილი Live-თან, shortcut-ების შედარება და VISUAL-A-სთვის ზომების/კონტრასტის baseline; A კოდს არ ცვლის. ნაწილი 2 — Round 126.")
j = next(k for k, l in enumerate(L) if l.startswith('| ABLETON-EXPERT-REVIEW |'))
L[j] = "| ABLETON-EXPERT-REVIEW | **მზადაა** — ნაწილი 1 (P1–P8, Round 123) და ნაწილი 2 (Q1–Q7, Round 124): C PASS `browserVerified`, `reviewComplete: true` (`c-round-123.json`, `c-round-124.json`). ბაგები: ABL-B-1/2 (Low) → `deferred_low_polish`; Medium+ არ არის. რეკომენდაციები ABL-R-1…18 → `awaiting_user` | შედეგი: `user-review/ableton-review.md` (ქართულად; საბოლოო ვერდიქტი, საბას კითხვები, ინდექსი). `ableton-arrangement-expert` ამ runner-ზე მიუწვდომელი იყო (ABL-EXPERT-AGENT-UNAVAILABLE) — დასკვნები მხოლოდ ბრაუზერსა და Live 12-ის manual-ს ეყრდნობა. რეკომენდაციები საბას დასტურამდე არ ხორციელდება (`user-review/ableton-decisions.md`, ჯერ არ არსებობს); დადასტურებული — VISUAL-A-ს შემდეგ, ფაზა 2-მდე. |"
k = next(k for k, l in enumerate(L) if l.startswith('| VISUAL-A-OBSIDIAN |'))
rest = L[k].split('|', 3)[3]
L[k] = "| VISUAL-A-OBSIDIAN | **მუშავდება** — ნაბიჯი 1 DESIGN-UX-REVIEW: ნაწილი 1 — Round 125 (D-29z90; კომფორტის ცხრილი, shortcut-ები, RV-1/RV-2 baseline), ნაწილი 2 — Round 126 (ხახუნის წერტილები, „Ableton-ზე უკეთესი“ DUX-R იდეები, ვერდიქტი); შემდეგ V-0. წინაპირობები შესრულდა (T12 V1 `425a807`, ABLETON-EXPERT-REVIEW მზადაა) |" + rest
open(p, 'w', encoding='utf-8').write('\n'.join(L))
print('ok')
