# C round 27 — SRW-13 ეტაპი 2b: ხაზის მეტრები lane header-ში (დამოუკიდებელი შემოწმება)

**თარიღი:** 2026-10-11 (live, სესია 1) · 2026-10-12 (offline, სესია 2) · **შემმოწმებელი:** C
**საბოლოო სტატუსი:** **FAIL** — ერთი რიცხვითი oracle (R27-RB drift) ბიუჯეტში ვერ შესრულდა; რამდენიმე ქვე-შემოწმება ვერ გაეშვა, რადგან dev server გაჩერდა.

## 0. სესიების ისტორია (გულახდილად)

- **სესია 1 (10-11, 12:10–13:40)** ჩემი წინა C სესიაა. მან გაუშვა gate-ები და live გაზომვების უმეტესობა. 13:40-ზე API-ის `ECONNRESET`-ით შეწყდა, ანგარიშის დაწერამდე (`c-round-27-result.json`). Run-ები `c-round-27/runs/`-შია.
- **სესია 2 (10-12, ~12:15)**: ხე ხელახლა გავზომე. HEAD `c5ed47b`, `b-round-26-tree-sha256` **60 OK**, `git status` **62** ხაზი. ის **იდენტურია** 10-11-ის start-ისა, owned 9 ფაილის sha-ც იგივეა (`gates/*-now.txt`). ამიტომ 10-11-ის live run-ები ამ ხეზე დასაშვები მტკიცებულებაა.
- **Dev server `127.0.0.1:5173` გაჩერებულია.** პორტზე არაფერი უსმენს, curl → `000`. ამოცანა server-ის გაშვებას კრძალავს. ამიტომ დარჩენილი live ქვე-შემოწმებები **არ გაშვებულა** (§10). ჩემი gstack server, რომელიც ამ სესიაში გაეშვა, გავაჩერე.

## 1. შედეგები ID-ების მიხედვით

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| G27-1 | **PASS** (flake-ის შენიშვნით, C-R27-02) | `gates/tsc.txt`, `vitest-*.txt`, `biome-app.txt`, `build.txt` |
| G27-2 | **PASS** | `gates/*-start.txt`, `gates/*-now.txt` |
| G27-3 | **PASS** | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| R27-TL | **ნაწილობრივ:** music ×3, stems, video — PASS. SFX — მხოლოდ onset-ის ფანჯარა; decay-ის ფანჯრები literal oracle-ს არ აკმაყოფილებს (§3) | `runs/tl-*.json` |
| R27-TI | **PASS** (levels + discrimination; video floor-ის დრო ზუსტად არ გამოთვლილა) | `runs/ti-812-1.json`, `ti-08-1.json` |
| R27-TM | **PASS** | `runs/tm-mute-1..3.txt`, `tm-solo-stems.txt` |
| R27-TV | **PASS** | `runs/tv-050.json` vs `ti-812-1.json` |
| R27-TW | **PASS** | `runs/tw-m6.json`, `tw-m6-dom.json` |
| R27-TO | **ნაწილობრივ:** latch და cue — PASS; reset ასუფთავებს — PASS; „Redo stack ხელუხლებელია“ live-ში არ შემოწმდა | `runs/to-persist.txt`, `to-cue-colors.json`, `tw-m6.json` pre, `rb-browser.json`, `shots/headers-*` |
| R27-TR | **PASS** | `runs/tr-mastermute.txt`, `afterPauseSync` ყველა run-ში |
| R27-TF | **PASS** | `runs/ti-812-1.json` (1440 full), `tf-1280-video.json`, `tf-1280-music.json`, `tf-folded-sfx.json`, `shots/folded-1440-playing.png` |
| R27-RB | **FAIL:** render oracle PASS, cost/drift oracle FAIL → **C-R27-01** | `runs/rb-browser.json`, `vm-*.txt`, `cost-ab.txt`, `tick-cost.txt` |
| R27-E | **ნაწილობრივ:** ფაილი PASS. OfflineAudioContext-ის node-ების რაოდენობა live-ში არ გაზომილა (მხოლოდ static + unit) | `runs/export-E0.txt`, `shots/export-E0.png` |
| R27-K | **ნაწილობრივ:** 1280 PASS; 1440 და Space-on-M არ გაშვებულა | `runs/k-1280.txt` |
| R27-L | **ნაწილობრივ:** header, transport, rows, scroller, rect-ები და band — PASS; floating video-ს რიცხვები არ ჩაწერილა | `runs/geo-*.json`, `p2a-*.txt`, `shots/headers-*` |
| R27-R | **ნაწილობრივ** (§9) | — |
| R27-S | **PASS** | `gates/snap-*-start.diff` (sha-ით = now) |
| R27-U | **PASS** | `runs/r27u-mut-*.txt/.diff`, `mut27.py` |
| R27-Doc | **PASS** | doc 033 |
| C-R23-01 | ჩანაწერი (არც PASS, არც FAIL) | `runs/c-r23-01-*.txt`, `ssr-1..3.html` |

