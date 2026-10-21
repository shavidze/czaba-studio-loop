# C — Round 5 დამოუკიდებელი შემოწმება

**თარიღი:** 2026-10-08
**შემმოწმებელი:** C (read-only app source-ზე)
**Target:** `http://127.0.0.1:5173/studio-lab`, gstack browse (`c-browse.json`), headless Chromium, 1440×900 და 1280×720.
**ვერდიქტი: PASS (round 5-ის acceptance) — ბაგებით B-სთვის.**
- Track S-ისა და Track U-ს ყველა acceptance ID გავიდა: R5-B1..B5, R5-B1u, R5-B1r, RF5-1, RF5-1b, RF5-2, RF5-3, RF5-U, R7-D1..D5, R7-U, R8-M1..M5, R8-U, R9-C1..C5, R9-U, G5-1..G5-3.
- ნაპოვნია 1 Medium, რომელიც round 5-მდეც არსებობდა (C-R5-02), და 4 Low (C-R5-01, C-R5-03..05).
- Real-mouse / real-Chrome პუნქტები PASS-ად არ ჩაითვალა. ისინი Tech Lead-ის სიაშია (§6).

A-ს report-ს არ ვენდე: ყველა gate და browser ტესტი თავიდან გავუშვი.

**დამოუკიდებლობა.** სესია context restart-ის შემდეგ გაგრძელდა (`c-round-5/checkpoint.md`):
- Track S პირველ სესიაში დასრულდა;
- Track U, რეგრესია და shots — მეორეში;
- tree შემოწმების დროს არ შეცვლილა (`git status` = `git-status-start.txt`);
- dev server 12:54Z-ზე გარედან გადაიტვირთა (Vite „server connection lost“). გვერდი ხელახლა ჩაიტვირთა. App-ის ბაგი არ არის.

## 1. Gates (G5-1..G5-3)

| ID | შედეგი | Evidence |
| --- | --- | --- |
| G5-1 | tsc EXIT 0. vitest arrangement 15 ფაილი **245/245**, სრული 47 ფაილი **709/709** (≥ 654 + ახალი). Biome owned 45 ფაილი 0 err / 0 warn, `./app` 0 err / 218 warn (round 4-ის იგივე). Build EXIT 0 | `c-round-5/{tsc,vitest-*,biome-*,build}.txt` |
| G5-2 | 4 protected hash OK. HEAD `354e341`-ზე: 19 M + 4 ??, ყველა §2.1/§2.2-ში. `Header.tsx` vs HEAD ცარიელია, vs `cc1e531` +21/−0 (ორი `Link` ბლოკი). styles/root/routes/public/package ცვლილება არ არის | `hashes.txt`, `git-status-start.txt`, `diffstat-start.txt`, `header-vs-cc1e531.txt` |
| G5-3 | Anonymous incognito context, credentials არ არის. Header nav `/`→`/studio-lab` client-side. Play + stem add + export WAV (16 წმ, 24-bit, 48k): request მხოლოდ GA-ზე (consent-denied). studio-token / recording / download / R2 request არ არის, `Authorization` header არ არის, binary send 0. Media მხოლოდ `middle-east.mp3` და `hero-music.mp3`. `curl /api/studio-token` anon → **401**. Fake Bearer → 500 „Unable to prepare Studio access“, token არ გაიცა (backend 5199 გათიშულია, ამიტომ ეს შედეგი შეზღუდულია). `/studio/middle-east` → „Sign in required“. **Premium auth bypass არ არის** | `g53-network.txt`, `studio-middle-east-anon.png` |

## 2. Track S

