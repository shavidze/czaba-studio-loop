# C — Round 2 ვერიფიკაცია (C-R1 fixes, SRW-02, SRW-03, SRW-04)

თარიღი: 2026-10-07 · ვერიფიკატორი: C · ობიექტი: A-ს round 2 (`a-round-2.md`)

**შედეგი: FAIL.** 22 acceptance დამოუკიდებლად დადასტურდა. ორი ჩავარდა:
- **R3-V1** — ვიდეოს sync-ის ტოლერანსი;
- **R2-V3** — მისი playback ნაწილი.

ბაგები: 1 High (C-R2-01), 1 Low (C-R2-02).

App source-ს არ შევხებივარ. commit/push/deploy არ ყოფილა. ბრაუზერის side effect-ები შემოიფარგლა `/studio-lab`-ის დემო state-ით, ჩემი gstack daemon-ით (`c-browse.json`) და prototype-ის ასლით (`c-round-2/proto/`, მხოლოდ R2-V0-ისთვის).

## 0. მეთოდი

- **Gates:** ყველა ბრძანება თავიდან გავუშვი (`c-round-2/*.txt`).
- **ბრაუზერი:** gstack `/browse`, ახალი daemon. Cookies `''`, `auth_user = null`.
- **Harness** (`c-round-2/scripts/`): round-1-ის `setup-base.js` + `ext.js`. შემადგენლობა:
  - source start/stop counter-ები;
  - AudioWorklet tap master-ზე;
  - საკუთარი 24-bit WAV parser;
  - `fetch`/XHR/beacon binary-body guard;
  - staging `<input id=c-stage>` fixture-ებისთვის;
  - `sampleSync`: video და audio clock ერთ rAF-ში იკითხება;
  - `vfc.js`: `requestVideoFrameCallback` და ყოველი `currentTime=` მინიჭების log, `seeking` flag-ით.
- **Drift:** იზომება audio clock-ით (`ctx.currentTime − start.when`), არა rAF ტექსტით.
- **Picker:** რეალური `$B upload` `arrangement-video-input`-ზე.
- **Drop:** synthetic `DragEvent` + `DataTransfer` staged `File`-ებით.
- **Space და Home:** რეალური `$B press`, დამატებით 8 ms-იანი synthetic burst.
- **Fixtures:** `media/`-ის sha256 ემთხვევა `SHA256SUMS.txt`-ს. გარეთ არაფერი აიტვირთა.
- **ბრაუზერი:** HeadlessChrome/145.0.7632.6. `canPlayType`: mp4 avc1/mp4a = `probably`, webm vp9/opus = `probably`, quicktime = `""`.

## 1. Gates

| ID | შედეგი |
| --- | --- |
| R2-U1..U3 | `vitest app/lib/arrangement` → 6 files, **93/93**. ყველა §7 სახელიანი შემთხვევა არსებობს: `video.test` (classify, findVideoClipAt start/end/gap/offset, nextVideoStart, appendVideoClip >60, trim+deleteTime mapping, drift thresholds); `transport.test` (hold at from, pause before startAt, 5 pairs, continuous handoff, remap, scrub throttle); schedule/graph (video planned, muted video planned, solo audio↔video, video trackGain); model (`trimClipEnd` video). შეცვლილი round-1 ტესტები: `excludes the video track` → `plans video-track clips…`, `honours the until bound` (`['early','v','m']`) — ორივე კონტრაქტის ცვლილებაა, დასაბუთებულია |
| R2-G1 | `vitest` **557/557** (≥517+new); `TSC_EXIT=0`; build `BUILD_EXIT=0`; biome owned: 27 files, 0 diagnostics; `./app`: 0 errors / 218 pre-existing warnings |
| Code rules | owned non-test ფაილებში: `//`, `/*`, ` as `, `any`, `@ts-ignore`, hex ფერები = 0 (ერთადერთი false positive: `accept="video/*"`). `fetch`/XHR/`apiClient`/`useAuth`/`StudioContext`/`r2.config` = 0. Impl doc `011-…md`-ში template-ის ყველა სექციაა |
| R2-S1 | 4 protected hash = OK (ბოლოსაც ხელახლა შემოწმდა). `git status` = §2 + წინასწარ არსებული 4 M + `.agents/ .codex/ AGENTS.md .claude/agents/…`. „Not changed“ ფაილების mtime round 2-ზე ადრეულია |

