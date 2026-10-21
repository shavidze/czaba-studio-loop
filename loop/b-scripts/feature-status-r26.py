p = 'C:/Apps/czaba-project/tmp/studio-real-loop/feature-status.md'
s = open(p, encoding='utf-8').read()


def rep(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, new)


start = s.index('განახლდა: 2026-10-11 · ავტორი: B (round 24 → round 25 დაგეგმვა)')
end = s.index('## 1. მომხმარებლის თავდაპირველი მოთხოვნები')
head_tail = s[start:end]
s = s[:start] + '''განახლდა: 2026-10-11 · ავტორი: B (round 25 → round 26 დაგეგმვა) · წესი: `docs/technical/studio-real-workspace/agent-workflow.md`

სტატუსები: **მზადაა** · **მუშავდება** · **მოწმდება** · **ბაგია** · **არ დაწყებულა** · **დაბლოკილია**.

ტერმინები:
- **„მზადაა“** — შედეგი C-ის დამოუკიდებელი მტკიცებულებით დადასტურდა. დაუტესტავი ან თავიდან გაუშვებელი ქცევა დასრულებულად არ ითვლება.
- **„მოწმდება“** — C-ის ყველა ID PASS-ია და რჩება მხოლოდ Tech Lead-ის ხელით შემოწმება.

ბმულები ეხება `tmp/studio-real-loop/`-ს.

**⚠ Tech Lead-ისთვის, პირველ რიგში — C-R23-01 გაუარესდა.** `/studio-lab`-ის SSR HTML-ში ახლა **8 NUL** byte-ია (იყო 4). სამი მათგანი hydration-მდე **ხილულ ქართულ ტექსტშია**: header-ის დემო badge, ბიბლიოთეკის ტექსტი და `Arrangement ·` სათაური. ეს ჩანს პირველ paint-ზე, JS-ის გარეშე და crawler-ებისთვის. Offset-ები markup-ის ყოველ ცვლილებაზე იძვრის. გამოსწორებას სჭირდება (a) React 19 ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (`b-round-23.md` §3). B ამ ნებართვას ვერ გასცემს. პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.

მიმდინარე რაუნდი: **Round 26** (`current-task.md`, D-29q) — SRW-13, ეტაპი 2a: Master-ის ცოცხალი meter და Master Peak/Clip indicator.
- **A:**
  - `meter.ts` (ახალი): peak, release, 1.5 წმ-იანი peak hold, latch. გადატვირთვის პრედიკატი export-ისაა (`x > MAX_24BIT_SAMPLE` ან `x < −1`), ამიტომ ცოცხალი indicator და export ერთნაირად ითვლის.
  - Graph: optional `tap`, master-ის შემდეგ (post-fader), fan-out. `master → destination` უცვლელია, export-ში tap არ არის. B-ის probe: required `createAnalyser` გაყინულ ტესტებში 28 tsc შეცდომას იძლევა, optional tap კი 0-ს (`b-round-25-probe.txt`).
  - Context: AnalyserNode (`getFloatTimeDomainData`, fftSize ≥ 4096), დაცული fake context-ებისთვის. კითხვა `tick`-შია, ცალკე store-ით და frame-ზე 0 render-ით. Stop-ზე meter იწერება floor-ზე.
  - UI `ArrangementMaster`-ში: meter-ის ზოლი და `Master Peak` ღილაკი. ღილაკი აჩვენებს მაქსიმალურ peak-ს dBFS-ში; გადატვირთვისას `+X.X`-ს და warning token-ს. Latch მხოლოდ click-ით სუფთავდება; reset edit არ არის.
  - **R26-X:** Master Mute-ის დროს export dialog gain note-ს აღარ აჩვენებს (C round 25 §5.4).
  - ტესტები: `meter.test.ts`, `meter-ui.test.tsx` (≥ 14 `it`), doc 032.
- **C:** R26-ML, MP, C0, C6, CR, CM, RB, X, E, K, L, R, S, U, Doc, G26-1..3 და C-R23-01-ის ჩანაწერი.

შემდეგ:
- C-R23-01 — Tech Lead-ის პასუხისთანავე, ახალ ფუნქციამდე;
- SRW-13 ეტაპი 2b (ტრეკების meter-ები, lane-ის geometry) → ეტაპი 3 (FB-04 clip gain) → ეტაპი 4 (FB-05 pan, fader-ის UX, round-9 M1/L8).

**Loop runner:** თუ `run-loop.ps1` `-RoundLimit`-ზე გაჩერდა, გადატვირთვა: `-StartRound 26 -StartPhase A`.

**Round 25-ის შედეგი** (C, `c-round-25.md`): **PASS**, scope-ში ახალი ბაგის გარეშე.
- PASS: R25-MV (Δ −6.000 dB ×3), R25-MM (≤ −60 dBFS click-იდან 14 ms-ში, monotone decay, ვიდეოს ხმაც ჩუმდება), R25-ML (ახალი graph 0, seam 0), R25-E0/EO/E6/EM (1800 FS, alert +5.0 dBFS, −5.0 dB-ზე FS 0, ratio 0.501187, mute-ზე ჩუმი ნამდვილი ფაილი), R25-H, R25-K, R25-L, R25-R, R25-S, R25-U, R25-Doc, G25-1..3 (vitest **1045/1045**, 50 OK, 54 ხაზი).
- B-მ დამოუკიდებლად შეამოწმა: 54 ხაზი = C-ის ბოლო მდგომარეობა, 50 OK, 11 owned sha ემთხვევა, live curl `/studio-lab` NUL **8**.
- დაკვირვებები: export bit-deterministic არ არის (±1 LSB) → byte-იდენტურობა oracle-ად აღარ გამოიყენება; mute + gain note → R26-X; fader-ის 4 px box → ეტაპი 4.

''' + s[end:]