## 2. Gate-ები

**G27-1** (ჩემი გაშვებები):
- `tsc` exit 0.
- ახალი 3 ფაილი: **36/36**. ახალი `it` ბლოკი **24** (13 + 11), ≥16 ✓.
- სრული `vitest`: **63 ფაილი, 1096/1096** (= 1072 + 24).
- Biome `./app`: 0 error, **218 warning + 1 info** (= r26). Owned 8 ფაილზე `No fixes applied`.
- `npm run build` exit 0.
- **Frozen 8 batch-ად:** run1 **151/152** (track-layout fold test timeout 5000 ms), run2 **150/152** (იგივე timeout და `render-budget` „start hold releases“: `expected 0.051 to be +0`), run3 (10-12) **152/152**. ცალკე: track-layout 36/36, render-budget 7/7 ×2. ორივე ტესტი გაყინულ sha-სიაშია და უცვლელია. → **C-R27-02** (Low).
- `meter-ui.test.tsx`: მწვანეა; diff = ზუსტად 5 count-ის ხაზი (R27-S).

**G27-2:** protected 4/4 OK. `b-round-26` **60 OK**. `git status` = c26-ის 58 ხაზს დამატებული ზუსტად 4 `??` ხაზი §3.2-დან (62). `Header.tsx`: cc1e531-თან +21/−0, HEAD-თან ცარიელი. Forbidden paths-ის status ცარიელია. ორჯერ გაიზომა (start და now), შედეგი იდენტურია.

**G27-3:**
- ანონიმური `/studio-lab`, პირდაპირ და header link-ით: `auth_user` null, cookie ცარიელი, 4 ხაზის მეტრი და Master ჩანს. Media მხოლოდ `middle-east.mp3` და `hero-music.mp3`-იდან.
- `network-anon-*.txt`: არ ჩანს `/api/studio-token`, `/api/recording-*`, `/api/download`, R2 host ან `Authorization`. დაშვებულია მხოლოდ dev-module `GET /app/lib/r2.config.ts`.
- Session hook (დაკვრა მეტრებით + ექსპორტი): fetch მხოლოდ GA (consent denied), xhr 0, auth 0.
- Curl: ანონიმური token → **401**. Fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (ცნობილი root item).
- `/studio/middle-east` → „Sign in required“, მეტრები 0.
- Reset-ის დროს ქსელი ცალკე არ დამიჭერია. Static-ად `resetMasterPeak`-ში ქსელის კოდი არ არის.

## 3. R27-TL — solo-ზე ხაზის მეტრი vs tap (Master 0 dB)

გვერდიდან წაკითხული: `fftSize` **4096**, `sampleRate` **48000**, `AnalyserNode` **10**, splitter **5** (lay11). Tap = sp22 raw post-master; ფანჯარა `[t0 − 0.0853, t1]`.

