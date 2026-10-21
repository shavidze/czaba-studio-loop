# C — Round 26 ვერიფიკაცია (SRW-13 ეტაპი 2a: Master-ის ცოცხალი მეტრი, Peak hold, latch-იანი Master Peak/Clip; R26-X; D-29q)

Verifier: C · 2026-10-11 · Store: `C:/Apps/czaba-project/store`, HEAD `c5ed47b` + round-6..26 dirty tree · Dev server: არსებული `http://127.0.0.1:5173` (არ დამიწყია/გამიჩერებია) · Browser: gstack browse, state `c-browse.json`.

## 1. ვერდიქტი

**taskStatus: PASS.** ამ round-ის scope-ში ახალი ბაგი არ არის. A-ს ციფრებს არ ვენდე; ყველა შედეგი ჩემი გაშვებაა.

| ID | შედეგი | მტკიცებულება (`c-round-26/…`) |
|---|---|---|
| R26-ML | **PASS** (3 წყვილი 0/−6 dB + video-only) | `runs/ml-z-1..3.txt`, `ml-m6-1..3.txt`, `ml-video-only.txt` |
| R26-MP | **PASS** | `runs/c0-1..3.txt` (plateaus, holdViolations, afterPauseSync) |
| R26-C0 | **PASS** (3/3) | `runs/c0-1..3.txt` |
| R26-C6 | **PASS** (3/3) | `runs/c6-1..3.txt` |
| R26-CR | **PASS** | `runs/cr-persist.txt`, `cr-reset-paused.txt`, `cr-reset-playing.txt` |
| R26-CM | **PASS** (3/3 B-ის სცენარში) + 1 საინფორმაციო run | `runs/cm-1..3.txt`, `cm-info-loud.txt` |
| R26-RB | **PASS** | `runs/rb-browser.txt`, `runs/vm-1.txt` |
| R26-X | **PASS** | `runs/x-dialog.txt`, `shots/x-muted-dialog.png`, `x-unmuted-dialog.png` |
| R26-E | **PASS** | `runs/export-E0.txt`, `runs/lay11-export.txt` |
| R26-K (1440 + 1280) | **PASS** | `runs/k-1440.txt`, `k-1280.txt` |
| R26-L (1440 + 1280) | **PASS** | `runs/geo-*.txt`, `p2a-1280.txt`, `p2a-1440.txt`, `fv-1440.txt`, `shots/header-*.png`, `fv-1440.png` |
| R26-R | **PASS** | `runs/mv-1.txt`, `mm-1.txt`, `ur-1.txt`, `r-solo-video.txt`, `ml-video-only.txt`, `vm-1.txt`, `r-drops-play.txt` |
| R26-S | **PASS** | `gates/snap-*-start.diff` = `-end.diff`, `gates/r26s-static.txt` |
| R26-U | **PASS** | `runs/r26u-mut-control.txt`, `r26u-mut-a..d.txt/.diff`, `mut.py` |
| R26-Doc | **PASS** | doc 032 (წავიკითხე, კოდს ემთხვევა) |
| G26-1 | **PASS** | `gates/tsc.txt`, `vitest-new.txt`, `vitest-frozen6.txt`, `vitest-all.txt`, `biome-app.txt`, `biome-owned.txt`, `build.txt` |
| G26-2 (start + end) | **PASS** | `gates/head-*`, `git-status-*`, `sha-b25-*`, `protected-*`, `header-diff-*`, `forbidden-status-*`, `owned-sha-*` |
| G26-3 | **PASS** | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| C-R23-01 info record | **არც PASS, არც FAIL** — ღიაა (8 → 4 NUL, offset-ები ისევ გადაიწია) | `runs/c-r23-01-record.txt`, `c-r23-01-hydrated.txt`, `runs/ssr-1..3.html` |

**ამ round-ში არ გაშვებულა** (task §4.10): RF5-3, R3-V1, R3-V4, R11-P3 sync. ისინი round 26-ისთვის PASS არ არის. Video/dock/scheduler/transport/loop კოდი არ შეცვლილა (G26-2), ერთი drift sample R26-RB-შია.

## 2. Harness და setup

