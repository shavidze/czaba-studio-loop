p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md'
s = open(p, encoding='utf-8').read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)


anchor = 'მიზეზი: Master ყველაზე მცირე დამოუკიდებელი ნაწილია, რომელიც FB-14-ს რეალურ სიგნალს აძლევს და R13-M4-ის root finding-ს ხილულს ხდის. Meter-ები (ეტაპი 2) ამ Master bus-ზე დგება.\n'
rep(anchor, anchor + '''
**D-29q — Round 25-ის შედეგი; SRW-13, ეტაპი 2a (Round 26): Master-ის ცოცხალი meter და Peak/Clip indicator.** C round 25 (`c-round-25.md`): **PASS**, scope-ში ახალი ბაგის გარეშე — R25-MV/MM/ML/E0/EO/E6/EM/H/K/L/R/S/U/Doc, G25-1..3 (vitest 1045/1045). R13-M3 დადასტურდა, R13-M4-ის export ნაწილიც.

**C-R23-01 გაუარესდა** (4 → 8 NUL, სამი ხილულ SSR ტექსტში hydration-მდე). ის Tech Lead-ის პასუხს ელოდება: (a) React 19 ან (b) `entry.server.tsx`-ის ვიწრო grant. B ნებართვას ვერ გასცემს (§6). ბაგი Medium-ია და არც უსაფრთხოებას ეხება, არც მონაცემების დაკარგვას, ამიტომ დამოუკიდებელ სამუშაოს არ აჩერებს. პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.

ეტაპი 2 ორად იყოფა, მოთხოვნა არ მცირდება:
- **2a** (Round 26) — Master-ის meter და latch-იანი Peak/Clip;
- **2b** — ტრეკების meter-ები. ისინი lane-ის header-ის geometry-ს ეხება და ცალკე შემოწმებას საჭიროებს.

ეტაპი 2a-ს გადაწყვეტილებები:
- **Tap:** `ApplyScheduleOptions.tap` optional ველია. Master node-ს fan-out-ით უერთდება, `master.connect(ctx.destination)`-ის გვერდით, რომელიც უცვლელია. Tap post-fader-ია, ანუ ზომავს იმას, რაც ისმის (T12.20). Export-ში tap არ გადაეცემა.
  - B-ის probe (`tmp/studio-real-loop/b-round-25-probe.txt`, scratch copy `store/`-ის გარეთ): `ScheduleAudioContext`-ზე required `createAnalyser` გაყინულ ტესტებში 28 tsc შეცდომას იძლევა. Optional tap-ით tsc 0-ია, `graph.test.ts` და `master.test.ts` კი 36/36 გადის.
- **Analyser:** context ქმნის ერთხელ თითო `AudioContext`-ზე. თუ `createAnalyser` არ არსებობს, meter უბრალოდ არააქტიურია; ეს გაყინულ fake context-ებს იცავს. გამოიყენება `getFloatTimeDomainData`, რადგან byte-ის ვარიანტი ±1-ზე ჭრის და გადატვირთვას მალავს. `fftSize` ≥ 4096.
- **გადატვირთვის პრედიკატი** export-ისაა (`x > MAX_24BIT_SAMPLE` ან `x < −1`), ერთი განსაზღვრებით. ამიტომ ცოცხალი indicator და export-ის დათვლა ერთმანეთს ემთხვევა.
- **Latch** მხოლოდ `Master Peak` ღილაკზე click-ით სუფთავდება (T12.23). Reset arrangement-ის edit არ არის: history-ში არ იწერება და status-ის ტექსტს არ ქმნის.
- **Render:** meter-ის frame ცალკე store-ით და DOM-ში ჩაწერით მიეწოდება. `ArrangementMaster` frame-ზე 0-ჯერ რენდერდება, latch-ის გადასვლაზე მაქსიმუმ 1-ჯერ.
- **R26-X:** Master Mute-ის დროს export dialog gain note-ს აღარ აჩვენებს. C round 25-მა შენიშნა, რომ ის ჩუმ ფაილს ეწინააღმდეგებოდა; ეს ყველაზე მცირე პატიოსანი ქცევაა.
- **Harness-ის წესი:** export-ის byte-იდენტურობა oracle აღარ არის, რადგან pipeline ±1 LSB-ით არადეტერმინისტულია (C round 11, C round 25 §5.1). შედარება ხდება frame-ებით, FS-ით, RMS-ით ან max |Δ| ≤ 1 LSB-ით.

მიზეზი: Round 25-თან ერთად ეს FB-14-ის „საბოლოო დონის/გადატვირთვის კონტროლს“ ასრულებს და R13-M4-ის meter ნაწილს ფარავს. მცირე, დამოუკიდებლად შემოწმებადი ერთეულია.
''')

rep('| 25 | SRW-13, ეტაპი 1 | Master Volume/Mute (ცოცხალი + export), export-ის გადატვირთვის გაფრთხილება, `ArrangementMaster` header-ში (D-29p) |',
    '| 25 | SRW-13, ეტაპი 1 | Master Volume/Mute (ცოცხალი + export), export-ის გადატვირთვის გაფრთხილება, `ArrangementMaster` header-ში (D-29p). **C PASS** |\n| 26 | SRW-13, ეტაპი 2a | Master-ის ცოცხალი meter, peak hold, latch-იანი Peak/Clip; R26-X (D-29q) |')

rep('| — | SRW-13 ეტაპი 2–4 | Meter-ები + clip indicator; FB-04 clip gain; FB-05 pan + fader-ის UX + round-9 M1/L8 |',
    '| — | SRW-13 ეტაპი 2b–4 | ტრეკების meter-ები; FB-04 clip gain; FB-05 pan + fader-ის UX + round-9 M1/L8 |')

rep('Round 22-ის, Round 23-ისა და Round 24-ის შემდეგ advisor ხელმისაწვდომი იყო',
    'Round 22-ის, Round 23-ის, Round 24-ისა და Round 25-ის შემდეგ advisor ხელმისაწვდომი იყო')

rep('- **Round 25: გაგზავნილია.** SRW-13, ეტაპი 1: Master Volume/Mute და export-ის გადატვირთვის გაფრთხილება (D-29p). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
    '''- **Round 25: C PASS** (`tmp/studio-real-loop/c-round-25.md`). R25-MV, MM, ML, E0, EO, E6, EM, H, K, L, R, S, U, Doc და G25-1..3 PASS-ია. vitest 1045/1045. Scope-ში ახალი ბაგი არ არის. R13-M3 და R13-M4-ის export ნაწილი დადასტურდა.
  - **C-R23-01 გაუარესდა:** 8 NUL, სამი ხილულ SSR ტექსტში. Tech Lead-ის პასუხი სასწრაფოა (D-29q).
- **Round 26: გაგზავნილია.** SRW-13, ეტაპი 2a: Master-ის ცოცხალი meter და Peak/Clip indicator; R26-X (D-29q). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.''')

open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