| run | ფანჯარა | ხაზის max | tap max | Δ |
|---|---|---|---|---|
| music 1/2/3 | 8.2–9.2 | −4.7 / −4.7 / −4.7 | −4.716 | ≤0.02 |
| music 1/2/3 | 9–10 | −5.3 ×3 | −5.284 | ≤0.02 |
| music 1/2/3 | 10–11 | −5.3 ×3 | −5.320 | ≤0.02 |
| stems | 8.2–9.2 / 9–10 / 10–11 | −10.6 ×3 | −10.554 | 0.05 |
| video | 0–1 / 1–2 | −5.9 / −5.9 | −5.893 / −5.915 | ≤0.02 |
| SFX 1 / 2 | 4–5 | 0.0 / 0.0 | 0.0 | 0 |
| SFX 1 / 2 | 5–6 | −18.5 / −18.9 | −25.84 / −26.27 | **7.3** |
| SFX 1 / 2 | 6–7 | −38.5 / −38.6 | −53.85 / −54.06 | **15.4** |

- Music run 3-ის gap-ები (66.8 ms 9.91-ზე) peak-ს არ ემთხვევა. Run ვალიდურია (წინასწარ რეგისტრირებული წესი).
- **SFX-ის decay-ის ფანჯრები:** `Soft impact` 20 dB/s-ზე სწრაფად ქრება. მეტრის release (20 dB/s, round 26-ის დიზაინი, spec 12–30) ამიტომ tap-ზე მაღლა რჩება. **Master-ის მეტრი ზუსტად იგივეს აჩვენებს** (−18.5/−38.5). ეს ballistics-ია და არა per-track ბაგი. Release-ის მოდელი (`tl-sfx-2-model.json`, n=160): p50 0.03 dB, p95 0.11 dB; ერთადერთი outlier onset frame-ია 4.002-ზე. Floor 7.09-ზე, oracle-ის ზღვარი 7.17 (L0 −38.6). B-ის literal ±1.0 dB oracle გარდამავალ წყაროზე არ გამოდგება. **Oracle-ს არ ვასუსტებ:** SFX-ის decay ფანჯრებს PASS-ად არ ვწერ. B-მ oracle უნდა გადაწეროს: დასაშვები ფანჯრებია sustained ფანჯრები ან release-ის მოდელი.

## 4. R27-TI — unsoloed, Master 0 dB

- 8–12 (`ti-812-1`): music −4.7/−5.3/−5.3, stems −10.6 ×3. ორივე = solo, Δ 0.0 ✓.
- 0–8 (`ti-08-1`): video 0–1/1–2 −5.9 = solo. SFX 4–5 **0.0**, 5–6 −18.5, 6–7 −38.6, 7–8 −58.5. Solo: 0.0/−18.5…−18.9/−38.5…−38.6/−58.4…−58.5. Δ ≤ 0.4 ✓.
- **Discrimination ✓:** 8.2–9.2 Master −1.5, music −4.7 (Δ 3.2 dB). 4–5 Master **+5.0**, SFX 0.0 (Δ 5.0).
- SFX `-inf` 0–4 ✓. Floor-ის დრო solo მოდელით: 7.09 ≤ 7.17 ✓.
- Video floor 6.008-ის შემდეგ: ბოლო playing frame 8.019-ზე `-inf`-ია. ზუსტი floor-ის მომენტი ამ run-ში ცალკე არ გამოთვლილა; ზღვარი ≈ 7.96.

## 5. R27-TM / TV / TW / TR

**TM, music Mute, 3 run:**