| ID | შედეგი |
| --- | --- |
| R5-B1 | **PASS.** `r5b1.js`, ორი pointer: video/music header, video-ს მარცხენა და მარჯვენა trim, music body range, brace body/start/end. შუაში Undo დაბლოკილია, პირველი pointer მოძრაობას აგრძელებს, pointer 2-ის move იგნორირებულია. თითო ჩანაწერი. შემდეგ რეალური Ctrl+Z, Undo ღილაკი, Delete და Ctrl+Shift+Z მუშაობს. `stale.js` (იგივე pointer 7, video + brace): preview დაბრუნდა, ისტორია არ შეიცვალა, ისევ draggable |
| R5-B1u | **PASS.** 14 ტესტი `gesture-reentry.test.tsx`-ში. ორი pointerdown, unmount, capture throw და stale შემთხვევები overwrite-without-release-ს ფარავს |
| R5-B1r | **PASS.** `r3v3.js` და `r3v3c.js` ორივე: trim 0.5, move 2.000, oracle 5.96e-8, linearity 1.19e-7. რეალური Ctrl+Z შემდეგ მუშაობს |
| RF5-1 | **PASS.** Light harness. R3-V1 same-load L_1..L_10: 9 PASS + L_6 INVALID (stall cover 12.7 % > 10 %; raw-ზეც გავიდა) → L_6b PASS. Reload Lr_1..5: 5/5. R2-V3 V3_1..3 + V3r_1..2: 5/5, swap 0.5/1.0-ზე, 2.0-ზე არ არის, hard seek 0. ყველა hard rule ყველა run-ში დაცულია. Invalid re-run 1/5 გამოყენებულია. CPU 41 % (Brave, ChatGPT, screensaver). Raw და stall-excluded series თითო run-ზე: `runs/{L,Lr,V3,V3r}_*.json` |
| RF5-1b | **PASS, შეზღუდვით.** Reload series-ში ბუნებრივი episode \|d\| > 0.12 **არ ყოფილა** (0 escalation), ამიტომ კრიტერიუმი vacuously სრულდება. Escalation-ის გზა მხოლოდ forced diag-ით დამტკიცდა (`esc.js`, რეალური rate 0.7). პირველი \|d\| > .12 1.611-ზე → escalation 1.931-ზე (**320 ms ≤ 450**). შემდეგი escalation-ები `seeked`-იდან 1.008–1.011 წმ-ში. 2-ე episode **501 ms** — 1.0 წმ-ის limit-ის გამოა (კრიტერიუმი ამას ამართლებს), < 600. Decoder ramp-ის სცენარი (round 4 Lr5) აქ არ განმეორდა → Tech Lead real Chrome. **B-ის გადასაწყვეტი:** მუდმივი ჩამორჩენისას escalation-ებს შორის counted time-ი (`seeked` + 300 ms exclusion)-იდან (`seeked` + 1000 ms)-მდეა, ანუ ≈ 700 ms. ეს RF5-1b-ის 600 ms-იან FAIL ზღვარს აჭარბებს. მიმდინარე constant-ებით ბუნებრივი ჩავარდნა hard rule-ს დაარღვევს. საჭიროა limit-ის შემცირება ან წესის ხელახლა განსაზღვრა |
| RF5-2 | **PASS.** L6_1..5: 15 wrap, ყველა swap-ით. vt +300 ms-ზე ∈ [2.275, 2.311] ⊂ [2, 4]. Loop end-ის მიღმა 0 frame. Dock-ის hard seek counter 0 (`rf5an`-ის 1 „hard seek“ run-ის ბოლოს Pause snap-ია) |
| RF5-3 | **PASS.** F_1..3: hold-ის დროს paused, `play()` startAt-ის +11.3 / −10 / −10 ms-ზე (ფანჯარაში), w1 ≤ .047, w2 ≤ .0545. H.264 diag H_1..3 PASS |
| RF5-U | **PASS.** `video-sync.test.ts` 34 ტესტი (escalation-ის 11 ახალი შემთხვევა). D-19-ის ტესტები გადის |
| R5-B2 | **PASS, როგორც დაწერილია.** ხის node-ებზე overflow არ არის, თითო ≤ 3 სტრიქონი, list column 144 px. R12-L1, R23-3 გადის. **მაგრამ** ხის გაფართოებამ list-ის სათაურები შეამოკლა → C-R5-01. Shots: `tree-1280.png`, `tree-1440.png`, `list-truncation-1440.png` |
| R5-B3 | **PASS.** 9 წყაროდან ყველას max bar 32/32 px. 3 stem-ის export oracle maxErr 1.006e-7 ≤ 3.58e-7 |
| R5-B4 | **PASS.** Loop on → dialog-ში loop-ის იგნორირება წერია და „იგივე graph“ claim არ არის. R5-E1: maxDiff 0, 768 000 frame |
| R5-B5 | **PASS.** რეალური key-ები slider-ზე. → offset +1.0; Home 0; Space pause 2.589 → resume 2.600; Enter 3.74 → 3.768. Transport 0-ზე რჩება, Play არ დაწყებულა, selection, box-ები და ისტორია უცვლელია. `zzz`: listbox-ს შვილები არ აქვს, მესიჯი მის გარეთაა |
| S4 (docs) | **PASS.** 013-ის status-ში round 4-ის FAIL ID-ები და Tech Lead-ის სიაა. 014 არსად აცხადებს PASS-ს |

