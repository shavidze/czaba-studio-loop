# C — Round 3 ვერიფიკაცია (C-R2-01/02 fixes, SRW-05 Loop, SRW-06 multi-select)

თარიღი: 2026-10-07 · ვერიფიკატორი: C · ობიექტი: A-ს round 3 (`a-round-3.md`), კოდი `375ee3b` (arrangement path-ები HEAD `cc1e531`-მდე უცვლელია)

**შედეგი: FAIL.** 18 acceptance დამოუკიდებლად დადასტურდა. სამი ჩავარდა:
- **RF3-1** — ვიდეოს drift-ის ტოლერანსი;
- **R5-L6** — ვიდეო loop-ის wrap-ებზე;
- **RF3-2** — ვიწრო ჩავარდნა: hold გადის, `play()`-ის დაგვიანება და პირველი 300 ms-ის drift — არა.

ბაგები:
- 2 High: C-R3-01, C-R3-02;
- 2 Medium: C-R3-04, C-R3-05;
- 2 Low: C-R3-03, C-R3-06.

**მნიშვნელოვანი B-სთვის:** A-მ „not ready“-ში ჩაწერა ის ID-ები, რომლებიც ბრაუზერში არ გაუზომავს. C-მ ისინი გაზომა და **ყველა გავიდა**:
- R5-L3: master tap და brace `projectEnd`-ის მიღმა;
- R5-L5: ხუთივე ქვეპუნქტი;
- R5-E1;
- R6-S2: marquee დაკვრისას;
- R6-S3: ჯგუფური გადატანა ისმის ახალ დროზე.

ჩავარდნები მხოლოდ ვიდეოს sync-ს ეხება.

App source-ს არ შევხებივარ. commit/push/deploy არ ყოფილა. ბრაუზერის side effect-ები მხოლოდ `/studio-lab`-ის დემო state-ია; ჩემი gstack daemon იყენებს `c-browse.json`-ს. ერთხელ დროებით `<input type=text>` ჩავსვი DOM-ში, Ctrl+A-ის guard-ის შესამოწმებლად, და მერე წავშალე.

## 0. მეთოდი

- **Gates:** ყველა ბრძანება თავიდან გავუშვი (`c-round-3/*.txt`).
- **ბრაუზერი:** gstack `/browse`, HeadlessChrome/145.0.7632.6, ახალი daemon. Cookies `''`, `auth_user = null`. Viewport-ები: 1440×900 და 1280×720.
- **Harness:** round 2-ის `setup-base.js`, `ext.js`, `vfc.js`, `r3v1.js`, `r3setup.js`, `v3setup.js` და რეგრესიის სკრიპტები — შეუცვლელად. ახალი სკრიპტები `c-round-3/scripts/`-შია:
  - `mon.js` — playbackRate setter spy, `play()` spy, 100 ms-ზე გრძელი rAF gap-ები, frame gap-ის ანალიზი;
  - `rf32.js` — პირველი Play ყოველ rAF-ზე;
  - `nodes.js` — თითო `AudioBufferSourceNode`-ის start/stop, concurrency, handoff jump;
  - `loopplay.js` — source-ების timing და master tap wrap-ებზე;
  - `l6.js` — ვიდეო loop-ის wrap-ებზე;
  - `c3.js` — UI helper-ები;
  - `pre.js` — G3-R-ის წინაპირობა: გამორთული brace 40.0–40.3-ზე და 2 მონიშნული კლიპი;
  - `geom.js` — layout-ის გეომეტრია.
- **კლავიშები:** რეალური `$B press` (`Control+l`, `Control+z`, `Control+Shift+z`, `Control+a`, `Control+e`, Delete, Arrow-ები, `Shift+ArrowRight`, Space).
- **Pointer gesture-ები:** synthetic `PointerEvent`. gstack drag-ს არ უჭერს მხარს.
- **Drift:** იზომება audio clock-ით, არა rAF ტექსტით.
- **Media:** მხოლოდ საკუთარი სინთეზური fixture-ები `media/`-დან; გარეთ არაფერი აიტვირთა.
- **CPU:** სხვა desktop პროცესების გამო 49–100% იყო. ყოველ run-თან ჩავწერე.

