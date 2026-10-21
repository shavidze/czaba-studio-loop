import io

p = 'feature-status.md'
s = io.open(p, encoding='utf-8').read()


def rep(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)


def rep_block(start_marker, end_marker, new):
    global s
    a = s.index(start_marker)
    b = s.index(end_marker, a)
    s = s[:a] + new + s[b:]


rep('განახლდა: 2026-10-11 · ავტორი: B (round 25 → round 26 დაგეგმვა)',
    'განახლდა: 2026-10-11 · ავტორი: B (round 26 → round 27 დაგეგმვა)')

rep_block('**⚠ Tech Lead-ისთვის, პირველ რიგში', '## 1. მომხმარებლის თავდაპირველი მოთხოვნები', '''**⚠ Tech Lead-ისთვის, პირველ რიგში — C-R23-01 ისევ ღიაა.** `/studio-lab`-ის SSR HTML-ში ახლა **4 NUL** byte-ია: 28013/28014 (ხილული ტექსტი `Arrangement · `) და 44397/44398 (music ხაზის `aria-label`). Round 25-ში 8 იყო. Header-ის badge და ბიბლიოთეკის ტექსტი სუფთაა მხოლოდ იმიტომ, რომ offset-ები **ისევ გადაიწია** — ეს გამოსწორება არ არის. გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). B ამ ნებართვას ვერ გასცემს. პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.

**Tech Lead-ის დამატებითი გადაწყვეტილება (Low, არ ბლოკავს):** დემო SFX `Soft impact` თავისთავად full scale-ს აღწევს, ამიტომ Master Peak `+0.0` Clip-ს აჩვენებს და export 2 sample-ს ზღუდავს. (a) `lib/sfx-*`/demo-synth-ის ვიწრო grant დემოს პიკების ≤ `MAX_24BIT_SAMPLE`-მდე ნორმალიზებისთვის, ან (b) მიღება. პრედიკატი არ იცვლება.

მიმდინარე რაუნდი: **Round 27** (`current-task.md`, D-29r) — SRW-13, ეტაპი 2b: ცოცხალი meter ყოველი ტრეკის header-ში.
- **A:**
  - Graph: optional `trackTaps`. Tap panner-ის შემდეგაა (ტრეკის output, T12.20) და `panner.connect(master)`-ის შემდეგ ერთდება, ასე რომ `outputs[0]` master რჩება. Export-ში tap არ არის.
  - Context: ყოველ ტრეკს საკუთარი stereo tap აქვს (splitter + 2 analyser, fftSize 4096, დაცული). Taps master-ის tap-ის შემდეგ იქმნება. Store ცალკეა, frame-ზე ერთი publish-ით. Stop-ზე ყველა meter floor-ზე იწერება.
  - Latch: ტრეკის over-0 გაფრთხილება (T12.22) იყენებს warning token-ს, ფორმის ცვლილებას და sr-only ტექსტს. იგი Master Peak-ის ერთი reset-ით სუფთავდება, ამიტომ ახალი Tab stop არ ემატება და reset edit არ არის.
  - UI: `ArrangementTrackMeter` (ახალი) header-ის ქვედა padding-ში absolute-ად დგას. Layout არ იცვლება და frame-ზე 0 render-ია.
  - ტესტები: `track-meter.test.ts`, `track-meter-ui.test.tsx` (≥ 16 `it`, unmount-ის M2c-ის ჩათვლით). `meter-ui.test.tsx`-ში იცვლება მხოლოდ 5 ზუსტი რაოდენობის ხაზი (B-ის probe). Doc 033.
- **C:** R27-TL/TI/TM/TV/TW/TO/TR/TF, RB, E, K, L, R, S, U, Doc, G27-1..3 და C-R23-01-ის ჩანაწერი.

შემდეგ:
- C-R23-01 — Tech Lead-ის პასუხისთანავე, ახალ ფუნქციამდე;
- SRW-13 ეტაპი 3 (FB-04 clip gain) → ეტაპი 4 (FB-05 pan, fader-ის UX, round-9 M1/L8, Master-ის hold tick).

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 27 -StartPhase A`.

**Round 26-ის შედეგი** (C, `c-round-26.md`): **PASS**, scope-ში ახალი ბაგის გარეშე.
- PASS:
  - R26-ML: meter vs tap −0.042…+0.029 dB, Δ −6.0 ×3;
  - R26-MP: hold 1500–1513 ms;
  - R26-C0: latch ~2.0 წმ-ზე, `+5.0` vs tap +4.995, 3/3;
  - R26-C6: `−1.0`, clear, 3/3;
  - R26-CR: reset edit არ არის;
  - R26-CM: floor 2.36–2.57 წმ;
  - R26-RB: frame-ზე 0 render, drift 20.1 ms;
  - R26-X;
  - R26-E: FS 1800, RMS −15.481;
  - R26-K, R26-L, R26-R, R26-S;
  - R26-U: mutation-ები a–d;
  - R26-Doc;
  - G26-1..3: vitest **1072/1072**, 57 OK, 58 ხაზი.
- B-მ დამოუკიდებლად შეამოწმა: 58 ხაზი = C-ის ბოლო მდგომარეობა, 57 OK, 8 owned sha ემთხვევა, live curl `/studio-lab` NUL **4** იმავე offset-ებზე.
- დაკვირვებები და B-ის გადაწყვეტილებები:
  - R26-T-ის ტექსტი გასწორდა;
  - time-to-floor oracle = (L0+60)/20 წმ + 0.1 წმ;
  - `Soft impact` → Tech Lead;
  - Master-ის hold tick (1 px ≥ +6 dBFS-ზე) → ეტაპი 4;
  - A-ს M1 → R26-M1 (Low, ეტაპი 4-ის შემდეგ);
  - M2c → round 27-ის ტესტები.

''')

