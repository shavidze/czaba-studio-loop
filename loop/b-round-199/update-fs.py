p='feature-status.md'
s=open(p,encoding='utf-8').read()
assert '- **Round 199 (D-29z164)' not in s
old='განახლდა: 2026-10-26 · ავტორი: B (round 198 → round 199 დაგეგმვა, D-29z164)'
assert s.count(old)==1
s=s.replace(old,'განახლდა: 2026-10-27 · ავტორი: B (round 199 → round 200 დაგეგმვა, D-29z165)')
a='- **Round 198 (D-29z163): C-R196-02'
assert s.count(a)==1
new=('- **Round 199 (D-29z164): რეგრესიის რაუნდი — მზადაა.** C PASS, `browserVerified: true`, `realVerified: true`; 91 row PASS, ბაგი 0, რეგრესია 0, e2e smoke PASS; gate 199 გამოქვეყნდა `5b1a2bb` (doc 156/158/159-ის სტატუსის ხაზები). '
 'ყველა გაშვებადი row გაეშვა 1440×900-სა და 1280×720-ზე; blocked მხოლოდ backend-ის გამო (SRW-21 mount, R80-RECORDINGS-FIELD-BORDERS, F11–F13/F16). RV-MARKER-ENTER-ის K2 ქვეკრიტერიუმი ბრაუზერში მიუწვდომელია და მხოლოდ vitest-ით (MU15/MU16) არის დაცული — ბრაუზერით დადასტურებულად არ ითვლება. '
 '`regression-last.json` = 2026-10-27 (round 199); შემდეგი რეგრესია — 2026-10-30-ზე ან შემდეგ. B-ის ხარვეზი: REG-DUX5-PLAYHEAD-RESCAN round 199-ში არ შევიდა → Round 200-ის R200-P1. '
 'დაიხურა: C-R167-METRONOME-UNDER-MUTE (Master Mute-ზე click 0), C-R149-OBS-SPACE-EMPTY (მიმდინარე ქცევა; ABL-R-9 ფლობს ცვლილებას), A-R147-REVIEW-L2-BADGE-CLASS-SELECTOR (რეალურად Round 179-ში გასწორდა). '
 '**Round 200 (D-29z165) — RETRO (მუშავდება):** `retros/retro-200.md` და `lessons.md` დაიწერა; A-ს არაფერი აქვს, C ამოწმებს რიცხვებისა და მიზეზების მიკვლევადობას + R200-P1 და G200-3 ბრაუზერში. შემდეგ Round 201 — SABA-B-4 ეტაპი 2, შემდეგ სისტემური დავალებები (SYS-n), შემდეგ STORE-2b.\n')
s=s.replace(a,new+a)
o1='ეტაპი 2 (store-ის გვერდები, C-R196-03 შემავალი) — **არ დაწყებულა**, Round 199 რეგრესიისა და Round 200 RETRO-ს შემდეგ'
assert s.count(o1)==1
s=s.replace(o1,'ეტაპი 2 (store-ის გვერდები, C-R196-03 შემავალი) — **არ დაწყებულა**, Round 201 (Round 199 რეგრესია მზადაა; Round 200 RETRO)')
o2='| Round 199 რეგრესია → Round 200 RETRO → ეტაპი 2 |'
assert s.count(o2)==1
s=s.replace(o2,'| Round 200 RETRO → Round 201 ეტაპი 2 |')
o3='Round 199 — რეგრესია (D-29z164, მუშავდება); Round 200 — RETRO;'
assert s.count(o3)==1
s=s.replace(o3,'Round 199 — რეგრესია **მზადაა** (`5b1a2bb`); Round 200 — RETRO (D-29z165, მუშავდება); Round 201 — SABA-B-4 ეტაპი 2; შემდეგ სისტემური დავალებები (`retros/retro-200.md` §6);')
o4='**Round 122 (D-29z87) — სამდღიანი რეგრესიის რაუნდი — მზადაა'
assert s.count(o4)==1
s=s.replace(o4,'**Round 199 (D-29z164) — სამდღიანი რეგრესიის რაუნდი — მზადაა (C PASS `browserVerified`, 91 row, ბაგი 0, `5b1a2bb`; `regression-last.json` = 2026-10-27; შემდეგი — 2026-10-30-ზე ან შემდეგ; გადატანილია REG-DUX5-PLAYHEAD-RESCAN → Round 200 R200-P1).**\n\n'+o4)
open(p,'w',encoding='utf-8').write(s)
print('ok')
