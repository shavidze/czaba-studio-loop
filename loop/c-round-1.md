# C — Round 1 ვერიფიკაცია (SRW-01)

თარიღი: 2026-10-07 · ვერიფიკატორი: C · ობიექტი: A-ს round 1 (`a-round-1.md`)
**შედეგი: PASS** — SRW-01-ის 24/24 acceptance დამოუკიდებლად დადასტურდა. Critical/High ბაგი არ არის; 4 Low ბაგი B-ს გადაეცემა.
App source-ს არ შევხებივარ. commit/push/deploy არ გამიკეთებია. ბრაუზერის side effect-ები შემოიფარგლა `/studio-lab`-ის დემო state-ით და ჩემი gstack daemon-ით (`c-browse.json`).

## 0. მეთოდი

- **Gates:** ყველა ბრძანება თავიდან გავუშვი. A-ს ციფრებს არ დავეყრდენი.
- **ბრაუზერი:** gstack `/browse`, საკუთარი daemon. ახალი context-ი: cookies `[]`, `auth_user` არ არის.
- **Harness:** `c-round-1/scripts/setup.js` page-ში ჩაიტვირთა Play-მდე, ანუ ცოცხალი `AudioContext`-ის შექმნამდე. მისი შემადგენლობა:
  - `AudioBufferSourceNode.start/stop` counter-ები და თითო node-ის ჩანაწერი (`when / offset / duration / stopWhen / ended`).
  - **AudioWorklet tap**: master→destination კავშირის პარალელურად რეალური output-ის RMS/peak იწერება ყოველ 128-frame ბლოკზე (2.67 ms), `currentFrame`-ის დროით.
  - `URL.createObjectURL` და anchor `click` intercept.
  - საკუთარი 24-bit PCM parser. WAV-ის დეკოდირებას `decodeAudioData`-ზე არ ვეყრდნობი.
- **Oracle-ები:**
  - E5: `demo-synth`-ის ფორმულა, ჩემს script-ში ხელახლა დათვლილი.
  - E2: `/middle-east.mp3`-ის ცალკე `decodeAudioData` 48 kHz-ზე.
  - B4/B5: render-ების ერთმანეთთან შედარება სხვადასხვა arrangement-ზე. ერთი და იგივე graph-ის ორჯერ render-ი არ ითვლება.
- **შეზღუდვები:**
  - Drag-ები synthetic `PointerEvent`-ებითაა: gstack-ის CDP allowlist-ში `Input.*` არ არის.
  - Space, Delete, Enter, Ctrl+Z/Y და Escape ნაწილობრივ რეალური `press`-ით შემოწმდა.
  - „ხმა“ ნიშნავს master bus-ზე გაზომილ სიგნალს და არა მოსმენას (headless).

## 1. Gates (ხელახლა გაშვებული, output `c-round-1/`)

| ID | ბრძანება | შედეგი |
| --- | --- | --- |
| R1-U1..U3 | `npx vitest run app/lib/arrangement --reporter=verbose` | 53/53 ✓ (`vitest-arrangement.txt`). ყველა მოთხოვნილი სახელიანი შემთხვევა არსებობს: deleteTime-ის 6 შემთხვევა video-ს ჩათვლით, remapTime, projectEnd >60, solo exclusive/additive, undo/redo exact, no-op, redo cleared, schedule from-mid/before/ended/until/muted/video, graph `startAt+(when−from)`, ჯაჭვი clip→track→pan→master→dest, gain 0, setTrackGain, stop→0 |
| R1-U3 grep | `applySchedule(` | `graph.client.ts:166` (offline) და `ArrangementContext.tsx:256` (live) — ერთი ფუნქცია |
| R1-G1 | tsc / vitest / build / biome | `TSC_EXIT=0`; `36 files, 517 passed`; `✓ built in 2.10s`; biome owned: `Checked 21 files … No fixes applied`, exit 0; `./app`: 0 errors, 218 warnings |
| Code rules | grep `//`, `/*`, ` as `, `any`, `@ts-ignore`, hex ფერები (non-test owned) | 0 დამთხვევა; impl doc `010-…md` (88 ხაზი) template-ის ყველა სექციას შეიცავს |
| R1-S1 | sha256 + `git status` | 4× OK (ბოლოს ხელახლაც). status = SRW-01-ის ფაილები + წინასწარ არსებული 4 M + `.agents/ .codex/ AGENTS.md .claude/agents/ableton-arrangement-expert.md` (`git-status-final.txt`) |

