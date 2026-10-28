# AGREE-SABA-B-7 — კლიპის volume envelope dB სკალაზე (Saba-სთვის)

**მოამზადა:** B, round 233 → 234 დაგეგმვისას, 2026-10-28. **D-ID:** D-29z322.
**სტატუსი:** `awaiting_user`. ეს დავალება A-ს არ გადაეცა. ლუპი ამ დროს SABA-B-11a-ს აკეთებს (ის უკვე შეთანხმებულია), ამიტომ არაფერი ჩერდება.

## რატომ გეკითხები

შენი SABA-B-7 მოთხოვნა ამბობს: dispatch-მდე `ableton-arrangement-expert`-მა და `docs-explorer`-მა Live-ის **ზუსტი taper** უნდა დაადასტურონ manual-ის წყაროთი. ორივე consult-მა (round 232) იგივე შედეგი მოიტანა: **Live 12 manual-ში taper არ წერია.** ამიტომ envelope-ის vertical axis-ის მრუდი ჩემი (planner-ის) გადაწყვეტილება იქნებოდა. ეს კი ხმას ცვლის. L44-ის მიხედვით ასეთ განსხვავებას შენ წყვეტ, არა მე.

## Reference: რა არის დადასტურებული და რა არა

| # | ფაქტი | წყარო | სტატუსი |
|---|---|---|---|
| 1 | envelope-ის vertical axis არის „control value“, horizontal — დრო | [Live 12 manual 25.5](https://www.ableton.com/en/live-manual/12/automation-and-editing-envelopes/) | დადასტურებული (ერთეული არ წერია) |
| 2 | clip Gain envelope **relative** არის Clip Gain slider-ის მიმართ, მას არ აჭარბებს, ბოლოში — სიჩუმე | [27.2.3](https://www.ableton.com/en/live-manual/12/clip-envelopes/) | დადასტურებული |
| 3 | Clip Gain slider dB-შია დაკალიბრებული | [8.4.7](https://www.ableton.com/en/live-manual/12/clip-view/) | დადასტურებული (დიაპაზონი არ წერია) |
| 4 | Volume fader-ის taper (რომელ პოზიციაზეა −6/−12/−24 dB) | manual 18.1 | **ვერ ვიპოვე** (forum/LOM: პოზიცია 0..1, 0 dB ≈ 0.85, ფორმულა არ არის გამოქვეყნებული) |
| 5 | ორ წერტილს შორის interpolation რომელ სივრცეშია (პოზიცია / dB / gain) | 25.5.2 | **ვერ ვიპოვე** |
| 6 | clip-ის Volume modulation იგივე სკალაზე იხატება, რაც track Volume automation | — | **უცნობია** |

წყაროები: `b-round-232/saba-b-7-reference-docs-explorer.md`, `b-round-232/saba-b-7-reference-ableton-expert.md`.

## ახლა როგორ მუშაობს (ფაქტი, კოდში შემოწმებული `db5c297`-ზე)

- `envelope.ts` ინახავს linear gain-ს 0..1 (0 = −∞ dB).
- ხაზი ორ წერტილს შორის linear gain-შია (`clipEnvelopeGainAtSource` l.73–99), playback/export — `linearRampToValueAtTime` (`graph.client.ts` l.122–147).
- drag: პიქსელი → gain linear-ად (`ArrangementClipEnvelope.tsx` l.261–268), წერტილის სიმაღლე `(1 − gain)` (l.370).
- შედეგი: 0 dB-დან −∞-მდე სწორ ხაზზე დროის 25/50/75 %-ზე ისმის **−2.5 / −6.0 / −12.0 dB**. ხმა თითქმის ბოლომდე ხმამაღალია და მხოლოდ ბოლოს ქრება. ეს არის ის, რაც შენ გაიგონე.

## ვარიანტები

| | A. dB-linear, −60 dB floor (**რეკომენდაცია**) | B. power law, gain = p³ | ახლანდელი (linear gain) |
|---|---|---|---|
| 0 dB → −∞ ხაზი, დროის 25 / 50 / 75 %-ზე | −15 / −30 / −45 dB | −7.5 / −18.1 / −36.1 dB | −2.5 / −6.0 / −12.0 dB |
| ბოლო წერტილი | −∞ (−60 dB-ის ქვემოთ პირდაპირ სიჩუმე) | −∞, გლუვად | −∞ |
| CZABA-ში იგივე სკალა უკვე არის? | **დიახ:** lane-ის Volume fader უკვე dB-linear-ია −60..0, ბოლოში −∞ (`track-volume-db.ts`) | არა | არა |
| შენახული წერტილი gain 0.5 (−6 dB) ეკრანზე | 50 % → **~90 %** სიმაღლე | 50 % → **~79 %** | 50 % |
| შენახული gain-ები < 0.001 (−60 dB-ზე ჩუმი) | ეკრანზე ბოლოში ჩანს; მნიშვნელობა ინახება | ყველა ზუსტად ინახება | — |

**რატომ A:** ერთ Studio-ში ორი სხვადასხვა „dB fader“ არ უნდა გვქონდეს. Lane-ის Volume fader-ზე −30 dB შუაშია, და envelope-ზეც შუაში იქნება. B უფრო ჰგავს ანალოგურ fader-ის law-ს, მაგრამ CZABA-ს არცერთ სხვა control-ს არ ემთხვევა. Live-ის ზუსტ ფორმულას ვერცერთი ვერ დავადასტურეთ.

## შენახული პროექტები (შენი მოთხოვნის „BLOCKED with options“ ნაწილი)

- შენახული წერტილების **gain-ები არ იცვლება**: წერტილზე ხმა ზუსტად ისეთივეა, როგორც ადრე.
- **იცვლება ორ წერტილს შორის** ხმა: ახალი მრუდი dB-ში სწორია, ძველი gain-ში. მაგალითად, 0 dB → −∞ fade შუაში −6 dB-ის ნაცვლად A-ზე −30 dB იქნება.
- **იცვლება წერტილების სიმაღლე ეკრანზე** (იხ. ცხრილი): −6 dB-იანი წერტილი 50 %-დან ~90 %-ზე ავა.
- ალტერნატივა: ძველ პროექტებს „legacy linear“ დროშა, ახლებს — ახალი მრუდი. მე ამას **არ გირჩევ**: ორი ქცევა ერთ UI-ში დამაბნეველია, `/studio-lab`-ში შენახული პროექტები ჯერ არ არსებობს, ხოლო purchased Studio (SRW-21) ჯერ არ არის ჩართული.

## Scheduling (ჩემი ტექნიკური არჩევანი, ხმის ქცევას არ ცვლის)

მოკლე linear ramp-ები: სეგმენტი იყოფა ≤ 0.5 dB-იან ნაბიჯებად და ზუსტად წერტილის gain-ზე მთავრდება. `setValueCurveAtTime` არა (overlap-ზე `NotSupportedError`), exponential ramp 0-მდე არა. ორი ბოლო წერტილი ერთად = ციფრული სიჩუმე export-ში.

## YouTube (root-ის ძიება, `reference/youtube/SABA-B-7.md`)

ვირჩევ 4 ვიდეოს. გთხოვ, root-მა transcripts ჩაწეროს `reference/youtube/SABA-B-7-transcripts.md`-ში:

1. [Learn Live: Clip automation](https://www.youtube.com/watch?v=IdQYUk8w5jM) (Ableton, ოფიციალური): clip envelope-ის Volume lane, წერტილის drag ბოლომდე, რა ციფრი ჩანს წერტილზე.
2. [Envelope Automation — Arrangement View](https://www.youtube.com/watch?v=Ib_f2XGzZM4) (Ableton): Volume automation-ის ხაზი ორ წერტილს შორის; −∞-მდე fade-ის შუაში რა dB ჩანს hover-ზე.
3. [The Ultimate Guide to Clip Automation](https://www.youtube.com/watch?v=OkAXHx5Ajyk) (Sonic Bloom): clip Volume modulation vs track Volume — ერთ სკალაზეა თუ არა (ფაქტი #6).
4. [Basic Clip Envelopes](https://www.youtube.com/watch?v=FEzmmTb0fFA) (Noiselab): clip Gain envelope-ის relative ქცევა და ბოლოში სიჩუმე.

gain-staging-ის და Pro Tools-ის ვიდეოები (#5–#9, #15) არ ვარჩიე: envelope-ის მრუდს არ აჩვენებენ.

## კითხვები (ერთხელ პასუხი საკმარისია)

1. **Taper:** A (−60 dB floor, lane fader-ის იგივე სკალა), B (p³) თუ სხვა? **ნაგულისხმევი: A.**
2. **შენახული პროექტები:** მისაღებია, რომ წერტილებს შორის ხმა და წერტილების სიმაღლე შეიცვალოს (gain-ები რჩება)? **ნაგულისხმევი: დიახ, legacy დროშის გარეშე.**
3. **გაზომვა Live-ში (თუ გცალია, 2 წუთი):** Live 12-ში clip-ის Volume envelope-ზე ორი წერტილი: 0 dB და ბოლო (−∞). ხაზის 25 / 50 / 75 %-ზე hover-ით რა dB წერია? ასევე Mixer Volume fader-ის სიმაღლე 0 / −6 / −12 / −24 / −40 dB-ზე. თუ შენი ციფრები A-ს ან B-ს არ ემთხვევა, Live-ის მრუდს ავიღებთ.

პასუხის შემდეგ B დავალებას სრულად დაწერს (ფაილები, ტესტები, C-ის 25/50/75 % გაზომვა export-ში ±0.5 dB, ორი ბოლო წერტილის სიჩუმე, click-ის არარსებობა) და შემდეგ თავისუფალ რაუნდში გაუშვებს.