## 3. Track U (SRW-07/08/09)

ყველა key რეალური `$B press`-ია. Pointer-ები synthetic-ია, რაც მოსალოდნელია. Audio იზომება AudioWorklet master tap-ით და `AudioBufferSourceNode.start/stop` hook-ებით. Export WAV parse-დება sample-ებად.

| ID | შედეგი |
| --- | --- |
| R7-D1 | **PASS.** Music 0–8 → Ctrl+D → ასლი 8.000-ზე იმავე ხაზზე, offset 0, duration 8, მონიშნულია. ჩანაწერი `დუბლირება (1)`. Export 8 → **16.000 წმ**. WAV[8..16) vs წინა WAV[0..8) **maxDiff 0**. Ctrl+Z → 8 წმ, Ctrl+Shift+Z → ისევ ასლი |
| R7-D2 | **PASS.** Ctrl+A (music 0–8, impact@2, video 0–6.008) → Ctrl+D → 8 / 10 / 8 თავ-თავის ხაზზე, სამივე მონიშნულია, `დუბლირება (3)`. Slow rise @11 → „დუბლირება ვერ შესრულდა: SFX ხაზზე 00:10.000–00:12.000 დაკავებულია. არაფერი შეცვლილა.“, ისტორია უცვლელია. Range → `დუბლირება კლიპებზე მუშაობს; Duplicate Time არ არის.` Selection-ის გარეშე → `დასადუბლირებლად აირჩიე კლიპი.` |
| R7-D3 | **PASS.** Play 0-დან, Ctrl+D 0.69-ზე → ასლი 3-ზე. Position monotone (188 sample). ძველი source-ის `stop` ზუსტად ახალი source-ის `when`-ზეა (თითო clip-ზე ≤ 1). Tap onset project-ის **2.998**-ზე, −17.6 dB, 5-ის შემდეგ −240 |
| R7-D4 | **PASS.** 3 მონიშნული, playhead 3 → music (offset 3.000) და bass (offset 1.000 = 0 + 3 − 2) გაიყო, impact ხელუხლებელია, `გაყოფა (2)`, selection = 2 მარჯვენა ნაწილი. Export split-მდე და შემდეგ: **maxDiff 1.19e-7** ≤ 2⁻²². Playhead-ი მხოლოდ კიდეებზე → „Playhead არცერთ მონიშნულ კლიპს არ კვეთს.“, ისტორია უცვლელია |
| R7-D5 | **PASS.** Header drag-ის შუაში რეალური Ctrl+D / X / V / C → „რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.“, clip-ების რაოდენობა უცვლელია. Release-ის შემდეგ clipboard ისევ ცარიელია |
| R7-U | **PASS.** `selection.test.ts`-ის `duplicateClips` / `splitClipsAtTime` describe-ები. 245/245 |
| R8-M1 | **PASS.** Music 2–6 → header drag ქვემოთ + 40 px → სტემები, start **3.000**, იგივე id, მუსიკის ხაზი ცარიელია, `გადატანა ხაზზე — სტემები`. Ctrl+Z ზუსტია, Redo მუშაობს. Live: music muted → tap −25.2 dB, stems muted → −240. Export stems muted 3–7 → **−240**, unmuted −24.9 |
| R8-M2 | **PASS.** Shift step 4-დან (drag-ის დაწყების შემდეგ) → start **2.000** ზუსტად, ხაზი სტემები. Hint ჩანს |
| R8-M3 | **PASS.** Audio ვიდეოხაზზე → amber `აუდიო ვიდეოხაზზე არ გადადის`, release → ცვლილება და ჩანაწერი არ არის. ვიდეოკლიპი ვერტიკალურად → ვიდეოხაზზე რჩება, დრო 1.0. დაკავებულ ადგილზე → amber `აქ ადგილი არ არის`, release → ბოლო ვალიდური 4.000 (სტემები) |
| R8-M4 | **PASS.** 2 კლიპი (ხაზი 1 და 2) → ხაზი 2 და 3, +1 წმ, `გადატანა (2)`. ქვედა ხაზი + 1 → refusal მესიჯით, დრო +1. ვიდეოიანი ჯგუფი → „ვიდეოკლიპი ხაზს არ იცვლის…“, დრო +1 |
| R8-M5 | **PASS.** დაკვრისას, cross-lane drag-ის შუაში: რეალური Ctrl+Z → დაბლოკილია, ისტორია უცვლელია. Pointer 9 down/up იგნორირებულია (ghost 4.000 დარჩა). Release → სტემები 4.000. Position monotone (534 sample). ძველი source-ის stop ჟღერადობამდე მოხდა, ახალი იწყება project-ის 4-ზე. Music muted → tap 4..8-ში −25.2 dB. შემდეგ Ctrl+Z მუშაობს |
| R8-U | **PASS.** `planClipLaneMove`-ის ტესტები (free, occupied, video, group, video member, out of range) |
| R9-C1 | **PASS.** Ctrl+C → seek 20 → Ctrl+V → music 20.000, offset 0, `ჩასმა (1)`, მონიშნულია. Export WAV[20..28) = WAV[0..8) **maxDiff 0**, 8–20 −240. Undo მხოლოდ ასლს შლის. დაკვრისას paste (სტემები 1.63-ზე) → ახალი source `when` = ახლა, offset .05. Tap პირამდე −240, შემდეგ −25.3. Monotone |
| R9-C2 | **PASS.** Cut → 0–4 + 6–10 (offset 6.000), impact@7 უცვლელია, ერთი `Cut`, range null. Paste 20-ზე → 2.000 წმ, offset **4.000**. Export 4–6 −240. ჩასმული = წინა 4–6, **maxDiff 0**. დანარჩენი maxDiff 0 |
| R9-C3 | **PASS.** Cut Time ↔ Delete Time reload-ზე: lane / start / length / offset **IDENTICAL** (`runs/r9c3-*.json`, 0.008 წმ-იანი ვიდეო sliver-იც). Paste 30-ზე → music 30 offset 4 და video 30 offset 4 თავ-თავის ხაზზე, `ჩასმა (2)`. 31-ზე video `currentTime` **5.000**. Undo თითო ნაბიჯზე ერთია |
| R9-C4 | **PASS.** Overlap → „ჩასმა ვერ შესრულდა: მუსიკა ხაზზე 00:31.000–00:33.000 დაკავებულია. არაფერი შეცვლილა.“. Range-ის გარეშე Cut Time → მესიჯი. ცარიელი → `ბუფერი ცარიელია — ჯერ Copy ან Cut.` Lane-kind refusal → ხაზი ჩანს, დრო არა (C-R5-04) |
| R9-C5 | **PASS.** Search input-ში რეალური Ctrl+A / C / X / V → native text edit, arrangement, selection და ისტორია უცვლელია. Ctrl+D იგნორირებულია. Delete range-ით = Delete Time (R1-B5 ციფრები, §4). Drag-ის შუაში X / V / D დაბლოკილია |
| R9-U | **PASS.** `clipboard.test.ts` 11 ტესტი |