## 1. Gates (G3-1, G3-2)

| ID | შედეგი |
| --- | --- |
| G3-1 | **PASS.** `vitest app/lib/arrangement` → 8 ფაილი, **140/140**. სრული `vitest` → 40 ფაილი, **604/604** (≥ 557 + ახალი). `TSC_EXIT=0`. Build `BUILD_EXIT=0`. Biome owned path-ებზე → 32 ფაილი, diagnostics 0. `./app` → 0 error, 218 წინასწარ არსებული warning |
| R5-U1 / R6-U1 | **PASS.** §6-ის ყველა სახელიანი ტესტი არსებობს და გადის (`vitest-names.txt`): `loop.test` — create/replace/refuse/same-ref, toggle, move, resize (ზედა ზღვარი არ აქვს), deleteTime shift/shrink/remove, `loopTimelinePosition` ×4, plan ×4; `selection.test` — toggle/add, marquee partial/edge/lanes/union, bounds ×2, `moveClips` ×3, `deleteClips`; `video.test` — `videoRateCorrection` ×5 და `videoDriftAction` 0.3; `transport.test` — loop-ის continuous reschedule და toggle-off handoff; `model.test` — `loop: null` და loop-ის undo/redo |
| G3-2 | **PASS.** 4 protected hash = OK (ბოლოს ხელახლა შემოწმდა). Arrangement path-ების diff `375ee3b`-დან HEAD-მდე ცარიელია. Owned non-test ფაილებში აკრძალული პატერნები არ არის: comment-ები, `any`, `as X`, hex ფერები, `fetch`/`apiClient`/`useAuth`/`StudioContext`. ერთადერთი false positive: `accept="video/*"`. **Process შენიშვნა:** იხ. §8 |

## 2. Auth / privacy (G3-3) — PASS

- **Fresh `/studio-lab`:**
  - media: მხოლოდ `/middle-east.mp3`, `/videos/hero/hero-music.mp3` და `blob:`;
  - მთელ სესიაში (3641 request) `studio-token|recording|/api/download|r2|cloudflarestorage` = 0;
  - harness-ის `fetch` hook-ში `auth=true` request = 0.
- **Anonymous `/api/studio-token?product=middle-east&file=a.mp3`** → **401** „Please sign in to access Studio.“
- **ყალბი Bearer** → 500, token არ გაიცა.
- **`/studio/middle-east`** → „Sign in required“; token და R2 request-ები არ არის.
- **Premium auth bypass არ ხდება.**
- **შენიშვნა:** root `CartContext` anonymous `GET localhost:5199/api/cart`-ს აგზავნის Authorization-ის გარეშე: `client.ts:371` header-ს მხოლოდ token-ის არსებობისას სვამს. ეს round 2-შიც იყო და G3-3-ის აკრძალულ სიაში არ შედის.

## 3. Fixes

### RF3-1 — FAIL (C-R3-01)

**Exclusions:** 300 ms start-ისა და clip-ის საზღვრის შემდეგ. Hard seek-ის შემდეგ exclusion-ის დამატება არცერთ verdict-ს არ ცვლის.

**ფიქსირებული წესები ყველა 20 run-ში დაცულია:**
- `currentTime`-ის ჩაწერა `seeking`-ის დროს = **0**;
- rate ∈ [0.85, 1.15]; Pause-ის შემდეგ ზუსტად 1;
- `muted` ყოველთვის `true`; `<video>` = 1.

C-R2-01-ის ორი მექანიზმი გაქრა: seek-while-seeking და learned lead.

**R3-V1 — 5/15.**