rep('| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **მუშავდება** (ეტაპი 1 — Master Volume/Mute და export-ის გადატვირთვის გაფრთხილება — C-ით დადასტურებულია; ცოცხალი meter და Clip indicator — Round 26) | ეტაპი 1: `c-round-25.md` §3–§8 (R25-MV/MM/ML/E0/EO/E6/EM/H/K/L) | Round 26 → C (R26-ML/MP/C0/C6/CR/CM). Tech Lead: R25-T, R26-T |',
    '| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **მოწმდება** (C-ის ყველა ID PASS-ია: Master Volume/Mute, export-ის გადატვირთვის გაფრთხილება, ცოცხალი meter და latch-იანი Clip; დარჩა მხოლოდ Tech Lead-ის R25-T/R26-T) | ეტაპი 1: `c-round-25.md` §3–§8 (R25-MV/MM/ML/E0/EO/E6/EM/H/K/L); ეტაპი 2a: `c-round-26.md` §3–§12 (R26-ML/MP/C0/C6/CR/CM/RB/X/E) | Tech Lead: R25-T, R26-T. ტრეკების meter-ები (SRW-13 ეტაპი 2b) ცალკეა |')

rep('| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე, round 25-ში 8, მათ შორის ხილულ ტექსტში)',
    '| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე, round 26-ში 4, ერთი ხილულ ტექსტში)')

rep('| SRW-13 | Clip gain, pan, master, meters | **მუშავდება** (ეტაპი 1 მზადაა — C round 25 PASS; ეტაპი 2a — Round 26) | ეტაპი 1: `c-round-25.md` (R13-M3 PASS; R13-M4-ის export ნაწილი PASS, R25-EO) | ეტაპი 2a: Master-ის meter + latch-იანი Peak/Clip (R13-M4 meter). ეტაპი 2b: ტრეკების meter-ები. ეტაპი 3: FB-04 clip gain (R13-M1). ეტაპი 4: FB-05 pan (R13-M2), fader-ის UX (click, 4 px box), round-9 M1/L8 |',
    '| SRW-13 | Clip gain, pan, master, meters | **მუშავდება** (ეტაპი 1 და 2a მზადაა — C round 25/26 PASS; R13-M3, R13-M4 PASS; ეტაპი 2b — Round 27) | ეტაპი 1: `c-round-25.md`; ეტაპი 2a: `c-round-26.md` (R26-C0/C6/CR/CM) | ეტაპი 2b: ტრეკების meter-ები (Round 27). ეტაპი 3: FB-04 clip gain (R13-M1). ეტაპი 4: FB-05 pan (R13-M2), fader-ის UX (click, 4 px box), round-9 M1/L8, Master-ის hold tick |')