| run | click | L0 | floor | ზღვარი | muted-ის დროს არა-floor | stems განსხვავებული მნიშვნ. | Master | unmute-ის აწევა |
|---|---|---|---|---|---|---|---|---|
| 1 | 9.379 | −8.6 | 2605 ms | 2670 | 0 | 42 | −1.5 → −10.6 | 1 frame |
| 2 | 9.179 | −6.5 | 2675 | 2775 | 0 | 62 | −1.5 → −10.6 | 1 frame |
| 3 | 9.179 | −6.5 | 2662 | 2775 | 0 | 46 | −1.5 → −10.6 | 1 frame |

- Run 1-ის 88.9 ms gap 9.441-ზეა, ანუ release-ში და არა L0-ის frame-ზე. Run ვალიდურია.
- **Solo stems:** music floor 2531 ms (ზღვარი 2585) ✓. Video და SFX ამ ფანჯარაში ისედაც ჩუმია.

**TV:**
- music Volume 0.50, ფანჯარა 9–10: **−11.3** vs 1.00-ზე −5.3. Δ **6.0** ✓.
- Master −1.93 → −5.32: Δ 3.4 ≤ 6.5 ✓.
- `newGraphs` 1 = მხოლოდ Play. Volume-ის ღილაკები დაკვრამდე დაჭირდა, როცა graph არ არსებობს. ეს ქვე-oracle ამიტომ მხოლოდ ამ პირობით მოწმდება.
- 1.00 აღდგა: შემდეგ run-ში music −4.7.

**TW, Master −6.0:**
- Master `clear`, `−1.0`; `+`-ით არასდროს იწყება ✓.
- SFX `over`, `+0.0` ✓. Warning cap 1 ✓. sr-only „SFX: დონემ 0 dBFS-ს გადააჭარბა“ ✓.
- `title` §2.4-ის ზუსტი ტექსტია ✓. სხვა ხაზები clear და = solo ✓.

**TR:**
- Pause → ყოველ run-ში ყველა ხაზი `-inf/-inf`, `data-peak` უცვლელი ✓.
- **Master Mute** 9.798-ზე:
  - Master floor 2696 ms (ზღვარი 2800) ✓;
  - ხაზები მოძრაობს: music 52 და stems 53 განსხვავებული მნიშვნელობა, max −4.8/−10.6 ✓;
  - tap 60 ms-იდან unmute-მდე **−999** ✓.

## 6. R27-TO — latch, reset, cue

**Latch** (`to-persist`, მხოლოდ SFX solo, Master 0):
- 4.018-ზე SFX `+0.0 over`, Master `+0.0 over`.
- Over რჩება ყველა ამ მოქმედების შემდეგ: ჩუმი frame-ები; Master Volume ↓↑; reschedule nudge (4 → 4.1) დაკვრისას; Ctrl+Z / Ctrl+Y; Pause/Play.
- Taps 5/10 მუდმივია. ახალი graph-ები 4, tap-ის connect 20 = 4×5 (იგივე tap-ები) ✓.

**Reset:**
- `rb-browser.resetClick`: ყველა `clear`. Render: `mmeter` 1, `tm:SFX` 1.
- `tw-m6` pre და `to-persist` pre reset-ის შემდეგაა: ყველა ხაზი `−∞`/`clear`, cap 0, sr-only ცარიელი. Undo label წინა მოქმედებისაა (`Undo: Solo — SFX`) და არა reset-ის. Status reset-ს არ წერს.
- **არ შემოწმდა:** reset არაცარიელ Redo stack-ზე (Redo ცარიელი იყო).

**Cue:**
- cap `rgb(245,158,11)` = `--warning`; `destructive` არის `rgb(239,67,67)`.
- Shape: 4×4 px cap ზოლის ბოლოში; clear-ზე cap არ არის.
- Screenshot-ები: `headers-1440-over.png`, `headers-1280-over.png`.
- **UX შენიშვნა R27-T-სთვის:** cap ძალიან პატარაა (4 px). ბაგად არ ვწერ.

## 7. R27-RB — render და ღირებულება