- „რეალური click“ = `$B click <selector>` ელემენტის ცენტრზე; key = რეალური `$B press`. Master gain = რეალური ArrowDown/ArrowUp/Home/End ფოკუსირებულ fader-ზე (focus `element.focus()`-ით; Tab-ის რიგი ცალკე რეალური Tab-ით, §8).
- **Synthetic ნაწილები (გულახდილად):** გაზომვის script-ებში Play/Pause `button.click()` JS-იდან (ზომვის სინქრონისთვის); playhead-ის seek `seekTo`-თი (CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს); loop 8–12 `C.rangeOn` + Ctrl+L (round 6 მეთოდი); `rb26.js`-ში (render count, r25 `mrc.js` მეთოდი) Peak reset და Master Mute JS `.click()`-ით.
- **რეალური (`$B click`/`$B press`):** Peak reset ML/C0/C6/CM/CR-ში და anonymous session-ში, Enter/Space Peak-ზე და track M-ზე, Master Mute CM/MM/UR/X-ში, track Mute/Solo, clip-ის არჩევა და nudge, Ctrl+Z/Ctrl+Y, Master fader-ის key-ები, Export/WAV/დახურვა, library-ის Enter.
- **Tap:** round 2-ის master tap + round 22-ის raw-sample worklet (`c-round-22/scripts/sp22.js`), post-master (app-ის master GainNode → destination). App-ის master-ს ახლა ორი output აქვს (destination + splitter); ჩემი tap ისევ master → destination-ზეა.
- **ჩემი browser-API hook (`scripts/h26.js`, source არ შემიცვლია):** `createAnalyser`/`createChannelSplitter`/`connect`-ის ჩაწერა პირველ Play-მდე. გვერდიდან წაკითხული: **2 AnalyserNode, `fftSize` 4096, `sampleRate` 48000** (W = 85.3 ms), `ChannelSplitter(2)`, outputs `[0→analyser 1, 1→analyser 2]`, ყოველი tap connect master-იდან (GainNode, რომელიც destination-ს კვებავს; panner/track არა), **ერთი splitter** ყველა graph-ისთვის.
- **Oracle:** meter-ის level vs tap-ის `max(|L|,|R|)` ფანჯარაში `[t0 − 4096/48000, t1]`. წინასწარ რეგისტრირებული წესები: `c-round-26/checkpoint.md`.
- Setup: `c-round-26/setup.sh` (round 25-ის setup) + `lay11`. **Clip table** (`runs/lay11-export.txt`): video 0–6.008 (`beeps-6s-vp9-opus.webm`), music 0–16 (`სრული მიქსი`), stems 2–18 (`პულსი`), SFX 4–6 (`Soft impact`). Media მხოლოდ `media/`-დან (synthetic beeps), გარეთ არაფერი ატვირთულა.
- გვერდები: (1) 1440/1280 live, keys, geometry; (2) სუფთა 1440 export/R26-X; (3) სუფთა 1440 drops/Play; (4) ახალი anonymous context (G26-3, C-R23-01).
- **rAF gap:** ყველა live run-ში max gap **18.5–28.8 ms** (< 85 ms). არცერთი run არ გამოცხადდა არავალიდურად; ჩანაცვლება 0.

## 3. R26-ML — level მისდევს output-ს

**8–12 წმ (music + stems; video/SFX არა), ფანჯრები pos 8.2–9.2 / 9–10 / 10–11, თითო ფანჯარაში 60 frame:**

| Run | 0 dB: meter max / tap max (dBFS) | −6 dB: meter max / tap max | Δ meter (9–10) |
|---|---|---|---|
| 1 | −1.5/−1.475 · **−1.9/−1.929** · −1.8/−1.758 | −7.5/−7.475 · **−7.9/−7.929** · −7.8/−7.758 | **−6.0** |
| 2 | იგივე | იგივე | **−6.0** |
| 3 | იგივე | იგივე | **−6.0** |

- meter − tap ყველა ფანჯარაში **−0.042…+0.029 dB** (oracle ±1.0) ✓. Δ ზუსტად −6.0 (oracle 6.0 ±0.5) ✓. ყოველ run-ში ახალი graph 1 (მხოლოდ Play).
- **Video-only (music lane რეალურად დადუმებული, 0–2 წმ):** meter beep-ებზე ადის: 0 და 1 წმ-ზე **−5.9** (tap −5.893 / −5.915), შემდეგ ეცემა 20 dB/s-ით (−7.6, −9.6 … −21.6). Beep-ებს შორის tap −70…−674 dB (music ჩუმია). ე.ი. video-ს ხმა graph-იდან meter-ს აღწევს ✓.

## 4. R26-MP — peak hold და floor

- `data-hold-db ≥ data-level-db` ყოველ frame-ზე: **0 დარღვევა** 9 run-ში (C0, C6, ML).
- Hold plateau-ები (C0): **1501, 1501, 1502 ms** (+5.0 dBFS, pos 4.0), და **1500, 1513, 1500 ms** (−1.9, pos 6.0). Oracle 1.5 ±0.2 s ✓. შემდეგ hold level-ს მიჰყვება.
- **Pause:** სინქრონულად, click-ის იმავე task-ში: `data-level-db=-inf`, `data-hold-db=-inf`, cover `scaleX(1)` (ზოლი ცარიელი), hold-ის ხაზი `hidden`. შემდეგი 4 frame-იც იგივე. Peak ტექსტი **უცვლელი** (`+5.0`/`−1.0`) ✓.

## 5. R26-C0 / R26-C6 — latch

| Run | Master | პირველი `over` (pos) | Peak ტექსტი | tap max (L / R) | state Pause-ის შემდეგ | `+` ტექსტი |
|---|---|---|---|---|---|---|
| C0-1 | 0 dB | **2.019** | **+5.0** | +4.995 / +4.995 | over, `+5.0` | — |
| C0-2 | 0 dB | 2.019 | +5.0 | +4.995 | over | — |
| C0-3 | 0 dB | 2.009 | +5.0 | +4.995 | over | — |
| C6-1 | −6.0 dB | არასდროს | **−1.0** | −1.005 | clear | 0 |
| C6-2 | −6.0 dB | არასდროს | −1.0 | −1.005 | clear | 0 |
| C6-3 | −6.0 dB | არასდროს | −1.0 | −1.005 | clear | 0 |

