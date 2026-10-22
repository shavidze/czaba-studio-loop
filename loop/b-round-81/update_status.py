import sys
p = sys.argv[1]
lines = open(p, encoding='utf-8').read().split('\n')
def find(prefix):
    for i, l in enumerate(lines):
        if l.startswith(prefix):
            return i
    raise SystemExit('missing ' + prefix)
lines[find('განახლდა: ')] = 'განახლდა: 2026-10-22 · ავტორი: B (round 81 → round 82 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`'
lines[find('მიმდინარე რაუნდი: ')] = ('მიმდინარე რაუნდი: **Round 82** (`current-task.md`, D-29z47) — **SRW-18 (FB-06) ეტაპი 1: კლიპის fade in / fade out.** '
 'აუდიოკლიპს ემატება არჩევითი `fadeIn`/`fadeOut` (0-ზე არ ინახება; `in + out ≤ duration`, Live 12 §6.8); ახალი pure `fades.ts`; '
 'ცოცხალი დაკვრა და ექსპორტი ერთ გზას იყენებს — fade-იან კლიპზე ცალკე fade GainNode წრფივი ramp-ით (შუა fade-იდან დაკვრაც სწორ დონეზე იწყება); '
 'კლიპის body-ს ზედა კუთხეებში 10×10 handle-ები (hover / მონიშვნა / fade > 0), ramp-ის ხაზი, `data-fade-in/out`; ერთი drag = ერთი ჩანაწერი, double-click = 0, pointercancel აბრუნებს. '
 'გადატანა/ასლი fade-ს ინარჩუნებს, trim ჯერ მოჭრილ კიდეს ამოკლებს, split/დროის წაშლა/Cut ახალ ჭრილზე fade-ს აშორებს. '
 'შეზღუდული fix X1 = C-R80-O3 (უარყოფილი ხაზის შემდეგ release-ის სტატუსი ამბობს, სად დარჩა კლიპი; ადგილი უცვლელია — FB-03-ის წესი). doc 070 l.72, doc 071 l.4, ახალი doc 072. '
 'ბაზა: HEAD `efbed86`, სუფთა tree, გაყინული 467. ეტაპი 2 (volume envelope, R18-A2) — შემდეგ SRW-18 რაუნდში.')
i = find('**Round 80-ის შედეგი:**')
lines.insert(i, '')
lines.insert(i, ('**Round 81-ის შედეგი:** C PASS, `browserVerified=true`, `realVerified=true` (`c-round-81.md`, `c-round-81.json`); root-მა გამოაქვეყნა `efbed86` (ორივე remote; review 8.5/10, COMMIT OK). '
 'SRW-17 ეტაპი 3 (ჯგუფის Mute/Solo/Volume, ჩადგმა, ნახევრად ფერადი Solo, X1) — 20 რიგი PASS ორივე viewport-ზე: R17-G2 (export-ის თანაფარდობა 0.50000001, 0% → 0 LSB) და R17-G3 (გარე ჯგუფის mute → −inf და peak 0; თანაფარდობა 0.24999999). '
 'ორი Low ბაგი: C81-1 (ჩადგმული ჯგუფის სახელი იჭრება) → Low-ების ჯგუფი + R81-T; C81-2 (doc 070 l.72) → Round 82. fake-Bearer 403 — BLOCKED (backend cloud-ში მიუწვდომელია). '
 'ბრაუზერში დაუდასტურებელი: ჯგუფის Volume-ის pointercancel (მხოლოდ jsdom UM3). SRW-17 ყველა ეტაპი გამოქვეყნებულია → **მოწმდება** (Tech Lead R79-T/R81-T).'))
def row(prefix, text):
    lines[find(prefix)] = text