## 4. რეგრესია (G5-R)

| ID | შედეგი |
| --- | --- |
| R1-E1 / E5 / E3 | 15.000 წმ, −240 / −14.8 / −19.0 / −21.6. Oracle **5.96e-8**. Impact residual 1.19e-7 (`runs/reg.json`, round 4-ის იდენტური) |
| R1-B5 | 0–9 და 11→9 **0**, 15→13, undo ზუსტია |
| R1-B10 | Undo / Redo add, move, trim, split, delete time, duplicate, cut, paste-ზე ზუსტია. Input-ში Ctrl+Z / Home / Space arrangement-ს არ ეხება |
| R1-B11 / R1-B12 | Muted −240, unmute-ზე 0 ms. Delete Time დაკვრისას continuity **0 sample** |
| R2-V1 / R2-V2 | Append 6.008. wav / broken / pdf / webm→music / wav→music / empty-MIME wav უარყოფილია, ისტორია უცვლელია. MOV / MP4 / no-audio მიიღება. Stray drop prevented. Body send 0 (`runs/v2.json`) |
| R3-V2 | Video audio mute → **−240**, unmuted −19.0. `<video>` ყოველთვის muted, აქტიური არ არის paused |
| R3-V3 | R5-B1r იხ. |
| R3-V4 | 10 რეალური Space → stopped, ორივე `<video>` paused / rate 1 / muted, 20 start / 20 stop (2 source თითო Play-ზე) |
| R4-P1 | Playing drag: 0 write `seeking`-ის დროს. Release + 300 ms-ის შემდეგ \|vt − pos\| ≤ 0.026. Clip end-ზე hold. (`maxAfter` 1.5 სკრიპტის layout-ის ვარაუდია, არა drift) |
| R4-P3 | Pause 2.601 → resume source offset 2.601. Home დაკვრისას → 0 და გრძელდება. Stopped Home → 0. Input-ში Home იგნორირებულია |
| R5-L1..L5, R5-E1 | Create / replace / undo / redo, off dashed, E1 on/off **1.19e-7**. L3 seam **0**, wrap min −25.2, pos [2.011, 3.99]. L4 real keys 2.1–4.1 / 2–4 / 1.9–3.9 / 1.9–4.0, 4 undo → 2–4. L5(d) 1–3 → undo 2–4. L5(b)(c) 3 + 3 run: toggle-ისა და drag-ის audio jump **0**, music concurrency 1. Readout step error-ის ±0.021–0.032 წყვილები action-ს არ ემთხვევა და ერთმანეთს აბათილებს (audio clock-ის sampling) |
| R6-S1..S5 | Ctrl+click 3 → 3, Shift+click → 4, Ctrl+click → 3. Marquee → 3, group +2 დაიბლოკა **1.992**-ზე, undo ზუსტია. Group delete 3. Input-ში Ctrl+A native-ია. **S5-ის „group Ctrl+E refused“ D-25-მა განზრახ შეცვალა** (R7-D4) |
| R4-B1 | Clip / trim / brace-ის შუაში რეალური Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y და Undo ღილაკი → დაბლოკილია. Release → ერთი ჩანაწერი |
| R4-B3 | 1280 და 1440, loop none/on/off × 4 მდგომარეობა → Loop box Δ **0 px** |
| R4-B4 | Delete / Backspace + 5 repeat → 1 წაშლა, 1 ჩანაწერი |
| R4-B7 | rAF stub 5 წმ: late start 0, wrap −25 dB, თითო clip-ზე concurrency 1 (საერთო 3 = music + video audio + impact), resume loop-ში |
| R11A-1 | Collapse 288 → 40, scroller 1152 → 1400, იგივე `<video>` node, \|d\| ≤ **0.0116** |
| R11A-3 + footer | 1280 / 1440: 4 lane, ruler და strip ჩანს, doc scroll არ არის, dock 160×90 overlap-ის გარეშე. Footer hint **1 სტრიქონია** ყველა მდგომარეობაში (idle / two / range / drag / after). Drag-ისას Shift hint ცვლის shortcut სტრიქონს (`runs/foot_*.json`) |
| R12-L1..L4, R12-S2 | L1 (libchk). L2: სტემები → 4, `aria-current`. L3: 1 preview source, Play preview-ს აჩერებს, preview transport-ს აჩერებს. L4: ghost 00:10.000 / 400 px, amber 15-ზე, video refusal. S2: onset **10.000125**, ბასთან სხვაობა **5.96e-8** |
| R22-1 | G5-3 იხ. |