| run | median | max | sets / while seeking | worst frame gap | rate / pause | int max ms | rAF>100 | waiting | CPU% | |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0.033 | **0.108** | 2/0 | 0.08 | 1–1.15 / 1 | 278 | 0 | 0 | ~49 | FAIL |
| 2 | 0.023 | **0.107** | 2/0 | 0.095 | 1–1.15 / 1 | 303 | 0 | 0 | — | FAIL |
| 3 | 0.043 | **0.349** | 7/0 | **0.615** | 0.85–1.15 / 1 | 293 | 1 | 5 | — | FAIL |
| 4 | 0.022 | 0.067 | 3/0 | 0.095 | 0.85–1.15 / 1 | 282 | 0 | 1 | 80 | PASS |
| 5 | 0.031 | 0.097 | 2/0 | 0.105 | 1–1.15 / 1 | 286 | 0 | 0 | 66 | PASS |
| 6 | 0.031 | 0.081 | 2/0 | 0.095 | 1–1.15 / 1 | 281 | 0 | 0 | 100 | PASS |
| 7 | 0.031 | **0.288** | 2/0 | 0.215 | 1–1.15 / 1 | 293 | 1 | 0 | 85 | FAIL |
| 8 | 0.031 | **0.115** | 2/0 | 0.15 | 1–1.15 / 1 | 280 | 0 | 0 | 72 | FAIL |
| 9 | 0.026 | **0.313** | 3/0 | 0.255 | 1–1.15 / 1 | 414 | 5 | 1 | 73 | FAIL |
| 10 | 0.028 | **0.143** | 2/0 | 0.11 | 1–1.15 / 1 | 285 | 0 | 0 | 100 | FAIL |
| reload 1 | 0.042 | **0.290** | 4/0 | **0.49** | 0.85–1.15 / 1 | 320 | 0 | 3 | 71 | FAIL |
| reload 2 | 0.032 | 0.076 | 1/0 | 0.10 | 1–1.15 / 1 | 274 | 0 | 0 | 68 | PASS |
| reload 3 | 0.041 | **0.237** | 2/0 | 0.14 | 1–1.15 / 1 | 287 | 2 | 1 | 70 | FAIL |
| reload 4 | 0.048 | **0.429** | 3/0 | **0.575** | 1–1.15 / 1 | 283 | 0 | 2 | 66 | FAIL |
| reload 5 | 0.031 | 0.083 | 1/0 | 0.11 | 1–1.15 / 1 | 283 | 0 | 0 | 54 | PASS |

**R2-V3 — 3/5.**

| run | median | max | frame gap | CPU% | |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.012 | 0.044 | 0.095 | 60 | PASS |
| 2 | 0.035 | 0.063 | 0.095 | 56 | PASS |
| 3 | 0.037 | 0.071 | 0.11 | 82 | PASS |
| reload 1 | 0.022 | **0.103** | 0.085 | 68 | FAIL |
| reload 2 | **0.141** | **0.293** | **0.375** | 62 | FAIL |

Layout ზუსტია: 0.5–1 off 0.5 · 1–2 off 2.0 · 2–5.008 off 3; SFX 0–1, 1–4.

**Starvation re-run:** არცერთი არ ჩაითვალა. ყოველ ჩავარდნილ run-ში არის ჩავარდნილი sample, რომელთანაც starvation არ ჩანს. მაგალითად:
- run 9: 0.47 და 0.739-ზე rAF gap-ი არ არის; starvation მხოლოდ 11.8 წმ-ზეა;
- run 7: ჩავარდნა 5.71-ზეა, gap კი 6.45-ზე.

**მექანიზმი (B-სთვის, არა fix):**
- **(ა) Hard-seek cascade.**
  - headless-ში running seek 0.3–0.9 წმ-ს იღებს;
  - lead = 0.15, ამიტომ seek 0.15–0.5 წმ-ით უკან ეცემა;
  - |d| > 0.3 ახალ seek-ს იწვევს;
  - frame იყინება ≤ 0.615 წმ-ით (r3v1_3, reload_1/4, v3play_reload_2).
- **(ბ) Soft-sync-ის ჭერი.**
  - 1.15-ზე video წამში მხოლოდ 0.15 წმ-ს იბრუნებს;
  - (0.1, 0.3) ჩამორჩენა 0.3–1.3 წმ რჩება hard-seek-ის ზღვარს ქვემოთ;
  - run 7/8/10 ასე ჩავარდა, მხოლოდ start/boundary seek-ებით;
  - გამავალ run-ებშიც rate დროის უმეტესობას 1.1–1.15-ზეა: video სისტემურად ჩამორჩება.
