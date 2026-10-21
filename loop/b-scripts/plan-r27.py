import io

p = '../../docs/technical/studio-real-workspace/plan.md'
s = io.open(p, encoding='utf-8').read()


def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)


d29r = '''**D-29r — Round 26-ის შედეგი; SRW-13, ეტაპი 2b (Round 27): ტრეკების ცოცხალი meter-ები.** C round 26 (`c-round-26.md`): **PASS**, scope-ში ახალი ბაგის გარეშე — R26-ML/MP/C0/C6/CR/CM/RB/X/E/K/L/R/S/U/Doc, G26-1..3 (vitest 1072/1072). R13-M4 მთლიანად დადასტურდა. FB-14 „მოწმდება“ სტატუსშია, დარჩა მხოლოდ Tech Lead-ის R25-T/R26-T.

**C-R23-01** ისევ ღიაა: 4 NUL. Offset-ები ისევ გადაიწია, ეს გამოსწორება არ არის. Tech Lead-ის არჩევანი (React 19 ან `entry.server.tsx`-ის grant) უცვლელად საჭიროა.

ეტაპი 2b-ს გადაწყვეტილებები:
- **Tap:** `ApplyScheduleOptions.trackTaps` optional ველია.
  - `panner.connect(tap)` უცვლელი `panner.connect(master)`-ის **შემდეგ** ერთდება. გაყინული `graph.test.ts` `outputs[0]`-ს მიჰყვება, ამიტომ master პირველ output-ად უნდა დარჩეს.
  - Tap panner-ის შემდეგაა. ეს ტრეკის output stage-ია (T12.20), ასე რომ ეტაპი 4-ის pan-საც ასახავს.
  - Export-ში tap არ გადაეცემა.
- **Analyser-ები:** თითო ტრეკს ერთი stereo tap აქვს (splitter + 2 analyser, fftSize 4096, float მონაცემები). ისინი master-ის tap-ის შემდეგ იქმნება და ისევეა დაცული. `lay11`-ზე სულ 5 stereo tap-ია. ღირებულება მოწმდება R27-RB-ში: drift ≤ round 26 + 10 ms, frame-ზე 0 render.
- **Latch:** პრედიკატი იგივეა. T12.22-ის მიხედვით ტრეკის over გაფრთხილებაა: warning token, ფორმის ცვლილება და sr-only ტექსტი. Destructive Main Output Clip მხოლოდ Master-ს აქვს.
  - Reset-ის წერტილი ერთია: არსებული `resetMasterPeak` (მას გაყინული Master Peak ღილაკი იძახებს) Master-ს და ყველა ტრეკს ასუფთავებს. ამიტომ ახალი Tab stop არ ემატება.
  - Reset edit არ არის.
- **Geometry:** meter header-ის ქვედა padding-ის ზოლში (`pb-1.5`) absolute-ად დგას, ყველა სიმჭიდროვეზე. ახალი row არ ემატება. Row-ების, scroller-ის, მცურავი ვიდეოს და header-ის ყველა control-ის rect უცვლელია.
- **ტესტის ვიწრო შესწორება:** B-ის probe-მა აჩვენა, რომ `meter-ui.test.tsx` ზუსტად 1 splitter-ს და 2 analyser-ს ამოწმებს (l.348, 351, 362, 363, 376). Per-track tap-ები ზუსტად ამ ხაზებს არღვევს.
  - A-ს მხოლოდ ამ ხუთი ხაზის შეცვლა შეუძლია, ზუსტ ფორმულებზე (1 + tracks, 2 + 2 × tracks).
  - Master-ის assertion-ები სიტყვასიტყვით რჩება.
- **Oracle-ები:**
  - ტრეკის სიმართლე Solo-თი იზომება post-master tap-თან შედარებით;
  - unsoloed ტრეკის meter = იმავე ტრეკის solo მაქსიმუმი ±0.5 dB;
  - „ტრეკი ≤ Master“ oracle-ად **არ** გამოიყენება, რადგან mix-ში ნაწილობრივი გაქრობა შესაძლებელია;
  - time-to-floor = (L0+60)/20 წმ + 0.1 წმ (C round 26 §7).
- **Reviewer-ის ნარჩენები:**
  - M2c (unmount-unsubscribe ტესტი) round 27-ის ტესტებშია;
  - M1 (rAF-gap sampling) → R26-M1, Low hardening ეტაპი 4-ის შემდეგ (AudioWorklet-ს module URL სჭირდება, `public/**` კი აკრძალულია);
  - Master-ის hold tick ≥ +6 dBFS-ზე → ეტაპი 4.
- **დემო `Soft impact`:** ის full scale-ს აღწევს, რაც Tech Lead-ის გადაწყვეტილებაა (ნორმალიზების grant ან მიღება). პრედიკატი არ იცვლება, რადგან ცვლილება R25-EO/R26-C0-ის მტკიცებულებას გააუქმებდა, და 24-bit export 1.0-ს მართლაც 1 LSB-ით ზღუდავს.

მიზეზი: ეს SRW-13-ის meter-ის ნაწილს ასრულებს („per-track and master level meters with clip indicator“). მცირე ერთეულია, რომელსაც საკუთარი geometry კონტრაქტი აქვს.

'''
rep('**ვიდეოს import (SRW-02, FB-15).**', d29r + '**ვიდეოს import (SRW-02, FB-15).**')

