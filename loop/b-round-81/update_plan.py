import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
anchor = '**D-29z46 — Round 80-ის შედეგი;'
assert t.count(anchor) == 1
block = '''**D-29z47 — Round 81-ის შედეგი; Round 82: SRW-18 (FB-06) ეტაპი 1 — კლიპის fade in / fade out (მოდელი, ცოცხალი დაკვრა, ექსპორტი, handle-ები); X1 = C-R80-O3 release-ის სტატუსი.**

C round 81 (`tmp/studio-real-loop/c-round-81.md`, `c-round-81.json`) — **PASS, `browserVerified: true`, `realVerified: true`**; 20 რიგი ორივე viewport-ზე; ორი Low ბაგი (C81-1, C81-2). Root gate 81-მა გამოაქვეყნა `efbed86` ორივე remote-ზე (review 8.5/10, COMMIT OK). SRW-17-ის სამივე ეტაპი C PASS-ია და გამოქვეყნებულია → **მოწმდება** (Tech Lead R79-T/R80-T/R81-T).

- **R1 — რიგი:** Critical/High/Medium ღია არ არის. რეგრესიის რაუნდი 2026-10-24-დან. C-R80-O3-ის ცალკე რეპროდუქციის რაუნდი საჭირო აღარაა: C-ის `probe-ghost.json`-მა ის უკვე გაიმეორა და მიზეზი წყაროშია (`ArrangementClip.tsx` l.497–504, l.620–643).
- **R2 — C-R80-O3-ის განჩინება:** FB-03-ის წესი (ამ ფაილის l.170) — „დაკავებულ ადგილზე ჩანს amber და კლიპი ბოლო ვალიდურ ადგილას რჩება“. ჩაწერილი 1.025 წმ ეს წესია და drag-ის დროს მკრთალი წყაროს კლიპიც იქ ჩანს. ხარვეზი მხოლოდ release-ის სტატუსია. X1: ბოლო hover უარყოფილი იყო და კლიპი საკუთარ ხაზზე გადავიდა → `<უარის ტექსტი> — კლიპი ბოლო თავისუფალ ადგილას დარჩა: <ხაზი>, start <დრო>.`; პოზიცია, ghost-ები და ჯგუფის გზა უცვლელია. სიმძიმე — Low.
- **R3 — SRW-18 ეტაპები:** 1 — fade in/out (R18-A1); 2 — clip volume envelope, breakpoint-ები კლიპზე (R18-A2). მოცულობა არ მცირდება.
- **R4 — მოდელი:** `fadeIn?`/`fadeOut?` აუდიოკლიპზე, 0-ზე არ ინახება; `in + out ≤ duration` (Live 12 §6.8). ვიდეოკლიპს fade არ აქვს (სურათის fade — SRW-19).
- **R5 — რედაქტირება (CZABA-ს არჩევანი; Live-ის capture-ში არ არის):** გადატანა/ასლი/paste — fade რჩება; trim — ორივე სიგრძე რჩება, თუ არ ეტევა, ჯერ მოჭრილი კიდის fade მცირდება; split, Delete Time, Cut/Delete range — ახალ ჭრილზე fade იშლება; range copy — ინახება მხოლოდ ფანჯარაში მოქცეული კიდის fade.
- **R6 — აუდიო:** fade-იან კლიპზე ცალკე per-source GainNode (`source → fade → clipGain`), წრფივი ramp, საწყისი მნიშვნელობა `from`-ის მიხედვით (შუა fade-იდან დაკვრა); fade-ის გარეშე კლიპის graph უცვლელია. ერთი `clipFadeShapes` ცოცხალ დაწყებასა და ექსპორტს კვებავს. `ScheduleAudioParam`-ს ramp-ის მეთოდები არჩევითად ემატება (სამი გაყინული fake). export-ის ხაზი `clipFades: clipFadeShapes(arrangement),` — `pan` substring-ის გარეშე.
- **R7 — UI:** 10×10 handle-ები body-ს ზედა კუთხეებში (hover/მონიშვნა/fade > 0), ramp-ის overlay, `data-fade-in/out`; drag თავისუფალია (snap-ის გარეშე); ერთი drag = ერთი ჩანაწერი (`Fade In`/`Fade Out`); double-click = 0; pointercancel აბრუნებს. კლავიატურით fade-ის რედაქტირება ეტაპ 1-ში არ არის (SRW18-KEYBOARD-FADES, ეტაპი 2-ის დაგეგმვის სიგნალი).
- **R8 — Ableton-თან განსხვავებები (შეგნებული):** მხოლოდ წრფივი fade (Live-ს Fade Curve აქვს); double-click-ით წაშლა (Live: handle + Delete); crossfade არ ეხება (CZABA-ს კლიპები არ ფარავს ერთმანეთს); ავტომატური 4 ms edge fade არ ემატება (Live-ში ეს არჩევითი პარამეტრია) — C-R28-INFO-NO-EDGE-FADES ამით იხურება ჩაწერილ განსხვავებად.
- **R9 — round-81-ის დანარჩენი:** C81-1 → Low-ების ჯგუფი + R81-T (ჩადგმის სიღრმის ლიმიტი არ წესდება — FB-12-ის შემცირება იქნებოდა მომხმარებლის ნებართვის გარეშე); C81-2 და gate-81 #1 → Round 82 (doc 070 l.72, doc 071 l.4); gate-81 #2–#6 → Low-ების ჯგუფი; #7 → C81-1-თან; #8 → განჩინება: შვილი ჯგუფი, რომელიც მხოლოდ წინაპრის solo-თი ისმის, საკუთარ მდგომარეობას (`off`) აჩვენებს, ისევე როგორც ხაზის M/S დადუმებული ჯგუფის ქვეშ (Live-ის ჩვენება დაუდასტურებელია). Architecture note (volume state machine → pure module) → checkpoint-ის კითხვა 10; ამოღება არ იგეგმება.
- **შემდეგ:** Round 83 — რეგრესია, თუ დაგეგმვა 2026-10-24-ზე ან შემდეგ მოდის; თორემ SRW-18 ეტაპი 2 → SRW-19 → SRW-20 → Low-ები → SRW-21 → სრული რეგრესია → T12.

'''
t = t.replace(anchor, block + anchor, 1)
old_fb06 = '| FB-06 | ფუნქციის მოთხოვნა | ხმის ავტომაცია და fade-ები | SRW-18 | 23 | კლიპზე დახატული volume envelope + fade in/out |'
assert t.count(old_fb06) == 1
t = t.replace(old_fb06, '| FB-06 | ფუნქციის მოთხოვნა | ხმის ავტომაცია და fade-ები | SRW-18 | 82 (ეტაპი 1 fade in/out, D-29z47); ეტაპი 2 envelope | D-29z47: ორ ეტაპად — 1 fade in/out (მოდელი, დაკვრა, ექსპორტი, handle-ები); 2 კლიპზე დახატული volume envelope |')
old_fb12 = '81 (ეტაპი 3, D-29z46) |'
assert t.count(old_fb12) == 1
t = t.replace(old_fb12, '81 (ეტაპი 3, C PASS `efbed86`) |')
open(p, 'w', encoding='utf-8').write(t)
print('ok')