- **(გ) Continuous საზღვარი.**
  - `ArrangementVideoDock.tsx:176` hard-seek-ს უშვებს `clipChanged && |d| > 0.08`-ზე, continuous same-source საზღვარზეც;
  - D-16 rule 4 ამას მხოლოდ non-continuous საზღვარზე ან |d| > 0.3-ზე უშვებს;
  - v3play_reload_2: seek 2.03-ზე (1–2 off 2 → 2–5.008 off 3) და cascade.
- ეს B-ის კონსტანტების საკითხია: clamp 1.15 vs threshold 0.3, lead ≤ 0.15. Headless VP9 სავარაუდოდ აზვიადებს სიმპტომს, მაგრამ მეტრიკა როგორც წერია, ისე ჩავარდა. Tech Lead-ის რეალური Chrome-ის შემოწმება დარჩა.

### RF3-2 — FAIL, ვიწრო (C-R3-03, Low)

3 fresh load. AudioContext Play-ის click-ზე იქმნება და ctx 300–740 ms wall გაყინულია.

| | run 1 | run 2 | run 3 |
| --- | --- | --- | --- |
| hold (`ctx < startAt`): max \|vt\|, წინსვლა, paused | 0 / 0 / ყველა (41 sample) | 0 / 0 / ყველა (19) | 0 / 0 / ყველა (16) |
| `play()` − startAt (ctx) | **22 ms** | **30 ms** | **30 ms** |
| max \|d\| Play click → +300 ms wall | 0 (მთლიანად hold) | 0 | 0.0007 |
| max \|d\| audio startAt → +300 ms | **0.077** | **0.089** | **0.089** |

**შეფასება:**
- hold ნაწილი გადის და C-R2-02-ის სიმპტომი გაქრა: video audio-ს აღარ უსწრებს;
- „≤ 1 frame“ (16.7 ms) არ სრულდება;
- ≤ 0.06 ზღვარი ერთადერთი არაცარიელი წაკითხვით (audio start-იდან) არ სრულდება;
- „Click-იდან“ წაკითხვით ფანჯარა მთლიანად hold-შია, ამიტომ ტრივიალურად გადის;
- A-მაც იგივე ჩაწერა.

## 4. SRW-05 Loop