## 2. R1-S2 და premium auth

- **Media:** ახალი anonymous load → 200. მოთხოვნები მხოლოდ `/middle-east.mp3`-სა და `/videos/hero/hero-music.mp3`-ზეა.
- **აკრძალული მისამართები:** `studio-token|recording|/api/download|r2|cloudflarestorage|worker` = 0 (`network-fresh.txt`).
- **სხვა მოთხოვნები:** fonts, GA, და root `CartProvider`-ის `GET localhost:5199/api/cart`. ეს უკანასკნელი workspace-ის კოდი არ არის; backend გამორთულია (connection refused).
- **Authorization header:** gstack-ის network header-ებს არ აჩვენებს. ამიტომ იგივე Vite module-დან ავიღე რეალური `apiClient` და `getCart` გამოვიძახე `fetch` intercept-ით. შედეგი: headers = `{Content-Type, X-Session-Id}`, **Authorization არ არის**, `auth_user = null` (`scripts/s_hdr.js`). დემო media `credentials:'omit'`-ით იტვირთება, header-ების გარეშე.
- **Auth bypass არ ხდება:**
  - `GET /api/studio-token?product=middle-east&file=drums.wav` → **401** „Please sign in“.
  - ყალბი Bearer → 500, token არ გაიცა.
  - `/studio/middle-east` anonymous → „Sign in required“; stem, token და R2 მოთხოვნები არ არის.

## 3. Central flow (ბრაუზერი, 1440×900, თუ სხვა არ წერია)