rep('| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **მუშავდება** (Round 25: Master + export-ის გადატვირთვის გაფრთხილება) | — | Round 25 → C. ცოცხალი გადატვირთვის indicator და meter-ები: SRW-13 ეტაპი 2 |',
    '| FB-14 | Master Volume/Mute, გადატვირთვის ჩვენება | **მუშავდება** (ეტაპი 1 — Master Volume/Mute და export-ის გადატვირთვის გაფრთხილება — C-ით დადასტურებულია; ცოცხალი meter და Clip indicator — Round 26) | ეტაპი 1: `c-round-25.md` §3–§8 (R25-MV/MM/ML/E0/EO/E6/EM/H/K/L) | Round 26 → C (R26-ML/MP/C0/C6/CR/CM). Tech Lead: R25-T, R26-T |')

rep('| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე) |',
    '| SRW-01 | ბირთვი, scheduler, WAV export, ანონიმური `/studio-lab` | **ბაგია** (ფუნქციები C-ით დადასტურებულია; ღიაა C-R23-01, Medium — SSR NUL byte-ები `/studio-lab`-ზე, round 25-ში 8, მათ შორის ხილულ ტექსტში) |')

rep('| SRW-13 | Clip gain, pan, master, meters | **მუშავდება** (ეტაპი 1 — Round 25) | — | ეტაპი 1: Master Volume/Mute + export-ის გადატვირთვის გაფრთხილება (R13-M3, R13-M4 export). ეტაპი 2: meter-ები + Master-ის clip indicator (R13-M4 meter). ეტაპი 3: FB-04 clip gain (R13-M1). ეტაპი 4: FB-05 pan (R13-M2), fader-ის click-ის UX შენიშვნა, round-9 M1/L8 |',
    '| SRW-13 | Clip gain, pan, master, meters | **მუშავდება** (ეტაპი 1 მზადაა — C round 25 PASS; ეტაპი 2a — Round 26) | ეტაპი 1: `c-round-25.md` (R13-M3 PASS; R13-M4-ის export ნაწილი PASS, R25-EO) | ეტაპი 2a: Master-ის meter + latch-იანი Peak/Clip (R13-M4 meter). ეტაპი 2b: ტრეკების meter-ები. ეტაპი 3: FB-04 clip gain (R13-M1). ეტაპი 4: FB-05 pan (R13-M2), fader-ის UX (click, 4 px box), round-9 M1/L8 |')

rep('| **C-R23-01** | Medium | **ბაგია** (ახალი; B-მა დამოუკიდებლად გაიმეორა) | `c-round-23.md` §3; `c-round-23/runs/ssr-1..3.html` |',
    '| **C-R23-01** | Medium | **ბაგია — გაუარესდა** (round 25: 8 NUL, 3 ხილულ SSR ტექსტში; B live curl: 8) | `c-round-23.md` §3; `c-round-25.md` §12; `c-round-25/runs/c-r23-01-record.txt` |')

rep('**Round 24:** ბაგი არ დახურულა და ახალი არ არის. C-R23-01 უცვლელია (4 NUL, იგივე offset-ები).',
    '**Round 25:** ბაგი არ დახურულა და scope-ში ახალი არ არის. C-R23-01 გაუარესდა: 4 → 8 NUL (3536/3537, 11728/11729, 26924/26925, 43308/43309), სამი ხილულ ტექსტში hydration-მდე.\n\n**Round 24:** ბაგი არ დახურულა და ახალი არ არის. C-R23-01 უცვლელია (4 NUL, იგივე offset-ები).')

rep('| **R25-T** | Master-ის fader რეალური მაუსით; Master Mute/unmute-ზე click არ ისმის (ყურსასმენი) | synthetic pointer; headless-ში მოსმენა შეუძლებელია |',
    '| **R25-T** | Master-ის fader რეალური მაუსით; Master Mute/unmute-ზე click არ ისმის (ყურსასმენი) | synthetic pointer; headless-ში მოსმენა შეუძლებელია |\n| **R26-T** | Master-ის meter და Clip indicator რეალურ Chrome-ში, დინამიკებით, `lay11`-ზე (0 dB-ზე 4–6 წმ-ში ინთება, −6 dB-ზე არა); meter-ის მოძრაობა იკითხება | headless-ში მოსმენა და ვიზუალური მოძრაობის შეფასება შეუძლებელია |')

rep('- export-ის hard-clip 0 dBFS-ზე (R13-M4): Round 25 მას მომხმარებლისთვის ხილულს ხდის (გაფრთხილება + Master-ის შემცირება). Clamp რჩება, limiter ფარგლებს გარეთაა;',
    '- export-ის hard-clip 0 dBFS-ზე (R13-M4): Round 25-იდან ხილულია (R25-EO: გაფრთხილება + Master-ის შემცირება), Round 26 ცოცხალ Clip indicator-საც ამატებს. Clamp რჩება, limiter ფარგლებს გარეთაა;')

rep('- round 6–24-ის დაუკომიტებელი tree;',
    '- round 6–25-ის დაუკომიტებელი tree (54 ხაზი);')

open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