## 2. Auth / privacy (R2-S2, R2-V4)

- **Fresh `/studio-lab`:**
  - media: მხოლოდ `/middle-east.mp3`, `/videos/hero/hero-music.mp3` და `blob:`;
  - `studio-token|recording|/api/download|r2|cloudflarestorage` = 0;
  - არცერთ fetch-ს Authorization header არ აქვს.
- **Anonymous `/api/studio-token?...`** → **401** „Please sign in to access Studio.“
- **ყალბი Bearer** → 500, token არ გაიცა.
- **`/studio/middle-east`** → „Sign in required“; token, stem და R2 მოთხოვნები არ არის.
- **Import-ის დროს:** 13 მოთხოვნა, ყველა `GET blob:` (206). `bodySends = []`. დანარჩენი მოთხოვნები root GA-ია (body = binary არ არის).
- **Premium auth bypass არ ხდება.**

## 3. Fixes

| ID | გაზომილი | შედეგი |
| --- | --- | --- |
| R2-F1 | ruler 20.000 → 10 Space keydown, 8 ms busy-wait-ით (ctx Δ 8–10.7 ms) → **20.000**, paused. Play @7: 128 frame, პირველი frame = 7.000, **min Δ 0**, უკან სვლა 0. Header drag დაკვრისას: music source handoff `(Δoff − Δwhen)` = **0 ms** | PASS |
| R2-F2 | 1440×900: scrollHeight 900; 1280×720: 720. body padding 0. `scrollTo(0,500)` → scrollY 0, header top 0 | PASS |
| R2-F3 | 1440: blocked trim „Trim შეჩერდა: წყაროს დასასრული… (0.05 წმ).“ და „…ისტორია არ შეიცვალა.“ → sw 1416 = cw, sh 16 = ch, text-overflow `clip`, white-space normal, საკუთარი რიგი. Range/clip დეტალები შემდეგ რიგზეა. 1280: 1256 = 1256. შენიშვნა: trim-ის pointerdown range-ს ასუფთავებს, ამიტომ ეს შეტყობინება range-თან ერთად ერთდროულად ვერ ჩანს | PASS |
| R2-F4 | Delete Time 1–2 დაკვრისას: 3.20 → 2.25, music/video source უწყვეტია (off 3.26). ~0.5 წმ-ში Undo → pos 2.791 → 2.842 (ნახტომი არ არის). ახალი source-ები: off 2.86 = მიმდინარე timeline დრო; clip-4s `when` = აღდგენილი timeline 8-ის შესაბამისი | PASS (D-12) |

## 4. SRW-02

| ID | გაზომილი | შედეგი |
| --- | --- | --- |
| R2-V0 | კოდი: `workspace.js:1052` (`dropEffect = lane ? … : "none"`), `:1087–1100` (მხოლოდ `text/plain`). Runtime, prototype-ის ასლი: empty-MIME `.mov` drop video lane-ზე → hint „აუდიო გადაიტანე მუსიკის…“, 0 კლიპი. A-ს ფაქტები დადასტურდა | PASS |
| R2-V1 | Picker → `beeps` 0–**6.008**. Drop `clip-4s` → **6.008**–10.016. Status ორივე ფაილს ასახელებს; Undo label `ვიდეოს დამატება — <name>`. Undo შლის მხოლოდ მე-2-ს; Redo აბრუნებს **იგივე id-ს**. Peaks დაიხატა. MP4 (13.016–19.016), MOV (19.016–22.016) და no-audio MP4 („ხმა არ არის“) აქ რეალურად მიიღება — env-limited **არ** არის | PASS |
| R2-V2 | wav (drop, ტიპიანი და ცარიელი MIME) → audio rejection. `broken.mp4` → probe error. `.pdf` → „ფორმატი არ არის ვიდეო (.pdf).“ webm music-ზე → „ვიდეო ჩააგდე ვიდეოხაზზე.“; wav music-ზე → audio message. ყველა rejection-ზე clip ids და Undo label უცვლელია. Empty-MIME `.mov` → მიღებულია. Stray drop header-ზე → `preventDefault`, URL უცვლელია | PASS |
| R2-V3 | Trim 0.5 → split 3 → Delete Time 1–2 (+ Slow rise SFX). Video: 0.5–1 off 0.5 · 1–2 off **2.0** · 2–5.008 off 3. SFX: 0–1, 1–4. ერთეულის მათემატიკას ემთხვევა (2.0 სწორია). **Playback drift, 3 run:** median 0.081 / 0.034 / 0.066, max **0.154** / 0.050 / 0.073 | **FAIL** (C-R2-01) |
| R2-V4 | იხ. §2 | PASS |