| ID | გაზომილი | შედეგი |
| --- | --- | --- |
| R5-L1 | ცარიელ მდგომარეობაში ღილაკი disabled-ია; Ctrl+L → „Loop-ისთვის ჯერ მონიშნე მონაკვეთი ტალღაზე.“ Range 2–4 + **რეალური Ctrl+L** → brace 2–4, `aria-pressed=true`, readout `Loop 00:02.000 — 00:04.000`, „Loop შეიქმნა და ჩაირთო…“; range რჩება. Range 6–8 + Ctrl+L → **1 brace** 6–8, „Loop ჩანაცვლდა ახალი მონაკვეთით…“. Undo → 2–4, Redo → 6–8. Range-ის გარეშე Ctrl+L → toggle. Zoom 200-ზე range 0.06 → „…მინიმუმ 0.1 წამი…“, brace უცვლელია | PASS |
| R5-L2 | Off: dashed `border-muted`, „Loop off“, readout `… · off`, `aria-pressed=false`, „…დიაპაზონი შენარჩუნებულია.“ On: იგივე 6–8, „Loop ჩართულია.“ ღილაკის click-იც toggle-ავს | PASS |
| R5-L3 | Loop 2–4, music @0, impact @3, Play 1.0-დან, 3 wrap. **Source-ები:** <br>• iteration 0: music off 1 dur 3, impact dur 1 (წყდება 4-ზე); <br>• iteration ≥ 1: music off 2 dur 2, impact off 0 dur 1; <br>• `start()` 0.49 წმ (music) / 1.49 წმ (impact) ადრე; ერთადერთი 0.05 iteration 0-ის ჩვეულებრივი Play lookahead-ია; <br>• seam `when(k+1) − end(k)` = **0.000**; <br>• max concurrent თითო clip-ზე = 1. <br>**Master tap** wrap ±50 ms, 5 ms ფანჯრები: min **−29.5 dBFS** (არსად −60-თან ახლოს). Readout პირველი wrap-ის შემდეგ [2.011, 3.990]-შია. **Brace 4–7, projectEnd 5:** 5-ზე არ ჩერდება, 5–7 სიჩუმეა, 7 → 4.0 wrap ორჯერ | PASS |
| R5-L4 | კიდე +1 → 6–9. ზოლი +2 → 8–11 (სიგრძე იგივე). რეალური → / ← / ← / Shift+→ → 8.1–11.1 / 8–11 / 7.9–10.9 / 7.9–11. 7 Undo ზუსტად აბრუნებს თითო gesture-ს და კლავიშს. +1 და უკან gesture და 1 px drag ჩანაწერს არ ქმნის. pos 20 არ შეცვლილა; range null; კლიპების nudge არ მომხდარა. დაბლოკილი ← (start 0) → „Loop ვეღარ გადაიწევს…“, ჩანაწერი არ არის. `role=group`, `tabIndex=0`; aria-label-ში დრო და მინიშნებაა | PASS |
| R5-L5 | (ა) Play 6-დან, loop 2–4: 1 source, readout 6→7.5, უკან სვლა არ არის. (ბ) Toggle off loop-ის დროს (mapped 2.61): ახალი music source off **2.6107** = წინა timeline, jump **0.0000**. Pending iteration-ის impact `stop` ჟღერადობამდე მოხდა; concurrency 1; linear 4.96-მდე. (გ) Brace-ის drag დაკვრისას: 7 re-anchor, ყველა jump 0.0000; შემდეგ wrap 5→3. (დ) Delete Time 1–2 → brace **1–3**. Delete Time 1.05–3.5 → brace ქრება, status: „…Loop-ის დიაპაზონი წაშლის შემდეგ 0.1 წამზე მოკლე დარჩა, ამიტომ მოიხსნა.“ Undo აბრუნებს 1–3-ს. (ე) 10 რეალური Space loop-ში: max concurrent 1 (music და impact) | PASS |
| R5-L6 | იხ. C-R3-02 | **FAIL** |
| R5-E1 | Loop on → WAV 101.352 წმ, 24-bit, 48 kHz, stereo. Loop off → იგივე frames. **maxDiff = 0** (≤ 2⁻²²). Dialog: „Loop ექსპორტს არ ცვლის — იქმნება მთელი პროექტი (00:00.000 — 01:41.352).“ | PASS |

## 5. SRW-06 multi-select

| ID | გაზომილი | შედეგი |
| --- | --- | --- |
| R6-S1 | Ctrl+click v1 (header), v2 (body), music (header) + Shift+click impact → „4 კლიპი მონიშნულია“, 4 ring. Ctrl+click v2 → 3. Shift+click წევრზე → კვლავ 3. pos, Undo label უცვლელია; 0 source. Ctrl+click range-ს ასუფთავებს | PASS |
| R6-S2 | Marquee video@7 → sfx@3.5 → {v1, music, impact}. Rectangle drag-ის დროს ჩანს, release-ზე ქრება. pos, range, Undo უცვლელია. 6.5→8.000 და 7→6.008 (მხოლოდ კიდეზე შეხება) → ცარიელი. Ctrl+marquee → {v2} ∪ {impact, slow}. Click < 4 px → seek 25, selection ქრება. **Marquee დაკვრისას:** playhead მონოტონურია (2.21→3.60), 0 start/stop | PASS |
| R6-S3 | ჯგუფის header drag +2 (v2, impact, slow) → 10/5/16; music 0; „გადატანა (3)“. რეალური →, →, ← → +0.1 / +0.1 / −0.1. 4 Undo → ორიგინალი. Blocked v1+impact +3 → **1.992** / 4.992, „ჯგუფის გადატანა შეჩერდა…“; 1 Undo აბრუნებს. ← 0-ზე → status, ჩანაწერი არ არის. **დაკვრისას:** impact timeline **5.000**-ზე ისმის; ძველი source ჟღერადობამდე გაჩერდა; music jump 0. Video v2 9-ზე: source offset 0, vt 9.5-ზე = 0.500 | PASS |
| R6-S4 | {v1, impact, slow} + Delete → მხოლოდ ეს 3 იშლება, დანარჩენი არ მოძრაობს; „კლიპების წაშლა (3)“; Undo აბრუნებს. Range-ით Delete Time-ის ქცევა უცვლელია | PASS |
| R6-S5 | რეალური Ctrl+A → 5/5. Add → Ctrl+A (6) → Undo → 5, ring 5. Ctrl+E ≥ 2-ზე → „ჯგუფზე გაყოფა ჯერ არ არის…“, history უცვლელია (✂ ღილაკიც). წევრის trim → 1 ring, „Trim — მარჯვენა კიდე“. Ctrl+A text input-ში → selection 1 რჩება; input-ის ტექსტი მოინიშნა | PASS |