**არ გავუშვი თავიდან:** R11A-2 (separator-ის კლავიატურა), R4-M2, R4-B5 / B6. მათ ფაილებს ამ round-ში ცვლილება არ შეხებია. მიუხედავად ამისა, PASS-ად არ ვთვლი; ისინი „blocked / not re-run“-შია.

**Shots (G5-shots):**
- `tree-{1280,1440}.png`;
- `ghost-normal-{1280x720,1440x900}.png`;
- `ghost-amber-{1280x720,1440x900}.png`;
- `after-paste-{1280x720,1440x900}.png` (footer hint აქვე ჩანს);
- `list-truncation-1440.png`.

## 5. ბაგები (B-სთვის)

### C-R5-01 — Low — ბიბლიოთეკის list-ში სათაურები იჭრება, 4 stem ერთმანეთისგან არ გაირჩევა
- **ნაბიჯები:** 1280×720 ან 1440×900, ბიბლიოთეკა default 288 px-ზე, „ყველა ფაილი“.
- **მოსალოდნელი:** LIB / PRE — list-ის თითო row-ზე ხმის სახელი იკითხება (stem-ის სახელიც).
- **ფაქტობრივი:**
  - title-ის span 110 px-ია; 9-დან 7 იჭრება;
  - პულსი, ბასი, პადი, მელოდია და მიქსი ერთნაირად ჩანს: „ღამის პულსი…“;
  - stem-ის სახელი მხოლოდ tooltip-ში, preview panel-ში ან panel-ის გაფართოებისას ჩანს.