- C0: over 6.5 წმ-მდე ✓; `+5.0` = round 25 export-ის P ±0.5 ✓ და tap max ±0.5 ✓; label: `Master Peak +5.0 dBFS — გადატვირთვა (Clip). გასასუფთავებლად დააჭირე` ✓; Pause-ის შემდეგ რჩება ✓.
- Peak-ის ტექსტის მიმდევრობა (C0-1): `−3.8 → −0.9 → −0.7 → +1.0 (over, 2.019) → +1.1 → +2.2 → +5.0 (4.001)`.
- C6: მთელ დროს `clear`; `−1.0` vs tap −1.005 ✓; `+` არასდროს ✓. −6 dB-ზე readout `−6.0 dB` (12 × რეალური ArrowDown).
- **დაკვირვება B-სთვის:** live latch **~2.0 წმ-ზე** ირთვება (stems-ის შემოსვლა, tap +1.0 dBFS 2–3 წმ-ში), არა მხოლოდ 4–6 წმ-ის overlap-ში. ეს export-თან თანმიმდევრულია (FS 1800 მთელ ფაილზე). R26-T-ის ინსტრუქცია Tech Lead-ისთვის („ანთებს 4–6 s-ში“) უნდა გასწორდეს: „ანთებს ~2 წმ-ზე, +5.0 მაქსიმუმი 4–6 წმ-ში“.

## 6. R26-CR — reset და შენარჩუნება

- **Reset paused (რეალური click):** `+5.0`/over → **`−∞`/clear**, label `Master Peak −∞ dBFS — გასასუფთავებლად დააჭირე`. Undo `Undo: Master Volume` და Redo `Redo: კლიპის ჩაჩოჩება` **უცვლელი** (reset-მა Redo stack-იც არ გაასუფთავა ⇒ history-ს არ ეხება), status ტექსტი უცვლელი, clips უცვლელი (`cr-reset-paused.txt`).
- **შენარჩუნება ერთ run-ში (`cr-persist.txt`, Play 8 → 13.5, latch წინასწარ `+5.0`):** რეალური Master Volume ArrowDown+ArrowUp (8.5), SFX clip-ის **nudge ArrowRight-ით დაკვრისას** (9.4, reschedule), Ctrl+Z (10.4), Ctrl+Y (11.4). Label-ების ცვლილება: **0**, ბოლოს `+5.0`/over. ახალი graph **4** (Play + nudge + Undo + Redo), ახალი tap connect **4**, ყველა **იმავე splitter-ზე** (splitter 1). Master Volume-მა ახალი graph არ შექმნა. მეტრი reschedule-ის შემდეგ ცოცხალია (ბოლო frame level −2.5). Pause/Play-ზე შენარჩუნება C0-ში და K-ში ჩანს.
- **Reset დაკვრისას (`cr-reset-playing.txt`):** click 1.619-ზე (`−0.7`), შემდეგ frame-ზე `−16.4`, შემდეგ `−15.2 … −11.7 → −1.8 → +1.0 (over, 2.011)`. გაზომვა თავიდან იწყება ✓. (`−∞` frame-ზე ნაკლებ ხანს ჩანს: reset სინქრონულად აქვეყნებს, შემდეგი tick უკვე ახალ sample-ს ზომავს.) Undo/Redo უცვლელი.

## 7. R26-CM — Master Mute

**B-ის სცენარი:** reset, Play 1-დან, რეალური Mute 2.0 წმ-მდე, muted 2–6.5 წმ, შემდეგ რეალური unmute.

*წინასწარი რეგისტრაციიდან გადახვევა (გულახდილად):* `checkpoint.md`-ში mute „~3 s-ზე“ ეწერა. C0-მ აჩვენა, რომ 0 dB-ზე latch უკვე 2.02 წმ-ზე ირთვება, ამიტომ „no latch“-ის შესამოწმებლად mute 2.0 წმ-მდე გადავიტანე (B-ის „muted through 2–6 s“-ის ზუსტი წაკითხვა). ეს ცვლილება ტოლერანსს არ ეხება.

| Run | mute (pos) | level click-ზე | (L0+60)/20 | floor-მდე | floor-ის შემდეგ არა-floor frame | tap ≥60 ms-იდან | state | unmute → პირველი აწევა |
|---|---|---|---|---|---|---|---|---|
| 1 | 1.950 | −13.0 | 2.35 s | **2357 ms** | 0 | ციფრული ნული | clear მთელ დროს | 11 ms (−18.3, შემდეგ −2.7) |
| 2 | 1.699 | −8.5 | 2.575 s | **2574 ms** | 0 | ციფრული ნული | clear | 10 ms |
| 3 | 1.731 | −9.1 | 2.545 s | **2540 ms** | 0 | ციფრული ნული | clear | 10 ms |

