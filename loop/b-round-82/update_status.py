import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    assert s.count(old) == count, (old[:80], s.count(old))
    s = s.replace(old, new)
rep('განახლდა: 2026-10-22 · ავტორი: B (round 81 → round 82 დაგეგმვა)', 'განახლდა: 2026-10-22 · ავტორი: B (round 82 → round 83 დაგეგმვა)')
lines = s.split('\n')
idx = next(i for i, l in enumerate(lines) if l.startswith('მიმდინარე რაუნდი: **Round 82**'))
lines[idx] = ('მიმდინარე რაუნდი: **Round 83** (`current-task.md`, D-29z48) — **SRW-18 (FB-06) ეტაპი 2: კლიპის volume envelope.** '
 'აუდიოკლიპს ემატება არჩევითი `envelope` — წერტილები `{time, gain}` წყაროს დროში (წრფივი gain 0…1, მაქსიმუმი 0 dB); ცარიელი არ ინახება. '
 'წყაროზე მიბმის გამო გადატანა, split, trim, დროის წაშლა და დუბლირება envelope-ს `model.ts`-ის ცვლილების გარეშე ინარჩუნებს (trim არ შლის — უკან გაშლისას წერტილები ბრუნდება); clipboard-ს გადააქვს. '
 'ახალი pure `envelope.ts`; ცოცხალი დაკვრა და ექსპორტი — ცალკე envelope GainNode წრფივი ramp-ებით (`source → fade? → envelope → clipGain`). '
 '`Env` ღილაკი და `A` კლავიში რეჟიმს რთავს; ახალი `ArrangementClipEnvelope.tsx`: ხაზი კლიპზე ყოველთვის ჩანს, რეჟიმში double-click წერტილს ამატებს ხაზის მნიშვნელობით, drag გადააქვს, წერტილზე double-click შლის, pointercancel/unmount აბრუნებს; რეჟიმში fade handle-ები იმალება; `data-envelope`. '
 'შეზღუდული fix X1 = GATE82-S1 (fade-ის drag-ის შემდეგ 500 ms-ში double-click fade-ს აღარ შლის). doc 072 (სტატუსი + 3 ხაზი), ახალი doc 073. ბაზა: HEAD `bdc2067`, სუფთა tree, გაყინული 471.')
lines.insert(idx + 2, ('**Round 82-ის შედეგი:** C PASS, `browserVerified=true`, `realVerified=true` (`c-round-82.md`, `c-round-82.json`); root-მა გამოაქვეყნა `bdc2067` (ორივე remote; review 8.5/10, COMMIT OK). '
 'SRW-18 ეტაპი 1 (fade in/out) — 16 რიგი PASS ორივე viewport-ზე, ბაგები არ არის: R18-A1 export-ით (fade-in-ის თანაფარდობის მაქს. ცდომილება 9.9e-5, fade-out 1.0e-4, Clip Gain მრავლდება), FD-LIVE/FD-MIDSTART music-ზე (§5-ის წესით; წყვილური შედარება −4.6 dB, თეორია −4.44). '
 'C-R80-O3 დაიხურა (X1-STATUS). fake-Bearer 403 — BLOCKED (backend cloud-ში მიუწვდომელია). Gate-ის შენიშვნები: #1 → Round 83 X1; #2/#3 → doc 072; #4 → SRW18-KEYBOARD-FADES (ცალკე ჩანაწერი); #5–#8 → Low-ების ჯგუფი/სიგნალები.\n'))
s = '\n'.join(lines)
rep('| FB-06 | ხმის ავტომაცია და fade-ები | **მუშავდება** (SRW-18 ეტაპი 1 — fade in/out, Round 82, D-29z47; ეტაპი 2 — volume envelope) | `current-task.md` | Round 82 → C |',
    '| FB-06 | ხმის ავტომაცია და fade-ები | **მუშავდება** (ეტაპი 1 — fade in/out: C PASS, `bdc2067`; ეტაპი 2 — volume envelope, Round 83, D-29z48) | `c-round-82.md`; `current-task.md` | Round 83 → C |')