rep('| 26 | SRW-13, ეტაპი 2a | Master-ის ცოცხალი meter, peak hold, latch-იანი Peak/Clip; R26-X (D-29q) |',
    '| 26 | SRW-13, ეტაპი 2a | Master-ის ცოცხალი meter, peak hold, latch-იანი Peak/Clip; R26-X (D-29q). **C PASS** |\n'
    '| 27 | SRW-13, ეტაპი 2b | ტრეკების ცოცხალი meter-ები header-ში, ტრეკის over-0 გაფრთხილება, layout-ის ცვლილების გარეშე (D-29r) |')
rep('| — | SRW-13 ეტაპი 2b–4 | ტრეკების meter-ები; FB-04 clip gain; FB-05 pan + fader-ის UX + round-9 M1/L8 |',
    '| — | SRW-13 ეტაპი 3–4 | FB-04 clip gain; FB-05 pan + fader-ის UX + round-9 M1/L8 + Master-ის hold tick |\n'
    '| — | R26-M1 | rAF-gap sampling-ის hardening (ან Tech Lead-ის მიღება), საბოლოო რეგრესიამდე |')

rep('- **Round 26: გაგზავნილია.** SRW-13, ეტაპი 2a: Master-ის ცოცხალი meter და Peak/Clip indicator; R26-X (D-29q). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
    '- **Round 26: C PASS** (`tmp/studio-real-loop/c-round-26.md`). R26-ML, MP, C0, C6, CR, CM, RB, X, E, K, L, R, S, U, Doc და G26-1..3 PASS-ია. vitest 1072/1072. Scope-ში ახალი ბაგი არ არის. R13-M4 მთლიანად დადასტურდა; FB-14 → მოწმდება.\n'
    '  - C-R23-01: 4 NUL (offset-ები გადაიწია, არა გამოსწორება).\n'
    '  - ახალი Low: R26-M1, DEMO-SFX-FULL-SCALE (Tech Lead), MASTER-HOLD-TICK-EDGE.\n'
    '- **Round 27: გაგზავნილია.** SRW-13, ეტაპი 2b: ტრეკების ცოცხალი meter-ები (D-29r). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.')

rep('  - SRW-13: ეტაპი 1 გაგზავნილია (Round 25), ეტაპები 2–4 `todo`;',
    '  - SRW-13: ეტაპები 1 და 2a C PASS (Round 25–26), ეტაპი 2b გაგზავნილია (Round 27), ეტაპები 3–4 `todo`;')

io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