**Render** (fiber wrapper; ყველა 10 component wrapped):
- 2 წმ signal-ით: **0** render ✓.
- SFX latch: `tm:SFX` **1**, `mmeter` 1, lane **0** ✓.
- Reset click: `tm:SFX` 1, `mmeter` 1 ✓.
- Play-ის start ყველა component-ს ერთხელ არენდერებს. ეს frame-ის render არ არის და r26-ის ტოლია.

**ღირებულება:**
- `getFloatTimeDomainData` 10.17 call/frame. Read 0.09–0.125 ms/frame (track-ების გარეშე 0.04).
- rAF mean 16.9–17.0 ms, max 41–50 ms.
- tick callback mean 0.42 ms, p95 1.6–1.7, max 3.6/5.1.

**Drift sample → FAIL (C-R27-01):** oracle ≤ 20.1 + 10 = **30.1 ms**, dock-ის counter-ები 0 → 0.

| run | drift max | dock hardSeeks |
|---|---|---|
| vm-1 | **81.7 ms** | 2 / 2 |
| vm-2 | **36.2** | 2 / 2 |
| vm-3 | **46.1** | 2 / 2 |
| vm-4 | 20.6 ✓ | 2 / 2 |
| vm-5 | **41.6** | 2 / 2 |
| ctl, track read-ები ჩანაცვლებული 0-ით | **60.4 / 130.6** | 2 / 2 |
| r26 vm-1 (reference) | 20.1 | 0 / 0 |

ბიუჯეტი (3 + 2) ამოიწურა. Control run-ებიც ცუდია, ამიტომ მიზეზი სავარაუდოდ ხაზის read-ები არ არის. თუმცა r26-ის sample music-muted layout-ზე იყო, r27-ის კი სრულ lay11-ზე. ატრიბუცია ღიაა. Oracle-ს არ ვასუსტებ.

## 8. R27-E, R27-K, R27-L

**R27-E:**
- 864 000 frame, 18.000 s, NaN 0, header თანმიმდევრული, FS **1800**, RMS **−15.481**. Overload alert: „პიკი +5.0 dBFS — 1800 sample…“, role=alert ✓.
- **OfflineAudioContext-ის analyser/splitter:** C-ის `h26` hook მხოლოდ `instanceof AudioContext`-ს ითვლის, ამიტომ offline count live-ში **არ გაზომილა**.
- Static: `renderArrangementWav` diff-ში უცვლელია და `trackTaps`-ს არ გადასცემს. Unit: `track-meter.test.ts`-ის „offline export with no taps“. ფაილის რიცხვები r26-ის ზუსტად ტოლია.

**R27-K, 1280:**
- `← CZABA` → Master Mute → Master Volume → Master Peak → Play → დასაწყისი → Undo → Split → … → video: fold → name → `＋ საკუთარი ვიდეო` → M → S → Volume → სიმაღლე → music: fold → name → M → S → Volume.
- ეს = r26-ის header-ის რიგი და r24-ის lane-ის რიგი ✓. მეტრი არასდროს ფოკუსდება ✓.
- 1440 და Space-on-M **არ გაშვებულა**.

**R27-L:**
- Header **35**, transport **49 / 87** ✓.
- 1440: rows 81×4, scroller 496/604 ✓. 1280: closed 81×4 / 386, open 53/61/61/61 / 280 ✓.
- ოთხივე density-ზე (full 1440, folded 1440, tight/regular 1280 open, 1280 closed):
  - მეტრი `absolute`, header-ის შიგნით, 6 px band-ში (1 px gap). Control-ებთან გადაკვეთა 0. `aria-hidden`, tabIndex −1.
  - `remove()`-ის შემდეგ control-ის rect-ის განსხვავება **0**, header-ის style იგივე.
- Floating video-ს რიცხვები (8,503 272×153) **არ ჩაწერილა**. არსებობს მხოლოდ `fv-1440.png`.

## 9. R27-R (მიმდებარე)