## 5. SRW-03

### R3-V1 — FAIL

**Layout:** video 0–6.008 და 8–12.008, music 0. 10 run ერთ page load-ში, 250 ms-იანი sampling (ფაქტობრივი ინტერვალი 250–306 ms). ჩავარდა 5/10.

| run | median | max | შენიშვნა |
| --- | --- | --- | --- |
| 1 | **0.065** | **0.146** | +0.135 სტაბილურად 2.06–4.38 წმ-ზე |
| 2 | 0.011 | 0.072 | |
| 3 | 0.038 | 0.058 | |
| 4 | 0.023 | **0.127** | |
| 5 | 0.029 | 0.068 | |
| 6 | 0.014 | **0.145** | 3.15–4.43 წმ-ზე `video.seeking=true` |
| 7 | **0.076** | **0.137** | frame drift med 0.079 / max 0.161; frame gap **800 ms**; 11 seek, მათგან 4 `seeking`-ის დროს |
| 8 | 0.032 | 0.059 | 1 seek, frame gap 83 ms |
| 9 | 0.039 | **0.149** | 7 seek, მათგან 4 `seeking`-ის დროს |
| 10 | 0.031 | 0.090 | presented frame max 0.108 |

**სხვა შემოწმებები:**
- Gap-ში ყოველ sample-ზე: video paused + hidden და gap ტექსტი „ვიდეო არ არის · mm:ss.mmm“. ერთადერთი გამონაკლისი: 6.03 წმ-ზე, ერთი frame-ის React lag-ის გამო.
- `muted` ყოველთვის `true`-ა.
- Stopped seek-ები 1/3/5/9 წმ-ზე: `vt` = target ზუსტად (P1-ში stopped drag: 3.000 → `vt` 4.000).

### დანარჩენი SRW-03

| ID | გაზომილი | შედეგი |
| --- | --- | --- |
| R3-V2 | Music muted. Video M @1.53 → beep ფანჯრები 2 და 3 = **−240 dB**, ზუსტი ნული. Unmute @4.07 → პირველი ხმოვანი ბლოკი **0 ms**; ფანჯრები 4/5 = −18.5/−9.1. Toggle-ის დროს starts/stops Δ = 0/0. Clip-ში `paused` false 87/87 sample-ზე, `muted` ყოველთვის true. Solo music (muted) → video beep-ები 8–11 = −240 | PASS |
| R3-V3 | beeps @0, left-trim → off 0.5, move → 2.0, music @0. **Video-only export:** `out[96000+k]` vs ჩემი `decodeAudioData`-ს `[24000+k]`, 264000 frame × 2 ch → **5.96e-8** ≤ 2⁻²². offset-ის იგნორირებისას diff = 0.507. Onsets **2.5, 3.5, 4.5, 5.5, 6.5**. 0–2 წმ nonzero = 0. **Video M:** export = music oracle (≤1.19e-7). Linearity A−B−C ≤1.19e-7. Dialog: „შედის“ / „გამორთულია (M/Solo)“. **noaudio:** „ვიდეოს ხმა არ აქვს“ და შენიშვნა „…00:02.000 სიგრძის სიჩუმით“; WAV 2.000 წმ, ყველა sample 0; video render option disabled თავისი მიზეზით. **AAC MP4:** same-decode 5.96e-8, onsets 0..5 | PASS |
| R3-V4 | 10 რეალური Space (clip-ში, 1.0 წმ-დან) → stopped, `video.paused`, 15 starts = 5 × 3 clip, 15 stops. 8 ms synthetic burst → 15/15, paused. +1 რეალური Space → playing, `video.paused=false`, `vt` 3.376 vs pos 3.38, 3 starts. `<video>` = 1 | PASS |