## 6. რეგრესია (G3-R) — PASS

ყველა run-ის წინ გამორთული brace 40.0–40.3 იყო. სადაც ≥ 2 კლიპი არსებობდა, 2 კლიპი იყო მონიშნული.

| ID | შედეგი |
| --- | --- |
| R2-V1 | Picker 0–6.008; drop → 6.008–10.016; Undo შლის მხოლოდ მე-2-ს; Redo აბრუნებს იგივე id-ს; peaks დაიხატა; binary send 0 |
| R2-V2 | wav (ტიპიანი და ცარიელი MIME), broken.mp4, .pdf, webm/wav music-ზე → rejection-ები, history უცვლელი. Empty-MIME `.mov`, MP4, MOV, no-audio MP4 → მიიღება. Stray header drop → prevented |
| R3-V2 | Video M → beep ფანჯრები −240. Unmute → პირველი ხმოვანი ბლოკი 0 ms-ში. M/S toggle-ზე start/stop 0. Solo music → video −240 |
| R3-V3 | Video-only oracle **5.96e-8**; onsets 2.5…6.5; wrong-offset diff 0.507. Muted = music oracle. noaudio: 2.000 წმ სიჩუმე, შენიშვნა ჩანს. AAC: 5.96e-8, onsets 0..5 |
| R3-V4 | 10 რეალური Space → stopped, video paused, 25 starts / 25 stops (5 × 5), `<video>` = 1. +1 Space → playing, vt − target = 6 ms |
| R4-P1 | Stopped drag → 3.000, vt 4.000. ←/→ → 3.1 / 2.9. დაკვრისას drag: **12 throttled reschedule + 1 release** (15 დისტინქტური ctx-დროიდან ორი წყვილი 2.67 ms-ით, ანუ ერთ render quantum-ზე, იყოფა) ≤ 14. Undo უცვლელია |
| R4-P2 / P3 | Body-range დაკვრისას მონოტონურია, 0 source. Pause/resume offset-ები. Home დაკვრისას → 0.11 (5 start / 2 stop). Stopped Home → 0. Home text input-ში → 2.5 |
| R1-E1 / E5 / E3 / B5 / B11 / B12 | E1 15.000 წმ, 0–2 −240, 4–5 −240. E5 oracle 5.96e-8. E3 residual 1.19e-7. B5 diff 0 და undo ზუსტია. B11 muted −240, unmute 0 ms. B12 handoff 0 sample |

## 7. G3-shots — PASS (შენიშვნებით)

ფაილები: `c-round-3/shot-{1440x900,1280x720}-{selection,range,marquee}.png`.

**Layout:**
- Brace-ის ზოლი (16 px) ruler-ის ქვემოთაა; time 0-ზე dx = 0.
- Video dock 288 px; footer-თან გადაფარვა არ აქვს.
- Document scroll = viewport.
- Loop readout-ს overflow არ აქვს.

**Overlay-ების გარჩევა:**
- Brace ცალკე ზოლშია.
- Range = ნაცრისფერი overlay + tag.
- Selection = teal ring.
- Playhead = amber ხაზი + ruler-ის handle.
- Marquee = teal ჩარჩო.