- **მიზეზი:** C-R4-03-ის fix-მა (ხე `w-36`) list column 192 → 144 px-მდე დაავიწროვა.
- **Evidence:** `runs/list-trunc-*.json`, `list-truncation-1440.png`, `after-paste-1440x900.png`.

### C-R5-02 — Medium (round 5-მდეც არსებობდა, cross-lane-მაც გაავრცელა) — მეორე pointer-ით drag-ის დროს გაკეთებული edit უჩუმრად უქმდება
- **ნაბიჯები:**
  1. Music clip-ის header drag (pointer 7), release-ის გარეშე (cross-lane ან იმავე ხაზზე);
  2. მეორე pointer (touch id 21) → სხვა clip-ის (impact @8) header drag +1 წმ და release, ან ხაზის **M** click;
  3. პირველი pointer-ის move და release.
- **მოსალოდნელი:** მეორე edit ან დაიბლოკება (D-20 / D-23-ის სულისკვეთებით), ან შენარჩუნდება.
- **ფაქტობრივი:**
  - მეორე edit ჯერ commit-დება: `კლიპის გადატანა` impact → 9, ან `Mute — SFX`;
  - პირველი gesture-ის შემდეგ move-ზე ან release-ზე `gesture.before`-იდან აგებული arrangement ბრუნდება: impact → 8, SFX mute → false;
  - ისტორიაში დაკარგული edit-ის ჩანაწერი რჩება;
  - cross-lane-ის დროს ghost და Shift hint ქრება: მეორე gesture-ის release `setClipLaneDrag(null)`-ს იძახებს.