## 6. SRW-04

| ID | გაზომილი | შედეგი |
| --- | --- | --- |
| R4-P1 | Handle: `role=slider`, `aria-label` Playhead, 12×20 px. **Stopped drag** → 3.000; video 4.000 (= 3 − 2 + 3); 0 source. **დაკვრისას drag**, 60 move / 1338 ms → 12 reschedule (ერთმანეთისგან ≥0.1 წმ-ით) + 1 release ≤ 15. Release-ის შემდეგ pos 4.379, `vt` 5.393 (drift 14 ms). Undo label უცვლელია, კლიპები უცვლელია. ←/→ focus-ზე = ±0.1 (3.0 → 3.1 → 2.9) | PASS |
| R4-P2 | Body-range drag დაკვრისას: range 1.275–2.775; playhead მონოტონურია (1.31 → 1.62); 0 ახალი source | PASS |
| R4-P3 | Pause 3.03 → Play 3.03; source offset-ები timeline-ს შეესაბამება. **Home დაკვრისას** → 0.099, 5 start / 2 stop, გაორმაგება არ არის. **Home stopped** → 0; რეალური `$B press Home` → 0, `vt` 0. **Home text input-ში** → 2.5 უცვლელია | PASS |

## 7. R2-R1 — round-1 regression, video კლიპით

Video lane: noaudio 0–2 + beeps 2–8.008.

| ID | შედეგი |
| --- | --- |
| E1 | 15.000 წმ, 24-bit. 0–2 = −240; impact −16.45; **4–5 = −240**; music −22.47 |
| E5 | Solo SFX: oracle **5.96e-8**. 0–3 წმ nonzero = 0 — video beep-ები 2–3-ზე სწორად ჩაჩუმდა. 4.75-ის შემდეგ = 0 |
| E3 | 0–2.9 diff 0; impact-ის residual 1.19e-7; 4.75-ის შემდეგ diff 0 |
| B5 | Delete Time 9–11: 0–9 (video-ს ჩათვლით) diff 0; 11+k ≡ 9+k diff 0; 15 → 13; Undo deep-equal |
| B11 | Muted −240; unmute → 8 ms; 0 ახალი start/stop |
| B12 | Delete 6.5–7.5 დაკვრისას: 8.611 → 7.681; music handoff **0 sample**; დაკვრა გრძელდება |

ყველა: PASS. Harness შენიშვნა: პირველ ცდაზე export dialog ღია დარჩა (ჩემი helper-ის race). Shortcut-ები სწორად იგნორირდა. Helper გავასწორე და ცდა გავიმეორე.

## 8. R2-V-shots

`c-round-2/shot-1440x900.png`, `shot-1280x720.png`: აქტიური frame, 2 video clip და music.
- **Dock:** 288 px; 1440-ზე 661–851, 1280-ზე 481–671. Footer-ის top = 851 / 671, გადაფარვა არ არის.
- **Library:** 1280-ზე list scroll-დება (178/228). Library + dock-ის გადაფარვა არ არის.
- **Cosmetic:** video lane-ის სახელი „ვიდეო…“ იჭრება ღილაკის გამო.

**PASS.**

## 9. ბაგები B-სთვის

### C-R2-01 (High) — ვიდეოს sync drift და seek storm

**სიმპტომები:**
- R3-V1 ჩავარდა 10-დან 5 run-ში (1, 4, 6, 7, 9): max 0.127–0.149 წმ; ამათგან run 1 და 7-ში median-იც ზღვარს აჭარბებს (0.065, 0.076). Run 10-ში 0.1-ს მხოლოდ presented-frame drift აჭარბებს (0.108), რაც კრიტერიუმის მეტრიკა არ არის.
- 10-ივე run ერთ page load-ში ჩატარდა. Dock-ის adaptive lead (`seekLeadRef`/`startLeadRef`) Play-ებს შორის ინახება. Reload-ით თითო run ცალკე ექსპერიმენტია.
- R2-V3 playback ჩავარდა 3-დან 2 run-ში.