| ID | რა გავაკეთე | გაზომილი | შედეგი |
| --- | --- | --- | --- |
| B1 | SFX lane click @0 → რეალური click „Soft impact“ → რეალური Enter | კლიპი SFX-ზე 0.000–2.000; status „დაემატა SFX ხაზზე 00:00.000-ზე“; peaks path 80 სვეტი; რეალური Ctrl+Z → 0 კლიპი, Undo disabled; Ctrl+Shift+Z → იგივე id | PASS |
| B2 | header drag +80 px; body drag 30 px | start 2.000, offset 0, Undo „კლიპის გადატანა“; body drag → range 2.513–3.263, კლიპი არ გადაადგილდა | PASS |
| B3 | ME@5 right trim −91.352 → 5–15; left trim +3 | start 8, dur 7, offset 3. **Peaks:** 280 სვეტი, აცდენილ ფანჯარაში max diff 0; „სრიალის“ შემთხვევაში 0.424 იქნებოდა. Blocked: hero-ს მარჯვენა კიდე +5 წმ → drag-ის დროს „Trim შეჩერდა: წყაროს დასასრული…“, ხელის აშვებისას „ისტორია არ შეიცვალა“; Undo-ს label და project end უცვლელია | PASS |
| B4 | hero@20, playhead 30, Ctrl+E, export-ების შედარება; Undo; range 24.025–26.025 + Split | 20–30 / 30–170.37, მარჯვენა offset 10. **Export 25–35 წმ split-მდე და მის შემდეგ: max diff 0** (უწყვეტია). Undo → 1 კლიპი. Range split → 3 ნაწილი, შუა არჩეულია (offset 4.025) | PASS |
| B5 | music 8–15 (off 3), hero 20, impact 4; range 9–11; **რეალური Delete** | music → 8–9 + 9–13 (off 6); hero 20→18; impact უცვლელია; playhead 30→28; ღილაკზე „⌫ დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე“. **Export-ის sample-ები:** hero 20+k ≡ 18+k, music 11+k ≡ 9+k, 8–9 და impact ≡ — max diff **0**; 13–18 = ზუსტი ნულები. ერთი Undo → deep-equal | PASS |
| B6 | impact-ის არჩევა range-ის გარეშე + Delete | იშლება მხოლოდ impact, სხვები ადგილზე რჩება, „სიცარიელე დარჩა“; Undo ზუსტია | PASS |
| B7 | impact header drag → 73–75 | end 01:15.000; ruler 4200 px = (75+30)×40; ბოლო label 1:44; scroll 3272 px (`b7-scrolled-end-1440.png`) | PASS |
| B8 | impact@5, music muted, Play @0, ~1.9 წმ-ზე header drag +2 | დაკვრა გრძელდება; 3 source ხელახლა დაიგეგმა. **Output-ზე onset timeline 7-ზეა, −2.0 ms** (ბლოკის სიზუსტით); ძველ 5–5.5 ფანჯარაში −240 dB. Pause → 0 ცოცხალი source, output ჩუმია. Ruler click 20 წმ-ზე გაჩერებულ მდგომარეობაში → pos 20.000, playing=false, 0 ახალი source | PASS |
| B9 | დაკვრისას: S სტემები → S SFX → Ctrl+click S მუსიკა → M მუსიკა | aria: ექსკლუზიური (სტემები გაითიშა), additive (მუსიკა+SFX), mute solo-ზე მაღლა დგას. **RMS:** ყველა −25.7; solo სტემები −33.7; solo SFX −73 (impact დამთავრებულია); additive −24.6; muted+solo −116. ახალი source-ები **0**; pos +1.931 / ctx +1.949 | PASS |
| B10 | add / move / trim / split / range split / Delete Time / Mute → Undo/Redo | ყოველი Undo snapshot-ის deep-equal-ია; label-ები („Trim — მარცხენა კიდე“, „დროის წაშლა“, „Mute — მუსიკა“…) ჩანს; Ctrl+Shift+Z და Ctrl+Y მუშაობს. **Text input-ში** რეალური Space/Ctrl+Z/Delete/Ctrl+E/Enter → workspace-ზე ეფექტი 0 | PASS |
| B11 | music muted → რეალური Space → unmute → mute → volume 0.5/0.2/0.9/0.7 → unmute | muted ფანჯარა **−240 dB**; unmute-იდან **პირველი ხმოვანი ბლოკი ≤2.7 ms-ში** (კრიტერიუმი 100 ms); unmuted −23.2; muted + fader −112.6 dB (P4 ✓); unmute vol 0.7 → −25.8 (≈ −3 dB, სწორია). Source: created 1, stops 0 — restart არ ყოფილა. **Space ×10:** 10 რეალური press (~1.9 წმ) → 10 ახალი node = 5 play × 2 კლიპი, ბოლოს 2 ცოცხალი = 2 კლიპი; 10 synthetic, 8 ms-იანი ინტერვალით → 5 node, 1 ცოცხალი, Pause-ის შემდეგ 0. გაორმაგება არ არის | PASS |
| B12 | ME 0–101 (muted), rise@11, impact@12, range 4–6, Play@7, Delete ~7.94-ზე | pos **7.939 → 5.979**, დაკვრა გრძელდება. Handoff-ზე music source **0 sample**-ით უწყვეტია (7+1.008 = 8.008); ძველი stop = ახალი start; ჩუმი ბლოკი 0/187. Impact-ის onset playhead 10-ის მიმართ −22 ms (≈1 rAF-ის display lag; scheduler-ში `when` ზუსტად timeline 10-ია). Undo → კლიპები აღდგა (იხ. C-R1-03). Redo + export: impact onset **10.000**, rise 9.0003, სიგრძე 99.352 = projectEnd | PASS |
| S3 (Ableton) | Play @10, დაკვრისას body drag 35–37 | range შეიქმნა, playhead თანაბრად მიიწევს (+0.541 / 0.6 წმ), ნახტომი არ არის | ✓ (Ableton §S3) |