rep('| **C-R23-01** | Medium | **ბაგია — გაუარესდა** (round 25: 8 NUL, 3 ხილულ SSR ტექსტში; B live curl: 8) | `c-round-23.md` §3; `c-round-25.md` §12; `c-round-25/runs/c-r23-01-record.txt` |',
    '| **C-R23-01** | Medium | **ბაგია** (round 26: 4 NUL, ერთი ხილულ SSR ტექსტში; offset-ები ისევ გადაიწია, ეს გამოსწორება არ არის; B live curl: 4) | `c-round-23.md` §3; `c-round-25.md` §12; `c-round-26.md` §16; `c-round-26/runs/c-r23-01-record.txt` |')

rep('| LIB-SEP-REASON | Low |',
    '| R26-M1 | Low | **არ დაწყებულა** | `a-round-26.md` §4 (M1); `c-round-26.md` §17.5 | rAF-ზე მიბმული sampling-ი > 85 ms stall-ზე ან დამალულ tab-ში over-ს შეიძლება გამოტოვებს (C: max gap 28.8 ms). AudioWorklet module URL-ს საჭიროებს, `public/**` კი აკრძალულია → hardening SRW-13 ეტაპი 4-ის შემდეგ, ან Tech Lead-ის მიღება |\n'
    '| DEMO-SFX-FULL-SCALE | Low | **დაბლოკილია** (Tech Lead-ის გადაწყვეტილება) | `c-round-26.md` §17.3 | `Soft impact` თავისთავად full scale-ს აღწევს (`+0.0` Clip, export 2 sample). (a) `lib/sfx-*`-ის grant ნორმალიზებისთვის ან (b) მიღება. პრედიკატი უცვლელია |\n'
    '| MASTER-HOLD-TICK-EDGE | Low | **არ დაწყებულა** | `c-round-26.md` §9 | Master-ის hold tick ≥ +6 dBFS-ზე 1 px ჩანს → SRW-13 ეტაპი 4 |\n'
    '| LIB-SEP-REASON | Low |')

rep('**Round 25:** ბაგი არ დახურულა და scope-ში ახალი არ არის.',
    '**Round 26:** ბაგი არ დახურულა და scope-ში ახალი არ არის. C-R23-01: 8 → 4 NUL (28013/28014, 44397/44398) — offset-ების გადაწევა, არა გამოსწორება. ახალი Low ჩანაწერები: R26-M1, DEMO-SFX-FULL-SCALE, MASTER-HOLD-TICK-EDGE.\n\n**Round 25:** ბაგი არ დახურულა და scope-ში ახალი არ არის.')

rep('| **R26-T** | Master-ის meter და Clip indicator რეალურ Chrome-ში, დინამიკებით, `lay11`-ზე (0 dB-ზე 4–6 წმ-ში ინთება, −6 dB-ზე არა); meter-ის მოძრაობა იკითხება | headless-ში მოსმენა და ვიზუალური მოძრაობის შეფასება შეუძლებელია |',
    '| **R26-T** | Master-ის meter და Clip indicator რეალურ Chrome-ში, დინამიკებით, `lay11`-ზე: 0 dB-ზე Clip **~2.0 წმ-ზე** ინთება (stems-ის შემოსვლა), `+5.0` მაქსიმუმი ~4.0 წმ-ზეა; −6 dB-ზე არ ინთება; meter-ის მოძრაობა იკითხება (ტექსტი გასწორდა C round 26 §17.1-ით) | headless-ში მოსმენა და ვიზუალური მოძრაობის შეფასება შეუძლებელია |\n'
    '| **R27-T** | ტრეკების meter-ები რეალურ Chrome-ში: იკითხება ყველა სიმჭიდროვეზე (folded/tight/regular/full); ტრეკის over (warning) Master-ის Clip-ისგან (destructive) განირჩევა; hover `title` Peak-ს აჩვენებს | headless-ში ვიზუალური მოძრაობის შეფასება შეუძლებელია |')

rep('- export-ის hard-clip 0 dBFS-ზე (R13-M4): Round 25-იდან ხილულია (R25-EO: გაფრთხილება + Master-ის შემცირება), Round 26 ცოცხალ Clip indicator-საც ამატებს. Clamp რჩება, limiter ფარგლებს გარეთაა;',
    '- export-ის hard-clip 0 dBFS-ზე (R13-M4, PASS): Round 25-იდან ხილულია export-ში (R25-EO), Round 26-იდან ცოცხლადაც (R26-C0, Clip `+5.0`). Clamp რჩება, limiter ფარგლებს გარეთაა;')

rep('- round 6–25-ის დაუკომიტებელი tree (54 ხაზი);',
    '- round 6–26-ის დაუკომიტებელი tree (58 ხაზი);')

io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
