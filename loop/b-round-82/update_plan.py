import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
anchor = '**D-29z47 — Round 81-ის შედეგი;'
assert s.count(anchor) == 1
block = '''**D-29z48 — Round 82-ის შედეგი; Round 83: SRW-18 (FB-06) ეტაპი 2 — კლიპის volume envelope (წერტილები კლიპზე, დაკვრა, ექსპორტი, გადატანა/split/trim-ის შემდეგ რჩება); X1 = GATE82-S1.**

C round 82 (`tmp/studio-real-loop/c-round-82.md`, `c-round-82.json`) — **PASS, `browserVerified: true`, `realVerified: true`**; 16 რიგი ორივე viewport-ზე, ბაგები არ არის. Root gate 82-მა გამოაქვეყნა `bdc2067` ორივე remote-ზე (review 8.5/10, COMMIT OK). SRW-18 ეტაპი 1 დასრულდა (R18-A1 pass — export-ის თანაფარდობის ცდომილება ≤ 1.0e-4); C-R80-O3 დაიხურა (X1-STATUS); fake-Bearer 403 — BLOCKED (backend cloud-ში მიუწვდომელია).

- **R1 — რიგი:** C-ის ღია ბაგი და Critical/High არ არის. რეგრესიის რაუნდი 2026-10-24-დან (დღეს 2026-10-22). Gate-82-ის #1 (Medium, ბრაუზერში დაუდასტურებელი: fade-ის drag-ის შემდეგ სწრაფი click შეიძლება double-click-ად ჩაითვალოს) X1-ად შედის, რადგან იმავე წესს envelope-ის წერტილებიც საჭიროებს.
- **R2 — მოდელი (E1):** `envelope?: {time, gain}[]` აუდიოკლიპზე; `time` — წყაროს წამები (`sourceOffset`-ის ღერძი), `gain` — წრფივი 0…1 (მაქსიმუმი 0 dB; გაძლიერება Clip Gain-ით). წყაროზე მიბმის გამო `model.ts`-ის ყველა `{ ...clip }` რედაქტირება envelope-ს უცვლელად ინარჩუნებს და split ხმას არ ცვლის. ფანჯრის გარეთ წერტილები რჩება (არადესტრუქციული trim). ალტერნატივა — კლიპის დასაწყისთან მიბმა — `model.ts`-ის ყველა ჭრის ფუნქციის ცვლილებას მოითხოვდა.
- **R3 — ხმა (E4):** ცალკე envelope GainNode მხოლოდ წერტილიან კლიპზე (`source → fade? → envelope → clipGain`), წრფივი ramp-ები gain-ში, საწყისი მნიშვნელობა `item.sourceOffset`-იდან, ბოლოს ყოველთვის ramp ფანჯრის ბოლოს მნიშვნელობამდე. ერთი `clipEnvelopeShapes` ცოცხალ დაწყებასა და ექსპორტს კვებავს; Clip Gain-ის ცოცხალ ცვლილებას არ ეჯახება.
- **R4 — UI (E5–E7):** `Env` ღილაკი და `A` (Live-ის Automation Mode-ის კლავიში) — ხედის მდგომარეობა, history-ის გარეშე; ხაზი კლიპზე ყოველთვის ჩანს; რეჟიმში double-click წერტილს ამატებს ხაზის მნიშვნელობით, drag გადააქვს (თავისუფლად, მეზობლამდე 1 ms), წერტილზე double-click შლის, pointercancel/unmount აბრუნებს; რეჟიმში fade handle-ები იმალება. წერტილების ჟესტები ცალკე `ArrangementClipEnvelope.tsx`-შია, რომ `ArrangementClip`-ის ექვსსახიანი gesture-ის switch არ გაიზარდოს (checkpoint-ის კითხვა 11).
- **R5 — Ableton (Live 12, „Automation and Editing Envelopes“, „Clip Envelopes“, §42.7; capture 2026-10-22):** დადასტურებულია ტექსტით: წერტილის დამატება/წაშლა/გადატანა, grid snap, მეზობელზე snap, Shift/Alt, envelope კლიპთან ერთად მოძრაობს, clip-track-ის edit-ები envelope-ს მოიცავს, Arrangement-ის კლიპს მხოლოდ modulation envelope აქვს. შეგნებული განსხვავებები: კლიპის საკუთარი აბსოლუტური volume envelope (FB-06), double-click-ით დამატება ხაზის მნიშვნელობით და double-click-ით წაშლა, snap-ის გარეშე, მეზობელი არ იშლება, მრუდი/Shift/Clear Envelope არ არის (FB-06-ში არ არის მოთხოვნილი). trim-ის ქცევა და ინტერპოლაციის კანონი capture-ში არ არის → CZABA-ს წესი.
- **R6 — X1 (GATE82-S1):** fade-ის გადაადგილებული ჟესტის შემდეგ 500 ms-ში იმავე handle-ზე double-click იგნორდება; შემდეგ — round 82-ის ქცევა.
- **R7 — ფაილები:** `types/arrangement.ts`, `clipboard.ts`, `graph.client.ts`, `ArrangementContext.tsx` (ერთი ხაზი), `ArrangementClip.tsx`, `ArrangementLane.tsx` (ერთი prop), `StudioWorkspace.tsx` (რეჟიმი, ღილაკი, `a`), doc 072 (სტატუსი + 3 ხაზი); ახალი `envelope.ts`, `ArrangementClipEnvelope.tsx`, `envelope.test.ts`, `clip-envelope-ui.test.tsx`, doc 073. გაყინულია `model.ts`, `fades.ts` და round 82-ის ტესტები.
- **R8 — C:** ორივე viewport: EN-MODE, EN-ADD, EN-DRAG, EN-DRAWN, EN-EXPORT (R18-A2-ის ძირითადი მტკიცებულება), EN-LIVE და EN-MIDSTART (წყვილური შედარება, C round 82-ის სიგნალი), EN-EDITS, EN-UNDO, EN-MULTIPLY, EN-PLAY-EDIT, EN-NEIGHBOURS, X1-DBLCLICK, REG-HYD, G83-3. Tech Lead: R83-T.
- **სიგნალები:** GATE82-S2 (fade-ში split ხმას ცვლის — doc 072), S3 (handle-ის hit area — doc 072), S5/S7/S8, A-R82-L2 → Low-ების ჯგუფი; S6, ENVELOPE-SNAP, ENVELOPE-CLEAR — სიგნალები; SRW18-KEYBOARD-FADES — ცალკე ჩანაწერი.
- **შემდეგ:** Round 84 — რეგრესია, თუ დაგეგმვა 2026-10-24-ზე ან შემდეგ მოდის; თორემ SRW-19 → SRW-20 → Low-ები → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN. ფარგლები არ მცირდება.

'''
s = s.replace(anchor, block + anchor)
old = '| FB-06 | ფუნქციის მოთხოვნა | ხმის ავტომაცია და fade-ები | SRW-18 | 82 (ეტაპი 1 fade in/out, D-29z47); ეტაპი 2 envelope |'
assert s.count(old) == 1
s = s.replace(old, '| FB-06 | ფუნქციის მოთხოვნა | ხმის ავტომაცია და fade-ები | SRW-18 | 82 (ეტაპი 1 fade in/out, D-29z47 — C PASS, `bdc2067`); 83 (ეტაპი 2 envelope, D-29z48) |')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