## 4. Export

| ID | მდგომარეობა | შედეგი |
| --- | --- | --- |
| E1 | impact@2 SFX, music 5–15 | `RIFF/WAVE`, PCM, 2 ch, 48000, **24-bit**, 720000 frame = **15.000 წმ = projectEnd**; impact 2–4 −16.45 dBFS; **4–5 = ზუსტი 0**; music 5–15 −22.5; ფაილი `czaba-studio-lab.wav`, `audio/wav`, blob+anchor. ⚠ კრიტერიუმის ფორმულირება: „3–5 < −80“ ეწინააღმდეგება 2 წმ-იან impact-ს @2 (3–4 = −41 dB, დიზაინით დაგეგმილი decay-ის კუდი) — B-მ უნდა გაასწოროს 4–5-ზე |
| E2 | impact +2 → 4; music left-trim off 3 @8 | impact-ის onset **4.000**; 3–4 = 0. **Music export[8+k] vs ცალკე დეკოდირებული src[3+k], 6 წმ, L/R max diff 5.96e-8**; src[0]-თან შედარებისას 0.709 იქნებოდა |
| E3 | SFX muted | music-only ფანჯარა 0–2.9 წმ bit-identical-ია (diff 0); (unmuted − muted) ≡ impact-ის ფორმულა, ±1 LSB (1.19e-7) — impact ზუსტად მოიხსნა |
| E4 | ცარიელი პროექტი | WAV ღილაკი `disabled`, შენიშვნა „ექსპორტი გამორთულია: პროექტი ცარიელია…“; MP3 / მონაკვეთი / ვიდეო disabled, ტექსტით „ამ ეტაპზე ხელმისაწვდომი არ არის“; click → 0 blob (`e4-empty-export-1440.png`) |
| E5 | impact start 3.0, offset 0.25 (header drag + left trim), Solo SFX | `max|out[144000+k] − f(12000+k)|`, k<24000: L/R **5.96e-8** ≤ 2⁻²² (2.38e-7); 0–3 წმ არანულოვანი sample **0**; 4.75 წმ-ის შემდეგ 0. Oracle განმასხვავებელია: offset-ის უგულებელყოფისას diff = 1.31 |

## 5. R1-V1

`v1-1440x900.png`, `v1-1280x720.png` (cookie declined; კლიპები 3 ხაზზე, ME არჩეულია + range 7–10, playhead 12.5).

- **ხილვადობა:** transport, library, 1 video + 3 audio lane, Export და footer viewport-შია. ღილაკები ერთმანეთს არ ფარავს.
- **ვიზუალური გარჩევა:** არჩეული კლიპი = teal ring/header; range = ნაცრისფერი შევსება + ტეგი; playhead = amber ხაზი. სამივე ერთმანეთისგან აშკარად გამოირჩევა.
- **Video lane:** პირდაპირ წერს „ვიდეოს დამატება შემდეგ ეტაპზე ჩაირთვება“.
- **Footer:** 1280-ზე ორ რიგად გადადის.
- **შენიშვნები:** 1440-ზე status იჭრება (C-R1-04); გვერდი 90 px-ით scroll-დება (C-R1-02).

## 6. ბაგები B-სთვის (ყველა Low)

1. **C-R1-01 — Play/Pause-ის lookahead playhead-ს უკან სწევს.**
   - `livePosition = from + (ctx − startAt)`, სადაც `startAt = now + 50 ms`. ამიტომ Play-ს ყოველ დაწყებაზე playhead ~42–50 ms-ით უკან იხევს (7.000→6.958).
   - თუ Pause startAt-მდე მოხდა, შენახული პოზიცია `from`-ზე ნაკლებია. სწრაფი Play/Pause ×5 (8 ms) → 20.000 → **19.819**.
   - Fix-ის მიმართულება: startAt-მდე პოზიცია `from`-ზე clamp-დეს.