**შენიშვნები:**
- Brace-ის border და playhead ერთი accent ფერია (`rgb(249,169,31)`). Marquee და ring ერთი brand teal-ია. ფორმითა და მდებარეობით მაინც გაირჩევა; tokens-only შეზღუდვა A-ს ავალდებულებდა.
- Root cookie banner ორივე ზომაზე ფარავს footer-ს (status და selection count). 1440×900-ზე dock-ის ქვედა 19 px-საც ფარავს. ეს წინასწარ არსებული root საკითხია.
- Layout shift: C-R3-06.

## 8. Root pre-push review და publication — დარჩენილი საკითხები

**Root review-ის finding-ები:**
- **L1** (Undo gesture-ის დროს) რეპროდუცირდა ორ ბაგად: C-R3-04 და C-R3-05.
- **L3** (Delete repeat) საზიანოდ არ რეპროდუცირდა: Delete Time-ის შემდეგ range იშლება.
- **M1** (ფონური tab-ის დროს loop შიმშილობს) headless-ში ვერ რეპროდუცირდება. რჩება კოდის დონის რისკად B-სთვის.
- **M2** (ყოველ frame-ზე context re-render) არ გაზომილა. C-R3-01-ის სავარაუდო თანაფაქტორია.
- **L2, L4, L8** არ დატესტილა.
- **M3** (doc 012-ის სიზუსტე) გასწორებულია: TODO-ში ახლა არის RF3-1, R5-L3, R5-L5, R5-E1, R6-S2 და R6-S3.

**Process (Tech Lead-ისთვის):**
- სესიის დროს HEAD გადავიდა `cc1e531`-ზე: „chore(store): add agent instructions and align Studio purchase access“.
- ეს commit შეიცავს 4 protected purchase/auth ფაილს და `.agents/ .codex/ AGENTS.md`-ს. ეს ეწინააღმდეგება root-pre-push-review §3-ს და checkpoint-ის „none were staged“-ს.
- ფაილების შიგთავსი baseline sha256-ს ემთხვევა. Runtime-ზე: anonymous 401, fake bearer 500, „Sign in required“.
- A-ს ბაგი არ არის.

**Export observation (SRW-13/FB-14, round-ის ბაგი არ არის):**
- Music + impact export-ში 104 sample სრულ scale-ზეა; მათგან 74 მე-3 წამზე, impact-ისა და music-ის ჯამში.
- Master headroom და overload indicator არ არსებობს.

## 9. ბაგები B-სთვის

### C-R3-01 (High) — RF3-1-ის ტოლერანსი არ სრულდება

- R3-V1: 5/15; R2-V3: 3/5.
- მექანიზმები: §3 (ა)–(გ).
- Evidence: `c-round-3/r3v1_*`, `v3play_*`, `*.log`.

### C-R3-02 (High) — R5-L6: ვიდეო loop-ის wrap-ებზე, 0/5

- **Median:** 0.092 / 0.036 / 0.039 / 0.033 / 0.075.
- **Max:** 0.719 / 0.280 / 0.206 / 0.111 / 1.329.
- **ჩვეული wrap:**
  - seek-ის target = loop.start + 0.15;
  - ეცემა 0.1–0.28 წმ-ით უკან;
  - ბრუნდება მხოლოდ 1.15 rate-ით.
- **l6_5:**
  - wrap seek დაბლოკა 6.518-ის pending seek-მა;
  - 7.0-ის შემდეგ ~0.85 წმ video loop.end-ის მიღმა კადრებს აჩვენებდა (d = +1.33 7.34-ზე).
- Audio wrap-ები სწორია.
- Evidence: `l6_*.json`, `r5-l6.log`.

### C-R3-03 (Low) — RF3-2

- `play()` startAt-იდან 22–30 ms-ში იძახება (> 1 frame).
- \|d\| audio start-იდან 300 ms-ში 0.077–0.089-ს აღწევს.
- Hold OK.
- Evidence: `rf32_*.json`.

### C-R3-04 (Medium) — Ctrl+Z brace-ის drag-ის დროს

**Repro:**
1. Brace drag შუაში Ctrl+Z → loop ქრება და brace unmount-დება.
2. Pointer-ის release.
3. ვიდეოს import.

**შედეგი:** import ~30 წმ ჩერდება („იხსნება…“); clip 39.8 წმ-ში ჩნდება. Fresh control: 1.6 წმ.