**მექანიზმი:**
- `ArrangementVideoDock.tsx:103–111` ახალ hard seek-ს უშვებს მაშინაც, როცა `video.seeking === true`.
- seek-ის target-ს ემატება learned lead (`nextVideoSeekLead`, დაახლ. 0.17–0.27 წმ წინ).
- შედეგად video `seeking` მდგომარეობაში რჩება ≤1.3 წმ, frame იყინება (≤800 ms), `currentTime` კი ~0.13 წმ-ით წინ უჩვენებს.
- R2-V3-ში იმეორებს seek → waiting → seek ციკლს.

**შენიშვნები:**
- Headless VP9 seek-ის latency შეიძლება აზვიადებდეს სიმპტომს. თვითონ ქცევა კი კოდის დონისაა.
- შესწორების მიმართულება B-ს გადაწყვეტილებაა. მაგალითად: არ გაუშვა seek, სანამ `seeking`/`seeked` არ დასრულდება; ან lead clamp; ან B-ის ნებართვით `playbackRate` soft-sync.
- გამოსწორების შემდეგ Tech Lead-მა რეალურ Chrome-ში უნდა შეამოწმოს.

### C-R2-02 (Low) — video Play-ზე audio-ზე ადრე იწყება

- Video-ზე `play()` იძახება `isPlaying`-ზე, audio-ს `startAt`-მდე.
- პირველ Play-ზე, AudioContext-ის შექმნისას, video +266 ms-ზე 0.222 წმ-ით წინ იყო.
- ეს 300 ms-იან excluded ფანჯარაშია, ამიტომ acceptance-ს არ არღვევს.

### შენიშვნები (ბაგი არ არის)

- როცა ყველა ხმოვანი ხაზი muted-ია, export dialog „სიჩუმის“ შენიშვნას არ აჩვენებს. ეს არ მოითხოვებოდა.
- Dock 288 px-ია (deviation-ში აღწერილია).
- `decodeVideoAudio`-ს return-ის ფორმა შეცვლილია (deviation-ში აღწერილია).
- Video audio decode container timestamp-ებს/edit list-ს არ ითვალისწინებს. ფაილში, სადაც აუდიო ნულიდან არ იწყება, A/V აცდენის რისკია. Fixture-ებზე აცდენა 0-ია (AAC onsets ზუსტია).

## 10. FB და პროდუქტის flow

- **FB-15:** PASS (picker + OS drop, MIME/extension, probe, თანმიმდევრული განთავსება, მხოლოდ blob:).
- **FB-16:** ფუნქციურად არსებობს — ერთი transport, ორიგინალი ხმა იგივე graph-ით, M/S/Vol, WAV-ში შედის. **Sync-ის ტოლერანსი არ სრულდება.**
- **FB-01:** პროექტი 60 წმ-ზე გრძელი ხდება (101 წმ).
- **სხვა FB:** round-ის scope-ს გარეთაა, PASS-ად არ ჩაითვალა.
- **Flow „find → add → fit video → export“:** მუშაობს დემო ბიბლიოთეკაზე. ძიება და preview ჯერ არ არის (SRW-12). Fit video: import, trim, split, Delete Time; offset-ები ზუსტია. Export: ზუსტი WAV, ვიდეოს ხმით.

## 11. არტეფაქტები

`tmp/studio-real-loop/c-round-2/`:
- **Gates:** `vitest-*.txt`, `tsc.txt`, `biome-*.txt`, `build.txt`.
- **Network და სტატუსი:** `network-*.txt`, `git-status-final.txt`, `hashes-final.txt`.
- **შედეგების JSON-ები:** `r3v1_*.json`, `v3play_*.json`, `r3v2.json`, `r3v3*.json`, `f1.json`, `f4.json`, `p1.json`, `p23.json`, `reg.json`, `aac.json`, `v2.json`.
- **Screenshot-ები:** `shot-*.png`, `f3*.png`.
- **Script-ები:** `scripts/*.js`, `b.sh`, `prep.sh`.

Reproduce: `c-round-2/prep.sh` → `$B upload … arrangement-video-input` → `$B eval c-round-2/scripts/<x>.js` → `window.__c.out.<key>`.