2. **C-R1-02 — root layout-ის `body { padding-bottom: 90px }`.**
   - `/studio-lab` 990/900 px-ია; გვერდი 90 px-ით scroll-დება და header/transport ეკრანიდან გადის.
   - Owner: root (A-სთვის აკრძალულია). B-მ უნდა გადაწყვიტოს, ვის გადაეცეს.
3. **C-R1-03 — Delete Time-ის Undo დაკვრისას playhead-ს არ ასწორებს (A L10).**
   - Music source ~2 წმ-ით უკან ხტება, უკვე მოსმენილი impact კი ხელახლა ჟღერს.
   - ხმა აღდგენილ timeline-ს შეესაბამება, ამიტომ SRW-01-ის დარღვევა არ არის. საჭიროა **პროდუქტის გადაწყვეტილება** (Ableton-ის მსგავსად დარჩეს, თუ inverse remap გაკეთდეს).
4. **C-R1-04 — 1440-ზე footer-ის status ~17 სიმბოლომდე იჭრება**, როცა range და კლიპის დეტალები ჩანს. ამ ერთადერთ ხაზშია blocked move/trim-ის და Delete Time-ის feedback.

## 7. FB-ები და პროდუქტის flow

- **FB-01:** დინამიკური ხანგრძლივობა დადასტურდა (B7, 60 წმ-იანი ზღვარი არ არის).
- **FB-02:** მხოლოდ Delete Time ნაწილი დადასტურდა (B5/B12). Cut/Cut Time = SRW-09, **არ ჩაითვალა**.
- **FB-03..16:** round 1-ის scope-ს გარეთაა, PASS-ად არ ჩაითვალა.
- **Flow „find sound → add → fit video → export“ ნაწილობრივია:**
  - find: 4 წყაროს ბრტყელი სია, ძიებისა და preview-ის გარეშე (SRW-12);
  - add: მუშაობს;
  - fit video: არ არის (SRW-02/03), გულწრფელად აწერია;
  - export: რეალური 24-bit WAV, ზუსტი sample-ებით.
- **D-09** (Delete მონიშვნით = Delete Time) Ableton-ის ნაგულისხმევ Delete-ს არ ემთხვევა, მაგრამ ეს მომხმარებელთან შეთანხმებული გადაწყვეტილებაა და სწორად არის რეალიზებული.

## 8. რა არ შემოწმდა

- რეალური მაუსის drag (CDP `Input` არ არის). Drag-ები synthetic pointer event-ებით რეალურ DOM-ზე გაკეთდა.
- აკუსტიკური მოსმენა და `outputLatency`-ის კომპენსაცია. Playhead-ი `currentTime`-ს მიჰყვება, მოწყობილობის latency-ს არა.
- Delete Time video lane-ზე ბრაუზერში, რადგან ვიდეო კლიპი ამ round-ში ვერ იქმნება. ეს მხოლოდ unit test-ით არის დაფარული.
- Ctrl shortcut-ები ქართულ კლავიატურის განლაგებაზე.
- gstack `chain`-მა `press`-ები ვერ შეასრულა. Space ×10 ცალკეული რეალური press-ებით (~190 ms) და ცალკე 8 ms-იანი synthetic burst-ით შემოწმდა.

## 9. არტეფაქტები

`tmp/studio-real-loop/c-round-1/`: `tsc.txt`, `vitest-all.txt`, `vitest-arrangement.txt`, `biome-owned.txt`, `biome-app.txt`, `build.txt`, `network-fresh.txt`, `hashes-final.txt`, `git-status-final.txt`, screenshot-ები (`v1-1440x900.png`, `v1-1280x720.png`, `e4-empty-export-1440.png`, `b7-scrolled-end-1440.png`), `scripts/*.js` (harness და სცენარები, reproducible: `BROWSE_STATE_FILE=…/c-browse.json`, `$B eval setup.js`, შემდეგ სცენარი, შედეგი `__c.out.*`-ში).