- floor 3 s-ში ✓, რჩება ✓, latch არ არის, თუმცა unmuted იგივე მონაკვეთი 2.0 წმ-ზე latch-დება (C0) ✓; tap ≤ −60 ✓; unmute-ზე მეტრი ადის ✓.
- **საინფორმაციო run (`cm-info-loud.txt`, არა oracle):** mute 4.325-ზე, level click-ზე **+1.0** → floor **3039 ms** = (1.0+60)/20. **Spec/oracle-ის დაძაბულობა B-სთვის:** release 20 dB/s-ზე floor-ის დრო = (L0+60)/20, ე.ი. „3 წმ-ში“ მხოლოდ L0 ≤ 0 dBFS-ზე სრულდება; +5 dBFS-იდან ≈ 3.25 s. ეს spec-ის ფარგლებშია (release 12–30 dB/s), ბაგი არ არის. Oracle-ი სამომავლოდ უნდა ჩამოყალიბდეს როგორც `(L0+60)/release + ≤ 0.1 s`.

## 8. R26-K — კლავიატურა და a11y (1440 და 1280 ერთნაირი)

- **Tab-ის რიგი** `← CZABA`-დან (რეალური Tab): `Master Mute` → `Master Volume` → **`Master Peak …`** → `Play` → `დასაწყისზე დაბრუნება` → `↶Undo: Master Volume` → `↷Redo: კლიპის ჩაჩოჩება` → `✂ Split`. (Redo ჩანს, რადგან Redo stack ცარიელი არ იყო.)
- **Space Peak-ზე, over-ში (`+5.0`):** Space1 → დაკვრა იწყება (pos 4.618 → 5.408), Space2 → Pause. Peak-ზე **click event 0** (capture listener), ტექსტი/state უცვლელი. **Track `Mute — მუსიკა`-ზე** Space ზუსტად იგივეს აკეთებს: Play/Pause, click 0, `aria-pressed` უცვლელი ✓.
- **Enter Peak-ზე:** click 1, `−∞`/clear ✓.
- Meter `aria-hidden="true"`; accessible name ორივე მდგომარეობაში §2.4-ის ტექსტია (over: `… გადატვირთვა (Clip). გასასუფთავებლად დააჭირე`; clear: `… — გასასუფთავებლად დააჭირე`).

## 9. R26-L — layout

| | 1440×900 | 1280×720 | Reference (r25) |
|---|---|---|---|
| Header | **35** | **35** | 35 |
| Transport | **49** | **87** | 49 / 87 |
| Master ჯგუფი | 708,7 **408.9**×20 | 548,7 408.9×20 | 256.9 → +152 (მხოლოდ სიგანე) |
| Meter / Peak | 80×6 / 56×20 | იგივე | ≥ 64 ✓ |
| Rows (`lay11`) | detail ღია 81×4 scroller **496**; დაკეცილი 81×4 **604** | დაკეცილი 81×4 **386**; ღია **53/61/61/61** **280** | ✓ |
| Floating video (library დაკეცილი, ⤢) | **8,503 272×153**; ✕ → 1268,92 160×90 | — | ✓ |
| Clipping | Peak sw=cw 54 ყველა ტექსტზე (`−∞`, `+5.0`, **`+11.0`**); readout `+6.0 dB`/`−60.0 dB` 64/64; header-ში overflow 0; badge 1 ხაზი; `← CZABA` 1 ხაზი; doc scrollWidth = viewport | იგივე | — |

- ყველაზე გრძელი მიღწევადი ტექსტი: Master +6.0 dB (End) + 4–6 წმ → **`+11.0`** (`+12.3` harness-ით ვერ მიიღწევა; სიმბოლოების რაოდენობა იგივეა).
- ფერები (computed): ზონები მწვანე/ყვითელი/წითელი (9:1:1 = 65.5/7.3/7.3 px), 0 dBFS ნიშნული 1 px `foreground/70`, cover `outline`; over Peak `destructive` ტექსტი/border + `destructive/15` ფონი, font 500; clear `muted`/`outline`.
- 1280 refit: ოთხივე row ერთხელ ~490 ms-ზე transitionend-ის (479/475) შემდეგ (= r24/r25); 1440: 0.
- Screenshot-ები: `shots/header-1440-clear.png`, `header-1440-over.png`, `header-1280-clear.png`, `header-1280-over.png`, `header-1280-plus6-over.png`, `header-1280-minus60.png`, `fv-1440.png`.
- **დაკვირვება (low, ბაგი არ არის):** level ≥ +6 dBFS-ზე hold-ის ხაზი `translateX(100%)`-ით ზოლის კიდეზე გადის და `overflow-hidden`-ის გამო მხოლოდ **1 px** ჩანს (ზოლი ამ დროს სრულად წითელია).

## 10. R26-RB — render budget ბრაუზერში (`runs/rb-browser.txt`)

Fiber type wrapper (round 25 `mrc.js` მეთოდი) **ორივეზე**: `ArrangementMaster` და `ArrangementMasterMeter`.

| მონაკვეთი | ArrangementMaster | ArrangementMasterMeter | შენიშვნა |
|---|---|---|---|
| Play-ის დაწყება (450 ms) | 1 | 1 | `isPlaying` |
| 2 წმ დაკვრა 8–10 (−1.5 dBFS max) | **0** | **0** | 121 frame, 68 სხვადასხვა level — მეტრი wrap-ის შემდეგაც მოძრაობს |
| latch-ის გადასვლა (1.5 → 2.56) | **0** | **1** | `clear → over` |
| latch-ის შემდეგ 1.5 წმ | **0** | **0** | 90 frame; ტექსტი `+1.1 → +5.0` DOM-ით |
| Reset click | **0** | **1** | `−∞`/clear |
| კონტროლი: Master Mute click | 1 | 1 | wrapper-ები მუშაობს |