- **Evidence:** ამ ანგარიშის browser run-ები.
  - Round 5-მდე: HEAD-ის `ArrangementClip.tsx` 232–275 preview-ებს `gesture.before`-იდან აგებს (`moveClips` / `moveClip` / `trim*`) და `commitArrangement(..., gesture.before)`-ით ასრულებს. Round 5-მა იგივე pattern cross-lane commit-ზე (`laneTarget.arrangement`) გაავრცელა.
  - Cross-lane: `{"g2":{"full":[sfx 9]},"after":{"full":[music 4, sfx 8]}}`.
  - Same-lane: mid `sfx 9` → after `sfx 8`.
  - Mute: mid `aria-pressed=true`, `Undo: Mute — SFX` → after `false`.
  - Reviewer #7 და A-ს „known gap“-ი ამას ადასტურებს.
- **მიმართულება:** სხვა clip-ის, lane-ის კონტროლის და brace-ის pointer edit-ები აქტიური gesture-ის დროს გლობალურად დაიბლოკოს (`isPointerGestureActive()`); ან commit `before`-ის ნაცვლად მიმდინარე state-ზე rebase-დეს. საჭიროა unit ტესტი.

### C-R5-03 — Low — amber lane-ghost-ის label მეზობელი clip-ის სათაურს ეფარება
- **ნაბიჯები:** 1280×720, SFX clip-ის cross-lane drag ვიდეოხაზზე (clip-4s @8-ის მახლობლად).
- **ფაქტობრივი:** label „00:03.950 · აუდიო ვიდეოხაზზე არ გადადის“ (`overflow-visible`, `whitespace-nowrap`) ვიდეოკლიპების header-ების ტექსტზე იხატება. ორივე ტექსტი იკითხება ცუდად. Valid ghost-ის სათაური 2 წმ-იან clip-ზე „S.“-მდე იჭრება.
- **Evidence:** `ghost-amber-1280x720.png`.

### C-R5-04 — Low — Lane-kind paste refusal დროს არ ასახელებს
- §8: „status names the lane and time“. Lane-kind refusal-ის მესიჯი: „ჩასმა ვერ შესრულდა: ვიდეო ხაზზე ეს მასალა არ ჯდება (აუდიო და ვიდეო ხაზს არ იცვლის). არაფერი შეცვლილა.“ — დრო არ არის.
- Overlap-ის მესიჯი დროს ასახელებს.

### C-R5-05 — Low (round 5-მდეც არსებობდა, product-ის გადაწყვეტილება) — Play `projectEnd`-ის მიღმა უჩუმრად 0-ზე ხტება
- **ნაბიჯები:** impact 0–2, seek 5 (ან 9-ზე, music 0–8-ით), Play.
- **ფაქტობრივი:** პოზიცია 0-დან იწყება, 2-ზე ჩერდება. Status არაფერს ამბობს.
- **კონფლიქტი:**
  - D-15: playhead-ი insert position-ია. Paste workflow-ში seek 20 → Space playhead-ს აკარგვინებს;
  - Ableton insert marker-იდან უკრავს, ბოლოს მიღმაც.
- **Round 5-მდეც არსებობდა, განზრახ:** HEAD `354e341`-ში `ArrangementContext.tsx` ~692: `current >= end - EPS && !loop ? 0 : current`.
- B-მ უნდა გადაწყვიტოს: შენარჩუნება მესიჯით თუ insert marker-იდან დაკვრა.