Evidence: `root-findings.log`.

### C-R3-05 (Medium) — Ctrl+Z clip-ის drag-ის დროს გაუქმებულია

**Repro:**
1. Clip header drag შუაში Ctrl+Z.
2. Drag-ის გაგრძელება და release.

**შედეგი:**
- Gesture-ის stale `before` snapshot-ის commit აბრუნებს გაუქმებულ loop-ს;
- Redo stack იშლება;
- „Loop შეიქმნა“ ჩანაწერი history-დან ქრება;
- History არათანმიმდევრული ხდება.

Evidence: `root-findings.log` (L1d).

### C-R3-06 (Low) — Transport-ის layout shift

- Delete ღილაკის label იცვლება კლიპის მონიშვნისა და range-ის მიხედვით.
- ამის გამო ↻ Loop და readout transport-ის რიგებს შორის ხტება: 1440-ზე (1206,51) → (12,91); 1280-ზეც.
- Evidence: `shot-*-selection.png` vs `shot-*-range.png`.

## 10. FB, Ableton და პროდუქტის flow

**Ableton** (`ableton-live-current-workflow.md`):
- LOOP-01, LOOP-02, LOOP-03, LOOP-04 = დადასტურდა.
- **LOOP-05** — ნაწილობრივ (⚖). ←/→ ანაცვლებს. სიგრძე Shift+←/→-ით იცვლება; Ableton-ში ეს Ctrl+←/→ და ↑/↓-ია.
- **LOOP-06** — ახლა Ableton-ს ემთხვევა: loop-ის გარეთ Play linear-ია, wrap უწყვეტია.
- CLP-06, CLP-07, EDT-03 და TRN-03 (range დაკვრისას playhead-ს არ ამოძრავებს) = დადასტურდა.
- CLP-08 ამ რაუნდში არ არის.

**FB:**
- **FB-16:** ერთიანი transport და ვიდეოს ხმა graph-ით მუშაობს; sync-ის ტოლერანსი ჩავარდა.
- **FB-15 და FB-02:** რეგრესია PASS.
- **FB-01:** brace-ს ზედა ზღვარი არ აქვს და projectEnd-ის მიღმაც ტრიალებს.
- **FB-03..FB-14:** scope-ს გარეთაა, PASS არ ჩაითვლება.

**Flow „find → add → fit video → export“** დემო ბიბლიოთეკაზე მუშაობს:
- import;
- trim, split, Delete Time ზუსტი offset-ებით;
- loop-ით მონაკვეთის მოსმენა;
- multi-select: SFX ვიდეოსთან ერთად გადაიტანება;
- export: WAV oracle-ს უდრის.

ძიება და preview ჯერ არ არის (SRW-12).

## 11. არტეფაქტები და reproduce

`tmp/studio-real-loop/c-round-3/`:
- **Gates:** `vitest-*.txt`, `vitest-names.txt`, `tsc.txt`, `biome-*.txt`, `build.txt`, `git-status-final.txt`, `hashes-final.txt`.
- **Network:** `network-fresh.txt`, `network-session.txt`.
- **Drift:** `r3v1_*.json`/`.summary.json`, `v3play_*`, `rf32_*`, `l6_*`, `*.log`.
- **Loop/selection:** `r5-l1.log`, `r5-l3.log`, `r5-l3b.log`, `r5-l4.log`, `r5-l5.log`, `r5-l6.log`, `r5-e1.log`, `r6.log`.
- **რეგრესია:** `g3r.log`, `g3r-*.json`.
- **Root finding-ები:** `root-findings.log`.
- **Screenshot-ები:** `shot-*.png`, `shots.log`.
- **Script-ები:** `scripts/*.js`, `b.sh`, `j.sh`, `prep.sh`, `setup-r3.sh`, `setup-v3.sh`, `setup-loop.sh`, `run1.sh`.

**Reproduce:**
- Drift: `bash c-round-3/setup-r3.sh && bash c-round-3/run1.sh <key>`.
- Loop: `bash c-round-3/setup-loop.sh`, შემდეგ `j.sh`-ის ბრძანებები ლოგებიდან.