**ვიდეოს drift sample (`runs/vm-1.txt`, r25 `vm` მეთოდი):** |video.currentTime − pos| max **20.1 ms** (r25: 19.6; ზღვარი +10 ms), mean −13.9 ms; `<video>` არასდროს გაჩერებულა, ყოველთვის muted, 2 ელემენტი; dock counter-ები 0 → 0 ✓.

## 11. R26-X და R26-E

- **R26-X (`runs/x-dialog.txt`):** Master −5.0 dB (10 × ArrowDown) + Mute → dialog-ში მხოლოდ `role=note` `Master დადუმებულია (M) — WAV შეიქმნება 00:18.000 სიგრძის სიჩუმით…`, gain note **არ არის** ✓. Unmute → მხოლოდ `Master: −5.0 dB — ექსპორტში შედის.` ✓.
- **R26-E (`runs/export-E0.txt`, სუფთა გვერდი, ექსპორტამდე Play 0–7 latch-ით `+5.0`):** 864 000 frame (18.000 წმ), NaN 0, header ✓ (5 184 044 B, PCM 2ch 48 kHz 24-bit), FS **1800**, peak 1.0, RMS **−15.481** ✓. Alert: `გადატვირთვა: პიკი +5.0 dBFS — 1800 sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ 5.0 dB-ით…` (= r25). OfflineAudioContext-ზე შექმნილი analyser **0**, splitter **0**. ექსპორტის შემდეგ meter-ის latch უცვლელი (`+5.0`/over). sha256 `c51a0b4e…` (ინფორმაციისთვის; byte-იდენტურობა oracle არ არის).

## 12. R26-R — მეზობელი ქცევა (თითო run)

- **Master Volume −6.0 და უკან (`mv-1.txt`, loop 8–12, same-phase):** −15.416 → **−21.416** (Δ **−6.000**) → −15.416 (Δ 0.000) ✓; ახალი graph 0 (newGraphs 1 = Play) ✓.
- **Master Mute de-click (`mm-1.txt`):** ≤ −60 dBFS **14 ms**-იდან; 60 ms-იდან max ბლოკი **−240** (ციფრული ნული); gain-vs-reference 2 ms: −2.63, −8.95, −14.84, −20.76 … monotone, აწევა > 0.3 dB **0**; spy `1 → 0 τ 0.003`; unmute Δ 0.00, overshoot 0.00; status უცვლელი ✓.
- **Track Mute (`ml-video-only.txt`, `vm-1.txt`):** music lane-ის Mute-ით მუსიკა tap-ზე ჩუმია (beep-ებს შორის −70…−674 dB) ✓. **Solo (`r-solo-video.txt`):** Solo ვიდეოზე 2.3-ზე → beep 3–5 **−9.04**, შუალედები **−87.81** (= r25) ✓.
- **Loop 8–12 wrap (`ur-1.txt`):** music iteration-ები when 0/4/8/12/16/20, dur 4, **seam 0 ms** 5 wrap-ზე, lead **1991.3 ms**; wrap-ის ±50 ms min 5 ms: −34.2 / −34.2 dBFS (wrap 8/12 Mute-ში, −240 მოსალოდნელი) ✓. Master Mute Undo/Redo audio-ს მისდევს (Δ 0.00). *Harness შენიშვნა:* `ur-an.js`-ის `buf > 10` ფილტრი stems-საც (16 s, offset 6) იჭერს; ამიტომ JSON-ის `seamMs`-ში −4000/0 მონაცვლეობს. offset-ით გაყოფილი music სერიის seam ყველა wrap-ზე 0-ია (`C.starts`-ით შემოწმებული).
- **Play 0-დან და stop; library drop (`r-drops-play.txt`, სუფთა გვერდი):** `სრული მიქსი` music-ზე 7-ზე → **ერთი clip** `[music,7,16]`; რეალური Play → pos 1.69, level −16.3; რეალური Pause → `-inf`/`-inf`, Peak `−5.9` რჩება ✓. Console errors: მხოლოდ root `CartContext` `GET /api/cart` (backend არ მუშაობს; ცნობილი, ნებადართული).

## 13. R26-S — diff-ის აუდიტი (`gates/snap-*-start.diff` = `-end.diff`)