**შენიშვნები (ბაგი არ არის / სხვა scope):**
- Export ხმას 0 dBFS-ზე hard-clip-ს უკეთებს (peak ზუსტად 1.0, მაგ. pulse + impact, pulse + bass). Clip indicator / limiter არ არის → SRW-13 (meters).
- Delete / Cut Time 0.008 წმ-იან ვიდეო sliver-ს ტოვებს (4.000–4.008). D-09 ასე მუშაობდა; Tech Lead-ისთვის UX შენიშვნაა.
- Shift hint („დრო ჩაკეტილია“) Shift-ის დაჭერამდეც ჩანს. §7 ასე მოითხოვს, მაგრამ ტექსტი მდგომარეობად იკითხება. ჯობია „Shift — დრო ჩაიკეტება…“.
- Multi-selection-ის წევრზე click drag-ის გარეშე selection-ს არ აერთიანებს ერთ კლიპამდე (Ableton აერთიანებს). D-18-ის ქცევაა.
- Forced escalation: 2-ე episode 501 ms (1.0 წმ limit). Ბუნებრივ ჩავარდნაზე limit-ის შემცირება B-ის გადასაწყვეტია.

## 6. Blocked / Tech Lead (PASS-ად არ ითვლება)
- R23-1 / R23-2: scrollbar-ის ვიზუალი, wheel / trackpad და thumb drag (headless `--hide-scrollbars`, wheel allowlist-ში არ არის).
- R12-L4: რეალური HTML5 drag.
- R8-M1 / M2: რეალური მაუსი (ჩემი pointer-ები synthetic-ია).
- RF5-1 / RF5-2 რეალურ Windows Chrome-ზე (VP9 + H.264), მათ შორის decoder-ramp-ის სცენარი (RF5-1b-ის ბუნებრივი escalation).
- თავიდან არ გავუშვი: R11A-2, R4-M2, R4-B5, R4-B6.

## 7. Root review / publication-checkpoint — დარჩენილი
- **დაიხურა ამ round-ში (C-მ დაადასტურა):** root L6 (R5-B4), C-R4-01 (RF5-1 / RF5-2 stall-exclusion-ით), C-R4-02 (R5-B1), C-R4-03 (R5-B2, მაგრამ იხ. C-R5-01), C-R4-04 (R5-B3), A-R4-L9 (R5-B5).
- **ღიაა:**
  - root M3 (doc 012-ის honesty);
  - L7 (unbounded history, დემოსთვის მიღებულია);
  - L5 (3 biome-ignore, მიღებულია);
  - reviewer #7 → C-R5-02.
- **Publication / all-files:**
  - purchased `/studio/:productId` loader `middle-east`-ზეა hardcoded (High, inherited, protected → SRW-21);
  - category-ის whitespace match (Medium);
  - `userId` hash-ის განსხვავება studio-სა და download-ს შორის (Medium);
  - AGENTS.md / `.codex`-ის portable paths (Medium);
  - T12 Gain/Volume;
  - SRW-10, SRW-11B, SRW-13..20, SRW-21 — todo.
- **ბექლოგი დასრულებული არ არის.**

## 8. Product flow და Ableton (FB / CLP / EDT)
- **Find sound → add → fit video → export** end-to-end მუშაობს:
  - search / tree → preview → drag ან Enter;
  - Ctrl+D / Ctrl+C / X / V / Ctrl+Shift+X;
  - cross-lane move;
  - video paste-ის offset ზუსტია;
  - export bit-exact-ია.
- **FB-02** (clipboard / Cut Time) — დახურულია. Cut Time = Delete Time + material ყველა ხაზიდან.
- **FB-03** (ხაზებს შორის გადატანა, Shift time lock) — დახურულია.
- **CLP-01 / CLP-02 / EDT-01..07** ძირითადად ემთხვევა: duplicate span-ით, all-or-nothing, last-valid drop.
- **Ableton-თან განსხვავებები:**
  - Ableton-ის Duplicate Time range-ზე აქ refusal-ია (D-25);
  - paste playhead-ზე ხდება (D-15), არა insert marker-ზე. იხ. C-R5-05.