row('| FB-06 |', '| FB-06 | ხმის ავტომაცია და fade-ები | **მუშავდება** (SRW-18 ეტაპი 1 — fade in/out, Round 82, D-29z47; ეტაპი 2 — volume envelope) | `current-task.md` | Round 82 → C |')
row('| FB-12 |', '| FB-12 | ტრეკების ჯგუფები/ქვეჯგუფები | **მოწმდება** (SRW-17 ყველა ეტაპი C PASS `browserVerified`: 1 `74eca15`, 2 `68383fa`, 3 `efbed86`; რჩება Tech Lead-ის R79-T/R80-T/R81-T) | `c-round-79.md`, `c-round-80.md`, `c-round-81.md`, `gates/gate-round-81.json` | Tech Lead |')
row('| SRW-17 |', '| SRW-17 | ტრეკების ჯგუფები | **მოწმდება** (ეტაპი 1 — `74eca15`; ეტაპი 2 — `68383fa`; ეტაპი 3 — Mute/Solo/Volume, ჩადგმა, ნახევრად ფერადი Solo, C Round 81 PASS `browserVerified`, `efbed86`; fake-Bearer 403 — BLOCKED, backend) | `c-round-81.md`, `c-round-81.json`, `gates/gate-round-81.json` | Tech Lead R79-T/R80-T/R81-T; C81-1 → Low-ები |')
row('| SRW-18 |', '| SRW-18 | Fades + volume envelope | **მუშავდება** (ეტაპი 1 — fade in/out, Round 82, D-29z47; ეტაპი 2 — envelope) | `current-task.md` | Round 82 → C (FD-*, X1-STATUS) |')
row('| C80-1 |', '| C80-1 | Low | **დაიხურა** (Round 81 X1; C X1-FOCUS PASS ორივე viewport-ზე, `efbed86`) | `c-round-81.md` X1-FOCUS | — |')
row('| C-R80-O3 |', '| C-R80-O3 | Low | **ბაგია** → Round 82 X1 (B, D-29z47: ბოლო ვალიდური ადგილი FB-03-ის წესია, plan l.170; ხარვეზი — release-ის სტატუსი არ ამბობს, სად დარჩა კლიპი) | `c-round-80.md` O3; `c-round-80/probe-ghost.json` | C: X1-STATUS |')
i = find('| C-R80-O3 |') + 1
lines.insert(i, '| C81-2 | Low | **ბაგია** → Round 82 (doc 070 l.72, ერთი ხაზი) | `c-round-81.md` C81-2 | C: SOURCE-UNCHANGED / doc diff |')
lines.insert(i, '| C81-1 | Low | **ღიაა** — Low-ების ჯგუფი + Tech Lead R81-T (UX: ჩადგმული ჯგუფის სახელი `ჯგუ…`-მდე იჭრება; M4 ≥ 40 px დაცულია; ჩადგმის სიღრმის ლიმიტს B არ აწესებს) | `c-round-81.md` C81-1; `c-round-81/shots/controls-nested-*.png` | Low-ები |')
i = find('| R81-T |') + 1
lines.insert(i, '| R82-T | რეალურ Chrome-ში ყურსასმენით: fade-ის handle-ები ორივე ხაზის სიმაღლეზე ადვილად ჩანს და იჭირება; 1 წმ fade in და 2 წმ fade out მდორედ ჟღერს; handle-ები trim-სა და დროის მონიშვნას არ უშლის | Round 82 (D-29z47) |')
i = find('Round 81 (D-29z46):')
lines.insert(i, '')
lines.insert(i, 'Round 82 (D-29z47): SRW-18 (FB-06) ეტაპი 1 — კლიპის fade in/out (`fades.ts`, მოდელი, ცოცხალი დაკვრა + ექსპორტი ცალკე fade GainNode-ით, handle-ები, undo, რედაქტირების წესები F3); X1 = C-R80-O3 release-ის სტატუსი; doc 070 l.72, doc 071 l.4, doc 072. შემდეგ: რეგრესიის რაუნდი (2026-10-24-დან) ან SRW-18 ეტაპი 2 → SRW-19 → SRW-20 → Low-ები → SRW-21 → სრული რეგრესია → T12.')
open(p, 'w', encoding='utf-8').write('\n'.join(lines))
print('ok')