- **`graph.client.ts`** (4 hunk): `isOverFullScale`/`MAX_24BIT_SAMPLE` import `./meter`-იდან და ლოკალური literal-ის წაშლა; `tap?: ScheduleAudioNode`; `if (options.tap) master.connect(options.tap)` **უცვლელი** `master.connect(ctx.destination)`-ის შემდეგ; `measureExportOverload` → `isOverFullScale`. Clamp უცვლელია. `renderArrangementWav`-ის `applySchedule` (l.252) tap-ს **არ** გადასცემს. `8388607` literal მხოლოდ `meter.ts`-შია.
- **`ArrangementContext.tsx`:** meter import-ები; `resetMasterPeak` interface/value/deps-ში; `ArrangementMeterContext`; `createMasterMeterTap` (guard + try/catch; splitter(2) + 2 analyser, fft 4096); meter store და 4 ref; `startGraph`-ში `tap`; `stopPlayback`-ში floor frame; `sampleMasterMeter` (fresh-guard, max/OR); `resetMasterPeak` (refs + store); `tick`-ში sampler; `ensureAudioContext`-ში tap ერთხელ; `togglePlayback`-ში `meterFreshFromRef = startAt`; unmount-ზე ref-ების გასუფთავება; provider; `useMasterMeterStore`/`useMasterMeterWriter`. **`scheduleKey` უცვლელია** (`JSON.stringify([arrangement.clips, arrangement.loop])`, l.352). Video/dock/scheduler/loop/transport hunk არ არის. `Arrangement` type-ის ცვლილება არ არის (frozen `types/arrangement.ts` 57 OK-შია).
- **`ArrangementMaster.tsx`:** `ArrangementMasterMeter` (ზოლი, Peak ღილაკი, latch `useSyncExternalStore`, DOM writes subscription-იდან) და მისი ჩასმა readout-ის შემდეგ. Hardcoded ფერი/`style=` JSX-ში **0**; token-ები `bg-positive/80`, `bg-warning/80`, `bg-destructive`, `bg-outline`, `border-foreground/70`, `bg-foreground`, `border-destructive`, `text-destructive`, `text-muted`, `border-outline-hover` — ყველა არსებობს `app/styles/app.css`-ში და ბრაუზერში ფერად იხატება (§9).
- **`ArrangementExportDialog.tsx`:** ერთი პირობა `gainDb !== 0 && !arrangement.master.mute`.
- **Banned:** `getByteTimeDomainData` 0; `limiter|normaliz|compress` arrangement-ის კოდში მხოლოდ არსებული `normalizePeakColumns` (waveform ჩვენება, ამ round-ში არ შეცვლილა); doc 032 ამ სიტყვებს მხოლოდ „scope-ს გარეთაა“ კონტექსტში იყენებს (`gates/r26s-static.txt`).

## 14. R26-U

- **A-ს red-first:** `a-round-26/red-in-store.txt` (meter-ui 10/10 failed; meter.test load fail), `red-scratch.txt` (24/25 failed; 1 მწვანე = regression guard). წავიკითხე; A-ს output-ია. 3 review-ის შემდეგ დამატებული ტესტი snapshot-ზე red-proved არ არის (A-მ ეს გულახდილად თქვა; ჩემმა mutation-ებმა მათგან ორი დაფარა).
- **ჩემი mutation-ები:** `store/app` → `c-round-26/mut/app` (`store/`-ის გარეთ), `node_modules` დროებითი junction-ით, ბოლოს `rmdir`-ით მოხსნილი (store-ის `node_modules` 618 entry, ხელუხლებელი). Config: meter, meter-ui, master, graph. `mut.py`: ზუსტი string replace (count == 1 assert), შემდეგ ფაილის აღდგენა და byte-შედარება (`restored-identical True` ×5).
  - **Control:** 63/63 passed.
  - **(a)** `stepMeter`: `over: state.over || block.over` → `over: block.over` (latch ქრება ჩუმ block-ზე) → **2 failed**: `latches over on any over block…` და `latches over at 1.5, shows +3.5 and keeps it…`.
  - **(b)** `master.connect(options.tap)` წაშლილი და `panner.connect(options.tap)` დამატებული (tap panner-იდან) → **2 failed**: `fans the master out…`, `feeds the tap from the master node and from no track, panner or clip node`.
  - **(c)** `stopPlayback`-იდან floor frame-ის 2 ხაზი წაშლილი → **1 failed**: `Pause writes the floor frame…`.
  - **(d)** `isOverFullScale`: `>` → `>=` → **3 failed**: meter.test-ის 2 და **frozen `master.test.ts`** `does not count a sample exactly at MAX_24BIT_SAMPLE…` (ადასტურებს, რომ პრედიკატი export-თან საერთოა).
- ახალი `it`: 15 + 12 = **27** (ჩემი grep) ≥ 14 ✓.
- A-ს scratch-ში (`a-round-26/scratch/`) `node_modules` junction აღარ არის (`ls`: მხოლოდ `app/` და config-ები).

## 15. Gates

**G26-1** (`gates/g1.sh`, ჩემი გაშვება): `npx tsc --noEmit` exit 0; ახალი 2 ფაილი **27/27**; frozen 6 (render-budget, master-ui, master, graph, ArrangementContext, export-dialog-focus) **101/101** და მათი sha 57 OK-შია; `npx vitest run` **61 ფაილი, 1072/1072** (= 1045 + 27), sfx flake არ განმეორდა; `npx biome check ./app` exit 0, **218 warning + 1 info**, 0 error (= r25); owned 7 ფაილი `No fixes applied`; `npm run build` exit 0.