rep('| SRW-18 | Fades + volume envelope | **მუშავდება** (ეტაპი 1 — fade in/out, Round 82, D-29z47; ეტაპი 2 — envelope) | `current-task.md` | Round 82 → C (FD-*, X1-STATUS) |',
    '| SRW-18 | Fades + volume envelope | **მუშავდება** (ეტაპი 1 — C PASS `browserVerified`, `bdc2067`, R18-A1 pass; ეტაპი 2 — envelope, Round 83, D-29z48) | `c-round-82.md`; `current-task.md` | Round 83 → C (EN-*, X1-DBLCLICK); შემდეგ Tech Lead R82-T/R83-T |')
old_o3 = next(l for l in s.split('\n') if l.startswith('| C-R80-O3 | Low |'))
rep(old_o3, '| C-R80-O3 | Low | **დაიხურა** (Round 82 X1; C X1-STATUS PASS ორივე viewport-ზე, `bdc2067`) | `c-round-82.md` X1-STATUS | — |')
rep('| C81-2 | Low | **ბაგია** → Round 82 (doc 070 l.72, ერთი ხაზი) | `c-round-81.md` C81-2 | C: SOURCE-UNCHANGED / doc diff |',
    '| C81-2 | Low | **დაიხურა** (Round 82: doc 070 l.72; C SOURCE-UNCHANGED-მა დაადასტურა) | `c-round-82.md` | — |\n'
    '| GATE82-S1 | Medium (ბრაუზერში დაუდასტურებელი) | **ბაგია** → Round 83 X1 (fade-ის drag-ის შემდეგ სწრაფი click შეიძლება double-click-ად ჩაითვალოს და fade წაშალოს) | `gates/round-82/review-result.json` #1 | C: X1-DBLCLICK |\n'
    '| SRW18-KEYBOARD-FADES | Low | **ღიაა** — fade handle-ებს და (Round 83-დან) envelope-ის წერტილებს role/focus/კლავიატურა არ აქვს; ცალკე ჩანაწერი (gate-82 #4) | `gates/round-82/review-result.json` #4 | Low-ების ჯგუფი ან ცალკე ეტაპი |')
r82 = next(l for l in s.split('\n') if l.startswith('| R82-T |'))
rep(r82, r82 + '\n| R83-T | რეალურ Chrome-ში ყურსასმენით: `Env` რეჟიმი (ღილაკი და `A`) ადვილად მოიძებნება; envelope-ის წერტილის დამატება/გადატანა/წაშლა ზუსტია ორივე ხაზის სიმაღლეზე; −12 dB ჩაღრმავება მდორედ ჟღერს; რეჟიმის გამორთვის შემდეგ range/seek/fade-ები ძველებურად მუშაობს | Round 83 (D-29z48) |')
h82 = next(l for l in s.split('\n') if l.startswith('Round 82 (D-29z47):'))
rep(h82, 'Round 83 (D-29z48): SRW-18 (FB-06) ეტაპი 2 — კლიპის volume envelope (`envelope.ts`, წყაროზე მიბმული წერტილები, ცოცხალი დაკვრა + ექსპორტი ცალკე envelope GainNode-ით, `Env`/`A` რეჟიმი, ახალი `ArrangementClipEnvelope.tsx`); X1 = GATE82-S1; doc 072, doc 073. შემდეგ: რეგრესიის რაუნდი (თუ Round 84-ის დაგეგმვა 2026-10-24-ზე ან შემდეგ მოდის), თორემ SRW-19 → SRW-20 → Low-ები → SRW-21 → სრული რეგრესია → T12 → VISUAL-A-OBSIDIAN. ფარგლები არ მცირდება.\n\n' + h82 + ' **შედეგი: C PASS (`browserVerified: true`), გამოქვეყნდა `bdc2067`.**')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
