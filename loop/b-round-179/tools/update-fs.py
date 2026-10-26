p='feature-status.md'; s=open(p,encoding='utf-8').read()
old_hdr='განახლდა: 2026-10-26 · ავტორი: B (round 178 → round 179 დაგეგმვა, D-29z144)'
assert old_hdr in s
s=s.replace(old_hdr,'განახლდა: 2026-10-26 · ავტორი: B (round 179 → round 180 დაგეგმვა, D-29z145)')
lines=s.split('\n')
idx=[i for i,l in enumerate(lines) if l.startswith('- **Round 178 (DUX-R-5b-3a)')][0]
new=("- **Round 179 (C-R178-BADGE-SELECTOR-ის გასწორება, მხოლოდ ტესტები) — C PASS, `browserVerified: true`, `realVerified: true`, ბაგი 0; gate 179 გამოქვეყნდა `15189d5` (rounds 178+179 ერთად). DUX-R-5b-3a — **მზადაა**; C-R178-BADGE-SELECTOR, C-R177-G1-562, GATE177-S5 — დახურულია.** "
 "T179-TARGETED 150/150, MUT-179 (m288–m290 — ფერის ცვლილება badge-ის ტესტებს აღარ არღვევს), HASH-CARRY (round 178-ის 13 ბრაუზერის row გადმოვიდა), BADGE-BROWSER (rgb(163,155,142), საზღვარი rgb(115,107,96), 0 სპილენძისფერი px, 6.68 / 3.5), G179-3, FUNC-SMOKE (რეალური output tap 0.297; WAV 101.352 წმ), SELECTOR-SWEEP — PASS (`c-round-179.md`); fake-Bearer 403 — BLOCKED (backend unavailable in cloud). "
 "Info: C-R179-SELECTOR-SWEEP (5b-3b-ის grants), C-R179-DOC147-STALE (Round 180 D1), C-R179-EXPORT-PEAK (იგივე სიგნალი, რაც C-R178-EXPORT-CLIPS-AT-0DB). "
 "**Round 180 (D-29z145): DUX-R-5b-3b — DUX-R-5-ის ბოლო ნაწილი.** ნეიტრალური ხდება drag-ის უკუკავშირი: ბიბლიოთეკის და ხაზზე გადატანის ghost-ები (ვალიდური → `foreground`, დაბლოკილი → `muted`; ერთმანეთისგან 2.21:1 — დღეს ორივე ერთნაირი სპილენძისფერია), ფაილის drag-ის ring (ვიდეო ხაზი `foreground`, აუდიო ხაზი `muted`), drop-ის მინიშნება (`foreground`), ვიდეოს იმპორტის ღილაკები და Preview-ს „Add“ (`outline-strong` ჩარჩო + `foreground` ტექსტი, R35). "
 "C ამოწმებს რეალური drag-ით (ფაილის drag — სინთეზური DragEvent რეალურ Chromium-ში), ფერებს, კონტრასტს, ქცევას და ეტაპის ბოლოს INVENTORY-EXIT-ს: ყოველი დარჩენილი სპილენძის token უნდა იყოს K7–K12 (მონიშვნა, playhead — Ruler-ის სახელურის ჩათვლით, primary Export — dialog-ის ღილაკის ჩათვლით, focus/რედაქტირების ველი, preview fill, envelope). DUX-R-5 მზადაა მხოლოდ ამ რაუნდის C PASS-ის შემდეგ. "
 "შემდეგ: რეგრესიის რაუნდი (2026-10-27-დან), frontend-architect-ის ახალი შეზღუდული მოთხოვნა DUX-R-5-ის საზღვარზე, მერე M1. **⚠ ვეტოს შესაძლებლობით (D-29z145):** R36 (ვალიდური/დაბლოკილი = ღია/ნაცრისფერი, `warning`/`destructive` არა — სპილენძის scan-ს ვერ გადის), R37 (უარის მინიშნება `foreground`), R35-ის რეცეპტი (ხილული `outline-strong` ჩარჩო).")
lines.insert(idx+1,new)
s='\n'.join(lines)
old='**DUX-R-5b-3a — ბაგია** (ტექსტური ადგილები; Round 178 C FAIL მხოლოდ ტესტის selector-ზე — C-R178-BADGE-SELECTOR, Medium; ბრაუზერის row-ები PASS; გასწორება Round 179, D-29z144), **DUX-R-5b-3b — არ დაწყებულა** (Lane ghost / drop / R35), **DUX-R-5b-3 — არ დაწყებულა** (ეტიკეტები, ghost-ები, Export dialog)'
assert old in s, 'row'
s=s.replace(old,'**DUX-R-5b-3a — მზადაა** (Round 178–179, C round 179 PASS `browserVerified`, `15189d5`; `c-round-178.md`, `c-round-179.md`), **DUX-R-5b-3b — მუშავდება** (Round 180, D-29z145: Lane ghost / drop ring / hint / R35; ეტაპის ბოლოს INVENTORY-EXIT), **DUX-R-5 — მუშავდება** (მზადაა Round 180-ის C PASS-ის შემდეგ)')
open(p,'w',encoding='utf-8').write(s)
print('ok')