**G26-2** (`gates/g2.sh start|end`, start = end): HEAD `c5ed47b`; `git status --short` **58** ხაზი = c25-ის 54 + ზუსტად §3.2-ის 4 `??` ხაზი (`git-status-start-vs-c25.txt`), A-ს `git-status.txt`-ის იდენტური; `sha256sum -c b-round-25-tree-sha256.txt` **57 OK**; protected **4/4 OK**; `Header.tsx` HEAD-ის იდენტური, `cc1e531`-თან +21/−0; forbidden paths status ცარიელი; owned sha = A-ს prefix-ები (`ed52f465`, `ff6c7d2e`, `32108f28`, `0de72e4f`, `89bc8e06`, `fcdbd91c`, `afef9745`; doc 032 `b538daab`).

**G26-3** (`$B restart` → ახალი context credentials-ის გარეშე):
- **პირდაპირი `/studio-lab`** (`anon-direct.json`): `auth_user` null, cookie ცარიელი, localStorage მხოლოდ `czaba_session_id`; workspace, Master და meter ჩანს, „Sign in required“ არა; media მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`.
- **Session hook** (`anon-session-hook.json`, fetch/XHR/sendBeacon wrapper) რეალური ქმედებებით: search `soft` → `Soft impact` → Enter (clip), რეალური Play (**მეტრი აქტიური**, level −22.0), რეალური **Peak reset**, **რეალური export** (`WAV შეიქმნა: 00:02.000…`). Workspace-ის fetch 0, XHR 0, beacon 0, **Authorization 0**; ერთადერთი fetch GA `collect` (`en=scroll`, `gcs=G100`; ცნობილი root item). Network log (159 ხაზი): `studio-token`/`recording`/`download`/R2 **0**; hosts: 127.0.0.1:5173, `localhost:5199/api/cart` (pending, ნებადართული), Google fonts, GTM, GA.
- **Header-ის `Studio LabDemo` ბმული** (`/`-დან რეალური click): `/studio-lab`, auth null, Master/meter ჩანს; media მხოლოდ 2 demo MP3; შესაბამისი ერთადერთი ხაზი ნებადართული `GET /app/lib/r2.config.ts`.
- **`/studio/middle-east`** (`anon-studio-me.json`, screenshot): „Sign in required“, workspace/meter არ არის, media 0.
- **`curl`:** anonymous → **401** `Please sign in to access Studio.`; fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (carry).

**Premium auth-ის bypass არ არის.**

## 16. C-R23-01 information record (არც PASS, არც FAIL) — ღიაა

- `curl -s /studio-lab` ×3: **57 605 B**, თითოეულში **4 NUL**, ერთნაირი offset-ები **28013/28014, 44397/44398** (r25: 8 NUL 3536/3537, 11728/11729, 26924/26925, 43308/43309).
- კონტექსტი: 28013 — **ხილული ტექსტი** `Arrangement · \0\0მთლიანი პროექ…`; 44397 — music lane `aria-label="მუსიკა — \0\0აქტიური ხაზის…"`.
- Header-ის badge (`დემო კოლექცია — ავტორიზაცია არ სჭირდება`) და library-ის ტექსტი ახლა SSR-ში სუფთაა — markup-ის ცვლილებამ offset-ები ისევ გადაწია. ეს გამოსწორება **არ არის**; ბაგი იგივეა და შემდეგ ცვლილებაზე ისევ გადაინაცვლებს.
- **Hydration-ის შემდეგ:** ხილულ text node-ებში NUL/U+FFFD **0**; U+FFFD-იანი ატრიბუტი 1: music-ის `aria-label` (31 char, `10db 10e3 10e1 10d8 10d9 10d0 20 2014 20 fffd fffd …`) = r24/r25. Hydration error console-ში არ არის.
- **Master-ის label-ები (SSR და hydration-ის შემდეგ სუფთა):** fieldset `Master`, `Master Mute`, `Master Volume`, `Master Peak −∞ dBFS — გასასუფთავებლად დააჭირე` (`4d 61 73 74 65 72 20 50 65 61 6b 20 2212 221e 20 64 42 46 53 20 2014 20 10d2 10d0 10e1 …`). U+FFFD 0.
- **B-სთვის:** Tech Lead-ის კითხვა (React 19 ან `entry.server.tsx`-ის ვიწრო grant) ისევ ღიაა; ბაგი ყოველ markup ცვლილებაზე გადაინაცვლებს.

## 17. ახალი ბაგები

**ამ round-ის scope-ში არცერთი.**

დაკვირვებები B-სთვის (ბაგი არ არის):
1. **R26-T-ის ინსტრუქცია:** `lay11`-ზე 0 dB-ით Clip **~2.0 წმ-ზე** ანთებს (stems-ის შემოსვლა), +5.0 მაქსიმუმი 4–6 წმ-შია. Tech Lead-ის manual check-ის ტექსტი შესაბამისად უნდა გასწორდეს (§5).
2. **R26-CM oracle:** floor-ის დრო = (L0+60)/20 s; „3 წმ-ში“ მხოლოდ L0 ≤ 0 dBFS-ზე სრულდება (+1.0-დან 3.04 s, +5-დან ≈ 3.25 s). შემდეგ oracle-ებში `(L0+60)/release + ≤0.1 s` (§7).
3. **დემო SFX `Soft impact` თავისთავად full scale-ს აღწევს:** მარტო ამ clip-ზე (Master 0 dB) live Peak `+0.0` Clip ანთებს, export კი `2 sample შეიზღუდა… შეამცირე Master მინიმუმ 0.1 dB-ით`. ეს ერთი პრედიკატის შედეგია და თანმიმდევრულია, მაგრამ დემოს უცვლელი ხმა მომხმარებელს წითელ Clip-ს აჩვენებს. Low/UX; `lib/sfx-*` გაყინულია — B-მ გადაწყვიტოს. Export-ის ციფრები (2 sample, P +0.0, R 0.1) აჩვენებს, რომ SFX-ის პიკი `MAX_24BIT_SAMPLE`-სა და ≈1.005-ს შორისაა, ე.ი. სინთეზი 1.0-ზეა ნორმალიზებული. ორი გზა: დემო მონაცემის ნორმალიზება ≤ `MAX_24BIT_SAMPLE`-მდე (ნებართვით, `lib/sfx-*` გაყინულია), ან პროდუქტის გადაწყვეტილება, რომ float 1.0 (= 0 dBFS) Clip-ად არ ითვლება (Ableton-ის კონვენცია: Clip, როცა 0 dBFS-ს **აღემატება**). მეორე პრედიკატს შეცვლის export-თან ერთად; 24-bit-ში 1.0 მაინც 1 LSB-ით იჭრება.
4. Hold-ის ხაზი ≥ +6 dBFS level-ზე მხოლოდ 1 px ჩანს (§9). Low.
5. A-ს **M1** (rAF-ზე მიბმული sampling: დამალულ tab-ში ან >85 ms stall-ზე over შეიძლება გამოგრჩეს) და **M2c** (unmount-unsubscribe ტესტი არ არის) — B-ს scheduling. ჩემს run-ებში max gap ≤ 28.8 ms.

## 18. Carried (ღია, არ დახურულა)

**ღია C ბაგები:** **C-R23-01** (medium, SSR NUL; ახლა 4 NUL, ერთი ხილულ SSR ტექსტში; Tech Lead: React 19 ან `entry.server.tsx`-ის grant); C-R6-02 და C-R8-01 (Tech Lead, quiet Chrome).

**Root (`root-pre-push-review.md` 10-07, `publication-checkpoint.json` 10-09; round 25-ის შემდეგ არ შეცვლილა):**
- purchased loader-ში middle-east hardcode-ია (SRW-21);
- Lenis `/studio/*`-ზე;
- portable instruction-file paths;
- export hard-clip 0 dBFS-ზე: ხილულია export-ში (R25-EO) და **ახლა ცოცხლადაც** (R26-C0, Clip `+5.0`); clamp რჩება, limiter არ არის;
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ; uncommitted round-6..26 tree (58 ხაზი);
- shared `Modal.tsx`-ის focus gap;
- root GA `scroll` consent-denied-ით (ამ round-შიც `en=scroll` `gcs=G100`);
- ორი foreign agent ფაილი (არ შემხებია);
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, C-ის python probe-ები rounds 21–22;
- fake Bearer → 500 token-ის გარეშე;
- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს (seek synthetic);
- publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, final commit/push);
- `entry.server.tsx`-ის `Content-Type: text/html` charset-ის გარეშე.

**Scheduled:** SRW-13 ეტაპი 2b (track meter-ები), 3 (FB-04 clip gain), 4 (FB-05 pan, fader UX, round-9 M1/L8); LIB-SEP-REASON; lane overlay `/60`; footer-ის ლათინური ტექსტი; group hint-ის `range`; folded clips a11y-ში; SRW-14..20 → SRW-21 → სრული regression → T12.

**Tech Lead manual:** R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, R25-T, Lenis `/studio/*`, MP4/MOV-ის დადებითი import, და **R26-T** (რეალური Chrome + დინამიკები `lay11`-ზე: Clip ~2 წმ-ზე ანთებს 0 dB-ზე და არა −6 dB-ზე; მეტრის მოძრაობის წაკითხვადობა).

## 19. B-სთვის

- Round 26-ის scope დახურულია C-ის მტკიცებულებით. FB-14 (Master Volume, Mute, საბოლოო დონე/გადატვირთვა) Master-ის ნაწილში შეიძლება მოინიშნოს „მზადაა“; SRW-13 ეტაპი 2b–4 დარჩენილია.
- §17-ის 1–2 oracle-ის ტექსტის შესწორებაა; 3 დემო მონაცემის UX გადაწყვეტილებაა.

## 20. ფაილები

- `c-round-26/{b,r,rstart,rwait,setup,cm,cr,k26,p2a,vm,mv,mm,ur,solo,exp}.sh`, `mut.py`, `gates/{g1,g2}.sh`, `checkpoint.md`;
- `scripts/{h26,run26,cm-an,geo26,rb26}.js` და წინა round-ების helper-ები (`c-round-2/setup-base.js`, `c-round-22/sp22.js`, `c-round-11/lay11.js`, `c-round-24/h.js`/`p2a.js`, `c-round-13/fv.js`, `c-round-23/drops.js`, `c-round-25/scripts/{hook,loop812,mv-start,mv-an,mm-an,ur-an,vm-start,vm-an,wav25}.js`);
- `runs/*`, `gates/*`, `shots/*`; `mut/` (scratch copy; junction მოხსნილია).