- R26 Master: +5.0 latch 4.019-ზე (≤ 6.5) ✓. −6 dB clear `−1.0` ✓. Pause floor ✓.
- Master Volume −6.0: gain ramp 0.9441 → 0.5012 (ზუსტად −6.0 dB), readout `−6.0 dB` → `0.0 dB` ✓. Tap-ზე Δ ±0.3 ცალკე არ გამოთვლილა.
- Master Mute de-click: tap 60 ms-იდან −999 ✓.
- **არ გაშვებულა:** ხაზის Mute de-click (R22-M1 რიცხვები), loop 8–12 seam, `სრული მიქსი`-ს library drop music-ზე 7-ზე.

## 10. R27-S, R27-U, R27-Doc

**R27-S** (snapshot ↔ live; sha-ით live = start):
- `graph.client.ts`: `trackTaps?` option და `panner.connect(trackTap)` **`panner.connect(master)`-ის შემდეგ**. `renderArrangementWav` და master tap უცვლელია ✓.
- `ArrangementLane.tsx`: import და ერთი `<ArrangementTrackMeter>` header-ის ბოლოს ✓.
- `meter.ts`: მხოლოდ დამატება (`TrackMeterStore`, `floorTrackMeterFrames`, `resetTrackMeterPeaks`, `createTrackMeterStore`) ✓.
- `meter-ui.test.tsx`: ზუსტად 5 ხაზი, ფორმულები fixture-იდან ✓.
- Context: tap factory, sampling `tick`-ში, stop floor, საერთო reset, unmount clear, ცალკე provider და hook-ები. ყველა §2.3-ის ფარგლებშია.
- Grep: არ ჩანს `getByteTimeDomainData`, limiter/normalize/compress, JSX `style=` ან hardcoded ფერი.

**R27-U:**
- `store/app` → `c-round-27/mut/app`, `node_modules` დროებითი junction-ით. Junction მოგვიანებით `rmdir`-ით მოიხსნა; store-ის `node_modules` ხელუხლებელია (618).
- Config: track-meter, track-meter-ui, meter-ui, graph, meter, master-ui. Control **88/88**.
- თითო მუტაცია ზუსტი replace-ია (count == 1), შემდეგ ფაილი აღდგა (`restored-identical True` ×8):

| mutation | ჩავარდა |
|---|---|
| (a) tap `trackGain`-იდან | 2: fan-out-ის რიგი; „only own panner“ |
| (b1) store: ყველა id → ბოლო frame | 5: store independence; UI levels/latch/Pause/render |
| (b2) context: step საერთო წინა state-იდან | 3: UI levels, Pause, render |
| (c) stop ხაზის floor-ის გარეშე | 1: Pause floors |
| (d) reset ხაზების გარეშე | 2: Master Peak clears SFX; render |
| (e) tap `master`-მდე | 1: „master first, then tap“ (ახალი ტესტი; frozen `graph.test` მწვანე რჩება) |
| (f) writer-ის cleanup მოხსნილი | 1: unmount unsubscribe |

A-ს red-first (`a-round-27/red-native.txt`): 22 failed / 36 snapshot-ზე. A-ს scratch-ში junction აღარ არის.

**R27-Doc:** doc 033 ქართულადაა და კოდს ემთხვევა. მოიცავს ყველა ჩამოთვლილ პუნქტს: tap-ის პოზიცია და მიზეზი, fan-out, guard და ღირებულება 5×2×4096, store, warning vs destructive და საერთო predicate, ერთი reset, გეომეტრია, 0-render, Master Mute, R26-M1, amendment, ტესტები, ეტაპები 3/4. დამატებით გულახდილად წერს ხარვეზს L3 (წაშლილი ხაზის tap) ✓.

## 11. C-R23-01 ჩანაწერი

`curl /studio-lab` ×3: 60457 B, **4 NUL** at **28013/28014** (`Arrangement · \0\0მთლიანი პროექ…`) და **58733/58734** (footer `+/\0\0−`).
- r26-ში მეორე წყვილი 44397/44398-ზე იყო (music aria-label). Offset ისევ გადაინაცვლა. ეს ფიქსი არ არის.
- Hydration-ის შემდეგი code point-ები (lane aria-label, sr-only, Master control-ები) **არ ჩაწერილა**, რადგან server გაჩერდა.

## 12. ბაგები B-სთვის

- **C-R27-01 (Medium) — R27-RB-ის drift sample-ის oracle ვერ შესრულდა.**
  - ნაბიჯები: setup.sh + lay11, 1440. `c-round-25/scripts/vm-start.js` → Master Mute 0.5/2.3 → 12× ArrowDown → `vm-an.js`.
  - მოსალოდნელი: drift max ≤ 30.1 ms, dock 0 → 0.
  - ფაქტობრივი: 5 run-დან 4 >30.1 (81.7/36.2/46.1/41.6), hardSeeks 2/2 ყველაში. Control-ები ხაზის read-ების გარეშე: 60.4/130.6.
  - შემდეგი ნაბიჯი: ატრიბუციის run r26-ის layout-ზე (music muted), იმავე ხეზე, მშვიდ Chrome-ში (C-R8-01/C-R6-02-თან ერთად).
- **C-R27-02 (Low) — გაყინული ტესტები batch-ის დატვირთვისას flaky-ია.**
  - ტესტები: `render-budget` „start hold releases“ (`0.051 ≠ 0`) და `track-layout` fold timeout.
  - Frozen-8-ის 3 batch run-იდან 2-ში ჩავარდა. ცალკე და სრულ suite-ში მწვანეა.
  - A-მაც დაინახა. r26-ში არ ჩაწერილა. მიზეზი უცნობია: ან დატვირთვა, ან frame-ზე დამატებული მუშაობა ტესტში.
- **Oracle-ის შენიშვნა (არა ბაგი):** R27-TL-ის literal window-max გარდამავალ წყაროზე release-ის გამო არ მუშაობს. B-მ ჩაწეროს sustained ფანჯრები ან release-ის მოდელი.

## 13. დაბლოკილი (server down, 10-12)

R27-K 1440 + Space-on-M · R27-L floating video · R27-TO reset არაცარიელ Redo-ზე · R27-E offline node count live · R27-R: ხაზის Mute de-click, loop seam, library drop · C-R23-01 hydration code points · C-R27-01 ატრიბუცია. როცა server დაბრუნდება: `c-round-27/setup.sh`, ახალი run ფაილებით.

## 14. გადმოტანილი (უცვლელი)

- **C-R23-01** (Medium, 4 NUL, Tech Lead).
- **C-R6-02, C-R8-01** (quiet Chrome).
- **R26-M1** (rAF sampling; ახლა ხაზის მეტრებზეც).
- Master hold tick ≥ +6 dBFS-ზე 1 px (ეტაპი 4). ხაზის hold tick კოდით სრულად ჩანს.
- Demo `Soft impact` full scale (Tech Lead: a/b).
- L3: წაშლილი ხაზის tap.
- **Root** (`root-pre-push-review.md` / `publication-checkpoint.json`):
  - SRW-21 middle-east loader;
  - Lenis `/studio/*`;
  - portable paths;
  - export hard-clip;
  - საბოლოო commit/push და round-6..27-ის uncommitted ხე;
  - `Modal.tsx` focus;
  - GA scroll consent-denied-ზე;
  - 2 უცხო agent ფაილი;
  - A/C-ის წინა deviations;
  - fake Bearer → 500;
  - CDP `Input.dispatchMouseEvent`;
  - publication-checkpoint-ის მოთხოვნები;
  - `Content-Type` charset-ის გარეშე.
- **Tech Lead manual:** სია უცვლელია, დამატებულია **R27-T** (მეტრის წაკითხვადობა; 4 px over cap).
